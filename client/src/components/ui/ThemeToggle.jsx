'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110"
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
      }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Moon size={18} style={{ color: '#A78BFA' }} />
        ) : (
          <Sun size={18} style={{ color: '#F59E0B' }} />
        )}
      </motion.div>
    </button>
  );
}
