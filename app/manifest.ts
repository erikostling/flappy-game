import type { MetadataRoute } from 'next';

// Så ser spelet ut när det läggs på hemskärmen: apan som ikon, och det öppnas i
// helskärm utan webbläsarens ramar. Ikonerna är ritade med spelets egen apa.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flappy Game',
    short_name: 'Flappy Game',
    description: 'Flyg genom tio världar, samla saker och blå mynt, och köp nya figurer.',
    lang: 'sv',
    start_url: '/',
    display: 'fullscreen',
    background_color: '#10291b',
    theme_color: '#10291b',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
