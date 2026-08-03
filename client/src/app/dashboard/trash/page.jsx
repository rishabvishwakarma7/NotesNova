'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, FileText, MessageSquare, Brain, Loader2, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

const TYPE_CONFIG = {
  note: { icon: FileText,      color: '#6366F1', label: 'Note' },
  chat: { icon: MessageSquare, color: '#8B5CF6', label: 'Chat' },
  quiz: { icon: Brain,         color: '#F59E0B', label: 'Quiz' },
};

export default function TrashPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/trash'); setItems(r.data.items || []); }
    catch { toast({ message: 'Failed to load trash', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const restore = async (type, id) => {
    setWorking(id);
    try {
      await api.post(`/trash/${type}/${id}/restore`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ message: 'Item restored!', type: 'success' });
    } catch { toast({ message: 'Failed to restore', type: 'error' }); }
    setWorking(null);
  };

  const deletePermanent = async (type, id) => {
    setWorking(id);
    try {
      await api.delete(`/trash/${type}/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ message: 'Permanently deleted', type: 'info' });
    } catch { toast({ message: 'Failed to delete', type: 'error' }); }
    setWorking(null);
  };

  const emptyTrash = async () => {
    if (!confirmEmpty) { setConfirmEmpty(true); return; }
    setWorking('all');
    try {
      await api.delete('/trash/empty/all');
      setItems([]);
      toast({ message: 'Trash emptied', type: 'success' });
    } catch { toast({ message: 'Failed to empty trash', type: 'error' }); }
    setWorking(null);
    setConfirmEmpty(false);
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trash2 size={22} color="var(--text-muted)" /> Trash
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Items here are soft-deleted. Restore or permanently delete them.
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={emptyTrash} disabled={working === 'all'}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7,
              background: confirmEmpty ? '#F43F5E' : 'rgba(244,63,94,0.1)',
              color: confirmEmpty ? 'white' : '#F43F5E', transition: 'all 0.2s' }}>
            {working === 'all' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
            {confirmEmpty ? 'Confirm Empty Trash' : 'Empty Trash'}
          </button>
        )}
      </motion.div>

      {confirmEmpty && (
        <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16,
          background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="#F43F5E" />
          <p style={{ fontSize: 13, color: '#F43F5E' }}>
            This will permanently delete all {items.length} items. This cannot be undone.
          </p>
          <button onClick={() => setConfirmEmpty(false)}
            style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', background: 'none',
              border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loader2 size={28} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 32px' }}>
          <Trash2 size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Trash is Empty</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Deleted notes, chats, and quizzes will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.note;
            const Icon = cfg.icon;
            const daysAgo = Math.floor((Date.now() - new Date(item.deletedAt)) / (1000 * 60 * 60 * 24));
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: '14px 18px', borderRadius: 14, background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)', display: 'flex',
                  alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cfg.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    <span style={{ color: cfg.color, fontWeight: 600, marginRight: 6 }}>{cfg.label}</span>
                    {item.meta && `${item.meta} · `}
                    Deleted {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => restore(item.type, item.id)} disabled={!!working}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      borderRadius: 9, border: '1px solid rgba(99,102,241,0.25)',
                      background: 'rgba(99,102,241,0.08)', color: '#6366F1',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {working === item.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={13} />}
                    Restore
                  </button>
                  <button onClick={() => deletePermanent(item.type, item.id)} disabled={!!working}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px',
                      borderRadius: 9, border: '1px solid rgba(244,63,94,0.2)',
                      background: 'rgba(244,63,94,0.08)', color: '#F43F5E',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
