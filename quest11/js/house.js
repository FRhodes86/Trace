// The Hateno house: a hand-composed room where every piece of furniture has its own place, plus a Hall of Fame.
// Owned furniture is drawn in full colour; furniture not yet owned shows as a faint silhouette in its spot, so the
// room itself shows what there is left to earn. Tap anything to see what it is, or to buy it.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const S = () => State.s;
  const UI = () => Game.ui;
  const K = CATALOG;
  const I = '#1d1a2b';
  const today = () => new Date().toISOString().slice(0, 10);
  const fmt = n => n.toLocaleString('en-GB');

  // Put any standalone SVG (artwork or item icon) inside the room at x, y with size w × h.
  const place = (svgStr, x, y, w, h, extra = '') => svgStr.replace(/^<svg[^>]*?(viewBox="[^"]*")[^>]*>/, (m, vb) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" ${vb} preserveAspectRatio="xMidYMax meet" overflow="visible" ${extra}>`);
  const icon = id => K.DECOR.find(d => d.id === id).emoji;

  /* ---------------- room-scale furniture ---------------- */
  const PIECES = {
    fire: () => `<path d="M52,165 V84 h78 V165" fill="#8f8a7a" stroke="${I}" stroke-width="1.6"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(r => [0, 1, 2, 3].map(c => `<rect x="${53 + c * 19.4 + (r % 2 ? 9 : 0)}" y="${86 + r * 11.4}" width="18" height="10" rx="2" fill="${(r + c) % 3 ? '#a8a290' : '#9a9482'}" opacity=".9"/>`).join('')).join('')}
      <path d="M68,165 V122 Q91,100 114,122 V165Z" fill="#1d1410" stroke="${I}" stroke-width="1.4"/>
      <g class="hearth-fire"><path d="M74,165 Q70,148 80,138 Q80,150 88,146 Q86,132 96,126 Q98,142 104,144 Q110,152 106,165Z" fill="#ff9a2e" stroke="#c2381c" stroke-width="1"/><path d="M84,165 Q82,154 90,148 Q94,156 98,154 Q100,160 98,165Z" fill="#ffe17a"/></g>
      <path d="M72,165 h40" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="91" cy="150" rx="34" ry="22" fill="#ff9a2e" opacity=".12" class="hearth-glow"/>`,
    painting: () => `<rect x="138" y="44" width="30" height="40" rx="1.5" fill="#c9a227" stroke="${I}" stroke-width="1.4"/><rect x="141.5" y="47.5" width="23" height="33" fill="#9ec9e8"/>${place(ART.zelda(), 141.5, 48, 23, 33)}<rect x="141.5" y="47.5" width="23" height="33" fill="none" stroke="#7a5a10" stroke-width="1"/>`,
    lamp: () => `<path d="M200,0 V14" stroke="#3a2a1a" stroke-width="1.6"/><path d="M178,22 Q200,12 222,22 Q200,28 178,22Z" fill="#c9a227" stroke="${I}" stroke-width="1.2"/>
      ${[182, 192, 208, 218].map(x => `<rect x="${x - 1.4}" y="12" width="2.8" height="8" fill="#f4f2ea" stroke="${I}" stroke-width=".5"/><path d="M${x},12 q-2,-4 0,-7 q2,3 0,7" fill="#ffd23d" class="candle"/>`).join('')}
      <ellipse cx="200" cy="34" rx="70" ry="30" fill="#ffe8a0" opacity=".1"/>`,
    ritochime: () => `<path d="M250,0 V14" stroke="#7a5230" stroke-width="1"/><g class="chime">${place(icon('ritochime'), 238, 12, 24, 30)}</g>`,
    rack: () => {
      const ws = S().ownedWeapons.slice(0, 9);
      return `<rect x="258" y="28" width="64" height="52" rx="2" fill="#7a5230" stroke="${I}" stroke-width="1.4"/><rect x="261" y="31" width="58" height="46" fill="#9c6b3d"/>
        <path d="M261,44 h58 M261,62 h58" stroke="#6b4423" stroke-width="1"/>
        ${ws.map((w, i) => place(K.WEAPONS.find(x => x.id === w).emoji, 260 + (i % 5) * 11.4, 30 + Math.floor(i / 5) * 23, 16, 24)).join('')}
        <rect x="270" y="81" width="40" height="9" rx="2" fill="#5a3a22" stroke="#c9a227" stroke-width=".6"/><text x="290" y="87.6" text-anchor="middle" font-size="5.5" fill="#ffe680" font-weight="700">${ws.length} weapon${ws.length === 1 ? '' : 's'}</text>`;
    },
    trophies: () => {
      const s = S();
      const got = STORY.regions.filter(r => s.bosses[r.id]);
      return `<path d="M256,106 h68 v4 h-68z" fill="#6b4423" stroke="${I}" stroke-width="1"/><path d="M262,110 l-2,6 M318,110 l2,6" stroke="#6b4423" stroke-width="2"/>
        ${STORY.regions.map((r, i) => s.bosses[r.id] ? place(ART.blight(r.element), 258 + i * 14, 88, 14, 18) : `<path d="M${263 + i * 14},106 v-8 h4 v8" fill="#c9a227" opacity=".3"/>`).join('')}
        ${s.calamity ? place(ART.calamity(), 312, 84, 14, 22) : ''}
        <rect x="264" y="112" width="52" height="8" rx="2" fill="#5a3a22" stroke="#c9a227" stroke-width=".6"/><text x="290" y="118" text-anchor="middle" font-size="5" fill="#ffe680" font-weight="700">${got.length}/4 Blights${s.calamity ? ' + Ganon' : ''}</text>`;
    },
    aquarium: () => `<rect x="258" y="140" width="62" height="25" fill="#7a5230" stroke="${I}" stroke-width="1.2"/><path d="M289,140 V165" stroke="#5a3a22"/>
      <rect x="261" y="122" width="56" height="20" rx="2" fill="#7fc8ec" fill-opacity=".85" stroke="${I}" stroke-width="1.2"/>
      <g class="fish-swim"><path d="M270,132 q4,-4 8,0 q-4,4 -8,0z M278,132 l3,-2 v4z" fill="#ff8a2a"/><path d="M296,129 q3,-3 6,0 q-3,3 -6,0z" fill="#3fb0ff"/></g>
      <path d="M264,142 Q266,134 265,130 M312,142 Q314,136 313,132" stroke="#4fbf4a" stroke-width="1.6" fill="none"/>`,
    books: () => `<rect x="326" y="52" width="32" height="113" fill="#6b4423" stroke="${I}" stroke-width="1.4"/>
      ${[70, 98, 126, 152].map(y => `<path d="M328,${y} h28" stroke="#4a3022" stroke-width="2"/>`).join('')}
      ${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => `<rect x="${329 + c * 5.4}" y="${55 + r * 28 + (c % 2) * 2}" width="4.4" height="${13 - (c % 2) * 2}" fill="${['#c63b4f', '#2f55b5', '#4f9a34', '#c9a227', '#7a3aa0'][(r + c) % 5]}" stroke="${I}" stroke-width=".4"/>`).join('')).join('')}`,
    table: () => `<path d="M168,160 h64 l4,6 h-72z" fill="#9c6b3d" stroke="${I}" stroke-width="1.2"/><path d="M172,166 V184 M228,166 V184" stroke="#7a5230" stroke-width="3"/>
      <path d="M156,168 v16 M162,168 v16 M156,170 h6 M238,168 v16 M244,168 v16 M238,170 h6" stroke="#8a5a2b" stroke-width="2"/><path d="M155,156 v14 M245,156 v14" stroke="#8a5a2b" stroke-width="2.4"/>
      <circle cx="186" cy="157" r="3" fill="#e8402e" stroke="${I}" stroke-width=".6"/><path d="M206,152 h10 v6 h-10z" fill="#f4f2ea" stroke="${I}" stroke-width=".6"/><path d="M208,152 v-3" stroke="#ffd23d" stroke-width="1.4"/>`,
    rug: () => `<ellipse cx="205" cy="214" rx="72" ry="20" fill="#c63b4f" stroke="${I}" stroke-width="1.2"/><ellipse cx="205" cy="214" rx="60" ry="15" fill="none" stroke="#ffd23d" stroke-width="2"/><ellipse cx="205" cy="214" rx="40" ry="9" fill="none" stroke="#2f55b5" stroke-width="1.6"/><path d="M198,214 l7,-5 l7,5 l-7,5z" fill="#ffd23d"/>`,
    bed: () => `<path d="M8,186 L30,168 h82 l-12,22 z" fill="#7a5230" stroke="${I}" stroke-width="1.2"/>
      <path d="M8,186 h92 v22 h-92z" fill="#9c6b3d" stroke="${I}" stroke-width="1.2"/>
      <path d="M12,182 L32,170 h76 L98,188 H14z" fill="#f4f2ea" stroke="${I}" stroke-width="1"/>
      <path d="M40,170 h68 L98,188 H34Z" fill="#3a6ad0" stroke="${I}" stroke-width="1"/><path d="M50,176 h46 M46,182 h46" stroke="#5a8af0" stroke-width="1"/>
      <path d="M16,180 Q18,170 30,170 Q36,174 32,182Z" fill="#ffffff" stroke="${I}" stroke-width="1"/>
      <path d="M8,160 V224 M100,190 V224" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/><path d="M8,164 Q20,156 34,166" stroke="#5a3a22" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    pot: () => place(icon('pot'), 312, 186, 46, 46),
    plant: () => place(icon('plant'), 362, 158, 34, 36),
    korokstatue: () => place(icon('korokstatue'), 132, 142, 22, 27),
    goldstatue: () => `<ellipse cx="300" cy="200" rx="18" ry="5" fill="#ffd23d" opacity=".25" class="hearth-glow"/>${place(icon('goldstatue'), 278, 150, 44, 54)}`,
    goronruby: () => `<path d="M6,124 l26,-6 v4 l-26,6z" fill="#7a5230" stroke="${I}" stroke-width=".8"/>${place(icon('goronruby'), 9, 96, 22, 28)}`,
    zorafountain: () => place(icon('zorafountain'), 244, 206, 38, 38),
    'm-rudania': () => place(icon('m-rudania'), 54, 58, 18, 20),
    'm-ruta': () => place(icon('m-ruta'), 73, 58, 18, 20),
    'm-medoh': () => place(icon('m-medoh'), 92, 58, 18, 20),
    'm-naboris': () => place(icon('m-naboris'), 111, 58, 18, 20),
    'm-triforce': () => `<ellipse cx="200" cy="140" rx="22" ry="22" fill="#fff6a0" opacity=".25" class="tri-glow"/>${place(icon('m-triforce'), 188, 124, 24, 24, 'class="tri-float"')}`,
    sealfigure: () => place(icon('sealfigure'), 326, 36, 16, 16),
    cycletrophy: () => place(icon('cycletrophy'), 342, 36, 16, 16),
  };
  // the order things are drawn in (back to front)
  const LAYERS = ['lamp', 'ritochime', 'painting', 'fire', 'm-rudania', 'm-ruta', 'm-medoh', 'm-naboris', 'rack', 'trophies', 'books', 'sealfigure', 'cycletrophy', 'aquarium',
    'goronruby', 'korokstatue', 'table', 'm-triforce', 'goldstatue', 'plant', 'rug', 'bed', 'zorafountain', 'pot'];

  function windowView() {
    const s = S(); const h = new Date().getHours(); const night = h >= 19 || h < 7;
    const horse = s.activeHorse !== null && s.horses[s.activeHorse];
    return `<clipPath id="win-clip"><rect x="178" y="40" width="70" height="66" rx="2"/></clipPath>
      <g clip-path="url(#win-clip)">
        <rect x="178" y="40" width="70" height="66" fill="url(#${night ? 'sky-n' : 'sky-d'})"/>
        ${night ? [[186, 48], [200, 56], [214, 46], [236, 52], [226, 62], [192, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff"/>`).join('') + '<circle cx="236" cy="50" r="5" fill="#f4f2d8"/>' : '<circle cx="236" cy="52" r="6" fill="#fff6c8" opacity=".9"/>'}
        <path d="M178,86 Q196,74 214,82 Q232,72 250,82 V106 H178Z" fill="${night ? '#2a4a3a' : '#7fbf6a'}"/>
        <path d="M178,96 Q210,88 250,96 V106 H178Z" fill="${night ? '#1f3a2c' : '#5c9f48'}"/>
        <path d="M228,84 l4,-10 l4,10z" fill="${night ? '#1f3a2c' : '#3d7f42'}"/>
        ${horse ? place(ART.horse(horse, { saddle: horse.saddle || 'stable' }), 190, 80, 30, 24) : ''}
      </g>
      <rect x="178" y="40" width="70" height="66" rx="2" fill="none" stroke="#5a3a22" stroke-width="4"/><path d="M213,40 V106 M178,73 H248" stroke="#5a3a22" stroke-width="2.4"/>
      <path d="M174,108 h78 v4 h-78z" fill="#7a5230" stroke="${I}" stroke-width=".8"/>
      <path d="M172,36 Q176,70 174,108 L180,108 Q182,70 178,38Z M254,36 Q250,70 252,108 L246,108 Q244,70 248,38Z" fill="#c63b4f" stroke="${I}" stroke-width=".8"/>
      <path d="M170,36 h86" stroke="#5a3a22" stroke-width="2.4" stroke-linecap="round"/>`;
  }

  function roomSvg() {
    const s = S(); const has = id => s.house.decor.includes(id);
    const hero = place(ART.hero({ armour: s.armour, shield: s.shield, weapon: s.weapon }), 188, 186, 40, 52);
    const pet = s.pet !== 'none' ? place(ART.pet(s.pet), 228, 214, 22, 24) : '';
    const rested = s.rested === today();
    return `<svg class="art room-svg" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecdcb8"/><stop offset="1" stop-color="#d8c294"/></linearGradient>
        <linearGradient id="floor-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c6b3d"/><stop offset="1" stop-color="#6b4423"/></linearGradient>
        <linearGradient id="sky-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc6ff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient>
        <linearGradient id="sky-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14204a"/><stop offset="1" stop-color="#3a4a8a"/></linearGradient>
        <radialGradient id="light-g" cx="50%" cy="20%" r="70%"><stop offset="0" stop-color="#fff2c0" stop-opacity=".35"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
        <filter id="ghost-f"><feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .32 0"/></filter>
      </defs>
      <rect width="400" height="250" fill="#3a2a1a"/>
      <path d="M40,20 H360 V165 H40Z" fill="url(#wall-g)"/>
      <path d="M0,0 L40,20 V165 L0,250Z" fill="#cdb488"/><path d="M400,0 L360,20 V165 L400,250Z" fill="#cdb488"/>
      <path d="M0,0 L40,20 V165 L0,250 M400,0 L360,20 V165 L400,250" stroke="#7a5230" stroke-width="3" fill="none"/>
      <path d="M0,0 H400 L360,20 H40Z" fill="#5a3a22"/>
      ${[80, 140, 200, 260, 320].map(x => `<path d="M${x},0 L${40 + (x - 40) * 0.8 + 8},20" stroke="#3a2618" stroke-width="5"/>`).join('')}
      <path d="M40,20 V165 M360,20 V165 M40,92 H52 M130,92 H170 M256,92 H258 M322,92 H326 M40,20 H360" stroke="#6b4423" stroke-width="3" fill="none"/>
      <path d="M40,165 H360 L400,250 H0Z" fill="url(#floor-g)"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${40 + i * 40},165 L${i * 50},250" stroke="#5a3a1a" stroke-width="1" opacity=".55"/>`).join('')}
      ${[180, 200, 224].map(y => `<path d="M${40 - (y - 165) * 0.47},${y} H${360 + (y - 165) * 0.47}" stroke="#5a3a1a" stroke-width=".7" opacity=".4"/>`).join('')}
      <path d="M40,165 H360" stroke="#4a3022" stroke-width="2.4"/>
      <path d="M50,78 h82 v6 h-82z" fill="#7a5230" stroke="${I}" stroke-width="1"/>
      ${windowView()}
      <rect x="140" y="128" width="24" height="10" rx="1" fill="#7a5230" stroke="${I}" stroke-width=".8"/><text x="152" y="135.4" text-anchor="middle" font-size="4.6" fill="#ffe680" font-weight="700">${U.esc(s.hero).slice(0, 9)}</text>
      ${LAYERS.map(id => `<g class="spot ${has(id) ? 'owned' : 'empty'}" data-spot="${id}"${has(id) ? '' : ' filter="url(#ghost-f)"'}>${PIECES[id]()}</g>`).join('')}
      ${hero}${pet}
      ${rested && has('bed') ? '<text x="40" y="166" font-size="9" fill="#ffffff" stroke="#2a4a8a" stroke-width=".6" font-weight="800" class="zzz">Z z z</text>' : ''}
      <rect width="400" height="250" fill="url(#light-g)" pointer-events="none"/>
    </svg>`;
  }

  /* ---------------- Hall of Fame ---------------- */
  function stats() {
    const s = S(); const all = State.SUBJECTS.flatMap(x => CONTENT[x]); const r = State.rank();
    const maxBond = s.horses.reduce((m, h) => Math.max(m, h.bond), 0);
    return [
      ['⭐', 'Shrine stars', `${State.totalStars()}/${all.length * 3}`],
      ['🏅', 'Shrines at ★★★', `${all.filter(t => (s.stars[t.id] || 0) >= 3).length}/${all.length}`],
      ['🐉', 'Divine Beasts freed', `${State.bossesBeaten()}/4`],
      ['🏆', 'Regions mastered', `${STORY.regions.filter(x => s.mastered[x.id]).length}/4`],
      ['🌰', 'Korok seeds found', fmt(s.seedsTotal)],
      ['📖', 'Recipes discovered', `${s.recipes.length}/${K.RECIPES.length}`],
      ['🐴', 'Horses', `${s.horses.length}${maxBond ? ` · best bond ${'💗'.repeat(maxBond)}` : ''}`],
      ['📜', 'Side quests done', `${Object.keys(s.quests).length}/${K.QUESTS.length}`],
      ['✅', 'Questions right', fmt(s.stats.correct)],
      ['🔥', 'Best combo', s.stats.bestStreak],
    ];
  }
  const MEDALS = [
    ['First Trial', 'Clear your first shrine trial', s => s.stats.trials >= 1, '#cd7f32', () => ART.icons.shrine('done')],
    ['Shrine Seeker', 'Earn 50 shrine stars', () => State.totalStars() >= 50, '#c0c8d0', () => `<svg viewBox="0 0 24 24"><path d="M12,2 l3,7 l7,.6 l-5.4,4.6 l1.8,7 l-6.4,-4 l-6.4,4 l1.8,-7 l-5.4,-4.6 l7,-.6z" fill="#ffd23d" stroke="${I}" stroke-width="1.2"/></svg>`],
    ['Blight Breaker', 'Free a Divine Beast', () => State.bossesBeaten() >= 1, '#c0c8d0', () => ART.beast('maths', true)],
    ['Four Champions', 'Free all four Divine Beasts', () => State.bossesBeaten() >= 4, '#ffd23d', () => ART.beast('verbal', true)],
    ['Calamity Sealed', 'Defeat Calamity Ganon', s => !!s.calamity, '#ffd23d', () => ART.calamity()],
    ['Blade of Evil\'s Bane', 'Draw the Master Sword', s => s.ownedWeapons.includes('master'), '#ffd23d', () => K.WEAPONS.find(w => w.id === 'master').emoji],
    ['Champion\'s Pride', 'Master a region (★★★ in every shrine)', s => STORY.regions.some(x => s.mastered[x.id]), '#ffd23d', () => icon('trophies')],
    ['Hero of Hyrule', 'Master every region', s => !!s.mastered.all, '#7ff3ff', () => icon('m-triforce')],
    ['Korok Friend', 'Find 40 Korok seeds', s => s.seedsTotal >= 40, '#c0c8d0', () => ART.icons.seed()],
    ['Master Chef', 'Discover every recipe', s => s.recipes.length >= K.RECIPES.length, '#ffd23d', () => K.RECIPES[0].emoji],
    ['Horse Whisperer', 'Raise a horse to full bond', s => s.horses.some(h => h.bond >= 5), '#c0c8d0', () => ART.icons.stable()],
    ['Exam Ace', 'Score 85% on a practice paper', () => State.questValue('mockBest') >= 85, '#ffd23d', () => ART.icons.lab()],
    ['Helping Hand', 'Complete 10 side quests', s => Object.keys(s.quests).length >= 10, '#c0c8d0', () => K.ITEMS.find(i => i.id === 'ticket').emoji],
    ['Combo Legend', 'Get a 15-answer combo', s => s.stats.bestStreak >= 15, '#ffd23d', () => K.WEAPONS.find(w => w.id === 'flame').emoji],
  ];
  const medalSvg = (c, got, sym) => `<svg viewBox="0 0 40 52" class="medal-svg"><path d="M12,0 h7 l5,18 h-7z" fill="${got ? '#c63b4f' : '#555'}"/><path d="M28,0 h-7 l-5,18 h7z" fill="${got ? '#2f55b5' : '#444'}"/>
    <circle cx="20" cy="32" r="16" fill="${got ? c : '#3a3a40'}" stroke="${I}" stroke-width="1.6"/><circle cx="20" cy="32" r="12" fill="none" stroke="${got ? '#fff' : '#555'}" stroke-width="1" opacity=".6"/>
    ${got ? place(sym(), 9, 21, 22, 22) : '<text x="20" y="37" text-anchor="middle" font-size="13" font-weight="800" fill="#666">?</text>'}</svg>`;

  /* ---------------- the screen ---------------- */
  function show() {
    const s = S(); const { screen, hud, on, toast, modal } = UI();
    if (!s.house.owned) {
      screen(`${hud()}<div class="page center"><div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Hateno Village</h2></div>
        <div class="house-outside">${ART.icons.house()}</div>
        <p class="intro slate">Hudson: "This old house is for sale! It needs some love, but it could be a real home: somewhere to show off every trophy you win on your adventure. Only <b>${fmt(K.HOUSE_PRICE)} rupees</b>!"</p>
        <button class="btn big ${s.rupees >= K.HOUSE_PRICE ? 'primary glow' : ''}" id="buy" ${s.rupees >= K.HOUSE_PRICE ? '' : 'disabled'}>Buy the house (${ART.icons.rupee('green')} ${fmt(K.HOUSE_PRICE)})</button>
        <p class="muted">You have ${fmt(s.rupees)} rupees. Keep clearing shrines to save up!</p></div>`, 'plateau', 'home');
      on('#back', Game.map);
      on('#buy', () => { s.rupees -= K.HOUSE_PRICE; State.count('spent', K.HOUSE_PRICE); s.house.owned = true; State.save(); FX.itemGet(`<span class="emo big">${ART.icons.house()}</span>`, 'You bought a house!', 'Decorate it with furniture from Bolson Construction, and fill it with your trophies.', show); });
      return;
    }
    const has = id => s.house.decor.includes(id);
    const owned = K.DECOR.filter(d => has(d.id)).length;
    const rested = s.rested === today();
    const medals = MEDALS.map(([name, how, test, c, sym]) => { const got = !!test(s); return { name, how, got, c, sym }; });
    const shopList = K.DECOR.filter(d => d.price !== null && !has(d.id));
    screen(`${hud()}<div class="page house-page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>${U.esc(s.hero)}'s House</h2><span class="pill">🏠 ${owned}/${K.DECOR.length}</span></div>
      <div class="room-frame">${roomSvg()}</div>
      <p class="muted center room-hint">Tap anything in the room. Faint shapes show what's still to come!</p>
      <div class="row center">${has('bed') ? `<button class="btn ${rested ? '' : 'primary'}" id="sleep" ${rested ? 'disabled' : ''}>🛏️ ${rested ? 'Rested today' : 'Sleep (+10% XP next trial)'}</button>` : ''}${has('pot') ? '<button class="btn" id="cook">🍲 Cook</button>' : ''}</div>
      <h3 class="hof-title">🏛️ Hall of Fame</h3>
      <div class="hof-stats">${stats().map(([ic, label, v]) => `<div class="hof-stat slate"><span>${ic}</span><b>${v}</b><small>${label}</small></div>`).join('')}</div>
      <div class="hof-rank slate"><span class="rank-big">${State.rank().level}</span><div><b>Hero Rank: ${State.rank().title}</b><small>${medals.filter(m => m.got).length}/${medals.length} medals earned</small></div></div>
      <div class="medals">${medals.map(m => `<div class="medal ${m.got ? 'got' : ''}" title="${m.how}">${medalSvg(m.c, m.got, m.sym)}<b>${m.name}</b><small>${m.got ? '✓ Earned' : m.how}</small></div>`).join('')}</div>
      ${shopList.length ? `<h3>🔨 Bolson Construction</h3><p class="muted">"Hoo-HAH! Pick something and my crew will put it in just the right spot!"</p>
        <div class="bolson">${shopList.map(d => `<button class="bolson-item slate" data-decor="${d.id}" ${s.rupees >= d.price ? '' : 'disabled'}><span class="bi-ic">${d.emoji}</span><b>${d.name}</b><small>${ART.icons.rupee('green')} ${fmt(d.price)}</small></button>`).join('')}</div>` : '<p class="muted center">Every piece of furniture Bolson sells is in your house! 🎉</p>'}
    </div>`, 'plateau', 'home');
    on('#back', Game.map);
    on('#sleep', () => { s.rested = today(); s.restedBonus = true; State.save(); FX.flash('#0a0a30', 0.9); FX.banner('Zzz… Well rested!', 'grace'); setTimeout(show, 1200); });
    on('#cook', () => World.kitchen('house'));
    const buy = id => { const d = K.DECOR.find(x => x.id === id); if (!d || d.price === null || s.rupees < d.price || has(id)) return; s.rupees -= d.price; State.count('spent', d.price); s.house.decor.push(id); State.save(); U.sfx.coin(); toast(`${d.emoji} ${d.name} placed!`, 'good'); show(); setTimeout(() => { const g = $(`[data-spot="${id}"]`); if (g) { g.classList.add('just-placed'); const [x, y] = FX.center(g); FX.burst(x, y, { n: 30, colors: ['#ffd23d', '#fff', '#3fe0ff'], kind: 'star', speed: 220 }); } }, 120); };
    on('[data-decor]', (e, el) => buy(el.dataset.decor));
    $$('.room-svg .spot').forEach(g => g.addEventListener('click', () => {
      const id = g.dataset.spot; const d = K.DECOR.find(x => x.id === id); if (!d) return; U.sfx.click();
      const earned = d.mastery ? `Your reward for mastering ${d.mastery === 'all' ? 'every region in Hyrule' : STORY.regions.find(r => r.id === d.mastery).name}. Nobody else has one!` : d.price === null ? 'Your reward for completing a side quest.' : 'Part of your collection.';
      const how = has(id) ? (d.desc || earned) : d.price !== null ? `Bolson can build this for <b>${fmt(d.price)} rupees</b>.` : d.mastery ? `A trophy for mastering ${d.mastery === 'all' ? 'every region' : STORY.regions.find(r => r.id === d.mastery).name} (★★★ in every shrine).` : 'A reward from a side quest. Check the Quests board!';
      modal(`<div class="decor-pop">${d.emoji}</div><h3>${d.name}</h3><p>${how}</p>`, has(id) || d.price === null ? [{ label: 'Nice!', cls: 'primary' }] : [{ label: 'Not now' }, { label: `Build it (${fmt(d.price)})`, cls: 'primary', fn: () => buy(id) }]);
    }));
  }

  window.House = { show };
})();
