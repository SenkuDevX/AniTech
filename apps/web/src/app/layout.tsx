import type { Metadata } from 'next';
import { Sora, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { AuthProvider } from '@/store/auth';

const CommandPalette = dynamic(() => import('@/components/layout/CommandPalette').then(m => m.CommandPalette), { ssr: false });

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AniTech OS',
  description: 'Open-Source Community Media Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${sora.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} font-body bg-background text-on-surface`}>
        <AuthProvider>
          {children}
          <CommandPalette />
        </AuthProvider>
      </body>
    </html>
  );
}
