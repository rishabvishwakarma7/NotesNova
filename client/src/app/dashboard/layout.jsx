// Server component — exports route segment config so Next.js treats all
// dashboard routes as dynamic (prevents Clerk prerender errors).
export const dynamic = 'force-dynamic';

import DashboardShell from './DashboardShell';

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
