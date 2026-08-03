'use client';


export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, User, Bell, Shield, Trash2, Check, Loader2,
  Moon, Sun, Monitor, ChevronRight, LogOut,
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useTheme } from '@/context/ThemeContext';
import GlassCard from '@/components/ui/GlassCard';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';

function SettingRow({ icon: Icon, color, title, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, padding: '18px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={19} color={color} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
          {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
        background: value ? 'linear-gradient(135deg,#8B5CF6,#06B6D4)' : 'var(--bg-tertiary)',
        transition: 'background 0.3s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
        background: 'white', transition: 'left 0.3s',
        left: value ? 22 : 2, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { theme, toggleTheme } = useTheme();

  const { toast } = useToast();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('notenova-notifications') : null;
      return saved ? JSON.parse(saved) : { revisionReminders: true, quizResults: true, studyStreak: true, weeklyReport: false };
    } catch { return { revisionReminders: true, quizResults: true, studyStreak: true, weeklyReport: false }; }
  });

  const updateNotification = (key, value) => {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    try { localStorage.setItem('notenova-notifications', JSON.stringify(next)); } catch {}
    toast({ message: value ? 'Notification enabled' : 'Notification disabled', type: 'info' });
  };
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleDeleteData = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    try {
      await Promise.all([
        api.get('/notes').then(r => Promise.all((r.data||[]).map(n => api.delete(`/notes/${n._id}`)))),
        api.get('/quiz').then(r => Promise.all((r.data||[]).map(q => api.delete(`/quiz/${q._id}`)))),
        api.get('/planner').then(r => Promise.all((r.data||[]).map(p => api.delete(`/planner/${p._id}`)))),
        api.get('/revision').then(r => Promise.all((r.data||[]).map(t => api.delete(`/revision/${t._id}`)))),
      ]);
      setSaved(true);
      setDeleteConfirm(false);
      toast({ message: 'All data deleted', type: 'warning' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      toast({ message: 'Failed to delete some data', type: 'error' });
    }
    setDeleting(false);
  };

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User, color: '#8B5CF6', title: user?.fullName || 'Your Profile',
          desc: user?.primaryEmailAddress?.emailAddress || '',
          action: (
            <button onClick={() => openUserProfile()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              Edit Profile <ChevronRight size={14} />
            </button>
          ),
        },
        {
          icon: LogOut, color: '#F43F5E', title: 'Sign Out', desc: 'Sign out of your account',
          action: (
            <button onClick={() => signOut(() => window.location.href = '/')}
              style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.2)', cursor: 'pointer', fontSize: 13, color: '#F43F5E' }}>
              Sign Out
            </button>
          ),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun, color: '#F59E0B',
          title: 'Theme', desc: `Currently using ${theme} mode`,
          action: (
            <div style={{ display: 'flex', gap: 6 }}>
              {['light', 'dark'].map(t => (
                <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }}
                  style={{ padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                    background: theme === t ? 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.1))' : 'var(--bg-tertiary)',
                    color: theme === t ? '#A78BFA' : 'var(--text-muted)',
                    border: theme === t ? '1px solid rgba(139,92,246,0.3)' : '1px solid var(--border-color)' }}>
                  {t === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: Bell, color: '#06B6D4', title: 'Revision Reminders', desc: 'Remind when topics are due for revision', key: 'revisionReminders' },
        { icon: Bell, color: '#10B981', title: 'Quiz Results',       desc: 'Notify after quiz completion',           key: 'quizResults' },
        { icon: Bell, color: '#EC4899', title: 'Study Streak',       desc: 'Daily streak reminders',                 key: 'studyStreak' },
        { icon: Bell, color: '#F59E0B', title: 'Weekly Report',      desc: 'Weekly study summary email',             key: 'weeklyReport' },
      ].map(item => ({ ...item,
        action: <Toggle value={notifications[item.key]} onChange={v => updateNotification(item.key, v)} />
      })),
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          icon: Shield, color: '#06B6D4', title: 'Your Data', desc: 'All data stored securely in MongoDB Atlas',
          action: <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>🔒 Encrypted</span>,
        },
        {
          icon: Trash2, color: '#F43F5E', title: 'Delete All Data',
          desc: deleteConfirm ? 'This will permanently delete all your notes, quizzes, and plans.' : 'Delete all your study data',
          action: (
            <button onClick={handleDeleteData} disabled={deleting}
              style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: deleteConfirm ? '#F43F5E' : 'rgba(244,63,94,0.1)',
                color: deleteConfirm ? 'white' : '#F43F5E',
                display: 'flex', alignItems: 'center', gap: 6 }}>
              {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> :
               saved ? <Check size={14} /> : <Trash2 size={14} />}
              {deleting ? 'Deleting…' : saved ? 'Deleted!' : deleteConfirm ? 'Confirm Delete' : 'Delete Data'}
            </button>
          ),
        },
      ],
    },
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your account and preferences</p>
      </motion.div>

      {sections.map((section, si) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 4 }}>{section.title}</p>
          <GlassCard style={{ padding: '0 20px' }}>
            {section.items.map((item, ii) => (
              <SettingRow key={ii} icon={item.icon} color={item.color} title={item.title} desc={item.desc}>
                {item.action}
              </SettingRow>
            ))}
          </GlassCard>
        </motion.div>
      ))}

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        NoteNova AI v1.0.0 · <a href="https://github.com/rishabvishwakarma7/NotesNova" target="_blank" rel="noreferrer"
          style={{ color: '#8B5CF6' }}>GitHub</a>
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
