(() => {
  // Spelets värld mäts i en fast upplösning och skalas till skärmen.
  const W = 400, H = 600, GROUND = 84;
  const GRAVITY = 1500, FLAP = -440, SPEED = 150;
  const GAP = 165, PIPE_W = 64, SPACING = 225, HIT = 15;
  const START_X = 110, START_Y = 250;
  const TOP = 10;

  const css = getComputedStyle(document.documentElement);
  const DISPLAY = css.getPropertyValue('--font-display').trim();
  const BODY = css.getPropertyValue('--font-body').trim();

  const C = {
    strawWhite: '#fdfbf6', strawEdge: '#3a2f33',
    fur: '#8a5a2b', furDark: '#6b4220', face: '#f1d0a5', mouth: '#4a2a12',
    wing: '#f6efdf', wingBack: '#e2d6bd', wingEdge: '#b8a684',
    ink: '#1d2b1f', white: '#ffffff', banana: '#ffd23f', dirt: '#8a5a2b',
    panel: '#fff7e0', panelRow: '#f3e6c2', roof: '#e63946', gold: '#f5b301', dot: '#cdbb8c', locked: '#d9d2bf',
    on: '#2bb673', off: '#cfc6b0',
    blue: '#36b3ec', blueEdge: '#16679a',
    medals: ['#ffd23f', '#cfd6dc', '#e0a46b'],
  };
  const RAINBOW = ['#ff6b8b', '#ffb347', '#ffe066', '#6fdc8c', '#5bc0eb', '#a78bfa'];
  const UNI = {
    coat: '#fdfbff', wingBack: '#ece3fa', edge: '#a993cf', muzzle: '#ffe3ee', hoof: '#a993cf',
    horn: '#ffd23f', hornEdge: '#b88a00', blush: '#ffb3c7',
  };
  const DINO = { skin: '#6ccf5f', dark: '#3f9a45', belly: '#e9f7b8', spike: '#ff9f1c', wing: '#58b860', edge: '#2b6b30' };
  const DOG = { fur: '#d9a066', dark: '#9b6235', darker: '#7a4a24', cream: '#f7e6c8', nose: '#2a1d16', tongue: '#ff7a8a' };
  const ASTRO = {
    suit: '#f3f5f8', edge: '#7f8b98', metal: '#a7b1bc', boot: '#5f6b77', visor: '#1f3a5f',
    shine: 'rgba(255,255,255,0.6)', red: '#e63946', blue: '#2f80ed', flame: '#ff9f1c', core: '#ffd23f',
  };
  const PENG = {
    body: '#232a3d', edge: '#5b6787', belly: '#ffffff', beak: '#ff9f1c', beakEdge: '#c76f00',
    blush: '#ffb3c7', cap: ['#e63946', '#ffd23f', '#2f80ed'], blade: '#e63946',
  };
  const OCTO = { skin: '#ff7aa8', dark: '#e0568a', spot: '#ffc2d6', mouth: '#8c2a52' };
  const BEE = { body: '#ffd23f', edge: '#b58e00', stripe: '#2a2a2a', wing: 'rgba(235,248,255,0.8)', wingEdge: '#8cc8ea', blush: '#ff9e9e' };
  const DRAKE = { skin: '#e8503a', dark: '#b5321f', belly: '#ffd29a', wing: '#ff8a5c', horn: '#fff1c9', spike: '#ffd23f', edge: '#7a1f12' };
  const KATT = { fur: '#f4a259', stripe: '#c96f24', cream: '#fff0dc', nose: '#ff8fa3', whisker: '#7a5a3a', string: '#6b6b6b', balloons: ['#ff5e7a', '#4cc9f0', '#ffd23f'] };
  const SPOKE = { body: '#f8f8ff', edge: '#a9a9d6', blush: '#ffc2d6' };
  const GRODA = { skin: '#5cc35a', dark: '#3e9a3c', belly: '#e3f7b5', blush: '#ff9eaa', umbrella: ['#ff5e7a', '#fff3f5'], handle: '#6b4a2b' };
  const HARE = {
    fur: '#f2e6da', edge: '#b9a28c', inner: '#ffb3c7', nose: '#ff7a9a', cheek: '#ffc7d6',
    feathers: ['#ff7ab8', '#ffd23f', '#6fdc8c'], featherEdge: '#c98aa8',
    basket: '#b07a3a', basketDark: '#8a5a2b', eggs: ['#8fd3ff', '#ffb347'],
  };
  const TOMTE = {
    red: '#d62839', beard: '#ffffff', beardEdge: '#c9c9d6', skin: '#ffd6b8', nose: '#ff9aa8',
    sleigh: '#c81d2e', sleighEdge: '#7a1020', runner: '#f5b301', sack: '#8a5a2b', sparkle: '#ffe9a0',
  };
  const PUMPA = { body: '#ff8c1a', dark: '#e0700a', rib: '#c95c08', stem: '#5a7a2a', leaf: '#6cbf3a', leafBack: '#4f9e2c', leafEdge: '#3f8a24', glow: '#ffe066', carve: '#5a2a00' };
  const SOL = { core: '#ffd23f', edge: '#f5a300', ray: '#ffb800', cheek: '#ff9a6a', glasses: '#1d2b1f', smile: '#c26a00' };
  const PRINS = {
    dress: '#ff8fc8', dressDark: '#e0569e', dressLight: '#ffc2e2', edge: '#b83a7c', skin: '#ffd9c2', skinEdge: '#e0a98c',
    blush: '#ff9eb8', hair: '#ffcf5a', hairDark: '#d9a32e', wing: 'rgba(225,238,255,0.78)', wingEdge: '#b9a6ff',
    tiara: '#ffe066', tiaraEdge: '#b88a00', gem: '#ff4f9a', wand: '#ffd23f',
  };
  const GULD = { main: '#ffd23f', mid: '#f5b301', dark: '#c98f00', edge: '#8a6200', light: '#fff1a8', crown: '#ffe066', gems: ['#e63946', '#2f80ed', '#2bb673'] };
  const HERO = {
    suit: '#2f6fd6', suitDark: '#1f4fa8', cape: '#e63946', capeDark: '#b5212e', belt: '#ffd23f',
    skin: '#ffd6b8', hair: '#3a2a1a', mask: '#1d2b4f', glove: '#e63946', smile: '#8a4a2a',
  };
  const PANDA = { white: '#ffffff', edge: '#b9c2cc', black: '#22252b', cheek: '#ffb3c7', cloudEdge: '#c9d6e6', bamboo: '#6cbf3a' };
  const UGGLA = { body: '#8b6a4f', face: '#ecdcbd', belly: '#d9c09a', beak: '#f5a300', iris: '#ffb703', wing: '#9c7a5c', wingBack: '#6b4f3a', edge: '#4a3526' };
  const ROBOT = { metal: '#b8c4d0', dark: '#7d8a97', edge: '#4a5563', screen: '#1d2b4f', eye: '#4cf0ff', lights: ['#e63946', '#ffd23f', '#2bb673'], flame: '#ff9f1c', core: '#ffe066' };
  const LEJON = { fur: '#e8a849', mane: '#b5652a', muzzle: '#f7d9a8', nose: '#5a3020', balloon: '#e63946', stripe: '#ffd23f', edge: '#8f2a20', basket: '#a0703a', basketDark: '#7a5228', rope: '#6b4a2b' };
  const KO = { white: '#ffffff', edge: '#9a9a9a', spot: '#2a2a2a', muzzle: '#ffb6c1', muzzleEdge: '#d98a96', horn: '#f0e0c0', bell: '#ffd23f', wing: '#f6f6ff', wingEdge: '#b8b8d8' };
  const KAMEL = { fur: '#d8a35d', dark: '#a87636', hump: '#c99450', muzzle: '#ecc58f', carpet: '#b5212e', pattern: '#ffd23f', fringe: '#ffd23f' };
  const ALIEN = { skin: '#7ee081', dark: '#4fb357', eye: '#1d1d2b', saucer: '#b8c4d0', saucerDark: '#7d8a97', dome: 'rgba(170,230,255,0.45)', domeEdge: '#8fd3ff', lights: ['#ff5e7a', '#ffd23f', '#4cc9f0'], beam: 'rgba(200,255,150,0.3)' };

  // Varje figur flyger på sitt eget sätt, i en värld av sin egen.
  const CHARACTERS = [
    { id: 'enhorning', name: 'Enhörning', world: 'Regnbågsland', flight: 'Enhörningen flyger på vingar', draw: drawUnicorn },
    { id: 'dinosaurie', name: 'Dinosaurie', world: 'Urtid', flight: 'Dinosaurien flaxar med läderartade vingar', draw: drawDino },
    { id: 'hund', name: 'Hund', world: 'Bakgård', flight: 'Hunden flaxar med öronen', draw: drawDog },
    { id: 'apa', name: 'Apa', world: 'Djungel', flight: 'Apan flyger på fjädervingar', draw: drawMonkey },
    { id: 'astronaut', name: 'Astronaut', world: 'Rymden', flight: 'Astronauten flyger med raketryggsäck', draw: drawAstronaut },
    { id: 'pingvin', name: 'Pingvin', world: 'Arktis', flight: 'Pingvinen flyger med propellermössa', draw: drawPenguin },
    { id: 'blackfisk', name: 'Bläckfisk', world: 'Havet', flight: 'Bläckfisken simmar med armarna', draw: drawOctopus },
    { id: 'bi', name: 'Bi', world: 'Blomsteräng', flight: 'Biet surrar med sina små vingar', draw: drawBee },
    { id: 'drake', name: 'Drake', world: 'Slott', flight: 'Draken flaxar och sprutar eld', draw: drawDragon },
    { id: 'katt', name: 'Katt', world: 'Stad', flight: 'Katten flyger med ballonger', draw: drawCat },
    { id: 'spoke', name: 'Spöke', world: 'Spöknatt', flight: 'Spöket svävar fram', draw: drawGhost },
    { id: 'groda', name: 'Groda', world: 'Regnig damm', flight: 'Grodan seglar med paraply', draw: drawFrog },
    { id: 'paskhare', name: 'Påskhare', world: 'Påskäng', flight: 'Påskharen flyger med färgglada påskfjädrar', draw: drawHare },
    { id: 'tomte', name: 'Jultomte', world: 'Julnatt', flight: 'Tomten flyger i sin släde', draw: drawTomte },
    { id: 'pumpa', name: 'Pumpa', world: 'Höstfält', flight: 'Pumpan flaxar med sina blad', draw: drawPumpkinFigure },
    { id: 'sol', name: 'Sol', world: 'Strand', flight: 'Solen snurrar med sina strålar', draw: drawSunFigure },
    { id: 'superhjalte', name: 'Superhjälte', world: 'Storstad', flight: 'Superhjälten flyger med sin mantel', draw: drawHero },
    { id: 'panda', name: 'Panda', world: 'Bambuskog', flight: 'Pandan åker på ett moln', draw: drawPanda },
    { id: 'uggla', name: 'Uggla', world: 'Nattskog', flight: 'Ugglan flyger tyst genom natten', draw: drawOwl },
    { id: 'robot', name: 'Robot', world: 'Fabrik', flight: 'Roboten flyger med jetkängor', draw: drawRobot },
    { id: 'lejon', name: 'Lejon', world: 'Savann', flight: 'Lejonet flyger i luftballong', draw: drawLion },
    { id: 'ko', name: 'Ko', world: 'Bondgård', flight: 'Kon flaxar med små vingar', draw: drawCow },
    { id: 'kamel', name: 'Kamel', world: 'Öken', flight: 'Kamelen åker flygande matta', draw: drawCamel },
    { id: 'alien', name: 'Rymdvarelse', world: 'Främmande planet', flight: 'Rymdvarelsen flyger i sitt tefat', draw: drawAlien },
    { id: 'prinsessa', name: 'Prinsessa', world: 'Slott', flight: 'Prinsessan flyger på älvvingar', draw: drawPrincess },
    { id: 'rav', name: 'Räv', world: 'Skog', flight: 'Räven flyger på vita vingar', draw: drawFox },
    { id: 'gris', name: 'Gris', world: 'Bondgård', flight: 'Grisen flaxar med små vingar', draw: drawPig },
    { id: 'elefant', name: 'Elefant', world: 'Savann', flight: 'Elefanten flaxar med öronen', draw: drawElephant },
    { id: 'giraff', name: 'Giraff', world: 'Savann', flight: 'Giraffen flyger på vingar', draw: drawGiraffe },
    { id: 'krokodil', name: 'Krokodil', world: 'Träsk', flight: 'Krokodilen flaxar med gröna vingar', draw: drawCroc },
    { id: 'haj', name: 'Haj', world: 'Havet', flight: 'Hajen simmar genom luften', draw: drawShark },
    { id: 'delfin', name: 'Delfin', world: 'Havet', flight: 'Delfinen simmar genom luften', draw: drawDolphin },
    { id: 'skoldpadda', name: 'Sköldpadda', world: 'Strand', flight: 'Sköldpaddan flyger med propeller', draw: drawTurtle },
    { id: 'nyckelpiga', name: 'Nyckelpiga', world: 'Äng', flight: 'Nyckelpigan surrar med sina vingar', draw: drawLadybug },
    { id: 'papegoja', name: 'Papegoja', world: 'Djungel', flight: 'Papegojan flaxar med färgglada vingar', draw: drawParrot },
    { id: 'flamingo', name: 'Flamingo', world: 'Lagun', flight: 'Flamingon flyger med rosa vingar', draw: drawFlamingo },
    { id: 'tiger', name: 'Tiger', world: 'Djungel', flight: 'Tigern flyger på vingar', draw: drawTiger },
    { id: 'koala', name: 'Koala', world: 'Eukalyptusskog', flight: 'Koalan flaxar med eukalyptusblad', draw: drawKoala },
    { id: 'igelkott', name: 'Igelkott', world: 'Trädgård', flight: 'Igelkotten flyger på vingar', draw: drawHedgehog },
    { id: 'alg', name: 'Älg', world: 'Skog', flight: 'Älgen flyger på vingar med halsduk', draw: drawMoose },
    { id: 'kyckling', name: 'Kyckling', world: 'Bondgård', flight: 'Kycklingen flaxar med små vingar', draw: drawChick },
    { id: 'fladdermus', name: 'Fladdermus', world: 'Grotta', flight: 'Fladdermusen flaxar med läderartade vingar', draw: drawBat },
    { id: 'pirat', name: 'Pirat', world: 'Hav', flight: 'Piraten rider på en flygande tunna', draw: drawPirate },
    { id: 'ninja', name: 'Ninja', world: 'Tak', flight: 'Ninjan hoppar genom luften', draw: drawNinja },
    { id: 'riddare', name: 'Riddare', world: 'Slott', flight: 'Riddaren flyger på vita vingar', draw: drawKnight },
    { id: 'trollkarl', name: 'Trollkarl', world: 'Torn', flight: 'Trollkarlen svävar med magi', draw: drawWizard },
    { id: 'haxa', name: 'Häxa', world: 'Spöknatt', flight: 'Häxan flyger på sin kvast', draw: drawWitch },
    { id: 'sjojungfru', name: 'Sjöjungfru', world: 'Havet', flight: 'Sjöjungfrun simmar genom luften', draw: drawMermaid },
    { id: 'snogubbe', name: 'Snögubbe', world: 'Vinter', flight: 'Snögubben flaxar med pinnarmarna', draw: drawSnowman },
    // en gåva till Wilhelm, som var först på topplistan
    { id: 'guld', name: 'Guldperson', world: 'Guldland', flight: 'Guldpersonen flyger på gyllene vingar', draw: drawGold, gift: 'wilhelm' },
  ];

  const THEMES = {
    apa: {
      sky: ['#6cc9e6', '#dff5d8'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.9)');
        drawCanopy(hillX * 0.5, 430, 44, 64, '#86c792');
        drawCanopy(hillX, 470, 36, 52, '#4f9e5f');
      },
      ground: { base: '#8a5a2b', band: '#73481f', top: '#5cb83a', stripe: '#47992a' },
    },
    astronaut: {
      sky: ['#0b1030', '#3a2463'],
      backdrop() {
        drawStars();
        drawPlanet();
        drawCanopy(hillX * 0.5, 440, 54, 96, '#2e2a55');
        drawCanopy(hillX, 476, 38, 74, '#4a4d70');
      },
      ground: { base: '#8d8fa3', band: '#76788e', top: '#b9bbcc', stripe: '#a5a7ba', decor: drawCraters },
    },
    enhorning: {
      sky: ['#ffc4e1', '#fff0d9'],
      backdrop() {
        drawRainbow();
        drawClouds('rgba(255,255,255,0.95)');
        drawCanopy(hillX * 0.5, 436, 50, 80, '#dcc2f5');
        drawCanopy(hillX, 472, 38, 60, '#b4e9d0');
      },
      ground: { base: '#f5a3c7', band: '#e48ab2', top: '#a9eec8', stripe: '#90e0b6', decor: dots(['#ffffff', '#ffe066', '#c9a7ff']) },
    },
    dinosaurie: {
      sky: ['#ff9f5a', '#ffe2a1'],
      backdrop() {
        blob(300, 150, 42, 'rgba(255,246,205,0.9)');
        drawVolcanoes(hillX * 0.4);
        drawFerns(hillX);
      },
      ground: { base: '#b07a45', band: '#946234', top: '#c99a5b', stripe: '#b5864c' },
    },
    hund: {
      sky: ['#8fd3ff', '#eef9ff'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.95)');
        drawHouses(hillX * 0.5);
        drawFence(hillX);
      },
      ground: { base: '#4f9a35', band: '#43852c', top: '#7ed957', stripe: '#69c447', decor: dots(['#ffffff', '#ffe066']) },
    },
    pingvin: {
      sky: ['#1b335f', '#8fbfe0'],
      backdrop() {
        drawStars(0.5);
        drawAurora();
        drawIcebergs(hillX * 0.5);
        drawCanopy(hillX, 484, 30, 56, '#f2f8fc');
        drawSnow();
      },
      ground: { base: '#dcecf7', band: '#bcd6ea', top: '#ffffff', stripe: '#e6f1fa' },
    },
    blackfisk: {
      sky: ['#2bb3d9', '#073b63'],
      backdrop() {
        drawRays();
        drawCanopy(hillX * 0.5, 452, 46, 84, '#0e5577');
        drawSeaweed(hillX);
        drawBubbles();
      },
      ground: { base: '#e8c98a', band: '#d4b06d', top: '#f3dca6', stripe: '#e6cd96', decor: dots(['#ff8fa3', '#ffffff', '#ffb347']) },
    },
    bi: {
      sky: ['#8fdcff', '#fff7cf'],
      backdrop() {
        drawSun(76, 96);
        drawClouds('rgba(255,255,255,0.95)');
        drawCanopy(hillX * 0.5, 444, 60, 110, '#b5e48c');
        drawCanopy(hillX * 0.8, 478, 40, 70, '#8fd16a');
        drawFlowers(hillX);
      },
      ground: { base: '#6fbf45', band: '#5aa838', top: '#9be06a', stripe: '#86d257', decor: dots(['#ffffff', '#ff8fb1', '#ffe066']) },
    },
    drake: {
      sky: ['#4b2f7a', '#ff9e7a'],
      backdrop() {
        blob(110, 330, 36, 'rgba(255,214,150,0.85)');
        drawMountains(hillX * 0.3, 440, '#7a5a9e');
        drawCastles(hillX * 0.6);
        drawCanopy(hillX, 486, 30, 54, '#3f6b45');
      },
      ground: { base: '#7a5a3a', band: '#634830', top: '#6fbf5a', stripe: '#5aa848' },
    },
    katt: {
      sky: ['#7cc8f0', '#e9f6ff'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.95)');
        drawSkyline(hillX * 0.4, 470, ['#a9bfd3', '#b9cadb', '#9fb6cc'], 'rgba(255,255,255,0.55)', 58, 90, 22);
        drawSkyline(hillX, 492, ['#5c6f85', '#6b7f96', '#52647a'], '#cfe3f2', 46, 44, 14);
      },
      ground: { base: '#5d6166', band: '#4b4f53', top: '#c3c8cd', stripe: '#b0b5ba', decor: drawRoadLines },
    },
    spoke: {
      sky: ['#1a1033', '#4a2a6a'],
      backdrop() {
        drawStars(0.6);
        blob(290, 130, 40, '#fff2c2');
        blob(278, 120, 6, '#efe0a8');
        blob(300, 145, 4, '#efe0a8');
        drawBats();
        drawCanopy(hillX * 0.4, 450, 60, 110, '#2d1f4a');
        drawDeadTrees(hillX);
      },
      ground: { base: '#3b2a4a', band: '#2f2140', top: '#55406b', stripe: '#4a3760', decor: drawPumpkins },
    },
    groda: {
      sky: ['#7d93a8', '#cbd8e1'],
      backdrop() {
        drawClouds('rgba(140,155,172,0.95)');
        drawCanopy(hillX * 0.5, 452, 56, 100, '#86a98f');
        drawReeds(hillX);
        drawRain();
      },
      ground: { base: '#3f87a8', band: '#357595', top: '#6fb8d6', stripe: '#86c7e0', decor: drawLilies },
    },
    paskhare: {
      sky: ['#bfeaff', '#fff4d6'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.95)');
        drawCanopy(hillX * 0.5, 446, 58, 104, '#bde59a');
        drawCanopy(hillX * 0.8, 480, 38, 66, '#9fd77e');
        drawPaskris(hillX);
      },
      ground: { base: '#7ccf55', band: '#69bb45', top: '#a6e57a', stripe: '#93d968', decor: drawEggs },
    },
    tomte: {
      sky: ['#0d1b3d', '#2c4a7c'],
      backdrop() {
        drawStars(0.9);
        drawCanopy(hillX * 0.4, 456, 62, 116, '#dfe9f5');
        drawVillage(hillX * 0.7);
        drawSnow();
      },
      ground: { base: '#e8f0f8', band: '#cfdcea', top: '#ffffff', stripe: '#eef4fb', decor: dots(['#e63946', '#2bb673', '#ffd23f']) },
    },
    pumpa: {
      sky: ['#8ec9e6', '#fde7c4'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.9)');
        drawCanopy(hillX * 0.5, 448, 60, 110, '#d9a35a');
        drawAutumnTrees(hillX);
        drawLeaves();
      },
      ground: { base: '#8a5a2b', band: '#73481f', top: '#b5793f', stripe: '#a36a34', decor: drawPumpkinPatch },
    },
    sol: {
      sky: ['#4fc3f7', '#d6f5ff'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.95)');
        drawSea(hillX * 0.5);
        drawBeach(hillX);
      },
      ground: { base: '#f2d48f', band: '#e3c178', top: '#fbe7b5', stripe: '#f4dca0', decor: dots(['#ff8fa3', '#ffffff', '#4cc9f0']) },
    },
    superhjalte: {
      sky: ['#0f1630', '#3a2f6b'],
      backdrop() {
        drawStars(0.5);
        blob(80, 90, 18, '#f3ecd0');
        drawSearchlights();
        drawNightCity(hillX * 0.4, 470, '#232a52', 54, 120, 26, false);
        drawNightCity(hillX, 494, '#151a36', 44, 60, 18, true);
      },
      ground: { base: '#2b2e3a', band: '#22252f', top: '#555a6b', stripe: '#4a4f5f', decor: drawRoadLines },
    },
    panda: {
      sky: ['#d6f0e0', '#fff3e3'],
      backdrop() {
        drawMountains(hillX * 0.3, 450, '#b3d9bf');
        drawBambooGrove(hillX);
        drawLanterns(hillX * 0.7);
        drawPetals();
      },
      ground: { base: '#5f7f3f', band: '#4f6d33', top: '#8fc46a', stripe: '#7db45a', decor: dots(['#ffb7d0', '#ffffff']) },
    },
    uggla: {
      sky: ['#0b2230', '#1f4a4f'],
      backdrop() {
        drawStars(0.7);
        blob(300, 110, 28, '#f6f1d3');
        drawPines(hillX * 0.45, 462, '#163f3d', 70, 100);
        drawPines(hillX, 500, '#0b2827', 52, 76);
        drawFireflies();
      },
      ground: { base: '#1d3a2a', band: '#16301f', top: '#2f5a3a', stripe: '#274d31', decor: dots(['#6b8f4a', '#4f7a45']) },
    },
    robot: {
      sky: ['#9aa7b4', '#e3e8ed'],
      backdrop() {
        drawFactory(hillX * 0.4);
        drawGears(hillX * 0.8);
      },
      ground: { base: '#5c6670', band: '#4b545c', top: '#8f99a3', stripe: '#7f8993', decor: drawHazard },
    },
    lejon: {
      sky: ['#ff9a4d', '#ffe0a3'],
      backdrop() {
        blob(200, 410, 60, 'rgba(255,240,190,0.9)');
        drawCanopy(hillX * 0.3, 458, 70, 130, '#e0a35e');
        drawGiraffes(hillX * 0.5);
        drawAcacias(hillX);
      },
      ground: { base: '#c99a4a', band: '#b5873c', top: '#e0b75e', stripe: '#d4a94f', decor: dots(['#a0703a', '#8a6a2a']) },
    },
    ko: {
      sky: ['#9ed8ff', '#f2fbff'],
      backdrop() {
        drawClouds('rgba(255,255,255,0.95)');
        drawCanopy(hillX * 0.4, 448, 64, 120, '#a8d672');
        drawFarm(hillX * 0.6);
        drawWoodFence(hillX);
      },
      ground: { base: '#6fae3f', band: '#5d9a33', top: '#93cf5c', stripe: '#82c24e', decor: dots(['#ffffff', '#ffe066']) },
    },
    kamel: {
      sky: ['#ffc46b', '#fff1cf'],
      backdrop() {
        blob(320, 120, 30, 'rgba(255,255,230,0.95)');
        drawPyramids(hillX * 0.3);
        drawDunes(hillX * 0.6, 472, '#f0c27a', 150);
        drawDunes(hillX, 500, '#e6b064', 110);
      },
      ground: { base: '#e3a95a', band: '#d29a4c', top: '#f2c47e', stripe: '#e8b66c', decor: dots(['#c98a3e', '#fff1cf']) },
    },
    alien: {
      sky: ['#2a0f4a', '#7a3fa0'],
      backdrop() {
        drawStars(0.8);
        blob(90, 110, 30, '#ffb3e6');
        blob(150, 70, 14, '#9ff5d6');
        drawCanopy(hillX * 0.4, 452, 58, 106, '#4a2470');
        drawAlienPlants(hillX);
      },
      ground: { base: '#5a2d82', band: '#4a2470', top: '#7fd6a0', stripe: '#6cc48e', decor: dots(['#ff7ab8', '#9ff5d6', '#ffe066']) },
    },
  };

  // Varje hinderpar får en färg: sugrörens ränder, pennornas lack, en av klossarna.
  const TINTS = [
    { main: '#e63946', dark: '#9e1b25' },
    { main: '#2f80ed', dark: '#1a4f99' },
    { main: '#2bb673', dark: '#17734a' },
    { main: '#ff5fa2', dark: '#b8326c' },
    { main: '#ff9f1c', dark: '#b86a00' },
  ];
  function nextTint(prev) {
    let s;
    do s = TINTS[Math.floor(Math.random() * TINTS.length)]; while (s === prev);
    return s;
  }

  // Hindren ser olika ut men öppningen är lika stor. `inset` smalnar av träffytan
  // där hindret är smalare än sin ruta, `grace` kortar den där en spets tunnas ut,
  // och `hits` ger egna rutor åt hinder med bred ände och smalt skaft.
  const OBSTACLES = [
    { id: 'sugror', name: 'Sugrör', note: 'Randiga och böjbara', draw: drawStraws },
    { id: 'ror', name: 'Gröna rör', note: 'Som i originalet', draw: drawPipes },
    { id: 'pennor', name: 'Pennor', note: 'Vässade färgpennor', draw: drawPencils, inset: 4, grace: 14 },
    { id: 'klossar', name: 'Byggklossar', note: 'Staplade klossar', draw: drawBricks },
    { id: 'kaktusar', name: 'Kaktusar', note: 'Taggiga ökenkaktusar', draw: drawCacti, inset: 8 },
    { id: 'pelare', name: 'Marmorpelare', note: 'Grekiska kolonner', draw: drawColumns, inset: 4 },
    { id: 'stockar', name: 'Stockar', note: 'Sågade trädstammar', draw: drawLogs, inset: 6 },
    { id: 'istappar', name: 'Istappar', note: 'Glittrande is', draw: drawIcicles, inset: 4, grace: 16 },
    { id: 'isglass', name: 'Isglassar', note: 'Glass på pinne', draw: drawPopsicles, hits: p => headAndShaft(p, 52, 110, 14) },
    { id: 'svampar', name: 'Flugsvampar', note: 'Röda med vita prickar', draw: drawMushrooms, hits: p => headAndShaft(p, 60, 28, 26) },
    { id: 'lyktor', name: 'Lyktstolpar', note: 'Lyktor som lyser', draw: drawLampPosts, hits: p => headAndShaft(p, 40, 40, 16) },
    { id: 'tartor', name: 'Tårtor', note: 'Med glasyr och ljus', draw: drawCakes },
  ];
  // Öppningens över- och underkant. I de svåra världarna är öppningen mindre och
  // glider upp och ner; `swing` räknas upp medan hindret rör sig.
  const gapCenter = p => p.gap + Math.sin(p.swing ?? 0) * (p.glide ?? 0);
  const gapEnds = p => { const c = gapCenter(p), half = (p.size ?? GAP) / 2; return [c - half, c + half]; };

  // Saker att samla mellan hindren: värdet läggs till poängen och saken hamnar
  // i lådan. Vikterna summerar till 100 och styr hur vanlig varje sak är. Blå mynt
  // ger inga poäng; de sparas och köper nya figurer på startskärmen.
  const ITEMS = [
    { id: 'mynt', name: 'Mynt', value: 1, weight: 36, draw: drawCoin },
    { id: 'banan', name: 'Banan', value: 2, weight: 23, draw: drawBanana },
    { id: 'paket', name: 'Paket', value: 3, weight: 18, draw: drawPackage },
    { id: 'stjarna', name: 'Stjärna', value: 5, weight: 9, draw: drawStarItem },
    { id: 'diamant', name: 'Diamant', value: 10, weight: 4, draw: drawDiamond },
    { id: 'blamynt', name: 'Blått mynt', value: 0, weight: 10, draw: drawBlueCoin, currency: true },
  ];
  const BLUE = ITEMS.findIndex(it => it.currency);
  const ITEM_CHANCE = 0.6, ITEM_R = 12;
  function pickItem() {
    let r = Math.random() * 100;
    for (let i = 0; i < ITEMS.length; i++) { r -= ITEMS[i].weight; if (r < 0) return i; }
    return 0;
  }

  // Krafter att plocka upp mellan hindren, ibland i stället för en sak. Skölden tar
  // en krock, magneten drar saker till figuren och slow motion saktar ner allt en
  // stund. `left` är hur mycket som är kvar, från 1 ner till 0.
  const POWERS = [
    { id: 'skold', name: 'Sköld', draw: drawShieldIcon, take: () => { shield = true; }, left: () => (shield ? 1 : 0) },
    { id: 'magnet', name: 'Magnet', secs: 8, draw: drawMagnetIcon,
      take() { magnetUntil = time + this.secs; }, left() { return Math.max(0, magnetUntil - time) / this.secs; } },
    { id: 'slow', name: 'Slow motion', secs: 5, draw: drawSnailIcon,
      take() { slowUntil = time + this.secs; }, left() { return Math.max(0, slowUntil - time) / this.secs; } },
  ];
  const POWER_CHANCE = 0.09, SAFE_TIME = 1.2, SLOW = 0.55, MAGNET_R = 150, MAGNET_PULL = 520;

  // Medaljer för poängen i en omgång. Den bästa man når räknas in i samlingen.
  const MEDALS = [
    { id: 'brons', name: 'Bronsmedalj', at: 10, color: C.medals[2] },
    { id: 'silver', name: 'Silvermedalj', at: 25, color: C.medals[1] },
    { id: 'guld', name: 'Guldmedalj', at: 50, color: C.medals[0] },
  ];

  const STARS = Array.from({ length: 70 }, () => ({
    x: Math.random() * W, y: Math.random() * (H - GROUND - 40),
    r: 0.6 + Math.random() * 1.3, tw: Math.random() * 6,
  }));
  const FLAKES = Array.from({ length: 45 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    v: 18 + Math.random() * 30, r: 1 + Math.random() * 1.8, p: Math.random() * 6,
  }));
  const BUBBLES = Array.from({ length: 24 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    v: 20 + Math.random() * 35, r: 2 + Math.random() * 4, p: Math.random() * 6,
  }));
  const DROPS = Array.from({ length: 60 }, () => ({
    x: Math.random() * W, y: Math.random() * H, v: 260 + Math.random() * 120,
  }));
  const FIREFLIES = Array.from({ length: 16 }, () => ({
    x: Math.random() * W, y: 200 + Math.random() * 280, p: Math.random() * 6,
  }));
  const PETALS = Array.from({ length: 22 }, () => ({
    x: Math.random() * W, y: Math.random() * H, v: 20 + Math.random() * 25, p: Math.random() * 6,
  }));
  const LEAVES = Array.from({ length: 18 }, (_, k) => ({
    x: Math.random() * W, y: Math.random() * H, v: 30 + Math.random() * 30, p: Math.random() * 6,
    c: ['#ff8c1a', '#e63946', '#ffc23d', '#d9650a'][k % 4],
  }));

  const hash = i => (Math.imul(i, 2654435761) >>> 0) % 1000;

  const stage = document.getElementById('stage');
  const screen = document.getElementById('screen');
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Spelet mäts i W×H och skalas så att det får plats, med marken mot skärmens
  // underkant. Det som blir över fylls av mer värld: himmel ovanför och mer åt
  // sidorna. VX0–VX1 och VY0–H är det som syns. MID flyttar rutor och startskärm
  // till mitten av det som syns. UI_* är skärmens kanter innanför notch och
  // hemknapp, som läses från #safe.
  let VX0 = 0, VX1 = W, VY0 = 0, VW = W, VH = H, MID = 0;
  let UI_T = 0, UI_B = H, UI_L = 0, UI_R = W;
  const safe = document.getElementById('safe');
  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const cw = Math.max(1, Math.floor(stage.clientWidth)), ch = Math.max(1, Math.floor(stage.clientHeight));
    const s = Math.max(0.2, Math.min(cw / W, ch / H));
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    const ox = (cw - W * s) / 2, oy = ch - H * s;
    ctx.setTransform(s * dpr, 0, 0, s * dpr, ox * dpr, oy * dpr);
    VX0 = -ox / s; VX1 = W + ox / s; VY0 = -oy / s;
    VW = VX1 - VX0; VH = H - VY0; MID = VY0 / 2;
    const inset = safe ? getComputedStyle(safe) : null;
    const edge = side => (inset ? parseFloat(inset[side]) || 0 : 0) / s;
    UI_T = VY0 + edge('paddingTop'); UI_B = H - edge('paddingBottom');
    UI_L = VX0 + edge('paddingLeft'); UI_R = VX1 - edge('paddingRight');
    screen.style.setProperty('--s', s);
  }
  new ResizeObserver(fit).observe(stage);
  fit();

  try {
    document.fonts.load(`40px ${DISPLAY}`).catch(() => {});
    document.fonts.load(`800 18px ${BODY}`).catch(() => {});
  } catch {}

  function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function store(key, v) { try { localStorage.setItem(key, String(v)); } catch {} }

  // ready → playing → over → ready. Huset och pokalen öppnar en ruta i alla
  // lägen; mitt i ett spel pausar den, och nästa tryck fortsätter.
  let state = 'ready';
  const player = { x: START_X, y: START_Y, vy: 0, flapT: 0 };
  let pipes = [];
  let score = 0, best = Number(load('flappy-apa-best')) || 0, newBest = false;
  // Lådan: vad som samlats den här omgången, och allt som samlats totalt.
  let items = [], popups = [], box = ITEMS.map(() => 0);
  const lifetime = ITEMS.map(it => {
    try { return Math.max(0, Math.floor(Number(JSON.parse(load('flappy-apa-lada') || '{}')[it.id]) || 0)); } catch { return 0; }
  });
  // Krafterna och medaljen den här omgången, och alla medaljer man har fått.
  let powers = [], shield = false, magnetUntil = 0, slowUntil = 0, safeUntil = 0;
  let medal = -1, medalShownAt = -10;
  const medalCount = MEDALS.map(m => {
    try { return Math.max(0, Math.floor(Number(JSON.parse(load('flappy-apa-medaljer') || '{}')[m.id]) || 0)); } catch { return 0; }
  });
  let time = 0, overAt = 0, flash = 0, groundX = 0, hillX = 0, travel = 0;
  let overlay = null; // null | 'figures' | 'settings' | 'scores' | 'entry'
  let paused = false;

  // Första gången väljer man en av tre startfigurer. Den blir ens första figur och
  // valet görs bara en gång. Andra figurer köps med blå mynt under Figurer.
  // Figuren behålls hela omgången.
  const START_FIGURES = ['hund', 'apa', 'enhorning'];
  // Priset i blå mynt för varje grupp om fem figurer att köpa: de fem första kostar 3,
  // de fem nästa 5, och så vidare. Först kommer de två andra startfigurerna, sedan
  // resten i samlingens ordning, så priset är detsamma vilken man än valde först.
  const PRICES = [3, 5, 10, 15, 20, 25, 30, 35, 40, 45], PRICE_GROUP = 5;
  const OTHER_FIGURES = CHARACTERS.filter(c => !c.gift).map(c => c.id).filter(id => !START_FIGURES.includes(id));
  function figurePrice(ci) {
    const id = CHARACTERS[ci].id;
    const place = START_FIGURES.includes(id) ? 0 : START_FIGURES.length - 1 + OTHER_FIGURES.indexOf(id);
    return PRICES[Math.floor(place / PRICE_GROUP)];
  }
  let blueCoins = Math.max(0, Math.floor(Number(load('flappy-apa-blamynt')) || 0));
  let startMsg = { text: '', at: -10 };
  const idIndex = id => CHARACTERS.findIndex(c => c.id === id);
  let firstFigure = START_FIGURES.includes(load('flappy-apa-forsta')) ? load('flappy-apa-forsta') : null;
  const unlocked = new Set(firstFigure ? [firstFigure] : []);
  try {
    for (const id of JSON.parse(load('flappy-apa-upplasta') || '[]')) if (idIndex(id) >= 0) unlocked.add(id);
  } catch {}

  // Startskärmens ordning: den första figuren, de två andra startfigurerna, sedan resten.
  let PICKER = [];
  function buildPicker() {
    const head = firstFigure ? [firstFigure, ...START_FIGURES.filter(id => id !== firstFigure)] : START_FIGURES;
    PICKER = [...head, ...CHARACTERS.map(c => c.id).filter(id => !head.includes(id))].map(idIndex);
  }
  buildPicker();

  const choosingFirst = () => !firstFigure;
  // Medan man väljer sin första figur är de tre startfigurerna valbara, sedan de upplåsta.
  const isUnlocked = ci => {
    const id = CHARACTERS[ci].id;
    return choosingFirst() ? START_FIGURES.includes(id) : unlocked.has(id);
  };
  const fresh = new Set(); // köpta under det här besöket; märks "Ny!"
  const savedIndex = idIndex(load('flappy-apa-figur'));
  let charIndex = savedIndex >= 0 && isUnlocked(savedIndex) ? savedIndex : idIndex(firstFigure || 'apa');

  // Första gången öppnas Figurer av sig själv, så att man väljer sin första figur där.
  if (!firstFigure) overlay = 'figures';

  // En gåvofigur går inte att köpa och syns bara för den den är till: enheten som
  // äger namnet på topplistan, vilket servern säger (`ownedNames`). Den blir vald
  // direkt, och startskärmen säger vem den är till tills omgången börjar.
  let giftNote = '', ownedNames = new Set();
  // Den som gör spelet har alla figurer: enheten som äger namnet MAKER på någon av
  // topplistorna. Climbing Game gör likadant.
  const MAKER = 'admin';
  function giveGifts(withSound) {
    if (!choosingFirst() && ownedNames.has(MAKER) && CHARACTERS.some(c => !unlocked.has(c.id))) {
      CHARACTERS.forEach(c => unlocked.add(c.id));
      store('flappy-apa-upplasta', JSON.stringify([...unlocked]));
    }
    CHARACTERS.forEach((c, ci) => {
      if (choosingFirst() || !c.gift || !ownedNames.has(c.gift) || unlocked.has(c.id)) return;
      unlocked.add(c.id);
      store('flappy-apa-upplasta', JSON.stringify([...unlocked]));
      charIndex = ci;
      store('flappy-apa-figur', c.id);
      giftNote = `${c.name}en är en gåva till dig, ${(load('flappy-apa-namn') || c.gift).trim()}!`;
      if (withSound) sfx.reward();
    });
  }

  // Det första valet låses när man börjar flyga första gången.
  function lockFirstFigure() {
    firstFigure = CHARACTERS[charIndex].id;
    unlocked.add(firstFigure);
    store('flappy-apa-forsta', firstFigure);
    store('flappy-apa-upplasta', JSON.stringify([...unlocked]));
    buildPicker();
  }

  // Köp en låst figur för blå mynt, eller säg hur många som saknas.
  function buyFigure(ci) {
    const price = figurePrice(ci);
    if (blueCoins < price) {
      const missing = price - blueCoins;
      startMsg = { text: `Du behöver ${missing} blå mynt till`, at: time };
      sfx.click();
      return;
    }
    blueCoins -= price;
    store('flappy-apa-blamynt', blueCoins);
    unlocked.add(CHARACTERS[ci].id);
    store('flappy-apa-upplasta', JSON.stringify([...unlocked]));
    fresh.add(ci);
    startMsg = { text: `${CHARACTERS[ci].name} är din!`, at: time };
    sfx.reward();
    charIndex = ci;
    store('flappy-apa-figur', CHARACTERS[ci].id);
  }

  const REDUCE_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  // Tio världar i tur och ordning, var och en med sin bakgrund, sina hinder och sin
  // musik. Omgången börjar i den första och var 20:e poäng flyger man vidare till
  // nästa; efter den tionde börjar det om. `fallback` spelas om världens egen låt
  // inte går att hämta.
  const WORLDS = [
    { name: 'Djungeln', theme: 'apa', obstacle: 'stockar', song: 'djungel', fallback: 'glad' },
    { name: 'Bakgården', theme: 'hund', obstacle: 'klossar', song: 'glad' },
    { name: 'Blomsterängen', theme: 'bi', obstacle: 'svampar', song: 'lugn' },
    { name: 'Stranden', theme: 'sol', obstacle: 'sugror', song: 'strand', fallback: 'lugn' },
    { name: 'Öknen', theme: 'kamel', obstacle: 'kaktusar', song: 'oken', fallback: 'glad' },
    { name: 'Arktis', theme: 'pingvin', obstacle: 'istappar', song: 'jul' },
    { name: 'Slottet', theme: 'drake', obstacle: 'pelare', song: 'slott', fallback: 'spok' },
    { name: 'Fabriken', theme: 'robot', obstacle: 'ror', song: 'rymd' },
    { name: 'Spöknatten', theme: 'spoke', obstacle: 'lyktor', song: 'spok' },
    { name: 'Regnbågslandet', theme: 'enhorning', obstacle: 'tartor', song: 'regnbage', fallback: 'glad' },
  ];
  const WORLD_EVERY = 20;
  let worldStep = 0, nextWorldAt = WORLD_EVERY, worldShownAt = -10;
  const world = () => WORLDS[worldStep];
  // Nivå: den högsta värld man har nått, visas uppe till höger på startskärmen.
  let bestLevel = Math.min(WORLDS.length, Math.max(1, Math.floor(Number(load('flappy-apa-niva')) || 1)));
  const theme = () => THEMES[world().theme];
  const worldName = () => world().name;
  const currentObstacle = () => OBSTACLES.findIndex(o => o.id === world().obstacle);
  // Svårare mot slutet: från den sjätte världen krymper öppningen 5 för varje värld,
  // och från den åttonde glider hindren upp och ner, längre för varje värld: 30, 38
  // och 46 åt varje håll, ett varv på drygt 3 sekunder, så att det syns direkt.
  const gapSize = () => GAP - 5 * Math.max(0, worldStep - 4);
  const glideSize = () => (worldStep >= 7 ? 30 + 8 * (worldStep - 7) : 0);
  const GLIDE_SPEED = 2.0, WORLD_BONUS = 2;
  // Det som blir nytt i en värld visas under dess namn när man flyger in.
  const worldNews = () => (worldStep === 5 ? 'Öppningarna blir smalare!' : worldStep === 7 ? 'Nu rör sig hindren!' : '');

  // ---------- Topplistan ----------
  // Listan hämtas från och sparas via /api/scores, som håller den i Supabase med ett
  // namn per rad och dess bästa resultat. Ett namn hör till den enhet som tog det
  // först; enheten känns igen på en slumpad nyckel som bara finns här.
  let mode = 'loading'; // 'loading' | 'ready' | 'error'
  let topList = [];
  let entryScore = 0, pendingEntry = false, afterSave = false, savedEntry = null, saving = false;

  function cleanEntries(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, TOP).map(e => ({
      name: String(e?.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 12) || 'Okänd',
      score: Math.max(0, Math.min(9999, Math.floor(Number(e?.score) || 0))),
      figure: CHARACTERS.some(c => c.id === e?.figure) ? e.figure : 'apa',
      at: typeof e?.at === 'string' ? e.at.slice(0, 40) : '',
    })).filter(e => e.score > 0);
  }

  // Ett namn står bara en gång på listan, med sitt bästa resultat.
  // "Erik" och "erik " räknas som samma namn.
  const nameKey = name => name.trim().toLocaleLowerCase('sv');
  const byRank = (a, b) => b.score - a.score || (a.at < b.at ? -1 : a.at > b.at ? 1 : 0);

  function topTen(list) {
    const best = new Map();
    for (const e of list) {
      const key = nameKey(e.name), held = best.get(key);
      if (!held || byRank(e, held) < 0) best.set(key, e);
    }
    return [...best.values()].sort(byRank).slice(0, TOP);
  }

  const board = () => topList;
  const sameEntry = (a, b) => !!a && !!b && a.at === b.at && a.name === b.name && a.score === b.score;

  // Går listan inte att hämta går den inte heller att skriva in sig på.
  function qualifies(s) {
    const b = board();
    return mode === 'ready' && s > 0 && (b.length < TOP || s > b[TOP - 1].score);
  }
  const rankFor = s => board().filter(e => e.score >= s).length + 1;

  function deviceKey() {
    let key = load('flappy-apa-nyckel');
    if (!key) {
      key = window.crypto?.randomUUID?.() ?? Array.from({ length: 4 }, () => Math.random().toString(36).slice(2)).join('');
      store('flappy-apa-nyckel', key);
    }
    return key;
  }

  // Varje svar har listan och vilka namn som hör till den här enheten; en gåva till
  // ett av dem lämnas ut direkt.
  async function scoresRequest(path = '/api/scores', body = null, withSound = false) {
    const res = await fetch(path, {
      method: body ? 'POST' : 'GET',
      cache: 'no-store',
      headers: { 'x-player-key': deviceKey(), ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw Object.assign(new Error('Topplistan svarade ' + res.status), { status: res.status });
    const data = await res.json();
    topList = topTen(cleanEntries(data?.entries));
    ownedNames = new Set(Array.isArray(data?.mine) ? data.mine : []);
    mode = 'ready';
    giveGifts(withSound);
  }

  // Hämtar listan på nytt; går det inte behålls den som redan hämtats.
  async function refreshBoard(path, body) {
    try {
      await scoresRequest(path, body);
    } catch {
      if (mode === 'loading') mode = 'error';
    }
  }
  // Ett namn som sparades här innan namnen fick ägare tas först, så att det blir enhetens.
  const savedName = load('flappy-apa-namn');
  if (savedName) refreshBoard('/api/scores/claim', { name: savedName });
  else refreshBoard();

  async function saveEntry(name) {
    const score = entryScore;
    await scoresRequest('/api/scores', { name, score, figure: CHARACTERS[charIndex].id }, true);
    // raden som servern sparade, så att den markeras på listan
    return topList.find(e => nameKey(e.name) === nameKey(name) && e.score === score) ?? null;
  }

  function saveError(err) {
    if (err?.status === 409) return 'Det namnet hör till någon annan. Välj ett annat.';
    if (err?.status === 429) return 'Listan tar inte emot fler namn just nu.';
    return 'Det gick inte att spara. Försök igen.';
  }

  // ---------- Ljud ----------
  // Alla ljud byggs med Web Audio, utan ljudfiler. Webbläsaren släpper fram ljud
  // först efter ett tryck, så ljudmotorn startas vid första flaxet.
  const sfx = (() => {
    let ac = null, out = null, noiseBuf = null;
    let sfxOn = load('flappy-apa-ljud') !== 'av';

    // Ljudmotorn startas om ljudeffekterna eller musiken är på.
    function ensure() {
      if (!sfxOn && !musicOn) return null;
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ac = new AC(); } catch { return null; }
        out = ac.createGain(); out.gain.value = 0.45; out.connect(ac.destination);
        noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        loadSamples();
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    }
    const audio = () => (sfxOn ? ensure() : null);

    // Ljudeffekterna är gjorda med ElevenLabs Sound Effects och publicerade
    // bredvid sidan i ljud/. Alla hämtas när ljudmotorn startar; de är små.
    // Klicket kom ut nästan tyst från ElevenLabs, så det byggda klicket behålls.
    const SAMPLE_NAMES = [
      'wing', 'jet', 'fire', 'buzz', 'woo', 'zap', 'bubble', 'boing', 'moo', 'woof', 'chime',
      'score', 'crash', 'fanfare', 'select', 'swish', 'collect',
    ];
    const SAMPLE_VOL = 0.45;
    const samples = {};

    function loadSamples() {
      for (const name of SAMPLE_NAMES) {
        fetch(`/ljud/${name}.mp3`)
          .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
          .then(data => new Promise((resolve, reject) => ac.decodeAudioData(data, resolve, reject)))
          .then(buf => { samples[name] = buf; })
          .catch(() => {});
      }
    }

    // Spelar en hämtad ljudfil; svarar false om den inte finns, så att det byggda ljudet tar över.
    function sample(name, { vol = 1, rate = 1, delay = 0 } = {}) {
      const a = audio(), buf = samples[name];
      if (!a || !buf) return false;
      const src = a.createBufferSource(), gain = a.createGain();
      src.buffer = buf;
      src.playbackRate.value = rate;
      gain.gain.value = vol * SAMPLE_VOL;
      src.connect(gain); gain.connect(out);
      src.start(a.currentTime + delay);
      return true;
    }

    function envelope(gain, t, vol, dur) {
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }

    function tone({ type = 'sine', from, to = from, dur = 0.12, vol = 0.2, delay = 0 }) {
      const a = audio();
      if (!a) return;
      const t = a.currentTime + delay, osc = a.createOscillator(), gain = a.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(to, t + dur);
      envelope(gain, t, vol, dur);
      osc.connect(gain); gain.connect(out);
      osc.start(t); osc.stop(t + dur + 0.02);
    }

    function noise({ type = 'bandpass', from = 1000, to = from, q = 1, dur = 0.15, vol = 0.2, delay = 0 }) {
      const a = audio();
      if (!a) return;
      const t = a.currentTime + delay, src = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain();
      src.buffer = noiseBuf;
      filter.type = type; filter.Q.value = q;
      filter.frequency.setValueAtTime(from, t);
      filter.frequency.exponentialRampToValueAtTime(to, t + dur);
      envelope(gain, t, vol, dur);
      src.connect(filter); filter.connect(gain); gain.connect(out);
      src.start(t); src.stop(t + dur + 0.02);
    }

    const FLAPS = {
      wing: () => { noise({ from: 700, to: 2600, q: 0.8, dur: 0.12, vol: 0.22 }); tone({ from: 520, to: 880, dur: 0.07, vol: 0.06 }); },
      jet: () => noise({ type: 'lowpass', from: 2400, to: 500, dur: 0.25, vol: 0.3 }),
      fire: () => { noise({ type: 'lowpass', from: 1600, to: 300, dur: 0.3, vol: 0.32 }); tone({ type: 'sawtooth', from: 90, to: 60, dur: 0.2, vol: 0.05 }); },
      buzz: () => tone({ type: 'sawtooth', from: 190, to: 230, dur: 0.16, vol: 0.08 }),
      woo: () => { tone({ from: 260, to: 420, dur: 0.16, vol: 0.14 }); tone({ from: 420, to: 260, dur: 0.2, vol: 0.12, delay: 0.14 }); },
      zap: () => tone({ type: 'square', from: 1400, to: 180, dur: 0.14, vol: 0.06 }),
      bubble: () => { tone({ from: 320, to: 900, dur: 0.07, vol: 0.18 }); tone({ from: 420, to: 1150, dur: 0.06, vol: 0.12, delay: 0.06 }); },
      boing: () => tone({ type: 'triangle', from: 140, to: 620, dur: 0.18, vol: 0.2 }),
      moo: () => { tone({ type: 'sawtooth', from: 150, to: 115, dur: 0.32, vol: 0.06 }); tone({ from: 150, to: 115, dur: 0.32, vol: 0.12 }); },
      woof: () => { noise({ from: 700, to: 400, q: 1.5, dur: 0.07, vol: 0.3 }); tone({ type: 'square', from: 240, to: 150, dur: 0.08, vol: 0.06 }); },
      chime: () => { tone({ from: 1320, dur: 0.18, vol: 0.1 }); tone({ from: 1760, dur: 0.22, vol: 0.08, delay: 0.05 }); },
    };

    // Bakgrundsmusik: låtar gjorda med ElevenLabs Music, publicerade bredvid sidan.
    // En låt hämtas först när den ska spelas. Den går runt med en mjuk övertoning
    // mellan slutet och början, och tonar över när världen byts.
    const TRACKS = Object.fromEntries(
      ['glad', 'lugn', 'spok', 'rymd', 'jul', 'djungel', 'strand', 'oken', 'slott', 'regnbage']
        .map(name => [name, `/musik/${name}.mp3`]));
    const buffers = {}, failed = {}, loading = {};
    let musicOn = load('flappy-apa-musik') !== 'av';
    let bus = null, current = null;

    function fetchTrack(name) {
      if (loading[name] || failed[name] || buffers[name]) return;
      loading[name] = true;
      fetch(TRACKS[name])
        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); })
        .then(data => new Promise((resolve, reject) => ac.decodeAudioData(data, resolve, reject)))
        .then(buf => { buffers[name] = buf; })
        .catch(() => { failed[name] = true; })
        .finally(() => { loading[name] = false; });
    }

    // Var låten börjar och slutar höras, utan tystnad i ändarna.
    function audible(buf) {
      const d = buf.getChannelData(0);
      let a = 0, b = d.length - 1;
      while (a < b && Math.abs(d[a]) < 0.02) a++;
      while (b > a && Math.abs(d[b]) < 0.02) b--;
      return { start: a / buf.sampleRate, length: (b - a + 1) / buf.sampleRate };
    }

    function playSegment(loop, at) {
      const src = ac.createBufferSource(), fade = ac.createGain(), { start, length, overlap } = loop;
      src.buffer = loop.buf;
      fade.gain.setValueAtTime(0.0001, at);
      fade.gain.linearRampToValueAtTime(1, at + overlap);
      fade.gain.setValueAtTime(1, at + length - overlap);
      fade.gain.linearRampToValueAtTime(0.0001, at + length);
      src.connect(fade); fade.connect(loop.gain);
      src.start(at, start, length);
      loop.sources = [...loop.sources.slice(-2), src];
      loop.nextAt = at + length - overlap;
    }

    function startTrack(name, buf) {
      const { start, length } = audible(buf), t = ac.currentTime;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(1, t + 0.8);
      gain.connect(bus);
      current = { name, buf, gain, start, length, overlap: Math.min(2, length / 4), sources: [], nextAt: t };
      playSegment(current, t);
    }

    function stopTrack(fade) {
      if (!current) return;
      const { gain, sources } = current, t = ac.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
      gain.gain.linearRampToValueAtTime(0.0001, t + fade);
      for (const s of sources) { try { s.stop(t + fade + 0.05); } catch {} }
      current = null;
    }

    // `names` är låtar i önskad ordning; den första som inte misslyckats spelas.
    function tickMusic(names) {
      if (!ac) return;
      const name = names.find(n => n && !failed[n]);
      if (!name) return;
      if (!musicOn || ac.state !== 'running') { stopTrack(0.3); return; }
      if (!bus) { bus = ac.createGain(); bus.gain.value = 0.35; bus.connect(out); }
      // den gamla låten spelar vidare tills den nya är hämtad
      if (current?.name !== name) {
        if (buffers[name]) { stopTrack(0.8); startTrack(name, buffers[name]); }
        else fetchTrack(name);
      }
      if (current && ac.currentTime > current.nextAt - 0.5) playSegment(current, current.nextAt);
    }

    // Ingen musik i en dold flik.
    document.addEventListener?.('visibilitychange', () => {
      if (!ac) return;
      if (document.hidden) ac.suspend().catch(() => {});
      else if (sfxOn || musicOn) ac.resume().catch(() => {});
    });

    return {
      get sfxOn() { return sfxOn; },
      get musicOn() { return musicOn; },
      unlock: () => { ensure(); },
      tickMusic,
      toggleSfx() {
        sfxOn = !sfxOn;
        store('flappy-apa-ljud', sfxOn ? 'på' : 'av');
        this.click();
      },
      toggleMusic() {
        musicOn = !musicOn;
        store('flappy-apa-musik', musicOn ? 'på' : 'av');
        ensure();
        this.click();
      },
      // Varje ljud spelar ElevenLabs-filen om den är hämtad, annars det byggda ljudet.
      flap: kind => {
        const name = FLAPS[kind] ? kind : 'wing';
        if (!sample(name, { vol: 0.8, rate: 0.95 + Math.random() * 0.1 })) FLAPS[name]();
      },
      score: () => {
        if (sample('score', { vol: 0.7 })) return;
        tone({ type: 'triangle', from: 880, dur: 0.08, vol: 0.16 });
        tone({ type: 'triangle', from: 1320, dur: 0.14, vol: 0.14, delay: 0.07 });
      },
      crash: () => {
        if (sample('crash', { vol: 1 })) return;
        noise({ type: 'lowpass', from: 900, to: 120, dur: 0.35, vol: 0.45 });
        tone({ from: 180, to: 45, dur: 0.35, vol: 0.3 });
      },
      fanfare: (delay = 0) => {
        if (sample('fanfare', { vol: 0.8, delay })) return;
        [523, 659, 784, 1047].forEach((f, k) =>
          tone({ type: 'triangle', from: f, dur: k === 3 ? 0.35 : 0.12, vol: 0.14, delay: delay + k * 0.1 }));
      },
      click: () => tone({ type: 'triangle', from: 700, dur: 0.04, vol: 0.1 }),
      select: () => sample('select', { vol: 0.7 }) || tone({ type: 'triangle', from: 520, to: 780, dur: 0.08, vol: 0.12 }),
      // ljusare ju mer saken är värd
      collect: value => {
        if (sample('collect', { vol: 0.8, rate: 1 + value * 0.04 })) return;
        [1, 1.25, 1.5].forEach((m, k) =>
          tone({ type: 'triangle', from: (700 + value * 45) * m, dur: k === 2 ? 0.14 : 0.06, vol: 0.13, delay: k * 0.05 }));
      },
      swish: () => sample('swish', { vol: 0.6 }) || noise({ type: 'highpass', from: 1200, to: 3000, dur: 0.09, vol: 0.12 }),
      // ett glatt pling när man får något: en ny figur eller en kraft
      reward: () => {
        if (!sample('select', { vol: 0.8, rate: 1.15 })) tone({ type: 'triangle', from: 620, to: 930, dur: 0.1, vol: 0.13 });
        if (!sample('chime', { vol: 0.8, delay: 0.08 })) FLAPS.chime();
      },
      // ett sus och ett glitter när man flyger in i en ny värld
      portal: () => {
        if (!sample('swish', { vol: 0.9 })) noise({ type: 'highpass', from: 800, to: 3200, dur: 0.25, vol: 0.18 });
        if (!sample('chime', { vol: 1, delay: 0.1 })) FLAPS.chime();
      },
    };
  })();

  // Figurer som låter på sitt eget sätt när de flaxar; resten låter som vingar.
  const FLAP_SOUND = {
    astronaut: 'jet', robot: 'jet', drake: 'fire', bi: 'buzz', spoke: 'woo', alien: 'zap',
    blackfisk: 'bubble', groda: 'boing', ko: 'moo', hund: 'woof', enhorning: 'chime', sol: 'chime', tomte: 'chime', guld: 'chime', prinsessa: 'chime',
    haj: 'bubble', delfin: 'bubble', sjojungfru: 'bubble', pirat: 'jet', trollkarl: 'chime', haxa: 'woo',
    skoldpadda: 'buzz', nyckelpiga: 'buzz',
  };

  // ---------- Spelets gång ----------

  function reset() {
    state = 'ready'; paused = false;
    player.y = START_Y; player.vy = 0;
    pipes = []; score = 0; newBest = false;
    items = []; popups = []; box = ITEMS.map(() => 0);
    powers = []; shield = false; magnetUntil = slowUntil = safeUntil = 0; medal = -1;
    worldStep = 0; nextWorldAt = WORLD_EVERY;
    pendingEntry = false; afterSave = false; savedEntry = null;
  }

  // Nästa värld i ordningen; hinder som redan syns behåller sin sort. Varje ny värld
  // ger blå mynt, som hamnar i lådan.
  function enterNewWorld() {
    worldStep = (worldStep + 1) % WORLDS.length;
    if (worldStep + 1 > bestLevel) { bestLevel = worldStep + 1; store('flappy-apa-niva', bestLevel); }
    worldShownAt = time;
    blueCoins += WORLD_BONUS; box[BLUE] += WORLD_BONUS;
    store('flappy-apa-blamynt', blueCoins);
    sfx.portal();
  }

  // Poängen kan hoppa över gränsen med en sak; då blir det ändå bara en ny värld.
  function checkWorld() {
    if (score < nextWorldAt) return;
    nextWorldAt = (Math.floor(score / WORLD_EVERY) + 1) * WORLD_EVERY;
    enterNewWorld();
  }

  // En medalj när poängen når nästa gräns; flera gränser på en gång ger bara den högsta.
  function checkMedal() {
    let m = medal;
    while (m + 1 < MEDALS.length && score >= MEDALS[m + 1].at) m++;
    if (m === medal) return;
    medal = m; medalShownAt = time;
    sfx.fanfare();
  }

  function collect(it) {
    const { value, currency } = ITEMS[it.kind];
    it.taken = true;
    box[it.kind]++;
    if (currency) {
      blueCoins++;
      store('flappy-apa-blamynt', blueCoins);
      popups.push({ x: it.x, y: it.y, text: '+1 blått mynt', at: time, color: C.blue, size: 16 });
      sfx.collect(8);
      return;
    }
    score += value;
    popups.push({ x: it.x, y: it.y, text: '+' + value, at: time });
    sfx.collect(value);
    checkWorld(); checkMedal();
  }

  function takePower(it) {
    const pw = POWERS[it.kind];
    it.taken = true;
    pw.take();
    popups.push({ x: it.x, y: it.y, text: pw.name + '!', at: time, color: C.white, size: 18 });
    sfx.reward();
  }

  // Skölden tar en krock: figuren blinkar en stund och kan flyga ut ur hindret.
  function survives() {
    if (time < safeUntil) return true;
    if (!shield) return false;
    shield = false; safeUntil = time + SAFE_TIME; flash = 0.6;
    popups.push({ x: player.x, y: player.y - 10, text: 'Skölden höll!', at: time, color: C.blue, size: 18 });
    sfx.swish();
    return true;
  }

  function flap() {
    if (state === 'ready') {
      if (choosingFirst()) lockFirstFigure();
      state = 'playing';
      giftNote = '';
    }
    if (state === 'playing') {
      paused = false; player.vy = FLAP; player.flapT = 0.25;
      sfx.flap(FLAP_SOUND[CHARACTERS[charIndex].id]);
      return;
    }
    if (state === 'over' && !pendingEntry && time - overAt > 0.6) reset();
  }

  function crash() {
    state = 'over'; overAt = time; flash = 1;
    sfx.crash();
    if (medal >= 0) {
      medalCount[medal]++;
      store('flappy-apa-medaljer', JSON.stringify(Object.fromEntries(MEDALS.map((m, i) => [m.id, medalCount[i]]))));
    }
    if (box.some(n => n > 0)) {
      box.forEach((n, i) => { lifetime[i] += n; });
      store('flappy-apa-lada', JSON.stringify(Object.fromEntries(ITEMS.map((it, i) => [it.id, lifetime[i]]))));
    }
    if (score > best) { best = score; newBest = true; store('flappy-apa-best', best); sfx.fanfare(0.45); }
    entryScore = score;
    pendingEntry = qualifies(score);
  }

  function openOverlay(name) {
    sfx.click();
    overlay = name;
    if (name === 'scores') refreshBoard();
    if (name === 'figures') figPage = 0;
    if (state === 'playing') paused = true;
  }
  function closeOverlay() { overlay = null; canvas.focus({ preventScroll: true }); }
  function toggleOverlay(name) { overlay === name ? closeOverlay() : openOverlay(name); }
  function pickFigure(i) {
    if (state !== 'ready' || charIndex === i) return;
    sfx.select();
    charIndex = i;
    store('flappy-apa-figur', CHARACTERS[i].id);
  }

  function nextGap(prev, size, glide) {
    const min = 60 + size / 2 + glide, max = H - GROUND - 60 - size / 2 - glide;
    let y = min + Math.random() * (max - min);
    if (prev !== undefined) y = Math.max(prev - 160, Math.min(prev + 160, y));
    return y;
  }

  function circleHitsRect(cx, cy, r, x, y, w, h) {
    const nx = Math.max(x, Math.min(cx, x + w));
    const ny = Math.max(y, Math.min(cy, y + h));
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
  }

  // Träffrutor [x, y, bredd, höjd] för en bred ände mot öppningen och ett smalare skaft.
  function headAndShaft(p, headW, headLen, shaftW) {
    const [topEnd, botStart] = gapEnds(p), cx = p.x + PIPE_W / 2;
    return [
      [cx - headW / 2, topEnd - headLen, headW, headLen],
      [cx - shaftW / 2, VY0 - 100, shaftW, topEnd - headLen - VY0 + 100],
      [cx - headW / 2, botStart, headW, headLen],
      [cx - shaftW / 2, botStart + headLen, shaftW, H - GROUND - botStart - headLen],
    ];
  }

  function hitRects(p) {
    const ob = OBSTACLES[p.kind];
    if (ob.hits) return ob.hits(p);
    const { inset = 0, grace = 0 } = ob;
    const [topEnd, botStart] = gapEnds(p), x = p.x + inset, w = PIPE_W - inset * 2;
    return [[x, VY0 - 100, w, topEnd - grace - VY0 + 100], [x, botStart + grace, w, H - GROUND - botStart - grace]];
  }

  function hitsPipe(p) {
    return hitRects(p).some(([x, y, w, h]) => circleHitsRect(player.x, player.y, HIT, x, y, w, h));
  }

  function update(dt) {
    time += dt;
    flash = Math.max(0, flash - dt * 4);
    player.flapT = Math.max(0, player.flapT - dt);
    if (state === 'over' && pendingEntry && !overlay && time - overAt > 0.9) openEntry();
    if (overlay || paused) return;
    if (time < slowUntil) dt *= SLOW;

    if (state !== 'over') {
      groundX = (groundX - SPEED * dt) % 24;
      hillX -= SPEED * 0.35 * dt;
      travel += SPEED * dt;
    }

    if (state === 'ready') {
      player.y = START_Y + Math.sin(time * 3) * 8;
      return;
    }

    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y < VY0 + HIT) { player.y = VY0 + HIT; player.vy = 0; }

    const floor = H - GROUND - HIT;
    if (player.y >= floor) {
      player.y = floor; player.vy = 0;
      // med skölden studsar figuren upp från marken
      if (state === 'playing' && survives()) player.vy = FLAP;
      else { if (state === 'playing') crash(); return; }
    }
    if (state !== 'playing') return;

    const last = pipes[pipes.length - 1];
    if (!last || last.x < VX1 + 60 - SPACING) {
      const size = gapSize(), glide = glideSize();
      const pipe = {
        x: last ? last.x + SPACING : VX1 + 60,
        gap: nextGap(last?.gap, size, glide), size, glide, swing: Math.random() * 6,
        tint: nextTint(last?.tint),
        seed: Math.floor(Math.random() * 6),
        kind: currentObstacle(),
        scored: false,
      };
      pipes.push(pipe);
      // mitt emellan två hinder, på vägen mellan deras öppningar: ibland en kraft, annars ofta en sak
      if (last) {
        const x = last.x + PIPE_W + (SPACING - PIPE_W) / 2;
        const y = Math.max(50, Math.min(H - GROUND - 40, (last.gap + pipe.gap) / 2 + (Math.random() - 0.5) * 60));
        if (Math.random() < POWER_CHANCE) powers.push({ x, y, kind: Math.floor(Math.random() * POWERS.length), phase: Math.random() * 6, taken: false });
        else if (Math.random() < ITEM_CHANCE) items.push({ x, y, kind: pickItem(), phase: Math.random() * 6, taken: false });
      }
    }
    items = movePickups(items, dt, collect);
    powers = movePickups(powers, dt, takePower);
    for (const p of pipes) {
      p.x -= SPEED * dt;
      if (p.glide) p.swing += GLIDE_SPEED * dt;
      if (!p.scored && p.x + PIPE_W / 2 < player.x) { p.scored = true; score++; sfx.score(); checkWorld(); checkMedal(); }
      if (hitsPipe(p) && !survives()) { crash(); break; }
    }
    pipes = pipes.filter(p => p.x + PIPE_W > VX0 - 20);
  }

  // Saker och krafter glider med hindren; medan magneten verkar dras de som är nära
  // mot figuren. Det som plockas upp eller har passerat försvinner ur listan.
  function movePickups(list, dt, take) {
    for (const it of list) {
      it.x -= SPEED * dt;
      const dx = player.x - it.x, dy = player.y - it.y, d = Math.hypot(dx, dy);
      if (time < magnetUntil && d < MAGNET_R && d > 1) {
        const step = Math.min(d, MAGNET_PULL * dt);
        it.x += dx / d * step; it.y += dy / d * step;
      }
      const iy = it.y + Math.sin(time * 3 + it.phase) * 4;
      if (!it.taken && (player.x - it.x) ** 2 + (player.y - iy) ** 2 < (HIT + ITEM_R) ** 2) take(it);
    }
    return list.filter(it => !it.taken && it.x > VX0 - 30);
  }

  // ---------- Namnrutan ----------

  const entryForm = document.getElementById('entry');
  const entryTitle = document.getElementById('entry-title');
  const entryName = document.getElementById('entry-name');
  const entrySave = document.getElementById('entry-save');
  const entrySkip = document.getElementById('entry-skip');
  const entryError = document.getElementById('entry-error');

  function showEntryError(text) { entryError.textContent = text; entryError.hidden = false; }

  function openEntry() {
    pendingEntry = false;
    overlay = 'entry';
    entryTitle.textContent = `Plats ${rankFor(entryScore)} med ${entryScore} poäng`;
    entryName.value = load('flappy-apa-namn') || '';
    entryError.hidden = true;
    entrySave.disabled = false;
    entrySave.textContent = 'Spara';
    entryForm.hidden = false;
    entryName.focus({ preventScroll: true });
    entryName.select();
  }

  function closeEntry() {
    entryForm.hidden = true;
    closeOverlay();
  }

  entryForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (saving) return;
    const name = entryName.value.replace(/\s+/g, ' ').trim().slice(0, 12);
    if (!name) { showEntryError('Skriv ett namn först.'); entryName.focus(); return; }
    const held = board().find(e => nameKey(e.name) === nameKey(name));
    if (held && held.score >= entryScore) {
      showEntryError(ownedNames.has(nameKey(name))
        ? `Ditt bästa på listan är redan ${held.score} poäng.`
        : `${held.name} har redan ${held.score} poäng på listan. Välj ett annat namn eller hoppa över.`);
      entryName.focus();
      return;
    }
    saving = true;
    entrySave.disabled = true;
    entrySave.textContent = 'Sparar…';
    try {
      savedEntry = await saveEntry(name);
      store('flappy-apa-namn', name);
      afterSave = true; overAt = time;
      sfx.select();
      closeEntry();
    } catch (err) {
      showEntryError(saveError(err));
      entrySave.disabled = false;
      entrySave.textContent = 'Spara';
    } finally {
      saving = false;
    }
  });
  entrySkip.addEventListener('click', closeEntry);

  // ---------- Ritverktyg ----------

  function blob(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function oval(x, y, rx, ry, fill, rot = 0) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
  }

  function ovalEdge(x, y, rx, ry, fill, edge, rot = 0) {
    oval(x, y, rx, ry, fill, rot);
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke();
  }

  function poly(points, fill, edge, width = 1.5) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  function inside(p, b) { return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }

  function say(str, x, y, size, { font = DISPLAY, weight = '', fill = C.white, stroke = C.ink, align = 'center' } = {}) {
    ctx.font = `${weight} ${size}px ${font}`.trim();
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (stroke) {
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 6);
      ctx.strokeStyle = stroke; ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = fill; ctx.fillText(str, x, y);
  }

  // Rubriken på startskärmen: varje bokstav i en egen färg, och bokstäverna guppar
  // i en våg. Alla konturer ritas före bokstäverna, så att ingen kontur täcker grannen.
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

  // Upprepade lager: element nummer i ligger på i * step + offset.
  // Något med jämna mellanrum över hela bredden som syns; `i` räknar dem i världen.
  function repeat(offset, step, fn) {
    const first = Math.floor((VX0 - offset) / step) - 1;
    for (let i = first; i * step + offset < VX1 + step; i++) fn(i * step + offset, i);
  }

  // Kopior av något som ligger vid x0, med `span` mellanrum, över hela bredden som
  // syns och `pad` utanför. Så täcker moln, stjärnor och snö som är gjorda för W
  // också en bredare skärm.
  function spanX(x0, span, pad, fn) {
    const start = x0 - Math.ceil((x0 - (VX0 - pad)) / span) * span;
    for (let x = start; x < VX1 + pad; x += span) fn(x);
  }
  const tileX = (x0, fn) => spanX(x0, W, 0, fn);
  // Första k för saker på marken vid off + k * step, så att de börjar utanför vänsterkanten.
  const stepFrom = (off, step) => Math.floor((VX0 - off) / step) - 1;

  // Fyller hela skärmen oavsett var spelet ligger på den.
  function fillScreen(color) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Rutor och startskärmens mitt ritas flyttade till mitten av det som syns.
  function uiFrame(fn) {
    ctx.save(); ctx.translate(0, MID); fn(); ctx.restore();
  }

  // ---------- Världarna ----------

  function drawSky(t) {
    const g = ctx.createLinearGradient(0, VY0, 0, H);
    g.addColorStop(0, t.sky[0]); g.addColorStop(1, t.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(VX0, VY0, VW, VH);
    t.backdrop();
  }

  function drawClouds(color) {
    for (const [cx0, cy, s] of [[40, 90, 1], [230, 150, 0.7], [330, 60, 0.85]]) {
      spanX(cx0 - time * 12 * s - 70, W + 140, 70, cx => {
        blob(cx, cy, 18 * s, color);
        blob(cx + 20 * s, cy - 10 * s, 22 * s, color);
        blob(cx + 42 * s, cy, 17 * s, color);
        ctx.fillRect(cx, cy, 42 * s, 17 * s);
      });
    }
  }

  function drawCanopy(offset, baseY, r, step, color) {
    repeat(offset, step, (x, i) => blob(x, baseY - (((i * 7919) % 5) + 5) % 5 * 7, r, color));
    ctx.fillRect(VX0, baseY, VW, H - baseY);
  }

  function drawStars(strength = 1) {
    // stjärnorna upprepas också uppåt när det syns mer himmel
    const up = H - GROUND - 40;
    for (const s of STARS) {
      ctx.globalAlpha = (0.55 + 0.45 * Math.sin(time * 2 + s.tw)) * strength;
      tileX(s.x + hillX * 0.15, x => {
        for (let y = s.y; y > VY0 - 4; y -= up) blob(x, y, s.r, '#ffffff');
      });
    }
    ctx.globalAlpha = 1;
  }

  function drawPlanet() {
    blob(70, 100, 12, '#d8d4ea');
    blob(66, 97, 2.5, '#bdb7d6');
    blob(74, 104, 2, '#bdb7d6');

    const y = 170;
    spanX(290 + hillX * 0.08 - 80, W + 160, 80, x => {
      ctx.strokeStyle = '#f3e3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, 42, 10, -0.3, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#f2a65a'; ctx.fillRect(x - 24, y - 24, 48, 48);
      oval(x, y - 8, 30, 4, '#e08a3c', -0.3);
      oval(x, y + 6, 30, 3, '#e08a3c', -0.3);
      ctx.restore();
      ctx.strokeStyle = '#f3e3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, 42, 10, -0.3, 0, Math.PI); ctx.stroke();
    });
  }

  function drawRainbow() {
    ctx.save();
    ctx.globalAlpha = 0.45; ctx.lineWidth = 10;
    RAINBOW.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.beginPath(); ctx.arc(260, 500, 240 - i * 10, Math.PI, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
  }

  function drawVolcanoes(offset) {
    const base = 472;
    repeat(offset, 200, (x, i) => {
      const top = base - 110 - (hash(i) % 4) * 14;
      for (let j = 0; j < 3; j++) {
        const t = (time * 0.35 + j / 3 + (hash(i) % 10) / 10) % 1;
        blob(x + Math.sin(t * 5 + i) * 6, top - 8 - t * 80, 7 + t * 14, `rgba(110,96,96,${0.4 * (1 - t)})`);
      }
      poly([[x - 95, base], [x - 20, top], [x + 20, top], [x + 95, base]], '#8a5537');
      poly([[x - 20, top], [x + 20, top], [x + 13, top + 12], [x + 5, top + 26], [x - 4, top + 14], [x - 13, top + 20]], '#ff5e3a');
    });
    ctx.fillStyle = '#7a4a2e'; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawFerns(offset) {
    repeat(offset, 74, (x, i) => {
      const s = 0.8 + (hash(i) % 3) * 0.15;
      for (const a of [-1.2, -0.6, 0, 0.6, 1.2]) {
        oval(x + Math.sin(a) * 16 * s, H - GROUND - Math.cos(a) * 16 * s, 5 * s, 18 * s, '#4d7f33', a);
      }
    });
  }

  function drawHouses(offset) {
    const base = 478, colors = ['#f4a261', '#e9c46a', '#a8dadc', '#cdb4db', '#f6bd60'];
    repeat(offset, 92, (x, i) => {
      const h = hash(i), w = 64, top = base - 46 - (h % 3) * 12;
      ctx.fillStyle = colors[h % colors.length]; ctx.fillRect(x, top, w, base - top);
      poly([[x - 7, top], [x + w / 2, top - 28], [x + w + 7, top]], '#b5584a');
      ctx.fillStyle = '#fff6d5';
      ctx.fillRect(x + 12, top + 12, 13, 13);
      ctx.fillRect(x + w - 25, top + 12, 13, 13);
    });
    ctx.fillStyle = '#9ccf7a'; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawFence(offset) {
    const top = 466, bottom = H - GROUND, white = '#fbf8f1', edge = '#b9b0a0';
    for (const y of [478, 500]) {
      ctx.fillStyle = white; ctx.fillRect(VX0, y, VW, 6);
      ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.strokeRect(VX0 - 2, y, VW + 4, 6);
    }
    repeat(offset, 18, x => {
      poly([[x, bottom], [x, top + 6], [x + 5, top], [x + 10, top + 6], [x + 10, bottom]], white, edge);
    });
  }

  function drawAurora() {
    ctx.save();
    ctx.lineCap = 'round';
    [['rgba(120,255,190,0.22)', 100, 22], ['rgba(120,220,255,0.18)', 135, 18], ['rgba(190,140,255,0.16)', 165, 14]]
      .forEach(([color, y0, width], k) => {
        ctx.strokeStyle = color; ctx.lineWidth = width;
        ctx.beginPath();
        for (let x = VX0 - 10; x <= VX1 + 10; x += 10) {
          const y = y0 + Math.sin(x * 0.018 + time * 0.5 + k * 1.7) * 16 + Math.sin(x * 0.045 + time * 0.9) * 5;
          if (x === VX0 - 10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    ctx.restore();
  }

  function drawIcebergs(offset) {
    const base = 470;
    repeat(offset, 150, (x, i) => {
      const h = 70 + (hash(i) % 4) * 18;
      poly([[x - 70, base], [x - 30, base - h * 0.6], [x - 8, base - h], [x + 18, base - h * 0.7], [x + 34, base - h * 0.8], [x + 70, base]], '#d6ebf7');
      poly([[x - 8, base - h], [x + 18, base - h * 0.7], [x + 34, base - h * 0.8], [x + 70, base], [x + 10, base]], '#a9cde6');
    });
    ctx.fillStyle = '#c4dff0'; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawSnow() {
    const fall = H - GROUND - VY0;
    for (const f of FLAKES) {
      const y = VY0 + (f.y + time * f.v) % fall;
      tileX(f.x + hillX * 0.6 + Math.sin(time + f.p) * 8, x => blob(x, y, f.r, 'rgba(255,255,255,0.85)'));
    }
  }

  function drawRays() {
    for (let k = Math.floor((VX0 - 130) / 110); k * 110 + 20 < VX1 + 20; k++) {
      const x = 20 + k * 110 + Math.sin(time * 0.4 + k) * 20;
      poly([[x, VY0], [x + 40, VY0], [x + 110, H - GROUND], [x + 30, H - GROUND]], 'rgba(255,255,255,0.07)');
    }
  }

  function drawSeaweed(offset) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 6;
    repeat(offset, 46, (x, i) => {
      const h = 40 + (hash(i) % 4) * 14;
      ctx.strokeStyle = hash(i) % 2 ? '#2e9e6a' : '#3fb57a';
      ctx.beginPath(); ctx.moveTo(x, H - GROUND);
      for (let s = 1; s <= 4; s++) {
        ctx.lineTo(x + Math.sin(time * 1.6 + i + s * 0.9) * 2.5 * s, H - GROUND - (h * s) / 4);
      }
      ctx.stroke();
    });
  }

  function drawBubbles() {
    const span = H - GROUND - VY0;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.2;
    for (const b of BUBBLES) {
      const y = H - GROUND - ((b.y + time * b.v) % span);
      tileX(b.x + hillX * 0.5 + Math.sin(time * 1.5 + b.p) * 5, x => {
        ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.stroke();
      });
    }
  }

  function drawSun(x, y) {
    ctx.strokeStyle = 'rgba(255,226,110,0.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let k = 0; k < 10; k++) {
      const a = k * Math.PI / 5 + time * 0.2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 36, y + Math.sin(a) * 36);
      ctx.lineTo(x + Math.cos(a) * 46, y + Math.sin(a) * 46);
      ctx.stroke();
    }
    blob(x, y, 28, '#fff09a');
  }

  function drawFlowers(offset) {
    const petals = ['#ff8fb1', '#ffffff', '#c08cff', '#ffb347'];
    repeat(offset, 58, (x, i) => {
      const h = hash(i), top = H - GROUND - 34 - (h % 4) * 10, sway = Math.sin(time * 1.2 + i) * 2;
      ctx.strokeStyle = '#3f9a45'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, H - GROUND);
      ctx.quadraticCurveTo(x + 4, (top + H - GROUND) / 2, x + sway, top);
      ctx.stroke();
      oval(x + 6, top + 20, 6, 3, '#4fae57', -0.5);
      for (let k = 0; k < 5; k++) {
        const a = k * Math.PI * 2 / 5;
        blob(x + sway + Math.cos(a) * 7, top + Math.sin(a) * 7, 5.5, petals[h % petals.length]);
      }
      blob(x + sway, top, 4.5, '#ffd23f');
    });
  }

  function seg(x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  function drawMountains(offset, base, color) {
    repeat(offset, 160, (x, i) => {
      const h = 90 + (hash(i) % 4) * 20;
      poly([[x - 100, base], [x, base - h], [x + 100, base]], color);
    });
    ctx.fillStyle = color; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawCastles(offset) {
    const base = 478, wall = '#3d2a5c', lit = '#ffd27a';
    repeat(offset, 240, (x, i) => {
      ctx.fillStyle = wall;
      ctx.fillRect(x - 30, base - 60, 60, 60);
      for (let k = 0; k < 5; k++) ctx.fillRect(x - 30 + k * 13, base - 68, 8, 8);
      for (const tx of [x - 44, x + 44]) {
        ctx.fillStyle = wall; ctx.fillRect(tx - 10, base - 92, 20, 92);
        poly([[tx - 13, base - 92], [tx, base - 118], [tx + 13, base - 92]], wall);
        ctx.strokeStyle = wall; ctx.lineWidth = 2; seg(tx, base - 118, tx, base - 132);
        const f = Math.sin(time * 4 + i + tx * 0.05) * 2;
        poly([[tx, base - 132], [tx + 12, base - 129 + f], [tx, base - 125]], '#e63946');
        ctx.fillStyle = lit; ctx.fillRect(tx - 3, base - 78, 6, 9);
      }
      ctx.fillStyle = lit;
      ctx.fillRect(x - 18, base - 46, 7, 10);
      ctx.fillRect(x + 11, base - 46, 7, 10);
      rr(x - 9, base - 24, 18, 24, [9, 9, 0, 0]);
      ctx.fillStyle = '#24183a'; ctx.fill();
    });
  }

  function drawSkyline(offset, base, colors, windowColor, step, minH, extra) {
    repeat(offset, step, (x, i) => {
      const h = hash(i), bh = minH + (h % 5) * extra, bw = step - 6;
      ctx.fillStyle = colors[h % colors.length]; ctx.fillRect(x, base - bh, bw, bh);
      ctx.fillStyle = windowColor;
      for (let wy = base - bh + 8; wy < base - 10; wy += 14) {
        for (let wx = x + 6; wx < x + bw - 8; wx += 12) ctx.fillRect(wx, wy, 6, 8);
      }
    });
    ctx.fillStyle = colors[0]; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawRoadLines(y) {
    ctx.fillStyle = '#ffd23f';
    spanX(-(travel % 60), 60, 60, x => ctx.fillRect(x, y + 48, 30, 4));
  }

  function drawBats() {
    ctx.fillStyle = '#0b0614';
    for (let k = 0; k < 3; k++) {
      const y = 95 + k * 45 + Math.sin(time * 2 + k) * 12;
      const f = Math.sin(time * 14 + k) * 5;
      spanX(k * 150 - time * (25 + k * 8) - 30, W + 60, 30, x => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 7, y - 6 - f, x - 14, y - f);
        ctx.quadraticCurveTo(x - 8, y - 1, x, y + 3);
        ctx.quadraticCurveTo(x + 8, y - 1, x + 14, y - f);
        ctx.quadraticCurveTo(x + 7, y - 6 - f, x, y);
        ctx.fill();
      });
    }
  }

  function drawDeadTrees(offset) {
    ctx.strokeStyle = '#1c1430'; ctx.lineCap = 'round';
    repeat(offset, 130, (x, i) => {
      const h = 80 + (hash(i) % 3) * 20, base = H - GROUND;
      ctx.lineWidth = 7; seg(x, base, x + 4, base - h);
      ctx.lineWidth = 4;
      seg(x + 3, base - h * 0.6, x - 18, base - h * 0.85);
      seg(x + 4, base - h * 0.75, x + 24, base - h - 6);
      ctx.lineWidth = 2.5;
      seg(x - 12, base - h * 0.78, x - 16, base - h - 4);
      seg(x + 16, base - h * 0.92, x + 30, base - h * 0.85);
    });
  }

  function drawPumpkins(y) {
    const step = 110, off = -(travel % step), first = Math.floor(travel / step);
    for (let k = stepFrom(off, step); off + k * step < VX1 + step; k++) {
      const h = hash(first + k);
      if (h % 3 === 0) continue;
      const cx = off + k * step + (h % 40), cy = y + 46;
      oval(cx - 5, cy, 7, 8, '#e8731c');
      oval(cx + 5, cy, 7, 8, '#e8731c');
      oval(cx, cy, 8, 9, '#ff8c2a');
      ctx.fillStyle = '#3f7a2a'; ctx.fillRect(cx - 1.5, cy - 13, 3, 5);
      poly([[cx - 6, cy - 2], [cx - 3, cy - 6], [cx - 1, cy - 2]], '#ffd23f');
      poly([[cx + 6, cy - 2], [cx + 3, cy - 6], [cx + 1, cy - 2]], '#ffd23f');
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(cx - 4, cy + 3, 8, 2);
    }
  }

  function drawRain() {
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    ctx.beginPath();
    const fall = H - GROUND - VY0;
    for (const d of DROPS) {
      const y = VY0 + (d.y + time * d.v) % fall;
      tileX(d.x - time * d.v * 0.25 + hillX * 0.3, x => { ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 11); });
    }
    ctx.stroke();
  }

  function drawReeds(offset) {
    ctx.strokeStyle = '#4f8f3a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    repeat(offset, 38, (x, i) => {
      const h = hash(i), top = H - GROUND - 40 - (h % 4) * 9, sway = Math.sin(time * 1.4 + i) * 2;
      ctx.beginPath(); ctx.moveTo(x, H - GROUND); ctx.quadraticCurveTo(x + 2, top + 20, x + sway, top); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 2, H - GROUND); ctx.quadraticCurveTo(x + 10, top + 30, x + 14 + sway, top + 16); ctx.stroke();
      if (h % 2) oval(x + sway, top + 6, 3, 8, '#7a4a2a');
    });
  }

  function drawLilies(y) {
    const step = 90, off = -(travel % step), first = Math.floor(travel / step);
    for (let k = stepFrom(off, step); off + k * step < VX1 + step; k++) {
      const h = hash(first + k), cx = off + k * step + (h % 30), cy = y + 34 + (h % 3) * 13;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.ellipse(cx, cy, 13, 5, 0, 0.25, Math.PI * 2 - 0.25); ctx.closePath();
      ctx.fillStyle = '#4fae57'; ctx.fill();
      if (h % 3 === 0) blob(cx + 3, cy - 2, 2.5, '#ff9eb8');
    }
  }

  // Påskris: björkkvistar med färgade fjädrar.
  function drawPaskris(offset) {
    const base = H - GROUND, colors = ['#ff7ab8', '#ffd23f', '#6fdc8c', '#5bc0eb', '#c08cff'];
    repeat(offset, 120, (x, i) => {
      ctx.strokeStyle = '#7a5236'; ctx.lineCap = 'round';
      ctx.lineWidth = 2.5;
      seg(x, base, x - 6, base - 70);
      seg(x - 3, base - 35, x + 16, base - 66);
      seg(x - 5, base - 55, x - 22, base - 80);
      ctx.lineWidth = 1.5;
      seg(x + 8, base - 50, x + 26, base - 58);
      [[x - 6, base - 70], [x + 16, base - 66], [x - 22, base - 80], [x + 26, base - 58], [x - 4, base - 44]]
        .forEach(([fx, fy], k) => oval(fx, fy, 3.5, 7, colors[(hash(i) + k) % colors.length], Math.sin(time * 2 + i + k) * 0.3));
    });
  }

  function drawEggs(y) {
    const step = 70, off = -(travel % step), first = Math.floor(travel / step);
    const colors = ['#8fd3ff', '#ffb347', '#ff8fb1', '#c08cff', '#ffe066'];
    for (let k = stepFrom(off, step); off + k * step < VX1 + step; k++) {
      const h = hash(first + k), cx = off + k * step + (h % 30), cy = y + 34 + (h % 3) * 13;
      oval(cx, cy, 5, 6.5, colors[h % colors.length]);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(cx - 4.5, cy - 1, 9, 2);
    }
  }

  // Falröda hus med snö på taken och julgranar med blinkande ljus.
  function drawVillage(offset) {
    const base = 488;
    repeat(offset, 100, (x, i) => {
      if (hash(i) % 3 === 0) {
        ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x + 25, base - 10, 6, 10);
        poly([[x + 6, base - 10], [x + 28, base - 44], [x + 50, base - 10]], '#1f6b3a');
        poly([[x + 11, base - 28], [x + 28, base - 58], [x + 45, base - 28]], '#1f6b3a');
        blob(x + 28, base - 60, 3, '#ffd23f');
        ['#e63946', '#ffd23f', '#4cc9f0', '#ff8fb1', '#ffd23f'].forEach((c, k) => {
          ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time * 3 + k + i);
          blob(x + 16 + k * 6, base - 16 - (k % 2) * 16, 2, c);
        });
        ctx.globalAlpha = 1;
        return;
      }
      const w = 56, top = base - 38;
      ctx.fillStyle = '#8e2b20'; ctx.fillRect(x, top, w, 38);
      ctx.fillStyle = '#f4efe6';
      ctx.fillRect(x, top, 3, 38);
      ctx.fillRect(x + w - 3, top, 3, 38);
      poly([[x - 6, top], [x + w / 2, top - 24], [x + w + 6, top]], '#3a2b2b');
      poly([[x - 6, top], [x + w / 2, top - 24], [x + w + 6, top], [x + w, top - 3], [x + w / 2, top - 18], [x, top - 3]], '#ffffff');
      ctx.fillStyle = '#ffd27a';
      ctx.fillRect(x + 10, top + 12, 12, 12);
      ctx.fillRect(x + w - 22, top + 12, 12, 12);
      ctx.fillStyle = '#f4efe6';
      ctx.fillRect(x + 15, top + 12, 2, 12);
      ctx.fillRect(x + w - 17, top + 12, 2, 12);
    });
  }

  function drawAutumnTrees(offset) {
    const base = H - GROUND, colors = ['#ff8c1a', '#e63946', '#ffc23d', '#d9650a'];
    repeat(offset, 90, (x, i) => {
      const h = hash(i);
      ctx.fillStyle = '#6b4423'; ctx.fillRect(x - 3, base - 52, 6, 52);
      blob(x - 14, base - 50, 16, colors[(h + 1) % 4]);
      blob(x + 14, base - 50, 16, colors[(h + 2) % 4]);
      blob(x, base - 64, 22, colors[h % 4]);
    });
  }

  function drawLeaves() {
    const fall = H - GROUND - VY0;
    for (const l of LEAVES) {
      const y = VY0 + (l.y + time * l.v) % fall;
      tileX(l.x + hillX * 0.6 + Math.sin(time * 1.5 + l.p) * 14, x => oval(x, y, 3, 5, l.c, time * 2 + l.p));
    }
  }

  function drawPumpkinPatch(y) {
    const step = 80, off = -(travel % step), first = Math.floor(travel / step);
    for (let k = stepFrom(off, step); off + k * step < VX1 + step; k++) {
      const h = hash(first + k);
      if (h % 4 === 0) continue;
      const cx = off + k * step + (h % 30), cy = y + 44 + (h % 2) * 10;
      oval(cx - 4, cy, 6, 6.5, '#e0700a');
      oval(cx + 4, cy, 6, 6.5, '#e0700a');
      oval(cx, cy, 6.5, 7, '#ff8c1a');
      ctx.fillStyle = '#5a7a2a'; ctx.fillRect(cx - 1, cy - 10, 2.5, 4);
      oval(cx + 5, cy - 8, 4, 2, '#6cbf3a', -0.4);
    }
  }

  function drawSea(offset) {
    const horizon = 420, shore = H - GROUND;
    ctx.fillStyle = '#1e88c9'; ctx.fillRect(VX0, horizon, VW, H - horizon);
    ctx.fillStyle = '#3fb0e0'; ctx.fillRect(VX0, 466, VW, H - 466);

    // en segelbåt långt ute
    spanX(320 - time * 8 - 40, W + 80, 40, bx => {
      poly([[bx - 12, horizon - 2], [bx + 12, horizon - 2], [bx + 8, horizon + 4], [bx - 8, horizon + 4]], '#8a5a2b');
      poly([[bx, horizon - 26], [bx, horizon - 4], [bx + 13, horizon - 4]], '#ffffff');
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const [y, step, f] of [[438, 70, 0.6], [456, 60, 0.8], [482, 54, 1]]) {
      repeat(offset * f, step, x => {
        ctx.beginPath(); ctx.arc(x, y + 6, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      });
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = VX0; x <= VX1 + 10; x += 10) {
      const y = shore - 6 + Math.sin(x * 0.08 + time * 2) * 2;
      if (x === VX0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawBeach(offset) {
    const base = H - GROUND;
    repeat(offset, 150, (x, i) => {
      if (hash(i) % 2) {
        // palm
        ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 4, base - 50, x + 18, base - 90); ctx.stroke();
        const tx = x + 18, ty = base - 90;
        ctx.strokeStyle = '#2e9e4a'; ctx.lineWidth = 6;
        for (const a of [-2.7, -2.1, -1.3, -0.6, 0.1]) {
          const sway = Math.sin(time * 1.5 + i + a) * 2;
          ctx.beginPath(); ctx.moveTo(tx, ty);
          ctx.quadraticCurveTo(tx + Math.cos(a) * 20, ty + Math.sin(a) * 20 - 6, tx + Math.cos(a) * 34 + sway, ty + Math.sin(a) * 34 + 12);
          ctx.stroke();
        }
        blob(tx - 3, ty + 4, 3.5, '#6b4423');
        blob(tx + 4, ty + 5, 3.5, '#6b4423');
      } else {
        // parasoll
        ctx.strokeStyle = '#e6e6e6'; ctx.lineWidth = 3; seg(x, base, x + 4, base - 58);
        const cx = x + 4, cy = base - 58, R = 26;
        for (let k = 0; k < 6; k++) {
          const a0 = Math.PI + k * Math.PI / 6;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + Math.PI / 6); ctx.closePath();
          ctx.fillStyle = k % 2 ? '#ffffff' : '#ff5e7a'; ctx.fill();
        }
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 0); ctx.closePath(); ctx.stroke();
      }
    });
  }

  function drawSearchlights() {
    for (let k = Math.floor((VX0 - 90) / 230) - 1; 90 + k * 230 < VX1 + 230; k++) {
      const bx = 90 + k * 230, by = H - GROUND, a = -Math.PI / 2 + Math.sin(time * 0.5 + k * 2) * 0.5, len = 520 - VY0;
      poly([
        [bx, by],
        [bx + Math.cos(a - 0.09) * len, by + Math.sin(a - 0.09) * len],
        [bx + Math.cos(a + 0.09) * len, by + Math.sin(a + 0.09) * len],
      ], 'rgba(255,250,200,0.10)');
    }
  }

  // Skyskrapor där bara vissa fönster lyser; de närmaste har blinkande antenner.
  function drawNightCity(offset, base, color, step, minH, extra, beacons) {
    repeat(offset, step, (x, i) => {
      const h = hash(i), bh = minH + (h % 5) * extra, bw = step - 8;
      ctx.fillStyle = color; ctx.fillRect(x, base - bh, bw, bh);
      ctx.fillStyle = '#ffd27a';
      for (let wy = base - bh + 8, r = 0; wy < base - 10; wy += 13, r++) {
        for (let wx = x + 5, c = 0; wx < x + bw - 7; wx += 11, c++) {
          if (hash(i * 97 + r * 13 + c) % 3 === 0) ctx.fillRect(wx, wy, 5, 7);
        }
      }
      if (beacons && h % 2) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        seg(x + bw / 2, base - bh, x + bw / 2, base - bh - 14);
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 4 + i);
        blob(x + bw / 2, base - bh - 15, 2.2, '#ff3b3b');
        ctx.globalAlpha = 1;
      }
    });
    ctx.fillStyle = color; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawBambooGrove(offset) {
    const base = H - GROUND;
    repeat(offset, 34, (x, i) => {
      const h = hash(i), top = 220 + (h % 6) * 30, w = 7 + (h % 3);
      ctx.fillStyle = h % 2 ? '#7cc45a' : '#6ab04c'; ctx.fillRect(x, top, w, base - top);
      ctx.fillStyle = '#4f8f3a';
      for (let y = base - 30; y > top; y -= 34) ctx.fillRect(x - 1, y, w + 2, 2.5);
      for (const [dx, dy, a] of [[-6, 4, -0.9], [w + 6, 8, 0.9], [-4, 18, -0.6]]) {
        oval(x + dx, top + dy, 3, 9, '#5aa848', a + Math.sin(time * 1.5 + i) * 0.1);
      }
    });
  }

  function drawLanterns(offset) {
    repeat(offset, 150, (x, i) => {
      const len = 60 + (hash(i) % 3) * 20, lx = x + Math.sin(time * 1.5 + i) * 3;
      ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 1; seg(x, VY0, lx, len);
      ctx.globalAlpha = 0.35; blob(lx, len + 12, 18, '#ffd27a'); ctx.globalAlpha = 1;
      oval(lx, len + 12, 10, 12, '#e63946');
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(lx - 5, len, 10, 3);
      ctx.fillRect(lx - 5, len + 22, 10, 3);
      ctx.strokeStyle = '#b5212e'; seg(lx, len + 1, lx, len + 23);
    });
  }

  function drawPetals() {
    const fall = H - GROUND - VY0;
    for (const l of PETALS) {
      const y = VY0 + (l.y + time * l.v) % fall;
      tileX(l.x + hillX * 0.6 + Math.sin(time * 1.2 + l.p) * 16, x => oval(x, y, 2.6, 3.8, '#ffb7d0', time * 1.5 + l.p));
    }
  }

  function drawPines(offset, base, color, step, height) {
    repeat(offset, step, (x, i) => {
      const h = height * (0.8 + (hash(i) % 4) * 0.12);
      ctx.fillStyle = color; ctx.fillRect(x - 3, base - 12, 6, 14);
      for (let k = 0; k < 3; k++) {
        const w = 24 - k * 6, y = base - 10 - k * h * 0.26;
        poly([[x - w, y], [x, y - h * 0.5], [x + w, y]], color);
      }
    });
    ctx.fillStyle = color; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawFireflies() {
    for (const f of FIREFLIES) {
      const y = f.y + Math.cos(time * 0.9 + f.p) * 12;
      const glow = (Math.sin(time * 3 + f.p) + 1) / 2;
      tileX(f.x + Math.sin(time * 0.7 + f.p) * 20 + hillX * 0.3, x => {
        ctx.globalAlpha = glow * 0.3; blob(x, y, 6, '#d4ff6a');
        ctx.globalAlpha = 0.3 + glow * 0.7; blob(x, y, 1.8, '#f4ffb0');
      });
    }
    ctx.globalAlpha = 1;
  }

  function gear(cx, cy, r, angle, color, edge) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.fillStyle = color;
    for (let k = 0; k < 10; k++) { ctx.rotate(Math.PI / 5); ctx.fillRect(-4, -r - 6, 8, 10); }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
    blob(0, 0, r * 0.35, edge);
    ctx.restore();
  }

  function drawFactory(offset) {
    const base = 470;
    repeat(offset, 160, (x, i) => {
      ctx.fillStyle = '#6f7b87'; ctx.fillRect(x, base - 70, 110, 70);
      for (let k = 0; k < 4; k++) poly([[x + k * 27.5, base - 70], [x + k * 27.5, base - 86], [x + (k + 1) * 27.5, base - 70]], '#6f7b87');
      ctx.fillStyle = '#9fb3c4';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + 10 + k * 25, base - 50, 14, 10);
      ctx.fillStyle = '#5d6872'; ctx.fillRect(x + 82, base - 140, 16, 70);
      ctx.fillStyle = '#e63946'; ctx.fillRect(x + 82, base - 132, 16, 5); ctx.fillRect(x + 82, base - 118, 16, 5);
      for (let j = 0; j < 3; j++) {
        const t = (time * 0.3 + j / 3 + (hash(i) % 10) / 10) % 1;
        blob(x + 90 + Math.sin(t * 4 + i) * 6, base - 146 - t * 70, 7 + t * 14, `rgba(120,128,138,${0.45 * (1 - t)})`);
      }
    });
    ctx.fillStyle = '#6f7b87'; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawGears(offset) {
    repeat(offset, 130, (x, i) => {
      const r = 26 + (hash(i) % 3) * 6, dir = i % 2 ? 1 : -1;
      gear(x, 486 - (hash(i) % 2) * 26, r, time * 0.8 * dir, '#8794a1', '#56616d');
    });
  }

  function drawHazard(y) {
    ctx.save();
    ctx.beginPath(); ctx.rect(VX0, y + 40, VW, 10); ctx.clip();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(VX0, y + 40, VW, 10);
    ctx.fillStyle = '#1d2b1f';
    spanX(-(travel % 24), 24, 24, x => {
      ctx.beginPath(); ctx.moveTo(x, y + 50); ctx.lineTo(x + 10, y + 40); ctx.lineTo(x + 20, y + 40); ctx.lineTo(x + 10, y + 50); ctx.fill();
    });
    ctx.restore();
  }

  function drawAcacias(offset) {
    const base = H - GROUND;
    repeat(offset, 170, (x, i) => {
      if (hash(i) % 3 === 0) return;
      ctx.strokeStyle = '#4a3020'; ctx.lineCap = 'round';
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 4, base - 40, x + 10, base - 72); ctx.stroke();
      ctx.lineWidth = 3; seg(x + 6, base - 50, x - 10, base - 78); seg(x + 9, base - 62, x + 30, base - 78);
      oval(x + 10, base - 80, 42, 9, '#3f5a2a');
      oval(x - 8, base - 86, 26, 7, '#4a6a32');
      oval(x + 28, base - 84, 22, 6, '#4a6a32');
    });
  }

  function drawGiraffes(offset) {
    const base = 470, col = 'rgba(140,80,40,0.75)';
    repeat(offset, 260, (x, i) => {
      if (hash(i) % 2) return;
      ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 3;
      for (const lx of [-10, -5, 6, 11]) seg(x + lx, base, x + lx * 0.8, base - 30);
      oval(x, base - 34, 16, 7, col);
      ctx.lineWidth = 5; seg(x + 12, base - 38, x + 22, base - 76);
      oval(x + 26, base - 78, 6, 3.5, col, 0.2);
      ctx.lineWidth = 1.5; seg(x + 22, base - 80, x + 21, base - 86); seg(x + 25, base - 81, x + 25, base - 87);
    });
  }

  function drawFarm(offset) {
    const base = 478;
    repeat(offset, 220, (x, i) => {
      if (hash(i) % 2) {
        ctx.fillStyle = '#c0392b'; ctx.fillRect(x, base - 50, 60, 50);
        poly([[x - 4, base - 50], [x + 8, base - 70], [x + 30, base - 82], [x + 52, base - 70], [x + 64, base - 50]], '#7a2a20');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 20, base - 30, 20, 30);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 22, base - 28, 16, 28);
        seg(x + 22, base - 28, x + 38, base); seg(x + 38, base - 28, x + 22, base);
      } else {
        poly([[x + 14, base], [x + 20, base - 80], [x + 32, base - 80], [x + 38, base]], '#e8dcc8', '#b9a98a');
        ctx.save();
        ctx.translate(x + 26, base - 80); ctx.rotate(time * 1.2);
        ctx.fillStyle = '#8a6a4a';
        for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-3, -40, 6, 38); ctx.fillStyle = '#f4efe6'; ctx.fillRect(-7, -40, 4, 30); ctx.fillStyle = '#8a6a4a'; }
        ctx.restore();
        blob(x + 26, base - 80, 4, '#5a3a2a');
      }
    });
    ctx.fillStyle = '#9ccf6a'; ctx.fillRect(VX0, base, VW, H - base);
  }

  function drawWoodFence(offset) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(VX0, 486, VW, 5);
    ctx.fillRect(VX0, 500, VW, 5);
    repeat(offset, 40, x => { ctx.fillStyle = '#7a4a24'; ctx.fillRect(x, 476, 6, 40); });
  }

  function drawPyramids(offset) {
    const base = 462;
    repeat(offset, 260, (x, i) => {
      for (const [dx, s] of [[0, 1], [84, 0.6]]) {
        const px = x + dx, h = 90 * s, w = 70 * s;
        poly([[px - w, base], [px, base - h], [px + w, base]], '#d9a45a');
        poly([[px, base - h], [px + w, base], [px + w * 0.15, base]], '#c08a44');
      }
    });
  }

  function drawDunes(offset, base, color, step) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(VX0, H);
    for (let x = VX0; x <= VX1 + 8; x += 8) ctx.lineTo(x, base - 14 + Math.sin(((x - offset) / step) * Math.PI * 2) * 12);
    ctx.lineTo(VX1 + 8, H); ctx.closePath(); ctx.fill();
  }

  function drawAlienPlants(offset) {
    const base = H - GROUND, bulbs = ['#ff7ab8', '#ffe066', '#9ff5d6'];
    repeat(offset, 64, (x, i) => {
      const h = 40 + (hash(i) % 4) * 14, sway = Math.sin(time * 1.3 + i) * 4;
      ctx.strokeStyle = '#3fd3a0'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x - 10, base - h / 2, x + sway, base - h); ctx.stroke();
      const col = bulbs[hash(i) % bulbs.length];
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 2 + i); blob(x + sway, base - h, 12, col);
      ctx.globalAlpha = 1; blob(x + sway, base - h, 6, col);
    });
  }

  function drawCraters(y) {
    const step = 80, off = -(travel % step), first = Math.floor(travel / step);
    for (let k = stepFrom(off, step); off + k * step < VX1 + step; k++) {
      const h = hash(first + k);
      const cx = off + k * step + (h % 30), cy = y + 36 + (h % 3) * 12, rx = 8 + (h % 4) * 3;
      oval(cx, cy, rx, rx * 0.4, '#74768c');
      oval(cx, cy - 1, rx * 0.8, rx * 0.28, '#5f6177');
    }
  }

  function dots(colors) {
    return y => {
      const step = 34, off = -(travel % step), first = Math.floor(travel / step);
      for (let k = stepFrom(off, step); off + k * step < VX1 + step; k++) {
        const h = hash(first + k);
        blob(off + k * step + (h % 20), y + 30 + (h % 4) * 11, 2.2, colors[h % colors.length]);
      }
    };
  }

  function drawGround(g) {
    const y = H - GROUND;
    ctx.fillStyle = g.base; ctx.fillRect(VX0, y, VW, GROUND);
    ctx.fillStyle = g.band; ctx.fillRect(VX0, y + 16, VW, 6);
    ctx.fillStyle = g.top; ctx.fillRect(VX0, y, VW, 16);
    ctx.fillStyle = g.stripe;
    spanX(groundX, 24, 24, x => {
      ctx.beginPath();
      ctx.moveTo(x, y + 16); ctx.lineTo(x + 10, y); ctx.lineTo(x + 20, y); ctx.lineTo(x + 10, y + 16);
      ctx.fill();
    });
    g.decor?.(y);
    ctx.fillStyle = C.ink; ctx.fillRect(VX0, y - 1, VW, 3);
  }

  // ---------- Sugrören ----------

  // Rundning: mörkt i kanterna, en glansig strimma till vänster.
  function shadeTube(x, y, w, h) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.18)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.45)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }

  function drawTube(x, y0, y1, tint) {
    if (y1 <= y0) return;
    const h = y1 - y0;
    ctx.fillStyle = C.strawWhite; ctx.fillRect(x, y0, PIPE_W, h);

    // Snedränderna ligger fast i världen, så de rör sig med sugröret.
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y0, PIPE_W, h); ctx.clip();
    ctx.fillStyle = tint.main;
    const slope = PIPE_W * 0.5, period = 26, band = 11;
    for (let s = Math.floor((y0 - slope) / period) * period; s < y1; s += period) {
      ctx.beginPath();
      ctx.moveTo(x, s); ctx.lineTo(x + PIPE_W, s + slope);
      ctx.lineTo(x + PIPE_W, s + slope + band); ctx.lineTo(x, s + band);
      ctx.fill();
    }
    ctx.restore();

    shadeTube(x, y0, PIPE_W, h);
    ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 2;
    ctx.strokeRect(x, y0, PIPE_W, h);
  }

  // Dragspelsdelen där ett böjbart sugrör kan vikas.
  function drawBend(x, yA, yB, tint) {
    let i = 0;
    for (let y = yA; y < yB; y += 6, i++) {
      rr(x - 3, y, PIPE_W + 6, 5, 2.5);
      ctx.fillStyle = i % 2 ? tint.main : C.strawWhite; ctx.fill();
      ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 1.5; ctx.stroke();
    }
    shadeTube(x - 3, yA, PIPE_W + 6, yB - yA);
  }

  function drawOpening(x, y, tint) {
    const cx = x + PIPE_W / 2;
    ctx.beginPath(); ctx.ellipse(cx, y, PIPE_W / 2, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = C.strawWhite; ctx.fill();
    ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 2; ctx.stroke();
    oval(cx, y, PIPE_W / 2 - 5, 3.5, tint.dark);
  }

  function drawStraws(p) {
    const [topEnd, botStart] = gapEnds(p);
    drawTube(p.x, VY0 - 2, topEnd, p.tint);
    drawBend(p.x, topEnd - 40, topEnd - 10, p.tint);
    drawOpening(p.x, topEnd, p.tint);
    drawTube(p.x, botStart, H - GROUND, p.tint);
    drawBend(p.x, botStart + 10, botStart + 40, p.tint);
    drawOpening(p.x, botStart, p.tint);
  }

  // ---------- De andra hindren ----------
  // Varje hinder ritar ett par: ett uppifrån ner till öppningen, ett från
  // öppningen ner till marken. Den del som vetter mot öppningen är detaljerad.

  function pipeSection(x, y0, y1, w) {
    if (y1 <= y0) return;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#5aa02c'); g.addColorStop(0.3, '#b6e36a');
    g.addColorStop(0.55, '#7cc83f'); g.addColorStop(1, '#3f7a1f');
    ctx.fillStyle = g; ctx.fillRect(x, y0, w, y1 - y0);
    ctx.strokeStyle = '#2b4f14'; ctx.lineWidth = 2; ctx.strokeRect(x, y0, w, y1 - y0);
  }

  function drawPipes(p) {
    const [topEnd, botStart] = gapEnds(p);
    pipeSection(p.x + 4, VY0 - 2, topEnd - 24, PIPE_W - 8);
    pipeSection(p.x, topEnd - 24, topEnd, PIPE_W);
    pipeSection(p.x, botStart, botStart + 24, PIPE_W);
    pipeSection(p.x + 4, botStart + 24, H - GROUND, PIPE_W - 8);
  }

  // En färgpenna från `root` till spetsen vid `tip`; dir är 1 när spetsen pekar nedåt.
  function pencil(x, root, tip, dir, tint) {
    const cone = 34, woodEnd = tip - dir * cone, cx = x + PIPE_W / 2;
    const y0 = Math.min(root, woodEnd), y1 = Math.max(root, woodEnd);
    if (y1 > y0) {
      const third = PIPE_W / 3;
      ctx.fillStyle = tint.main; ctx.fillRect(x, y0, PIPE_W, y1 - y0);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + third, y0, third, y1 - y0);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + 2 * third, y0, third, y1 - y0);
      ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 2; ctx.strokeRect(x, y0, PIPE_W, y1 - y0);
    }
    poly([[x, woodEnd], [x + PIPE_W, woodEnd], [cx, tip]], '#f1c98f', C.strawEdge, 2);
    const lead = 12, half = (PIPE_W / 2) * (lead / cone);
    poly([[cx - half, tip - dir * lead], [cx + half, tip - dir * lead], [cx, tip]], tint.dark);
    // lacken slutar i bågar där träet tar vid
    ctx.fillStyle = tint.main;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.arc(x + PIPE_W / 6 + k * PIPE_W / 3, woodEnd, PIPE_W / 6, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPencils(p) {
    const [topEnd, botStart] = gapEnds(p);
    pencil(p.x, VY0 - 2, topEnd, 1, p.tint);
    pencil(p.x, H - GROUND, botStart, -1, p.tint);
  }

  // Klossar staplas från öppningen och utåt, så att de möter öppningen jämnt.
  function brickStack(x, start, dir, limit, p) {
    const bh = 26, colors = [p.tint.main, '#ffd23f', '#2f80ed', '#2bb673', '#ff9f1c', '#e63946'];
    for (let k = 0; ; k++) {
      const yA = start + dir * k * bh, y0 = Math.min(yA, yA + dir * bh);
      if (dir < 0 ? yA < limit : yA > limit) break;
      const col = colors[(k + p.seed) % colors.length];
      if (dir > 0 && k === 0) {
        for (let j = 0; j < 3; j++) {
          rr(x + 7 + j * 19, y0 - 5, 12, 7, 2);
          ctx.fillStyle = col; ctx.fill();
          ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
      rr(x, y0, PIPE_W, bh, 3);
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + 3, y0 + 3, PIPE_W - 6, 4);
    }
  }

  function drawBricks(p) {
    const [topEnd, botStart] = gapEnds(p);
    brickStack(p.x, topEnd, -1, VY0 - 2, p);
    brickStack(p.x, botStart, 1, H - GROUND, p);
  }

  // En kaktus med rundad topp vid `end`, rot vid `root` och en arm som pekar mot öppningen.
  function cactus(x, end, root, dir, p) {
    const cx = x + PIPE_W / 2, r = 20, green = '#4caf50', dark = '#2e7d32';
    const y0 = Math.min(end, root), y1 = Math.max(end, root);

    const side = p.seed % 2 ? 1 : -1, ay = end + dir * (36 + (p.seed % 3) * 16);
    if (ay > y0 && ay < y1) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const arm = () => {
        ctx.beginPath();
        ctx.moveTo(cx + side * r, ay); ctx.lineTo(cx + side * (r + 7), ay); ctx.lineTo(cx + side * (r + 7), ay - dir * 22);
        ctx.stroke();
      };
      ctx.strokeStyle = dark; ctx.lineWidth = 15; arm();
      ctx.strokeStyle = green; ctx.lineWidth = 11; arm();
    }

    ctx.beginPath();
    if (dir > 0) {
      ctx.moveTo(cx - r, y1); ctx.lineTo(cx - r, end + r);
      ctx.arc(cx, end + r, r, Math.PI, 0);
      ctx.lineTo(cx + r, y1);
    } else {
      ctx.moveTo(cx - r, y0); ctx.lineTo(cx - r, end - r);
      ctx.arc(cx, end - r, r, Math.PI, 0, true);
      ctx.lineTo(cx + r, y0);
    }
    ctx.closePath();
    ctx.fillStyle = green; ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();

    const ribFrom = dir > 0 ? end + r : y0, ribTo = dir > 0 ? y1 : end - r;
    ctx.lineWidth = 1.5;
    seg(cx - 8, ribFrom, cx - 8, ribTo);
    seg(cx + 8, ribFrom, cx + 8, ribTo);
    for (let y = end + dir * 10; dir > 0 ? y < y1 : y > y0; y += dir * 18) {
      blob(cx - 13, y, 1.3, '#f1f8e9');
      blob(cx + 3, y + dir * 9, 1.3, '#f1f8e9');
    }
    if (dir > 0) {
      for (let k = 0; k < 5; k++) blob(cx + Math.cos(k * 1.26) * 4, end + 2 + Math.sin(k * 1.26) * 4, 3, '#ff7ab8');
      blob(cx, end + 2, 2.2, '#ffd23f');
    }
  }

  function drawCacti(p) {
    const [topEnd, botStart] = gapEnds(p);
    cactus(p.x, topEnd, VY0 - 2, -1, p);
    cactus(p.x, botStart, H - GROUND, 1, p);
  }

  // En räfflad marmorpelare med kapitäl vid `end`; dir är 1 när den står på marken.
  function column(x, root, end, dir) {
    const capH = 16, capY = dir > 0 ? end : end - capH;
    const s0 = dir > 0 ? end + capH : Math.min(root, end - capH), s1 = dir > 0 ? root : end - capH;
    const sx = x + 6, sw = PIPE_W - 12;
    if (s1 > s0) {
      const g = ctx.createLinearGradient(sx, 0, sx + sw, 0);
      g.addColorStop(0, '#d9d4ca'); g.addColorStop(0.35, '#ffffff'); g.addColorStop(1, '#c4bcae');
      ctx.fillStyle = g; ctx.fillRect(sx, s0, sw, s1 - s0);
      ctx.strokeStyle = '#bdb5a6'; ctx.lineWidth = 1.5;
      for (let k = 1; k < 6; k++) seg(sx + k * sw / 6, s0, sx + k * sw / 6, s1);
      ctx.strokeStyle = '#8c8475'; ctx.lineWidth = 2; ctx.strokeRect(sx, s0, sw, s1 - s0);
    }
    ctx.fillStyle = '#d9d4ca'; ctx.fillRect(x + 3, dir > 0 ? capY + capH - 2 : capY - 2, PIPE_W - 6, 4);
    rr(x, capY, PIPE_W, capH, 3);
    ctx.fillStyle = '#efeae0'; ctx.fill();
    ctx.strokeStyle = '#8c8475'; ctx.lineWidth = 2; ctx.stroke();
    for (const vx of [x + 7, x + PIPE_W - 7]) {
      ovalEdge(vx, capY + capH / 2, 5.5, 5.5, '#f6f2ea', '#8c8475');
      ctx.beginPath(); ctx.arc(vx, capY + capH / 2, 2.2, 0, Math.PI * 1.5); ctx.stroke();
    }
  }

  function drawColumns(p) {
    const [topEnd, botStart] = gapEnds(p);
    column(p.x, VY0 - 2, topEnd, -1);
    column(p.x, H - GROUND, botStart, 1);
  }

  // I de här hindren är dir 1 när änden mot öppningen ligger ovanför roten
  // (det nedre hindret) och -1 när den ligger under (det övre).

  function log(x, root, end, dir) {
    const lx = x + 6, lw = PIPE_W - 12, cx = x + PIPE_W / 2;
    const y0 = Math.min(root, end), y1 = Math.max(root, end);
    ctx.fillStyle = '#7a4f2a'; ctx.fillRect(lx, y0, lw, y1 - y0);
    ctx.strokeStyle = '#5a381c'; ctx.lineWidth = 2;
    for (const bx of [lx + 9, lx + 21, lx + 33, lx + 44]) seg(bx, y0, bx + (bx % 3) - 1, y1);
    ctx.strokeStyle = '#3e2612'; ctx.strokeRect(lx, y0, lw, y1 - y0);
    oval(lx + 14, end + dir * 70, 4, 6, '#5a381c');

    // en kvist med blad
    const sy = end + dir * 34;
    rr(lx + lw - 2, sy - 3, 11, 6, 3); ctx.fillStyle = '#7a4f2a'; ctx.fill();
    oval(lx + lw + 10, sy - 4, 5, 3, '#5aa848', -0.5);

    // snittytan med årsringar
    ovalEdge(cx, end, lw / 2, 7, '#e3b878', '#3e2612');
    ctx.strokeStyle = '#c99a5a'; ctx.lineWidth = 1.2;
    for (const k of [0.75, 0.5, 0.25]) {
      ctx.beginPath(); ctx.ellipse(cx, end, (lw / 2) * k, 7 * k, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawLogs(p) {
    const [topEnd, botStart] = gapEnds(p);
    log(p.x, VY0 - 2, topEnd, -1);
    log(p.x, H - GROUND, botStart, 1);
  }

  // dir är 1 när spetsen pekar nedåt.
  function icicle(x, root, tip, dir) {
    const cx = x + PIPE_W / 2, cone = 60, base = tip - dir * cone;
    const g = ctx.createLinearGradient(x, 0, x + PIPE_W, 0);
    g.addColorStop(0, '#bfe6f7'); g.addColorStop(0.35, '#ffffff'); g.addColorStop(1, '#8fcde8');
    const y0 = Math.min(root, base), y1 = Math.max(root, base);
    ctx.fillStyle = g; ctx.fillRect(x + 4, y0, PIPE_W - 8, y1 - y0);
    ctx.strokeStyle = '#6fb8d6'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y0, PIPE_W - 8, y1 - y0);
    poly([
      [x + 4, base], [x + 12, base + dir * 22], [x + 20, base + dir * 8], [cx, tip],
      [x + 44, base + dir * 16], [x + 52, base + dir * 6], [x + PIPE_W - 4, base],
    ], g, '#6fb8d6', 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
    seg(x + 14, y0 + 6, x + 14, y1 - 6);
    blob(cx - 6, base + dir * 18, 1.6, '#ffffff');
  }

  function drawIcicles(p) {
    const [topEnd, botStart] = gapEnds(p);
    icicle(p.x, VY0 - 2, topEnd, 1);
    icicle(p.x, H - GROUND, botStart, -1);
  }

  function popsicle(x, root, end, dir, tint) {
    const len = 110, bx = x + 6, bw = PIPE_W - 12, cx = x + PIPE_W / 2, bodyEnd = end + dir * len;
    const s0 = Math.min(bodyEnd, root), s1 = Math.max(bodyEnd, root);
    if (s1 > s0) {
      rr(cx - 7, s0 - 4, 14, s1 - s0 + 8, 5);
      ctx.fillStyle = '#e8c690'; ctx.fill();
      ctx.strokeStyle = '#b58e55'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    const y0 = Math.min(end, bodyEnd);
    // gräddigt nederst, fruktglass mot öppningen
    rr(bx, y0, bw, len, dir > 0 ? [22, 22, 8, 8] : [8, 8, 22, 22]);
    ctx.fillStyle = '#fff1c9'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = tint.main;
    const split = end + dir * len * 0.58;
    ctx.fillRect(bx, Math.min(end, split) - 1, bw, len * 0.58 + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(bx + 7, y0, 6, len);
    for (const [dx, f] of [[12, 0.2], [30, 0.32], [20, 0.45], [38, 0.14]]) blob(bx + dx, end + dir * len * f, 1.8, '#ffffff');
    ctx.restore();
    rr(bx, y0, bw, len, dir > 0 ? [22, 22, 8, 8] : [8, 8, 22, 22]);
    ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 2; ctx.stroke();
  }

  function drawPopsicles(p) {
    const [topEnd, botStart] = gapEnds(p);
    popsicle(p.x, VY0 - 2, topEnd, -1, p.tint);
    popsicle(p.x, H - GROUND, botStart, 1, p.tint);
  }

  function mushroom(x, root, end, dir) {
    const cx = x + PIPE_W / 2, capH = 30, stemW = 26, capBase = end + dir * capH;
    const y0 = Math.min(root, capBase), y1 = Math.max(root, capBase);
    ctx.fillStyle = '#f6efe0'; ctx.fillRect(cx - stemW / 2, y0, stemW, y1 - y0);
    ctx.strokeStyle = '#b9a98a'; ctx.lineWidth = 2; ctx.strokeRect(cx - stemW / 2, y0, stemW, y1 - y0);
    ovalEdge(cx, capBase + dir * 14, stemW / 2 + 5, 4, '#ffffff', '#b9a98a');

    ctx.beginPath();
    ctx.ellipse(cx, capBase, PIPE_W / 2, capH, 0, dir > 0 ? Math.PI : 0, dir > 0 ? Math.PI * 2 : Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#e63946'; ctx.fill();
    ctx.strokeStyle = '#9e1b25'; ctx.lineWidth = 2; ctx.stroke();
    for (const [dx, f, r] of [[-17, 0.35, 4], [0, 0.7, 4.5], [16, 0.4, 3.5], [-6, 0.25, 2.5], [9, 0.18, 2.5]]) {
      blob(cx + dx, capBase - dir * capH * f, r, '#ffffff');
    }
    ctx.fillStyle = '#f1d9c0'; ctx.fillRect(x + 6, capBase - (dir > 0 ? 0 : 3), PIPE_W - 12, 3);
  }

  function drawMushrooms(p) {
    const [topEnd, botStart] = gapEnds(p);
    mushroom(p.x, VY0 - 2, topEnd, -1);
    mushroom(p.x, H - GROUND, botStart, 1);
  }

  // En lyktstolpe på marken, eller en lykta som hänger från toppen.
  function lampPost(x, root, end, dir) {
    const cx = x + PIPE_W / 2, headLen = 40, headBase = end + dir * headLen, pole = '#2f4a4a';
    const y0 = Math.min(root, headBase), y1 = Math.max(root, headBase);
    ctx.fillStyle = pole; ctx.fillRect(cx - 8, y0, 16, y1 - y0);
    ctx.fillStyle = '#466a6a'; ctx.fillRect(cx - 4, y0, 3, y1 - y0);
    rr(cx - 11, headBase + (dir > 0 ? 0 : -6), 22, 6, 2); ctx.fillStyle = pole; ctx.fill();

    // glaset lyser, taket sitter upptill
    const top = Math.min(end, headBase), glassTop = top + (dir > 0 ? 10 : 6), glassH = headLen - 16;
    ctx.globalAlpha = 0.25 + 0.05 * Math.sin(time * 3 + x);
    blob(cx, glassTop + glassH / 2, 30, '#ffe08a');
    ctx.globalAlpha = 1;
    rr(cx - 15, glassTop, 30, glassH, 3); ctx.fillStyle = '#ffe9a0'; ctx.fill();
    ctx.strokeStyle = pole; ctx.lineWidth = 2.5; ctx.stroke();
    seg(cx, glassTop, cx, glassTop + glassH);
    if (dir > 0) {
      poly([[cx - 20, glassTop], [cx, end], [cx + 20, glassTop]], pole);
    } else {
      poly([[cx - 20, glassTop], [cx, top], [cx + 20, glassTop]], pole);
      blob(cx, end - 3, 3.5, pole);
    }
  }

  function drawLampPosts(p) {
    const [topEnd, botStart] = gapEnds(p);
    lampPost(p.x, VY0 - 2, topEnd, -1);
    lampPost(p.x, H - GROUND, botStart, 1);
  }

  function cake(x, root, end, dir, seed) {
    const layerH = 28, sponges = ['#f7c6d9', '#fff1c9', '#c98b5a'];
    for (let k = 0; ; k++) {
      const yA = end + dir * k * layerH, y0 = dir > 0 ? yA : yA - layerH;
      if (dir > 0 ? y0 > root : yA < root) break;
      rr(x, y0, PIPE_W, layerH, 3);
      ctx.fillStyle = sponges[(k + seed) % sponges.length]; ctx.fill();
      ctx.strokeStyle = C.strawEdge; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 2, dir > 0 ? y0 + layerH - 6 : y0 + 2, PIPE_W - 4, 4);
    }

    // glasyr med droppar som rinner nedåt
    const bandTop = dir > 0 ? end - 2 : end - 10, frost = '#ff8fb8';
    rr(x - 2, bandTop, PIPE_W + 4, 10, 4); ctx.fillStyle = frost; ctx.fill();
    for (const [dx, len] of [[8, 9], [22, 5], [35, 11], [50, 6]]) {
      rr(x + dx - 3, bandTop + 6, 6, len, 3); ctx.fillStyle = frost; ctx.fill();
    }
    if (dir > 0) {
      for (const dx of [16, 32, 48]) {
        ctx.fillStyle = '#8fd3ff'; ctx.fillRect(x + dx - 2, end - 12, 4, 10);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x + dx - 2, end - 9, 4, 2);
        oval(x + dx, end - 16 + Math.sin(time * 9 + dx) * 0.6, 2.5, 4, '#ffb347');
        oval(x + dx, end - 15, 1.2, 2, '#fff3b0');
      }
    } else {
      blob(x + PIPE_W / 2, end + 9, 4.5, '#e63946');
      blob(x + PIPE_W / 2 - 1.5, end + 7.5, 1.2, '#ffffff');
    }
  }

  function drawCakes(p) {
    const [topEnd, botStart] = gapEnds(p);
    cake(p.x, VY0 - 2, topEnd, -1, p.seed);
    cake(p.x, H - GROUND, botStart, 1, p.seed + 1);
  }

  // ---------- Figurerna ----------
  // Alla ritas kring (0, 0), vända åt höger, ungefär lika stora som träffytan.

  function xEye(x, y, r = 2.5, color = C.ink) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
    ctx.stroke();
  }

  function frontEye(x, y, dead) {
    if (dead) return xEye(x, y);
    oval(x, y, 3.8, 4.2, C.white);
    oval(x + 1.2, y + 0.5, 2, 2.3, C.ink);
  }

  function sideEye(x, y, dead) {
    if (dead) return xEye(x, y);
    oval(x, y, 3, 3.6, C.ink);
    blob(x + 1, y - 1.3, 1.1, C.white);
  }

  function featherWing(ox, oy, angle, fill, edge) {
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(angle);
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(-12 - i * 3, -6 + i * 5, 15 - i * 3, 5.5, -0.35 + i * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  function leatherWing(ox, oy, angle, fill, edge) {
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-27, -8);
    ctx.quadraticCurveTo(-20, -1, -24, 5);
    ctx.quadraticCurveTo(-19, 2, -15, 8);
    ctx.quadraticCurveTo(-10, 3, -5, 9);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-24, 5); ctx.moveTo(0, 0); ctx.lineTo(-15, 8);
    ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }

  function drawMonkey({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, C.wingBack, C.wingEdge);

    ctx.strokeStyle = C.furDark; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.bezierCurveTo(-28, 22, -36, 4, -28, -2);
    ctx.bezierCurveTo(-22, -6, -18, 2, -24, 4);
    ctx.stroke();

    oval(-4, 12, 12, 10, C.fur);
    oval(-1, 14, 7, 6.5, C.face);
    oval(-10, 21, 5, 3.5, C.furDark);
    oval(7, 17, 3.5, 4.5, C.furDark, -0.4);

    featherWing(-8, 2, 0.35 + beat, C.wing, C.wingEdge);

    oval(-12, -8, 7, 7, C.fur);
    oval(-12, -8, 4, 4, C.face);
    oval(0, -6, 16, 15, C.fur);
    oval(5, -9, 9.5, 7.5, C.face);
    oval(8, -1, 9, 6.5, C.face);
    frontEye(1.5, -9, dead);
    frontEye(9.5, -9, dead);

    blob(9, -3, 1.1, C.mouth);
    blob(12, -3, 1.1, C.mouth);
    ctx.strokeStyle = C.mouth; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(9, -1, 4.5, 0.2 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }

  function drawUnicorn({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, UNI.wingBack, UNI.edge);

    // regnbågssvans
    ctx.lineCap = 'round'; ctx.lineWidth = 3.5;
    RAINBOW.slice(0, 4).forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(-13, 8 + i * 1.5);
      ctx.quadraticCurveTo(-26, 2 + i * 3, -31, 12 + i * 3.5);
      ctx.stroke();
    });

    for (const lx of [-10, 2]) {
      ovalEdge(lx, 19, 3.5, 5, UNI.coat, UNI.edge);
      oval(lx, 23.5, 3.5, 1.8, UNI.hoof);
    }
    ovalEdge(-4, 10, 13, 10, UNI.coat, UNI.edge);
    featherWing(-8, 2, 0.35 + beat, UNI.coat, UNI.edge);

    // öra och horn, bakom huvudet så att fästet döljs
    poly([[-3, -14], [0, -25], [4, -15]], UNI.coat, UNI.edge);
    poly([[5, -15], [13, -34], [10, -13]], UNI.horn, UNI.hornEdge);
    ctx.strokeStyle = UNI.hornEdge; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(7, -19); ctx.lineTo(10.9, -20.5);
    ctx.moveTo(9.2, -24.5); ctx.lineTo(11.7, -25.8);
    ctx.stroke();

    ovalEdge(3, -5, 13, 12, UNI.coat, UNI.edge);
    ovalEdge(12, 1, 8, 6.5, UNI.muzzle, UNI.edge);
    blob(16, 0, 1.1, UNI.edge);

    // man
    [[-8, -13, 5], [-11, -6, 5], [-11, 1, 4.5], [-8, 7, 4]].forEach(([x, y, r], i) => blob(x, y, r, RAINBOW[i]));
    blob(1, -16, 3.5, RAINBOW[4]);

    sideEye(6, -7, dead);
    oval(8, -1.5, 2.6, 1.6, UNI.blush);
  }

  function drawDino({ beat, dead }) {
    leatherWing(-6, 2, 0.75 + beat, DINO.dark, DINO.edge);

    ctx.beginPath(); ctx.moveTo(-10, 4);
    ctx.quadraticCurveTo(-26, 8, -35, 21);
    ctx.quadraticCurveTo(-22, 20, -10, 18);
    ctx.closePath();
    ctx.fillStyle = DINO.skin; ctx.fill();
    ctx.strokeStyle = DINO.edge; ctx.lineWidth = 1.5; ctx.stroke();

    // taggar längs ryggen, bakom huvud och kropp
    for (const [x, y, a] of [[2.5, -16, -0.15], [-4, -13.5, -0.7], [-8, -8.5, -1.2], [-13.5, 6, -1.7]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      poly([[-4, 1], [0, -7], [4, 1]], DINO.spike, DINO.edge);
      ctx.restore();
    }

    oval(-9, 21, 4.5, 4, DINO.dark);
    oval(3, 21, 4.5, 4, DINO.dark);
    ovalEdge(-3, 11, 13, 10, DINO.skin, DINO.edge);
    oval(1, 14, 7, 6, DINO.belly);
    oval(9, 11, 2.5, 4, DINO.dark, -0.5);
    leatherWing(-6, 2, 0.3 + beat, DINO.wing, DINO.edge);

    ovalEdge(5, -6, 14, 11.5, DINO.skin, DINO.edge);
    blob(-1, -12, 1.5, DINO.dark);
    blob(3, -15, 1.3, DINO.dark);
    blob(16, -7, 1, DINO.edge);
    ctx.strokeStyle = DINO.edge; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(13, 3.5, 18, -1); ctx.stroke();
    poly([[11.5, 1.6], [13.5, 1.9], [12.6, 4]], C.white);
    frontEye(8, -9, dead);
  }

  function dogEar(angle, color) {
    ctx.save();
    ctx.translate(-2, -14); ctx.rotate(angle);
    oval(-11, 1, 12, 5.5, color, 0.1);
    ctx.restore();
  }

  function drawDog({ beat, dead }) {
    dogEar(0.85 + beat, DOG.darker);

    const wag = dead ? 0 : Math.sin(time * 14) * 0.4;
    ctx.save();
    ctx.translate(-14, 8); ctx.rotate(-0.5 + wag);
    ctx.strokeStyle = DOG.fur; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-7, -5, -5, -13); ctx.stroke();
    ctx.restore();

    for (const lx of [-10, 3]) {
      oval(lx, 20, 4, 5, DOG.fur);
      oval(lx, 24, 4.2, 2.2, DOG.cream);
    }
    oval(-4, 11, 12.5, 10, DOG.fur);
    oval(-1, 14, 7, 6, DOG.cream);

    oval(2, -6, 14, 12.5, DOG.fur);
    oval(11, -1, 9, 7, DOG.cream);
    oval(19, -3, 3.4, 2.7, DOG.nose);
    ctx.strokeStyle = DOG.nose; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.quadraticCurveTo(16, 3, 12, 2.5); ctx.stroke();
    if (!dead) oval(13, 5, 2.4, 3.4, DOG.tongue);
    sideEye(5, -9, dead);

    dogEar(0.4 + beat, DOG.dark);
  }

  function drawAstronaut({ boost, dead }) {
    if (!dead) {
      const len = (boost ? 20 : 9) + Math.sin(time * 45) * 2.5;
      poly([[-22, 20], [-12, 20], [-17, 20 + len]], ASTRO.flame);
      poly([[-19.5, 20], [-14.5, 20], [-17, 20 + len * 0.55]], ASTRO.core);
    }
    rr(-25, -4, 14, 24, 4);
    ctx.fillStyle = ASTRO.metal; ctx.fill();
    ctx.strokeStyle = ASTRO.edge; ctx.lineWidth = 1.5; ctx.stroke();
    rr(-21, 17, 8, 4, 1.5);
    ctx.fillStyle = ASTRO.boot; ctx.fill();

    for (const lx of [-9, 3]) {
      ovalEdge(lx, 20, 4.5, 5, ASTRO.suit, ASTRO.edge);
      oval(lx, 24, 4.6, 2.3, ASTRO.boot);
    }
    ovalEdge(-3, 11, 12, 10, ASTRO.suit, ASTRO.edge);
    rr(-1, 7, 8, 6, 1.5);
    ctx.fillStyle = ASTRO.metal; ctx.fill();
    blob(1.5, 10, 1.2, ASTRO.red);
    blob(4.5, 10, 1.2, ASTRO.blue);
    ovalEdge(8, 14, 3.5, 5, ASTRO.suit, ASTRO.edge, -0.5);

    ctx.strokeStyle = ASTRO.edge; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-5, -18); ctx.lineTo(-9, -27); ctx.stroke();
    blob(-9, -27, 2.2, ASTRO.red);

    ovalEdge(2, -6, 15, 14.5, ASTRO.suit, ASTRO.edge);
    oval(7, -6, 10, 8.5, ASTRO.visor);
    ctx.strokeStyle = ASTRO.shine; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(7, -6, 7, 5.5, 0, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
    if (dead) {
      ctx.strokeStyle = C.white; ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(3, -12); ctx.lineTo(6, -7); ctx.lineTo(4, -3); ctx.lineTo(8, 1);
      ctx.moveTo(6, -7); ctx.lineTo(12, -9);
      ctx.stroke();
    }
  }

  function flipper(ox, oy, angle, color) {
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(angle);
    oval(-3, 9, 4, 10, color, 0.25);
    ctx.restore();
  }

  function drawPenguin({ beat, boost, dead }) {
    flipper(-4, -1, 0.5 + beat * 0.9, '#151925');
    oval(-5, 23, 5, 2.6, PENG.beak);
    oval(4, 23, 5, 2.6, PENG.beak);

    ovalEdge(-1, 3, 14, 20, PENG.body, PENG.edge);
    oval(3, 8, 9, 13, PENG.belly);
    oval(5, -7, 8, 6.5, PENG.belly);
    poly([[10, -6], [19, -3.5], [10, -1]], PENG.beak, PENG.beakEdge, 1);
    sideEye(7, -9, dead);
    oval(9, -3, 2.4, 1.5, PENG.blush);
    flipper(-2, 0, 0.2 + beat * 0.9, PENG.body);

    // propellermössa: tre färgade fält, pinne och ett blad som snurrar
    ctx.save();
    ctx.beginPath(); ctx.arc(0, -15, 9, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.clip();
    PENG.cap.forEach((col, k) => { ctx.fillStyle = col; ctx.fillRect(-9 + k * 6, -25, 6, 11); });
    ctx.restore();
    ctx.beginPath(); ctx.arc(0, -15, 9, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -28); ctx.stroke();
    const spin = dead ? 0.6 : time * (boost ? 40 : 18);
    oval(0, -29, Math.abs(Math.cos(spin)) * 13 + 1.5, 2.2, PENG.blade);
    blob(0, -29, 1.8, C.ink);
  }

  function drawOctopus({ beat, dead }) {
    ctx.lineCap = 'round'; ctx.lineWidth = 5.5;
    for (let i = 0; i < 4; i++) {
      const sx = -8 + i * 5.5, wig = dead ? 0 : Math.sin(time * 6 + i * 1.3) * 3 + beat * 4;
      ctx.strokeStyle = i % 2 ? OCTO.dark : OCTO.skin;
      ctx.beginPath(); ctx.moveTo(sx, 4);
      ctx.bezierCurveTo(sx - 4, 12, sx - 10 + wig, 16, sx - 14 + wig, 22 + i * 0.5);
      ctx.stroke();
    }
    ovalEdge(0, -6, 16, 15, OCTO.skin, OCTO.dark);
    blob(-7, -14, 2.5, OCTO.spot);
    blob(-11, -6, 1.8, OCTO.spot);
    blob(-3, -18, 1.6, OCTO.spot);
    frontEye(3, -5, dead);
    frontEye(11, -5, dead);
    ctx.strokeStyle = OCTO.mouth; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(8, 2, 3.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }

  function beeWing(angle, s) {
    ctx.save();
    ctx.translate(-4, -9); ctx.rotate(angle);
    ctx.beginPath(); ctx.ellipse(-6 * s, -9 * s, 7 * s, 12 * s, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = BEE.wing; ctx.fill();
    ctx.strokeStyle = BEE.wingEdge; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }

  function drawBee({ boost, dead }) {
    const buzz = dead ? 0 : Math.sin(time * (boost ? 70 : 45)) * 0.45;
    beeWing(-0.2 + buzz, 0.85);
    poly([[-17, 2], [-24, 5], [-17, 8]], BEE.stripe);
    ctx.strokeStyle = BEE.stripe; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, 14); ctx.lineTo(-8, 20); ctx.moveTo(1, 15); ctx.lineTo(0, 21); ctx.stroke();

    // randig kropp
    ctx.save();
    ctx.beginPath(); ctx.ellipse(-2, 3, 16, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = BEE.body; ctx.fill();
    ctx.clip();
    ctx.fillStyle = BEE.stripe;
    ctx.fillRect(-12, -12, 5, 30);
    ctx.fillRect(-4, -12, 5, 30);
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(-2, 3, 16, 13, 0, 0, Math.PI * 2);
    ctx.strokeStyle = BEE.edge; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.strokeStyle = BEE.stripe; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(6, -8); ctx.quadraticCurveTo(5, -16, 1, -20);
    ctx.moveTo(10, -8); ctx.quadraticCurveTo(12, -16, 15, -19);
    ctx.stroke();
    blob(1, -20, 2.2, BEE.stripe);
    blob(15, -19, 2.2, BEE.stripe);

    frontEye(5, -1, dead);
    frontEye(12, -1, dead);
    oval(3.5, 5, 2.2, 1.4, BEE.blush);
    oval(14, 5, 2.2, 1.4, BEE.blush);
    ctx.strokeStyle = BEE.stripe; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(9, 4, 3, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    beeWing(0.25 + buzz, 1);
  }

  function drawDragon({ beat, boost, dead }) {
    leatherWing(-6, 2, 0.75 + beat, DRAKE.dark, DRAKE.edge);

    // svans med pilspets
    ctx.beginPath(); ctx.moveTo(-10, 6);
    ctx.quadraticCurveTo(-24, 12, -31, 22);
    ctx.quadraticCurveTo(-20, 18, -10, 17);
    ctx.closePath();
    ctx.fillStyle = DRAKE.skin; ctx.fill();
    ctx.strokeStyle = DRAKE.edge; ctx.lineWidth = 1.5; ctx.stroke();
    poly([[-31, 22], [-38, 17], [-37, 27], [-29, 27]], DRAKE.dark, DRAKE.edge);

    for (const [x, y, a] of [[-4, -13.5, -0.7], [-8, -8.5, -1.2], [-13.5, 6, -1.7]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      poly([[-3.5, 1], [0, -6], [3.5, 1]], DRAKE.spike, DRAKE.edge);
      ctx.restore();
    }

    oval(-9, 21, 4.5, 4, DRAKE.dark);
    oval(3, 21, 4.5, 4, DRAKE.dark);
    ovalEdge(-3, 11, 13, 10, DRAKE.skin, DRAKE.edge);
    oval(1, 14, 7, 6, DRAKE.belly);
    oval(9, 11, 2.5, 4, DRAKE.dark, -0.5);
    leatherWing(-6, 2, 0.3 + beat, DRAKE.wing, DRAKE.edge);

    poly([[-1, -14], [-9, -24], [3, -16]], DRAKE.horn, DRAKE.edge);
    poly([[5, -16], [2, -27], [9, -16]], DRAKE.horn, DRAKE.edge);
    ovalEdge(6, -6, 15, 11, DRAKE.skin, DRAKE.edge);
    blob(18, -7, 1.1, DRAKE.edge);
    ctx.strokeStyle = DRAKE.edge; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.quadraticCurveTo(15, 3, 20, -1); ctx.stroke();
    frontEye(7, -9, dead);

    if (boost && !dead) {
      const f = Math.sin(time * 50) * 1.5;
      ctx.globalAlpha = 0.9;
      blob(27, -2, 6 + f, '#ff6a2a');
      blob(34, -3, 5 + f, '#ff9f1c');
      blob(40, -3, 3.5, '#ffd23f');
      blob(27, -2, 3, '#ffe9a0');
      ctx.globalAlpha = 1;
    }
  }

  function drawCat({ beat, dead }) {
    // ballonger i snören från tassen
    const sway = Math.sin(time * 2) * 2 + beat * 2;
    const balloons = [[-8, -33], [3, -37], [13, -32]];
    ctx.strokeStyle = KATT.string; ctx.lineWidth = 1;
    for (const [bx, by] of balloons) seg(8, 4, bx + sway, by + 8);
    balloons.forEach(([bx, by], k) => {
      const x = bx + sway, col = KATT.balloons[k];
      oval(x, by, 6.5, 8, col);
      poly([[x - 1.5, by + 8.5], [x + 1.5, by + 8.5], [x, by + 6.5]], col);
      oval(x - 2, by - 3, 1.6, 2.6, 'rgba(255,255,255,0.6)', -0.3);
    });

    ctx.strokeStyle = KATT.fur; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, 12); ctx.bezierCurveTo(-26, 10, -26, -4, -18, -6); ctx.stroke();

    for (const lx of [-10, 2]) {
      oval(lx, 20, 4, 4.5, KATT.fur);
      oval(lx, 23.5, 4, 2, KATT.cream);
    }
    oval(-4, 11, 12.5, 10, KATT.fur);
    oval(-1, 14, 7, 6, KATT.cream);
    ctx.strokeStyle = KATT.stripe; ctx.lineWidth = 2.5;
    seg(-10, 3, -7, 7);
    seg(-15, 7, -11, 10);

    poly([[-9, -12], [-6, -24], [0, -15]], KATT.fur, KATT.stripe);
    poly([[-7, -14], [-5.5, -20.5], [-2, -15]], KATT.nose);
    poly([[4, -15], [10, -24], [13, -11]], KATT.fur, KATT.stripe);
    poly([[6, -14.5], [9.5, -20.5], [11, -13]], KATT.nose);

    oval(2, -4, 13, 12, KATT.fur);
    oval(9, 1, 7, 5, KATT.cream);
    ctx.strokeStyle = KATT.stripe; ctx.lineWidth = 2;
    seg(-2, -15, -1, -11);
    seg(2, -16, 2, -12);
    frontEye(3, -6, dead);
    frontEye(11, -6, dead);
    poly([[9, -1], [13, -1], [11, 1.5]], KATT.nose);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(11, 1.5); ctx.quadraticCurveTo(9.5, 4, 8, 2.5);
    ctx.moveTo(11, 1.5); ctx.quadraticCurveTo(12.5, 4, 14, 2.5);
    ctx.stroke();
    ctx.strokeStyle = KATT.whisker; ctx.lineWidth = 1;
    seg(14, 0, 22, -2);
    seg(14, 2, 22, 3);

    oval(8, 4, 3.5, 3, KATT.fur);
  }

  function drawGhost({ beat, boost, dead }) {
    for (let k = 1; k <= 3; k++) {
      ctx.globalAlpha = Math.min(1, (0.25 / k) * (boost ? 1.6 : 1));
      oval(-14 - k * 7, 8 + Math.sin(time * 5 + k) * 2, 7 - k, 5 - k, SPOKE.body);
    }
    ctx.globalAlpha = 1;

    // rund topp och vågig fåll
    const wave = dead ? 0 : Math.sin(time * 6) * 2;
    ctx.beginPath();
    ctx.moveTo(-15, -4);
    ctx.arc(0, -4, 15, Math.PI, 0);
    ctx.lineTo(15, 14);
    for (let k = 0; k < 4; k++) {
      const x0 = 15 - k * 7.5;
      ctx.quadraticCurveTo(x0 - 3.75, 20 + (k % 2 ? -wave : wave), x0 - 7.5, 14);
    }
    ctx.closePath();
    ctx.fillStyle = SPOKE.body; ctx.fill();
    ctx.strokeStyle = SPOKE.edge; ctx.lineWidth = 1.5; ctx.stroke();

    ovalEdge(-14, 4, 4, 6, SPOKE.body, SPOKE.edge, 0.6 + beat * 0.5);
    ovalEdge(14, 3, 4, 6, SPOKE.body, SPOKE.edge, -0.6 - beat * 0.5);

    if (dead) {
      xEye(3, -6);
      xEye(10, -6);
    } else {
      oval(3, -6, 2.8, 4, C.ink);
      oval(10, -6, 2.8, 4, C.ink);
      blob(3.8, -7.5, 1, C.white);
      blob(10.8, -7.5, 1, C.white);
    }
    oval(6.5, 2, 2.4, 3, C.ink);
    oval(0, -1, 2.4, 1.4, SPOKE.blush);
    oval(13.5, -1, 2.4, 1.4, SPOKE.blush);
  }

  function drawFrog({ beat, dead }) {
    // paraply med rundad fåll, lite på sned
    ctx.save();
    ctx.translate(-2, -14); ctx.rotate(-0.15 + beat * 0.15);
    ctx.strokeStyle = GRODA.handle; ctx.lineWidth = 2; seg(0, 2, 0, -16);
    const R = 17, cy = -16;
    const canopy = () => {
      ctx.beginPath(); ctx.arc(0, cy, R, Math.PI, 0);
      for (let k = 0; k < 4; k++) {
        const x0 = R - k * (R / 2);
        ctx.quadraticCurveTo(x0 - R / 4, cy + 4, x0 - R / 2, cy);
      }
      ctx.closePath();
    };
    canopy(); ctx.fillStyle = GRODA.umbrella[0]; ctx.fill();
    for (const k of [1, 3]) {
      const a0 = Math.PI + k * Math.PI / 4;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.arc(0, cy, R, a0, a0 + Math.PI / 4); ctx.closePath();
      ctx.fillStyle = GRODA.umbrella[1]; ctx.fill();
    }
    canopy(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    blob(0, cy - R, 1.8, C.ink);
    ctx.restore();

    oval(-9, 17, 9, 5, GRODA.dark, 0.2);
    oval(-15, 22, 5, 2.2, GRODA.dark);
    ovalEdge(-2, 9, 13, 10, GRODA.skin, GRODA.dark);
    oval(1, 12, 8, 6.5, GRODA.belly);
    oval(7, 18, 3, 4.5, GRODA.dark, -0.3);

    ovalEdge(5, -2, 14, 9.5, GRODA.skin, GRODA.dark);
    ovalEdge(0, -10, 5.5, 5.5, GRODA.skin, GRODA.dark);
    ovalEdge(10, -10, 5.5, 5.5, GRODA.skin, GRODA.dark);
    frontEye(0.5, -10.5, dead);
    frontEye(10.5, -10.5, dead);
    ctx.strokeStyle = GRODA.dark; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(4, 2); ctx.quadraticCurveTo(11, 5, 18, 0); ctx.stroke();
    oval(2.5, 1.5, 2.4, 1.4, GRODA.blush);
    oval(16, -1, 2.2, 1.3, GRODA.blush);
  }

  function colorWing(ox, oy, angle, colors, edge, s = 1) {
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(angle); ctx.scale(s, s);
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(-12 - i * 3, -6 + i * 5, 15 - i * 3, 5.5, -0.35 + i * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = colors[i]; ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  function drawHare({ beat, dead }) {
    colorWing(-8, 2, 0.8 + beat, HARE.feathers, HARE.featherEdge, 0.85);
    ovalEdge(-15, 12, 5, 5, C.white, HARE.edge);

    ovalEdge(-9, 22, 7, 3.2, HARE.fur, HARE.edge);
    ovalEdge(2, 22, 5, 3, HARE.fur, HARE.edge);
    ovalEdge(-4, 11, 12, 10, HARE.fur, HARE.edge);
    oval(-1, 14, 7, 6, C.white);

    // långa öron som vickar när den flaxar
    const wob = beat * 0.15;
    ovalEdge(-4, -22, 4.5, 12, HARE.fur, HARE.edge, -0.35 + wob);
    oval(-4, -22, 2.2, 9, HARE.inner, -0.35 + wob);
    ovalEdge(4, -23, 4.5, 12, HARE.fur, HARE.edge, 0.15 + wob);
    oval(4, -23, 2.2, 9, HARE.inner, 0.15 + wob);

    ovalEdge(3, -5, 12.5, 11.5, HARE.fur, HARE.edge);
    oval(11, 0, 6, 4.5, C.white);
    ctx.fillStyle = C.white; ctx.fillRect(10.5, 2, 3.5, 3.5);
    ctx.strokeStyle = HARE.edge; ctx.lineWidth = 1; ctx.strokeRect(10.5, 2, 3.5, 3.5);
    oval(16, -2, 2.2, 1.7, HARE.nose);
    frontEye(3, -7, dead);
    frontEye(10, -7, dead);
    oval(1, -1, 2.4, 1.5, HARE.cheek);

    colorWing(-8, 2, 0.35 + beat, HARE.feathers, HARE.featherEdge);

    // korg med påskägg
    ctx.strokeStyle = HARE.basketDark; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(11, 13, 6, Math.PI, 0); ctx.stroke();
    oval(8, 12, 3, 4, HARE.eggs[0]);
    oval(13.5, 12, 3, 4, HARE.eggs[1]);
    rr(4, 12, 14, 8, 3); ctx.fillStyle = HARE.basket; ctx.fill();
    ctx.strokeStyle = HARE.basketDark; ctx.lineWidth = 1; ctx.stroke();
    oval(5, 13, 3, 2.5, HARE.fur);
  }

  function drawTomte({ beat, boost, dead }) {
    // gnistrande spår efter släden
    if (!dead) {
      for (let k = 0; k < 4; k++) {
        const t = (time * 2 + k / 4) % 1;
        ctx.globalAlpha = (1 - t) * (boost ? 0.95 : 0.5);
        blob(-26 - t * 26, 18 + Math.sin(t * 8 + k) * 3, 2.2 * (1 - t) + 0.8, TOMTE.sparkle);
      }
      ctx.globalAlpha = 1;
    }

    oval(-14, 1, 9, 10, TOMTE.sack);
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2; seg(-13, -8, -10, -11);

    oval(-2, 4, 11, 11, TOMTE.red);
    oval(4, -9, 9, 9, TOMTE.skin);
    ovalEdge(5, -2, 10, 8, TOMTE.beard, TOMTE.beardEdge);
    oval(3, -4.5, 4, 2.2, TOMTE.beard);
    oval(9, -4.5, 4, 2.2, TOMTE.beard);
    blob(10, -7, 2.5, TOMTE.nose);
    if (dead) {
      xEye(4, -11, 2);
      xEye(9, -11, 2);
    } else {
      oval(4, -11, 1.6, 2, C.ink);
      oval(9, -11, 1.6, 2, C.ink);
    }

    // luvan viker sig bakåt
    const flop = beat * 3;
    poly([[-5, -15], [12, -16], [-12, -25 + flop]], TOMTE.red);
    rr(-6, -18, 19, 5, 2.5); ctx.fillStyle = TOMTE.beard; ctx.fill();
    blob(-12, -25 + flop, 3.5, TOMTE.beard);

    // släden
    rr(-20, 6, 34, 12, 5);
    ctx.fillStyle = TOMTE.sleigh; ctx.fill();
    ctx.strokeStyle = TOMTE.sleighEdge; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = TOMTE.runner; ctx.lineWidth = 2; ctx.lineCap = 'round';
    seg(-13, 18, -13, 22);
    seg(7, 18, 7, 22);
    ctx.beginPath(); ctx.moveTo(-22, 22); ctx.lineTo(16, 22); ctx.quadraticCurveTo(24, 22, 22, 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(12, 10); ctx.stroke();
  }

  function leafWing(angle, fill) {
    ctx.save();
    ctx.translate(-1, -13); ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, -12, -24, -4);
    ctx.quadraticCurveTo(-12, 4, 0, 0);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = PUMPA.leafEdge; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineWidth = 1; seg(0, 0, -20, -4);
    ctx.restore();
  }

  function drawPumpkinFigure({ beat, dead }) {
    leafWing(0.8 + beat, PUMPA.leafBack);
    oval(-8, 4, 11, 14, PUMPA.dark);
    oval(8, 4, 11, 14, PUMPA.dark);
    ovalEdge(0, 4, 12, 15, PUMPA.body, PUMPA.rib);
    ctx.strokeStyle = PUMPA.rib; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -10); ctx.quadraticCurveTo(-9, 4, -5, 18);
    ctx.moveTo(5, -10); ctx.quadraticCurveTo(9, 4, 5, 18);
    ctx.stroke();
    rr(-2, -15, 5, 7, 2); ctx.fillStyle = PUMPA.stem; ctx.fill();

    // utskuret ansikte som lyser
    if (dead) {
      ctx.strokeStyle = PUMPA.carve; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (const ex of [-2, 9]) {
        seg(ex - 3, -6, ex + 3, 0);
        seg(ex + 3, -6, ex - 3, 0);
      }
      seg(-4, 8, 14, 8);
    } else {
      poly([[-5, -1], [-1, -7], [2, -1]], PUMPA.glow, PUMPA.carve, 1);
      poly([[6, -1], [10, -7], [13, -1]], PUMPA.glow, PUMPA.carve, 1);
      poly([[-6, 5], [15, 5], [13, 10], [10, 8], [7, 11], [4, 8], [1, 11], [-2, 8], [-4, 10]], PUMPA.glow, PUMPA.carve, 1);
    }
    leafWing(0.35 + beat, PUMPA.leaf);
  }

  function drawSunFigure({ boost, dead }) {
    const spin = dead ? 0.3 : time * (boost ? 6 : 2);
    for (let k = 0; k < 10; k++) {
      const a = spin + k * Math.PI / 5, c = Math.cos(a), s = Math.sin(a), len = k % 2 ? 22 : 25;
      poly([[c * 15 - s * 4, s * 15 + c * 4], [c * len, s * len], [c * 15 + s * 4, s * 15 - c * 4]], SOL.ray, SOL.edge, 1);
    }
    ovalEdge(0, 0, 16, 16, SOL.core, SOL.edge);

    if (dead) {
      xEye(1, -4);
      xEye(9, -4);
    } else {
      // solglasögon
      ctx.fillStyle = SOL.glasses;
      rr(-4, -8, 9, 7, 3); ctx.fill();
      rr(6, -8, 9, 7, 3); ctx.fill();
      ctx.strokeStyle = SOL.glasses; ctx.lineWidth = 2;
      seg(5, -6, 6, -6);
      seg(-4, -6, -11, -8);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
      seg(-2, -6, 0, -7.5);
      seg(8, -6, 10, -7.5);
    }
    ctx.strokeStyle = SOL.smile; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(5, 3, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    oval(-5, 4, 2.6, 1.6, SOL.cheek);
    oval(14, 3, 2.4, 1.5, SOL.cheek);
  }

  function star(cx, cy, r, color) {
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? r * 0.45 : r;
      pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]);
    }
    poly(pts, color);
  }

  function drawHero({ boost, dead }) {
    // manteln fladdrar bakåt, snabbare när hjälten flaxar
    const speed = boost ? 18 : 10, w1 = Math.sin(time * speed) * 3, w2 = Math.sin(time * speed + 1.4) * 4;
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.quadraticCurveTo(-16, -10 + w1, -32, -6 + w2);
    ctx.quadraticCurveTo(-28, 2 + w1, -31, 10 + w2);
    ctx.quadraticCurveTo(-16, 8, -4, 6);
    ctx.closePath();
    ctx.fillStyle = HERO.cape; ctx.fill();
    ctx.strokeStyle = HERO.capeDark; ctx.lineWidth = 1.5; ctx.stroke();

    oval(-14, 13, 7, 3.5, HERO.suitDark);
    oval(-21, 13.5, 3.6, 3.4, HERO.glove);
    oval(-16, 9, 8, 3.8, HERO.suit);
    oval(-24, 9.5, 4, 3.8, HERO.glove);
    ovalEdge(-4, 6, 12, 8, HERO.suit, HERO.suitDark);
    oval(-10, 6, 1.8, 7, HERO.belt);
    star(2, 5, 4.5, HERO.belt);
    oval(12, 1, 7, 3.2, HERO.suit);
    blob(19, 1, 3.6, HERO.glove);

    oval(5, -9, 9.5, 9.5, HERO.skin);
    oval(3, -16, 9, 4.5, HERO.hair);
    poly([[8, -19], [13, -22], [11, -15]], HERO.hair);
    rr(-2, -13, 16, 6, 3); ctx.fillStyle = HERO.mask; ctx.fill();
    if (dead) {
      xEye(3, -10, 2, C.white);
      xEye(10, -10, 2, C.white);
    } else {
      oval(3, -10, 2.2, 1.8, C.white);
      oval(10, -10, 2.2, 1.8, C.white);
    }
    ctx.strokeStyle = HERO.smile; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(8, -5, 3, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }

  // En person i guld som flyger med gyllene vingar, med krona och gnistor runt sig.
  function drawGold({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, GULD.dark, GULD.edge);
    oval(-14, 13, 7, 3.5, GULD.dark);
    oval(-21, 13.5, 3.6, 3.4, GULD.mid);
    oval(-16, 9, 8, 3.8, GULD.mid);
    oval(-24, 9.5, 4, 3.8, GULD.main);
    ovalEdge(-4, 6, 12, 8, GULD.main, GULD.edge);
    oval(-7, 3, 7, 2.6, GULD.light);
    star(2, 5, 4.5, C.white);
    oval(12, 1, 7, 3.2, GULD.main);
    blob(19, 1, 3.6, GULD.mid);

    ovalEdge(5, -9, 9.5, 9.5, GULD.main, GULD.edge);
    blob(1, -13, 3, GULD.light);
    poly([[-3, -15], [-2, -25], [2.5, -19], [5.5, -27], [8.5, -19], [13, -25], [14, -15]], GULD.crown, GULD.edge);
    GULD.gems.forEach((col, k) => blob(1.5 + k * 4.5, -17.5, 1.4, col));
    if (dead) {
      xEye(3, -9, 2);
      xEye(10, -9, 2);
    } else {
      oval(3, -9, 1.7, 2.1, C.ink);
      oval(10, -9, 1.7, 2.1, C.ink);
      blob(3.6, -9.8, 0.6, C.white);
      blob(10.6, -9.8, 0.6, C.white);
    }
    ctx.strokeStyle = GULD.edge; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(7.5, -5, 3, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

    featherWing(-8, 2, 0.35 + beat, GULD.main, GULD.edge);
    if (!dead) {
      for (const [x, y, k] of [[-20, -14, 0], [22, -16, 2], [-2, 22, 4]]) {
        star(x, y, 2.5 + 1.5 * Math.sin(time * 6 + k), GULD.light);
      }
    }
  }

  // En prinsessa i rosa klänning som flyger på älvvingar, med tiara och ett trollspö.
  function drawPrincess({ boost, dead }) {
    const flutter = dead ? 0 : Math.sin(time * (boost ? 26 : 16)) * 0.35;
    for (const [rot, len] of [[-0.9 + flutter, 15], [-0.25 + flutter * 0.6, 11]]) {
      ctx.save(); ctx.translate(-5, -2); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(-len, 0, len, len * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = PRINS.wing; ctx.fill();
      ctx.strokeStyle = PRINS.wingEdge; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    }
    oval(-6, -4, 5, 11, PRINS.hairDark, 0.3);

    // klänningen: en klocka med vågig fåll
    ctx.beginPath();
    ctx.moveTo(-5, -1); ctx.lineTo(5, -1);
    ctx.quadraticCurveTo(10, 8, 14, 15);
    for (let k = 0; k < 4; k++) ctx.quadraticCurveTo(10.5 - k * 7, 19, 7 - k * 7, 15);
    ctx.quadraticCurveTo(-10, 8, -5, -1);
    ctx.closePath();
    ctx.fillStyle = PRINS.dress; ctx.fill();
    ctx.strokeStyle = PRINS.edge; ctx.lineWidth = 1.5; ctx.stroke();
    oval(1, 7, 3, 6, PRINS.dressLight, -0.15);
    rr(-5.5, -1.5, 11, 3, 1.5); ctx.fillStyle = PRINS.dressDark; ctx.fill();

    oval(-6, 3, 2.2, 5, PRINS.skin, 0.4);
    oval(8, 1, 5, 2.2, PRINS.skin, -0.4);
    blob(12, -1, 2.3, PRINS.skin);
    ctx.strokeStyle = PRINS.wand; ctx.lineWidth = 2; ctx.lineCap = 'round';
    seg(12, -1, 18, -9);
    star(19.5, -11, 4 + (dead ? 0 : Math.sin(time * 8) * 0.8), PRINS.tiara);

    ovalEdge(1, -11, 8, 8, PRINS.skin, PRINS.skinEdge);
    oval(-6, -8, 3, 7.5, PRINS.hair, 0.15);
    oval(-0.5, -16.5, 8, 3.8, PRINS.hair, -0.1);
    poly([[-4, -17], [-3, -23], [0, -19.5], [2, -25], [4, -19.5], [7, -23], [8, -17]], PRINS.tiara, PRINS.tiaraEdge);
    blob(2, -19.8, 1.5, PRINS.gem);
    if (dead) {
      xEye(3, -11, 1.8);
      xEye(7.5, -11, 1.8);
    } else {
      oval(3, -11, 1.3, 1.8, C.ink);
      oval(7.5, -11, 1.3, 1.8, C.ink);
      blob(3.4, -11.7, 0.5, C.white);
      blob(7.9, -11.7, 0.5, C.white);
    }
    oval(1.5, -7.5, 1.8, 1.1, PRINS.blush);
    oval(9, -7.5, 1.8, 1.1, PRINS.blush);
    ctx.strokeStyle = PRINS.edge; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(5.5, -8.5, 2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

    // gnistor efter trollspöet när hon flaxar
    if (boost && !dead) for (const [x, y] of [[-18, 12], [-24, 4]]) star(x, y, 2.2, PRINS.dressLight);
  }

  // ---------- De 24 nya figurerna ----------
  // Samma storlek och stil som de andra: ritade kring (0, 0), vända åt höger.

  const RAV = { fur: '#f07f2e', dark: '#b8541a', white: '#fff4e6', black: '#3a2a20' };
  const GRIS = { skin: '#ffb3c6', dark: '#e07a98', snout: '#ff9cbb', blush: '#ff8fb0' };
  const ELEFANT = { skin: '#a9b4c2', dark: '#6f7b8a', ear: '#c3ccd8', inner: '#f3b6c8', tusk: '#fffaf0' };
  const GIRAFF = { fur: '#f6c445', spot: '#c9781e', edge: '#a4621a', horn: '#7a4a1a', muzzle: '#f2d79b' };
  const KROKO = { skin: '#5fae4e', dark: '#3c7a32', belly: '#d6e8a0', tooth: '#ffffff' };
  const HAJ = { skin: '#6c8fb3', dark: '#3f5f80', belly: '#eef4fa', gill: '#4d7090' };
  const DELFIN = { skin: '#59a8e8', dark: '#2f78b8', belly: '#dff1ff' };
  const SKOLD = { shell: '#4f9e5f', pattern: '#7cc36e', edge: '#2f6b3a', skin: '#a7d17a', skinEdge: '#6f9e4a', prop: '#e63946', pole: '#555b66' };
  const NYCKEL = { red: '#e63946', dark: '#9e1b25', black: '#22252b', wing: 'rgba(235,248,255,0.75)', wingEdge: '#9cc8e8' };
  const PAPEG = { red: '#e63946', dark: '#9e1b25', beak: '#ffe8a3', beakDark: '#3a2f33', wings: ['#2f80ed', '#ffd23f', '#2bb673'], wingEdge: '#1a4f99' };
  const FLAM = { pink: '#ff8fb8', dark: '#e0568a', light: '#ffc2d8', beak: '#2a2a2a', beakBase: '#ffe2ec' };
  const TIGER = { fur: '#ff9a2e', dark: '#c4600e', stripe: '#2a1d16', white: '#fff4e6', nose: '#ff8fa3' };
  const KOALA = { fur: '#9aa5b1', dark: '#6b7682', light: '#dfe5ea', nose: '#2a2d33', leaf: '#6cbf4a', leafDark: '#3f8a34' };
  const IGEL = { spike: '#7a5636', spikeDark: '#4f3620', face: '#e9c99a', faceEdge: '#b8946a', nose: '#2a1d16', belly: '#f3dcb4' };
  const ALG = { fur: '#8a5a3a', dark: '#5e3a22', muzzle: '#a8784f', antler: '#e8d3a8', antlerEdge: '#a8906a', blue: '#2f6fd6', yellow: '#ffd23f' };
  const KYCK = { yellow: '#ffe066', dark: '#e0b400', beak: '#ff9f1c', shell: '#fffaf0', shellEdge: '#d8ccb4', cheek: '#ffb3a0' };
  const FLADDER = { body: '#5a4370', dark: '#2e2040', wing: '#3d2c52', inner: '#ff9ec4', fang: '#ffffff' };
  const PIRAT = { skin: '#ffd6b8', skinEdge: '#e0a98c', shirt: '#ffffff', stripe: '#e63946', bandana: '#e63946', patch: '#1d1d1d', beard: '#5a3a22', pants: '#2a2a33', barrel: '#a0703a', barrelDark: '#6b4423', band: '#5a5f66', flame: '#ff9f1c', core: '#ffe066' };
  const NINJA = { suit: '#2a2d3a', dark: '#15161d', band: '#e63946', skin: '#ffd6b8' };
  const RIDDARE = { metal: '#c3ccd6', dark: '#7d8896', shine: '#eef2f6', plume: '#e63946', shield: '#2f6fd6', shieldEdge: '#1a4f99', cross: '#ffd23f' };
  const TROLL = { robe: '#3b4fc4', dark: '#24318a', star: '#ffe066', beard: '#ffffff', beardEdge: '#c9c9d6', skin: '#ffd6b8', skinEdge: '#e0a98c', staff: '#8a5a2b', orb: '#7ff0ff' };
  const HAXA = { dress: '#7b3fb8', dark: '#4a2275', hat: '#2a1f3a', skin: '#c8f0a8', skinEdge: '#7fb85a', hair: '#ff8c1a', broom: '#8a5a2b', bristle: '#d9a650', bristleEdge: '#a6782f', band: '#e63946' };
  const SJOJ = { tail: '#2bb6a0', tailDark: '#1a7f70', scale: '#5fd8c4', fin: '#7ff0dd', skin: '#ffd9c2', skinEdge: '#e0a98c', hair: '#e63946', hairDark: '#a8202a', top: '#a78bfa', topEdge: '#7a5ad8' };
  const SNO = { snow: '#ffffff', edge: '#b9c8dc', coal: '#2a2a2a', carrot: '#ff8c1a', scarf: '#e63946', scarfDark: '#a8202a', hat: '#2a2a33', band: '#e63946', stick: '#6b4423' };

  // en fylld och kantad rundad rektangel
  function fillBox(x, y, w, h, r, fill, edge) {
    rr(x, y, w, h, r);
    ctx.fillStyle = fill; ctx.fill();
    if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

  // ett leende som en båge
  function smile(x, y, r, color = C.ink, width = 1.3) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }

  // små runda ögon för figurer med mindre huvud
  function dotEye(x, y, dead, r = 1.4) {
    if (dead) return xEye(x, y, 1.7);
    oval(x, y, r, r * 1.3, C.ink);
    blob(x + r * 0.35, y - r * 0.5, r * 0.4, C.white);
  }

  function drawFox({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, C.wingBack, C.wingEdge);
    ovalEdge(-19, 9, 10, 6, RAV.fur, RAV.dark, -0.5);
    oval(-26, 5, 4.5, 3.5, RAV.white, -0.5);
    for (const lx of [-9, 2]) oval(lx, 19, 3.5, 4.5, RAV.black);
    ovalEdge(-3, 9, 12, 9.5, RAV.fur, RAV.dark);
    oval(0, 12, 6.5, 5.5, RAV.white);
    poly([[-6, -12], [-4, -25], [2, -14]], RAV.fur, RAV.dark);
    poly([[-4.5, -14], [-3.5, -21], [0, -14.5]], RAV.black);
    poly([[5, -14], [11, -25], [13, -11]], RAV.fur, RAV.dark);
    poly([[7, -14], [10.5, -21], [11.5, -12.5]], RAV.black);
    ovalEdge(3, -4, 12, 11, RAV.fur, RAV.dark);
    poly([[4, -1], [21, -2], [17, 5], [6, 6]], RAV.white);
    blob(21, -2.5, 2.2, RAV.black);
    frontEye(4, -6, dead);
    frontEye(11, -6, dead);
    featherWing(-8, 2, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawPig({ beat, dead }) {
    featherWing(-6, 0, 0.8 + beat, C.wingBack, C.wingEdge);
    ctx.strokeStyle = GRIS.dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(-19, 5, 3.5, 0.5, Math.PI * 1.8); ctx.stroke();
    for (const lx of [-10, -2, 6]) oval(lx, 18, 3, 4, GRIS.dark);
    ovalEdge(-2, 7, 15, 11, GRIS.skin, GRIS.dark);
    poly([[-1, -12], [1, -21], [6, -14]], GRIS.skin, GRIS.dark);
    poly([[9, -13], [13, -21], [15, -11]], GRIS.skin, GRIS.dark);
    ovalEdge(7, -5, 10, 9, GRIS.skin, GRIS.dark);
    ovalEdge(16, -3, 4.5, 3.8, GRIS.snout, GRIS.dark);
    blob(14.8, -3, 0.9, GRIS.dark);
    blob(17.4, -3, 0.9, GRIS.dark);
    frontEye(4.5, -8, dead);
    frontEye(11, -8.5, dead);
    oval(4, -2, 2, 1.2, GRIS.blush);
    featherWing(-6, 0, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawElephant({ beat, dead }) {
    // örat bakom huvudet och det närmre flaxar
    ovalEdge(-4, -7, 8, 11, ELEFANT.ear, ELEFANT.dark, -0.5 - beat * 0.7);
    for (const lx of [-11, 2]) fillBox(lx - 3.5, 11, 7, 10, 3, ELEFANT.skin, ELEFANT.dark);
    ctx.strokeStyle = ELEFANT.dark; ctx.lineWidth = 1.5; seg(-17, 5, -22, 9);
    ovalEdge(-4, 6, 14, 10, ELEFANT.skin, ELEFANT.dark);
    ovalEdge(7, -5, 11, 10, ELEFANT.skin, ELEFANT.dark);
    ctx.lineCap = 'round';
    for (const [color, width] of [[ELEFANT.dark, 7.5], [ELEFANT.skin, 5]]) {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(15, -2); ctx.quadraticCurveTo(25, 1, 22, 11); ctx.stroke();
    }
    poly([[13, 2], [18, 6], [14, 6.5]], ELEFANT.tusk, ELEFANT.dark, 1);
    frontEye(10, -8, dead);
    ovalEdge(-1, -3, 7, 10, ELEFANT.ear, ELEFANT.dark, 0.3 + beat * 0.7);
    oval(-1, -3, 4.5, 7, ELEFANT.inner, 0.3 + beat * 0.7);
  }

  function drawGiraffe({ beat, dead }) {
    featherWing(-8, 4, 0.8 + beat, C.wingBack, C.wingEdge);
    for (const lx of [-10, -2]) fillBox(lx - 2, 13, 4, 9, 2, GIRAFF.fur, GIRAFF.edge);
    ovalEdge(-5, 9, 11, 8, GIRAFF.fur, GIRAFF.edge);
    // halsen lutar framåt
    poly([[-2, 4], [4, 6], [14, -12], [9, -15]], GIRAFF.fur, GIRAFF.edge);
    for (const [x, y, r] of [[-9, 7, 2.5], [-3, 11, 2.2], [2, 6, 2], [6, -2, 1.8], [10, -8, 1.6], [-12, 11, 1.6]]) blob(x, y, r, GIRAFF.spot);
    ctx.strokeStyle = GIRAFF.edge; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    seg(9, -15, 0, 3);
    ovalEdge(14, -17, 7, 5.5, GIRAFF.fur, GIRAFF.edge, 0.2);
    oval(19, -15, 3.5, 3, GIRAFF.muzzle, 0.2);
    ctx.strokeStyle = GIRAFF.horn; ctx.lineWidth = 2;
    seg(11, -21, 10, -26);
    seg(15, -22, 15, -27);
    blob(10, -26.5, 1.7, GIRAFF.horn);
    blob(15, -27.5, 1.7, GIRAFF.horn);
    dotEye(14, -18.5, dead);
    featherWing(-8, 4, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawCroc({ beat, dead }) {
    featherWing(-6, 0, 0.8 + beat, KROKO.dark, KROKO.dark);
    poly([[-10, 2], [-29, 7], [-10, 12]], KROKO.skin, KROKO.dark);
    for (const x of [-24, -19, -14]) poly([[x, 4.5], [x + 2, 1], [x + 4, 3.6]], KROKO.dark);
    for (const lx of [-8, 4]) oval(lx, 14, 3.5, 4, KROKO.dark);
    ovalEdge(-3, 6, 14, 8, KROKO.skin, KROKO.dark);
    oval(-2, 10, 9, 3.2, KROKO.belly);
    fillBox(2, -6, 24, 9, 4, KROKO.skin, KROKO.dark);
    fillBox(4, 0, 21, 5, 2.5, KROKO.belly);
    for (let x = 8; x < 23; x += 3.5) poly([[x, 0], [x + 1.5, 3], [x + 3, 0]], KROKO.tooth);
    blob(24, -4, 1, KROKO.dark);
    ovalEdge(7, -7, 5, 5, KROKO.skin, KROKO.dark);
    dotEye(7.5, -7.5, dead, 1.8);
    featherWing(-6, 0, 0.35 + beat, KROKO.belly, KROKO.dark);
  }

  function drawShark({ beat, dead }) {
    const flick = dead ? 0 : Math.sin(time * 9) * 4 + beat * 3;
    poly([[-14, 2], [-27, -9 + flick], [-22, 3], [-27, 13 + flick], [-14, 6]], HAJ.skin, HAJ.dark);
    poly([[-6, -7], [0, -20], [5, -8]], HAJ.skin, HAJ.dark);
    ctx.beginPath();
    ctx.moveTo(-16, 4); ctx.quadraticCurveTo(-8, -10, 10, -8); ctx.quadraticCurveTo(22, -6, 24, 2);
    ctx.quadraticCurveTo(14, 13, -6, 11); ctx.closePath();
    ctx.fillStyle = HAJ.skin; ctx.fill();
    ctx.strokeStyle = HAJ.dark; ctx.lineWidth = 1.5; ctx.stroke();
    oval(4, 7, 14, 3.6, HAJ.belly);
    poly([[0, 7], [-4, 16], [6, 9]], HAJ.dark);
    ctx.strokeStyle = HAJ.gill; ctx.lineWidth = 1.2;
    seg(7, -4, 6, 2);
    seg(10, -4, 9, 2);
    dotEye(15, -3, dead, 1.6);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(12, 4); ctx.quadraticCurveTo(17, 6.5, 22, 3.5); ctx.stroke();
    for (const x of [13.5, 16.5, 19.3]) poly([[x, 4.6], [x + 1.2, 6.6], [x + 2.4, 4.6]], C.white);
  }

  function drawDolphin({ beat, dead }) {
    const flick = dead ? 0 : Math.sin(time * 8) * 4 + beat * 3;
    poly([[-13, 3], [-25, -6 + flick], [-21, 4], [-25, 13 + flick], [-13, 7]], DELFIN.skin, DELFIN.dark);
    poly([[-4, -8], [3, -18], [6, -8]], DELFIN.skin, DELFIN.dark);
    ctx.beginPath();
    ctx.moveTo(-15, 5); ctx.quadraticCurveTo(-6, -11, 8, -9); ctx.quadraticCurveTo(17, -7, 18, -1);
    ctx.lineTo(25, 1); ctx.quadraticCurveTo(24, 4, 18, 4); ctx.quadraticCurveTo(8, 13, -6, 11);
    ctx.closePath();
    ctx.fillStyle = DELFIN.skin; ctx.fill();
    ctx.strokeStyle = DELFIN.dark; ctx.lineWidth = 1.5; ctx.stroke();
    oval(3, 6.5, 11, 3.5, DELFIN.belly);
    poly([[0, 6], [-5, 14], [5, 9]], DELFIN.dark);
    dotEye(12, -3, dead, 1.6);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(16, 2.5); ctx.quadraticCurveTo(20, 4.5, 24, 2.2); ctx.stroke();
  }

  function drawTurtle({ boost, dead }) {
    // propellern ovanpå skalet
    ctx.strokeStyle = SKOLD.pole; ctx.lineWidth = 2;
    seg(-3, -10, -3, -17);
    const spin = dead ? 1 : Math.cos(time * (boost ? 60 : 35));
    oval(-3, -18, 12 * Math.abs(spin) + 1, 2.2, SKOLD.prop);
    blob(-3, -18, 1.8, SKOLD.pole);
    for (const lx of [-12, 4]) oval(lx, 8, 4, 3, SKOLD.skin);
    poly([[-16, 3], [-21, 5], [-16, 6]], SKOLD.skin);
    ovalEdge(14, -1, 6.5, 5.5, SKOLD.skin, SKOLD.skinEdge);
    dotEye(16, -2.5, dead, 1.5);
    smile(16, 0, 2, C.ink, 1.1);
    ctx.beginPath(); ctx.ellipse(-3, 3, 15, 12, 0, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = SKOLD.shell; ctx.fill();
    ctx.strokeStyle = SKOLD.edge; ctx.lineWidth = 1.5; ctx.stroke();
    for (const [x, y, r] of [[-3, -4, 3.6], [-10, -1, 2.6], [4, -1, 2.6], [-7, -8, 2], [1, -8, 2]]) blob(x, y, r, SKOLD.pattern);
    fillBox(-19, 2, 32, 4, 2, SKOLD.pattern, SKOLD.edge);
  }

  function drawLadybug({ boost, dead }) {
    const buzz = dead ? 0 : Math.sin(time * (boost ? 70 : 45)) * 0.45;
    for (const a of [-0.7, -0.2]) {
      ctx.save(); ctx.translate(-2, -6); ctx.rotate(a + buzz);
      ctx.beginPath(); ctx.ellipse(-10, -3, 11, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = NYCKEL.wing; ctx.fill();
      ctx.strokeStyle = NYCKEL.wingEdge; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = NYCKEL.black; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    seg(-6, 9, -9, 15);
    seg(0, 10, -1, 16);
    seg(6, 9, 8, 15);
    ovalEdge(13, 1, 7, 6.5, NYCKEL.black, NYCKEL.black);
    ctx.lineWidth = 1.3;
    seg(14, -4, 17, -12);
    seg(11, -4, 10, -12);
    blob(17, -12.5, 1.6, NYCKEL.black);
    blob(10, -12.5, 1.6, NYCKEL.black);
    if (dead) { xEye(13, 0, 1.6, C.white); xEye(17.5, 0.5, 1.6, C.white); } else {
      blob(13, 0, 2.2, C.white); blob(13.7, 0.3, 1.1, C.ink);
      blob(17.5, 0.5, 2, C.white); blob(18.1, 0.8, 1, C.ink);
    }
    ovalEdge(-1, 2, 14, 11, NYCKEL.red, NYCKEL.dark);
    oval(-4, -3, 5, 2.5, 'rgba(255,255,255,0.35)', -0.3);
    for (const [x, y, r] of [[-8, 0, 2.6], [2, -3, 2.4], [-3, 7, 2.6], [7, 5, 2.2], [-11, 7, 1.8]]) blob(x, y, r, NYCKEL.black);
  }

  function drawParrot({ beat, dead }) {
    colorWing(-6, 2, 0.8 + beat, PAPEG.wings, PAPEG.wingEdge, 0.9);
    poly([[-10, 8], [-27, 15], [-25, 19], [-8, 12]], PAPEG.wings[0], PAPEG.wingEdge);
    poly([[-10, 10], [-24, 21], [-20, 23], [-8, 13]], PAPEG.wings[1], PAPEG.wingEdge);
    ovalEdge(-2, 6, 11, 11, PAPEG.red, PAPEG.dark);
    ovalEdge(6, -7, 9, 9, PAPEG.red, PAPEG.dark);
    oval(9, -6, 4.5, 4, C.white);
    poly([[12, -9], [20, -5], [17, 1], [12, -2]], PAPEG.beak, PAPEG.beakDark);
    dotEye(9, -8, dead, 1.5);
    colorWing(-6, 2, 0.35 + beat, PAPEG.wings, PAPEG.wingEdge, 0.9);
  }

  function drawFlamingo({ beat, dead }) {
    featherWing(-6, 2, 0.8 + beat, FLAM.dark, FLAM.dark);
    ctx.strokeStyle = FLAM.dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
    seg(-6, 10, -22, 14);
    seg(-4, 11, -20, 18);
    ovalEdge(-4, 5, 12, 8, FLAM.pink, FLAM.dark);
    ctx.strokeStyle = FLAM.pink; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.bezierCurveTo(14, -2, 2, -14, 10, -18); ctx.stroke();
    ovalEdge(11, -19, 5, 4.5, FLAM.pink, FLAM.dark);
    poly([[14, -20], [21, -17], [19, -13], [15, -16]], FLAM.beakBase);
    poly([[18, -18.2], [21, -17], [19, -13], [17.5, -15]], FLAM.beak);
    dotEye(11.5, -20, dead, 1.3);
    featherWing(-6, 2, 0.35 + beat, FLAM.light, FLAM.dark);
  }

  function drawTiger({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, C.wingBack, C.wingEdge);
    ctx.strokeStyle = TIGER.fur; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, 10); ctx.bezierCurveTo(-26, 8, -25, -4, -19, -7); ctx.stroke();
    ctx.strokeStyle = TIGER.stripe; ctx.lineWidth = 2;
    seg(-23, 4, -26, 5);
    seg(-23, -2, -26, -2);
    for (const lx of [-10, 2]) { oval(lx, 19, 4, 4.5, TIGER.fur); oval(lx, 22, 4, 2, TIGER.white); }
    ovalEdge(-4, 10, 12.5, 9.5, TIGER.fur, TIGER.dark);
    oval(-1, 13, 7, 5.5, TIGER.white);
    ctx.strokeStyle = TIGER.stripe; ctx.lineWidth = 2.2;
    seg(-12, 4, -9, 8);
    seg(-8, 2, -6, 6);
    seg(-15, 10, -11, 12);
    for (const [x, y] of [[-4, -14], [10, -15]]) { ovalEdge(x, y, 4, 4, TIGER.fur, TIGER.dark); oval(x, y, 2, 2, TIGER.nose); }
    ovalEdge(3, -4, 12.5, 11, TIGER.fur, TIGER.dark);
    oval(9, 1, 7, 5, TIGER.white);
    ctx.strokeStyle = TIGER.stripe; ctx.lineWidth = 2;
    seg(1, -15, 2, -11);
    seg(5, -15.5, 5, -11.5);
    seg(-8, -6, -5, -5);
    seg(-8, -2, -5, -2);
    frontEye(3, -6, dead);
    frontEye(11, -6, dead);
    poly([[9, -1], [13, -1], [11, 1.5]], TIGER.nose);
    smile(11, 1.5, 2.2, C.ink, 1.2);
    featherWing(-8, 2, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawKoala({ beat, dead }) {
    // eukalyptusblad som vingar
    const leaf = (angle, color) => {
      ctx.save(); ctx.translate(-6, 0); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(-12, -2, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = KOALA.leafDark; ctx.lineWidth = 1.3; ctx.stroke();
      seg(0, 0, -24, -3);
      ctx.restore();
    };
    leaf(0.8 + beat, KOALA.leafDark);
    oval(-9, 18, 4, 4, KOALA.fur);
    oval(2, 18.5, 4, 4, KOALA.fur);
    ovalEdge(-3, 9, 12, 10, KOALA.fur, KOALA.dark);
    oval(0, 12, 6.5, 6, KOALA.light);
    for (const x of [-8, 13]) { ovalEdge(x, -12, 7, 7, KOALA.fur, KOALA.dark); oval(x, -12, 4.5, 4.5, KOALA.light); }
    ovalEdge(3, -4, 12, 10.5, KOALA.fur, KOALA.dark);
    oval(10, -1, 3.5, 5, KOALA.nose);
    dotEye(4, -7, dead, 1.6);
    dotEye(14, -7, dead, 1.6);
    leaf(0.35 + beat, KOALA.leaf);
  }

  function drawHedgehog({ beat, dead }) {
    featherWing(-6, 4, 0.8 + beat, C.wingBack, C.wingEdge);
    oval(-6, 16, 3.5, 3, IGEL.faceEdge);
    oval(4, 16.5, 3.5, 3, IGEL.faceEdge);
    ovalEdge(-2, 4, 14, 12, IGEL.spike, IGEL.spikeDark);
    // taggarna över ryggen
    const pts = [];
    for (let k = 0; k <= 16; k++) {
      const a = -Math.PI / 3 - k * (Math.PI * 1.15 / 16), r = k % 2 ? 21 : 14;
      pts.push([-2 + Math.cos(a) * r, 4 + Math.sin(a) * r]);
    }
    poly(pts, IGEL.spike, IGEL.spikeDark);
    oval(2, 10, 6, 4, IGEL.belly);
    ovalEdge(9, 4, 9, 8, IGEL.face, IGEL.faceEdge);
    poly([[12, 1], [22, 4], [13, 9]], IGEL.face);
    blob(22, 4, 2, IGEL.nose);
    frontEye(10, 1, dead);
    featherWing(-6, 4, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawMoose({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, C.wingBack, C.wingEdge);
    for (const lx of [-10, 1]) fillBox(lx - 2.5, 12, 5, 10, 2, ALG.fur, ALG.dark);
    ovalEdge(-4, 7, 13, 9, ALG.fur, ALG.dark);
    // skovlarna
    poly([[1, -11], [-6, -18], [-10, -25], [-6, -22], [-4, -27], [-1, -21], [2, -26], [4, -15]], ALG.antler, ALG.antlerEdge);
    poly([[9, -12], [11, -22], [13, -28], [15, -22], [19, -26], [18, -17], [13, -11]], ALG.antler, ALG.antlerEdge);
    poly([[0, -9], [-5, -12], [-1, -6]], ALG.fur, ALG.dark);
    ovalEdge(6, -5, 8, 8, ALG.fur, ALG.dark);
    ovalEdge(14, -1, 7, 5.5, ALG.muzzle, ALG.dark, 0.2);
    blob(19, -1, 1, ALG.dark);
    frontEye(8, -7, dead);
    // halsduk i blått och gult
    fillBox(-2, -1, 13, 4, 2, ALG.blue);
    ctx.fillStyle = ALG.yellow; ctx.fillRect(-1, 0.5, 11, 1.2);
    poly([[-1, 1], [-6, 9], [-2, 10], [2, 2]], ALG.blue);
    featherWing(-8, 2, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawChick({ beat, dead }) {
    colorWing(-7, 5, 0.8 + beat * 1.4, [KYCK.dark, KYCK.dark, KYCK.dark], KYCK.dark, 0.7);
    ovalEdge(1, 1, 14, 14, KYCK.yellow, KYCK.dark);
    poly([[-1, -13], [1, -19], [3, -13]], KYCK.yellow, KYCK.dark);
    poly([[2, -13], [6, -18], [6, -12]], KYCK.yellow, KYCK.dark);
    // äggskalet hon kläcktes ur
    ctx.beginPath();
    ctx.moveTo(-13.5, 6);
    [[-9, 3], [-5, 7], [-1, 3], [3, 7], [7, 3], [11, 7], [14.5, 4]].forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(14.5, 10); ctx.quadraticCurveTo(0.5, 23, -13.5, 10); ctx.closePath();
    ctx.fillStyle = KYCK.shell; ctx.fill();
    ctx.strokeStyle = KYCK.shellEdge; ctx.lineWidth = 1.5; ctx.stroke();
    frontEye(4, -4, dead);
    frontEye(11, -4, dead);
    poly([[9, 0], [16, 1.5], [9, 3.5]], KYCK.beak);
    oval(2, 1, 2, 1.3, KYCK.cheek);
    colorWing(-7, 5, 0.35 + beat * 1.4, [KYCK.yellow, KYCK.yellow, KYCK.yellow], KYCK.dark, 0.7);
  }

  function drawBat({ beat, dead }) {
    leatherWing(-4, 0, 0.75 + beat, FLADDER.dark, FLADDER.dark);
    ctx.strokeStyle = FLADDER.dark; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    seg(-3, 15, -5, 19);
    seg(2, 15, 2, 19);
    ovalEdge(-1, 6, 9, 10, FLADDER.body, FLADDER.dark);
    poly([[-4, -10], [-6, -22], [1, -13]], FLADDER.body, FLADDER.dark);
    poly([[-3.5, -12], [-4.8, -19], [0, -13.5]], FLADDER.inner);
    poly([[5, -12], [10, -22], [11, -9]], FLADDER.body, FLADDER.dark);
    poly([[6.5, -12], [9.5, -19], [10, -10.5]], FLADDER.inner);
    ovalEdge(3, -5, 9.5, 8.5, FLADDER.body, FLADDER.dark);
    frontEye(2, -6, dead);
    frontEye(8, -6, dead);
    blob(6, -1, 1.3, FLADDER.dark);
    poly([[4, 1.5], [5, 4.5], [6, 1.5]], FLADDER.fang);
    poly([[7, 1.5], [8, 4.5], [9, 1.5]], FLADDER.fang);
    leatherWing(-4, 0, 0.3 + beat, FLADDER.wing, FLADDER.dark);
  }

  function drawPirate({ boost, dead }) {
    // tunnan han rider på, med en eldsvans bakåt
    if (!dead) {
      const f = boost ? 1.4 : 0.8 + Math.sin(time * 30) * 0.15;
      poly([[-14, 10], [-14 - 12 * f, 14], [-14, 18]], PIRAT.flame);
      poly([[-14, 12], [-14 - 6 * f, 14], [-14, 16]], PIRAT.core);
    }
    fillBox(-14, 8, 26, 12, 5, PIRAT.barrel, PIRAT.barrelDark);
    ctx.fillStyle = PIRAT.band;
    ctx.fillRect(-8, 8.5, 2.5, 11);
    ctx.fillRect(4, 8.5, 2.5, 11);
    fillBox(-1, 5, 5, 11, 2, PIRAT.pants);
    fillBox(-6, -6, 14, 13, 4, PIRAT.shirt, '#c9c9d6');
    ctx.fillStyle = PIRAT.stripe;
    for (const y of [-3, 1]) ctx.fillRect(-5.5, y, 13, 2);
    oval(10, -1, 5, 2.2, PIRAT.skin);
    blob(14.5, -1.5, 2.2, PIRAT.skin);
    ovalEdge(2, -14, 7.5, 7.5, PIRAT.skin, PIRAT.skinEdge);
    oval(3, -9, 6, 3.2, PIRAT.beard);
    ctx.beginPath(); ctx.ellipse(1.5, -18, 8, 4.5, 0, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = PIRAT.bandana; ctx.fill();
    poly([[-6, -17], [-12, -13], [-9, -19]], PIRAT.bandana);
    ctx.strokeStyle = PIRAT.patch; ctx.lineWidth = 1;
    seg(-4, -18, 9, -12);
    blob(6, -15, 2.3, PIRAT.patch);
    dotEye(0.5, -15, dead, 1.3);
    smile(3, -11.5, 2, C.ink, 1.1);
  }

  function drawNinja({ boost, dead }) {
    const wave = dead ? 0 : Math.sin(time * (boost ? 22 : 12));
    // pannbandets snibbar fladdrar bakåt
    ctx.strokeStyle = NINJA.band; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, -14); ctx.quadraticCurveTo(-14, -16 + wave * 3, -24, -12 + wave * 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, -12); ctx.quadraticCurveTo(-13, -9 - wave * 3, -22, -6 - wave * 2); ctx.stroke();
    oval(-16, 11, 7.5, 3.2, NINJA.dark);
    oval(-15, 7, 7.5, 3.2, NINJA.suit);
    ovalEdge(-4, 6, 12, 7.5, NINJA.suit, NINJA.dark);
    fillBox(-7, 5, 4, 6, 1.5, NINJA.band);
    oval(11, 1, 7, 3, NINJA.suit);
    blob(18, 0, 3.2, NINJA.suit);
    ovalEdge(4, -9, 9, 9, NINJA.suit, NINJA.dark);
    fillBox(-1, -12.5, 14, 5, 2.5, NINJA.skin);
    if (dead) { xEye(3, -10, 1.6); xEye(9, -10, 1.6); } else {
      blob(3, -10, 1.3, C.ink);
      blob(9, -10, 1.3, C.ink);
    }
    fillBox(-5, -16, 17, 3, 1.5, NINJA.band);
  }

  function drawKnight({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, C.wingBack, C.wingEdge);
    for (const lx of [-9, -1]) fillBox(lx, 12, 5, 9, 2, RIDDARE.metal, RIDDARE.dark);
    ovalEdge(-3, 6, 11, 10, RIDDARE.metal, RIDDARE.dark);
    oval(-6, 3, 3, 6, RIDDARE.shine);
    oval(-3, -20, 8, 3.5, RIDDARE.plume, -0.4);
    ovalEdge(3, -9, 9, 9.5, RIDDARE.metal, RIDDARE.dark);
    oval(0, -13, 2.5, 3.5, RIDDARE.shine, -0.3);
    fillBox(4, -12, 9, 6, 2, RIDDARE.dark);
    if (dead) xEye(8.5, -9, 1.7, C.white);
    else { ctx.fillStyle = C.ink; ctx.fillRect(6, -10, 6, 1.4); }
    ovalEdge(10, 6, 6, 7.5, RIDDARE.shield, RIDDARE.shieldEdge);
    ctx.fillStyle = RIDDARE.cross;
    ctx.fillRect(9, 1, 2, 10);
    ctx.fillRect(6, 4.5, 8, 2);
    featherWing(-8, 2, 0.35 + beat, C.wing, C.wingEdge);
  }

  function drawWizard({ boost, dead }) {
    const wave = dead ? 0 : Math.sin(time * (boost ? 18 : 9)) * 3;
    ctx.beginPath();
    ctx.moveTo(-4, -4); ctx.quadraticCurveTo(-18, 2 + wave, -24, 14 + wave); ctx.lineTo(8, 16);
    ctx.quadraticCurveTo(10, 4, 6, -4); ctx.closePath();
    ctx.fillStyle = TROLL.robe; ctx.fill();
    ctx.strokeStyle = TROLL.dark; ctx.lineWidth = 1.5; ctx.stroke();
    star(-8, 8, 2.6, TROLL.star);
    star(0, 12, 2, TROLL.star);
    star(-15, 12, 1.8, TROLL.star);
    // staven med en lysande kula
    ctx.strokeStyle = TROLL.staff; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    seg(12, 14, 18, -12);
    ctx.globalAlpha = dead ? 0.2 : 0.35 + 0.15 * Math.sin(time * 5);
    blob(18.5, -14, 6, TROLL.orb);
    ctx.globalAlpha = 1;
    blob(18.5, -14, 3, C.white);
    blob(14, 2, 2.6, TROLL.skin);
    ovalEdge(3, -8, 7.5, 7.5, TROLL.skin, TROLL.skinEdge);
    poly([[-3, -6], [9, -6], [5, 7], [1, 9]], TROLL.beard, TROLL.beardEdge);
    dotEye(1.5, -9, dead, 1.2);
    dotEye(6, -9, dead, 1.2);
    poly([[-7, -12], [13, -12], [5, -22], [-4, -31], [-1, -21]], TROLL.robe, TROLL.dark);
    fillBox(-9, -14, 23, 3.5, 1.7, TROLL.dark);
    star(3, -18, 2.4, TROLL.star);
    if (boost && !dead) for (const [x, y] of [[22, -20], [25, -10]]) star(x, y, 1.8, TROLL.star);
  }

  function drawWitch({ dead }) {
    // kvasten med riset bakåt
    ctx.strokeStyle = HAXA.broom; ctx.lineWidth = 3; ctx.lineCap = 'round';
    seg(-14, 12, 22, 8);
    poly([[-14, 9], [-28, 4], [-30, 12], [-27, 20], [-14, 15]], HAXA.bristle, HAXA.bristleEdge);
    fillBox(-15, 9, 3, 7, 1, HAXA.band);
    ctx.beginPath();
    ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.lineTo(10, 12); ctx.quadraticCurveTo(0, 15, -10, 12); ctx.closePath();
    ctx.fillStyle = HAXA.dress; ctx.fill();
    ctx.strokeStyle = HAXA.dark; ctx.lineWidth = 1.5; ctx.stroke();
    oval(7, 15, 4, 2.5, HAXA.dark);
    oval(9, 4, 5, 2.2, HAXA.dress, 0.5);
    blob(12, 8, 2.3, HAXA.skin);
    oval(-4, -8, 6, 8, HAXA.hair, 0.3);
    poly([[-4, -12], [-14, -6], [-8, -2]], HAXA.hair);
    ovalEdge(2, -10, 7, 7, HAXA.skin, HAXA.skinEdge);
    poly([[7, -11], [11, -8], [7, -8]], HAXA.skin, HAXA.skinEdge, 1);
    dotEye(1.5, -11, dead, 1.2);
    dotEye(5, -11, dead, 1.2);
    smile(3.5, -8, 2, C.ink, 1.1);
    oval(1, -16, 11, 2.6, HAXA.hat);
    poly([[-5, -16], [8, -16], [3, -24], [-6, -31], [-2, -23]], HAXA.hat);
    ctx.fillStyle = HAXA.band; ctx.fillRect(-4.5, -19, 12, 2);
  }

  function drawMermaid({ beat, dead }) {
    const f = dead ? 0 : (Math.sin(time * 8) * 5 + beat * 4) * 0.4;
    oval(-6, -8, 6, 10, SJOJ.hairDark, 0.6);
    poly([[-3, -14], [-16, -10 + f], [-10, -2]], SJOJ.hair);
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-12, 4, -18, 8 + f); ctx.lineTo(-16, 13 + f);
    ctx.quadraticCurveTo(-8, 12, 4, 8); ctx.closePath();
    ctx.fillStyle = SJOJ.tail; ctx.fill();
    ctx.strokeStyle = SJOJ.tailDark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = SJOJ.scale; ctx.lineWidth = 1.2;
    for (const [x, y] of [[-2, 5], [-7, 6], [-12, 8.5]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI); ctx.stroke(); }
    poly([[-17, 9 + f], [-27, 2 + f * 1.5], [-24, 11 + f], [-27, 19 + f * 1.5], [-16, 13 + f]], SJOJ.fin, SJOJ.tailDark);
    oval(2, -2, 5, 6, SJOJ.skin);
    ovalEdge(0.5, -3, 2.5, 2, SJOJ.top, SJOJ.topEdge);
    ovalEdge(4.5, -3, 2.5, 2, SJOJ.top, SJOJ.topEdge);
    oval(8, 0, 5, 2, SJOJ.skin, -0.3);
    ovalEdge(3, -12, 7, 7, SJOJ.skin, SJOJ.skinEdge);
    oval(0, -17, 7, 3.5, SJOJ.hair);
    oval(-3, -12, 3, 6, SJOJ.hair);
    dotEye(4, -12.5, dead, 1.2);
    dotEye(8, -12.5, dead, 1.2);
    oval(3, -9.5, 1.5, 0.9, '#ff9eb8');
    smile(6, -10, 1.8, C.ink, 1.1);
    if (!dead) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
      for (const [x, y, r] of [[16, -16, 2], [20, -21, 1.4]]) { ctx.beginPath(); ctx.arc(x, y - (time * 6) % 4, r, 0, Math.PI * 2); ctx.stroke(); }
    }
  }

  function drawSnowman({ beat, dead }) {
    // pinnarmarna flaxar som vingar
    const a = beat * 0.9;
    ctx.strokeStyle = SNO.stick; ctx.lineWidth = 2; ctx.lineCap = 'round';
    seg(-8, 2, -22, -6 - a * 10);
    seg(-17, -3 - a * 6, -20, -10 - a * 8);
    seg(10, 1, 22, -4 - a * 6);
    ovalEdge(-1, 10, 13, 11, SNO.snow, SNO.edge);
    blob(2, 6, 1.5, SNO.coal);
    blob(3, 11, 1.5, SNO.coal);
    ovalEdge(2, -8, 9, 8.5, SNO.snow, SNO.edge);
    fillBox(-6, -2, 16, 4, 2, SNO.scarf);
    poly([[-4, 0], [-9, 9], [-5, 10], [-1, 2]], SNO.scarf, SNO.scarfDark, 1);
    if (dead) { xEye(1, -10, 1.6); xEye(6, -10, 1.6); } else {
      blob(1, -10, 1.5, SNO.coal);
      blob(6, -10, 1.5, SNO.coal);
    }
    poly([[6, -7], [17, -5], [6, -4.5]], SNO.carrot);
    for (const x of [0, 2.5, 5]) blob(x, -3.8 + Math.abs(x - 2.5) * -0.3, 0.7, SNO.coal);
    fillBox(-5, -24, 13, 9, 1.5, SNO.hat);
    fillBox(-8, -16, 19, 3, 1.5, SNO.hat);
    ctx.fillStyle = SNO.band; ctx.fillRect(-5, -18.5, 13, 2);
    if (!dead) for (const [x, y, k] of [[-18, 14, 0], [18, 12, 2]]) star(x, y, 1.6 + 0.6 * Math.sin(time * 4 + k), SNO.snow);
  }

  function drawPanda({ boost, dead }) {
    if (!dead) {
      for (let k = 1; k <= 3; k++) {
        ctx.globalAlpha = (boost ? 0.7 : 0.35) / k;
        blob(-22 - k * 8, 17 + Math.sin(time * 4 + k) * 1.5, 6 - k, PANDA.white);
      }
      ctx.globalAlpha = 1;
    }

    oval(-8, 5, 3.5, 5.5, PANDA.black, 0.4);
    ovalEdge(-1, 6, 11, 10, PANDA.white, PANDA.edge);
    oval(-6, 13, 4.5, 3.5, PANDA.black);
    oval(5, 13.5, 4.5, 3.5, PANDA.black);

    // molnet: först en kant, sedan vitt ovanpå, så att puffarna smälter ihop
    const bob = Math.sin(time * 3);
    const puffs = [[-14, 17, 6.5], [-4, 19, 8], [8, 18, 7.5], [17, 16, 5.5], [2, 13, 6]];
    for (const [x, y, r] of puffs) blob(x, y + bob, r + 1.5, PANDA.cloudEdge);
    for (const [x, y, r] of puffs) blob(x, y + bob, r, PANDA.white);

    ctx.strokeStyle = PANDA.bamboo; ctx.lineWidth = 3; ctx.lineCap = 'round';
    seg(9, 8, 15, -8);
    oval(16, -9, 2, 5, PANDA.bamboo, 0.8);
    oval(10, 5, 3.5, 5, PANDA.black, -0.4);

    blob(-7, -17, 4.5, PANDA.black);
    blob(10, -18, 4.5, PANDA.black);
    ovalEdge(2, -8, 12, 10.5, PANDA.white, PANDA.edge);
    oval(-1.5, -8, 3.6, 4.6, PANDA.black, 0.5);
    oval(7.5, -8, 3.6, 4.6, PANDA.black, -0.5);
    if (dead) {
      xEye(-1.5, -8, 2, C.white);
      xEye(7.5, -8, 2, C.white);
    } else {
      blob(-1, -8.5, 1.7, C.white);
      blob(8, -8.5, 1.7, C.white);
      blob(-0.6, -8.3, 0.8, PANDA.black);
      blob(8.4, -8.3, 0.8, PANDA.black);
    }
    oval(3, -3, 2.2, 1.6, PANDA.black);
    ctx.strokeStyle = PANDA.black; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(3, -1, 2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    oval(-4, -2, 2.2, 1.3, PANDA.cheek);
    oval(10, -2, 2.2, 1.3, PANDA.cheek);
  }

  function drawOwl({ beat, dead }) {
    featherWing(-8, 2, 0.8 + beat, UGGLA.wingBack, UGGLA.edge);
    oval(-5, 23, 3, 2, UGGLA.beak);
    oval(3, 23, 3, 2, UGGLA.beak);
    poly([[-10, -12], [-12, -23], [-3, -15]], UGGLA.body, UGGLA.edge);
    poly([[6, -15], [13, -24], [12, -11]], UGGLA.body, UGGLA.edge);
    ovalEdge(-1, 4, 14, 18, UGGLA.body, UGGLA.edge);
    oval(1, 10, 9, 10, UGGLA.belly);
    ctx.strokeStyle = UGGLA.wingBack; ctx.lineWidth = 1.2;
    for (const [vx, vy] of [[-3, 6], [3, 8], [-1, 13], [5, 14]]) {
      ctx.beginPath(); ctx.moveTo(vx - 2, vy - 1.5); ctx.lineTo(vx, vy); ctx.lineTo(vx + 2, vy - 1.5); ctx.stroke();
    }
    oval(-2, -6, 7, 6.5, UGGLA.face);
    oval(7, -6, 7, 6.5, UGGLA.face);
    if (dead) {
      xEye(-2, -6, 3);
      xEye(7, -6, 3);
    } else {
      for (const ex of [-2, 7]) {
        blob(ex, -6, 5, C.white);
        blob(ex + 1, -6, 3.2, UGGLA.iris);
        blob(ex + 1, -6, 1.7, C.ink);
        blob(ex + 1.8, -7, 0.7, C.white);
      }
    }
    poly([[1.5, -2.5], [4.5, -2.5], [3, 1.5]], UGGLA.beak);
    featherWing(-8, 4, 0.35 + beat, UGGLA.wing, UGGLA.edge);
  }

  function drawRobot({ beat, boost, dead }) {
    if (!dead) {
      const len = (boost ? 16 : 7) + Math.sin(time * 45) * 2;
      for (const fx of [-7, 5]) {
        poly([[fx - 3.5, 23], [fx + 3.5, 23], [fx, 23 + len]], ROBOT.flame);
        poly([[fx - 2, 23], [fx + 2, 23], [fx, 23 + len * 0.55]], ROBOT.core);
      }
    }
    const arm = (sx, angle) => {
      ctx.save(); ctx.translate(sx, 3); ctx.rotate(angle);
      rr(0, -2.5, 11, 5, 2.5); ctx.fillStyle = ROBOT.metal; ctx.fill();
      ctx.strokeStyle = ROBOT.edge; ctx.lineWidth = 1.2; ctx.stroke();
      blob(12, 0, 3, ROBOT.dark);
      ctx.restore();
    };
    arm(-13, Math.PI + 0.4 + beat * 0.6);
    for (const lx of [-10, 3]) {
      rr(lx, 15, 6, 7, 2); ctx.fillStyle = ROBOT.dark; ctx.fill();
      rr(lx - 1, 20, 8, 4, 1.5); ctx.fillStyle = ROBOT.edge; ctx.fill();
    }
    rr(-13, -1, 26, 18, 4);
    ctx.fillStyle = ROBOT.metal; ctx.fill();
    ctx.strokeStyle = ROBOT.edge; ctx.lineWidth = 1.5; ctx.stroke();
    rr(-7, 3, 14, 9, 2); ctx.fillStyle = ROBOT.screen; ctx.fill();
    ROBOT.lights.forEach((col, k) => {
      ctx.globalAlpha = dead ? 0.3 : 0.5 + 0.5 * Math.sin(time * 5 + k * 2);
      blob(-3.5 + k * 3.5, 7.5, 1.4, col);
    });
    ctx.globalAlpha = 1;
    arm(13, -0.4 - beat * 0.6);

    ctx.strokeStyle = ROBOT.edge; ctx.lineWidth = 1.5; seg(1, -21, 1, -27);
    ctx.globalAlpha = dead ? 0.4 : 0.6 + 0.4 * Math.sin(time * 6);
    blob(1, -28, 2.2, ROBOT.lights[0]);
    ctx.globalAlpha = 1;
    rr(-10, -21, 22, 18, 5);
    ctx.fillStyle = ROBOT.metal; ctx.fill();
    ctx.strokeStyle = ROBOT.edge; ctx.lineWidth = 1.5; ctx.stroke();
    blob(-10, -12, 2, ROBOT.dark);
    blob(12, -12, 2, ROBOT.dark);
    rr(-6, -18, 16, 9, 3); ctx.fillStyle = ROBOT.screen; ctx.fill();
    if (dead) {
      xEye(-1, -13.5, 2, ROBOT.eye);
      xEye(6, -13.5, 2, ROBOT.eye);
    } else {
      blob(-1, -13.5, 2.4, ROBOT.eye);
      blob(6, -13.5, 2.4, ROBOT.eye);
    }
    ctx.strokeStyle = ROBOT.edge; ctx.lineWidth = 1.2;
    for (const gx of [-3, 0, 3, 6]) seg(gx, -7, gx, -4.5);
  }

  function drawLion({ boost, dead }) {
    const by = -30 + Math.sin(time * 2) * 1.5;
    ctx.strokeStyle = LEJON.rope; ctx.lineWidth = 1;
    seg(-10, 6, -11, by + 12);
    seg(10, 6, 11, by + 12);

    // ballongen med ränder
    const envelope = () => {
      ctx.beginPath();
      ctx.arc(0, by, 15, Math.PI * 0.8, Math.PI * 0.2);
      ctx.lineTo(5, by + 17); ctx.lineTo(-5, by + 17);
      ctx.closePath();
    };
    envelope(); ctx.fillStyle = LEJON.balloon; ctx.fill();
    ctx.save(); envelope(); ctx.clip();
    ctx.fillStyle = LEJON.stripe;
    ctx.fillRect(-9, by - 16, 5, 34);
    ctx.fillRect(4, by - 16, 5, 34);
    ctx.restore();
    envelope(); ctx.strokeStyle = LEJON.edge; ctx.lineWidth = 1.5; ctx.stroke();
    if (boost && !dead) {
      oval(0, by + 21, 2.5, 4 + Math.sin(time * 40), '#ff9f1c');
      oval(0, by + 21, 1.2, 2, '#ffe066');
    }

    // huvudet med man sticker upp ur korgen
    for (let k = 0; k < 10; k++) {
      const a = k * Math.PI / 5;
      blob(2 + Math.cos(a) * 9, -2 + Math.sin(a) * 9, 5.5, LEJON.mane);
    }
    blob(-4, -10, 3, LEJON.fur);
    blob(9, -10, 3, LEJON.fur);
    blob(2, -2, 8.5, LEJON.fur);
    oval(5, 1.5, 5, 3.5, LEJON.muzzle);
    poly([[3.5, -0.5], [7.5, -0.5], [5.5, 1.5]], LEJON.nose);
    if (dead) {
      xEye(-1, -4, 2);
      xEye(6, -4, 2);
    } else {
      oval(-1, -4, 1.5, 1.9, C.ink);
      oval(6, -4, 1.5, 1.9, C.ink);
    }
    blob(-6, 6, 2.6, LEJON.fur);
    blob(10, 6, 2.6, LEJON.fur);

    rr(-12, 6, 24, 16, 3);
    ctx.fillStyle = LEJON.basket; ctx.fill();
    ctx.strokeStyle = LEJON.basketDark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineWidth = 1;
    seg(-12, 11, 12, 11); seg(-12, 16, 12, 16);
    seg(-4, 6, -4, 22); seg(4, 6, 4, 22);
  }

  function drawCow({ beat, dead }) {
    const wings = [KO.wing, KO.wing, KO.wing];
    colorWing(-8, -2, 0.8 + beat, wings, KO.wingEdge, 0.75);
    ctx.strokeStyle = KO.edge; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-16, 6); ctx.quadraticCurveTo(-22, 10, -20, 18); ctx.stroke();
    blob(-20, 19, 2.5, KO.spot);
    for (const lx of [-12, -4, 4]) {
      rr(lx, 13, 5, 10, 2); ctx.fillStyle = KO.white; ctx.fill();
      ctx.strokeStyle = KO.edge; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = KO.spot; ctx.fillRect(lx, 20, 5, 3);
    }
    ovalEdge(-3, 7, 15, 10, KO.white, KO.edge);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(-3, 7, 15, 10, 0, 0, Math.PI * 2); ctx.clip();
    blob(-10, 3, 5.5, KO.spot);
    blob(2, 12, 4.5, KO.spot);
    blob(-1, 0, 3, KO.spot);
    ctx.restore();
    oval(-2, 16.5, 4, 2.5, KO.muzzle);
    ctx.strokeStyle = KO.spot; ctx.lineWidth = 1.5; seg(5, 3, 10, 6);
    blob(9, 7.5, 2.6, KO.bell);

    poly([[2, -13], [0, -19], [6, -15]], KO.horn, KO.edge, 1);
    poly([[11, -15], [14, -20], [15, -13]], KO.horn, KO.edge, 1);
    ovalEdge(0, -10, 4, 2.2, KO.white, KO.edge, -0.5);
    ovalEdge(17, -11, 4, 2.2, KO.white, KO.edge, 0.5);
    ovalEdge(8, -6, 10, 9, KO.white, KO.edge);
    oval(4, -9, 4, 4, KO.spot);
    ovalEdge(13, -1, 7, 5, KO.muzzle, KO.muzzleEdge);
    blob(11, -1, 1.1, KO.muzzleEdge);
    blob(15, -1, 1.1, KO.muzzleEdge);
    frontEye(5, -8, dead);
    frontEye(12, -8, dead);
    colorWing(-8, -2, 0.35 + beat, wings, KO.wingEdge, 0.8);
  }

  function drawCamel({ beat, dead }) {
    // mattan böljar under kamelen
    const wave = x => 15 + Math.sin(x * 0.22 + time * (dead ? 0 : 8)) * 1.6 + beat * 1.5;
    ctx.beginPath();
    for (let x = -22; x <= 24; x += 2) { if (x === -22) ctx.moveTo(x, wave(x)); else ctx.lineTo(x, wave(x)); }
    for (let x = 24; x >= -22; x -= 2) ctx.lineTo(x, wave(x) + 5);
    ctx.closePath();
    ctx.fillStyle = KAMEL.carpet; ctx.fill();
    ctx.strokeStyle = KAMEL.pattern; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -19; x <= 21; x += 2) { if (x === -19) ctx.moveTo(x, wave(x) + 2.5); else ctx.lineTo(x, wave(x) + 2.5); }
    ctx.stroke();
    ctx.strokeStyle = KAMEL.fringe;
    for (const fx of [-22, 24]) for (let k = 0; k < 3; k++) seg(fx, wave(fx) + 1 + k * 1.5, fx + (fx < 0 ? -3 : 3), wave(fx) + 1 + k * 1.5);

    oval(-10, 13, 6, 3, KAMEL.dark);
    oval(6, 13, 6, 3, KAMEL.dark);
    ovalEdge(-6, -2, 8, 7, KAMEL.hump, KAMEL.dark);
    ovalEdge(-3, 6, 14, 8, KAMEL.fur, KAMEL.dark);
    ctx.strokeStyle = KAMEL.dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
    seg(-16, 4, -19, 10);
    ctx.strokeStyle = KAMEL.fur; ctx.lineWidth = 7;
    seg(6, 3, 12, -9);
    ovalEdge(14, -13, 7, 5.5, KAMEL.fur, KAMEL.dark);
    oval(19, -11, 4, 3.5, KAMEL.muzzle);
    blob(21, -12, 0.9, KAMEL.dark);
    oval(10, -17, 2, 3, KAMEL.dark, -0.4);
    sideEye(14, -15, dead);
    ctx.strokeStyle = KAMEL.dark; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(19, -9.5, 2, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }

  function drawAlien({ boost, dead }) {
    if (boost && !dead) poly([[-8, 9], [8, 9], [16, 30], [-16, 30]], ALIEN.beam);
    ctx.strokeStyle = ALIEN.dark; ctx.lineWidth = 1.5;
    seg(-3, -16, -6, -22);
    seg(3, -16, 6, -22);
    blob(-6, -22, 1.8, ALIEN.skin);
    blob(6, -22, 1.8, ALIEN.skin);
    ovalEdge(0, -10, 8, 7.5, ALIEN.skin, ALIEN.dark);
    if (dead) {
      xEye(-3, -10, 2);
      xEye(3.5, -10, 2);
    } else {
      oval(-3, -10, 2.6, 3.4, ALIEN.eye, -0.3);
      oval(3.5, -10, 2.6, 3.4, ALIEN.eye, 0.3);
      blob(-2.4, -11.4, 0.9, C.white);
      blob(4.1, -11.4, 0.9, C.white);
    }
    ctx.strokeStyle = ALIEN.dark; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0.5, -6, 2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

    ctx.beginPath(); ctx.arc(0, -4, 13, Math.PI, 0); ctx.closePath();
    ctx.fillStyle = ALIEN.dome; ctx.fill();
    ctx.strokeStyle = ALIEN.domeEdge; ctx.lineWidth = 1.5; ctx.stroke();
    ovalEdge(0, 2, 24, 7, ALIEN.saucer, ALIEN.saucerDark);
    oval(0, 5.5, 13, 3, ALIEN.saucerDark);
    for (let k = 0; k < 5; k++) {
      ctx.globalAlpha = dead ? 0.3 : 0.55 + 0.45 * Math.sin(time * 6 + k * 1.3);
      blob(-16 + k * 8, 2.5, 1.8, ALIEN.lights[(k + Math.floor(time * 3)) % 3]);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Sakerna och lådan ----------
  // Varje sak ritas kring (0, 0) med ungefär radien ITEM_R.

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
    blob(-2.5, -3, 1.6, '#ffffff');
    ctx.restore();
  }

  function drawDiamond() {
    poly([[-10, -4], [-5, -10], [5, -10], [10, -4], [0, 11]], '#7fe3ff', '#2a9cc4');
    ctx.strokeStyle = '#2a9cc4'; ctx.lineWidth = 1;
    seg(-10, -4, 10, -4);
    seg(-5, -10, -2, -4); seg(5, -10, 2, -4);
    seg(-2, -4, 0, 11); seg(2, -4, 0, 11);
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 5);
    star(5, -8, 3.5, '#ffffff');
    ctx.globalAlpha = 1;
  }

  function drawItem(kind, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    ITEMS[kind].draw();
    ctx.restore();
  }

  function drawItems() {
    for (const it of items) {
      const y = it.y + Math.sin(time * 3 + it.phase) * 4;
      blob(it.x, y, 17, 'rgba(255,255,255,0.35)');
      drawItem(it.kind, it.x, y);
    }
    // krafterna i en bubbla som pulserar, så att de syns från sakerna
    for (const it of powers) {
      const y = it.y + Math.sin(time * 3 + it.phase) * 4, r = 19 + Math.sin(time * 6 + it.phase) * 1.5;
      blob(it.x, y, r, 'rgba(255,255,255,0.55)');
      ctx.strokeStyle = C.white; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(it.x, y, r, 0, Math.PI * 2); ctx.stroke();
      drawPower(it.kind, it.x, y);
    }
  }

  function drawPower(kind, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    POWERS[kind].draw();
    ctx.restore();
  }

  // Ikonerna ritas kring (0, 0), ungefär lika stora som sakerna.
  function drawShieldIcon() {
    poly([[0, -12], [10, -8], [9, 3], [0, 12], [-9, 3], [-10, -8]], C.blue, C.blueEdge, 2);
    poly([[0, -9], [7, -6], [6.5, 2], [0, 8]], 'rgba(255,255,255,0.3)');
    const star = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.2 : 5;
      star.push([Math.cos(a) * r, -1 + Math.sin(a) * r]);
    }
    poly(star, C.white);
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

  // En medalj med band, med mitten vid (x, y) och radien r.
  function drawMedal(m, x, y, r) {
    poly([[x - r * 0.9, y - r * 1.7], [x - r * 0.2, y - r * 1.7], [x + r * 0.3, y - r * 0.5], [x - r * 0.4, y - r * 0.5]], '#2f80ed');
    poly([[x + r * 0.2, y - r * 1.7], [x + r * 0.9, y - r * 1.7], [x + r * 0.4, y - r * 0.5], [x - r * 0.3, y - r * 0.5]], '#e63946');
    ovalEdge(x, y, r, r, m.color, C.ink);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, Math.PI * 2); ctx.stroke();
    blob(x - r * 0.35, y - r * 0.35, r * 0.22, 'rgba(255,255,255,0.7)');
  }

  // En medalj och dess namn, centrerade kring x.
  function drawMedalLine(m, x, y, size, text, opts) {
    ctx.font = `${opts.weight ?? ''} ${size}px ${opts.font ?? DISPLAY}`.trim();
    const r = size * 0.5, tw = ctx.measureText(text).width, left = x - (tw + r * 2 + 8) / 2;
    drawMedal(m, left + r, y, r);
    say(text, left + r * 2 + 8, y + 1, size, { ...opts, align: 'left' });
  }

  // Ringar som sprids från figuren när den flyger in i en ny värld; de skymmer inga hinder.
  function drawPortal() {
    const k = (time - worldShownAt) / 0.7;
    if (k < 0 || k >= 1) return;
    for (const [lag, col] of [[0, C.banana], [0.18, C.white]]) {
      const r = Math.max(0, k - lag) * 520;
      if (!r) continue;
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = col; ctx.lineWidth = 10 * (1 - k) + 2;
      ctx.beginPath(); ctx.arc(player.x, player.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Poängen för en upplockad sak stiger och tonar bort.
  function drawPopups() {
    popups = popups.filter(p => time - p.at < 0.8);
    for (const p of popups) {
      const k = (time - p.at) / 0.8;
      ctx.globalAlpha = 1 - k;
      say(p.text, p.x, p.y - 14 - k * 30, p.size || 22, { fill: p.color || C.banana });
    }
    ctx.globalAlpha = 1;
  }

  function drawCrate(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(scale, scale);
    rr(-14, -11, 28, 22, 3); ctx.fillStyle = '#c08a4a'; ctx.fill();
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineWidth = 1.5;
    seg(-14, -4, 14, -4);
    seg(-14, 4, 14, 4);
    seg(-9, -11, -9, 11);
    seg(9, -11, 9, 11);
    ctx.restore();
  }

  // En rad med lådan och vad som finns i den: antal per sak, från x och åt höger.
  function drawBoxRow(counts, x, y, { color = C.white, stroke = C.ink, step = 52, empty = '' } = {}) {
    drawCrate(x, y, 0.85);
    let cx = x + 26;
    if (!counts.some(n => n > 0)) {
      if (empty) say(empty, cx, y + 1, 14, { font: BODY, weight: '800', fill: color, stroke, align: 'left' });
      return;
    }
    counts.forEach((n, i) => {
      if (!n) return;
      drawItem(i, cx + 9, y, 0.75);
      say(String(n), cx + 21, y + 1, 15, { font: BODY, weight: '800', fill: color, stroke, align: 'left' });
      cx += step;
    });
  }

  function drawFigure(index, x, y, { angle = 0, scale = 1, beat = 0, boost = false, dead = false } = {}) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    CHARACTERS[index].draw({ beat, boost, dead });
    ctx.restore();
  }

  function drawPlayer() {
    if (state === 'ready') return;
    const p = player;
    const dead = state === 'over';
    // blinkar medan skölden just har tagit en krock
    if (!dead && time < safeUntil && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.35;
    drawFigure(charIndex, p.x, p.y, {
      angle: state === 'ready' ? 0 : Math.max(-0.45, Math.min(1.25, p.vy / 560)),
      beat: dead ? 0.1 : Math.sin(time * (p.flapT > 0 ? 30 : 11)) * 0.6,
      boost: p.flapT > 0,
      dead,
    });
    ctx.globalAlpha = 1;
    if (shield && !dead) {
      blob(p.x, p.y, 25, 'rgba(120,200,255,0.22)');
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 25, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // Krafterna som verkar just nu, uppe till vänster under världens namn.
  function drawActivePowers() {
    let x = UI_L + 20;
    const y = UI_T + 52;
    POWERS.forEach((pw, i) => {
      const left = pw.left();
      if (left <= 0) return;
      rr(x, y, 34, 34, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      drawPower(i, x + 17, y + 17, 0.85);
      if (pw.secs) {
        rr(x + 3, y + 38, 28 * left, 5, 2.5);
        ctx.fillStyle = C.banana; ctx.fill();
      }
      x += 40;
    });
  }

  // ---------- Text, knappar och rutor ----------

  // Startskärmens två knappar högst upp.
  // Startskärmen: stor figur och Starta i mitten, tre knappar längst ner och
  // en bricka med figur och nivå uppe till höger.
  // Brickorna sitter i skärmens övre hörn och knapparna mot underkanten; de räknas
  // fram varje gång, eftersom skärmen kan ändra storlek.
  const BTN_W = 118, BTN_H = 60;
  const bottomBtn = x => ({ x, y: UI_B - 74, w: BTN_W, h: BTN_H });
  const figuresBtn = () => bottomBtn(14);
  const settingsBtn = () => bottomBtn((W - BTN_W) / 2);
  const scoresBtn = () => bottomBtn(W - 14 - BTN_W);
  const startBtn = () => ({ x: W / 2 - 110, y: 386 + MID, w: 220, h: 64 });
  const levelBadge = () => ({ x: UI_R - 14 - 120, y: UI_T + 14, w: 120, h: 44 });
  // medaljerna i mitten, så att knappen tillbaka till spelväljaren får hörnet; båda
  // brickorna är smala nog att få plats bredvid den på en mobil
  const medalBadge = () => ({ x: W / 2 - 58, y: UI_T + 14, w: 116, h: 44 });

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
    const label = (b, text) => say(text, b.x + b.w / 2, b.y + 46, 14, { font: BODY, weight: '800', fill: C.ink, stroke: null });
    const fig = figuresBtn(), set = settingsBtn(), top = scoresBtn();
    drawButtonFrame(fig, false);
    drawFigure(charIndex, fig.x + BTN_W / 2, fig.y + 21, { scale: 0.48, beat: Math.sin(time * 6) * 0.4 });
    label(fig, 'Figurer');
    drawButtonFrame(set, false);
    drawGear(set.x + BTN_W / 2, set.y + 21);
    label(set, 'Inställningar');
    drawButtonFrame(top, false);
    drawTrophy(top.x + BTN_W / 2, top.y + 8);
    label(top, 'Topplista');
  }

  function drawLevelBadge() {
    const b = levelBadge();
    drawButtonFrame(b, false);
    drawFigure(charIndex, b.x + 26, b.y + 23, { scale: 0.48, beat: Math.sin(time * 6) * 0.4 });
    say(`Nivå ${bestLevel}`, b.x + 50, b.y + 23, 19, { fill: C.ink, stroke: null, align: 'left' });
  }

  // Medaljsamlingen uppe till vänster: hur många av varje; de man inte har är bleka.
  function drawMedalBadge() {
    const b = medalBadge();
    drawButtonFrame(b, false);
    MEDALS.forEach((m, i) => {
      const x = b.x + 16 + i * 34;
      ctx.globalAlpha = medalCount[i] ? 1 : 0.35;
      drawMedal(m, x, b.y + 25, 9);
      ctx.globalAlpha = 1;
      say(String(medalCount[i]), x + 12, b.y + 25, 15, { font: BODY, weight: '800', fill: C.ink, stroke: null, align: 'left' });
    });
  }

  function drawStartButton() {
    const b = startBtn(), press = 1 + Math.sin(time * 3) * 0.02;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(press, press);
    rr(-b.w / 2, -b.h / 2, b.w, b.h, b.h / 2);
    ctx.fillStyle = C.banana; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    say('Starta', 0, 2, 34, { fill: C.ink, stroke: null });
    ctx.restore();
  }

  // Knappen Figurer öppnar samlingen: de figurer man har och
  // de som är kvar att få. Ett tryck väljer en egen figur eller köper en låst.
  const FIG_PANEL = { x: 20, y: 20, w: 360, h: 566 };
  const FIG_CLOSE = { x: W / 2 - 80, y: FIG_PANEL.y + FIG_PANEL.h - 54, w: 160, h: 44 };
  const FIG_COLS = 5, FIG_W = 62, FIG_H = 54, FIG_GAP = 4;
  const FIG_X = FIG_PANEL.x + (FIG_PANEL.w - (FIG_COLS * FIG_W + (FIG_COLS - 1) * FIG_GAP)) / 2;

  // Samlingens två delar med rubrik och rutnät, uppdelade på sidor när de inte får
  // plats; pilarna längst ner bläddrar. Rutorna räknas fram varje gång, så att
  // ritning och tryck alltid stämmer med varandra.
  let figPage = 0;
  const FIG_TOP = FIG_PANEL.y + 76, FIG_BOTTOM = FIG_CLOSE.y - 26;
  const FIG_PREV = { x: FIG_PANEL.x + 14, y: FIG_CLOSE.y, w: 44, h: 44 };
  const FIG_NEXT = { x: FIG_PANEL.x + FIG_PANEL.w - 58, y: FIG_CLOSE.y, w: 44, h: 44 };
  function figureLayout() {
    // första gången är de tre startfigurerna valbara; sedan de egna
    const owned = PICKER.filter(isUnlocked);
    const missing = PICKER.filter(ci => !owned.includes(ci) && !CHARACTERS[ci].gift);
    const firstTitle = choosingFirst() ? 'Välj din första figur' : `Dina figurer (${owned.length})`;
    const parts = [[firstTitle, owned, true]];
    // har man alla figurer behövs ingen rad för dem som är kvar
    if (missing.length || choosingFirst()) parts.push([`Kvar att få (${missing.length})`, missing, false]);

    // rubriker och rader läggs ut sida för sida; en del som fortsätter på nästa sida får sin rubrik igen
    const pages = [{ sections: [], cells: [] }];
    let y = FIG_TOP;
    const newPage = () => { pages.push({ sections: [], cells: [] }); y = FIG_TOP; };
    const ROW = FIG_H + FIG_GAP;
    for (const [title, list, mine] of parts) {
      if (y + 20 + ROW > FIG_BOTTOM) newPage();
      pages[pages.length - 1].sections.push({ title, y });
      y += 20;
      const rows = Math.max(1, Math.ceil(list.length / FIG_COLS));
      for (let r = 0; r < rows; r++) {
        if (y + ROW > FIG_BOTTOM) { newPage(); pages[pages.length - 1].sections.push({ title, y }); y += 20; }
        list.slice(r * FIG_COLS, (r + 1) * FIG_COLS).forEach((ci, k) => pages[pages.length - 1].cells.push({
          ci, mine, x: FIG_X + k * (FIG_W + FIG_GAP), y, w: FIG_W, h: FIG_H,
        }));
        y += ROW;
      }
      y += 6;
    }
    figPage = Math.min(figPage, pages.length - 1);
    return { ...pages[figPage], pageCount: pages.length, empty: !owned.length };
  }

  function drawPageArrow(b, dir, enabled) {
    rr(b.x, b.y, b.w, b.h, b.h / 2);
    ctx.fillStyle = enabled ? C.banana : C.locked; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    poly([[cx - 5 * dir, cy - 8], [cx + 7 * dir, cy], [cx - 5 * dir, cy + 8]], enabled ? C.ink : 'rgba(29,43,31,0.35)');
  }

  function drawFigures() {
    const P = FIG_PANEL, { sections, cells, pageCount } = figureLayout();
    dim();
    drawPanel(P, 'Figurer');
    const total = CHARACTERS.filter(c => !c.gift || unlocked.has(c.id)).length;
    const pageText = pageCount > 1 ? ` · sida ${figPage + 1} av ${pageCount}` : '';
    const coinsLine = `${choosingFirst() ? 0 : unlocked.size} av ${total} figurer · ${blueCoins} blå mynt${pageText}`;
    say(coinsLine, W / 2 + 9, P.y + 58, 13, { font: BODY, weight: '800', fill: C.dirt, stroke: null });
    ctx.font = `800 13px ${BODY}`;
    drawItem(BLUE, W / 2 + 9 - ctx.measureText(coinsLine).width / 2 - 12, P.y + 58, 0.6);

    for (const sec of sections) say(sec.title, FIG_X, sec.y + 6, 15, { fill: C.ink, stroke: null, align: 'left' });

    for (const c of cells) {
      const chosen = c.mine && c.ci === charIndex;
      rr(c.x, c.y, c.w, c.h, 10);
      ctx.fillStyle = chosen ? C.banana : c.mine ? C.panelRow : C.locked; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = chosen ? 3 : 1.5; ctx.stroke();
      const cx = c.x + c.w / 2;
      if (c.mine) {
        drawFigure(c.ci, cx, c.y + 22, { scale: 0.42, beat: chosen ? Math.sin(time * 11) * 0.6 : 0 });
      } else {
        ctx.globalAlpha = 0.3;
        drawFigure(c.ci, cx, c.y + 22, { scale: 0.42 });
        ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(cx, c.y + 22); ctx.scale(0.55, 0.55); drawPadlock(0, 0); ctx.restore();
        drawPriceTag(c.x + c.w - 3, c.y + 3, figurePrice(c.ci));
      }
      say(CHARACTERS[c.ci].name, cx, c.y + c.h - 8, 10, { font: BODY, weight: '800', fill: C.ink, stroke: null });
    }

    // en rad om vad ett tryck gör, eller vad som just hände
    const note = time - startMsg.at < 1.8 ? startMsg.text
      : choosingFirst() ? 'Du väljer bara en gång; andra figurer köper du med blå mynt'
      : 'Tryck på en låst figur för att köpa den; priset står i hörnet';
    say(note, W / 2, FIG_CLOSE.y - 14, 12, { font: BODY, weight: '800', fill: C.dirt, stroke: null });
    drawCloseButton(FIG_CLOSE);
    if (pageCount > 1) {
      drawPageArrow(FIG_PREV, -1, figPage > 0);
      drawPageArrow(FIG_NEXT, 1, figPage < pageCount - 1);
    }
  }

  function turnFigPage(step) {
    const { pageCount } = figureLayout();
    const next = Math.max(0, Math.min(pageCount - 1, figPage + step));
    if (next !== figPage) { figPage = next; sfx.click(); }
  }

  // Priset i blå mynt i hörnet på en låst figur, med högerkanten vid `right`;
  // grönt när man har råd. Myntet står still här, till skillnad från i spelet.
  function drawPriceTag(right, y, price) {
    const afford = !choosingFirst() && blueCoins >= price, w = price < 10 ? 26 : 31, x = right - w;
    rr(x, y, w, 15, 7.5);
    ctx.fillStyle = afford ? C.on : C.white; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ovalEdge(x + 7.5, y + 7.5, 4.5, 4.5, C.blue, C.blueEdge);
    blob(x + 6.3, y + 6.2, 1.4, 'rgba(255,255,255,0.8)');
    say(String(price), x + 13 + (w - 13) / 2, y + 8, 11, { font: BODY, weight: '800', fill: afford ? C.white : C.ink, stroke: null });
  }

  function tapFigures(p) {
    const { cells, pageCount } = figureLayout();
    if (pageCount > 1 && inside(p, FIG_PREV)) return turnFigPage(-1);
    if (pageCount > 1 && inside(p, FIG_NEXT)) return turnFigPage(1);
    const cell = cells.find(c => inside(p, c));
    if (cell) {
      if (cell.mine) pickFigure(cell.ci);
      else if (choosingFirst()) { startMsg = { text: 'Välj din första figur först', at: time }; sfx.click(); }
      else buyFigure(cell.ci);
      return;
    }
    if (inside(p, FIG_CLOSE) || !inside(p, FIG_PANEL)) closeOverlay();
  }

  // Inställningar: ljudeffekter och musik.
  const SETTINGS_PANEL = { x: 36, y: 130, w: 328, h: 264 };
  const SETTINGS_CLOSE = { x: W / 2 - 80, y: SETTINGS_PANEL.y + SETTINGS_PANEL.h - 54, w: 160, h: 44 };
  const settingsRow = i => ({ x: SETTINGS_PANEL.x + 12, y: SETTINGS_PANEL.y + 62 + i * 76, w: SETTINGS_PANEL.w - 24, h: 66 });

  function drawSwitch(x, y, on) {
    rr(x, y, 64, 34, 17);
    ctx.fillStyle = on ? C.on : C.off; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    say(on ? 'På' : 'Av', on ? x + 21 : x + 43, y + 18, 13, { font: BODY, weight: '800', fill: on ? C.white : C.ink, stroke: null });
    blob(on ? x + 47 : x + 17, y + 17, 12, C.white);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(on ? x + 47 : x + 17, y + 17, 12, 0, Math.PI * 2); ctx.stroke();
  }

  function drawSettings() {
    const P = SETTINGS_PANEL;
    dim();
    drawPanel(P, 'Inställningar');
    const rows = [
      { label: 'Ljudeffekter', note: 'Flax, poäng, saker och krasch', on: sfx.sfxOn },
      { label: 'Musik', note: 'Varje värld har sin egen låt', on: sfx.musicOn },
    ];
    rows.forEach((row, i) => {
      const r = settingsRow(i);
      if (i) { ctx.fillStyle = C.panelRow; ctx.fillRect(r.x + 8, r.y - 6, r.w - 16, 2); }
      say(row.label, r.x + 12, r.y + 22, 20, { fill: C.ink, stroke: null, align: 'left' });
      say(row.note, r.x + 12, r.y + 46, 12, { font: BODY, weight: '800', fill: C.dirt, stroke: null, align: 'left' });
      drawSwitch(r.x + r.w - 76, r.y + 16, row.on);
    });
    drawCloseButton(SETTINGS_CLOSE);
  }

  // Topplistans ruta.
  const PANEL = { x: 36, y: 78, w: 328, h: 440 };
  const closeButton = panel => ({ x: W / 2 - 80, y: panel.y + panel.h - 54, w: 160, h: 44 });
  const CLOSE_BTN = closeButton(PANEL);

  function dim() { fillScreen('rgba(16,41,27,0.55)'); }

  function drawPanel(panel, title) {
    rr(panel.x, panel.y, panel.w, panel.h, 20);
    ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    say(title, W / 2, panel.y + 32, 30, { fill: C.ink, stroke: null });
  }

  function drawCloseButton(b) {
    rr(b.x, b.y, b.w, b.h, 22);
    ctx.fillStyle = C.ink; ctx.fill();
    say('Stäng', W / 2, b.y + b.h / 2 + 1, 20, { fill: C.white, stroke: null });
  }

  function drawButtonFrame(b, active) {
    rr(b.x, b.y, b.w, b.h, 12);
    ctx.fillStyle = active ? C.banana : C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  }

  function drawPadlock(cx, cy) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy - 3, 8, Math.PI, Math.PI * 2); ctx.stroke();
    rr(cx - 12, cy - 4, 24, 19, 4);
    ctx.fillStyle = C.banana; ctx.fill();
    ctx.lineWidth = 2.5; ctx.stroke();
    blob(cx, cy + 4, 2.6, C.ink);
  }

  function drawBoard(footer) {
    dim();
    drawPanel(PANEL, 'Topp 10');
    const where = {
      loading: 'Hämtar listan…',
      ready: 'Alla som spelar',
      error: 'Listan går inte att hämta just nu',
    }[mode];
    say(where, W / 2, PANEL.y + 62, 13, { font: BODY, weight: '800', fill: C.dirt, stroke: null });

    const list = board();
    if (!list.length && mode === 'ready') {
      say('Ingen på listan än', W / 2, PANEL.y + 190, 24, { fill: C.ink, stroke: null });
      say('Spela och bli först!', W / 2, PANEL.y + 222, 16, { font: BODY, weight: '800', fill: C.dirt, stroke: null });
    }

    list.forEach((e, i) => {
      const y = PANEL.y + 80 + i * 28;
      const mine = sameEntry(e, savedEntry);
      if (mine || i % 2 === 0) {
        rr(PANEL.x + 12, y, PANEL.w - 24, 26, 13);
        ctx.fillStyle = mine ? C.banana : C.panelRow; ctx.fill();
        if (mine) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      }
      if (i < 3) blob(PANEL.x + 32, y + 13, 10, C.medals[i]);
      say(String(i + 1), PANEL.x + 32, y + 14, 16, { fill: C.ink, stroke: null });
      drawFigure(CHARACTERS.findIndex(c => c.id === e.figure), PANEL.x + 64, y + 16, { scale: 0.38 });
      say(e.name, PANEL.x + 86, y + 14, 16, { font: BODY, weight: '800', fill: C.ink, stroke: null, align: 'left' });
      say(String(e.score), PANEL.x + PANEL.w - 26, y + 14, 18, { fill: C.ink, stroke: null, align: 'right' });
    });

    if (footer === 'close') drawCloseButton(CLOSE_BTN);
    else if (time - overAt > 0.6) say('Tryck för att spela igen', W / 2, CLOSE_BTN.y + 22, 20, { fill: C.ink, stroke: null });
  }

  function drawOver() {
    if (overlay === 'entry') { dim(); return; }
    if (pendingEntry) { say('Krasch!', W / 2, 130, 56, { fill: C.banana }); return; }
    if (afterSave) { drawBoard('again'); return; }

    const pw = 250, ph = 262, px = W / 2 - pw / 2, py = 165;
    say('Krasch!', W / 2, 122, 56, { fill: C.banana });

    rr(px, py, pw, ph, 18);
    ctx.fillStyle = C.panel; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();

    say('POÄNG', W / 2 - 60, py + 38, 14, { font: BODY, weight: '800', fill: C.dirt, stroke: null });
    say('REKORD', W / 2 + 60, py + 38, 14, { font: BODY, weight: '800', fill: C.dirt, stroke: null });
    say(String(score), W / 2 - 60, py + 85, 50, { fill: C.ink, stroke: null });
    say(String(best), W / 2 + 60, py + 85, 50, { fill: C.ink, stroke: null });

    // lådans innehåll den här omgången
    drawBoxRow(box, px + 28, py + 128, { color: C.ink, stroke: null, step: 32, empty: 'Lådan är tom' });

    // medaljen den här omgången, eller vad som ger nästa
    if (medal >= 0) drawMedalLine(MEDALS[medal], W / 2, py + 170, 22, MEDALS[medal].name + '!', { fill: C.ink, stroke: null });
    else say(`${MEDALS[0].at} poäng ger en bronsmedalj`, W / 2, py + 170, 14, { font: BODY, weight: '800', fill: C.dirt, stroke: null });

    if (newBest) {
      rr(W / 2 - 70, py + 202, 140, 34, 17);
      ctx.fillStyle = C.banana; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
      say('Nytt rekord!', W / 2, py + 220, 18, { fill: C.ink, stroke: null });
    } else {
      say('Samla saker i lådan för fler poäng', W / 2, py + 220, 14, { font: BODY, weight: '800', fill: C.dirt, stroke: null });
    }

    if (time - overAt > 0.6) say('Tryck för att spela igen', W / 2, py + ph + 44, 22);
  }

  function drawHud() {
    if (state === 'playing') {
      say(String(score), UI_R - 20, UI_T + 40, 46, { align: 'right' });
      const left = nextWorldAt - score;
      say(`${left} till nästa värld`, UI_R - 20, UI_T + 76, 13, { font: BODY, weight: '800', align: 'right' });
      // vilken värld, och hur många man har flugit genom den här omgången
      say(`${worldName()} – ${worldStep + 1} av ${WORLDS.length}`, UI_L + 20, UI_T + 38, 18, { align: 'left' });
      drawActivePowers();
      drawBoxRow(box, UI_L + 30, Math.min(H - GROUND + 46, UI_B - 24), { empty: 'Samla saker i lådan!' });

      // medaljen när man når den, som tonar bort
      const mk = (time - medalShownAt) / 1.8;
      if (medal >= 0 && mk >= 0 && mk < 1) {
        ctx.globalAlpha = mk < 0.75 ? 1 : (1 - mk) * 4;
        drawMedalLine(MEDALS[medal], W / 2, UI_T + 128, 26, MEDALS[medal].name + '!', { fill: MEDALS[medal].color });
        ctx.globalAlpha = 1;
      }

      // "Ny värld!" och världens namn, som tonar bort efter en stund
      const k = (time - worldShownAt) / 2;
      if (k >= 0 && k < 1) uiFrame(() => {
        ctx.globalAlpha = k < 0.75 ? 1 : (1 - k) * 4;
        say('Ny värld!', W / 2, 196, 40, { fill: C.banana });
        say(worldName(), W / 2, 238, 26);
        say(`+${WORLD_BONUS} blå mynt`, W / 2, 272, 18, { fill: C.blue });
        if (worldNews()) say(worldNews(), W / 2, 302, 18);
        ctx.globalAlpha = 1;
      });
    }

    uiFrame(() => {
      if (paused && !overlay) {
        say('Pausat', W / 2, 190, 48, { fill: C.banana });
        say('Tryck för att fortsätta', W / 2, 236, 22);
      }

      if (state === 'ready') {
        drawTitle('Flappy Game', W / 2, 112, 52);
        // den valda figuren, stor
        drawFigure(charIndex, W / 2, 244 + Math.sin(time * 3) * 6, { scale: 2.6, beat: Math.sin(time * 9) * 0.6 });
        say(CHARACTERS[charIndex].name, W / 2, 348, 26);
        if (giftNote) say(giftNote, W / 2, 374, 15, { font: BODY, weight: '800', fill: GULD.crown });
      }

      if (state === 'over') drawOver();
    });
  }

  function draw() {
    const t = theme();
    drawSky(t);
    for (const p of pipes) OBSTACLES[p.kind].draw(p);
    drawGround(t.ground);
    drawItems();
    drawPlayer();
    // slow motion färgar världen lite blå
    if (state === 'playing' && time < slowUntil) fillScreen('rgba(120,170,255,0.14)');
    drawPortal();
    drawPopups();
    drawHud();
    if (flash > 0) fillScreen(`rgba(255,255,255,${flash * 0.7})`);
    if (overlay === 'scores') uiFrame(() => drawBoard('close'));
    if (overlay === 'settings') uiFrame(drawSettings);
    if (overlay === 'figures') uiFrame(drawFigures);
    if (state === 'ready' && !overlay) { drawStartButton(); drawStartButtons(); drawLevelBadge(); drawMedalBadge(); }
  }

  // ---------- Styrning och loop ----------

  function toWorld(e) {
    const r = canvas.getBoundingClientRect();
    return { x: VX0 + (e.clientX - r.left) / r.width * VW, y: VY0 + (e.clientY - r.top) / r.height * VH };
  }


  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (overlay === 'entry') return;
    canvas.focus({ preventScroll: true });
    sfx.unlock();
    const p = toWorld(e);
    // rutorna ritas flyttade med MID
    const q = { x: p.x, y: p.y - MID };
    if (overlay === 'figures') return tapFigures(q);
    if (state === 'ready' && !overlay) {
      // på startskärmen startar bara Starta; knapparna öppnar sina rutor
      if (inside(p, startBtn())) return flap();
      if (inside(p, figuresBtn()) || inside(p, levelBadge())) return openOverlay('figures');
      if (inside(p, settingsBtn())) return openOverlay('settings');
      if (inside(p, scoresBtn())) return openOverlay('scores');
      return;
    }
    if (overlay === 'settings') {
      if (inside(q, settingsRow(0))) return sfx.toggleSfx();
      if (inside(q, settingsRow(1))) return sfx.toggleMusic();
      if (inside(q, SETTINGS_CLOSE) || !inside(q, SETTINGS_PANEL)) closeOverlay();
      return;
    }
    if (overlay === 'scores') {
      if (inside(q, CLOSE_BTN) || !inside(q, PANEL)) closeOverlay();
      return;
    }
    flap();
  });

  window.addEventListener('keydown', e => {
    if (overlay === 'entry') { if (e.code === 'Escape') closeEntry(); return; }
    sfx.unlock();
    if (e.code === 'KeyM') { e.preventDefault(); sfx.toggleSfx(); return; }
    if (e.code === 'KeyN') { e.preventDefault(); sfx.toggleMusic(); return; }
    if (overlay === 'scores') {
      if (['Escape', 'KeyT', 'Enter', 'Space'].includes(e.code)) { e.preventDefault(); closeOverlay(); }
      return;
    }
    if (overlay === 'figures' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
      e.preventDefault();
      turnFigPage(e.code === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (overlay === 'settings' || overlay === 'figures') {
      if (['Escape', 'Enter', 'Space', 'KeyF'].includes(e.code)) { e.preventDefault(); closeOverlay(); }
      return;
    }
    if (state === 'ready' && e.code === 'KeyF') { e.preventDefault(); openOverlay('figures'); return; }
    if (state === 'ready' && e.code === 'KeyT') { e.preventDefault(); openOverlay('scores'); return; }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || (state === 'ready' && e.code === 'Enter')) {
      e.preventDefault();
      if (!e.repeat) flap();
    }
  });

  let last = 0;
  // Knappen tillbaka till spelväljaren syns bara på startskärmen, när ingen ruta är
  // öppen; under spelet står världens namn i hörnet.
  const backLink = document.getElementById('back');
  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
    last = now;
    update(dt);
    draw();
    const showBack = state === 'ready' && !overlay;
    if (backLink && backLink.hidden === showBack) backLink.hidden = !showBack;
    sfx.tickMusic([world().song, world().fallback]);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
