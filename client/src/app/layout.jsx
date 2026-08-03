import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

// Root layout is dynamic because ClerkProvider needs auth context
export const dynamic = 'force-dynamic';

// Load Inter via next/font for automatic optimization (no render-blocking @import)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata = {
  title: 'NoteNova AI — Smart Study Platform',
  description: 'AI-powered study platform to learn, practice, and ace your exams.',
  keywords: 'AI study notes, chatbot, study platform, note generator, exam preparation',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'NoteNova AI' },
};

export const viewport = {
  themeColor: '#6366F1',
  width: 'device-width',
  initialScale: 1,
};

// Fix #14: Inline script prevents flash of wrong theme before hydration
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('notenova-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
