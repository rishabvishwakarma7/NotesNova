'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InteractiveFlow from './InteractiveFlow';

// ── Adapter: enriches AI-generated steps with what/why/how ─────────────────
function InteractiveFlowSection({ steps, title, topicTitle }) {
  if (!steps?.length) return null;
  // Enrich steps by splitting description into what/why/how heuristically
  const enriched = steps.map((s, i) => ({
    ...s,
    what: s.what || s.description || '',
    why:  s.why  || `Step ${i+1} is essential: ${s.label} ensures the process continues correctly.`,
    how:  s.how  || `The system performs "${s.label}" automatically as part of the workflow.`,
    tech: s.tech || null,
  }));
  return (
    <InteractiveFlow
      steps={enriched}
      title={title || topicTitle || 'Process Flow'}
      subtitle={`How ${topicTitle || 'this process'} works step by step`}
    />
  );
}

// ── Color palette (semantic, never random) ────────────────────────────────
const C = {
  blue:   { bg:'rgba(59,130,246,.1)',  bd:'rgba(59,130,246,.3)',  tx:'#3B82F6',  hd:'#1D4ED8' },
  green:  { bg:'rgba(16,185,129,.1)',  bd:'rgba(16,185,129,.3)',  tx:'#10B981',  hd:'#065F46' },
  orange: { bg:'rgba(249,115,22,.1)',  bd:'rgba(249,115,22,.3)',  tx:'#F97316',  hd:'#C2410C' },
  purple: { bg:'rgba(139,92,246,.1)',  bd:'rgba(139,92,246,.3)',  tx:'#8B5CF6',  hd:'#5B21B6' },
  yellow: { bg:'rgba(234,179,8,.12)',  bd:'rgba(234,179,8,.35)',  tx:'#CA8A04',  hd:'#78350F' },
  red:    { bg:'rgba(239,68,68,.1)',   bd:'rgba(239,68,68,.3)',   tx:'#EF4444',  hd:'#B91C1C' },
  pink:   { bg:'rgba(236,72,153,.1)',  bd:'rgba(236,72,153,.3)', tx:'#EC4899',  hd:'#9D174D' },
  teal:   { bg:'rgba(20,184,166,.1)',  bd:'rgba(20,184,166,.3)',  tx:'#14B8A6',  hd:'#115E59' },
};

const THEME = {
  overview:    { c:C.blue,   e:'📋' },
  definitions: { c:C.green,  e:'📗' },
  concepts:    { c:C.blue,   e:'💡' },
  flowchart:   { c:C.teal,   e:'🔄' },
  comparison:  { c:C.purple, e:'⚖️' },
  examples:    { c:C.orange, e:'🧪' },
  tips:        { c:C.yellow, e:'⚠️' },
  memory:      { c:C.pink,   e:'🧠' },
  quiz:        { c:C.purple, e:'❓' },
  summary:     { c:C.teal,   e:'✅' },
};

// ── Spiral binding decoration ──────────────────────────────────────────────
function Spiral() {
  return (
    <div style={{position:'absolute',left:0,top:0,bottom:0,width:36,
      display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'space-around',padding:'20px 0',zIndex:1}}>
      {[...Array(10)].map((_,i)=>(
        <div key={i} style={{width:16,height:16,borderRadius:'50%',
          background:'var(--bg-primary)',border:'3px solid var(--border-color)',
          boxShadow:'inset 0 1px 3px rgba(0,0,0,.3)'}}/>
      ))}
    </div>
  );
}

// ── PDF-style section heading ──────────────────────────────────────────────
function SecHead({ emoji, title, color }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,
      paddingBottom:10,borderBottom:`2.5px dashed ${color.bd}`}}>
      <div style={{width:42,height:42,borderRadius:12,background:color.bg,
        border:`2px solid ${color.bd}`,display:'flex',alignItems:'center',
        justifyContent:'center',fontSize:20,flexShrink:0}}>
        {emoji}
      </div>
      <h2 style={{fontSize:18,fontWeight:900,color:color.tx,margin:0,
        fontFamily:'inherit',letterSpacing:'-.01em'}}>
        {title}
      </h2>
      {/* PDF-style arrow accent */}
      <div style={{marginLeft:'auto',fontSize:18,color:color.bd}}>≺</div>
    </div>
  );
}

// ── Star bullet list (PDF style) ───────────────────────────────────────────
function StarList({ items, color }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {items.map((p,i)=>(
        <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
          transition={{delay:i*.04}}
          style={{display:'flex',gap:10,padding:'8px 12px',borderRadius:10,
            background:color.bg,border:`1px solid ${color.bd}`}}>
          <span style={{color:color.tx,fontWeight:900,flexShrink:0,fontSize:14}}>★</span>
          <span style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.65}}>{p}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Code box (PDF-style dashed border) ────────────────────────────────────
function CodeBox({ code, lang='', output='' }) {
  const [copied, setCopied] = useState(false);
  if (!code?.trim()) return null;
  return (
    <div style={{marginTop:12}}>
      <div style={{borderRadius:12,overflow:'hidden',border:'2px dashed rgba(99,102,241,.35)'}}>
        {lang && (
          <div style={{padding:'6px 14px',background:'rgba(99,102,241,.1)',
            display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:11,fontWeight:800,color:'#6366F1',textTransform:'uppercase',letterSpacing:'.08em'}}>{lang}</span>
            <button onClick={()=>{navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2e3)}}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:11,
                color:copied?'#10B981':'#6366F1',fontWeight:700}}>
              {copied?'✓ Copied':'Copy'}
            </button>
          </div>
        )}
        <pre style={{margin:0,padding:'14px 16px',background:'#0D1117',color:'#E6EDF3',
          fontSize:13,lineHeight:1.75,overflowX:'auto',
          fontFamily:"'JetBrains Mono','Fira Code',Consolas,monospace"}}>
          <code>{code.trim()}</code>
        </pre>
      </div>
      {output && (
        <div style={{marginTop:6,padding:'10px 14px',borderRadius:10,
          background:'rgba(16,185,129,.07)',border:'1px solid rgba(16,185,129,.25)',
          fontSize:12,color:'#10B981',fontFamily:'monospace'}}>
          <span style={{fontWeight:800,marginRight:8}}>Output:</span>{output}
        </div>
      )}
    </div>
  );
}

