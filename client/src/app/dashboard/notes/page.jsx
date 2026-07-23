'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, FolderOpen, Pin } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';

const demoNotes = [
  { id: '1', title: 'Getting Started with NoteNova', subject: 'Tutorial', tags: ['guide'], updatedAt: new Date(), isPinned: true },
  { id: '2', title: 'Welcome to your workspace', subject: 'General', tags: ['welcome'], updatedAt: new Date(), isPinned: false },
];

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [notes] = useState(demoNotes);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 32, flexWrap: 'wrap', gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            My Notes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{notes.length} notes</p>
        </div>
        <Link href="/dashboard/notes/new" className="btn-primary" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', padding: '12px 24px', fontSize: 14,
        }}>
          <Plus size={18} /> New Note
        </Link>
      </motion.div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 18px', borderRadius: 14,
        background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
        marginBottom: 28,
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 15, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Notes grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {filtered.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/dashboard/notes/${note.id}`} style={{ textDecoration: 'none' }}>
              <GlassCard style={{ padding: 24, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(139,92,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={20} color="#8B5CF6" />
                  </div>
                  {note.isPinned && <Pin size={14} color="#F59E0B" />}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {note.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: 'rgba(6,182,212,0.1)', color: '#06B6D4',
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {note.subject}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {note.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          color: 'var(--text-muted)',
        }}>
          <FileText size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            No notes yet
          </h3>
          <p>Create your first note or generate one with AI!</p>
        </div>
      )}
    </div>
  );
}
