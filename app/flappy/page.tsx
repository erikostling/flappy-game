import type { Metadata } from 'next';
import Script from 'next/script';
import { versioned } from '@/lib/versioned';
import { PlayerForm } from '../player-form';

// Hela spelet ritas på canvasen av public/game.js; sidan ger bara canvasen och
// rutan där man skriver sitt namn första gången.
const DESCRIPTION = [
  'Flappy Game. Tryck på Starta, mellanslag eller Enter för att börja.',
  'Klicka, tryck eller använd mellanslag för att flyga genom öppningarna mellan hindren.',
  'Första gången skriver du ditt namn; det går inte att byta sen. Kommer du in på topplistan sparas du där med det.',
  'Första gången väljer du en av tre startfigurer, en gång för alla.',
  'Andra figurer köper du med blå mynt under Figurer; priset står på varje låst figur, från 3 till 45 blå mynt, och hjältarna kostar 75. Bläddra mellan sidorna med pilarna längst ner eller med vänster- och högerpil.',
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
        <PlayerForm />
      </div>
      <a className="back" href="/" id="back">← Spel</a>
      <div className="safe" id="safe" aria-hidden="true" />
      <Script src={versioned('game.js')} strategy="afterInteractive" />
    </main>
  );
}
