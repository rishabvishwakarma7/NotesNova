'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// ── Semantic color system (PDF-inspired) ──────────────────────────────────
// Blue=Concepts, Green=Definitions, Orange=Examples, Purple=Interview,
// Yellow=Important, Red=Warnings, Pink=Memory, Teal=Summary
const COLORS = {
  blue:   { bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.3)',  text:'#3B82F6',  head:'#1D4ED8' },
  green:  { bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.3)',  text:'#10B981',  head:'#065F46' },
  orange: { bg:'rgba(249,115,22,0.1)', border:'rgba(249,115,22,0.3)',  text:'#F97316',  head:'#C2410C' },
  purple: { bg:'rgba(139,92,246,0.1)', border:'rgba(139,92,246,0.3)',  text:'#8B5CF6',  head:'#5B21B6' },
  yellow: { bg:'rgba(234,179,8,0.12)', border:'rgba(234,179,8,0.35)',  text:'#CA8A04',  head:'#78350F' },
  red:    { bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.3)',   text:'#EF4444',  head:'#B91C1C' },
  pink:   { bg:'rgba(236,72,153,0.1)', border:'rgba(236,72,153,0.3)', text:'#EC4899',  head:'#9D174D' },
  teal:   { bg:'rgba(20,184,166,0.1)', border:'rgba(20,184,166,0.3)',  text:'#14B8A6',  head:'#115E59' },
};

// Section type → color + emoji (matches PDF design language)
const SECTION_THEME = {
  overview:    { color: COLORS.blue,   emoji: '📋', label: 'Overview' },
  definitions: { color: COLORS.green,  emoji: '📗', label: 'Key Definitions' },
  concepts:    { color: COLORS.blue,   emoji: '💡', label: 'Core Concepts' },
  flowchart:   { color: COLORS.teal,   emoji: '🔄', label: 'Flow / Process' },
  comparison:  { color: COLORS.purple, emoji: '⚖️', label: 'Comparison' },
  examples:    { color: COLORS.orange, emoji: '🧪', label: 'Examples' },
  tips:        { color: COLORS.yellow, emoji: '⚠️', label: 'Tips & Warnings' },
  memory:      { color: COLORS.pink,   emoji: '🧠', label: 'Memory Tricks' },
  quiz:        { color: COLORS.purple, emoji: '❓', label: 'Quick Quiz' },
  summary:     { color: COLORS.teal,   emoji: '✅', label: 'Key Takeaways' },
};

