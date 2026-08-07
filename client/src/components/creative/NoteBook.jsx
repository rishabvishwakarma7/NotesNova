'use client';
/**
 * NoteBook — PDF-inspired visual study booklet renderer
 * Inspired by python_world_in notebook style:
 * - Spiral binding, colored section headers, code boxes, star bullets
 * - Flowcharts with SVG arrows, comparison tables, animated quiz
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ── SVG Flowchart (real diagram with arrows) ───────────────────────────────
function FlowChart({ steps }) {
  if (!steps?.length) return null;
  const W = 220, H = 60, GAP = 40, PAD = 20;
  const total = steps.length;
  const svgH = total * H + (total - 1) * GAP + PAD * 2;
  const svgW = W + PAD * 2;

  const colors = ['#3B82F6','#8B5CF6','#10B981','#F97316','#EC4899','#14B8A6','#EAB308','#EF4444'];

  return (
    <div style={{display:'flex',justifyContent:'center',padding:'8px 0 0'}}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
        style={{maxWidth:'100%',filter:'drop-shadow(0 4px 12px rgba(0,0,0,.15))'}}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1"/>
          </marker>
        </defs>
        {steps.map((step, i) => {
          const y = PAD + i * (H + GAP);
          const cx = PAD + W / 2;
          const col = colors[i % colors.length];
          const isLast = i === steps.length - 1;
          return (
            <g key={i}>
              {/* Connector arrow */}
              {!isLast && (
                <line x1={cx} y1={y + H} x2={cx} y2={y + H + GAP}
                  stroke="#6366F1" strokeWidth="2.5" strokeDasharray="5,3"
                  markerEnd="url(#arrowhead)"/>
              )}
              {/* Box */}
              <rect x={PAD} y={y} width={W} height={H} rx="14" ry="14"
                fill={col + '18'} stroke={col} strokeWidth="2"/>
              {/* Step number circle */}
              <circle cx={PAD + 22} cy={y + H/2} r="14" fill={col}/>
              <text x={PAD + 22} y={y + H/2 + 5} textAnchor="middle"
                fill="white" fontSize="12" fontWeight="800">{i + 1}</text>
              {/* Label */}
              <text x={PAD + 46} y={y + H/2 - 6} fill={col} fontSize="13" fontWeight="800">{step.label}</text>
              {step.description && (
                <text x={PAD + 46} y={y + H/2 + 10} fill="#94A3B8" fontSize="11">{
                  step.description.length > 28 ? step.description.slice(0, 28) + '…' : step.description
                }</text>
              )}
            </g>
          );
        })}
      </svg>
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
function Section({ s, i }) {
  const th = THEME[s.type] || { c:C.blue, e:'📄' };
  const { c, e } = th;

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
        <SecHead emoji={e} title={s.title || s.type} color={c}/>

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

        {/* FLOWCHART — SVG diagram */}
        {s.type==='flowchart' && <FlowChart steps={s.steps}/>}

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
function Cover({ notes }) {
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

// ── Main export ────────────────────────────────────────────────────────────
export default function NoteBook({ notes }) {
  if (!notes) return null;
  const sections = notes.sections || [];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <Cover notes={notes}/>
      {sections.length > 1 && <TOC sections={sections}/>}
      {sections.map((s,i) => <Section key={i} s={s} i={i}/>)}
    </div>
  );
}
