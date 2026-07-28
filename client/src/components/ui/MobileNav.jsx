'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Brain, FileText, BarChart3 } from 'lucide-react';

const NAV = [
  { icon: Home,          label: 'Home',      href: '/dashboard' },
  { icon: MessageSquare, label: 'AI Tutor',  href: '/dashboard/chat' },
  { icon: Brain,         label: 'Quiz',      href: '/dashboard/quiz' },
  { icon: FileText,      label: 'Notes',     href: '/dashboard/notes' },
  { icon: BarChart3,     label: 'Progress',  href: '/dashboard/analytics' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 60, background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center',
      zIndex: 39, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(item => {
        const isActive = pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, padding: '6px 0',
              color: isActive ? 'var(--color-primary-light)' : 'var(--text-muted)',
              transition: 'color 0.15s' }}>
              <div style={{ width: 36, height: 28, borderRadius: 10,
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s' }}>
                <item.icon size={18} />
              </div>
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500,
                letterSpacing: isActive ? '0.01em' : 0 }}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
