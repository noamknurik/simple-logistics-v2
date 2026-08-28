import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Org, OrgMember } from '@/lib/types';

export interface CurrentUser {
  userId: string;
  email: string;
  member: OrgMember;
  org: Org;
}

/**
 * Resolves the signed-in user's org membership + org record.
 * Redirects to /login if there's no session, or to a "no org" state
 * if the user isn't (yet) a member of any org.
 */
export async function requireUser(): Promise<CurrentUser> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: member } = await supabase
    .from('org_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!member) {
    redirect('/login?error=no-org');
  }

  const { data: org } = await supabase.from('orgs').select('*').eq('id', member.org_id).single();

  if (!org) {
    redirect('/login?error=no-org');
  }

  return { userId: user.id, email: user.email ?? '', member, org };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const current = await requireUser();
  if (current.member.role !== 'admin') {
    redirect('/find-order');
  }
  return current;
}
