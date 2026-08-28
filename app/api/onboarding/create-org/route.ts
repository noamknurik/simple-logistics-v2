import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('org_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'You already belong to an organization.' }, { status: 400 });
  }

  const body = await request.json();
  const { name, logoUrl, primaryColor, showPoweredBy } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Organization name is required.' }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

  const admin = createAdminClient();

  const { data: org, error: orgError } = await admin
    .from('orgs')
    .insert({
      name,
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
      logo_url: logoUrl || null,
      primary_color: primaryColor || '#E31E24',
      show_powered_by: showPoweredBy ?? true,
    })
    .select()
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: orgError?.message ?? 'Could not create organization.' }, { status: 500 });
  }

  const { error: memberError } = await admin.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'admin',
    full_name: user.user_metadata?.full_name ?? null,
    is_active: true,
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orgId: org.id });
}
