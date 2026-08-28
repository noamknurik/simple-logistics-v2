import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Only an org admin can invite a teammate. The invited user's org + role are
 * stashed in their auth user_metadata at invite time; /api/accept-invite
 * reads it back once they set a password and turns it into an org_members row.
 */
export async function POST(request: Request) {
  const { org } = await requireAdmin();

  const body = await request.json();
  const { email, fullName, role } = body as { email?: string; fullName?: string; role?: 'admin' | 'warehouse' };

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      invited_org_id: org.id,
      invited_role: role === 'admin' ? 'admin' : 'warehouse',
      full_name: fullName || null,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/invite`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: data.user?.id });
}
