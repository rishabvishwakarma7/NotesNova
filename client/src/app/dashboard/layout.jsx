'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, FileText, FolderOpen, BookOpen,
  Layers, Settings, Sparkles, ChevronLeft, Menu, Wand2, Youtube,
  Brain, CalendarDays, Search,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchModal from '@/components/ui/SearchModal';
import { useUserSync } from '@/hooks/useUserSync';

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: MessageSquare, label: 'AI Chat', href: '/dashboard/chat' },
  { icon: Wand2, label: 'Generate Notes', href: '/dashboard/generate' },
  { icon: Youtube, label: 'Video Notes', href: '/dashboard/video-notes' },
  { icon: Brain, label: 'AI Quiz', href: '/dashboard/quiz' },
  { icon: CalendarDays, label: 'Study Planner', href: '/dashboard/planner' },
  { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
  { icon: FolderOpen, label: 'Subjects', href: '/dashboard/subjects' },
  { icon: Layers, label: 'Flashcards', href: '/dashboard/flashcards' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Sync Clerk user to MongoDB on dashboard visit
  useUserSync();

  // Ctrl+K keyboard shortcut for search
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: collapsed ? '20px 8px' : '20px 16px',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 8px', marginBottom: 32,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={16} color="white" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Note<span className="gradient-text">Nova</span>
          </span>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={() => setSearchOpen(true)}
        className="sidebar-link"
        style={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '12px' : '10px 16px',
          marginBottom: 8,
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-color)',
        }}
        title={collapsed ? 'Search (Ctrl+K)' : undefined}
      >
        <Search size={20} />
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
            <span>Search</span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
              padding: '2px 6px', borderRadius: 4,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            }}>
              Ctrl+K
            </span>
          </div>
        )}
      </button>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '10px 16px',
              }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 12, paddingTop: 16,
        borderTop: '1px solid var(--border-color)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexDirection: collapsed ? 'column' : 'row',
      }}>
        <UserButton afterSignOutUrl="/" />
        {!collapsed && <ThemeToggle />}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          width: collapsed ? 72 : 260,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          transition: 'width 0.3s ease',
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', top: 28, right: -14,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
            zIndex: 10,
          }}
        >
          <ChevronLeft size={14} style={{
            transform: collapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
          }} />
        </button>
      </aside>

      {/* Mobile header */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 56, background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 40,
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
          Note<span className="gradient-text">Nova</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <Search size={20} />
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 45,
              }}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 260, background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                zIndex: 50,
              }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Spacer to push content below fixed mobile header */}
        <div className="sidebar-desktop" style={{ display: 'none' }} />
        <style>{`.mobile-spacer { height: 56px; display: block; } @media(min-width: 769px){ .mobile-spacer { display: none; } }`}</style>
        <div className="mobile-spacer" />
        {children}
      </main>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
