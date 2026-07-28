'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Sparkles, RotateCcw, ChevronLeft, ChevronRight,
  Check, X, Loader2, BookOpen, Trophy, ArrowLeft, Trash2, Brain,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

/* Parse AI-generated flashcard markdown into Q/A pairs */
function parseFlashcards(markdown) {
  if (!markdown) return [];
  const cards = [];
  const sections = markdown.split(/---+|\n\n(?=\*\*Q:)/);
  for (const section of sections) {
    const qMatch = section.match(/\*\*Q:\*\*\s*(.+?)(?=\*\*A:\*\*)/s);
    const aMatch = section.match(/\*\*A:\*\*\s*(.+?)$/s);
    if (qMatch && aMatch) {
      cards.push({ q: qMatch[1].trim(), a: aMatch[1].trim() });
    }
  }
  // fallback: split by "Q:" / "A:" pattern without markdown
  if (cards.length === 0) {
    const lines = markdown.split('\n').filter(Boolean);
    let current = null;
    for (const line of lines) {
      if (line.startsWith('Q:') || line.startsWith('**Q:**')) {
        if (current) cards.push(current);
        current = { q: line.replace(/^\*?\*?Q:\*?\*?\s*/, '').trim(), a: '' };
      } else if (line.startsWith('A:') || line.startsWith('**A:**')) {
        if (current) current.a = line.replace(/^\*?\*?A:\*?\*?\s*/, '').trim();
      }
    }
    if (current) cards.push(current);
  }
  return cards.filter(c => c.q && c.a);
}

