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

// Namnet skrivs in först varje gång sajten öppnas i en flik (app/player.tsx). Tills
// det är gjort visar första sidan namnsteget (klassen ask-name), och ett spel skickar
// tillbaka dit. Det körs innan sidan ritas, så att varken spelväljaren eller spelet
// hinner synas först; utan sessionStorage frågar ingen.
const NAME_FIRST = `try {
  if (sessionStorage.getItem('flappy-apa-namn-klart') !== '1') {
    if (location.pathname === '/') document.documentElement.classList.add('ask-name');
    else location.replace('/');
  }
} catch (e) {}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // skriptet ovan lägger till en klass innan React tar över
    <html lang="sv" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NAME_FIRST }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
