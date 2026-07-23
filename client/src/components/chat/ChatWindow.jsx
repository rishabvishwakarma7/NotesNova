'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, RotateCcw, Plus, Sparkles } from 'lucide-react';
import MessageBubble from '@/components/chat/MessageBubble';
import ModeSelector from '@/components/chat/ModeSelector';
import TypingIndicator from '@/components/chat/TypingIndicator';

export default function ChatWindow() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('study');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = await getToken();
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Stream failed';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
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
      const errorResponse = getErrorResponse(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: errorResponse }]);
    }

    setIsLoading(false);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      setInput(prev => prev + e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    const withoutLast = messages.slice(0, -1);
    setMessages(withoutLast);
    setInput(withoutLast[withoutLast.length - 1]?.content || '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 0px)', overflow: 'hidden',
    }}
      className="md:h-screen"
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>NoteNova AI</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gemini 2.0 Flash • {mode} mode</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ModeSelector mode={mode} onSelect={setMode} />
          <button onClick={handleNewChat} className="btn-secondary" style={{
            padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Plus size={14} /> New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
            color: 'var(--text-muted)',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.8,
            }}>
              <Sparkles size={36} color="white" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              How can I help you study?
            </h3>
            <p style={{ fontSize: 15, textAlign: 'center', maxWidth: 400 }}>
              Ask me anything — explain concepts, generate notes, solve problems, or help with exam prep.
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8,
              justifyContent: 'center', marginTop: 12,
            }}>
              {['Explain photosynthesis', 'Python sorting algorithms', 'Newton\'s laws summary', 'SQL vs NoSQL'].map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="glass glass-hover"
                  style={{
                    padding: '10px 18px', borderRadius: 50,
                    fontSize: 13, color: 'var(--text-secondary)',
                    cursor: 'pointer', background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} />
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        {messages.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <button onClick={handleRegenerate} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              background: 'none', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
            }}>
              <RotateCcw size={12} /> Regenerate
            </button>
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 12,
          padding: '12px 16px', borderRadius: 16,
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-color)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NoteNova anything..."
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 15, resize: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
              maxHeight: 120, overflow: 'auto',
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleVoice}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: isListening ? 'rgba(239,68,68,0.2)' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isListening ? '#EF4444' : 'var(--text-muted)',
            }}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: input.trim() ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <Send size={18} color={input.trim() ? 'white' : 'var(--text-muted)'} />
          </button>
        </div>
        <p style={{
          textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
          marginTop: 8,
        }}>
          NoteNova AI can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  );
}

function getErrorResponse(errorMessage) {
  if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
    return `## ⚠️ OpenAI API Quota Exceeded\n\nYour OpenAI API key has **run out of credits**.\n\n### How to fix:\n1. Go to [OpenAI Billing](https://platform.openai.com/settings/organization/billing/overview)\n2. Add a payment method and purchase credits\n3. Or replace the API key in your \`.env\` file with a funded key\n\nOnce you have credits, your chat will work immediately!`;
  }
  if (errorMessage.includes('Invalid') || errorMessage.includes('API key')) {
    return `## ⚠️ Invalid OpenAI API Key\n\nYour API key is not valid.\n\n### How to fix:\n1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)\n2. Create a new secret key\n3. Update \`OPENAI_API_KEY\` in your server \`.env\` file\n4. Restart the server`;
  }
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return `## ⚠️ Cannot Connect to Backend\n\nThe Express server is not reachable.\n\n### How to fix:\n1. Make sure the server is running: \`npm run dev\` in the server directory\n2. Check that it's running on port 5000\n3. Try refreshing the page`;
  }
  return `## ⚠️ Something went wrong\n\n${errorMessage}\n\nPlease try again or check the server logs for details.`;
}
