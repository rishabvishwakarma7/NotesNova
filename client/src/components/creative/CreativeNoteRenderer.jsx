'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Lightbulb, AlertTriangle, CheckCircle2, Star,
  Code2, ArrowRight, Brain, RefreshCw, ChevronDown, ChevronUp, Copy, Check,
} from 'lucide-react';

// ── Semantic color system ──────────────────────────────────────────────────
const THEME = {
  blue:   { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', dark: { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  text: '#93C5FD' } },
  green:  { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dark: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#6EE7B7' } },
  orange: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', dark: { bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)',  text: '#FB923C' } },
  purple: { bg: '#FAF5FF', border: '#E9D5FF', text: '#7C3AED', dark: { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)',  text: '#C4B5FD' } },
  yellow: { bg: '#FEFCE8', border: '#FDE68A', text: '#B45309', dark: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  text: '#FCD34D' } },
  red:    { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dark: { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',   text: '#FDA4AF' } },
  pink:   { bg: '#FDF2F8', border: '#F9A8D4', text: '#9D174D', dark: { bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.25)',  text: '#F9A8D4' } },
  teal:   { bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E', dark: { bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.25)',  text: '#5EEAD4' } },
};

function useThemeColor(color = 'purple') {
  const isDark = typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') !== 'light';
  const t = THEME[color] || THEME.purple;
  return isDark ? t.dark : t;
}

// ── Cover Card ─────────────────────────────────────────────────────────────
function CoverCard({ notes }) {
  const levelColors = { beginner: '#10B981', intermediate: '#6366F1', advanced: '#F43F5E' };
  const color = levelColors[notes.level] || '#8B5CF6';
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: '36px 32px', borderRadius: 20, marginBottom: 20, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}35` }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%',
        background: `${color}10`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 52, lineHeight: 1 }}>{notes.emoji || '📖'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {notes.subject && (
              <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`,
                padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {notes.subject}
              </span>
            )}
            {notes.level && (
              <span style={{ fontSize: 11, fontWeight: 700, color: 'white', background: color,
                padding: '3px 10px', borderRadius: 20 }}>
                {notes.level.charAt(0).toUpperCase() + notes.level.slice(1)}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 8 }}>
            {notes.title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {notes.sections?.length || 0} sections · Visual study guide
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Table of Contents ──────────────────────────────────────────────────────
function TableOfContents({ sections }) {
  const icons = { overview:'📋', definitions:'📖', concepts:'💡', flowchart:'🔄',
    comparison:'⚖️', examples:'🧪', tips:'⚠️', memory:'🧠', quiz:'❓', summary:'✅' };
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
      style={{ padding: '20px 22px', borderRadius: 16, marginBottom: 20,
        background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: 12 }}>📑 Contents</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sections.map((s, i) => (
          <a key={i} href={`#section-${i}`}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
              borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.color = 'var(--color-primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            {icons[s.type] || '📄'} {s.title}
          </a>
        ))}
      </div>
    </motion.div>
  );
}

// ── Section card wrapper ───────────────────────────────────────────────────
function SectionCard({ id, children, delay = 0 }) {
  return (
    <motion.div id={`section-${id}`}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay * 0.06 }}
      style={{ marginBottom: 18 }}>
      {children}
    </motion.div>
  );
}

