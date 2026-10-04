(() => {
  // Car Game: en bil kör uppför vägen av sig själv, och man styr den åt sidorna för att
  // köra om bilarna framför utan att krocka. Poängen är hur långt man har kört, i meter.

  // Spelet mäts i W×H och skalas så att det får plats, mitt på skärmen, som Climbing
  // Game. VX0–VX1 och VY0–VY1 är det som syns; UI_T och UI_B är skärmens kanter
  // innanför notch och hemknapp, som läses från #car-safe.
  const W = 400, H = 600;
  const ROAD_L = 60, ROAD_R = 340;
  const CAR_W = 40, CAR_H = 72, PLAYER_Y = 470;
  const MIN_X = ROAD_L + CAR_W / 2 + 6, MAX_X = ROAD_R - CAR_W / 2 - 6;
  const METER = 40, STEER = 300, NUDGE = 10;

  const C = {
    ink: '#1d2b1f', white: '#ffffff', banana: '#ffd23f', panel: '#fff7e0', panelRow: '#f3e6c2', dirt: '#8a5a2b',
    blue: '#36b3ec', blueEdge: '#16679a',
    grass: '#5cb83a', grassDark: '#47992a', road: '#5a5f66', roadDark: '#4a4f56', line: '#f4f1e0',
    fur: '#8a5a2b', furDark: '#6b4220', face: '#f1d0a5',
  };
  const CAR_COLORS = ['#2f80ed', '#2bb673', '#ff9f1c', '#9b6dff', '#ff5e9a', '#f4f1e0', '#36b3ec'];

  const css = getComputedStyle(document.documentElement);
  const DISPLAY = css.getPropertyValue('--font-display').trim() || 'sans-serif';
  const BODY = css.getPropertyValue('--font-body').trim() || 'sans-serif';

  const stage = document.getElementById('car-stage');
  const canvas = document.getElementById('car');
  const ctx = canvas.getContext('2d');
  const safe = document.getElementById('car-safe');

  let VX0 = 0, VX1 = W, VY0 = 0, VY1 = H, VW = W, VH = H;
  let UI_T = 0, UI_B = H, scale = 1, offX = 0, offY = 0;
  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const cw = Math.max(1, Math.floor(stage.clientWidth)), ch = Math.max(1, Math.floor(stage.clientHeight));
    const s = Math.max(0.2, Math.min(cw / W, ch / H));
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    const ox = (cw - W * s) / 2, oy = (ch - H * s) / 2;
    scale = s; offX = ox; offY = oy;
    ctx.setTransform(s * dpr, 0, 0, s * dpr, ox * dpr, oy * dpr);
    VX0 = -ox / s; VX1 = W + ox / s; VY0 = -oy / s; VY1 = H + oy / s;
    VW = VX1 - VX0; VH = VY1 - VY0;
    const inset = safe ? getComputedStyle(safe) : null;
    const edge = side => (inset ? parseFloat(inset[side]) || 0 : 0) / s;
    UI_T = VY0 + edge('paddingTop'); UI_B = VY1 - edge('paddingBottom');
  }
  new ResizeObserver(fit).observe(stage);
  fit();

  function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function store(key, v) { try { localStorage.setItem(key, String(v)); } catch {} }

  // ---------- Ljud ----------

  // Ljuden och musiken är Flappy Games, och inställningarna är gemensamma för spelen.
  const sfxOn = () => load('flappy-apa-ljud') !== 'av';
  const musicOn = () => load('flappy-apa-musik') !== 'av';
  const sounds = {};
  function play(name, volume = 0.6, rate = 1) {
    if (!sfxOn()) return;
    try {
      const a = (sounds[name] ??= new Audio(`/ljud/${name}.mp3`));
      a.volume = volume; a.playbackRate = rate; a.preservesPitch = false; a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }

  // Musiken går runt utan uppehåll och startar vid första trycket, som i Climbing Game.
  let ac = null, song = null, songBuf = null, songAsked = false;
  function startMusic() {
    if (!musicOn() || song || document.hidden) return;
    try { ac ??= new AudioContext(); } catch { return; }
    ac.resume().catch(() => {});
    if (!songBuf) {
      if (!songAsked) {
        songAsked = true;
        fetch('/musik/strand.mp3')
          .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
          .then(data => ac.decodeAudioData(data))
          .then(buf => { songBuf = buf; startMusic(); })
          .catch(() => {});
      }
      return;
    }
    const d = songBuf.getChannelData(0);
    let a = 0, b = d.length - 1;
    while (a < b && Math.abs(d[a]) < 0.02) a++;
    while (b > a && Math.abs(d[b]) < 0.02) b--;
    const src = ac.createBufferSource(), gain = ac.createGain(), t = ac.currentTime;
    src.buffer = songBuf; src.loop = true;
    src.loopStart = a / songBuf.sampleRate; src.loopEnd = (b + 1) / songBuf.sampleRate;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.8);
    src.connect(gain); gain.connect(ac.destination);
    src.start(t, src.loopStart);
    song = { src, gain };
  }
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden) ac.suspend().catch(() => {});
    else ac.resume().catch(() => {});
  });

  // ---------- Spelet ----------

  // ready (startskärmen) → playing → crashed (bilen snurrar) → over: rutan med hur
  // långt man körde, och knapparna Gå till startsidan och Spela igen.
  let state = 'ready';
  let time = 0, overAt = 0, driven = 0, nextCarAt = 0, nextCoinAt = 0, nextMilestone = 100;
  let playerX = W / 2, spin = 0, spinV = 0;
  let cars = [], coins = [], popups = [], startedAt = 0, coinsTaken = 0;
  let best = Math.max(0, Math.floor(Number(load('car-best')) || 0)), newBest = false;

  const meters = () => Math.floor(driven / METER);
  // Fortare ju längre man kör: från 6,5 till 15 meter i sekunden.
  const speed = () => 260 + Math.min(340, driven / 30);
  // Tätare mellan bilarna ju längre man kör.
  const carGap = () => Math.max(150, 330 - driven / 60);
  const clampX = x => Math.max(MIN_X, Math.min(MAX_X, x));

  function reset() {
    state = 'playing'; driven = 0; nextCarAt = 300; nextCoinAt = 500; nextMilestone = 100;
    playerX = W / 2; spin = 0; spinV = 0;
    cars = []; coins = []; popups = []; startedAt = time; coinsTaken = 0; newBest = false;
    holds.clear(); drags.clear(); swipeTarget = null;
  }

  // En bil framför, som kör åt samma håll men långsammare, så att man kommer ikapp den.
  // Den hamnar inte där en annan bil just har kommit in, och aldrig så att vägen stängs.
  function spawnCar() {
    const truck = Math.random() < 0.2, len = truck ? 104 : CAR_H;
    for (let tries = 0; tries < 8; tries++) {
      const x = ROAD_L + 30 + Math.random() * (ROAD_R - ROAD_L - 60);
      const near = cars.filter(c => c.y < VY0 + 160);
      if (near.some(c => Math.abs(c.x - x) < CAR_W + 16)) continue;
      // lämna alltid en lucka att köra igenom
      const xs = [ROAD_L, ...near.map(c => c.x), x, ROAD_R].sort((a, b) => a - b);
      if (!xs.some((v, i) => i && v - xs[i - 1] > CAR_W * 2 + 20)) continue;
      cars.push({ x, y: VY0 - len, len, truck, color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)], slow: 0.3 + Math.random() * 0.25 });
      return;
    }
  }

  function spawnCoin() {
    coins.push({ x: ROAD_L + 30 + Math.random() * (ROAD_R - ROAD_L - 60), y: VY0 - 20, phase: Math.random() * 6 });
  }

  // Ett blått mynt går till kassan som de andra spelen delar, och köper figurer där.
  function collect(coin) {
    coin.taken = true;
    coinsTaken++;
    store('flappy-apa-blamynt', Math.max(0, Math.floor(Number(load('flappy-apa-blamynt')) || 0)) + 1);
    popups.push({ text: '+1 blått mynt', at: time, x: coin.x, y: PLAYER_Y - 60, color: C.blue, size: 16 });
    play('collect', 0.6, 1.3);
  }

  function crash() {
    state = 'crashed'; spinV = (Math.random() < 0.5 ? -1 : 1) * 9;
    play('crash', 0.8);
    if (meters() > best) { best = meters(); newBest = true; store('car-best', best); }
  }

  function update(dt) {
    time += dt;
    if (state === 'playing') {
      const v = speed();
      driven += v * dt;
      playerX = clampX(playerX + steering() * STEER * dt);
      if (swipeTarget !== null) {
        playerX += (swipeTarget - playerX) * Math.min(1, dt * SWIPE_EASE);
        if (!drags.size && Math.abs(swipeTarget - playerX) < 0.5) swipeTarget = null;
      }
      if (driven >= nextCarAt) { spawnCar(); nextCarAt = driven + carGap() * (0.7 + Math.random() * 0.6); }
      if (driven >= nextCoinAt) { if (Math.random() < 0.6) spawnCoin(); nextCoinAt = driven + 400 + Math.random() * 400; }
      for (const c of cars) {
        c.y += v * (1 - c.slow) * dt;
        // bilarna är lite mindre än de ser ut, så att en nära passage går bra
        if (Math.abs(c.x - playerX) < CAR_W - 8 && Math.abs(c.y - PLAYER_Y) < (c.len + CAR_H) / 2 - 10) { crash(); break; }
      }
      cars = cars.filter(c => c.y < VY1 + 120);
      for (const coin of coins) {
        coin.y += v * dt;
        if (Math.abs(coin.x - playerX) < 28 && Math.abs(coin.y - PLAYER_Y) < 44) collect(coin);
      }
      coins = coins.filter(coin => !coin.taken && coin.y < VY1 + 40);
      if (meters() >= nextMilestone) {
        popups.push({ text: `${nextMilestone} m!`, at: time });
        play('score', 0.5);
        nextMilestone += 100;
      }
    } else if (state === 'crashed') {
      // bilen snurrar och stannar, och sedan kommer rutan
      spin += spinV * dt;
      spinV *= Math.pow(0.15, dt);
      for (const c of cars) c.y += 120 * dt;
      if (Math.abs(spinV) < 0.6) { state = 'over'; overAt = time; }
    }
    popups = popups.filter(p => time - p.at < (p.life ?? 1.2));
  }

  // ---------- Styrning ----------

  // Som i Climbing Game: håller man på vänster eller höger sida glider bilen åt det
  // hållet, och ett svep åt sidan drar bilen med sig, lite långsammare än fingret.
  const holds = new Map(), drags = new Map();
  const SWIPE = 6, SWIPE_FOLLOW = 0.6, SWIPE_EASE = 6.5;
  let swipeTarget = null;
  const steering = () => { let d = 0; for (const dir of holds.values()) d += dir; return Math.sign(d); };
  function hold(id, dir) {
    if (state !== 'playing' || holds.has(id)) return;
    holds.set(id, dir);
    playerX = clampX(playerX + dir * NUDGE);
  }
  function swipe(e) {
    const d = drags.get(e.pointerId);
    if (!d || state !== 'playing') return;
    if (!d.swiping) {
      if (Math.abs(e.clientX - d.startX) < SWIPE) return;
      d.swiping = true; d.fromClientX = e.clientX; d.fromX = playerX;
      holds.delete(e.pointerId);
    }
    swipeTarget = clampX(d.fromX + (e.clientX - d.fromClientX) / scale * SWIPE_FOLLOW);
  }

  // ---------- Ritverktyg ----------

  function blob(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function oval(x, y, rx, ry, color, rot = 0) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function say(text, x, y, size, { font = DISPLAY, weight = '', fill = C.white, outline = C.ink, align = 'center' } = {}) {
    ctx.font = `${weight} ${size}px ${font}`.trim();
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (outline) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 6); ctx.strokeStyle = outline; ctx.strokeText(text, x, y); }
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
  }
  function star(x, y, r, color) {
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  const hash = i => (Math.imul(i, 2654435761) >>> 0) % 1000;

  // ---------- Vägen ----------

  // Gräs med buskar och träd på sidorna, och vägen med kantlinjer och streckade
  // mittlinjer som rullar nedåt medan bilen kör.
  function drawRoad() {
    ctx.fillStyle = C.grass; ctx.fillRect(VX0, VY0, VW, VH);
    const offset = driven % 80, base = Math.floor(driven / 80);
    for (let r = Math.floor((VY0 - offset) / 80) - 1; r * 80 + offset < VY1 + 80; r++) {
      const y = r * 80 + offset, row = r - base;
      for (const side of [-1, 1]) {
        const h = hash(row * 7 + (side + 2) * 131);
        const x = side < 0 ? ROAD_L - 22 - h % 30 : ROAD_R + 22 + h % 30;
        if (h % 3 === 0) { blob(x, y + 20, 14, '#3f8a34'); blob(x - 4, y + 16, 9, '#5cb83a'); }
        else if (h % 3 === 1) { oval(x, y + 40, 12, 7, C.grassDark); }
        else { blob(x, y + 30, 4, '#ffd23f'); blob(x + 9, y + 38, 3.5, '#ff5e7a'); }
      }
    }
    ctx.fillStyle = C.road; ctx.fillRect(ROAD_L, VY0, ROAD_R - ROAD_L, VH);
    ctx.fillStyle = C.roadDark; ctx.fillRect(ROAD_L, VY0, 6, VH); ctx.fillRect(ROAD_R - 6, VY0, 6, VH);
    ctx.fillStyle = C.line; ctx.fillRect(ROAD_L + 8, VY0, 4, VH); ctx.fillRect(ROAD_R - 12, VY0, 4, VH);
    const dash = driven % 60;
    for (const x of [ROAD_L + (ROAD_R - ROAD_L) / 3, ROAD_L + 2 * (ROAD_R - ROAD_L) / 3]) {
      for (let y = VY0 - 60 + dash; y < VY1 + 60; y += 60) ctx.fillRect(x - 2, y, 4, 30);
    }
  }

  // ---------- Bilarna ----------

  // En bil uppifrån, med fronten uppåt: kaross, rutor, hjul och lampor.
  function drawCar(x, y, color, len = CAR_H, truck = false) {
    const w = CAR_W, top = y - len / 2;
    ctx.fillStyle = '#1d1d1d';
    for (const [dx, dy] of [[-w / 2 - 1, top + 12], [w / 2 - 5, top + 12], [-w / 2 - 1, top + len - 24], [w / 2 - 5, top + len - 24]]) { rr(x + dx, dy, 6, 13, 2); ctx.fill(); }
    rr(x - w / 2, top, w, len, 10); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (truck) {
      rr(x - w / 2 + 3, top + 26, w - 6, len - 30, 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
      rr(x - w / 2 + 5, top + 6, w - 10, 12, 3); ctx.fillStyle = '#9fd3ef'; ctx.fill();
    } else {
      rr(x - w / 2 + 5, top + 14, w - 10, 13, 3); ctx.fillStyle = '#9fd3ef'; ctx.fill();
      rr(x - w / 2 + 5, top + len - 22, w - 10, 10, 3); ctx.fill();
      rr(x - w / 2 + 6, top + 29, w - 12, len - 53, 3); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fill();
    }
    blob(x - w / 2 + 7, top + 4, 2.6, '#fff4b0'); blob(x + w / 2 - 7, top + 4, 2.6, '#fff4b0');
    blob(x - w / 2 + 7, top + len - 3, 2.2, '#e63946'); blob(x + w / 2 - 7, top + len - 3, 2.2, '#e63946');
  }

  // Ens egen bil: en röd F1-bil uppifrån, med nosen uppåt, vingar fram och bak, stora
  // hjul utanför karossen och apan i cockpiten.
  function drawPlayer(x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    const red = '#e63946', dark = '#9e1b25';
    // hjulen
    ctx.fillStyle = '#1d1d1d';
    for (const [dx, dy, h] of [[-23, -26, 15], [15, -26, 15], [-24, 12, 18], [15, 12, 18]]) { rr(dx, dy, 9, h, 3); ctx.fill(); }
    // framvinge och bakvinge
    rr(-22, -37, 44, 6, 2); ctx.fillStyle = red; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 1.2; ctx.stroke();
    rr(-20, 30, 40, 8, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; ctx.fillRect(-20, 32, 40, 2);
    // nosen, sidolådorna och motorkåpan
    ctx.beginPath();
    ctx.moveTo(-4, -34); ctx.lineTo(4, -34); ctx.lineTo(7, -12); ctx.lineTo(14, -6); ctx.lineTo(14, 18);
    ctx.lineTo(8, 30); ctx.lineTo(-8, 30); ctx.lineTo(-14, 18); ctx.lineTo(-14, -6); ctx.lineTo(-7, -12); ctx.closePath();
    ctx.fillStyle = red; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C.white; ctx.fillRect(-1.5, -33, 3, 18);
    // cockpit med apan, sedd uppifrån
    rr(-7, -10, 14, 18, 6); ctx.fillStyle = '#1d1d1d'; ctx.fill();
    blob(-7.5, -2, 3, C.fur); blob(7.5, -2, 3, C.fur);
    blob(0, -1, 6.5, C.fur);
    oval(0, -5.5, 3.6, 2.2, C.face);
    blob(-2, -6, 0.9, C.ink); blob(2, -6, 0.9, C.ink);
    ctx.fillStyle = C.white; ctx.font = `10px ${DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('1', 0, 19);
    ctx.restore();
  }

  function drawCoin(x, y) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(Math.max(0.15, Math.abs(Math.cos(time * 4))), 1);
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fillStyle = C.blue; ctx.fill();
    ctx.strokeStyle = C.blueEdge; ctx.lineWidth = 1.5; ctx.stroke();
    blob(0, 0, 6.5, '#9fe3ff');
    star(0, 0, 4.5, C.white);
    ctx.restore();
  }

  // ---------- Skärmarna ----------

  const TITLE_COLORS = ['#ff4f6d', '#ff9f1c', '#ffd23f', '#3ccf6e', '#36b3ec', '#9b6dff'];
  function drawTitle(text, x, y, size) {
    ctx.font = `${size}px ${DISPLAY}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const chars = [...text], widths = chars.map(ch => ctx.measureText(ch).width);
    let left = x - widths.reduce((a, b) => a + b, 0) / 2, n = 0;
    const letters = chars.map((ch, i) => {
      const at = { ch, x: left + widths[i] / 2, y: y + Math.sin(time * 3 - i * 0.5) * 3, color: TITLE_COLORS[n % TITLE_COLORS.length] };
      left += widths[i];
      if (ch !== ' ') n++;
      return at;
    }).filter(l => l.ch !== ' ');
    ctx.lineWidth = size / 6; ctx.strokeStyle = C.ink;
    for (const l of letters) ctx.strokeText(l.ch, l.x, l.y);
    for (const l of letters) { ctx.fillStyle = l.color; ctx.fillText(l.ch, l.x, l.y); }
  }

  function drawButton(b, text, size, { pulse = false } = {}) {
    const press = pulse ? 1 + Math.sin(time * 3) * 0.02 : 1;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(press, press);
    rr(-b.w / 2, -b.h / 2, b.w, b.h, b.h / 2);
    ctx.fillStyle = C.banana; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    say(text, 0, 2, size, { fill: C.ink, outline: null });
    ctx.restore();
  }

  function drawPanel(p) {
    rr(p.x, p.y, p.w, p.h, 20);
    ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  }

  // Startskärmen: rubriken, bilen stor och Starta.
  const START_BTN = { x: W / 2 - 110, y: 410, w: 220, h: 64 };
  function drawStart() {
    drawTitle('Car Game', W / 2, 98, 54);
    if (best) say(`Rekord ${best} m`, W / 2, 148, 20, { fill: C.banana });
    ctx.save();
    ctx.translate(W / 2, 285 + Math.sin(time * 2) * 3); ctx.scale(1.9, 1.9);
    drawPlayer(0, 0, Math.sin(time * 1.5) * 0.06);
    ctx.restore();
    drawButton(START_BTN, 'Starta', 34, { pulse: true });
    say('Svep åt sidan eller håll på en sida för att styra', W / 2, 510, 14, { font: BODY, weight: '800' });
    say('Kör om bilarna och samla blå mynt', W / 2, 534, 14, { font: BODY, weight: '800' });
  }

  function drawHud() {
    if (state === 'ready' || state === 'over') return;
    say(`${meters()} m`, W / 2, UI_T + 46, 44);
    say(`Rekord ${best} m`, W / 2, UI_T + 80, 14, { font: BODY, weight: '800' });
    for (const p of popups) {
      const k = (time - p.at) / (p.life ?? 1.2);
      ctx.globalAlpha = 1 - k * k;
      say(p.text, p.x ?? W / 2, (p.y ?? PLAYER_Y - 110) - k * 40, p.size ?? 24, { fill: p.color ?? C.banana });
    }
    ctx.globalAlpha = 1;
    if (coinsTaken) { drawCoinIcon(34, UI_B - 24); say(String(coinsTaken), 52, UI_B - 23, 16, { font: BODY, weight: '800', align: 'left' }); }
    const tip = time - startedAt;
    if (state === 'playing' && tip < 3) {
      ctx.globalAlpha = Math.min(1, 3 - tip);
      say('Svep åt sidan eller håll på en sida för att styra', W / 2, PLAYER_Y + 80, 14, { font: BODY, weight: '800' });
      ctx.globalAlpha = 1;
    }
  }
  function drawCoinIcon(x, y) {
    blob(x, y, 9, C.blue); blob(x, y, 5.5, '#9fe3ff'); star(x, y, 4, C.white);
  }

  // Efter en krock: hur långt man körde, stort, och rekordet och de blå mynten.
  // Knapparna går att trycka på först efter en kort stund.
  const overButton = (py, ph) => ({ x: W / 2 - 120, y: py + ph + 18, w: 240, h: 56 });
  const againButton = b => ({ x: b.x, y: b.y + b.h + 12, w: b.w, h: b.h });
  let OVER_BTN = overButton(150, 200), AGAIN_BTN = againButton(OVER_BTN);
  function drawOver() {
    const pw = 280, ph = 200, px = W / 2 - pw / 2, py = 150;
    OVER_BTN = overButton(py, ph); AGAIN_BTN = againButton(OVER_BTN);
    say('Krasch!', W / 2, 108, 52, { fill: C.banana });
    drawPanel({ x: px, y: py, w: pw, h: ph });
    say('DU KÖRDE', W / 2, py + 30, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    say(`${meters()} m`, W / 2, py + 74, 56, { fill: C.ink, outline: null });
    if (newBest) {
      rr(W / 2 - 70, py + 104, 140, 32, 16);
      ctx.fillStyle = C.banana; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
      say('Nytt rekord!', W / 2, py + 121, 18, { fill: C.ink, outline: null });
    } else {
      say(`Rekord ${best} m`, W / 2, py + 120, 16, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    }
    drawCoinIcon(W / 2 - 52, py + 162);
    say(`${coinsTaken} blå mynt`, W / 2 - 36, py + 163, 16, { font: BODY, weight: '800', fill: C.ink, outline: null, align: 'left' });
    ctx.globalAlpha = time - overAt > 0.6 ? 1 : 0.5;
    drawButton(OVER_BTN, 'Gå till startsidan', 24);
    drawButton(AGAIN_BTN, 'Spela igen', 24);
    ctx.globalAlpha = 1;
  }

  function draw() {
    drawRoad();
    if (state === 'ready') { drawStart(); return; }
    for (const coin of coins) { blob(coin.x, coin.y, 16, 'rgba(255,255,255,0.35)'); drawCoin(coin.x, coin.y); }
    for (const c of cars) drawCar(c.x, c.y, c.color, c.len, c.truck);
    drawPlayer(playerX, PLAYER_Y, spin);
    drawHud();
    if (state === 'over') drawOver();
  }

  // ---------- Styrning och loop ----------

  function toWorld(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - offX) / scale, y: (e.clientY - r.top - offY) / scale };
  }
  const inside = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
  function toStart() { state = 'ready'; driven = 0; play('select', 0.4); }

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    startMusic();
    const p = toWorld(e);
    if (state === 'ready') {
      if (inside(p, START_BTN)) reset();
    } else if (state === 'playing') {
      const r = canvas.getBoundingClientRect();
      hold(e.pointerId, e.clientX < r.left + r.width / 2 ? -1 : 1);
      drags.set(e.pointerId, { startX: e.clientX, swiping: false });
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    } else if (state === 'over' && time - overAt > 0.6) {
      if (inside(p, OVER_BTN)) toStart();
      else if (inside(p, AGAIN_BTN)) reset();
    }
  });
  canvas.addEventListener('pointermove', swipe);
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    window.addEventListener(type, e => { holds.delete(e.pointerId); drags.delete(e.pointerId); });
  }

  const KEY_DIR = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 };
  window.addEventListener('keydown', e => {
    startMusic();
    const go = e.code === 'Space' || e.code === 'Enter';
    if (state === 'ready') { if (go && !e.repeat) { e.preventDefault(); reset(); } return; }
    if (state === 'over') { if (go && time - overAt > 0.6) { e.preventDefault(); reset(); } return; }
    if (KEY_DIR[e.code]) { e.preventDefault(); hold(e.code, KEY_DIR[e.code]); }
  });
  window.addEventListener('keyup', e => holds.delete(e.code));
  window.addEventListener('blur', () => { holds.clear(); drags.clear(); });

  let last = 0;
  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
