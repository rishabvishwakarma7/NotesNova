'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for getting started',
    features: ['5 AI chats/day', '3 note generations/day', 'Basic editor', 'Dark/light mode', '1 folder'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    desc: 'For serious students',
    features: ['Unlimited AI chats', 'Unlimited note generation', 'Advanced editor', 'PDF upload', 'Unlimited folders', 'Flashcard generator', 'Voice input', 'Priority support'],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Team',
    price: '$19',
    period: '/month',
    desc: 'For study groups',
    features: ['Everything in Pro', 'Collaborative notes', '5 team members', 'Shared folders', 'Admin dashboard', 'API access'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{
      padding: '120px 24px', maxWidth: 1200, margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>
          Start free. Upgrade when you need more power.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}>
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            style={{ position: 'relative' }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                padding: '4px 16px', borderRadius: 50,
                background: 'var(--gradient-primary)',
                color: 'white', fontSize: 12, fontWeight: 700,
                zIndex: 2,
              }}>
                MOST POPULAR
              </div>
            )}
            <div
              className="glass"
              style={{
                padding: 36,
                border: plan.popular ? '2px solid rgba(139,92,246,0.4)' : '1px solid var(--border-color)',
                boxShadow: plan.popular ? '0 0 40px rgba(139,92,246,0.15)' : 'none',
                borderRadius: 20,
              }}
            >
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: 'var(--text-primary)' }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <Link
                href="/sign-up"
                className={plan.popular ? 'btn-primary' : 'btn-secondary'}
                style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  marginBottom: 28, width: '100%',
                }}
              >
                {plan.cta}
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Check size={16} color="#10B981" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
