'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, FileText, FolderOpen, Layers, Settings,
  Sparkles, ChevronLeft, ChevronRight, Menu, Wand2, Youtube,
  Brain, CalendarDays, Search, RefreshCw, FileQuestion, BarChart3,
  X, Timer, Trash2, Plus, BookOpen, Bell, Palette, User,
  ChevronDown, Map, BookMarked, TrendingUp, Crown,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchModal from '@/components/ui/SearchModal';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import MobileNav from '@/components/ui/MobileNav';
import { useUserSync } from '@/hooks/useUserSync';
import { useAuthApi } from '@/hooks/useAuthApi';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: Home,      label: 'Dashboard',     href: '/dashboard' },
      { icon: Map,       label: 'Study Journey',  href: '/dashboard/journey', badge: { text: 'NEW', color: '#10B981' } },
    ],
  },
  {
    label: 'Premium',
    items: [
      { icon: Crown,   label: 'Focus Mode',     href: '/dashboard/focus',   badge: { text: 'PRO', color: '#F59E0B' } },
      { icon: Sparkles,label: 'Get Premium',    href: '/dashboard/premium' },
    ],
  },
  {
    label: 'Learning',
    items: [
      { icon: FolderOpen,    label: 'Subjects',       href: '/dashboard/subjects' },
      { icon: CalendarDays,  label: 'Study Planner',  href: '/dashboard/planner' },
      { icon: Timer,         label: 'Focus Mode',     href: '/dashboard/pomodoro' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { icon: MessageSquare, label: 'AI Tutor',        href: '/dashboard/chat' },
      { icon: Sparkles,      label: 'Creative Notes',  href: '/dashboard/creative-notes', badge: { text: 'NEW', color: '#8B5CF6' } },
      { icon: Wand2,         label: 'Smart Notes',     href: '/dashboard/generate' },
      { icon: Youtube,       label: 'YouTube Notes',   href: '/dashboard/video-notes' },
      { icon: FileQuestion,  label: 'PYQ Analyzer',   href: '/dashboard/pyq', badge: { text: 'AI', color: '#F43F5E' } },
    ],
  },
  {
    label: 'Practice',
    items: [
      { icon: Brain,      label: 'AI Quiz',          href: '/dashboard/quiz' },
      { icon: Layers,     label: 'Flashcards',       href: '/dashboard/flashcards' },
      { icon: RefreshCw,  label: 'Revision',         href: '/dashboard/revision' },
      { icon: BookMarked, label: 'Mistake Notebook', href: '/dashboard/mistakes' },
    ],
  },
  {
    label: 'Library',
    items: [
      { icon: FileText,   label: 'My Notes',         href: '/dashboard/notes' },
      { icon: BarChart3,  label: 'Analytics',        href: '/dashboard/analytics' },
      { icon: TrendingUp, label: 'Weekly Report',    href: '/dashboard/weekly-report' },
      { icon: Trash2,     label: 'Trash',            href: '/dashboard/trash' },
      { icon: Settings,   label: 'Settings',         href: '/dashboard/settings' },
    ],
  },
];

const CREATE_OPTIONS = [
  { icon: Map,        label: 'Study Journey',    href: '/dashboard/journey',        color: '#10B981' },
  { icon: Sparkles,   label: 'Creative Notes',   href: '/dashboard/creative-notes', color: '#8B5CF6' },
  { icon: Wand2,      label: 'Smart Notes',      href: '/dashboard/generate',       color: '#6366F1' },
  { icon: Brain,      label: 'Create Quiz',      href: '/dashboard/quiz',           color: '#06B6D4' },
  { icon: Layers,     label: 'Create Flashcards',href: '/dashboard/flashcards',     color: '#10B981' },
  { icon: Youtube,    label: 'YouTube Video',    href: '/dashboard/video-notes',    color: '#EF4444' },
];