// ── Radial Spoke Flowchart (inspired by Process Flow Timeline image) ──────
function FlowChart({ steps, title }) {
  if (!steps?.length) return null;

  const COLORS = ['#F59E0B','#F97316','#3B82F6','#14B8A6','#8B5CF6','#EC4899','#10B981','#EF4444'];
  const EMOJIS = ['💡','🎯','📡','🔑','⚙️','🚀','🔄','📋'];
  const count = Math.min(steps.length, 8);

  // For ≤4 steps use the radial spoke layout; for 5+ use enhanced linear
  if (count <= 6) {
    // Radial layout: center hub + spokes
    const W = 560, H = 400, cx = W/2, cy = H/2, hubR = 52;
    const spokeR = 155;
    const angleStep = (2 * Math.PI) / count;

    // Card dimensions
    const CARD_W = 130, CARD_H = 72;

    return (
      <div style={{overflowX:'auto',padding:'8px 0'}}>
        <div style={{minWidth:300,maxWidth:'100%',display:'flex',justifyContent:'center'}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            style={{maxWidth:'100%',overflow:'visible'}}>
            <defs>
              {COLORS.slice(0,count).map((col,i)=>(
                <radialGradient key={i} id={`rg${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={col} stopOpacity="0.9"/>
                  <stop offset="100%" stopColor={col} stopOpacity="0.6"/>
                </radialGradient>
              ))}
            </defs>

            {/* Spoke lines from hub to cards */}
            {steps.slice(0,count).map((step,i)=>{
              const angle = i * angleStep - Math.PI/2;
              const nx = cx + spokeR * Math.cos(angle);
              const ny = cy + spokeR * Math.sin(angle);
              const col = COLORS[i % COLORS.length];
              // Line from hub edge to card edge
              const hx = cx + (hubR+4) * Math.cos(angle);
              const hy = cy + (hubR+4) * Math.sin(angle);
              const ex = nx - (CARD_W/2+2) * Math.cos(angle);
              const ey = ny - (CARD_H/2+2) * Math.sin(angle);
              return (
                <motion.line key={i} x1={hx} y1={hy} x2={ex} y2={ey}
                  stroke={col} strokeWidth="2" strokeDasharray="5,3" opacity="0.6"
                  initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.6}}
                  transition={{delay:0.2+i*0.1,duration:0.5}}/>
              );
            })}

            {/* Spoke cards */}
            {steps.slice(0,count).map((step,i)=>{
              const angle = i * angleStep - Math.PI/2;
              const nx = cx + spokeR * Math.cos(angle);
              const ny = cy + spokeR * Math.sin(angle);
              const col = COLORS[i % COLORS.length];
              const emoji = EMOJIS[i % EMOJIS.length];
              // Is it on the left half?
              const isLeft = Math.cos(angle) < -0.1;
              // Icon circle position — on the inner side of the card
              const iconX = isLeft ? nx + CARD_W/2 - 22 : nx - CARD_W/2 + 22;
              const textX  = isLeft ? nx - CARD_W/2 + 8  : nx + CARD_W/2 - 8 - 44;

              return (
                <motion.g key={i}
                  initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}}
                  transition={{delay:0.1+i*0.08,duration:0.35,type:'spring',bounce:0.3}}>
                  {/* Card background — teardrop/pill shape */}
                  <rect x={nx - CARD_W/2} y={ny - CARD_H/2}
                    width={CARD_W} height={CARD_H} rx="18" ry="18"
                    fill={col+'15'} stroke={col} strokeWidth="2"/>
                  {/* Icon circle */}
                  <circle cx={iconX} cy={ny} r="22" fill={`url(#rg${i})`}/>
                  <text x={iconX} y={ny+7} textAnchor="middle" fontSize="18">{emoji}</text>
                  {/* Label */}
                  <text x={isLeft ? nx - CARD_W/2 + 16 : nx - CARD_W/2 + 16}
                    y={ny - 8} fill={col} fontSize="11" fontWeight="800"
                    style={{textTransform:'uppercase',letterSpacing:'0.06em'}}>
                    {step.label?.length > 14 ? step.label.slice(0,14)+'…' : step.label}
                  </text>
                  {step.description && (
                    <foreignObject x={nx - CARD_W/2 + 10} y={ny + 2} width={CARD_W-50} height={28}>
                      <div xmlns="http://www.w3.org/1999/xhtml"
                        style={{fontSize:9,color:'#94A3B8',lineHeight:1.3,wordBreak:'break-word'}}>
                        {step.description.length > 40 ? step.description.slice(0,40)+'…' : step.description}
                      </div>
                    </foreignObject>
                  )}
                </motion.g>
              );
            })}

            {/* Center hub */}
            <motion.g initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
              transition={{duration:0.4,type:'spring',bounce:0.4}}>
              <circle cx={cx} cy={cy} r={hubR+8} fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <circle cx={cx} cy={cy} r={hubR} fill="var(--bg-secondary)" stroke="#6366F1" strokeWidth="2.5"/>
              <text x={cx} y={cy-8} textAnchor="middle" fill="#6366F1" fontSize="11" fontWeight="800">Process</text>
              <text x={cx} y={cy+6} textAnchor="middle" fill="#6366F1" fontSize="11" fontWeight="800">Flow</text>
              {title && <text x={cx} y={cy+20} textAnchor="middle" fill="#94A3B8" fontSize="9">{title.length>12?title.slice(0,12)+'…':title}</text>}
            </motion.g>
          </svg>
        </div>

        {/* Step legend below */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12,justifyContent:'center'}}>
          {steps.slice(0,count).map((step,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',
              borderRadius:20,background:`${COLORS[i%COLORS.length]}10`,
              border:`1px solid ${COLORS[i%COLORS.length]}30`}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
              <span style={{fontSize:11,fontWeight:700,color:COLORS[i%COLORS.length]}}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Linear fallback for 7+ steps (enhanced)
  const colors = COLORS;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:0,padding:'4px 0'}}>
      {steps.map((step,i)=>{
        const col = colors[i % colors.length];
        const isLast = i === steps.length-1;
        return (
          <div key={i} style={{display:'flex',alignItems:'stretch',gap:0}}>
            {/* Line + dot column */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:44,flexShrink:0}}>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.06,type:'spring',bounce:0.4}}
                style={{width:36,height:36,borderRadius:'50%',background:`${col}18`,
                  border:`2.5px solid ${col}`,display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:14,fontWeight:900,color:col,zIndex:1,flexShrink:0}}>
                {i+1}
              </motion.div>
              {!isLast && <div style={{width:2,flex:1,minHeight:20,background:`${col}30`,margin:'2px 0'}}/>}
            </div>
            {/* Content */}
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
              transition={{delay:i*0.06+0.05}}
              style={{padding:'6px 0 18px 14px',flex:1}}>
              <p style={{fontSize:14,fontWeight:800,color:col,marginBottom:3}}>{step.label}</p>
              {step.description && <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.55}}>{step.description}</p>}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// ── Mind Map SVG ───────────────────────────────────────────────────────────
function MindMap({ title, items }) {
  if (!items?.length) return null;
  const W = 500, H = 360, cx = W/2, cy = H/2, r = 50;
  const branchR = 140;
  const nodeColors = ['#3B82F6','#10B981','#F97316','#EC4899','#8B5CF6','#14B8A6','#EAB308','#EF4444'];
  const count = Math.min(items.length, 8);
  const angleStep = (2 * Math.PI) / count;

  return (
    <div style={{display:'flex',justifyContent:'center',overflowX:'auto',padding:'8px 0'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{maxWidth:'100%'}}>
        {/* Center node */}
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.55} fill="rgba(99,102,241,.15)" stroke="#6366F1" strokeWidth="2"/>
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#6366F1" fontSize="12" fontWeight="800">
          {title?.length > 10 ? title.slice(0, 10) + '…' : title}
        </text>
        {items.slice(0, count).map((item, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const nx = cx + branchR * Math.cos(angle);
          const ny = cy + branchR * Math.sin(angle);
          const col = nodeColors[i % nodeColors.length];
          const label = typeof item === 'string' ? item : item.name || item.term || '';
          return (
            <g key={i}>
              <line x1={cx + r * Math.cos(angle) * 0.95} y1={cy + r * 0.55 * Math.sin(angle) * 0.95}
                x2={nx - 30 * Math.cos(angle)} y2={ny - 16 * Math.sin(angle)}
                stroke={col} strokeWidth="1.8" strokeDasharray="4,2"/>
              <rect x={nx - 40} y={ny - 14} width="80" height="28" rx="14"
                fill={col + '20'} stroke={col} strokeWidth="1.5"/>
              <text x={nx} y={ny + 5} textAnchor="middle" fill={col} fontSize="10" fontWeight="700">
                {label.length > 10 ? label.slice(0, 10) + '…' : label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Comparison table ───────────────────────────────────────────────────────
function CompareTable({ headers, rows }) {
  if (!rows?.length) return null;
  return (
    <div style={{overflowX:'auto',borderRadius:12,overflow:'hidden',
      border:'2px solid rgba(139,92,246,.3)'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        {headers?.length > 0 && (
          <thead>
            <tr>{headers.map((h,i)=>(
              <th key={i} style={{padding:'10px 14px',textAlign:'left',fontWeight:800,
                color:'#8B5CF6',background:'rgba(139,92,246,.12)',
                borderBottom:'2px solid rgba(139,92,246,.25)'}}>{h}</th>
            ))}</tr>
          </thead>
        )}
        <tbody>{rows.map((row,ri)=>(
          <tr key={ri} style={{background:ri%2===0?'transparent':'rgba(139,92,246,.04)'}}>
            {(Array.isArray(row)?row:[row]).map((cell,ci)=>(
              <td key={ci} style={{padding:'9px 14px',
                borderBottom:'1px solid rgba(139,92,246,.12)',
                color:ci===0?'var(--text-primary)':'var(--text-secondary)',
                fontWeight:ci===0?700:400}}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── Animated Quiz ──────────────────────────────────────────────────────────
function Quiz({ questions }) {
  const [ans, setAns] = useState({});
  const [rev, setRev] = useState({});
  if (!questions?.length) return null;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {questions.map((q,qi)=>{
        const chosen = ans[qi], revealed = rev[qi];
        return (
          <motion.div key={qi} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:qi*.06}}
            style={{padding:'16px 18px',borderRadius:14,background:'var(--bg-secondary)',
              border:`1.5px solid ${revealed?(chosen?.startsWith(q.answer)?'rgba(16,185,129,.4)':'rgba(244,63,94,.35)'):'var(--border-color)'}`}}>
            <p style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:10}}>
              <span style={{color:'#8B5CF6',marginRight:6}}>Q{qi+1}.</span>{q.q}
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
              {q.options?.map((opt,oi)=>{
                let bg='var(--bg-tertiary)',bd='var(--border-color)',co='var(--text-primary)';
                if(chosen===opt&&!revealed){bg='rgba(99,102,241,.12)';bd='rgba(99,102,241,.4)';co='#818CF8';}
                if(revealed&&opt.startsWith(q.answer)){bg='rgba(16,185,129,.12)';bd='rgba(16,185,129,.4)';co='#10B981';}
                if(revealed&&chosen===opt&&!opt.startsWith(q.answer)){bg='rgba(244,63,94,.1)';bd='rgba(244,63,94,.35)';co='#F43F5E';}
                return (
                  <button key={oi} onClick={()=>!revealed&&setAns(p=>({...p,[qi]:opt}))}
                    style={{padding:'8px 13px',borderRadius:9,border:`1px solid ${bd}`,
                      background:bg,color:co,fontSize:13,textAlign:'left',cursor:revealed?'default':'pointer',
                      fontFamily:'inherit',transition:'all .15s'}}>{opt}</button>
                );
              })}
            </div>
            {chosen&&!revealed&&(
              <button onClick={()=>setRev(p=>({...p,[qi]:true}))}
                style={{padding:'6px 16px',borderRadius:8,border:'none',cursor:'pointer',
                  background:'linear-gradient(135deg,#8B5CF6,#6366F1)',color:'white',fontSize:12,fontWeight:700}}>
                Check Answer
              </button>
            )}
            {revealed&&q.explanation&&(
              <div style={{padding:'9px 12px',borderRadius:9,marginTop:8,
                background:'rgba(139,92,246,.08)',border:'1px solid rgba(139,92,246,.2)',
                fontSize:12,color:'var(--text-secondary)'}}>
                💡 {q.explanation}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Section renderers ──────────────────────────────────────────────────────
function Section({ s, i, cardBg, textPrimary, textSecondary }) {
  const th = THEME[s.type] || { c:C.blue, e:'📄' };
  const { c, e } = th;
  const [copied, setCopied] = useState(false);
  const copyMd = () => {
    navigator.clipboard.writeText(sectionToMd(s));
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <motion.div id={`nb-${i}`} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{delay:i*.05,duration:.35}}
      style={{position:'relative',borderRadius:20,overflow:'hidden',
        background:'var(--bg-secondary)',border:`1.5px solid ${c.bd}`,
        boxShadow:`0 4px 24px ${c.bg}`}}>

      {/* Left accent stripe */}
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:5,background:c.tx,borderRadius:'20px 0 0 20px'}}/>

      {/* Content */}
      <div style={{padding:'22px 24px 22px 30px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
          <div style={{flex:1}}><SecHead emoji={e} title={s.title || s.type} color={c}/></div>
          {/* Feature 9: Copy as markdown */}
          <button onClick={copyMd} className="nb-noprint"
            style={{padding:'4px 10px',borderRadius:8,border:'1px solid',cursor:'pointer',fontSize:11,
              fontWeight:600,flexShrink:0,marginTop:2,transition:'all .15s',
              borderColor:copied?'rgba(16,185,129,.4)':'var(--border-color)',
              background:copied?'rgba(16,185,129,.1)':'transparent',
              color:copied?'#10B981':'var(--text-muted)'}}>
            {copied?'✓ Copied':'⧉ MD'}
          </button>
        </div>

        {/* OVERVIEW */}
        {s.type==='overview' && <>
          {s.content && <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.8,marginBottom:s.keyPoints?.length?14:0}}>{s.content}</p>}
          {s.keyPoints?.length > 0 && <StarList items={s.keyPoints} color={c}/>}
        </>}

        {/* DEFINITIONS — grid cards */}
        {s.type==='definitions' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
            {s.items?.map((item,j)=>(
              <motion.div key={j} whileHover={{scale:1.02}} transition={{duration:.15}}
                style={{padding:'13px 15px',borderRadius:13,
                  background:C.green.bg,border:`1px solid ${C.green.bd}`}}>
                <p style={{fontSize:13,fontWeight:800,color:C.green.tx,marginBottom:5}}>{item.term}</p>
                <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.6}}>{item.definition}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* CONCEPTS — numbered with example pill */}
        {s.type==='concepts' && (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {s.items?.map((item,j)=>(
              <motion.div key={j} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:j*.05}}
                style={{padding:'14px 16px',borderRadius:13,
                  background:'var(--bg-tertiary)',border:'1px solid var(--border-color)'}}>
                <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:6}}>
                  <div style={{width:26,height:26,borderRadius:8,background:C.blue.bg,
                    border:`1.5px solid ${C.blue.bd}`,display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:11,fontWeight:800,color:C.blue.tx,flexShrink:0}}>{j+1}</div>
                  <p style={{fontSize:14,fontWeight:700,color:'var(--text-primary)'}}>{item.name}</p>
                </div>
                <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:item.example?8:0}}>{item.explanation}</p>
                {item.example && (
                  <div style={{padding:'7px 11px',borderRadius:8,
                    background:C.orange.bg,border:`1px solid ${C.orange.bd}`,fontSize:12,color:C.orange.tx}}>
                    🧪 Example: {item.example}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* FLOWCHART — interactive */}
        {s.type==='flowchart' && (
          <InteractiveFlowSection steps={s.steps} title={s.title} topicTitle={notes.title}/>
        )}

        {/* COMPARISON — table + optional mind map */}
        {s.type==='comparison' && (
          <>
            <CompareTable headers={s.headers} rows={s.rows}/>
            {s.items?.length > 2 && (
              <div style={{marginTop:16}}>
                <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',
                  letterSpacing:'.08em',marginBottom:8}}>Mind Map View</p>
                <MindMap title={s.title} items={s.items}/>
              </div>
            )}
          </>
        )}

        {/* EXAMPLES — code boxes */}
        {s.type==='examples' && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {s.items?.map((item,j)=>(
              <div key={j} style={{padding:'14px 16px',borderRadius:13,
                background:C.orange.bg,border:`1px solid ${C.orange.bd}`}}>
                <p style={{fontSize:14,fontWeight:700,color:C.orange.tx,marginBottom:6}}>{j+1}. {item.title}</p>
                <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:item.code?0:0}}>{item.description}</p>
                {item.code && <CodeBox code={item.code} lang="code"/>}
              </div>
            ))}
          </div>
        )}

        {/* TIPS — warning/tip/important banners */}
        {s.type==='tips' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {s.tips?.map((tip,j)=>{
              const cfg = tip.type==='warning' ? {e:'⚠️',c:C.red} : tip.type==='important' ? {e:'📌',c:C.blue} : {e:'💡',c:C.yellow};
              return (
                <motion.div key={j} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:j*.04}}
                  style={{padding:'11px 15px',borderRadius:11,
                    background:cfg.c.bg,border:`1px solid ${cfg.c.bd}`,
                    display:'flex',gap:10,alignItems:'flex-start'}}>
                  <span style={{fontSize:16,flexShrink:0}}>{cfg.e}</span>
                  <p style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.6}}>{tip.text}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* MEMORY — pink grid */}
        {s.type==='memory' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
            {s.tricks?.map((t,j)=>(
              <motion.div key={j} whileHover={{scale:1.03}} transition={{duration:.15}}
                style={{padding:'13px 15px',borderRadius:12,
                  background:C.pink.bg,border:`1px solid ${C.pink.bd}`,
                  display:'flex',gap:9,alignItems:'flex-start'}}>
                <span style={{fontSize:18,flexShrink:0}}>✨</span>
                <p style={{fontSize:12,color:'var(--text-primary)',lineHeight:1.6}}>{t}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* QUIZ — interactive */}
        {s.type==='quiz' && <Quiz questions={s.questions}/>}

        {/* SUMMARY */}
        {s.type==='summary' && (
          <>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:s.examTips?.length?16:0}}>
              {s.points?.map((p,j)=>(
                <motion.div key={j} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:j*.04}}
                  style={{display:'flex',gap:10,padding:'8px 12px',borderRadius:10,
                    background:C.teal.bg,border:`1px solid ${C.teal.bd}`}}>
                  <span style={{color:C.teal.tx,fontWeight:900,flexShrink:0}}>★</span>
                  <span style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.6}}>{p}</span>
                </motion.div>
              ))}
            </div>
            {s.examTips?.length > 0 && (
              <div style={{padding:'13px 16px',borderRadius:12,
                background:C.yellow.bg,border:`1px solid ${C.yellow.bd}`}}>
                <p style={{fontSize:11,fontWeight:800,color:C.yellow.tx,
                  textTransform:'uppercase',letterSpacing:'.08em',marginBottom:9}}>🎯 Exam Tips</p>
                {s.examTips.map((t,j)=>(
                  <p key={j} style={{fontSize:12,color:'var(--text-secondary)',marginBottom:5,lineHeight:1.55}}>→ {t}</p>
                ))}
              </div>
            )}
          </>
        )}

        {/* FALLBACK */}
        {!['overview','definitions','concepts','flowchart','comparison','examples','tips','memory','quiz','summary'].includes(s.type) && (
          <>
            {s.content && <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.7}}>{s.content}</p>}
            {s.items && <StarList items={s.items.map(x=>x.term||x.name||x.label||String(x))} color={c}/>}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Cover ──────────────────────────────────────────────────────────────────
function Cover({ notes, cardBg, textPrimary }) {
  const lvlC = {beginner:'#10B981',intermediate:'#6366F1',advanced:'#F43F5E'};
  const col = lvlC[notes.level] || '#8B5CF6';
  return (
    <motion.div initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}}
      style={{position:'relative',borderRadius:20,overflow:'hidden',marginBottom:20,
        background:`linear-gradient(135deg,${col}14,${col}06)`,
        border:`2px solid ${col}30`,padding:'28px 28px 28px 52px'}}>
      <Spiral/>
      <div style={{position:'absolute',top:-50,right:-50,width:180,height:180,
        borderRadius:'50%',border:`3px solid ${col}15`,pointerEvents:'none'}}/>
      <div style={{display:'flex',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
        <span style={{fontSize:52,lineHeight:1}}>{notes.emoji||'📝'}</span>
        <div style={{flex:1,minWidth:0}}>
          {notes.subject && (
            <span style={{fontSize:11,fontWeight:800,color:col,background:`${col}18`,
              padding:'3px 12px',borderRadius:20,textTransform:'uppercase',
              letterSpacing:'.08em',display:'inline-block',marginBottom:10}}>
              {notes.subject}
            </span>
          )}
          <h1 style={{fontSize:26,fontWeight:900,color:'var(--text-primary)',lineHeight:1.2,marginBottom:12}}>{notes.title}</h1>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {notes.level && <span style={{fontSize:12,fontWeight:700,color:'white',background:col,padding:'4px 14px',borderRadius:20}}>
              {notes.level.charAt(0).toUpperCase()+notes.level.slice(1)}
            </span>}
            <span style={{fontSize:12,color:'var(--text-muted)',padding:'4px 14px',borderRadius:20,
              background:'var(--bg-tertiary)',border:'1px solid var(--border-color)'}}>
              {notes.sections?.length||0} sections
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Table of Contents ──────────────────────────────────────────────────────
function TOC({ sections }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}
      style={{padding:'16px 22px',borderRadius:16,marginBottom:20,
        background:'var(--bg-secondary)',border:'1px solid var(--border-color)'}}>
      <p style={{fontSize:11,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>
        📑 Contents
      </p>
      <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
        {sections.map((s,i)=>{
          const th = THEME[s.type]||{c:C.blue,e:'📄'};
          return (
            <a key={i} href={`#nb-${i}`}
              style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',
                borderRadius:20,fontSize:12,fontWeight:600,textDecoration:'none',
                background:th.c.bg,border:`1px solid ${th.c.bd}`,color:th.c.tx,transition:'opacity .15s'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              {th.e} {s.title||s.type}
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Feature 6: Flashcard Deck ──────────────────────────────────────────────
function FlashcardDeck({ cards, onClose }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);

  if (!cards.length) return null;
  const done = idx >= cards.length;
  const score = done ? Math.round((known.length / cards.length) * 100) : 0;

  const mark = (isKnown) => {
    if (isKnown) setKnown(p=>[...p, idx]); else setUnknown(p=>[...p, idx]);
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 200);
  };

  return (
    <div style={{textAlign:'center'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <p style={{fontSize:14,fontWeight:700,color:'var(--text-primary)'}}>
          🃏 Flashcards — {Math.min(idx+1, cards.length)}/{cards.length}
        </p>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',
          color:'var(--text-muted)',fontSize:13}}>✕ Close</button>
      </div>

      {/* Progress */}
      <div style={{height:6,borderRadius:3,background:'var(--bg-tertiary)',overflow:'hidden',marginBottom:24}}>
        <motion.div animate={{width:`${(idx/cards.length)*100}%`}}
          style={{height:'100%',background:'linear-gradient(90deg,#8B5CF6,#06B6D4)',borderRadius:3}}/>
      </div>

      {done ? (
        <div style={{textAlign:'center',padding:'24px 0'}}>
          <div style={{fontSize:48,marginBottom:12}}>{score>=80?'🏆':score>=50?'👍':'📚'}</div>
          <p style={{fontSize:24,fontWeight:900,color:score>=80?'#10B981':score>=50?'#F59E0B':'#F43F5E',marginBottom:8}}>{score}%</p>
          <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:20}}>{known.length} known · {unknown.length} to review</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={()=>{setIdx(0);setFlipped(false);setKnown([]);setUnknown([]);}}
              style={{padding:'10px 20px',borderRadius:12,border:'none',cursor:'pointer',
                background:'var(--gradient-primary)',color:'white',fontWeight:700,fontSize:13}}>
              🔄 Restart
            </button>
            {unknown.length > 0 && (
              <button onClick={()=>{
                const wrongCards = unknown.map(i=>cards[i]);
                setIdx(0);setFlipped(false);setKnown([]);setUnknown([]);
              }} style={{padding:'10px 20px',borderRadius:12,border:'none',cursor:'pointer',
                background:'rgba(244,63,94,.1)',color:'#F43F5E',fontWeight:700,fontSize:13}}>
                ❌ Review Missed ({unknown.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Flip card */}
          <div style={{perspective:1000,maxWidth:500,margin:'0 auto 24px'}}>
            <motion.div onClick={()=>setFlipped(f=>!f)}
              animate={{rotateY:flipped?180:0}} transition={{duration:.5}}
              style={{position:'relative',height:200,cursor:'pointer',
                transformStyle:'preserve-3d'}}>
              {/* Front */}
              <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',borderRadius:20,
                padding:28,display:'flex',flexDirection:'column',alignItems:'center',
                justifyContent:'center',textAlign:'center',
                background:'var(--bg-secondary)',border:'2px solid rgba(139,92,246,.3)',
                boxShadow:'0 8px 32px rgba(139,92,246,.15)'}}>
                <p style={{fontSize:12,fontWeight:700,color:'#8B5CF6',textTransform:'uppercase',
                  letterSpacing:'.08em',marginBottom:12}}>Question</p>
                <p style={{fontSize:18,fontWeight:700,color:'var(--text-primary)',lineHeight:1.4}}>{cards[idx]?.q}</p>
                <p style={{fontSize:11,color:'var(--text-muted)',marginTop:16}}>Click to reveal answer</p>
              </div>
              {/* Back */}
              <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',
                transform:'rotateY(180deg)',borderRadius:20,padding:28,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                textAlign:'center',
                background:'linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,182,212,.08))',
                border:'2px solid rgba(16,185,129,.3)'}}>
                <p style={{fontSize:12,fontWeight:700,color:'#10B981',textTransform:'uppercase',
                  letterSpacing:'.08em',marginBottom:12}}>Answer</p>
                <p style={{fontSize:15,color:'var(--text-primary)',lineHeight:1.6}}>{cards[idx]?.a}</p>
              </div>
            </motion.div>
          </div>
          {flipped && (
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button onClick={()=>mark(false)}
                style={{padding:'12px 28px',borderRadius:13,border:'none',cursor:'pointer',
                  background:'rgba(244,63,94,.12)',color:'#F43F5E',fontWeight:800,fontSize:14}}>
                ✗ Still Learning
              </button>
              <button onClick={()=>mark(true)}
                style={{padding:'12px 28px',borderRadius:13,border:'none',cursor:'pointer',
                  background:'rgba(16,185,129,.12)',color:'#10B981',fontWeight:800,fontSize:14}}>
                ✓ Got It!
              </button>
            </div>
          )}
          {!flipped && (
            <p style={{fontSize:12,color:'var(--text-muted)'}}>
              ✅ {known.length} known · ❌ {unknown.length} to review
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── Feature 5: AI Follow-up (improved) ───────────────────────────────────
function AIFollowUp({ topic, subject, cardBg }) {
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState('');
  const [activeAct,  setActiveAct]  = useState('');
  const [activeLabel,setActiveLabel]= useState('');

  const actions = [
    { id:'simpler',   label:'🐣 Explain Simpler',     color:'#10B981',
      prompt:`Explain "${topic}" in the simplest possible way for a complete beginner. Use real-life analogies and avoid jargon. Format with markdown headings and bullet points.` },
    { id:'deeper',    label:'🔬 Go Deeper',            color:'#8B5CF6',
      prompt:`Explain the advanced and deep aspects of "${topic}" that most textbooks skip. Cover edge cases, internal mechanisms, and expert-level insights. Use markdown formatting.` },
    { id:'interview', label:'💼 Interview Q&A',        color:'#F59E0B',
      prompt:`Give 6 likely technical interview questions about "${topic}" with detailed model answers. Format as:\n**Q1: [question]**\n**A:** [detailed answer]\n\nCover basics, tricky questions, and application-based questions.` },
    { id:'compare',   label:'⚖️ Compare Similar',      color:'#06B6D4',
      prompt:`Compare "${topic}" with the most similar concepts in ${subject||'this subject'}. Use a markdown table comparing: Purpose, How it works, When to use, Advantages, Disadvantages. Then explain in 2-3 sentences when to choose each.` },
    { id:'realworld', label:'🌍 Real-World Uses',      color:'#EC4899',
      prompt:`Give 5 concrete real-world applications of "${topic}" used in industry today. For each: name the company/product, explain exactly how it uses this concept, and why it matters. Use markdown formatting.` },
    { id:'exam',      label:'🎯 Exam Tips',            color:'#F43F5E',
      prompt:`Give exam-focused tips for "${topic}". Include: most commonly asked question types, common mistakes students make, key formulas/rules to remember, and 3 practice questions with solutions. Use markdown formatting.` },
  ];

  const ask = async (act) => {
    if (loading) return;
    setLoading(true); setActiveAct(act.id); setActiveLabel(act.label); setResult('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      // Try Clerk token — gracefully fail if not available
      let token = null;
      try {
        if (typeof window !== 'undefined' && window.Clerk?.session) {
          token = await window.Clerk.session.getToken();
        }
      } catch {}

      const r = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages:[{ role:'user', content:act.prompt }], mode:'study' }),
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let out = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.content) { out += d.content; setResult(out); }
            } catch {}
          }
        }
      }
    } catch (err) {
      setResult('⚠️ Failed to get AI response. Please check your connection and try again.');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.25}}
      style={{padding:'22px 24px',borderRadius:16,background:cardBg,
        border:'1px solid rgba(139,92,246,.25)'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,borderRadius:9,background:'rgba(139,92,246,.15)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
          <div>
            <p style={{fontSize:13,fontWeight:800,color:'#8B5CF6',marginBottom:0}}>AI Deep Dive</p>
            <p style={{fontSize:11,color:'var(--text-muted)'}}>Ask the AI to go further on this topic</p>
          </div>
        </div>
        {result && (
          <button onClick={()=>{setResult('');setActiveAct('');}}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',
              fontSize:12,padding:'4px 8px',borderRadius:6,transition:'color .15s'}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:result?18:0}}>
        {actions.map(act=>{
          const isActive = activeAct === act.id;
          const isDone   = isActive && !loading && result;
          const isLoading= isActive && loading;
          return (
            <button key={act.id} onClick={()=>ask(act)} disabled={loading}
              style={{padding:'8px 14px',borderRadius:20,border:'none',
                cursor:loading?'wait':'pointer',fontSize:12,fontWeight:600,
                transition:'all .15s',
                background: isDone ? `${act.color}20` : isLoading ? `${act.color}15` : 'var(--bg-tertiary)',
                color: (isDone||isLoading) ? act.color : 'var(--text-secondary)',
                outline: isDone ? `1.5px solid ${act.color}50` : isLoading ? `1px solid ${act.color}30` : '1px solid var(--border-color)',
                transform: isActive ? 'scale(0.97)' : 'none',
              }}>
              {isLoading ? '⏳ Loading…' : act.label}
            </button>
          );
        })}
      </div>

      {/* Result — rendered as markdown */}
      {result && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
          {/* Active action label */}
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
            <span style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.07em'}}>
              Response for:
            </span>
            <span style={{fontSize:11,fontWeight:700,color:'#8B5CF6',
              background:'rgba(139,92,246,.1)',padding:'2px 8px',borderRadius:6}}>
              {activeLabel}
            </span>
          </div>
          <div style={{padding:'16px 18px',borderRadius:13,
            background:'rgba(139,92,246,.05)', border:'1px solid rgba(139,92,246,.18)',
            maxHeight:420,overflowY:'auto'}}>
            <div className="markdown-body" style={{fontSize:13,lineHeight:1.75,color:'var(--text-secondary)'}}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Feature 9: Copy section markdown ──────────────────────────────────────
function sectionToMd(s) {
  let md = `## ${s.title || s.type}\n\n`;
  if(s.content) md += s.content + '\n\n';
  if(s.keyPoints) md += s.keyPoints.map(p=>`- ${p}`).join('\n') + '\n\n';
  if(s.items) md += s.items.map(i=>`**${i.term||i.name}**: ${i.definition||i.explanation}`).join('\n') + '\n\n';
  if(s.steps) md += s.steps.map(st=>`${st.step}. **${st.label}** — ${st.description}`).join('\n') + '\n\n';
  if(s.tips) md += s.tips.map(t=>`> ${t.type.toUpperCase()}: ${t.text}`).join('\n') + '\n\n';
  if(s.tricks) md += s.tricks.map(t=>`- ✨ ${t}`).join('\n') + '\n\n';
  if(s.points) md += s.points.map(p=>`- ${p}`).join('\n') + '\n\n';
  return md;
}

// ── Main export ────────────────────────────────────────────────────────────
export default function NoteBook({ notes }) {
  if (!notes) return null;
  const sections = notes.sections || [];

  // Feature 2: Bookmarks
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`nb_bm_${notes.title}`) || '[]'); } catch { return []; }
  });
  const toggleBookmark = useCallback((i) => {
    setBookmarks(prev => {
      const next = prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i];
      try { localStorage.setItem(`nb_bm_${notes.title}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [notes.title]);

  // Feature 3: Collapsed sections
  const [collapsed, setCollapsed] = useState({});
  const toggleCollapse = (i) => setCollapsed(p => ({...p, [i]: !p[i]}));

  // Feature 8: Note theme
  const [noteTheme, setNoteTheme] = useState('dark');

  // Feature 6: Flashcard mode
  const [flashMode, setFlashMode] = useState(false);
  const flashCards = sections
    .filter(s => s.type === 'definitions' || s.type === 'concepts')
    .flatMap(s => (s.items || []).map(item => ({
      q: item.term || item.name,
      a: item.definition || item.explanation,
    })));

  // Feature 1: Reading progress
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const winH = window.innerHeight;
      const scrolled = Math.max(0, -top);
      const total = height - winH;
      setProgress(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLight = noteTheme === 'light';
  const bg = isLight ? '#FEFCE8' : 'var(--bg-primary)';
  const cardBg = isLight ? '#FFFFFF' : 'var(--bg-secondary)';
  const textPrimary = isLight ? '#1E293B' : 'var(--text-primary)';
  const textSecondary = isLight ? '#475569' : 'var(--text-secondary)';
  const borderColor = isLight ? 'rgba(0,0,0,.1)' : 'var(--border-color)';

  return (
    <div ref={containerRef} style={{background:bg,borderRadius:20,padding:4,transition:'background .3s'}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .nb-card{background:${cardBg};color:${textPrimary}}
        .nb-text{color:${textSecondary}}
        .nb-border{border-color:${borderColor}}
        @media print {
          .nb-noprint{display:none!important}
          .nb-printonly{display:block!important}
          body{background:white!important}
        }
      `}</style>

      {/* Feature 1: Reading progress bar */}
      <div className="nb-noprint" style={{position:'fixed',top:0,left:0,right:0,height:3,zIndex:9999,
        background:'var(--bg-tertiary)',transition:'all .2s'}}>
        <motion.div animate={{width:`${progress}%`}} transition={{duration:.2}}
          style={{height:'100%',background:'linear-gradient(90deg,#8B5CF6,#06B6D4)'}}/>
      </div>

      {/* Feature 8: Theme toggle + Feature 6: Flashcard mode toolbar */}
      <div className="nb-noprint" style={{display:'flex',alignItems:'center',gap:8,
        padding:'10px 14px',borderRadius:'16px 16px 0 0',
        background:cardBg,borderBottom:`1px solid ${borderColor}`,flexWrap:'wrap'}}>
        <span style={{fontSize:13,fontWeight:700,color:textSecondary}}>
          📖 {notes.title}
        </span>
        <div style={{marginLeft:'auto',display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
          {/* Progress badge */}
          <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,
            background:'rgba(99,102,241,.12)',color:'#6366F1'}}>{progress}% read</span>

          {/* Feature 6: Flashcard mode */}
          {flashCards.length > 0 && (
            <button onClick={()=>setFlashMode(f=>!f)}
              style={{padding:'5px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
                background:flashMode?'#8B5CF6':'rgba(139,92,246,.12)',
                color:flashMode?'white':'#8B5CF6',transition:'all .2s'}}>
              🃏 {flashMode?'Exit Flashcards':'Flashcard Mode'}
            </button>
          )}

          {/* Feature 8: Theme */}
          <button onClick={()=>setNoteTheme(t=>t==='dark'?'light':'dark')}
            style={{padding:'5px 12px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:700,
              borderColor:isLight?'rgba(0,0,0,.15)':'var(--border-color)',
              background:isLight?'#FEF3C7':'rgba(234,179,8,.1)',color:isLight?'#78350F':'#CA8A04'}}>
            {isLight?'🌙 Dark':'☀️ Light'}
          </button>

          {/* Feature 4: Print */}
          <button onClick={()=>window.print()}
            style={{padding:'5px 12px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:700,
              borderColor:'rgba(16,185,129,.3)',background:'rgba(16,185,129,.1)',color:'#10B981'}}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Feature 6: Flashcard mode overlay */}
      <AnimatePresence>
        {flashMode && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}
            style={{padding:24,background:cardBg,borderRadius:12,margin:'12px 4px'}}>
            <FlashcardDeck cards={flashCards} onClose={()=>setFlashMode(false)}/>
          </motion.div>
        )}
      </AnimatePresence>

      {!flashMode && (
        <div style={{padding:'16px 4px',display:'flex',flexDirection:'column',gap:16}}>
          <Cover notes={notes} cardBg={cardBg} textPrimary={textPrimary}/>
          {sections.length > 1 && <TOC sections={sections} bookmarks={bookmarks}/>}

          {/* Sections */}
          {sections.map((s, i) => (
            <div key={i} style={{position:'relative'}}>
              {/* Feature 2: Bookmark button */}
              <button onClick={()=>toggleBookmark(i)}
                className="nb-noprint"
                style={{position:'absolute',top:14,right:14,zIndex:10,
                  width:28,height:28,borderRadius:'50%',border:'none',cursor:'pointer',fontSize:14,
                  background:bookmarks.includes(i)?'rgba(234,179,8,.2)':'transparent',
                  color:bookmarks.includes(i)?'#EAB308':'var(--text-muted)',transition:'all .2s'}}>
                {bookmarks.includes(i)?'⭐':'☆'}
              </button>

              {/* Feature 3: Collapse button */}
              <button onClick={()=>toggleCollapse(i)}
                className="nb-noprint"
                style={{position:'absolute',top:14,right:46,zIndex:10,
                  width:28,height:28,borderRadius:'50%',border:'none',cursor:'pointer',fontSize:12,
                  background:'transparent',color:'var(--text-muted)',transition:'all .2s'}}>
                {collapsed[i]?'▶':'▼'}
              </button>

              <AnimatePresence initial={false}>
                {!collapsed[i] && (
                  <motion.div key="content"
                    initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}}
                    exit={{height:0,opacity:0}} transition={{duration:.25}}>
                    <Section s={s} i={i} cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary}/>
                  </motion.div>
                )}
                {collapsed[i] && (
                  <motion.div key="collapsed"
                    style={{padding:'12px 20px',borderRadius:16,background:cardBg,
                      border:'1px solid',borderColor,cursor:'pointer',display:'flex',alignItems:'center',gap:10}}
                    onClick={()=>toggleCollapse(i)}>
                    <span style={{fontSize:16}}>{THEME[s.type]?.e||'📄'}</span>
                    <span style={{fontSize:13,fontWeight:600,color:textPrimary}}>{s.title||s.type}</span>
                    <span style={{marginLeft:'auto',fontSize:11,color:'var(--text-muted)'}}>Click to expand</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Feature 5: AI Follow-up per topic */}
          <AIFollowUp topic={notes.title} subject={notes.subject} cardBg={cardBg}/>

          {/* Feature 10: Related Topics — improved */}
          {notes.relatedTopics?.length > 0 && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.3}}
              style={{padding:'22px 24px',borderRadius:16,background:cardBg,
                border:'1px dashed rgba(99,102,241,.35)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <div style={{width:30,height:30,borderRadius:9,background:'rgba(99,102,241,.15)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔗</div>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:'#6366F1'}}>Continue Learning</p>
                  <p style={{fontSize:11,color:'var(--text-muted)'}}>Topics that build on {notes.title}</p>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                {notes.relatedTopics.map((t,i)=>{
                  const colors=['#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899'];
                  const c = colors[i % colors.length];
                  return (
                    <Link key={i}
                      href={`/dashboard/creative-notes?topic=${encodeURIComponent(t)}&subject=${encodeURIComponent(notes.subject||'')}`}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',
                        borderRadius:13,textDecoration:'none',transition:'all .2s',
                        background:`${c}08`,border:`1px solid ${c}25`}}
                      onMouseEnter={e=>{e.currentTarget.style.background=`${c}15`;e.currentTarget.style.borderColor=`${c}50`;e.currentTarget.style.transform='translateY(-2px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background=`${c}08`;e.currentTarget.style.borderColor=`${c}25`;e.currentTarget.style.transform='none';}}>
                      <div style={{width:32,height:32,borderRadius:9,background:`${c}18`,
                        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16}}>
                        📖
                      </div>
                      <div style={{minWidth:0}}>
                        <p style={{fontSize:12,fontWeight:700,color:'var(--text-primary)',
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t}</p>
                        <p style={{fontSize:11,color:c,fontWeight:600}}>Generate notes →</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <p style={{fontSize:11,color:'var(--text-muted)',marginTop:12,textAlign:'center'}}>
                Click any topic to instantly generate Creative Notes for it
              </p>
            </motion.div>
          )}

          {/* Feature 2: Bookmarks panel */}
          {bookmarks.length > 0 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              style={{padding:'18px 22px',borderRadius:16,background:'rgba(234,179,8,.08)',
                border:'1px solid rgba(234,179,8,.3)'}}>
              <p style={{fontSize:12,fontWeight:800,color:'#CA8A04',textTransform:'uppercase',
                letterSpacing:'.08em',marginBottom:10}}>⭐ Your Bookmarks ({bookmarks.length})</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {bookmarks.map(i => (
                  <a key={i} href={`#nb-${i}`}
                    style={{padding:'5px 12px',borderRadius:20,fontSize:12,fontWeight:600,
                      textDecoration:'none',background:'rgba(234,179,8,.15)',
                      border:'1px solid rgba(234,179,8,.3)',color:'#CA8A04'}}>
                    {sections[i]?.title || `Section ${i+1}`}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
