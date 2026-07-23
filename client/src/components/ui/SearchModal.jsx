'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, MessageSquare, Brain, CalendarDays, X, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const typeConfig = {
  note: { icon: FileText, color: '#8B5CF6', label: 'Note' },
  chat: { icon: MessageSquare, color: '#06B6D4', label: 'Chat' },
  quiz: { icon: Brain, color: '#F59E0B', label: 'Quiz' },
  plan: { icon: CalendarDays, color: '#EC4899', label: 'Plan' },
};

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data.results || []);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (result) => {
    onClose();
    router.push(result.href);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '15vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 580,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Search input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <Search size={20} color="var(--text-muted)" />
            <input
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Search notes, chats, quizzes, plans..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 16, fontFamily: 'inherit',
              }}
            />
            <button
              onClick={onClose}
              style={{
                padding: '4px 8px', borderRadius: 6,
                background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px' }}>
            {loading ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />)}
              </div>
            ) : results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {results.map((result, idx) => {
                  const cfg = typeConfig[result.type] || typeConfig.note;
                  const Icon = cfg.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 10,
                        background: isSelected ? 'var(--bg-glass-hover)' : 'transparent',
                        border: isSelected ? '1px solid var(--border-glow)' : '1px solid transparent',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit', width: '100%',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${cfg.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={18} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {result.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {result.subtitle}
                        </p>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                        background: `${cfg.color}10`, color: cfg.color, flexShrink: 0,
                      }}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : query.length >= 2 ? (
              <div style={{
                padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)',
              }}>
                <Search size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>No results for &quot;{query}&quot;</p>
              </div>
            ) : (
              <div style={{
                padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)',
              }}>
                <p style={{ fontSize: 13 }}>Start typing to search across all your content...</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={12} /> Notes</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> Chats</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Brain size={12} /> Quizzes</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarDays size={12} /> Plans</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Command size={10} /> K to search
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
