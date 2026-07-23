'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, Wand2, Layers, BookOpen, TrendingUp,
  Youtube, Brain, CalendarDays, ArrowRight, Clock, Search,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import api from '@/services/api';

const quickActions = [
  { icon: MessageSquare, label: 'AI Chat', desc: 'Start a conversation', href: '/dashboard/chat', color: '#8B5CF6' },
  { icon: Wand2, label: 'Generate Notes', desc: 'Create AI notes', href: '/dashboard/generate', color: '#06B6D4' },
  { icon: Youtube, label: 'Video Notes', desc: 'Notes from YouTube', href: '/dashboard/video-notes', color: '#FF0000' },
  { icon: Brain, label: 'AI Quiz', desc: 'Test your knowledge', href: '/dashboard/quiz', color: '#F59E0B' },
  { icon: CalendarDays, label: 'Study Planner', desc: 'Plan your schedule', href: '/dashboard/planner', color: '#EC4899' },
  { icon: FileText, label: 'My Notes', desc: 'View all notes', href: '/dashboard/notes', color: '#10B981' },
];

const typeIcons = {
  note: { icon: FileText, color: '#8B5CF6' },
  chat: { icon: MessageSquare, color: '#06B6D4' },
  quiz: { icon: Brain, color: '#F59E0B' },
  plan: { icon: CalendarDays, color: '#EC4899' },
};

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch {
      // Use defaults
      setStats(null);
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Notes Created', value: stats?.totalNotes ?? 0, icon: FileText, color: '#8B5CF6' },
    { label: 'AI Chats', value: stats?.totalChats ?? 0, icon: MessageSquare, color: '#06B6D4' },
    { label: 'Study Streak', value: `${stats?.streak ?? 0} days`, icon: TrendingUp, color: '#10B981' },
    { label: 'Topics Covered', value: stats?.topicsCount ?? 0, icon: BookOpen, color: '#EC4899' },
  ];

  const maxActivity = stats?.weeklyActivity
    ? Math.max(...stats.weeklyActivity.map(d => d.total), 1)
    : 1;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Welcome back! 👋
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
          What would you like to study today?
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{stat.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 28 }} /> : stat.value}
                  </p>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${stat.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <stat.icon size={22} color={stat.color} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Middle row: Activity chart + Quiz stats + Active plan */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 16, marginBottom: 40,
      }}>
        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              📊 Weekly Activity
            </h3>
            {loading ? (
              <div className="skeleton" style={{ height: 140 }} />
            ) : stats?.weeklyActivity ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
                {stats.weeklyActivity.map((day, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{day.total}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((day.total / maxActivity) * 100, 8)}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                      style={{
                        width: '100%', minHeight: 8, borderRadius: 6,
                        background: day.total > 0 ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                        position: 'relative',
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{day.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No activity data yet
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Right column: Quiz score + Active plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quiz Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                🧠 Quiz Score
              </h3>
              {loading ? (
                <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border-color)" strokeWidth="6" />
                      <circle cx="36" cy="36" r="30" fill="none"
                        stroke={(stats?.quizAvgScore ?? 0) >= 80 ? '#10B981' : (stats?.quizAvgScore ?? 0) >= 50 ? '#F59E0B' : '#8B5CF6'}
                        strokeWidth="6"
                        strokeDasharray={`${((stats?.quizAvgScore ?? 0) / 100) * 188.5} 188.5`}
                        strokeLinecap="round" transform="rotate(-90 36 36)"
                      />
                    </svg>
                    <span style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: 'var(--text-primary)',
                    }}>
                      {stats?.quizAvgScore ?? 0}%
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Avg Score</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {stats?.totalQuizzes ?? 0} quizzes taken
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Active Study Plan */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <GlassCard style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                📅 Active Plan
              </h3>
              {loading ? (
                <div className="skeleton" style={{ height: 50, borderRadius: 10 }} />
              ) : stats?.activePlan ? (
                <Link href={`/dashboard/planner?id=${stats.activePlan.id}`} style={{ textDecoration: 'none' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {stats.activePlan.title}
                  </p>
                  <div style={{
                    height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden', marginBottom: 6,
                  }}>
                    <div style={{
                      width: `${stats.activePlan.progress}%`, height: '100%',
                      background: 'var(--gradient-primary)', borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {stats.activePlan.completedTasks}/{stats.activePlan.totalTasks} tasks • {stats.activePlan.progress}%
                  </p>
                </Link>
              ) : (
                <Link href="/dashboard/planner" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-muted)' }}>
                  No active plan. <span style={{ color: '#8B5CF6', fontWeight: 600 }}>Create one →</span>
                </Link>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <GlassCard style={{ padding: 24, marginBottom: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              <Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentActivity.map((item, i) => {
                const cfg = typeIcons[item.type] || typeIcons.note;
                const Icon = cfg.icon;
                const href = item.type === 'note' ? `/dashboard/notes/${item.id}`
                  : item.type === 'chat' ? `/dashboard/chat?id=${item.id}`
                  : item.type === 'quiz' ? `/dashboard/quiz?id=${item.id}`
                  : `/dashboard/planner?id=${item.id}`;

                return (
                  <Link key={`${item.type}-${item.id}`} href={href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${cfg.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={16} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</p>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Quick Actions */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
        Quick Actions
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {quickActions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.05 }}
          >
            <Link href={action.href} style={{ textDecoration: 'none' }}>
              <GlassCard style={{
                padding: 28, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${action.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <action.icon size={24} color={action.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {action.label}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{action.desc}</p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
