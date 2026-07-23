'use client';

import { motion } from 'framer-motion';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';

export default function FlashcardsPage() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Flashcards</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate and study flashcards with AI</p>
      </motion.div>

      <GlassCard style={{
        padding: 48, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Layers size={36} color="#8B5CF6" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Generate Flashcards
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
          Use the AI Notes Generator to create flashcards from any topic. Just select &quot;Flashcards&quot; as the note type.
        </p>
        <Link href="/dashboard/generate" className="btn-primary" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', padding: '12px 24px',
        }}>
          <Sparkles size={18} /> Generate Now <ArrowRight size={16} />
        </Link>
      </GlassCard>
    </div>
  );
}
