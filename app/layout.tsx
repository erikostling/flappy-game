import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Lilita_One, Nunito } from 'next/font/google';
import './globals.css';

// Sidorna och spelen läser typsnitten ur --font-display och --font-body
// (app/globals.css), som bygger på de här variablerna.
const display = Lilita_One({ weight: '400', subsets: ['latin'], variable: '--font-lilita' });
const body = Nunito({ weight: ['700', '800'], subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'Spel',
  description: 'Välj ett spel att spela.',
  // Lagt på hemskärmen öppnas sidan utan webbläsarens ramar.
  appleWebApp: { capable: true, title: 'Spel', statusBarStyle: 'black-translucent' },
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
