(() => {
  // Spelarens namn, gemensamt för båda spelen. Det väljs första gången och kan aldrig
  // bytas: servern låter varje enhet ta ett enda namn (/api/player), och topplistorna
  // sparar bara under det.
  //
  // Sidan har rutan #player, som visas tills namnet är valt. Spelen frågar
  // window.player: name() ger namnet, eller null innan det finns, och busy() är sant
  // medan rutan är öppen, så att ett tryck eller en tangent då inte startar spelet.

  const form = document.getElementById('player');
  const input = document.getElementById('player-name');
  const error = document.getElementById('player-error');
  const save = document.getElementById('player-save');
  if (!form) return;

  function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function store(key, v) { try { localStorage.setItem(key, String(v)); } catch {} }

  // Samma slumpade nyckel som spelen skickar till topplistan.
  function deviceKey() {
    let key = load('flappy-apa-nyckel');
    if (!key) {
      key = window.crypto?.randomUUID?.() ?? Array.from({ length: 4 }, () => Math.random().toString(36).slice(2)).join('');
      store('flappy-apa-nyckel', key);
    }
    return key;
  }

  let name = null;

  async function ask(wanted) {
    const res = await fetch('/api/player', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'x-player-key': deviceKey(), 'content-type': 'application/json' },
      body: JSON.stringify({ name: wanted }),
    });
    if (res.status === 409) return { taken: true };
    if (!res.ok) throw new Error('Namnet svarade ' + res.status);
    return res.json();
  }

  function accept(chosen) {
    name = chosen;
    store('flappy-apa-namn', chosen);
    form.hidden = true;
  }

  function showError(text) { error.textContent = text; error.hidden = !text; }

  function open(message = '') {
    showError(message);
    input.value = '';
    save.disabled = false;
    form.hidden = false;
    input.focus({ preventScroll: true });
  }

  // Den som redan har skrivit ett namn här får det, om ingen annan har det.
  (async () => {
    const saved = (load('flappy-apa-namn') || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    try {
      const answer = await ask(saved);
      if (answer.taken) open(`${saved} är någon annans namn. Välj ett eget.`);
      else if (answer.name) accept(answer.name);
      else open();
    } catch {
      // Utan topplistan går det att spela ändå, men inget sparas.
    }
  })();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (save.disabled) return;
    const wanted = input.value.replace(/\s+/g, ' ').trim().slice(0, 12);
    if (!wanted) { showError('Skriv ditt namn först.'); input.focus(); return; }
    save.disabled = true;
    try {
      const answer = await ask(wanted);
      if (answer.taken) { showError('Det namnet har någon annan. Välj ett annat.'); input.focus(); }
      else if (answer.name) accept(answer.name);
      else showError('Skriv ditt namn först.');
    } catch {
      showError('Det gick inte att spara. Försök igen.');
    } finally {
      save.disabled = false;
    }
  });

  window.player = { name: () => name, busy: () => !form.hidden };
})();
