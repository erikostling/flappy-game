import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Climbing Game',
  description: 'Klättra uppför tegelväggen så högt du kan.',
};

// Adressen till spelet bär en hash av filen, så att ingen webbläsare kör en gammal version.
const GAME_VERSION = createHash('sha256')
  .update(readFileSync(join(process.cwd(), 'public', 'climbing.js')))
  .digest('hex')
  .slice(0, 12);

const DESCRIPTION = [
  'Climbing Game. Tryck eller tryck på mellanslag för att starta.',
  'Apan klättrar uppför en tegelvägg av sig själv.',
  'Tryck på vänster eller höger halva av skärmen, eller använd pil- eller A- och D-tangenterna, för att flytta mellan tre spår.',
  'Väj för blomkrukor och tegelstenar som faller; träffas apan faller den ner.',
  'Poängen är hur många meter du har klättrat.',
  'Under Figurer på startskärmen väljer du vem som klättrar, bland figurerna du har i Flappy Game.',
].join(' ');

// Hela spelet, startskärmen också, ritas på canvasen av public/climbing.js.
export default function ClimbingGame() {
  return (
    <main className={styles.game} id="climb-stage">
      <canvas id="climb" className={styles.canvas} tabIndex={0} aria-label={DESCRIPTION} />
      <a className={styles.back} href="/">← Spel</a>
      <div className={styles.safe} id="climb-safe" aria-hidden="true" />
      <Script src={`/climbing.js?v=${GAME_VERSION}`} strategy="afterInteractive" />
    </main>
  );
}
