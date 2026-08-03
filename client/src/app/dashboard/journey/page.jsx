'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Target, Clock, CheckCircle2, Circle, ChevronRight,
  Flame, CalendarDays, TrendingUp, AlertCircle, Loader2,
  Brain, RefreshCw, BookOpen, Wand2, ArrowRight, SkipForward,
  Plus, Map, BarChart3, Zap, Trophy,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const TASK_TYPE_LABELS = {
  learn: { label: 'Learn', color: '#8B5CF6', emoji: '📖' },
  read_notes: { label: 'Read Notes', color: '#06B6D4', emoji: '📄' },
  generate_notes: { label: 'Generate Notes', color: '#6366F1', emoji: '✨' },
  practice: { label: 'Practice', color: '#F59E0B', emoji: '✏️' },
  quiz: { label: 'Quiz', color: '#EC4899', emoji: '🧠' },
  revise: { label: 'Revise', color: '#10B981', emoji: '🔄' },
  solve_pyq: { label: 'Solve PYQ', color: '#F43F5E', emoji: '📋' },
  review_mistakes: { label: 'Review Mistakes', color: '#FF6B35', emoji: '🔍' },
};

const PRIORITY_COLORS = { high: '#F43F5E', medium: '#F59E0B', low: '#10B981' };

const STATUS_CONFIG = {
  ahead:               { label: 'Ahead of schedule', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '🚀' },
  on_track:            { label: 'On track',           color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: '✅' },
  slightly_behind:     { label: 'Slightly behind',    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '⚠️' },
  significantly_behind:{ label: 'Needs attention',    color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',  icon: '🔴' },
};

export default function JourneyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [summary,    setSummary]    = useState(null);
  const [todayPlan,  setTodayPlan]  = useState(null);
  const [readiness,  setReadiness]  = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [roadmap,    setRoadmap]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [genRoadmap, setGenRoadmap] = useState(false);
  const [activeTab,  setActiveTab]  = useState('today'); // today | roadmap | progress | weak

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, t, r, n, w] = await Promise.all([
        api.get('/journey/summary').catch(() => ({ data: null })),
        api.get('/journey/today').catch(() => ({ data: null })),
        api.get('/journey/readiness').catch(() => ({ data: null })),
        api.get('/journey/next-action').catch(() => ({ data: null })),
        api.get('/journey/weak-topics').catch(() => ({ data: [] })),
      ]);
      setSummary(s.data);
      setTodayPlan(t.data);
      setReadiness(r.data);
      setNextAction(n.data);
      setWeakTopics(Array.isArray(w.data) ? w.data : []);

      // Redirect to onboarding if not set up
      if (s.data && !s.data.hasProfile) {
        router.push('/dashboard/journey/onboarding');
      }
    } catch {}
    setLoading(false);
  };

  const handleGenerateRoadmap = async () => {
    setGenRoadmap(true);
    try {
      const res = await api.post('/journey/roadmap');
      setRoadmap(res.data.roadmap);
      setActiveTab('roadmap');
      toast({ message: 'Roadmap generated!', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.error || 'Failed to generate roadmap', type: 'error' });
    }
    setGenRoadmap(false);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.patch(`/journey/tasks/${taskId}/complete`);
      setTodayPlan(prev => {
        if (!prev) return prev;
        const tasks = prev.tasks.map(t => t._id === taskId ? { ...t, completed: true } : t);
        const completed = tasks.filter(t => t.completed).length;
        return { ...prev, tasks, completedCount: completed,
          completedMinutes: tasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0),
          progressPct: Math.round((completed / tasks.length) * 100) };
      });
    } catch { toast({ message: 'Failed to update task', type: 'error' }); }
  };

  const handleSkipTask = async (taskId) => {
    try {
      await api.patch(`/journey/tasks/${taskId}/skip`);
      setTodayPlan(prev => prev ? {
        ...prev, tasks: prev.tasks.map(t => t._id === taskId ? { ...t, skipped: true } : t)
      } : prev);
    } catch {}
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading your study journey…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const statusCfg = STATUS_CONFIG[readiness?.status] || STATUS_CONFIG.on_track;
  const todayH = Math.floor((todayPlan?.minutesTotal || 0) / 60);
  const todayM = (todayPlan?.minutesTotal || 0) % 60;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          flexWrap:'wrap', gap:14, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:4, display:'flex', alignItems:'center', gap:10 }}>
            <Sparkles size={24} color="#8B5CF6" /> Study Journey
          </h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
            {summary?.examName ? `${summary.examName} · ` : ''}
            {summary?.daysUntilExam != null
              ? `${summary.daysUntilExam} days until your exam`
              : 'Your personalized path from syllabus to exam'}
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/dashboard/journey/onboarding" className="btn-secondary"
            style={{ fontSize:13, padding:'9px 16px', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            Edit Profile
          </Link>
          <button onClick={handleGenerateRoadmap} disabled={genRoadmap} className="btn-primary"
            style={{ fontSize:13, padding:'9px 16px', display:'flex', alignItems:'center', gap:6 }}>
            {genRoadmap ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Map size={14} />}
            {genRoadmap ? 'Generating…' : 'Generate Roadmap'}
          </button>
        </div>
      </motion.div>

      {/* ── STATUS BANNER ── */}
      {readiness && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          style={{ padding:'14px 20px', borderRadius:14, marginBottom:20,
            background: statusCfg.bg, border:`1px solid ${statusCfg.color}30`,
            display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <span style={{ fontSize:20 }}>{statusCfg.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <span style={{ fontSize:14, fontWeight:700, color:statusCfg.color }}>{statusCfg.label}</span>
            <span style={{ fontSize:13, color:'var(--text-secondary)', marginLeft:10 }}>
              Exam Readiness: <strong style={{ color:'var(--text-primary)' }}>{readiness.score}%</strong>
            </span>
          </div>
          {readiness.daysUntilExam != null && (
            <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>
              <CalendarDays size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />
              {readiness.daysUntilExam} days left
            </span>
          )}
        </motion.div>
      )}

      {/* ── STATS ROW ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.08 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}
          className="journey-stats">
          <style>{`.journey-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}@media(max-width:768px){.journey-stats{grid-template-columns:repeat(2,1fr)}}`}</style>
          {[
            { label:'Today\'s Tasks', value: todayPlan ? `${todayPlan.completedCount}/${todayPlan.totalCount}` : '—', icon:CheckCircle2, color:'#10B981' },
            { label:'Study Time Today', value: todayPlan?.minutesTotal ? `${todayH > 0 ? todayH+'h ' : ''}${todayM}m` : '—', icon:Clock, color:'#6366F1' },
            { label:'Exam Readiness', value: readiness ? `${readiness.score}%` : '—', icon:Target, color:'#8B5CF6' },
            { label:'Weak Topics', value: weakTopics.length || '—', icon:AlertCircle, color: weakTopics.length > 0 ? '#F43F5E' : '#10B981' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'14px 16px', borderRadius:14, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}15`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <s.icon size={17} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize:20, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{s.value}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border-color)',
        paddingBottom:0, overflowX:'auto' }}>
        {[
          { id:'today',    label:"Today's Plan",   icon:CalendarDays },
          { id:'roadmap',  label:'Roadmap',         icon:Map },
          { id:'progress', label:'Progress',        icon:BarChart3 },
          { id:'weak',     label:`Weak Areas${weakTopics.length > 0 ? ` (${weakTopics.length})` : ''}`, icon:AlertCircle },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:'10px 18px', border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
              background:'transparent', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
              color: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary-light)' : '2px solid transparent',
              marginBottom:'-1px', transition:'color 0.15s' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── TODAY TAB ── */}
      {activeTab === 'today' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }} className="journey-grid">
          <style>{`.journey-grid{display:grid;grid-template-columns:1fr 320px;gap:16px}@media(max-width:900px){.journey-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Tasks list */}
          <div>
            {/* Progress bar */}
            {todayPlan && todayPlan.totalCount > 0 && (
              <div style={{ padding:'16px 20px', borderRadius:14, background:'var(--bg-card)',
                border:'1px solid var(--border-color)', marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Today's Progress</p>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--color-primary-light)' }}>
                    {todayPlan.progressPct}%
                  </span>
                </div>
                <div style={{ height:8, borderRadius:4, background:'var(--bg-tertiary)', overflow:'hidden', marginBottom:8 }}>
                  <motion.div animate={{ width:`${todayPlan.progressPct}%` }} transition={{ duration:0.6 }}
                    style={{ height:'100%', borderRadius:4, background:'var(--gradient-primary)' }} />
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                  {todayPlan.completedCount} of {todayPlan.totalCount} tasks · {todayPlan.completedMinutes}/{todayPlan.minutesTotal} min
                </p>
              </div>
            )}

            {/* Task cards */}
            {!todayPlan || todayPlan.tasks.length === 0 ? (
              <div style={{ padding:'40px 24px', borderRadius:14, background:'var(--bg-card)',
                border:'1px solid var(--border-color)', textAlign:'center' }}>
                <CalendarDays size={36} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:14 }} />
                <p style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No tasks for today</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>
                  Complete your study profile and generate a roadmap to get daily tasks.
                </p>
                <Link href="/dashboard/journey/onboarding" className="btn-primary"
                  style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, fontSize:13 }}>
                  <Sparkles size={14} /> Set up Study Profile
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {todayPlan.tasks.map((task, i) => {
                  const cfg = TASK_TYPE_LABELS[task.taskType] || TASK_TYPE_LABELS.learn;
                  const isDone = task.completed;
                  const isSkipped = task.skipped;
                  return (
                    <motion.div key={task._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                      style={{ padding:'16px 18px', borderRadius:14, background:'var(--bg-card)',
                        border:`1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                        opacity: isSkipped ? 0.45 : 1, transition:'all 0.2s' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <button onClick={() => !isDone && handleCompleteTask(task._id)}
                          style={{ width:28, height:28, borderRadius:8, flexShrink:0, border:'none',
                            cursor: isDone ? 'default' : 'pointer', marginTop:1,
                            background: isDone ? '#10B98120' : 'var(--bg-tertiary)',
                            display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                          {isDone ? <CheckCircle2 size={16} color="#10B981" /> : <Circle size={16} color="var(--text-muted)" />}
                        </button>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                            <span style={{ fontSize:16 }}>{cfg.emoji}</span>
                            <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)',
                              textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>
                              {task.topic}
                            </p>
                          </div>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {task.subject && (
                              <span style={{ fontSize:11, color:'#06B6D4', background:'#06B6D415', padding:'2px 7px', borderRadius:5, fontWeight:600 }}>
                                {task.subject}
                              </span>
                            )}
                            <span style={{ fontSize:11, color:cfg.color, background:`${cfg.color}15`, padding:'2px 7px', borderRadius:5, fontWeight:600 }}>
                              {cfg.label}
                            </span>
                            <span style={{ fontSize:11, color:PRIORITY_COLORS[task.priority], background:`${PRIORITY_COLORS[task.priority]}15`, padding:'2px 7px', borderRadius:5, fontWeight:600 }}>
                              {task.priority} priority
                            </span>
                            <span style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
                              <Clock size={10} /> {task.duration} min
                            </span>
                          </div>
                        </div>
                        {!isDone && !isSkipped && (
                          <button onClick={() => handleSkipTask(task._id)}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
                              padding:4, display:'flex', alignItems:'center', gap:4, fontSize:11, flexShrink:0 }}>
                            <SkipForward size={13} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar: next action + weak topics */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Next recommended action */}
            {nextAction && (
              <div style={{ padding:'18px', borderRadius:14, background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.08em', marginBottom:10 }}>🎯 Recommended Next</p>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>{nextAction.title}</p>
                <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5, marginBottom:12 }}>{nextAction.reason}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                  <Clock size={12} color="var(--text-muted)" />
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{nextAction.duration} min</span>
                </div>
                <Link href={nextAction.href} className="btn-primary"
                  style={{ width:'100%', justifyContent:'center', textDecoration:'none', fontSize:13, padding:'10px 0',
                    display:'flex', alignItems:'center', gap:6 }}>
                  Start Now <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Readiness breakdown */}
            {readiness?.components && (
              <div style={{ padding:'18px', borderRadius:14, background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase',
                  letterSpacing:'0.08em', marginBottom:12 }}>Readiness Breakdown</p>
                {[
                  { label:'Knowledge', val: readiness.components.knowledge, color:'#8B5CF6' },
                  { label:'Practice',  val: readiness.components.practice,  color:'#06B6D4' },
                  { label:'Revision',  val: readiness.components.revision,  color:'#10B981' },
                ].map(c => (
                  <div key={c.label} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{c.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:c.color }}>{c.val}%</span>
                    </div>
                    <div style={{ height:5, borderRadius:3, background:'var(--bg-tertiary)', overflow:'hidden' }}>
                      <motion.div animate={{ width:`${c.val}%` }} transition={{ duration:0.8, delay:0.2 }}
                        style={{ height:'100%', borderRadius:3, background:c.color }} />
                    </div>
                  </div>
                ))}
                {readiness.recommendation && (
                  <p style={{ fontSize:11, color:'var(--text-secondary)', marginTop:10, lineHeight:1.5,
                    padding:'8px 10px', background:'var(--bg-tertiary)', borderRadius:8 }}>
                    💡 {readiness.recommendation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ROADMAP TAB ── */}
      {activeTab === 'roadmap' && (
        <div>
          {!roadmap ? (
            <div style={{ padding:'56px 32px', borderRadius:14, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', textAlign:'center' }}>
              <Map size={40} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:16 }} />
              <p style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No roadmap yet</p>
              <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20, maxWidth:360, margin:'0 auto 20px' }}>
                Generate an AI-powered study roadmap based on your subjects, exam date, and daily study time.
              </p>
              <button onClick={handleGenerateRoadmap} disabled={genRoadmap} className="btn-primary"
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', fontSize:14 }}>
                {genRoadmap ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                {genRoadmap ? 'Generating…' : 'Generate My Roadmap'}
              </button>
            </div>
          ) : (
            <div>
              {/* Overview */}
              <div style={{ padding:'20px', borderRadius:14, background:'rgba(99,102,241,0.08)',
                border:'1px solid rgba(99,102,241,0.2)', marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--color-primary-light)', marginBottom:6 }}>📋 Strategy</p>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{roadmap.overview}</p>
                {roadmap.recommendation && (
                  <p style={{ fontSize:13, color:'var(--text-primary)', marginTop:10, fontWeight:600 }}>
                    🎯 Priority: {roadmap.recommendation}
                  </p>
                )}
              </div>

              {/* Subject cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                {(roadmap.subjects || []).map((sub, i) => {
                  const pct = sub.totalTopics > 0 ? Math.round((sub.completedTopics / sub.totalTopics) * 100) : 0;
                  const colors = ['#8B5CF6','#06B6D4','#10B981','#EC4899','#F59E0B'];
                  const color = colors[i % colors.length];
                  return (
                    <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                      style={{ padding:'20px', borderRadius:14, background:'var(--bg-card)',
                        border:'1px solid var(--border-color)', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color }} />
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, marginTop:4 }}>
                        <div>
                          <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{sub.name}</p>
                          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                            ~{sub.estimatedHours}h · {sub.totalTopics} topics · {sub.priority} priority
                          </p>
                        </div>
                        <span style={{ fontSize:14, fontWeight:800, color }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:'var(--bg-tertiary)', overflow:'hidden', marginBottom:12 }}>
                        <div style={{ height:'100%', width:`${pct}%`, borderRadius:3, background:color }} />
                      </div>
                      {(sub.units || []).slice(0, 3).map((unit, j) => (
                        <div key={j} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, fontSize:12 }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', flexShrink:0,
                            background: unit.status === 'completed' ? '#10B981' : unit.status === 'in_progress' ? color : 'var(--bg-tertiary)',
                            border: unit.status === 'not_started' ? '1px solid var(--border-color)' : 'none' }} />
                          <span style={{ color:'var(--text-secondary)', flex:1 }}>{unit.name}</span>
                          <span style={{ color:'var(--text-muted)' }}>{unit.estimatedHours}h</span>
                        </div>
                      ))}
                      {sub.units?.length > 3 && (
                        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>+{sub.units.length - 3} more units</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROGRESS TAB ── */}
      {activeTab === 'progress' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
          {(summary?.subjects || []).length === 0 ? (
            <div style={{ gridColumn:'1/-1', padding:'48px 24px', borderRadius:14, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', textAlign:'center' }}>
              <BarChart3 size={36} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:14 }} />
              <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No progress tracked yet</p>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>Add subjects and start completing tasks to see progress here.</p>
            </div>
          ) : (
            (summary.subjects || []).map((sub, i) => {
              const colors = ['#8B5CF6','#06B6D4','#10B981','#EC4899','#F59E0B'];
              const color = sub.color || colors[i % colors.length];
              return (
                <div key={i} style={{ padding:'18px', borderRadius:14, background:'var(--bg-card)',
                  border:'1px solid var(--border-color)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <BookOpen size={17} color={color} />
                    </div>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{sub.name}</p>
                  </div>
                  {[
                    { label:'Syllabus', val: 0, color },
                    { label:'Practice', val: 0, color:'#06B6D4' },
                    { label:'Revision', val: 0, color:'#10B981' },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>{row.label}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:row.color }}>{row.val}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:2, background:'var(--bg-tertiary)' }}>
                        <div style={{ height:'100%', width:`${row.val}%`, borderRadius:2, background:row.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── WEAK AREAS TAB ── */}
      {activeTab === 'weak' && (
        <div>
          {weakTopics.length === 0 ? (
            <div style={{ padding:'56px 32px', borderRadius:14, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', textAlign:'center' }}>
              <Trophy size={40} color="#10B981" style={{ opacity:0.5, marginBottom:16 }} />
              <p style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>
                No weak areas detected 🎉
              </p>
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                Take quizzes to help NoteNova detect topics that need more practice.
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {weakTopics.map((w, i) => (
                <motion.div key={w._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                  style={{ padding:'18px 20px', borderRadius:14, background:'var(--bg-card)',
                    border:'1px solid rgba(244,63,94,0.15)' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <AlertCircle size={15} color="#F43F5E" />
                        <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{w.topic}</p>
                        {w.subject && (
                          <span style={{ fontSize:11, color:'#06B6D4', background:'#06B6D415', padding:'2px 7px', borderRadius:5, fontWeight:600 }}>
                            {w.subject}
                          </span>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text-muted)' }}>
                        <span>Quiz accuracy: <strong style={{ color:'#F43F5E' }}>{w.quizAccuracy}%</strong></span>
                        <span>Missed {w.missCount} time{w.missCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
                      <Link href={`/dashboard/generate?subject=${encodeURIComponent(w.subject || '')}`}
                        className="btn-secondary"
                        style={{ fontSize:12, padding:'7px 12px', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
                        <Wand2 size={12} /> Learn Again
                      </Link>
                      <Link href="/dashboard/quiz" className="btn-primary"
                        style={{ fontSize:12, padding:'7px 12px', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
                        <Brain size={12} /> Practice
                      </Link>
                      <button onClick={async () => {
                        await api.patch(`/journey/weak-topics/${w._id}/resolve`);
                        setWeakTopics(prev => prev.filter(t => t._id !== w._id));
                      }}
                        style={{ fontSize:12, padding:'7px 12px', borderRadius:9, border:'1px solid var(--border-color)',
                          background:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:5 }}>
                        <CheckCircle2 size={12} /> Resolved
                      </button>
                    </div>
                  </div>
                  {/* Mistakes */}
                  {w.mistakes?.length > 0 && (
                    <details style={{ marginTop:12 }}>
                      <summary style={{ fontSize:12, color:'var(--text-muted)', cursor:'pointer', fontWeight:600 }}>
                        View {w.mistakes.length} mistake{w.mistakes.length !== 1 ? 's' : ''}
                      </summary>
                      <div style={{ marginTop:8, padding:'10px 12px', borderRadius:8,
                        background:'var(--bg-tertiary)', fontSize:12 }}>
                        {w.mistakes.slice(0, 2).map((m, j) => (
                          <div key={j} style={{ marginBottom:j < 1 ? 10 : 0 }}>
                            <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>Q: {m.question}</p>
                            <p style={{ color:'#F43F5E' }}>Your answer: {m.userAnswer}</p>
                            <p style={{ color:'#10B981' }}>Correct: {m.correctAnswer}</p>
                            {m.explanation && <p style={{ color:'var(--text-muted)', marginTop:3, lineHeight:1.4 }}>💡 {m.explanation}</p>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
