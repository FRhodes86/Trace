// Hand-drawn SVG artwork: characters, monsters, Blights, icons and the world map.
// Cel-shaded "painted" look: soft gradients, dark ink outline, pastel highlights.
(function () {
  const INK = '#1d1a2b';
  let uid = 0;
  const id = p => `${p}${++uid}`;
  const svg = (vb, inner, cls = '', extra = '') => `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${extra}>${inner}</svg>`;
  const lg = (gid, c1, c2, vertical = true) => `<linearGradient id="${gid}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  const rg = (gid, c1, c2, o2 = 1) => `<radialGradient id="${gid}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}" stop-opacity="${o2}"/></radialGradient>`;
  const shadow = (cx, cy, rx) => `<ellipse class="shadow" cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx / 5}" fill="#000" opacity=".28"/>`;
  const glowFilter = (fid, color, sd = 3) => `<filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feFlood flood-color="${color}"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  /* ======================= HERO ======================= */
  const OUTFITS = {
    tunic: { tunic: '#4f86c6', shade: '#3a6699', trim: '#efe6c8' },
    champion: { tunic: '#2e73d9', shade: '#1f55a8', trim: '#ffffff' },
    sheikah: { tunic: '#26345e', shade: '#18213f', trim: '#c63b4f', mask: '#26345e' },
    climbing: { tunic: '#4a7a8a', shade: '#335a66', trim: '#e8d8a8', band: '#c8402a' },
    royalguard: { tunic: '#22336e', shade: '#16224a', trim: '#e2b33c' },
    barbarian: { tunic: '#7a4a2a', shade: '#5a321a', trim: '#d0302a', paint: '#d0302a', band: '#e8e0c8' },
    flamebreaker: { tunic: '#6a4a3a', shade: '#4a2e22', trim: '#ff7a2a', band: '#ff7a2a' },
    zora: { tunic: '#3a8ad0', shade: '#25639c', trim: '#e8f6ff' },
    snowquill: { tunic: '#e8eef6', shade: '#b8c4d4', trim: '#c63b4f', band: '#c63b4f' },
    desert: { tunic: '#e8c070', shade: '#c09a48', trim: '#7a3aa0', mask: '#7a3aa0' },
    time: { tunic: '#3c9a3c', shade: '#2a6e2a', trim: '#f0e0a0', hat: '#3c9a3c' },
    wild: { tunic: '#2a4aa8', shade: '#1a3070', trim: '#ffd23d', aura: '#ffd23d' },
    deity: { tunic: '#f2f2f2', shade: '#c8c8d0', trim: '#c62a2a', paint: '#3fb0ff', aura: '#ff5a5a' },
  };
  const SHIELD_ART = {
    pot: `<ellipse cx="40" cy="92" rx="13" ry="15" fill="#9c9c94" stroke="${INK}" stroke-width="2"/><ellipse cx="40" cy="92" rx="8" ry="9" fill="none" stroke="#6f6f68" stroke-width="1.5"/>`,
    wood: `<ellipse cx="40" cy="92" rx="14" ry="17" fill="#b07a42" stroke="${INK}" stroke-width="2"/><path d="M33,78 v28 M40,75 v34 M47,78 v28" stroke="#7a5230" stroke-width="1.5"/>`,
    traveler: `<ellipse cx="40" cy="92" rx="15" ry="18" fill="#8a5a2b" stroke="${INK}" stroke-width="2"/><ellipse cx="40" cy="92" rx="10" ry="12" fill="none" stroke="#5e3b1a" stroke-width="2"/><circle cx="40" cy="92" r="3" fill="#b8b8b8"/>`,
    soldier: `<path d="M27,78 Q40,72 53,78 L50,102 Q40,114 30,102 Z" fill="#3a6aa8" stroke="${INK}" stroke-width="2"/><path d="M40,80 v24 M31,90 h18" stroke="#c8d4e4" stroke-width="2"/>`,
    hylian: `<path d="M26,78 Q40,70 54,78 L52,104 Q40,118 28,104 Z" fill="#2f55b5" stroke="${INK}" stroke-width="2"/><path d="M34,86 L40,80 L46,86 L40,96 Z" fill="#c9302c"/><path d="M37,100 l3,-5 l3,5 z" fill="#f4d03f"/>`,
    royal: `<path d="M26,78 Q40,70 54,78 L52,104 Q40,118 28,104 Z" fill="#23367a" stroke="#e2b33c" stroke-width="3"/><path d="M40,82 l5,9 h-10 z" fill="#e2b33c"/><circle cx="40" cy="100" r="3" fill="#e2b33c"/>`,
    lynel: `<path d="M24,80 L32,72 L40,78 L48,72 L56,80 L52,104 L40,116 L28,104 Z" fill="#8a2a1a" stroke="${INK}" stroke-width="2"/><circle cx="40" cy="92" r="6" fill="#e8c8b0" stroke="${INK}"/>`,
    daybreaker: `<circle cx="40" cy="92" r="18" fill="#e8b830" stroke="${INK}" stroke-width="2"/><circle cx="40" cy="92" r="13" fill="#c2381c" stroke="#7a2010" stroke-width="1.4"/><path d="M40,80 l3,8 l8,-3 l-5,7 l5,7 l-8,-3 l-3,8 l-3,-8 l-8,3 l5,-7 l-5,-7 l8,3 z" fill="#ffe17a" stroke="#7a2010" stroke-width=".8"/><circle cx="40" cy="92" r="3.5" fill="#3fe0ff"/>`,
    mirror: `<ellipse cx="40" cy="92" rx="15" ry="19" fill="#dfe8f0" stroke="#8a9aaa" stroke-width="3"/><ellipse cx="40" cy="92" rx="10" ry="13" fill="#f8fbff"/><path d="M33,84 l6,-4" stroke="#fff" stroke-width="3" opacity=".9"/>`,
  };
  // Blade drawn pointing up-right from the hand at (88, 92). Champions' weapons have their own silhouettes.
  function bladeShape(shape, g, blade, hilt) {
    const local = { // drawn pointing straight up from (0,0), then tilted to match the sword arm
      great: `<path d="M-7,0 L-8,-52 L0,-62 L8,-52 L7,0 Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-4,-6 V-50 M4,-6 V-50" stroke="#ff9a2e" stroke-width="1.6" opacity=".9"/><path d="M-10,0 h20" stroke="${hilt}" stroke-width="5" stroke-linecap="round"/>`,
      trident: `<path d="M0,6 V-52" stroke="${hilt}" stroke-width="3.4" stroke-linecap="round"/><path d="M-8,-50 h16 M-7,-50 V-60 M7,-50 V-60 M0,-50 V-70" stroke="${blade}" stroke-width="3" stroke-linecap="round"/><path d="M-9,-58 l2,-6 l2,6 M5,-58 l2,-6 l2,6 M-2,-68 l2,-7 l2,7" fill="${blade}" stroke="${INK}" stroke-width="1"/><circle cx="0" cy="-50" r="2.6" fill="#c9302c" stroke="${INK}" stroke-width=".8"/>`,
      scimitar: `<path d="M-3,0 Q-14,-30 4,-60 Q-2,-30 5,0 Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-1,-6 Q-8,-30 2,-52" stroke="#ffe866" stroke-width="1.2" fill="none"/>`,
    }[shape];
    if (local) return `<g transform="translate(89 93) rotate(24)">${local}</g>`;
    return `<path d="M86,92 L109,40 L114,42 L91,95 Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M109,40 L112,33 L114,42 Z" fill="${blade}" stroke="${INK}" stroke-width="1.5"/>
            <path d="M99,62 L105,50" stroke="#fff" stroke-width="1.2" opacity=".8"/>`;
  }
  function hero(o = {}) {
    const f = OUTFITS[o.armour] || OUTFITS.tunic;
    const g = id('hg');
    const W = (window.CATALOG && CATALOG.WEAPONS.find(w => w.id === o.weapon)) || { blade: '#d7dde4', hilt: '#7a5230' };
    const blade = W.blade, hilt = W.hilt;
    const bladeLen = { boulder: 1.15, trident: 1.1, scimitar: 1.05, traveler: 0.85, boko: 0.8, soldier: 1, knight: 1.15, flame: 1.05, frost: 1.05, thunder: 1.05, eightfold: 1.12, royal: 1.12, lynel: 1.15, biggoron: 1.4, goddess: 1.2, master: 1.2 }[o.weapon] || 0.85;
    const SL = (window.CATALOG && (CATALOG.SHIELDS.find(x => x.id === o.shield) || {}).look) || (o.shield === 'none' ? 'pot' : o.shield) || 'pot';
    const shieldSvg = SHIELD_ART[SL] || SHIELD_ART.pot;
    const face = (f.mask
      ? `<path d="M48,49 Q62,59 80,49 L80,61 Q62,67 48,59 Z" fill="${f.mask}" stroke="${INK}" stroke-width="1.5"/><path d="M58,55 l4,3 l4,-3" stroke="${f.trim}" stroke-width="1.5" fill="none"/>`
      : `<path d="M66,58 q4,2.2 7.5,0" stroke="#a5604a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`)
      + (f.paint ? `<path d="M71,52 l6,0 M69,55 l8,1" stroke="${f.paint}" stroke-width="1.8" stroke-linecap="round"/>` : '');
    const hat = f.hat ? `<path d="M46,32 Q58,10 80,26 Q60,22 50,40 Q36,60 22,70 Q34,48 46,32Z" fill="${f.hat}" stroke="${INK}" stroke-width="2"/>` : '';
    const band = f.band ? `<path d="M46,33 Q63,26 81,34" stroke="${f.band}" stroke-width="3.5" fill="none"/>` : '';
    const aura = f.aura ? `<ellipse cx="60" cy="85" rx="44" ry="62" fill="${f.aura}" opacity=".18" class="aura-pulse"/>` : '';
    const hem = Array.from({ length: 11 }, (_, i) => `${i ? 'l' : 'M40,113 l'}3.8,${i % 2 ? 3 : -3}`).join(' ');
    return svg('0 0 120 150', `<defs>${lg(g + 't', f.tunic, f.shade)}${lg(g + 'h', '#f6d77a', '#c9962a')}${lg(g + 'b', blade, '#9fb4c8', false)}${lg(g + 'p', '#6a5644', '#463729')}</defs>
      ${shadow(60, 145, 30)}${aura}
      <g class="h-body">
        <path d="M48,38 Q30,42 28,58 Q28,70 36,78 Q34,66 40,58 Q46,50 52,46 Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2"/>
        <path d="M44,44 l5,4" stroke="#7a5230" stroke-width="3" stroke-linecap="round"/>
        <g class="h-shield">${shieldSvg}</g>
        <path d="M50,110 h11 l-1,22 h-9z" fill="url(#${g}p)" stroke="${INK}" stroke-width="2"/>
        <path d="M48,128 h14 l1,15 h-19 q-1,-8 4,-15z" fill="#5a3a22" stroke="${INK}" stroke-width="2"/><path d="M48,128 h14 v4 h-14z" fill="#8a6a45" stroke="${INK}" stroke-width="1.4"/>
        <path d="M63,110 h11 l1,22 h-11z" fill="url(#${g}p)" stroke="${INK}" stroke-width="2"/>
        <path d="M62,128 h14 q9,4 9,15 h-23z" fill="#6b4423" stroke="${INK}" stroke-width="2"/><path d="M62,128 h14 v4 h-14z" fill="#9b7a52" stroke="${INK}" stroke-width="1.4"/>
        <path d="M43,74 Q60,64 78,74 L84,117 Q60,124 37,117 Z" fill="url(#${g}t)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M62,70 L66,118" stroke="${f.shade}" stroke-width="3" opacity=".5"/>
        <path d="M38,111 Q60,118 83,111" stroke="${f.trim}" stroke-width="2" fill="none"/>
        <path d="${hem}" stroke="${f.trim}" stroke-width="1.4" fill="none" opacity=".9"/>
        <path d="M52,71 L60,82 L69,71 Z" fill="#efe6c8" stroke="${INK}" stroke-width="1.2"/>
        <path d="M49,72 L60,85 L72,72" stroke="${f.trim}" stroke-width="2.6" fill="none"/>
        <path d="M43,92 Q60,88 80,93" stroke="#7a5230" stroke-width="2.2" fill="none"/>
        <rect x="41" y="97" width="41" height="6" rx="2" fill="#6b4423" stroke="${INK}" stroke-width="1.5"/>
        <rect x="57" y="96" width="7" height="8" rx="1" fill="#c9a227" stroke="${INK}" stroke-width="1"/>
        <rect x="44" y="102" width="8" height="8" rx="1.5" fill="#7a5230" stroke="${INK}" stroke-width="1.2"/>
        <g class="h-slate"><rect x="69" y="101" width="13" height="10" rx="2" fill="#2b3240" stroke="${INK}" stroke-width="1.4"/><path d="M72,106 q3.5,-3 7,0 q-3.5,3 -7,0z" fill="none" stroke="#3fe0ff" stroke-width="1"/><circle cx="75.5" cy="106" r="1.2" fill="#3fe0ff"/></g>
        <path d="M44,78 Q34,88 40,104" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M44,78 Q37,85 38,92" stroke="${f.tunic}" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <path d="M38,92 Q37,99 40,104" stroke="#f5cfa8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M37,96 l5,1" stroke="#6b4423" stroke-width="4"/>
        <rect x="55" y="60" width="11" height="10" fill="#f5cfa8" stroke="${INK}" stroke-width="1.5"/>
        <g class="h-head">
          <path d="M48,47 L24,33 Q30,44 48,56 Z" fill="#f8d6b3" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <path d="M45,47 L31,39 Q36,45 46,52Z" fill="#eab796"/>
          <ellipse cx="63" cy="47" rx="17" ry="19" fill="#f8d6b3" stroke="${INK}" stroke-width="2.2"/>
          <path d="M45,47 Q39,21 63,20 Q88,20 82,49 Q80,39 76,35 Q77,44 72,48 Q71,38 66,33 Q63,40 58,38 Q57,44 51,42 Q48,48 45,47Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <path d="M79,36 Q85,48 80,61 Q78,52 75,45Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="1.6"/>
          <path d="M55,25 Q65,21 74,27 M66,33 Q66,27 62,24" stroke="#fff3c4" stroke-width="1.8" fill="none" opacity=".8"/>
          <g class="h-eye"><ellipse cx="72" cy="48" rx="3" ry="4" fill="#fff"/><ellipse cx="72.6" cy="48.4" rx="2.4" ry="3.3" fill="#2e6fbf"/><circle cx="73.3" cy="47" r="1" fill="#fff"/>
            <ellipse cx="60" cy="48" rx="2.4" ry="3.6" fill="#fff"/><ellipse cx="60.6" cy="48.4" rx="1.9" ry="3" fill="#2e6fbf"/><circle cx="61.2" cy="47" r=".8" fill="#fff"/></g>
          <path d="M68,41.5 q4,-2 7.5,0 M57,42 q3,-1.5 5.5,0" stroke="#a87a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          ${face}${band}${hat}
        </g>
        <g class="h-arm">
          <g transform="translate(88 92) scale(${bladeLen}) translate(-88 -92)">${bladeShape(W.shape, g, blade, hilt)}</g>
          <path d="M80,86 L98,94" stroke="${hilt}" stroke-width="5" stroke-linecap="round"/>
          <path d="M80,86 L98,94" stroke="${INK}" stroke-width="1" fill="none" opacity=".4"/>
          <path d="M86,96 L82,104" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/>
          <path d="M66,76 Q80,80 86,92" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/>
          <path d="M66,76 Q76,78 80,84" stroke="${f.tunic}" stroke-width="7.5" stroke-linecap="round" fill="none"/>
          <path d="M80,84 Q84,88 86,92" stroke="#f5cfa8" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M81,86 l4,-2" stroke="#6b4423" stroke-width="5"/>
          <circle cx="88" cy="94" r="5.5" fill="#8a5a2b" stroke="${INK}" stroke-width="2"/><path d="M85,96 q3,2 6,0" stroke="#f5cfa8" stroke-width="1.6" fill="none"/>
        </g>
      </g>`, 'hero');
  }

  /* ======================= NPCs ======================= */
  function zelda() {
    // Zelda in her royal blue travelling outfit: waist-length golden hair, braided crown, front braids, Sheikah Slate in hand
    const g = id('zg');
    return svg('0 0 120 150', `<defs>${lg(g + 'h', '#ffe7a3', '#d8a842')}${lg(g + 'd', '#3b6fd1', '#1f3f8a')}${lg(g + 'p', '#5a4636', '#3a2c20')}</defs>
      ${shadow(60, 145, 28)}
      <g class="h-body">
        <path d="M42,36 Q30,70 36,104 Q46,112 52,100 L52,58 Z M78,36 Q90,70 84,104 Q74,112 68,100 L68,58 Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M48,112 h10 l-1,22 h-9z M62,112 h10 l0,22 h-9z" fill="url(#${g}p)" stroke="${INK}" stroke-width="2"/>
        <path d="M46,128 h13 l1,16 h-16 q-1,-8 2,-16z M61,128 h13 q3,8 2,16 h-16z" fill="#6b4a2e" stroke="${INK}" stroke-width="2"/><path d="M46,128 h13 v4 h-13z M61,128 h13 v4 h-13z" fill="#8a6a45"/>
        <path d="M44,72 Q60,64 76,72 L80,116 Q60,121 40,116 Z" fill="url(#${g}d)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M41,110 Q60,116 79,110" stroke="#f1e3b5" stroke-width="2.2" fill="none"/>
        <path d="M51,71 L60,84 L69,71" stroke="#f1e3b5" stroke-width="2.6" fill="none"/>
        <path d="M56,76 l4,-3 l4,3 l-4,6z" fill="#c9a227" stroke="${INK}" stroke-width=".8"/>
        <rect x="42" y="97" width="36" height="5" rx="1.5" fill="#6b4423" stroke="${INK}" stroke-width="1"/><rect x="57" y="96.5" width="6" height="6" rx="1" fill="#c9a227" stroke="${INK}" stroke-width=".8"/>
        <path d="M44,76 Q38,90 46,100 M76,76 Q82,90 74,100" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M44,76 Q38,90 46,100 M76,76 Q82,90 74,100" stroke="#2f5fc0" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <rect x="47" y="96" width="26" height="15" rx="3" fill="#2b3240" stroke="${INK}" stroke-width="1.6"/><path d="M53,103.5 q7,-6 14,0 q-7,6 -14,0z" fill="none" stroke="#3fe0ff" stroke-width="1.2"/><circle cx="60" cy="103.5" r="2" fill="#3fe0ff"/>
        <circle cx="47" cy="101" r="3.6" fill="#f8d6b3" stroke="${INK}" stroke-width="1.4"/><circle cx="73" cy="101" r="3.6" fill="#f8d6b3" stroke="${INK}" stroke-width="1.4"/>
        <rect x="55" y="58" width="10" height="10" fill="#f8d6b3" stroke="${INK}" stroke-width="1.5"/>
        <path d="M43,48 L28,40 L44,56 Z M77,48 L92,40 L76,56 Z" fill="#f8d6b3" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
        <ellipse cx="60" cy="45" rx="17" ry="19" fill="#f8d6b3" stroke="${INK}" stroke-width="2.2"/>
        <path d="M43,47 Q40,20 60,20 Q80,20 77,47 Q74,34 68,31 Q62,38 60,32 Q58,38 52,31 Q46,34 43,47Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M45,33 Q60,23 75,33" stroke="#b8862a" stroke-width="4.2" fill="none" stroke-linecap="round"/>
        <path d="M47,31 l3,2 M52,28.5 l3,2 M58,27.5 l3,1.6 M64,28 l3,1.4 M70,30 l3,1" stroke="#ffe7a3" stroke-width="1.2"/>
        <path d="M45,46 Q43,58 46,70 M75,46 Q77,58 74,70" stroke="#c9962a" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <path d="M44.5,52 l3,1 M45,58 l3,1 M45.5,64 l3,1 M75.5,52 l-3,1 M75,58 l-3,1 M74.5,64 l-3,1" stroke="#ffe7a3" stroke-width="1"/>
        <circle cx="60" cy="26" r="2.2" fill="#4fd1ff" stroke="${INK}" stroke-width=".8"/>
        <g class="h-eye"><ellipse cx="53.5" cy="47" rx="3.2" ry="4.2" fill="#fff"/><ellipse cx="54" cy="47.4" rx="2.5" ry="3.4" fill="#3b8d4f"/><circle cx="54.8" cy="46" r="1" fill="#fff"/>
          <ellipse cx="66.5" cy="47" rx="3.2" ry="4.2" fill="#fff"/><ellipse cx="67" cy="47.4" rx="2.5" ry="3.4" fill="#3b8d4f"/><circle cx="67.8" cy="46" r="1" fill="#fff"/></g>
        <path d="M50,41 q3.5,-2 7,0 M63,41 q3.5,-2 7,0" stroke="#a87a22" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M56,56 q4,2.6 8,0" stroke="#b5604a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      </g>`, 'npc zelda');
  }
  function oldMan() {
    // the mysterious Old Man of the Great Plateau: hooded brown cloak, huge white beard and bushy brows, walking stick
    return svg('0 0 120 150', `${shadow(60, 145, 30)}
      <g class="h-body">
        <path d="M86,64 L98,142" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/><path d="M84,62 q4,-6 8,0" stroke="#5a3a22" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M28,142 Q30,74 60,42 Q90,74 92,142 Z" fill="#6b5137" stroke="${INK}" stroke-width="2.4"/>
        <path d="M38,142 Q44,94 60,74 Q76,94 82,142 Z" fill="#584229"/>
        <path d="M40,74 Q60,86 80,74 L82,86 Q60,98 38,86Z" fill="#8a7a5a" stroke="${INK}" stroke-width="1.6"/>
        <path d="M34,66 Q60,12 86,66 Q78,48 60,46 Q42,48 34,66Z" fill="#7d6142" stroke="${INK}" stroke-width="2.2"/>
        <path d="M42,60 Q60,36 78,60" stroke="#5a4428" stroke-width="2" fill="none"/>
        <ellipse cx="60" cy="63" rx="13" ry="14" fill="#e3b892" stroke="${INK}" stroke-width="2"/>
        <path d="M45,64 Q44,92 52,106 Q58,114 60,118 Q62,114 68,106 Q76,92 75,64 Q70,74 60,72 Q50,74 45,64Z" fill="#f4f2ea" stroke="${INK}" stroke-width="2"/>
        <path d="M52,84 q3,8 8,10 M68,84 q-3,8 -8,10 M60,96 v10" stroke="#cfcac0" stroke-width="1.4" fill="none"/>
        <path d="M50,70 Q55,66 60,70 Q65,66 70,70" stroke="${INK}" stroke-width="1" fill="#f4f2ea"/>
        <path d="M47,57 q6,-5 11,-1 M62,56 q5,-4 11,1" stroke="#f4f2ea" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M52,61 q3,1.5 5,0 M63,61 q3,1.5 5,0" stroke="${INK}" stroke-width="1.6" fill="none"/>
        <path d="M58,62 q2,5 4,0" stroke="#b5835a" stroke-width="2" fill="none"/>
      </g>`, 'npc');
  }
  function monk() {
    // a shrine monk: seated in meditation inside a glowing blue barrier, orange robes and a tall ornate headdress
    const g = id('mk');
    return svg('0 0 120 150', `<defs>${rg(g, '#bff8ff', '#3fe0ff', 0.15)}</defs>
      <circle cx="60" cy="84" r="54" fill="url(#${g})" opacity=".5" class="aura-pulse"/>
      <circle cx="60" cy="84" r="54" fill="none" stroke="#7ff3ff" stroke-width="1.6" opacity=".7"/>
      <path d="M30,52 Q42,40 54,38" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
      <g class="h-body">
        <path d="M22,136 Q26,112 46,106 L74,106 Q94,112 98,136 Q60,146 22,136Z" fill="#c26b2b" stroke="${INK}" stroke-width="2.2"/>
        <path d="M34,134 Q60,124 86,134" stroke="#8a4a1a" stroke-width="2" fill="none"/>
        <path d="M40,104 Q38,82 60,78 Q82,82 80,104 Q60,112 40,104Z" fill="#d98a3d" stroke="${INK}" stroke-width="2"/>
        <path d="M60,80 V106" stroke="#f3d27a" stroke-width="2.4"/><path d="M46,86 Q60,94 74,86" stroke="#f3d27a" stroke-width="2" fill="none"/>
        <path d="M52,100 L60,90 L68,100 Z" fill="#6a4a3a" stroke="${INK}" stroke-width="1.4"/>
        <ellipse cx="60" cy="66" rx="11" ry="13" fill="#6a4a3a" stroke="${INK}" stroke-width="2"/>
        <path d="M53,64 q3,1.5 5,0 M62,64 q3,1.5 5,0 M56,73 q4,1.4 8,0" stroke="#2a1a10" stroke-width="1.4" fill="none"/>
        <path d="M54,58 h12" stroke="#4a3022" stroke-width="1.2"/>
        <path d="M42,60 Q38,40 60,30 Q82,40 78,60 Q70,54 60,54 Q50,54 42,60Z" fill="#d9573a" stroke="${INK}" stroke-width="2"/>
        <path d="M46,52 Q60,44 74,52" stroke="#f3d27a" stroke-width="2.4" fill="none"/>
        <path d="M54,42 q6,-5 12,0 q-6,5 -12,0z" fill="#f3d27a" stroke="${INK}" stroke-width="1"/><circle cx="60" cy="42" r="1.6" fill="#3fe0ff"/>
        <circle cx="60" cy="28" r="3" fill="#f3d27a" stroke="${INK}" stroke-width="1"/>
        <path d="M44,96 Q52,104 60,98 Q68,104 76,96" stroke="#6a4a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>`, 'npc monk');
  }
  function korok(small) {
    // a little wooden forest spirit wearing a leaf for a mask, with a twig sprouting from its head
    return svg('0 0 100 110', `${shadow(50, 106, 18)}
      <g class="h-body">
        <path d="M44,74 L38,98 M56,74 L62,98 M40,72 L24,80 M60,72 L78,60" stroke="#7a5230" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M24,80 l-5,3 M24,80 l-3,-5 M78,60 l5,-3 M78,60 l1,-6" stroke="#7a5230" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="50" cy="70" rx="11" ry="10" fill="#9c6b3d" stroke="${INK}" stroke-width="2"/>
        <circle cx="50" cy="44" r="18" fill="#8a5a2b" stroke="${INK}" stroke-width="2.2"/>
        <path d="M50,26 Q48,14 54,6" stroke="#6b4423" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M54,8 Q66,2 70,10 Q62,16 54,8Z" fill="#8fd65a" stroke="${INK}" stroke-width="1.4"/>
        <path d="M50,22 Q72,30 68,52 Q62,66 50,70 Q38,66 32,52 Q28,30 50,22Z" fill="#78c850" stroke="${INK}" stroke-width="2.2"/>
        <path d="M50,24 L50,68 M50,36 L60,30 M50,36 L40,30 M50,48 L62,42 M50,48 L38,42" stroke="#4f9a34" stroke-width="1.4" fill="none"/>
        <ellipse cx="42" cy="44" rx="4.4" ry="5" fill="${INK}"/><ellipse cx="58" cy="44" rx="4.4" ry="5" fill="${INK}"/>
        <ellipse cx="50" cy="57" rx="3.4" ry="4.2" fill="${INK}"/>
        <circle cx="43" cy="42.5" r="1.2" fill="#fff"/><circle cx="59" cy="42.5" r="1.2" fill="#fff"/>
      </g>`, 'npc korok' + (small ? ' small' : ''));
  }
  function hestu() {
    // the giant Korok: a bushy leafy body, a big wooden mask with round eye and mouth holes, and striped maracas
    const leaves = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, x = 70 + Math.cos(a) * 34, y = 108 + Math.sin(a) * 30; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="14" ry="9" transform="rotate(${(a * 57.3 + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 2 ? '#5fae3e' : '#78c850'}" stroke="${INK}" stroke-width="1.6"/>`; }).join('');
    const maraca = (side, x, c) => `<g class="maraca ${side}"><path d="M${side === 'l' ? '46,104 L18,84' : '94,104 L122,84'}" stroke="#7a5230" stroke-width="5" stroke-linecap="round"/><ellipse cx="${x}" cy="76" rx="12" ry="10" fill="${c}" stroke="${INK}" stroke-width="2"/><path d="M${x - 10},72 q10,6 20,0 M${x - 11},79 q11,6 22,0" stroke="#fff6d8" stroke-width="2" fill="none"/></g>`;
    return svg('0 0 140 160', `${shadow(70, 154, 42)}
      <g class="h-body">
        <path d="M56,138 l-4,14 M84,138 l4,14" stroke="#6b4423" stroke-width="6" stroke-linecap="round"/>
        ${leaves}
        <ellipse cx="70" cy="108" rx="30" ry="26" fill="#6fbf48" stroke="${INK}" stroke-width="2"/>
        <path d="M54,100 q6,-6 12,0 M74,112 q6,-6 12,0 M58,122 q6,-6 12,0" stroke="#3f8f2d" stroke-width="2" fill="none"/>
        ${maraca('l', 12, '#e85d3a')}${maraca('r', 128, '#f2c14e')}
        <path d="M70,4 Q64,14 70,22 Q76,14 70,4Z M58,12 Q56,22 64,26 M82,12 Q84,22 76,26" fill="#8fd65a" stroke="${INK}" stroke-width="1.6"/>
        <ellipse cx="70" cy="52" rx="30" ry="34" fill="#d8b276" stroke="${INK}" stroke-width="2.4"/>
        <path d="M46,40 Q70,30 94,40 M44,66 Q70,76 96,66" stroke="#b8925a" stroke-width="2" fill="none"/>
        <circle cx="58" cy="48" r="8" fill="${INK}"/><circle cx="82" cy="48" r="8" fill="${INK}"/>
        <circle cx="60" cy="45" r="2.4" fill="#fff"/><circle cx="84" cy="45" r="2.4" fill="#fff"/>
        <ellipse cx="70" cy="68" rx="8" ry="10" fill="${INK}"/>
        <path d="M44,30 L36,22 M96,30 L104,22" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/>
      </g>`, 'npc hestu');
  }
  function beedle() {
    // the travelling merchant with his enormous beetle-shaped backpack (horn and all)
    return svg('0 0 140 150', `${shadow(72, 145, 46)}
      <g class="h-body">
        <path d="M44,44 Q48,14 82,12 Q118,14 122,50 L122,120 Q84,140 46,126 Z" fill="#6b4a2e" stroke="${INK}" stroke-width="2.4"/>
        <path d="M84,12 V132" stroke="${INK}" stroke-width="2"/><path d="M50,46 Q84,36 120,48" stroke="#4a3220" stroke-width="2" fill="none"/>
        <path d="M56,30 Q70,20 82,22 M88,22 Q104,22 114,34" stroke="#a87a4a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
        <path d="M78,16 Q72,-2 84,-6 Q80,4 90,14 Z" fill="#4a3220" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M60,128 l-4,10 M108,124 l6,10" stroke="#3a2618" stroke-width="4" stroke-linecap="round"/>
        <path d="M28,112 Q26,142 38,142 Q50,142 48,112" fill="#c8b48a" stroke="${INK}" stroke-width="2"/>
        <path d="M24,92 Q38,84 52,92 L50,118 Q38,122 26,118 Z" fill="#4b6fb0" stroke="${INK}" stroke-width="2"/>
        <path d="M40,90 L36,118" stroke="#e8d6a8" stroke-width="2"/>
        <path d="M50,96 L58,84" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="36" cy="76" r="15" fill="#f1cfa8" stroke="${INK}" stroke-width="2"/>
        <path d="M21,74 Q22,58 38,58 Q50,60 50,72 Q42,66 34,68 Q28,66 21,74Z" fill="#2a2a32" stroke="${INK}" stroke-width="1.6"/>
        <path d="M40,58 Q44,48 52,52 Q48,56 46,62" fill="#2a2a32" stroke="${INK}" stroke-width="1.6"/>
        <path d="M24,78 Q18,82 22,86" fill="#f1cfa8" stroke="${INK}" stroke-width="1.6"/>
        <ellipse cx="31" cy="76" rx="2" ry="3" fill="${INK}"/><ellipse cx="41" cy="76" rx="2" ry="3" fill="${INK}"/>
        <path d="M33,82 q3,3 7,0" stroke="#a5604a" stroke-width="1.6" fill="none"/><path d="M36,77 q-2,4 1,5" stroke="#c9946a" stroke-width="1.4" fill="none"/>
      </g>`, 'npc beedle');
  }
  function goddess() {
    // a weathered stone Goddess Statue: robed figure with hands clasped in prayer, tall winged headpiece, ivy on the plinth
    return svg('0 0 120 170', `<defs>${rg('gdg', '#fff7c2', '#ffd75a', 0)}${lg('gds', '#d8d2bf', '#a8a290')}</defs>
      <circle cx="60" cy="70" r="58" fill="url(#gdg)" opacity=".6" class="aura-pulse"/>
      <path d="M26,168 h68 l-6,-16 h-56z" fill="#8f8a7a" stroke="${INK}" stroke-width="2"/>
      <path d="M30,152 h60" stroke="#6d6a5e" stroke-width="2"/>
      <path d="M34,152 Q34,96 60,74 Q86,96 86,152 Z" fill="url(#gds)" stroke="${INK}" stroke-width="2.2"/>
      <path d="M46,152 Q48,110 56,92 M74,152 Q72,110 64,92 M60,96 V152" stroke="#a8a290" stroke-width="1.6" fill="none"/>
      <path d="M44,84 Q60,76 76,84 L72,100 Q60,104 48,100Z" fill="#d8d2bf" stroke="${INK}" stroke-width="1.8"/>
      <path d="M48,92 Q56,104 60,98 Q64,104 72,92" fill="#cfc9b6" stroke="${INK}" stroke-width="1.6"/>
      <path d="M57,90 L60,84 L63,90 L60,100Z" fill="#e8e2cf" stroke="${INK}" stroke-width="1.4"/>
      <circle cx="60" cy="50" r="24" fill="none" stroke="#cfc9b6" stroke-width="5"/><circle cx="60" cy="50" r="24" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>
      <path d="M48,42 Q60,30 72,42 L68,36 Q60,30 52,36Z" fill="#cfc9b6" stroke="${INK}" stroke-width="1.6"/><circle cx="60" cy="34" r="2.4" fill="#ffd75a" stroke="${INK}" stroke-width=".8"/>
      <ellipse cx="60" cy="56" rx="13" ry="16" fill="#d8d2bf" stroke="${INK}" stroke-width="2"/>
      <path d="M47,52 Q46,72 50,82 M73,52 Q74,72 70,82" stroke="#bdb7a4" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M53,57 q3,2 6,0 M61,57 q3,2 6,0" stroke="${INK}" stroke-width="1.4" fill="none"/><path d="M57,65 q3,1.5 6,0" stroke="${INK}" stroke-width="1.2" fill="none"/>
      <path d="M32,168 Q28,150 36,140 Q34,156 42,160 M88,168 Q94,152 86,142 Q88,156 80,162" stroke="#4f8a3a" stroke-width="2.4" fill="none"/>
      <ellipse cx="34" cy="146" rx="3" ry="2" fill="#6fbf48"/><ellipse cx="40" cy="158" rx="3" ry="2" fill="#6fbf48"/><ellipse cx="88" cy="150" rx="3" ry="2" fill="#6fbf48"/>
      <path d="M60,100 l-4,6 h8z" fill="#ffd75a" stroke="${INK}" stroke-width="1"/>`, 'npc goddess');
  }

  /* ======================= MONSTERS ======================= */
  const EL = { fire: ['#ff7a45', '#c2381c'], water: ['#5cc8ff', '#1f73c9'], wind: ['#bff2dc', '#4fb08a'], thunder: ['#ffe866', '#d1a30c'], malice: ['#ff4f8b', '#7a0f3c'], plain: ['#7fb4ff', '#3a67c9'] };
  function chuchu(el = 'plain') {
    // a wobbly, see-through jelly with a darker core and big hollow eyes; elemental ones glow
    const [c1, c2] = EL[el] || EL.plain; const g = id('cc');
    const spark = el === 'fire' ? `<path d="M60,26 Q54,14 60,4 Q62,14 68,10 Q66,20 60,26Z" fill="#ffd23d" stroke="#c2381c" stroke-width="1.4" class="flicker"/>`
      : el === 'thunder' ? `<path d="M58,24 l6,-10 l-4,0 l6,-10" stroke="#fff6a0" stroke-width="2.4" fill="none" class="flicker"/>`
      : el === 'water' ? `<path d="M48,30 l4,-6 l4,6 M66,28 l4,-6 l4,6" stroke="#e8f8ff" stroke-width="1.8" fill="none"/>` : '';
    return svg('0 0 120 110', `<defs><radialGradient id="${g}" cx="40%" cy="35%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>${shadow(60, 104, 38)}
      <g class="m-body squish">
        ${spark}
        <path d="M16,96 Q10,54 50,32 Q60,22 70,32 Q110,54 104,96 Q98,104 92,98 Q86,106 78,100 Q70,106 62,101 Q54,106 46,100 Q38,106 30,99 Q22,104 16,96Z" fill="url(#${g})" fill-opacity=".9" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <ellipse cx="62" cy="80" rx="28" ry="14" fill="${c2}" opacity=".35"/>
        <ellipse cx="40" cy="52" rx="9" ry="5" fill="#fff" opacity=".7" transform="rotate(-30 40 52)"/><circle cx="50" cy="44" r="2.2" fill="#fff" opacity=".8"/>
        <ellipse cx="47" cy="68" rx="8.5" ry="11" fill="${INK}"/><ellipse cx="73" cy="68" rx="8.5" ry="11" fill="${INK}"/>
        <ellipse cx="47" cy="70" rx="5" ry="6.5" fill="${c2}" opacity=".55"/><ellipse cx="73" cy="70" rx="5" ry="6.5" fill="${c2}" opacity=".55"/>
        <circle cx="44" cy="63" r="2.4" fill="#fff"/><circle cx="70" cy="63" r="2.4" fill="#fff"/>
      </g>`, 'monster');
  }
  function keese(el = 'plain') {
    // a bat with one huge eye in the middle of its body and ragged, bony wings
    const c = el === 'fire' ? '#ff7a45' : el === 'thunder' ? '#ffe866' : el === 'water' ? '#7ad3ff' : '#c9ff5a';
    const wing = (s) => `<g transform="translate(70 0) scale(${s} 1) translate(-70 0)"><g class="wing l">
        <path d="M58,46 Q44,12 8,16 Q16,24 10,34 Q22,32 22,44 Q32,40 36,54 Q46,46 58,56Z" fill="#33264a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M58,47 L10,17 M58,49 L11,34 M58,51 L22,44 M58,53 L36,53" stroke="#6b5490" stroke-width="1.4"/></g></g>`;
    const tuft = el === 'fire' ? `<path d="M60,34 Q58,20 64,14 Q66,24 70,18 Q74,24 76,14 Q82,22 80,34Z" fill="#ff9a2e" stroke="#c2381c" stroke-width="1.2" class="flicker"/>` : el === 'thunder' ? `<path d="M62,30 l4,-8 l-3,0 l4,-8 M78,30 l-4,-8 l3,0 l-4,-8" stroke="#ffe866" stroke-width="2" fill="none" class="flicker"/>` : '';
    return svg('0 0 140 100', `${shadow(70, 96, 22)}
      <g class="m-body hover">
        ${wing(-1)}${wing(1)}${tuft}
        <path d="M58,36 L56,22 L64,32 M82,36 L84,22 L76,32" fill="#3d2d57" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="70" cy="51" rx="17" ry="19" fill="#3d2d57" stroke="${INK}" stroke-width="2.4"/>
        <ellipse cx="70" cy="47" rx="11" ry="10" fill="#f6f0e0" stroke="${INK}" stroke-width="1.8"/>
        <circle cx="70" cy="47" r="7" fill="${c}"/><ellipse cx="70" cy="47" rx="2" ry="6" fill="${INK}"/><circle cx="67" cy="44" r="1.6" fill="#fff"/>
        <path d="M63,62 l2,4 l2,-3 l3,4 l3,-4 l2,3 l2,-4" stroke="#fff" stroke-width="1.4" fill="none"/>
        <path d="M64,69 l-2,6 M76,69 l2,6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      </g>`, 'monster');
  }
  function bokoblin(kind = 'red') {
    // pot-bellied pig-snouted brute with long ears, a single horn and a Boko Club
    const skin = { red: ['#e0574f', '#a8352f'], blue: ['#4f7fe0', '#2f4fa8'], black: ['#4a3d52', '#2a2230'], silver: ['#d9d9e3', '#8f8fa3'] }[kind];
    const g = id('bk');
    const stripes = kind === 'silver' ? `<path d="M44,40 q6,4 4,10 M84,40 q-6,4 -4,10 M60,30 q4,4 8,0" stroke="#7a3aa0" stroke-width="2.4" fill="none"/>` : '';
    return svg('0 0 130 150', `<defs>${lg(g, skin[0], skin[1])}</defs>${shadow(64, 145, 32)}
      <g class="m-body bob">
        <path d="M48,114 l-4,24 l-6,4 h16 l2,-26 M76,114 l4,24 l6,4 h-16 l-2,-26" fill="url(#${g})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M40,80 Q64,66 88,80 Q98,100 90,118 Q64,128 38,118 Q30,100 40,80Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <ellipse cx="64" cy="102" rx="17" ry="15" fill="#f1d9b8" opacity=".8"/><path d="M60,104 q4,3 8,0" stroke="${skin[1]}" stroke-width="1.6" fill="none"/>
        <path d="M38,112 Q64,124 90,112 L86,128 L78,124 L72,130 L64,124 L56,130 L50,124 L42,128Z" fill="#7a5230" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M92,86 Q104,98 98,112" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M92,86 Q104,98 98,112" stroke="${skin[0]}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <g class="m-arm"><path d="M36,86 Q22,98 28,112" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M36,86 Q22,98 28,112" stroke="${skin[0]}" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M30,116 Q16,92 12,62 Q8,46 18,44 Q28,46 26,60 Q26,88 34,112Z" fill="#9c6b3d" stroke="${INK}" stroke-width="2"/><path d="M16,52 l-6,-4 M22,66 l6,-3 M18,78 l-6,0" stroke="#5a3a22" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="29" cy="112" r="6" fill="${skin[0]}" stroke="${INK}" stroke-width="2"/></g>
        <path d="M34,50 Q12,42 2,52 Q14,56 18,62 Q26,62 36,64Z M94,50 Q116,42 126,52 Q114,56 110,62 Q102,62 92,64Z" fill="url(#${g})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M30,30 Q64,14 98,30 Q104,64 92,78 Q64,92 36,78 Q24,64 30,30Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M58,22 Q58,6 70,0 Q66,12 70,22Z" fill="#f3e2b8" stroke="${INK}" stroke-width="2"/>
        ${stripes}
        <path d="M40,40 Q50,34 58,42 M70,42 Q78,34 88,40" stroke="${skin[1]}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="49" cy="47" rx="7" ry="6.5" fill="#fff6c8" stroke="${INK}" stroke-width="1.8"/><ellipse cx="78" cy="47" rx="7" ry="6.5" fill="#fff6c8" stroke="${INK}" stroke-width="1.8"/>
        <circle cx="47" cy="48" r="3.2" fill="${INK}"/><circle cx="76" cy="48" r="3.2" fill="${INK}"/>
        <ellipse cx="62" cy="60" rx="15" ry="10" fill="${skin[1]}" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="56" cy="60" rx="3" ry="4" fill="${INK}"/><ellipse cx="68" cy="60" rx="3" ry="4" fill="${INK}"/>
        <path d="M42,72 Q62,82 84,72" stroke="${INK}" stroke-width="2" fill="none"/>
        <path d="M46,74 L48,64 L52,75 M74,75 L78,64 L80,73" fill="#fffdf0" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      </g>`, 'monster');
  }
  function moblin() {
    // tall, hunched brute with a long dog-like snout, curved horns and a spear
    const g = id('mb');
    return svg('0 0 140 170', `<defs>${lg(g, '#5f86d6', '#334f96')}</defs>${shadow(72, 165, 38)}
      <g class="m-body bob">
        <path d="M56,130 l-8,28 l-6,4 h18 l4,-30 M92,130 l6,28 l6,4 h-18 l-2,-30" fill="url(#${g})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M44,84 Q74,58 108,80 Q120,110 108,136 Q74,148 42,136 Q34,110 44,84Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <ellipse cx="76" cy="112" rx="20" ry="16" fill="#9fb8e8" opacity=".55"/>
        <path d="M42,128 Q74,140 108,128 L104,146 L94,142 L84,150 L74,142 L64,150 L54,142 L44,146Z" fill="#5a3a22" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M108,90 Q124,110 116,130" stroke="${INK}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M108,90 Q124,110 116,130" stroke="#5f86d6" stroke-width="10" stroke-linecap="round" fill="none"/>
        <g class="m-arm"><path d="M44,92 Q26,108 32,126" stroke="${INK}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M44,92 Q26,108 32,126" stroke="#5f86d6" stroke-width="10" stroke-linecap="round" fill="none"/>
          <path d="M34,150 L20,36" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/><path d="M14,44 L18,18 L28,42 Z" fill="#d8d8d0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M16,46 h12" stroke="#7a3a2a" stroke-width="3"/>
          <circle cx="32" cy="126" r="7" fill="#5f86d6" stroke="${INK}" stroke-width="2"/></g>
        <path d="M90,40 Q112,30 126,40 Q112,46 96,52Z" fill="#334f96" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M84,32 Q90,8 112,4 Q100,14 96,34Z M72,30 Q72,10 90,2 Q82,14 82,32Z" fill="#e6d6ad" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M58,42 Q64,24 84,24 Q104,28 102,50 Q100,62 90,68 L62,84 Q46,90 36,82 Q30,74 38,66 Q48,58 58,54Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M38,80 Q56,82 74,72" stroke="${INK}" stroke-width="1.8" fill="none"/><path d="M48,80 l2,-7 l4,6 M62,76 l3,-7 l3,5" fill="#fffdf0" stroke="${INK}" stroke-width="1.2"/>
        <ellipse cx="40" cy="70" rx="5" ry="4" fill="#24396e"/><circle cx="38.5" cy="69.5" r="1.4" fill="${INK}"/><circle cx="42" cy="70" r="1.4" fill="${INK}"/>
        <path d="M62,42 Q70,38 78,44" stroke="#24396e" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="70" cy="48" r="4.6" fill="#ff6a3d" stroke="${INK}" stroke-width="1.6"/><circle cx="69" cy="48" r="1.8" fill="${INK}"/>
      </g>`, 'monster');
  }
  function lizalfos(el = 'plain') {
    // crouching lizard warrior with a frilled crest, swivelling eyes and a long tail; elementals have a horn
    const c = el === 'fire' ? ['#e9764a', '#9b3a1e'] : el === 'thunder' ? ['#e9cf4a', '#9b7d1e'] : el === 'water' ? ['#4ab6e9', '#1e5f9b'] : ['#6fcf6a', '#2f7f3a'];
    const hornC = el === 'fire' ? '#ff9a2e' : el === 'thunder' ? '#fff3a0' : el === 'water' ? '#c8f4ff' : null;
    const g = id('lz');
    return svg('0 0 150 140', `<defs>${lg(g, c[0], c[1])}</defs>${shadow(76, 135, 38)}
      <g class="m-body bob">
        <path d="M96,100 Q128,108 146,86 Q144,104 128,114 Q112,120 94,114Z" fill="url(#${g})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M84,104 Q98,112 94,124 L102,132 h-16 l-2,-10 Q78,114 78,108 M62,104 Q52,114 58,124 L52,132 h16 l0,-10 Q70,114 70,108" fill="url(#${g})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M54,70 Q74,56 96,72 Q102,94 92,112 Q72,120 56,110 Q48,92 54,70Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <path d="M60,76 Q70,104 84,80" fill="#f2e2a8" opacity=".85"/><path d="M62,84 h18 M64,92 h14 M67,100 h9" stroke="${c[1]}" stroke-width="1.2" opacity=".6"/>
        <g class="m-arm"><path d="M58,78 Q44,86 40,98" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M58,78 Q44,86 40,98" stroke="${c[0]}" stroke-width="6" stroke-linecap="round" fill="none"/>
          <path d="M46,112 L14,44" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><path d="M18,52 L8,30 L24,46 Z" fill="#dcdcdc" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
          <circle cx="40" cy="99" r="4.5" fill="${c[0]}" stroke="${INK}" stroke-width="1.6"/></g>
        <path d="M70,40 L78,22 L82,36 L90,20 L92,36 L102,24 L100,42 L110,34 L104,52 L86,56Z" fill="${c[1]}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M84,62 Q86,40 66,36 Q42,32 24,44 Q20,52 28,56 Q46,62 64,60 Q74,66 84,62Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M26,54 Q44,56 62,54" stroke="${INK}" stroke-width="1.6" fill="none"/><path d="M34,55 l1,3 l2,-3 M44,56 l1,3 l2,-3" stroke="${INK}" stroke-width="1" fill="#fff"/>
        ${hornC ? `<path d="M30,44 L22,30 L36,40Z" fill="${hornC}" stroke="${INK}" stroke-width="1.6"/>` : ''}
        <circle cx="62" cy="42" r="7.5" fill="${c[1]}" stroke="${INK}" stroke-width="1.8"/><circle cx="60.5" cy="42" r="5" fill="#ffe17a"/><ellipse cx="59.5" cy="42" rx="1.4" ry="4" fill="${INK}"/>
        <circle cx="30" cy="47" r="1.4" fill="${INK}"/>
      </g>`, 'monster');
  }
  function guardianScout() {
    // the shrines' small ancient robot: a domed head with one glowing eye, spindly legs and a glowing ancient blade
    return svg('0 0 130 140', `${shadow(64, 134, 36)}<defs>${glowFilter('gsg', '#ff9a2e', 2.5)}${glowFilter('gsb', '#3fe0ff', 2)}</defs>
      <g class="m-body hover">
        <g stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M44,98 L24,108 L14,134 M54,102 L46,116 L42,134 M76,102 L86,116 L90,134 M86,98 L106,108 L116,134" stroke="#6f6a5c" stroke-width="6"/>
          <path d="M44,98 L24,108 L14,134 M54,102 L46,116 L42,134 M76,102 L86,116 L90,134 M86,98 L106,108 L116,134" stroke="#ff9a2e" stroke-width="1.4" opacity=".75"/>
        </g>
        <circle cx="24" cy="108" r="3.5" fill="#8c8674" stroke="${INK}" stroke-width="1.4"/><circle cx="106" cy="108" r="3.5" fill="#8c8674" stroke="${INK}" stroke-width="1.4"/>
        <path d="M48,84 h34 l-4,18 h-26z" fill="#7d7768" stroke="${INK}" stroke-width="2"/>
        <g class="m-arm"><path d="M48,88 L30,92" stroke="#6f6a5c" stroke-width="6" stroke-linecap="round"/><path d="M30,92 L8,56" stroke="#ffb36b" stroke-width="6" stroke-linecap="round" filter="url(#gsg)"/><path d="M30,92 L8,56" stroke="#fff3c4" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="92" r="4" fill="#8c8674" stroke="${INK}" stroke-width="1.4"/></g>
        <ellipse cx="65" cy="84" rx="38" ry="10" fill="#8c8674" stroke="${INK}" stroke-width="2.2"/>
        <path d="M28,82 Q28,38 65,34 Q102,38 102,82 Z" fill="#b2ab95" stroke="${INK}" stroke-width="2.4"/>
        <path d="M36,74 Q65,66 94,74 M42,52 Q65,44 88,52 M65,34 V44" stroke="#6f6a5c" stroke-width="1.6" fill="none"/>
        <path d="M34,78 Q65,70 96,78" stroke="#ff9a2e" stroke-width="2" fill="none" filter="url(#gsg)"/>
        <path d="M86,44 l6,-10 l2,12" fill="#8c8674" stroke="${INK}" stroke-width="1.4"/>
        <circle cx="52" cy="60" r="12" fill="#2f2b22" stroke="${INK}" stroke-width="2"/><circle cx="52" cy="60" r="9" fill="none" stroke="#6f6a5c" stroke-width="1.4"/>
        <circle class="eye-glow" cx="52" cy="60" r="6.5" fill="#ff7a1a" filter="url(#gsg)"/><circle cx="52" cy="60" r="2.8" fill="#fff3c4"/>
      </g>`, 'monster');
  }
  function lynel() {
    // the lion-headed centaur: red mane, curling horns, a huge sword and a golden horse body
    const g = id('ly');
    return svg('0 0 180 160', `<defs>${lg(g, '#e2b86f', '#9b6f33')}</defs>${shadow(100, 154, 58)}
      <g class="m-body bob">
        <path d="M166,98 Q184,104 176,134 Q172,118 164,112Z" fill="#b5462c" stroke="${INK}" stroke-width="2"/>
        <path d="M74,96 Q100,82 156,92 Q172,100 164,122 L156,126 L152,146 h-12 l2,-22 L96,126 L92,146 h-12 l0,-24 Q66,114 74,96Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M100,100 q8,10 0,20 M120,98 q8,10 0,22 M140,98 q6,10 0,20" stroke="#9b6f33" stroke-width="2.4" fill="none" opacity=".7"/>
        <path d="M80,144 h12 v6 h-12z M140,144 h12 v6 h-12z" fill="#3a2a1a"/>
        <path d="M60,108 Q54,72 70,58 Q88,50 94,72 L90,108Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <path d="M66,74 Q78,82 88,74 M68,88 Q78,94 88,88" stroke="#9b6f33" stroke-width="1.8" fill="none"/>
        <path d="M90,66 Q104,80 100,98" stroke="${INK}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M90,66 Q104,80 100,98" stroke="#e2b86f" stroke-width="8" stroke-linecap="round" fill="none"/>
        <g class="m-arm"><path d="M64,70 Q42,78 36,96" stroke="${INK}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M64,70 Q42,78 36,96" stroke="#e2b86f" stroke-width="9" stroke-linecap="round" fill="none"/>
          <path d="M42,104 L28,96" stroke="#5a3a22" stroke-width="6" stroke-linecap="round"/><path d="M28,98 L6,10 Q16,6 22,14 L40,92 Z" fill="#e8dcc8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M10,16 l20,76" stroke="#b8a888" stroke-width="2"/>
          <path d="M24,92 L46,86" stroke="#b5462c" stroke-width="5" stroke-linecap="round"/><circle cx="36" cy="96" r="6" fill="#e2b86f" stroke="${INK}" stroke-width="2"/></g>
        <path d="M58,50 L44,46 L52,38 L40,28 L56,26 L52,12 L66,18 L72,4 L80,18 L94,10 L92,26 L106,28 L96,40 L104,52 L90,54 L88,66 L76,60 L66,68Z" fill="#c23b22" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M60,30 Q46,14 58,4 Q56,14 64,22Z M86,26 Q100,14 94,2 Q90,12 82,20Z" fill="#f3e2b8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <ellipse cx="72" cy="40" rx="16" ry="17" fill="#e8c483" stroke="${INK}" stroke-width="2"/>
        <path d="M58,34 Q64,30 70,35 M76,35 Q82,30 88,34" stroke="#7a3a1a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <ellipse cx="64" cy="39" rx="3" ry="2.4" fill="#ffe17a" stroke="${INK}" stroke-width="1"/><ellipse cx="81" cy="39" rx="3" ry="2.4" fill="#ffe17a" stroke="${INK}" stroke-width="1"/><circle cx="63.6" cy="39" r="1.2" fill="${INK}"/><circle cx="80.6" cy="39" r="1.2" fill="${INK}"/>
        <ellipse cx="72" cy="50" rx="9" ry="6" fill="#f6e2b8" stroke="${INK}" stroke-width="1.4"/><path d="M68,45 h8 l-4,4z" fill="${INK}"/>
        <path d="M64,54 Q72,60 80,54" stroke="${INK}" stroke-width="1.6" fill="none"/><path d="M66,55 l1,4 l2,-3 M78,55 l-1,4 l-2,-3" fill="#fff" stroke="${INK}" stroke-width="1"/>
      </g>`, 'monster');
  }

  /* ======================= BLIGHTS & GANON ======================= */
  function blight(element) {
    // Blight Ganons: gaunt malice bodies wrapped in salvaged Guardian armour, a one-eyed mask, and a signature weapon each
    const [glow, deep] = EL[element] || EL.malice; const g = id('bl');
    const horns = {
      fire: `<path d="M42,30 Q22,22 18,2 Q30,14 46,18 M82,30 Q102,22 106,2 Q94,14 78,18" fill="#2a0f24" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M38,24 Q26,16 22,6 M86,24 Q98,16 102,6" stroke="${glow}" stroke-width="1.4" fill="none"/>`,
      water: `<path d="M50,16 L44,-6 L56,12 M62,12 L62,-10 L68,12 M74,16 L80,-6 L68,12" fill="#2a0f24" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
      wind: `<path d="M42,28 Q28,18 30,0 Q36,16 48,20 M82,28 Q96,18 94,0 Q88,16 76,20" fill="#2a0f24" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M40,26 Q20,24 8,30 M84,26 Q104,24 116,30" stroke="#2a0f24" stroke-width="4" stroke-linecap="round"/>`,
      thunder: `<path d="M48,18 L40,4 L50,8 L46,-8 L58,12 M76,18 L84,4 L74,8 L78,-8 L66,12" fill="#2a0f24" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
    }[element] || '';
    const weapons = {
      fire: `<g class="m-arm"><path d="M34,78 Q20,90 18,104" stroke="#2a0f24" stroke-width="10" stroke-linecap="round" fill="none"/>
          <path d="M22,110 Q-14,70 6,8 Q20,4 22,14 Q8,60 30,104 Z" fill="#cfc8b4" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M8,14 Q-6,60 22,106" stroke="${glow}" stroke-width="2.4" fill="none" filter="url(#${g}f)"/>
          <path d="M14,104 h18 M20,104 v14" stroke="#8c8674" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="104" r="5" fill="#2a0f24" stroke="${INK}" stroke-width="1.6"/></g>`,
      water: `<g class="m-arm"><path d="M34,78 Q20,88 18,102" stroke="#2a0f24" stroke-width="9" stroke-linecap="round" fill="none"/>
          <path d="M22,140 L4,4" stroke="#8c8674" stroke-width="5" stroke-linecap="round"/><path d="M-2,18 L2,-8 L12,16 Z" fill="${glow}" stroke="${INK}" stroke-width="2" filter="url(#${g}f)"/><path d="M-4,20 h18" stroke="#8c8674" stroke-width="4" stroke-linecap="round"/>
          <circle cx="18" cy="102" r="5" fill="#2a0f24" stroke="${INK}" stroke-width="1.6"/></g>
        <g><circle cx="104" cy="98" r="18" fill="#8c8674" stroke="${INK}" stroke-width="2.2"/><circle cx="104" cy="98" r="12" fill="none" stroke="#6f6a5c" stroke-width="2"/><circle cx="104" cy="98" r="5" fill="${glow}" filter="url(#${g}f)"/></g>`,
      wind: `<g class="m-arm"><path d="M34,76 Q20,82 10,88" stroke="#2a0f24" stroke-width="11" stroke-linecap="round" fill="none"/>
          <path d="M-14,80 Q-4,74 12,78 L14,100 Q-2,104 -14,98 Z" fill="#8c8674" stroke="${INK}" stroke-width="2"/><path d="M-10,84 h20 M-10,94 h20" stroke="#6f6a5c" stroke-width="1.6"/>
          <circle cx="-14" cy="89" r="8" fill="#2a0f24" stroke="${INK}" stroke-width="1.6"/><circle cx="-14" cy="89" r="5" fill="${glow}" class="eye-glow" filter="url(#${g}f)"/></g>
        <path d="M90,80 Q104,90 102,106" stroke="#2a0f24" stroke-width="8" stroke-linecap="round" fill="none"/>`,
      thunder: `<g class="m-arm"><path d="M34,78 Q20,90 18,104" stroke="#2a0f24" stroke-width="9" stroke-linecap="round" fill="none"/>
          <path d="M20,106 Q-4,70 4,30 L10,30 Q6,70 26,104 Z" fill="#e2e6ee" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M6,40 l5,8 l-6,2 l6,10" stroke="${glow}" stroke-width="2" fill="none" filter="url(#${g}f)"/>
          <circle cx="20" cy="104" r="5" fill="#2a0f24" stroke="${INK}" stroke-width="1.6"/></g>
        <g><path d="M92,76 Q122,80 120,108 Q110,128 94,114 Z" fill="#c9b878" stroke="${INK}" stroke-width="2.2"/><path d="M102,88 l8,8 l-7,2 l8,10" stroke="${glow}" stroke-width="2.4" fill="none" filter="url(#${g}f)"/></g>`,
    }[element] || '';
    const bulk = element === 'fire' ? 1.14 : element === 'water' ? 0.94 : 1;
    const lower = element === 'wind'
      ? `<path d="M48,112 Q44,132 52,150 M62,114 Q62,136 62,156 M76,112 Q80,132 72,150" stroke="#2a0f24" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M50,150 l12,10 l10,-10" stroke="${glow}" stroke-width="2" fill="none" filter="url(#${g}f)"/>`
      : `<path d="M44,112 Q30,132 36,154 M58,114 Q54,136 52,156 M70,114 Q74,136 76,156 M82,112 Q96,130 90,152" stroke="#2a0f24" stroke-width="8" stroke-linecap="round" fill="none"/>
         <path d="M44,112 Q30,132 36,154 M82,112 Q96,130 90,152" stroke="${glow}" stroke-width="1.4" fill="none" opacity=".7"/>`;
    return svg('-20 -10 160 170', `<defs>${rg(g + 'a', glow, glow, 0)}${glowFilter(g + 'f', glow, 3)}${lg(g + 'b', '#4a1b3d', '#1d0a18')}${lg(g + 'm', '#e4dcc4', '#a8a08a')}</defs>
      <ellipse cx="62" cy="80" rx="74" ry="80" fill="url(#${g}a)" opacity=".35" class="aura-pulse"/>
      ${shadow(62, 154, 40)}
      <g class="m-body ${element === 'wind' ? 'hover' : 'bob'}" transform="translate(62 90) scale(${bulk} 1) translate(-62 -90)">
        ${lower}
        <path d="M40,62 Q62,50 84,62 L88,92 Q84,112 62,116 Q40,112 36,92 Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="2.4"/>
        <path d="M46,72 Q62,78 78,72 M46,82 Q62,88 78,82 M48,92 Q62,98 76,92" stroke="#6a2a54" stroke-width="2" fill="none"/>
        <path d="M62,60 V112" stroke="${glow}" stroke-width="2" filter="url(#${g}f)" opacity=".9"/>
        <path d="M30,60 Q36,52 46,56 L44,70 Q34,72 30,60Z M94,60 Q88,52 78,56 L80,70 Q90,72 94,60Z" fill="url(#${g}m)" stroke="${INK}" stroke-width="1.8"/>
        <path d="M44,100 h36 l-5,12 h-26z" fill="url(#${g}m)" stroke="${INK}" stroke-width="1.8"/><path d="M50,106 h24" stroke="${glow}" stroke-width="1.6"/>
        ${weapons}
        ${horns}
        <path d="M36,40 Q38,8 62,6 Q86,8 88,40 Q84,56 72,62 L62,66 L52,62 Q40,56 36,40Z" fill="#2a0f24" stroke="${INK}" stroke-width="2"/>
        <path d="M42,38 Q44,14 62,12 Q80,14 82,38 Q78,50 62,56 Q46,50 42,38Z" fill="url(#${g}m)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M48,24 Q62,18 76,24 M50,46 Q62,52 74,46" stroke="#8a8270" stroke-width="1.6" fill="none"/>
        <path d="M62,12 V22 M62,48 V56" stroke="#8a8270" stroke-width="1.6"/>
        <circle cx="62" cy="34" r="10" fill="#1d0a18" stroke="${INK}" stroke-width="2"/><circle cx="62" cy="34" r="7.5" fill="none" stroke="${deep}" stroke-width="1.4"/>
        <circle class="eye-glow" cx="62" cy="34" r="5.5" fill="${glow}" filter="url(#${g}f)"/><circle cx="62" cy="34" r="2" fill="#fff"/>
      </g>`, 'monster blight el-' + element);
  }
  function calamity() {
    // Calamity Ganon: a towering malice spider-beast with a horned boar-skull face, one burning eye and four stolen weapons
    const g = id('cg');
    return svg('-30 -20 200 190', `<defs>${rg(g + 'a', '#ff2d6f', '#ff2d6f', 0)}${glowFilter(g + 'f', '#ff2d6f', 4)}${lg(g + 'b', '#5a1438', '#14040d')}${lg(g + 'm', '#e0d8c2', '#9e9682')}</defs>
      <ellipse cx="70" cy="80" rx="100" ry="96" fill="url(#${g}a)" opacity=".45" class="aura-pulse"/>
      ${shadow(70, 160, 76)}
      <g class="m-body bob">
        <g stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M40,112 L8,118 L-16,160 M50,118 L30,132 L20,162 M90,118 L110,132 L120,162 M100,112 L132,118 L156,160" stroke="#2a0a1c" stroke-width="9"/>
          <path d="M40,112 L8,118 L-16,160 M100,112 L132,118 L156,160" stroke="#ff2d6f" stroke-width="1.8" filter="url(#${g}f)"/>
        </g>
        <circle cx="8" cy="118" r="5" fill="url(#${g}m)" stroke="${INK}" stroke-width="1.4"/><circle cx="132" cy="118" r="5" fill="url(#${g}m)" stroke="${INK}" stroke-width="1.4"/>
        <path d="M26,74 Q70,44 114,74 L118,112 Q70,134 22,112Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="2.6"/>
        <path d="M34,82 Q70,70 106,82 L102,98 Q70,88 38,98Z" fill="url(#${g}m)" stroke="${INK}" stroke-width="1.8"/>
        <path d="M40,90 Q70,82 100,90" stroke="#ff9a2e" stroke-width="1.6" fill="none"/>
        <path d="M44,104 Q56,112 50,124 M96,104 Q84,112 90,124 M70,96 V124" stroke="#ff2d6f" stroke-width="2.2" fill="none" filter="url(#${g}f)"/>
        <path d="M34,96 Q8,100 -6,118" stroke="#2a0a1c" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M-14,112 h18 v14 h-18z" fill="url(#${g}m)" stroke="${INK}" stroke-width="1.6"/><circle cx="-14" cy="119" r="5" fill="#ff2d6f" class="eye-glow" filter="url(#${g}f)"/>
        <path d="M106,96 Q130,100 140,118" stroke="#2a0a1c" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M140,118 L150,94 Q160,104 152,118 Z" fill="#c9c2b0" stroke="${INK}" stroke-width="1.8"/><path d="M140,118 L146,132" stroke="#8c8674" stroke-width="4"/>
        <g class="m-arm">
          <path d="M28,80 Q0,66 -12,32" stroke="#2a0a1c" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M-12,36 Q-30,0 -16,-16 Q-8,6 -4,32 Z" fill="#cfc8b4" stroke="${INK}" stroke-width="2"/><path d="M-16,-12 Q-24,10 -10,32" stroke="#ff2d6f" stroke-width="1.8" fill="none" filter="url(#${g}f)"/>
          <path d="M112,80 Q140,66 150,32" stroke="#2a0a1c" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M150,40 L160,-14" stroke="#8c8674" stroke-width="4" stroke-linecap="round"/><path d="M154,-6 L162,-22 L166,-4 Z" fill="#ff6a9a" stroke="${INK}" stroke-width="1.6" filter="url(#${g}f)"/>
        </g>
        <path d="M30,54 Q22,46 30,40 Q20,26 34,22 Q30,8 46,10 Q50,-4 62,4 Q70,-10 78,4 Q90,-4 94,10 Q110,8 106,22 Q120,26 110,40 Q118,46 110,54" fill="#ff2d6f" opacity=".55" filter="url(#${g}f)"/>
        <path d="M44,30 Q22,22 14,-4 Q30,10 46,16 M96,30 Q118,22 126,-4 Q110,10 94,16" fill="url(#${g}m)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M40,40 Q42,14 70,10 Q98,14 100,40 Q100,56 88,64 Q80,74 70,74 Q60,74 52,64 Q40,56 40,40Z" fill="url(#${g}m)" stroke="${INK}" stroke-width="2.6"/>
        <path d="M54,58 Q70,52 86,58 Q84,70 70,72 Q56,70 54,58Z" fill="#8a8270" stroke="${INK}" stroke-width="1.6"/><ellipse cx="64" cy="62" rx="2.4" ry="3" fill="#2a0a1c"/><ellipse cx="76" cy="62" rx="2.4" ry="3" fill="#2a0a1c"/>
        <path d="M54,66 Q46,70 46,80 Q52,74 58,70 M86,66 Q94,70 94,80 Q88,74 82,70" fill="#f4eedc" stroke="${INK}" stroke-width="1.6"/>
        <path d="M48,30 Q70,20 92,30" stroke="#ff9a2e" stroke-width="2" fill="none"/>
        <path d="M46,44 Q56,40 60,46 M94,44 Q84,40 80,46" stroke="#6a6250" stroke-width="2" fill="none"/>
        <circle cx="70" cy="40" r="11" fill="#2a0a1c" stroke="${INK}" stroke-width="2"/>
        <circle class="eye-glow" cx="70" cy="40" r="7" fill="#ff2d6f" filter="url(#${g}f)"/><circle cx="70" cy="40" r="2.6" fill="#fff"/>
      </g>`, 'monster calamity');
  }
  function darkBeast() {
    // Dark Beast Ganon: a colossal boar of pure malice with glowing spines, huge tusks and burning eyes
    const g = id('db');
    const spines = Array.from({ length: 9 }, (_, i) => { const x = 56 + i * 15, y = 42 - Math.sin((i / 8) * Math.PI) * 14; return `M${x},${y + 8} L${x + 4},${y - 16} L${x + 10},${y + 8}`; }).join(' ');
    return svg('0 0 220 160', `<defs>${glowFilter(g + 'f', '#ff2d6f', 5)}${lg(g + 'b', '#5a1438', '#1a0510')}</defs>
      ${shadow(110, 154, 92)}
      <g class="m-body bob">
        <path d="${spines}" fill="#ff2d6f" stroke="#ff8ab0" stroke-width="1.4" filter="url(#${g}f)"/>
        <path d="M18,118 Q8,64 62,42 Q120,22 172,42 Q214,62 206,110 Q198,128 178,126 L174,150 h-18 l-2,-22 L130,130 l-2,20 h-16 l-2,-22 L74,128 l-4,22 h-18 l0,-24 Q26,132 18,118Z" fill="url(#${g}b)" stroke="#ff2d6f" stroke-width="2.6" filter="url(#${g}f)"/>
        <path d="M70,60 Q100,50 140,56 M80,80 Q110,72 150,80 M180,70 Q196,80 196,100" stroke="#ff2d6f" stroke-width="2" fill="none" opacity=".75"/>
        <path d="M206,96 Q220,92 218,116 Q212,104 204,108" fill="#5a1438" stroke="#ff2d6f" stroke-width="1.6"/>
        <path d="M28,98 Q6,92 -2,64 Q12,80 32,84 M40,104 Q24,108 14,96 Q26,98 40,96" fill="#f4eedc" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <ellipse cx="22" cy="104" rx="10" ry="8" fill="#3a0a22" stroke="#ff2d6f" stroke-width="1.6"/><circle cx="18" cy="103" r="1.8" fill="#ff2d6f"/><circle cx="25" cy="103" r="1.8" fill="#ff2d6f"/>
        <path d="M36,64 Q46,56 58,62" stroke="#ff8ab0" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="46" cy="72" r="7" fill="#ff2d6f" class="eye-glow" filter="url(#${g}f)"/><circle cx="46" cy="72" r="2.5" fill="#fff"/>
      </g>`, 'monster darkbeast');
  }

  /* ======================= COMPANIONS ======================= */
  function pet(kind) {
    switch (kind) {
      case 'korok': return korok(true);
      case 'chuchu': return chuchu('plain');
      case 'guardian': return svg('0 0 130 140', `<g class="m-body hover"><path d="M36,104 L18,132 M52,108 L44,134 M76,108 L84,134 M92,104 L110,132" stroke="#6f6a5c" stroke-width="7" stroke-linecap="round"/><ellipse cx="64" cy="98" rx="38" ry="14" fill="#8c8674" stroke="${INK}" stroke-width="2"/><path d="M28,92 Q28,40 64,36 Q100,40 100,92 Z" fill="#a8a28d" stroke="${INK}" stroke-width="2.4"/><path d="M34,80 Q64,70 94,80" stroke="#3fe0ff" stroke-width="2.4" fill="none"/><circle cx="64" cy="66" r="12" fill="#1a3a4a" stroke="${INK}" stroke-width="2"/><circle class="eye-glow" cx="64" cy="66" r="7" fill="#3fe0ff"/></g>`, 'pet');
      case 'fairy': return svg('0 0 100 100', `<g class="m-body hover"><ellipse cx="34" cy="40" rx="20" ry="12" fill="#ffd0f0" opacity=".7" transform="rotate(-30 34 40)"/><ellipse cx="66" cy="40" rx="20" ry="12" fill="#ffd0f0" opacity=".7" transform="rotate(30 66 40)"/><circle cx="50" cy="52" r="14" fill="#fff0fa"/><circle cx="50" cy="52" r="22" fill="#ff9ae0" opacity=".35" class="aura-pulse"/></g>`, 'pet');
      case 'chick': return svg('0 0 100 100', `${shadow(50, 94, 20)}<g class="m-body bob"><ellipse cx="50" cy="64" rx="26" ry="24" fill="#ffd23d" stroke="${INK}" stroke-width="2"/><path d="M26,60 Q14,50 18,70 Z M74,60 Q86,50 82,70Z" fill="#f2b81d" stroke="${INK}" stroke-width="1.6"/><circle cx="42" cy="56" r="3.2" fill="${INK}"/><circle cx="58" cy="56" r="3.2" fill="${INK}"/><path d="M46,64 L54,64 L50,72 Z" fill="#ff8a2a" stroke="${INK}" stroke-width="1.2"/><path d="M50,40 q-6,-10 0,-14 q6,4 0,14" fill="#c63b4f"/><path d="M42,88 v6 M58,88 v6" stroke="#ff8a2a" stroke-width="3"/></g>`, 'pet');
      case 'dog': return svg('0 0 120 100', `${shadow(60, 94, 34)}<g class="m-body bob"><path d="M28,58 Q20,40 30,30" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round" fill="none" class="tail"/><ellipse cx="56" cy="62" rx="32" ry="18" fill="#c08850" stroke="${INK}" stroke-width="2"/><path d="M34,74 v18 M46,76 v18 M66,76 v18 M78,74 v18" stroke="#a87038" stroke-width="7" stroke-linecap="round"/><circle cx="90" cy="44" r="16" fill="#c08850" stroke="${INK}" stroke-width="2"/><path d="M80,32 Q74,46 82,52 Z" fill="#8a5a2b" stroke="${INK}" stroke-width="1.5"/><ellipse cx="104" cy="48" rx="7" ry="5" fill="#d8a878" stroke="${INK}" stroke-width="1.5"/><circle cx="109" cy="46" r="2.4" fill="${INK}"/><circle cx="94" cy="40" r="2.4" fill="${INK}"/></g>`, 'pet');
      default: return '';
    }
  }

  /* ======================= HORSES ======================= */
  function horse(h = {}, o = {}) {
    const coat = (window.CATALOG && CATALOG.COATS.find(c => c.id === h.coat)) || { body: '#8b5a2b', mane: '#2a1a10' };
    const saddle = o.saddle && window.CATALOG ? (CATALOG.SADDLES.find(x => x.id === o.saddle) || CATALOG.SADDLES[0]).color : null;
    const g = id('hz');
    const spots = coat.spots ? `<g fill="${coat.spots}" opacity=".85"><circle cx="70" cy="70" r="7"/><circle cx="96" cy="62" r="5"/><circle cx="112" cy="80" r="6"/><circle cx="84" cy="86" r="4"/></g>` : '';
    return svg('0 0 200 150', `<defs>${lg(g, coat.body, shade(coat.body))}</defs>${shadow(100, 144, 64)}
      <g class="hz-body ${o.anim || ''}">
        <path d="M44,68 Q18,74 22,112 Q30,96 38,90" fill="${coat.mane}" stroke="${INK}" stroke-width="2" class="hz-tail"/>
        <g class="hz-legs">
          <path class="leg l1" d="M58,90 L54,134 h10 l2,-40" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
          <path class="leg l2" d="M76,92 L76,136 h10 l0,-42" fill="${shade(coat.body)}" stroke="${INK}" stroke-width="2"/>
          <path class="leg l3" d="M118,92 L116,134 h10 l4,-40" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
          <path class="leg l4" d="M134,88 L138,134 h10 l-2,-44" fill="${shade(coat.body)}" stroke="${INK}" stroke-width="2"/>
          <path d="M53,132 h12 v6 h-12z M75,134 h12 v6 h-12z M115,132 h12 v6 h-12z M137,132 h12 v6 h-12z" fill="#2a2a2a"/>
        </g>
        <ellipse cx="96" cy="76" rx="56" ry="26" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        ${spots}
        <path d="M128,64 Q140,38 156,22 L174,32 Q160,50 150,80 Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M154,18 Q170,14 186,34 Q192,46 184,50 Q172,48 158,38 Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <ellipse cx="184" cy="44" rx="7" ry="6" fill="${shade(coat.body)}"/>
        <path d="M156,16 L160,4 L166,16 Z" fill="${coat.body}" stroke="${INK}" stroke-width="1.8"/>
        <circle cx="170" cy="28" r="2.8" fill="${INK}"/><circle cx="171" cy="27" r=".9" fill="#fff"/>
        <path d="M130,58 Q140,30 156,14 Q150,34 146,44 Q140,56 136,68 Z" fill="${coat.mane}" stroke="${INK}" stroke-width="1.8" class="hz-mane"/>
        ${saddle ? `<path d="M76,52 Q96,44 116,52 L114,70 Q96,74 78,70 Z" fill="${saddle}" stroke="${INK}" stroke-width="2"/><path d="M96,70 v18" stroke="${INK}" stroke-width="2"/><rect x="91" y="86" width="10" height="5" rx="2" fill="#ccc" stroke="${INK}"/><path d="M160,40 L184,46 M150,60 Q130,60 118,56" stroke="#5a3a22" stroke-width="2" fill="none"/>` : ''}
      </g>`, 'horse');
  }
  function shade(hex) { const n = parseInt(hex.slice(1), 16); const r = Math.max(0, (n >> 16) - 40), g2 = Math.max(0, ((n >> 8) & 255) - 40), b = Math.max(0, (n & 255) - 40); return `rgb(${r},${g2},${b})`; }

  /* ======================= ICONS ======================= */
  const icons = {
    heart: (full = true) => `<svg class="ic heart ${full ? 'full' : 'empty'}" viewBox="0 0 24 22"><path d="M12,21 C4,14 1,10 1,6.5 A5.5,5.5 0 0 1 12,4 A5.5,5.5 0 0 1 23,6.5 C23,10 20,14 12,21Z" fill="${full ? '#ff3d5a' : 'rgba(0,0,0,.35)'}" stroke="${full ? '#fff' : 'rgba(255,255,255,.55)'}" stroke-width="1.6"/>${full ? '<path d="M5,6 q1.5,-2.5 4,-1.5" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>' : ''}</svg>`,
    rupee: (color = 'green') => { const c = { green: ['#5ce06a', '#1f8f3a'], blue: ['#5cb8ff', '#1f5fbf'], red: ['#ff5c6a', '#b81f2f'], purple: ['#c97cff', '#6a1fb8'], silver: ['#f2f2f7', '#9a9aaa'], gold: ['#ffe066', '#c99a0c'] }[color]; return `<svg class="ic rupee" viewBox="0 0 16 26"><path d="M8,1 L15,7 L15,19 L8,25 L1,19 L1,7 Z" fill="${c[0]}" stroke="#123" stroke-width="1.2"/><path d="M8,5 L11,8 L11,18 L8,21 L5,18 L5,8 Z" fill="${c[1]}" opacity=".55"/><path d="M4,8 L7,5" stroke="#fff" stroke-width="1.2" opacity=".9"/></svg>`; },
    orb: () => `<svg class="ic orb" viewBox="0 0 24 24"><defs><radialGradient id="orbg" cx="40%" cy="35%"><stop offset="0" stop-color="#fff6d8"/><stop offset=".45" stop-color="#ffb347"/><stop offset="1" stop-color="#e2531f"/></radialGradient></defs><circle cx="12" cy="12" r="10" fill="url(#orbg)" stroke="#7a2a0c" stroke-width="1"/><circle cx="12" cy="12" r="5" fill="none" stroke="#fff4c2" stroke-width="1" opacity=".8"/></svg>`,
    seed: () => `<svg class="ic seed" viewBox="0 0 24 24"><path d="M12,3 Q20,10 17,18 Q12,23 7,18 Q4,10 12,3Z" fill="#e8b33a" stroke="#6b4a10" stroke-width="1.2"/><path d="M12,6 Q14,12 12,19" stroke="#fff2b0" stroke-width="1.2" fill="none"/></svg>`,
    chest: (open = false) => `<svg class="ic chest ${open ? 'open' : ''}" viewBox="0 0 64 52"><rect x="6" y="22" width="52" height="28" rx="3" fill="#8a4f20" stroke="${INK}" stroke-width="2"/><rect x="6" y="30" width="52" height="5" fill="#d4a63a"/><g class="lid"><path d="M6,24 Q6,6 32,6 Q58,6 58,24 Z" fill="#a8622a" stroke="${INK}" stroke-width="2"/><path d="M6,20 h52" stroke="#d4a63a" stroke-width="4"/></g><rect x="28" y="24" width="8" height="12" rx="1.5" fill="#f2d16b" stroke="${INK}" stroke-width="1.5"/></svg>`,
    // Sheikah shrine: dark stone dome with glowing circuit lines (orange until cleared, then blue) and a terminal pedestal
    shrine: (state = 'new') => { const c = state === 'done' ? '#3fe0ff' : state === 'locked' ? '#4a4a4a' : '#ff9a2e'; return `<svg class="ic shrine-ic ${state}" viewBox="0 0 64 60"><ellipse cx="32" cy="55" rx="29" ry="4.5" fill="#000" opacity=".3"/>
      <path d="M4,54 L8,46 H56 L60,54 Z" fill="#4a4740" stroke="${INK}" stroke-width="1.5"/>
      <path d="M10,46 C10,24 18,10 32,8 C46,10 54,24 54,46 Z" fill="#3a3834" stroke="${INK}" stroke-width="2"/>
      <path d="M14,44 C14,26 21,14 32,12 C43,14 50,26 50,44" stroke="${c}" stroke-width="1.6" fill="none" class="glowline"/>
      <path d="M20,44 v-8 q0,-8 6,-11 M44,44 v-8 q0,-8 -6,-11 M26,16 h12" stroke="${c}" stroke-width="1.4" fill="none" class="glowline" opacity=".85"/>
      <path d="M25,46 V34 Q32,27 39,34 V46 Z" fill="${state === 'locked' ? '#222' : c}" opacity=".9" class="glowline"/>
      <path d="M24,22 Q32,15 40,22 Q32,29 24,22Z" fill="none" stroke="${c}" stroke-width="1.5" class="glowline"/><circle cx="32" cy="22" r="2.4" fill="${c}" class="glowline"/><path d="M32,26 l-1.6,4 h3.2z" fill="${c}" class="glowline"/>
      <path d="M48,52 v-8 l4,-2 l2,2 v8" fill="#5a574e" stroke="${INK}" stroke-width="1.2"/><path d="M50,44 h3" stroke="${c}" stroke-width="1.4" class="glowline"/></svg>`; },
    // Sheikah tower: tall stone spire rising from root-like legs, with a domed lookout platform on top
    tower: (lit) => { const c = lit ? '#3fe0ff' : '#ff9a2e'; return `<svg class="ic tower" viewBox="0 0 30 60"><path d="M4,59 Q9,54 11,48 M26,59 Q21,54 19,48 M15,59 V50" stroke="#5a564c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M10,50 L12,14 h6 L20,50 Z" fill="#6d6a5e" stroke="${INK}" stroke-width="1.3"/>
      <path d="M13,20 v26 M17,20 v26" stroke="${c}" stroke-width="1" opacity=".85"/><path d="M12,24 h6 M11.5,34 h7 M11,44 h8" stroke="${c}" stroke-width="1.4"/>
      <path d="M4,15 h22 l-2,-3 h-18 z" fill="#5a574e" stroke="${INK}" stroke-width="1.2"/>
      <path d="M8,12 Q15,2 22,12 Z" fill="#7d7768" stroke="${INK}" stroke-width="1.2"/><path d="M10,10.5 Q15,5 20,10.5" stroke="${c}" stroke-width="1.2" fill="none"/>
      <circle cx="15" cy="7.5" r="1.6" fill="${c}"/></svg>`; },
    // Master Sword: tapered blade with a fuller, blue wing-shaped crossguard, gold gem, blue grip
    sword: () => `<svg class="ic sword" viewBox="0 0 34 92"><path d="M14,8 L17,1 L20,8 L20.5,60 h-7 Z" fill="#eef6ff" stroke="${INK}" stroke-width="1.3"/><path d="M17,6 V58" stroke="#b9cde2" stroke-width="1.6"/>
      <path d="M17,60 C12,60 6,58 2,52 C6,62 10,65 15,66 Z M17,60 C22,60 28,58 32,52 C28,62 24,65 19,66 Z" fill="#3a5fd0" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M13,60 h8 l-1,6 h-6 z" fill="#3a5fd0" stroke="${INK}" stroke-width="1.2"/><path d="M17,61 l2,2.5 l-2,2.5 l-2,-2.5 z" fill="#f2d16b" stroke="${INK}" stroke-width=".8"/>
      <rect x="14.5" y="66" width="5" height="16" rx="1" fill="#4a4fb8" stroke="${INK}" stroke-width="1.2"/><path d="M14.5,70 l5,2 M14.5,74 l5,2 M14.5,78 l5,2" stroke="#2c2f7a" stroke-width="1"/>
      <path d="M12,83 h10 l-2,4 h-6 z" fill="#3a5fd0" stroke="${INK}" stroke-width="1.2"/><circle cx="17" cy="88.5" r="2.4" fill="#f2d16b" stroke="${INK}" stroke-width="1"/></svg>`,
    // Rito Flight Range: a target hanging from a wooden frame on a high perch
    range: () => `<svg class="ic flightrange" viewBox="0 0 64 56"><ellipse cx="32" cy="52" rx="24" ry="4" fill="#000" opacity=".3"/>
      <path d="M14,52 V10 H50 V52" stroke="#7a5230" stroke-width="4" fill="none"/><path d="M10,10 H54" stroke="#5a3a22" stroke-width="4" stroke-linecap="round"/>
      <path d="M26,10 v6 M38,10 v6" stroke="#c9a26a" stroke-width="1.4"/>
      <circle cx="32" cy="30" r="13" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="32" cy="30" r="9.5" fill="#d8402e"/><circle cx="32" cy="30" r="6" fill="#fff"/><circle cx="32" cy="30" r="3" fill="#d8402e"/>
      <path d="M44,22 L36,28" stroke="#5a3a22" stroke-width="1.6"/><path d="M44,22 l3,-2 l-1,3 z M45,20 l3,-1" stroke="#3a7fc9" stroke-width="1.6"/></svg>`,
    // Kass: a Rito bard (blue-feathered bird) with his accordion
    kass: () => `<svg class="ic kass" viewBox="0 0 64 56"><ellipse cx="32" cy="52" rx="20" ry="4" fill="#000" opacity=".3"/>
      <path d="M20,50 Q18,30 32,26 Q46,30 44,50 Z" fill="#3f6fc9" stroke="${INK}" stroke-width="1.6"/>
      <circle cx="32" cy="18" r="11" fill="#4a7fd8" stroke="${INK}" stroke-width="1.6"/><path d="M26,4 Q32,10 30,8 M34,4 Q32,10 34,8" stroke="#ffd23d" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M36,19 L48,22 L36,24 Z" fill="#f2b33a" stroke="${INK}" stroke-width="1.2"/><circle cx="31" cy="16" r="2" fill="${INK}"/>
      <rect x="18" y="32" width="28" height="12" rx="2" fill="#f2ead6" stroke="${INK}" stroke-width="1.4"/><path d="M23,32 v12 M28,32 v12 M33,32 v12 M38,32 v12 M43,32 v12" stroke="#c9a26a" stroke-width="1.2"/>
      <path d="M50,14 q4,-4 6,0 M52,8 v6" stroke="#ffd23d" stroke-width="1.6" fill="none"/><circle cx="51" cy="14" r="1.6" fill="#ffd23d"/></svg>`,
    // Hateno Ancient Tech Lab: a hilltop house with a giant glowing furnace telescope
    lab: () => `<svg class="ic lab" viewBox="0 0 64 56"><ellipse cx="32" cy="52" rx="26" ry="4" fill="#000" opacity=".3"/>
      <path d="M12,50 V28 H44 V50 Z" fill="#f2ead6" stroke="${INK}" stroke-width="1.6"/><path d="M8,30 L28,14 L48,30 Z" fill="#7a3a2a" stroke="${INK}" stroke-width="1.6"/>
      <path d="M24,50 V40 h8 v10" fill="#7a5230" stroke="${INK}" stroke-width="1.2"/><rect x="34" y="34" width="6" height="6" fill="#bfe6ff" stroke="${INK}" stroke-width="1"/>
      <path d="M40,20 L58,8 L61,13 L44,26 Z" fill="#6d6a5e" stroke="${INK}" stroke-width="1.4"/><circle cx="59.5" cy="10.5" r="3" fill="#3fe0ff" stroke="${INK}" stroke-width="1"/>
      <path d="M50,50 V40 h8 v10 z" fill="#5a574e" stroke="${INK}" stroke-width="1.2"/><path d="M52,42 h4 v4 h-4 z" fill="#3fe0ff"/></svg>`,
    // Stable: big round canvas tent topped with a horse head, like the stables all over Hyrule
    stable: () => `<svg class="ic stable" viewBox="0 0 64 56"><ellipse cx="32" cy="52" rx="28" ry="4" fill="#000" opacity=".3"/>
      <path d="M6,50 Q6,30 18,22 Q32,14 46,22 Q58,30 58,50 Z" fill="#e9dcc0" stroke="${INK}" stroke-width="1.8"/>
      <path d="M18,22 Q16,36 14,50 M46,22 Q48,36 50,50 M32,17 V50" stroke="#c4b08a" stroke-width="1.4" fill="none"/>
      <path d="M6,40 Q32,34 58,40" stroke="#b5452e" stroke-width="3" fill="none"/>
      <path d="M26,50 V38 Q32,32 38,38 V50 Z" fill="#5a3a22" stroke="${INK}" stroke-width="1.4"/>
      <path d="M27,20 Q26,8 32,4 Q40,2 44,10 L40,12 Q38,9 35,10 L36,20 Z" fill="#c9a26a" stroke="${INK}" stroke-width="1.6"/><path d="M30,7 l-1,-4 l3,3 M34,4 l1,-3 l1,4" stroke="${INK}" stroke-width="1.2" fill="#c9a26a"/><path d="M28,8 Q26,14 27,20" stroke="#7a4f2a" stroke-width="2.4" fill="none"/><circle cx="37" cy="7.5" r="1" fill="${INK}"/></svg>`,
    // Hateno-style cottage: white walls, timber beams and a deep blue roof
    house: () => `<svg class="ic house" viewBox="0 0 64 56"><ellipse cx="32" cy="52" rx="26" ry="4" fill="#000" opacity=".3"/>
      <path d="M10,50 V26 H54 V50 Z" fill="#f2ead6" stroke="${INK}" stroke-width="1.8"/><path d="M10,34 H54 M22,26 V50 M42,26 V50" stroke="#7a5230" stroke-width="2"/>
      <path d="M4,28 L32,8 L60,28 L54,30 L32,15 L10,30 Z" fill="#3a5fa8" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M28,50 V38 h8 v12" fill="#7a5230" stroke="${INK}" stroke-width="1.4"/><rect x="45" y="37" width="6" height="6" fill="#bfe6ff" stroke="${INK}" stroke-width="1.2"/><rect x="13" y="37" width="6" height="6" fill="#bfe6ff" stroke="${INK}" stroke-width="1.2"/>
      <path d="M44,14 v-6 h5 v10" fill="#8a8478" stroke="${INK}" stroke-width="1.2"/></svg>`,
    rune: (k) => {
      const p = {
        magnesis: '<path d="M7,6 v8 a5,5 0 0 0 10,0 v-8" stroke="currentColor" stroke-width="3" fill="none"/><path d="M5,6 h5 M14,6 h5" stroke="#ff6b6b" stroke-width="3"/>',
        bomb: '<circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15,7 l3,-4" stroke="currentColor" stroke-width="2.4"/><circle cx="19" cy="3" r="1.6" fill="#ffb547"/>',
        stasis: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12,7 v5 l4,3" stroke="currentColor" stroke-width="2.4" fill="none"/>',
        cryonis: '<path d="M5,8 L12,4 L19,8 L19,16 L12,20 L5,16 Z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5,8 L12,12 L19,8 M12,12 V20" stroke="currentColor" stroke-width="1.8"/>',
        read: '<path d="M4,9 h4 l5,-4 v14 l-5,-4 h-4z" fill="currentColor"/><path d="M16,8 q3,4 0,8 M18,5 q6,7 0,14" stroke="currentColor" stroke-width="2" fill="none"/>',
        fury: '<path d="M13,2 L5,13 h6 l-2,9 l9,-12 h-6 z" fill="currentColor"/>',
        arrow: '<path d="M3,21 L19,5 M14,5 h5 v5" stroke="currentColor" stroke-width="2.6" fill="none"/><circle cx="7" cy="17" r="3" fill="#ffb547"/>',
      }[k];
      return `<svg class="ic rune" viewBox="0 0 24 24">${p}</svg>`;
    },
  };


  /* ======================= PARAGLIDER ======================= */
  // Wide arched canopy on a wooden frame, Link hanging from the bar. Fabric patterns follow the game's styles.
  const GLIDER_FABRIC = {
    hylian: { base: '#ecdcae', edge: '#c9a86a', mark: '#a8442e', mark2: '#7a2e20' },
    zora: { base: '#d8eef2', edge: '#7fb9c9', mark: '#2f7fb5', mark2: '#1d5687' },
    goron: { base: '#f0d0a0', edge: '#c08850', mark: '#c2381c', mark2: '#7a2010' },
    rito: { base: '#e4f0d8', edge: '#9cbf88', mark: '#3f8f6a', mark2: '#26604a' },
    royal: { base: '#2f4fa8', edge: '#1d3373', mark: '#f2d16b', mark2: '#c9a227' },
    revali: { base: '#2b4f9e', edge: '#e8eef6', mark: '#f2f6fa', mark2: '#c63b4f' },
    golden: { base: '#ffe17a', edge: '#c99a0c', mark: '#3fae3a', mark2: '#1f6b2a' },
  };
  function glider(kind = 'hylian', withHero = true) {
    const f = GLIDER_FABRIC[kind] || GLIDER_FABRIC.hylian;
    const hero = withHero ? `<g class="gl-hero">
        <path d="M54,54 L50,45 M66,54 L70,45" stroke="#e9c49a" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M52,60 Q60,52 68,60 L67,76 h-14z" fill="#2f63c4" stroke="${INK}" stroke-width="1.5"/>
        <path d="M53,70 h14" stroke="#7a5230" stroke-width="2"/>
        <path d="M55,76 L53,88 M65,76 L68,87" stroke="#6b4a2b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="60" cy="53" r="6.5" fill="#f4d2a8" stroke="${INK}" stroke-width="1.4"/>
        <path d="M53.5,52 Q54,45 60,45 Q66,45 66.5,52 Q63,48 60,49 Q57,48 53.5,52Z" fill="#e6c160" stroke="${INK}" stroke-width="1"/>
        <path d="M60,46 Q66,44 70,50 Q66,49 64,51" fill="#e6c160" stroke="${INK}" stroke-width="1"/>
      </g>` : '';
    return svg('0 0 120 92', `
      <path d="M4,38 C10,14 32,4 60,4 C88,4 110,14 116,38 Q106,33 96,39 Q86,32 76,38 Q68,32 60,37 Q52,32 44,38 Q34,32 24,39 Q14,33 4,38Z" fill="${f.base}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10,32 C18,14 36,8 60,8 C84,8 102,14 110,32" stroke="${f.edge}" stroke-width="2" fill="none"/>
      <path d="M60,5 V37 M40,7 Q42,22 44,38 M80,7 Q78,22 76,38 M22,15 Q23,28 24,39 M98,15 Q97,28 96,39" stroke="${f.edge}" stroke-width="1.3" fill="none"/>
      <path d="M60,12 L67,21 L60,29 L53,21 Z" fill="${f.mark}" stroke="${f.mark2}" stroke-width="1"/><path d="M60,16 L63,21 L60,25 L57,21Z" fill="${f.base}" opacity=".7"/>
      <path d="M38,20 Q46,13 52,18 L50,28 Q42,27 38,20Z M82,20 Q74,13 68,18 L70,28 Q78,27 82,20Z" fill="${f.mark}" stroke="${f.mark2}" stroke-width="1"/>
      <path d="M14,30 Q22,22 30,28 M106,30 Q98,22 90,28 M26,22 Q30,17 34,22 M94,22 Q90,17 86,22" stroke="${f.mark}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M44,38 L52,46 M76,38 L68,46 M24,39 L50,46 M96,39 L70,46" stroke="#6b4a2b" stroke-width="1.2"/>
      <path d="M48,45 h24" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/>
      ${hero}`, 'glider');
  }

  /* ======================= DIVINE BEASTS (small, for map) ======================= */
  function beast(kind, freed) {
    const body = freed ? '#d9d3c0' : '#4a1b3d', line = freed ? '#3fe0ff' : '#ff2d6f';
    const shapes = {
      // Vah Rudania: a giant salamander clinging to the mountain, long curling tail
      maths: '<path d="M4,30 Q2,22 10,22 Q16,16 24,18 L30,14 Q44,10 52,16 Q58,20 54,26 Q60,30 62,22 Q64,32 56,34 Q48,36 42,32 L44,40 h-6 l-2,-6 h-8 l-2,6 h-6 l1,-8 Q12,34 8,32 L2,34 Z"/><path d="M10,22 l-2,-6 l5,4 M18,19 l0,-6 l4,5"/>',
      // Vah Ruta: an elephant with a raised trunk
      english: '<path d="M14,40 Q10,22 22,14 Q34,8 46,14 Q50,16 52,22 Q56,20 58,12 Q62,6 60,16 Q58,26 52,30 L50,42 h-6 v-8 h-20 v8 h-6 v-6 Q14,40 14,40Z"/><path d="M46,16 Q40,22 44,28 Q48,24 46,16Z"/>',
      // Vah Medoh: a great bird with wide swept wings
      verbal: '<path d="M2,26 Q14,14 26,20 Q30,14 34,20 Q48,12 62,24 Q50,24 44,28 Q40,34 34,36 L36,44 L30,38 L26,44 L27,36 Q22,34 20,28 Q12,24 2,26Z"/><path d="M30,16 l2,-8 l3,8"/>',
      // Vah Naboris: a long-legged camel with a humped back
      nonverbal: '<path d="M10,30 Q12,18 22,18 Q26,10 32,16 Q38,10 42,18 Q48,18 50,22 L54,12 Q58,8 62,12 L58,16 L56,28 Q54,32 50,32 L48,46 h-4 l-1,-12 h-18 l-2,12 h-4 l0,-12 Q10,34 10,30Z"/><path d="M10,28 Q4,30 4,38"/>',
    }[kind];
    return `<svg class="beast-ic ${freed ? 'freed' : 'corrupt'}" viewBox="0 0 64 50"><g fill="${body}" stroke="${line}" stroke-width="1.8" stroke-linejoin="round">${shapes}</g><circle cx="${{ maths: 50, english: 40, verbal: 32, nonverbal: 58 }[kind]}" cy="${{ maths: 20, english: 20, verbal: 24, nonverbal: 14 }[kind]}" r="2.4" fill="${line}"/></svg>`;
  }

  /* ======================= WORLD MAP ======================= */
  function worldMap(st) {
    const fog = st.fog || {};
    const tree = (x, y, s = 1, c = '#2f6b3a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,-18 L10,2 H-10Z M0,-10 L12,10 H-12Z" fill="${c}" stroke="#173a20" stroke-width="1"/><rect x="-2" y="10" width="4" height="5" fill="#5a3a22"/></g>`;
    const mtn = (x, y, s, c = '#7b6d5c', snow = '#f2f2f2') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30,0 L-4,-44 L6,-30 L14,-40 L36,0Z" fill="${c}" stroke="#3b3128" stroke-width="1.4"/><path d="M-4,-44 L-12,-30 L-6,-32 L-2,-26 L4,-32 L6,-30Z M14,-40 L9,-33 L14,-30 L18,-34Z" fill="${snow}"/></g>`;
    let trees = '';
    const rnd = (() => { let s = 7; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); })();
    for (let i = 0; i < 46; i++) { const x = 260 + rnd() * 480, y = 260 + rnd() * 300; if (Math.hypot(x - 500, y - 340) < 70) continue; trees += tree(x, y, 0.6 + rnd() * 0.5, rnd() < 0.5 ? '#2f6b3a' : '#3d7f42'); }
    let woods = ''; for (let i = 0; i < 18; i++) woods += tree(430 + rnd() * 120, 100 + rnd() * 70, 0.8 + rnd() * 0.4, '#1f4f2c');
    let snowy = ''; for (let i = 0; i < 8; i++) snowy += mtn(60 + rnd() * 200, 120 + rnd() * 130, 0.8 + rnd() * 0.6, '#9aa6b5', '#fff');
    let lava = ''; for (let i = 0; i < 5; i++) lava += mtn(720 + rnd() * 180, 90 + rnd() * 110, 0.8 + rnd() * 0.5, '#5a3328', '#c94c2a');
    let dunes = ''; for (let i = 0; i < 9; i++) { const x = 70 + rnd() * 230, y = 560 + rnd() * 140; dunes += `<path d="M${x - 40},${y} Q${x},${y - 18} ${x + 40},${y}" stroke="#b8893f" stroke-width="3" fill="none"/>`; }
    const fogBlob = (k, d) => `<g class="fog ${fog[k] ? 'cleared' : ''}" data-fog="${k}"><path d="${d}" fill="url(#fogg)" filter="url(#fogblur)"/></g>`;
    return `<svg class="worldmap" viewBox="0 0 1000 750" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wave" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 Q10,4 20,10 T40,10" stroke="#5fa3c9" stroke-width="1.2" fill="none" opacity=".5"/></pattern>
        <radialGradient id="landg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#8fbf6a"/><stop offset="1" stop-color="#5c8f48"/></radialGradient>
        <radialGradient id="malg"><stop offset="0" stop-color="#ff2d6f" stop-opacity=".9"/><stop offset=".6" stop-color="#a0103f" stop-opacity=".5"/><stop offset="1" stop-color="#a0103f" stop-opacity="0"/></radialGradient>
        <radialGradient id="fogg"><stop offset="0" stop-color="#d7e3ea"/><stop offset="1" stop-color="#9fb3c2"/></radialGradient>
        <filter id="fogblur"><feGaussianBlur stdDeviation="14"/></filter>
        <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="1000" height="750" fill="#2c6f99"/><rect width="1000" height="750" fill="url(#wave)"/>
      <path d="M90,90 C200,30 380,50 520,40 C700,28 880,50 940,150 C985,250 950,380 970,500 C985,620 900,720 760,728 C600,738 420,740 260,730 C120,722 40,650 36,520 C32,380 20,220 90,90Z" fill="#e6d9a8" stroke="#c9b27a" stroke-width="3"/>
      <path d="M104,104 C210,50 380,66 520,56 C690,46 866,66 922,160 C962,255 932,382 952,500 C966,610 888,706 756,712 C600,722 420,724 264,714 C134,706 58,640 54,518 C50,382 40,228 104,104Z" fill="url(#landg)"/>
      <path d="M60,90 C120,70 220,70 300,110 C320,180 300,280 230,320 C150,340 70,300 56,220Z" fill="#dfe8ee" opacity=".92"/>
      ${snowy}
      <path d="M180,200 v-60 M174,200 h12" stroke="#7d7768" stroke-width="6"/><circle cx="180" cy="134" r="10" fill="#c9a26a" stroke="#3b3128"/>
      <path d="M660,60 C760,40 900,60 930,150 C930,240 850,270 760,260 C680,250 640,170 660,60Z" fill="#6b4334" opacity=".95"/>
      ${lava}
      <path d="M800,150 l-36,-70 l20,10 l16,-26 l16,26 l20,-10 Z" fill="#4a2a20" stroke="#2a1510" stroke-width="2"/><path d="M790,86 q10,-14 20,0" stroke="#ff6a1a" stroke-width="5" fill="none" class="lava-glow"/>
      <path d="M760,300 C840,280 930,320 940,420 C930,500 850,520 790,500 C740,470 730,360 760,300Z" fill="#4fa3d9" stroke="#2c6f99" stroke-width="2"/>
      <path d="M840,300 q6,40 0,80" stroke="#e8f6ff" stroke-width="5" fill="none" opacity=".8" class="waterfall"/>
      <path d="M56,520 C120,500 240,520 320,580 C350,650 320,720 250,726 C140,722 60,680 54,600Z" fill="#e3c27a"/>
      ${dunes}
      <path d="M150,640 h30 v-16 h10 v16 h30 v14 h-70z" fill="#c9a26a" stroke="#8a6a3a" stroke-width="1.5"/>
      <path d="M500,340 C560,360 640,350 720,400 C780,440 830,420 900,440" stroke="#6fb7e0" stroke-width="6" fill="none"/>
      <path d="M500,340 C450,400 380,420 320,480" stroke="#6fb7e0" stroke-width="5" fill="none"/>
      ${trees}${woods}
      <ellipse cx="490" cy="140" rx="90" ry="50" fill="#cfe6d0" opacity=".35" filter="url(#fogblur)" class="woods-mist"/>
      <path d="M420,560 C440,520 560,520 590,560 L600,600 C560,630 450,630 410,600Z" fill="#7d9e5c" stroke="#5d4a32" stroke-width="3"/>
      <path d="M470,580 h40 v-20 h-40z" fill="#a69f8a" stroke="#5d4a32" stroke-width="1.5"/>
      <g transform="translate(690 560)"><path d="M0,0 h14 v-12 l7,-6 l7,6 v12 h14 v10 h-42z" fill="#c78a5a" stroke="#5a3a22" stroke-width="1.4"/><path d="M50,4 h12 v-10 l6,-5 l6,5 v10 h10 v8 h-34z" fill="#b5794a" stroke="#5a3a22" stroke-width="1.4"/></g>
      <g class="castle-g">
        <circle cx="500" cy="330" r="${st.calamity ? 0 : 92}" fill="url(#malg)" class="malice-swirl"/>
        <g stroke="#2a1d2a" stroke-width="1.6" stroke-linejoin="round">
          <path d="M448,356 v-22 h8 v-6 h6 v6 h76 v-6 h6 v6 h8 v22 z" fill="${st.calamity ? '#e9e2cf' : '#5a4a5a'}"/>
          <path d="M456,334 v-24 h12 v24 M532,334 v-24 h12 v24 M474,334 v-34 h12 v34 M514,334 v-34 h12 v34" fill="${st.calamity ? '#e9e2cf' : '#5a4a5a'}"/>
          <path d="M454,310 l8,-16 l8,16 z M530,310 l8,-16 l8,16 z M472,300 l8,-18 l8,18 z M512,300 l8,-18 l8,18 z" fill="${st.calamity ? '#3a5fa8' : '#3a2a3a'}"/>
          <path d="M488,334 v-44 h24 v44" fill="${st.calamity ? '#e9e2cf' : '#5a4a5a'}"/><path d="M486,290 l14,-14 l14,14 z" fill="${st.calamity ? '#3a5fa8' : '#3a2a3a'}"/>
          <path d="M494,276 v-14 h12 v14" fill="${st.calamity ? '#e9e2cf' : '#5a4a5a'}"/><path d="M492,262 l8,-24 l8,24 z" fill="${st.calamity ? '#3a5fa8' : '#3a2a3a'}"/>
          <path d="M500,238 v-8" stroke-width="1.4"/>
        </g>
        <path d="M494,346 v-8 q6,-6 12,0 v8 M462,320 h4 M534,320 h4 M478,312 h4 M518,312 h4 M497,300 h6" stroke="#2a1d2a" stroke-width="1.6" fill="#2a1d2a"/>
        ${st.calamity ? '' : '<path class="malice-tendril" d="M440,360 Q470,300 450,250 M560,360 Q530,300 560,240 M480,380 Q500,420 470,450 M530,380 Q520,430 560,460" stroke="#ff2d6f" stroke-width="5" fill="none" opacity=".8" filter="url(#soft)"/>'}
      </g>
      ${fogBlob('verbal', 'M40,80 C120,40 300,60 320,140 C340,260 280,340 180,340 C80,340 30,260 40,80Z')}
      ${fogBlob('maths', 'M640,40 C760,10 950,40 950,160 C950,280 820,300 720,280 C630,260 600,120 640,40Z')}
      ${fogBlob('english', 'M720,280 C840,250 980,300 970,440 C960,540 840,560 760,520 C680,480 660,340 720,280Z')}
      ${fogBlob('nonverbal', 'M40,500 C140,470 300,500 340,580 C370,680 300,750 200,745 C80,740 20,660 40,500Z')}
    </svg>`;
  }


  /* ======================= REGIONAL CHARACTERS ======================= */
  function yunobo() {
    // young Goron: round rocky back, pale belly, white tuft of hair, big friendly grin, yellow scarf
    const g = id('yb');
    return svg('0 0 120 150', `<defs>${lg(g, '#d9a26a', '#a8703e')}</defs>${shadow(60, 145, 36)}
      <g class="h-body">
        <path d="M38,120 l-4,22 h16 l2,-20 M82,120 l4,22 h-16 l-2,-20" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M20,96 Q18,58 60,52 Q102,58 100,96 Q98,128 60,130 Q22,128 20,96Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M34,98 Q60,84 86,98 Q84,124 60,126 Q36,124 34,98Z" fill="#f0d0a8" stroke="${INK}" stroke-width="1.6"/>
        <path d="M44,104 q16,6 32,0 M46,114 q14,5 28,0" stroke="#c99a6a" stroke-width="1.6" fill="none"/>
        <path d="M20,90 Q8,96 10,112 Q16,118 24,112 M100,90 Q112,96 110,112 Q104,118 96,112" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M36,80 Q60,92 84,80 L80,88 Q60,98 40,88Z" fill="#f2c14e" stroke="${INK}" stroke-width="1.6"/>
        <ellipse cx="60" cy="54" rx="26" ry="22" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <path d="M44,34 Q48,18 60,22 Q66,10 74,20 Q84,18 80,36 Q68,30 60,32 Q50,30 44,34Z" fill="#f4f2ea" stroke="${INK}" stroke-width="1.8"/>
        <path d="M46,48 q5,-4 10,0 M64,48 q5,-4 10,0" stroke="#5a3a22" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="51" cy="53" r="3.4" fill="${INK}"/><circle cx="69" cy="53" r="3.4" fill="${INK}"/><circle cx="52" cy="52" r="1" fill="#fff"/><circle cx="70" cy="52" r="1" fill="#fff"/>
        <path d="M58,58 q2,2 4,0" stroke="#7a4a22" stroke-width="2" fill="none"/>
        <path d="M46,64 Q60,76 74,64 Q60,70 46,64Z" fill="#7a2a1a" stroke="${INK}" stroke-width="1.6"/>
        <path d="M36,62 l-6,-2 M84,62 l6,-2" stroke="#7a4a22" stroke-width="2"/>
      </g>`, 'npc yunobo');
  }
  function goronBall() {
    // a Goron curled up for rolling: knobbly rock shell with a peek of tan belly
    return svg('0 0 100 100', `<circle cx="50" cy="52" r="42" fill="#a8703e" stroke="${INK}" stroke-width="3"/>
      <path d="M22,30 l6,-10 l6,8 M44,14 l6,-8 l6,8 M66,18 l8,-6 l4,10 M80,40 l10,-2 l-4,10 M16,56 l-8,2 l6,8" fill="#8a5a2b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M30,44 q8,-8 16,0 M54,36 q8,-8 16,0 M40,64 q8,-8 16,0" stroke="#8a5a2b" stroke-width="3" fill="none"/>
      <path d="M30,74 Q50,92 70,74 Q50,84 30,74Z" fill="#f0d0a8" stroke="${INK}" stroke-width="1.6"/>
      <path d="M40,22 q10,-6 20,0" stroke="#f4f2ea" stroke-width="5" stroke-linecap="round"/>`, 'ball');
  }
  function sidon() {
    // the Zora prince: red shark-like head fin, white chest, big confident grin
    const g = id('sd');
    return svg('0 0 120 150', `<defs>${lg(g, '#ff5a4a', '#c2302a')}</defs>${shadow(60, 145, 28)}
      <g class="h-body">
        <path d="M48,112 l-2,30 h12 l2,-30 M66,112 l2,30 h12 l-4,-30" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M40,72 Q60,62 80,72 L82,116 Q60,122 38,116 Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <path d="M48,74 Q60,104 72,74 Q60,80 48,74Z" fill="#f4f2ea" stroke="${INK}" stroke-width="1.4"/>
        <path d="M44,76 Q60,86 76,76" stroke="#c9a227" stroke-width="3" fill="none"/><circle cx="60" cy="82" r="3" fill="#3fe0ff" stroke="${INK}" stroke-width="1"/>
        <path d="M40,76 Q30,92 34,106 M80,76 Q90,92 86,106" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M40,76 Q30,92 34,106 M80,76 Q90,92 86,106" stroke="#ff5a4a" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <path d="M60,22 Q90,24 104,60 Q90,52 82,58 Q78,46 66,46Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <ellipse cx="60" cy="48" rx="18" ry="20" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <path d="M46,56 Q60,66 74,56 Q66,62 60,62 Q54,62 46,56Z" fill="#f4f2ea" stroke="${INK}" stroke-width="1.4"/>
        <path d="M48,56 l2,4 l2,-3 l2,3 l2,-3 l2,3 l2,-3 l2,3 l2,-3 l2,3 l2,-4" stroke="${INK}" stroke-width=".9" fill="none"/>
        <ellipse cx="53" cy="45" rx="3.2" ry="3.8" fill="#ffe17a" stroke="${INK}" stroke-width="1"/><ellipse cx="67" cy="45" rx="3.2" ry="3.8" fill="#ffe17a" stroke="${INK}" stroke-width="1"/>
        <circle cx="53" cy="45.5" r="1.8" fill="${INK}"/><circle cx="67" cy="45.5" r="1.8" fill="${INK}"/>
        <path d="M42,44 L32,38 L42,52Z M78,44 L88,38 L78,52Z" fill="#f4f2ea" stroke="${INK}" stroke-width="1.4"/>
      </g>`, 'npc sidon');
  }
  function teba() {
    // Rito warrior: white-and-grey feathered bird-man, yellow beak, red scarf, bow on his back
    return svg('0 0 120 150', `${shadow(60, 145, 28)}
      <g class="h-body">
        <path d="M84,40 Q108,80 86,124" stroke="#7a5230" stroke-width="3" fill="none"/><path d="M84,40 L86,124" stroke="#e8e0c8" stroke-width="1"/>
        <path d="M48,116 l-4,26 h4 l2,-4 l2,4 h4 l0,-26 M68,116 l2,26 h4 l2,-4 l2,4 h4 l-4,-26" fill="#f2b33a" stroke="${INK}" stroke-width="1.6"/>
        <path d="M38,74 Q60,62 82,74 L86,118 Q60,126 34,118 Z" fill="#e8eef6" stroke="${INK}" stroke-width="2.2"/>
        <path d="M44,84 l6,6 l6,-6 l6,6 l6,-6 l6,6 M42,98 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6" stroke="#9aa6b5" stroke-width="1.4" fill="none"/>
        <path d="M34,78 Q16,96 20,118 Q30,108 40,104 Z M86,78 Q104,96 100,118 Q90,108 80,104 Z" fill="#c8d0dc" stroke="${INK}" stroke-width="2"/>
        <path d="M42,72 Q60,82 78,72 L76,80 Q60,88 44,80Z" fill="#c63b4f" stroke="${INK}" stroke-width="1.6"/>
        <ellipse cx="60" cy="50" rx="18" ry="20" fill="#f4f6fa" stroke="${INK}" stroke-width="2.2"/>
        <path d="M44,40 Q48,22 60,28 Q70,18 78,32 Q86,30 80,46 Q70,38 60,40 Q52,38 44,40Z" fill="#5a6476" stroke="${INK}" stroke-width="1.8"/>
        <path d="M74,28 Q88,20 96,26 Q86,30 80,36" fill="#5a6476" stroke="${INK}" stroke-width="1.6"/>
        <path d="M46,48 q5,-3 9,0 M65,48 q5,-3 9,0" stroke="#c63b4f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="51" cy="52" r="2.8" fill="${INK}"/><circle cx="69" cy="52" r="2.8" fill="${INK}"/>
        <path d="M54,58 L60,72 L66,58 Q60,55 54,58Z" fill="#f2b33a" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      </g>`, 'npc teba');
  }
  function riju() {
    // the young Gerudo chief: bright red hair in a topknot, golden circlet and jewellery, deep blue and white outfit
    const g = id('rj');
    return svg('0 0 120 150', `<defs>${lg(g, '#ff7a4a', '#c2381c')}</defs>${shadow(60, 145, 26)}
      <g class="h-body">
        <path d="M48,112 Q46,126 46,142 h12 l2,-30 M64,112 l2,30 h12 q0,-16 -2,-30" fill="#f4f2ea" stroke="${INK}" stroke-width="2"/>
        <path d="M44,138 h14 v6 h-14z M64,138 h14 v6 h-14z" fill="#c9a227" stroke="${INK}" stroke-width="1.4"/>
        <path d="M44,96 Q60,92 76,96 L80,116 Q60,122 40,116 Z" fill="#2b3f8a" stroke="${INK}" stroke-width="2"/>
        <path d="M42,100 h36" stroke="#c9a227" stroke-width="3"/>
        <path d="M46,72 Q60,66 74,72 L76,90 Q60,94 44,90Z" fill="#2b3f8a" stroke="${INK}" stroke-width="2"/>
        <path d="M46,90 Q60,96 74,90 L74,98 Q60,100 46,98Z" fill="#9a6a42" stroke="${INK}" stroke-width="1.4"/>
        <path d="M46,74 Q36,90 40,104 M74,74 Q84,90 80,104" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M46,74 Q36,90 40,104 M74,74 Q84,90 80,104" stroke="#9a6a42" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M37,92 h6 M77,92 h6" stroke="#c9a227" stroke-width="3"/>
        <path d="M44,40 Q40,22 60,18 Q80,22 76,40 Q72,30 60,30 Q48,30 44,40Z" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M52,18 Q56,2 66,4 Q74,10 68,20 Q62,14 52,18Z" fill="url(#${g})" stroke="${INK}" stroke-width="1.8"/>
        <ellipse cx="60" cy="46" rx="15" ry="17" fill="#9a6a42" stroke="${INK}" stroke-width="2.2"/>
        <path d="M45,32 Q60,26 75,32" stroke="#c9a227" stroke-width="3" fill="none"/><path d="M57,30 l3,-6 l3,6z" fill="#3fe0ff" stroke="${INK}" stroke-width=".8"/>
        <path d="M44,40 Q40,56 46,66 M76,40 Q80,56 74,66" stroke="#c2381c" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="54" cy="47" rx="2.6" ry="3.4" fill="#fff"/><ellipse cx="66" cy="47" rx="2.6" ry="3.4" fill="#fff"/><circle cx="54.4" cy="47.4" r="1.8" fill="#3b8d4f"/><circle cx="66.4" cy="47.4" r="1.8" fill="#3b8d4f"/>
        <path d="M51,42 q3,-1.6 6,0 M63,42 q3,-1.6 6,0" stroke="#5a2a1a" stroke-width="1.4" fill="none"/>
        <path d="M56,55 q4,2 8,0" stroke="#5a2a1a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <circle cx="45" cy="52" r="2" fill="#c9a227"/><circle cx="75" cy="52" r="2" fill="#c9a227"/>
      </g>`, 'npc riju');
  }
  function sandSeal() {
    // a sand seal towing Link on his shield, seen from the side
    return svg('0 0 160 90', `<ellipse cx="80" cy="82" rx="70" ry="6" fill="#000" opacity=".22"/>
      <path d="M8,74 Q40,80 64,74" stroke="#d8b26a" stroke-width="4" fill="none" opacity=".7"/>
      <path d="M70,72 Q72,48 96,44 Q128,40 146,54 Q154,62 146,70 Q120,80 76,78Z" fill="#c9a26a" stroke="${INK}" stroke-width="2.2"/>
      <path d="M84,74 Q110,68 140,70" stroke="#f0dcb0" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M100,60 Q112,54 124,58 M92,66 Q112,62 132,64" stroke="#a87a4a" stroke-width="2" fill="none"/>
      <path d="M128,44 Q140,36 150,46 Q156,56 146,58 Q136,58 128,52Z" fill="#c9a26a" stroke="${INK}" stroke-width="2"/>
      <circle cx="142" cy="47" r="2.4" fill="${INK}"/><path d="M150,52 l6,-1 M150,54 l6,2" stroke="${INK}" stroke-width="1"/>
      <path d="M112,48 Q118,40 126,44" stroke="#c63b4f" stroke-width="4" fill="none"/>
      <path d="M66,58 L112,50" stroke="#7a5230" stroke-width="1.6"/>
      <ellipse cx="44" cy="74" rx="24" ry="5" fill="#2f55b5" stroke="${INK}" stroke-width="2"/>
      <path d="M38,72 L36,52 M50,72 L50,52" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/>
      <path d="M34,54 Q44,46 54,54 L56,36 Q44,30 34,36Z" fill="#2e73d9" stroke="${INK}" stroke-width="1.8"/>
      <path d="M54,40 L66,56" stroke="#f5cfa8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="46" cy="26" r="9" fill="#f8d6b3" stroke="${INK}" stroke-width="1.8"/><path d="M37,26 Q36,14 46,15 Q56,15 55,24 Q48,20 44,22 Q40,20 37,26Z" fill="#e6c160" stroke="${INK}" stroke-width="1.4"/>
      <path d="M38,22 Q28,24 26,34 Q32,30 38,28" fill="#e6c160" stroke="${INK}" stroke-width="1.2"/><circle cx="50" cy="27" r="1.4" fill="#2e6fbf"/>`, 'sandseal');
  }
  function masterCycle(withHero = true) {
    // the Master Cycle Zero: an ancient Sheikah motorcycle with glowing blue lines and Divine-Beast-style plating
    const hero = withHero ? `<g class="mc-hero">
        <path d="M84,46 L96,62 L82,66" stroke="#5a3a22" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M70,28 Q84,22 92,32 L88,50 Q76,54 70,48Z" fill="#2e73d9" stroke="${INK}" stroke-width="1.8"/>
        <path d="M70,46 h20" stroke="#7a5230" stroke-width="2.4"/>
        <path d="M88,32 L112,38" stroke="#f5cfa8" stroke-width="5" stroke-linecap="round"/><path d="M88,32 L104,36" stroke="#2e73d9" stroke-width="5" stroke-linecap="round"/>
        <circle cx="84" cy="18" r="9" fill="#f8d6b3" stroke="${INK}" stroke-width="1.8"/>
        <path d="M75,18 Q74,6 84,7 Q94,7 93,16 Q86,12 82,14 Q78,12 75,18Z" fill="#e6c160" stroke="${INK}" stroke-width="1.4"/>
        <path d="M76,14 Q62,14 58,20 Q66,20 76,18" fill="#e6c160" stroke="${INK}" stroke-width="1.2"/><path d="M76,18 L70,12 L78,16Z" fill="#f8d6b3" stroke="${INK}" stroke-width="1"/>
        <circle cx="89" cy="19" r="1.4" fill="#2e6fbf"/>
      </g>` : '';
    const wheel = cx => `<circle cx="${cx}" cy="72" r="15" fill="#2b2f38" stroke="${INK}" stroke-width="2.4"/><circle cx="${cx}" cy="72" r="9" fill="#5a5a50" stroke="${INK}" stroke-width="1.4"/><circle cx="${cx}" cy="72" r="11.5" fill="none" stroke="#3fe0ff" stroke-width="1.6" class="mc-glow"/><circle cx="${cx}" cy="72" r="3" fill="#ff9a2e"/>`;
    return svg('0 0 160 92', `<ellipse cx="80" cy="88" rx="64" ry="4" fill="#000" opacity=".25"/>
      ${wheel(36)}${wheel(124)}
      <path d="M36,72 L58,52 M124,72 L112,38" stroke="#6f6a5c" stroke-width="5" stroke-linecap="round"/>
      <path d="M40,56 Q50,40 74,42 L104,44 Q118,46 122,56 L110,62 Q80,66 54,64 Z" fill="#b2ab95" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M48,58 Q80,52 112,56" stroke="#3fe0ff" stroke-width="2" fill="none" class="mc-glow"/>
      <path d="M96,44 Q108,26 122,28 L118,40 Q110,40 104,46Z" fill="#8c8674" stroke="${INK}" stroke-width="2"/>
      <path d="M104,36 q6,-6 12,-4" stroke="#3fe0ff" stroke-width="1.6" fill="none"/>
      <path d="M112,30 L118,22" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="122" cy="34" r="3" fill="#ff9a2e" stroke="${INK}" stroke-width="1"/>
      <path d="M40,56 Q28,52 20,58 L30,62 Z" fill="#8c8674" stroke="${INK}" stroke-width="1.8"/>
      <path d="M62,52 q6,-4 12,0 q-6,4 -12,0z" fill="none" stroke="#ff9a2e" stroke-width="1.4"/><circle cx="68" cy="52" r="1.6" fill="#ff9a2e"/>
      ${hero}`, 'mastercycle');
  }

  window.ART = { yunobo, goronBall, sidon, teba, riju, sandSeal, masterCycle, glider, pet, horse, hero, zelda, oldMan, monk, korok, hestu, beedle, goddess, chuchu, keese, bokoblin, moblin, lizalfos, guardianScout, lynel, blight, calamity, darkBeast, icons, beast, worldMap, EL };
})();
