'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, Star, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';

// PDF-inspired color palette — semantic, never random
const C = {
  blue:   { bg:'rgba(59,130,246,0.08)',   border:'rgba(59,130,246,0.25)',  accent:'#3B82F6', light:'#EFF6FF' },
  green:  { bg:'rgba(16,185,129,0.08)',   border:'rgba(16,185,129,0.25)',  accent:'#10B981', light:'#F0FDF4' },
  orange: { bg:'rgba(249,115,22,0.08)',   border:'rgba(249,115,22,0.25)',  accent:'#F97316', light:'#FFF7ED' },
  purple: { bg:'rgba(139,92,246,0.08)',   border:'rgba(139,92,246,0.25)',  accent:'#8B5CF6', light:'#FAF5FF' },
  yellow: { bg:'rgba(234,179,8,0.1)',     border:'rgba(234,179,8,0.3)',    accent:'#EAB308', light:'#FEFCE8' },
  red:    { bg:'rgba(239,68,68,0.08)',    border:'rgba(239,68,68,0.25)',   accent:'#EF4444', light:'#FFF1F2' },
  pink:   { bg:'rgba(236,72,153,0.08)',   border:'rgba(236,72,153,0.25)', accent:'#EC4899', light:'#FDF2F8' },
  teal:   { bg:'rgba(20,184,166,0.08)',   border:'rgba(20,184,166,0.25)',  accent:'#14B8A6', light:'#F0FDFA' },
};

const SEC = {
  overview:    { ...C.blue,   emoji:'📋', title_color:'#3B82F6' },
  definitions: { ...C.green,  emoji:'📖', title_color:'#10B981' },
  concepts:    { ...C.purple, emoji:'💡', title_color:'#8B5CF6' },
  flowchart:   { ...C.teal,   emoji:'🔄', title_color:'#14B8A6' },
  comparison:  { ...C.purple, emoji:'⚖️', title_color:'#8B5CF6' },
  examples:    { ...C.orange, emoji:'🧪', title_color:'#F97316' },
  tips:        { ...C.yellow, emoji:'⚠️', title_color:'#EAB308' },
  memory:      { ...C.pink,   emoji:'🧠', title_color:'#EC4899' },
  quiz:        { ...C.blue,   emoji:'❓', title_color:'#3B82F6' },
  summary:     { ...C.teal,   emoji:'✅', title_color:'#14B8A6' },
};

