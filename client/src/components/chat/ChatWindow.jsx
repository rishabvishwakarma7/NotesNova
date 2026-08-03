'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, RotateCcw, Plus, Sparkles,
  PanelRight, X, BookOpen, FileText, Brain, Target,
  RefreshCw, ChevronRight, Layers,
} from 'lucide-react';
import MessageBubble from '@/components/chat/MessageBubble';
import ModeSelector from '@/components/chat/ModeSelector';
import TypingIndicator from '@/components/chat/TypingIndicator';
import Link from 'next/link';

/* ── Prompt suggestions for empty state ── */
const SUGGESTIONS = [
  { emoji: '📚', text: 'Explain Operating Systems simply' },
  { emoji: '🔢', text: 'Explain linear transformations' },
  { emoji: '🗃️', text: 'Create DBMS revision notes' },
  { emoji: '🌐', text: 'Quiz me on Computer Networks' },
  { emoji: '💻', text: 'Explain recursion with an example' },
  { emoji: '🎯', text: 'Prepare me for an exam on DBMS' },
];

/* ── Learning context panel ── */
function ContextPanel({ messages, mode, context, onContextChange, onClose }) {
  const topics = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.slice(0, 50))
    .slice(-4)
    .reverse();

  const modeLabels = {
    study: 'Study Mode', coding: 'Coding Mode',
    research: 'Research Mode', exam: 'Exam Prep',
    simple: 'Simple Mode', teach: 'Teach Me Mode',
    socratic: 'Socratic Mode',
  };

  return (
    <div style={{ width: 240, borderLeft: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden' }}>
      {/* Panel header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
          textTransform: 'uppercase', letterSpacing: '0.07em' }}>Learning Context</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 2, display: 'flex', alignItems: 'center' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>
        {/* Context inputs — always shown */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Study Context</p>
          <input value={context.subject} onChange={e => onContextChange(p => ({ ...p, subject: e.target.value }))}
            placeholder="Subject (e.g. Networks)"
            style={{ width: '100%', padding: '7px 9px', borderRadius: 8, fontSize: 12, marginBottom: 6,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          <input value={context.topic} onChange={e => onContextChange(p => ({ ...p, topic: e.target.value }))}
            placeholder="Topic (e.g. CRC)"
            style={{ width: '100%', padding: '7px 9px', borderRadius: 8, fontSize: 12,
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>

        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Start a conversation to build your context.
            </p>
          </div>
        ) : (
          <>
            {/* Current mode */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Session Mode</p>
              <div style={{ padding: '8px 10px', borderRadius: 10,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-light)' }}>
                  {modeLabels[mode] || 'Study Mode'}
                </p>
              </div>
            </div>

            {/* Topics discussed */}
            {topics.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Topics Discussed</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {topics.map((t, i) => (
                    <div key={i} style={{ padding: '6px 8px', borderRadius: 8,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {t}{t.length >= 50 ? '…' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session stats */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Session</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Questions', value: messages.filter(m => m.role === 'user').length, color: '#6366F1' },
                  { label: 'Answers', value: messages.filter(m => m.role === 'assistant').length, color: '#10B981' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '8px', borderRadius: 8, background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Continue In</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { icon: FileText, label: 'My Notes',    href: '/dashboard/notes' },
                  { icon: Brain,    label: 'AI Quiz',      href: '/dashboard/quiz' },
                  { icon: Layers,   label: 'Flashcards',  href: '/dashboard/flashcards' },
                  { icon: RefreshCw,label: 'Revision',    href: '/dashboard/revision' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
                      borderRadius: 8, textDecoration: 'none', background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                    <item.icon size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
                    <ChevronRight size={10} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main ChatWindow ── */
export default function ChatWindow() {
  const { getToken } = useAuth();
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [mode,        setMode]        = useState('study');
  const [isListening, setIsListening] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [context,     setContext]     = useState({ subject: '', topic: '' });
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (overrideInput) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isLoading) return;

    const userMsg    = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token  = await getToken();
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
          subject: context.subject || undefined,
          topic: context.topic || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Stream failed');
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                aiContent += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: aiContent };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: getErrorResponse(err.message) }]);
    }
    setIsLoading(false);
  }, [input, messages, mode, isLoading, getToken]);

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => { setInput(p => p + e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend   = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const handleNewChat = () => { setMessages([]); setInput(''); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFollowUp = useCallback((prompt) => {
    setInput(prompt);
    setTimeout(() => { handleSend(prompt); }, 50);
  }, [handleSend]);

  const handleSuggestion = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10,
              background: 'var(--gradient-ai)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                NoteNova AI
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Your Personal Study Tutor</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ModeSelector mode={mode} onSelect={setMode} />
            <button onClick={handleNewChat}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
                borderRadius: 9, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <Plus size={13} /> New Chat
            </button>
            <button onClick={() => setShowContext(c => !c)}
              title="Learning Context"
              style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: `1px solid ${showContext ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`,
                background: showContext ? 'rgba(99,102,241,0.1)' : 'var(--bg-tertiary)',
                color: showContext ? 'var(--color-primary-light)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s' }}>
              <PanelRight size={14} />
            </button>
          </div>
        </div>

        {/* ── CONTEXT BAR ── */}
        {(context.subject || context.topic || mode === 'teach' || mode === 'socratic') && (
          <div style={{ padding:'6px 20px', background:'var(--bg-tertiary)',
            borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {mode === 'teach' && (
              <span style={{ fontSize:11, fontWeight:700, color:'#10B981',
                background:'rgba(16,185,129,0.1)', padding:'2px 8px', borderRadius:6 }}>
                🎓 Teach Me Mode — AI will explain, then quiz you
              </span>
            )}
            {mode === 'socratic' && (
              <span style={{ fontSize:11, fontWeight:700, color:'#EC4899',
                background:'rgba(236,72,153,0.1)', padding:'2px 8px', borderRadius:6 }}>
                💭 Socratic Mode — AI guides with questions
              </span>
            )}
            {context.subject && (
              <span style={{ fontSize:11, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                📚 <strong>{context.subject}</strong>
                {context.topic && <> › {context.topic}</>}
              </span>
            )}
            <button onClick={() => setContext({ subject: '', topic: '' })}
              style={{ marginLeft:'auto', fontSize:11, color:'var(--text-muted)', background:'none',
                border:'none', cursor:'pointer' }}>
              Clear ×
            </button>
          </div>
        )}

        {/* ── MESSAGES ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px',
          display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', padding:'16px 20px', textAlign:'center' }}>
              {/* AI Avatar */}
              <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', damping:15 }}
                style={{ width:72, height:72, borderRadius:22, marginBottom:20,
                  background:'var(--gradient-ai)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 8px 32px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.2)' }}>
                <Sparkles size={32} color="white" />
              </motion.div>

              <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:8, lineHeight:1.2 }}>
                What do you want to learn today?
              </h2>
              <p style={{ fontSize:15, color:'var(--text-secondary)', maxWidth:420, lineHeight:1.6, marginBottom:20 }}>
                Ask me to explain concepts, create study notes, quiz you, or help with exam prep.
              </p>

              {/* Capability chips */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:20 }}>
                {[
                  { icon:BookOpen,  text:'Explain concepts' },
                  { icon:FileText,  text:'Create study notes' },
                  { icon:Target,    text:'Exam preparation' },
                  { icon:Brain,     text:'Quiz me' },
                  { icon:RefreshCw, text:'Revise topics' },
                ].map((c, i) => (
                  <motion.button key={i} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    onClick={() => { setInput(c.text); inputRef.current?.focus(); }}
                    style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px',
                      borderRadius:24, background:'rgba(99,102,241,0.08)',
                      border:'1px solid rgba(99,102,241,0.2)', cursor:'pointer',
                      fontSize:14, fontWeight:600, color:'#C4CAD9', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.color='#A5B4FC'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.08)'; e.currentTarget.style.color='#C4CAD9'; }}>
                    <c.icon size={14} color="#818CF8" /> {c.text}
                  </motion.button>
                ))}
              </div>

              {/* Prompt suggestion cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, maxWidth:560, width:'100%' }}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={i} whileHover={{ y:-2, scale:1.01 }} whileTap={{ scale:0.98 }}
                    onClick={() => handleSuggestion(s.text)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px',
                      borderRadius:14, background:'var(--bg-card)',
                      border:'1px solid var(--border-color)',
                      cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.background='var(--bg-tertiary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-color)'; e.currentTarget.style.background='var(--bg-card)'; }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{s.emoji}</span>
                    <span style={{ fontSize:13.5, color:'#C4CAD9', fontWeight:500, lineHeight:1.4 }}>{s.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} onFollowUp={handleFollowUp} />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
          <div ref={messagesEndRef} style={{ height: 4 }} />
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{ padding: '12px 20px 14px', borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)', flexShrink: 0 }}>
          {messages.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <button onClick={() => {
                if (messages.length < 2) return;
                setMessages(messages.slice(0, -1));
              }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                  borderRadius: 8, background: 'none', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <RotateCcw size={11} /> Regenerate
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            background: 'var(--bg-input)', border: '1px solid var(--border-color)',
            transition: 'border-color 0.2s' }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-glow)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI Tutor anything..."
              rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, resize: 'none',
                fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 120, overflow: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }} />
            <button onClick={handleVoice}
              title={isListening ? 'Stop listening' : 'Voice input'}
              style={{ width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
                background: isListening ? 'rgba(239,68,68,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isListening ? '#EF4444' : 'var(--text-muted)', transition: 'all 0.2s', flexShrink: 0 }}>
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
              title="Send message"
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default', flexShrink: 0,
                background: input.trim() && !isLoading ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Send size={15} color={input.trim() && !isLoading ? 'white' : 'var(--text-muted)'} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
            AI can make mistakes · Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── RIGHT CONTEXT PANEL (desktop) ── */}
      <AnimatePresence>
        {showContext && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', display: 'flex' }}>
            <ContextPanel messages={messages} mode={mode} context={context} onContextChange={setContext} onClose={() => setShowContext(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getErrorResponse(msg) {
  if (msg?.includes('rate limit') || msg?.includes('429') || msg?.includes('quota'))
    return '## ⚠️ Rate Limit Reached\n\nThe AI service is temporarily at capacity. Please wait a moment and try again.';
  if (msg?.includes('API key') || msg?.includes('401'))
    return '## ⚠️ Authentication Error\n\nThere is an issue with the AI service configuration. Please contact support.';
  if (msg?.includes('fetch') || msg?.includes('network') || msg?.includes('ECONNREFUSED'))
    return '## ⚠️ Connection Error\n\nCannot reach the server. Please check your connection and try again.';
  return `## ⚠️ Something went wrong\n\n${msg || 'Unknown error'}\n\nPlease try again or check the server logs for details.`;
}
