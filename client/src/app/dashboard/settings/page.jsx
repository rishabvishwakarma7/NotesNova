'use client';

import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Palette, Key, Bell } from 'lucide-react';
import { UserProfile } from '@clerk/nextjs';
import GlassCard from '@/components/ui/GlassCard';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { theme } = useTheme();

  return (
    <div style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
      </motion.div>

      {/* Theme */}
      <GlassCard style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(139,92,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Palette size={22} color="#8B5CF6" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Appearance</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Currently using {theme} mode
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </GlassCard>

      {/* API Key */}
      <GlassCard style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(6,182,212,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Key size={22} color="#06B6D4" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>API Configuration</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Backend server URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Clerk Profile */}
      <GlassCard style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(236,72,153,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={22} color="#EC4899" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Account</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage your profile and security</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
