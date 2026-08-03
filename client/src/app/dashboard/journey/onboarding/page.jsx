'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ChevronRight, ChevronLeft, Check, Plus, X,
  GraduationCap, CalendarDays, Target, Clock, BookOpen, Loader2,
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const STEPS = ['course', 'subjects', 'exam', 'preferences', 'done'];

const GOALS = [
  { id: 'pass',     label: 'Pass the exam',      emoji: '✅', desc: 'Safe passing marks' },
  { id: 'score60',  label: 'Score 60+ marks',    emoji: '📈', desc: 'Above average performance' },
  { id: 'score75',  label: 'Score 75+ marks',    emoji: '🎯', desc: 'Good performance' },
  { id: 'maximize', label: 'Maximum marks',      emoji: '🏆', desc: 'Top of the class' },
];

const PREP_LEVELS = [
  { id: 'not_started', label: 'Not started',        emoji: '🌱' },
  { id: 'beginner',    label: 'Just beginning',     emoji: '📖' },
  { id: 'partial',     label: 'Partially prepared', emoji: '📚' },
  { id: 'mostly',      label: 'Mostly prepared',    emoji: '🚀' },
];

const TIME_OPTIONS = [
  { mins: 30,  label: '30 minutes' },
  { mins: 60,  label: '1 hour' },
  { mins: 90,  label: '1.5 hours' },
  { mins: 120, label: '2 hours' },
  { mins: 180, label: '3 hours' },
  { mins: 240, label: '4+ hours' },
];

