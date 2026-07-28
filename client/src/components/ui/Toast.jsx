'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: { icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  error:   { icon: XCircle,      color: '#F43F5E', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.25)' },
  warning: { icon: AlertCircle,  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  info:    { icon: Info,         color: '#6366F1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container */}
      {/* Toast container — above mobile nav */}
      <div style={{ position: 'fixed', bottom: 'calc(60px + 16px)', right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}
        className="toast-wrapper">
        <style>{`@media(min-width:769px){.toast-wrapper{bottom:16px!important;right:20px!important;}}`}</style>
        <AnimatePresence>
          {toasts.map(t => {
            const cfg = ICONS[t.type] || ICONS.info;
            const Icon = cfg.icon;
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 12,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(12px)', maxWidth: 320, minWidth: 220 }}>
                <Icon size={16} color={cfg.color} style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 500, lineHeight: 1.4 }}>{t.message}</p>
                <button onClick={() => dismiss(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 2, flexShrink: 0, display: 'flex' }}>
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
