(() => {
  // Två spel med samma ramverk: Climbing Game, där en figur klättrar uppför en vägg och
  // väjer för det som faller, och Car Game, där en figur kör en F1-bil uppför vägen och
  // kör om bilarna framför. Man styr åt sidorna, samlar saker och krafter, tar medaljer
  // och kommer in på topplistan likadant i båda; poängen är hur långt man kommer, i
  // meter. Sidan säger vilket spel det är med data-game på #runner-stage, och TRACKS
  // längre ner har det som skiljer dem åt.

  // Spelet mäts i W×H och skalas så att det får plats, mitt på skärmen. Det som
  // blir över fylls av mer vägg eller gräs: VX0–VX1 och VY0–VY1 är det som syns. UI_*
  // är skärmens kanter innanför notch och hemknapp, som läses från #runner-safe.
  const W = 400, H = 600;
  const GAME = document.getElementById('runner-stage')?.dataset.game === 'car' ? 'car' : 'climbing';
  const CAR = GAME === 'car';
  // Figuren går att flytta mellan MIN_X och MAX_X; hindren och sakerna hamnar var som
  // helst där emellan. I Car Game är det vägen, mellan ROAD_L och ROAD_R.
  const ROAD_L = 60, ROAD_R = 340, CAR_W = 40, CAR_H = 72;
  const MIN_X = CAR ? ROAD_L + CAR_W / 2 + 6 : 55, MAX_X = CAR ? ROAD_R - CAR_W / 2 - 6 : 345;
  const STEER = CAR ? 300 : 260, NUDGE = 10;
  const randomX = () => MIN_X + Math.random() * (MAX_X - MIN_X);
  const PLAYER_Y = CAR ? 470 : 420, HIT = 15, METER = 40;
  const FALL = 170, GRAVITY = 1400;

  const C = {
    ink: '#1d2b1f', white: '#ffffff', banana: '#ffd23f', panel: '#fff7e0', panelRow: '#f3e6c2', dirt: '#8a5a2b',
    gold: '#f5b301', on: '#2bb673', off: '#cfc6b0', medals: ['#ffd23f', '#cfd6dc', '#e0a46b'],
    blue: '#36b3ec', blueEdge: '#16679a', locked: '#d9d2bf',
    mortar: '#dccab2', bricks: ['#b8513b', '#c25c44', '#ad4a35', '#c96a4f'],
    mouth: '#4a2a12',
    pot: '#c8643c', potDark: '#8f3f22', soil: '#5a3a22', stem: '#3f8a34', petal: '#ff5e7a', petalCore: '#ffd23f',
  };

  const css = getComputedStyle(document.documentElement);
  const DISPLAY = css.getPropertyValue('--font-display').trim() || 'sans-serif';
  const BODY = css.getPropertyValue('--font-body').trim() || 'sans-serif';

  const stage = document.getElementById('runner-stage');
  const canvas = document.getElementById('runner');
  const ctx = canvas.getContext('2d');
  const safe = document.getElementById('runner-safe');
  const backLink = document.getElementById('runner-back');

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
    // namnrutan skalar med spelet
    stage.style.setProperty('--s', s);
  }
  new ResizeObserver(fit).observe(stage);
  fit();

  function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function store(key, v) { try { localStorage.setItem(key, String(v)); } catch {} }

  // ---------- Ljud ----------

  // Ljudeffekterna och musiken är Flappy Games, och inställningarna är gemensamma:
  // stänger man av musiken i det ena spelet är den av i det andra också.
  let sfxOn = load('flappy-apa-ljud') !== 'av';
  let musicOn = load('flappy-apa-musik') !== 'av';
  const sounds = {};
  function play(name, volume = 0.6, rate = 1) {
    if (!sfxOn) return;
    try {
      const a = (sounds[name] ??= new Audio(`/ljud/${name}.mp3`));
      a.volume = volume; a.playbackRate = rate; a.preservesPitch = false; a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }

  // Musiken är en av Flappy Games låtar, som går runt utan uppehåll. Webbläsaren
  // släpper fram ljud först efter ett tryck, så den startar vid det första.
  let ac = null, song = null, songBuf = null, songAsked = false;
  function startMusic() {
    if (!musicOn || song || document.hidden) return;
    try { ac ??= new AudioContext(); } catch { return; }
    ac.resume().catch(() => {});
    if (!songBuf) {
      if (!songAsked) {
        songAsked = true;
        fetch(`/musik/${CAR ? 'strand' : 'glad'}.mp3`)
          .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
          .then(data => ac.decodeAudioData(data))
          .then(buf => { songBuf = buf; startMusic(); })
          .catch(() => {});
      }
      return;
    }
    // går runt mellan där låten börjar och slutar höras, utan tystnaden i ändarna
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
  function stopMusic() {
    if (!song) return;
    const { src, gain } = song, t = ac.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.linearRampToValueAtTime(0.0001, t + 0.3);
    try { src.stop(t + 0.35); } catch {}
    song = null;
  }
  // Ingen musik i en dold flik. Figurerna läses om när man kommer tillbaka, ifall
  // man har köpt en i Flappy Game under tiden.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ownedIds = readOwned();
    if (!ac) return;
    if (document.hidden) ac.suspend().catch(() => {});
    else ac.resume().catch(() => {});
  });
  function toggleSfx() {
    sfxOn = !sfxOn;
    store('flappy-apa-ljud', sfxOn ? 'på' : 'av');
    play('select', 0.5);
  }
  function toggleMusic() {
    musicOn = !musicOn;
    store('flappy-apa-musik', musicOn ? 'på' : 'av');
    if (musicOn) startMusic(); else stopMusic();
    play('select', 0.5);
  }

  // ---------- Topplistan ----------

  // Climbing Games egen lista i meter, i Supabase via /api/climbing/scores. Enhetens
  // nyckel och namnet man skrev senast är Flappy Games, så att ett namn hör till
  // samma enhet i båda spelen.
  const TOP = 10;
  let topList = [], ownedNames = new Set(), listMode = 'loading'; // loading, ready eller error
  const nameKey = name => name.toLowerCase();
  const sameEntry = (a, b) => !!a && !!b && a.at === b.at && a.name === b.name && a.score === b.score;

  function deviceKey() {
    let key = load('flappy-apa-nyckel');
    if (!key) {
      key = window.crypto?.randomUUID?.() ?? Array.from({ length: 4 }, () => Math.random().toString(36).slice(2)).join('');
      store('flappy-apa-nyckel', key);
    }
    return key;
  }

  // Varje svar har listan och vilka namn på den som hör till den här enheten.
  async function scoresRequest(body = null) {
    const res = await fetch(`/api/${GAME}/scores`, {
      method: body ? 'POST' : 'GET',
      cache: 'no-store',
      headers: { 'x-player-key': deviceKey(), ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw Object.assign(new Error('Topplistan svarade ' + res.status), { status: res.status });
    const data = await res.json();
    topList = (Array.isArray(data?.entries) ? data.entries : [])
      .filter(e => e && typeof e.name === 'string' && Number.isInteger(e.score))
      .slice(0, TOP);
    ownedNames = new Set(Array.isArray(data?.mine) ? data.mine : []);
    listMode = 'ready';
    giveMakerFigures();
    checkAccess();
  }
  // Hämtar listan på nytt; går det inte behålls den som redan hämtats.
  async function refreshBoard() {
    try { await scoresRequest(); } catch {
      if (listMode === 'loading') listMode = 'error';
      if (access === 'checking') access = 'no';
    }
  }
  refreshBoard();

  // Med en lista i EARLY får bara enheter som äger ett av namnen spela; alla andra ser
  // att spelet kommer snart. Med null får alla spela.
  const EARLY = null;
  let access = EARLY ? 'checking' : 'yes'; // checking, yes eller no
  function checkAccess() {
    if (access !== 'checking') return;
    access = EARLY.some(name => ownedNames.has(name)) ? 'yes' : 'no';
  }

  // Den som gör spelet har alla figurer: enheten som äger namnet MAKER på någon av
  // topplistorna. Flappy Game gör likadant, och figurerna är desamma i båda spelen.
  const MAKER = 'admin';
  function giveMakerFigures() {
    if (!ownedNames.has(MAKER)) return;
    const all = FIGURES.map(f => f.id);
    let bought = [];
    try { bought = JSON.parse(load('flappy-apa-upplasta') || '[]'); } catch {}
    if (!Array.isArray(bought)) bought = [];
    if (all.every(id => bought.includes(id))) return;
    store('flappy-apa-upplasta', JSON.stringify([...new Set([...bought, ...all])]));
    ownedIds = readOwned();
  }

  // Går listan inte att hämta går den inte heller att skriva in sig på.
  const qualifies = m => listMode === 'ready' && m > 0 && (topList.length < TOP || better(m, topList[TOP - 1].score));

  // ---------- Sakerna ----------

  // Saker att samla, som i Flappy Game. De sitter på väggen i spåren, och man tar dem
  // genom att klättra förbi. Värdet läggs till höjden som meter, utan att figuren
  // flyttas, och "+10" syns en stund. Blå mynt ger inga meter; de är Flappy Games och
  // köper figurer där. Vikterna summerar till 100 och styr hur vanlig varje sak är.
  const ITEMS = [
    { id: 'mynt', name: 'Mynt', value: 1, weight: 36, draw: drawCoin },
    { id: 'banan', name: 'Banan', value: 2, weight: 23, draw: drawBanana },
    { id: 'paket', name: 'Paket', value: 3, weight: 18, draw: drawPackage },
    { id: 'stjarna', name: 'Stjärna', value: 5, weight: 9, draw: drawStarItem },
    { id: 'diamant', name: 'Diamant', value: 10, weight: 4, draw: drawDiamond },
    { id: 'blamynt', name: 'Blått mynt', value: 0, weight: 10, draw: drawBlueCoin, currency: true },
  ];
  const ITEM_CHANCE = 0.7, BLUE = ITEMS.findIndex(it => it.currency);

  // Krafter att plocka upp, som i Flappy Game, ibland i stället för en sak. Skölden tar
  // en träff, magneten drar sakerna till figuren och slow motion saktar ner allt som
  // faller en stund. `left` är hur mycket som är kvar, från 1 ner till 0.
  const POWERS = [
    { id: 'skold', name: 'Sköld', draw: drawShieldIcon, take: () => { shield = true; }, left: () => (shield ? 1 : 0) },
    { id: 'magnet', name: 'Magnet', secs: 8, draw: drawMagnetIcon,
      take() { magnetUntil = time + this.secs; }, left() { return Math.max(0, magnetUntil - time) / this.secs; } },
    { id: 'slow', name: 'Slow motion', secs: 5, draw: drawSnailIcon,
      take() { slowUntil = time + this.secs; }, left() { return Math.max(0, slowUntil - time) / this.secs; } },
  ];
  const POWER_CHANCE = 0.12, SAFE_TIME = 1.2, SLOW = 0.55, MAGNET_R = 150, MAGNET_PULL = 520;
  function pickItem() {
    let r = Math.random() * 100;
    for (let i = 0; i < ITEMS.length; i++) { r -= ITEMS[i].weight; if (r < 0) return i; }
    return 0;
  }

  // ---------- Medaljerna ----------

  // Medaljer, som Flappy Games för poängen. I Climbing Game för hur högt man kommer i en
  // runda, vid 35, 70 och 120 m; den bästa man når räknas in i samlingen när man faller.
  // I Car Game för tiden på varvet, under 55, 47 och 41 sekunder (`at` i hundradelar).
  const MEDALS = [
    { id: 'brons', name: 'Bronsmedalj', at: CAR ? 5500 : 35, color: C.medals[2] },
    { id: 'silver', name: 'Silvermedalj', at: CAR ? 4700 : 70, color: C.medals[1] },
    { id: 'guld', name: 'Guldmedalj', at: CAR ? 4100 : 120, color: C.medals[0] },
  ];
  const medalCount = MEDALS.map(m => {
    try { return Math.max(0, Math.floor(Number(JSON.parse(load(`${GAME}-medaljer`) || '{}')[m.id]) || 0)); } catch { return 0; }
  });

  // ---------- Spelet ----------

  // ready (startskärmen) → playing → crashed (figuren faller eller bilen snurrar) →
  // over: rutan med hur långt man kom och rekordet, med knapparna Gå till startsidan och
  // Spela igen. `climbed` är hur långt man har kommit, uppför väggen eller längs vägen.
  let state = 'ready';
  let time = 0, overAt = 0, climbed = 0, nextSpawnAt = 0, nextMilestone = 0;
  let playerX = W / 2, playerY = PLAYER_Y, fallVy = 0, fallSpin = 0, spinV = 0;
  let obstacles = [], popups = [], startedAt = 0;
  // Car Game: farten, tiden för varvet i hundradelar, hur mycket bilen lutar när den
  // svänger, och de blå mynten på banan
  let carSpeed = 0, lapTime = 0, timeBonus = 0, steerTilt = 0, lastX = W / 2, raceItems = [];
  // de fyra motståndarna, när man senast krockade med en, och vilken plats man kom på
  let rivals = [], lastBump = -10, place = 0;
  // sakerna på väggen, vad som har hamnat i lådan den här rundan, och metrarna som
  // sakerna har gett
  let items = [], box = ITEMS.map(() => 0), nextItemAt = 0, bonus = 0;
  // världen figuren har klättrat in i den här rundan, och när den kom dit
  let worldStep = 0, worldShownAt = -10;
  // krafterna på väggen och de som verkar just nu; `safeUntil` är när figuren slutar
  // blinka efter att skölden tog en träff
  let powers = [], shield = false, magnetUntil = 0, slowUntil = 0, safeUntil = 0, flash = 0;
  // den bästa medaljen den här rundan (-1 för ingen), och när den kom
  let medal = -1, medalShownAt = -10;
  // 'figures', 'settings' eller 'scores' när en av startskärmens rutor är öppen
  let overlay = null;
  // rekordet: högst i Climbing Game, snabbast varv i Car Game (0 = inget än)
  const BEST_KEY = CAR ? 'car-tid' : `${GAME}-best`;
  let best = Math.max(0, Math.floor(Number(load(BEST_KEY)) || 0)), newBest = false;
  // den högsta världen man har nått, räknad från 0, som startskärmen visar uppe till höger
  let bestWorld = Math.max(0, Math.floor(Number(load(`${GAME}-varld`)) || 0));
  // raden man sparade på topplistan, och vilken plats den fick den här rundan
  let savedEntry = null, placed = 0;

  // hur långt man har kommit: det man har klättrat eller kört och det sakerna har gett
  const meters = () => Math.floor(climbed / METER) + bonus;
  // Poängen: i Climbing Game hur högt man kom, i meter, och i Car Game tiden för varvet
  // i hundradels sekunder, där lägst är bäst.
  const score = () => (CAR ? lapTime : meters());
  const better = (a, b) => (CAR ? a < b : a > b);
  const formatScore = v => (CAR ? `${(v / 100).toFixed(1).replace('.', ',')} s` : `${v} m`);
  const raceTime = () => Math.round((time - startedAt) * 100);

  // Det som skiljer spelen åt. `speed` är hur fort man kommer framåt, i pixlar per
  // sekund, `gap` hur långt det är till nästa hinder och `itemGap` till nästa sak.
  // `spawn`, `step` och `drawObstacles` sköter hindren: `step` flyttar dem och svarar
  // med det som träffade figuren. `crash` och `fall` är det som händer efter en krock,
  // tills `fall` säger att det är över.
  const TRACKS = {
    climbing: {
      title: 'Climbing Game', crashTitle: 'Du föll!', distanceLabel: 'DU KOM', worlds: true, milestone: 10,
      tip: 'Svep åt sidan eller håll på en sida för att flytta dig',
      // fortare ju högre man kommer, från 2 till 5,5 meter i sekunden, och tätare
      speed: () => 80 + Math.min(140, climbed / 40),
      gap: () => Math.max(120, 250 - climbed / 50),
      itemGap: () => 140 + Math.random() * 120,
      spawn: spawnDrops, step: stepDrops, drawObstacles: drawDrops, drawBackground: drawWall,
      drawPlayer: (x, y, playing) => drawClimber(x, y, { dead: !playing, back: playing }),
      drawHero: () => drawClimber(W / 2, 262 + Math.sin(time * 2) * 4, { size: 2.1, reach: Math.sin(time * 4), back: true }),
      crash() { fallVy = -320; },
      fall(dt) {
        fallVy += GRAVITY * dt;
        playerY += fallVy * dt;
        fallSpin += dt * 6;
        for (const f of obstacles) f.y += FALL * dt;
        return playerY > VY1 + 80;
      },
    },
    car: {
      title: 'Car Game', crashTitle: 'Mål!', distanceLabel: 'DIN TID', worlds: false, milestone: Infinity,
      tip: 'Håll fingret på skärmen för att köra\noch dra åt sidan för att styra',
      // bilen kör bara medan man trycker, fortare på banan och saktare på gräset
      // (stepRace), och inga hinder
      speed: () => carSpeed,
      gap: () => Infinity,
      itemGap: () => Infinity,
      spawn() {}, step: stepRace, drawObstacles: drawRaceCoins, drawBackground: drawCircuit,
      drawPlayer: (x, y) => drawF1(x, y, steerTilt),
      drawHero: () => {
        ctx.save();
        ctx.translate(W / 2, 285 + Math.sin(time * 2) * 3); ctx.scale(1.9, 1.9);
        drawF1(0, 0, Math.sin(time * 1.5) * 0.06);
        ctx.restore();
      },
      // det finns inga krockar, bara mål (finishRace)
      crash() {},
      fall: () => true,
    },
  };
  const TRACK = TRACKS[GAME];

  function reset() {
    state = 'playing'; climbed = 0; nextSpawnAt = CAR ? 300 : 200; nextMilestone = TRACK.milestone;
    playerX = W / 2; playerY = PLAYER_Y; fallVy = 0; fallSpin = 0; spinV = 0;
    obstacles = []; popups = []; newBest = false; placed = 0; startedAt = time;
    carSpeed = 0; lapTime = 0; timeBonus = 0; steerTilt = 0; lastX = W / 2; place = 0;
    raceItems = CAR ? placeRaceItems() : [];
    rivals = CAR ? placeRivals() : [];
    // i Car Game börjar man bakom startlinjen, och klockan går först efter nedräkningen
    if (CAR) { climbed = START_BEHIND; startedAt = time + COUNTDOWN; }
    medal = -1; medalShownAt = -10;
    items = []; box = ITEMS.map(() => 0); nextItemAt = 120; bonus = 0;
    worldStep = 0; worldShownAt = -10;
    powers = []; shield = false; magnetUntil = slowUntil = safeUntil = 0; flash = 0;
    holds.clear(); drags.clear(); pedals.clear(); swipeTarget = null;
  }

  // Medan man håller på vänster eller höger sida glider figuren åt det hållet. Ett
  // tryck flyttar den genast en liten bit, så att också ett kort tryck märks.
  // `holds` är fingrar och tangenter som håller just nu, med sitt håll.
  //
  // Sveper fingret åt sidan i stället följer figuren med, långsammare än fingret: den
  // ska en bit kortare än fingret har svept (SWIPE_FOLLOW) och glider dit mjukt
  // (SWIPE_EASE). `drags` är fingrarna som ligger mot skärmen: var de började, och från
  // var de styr figuren när de har börjat svepa. `swipeTarget` är dit figuren glider.
  const holds = new Map(), drags = new Map();
  // I Car Game kör bilen bara medan man trycker: ett finger mot skärmen, eller pil upp,
  // W eller mellanslag. `pedals` är tangenterna som gasar just nu.
  const pedals = new Set();
  const gas = () => drags.size > 0 || pedals.size > 0;
  const SWIPE = 6; // så många pixlar fingret ska röra sig innan det räknas som ett svep
  const SWIPE_FOLLOW = 0.6, SWIPE_EASE = 6.5;
  let swipeTarget = null;
  const steering = () => { let d = 0; for (const dir of holds.values()) d += dir; return Math.sign(d); };
  const clampX = x => Math.max(MIN_X, Math.min(MAX_X, x));
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
      // nu sveper fingret: det slutar glida och flyttar figuren från där den är
      d.swiping = true; d.fromClientX = e.clientX; d.fromX = playerX;
      holds.delete(e.pointerId);
    }
    swipeTarget = clampX(d.fromX + (e.clientX - d.fromClientX) / scale * SWIPE_FOLLOW);
  }

  function crash() {
    state = 'crashed'; TRACK.crash();
    play('crash', 0.8);
    if (meters() > best) { best = meters(); newBest = true; store(BEST_KEY, best); }
    if (worldStep > bestWorld) { bestWorld = worldStep; store(`${GAME}-varld`, bestWorld); }
    if (medal >= 0) {
      medalCount[medal]++;
      store(`${GAME}-medaljer`, JSON.stringify(Object.fromEntries(MEDALS.map((m, i) => [m.id, medalCount[i]]))));
    }
    // så att listan är färsk när fallet är över och det avgörs om man kom in på den
    refreshBoard();
  }

  function landed() {
    state = 'over'; overAt = time;
    // hindren står inte stilla bakom rutan
    obstacles = []; items = []; powers = [];
    if (newBest) play('fanfare', 0.45);
    saveResult();
  }

  function enterWorld() {
    worldShownAt = time;
    store('flappy-apa-blamynt', blueCoins() + WORLD_BONUS);
    box[BLUE] += WORLD_BONUS;
    play('chime', 0.7);
  }

  function spawnPower() {
    powers.push({ kind: Math.floor(Math.random() * POWERS.length), x: randomX(), y: VY0 - 30, phase: Math.random() * 6 });
  }

  function takePower(it) {
    const pw = POWERS[it.kind];
    it.taken = true;
    pw.take();
    popups.push({ text: pw.name + '!', at: time, x: it.x, y: playerY - 50, color: C.white, size: 18 });
    play('chime', 0.7);
  }

  // Skölden tar en träff: figuren blinkar en stund och kan inte träffas under tiden.
  function survives() {
    if (time < safeUntil) return true;
    if (!shield) return false;
    shield = false; safeUntil = time + SAFE_TIME; flash = 0.6;
    popups.push({ text: 'Skölden höll!', at: time, x: playerX, y: playerY - 60, color: C.blue, size: 18 });
    play('swish', 0.6);
    return true;
  }

  // Magneten drar en sak som är nära mot figuren.
  function pull(it, dt) {
    if (time >= magnetUntil) return;
    const dx = playerX - it.x, dy = playerY - 8 - it.y, d = Math.hypot(dx, dy);
    if (d < MAGNET_R && d > 1) { const step = Math.min(d, MAGNET_PULL * dt); it.x += dx / d * step; it.y += dy / d * step; }
  }

  function spawnItem() {
    items.push({ kind: pickItem(), x: randomX(), y: VY0 - 30, phase: Math.random() * 6 });
  }

  function collect(it) {
    const item = ITEMS[it.kind], x = it.x;
    it.taken = true;
    box[it.kind]++;
    if (item.currency) {
      // läses om först, ifall Flappy Game har ändrat kassan under tiden
      store('flappy-apa-blamynt', Math.max(0, Math.floor(Number(load('flappy-apa-blamynt')) || 0)) + 1);
      popups.push({ text: '+1 blått mynt', at: time, x, y: playerY - 50, color: C.blue, size: 16 });
      play('collect', 0.6, 1.3);
      return;
    }
    bonus += item.value;
    popups.push({ text: `+${item.value}`, at: time, x, y: playerY - 50, life: 2, size: 30 });
    play('collect', 0.6, 1 + item.value * 0.04);
  }

  // Climbing Games hinder: det som faller, och som hör till världen högst upp på skärmen.
  function spawnDrops() {
    const [first, second] = worldAt(climbed + PLAYER_Y - VY0).drops;
    const kind = Math.random() < 0.6 ? first : second;
    const x = randomX();
    obstacles.push({ kind, x, y: VY0 - 40, spin: Math.random() * 6 });
    // ibland faller två saker samtidigt, en bra bit ifrån varandra
    if (climbed > 1200 && Math.random() < 0.3) {
      let other = randomX();
      while (Math.abs(other - x) < 110) other = randomX();
      obstacles.push({ kind: kind === first ? second : first, x: other, y: VY0 - 90, spin: Math.random() * 6 });
    }
  }
  function stepDrops(t, v) {
    let hit = null;
    for (const f of obstacles) {
      f.y += (FALL + v) * t;
      f.spin += t * 4;
      const dx = f.x - playerX, dy = f.y - (playerY - 4);
      if (!hit && !f.gone && dx * dx + dy * dy < (HIT + 13) ** 2) hit = f;
    }
    obstacles = obstacles.filter(f => f.y < VY1 + 60 && !f.gone);
    return hit;
  }

  function update(dt) {
    time += dt;
    flash = Math.max(0, flash - dt * 2);
    if (state === 'playing') {
      // slow motion saktar ner väggen och det som faller, men inte fingret som styr
      const t = time < slowUntil ? dt * SLOW : dt;
      const v = TRACK.speed();
      climbed += v * t;
      // en bil som står still glider inte åt sidan
      playerX = clampX(playerX + steering() * STEER * dt * (CAR ? Math.min(1, carSpeed / 200) : 1));
      if (swipeTarget !== null) {
        playerX += (swipeTarget - playerX) * Math.min(1, dt * SWIPE_EASE);
        // när fingret har släppt och figuren har kommit fram slutar den glida
        if (!drags.size && Math.abs(swipeTarget - playerX) < 0.5) swipeTarget = null;
      }
      if (climbed >= nextSpawnAt) { TRACK.spawn(); nextSpawnAt = climbed + TRACK.gap(); }
      if (climbed >= nextItemAt) {
        if (Math.random() < POWER_CHANCE) spawnPower();
        else if (Math.random() < ITEM_CHANCE) spawnItem();
        nextItemAt = climbed + TRACK.itemGap();
      }
      const near = it => Math.abs(it.x - playerX) < 26 && Math.abs(it.y - (playerY - 8)) < 26;
      for (const it of items) {
        it.y += v * t;
        pull(it, dt);
        if (near(it)) collect(it);
      }
      items = items.filter(it => !it.taken && it.y < VY1 + 40);
      for (const it of powers) {
        it.y += v * t;
        if (near(it)) takePower(it);
      }
      powers = powers.filter(it => !it.taken && it.y < VY1 + 40);
      // ett hinder som träffar: skölden tar det, eller så krockar man
      const hit = TRACK.step(t, v);
      if (hit) { if (survives()) hit.gone = true; else crash(); }
      if (TRACK.worlds) while (Math.floor(climbed / WORLD_SPAN) > worldStep) { worldStep++; enterWorld(); }
      // en medalj när höjden når nästa gräns; flera på en gång ger bara den högsta. I Car
      // Game kommer medaljen i mål.
      let m = medal;
      while (!CAR && m + 1 < MEDALS.length && meters() >= MEDALS[m + 1].at) m++;
      if (m !== medal) { medal = m; medalShownAt = time; play('fanfare', 0.5); }
      // var tionde meter (var hundrade i bilen), utom där en ny värld säger det själv
      if (meters() >= nextMilestone) {
        if (!TRACK.worlds || nextMilestone % WORLD_METERS) { popups.push({ text: `${nextMilestone} m!`, at: time }); play('score', 0.5); }
        nextMilestone += TRACK.milestone;
      }
    } else if (state === 'crashed') {
      if (TRACK.fall(dt)) landed();
    }
    popups = popups.filter(p => time - p.at < (p.life ?? 1.2));
  }

  // ---------- Racet i Car Game ----------

  // Banan är en sluten slinga, räknad från en jämn kurva och utsträckt så att ett varv
  // är LAP pixlar. CIRCUIT har en punkt var STEP:e pixel längs banans mitt, med
  // riktningen där; vägen framför bilen ritas utifrån dem, och kartan visar hela slingan.
  const LAP = 16000, STEP = 20, ROADW = 190, ROAD_SPEED = 440, GRASS_SPEED = 160;
  const CIRCUIT = (() => {
    const raw = [];
    for (let i = 0; i <= 2400; i++) {
      const t = i / 2400 * Math.PI * 2;
      raw.push([Math.cos(t) + 0.28 * Math.cos(2 * t) - 0.12 * Math.sin(3 * t), 0.62 * Math.sin(t) + 0.18 * Math.sin(2 * t)]);
    }
    let total = 0;
    const acc = [0];
    for (let i = 1; i < raw.length; i++) { total += Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]); acc.push(total); }
    const k = LAP / total, n = LAP / STEP, pts = [];
    let j = 0;
    for (let i = 0; i < n; i++) {
      const want = i / n * total;
      while (acc[j + 1] < want) j++;
      const f = (want - acc[j]) / (acc[j + 1] - acc[j]);
      pts.push({ x: (raw[j][0] + (raw[j + 1][0] - raw[j][0]) * f) * k, y: (raw[j][1] + (raw[j + 1][1] - raw[j][1]) * f) * k });
    }
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; a.dir = Math.atan2(b.y - a.y, b.x - a.x); }
    return pts;
  })();
  const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
  // en punkt på banans mitt `s` pixlar från start, med riktningen där
  function trackAt(s) {
    const n = CIRCUIT.length, f = ((s / STEP) % n + n) % n, i = Math.floor(f), u = f - i;
    const a = CIRCUIT[i], b = CIRCUIT[(i + 1) % n];
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, dir: a.dir + wrapAngle(b.dir - a.dir) * u };
  }
  // en punkt `lat` pixlar till höger om banans mitt (till vänster om den är negativ)
  function trackPoint(s, lat) {
    const p = trackAt(s);
    return [p.x - Math.sin(p.dir) * lat, p.y + Math.cos(p.dir) * lat];
  }
  // hur mycket banan svänger här, i radianer per pixel; positivt åt höger
  const curveAt = s => wrapAngle(trackAt(s + 40).dir - trackAt(s - 40).dir) / 80;
  // En punkt på kartan, sedd från bilen: banan där bilen är pekar alltid uppåt.
  function toScreen([px, py], me) {
    const dx = px - me.x, dy = py - me.y, c = Math.cos(me.dir), sn = Math.sin(me.dir);
    return [W / 2 - dx * sn + dy * c, PLAYER_Y - (dx * c + dy * sn)];
  }

  // Sakerna på banan, samma som i de andra spelen men med mest paket. Varje sak man kör
  // över drar av tid från varvet, en tiondels sekund per poäng (en diamant en hel
  // sekund), och ett blått mynt går till kassan. Ibland ligger tre i en rad tvärs över
  // banan, så att man får välja.
  const RACE_WEIGHTS = { mynt: 22, banan: 15, paket: 33, stjarna: 10, diamant: 5, blamynt: 15 };
  const RACE_KINDS = ITEMS.flatMap((it, i) => Array(RACE_WEIGHTS[it.id] ?? 0).fill(i));
  const RACE_PICK = () => RACE_KINDS[Math.floor(Math.random() * RACE_KINDS.length)];
  function placeRaceItems() {
    const out = [];
    for (let at = 700; at < LAP - 400; at += 260 + Math.random() * 220) {
      if (Math.random() < 0.25) {
        for (const lat of [-62, 0, 62]) out.push({ s: at, lat, kind: RACE_PICK() });
      } else {
        out.push({ s: at, lat: (Math.random() - 0.5) * (ROADW - 70), kind: RACE_PICK() });
      }
    }
    return out;
  }

  // Fyra motståndare som kör samma varv, var och en med sin färg, sin förare och sin
  // fart. De står framför en på startplattan, så att man måste köra om dem; de saktar
  // in i kurvorna och byter fil ibland. Man börjar START_BEHIND bakom startlinjen, och
  // nedräkningen tar COUNTDOWN sekunder.
  const RIVALS = [
    { color: '#2f80ed', dark: '#1a4f99', top: 418 },
    { color: '#2bb673', dark: '#1a7f50', top: 406 },
    { color: '#ff9f1c', dark: '#c76f00', top: 396 },
    { color: '#9b6dff', dark: '#6a43c4', top: 384 },
  ];
  const START_BEHIND = -280, COUNTDOWN = 2.4;
  function placeRivals() {
    const drivers = FIGURES.map((_, i) => i).filter(i => i !== figure && !FIGURES[i].gift).sort(() => Math.random() - 0.5);
    return RIVALS.map((r, k) => ({
      ...r, fig: drivers[k], number: String(k + 2),
      s: -70 * k, lat: (k % 2 ? 1 : -1) * 42, wantLat: (k % 2 ? 1 : -1) * 42, speed: 0, done: false,
    }));
  }
  function stepRivals(t) {
    const lane = playerX - W / 2;
    for (const r of rivals) {
      const target = r.top * (1 - Math.min(0.25, Math.abs(curveAt(r.s)) * 160));
      r.speed += (target - r.speed) * Math.min(1, t * 0.8);
      r.s += r.speed * t;
      r.lat += (r.wantLat - r.lat) * Math.min(1, t * 1.5);
      if (Math.random() < t * 0.3) r.wantLat = (Math.random() - 0.5) * (ROADW - 70);
      if (!r.done && r.s >= LAP) r.done = true;
      // en krock: bilen tappar fart och knuffas isär från motståndaren
      if (Math.abs(r.s - climbed) < 62 && Math.abs(r.lat - lane) < 34) {
        const side = Math.sign(lane - r.lat) || 1;
        carSpeed = Math.min(carSpeed, r.speed * 0.8);
        shiftCar(side * 4);
        r.lat -= side * 2;
        if (time - lastBump > 0.5) { play('crash', 0.3, 1.4); lastBump = time; }
      }
    }
  }
  // platsen just nu: en plus de motståndare som ligger före
  const racePlace = () => 1 + rivals.filter(r => r.s > climbed).length;
  const ordinal = n => `${n}:${n === 1 || n === 2 ? 'a' : 'e'}`;

  // Flyttar bilen åt sidan utan att fingret gör det, i en kurva eller en krock. Det som
  // fingret styr mot flyttar med, annars drog svepet tillbaka bilen och kurvan märktes
  // inte.
  function shiftCar(dx) {
    playerX = clampX(playerX + dx);
    if (swipeTarget !== null) swipeTarget = clampX(swipeTarget + dx);
    for (const d of drags.values()) if (d.swiping) d.fromX += dx;
  }

  // Bilen kör bara medan man trycker, fortare på banan och saktare på gräset; släpper
  // man rullar den ut och stannar (BRAKE). I kurvorna drar den utåt, så att man måste
  // styra emot, och den lutar lite åt det håll den svänger.
  const BRAKE = 320;
  function stepRace(t) {
    // under nedräkningen står alla stilla
    if (time < startedAt) { carSpeed = 0; return null; }
    stepRivals(t);
    const lane = playerX - W / 2, onRoad = Math.abs(lane) < ROADW / 2 - 6;
    if (gas()) carSpeed += ((onRoad ? ROAD_SPEED : GRASS_SPEED) - carSpeed) * Math.min(1, t * (onRoad ? 0.8 : 2.5));
    else carSpeed = Math.max(0, carSpeed - BRAKE * t * (onRoad ? 1 : 1.6));
    shiftCar(-curveAt(climbed) * carSpeed * carSpeed * 0.28 * t);
    if (t > 0) steerTilt += (Math.max(-0.35, Math.min(0.35, (playerX - lastX) / t * 0.0025)) - steerTilt) * Math.min(1, t * 10);
    lastX = playerX;
    for (const it of raceItems) {
      if (Math.abs(it.s - climbed) < 30 && Math.abs(it.lat - (playerX - W / 2)) < 28) collectRaceItem(it);
    }
    raceItems = raceItems.filter(it => !it.taken && it.s > climbed - 300);
    if (climbed >= LAP) finishRace();
    return null;
  }

  // tiden på klockan: hur länge man har kört, minus det sakerna har dragit av
  const lapClock = () => Math.max(0, raceTime() - timeBonus);
  const seconds = cs => (cs / 100).toFixed(1).replace('.', ',');

  function collectRaceItem(it) {
    const item = ITEMS[it.kind];
    it.taken = true;
    box[it.kind]++;
    if (item.currency) {
      store('flappy-apa-blamynt', blueCoins() + 1);
      popups.push({ text: '+1 blått mynt', at: time, x: playerX, y: PLAYER_Y - 60, color: C.blue, size: 16 });
      play('collect', 0.6, 1.3);
      return;
    }
    timeBonus += item.value * 10;
    popups.push({ text: `−${seconds(item.value * 10)} s`, at: time, x: playerX, y: PLAYER_Y - 60, life: 1.6, size: 26 });
    play('collect', 0.6, 1 + item.value * 0.04);
  }

  // I mål: tiden, rekordet och medaljen, och sedan rutan. Listan hämtas först, så att det
  // går att avgöra om tiden kom in på den.
  function finishRace() {
    lapTime = Math.max(1, raceTime() - timeBonus);
    place = 1 + rivals.filter(r => r.done).length;
    climbed = LAP;
    state = 'over'; overAt = time;
    if (!best || lapTime < best) { best = lapTime; newBest = true; store(BEST_KEY, best); }
    medal = -1;
    MEDALS.forEach((m, i) => { if (lapTime <= m.at) medal = i; });
    if (medal >= 0) {
      medalCount[medal]++;
      store(`${GAME}-medaljer`, JSON.stringify(Object.fromEntries(MEDALS.map((m, i) => [m.id, medalCount[i]]))));
    }
    play(newBest || medal >= 0 || place === 1 ? 'fanfare' : 'chime', 0.5);
    refreshBoard().then(saveResult);
  }

  // ---------- Topplistan efter ett fall ----------

  // Kommer man in på topplistan sparas resultatet av sig självt, under namnet man
  // valde första gången (public/player.js). Utan namn sparas inget.
  async function saveResult() {
    const name = window.player?.name?.(), result = score();
    if (!name || !qualifies(result)) return;
    try {
      await scoresRequest({ name, score: result, figure: FIGURES[figure].id });
      savedEntry = topList.find(e => nameKey(e.name) === nameKey(name) && e.score === result) ?? null;
      placed = savedEntry ? topList.indexOf(savedEntry) + 1 : 0;
      if (placed) play('chime', 0.6);
    } catch {}
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
  function ovalEdge(x, y, rx, ry, color, edge, rot = 0) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
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

  // ---------- Figurerna ----------

  // Alla Flappy Games figurer, ritade som klättrare: utan vingar, med armar och långa
  // ben. Uppe på väggen syns de bakifrån, med ansiktet mot väggen; i rutorna och när de
  // faller syns de framifrån. Man klättrar med de figurer man har i Flappy Game.
  //
  // Armar, ben och kropp är gemensamma. Varje figur ger sina färger och sina delar:
  //   behind  bakom huvudet, åt båda hållen: öron, horn, antenner, man
  //   skull   huvudets form (en oval om inget annat sägs)
  //   face    ansiktet, bara framifrån
  //   nape    bakhuvudet, bara bakifrån: hår, mönster
  //   over    ovanpå huvudet, åt båda hållen: hattar, kronor, öron som hänger
  //   tail    bakom kroppen framifrån och framför den bakifrån
  //   shell   det som sitter på ryggen: bakom allt framifrån, över kroppen bakifrån
  //   body    kroppen, om den inte är en vanlig oval
  // Med `edge` får lemmar och kropp en kontur, så att en ljus figur syns mot väggen.
  const FIGURES = [
    { id: 'enhorning', name: 'Enhörning', fur: '#fdfbff', dark: '#a993cf', light: '#ffe3ee', edge: '#a993cf', hooves: true, skull: { rx: 14 }, behind: unicornBehind, face: unicornFace, nape: unicornNape, tail: unicornTail },
    { id: 'dinosaurie', name: 'Dinosaurie', fur: '#6ccf5f', dark: '#3f9a45', light: '#e9f7b8', hand: '#6ccf5f', skull: { rx: 15 }, behind: dinoBehind, face: dinoFace, body: dinoBody, tail: dinoTail },
    { id: 'hund', name: 'Hund', fur: '#d9a066', dark: '#9b6235', light: '#f7e6c8', face: dogFace, over: dogEars, tail: dogTail },
    { id: 'apa', name: 'Apa', fur: '#8a5a2b', dark: '#6b4220', light: '#f1d0a5', skull: { rx: 15, ry: 14 }, behind: monkeyEars, face: monkeyFace, tail: monkeyTail },
    { id: 'astronaut', name: 'Astronaut', fur: '#f3f5f8', dark: '#5f6b77', light: '#a7b1bc', edge: '#7f8b98', fingers: false, skull: { rx: 15.5, ry: 14.5, y: -7 }, behind: astroAntenna, face: astroFace, body: astroBody },
    { id: 'pingvin', name: 'Pingvin', fur: '#232a3d', dark: '#ff9f1c', light: '#ffffff', edge: '#5b6787', hand: '#232a3d', fingers: false, skull: { rx: 14 }, face: penguinFace, over: penguinCap },
    { id: 'blackfisk', name: 'Bläckfisk', fur: '#ff7aa8', dark: '#e0568a', light: '#ffc2d6', hand: '#ff7aa8', fingers: false, belly: null, skull: { rx: 15, ry: 16, y: -9 }, face: octoFace, over: octoSpots, tail: octoArms },
    { id: 'bi', name: 'Bi', fur: '#ffd23f', dark: '#2a2a2a', light: '#ffd23f', edge: '#b58e00', limbEdge: null, arm: '#2a2a2a', leg: '#2a2a2a', hand: '#2a2a2a', fingers: false, armW: 4.5, skull: { rx: 13.5, ry: 12.5 }, behind: beeAntennae, face: beeFace, body: beeBody, tail: beeSting },
    { id: 'drake', name: 'Drake', fur: '#e8503a', dark: '#b5321f', light: '#ffd29a', hand: '#e8503a', behind: dragonHorns, face: dragonFace, body: dragonBody, tail: dragonTail },
    { id: 'katt', name: 'Katt', fur: '#f4a259', dark: '#c96f24', light: '#fff0dc', skull: { ry: 12.5 }, behind: catEars, face: catFace, nape: catNape, tail: catTail },
    { id: 'spoke', name: 'Spöke', fur: '#f8f8ff', dark: '#a9a9d6', light: '#f8f8ff', edge: '#a9a9d6', fingers: false, legs: false, skull: { rx: 14, ry: 14 }, face: ghostFace, body: ghostBody },
    { id: 'groda', name: 'Groda', fur: '#5cc35a', dark: '#3e9a3c', light: '#e3f7b5', hand: '#5cc35a', skull: { rx: 16, ry: 11, y: -5 }, behind: frogBumps, face: frogFace },
    { id: 'paskhare', name: 'Påskhare', fur: '#f2e6da', dark: '#b9a28c', light: '#ffffff', edge: '#b9a28c', skull: { rx: 14, ry: 12.5 }, behind: hareEars, face: hareFace, tail: hareTail },
    { id: 'tomte', name: 'Jultomte', fur: '#d62839', dark: '#2a2a2a', light: '#ffd6b8', hand: '#2a2a2a', fingers: false, skull: { rx: 12.5, ry: 12, color: '#ffd6b8' }, face: tomteFace, nape: tomteNape, over: tomteHat, body: tomteBody },
    { id: 'pumpa', name: 'Pumpa', fur: '#6cbf3a', dark: '#3f8a24', light: '#6cbf3a', hand: '#6cbf3a', fingers: false, skull: pumpkinSkull, behind: pumpkinStem, face: pumpkinFace, body: pumpkinBody },
    { id: 'sol', name: 'Sol', fur: '#ffb800', dark: '#f5a300', light: '#ffd23f', skull: { rx: 15, ry: 15, color: '#ffd23f', edge: '#f5a300' }, behind: sunRays, face: sunFace },
    { id: 'superhjalte', name: 'Superhjälte', fur: '#2f6fd6', dark: '#e63946', light: '#ffd6b8', hand: '#e63946', fingers: false, skull: { rx: 12.5, ry: 12.5, color: '#ffd6b8' }, face: heroFace, nape: heroNape, over: heroHair, body: heroBody, shell: heroCape },
    { id: 'panda', name: 'Panda', fur: '#ffffff', dark: '#22252b', light: '#ffffff', edge: '#b9c2cc', limbEdge: null, arm: '#22252b', leg: '#22252b', hand: '#22252b', fingers: false, belly: null, behind: pandaEars, face: pandaFace },
    { id: 'uggla', name: 'Uggla', fur: '#8b6a4f', dark: '#f5a300', light: '#d9c09a', skull: { rx: 15, ry: 13.5 }, behind: owlTufts, face: owlFace, nape: owlNape },
    { id: 'robot', name: 'Robot', fur: '#b8c4d0', dark: '#4a5563', light: '#7d8a97', edge: '#4a5563', hand: '#7d8a97', fingers: false, skull: robotSkull, behind: robotAntenna, face: robotFace, nape: robotNape, body: robotBody },
    { id: 'lejon', name: 'Lejon', fur: '#e8a849', dark: '#b5652a', light: '#f7d9a8', skull: { rx: 12.5, ry: 11.5 }, behind: lionMane, face: lionFace, nape: lionNape, tail: lionTail },
    { id: 'ko', name: 'Ko', fur: '#ffffff', dark: '#2a2a2a', light: '#ffb6c1', edge: '#9a9a9a', hooves: true, skull: { rx: 14 }, behind: cowHorns, face: cowFace, nape: cowNape, body: cowBody, tail: cowTail },
    { id: 'kamel', name: 'Kamel', fur: '#d8a35d', dark: '#a87636', light: '#ecc58f', hooves: true, skull: { rx: 11.5, ry: 12, y: -8 }, behind: camelEars, face: camelFace, over: camelTuft, shell: camelHump },
    { id: 'alien', name: 'Rymdvarelse', fur: '#7ee081', dark: '#4fb357', light: '#b8f0b0', hand: '#7ee081', skull: { rx: 15, ry: 14.5, y: -8 }, behind: alienAntennae, face: alienFace },
    { id: 'prinsessa', name: 'Prinsessa', fur: '#ffd9c2', dark: '#e0569e', light: '#ffd9c2', edge: '#e0a98c', fingers: false, skull: { rx: 12, ry: 12 }, face: princessFace, nape: princessNape, over: princessTiara, body: princessDress, shell: princessHair },
    { id: 'rav', name: 'Räv', fur: '#f07f2e', dark: '#3a2a20', light: '#fff4e6', hand: '#3a2a20', fingers: false, skull: { ry: 12.5 }, behind: foxEars, face: foxFace, tail: foxTail },
    { id: 'gris', name: 'Gris', fur: '#ffb3c6', dark: '#e07a98', light: '#ff9cbb', edge: '#e07a98', hooves: true, behind: pigEars, face: pigFace, tail: pigTail },
    { id: 'elefant', name: 'Elefant', fur: '#a9b4c2', dark: '#6f7b8a', light: '#c3ccd8', fingers: false, skull: { rx: 13, ry: 12.5, y: -7 }, behind: elephantEars, face: elephantFace, tail: thinTail },
    { id: 'giraff', name: 'Giraff', fur: '#f6c445', dark: '#a4621a', light: '#f2d79b', hooves: true, lift: 8, neck: giraffeNeck, skull: { rx: 11, ry: 12, y: -7 }, behind: giraffeHorns, face: giraffeFace, over: giraffeSpots, body: giraffeBody, tail: thinTail },
    { id: 'krokodil', name: 'Krokodil', fur: '#5fae4e', dark: '#3c7a32', light: '#d6e8a0', skull: { rx: 14, ry: 10, y: -7 }, behind: crocBumps, face: crocFace, nape: crocNape, body: crocBody, tail: crocTail },
    { id: 'haj', name: 'Haj', fur: '#6c8fb3', dark: '#3f5f80', light: '#eef4fa', hand: '#6c8fb3', fingers: false, behind: sharkFin, face: sharkFace, nape: sharkGills, tail: sharkTail },
    { id: 'delfin', name: 'Delfin', fur: '#59a8e8', dark: '#2f78b8', light: '#dff1ff', hand: '#59a8e8', fingers: false, skull: { rx: 14, ry: 12.5, y: -7 }, behind: dolphinFin, face: dolphinFace, nape: dolphinBlowhole, tail: dolphinTail },
    { id: 'skoldpadda', name: 'Sköldpadda', fur: '#a7d17a', dark: '#6f9e4a', light: '#e8dc9a', edge: '#6f9e4a', hand: '#a7d17a', skull: { rx: 12.5, ry: 11.5 }, face: turtleFace, body: turtleBody, shell: turtleShell },
    { id: 'nyckelpiga', name: 'Nyckelpiga', fur: '#22252b', dark: '#22252b', light: '#22252b', fingers: false, armW: 4.5, skull: { rx: 12.5, ry: 11.5 }, behind: ladybugAntennae, face: ladybugFace, body: ladybugBody },
    { id: 'papegoja', name: 'Papegoja', fur: '#e63946', dark: '#555b66', light: '#ffd23f', belly: '#ff6b6b', hand: '#2f80ed', fingers: false, skull: { rx: 14 }, behind: parrotTuft, face: parrotFace, shell: parrotFeathers },
    { id: 'flamingo', name: 'Flamingo', fur: '#ff8fb8', dark: '#e0568a', light: '#ffc2d8', leg: '#e0568a', hand: '#ff8fb8', fingers: false, lift: 8, neck: flamingoNeck, skull: { rx: 12, ry: 11.5, y: -7 }, face: flamingoFace, tail: flamingoTail },
    { id: 'tiger', name: 'Tiger', fur: '#ff9a2e', dark: '#2a1d16', light: '#fff4e6', foot: '#fff4e6', skull: { ry: 12.5 }, behind: tigerEars, face: tigerFace, nape: tigerNape, body: tigerBody, tail: tigerTail },
    { id: 'koala', name: 'Koala', fur: '#9aa5b1', dark: '#6b7682', light: '#dfe5ea', skull: { rx: 14, ry: 12.5 }, behind: koalaEars, face: koalaFace },
    { id: 'igelkott', name: 'Igelkott', fur: '#b8946a', dark: '#4f3620', light: '#f3dcb4', hand: '#e9c99a', skull: { rx: 12, ry: 11, y: -5, color: '#e9c99a' }, behind: hedgehogEars, face: hedgehogFace, nape: hedgehogNape, shell: hedgehogSpikes },
    { id: 'alg', name: 'Älg', fur: '#8a5a3a', dark: '#5e3a22', light: '#a8784f', hooves: true, skull: { rx: 11, ry: 12, y: -7 }, behind: mooseAntlers, face: mooseFace, body: mooseBody },
    { id: 'kyckling', name: 'Kyckling', fur: '#ffe066', dark: '#ff9f1c', light: '#fff3a8', leg: '#ff9f1c', hand: '#ffe066', fingers: false, skull: { rx: 14 }, face: chickFace, over: chickShell, tail: chickTail },
    { id: 'fladdermus', name: 'Fladdermus', fur: '#5a4370', dark: '#2e2040', light: '#7a5f94', hand: '#2e2040', fingers: false, skull: { rx: 13.5, ry: 12.5 }, behind: batEars, face: batFace },
    { id: 'pirat', name: 'Pirat', fur: '#ffffff', dark: '#1d1d1d', light: '#ffd6b8', leg: '#2a2a33', fingers: false, skull: { rx: 12.5, ry: 12.5, color: '#ffd6b8', edge: '#e0a98c' }, face: pirateFace, nape: pirateNape, over: pirateBandana, body: pirateBody },
    { id: 'ninja', name: 'Ninja', fur: '#2a2d3a', dark: '#15161d', light: '#2a2d3a', fingers: false, skull: { rx: 13.5 }, face: ninjaFace, over: ninjaBand, body: ninjaBody },
    { id: 'riddare', name: 'Riddare', fur: '#c3ccd6', dark: '#7d8896', light: '#eef2f6', edge: '#7d8896', fingers: false, skull: knightHelmet, behind: knightPlume, face: knightFace, nape: knightNape, body: knightBody },
    { id: 'trollkarl', name: 'Trollkarl', fur: '#3b4fc4', dark: '#8a5a2b', light: '#ffd6b8', leg: '#24318a', fingers: false, skull: { rx: 12, ry: 12, color: '#ffd6b8', edge: '#e0a98c' }, face: wizardFace, nape: wizardNape, over: wizardHat, body: wizardRobe },
    { id: 'haxa', name: 'Häxa', fur: '#7b3fb8', dark: '#2a1f3a', light: '#c8f0a8', leg: '#2a1f3a', fingers: false, skull: { rx: 12, ry: 12, color: '#c8f0a8', edge: '#7fb85a' }, behind: witchHair, face: witchFace, nape: witchNape, over: witchHat, body: witchDress },
    { id: 'sjojungfru', name: 'Sjöjungfru', fur: '#ffd9c2', dark: '#1a7f70', light: '#ffd9c2', fingers: false, legs: false, skull: { rx: 12, ry: 12, edge: '#e0a98c' }, face: mermaidFace, nape: mermaidNape, over: mermaidStar, body: mermaidBody, shell: mermaidHair },
    { id: 'snogubbe', name: 'Snögubbe', fur: '#6b4423', dark: '#6b4423', light: '#ffffff', armW: 2.6, twig: true, legs: false, skull: { rx: 12, ry: 11.5, color: '#ffffff', edge: '#b9c8dc' }, face: snowmanFace, over: snowmanHat, body: snowmanBody },
    // åtta egna hjältar, med egna krafter; de kostar 75 blå mynt var
    { id: 'natkastaren', name: 'Nätkastaren', price: 75, fur: '#2bb673', dark: '#1d1d1d', light: '#2bb673', hand: '#1a7f50', fingers: false, face: webFace, nape: webNape, body: webBody },
    { id: 'plathjalten', name: 'Plåthjälten', price: 75, fur: '#c3ccd6', dark: '#2f6fd6', light: '#c3ccd6', edge: '#5f6b77', fingers: false, face: ironFace, nape: ironNape, body: ironBody },
    { id: 'stenjatten', name: 'Stenjätten', price: 75, fur: '#8a8f98', dark: '#5c6068', light: '#a4a9b2', armW: 8, skull: { rx: 15.5, ry: 13.5 }, face: stoneFace, nape: stoneNape, body: stoneBody },
    { id: 'nattkatten', name: 'Nattkatten', price: 75, fur: '#1d2450', dark: '#ffd23f', light: '#1d2450', foot: '#0f1430', behind: nightEars, face: nightFace, body: nightBody },
    { id: 'askflickan', name: 'Åskflickan', price: 75, fur: '#7b3fb8', dark: '#ffd23f', light: '#ffd6b8', hand: '#ffd23f', fingers: false, skull: { rx: 12.5, ry: 12.5, color: '#ffd6b8' }, face: thunderFace, nape: thunderNape, body: thunderBody, shell: thunderCape },
    { id: 'isblixten', name: 'Isblixten', price: 75, fur: '#8fd3ff', dark: '#ffffff', light: '#ffd6b8', hand: '#ffffff', fingers: false, skull: { rx: 12.5, ry: 12.5, color: '#ffd6b8' }, face: iceFace, nape: iceNape, over: iceHair, body: iceBody },
    { id: 'vindhjalten', name: 'Vindhjälten', price: 75, fur: '#2bb6a0', dark: '#1a7f70', light: '#ffd6b8', hand: '#ffffff', fingers: false, skull: { rx: 12.5, ry: 12.5, color: '#ffd6b8' }, face: windFace, nape: windNape, over: windHair, body: windBody },
    { id: 'eldhjalten', name: 'Eldhjälten', price: 75, fur: '#e8503a', dark: '#ffd23f', light: '#ffd6b8', hand: '#ffd23f', fingers: false, skull: { rx: 12.5, ry: 12.5, color: '#ffd6b8' }, face: fireFace, nape: fireNape, over: fireHair, body: fireBody },
    // en gåva till Wilhelm, som var först på Flappy Games topplista; syns bara för den som har den
    { id: 'guld', name: 'Guldperson', fur: '#ffd23f', dark: '#c98f00', light: '#fff1a8', edge: '#8a6200', gift: true, skull: { rx: 13, ry: 12.5 }, face: goldFace, nape: goldShine, over: goldCrown },
  ];

  // Figurerna köps med blå mynt, som i Flappy Game och till samma pris: de fem första
  // kostar 3, de fem nästa 5, och så vidare. Först kommer de två startfigurerna man
  // inte valde, sedan resten i samlingens ordning.
  const START_FIGURES = ['hund', 'apa', 'enhorning'];
  // En figur med eget pris, som hjältarna, kostar det.
  const PRICES = [3, 5, 10, 15, 20, 25, 30, 35, 40, 45], PRICE_GROUP = 5;
  const OTHER_FIGURES = FIGURES.filter(f => !f.gift && !f.price).map(f => f.id).filter(id => !START_FIGURES.includes(id));
  function figurePrice(i) {
    if (FIGURES[i].price) return FIGURES[i].price;
    const id = FIGURES[i].id;
    const place = START_FIGURES.includes(id) ? 0 : START_FIGURES.length - 1 + OTHER_FIGURES.indexOf(id);
    return PRICES[Math.floor(place / PRICE_GROUP)];
  }

  // Figurerna och de blå mynten är Flappy Games, så det man köper i det ena spelet har
  // man i det andra. Man har den startfigur man valde i Flappy Game och de man har
  // köpt; den som inte har valt någon där än klättrar med apan. Läses om när rutan
  // Figurer öppnas och när man kommer tillbaka till fliken.
  function readOwned() {
    const first = load('flappy-apa-forsta');
    const ids = new Set([START_FIGURES.includes(first) ? first : 'apa']);
    try { for (const id of JSON.parse(load('flappy-apa-upplasta') || '[]')) ids.add(id); } catch {}
    return ids;
  }
  const blueCoins = () => Math.max(0, Math.floor(Number(load('flappy-apa-blamynt')) || 0));
  let ownedIds = readOwned();
  const owned = id => ownedIds.has(id);
  // den figur man klättrade med senast, annars den man flyger med i Flappy Game,
  // annars den första man har
  const ownedIndex = id => FIGURES.findIndex(f => f.id === id && owned(f.id));
  let figure = [load(`${GAME}-figur`), load('flappy-apa-figur')].map(ownedIndex).find(i => i >= 0) ?? FIGURES.findIndex(f => owned(f.id));
  function choose(i) {
    figure = i;
    store(`${GAME}-figur`, FIGURES[i].id);
    play('select', 0.4);
  }

  // Köp en låst figur för blå mynt, eller säg hur många som saknas. Raden i rutan
  // Figurer visar vad som hände en stund.
  let figMsg = { text: '', at: -10 };
  function buyFigure(i) {
    const price = figurePrice(i), coins = blueCoins();
    if (coins < price) {
      figMsg = { text: `Du behöver ${price - coins} blå mynt till`, at: time };
      play('select', 0.3, 0.8);
      return;
    }
    store('flappy-apa-blamynt', coins - price);
    let bought = [];
    try { bought = JSON.parse(load('flappy-apa-upplasta') || '[]'); } catch {}
    if (!Array.isArray(bought)) bought = [];
    if (!bought.includes(FIGURES[i].id)) bought.push(FIGURES[i].id);
    store('flappy-apa-upplasta', JSON.stringify(bought));
    ownedIds = readOwned();
    figMsg = { text: `${FIGURES[i].name} är din!`, at: time };
    choose(i);
    play('chime', 0.7);
  }

  // ---------- Delar som figurerna delar ----------

  function star(x, y, r, color) {
    const p = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? r * 0.45 : r;
      p.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
    }
    poly(p, color);
  }
  function clipOval(x, y, rx, ry, fn) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
    fn();
    ctx.restore();
  }
  function cross(x, y, color = C.ink) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 2.5, y - 2.5); ctx.lineTo(x + 2.5, y + 2.5); ctx.moveTo(x + 2.5, y - 2.5); ctx.lineTo(x - 2.5, y + 2.5); ctx.stroke();
  }
  // Kryss när figuren har fallit; `color` är kryssens färg, för de mörka ansiktena.
  function eyes(dead, y = -9, gap = 4, color = C.ink) {
    for (const ex of [-gap, gap]) {
      if (dead) cross(ex, y, color);
      else {
        oval(ex, y, 3.8, 4.2, C.white);
        oval(ex, y + 0.5, 2, 2.3, C.ink);
      }
    }
  }
  function smile(dead, y, color, r = 4.5) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath();
    if (dead) ctx.arc(0, y + r * 0.9, r * 0.8, 1.15 * Math.PI, 1.85 * Math.PI);
    else ctx.arc(0, y, r, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  function cheeks(y, color, x = 9) { oval(-x, y, 2.6, 1.6, color); oval(x, y, 2.6, 1.6, color); }
  function mirror(fn) { for (const s of [-1, 1]) { ctx.save(); ctx.scale(s, 1); fn(); ctx.restore(); } }
  // en rad små romber längs ryggraden
  function spine(color, from = 4, to = 20) {
    for (let y = from; y <= to; y += 5) poly([[-1, y - 2.5], [1.2, y], [-1, y + 2.5], [-3.2, y]], color);
  }

  // ---------- Varje figur ----------

  // Enhörning: horn, regnbågsman och regnbågssvans, och hovar
  const RAINBOW = ['#ff6b8b', '#ffb347', '#ffe066', '#6fdc8c', '#5bc0eb', '#a78bfa'];
  function unicornBehind(f) {
    poly([[-11, -13], [-9, -24], [-4, -17]], f.fur, f.edge);
    poly([[4, -17], [9, -24], [11, -13]], f.fur, f.edge);
    poly([[-3, -17], [0, -35], [3, -17]], '#ffd23f', '#b88a00');
    ctx.strokeStyle = '#b88a00'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-1.8, -22); ctx.lineTo(1.8, -23.5); ctx.moveTo(-1, -28); ctx.lineTo(1, -29); ctx.stroke();
  }
  function unicornFace(f, dead) {
    [[-12, -12, 4.5], [-14, -5, 4.5], [-13, 2, 4], [-6, -17, 4], [1, -19, 4]].forEach(([x, y, r], i) => blob(x, y, r, RAINBOW[i]));
    ovalEdge(0, 0, 8.5, 6, f.light, f.edge);
    blob(-2.5, -0.5, 1, f.edge); blob(2.5, -0.5, 1, f.edge);
    eyes(dead, -9);
    cheeks(-3, '#ffb3c7');
    smile(dead, 1.5, f.edge);
  }
  function unicornNape() {
    [-17, -11, -5, 1].forEach((y, i) => blob(i % 2 ? 1 : -1, y, 4.5, RAINBOW[i]));
  }
  function unicornTail() {
    ctx.lineCap = 'round'; ctx.lineWidth = 3.5;
    RAINBOW.slice(0, 4).forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(-6, 16 + i * 1.5);
      ctx.quadraticCurveTo(-22, 12 + i * 3, -26, 24 + i * 3.5);
      ctx.stroke();
    });
  }

  // Dinosaurie: taggar på huvudet och längs ryggen, och en tjock svans
  function dinoBehind() {
    for (const x of [-7, 0, 7]) poly([[x - 3.5, -16], [x, -25], [x + 3.5, -16]], '#ff9f1c', '#c76f00');
  }
  function dinoFace(f, dead) {
    oval(0, 1, 10, 6, f.light);
    eyes(dead, -10, 5);
    blob(-2.5, -2, 1, f.dark); blob(2.5, -2, 1, f.dark);
    smile(dead, 0.5, f.dark, 5.5);
    if (!dead) { poly([[-3, 4.6], [-2, 6.6], [-1, 5]], C.white); poly([[1, 5], [2, 6.6], [3, 4.6]], C.white); }
  }
  function dinoBody(f, dead, phase, back) {
    oval(-1, 12, 12, 10, f.fur);
    if (back) spine('#ff9f1c'); else oval(0, 14, 7, 6.5, f.light);
  }
  function dinoTail(f) {
    stroke([[-4, 18], [-16, 25], [-27, 29]], f.fur, 7);
    stroke([[-24, 28], [-33, 31]], f.fur, 4);
    for (const [x, y] of [[-12, 20], [-20, 24], [-27, 26]]) poly([[x - 3, y + 1], [x, y - 5], [x + 3, y + 1]], '#ff9f1c');
  }

  // Hund: hängöron och en svans som viftar
  function dogFace(f, dead) {
    oval(0, -1, 8.5, 6.5, f.light);
    eyes(dead, -10);
    oval(0, -4, 3.4, 2.6, '#2a1d16');
    smile(dead, -0.5, '#2a1d16');
    if (!dead) oval(0, 4.5, 2.4, 3.2, '#ff7a8a');
  }
  function dogEars(f) {
    oval(-13.5, -3, 5, 10, f.dark, 0.25);
    oval(13.5, -3, 5, 10, f.dark, -0.25);
  }
  function dogTail(f, dead) {
    ctx.save();
    ctx.translate(-6, 18); ctx.rotate(dead ? 0 : Math.sin(time * 14) * 0.35);
    stroke([[0, 0], [-10, -2], [-12, -12]], f.fur, 4.5);
    ctx.restore();
  }

  // Apa: runda öron och en svans som ringlar sig
  function monkeyEars(f, back) {
    for (const s of [-1, 1]) {
      oval(s * 14.5, -8, 6.5, 6.5, f.fur);
      oval(s * 14.5, -8, 3.8, 3.8, back ? f.dark : f.light);
    }
  }
  function monkeyFace(f, dead) {
    oval(0, -9, 10, 7.5, f.light);
    oval(0, -1, 9, 6.5, f.light);
    eyes(dead);
    blob(-1.5, -3, 1.1, C.mouth); blob(1.5, -3, 1.1, C.mouth);
    smile(dead, -1, C.mouth);
  }
  function monkeyTail(f) {
    ctx.strokeStyle = f.dark; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, 16); ctx.bezierCurveTo(-24, 22, -32, 6, -24, 0); ctx.bezierCurveTo(-18, -4, -14, 4, -20, 6); ctx.stroke();
  }

  // Astronaut: hjälm med visir, och syrgas på ryggen
  function astroAntenna(f) {
    stroke([[8, -18], [11, -26]], f.edge, 1.6);
    blob(11, -26.5, 2.2, '#e63946');
  }
  function astroFace(f, dead) {
    ovalEdge(0, -6, 11, 9.5, '#1f3a5f', f.edge);
    eyes(dead, -7, 4, C.white);
    oval(-5, -10, 3, 1.6, 'rgba(255,255,255,0.6)', -0.5);
  }
  function astroBody(f, dead, phase, back) {
    rr(-11, 2, 22, 21, 8); ctx.fillStyle = f.fur; ctx.fill(); ctx.strokeStyle = f.edge; ctx.lineWidth = 1.5; ctx.stroke();
    if (back) {
      rr(-9, 0, 18, 19, 5); ctx.fillStyle = f.light; ctx.fill(); ctx.stroke();
      for (const x of [-4.5, 4.5]) { rr(x - 3, 2, 6, 14, 3); ctx.fillStyle = '#d6dce3'; ctx.fill(); ctx.stroke(); }
    } else {
      rr(-6, 8, 12, 8, 2); ctx.fillStyle = f.light; ctx.fill();
      blob(-3, 12, 1.6, '#e63946'); blob(1, 12, 1.6, '#2f80ed'); blob(4.2, 12, 1.2, '#ffd23f');
    }
  }

  // Pingvin: vit mask, orange näbb och fötter, och en randig mössa
  function penguinFace(f, dead) {
    oval(-4.5, -5, 6, 7.5, f.light); oval(4.5, -5, 6, 7.5, f.light);
    eyes(dead, -7);
    poly([[-3.5, -2], [3.5, -2], [0, 3]], '#ff9f1c', '#c76f00');
    cheeks(-1, '#ffb3c7');
  }
  function penguinCap(f) {
    const cap = ['#e63946', '#ffd23f', '#2f80ed'];
    for (let k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(0, -15);
      ctx.arc(0, -15, 9, Math.PI + k * Math.PI / 3, Math.PI + (k + 1) * Math.PI / 3);
      ctx.closePath(); ctx.fillStyle = cap[k]; ctx.fill();
    }
    ctx.strokeStyle = f.edge; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, -15, 9, Math.PI, 0); ctx.closePath(); ctx.stroke();
    blob(0, -24.5, 2.2, '#e63946');
  }

  // Bläckfisk: stort huvud med prickar, och två armar till som slingrar
  function octoFace(f, dead) {
    eyes(dead, -5);
    smile(dead, 0, '#8c2a52', 3.5);
  }
  function octoSpots(f) {
    blob(-7, -18, 2.2, f.light); blob(5, -21, 1.6, f.light); blob(9.5, -13, 1.8, f.light); blob(-11, -10, 1.4, f.light);
  }
  function octoArms(f, dead) {
    const w = dead ? 0 : Math.sin(time * 5) * 3;
    stroke([[-6, 18], [-16, 26 + w], [-23, 22]], f.dark, 5);
    stroke([[6, 18], [16, 26 - w], [23, 22]], f.dark, 5);
  }

  // Bi: antenner, ränder och en gadd
  function beeAntennae() {
    stroke([[-4, -16], [-8, -27]], '#2a2a2a', 1.6); blob(-8, -27, 2.4, '#2a2a2a');
    stroke([[4, -16], [8, -27]], '#2a2a2a', 1.6); blob(8, -27, 2.4, '#2a2a2a');
  }
  function beeFace(f, dead) {
    eyes(dead, -8);
    cheeks(-2, '#ff9e9e', 8.5);
    smile(dead, -1, '#2a2a2a', 3.5);
  }
  function beeBody(f) {
    ovalEdge(-1, 12, 11.5, 11, f.fur, f.edge);
    clipOval(-1, 12, 11.5, 11, () => {
      ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-13, 7, 24, 3.5); ctx.fillRect(-13, 14, 24, 3.5);
    });
  }
  function beeSting() { poly([[-4, 21.5], [2, 21.5], [-1, 27]], '#2a2a2a'); }

  // Drake: horn, taggar längs ryggen och en svans med spets
  function dragonHorns() {
    poly([[-9, -15], [-12, -27], [-4, -18]], '#fff1c9', '#7a1f12');
    poly([[9, -15], [12, -27], [4, -18]], '#fff1c9', '#7a1f12');
    poly([[-3, -18], [0, -24], [3, -18]], '#ffd23f');
  }
  function dragonFace(f, dead) {
    oval(0, 1, 9.5, 6.5, f.light);
    blob(-3, -1, 1.2, f.dark); blob(3, -1, 1.2, f.dark);
    eyes(dead, -10, 5);
    smile(dead, 2, f.dark, 4);
  }
  function dragonBody(f, dead, phase, back) {
    oval(-1, 12, 12, 10, f.fur);
    if (back) spine('#ffd23f');
    else {
      oval(0, 14, 7, 6.5, f.light);
      ctx.strokeStyle = '#e8b070'; ctx.lineWidth = 1;
      for (const y of [11, 14, 17]) { ctx.beginPath(); ctx.moveTo(-5, y); ctx.lineTo(5, y); ctx.stroke(); }
    }
  }
  function dragonTail(f) {
    stroke([[-4, 18], [-16, 26], [-27, 24]], f.fur, 6);
    poly([[-27, 19], [-35, 24], [-27, 29]], '#ffd23f', '#7a1f12');
  }

  // Katt: spetsiga öron, ränder och morrhår
  function catEars(f, back) {
    poly([[-13, -10], [-11, -25], [-3, -17]], f.fur); poly([[13, -10], [11, -25], [3, -17]], f.fur);
    if (!back) { poly([[-11, -13], [-10, -21], [-6, -17]], '#ff8fa3'); poly([[11, -13], [10, -21], [6, -17]], '#ff8fa3'); }
  }
  function catStripes(f) {
    stroke([[0, -18], [0, -13]], f.dark, 2); stroke([[-4, -17.5], [-3.5, -13.5]], f.dark, 2); stroke([[4, -17.5], [3.5, -13.5]], f.dark, 2);
  }
  function catFace(f, dead) {
    catStripes(f);
    oval(0, -0.5, 8, 5.5, f.light);
    eyes(dead, -9);
    poly([[-2, -3], [2, -3], [0, -0.5]], '#ff8fa3');
    smile(dead, -0.5, '#7a5a3a', 3);
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 0.9;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * 6, -1.5); ctx.lineTo(s * 16, -3.5); ctx.moveTo(s * 6, 0.5); ctx.lineTo(s * 16, 1.5); ctx.stroke();
    }
  }
  function catNape(f) {
    catStripes(f);
    stroke([[-9, -8], [-5, -7]], f.dark, 2); stroke([[9, -8], [5, -7]], f.dark, 2);
  }
  function catTail(f, dead) {
    ctx.save(); ctx.translate(-6, 18); ctx.rotate(dead ? 0 : Math.sin(time * 3) * 0.2);
    stroke([[0, 0], [-12, -2], [-16, -14], [-12, -22]], f.fur, 4.5);
    ctx.restore();
  }

  // Spöke: ett lakan som fladdrar i nederkanten i stället för ben
  function ghostFace(f, dead) {
    if (dead) eyes(true, -8, 4.5);
    else {
      oval(-4.5, -8, 2.6, 3.6, C.ink); oval(4.5, -8, 2.6, 3.6, C.ink);
      blob(-4, -9.5, 0.9, C.white); blob(5, -9.5, 0.9, C.white);
    }
    oval(0, 0, 2.4, 3, C.ink);
    cheeks(-3, '#ffc2d6');
  }
  function ghostBody(f, dead) {
    const w = dead ? 0 : time * 6;
    ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(-13, 30);
    for (let k = 0; k < 4; k++) {
      const x = -13 + k * 6.5;
      ctx.quadraticCurveTo(x + 3.25, 34 + Math.sin(w + k) * 2, x + 6.5, 30);
    }
    ctx.lineTo(12, 2); ctx.closePath();
    ctx.fillStyle = f.fur; ctx.fill();
    ctx.strokeStyle = f.edge; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Groda: ögonen sitter på knölar uppe på huvudet
  function frogBumps(f) { blob(-7, -14, 6.5, f.fur); blob(7, -14, 6.5, f.fur); }
  function frogFace(f, dead) {
    eyes(dead, -15, 7);
    smile(dead, -5, f.dark, 9);
    cheeks(-1, '#ff9eaa', 10.5);
  }

  // Påskhare: långa öron, tänder och en vit tofs till svans
  function hareEars(f, back) {
    for (const s of [-1, 1]) {
      ovalEdge(s * 6, -24, 4.5, 12, f.fur, f.edge, s * 0.12);
      if (!back) oval(s * 6, -24, 2.3, 9, '#ffb3c7', s * 0.12);
    }
  }
  function hareFace(f, dead) {
    oval(0, 0, 7, 5, f.light);
    eyes(dead, -9);
    oval(0, -2.5, 2.4, 1.8, '#ff7a9a');
    rr(-2, 1.2, 4, 3.5, 1); ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = f.edge; ctx.lineWidth = 0.8; ctx.stroke();
    cheeks(-3, '#ffc7d6');
  }
  function hareTail(f, dead, back) { if (back) ovalEdge(0, 20, 5, 5, C.white, f.edge); }

  // Jultomte: tomteluva, vitt skägg och svart bälte
  function tomteFace(f, dead) {
    for (const [x, y, r] of [[-9, 0, 5], [-5, 4, 5.5], [0, 5.5, 6], [5, 4, 5.5], [9, 0, 5]]) blob(x, y, r, C.white);
    eyes(dead, -8);
    oval(0, -3.5, 2.6, 2.2, '#ff9aa8');
    smile(dead, -0.5, '#7a1020', 2.5);
  }
  function tomteNape() {
    for (const [x, y, r] of [[-10, -2, 4.5], [-6, 2, 5], [0, 3, 5.5], [6, 2, 5], [10, -2, 4.5]]) blob(x, y, r, C.white);
  }
  function tomteHat(f) {
    poly([[-12, -14], [12, -14], [17, -28], [4, -27]], f.fur, '#7a1020');
    blob(18, -29, 4, C.white);
    rr(-14, -17, 28, 6, 3); ctx.fillStyle = C.white; ctx.fill();
  }
  function tomteBody(f, dead, phase, back) {
    ovalEdge(-1, 12, 12, 10, f.fur, '#7a1020');
    if (!back) { ctx.fillStyle = C.white; ctx.fillRect(-2.5, 3, 4, 18); }
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-12.5, 13, 23, 3.5);
    if (!back) { rr(-3.5, 12, 5, 5.5, 1); ctx.fillStyle = '#f5b301'; ctx.fill(); }
  }

  // Pumpa: ett pumpahuvud med utskuret ansikte, och armar och ben som rankor
  function pumpkinSkull() {
    oval(0, -6, 16, 13, '#ff8c1a');
    ctx.strokeStyle = '#c95c08'; ctx.lineWidth = 1.2;
    for (const rx of [6, 12]) { ctx.beginPath(); ctx.ellipse(0, -6, rx, 13, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  function pumpkinStem() {
    stroke([[0, -17], [1, -24]], '#5a7a2a', 3.5);
    oval(6, -22, 5, 2.6, '#6cbf3a', -0.4);
  }
  function pumpkinFace(f, dead) {
    if (dead) eyes(true, -9, 5, '#5a2a00');
    else { poly([[-8, -7], [-2, -7], [-5, -12]], '#ffe066'); poly([[2, -7], [8, -7], [5, -12]], '#ffe066'); }
    poly([[-1.5, -3], [1.5, -3], [0, -5.5]], '#ffe066');
    if (dead) poly([[-6, 4], [6, 4], [4, 1], [-4, 1]], '#ffe066');
    else poly([[-8, 0], [-5, 2], [-2.5, 0], [0, 2], [2.5, 0], [5, 2], [8, 0], [5, 4.5], [-5, 4.5]], '#ffe066');
  }
  function pumpkinBody() {
    ovalEdge(-1, 12, 12, 10, '#ff8c1a', '#c95c08');
    ctx.strokeStyle = '#c95c08'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(-1, 12, 5, 10, 0, 0, Math.PI * 2); ctx.stroke();
  }

  // Sol: strålar som snurrar och solglasögon
  function sunRays() {
    ctx.save(); ctx.translate(0, -6); ctx.rotate(time * 0.8);
    for (let k = 0; k < 10; k++) { ctx.rotate(Math.PI / 5); poly([[-3, -14], [0, -21], [3, -14]], '#ffb800'); }
    ctx.restore();
  }
  function sunFace(f, dead) {
    if (dead) eyes(true, -8, 5);
    else {
      ctx.fillStyle = C.ink;
      rr(-11, -11, 9, 6, 2.5); ctx.fill(); rr(2, -11, 9, 6, 2.5); ctx.fill();
      stroke([[-2, -9], [2, -9]], C.ink, 1.5);
      oval(-8, -9.5, 1.6, 0.9, 'rgba(255,255,255,0.6)'); oval(5, -9.5, 1.6, 0.9, 'rgba(255,255,255,0.6)');
    }
    cheeks(-1.5, '#ff9a6a', 9.5);
    smile(dead, -1, '#c26a00', 5);
  }

  // Superhjälte: mask, mantel och bälte
  function heroFace(f, dead) {
    rr(-11, -12, 22, 7, 3.5); ctx.fillStyle = '#1d2b4f'; ctx.fill();
    eyes(dead, -8.5, 4.5, C.white);
    smile(dead, -1, '#8a4a2a', 4);
  }
  function heroHair() { oval(0, -14.5, 11.5, 5.5, '#3a2a1a'); blob(3, -19, 3, '#3a2a1a'); }
  function heroNape() {
    clipOval(0, -6, 12.5, 12.5, () => oval(0, -9, 13, 11, '#3a2a1a'));
    rr(-12.5, -10, 25, 3, 1.5); ctx.fillStyle = '#1d2b4f'; ctx.fill();
  }
  function heroCape(f, dead, back) {
    const w = dead ? 0 : Math.sin(time * 6) * 2;
    poly([[-9, 3], [9, 3], [15 + w, back ? 30 : 34], [-15 + w, back ? 30 : 34]], '#e63946', '#b5212e');
  }
  function heroBody(f, dead, phase, back) {
    ovalEdge(-1, 12, 12, 10, f.fur, '#1f4fa8');
    if (back) return;
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(-12.5, 16, 23, 3);
    blob(-1, 9, 3.6, '#ffd23f'); blob(-1, 9, 1.6, '#e63946');
  }

  // Panda: svarta öron, ögonfläckar, armar och ben
  function pandaEars() { blob(-11, -16, 5.5, '#22252b'); blob(11, -16, 5.5, '#22252b'); }
  function pandaFace(f, dead) {
    oval(-5, -8, 4.4, 5.4, '#22252b', 0.4); oval(5, -8, 4.4, 5.4, '#22252b', -0.4);
    eyes(dead, -8.5, 5, C.white);
    oval(0, -2, 3, 2.2, '#22252b');
    smile(dead, -0.5, '#22252b', 3);
    cheeks(-1, '#ffb3c7', 9.5);
  }

  // Uggla: örontofsar, stora ögon och fjädrar
  function owlTufts(f) {
    poly([[-13, -12], [-11, -24], [-5, -17]], f.fur);
    poly([[13, -12], [11, -24], [5, -17]], f.fur);
  }
  function owlFace(f, dead) {
    blob(-5.5, -7, 6.5, '#ecdcbd'); blob(5.5, -7, 6.5, '#ecdcbd');
    if (dead) eyes(true, -7, 5.5);
    else for (const s of [-1, 1]) { blob(s * 5.5, -7, 4.2, '#ffb703'); blob(s * 5.5, -7, 2.2, C.ink); blob(s * 5.5 - 0.6, -8.2, 0.8, C.white); }
    poly([[-2.5, -2], [2.5, -2], [0, 3]], '#f5a300');
  }
  function owlNape(f) {
    ctx.strokeStyle = f.light; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (const [x, y] of [[-5, -10], [4, -12], [0, -4], [-7, -2], [7, -3]]) {
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    }
  }

  // Robot: fyrkantigt huvud med skärm, antenn och lampor
  function robotSkull(f) {
    rr(-14, -19, 28, 24, 6); ctx.fillStyle = f.fur; ctx.fill();
    ctx.strokeStyle = f.edge; ctx.lineWidth = 1.5; ctx.stroke();
    blob(-14, -7, 2.2, f.light); blob(14, -7, 2.2, f.light);
  }
  function robotAntenna(f) {
    stroke([[0, -18], [0, -26]], f.edge, 1.6);
    blob(0, -27, 2.6, '#e63946');
  }
  function robotFace(f, dead) {
    rr(-10, -15, 20, 15, 4); ctx.fillStyle = '#1d2b4f'; ctx.fill();
    if (dead) eyes(true, -9.5, 4.5, '#4cf0ff');
    else { ctx.fillStyle = '#4cf0ff'; rr(-7, -12, 4, 5, 1); ctx.fill(); rr(3, -12, 4, 5, 1); ctx.fill(); }
    smile(dead, -6, '#4cf0ff', 3);
  }
  function robotNape(f) {
    ctx.strokeStyle = f.light; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    for (const y of [-12, -8, -4]) { ctx.beginPath(); ctx.moveTo(-6, y); ctx.lineTo(6, y); ctx.stroke(); }
  }
  function robotBody(f, dead, phase, back) {
    rr(-11, 2, 22, 21, 4); ctx.fillStyle = f.fur; ctx.fill();
    ctx.strokeStyle = f.edge; ctx.lineWidth = 1.5; ctx.stroke();
    if (back) { for (const [x, y] of [[-8, 5], [8, 5], [-8, 20], [8, 20]]) blob(x, y, 1.2, f.light); return; }
    rr(-6, 7, 12, 9, 2); ctx.fillStyle = '#1d2b4f'; ctx.fill();
    const on = Math.floor(time * 3) % 3;
    ['#e63946', '#ffd23f', '#2bb673'].forEach((c, i) => {
      ctx.globalAlpha *= i === on ? 1 : 0.45;
      blob(-3.5 + i * 3.5, 11.5, 1.6, c);
      ctx.globalAlpha /= i === on ? 1 : 0.45;
    });
  }

  // Lejon: stor man och en svans med tofs
  function lionMane() {
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * Math.PI * 2;
      blob(Math.cos(a) * 15, -6 + Math.sin(a) * 14, 5.5, '#b5652a');
    }
    blob(-9.5, -16, 4, '#e8a849'); blob(9.5, -16, 4, '#e8a849');
  }
  function lionFace(f, dead) {
    blob(-9.5, -16, 2.2, f.light); blob(9.5, -16, 2.2, f.light);
    oval(0, -1, 7, 5, f.light);
    eyes(dead, -9);
    poly([[-2.5, -3.5], [2.5, -3.5], [0, -1]], '#5a3020');
    smile(dead, -1, '#5a3020', 3);
  }
  function lionNape() {
    clipOval(0, -6, 12.5, 11.5, () => {
      oval(0, -6, 13, 12, '#b5652a');
      for (const [x, y] of [[-6, -12], [5, -13], [-8, -3], [7, -2], [0, -7], [0, 3]]) blob(x, y, 3.2, '#a0561f');
    });
  }
  function lionTail(f) {
    stroke([[-4, 18], [-16, 22], [-22, 12]], f.fur, 3);
    blob(-22, 11, 3.5, f.dark);
  }

  // Ko: horn, öron åt sidorna, prickar och en ringklocka
  function cowHorns(f) {
    poly([[-9, -15], [-13, -24], [-5, -17]], '#f0e0c0', '#a89870');
    poly([[9, -15], [13, -24], [5, -17]], '#f0e0c0', '#a89870');
    ovalEdge(-16, -9, 6, 3.2, f.fur, f.edge, 0.3);
    ovalEdge(16, -9, 6, 3.2, f.fur, f.edge, -0.3);
  }
  function cowFace(f, dead) {
    oval(-6, -12, 5, 4, f.dark, 0.3);
    ovalEdge(0, 1, 10, 6.5, f.light, '#d98a96');
    oval(-3.5, 1, 1.5, 1.9, '#d98a96'); oval(3.5, 1, 1.5, 1.9, '#d98a96');
    eyes(dead, -9, 5);
    blob(0, 9.5, 3, '#ffd23f');
  }
  function cowNape(f) {
    clipOval(0, -6, 14, 13, () => { oval(5, -10, 6, 5, f.dark, 0.4); oval(-6, 0, 4, 3, f.dark); });
  }
  function cowBody(f) {
    ovalEdge(-1, 12, 12, 10, f.fur, f.edge);
    clipOval(-1, 12, 12, 10, () => { blob(-6, 9, 3.5, f.dark); blob(5, 15, 3.2, f.dark); blob(2, 5, 2, f.dark); });
  }
  function cowTail(f) {
    stroke([[-4, 18], [-14, 24], [-17, 32]], f.edge, 4);
    stroke([[-4, 18], [-14, 24], [-17, 32]], f.fur, 2.4);
    blob(-17, 33, 2.8, f.dark);
  }

  // Kamel: långt ansikte, sömniga ögon, lugg och en puckel på ryggen
  function camelEars(f) { oval(-11, -15, 3, 4.5, f.dark, -0.5); oval(11, -15, 3, 4.5, f.dark, 0.5); }
  function camelFace(f, dead) {
    oval(0, 1, 9.5, 7.5, f.light);
    eyes(dead, -10, 4.5);
    if (!dead) for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(s * 4.5, -10, 4.2, 4.6, 0, Math.PI, Math.PI * 2); ctx.fillStyle = f.fur; ctx.fill();
    }
    stroke([[-3.5, -1], [-2.5, 0.5]], f.dark, 1.4); stroke([[3.5, -1], [2.5, 0.5]], f.dark, 1.4);
    smile(dead, 2, f.dark, 4);
  }
  function camelTuft(f) { blob(-3, -19, 3, f.dark); blob(1, -20.5, 3, f.dark); blob(4.5, -19, 2.5, f.dark); }
  function camelHump(f, dead, back) { if (back) ovalEdge(-1, 7, 9, 7.5, '#c99450', f.dark); }

  // Rymdvarelse: stora svarta ögon och antenner
  function alienAntennae(f) {
    stroke([[-5, -19], [-9, -29]], f.dark, 1.6); blob(-9, -29.5, 2.4, '#ff5e7a');
    stroke([[5, -19], [9, -29]], f.dark, 1.6); blob(9, -29.5, 2.4, '#ffd23f');
  }
  function alienFace(f, dead) {
    if (dead) eyes(true, -8, 5.5);
    else {
      oval(-5.5, -8, 4, 5.5, '#1d1d2b', 0.5); oval(5.5, -8, 4, 5.5, '#1d1d2b', -0.5);
      blob(-6, -10, 1.1, C.white); blob(5, -10, 1.1, C.white);
    }
    smile(dead, 0, f.dark, 3);
  }

  // Prinsessa: långt gult hår, tiara och rosa klänning
  function princessHair(f, dead, back) { oval(0, back ? 2 : 0, 13, back ? 15 : 14, '#ffcf5a'); }
  function princessFace(f, dead) {
    ctx.beginPath(); ctx.ellipse(0, -12, 12.5, 7, 0, Math.PI, Math.PI * 2); ctx.fillStyle = '#ffcf5a'; ctx.fill();
    oval(-11, -4, 3.5, 8, '#ffcf5a'); oval(11, -4, 3.5, 8, '#ffcf5a');
    eyes(dead, -7);
    cheeks(-2.5, '#ff9eb8', 7.5);
    smile(dead, -1, '#b83a7c', 3);
  }
  function princessNape() { oval(0, -7, 12.8, 12.8, '#ffcf5a'); stroke([[0, -18], [0, 4]], '#d9a32e', 1.2); }
  function princessTiara() {
    poly([[-7, -17], [-4, -23], [-1.5, -18.5], [0, -25], [1.5, -18.5], [4, -23], [7, -17]], '#ffe066', '#b88a00');
    blob(0, -21, 1.5, '#ff4f9a');
  }
  function princessDress(f, dead, phase, back) {
    poly([[-7, 3], [7, 3], [14, 25], [-16, 25]], '#ff8fc8', '#b83a7c');
    ctx.strokeStyle = '#e0569e'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-15, 22); ctx.quadraticCurveTo(-1, 26, 13, 22); ctx.stroke();
    if (!back) oval(0, 6, 5, 2.5, '#ffc2e2');
  }

  // Räv: spetsiga öron med svarta toppar, vita kinder och en yvig svans
  function foxEars(f) {
    poly([[-13, -9], [-11, -25], [-3, -16]], f.fur); poly([[13, -9], [11, -25], [3, -16]], f.fur);
    poly([[-12.3, -19], [-11, -25], [-8.2, -21]], f.dark); poly([[12.3, -19], [11, -25], [8.2, -21]], f.dark);
  }
  function foxFace(f, dead) {
    oval(-6, 0, 6.5, 5, f.light); oval(6, 0, 6.5, 5, f.light); oval(0, 2, 5, 4, f.light);
    eyes(dead, -9);
    oval(0, -2, 2.6, 2, f.dark);
    smile(dead, 0, f.dark, 3);
  }
  function foxTail(f, dead) {
    ctx.save(); ctx.translate(-6, 18); ctx.rotate(dead ? 0 : Math.sin(time * 3) * 0.15);
    oval(-10, -2, 11, 5.5, f.fur, -0.6);
    oval(-17.5, -8, 4.5, 3.5, f.light, -0.6);
    ctx.restore();
  }

  // Gris: tryne, rosa öron och en knorr
  function pigEars(f) {
    poly([[-12, -11], [-13, -22], [-4, -17]], f.fur, f.edge);
    poly([[12, -11], [13, -22], [4, -17]], f.fur, f.edge);
  }
  function pigFace(f, dead) {
    ovalEdge(0, -1, 6.5, 4.8, f.light, f.edge);
    oval(-2.3, -1, 1.3, 2, f.dark); oval(2.3, -1, 1.3, 2, f.dark);
    eyes(dead, -10, 5);
    cheeks(-3, '#ff8fb0', 10);
    smile(dead, 3, f.dark, 3);
  }
  function pigTail(f) {
    ctx.strokeStyle = f.dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 18); ctx.bezierCurveTo(-13, 16, -15, 24, -10, 24); ctx.bezierCurveTo(-6, 24, -8, 19, -12, 20); ctx.stroke();
  }

  // Elefant: stora öron, snabel och betar
  function elephantEars(f, back) {
    for (const s of [-1, 1]) {
      ovalEdge(s * 15, -6, 9, 11, f.light, f.dark);
      if (!back) oval(s * 15, -6, 5.5, 7.5, '#f3b6c8');
    }
  }
  function elephantFace(f, dead) {
    eyes(dead, -10, 5);
    poly([[-5.5, -1], [-3.5, -1], [-6.5, 5]], '#fffaf0', '#c8c0b0');
    poly([[5.5, -1], [3.5, -1], [6.5, 5]], '#fffaf0', '#c8c0b0');
    stroke([[0, -5], [0, 4], [2, 10], [6, 10]], f.fur, 6);
    ctx.strokeStyle = f.dark; ctx.lineWidth = 0.9;
    for (const y of [0, 3, 6]) { ctx.beginPath(); ctx.moveTo(-2, y); ctx.lineTo(2, y + 0.5); ctx.stroke(); }
  }
  function thinTail(f) {
    stroke([[-4, 18], [-12, 25], [-14, 31]], f.dark, 2);
    blob(-14, 32, 2.4, f.dark);
  }

  // Giraff: lång hals, små horn och fläckar
  function giraffeNeck(f, back) {
    ctx.fillStyle = f.fur; ctx.fillRect(-4.5, -8, 9, 16);
    if (back) { ctx.fillStyle = f.dark; ctx.fillRect(-1, -8, 2, 15); }
    else { blob(-1.5, -2, 2, '#c9781e'); blob(2, 3, 1.8, '#c9781e'); }
  }
  function giraffeHorns(f) {
    stroke([[-4, -17], [-5, -24]], '#7a4a1a', 2.2); blob(-5, -24.5, 2.2, '#7a4a1a');
    stroke([[4, -17], [5, -24]], '#7a4a1a', 2.2); blob(5, -24.5, 2.2, '#7a4a1a');
    oval(-12, -12, 4.5, 2.4, f.fur, -0.4); oval(12, -12, 4.5, 2.4, f.fur, 0.4);
  }
  function giraffeFace(f, dead) {
    oval(0, 1.5, 8, 6, f.light);
    blob(-2.5, 0.5, 1, f.dark); blob(2.5, 0.5, 1, f.dark);
    eyes(dead, -9, 4.5);
    smile(dead, 3, f.dark, 3);
  }
  function giraffeSpots() { blob(-6, -14, 1.8, '#c9781e'); blob(6, -12, 1.5, '#c9781e'); blob(0, -16, 1.4, '#c9781e'); }
  function giraffeBody(f) {
    oval(-1, 12, 12, 10, f.fur);
    for (const [x, y, r] of [[-6, 9, 2.4], [4, 7, 2], [1, 16, 2.4], [-7, 17, 1.8], [7, 13, 1.8]]) blob(x, y, r, '#c9781e');
  }

  // Krokodil: ögon på knölar, en lång mun med tänder och taggar längs ryggen
  function crocBumps(f) { blob(-6, -15, 5, f.fur); blob(6, -15, 5, f.fur); }
  function crocFace(f, dead) {
    rr(-11, -5, 22, 11, 5); ctx.fillStyle = f.fur; ctx.fill();
    ctx.strokeStyle = f.dark; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-10, 1); ctx.quadraticCurveTo(0, dead ? -1 : 3, 10, 1); ctx.stroke();
    if (!dead) for (const x of [-7, -3.5, 0, 3.5, 7]) poly([[x - 1.4, 1.2], [x + 1.4, 1.2], [x, 3.6]], C.white);
    blob(-3, -3, 1.1, f.dark); blob(3, -3, 1.1, f.dark);
    eyes(dead, -15, 6);
  }
  function crocNape(f) { for (const [x, y] of [[-4, -10], [4, -10], [-6, -5], [0, -5], [6, -5]]) blob(x, y, 1.6, f.dark); }
  function crocBody(f, dead, phase, back) {
    oval(-1, 12, 12, 10, f.fur);
    if (back) spine(f.dark);
    else {
      oval(0, 14, 7, 6.5, f.light);
      ctx.strokeStyle = '#b6cc80'; ctx.lineWidth = 1;
      for (const y of [11, 14, 17]) { ctx.beginPath(); ctx.moveTo(-5, y); ctx.lineTo(5, y); ctx.stroke(); }
    }
  }
  function crocTail(f) {
    stroke([[-4, 18], [-17, 26], [-29, 30]], f.fur, 7);
    stroke([[-26, 29], [-35, 31]], f.fur, 4);
    for (const [x, y] of [[-12, 21], [-19, 25], [-26, 27]]) blob(x, y, 1.6, f.dark);
  }

  // Haj: fena på huvudet, gälar, vass mun och stjärtfena
  function sharkFin(f) { poly([[-5, -16], [3, -30], [7, -15]], f.fur, f.dark); }
  function sharkGills(f) {
    ctx.strokeStyle = '#4d7090'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (const d of [0, 2.2, 4.4]) { ctx.beginPath(); ctx.moveTo(s * (9 + d * 0.4), -6 + d); ctx.lineTo(s * (11 + d * 0.4), -2 + d); ctx.stroke(); }
  }
  function sharkFace(f, dead) {
    oval(0, 1, 11, 6, f.light);
    sharkGills(f);
    eyes(dead, -10, 5.5);
    smile(dead, -1, f.dark, 6);
    if (!dead) for (const x of [-3, 0, 3]) poly([[x - 1.2, 3.4], [x + 1.2, 3.4], [x, 5.4]], C.white);
  }
  function sharkTail(f) {
    stroke([[-4, 18], [-17, 24]], f.fur, 6);
    poly([[-17, 24], [-27, 14], [-24, 24], [-27, 33]], f.fur, f.dark);
  }

  // Delfin: kort näbb, ryggfena och stjärtfena
  function dolphinFin(f) { poly([[-3, -17], [4, -27], [6, -16]], f.fur, f.dark); }
  function dolphinFace(f, dead) {
    oval(0, 1.5, 7.5, 4.5, f.light);
    eyes(dead, -9, 5.5);
    smile(dead, 0.5, f.dark, 5);
  }
  function dolphinBlowhole(f) { oval(0, -14, 1.8, 1, f.dark); }
  function dolphinTail(f) {
    stroke([[-4, 18], [-15, 24]], f.fur, 5.5);
    oval(-19, 22, 6, 2.6, f.fur, -0.6); oval(-17, 28, 6, 2.6, f.fur, 0.9);
  }

  // Sköldpadda: skal på ryggen
  function turtleShell(f, dead, back) {
    ovalEdge(-1, 12, back ? 15 : 16, back ? 14 : 15, '#4f9e5f', '#2f6b3a');
    const spots = back ? [[-1, 12, 4], [-8, 6, 3], [6, 6, 3], [-9, 17, 3], [7, 17, 3], [-1, 22, 2.6], [-1, 2, 2.6]] : [[-12, 6, 2.5], [10, 6, 2.5], [-13, 17, 2.5], [11, 17, 2.5], [-1, 25, 2.5]];
    for (const [x, y, r] of spots) blob(x, y, r, '#7cc36e');
  }
  function turtleBody(f, dead, phase, back) {
    if (back) return;
    ovalEdge(-1, 12, 11, 10, f.light, '#b8a860');
    ctx.strokeStyle = '#b8a860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-1, 3); ctx.lineTo(-1, 21); ctx.moveTo(-10, 12); ctx.lineTo(8, 12); ctx.stroke();
  }
  function turtleFace(f, dead) {
    eyes(dead, -8);
    smile(dead, -1, f.dark, 4);
  }

  // Nyckelpiga: rött skal med prickar, svart huvud med antenner
  function ladybugAntennae() {
    stroke([[-4, -16], [-7, -25]], '#22252b', 1.4); blob(-7, -25, 1.8, '#22252b');
    stroke([[4, -16], [7, -25]], '#22252b', 1.4); blob(7, -25, 1.8, '#22252b');
  }
  function ladybugFace(f, dead) {
    eyes(dead, -8, 4, C.white);
    smile(dead, -1, C.white, 3.5);
    cheeks(-3, '#ff8fa3', 8.5);
  }
  function ladybugBody() {
    ovalEdge(-1, 13, 12.5, 11.5, '#e63946', '#9e1b25');
    stroke([[-1, 2], [-1, 24]], '#22252b', 1.5);
    for (const [x, y, r] of [[-6, 8, 2.2], [4, 8, 2.2], [-7, 16, 2], [5, 16, 2], [-4, 21, 1.6], [2, 21, 1.6]]) blob(x, y, r, '#22252b');
  }

  // Papegoja: krokig näbb, vita kinder och långa stjärtfjädrar i regnbågsfärger
  function parrotTuft(f) {
    poly([[-3, -17], [-2, -25], [1, -18]], f.fur);
    poly([[0, -18], [3, -26], [4, -17]], f.fur);
  }
  function parrotFace(f, dead) {
    oval(-5.5, -8, 4.8, 5, C.white); oval(5.5, -8, 4.8, 5, C.white);
    eyes(dead, -8.5, 5.5);
    oval(0, 2.5, 3, 2.2, '#3a2f33');
    poly([[-4, -4], [4, -4], [3, 1], [0, 5], [-3, 1]], '#ffe8a3', '#c8b070');
  }
  function parrotFeathers() {
    [['#2f80ed', -0.35], ['#ffd23f', -0.08], ['#2bb673', 0.2]].forEach(([c, rot]) => {
      ctx.save(); ctx.translate(-1, 18); ctx.rotate(rot);
      oval(0, 10, 3, 11, c);
      ctx.restore();
    });
  }

  // Flamingo: lång hals, böjd näbb och långa rosa ben
  function flamingoNeck(f) { stroke([[0, 8], [-3, 1], [1, -6]], f.fur, 6); }
  function flamingoFace(f, dead) {
    eyes(dead, -9, 4.5);
    poly([[-3, -3], [3, -3], [2.5, 2], [0, 8], [-2.5, 2]], '#ffe2ec', f.dark);
    poly([[-2.1, 3], [2.1, 3], [0, 8]], '#2a2a2a');
    cheeks(-4, f.light, 8);
  }
  function flamingoTail(f) {
    poly([[-2, 18], [-9, 26], [-4, 25], [-6, 31], [1, 21]], f.dark);
  }

  // Tiger: ränder överallt och en randig svans
  function tigerEars(f, back) {
    for (const s of [-1, 1]) {
      blob(s * 10.5, -16, 5, f.fur);
      blob(s * 10.5, -16, 2.6, back ? C.white : f.light);
    }
  }
  function tigerStripes(f) {
    stroke([[0, -18], [0, -14]], f.dark, 2); stroke([[-4, -17.5], [-3, -14.5]], f.dark, 2); stroke([[4, -17.5], [3, -14.5]], f.dark, 2);
    for (const s of [-1, 1]) { stroke([[s * 14, -8], [s * 10, -7]], f.dark, 1.8); stroke([[s * 14, -4], [s * 10, -4]], f.dark, 1.8); }
  }
  function tigerFace(f, dead) {
    tigerStripes(f);
    oval(-4, -0.5, 5, 4.5, f.light); oval(4, -0.5, 5, 4.5, f.light);
    eyes(dead, -9);
    poly([[-2, -3], [2, -3], [0, -0.5]], '#ff8fa3');
    smile(dead, -0.5, f.dark, 3);
  }
  function tigerNape(f) {
    tigerStripes(f);
    stroke([[-5, -10], [-2, -8]], f.dark, 1.8); stroke([[5, -10], [2, -8]], f.dark, 1.8); stroke([[0, -4], [0, 1]], f.dark, 1.8);
  }
  function tigerBody(f, dead, phase, back) {
    oval(-1, 12, 12, 10, f.fur);
    if (!back) oval(0, 14, 7, 6.5, f.light);
    clipOval(-1, 12, 12, 10, () => {
      for (const y of back ? [6, 11, 16, 21] : [6]) { stroke([[-13, y], [-7, y + 1]], f.dark, 1.8); stroke([[11, y], [5, y + 1]], f.dark, 1.8); }
    });
  }
  function tigerTail(f, dead) {
    ctx.save(); ctx.translate(-6, 18); ctx.rotate(dead ? 0 : Math.sin(time * 3) * 0.2);
    stroke([[0, 0], [-12, -2], [-16, -14]], f.fur, 4.5);
    for (const [x, y] of [[-6, -1.5], [-12, -3], [-15, -9]]) stroke([[x - 1.5, y - 2], [x + 1.5, y + 2]], f.dark, 1.6);
    ctx.restore();
  }

  // Koala: stora luddiga öron och en stor nos
  function koalaEars(f, back) {
    for (const s of [-1, 1]) { blob(s * 13, -13, 7, f.fur); blob(s * 13, -13, 4.5, back ? f.dark : f.light); }
  }
  function koalaFace(f, dead) {
    eyes(dead, -9, 5.5);
    oval(0, -3, 3.6, 5, '#2a2d33');
    smile(dead, 2.5, '#2a2d33', 2.5);
  }

  // Igelkott: taggar på ryggen och bakhuvudet
  function hedgehogSpikes(f, dead, back) {
    blob(0, back ? 6 : 0, 15, '#7a5636');
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2, cy = back ? 6 : 0;
      poly([[Math.cos(a - 0.2) * 13, cy + Math.sin(a - 0.2) * 13], [Math.cos(a) * 22, cy + Math.sin(a) * 22], [Math.cos(a + 0.2) * 13, cy + Math.sin(a + 0.2) * 13]], '#7a5636', '#4f3620');
    }
  }
  function hedgehogEars(f) { blob(-9, -13, 3.2, f.light); blob(9, -13, 3.2, f.light); }
  function hedgehogFace(f, dead) {
    eyes(dead, -7);
    oval(0, -1, 2.6, 2, '#2a1d16');
    smile(dead, 0, '#2a1d16', 3);
    cheeks(-2, '#ffb3a0', 7.5);
  }
  function hedgehogNape() {
    blob(0, -5, 12, '#7a5636');
    ctx.strokeStyle = '#4f3620'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (const [x, y] of [[-5, -11], [3, -12], [-8, -4], [0, -5], [7, -4], [-3, 1], [4, 1]]) { ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + 1, y - 2); ctx.stroke(); }
  }

  // Älg: stora horn, mule och en blågul halsduk
  function mooseAntlers(f) {
    mirror(() => {
      poly([[5, -15], [11, -20], [13, -30], [16, -24], [19, -31], [21, -23], [25, -27], [25, -18], [15, -13]], '#e8d3a8', '#a8906a');
      oval(11.5, -11, 4.5, 2.6, f.fur, 0.4);
    });
  }
  function mooseFace(f, dead) {
    oval(0, 2, 9, 7.5, f.light);
    oval(-3, 2, 1.4, 1.8, f.dark); oval(3, 2, 1.4, 1.8, f.dark);
    eyes(dead, -10, 4.5);
    smile(dead, 5, f.dark, 2.5);
  }
  function mooseBody(f, dead, phase, back) {
    oval(-1, 12, 12, 10, f.fur);
    if (!back) oval(0, 14, 7, 6.5, f.light);
    rr(-10, 1, 20, 5, 2.5); ctx.fillStyle = '#2f6fd6'; ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(-10, 3, 20, 1.4);
    if (!back) { rr(4, 4, 5, 11, 2); ctx.fillStyle = '#2f6fd6'; ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(4, 9, 5, 1.4); }
  }

  // Kyckling: äggskal som mössa och en liten orange näbb
  function chickFace(f, dead) {
    eyes(dead, -6.5, 4.5);
    poly([[-3, -2], [3, -2], [0, 2.5]], '#ff9f1c', '#c76f00');
    cheeks(-1.5, '#ffb3a0', 8.5);
  }
  function chickShell() {
    ctx.beginPath(); ctx.ellipse(0, -13, 12.5, 9, 0, Math.PI, Math.PI * 2);
    for (const [x, y] of [[9.5, -10], [6, -14], [3, -10], [0, -14], [-3, -10], [-6, -14], [-9.5, -10], [-12.5, -13]]) ctx.lineTo(x, y);
    ctx.closePath(); ctx.fillStyle = '#fffaf0'; ctx.fill();
    ctx.strokeStyle = '#d8ccb4'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  function chickTail(f, dead, back) { if (back) poly([[-4, 19], [0, 25], [4, 19]], f.dark); }

  // Fladdermus: stora öron och små huggtänder
  function batEars(f, back) {
    for (const s of [-1, 1]) {
      poly([[s * 13, -8], [s * 13, -27], [s * 3, -15]], f.fur);
      if (!back) poly([[s * 11.5, -11], [s * 11.5, -22], [s * 5.5, -15]], '#ff9ec4');
    }
  }
  function batFace(f, dead) {
    eyes(dead, -8);
    oval(0, -3.5, 2, 1.4, f.dark);
    smile(dead, -1.5, f.dark, 3.5);
    if (!dead) { poly([[-2.6, 1.6], [-1, 1.9], [-1.9, 4]], C.white); poly([[2.6, 1.6], [1, 1.9], [1.9, 4]], C.white); }
  }

  // Pirat: bandana, ögonlapp, skägg och randig tröja
  function pirateFace(f, dead) {
    ctx.beginPath(); ctx.ellipse(0, 3, 9.5, 5.5, 0, 0, Math.PI); ctx.fillStyle = '#5a3a22'; ctx.fill();
    oval(-10, -1, 2.5, 5, '#5a3a22'); oval(10, -1, 2.5, 5, '#5a3a22');
    stroke([[-12, -11], [12, -6]], '#1d1d1d', 1.2);
    oval(-4.5, -8, 4, 3.6, '#1d1d1d');
    if (dead) cross(4.5, -8);
    else { oval(4.5, -8, 3.6, 4, C.white); oval(4.5, -7.5, 2, 2.3, C.ink); }
    smile(dead, -1.5, '#8a4a2a', 3.5);
  }
  function pirateNape() {
    clipOval(0, -6, 12.5, 12.5, () => oval(0, -2, 13, 9, '#5a3a22'));
    stroke([[-12, -9], [12, -9]], '#1d1d1d', 1.2);
  }
  function pirateBandana() {
    ctx.beginPath(); ctx.ellipse(0, -11, 13, 8, 0, Math.PI, Math.PI * 2); ctx.fillStyle = '#e63946'; ctx.fill();
    blob(12, -12, 2.6, '#e63946');
    poly([[12, -12], [19, -9], [16, -5]], '#e63946');
    for (const [x, y] of [[-6, -15], [1, -17], [7, -14]]) blob(x, y, 1, C.white);
  }
  function pirateBody() {
    ovalEdge(-1, 12, 12, 10, C.white, '#c9c9d6');
    clipOval(-1, 12, 12, 10, () => { ctx.fillStyle = '#e63946'; for (const y of [5, 10, 15]) ctx.fillRect(-13, y, 24, 2.5); });
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(-12.5, 18, 23, 3);
  }

  // Ninja: svart huva med springa för ögonen och rött pannband som fladdrar
  function ninjaFace(f, dead) {
    rr(-10, -12, 20, 8, 4); ctx.fillStyle = '#ffd6b8'; ctx.fill();
    eyes(dead, -8, 4.5);
  }
  function ninjaBand(f, dead) {
    const w = dead ? 0 : Math.sin(time * 8) * 2;
    stroke([[11, -15], [19, -12 + w], [24, -15 + w]], '#e63946', 2.5);
    stroke([[11, -14], [18, -7 - w], [23, -8 - w]], '#e63946', 2.5);
    clipOval(0, -6, 13.5, 13, () => { ctx.fillStyle = '#e63946'; ctx.fillRect(-14, -17, 28, 4); });
    blob(11.5, -14.5, 2.4, '#e63946');
  }
  function ninjaBody(f) {
    oval(-1, 12, 12, 10, f.fur);
    ctx.fillStyle = '#e63946'; ctx.fillRect(-12.5, 15, 23, 3);
  }

  // Riddare: hjälm med visir och röd plym, rustning med sköldens kors
  function knightHelmet(f) {
    rr(-13, -19, 26, 25, 10); ctx.fillStyle = f.fur; ctx.fill();
    ctx.strokeStyle = f.edge; ctx.lineWidth = 1.5; ctx.stroke();
  }
  function knightPlume() {
    oval(0, -22, 4, 8, '#e63946', 0.3);
    oval(4, -24, 3.5, 7, '#e63946', 0.7);
  }
  function knightFace(f, dead) {
    rr(-10, -11, 20, 5, 2); ctx.fillStyle = '#2a2d3a'; ctx.fill();
    if (dead) eyes(true, -8.5, 4.5, C.white);
    else { blob(-4.5, -8.5, 1.6, C.white); blob(4.5, -8.5, 1.6, C.white); }
    rr(-10, -17, 5, 4, 2); ctx.fillStyle = f.light; ctx.fill();
    for (const [x, y] of [[-3, -1], [0, -1], [3, -1], [-1.5, 1.5], [1.5, 1.5]]) blob(x, y, 0.9, f.dark);
  }
  function knightNape(f) {
    stroke([[0, -18], [0, 4]], f.dark, 1.5);
    rr(-9, -16, 4, 10, 2); ctx.fillStyle = f.light; ctx.fill();
  }
  function knightBody(f, dead, phase, back) {
    ovalEdge(-1, 12, 12, 10, f.fur, f.edge);
    if (back) { stroke([[-1, 3], [-1, 21]], f.dark, 1.2); return; }
    poly([[-6, 5], [4, 5], [4, 13], [-1, 19], [-6, 13]], '#2f6fd6', '#1a4f99');
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(-2, 6, 2, 11); ctx.fillRect(-5, 9, 8, 2);
  }

  // Trollkarl: hög hatt med stjärnor, långt vitt skägg och mantel
  function wizardFace(f, dead) {
    eyes(dead, -8);
    blob(0, -4, 2.2, '#f0b898');
    ctx.beginPath(); ctx.moveTo(-10, -2); ctx.quadraticCurveTo(-8, 14, 0, 20); ctx.quadraticCurveTo(8, 14, 10, -2); ctx.quadraticCurveTo(0, 2, -10, -2);
    ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = '#c9c9d6'; ctx.lineWidth = 1; ctx.stroke();
    smile(dead, 0, '#c9c9d6', 3);
  }
  // bakifrån: långt vitt hår under hatten, och skäggets spetsar vid sidorna
  function wizardNape() {
    blob(-8, 7, 4, C.white); blob(8, 7, 4, C.white);
    clipOval(0, -6, 12, 12, () => {
      oval(0, -4, 13, 11, C.white);
      ctx.strokeStyle = '#c9c9d6'; ctx.lineWidth = 1; ctx.lineCap = 'round';
      for (const x of [-6, -2, 2, 6]) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.quadraticCurveTo(x + 1.5, -2, x, 6); ctx.stroke(); }
    });
  }
  function wizardHat() {
    poly([[-15, -12], [15, -12], [3, -38]], '#3b4fc4', '#24318a');
    oval(0, -12, 16, 3.5, '#24318a');
    star(-2, -21, 3, '#ffe066'); star(4, -29, 2, '#ffe066');
  }
  function wizardRobe(f) {
    poly([[-8, 3], [6, 3], [13, 27], [-15, 27]], f.fur, '#24318a');
    star(-6, 18, 2.4, '#ffe066'); star(5, 22, 1.8, '#ffe066'); star(1, 11, 1.6, '#ffe066');
  }

  // Häxa: spetsig hatt med böjd topp, orange hår och lila klänning
  function witchHair() { oval(-11, -2, 4, 9, '#ff8c1a', 0.2); oval(11, -2, 4, 9, '#ff8c1a', -0.2); }
  function witchFace(f, dead) {
    eyes(dead, -7.5);
    poly([[-1.8, -6], [1.8, -6], [0.5, 0]], '#a8e080', '#7fb85a');
    smile(dead, -0.5, '#4a2275', 3.5);
  }
  function witchNape() { clipOval(0, -6, 12, 12, () => oval(0, -4, 13, 13, '#ff8c1a')); }
  function witchHat() {
    oval(0, -13, 18, 3.5, '#2a1f3a');
    poly([[-10, -13], [10, -13], [4, -28], [10, -35], [-1, -29]], '#2a1f3a');
    poly([[-9.2, -16], [9.2, -16], [8.4, -18.5], [-8.4, -18.5]], '#e63946');
  }
  function witchDress(f) { poly([[-8, 3], [6, 3], [13, 26], [-15, 26]], f.fur, '#4a2275'); }

  // Sjöjungfru: långt rött hår, sjöstjärna i håret och en stjärt i stället för ben
  function mermaidHair(f, dead, back) { oval(0, back ? 1 : -1, 13.5, back ? 15 : 14, '#e63946'); }
  function mermaidFace(f, dead) {
    ctx.beginPath(); ctx.ellipse(0, -12, 12.5, 7, 0, Math.PI, Math.PI * 2); ctx.fillStyle = '#e63946'; ctx.fill();
    oval(-11, -4, 3.5, 8, '#e63946'); oval(11, -4, 3.5, 8, '#e63946');
    eyes(dead, -7);
    cheeks(-2.5, '#ff9eb8', 7.5);
    smile(dead, -1, '#a8202a', 3);
  }
  function mermaidNape() { oval(0, -7, 12.8, 12.8, '#e63946'); stroke([[0, -18], [0, 4]], '#a8202a', 1.2); }
  function mermaidStar() { star(8, -15, 3.2, '#ffd23f'); }
  function mermaidBody(f, dead, phase, back) {
    const w = dead ? 0 : phase * 4;
    ctx.beginPath(); ctx.moveTo(-10, 10); ctx.quadraticCurveTo(-11, 26, -2 + w, 34); ctx.lineTo(2 + w, 34); ctx.quadraticCurveTo(9, 26, 8, 10); ctx.closePath();
    ctx.fillStyle = '#2bb6a0'; ctx.fill(); ctx.strokeStyle = f.dark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = '#5fd8c4'; ctx.lineWidth = 1;
    for (const [x, y] of [[-5, 16], [2, 16], [-2, 21], [4, 22], [-1, 27]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); }
    poly([[w, 32], [-10 + w, 42], [w, 38.5], [10 + w, 42]], '#7ff0dd', f.dark);
    oval(-1, 6, 9, 6, f.fur);
    if (back) stroke([[-9, 5], [7, 5]], '#7a5ad8', 1.6);
    else { oval(-4.5, 6, 3.5, 2.8, '#a78bfa'); oval(2.5, 6, 3.5, 2.8, '#a78bfa'); }
  }

  // Snögubbe: två snöbollar, pinnar till armar, morot och hög hatt
  function snowmanFace(f, dead) {
    if (dead) eyes(true, -8, 4);
    else { blob(-4, -8, 1.8, '#2a2a2a'); blob(4, -8, 1.8, '#2a2a2a'); }
    poly([[0, -5.2], [0, -1.8], [9, -3.2]], '#ff8c1a');
    for (const [x, y] of [[-4, 0.5], [-2, 1.6], [0, 2], [2, 1.6], [4, 0.5]]) blob(x, dead ? 2.5 - (y - 0.5) : y, 0.9, '#2a2a2a');
  }
  function snowmanHat() {
    rr(-9, -27, 18, 11, 2); ctx.fillStyle = '#2a2a33'; ctx.fill();
    rr(-12, -18, 24, 3, 1.5); ctx.fill();
    ctx.fillStyle = '#e63946'; ctx.fillRect(-9, -21, 18, 2.5);
  }
  function snowmanBody(f, dead, phase, back) {
    ovalEdge(0, 25, 14, 12, C.white, '#b9c8dc');
    ovalEdge(0, 10, 11, 9, C.white, '#b9c8dc');
    if (!back) for (const y of [7, 12, 22]) blob(0, y, 1.4, '#2a2a2a');
    rr(-9, 1, 18, 4.5, 2); ctx.fillStyle = '#e63946'; ctx.fill();
    if (!back) { rr(4, 3, 4.5, 10, 2); ctx.fillStyle = '#a8202a'; ctx.fill(); }
  }

  // Guldperson: guld från topp till tå, med krona
  function goldFace(f, dead) {
    oval(-6, -11, 3, 2, f.light, -0.5);
    eyes(dead, -8);
    cheeks(-2.5, '#f5b301', 8.5);
    smile(dead, -1, f.edge, 3.5);
  }
  function goldShine(f) { oval(-5, -11, 3.5, 2.2, f.light, -0.5); }
  function goldCrown(f) {
    poly([[-9, -15], [-9, -24], [-5, -19], [0, -26], [5, -19], [9, -24], [9, -15]], '#ffe066', f.edge);
    blob(-5, -17.5, 1.4, '#e63946'); blob(0, -18, 1.6, '#2f80ed'); blob(5, -17.5, 1.4, '#2bb673');
  }

  // ---------- Hjältarna ----------

  // De åtta egna hjältarna, samma som i Flappy Game, med var sitt märke på bröstet.
  function heroTorso(f, back) {
    if (f.edge) ovalEdge(-1, 12, 12, 10, f.fur, f.edge); else oval(-1, 12, 12, 10, f.fur);
    return !back;
  }

  // Nätkastaren: grön dräkt med nät, stora vita ögon och en spindel på bröstet
  function webLines(f) {
    clipOval(0, -6, 14.5, 13, () => {
      ctx.strokeStyle = f.dark; ctx.lineWidth = 0.8;
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(Math.cos(a) * 16, -6 + Math.sin(a) * 16); ctx.stroke(); }
      for (const r of [5, 9, 13]) { ctx.beginPath(); ctx.arc(0, -6, r, 0, Math.PI * 2); ctx.stroke(); }
    });
  }
  function webFace(f, dead) {
    webLines(f);
    if (dead) eyes(true, -8, 5, f.dark);
    else { ovalEdge(-5, -8, 4, 5, C.white, f.dark, -0.4); ovalEdge(5, -8, 4, 5, C.white, f.dark, 0.4); }
  }
  function webNape(f) { webLines(f); }
  function spider(x, y, s, color) {
    blob(x, y, 2.2 * s, color); blob(x, y + 3.5 * s, 1.6 * s, color);
    ctx.strokeStyle = color; ctx.lineWidth = 0.9 * s;
    for (const side of [-1, 1]) for (const dy of [-1.5, 0.5, 2.5]) { ctx.beginPath(); ctx.moveTo(x, y + 0.5 * s + dy * 0.5 * s); ctx.lineTo(x + side * 5 * s, y - 1 * s + dy * 1.6 * s); ctx.stroke(); }
  }
  function webBody(f, dead, phase, back) {
    heroTorso(f, back);
    spider(-1, back ? 9 : 10, back ? 1.6 : 1, f.dark);
  }

  // Plåthjälten: silverrustning, blått visir, en lysande stjärna och raketer på ryggen
  function ironFace(f, dead) {
    rr(-9, -13, 18, 11, 4); ctx.fillStyle = '#2f6fd6'; ctx.fill();
    if (dead) eyes(true, -8.5, 4, '#4cf0ff');
    else { ctx.fillStyle = '#4cf0ff'; rr(-7, -9.5, 5, 2.2, 1.1); ctx.fill(); rr(2, -9.5, 5, 2.2, 1.1); ctx.fill(); }
    oval(-7, -15, 3, 1.5, 'rgba(255,255,255,0.6)', -0.4);
  }
  function ironNape(f) {
    stroke([[0, -18], [0, 5]], f.edge, 1.5);
    rr(-8, -15, 4, 9, 2); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
  }
  function ironBody(f, dead, phase, back) {
    heroTorso(f, back);
    if (back) {
      for (const x of [-6, 4]) { rr(x - 3, 3, 6, 14, 3); ctx.fillStyle = '#7d8a97'; ctx.fill(); }
      return;
    }
    star(-1, 10, 5, '#4cf0ff'); blob(-1, 10, 1.8, C.white);
  }

  // Stenjätten: stor och grå som berget, med sprickor och orange shorts
  function stoneCracks(f) {
    ctx.strokeStyle = f.dark; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -15); ctx.lineTo(-6, -11); ctx.lineTo(-8, -7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(7, -1); ctx.stroke();
  }
  function stoneFace(f, dead) {
    stoneCracks(f);
    rr(-11, -14, 22, 4, 2); ctx.fillStyle = f.dark; ctx.fill();
    if (dead) eyes(true, -8, 5);
    else for (const x of [-5, 5]) { blob(x, -8, 2.2, C.white); blob(x, -7.6, 1.2, C.ink); }
    ctx.strokeStyle = f.dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    if (dead) ctx.arc(0, 2, 4, 1.15 * Math.PI, 1.85 * Math.PI); else ctx.arc(0, -3, 6, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
  }
  function stoneNape(f) { stoneCracks(f); }
  function stoneBody(f, dead, phase, back) {
    ovalEdge(-1, 12, 14, 11, f.fur, f.dark);
    clipOval(-1, 12, 14, 11, () => { ctx.fillStyle = '#ff8c1a'; ctx.fillRect(-16, 15, 30, 10); });
    stroke([[-6, 4], [-3, 8], [-5, 11]], f.dark, 1.1);
  }

  // Nattkatten: mörkblå dräkt med kattöron, guldögon, guldklor och ett halsband
  function nightEars(f) {
    poly([[-13, -10], [-11, -24], [-4, -17]], f.fur);
    poly([[13, -10], [11, -24], [4, -17]], f.fur);
  }
  function nightFace(f, dead) {
    if (dead) eyes(true, -8, 5, '#ffd23f');
    else { oval(-5, -8, 3.6, 1.6, '#ffd23f', 0.25); oval(5, -8, 3.6, 1.6, '#ffd23f', -0.25); }
    stroke([[0, -5], [0, -1]], '#ffd23f', 1.2);
  }
  function nightBody(f, dead, phase, back) {
    if (!heroTorso(f, back)) return;
    for (let k = 0; k < 5; k++) poly([[-7 + k * 3, 3], [-4.5 + k * 3, 3], [-5.75 + k * 3, 6]], '#ffd23f');
  }

  // Åskflickan: lila dräkt med blixt, gul mantel och gult hår
  function thunderCape(f, dead, back) {
    const w = dead ? 0 : Math.sin(time * 6) * 2;
    poly([[-9, 3], [9, 3], [15 + w, back ? 30 : 34], [-15 + w, back ? 30 : 34]], '#ffd23f', '#c99400');
  }
  function thunderFace(f, dead) {
    ctx.beginPath(); ctx.ellipse(0, -12, 13, 7, 0, Math.PI, Math.PI * 2); ctx.fillStyle = '#ffcf5a'; ctx.fill();
    oval(-11, -3, 3.5, 8, '#ffcf5a'); oval(11, -3, 3.5, 8, '#ffcf5a');
    eyes(dead, -7);
    cheeks(-2.5, '#ff9eb8', 7.5);
    smile(dead, -1, '#8a4a2a', 3);
  }
  function thunderNape() { oval(0, -6, 13, 13, '#ffcf5a'); stroke([[0, -18], [0, 6]], '#d9a32e', 1.2); }
  function thunderBody(f, dead, phase, back) {
    if (!heroTorso(f, back)) return;
    poly([[0, 3], [-4, 11], [-1, 11], [-3, 19], [3, 9], [0, 9], [2, 3]], '#ffd23f');
  }

  // Isblixten: ljusblå dräkt med snöflinga och vitt taggigt hår
  function iceHair() {
    for (const [x, y] of [[-10, -12], [-5, -18], [1, -20], [7, -18], [11, -12]]) poly([[x - 3, y + 5], [x, y - 5], [x + 3, y + 5]], C.white, '#b9c8dc');
    oval(0, -14, 11, 5, C.white);
  }
  function iceFace(f, dead) {
    eyes(dead, -7);
    smile(dead, -1, '#8a4a2a', 3.5);
  }
  function iceNape() { clipOval(0, -6, 12.5, 12.5, () => oval(0, -4, 13, 12, C.white)); }
  function iceBody(f, dead, phase, back) {
    if (!heroTorso(f, back)) return;
    ctx.strokeStyle = C.white; ctx.lineWidth = 1.4;
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-1 + Math.cos(a) * 5, 11 + Math.sin(a) * 5); ctx.lineTo(-1 - Math.cos(a) * 5, 11 - Math.sin(a) * 5); ctx.stroke(); }
  }

  // Vindhjälten: turkos dräkt med virvel, flygglasögon och brunt hår
  function windHair() { oval(0, -15, 12, 5.5, '#6b4423'); poly([[3, -19], [9, -23], [8, -16]], '#6b4423'); }
  function windFace(f, dead) {
    stroke([[-12.5, -9], [12.5, -9]], '#3a2f33', 1.6);
    if (dead) eyes(true, -9, 5);
    else { ovalEdge(-5, -9, 4.2, 3.8, '#ffd23f', '#3a2f33'); ovalEdge(5, -9, 4.2, 3.8, '#ffd23f', '#3a2f33'); }
    smile(dead, -1, '#8a4a2a', 3.5);
  }
  function windNape() {
    clipOval(0, -6, 12.5, 12.5, () => oval(0, -9, 13, 11, '#6b4423'));
    stroke([[-12.5, -9], [12.5, -9]], '#3a2f33', 1.6);
  }
  function windBody(f, dead, phase, back) {
    if (!heroTorso(f, back)) return;
    ctx.strokeStyle = C.white; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(-1, 11, 4.5, 0, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(-1, 11, 1.6, Math.PI, Math.PI * 2.4); ctx.stroke();
  }

  // Eldhjälten: röd dräkt med låga och hår av eld som fladdrar
  function fireHair(f, dead) {
    for (const [x, h] of [[-9, 10], [-4, 14], [1, 16], [6, 14], [10, 10]]) {
      const w = dead ? 0 : Math.sin(time * 12 + x) * 1.5;
      poly([[x - 4, -13], [x + w, -13 - h], [x + 4, -13]], '#ff9f1c');
      poly([[x - 2, -13], [x + w * 0.6, -13 - h * 0.6], [x + 2, -13]], '#ffe066');
    }
    oval(0, -14, 11, 4.5, '#ff9f1c');
  }
  function fireFace(f, dead) {
    eyes(dead, -7);
    smile(dead, -1, '#8a4a2a', 3.5);
  }
  function fireNape() { clipOval(0, -6, 12.5, 12.5, () => oval(0, -6, 13, 11, '#ff9f1c')); }
  function fireBody(f, dead, phase, back) {
    if (!heroTorso(f, back)) return;
    poly([[-1, 3], [-6, 11], [-1, 18], [4, 11]], '#ffd23f');
    poly([[-1, 8], [-3.5, 12], [-1, 16], [1.5, 12]], '#ff9f1c');
  }

  // ---------- Klättraren ----------

  const SHADE = 'rgba(0,0,0,0.22)';

  // Figuren i rutorna: hela klättraren i Climbing Game, och bara huvudet i Car Game,
  // där figurerna är förare.
  function drawPortrait(fig, x, y, size, reach) {
    if (!CAR) { drawClimber(x, y, { fig, size, reach }); return; }
    ctx.save();
    ctx.translate(x, y + 6 * size); ctx.scale(size * 2.3, size * 2.3);
    drawHead(FIGURES[fig], false, false);
    ctx.restore();
  }

  // Hand: en tass med fingrar, en hov, eller kvistar för snögubben
  function drawHand(f, [hx, hy]) {
    if (f.twig) {
      for (const [dx, dy] of [[-2.5, -4], [0, -5], [2.5, -4]]) stroke([[hx, hy], [hx + dx, hy + dy]], f.fur, 1.4);
      return;
    }
    oval(hx, hy - 1.5, 3.8, 3.4, f.hand ?? (f.hooves ? f.dark : f.light));
    if (f.hooves || f.fingers === false) return;
    ctx.strokeStyle = f.dark; ctx.lineWidth = 1.2;
    for (const dx of [-1.8, 0, 1.8]) { ctx.beginPath(); ctx.moveTo(hx + dx, hy - 4.5); ctx.lineTo(hx + dx, hy - 2.5); ctx.stroke(); }
  }

  function drawHead(f, dead, back) {
    if (f.neck) f.neck(f, back);
    ctx.save();
    if (f.lift) ctx.translate(0, -f.lift);
    if (f.behind) f.behind(f, back);
    if (typeof f.skull === 'function') f.skull(f);
    else {
      const s = f.skull ?? {}, rx = s.rx ?? 14.5, ry = s.ry ?? 13, y = s.y ?? -6, color = s.color ?? f.fur;
      // bakifrån skiljer en svag kontur huvudet från kroppen, som har samma färg
      const edge = s.edge ?? f.edge ?? (back ? SHADE : null);
      if (edge) ovalEdge(0, y, rx, ry, color, edge); else oval(0, y, rx, ry, color);
    }
    if (back) { if (f.nape) f.nape(f); }
    else if (f.face) f.face(f, dead);
    if (f.over) f.over(f, dead, back);
    ctx.restore();
  }

  // Klättraren: armar och ben som tar i väggen växelvis medan den klättrar, och
  // figurens kropp och huvud. `reach` styr armar och ben när den inte klättrar på
  // riktigt, som på startskärmen. `back` ritar den bakifrån, med ansiktet mot väggen.
  function drawClimber(x, y, { fig = figure, dead = false, size = 1, reach, back = false } = {}) {
    const f = FIGURES[fig];
    const phase = dead ? 0 : reach ?? Math.sin(climbed / 14);
    ctx.save();
    ctx.translate(x, y);
    if (dead) ctx.rotate(fallSpin);
    ctx.scale(size, 1.2 * size);

    if (f.shell && !back) f.shell(f, dead, back);
    const edge = f.limbEdge === undefined ? f.edge : f.limbEdge;
    const limb = (points, width, color) => {
      if (edge) stroke(points, edge, width + 2.5);
      stroke(points, color, width);
    };
    for (const side of [-1, 1]) {
      const up = side * phase * 5;
      const hand = [side * 23, -24 + up];
      limb([[side * 7, 8], [side * 20, -4 + up * 0.5], hand], f.armW ?? 6, f.arm ?? f.fur);
      drawHand(f, hand);
      if (f.legs === false) continue;
      const foot = [side * 11, 34 - up];
      limb([[side * 6, 16], [side * 9, 26 - up * 0.5], foot], 6.5, f.leg ?? f.fur);
      oval(foot[0] + side * 1.5, foot[1] + 1.5, 5.5, 3.2, f.foot ?? f.dark);
    }

    // framifrån hänger svansen bakom kroppen, bakifrån framför den
    if (f.tail && !back) f.tail(f, dead, back);
    if (f.body) f.body(f, dead, phase, back);
    else {
      const edge = f.edge ?? (back ? SHADE : null);
      if (edge) ovalEdge(-1, 12, 12, 10, f.fur, edge); else oval(-1, 12, 12, 10, f.fur);
      if (!back && f.belly !== null) oval(0, 14, 7, 6.5, f.belly ?? f.light);
    }
    if (f.tail && back) f.tail(f, dead, back);
    if (f.shell && back) f.shell(f, dead, back);
    drawHead(f, dead, back);
    ctx.restore();
  }

  // ---------- Världarna ----------

  // Var 40:e meter klättrar man in i en ny värld, med en egen vägg och egna saker som
  // faller; efter den sista börjar det om. Varje ny värld ger 2 blå mynt, som i
  // Flappy Game. `drops` är det som faller där: det första oftast.
  const WORLD_METERS = 40, WORLD_SPAN = WORLD_METERS * METER, WORLD_BONUS = 2;
  const WORLDS = [
    { name: 'Tegelväggen', wall: brickWall, colors: { mortar: '#dccab2', bricks: ['#b8513b', '#c25c44', '#ad4a35', '#c96a4f'] }, drops: ['kruka', 'tegel'] },
    { name: 'Trästaketet', wall: plankWall, colors: { gap: '#6b4a2b', wood: ['#d9a066', '#cf9458', '#e0ab72'], grain: '#a8723f', knot: '#b98048', rail: '#b07a45' }, drops: ['kruka', 'apple'] },
    { name: 'Slottsmuren', wall: stoneWall, colors: { mortar: '#5f6670', stones: ['#9aa3ad', '#8d96a1', '#a7afb8'], speck: '#6f7782' }, drops: ['sten', 'tegel'] },
    { name: 'Djungelträdet', wall: barkWall, colors: { base: '#6b4a2b', line: '#4a3018', knot: '#7a5636', vine: '#3f8a34', leaf: '#5cb83a' }, drops: ['kokosnot', 'apple'] },
    { name: 'Bambuskogen', wall: bambooWall, colors: { back: '#2f5a2a', stalk: ['#8cc84b', '#7dbb3f'], node: '#5f8f2a', leaf: '#4f9e2c' }, drops: ['kotte', 'kokosnot'] },
    { name: 'Isberget', wall: iceWall, colors: { mortar: '#9fd3ea', ice: ['#d6f3ff', '#c5ecfb', '#e2f7ff'] }, drops: ['istapp', 'snoboll'] },
    { name: 'Bergsklippan', wall: rockWall, colors: { base: '#7d7064', shades: ['#8a7d70', '#958878', '#74685c'], crack: '#4f453b' }, drops: ['sten', 'kotte'] },
    { name: 'Badrummet', wall: tileWall, colors: { grout: '#c9d6e0', tiles: ['#ffffff', '#dff1ff'], size: 36 }, drops: ['burk', 'agg'] },
    { name: 'Skyskrapan', wall: windowWall, colors: { base: '#4a5563', glass: '#7fb8e0', lit: '#ffe066' }, drops: ['kruka', 'burk'] },
    { name: 'Godisväggen', wall: candyWall, colors: { base: '#ffc2e2', candies: ['#ff5e7a', '#4cc9f0', '#ffd23f', '#6fdc8c', '#a78bfa'] }, drops: ['klubba', 'apple'] },
    { name: 'Bikupan', wall: hexWall, colors: { edge: '#c98f00', cells: ['#ffd23f', '#f5b301', '#ffe066'] }, drops: ['klubba', 'kotte'] },
    { name: 'Rymdskeppet', wall: metalWall, colors: { seam: '#4a5563', panels: ['#c3ccd6', '#b8c4d0', '#ced6de'], rivet: '#7d8a97', lights: ['#e63946', '#2bb673', '#4cc9f0'] }, drops: ['mutter', 'burk'] },
    { name: 'Pyramiden', wall: stoneWall, colors: { mortar: '#b08a50', stones: ['#e8c88a', '#dfbd7c', '#f0d49a'], speck: '#c9a466' }, drops: ['sten', 'kruka'] },
    { name: 'Vulkanen', wall: rockWall, colors: { base: '#3a2a2a', shades: ['#4a3434', '#523a38', '#3f2e2e'], glow: '#ff6a1a' }, drops: ['sten', 'sten'] },
    { name: 'Korallrevet', wall: rockWall, colors: { base: '#1f6f8b', shades: ['#ff8fa3', '#ffb347', '#5fd8c4', '#2a8fa8'], crack: '#165a70' }, drops: ['sten', 'burk'] },
    { name: 'Ladan', wall: plankWall, colors: { gap: '#5a1a14', wood: ['#b5321f', '#a82b1a', '#c23a24'], grain: '#7a1f12', knot: '#8f2a1a', rail: '#f3e6c2' }, drops: ['agg', 'kruka'] },
    { name: 'Spökhuset', wall: plankWall, colors: { gap: '#1d1a2a', wood: ['#4a3f5c', '#544868', '#3f3550'], grain: '#2a2238', knot: '#352c45', rail: '#2a2238' }, drops: ['bok', 'kruka'] },
    { name: 'Trollkarlstornet', wall: stoneWall, colors: { mortar: '#2a3555', stones: ['#5a6a9a', '#4f5f8f', '#6575a5'], speck: '#ffe066' }, drops: ['bok', 'kruka'] },
    { name: 'Pepparkakshuset', wall: brickWall, colors: { mortar: '#8a4a1f', bricks: ['#c27a3a', '#b86f30', '#cc8444'], icing: '#ffffff' }, drops: ['klubba', 'agg'] },
    { name: 'Glaciären', wall: iceWall, colors: { mortar: '#3f8fc0', ice: ['#8fd3ff', '#7fc8f5', '#a5dcff'] }, drops: ['istapp', 'snoboll'] },
    { name: 'Marmorpalatset', wall: tileWall, colors: { grout: '#c9c4bc', tiles: ['#f4f1ec', '#ebe6df', '#f9f7f3'], size: 60, vein: '#c9c0b4' }, drops: ['kruka', 'bok'] },
    { name: 'Fabriken', wall: metalWall, colors: { seam: '#3a2f2a', panels: ['#9a6a4a', '#8a5c3e', '#a87656'], rivet: '#5a3e2a' }, drops: ['mutter', 'burk'] },
    { name: 'Grottan', wall: rockWall, colors: { base: '#2f2b28', shades: ['#3d3834', '#46403b', '#36312d'], crack: '#1a1714' }, drops: ['sten', 'istapp'] },
    { name: 'Regnbågsväggen', wall: brickWall, colors: { mortar: '#ffffff', bricks: RAINBOW }, drops: ['klubba', 'kruka'] },
    { name: 'Månen', wall: craterWall, colors: { base: '#9a9fa8', crater: '#868b94', edge: '#6f747d' }, drops: ['sten', 'mutter'] },
    { name: 'Biblioteket', wall: bookWall, colors: { back: '#5a3a22', shelf: '#8a5a2b', books: ['#e63946', '#2f6fd6', '#2bb673', '#ffd23f', '#9b6dff', '#ff8c1a', '#1d2b4f'] }, drops: ['bok', 'kruka'] },
    { name: 'Köket', wall: tileWall, colors: { grout: '#d9d2bf', tiles: ['#ffffff', '#e63946'], size: 34 }, drops: ['agg', 'burk'] },
    { name: 'Akvariet', wall: tileWall, colors: { grout: '#1f6f8b', tiles: ['#5fc8e8', '#4fbadc', '#6fd2ee'], size: 48, bubbles: true }, drops: ['sten', 'burk'] },
    { name: 'Ostlandet', wall: cheeseWall, colors: { base: '#ffd23f', hole: '#e8b400', edge: '#c99400' }, drops: ['ost', 'apple'] },
    { name: 'Klossväggen', wall: legoWall, colors: { gap: '#2a2a33', bricks: ['#e63946', '#2f80ed', '#ffd23f', '#2bb673', '#ff8c1a'] }, drops: ['klubba', 'bok'] },
    { name: 'Chokladfabriken', wall: tileWall, colors: { grout: '#3f2414', tiles: ['#6b3f22', '#7a4a2a', '#5f371d'], size: 44 }, drops: ['klubba', 'agg'] },
    { name: 'Fyren', wall: stripeWall, colors: { across: true, colors: ['#e63946', '#ffffff'] }, drops: ['burk', 'sten'] },
    { name: 'Cirkustältet', wall: stripeWall, colors: { colors: ['#e63946', '#ffd23f'], dots: '#ffffff' }, drops: ['klubba', 'apple'] },
    { name: 'Snögrottan', wall: iceWall, colors: { mortar: '#c9d6e6', ice: ['#ffffff', '#f0f6ff', '#e6f0fb'] }, drops: ['snoboll', 'istapp'] },
    { name: 'Häcken', wall: hedgeWall, colors: { base: '#2f6b2a', leaves: ['#3f8a34', '#4f9e2c', '#5cb83a', '#367a2e'] }, drops: ['apple', 'kotte'] },
    { name: 'Blomsterväggen', wall: hedgeWall, colors: { base: '#3f7a34', leaves: ['#4f9e2c', '#5cb83a', '#6cc84a'], flowers: ['#ff5e7a', '#ffd23f', '#a78bfa', '#ffffff'] }, drops: ['kruka', 'apple'] },
    { name: 'Molnslottet', wall: cloudWall, colors: { sky: '#a8d8ff', cloud: '#ffffff' }, drops: ['snoboll', 'klubba'] },
    { name: 'Tempelruinen', wall: stoneWall, colors: { mortar: '#4f5a3a', stones: ['#8a9070', '#7f866a', '#96a07c'], speck: '#5cb83a' }, drops: ['sten', 'kokosnot'] },
    { name: 'Kristallgrottan', wall: hexWall, colors: { edge: '#3a2060', cells: ['#a78bfa', '#c3a8ff', '#8f6fe8', '#d8c8ff'] }, drops: ['istapp', 'sten'] },
    { name: 'Rymdstationen', wall: metalWall, colors: { seam: '#1d2b4f', panels: ['#3a4a7a', '#33436f', '#425285'], rivet: '#7f8fbf', lights: ['#4cf0ff', '#ffd23f', '#ff5e7a'] }, drops: ['mutter', 'burk'] },
    { name: 'Sandslottet', wall: stoneWall, colors: { mortar: '#d9b77a', stones: ['#f2dcaa', '#ead19a', '#f7e4b8'], speck: '#c9a466' }, drops: ['sten', 'burk'] },
    { name: 'Skogsstugan', wall: plankWall, colors: { gap: '#3a2414', wood: ['#8a5a3a', '#7a4e30', '#96643f'], grain: '#5a3a22', knot: '#6b4423', rail: '#5a3a22' }, drops: ['kotte', 'apple'] },
    { name: 'Guldväggen', wall: brickWall, colors: { mortar: '#8a6200', bricks: ['#ffd23f', '#f5b301', '#ffe066', '#e8c040'] }, drops: ['kruka', 'tegel'] },
  ];
  const worldIndex = h => Math.max(0, Math.floor(h / WORLD_SPAN)) % WORLDS.length;
  const worldAt = h => WORLDS[worldIndex(h)];

  // Väggen byter värld där höjden passerar en gräns, med en list emellan. Figuren
  // sitter på höjden `climbed`, så en gräns syns uppifrån en bit innan den kommer.
  function drawWall() {
    const here = Math.floor(climbed / WORLD_SPAN);
    const up = PLAYER_Y - ((here + 1) * WORLD_SPAN - climbed), down = PLAYER_Y + (climbed - here * WORLD_SPAN);
    for (const [top, bottom, w] of [[VY0, up, here + 1], [up, down, here], [down, VY1, here - 1]]) {
      const a = Math.max(top, VY0), b = Math.min(bottom, VY1);
      if (b <= a) continue;
      const world = WORLDS[Math.max(0, w) % WORLDS.length];
      ctx.save();
      ctx.beginPath(); ctx.rect(VX0, a, VW, b - a); ctx.clip();
      world.wall(world.colors);
      ctx.restore();
    }
    for (const y of here > 0 ? [up, down] : [up]) if (y > VY0 - 10 && y < VY1 + 10) ledge(y);
    // mörkare mot kanterna, så att mitten syns
    const g = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, Math.max(VW, VH) * 0.7);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g; ctx.fillRect(VX0, VY0, VW, VH);
  }
  function ledge(y) {
    rr(VX0 - 6, y - 6, VW + 12, 12, 4); ctx.fillStyle = '#7a5230'; ctx.fill();
    ctx.strokeStyle = '#4a2f18'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(VX0, y - 4, VW, 2);
  }

  // ---------- Väggarna ----------

  // Rader som täcker skärmen och rullar med klättringen: fn(y, rad) för varje rad, där
  // raden räknas i världen, så att samma rad ser likadan ut medan den rullar förbi.
  function rows(height, fn) {
    const offset = climbed % height, base = Math.floor(climbed / height);
    for (let r = Math.floor((VY0 - offset) / height) - 1; r * height + offset < VY1 + height; r++) fn(r * height + offset, r - base);
  }
  // Kolumner över hela bredden som syns, förskjutna `shift`: fn(x, kolumn).
  function cols(width, fn, shift = 0) {
    for (let x = Math.floor((VX0 - shift) / width) * width + shift - width; x < VX1 + width; x += width) fn(x, Math.round((x - shift) / width));
  }
  function fillWall(color) { ctx.fillStyle = color; ctx.fillRect(VX0, VY0, VW, VH); }
  const pick = (list, n) => list[n % list.length];
  const odd = n => ((n % 2) + 2) % 2 === 1;

  // Tegel: varannan rad förskjuten. Med `icing` får stenarna en kant av glasyr.
  function brickWall(c) {
    fillWall(c.mortar);
    rows(20, (y, row) => cols(48, (x, col) => {
      rr(x + 1.5, y + 1.5, 45, 17, 2.5);
      ctx.fillStyle = pick(c.bricks, hash(row * 31 + col * 7 + 1000)); ctx.fill();
      if (c.icing) { ctx.strokeStyle = c.icing; ctx.lineWidth = 1.6; ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 3, y + 3, 42, 2.5);
    }, odd(row) ? 24 : 0));
  }

  // Stora huggna stenblock, med prickar i stenen.
  function stoneWall(c) {
    fillWall(c.mortar);
    rows(40, (y, row) => cols(64, (x, col) => {
      const h = hash(row * 37 + col * 11 + 7);
      rr(x + 2, y + 2, 60, 36, 7);
      ctx.fillStyle = pick(c.stones, h); ctx.fill();
      blob(x + 10 + h % 40, y + 9 + (h >> 3) % 20, 1.6, c.speck);
      blob(x + 30 + (h >> 2) % 25, y + 24 + (h >> 5) % 8, 1.3, c.speck);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 6, y + 5, 50, 3);
    }, odd(row) ? 32 : 0));
  }

  // Isblock som glänser.
  function iceWall(c) {
    fillWall(c.mortar);
    rows(44, (y, row) => cols(60, (x, col) => {
      rr(x + 2, y + 2, 56, 40, 6);
      ctx.fillStyle = pick(c.ice, hash(row * 23 + col * 5 + 3)); ctx.fill();
      stroke([[x + 10, y + 32], [x + 22, y + 10]], 'rgba(255,255,255,0.6)', 2.5);
      stroke([[x + 18, y + 34], [x + 26, y + 20]], 'rgba(255,255,255,0.35)', 2);
    }, odd(row) ? 30 : 0));
  }

  // Plankor på höjden, med kvistar och tvärslåar.
  function plankWall(c) {
    fillWall(c.gap);
    cols(40, (x, col) => { rr(x + 1.5, VY0 - 4, 37, VH + 8, 3); ctx.fillStyle = pick(c.wood, Math.abs(col)); ctx.fill(); });
    rows(120, (y, row) => cols(40, (x, col) => {
      const h = hash(row * 13 + col * 5 + 11);
      stroke([[x + 10 + h % 6, y], [x + 12 + h % 6, y + 60], [x + 9 + h % 6, y + 120]], c.grain, 1.2);
      if (h % 3 === 0) ovalEdge(x + 24, y + 20 + h % 70, 3.5, 5.5, c.knot, c.grain);
    }));
    rows(220, y => {
      rr(VX0 - 4, y, VW + 8, 16, 3); ctx.fillStyle = c.rail; ctx.fill();
      cols(40, x => { blob(x + 20, y + 5, 1.6, c.grain); blob(x + 20, y + 11, 1.6, c.grain); });
    });
  }

  // Bark på en trädstam: ådror på höjden och kvistar.
  function barkWall(c) {
    fillWall(c.base);
    rows(90, (y, row) => cols(26, (x, col) => {
      const h = hash(row * 19 + col * 7 + 5);
      stroke([[x + h % 8, y - 2], [x + 4 + h % 8, y + 45], [x + h % 8, y + 92]], c.line, 2.5);
      if (h % 11 === 0) { ovalEdge(x + 13, y + 40, 6, 8, c.knot, c.line); oval(x + 13, y + 40, 2.5, 3.5, c.line); }
    }));
    if (c.vine) rows(160, (y, row) => {
      const x = VX0 + 40 + hash(row * 3 + 1) % Math.max(1, Math.floor(VW - 80));
      stroke([[x, y], [x + 12, y + 50], [x - 6, y + 110], [x + 4, y + 160]], c.vine, 3);
      oval(x + 10, y + 46, 6, 3, c.leaf, 0.6); oval(x - 4, y + 104, 6, 3, c.leaf, -0.6);
    });
  }

  // Bambu: stjälkar med knutar och några blad.
  function bambooWall(c) {
    fillWall(c.back);
    cols(36, (x, col) => {
      rr(x + 3, VY0 - 4, 30, VH + 8, 6); ctx.fillStyle = pick(c.stalk, Math.abs(col)); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x + 7, VY0 - 4, 4, VH + 8);
    });
    rows(72, (y, row) => cols(36, (x, col) => {
      const yy = y + hash(col * 17 + 3) % 72;
      ctx.fillStyle = c.node; ctx.fillRect(x + 2, yy, 32, 4);
      if (hash(row * 7 + col * 13) % 5 === 0) oval(x + 34, yy + 8, 10, 3.5, c.leaf, 0.5);
    }));
  }

  // Klippa: runda stenar i olika toner och sprickor. Med `glow` lyser sprickorna, som lava.
  function rockWall(c) {
    fillWall(c.base);
    rows(60, (y, row) => cols(60, (x, col) => {
      const h = hash(row * 29 + col * 11 + 13);
      blob(x + 10 + h % 40, y + 10 + (h >> 3) % 40, 14 + h % 14, pick(c.shades, h));
    }));
    rows(80, (y, row) => cols(70, (x, col) => {
      const h = hash(row * 43 + col * 17 + 2);
      if (h % 3) return;
      const pts = [[x + h % 30, y + 10], [x + 18 + h % 20, y + 34], [x + 8 + h % 26, y + 58]];
      if (c.glow) { stroke(pts, c.glow, 4); stroke(pts, '#ffe066', 1.5); }
      else stroke(pts, c.crack, 1.8);
    }));
  }

  // Kakel i ett rutnät. Med två färger blir det schackrutor; med `vein` marmor.
  function tileWall(c) {
    const s = c.size ?? 40;
    fillWall(c.grout);
    rows(s, (y, row) => cols(s, (x, col) => {
      rr(x + 1.5, y + 1.5, s - 3, s - 3, 3);
      ctx.fillStyle = c.tiles.length === 2 ? c.tiles[odd(row + col) ? 1 : 0] : pick(c.tiles, hash(row * 7 + col * 3 + 9)); ctx.fill();
      if (c.vein) { const h = hash(row * 5 + col * 11); stroke([[x + 4, y + 6 + h % 20], [x + s / 2, y + s / 2], [x + s - 6, y + s - 8 - h % 14]], c.vein, 1); }
      if (c.bubbles && hash(row * 3 + col * 7) % 4 === 0) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, 4, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 5, y + 4, s - 10, 3);
    }));
  }

  // Fönster i ett höghus; några lyser.
  function windowWall(c) {
    fillWall(c.base);
    rows(56, (y, row) => cols(48, (x, col) => {
      rr(x + 8, y + 8, 32, 40, 3);
      ctx.fillStyle = hash(row * 31 + col * 7) % 5 === 0 ? c.lit : c.glass; ctx.fill();
      stroke([[x + 24, y + 8], [x + 24, y + 48]], c.base, 2);
      stroke([[x + 12, y + 40], [x + 20, y + 14]], 'rgba(255,255,255,0.35)', 2);
    }));
  }

  // Ränder, på höjden eller på bredden.
  function stripeWall(c) {
    if (c.across) rows(80, y => {
      ctx.fillStyle = c.colors[0]; ctx.fillRect(VX0, y, VW, 40);
      ctx.fillStyle = c.colors[1]; ctx.fillRect(VX0, y + 40, VW, 40);
    });
    else cols(60, (x, col) => {
      ctx.fillStyle = c.colors[odd(col) ? 1 : 0]; ctx.fillRect(x, VY0, 60, VH);
    });
    if (c.dots) rows(60, (y, row) => cols(60, (x, col) => { if (hash(row * 7 + col) % 3 === 0) blob(x + 30, y + 30, 3, c.dots); }));
  }

  // Sexkanter, som i en bikupa eller en kristallgrotta.
  function hexWall(c) {
    fillWall(c.edge);
    rows(31, (y, row) => cols(36, (x, col) => {
      const cx = x + 18, cy = y + 15, p = [];
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; p.push([cx + Math.cos(a) * 17, cy + Math.sin(a) * 17]); }
      poly(p, pick(c.cells, hash(row * 13 + col * 7 + 4)));
      blob(cx - 5, cy - 5, 2.5, 'rgba(255,255,255,0.3)');
    }, odd(row) ? 18 : 0));
  }

  // Plåtar med nitar.
  function metalWall(c) {
    fillWall(c.seam);
    rows(64, (y, row) => cols(96, (x, col) => {
      rr(x + 2, y + 2, 92, 60, 4); ctx.fillStyle = pick(c.panels, hash(row * 11 + col * 3 + 1)); ctx.fill();
      for (const [dx, dy] of [[8, 8], [86, 8], [8, 56], [86, 56]]) blob(x + dx, y + dy, 2.2, c.rivet);
      if (c.lights && hash(row * 5 + col * 9) % 3 === 0) blob(x + 48, y + 32, 3.5, pick(c.lights, row + col));
    }, odd(row) ? 48 : 0));
  }

  // Bokhyllor, fulla av böcker.
  function bookWall(c) {
    fillWall(c.back);
    rows(70, (y, row) => {
      let x = VX0 - 12 + hash(row + 5) % 10, n = 0;
      while (x < VX1 + 12) {
        const h = hash(row * 97 + n * 13 + 3), bw = 9 + h % 9, bh = 40 + (h >> 4) % 18;
        rr(x, y + 62 - bh, bw, bh, 1.5); ctx.fillStyle = pick(c.books, h); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 1.5, y + 66 - bh, bw - 3, 2);
        x += bw + 1; n++;
      }
      ctx.fillStyle = c.shelf; ctx.fillRect(VX0, y + 62, VW, 8);
    });
  }

  // Ost med hål.
  function cheeseWall(c) {
    fillWall(c.base);
    rows(80, (y, row) => cols(80, (x, col) => {
      const h = hash(row * 17 + col * 23 + 6);
      ovalEdge(x + 20 + h % 40, y + 20 + (h >> 5) % 40, 6 + h % 10, 5 + h % 8, c.hole, c.edge);
    }));
  }

  // Byggklossar med knoppar.
  function legoWall(c) {
    fillWall(c.gap);
    rows(28, (y, row) => cols(56, (x, col) => {
      const color = pick(c.bricks, hash(row * 19 + col * 5 + 2));
      rr(x + 1, y + 1, 54, 26, 3); ctx.fillStyle = color; ctx.fill();
      for (const sx of [14, 42]) { blob(x + sx, y + 10, 6, 'rgba(0,0,0,0.15)'); blob(x + sx, y + 9, 6, color); blob(x + sx - 2, y + 7, 2, 'rgba(255,255,255,0.4)'); }
    }, odd(row) ? 28 : 0));
  }

  // En häck av blad, ibland med blommor.
  function hedgeWall(c) {
    fillWall(c.base);
    rows(22, (y, row) => cols(22, (x, col) => {
      const h = hash(row * 41 + col * 13 + 8);
      oval(x + 11, y + 11, 9, 5, pick(c.leaves, h), (h % 628) / 100);
      if (c.flowers && h % 9 === 0) { for (let k = 0; k < 5; k++) blob(x + 11 + Math.cos(k * 1.26) * 3.5, y + 11 + Math.sin(k * 1.26) * 3.5, 2.6, pick(c.flowers, h >> 3)); blob(x + 11, y + 11, 2, '#ffd23f'); }
    }));
  }

  // Månens yta med kratrar.
  function craterWall(c) {
    fillWall(c.base);
    rows(90, (y, row) => cols(90, (x, col) => {
      const h = hash(row * 31 + col * 19 + 4);
      ovalEdge(x + 20 + h % 50, y + 20 + (h >> 4) % 50, 8 + h % 14, 6 + h % 10, c.crater, c.edge);
      if (c.stars && h % 4 === 0) blob(x + (h >> 6) % 90, y + (h >> 2) % 90, 1.2, c.stars);
    }));
  }

  // Moln att klättra på.
  function cloudWall(c) {
    fillWall(c.sky);
    rows(110, (y, row) => cols(130, (x, col) => {
      const h = hash(row * 7 + col * 29 + 1), cx = x + 35 + h % 60, cy = y + 50;
      for (const [dx, dy, r] of [[-22, 6, 16], [0, -4, 22], [24, 6, 16], [0, 10, 18]]) blob(cx + dx, cy + dy, r, c.cloud);
    }, odd(row) ? 65 : 0));
  }

  // Godis: runda karameller med virvlar.
  function candyWall(c) {
    fillWall(c.base);
    rows(60, (y, row) => cols(60, (x, col) => {
      const h = hash(row * 13 + col * 31 + 5), cx = x + 15 + h % 30, cy = y + 15 + (h >> 4) % 30;
      blob(cx, cy, 10, pick(c.candies, h));
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 1.4); ctx.stroke();
    }));
  }

  // ---------- Det som faller ----------

  function drawRock(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    poly([[-12, -4], [-6, -12], [6, -11], [13, -2], [9, 10], [-4, 12], [-12, 6]], '#8b8f96', '#4f535b');
    blob(-4, -5, 2.5, 'rgba(255,255,255,0.35)');
    ctx.restore();
  }
  function drawIcicle(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(spin) * 0.2);
    poly([[-8, -14], [8, -14], [0, 16]], '#d6f3ff', '#5fa8cc');
    stroke([[-3, -11], [-1, 6]], 'rgba(255,255,255,0.8)', 1.5);
    ctx.restore();
  }
  function drawSnowball(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ovalEdge(0, 0, 12, 12, '#ffffff', '#8fa8c8');
    blob(-4, -4, 3, '#e6eef8'); blob(5, 3, 2, '#e6eef8');
    ctx.restore();
  }
  function drawCoconut(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ovalEdge(0, 0, 12, 11, '#7a4a24', '#3f240f');
    for (const [dx, dy] of [[-3, -3], [3, -3], [0, 2]]) blob(dx, dy, 1.8, '#3f240f');
    ctx.restore();
  }
  function drawApple(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(spin) * 0.4);
    ovalEdge(0, 2, 11.5, 10.5, '#e63946', '#9e1b25');
    stroke([[0, -7], [1, -13]], '#5a3a22', 2);
    oval(5, -11, 4.5, 2.2, '#3f8a34', -0.5);
    blob(-4, -2, 2.4, 'rgba(255,255,255,0.45)');
    ctx.restore();
  }
  function drawPinecone(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ovalEdge(0, 0, 8.5, 13, '#a0703a', '#5a3a1b');
    ctx.strokeStyle = '#5a3a1b'; ctx.lineWidth = 1.2;
    for (const yy of [-7, -2, 3, 8]) { ctx.beginPath(); ctx.arc(-3, yy, 4, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(3, yy, 4, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); }
    ctx.restore();
  }
  function drawBook(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    rr(-11, -14, 22, 28, 2); ctx.fillStyle = '#2f6fd6'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(7, -12, 3, 24);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(-11, -6, 18, 3);
    ctx.restore();
  }
  function drawCan(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    rr(-9, -13, 18, 26, 3); ctx.fillStyle = '#c9d2dc'; ctx.fill(); ctx.strokeStyle = '#5f6b77'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#e63946'; ctx.fillRect(-9, -5, 18, 10);
    stroke([[-9, -10], [9, -10]], '#5f6b77', 1); stroke([[-9, 10], [9, 10]], '#5f6b77', 1);
    ctx.restore();
  }
  function drawEgg(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ovalEdge(0, 0, 9, 12, '#fffaf0', '#b8a888');
    blob(-3, -4, 2, '#ffffff');
    ctx.restore();
  }
  function drawLolly(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    stroke([[0, 4], [0, 18]], '#f3e6c2', 3);
    ovalEdge(0, -3, 10, 10, '#ff5e9a', '#b8326a');
    ctx.strokeStyle = C.white; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -3, 6, 0, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -3, 2.5, Math.PI, Math.PI * 2.6); ctx.stroke();
    ctx.restore();
  }
  function drawNut(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    const p = [];
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; p.push([Math.cos(a) * 12, Math.sin(a) * 12]); }
    poly(p, '#a7b1bc', '#4a5563');
    ovalEdge(0, 0, 5, 5, '#5f6b77', '#4a5563');
    ctx.restore();
  }
  function drawCheese(x, y, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    poly([[-13, 9], [13, 9], [13, -2], [-13, -9]], '#ffd23f', '#c99400');
    blob(-4, 2, 2.6, '#e8b400'); blob(6, 4, 1.8, '#e8b400'); blob(5, -2, 1.5, '#e8b400');
    ctx.restore();
  }
  const DROPS = {
    kruka: drawPot, tegel: drawBrick, sten: drawRock, istapp: drawIcicle, snoboll: drawSnowball,
    kokosnot: drawCoconut, apple: drawApple, kotte: drawPinecone, bok: drawBook, burk: drawCan,
    agg: drawEgg, klubba: drawLolly, mutter: drawNut, ost: drawCheese,
  };

  // ---------- Krafterna ----------

  function drawPower(kind, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    POWERS[kind].draw();
    ctx.restore();
  }

  // Ikonerna ritas kring (0, 0), ungefär lika stora som sakerna.
  function drawShieldIcon() {
    poly([[0, -12], [10, -8], [9, 3], [0, 12], [-9, 3], [-10, -8]], C.blue, C.blueEdge);
    poly([[0, -9], [7, -6], [6.5, 2], [0, 8]], 'rgba(255,255,255,0.3)');
    star(0, -1, 5, C.white);
  }

  function drawMagnetIcon() {
    const horseshoe = () => {
      ctx.beginPath(); ctx.moveTo(-7, -8); ctx.lineTo(-7, 1);
      ctx.arc(0, 1, 7, Math.PI, 0, true); ctx.lineTo(7, -8); ctx.stroke();
    };
    ctx.lineCap = 'butt';
    ctx.strokeStyle = C.ink; ctx.lineWidth = 9.5; horseshoe();
    ctx.strokeStyle = '#e63946'; ctx.lineWidth = 6.5; horseshoe();
    for (const x of [-10.25, 3.75]) {
      ctx.fillStyle = '#e8edf2'; ctx.fillRect(x, -12, 6.5, 5);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x, -12, 6.5, 5);
    }
  }

  function drawSnailIcon() {
    rr(-12, 4, 24, 6, 3); ctx.fillStyle = '#b5e06a'; ctx.fill();
    ctx.strokeStyle = '#5b8a2a'; ctx.lineWidth = 1.5; ctx.stroke();
    seg(-9, 5, -12, -4); seg(-7, 5, -7, -5);
    blob(-12, -4, 1.6, C.ink); blob(-7, -5, 1.6, C.ink);
    ovalEdge(3, -1, 8, 8, '#ff9f1c', '#b86a00');
    ctx.strokeStyle = '#b86a00'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(3, -1, 4.5, 0, Math.PI * 1.5); ctx.stroke();
    blob(3, -1, 1.5, '#b86a00');
  }

  // Krafterna som verkar just nu, uppe till höger, med hur lång tid som är kvar.
  function drawActivePowers() {
    let x = VX1 - 14 - 34;
    const y = UI_T + 14;
    POWERS.forEach((pw, i) => {
      const left = pw.left();
      if (left <= 0) return;
      rr(x, y, 34, 34, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      drawPower(i, x + 17, y + 17, 0.85);
      if (pw.secs) { rr(x + 3, y + 38, 28 * left, 5, 2.5); ctx.fillStyle = C.banana; ctx.fill(); }
      x -= 40;
    });
  }

  // ---------- Sakerna ----------

  function seg(x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  function drawCoin() {
    ctx.save();
    ctx.scale(Math.max(0.15, Math.abs(Math.cos(time * 4))), 1);
    ovalEdge(0, 0, 10, 10, '#ffd23f', '#c99400');
    oval(0, 0, 6.5, 6.5, '#ffe580');
    star(0, 0, 4.5, '#e0a800');
    ctx.restore();
  }

  function drawBlueCoin() {
    ctx.save();
    ctx.scale(Math.max(0.15, Math.abs(Math.cos(time * 4 + 1))), 1);
    ovalEdge(0, 0, 10, 10, C.blue, C.blueEdge);
    oval(0, 0, 6.5, 6.5, '#9fe3ff');
    star(0, 0, 4.5, C.white);
    ctx.restore();
  }

  function drawBanana() {
    ctx.save();
    ctx.rotate(-0.4);
    ctx.beginPath();
    ctx.arc(0, -4, 12, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.arc(0, -10, 13, 0.75 * Math.PI, 0.25 * Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = '#ffd93d'; ctx.fill();
    ctx.strokeStyle = '#b88a00'; ctx.lineWidth = 1.5; ctx.stroke();
    blob(9.6, 3, 1.8, '#6b4a2b');
    blob(-9.6, 3, 1.8, '#6b4a2b');
    ctx.restore();
  }

  function drawPackage() {
    rr(-10, -6, 20, 15, 2); ctx.fillStyle = '#ff5e7a'; ctx.fill();
    ctx.strokeStyle = '#b8324f'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-2, -6, 4, 15);
    rr(-11, -10, 22, 6, 2); ctx.fillStyle = '#ff7a92'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(-2, -10, 4, 6);
    oval(-4, -12, 4, 2.5, '#ffd23f', -0.5);
    oval(4, -12, 4, 2.5, '#ffd23f', 0.5);
    blob(0, -11.5, 1.8, '#f5a300');
  }

  function drawStarItem() {
    ctx.save();
    ctx.rotate(Math.sin(time * 2) * 0.3);
    star(0, 0, 13, '#f5a300');
    star(0, 0, 10, '#ffe066');
    blob(-2.5, -3, 1.6, C.white);
    ctx.restore();
  }

  function drawDiamond() {
    poly([[-10, -4], [-5, -10], [5, -10], [10, -4], [0, 11]], '#7fe3ff', '#2a9cc4');
    ctx.strokeStyle = '#2a9cc4'; ctx.lineWidth = 1;
    seg(-10, -4, 10, -4);
    seg(-5, -10, -2, -4); seg(5, -10, 2, -4);
    seg(-2, -4, 0, 11); seg(2, -4, 0, 11);
    const a = ctx.globalAlpha;
    ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(time * 5));
    star(5, -8, 3.5, C.white);
    ctx.globalAlpha = a;
  }

  function drawItem(kind, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    ITEMS[kind].draw();
    ctx.restore();
  }

  function drawCrate(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    rr(-14, -11, 28, 22, 3); ctx.fillStyle = '#c08a4a'; ctx.fill();
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineWidth = 1.5;
    seg(-14, -4, 14, -4); seg(-14, 4, 14, 4);
    seg(-9, -11, -9, 11); seg(9, -11, 9, 11);
    ctx.restore();
  }

  // En rad med lådan och vad som finns i den: antal per sak, från x och åt höger.
  function drawBoxRow(counts, x, y, { color = C.white, outline = C.ink, step = 52, empty = '' } = {}) {
    drawCrate(x, y, 0.85);
    let cx = x + 26;
    if (!counts.some(n => n > 0)) {
      if (empty) say(empty, cx, y + 1, 14, { font: BODY, weight: '800', fill: color, outline, align: 'left' });
      return;
    }
    counts.forEach((n, i) => {
      if (!n) return;
      drawItem(i, cx + 9, y, 0.75);
      say(String(n), cx + 21, y + 1, 15, { font: BODY, weight: '800', fill: color, outline, align: 'left' });
      cx += step;
    });
  }

  // ---------- Hindren och vägen ----------

  // Det som faller i Climbing Game, med en skugga som lyfter det ut från väggen.
  function drawDrops() {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
    for (const f of obstacles) (DROPS[f.kind] ?? drawPot)(f.x, f.y, f.spin);
    ctx.restore();
  }

  // Car Games bana, sedd från bilen: gräs med träd och buskar, banan med röda och vita
  // kantstenar och streckad mittlinje, och mållinjen vid varje helt varv.
  const ROAD = { grass: '#5cb83a', grassDark: '#47992a', road: '#5a5f66', line: '#f4f1e0' };
  function drawCircuit() {
    ctx.fillStyle = ROAD.grass; ctx.fillRect(VX0, VY0, VW, VH);
    const me = trackAt(climbed);
    const from = Math.floor((climbed - (VY1 - PLAYER_Y) - 80) / STEP) * STEP, to = climbed + (PLAYER_Y - VY0) + 140;
    for (let at = Math.floor(from / 90) * 90; at < to; at += 90) {
      const h = hash(Math.round(at / 90) * 13 + 7);
      for (const side of [-1, 1]) {
        if ((h >> (side + 2)) % 3 === 0) continue;
        const [x, y] = toScreen(trackPoint(at, side * (ROADW / 2 + 36 + h % 70)), me);
        if (h % 2) { blob(x, y, 15, '#3f8a34'); blob(x - 4, y - 4, 9, '#5cb83a'); }
        else oval(x, y, 13, 8, ROAD.grassDark);
      }
    }
    const left = [], right = [], mid = [];
    for (let at = from; at <= to; at += STEP) {
      left.push([at, toScreen(trackPoint(at, -ROADW / 2), me)]);
      right.push([at, toScreen(trackPoint(at, ROADW / 2), me)]);
      mid.push([at, toScreen(trackPoint(at, 0), me)]);
    }
    ctx.beginPath();
    left.forEach(([, [x, y]], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][1][0], right[i][1][1]);
    ctx.closePath(); ctx.fillStyle = ROAD.road; ctx.fill();
    ctx.lineCap = 'butt';
    for (const edge of [left, right]) {
      for (let i = 1; i < edge.length; i++) {
        ctx.strokeStyle = Math.floor(edge[i][0] / 40) % 2 ? '#e63946' : C.white; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(edge[i - 1][1][0], edge[i - 1][1][1]); ctx.lineTo(edge[i][1][0], edge[i][1][1]); ctx.stroke();
      }
    }
    ctx.strokeStyle = ROAD.line; ctx.lineWidth = 3;
    for (let i = 1; i < mid.length; i++) {
      if (Math.floor(mid[i][0] / 40) % 2) continue;
      ctx.beginPath(); ctx.moveTo(mid[i - 1][1][0], mid[i - 1][1][1]); ctx.lineTo(mid[i][1][0], mid[i][1][1]); ctx.stroke();
    }
    // mållinjen: rutigt band tvärs över banan
    for (let lap = Math.ceil(from / LAP) * LAP; lap <= to; lap += LAP) {
      for (let row = 0; row < 2; row++) {
        for (let k = 0; k < 10; k++) {
          const lat = -ROADW / 2 + k * ROADW / 10;
          const quad = [trackPoint(lap + row * 9, lat), trackPoint(lap + row * 9, lat + ROADW / 10), trackPoint(lap + row * 9 + 9, lat + ROADW / 10), trackPoint(lap + row * 9 + 9, lat)].map(q => toScreen(q, me));
          ctx.beginPath(); quad.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
          ctx.fillStyle = (k + row) % 2 ? C.ink : C.white; ctx.fill();
        }
      }
    }
  }

  // Motståndarna och sakerna på banan, där de är.
  function drawRaceCoins() {
    const me = trackAt(climbed);
    for (const r of rivals) {
      if (r.s < climbed - 300 || r.s > climbed + 800) continue;
      const [x, y] = toScreen(trackPoint(r.s, r.lat), me);
      drawF1(x, y, wrapAngle(trackAt(r.s).dir - me.dir), r);
    }
    for (const it of raceItems) {
      if (it.s < climbed - 200 || it.s > climbed + 800) continue;
      const [x, y] = toScreen(trackPoint(it.s, it.lat), me);
      blob(x, y, 16, 'rgba(255,255,255,0.35)');
      drawItem(it.kind, x, y);
    }
  }

  // Kartan uppe till höger: hela slingan, mållinjen och en prick där bilen är.
  function drawMinimap() {
    const b = { x: VX1 - 14 - 110, y: UI_T + 14, w: 110, h: 80 };
    rr(b.x, b.y, b.w, b.h, 12); ctx.fillStyle = 'rgba(255,247,224,0.9)'; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of CIRCUIT) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const k = Math.min((b.w - 20) / (x1 - x0), (b.h - 20) / (y1 - y0));
    const map = p => [b.x + b.w / 2 + (p.x - (x0 + x1) / 2) * k, b.y + b.h / 2 + (p.y - (y0 + y1) / 2) * k];
    ctx.beginPath();
    CIRCUIT.forEach((p, i) => { const [x, y] = map(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.closePath(); ctx.strokeStyle = '#5a5f66'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    const [sx, sy] = map(CIRCUIT[0]);
    ctx.fillStyle = C.ink; ctx.fillRect(sx - 1.5, sy - 5, 3, 10);
    for (const r of rivals) { const [rx, ry] = map(trackAt(r.s)); blob(rx, ry, 3.2, r.color); }
    const [px, py] = map(trackAt(climbed));
    blob(px, py, 4.5, '#e63946'); ctx.strokeStyle = C.white; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.stroke();
  }

  // Ens egen bil: en röd F1-bil uppifrån, med nosen uppåt, vingar fram och bak, stora
  // hjul utanför karossen och figuren man har valt i cockpiten, sedd bakifrån.
  function drawF1(x, y, angle = 0, { color: red = '#e63946', dark = '#9e1b25', fig = figure, number = '1' } = {}) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = '#1d1d1d';
    for (const [dx, dy, h] of [[-23, -26, 15], [15, -26, 15], [-24, 12, 18], [15, 12, 18]]) { rr(dx, dy, 9, h, 3); ctx.fill(); }
    rr(-22, -37, 44, 6, 2); ctx.fillStyle = red; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 1.2; ctx.stroke();
    rr(-20, 30, 40, 8, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; ctx.fillRect(-20, 32, 40, 2);
    ctx.beginPath();
    ctx.moveTo(-4, -34); ctx.lineTo(4, -34); ctx.lineTo(7, -12); ctx.lineTo(14, -6); ctx.lineTo(14, 18);
    ctx.lineTo(8, 30); ctx.lineTo(-8, 30); ctx.lineTo(-14, 18); ctx.lineTo(-14, -6); ctx.lineTo(-7, -12); ctx.closePath();
    ctx.fillStyle = red; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C.white; ctx.fillRect(-1.5, -33, 3, 18);
    rr(-7, -10, 14, 18, 6); ctx.fillStyle = '#1d1d1d'; ctx.fill();
    // föraren: figurens huvud, bakifrån, som man ser det när bilen kör uppåt
    ctx.save(); ctx.translate(0, 2); ctx.scale(0.42, 0.42); drawHead(FIGURES[fig], false, true); ctx.restore();
    ctx.fillStyle = C.white; ctx.font = `10px ${DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(number, 0, 19);
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

  // ---------- Skärmarna ----------

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

  // Startskärmen, som Flappy Games: figuren stor och Starta i mitten, och Figurer,
  // Inställningar och Topplista längst ner. Bara Starta startar, så att ett tryck
  // bredvid en knapp inte sätter i gång en runda. Knapparna räknas fram varje gång,
  // eftersom skärmen kan ändra storlek.
  const START_BTN = { x: W / 2 - 110, y: 396, w: 220, h: 64 };
  const BTN_W = 118, BTN_H = 60;
  const bottomBtn = x => ({ x, y: UI_B - 74, w: BTN_W, h: BTN_H });
  const figuresBtn = () => bottomBtn(14);
  const settingsBtn = () => bottomBtn((W - BTN_W) / 2);
  const scoresBtn = () => bottomBtn(W - 14 - BTN_W);

  function drawButtonFrame(b) {
    rr(b.x, b.y, b.w, b.h, 12);
    ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  }

  function drawGear(cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = C.ink;
    for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -13, 6, 6); }
    ctx.restore();
    blob(cx, cy, 9.5, C.ink);
    blob(cx, cy, 4, C.panel);
  }

  function drawTrophy(cx, top) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx - 9, top + 7, 5, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 9, top + 7, 5, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10, top); ctx.lineTo(cx + 10, top);
    ctx.quadraticCurveTo(cx + 10, top + 17, cx, top + 17);
    ctx.quadraticCurveTo(cx - 10, top + 17, cx - 10, top);
    ctx.closePath();
    ctx.fillStyle = C.gold; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 2, top + 17, 4, 5);
    rr(cx - 8, top + 21, 16, 6, 2);
    ctx.fillStyle = C.gold; ctx.fill(); ctx.stroke();
  }

  // Ikon överst och namn under, så att alla tre får plats på en rad.
  function drawStartButtons() {
    const label = (b, text) => say(text, b.x + b.w / 2, b.y + 46, 14, { font: BODY, weight: '800', fill: C.ink, outline: null });
    const fig = figuresBtn(), set = settingsBtn(), top = scoresBtn();
    drawButtonFrame(fig);
    drawPortrait(figure, fig.x + BTN_W / 2, fig.y + 21, 0.36, Math.sin(time * 4));
    label(fig, 'Figurer');
    drawButtonFrame(set);
    drawGear(set.x + BTN_W / 2, set.y + 21);
    label(set, 'Inställningar');
    drawButtonFrame(top);
    drawTrophy(top.x + BTN_W / 2, top.y + 8);
    label(top, 'Topplista');
  }

  function drawStart() {
    drawTitle(TRACK.title, W / 2, 98, 50);
    if (best) say(`Rekord ${formatScore(best)}`, W / 2, 146, 20, { fill: C.banana });
    TRACK.drawHero();
    say(FIGURES[figure].name, W / 2, 372, 22);
    drawButton(START_BTN, 'Starta', 34, { pulse: true });
    drawStartButtons();
    drawMedalBadge();
    if (TRACK.worlds) drawWorldBadge();
  }

  function drawMedal(m, x, y, r) {
    poly([[x - r * 0.9, y - r * 1.7], [x - r * 0.2, y - r * 1.7], [x + r * 0.3, y - r * 0.5], [x - r * 0.4, y - r * 0.5]], '#2f80ed');
    poly([[x + r * 0.2, y - r * 1.7], [x + r * 0.9, y - r * 1.7], [x + r * 0.4, y - r * 0.5], [x - r * 0.3, y - r * 0.5]], '#e63946');
    ovalEdge(x, y, r, r, m.color, C.ink);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, Math.PI * 2); ctx.stroke();
    blob(x - r * 0.35, y - r * 0.35, r * 0.22, 'rgba(255,255,255,0.7)');
  }

  // En medalj och dess namn, centrerade kring x, eller slutande vid x med align 'right'.
  function drawMedalLine(m, x, y, size, text, opts) {
    ctx.font = `${opts.weight ?? ''} ${size}px ${opts.font ?? DISPLAY}`.trim();
    const r = size * 0.5, width = ctx.measureText(text).width + r * 2 + 8;
    const left = opts.align === 'right' ? x - width : x - width / 2;
    drawMedal(m, left + r, y, r);
    say(text, left + r * 2 + 8, y + 1, size, { ...opts, align: 'left' });
  }

  // Medaljsamlingen överst på startskärmen, som i Flappy Game: hur många av varje; de
  // man inte har är bleka.
  const medalBadge = () => ({ x: W / 2 - 62, y: UI_T + 14, w: 124, h: 44 });
  // Den högsta världen man har nått, uppe till höger, som nivån i Flappy Game.
  const worldBadge = () => ({ x: VX1 - 14 - 120, y: UI_T + 14, w: 120, h: 44 });
  function drawWorldBadge() {
    const b = worldBadge(), w = bestWorld % WORLDS.length;
    drawButtonFrame(b);
    say(`Värld ${w + 1}`, b.x + b.w / 2, b.y + 15, 17, { fill: C.ink, outline: null });
    ctx.font = `800 11px ${BODY}`;
    let name = WORLDS[w].name;
    while (ctx.measureText(name).width > b.w - 12 && name.length > 3) name = name.slice(0, -1);
    say(name === WORLDS[w].name ? name : name + '…', b.x + b.w / 2, b.y + 32, 11, { font: BODY, weight: '800', fill: C.dirt, outline: null });
  }

  function drawMedalBadge() {
    const b = medalBadge();
    drawButtonFrame(b);
    MEDALS.forEach((m, i) => {
      // plats för tvåsiffriga antal innan nästa medalj
      const x = b.x + 15 + i * 38;
      ctx.globalAlpha = medalCount[i] ? 1 : 0.35;
      drawMedal(m, x, b.y + 25, 8);
      ctx.globalAlpha = 1;
      say(String(medalCount[i]), x + 11, b.y + 25, 14, { font: BODY, weight: '800', fill: C.ink, outline: null, align: 'left' });
    });
  }

  // ---------- Rutorna ----------

  function dim() { ctx.fillStyle = 'rgba(16,41,27,0.55)'; ctx.fillRect(VX0, VY0, VW, VH); }

  function drawPanel(p, title) {
    rr(p.x, p.y, p.w, p.h, 20);
    ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    if (title) say(title, W / 2, p.y + 34, 30, { fill: C.ink, outline: null });
  }

  const closeButton = p => ({ x: W / 2 - 80, y: p.y + p.h - 56, w: 160, h: 44 });
  function drawCloseButton(b) {
    rr(b.x, b.y, b.w, b.h, 22);
    ctx.fillStyle = C.ink; ctx.fill();
    say('Stäng', W / 2, b.y + b.h / 2 + 1, 20, { fill: C.white, outline: null });
  }

  // Figurer: alla klätterfigurer, de man har först. De man har väljs med ett tryck; en
  // låst köps med ett tryck, och priset står i hörnet. Pilarna bläddrar mellan sidorna.
  const FIG_PANEL = { x: 14, y: 34, w: 372, h: 532 };
  const FIG_COLS = 4, FIG_PER = 16;
  const FIG_CLOSE = { x: W / 2 - 70, y: FIG_PANEL.y + FIG_PANEL.h - 54, w: 140, h: 42 };
  const FIG_PREV = { x: FIG_PANEL.x + 16, y: FIG_CLOSE.y, w: 50, h: 42 };
  const FIG_NEXT = { x: FIG_PANEL.x + FIG_PANEL.w - 66, y: FIG_CLOSE.y, w: 50, h: 42 };
  const figCell = k => ({ x: FIG_PANEL.x + 9 + (k % FIG_COLS) * 90, y: FIG_PANEL.y + 74 + Math.floor(k / FIG_COLS) * 96, w: 84, h: 90 });

  // Ordningen räknas när rutan öppnas och står still medan den är öppen.
  let picker = [], figPage = 0;
  const figPages = () => Math.max(1, Math.ceil(picker.length / FIG_PER));
  function openFigures() {
    ownedIds = readOwned();
    const all = FIGURES.map((_, i) => i);
    picker = [...all.filter(i => owned(FIGURES[i].id)), ...all.filter(i => !owned(FIGURES[i].id) && !FIGURES[i].gift)];
    figPage = Math.floor(Math.max(0, picker.indexOf(figure)) / FIG_PER);
  }
  function turnFigPage(step) {
    const next = Math.max(0, Math.min(figPages() - 1, figPage + step));
    if (next !== figPage) { figPage = next; play('select', 0.3); }
  }
  // figuren i rutan som ett tryck träffar, eller -1
  function figureAt(p) {
    for (let k = 0; k < FIG_PER; k++) {
      const i = picker[figPage * FIG_PER + k];
      if (i !== undefined && inside(p, figCell(k))) return i;
    }
    return -1;
  }

  function drawArrow(b, dir, enabled) {
    ctx.globalAlpha = enabled ? 1 : 0.3;
    rr(b.x, b.y, b.w, b.h, b.h / 2);
    ctx.fillStyle = C.banana; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    poly([[cx + dir * 7, cy], [cx - dir * 5, cy - 9], [cx - dir * 5, cy + 9]], C.ink);
    ctx.globalAlpha = 1;
  }

  function drawPadlock(cx, cy) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy - 3, 8, Math.PI, Math.PI * 2); ctx.stroke();
    rr(cx - 12, cy - 4, 24, 19, 4);
    ctx.fillStyle = C.banana; ctx.fill();
    ctx.lineWidth = 2.5; ctx.stroke();
    blob(cx, cy + 4, 2.6, C.ink);
  }

  // Priset i blå mynt i hörnet på en låst figur, med högerkanten vid `right`; grönt
  // när man har råd.
  function drawPriceTag(right, y, price) {
    const afford = blueCoins() >= price, w = price < 10 ? 30 : 36, x = right - w;
    rr(x, y, w, 18, 9);
    ctx.fillStyle = afford ? C.on : C.white; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ovalEdge(x + 9, y + 9, 5.5, 5.5, C.blue, C.blueEdge);
    blob(x + 7.6, y + 7.5, 1.6, 'rgba(255,255,255,0.8)');
    say(String(price), x + 16 + (w - 16) / 2, y + 9.5, 13, { font: BODY, weight: '800', fill: afford ? C.white : C.ink, outline: null });
  }

  function drawFigures() {
    dim();
    drawPanel(FIG_PANEL, 'Figurer');
    const pages = figPages();
    const line = `${blueCoins()} blå mynt` + (pages > 1 ? ` · sida ${figPage + 1} av ${pages}` : '');
    say(line, W / 2 + 9, FIG_PANEL.y + 60, 13, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    ctx.font = `800 13px ${BODY}`;
    drawItem(ITEMS.findIndex(it => it.currency), W / 2 + 9 - ctx.measureText(line).width / 2 - 12, FIG_PANEL.y + 60, 0.6);
    picker.slice(figPage * FIG_PER, (figPage + 1) * FIG_PER).forEach((i, k) => {
      const f = FIGURES[i], c = figCell(k), on = i === figure, mine = owned(f.id);
      rr(c.x, c.y, c.w, c.h, 12);
      ctx.fillStyle = on ? C.banana : mine ? C.panelRow : C.locked; ctx.fill();
      ctx.strokeStyle = on ? C.ink : 'rgba(29,43,31,0.25)'; ctx.lineWidth = on ? 3 : 2; ctx.stroke();
      const cx = c.x + c.w / 2;
      if (mine) drawPortrait(i, cx, c.y + 41, 0.6, on ? Math.sin(time * 4) : 0);
      else {
        ctx.globalAlpha = 0.3;
        drawPortrait(i, cx, c.y + 41, 0.6, 0);
        ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(cx, c.y + 41); ctx.scale(0.6, 0.6); drawPadlock(0, 0); ctx.restore();
        drawPriceTag(c.x + c.w - 4, c.y + 4, figurePrice(i));
      }
      say(f.name, cx, c.y + c.h - 10, 12, { font: BODY, weight: '800', fill: C.ink, outline: null });
    });
    // vad ett tryck gör, eller vad som just hände
    const note = time - figMsg.at < 1.8 ? figMsg.text : 'Tryck på en låst figur för att köpa den';
    say(note, W / 2, FIG_CLOSE.y - 13, 12, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    drawArrow(FIG_PREV, -1, figPage > 0);
    drawArrow(FIG_NEXT, 1, figPage < pages - 1);
    drawCloseButton(FIG_CLOSE);
  }

  // Inställningar: ljudeffekter och musik, samma som i Flappy Game.
  const SETTINGS_PANEL = { x: 36, y: 140, w: 328, h: 292 };
  const SETTINGS_CLOSE = closeButton(SETTINGS_PANEL);
  const settingsRow = i => ({ x: SETTINGS_PANEL.x + 12, y: SETTINGS_PANEL.y + 62 + i * 76, w: SETTINGS_PANEL.w - 24, h: 66 });

  function drawSwitch(x, y, on) {
    rr(x, y, 64, 34, 17);
    ctx.fillStyle = on ? C.on : C.off; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    say(on ? 'På' : 'Av', on ? x + 21 : x + 43, y + 18, 13, { font: BODY, weight: '800', fill: on ? C.white : C.ink, outline: null });
    blob(on ? x + 47 : x + 17, y + 17, 12, C.white);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(on ? x + 47 : x + 17, y + 17, 12, 0, Math.PI * 2); ctx.stroke();
  }

  function drawSettings() {
    const P = SETTINGS_PANEL;
    dim();
    drawPanel(P, 'Inställningar');
    const rows = [
      { label: 'Ljudeffekter', note: 'Byta spår, meter och fall', on: sfxOn },
      { label: 'Musik', note: 'En glad låt medan du klättrar', on: musicOn },
    ];
    rows.forEach((row, i) => {
      const r = settingsRow(i);
      if (i) { ctx.fillStyle = C.panelRow; ctx.fillRect(r.x + 8, r.y - 6, r.w - 16, 2); }
      say(row.label, r.x + 12, r.y + 22, 20, { fill: C.ink, outline: null, align: 'left' });
      say(row.note, r.x + 12, r.y + 46, 12, { font: BODY, weight: '800', fill: C.dirt, outline: null, align: 'left' });
      drawSwitch(r.x + r.w - 76, r.y + 16, row.on);
    });
    say('Gäller i Flappy Game också', W / 2, P.y + 218, 12, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    drawCloseButton(SETTINGS_CLOSE);
  }

  // Topplistan: de tio som har klättrat högst. Den egna raden är gul.
  const BOARD = { x: 36, y: 78, w: 328, h: 440 };
  const BOARD_CLOSE = closeButton(BOARD);
  const figIndex = id => Math.max(0, FIGURES.findIndex(f => f.id === id));
  function drawBoard() {
    dim();
    drawPanel(BOARD, 'Topp 10');
    const where = { loading: 'Hämtar listan…', ready: 'Alla som klättrar', error: 'Listan går inte att hämta just nu' }[listMode];
    say(where, W / 2, BOARD.y + 62, 13, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    if (!topList.length && listMode === 'ready') {
      say('Ingen på listan än', W / 2, BOARD.y + 190, 24, { fill: C.ink, outline: null });
      say('Klättra och bli först!', W / 2, BOARD.y + 222, 16, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    }
    topList.forEach((e, i) => {
      const y = BOARD.y + 80 + i * 28;
      const mine = sameEntry(e, savedEntry);
      if (mine || i % 2 === 0) {
        rr(BOARD.x + 12, y, BOARD.w - 24, 26, 13);
        ctx.fillStyle = mine ? C.banana : C.panelRow; ctx.fill();
        if (mine) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      }
      if (i < 3) blob(BOARD.x + 32, y + 13, 10, C.medals[i]);
      say(String(i + 1), BOARD.x + 32, y + 14, 16, { fill: C.ink, outline: null });
      drawPortrait(figIndex(e.figure), BOARD.x + 62, y + 11, 0.3, 0);
      say(e.name, BOARD.x + 86, y + 14, 16, { font: BODY, weight: '800', fill: C.ink, outline: null, align: 'left' });
      say(formatScore(e.score), BOARD.x + BOARD.w - 26, y + 14, 18, { fill: C.ink, outline: null, align: 'right' });
    });
    drawCloseButton(BOARD_CLOSE);
  }

  // Efter ett fall: hur högt man kom, stort, och under det rekordet, medaljen, lådan
  // och världen. Väggen syns som vanligt bakom. Gå till startsidan tar en till
  // startskärmen och Spela igen startar en ny runda direkt. Knapparna går att trycka på
  // först efter en kort stund, så att ett tryck i farten inte gör det.
  const overButton = (py, ph) => ({ x: W / 2 - 120, y: py + ph + 18, w: 240, h: 56 });
  const againButton = b => ({ x: b.x, y: b.y + b.h + 12, w: b.w, h: b.h });
  let OVER_BTN = overButton(130, 256), AGAIN_BTN = againButton(OVER_BTN);
  function drawOver() {
    const pw = 280, ph = placed ? 290 : 256, px = W / 2 - pw / 2, py = 130;
    OVER_BTN = overButton(py, ph);
    AGAIN_BTN = againButton(OVER_BTN);
    say(TRACK.crashTitle, W / 2, 94, 52, { fill: C.banana });
    drawPanel({ x: px, y: py, w: pw, h: ph });
    say(TRACK.distanceLabel, W / 2, py + 30, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    say(formatScore(score()), W / 2, py + 74, 56, { fill: C.ink, outline: null });
    if (newBest) {
      rr(W / 2 - 70, py + 104, 140, 32, 16);
      ctx.fillStyle = C.banana; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
      say('Nytt rekord!', W / 2, py + 121, 18, { fill: C.ink, outline: null });
    } else {
      say(`Rekord ${formatScore(best)}`, W / 2, py + 120, 16, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    }
    const next = MEDALS[medal + 1];
    if (medal >= 0) drawMedalLine(MEDALS[medal], W / 2, py + 160, 22, MEDALS[medal].name + '!', { fill: C.ink, outline: null });
    else say(`${CAR ? 'Under ' : ''}${formatScore(next.at)} ger en ${next.name.toLowerCase()}`, W / 2, py + 160, 14, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    drawBoxRow(box, px + 36, py + 196, { color: C.ink, outline: null, step: 34, empty: CAR ? 'Inga saker den här gången' : 'Lådan är tom' });
    if (CAR) say(`Du kom ${ordinal(place)} av ${rivals.length + 1}!`, W / 2, py + 232, 18, { fill: place === 1 ? C.banana : C.ink, outline: place === 1 ? C.ink : null });
    if (TRACK.worlds) say(`Värld ${worldIndex(climbed) + 1}: ${worldAt(climbed).name}`, W / 2, py + 232, 15, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    if (placed) say(`Plats ${placed} på topplistan!`, W / 2, py + 266, 18, { fill: C.ink, outline: null });
    ctx.globalAlpha = time - overAt > 0.6 ? 1 : 0.5;
    drawButton(OVER_BTN, 'Gå till startsidan', 24);
    drawButton(AGAIN_BTN, 'Spela igen', 24);
    ctx.globalAlpha = 1;
  }

  function drawHud() {
    if (state === 'ready' || state === 'over') return;
    say(formatScore(CAR ? lapClock() : meters()), W / 2, UI_T + 46, 44);
    if (best || !CAR) say(`Rekord ${formatScore(best)}`, W / 2, UI_T + 80, 14, { font: BODY, weight: '800' });
    if (CAR) {
      drawMinimap();
      say(`Plats ${racePlace()} av ${rivals.length + 1}`, W / 2, UI_T + (best ? 100 : 80), 15, { font: BODY, weight: '800', fill: C.banana });
      const left = startedAt - time;
      if (left > -0.6) say(left > 0 ? String(Math.ceil(left / (COUNTDOWN / 3))) : 'Kör!', W / 2, 250, 72, { fill: C.banana });
      // står bilen still när tipset har tonat bort påminns man om hur man kör
      else if (left < -3 && state === 'playing' && !gas() && carSpeed < 20) {
        ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.4;
        say('Tryck och håll för att köra!', W / 2, 250, 24, { fill: C.banana });
        ctx.globalAlpha = 1;
      }
    }
    if (TRACK.worlds) say(`${worldAt(climbed).name} · värld ${worldIndex(climbed) + 1} av ${WORLDS.length}`, W / 2, UI_T + 100, 13, { font: BODY, weight: '800' });
    // "Ny värld!" och en ny medalj står uppe till höger, under krafterna, så att de inte
    // skymmer väggen; de tonar bort efter en stund
    const right = VX1 - 16;
    const shown = (time - worldShownAt) / 2;
    if (shown >= 0 && shown < 1) {
      ctx.globalAlpha = shown < 0.75 ? 1 : (1 - shown) * 4;
      say('Ny värld!', right, UI_T + 122, 26, { fill: C.banana, align: 'right' });
      say(worldAt(climbed).name, right, UI_T + 148, 17, { align: 'right' });
      say(`+${WORLD_BONUS} blå mynt`, right, UI_T + 168, 14, { fill: C.blue, align: 'right' });
      ctx.globalAlpha = 1;
    }
    const mk = (time - medalShownAt) / 1.8;
    if (medal >= 0 && mk >= 0 && mk < 1) {
      ctx.globalAlpha = mk < 0.75 ? 1 : (1 - mk) * 4;
      drawMedalLine(MEDALS[medal], right, UI_T + 198, 18, MEDALS[medal].name + '!', { fill: MEDALS[medal].color, align: 'right' });
      ctx.globalAlpha = 1;
    }
    for (const p of popups) {
      const k = (time - p.at) / (p.life ?? 1.2);
      ctx.globalAlpha = 1 - k * k;
      // "10 m!" och de andra utan egen plats står högre än "+10" från en sak
      say(p.text, p.x ?? playerX, (p.y ?? PLAYER_Y - 105) - k * 40, p.size ?? 24, { fill: p.color ?? C.banana });
    }
    ctx.globalAlpha = 1;
    drawBoxRow(box, 30, UI_B - 24, { empty: CAR ? '' : 'Samla saker i lådan!' });
    drawActivePowers();
    ctx.globalAlpha = 1;
    const tip = time - startedAt;
    if (state === 'playing' && tip < 3) {
      ctx.globalAlpha = Math.min(1, 3 - tip);
      // i Car Game mitt på skärmen, under nedräkningen, där lådan inte är i vägen
      TRACK.tip.split('\n').forEach((line, i) => say(line, W / 2, (CAR ? 300 : PLAYER_Y + 100) + i * 18, 14, { font: BODY, weight: '800' }));
      ctx.globalAlpha = 1;
    }
  }

  // Skärmen för den som inte får spela än, eller medan det kollas.
  function drawLocked() {
    drawTitle(TRACK.title, W / 2, 150, 50);
    const P = { x: 40, y: 220, w: 320, h: 170 };
    drawPanel(P);
    if (access === 'checking') say('Ett ögonblick…', W / 2, P.y + P.h / 2, 22, { fill: C.ink, outline: null });
    else {
      say('Kommer snart!', W / 2, P.y + 50, 32, { fill: C.ink, outline: null });
      say('Än så länge kan bara Wilhelm spela', W / 2, P.y + 98, 15, { font: BODY, weight: '800', fill: C.dirt, outline: null });
      say('Knappen Spel tar dig tillbaka', W / 2, P.y + 128, 13, { font: BODY, weight: '800', fill: C.dirt, outline: null });
    }
  }

  function draw() {
    TRACK.drawBackground();
    if (access !== 'yes') { drawLocked(); return; }
    if (state === 'ready') drawStart();
    else {
      for (const it of items) {
        const y = it.y + Math.sin(time * 3 + it.phase) * 3;
        blob(it.x, y, 17, 'rgba(255,255,255,0.35)');
        drawItem(it.kind, it.x, y);
      }
      // krafterna i en bubbla som pulserar, så att de syns från sakerna
      for (const it of powers) {
        const y = it.y + Math.sin(time * 3 + it.phase) * 3, r = 19 + Math.sin(time * 6 + it.phase) * 1.5;
        blob(it.x, y, r, 'rgba(255,255,255,0.55)');
        ctx.strokeStyle = C.white; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(it.x, y, r, 0, Math.PI * 2); ctx.stroke();
        drawPower(it.kind, it.x, y);
      }
      // en skugga lyfter det som faller ut från väggen
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
      TRACK.drawObstacles();
      ctx.restore();
      // Figuren blinkar medan skölden just har tagit en träff.
      const playing = state === 'playing';
      if (playing && time < safeUntil && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.35;
      TRACK.drawPlayer(playerX, playerY, playing);
      ctx.globalAlpha = 1;
      if (playing && shield) {
        blob(playerX, playerY - 4, 36, 'rgba(120,200,255,0.22)');
        ctx.strokeStyle = 'rgba(160,220,255,0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(playerX, playerY - 4, 36, 0, Math.PI * 2); ctx.stroke();
      }
      // slow motion färgar världen lite blå
      if (playing && time < slowUntil) { ctx.fillStyle = 'rgba(120,170,255,0.14)'; ctx.fillRect(VX0, VY0, VW, VH); }
      if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * 0.7})`; ctx.fillRect(VX0, VY0, VW, VH); }
    }
    drawHud();
    if (state === 'over') drawOver();
    if (overlay === 'figures') drawFigures();
    if (overlay === 'settings') drawSettings();
    if (overlay === 'scores') drawBoard();
  }

  // ---------- Styrning och loop ----------

  function toWorld(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - offX) / scale, y: (e.clientY - r.top - offY) / scale };
  }
  const inside = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;

  function openOverlay(name) {
    overlay = name;
    play('select', 0.4);
    if (name === 'figures') openFigures();
    if (name === 'scores') refreshBoard();
  }
  function closeOverlay() { overlay = null; }
  function toStart() { state = 'ready'; climbed = 0; play('select', 0.4); }

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (access !== 'yes' || window.player?.busy?.()) return;
    canvas.focus({ preventScroll: true });
    startMusic();
    const p = toWorld(e);
    if (overlay === 'figures') {
      const i = figureAt(p);
      if (i >= 0) { if (owned(FIGURES[i].id)) choose(i); else buyFigure(i); }
      else if (inside(p, FIG_PREV)) turnFigPage(-1);
      else if (inside(p, FIG_NEXT)) turnFigPage(1);
      else if (inside(p, FIG_CLOSE) || !inside(p, FIG_PANEL)) closeOverlay();
    } else if (overlay === 'settings') {
      if (inside(p, settingsRow(0))) toggleSfx();
      else if (inside(p, settingsRow(1))) toggleMusic();
      else if (inside(p, SETTINGS_CLOSE) || !inside(p, SETTINGS_PANEL)) closeOverlay();
    } else if (overlay === 'scores') {
      if (inside(p, BOARD_CLOSE) || !inside(p, BOARD)) closeOverlay();
    } else if (state === 'ready') {
      if (inside(p, START_BTN)) reset();
      else if (inside(p, figuresBtn())) openOverlay('figures');
      else if (inside(p, settingsBtn())) openOverlay('settings');
      else if (inside(p, scoresBtn())) openOverlay('scores');
    } else if (state === 'playing') {
      // i Car Game gasar fingret och styr bara när det drar åt sidan
      const r = canvas.getBoundingClientRect();
      if (!CAR) hold(e.pointerId, e.clientX < r.left + r.width / 2 ? -1 : 1);
      drags.set(e.pointerId, { startX: e.clientX, swiping: false });
      // fingret fortsätter att styra också om det glider över länken eller utanför
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    } else if (state === 'over' && time - overAt > 0.6) {
      if (inside(p, OVER_BTN)) toStart();
      else if (inside(p, AGAIN_BTN)) reset();
    }
  });

  canvas.addEventListener('pointermove', swipe);
  // Fingret som släpper slutar styra; också om det glider av skärmen.
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    window.addEventListener(type, e => { holds.delete(e.pointerId); drags.delete(e.pointerId); });
  }
  const KEY_DIR = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 };
  const PEDALS = ['ArrowUp', 'KeyW', 'Space'];
  window.addEventListener('keyup', e => { holds.delete(e.code); pedals.delete(e.code); });
  window.addEventListener('blur', () => { holds.clear(); drags.clear(); pedals.clear(); });

  // Som i Flappy Game: F öppnar Figurer, T Topplistan, och M och N stänger av och
  // sätter på ljudeffekter och musik.
  window.addEventListener('keydown', e => {
    if (access !== 'yes' || window.player?.busy?.()) return;
    startMusic();
    const go = e.code === 'Space' || e.code === 'Enter';
    if (e.code === 'KeyM') { e.preventDefault(); toggleSfx(); return; }
    if (e.code === 'KeyN') { e.preventDefault(); toggleMusic(); return; }
    if (overlay === 'figures' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
      e.preventDefault();
      turnFigPage(e.code === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (overlay) {
      const again = (overlay === 'figures' && e.code === 'KeyF') || (overlay === 'scores' && e.code === 'KeyT');
      if (go || again || e.code === 'Escape') { e.preventDefault(); closeOverlay(); }
      return;
    }
    if (state === 'ready') {
      if (go) { e.preventDefault(); if (!e.repeat) reset(); }
      else if (e.code === 'KeyF') { e.preventDefault(); openOverlay('figures'); }
      else if (e.code === 'KeyT') { e.preventDefault(); openOverlay('scores'); }
      return;
    }
    if (state === 'over') {
      // en tangent som hålls kvar över mållinjen hoppar inte förbi resultatet
      if (go && !e.repeat && time - overAt > 0.6) { e.preventDefault(); toStart(); }
      return;
    }
    if (CAR && PEDALS.includes(e.code)) { e.preventDefault(); pedals.add(e.code); }
    if (KEY_DIR[e.code]) { e.preventDefault(); hold(e.code, KEY_DIR[e.code]); }
  });

  let last = 0;
  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
    last = now;
    update(dt);
    draw();
    // länken tillbaka till spelen ligger över rutornas hörn, så den göms medan en är öppen
    if (backLink && backLink.hidden !== !!overlay) backLink.hidden = !!overlay;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