const SUBJECT_COLORS = [
  '#8B5CF6','#06B6D4','#10B981','#EC4899',
  '#F59E0B','#F43F5E','#6366F1','#14B8A6',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [course,      setCourse]      = useState('');
  const [university,  setUniversity]  = useState('');
  const [branch,      setBranch]      = useState('');
  const [semester,    setSemester]    = useState('');
  const [subjects,    setSubjects]    = useState([]);
  const [subjectInput,setSubjectInput]= useState('');
  const [examName,    setExamName]    = useState('');
  const [examDate,    setExamDate]    = useState('');
  const [goal,        setGoal]        = useState('score75');
  const [prepLevel,   setPrepLevel]   = useState('beginner');
  const [dailyTime,   setDailyTime]   = useState(120);

  const addSubject = () => {
    const name = subjectInput.trim();
    if (!name || subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setSubjects(prev => [...prev, {
      name,
      color: SUBJECT_COLORS[prev.length % SUBJECT_COLORS.length],
      units: [],
      priority: 1,
      order: prev.length,
    }]);
    setSubjectInput('');
  };

  const removeSubject = (name) => setSubjects(prev => prev.filter(s => s.name !== name));

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.put('/journey/profile', {
        course, university, branch, semester,
        subjects,
        examName, examDate: examDate || null,
        studyGoal: goal,
        prepLevel,
        dailyStudyTime: dailyTime,
        onboardingDone: true,
      });
      toast({ message: 'Study profile saved! Generating your roadmap…', type: 'success' });
      router.push('/dashboard/journey');
    } catch (err) {
      toast({ message: 'Failed to save profile', type: 'error' });
    }
    setSaving(false);
  };

  const canNext = () => {
    if (step === 1) return subjects.length > 0;
    return true;
  };

  const next = () => { if (step < STEPS.length - 1) setStep(s => s + 1); };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Set up your Study Journey
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Answer a few questions so NoteNova can create your personalized study roadmap
          </p>
        </motion.div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 2 }} />
        </div>

        {/* Step cards */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
            style={{ background: 'var(--bg-secondary)', borderRadius: 20,
              border: '1px solid var(--border-color)', padding: 32 }}>

            {/* Step 0: Course info */}
            {step === 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <GraduationCap size={22} color="#8B5CF6" />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Academic Info</h2>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>Optional</span>
                </div>
                {[
                  { label: 'Course / Degree', val: course, set: setCourse, placeholder: 'e.g. B.Tech, B.Sc, MBA' },
                  { label: 'University', val: university, set: setUniversity, placeholder: 'e.g. Mumbai University' },
                  { label: 'Branch / Specialization', val: branch, set: setBranch, placeholder: 'e.g. Computer Engineering' },
                  { label: 'Semester', val: semester, set: setSemester, placeholder: 'e.g. 4th Semester' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 11, fontSize: 14,
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Subjects */}
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <BookOpen size={22} color="#8B5CF6" />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Your Subjects</h2>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#F43F5E', fontWeight: 600 }}>Required</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Add all subjects you need to study for your exam</p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input value={subjectInput} onChange={e => setSubjectInput(e.target.value)}
                    placeholder="e.g. Computer Networks, Mathematics, Physics"
                    onKeyDown={e => e.key === 'Enter' && addSubject()}
                    style={{ flex: 1, padding: '11px 14px', borderRadius: 11, fontSize: 14,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                  <button onClick={addSubject} className="btn-primary"
                    style={{ padding: '11px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> Add
                  </button>
                </div>

                {subjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    Add at least one subject to continue
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {subjects.map(s => (
                      <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 11,
                        background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                        <button onClick={() => removeSubject(s.name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Exam details */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <CalendarDays size={22} color="#8B5CF6" />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Exam Details</h2>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>Optional</span>
                </div>
                {[
                  { label: 'Exam Name', val: examName, set: setExamName, placeholder: 'e.g. Semester End Exam, GATE 2025', type: 'text' },
                  { label: 'Exam Date', val: examDate, set: setExamDate, placeholder: '', type: 'date' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      min={f.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 11, fontSize: 14,
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                  </div>
                ))}

                {examDate && (
                  <div style={{ padding: '12px 16px', borderRadius: 11, background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, color: 'var(--color-primary-light)' }}>
                    📅 {Math.ceil((new Date(examDate) - new Date()) / 86400000)} days until your exam
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <Target size={22} color="#8B5CF6" />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Study Preferences</h2>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                    What is your study goal?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {GOALS.map(g => (
                      <button key={g.id} onClick={() => setGoal(g.id)}
                        style={{ padding: '12px 14px', borderRadius: 11, border: 'none', cursor: 'pointer',
                          background: goal === g.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                          border: goal === g.id ? '2px solid rgba(99,102,241,0.5)' : '1px solid var(--border-color)',
                          textAlign: 'left', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{g.emoji}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: goal === g.id ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>{g.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                    Current preparation level
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PREP_LEVELS.map(p => (
                      <button key={p.id} onClick={() => setPrepLevel(p.id)}
                        style={{ padding: '10px 14px', borderRadius: 11, border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: prepLevel === p.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                          border: prepLevel === p.id ? '2px solid rgba(99,102,241,0.5)' : '1px solid var(--border-color)',
                          transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 16 }}>{p.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: prepLevel === p.id ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                    <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                    Daily study time available
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {TIME_OPTIONS.map(t => (
                      <button key={t.mins} onClick={() => setDailyTime(t.mins)}
                        style={{ padding: '9px 14px', borderRadius: 11, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          background: dailyTime === t.mins ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                          border: dailyTime === t.mins ? '2px solid rgba(99,102,241,0.5)' : '1px solid var(--border-color)',
                          color: dailyTime === t.mins ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                          transition: 'all 0.15s' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check size={32} color="#10B981" />
                </motion.div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Ready to generate your roadmap!
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                  NoteNova will create a personalized study plan with daily tasks, progress tracking, and smart recommendations based on your profile.
                </p>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 24 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Profile Summary</p>
                  {[
                    { label: 'Subjects', value: subjects.map(s => s.name).join(', ') || 'None' },
                    { label: 'Exam', value: examName || 'Not set' },
                    { label: 'Exam Date', value: examDate ? new Date(examDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set' },
                    { label: 'Daily Time', value: TIME_OPTIONS.find(t => t.mins === dailyTime)?.label || `${dailyTime} mins` },
                    { label: 'Goal', value: GOALS.find(g => g.id === goal)?.label || goal },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: 220, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          {step > 0 ? (
            <button onClick={back} className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', fontSize: 14 }}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!canNext()} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 24px', fontSize: 14,
                opacity: canNext() ? 1 : 0.5 }}>
              {step === 0 && subjects.length === 0 ? 'Skip for now' : 'Continue'} <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 28px', fontSize: 15,
                background: 'linear-gradient(135deg,#10B981,#059669)' }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
              {saving ? 'Saving…' : 'Start My Journey 🚀'}
            </button>
          )}
        </div>

        {step < STEPS.length - 1 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            Step {step + 1} of {STEPS.length - 1} · You can edit this later in Settings
          </p>
        )}
      </div>
    </div>
  );
}
