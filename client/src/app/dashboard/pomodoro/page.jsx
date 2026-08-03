'use client';


export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle2, Coffee, Brain, Clock, Flame, BarChart3 } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const MODES = [
  { id: 'pomodoro', label: 'Focus', duration: 25 * 60, color: '#6366F1', icon: Brain },
  { id: 'short',   label: 'Short Break', duration: 5 * 60,  color: '#10B981', icon: Coffee },
  { id: 'long',    label: 'Long Break',  duration: 15 * 60, color: '#06B6D4', icon: Coffee },
];

function fmt(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function PomodoroPage() {
  const [modeIdx,   setModeIdx]   = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(MODES[0].duration);
  const [running,   setRunning]   = useState(false);
  const [completed, setCompleted] = useState(0); // pomodoros done this session
  const [subject,   setSubject]   = useState('');
  const [stats,     setStats]     = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const intervalRef = useRef(null);
  const { toast } = useToast();

  const mode = MODES[modeIdx];
  const progress = ((mode.duration - timeLeft) / mode.duration) * 100;
  const circumference = 2 * Math.PI * 110;

  useEffect(() => {
    api.get('/pomodoro/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoadingStats(false));
  }, []);

  // Update document title
  useEffect(() => {
    document.title = running ? `${fmt(timeLeft)} — ${mode.label} | NoteNova` : 'Pomodoro | NoteNova';
    return () => { document.title = 'NoteNova AI'; };
  }, [timeLeft, running, mode.label]);

  const handleComplete = useCallback(async () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    if (modeIdx === 0) {
      // Completed a focus session
      setCompleted(c => c + 1);
      try {
        await api.post('/pomodoro/session', { durationMinutes: 25, subject });
        // Refresh stats after logging
        api.get('/pomodoro/stats').then(r => setStats(r.data)).catch(() => {});
        toast({ message: '🎉 Focus session complete! Great work!', type: 'success' });
      } catch {}
      // Auto-suggest break
      setModeIdx(completed > 0 && (completed + 1) % 4 === 0 ? 2 : 1);
    } else {
      toast({ message: 'Break time over — ready to focus again?', type: 'info' });
      setModeIdx(0);
    }
    setTimeLeft(MODES[modeIdx === 0 ? (completed > 0 && (completed + 1) % 4 === 0 ? 2 : 1) : 0].duration);
  }, [modeIdx, completed, subject, toast]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { handleComplete(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  const switchMode = (idx) => {
    setModeIdx(idx);
    setTimeLeft(MODES[idx].duration);
    setRunning(false);
  };

  const reset = () => {
    setTimeLeft(mode.duration);
    setRunning(false);
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 700, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Pomodoro Timer
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
          Stay focused with timed study sessions. 25 min focus → 5 min break.
        </p>
      </motion.div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => switchMode(i)}
            style={{ padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: modeIdx === i ? m.color : 'var(--bg-card)',
              color: modeIdx === i ? 'white' : 'var(--text-muted)',
              border: modeIdx === i ? 'none' : '1px solid var(--border-color)' }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 260, height: 260 }}>
          <svg width="260" height="260" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="130" cy="130" r="110" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
            <motion.circle cx="130" cy="130" r="110" fill="none"
              stroke={mode.color} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progress) / 100}
              strokeLinecap="round"
              transition={{ duration: 0.5 }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {fmt(timeLeft)}
            </span>
            <span style={{ fontSize: 13, color: mode.color, fontWeight: 600 }}>{mode.label}</span>
            {completed > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {Array.from({ length: Math.min(completed, 8) }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1' }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject input */}
      <div style={{ marginBottom: 20 }}>
        <input value={subject} onChange={e => setSubject(e.target.value)}
          placeholder="What are you studying? (optional)"
          style={{ width: '100%', padding: '11px 16px', borderRadius: 12, fontSize: 14,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box' }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 36 }}>
        <button onClick={reset}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid var(--border-color)',
            background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw size={18} />
        </button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setRunning(r => !r)}
          style={{ width: 72, height: 72, borderRadius: '50%', border: 'none',
            background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
            cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: `0 6px 20px ${mode.color}50` }}>
          {running ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
        </motion.button>
        <div style={{ width: 48 }} /> {/* spacer */}
      </div>

      {/* Stats */}
      {!loadingStats && stats && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.07em', marginBottom: 12, textAlign: 'center' }}>Today's Progress</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { icon: Brain,    label: 'Sessions',    value: (stats.today?.completedSessions || 0) + completed, color: '#6366F1' },
              { icon: Clock,    label: 'Min Studied', value: (stats.today?.minutesStudied || 0) + (completed * 25), color: '#10B981' },
              { icon: BarChart3, label: 'This Week',  value: `${Math.round(((stats.past7Days?.totalMinutes || 0) + (completed * 25)) / 60)}h`, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px', borderRadius: 14, background: 'var(--bg-card)',
                border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <s.icon size={18} color={s.color} style={{ marginBottom: 6 }} />
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
