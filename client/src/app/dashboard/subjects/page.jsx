'use client';

import { motion } from 'framer-motion';
import { FolderOpen, Plus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const demoSubjects = [
  { name: 'Computer Science', notes: 0, color: '#8B5CF6' },
  { name: 'Mathematics', notes: 0, color: '#06B6D4' },
  { name: 'Physics', notes: 0, color: '#10B981' },
  { name: 'Biology', notes: 0, color: '#EC4899' },
];

export default function SubjectsPage() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Subjects</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Organize your notes by subject</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {/* Add new */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard style={{
            padding: 28, cursor: 'pointer', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 140, border: '2px dashed var(--border-color)',
          }}>
            <Plus size={24} color="var(--text-muted)" />
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>Add Subject</p>
          </GlassCard>
        </motion.div>

        {demoSubjects.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard style={{ padding: 28, cursor: 'pointer' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <FolderOpen size={24} color={s.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.notes} notes</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
