import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

// Adressen till spelet bär en hash av filen, räknad när sidan byggs. Ändras spelet
// ändras adressen, så att ingen webbläsare kör en gammal version ur sin cache.
const GAME_VERSION = createHash('sha256')
  .update(readFileSync(join(process.cwd(), 'public', 'game.js')))
  .digest('hex')
  .slice(0, 12);

// Hela spelet ritas på canvasen av public/game.js; sidan ger bara canvasen och
// rutan där man skriver sitt namn på topplistan.
const DESCRIPTION = [
  'Flappy Game. Tryck på Starta, mellanslag eller Enter för att börja.',
  'Klicka, tryck eller använd mellanslag för att flyga genom öppningarna mellan hindren.',
  'Första gången väljer du en av tre startfigurer, en gång för alla.',
  'Andra figurer köper du med blå mynt under Figurer; priset står på varje låst figur, från 3 till 55 blå mynt. Bläddra mellan sidorna med pilarna längst ner eller med vänster- och högerpil.',
  'Mellan hindren kan du plocka upp en sköld som tar en krock, en magnet som drar till sig saker och slow motion.',
  'Var 20:e poäng flyger du vidare till nästa av tio världar, med egen bakgrund, egna hinder och egen musik, och varje ny värld ger 2 blå mynt.',
  'Från den sjätte världen blir öppningarna smalare och från den åttonde rör sig hindren.',
  '10, 25 och 50 poäng i en omgång ger brons-, silver- och guldmedalj; dina medaljer visas överst i mitten av startskärmen.',
  'Knappen Spel uppe till vänster tar dig tillbaka till spelväljaren.',
  'Knapparna längst ner på startskärmen öppnar Figurer, Inställningar och Topplista; F och T fungerar också.',
  'Uppe till höger visas din figur och den högsta nivå du har nått.',
  'M och N stänger av och sätter på ljudeffekter och musik.',
].join(' ');

export const metadata: Metadata = {
  title: 'Flappy Game',
  description: 'Flyg genom tio världar, samla saker och blå mynt, och köp nya figurer.',
};

export default function FlappyGame() {
  return (
    <main className="stage" id="stage">
      <div className="screen" id="screen">
        <canvas id="game" tabIndex={0} aria-label={DESCRIPTION} />
        <form className="entry" id="entry" hidden autoComplete="off">
          <p className="entry-badge">Topp 10!</p>
          <h2 className="entry-title" id="entry-title">Plats 1 med 10 poäng</h2>
          <label htmlFor="entry-name">Ditt namn</label>
          <input id="entry-name" name="name" maxLength={12} placeholder="Skriv ditt namn" enterKeyHint="done" />
          <p className="entry-error" id="entry-error" hidden />
          <div className="entry-actions">
            <button type="submit" className="primary" id="entry-save">Spara</button>
            <button type="button" className="secondary" id="entry-skip">Hoppa över</button>
          </div>
        </form>
      </div>
      <a className="back" href="/" id="back">← Spel</a>
      <div className="safe" id="safe" aria-hidden="true" />
      <Script src={`/game.js?v=${GAME_VERSION}`} strategy="afterInteractive" />
    </main>
  );
}
