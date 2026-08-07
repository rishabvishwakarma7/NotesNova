'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/services/api';

// ── Gold premium palette ───────────────────────────────────────────────────
const GOLD  = '#F5B942';
const GOLD2 = '#E8A020';
const DARK  = '#0B0F19';
const CARD  = 'rgba(255,255,255,0.05)';
const GLASS = 'rgba(245,185,66,0.08)';

function fmt(s) {
  const m = Math.floor(s/60), sec = s%60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ── Circular progress ring ─────────────────────────────────────────────────
function Ring({ pct=0, size=220, stroke=14, color=GOLD, children }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r;
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          animate={{strokeDashoffset: circ*(1-pct/100)}}
          transition={{duration:.6,ease:'easeOut'}}/>
        {/* Glow */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke+4}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
          style={{opacity:.15,transform:'rotate(0deg)'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {children}
      </div>
    </div>
  );
}

// ── Glass stat card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color=GOLD, delay=0 }) {
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay}}
      style={{padding:'18px 16px',borderRadius:18,background:CARD,
        border:'1px solid rgba(245,185,66,0.15)',backdropFilter:'blur(12px)',
        textAlign:'center',flex:1,minWidth:120}}>
      <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:22,fontWeight:900,color,marginBottom:2}}>{value}</div>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
    </motion.div>
  );
}

// ── Durations ──────────────────────────────────────────────────────────────
const DURATIONS = [
  {label:'25 min',mins:25,icon:'⚡'},
  {label:'45 min',mins:45,icon:'🔥'},
  {label:'60 min',mins:60,icon:'💪'},
  {label:'90 min',mins:90,icon:'🚀'},
  {label:'2 hours',mins:120,icon:'👑'},
];

const CHALLENGES = [
  {id:'c1',title:'Deep Focus Sprint',desc:'45 min, zero distractions',reward:150,mins:45,icon:'⚡'},
  {id:'c2',title:'Iron Will Session',desc:'90 min, Strict Mode',reward:300,mins:90,icon:'🏆'},
  {id:'c3',title:'Scholar\'s Hour',desc:'60 min, notes only',reward:200,mins:60,icon:'📚'},
];

const BADGES = [
  {icon:'🔥',label:'7 Day Streak',unlocked:false},
  {icon:'🏆',label:'Deep Focus Master',unlocked:false},
  {icon:'🚀',label:'Zero Distraction Hero',unlocked:false},
  {icon:'🌱',label:'Forest Builder',unlocked:false},
  {icon:'⭐',label:'First Session',unlocked:true},
  {icon:'💪',label:'Hour Champion',unlocked:false},
];

const COACH_MSGS = [
  "Amazing work! Take a sip of water and stretch for 60 seconds 💧",
  "You're in the zone! Keep this momentum going 🔥",
  "25 minutes done! Your brain is building stronger connections 🧠",
  "Halfway there! You're doing better than 94% of students 🚀",
  "Almost done! One final push — your future self will thank you 👑",
];

