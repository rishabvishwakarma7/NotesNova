'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, X, FileText, Trash2, Search,
  BookOpen, ChevronRight, ArrowLeft, Loader2, Edit2, Check,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

const COLORS = [
  '#8B5CF6','#06B6D4','#10B981','#EC4899',
  '#F59E0B','#F43F5E','#6366F1','#14B8A6','#FF6B35','#3B82F6',
];

export default function SubjectsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [subjects,      setSubjects]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [notes,         setNotes]         = useState([]);
  const [notesLoading,  setNotesLoading]  = useState(false);
  const [showAdd,       setShowAdd]       = useState(false);
  const [newName,       setNewName]       = useState('');
  const [newColor,      setNewColor]      = useState(COLORS[0]);
  const [adding,        setAdding]        = useState(false);
  const [search,        setSearch]        = useState('');
  const [editId,        setEditId]        = useState(null);
  const [editName,      setEditName]      = useState('');
  const [deleting,      setDeleting]      = useState(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) load();
  }, [isLoaded, isSignedIn]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [fr, nr] = await Promise.all([
        fetch(`${base}/folders`, { headers }).then(r => r.json()),
        fetch(`${base}/notes`,   { headers }).then(r => r.json()),
      ]);
      const folderList = Array.isArray(fr) ? fr : [];
      const noteList   = Array.isArray(nr) ? nr : (Array.isArray(nr?.notes) ? nr.notes : []);
      const subjectMap = {};
      noteList.forEach(n => {
        const s = n.subject?.trim();
        if (s) {
          const key = s.toLowerCase();
          if (!subjectMap[key]) subjectMap[key] = { name:s, count:0, color:COLORS[Object.keys(subjectMap).length % COLORS.length], fromFolder:false };
          subjectMap[key].count++;
        }
      });
      folderList.forEach(f => {
        const key = f.folderName.toLowerCase();
        if (!subjectMap[key]) subjectMap[key] = { name:f.folderName, count:0, color:f.color, fromFolder:true, folderId:f._id };
        else { subjectMap[key].color=f.color; subjectMap[key].fromFolder=true; subjectMap[key].folderId=f._id; subjectMap[key].name=f.folderName; }
      });
      setSubjects(Object.values(subjectMap).sort((a,b) => b.count - a.count));
    } catch (err) {
      console.error('Load subjects error:', err);
      if (!silent) toast({ message: 'Failed to load subjects', type: 'error' });
    }
    if (!silent) setLoading(false);
  };

  const openSubject = async (name) => {
    setSelected(name);
    setNotesLoading(true);
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/notes`, { headers });
      const data = await res.json();
      const allNotes = Array.isArray(data) ? data : (Array.isArray(data?.notes) ? data.notes : []);
      // Case-insensitive match so notes assigned by typing also appear
      setNotes(allNotes.filter(n => n.subject?.trim().toLowerCase() === name.toLowerCase()));
    } catch { setNotes([]); }
    setNotesLoading(false);
  };

  const addSubject = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const token = await getToken();
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/folders`, {
        method: 'POST', headers,
        body: JSON.stringify({ folderName: newName.trim(), color: newColor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const newSubject = { name: newName.trim(), count: 0, color: newColor, fromFolder: true, folderId: data._id };
      setSubjects(prev => [newSubject, ...prev]);
      toast({ message: `"${newName.trim()}" created!`, type: 'success' });
      setNewName(''); setNewColor(COLORS[0]); setShowAdd(false);
    } catch (err) {
      toast({ message: err.message || 'Failed to create subject', type: 'error' });
    }
    setAdding(false);
  };

  const deleteSubject = async (folderId, e) => {
    e.stopPropagation();
    setDeleting(folderId);
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${base}/folders/${folderId}`, { method: 'DELETE', headers });
      setSubjects(prev => prev.filter(s => s.folderId !== folderId));
      toast({ message: 'Subject deleted', type: 'info' });
    } catch { toast({ message: 'Failed to delete', type: 'error' }); }
    setDeleting(null);
  };

  const saveRename = async (folderId, e) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    try {
      const token = await getToken();
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${base}/folders/${folderId}`, { method: 'PUT', headers, body: JSON.stringify({ folderName: editName.trim() }) });
      setSubjects(prev => prev.map(s => s.folderId === folderId ? { ...s, name: editName.trim() } : s));
      setEditId(null);
    } catch { toast({ message: 'Failed to rename', type: 'error' }); }
  };

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  // ── Subject detail view ──
  if (selected) {
    const subj = subjects.find(s => s.name === selected);
    return (
      <div style={{ padding:'28px 20px', maxWidth:1100, margin:'0 auto' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <button onClick={() => setSelected(null)}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none',
            cursor:'pointer', color:'var(--text-muted)', fontSize:14, marginBottom:20, padding:0 }}>
          <ArrowLeft size={16} /> Back to Subjects
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`${subj?.color||'#8B5CF6'}18`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FolderOpen size={26} color={subj?.color||'#8B5CF6'} />
          </div>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)' }}>{selected}</h1>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>{notes.length} note{notes.length!==1?'s':''}</p>
          </div>
          <Link href={`/dashboard/notes/new?subject=${encodeURIComponent(selected)}`} className="btn-primary"
            style={{ marginLeft:'auto', textDecoration:'none', fontSize:13, padding:'9px 18px',
              display:'flex', alignItems:'center', gap:6 }}>
            <Plus size={14} /> Add Note
          </Link>
        </div>

        {notesLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
            <Loader2 size={28} color="#8B5CF6" style={{ animation:'spin 1s linear infinite' }} />
          </div>
        ) : notes.length === 0 ? (
          <GlassCard style={{ padding:48, textAlign:'center' }}>
            <BookOpen size={36} color="var(--text-muted)" style={{ marginBottom:14, opacity:0.4 }} />
            <p style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>No notes yet</p>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>
              Create a note and assign it to <strong>{selected}</strong>
            </p>
            <Link href={`/dashboard/generate?subject=${encodeURIComponent(selected)}`} className="btn-primary"
              style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', padding:'10px 20px' }}>
              <Plus size={14} /> Generate Notes
            </Link>
          </GlassCard>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
            {notes.map((note, i) => (
              <motion.div key={note._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                <Link href={`/dashboard/notes/${note._id}`} style={{ textDecoration:'none' }}>
                  <GlassCard style={{ padding:20, cursor:'pointer' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:6,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{note.title}</p>
                        <span style={{ fontSize:10, color:subj?.color||'#8B5CF6',
                          background:`${subj?.color||'#8B5CF6'}15`, padding:'2px 7px', borderRadius:5, textTransform:'capitalize' }}>
                          {note.noteType}
                        </span>
                      </div>
                      <FileText size={16} color="var(--text-muted)" style={{ flexShrink:0 }} />
                    </div>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:10 }}>
                      {new Date(note.updatedAt).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                    </p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Main subjects grid ──
  return (
    <div style={{ padding:'28px 20px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:14, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:3 }}>Subjects</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Organize your notes by subject</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', fontSize:14 }}>
          <Plus size={15} /> Add Subject
        </button>
      </motion.div>

      {/* Search */}
      {subjects.length > 0 && (
        <div style={{ position:'relative', marginBottom:20 }}>
          <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input placeholder="Search subjects…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:11, fontSize:13,
              background:'var(--bg-card)', border:'1px solid var(--border-color)',
              color:'var(--text-primary)', outline:'none', boxSizing:'border-box' }} />
        </div>
      )}

      {/* Add subject modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:50,
              display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ opacity:0, scale:0.95, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95 }}
              style={{ width:'100%', maxWidth:400, background:'var(--bg-secondary)',
                borderRadius:20, border:'1px solid var(--border-color)', padding:26 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h2 style={{ fontSize:17, fontWeight:800, color:'var(--text-primary)' }}>New Subject</h2>
                <button onClick={() => setShowAdd(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                  <X size={17} />
                </button>
              </div>

              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:7, display:'block' }}>Subject Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Mathematics, Biology…"
                autoFocus onKeyDown={e => e.key === 'Enter' && addSubject()}
                style={{ width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14,
                  background:'var(--bg-tertiary)', border:'1px solid var(--border-color)',
                  color:'var(--text-primary)', outline:'none', marginBottom:18, boxSizing:'border-box' }} />

              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:9, display:'block' }}>Color</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    style={{ width:26, height:26, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
                      outline: newColor===c ? `3px solid ${c}` : 'none', outlineOffset:2,
                      transform: newColor===c ? 'scale(1.2)' : 'scale(1)', transition:'all 0.15s' }} />
                ))}
              </div>

              {newName && (
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  borderRadius:11, background:'var(--bg-tertiary)', border:'1px solid var(--border-color)', marginBottom:18 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:`${newColor}18`,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FolderOpen size={16} color={newColor} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{newName}</span>
                </div>
              )}

              <button onClick={addSubject} disabled={!newName.trim() || adding} className="btn-primary"
                style={{ width:'100%', padding:'11px 0', fontSize:14, display:'flex',
                  alignItems:'center', justifyContent:'center', gap:8, opacity: newName.trim()?1:0.5 }}>
                {adding ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> : <Plus size={15} />}
                {adding ? 'Creating…' : 'Create Subject'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:64 }}>
          <Loader2 size={30} color="#8B5CF6" style={{ animation:'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding:'56px 28px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:68, height:68, borderRadius:18, background:'rgba(139,92,246,0.1)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
            <FolderOpen size={30} color="#8B5CF6" />
          </div>
          <h2 style={{ fontSize:19, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>
            {search ? 'No subjects found' : 'No subjects yet'}
          </h2>
          <p style={{ fontSize:13, color:'var(--text-muted)', maxWidth:340, lineHeight:1.6, marginBottom:22 }}>
            {search ? `No subjects match "${search}"` : 'Create a subject to organize your notes.'}
          </p>
          {!search && (
            <button onClick={() => setShowAdd(true)} className="btn-primary"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', fontSize:14 }}>
              <Plus size={15} /> Create your first subject
            </button>
          )}
        </GlassCard>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14 }}>
          {filtered.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
              <GlassCard onClick={() => openSubject(s.name)}
                style={{ padding:22, cursor:'pointer', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.color, borderRadius:'16px 16px 0 0' }} />

                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginTop:6 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}18`,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FolderOpen size={22} color={s.color} />
                  </div>
                  {s.fromFolder && (
                    <div style={{ display:'flex', gap:4 }} onClick={e => e.stopPropagation()}>
                      <button onClick={e => { e.stopPropagation(); setEditId(s.folderId); setEditName(s.name); }}
                        style={{ width:26, height:26, borderRadius:7, background:'var(--bg-tertiary)',
                          border:'1px solid var(--border-color)', display:'flex', alignItems:'center',
                          justifyContent:'center', cursor:'pointer', color:'var(--text-muted)' }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={e => deleteSubject(s.folderId, e)}
                        style={{ width:26, height:26, borderRadius:7, background:'rgba(244,63,94,0.1)',
                          border:'1px solid rgba(244,63,94,0.2)', display:'flex', alignItems:'center',
                          justifyContent:'center', cursor:'pointer', color:'#F43F5E' }}>
                        {deleting===s.folderId ? <Loader2 size={12} style={{ animation:'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  )}
                </div>

                {editId===s.folderId ? (
                  <div style={{ display:'flex', gap:5, marginTop:12, alignItems:'center' }} onClick={e => e.stopPropagation()}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                      onKeyDown={e => e.key==='Enter' && saveRename(s.folderId,e)}
                      style={{ flex:1, padding:'6px 9px', borderRadius:7, fontSize:12,
                        background:'var(--bg-tertiary)', border:'1px solid var(--border-glow)',
                        color:'var(--text-primary)', outline:'none' }} />
                    <button onClick={e => saveRename(s.folderId,e)}
                      style={{ width:26, height:26, borderRadius:7, background:'#10B98120',
                        border:'1px solid #10B98140', display:'flex', alignItems:'center',
                        justifyContent:'center', cursor:'pointer', color:'#10B981' }}>
                      <Check size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setEditId(null); }}
                      style={{ width:26, height:26, borderRadius:7, background:'var(--bg-tertiary)',
                        border:'1px solid var(--border-color)', display:'flex', alignItems:'center',
                        justifyContent:'center', cursor:'pointer', color:'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop:12 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:3,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</h3>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{s.count} {s.count===1?'note':'notes'}</p>
                      <ChevronRight size={14} color="var(--text-muted)" />
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
