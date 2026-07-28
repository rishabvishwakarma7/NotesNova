'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Code, Search, GraduationCap, Lightbulb } from 'lucide-react';

const modes = [
  { id: 'study',    label: 'Study',    icon: BookOpen,      color: '#6366F1', desc: 'Understand concepts deeply' },
  { id: 'coding',   label: 'Coding',   icon: Code,          color: '#06B6D4', desc: 'Learn and debug code' },
  { id: 'research', label: 'Research', icon: Search,        color: '#10B981', desc: 'Explore topics in depth' },
  { id: 'exam',     label: 'Exam Prep',icon: GraduationCap, color: '#F59E0B', desc: 'Focus on exam-ready answers' },
  { id: 'simple',   label: 'Simple',   icon: Lightbulb,     color: '#EC4899', desc: 'Beginner-friendly language' },
];

export default function ModeSelector({ mode, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = modes.find(m => m.id === mode) || modes[0];

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px',
          borderRadius: 10, background: `${current.color}15`,
          border: `1px solid ${current.color}35`, cursor: 'pointer',
          color: current.color, fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
        <current.icon size={14} />
        {current.label}
        <ChevronDown size={11} style={{ opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 18 }} onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
              style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 230,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 14, padding: 6, zIndex: 20, boxShadow: 'var(--shadow-lg)' }}>
              {modes.map(m => (
                <button key={m.id} onClick={() => { onSelect(m.id); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '9px 11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: mode === m.id ? `${m.color}12` : 'transparent',
                    transition: 'background 0.12s', textAlign: 'left' }}
                  onMouseEnter={e => { if (mode !== m.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { if (mode !== m.id) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${m.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <m.icon size={14} color={m.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: mode === m.id ? m.color : 'var(--text-primary)', marginBottom: 1 }}>{m.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.desc}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
