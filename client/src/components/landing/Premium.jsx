'use client';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

const FREE = ['AI Tutor Chat','Generate Notes','AI Quiz','Flashcards','Revision Tracker','Study Planner','PYQ Analyzer','My Notes (unlimited)','Analytics'];
const PREMIUM_ONLY = ['✨ Creative Visual Notes','👑 Focus Lock Pro','⚡ Unlimited Focus Sessions','🤖 AI Focus Coach','🌱 Focus Forest','🏆 XP & Achievement System','🔥 Focus Streaks','📊 Distraction Analytics','🎯 Daily Focus Missions','All Future Premium Features'];

export default function Premium() {
  return (
    <section id="premium" style={{ padding:'100px 24px', background:'var(--bg-secondary)' }}>
      <div style={{ maxWidth:1000, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} style={{ textAlign:'center', marginBottom:60 }}>
          <motion.div animate={{ y:[-4,4,-4] }} transition={{ duration:2.5,repeat:Infinity,ease:'easeInOut' }}
            style={{ fontSize:52, marginBottom:12 }}>👑</motion.div>
          <span style={{ display:'inline-block', padding:'6px 18px', borderRadius:50,
            background:'rgba(245,185,66,0.12)', border:'1px solid rgba(245,185,66,0.3)',
            color:'#F5B942', fontSize:13, fontWeight:700, marginBottom:16 }}>
            ✦ Premium Membership
          </span>
          <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, color:'var(--text-primary)', marginBottom:12 }}>
            One Price. <span style={{ color:'#F5B942' }}>Lifetime Access.</span>
          </h2>
          <p style={{ fontSize:17, color:'var(--text-secondary)', maxWidth:480, margin:'0 auto' }}>
            Upgrade once and unlock everything — forever. No subscriptions.
          </p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }} className="premium-grid">
          <style>{`.premium-grid{grid-template-columns:1fr 1fr}@media(max-width:640px){.premium-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Free tier */}
          <motion.div initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            style={{ padding:'28px', borderRadius:20, background:'var(--bg-card)',
              border:'1px solid var(--border-color)' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase',
              letterSpacing:'.08em', marginBottom:6 }}>Free Forever</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:20 }}>
              <span style={{ fontSize:40, fontWeight:900, color:'var(--text-primary)' }}>₹0</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {FREE.map((f,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:20,height:20,borderRadius:'50%',background:'rgba(16,185,129,.15)',
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <Check size={12} color="#10B981"/>
                  </div>
                  <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
              {PREMIUM_ONLY.slice(0,3).map((f,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, opacity:.4 }}>
                  <div style={{ width:20,height:20,borderRadius:'50%',background:'rgba(244,63,94,.1)',
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <X size={12} color="#F43F5E"/>
                  </div>
                  <span style={{ fontSize:13, color:'var(--text-muted)', textDecoration:'line-through' }}>
                    {f.replace(/^[✨👑⚡🤖🌱🏆🔥📊🎯]/,'').trim()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Premium tier */}
          <motion.div initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            style={{ padding:'28px', borderRadius:20, position:'relative', overflow:'hidden',
              background:'linear-gradient(135deg,rgba(245,185,66,0.1),rgba(245,185,66,0.04))',
              border:'2px solid rgba(245,185,66,0.35)',
              boxShadow:'0 8px 40px rgba(245,185,66,0.15)' }}>
            <div style={{ position:'absolute', top:14, right:14, padding:'4px 12px', borderRadius:20,
              background:'linear-gradient(135deg,#F5B942,#E8A020)', color:'#000',
              fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em' }}>
              BEST VALUE
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:'#F5B942', textTransform:'uppercase',
              letterSpacing:'.08em', marginBottom:6 }}>Premium — Lifetime</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6 }}>
              <span style={{ fontSize:52, fontWeight:900, color:'#F5B942' }}>₹99</span>
              <span style={{ fontSize:15, color:'rgba(255,255,255,.4)', textDecoration:'line-through' }}>₹999</span>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:20 }}>Pay once · Access forever</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {['Everything in Free', ...PREMIUM_ONLY].map((f,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:20,height:20,borderRadius:'50%',
                    background: i===0 ? 'rgba(16,185,129,.15)' : 'rgba(245,185,66,.2)',
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <Check size={12} color={i===0?'#10B981':'#F5B942'}/>
                  </div>
                  <span style={{ fontSize:13, color: i===0 ? 'var(--text-secondary)' : 'rgba(255,255,255,.9)' }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/premium"
              style={{ display:'block', width:'100%', padding:'14px 0', borderRadius:13,
                textAlign:'center', textDecoration:'none', fontWeight:900, fontSize:16, color:'#000',
                background:'linear-gradient(135deg,#F5B942,#E8A020)',
                boxShadow:'0 6px 24px rgba(245,185,66,0.4)' }}>
              👑 Upgrade Now — ₹99
            </Link>
            <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,.3)', marginTop:10 }}>
              One-time payment · No hidden charges
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
