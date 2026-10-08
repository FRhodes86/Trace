// NON-VERBAL REASONING — every picture is drawn as SVG from a small figure model,
// so the answers are correct by construction (and checked for visual duplicates).
(function () {
  const { int, pick, shuffle, sample, chance } = U;
  const topics = [];

  /* ---------------- Figure model ----------------
     { shape, fill, rot, dots, size, inner }   shape: circle|triangle|square|pentagon|hexagon|star|arrow|cross|heptagon
     fill: none|solid|stripe|grey */
  const SIDES = { triangle: 3, square: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8 };
  const SYM = { circle: 1, triangle: 120, square: 90, pentagon: 72, hexagon: 60, heptagon: 360 / 7, octagon: 45, star: 72, cross: 90, arrow: 360 };
  const SHAPES = ['circle', 'triangle', 'square', 'pentagon', 'hexagon', 'star', 'arrow', 'cross'];
  const FILLS = ['none', 'solid', 'stripe', 'grey'];

  function polyPts(n, r, start = -90) {
    const pts = []; for (let i = 0; i < n; i++) { const a = (start + (360 / n) * i) * Math.PI / 180; pts.push([40 + r * Math.cos(a), 40 + r * Math.sin(a)]); } return pts;
  }
  const P = pts => pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  function shapePath(f) {
    const r = 27 * (f.size || 1);
    const fillCls = `f-${f.fill || 'none'}`;
    let el;
    if (f.shape === 'circle') el = `<circle cx="40" cy="40" r="${r}" class="fig ${fillCls}"/>`;
    else if (SIDES[f.shape]) el = `<polygon points="${P(polyPts(SIDES[f.shape], r, f.shape === 'square' ? -45 : -90))}" class="fig ${fillCls}"/>`;
    else if (f.shape === 'star') { const pts = []; for (let i = 0; i < 10; i++) { const a = (-90 + 36 * i) * Math.PI / 180, rr = i % 2 ? r * 0.45 : r; pts.push([40 + rr * Math.cos(a), 40 + rr * Math.sin(a)]); } el = `<polygon points="${P(pts)}" class="fig ${fillCls}"/>`; }
    else if (f.shape === 'cross') { const a = r * 0.35; el = `<polygon points="${P([[40 - a, 40 - r], [40 + a, 40 - r], [40 + a, 40 - a], [40 + r, 40 - a], [40 + r, 40 + a], [40 + a, 40 + a], [40 + a, 40 + r], [40 - a, 40 + r], [40 - a, 40 + a], [40 - r, 40 + a], [40 - r, 40 - a], [40 - a, 40 - a]])}" class="fig ${fillCls}"/>`; }
    else if (f.shape === 'arrow') { // pointing up, with a notch on one side so it is not symmetric
      el = `<polygon points="${P([[40, 40 - r], [40 + r * 0.7, 40 - r * 0.1], [40 + r * 0.25, 40 - r * 0.1], [40 + r * 0.25, 40 + r], [40 - r * 0.25, 40 + r], [40 - r * 0.25, 40 + r * 0.35], [40 - r * 0.6, 40 + r * 0.35], [40 - r * 0.25, 40 - r * 0.1], [40 - r * 0.7, 40 - r * 0.1]])}" class="fig ${fillCls}"/>`;
    }
    return el;
  }
  function dotsSvg(n, dark) {
    if (!n) return '';
    const pos = [[40, 40], [33, 40, 47, 40], [40, 33, 33, 46, 47, 46], [33, 33, 47, 33, 33, 47, 47, 47], [33, 33, 47, 33, 40, 40, 33, 47, 47, 47], [32, 33, 40, 33, 48, 33, 32, 47, 40, 47, 48, 47]][n - 1];
    let s = ''; for (let i = 0; i < pos.length; i += 2) s += `<circle cx="${pos[i]}" cy="${pos[i + 1]}" r="3.6" class="${dark ? 'dot-light' : 'dot'}"/>`;
    return s;
  }
  function fig(f, cls = '') {
    const inner = f.inner ? shapePath({ shape: f.inner, fill: f.innerFill || 'none', size: 0.4 }) : '';
    return `<svg class="nvr ${cls}" viewBox="0 0 80 80" width="80" height="80"><g transform="rotate(${f.rot || 0} 40 40)">${shapePath(f)}${inner}</g>${dotsSvg(f.dots || 0, f.fill === 'solid')}</svg>`;
  }
  // Visual identity of a figure (rotations that look the same are equal)
  function vkey(f) {
    const sym = SYM[f.shape] || 360; const r = ((Math.round(f.rot || 0) % 360) + 360) % 360;
    const rr = f.shape === 'circle' ? 0 : Math.round(r % sym);
    const ir = f.inner ? `${f.inner}/${f.innerFill || 'none'}` : '';
    return [f.shape, f.fill || 'none', rr, f.dots || 0, f.size || 1, ir].join('|');
  }
  const blank = () => `<svg class="nvr q" viewBox="0 0 80 80" width="80" height="80"><text x="40" y="52" text-anchor="middle" class="qmark">?</text></svg>`;
  const row = (items) => `<div class="nvr-row">${items.join('')}</div>`;

  /** Build an NVR question with figure options. correctFig + candidate distractor figs, deduped visually. */
  function figQ(prompt, visual, correct, candidates, explain, n = 5) {
    const keys = new Set([vkey(correct)]); const opts = [correct];
    for (const c of candidates) { const k = vkey(c); if (keys.has(k)) continue; keys.add(k); opts.push(c); if (opts.length === n) break; }
    if (opts.length < 4) return null;
    const sh = shuffle(opts);
    return { prompt, visual, options: sh.map(f => fig(f, 'nvr-opt')), answer: sh.indexOf(correct), explain, html: true, figs: true };
  }
  const retry = (fn, lv) => { for (let i = 0; i < 40; i++) { const q = fn(lv); if (q) return q; } throw new Error('nvr gen failed'); };
  const clone = (f, ch = {}) => Object.assign({}, f, ch);
  const randFig = (o = {}) => Object.assign({ shape: pick(SHAPES), fill: pick(FILLS), rot: 0, dots: 0, size: 1 }, o);

  /* 1. Odd one out */
  topics.push({
    id: 'n-odd', name: 'Odd One Out', shrine: 'Oman Au Shrine', icon: '🎯',
    lesson: `<p>Four of the pictures share something. One doesn't — find it!</p>
      <p>Check one thing at a time: <b>shape</b>? <b>shading</b>? <b>number of dots</b> or sides? <b>small shape inside</b>? The odd one out breaks the rule that the others all follow.</p>
      <p>Don't be fooled by size or rotation — they are often there just to distract you.</p>`,
    gen(lv) {
      return retry(() => {
        const rules = lv === 1 ? ['shape', 'fill'] : lv === 2 ? ['shape', 'fill', 'dots'] : ['dots', 'inner', 'sides', 'fill'];
        const rule = pick(rules);
        const figs = [];
        const common = { shape: pick(SHAPES), fill: pick(FILLS), dots: int(1, 4), inner: pick(['circle', 'square', 'triangle']) };
        for (let i = 0; i < 5; i++) {
          const f = randFig({ rot: pick([0, 45, 90, 135, 180]), dots: lv === 1 ? 0 : int(0, 4) });
          if (lv === 3 && rule !== 'inner') f.inner = chance(0.5) ? pick(['circle', 'square', 'triangle']) : null;
          if (rule === 'shape') f.shape = common.shape;
          if (rule === 'fill') f.fill = common.fill;
          if (rule === 'dots') { f.dots = common.dots; f.fill = pick(['none', 'grey', 'stripe']); }
          if (rule === 'inner') { f.shape = pick(['circle', 'square', 'triangle', 'pentagon', 'hexagon']); f.inner = f.shape === 'pentagon' || f.shape === 'hexagon' ? pick(['circle', 'square', 'triangle']) : f.shape; f.innerFill = 'solid'; f.fill = pick(['none', 'grey']); }
          if (rule === 'sides') { f.shape = pick(['square', 'hexagon', 'cross']); f.fill = pick(FILLS); }
          figs.push(f);
        }
        if (rule === 'inner') figs.forEach(f => { f.inner = f.shape; });
        const odd = int(0, 4); const o = figs[odd];
        if (rule === 'shape') o.shape = pick(SHAPES.filter(s => s !== common.shape));
        if (rule === 'fill') o.fill = pick(FILLS.filter(s => s !== common.fill));
        if (rule === 'dots') o.dots = pick([0, 1, 2, 3, 4, 5].filter(d => d !== common.dots));
        if (rule === 'inner') o.inner = pick(['circle', 'square', 'triangle'].filter(s => s !== o.shape));
        if (rule === 'sides') o.shape = pick(['triangle', 'pentagon', 'heptagon']);
        // No other attribute may split 4-vs-1, or there'd be two answers.
        const attrs = ['shape', 'fill', 'dots', 'inner'].filter(a => a !== rule && !(rule === 'sides' && a === 'shape') && !(rule === 'inner' && a === 'shape'));
        for (const a of attrs) { const c = {}; figs.forEach(f => (c[f[a] || '-'] = (c[f[a] || '-'] || 0) + 1)); if (Object.values(c).includes(4)) return null; }
        const keys = new Set(figs.map(vkey)); if (keys.size < 5) return null;
        const why = { shape: `The others are all ${common.shape}s.`, fill: `The others all have the same shading.`, dots: `The others all have ${common.dots} dot${common.dots > 1 ? 's' : ''}.`, inner: 'In the others the small shape inside matches the big outer shape.', sides: 'The others all have an even number of sides.' }[rule];
        return { prompt: 'Which picture is the <b>odd one out</b>?', visual: '', options: figs.map(f => fig(f, 'nvr-opt')), answer: odd, explain: why, html: true, figs: true };
      }, lv);
    },
  });

  /* 2. Series */
  topics.push({
    id: 'n-series', name: 'Shape Series', shrine: 'Ja Baij Trial', icon: '➡️',
    lesson: `<p>The pictures change step by step, following a rule. Work out the rule and choose what comes <b>next</b>.</p>
      <p>Look for: something <b>turning</b> (by how many degrees each time?), dots or sides <b>increasing</b>, shading <b>cycling</b> through a pattern, or a shape <b>growing</b>.</p>
      <p>Harder ones have <b>two rules</b> happening at once — check both!</p>`,
    gen(lv) {
      return retry(() => {
        const nRules = lv === 1 ? 1 : 2;
        const rules = sample(lv === 1 ? ['rotate', 'dots', 'sides'] : ['rotate', 'dots', 'fill', 'sides', 'size'], nRules);
        if (rules.includes('rotate') && rules.includes('sides')) return null;
        const step = pick([45, 90]); const dStep = pick([1, -1]);
        const fillCycle = sample(['none', 'stripe', 'solid', 'grey'], 3);
        const startSides = 3;
        const base = { shape: rules.includes('rotate') ? 'arrow' : pick(['triangle', 'square', 'pentagon', 'circle', 'star']), fill: pick(['none', 'grey', 'stripe']), rot: rules.includes('rotate') ? pick([0, 90, 180]) : 0, dots: dStep < 0 ? 5 : 0, size: 1 };
        const sidesNames = ['triangle', 'square', 'pentagon', 'hexagon', 'heptagon'];
        const at = i => {
          const f = clone(base);
          if (rules.includes('rotate')) f.rot = base.rot + step * i;
          if (rules.includes('dots')) f.dots = dStep < 0 ? 5 - i : i + 1;
          if (rules.includes('fill')) f.fill = fillCycle[i % 3];
          if (rules.includes('sides')) f.shape = sidesNames[i];
          if (rules.includes('size')) f.size = [0.55, 0.7, 0.85, 1, 1.15][i];
          return f;
        };
        const seq = [0, 1, 2, 3].map(at); const ans = at(4);
        if (ans.dots < 0) return null;
        const c = [];
        if (rules.includes('rotate')) c.push(clone(ans, { rot: ans.rot - step }), clone(ans, { rot: ans.rot + step }), clone(ans, { rot: ans.rot + 180 }));
        if (rules.includes('dots')) c.push(clone(ans, { dots: Math.max(0, ans.dots + 1) }), clone(ans, { dots: seq[3].dots }));
        if (rules.includes('fill')) c.push(clone(ans, { fill: fillCycle[(4 + 1) % 3] }), clone(ans, { fill: fillCycle[3 % 3] }));
        if (rules.includes('sides')) c.push(clone(ans, { shape: 'hexagon' }), clone(ans, { shape: 'pentagon' }), clone(ans, { shape: 'square' }));
        if (rules.includes('size')) c.push(clone(ans, { size: 0.85 }), clone(ans, { size: 0.55 }));
        // combos that break two rules at once
        c.push(clone(seq[3]), clone(c[0] || ans, c[c.length - 1] ? { dots: c[c.length - 1].dots, fill: c[c.length - 1].fill } : {}));
        const why = rules.map(r => ({ rotate: `the arrow turns ${step}° clockwise each time`, dots: `the number of dots goes ${dStep > 0 ? 'up' : 'down'} by one`, fill: 'the shading repeats in a cycle of three', sides: 'each shape has one more side than the last', size: 'the shape gets bigger each time' }[r])).join(', and ');
        return figQ('Which picture comes <b>next</b> in the series?', row([...seq.map(f => fig(f)), blank()]), ans, shuffle(c), `Rule: ${why}.`);
      }, lv);
    },
  });

  /* 3. Analogies */
  const T = {
    rotate90: { d: 'turns 90° clockwise', f: x => clone(x, { rot: (x.rot || 0) + 90 }) },
    rotate180: { d: 'turns upside down (180°)', f: x => clone(x, { rot: (x.rot || 0) + 180 }) },
    fillSwap: { d: 'swaps white shading for black (and black for white)', f: x => clone(x, { fill: x.fill === 'solid' ? 'none' : x.fill === 'none' ? 'solid' : x.fill }) },
    addDot: { d: 'gains one dot', f: x => clone(x, { dots: (x.dots || 0) + 1 }) },
    shrink: { d: 'gets smaller', f: x => clone(x, { size: 0.6 }) },
    moreSides: { d: 'gains one side', f: x => clone(x, { shape: { triangle: 'square', square: 'pentagon', pentagon: 'hexagon', hexagon: 'heptagon' }[x.shape] || x.shape }) },
  };
  topics.push({
    id: 'n-analogy', name: 'Shape Analogies', shrine: 'Owa Daim Trial', icon: '🔀',
    lesson: `<p>The first picture changes into the second picture in a certain way. Make the <b>same change</b> to the third picture.</p>
      <p>Say the change out loud: "It turns a quarter turn clockwise <i>and</i> goes from white to black." Then do exactly that to the new shape.</p>
      <p>Common changes: rotation, reflection, shading swap, size, adding or removing parts.</p>`,
    gen(lv) {
      return retry(() => {
        const keys = Object.keys(T);
        const chosen = sample(lv === 1 ? ['rotate90', 'fillSwap', 'addDot', 'shrink'] : keys, lv === 1 ? 1 : 2);
        const rotating = chosen.some(k => k.startsWith('rotate'));
        const sideShapes = ['triangle', 'square', 'pentagon'];
        const mk = () => randFig({ shape: rotating ? pick(['arrow', 'triangle', 'pentagon']) : chosen.includes('moreSides') ? pick(sideShapes) : pick(SHAPES), fill: chosen.includes('fillSwap') ? pick(['none', 'solid']) : pick(FILLS), rot: rotating ? pick([0, 90]) : 0, dots: chosen.includes('addDot') ? int(0, 3) : 0 });
        if (rotating && chosen.includes('moreSides')) return null;
        if (chosen.includes('rotate90') && chosen.includes('rotate180')) return null;
        const A = mk(), C = mk(); if (vkey(A) === vkey(C)) return null;
        const apply = (x, ks) => ks.reduce((acc, k) => T[k].f(acc), x);
        const B = apply(A, chosen), D = apply(C, chosen);
        if (vkey(A) === vkey(B) || vkey(C) === vkey(D)) return null;
        const cands = [C];
        chosen.forEach(k => cands.push(apply(C, chosen.filter(x => x !== k))));
        keys.filter(k => !chosen.includes(k)).forEach(k => cands.push(apply(C, [...chosen.slice(1), k]), apply(C, [k])));
        cands.push(clone(D, { rot: (D.rot || 0) + 180 }), clone(D, { fill: D.fill === 'grey' ? 'stripe' : 'grey' }));
        const visual = `<div class="nvr-row">${fig(A)}<span class="arrowto">→</span>${fig(B)}<span class="sep">as</span>${fig(C)}<span class="arrowto">→</span>${blank()}</div>`;
        return figQ('The first picture changes into the second. Which picture goes with the third in the <b>same way</b>?', visual, D, shuffle(cands), `The shape ${chosen.map(k => T[k].d).join(' and ')}.`);
      }, lv);
    },
  });

  /* 4. Matrices */
  const NAME = { shape: 'shape', fill: 'shading', dots: 'number of dots' };
  topics.push({
    id: 'n-matrix', name: 'Matrices', shrine: 'Keh Namut Trial', icon: '🔳',
    lesson: `<p>A grid of pictures follows rules going <b>across</b> the rows and <b>down</b> the columns. One square is missing.</p>
      <p>Look along each row: what stays the same, what changes? Then look down each column. The missing picture must fit <b>both</b> its row and its column.</p>`,
    gen(lv) {
      return retry(() => {
        const n = lv === 3 ? 3 : 2;
        const attrs = sample(lv === 1 ? ['shape', 'fill'] : ['shape', 'fill', 'dots'], 2);
        const vals = { shape: sample(['circle', 'triangle', 'square', 'pentagon', 'star', 'hexagon'], n), fill: sample(FILLS, n), dots: sample([1, 2, 3, 4], n) };
        const base = { shape: pick(['circle', 'square', 'hexagon']), fill: 'none', dots: 0, rot: 0 };
        const cell = (r, c) => { const f = clone(base); f[attrs[0]] = vals[attrs[0]][r]; f[attrs[1]] = vals[attrs[1]][c]; return f; };
        const grid = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) grid.push(r === n - 1 && c === n - 1 ? blank() : fig(cell(r, c)));
        const ans = cell(n - 1, n - 1);
        const cands = [];
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!(r === n - 1 && c === n - 1)) cands.push(cell(r, c));
        const third = ['shape', 'fill', 'dots'].find(a => !attrs.includes(a));
        cands.push(clone(ans, { [third]: third === 'dots' ? 2 : third === 'fill' ? 'stripe' : 'star' }));
        const visual = `<div class="nvr-grid g${n}">${grid.join('')}</div>`;
        return figQ('Which picture completes the grid?', visual, ans, shuffle(cands), `Going across, the ${NAME[attrs[1]]} changes; going down, the ${NAME[attrs[0]]} changes. The missing square needs the ${NAME[attrs[0]]} from its row and the ${NAME[attrs[1]]} from its column.`);
      }, lv);
    },
  });

  /* ---------------- Grid shapes for reflection / rotation ---------------- */
  const norm = cells => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(c => [c[0] - mx, c[1] - my, c[2]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const gkey = cells => norm(cells).map(c => c.join(',')).join(';');
  const rot90 = cells => cells.map(([x, y, m]) => [-y, x, m]);
  const mirX = cells => cells.map(([x, y, m]) => [-x, y, m]);
  const mirY = cells => cells.map(([x, y, m]) => [x, -y, m]);
  function randomPoly(k) {
    const cells = [[0, 0, 0]]; const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
    while (cells.length < k) { const [x, y] = pick(cells); const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!has(x + dx, y + dy) && Math.abs(x + dx) < 3 && Math.abs(y + dy) < 3) cells.push([x + dx, y + dy, 0]); }
    cells[int(0, k - 1)][2] = 1; // one marked (dark) cell
    if (k > 5) cells[int(0, k - 1)][2] = 2; // and a striped cell
    return cells;
  }
  function polySvg(cells, cls = '', mirrorLine = false) {
    const n = norm(cells); const s = 16; const w = Math.max(...n.map(c => c[0])) + 1, h = Math.max(...n.map(c => c[1])) + 1;
    const W = Math.max(80, w * s + 16), H = Math.max(80, h * s + 16); const ox = (W - w * s) / 2, oy = (H - h * s) / 2;
    const rects = n.map(([x, y, m]) => `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" class="fig ${m === 1 ? 'f-solid' : m === 2 ? 'f-stripe' : 'f-grey'}"/>`).join('');
    const line = mirrorLine ? `<line x1="${W - 4}" y1="2" x2="${W - 4}" y2="${H - 2}" class="mirror"/>` : '';
    return `<svg class="nvr ${cls}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${rects}${line}</svg>`;
  }
  function asymPoly(k) {
    for (let i = 0; i < 200; i++) {
      const p = randomPoly(k); const keys = new Set(); let t = p;
      for (let r = 0; r < 4; r++) { keys.add(gkey(t)); keys.add(gkey(mirX(t))); t = rot90(t); }
      if (keys.size === 8) return p;
    }
    return null;
  }
  function polyQ(prompt, visual, correct, cands, explain) {
    const seen = new Set([gkey(correct)]); const opts = [correct];
    for (const c of cands) { const k = gkey(c); if (seen.has(k)) continue; seen.add(k); opts.push(c); if (opts.length === 5) break; }
    const sh = shuffle(opts);
    return { prompt, visual, options: sh.map(c => polySvg(c, 'nvr-opt')), answer: sh.indexOf(correct), explain, html: true, figs: true };
  }

  topics.push({
    id: 'n-reflect', name: 'Reflections', shrine: 'Bosh Kala Trial', icon: '🪞',
    lesson: `<p>A <b>reflection</b> is what you'd see in a mirror. Everything flips across the mirror line: what was on the left is now on the right.</p>
      <p>Trick: pick one special square (like the black one). Is it near the mirror or far from it? In the reflection, it stays the <b>same distance</b> from the mirror — just on the other side.</p>
      <p>Watch out for answers that are only <b>rotated</b> — that's not a reflection!</p>`,
    gen(lv) {
      const p = asymPoly(lv === 1 ? 4 : lv === 2 ? 5 : 6);
      const ans = mirX(p);
      const r = rot90(rot90(p));
      return polyQ('The dashed line is a <b>mirror</b>. Which picture shows the shape <b>reflected</b> in the mirror?', `<div class="nvr-row">${polySvg(p, '', true)}</div>`, ans, [p, r, mirY(p), rot90(p), rot90(ans)], 'In a mirror the shape flips left-to-right. The special squares keep their distance from the mirror line.');
    },
  });

  topics.push({
    id: 'n-rotate', name: 'Rotations', shrine: 'Ta\'loh Naeg Trial', icon: '🔄',
    lesson: `<p>A <b>rotated</b> shape has been turned — like spinning a picture on the table. It has <b>not</b> been flipped over.</p>
      <p>Imagine turning the page. Follow one special square and see where it ends up. If an option could only be made by flipping the shape over, it's a reflection, not a rotation.</p>`,
    gen(lv) {
      const p = asymPoly(lv === 1 ? 4 : lv === 2 ? 5 : 6);
      const turns = int(1, 3); let ans = p; for (let i = 0; i < turns; i++) ans = rot90(ans);
      const m = mirX(p);
      return polyQ('Which picture is the shape on the left <b>rotated</b> (turned, not flipped)?', `<div class="nvr-row">${polySvg(p)}</div>`, ans, shuffle([m, rot90(m), rot90(rot90(m)), rot90(rot90(rot90(m)))]), `It has been turned ${turns * 90}° clockwise. All the other options are mirror images — they can't be made just by turning.`);
    },
  });

  /* 7. Codes */
  topics.push({
    id: 'n-codes', name: 'Shape Codes', shrine: 'Dah Kaso Trial', icon: '🔣',
    lesson: `<p>Each picture has a <b>code</b>. Each letter stands for one feature, such as the shape, the shading or the number of dots.</p>
      <p>Find two pictures that share a letter: what do they have in common? That's what the letter means. Work out every letter, then build the code for the new picture.</p>`,
    gen(lv) {
      return retry(() => {
        const attrs = lv === 3 ? sample(['shape', 'fill', 'dots'], 3) : sample(['shape', 'fill', 'dots'], 2);
        const LET = ['ABC', 'XYZ', 'LMN'];
        const vals = { shape: sample(['circle', 'triangle', 'square', 'star', 'hexagon'], 3), fill: sample(FILLS, 3), dots: sample([1, 2, 3, 4], 3) };
        const code = f => attrs.map((a, i) => LET[i][vals[a].indexOf(f[a])]).join('');
        const make = idx => { const f = { shape: 'circle', fill: 'none', dots: 0, rot: 0 }; attrs.forEach((a, i) => (f[a] = vals[a][idx[i]])); return f; };
        const k = lv === 3 ? 5 : 4;
        const ex = []; const seen = new Set();
        while (ex.length < k) { const idx = attrs.map(() => int(0, 2)); const key = idx.join(); if (seen.has(key)) continue; seen.add(key); ex.push(make(idx)); }
        let tIdx; do { tIdx = attrs.map(() => int(0, 2)); } while (seen.has(tIdx.join()));
        const target = make(tIdx);
        // target features must all be seen, and each letter position must map to only one feature
        for (const a of attrs) if (!ex.some(e => e[a] === target[a])) return null;
        const perms = attrs.length === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
        const codes = ex.map(code);
        const ok = perms.filter(pm => pm.every((ai, pos) => {
          const m = {}; const back = {};
          return ex.every((e, j) => { const v = String(e[attrs[ai]]), l = codes[j][pos]; if ((m[v] && m[v] !== l) || (back[l] && back[l] !== v)) return false; m[v] = l; back[l] = v; return true; });
        }));
        if (ok.length !== 1) return null;
        const ans = code(target);
        const wrong = new Set();
        attrs.forEach((a, i) => { for (let j = 0; j < 3; j++) { const c = ans.split(''); c[i] = LET[i][j]; wrong.add(c.join('')); } });
        wrong.delete(ans);
        const visual = `<div class="nvr-row codes">${ex.map((e, j) => `<figure>${fig(e)}<figcaption>${codes[j]}</figcaption></figure>`).join('')}<figure>${fig(target)}<figcaption>?</figcaption></figure></div>`;
        return U.mc('Each picture has a code. What is the code for the <b>last</b> picture?', ans, shuffle([...wrong]), `${attrs.map((a, i) => `Letter ${i + 1} = ${a === 'dots' ? 'number of dots' : a === 'fill' ? 'shading' : 'shape'}`).join('; ')}. So the code is <b>${ans}</b>.`, { n: 5, visual });
      }, lv);
    },
  });

  /* 8. Cube nets — validity checked by actually "rolling" a cube over the net */
  function foldsToCube(cells) {
    const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
    const start = cells[0]; const seen = new Map(); // "x,y" -> bottom face
    const st = { D: 'D', U: 'U', N: 'N', S: 'S', E: 'E', W: 'W' };
    const roll = (s, dir) => {
      const t = Object.assign({}, s);
      if (dir === 'N') { t.D = s.N; t.S = s.D; t.U = s.S; t.N = s.U; }
      if (dir === 'S') { t.D = s.S; t.N = s.D; t.U = s.N; t.S = s.U; }
      if (dir === 'E') { t.D = s.E; t.W = s.D; t.U = s.W; t.E = s.U; }
      if (dir === 'W') { t.D = s.W; t.E = s.D; t.U = s.E; t.W = s.U; }
      return t;
    };
    const stack = [[start[0], start[1], st]];
    while (stack.length) {
      const [x, y, s] = stack.pop(); const k = x + ',' + y; if (seen.has(k)) continue; seen.set(k, s.D);
      for (const [dx, dy, d] of [[0, -1, 'N'], [0, 1, 'S'], [1, 0, 'E'], [-1, 0, 'W']]) if (has(x + dx, y + dy) && !seen.has((x + dx) + ',' + (y + dy))) stack.push([x + dx, y + dy, roll(s, d)]);
    }
    return new Set(seen.values()).size === 6 && seen.size === 6;
  }
  function randomHex() {
    const cells = [[0, 0]]; const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
    while (cells.length < 6) { const [x, y] = pick(cells); const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!has(x + dx, y + dy)) cells.push([x + dx, y + dy]); }
    return cells;
  }
  function netSvg(cells, cls = '') {
    const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
    const n = cells.map(c => [c[0] - mx, c[1] - my]); const s = 14; const w = Math.max(...n.map(c => c[0])) + 1, h = Math.max(...n.map(c => c[1])) + 1;
    const W = Math.max(80, w * s + 10), H = Math.max(80, h * s + 10); const ox = (W - w * s) / 2, oy = (H - h * s) / 2;
    return `<svg class="nvr ${cls}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${n.map(([x, y]) => `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" class="fig f-none"/>`).join('')}</svg>`;
  }
  const hexKey = cells => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(c => [c[0] - mx, c[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).join(';'); };
  topics.push({
    id: 'n-cubes', name: 'Cube Nets', shrine: 'Kaam Ya\'tak Trial', icon: '🎲',
    lesson: `<p>A <b>net</b> is a flat shape that folds up into a 3D shape. A cube net has <b>6 squares</b>.</p>
      <p>Imagine folding it: pick one square as the bottom and fold the others up. If two squares would land on the <b>same face</b> (overlap), it's not a cube net.</p>
      <p>Clues it <b>won't</b> work: a 2 × 2 block of squares, or more than 4 squares in a straight line.</p>`,
    gen(lv) {
      let good = null; const bad = []; const seen = new Set();
      for (let i = 0; i < 4000 && (!good || bad.length < 3); i++) {
        const h = randomHex(); const k = hexKey(h); if (seen.has(k)) continue; seen.add(k);
        const w = Math.max(...h.map(c => c[0])) - Math.min(...h.map(c => c[0])) + 1, ht = Math.max(...h.map(c => c[1])) - Math.min(...h.map(c => c[1])) + 1;
        if (w > 5 || ht > 5) continue;
        if (foldsToCube(h)) { if (!good) good = h; }
        else if (bad.length < 3) {
          // tier 1 shows obviously-wrong nets; higher tiers show near-misses (no 2x2 block)
          const block = h.some(([x, y]) => h.some(c => c[0] === x + 1 && c[1] === y) && h.some(c => c[0] === x && c[1] === y + 1) && h.some(c => c[0] === x + 1 && c[1] === y + 1));
          if (lv === 1 || !block || chance(0.15)) bad.push(h);
        }
      }
      const opts = shuffle([good, ...bad]);
      const ask = lv === 1 || chance(0.6);
      if (ask) return { prompt: 'Which net will fold to make a <b>cube</b>?', visual: '', options: opts.map(c => netSvg(c, 'nvr-opt')), answer: opts.indexOf(good), explain: 'Only this one folds with no two squares landing on the same face. Try imagining it folding up around a bottom square.', html: true, figs: true };
      // reverse: which will NOT fold — 3 good, 1 bad
      const goods = [good]; for (let i = 0; i < 4000 && goods.length < 3; i++) { const h = randomHex(); if (foldsToCube(h) && !goods.some(g => hexKey(g) === hexKey(h))) goods.push(h); }
      const odd = bad[0]; const o2 = shuffle([...goods, odd]);
      return { prompt: 'Which net will <b>NOT</b> fold to make a cube?', visual: '', options: o2.map(c => netSvg(c, 'nvr-opt')), answer: o2.indexOf(odd), explain: 'When folded, two squares of this net would overlap on the same face, leaving one side of the cube open.', html: true, figs: true };
    },
  });

  window.CONTENT = window.CONTENT || {};
  window.CONTENT.nonverbal = topics;
  window.NVR = { fig, foldsToCube };
})();
