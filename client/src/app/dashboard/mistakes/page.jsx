'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked, Brain, RefreshCw, Wand2, ChevronDown, ChevronUp,
  CheckCircle2, Loader2, Search, Filter, Trash2,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import GlassCard from '@/components/ui/GlassCard';

export default function MistakesPage() {
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [expanded,   setExpanded]   = useState({});
  const [filter,     setFilter]     = useState('all'); // all | high | medium
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/journey/weak-topics');
      setWeakTopics(Array.isArray(res.data) ? res.data : []);
    } catch { setWeakTopics([]); }
    setLoading(false);
  };

  const resolve = async (id) => {
    try {
      await api.patch(`/journey/weak-topics/${id}/resolve`);
      setWeakTopics(p => p.filter(t => t._id !== id));
      toast({ message: 'Marked as resolved', type: 'success' });
    } catch { toast({ message: 'Failed', type: 'error' }); }
  };

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const filtered = weakTopics.filter(w => {
    const matchSearch = !search || w.topic.toLowerCase().includes(search.toLowerCase()) ||
      w.subject?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'high') return matchSearch && w.quizAccuracy < 40;
    if (filter === 'medium') return matchSearch && w.quizAccuracy >= 40 && w.quizAccuracy < 70;
    return matchSearch;
  });

  const allMistakes = weakTopics.reduce((acc, w) => acc + (w.mistakes?.length || 0), 0);
  const avgAccuracy = weakTopics.length > 0
    ? Math.round(weakTopics.reduce((s, w) => s + w.quizAccuracy, 0) / weakTopics.length)
    : 0;

  return (
    <div style={{ padding: '28px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:4,
            display:'flex', alignItems:'center', gap:10 }}>
            <BookMarked size={24} color="#F43F5E" /> Mistake Notebook
          </h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
            Review wrong answers, track weak areas, and strengthen your understanding
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}
        className="mistakes-stats">
        <style>{`.mistakes-stats{grid-template-columns:repeat(3,1fr)}@media(max-width:600px){.mistakes-stats{grid-template-columns:1fr 1fr}}`}</style>
        {[
          { label:'Weak Topics',    value: weakTopics.length, color:'#F43F5E' },
          { label:'Total Mistakes', value: allMistakes,       color:'#F59E0B' },
          { label:'Avg Accuracy',   value: avgAccuracy ? `${avgAccuracy}%` : '—', color:'#8B5CF6' },
        ].map((s,i) => (
          <div key={i} style={{ padding:'14px 16px', borderRadius:13, background:'var(--bg-card)',
            border:'1px solid var(--border-color)' }}>
            <p style={{ fontSize:24, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:8, padding:'9px 13px',
          borderRadius:11, background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics…"
            style={{ flex:1, background:'none', border:'none', outline:'none',
              color:'var(--text-primary)', fontSize:13, fontFamily:'inherit' }} />
        </div>
        {['all','high','medium'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer',
              fontSize:13, fontWeight:600,
              background: filter===f ? 'rgba(244,63,94,0.1)' : 'var(--bg-card)',
              color: filter===f ? '#F43F5E' : 'var(--text-muted)',
              border: filter===f ? '1px solid rgba(244,63,94,0.3)' : '1px solid var(--border-color)' }}>
            {f === 'all' ? 'All' : f === 'high' ? '⚠ Critical (<40%)' : '📉 Needs Work (40–70%)'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <Loader2 size={28} color="#F43F5E" style={{ animation:'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding:'52px 28px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:64, height:64, borderRadius:18, background:'rgba(16,185,129,0.1)',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <CheckCircle2 size={28} color="#10B981" />
          </div>
          <p style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>
            {search ? 'No matches found' : 'No mistakes recorded yet 🎉'}
          </p>
          <p style={{ fontSize:13, color:'var(--text-muted)', maxWidth:340, lineHeight:1.6, marginBottom:20 }}>
            {search ? 'Try a different search term' : 'Take quizzes to automatically detect and record weak topics here.'}
          </p>
          {!search && (
            <Link href="/dashboard/quiz" className="btn-primary"
              style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, fontSize:13 }}>
              <Brain size={14} /> Take a Quiz
            </Link>
          )}
        </GlassCard>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map((w, i) => {
            const isOpen = expanded[w._id];
            const severity = w.quizAccuracy < 40 ? { label:'Critical', color:'#F43F5E' }
              : w.quizAccuracy < 70 ? { label:'Needs Work', color:'#F59E0B' }
              : { label:'Improving', color:'#10B981' };

            return (
              <motion.div key={w._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                <GlassCard style={{ padding:0, overflow:'hidden', border:`1px solid ${severity.color}20` }}>
                  {/* Topic header */}
                  <button onClick={() => toggle(w._id)}
                    style={{ width:'100%', padding:'16px 20px', display:'flex', alignItems:'center',
                      gap:14, background:'transparent', border:'none', cursor:'pointer', textAlign:'left',
                      fontFamily:'inherit' }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:`${severity.color}12`,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Brain size={18} color={severity.color} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{w.topic}</p>
                        {w.subject && (
                          <span style={{ fontSize:11, color:'#06B6D4', background:'#06B6D415',
                            padding:'2px 7px', borderRadius:5, fontWeight:600 }}>{w.subject}</span>
                        )}
                        <span style={{ fontSize:11, color:severity.color, background:`${severity.color}12`,
                          padding:'2px 7px', borderRadius:5, fontWeight:700 }}>{severity.label}</span>
                      </div>
                      <div style={{ display:'flex', gap:14, marginTop:4, fontSize:12, color:'var(--text-muted)' }}>
                        <span>Quiz accuracy: <strong style={{ color:severity.color }}>{w.quizAccuracy}%</strong></span>
                        <span>Missed {w.missCount} time{w.missCount!==1?'s':''}</span>
                        {w.mistakes?.length > 0 && <span>{w.mistakes.length} mistake{w.mistakes.length!==1?'s':''} recorded</span>}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </button>

                  {/* Actions bar */}
                  <div style={{ padding:'0 20px 14px', display:'flex', gap:8, flexWrap:'wrap' }}>
                    <Link href={`/dashboard/generate?subject=${encodeURIComponent(w.subject||'')}` }
                      className="btn-secondary" style={{ textDecoration:'none', fontSize:12,
                        padding:'6px 12px', display:'flex', alignItems:'center', gap:5 }}>
                      <Wand2 size={12} /> Learn Again
                    </Link>
                    <Link href={`/dashboard/quiz`} className="btn-secondary"
                      style={{ textDecoration:'none', fontSize:12, padding:'6px 12px',
                        display:'flex', alignItems:'center', gap:5 }}>
                      <Brain size={12} /> Retry Quiz
                    </Link>
                    <Link href={`/dashboard/revision`} className="btn-secondary"
                      style={{ textDecoration:'none', fontSize:12, padding:'6px 12px',
                        display:'flex', alignItems:'center', gap:5 }}>
                      <RefreshCw size={12} /> Add to Revision
                    </Link>
                    <button onClick={() => resolve(w._id)}
                      style={{ fontSize:12, padding:'6px 12px', borderRadius:9, border:'1px solid rgba(16,185,129,0.3)',
                        background:'rgba(16,185,129,0.08)', cursor:'pointer', color:'#10B981',
                        display:'flex', alignItems:'center', gap:5 }}>
                      <CheckCircle2 size={12} /> Resolved
                    </button>
                  </div>

                  {/* Mistake list */}
                  <AnimatePresence>
                    {isOpen && w.mistakes?.length > 0 && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
                        style={{ overflow:'hidden', borderTop:'1px solid var(--border-color)' }}>
                        <div style={{ padding:'14px 20px', display:'flex', flexDirection:'column', gap:12 }}>
                          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)',
                            textTransform:'uppercase', letterSpacing:'0.07em' }}>
                            Recorded Mistakes ({w.mistakes.length})
                          </p>
                          {w.mistakes.map((m, j) => (
                            <div key={j} style={{ padding:'13px 15px', borderRadius:11,
                              background:'var(--bg-tertiary)', border:'1px solid var(--border-color)' }}>
                              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>
                                Q{j+1}: {m.question}
                              </p>
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom: m.explanation ? 8 : 0 }}>
                                <div style={{ padding:'7px 10px', borderRadius:8, background:'rgba(244,63,94,0.08)',
                                  border:'1px solid rgba(244,63,94,0.2)' }}>
                                  <p style={{ fontSize:10, fontWeight:700, color:'#F43F5E', marginBottom:3, textTransform:'uppercase' }}>Your Answer</p>
                                  <p style={{ fontSize:12, color:'#F43F5E' }}>{m.userAnswer}</p>
                                </div>
                                <div style={{ padding:'7px 10px', borderRadius:8, background:'rgba(16,185,129,0.08)',
                                  border:'1px solid rgba(16,185,129,0.2)' }}>
                                  <p style={{ fontSize:10, fontWeight:700, color:'#10B981', marginBottom:3, textTransform:'uppercase' }}>Correct Answer</p>
                                  <p style={{ fontSize:12, color:'#10B981' }}>{m.correctAnswer}</p>
                                </div>
                              </div>
                              {m.explanation && (
                                <div style={{ padding:'7px 10px', borderRadius:8, background:'rgba(99,102,241,0.06)',
                                  border:'1px solid rgba(99,102,241,0.15)' }}>
                                  <p style={{ fontSize:11, color:'var(--color-primary-light)', fontWeight:600, marginBottom:2 }}>💡 Explanation</p>
                                  <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{m.explanation}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
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
