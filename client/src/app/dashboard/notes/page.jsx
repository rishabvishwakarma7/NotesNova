'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Pin, Trash2, Loader2, BookOpen, SortAsc, Filter, SortDesc } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const TYPE_COLORS = {
  detailed: '#8B5CF6', short: '#06B6D4', bullet: '#10B981',
  exam: '#F59E0B', revision: '#EC4899', custom: '#64748B',
  flashcards: '#8B5CF6', mcq: '#F43F5E', viva: '#14B8A6',
  definitions: '#6366F1',
};

const SORT_OPTIONS = [
  { id: 'updatedAt-desc', label: 'Recently Updated' },
  { id: 'updatedAt-asc',  label: 'Oldest First' },
  { id: 'title-asc',     label: 'A → Z' },
  { id: 'title-desc',    label: 'Z → A' },
];

export default function NotesPage() {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deleting, setDeleting] = useState(null);
  const [sort, setSort]         = useState('updatedAt-desc');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType]       = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const { toast } = useToast();

  const loadNotes = async () => {
    try { const res = await api.get('/notes'); setNotes(res.data || []); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadNotes(); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    setDeleting(id);
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast({ message: 'Note deleted', type: 'success' });
    } catch (err) { toast({ message: 'Failed to delete', type: 'error' }); }
    setDeleting(null);
  };

  const handlePin = async (id, isPinned, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await api.put(`/notes/${id}`, { isPinned: !isPinned });
      setNotes(prev => prev.map(n => n._id === id ? { ...n, isPinned: !isPinned } : n));
      toast({ message: isPinned ? 'Unpinned' : 'Pinned!', type: 'info' });
    } catch (err) { console.error(err); }
  };

  // All unique subjects & types for filter dropdowns
  const subjects = useMemo(() => [...new Set(notes.map(n => n.subject).filter(Boolean))], [notes]);
  const types    = useMemo(() => [...new Set(notes.map(n => n.noteType).filter(Boolean))], [notes]);

  const filtered = useMemo(() => {
    let arr = notes.filter(n => {
      const q = search.toLowerCase();
      const matchSearch = !q || n.title?.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q));
      const matchSubject = !filterSubject || n.subject === filterSubject;
      const matchType    = !filterType    || n.noteType === filterType;
      return matchSearch && matchSubject && matchType;
    });

    const [field, dir] = sort.split('-');
    arr = [...arr].sort((a, b) => {
      if (field === 'title') return dir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      return dir === 'desc' ? new Date(b[field]) - new Date(a[field]) : new Date(a[field]) - new Date(b[field]);
    });
    return arr;
  }, [notes, search, filterSubject, filterType, sort]);

  const pinned   = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>My Notes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {loading ? 'Loading…' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/dashboard/notes/new" className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px', fontSize: 14 }}>
          <Plus size={16} /> New Note
        </Link>
      </motion.div>

      {/* Search + Sort + Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 12, background: 'var(--bg-card)',
          border: '1px solid var(--border-color)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit' }} />
        </div>

        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--bg-card)',
            border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
            fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>

        {subjects.length > 0 && (
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
              fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {types.length > 1 && (
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
              fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loader2 size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(139,92,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <BookOpen size={32} color="#8B5CF6" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {search ? 'No notes found' : 'No notes yet'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
            {search ? `No notes match "${search}"` : 'Create a new note or generate one with AI.'}
          </p>
          {!search && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/dashboard/notes/new" className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px', fontSize: 14 }}>
                <Plus size={16} /> New Note
              </Link>
              <Link href="/dashboard/generate" className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px', fontSize: 14 }}>
                Generate with AI
              </Link>
            </div>
          )}
        </GlassCard>
      ) : (
        <>
          {/* Pinned */}
          {pinned.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12,
                textTransform: 'uppercase', letterSpacing: '0.05em' }}>📌 Pinned</p>
              <NoteGrid notes={pinned} deleting={deleting} onDelete={handleDelete} onPin={handlePin} />
            </div>
          )}
          {/* All */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12,
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>All Notes</p>
              )}
              <NoteGrid notes={unpinned} deleting={deleting} onDelete={handleDelete} onPin={handlePin} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoteGrid({ notes, deleting, onDelete, onPin }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {notes.map((note, i) => {
        const color = TYPE_COLORS[note.noteType] || '#8B5CF6';
        return (
          <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={`/dashboard/notes/${note._id}`} style={{ textDecoration: 'none' }}>
              <GlassCard style={{ padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '16px 16px 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color={color} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.preventDefault()}>
                    <button onClick={e => onPin(note._id, note.isPinned, e)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: note.isPinned ? '#F59E0B20' : 'var(--bg-tertiary)',
                        color: note.isPinned ? '#F59E0B' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pin size={13} />
                    </button>
                    <button onClick={e => onDelete(note._id, e)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: 'rgba(244,63,94,0.1)', color: '#F43F5E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {deleting === note._id
                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {note.subject && (
                    <span style={{ fontSize: 11, color: '#06B6D4', background: 'rgba(6,182,212,0.1)',
                      padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{note.subject}</span>
                  )}
                  <span style={{ fontSize: 11, color: color, background: `${color}15`,
                    padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize' }}>{note.noteType}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </GlassCard>
            </Link>
          </motion.div>
        );
      })}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