// ── Shared notebook section header (PDF-style bordered heading) ────────────
function SectionHeader({ emoji, title, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:color.bg,
        border:`2px solid ${color.border}`, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:20, flexShrink:0 }}>
        {emoji}
      </div>
      <div style={{ flex:1, borderBottom:`2px solid ${color.border}`, paddingBottom:6 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:color.text, margin:0,
          fontFamily:'inherit', letterSpacing:'-0.01em' }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ── Notebook card wrapper ──────────────────────────────────────────────────
function NoteCard({ color, children, style = {} }) {
  return (
    <div style={{ padding:'22px 24px', borderRadius:16,
      background:color.bg, border:`1px solid ${color.border}`,
      marginBottom:0, ...style }}>
      {children}
    </div>
  );
}

// ── Cover ─────────────────────────────────────────────────────────────────
function CoverSection({ notes }) {
  const lvlColors = { beginner:'#10B981', intermediate:'#6366F1', advanced:'#F43F5E' };
  const color = lvlColors[notes.level] || '#8B5CF6';
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      style={{ padding:'32px 28px', borderRadius:20, marginBottom:20,
        background:`linear-gradient(135deg, ${color}14, ${color}06)`,
        border:`2px solid ${color}30`, position:'relative', overflow:'hidden' }}>
      {/* Decorative ring */}
      <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160,
        borderRadius:'50%', border:`3px solid ${color}15`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100,
        borderRadius:'50%', border:`2px solid ${color}20`, pointerEvents:'none' }} />
      {/* Spiral binding dots (PDF aesthetic) */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:32,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-around',
        paddingTop:16, paddingBottom:16 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ width:14, height:14, borderRadius:'50%',
            background:'var(--bg-tertiary)', border:`2px solid var(--border-color)` }} />
        ))}
      </div>
      <div style={{ paddingLeft:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, flexWrap:'wrap' }}>
          <span style={{ fontSize:40 }}>{notes.emoji || '📝'}</span>
          <div>
            {notes.subject && (
              <span style={{ fontSize:11, fontWeight:800, color, background:`${color}18`,
                padding:'3px 12px', borderRadius:20, textTransform:'uppercase',
                letterSpacing:'0.08em', display:'inline-block', marginBottom:6 }}>
                {notes.subject}
              </span>
            )}
            <h1 style={{ fontSize:28, fontWeight:900, color:'var(--text-primary)',
              lineHeight:1.15, margin:0 }}>{notes.title}</h1>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {notes.level && (
            <span style={{ fontSize:12, fontWeight:700, color:'white', background:color,
              padding:'4px 14px', borderRadius:20 }}>
              {notes.level.charAt(0).toUpperCase() + notes.level.slice(1)}
            </span>
          )}
          <span style={{ fontSize:12, color:'var(--text-muted)',
            padding:'4px 14px', borderRadius:20, background:'var(--bg-tertiary)',
            border:'1px solid var(--border-color)' }}>
            {notes.sections?.length || 0} sections
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Table of Contents ──────────────────────────────────────────────────────
function TOC({ sections }) {
  const items = sections.filter(s => SECTION_THEME[s.type]);
  if (!items.length) return null;
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
      style={{ padding:'18px 22px', borderRadius:16, marginBottom:20,
        background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
      <p style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase',
        letterSpacing:'0.1em', marginBottom:12 }}>📑 Contents</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {items.map((s, i) => {
          const th = SECTION_THEME[s.type];
          return (
            <a key={i} href={`#cn-${i}`}
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px',
                borderRadius:20, fontSize:12, fontWeight:600, textDecoration:'none',
                background:th.color.bg, border:`1px solid ${th.color.border}`,
                color:th.color.text, transition:'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <span style={{ fontSize:13 }}>{th.emoji}</span> {s.title || th.label}
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Code block ────────────────────────────────────────────────────────────
function CodeBlock({ code, lang = '' }) {
  const [copied, setCopied] = useState(false);
  if (!code?.trim()) return null;
  return (
    <div style={{ position:'relative', marginTop:10, borderRadius:12, overflow:'hidden',
      border:'1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 14px', background:'#161B22', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['#FF5F57','#FFBD2E','#28C840'].map(c => (
            <div key={c} style={{ width:11, height:11, borderRadius:'50%', background:c }} />
          ))}
        </div>
        {lang && <span style={{ fontSize:10, color:'#8B949E', fontWeight:600, textTransform:'uppercase' }}>{lang}</span>}
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:11,
            color: copied ? '#10B981' : '#8B949E', fontWeight:600, padding:'2px 8px',
            borderRadius:6, transition:'color 0.15s' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin:0, padding:'14px 16px', background:'#0D1117',
        color:'#E6EDF3', fontSize:13, lineHeight:1.7, overflowX:'auto',
        fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// ── All section renderers ─────────────────────────────────────────────────
function OverviewSection({ s, idx }) {
  const th = SECTION_THEME.overview;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`}>
      <SectionHeader emoji={th.emoji} title={s.title || 'Overview'} color={th.color} />
      {s.content && <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.8, marginBottom:s.keyPoints?.length?14:0 }}>{s.content}</p>}
      {s.keyPoints?.map((p,i)=>(
        <div key={i} style={{ display:'flex', gap:10, padding:'8px 12px', borderRadius:10,
          background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', marginBottom:8 }}>
          <span style={{ color:'#3B82F6', fontWeight:800, flexShrink:0 }}>★</span>
          <span style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6 }}>{p}</span>
        </div>
      ))}
    </NoteCard>
  );
}

function DefinitionsSection({ s, idx }) {
  const th = SECTION_THEME.definitions;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`}>
      <SectionHeader emoji={th.emoji} title={s.title || 'Key Definitions'} color={th.color} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
        {s.items?.map((item,i)=>(
          <div key={i} style={{ padding:'12px 16px', borderRadius:12,
            background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ fontSize:13, fontWeight:800, color:'#10B981', marginBottom:5 }}>{item.term}</p>
            <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>{item.definition}</p>
          </div>
        ))}
      </div>
    </NoteCard>
  );
}

function ConceptsSection({ s, idx }) {
  const th = SECTION_THEME.concepts;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`}>
      <SectionHeader emoji={th.emoji} title={s.title || 'Core Concepts'} color={th.color} />
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {s.items?.map((item,i)=>(
          <div key={i} style={{ padding:'14px 16px', borderRadius:13,
            background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
            <div style={{ display:'flex', gap:10, marginBottom:6, alignItems:'center' }}>
              <div style={{ width:24, height:24, borderRadius:7, background:'rgba(59,130,246,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, color:'#3B82F6', flexShrink:0 }}>{i+1}</div>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{item.name}</p>
            </div>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:item.example?8:0 }}>{item.explanation}</p>
            {item.example && (
              <div style={{ padding:'7px 11px', borderRadius:8, background:'rgba(249,115,22,0.08)',
                border:'1px solid rgba(249,115,22,0.2)', fontSize:12, color:'#F97316' }}>
                🧪 {item.example}
              </div>
            )}
          </div>
        ))}
      </div>
    </NoteCard>
  );
}

function FlowchartSection({ s, idx }) {
  const th = SECTION_THEME.flowchart;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`}>
      <SectionHeader emoji={th.emoji} title={s.title || 'Process Flow'} color={th.color} />
      <div style={{ position:'relative', paddingLeft:32 }}>
        <div style={{ position:'absolute', left:15, top:8, bottom:8, width:2,
          background:'rgba(20,184,166,0.3)', borderRadius:1 }} />
        {s.steps?.map((step,i)=>(
          <div key={i} style={{ display:'flex', gap:14, marginBottom:14, position:'relative' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(20,184,166,0.15)',
              border:'2px solid rgba(20,184,166,0.5)', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:13, fontWeight:800, color:'#14B8A6',
              flexShrink:0, zIndex:1, marginLeft:-15 }}>
              {step.step||i+1}
            </div>
            <div style={{ paddingTop:4 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:3 }}>{step.label}</p>
              {step.description && <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>{step.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </NoteCard>
  );
}

function ComparisonSection({ s, idx }) {
  const th = SECTION_THEME.comparison;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`}>
      <SectionHeader emoji={th.emoji} title={s.title || 'Comparison'} color={th.color} />
      <div style={{ overflowX:'auto', borderRadius:10, overflow:'hidden', border:'1px solid rgba(139,92,246,0.25)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          {s.headers?.length>0 && (
            <thead>
              <tr>{s.headers.map((h,i)=>(
                <th key={i} style={{ padding:'10px 14px', textAlign:'left', fontWeight:700,
                  color:'#8B5CF6', background:'rgba(139,92,246,0.1)',
                  borderBottom:'2px solid rgba(139,92,246,0.25)' }}>{h}</th>
              ))}</tr>
            </thead>
          )}
          <tbody>{(s.rows||[]).map((row,ri)=>(
            <tr key={ri} style={{ background:ri%2===0?'transparent':'rgba(139,92,246,0.03)' }}>
              {(Array.isArray(row)?row:[row]).map((cell,ci)=>(
                <td key={ci} style={{ padding:'9px 14px', borderBottom:'1px solid rgba(139,92,246,0.1)',
                  color:ci===0?'var(--text-primary)':'var(--text-secondary)', fontWeight:ci===0?600:400 }}>{cell}</td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </NoteCard>
  );
}

function ExamplesSection({ s, idx }) {
  const th = SECTION_THEME.examples;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`}>
      <SectionHeader emoji={th.emoji} title={s.title || 'Examples'} color={th.color} />
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {s.items?.map((item,i)=>(
          <div key={i} style={{ padding:'14px 16px', borderRadius:13,
            background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.18)' }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#F97316', marginBottom:6 }}>{i+1}. {item.title}</p>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:item.code?4:0 }}>{item.description}</p>
            {item.code && <CodeBlock code={item.code} lang="python" />}
          </div>
        ))}
      </div>
    </NoteCard>
  );
}

function TipsSection({ s, idx }) {
  const cfgMap = {
    tip:      { emoji:'💡', color: COLORS.yellow },
    warning:  { emoji:'⚠️', color: COLORS.red },
    important:{ emoji:'📌', color: COLORS.blue },
  };
  return (
    <div id={`cn-${idx}`}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:20 }}>⚠️</span>
        <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)' }}>{s.title||'Tips & Warnings'}</h2>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {s.tips?.map((tip,i)=>{
          const c = cfgMap[tip.type]||cfgMap.tip;
          return (
            <div key={i} style={{ padding:'12px 16px', borderRadius:12,
              background:c.color.bg, border:`1px solid ${c.color.border}`,
              display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{c.emoji}</span>
              <p style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6 }}>{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemorySection({ s, idx }) {
  return (
    <div id={`cn-${idx}`}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:20 }}>🧠</span>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#EC4899' }}>{s.title||'Memory Tricks'}</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:10 }}>
        {s.tricks?.map((t,i)=>(
          <div key={i} style={{ padding:'14px 16px', borderRadius:12,
            background:'rgba(236,72,153,0.07)', border:'1px solid rgba(236,72,153,0.2)',
            display:'flex', gap:9, alignItems:'flex-start' }}>
            <span style={{ fontSize:18, flexShrink:0 }}>✨</span>
            <p style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.55 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizSection({ s, idx }) {
  const [answers, setAnswers] = useState({});
  const [shown,   setShown]   = useState({});
  return (
    <div id={`cn-${idx}`}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:20 }}>❓</span>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#8B5CF6' }}>{s.title||'Quick Quiz'}</h2>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {s.questions?.map((q,qi)=>{
          const chosen = answers[qi];
          const revealed = shown[qi];
          return (
            <div key={qi} style={{ padding:'16px 18px', borderRadius:14,
              background:'var(--bg-secondary)', border:`1px solid ${revealed?(chosen&&chosen.startsWith(q.answer)?'rgba(16,185,129,0.4)':'rgba(244,63,94,0.3)'):'var(--border-color)'}` }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:10 }}>Q{qi+1}. {q.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
                {q.options?.map((opt,oi)=>{
                  let bg='var(--bg-tertiary)', border='var(--border-color)', color='var(--text-primary)';
                  if(chosen===opt&&!revealed){bg='rgba(99,102,241,0.12)';border='rgba(99,102,241,0.4)';color='var(--color-primary-light)';}
                  if(revealed&&opt.startsWith(q.answer)){bg='rgba(16,185,129,0.12)';border='rgba(16,185,129,0.4)';color='#10B981';}
                  if(revealed&&chosen===opt&&!opt.startsWith(q.answer)){bg='rgba(244,63,94,0.1)';border='rgba(244,63,94,0.35)';color='#F43F5E';}
                  return (
                    <button key={oi} onClick={()=>!revealed&&setAnswers(p=>({...p,[qi]:opt}))}
                      style={{ padding:'8px 12px', borderRadius:9, border:`1px solid ${border}`,
                        background:bg, color, fontSize:13, textAlign:'left', cursor:revealed?'default':'pointer',
                        fontFamily:'inherit', transition:'all 0.15s' }}>{opt}</button>
                  );
                })}
              </div>
              {chosen&&!revealed&&(
                <button onClick={()=>setShown(p=>({...p,[qi]:true}))}
                  style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer',
                    background:'var(--gradient-primary)', color:'white', fontSize:12, fontWeight:700 }}>
                  Check Answer
                </button>
              )}
              {revealed&&q.explanation&&(
                <div style={{ padding:'9px 12px', borderRadius:8, background:'rgba(139,92,246,0.07)',
                  border:'1px solid rgba(139,92,246,0.2)', fontSize:12, color:'var(--text-secondary)' }}>
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

function SummarySection({ s, idx }) {
  const th = SECTION_THEME.summary;
  return (
    <NoteCard color={th.color} id={`cn-${idx}`} style={{ background:'linear-gradient(135deg,rgba(20,184,166,0.09),rgba(99,102,241,0.06))' }}>
      <SectionHeader emoji={th.emoji} title={s.title||'Key Takeaways'} color={th.color} />
      {s.points?.map((p,i)=>(
        <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
          <span style={{ color:'#14B8A6', fontWeight:800, flexShrink:0 }}>★</span>
          <span style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6 }}>{p}</span>
        </div>
      ))}
      {s.examTips?.length>0&&(
        <div style={{ marginTop:14, padding:'12px 16px', borderRadius:12,
          background:'rgba(245,158,11,0.09)', border:'1px solid rgba(245,158,11,0.25)' }}>
          <p style={{ fontSize:11, fontWeight:800, color:'#F59E0B', textTransform:'uppercase',
            letterSpacing:'0.08em', marginBottom:8 }}>🎯 Exam Tips</p>
          {s.examTips.map((t,i)=>(
            <p key={i} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4, lineHeight:1.5 }}>→ {t}</p>
          ))}
        </div>
      )}
    </NoteCard>
  );
}

// ── Section router ─────────────────────────────────────────────────────────
function renderSection(s, i) {
  const props = { s, idx:i };
  switch(s.type) {
    case 'overview':    return <OverviewSection    {...props} />;
    case 'definitions': return <DefinitionsSection {...props} />;
    case 'concepts':    return <ConceptsSection    {...props} />;
    case 'flowchart':   return <FlowchartSection   {...props} />;
    case 'comparison':  return <ComparisonSection  {...props} />;
    case 'examples':    return <ExamplesSection    {...props} />;
    case 'tips':        return <TipsSection        {...props} />;
    case 'memory':      return <MemorySection      {...props} />;
    case 'quiz':        return <QuizSection        {...props} />;
    case 'summary':     return <SummarySection     {...props} />;
    default: return (
      <div id={`cn-${i}`} style={{ padding:'20px', borderRadius:14,
        background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>{s.title}</h2>
        {s.content&&<p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{s.content}</p>}
      </div>
    );
  }
}

// ── Main export ────────────────────────────────────────────────────────────
export default function CreativeNoteRenderer({ notes }) {
  if (!notes) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <CoverSection notes={notes} />
      <TOC sections={notes.sections||[]} />
      {(notes.sections||[]).map((s,i)=>(
        <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:i*0.05 }}>
          {renderSection(s, i)}
        </motion.div>
      ))}
    </div>
  );
}
