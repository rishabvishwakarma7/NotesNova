'use client';

import { motion } from 'framer-motion';
import { Copy, Check, FileText, User, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MessageBubble({ message, index }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: 12,
      }}
    >
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 4,
        }}>
          <Sparkles size={16} color="white" />
        </div>
      )}

      <div style={{ maxWidth: isUser ? '75%' : '85%' }}>
        <div className={isUser ? 'msg-user' : 'msg-ai'}>
          {isUser ? (
            <p style={{ lineHeight: 1.6, fontSize: 15 }}>{message.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          borderRadius: 12, fontSize: 13,
                          margin: '12px 0',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && message.content && (
          <div style={{
            display: 'flex', gap: 6, marginTop: 8, paddingLeft: 4,
          }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6,
                background: 'none', border: '1px solid var(--border-color)',
                color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
              }}
            >
              {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6,
                background: 'none', border: '1px solid var(--border-color)',
                color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
              }}
            >
              <FileText size={12} /> Save as Note
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 4,
        }}>
          <User size={16} color="var(--text-muted)" />
        </div>
      )}
    </motion.div>
  );
}