// ── Notebook Header (PDF-inspired spiral/notebook look) ──────────────────
function NoteHeader({ notes }) {
  const colors = { blue:'#3B82F6', green:'#10B981', orange:'#F97316', purple:'#8B5CF6', teal:'#14B8A6' };
  const accent = colors[notes.color] || '#8B5CF6';
  return (
    <div style={{ marginBottom:20, borderRadius:20, overflow:'hidden',
      border:`2px solid ${accent}40`, boxShadow:`0 8px 32px ${accent}15` }}>
      {/* Spiral holes strip */}
      <div style={{ height:28, background:`${accent}15`,
        display:'flex', alignItems:'center', paddingLeft:16, gap:14, borderBottom:`1px solid ${accent}20` }}>
        {[...Array(12)].map((_,i) => (
          <div key={i} style={{ width:14, height:14, borderRadius:'50%',
            background:`${accent}30`, border:`2px solid ${accent}50` }} />
        ))}
      </div>
      {/* Title area */}
      <div style={{ padding:'24px 28px', background:'var(--bg-card)',
        display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
        <div style={{ fontSize:56, lineHeight:1 }}>{notes.emoji || '📚'}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            {notes.subject && (
              <span style={{ fontSize:11, fontWeight:800, color:accent,
                background:`${accent}12`, padding:'3px 12px', borderRadius:20,
                textTransform:'uppercase', letterSpacing:'0.08em', border:`1px solid ${accent}30` }}>
                {notes.subject}
              </span>
            )}
            {notes.level && (
              <span style={{ fontSize:11, fontWeight:700, color:'white',
                background: accent, padding:'3px 12px', borderRadius:20 }}>
                {notes.level.charAt(0).toUpperCase() + notes.level.slice(1)}
              </span>
            )}
          </div>
          <h1 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:900,
            color:'var(--text-primary)', lineHeight:1.2, marginBottom:6 }}>
            {notes.title}
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            {notes.sections?.length || 0} sections · Visual study guide · NoteNova AI
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Table of Contents (PDF-style pill links) ──────────────────────────────
function TOC({ sections }) {
  const types = sections.map(s => s.type);
  return (
    <div style={{ padding:'16px 20px', borderRadius:16, marginBottom:20,
      background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
      <p style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)',
        textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>📑 Contents</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {sections.map((s, i) => {
          const cfg = SEC[s.type] || SEC.overview;
          return (
            <a key={i} href={`#cn-${i}`} style={{ display:'inline-flex', alignItems:'center',
              gap:5, padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:600,
              textDecoration:'none', background:cfg.bg, border:`1px solid ${cfg.border}`,
              color:cfg.accent, transition:'all 0.15s', whiteSpace:'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <span>{cfg.emoji}</span> {s.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── Section Header (PDF-style colored banner) ─────────────────────────────
function SectionBanner({ type, title, idx }) {
  const cfg = SEC[type] || SEC.overview;
  return (
    <div id={`cn-${idx}`} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <div style={{ width:44, height:44, borderRadius:13, background:cfg.bg,
        border:`2px solid ${cfg.border}`, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:22, flexShrink:0 }}>
        {cfg.emoji}
      </div>
      <div style={{ flex:1, padding:'10px 18px', borderRadius:12,
        background:cfg.bg, border:`2px solid ${cfg.border}` }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:cfg.accent, margin:0 }}>{title}</h2>
      </div>
    </div>
  );
}

// ── Code Block (dark terminal style, PDF-inspired box) ────────────────────
function CodeBlock({ code, lang = '' }) {
  const [copied, setCopied] = useState(false);
  if (!code?.trim()) return null;
  return (
    <div style={{ borderRadius:12, overflow:'hidden', marginTop:10, border:'2px solid rgba(99,102,241,0.3)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 14px', background:'#1a1a2e', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['#FF6B6B','#FFD93D','#6BCB77'].map((c,i) => (
            <div key={i} style={{ width:11, height:11, borderRadius:'50%', background:c }} />
          ))}
        </div>
        {lang && <span style={{ fontSize:10, color:'#888', fontFamily:'monospace' }}>{lang}</span>}
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:6,
            background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer',
            color: copied ? '#6BCB77' : '#9CA3AF', fontSize:11, fontWeight:600 }}>
          {copied ? <Check size={11}/> : <Copy size={11}/>} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ padding:'16px', background:'#0D1117', color:'#E6EDF3',
        fontSize:13, lineHeight:1.7, overflowX:'auto', margin:0,
        fontFamily:"'JetBrains Mono','Fira Code',Consolas,monospace" }}>
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// ── Overview Section ───────────────────────────────────────────────────────
function OverviewSection({ section, idx }) {
  const cfg = SEC.overview;
  return (
    <motion.div id={`cn-${idx}`} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="overview" title={section.title} idx={idx} />
      <div style={{ padding:'18px 22px', borderRadius:14,
        background:cfg.bg, border:`1.5px solid ${cfg.border}`, marginBottom:4 }}>
        {section.content && (
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.75,
            marginBottom: section.keyPoints?.length ? 14 : 0 }}>{section.content}</p>
        )}
        {section.keyPoints?.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {section.keyPoints.map((pt, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>⭐</span>
                <span style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6, fontWeight:500 }}>{pt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Definitions Section (PDF green cards) ─────────────────────────────────
function DefinitionsSection({ section, idx }) {
  const cfg = SEC.definitions;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="definitions" title={section.title} idx={idx} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:12 }}>
        {(section.items||[]).map((item, i) => (
          <div key={i} style={{ padding:'16px 18px', borderRadius:14,
            background:cfg.bg, border:`1.5px solid ${cfg.border}`,
            position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, width:4, height:'100%', background:cfg.accent }} />
            <p style={{ fontSize:13, fontWeight:800, color:cfg.accent, marginBottom:6, paddingLeft:8 }}>
              {item.term}
            </p>
            <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6, paddingLeft:8 }}>
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Concepts Section (numbered purple cards) ──────────────────────────────
function ConceptsSection({ section, idx }) {
  const cfg = SEC.concepts;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="concepts" title={section.title} idx={idx} />
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {(section.items||[]).map((item, i) => (
          <div key={i} style={{ padding:'18px 20px', borderRadius:14,
            background:'var(--bg-card)', border:`1.5px solid ${cfg.border}`,
            display:'flex', gap:14 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:cfg.bg,
              border:`2px solid ${cfg.border}`, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:14, fontWeight:900, color:cfg.accent, flexShrink:0 }}>
              {i+1}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:800, color:cfg.accent, marginBottom:6 }}>{item.name}</p>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6,
                marginBottom: item.example ? 8 : 0 }}>{item.explanation}</p>
              {item.example && (
                <div style={{ padding:'8px 12px', borderRadius:9,
                  background:'rgba(249,115,22,0.07)', border:'1px solid rgba(249,115,22,0.2)',
                  fontSize:12, color:'#F97316', fontStyle:'italic' }}>
                  🧪 Example: {item.example}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Flowchart Section (PDF process diagram style) ─────────────────────────
function FlowchartSection({ section, idx }) {
  const cfg = SEC.flowchart;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="flowchart" title={section.title} idx={idx} />
      <div style={{ padding:'20px', borderRadius:14, background:cfg.bg, border:`1.5px solid ${cfg.border}` }}>
        {(section.steps||[]).map((step, i) => (
          <div key={i} style={{ display:'flex', alignItems:'stretch', gap:0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:52, flexShrink:0 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:cfg.accent,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, fontWeight:900, color:'white', flexShrink:0, zIndex:1 }}>
                {step.step || i+1}
              </div>
              {i < (section.steps.length-1) && (
                <div style={{ width:2, flex:1, minHeight:20, background:`${cfg.accent}30`, margin:'2px 0' }} />
              )}
            </div>
            <div style={{ paddingLeft:14, paddingBottom: i < section.steps.length-1 ? 20 : 0, flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:3 }}>
                {step.label}
              </p>
              {step.description && (
                <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.55 }}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Comparison Table (PDF table style) ────────────────────────────────────
function ComparisonSection({ section, idx }) {
  const cfg = SEC.comparison;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="comparison" title={section.title} idx={idx} />
      <div style={{ borderRadius:14, overflow:'hidden', border:`1.5px solid ${cfg.border}` }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            {section.headers?.length > 0 && (
              <thead>
                <tr>
                  {section.headers.map((h, i) => (
                    <th key={i} style={{ padding:'12px 16px', textAlign:'left', fontWeight:800,
                      color:cfg.accent, background:cfg.bg,
                      borderBottom:`2px solid ${cfg.border}`,
                      borderRight: i < section.headers.length-1 ? `1px solid ${cfg.border}` : 'none' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(section.rows||[]).map((row, ri) => (
                <tr key={ri} style={{ background: ri%2===0 ? 'var(--bg-card)' : cfg.bg }}>
                  {(Array.isArray(row)?row:[row]).map((cell, ci) => (
                    <td key={ci} style={{ padding:'11px 16px',
                      color: ci===0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: ci===0 ? 600 : 400,
                      borderBottom:`1px solid ${cfg.border}`,
                      borderRight: ci < (Array.isArray(row)?row.length:1)-1 ? `1px solid ${cfg.border}` : 'none' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ── Examples Section (PDF orange example boxes) ───────────────────────────
function ExamplesSection({ section, idx }) {
  const cfg = SEC.examples;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="examples" title={section.title} idx={idx} />
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {(section.items||[]).map((item, i) => (
          <div key={i} style={{ borderRadius:14, overflow:'hidden',
            border:`1.5px solid ${cfg.border}` }}>
            <div style={{ padding:'12px 16px', background:cfg.bg,
              borderBottom: (item.description || item.code) ? `1px solid ${cfg.border}` : 'none',
              display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:cfg.accent,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:900, color:'white', flexShrink:0 }}>
                {i+1}
              </div>
              <p style={{ fontSize:14, fontWeight:800, color:cfg.accent }}>{item.title}</p>
            </div>
            {item.description && (
              <div style={{ padding:'12px 16px', background:'var(--bg-card)' }}>
                <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65 }}>
                  {item.description}
                </p>
                {item.code && <CodeBlock code={item.code} lang="python" />}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Tips Section (PDF important note / warning boxes) ─────────────────────
function TipsSection({ section, idx }) {
  const TIP_CFG = {
    tip:       { ...C.yellow, icon:'💡', label:'Tip' },
    warning:   { ...C.red,    icon:'⚠️', label:'Warning' },
    important: { ...C.blue,   icon:'📌', label:'Important' },
  };
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="tips" title={section.title} idx={idx} />
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {(section.tips||[]).map((tip, i) => {
          const tc = TIP_CFG[tip.type] || TIP_CFG.tip;
          return (
            <div key={i} style={{ display:'flex', gap:12, padding:'14px 18px', borderRadius:12,
              background:tc.bg, border:`1.5px solid ${tc.border}` }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{tc.icon}</span>
              <div>
                <span style={{ fontSize:11, fontWeight:800, color:tc.accent,
                  textTransform:'uppercase', letterSpacing:'0.07em', marginRight:6 }}>{tc.label}:</span>
                <span style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6 }}>{tip.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Memory Tricks (PDF pink mnemonic style) ───────────────────────────────
function MemorySection({ section, idx }) {
  const cfg = SEC.memory;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="memory" title={section.title} idx={idx} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
        {(section.tricks||[]).map((trick, i) => (
          <div key={i} style={{ padding:'14px 16px', borderRadius:13,
            background:cfg.bg, border:`1.5px solid ${cfg.border}`,
            display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:20, flexShrink:0 }}>✨</span>
            <p style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.55 }}>{trick}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Quiz Section (interactive MCQ, PDF question style) ────────────────────
function QuizSection({ section, idx }) {
  const [answers,  setAnswers]  = useState({});
  const [revealed, setRevealed] = useState({});
  const cfg = SEC.quiz;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="quiz" title={section.title} idx={idx} />
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {(section.questions||[]).map((q, qi) => {
          const chosen = answers[qi];
          const done = revealed[qi];
          const correct = chosen && chosen.charAt(0) === q.answer?.charAt(0);
          return (
            <div key={qi} style={{ borderRadius:14, overflow:'hidden',
              border:`1.5px solid ${done ? (correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : cfg.border}` }}>
              <div style={{ padding:'14px 18px', background:cfg.bg,
                borderBottom:`1px solid ${cfg.border}` }}>
                <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
                  <span style={{ color:cfg.accent, marginRight:8 }}>Q{qi+1}.</span>{q.q}
                </p>
              </div>
              <div style={{ padding:'14px 18px', background:'var(--bg-card)',
                display:'flex', flexDirection:'column', gap:8 }}>
                {(q.options||[]).map((opt, oi) => {
                  const isChosen = chosen === opt;
                  const isCorrect = done && opt.charAt(0) === q.answer?.charAt(0);
                  const isWrong = done && isChosen && !isCorrect;
                  return (
                    <button key={oi} onClick={() => !done && setAnswers(p=>({...p,[qi]:opt}))}
                      style={{ padding:'10px 14px', borderRadius:10, border:'none',
                        cursor: done ? 'default' : 'pointer', textAlign:'left', fontFamily:'inherit',
                        fontSize:13, lineHeight:1.5, transition:'all 0.15s',
                        background: isCorrect ? 'rgba(16,185,129,0.12)' : isWrong ? 'rgba(239,68,68,0.1)'
                          : isChosen ? 'rgba(99,102,241,0.1)' : 'var(--bg-tertiary)',
                        color: isCorrect ? '#10B981' : isWrong ? '#EF4444' : isChosen ? 'var(--color-primary-light)' : 'var(--text-primary)',
                        outline: isCorrect ? '1.5px solid rgba(16,185,129,0.4)' : isWrong ? '1.5px solid rgba(239,68,68,0.3)'
                          : isChosen ? '1.5px solid rgba(99,102,241,0.3)' : '1px solid var(--border-color)' }}>
                      {isCorrect && '✅ '}{isWrong && '❌ '}{opt}
                    </button>
                  );
                })}
                {chosen && !done && (
                  <button onClick={() => setRevealed(p=>({...p,[qi]:true}))}
                    style={{ alignSelf:'flex-start', padding:'7px 18px', borderRadius:10, border:'none',
                      cursor:'pointer', background:'var(--gradient-primary)', color:'white',
                      fontSize:12, fontWeight:700, marginTop:4 }}>
                    Check Answer
                  </button>
                )}
                {done && q.explanation && (
                  <div style={{ padding:'10px 12px', borderRadius:9, marginTop:4,
                    background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--color-primary-light)' }}>💡 </span>
                    <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{q.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Summary Section (PDF star takeaways + exam tips) ──────────────────────
function SummarySection({ section, idx }) {
  const cfg = SEC.summary;
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
      <SectionBanner type="summary" title={section.title} idx={idx} />
      <div style={{ borderRadius:14, background:cfg.bg, border:`1.5px solid ${cfg.border}`,
        overflow:'hidden' }}>
        {section.points?.length > 0 && (
          <div style={{ padding:'18px 20px', borderBottom: section.examTips?.length ? `1px solid ${cfg.border}` : 'none' }}>
            <p style={{ fontSize:11, fontWeight:800, color:cfg.accent, textTransform:'uppercase',
              letterSpacing:'0.07em', marginBottom:12 }}>★ Key Takeaways</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {section.points.map((pt, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <Star size={14} color={cfg.accent} style={{ flexShrink:0, marginTop:2 }} />
                  <span style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6, fontWeight:500 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {section.examTips?.length > 0 && (
          <div style={{ padding:'16px 20px', background:'rgba(245,158,11,0.06)' }}>
            <p style={{ fontSize:11, fontWeight:800, color:'#F59E0B', textTransform:'uppercase',
              letterSpacing:'0.07em', marginBottom:10 }}>🎯 Exam Tips</p>
            {section.examTips.map((tip, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                <ArrowRight size={13} color="#F59E0B" style={{ flexShrink:0, marginTop:2 }} />
                <span style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Section Router ─────────────────────────────────────────────────────────
function renderSection(s, i) {
  switch (s.type) {
    case 'overview':    return <OverviewSection    key={i} section={s} idx={i} />;
    case 'definitions': return <DefinitionsSection key={i} section={s} idx={i} />;
    case 'concepts':    return <ConceptsSection    key={i} section={s} idx={i} />;
    case 'flowchart':   return <FlowchartSection   key={i} section={s} idx={i} />;
    case 'comparison':  return <ComparisonSection  key={i} section={s} idx={i} />;
    case 'examples':    return <ExamplesSection    key={i} section={s} idx={i} />;
    case 'tips':        return <TipsSection        key={i} section={s} idx={i} />;
    case 'memory':      return <MemorySection      key={i} section={s} idx={i} />;
    case 'quiz':        return <QuizSection        key={i} section={s} idx={i} />;
    case 'summary':     return <SummarySection     key={i} section={s} idx={i} />;
    default: return (
      <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
        <SectionBanner type="overview" title={s.title} idx={i} />
        <div style={{ padding:'18px 20px', borderRadius:14, background:'var(--bg-card)',
          border:'1px solid var(--border-color)' }}>
          {s.content && <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{s.content}</p>}
        </div>
      </motion.div>
    );
  }
}

// ── Main Renderer ──────────────────────────────────────────────────────────
export default function CreativeNoteRenderer({ notes }) {
  if (!notes) return null;
  const sections = notes.sections || [];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <NoteHeader notes={notes} />
      {sections.length > 0 && <TOC sections={sections} />}
      {sections.map((s, i) => renderSection(s, i))}
      {/* Footer */}
      <div style={{ textAlign:'center', padding:'20px', opacity:0.5 }}>
        <p style={{ fontSize:12, color:'var(--text-muted)' }}>
          ✨ Generated by NoteNova AI · Creative Notes
        </p>
      </div>
    </div>
  );
}
