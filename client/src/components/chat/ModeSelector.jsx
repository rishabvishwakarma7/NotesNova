'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Code, Search, GraduationCap, Lightbulb } from 'lucide-react';

const modes = [
  { id: 'study', label: 'Study', icon: BookOpen, color: '#8B5CF6' },
  { id: 'coding', label: 'Coding', icon: Code, color: '#06B6D4' },
  { id: 'research', label: 'Research', icon: Search, color: '#10B981' },
  { id: 'exam', label: 'Exam', icon: GraduationCap, color: '#F59E0B' },
  { id: 'simple', label: 'Simple', icon: Lightbulb, color: '#EC4899' },
];

export default function ModeSelector({ mode, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = modes.find(m => m.id === mode) || modes[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary"
        style={{
          padding: '8px 14px', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <current.icon size={14} color={current.color} />
        {current.label}
        <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'absolute', top: '100%', right: 0,
              marginTop: 8, width: 180,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 6,
              zIndex: 20,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => { onSelect(m.id); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: mode === m.id ? `${m.color}15` : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: mode === m.id ? m.color : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
