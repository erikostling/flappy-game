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
    fur: '#8a5a2b', furDark: '#6b4220', face: '#f1d0a5', mouth: '#4a2a12',
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
  let UI_T = 0, UI_B = H;
  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const cw = Math.max(1, Math.floor(stage.clientWidth)), ch = Math.max(1, Math.floor(stage.clientHeight));
    const s = Math.max(0.2, Math.min(cw / W, ch / H));
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    const ox = (cw - W * s) / 2, oy = (ch - H * s) / 2;
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

  // ready (startskärmen) → playing → falling → over → playing
  let state = 'ready';
  let time = 0, overAt = 0, climbed = 0, nextSpawnAt = 0, nextMilestone = 10;
  let lane = 1, playerX = LANES[1], playerY = PLAYER_Y, fallVy = 0, fallSpin = 0;
  let falling = [], popups = [];
  let best = Math.max(0, Math.floor(Number(load('climbing-best')) || 0)), newBest = false;

  const meters = () => Math.floor(climbed / METER);
  // Fortare ju högre man kommer: från 2 till 5,5 meter i sekunden.
  const climbSpeed = () => 80 + Math.min(140, climbed / 40);
  // Kortare mellan sakerna som faller ju högre man kommer.
  const spawnGap = () => Math.max(120, 250 - climbed / 50);

  function reset() {
    state = 'playing'; climbed = 0; nextSpawnAt = 200; nextMilestone = 10;
    lane = 1; playerX = LANES[1]; playerY = PLAYER_Y; fallVy = 0; fallSpin = 0;
    falling = []; popups = []; newBest = false;
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
      if (playerY > VY1 + 80) { state = 'over'; overAt = time; }
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

  // Apan som klättrare: inga vingar, lite längre, med armar och ben som tar i
  // väggen växelvis medan den klättrar.
  // `reach` styr armar och ben när apan inte klättrar på riktigt, som på startskärmen.
  function drawClimber(x, y, { dead = false, size = 1, reach } = {}) {
    const phase = dead ? 0 : reach ?? Math.sin(climbed / 14);
    ctx.save();
    ctx.translate(x, y);
    if (dead) ctx.rotate(fallSpin);
    ctx.scale(size, 1.2 * size);

    for (const side of [-1, 1]) {
      const up = side * phase * 5;
      const hand = [side * 23, -24 + up];
      stroke([[side * 7, 8], [side * 20, -4 + up * 0.5], hand], C.fur, 6);
      oval(hand[0], hand[1] - 1.5, 3.8, 3.4, C.face);
      ctx.strokeStyle = C.furDark; ctx.lineWidth = 1.2;
      for (const dx of [-1.8, 0, 1.8]) { ctx.beginPath(); ctx.moveTo(hand[0] + dx, hand[1] - 4.5); ctx.lineTo(hand[0] + dx, hand[1] - 2.5); ctx.stroke(); }
      const foot = [side * 11, 34 - up];
      stroke([[side * 6, 16], [side * 9, 26 - up * 0.5], foot], C.fur, 6.5);
      oval(foot[0] + side * 1.5, foot[1] + 1.5, 5.5, 3.2, C.furDark);
    }

    // svansen
    ctx.strokeStyle = C.furDark; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 16); ctx.bezierCurveTo(-26, 22, -34, 6, -26, 0); ctx.bezierCurveTo(-20, -4, -16, 4, -22, 6); ctx.stroke();

    oval(-2, 12, 12, 10, C.fur);
    oval(0, 14, 7, 6.5, C.face);
    oval(-12, -8, 7, 7, C.fur); oval(-12, -8, 4, 4, C.face);
    oval(12, -8, 7, 7, C.fur); oval(12, -8, 4, 4, C.face);
    oval(0, -6, 15, 14, C.fur);
    oval(0, -9, 10, 7.5, C.face);
    oval(0, -1, 9, 6.5, C.face);
    for (const ex of [-4, 4]) {
      if (dead) {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ex - 2.5, -11.5); ctx.lineTo(ex + 2.5, -6.5); ctx.moveTo(ex + 2.5, -11.5); ctx.lineTo(ex - 2.5, -6.5); ctx.stroke();
      } else {
        oval(ex, -9, 3.8, 4.2, C.white);
        oval(ex, -8.5, 2, 2.3, C.ink);
      }
    }
    blob(-1.5, -3, 1.1, C.mouth); blob(1.5, -3, 1.1, C.mouth);
    ctx.strokeStyle = C.mouth; ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (dead) ctx.arc(0, 3, 3.5, 1.15 * Math.PI, 1.85 * Math.PI);
    else ctx.arc(0, -1, 4.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
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

  // Startskärmen: rubriken, apan stor på väggen och Starta. Ett tryck var som helst
  // startar; knappen visar var.
  const START_BTN = { x: W / 2 - 110, y: 400, w: 220, h: 64 };
  function drawStart() {
    drawTitle('Climbing Game', W / 2, 104, 50);
    drawClimber(W / 2, 262 + Math.sin(time * 2) * 4, { size: 2.1, reach: Math.sin(time * 4) });
    const b = START_BTN, press = 1 + Math.sin(time * 3) * 0.02;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(press, press);
    rr(-b.w / 2, -b.h / 2, b.w, b.h, b.h / 2);
    ctx.fillStyle = C.banana; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    say('Starta', 0, 2, 34, { fill: C.ink, outline: null });
    ctx.restore();
    if (best) say(`Rekord ${best} m`, W / 2, b.y + b.h + 34, 22, { fill: C.banana });
    say('Tryck på vänster eller höger sida för att byta spår', W / 2, b.y + b.h + (best ? 68 : 38), 14, { font: BODY, weight: '800' });
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
    if (state === 'over') {
      const pw = 260, ph = 200, px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 20;
      ctx.fillStyle = 'rgba(16,41,27,0.45)'; ctx.fillRect(VX0, VY0, VW, VH);
      say('Du föll!', W / 2, py - 34, 50, { fill: C.banana });
      drawPanel(px, py, pw, ph);
      say('HÖJD', W / 2 - 62, py + 36, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
      say('REKORD', W / 2 + 62, py + 36, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
      say(`${meters()} m`, W / 2 - 62, py + 80, 38, { fill: C.ink, outline: null });
      say(`${best} m`, W / 2 + 62, py + 80, 38, { fill: C.ink, outline: null });
      if (newBest) {
        rr(W / 2 - 70, py + 124, 140, 34, 17);
        ctx.fillStyle = C.banana; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
        say('Nytt rekord!', W / 2, py + 142, 18, { fill: C.ink, outline: null });
      } else {
        say('Väj för krukor och tegel', W / 2, py + 142, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
      }
      if (time - overAt > 0.6) say('Tryck för att klättra igen', W / 2, py + ph + 40, 22);
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
  }

  // ---------- Styrning och loop ----------

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (state === 'ready') reset();
    else if (state === 'playing') {
      const r = canvas.getBoundingClientRect();
      moveLane(e.clientX < r.left + r.width / 2 ? -1 : 1);
    } else if (state === 'over' && time - overAt > 0.6) {
      reset();
    }
  });

  window.addEventListener('keydown', e => {
    const go = e.code === 'Space' || e.code === 'Enter';
    if (state === 'ready') { if (go) { e.preventDefault(); reset(); } return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); moveLane(-1); }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); moveLane(1); }
    if (go && state === 'over' && time - overAt > 0.6) { e.preventDefault(); reset(); }
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