/* ── Quick Capture FAB ── */
function QuickCaptureFab() {
  const [open, setOpen] = useState(false);
  const fabOptions = [
    { icon: Wand2,        label: 'Generate Notes', href: '/dashboard/generate',    color: '#8B5CF6' },
    { icon: MessageSquare,label: 'Ask AI',          href: '/dashboard/chat',        color: '#6366F1' },
    { icon: Brain,        label: 'Create Quiz',    href: '/dashboard/quiz',        color: '#06B6D4' },
    { icon: FolderOpen,   label: 'Add Subject',    href: '/dashboard/subjects',    color: '#F59E0B' },
    { icon: RefreshCw,    label: 'Add Revision',   href: '/dashboard/revision',    color: '#10B981' },
    { icon: Map,          label: 'Study Journey',  href: '/dashboard/journey',     color: '#EC4899' },
  ];

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:35, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
      <AnimatePresence>
        {open && fabOptions.map((opt, i) => (
          <motion.div key={opt.href}
            initial={{ opacity:0, y:10, scale:0.85 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:10, scale:0.85 }}
            transition={{ delay: (fabOptions.length - 1 - i) * 0.04, duration:0.18 }}>
            <Link href={opt.href} onClick={() => setOpen(false)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px 9px 12px',
                borderRadius:24, background:'var(--bg-card)', border:'1px solid var(--border-color)',
                textDecoration:'none', boxShadow:'var(--shadow-md)', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${opt.color}50`; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
              <div style={{ width:28, height:28, borderRadius:8, background:`${opt.color}15`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <opt.icon size={14} color={opt.color} />
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{opt.label}</span>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}
        onClick={() => setOpen(o => !o)}
        style={{ width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
          background:'var(--gradient-primary)', color:'white',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(99,102,241,0.45)',
          transition:'all 0.2s' }}>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration:0.2 }}>
          <Plus size={22} />
        </motion.div>
      </motion.button>
    </div>
  );
}

export default function DashboardShell({ children }) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);
  const pathname = usePathname();
  const createRef = useRef(null);
  const profileRef = useRef(null);

  let clerkUser = null;
  try { const u = useUser(); clerkUser = u.user; } catch {}

  useUserSync();
  useAuthApi();

  // Silently ping the backend on first load so Railway wakes up from cold start
  // before the user tries to generate notes or use AI features
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${base.replace('/api', '')}/api/health`, { method: 'GET' }).catch(() => {});
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p); }
    if (e.key === 'Escape') { setMobileOpen(false); setSearchOpen(false); setCreateOpen(false); setProfileOpen(false); }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isCollapsed = collapsed && !isMobile;

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%',
      padding: isCollapsed ? '16px 8px' : '16px 14px',
      overflowY:'auto', overflowX:'hidden', gap:0 }}>

      {/* ── BRAND ── */}
      <div style={{ display:'flex', alignItems:'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom:20, paddingBottom:14,
        borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, flexShrink:0,
            background:'var(--gradient-primary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 16px rgba(99,102,241,0.35), 0 4px 12px rgba(99,102,241,0.25)' }}>
            <Sparkles size={16} color="white" />
          </div>
          {!isCollapsed && (
            <div>
              <span style={{ fontSize:16, fontWeight:800, color:'var(--text-primary)', display:'block', lineHeight:1.1 }}>
                Note<span className="gradient-text">Nova</span>
              </span>
              <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500 }}>
                Learn smarter, achieve more
              </span>
            </div>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── SEARCH ── */}
      <button onClick={() => setSearchOpen(true)} aria-label="Search (Ctrl+K)"
        style={{ display:'flex', alignItems:'center', gap:8,
          padding: isCollapsed ? '10px' : '9px 12px',
          borderRadius:11, background:'rgba(99,102,241,0.06)',
          border:'1px solid rgba(99,102,241,0.12)', cursor:'pointer',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          marginBottom:10, transition:'all 0.2s', width:'100%' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.12)'; e.currentTarget.style.boxShadow='none'; }}
        title={isCollapsed ? 'Search (Ctrl+K)' : undefined}>
        <Search size={14} color="var(--color-primary-light)" style={{ flexShrink:0 }} />
        {!isCollapsed && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flex:1 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Search notes, quizzes…</span>
            <kbd style={{ fontSize:9, color:'var(--text-muted)', padding:'1px 5px', borderRadius:4,
              background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>⌘K</kbd>
          </div>
        )}
      </button>

      {/* ── QUICK CREATE ── */}
      {!isCollapsed && (
        <div ref={createRef} style={{ position:'relative', marginBottom:16 }}>
          <button onClick={() => setCreateOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 14px',
              borderRadius:11, border:'none', cursor:'pointer', width:'100%', fontSize:13, fontWeight:700,
              background:'var(--gradient-primary)', color:'white', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(99,102,241,0.3)', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 6px 20px rgba(99,102,241,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 14px rgba(99,102,241,0.3)'}>
            <Plus size={15} /> Create New
            <ChevronDown size={13} style={{ marginLeft:'auto', opacity:0.8, transform: createOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
          </button>
          <AnimatePresence>
            {createOpen && (
              <motion.div initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-6, scale:0.97 }} transition={{ duration:0.15 }}
                style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                  background:'var(--bg-card)', border:'1px solid var(--border-color)',
                  borderRadius:12, padding:6, zIndex:30, boxShadow:'var(--shadow-lg)' }}>
                {CREATE_OPTIONS.map(opt => (
                  <Link key={opt.href} href={opt.href} onClick={() => setCreateOpen(false)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 11px',
                      borderRadius:9, textDecoration:'none', transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ width:28, height:28, borderRadius:8, background:`${opt.color}15`,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <opt.icon size={13} color={opt.color} />
                    </div>
                    <span style={{ fontSize:13, color:'#C4CAD9', fontWeight:500 }}>{opt.label}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── NAV GROUPS ── */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }} role="navigation" aria-label="Main navigation">
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom:6 }}>
            {!isCollapsed && (
              <p style={{ fontSize:10, fontWeight:700, color:'#7B84A3',
                textTransform:'uppercase', letterSpacing:'0.09em',
                padding:'2px 12px 4px', marginBottom:1 }}>{group.label}</p>
            )}
            {group.items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <motion.div key={item.href} whileHover={ isCollapsed ? {} : { x:2 }} transition={{ duration:0.12 }}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)}
                    aria-label={item.label} aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    style={{ display:'flex', alignItems:'center', gap:9,
                      padding: isCollapsed ? '10px' : '8px 12px',
                      borderRadius:10, textDecoration:'none', marginBottom:1,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      position:'relative', transition:'all 0.15s',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.10))'
                        : 'transparent',
                      color: isActive ? 'var(--color-primary-light)' : '#C4CAD9',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) { e.currentTarget.style.background='rgba(99,102,241,0.07)'; e.currentTarget.style.color='#F0F4FF'; }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#C4CAD9'; }
                    }}>
                    {/* Active left accent */}
                    {isActive && (
                      <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3,
                        borderRadius:'0 3px 3px 0', background:'var(--gradient-primary)' }} />
                    )}
                    <item.icon size={16} style={{ flexShrink:0,
                      color: isActive ? 'var(--color-primary-light)' : 'inherit',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' : 'none' }} />
                    {!isCollapsed && (
                      <>
                        <span style={{ fontSize:13.5, fontWeight: isActive ? 600 : 500, flex:1 }}>{item.label}</span>
                        {item.badge && (
                          <span style={{ fontSize:9, fontWeight:800, color:'white',
                            background: item.badge.color, padding:'1px 6px',
                            borderRadius:10, textTransform:'uppercase' }}>{item.badge.text}</span>
                        )}
                      </>
                    )}
                  </Link>
                </motion.div>
              );
            })}
            {gi < navGroups.length - 1 && !isCollapsed && (
              <div style={{ height:1, background:'rgba(99,102,241,0.08)', margin:'4px 10px 4px' }} />
            )}
          </div>
        ))}
      </nav>

      {/* ── PROFILE SECTION ── */}
      <div ref={profileRef} style={{ borderTop:'1px solid var(--border-color)', paddingTop:12, marginTop:4, position:'relative' }}>
        {isCollapsed ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <UserButton afterSignOutUrl="/" />
            <ThemeToggle />
          </div>
        ) : (
          <>
            <button onClick={() => setProfileOpen(o => !o)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
                borderRadius:12, background:'transparent', border:'none', cursor:'pointer',
                width:'100%', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <UserButton afterSignOutUrl="/" />
              <div style={{ flex:1, textAlign:'left', minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {clerkUser?.firstName || clerkUser?.fullName || 'Student'}
                </p>
                <p style={{ fontSize:10, color:'var(--text-muted)' }}>NoteNova Student</p>
              </div>
              <ThemeToggle />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:6, scale:0.97 }} transition={{ duration:0.15 }}
                  style={{ position:'absolute', bottom:'calc(100% + 6px)', left:0, right:0,
                    background:'var(--bg-card)', border:'1px solid var(--border-color)',
                    borderRadius:14, padding:8, zIndex:30, boxShadow:'var(--shadow-lg)' }}>
                  {[
                    { icon:User,     label:'Profile',      action:() => {} },
                    { icon:Settings, label:'Settings',     href:'/dashboard/settings' },
                    { icon:Palette,  label:'Appearance',   action:() => {} },
                    { icon:Bell,     label:'Notifications',action:() => {} },
                  ].map((item, i) => (
                    item.href ? (
                      <Link key={i} href={item.href} onClick={() => setProfileOpen(false)}
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                          borderRadius:9, textDecoration:'none', color:'var(--text-secondary)',
                          fontSize:13, fontWeight:500, transition:'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <item.icon size={14} /> {item.label}
                      </Link>
                    ) : (
                      <button key={i} onClick={item.action}
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                          borderRadius:9, background:'transparent', border:'none', cursor:'pointer',
                          width:'100%', color:'var(--text-secondary)', fontSize:13, fontWeight:500,
                          transition:'background 0.12s', textAlign:'left' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <item.icon size={14} /> {item.label}
                      </button>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)' }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside aria-label="Main sidebar"
          style={{ width: collapsed ? 72 : 266,
            background:'var(--bg-secondary)',
            borderRight:'1px solid var(--border-color)',
            transition:'width 0.25s ease',
            position:'relative', flexShrink:0,
            display:'flex', flexDirection:'column' }}>
          <SidebarContent />
          <button onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ position:'absolute', top:24, right:-12, width:24, height:24, borderRadius:'50%',
              background:'var(--bg-card)', border:'1px solid var(--border-color)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'var(--text-muted)', zIndex:10,
              boxShadow:'var(--shadow-sm)', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-color)'; e.currentTarget.style.color='var(--text-muted)'; }}>
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </aside>
      )}

      {/* Mobile header */}
      {isMobile && (
        <div style={{ position:'fixed', top:0, left:0, right:0, height:56,
          background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 16px', zIndex:40 }}>
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)', padding:4 }}>
            <Menu size={22} />
          </button>
          <span style={{ fontWeight:800, fontSize:15, color:'var(--text-primary)' }}>
            Note<span className="gradient-text">Nova</span>
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}>
              <Search size={20} />
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:45 }} />
            <motion.div initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:'spring', damping:28, stiffness:260 }}
              style={{ position:'fixed', top:0, left:0, bottom:0, width:280,
                background:'var(--bg-secondary)', borderRight:'1px solid var(--border-color)', zIndex:50 }}>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main style={{ flex:1, overflow:'auto',
        paddingTop: isMobile ? 56 : 0,
        paddingBottom: isMobile ? 60 : 0,
        display:'flex', flexDirection:'column' }}>
        {children}
      </main>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <FeedbackWidget />
      {isMobile && !pathname.startsWith('/dashboard/chat') && <MobileNav />}

      {/* ── QUICK CAPTURE FAB ── */}
      {!isMobile && (
        <QuickCaptureFab />
      )}
    </div>
  );
}
