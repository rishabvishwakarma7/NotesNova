'use client';
import { Sparkles, Mail, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop:'1px solid var(--border-color)', padding:'60px 24px 32px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:48 }}
          className="footer-grid">
          <style>{`.footer-grid{grid-template-columns:2fr 1fr 1fr 1fr}@media(max-width:768px){.footer-grid{grid-template-columns:1fr 1fr}@media(max-width:480px){.footer-grid{grid-template-columns:1fr!important}}}`}</style>

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:34,height:34,borderRadius:10,background:'var(--gradient-primary)',
                display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Sparkles size={17} color="white"/>
              </div>
              <span style={{ fontSize:20, fontWeight:900, color:'var(--text-primary)' }}>
                Note<span className="gradient-text">Nova</span> AI
              </span>
            </div>
            <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7, marginBottom:20, maxWidth:280 }}>
              The complete AI-powered study platform for students who want to learn smarter and ace their exams.
            </p>
            {/* Social */}
            <div style={{ display:'flex', gap:10 }}>
              <a href="mailto:rishabvishwakarma007@gmail.com"
                style={{ width:38,height:38,borderRadius:10,background:'var(--bg-card)',
                  border:'1px solid var(--border-color)',display:'flex',alignItems:'center',
                  justifyContent:'center',textDecoration:'none',transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,.5)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-color)';}}>
                <Mail size={16} color="var(--text-muted)"/>
              </a>
              <a href="https://instagram.com/rishhab.v" target="_blank" rel="noopener noreferrer"
                style={{ width:38,height:38,borderRadius:10,background:'var(--bg-card)',
                  border:'1px solid var(--border-color)',display:'flex',alignItems:'center',
                  justifyContent:'center',textDecoration:'none',transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(236,72,153,.5)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-color)';}}>
                <Instagram size={16} color="var(--text-muted)"/>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ fontSize:13, fontWeight:800, color:'var(--text-primary)', marginBottom:16,
              textTransform:'uppercase', letterSpacing:'.07em' }}>Product</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {label:'AI Tutor',       href:'/dashboard/chat'},
                {label:'Creative Notes', href:'/dashboard/creative-notes'},
                {label:'Study Journey',  href:'/dashboard/journey'},
                {label:'Focus Lock Pro', href:'/dashboard/focus'},
                {label:'PYQ Analyzer',  href:'/dashboard/pyq'},
                {label:'AI Quiz',       href:'/dashboard/quiz'},
              ].map((l,i)=>(
                <Link key={i} href={l.href} style={{ fontSize:14, color:'var(--text-muted)',
                  textDecoration:'none', transition:'color .2s' }}
                  onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                  onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize:13, fontWeight:800, color:'var(--text-primary)', marginBottom:16,
              textTransform:'uppercase', letterSpacing:'.07em' }}>Support</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {label:'Get Premium',    href:'/dashboard/premium'},
                {label:'Contact Us',     href:'#contact'},
                {label:'Email Support',  href:'mailto:rishabvishwakarma007@gmail.com'},
                {label:'Instagram',      href:'https://instagram.com/rishhab.v'},
              ].map((l,i)=>(
                <a key={i} href={l.href} target={l.href.startsWith('http')?'_blank':'_self'}
                  rel="noopener noreferrer"
                  style={{ fontSize:14, color:'var(--text-muted)', textDecoration:'none', transition:'color .2s' }}
                  onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                  onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize:13, fontWeight:800, color:'var(--text-primary)', marginBottom:16,
              textTransform:'uppercase', letterSpacing:'.07em' }}>Legal</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['Privacy Policy','Terms of Service','Refund Policy'].map((l,i)=>(
                <a key={i} href="#" style={{ fontSize:14, color:'var(--text-muted)',
                  textDecoration:'none', transition:'color .2s' }}
                  onMouseEnter={e=>e.target.style.color='var(--text-primary)'}
                  onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>
                  {l}
                </a>
              ))}
            </div>
            {/* Premium badge */}
            <div style={{ marginTop:20, padding:'12px 14px', borderRadius:12,
              background:'rgba(245,185,66,0.08)', border:'1px solid rgba(245,185,66,0.25)' }}>
              <p style={{ fontSize:12, color:'#F5B942', fontWeight:700, marginBottom:3 }}>👑 Premium</p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>₹99 · Lifetime access</p>
              <Link href="/dashboard/premium"
                style={{ display:'inline-block', marginTop:8, fontSize:12, fontWeight:700,
                  color:'#F5B942', textDecoration:'none' }}>
                Upgrade →
              </Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop:'1px solid var(--border-color)', paddingTop:24,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:14 }}>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            © {year} NoteNova AI · Built with ❤️ by{' '}
            <a href="https://instagram.com/rishhab.v" target="_blank" rel="noopener noreferrer"
              style={{ color:'var(--color-primary-light)', textDecoration:'none' }}>
              Rishab Vishwakarma
            </a>
          </p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            🇮🇳 Made in India for Indian Students
          </p>
        </div>
      </div>
    </footer>
  );
}
