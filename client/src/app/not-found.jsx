export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: 16,
      padding: 24,
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 72, fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
        404
      </h1>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Page not found
      </p>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 360 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" style={{
        marginTop: 8, padding: '11px 28px', borderRadius: 12,
        background: 'var(--gradient-primary)', color: 'white',
        textDecoration: 'none', fontWeight: 700, fontSize: 15,
      }}>
        Go Home
      </Link>
    </div>
  );
}
