'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, MessageSquare, Brain, BarChart3, Activity,
  LogOut, RefreshCw, Search, ChevronLeft, ChevronRight, ShieldCheck,
  CalendarDays, Zap, ArrowLeft, X, Star, MessageCircle, CheckCircle2, Trash2,
  Crown, Clock, Check, AlertCircle, Eye,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TYPE_COLORS = {
  note:   { color: '#8B5CF6', label: 'Note' },
  chat:   { color: '#06B6D4', label: 'Chat' },
  quiz:   { color: '#F59E0B', label: 'Quiz' },
  plan:   { color: '#EC4899', label: 'Plan' },
  signup: { color: '#10B981', label: 'Sign-up' },
};
const MODE_COLORS = { study:'#8B5CF6', coding:'#06B6D4', research:'#F59E0B', exam:'#EC4899', simple:'#10B981' };

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
      borderRadius:16, padding:24, display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:52, height:52, borderRadius:14, background:`${color}18`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Activity bar chart ── */
function ActivityBar({ data, height = 120 }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.date}: ${d.total}`}
          style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <div style={{ width:'100%', borderRadius:3, minHeight:4,
            height:`${Math.max((d.total / max) * 100, 3)}%`,
            background: d.total > 0 ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'var(--bg-tertiary)' }} />
          {data.length <= 16 && (
            <span style={{ fontSize:9, color:'var(--text-muted)', writingMode:'vertical-lr',
              transform:'rotate(180deg)', height:28, textAlign:'center' }}>{d.date?.slice(5)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Chat messages modal ── */
function ChatModal({ chat, onClose }) {
  if (!chat) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ width:'100%', maxWidth:680, maxHeight:'80vh', background:'var(--bg-secondary)',
        borderRadius:20, border:'1px solid var(--border-color)', overflow:'hidden', display:'flex', flexDirection:'column' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-color)',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{chat.title || 'Untitled Chat'}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
              Mode: <span style={{ color: MODE_COLORS[chat.mode]||'#8B5CF6', textTransform:'capitalize' }}>{chat.mode}</span>
              {' · '}{chat.messages?.length || 0} messages
              {chat.user ? ` · ${chat.user.name || chat.user.email}` : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:10 }}>
          {chat.messages?.map((m, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3, textTransform:'capitalize' }}>{m.role}</span>
              <div style={{ maxWidth:'85%', padding:'10px 14px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'var(--bg-tertiary)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Premium Requests Tab ── */
function PremiumTab({ token }) {
  const [requests,  setRequests]  = useState([]);
  const [counts,    setCounts]    = useState({ pending:0, approved:0, rejected:0 });
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('pending');
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [acting,    setActing]    = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  // Grant by email
  const [grantEmail,   setGrantEmail]   = useState('');
  const [granting,     setGranting]     = useState(false);
  const [grantMsg,     setGrantMsg]     = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter, page, limit: 20 });
      if (search) params.set('search', search);
      const r = await fetch(`${API}/premium/admin/requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setRequests(d.requests || []);
      setTotal(d.total || 0);
      if (d.counts) setCounts(d.counts);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, page, search]);

  const approve = async (id) => {
    setActing(id);
    try {
      await fetch(`${API}/premium/admin/requests/${id}/approve`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      load();
    } catch {}
    setActing(null);
  };

  const reject = async () => {
    if (!rejectModal) return;
    setActing(rejectModal);
    try {
      await fetch(`${API}/premium/admin/requests/${rejectModal}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || 'Payment not verified' }),
      });
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch {}
    setActing(null);
  };

  const grantByEmail = async () => {
    if (!grantEmail.trim()) return;
    setGranting(true);
    setGrantMsg(null);
    try {
      const r = await fetch(`${API}/premium/admin/grant-by-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: grantEmail.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setGrantMsg({ type: 'success', text: d.message });
      setGrantEmail('');
    } catch (err) {
      setGrantMsg({ type: 'error', text: err.message });
    }
    setGranting(false);
  };

  const STATUS_CFG = {
    pending:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Pending' },
    approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Approved' },
    rejected: { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',   label: 'Rejected' },
  };

  return (
    <motion.div key="premium" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>

      {/* Reject modal */}
      {rejectModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={() => setRejectModal(null)}>
          <div style={{ width:'100%', maxWidth:400, background:'var(--bg-secondary)', borderRadius:20,
            border:'1px solid var(--border-color)', padding:28 }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:17, fontWeight:800, color:'var(--text-primary)', marginBottom:16 }}>
              Reject Request
            </h3>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:14 }}>Select a rejection reason:</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {['Invalid UTR', 'Payment Not Received', 'Duplicate Payment', 'Wrong Amount', 'Other'].map(r => (
                <button key={r} onClick={() => setRejectReason(r)}
                  style={{ padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left',
                    fontSize:13, fontWeight:500, transition:'all 0.12s',
                    background: rejectReason===r ? 'rgba(244,63,94,0.12)' : 'var(--bg-tertiary)',
                    color: rejectReason===r ? '#F43F5E' : 'var(--text-secondary)',
                    outline: rejectReason===r ? '1.5px solid rgba(244,63,94,0.4)' : '1px solid var(--border-color)' }}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={reject} disabled={!rejectReason || acting === rejectModal}
                style={{ flex:1, padding:'11px 0', borderRadius:11, border:'none', cursor:'pointer',
                  background:'rgba(244,63,94,0.9)', color:'white', fontWeight:700, fontSize:14,
                  opacity: rejectReason ? 1 : 0.5 }}>
                Confirm Reject
              </button>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                style={{ flex:1, padding:'11px 0', borderRadius:11, cursor:'pointer', fontSize:14,
                  background:'var(--bg-tertiary)', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:10 }}>
            <Crown size={22} color="#F59E0B" /> Premium Requests
          </h2>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
            {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
          </p>
        </div>
        <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
          borderRadius:10, background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
          cursor:'pointer', color:'var(--text-secondary)', fontSize:13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Grant by Email */}
      <div style={{ padding:'20px 22px', borderRadius:16, background:'rgba(245,158,11,0.07)',
        border:'1px solid rgba(245,158,11,0.25)', marginBottom:24 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#F59E0B', marginBottom:12,
          display:'flex', alignItems:'center', gap:7 }}>
          <Crown size={15} /> Grant Premium Directly by Email
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <input
            value={grantEmail}
            onChange={e => { setGrantEmail(e.target.value); setGrantMsg(null); }}
            onKeyDown={e => e.key === 'Enter' && grantByEmail()}
            placeholder="user@email.com"
            style={{ flex:1, minWidth:220, padding:'10px 14px', borderRadius:10, fontSize:13,
              background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
              color:'var(--text-primary)', outline:'none', fontFamily:'inherit' }}
            onFocus={e => e.target.style.borderColor = '#F59E0B80'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button onClick={grantByEmail} disabled={!grantEmail.trim() || granting}
            style={{ padding:'10px 22px', borderRadius:10, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#F59E0B,#FBBF24)', color:'white',
              fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:7,
              opacity: grantEmail.trim() ? 1 : 0.5 }}>
            {granting
              ? <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid white',
                  borderTopColor:'transparent', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
              : <Crown size={14} />}
            {granting ? 'Granting…' : 'Grant Premium'}
          </button>
        </div>
        {grantMsg && (
          <p style={{ marginTop:10, fontSize:13, fontWeight:600,
            color: grantMsg.type === 'success' ? '#10B981' : '#F43F5E' }}>
            {grantMsg.type === 'success' ? '✅' : '❌'} {grantMsg.text}
          </p>
        )}
      </div>

      {/* Count chips */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {[['pending','Pending',counts.pending,'#F59E0B'],
          ['approved','Approved',counts.approved,'#10B981'],
          ['rejected','Rejected',counts.rejected,'#F43F5E'],
          ['','All',counts.pending+counts.approved+counts.rejected,'#8B5CF6'],
        ].map(([f,label,count,color]) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            style={{ padding:'8px 18px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              background: filter===f ? `${color}15` : 'var(--bg-secondary)',
              color: filter===f ? color : 'var(--text-muted)',
              outline: filter===f ? `1.5px solid ${color}40` : '1px solid var(--border-color)' }}>
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 13px',
        borderRadius:11, background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
        marginBottom:16, maxWidth:400 }}>
        <Search size={14} color="var(--text-muted)" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name, email, UTR…"
          style={{ flex:1, background:'none', border:'none', outline:'none',
            color:'var(--text-primary)', fontSize:13, fontFamily:'inherit' }} />
      </div>

      {/* Requests list */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:80, borderRadius:14 }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 24px', background:'var(--bg-secondary)',
          borderRadius:16, border:'1px solid var(--border-color)' }}>
          <Crown size={36} color="var(--text-muted)" style={{ opacity:0.3, marginBottom:12 }} />
          <p style={{ fontSize:15, color:'var(--text-muted)' }}>No {filter || ''} requests found</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {requests.map(req => {
            const cfg = STATUS_CFG[req.status] || STATUS_CFG.pending;
            return (
              <div key={req._id} style={{ padding:'18px 20px', borderRadius:16,
                background:'var(--bg-secondary)', border:`1px solid ${cfg.color}25` }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                  {/* Left info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                      <p style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{req.name}</p>
                      <span style={{ fontSize:11, fontWeight:700, color:cfg.color,
                        background:cfg.bg, padding:'2px 9px', borderRadius:8 }}>{cfg.label}</span>
                      <span style={{ fontSize:11, color:'#8B5CF6', background:'rgba(139,92,246,0.1)',
                        padding:'2px 9px', borderRadius:8 }}>{req.paymentApp}</span>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{req.email}
                      {req.phone ? ` · ${req.phone}` : ''}
                    </p>
                    <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text-secondary)', flexWrap:'wrap' }}>
                      <span>TXN: <strong style={{ color:'var(--text-primary)', fontFamily:'monospace' }}>{req.transactionId}</strong></span>
                      <span>UTR: <strong style={{ color:'var(--text-primary)', fontFamily:'monospace' }}>{req.utrNumber}</strong></span>
                      <span>₹{req.amount}</span>
                      <span>{new Date(req.createdAt).toLocaleString('en-IN',{ month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                    {req.rejectionReason && (
                      <p style={{ fontSize:12, color:'#F43F5E', marginTop:6 }}>Reason: {req.rejectionReason}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {req.status === 'pending' && (
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button onClick={() => approve(req._id)} disabled={acting === req._id}
                        style={{ padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer',
                          background:'rgba(16,185,129,0.15)', color:'#10B981', fontWeight:700, fontSize:13,
                          display:'flex', alignItems:'center', gap:6, transition:'all 0.15s',
                          outline:'1.5px solid rgba(16,185,129,0.35)' }}>
                        {acting === req._id
                          ? <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid #10B981', borderTopColor:'transparent', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
                          : <Check size={14} />}
                        Approve
                      </button>
                      <button onClick={() => { setRejectModal(req._id); setRejectReason(''); }}
                        style={{ padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer',
                          background:'rgba(244,63,94,0.12)', color:'#F43F5E', fontWeight:700, fontSize:13,
                          display:'flex', alignItems:'center', gap:6,
                          outline:'1.5px solid rgba(244,63,94,0.3)' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                  {req.status === 'approved' && (
                    <span style={{ fontSize:12, color:'#10B981', display:'flex', alignItems:'center', gap:5 }}>
                      <CheckCircle2 size={14} /> Approved
                      {req.reviewedAt && ` · ${new Date(req.reviewedAt).toLocaleDateString('en-IN',{ month:'short', day:'numeric' })}`}
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span style={{ fontSize:12, color:'#F43F5E', display:'flex', alignItems:'center', gap:5 }}>
                      <AlertCircle size={14} /> Rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            style={{ padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer',
              background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
              color:'var(--text-secondary)', fontSize:13, opacity: page===1 ? 0.4 : 1 }}>
            ← Prev
          </button>
          <span style={{ padding:'8px 14px', fontSize:13, color:'var(--text-muted)' }}>
            Page {page} of {Math.ceil(total/20)}
          </span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/20)}
            style={{ padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer',
              background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
              color:'var(--text-secondary)', fontSize:13, opacity: page>=Math.ceil(total/20) ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ── Login ── */
function LoginScreen({ onLogin }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const r = await fetch(`${API}/admin/stats`, { headers:{ Authorization:`Bearer ${pwd}` } });
      if (r.ok) { onLogin(pwd); } else { setErr('Wrong password.'); }
    } catch { setErr('Cannot reach server.'); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        style={{ width:380, background:'var(--bg-secondary)',
          border:'1px solid var(--border-color)', borderRadius:20, padding:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
          <div style={{ width:44, height:44, borderRadius:12,
            background:'linear-gradient(135deg,#8B5CF6,#06B6D4)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'var(--text-primary)' }}>Admin Panel</h1>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>NoteNova — restricted</p>
          </div>
        </div>
        <form onSubmit={submit}>
          <input type="password" placeholder="Enter admin password" value={pwd}
            onChange={e => setPwd(e.target.value)}
            style={{ width:'100%', padding:'12px 16px', borderRadius:12, fontSize:14,
              background:'var(--bg-tertiary)', border:'1px solid var(--border-color)',
              color:'var(--text-primary)', outline:'none', marginBottom:12, boxSizing:'border-box' }} />
          {err && <p style={{ color:'#F43F5E', fontSize:13, marginBottom:12 }}>{err}</p>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px 0', borderRadius:12, fontWeight:700, fontSize:15,
              cursor:'pointer', border:'none', background:'linear-gradient(135deg,#8B5CF6,#06B6D4)', color:'white' }}>
            {loading ? 'Checking…' : 'Enter Panel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Individual user detail view ── */
function UserDetail({ userId, token, onBack }) {
  const [data, setData] = useState(null);
  const [section, setSection] = useState('timeline');
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/users/${userId}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.json()).then(setData);
  }, [userId, token]);

  if (!data) return <p style={{ color:'var(--text-muted)', padding:32 }}>Loading user…</p>;
  const { user, counts, quiz, timeline, activityDays, chats, notes, quizzes } = data;

  return (
    <div>
      {selectedChat && <ChatModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none',
        border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:13, marginBottom:20, padding:0 }}>
        <ArrowLeft size={14} /> Back to Users
      </button>

      {/* User header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        {user.profileImage
          ? <img src={user.profileImage} alt="" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover' }} />
          : <div style={{ width:56, height:56, borderRadius:'50%', background:'#8B5CF620',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#8B5CF6' }}>
              {user.name?.[0]?.toUpperCase()}
            </div>}
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text-primary)' }}>{user.name}</h2>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>{user.email}</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
            Joined {new Date(user.createdAt).toLocaleDateString('en-US',{ month:'long', day:'numeric', year:'numeric' })}
          </p>
        </div>
      </div>

      {/* Counts */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {[['Notes',counts.notes,'#8B5CF6'],['Chats',counts.chats,'#06B6D4'],['Quizzes',counts.quizzes,'#F59E0B'],['Plans',counts.plans,'#EC4899'],['Quiz Avg',`${quiz.avgScore}%`,'#10B981']].map(([l,v,c]) => (
          <div key={l} style={{ padding:'7px 14px', borderRadius:10, background:`${c}15`, border:`1px solid ${c}30` }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{l} </span>
            <span style={{ fontSize:14, fontWeight:800, color:c }}>{v}</span>
          </div>
        ))}
      </div>

      {/* 30-day mini chart */}
      <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
        borderRadius:14, padding:16, marginBottom:20 }}>
        <p style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', marginBottom:10 }}>30-Day Activity</p>
        <ActivityBar data={activityDays} height={70} />
      </div>

      {/* Section tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[['timeline','Timeline'],['chats','AI Chats'],['notes','Notes'],['quizzes','Quizzes']].map(([id,label]) => (
          <button key={id} onClick={() => setSection(id)}
            style={{ padding:'7px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
              background: section===id ? 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.15))' : 'var(--bg-secondary)',
              color: section===id ? '#A78BFA' : 'var(--text-muted)',
              border: section===id ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--border-color)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {section === 'timeline' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {timeline.map((item, i) => {
            const cfg = TYPE_COLORS[item.type] || TYPE_COLORS.note;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                padding:'10px 16px', borderRadius:12,
                background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />
                <span style={{ fontSize:11, fontWeight:700, color:cfg.color, width:48, flexShrink:0, textTransform:'uppercase' }}>{cfg.label}</span>
                <span style={{ flex:1, fontSize:13, color:'var(--text-primary)', fontWeight:600 }}>{item.title||'Untitled'}</span>
                {item.meta && <span style={{ fontSize:12, color:'var(--text-muted)', textTransform:'capitalize' }}>{item.meta}</span>}
                {item.messageCount != null && <span style={{ fontSize:12, color:'var(--text-muted)' }}>{item.messageCount} msgs</span>}
                <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>
                  {new Date(item.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                </span>
              </div>
            );
          })}
          {!timeline.length && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No activity yet.</p>}
        </div>
      )}

      {/* User chats */}
      {section === 'chats' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {chats.map(c => (
            <div key={c._id} onClick={() => setSelectedChat(c)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
                borderRadius:12, background:'var(--bg-secondary)', border:'1px solid var(--border-color)',
                cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-color)'}>
              <div style={{ width:10, height:10, borderRadius:'50%', background: MODE_COLORS[c.mode]||'#8B5CF6', flexShrink:0 }} />
              <span style={{ flex:1, fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{c.title||'Untitled'}</span>
              <span style={{ fontSize:12, color: MODE_COLORS[c.mode]||'#8B5CF6', textTransform:'capitalize' }}>{c.mode}</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{c.messageCount} msgs</span>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                {new Date(c.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
              </span>
            </div>
          ))}
          {!chats.length && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No chats yet.</p>}
        </div>
      )}

      {/* User notes */}
      {section === 'notes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {notes.map(n => (
            <div key={n._id} style={{ padding:'12px 16px', borderRadius:12,
              background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{n.title}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                </span>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                {n.subject && <span style={{ fontSize:11, color:'#8B5CF6', background:'#8B5CF615', padding:'2px 8px', borderRadius:6 }}>{n.subject}</span>}
                <span style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-tertiary)', padding:'2px 8px', borderRadius:6, textTransform:'capitalize' }}>{n.noteType}</span>
              </div>
            </div>
          ))}
          {!notes.length && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No notes yet.</p>}
        </div>
      )}

      {/* User quizzes */}
      {section === 'quizzes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {quizzes.map(q => {
            const best = q.attempts?.length ? Math.max(...q.attempts.map(a => Math.round((a.score/a.total)*100))) : null;
            return (
              <div key={q._id} style={{ padding:'12px 16px', borderRadius:12,
                background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{q.title}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {best != null && <span style={{ fontSize:13, fontWeight:800, color:'#10B981' }}>{best}%</span>}
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {new Date(q.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:6 }}>
                  <span style={{ fontSize:11, color:'#F59E0B', background:'#F59E0B15', padding:'2px 8px', borderRadius:6, textTransform:'capitalize' }}>{q.difficulty}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-tertiary)', padding:'2px 8px', borderRadius:6 }}>{q.questions?.length} questions</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-tertiary)', padding:'2px 8px', borderRadius:6 }}>{q.attempts?.length} attempts</span>
                </div>
              </div>
            );
          })}
          {!quizzes.length && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No quizzes yet.</p>}
        </div>
      )}
    </div>
  );
}

/* ── Main AdminPanel export ── */
export default function AdminPanel() {
  const [token, setToken] = useState(null);
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [premiumCounts, setPremiumCounts] = useState(null);
  const [users, setUsers] = useState(null);
  const [activity, setActivity] = useState(null);
  const [chats, setChats] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [chatPage, setChatPage] = useState(1);
  const [chatSearch, setChatSearch] = useState('');
  const [chatMode, setChatMode] = useState('');
  const [fbFilter, setFbFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  const hdrs = useCallback(() => ({ Authorization:`Bearer ${token}` }), [token]);

  const fetchStats    = useCallback(async () => { const r = await fetch(`${API}/admin/stats`, { headers:hdrs() }); if (!r.ok) { setToken(null); sessionStorage.removeItem('admin_token'); return; } setStats(await r.json()); }, [hdrs]);
  const fetchActivity = useCallback(async () => { const r = await fetch(`${API}/admin/activity?limit=80`, { headers:hdrs() }); if (r.ok) setActivity(await r.json()); }, [hdrs]);
  const fetchUsers    = useCallback(async (page=1,search='') => { const r = await fetch(`${API}/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`, { headers:hdrs() }); if (r.ok) setUsers(await r.json()); }, [hdrs]);
  const fetchChats    = useCallback(async (page=1,search='',mode='') => { const params = new URLSearchParams({page,limit:20,search,mode}); const r = await fetch(`${API}/admin/chats?${params}`, { headers:hdrs() }); if (r.ok) setChats(await r.json()); }, [hdrs]);
  const fetchFeedback = useCallback(async (type='') => { const params = new URLSearchParams(type ? {type} : {}); const r = await fetch(`${API}/feedback/admin?${params}`, { headers:hdrs() }); if (r.ok) setFeedback(await r.json()); }, [hdrs]);
  const fetchPremium  = useCallback(async () => { const r = await fetch(`${API}/premium/admin/requests?limit=1`, { headers:hdrs() }); if (r.ok) { const d = await r.json(); setPremiumCounts(d.counts); } }, [hdrs]);

  useEffect(() => { if (!token) return; setLoading(true); Promise.all([fetchStats(), fetchActivity(), fetchPremium()]).finally(() => setLoading(false)); }, [token, refreshKey, fetchStats, fetchActivity, fetchPremium]);
  useEffect(() => { if (!token || tab !== 'users' || selectedUser) return; fetchUsers(userPage, userSearch); }, [token, tab, userPage, userSearch, refreshKey, selectedUser, fetchUsers]);
  useEffect(() => { if (!token || tab !== 'chats') return; fetchChats(chatPage, chatSearch, chatMode); }, [token, tab, chatPage, chatSearch, chatMode, refreshKey, fetchChats]);
  useEffect(() => { if (!token || tab !== 'feedback') return; fetchFeedback(fbFilter); }, [token, tab, fbFilter, refreshKey, fetchFeedback]);

  if (!token) return <LoginScreen onLogin={(t) => { sessionStorage.setItem('admin_token',t); setToken(t); }} />;

  const tabs = [
    { id:'overview', label:'Overview',  icon:BarChart3 },
    { id:'users',    label:'Users',     icon:Users },
    { id:'premium',  label:'Premium',   icon:Crown },
    { id:'chats',    label:'AI Chats',  icon:MessageSquare },
    { id:'activity', label:'Activity',  icon:Activity },
    { id:'feedback', label:'Feedback',  icon:MessageCircle },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)', fontFamily:'Inter,sans-serif' }}>
      {selectedChat && <ChatModal chat={selectedChat} onClose={() => setSelectedChat(null)} />}

      {/* Header */}
      <div style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)',
        padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#8B5CF6,#06B6D4)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck size={16} color="white" />
          </div>
          <span style={{ fontWeight:800, fontSize:16, color:'var(--text-primary)' }}>
            NoteNova <span style={{ color:'#8B5CF6' }}>Admin</span>
          </span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setRefreshKey(k => k+1)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10,
              background:'var(--bg-tertiary)', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', fontSize:13 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setToken(null); sessionStorage.removeItem('admin_token'); }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10,
              background:'var(--bg-tertiary)', border:'1px solid var(--border-color)', color:'#F43F5E', cursor:'pointer', fontSize:13 }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div style={{ display:'flex' }}>
        {/* Sidebar */}
        <div style={{ width:200, background:'var(--bg-secondary)', borderRight:'1px solid var(--border-color)',
          minHeight:'calc(100vh - 60px)', padding:16, flexShrink:0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedUser(null); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                borderRadius:10, cursor:'pointer', fontSize:14, marginBottom:4, fontWeight: tab===t.id ? 700 : 500, textAlign:'left',
                background: tab===t.id ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))' : 'transparent',
                color: tab===t.id ? '#A78BFA' : 'var(--text-secondary)',
                border: tab===t.id ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex:1, padding:32, overflow:'auto', maxHeight:'calc(100vh - 60px)' }}>
          {loading && !stats && <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading…</p>}

          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {tab === 'overview' && stats && (
              <motion.div key="overview" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                  <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>Dashboard Overview</h2>
                  <div style={{ fontSize:12, color:'var(--text-muted)', background:'var(--bg-tertiary)',
                    padding:'6px 14px', borderRadius:20, border:'1px solid var(--border-color)' }}>
                    🕐 {new Date().toLocaleString('en-IN',{ month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>

                {/* Primary stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14, marginBottom:20 }}>
                  <StatCard icon={Users}        label="Total Users"     value={stats.totals.users}        sub={`+${stats.week.users} this week`}         color="#8B5CF6" />
                  <StatCard icon={Crown}        label="Premium Users"   value={premiumCounts?.approved||0} sub={`${premiumCounts?.pending||0} pending`}  color="#F59E0B" />
                  <StatCard icon={FileText}     label="Notes Created"   value={stats.totals.notes}        sub={`+${stats.today.notes} today`}            color="#06B6D4" />
                  <StatCard icon={MessageSquare}label="AI Chats"        value={stats.totals.chats}        sub={`+${stats.today.chats} today`}            color="#EC4899" />
                  <StatCard icon={Brain}        label="Quizzes Made"    value={stats.totals.quizzes}      sub={`${stats.quiz.avgScore}% avg score`}      color="#F59E0B" />
                  <StatCard icon={Zap}          label="Quiz Attempts"   value={stats.quiz.totalAttempts}  sub="total"                                    color="#F43F5E" />
                  <StatCard icon={CalendarDays} label="Study Plans"     value={stats.totals.plans}        sub="active"                                   color="#10B981" />
                  <StatCard icon={Users}        label="New Today"       value={stats.today.users}         sub="registrations"                            color="#3B82F6" />
                </div>

                {/* Revenue summary */}
                {premiumCounts && (
                  <div style={{ padding:'20px 24px', borderRadius:16, marginBottom:20,
                    background:'linear-gradient(135deg,rgba(245,185,66,0.1),rgba(245,185,66,0.04))',
                    border:'1px solid rgba(245,185,66,0.3)',
                    display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                    <div style={{ fontSize:28 }}>👑</div>
                    <div style={{ flex:1, minWidth:180 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#F59E0B', marginBottom:4 }}>Premium Revenue</p>
                      <p style={{ fontSize:28, fontWeight:900, color:'var(--text-primary)', lineHeight:1 }}>
                        ₹{(premiumCounts.approved || 0) * 99}
                      </p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
                        {premiumCounts.approved || 0} paid members × ₹99
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                      {[
                        { label:'Approved', val:premiumCounts.approved||0, color:'#10B981' },
                        { label:'Pending',  val:premiumCounts.pending||0,  color:'#F59E0B' },
                        { label:'Rejected', val:premiumCounts.rejected||0, color:'#F43F5E' },
                      ].map(s=>(
                        <div key={s.label} style={{ textAlign:'center' }}>
                          <p style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.val}</p>
                          <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {(premiumCounts.pending||0) > 0 && (
                      <button onClick={() => { setTab('premium'); }}
                        style={{ padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer',
                          background:'linear-gradient(135deg,#F59E0B,#FBBF24)', color:'#000',
                          fontWeight:800, fontSize:13, whiteSpace:'nowrap' }}>
                        Review {premiumCounts.pending} Pending →
                      </button>
                    )}
                  </div>
                )}

                {/* Activity chart */}
                <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:16, padding:24, marginBottom:20 }}>
                  <h3 style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:20 }}>📊 14-Day Activity</h3>
                  <ActivityBar data={stats.dailyActivity} />
                </div>

                {/* Chat modes + Note types */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="admin-2col">
                  <style>{`.admin-2col{grid-template-columns:1fr 1fr}@media(max-width:640px){.admin-2col{grid-template-columns:1fr!important}}`}</style>
                  <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:16, padding:24 }}>
                    <h3 style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>💬 Chat Modes</h3>
                    {stats.chatModes.map(m => {
                      const pct = stats.totals.chats > 0 ? Math.round((m.count/stats.totals.chats)*100) : 0;
                      return (
                        <div key={m._id} style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:13, color:'var(--text-secondary)', textTransform:'capitalize' }}>{m._id||'study'}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:'#8B5CF6' }}>{m.count}</span>
                          </div>
                          <div style={{ height:4, borderRadius:2, background:'var(--bg-tertiary)', overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, borderRadius:2, background:'#8B5CF6' }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:16, padding:24 }}>
                    <h3 style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>📝 Note Types</h3>
                    {stats.noteTypes.map(t => {
                      const pct = stats.totals.notes > 0 ? Math.round((t.count/stats.totals.notes)*100) : 0;
                      return (
                        <div key={t._id} style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:13, color:'var(--text-secondary)', textTransform:'capitalize' }}>{t._id||'custom'}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:'#06B6D4' }}>{t.count}</span>
                          </div>
                          <div style={{ height:4, borderRadius:2, background:'var(--bg-tertiary)', overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, borderRadius:2, background:'#06B6D4' }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {selectedUser
                  ? <UserDetail userId={selectedUser} token={token} onBack={() => setSelectedUser(null)} />
                  : <>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>Users</h2>
                        <div style={{ position:'relative' }}>
                          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                          <input placeholder="Search name / email" value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                            style={{ padding:'8px 12px 8px 32px', borderRadius:10, fontSize:13, background:'var(--bg-tertiary)',
                              border:'1px solid var(--border-color)', color:'var(--text-primary)', outline:'none', width:220 }} />
                        </div>
                      </div>
                      {users ? (
                        <>
                          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:16, overflow:'hidden' }}>
                            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom:'1px solid var(--border-color)' }}>
                                  {['User','Email','Notes','Chats','Quizzes','Joined',''].map(h => (
                                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12,
                                      fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {users.users.map(u => (
                                  <tr key={u._id} style={{ borderBottom:'1px solid var(--border-color)', cursor:'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-tertiary)'}
                                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                    onClick={() => setSelectedUser(u.clerkId)}>
                                    <td style={{ padding:'12px 16px' }}>
                                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                        {u.profileImage
                                          ? <img src={u.profileImage} alt="" style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} />
                                          : <div style={{ width:32, height:32, borderRadius:'50%', background:'#8B5CF620', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#8B5CF6' }}>{u.name?.[0]?.toUpperCase()}</div>}
                                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{u.name}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-muted)' }}>{u.email}</td>
                                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#8B5CF6' }}>{u.notes}</td>
                                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#06B6D4' }}>{u.chats}</td>
                                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#F59E0B' }}>{u.quizzes}</td>
                                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-muted)' }}>
                                      {new Date(u.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                                    </td>
                                    <td style={{ padding:'12px 16px', fontSize:12, color:'#8B5CF6' }}>View →</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16 }}>
                            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{users.total} users</span>
                            <div style={{ display:'flex', gap:8 }}>
                              <button onClick={() => setUserPage(p => Math.max(1,p-1))} disabled={userPage===1}
                                style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border-color)', background:'var(--bg-tertiary)', color:'var(--text-secondary)', cursor:'pointer' }}>
                                <ChevronLeft size={14} />
                              </button>
                              <span style={{ padding:'6px 12px', fontSize:13, color:'var(--text-primary)' }}>{userPage} / {users.pages}</span>
                              <button onClick={() => setUserPage(p => Math.min(users.pages,p+1))} disabled={userPage===users.pages}
                                style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border-color)', background:'var(--bg-tertiary)', color:'var(--text-secondary)', cursor:'pointer' }}>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading users…</p>}
                    </>
                }
              </motion.div>
            )}

            {/* AI CHATS */}
            {tab === 'chats' && (
              <motion.div key="chats" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                  <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>AI Chats</h2>
                  <div style={{ display:'flex', gap:8 }}>
                    <select value={chatMode} onChange={e => { setChatMode(e.target.value); setChatPage(1); }}
                      style={{ padding:'8px 12px', borderRadius:10, fontSize:13, background:'var(--bg-tertiary)',
                        border:'1px solid var(--border-color)', color:'var(--text-primary)', outline:'none' }}>
                      <option value="">All modes</option>
                      {['study','coding','research','exam','simple'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div style={{ position:'relative' }}>
                      <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                      <input placeholder="Search chats…" value={chatSearch} onChange={e => { setChatSearch(e.target.value); setChatPage(1); }}
                        style={{ padding:'8px 12px 8px 32px', borderRadius:10, fontSize:13, background:'var(--bg-tertiary)',
                          border:'1px solid var(--border-color)', color:'var(--text-primary)', outline:'none', width:200 }} />
                    </div>
                  </div>
                </div>
                {chats ? (
                  <>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {chats.chats.map(c => (
                        <div key={c._id} onClick={() => setSelectedChat(c)}
                          style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
                            borderRadius:12, background:'var(--bg-secondary)', border:'1px solid var(--border-color)', cursor:'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-color)'}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background: MODE_COLORS[c.mode]||'#8B5CF6', flexShrink:0 }} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title||'Untitled'}</p>
                            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{c.user?.name || c.user?.email || 'Unknown'}</p>
                          </div>
                          <span style={{ fontSize:12, color: MODE_COLORS[c.mode]||'#8B5CF6', textTransform:'capitalize', flexShrink:0 }}>{c.mode}</span>
                          <span style={{ fontSize:12, color:'var(--text-muted)', flexShrink:0 }}>{c.messageCount} msgs</span>
                          <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>
                            {new Date(c.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                          </span>
                        </div>
                      ))}
                      {!chats.chats.length && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No chats found.</p>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16 }}>
                      <span style={{ fontSize:13, color:'var(--text-muted)' }}>{chats.total} chats</span>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => setChatPage(p => Math.max(1,p-1))} disabled={chatPage===1}
                          style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border-color)', background:'var(--bg-tertiary)', color:'var(--text-secondary)', cursor:'pointer' }}>
                          <ChevronLeft size={14} />
                        </button>
                        <span style={{ padding:'6px 12px', fontSize:13, color:'var(--text-primary)' }}>{chatPage} / {chats.pages}</span>
                        <button onClick={() => setChatPage(p => Math.min(chats.pages,p+1))} disabled={chatPage===chats.pages}
                          style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border-color)', background:'var(--bg-tertiary)', color:'var(--text-secondary)', cursor:'pointer' }}>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading chats…</p>}
              </motion.div>
            )}

            {/* ACTIVITY */}
            {tab === 'activity' && (
              <motion.div key="activity" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:24 }}>Live Activity Feed</h2>
                {activity ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {activity.map((item, i) => {
                      const cfg = TYPE_COLORS[item.type] || TYPE_COLORS.note;
                      return (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                          padding:'12px 16px', borderRadius:12,
                          background:'var(--bg-secondary)', border:'1px solid var(--border-color)' }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />
                          <span style={{ fontSize:11, fontWeight:700, color:cfg.color, textTransform:'uppercase', width:52, flexShrink:0 }}>{cfg.label}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{item.title||'Untitled'}</span>
                            {item.meta && <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:8, textTransform:'capitalize' }}>• {item.meta}</span>}
                          </div>
                          <span style={{ fontSize:12, color:'var(--text-muted)', flexShrink:0 }}>{item.user?.name || item.user?.email || ''}</span>
                          <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0, width:110, textAlign:'right' }}>
                            {new Date(item.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric' })}
                            {' '}{new Date(item.createdAt).toLocaleTimeString('en-US',{ hour:'2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading activity…</p>}
              </motion.div>
            )}

            {/* PREMIUM REQUESTS */}
            {tab === 'premium' && (
              <PremiumTab token={token} />
            )}

            {/* FEEDBACK */}
            {tab === 'feedback' && (
              <motion.div key="feedback" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                  <div>
                    <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>User Feedback</h2>
                    {feedback && <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
                      {feedback.newCount} new · Avg rating: {feedback.avgRating ? `${feedback.avgRating}⭐` : 'N/A'}
                    </p>}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['','All'],['bug','🐛 Bugs'],['feature','💡 Features'],['praise','🌟 Praise'],['general','💬 General']].map(([id,label]) => (
                      <button key={id} onClick={() => setFbFilter(id)}
                        style={{ padding:'7px 12px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                          background: fbFilter===id ? 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.15))' : 'var(--bg-tertiary)',
                          color: fbFilter===id ? '#A78BFA' : 'var(--text-muted)',
                          border: fbFilter===id ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--border-color)' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                {feedback && (
                  <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
                    {[['bug','🐛','#F43F5E'],['feature','💡','#8B5CF6'],['praise','🌟','#10B981'],['general','💬','#06B6D4']].map(([type,icon,color]) => (
                      <div key={type} style={{ padding:'10px 16px', borderRadius:12, background:`${color}10`, border:`1px solid ${color}25` }}>
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>{icon} {type} </span>
                        <span style={{ fontWeight:800, color }}>{feedback.stats?.[type] || 0}</span>
                      </div>
                    ))}
                  </div>
                )}

                {feedback ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {feedback.items?.map(fb => {
                      const typeColors = { bug:'#F43F5E', feature:'#8B5CF6', praise:'#10B981', general:'#06B6D4' };
                      const color = typeColors[fb.type] || '#06B6D4';
                      return (
                        <div key={fb._id} style={{ padding:'16px 18px', borderRadius:14,
                          background:'var(--bg-secondary)', border:`1px solid ${color}20` }}>
                          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10 }}>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                                <span style={{ fontSize:11, fontWeight:700, color, background:`${color}15`,
                                  padding:'2px 8px', borderRadius:6, textTransform:'capitalize' }}>{fb.type}</span>
                                {fb.rating && (
                                  <span style={{ fontSize:12, color:'#F59E0B' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5-fb.rating)}</span>
                                )}
                                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{fb.name}</span>
                                {fb.page && <span style={{ fontSize:11, color:'var(--text-muted)' }}>· {fb.page}</span>}
                                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6,
                                  background: fb.status==='new' ? '#F43F5E15' : fb.status==='resolved' ? '#10B98115' : '#F59E0B15',
                                  color: fb.status==='new' ? '#F43F5E' : fb.status==='resolved' ? '#10B981' : '#F59E0B',
                                  fontWeight:600, textTransform:'capitalize' }}>{fb.status}</span>
                              </div>
                              <p style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.6 }}>{fb.message}</p>
                            </div>
                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                              <select value={fb.status}
                                onChange={async e => {
                                  await fetch(`${API}/feedback/admin/${fb._id}`, { method:'PATCH', headers:{...hdrs(),'Content-Type':'application/json'}, body:JSON.stringify({status:e.target.value}) });
                                  fetchFeedback(fbFilter);
                                }}
                                style={{ padding:'4px 8px', borderRadius:8, fontSize:11, background:'var(--bg-tertiary)',
                                  border:'1px solid var(--border-color)', color:'var(--text-primary)', outline:'none' }}>
                                <option value="new">New</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              <button onClick={async () => {
                                await fetch(`${API}/feedback/admin/${fb._id}`, { method:'DELETE', headers:hdrs() });
                                fetchFeedback(fbFilter);
                              }} style={{ width:28, height:28, borderRadius:8, background:'rgba(244,63,94,0.1)',
                                border:'none', display:'flex', alignItems:'center', justifyContent:'center',
                                cursor:'pointer', color:'#F43F5E' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p style={{ fontSize:11, color:'var(--text-muted)' }}>
                            {new Date(fb.createdAt).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                            {' '}{new Date(fb.createdAt).toLocaleTimeString('en-US',{ hour:'2-digit', minute:'2-digit' })}
                            {fb.email && ` · ${fb.email}`}
                          </p>
                        </div>
                      );
                    })}
                    {!feedback.items?.length && (
                      <p style={{ color:'var(--text-muted)', fontSize:14, padding:32, textAlign:'center' }}>No feedback yet.</p>
                    )}
                  </div>
                ) : <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading feedback…</p>}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
