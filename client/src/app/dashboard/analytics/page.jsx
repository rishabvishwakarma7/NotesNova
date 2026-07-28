'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Brain, Target, TrendingUp, FileText, MessageSquare,
  BarChart3, Loader2, AlertCircle, Sparkles, ArrowRight,
  BookOpen, CheckCircle2, RefreshCw, Star, Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#F43F5E'];

/* ── Custom chart tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
      {label && <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, margin: '2px 0' }}>
          {p.name}: {p.value}{p.name === 'Score' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, sub, color, isEmpty }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid var(--border-color)', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${color}40`}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={19} color={color} />
        </div>
      </div>
      <p style={{ fontSize: isEmpty ? 22 : 28, fontWeight: 800, color: isEmpty ? 'var(--text-muted)' : 'var(--text-primary)',
        lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

/* ── Section heading ── */
function SectionHeading({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: icon ? 24 : 0 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ emoji, message, action, actionHref }) {
  return (
    <div style={{ padding: '28px 20px', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 240, lineHeight: 1.5 }}>{message}</p>
      {action && actionHref && (
        <Link href={actionHref} className="btn-primary"
          style={{ fontSize: 12, padding: '8px 16px', marginTop: 4, textDecoration: 'none' }}>
          {action}
        </Link>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notes, quizzes, chats, plans, revStats] = await Promise.all([
        api.get('/notes'),
        api.get('/quiz'),
        api.get('/chat').catch(() => ({ data: [] })),
        api.get('/planner'),
        api.get('/revision/stats').catch(() => ({ data: {} })),
      ]);
      const noteList  = notes.data   || [];
      const quizList  = quizzes.data || [];
      const chatList  = chats.data   || [];
      const planList  = plans.data   || [];
      const revData   = revStats.data || {};

      const allAttempts = quizList.flatMap(q =>
        (q.attempts || []).map(a => ({ ...a, subject: q.subject, title: q.title, difficulty: q.difficulty }))
      ).sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

      const quizTrend = allAttempts.slice(-10).map((a, i) => ({
        name: `#${i + 1}`, score: Math.round((a.score / a.total) * 100), subject: a.subject || 'General',
      }));

      const subjectMap = {};
      noteList.forEach(n => { const s = n.subject || 'General'; subjectMap[s] = (subjectMap[s] || 0) + 1; });
      const subjectData = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([name, value]) => ({ name, value }));

      const activityMap = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        activityMap[d.toISOString().split('T')[0]] = { notes: 0, chats: 0, quizzes: 0 };
      }
      noteList.forEach(n => { const k = new Date(n.createdAt).toISOString().split('T')[0]; if (activityMap[k]) activityMap[k].notes++; });
      chatList.forEach(c => { const k = new Date(c.createdAt || c.updatedAt).toISOString().split('T')[0]; if (activityMap[k]) activityMap[k].chats++; });
      quizList.forEach(q => { const k = new Date(q.createdAt).toISOString().split('T')[0]; if (activityMap[k]) activityMap[k].quizzes++; });
      const activityData = Object.entries(activityMap).map(([date, v]) => ({ date: date.slice(5), ...v, total: v.notes + v.chats + v.quizzes }));
      const hasActivity = activityData.some(d => d.total > 0);

      const diffMap = { easy: 0, medium: 0, hard: 0 };
      quizList.forEach(q => { diffMap[q.difficulty] = (diffMap[q.difficulty] || 0) + 1; });
      const diffData = Object.entries(diffMap).map(([name, value]) => ({ name, value }));

      const avgScore = allAttempts.length > 0 ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length) : null;
      const bestScore = allAttempts.length > 0 ? Math.max(...allAttempts.map(a => Math.round((a.score / a.total) * 100))) : null;

      const dateset = new Set([
        ...noteList.map(n => new Date(n.createdAt).toDateString()),
        ...chatList.map(c => new Date(c.createdAt || c.updatedAt).toDateString()),
        ...quizList.map(q => new Date(q.createdAt).toDateString()),
      ]);
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        if (dateset.has(d.toDateString())) streak++; else if (i > 0) break;
      }

      // Weak topics from low quiz scores
      const weakTopics = quizList.filter(q => {
        const attempts = q.attempts || [];
        if (!attempts.length) return false;
        const best = Math.max(...attempts.map(a => Math.round((a.score / a.total) * 100)));
        return best < 60;
      }).sort((a, b) => {
        const getScore = q => q.attempts?.length ? Math.max(...q.attempts.map(a => Math.round((a.score / a.total) * 100))) : 0;
        return getScore(a) - getScore(b);
      }).slice(0, 3);

      const totalQuestions = allAttempts.reduce((s, a) => s + (a.total || 0), 0);
      const planProgress = planList.map(p => ({ name: p.title?.slice(0, 22) || 'Plan', progress: p.progress || 0 }));

      setData({
        stats: {
          streak, totalNotes: noteList.length, totalQuizzes: quizList.length,
          totalAttempts: allAttempts.length, avgScore, bestScore,
          totalChats: chatList.length, revisionTopics: revData.total || 0,
          masteredTopics: revData.mastered || 0, totalQuestions,
        },
        quizTrend, subjectData, activityData, hasActivity, diffData, planProgress, weakTopics,
        hasQuizData: allAttempts.length > 0, hasNotes: noteList.length > 0,
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={28} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your learning data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const { stats, quizTrend, subjectData, activityData, hasActivity, diffData, planProgress, weakTopics, hasQuizData, hasNotes } = data;

  // Build AI insight
  const getInsight = () => {
    if (!hasQuizData && !hasNotes) return { emoji: '🌱', text: "You're just getting started! Create your first note and take a quiz to unlock personalized learning insights." };
    if (!hasQuizData) return { emoji: '🧠', text: `You've created ${stats.totalNotes} note${stats.totalNotes !== 1 ? 's' : ''}. Take an AI quiz to unlock performance analytics and discover weak topics.` };
    if (stats.avgScore >= 80) return { emoji: '🎯', text: `Excellent! Your average score is ${stats.avgScore}%. Keep practicing with harder quizzes to maintain your performance.` };
    if (stats.avgScore < 50) return { emoji: '📖', text: `Your average score is ${stats.avgScore}%. Focus on revising weak topics before taking more quizzes — quality over quantity.` };
    if (stats.streak >= 7) return { emoji: '🔥', text: `You're on a ${stats.streak}-day streak! Consistency is your superpower. Keep going!` };
    if (weakTopics.length > 0) return { emoji: '⚠️', text: `You have ${weakTopics.length} topic${weakTopics.length !== 1 ? 's' : ''} scoring below 60%. Focus on Smart Revision to improve your weak areas.` };
    return { emoji: '📈', text: `Your average quiz score is ${stats.avgScore}%. Take more quizzes across different subjects to build a complete performance picture.` };
  };
  const insight = getInsight();

  // Next best action
  const getNextAction = () => {
    if (!hasQuizData) return { title: 'Take your first AI quiz', desc: 'Unlock personalized insights, weak topic detection, and learning recommendations.', href: '/dashboard/quiz', cta: 'Start Quiz', color: '#6366F1', icon: Brain };
    if (weakTopics.length > 0) {
      const worst = weakTopics[0];
      const score = worst.attempts?.length ? Math.max(...worst.attempts.map(a => Math.round((a.score / a.total) * 100))) : 0;
      return { title: `Revise "${worst.title}"`, desc: `Your last score was ${score}%. Smart revision will help you improve.`, href: '/dashboard/revision', cta: 'Start Revision', color: '#F59E0B', icon: RefreshCw };
    }
    if (stats.streak === 0) return { title: 'Resume your streak', desc: "You haven't studied today. Even 15 minutes makes a difference.", href: '/dashboard/chat', cta: 'Start Learning', color: '#10B981', icon: Flame };
    return { title: 'Explore a new topic', desc: 'Generate notes on a new subject to expand your knowledge.', href: '/dashboard/generate', cta: 'Generate Notes', color: '#8B5CF6', icon: Sparkles };
  };
  const nextAction = getNextAction();

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={22} color="var(--color-primary)" />
          Performance Analytics
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your learning progress at a glance</p>
      </motion.div>

      {/* ── 4 PRIMARY STATS ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon={Flame}    label="Study Streak"    value={stats.streak > 0 ? `${stats.streak}d` : '—'} sub={stats.streak > 0 ? 'days in a row' : 'Start today'} color="#F43F5E" isEmpty={stats.streak === 0} />
        <StatCard icon={CheckCircle2} label="Topics Mastered" value={stats.masteredTopics > 0 ? stats.masteredTopics : '—'} sub={stats.masteredTopics > 0 ? `of ${stats.revisionTopics} tracked` : 'Track topics first'} color="#10B981" isEmpty={stats.masteredTopics === 0} />
        <StatCard icon={Target}   label="Avg Quiz Score"  value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'} sub={stats.avgScore !== null ? `Best: ${stats.bestScore}%` : 'No quiz data yet'} color="#6366F1" isEmpty={stats.avgScore === null} />
        <StatCard icon={Brain}    label="Questions Solved" value={stats.totalQuestions > 0 ? stats.totalQuestions : '—'} sub={stats.totalQuestions > 0 ? `${stats.totalAttempts} attempts` : 'Take a quiz'} color="#8B5CF6" isEmpty={stats.totalQuestions === 0} />
      </motion.div>

      {/* ── NEXT BEST ACTION + AI INSIGHT (side by side) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Next Best Action */}
        <div style={{ padding: '22px', borderRadius: 16, background: `linear-gradient(135deg, ${nextAction.color}12, ${nextAction.color}06)`,
          border: `1px solid ${nextAction.color}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${nextAction.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <nextAction.icon size={16} color={nextAction.color} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: nextAction.color,
              textTransform: 'uppercase', letterSpacing: '0.07em' }}>🎯 Next Best Action</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{nextAction.title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{nextAction.desc}</p>
          <Link href={nextAction.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, background: nextAction.color, color: 'white',
            textDecoration: 'none', fontSize: 13, fontWeight: 700, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {nextAction.cta} <ArrowRight size={13} />
          </Link>
        </div>

        {/* AI Insight */}
        <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)',
          border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={16} color="var(--color-primary)" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-light)',
              textTransform: 'uppercase', letterSpacing: '0.07em' }}>✨ AI Learning Insight</span>
          </div>
          <p style={{ fontSize: 24, marginBottom: 10 }}>{insight.emoji}</p>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{insight.text}</p>
          {!hasQuizData && (
            <Link href="/dashboard/quiz" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14,
              padding: '8px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-primary-light)',
              textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
              Take Your First Quiz <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── 30-DAY ACTIVITY + NOTES BY SUBJECT ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Activity chart */}
        <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <SectionHeading icon="📊" title="30-Day Activity" />
          {hasActivity ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={activityData.slice(-14)} barSize={7} barGap={2} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                  <Bar dataKey="notes"   fill="#6366F1" radius={[3,3,0,0]} name="Notes"   />
                  <Bar dataKey="chats"   fill="#8B5CF6" radius={[3,3,0,0]} name="Chats"   />
                  <Bar dataKey="quizzes" fill="#10B981" radius={[3,3,0,0]} name="Quizzes" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                {[['Notes','#6366F1'],['Chats','#8B5CF6'],['Quizzes','#10B981']].map(([l,c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState emoji="📈" message="Your study activity will appear here as you learn." action="Start Studying" actionHref="/dashboard/chat" />
          )}
        </div>

        {/* Notes by Subject */}
        <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <SectionHeading icon="📚" title="Notes by Subject" />
          {subjectData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={subjectData} cx="50%" cy="50%" innerRadius={36} outerRadius={58}
                    dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {subjectData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                {subjectData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState emoji="📓" message="Create notes and tag them with subjects to see your distribution." action="Create Note" actionHref="/dashboard/notes/new" />
          )}
        </div>
      </motion.div>

      {/* ── QUIZ TREND + WEAK TOPICS ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Quiz score trend */}
        <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <SectionHeading icon="🎯" title="Quiz Score Trend" subtitle={hasQuizData ? 'Last 10 attempts' : undefined} />
          {quizTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={quizTrend} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState emoji="📝" message="No quiz attempts yet. Take a quiz to see your score trend." action="Take Quiz" actionHref="/dashboard/quiz" />
          )}
        </div>

        {/* Weak topics */}
        <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <SectionHeading icon="⚠️" title="Topics That Need Attention" />
          {weakTopics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weakTopics.map((q, i) => {
                const score = q.attempts?.length ? Math.max(...q.attempts.map(a => Math.round((a.score / a.total) * 100))) : 0;
                const color = score < 40 ? '#F43F5E' : '#F59E0B';
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 12,
                    background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{q.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color, flexShrink: 0 }}>{score}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        style={{ height: '100%', borderRadius: 3, background: color }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {score < 40 ? 'Needs immediate revision' : 'Needs practice'}
                    </p>
                  </div>
                );
              })}
              <Link href="/dashboard/revision" className="btn-primary"
                style={{ textDecoration: 'none', justifyContent: 'center', fontSize: 12, padding: '9px 0', marginTop: 4 }}>
                <RefreshCw size={13} /> Start Smart Revision
              </Link>
            </div>
          ) : !hasQuizData ? (
            <EmptyState emoji="🔍" message="Complete a quiz to discover topics that need revision." action="Take Your First Quiz" actionHref="/dashboard/quiz" />
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>All topics looking good!</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Keep practising to maintain your performance.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── QUIZ DIFFICULTY + STUDY PLAN ── */}
      {(diffData.some(d => d.value > 0) || planProgress.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ display: 'grid', gridTemplateColumns: diffData.some(d => d.value > 0) && planProgress.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>

          {diffData.some(d => d.value > 0) && (
            <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <SectionHeading icon="🏋️" title="Quiz Difficulty Distribution" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {diffData.map((d) => {
                  const total = diffData.reduce((s, x) => s + x.value, 0);
                  const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                  const colors = { easy: '#10B981', medium: '#F59E0B', hard: '#F43F5E' };
                  const color = colors[d.name] || '#6366F1';
                  return (
                    <div key={d.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{d.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{d.value} quiz{d.value !== 1 ? 'zes' : ''} · {pct}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.6 }}
                          style={{ height: '100%', borderRadius: 4, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {planProgress.length > 0 && (
            <div style={{ padding: '22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <SectionHeading icon="📅" title="Study Plan Progress" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {planProgress.slice(0, 4).map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 10 }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)', flexShrink: 0 }}>{p.progress}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
                        style={{ height: '100%', borderRadius: 4, background: 'var(--gradient-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── SECONDARY STATS STRIP ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { icon: FileText,     label: 'Notes Created',  value: stats.totalNotes,        color: '#6366F1' },
            { icon: Brain,        label: 'Quizzes Taken',  value: stats.totalQuizzes,       color: '#8B5CF6' },
            { icon: MessageSquare,label: 'AI Chats',       value: stats.totalChats,         color: '#06B6D4' },
            { icon: TrendingUp,   label: 'Topics Tracked', value: stats.revisionTopics,     color: '#F59E0B' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={15} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value || 0}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
