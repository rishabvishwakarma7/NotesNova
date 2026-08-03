'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, CheckCircle2, Brain, Star, AlertCircle,
  CalendarDays, RefreshCw, Loader2, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import GlassCard from '@/components/ui/GlassCard';

export default function WeeklyReportPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats').catch(() => ({ data: null })),
      api.get('/journey/summary').catch(() => ({ data: null })),
      api.get('/journey/readiness').catch(() => ({ data: null })),
      api.get('/journey/weak-topics').catch(() => ({ data: [] })),
    ]).then(([stats, journey, readiness, weak]) => {
      setData({ stats: stats.data, journey: journey.data, readiness: readiness.data,
        weakTopics: Array.isArray(weak.data) ? weak.data : [] });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <Loader2 size={28} color="#8B5CF6" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const stats    = data?.stats    || {};
  const journey  = data?.journey  || {};
  const readiness= data?.readiness|| {};
  const weak     = data?.weakTopics || [];

  const weeklyActivity = stats.weeklyActivity || [];
  const totalStudyTime = weeklyActivity.reduce((s, d) => s + (d.total * 15), 0); // estimate ~15min per activity
  const studyH = Math.floor(totalStudyTime / 60);
  const studyM = totalStudyTime % 60;
  const activeDays = weeklyActivity.filter(d => d.total > 0).length;
  const avgQuiz = stats.quizAvgScore || 0;
  const strongSubject = stats.recentActivity?.find(a => a.type === 'note')?.title || '—';
  const weakSubject = weak[0]?.subject || weak[0]?.topic || '—';

  const thisWeekDate = new Date();
  const lastMonday = new Date(thisWeekDate);
  lastMonday.setDate(thisWeekDate.getDate() - thisWeekDate.getDay() + 1);
  const sunday = new Date(lastMonday);
  sunday.setDate(lastMonday.getDate() + 6);

  const weekLabel = `${lastMonday.toLocaleDateString('en-US',{ month:'short', day:'numeric' })} – ${sunday.toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}`;

  const highlights = [
    { icon: Clock,        label: 'Study Time',     value: totalStudyTime > 0 ? `${studyH}h ${studyM}m` : '—',      color: '#6366F1' },
    { icon: CalendarDays, label: 'Active Days',     value: `${activeDays}/7`,                                        color: '#8B5CF6' },
    { icon: Brain,        label: 'Avg Quiz Score',  value: avgQuiz > 0 ? `${avgQuiz}%` : '—',                      color: '#06B6D4' },
    { icon: TrendingUp,   label: 'Exam Readiness',  value: readiness.score != null ? `${readiness.score}%` : '—',  color: '#10B981' },
    { icon: CheckCircle2, label: 'Tasks Completed', value: journey.today?.completedTasks ?? '—',                    color: '#F59E0B' },
    { icon: AlertCircle,  label: 'Weak Topics',     value: weak.length || '—',                                      color: '#F43F5E' },
  ];

  // Determine next week priorities
  const nextPriorities = [];
  if (weak.length > 0) nextPriorities.push(`Practice ${weak[0]?.topic || 'weak topics'} — quiz accuracy below 70%`);
  if (readiness.status === 'slightly_behind' || readiness.status === 'significantly_behind')
    nextPriorities.push('Add an extra 20–30 min study session to catch up');
  if (journey.dueRevisions > 0)
    nextPriorities.push(`Complete ${journey.dueRevisions} overdue revision${journey.dueRevisions > 1 ? 's' : ''}`);
  nextPriorities.push('Generate notes for topics you haven\'t covered yet');
  if (avgQuiz < 60) nextPriorities.push('Focus on PYQ practice to build exam confidence');

  const statusColors = { ahead:'#10B981', on_track:'#6366F1', slightly_behind:'#F59E0B', significantly_behind:'#F43F5E' };
  const statusColor = statusColors[readiness.status] || '#6366F1';

  return (
    <div style={{ padding:'28px 20px', maxWidth:900, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'var(--gradient-primary)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <TrendingUp size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>Weekly Review</h1>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:3 }}>{weekLabel}</p>
          </div>
        </div>
      </motion.div>

      {/* Status banner */}
      {readiness.status && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          style={{ padding:'14px 20px', borderRadius:14, marginBottom:20,
            background:`${statusColor}10`, border:`1px solid ${statusColor}30`,
            display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>
            {readiness.status === 'ahead' ? '🚀' : readiness.status === 'on_track' ? '✅' : '⚠️'}
          </span>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:statusColor, marginBottom:2 }}>
              {readiness.status === 'ahead' ? 'Ahead of schedule' :
               readiness.status === 'on_track' ? 'On track' :
               readiness.status === 'slightly_behind' ? 'Slightly behind' : 'Needs attention'}
            </p>
            <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
              {readiness.recommendation || 'Keep studying consistently to stay on track.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Highlight stats grid */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}
          className="wr-grid">
          <style>{`.wr-grid{grid-template-columns:repeat(3,1fr)}@media(max-width:600px){.wr-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
          {highlights.map((h, i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.04 }}>
              <GlassCard style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:`${h.color}15`,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <h.icon size={16} color={h.color} />
                  </div>
                </div>
                <p style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{h.value}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{h.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity chart */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <GlassCard style={{ padding:'20px 22px', marginBottom:16 }}>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>Daily Activity This Week</p>
          {weeklyActivity.length > 0 ? (
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:72 }}>
              {weeklyActivity.map((day, i) => {
                const max = Math.max(...weeklyActivity.map(d => d.total), 1);
                const h = Math.max((day.total / max) * 100, day.total > 0 ? 12 : 4);
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <motion.div initial={{ height:0 }} animate={{ height:`${h}%` }} transition={{ delay:0.3+i*0.05, duration:0.4 }}
                      title={`${day.day}: ${day.total} activities`}
                      style={{ width:'100%', minHeight:4, borderRadius:4,
                        background: day.total > 0 ? 'var(--gradient-primary)' : 'var(--bg-tertiary)' }} />
                    <span style={{ fontSize:9, color:'var(--text-muted)' }}>{day.day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center', padding:'16px 0' }}>No activity data yet</p>
          )}
        </GlassCard>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}
        className="wr-two-col">
        <style>{`.wr-two-col{grid-template-columns:1fr 1fr}@media(max-width:600px){.wr-two-col{grid-template-columns:1fr!important}}`}</style>

        {/* Strengths */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <GlassCard style={{ padding:'18px 20px', height:'100%' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#10B981', marginBottom:12,
              display:'flex', alignItems:'center', gap:6 }}><Star size={14} /> Strengths</p>
            {avgQuiz >= 70 && (
              <div style={{ padding:'9px 12px', borderRadius:9, background:'rgba(16,185,129,0.08)',
                border:'1px solid rgba(16,185,129,0.2)', marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Good Quiz Performance</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>{avgQuiz}% average score this week</p>
              </div>
            )}
            {activeDays >= 5 && (
              <div style={{ padding:'9px 12px', borderRadius:9, background:'rgba(16,185,129,0.08)',
                border:'1px solid rgba(16,185,129,0.2)', marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Consistent Study Habit</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>Active {activeDays} out of 7 days</p>
              </div>
            )}
            {readiness.status === 'ahead' && (
              <div style={{ padding:'9px 12px', borderRadius:9, background:'rgba(16,185,129,0.08)',
                border:'1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Ahead of Schedule</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>You're covering more than planned</p>
              </div>
            )}
            {avgQuiz < 70 && activeDays < 5 && readiness.status !== 'ahead' && (
              <p style={{ fontSize:13, color:'var(--text-muted)', padding:'8px 0' }}>Take more quizzes and study consistently to unlock strengths.</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Needs attention */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <GlassCard style={{ padding:'18px 20px', height:'100%' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#F43F5E', marginBottom:12,
              display:'flex', alignItems:'center', gap:6 }}><AlertCircle size={14} /> Needs Attention</p>
            {weak.slice(0, 2).map((w, i) => (
              <div key={i} style={{ padding:'9px 12px', borderRadius:9, background:'rgba(244,63,94,0.06)',
                border:'1px solid rgba(244,63,94,0.18)', marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{w.topic}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>{w.quizAccuracy}% quiz accuracy · {w.subject}</p>
              </div>
            ))}
            {weak.length === 0 && (
              <p style={{ fontSize:13, color:'var(--text-muted)', padding:'8px 0' }}>No weak areas detected. Take quizzes to identify gaps.</p>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Next week priorities */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
        <GlassCard style={{ padding:'20px 22px', marginBottom:16 }}>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:14,
            display:'flex', alignItems:'center', gap:8 }}>
            <CalendarDays size={16} color="#8B5CF6" /> Next Week's Priorities
          </p>
          {nextPriorities.slice(0,4).map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:'rgba(139,92,246,0.12)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                <span style={{ fontSize:11, fontWeight:800, color:'#8B5CF6' }}>{i+1}</span>
              </div>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{p}</p>
            </div>
          ))}
        </GlassCard>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
        style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Link href="/dashboard/journey" className="btn-primary"
          style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:7, fontSize:13 }}>
          Start This Week's Plan <ChevronRight size={14} />
        </Link>
        <Link href="/dashboard/mistakes" className="btn-secondary"
          style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:7, fontSize:13 }}>
          <Brain size={14} /> Review Mistakes
        </Link>
        <Link href="/dashboard/revision" className="btn-secondary"
          style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:7, fontSize:13 }}>
          <RefreshCw size={14} /> Revise Due Topics
        </Link>
      </motion.div>
    </div>
  );
}
