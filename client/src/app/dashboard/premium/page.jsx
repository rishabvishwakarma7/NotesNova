'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Zap, Check, Copy, Loader2, ArrowRight,
  Shield, Smartphone, CreditCard, Info,
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const FEATURES = [
  { icon: '✨', label: 'Creative Notes', desc: 'AI-powered visual study booklets with cards & diagrams' },
  { icon: '🎯', label: 'Focus Lock', desc: 'Block apps & stay distraction-free while studying' },
  { icon: '♾️', label: 'Unlimited Sessions', desc: 'No daily limits on focus sessions' },
  { icon: '🧠', label: 'AI Focus Analytics', desc: 'Smart insights into your study patterns' },
  { icon: '🔥', label: 'Focus Streaks', desc: 'Build and track study streaks' },
  { icon: '👑', label: 'Premium Badge', desc: 'Exclusive badge on your profile' },
  { icon: '🚀', label: 'All Future Features', desc: 'Early access to every new feature' },
];

const UPI_ID = 'rishuxv@ybl';
const MERCHANT = 'Rishab Vishwakarma';
const AMOUNT = 99;

// ── Stable PaymentForm — 100% uncontrolled inputs ──
// Inputs use refs only. Zero state updates while typing → zero re-renders → no focus loss.
function PaymentForm({ onSubmit, onBack, submitting }) {
  const refs = {
    transactionId: useRef(null),
    utrNumber:     useRef(null),
    name:          useRef(null),
    email:         useRef(null),
    phone:         useRef(null),
  };
  const [paymentApp, setPaymentApp] = useState('PhonePe');
  const goldGrad = 'linear-gradient(135deg, #F59E0B, #FBBF24, #D97706)';

  const handleSubmit = () => {
    onSubmit({
      transactionId: refs.transactionId.current?.value || '',
      utrNumber:     refs.utrNumber.current?.value     || '',
      name:          refs.name.current?.value          || '',
      email:         refs.email.current?.value         || '',
      phone:         refs.phone.current?.value         || '',
      paymentApp,
    });
  };

  const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14,
    background:'var(--bg-tertiary)', border:'1px solid var(--border-color)',
    color:'var(--text-primary)', outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  };

  const fields = [
    { label:'Transaction ID *',  ref: refs.transactionId, placeholder:'e.g. T2024112345678' },
    { label:'UTR Number *',       ref: refs.utrNumber,     placeholder:'12-digit UTR from receipt' },
    { label:'Your Full Name *',   ref: refs.name,          placeholder:'As on your payment app' },
    { label:'Email Address *',    ref: refs.email,         placeholder:'your@email.com', type:'email' },
    { label:'Mobile Number',      ref: refs.phone,         placeholder:'10-digit number', type:'tel' },
  ];

  return (
    <div style={{ padding:'28px', borderRadius:20, background:'var(--bg-secondary)',
      border:'1px solid var(--border-color)', marginBottom:16 }}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <div style={{width:38,height:38,borderRadius:10,background:'rgba(16,185,129,0.12)',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <CreditCard size={18} color="#10B981" />
        </div>
        <div>
          <h2 style={{fontSize:18,fontWeight:800,color:'var(--text-primary)'}}>Confirm Payment</h2>
          <p style={{fontSize:12,color:'var(--text-muted)'}}>Enter your transaction details for verification</p>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {fields.map(f => (
          <div key={f.label}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)',marginBottom:6,display:'block'}}>
              {f.label}
            </label>
            <input
              ref={f.ref}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F59E0B80'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        ))}

        <div>
          <label style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,display:'block'}}>
            Payment App *
          </label>
          <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
            {['PhonePe','Google Pay','Paytm','BHIM','Other'].map(app => (
              <button key={app} onClick={() => setPaymentApp(app)}
                style={{ padding:'7px 14px', borderRadius:9, border:'none', cursor:'pointer',
                  fontSize:12, fontWeight:600, transition:'all 0.15s',
                  background: paymentApp===app ? 'rgba(245,158,11,0.15)' : 'var(--bg-tertiary)',
                  color: paymentApp===app ? '#F59E0B' : 'var(--text-secondary)',
                  outline: paymentApp===app ? '1.5px solid rgba(245,158,11,0.5)' : '1px solid var(--border-color)' }}>
                {app}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          style={{ width:'100%', padding:'13px 28px', borderRadius:13, border:'none',
            cursor: submitting ? 'wait' : 'pointer', background: goldGrad, color:'white',
            fontSize:15, fontWeight:800, display:'flex', alignItems:'center',
            justifyContent:'center', gap:8, boxShadow:'0 6px 24px rgba(245,158,11,0.4)',
            opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> : <Shield size={16}/>}
          {submitting ? 'Submitting…' : 'Submit for Verification'}
        </button>
      </div>

      <button onClick={onBack} style={{ width:'100%', padding:'10px', background:'none',
        border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:13, marginTop:4 }}>
        ← Back
      </button>
    </div>
  );
}

// Steps: plan → intent → instructions → qr → form → done
export default function PremiumPage() {
  const { toast } = useToast();
  const [step,       setStep]       = useState('plan');
  const [status,     setStatus]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [form, setForm] = useState({
    transactionId: '', utrNumber: '', paymentApp: 'PhonePe',
    name: '', email: '', phone: '',
  });

  useEffect(() => {
    api.get('/premium/status').then(r => {
      setStatus(r.data);
      if (r.data?.isPremium) setStep('active');
      else if (r.data?.hasPendingRequest) setStep('pending');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast({ message: 'UPI ID copied!', type: 'success' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (formData) => {
    const data = formData || form;
    if (!data.transactionId?.trim() || !data.utrNumber?.trim() || !data.name?.trim() || !data.email?.trim()) {
      toast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/premium/request', data);
      setStep('done');
    } catch (err) {
      toast({ message: err.response?.data?.error || 'Submission failed', type: 'error' });
    }
    setSubmitting(false);
  };

  const goldGrad = 'linear-gradient(135deg, #F59E0B, #FBBF24, #D97706)';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <Loader2 size={28} color="#F59E0B" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Step indicator
  const STEP_LABELS = ['Plan', 'Intent', 'Steps', 'Pay', 'Confirm', 'Done'];
  const STEP_IDS    = ['plan', 'intent', 'instructions', 'qr', 'form', 'done'];
  const stepIdx = STEP_IDS.indexOf(step);

  const StepBar = () => (
    <div style={{ display:'flex', gap:5, marginBottom:28, alignItems:'center', overflowX:'auto', paddingBottom:4 }}>
      {STEP_LABELS.map((s, i) => {
        const done   = i < stepIdx;
        const active = i === stepIdx;
        if (i >= STEP_IDS.indexOf('active') && ['active','pending'].includes(step)) return null;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
            <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:800,
              background: done ? '#10B981' : active ? goldGrad : 'var(--bg-tertiary)',
              color: done || active ? 'white' : 'var(--text-muted)',
              border: (!done && !active) ? '1px solid var(--border-color)' : 'none' }}>
              {done ? <Check size={12} /> : i + 1}
            </div>
            <span style={{ fontSize:11, fontWeight: active ? 700 : 400, whiteSpace:'nowrap',
              color: active ? '#F59E0B' : done ? '#10B981' : 'var(--text-muted)' }}>{s}</span>
            {i < STEP_LABELS.length - 1 && <div style={{ width:18, height:1, background: done ? '#10B981' : 'var(--border-color)', flexShrink:0 }} />}
          </div>
        );
      })}
    </div>
  );

  const Card = ({ children, gold = false }) => (
    <div style={{ padding:'28px', borderRadius:20, marginBottom:16,
      background: gold ? 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(251,191,36,0.05))' : 'var(--bg-secondary)',
      border: `1px solid ${gold ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}` }}>
      {children}
    </div>
  );

  const GoldBtn = ({ onClick, disabled, children, full = true }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ width: full ? '100%' : 'auto', padding:'13px 28px', borderRadius:13, border:'none', cursor: disabled ? 'wait' : 'pointer',
        background: goldGrad, color:'white', fontSize:15, fontWeight:800,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow:'0 6px 24px rgba(245,158,11,0.4)', opacity: disabled ? 0.7 : 1 }}>
      {children}
    </button>
  );

  const BackBtn = ({ to }) => (
    <button onClick={() => setStep(to)} style={{ width:'100%', padding:'10px', background:'none',
      border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:13, marginTop:4 }}>
      ← Back
    </button>
  );

  return (
    <div style={{ padding:'28px 20px', maxWidth:620, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── ACTIVE ── */}
      {step === 'active' && (
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(245,158,11,0.12)',
            display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',
            border:'2px solid rgba(245,158,11,0.4)'}}>
            <Crown size={36} color="#F59E0B" />
          </div>
          <h1 style={{fontSize:24,fontWeight:900,color:'var(--text-primary)',marginBottom:8}}>You're Premium! 👑</h1>
          <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:24}}>All premium features are unlocked. Thank you!</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {FEATURES.map((f,i)=>(
              <div key={i} style={{padding:'12px',borderRadius:12,background:'rgba(245,158,11,0.06)',
                border:'1px solid rgba(245,158,11,0.2)',textAlign:'left',display:'flex',gap:10,alignItems:'center'}}>
                <span style={{fontSize:18}}>{f.icon}</span>
                <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── PENDING ── */}
      {step === 'pending' && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(99,102,241,0.1)',
            display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
            <Loader2 size={32} color="#6366F1" style={{animation:'spin 3s linear infinite'}} />
          </div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--text-primary)',marginBottom:8}}>Payment Under Review</h1>
          <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.6,marginBottom:16}}>
            Your request is waiting for admin verification.
          </p>
          <div style={{padding:'14px 20px',borderRadius:14,background:'rgba(245,158,11,0.08)',
            border:'1px solid rgba(245,158,11,0.25)',fontSize:13,color:'#D97706'}}>
            ⏱ Estimated approval: <strong>5–30 minutes</strong>
          </div>
        </motion.div>
      )}

      {!['active','pending'].includes(step) && <StepBar />}

      <AnimatePresence mode="wait">

        {/* ── STEP 1: PLAN ── */}
        {step === 'plan' && (
          <motion.div key="plan" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <Card gold>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
                <div style={{width:54,height:54,borderRadius:16,background:goldGrad,
                  display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 20px rgba(245,158,11,0.45)'}}>
                  <Crown size={26} color="white" />
                </div>
                <div>
                  <h1 style={{fontSize:22,fontWeight:900,color:'var(--text-primary)',marginBottom:2}}>NoteNova Premium</h1>
                  <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                    <span style={{fontSize:30,fontWeight:900,color:'#F59E0B'}}>₹99</span>
                    <span style={{fontSize:13,color:'var(--text-muted)'}}> / lifetime</span>
                  </div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:24}} className="feat-grid">
                <style>{`.feat-grid{grid-template-columns:1fr 1fr}@media(max-width:480px){.feat-grid{grid-template-columns:1fr!important}}`}</style>
                {FEATURES.map((f,i)=>(
                  <div key={i} style={{display:'flex',gap:9,padding:'10px 12px',borderRadius:11,
                    background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.12)'}}>
                    <span style={{fontSize:18,flexShrink:0}}>{f.icon}</span>
                    <div>
                      <p style={{fontSize:12,fontWeight:700,color:'var(--text-primary)',marginBottom:1}}>{f.label}</p>
                      <p style={{fontSize:11,color:'var(--text-muted)'}}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <GoldBtn onClick={() => setStep('intent')}>
                <Zap size={18} /> Upgrade Now — ₹99 <ArrowRight size={16} />
              </GoldBtn>
            </Card>
          </motion.div>
        )}

        {/* ── STEP 2: INTENT ── */}
        {step === 'intent' && (
          <motion.div key="intent" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <Card>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{fontSize:48,marginBottom:12}}>💳</div>
                <h2 style={{fontSize:20,fontWeight:800,color:'var(--text-primary)',marginBottom:8}}>
                  Ready to Upgrade?
                </h2>
                <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.7,maxWidth:420,margin:'0 auto'}}>
                  We use <strong style={{color:'var(--text-primary)'}}>manual UPI payment verification</strong>.
                  You'll pay ₹99 via PhonePe QR and then submit your transaction ID for admin approval.
                </p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                {[
                  {icon:'1️⃣', text:'See payment instructions'},
                  {icon:'2️⃣', text:'Scan QR & pay ₹99 via PhonePe'},
                  {icon:'3️⃣', text:'Submit your transaction ID'},
                  {icon:'4️⃣', text:'Admin verifies & activates Premium (5–30 min)'},
                ].map((s,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
                    borderRadius:11,background:'var(--bg-tertiary)',border:'1px solid var(--border-color)'}}>
                    <span style={{fontSize:18,flexShrink:0}}>{s.icon}</span>
                    <span style={{fontSize:13,color:'var(--text-primary)',fontWeight:500}}>{s.text}</span>
                  </div>
                ))}
              </div>
              <GoldBtn onClick={() => setStep('instructions')}>
                Continue <ArrowRight size={16} />
              </GoldBtn>
            </Card>
            <BackBtn to="plan" />
          </motion.div>
        )}

        {/* ── STEP 3: INSTRUCTIONS ── */}
        {step === 'instructions' && (
          <motion.div key="instructions" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <Card>
              <h2 style={{fontSize:18,fontWeight:800,color:'var(--text-primary)',marginBottom:6}}>Before You Pay</h2>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20,lineHeight:1.6}}>
                Please read these instructions carefully to avoid delays.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
                {[
                  {icon:'📱', color:'#8B5CF6', title:'Use PhonePe App',
                    text:'Scan the QR on the next screen using PhonePe. Other UPI apps work too.'},
                  {icon:'💰', color:'#10B981', title:'Pay exactly ₹99',
                    text:'Do not change the amount. Partial or different amounts will cause rejection.'},
                  {icon:'📋', color:'#F59E0B', title:'Note your Transaction ID & UTR',
                    text:'After payment, copy the 12-digit UTR number from your payment receipt.'},
                  {icon:'⏱', color:'#06B6D4', title:'Approval in 5–30 minutes',
                    text:'Admin reviews manually. You\'ll see Premium activated on refresh.'},
                  {icon:'🚫', color:'#F43F5E', title:'Do not submit twice',
                    text:'Each UTR can only be submitted once. Duplicate submissions are blocked.'},
                ].map((item,i)=>(
                  <div key={i} style={{display:'flex',gap:12,padding:'14px 16px',borderRadius:12,
                    background:`${item.color}08`,border:`1px solid ${item.color}25`}}>
                    <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                    <div>
                      <p style={{fontSize:13,fontWeight:700,color:item.color,marginBottom:3}}>{item.title}</p>
                      <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.5}}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <GoldBtn onClick={() => setStep('qr')}>
                <Smartphone size={18} /> Show Payment QR <ArrowRight size={16} />
              </GoldBtn>
            </Card>
            <BackBtn to="intent" />
          </motion.div>
        )}

        {/* ── STEP 4: QR ── */}
        {step === 'qr' && (
          <motion.div key="qr" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <Card>
              <div style={{textAlign:'center'}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:20,
                  background:'rgba(99,58,212,0.12)',border:'1px solid rgba(99,58,212,0.25)',marginBottom:20}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'#5f259f',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{color:'white',fontSize:14,fontWeight:900}}>₱</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:'#7C3AED'}}>PhonePe Accepted Here</span>
                </div>

                <h2 style={{fontSize:18,fontWeight:800,color:'var(--text-primary)',marginBottom:4}}>Scan & Pay ₹99</h2>
                <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20}}>
                  Open PhonePe → Scan QR → Pay <strong style={{color:'#F59E0B'}}>₹99</strong>
                </p>

                {/* QR Image — generated from UPI ID */}
                <div style={{display:'inline-block',padding:16,background:'white',borderRadius:20,
                  boxShadow:'0 8px 40px rgba(245,158,11,0.25), 0 0 0 3px rgba(245,158,11,0.2)',
                  marginBottom:20, position:'relative'}}>
                  {/* PhonePe logo overlay */}
                  <div style={{position:'absolute',top:8,right:8,width:28,height:28,borderRadius:'50%',
                    background:'#5f259f',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:14,fontWeight:900,color:'white',zIndex:1}}>₱</div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent('NoteNova Premium')}`)}&format=png&margin=2`}
                    alt="PhonePe QR Code"
                    width={200} height={200}
                    style={{display:'block',borderRadius:8}}
                  />
                </div>

                <p style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:4}}>
                  {MERCHANT}
                </p>
                <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:20}}>
                  Scan using any UPI app · Amount: <strong style={{color:'#F59E0B'}}>₹99</strong>
                </p>

                {/* UPI ID copy */}
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderRadius:12,
                  background:'var(--bg-tertiary)',border:'1px solid var(--border-color)',marginBottom:24}}>
                  <div style={{flex:1,textAlign:'left'}}>
                    <p style={{fontSize:10,color:'var(--text-muted)',marginBottom:2,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em'}}>UPI ID</p>
                    <p style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',fontFamily:'monospace'}}>{UPI_ID}</p>
                  </div>
                  <button onClick={copyUpi} style={{padding:'7px 14px',borderRadius:9,cursor:'pointer',
                    background: copied ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)',
                    border:`1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}`,
                    color: copied ? '#10B981' : 'var(--text-secondary)',
                    fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5}}>
                    {copied ? <Check size={13}/> : <Copy size={13}/>} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div style={{padding:'10px 14px',borderRadius:10,background:'rgba(245,158,11,0.07)',
                  border:'1px solid rgba(245,158,11,0.2)',fontSize:12,color:'#D97706',marginBottom:24,textAlign:'left',
                  display:'flex',gap:8,alignItems:'flex-start'}}>
                  <Info size={14} style={{flexShrink:0,marginTop:1}} />
                  After paying, <strong>note your UTR number</strong> from the payment receipt — you'll need it in the next step.
                </div>

                <GoldBtn onClick={() => setStep('form')}>
                  I Have Paid — Enter Details <ArrowRight size={16} />
                </GoldBtn>
              </div>
            </Card>
            <BackBtn to="instructions" />
          </motion.div>
        )}

        {/* ── STEP 5: FORM ── */}
        {step === 'form' && (
          <motion.div key="form" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <PaymentForm
              submitting={submitting}
              onSubmit={handleSubmit}
              onBack={() => setStep('qr')}
            />
          </motion.div>
        )}

        {/* ── STEP 6: DONE ── */}
        {step === 'done' && (
          <motion.div key="done" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(16,185,129,0.12)',
              display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',
              border:'2px solid rgba(16,185,129,0.35)'}}>
              <Check size={36} color="#10B981"/>
            </div>
            <h1 style={{fontSize:22,fontWeight:800,color:'var(--text-primary)',marginBottom:8}}>Payment Submitted! 🎉</h1>
            <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:20,maxWidth:400,margin:'0 auto 20px'}}>
              Your payment details have been submitted. Premium access will be activated after admin verification.
            </p>
            <div style={{padding:'14px 20px',borderRadius:14,background:'rgba(245,158,11,0.08)',
              border:'1px solid rgba(245,158,11,0.25)',fontSize:13,color:'#D97706'}}>
              ⏱ Estimated approval: <strong>5–30 minutes</strong>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
