'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Save, Check, Crown, Download, BookOpen } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import SubjectSelector from '@/components/ui/SubjectSelector';
import NoteBook from '@/components/creative/NoteBook';

const LEVELS = [
  { id:'beginner',     label:'Beginner',     emoji:'🌱', color:'#10B981' },
  { id:'intermediate', label:'Intermediate', emoji:'📚', color:'#6366F1' },
  { id:'advanced',     label:'Advanced',     emoji:'🚀', color:'#F43F5E' },
];

export default function CreativeNotesPage() {
  return (
    <Suspense fallback={
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
        <Loader2 size={28} color="#8B5CF6" style={{animation:'spin 1s linear infinite'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sp = useSearchParams();
  const { toast } = useToast();
  const printRef = useRef(null);

  const [isPremium, setIsPremium] = useState(null);
  const [topic,   setTopic]   = useState('');
  const [subject, setSubject] = useState('');
  const [level,   setLevel]   = useState('intermediate');
  const [notes,   setNotes]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    if (sp) {
      const t = sp.get('topic');
      const s = sp.get('subject');
      if (t) setTopic(t);
      if (s) setSubject(s);
    }
  }, [sp]);

  useEffect(() => {
    api.get('/premium/status')
      .then(r => setIsPremium(r.data?.isPremium || false))
      .catch(() => setIsPremium(false)); // fail closed — block on API error
  }, []);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setNotes(null);
    try {
      const r = await api.post('/notes/creative', { topic:topic.trim(), subject, level });
      setNotes(r.data.notes);
    } catch(e) {
      toast({ message: e.response?.data?.error || 'Generation failed', type:'error' });
    }
    setLoading(false);
  };

  const save = async () => {
    if (!notes || saving) return;
    setSaving(true);
    try {
      let html = `<h1>${notes.title}</h1>`;
      (notes.sections||[]).forEach(s => {
        html += `<h2>${s.title||s.type}</h2>`;
        if(s.content) html += `<p>${s.content}</p>`;
        if(s.keyPoints) html += `<ul>${s.keyPoints.map(p=>`<li>${p}</li>`).join('')}</ul>`;
        if(s.points)    html += `<ul>${s.points.map(p=>`<li>${p}</li>`).join('')}</ul>`;
      });
      await api.post('/notes', { title:notes.title||topic, content:html,
        subject:subject||notes.subject||'', noteType:'detailed' });
      setSaved(true); toast({ message:'Saved!', type:'success' });
      setTimeout(()=>setSaved(false), 3000);
    } catch { toast({ message:'Save failed', type:'error' }); }
    setSaving(false);
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    try {
      const h2p = (await import('html2pdf.js')).default;
      await h2p().set({ margin:8, filename:`${notes?.title||topic}.pdf`,
        image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2,useCORS:true},
        jsPDF:{unit:'mm',format:'a4',orientation:'portrait'} })
        .from(printRef.current).save();
    } catch { toast({ message:'PDF failed', type:'error' }); }
  };

  // Loading
  if (isPremium === null) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <Loader2 size={28} color="#8B5CF6" style={{animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Paywall
  if (isPremium === false) return (
    <div style={{padding:'40px 20px',maxWidth:520,margin:'0 auto',textAlign:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:80,height:80,borderRadius:24,background:'linear-gradient(135deg,#8B5CF6,#06B6D4)',
        display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',
        boxShadow:'0 8px 32px rgba(139,92,246,0.4)'}}>
        <Sparkles size={36} color="white"/>
      </div>
      <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:20,
        background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',marginBottom:16}}>
        <Crown size={13} color="#F59E0B"/>
        <span style={{fontSize:12,fontWeight:700,color:'#F59E0B'}}>PREMIUM FEATURE</span>
      </span>
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--text-primary)',marginBottom:10}}>Creative Notes is Premium</h1>
      <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:28,maxWidth:380,margin:'0 auto 28px'}}>
        Upgrade to NoteNova Premium (₹99 lifetime) to generate beautiful visual study booklets.
      </p>
      <Link href="/dashboard/premium" style={{display:'inline-flex',alignItems:'center',gap:8,
        padding:'14px 32px',borderRadius:14,textDecoration:'none',color:'white',fontWeight:800,fontSize:15,
        background:'linear-gradient(135deg,#F59E0B,#FBBF24)',boxShadow:'0 6px 24px rgba(245,158,11,0.45)'}}>
        <Crown size={18}/> Upgrade to Premium — ₹99
      </Link>
    </div>
  );

  return (
    <div style={{padding:'24px 20px',maxWidth:1100,margin:'0 auto'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:6}}>
          <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#8B5CF6,#06B6D4)',
            display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(139,92,246,0.35)'}}>
            <BookOpen size={22} color="white"/>
          </div>
          <div>
            <h1 style={{fontSize:24,fontWeight:900,color:'var(--text-primary)',lineHeight:1}}>Creative Notes</h1>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:3}}>
              Visual study booklets — PDF-style with diagrams, flowcharts & quizzes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input panel */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.05}}
        style={{background:'var(--bg-secondary)',borderRadius:20,border:'1px solid var(--border-color)',padding:26,marginBottom:28}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}} className="cn-grid">
          <style>{`.cn-grid{grid-template-columns:1fr 1fr}@media(max-width:600px){.cn-grid{grid-template-columns:1fr!important}}`}</style>
          <div style={{gridColumn:'1/-1'}}>
            <label style={{fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:7,display:'block',textTransform:'uppercase',letterSpacing:'0.07em'}}>Topic *</label>
            <input value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}
              placeholder="e.g. CRC Checksum, Binary Trees, Photosynthesis, HTTP Protocol…"
              style={{width:'100%',padding:'13px 16px',borderRadius:12,fontSize:15,boxSizing:'border-box',
                background:'var(--bg-tertiary)',border:'1px solid var(--border-color)',
                color:'var(--text-primary)',outline:'none',fontFamily:'inherit'}}
              onFocus={e=>e.target.style.borderColor='#8B5CF680'}
              onBlur={e=>e.target.style.borderColor='var(--border-color)'}/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:7,display:'block',textTransform:'uppercase',letterSpacing:'0.07em'}}>Subject</label>
            <SubjectSelector value={subject} onChange={setSubject} placeholder="Select subject…"/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:7,display:'block',textTransform:'uppercase',letterSpacing:'0.07em'}}>Level</label>
            <div style={{display:'flex',gap:8}}>
              {LEVELS.map(l=>(
                <button key={l.id} onClick={()=>setLevel(l.id)}
                  style={{flex:1,padding:'10px 6px',borderRadius:11,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
                    background:level===l.id?`${l.color}18`:'var(--bg-tertiary)',
                    color:level===l.id?l.color:'var(--text-muted)',
                    outline:level===l.id?`2px solid ${l.color}50`:'1px solid var(--border-color)',transition:'all .15s'}}>
                  <div style={{fontSize:16,marginBottom:2}}>{l.emoji}</div>{l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <button onClick={generate} disabled={!topic.trim()||loading}
            style={{padding:'13px 28px',borderRadius:13,border:'none',cursor:topic.trim()?'pointer':'not-allowed',
              background:'linear-gradient(135deg,#8B5CF6,#06B6D4)',color:'white',fontSize:15,fontWeight:800,
              display:'flex',alignItems:'center',gap:8,opacity:topic.trim()?1:.5,
              boxShadow:topic.trim()?'0 4px 20px rgba(139,92,246,0.4)':'none',transition:'all .2s'}}>
            {loading ? <Loader2 size={18} style={{animation:'spin 1s linear infinite'}}/> : <Sparkles size={18}/>}
            {loading ? 'Generating…' : 'Generate Creative Notes'}
          </button>
          {notes && <>
            <button onClick={save} disabled={saving||saved}
              style={{padding:'12px 20px',borderRadius:12,cursor:'pointer',fontSize:14,fontWeight:700,
                display:'flex',alignItems:'center',gap:7,border:'1px solid var(--border-color)',
                background:saved?'rgba(16,185,129,.1)':'var(--bg-tertiary)',
                color:saved?'#10B981':'var(--text-secondary)'}}>
              {saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:saved?<Check size={14}/>:<Save size={14}/>}
              {saving?'Saving…':saved?'Saved!':'Save to Notes'}
            </button>
            <button onClick={exportPdf}
              style={{padding:'12px 20px',borderRadius:12,cursor:'pointer',fontSize:14,fontWeight:700,
                display:'flex',alignItems:'center',gap:7,border:'1px solid var(--border-color)',
                background:'var(--bg-tertiary)',color:'var(--text-secondary)'}}>
              <Download size={14}/> Export PDF
            </button>
          </>}
        </div>

        {!notes&&!loading&&(
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
            {['CRC Checksum','Binary Trees','Photosynthesis','HTTP Protocol','OS Scheduling','Linked Lists'].map(t=>(
              <button key={t} onClick={()=>setTopic(t)}
                style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:500,cursor:'pointer',
                  background:'var(--bg-tertiary)',border:'1px solid var(--border-color)',
                  color:'var(--text-muted)',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#8B5CF650';e.currentTarget.style.color='var(--text-primary)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-color)';e.currentTarget.style.color='var(--text-muted)'}}>
                {t}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex',flexDirection:'column',gap:16}}>
          {[1,2,3,4].map(i=>(
            <div key={i} style={{padding:24,borderRadius:16,background:'var(--bg-secondary)',border:'1px solid var(--border-color)'}}>
              <div className="skeleton" style={{height:20,width:'55%',marginBottom:14,borderRadius:6}}/>
              {[...Array(3)].map((_,j)=>(
                <div key={j} className="skeleton" style={{height:13,width:`${70+j*10}%`,marginBottom:8,borderRadius:4}}/>
              ))}
            </div>
          ))}
          <p style={{textAlign:'center',fontSize:13,color:'var(--text-muted)',animation:'pulse 1.5s ease infinite'}}>
            ✨ Building your visual study notes with diagrams, flowcharts and quizzes…
          </p>
        </motion.div>
      )}

      {/* Notes output */}
      {notes && !loading && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} ref={printRef}>
          <NoteBook notes={notes}/>
        </motion.div>
      )}
    </div>
  );
}