export default function FocusPage() {
  const [isPremium, setIsPremium] = useState(null);
  const [view,      setView]      = useState('landing'); // landing|dashboard|setup|session|result
  const [stats,     setStats]     = useState({ totalMins:0, sessions:0, streak:3, xp:420, score:78 });
  const [duration,  setDuration]  = useState(45);
  const [subject,   setSubject]   = useState('');
  const [goal,      setGoal]      = useState('');
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [quitting,  setQuitting]  = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [coachMsg,  setCoachMsg]  = useState(null);
  const [forest,    setForest]    = useState([]);
  const [activeTab, setActiveTab] = useState('timer'); // timer|forest|analytics|challenges
  const [delay,     setDelay]     = useState(null); // app delay countdown
  const [missionDone, setMissionDone] = useState([false,false,false]);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    api.get('/premium/status')
      .then(r => setIsPremium(r.data?.isPremium || false))
      .catch(() => setIsPremium(false));
  }, []);

  // Timer tick
  useEffect(() => {
    if (view !== 'session' || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishSession(true); return 0; }
        // Coach messages at 25-min intervals
        const elapsed = duration * 60 - t + 1;
        if (elapsed > 0 && elapsed % 1500 === 0) {
          setCoachMsg(COACH_MSGS[Math.floor(elapsed/1500) - 1] || COACH_MSGS[0]);
          setTimeout(() => setCoachMsg(null), 8000);
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view, paused, duration]);

  const startSession = () => {
    setTimeLeft(duration * 60);
    startRef.current = Date.now();
    setPaused(false);
    setView('session');
    setActiveTab('timer');
  };

  const finishSession = useCallback((completed = true) => {
    clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - (startRef.current || Date.now())) / 60000);
    const xpEarned = completed ? Math.round(duration * 2.5) : Math.round(elapsed * 1);
    setSessionResult({ completed, minutes: elapsed, xpEarned, duration });
    setStats(p => ({ ...p, totalMins: p.totalMins + elapsed, sessions: p.sessions + (completed?1:0), xp: p.xp + xpEarned }));
    if (completed) setForest(f => [...f, { id: Date.now(), grown: Date.now() }]);
    setView('result');
  }, [duration]);

  // App delay simulation
  const triggerDelay = (app) => {
    setDelay({ app, count: 15 });
    const t = setInterval(() => {
      setDelay(d => {
        if (!d || d.count <= 1) { clearInterval(t); return null; }
        return { ...d, count: d.count - 1 };
      });
    }, 1000);
  };

  const pct = view === 'session' ? Math.round(((duration*60 - timeLeft) / (duration*60)) * 100) : 0;
  const totalH = Math.floor((stats.totalMins + (view==='session'?(duration*60-timeLeft)/60:0)) / 60);
  const totalM = (stats.totalMins + (view==='session'?(duration*60-timeLeft)/60:0)) % 60 | 0;

  // ── Loading ──
  if (isPremium === null) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',background:DARK}}>
      <motion.div animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:'linear'}}
        style={{width:36,height:36,borderRadius:'50%',border:`3px solid ${GOLD}`,borderTopColor:'transparent'}}/>
    </div>
  );

  // ── Paywall for free users ──
  if (!isPremium) return (
    <div style={{minHeight:'100vh',background:`linear-gradient(135deg,${DARK},#1A1030)`,
      display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}
        style={{maxWidth:480,width:'100%',textAlign:'center'}}>
        {/* Animated crown */}
        <motion.div animate={{y:[-6,6,-6]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}
          style={{fontSize:72,marginBottom:20}}>👑</motion.div>
        <motion.div animate={{scale:[1,1.04,1]}} transition={{duration:2,repeat:Infinity}}
          style={{display:'inline-flex',alignItems:'center',gap:7,padding:'5px 18px',borderRadius:20,
            background:`linear-gradient(135deg,${GOLD},${GOLD2})`,color:'#000',
            fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:20}}>
          ✦ PREMIUM FEATURE
        </motion.div>
        <h1 style={{fontSize:30,fontWeight:900,color:'white',marginBottom:10,lineHeight:1.2}}>
          Focus Lock <span style={{color:GOLD}}>Pro</span>
        </h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.6)',lineHeight:1.7,marginBottom:28}}>
          Master your focus. Eliminate distractions. Achieve Deep Work.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:28,textAlign:'left'}}>
          {['⚡ Deep Focus Sessions','📊 Focus Analytics','🌱 Focus Forest','🏆 XP & Badges',
            '⏱ Session Timer','🤖 AI Focus Coach','🎯 Daily Missions','💎 Premium Themes'].map((f,i)=>(
            <div key={i} style={{padding:'10px 14px',borderRadius:12,background:GLASS,
              border:`1px solid ${GOLD}20`,fontSize:13,color:'rgba(255,255,255,.8)',fontWeight:500}}>
              {f}
            </div>
          ))}
        </div>
        <Link href="/dashboard/premium"
          style={{display:'inline-flex',alignItems:'center',gap:10,padding:'16px 40px',
            borderRadius:16,textDecoration:'none',fontWeight:900,fontSize:16,color:'#000',
            background:`linear-gradient(135deg,${GOLD},${GOLD2})`,
            boxShadow:`0 0 40px ${GOLD}50,0 8px 32px rgba(245,185,66,.4)`}}>
          👑 Upgrade to Premium — ₹99
        </Link>
        <p style={{fontSize:12,color:'rgba(255,255,255,.3)',marginTop:12}}>Lifetime access · No recurring charges</p>
      </motion.div>
    </div>
  );

  // ── App Delay overlay ──
  if (delay) return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:200,
          display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',
          backdropFilter:'blur(20px)',padding:24,textAlign:'center'}}>
        <motion.div animate={{scale:[1,1.05,1]}} transition={{duration:1.5,repeat:Infinity}}
          style={{fontSize:64,marginBottom:20}}>🧘</motion.div>
        <h2 style={{fontSize:22,fontWeight:800,color:'white',marginBottom:8}}>Do you really need {delay.app}?</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:30}}>Your focus session is active. Opening in…</p>
        <div style={{width:80,height:80,borderRadius:'50%',background:GLASS,border:`3px solid ${GOLD}`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:32,fontWeight:900,color:GOLD,marginBottom:30}}>
          {delay.count}
        </div>
        <button onClick={()=>setDelay(null)}
          style={{padding:'12px 28px',borderRadius:12,border:`1px solid ${GOLD}40`,
            background:'transparent',color:GOLD,fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10}}>
          Cancel — Stay Focused 💪
        </button>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${DARK} 0%,#0F0A1E 100%)`,
      color:'white',fontFamily:'inherit'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes glow{0%,100%{box-shadow:0 0 20px ${GOLD}40}50%{box-shadow:0 0 40px ${GOLD}80}}`}</style>

      {/* ── LANDING ── */}
      {view === 'landing' && (
        <div style={{maxWidth:900,margin:'0 auto',padding:'32px 20px'}}>
          {/* Hero */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            style={{textAlign:'center',marginBottom:40}}>
            <motion.div animate={{y:[-8,8,-8],rotateZ:[-3,3,-3]}}
              transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
              style={{fontSize:64,marginBottom:16}}>👑</motion.div>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'5px 18px',borderRadius:20,
              background:`linear-gradient(135deg,${GOLD},${GOLD2})`,color:'#000',
              fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:16}}>
              ✦ PREMIUM ACTIVE
            </div>
            <h1 style={{fontSize:36,fontWeight:900,lineHeight:1.15,marginBottom:10}}>
              Focus Lock <span style={{color:GOLD}}>Pro</span>
            </h1>
            <p style={{fontSize:16,color:'rgba(255,255,255,.55)',marginBottom:30}}>
              Master your focus. Eliminate distractions. Achieve Deep Work.
            </p>
            {/* Stats row */}
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:36}}>
              <StatCard icon="🔥" label="Day Streak"     value={stats.streak}  color={GOLD}  delay={.1}/>
              <StatCard icon="⚡" label="Focus Score"    value={`${stats.score}%`} color="#A78BFA" delay={.15}/>
              <StatCard icon="💎" label="XP Earned"      value={stats.xp}      color="#06B6D4" delay={.2}/>
              <StatCard icon="⏱" label="Study Hours"    value={`${Math.floor(stats.totalMins/60)}h`} color="#10B981" delay={.25}/>
            </div>
            {/* CTA */}
            <motion.button whileHover={{scale:1.04}} whileTap={{scale:.97}}
              onClick={()=>setView('setup')}
              style={{padding:'18px 48px',borderRadius:18,border:'none',cursor:'pointer',
                background:`linear-gradient(135deg,${GOLD},${GOLD2})`,color:'#000',
                fontSize:18,fontWeight:900,animation:'glow 2s ease infinite',
                boxShadow:`0 8px 32px ${GOLD}50`}}>
              ⚡ Start Deep Study
            </motion.button>
          </motion.div>

          {/* Dashboard cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}} className="focus-grid">
            <style>{`.focus-grid{grid-template-columns:1fr 1fr}@media(max-width:600px){.focus-grid{grid-template-columns:1fr!important}}`}</style>

            {/* Today's Mission */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.3}}
              style={{padding:'22px',borderRadius:20,background:CARD,border:`1px solid ${GOLD}20`,gridColumn:'1/-1'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <span style={{fontSize:20}}>🎯</span>
                <h3 style={{fontSize:15,fontWeight:800,color:GOLD}}>Today's Mission</h3>
                <span style={{marginLeft:'auto',fontSize:12,color:'rgba(255,255,255,.4)'}}>+250 XP</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                {["Study for 3 hours total","Complete 2 focus sessions","No social media during study"].map((m,i)=>(
                  <div key={i} onClick={()=>setMissionDone(p=>p.map((v,j)=>j===i?!v:v))}
                    style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer',
                      padding:'10px 14px',borderRadius:12,
                      background:missionDone[i]?'rgba(245,185,66,.1)':'rgba(255,255,255,.03)',
                      border:`1px solid ${missionDone[i]?GOLD+'40':'rgba(255,255,255,.06)'}`}}>
                    <div style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${missionDone[i]?GOLD:'rgba(255,255,255,.2)'}`,
                      background:missionDone[i]?GOLD:'transparent',display:'flex',alignItems:'center',justifyContent:'center',
                      flexShrink:0,fontSize:12,color:'#000'}}>
                      {missionDone[i]?'✓':''}
                    </div>
                    <span style={{fontSize:13,color:missionDone[i]?'rgba(255,255,255,.4)':'rgba(255,255,255,.8)',
                      textDecoration:missionDone[i]?'line-through':'none'}}>{m}</span>
                  </div>
                ))}
              </div>
              {/* Mission progress */}
              <div style={{marginTop:14,height:5,borderRadius:3,background:'rgba(255,255,255,.08)',overflow:'hidden'}}>
                <motion.div animate={{width:`${(missionDone.filter(Boolean).length/3)*100}%`}}
                  style={{height:'100%',background:`linear-gradient(90deg,${GOLD},${GOLD2})`,borderRadius:3}}/>
              </div>
              <p style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:6}}>
                {missionDone.filter(Boolean).length}/3 completed
              </p>
            </motion.div>

            {/* Challenges */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.35}}
              style={{padding:'22px',borderRadius:20,background:CARD,border:`1px solid ${GOLD}20`}}>
              <h3 style={{fontSize:14,fontWeight:800,color:GOLD,marginBottom:14}}>⚡ Challenges</h3>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                {CHALLENGES.map(c=>(
                  <button key={c.id} onClick={()=>{setDuration(c.mins);setGoal(c.title);setView('setup');}}
                    style={{padding:'11px 14px',borderRadius:12,border:`1px solid ${GOLD}20`,cursor:'pointer',
                      background:'rgba(255,255,255,.03)',textAlign:'left',display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:18}}>{c.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12,fontWeight:700,color:'white',marginBottom:1}}>{c.title}</p>
                      <p style={{fontSize:10,color:'rgba(255,255,255,.4)'}}>{c.desc}</p>
                    </div>
                    <span style={{fontSize:11,color:GOLD,fontWeight:800,flexShrink:0}}>+{c.reward}XP</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.4}}
              style={{padding:'22px',borderRadius:20,background:CARD,border:`1px solid ${GOLD}20`}}>
              <h3 style={{fontSize:14,fontWeight:800,color:GOLD,marginBottom:14}}>🏆 Achievements</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {BADGES.map((b,i)=>(
                  <div key={i} style={{textAlign:'center',padding:'10px 6px',borderRadius:12,
                    background:b.unlocked?`${GOLD}12`:'rgba(255,255,255,.03)',
                    border:`1px solid ${b.unlocked?GOLD+'40':'rgba(255,255,255,.06)'}`,
                    opacity:b.unlocked?1:.45}}>
                    <div style={{fontSize:22,marginBottom:4}}>{b.icon}</div>
                    <p style={{fontSize:9,color:b.unlocked?GOLD:'rgba(255,255,255,.4)',fontWeight:700,lineHeight:1.3}}>{b.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* App Delay demo */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.45}}
              style={{padding:'22px',borderRadius:20,background:CARD,border:`1px solid rgba(239,68,68,.2)`}}>
              <h3 style={{fontSize:14,fontWeight:800,color:'#F43F5E',marginBottom:6}}>⏳ App Delay</h3>
              <p style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:14,lineHeight:1.5}}>
                Creates a mindful pause before opening distracting apps.
              </p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {['Instagram','YouTube','Twitter','TikTok'].map(app=>(
                  <button key={app} onClick={()=>triggerDelay(app)}
                    style={{padding:'6px 12px',borderRadius:9,border:'1px solid rgba(239,68,68,.25)',
                      background:'rgba(239,68,68,.08)',color:'#F87171',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                    {app}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Focus Forest */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.5}}
              style={{padding:'22px',borderRadius:20,background:CARD,border:`1px solid rgba(16,185,129,.2)`}}>
              <h3 style={{fontSize:14,fontWeight:800,color:'#10B981',marginBottom:6}}>🌱 Focus Forest</h3>
              <p style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:12}}>
                {forest.length > 0 ? `${forest.length} tree${forest.length>1?'s':''} grown!` : 'Complete sessions to grow trees'}
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,minHeight:40}}>
                {forest.length === 0 && <span style={{fontSize:30}}>🌱</span>}
                {forest.map((t,i)=>(
                  <motion.span key={t.id} initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:.5}}
                    style={{fontSize:i<3?28:i<6?32:36}}>
                    {i<2?'🌱':i<5?'🌲':'🌳'}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── SETUP ── */}
      {view === 'setup' && (
        <div style={{maxWidth:520,margin:'0 auto',padding:'32px 20px'}}>
          <button onClick={()=>setView('landing')} style={{background:'none',border:'none',cursor:'pointer',
            color:'rgba(255,255,255,.4)',fontSize:13,marginBottom:24,display:'flex',alignItems:'center',gap:6}}>
            ← Back
          </button>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
            <h2 style={{fontSize:24,fontWeight:900,color:'white',marginBottom:6}}>Configure Session</h2>
            <p style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:28}}>Set your focus duration and goal</p>

            {/* Duration picker */}
            <p style={{fontSize:11,fontWeight:800,color:GOLD,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Duration</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:24}}>
              {DURATIONS.map(d=>(
                <button key={d.mins} onClick={()=>setDuration(d.mins)}
                  style={{padding:'12px 16px',borderRadius:14,border:'none',cursor:'pointer',textAlign:'center',
                    background:duration===d.mins?`linear-gradient(135deg,${GOLD},${GOLD2})`:'rgba(255,255,255,.06)',
                    color:duration===d.mins?'#000':'rgba(255,255,255,.7)',fontWeight:700,fontSize:13,
                    boxShadow:duration===d.mins?`0 4px 20px ${GOLD}40`:'none',transition:'all .2s'}}>
                  <div style={{fontSize:18,marginBottom:2}}>{d.icon}</div>
                  {d.label}
                </button>
              ))}
            </div>

            {/* Subject + Goal */}
            {[
              {label:'Subject (optional)',val:subject,set:setSubject,ph:'e.g. Computer Networks'},
              {label:'Session Goal (optional)',val:goal,set:setGoal,ph:'e.g. Complete Unit 3 revision'},
            ].map(f=>(
              <div key={f.label} style={{marginBottom:16}}>
                <p style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:7}}>{f.label}</p>
                <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  style={{width:'100%',padding:'13px 16px',borderRadius:13,fontSize:14,boxSizing:'border-box',
                    background:'rgba(255,255,255,.06)',border:`1px solid rgba(255,255,255,.1)`,
                    color:'white',outline:'none',fontFamily:'inherit'}}
                  onFocus={e=>e.target.style.borderColor=GOLD+'60'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}/>
              </div>
            ))}

            {/* Start button */}
            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}} onClick={startSession}
              style={{width:'100%',padding:'16px 0',borderRadius:16,border:'none',cursor:'pointer',
                background:`linear-gradient(135deg,${GOLD},${GOLD2})`,color:'#000',
                fontSize:17,fontWeight:900,marginTop:8,
                boxShadow:`0 8px 32px ${GOLD}40`}}>
              ⚡ Start {duration}-Minute Session
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ── SESSION ── */}
      {view === 'session' && (
        <div style={{maxWidth:500,margin:'0 auto',padding:'32px 20px',textAlign:'center'}}>
          {/* Tab bar */}
          <div style={{display:'flex',gap:4,justifyContent:'center',marginBottom:28,
            background:'rgba(255,255,255,.05)',borderRadius:14,padding:4,width:'fit-content',margin:'0 auto 28px'}}>
            {['timer','forest','challenges'].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)}
                style={{padding:'7px 16px',borderRadius:11,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
                  background:activeTab===t?`linear-gradient(135deg,${GOLD},${GOLD2})`:'transparent',
                  color:activeTab===t?'#000':'rgba(255,255,255,.4)',transition:'all .2s'}}>
                {t==='timer'?'⏱ Timer':t==='forest'?'🌱 Forest':'⚡ Challenges'}
              </button>
            ))}
          </div>

          {activeTab === 'timer' && (
            <>
              {subject && <p style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:4}}>{subject}</p>}
              {goal && <p style={{fontSize:15,fontWeight:700,color:GOLD,marginBottom:24}}>{goal}</p>}

              {/* Ring */}
              <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
                <Ring pct={pct} size={240} color={GOLD}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:44,fontWeight:900,color:'white',fontVariantNumeric:'tabular-nums',lineHeight:1}}>
                      {fmt(timeLeft)}
                    </div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginTop:4}}>
                      {paused ? '⏸ Paused' : '🔥 Focusing'}
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:GOLD,marginTop:6}}>{pct}% done</div>
                  </div>
                </Ring>
              </div>

              {/* Controls */}
              <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:16}}>
                <motion.button whileTap={{scale:.94}} onClick={()=>setPaused(p=>!p)}
                  style={{padding:'13px 28px',borderRadius:14,border:`1px solid ${GOLD}40`,cursor:'pointer',
                    background:'rgba(255,255,255,.06)',color:'white',fontSize:14,fontWeight:700,
                    display:'flex',alignItems:'center',gap:8}}>
                  {paused ? '▶ Resume' : '⏸ Pause'}
                </motion.button>
                <motion.button whileTap={{scale:.94}} onClick={()=>{
                    clearInterval(timerRef.current); finishSession(false);
                  }}
                  style={{padding:'13px 28px',borderRadius:14,border:'1px solid rgba(239,68,68,.3)',cursor:'pointer',
                    background:'rgba(239,68,68,.1)',color:'#F43F5E',fontSize:14,fontWeight:700}}>
                  ■ End
                </motion.button>
              </div>
            </>
          )}

          {activeTab === 'forest' && (
            <div style={{padding:'20px 0'}}>
              <p style={{fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:20}}>Your forest grows with every session</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',minHeight:100}}>
                {forest.length === 0 && <p style={{color:'rgba(255,255,255,.3)',fontSize:13}}>Complete this session to plant your first tree 🌱</p>}
                {forest.map((t,i)=>(
                  <motion.span key={t.id} initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}}
                    transition={{type:'spring',bounce:.5}} style={{fontSize:i<2?32:i<5?38:44}}>
                    {i<2?'🌱':i<5?'🌲':'🌳'}
                  </motion.span>
                ))}
                <span style={{fontSize:32,opacity:.3}}>🌱</span>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div style={{textAlign:'left',padding:'10px 0'}}>
              {CHALLENGES.map(c=>(
                <div key={c.id} style={{padding:'14px 16px',borderRadius:14,marginBottom:10,
                  background:'rgba(255,255,255,.04)',border:`1px solid ${GOLD}20`,
                  display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:24}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:700,color:'white'}}>{c.title}</p>
                    <p style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>{c.desc}</p>
                  </div>
                  <span style={{fontSize:12,color:GOLD,fontWeight:800}}>+{c.reward}XP</span>
                </div>
              ))}
            </div>
          )}

          {/* AI Coach floating card */}
          <AnimatePresence>
            {coachMsg && (
              <motion.div initial={{opacity:0,y:20,scale:.95}} animate={{opacity:1,y:0,scale:1}}
                exit={{opacity:0,y:20,scale:.95}}
                style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',
                  padding:'14px 20px',borderRadius:16,maxWidth:360,width:'90%',
                  background:`linear-gradient(135deg,rgba(139,92,246,.9),rgba(99,102,241,.9))`,
                  backdropFilter:'blur(16px)',boxShadow:'0 8px 32px rgba(0,0,0,.4)',
                  display:'flex',gap:12,alignItems:'flex-start',zIndex:100}}>
                <span style={{fontSize:20,flexShrink:0}}>🤖</span>
                <p style={{fontSize:13,color:'white',lineHeight:1.5,fontWeight:500}}>{coachMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── RESULT ── */}
      {view === 'result' && sessionResult && (
        <div style={{maxWidth:480,margin:'0 auto',padding:'40px 20px',textAlign:'center'}}>
          <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',bounce:.4}}>
            <div style={{fontSize:64,marginBottom:16}}>
              {sessionResult.completed ? '🏆' : '💪'}
            </div>
            <h1 style={{fontSize:26,fontWeight:900,color:'white',marginBottom:8}}>
              {sessionResult.completed ? 'Session Complete!' : 'Good Effort!'}
            </h1>
            <p style={{fontSize:15,color:'rgba(255,255,255,.5)',marginBottom:24}}>
              You focused for <strong style={{color:GOLD}}>{sessionResult.minutes} minutes</strong>
            </p>

            {/* XP gained */}
            <motion.div animate={{scale:[1,1.06,1]}} transition={{duration:.8,delay:.3}}
              style={{display:'inline-flex',alignItems:'center',gap:10,padding:'14px 28px',borderRadius:16,
                background:GLASS,border:`1px solid ${GOLD}40`,marginBottom:28}}>
              <span style={{fontSize:24}}>⚡</span>
              <div style={{textAlign:'left'}}>
                <p style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>XP Earned</p>
                <p style={{fontSize:26,fontWeight:900,color:GOLD}}>+{sessionResult.xpEarned}</p>
              </div>
            </motion.div>

            {/* Forest update */}
            {sessionResult.completed && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.4}}
                style={{padding:'14px',borderRadius:14,background:'rgba(16,185,129,.1)',
                  border:'1px solid rgba(16,185,129,.25)',marginBottom:24}}>
                <p style={{fontSize:13,color:'#10B981',fontWeight:700}}>🌱 A new tree was planted in your Focus Forest!</p>
              </motion.div>
            )}

            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <motion.button whileHover={{scale:1.03}} onClick={()=>{setView('setup');setSessionResult(null);}}
                style={{padding:'13px 24px',borderRadius:14,border:'none',cursor:'pointer',
                  background:`linear-gradient(135deg,${GOLD},${GOLD2})`,color:'#000',fontWeight:800,fontSize:14}}>
                ⚡ New Session
              </motion.button>
              <motion.button whileHover={{scale:1.03}} onClick={()=>{setView('landing');setSessionResult(null);}}
                style={{padding:'13px 24px',borderRadius:14,border:`1px solid rgba(255,255,255,.1)`,cursor:'pointer',
                  background:'rgba(255,255,255,.05)',color:'white',fontWeight:700,fontSize:14}}>
                Dashboard
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
