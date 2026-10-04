import Script from 'next/script';
import { scriptUrl } from '@/lib/scripts';

// Rutan där man skriver sitt namn första gången man spelar, i båda spelen. Namnet går
// inte att byta sen, och topplistorna sparar under det; public/player.js sköter den.
export function PlayerForm() {
  return (
    <>
      <form className="entry" id="player" hidden autoComplete="off">
        <p className="entry-badge">Välkommen!</p>
        <h2 className="entry-title">Vad heter du?</h2>
        <label htmlFor="player-name">Ditt namn</label>
        <input id="player-name" name="name" maxLength={12} placeholder="Skriv ditt namn" enterKeyHint="go" />
        <p className="entry-error" id="player-error" hidden />
        <div className="entry-actions">
          <button type="submit" className="primary" id="player-save">Spela</button>
        </div>
        <p className="entry-note">Namnet syns på topplistan och går inte att byta sen.</p>
      </form>
      <Script src={scriptUrl('player.js')} strategy="afterInteractive" />
    </>
  );
}
