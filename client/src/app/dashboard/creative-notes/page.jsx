'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles, Loader2, Download, Save, Check, Crown,
  Wand2, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { marked } from 'marked';
import SubjectSelector from '@/components/ui/SubjectSelector';
import CreativeNoteRenderer from '@/components/creative/CreativeNoteRenderer';

const LEVELS = [
  { id: 'beginner',     label: 'Beginner',     emoji: '🌱', color: '#10B981' },
  { id: 'intermediate', label: 'Intermediate', emoji: '📚', color: '#6366F1' },
  { id: 'advanced',     label: 'Advanced',     emoji: '🚀', color: '#F43F5E' },
];

export default function CreativeNotesPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const contentRef = useRef(null);

  const [isPremium, setIsPremium] = useState(null);
  const [topic,   setTopic]   = useState(searchParams?.get('topic') || '');
  const [subject, setSubject] = useState(searchParams?.get('subject') || '');
  const [level,   setLevel]   = useState('intermediate');
  const [notes,   setNotes]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    api.get('/premium/status').then(r => {
      setIsPremium(r.data?.isPremium || false);
    }).catch(() => setIsPremium(false));
  }, []);

  // Show paywall if not premium
  if (isPremium === false) return (
    <div style={{ padding:'40px 20px', maxWidth:540, margin:'0 auto', textAlign:'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:80, height:80, borderRadius:24, background:'linear-gradient(135deg,#8B5CF6,#06B6D4)',
        display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px',
        boxShadow:'0 8px 32px rgba(139,92,246,0.4)' }}>
        <Sparkles size={36} color="white" />
      </div>
      <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:20,
        background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', marginBottom:16 }}>
        <Crown size={13} color="#F59E0B" />
        <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>PREMIUM FEATURE</span>
      </div>
      <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:10 }}>
        Creative Notes is Premium
      </h1>
      <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:28, maxWidth:400, margin:'0 auto 28px' }}>
        Upgrade to NoteNova Premium (₹99 lifetime) to generate beautiful visual study booklets with cards, flowcharts, quizzes, memory tricks and more.
      </p>
      <Link href="/dashboard/premium" style={{ display:'inline-flex', alignItems:'center', gap:8,
        padding:'14px 32px', borderRadius:14, textDecoration:'none', color:'white', fontWeight:800, fontSize:15,
        background:'linear-gradient(135deg,#F59E0B,#FBBF24)', boxShadow:'0 6px 24px rgba(245,158,11,0.45)' }}>
        <Crown size={18} /> Upgrade to Premium — ₹99
      </Link>
    </div>
  );

  // Loading premium check
  if (isPremium === null) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <Loader2 size={28} color="#8B5CF6" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setNotes(null);
    try {
      const res = await api.post('/notes/creative', { topic: topic.trim(), subject, level });
      setNotes(res.data.notes);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate';
      toast({ message: `Error: ${msg}`, type: 'error' });
    }
    setLoading(false);
  }, [topic, subject, level, toast]);

  const handleSave = async () => {
    if (!notes || saving) return;
    setSaving(true);
    try {
      const html = buildNoteHTML(notes);
      // Always use the user-selected subject — don't trust AI-generated subject name
      const noteSubject = subject || notes.subject || '';
      await api.post('/notes', {
        title: notes.title || topic,
        content: html,
        subject: noteSubject,
        noteType: 'detailed',
        tags: [noteSubject, level].filter(Boolean),
      });
      setSaved(true);
      toast({ message: noteSubject ? `Saved to "${noteSubject}"!` : 'Saved to My Notes!', type: 'success' });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ message: 'Failed to save', type: 'error' });
    }
    setSaving(false);
  };

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${notes?.title || topic}-CreativeNotes.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (err) {
      toast({ message: 'PDF export failed', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              Creative Notes
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
              AI-powered visual study booklets — cards, diagrams, quizzes & more
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ background: 'var(--bg-secondary)', borderRadius: 20, border: '1px solid var(--border-color)',
          padding: 28, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}
          className="cn-input-grid">
          <style>{`.cn-input-grid{grid-template-columns:1fr 1fr}@media(max-width:640px){.cn-input-grid{grid-template-columns:1fr!important}}`}</style>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              Topic *
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. CRC Checksum, Binary Trees, Photosynthesis, Newton's Laws…"
              style={{ width: '100%', padding: '14px 18px', borderRadius: 12, fontSize: 15,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              Subject (optional)
            </label>
            <SubjectSelector value={subject} onChange={setSubject} placeholder="Select or type subject…" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              Difficulty Level
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  style={{ flex: 1, padding: '11px 8px', borderRadius: 11, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                    background: level === l.id ? `${l.color}15` : 'var(--bg-tertiary)',
                    color: level === l.id ? l.color : 'var(--text-muted)',
                    outline: level === l.id ? `1.5px solid ${l.color}50` : '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{l.emoji}</div>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleGenerate} disabled={!topic.trim() || loading} className="btn-primary"
            style={{ padding: '13px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
              opacity: topic.trim() ? 1 : 0.5,
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              boxShadow: topic.trim() ? '0 4px 20px rgba(139,92,246,0.4)' : 'none' }}>
            {loading
              ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : <Sparkles size={18} />}
            {loading ? 'Generating Visual Notes…' : 'Generate Creative Notes'}
          </button>

          {notes && (
            <>
              <button onClick={handleSave} disabled={saving || saved} className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 7,
                  background: saved ? 'rgba(16,185,129,0.1)' : undefined,
                  borderColor: saved ? 'rgba(16,185,129,0.4)' : undefined,
                  color: saved ? '#10B981' : undefined }}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> :
                  saved ? <Check size={15} /> : <Save size={15} />}
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save to Notes'}
              </button>
              <button onClick={handleExportPdf} className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Download size={15} /> Export PDF
              </button>
            </>
          )}
        </div>
        {notes && !subject && (
          <p style={{ fontSize: 12, color: '#F59E0B', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            💡 Select a subject above before saving so this note appears in your Subjects section.
          </p>
        )}
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['60%', '100%', '100%', '80%'].map((w, i) => (
              <div key={i} style={{ padding: '24px', borderRadius: 16, background: 'var(--bg-card)',
                border: '1px solid var(--border-color)' }}>
                <div className="skeleton" style={{ height: 20, width: w, marginBottom: 14, borderRadius: 6 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="skeleton" style={{ height: 14, width: `${75 + j * 8}%`, borderRadius: 4 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20,
            animation: 'pulse 1.5s ease infinite' }}>
            ✨ Building your visual study notes — cards, diagrams, quiz and more…
          </p>
        </motion.div>
      )}

      {/* Rendered notes */}
      {notes && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div ref={contentRef}>
            <CreativeNoteRenderer notes={notes} onFollowUp={(t) => { setTopic(t); handleGenerate(); }} />
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!notes && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ padding: '52px 32px', borderRadius: 20, background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.12))',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={32} color="#8B5CF6" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              Canva-style visual study booklets, instantly
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
              Enter any topic and get a beautifully designed note with concept cards, flowcharts, definitions, quizzes, memory tricks and more — all auto-generated by AI.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['CRC Checksum', 'Binary Trees', 'Photosynthesis', 'HTTP Protocol', 'OS Scheduling'].map(t => (
                <button key={t} onClick={() => { setTopic(t); }}
                  style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF650'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Build a simplified HTML string for saving to notes
function buildNoteHTML(notes) {
  if (!notes) return '';
  let html = `<h1>${notes.title || ''}</h1>\n`;
  for (const section of (notes.sections || [])) {
    html += `<h2>${section.title || ''}</h2>\n`;
    if (section.content) html += `<p>${section.content}</p>\n`;
    if (section.keyPoints) html += `<ul>${section.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>\n`;
    if (section.items) {
      section.items.forEach(item => {
        if (item.term) html += `<p><strong>${item.term}</strong>: ${item.definition}</p>\n`;
        else if (item.name) html += `<p><strong>${item.name}</strong>: ${item.explanation}${item.example ? ` — ${item.example}` : ''}</p>\n`;
        else if (item.title) html += `<p><strong>${item.title}</strong>: ${item.description}</p>\n`;
      });
    }
    if (section.steps) html += `<ol>${section.steps.map(s => `<li><strong>${s.label}</strong>: ${s.description}</li>`).join('')}</ol>\n`;
    if (section.tips) section.tips.forEach(t => { html += `<p>${t.type === 'warning' ? '⚠️' : '💡'} ${t.text}</p>\n`; });
    if (section.tricks) html += `<ul>${section.tricks.map(t => `<li>${t}</li>`).join('')}</ul>\n`;
    if (section.points) html += `<ul>${section.points.map(p => `<li>${p}</li>`).join('')}</ul>\n`;
  }
  return html;
}