function SectionHeader({ emoji, title, color = '#8B5CF6' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {emoji}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────
function OverviewSection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid var(--border-color)' }}>
      <SectionHeader emoji="📋" title={section.title} color="#6366F1" />
      {section.content && (
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: section.keyPoints?.length ? 16 : 0 }}>
          {section.content}
        </p>
      )}
      {section.keyPoints?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.keyPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
              borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <CheckCircle2 size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{pt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Definitions ────────────────────────────────────────────────────────────
function DefinitionsSection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(16,185,129,0.2)' }}>
      <SectionHeader emoji="📖" title={section.title} color="#10B981" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {(section.items || []).map((item, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: 12,
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.18)' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#10B981', marginBottom: 5 }}>{item.term}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Concepts ───────────────────────────────────────────────────────────────
function ConceptsSection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(99,102,241,0.2)' }}>
      <SectionHeader emoji="💡" title={section.title} color="#6366F1" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(section.items || []).map((item, i) => (
          <div key={i} style={{ padding: '16px 18px', borderRadius: 13,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6366F1' }}>{i + 1}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: item.example ? 8 : 0 }}>
              {item.explanation}
            </p>
            {item.example && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.07)',
                border: '1px solid rgba(249,115,22,0.2)', fontSize: 12, color: '#F59E0B' }}>
                🧪 {item.example}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Flowchart ──────────────────────────────────────────────────────────────
function FlowchartSection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(6,182,212,0.2)' }}>
      <SectionHeader emoji="🔄" title={section.title} color="#06B6D4" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(section.steps || []).map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#06B6D415',
                border: '2px solid #06B6D460', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#06B6D4', zIndex: 1 }}>
                {step.step || i + 1}
              </div>
              {i < (section.steps.length - 1) && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: '#06B6D425', margin: '2px 0' }} />
              )}
            </div>
            <div style={{ padding: '6px 0 20px 12px', flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{step.label}</p>
              {step.description && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Comparison Table ───────────────────────────────────────────────────────
function ComparisonSection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(139,92,246,0.2)' }}>
      <SectionHeader emoji="⚖️" title={section.title} color="#8B5CF6" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          {section.headers?.length > 0 && (
            <thead>
              <tr>
                {section.headers.map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700,
                    color: '#8B5CF6', background: 'rgba(139,92,246,0.08)',
                    borderBottom: '2px solid rgba(139,92,246,0.2)',
                    borderRight: i < section.headers.length - 1 ? '1px solid var(--border-color)' : 'none',
                    borderRadius: i === 0 ? '8px 0 0 0' : i === section.headers.length - 1 ? '0 8px 0 0' : 0 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {(section.rows || []).map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                  <td key={ci} style={{ padding: '10px 14px', color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: ci === 0 ? 600 : 400,
                    borderBottom: '1px solid var(--border-color)',
                    borderRight: ci < (Array.isArray(row) ? row.length : 1) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Examples ───────────────────────────────────────────────────────────────
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;
  return (
    <div style={{ position: 'relative', marginTop: 10 }}>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 6,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          color: copied ? '#10B981' : '#9CA3AF', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
      </button>
      <pre style={{ padding: '14px 16px', borderRadius: 10, background: '#0D1117',
        color: '#E6EDF3', fontSize: 12.5, lineHeight: 1.7, overflowX: 'auto',
        fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace", margin: 0 }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ExamplesSection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(249,115,22,0.2)' }}>
      <SectionHeader emoji="🧪" title={section.title} color="#F59E0B" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(section.items || []).map((item, i) => (
          <div key={i} style={{ padding: '16px 18px', borderRadius: 13,
            background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B', marginBottom: 6 }}>
              {i + 1}. {item.title}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: item.code ? 4 : 0 }}>
              {item.description}
            </p>
            {item.code && <CodeBlock code={item.code} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tips & Warnings ────────────────────────────────────────────────────────
function TipsSection({ section }) {
  const tipConfig = {
    tip:       { emoji: '💡', color: '#F59E0B', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)' },
    warning:   { emoji: '⚠️', color: '#F43F5E', bg: 'rgba(244,63,94,0.07)',   border: 'rgba(244,63,94,0.2)' },
    important: { emoji: '📌', color: '#6366F1', bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.2)' },
  };
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(245,158,11,0.2)' }}>
      <SectionHeader emoji="⚠️" title={section.title} color="#F59E0B" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(section.tips || []).map((tip, i) => {
          const cfg = tipConfig[tip.type] || tipConfig.tip;
          return (
            <div key={i} style={{ padding: '12px 16px', borderRadius: 10,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.emoji}</span>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Memory Tricks ──────────────────────────────────────────────────────────
function MemorySection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(236,72,153,0.2)' }}>
      <SectionHeader emoji="🧠" title={section.title} color="#EC4899" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
        {(section.tricks || []).map((trick, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: 12,
            background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.18)',
            display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>✨</span>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{trick}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quiz Section ───────────────────────────────────────────────────────────
function QuizSection({ section }) {
  const [answers,  setAnswers]  = useState({});
  const [revealed, setRevealed] = useState({});

  const select = (qi, opt) => {
    if (revealed[qi]) return;
    setAnswers(p => ({ ...p, [qi]: opt }));
  };
  const reveal = (qi) => setRevealed(p => ({ ...p, [qi]: true }));

  return (
    <div style={{ padding: '22px 24px', borderRadius: 16, background: 'var(--bg-card)',
      border: '1px solid rgba(99,102,241,0.2)' }}>
      <SectionHeader emoji="❓" title={section.title} color="#6366F1" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {(section.questions || []).map((q, qi) => {
          const chosen = answers[qi];
          const isRevealed = revealed[qi];
          const isCorrect = chosen && chosen.startsWith(q.answer);
          return (
            <div key={qi} style={{ padding: '16px 18px', borderRadius: 13, background: 'var(--bg-secondary)',
              border: `1px solid ${isRevealed ? (isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)') : 'var(--border-color)'}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Q{qi + 1}. {q.q}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {(q.options || []).map((opt, oi) => {
                  const letter = opt.charAt(0);
                  let bg = 'var(--bg-tertiary)', border = 'var(--border-color)', color = 'var(--text-primary)';
                  if (chosen === opt) { bg = 'rgba(99,102,241,0.12)'; border = '#6366F150'; color = 'var(--color-primary-light)'; }
                  if (isRevealed && opt.startsWith(q.answer)) { bg = 'rgba(16,185,129,0.12)'; border = 'rgba(16,185,129,0.4)'; color = '#10B981'; }
                  if (isRevealed && chosen === opt && !opt.startsWith(q.answer)) { bg = 'rgba(244,63,94,0.1)'; border = 'rgba(244,63,94,0.35)'; color = '#F43F5E'; }
                  return (
                    <button key={oi} onClick={() => select(qi, opt)}
                      style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${border}`,
                        background: bg, color, fontSize: 13, textAlign: 'left', cursor: isRevealed ? 'default' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {chosen && !isRevealed && (
                <button onClick={() => reveal(qi)}
                  style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'var(--gradient-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}>
                  Check Answer
                </button>
              )}
              {isRevealed && q.explanation && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.07)',
                  border: '1px solid rgba(99,102,241,0.18)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Summary ────────────────────────────────────────────────────────────────
function SummarySection({ section }) {
  return (
    <div style={{ padding: '22px 24px', borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(99,102,241,0.06))',
      border: '1px solid rgba(20,184,166,0.25)' }}>
      <SectionHeader emoji="✅" title={section.title} color="#14B8A6" />
      {section.points?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: section.examTips?.length ? 16 : 0 }}>
          {section.points.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Star size={14} color="#14B8A6" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{pt}</span>
            </div>
          ))}
        </div>
      )}
      {section.examTips?.length > 0 && (
        <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase',
            letterSpacing: '0.07em', marginBottom: 8 }}>🎯 Exam Tips</p>
          {section.examTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < section.examTips.length - 1 ? 6 : 0 }}>
              <ArrowRight size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section Router ─────────────────────────────────────────────────────────
function renderSection(section, i) {
  switch (section.type) {
    case 'overview':    return <OverviewSection    key={i} section={section} />;
    case 'definitions': return <DefinitionsSection key={i} section={section} />;
    case 'concepts':    return <ConceptsSection    key={i} section={section} />;
    case 'flowchart':   return <FlowchartSection   key={i} section={section} />;
    case 'comparison':  return <ComparisonSection  key={i} section={section} />;
    case 'examples':    return <ExamplesSection    key={i} section={section} />;
    case 'tips':        return <TipsSection        key={i} section={section} />;
    case 'memory':      return <MemorySection      key={i} section={section} />;
    case 'quiz':        return <QuizSection        key={i} section={section} />;
    case 'summary':     return <SummarySection     key={i} section={section} />;
    default: return (
      <div key={i} style={{ padding: '20px 22px', borderRadius: 14, background: 'var(--bg-card)',
        border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{section.title}</h2>
        {section.content && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{section.content}</p>}
      </div>
    );
  }
}

// ── Main Renderer ──────────────────────────────────────────────────────────
export default function CreativeNoteRenderer({ notes, onFollowUp }) {
  if (!notes) return null;
  const sections = notes.sections || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <CoverCard notes={notes} />
      {sections.length > 0 && <TableOfContents sections={sections} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map((section, i) => (
          <SectionCard key={i} id={i} delay={i}>
            {renderSection(section, i)}
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
