'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  { num:'01', title:'Create Your Account', desc:'Sign up free in 30 seconds. No credit card needed. Instant access to all core features.', icon:'🚀', color:'#8B5CF6' },
  { num:'02', title:'Set Up Study Profile', desc:'Add your subjects, exam date, and study goals. The AI creates your personalized study roadmap.', icon:'🗺️', color:'#06B6D4' },
  { num:'03', title:'Generate & Learn', desc:'Create visual notes, practice with AI quizzes, chat with your AI tutor — all in one place.', icon:'📚', color:'#10B981' },
  { num:'04', title:'Track & Ace Exams', desc:'Monitor your progress, revise weak topics, and walk into your exam fully prepared.', icon:'🏆', color:'#F59E0B' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding:'100px 24px', background:'var(--bg-secondary)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} style={{ textAlign:'center', marginBottom:64 }}>
          <span style={{ display:'inline-block', padding:'6px 18px', borderRadius:50,
            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
            color:'#10B981', fontSize:13, fontWeight:700, marginBottom:16 }}>
            Simple Process
          </span>
          <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, color:'var(--text-primary)', marginBottom:14 }}>
            From Zero to <span className="gradient-text">Exam Ready</span>
          </h2>
          <p style={{ fontSize:17, color:'var(--text-secondary)', maxWidth:540, margin:'0 auto' }}>
            Four simple steps to transform how you study
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:24, position:'relative' }}>
          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
              style={{ position:'relative' }}>
              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div style={{ position:'absolute', right:-16, top:'30%', zIndex:2,
                  display:'flex', alignItems:'center', color:'var(--text-muted)',
                  display: 'none' }}>
                  <ArrowRight size={20}/>
                </div>
              )}
              <div style={{ padding:'28px 24px', borderRadius:20, background:'var(--bg-card)',
                border:'1px solid var(--border-color)', height:'100%',
                transition:'all 0.2s', cursor:'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${step.color}50`; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${step.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-color)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                {/* Number */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                  <span style={{ fontSize:13, fontWeight:900, color:step.color,
                    background:`${step.color}12`, padding:'4px 10px', borderRadius:8 }}>
                    {step.num}
                  </span>
                  <div style={{ flex:1, height:1, background:`${step.color}25` }}/>
                </div>
                <div style={{ fontSize:40, marginBottom:14 }}>{step.icon}</div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)', marginBottom:10 }}>{step.title}</h3>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.65 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
