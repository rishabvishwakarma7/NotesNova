'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, Square, Crown, Flame, Target, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const DURATIONS = [
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
];

const QUOTES = [
  'Focus is the art of knowing what to ignore.',
  'Small steps every day lead to big results.',
  'Your only competition is who you were yesterday.',
  'Consistency beats intensity every time.',
  'The secret of getting ahead is getting started.',
];

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusPage() {
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState('dashboard'); // dashboard | setup | session | result
  const [duration,  setDuration]  = useState(25);
  const [subject,   setSubject]   = useState('');
  const [goal,      setGoal]      = useState('');
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [quitting,  setQuitting]  = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  useEffect(() => {
    api.get('/premium/status').then(r => {
      setIsPremium(r.data?.isPremium || false);
    }).catch(() => setIsPremium(false)).finally(() => setLoading(false));
  }, []);

  const startSession = () => {
    setTimeLeft(duration * 60);
    startTimeRef.current = Date.now();
    setView('session');
    setPaused(false);
  };

  useEffect(() => {
    if (view !== 'session' || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishSession(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view, paused]);

  const finishSession = (completed = true) => {
    clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000);
    setSessionResult({ completed, minutes: elapsed, duration });
    setView('result');
  };

  const totalSecs = duration * 60;
  const progress = timeLeft > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0;
  const circumference = 2 * Math.PI * 90;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 size={28} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── NOT PREMIUM ──
  if (!isPremium) return (
    <div style={{ padding: '40px 20px', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,#F59E0B,#FBBF24)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        boxShadow: '0 8px 32px rgba(245,158,11,0.4)' }}>
        <Crown size={36} color="white" />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        Focus Lock is a Premium Feature
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
        Upgrade to NoteNova Premium for ₹99 (lifetime) to unlock Focus Lock, unlimited study sessions, AI analytics and more.
      </p>
      <Link href="/dashboard/premium" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 32px', borderRadius: 14, textDecoration: 'none', color: 'white', fontWeight: 800, fontSize: 15,
        background: 'linear-gradient(135deg,#F59E0B,#FBBF24)', boxShadow: '0 6px 24px rgba(245,158,11,0.45)' }}>
        <Crown size={18} /> Upgrade to Premium — ₹99
      </Link>
    </div>
  );

  // ── SESSION ──
  if (view === 'session') return (
    <div style={{ padding: '40px 20px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {subject && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{subject}</p>}
      {goal && <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary-light)', marginBottom: 24 }}>{goal}</p>}

      {/* Circular progress */}
      <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 32px' }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="110" cy="110" r="90" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
          <circle cx="110" cy="110" r="90" fill="none" stroke="#8B5CF6" strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {paused ? 'Paused' : 'Focusing'}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: 32, maxWidth: 340, margin: '0 auto 32px', lineHeight: 1.6 }}>
        "{quote}"
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setPaused(p => !p)}
          style={{ padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            background: 'var(--bg-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7,
            border: '1px solid var(--border-color)' }}>
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={() => setQuitting(true)}
          style={{ padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            background: 'rgba(244,63,94,0.1)', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Square size={16} /> End
        </button>
      </div>

      {/* Anti-quit modal */}
      <AnimatePresence>
        {quitting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setQuitting(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: 28, maxWidth: 360, width: '100%',
                border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontSize: 22 }}>⚠️</p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Are you sure?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                Leaving early reduces your Focus Score. Stay focused — you're doing great!
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setQuitting(false)}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                    background: 'var(--gradient-primary)', color: 'white', fontSize: 14, fontWeight: 700 }}>
                  Continue Studying 💪
                </button>
                <button onClick={() => { setQuitting(false); finishSession(false); }}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 11, cursor: 'pointer',
                    background: 'transparent', color: '#F43F5E', fontSize: 13, fontWeight: 600,
                    border: '1px solid rgba(244,63,94,0.3)' }}>
                  End Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── RESULT ──
  if (view === 'result' && sessionResult) return (
    <div style={{ padding: '40px 20px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
          background: sessionResult.completed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${sessionResult.completed ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
          {sessionResult.completed ? <CheckCircle2 size={36} color="#10B981" /> : <Clock size={36} color="#F59E0B" />}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          {sessionResult.completed ? 'Session Complete! 🎉' : 'Session Ended Early'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          You focused for <strong style={{ color: 'var(--color-primary-light)' }}>{sessionResult.minutes} minutes</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setView('setup'); }}
            style={{ padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'var(--gradient-primary)', color: 'white', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 7 }}>
            <Play size={15} /> New Session
          </button>
          <button onClick={() => setView('dashboard')}
            style={{ padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Dashboard
          </button>
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── SETUP ──
  if (view === 'setup') return (
    <div style={{ padding: '28px 20px', maxWidth: 520, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <button onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>New Focus Session</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
            Duration
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                style={{ padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: duration === d.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                  color: duration === d.value ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                  outline: duration === d.value ? '1.5px solid rgba(99,102,241,0.4)' : '1px solid var(--border-color)' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        {[
          { label: 'Subject (optional)', key: 'subject', placeholder: 'e.g. Computer Networks' },
          { label: 'Session Goal (optional)', key: 'goal', placeholder: 'e.g. Complete Unit 3 revision' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, display: 'block' }}>{f.label}</label>
            <input value={f.key === 'subject' ? subject : goal}
              onChange={e => f.key === 'subject' ? setSubject(e.target.value) : setGoal(e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 11, fontSize: 14,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        ))}
        <button onClick={startSession} style={{ padding: '14px 0', borderRadius: 13, border: 'none', cursor: 'pointer',
          background: 'var(--gradient-primary)', color: 'white', fontSize: 16, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
          <Play size={18} /> Start {duration}-Minute Session
        </button>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  return (
    <div style={{ padding: '28px 20px', maxWidth: 900, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Timer size={24} color="#8B5CF6" /> Focus Mode
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Premium · Android Productivity Feature</p>
        </div>
        <button onClick={() => setView('setup')}
          style={{ padding: '12px 24px', borderRadius: 13, border: 'none', cursor: 'pointer',
            background: 'var(--gradient-primary)', color: 'white', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
          <Play size={15} /> Start Focus Session
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: Clock,        label: "Today's Focus",  value: '—',  color: '#6366F1' },
          { icon: Flame,        label: 'Current Streak', value: '—',  color: '#F43F5E' },
          { icon: CheckCircle2, label: 'Sessions Done',  value: '0',  color: '#10B981' },
          { icon: Target,       label: 'Focus Score',    value: '—',  color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={17} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '28px', borderRadius: 20, background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to focus?</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Start a session to block distractions and track your study time.
        </p>
        <button onClick={() => setView('setup')}
          style={{ padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'var(--gradient-primary)', color: 'white', fontSize: 14, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Play size={15} /> Start Your First Session
        </button>
      </div>
    </div>
  );
}
