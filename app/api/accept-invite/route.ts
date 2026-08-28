import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Called after a newly-invited user sets their password on /invite.
 * Reads the org_id + role that the admin set as user_metadata at invite
 * time, and creates the org_members row (which requires elevated privilege
 * since a user can't insert their own membership under RLS).
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const orgId = user.user_metadata?.invited_org_id;
  const role = user.user_metadata?.invited_role ?? 'warehouse';
  const fullName = user.user_metadata?.full_name ?? null;

  if (!orgId) {
    return NextResponse.json({ error: 'This invite is missing organization info.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('org_members').upsert(
    {
      org_id: orgId,
      user_id: user.id,
      role,
      full_name: fullName,
      is_active: true,
    },
    { onConflict: 'org_id,user_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role });
}
