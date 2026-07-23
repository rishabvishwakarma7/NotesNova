'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap } from 'lucide-react';
import Particles from '@/components/ui/Particles';
import Link from 'next/link';

const TYPING_TEXTS = [
  'Smart AI Notes',
  'Exam Preparation',
  'Quick Revision Sheets',
  'Study Summaries',
  'Coding Help',
];

export default function Hero() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TYPING_TEXTS[typingIndex];
    let timeout;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setTypingIndex((typingIndex + 1) % TYPING_TEXTS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, typingIndex]);

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'var(--gradient-bg)',
    }}>
      <Particles />

      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        top: '10%', left: '10%', filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        bottom: '10%', right: '15%', filter: 'blur(60px)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        maxWidth: 900, padding: '120px 24px 80px',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 50,
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.2)',
            fontSize: 13, fontWeight: 600, color: '#A78BFA',
            marginBottom: 32,
          }}
        >
          <Zap size={14} /> Powered by GPT-4o
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 12,
            color: 'var(--text-primary)',
          }}
        >
          Turn Any Topic Into
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 28,
            minHeight: 'clamp(44px, 7vw, 80px)',
          }}
        >
          <span className="gradient-text">{displayed}</span>
          <span style={{
            display: 'inline-block', width: 3, height: '0.9em',
            background: '#8B5CF6', marginLeft: 4, borderRadius: 2,
            animation: 'typing-cursor 1s step-end infinite',
          }} />
          <style>{`@keyframes typing-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Chat with AI, generate notes instantly, organize your studies, and prepare smarter — all in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/sign-up" className="btn-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 16, padding: '14px 32px', textDecoration: 'none',
          }}>
            Start Studying <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard/chat" className="btn-secondary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 16, padding: '14px 32px', textDecoration: 'none',
          }}>
            <Play size={16} /> Try AI Chat
          </Link>
        </motion.div>

        {/* Floating preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            marginTop: 80, position: 'relative',
            padding: 2, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))',
          }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 18, padding: 24,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
          }}>
            {[
              { label: 'AI Chat', desc: 'Ask anything', color: '#8B5CF6' },
              { label: 'Generate Notes', desc: 'Any topic, instant', color: '#06B6D4' },
              { label: 'Smart Editor', desc: 'Rich text editing', color: '#EC4899' },
            ].map((item, i) => (
              <div key={i} className="glass glass-hover" style={{
                padding: 20, borderRadius: 14, textAlign: 'left', cursor: 'pointer',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: item.color, marginBottom: 12,
                  boxShadow: `0 0 12px ${item.color}50`,
                }} />
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
