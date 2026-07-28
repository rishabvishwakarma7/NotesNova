'use client';

import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'var(--gradient-ai)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        <Sparkles size={13} color="white" />
      </div>
      <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', gap: 5 }}>
        <style>{`
          @keyframes bounce-dot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--color-ai)',
            animation: 'bounce-dot 1.3s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
