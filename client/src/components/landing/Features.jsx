'use client';

import { motion } from 'framer-motion';
import { MessageSquare, FileText, Brain, Zap, Shield, Smartphone } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const features = [
  { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Chat with GPT-4o in multiple study modes. Get explanations, solve doubts, and generate summaries instantly.', color: '#8B5CF6' },
  { icon: FileText, title: 'Smart Notes Generator', desc: 'Enter any topic and get detailed, exam-ready, or revision notes in seconds with AI.', color: '#06B6D4' },
  { icon: Brain, title: 'Intelligent Study Workspace', desc: 'Rich text editor with auto-save, folders, tags, and seamless organization for all your notes.', color: '#EC4899' },
  { icon: Zap, title: 'One-Click Conversion', desc: 'Convert chat responses to editable notes, generate flashcards, quizzes, and revision sheets.', color: '#F59E0B' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and never shared. Enterprise-grade security with Clerk authentication.', color: '#10B981' },
  { icon: Smartphone, title: 'Mobile Responsive', desc: 'Study anywhere. NoteNova works perfectly on mobile, tablet, and desktop devices.', color: '#F43F5E' },
];

export default function Features() {
  return (
    <section id="features" style={{
      padding: '120px 24px', maxWidth: 1200, margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <span style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 50,
          background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
          color: '#22D3EE', fontSize: 13, fontWeight: 600, marginBottom: 16,
        }}>
          Features
        </span>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: 16,
        }}>
          Everything You Need to <span className="gradient-text">Study Smarter</span>
        </h2>
        <p style={{
          fontSize: 18, color: 'var(--text-secondary)',
          maxWidth: 600, margin: '0 auto',
        }}>
          Powered by cutting-edge AI to transform how you learn, revise, and prepare for exams.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 24,
      }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <GlassCard style={{ padding: 32, height: '100%' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${f.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <f.icon size={24} color={f.color} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
