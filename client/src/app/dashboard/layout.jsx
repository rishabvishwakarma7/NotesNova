'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, FileText, FolderOpen,
  Layers, Settings, Sparkles, ChevronLeft, ChevronRight,
  Menu, Wand2, Youtube, Brain, CalendarDays, Search,
  RefreshCw, FileQuestion, BarChart3, BookOpen, X,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchModal from '@/components/ui/SearchModal';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import MobileNav from '@/components/ui/MobileNav';
import { useUserSync } from '@/hooks/useUserSync';

/* ── Navigation groups ── */
const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: Home,      label: 'Dashboard',    href: '/dashboard' },
      { icon: BarChart3, label: 'Analytics',    href: '/dashboard/analytics' },
    ],
  },
  {
    label: 'Learn & Create',
    items: [
      { icon: MessageSquare, label: 'AI Tutor',       href: '/dashboard/chat' },
      { icon: Wand2,         label: 'Generate Notes', href: '/dashboard/generate' },
      { icon: Youtube,       label: 'Video Notes',    href: '/dashboard/video-notes' },
      { icon: FileText,      label: 'My Notes',       href: '/dashboard/notes' },
      { icon: FolderOpen,    label: 'Subjects',       href: '/dashboard/subjects' },
    ],
  },
  {
    label: 'Practice & Test',
    items: [
      { icon: Brain,        label: 'AI Quiz',         href: '/dashboard/quiz' },
      { icon: Layers,       label: 'Flashcards',      href: '/dashboard/flashcards' },
      { icon: FileQuestion, label: 'PYQ Analyzer',    href: '/dashboard/pyq' },
    ],
  },
  {
    label: 'Plan & Revise',
    items: [
      { icon: CalendarDays, label: 'Study Planner',   href: '/dashboard/planner' },
      { icon: RefreshCw,    label: 'Revision Tracker',href: '/dashboard/revision' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ],
  },
];

/* ── flat list for mobile ── */
const allNavItems = navGroups.flatMap(g => g.items);

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const pathname = usePathname();

  useUserSync();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault(); setSearchOpen(p => !p);
    }
    if (e.key === 'Escape') { setMobileOpen(false); setSearchOpen(false); }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* ── Sidebar content (shared desktop + mobile drawer) ── */
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
      padding: collapsed && !isMobile ? '16px 8px' : '16px 12px', overflowY: 'auto', overflowX: 'hidden' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        gap: 10, marginBottom: 20, padding: '4px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            <Sparkles size={15} color="white" />
          </div>
          {(!collapsed || isMobile) && (
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Note<span className="gradient-text">Nova</span>
            </span>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      <button onClick={() => setSearchOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed && !isMobile ? '10px' : '9px 12px',
          borderRadius: 10, background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)', cursor: 'pointer',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          marginBottom: 20, transition: 'all 0.15s', width: '100%' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
        title={collapsed && !isMobile ? 'Search (Ctrl+K)' : undefined}>
        <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        {(!collapsed || isMobile) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search...</span>
            <kbd style={{ fontSize: 10, color: 'var(--text-muted)', padding: '1px 5px', borderRadius: 4,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>⌘K</kbd>
          </div>
        )}
      </button>

      {/* Nav groups */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 8 }}>
            {(!collapsed || isMobile) && (
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '4px 12px', marginBottom: 2 }}>{group.label}</p>
            )}
            {group.items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    padding: collapsed && !isMobile ? '10px' : '8px 12px',
                    marginBottom: 1 }}
                  title={collapsed && !isMobile ? item.label : undefined}>
                  <item.icon size={17} style={{ flexShrink: 0 }} />
                  {(!collapsed || isMobile) && (
                    <span style={{ fontSize: 13.5 }}>{item.label}</span>
                  )}
                </Link>
              );
            })}
            {gi < navGroups.length - 1 && (!collapsed || isMobile) && (
              <div style={{ height: 1, background: 'var(--border-color)', margin: '6px 12px 0' }} />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom: user + theme */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 4,
        display: 'flex', alignItems: 'center',
        gap: 10, justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        flexDirection: collapsed && !isMobile ? 'column' : 'row' }}>
        <UserButton afterSignOutUrl="/" />
        {(!collapsed || isMobile) && <ThemeToggle />}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 72 : 256,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          transition: 'width 0.25s ease',
          position: 'relative', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          <SidebarContent />
          {/* Collapse toggle */}
          <button onClick={() => setCollapsed(c => !c)}
            style={{ position: 'absolute', top: 24, right: -12,
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10,
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </aside>
      )}

      {/* ── MOBILE FIXED HEADER ── */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56,
          background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 40 }}>
          <button onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
            Note<span className="gradient-text">Nova</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setSearchOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <Search size={20} />
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      )}

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 45 }} />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 272, background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)', zIndex: 50 }}>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflow: 'auto',
        paddingTop: isMobile ? 56 : 0,
        paddingBottom: isMobile ? 60 : 0,
        display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <FeedbackWidget />
      {/* Mobile bottom nav — only on mobile, not on chat page (needs full height) */}
      {isMobile && !pathname.startsWith('/dashboard/chat') && <MobileNav />}
    </div>
  );
}
