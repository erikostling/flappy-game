import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Lilita_One, Nunito } from 'next/font/google';
import './globals.css';

// Spelet läser typsnitten ur --font-display och --font-body (app/globals.css),
// som bygger på de här variablerna.
const display = Lilita_One({ weight: '400', subsets: ['latin'], variable: '--font-lilita' });
const body = Nunito({ weight: ['700', '800'], subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'Flappy Game',
  description: 'Flyg genom tio världar, samla saker och blå mynt, och köp nya figurer.',
  // Lagt på hemskärmen öppnas spelet utan webbläsarens ramar.
  appleWebApp: { capable: true, title: 'Flappy Game', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#10291b',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
