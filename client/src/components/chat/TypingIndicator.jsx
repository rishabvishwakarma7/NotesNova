'use client';

import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'var(--gradient-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Sparkles size={16} color="white" />
      </div>
      <div className="msg-ai" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#8B5CF6',
                animation: `typing-dots 1.4s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
