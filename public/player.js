(() => {
  // Spelarens namn, gemensamt för alla spelen. Det kan aldrig bytas: servern låter varje
  // enhet ta ett enda namn (/api/player), och topplistorna sparar bara under det.
  //
  // På första sidan finns namnsteget (#player-form), som app/layout.tsx visar första
  // gången sajten öppnas i en flik. Har enheten redan ett namn står det ifyllt och går
  // inte att ändra; annars står det man skrev förut på den här enheten där. När man går
  // vidare kommer man till spelväljaren, och fliken minns att namnet är klart.
  //
  // I spelen finns ingen ruta. Där frågar spelen window.player: name() ger namnet, eller
  // null om det inte finns, och busy() är alltid falskt.

  const DONE = 'flappy-apa-namn-klart';
  function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function store(key, v) { try { localStorage.setItem(key, String(v)); } catch {} }
  const clean = text => (text || '').replace(/\s+/g, ' ').trim().slice(0, 12);

  // Samma slumpade nyckel som spelen skickar till topplistan.
  function deviceKey() {
    let key = load('flappy-apa-nyckel');
    if (!key) {
      key = window.crypto?.randomUUID?.() ?? Array.from({ length: 4 }, () => Math.random().toString(36).slice(2)).join('');
      store('flappy-apa-nyckel', key);
    }
    return key;
  }

  // Enhetens namn; med `wanted` tar den det namnet om enheten inte har något än.
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

  let name = null;
  window.player = { name: () => name, busy: () => false };

  const form = document.getElementById('player-form');
  if (!form) {
    // i ett spel: namnet som valdes på första sidan
    const saved = clean(load('flappy-apa-namn'));
    ask(saved).then(answer => { if (answer.name) name = answer.name; }).catch(() => {});
    return;
  }

  const input = document.getElementById('player-name');
  const error = document.getElementById('player-error');
  const note = document.getElementById('player-note');
  const save = document.getElementById('player-save');
  let mine = null; // namnet servern säger att enheten redan har

  function showError(text) { error.textContent = text; error.hidden = !text; }

  function done(chosen) {
    if (chosen) { name = chosen; store('flappy-apa-namn', chosen); }
    try { sessionStorage.setItem(DONE, '1'); } catch {}
    document.documentElement.classList.remove('ask-name');
  }

  input.value = clean(load('flappy-apa-namn'));
  if (document.documentElement.classList.contains('ask-name')) input.focus({ preventScroll: true });

  // Har enheten redan ett namn står det i rutan, och det går inte att byta.
  ask('').then(answer => {
    if (!answer.name) return;
    mine = name = answer.name;
    input.value = mine; input.readOnly = true;
    note.textContent = 'Det här är ditt namn på topplistan.';
    save.focus({ preventScroll: true });
  }).catch(() => {});

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (save.disabled) return;
    if (mine) { done(mine); return; }
    const wanted = clean(input.value);
    if (!wanted) { showError('Skriv ditt namn först.'); input.focus(); return; }
    save.disabled = true;
    try {
      const answer = await ask(wanted);
      if (answer.taken) { showError('Det namnet har någon annan. Välj ett annat.'); input.focus(); }
      else done(answer.name || wanted);
    } catch {
      // utan topplistan går det att spela ändå, men inget sparas förrän den svarar
      done(wanted);
    } finally {
      save.disabled = false;
    }
  });
})();
