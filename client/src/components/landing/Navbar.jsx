'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'AI Tools', href: '#showcase' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
          Note<span className="gradient-text">Nova</span>
        </span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
        {links.map(link => (
          <a
            key={link.label}
            href={link.href}
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeToggle />
        <Link href="/sign-in" className="hidden md:block" style={{
          color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
          padding: '8px 20px', borderRadius: 10,
        }}>
          Sign In
        </Link>
        <Link href="/sign-up" className="hidden md:block btn-primary" style={{
          fontSize: 14, padding: '10px 24px', textDecoration: 'none',
        }}>
          Get Started Free
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute', top: 72, left: 0, right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: 24,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}
        >
          {links.map(link => (
            <a key={link.label} href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}
            >{link.label}</a>
          ))}
          <Link href="/sign-in" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/sign-up" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>Get Started</Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
