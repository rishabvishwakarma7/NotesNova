'use client';


export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileQuestion, Sparkles, Loader2, Trash2, ArrowLeft,
  ChevronDown, ChevronUp, BookOpen, Target, Star,
  CheckCircle2, Upload, FileText, X, AlertCircle,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';

const IMPORTANCE_CONFIG = {
  high:   { color: '#F43F5E', bg: '#F43F5E15', label: '🔥 High Priority' },
  medium: { color: '#F59E0B', bg: '#F59E0B15', label: '⚡ Medium Priority' },
  low:    { color: '#06B6D4', bg: '#06B6D415', label: '📖 Good to Know' },
};
const TYPE_CONFIG = {
  short:     { color: '#8B5CF6', label: 'Short Answer' },
  long:      { color: '#EC4899', label: 'Long Answer' },
  mcq:       { color: '#10B981', label: 'MCQ' },
  numerical: { color: '#F59E0B', label: 'Numerical' },
};

export default function PYQPage() {
  const [view, setView]         = useState('list');
  const [pyqs, setPyqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [inputMode, setInputMode]   = useState('text'); // text | pdf
  const [pdfFile, setPdfFile]       = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const fileInputRef = useRef(null);
  const [filter, setFilter]   = useState('all'); // all | high | medium | low
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    subject: '', syllabus: '', examType: 'University Exam', questionCount: 15,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pyq');
      setPyqs(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!form.subject.trim()) return;
    setGenerating(true);
    try {
      let res;
      if (inputMode === 'pdf' && pdfFile) {
        // PDF upload — use FormData
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        formData.append('subject', form.subject);
        formData.append('examType', form.examType);
        formData.append('questionCount', form.questionCount);
        const token = await window.Clerk?.session?.getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/pyq/generate-pdf`,
          { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }
        );
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }
        res = { data: await response.json() };
      } else {
        res = await api.post('/pyq/generate', form);
      }
      setPyqs(prev => [{ _id: res.data._id, title: res.data.title, subject: res.data.subject,
        examType: res.data.examType, questionCount: res.data.questions.length,
        highImportance: res.data.questions.filter(q => q.importance === 'high').length,
        createdAt: res.data.createdAt }, ...prev]);
      setSelected(res.data);
      setView('detail');
    } catch (err) {
      alert(err.message || 'Failed to generate. Try again.');
    }
    setGenerating(false);
  };

  const handleOpen = async (id) => {
    try {
      const res = await api.get(`/pyq/${id}`);
      setSelected(res.data);
      setView('detail');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    setDeleting(id);
    try {
      await api.delete(`/pyq/${id}`);
      setPyqs(prev => prev.filter(p => p._id !== id));
      if (selected?._id === id) { setSelected(null); setView('list'); }
    } catch (err) { console.error(err); }
    setDeleting(null);
  };

  const filteredQs = selected?.questions?.filter(q =>
    filter === 'all' ? true : q.importance === filter
  ) || [];

  // ── DETAIL VIEW ──
  if (view === 'detail' && selected) {
    const high   = selected.questions.filter(q => q.importance === 'high').length;
    const medium = selected.questions.filter(q => q.importance === 'medium').length;
    const low    = selected.questions.filter(q => q.importance === 'low').length;

    return (
      <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setView('list')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={16} /> Back to PYQ List
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{selected.title}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {selected.examType} · {selected.questions.length} questions
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 14px', borderRadius: 10, background: '#F43F5E15', border: '1px solid #F43F5E30' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔥 High </span>
                <span style={{ fontWeight: 800, color: '#F43F5E' }}>{high}</span>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: 10, background: '#F59E0B15', border: '1px solid #F59E0B30' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⚡ Medium </span>
                <span style={{ fontWeight: 800, color: '#F59E0B' }}>{medium}</span>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: 10, background: '#06B6D415', border: '1px solid #06B6D430' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📖 Low </span>
                <span style={{ fontWeight: 800, color: '#06B6D4' }}>{low}</span>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[['all','All Questions'],['high','High Priority'],['medium','Medium'],['low','Good to Know']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)}
                style={{ padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: filter === id ? 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.15))' : 'var(--bg-secondary)',
                  color: filter === id ? '#A78BFA' : 'var(--text-muted)',
                  border: filter === id ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--border-color)' }}>
                {label} {id !== 'all' && `(${id === 'high' ? high : id === 'medium' ? medium : low})`}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredQs.map((q, i) => {
              const imp  = IMPORTANCE_CONFIG[q.importance] || IMPORTANCE_CONFIG.medium;
              const type = TYPE_CONFIG[q.type] || TYPE_CONFIG.short;
              const isExpanded = expandedId === `${selected._id}-${i}`;

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <GlassCard style={{ padding: 0, overflow: 'hidden', border: `1px solid ${imp.color}25` }}>
                    {/* Priority strip */}
                    <div style={{ height: 3, background: imp.color }} />

                    <div style={{ padding: '16px 20px', cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : `${selected._id}-${i}`)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: imp.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: imp.color }}>{i + 1}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            {q.question}
                          </p>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: imp.color, background: imp.bg, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                              {imp.label}
                            </span>
                            <span style={{ fontSize: 11, color: type.color, background: `${type.color}15`, padding: '2px 8px', borderRadius: 6 }}>
                              {type.label}
                            </span>
                            {q.marks && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>
                                {q.marks} marks
                              </span>
                            )}
                            {q.year && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>
                                {q.year}
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                      </div>
                    </div>

                    {/* Answer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          style={{ borderTop: `1px solid ${imp.color}20`, padding: '16px 20px', background: imp.bg }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: imp.color, marginBottom: 8 }}>✅ Model Answer</p>
                          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {q.answer}
                          </p>
                          {q.keywords?.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Keywords:</span>
                              {q.keywords.map(kw => (
                                <span key={kw} style={{ fontSize: 11, color: '#8B5CF6', background: '#8B5CF615', padding: '2px 8px', borderRadius: 6 }}>{kw}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── GENERATE VIEW ──
  if (view === 'generate') {
    const canGenerate = form.subject.trim() && (inputMode === 'text' || (inputMode === 'pdf' && pdfFile));
    return (
      <div style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setView('list')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Generate PYQ Analysis
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
            AI predicts the most likely exam questions — upload real PYQs for even better accuracy.
          </p>

          <GlassCard style={{ padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Subject */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                  Subject / Paper Name *
                </label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Database Management Systems, Thermodynamics, Indian History"
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
              </div>

              {/* Input mode toggle */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                  Analysis Source
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'text', label: '📝 Type Syllabus', desc: 'Paste topics manually' },
                    { id: 'pdf',  label: '📄 Upload PYQ PDF', desc: 'More accurate analysis' },
                  ].map(m => (
                    <button key={m.id} onClick={() => setInputMode(m.id)}
                      style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.2s',
                        background: inputMode === m.id ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))' : 'var(--bg-tertiary)',
                        border: inputMode === m.id ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: inputMode === m.id ? '#A78BFA' : 'var(--text-primary)', marginBottom: 2 }}>{m.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus text input */}
              {inputMode === 'text' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    Syllabus / Topics <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional but recommended)</span>
                  </label>
                  <textarea value={form.syllabus} onChange={e => setForm(p => ({ ...p, syllabus: e.target.value }))}
                    placeholder={'Paste your syllabus or list topics:\nUnit 1: Introduction to DBMS, ER Diagrams\nUnit 2: Normalization, SQL\nUnit 3: Transactions, Concurrency Control'}
                    rows={5}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                </div>
              )}

              {/* PDF upload */}
              {inputMode === 'pdf' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    Upload Previous Year Question Paper (PDF)
                  </label>

                  {/* Drag & drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault(); setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file?.type === 'application/pdf') setPdfFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '28px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                      border: `2px dashed ${dragOver ? '#8B5CF6' : pdfFile ? '#10B981' : 'var(--border-color)'}`,
                      background: dragOver ? 'rgba(139,92,246,0.05)' : pdfFile ? 'rgba(16,185,129,0.05)' : 'var(--bg-tertiary)',
                      transition: 'all 0.2s' }}>
                    <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files[0]; if (f) setPdfFile(f); }} />

                    {pdfFile ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#10B98120',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} color="#10B981" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{pdfFile.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                          </p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setPdfFile(null); }}
                          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#8B5CF615',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <Upload size={22} color="#8B5CF6" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                          Drag & drop your PYQ PDF here
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>or click to browse · Max 10MB</p>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 14px',
                    borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <AlertCircle size={14} color="#A78BFA" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: '#A78BFA' }}>
                      Upload text-based PDFs (not scanned images). You can upload multiple years combined into one PDF for best results.
                    </p>
                  </div>
                </div>
              )}

              {/* Exam type + question count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Exam Type</label>
                  <select value={form.examType} onChange={e => setForm(p => ({ ...p, examType: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none' }}>
                    {['University Exam','Board Exam','Competitive Exam','Semester Exam','JEE/NEET','UPSC','Gate'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    Questions: {form.questionCount}
                  </label>
                  <input type="range" min={5} max={25} value={form.questionCount}
                    onChange={e => setForm(p => ({ ...p, questionCount: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: '#8B5CF6', marginTop: 10 }} />
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!canGenerate || generating}
                className="btn-primary"
                style={{ padding: '14px 0', fontSize: 15, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10, opacity: canGenerate ? 1 : 0.5 }}>
                {generating
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {inputMode === 'pdf' ? 'Reading PDF & Analyzing…' : 'Analyzing & Generating…'}</>
                  : <><Sparkles size={18} /> {inputMode === 'pdf' ? 'Analyze PYQ PDF' : 'Generate PYQ Analysis'}</>}
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </button>

              {generating && (
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                  {inputMode === 'pdf'
                    ? '📄 Extracting text from PDF and identifying question patterns…'
                    : '🤖 AI is analyzing exam patterns and generating likely questions…'}
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              <FileQuestion size={26} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10, color: '#F43F5E' }} />
              PYQ Analyzer
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              AI-predicted exam questions ranked by importance
            </p>
          </div>
          <button onClick={() => setView('generate')} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
            <Sparkles size={16} /> Analyze Subject
          </button>
        </div>

        {/* How it works */}
        {pyqs.length === 0 && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { icon: BookOpen, title: 'Enter Subject', desc: 'Paste your syllabus or topic list', color: '#8B5CF6' },
              { icon: Target, title: 'AI Predicts', desc: 'Analyzes common exam patterns', color: '#F43F5E' },
              { icon: Star, title: 'Priority Ranked', desc: 'High/medium/low importance questions', color: '#F59E0B' },
              { icon: CheckCircle2, title: 'Model Answers', desc: 'Each question has a complete answer', color: '#10B981' },
            ].map((s, i) => (
              <GlassCard key={i} style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <s.icon size={22} color={s.color} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</p>
              </GlassCard>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <Loader2 size={28} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : pyqs.length === 0 ? (
          <GlassCard style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FileQuestion size={40} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No analyses yet</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              Enter your subject and syllabus to get AI-predicted exam questions.
            </p>
            <button onClick={() => setView('generate')} className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
              <Sparkles size={16} /> Start Analysis
            </button>
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {pyqs.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard onClick={() => handleOpen(p._id)}
                  style={{ padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg,#F43F5E,#F59E0B)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{p.examType}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#F43F5E', background: '#F43F5E15', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                          🔥 {p.highImportance} High
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>
                          {p.questionCount} questions
                        </span>
                      </div>
                    </div>
                    <button onClick={e => handleDelete(p._id, e)}
                      style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.1)',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#F43F5E', flexShrink: 0 }}>
                      {deleting === p._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                    {new Date(p.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
