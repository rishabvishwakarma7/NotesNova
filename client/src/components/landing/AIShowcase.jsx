'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

const tools = [
  {
    title: 'AI Chat Modes',
    items: ['Study Mode', 'Coding Mode', 'Research Mode', 'Exam Mode', 'Simple Explanation'],
    gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
  },
  {
    title: 'Notes Generator',
    items: ['Full Detailed Notes', 'Bullet Points', 'Exam Notes', 'Revision Sheets', 'MCQs & Viva Qs'],
    gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)',
  },
  {
    title: 'AI Tools',
    items: ['Summarize', 'Simplify', 'Expand', 'Generate Flashcards', 'Create Quiz'],
    gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)',
  },
];

export default function AIShowcase() {
  return (
    <section id="showcase" style={{
      padding: '120px 24px',
      background: 'var(--gradient-bg)',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 50,
            background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)',
            color: '#EC4899', fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            AI Tools
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800,
            color: 'var(--text-primary)', marginBottom: 16,
          }}>
            Your AI-Powered <span className="gradient-text-pink">Study Arsenal</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                  height: 4, background: tool.gradient,
                }} />
                <div style={{ padding: 32 }}>
                  <h3 style={{
                    fontSize: 22, fontWeight: 700, marginBottom: 20,
                    color: 'var(--text-primary)',
                  }}>
                    {tool.title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tool.items.map((item, j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', borderRadius: 10,
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        fontSize: 14, color: 'var(--text-secondary)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--border-glow)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: tool.gradient,
                          flexShrink: 0,
                        }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
