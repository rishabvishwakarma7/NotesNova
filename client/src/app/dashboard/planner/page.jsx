'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Sparkles, Loader2, Plus, Clock, BookOpen, Target,
  Coffee, CheckCircle2, ChevronDown, ChevronUp, Trash2, ArrowLeft,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const typeConfig = {
  study: { icon: BookOpen, color: '#8B5CF6', label: 'Study' },
  practice: { icon: Target, color: '#06B6D4', label: 'Practice' },
  revision: { icon: Clock, color: '#EC4899', label: 'Revision' },
  break: { icon: Coffee, color: '#10B981', label: 'Break' },
};

export default function PlannerPage() {
  const [view, setView] = useState('list');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plan, setPlan] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const searchParams = useSearchParams();

  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState([]);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadPlans(); }, []);

  // Fix #4: Load plan from URL param ?id=xxx
  useEffect(() => {
    const id = searchParams?.get('id');
    if (id && plans.length > 0) {
      handleLoadPlan(id);
    }
  }, [searchParams, plans.length]);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get('/planner');
      setPlans(res.data || []);
    } catch { setPlans([]); }
    setLoadingPlans(false);
  };

  const addSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput('');
    }
  };

  const addTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleGenerate = async () => {
    if (!examDate || (subjects.length === 0 && topics.length === 0)) return;
    setLoading(true);
    try {
      const res = await api.post('/planner/generate', {
        title: title || 'Study Plan',
        examDate,
        subjects,
        topics,
        hoursPerDay,
      });
      setPlan(res.data);
      setExpandedDays(new Set([0]));
      setView('detail');
      loadPlans();
    } catch (err) {
      toast({ message: err.response?.data?.error || 'Failed to generate plan', type: 'error' });
    }
    setLoading(false);
  };

  const handleLoadPlan = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/planner/${id}`);
      setPlan(res.data);
      setExpandedDays(new Set([0]));
      setView('detail');
    } catch {
      toast({ message: 'Failed to load plan', type: 'error' });
    }
    setLoading(false);
  };

  const handleToggleTask = async (dayIndex, taskIndex) => {
    if (!plan) return;
    const task = plan.plan[dayIndex].tasks[taskIndex];
    const newCompleted = !task.completed;

    // Optimistic update
    const updated = { ...plan };
    updated.plan[dayIndex].tasks[taskIndex].completed = newCompleted;
    setPlan({ ...updated });

    try {
      await api.patch(`/planner/${plan._id}/tasks/${dayIndex}/${taskIndex}`, {
        completed: newCompleted,
      });
    } catch {
      // Revert
      updated.plan[dayIndex].tasks[taskIndex].completed = !newCompleted;
      setPlan({ ...updated });
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await api.delete(`/planner/${id}`);
      setPlans(plans.filter(p => p._id !== id));
      if (plan?._id === id) {
        setPlan(null);
        setView('list');
      }
    } catch {}
  };

  const toggleDay = (idx) => {
    const next = new Set(expandedDays);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedDays(next);
  };

  // ────── LIST VIEW ──────
  if (view === 'list') {
    return (
      <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              <CalendarDays size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />
              AI Study Planner
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Create AI-powered study schedules for your exams.</p>
          </div>
          <button
            onClick={() => setView('create')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14 }}
          >
            <Plus size={18} /> New Plan
          </button>
        </motion.div>

        {loadingPlans ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
          </div>
        ) : plans.length === 0 ? (
          <GlassCard style={{ padding: 60, textAlign: 'center' }}>
            <CalendarDays size={48} style={{ opacity: 0.3, marginBottom: 16, margin: '0 auto 16px' }} color="var(--text-muted)" />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No study plans yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Create your first AI-powered study plan to ace your exams!</p>
            <button onClick={() => setView('create')} className="btn-primary" style={{
              padding: '12px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <Sparkles size={16} /> Create Plan
            </button>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {plans.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard style={{ padding: 24, cursor: 'pointer' }} onClick={() => handleLoadPlan(p._id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{p.title}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {p.subjects.map(s => (
                          <span key={s} style={{
                            padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            background: 'rgba(139,92,246,0.1)', color: '#A78BFA',
                          }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                        <span>📅 Exam: {new Date(p.examDate).toLocaleDateString()}</span>
                        <span>📋 {p.totalDays} days</span>
                        <span>✅ {p.completedTasks}/{p.totalTasks} tasks</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Progress ring */}
                      <div style={{ position: 'relative', width: 52, height: 52 }}>
                        <svg width="52" height="52" viewBox="0 0 52 52">
                          <circle cx="26" cy="26" r="22" fill="none" stroke="var(--border-color)" strokeWidth="4" />
                          <circle cx="26" cy="26" r="22" fill="none" stroke="#8B5CF6" strokeWidth="4"
                            strokeDasharray={`${(p.progress / 100) * 138.2} 138.2`}
                            strokeLinecap="round"
                            transform="rotate(-90 26 26)"
                          />
                        </svg>
                        <span style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
                        }}>{p.progress}%</span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeletePlan(p._id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ────── CREATE VIEW ──────
  if (view === 'create') {
    return (
      <div style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
        <button onClick={() => setView('list')} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, marginBottom: 24,
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Create Study Plan
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Let AI create a personalized study schedule for you.
          </p>
        </motion.div>

        <GlassCard style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Plan Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Final Exams Prep"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Exam Date *</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Subjects *</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={subjectInput} onChange={e => setSubjectInput(e.target.value)}
                  placeholder="Add a subject..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                />
                <button onClick={addSubject} className="btn-secondary" style={{ padding: '10px 16px', fontSize: 13 }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {subjects.map(s => (
                  <span key={s} style={{
                    padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(139,92,246,0.1)', color: '#A78BFA',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {s}
                    <button onClick={() => setSubjects(subjects.filter(x => x !== s))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A78BFA', fontSize: 14, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Topics (optional)</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={topicInput} onChange={e => setTopicInput(e.target.value)}
                  placeholder="Add a topic..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                />
                <button onClick={addTopic} className="btn-secondary" style={{ padding: '10px 16px', fontSize: 13 }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {topics.map(t => (
                  <span key={t} style={{
                    padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(6,182,212,0.1)', color: '#06B6D4',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {t}
                    <button onClick={() => setTopics(topics.filter(x => x !== t))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#06B6D4', fontSize: 14, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Hours per day: {hoursPerDay}
              </label>
              <input type="range" min={1} max={10} value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8B5CF6' }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!examDate || (subjects.length === 0 && topics.length === 0) || loading}
              className="btn-primary"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 15, padding: '14px 32px', width: '100%',
                opacity: examDate && (subjects.length > 0 || topics.length > 0) ? 1 : 0.5,
              }}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating Plan...</>
                : <><Sparkles size={18} /> Generate Study Plan</>
              }
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ────── DETAIL VIEW ──────
  if (view === 'detail' && plan) {
    const totalTasks = plan.plan.reduce((s, d) => s + d.tasks.length, 0);
    const completedTasks = plan.plan.reduce((s, d) => s + d.tasks.filter(t => t.completed).length, 0);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        <button onClick={() => { setView('list'); loadPlans(); }} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, marginBottom: 24,
        }}>
          <ArrowLeft size={16} /> Back to Plans
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <GlassCard style={{ padding: 28, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{plan.title}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {plan.subjects.map(s => (
                    <span key={s} style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: 'rgba(139,92,246,0.1)', color: '#A78BFA',
                    }}>{s}</span>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  📅 Exam: {new Date(plan.examDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  &nbsp;•&nbsp;{plan.plan.length} days&nbsp;•&nbsp;{plan.hoursPerDay}h/day
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 64, height: 64 }}>
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-color)" strokeWidth="5" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#8B5CF6" strokeWidth="5"
                      strokeDasharray={`${(progress / 100) * 175.9} 175.9`}
                      strokeLinecap="round" transform="rotate(-90 32 32)"
                    />
                  </svg>
                  <span style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: 'var(--text-primary)',
                  }}>{progress}%</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </GlassCard>

          {/* Jump to Today */}
          {plan.plan.some(d => new Date(d.date).toDateString() === new Date().toDateString()) && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
              <button onClick={() => {
                const idx = plan.plan.findIndex(d => new Date(d.date).toDateString() === new Date().toDateString());
                if (idx >= 0) {
                  document.getElementById(`day-${idx}`)?.scrollIntoView({ behavior:'smooth', block:'center' });
                  setExpandedDays(prev => new Set([...prev, idx]));
                }
              }} className="btn-secondary" style={{ fontSize:12, padding:'7px 14px', display:'flex', alignItems:'center', gap:6 }}>
                📅 Jump to Today
              </button>
            </div>
          )}

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 19, top: 0, bottom: 0, width: 2,
              background: 'var(--border-color)',
            }} />

            {plan.plan.map((day, dayIdx) => {
              const dayCompleted = day.tasks.filter(t => t.completed).length;
              const dayTotal = day.tasks.length;
              const isExpanded = expandedDays.has(dayIdx);
              const isToday = new Date(day.date).toDateString() === new Date().toDateString();
              const isPast = new Date(day.date) < new Date() && !isToday;

              return (
                <motion.div
                  key={dayIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dayIdx * 0.03 }}
                  style={{ marginBottom: 12, paddingLeft: 48, position: 'relative' }}
                  id={`day-${dayIdx}`}
                >
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: 12, top: 16,
                    width: 16, height: 16, borderRadius: '50%',
                    background: dayCompleted === dayTotal && dayTotal > 0 ? '#10B981' :
                      isToday ? '#8B5CF6' : isPast ? 'var(--text-muted)' : 'var(--bg-tertiary)',
                    border: `2px solid ${isToday ? '#8B5CF6' : 'var(--border-color)'}`,
                    zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {dayCompleted === dayTotal && dayTotal > 0 && <CheckCircle2 size={10} color="white" />}
                  </div>

                  <GlassCard style={{ padding: 0, overflow: 'hidden' }} hover={false}>
                    {/* Day header */}
                    <button
                      onClick={() => toggleDay(dayIdx)}
                      style={{
                        width: '100%', padding: '14px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isToday ? 'rgba(139,92,246,0.06)' : 'transparent',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: isToday ? '#8B5CF6' : 'var(--text-primary)' }}>
                          Day {day.day}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {isToday && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            background: 'rgba(139,92,246,0.15)', color: '#8B5CF6',
                          }}>TODAY</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dayCompleted}/{dayTotal}</span>
                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </div>
                    </button>

                    {/* Tasks */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {day.tasks.map((task, taskIdx) => {
                              const cfg = typeConfig[task.type] || typeConfig.study;
                              const Icon = cfg.icon;
                              return (
                                <div
                                  key={taskIdx}
                                  onClick={() => handleToggleTask(dayIdx, taskIdx)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', borderRadius: 10,
                                    background: task.completed ? 'rgba(16,185,129,0.05)' : 'var(--bg-tertiary)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    opacity: task.completed ? 0.7 : 1,
                                  }}
                                >
                                  <div style={{
                                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                    border: task.completed ? 'none' : `2px solid ${cfg.color}40`,
                                    background: task.completed ? '#10B981' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                  }}>
                                    {task.completed && <CheckCircle2 size={14} color="white" />}
                                  </div>
                                  <Icon size={16} color={cfg.color} />
                                  <div style={{ flex: 1 }}>
                                    <p style={{
                                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                                      textDecoration: task.completed ? 'line-through' : 'none',
                                    }}>
                                      {task.topic}
                                    </p>
                                    {task.subject && (
                                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.subject}</p>
                                    )}
                                  </div>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                    background: `${cfg.color}10`, color: cfg.color,
                                  }}>{task.duration}</span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
