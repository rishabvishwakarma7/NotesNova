'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Star, Check, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import api from '@/services/api';

const TYPES = [
  { id: 'bug',     label: '🐛 Bug Report',    color: '#F43F5E' },
  { id: 'feature', label: '💡 Feature Idea',  color: '#8B5CF6' },
  { id: 'praise',  label: '🌟 Praise',        color: '#10B981' },
  { id: 'general', label: '💬 General',       color: '#06B6D4' },
];

export default function FeedbackWidget() {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState('general');
  const [rating, setRating]   = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile with bottom nav, push up by nav height (60px) + margin (8px)
  // On chat page, no bottom nav so use normal position
  const isChat = pathname?.startsWith('/dashboard/chat');
  const bottomOffset = isMobile && !isChat ? 60 + 12 : 24;
  const panelBottom  = isMobile && !isChat ? 60 + 12 + 60 : 86;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        type, rating: rating || null,
        message, page: pathname,
      });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setMessage('');
        setRating(0);
        setType('general');
      }, 2500);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const selectedType = TYPES.find(t => t.id === type);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: bottomOffset, right: 20, zIndex: 60,
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg,#8B5CF6,#06B6D4)',
          border: 'none', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
          transition: 'bottom 0.2s',
        }}
        title="Send Feedback"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.span>
            : <motion.span key="fb" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Feedback panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: panelBottom, right: 20, zIndex: 60,
              width: 340, background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                Share Feedback
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Help us make NoteNova better for you
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '32px 20px', textAlign: 'center' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.15)', margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={28} color="#10B981" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Thank you! 🎉
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Your feedback helps us improve NoteNova.
                </p>
              </motion.div>
            ) : (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Type selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TYPES.map(t => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      style={{ padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, textAlign: 'left',
                        background: type === t.id ? `${t.color}18` : 'var(--bg-tertiary)',
                        color: type === t.id ? t.color : 'var(--text-muted)',
                        border: type === t.id ? `1px solid ${t.color}40` : '1px solid var(--border-color)',
                        transition: 'all 0.15s' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Star rating */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Rate your experience
                  </p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(v => (
                      <button key={v}
                        onClick={() => setRating(v)}
                        onMouseEnter={() => setHoverStar(v)}
                        onMouseLeave={() => setHoverStar(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                        <Star size={22}
                          fill={(hoverStar || rating) >= v ? '#F59E0B' : 'transparent'}
                          color={(hoverStar || rating) >= v ? '#F59E0B' : 'var(--border-color)'}
                          style={{ transition: 'all 0.1s' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={
                      type === 'bug' ? 'Describe what went wrong...' :
                      type === 'feature' ? 'Describe the feature you want...' :
                      type === 'praise' ? "What do you love about NoteNova?" :
                      'Share your thoughts...'
                    }
                    rows={4}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, fontSize: 13,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', outline: 'none', resize: 'none',
                      fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--border-glow)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                    {message.length}/500
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || submitting}
                  style={{ padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    background: message.trim()
                      ? `linear-gradient(135deg,${selectedType.color},${selectedType.color}cc)`
                      : 'var(--bg-tertiary)',
                    color: message.trim() ? 'white' : 'var(--text-muted)',
                    opacity: submitting ? 0.7 : 1, transition: 'all 0.2s' }}>
                  {submitting
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                    : <><Send size={15} /> Send Feedback</>}
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
