'use client';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon:'🤖', title:'AI Tutor Chat',          desc:'Ask anything in Study, Exam Prep, Teach Me, or Socratic mode. Streaming responses.',      color:'#8B5CF6' },
  { icon:'📚', title:'Creative Visual Notes',   desc:'PDF-style booklets with flowcharts, mind maps, quizzes and memory tricks.',             color:'#06B6D4' },
  { icon:'🗺️', title:'Study Journey',           desc:'Personalized roadmap based on your syllabus, exam date, and daily study time.',         color:'#10B981' },
  { icon:'⚡', title:'AI Quiz Generator',       desc:'Auto-generate MCQs with difficulty levels. Tracks weak topics automatically.',          color:'#F59E0B' },
  { icon:'🔄', title:'Smart Revision',          desc:'Spaced repetition (SM-2) algorithm schedules reviews at the perfect time.',            color:'#EC4899' },
  { icon:'📋', title:'PYQ Analyzer',            desc:'Upload previous year papers. AI identifies patterns and high-priority topics.',         color:'#F43F5E' },
  { icon:'🎴', title:'Flashcards',              desc:'Auto-generate flip cards from notes. Session persistence. Know It / Still Learning.',  color:'#14B8A6' },
  { icon:'📅', title:'Study Planner',           desc:'AI-generated daily tasks with duration, priority, and subject breakdown.',              color:'#6366F1' },
  { icon:'🎯', title:'Mistake Notebook',        desc:'Wrong quiz answers auto-saved with explanations for focused practice.',                color:'#F97316' },
  { icon:'👑', title:'Focus Lock Pro',          desc:'Premium deep focus sessions with XP system, streaks, challenges, and AI coach.',       color:'#F5B942' },
  { icon:'🌱', title:'Focus Forest',            desc:'Grow virtual trees with every completed study session. Gamified motivation.',          color:'#10B981' },
  { icon:'📊', title:'Analytics Dashboard',     desc:'Study streaks, quiz performance, weak topics, weekly activity charts.',               color:'#8B5CF6' },
  { icon:'▶️', title:'YouTube Notes',           desc:'Paste any YouTube URL — AI extracts transcript and generates study notes.',           color:'#EF4444' },
  { icon:'📈', title:'Weekly Reports',          desc:'Automatic weekly learning review with strengths, weak areas, and next-week plan.',     color:'#06B6D4' },
  { icon:'🔍', title:'Global Search (Ctrl+K)',  desc:'Search all your notes, quizzes, flashcards, and chats instantly.',                    color:'#A78BFA' },
];

export default function Features() {
  return (
    <section id="features" style={{ padding:'100px 24px', maxWidth:1200, margin:'0 auto' }}>
      <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} style={{ textAlign:'center', marginBottom:60 }}>
        <span style={{ display:'inline-block', padding:'6px 18px', borderRadius:50,
          background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.25)',
          color:'#22D3EE', fontSize:13, fontWeight:700, marginBottom:16 }}>
          15+ Features
        </span>
        <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, color:'var(--text-primary)', marginBottom:14 }}>
          Everything to <span className="gradient-text">Study Smarter</span>
        </h2>
        <p style={{ fontSize:17, color:'var(--text-secondary)', maxWidth:560, margin:'0 auto' }}>
          One platform replacing 10 different study apps — all powered by AI.
        </p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
        {FEATURES.map((f, i) => (
          <motion.div key={i} initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay: (i%5)*0.08 }}
            style={{ padding:'22px 24px', borderRadius:18, background:'var(--bg-card)',
              border:'1px solid var(--border-color)', display:'flex', gap:16, alignItems:'flex-start',
              transition:'all 0.2s', cursor:'default' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${f.color}50`;e.currentTarget.style.transform='translateY(-3px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-color)';e.currentTarget.style.transform='none';}}>
            <div style={{ width:44,height:44,borderRadius:12,background:`${f.color}12`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>
              {f.icon}
            </div>
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:5 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
