'use client';
/**
 * InteractiveFlow — Premium interactive process flow visualization
 * Features: step navigation, auto-play, packet animation, what/why/how panel,
 * technical details drawer, completion state, keyboard controls
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Color system ───────────────────────────────────────────────────────────
const CYAN   = '#06B6D4';
const PURPLE = '#8B5CF6';
const ORANGE = '#F97316';
const GREEN  = '#10B981';
const MUTED  = 'rgba(148,163,184,0.5)';
const DARK   = '#0B1120';
const CARD   = 'rgba(15,23,42,0.8)';

const STEP_COLORS = [
  '#06B6D4','#8B5CF6','#10B981','#F97316','#3B82F6','#EC4899','#F59E0B','#EF4444',
];

// ── Progress bar ──────────────────────────────────────────────────────────
function StepProgress({ steps, current, onSelect }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, overflowX:'auto',
      padding:'12px 4px', scrollbarWidth:'none' }}>
      {steps.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const color   = STEP_COLORS[i % STEP_COLORS.length];
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            <button onClick={() => onSelect(i)} title={s.label}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px',
                borderRadius:20, border:`1.5px solid ${active ? color : done ? color+'60' : 'rgba(255,255,255,0.1)'}`,
                background: active ? `${color}20` : 'transparent', cursor:'pointer',
                transform: active ? 'scale(1.05)' : 'none', transition:'all .2s',
                boxShadow: active ? `0 0 12px ${color}40` : 'none' }}>
              <span style={{ fontSize:12, color: active ? color : done ? color : MUTED, fontWeight:800 }}>
                {done ? '✓' : active ? '●' : '○'}
              </span>
              <span style={{ fontSize:11, fontWeight:700,
                color: active ? color : done ? 'rgba(255,255,255,0.6)' : MUTED,
                maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {s.label?.split(' ')[0]}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div style={{ width:20, height:1,
                background: done ? CYAN+'60' : 'rgba(255,255,255,0.08)', flexShrink:0 }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step card ──────────────────────────────────────────────────────────────
function StepCard({ step, index, isActive, isDone, onClick }) {
  const color = STEP_COLORS[index % STEP_COLORS.length];
  const EMOJIS = ['🔍','💾','🔄','🌐','🌍','🔐','📡','✅'];
  return (
    <motion.div onClick={onClick} whileHover={{ y:-3 }} whileTap={{ scale:0.97 }}
      style={{ padding:'18px 20px', borderRadius:16, cursor:'pointer',
        background: isActive ? `${color}15` : CARD,
        border: `1.5px solid ${isActive ? color : isDone ? color+'40' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isActive ? `0 0 20px ${color}30, inset 0 0 20px ${color}08` : 'none',
        transition:'all .25s', minWidth:180, maxWidth:280 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div style={{ width:32, height:32, borderRadius:10,
          background: isActive ? color : isDone ? `${color}30` : 'rgba(255,255,255,0.06)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, flexShrink:0 }}>
          {isDone ? '✓' : EMOJIS[index % EMOJIS.length]}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:11, fontWeight:800, color: isActive ? color : MUTED,
            textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>
            Step {index + 1}
          </p>
          <p style={{ fontSize:14, fontWeight:700,
            color: isActive ? '#F0F9FF' : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
            lineHeight:1.3 }}>
            {step.label}
          </p>
        </div>
      </div>
      {step.description && (
        <p style={{ fontSize:12, color:'rgba(148,163,184,0.8)', lineHeight:1.6, marginTop:6 }}>
          {step.description}
        </p>
      )}
    </motion.div>
  );
}

// ── Animated packet ────────────────────────────────────────────────────────
function Packet({ color }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: [0, 80, 160], opacity: [0, 1, 0] }}
      transition={{ duration: 1.4, ease:'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
      style={{ position:'absolute', top:'50%', transform:'translateY(-50%)',
        width: 10, height: 10, borderRadius:'50%',
        background: color, boxShadow:`0 0 10px ${color}` }} />
  );
}

// ── What/Why/How panel ────────────────────────────────────────────────────
function ExplanationPanel({ step }) {
  const [tab, setTab] = useState('what');
  if (!step) return null;
  const color = STEP_COLORS[0];
  const tabs = [
    { id:'what', label:'WHAT', content: step.what || step.description || 'No explanation available.' },
    { id:'why',  label:'WHY',  content: step.why  || 'This step is required for the process to work correctly.' },
    { id:'how',  label:'HOW',  content: step.how  || 'The system processes this step automatically.' },
  ];
  return (
    <div style={{ padding:'18px 20px', borderRadius:16, background:CARD,
      border:'1px solid rgba(6,182,212,0.2)', marginTop:16 }}>
      <p style={{ fontSize:12, fontWeight:800, color:CYAN, marginBottom:12,
        textTransform:'uppercase', letterSpacing:'.08em' }}>
        💡 What's happening?
      </p>
      <div style={{ display:'flex', gap:4, marginBottom:12 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer',
              fontSize:11, fontWeight:800, transition:'all .15s',
              background: tab === t.id ? CYAN+'20' : 'rgba(255,255,255,0.05)',
              color: tab === t.id ? CYAN : MUTED,
              outline: tab === t.id ? `1.5px solid ${CYAN}50` : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={tab} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-4 }} transition={{ duration:0.2 }}
          style={{ fontSize:13, color:'rgba(203,213,225,0.9)', lineHeight:1.75 }}>
          {tabs.find(t => t.id === tab)?.content}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ── Technical details ──────────────────────────────────────────────────────
function TechDetails({ step }) {
  const [open, setOpen] = useState(false);
  if (!step?.tech) return null;
  return (
    <div style={{ marginTop:10, borderRadius:14, overflow:'hidden',
      border:'1px solid rgba(139,92,246,0.2)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:'100%', padding:'12px 16px', background:'rgba(139,92,246,0.08)',
          border:'none', cursor:'pointer', display:'flex', alignItems:'center',
          justifyContent:'space-between', color:PURPLE }}>
        <span style={{ fontSize:12, fontWeight:800 }}>⚙ Technical Details</span>
        <span style={{ fontSize:14, transition:'transform .2s',
          transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
            style={{ overflow:'hidden', background:CARD }}>
            <div style={{ padding:'14px 16px', display:'grid',
              gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8 }}>
              {Object.entries(step.tech).map(([k,v]) => (
                <div key={k} style={{ padding:'8px 12px', borderRadius:10,
                  background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.15)' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:MUTED,
                    textTransform:'uppercase', letterSpacing:'.07em', marginBottom:3 }}>{k}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:'rgba(224,242,254,0.9)' }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function InteractiveFlow({ steps, title, subtitle }) {
  const [current,  setCurrent]  = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [speed,    setSpeed]    = useState(1);
  const [done,     setDone]     = useState(false);
  const timerRef = useRef(null);
  const total = steps?.length || 0;

  const goTo = useCallback((i) => {
    if (i >= 0 && i < total) { setCurrent(i); setDone(false); }
    else if (i >= total) { setDone(true); setPlaying(false); }
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const restart = () => { setCurrent(0); setDone(false); setPlaying(false); };

  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        if (c + 1 >= total) { setPlaying(false); setDone(true); return c; }
        return c + 1;
      });
    }, Math.round(2000 / speed));
    return () => clearInterval(timerRef.current);
  }, [playing, speed, total]);

  // Keyboard nav
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.key === 'r' || e.key === 'R') restart();
      else if (/^[1-9]$/.test(e.key)) goTo(Number(e.key) - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, prev, goTo]);

  if (!steps?.length) return null;
  const step = steps[current];
  const color = STEP_COLORS[current % STEP_COLORS.length];

  return (
    <div style={{ borderRadius:20, overflow:'hidden', background:DARK,
      border:`1px solid ${CYAN}25`, fontFamily:'inherit' }}>

      {/* Header */}
      <div style={{ padding:'18px 22px', background:`linear-gradient(135deg,rgba(6,182,212,0.08),rgba(139,92,246,0.06))`,
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h3 style={{ fontSize:17, fontWeight:800, color:'#F0F9FF', margin:0, display:'flex', alignItems:'center', gap:8 }}>
            <span>🔄</span> {title || 'Process Flow'}
          </h3>
          {subtitle && <p style={{ fontSize:12, color:'rgba(148,163,184,0.7)', marginTop:3 }}>{subtitle}</p>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:MUTED }}>STEP</span>
          <span style={{ fontSize:16, fontWeight:900, color:color }}>{done ? total : current + 1}</span>
          <span style={{ fontSize:11, color:MUTED }}>/ {total}</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding:'0 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <StepProgress steps={steps} current={done ? total : current} onSelect={goTo}/>
      </div>

      <div style={{ padding:'20px' }}>

        {/* Completion state */}
        {done ? (
          <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
            style={{ textAlign:'center', padding:'32px 24px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <h3 style={{ fontSize:20, fontWeight:800, color:GREEN, marginBottom:8 }}>
              ✓ Process Complete!
            </h3>
            <p style={{ fontSize:14, color:'rgba(148,163,184,0.8)', marginBottom:20 }}>
              {total} / {total} Steps Completed
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={restart}
                style={{ padding:'10px 24px', borderRadius:12, border:`1px solid ${CYAN}50`,
                  background:`${CYAN}15`, color:CYAN, cursor:'pointer', fontWeight:700, fontSize:13 }}>
                ⟳ Restart
              </button>
            </div>
            {/* Key takeaway */}
            {steps[total-1]?.takeaway && (
              <div style={{ marginTop:20, padding:'14px 18px', borderRadius:14,
                background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)',
                textAlign:'left' }}>
                <p style={{ fontSize:12, fontWeight:800, color:GREEN, marginBottom:6,
                  textTransform:'uppercase', letterSpacing:'.07em' }}>💡 Key Takeaway</p>
                <p style={{ fontSize:13, color:'rgba(203,213,225,0.9)', lineHeight:1.7 }}>
                  {steps[total-1].takeaway}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Main step cards — horizontal scroll on mobile */}
            <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8,
              scrollbarWidth:'thin', scrollbarColor:`${CYAN}30 transparent` }}
              className="iflow-cards">
              <style>{`.iflow-cards::-webkit-scrollbar{height:3px}.iflow-cards::-webkit-scrollbar-thumb{background:${CYAN}30;border-radius:3px}`}</style>
              {steps.map((s, i) => (
                <StepCard key={i} step={s} index={i}
                  isActive={i === current} isDone={i < current}
                  onClick={() => goTo(i)}/>
              ))}
            </div>

            {/* Packet animation between steps */}
            {current > 0 && (
              <div style={{ position:'relative', height:20, margin:'8px 0',
                overflow:'hidden', opacity:0.7 }}>
                <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1,
                  background:`linear-gradient(90deg,transparent,${color}40,transparent)` }}/>
                <Packet color={color}/>
              </div>
            )}

            {/* Explanation + tech details */}
            <ExplanationPanel step={step}/>
            <TechDetails step={step}/>
          </>
        )}

        {/* Playback controls */}
        {!done && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            marginTop:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={prev} disabled={current === 0}
                style={{ padding:'9px 16px', borderRadius:11, border:`1px solid rgba(255,255,255,0.1)`,
                  background:'rgba(255,255,255,0.04)', color: current===0 ? MUTED : '#E2E8F0',
                  cursor: current===0 ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600 }}>
                ← Prev
              </button>
              <button onClick={() => setPlaying(p => !p)}
                style={{ padding:'9px 20px', borderRadius:11, border:`1px solid ${CYAN}50`,
                  background:`${CYAN}18`, color:CYAN, cursor:'pointer', fontWeight:700, fontSize:13,
                  boxShadow: playing ? `0 0 12px ${CYAN}30` : 'none' }}>
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
              <button onClick={restart}
                style={{ padding:'9px 14px', borderRadius:11, border:'1px solid rgba(255,255,255,0.08)',
                  background:'rgba(255,255,255,0.04)', color:MUTED, cursor:'pointer', fontSize:13 }}>
                ⟳
              </button>
              <button onClick={next} disabled={current >= total - 1}
                style={{ padding:'9px 16px', borderRadius:11, border:`1px solid rgba(255,255,255,0.1)`,
                  background:'rgba(255,255,255,0.04)', color: current>=total-1 ? MUTED : '#E2E8F0',
                  cursor: current>=total-1 ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600 }}>
                Next →
              </button>
            </div>
            {/* Speed control */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10, color:MUTED, fontWeight:700 }}>SPEED</span>
              {[0.5, 1, 1.5, 2].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  style={{ padding:'4px 9px', borderRadius:8, border:'none', cursor:'pointer',
                    fontSize:11, fontWeight:700,
                    background: speed === s ? `${CYAN}20` : 'rgba(255,255,255,0.04)',
                    color: speed === s ? CYAN : MUTED }}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard hint */}
        <p style={{ textAlign:'center', fontSize:10, color:'rgba(100,116,139,0.5)', marginTop:10 }}>
          ← → arrow keys to navigate · Space to play/pause · R to restart · 1-{total} to jump
        </p>
      </div>
    </div>
  );
}
