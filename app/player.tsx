import Script from 'next/script';
import { versioned } from '@/lib/versioned';

// Spelarens namn. Det skrivs in först varje gång sajten öppnas, på första sidan innan
// spelväljaren (NameStep), och går inte att byta när det väl är valt; spelen frågar
// inte efter det utan läser det (Player). public/player.js sköter båda, och
// app/layout.tsx avgör innan sidan ritas om namnsteget ska visas eller om ett spel ska
// skicka tillbaka till första sidan.

// Namnsteget på första sidan: rutan där man skriver sitt namn, med det man skrev förut
// ifyllt. Det täcker spelväljaren tills man har gått vidare.
export function NameStep() {
  return (
    <div className="name-step" id="name-step">
      <form className="entry" id="player-form" autoComplete="off">
        <p className="entry-badge">Välkommen!</p>
        <h2 className="entry-title">Vad heter du?</h2>
        <label htmlFor="player-name">Ditt namn</label>
        <input id="player-name" name="name" maxLength={12} placeholder="Skriv ditt namn" enterKeyHint="go" />
        <p className="entry-error" id="player-error" hidden />
        <div className="entry-actions">
          <button type="submit" className="primary" id="player-save">Fortsätt</button>
        </div>
        <p className="entry-note" id="player-note">Namnet syns på topplistan och går inte att byta sen.</p>
      </form>
      <Script src={versioned('player.js')} strategy="afterInteractive" />
    </div>
  );
}

// I spelen: bara namnet, som topplistorna sparar under.
export function Player() {
  return <Script src={versioned('player.js')} strategy="afterInteractive" />;
}
