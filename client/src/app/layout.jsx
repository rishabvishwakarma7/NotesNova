import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

export const metadata = {
  title: 'NoteNova AI — Smart Study Platform',
  description: 'Chat with AI, generate study notes instantly, organize your studies, and prepare smarter with NoteNova AI.',
  keywords: 'AI study notes, chatbot, study platform, note generator, exam preparation',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
