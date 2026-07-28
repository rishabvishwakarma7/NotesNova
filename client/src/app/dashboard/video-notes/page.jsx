'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, FileText, List, Target, BookOpen, HelpCircle,
  CheckSquare, ClipboardList, Sparkles, Loader2, Link2,
  Zap, ListOrdered, Brain, Minimize2, Maximize2, Layers,
  Play, AlertCircle, ExternalLink, Copy, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GlassCard from '@/components/ui/GlassCard';
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

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoNotesPage() {
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('detailed');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [transforming, setTransforming] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const videoId = useMemo(() => extractVideoId(url), [url]);
  const isValidUrl = !!videoId;

  const handleGenerate = async () => {
    if (!isValidUrl) return;
    setLoading(true);
    setGenerated('');
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${apiUrl}/youtube/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url, type, subject }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate notes');
      } else {
        setGenerated(data.content || '');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please make sure the backend is running.');
    }
    setLoading(false);
  };

  const handleTransform = async (action) => {
    if (!generated) return;
    setTransforming(action);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${apiUrl}/notes/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: generated, action }),
      });
      const data = await res.json();
      setGenerated(data.content || generated);
    } catch {
      // Keep existing content on error
    }
    setTransforming('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fix #6: Save as Note actually works now
  const handleSaveNote = async () => {
    if (!generated || saving) return;
    setSaving(true);
    try {
      const title = url ? `Video Notes: ${url.slice(0, 60)}` : 'Video Notes';
      const html = marked.parse(generated, { breaks: true, gfm: true });
      const noteType = ['detailed','short','bullet','exam','revision'].includes(type) ? type : 'custom';
      await api.post('/notes', { title, content: html, subject: subject || '', noteType });
      toast({ message: 'Saved to My Notes!', type: 'success' });
    } catch (err) {
      toast({ message: 'Failed to save note', type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #FF0000, #CC0000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Youtube size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
              Video Notes
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Paste a YouTube link and get AI-generated study notes instantly
            </p>
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: 32 }} />

      {/* URL Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard style={{ padding: 28, marginBottom: 24 }}>
          {/* YouTube URL field */}
          <label style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Link2 size={14} />
            YouTube Video URL *
          </label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              id="youtube-url-input"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); }}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{
                width: '100%', padding: '16px 18px 16px 48px', borderRadius: 14,
                background: 'var(--bg-tertiary)',
                border: `1px solid ${url && !isValidUrl ? '#F43F5E40' : isValidUrl ? '#10B98140' : 'var(--border-color)'}`,
                color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                fontFamily: 'inherit', transition: 'border-color 0.2s',
              }}
              onFocus={e => {
                if (!url) e.target.style.borderColor = 'var(--border-glow)';
              }}
              onBlur={e => {
                if (!url) e.target.style.borderColor = 'var(--border-color)';
              }}
            />
            <div style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              <Youtube size={18} color={isValidUrl ? '#10B981' : 'var(--text-muted)'} />
            </div>
            {url && (
              <div style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                fontSize: 12, fontWeight: 600,
                color: isValidUrl ? '#10B981' : '#F43F5E',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {isValidUrl ? (
                  <>
                    <Check size={14} /> Valid
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Invalid URL
                  </>
                )}
              </div>
            )}
          </div>

          {/* Video Preview */}
          <AnimatePresence>
            {isValidUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', marginBottom: 20 }}
              >
                <div style={{
                  position: 'relative', width: '100%', maxWidth: 560,
                  margin: '0 auto', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  aspectRatio: '16/9',
                }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '100%', height: '100%', border: 'none',
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'center', marginTop: 10,
                }}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12, color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    Open on YouTube
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subject field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
              marginBottom: 8, display: 'block',
            }}>
              Subject (optional)
            </label>
            <input
              id="video-notes-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Biology, Computer Science, History..."
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 12,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', fontSize: 15, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Note type selector */}
          <label style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            marginBottom: 12, display: 'block',
          }}>
            Note Type
          </label>
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

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 18px', borderRadius: 12, marginBottom: 20,
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  color: '#F43F5E', fontSize: 14,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate button */}
          <button
            id="generate-video-notes-btn"
            onClick={handleGenerate}
            disabled={!isValidUrl || loading}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 15, padding: '14px 32px',
              opacity: isValidUrl ? 1 : 0.5,
              cursor: isValidUrl && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={18} />
            )}
            {loading ? 'Generating Notes from Video...' : 'Generate Video Notes'}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </button>
        </GlassCard>
      </motion.div>

      {/* Generated content */}
      <AnimatePresence>
        {(generated || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
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

            <GlassCard style={{ padding: 32 }}>
              {loading && !generated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Loading header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '16px 0', marginBottom: 8,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Youtube size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                        Extracting transcript & generating notes...
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        This may take a moment for longer videos
                      </p>
                    </div>
                  </div>
                  {/* Skeleton lines */}
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
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={16} />}
                  {saving ? 'Saving…' : 'Save as Note'}
                </button>
                <button
                  onClick={handleCopy}
                  className="btn-secondary"
                  style={{
                    padding: '12px 24px', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when nothing is generated */}
      {!generated && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard style={{
            padding: '48px 32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(255,0,0,0.1), rgba(139,92,246,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Play size={32} color="#FF0000" />
            </div>
            <h3 style={{
              fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              Turn Any YouTube Video into Study Notes
            </h3>
            <p style={{
              fontSize: 14, color: 'var(--text-muted)',
              maxWidth: 440, lineHeight: 1.6,
            }}>
              Paste a YouTube video link above and our AI will extract the transcript,
              analyze the content, and generate comprehensive study notes for you.
              Works with any video that has captions enabled.
            </p>

            {/* Feature highlights */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16, marginTop: 28, width: '100%', maxWidth: 600,
            }}>
              {[
                { icon: Youtube, text: 'Any YouTube video', color: '#FF0000' },
                { icon: FileText, text: '8 note formats', color: '#8B5CF6' },
                { icon: Brain, text: 'AI-powered analysis', color: '#06B6D4' },
              ].map((feat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                }}>
                  <feat.icon size={18} color={feat.color} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {feat.text}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
