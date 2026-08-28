-- Simple Logistics — multi-tenant schema
-- Run this once in your Supabase project's SQL editor (or via `supabase db push`).
-- Replaces the old single-tenant "submissions" table (one row per photo) with a
-- proper orders/photos model, scoped to an organization on every table, enforced
-- by Row Level Security — not just by hiding buttons in the UI.

create extension if not exists "pgcrypto";

-- ============================================================================
-- ORGANIZATIONS (tenants)
-- ============================================================================
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text not null default '#E31E24',
  secondary_color text not null default '#1F2937',
  show_powered_by boolean not null default true,
  photo_retention_days integer,  -- null = keep forever (recommended default)
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ORG MEMBERS (users <-> orgs, with a role)
-- auth.users is Supabase's built-in user table. A person's org membership and
-- role live here, NOT in user_metadata — so it can be protected by RLS and
-- can't be forged from the client the way a JWT claim toggle could be.
-- ============================================================================
create type public.org_role as enum ('admin', 'warehouse');

create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'warehouse',
  full_name text,
  employee_id text,
  is_active boolean not null default true,
  notification_prefs jsonb not null default '{"new_order_assigned": true, "daily_summary": false}'::jsonb,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists org_members_user_id_idx on public.org_members(user_id);
create index if not exists org_members_org_id_idx on public.org_members(org_id);

-- ============================================================================
-- ORDERS (one row per shipment — NOT one row per photo)
-- ============================================================================
create type public.order_status as enum ('pending', 'documented', 'shipped');

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  order_number text not null,
  customer_name text,
  reference text,
  ship_to_name text,
  ship_to_address text,
  items jsonb not null default '[]'::jsonb,  -- [{name, sku, qty}]
  status public.order_status not null default 'pending',
  carrier text,
  tracking_number text,
  notes text,
  imported_from text,           -- 'shipstation' | 'csv' | 'manual'
  documented_by uuid references public.org_members(id),
  documented_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, order_number)
);

create index if not exists orders_org_id_idx on public.orders(org_id);
create index if not exists orders_order_number_idx on public.orders(org_id, order_number);
create index if not exists orders_status_idx on public.orders(org_id, status);
create index if not exists orders_created_at_idx on public.orders(org_id, created_at desc);

-- ============================================================================
-- ORDER PHOTOS (child rows — the thing the old schema got wrong)
-- ============================================================================
create type public.photo_type as enum ('full_package', 'box_seal', 'package_contents', 'shipping_label', 'other');

create table if not exists public.order_photos (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  photo_type public.photo_type not null default 'other',
  photo_url text not null,
  uploaded_by uuid references public.org_members(id),
  created_at timestamptz not null default now()
);

create index if not exists order_photos_order_id_idx on public.order_photos(order_id);
create index if not exists order_photos_org_id_idx on public.order_photos(org_id);

-- ============================================================================
-- AUDIT LOG (append-only — no hard deletes disappear silently)
-- ============================================================================
create table if not exists public.order_audit_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  action text not null,           -- 'imported' | 'documentation_started' | 'shipped' | 'deleted' | ...
  actor_id uuid references public.org_members(id),
  details text,
  created_at timestamptz not null default now()
);

create index if not exists order_audit_log_order_id_idx on public.order_audit_log(order_id);

-- ============================================================================
-- ROW LEVEL SECURITY — this is the real access boundary, not the React app
-- ============================================================================
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.orders enable row level security;
alter table public.order_photos enable row level security;
alter table public.order_audit_log enable row level security;

-- Helper: is the current user an active member of a given org?
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.is_active = true
  );
$$;

-- Helper: is the current user an admin of a given org?
create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.is_active = true
      and m.role = 'admin'
  );
$$;

-- orgs: members can read their own org; only admins can update it
create policy "org members can read their org" on public.orgs
  for select using (public.is_org_member(id));
create policy "org admins can update their org" on public.orgs
  for update using (public.is_org_admin(id));

-- org_members: members can see other members of their own org
create policy "members can read their org's members" on public.org_members
  for select using (public.is_org_member(org_id));
create policy "admins can manage members" on public.org_members
  for all using (public.is_org_admin(org_id));

-- orders: any active member can read/write orders in their own org — never another org's
create policy "members can read their org's orders" on public.orders
  for select using (public.is_org_member(org_id));
create policy "members can insert orders in their org" on public.orders
  for insert with check (public.is_org_member(org_id));
create policy "members can update their org's orders" on public.orders
  for update using (public.is_org_member(org_id));
create policy "only admins can delete orders" on public.orders
  for delete using (public.is_org_admin(org_id));

-- order_photos: scoped the same way, and always tied to an org that matches the order
create policy "members can read their org's photos" on public.order_photos
  for select using (public.is_org_member(org_id));
create policy "members can insert photos in their org" on public.order_photos
  for insert with check (public.is_org_member(org_id));
create policy "only admins can delete photos" on public.order_photos
  for delete using (public.is_org_admin(org_id));

-- audit log: readable by org members, insert-only (no update/delete — it's a log)
create policy "members can read their org's audit log" on public.order_audit_log
  for select using (public.is_org_member(org_id));
create policy "members can write audit entries in their org" on public.order_audit_log
  for insert with check (public.is_org_member(org_id));

-- ============================================================================
-- CONVENIENCE VIEW — per-order photo counts, computed in the database instead
-- of the browser pulling every row and counting client-side.
-- ============================================================================
create or replace view public.order_summary as
select
  o.id,
  o.org_id,
  o.order_number,
  o.customer_name,
  o.status,
  o.documented_by,
  o.documented_at,
  o.shipped_at,
  o.created_at,
  count(p.id) as photo_count
from public.orders o
left join public.order_photos p on p.order_id = o.id
group by o.id;

-- ============================================================================
-- STORAGE — photos live in a private bucket, path-scoped to the org:
--   {org_id}/{order_id}/{photo_type}-{timestamp}.jpg
-- Policies check that the first path segment matches an org the user belongs
-- to, so one org's files are never readable by another org's members even
-- though everyone shares the same bucket.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('order-photos', 'order-photos', false)
on conflict (id) do nothing;

create policy "org members can read their org's photos in storage"
  on storage.objects for select
  using (
    bucket_id = 'order-photos'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "org members can upload photos in storage"
  on storage.objects for insert
  with check (
    bucket_id = 'order-photos'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "org admins can delete photos in storage"
  on storage.objects for delete
  using (
    bucket_id = 'order-photos'
    and public.is_org_admin((storage.foldername(name))[1]::uuid)
  );
