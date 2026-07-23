'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '60px 24px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 40,
          marginBottom: 48,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                Note<span className="gradient-text">Nova</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              AI-powered study platform for students who want to learn smarter.
            </p>
          </div>

          {[
            { title: 'Product', links: ['AI Chat', 'Notes Generator', 'Editor', 'Flashcards'] },
            { title: 'Resources', links: ['Documentation', 'Blog', 'Tutorials', 'API'] },
            { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {col.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link, j) => (
                  <a key={j} href="#" style={{
                    fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            © 2026 NoteNova AI. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Twitter', 'GitHub', 'Discord'].map(s => (
              <a key={s} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
