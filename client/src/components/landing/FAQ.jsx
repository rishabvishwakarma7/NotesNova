'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What AI model does NoteNova use?', a: 'NoteNova uses GPT-4o by OpenAI, the most advanced AI model available. It provides intelligent, accurate responses for studying, coding, research, and exam preparation.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use Clerk for enterprise-grade authentication, and all your notes and chats are encrypted. Your data is never shared or used for training.' },
  { q: 'Can I use NoteNova offline?', a: 'The AI features require an internet connection. However, notes you\'ve already generated can be accessed offline through browser caching in the future.' },
  { q: 'What subjects does NoteNova support?', a: 'NoteNova supports every subject — from medicine and engineering to arts and business. The AI adapts to any topic you provide.' },
  { q: 'How does the chat-to-notes feature work?', a: 'Simply click the "Save as Note" button on any AI response in the chat. It will be converted into an editable note in your workspace that you can modify, organize, and tag.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your Pro or Team subscription at any time. You\'ll continue to have access until the end of your billing period.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" style={{
      padding: '120px 24px', maxWidth: 800, margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className="glass"
              style={{ borderRadius: 14, overflow: 'hidden' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '20px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-primary)', fontSize: 16, fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                {faq.q}
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={20} color="var(--text-muted)" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{
                      padding: '0 24px 20px',
                      fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
                    }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
