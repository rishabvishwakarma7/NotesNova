'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, Star } from 'lucide-react';
import Particles from '@/components/ui/Particles';
import Link from 'next/link';

const TYPING_TEXTS = [
  'Creative Visual Notes',
  'AI Study Roadmaps',
  'Exam Preparation',
  'Smart Flashcards',
  'Deep Focus Sessions',
  'PYQ Analysis',
];

const STATS = [
  { value: '50,000+', label: 'Notes Generated' },
  { value: '12,000+', label: 'Students' },
  { value: '15+', label: 'AI Features' },
  { value: '4.9★', label: 'Rating' },
];

export default function Hero() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TYPING_TEXTS[typingIndex];
    let timeout;
    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 35);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setTypingIndex((typingIndex + 1) % TYPING_TEXTS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, typingIndex]);

  return (
    <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', overflow:'hidden', background:'var(--gradient-bg)' }}>
      <Particles />
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        top:'-5%', left:'5%', filter:'blur(80px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
        bottom:'5%', right:'5%', filter:'blur(80px)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:960, padding:'120px 24px 80px' }}>
        {/* Badge */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:50,
            background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)',
            fontSize:13, fontWeight:600, color:'#A78BFA', marginBottom:28 }}>
          <Zap size={14} /> Powered by Groq AI — Free for Students
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ fontSize:'clamp(38px,6vw,74px)', fontWeight:900, lineHeight:1.1,
            marginBottom:12, color:'var(--text-primary)' }}>
          Turn Any Topic Into
        </motion.h1>
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ fontSize:'clamp(38px,6vw,74px)', fontWeight:900, lineHeight:1.1, marginBottom:28,
            minHeight:'clamp(46px,7.5vw,84px)' }}>
          <span className="gradient-text">{displayed}</span>
          <span style={{ display:'inline-block', width:3, height:'0.9em', background:'#8B5CF6',
            marginLeft:4, borderRadius:2, animation:'typing-cursor 1s step-end infinite' }} />
          <style>{`@keyframes typing-cursor{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </motion.div>

        <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          style={{ fontSize:'clamp(16px,2vw,20px)', color:'var(--text-secondary)',
            maxWidth:620, margin:'0 auto 40px', lineHeight:1.7 }}>
          The complete AI-powered study platform — generate visual notes, follow a study roadmap,
          chat with AI, practice quizzes, and track your progress to exam success.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:48 }}>
          <Link href="/sign-up" className="btn-primary"
            style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:16,
              padding:'15px 36px', textDecoration:'none', borderRadius:13 }}>
            Start Studying Free <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard/chat" className="btn-secondary"
            style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:16,
              padding:'15px 32px', textDecoration:'none', borderRadius:13 }}>
            <Play size={16} /> Try AI Chat
          </Link>
        </motion.div>

        {/* Social proof stars */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:52 }}>
          <div style={{ display:'flex', gap:2 }}>
            {[...Array(5)].map((_,i)=>(
              <Star key={i} size={16} color="#F59E0B" fill="#F59E0B"/>
            ))}
          </div>
          <span style={{ fontSize:14, color:'var(--text-muted)' }}>
            Loved by <strong style={{ color:'var(--text-primary)' }}>12,000+</strong> students
          </span>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          style={{ display:'flex', justifyContent:'center', gap:0, flexWrap:'wrap',
            background:'var(--bg-glass)', backdropFilter:'blur(12px)',
            border:'1px solid var(--border-color)', borderRadius:20, overflow:'hidden',
            maxWidth:680, margin:'0 auto 56px' }}>
          {STATS.map((s,i)=>(
            <div key={i} style={{ flex:'1', minWidth:130, padding:'20px 16px', textAlign:'center',
              borderRight: i<STATS.length-1 ? '1px solid var(--border-color)' : 'none' }}>
              <p style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>{s.value}</p>
              <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature preview cards */}
        <motion.div initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
          style={{ padding:3, borderRadius:24,
            background:'linear-gradient(135deg,rgba(139,92,246,0.4),rgba(6,182,212,0.4))' }}>
          <div style={{ background:'var(--bg-secondary)', borderRadius:22, padding:28,
            display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
            {[
              { label:'AI Tutor',       desc:'Ask anything, learn instantly', color:'#8B5CF6', emoji:'🤖' },
              { label:'Creative Notes', desc:'Visual PDF-style booklets',      color:'#06B6D4', emoji:'📚' },
              { label:'Study Journey',  desc:'Personalized roadmap to exam',  color:'#10B981', emoji:'🗺️' },
              { label:'Focus Lock Pro', desc:'Deep work sessions',             color:'#F59E0B', emoji:'👑' },
            ].map((item,i)=>(
              <motion.div key={i} whileHover={{ y:-3, scale:1.02 }} transition={{ duration:0.15 }}
                style={{ padding:20, borderRadius:16, background:'var(--bg-glass)',
                  border:'1px solid var(--border-color)', textAlign:'left', cursor:'pointer' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{item.emoji}</div>
                <div style={{ width:8, height:8, borderRadius:'50%', background:item.color,
                  marginBottom:10, boxShadow:`0 0 12px ${item.color}60` }} />
                <p style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:4 }}>{item.label}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.4 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
