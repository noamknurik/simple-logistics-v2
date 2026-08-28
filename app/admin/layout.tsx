import { requireAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { org, member, email } = await requireAdmin();
  return (
    <AdminShell org={org} member={member} userEmail={email}>
      {children}
    </AdminShell>
  );
}
