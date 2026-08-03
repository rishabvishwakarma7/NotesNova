'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Check, Download, Loader2, Trash2 } from 'lucide-react';
import TiptapEditor from '@/components/editor/TiptapEditor';
import SubjectSelector from '@/components/ui/SubjectSelector';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { exportToPdf } from '@/utils/exportPdf';
import api from '@/services/api';
import { marked } from 'marked';

function mdToHtml(text) {
  if (!text) return '';
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isHtml) return text;
  return marked.parse(text, { breaks: true, gfm: true });
}

export default function NoteEditorPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const searchParams = useSearchParams();
  const isNew    = id === 'new';

  const [title,    setTitle]    = useState('Untitled Note');
  const [content,  setContent]  = useState('');
  const [subject,  setSubject]  = useState(() => isNew ? (searchParams?.get('subject') || '') : '');
  const [noteType, setNoteType] = useState('custom');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [loading,  setLoading]  = useState(!isNew);
  const [deleting, setDeleting] = useState(false);
  const [exporting,setExporting]= useState(false);
  const [noteId,   setNoteId]   = useState(isNew ? null : id);
  const editorRef = useRef(null);

  /* Load existing note */
  useEffect(() => {
    if (isNew) return;
    api.get(`/notes/${id}`)
      .then(res => {
        const n = res.data;
        setTitle(n.title || 'Untitled Note');
        setContent(mdToHtml(n.content || ''));
        setSubject(n.subject || '');
        setNoteType(n.noteType || 'custom');
        setNoteId(n._id);
      })
      .catch(() => router.push('/dashboard/notes'))
      .finally(() => setLoading(false));
  }, [id, isNew, router]);

  /* Save (create or update) */
  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = { title, content, subject, noteType };
      if (noteId && !isNew) {
        await api.put(`/notes/${noteId}`, payload);
      } else {
        const res = await api.post('/notes', payload);
        setNoteId(res.data._id);
        // Update URL without reload
        window.history.replaceState({}, '', `/dashboard/notes/${res.data._id}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error('Save failed:', err); }
    setSaving(false);
  }, [title, content, subject, noteType, noteId, isNew, saving]);

  /* Auto-save every 30 seconds when content changes */
  useEffect(() => {
    if (!content && !title) return;
    const timer = setTimeout(() => {
      if (content || title !== 'Untitled Note') handleSave();
    }, 30000);
    return () => clearTimeout(timer);
  }, [content, title]);

  /* Ctrl+S shortcut */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  /* Delete */
  const handleDelete = async () => {
    if (!noteId || isNew) return router.push('/dashboard/notes');
    if (!confirm('Delete this note?')) return;
    setDeleting(true);
    try {
      await api.delete(`/notes/${noteId}`);
      router.push('/dashboard/notes');
    } catch (err) { console.error(err); setDeleting(false); }
  };

  /* PDF export */
  const handleExportPdf = async () => {
    const editorContent = editorRef.current?.querySelector('.ProseMirror');
    if (!editorContent) return;
    setExporting(true);
    try { await exportToPdf(editorContent, title || 'NoteNova-Note'); }
    catch (err) { console.error('PDF export failed:', err); }
    setExporting(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', flexShrink: 0, gap: 12, flexWrap: 'wrap' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <Link href="/dashboard/notes"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <ArrowLeft size={20} />
          </Link>
          <input value={title} onChange={e => setTitle(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 18, fontWeight: 700,
              fontFamily: 'inherit', minWidth: 0 }}
            placeholder="Note title…" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <SubjectSelector
            value={subject}
            onChange={setSubject}
            placeholder="Subject"
            style={{ width: 200, flexShrink: 0 }}
          />

          <button onClick={handleExportPdf} disabled={exporting} className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: exporting ? 0.6 : 1 }}>
            {exporting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
            PDF
          </button>

          <button onClick={handleDelete} disabled={deleting}
            style={{ width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(244,63,94,0.1)', color: '#F43F5E',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
          </button>

          <button onClick={handleSave} disabled={saving} className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
              background: saved ? 'linear-gradient(135deg,#10B981,#059669)' : undefined }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> :
             saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Hint + word count */}
      <div style={{ padding: '6px 24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)',
        fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Press <kbd style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--bg-card)',
          border: '1px solid var(--border-color)', fontSize: 11 }}>Ctrl+S</kbd> to save · Auto-saves every 30s</span>
        <span>{content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words</span>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ maxWidth: 900, margin: '0 auto' }} ref={editorRef}>
          <TiptapEditor content={content} onChange={setContent} placeholder="Start writing your notes…" />
        </motion.div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
