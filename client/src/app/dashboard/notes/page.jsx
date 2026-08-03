'use client';


export const dynamic = 'force-dynamic';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Pin, Trash2, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

const TYPE_COLORS = {
  detailed:'#8B5CF6', short:'#06B6D4', bullet:'#10B981', exam:'#F59E0B',
  revision:'#EC4899', custom:'#64748B', flashcards:'#8B5CF6', mcq:'#F43F5E',
  viva:'#14B8A6', definitions:'#6366F1',
};

const SORTS = [
  { id:'updatedAt-desc', label:'Recently Updated' },
  { id:'updatedAt-asc',  label:'Oldest First' },
  { id:'title-asc',      label:'A → Z' },
  { id:'title-desc',     label:'Z → A' },
];

export default function NotesPage() {
  const [notes,    setNotes]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState('updatedAt-desc');
  const [subject,  setSubject]  = useState('');
  const [type,     setType]     = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/notes')
      .then(r => {
        // Handle both array and {notes:[]} object response
        const data = r.data;
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.notes) ? data.notes : []);
        setNotes(arr);
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => [...new Set(notes.map(n => n.subject).filter(Boolean))], [notes]);
  const types    = useMemo(() => [...new Set(notes.map(n => n.noteType).filter(Boolean))], [notes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let arr = notes.filter(n =>
      (!q || n.title?.toLowerCase().includes(q) || n.subject?.toLowerCase().includes(q)) &&
      (!subject || n.subject === subject) &&
      (!type    || n.noteType === type)
    );
    const [field, dir] = sort.split('-');
    arr = [...arr].sort((a, b) =>
      field === 'title'
        ? dir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        : dir === 'desc' ? new Date(b[field]) - new Date(a[field]) : new Date(a[field]) - new Date(b[field])
    );
    return arr;
  }, [notes, search, sort, subject, type]);

  const pinned   = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  const deleteNote = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    setDeleting(id);
    try {
      await api.delete(`/notes/${id}`);
      setNotes(p => p.filter(n => n._id !== id));
    } catch {}
    setDeleting(null);
  };

  const pinNote = async (id, isPinned, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await api.put(`/notes/${id}`, { isPinned: !isPinned });
      setNotes(p => p.map(n => n._id === id ? { ...n, isPinned: !isPinned } : n));
    } catch {}
  };

  return (
    <div style={{ padding:'28px 24px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', marginBottom:3 }}>My Notes</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
            {loading ? 'Loading…' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/dashboard/notes/new" className="btn-primary"
          style={{ textDecoration:'none', fontSize:13, padding:'10px 20px', display:'flex', alignItems:'center', gap:7 }}>
          <Plus size={15} /> New Note
        </Link>
      </motion.div>

      {/* Search + filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:180, display:'flex', alignItems:'center', gap:8, padding:'9px 13px',
          borderRadius:11, background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <Search size={15} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
            style={{ flex:1, background:'none', border:'none', outline:'none',
              color:'var(--text-primary)', fontSize:13, fontFamily:'inherit' }} />
        </div>

        {[
          { value:sort,    onChange:setSort,    options:SORTS.map(s=>({ id:s.id, label:s.label })) },
          subjects.length > 0 && { value:subject, onChange:setSubject, options:[{ id:'', label:'All Subjects' }, ...subjects.map(s=>({ id:s, label:s }))] },
          types.length > 1    && { value:type,    onChange:setType,    options:[{ id:'', label:'All Types' },    ...types.map(t=>({ id:t, label:t }))] },
        ].filter(Boolean).map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
            style={{ padding:'9px 11px', borderRadius:11, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', color:'var(--text-secondary)',
              fontSize:12, outline:'none', cursor:'pointer' }}>
            {sel.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:64 }}>
          <Loader2 size={28} color="var(--color-primary)" style={{ animation:'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 32px', background:'var(--bg-card)',
          borderRadius:18, border:'1px solid var(--border-color)' }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:14, display:'block', margin:'0 auto 14px' }} />
          <h3 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', marginBottom:7 }}>
            {search || subject || type ? 'No notes found' : 'No notes yet'}
          </h3>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>
            {search || subject || type ? 'Try adjusting your filters' : 'Create your first note or generate one with AI'}
          </p>
          {!search && !subject && !type && (
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/dashboard/notes/new" className="btn-primary" style={{ textDecoration:'none', fontSize:13 }}>
                <Plus size={14} /> New Note
              </Link>
              <Link href="/dashboard/generate" className="btn-secondary" style={{ textDecoration:'none', fontSize:13 }}>
                Generate with AI
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase',
                letterSpacing:'0.07em', marginBottom:12 }}>📌 Pinned</p>
              <NoteGrid notes={pinned} deleting={deleting} onDelete={deleteNote} onPin={pinNote} />
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)',
                textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>All Notes</p>}
              <NoteGrid notes={unpinned} deleting={deleting} onDelete={deleteNote} onPin={pinNote} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoteGrid({ notes, deleting, onDelete, onPin }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
      {notes.map((note, i) => {
        const color = TYPE_COLORS[note.noteType] || '#6366F1';
        return (
          <motion.div key={note._id} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
            <Link href={`/dashboard/notes/${note._id}`} style={{ textDecoration:'none' }}>
              <div style={{ padding:20, borderRadius:16, background:'var(--bg-card)',
                border:'1px solid var(--border-color)', cursor:'pointer', position:'relative',
                overflow:'hidden', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${color}50`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>

                {/* Color strip */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'16px 16px 0 0' }} />

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginTop:6, marginBottom:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${color}15`,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FileText size={18} color={color} />
                  </div>
                  <div style={{ display:'flex', gap:5 }} onClick={e => e.preventDefault()}>
                    <button onClick={e => onPin(note._id, note.isPinned, e)}
                      style={{ width:28, height:28, borderRadius:8, border:'none', cursor:'pointer',
                        background: note.isPinned ? '#F59E0B20' : 'var(--bg-tertiary)',
                        color: note.isPinned ? '#F59E0B' : 'var(--text-muted)',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Pin size={12} />
                    </button>
                    <button onClick={e => onDelete(note._id, e)}
                      style={{ width:28, height:28, borderRadius:8, border:'none', cursor:'pointer',
                        background:'rgba(244,63,94,0.1)', color:'#F43F5E',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {deleting === note._id
                        ? <Loader2 size={12} style={{ animation:'spin 1s linear infinite' }} />
                        : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:7,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{note.title}</h3>

                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:9 }}>
                  {note.subject && (
                    <span style={{ fontSize:10, color:'#06B6D4', background:'rgba(6,182,212,0.1)',
                      padding:'2px 7px', borderRadius:5, fontWeight:600 }}>{note.subject}</span>
                  )}
                  <span style={{ fontSize:10, color, background:`${color}15`,
                    padding:'2px 7px', borderRadius:5, textTransform:'capitalize' }}>{note.noteType}</span>
                </div>

                <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                  {new Date(note.updatedAt).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
