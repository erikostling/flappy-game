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
  'Climbing Game. Tryck på Starta, mellanslag eller Enter för att börja.',
  'Figuren klättrar uppför en tegelvägg av sig själv.',
  'Håll på vänster eller höger halva av skärmen, eller håll inne pil- eller A- och D-tangenterna, för att flytta dig åt sidan.',
  'Samla mynt, bananer, paket, stjärnor och diamanter på väggen; de lyfter dig fler meter. Blå mynt köper figurer i Flappy Game.',
  'Ibland sitter en kraft på väggen i stället: en sköld som tar en träff, en magnet som drar sakerna till dig och slow motion som saktar ner det som faller.',
  'Väj för blomkrukor och tegelstenar som faller; träffas figuren faller den ner.',
  'Poängen är hur många meter du har klättrat. När du har fallit visas höjden och ditt rekord, och ett tryck tar dig tillbaka till startskärmen.',
  'Var 40:e meter klättrar du in i en ny av 43 världar, med en egen vägg och egna saker som faller, och varje ny värld ger 2 blå mynt.',
  'Kommer du in på topplistan skriver du ditt namn där.',
  '35, 70 och 120 meter i en runda ger brons-, silver- och guldmedalj; dina medaljer visas överst på startskärmen.',
  'Knapparna längst ner på startskärmen öppnar Figurer, Inställningar och Topplista; F och T fungerar också.',
  'Under Figurer väljer du vem som klättrar. Låsta figurer köper du där med blå mynt, till samma pris som i Flappy Game; priset står i hörnet. Figurerna och mynten är desamma i båda spelen.',
  'M och N stänger av och sätter på ljudeffekter och musik, i båda spelen.',
].join(' ');

// Hela spelet ritas på canvasen av public/climbing.js; sidan ger bara canvasen och
// rutan där man skriver sitt namn på topplistan.
export default function ClimbingGame() {
  return (
    <main className={styles.game} id="climb-stage">
      <canvas id="climb" className={styles.canvas} tabIndex={0} aria-label={DESCRIPTION} />
      <form className="entry" id="climb-entry" hidden autoComplete="off">
        <p className="entry-badge">Topp 10!</p>
        <h2 className="entry-title" id="climb-entry-title">Plats 1 med 10 m</h2>
        <label htmlFor="climb-entry-name">Ditt namn</label>
        <input id="climb-entry-name" name="name" maxLength={12} placeholder="Skriv ditt namn" enterKeyHint="done" />
        <p className="entry-error" id="climb-entry-error" hidden />
        <div className="entry-actions">
          <button type="submit" className="primary" id="climb-entry-save">Spara</button>
          <button type="button" className="secondary" id="climb-entry-skip">Hoppa över</button>
        </div>
      </form>
      <a className="back" href="/" id="climb-back">← Spel</a>
      <div className={styles.safe} id="climb-safe" aria-hidden="true" />
      <Script src={`/climbing.js?v=${GAME_VERSION}`} strategy="afterInteractive" />
    </main>
  );
}
