'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Org, OrgMember } from '@/lib/types';

export function useCurrentMember() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<OrgMember | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      if (cancelled) return;
      setUserEmail(user.email ?? '');

      const { data: memberRow } = await supabase
        .from('org_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!memberRow) {
        router.push('/login?error=no-org');
        return;
      }
      if (cancelled) return;
      setMember(memberRow);

      const { data: orgRow } = await supabase.from('orgs').select('*').eq('id', memberRow.org_id).single();
      if (cancelled) return;
      setOrg(orgRow);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { loading, member, org, userEmail };
}
