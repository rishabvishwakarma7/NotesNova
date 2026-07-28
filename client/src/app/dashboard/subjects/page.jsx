'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, X, FileText, Trash2, Search,
  BookOpen, ChevronRight, ArrowLeft, Loader2, Edit2, Check,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import Link from 'next/link';

const COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#EC4899',
  '#F59E0B', '#F43F5E', '#6366F1', '#14B8A6',
  '#FF6B35', '#3B82F6',
];

export default function SubjectsPage() {
  const [subjects, setSubjects]     = useState([]);   // { name, count, color }
  const [folders, setFolders]       = useState([]);   // from API
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null); // subject name being viewed
  const [notes, setNotes]           = useState([]);   // notes of selected subject
  const [notesLoading, setNotesLoading] = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState('');
  const [newColor, setNewColor]     = useState(COLORS[0]);
  const [adding, setAdding]         = useState(false);
  const [search, setSearch]         = useState('');
  const [editId, setEditId]         = useState(null);
  const [editName, setEditName]     = useState('');
  const [deleting, setDeleting]     = useState(null);

  /* ── Load folders + note counts ── */
  const load = async () => {
    setLoading(true);
    try {
      const [foldersRes, notesRes] = await Promise.all([
        api.get('/folders'),
        api.get('/notes'),
      ]);
      const folderList = foldersRes.data || [];
      const noteList   = notesRes.data  || [];

      setFolders(folderList);

      // Build subjects from unique note subjects + folders
      const subjectMap = {};

      // Count notes per subject string
      noteList.forEach(n => {
        const s = n.subject?.trim();
        if (s) {
          if (!subjectMap[s]) subjectMap[s] = { name: s, count: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)], fromFolder: false };
          subjectMap[s].count++;
        }
      });

      // Merge folders (user-created subjects)
      folderList.forEach(f => {
        const key = f.folderName;
        if (!subjectMap[key]) subjectMap[key] = { name: key, count: 0, color: f.color, fromFolder: true, folderId: f._id };
        else { subjectMap[key].color = f.color; subjectMap[key].fromFolder = true; subjectMap[key].folderId = f._id; }
      });

      setSubjects(Object.values(subjectMap).sort((a, b) => b.count - a.count));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* ── Load notes for a subject ── */
  const openSubject = async (name) => {
    setSelected(name);
    setNotesLoading(true);
    try {
      const res = await api.get('/notes');
      const all = res.data || [];
      setNotes(all.filter(n => n.subject?.trim() === name));
    } catch { setNotes([]); }
    setNotesLoading(false);
  };

  /* ── Add subject (as folder) ── */
  const addSubject = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await api.post('/folders', { folderName: newName.trim(), color: newColor });
      setNewName(''); setShowAdd(false);
      await load();
    } catch (err) { console.error(err); }
    setAdding(false);
  };

  /* ── Delete folder-backed subject ── */
  const deleteSubject = async (folderId, e) => {
    e.stopPropagation();
    setDeleting(folderId);
    try {
      await api.delete(`/folders/${folderId}`);
      await load();
    } catch (err) { console.error(err); }
    setDeleting(null);
  };

  /* ── Rename folder ── */
  const saveRename = async (folderId, e) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    try {
      await api.put(`/folders/${folderId}`, { folderName: editName.trim() });
      setEditId(null);
      await load();
    } catch (err) { console.error(err); }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Subject detail view ── */
  if (selected) {
    const subj = subjects.find(s => s.name === selected);
    return (
      <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setSelected(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={16} /> Back to Subjects
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${subj?.color || '#8B5CF6'}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FolderOpen size={28} color={subj?.color || '#8B5CF6'} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{selected}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
                {notesLoading ? 'Loading…' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {notesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Loader2 size={28} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : notes.length === 0 ? (
            <GlassCard style={{ padding: 48, textAlign: 'center' }}>
              <BookOpen size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No notes yet</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                Generate or create notes and assign them to <strong>{selected}</strong>
              </p>
              <Link href="/dashboard/generate" className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px' }}>
                <Plus size={16} /> Generate Notes
              </Link>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {notes.map((note, i) => (
                <motion.div key={note._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/dashboard/notes/${note._id}`} style={{ textDecoration: 'none' }}>
                    <GlassCard style={{ padding: 20, cursor: 'pointer', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                            marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {note.title}
                          </p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: subj?.color || '#8B5CF6',
                              background: `${subj?.color || '#8B5CF6'}15`,
                              padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
                              {note.noteType}
                            </span>
                            {note.tags?.slice(0, 2).map(t => (
                              <span key={t} style={{ fontSize: 11, color: 'var(--text-muted)',
                                background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <FileText size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                        {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  /* ── Main subjects grid ── */
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Subjects</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Organize your notes by subject</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
            <Plus size={16} /> Add Subject
          </button>
        </div>

        {/* Search */}
        {subjects.length > 0 && (
          <div style={{ position: 'relative', marginTop: 20 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search subjects…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '11px 16px 11px 42px', borderRadius: 12, fontSize: 14,
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}
      </motion.div>

      {/* Add subject modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 420, background: 'var(--bg-secondary)',
                borderRadius: 20, border: '1px solid var(--border-color)', padding: 28 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>New Subject</h2>
                <button onClick={() => setShowAdd(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                Subject Name
              </label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Mathematics, Biology…"
                onKeyDown={e => e.key === 'Enter' && addSubject()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                      cursor: 'pointer', outline: newColor === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2, transform: newColor === c ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }} />
                ))}
              </div>

              {/* Preview */}
              {newName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${newColor}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderOpen size={18} color={newColor} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{newName}</span>
                </div>
              )}

              <button onClick={addSubject} disabled={!newName.trim() || adding} className="btn-primary"
                style={{ width: '100%', padding: '12px 0', fontSize: 14, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, opacity: newName.trim() ? 1 : 0.5 }}>
                {adding ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                {adding ? 'Creating…' : 'Create Subject'}
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loader2 size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(139,92,246,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <FolderOpen size={32} color="#8B5CF6" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {search ? 'No subjects found' : 'No subjects yet'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
            {search ? `No subjects match "${search}"` : 'Create a subject to organize your notes, or generate notes with a subject tag.'}
          </p>
          {!search && (
            <button onClick={() => setShowAdd(true)} className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
              <Plus size={16} /> Create your first subject
            </button>
          )}
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <GlassCard onClick={() => openSubject(s.name)}
                style={{ padding: 24, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {/* Color strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '16px 16px 0 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FolderOpen size={24} color={s.color} />
                  </div>
                  {/* Actions for folder-backed subjects */}
                  {s.fromFolder && (
                    <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                      <button onClick={e => { e.stopPropagation(); setEditId(s.folderId); setEditName(s.name); }}
                        style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={e => deleteSubject(s.folderId, e)}
                        style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.1)',
                          border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', color: '#F43F5E' }}>
                        {deleting === s.folderId ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Rename input */}
                {editId === s.folderId ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 14, alignItems: 'center' }}
                    onClick={e => e.stopPropagation()}>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      autoFocus onKeyDown={e => e.key === 'Enter' && saveRename(s.folderId, e)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 13,
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-glow)',
                        color: 'var(--text-primary)', outline: 'none' }} />
                    <button onClick={e => saveRename(s.folderId, e)}
                      style={{ width: 28, height: 28, borderRadius: 8, background: '#10B98120',
                        border: '1px solid #10B98140', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#10B981' }}>
                      <Check size={13} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setEditId(null); }}
                      style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: 14 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {s.count} {s.count === 1 ? 'note' : 'notes'}
                      </p>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
