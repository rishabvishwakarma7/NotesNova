'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, Wand2, Layers, Brain, CalendarDays,
  Youtube, Flame, Target, BookOpen, RefreshCw, FileQuestion,
  BarChart3, AlertCircle, Sparkles, ChevronRight, Clock,
  ArrowRight, TrendingUp, CheckCircle2, Play,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useUser } from '@clerk/nextjs';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMotivation(streak) {
  if (streak >= 30) return "30+ day streak — you're unstoppable! 🏆";
  if (streak >= 7)  return `${streak}-day streak — keep the momentum! 🔥`;
  if (streak >= 3)  return `${streak}-day streak — great consistency! ✨`;
  if (streak === 1) return "Great, you're back! Let's keep going.";
  return "Ready to start your learning journey?";
}

export default function DashboardHome() {
  const { user } = useUser();
  const [stats,    setStats]    = useState(null);
  const [revStats, setRevStats] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [now,      setNow]      = useState(new Date());

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats').catch(() => ({ data: null })),
      api.get('/revision/stats').catch(() => ({ data: null })),
    ]).then(([s, r]) => {
      setStats(s.data);
      setRevStats(r.data);
    }).finally(() => setLoading(false));
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const firstName  = user?.firstName || user?.fullName?.split(' ')[0] || 'Student';
  const streak     = stats?.streak      ?? 0;
  const avgScore   = stats?.quizAvgScore ?? 0;
  const totalNotes = stats?.totalNotes   ?? 0;
  const dueTopics  = revStats?.due  ?? 0;
  const weakTopics = revStats?.weak ?? 0;
  const mastered   = revStats?.mastered ?? 0;

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Derive the single most important next action
  const getNextAction = () => {
    if (dueTopics > 0)
      return { label: 'Revise Due Topics', desc: `${dueTopics} topic${dueTopics > 1 ? 's' : ''} are scheduled for revision today`, href: '/dashboard/revision', color: '#F59E0B', icon: RefreshCw, urgency: 'high' };
    if (weakTopics > 0)
      return { label: 'Practice Weak Areas', desc: `${weakTopics} topic${weakTopics > 1 ? 's' : ''} need more practice`, href: '/dashboard/revision?filter=weak', color: '#F43F5E', icon: AlertCircle, urgency: 'medium' };
    if (stats?.activePlan)
      return { label: 'Continue Study Plan', desc: `${stats.activePlan.title} — ${stats.activePlan.progress}% complete`, href: '/dashboard/planner', color: '#6366F1', icon: CalendarDays, urgency: 'low' };
    if (totalNotes === 0)
      return { label: 'Generate Your First Notes', desc: 'Build your knowledge library with AI-powered notes', href: '/dashboard/generate', color: '#8B5CF6', icon: Wand2, urgency: 'low' };
    return { label: 'Take a Quick Quiz', desc: 'Test your knowledge and discover weak areas', href: '/dashboard/quiz', color: '#06B6D4', icon: Brain, urgency: 'low' };
  };
  const nextAction = getNextAction();

  const maxActivity = stats?.weeklyActivity ? Math.max(...stats.weeklyActivity.map(d => d.total), 1) : 1;

  // Primary tools (most used)
  const primaryTools = [
    { icon: MessageSquare, label: 'AI Tutor',       desc: 'Ask anything, learn instantly',    href: '/dashboard/chat',        color: '#6366F1' },
    { icon: Wand2,         label: 'Generate Notes', desc: 'AI-powered study notes',            href: '/dashboard/generate',    color: '#8B5CF6' },
    { icon: Brain,         label: 'AI Quiz',        desc: 'Test your knowledge',               href: '/dashboard/quiz',        color: '#06B6D4' },
    { icon: RefreshCw,     label: 'Revision',       desc: dueTopics > 0 ? `${dueTopics} due today` : 'Smart spaced repetition', href: '/dashboard/revision', color: '#F59E0B' },
  ];

  // Secondary tools
  const secondaryTools = [
    { icon: Layers,       label: 'Flashcards',   href: '/dashboard/flashcards',  color: '#10B981' },
    { icon: FileQuestion, label: 'PYQ Analyzer', href: '/dashboard/pyq',         color: '#F43F5E' },
    { icon: Youtube,      label: 'Video Notes',  href: '/dashboard/video-notes', color: '#EF4444' },
    { icon: CalendarDays, label: 'Planner',      href: '/dashboard/planner',     color: '#EC4899' },
    { icon: BarChart3,    label: 'Analytics',    href: '/dashboard/analytics',   color: '#14B8A6' },
    { icon: FileText,     label: 'My Notes',     href: '/dashboard/notes',       color: '#6366F1' },
  ];

  return (
    <div style={{ padding:'20px 16px', maxWidth:1100, margin:'0 auto', overflowX:'hidden' }}>

      {/* ── GREETING ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-primary-light)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            {getGreeting()}, {firstName} 👋
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {getMotivation(streak)}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{timeStr}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</p>
        </div>
      </motion.div>

      {/* ── NEXT BEST ACTION (hero card) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ marginBottom: 20 }}>
        <Link href={nextAction.href} style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '20px 24px', borderRadius: 18,
            background: `linear-gradient(135deg, ${nextAction.color}18, ${nextAction.color}08)`,
            border: `1px solid ${nextAction.color}35`,
            display: 'flex', alignItems: 'center', gap: 18,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${nextAction.color}60`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${nextAction.color}35`; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: 52, height: 52, borderRadius: 14,
              background: `${nextAction.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <nextAction.icon size={24} color={nextAction.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: nextAction.color,
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🎯 Next Best Action
                </span>
                {nextAction.urgency === 'high' && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#F43F5E',
                    background: 'rgba(244,63,94,0.12)', padding: '1px 7px', borderRadius: 10 }}>Urgent</span>
                )}
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {nextAction.label}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{nextAction.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: nextAction.color }}>Start now</span>
              <ArrowRight size={16} color={nextAction.color} />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── STATS ROW ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <style>{`
          .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
          .main-grid { display:grid; grid-template-columns:1fr 300px; gap:14px; margin-bottom:16px; }
          .tools-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
          .secondary-tools { display:flex; gap:8px; flex-wrap:wrap; }
          @media(max-width:768px){
            .stats-row { grid-template-columns:repeat(2,1fr); gap:8px; }
            .main-grid { grid-template-columns:1fr; }
            .tools-grid { grid-template-columns:1fr 1fr; gap:8px; }
          }
          @media(max-width:380px){
            .tools-grid { grid-template-columns:1fr; }
          }
        `}</style>
        <div className="stats-row">
        {[
          { icon: Flame,        label: 'Study Streak',    value: streak > 0 ? `${streak}d`  : '—',           color: '#F43F5E' },
          { icon: Target,       label: 'Avg Quiz Score',  value: avgScore > 0 ? `${avgScore}%` : '—',        color: '#10B981' },
          { icon: CheckCircle2, label: 'Topics Mastered', value: mastered > 0 ? mastered : '—',              color: '#6366F1' },
          { icon: FileText,     label: 'Notes Created',   value: totalNotes > 0 ? totalNotes : '—',          color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={17} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: loading ? 'var(--text-muted)' : 'var(--text-primary)',
                lineHeight: 1 }}>{loading ? '…' : s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
        </div>
      </motion.div>
      <style>{`.dash-grid{display:grid;grid-template-columns:1fr 320px;gap:16px;margin-bottom:20px}@media(max-width:900px){.dash-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="dash-grid">

        {/* LEFT: Primary Tools */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.07em', marginBottom: 10 }}>Quick Study</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {primaryTools.map((tool, i) => (
              <Link key={i} href={tool.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}
                  style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s',
                    height: '100%' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${tool.color}50`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${tool.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <tool.icon size={20} color={tool.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Weekly activity */}
          <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--bg-card)',
            border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>This Week's Activity</p>
              <Link href="/dashboard/analytics" style={{ fontSize: 11, color: 'var(--color-primary-light)',
                textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 56 }} />
            ) : stats?.weeklyActivity?.length ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>
                {stats.weeklyActivity.map((day, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((day.total / maxActivity) * 100, 8)}%` }}
                      transition={{ delay: 0.3 + i * 0.04, duration: 0.35 }}
                      title={`${day.day}: ${day.total} activities`}
                      style={{ width: '100%', minHeight: 8, borderRadius: 4,
                        background: day.total > 0 ? 'var(--gradient-primary)' : 'var(--bg-tertiary)' }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{day.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                No activity yet — start studying to see your progress
              </p>
            )}
          </div>
        </motion.div>

        {/* RIGHT: Plan + Recent */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Active Plan */}
          <div style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-card)',
            border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em' }}>Study Plan</p>
              <Link href="/dashboard/planner" style={{ fontSize: 11, color: 'var(--color-primary-light)',
                textDecoration: 'none', fontWeight: 600 }}>View →</Link>
            </div>
            {stats?.activePlan ? (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {stats.activePlan.title}
                </p>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)',
                  overflow: 'hidden', marginBottom: 5 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stats.activePlan.progress}%` }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    style={{ height: '100%', borderRadius: 3, background: 'var(--gradient-primary)' }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {stats.activePlan.completedTasks}/{stats.activePlan.totalTasks} tasks · {stats.activePlan.progress}%
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>No active plan</p>
                <Link href="/dashboard/planner" className="btn-primary"
                  style={{ fontSize: 11, padding: '7px 14px', textDecoration: 'none' }}>
                  Create Plan
                </Link>
              </div>
            )}
          </div>

          {/* Recent activity */}
          {stats?.recentActivity?.length > 0 && (
            <div style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Continue Where You Left Off
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {stats.recentActivity.slice(0, 3).map((item, i) => {
                  const colors = { note: '#6366F1', chat: '#8B5CF6', quiz: '#06B6D4', plan: '#EC4899' };
                  const color = colors[item.type] || '#6366F1';
                  const hrefs = { note: `/dashboard/notes/${item.id}`, chat: `/dashboard/chat`, quiz: `/dashboard/quiz`, plan: `/dashboard/planner` };
                  return (
                    <Link key={i} href={hrefs[item.type] || '#'} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
                        borderRadius: 9, transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%',
                          background: color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                        <ChevronRight size={10} color="var(--text-muted)" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weak topics / revision alert */}
          {(dueTopics > 0 || weakTopics > 0) && (
            <div style={{ padding: '14px 16px', borderRadius: 14,
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 4 }}>
                ⚠ Needs Attention
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
                {dueTopics > 0 && `${dueTopics} topic${dueTopics > 1 ? 's' : ''} due for revision`}
                {dueTopics > 0 && weakTopics > 0 && ' · '}
                {weakTopics > 0 && `${weakTopics} weak topic${weakTopics > 1 ? 's' : ''}`}
              </p>
              <Link href="/dashboard/revision" className="btn-primary"
                style={{ fontSize: 12, padding: '7px 0', width: '100%', justifyContent: 'center',
                  textDecoration: 'none', background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
                Start Revision
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── MORE TOOLS (secondary) ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.07em', marginBottom: 10 }}>More Study Tools</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {secondaryTools.map((tool, i) => (
            <Link key={i} href={tool.href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
                borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${tool.color}40`; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-card)'; }}>
                <tool.icon size={14} color={tool.color} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{tool.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
