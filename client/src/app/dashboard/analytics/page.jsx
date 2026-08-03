'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Brain, Target, FileText, MessageSquare, BarChart3, Loader2, Sparkles, ArrowRight, CheckCircle2, RefreshCw, Lightbulb, BookOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

const PALETTE = ['#6366F1','#8B5CF6','#10B981','#F59E0B','#EC4899','#F43F5E'];

function Card({ children, style }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)',
      borderRadius:16, padding:22, ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>{children}</p>;
}

function Bar({ value, max, color, label, sub }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:12, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color, flexShrink:0 }}>{sub || value}</span>
      </div>
      <div style={{ height:6, borderRadius:3, background:'var(--bg-tertiary)', overflow:'hidden' }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.6, ease:'easeOut' }}
          style={{ height:'100%', borderRadius:3, background:color }} />
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div style={{ padding:'14px 16px', borderRadius:14, background:'var(--bg-card)',
      border:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}15`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [n, q, c, r] = await Promise.all([
          api.get('/notes').catch(() => ({ data: [] })),
          api.get('/quiz').catch(() => ({ data: [] })),
          api.get('/chat').catch(() => ({ data: [] })),
          api.get('/revision/stats').catch(() => ({ data: {} })),
        ]);

        const notes   = n.data || [];
        const quizzes = q.data || [];
        const chats   = c.data || [];
        const rev     = r.data || {};

        // Attempts
        const attempts = quizzes.flatMap(quiz =>
          (quiz.attempts || []).map(a => ({ score: a.score, total: a.total, subject: quiz.subject || 'General', title: quiz.title }))
        );

        const avgScore  = attempts.length ? Math.round(attempts.reduce((s,a) => s + (a.score/a.total)*100, 0) / attempts.length) : null;
        const bestScore = attempts.length ? Math.max(...attempts.map(a => Math.round((a.score/a.total)*100))) : null;

        // Streak
        const days = new Set([
          ...notes.map(n => new Date(n.createdAt).toDateString()),
          ...chats.map(c => new Date(c.updatedAt || c.createdAt).toDateString()),
          ...quizzes.map(q => new Date(q.createdAt).toDateString()),
        ]);
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date(); d.setDate(d.getDate() - i);
          if (days.has(d.toDateString())) streak++; else if (i > 0) break;
        }

        // Activity last 14 days
        const activity = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const ds = d.toDateString();
          activity.push({
            label: d.toLocaleDateString('en',{ weekday:'short' }),
            total: [notes, chats, quizzes].flat().filter(x =>
              new Date(x.createdAt || x.updatedAt).toDateString() === ds).length,
          });
        }
        const maxAct = Math.max(...activity.map(a => a.total), 1);

        // Subjects
        const subMap = {};
        notes.forEach(n => { const s = n.subject || 'General'; subMap[s] = (subMap[s]||0)+1; });
        const subjects = Object.entries(subMap).sort((a,b)=>b[1]-a[1]).slice(0,6);

        // Weak topics
        const weak = quizzes.filter(q => {
          if (!q.attempts?.length) return false;
          const best = Math.max(...q.attempts.map(a => Math.round((a.score/a.total)*100)));
          return best < 60;
        }).map(q => ({
          title: q.title,
          best: Math.max(...q.attempts.map(a => Math.round((a.score/a.total)*100))),
        })).sort((a,b) => a.best - b.best).slice(0,3);

        setStats({ notes: notes.length, quizzes: quizzes.length, chats: chats.length,
          avgScore, bestScore, streak, attempts: attempts.length,
          mastered: rev.mastered||0, tracked: rev.total||0,
          activity, maxAct, subjects, weak });
      } catch (e) {
        console.error(e);
        setError(true);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:12 }}>
      <Loader2 size={24} color="var(--color-primary)" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:'var(--text-muted)', fontSize:14 }}>Loading analytics…</span>
    </div>
  );

  if (error || !stats) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <p style={{ fontSize:15, color:'var(--text-muted)' }}>Could not load analytics.</p>
      <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding:'8px 20px', fontSize:13 }}>Retry</button>
    </div>
  );

  const nextHref   = !stats.attempts ? '/dashboard/quiz' : stats.weak.length ? '/dashboard/revision' : '/dashboard/generate';
  const nextLabel  = !stats.attempts ? 'Take your first quiz' : stats.weak.length ? `Revise "${stats.weak[0].title}"` : 'Generate new notes';
  const nextDesc   = !stats.attempts ? 'Unlock weak topic detection and personalized insights.' : stats.weak.length ? `Score: ${stats.weak[0].best}% — needs practice` : 'Expand your knowledge base';
  const nextColor  = !stats.attempts ? '#6366F1' : stats.weak.length ? '#F59E0B' : '#8B5CF6';

  return (
    <div style={{ padding:'24px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <BarChart3 size={22} color="var(--color-primary)" /> Performance Analytics
        </h1>
        <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Your learning progress at a glance</p>
      </motion.div>

      {/* 4 stat chips */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <StatChip icon={Flame}        label="Study Streak"    value={stats.streak > 0 ? `${stats.streak}d` : '—'}           color="#F43F5E" />
        <StatChip icon={Target}       label="Avg Quiz Score"  value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'}    color="#6366F1" />
        <StatChip icon={CheckCircle2} label="Topics Mastered" value={stats.mastered > 0 ? stats.mastered : '—'}              color="#10B981" />
        <StatChip icon={Brain}        label="Quiz Attempts"   value={stats.attempts > 0 ? stats.attempts : '—'}              color="#8B5CF6" />
      </motion.div>

      {/* Next action + Activity */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:16, marginBottom:16 }}>

        {/* Next Best Action */}
        <Card style={{ background:`linear-gradient(135deg,${nextColor}12,${nextColor}06)`, border:`1px solid ${nextColor}30` }}>
          <Label>🎯 Next Best Action</Label>
          <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:6, lineHeight:1.4 }}>{nextLabel}</p>
          <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.5 }}>{nextDesc}</p>
          <Link href={nextHref} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px',
            borderRadius:10, background:nextColor, color:'white', textDecoration:'none', fontSize:13, fontWeight:700 }}>
            Start <ArrowRight size={13} />
          </Link>
        </Card>

        {/* 14-day Activity */}
        <Card>
          <Label>📊 14-Day Activity</Label>
          {stats.activity.some(a => a.total > 0) ? (
            <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:80 }}>
              {stats.activity.map((a, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <motion.div initial={{ height:0 }}
                    animate={{ height: a.total > 0 ? `${Math.round((a.total/stats.maxAct)*100)}%` : '6px' }}
                    transition={{ delay:0.1+i*0.02, duration:0.35 }}
                    style={{ width:'100%', borderRadius:3, minHeight:6,
                      background:a.total>0?'linear-gradient(135deg,#6366F1,#8B5CF6)':'var(--bg-tertiary)' }} />
                  {i % 2 === 0 && <span style={{ fontSize:9, color:'var(--text-muted)' }}>{a.label}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>No activity yet — start studying!</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Subjects + Weak topics */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        <Card>
          <Label>📚 Notes by Subject</Label>
          {stats.subjects.length > 0 ? (
            stats.subjects.map(([name, count], i) => (
              <Bar key={i} value={count} max={stats.subjects[0][1]} color={PALETTE[i % PALETTE.length]} label={name} sub={`${count} note${count !== 1 ? 's':''}`} />
            ))
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <BookOpen size={28} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:8, display:'block', margin:'0 auto 8px' }} />
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>Create notes with subjects to see distribution</p>
            </div>
          )}
        </Card>

        <Card>
          <Label>⚠️ Topics That Need Attention</Label>
          {stats.weak.length > 0 ? (
            <div>
              {stats.weak.map((t, i) => (
                <Bar key={i} value={t.best} max={100} color={t.best < 40 ? '#F43F5E' : '#F59E0B'} label={t.title} sub={`${t.best}%`} />
              ))}
              <Link href="/dashboard/revision" className="btn-primary"
                style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6,
                  fontSize:12, padding:'8px 16px', marginTop:8 }}>
                <RefreshCw size={12} /> Start Revision
              </Link>
            </div>
          ) : !stats.attempts ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>Take a quiz to discover weak topics</p>
              <Link href="/dashboard/quiz" className="btn-primary" style={{ textDecoration:'none', fontSize:12, padding:'8px 16px' }}>Take Quiz</Link>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <CheckCircle2 size={28} color="#10B981" style={{ display:'block', margin:'0 auto 8px' }} />
              <p style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>All topics looking good!</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Secondary stats */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[
            { icon:FileText,      label:'Notes Created',  value:stats.notes,    color:'#6366F1' },
            { icon:Brain,         label:'Quizzes Made',   value:stats.quizzes,  color:'#8B5CF6' },
            { icon:MessageSquare, label:'AI Chats',       value:stats.chats,    color:'#06B6D4' },
            { icon:TrendingUp,    label:'Topics Tracked', value:stats.tracked,  color:'#F59E0B' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'13px 15px', borderRadius:12, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`${s.color}15`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <s.icon size={14} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{s.value||0}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
