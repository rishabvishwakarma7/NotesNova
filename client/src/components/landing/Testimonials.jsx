'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const testimonials = [
  { name: 'Aanya Sharma', role: 'Medical Student', text: 'NoteNova completely changed how I prepare for exams. The AI notes generator saved me 10+ hours every week!', rating: 5 },
  { name: 'Rohan Patel', role: 'CS Undergraduate', text: 'The coding mode in the chatbot is incredible. It explains complex algorithms better than my textbook.', rating: 5 },
  { name: 'Emily Chen', role: 'Law Student', text: 'I use the revision sheets feature before every exam. It distills my notes into exactly what I need.', rating: 5 },
  { name: 'James Wilson', role: 'MBA Student', text: 'The chat-to-notes conversion is genius. I brainstorm with the AI and save everything as organized notes.', rating: 5 },
];

export default function Testimonials() {
  return (
    <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          Loved by <span className="gradient-text">Students</span> Worldwide
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>
          Join thousands of students already studying smarter with NoteNova AI.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard style={{ padding: 28, height: '100%' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
