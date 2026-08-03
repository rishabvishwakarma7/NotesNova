// Server component — exports dynamic so Next.js skips static prerendering.
export const dynamic = 'force-dynamic';

import AdminPanel from './AdminPanel';

export default function AdminPage() {
  return <AdminPanel />;
}