function FlipCard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ perspective: 1000, width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <motion.div
        onClick={() => setFlipped(f => !f)}
        style={{ position: 'relative', width: '100%', height: 280, cursor: 'pointer',
          transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)',
          boxShadow: '0 8px 32px rgba(139,92,246,0.15)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 16 }}>Question {index + 1} of {total}</span>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>{card.q}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>Click to reveal answer</p>
        </div>
        {/* Back */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: 20, padding: 32,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))',
          border: '1px solid rgba(139,92,246,0.3)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#06B6D4', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 16 }}>Answer</span>
          <p style={{ fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.6 }}>{card.a}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [decks, setDecks]         = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [known, setKnown]         = useState([]);
  const [unknown, setUnknown]     = useState([]);
  const [mode, setMode]           = useState('browse');
  const [generating, setGenerating] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    api.get('/notes').then(r => {
      const all = r.data || [];
      const fcNotes = all.filter(n => n.noteType === 'flashcards' || n.content?.includes('**Q:**'));
      setNotes(all);
      const parsed = fcNotes.map(n => ({
        noteId: n._id, title: n.title, subject: n.subject,
        cards: parseFlashcards(n.content), createdAt: n.createdAt,
      })).filter(d => d.cards.length > 0);
      setDecks(parsed);

      // Fix #9: Restore in-progress session from sessionStorage
      try {
        const saved = sessionStorage.getItem('flashcard_session');
        if (saved) {
          const session = JSON.parse(saved);
          const deck = parsed.find(d => d.noteId === session.noteId);
          if (deck && session.cardIndex < deck.cards.length) {
            setActiveDeck(deck);
            setCardIndex(session.cardIndex);
            setKnown(session.known || []);
            setUnknown(session.unknown || []);
            setMode('study');
          }
        }
      } catch {}
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const generateForNote = async (note) => {
    setGenerating(note._id);
    try {
      const res = await api.post('/notes/generate', {
        topic: note.title, subject: note.subject, type: 'flashcards',
      });
      const cards = parseFlashcards(res.data.content);
      if (cards.length > 0) {
        // Save to note
        await api.put(`/notes/${note._id}`, { content: res.data.content, noteType: 'flashcards' });
        const deck = { noteId: note._id, title: note.title, subject: note.subject, cards, createdAt: new Date() };
        setDecks(prev => [...prev.filter(d => d.noteId !== note._id), deck]);
      }
    } catch (err) { console.error(err); }
    setGenerating(null);
  };

  const startStudy = (deck) => {
    setActiveDeck(deck);
    setCardIndex(0);
    setKnown([]);
    setUnknown([]);
    setMode('study');
    // Fix #9: Save session start
    sessionStorage.setItem('flashcard_session', JSON.stringify({ noteId: deck.noteId, cardIndex: 0, known: [], unknown: [] }));
  };

  const handleKnow = () => {
    const newKnown = [...known, cardIndex];
    setKnown(newKnown);
    const next = cardIndex + 1;
    if (next < activeDeck.cards.length) {
      setCardIndex(next);
      sessionStorage.setItem('flashcard_session', JSON.stringify({ noteId: activeDeck.noteId, cardIndex: next, known: newKnown, unknown }));
    } else {
      setMode('result');
      sessionStorage.removeItem('flashcard_session');
    }
  };

  const handleDontKnow = () => {
    const newUnknown = [...unknown, cardIndex];
    setUnknown(newUnknown);
    const next = cardIndex + 1;
    if (next < activeDeck.cards.length) {
      setCardIndex(next);
      sessionStorage.setItem('flashcard_session', JSON.stringify({ noteId: activeDeck.noteId, cardIndex: next, known, unknown: newUnknown }));
    } else {
      setMode('result');
      sessionStorage.removeItem('flashcard_session');
    }
  };

  if (mode === 'study' && activeDeck) {
    const card = activeDeck.cards[cardIndex];
    const progress = ((cardIndex) / activeDeck.cards.length) * 100;
    return (
      <div style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={() => setMode('browse')} style={{ display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: 0 }}>
            <ArrowLeft size={14} /> Exit
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cardIndex + 1} / {activeDeck.cards.length}</span>
        </div>
        {/* Progress */}
        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', marginBottom: 28, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
            style={{ height: '100%', borderRadius: 3, background: 'var(--gradient-primary)' }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={cardIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <FlipCard card={card} index={cardIndex} total={activeDeck.cards.length} />
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', gap: 16, marginTop: 28, justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleDontKnow}
            style={{ flex: 1, maxWidth: 200, padding: '14px 0', borderRadius: 14, border: 'none',
              cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, background: 'rgba(244,63,94,0.1)', color: '#F43F5E' }}>
            <X size={18} /> Don't Know
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleKnow}
            style={{ flex: 1, maxWidth: 200, padding: '14px 0', borderRadius: 14, border: 'none',
              cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <Check size={18} /> Know It!
          </motion.button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          ✅ {known.length} known · ❌ {unknown.length} unknown
        </p>
      </div>
    );
  }

  if (mode === 'result' && activeDeck) {
    const score = Math.round((known.length / activeDeck.cards.length) * 100);
    return (
      <div style={{ padding: '32px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: score >= 80 ? 'rgba(16,185,129,0.15)' : score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={36} color={score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#F43F5E'} />
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#F43F5E', marginBottom: 8 }}>
            {score}%
          </h2>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            {score >= 80 ? '🎉 Excellent!' : score >= 50 ? '👍 Good progress!' : '📚 Keep practicing!'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            {known.length} known · {unknown.length} need more practice
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => startStudy(activeDeck)} className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 14 }}>
              <RotateCcw size={15} /> Study Again
            </button>
            {unknown.length > 0 && (
              <button onClick={() => {
                setActiveDeck({ ...activeDeck, cards: unknown.map(i => activeDeck.cards[i]) });
                setCardIndex(0); setKnown([]); setUnknown([]); setMode('study');
              }} className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 14 }}>
                <Brain size={15} /> Practice Weak Cards ({unknown.length})
              </button>
            )}
          </div>
          <button onClick={() => setMode('browse')} style={{ marginTop: 16, background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>Back to decks</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          <Layers size={26} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10, color: '#8B5CF6' }} />
          Flashcards
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Flip cards, test yourself, track what you know</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loader2 size={28} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Existing decks */}
          {decks.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Your Decks</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 32 }}>
                {decks.map((deck, i) => (
                  <motion.div key={deck.noteId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <GlassCard style={{ padding: 22, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--gradient-primary)' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Layers size={22} color="#8B5CF6" />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)',
                          padding: '3px 10px', borderRadius: 8 }}>{deck.cards.length} cards</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deck.title}</h3>
                      {deck.subject && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{deck.subject}</p>}
                      <button onClick={() => startStudy(deck)} className="btn-primary"
                        style={{ width: '100%', padding: '10px 0', fontSize: 13, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <BookOpen size={14} /> Study Now
                      </button>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Generate from notes */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Generate from Your Notes
          </h2>
          {notes.filter(n => n.noteType !== 'flashcards').length === 0 ? (
            <GlassCard style={{ padding: '40px 32px', textAlign: 'center' }}>
              <Layers size={36} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
              <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>No notes yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Create notes first, then generate flashcards from them.</p>
              <Link href="/dashboard/generate" className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 20px', fontSize: 14 }}>
                <Sparkles size={15} /> Generate Notes
              </Link>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
              {notes.filter(n => n.noteType !== 'flashcards').map(note => (
                <div key={note._id} style={{ padding: '16px 18px', borderRadius: 14,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</p>
                    {note.subject && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{note.subject}</p>}
                  </div>
                  <button onClick={() => generateForNote(note)} disabled={generating === note._id}
                    style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                      background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))',
                      color: '#A78BFA' }}>
                    {generating === note._id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
                    Generate
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
