'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Check, Download } from 'lucide-react';
import TiptapEditor from '@/components/editor/TiptapEditor';
import Link from 'next/link';
import { exportToPdf } from '@/utils/exportPdf';

export default function NoteEditorPage() {
  const [title, setTitle] = useState('Untitled Note');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [subject, setSubject] = useState('');
  const [exporting, setExporting] = useState(false);
  const editorRef = useRef(null);

  const handleSave = useCallback(() => {
    // In production: save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [title, content, subject]);

  const handleExportPdf = async () => {
    const editorContent = editorRef.current?.querySelector('.ProseMirror');
    if (!editorContent) return;
    setExporting(true);
    try {
      await exportToPdf(editorContent, title || 'NoteNova-Note');
    } catch (err) {
      console.error('PDF export failed:', err);
    }
    setExporting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0, gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <Link href="/dashboard/notes" style={{
            color: 'var(--text-muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            <ArrowLeft size={20} />
          </Link>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 18, fontWeight: 700,
              fontFamily: 'inherit', maxWidth: 400,
            }}
            placeholder="Note title..."
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            style={{
              padding: '8px 14px', borderRadius: 10,
              background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              width: 140, fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="btn-secondary"
            style={{
              padding: '8px 16px', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: exporting ? 0.6 : 1,
            }}
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'PDF'}
          </button>
          <button onClick={handleSave} className="btn-primary" style={{
            padding: '8px 20px', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ maxWidth: 900, margin: '0 auto' }}
          ref={editorRef}
        >
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your notes..."
          />
        </motion.div>
      </div>
    </div>
  );
}
