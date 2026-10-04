import type { Metadata } from 'next';
import Script from 'next/script';
import { versioned } from '@/lib/versioned';
import { PlayerForm } from '../player-form';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Climbing Game',
  description: 'Klättra uppför tegelväggen så högt du kan.',
};

const DESCRIPTION = [
  'Climbing Game. Tryck på Starta, mellanslag eller Enter för att börja.',
  'Figuren klättrar uppför en tegelvägg av sig själv.',
  'Svep med fingret åt sidan så följer figuren med, eller håll på vänster eller höger halva av skärmen eller pil- eller A- och D-tangenterna för att glida åt sidan.',
  'Samla mynt, bananer, paket, stjärnor och diamanter på väggen; de ger dig fler meter. Blå mynt köper figurer.',
  'Ibland sitter en kraft på väggen i stället: en sköld som tar en träff, en magnet som drar sakerna till dig och slow motion som saktar ner det som faller.',
  'Väj för blomkrukor och tegelstenar som faller; träffas figuren faller den ner.',
  'Poängen är hur många meter du har klättrat. När du har fallit visas hur högt du kom och ditt rekord, knappen Gå till startsidan tar dig tillbaka och Spela igen startar en ny runda.',
  'Var 40:e meter klättrar du in i en ny av 43 världar, med en egen vägg och egna saker som faller, och varje ny värld ger 2 blå mynt.',
  'Första gången skriver du ditt namn; det går inte att byta sen. Kommer du in på topplistan sparas du där med det.',
  '35, 70 och 120 meter i en runda ger brons-, silver- och guldmedalj; dina medaljer visas överst på startskärmen.',
  'Knapparna längst ner på startskärmen öppnar Figurer, Inställningar och Topplista; F och T fungerar också.',
  'Under Figurer väljer du vem som klättrar. Låsta figurer köper du där med blå mynt, till samma pris som i Flappy Game; priset står i hörnet. Figurerna och mynten är desamma i båda spelen.',
  'M och N stänger av och sätter på ljudeffekter och musik, i båda spelen.',
].join(' ');

// Hela spelet ritas på canvasen av public/climbing.js; sidan ger bara canvasen och
// rutan där man skriver sitt namn första gången.
export default function ClimbingGame() {
  return (
    <main className={styles.game} id="climb-stage">
      <canvas id="climb" className={styles.canvas} tabIndex={0} aria-label={DESCRIPTION} />
      <PlayerForm />
      <a className="back" href="/" id="climb-back">← Spel</a>
      <div className={styles.safe} id="climb-safe" aria-hidden="true" />
      <Script src={versioned('climbing.js')} strategy="afterInteractive" />
    </main>
  );
}
