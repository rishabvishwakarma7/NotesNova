'use client';
/**
 * SubjectSelector — searchable dropdown for choosing an existing subject
 * or typing a new one. Fetches subjects from /api/folders + /api/notes on mount.
 *
 * Props:
 *  value        string        current value
 *  onChange     fn(string)    called when value changes
 *  placeholder  string        input placeholder
 *  style        object        extra styles on the wrapper
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChevronDown, Search, FolderOpen, X, Plus } from 'lucide-react';

const COLORS = [
  '#8B5CF6','#06B6D4','#10B981','#EC4899',
  '#F59E0B','#F43F5E','#6366F1','#14B8A6','#FF6B35','#3B82F6',
];

export default function SubjectSelector({ value = '', onChange, placeholder = 'Select or type a subject…', style = {} }) {
  const { getToken } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Load subjects once
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const [fr, nr] = await Promise.all([
          fetch(`${base}/folders`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${base}/notes`,   { headers }).then(r => r.ok ? r.json() : []),
        ]);
        const map = {};
        (Array.isArray(nr) ? nr : []).forEach(n => {
          const s = n.subject?.trim();
          if (s) map[s] = { name: s, color: COLORS[Object.keys(map).length % COLORS.length] };
        });
        (Array.isArray(fr) ? fr : []).forEach(f => {
          map[f.folderName] = { name: f.folderName, color: f.color || '#8B5CF6' };
        });
        setSubjects(Object.values(map).sort((a, b) => a.name.localeCompare(b.name)));
      } catch {}
    })();
  }, [getToken]);

  // Sync query when value changes externally
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = subjects.filter(s =>
    !query || s.name.toLowerCase().includes(query.toLowerCase())
  );
  const showCreate = query.trim() && !subjects.some(s => s.name.toLowerCase() === query.toLowerCase());

  const select = (name) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', ...style }}>
      {/* Trigger / Input */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '13px 14px', borderRadius: 12,
          background: 'var(--bg-tertiary)', border: `1px solid ${open ? 'var(--border-glow)' : 'var(--border-color)'}`,
          cursor: 'text', transition: 'border-color 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        }}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <FolderOpen size={15} color={value ? '#8B5CF6' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
            minWidth: 0,
          }}
        />
        {query && (
          <button onClick={clear}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
            <X size={13} />
          </button>
        )}
        <ChevronDown size={14} color="var(--text-muted)"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 12, padding: 6, zIndex: 100,
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)', maxHeight: 240, overflowY: 'auto',
        }}>
          {filtered.length === 0 && !showCreate && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 8px' }}>
              No subjects found
            </p>
          )}

          {filtered.map(s => (
            <button key={s.name} onClick={() => select(s.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 9, border: 'none',
                background: value === s.name ? `${s.color}15` : 'transparent',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = value === s.name ? `${s.color}20` : 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = value === s.name ? `${s.color}15` : 'transparent'}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FolderOpen size={13} color={s.color} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</span>
              {value === s.name && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: s.color, fontWeight: 700 }}>✓</span>
              )}
            </button>
          ))}

          {showCreate && (
            <button onClick={() => select(query.trim())}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 9, border: 'none',
                background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left',
                borderTop: filtered.length > 0 ? '1px solid var(--border-color)' : 'none',
                marginTop: filtered.length > 0 ? 4 : 0, paddingTop: filtered.length > 0 ? 10 : 9,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={13} color="#8B5CF6" />
              </div>
              <span style={{ fontSize: 13, color: '#8B5CF6', fontWeight: 600 }}>
                Use "<strong>{query.trim()}</strong>" as new subject
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
