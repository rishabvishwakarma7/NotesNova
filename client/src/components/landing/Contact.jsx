'use client';
import { motion } from 'framer-motion';
import { Mail, Instagram, MessageCircle, Clock, Zap } from 'lucide-react';

const SUPPORT_LINKS = [
  { icon: Mail, label:'Email Support', value:'rishabvishwakarma007@gmail.com',
    href:'mailto:rishabvishwakarma007@gmail.com', color:'#6366F1',
    desc:'Best for: Premium activation, bugs, account issues', badge:'Replies in 24h' },
  { icon: Instagram, label:'Instagram DM', value:'@rishhab.v',
    href:'https://instagram.com/rishhab.v', color:'#EC4899',
    desc:'Best for: Quick questions, feature requests, feedback', badge:'Usually fast' },
];

const FAQS_SUPPORT = [
  { q:'How do I activate Premium?', a:'Pay ₹99 via the PhonePe QR on the Premium page, submit your UTR, and we activate within 5–30 minutes.' },
  { q:'My payment was submitted but Premium not activated?', a:'Email rishabvishwakarma007@gmail.com with your UTR number. We\'ll activate within a few hours.' },
  { q:'How do I report a bug?', a:'DM on Instagram @rishhab.v or email with a screenshot. All bugs are fixed as a priority.' },
  { q:'Can I get a refund?', a:'Yes — if the product doesn\'t work as described, email within 7 days for a full refund.' },
];

export default function Contact() {
  return (
    <section id="contact" style={{ padding:'100px 24px', background:'var(--bg-secondary)' }}>
      <div style={{ maxWidth:1000, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} style={{ textAlign:'center', marginBottom:60 }}>
          <span style={{ display:'inline-block', padding:'6px 18px', borderRadius:50,
            background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)',
            color:'#818CF8', fontSize:13, fontWeight:700, marginBottom:16 }}>
            Support
          </span>
          <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, color:'var(--text-primary)', marginBottom:12 }}>
            We're Here to <span className="gradient-text">Help You</span>
          </h2>
          <p style={{ fontSize:17, color:'var(--text-secondary)', maxWidth:480, margin:'0 auto' }}>
            Built by a student, for students. Personal support from the creator.
          </p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:40 }} className="contact-grid">
          <style>{`.contact-grid{grid-template-columns:1fr 1fr}@media(max-width:640px){.contact-grid{grid-template-columns:1fr!important}}`}</style>

          {SUPPORT_LINKS.map((link, i) => (
            <motion.a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
              style={{ padding:'28px', borderRadius:20, background:'var(--bg-card)',
                border:`1px solid ${link.color}25`, textDecoration:'none',
                display:'flex', flexDirection:'column', gap:14, transition:'all 0.2s',
                cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${link.color}55`;e.currentTarget.style.transform='translateY(-3px)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${link.color}25`;e.currentTarget.style.transform='none';}}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ width:48,height:48,borderRadius:14,background:`${link.color}15`,
                  display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <link.icon size={22} color={link.color}/>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20,
                  background:`${link.color}15`, color:link.color }}>
                  {link.badge}
                </span>
              </div>
              <div>
                <p style={{ fontSize:16, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>{link.label}</p>
                <p style={{ fontSize:14, fontWeight:600, color:link.color, marginBottom:6 }}>{link.value}</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.5 }}>{link.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Support FAQs */}
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          style={{ padding:'28px', borderRadius:20, background:'var(--bg-card)',
            border:'1px solid var(--border-color)' }}>
          <p style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', marginBottom:20,
            display:'flex', alignItems:'center', gap:8 }}>
            <MessageCircle size={18} color="#6366F1"/> Common Support Questions
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="faq-grid">
            <style>{`.faq-grid{grid-template-columns:1fr 1fr}@media(max-width:640px){.faq-grid{grid-template-columns:1fr!important}}`}</style>
            {FAQS_SUPPORT.map((f,i)=>(
              <div key={i} style={{ padding:'16px', borderRadius:13, background:'var(--bg-tertiary)',
                border:'1px solid var(--border-color)' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:7 }}>
                  {f.q}
                </p>
                <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6 }}>{f.a}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, padding:'14px 18px', borderRadius:12,
            background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
            display:'flex', alignItems:'center', gap:10 }}>
            <Clock size={15} color="#6366F1"/>
            <p style={{ fontSize:13, color:'var(--text-secondary)' }}>
              Average response time: <strong style={{ color:'var(--text-primary)' }}>under 24 hours</strong>.
              For Premium activation, usually <strong style={{ color:'#F5B942' }}>5–30 minutes</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
