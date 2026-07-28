'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Plus, X, Check, Clock, Flame, Brain,
  BookOpen, ChevronDown, ChevronUp, Trash2, Loader2,
  AlertCircle, Star, TrendingUp, Calendar,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';

const CONFIDENCE_LABELS = ['', 'Very Weak', 'Weak', 'Average', 'Good', 'Mastered'];
const CONFIDENCE_COLORS = ['', '#F43F5E', '#F59E0B', '#06B6D4', '#8B5CF6', '#10B981'];

function daysUntil(date) {
  if (!date) return null;
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function DueLabel({ topic }) {
  const days = daysUntil(topic.nextRevision);
  if (days === null || topic.timesRevised === 0) return (
    <span style={{ fontSize: 11, color: '#06B6D4', background: '#06B6D415', padding: '2px 8px', borderRadius: 6 }}>New</span>
  );
  if (days <= 0) return (
    <span style={{ fontSize: 11, color: '#F43F5E', background: '#F43F5E15', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>⚠ Due</span>
  );
  if (days === 1) return (
    <span style={{ fontSize: 11, color: '#F59E0B', background: '#F59E0B15', padding: '2px 8px', borderRadius: 6 }}>Tomorrow</span>
  );
  return (
    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>in {days}d</span>
  );
}

export default function RevisionPage() {
  const [topics, setTopics]     = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [filter, setFilter]     = useState('all'); // all | due | weak | mastered
  const [subjectFilter, setSubjectFilter] = useState('');
  const [revising, setRevising] = useState(null); // topic being reviewed
  const [newTopic, setNewTopic] = useState({ topic: '', subject: '', confidence: 3 });
  const [adding, setAdding]     = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([api.get('/revision'), api.get('/revision/stats')]);
      setTopics(tRes.data || []);
      setStats(sRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newTopic.topic.trim()) return;
    setAdding(true);
    try {
      const res = await api.post('/revision', newTopic);
      setTopics(prev => [res.data, ...prev]);
      setNewTopic({ topic: '', subject: '', confidence: 3 });
      setShowAdd(false);
      load(); // refresh stats
    } catch (err) { console.error(err); }
    setAdding(false);
  };

  const handleRevise = async (topic, quality) => {
    try {
      const res = await api.patch(`/revision/${topic._id}/revise`, { quality, confidence: Math.min(5, Math.max(1, Math.round(quality / 1.1))) });
      setTopics(prev => prev.map(t => t._id === topic._id ? res.data : t));
      setRevising(null);
      load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/revision/${id}`);
      setTopics(prev => prev.filter(t => t._id !== id));
      load();
    } catch (err) { console.error(err); }
  };

  const subjects = [...new Set(topics.map(t => t.subject).filter(Boolean))];

  const filtered = topics.filter(t => {
    const now = new Date();
    if (filter === 'due') return t.nextRevision && new Date(t.nextRevision) <= now;
    if (filter === 'weak') return t.confidence <= 2;
    if (filter === 'mastered') return t.confidence >= 4;
    if (subjectFilter) return t.subject === subjectFilter;
    return true;
  });

  const dueCount = topics.filter(t => t.nextRevision && new Date(t.nextRevision) <= new Date()).length;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              <RefreshCw size={26} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10, color: '#8B5CF6' }} />
              Smart Revision Tracker
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Spaced repetition — revise the right topics at the right time
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
            <Plus size={16} /> Add Topic
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total Topics', value: stats.total, icon: BookOpen, color: '#8B5CF6' },
            { label: 'Due Today', value: dueCount, icon: AlertCircle, color: '#F43F5E' },
            { label: 'Mastered', value: stats.mastered, icon: Star, color: '#10B981' },
            { label: 'Need Work', value: stats.weak, icon: TrendingUp, color: '#F59E0B' },
          ].map(s => (
            <GlassCard key={s.label} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Due today banner */}
      {dueCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '14px 18px', borderRadius: 14, marginBottom: 20,
            background: 'linear-gradient(135deg,rgba(244,63,94,0.1),rgba(245,158,11,0.1))',
            border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flame size={20} color="#F43F5E" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {dueCount} topic{dueCount > 1 ? 's' : ''} due for revision today!
          </span>
          <button onClick={() => setFilter('due')} className="btn-primary"
            style={{ padding: '6px 14px', fontSize: 12, marginLeft: 'auto' }}>
            Revise Now
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all','All'],['due','Due'],['weak','Weak'],['mastered','Mastered']].map(([id, label]) => (
          <button key={id} onClick={() => { setFilter(id); setSubjectFilter(''); }}
            style={{ padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filter === id ? 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.15))' : 'var(--bg-secondary)',
              color: filter === id ? '#A78BFA' : 'var(--text-muted)',
              border: filter === id ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--border-color)' }}>
            {label} {id === 'due' && dueCount > 0 && `(${dueCount})`}
          </button>
        ))}
        {subjects.length > 0 && (
          <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setFilter('all'); }}
            style={{ padding: '7px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Add modal */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Add Topic to Revise</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Topic *</label>
                  <input value={newTopic.topic} onChange={e => setNewTopic(p => ({ ...p, topic: e.target.value }))}
                    placeholder="e.g. Photosynthesis, Linked Lists, Ohm's Law"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Subject</label>
                  <input value={newTopic.subject} onChange={e => setNewTopic(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Biology, CS, Physics"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    Confidence: <span style={{ color: CONFIDENCE_COLORS[newTopic.confidence] }}>{CONFIDENCE_LABELS[newTopic.confidence]}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setNewTopic(p => ({ ...p, confidence: v }))}
                        style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                          background: newTopic.confidence === v ? `${CONFIDENCE_COLORS[v]}20` : 'var(--bg-tertiary)',
                          color: newTopic.confidence === v ? CONFIDENCE_COLORS[v] : 'var(--text-muted)',
                          border: newTopic.confidence === v ? `1px solid ${CONFIDENCE_COLORS[v]}50` : '1px solid var(--border-color)' }}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weak</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mastered</span>
                  </div>
                </div>

                <button onClick={handleAdd} disabled={!newTopic.topic.trim() || adding} className="btn-primary"
                  style={{ padding: '12px 0', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: newTopic.topic.trim() ? 1 : 0.5 }}>
                  {adding ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                  {adding ? 'Adding…' : 'Add Topic'}
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revision modal */}
      <AnimatePresence>
        {revising && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setRevising(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: '100%', maxWidth: 460, background: 'var(--bg-secondary)',
                borderRadius: 20, border: '1px solid var(--border-color)', padding: 32 }}
              onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                How well did you recall?
              </h2>
              <p style={{ fontSize: 16, color: '#A78BFA', fontWeight: 600, marginBottom: 24 }}>
                {revising.topic}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Rate your recall — this determines when you'll see this topic again.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { q: 0, label: '😵 Complete Blackout', sub: 'No memory at all', color: '#F43F5E' },
                  { q: 2, label: '😟 Incorrect — Struggled', sub: 'Had trouble remembering', color: '#F59E0B' },
                  { q: 3, label: '😐 Correct with Effort', sub: 'Got it but it was hard', color: '#06B6D4' },
                  { q: 4, label: '😊 Correct with Hint', sub: 'Needed a small reminder', color: '#8B5CF6' },
                  { q: 5, label: '🎯 Perfect Recall', sub: 'Remembered instantly', color: '#10B981' },
                ].map(opt => (
                  <button key={opt.q} onClick={() => handleRevise(revising, opt.q)}
                    style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${opt.color}30`,
                      background: `${opt.color}08`, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = opt.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = `${opt.color}30`}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: opt.color }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topics list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loader2 size={28} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Brain size={40} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {filter !== 'all' ? `No ${filter} topics` : 'No topics yet'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            {filter !== 'all' ? 'Switch to "All" to see all your topics' : 'Add topics you want to track and revise using spaced repetition.'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setShowAdd(true)} className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
              <Plus size={16} /> Add Your First Topic
            </button>
          )}
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((topic, i) => {
            const isDue = topic.nextRevision && new Date(topic.nextRevision) <= new Date();
            const isExpanded = expandedId === topic._id;
            const color = CONFIDENCE_COLORS[topic.confidence] || '#8B5CF6';

            return (
              <motion.div key={topic._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard style={{ padding: 0, overflow: 'hidden',
                  border: isDue ? '1px solid rgba(244,63,94,0.3)' : undefined }}>
                  <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : topic._id)}>
                    {/* Confidence dot */}
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{topic.topic}</p>
                        {topic.subject && (
                          <span style={{ fontSize: 11, color: '#06B6D4', background: '#06B6D415', padding: '2px 8px', borderRadius: 6 }}>
                            {topic.subject}
                          </span>
                        )}
                        <DueLabel topic={topic} />
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                        {CONFIDENCE_LABELS[topic.confidence]} · Revised {topic.timesRevised} time{topic.timesRevised !== 1 ? 's' : ''}
                        {topic.lastRevised && ` · Last: ${new Date(topic.lastRevised).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}`}
                      </p>
                    </div>
                    {/* Confidence bar */}
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {[1,2,3,4,5].map(v => (
                        <div key={v} style={{ width: 6, height: 20, borderRadius: 3,
                          background: v <= topic.confidence ? color : 'var(--bg-tertiary)' }} />
                      ))}
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>

                  {/* Expanded actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ borderTop: '1px solid var(--border-color)', padding: '14px 18px',
                          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button onClick={() => setRevising(topic)} className="btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}>
                          <Check size={14} /> Mark as Revised
                        </button>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence:</span>
                          {[1,2,3,4,5].map(v => (
                            <button key={v} onClick={async () => {
                              const res = await api.put(`/revision/${topic._id}`, { confidence: v });
                              setTopics(prev => prev.map(t => t._id === topic._id ? res.data : t));
                            }}
                              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                                background: topic.confidence === v ? `${CONFIDENCE_COLORS[v]}20` : 'var(--bg-tertiary)',
                                color: topic.confidence === v ? CONFIDENCE_COLORS[v] : 'var(--text-muted)' }}>
                              {v}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => handleDelete(topic._id)}
                          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                            borderRadius: 10, background: 'rgba(244,63,94,0.1)', border: 'none',
                            color: '#F43F5E', cursor: 'pointer', fontSize: 13 }}>
                          <Trash2 size={13} /> Remove
                        </button>
                        {topic.nextRevision && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            Next revision: {new Date(topic.nextRevision).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
