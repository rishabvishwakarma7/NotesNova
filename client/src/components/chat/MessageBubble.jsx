'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, FileText, Sparkles, User, Brain, Layers, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('bash', bash);
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';

function ActionBtn({ onClick, icon: Icon, label, done, doneLabel, doneColor = '#10B981', disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
        borderRadius: 7, background: done ? `${doneColor}12` : 'transparent',
        border: `1px solid ${done ? doneColor : 'var(--border-color)'}`,
        color: done ? doneColor : 'var(--text-muted)',
        fontSize: 11, fontWeight: 500, cursor: disabled ? 'wait' : 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!done && !disabled) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
      onMouseLeave={e => { if (!done && !disabled) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}>
      <Icon size={11} />
      {done ? doneLabel : label}
    </button>
  );
}

export default function MessageBubble({ message, onFollowUp }) {
  const [copied,   setCopied]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const [quizzing, setQuizzing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = async () => {
    if (saving || saveDone) return;
    setSaving(true);
    try {
      const firstLine = message.content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 80) || 'AI Chat Note';
      const html = marked.parse(message.content, { breaks: true, gfm: true });
      await api.post('/notes', { title: firstLine, content: html, noteType: 'custom' });
      setSaveDone(true);
      setTimeout(() => setSaveDone(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleQuickAction = (action) => {
    if (!onFollowUp) return;
    const prompts = {
      simpler:  'Explain this in simpler terms, like explaining to a beginner.',
      example:  'Give me a real-world example to help understand this better.',
      quiz:     'Create 5 quiz questions based on this explanation to test my understanding.',
      flashcards: 'Create 10 flashcards (Q: / A: format) from this content.',
      practice: 'Give me a practice problem related to this topic.',
    };
    onFollowUp(prompts[action] || action);
  };

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
        style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ maxWidth: 440 }}>
          <div style={{ padding: '10px 16px', borderRadius: '16px 16px 4px 16px',
            background: 'var(--gradient-primary)', color: 'white', fontSize: 14, lineHeight: 1.55 }}>
            {message.content}
          </div>
        </div>
        <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={12} color="var(--text-muted)" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '100%' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'var(--gradient-ai)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        <Sparkles size={13} color="white" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Response bubble */}
        <div style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: 6 }}>
          <div className="markdown-body" style={{ fontSize: 14 }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                      customStyle={{ borderRadius: 10, fontSize: 12.5, margin: '10px 0' }} {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
              }}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Primary actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <ActionBtn onClick={handleCopy} icon={copied ? Check : Copy}
            label="Copy" done={copied} doneLabel="Copied!" doneColor="#10B981" />
          <ActionBtn onClick={handleSaveNote} icon={saveDone ? Check : FileText}
            label="Save to Notes" done={saveDone} doneLabel="Saved!" doneColor="#10B981" disabled={saving} />

          {/* Toggle more actions */}
          <button onClick={() => setShowActions(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px',
              borderRadius: 7, background: showActions ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: `1px solid ${showActions ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
              color: showActions ? 'var(--color-primary-light)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
            {showActions ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {showActions ? 'Less' : 'More'}
          </button>
        </div>

        {/* Extended learning actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', marginTop: 6 }}>
              <div style={{ padding: '10px 12px', borderRadius: 12,
                background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary-light)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  ✨ Continue Learning
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { key: 'simpler',    icon: Sparkles, label: 'Explain Simpler' },
                    { key: 'example',   icon: Sparkles, label: 'Real-World Example' },
                    { key: 'quiz',      icon: Brain,    label: 'Quiz Me' },
                    { key: 'flashcards',icon: Layers,   label: 'Flashcards' },
                    { key: 'practice',  icon: RotateCcw,label: 'Practice Problem' },
                  ].map(a => (
                    <button key={a.key} onClick={() => { handleQuickAction(a.key); setShowActions(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px',
                        borderRadius: 8, background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = 'var(--color-primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                      <a.icon size={11} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
