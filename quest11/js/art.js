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
    mirror: `<ellipse cx="40" cy="92" rx="15" ry="19" fill="#dfe8f0" stroke="#8a9aaa" stroke-width="3"/><ellipse cx="40" cy="92" rx="10" ry="13" fill="#f8fbff"/><path d="M33,84 l6,-4" stroke="#fff" stroke-width="3" opacity=".9"/>`,
  };
  function hero(o = {}) {
    const f = OUTFITS[o.armour] || OUTFITS.tunic;
    const g = id('hg');
    const W = (window.CATALOG && CATALOG.WEAPONS.find(w => w.id === o.weapon)) || { blade: '#d7dde4', hilt: '#7a5230' };
    const blade = W.blade, hilt = W.hilt;
    const bladeLen = { traveler: 0.85, boko: 0.8, soldier: 1, knight: 1.15, flame: 1.05, frost: 1.05, thunder: 1.05, eightfold: 1.12, royal: 1.12, lynel: 1.15, biggoron: 1.4, goddess: 1.2, master: 1.2 }[o.weapon] || 0.85;
    const SL = (window.CATALOG && (CATALOG.SHIELDS.find(x => x.id === o.shield) || {}).look) || (o.shield === 'none' ? 'pot' : o.shield) || 'pot';
    const shieldSvg = SHIELD_ART[SL] || SHIELD_ART.pot;
    const face = (f.mask
      ? `<path d="M48,48 Q62,58 79,48 L79,60 Q62,66 48,58 Z" fill="${f.mask}" stroke="${INK}" stroke-width="1.5"/><path d="M58,54 l4,3 l4,-3" stroke="${f.trim}" stroke-width="1.5" fill="none"/>`
      : `<path d="M66,57 q4,2 7,0" stroke="#a5604a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`)
      + (f.paint ? `<path d="M70,51 l6,0 M68,54 l8,1" stroke="${f.paint}" stroke-width="1.8" stroke-linecap="round"/>` : '');
    const hat = f.hat ? `<path d="M46,32 Q58,10 80,26 Q60,22 50,40 Q36,60 22,70 Q34,48 46,32Z" fill="${f.hat}" stroke="${INK}" stroke-width="2"/>` : '';
    const band = f.band ? `<path d="M46,33 Q63,26 81,34" stroke="${f.band}" stroke-width="3.5" fill="none"/>` : '';
    const aura = f.aura ? `<ellipse cx="60" cy="85" rx="44" ry="62" fill="${f.aura}" opacity=".18" class="aura-pulse"/>` : '';
    return svg('0 0 120 150', `<defs>${lg(g + 't', f.tunic, f.shade)}${lg(g + 'h', '#ffe08a', '#d9a62e')}${lg(g + 'b', blade, '#9fb4c8', false)}</defs>
      ${shadow(60, 145, 30)}${aura}
      <g class="h-body">
        <g class="h-shield">${shieldSvg}</g>
        <path d="M50,108 h11 v26 h-11z" fill="#8a6a45" stroke="${INK}" stroke-width="2"/>
        <path d="M48,131 h15 v12 h-18 q-1,-7 3,-12z" fill="#4a2f1c" stroke="${INK}" stroke-width="2"/>
        <path d="M63,108 h11 v26 h-11z" fill="#9b7a52" stroke="${INK}" stroke-width="2"/>
        <path d="M61,131 h14 q8,3 8,12 h-22z" fill="#5a3a22" stroke="${INK}" stroke-width="2"/>
        <path d="M43,74 Q60,64 78,74 L84,117 Q60,124 37,117 Z" fill="url(#${g}t)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M62,70 L66,118" stroke="${f.shade}" stroke-width="3" opacity=".5"/>
        <path d="M38,113 Q60,120 83,113" stroke="${f.trim}" stroke-width="3" fill="none"/>
        <path d="M50,72 Q60,82 71,72" stroke="${f.trim}" stroke-width="3" fill="none"/>
        <rect x="41" y="97" width="41" height="6" rx="2" fill="#6b4423" stroke="${INK}" stroke-width="1.5"/>
        <rect x="58" y="96" width="7" height="8" rx="1" fill="#e2b33c" stroke="${INK}" stroke-width="1"/>
        <path d="M44,78 Q34,88 40,104" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M44,78 Q34,88 40,104" stroke="#f5cfa8" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <rect x="55" y="60" width="11" height="10" fill="#f5cfa8" stroke="${INK}" stroke-width="1.5"/>
        <g class="h-head">
          <path d="M46,34 Q28,42 33,70 Q42,58 50,44 Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2"/>
          <ellipse cx="63" cy="46" rx="17" ry="19" fill="#f8d6b3" stroke="${INK}" stroke-width="2.2"/>
          <path d="M48,46 L29,37 L49,54 Z" fill="#f8d6b3" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <path d="M45,44 Q41,22 63,22 Q86,22 81,46 Q78,35 72,34 Q70,42 62,37 Q58,44 50,41 Q48,46 45,44Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2"/>
          <path d="M56,26 Q66,22 74,28" stroke="#fff3c4" stroke-width="2" fill="none" opacity=".8"/>
          <g class="h-eye"><ellipse cx="72" cy="47" rx="2.8" ry="3.8" fill="#2e6fbf"/><circle cx="73" cy="45.6" r="1" fill="#fff"/></g>
          <path d="M68,40.5 q4,-2 7,0" stroke="#b8862a" stroke-width="1.6" fill="none"/>
          ${face}${band}${hat}
        </g>
        <g class="h-arm">
          <g transform="translate(88 92) scale(${bladeLen}) translate(-88 -92)">
            <path d="M86,92 L109,40 L114,42 L91,95 Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M109,40 L112,33 L114,42 Z" fill="${blade}" stroke="${INK}" stroke-width="1.5"/>
            <path d="M99,62 L105,50" stroke="#fff" stroke-width="1.2" opacity=".8"/>
          </g>
          <path d="M80,86 L98,94" stroke="${hilt}" stroke-width="5" stroke-linecap="round"/>
          <path d="M80,86 L98,94" stroke="${INK}" stroke-width="1" fill="none" opacity=".4"/>
          <path d="M86,96 L82,104" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/>
          <path d="M66,76 Q80,80 86,92" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/>
          <path d="M66,76 Q80,80 86,92" stroke="${f.tunic}" stroke-width="7.5" stroke-linecap="round" fill="none"/>
          <circle cx="88" cy="94" r="5.5" fill="#f5cfa8" stroke="${INK}" stroke-width="2"/>
        </g>
      </g>`, 'hero');
  }

  /* ======================= NPCs ======================= */
  function zelda() {
    const g = id('zg');
    return svg('0 0 120 150', `<defs>${lg(g + 'h', '#ffe7a3', '#d8a842')}${lg(g + 'd', '#3b6fd1', '#1f3f8a')}</defs>
      ${shadow(60, 145, 28)}
      <g class="h-body">
        <path d="M44,40 Q36,90 46,104 L52,60 Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2"/>
        <path d="M76,40 Q86,90 74,104 L68,60 Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2"/>
        <path d="M48,110 h10 v26 h-10z M62,110 h10 v26 h-10z" fill="#2b2b3a" stroke="${INK}" stroke-width="2"/>
        <path d="M46,134 h14 v10 h-15z M60,134 h15 v10 h-15z" fill="#6b4a2e" stroke="${INK}" stroke-width="2"/>
        <path d="M44,72 Q60,64 76,72 L80,114 Q60,120 40,114 Z" fill="url(#${g}d)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M52,72 L60,92 L68,72" stroke="#f1e3b5" stroke-width="2.5" fill="none"/>
        <rect x="42" y="96" width="36" height="5" fill="#c9a227" stroke="${INK}" stroke-width="1"/>
        <rect x="55" y="58" width="10" height="10" fill="#f8d6b3" stroke="${INK}" stroke-width="1.5"/>
        <ellipse cx="60" cy="44" rx="17" ry="19" fill="#f8d6b3" stroke="${INK}" stroke-width="2.2"/>
        <path d="M43,46 Q40,20 60,20 Q80,20 77,46 Q74,32 66,30 Q60,38 54,30 Q46,34 43,46Z" fill="url(#${g}h)" stroke="${INK}" stroke-width="2"/>
        <path d="M50,29 Q60,24 70,29" stroke="#c9a227" stroke-width="2.4" fill="none"/>
        <circle cx="60" cy="26" r="2.4" fill="#4fd1ff" stroke="${INK}" stroke-width=".8"/>
        <ellipse cx="54" cy="46" rx="2.6" ry="3.6" fill="#3b7d4f"/><ellipse cx="66" cy="46" rx="2.6" ry="3.6" fill="#3b7d4f"/>
        <circle cx="55" cy="44.6" r=".9" fill="#fff"/><circle cx="67" cy="44.6" r=".9" fill="#fff"/>
        <path d="M56,55 q4,3 8,0" stroke="#b5604a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M43,48 L30,42 L44,55 Z M77,48 L90,42 L76,55 Z" fill="#f8d6b3" stroke="${INK}" stroke-width="1.8"/>
      </g>`, 'npc zelda');
  }
  function oldMan() {
    return svg('0 0 120 150', `${shadow(60, 145, 30)}
      <g class="h-body">
        <path d="M30,140 Q34,70 60,40 Q86,70 90,140 Z" fill="#6b5137" stroke="${INK}" stroke-width="2.4"/>
        <path d="M40,140 Q46,90 60,70 Q74,90 80,140 Z" fill="#584229"/>
        <path d="M38,64 Q60,18 82,64 Q76,46 60,44 Q44,46 38,64Z" fill="#7d6142" stroke="${INK}" stroke-width="2.2"/>
        <ellipse cx="60" cy="62" rx="13" ry="14" fill="#e9c39e" stroke="${INK}" stroke-width="2"/>
        <path d="M47,64 Q60,108 73,64 Q66,72 60,70 Q54,72 47,64Z" fill="#f1f1ea" stroke="${INK}" stroke-width="2"/>
        <path d="M52,60 q3,-2 6,0 M62,60 q3,-2 6,0" stroke="${INK}" stroke-width="1.6" fill="none"/>
        <path d="M86,70 L96,140" stroke="#5a3a22" stroke-width="5" stroke-linecap="round"/>
        <circle cx="86" cy="68" r="5" fill="#ffcf5a" opacity=".85"/>
      </g>`, 'npc');
  }
  function monk() {
    const g = id('mk');
    return svg('0 0 120 150', `<defs>${rg(g, '#7ff3ff', '#3fe0ff', 0)}</defs>
      <circle cx="60" cy="78" r="56" fill="url(#${g})" opacity=".55" class="aura-pulse"/>
      <g class="h-body">
        <path d="M24,138 Q30,96 60,90 Q90,96 96,138 Z" fill="#c26b2b" stroke="${INK}" stroke-width="2.2"/>
        <path d="M36,138 Q44,112 60,108 Q76,112 84,138 Z" fill="#a3541f"/>
        <path d="M40,96 Q60,70 80,96 L74,114 Q60,120 46,114 Z" fill="#d98a3d" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="60" cy="70" rx="14" ry="15" fill="#8b6a52" stroke="${INK}" stroke-width="2"/>
        <path d="M44,62 Q60,36 76,62 Q70,52 60,52 Q50,52 44,62Z" fill="#3a2a1c" stroke="${INK}" stroke-width="2"/>
        <path d="M52,70 q3,2 6,0 M62,70 q3,2 6,0" stroke="${INK}" stroke-width="1.6" fill="none"/>
        <path d="M46,104 Q60,112 74,104" stroke="#f3d27a" stroke-width="3" fill="none"/>
        <circle cx="60" cy="100" r="4" fill="#3fe0ff" stroke="${INK}" stroke-width="1"/>
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
    return svg('0 0 140 160', `${shadow(70, 154, 40)}
      <g class="h-body">
        <path d="M44,150 Q40,90 70,80 Q100,90 96,150 Z" fill="#8a5a2b" stroke="${INK}" stroke-width="2.4"/>
        <path d="M58,150 Q58,110 70,100" stroke="#6b4423" stroke-width="3" fill="none"/>
        <g class="maraca l"><path d="M44,100 L16,82" stroke="#7a5230" stroke-width="6" stroke-linecap="round"/><ellipse cx="12" cy="76" rx="11" ry="9" fill="#e85d3a" stroke="${INK}" stroke-width="2"/></g>
        <g class="maraca r"><path d="M96,100 L124,82" stroke="#7a5230" stroke-width="6" stroke-linecap="round"/><ellipse cx="128" cy="76" rx="11" ry="9" fill="#f2c14e" stroke="${INK}" stroke-width="2"/></g>
        <circle cx="70" cy="56" r="34" fill="#c98d4a" stroke="${INK}" stroke-width="2.4"/>
        <path d="M40,40 Q70,-6 100,40 Q86,28 70,30 Q54,28 40,40Z" fill="#6fcf4f" stroke="${INK}" stroke-width="2"/>
        <circle cx="58" cy="54" r="6" fill="${INK}"/><circle cx="82" cy="54" r="6" fill="${INK}"/>
        <ellipse cx="70" cy="72" rx="7" ry="9" fill="${INK}"/>
        <circle cx="60" cy="52" r="2" fill="#fff"/><circle cx="84" cy="52" r="2" fill="#fff"/>
      </g>`, 'npc hestu');
  }
  function beedle() {
    return svg('0 0 140 150', `${shadow(70, 145, 44)}
      <g class="h-body">
        <path d="M40,40 Q70,0 112,30 L118,128 Q80,142 44,130 Z" fill="#b5835a" stroke="${INK}" stroke-width="2.4"/>
        <path d="M46,60 Q80,48 116,62 M46,90 Q80,78 117,92" stroke="#8a5a2b" stroke-width="3" fill="none"/>
        <path d="M60,6 Q76,-2 96,8 Q86,22 70,22 Q60,18 60,6Z" fill="#e8d6a8" stroke="${INK}" stroke-width="2"/>
        <circle cx="34" cy="96" r="16" fill="#f1cfa8" stroke="${INK}" stroke-width="2"/>
        <path d="M20,90 Q34,70 48,90" fill="#c94c3a" stroke="${INK}" stroke-width="2"/>
        <circle cx="38" cy="98" r="2.6" fill="${INK}"/>
        <path d="M24,110 Q20,140 34,140 Q48,140 44,112" fill="#4b8bd6" stroke="${INK}" stroke-width="2"/>
      </g>`, 'npc beedle');
  }
  function goddess() {
    return svg('0 0 120 170', `<defs>${rg('gdg', '#fff7c2', '#ffd75a', 0)}</defs>
      <circle cx="60" cy="70" r="58" fill="url(#gdg)" opacity=".6" class="aura-pulse"/>
      <path d="M30,166 h60 l-6,-14 h-48z" fill="#8f8a7a" stroke="${INK}" stroke-width="2"/>
      <path d="M36,152 Q36,90 60,70 Q84,90 84,152 Z" fill="#c9c3b0" stroke="${INK}" stroke-width="2.2"/>
      <path d="M36,100 Q14,70 24,40 Q40,70 52,84 M84,100 Q106,70 96,40 Q80,70 68,84" fill="#d8d2bf" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="60" cy="56" rx="14" ry="16" fill="#d8d2bf" stroke="${INK}" stroke-width="2"/>
      <path d="M52,58 q3,2 6,0 M62,58 q3,2 6,0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M50,96 Q60,104 70,96 L60,86 Z" fill="#ffd75a" stroke="${INK}" stroke-width="1.5"/>`, 'npc goddess');
  }

  /* ======================= MONSTERS ======================= */
  const EL = { fire: ['#ff7a45', '#c2381c'], water: ['#5cc8ff', '#1f73c9'], wind: ['#bff2dc', '#4fb08a'], thunder: ['#ffe866', '#d1a30c'], malice: ['#ff4f8b', '#7a0f3c'], plain: ['#7fb4ff', '#3a67c9'] };
  function chuchu(el = 'plain') {
    const [c1, c2] = EL[el] || EL.plain; const g = id('cc');
    return svg('0 0 120 110', `<defs>${rg(g, c1, c2)}</defs>${shadow(60, 104, 36)}
      <g class="m-body squish">
        <path d="M20,98 Q14,48 60,30 Q106,48 100,98 Q60,108 20,98Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <ellipse cx="44" cy="52" rx="10" ry="6" fill="#fff" opacity=".55" transform="rotate(-25 44 52)"/>
        <ellipse cx="48" cy="72" rx="7" ry="10" fill="${INK}"/><ellipse cx="72" cy="72" rx="7" ry="10" fill="${INK}"/>
        <circle cx="50" cy="68" r="2.6" fill="#fff"/><circle cx="74" cy="68" r="2.6" fill="#fff"/>
        <path d="M54,90 Q60,94 66,90" stroke="${INK}" stroke-width="2" fill="none"/>
      </g>`, 'monster');
  }
  function keese(el = 'plain') {
    const c = el === 'fire' ? '#ff7a45' : el === 'thunder' ? '#ffe866' : el === 'water' ? '#7ad3ff' : '#6b4f8f';
    return svg('0 0 140 100', `${shadow(70, 96, 22)}
      <g class="m-body hover">
        <g class="wing l"><path d="M60,44 Q30,10 4,30 Q20,36 14,50 Q30,44 34,58 Q44,48 60,54Z" fill="#3a2c4f" stroke="${INK}" stroke-width="2"/></g>
        <g class="wing r"><path d="M80,44 Q110,10 136,30 Q120,36 126,50 Q110,44 106,58 Q96,48 80,54Z" fill="#3a2c4f" stroke="${INK}" stroke-width="2"/></g>
        <circle cx="70" cy="50" r="18" fill="#4a3866" stroke="${INK}" stroke-width="2.4"/>
        <path d="M56,36 L60,24 L66,34 M84,36 L80,24 L74,34" fill="#4a3866" stroke="${INK}" stroke-width="2"/>
        <circle cx="70" cy="48" r="8" fill="${c}" stroke="${INK}" stroke-width="2"/><circle cx="70" cy="48" r="3" fill="${INK}"/>
        <path d="M62,60 l3,5 l3,-4 l3,4 l3,-4 l3,5" stroke="#fff" stroke-width="1.5" fill="none"/>
      </g>`, 'monster');
  }
  function bokoblin(kind = 'red') {
    const skin = { red: ['#e0574f', '#a8352f'], blue: ['#4f7fe0', '#2f4fa8'], black: ['#4a3d52', '#2a2230'], silver: ['#d9d9e3', '#8f8fa3'] }[kind];
    const g = id('bk');
    return svg('0 0 130 150', `<defs>${lg(g, skin[0], skin[1])}</defs>${shadow(64, 145, 32)}
      <g class="m-body bob">
        <path d="M46,112 l-6,30 h14 l4,-26 M78,112 l6,30 h-14 l-4,-26" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M38,80 Q64,64 90,80 L92,118 Q64,128 36,118Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <ellipse cx="64" cy="100" rx="16" ry="14" fill="#f1d9b8" opacity=".85"/>
        <path d="M38,112 Q64,124 92,112 L88,126 Q64,132 40,126Z" fill="#7a5230" stroke="${INK}" stroke-width="2"/>
        <g class="m-arm"><path d="M30,84 Q18,100 26,112" stroke="${INK}" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M30,84 Q18,100 26,112" stroke="${skin[0]}" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M26,112 L14,64" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/><path d="M14,64 L8,48 L22,52 Z" fill="#cfcfcf" stroke="${INK}" stroke-width="2"/></g>
        <path d="M30,46 L6,30 L28,60 Z M98,46 L122,30 L100,60 Z" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="64" cy="54" rx="34" ry="28" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M60,28 L64,8 L70,28 Z" fill="#f3e2b8" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="64" cy="66" rx="16" ry="11" fill="${skin[1]}" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="58" cy="66" rx="2.6" ry="3.6" fill="${INK}"/><ellipse cx="70" cy="66" rx="2.6" ry="3.6" fill="${INK}"/>
        <ellipse cx="48" cy="48" rx="7" ry="8" fill="#ffe17a" stroke="${INK}" stroke-width="2"/><ellipse cx="80" cy="48" rx="7" ry="8" fill="#ffe17a" stroke="${INK}" stroke-width="2"/>
        <circle cx="49" cy="49" r="3.4" fill="${INK}"/><circle cx="79" cy="49" r="3.4" fill="${INK}"/>
        <path d="M50,76 L54,82 L58,76 M70,76 L74,82 L78,76" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
      </g>`, 'monster');
  }
  function moblin() {
    const g = id('mb');
    return svg('0 0 140 170', `<defs>${lg(g, '#5f86d6', '#334f96')}</defs>${shadow(70, 165, 36)}
      <g class="m-body bob">
        <path d="M50,128 l-8,34 h16 l6,-30 M90,128 l8,34 h-16 l-6,-30" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M36,82 Q70,60 104,82 L106,134 Q70,146 34,134Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M36,128 Q70,140 106,128 L102,144 Q70,150 40,144Z" fill="#5a3a22" stroke="${INK}" stroke-width="2"/>
        <g class="m-arm"><path d="M30,88 Q16,110 26,128" stroke="${INK}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M30,88 Q16,110 26,128" stroke="#5f86d6" stroke-width="10" stroke-linecap="round" fill="none"/>
          <path d="M26,128 L18,52" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/><path d="M12,58 L18,40 L26,58 Z" fill="#cfcfcf" stroke="${INK}" stroke-width="2"/></g>
        <path d="M44,40 L22,20 L40,56 Z M96,40 L118,20 L100,56 Z" fill="#334f96" stroke="${INK}" stroke-width="2"/>
        <path d="M40,54 Q42,22 70,22 Q98,22 100,54 L98,70 Q70,92 42,70Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M58,58 Q70,94 82,58 Q76,52 70,52 Q64,52 58,58Z" fill="#2a3f78" stroke="${INK}" stroke-width="2"/>
        <circle cx="54" cy="46" r="5" fill="#ff6a3d" stroke="${INK}" stroke-width="1.6"/><circle cx="86" cy="46" r="5" fill="#ff6a3d" stroke="${INK}" stroke-width="1.6"/>
        <path d="M60,26 L54,8 L66,24 M80,26 L86,8 L74,24" fill="#e6d6ad" stroke="${INK}" stroke-width="2"/>
      </g>`, 'monster');
  }
  function lizalfos(el = 'plain') {
    const c = el === 'fire' ? ['#e9764a', '#9b3a1e'] : el === 'thunder' ? ['#e9cf4a', '#9b7d1e'] : el === 'water' ? ['#4ab6e9', '#1e5f9b'] : ['#6fcf6a', '#2f7f3a'];
    const g = id('lz');
    return svg('0 0 150 140', `<defs>${lg(g, c[0], c[1])}</defs>${shadow(70, 135, 34)}
      <g class="m-body bob">
        <path d="M44,104 Q10,110 4,84 Q20,98 46,92" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M56,108 l-8,26 h14 l4,-22 M80,108 l6,26 h-14 l-2,-22" fill="url(#${g})" stroke="${INK}" stroke-width="2"/>
        <path d="M46,70 Q68,56 90,72 L88,112 Q66,120 46,110Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <path d="M54,78 Q66,100 76,78" fill="#f2e2a8" opacity=".8"/>
        <g class="m-arm"><path d="M88,80 Q104,88 108,100" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M88,80 Q104,88 108,100" stroke="${c[0]}" stroke-width="6" stroke-linecap="round" fill="none"/>
          <path d="M108,100 L136,52" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><path d="M132,58 L142,40 L140,60 Z" fill="#dcdcdc" stroke="${INK}" stroke-width="1.6"/></g>
        <path d="M66,62 Q70,30 100,34 Q122,38 124,50 Q110,58 92,56 Q82,62 66,62Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M70,40 l4,-12 l4,10 l4,-12 l4,12 l4,-10" fill="${c[1]}" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="96" cy="44" r="5" fill="#ffe17a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="96" cy="44" rx="1.4" ry="4" fill="${INK}"/>
        <path d="M104,54 L120,52" stroke="${INK}" stroke-width="1.6"/>
      </g>`, 'monster');
  }
  function guardianScout() {
    return svg('0 0 130 140', `${shadow(64, 134, 34)}<defs>${glowFilter('gsg', '#ff9a2e', 2.5)}</defs>
      <g class="m-body hover">
        <path d="M36,104 L18,132 M52,108 L44,134 M76,108 L84,134 M92,104 L110,132" stroke="#6f6a5c" stroke-width="7" stroke-linecap="round"/>
        <path d="M36,104 L18,132 M52,108 L44,134 M76,108 L84,134 M92,104 L110,132" stroke="#ff9a2e" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
        <ellipse cx="64" cy="98" rx="38" ry="14" fill="#8c8674" stroke="${INK}" stroke-width="2.2"/>
        <path d="M28,92 Q28,40 64,36 Q100,40 100,92 Z" fill="#a8a28d" stroke="${INK}" stroke-width="2.4"/>
        <path d="M34,80 Q64,70 94,80" stroke="#ff9a2e" stroke-width="2" fill="none" filter="url(#gsg)"/>
        <path d="M44,56 Q64,48 84,56" stroke="#6f6a5c" stroke-width="2" fill="none"/>
        <circle cx="64" cy="66" r="12" fill="#3a3628" stroke="${INK}" stroke-width="2"/>
        <circle class="eye-glow" cx="64" cy="66" r="7" fill="#ff7a1a" filter="url(#gsg)"/><circle cx="64" cy="66" r="3" fill="#fff3c4"/>
      </g>`, 'monster');
  }
  function lynel() {
    const g = id('ly');
    return svg('0 0 180 160', `<defs>${lg(g, '#d9b06b', '#9b6f33')}</defs>${shadow(92, 154, 56)}
      <g class="m-body bob">
        <path d="M60,96 Q92,80 150,92 Q166,100 160,120 L150,124 L146,150 h-12 l2,-26 L80,124 l-4,26 h-12 l0,-28 Q54,112 60,96Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.4"/>
        <path d="M156,100 Q178,104 172,130" stroke="#7a3f1f" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M54,104 Q50,70 64,56 Q80,50 84,70 L80,104Z" fill="url(#${g})" stroke="${INK}" stroke-width="2.2"/>
        <g class="m-arm"><path d="M58,70 Q34,80 30,96" stroke="${INK}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M58,70 Q34,80 30,96" stroke="#d9b06b" stroke-width="8" stroke-linecap="round" fill="none"/>
          <path d="M30,96 L10,30" stroke="#5a3a22" stroke-width="5"/><path d="M4,40 Q2,18 14,14 Q12,30 18,36 Z" fill="#cfd8e0" stroke="${INK}" stroke-width="2"/></g>
        <path d="M48,52 Q36,30 52,18 Q66,4 82,16 Q96,30 86,52 Q76,64 64,62 Q52,62 48,52Z" fill="#b5462c" stroke="${INK}" stroke-width="2.4"/>
        <ellipse cx="66" cy="40" rx="13" ry="14" fill="#e4c07f" stroke="${INK}" stroke-width="2"/>
        <path d="M56,22 L48,6 L60,18 M76,22 L84,6 L72,18" fill="#f3e2b8" stroke="${INK}" stroke-width="2"/>
        <circle cx="61" cy="38" r="2.6" fill="#c0392b"/><circle cx="71" cy="38" r="2.6" fill="#c0392b"/>
        <path d="M60,48 L66,52 L72,48" stroke="${INK}" stroke-width="1.6" fill="none"/>
      </g>`, 'monster');
  }

  /* ======================= BLIGHTS & GANON ======================= */
  function blight(element) {
    const [glow] = EL[element] || EL.malice; const g = id('bl');
    const tendrils = `<path d="M40,150 Q30,120 46,100 M84,150 Q96,122 80,100 M56,152 Q60,126 62,104" stroke="#2a0f24" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M40,150 Q30,120 46,100 M84,150 Q96,122 80,100" stroke="${glow}" stroke-width="1.6" fill="none" opacity=".7"/>`;
    const weapons = {
      fire: `<g class="m-arm"><path d="M30,86 Q14,96 12,112" stroke="#2a0f24" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M12,112 Q-8,60 20,20 Q30,60 22,112 Z" fill="#c9c2b0" stroke="${INK}" stroke-width="2.2"/><path d="M14,96 Q4,64 18,32" stroke="${glow}" stroke-width="2" fill="none"/></g>
        <path d="M44,40 Q30,20 40,6 Q46,26 54,34 M80,40 Q94,20 84,6 Q78,26 70,34" fill="#3a2a34" stroke="${INK}" stroke-width="2"/>`,
      water: `<g class="m-arm"><path d="M30,86 Q16,92 14,104" stroke="#2a0f24" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M14,130 L6,10" stroke="#8c8674" stroke-width="5" stroke-linecap="round"/><path d="M0,22 L6,0 L12,22 Z" fill="${glow}" stroke="${INK}" stroke-width="2"/></g>
        <path d="M94,82 Q116,90 112,118 Q100,128 92,114 Z" fill="#8c8674" stroke="${INK}" stroke-width="2"/>`,
      wind: `<g class="m-arm"><path d="M30,84 Q12,90 4,96" stroke="#2a0f24" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M-8,88 h18 v16 h-18z" fill="#8c8674" stroke="${INK}" stroke-width="2"/><circle cx="-8" cy="96" r="7" fill="${glow}" class="eye-glow"/></g>
        <path d="M36,46 Q20,30 30,18 M88,46 Q104,30 94,18" stroke="#3a2a34" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      thunder: `<g class="m-arm"><path d="M30,86 Q16,96 16,108" stroke="#2a0f24" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M16,108 L-2,40 L4,38 L20,106 Z" fill="#d8dce4" stroke="${INK}" stroke-width="2"/><path d="M4,60 l6,-8 l-2,10 l6,-6" stroke="${glow}" stroke-width="2" fill="none"/></g>
        <path d="M92,78 Q120,84 116,116 Q104,126 94,112 Z" fill="#b8a76a" stroke="${INK}" stroke-width="2"/><path d="M100,92 l8,6 l-6,2 l8,8" stroke="${glow}" stroke-width="2" fill="none"/>`,
    }[element] || '';
    const bulk = element === 'fire' ? 1.12 : element === 'water' ? 0.92 : 1;
    return svg('-20 -10 160 170', `<defs>${rg(g + 'a', glow, glow, 0)}${glowFilter(g + 'f', glow, 3)}${lg(g + 'b', '#4a1b3d', '#1d0a18')}</defs>
      <ellipse cx="62" cy="80" rx="74" ry="80" fill="url(#${g}a)" opacity=".35" class="aura-pulse"/>
      ${shadow(62, 154, 40)}
      <g class="m-body ${element === 'wind' ? 'hover' : 'bob'}" transform="translate(62 90) scale(${bulk} 1) translate(-62 -90)">
        ${element === 'wind' ? '<path d="M44,110 Q40,140 30,156 M62,112 Q64,140 60,158 M80,110 Q88,140 96,154" stroke="#2a0f24" stroke-width="6" stroke-linecap="round" fill="none"/>' : tendrils}
        <path d="M30,64 Q62,44 94,64 L98,112 Q62,126 26,112Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="2.4"/>
        <path d="M36,80 Q48,92 44,110 M88,80 Q76,92 80,110 M52,70 Q62,90 72,70" stroke="${glow}" stroke-width="2" fill="none" filter="url(#${g}f)" opacity=".9"/>
        <path d="M44,92 h36 l-4,14 h-28z" fill="#8c8674" stroke="${INK}" stroke-width="2"/>
        <path d="M50,99 h24" stroke="#ff9a2e" stroke-width="1.6"/>
        ${weapons}
        <path d="M38,48 Q36,14 62,10 Q88,14 86,48 Q74,60 62,60 Q50,60 38,48Z" fill="#b9b3a0" stroke="${INK}" stroke-width="2.4"/>
        <path d="M42,30 Q62,22 82,30" stroke="#6f6a5c" stroke-width="2" fill="none"/>
        <path d="M46,44 Q62,52 78,44" stroke="#6f6a5c" stroke-width="2" fill="none"/>
        <ellipse cx="62" cy="36" rx="9" ry="9" fill="#2a0f24" stroke="${INK}" stroke-width="2"/>
        <circle class="eye-glow" cx="62" cy="36" r="5.5" fill="${glow}" filter="url(#${g}f)"/><circle cx="62" cy="36" r="2" fill="#fff"/>
        <path d="M30,46 Q20,36 28,22 Q36,34 40,40 M94,46 Q104,36 96,22 Q88,34 84,40" fill="#4a1b3d" stroke="${INK}" stroke-width="1.6"/>
      </g>`, 'monster blight el-' + element);
  }
  function calamity() {
    const g = id('cg');
    return svg('-30 -20 200 190', `<defs>${rg(g + 'a', '#ff2d6f', '#ff2d6f', 0)}${glowFilter(g + 'f', '#ff2d6f', 4)}${lg(g + 'b', '#5a1438', '#14040d')}</defs>
      <ellipse cx="70" cy="80" rx="100" ry="96" fill="url(#${g}a)" opacity=".45" class="aura-pulse"/>
      ${shadow(70, 160, 70)}
      <g class="m-body bob">
        <path d="M30,110 Q0,130 -14,160 M44,116 Q24,140 18,162 M96,116 Q116,140 122,162 M110,110 Q140,130 154,160" stroke="#2a0a1c" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M30,110 Q0,130 -14,160 M110,110 Q140,130 154,160" stroke="#ff2d6f" stroke-width="2" fill="none" filter="url(#${g}f)"/>
        <path d="M20,76 Q70,40 120,76 L124,118 Q70,138 16,118Z" fill="url(#${g}b)" stroke="${INK}" stroke-width="2.6"/>
        <path d="M30,90 Q50,104 44,122 M110,90 Q90,104 96,122 M56,80 Q70,104 84,80" stroke="#ff2d6f" stroke-width="2.2" fill="none" filter="url(#${g}f)"/>
        <g class="m-arm"><path d="M24,82 Q-6,66 -16,30" stroke="#2a0a1c" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M-16,30 L-24,-8 L-10,26 Z" fill="#c9c2b0" stroke="${INK}" stroke-width="2"/>
          <path d="M116,82 Q146,66 156,30" stroke="#2a0a1c" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M156,30 L164,-8 L150,26 Z" fill="#c9c2b0" stroke="${INK}" stroke-width="2"/></g>
        <path d="M34,96 Q10,96 -6,110 M106,96 Q130,96 146,110" stroke="#2a0a1c" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M40,58 Q70,-6 100,58 Q86,72 70,72 Q54,72 40,58Z" fill="#c8c0aa" stroke="${INK}" stroke-width="2.6"/>
        <path d="M30,50 Q20,10 46,4 Q44,24 52,36 M110,50 Q120,10 94,4 Q96,24 88,36" fill="#c8c0aa" stroke="${INK}" stroke-width="2"/>
        <path d="M48,36 Q70,24 92,36" stroke="#ff9a2e" stroke-width="2" fill="none"/>
        <circle cx="70" cy="48" r="11" fill="#2a0a1c" stroke="${INK}" stroke-width="2"/>
        <circle class="eye-glow" cx="70" cy="48" r="7" fill="#ff2d6f" filter="url(#${g}f)"/><circle cx="70" cy="48" r="2.6" fill="#fff"/>
        <path d="M24,40 Q4,30 0,6 M116,40 Q136,30 140,6 M60,10 Q58,-10 70,-16 Q82,-10 80,10" stroke="#ff2d6f" stroke-width="3" fill="none" opacity=".7" filter="url(#${g}f)"/>
      </g>`, 'monster calamity');
  }
  function darkBeast() {
    const g = id('db');
    return svg('0 0 220 160', `<defs>${glowFilter(g + 'f', '#ff2d6f', 5)}${lg(g + 'b', '#5a1438', '#1a0510')}</defs>
      ${shadow(110, 154, 90)}
      <g class="m-body bob" filter="url(#${g}f)">
        <path d="M20,120 Q10,60 70,40 Q120,20 170,44 Q214,64 206,110 Q196,128 176,126 L172,150 h-18 l-2,-22 L70,128 l-4,22 h-18 l0,-26 Q26,130 20,120Z" fill="url(#${g}b)" stroke="#ff2d6f" stroke-width="2.6"/>
        <path d="M40,60 Q60,30 90,36 M110,30 Q140,20 170,40 M60,50 l-6,-20 M80,42 l-2,-22 M100,36 l2,-22 M120,34 l6,-20 M140,36 l10,-18" stroke="#ff2d6f" stroke-width="3" fill="none"/>
        <path d="M24,92 Q8,84 2,64 Q16,76 30,78" fill="#e9e2cf" stroke="${INK}" stroke-width="2"/>
        <circle cx="46" cy="72" r="7" fill="#ff2d6f" class="eye-glow"/><circle cx="46" cy="72" r="2.5" fill="#fff"/>
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

  window.ART = { glider, pet, horse, hero, zelda, oldMan, monk, korok, hestu, beedle, goddess, chuchu, keese, bokoblin, moblin, lizalfos, guardianScout, lynel, blight, calamity, darkBeast, icons, beast, worldMap, EL };
})();
