'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2, FileText, List, Target, BookOpen, HelpCircle,
  CheckSquare, ClipboardList, Sparkles, Loader2, ArrowRight,
  Zap, ListOrdered, Brain, Minimize2, Maximize2, Layers, Download, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GlassCard from '@/components/ui/GlassCard';
import { exportToPdf } from '@/utils/exportPdf';
import api from '@/services/api';
import { marked } from 'marked';
import { useToast } from '@/components/ui/Toast';

const noteTypes = [
  { id: 'detailed', label: 'Full Detailed', icon: FileText, color: '#8B5CF6' },
  { id: 'short', label: 'Short Notes', icon: List, color: '#06B6D4' },
  { id: 'bullet', label: 'Bullet Points', icon: ListOrdered, color: '#10B981' },
  { id: 'exam', label: 'Exam Notes', icon: Target, color: '#F59E0B' },
  { id: 'revision', label: 'Revision Sheet', icon: BookOpen, color: '#EC4899' },
  { id: 'definitions', label: 'Definitions', icon: ClipboardList, color: '#6366F1' },
  { id: 'viva', label: 'Viva Questions', icon: HelpCircle, color: '#14B8A6' },
  { id: 'mcq', label: 'MCQs', icon: CheckSquare, color: '#F43F5E' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, color: '#8B5CF6' },
];

const aiActions = [
  { id: 'summarize', label: 'Summarize', icon: Minimize2 },
  { id: 'bullets', label: 'Bullet Points', icon: List },
  { id: 'simplify', label: 'Simplify', icon: Zap },
  { id: 'expand', label: 'Expand', icon: Maximize2 },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Create Quiz', icon: Brain },
];

export default function GeneratePage() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('detailed');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [transforming, setTransforming] = useState('');
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const contentRef = useRef(null);
  const { toast } = useToast();
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setGenerated('');

    try {
      const res = await api.post('/notes/generate', { topic, type, subject });
      setGenerated(res.data.content || '');
    } catch {
      setGenerated(getDemoNotes(topic, type));
    }
    setLoading(false);
  };

  const handleTransform = async (action) => {
    if (!generated) return;
    setTransforming(action);

    try {
      const res = await api.post('/notes/transform', { content: generated, action });
      setGenerated(res.data.content || generated);
    } catch {
      // Keep existing content on error
    }
    setTransforming('');
  };

  const handleSaveNote = async () => {
    if (!generated || saving) return;
    setSaving(true);
    try {
      // Convert markdown → HTML so it renders correctly in the editor
      const html = marked.parse(generated, { breaks: true, gfm: true });
      await api.post('/notes', {
        title: topic || 'Generated Note',
        content: html,
        subject: subject || '',
        noteType: type,
        tags: subject ? [subject] : [],
      });
      setSaved(true);
      toast({ message: 'Saved to My Notes!', type: 'success' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      toast({ message: 'Failed to save note', type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          <Wand2 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />
          AI Notes Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          Enter any topic and generate study notes instantly with AI.
        </p>
      </motion.div>

      {/* Input form */}
      <GlassCard style={{ padding: 28, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Topic *</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, Binary Search Trees, World War II..."
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 12,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Subject (optional)</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Biology, Computer Science..."
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 12,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Note type selector */}
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>Note Type</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10, marginBottom: 24,
        }}>
          {noteTypes.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                background: type === t.id ? `${t.color}15` : 'var(--bg-glass)',
                border: `1px solid ${type === t.id ? t.color + '40' : 'var(--border-color)'}`,
                color: type === t.id ? t.color : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="btn-primary"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 15, padding: '14px 32px',
            opacity: topic.trim() ? 1 : 0.5,
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
          {loading ? 'Generating...' : 'Generate Notes'}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </GlassCard>

      {/* Generated content */}
      {(generated || loading) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* AI action buttons */}
          {generated && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
            }}>
              {aiActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleTransform(action.id)}
                  disabled={!!transforming}
                  className="btn-secondary"
                  style={{
                    padding: '8px 16px', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: transforming === action.id ? 0.6 : 1,
                  }}
                >
                  <action.icon size={14} />
                  {transforming === action.id ? 'Processing...' : action.label}
                </button>
              ))}
            </div>
          )}

          <GlassCard style={{ padding: 32 }} ref={contentRef}>
            {loading && !generated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{
                    height: i === 0 ? 28 : 16,
                    width: i === 0 ? '60%' : `${70 + Math.random() * 30}%`,
                  }} />
                ))}
              </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generated}
                </ReactMarkdown>
              </div>
            )}
          </GlassCard>

          {generated && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveNote}
                disabled={saving || saved}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                  opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> :
                 saved ? <Check size={16} /> : <FileText size={16} />}
                {saving ? 'Saving…' : saved ? 'Saved to Notes! ✓' : 'Save as Note'}
              </button>
              <button
                onClick={async () => {
                  if (!contentRef.current) return;
                  setExporting(true);
                  try {
                    await exportToPdf(contentRef.current, topic || 'NoteNova-Notes');
                  } catch (err) {
                    console.error('PDF export failed:', err);
                  }
                  setExporting(false);
                }}
                disabled={exporting}
                className="btn-secondary"
                style={{
                  padding: '12px 24px', fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: exporting ? 0.6 : 1,
                }}
              >
                <Download size={16} />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(generated)}
                className="btn-secondary"
                style={{ padding: '12px 24px', fontSize: 14 }}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function getDemoNotes(topic, type) {
  return `# ${topic}\n\n## Overview\nThis is a demo response for **${topic}** in *${type}* format.\n\n> ⚠️ Connect to the backend server to get real AI-generated notes.\n\n### Key Concepts\n- Point 1: Important concept about ${topic}\n- Point 2: Another key detail\n- Point 3: Critical information for exams\n\n### Summary\n${topic} is a fundamental topic that covers several key areas. Understanding these concepts is essential for academic success.\n\n---\n*Generated by NoteNova AI (Demo Mode)*`;
}
