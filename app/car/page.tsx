import type { Metadata } from 'next';
import Script from 'next/script';
import { versioned } from '@/lib/versioned';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Car Game',
  description: 'Kör så långt du kan utan att krocka.',
};

const DESCRIPTION = [
  'Car Game. Tryck på Starta, mellanslag eller Enter för att börja.',
  'Apan kör en röd F1-bil uppför vägen av sig själv.',
  'Svep med fingret åt sidan så följer bilen med, eller håll på vänster eller höger halva av skärmen eller pil- eller A- och D-tangenterna för att styra.',
  'Kör om bilarna framför utan att krocka, och samla blå mynt på vägen; de köper figurer i Flappy Game.',
  'Poängen är hur långt du har kört, i meter. Efter en krock tar knappen Gå till startsidan dig tillbaka och Spela igen startar en ny runda.',
].join(' ');

// Hela spelet ritas på canvasen av public/car.js.
export default function CarGame() {
  return (
    <main className={styles.game} id="car-stage">
      <canvas id="car" className={styles.canvas} tabIndex={0} aria-label={DESCRIPTION} />
      <a className="back" href="/" id="car-back">← Spel</a>
      <div className={styles.safe} id="car-safe" aria-hidden="true" />
      <Script src={versioned('car.js')} strategy="afterInteractive" />
    </main>
  );
}
