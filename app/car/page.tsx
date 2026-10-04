import type { Metadata } from 'next';
import Script from 'next/script';
import { versioned } from '@/lib/versioned';
import { PlayerForm } from '../player-form';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Car Game',
  description: 'Kör ett varv på racerbanan så fort du kan.',
};

const DESCRIPTION = [
  'Car Game. Tryck på Starta, mellanslag eller Enter för att börja.',
  'Du kör en röd F1-bil ett varv runt en racerbana, med din figur vid ratten.',
  'Svep med fingret åt sidan så följer bilen med, eller håll på vänster eller höger halva av skärmen eller pil- eller A- och D-tangenterna för att styra.',
  'Håll dig på banan: på gräset går det långsammare, och i kurvorna drar bilen utåt. Kartan uppe till höger visar var på banan du är.',
  'Poängen är tiden för varvet; ju snabbare desto bättre. Blå mynt på banan köper figurer.',
  'Knapparna längst ner på startskärmen öppnar Figurer, Inställningar och Topplista.',
].join(' ');

// Hela spelet ritas på canvasen av public/runner.js, samma som Climbing Game; sidan ger
// bara canvasen och rutan där man skriver sitt namn första gången.
export default function CarGame() {
  return (
    <main className={styles.game} id="runner-stage" data-game="car">
      <canvas id="runner" className={styles.canvas} tabIndex={0} aria-label={DESCRIPTION} />
      <PlayerForm />
      <a className="back" href="/" id="runner-back">← Spel</a>
      <div className={styles.safe} id="runner-safe" aria-hidden="true" />
      <Script src={versioned('runner.js')} strategy="afterInteractive" />
    </main>
  );
}
