(() => {
  // Climbing Game: apan klättrar uppför en tegelvägg av sig själv, och man flyttar
  // den mellan tre spår för att väja för blomkrukor och tegelstenar som faller.
  // Poängen är hur högt man har klättrat, i meter.

  // Spelet mäts i W×H och skalas så att det får plats, mitt på skärmen. Det som
  // blir över fylls av mer vägg: VX0–VX1 och VY0–VY1 är det som syns. UI_* är
  // skärmens kanter innanför notch och hemknapp, som läses från #climb-safe.
  const W = 400, H = 600;
  const LANES = [110, 200, 290];
  const PLAYER_Y = 420, HIT = 15, METER = 40;
  const FALL = 170, GRAVITY = 1400;

  const C = {
    ink: '#1d2b1f', white: '#ffffff', banana: '#ffd23f', panel: '#fff7e0', dirt: '#8a5a2b',
    mortar: '#dccab2', bricks: ['#b8513b', '#c25c44', '#ad4a35', '#c96a4f'],
    mouth: '#4a2a12',
    pot: '#c8643c', potDark: '#8f3f22', soil: '#5a3a22', stem: '#3f8a34', petal: '#ff5e7a', petalCore: '#ffd23f',
  };

  const css = getComputedStyle(document.documentElement);
  const DISPLAY = css.getPropertyValue('--font-display').trim() || 'sans-serif';
  const BODY = css.getPropertyValue('--font-body').trim() || 'sans-serif';

  const stage = document.getElementById('climb-stage');
  const canvas = document.getElementById('climb');
  const ctx = canvas.getContext('2d');
  const safe = document.getElementById('climb-safe');

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

  // Ljuden är Flappy Games, och de följer dess inställning för ljudeffekter.
  const soundOn = () => load('flappy-apa-ljud') !== 'av';
  const sounds = {};
  function play(name, volume = 0.6) {
    if (!soundOn()) return;
    try {
      const a = (sounds[name] ??= new Audio(`/ljud/${name}.mp3`));
      a.volume = volume; a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }

  // ready (startskärmen) → playing → falling → ready: den som faller kommer tillbaka
  // till startskärmen, som visar hur högt den kom.
  let state = 'ready';
  let time = 0, readyAt = -1, ran = false, climbed = 0, nextSpawnAt = 0, nextMilestone = 10;
  let lane = 1, playerX = LANES[1], playerY = PLAYER_Y, fallVy = 0, fallSpin = 0;
  let falling = [], popups = [], startedAt = 0;
  let overlay = null; // 'figures' när rutan Figurer är öppen
  let best = Math.max(0, Math.floor(Number(load('climbing-best')) || 0)), newBest = false;

  const meters = () => Math.floor(climbed / METER);
  // Fortare ju högre man kommer: från 2 till 5,5 meter i sekunden.
  const climbSpeed = () => 80 + Math.min(140, climbed / 40);
  // Kortare mellan sakerna som faller ju högre man kommer.
  const spawnGap = () => Math.max(120, 250 - climbed / 50);

  function reset() {
    state = 'playing'; climbed = 0; nextSpawnAt = 200; nextMilestone = 10;
    lane = 1; playerX = LANES[1]; playerY = PLAYER_Y; fallVy = 0; fallSpin = 0;
    falling = []; popups = []; newBest = false; startedAt = time;
  }

  function moveLane(step) {
    if (state !== 'playing') return;
    const next = Math.max(0, Math.min(LANES.length - 1, lane + step));
    if (next !== lane) { lane = next; play('swish', 0.35); }
  }

  function crash() {
    state = 'falling'; fallVy = -320;
    play('crash', 0.8);
    if (meters() > best) { best = meters(); newBest = true; store('climbing-best', best); }
  }

  function spawn() {
    const kind = Math.random() < 0.6 ? 'kruka' : 'tegel';
    falling.push({ kind, lane: Math.floor(Math.random() * LANES.length), y: VY0 - 40, spin: Math.random() * 6 });
    // ibland faller två saker samtidigt, men aldrig i alla tre spåren
    if (climbed > 1200 && Math.random() < 0.3) {
      const taken = falling[falling.length - 1].lane;
      const other = (taken + 1 + Math.floor(Math.random() * 2)) % LANES.length;
      falling.push({ kind: kind === 'kruka' ? 'tegel' : 'kruka', lane: other, y: VY0 - 90, spin: Math.random() * 6 });
    }
  }

  function update(dt) {
    time += dt;
    if (state === 'playing') {
      const v = climbSpeed();
      climbed += v * dt;
      playerX += (LANES[lane] - playerX) * Math.min(1, dt * 14);
      if (climbed >= nextSpawnAt) { spawn(); nextSpawnAt = climbed + spawnGap(); }
      for (const f of falling) {
        f.y += (FALL + v) * dt;
        f.spin += dt * 4;
        const dx = LANES[f.lane] - playerX, dy = f.y - (playerY - 4);
        if (dx * dx + dy * dy < (HIT + 13) ** 2) { crash(); break; }
      }
      falling = falling.filter(f => f.y < VY1 + 60);
      if (meters() >= nextMilestone) {
        popups.push({ text: `${nextMilestone} m!`, at: time });
        play('score', 0.5);
        nextMilestone += 10;
      }
    } else if (state === 'falling') {
      fallVy += GRAVITY * dt;
      playerY += fallVy * dt;
      fallSpin += dt * 6;
      for (const f of falling) f.y += FALL * dt;
      if (playerY > VY1 + 80) { state = 'ready'; readyAt = time; ran = true; }
    }
    popups = popups.filter(p => time - p.at < 1.2);
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
  function ovalEdge(x, y, rx, ry, color, edge) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke();
  }
  function poly(points, color, edge) {
    ctx.beginPath(); points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke(); }
  }
  function stroke(points, color, width) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  function say(text, x, y, size, { font = DISPLAY, weight = '', fill = C.white, outline = C.ink, align = 'center' } = {}) {
    ctx.font = `${weight} ${size}px ${font}`.trim();
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (outline) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 6); ctx.strokeStyle = outline; ctx.strokeText(text, x, y); }
    ctx.fillStyle = fill; ctx.fillText(text, x, y);
  }
  const hash = i => (Math.imul(i, 2654435761) >>> 0) % 1000;

  // ---------- Världen ----------

  // Teglet rullar nedåt medan apan klättrar; varannan rad är förskjuten.
  function drawWall() {
    const bw = 48, bh = 20, offset = climbed % (bh * 2);
    ctx.fillStyle = C.mortar; ctx.fillRect(VX0, VY0, VW, VH);
    const firstRow = Math.floor((VY0 - offset) / bh) - 1, rowBase = Math.floor(climbed / bh);
    for (let r = firstRow; r * bh + offset < VY1 + bh; r++) {
      const y = r * bh + offset, worldRow = r - rowBase;
      const shift = ((worldRow % 2) + 2) % 2 ? bw / 2 : 0;
      for (let x = Math.floor((VX0 - shift) / bw) * bw + shift - bw; x < VX1 + bw; x += bw) {
        rr(x + 1.5, y + 1.5, bw - 3, bh - 3, 2.5);
        ctx.fillStyle = C.bricks[hash(worldRow * 31 + Math.round(x / bw) * 7 + 1000) % C.bricks.length]; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 3, y + 3, bw - 6, 2.5);
      }
    }
    // mörkare mot kanterna, så att spåren i mitten syns
    const g = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, Math.max(VW, VH) * 0.7);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g; ctx.fillRect(VX0, VY0, VW, VH);
  }

  // ---------- Figurerna ----------

  // Figurerna är Flappy Games, ritade som klättrare: framifrån, utan vingar, med armar
  // och långa ben. Man klättrar med de figurer man har i Flappy Game; apan har alla.
  // Varje figur ger kroppens färger, svansen och huvudet; armar och ben är gemensamma.
  // Med `edge` får lemmar och kropp en kontur, så att en ljus figur syns mot väggen.
  const FIGURES = [
    { id: 'apa', name: 'Apa', fur: '#8a5a2b', dark: '#6b4220', light: '#f1d0a5', tail: monkeyTail, head: monkeyHead },
    { id: 'hund', name: 'Hund', fur: '#d9a066', dark: '#9b6235', light: '#f7e6c8', tail: dogTail, head: dogHead },
    { id: 'enhorning', name: 'Enhörning', fur: '#fdfbff', dark: '#a993cf', light: '#ffe3ee', edge: '#a993cf', hooves: true, tail: unicornTail, head: unicornHead },
  ];

  // Det Flappy Game sparar om figurerna: den första man valde och de man har köpt.
  function owned(id) {
    if (id === 'apa' || load('flappy-apa-forsta') === id) return true;
    try { return JSON.parse(load('flappy-apa-upplasta') || '[]').includes(id); } catch { return false; }
  }
  let figure = Math.max(0, FIGURES.findIndex(f => f.id === load('climbing-figur')));
  if (!owned(FIGURES[figure].id)) figure = 0;
  function choose(i) {
    figure = i;
    store('climbing-figur', FIGURES[i].id);
    play('swish', 0.35);
  }

  function eyes(dead, y = -9) {
    for (const ex of [-4, 4]) {
      if (dead) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex - 2.5, y - 2.5); ctx.lineTo(ex + 2.5, y + 2.5); ctx.moveTo(ex + 2.5, y - 2.5); ctx.lineTo(ex - 2.5, y + 2.5); ctx.stroke();
      } else {
        oval(ex, y, 3.8, 4.2, C.white);
        oval(ex, y + 0.5, 2, 2.3, C.ink);
      }
    }
  }
  function smile(dead, y, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath();
    if (dead) ctx.arc(0, y + 4, 3.5, 1.15 * Math.PI, 1.85 * Math.PI);
    else ctx.arc(0, y, 4.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  function monkeyTail(f) {
    ctx.strokeStyle = f.dark; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 16); ctx.bezierCurveTo(-26, 22, -34, 6, -26, 0); ctx.bezierCurveTo(-20, -4, -16, 4, -22, 6); ctx.stroke();
  }
  function monkeyHead(f, dead) {
    oval(-12, -8, 7, 7, f.fur); oval(-12, -8, 4, 4, f.light);
    oval(12, -8, 7, 7, f.fur); oval(12, -8, 4, 4, f.light);
    oval(0, -6, 15, 14, f.fur);
    oval(0, -9, 10, 7.5, f.light);
    oval(0, -1, 9, 6.5, f.light);
    eyes(dead);
    blob(-1.5, -3, 1.1, C.mouth); blob(1.5, -3, 1.1, C.mouth);
    smile(dead, -1, C.mouth);
  }

  // hunden viftar på svansen och har hängöron
  function dogTail(f, dead) {
    ctx.save();
    ctx.translate(-8, 18); ctx.rotate(dead ? 0 : Math.sin(time * 14) * 0.35);
    ctx.strokeStyle = f.fur; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, -2, -12, -12); ctx.stroke();
    ctx.restore();
  }
  function dogHead(f, dead) {
    oval(0, -6, 14.5, 13, f.fur);
    oval(0, -1, 8.5, 6.5, f.light);
    oval(-13.5, -3, 5, 10, f.dark, 0.25);
    oval(13.5, -3, 5, 10, f.dark, -0.25);
    eyes(dead, -10);
    oval(0, -4, 3.4, 2.6, '#2a1d16');
    smile(dead, -0.5, '#2a1d16');
    if (!dead) oval(0, 4.5, 2.4, 3.2, '#ff7a8a');
  }

  // enhörningen har regnbågsman och regnbågssvans, horn och hovar
  const RAINBOW = ['#ff6b8b', '#ffb347', '#ffe066', '#6fdc8c', '#5bc0eb', '#a78bfa'];
  function unicornTail() {
    ctx.lineCap = 'round'; ctx.lineWidth = 3.5;
    RAINBOW.slice(0, 4).forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(-9, 15 + i * 1.5);
      ctx.quadraticCurveTo(-24, 10 + i * 3, -28, 22 + i * 3.5);
      ctx.stroke();
    });
  }
  function unicornHead(f, dead) {
    poly([[-11, -13], [-9, -24], [-4, -17]], f.fur, f.edge);
    poly([[4, -17], [9, -24], [11, -13]], f.fur, f.edge);
    ovalEdge(0, -6, 14, 13, f.fur, f.edge);
    [[-12, -12, 4.5], [-14, -5, 4.5], [-13, 2, 4], [-6, -17, 4], [1, -19, 4]].forEach(([x, y, r], i) => blob(x, y, r, RAINBOW[i]));
    poly([[-3, -17], [0, -35], [3, -17]], '#ffd23f', '#b88a00');
    ctx.strokeStyle = '#b88a00'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-1.8, -22); ctx.lineTo(1.8, -23.5); ctx.moveTo(-1, -28); ctx.lineTo(1, -29); ctx.stroke();
    ovalEdge(0, 0, 8.5, 6, f.light, f.edge);
    blob(-2.5, -0.5, 1, f.edge); blob(2.5, -0.5, 1, f.edge);
    eyes(dead, -9);
    oval(-9, -3, 2.6, 1.6, '#ffb3c7'); oval(9, -3, 2.6, 1.6, '#ffb3c7');
    smile(dead, 1.5, f.edge);
  }

  // Klättraren: armar och ben som tar i väggen växelvis medan den klättrar, och
  // figurens svans, kropp och huvud. `reach` styr armar och ben när den inte
  // klättrar på riktigt, som på startskärmen.
  function drawClimber(x, y, { fig = figure, dead = false, size = 1, reach } = {}) {
    const f = FIGURES[fig];
    const phase = dead ? 0 : reach ?? Math.sin(climbed / 14);
    ctx.save();
    ctx.translate(x, y);
    if (dead) ctx.rotate(fallSpin);
    ctx.scale(size, 1.2 * size);

    const limb = (points, width) => {
      if (f.edge) stroke(points, f.edge, width + 2.5);
      stroke(points, f.fur, width);
    };
    for (const side of [-1, 1]) {
      const up = side * phase * 5;
      const hand = [side * 23, -24 + up];
      limb([[side * 7, 8], [side * 20, -4 + up * 0.5], hand], 6);
      if (f.hooves) oval(hand[0], hand[1] - 1.5, 3.8, 3.4, f.dark);
      else {
        oval(hand[0], hand[1] - 1.5, 3.8, 3.4, f.light);
        ctx.strokeStyle = f.dark; ctx.lineWidth = 1.2;
        for (const dx of [-1.8, 0, 1.8]) { ctx.beginPath(); ctx.moveTo(hand[0] + dx, hand[1] - 4.5); ctx.lineTo(hand[0] + dx, hand[1] - 2.5); ctx.stroke(); }
      }
      const foot = [side * 11, 34 - up];
      limb([[side * 6, 16], [side * 9, 26 - up * 0.5], foot], 6.5);
      oval(foot[0] + side * 1.5, foot[1] + 1.5, 5.5, 3.2, f.dark);
    }

    f.tail(f, dead);
    if (f.edge) ovalEdge(-2, 12, 12, 10, f.fur, f.edge); else oval(-2, 12, 12, 10, f.fur);
    oval(0, 14, 7, 6.5, f.light);
    f.head(f, dead);
    ctx.restore();
  }

  function drawPot(x, y, spin) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(Math.sin(spin) * 0.3);
    // blomman sticker upp ur jorden
    stroke([[0, -6], [0, -16]], C.stem, 2);
    for (let k = 0; k < 5; k++) blob(Math.cos(k * 1.26) * 4, -18 + Math.sin(k * 1.26) * 4, 3, C.petal);
    blob(0, -18, 2.2, C.petalCore);
    ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(12, -6); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.closePath();
    ctx.fillStyle = C.pot; ctx.fill();
    ctx.strokeStyle = C.potDark; ctx.lineWidth = 1.5; ctx.stroke();
    rr(-13.5, -9, 27, 5, 2); ctx.fillStyle = C.pot; ctx.fill(); ctx.stroke();
    oval(0, -7, 10, 1.6, C.soil);
    ctx.restore();
  }

  function drawBrick(x, y, spin) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(spin);
    // ljusare än väggen och med svart kant, så att den syns mot teglet bakom
    rr(-14, -7, 28, 14, 2.5);
    ctx.fillStyle = '#e8875f'; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-11, -4.5, 22, 2.5);
    ctx.restore();
  }

  // Rubriken på startskärmen, som Flappy Games: varje bokstav i en egen färg, och
  // bokstäverna guppar i en våg. Alla konturer ritas före bokstäverna.
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

  function drawButton(b, text, size, { fill = C.banana, pulse = false } = {}) {
    const press = pulse ? 1 + Math.sin(time * 3) * 0.02 : 1;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(press, press);
    rr(-b.w / 2, -b.h / 2, b.w, b.h, b.h / 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    if (text) say(text, 0, 2, size, { fill: C.ink, outline: null });
    ctx.restore();
  }

  // Startskärmen: rubriken, figuren stor på väggen, Starta och Figurer. Ett tryck
  // utanför Figurer startar; knappen Starta visar var.
  const START_BTN = { x: W / 2 - 110, y: 396, w: 220, h: 64 };
  const FIG_BTN = { x: W / 2 - 85, y: 478, w: 170, h: 54 };
  function drawStart() {
    drawTitle('Climbing Game', W / 2, 98, 50);
    if (ran && newBest) say(`Nytt rekord! ${best} m`, W / 2, 146, 24, { fill: C.banana });
    else if (ran) say(`Du kom ${meters()} m · Rekord ${best} m`, W / 2, 146, 20, { fill: C.banana });
    else if (best) say(`Rekord ${best} m`, W / 2, 146, 20, { fill: C.banana });
    drawClimber(W / 2, 262 + Math.sin(time * 2) * 4, { size: 2.1, reach: Math.sin(time * 4) });
    say(FIGURES[figure].name, W / 2, 372, 22);
    drawButton(START_BTN, 'Starta', 34, { pulse: true });
    const b = FIG_BTN;
    drawButton(b, '', 0, { fill: C.panel });
    drawClimber(b.x + 32, b.y + 24, { size: 0.42, reach: Math.sin(time * 4) });
    say('Figurer', b.x + 104, b.y + b.h / 2 + 2, 26, { fill: C.ink, outline: null });
  }

  // Rutan Figurer: alla klätterfigurer. De man har väljs med ett tryck; de andra är
  // bleka och finns att köpa i Flappy Game.
  const FIG_PANEL = { x: 30, y: 140, w: 340, h: 316 };
  const FIG_DONE = { x: W / 2 - 80, y: FIG_PANEL.y + FIG_PANEL.h - 64, w: 160, h: 48 };
  const figCell = i => ({ x: FIG_PANEL.x + 10 + (i % 3) * 110, y: FIG_PANEL.y + 66 + Math.floor(i / 3) * 140, w: 100, h: 132 });
  function drawFigures() {
    ctx.fillStyle = 'rgba(16,41,27,0.55)'; ctx.fillRect(VX0, VY0, VW, VH);
    drawPanel(FIG_PANEL.x, FIG_PANEL.y, FIG_PANEL.w, FIG_PANEL.h);
    say('Figurer', W / 2, FIG_PANEL.y + 36, 32, { fill: C.ink, outline: null });
    FIGURES.forEach((f, i) => {
      const c = figCell(i), have = owned(f.id), on = i === figure;
      rr(c.x, c.y, c.w, c.h, 14);
      ctx.fillStyle = on ? C.banana : '#f3e6c2'; ctx.fill();
      ctx.strokeStyle = on ? C.ink : 'rgba(29,43,31,0.25)'; ctx.lineWidth = on ? 3 : 2; ctx.stroke();
      ctx.globalAlpha = have ? 1 : 0.35;
      drawClimber(c.x + c.w / 2, c.y + 58, { fig: i, size: 0.95, reach: on ? Math.sin(time * 4) : 0 });
      ctx.globalAlpha = 1;
      say(f.name, c.x + c.w / 2, c.y + c.h - 16, 16, { fill: C.ink, outline: null });
    });
    if (FIGURES.some(f => !owned(f.id))) {
      say('De bleka köper du i Flappy Game', W / 2, FIG_PANEL.y + 222, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    }
    drawButton(FIG_DONE, 'Klar', 26);
  }

  function drawPanel(x, y, w, h) {
    rr(x, y, w, h, 20);
    ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  }

  function drawHud() {
    if (state === 'ready') return;
    say(`${meters()} m`, W / 2, UI_T + 46, 44);
    say(`Rekord ${best} m`, W / 2, UI_T + 80, 14, { font: BODY, weight: '800' });
    for (const p of popups) {
      const k = (time - p.at) / 1.2;
      ctx.globalAlpha = 1 - k;
      say(p.text, playerX, PLAYER_Y - 70 - k * 40, 24, { fill: C.banana });
    }
    ctx.globalAlpha = 1;
    const tip = time - startedAt;
    if (state === 'playing' && tip < 3) {
      ctx.globalAlpha = Math.min(1, 3 - tip);
      say('Tryck på vänster eller höger sida för att byta spår', W / 2, PLAYER_Y + 100, 14, { font: BODY, weight: '800' });
      ctx.globalAlpha = 1;
    }
  }

  function draw() {
    drawWall();
    if (state === 'ready') drawStart();
    else {
      // en skugga lyfter det som faller ut från väggen
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
      for (const f of falling) (f.kind === 'kruka' ? drawPot : drawBrick)(LANES[f.lane], f.y, f.spin);
      ctx.restore();
      drawClimber(playerX, playerY, { dead: state !== 'playing' });
    }
    drawHud();
    if (overlay === 'figures') drawFigures();
  }

  // ---------- Styrning och loop ----------

  function toWorld(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - offX) / scale, y: (e.clientY - r.top - offY) / scale };
  }
  const settled = () => time - readyAt > 0.6;
  const inside = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    const p = toWorld(e);
    if (overlay === 'figures') {
      const i = FIGURES.findIndex((_, k) => inside(p, figCell(k)));
      if (i >= 0) { if (owned(FIGURES[i].id)) choose(i); }
      else if (inside(p, FIG_DONE) || !inside(p, FIG_PANEL)) overlay = null;
    } else if (state === 'ready') {
      if (!settled()) return;
      if (inside(p, FIG_BTN)) overlay = 'figures';
      else reset();
    } else if (state === 'playing') {
      const r = canvas.getBoundingClientRect();
      moveLane(e.clientX < r.left + r.width / 2 ? -1 : 1);
    }
  });

  window.addEventListener('keydown', e => {
    const go = e.code === 'Space' || e.code === 'Enter';
    if (overlay) { if (go || e.code === 'Escape') { e.preventDefault(); overlay = null; } return; }
    if (state === 'ready') { if (go && settled()) { e.preventDefault(); reset(); } return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); moveLane(-1); }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); moveLane(1); }
  });

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
