// Regional activities that open once a Divine Beast is freed, plus the Master Cycle Zero run (the reward for 3-starring all of Hyrule).
// Each game draws to a high-DPI canvas; characters are the SVG artwork rendered to images so they stay sharp.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const S = () => State.s;
  const UI = () => Game.ui;
  const K = CATALOG;
  const today = () => new Date().toISOString().slice(0, 10);
  const back = label => `<button class="btn ghost" id="back">${label}</button>`;

  /* ---------------- canvas helpers ---------------- */
  const imgs = {};
  function sprite(key, svgStr, w, h) {
    if (imgs[key]) return imgs[key];
    const im = new Image();
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr.replace('<svg ', `<svg width="${w * 3}" height="${h * 3}" `));
    return (imgs[key] = im);
  }
  const ready = im => im.complete && im.naturalWidth > 0;
  function stage(el, aspect) {
    const cv = document.createElement('canvas'); el.appendChild(cv);
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const W = Math.min(el.clientWidth || 360, 560), H = Math.round(W * aspect);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    return { cv, ctx, W, H };
  }
  function loop(cv, fn) {
    let last = performance.now();
    const tick = now => { if (!cv.isConnected) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt) !== false) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function rupee(ctx, x, y, s, c1 = '#5ce06a', c2 = '#1f8f3a') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(7, -6); ctx.lineTo(7, 6); ctx.lineTo(0, 12); ctx.lineTo(-7, 6); ctx.lineTo(-7, -6); ctx.closePath();
    ctx.fillStyle = c1; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#123'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(3, -4); ctx.lineTo(3, 4); ctx.lineTo(0, 7); ctx.lineTo(-3, 4); ctx.lineTo(-3, -4); ctx.closePath(); ctx.fillStyle = c2; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
    ctx.restore();
  }
  function hud(ctx, W, items) {
    ctx.save(); ctx.font = '700 15px Lexend, system-ui, sans-serif'; ctx.textBaseline = 'middle';
    let x = 10;
    for (const t of items) { const w = ctx.measureText(t).width + 20; rr(ctx, x, 8, w, 28, 14); ctx.fillStyle = 'rgba(9,20,31,.78)'; ctx.fill(); ctx.strokeStyle = 'rgba(150,230,255,.4)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#eef7fd'; ctx.fillText(t, x + 10, 22); x += w + 6; }
    ctx.restore();
  }
  function bindKeys(map) { UI().onKey(e => { const f = map[e.key]; if (f) { e.preventDefault(); f(); } }); }
  function finish(title, html, onDone) { setTimeout(() => UI().modal(`<h3>${title}</h3>${html}`, [{ label: 'Done', cls: 'primary', fn: onDone }]), 500); }

  /* ---------------- shared intro screen ---------------- */
  function intro(cfg) {
    const s = S(); const { screen, hud: topHud, on } = UI();
    screen(`${topHud()}<div class="page center"><div class="page-head">${back(cfg.backLabel)}<h2>${cfg.title}</h2>${cfg.free ? '' : `<span class="pill">🎫 ${s.tickets}</span>`}</div>
      <div class="npc-stand big">${cfg.art}</div>
      <p class="intro slate"><b>${cfg.npc}:</b> "${cfg.text}"</p>
      <p class="muted">${cfg.best}</p>
      <button class="btn big primary glow" id="go">${cfg.free ? '▶ Ride!' : '▶ Play (🎫1)'}</button></div>`, cfg.theme, cfg.music);
    on('#back', cfg.onBack);
    on('#go', () => (cfg.free ? cfg.play() : World.ticketGate(cfg.title, cfg.play)));
  }
  const toRegion = id => () => Game.regionScreen(id);
  function gameScreen(title, extra, theme, music) {
    UI().screen(`<div class="page center mg-page"><h2>${title}</h2><div class="mg-stage" id="mg"></div>${extra}</div>`, theme, music);
    return $('#mg');
  }

  /* ======================= DEATH MOUNTAIN: Yunobo's Rock Roll ======================= */
  // Roll down the mountain in three lanes: dodge lava boulders, scoop up gems.
  function rockRoll() {
    const el = gameScreen('Yunobo\'s Rock Roll', '<div class="mg-ctrl"><button class="btn big" id="l">◀</button><button class="btn big" id="r">▶</button></div>', 'maths', 'battle');
    const { cv, ctx, W, H } = stage(el, 1.25);
    const ball = sprite('goronBall', ART.goronBall(), 80, 80);
    const lanes = [W * 0.25, W * 0.5, W * 0.75]; let lane = 1, px = lanes[1], spin = 0;
    let t = 45, gems = 0, hearts = 3, speed = 190, spawn = 0, scroll = 0, inv = 0, over = false;
    const objs = [], sparks = [];
    const move = d => { if (!over) lane = Math.max(0, Math.min(2, lane + d)); };
    UI().on('#l', () => move(-1)); UI().on('#r', () => move(1));
    cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); move(e.clientX - r.left < r.width / 2 ? -1 : 1); });
    bindKeys({ ArrowLeft: () => move(-1), ArrowRight: () => move(1), a: () => move(-1), d: () => move(1) });
    const py = H - 70;
    loop(cv, dt => {
      if (!over) {
        t -= dt; speed += dt * 6; scroll = (scroll + speed * dt) % 60; spin += dt * speed / 30; inv = Math.max(0, inv - dt);
        spawn -= dt;
        if (spawn <= 0) { spawn = Math.max(0.38, 0.85 - (45 - t) * 0.009); const l = U.int(0, 2); objs.push({ l, y: -30, kind: Math.random() < 0.58 ? 'rock' : 'gem', c: U.pick(['#ff4a5a', '#3fb0ff', '#ffd23d']) }); if (Math.random() < 0.25) objs.push({ l: (l + U.int(1, 2)) % 3, y: -90, kind: 'rock' }); }
        px += (lanes[lane] - px) * Math.min(1, dt * 14);
        for (const o of objs) {
          o.y += speed * dt;
          if (!o.hit && Math.abs(o.y - py) < 30 && Math.abs(lanes[o.l] - px) < 30) {
            o.hit = true;
            if (o.kind === 'gem') { gems++; U.sfx.coin(); for (let i = 0; i < 10; i++) sparks.push({ x: lanes[o.l], y: o.y, vx: (Math.random() - 0.5) * 220, vy: -Math.random() * 220, life: 0.6, c: o.c }); }
            else if (!inv) { hearts--; inv = 1.2; U.sfx.hurt(); FX.shake(1); for (let i = 0; i < 14; i++) sparks.push({ x: px, y: py, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 260, life: 0.7, c: '#ff7a1a' }); }
          }
        }
        for (let i = objs.length - 1; i >= 0; i--) if (objs[i].y > H + 40 || (objs[i].hit && objs[i].kind === 'gem')) objs.splice(i, 1);
        if (t <= 0 || hearts <= 0) {
          over = true; const s = S(); const best = gems > (s.counters.rockBest || 0); State.countMax('rockBest', gems); const prize = gems * 4; s.rupees += prize; State.save();
          finish(hearts <= 0 ? 'Bonk! Out of hearts' : 'Made it down the mountain!', `<p>You collected <b>${gems}</b> gems${best ? ' — a new best! 🏆' : ''}.</p><p>Prize: <b>${prize} rupees</b></p>`, rockIntro);
        }
      }
      // mountain slope with lava rivers at the edges
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a3328'); g.addColorStop(1, '#3a1f18'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2;
      for (let y = -60 + scroll; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(W * 0.12, y); ctx.lineTo(W * 0.88, y + 20); ctx.stroke(); }
      for (const side of [0, 1]) {
        const x0 = side ? W * 0.88 : 0; const lg2 = ctx.createLinearGradient(x0, 0, x0 + W * 0.12, 0);
        lg2.addColorStop(side ? 0 : 1, '#ff9a2e'); lg2.addColorStop(side ? 1 : 0, '#c2381c'); ctx.fillStyle = lg2; ctx.fillRect(x0, 0, W * 0.12, H);
        ctx.fillStyle = 'rgba(255,230,120,.5)'; for (let y = (scroll * 1.5) % 40 - 40; y < H; y += 40) { ctx.beginPath(); ctx.ellipse(x0 + W * 0.06, y, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.setLineDash([10, 14]); ctx.strokeStyle = 'rgba(255,200,150,.18)'; ctx.lineWidth = 2;
      for (const x of [W * 0.375, W * 0.625]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.setLineDash([]);
      for (const o of objs) {
        const x = lanes[o.l];
        if (o.kind === 'rock') {
          const rg = ctx.createRadialGradient(x - 6, o.y - 6, 2, x, o.y, 22); rg.addColorStop(0, '#5a4a44'); rg.addColorStop(1, '#2a1f1c');
          ctx.beginPath(); ctx.arc(x, o.y, 22, 0, Math.PI * 2); ctx.fillStyle = rg; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
          ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 2; ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.moveTo(x - 12, o.y - 4); ctx.lineTo(x - 2, o.y + 2); ctx.lineTo(x + 6, o.y - 8); ctx.moveTo(x - 2, o.y + 2); ctx.lineTo(x + 2, o.y + 14); ctx.stroke(); ctx.shadowBlur = 0;
        } else {
          ctx.save(); ctx.translate(x, o.y); ctx.shadowColor = o.c; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(12, -4); ctx.lineTo(0, 14); ctx.lineTo(-12, -4); ctx.closePath(); ctx.fillStyle = o.c; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1.6; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(12, -4); ctx.moveTo(-5, -4); ctx.lineTo(0, 14); ctx.lineTo(5, -4); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
        }
      }
      if (ready(ball)) { ctx.save(); ctx.globalAlpha = inv > 0 && Math.floor(inv * 10) % 2 ? 0.35 : 1; ctx.translate(px, py); ctx.rotate(spin); ctx.drawImage(ball, -30, -30, 60, 60); ctx.restore(); }
      for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.life -= dt; if (p.life <= 0) { sparks.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); ctx.globalAlpha = 1; }
      hud(ctx, W, [`💎 ${gems}`, `${'❤️'.repeat(Math.max(0, hearts))}`, `⏱ ${Math.max(0, Math.ceil(t))}`]);
    });
  }
  function rockIntro() {
    const s = S();
    intro({ title: 'Yunobo\'s Rock Roll', npc: 'Yunobo', art: ART.yunobo(), backLabel: '◀ Death Mountain', onBack: toRegion('maths'), theme: 'maths', music: 'maths', play: rockRoll,
      text: 'Goro! Curl up and roll down the mountain with me! Dodge the lava boulders and grab every gem you can, goro!', best: `Best run: <b>${s.counters.rockBest || 0}</b> gems. Swipe lanes with ◀ ▶ or tap the left/right side.` });
  }

  /* ======================= ZORA'S DOMAIN: Zora fishing ======================= */
  // Cast, wait patiently through the nibbles, then reel in the moment the bobber is pulled under.
  const FISH = [['fish', 0.55, 'Hyrule Bass'], ['salmon', 0.28, 'Hearty Salmon'], ['crab', 0.17, 'Ironshell Crab']];
  function fishing() {
    const el = gameScreen('Zora Fishing', '<p id="fmsg" class="muted">Tap <b>Cast</b> to throw your line.</p><button class="btn big primary" id="act">🎣 Cast</button>', 'english', 'english');
    const { cv, ctx, W, H } = stage(el, 0.8);
    const sid = sprite('sidon', ART.sidon(), 120, 150);
    let casts = 8, caught = 0, state = 'idle', timer = 0, bob = { x: W * 0.62, y: H * 0.55, dip: 0 }, nibbles = 0, flash = 0, splash = [], t = 0;
    const msg = m => { const e = $('#fmsg'); if (e) e.innerHTML = m; };
    const btn = () => $('#act');
    const catches = [];
    const act = () => {
      if (state === 'idle' && casts > 0) { casts--; state = 'wait'; timer = 1 + Math.random() * 3; nibbles = U.int(0, 3); bob.x = W * (0.45 + Math.random() * 0.3); bob.y = H * (0.5 + Math.random() * 0.15); U.sfx.click(); msg('Wait for it… don\'t react to the little nibbles!'); btn().textContent = '🐟 Reel!'; for (let i = 0; i < 12; i++) splash.push({ a: i / 12 * Math.PI * 2, r: 2, life: 0.6 }); }
      else if (state === 'wait' || state === 'nibble') { state = 'idle'; msg('Too early! The fish swam away. 💨'); U.sfx.wrong(); btn().textContent = '🎣 Cast'; endCheck(); }
      else if (state === 'bite') {
        state = 'idle'; let r = Math.random(), f = FISH[0]; for (const x of FISH) { if (r < x[1]) { f = x; break; } r -= x[1]; }
        caught++; State.count('fishCaught'); S().ingredients[f[0]] = (S().ingredients[f[0]] || 0) + 1; State.save(); catches.push(f); flash = 1;
        U.sfx.correct(); FX.floatText(cv, `${K.INGREDIENTS.find(i => i.id === f[0]).emoji} ${f[2]}!`, 'xp'); msg(`You caught a <b>${f[2]}</b>! It's in your Bag.`); btn().textContent = '🎣 Cast'; endCheck();
      }
    };
    const endCheck = () => { if (casts <= 0 && state === 'idle') { const s = S(); const prize = caught * 10; s.rupees += prize; State.save(); finish('Out of bait!', `<p>You caught <b>${caught}</b> fish: ${catches.map(c => K.INGREDIENTS.find(i => i.id === c[0]).emoji).join(' ') || 'none'}.</p><p>They're in your Bag for cooking, plus <b>${prize} rupees</b> from Sidon.</p>`, fishIntro); } };
    UI().on('#act', act); bindKeys({ ' ': act, Enter: act });
    loop(cv, dt => {
      t += dt;
      if (state === 'wait') { timer -= dt; if (timer <= 0) { if (nibbles > 0) { nibbles--; state = 'nibble'; timer = 0.35; bob.dip = 3; } else { state = 'bite'; timer = 0.85; bob.dip = 12; U.sfx.tick(); for (let i = 0; i < 16; i++) splash.push({ a: i / 16 * Math.PI * 2, r: 4, life: 0.8 }); } } }
      else if (state === 'nibble') { timer -= dt; if (timer <= 0) { state = 'wait'; timer = 0.6 + Math.random() * 1.6; bob.dip = 0; } }
      else if (state === 'bite') { timer -= dt; if (timer <= 0) { state = 'idle'; bob.dip = 0; msg('Too slow! The fish got away. 🐟'); U.sfx.wrong(); const b = btn(); if (b) b.textContent = '🎣 Cast'; endCheck(); } }
      // East Reservoir Lake under Zora's Domain: luminous stone arches, glowing water, a tiled dock
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f3f6a'); g.addColorStop(0.32, '#1e5f94'); g.addColorStop(0.34, '#2c7fb8'); g.addColorStop(1, '#0f3f6a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.shadowColor = '#7ff3ff'; ctx.shadowBlur = 10;
      for (const [x0, w0, h0] of [[W * 0.05, W * 0.3, H * 0.26], [W * 0.38, W * 0.34, H * 0.3], [W * 0.75, W * 0.28, H * 0.24]]) {
        ctx.beginPath(); ctx.moveTo(x0, H * 0.33); ctx.lineTo(x0, H * 0.33 - h0 * 0.55); ctx.quadraticCurveTo(x0 + w0 / 2, H * 0.33 - h0 * 1.25, x0 + w0, H * 0.33 - h0 * 0.55); ctx.lineTo(x0 + w0, H * 0.33);
        ctx.lineTo(x0 + w0 - 8, H * 0.33); ctx.lineTo(x0 + w0 - 8, H * 0.33 - h0 * 0.5); ctx.quadraticCurveTo(x0 + w0 / 2, H * 0.33 - h0 * 1.05, x0 + 8, H * 0.33 - h0 * 0.5); ctx.lineTo(x0 + 8, H * 0.33); ctx.closePath();
        ctx.fillStyle = '#cfe9f2'; ctx.fill(); ctx.strokeStyle = '#7fb9c9'; ctx.lineWidth = 1.4; ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#7ff3ff'; for (let i = 0; i < 5; i++) { const x = W * (0.12 + i * 0.2); ctx.globalAlpha = 0.6 + Math.sin(t * 2 + i) * 0.3; ctx.beginPath(); ctx.moveTo(x, H * 0.33); ctx.lineTo(x - 4, H * 0.27); ctx.lineTo(x, H * 0.22); ctx.lineTo(x + 4, H * 0.27); ctx.fill(); } ctx.globalAlpha = 1;
      ctx.fillStyle = '#bfe6ff'; ctx.globalAlpha = 0.2; for (let i = 0; i < 9; i++) { const y = H * 0.36 + (i * 31 + t * 12) % (H * 0.64); ctx.beginPath(); ctx.ellipse((i * 97 + t * 8) % W, y, 36, 3, 0, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
      ctx.fillStyle = '#d9eef6'; ctx.beginPath(); ctx.moveTo(0, H * 0.8); ctx.lineTo(W * 0.42, H * 0.8); ctx.lineTo(W * 0.46, H); ctx.lineTo(0, H); ctx.fill(); ctx.strokeStyle = '#7fb9c9'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#9fd0e0'; ctx.lineWidth = 1; for (let x = 0; x < W * 0.44; x += 24) { ctx.beginPath(); ctx.moveTo(x, H * 0.8); ctx.lineTo(x + 3, H); ctx.stroke(); }
      ctx.fillStyle = '#3fb0e8'; ctx.fillRect(0, H * 0.8, W * 0.42, 4);
      if (ready(sid)) ctx.drawImage(sid, W * 0.03, H * 0.58, 64, 80);
      ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W * 0.28, H * 0.98); ctx.lineTo(W * 0.38, H * 0.4); ctx.stroke(); ctx.lineCap = 'butt';
      if (state !== 'idle') {
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(W * 0.38, H * 0.4); ctx.quadraticCurveTo(bob.x - 30, bob.y - 60, bob.x, bob.y - 8 + bob.dip); ctx.stroke();
        const by = bob.y + bob.dip + Math.sin(t * 3) * 1.5;
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(bob.x, bob.y + 4, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bob.x, by - 6, 7, Math.PI, 0); ctx.fillStyle = '#e8402e'; ctx.fill(); ctx.beginPath(); ctx.arc(bob.x, by - 6, 7, 0, Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 1.4; ctx.strokeStyle = '#1d1a2b'; ctx.beginPath(); ctx.arc(bob.x, by - 6, 7, 0, Math.PI * 2); ctx.stroke();
        if (state === 'bite') { ctx.font = '900 30px Lexend, sans-serif'; ctx.fillStyle = '#ffd23d'; ctx.strokeStyle = '#1d1a2b'; ctx.lineWidth = 4; ctx.strokeText('!', bob.x - 5, bob.y - 30); ctx.fillText('!', bob.x - 5, bob.y - 30); }
      }
      for (let i = splash.length - 1; i >= 0; i--) { const p = splash[i]; p.life -= dt; p.r += dt * 60; if (p.life <= 0) { splash.splice(i, 1); continue; } ctx.globalAlpha = p.life; ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); ctx.arc(bob.x + Math.cos(p.a) * p.r, bob.y + Math.sin(p.a) * p.r * 0.35, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      if (flash > 0) { flash -= dt; ctx.fillStyle = `rgba(255,255,255,${flash * 0.3})`; ctx.fillRect(0, 0, W, H); }
      hud(ctx, W, [`🪱 ${casts} casts`, `🐟 ${caught}`]);
    });
  }
  function fishIntro() {
    const s = S();
    intro({ title: 'Zora Fishing', npc: 'Prince Sidon', art: ART.sidon(), backLabel: '◀ Zora\'s Domain', onBack: toRegion('english'), theme: 'english', music: 'english', play: fishing,
      text: 'The reservoir is full of fish again, thanks to you! Cast your line, ignore the little nibbles, and reel in the moment the bobber is pulled under. You have 8 casts!', best: `Fish caught so far: <b>${s.counters.fishCaught || 0}</b>. Every catch goes in your Bag for cooking.` });
  }

  /* ======================= RITO VILLAGE: Snowball Bowling ======================= */
  // Time your aim as the arrow sweeps, then watch the snowball crash through the pins. 3 balls per game.
  function bowling() {
    const el = gameScreen('Snowball Bowling', '<p id="bmsg" class="muted">Tap <b>Roll!</b> when the arrow points where you want to aim.</p><button class="btn big primary" id="act">☃️ Roll!</button>', 'verbal', 'verbal');
    const { cv, ctx, W, H } = stage(el, 1.3);
    const L = W * 0.18, R = W * 0.82, top = 60;
    const rows = [[0], [-1, 1], [-2, 0, 2], [-3, -1, 1, 3]];
    let pins, ball, aim = 0, dir = 1, state = 'aim', frame = 1, total = 0, strikes = 0, settle = 0, results = [];
    const msg = m => { const e = $('#bmsg'); if (e) e.innerHTML = m; };
    const rack = () => { pins = []; const sp = (R - L) / 9; rows.forEach((row, ri) => row.forEach(c => pins.push({ x: W / 2 + c * sp * 0.8, y: top + 26 + ri * sp * 0.85, vx: 0, vy: 0, down: false, a: 0 }))); };
    rack();
    const act = () => {
      if (state !== 'aim') return;
      state = 'roll'; ball = { x: W / 2 + aim * (R - L) * 0.42, y: H - 50, vx: aim * -10 + (Math.random() - 0.5) * 8, vy: -420, r: 16 }; U.sfx.click();
    };
    UI().on('#act', act); bindKeys({ ' ': act, Enter: act });
    loop(cv, dt => {
      if (state === 'aim') { aim += dir * dt * 1.25; if (aim > 1 || aim < -1) { dir *= -1; aim = Math.max(-1, Math.min(1, aim)); } }
      if (state === 'roll' || state === 'settle') {
        if (ball) { ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.x < L + ball.r || ball.x > R - ball.r) ball.vx *= -0.3, ball.x = Math.max(L + ball.r, Math.min(R - ball.r, ball.x)); if (ball.y < -30) ball = null; }
        for (const p of pins) {
          if (ball) { const dx = p.x - ball.x, dy = p.y - ball.y, d = Math.hypot(dx, dy); if (d < ball.r + 9 && d > 0) { const f = 320; p.vx += dx / d * f + ball.vx * 0.3; p.vy += dy / d * f + ball.vy * 0.25; p.down = true; ball.vy *= 0.94; } }
          p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 2.2; p.vy *= 1 - dt * 2.2; if (p.down) p.a += dt * 8;
        }
        for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
          const a = pins[i], b = pins[j]; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          if (d < 18 && d > 0) { const sa = Math.hypot(a.vx, a.vy), sb = Math.hypot(b.vx, b.vy); if (sa > 40 && !b.down) { b.down = true; b.vx += dx / d * sa * 0.75; b.vy += dy / d * sa * 0.75; } if (sb > 40 && !a.down) { a.down = true; a.vx -= dx / d * sb * 0.75; a.vy -= dy / d * sb * 0.75; } }
        }
        if (state === 'roll' && !ball) { state = 'settle'; settle = 1.1; }
        if (state === 'settle') {
          settle -= dt;
          if (settle <= 0) {
            const n = pins.filter(p => p.down).length; total += n; results.push(n);
            if (n === 10) { strikes++; State.count('strikes'); FX.banner('STRIKE! ☃️', 'victory'); U.sfx.fanfare(); } else { (n ? U.sfx.coin : U.sfx.wrong)(); FX.floatText(cv, `${n} pin${n === 1 ? '' : 's'}`, 'xp'); }
            frame++; State.save();
            if (frame > 3) {
              state = 'over'; const s = S(); const prize = total * 3 + strikes * 30; s.rupees += prize; State.countMax('bowlBest', total); State.save();
              finish('Game over!', `<p>Your rolls: <b>${results.join(' · ')}</b> (total ${total}/30)${strikes ? ` with <b>${strikes} strike${strikes > 1 ? 's' : ''}</b>! ☃️` : '.'}</p><p>Prize: <b>${prize} rupees</b></p>`, bowlIntro);
            } else { state = 'aim'; rack(); msg(`Roll ${frame} of 3. ${n === 10 ? 'Amazing!' : 'Try aiming at the front pin!'}`); }
          }
        }
      }
      // snowy lane on a Tabantha mountaintop
      ctx.fillStyle = '#9ec9e8'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f4f8fc'; ctx.beginPath(); ctx.moveTo(L - 30, H); ctx.lineTo(L, 0); ctx.lineTo(R, 0); ctx.lineTo(R + 30, H); ctx.fill();
      ctx.strokeStyle = '#b8cfe0'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(160,190,215,.5)'; for (let i = 1; i < 6; i++) { const x = L + (R - L) * i / 6; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (x - W / 2) * 0.08, H); ctx.stroke(); }
      ctx.fillStyle = '#ffffff'; for (let i = 0; i < 20; i++) { ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc((i * 73) % W, ((i * 41) + performance.now() / 30) % H, 1.6, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
      for (const p of pins) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.down ? Math.min(Math.PI / 2, p.a) * Math.sign(p.vx || 1) : 0); ctx.globalAlpha = p.down ? 0.7 : 1;
        ctx.beginPath(); ctx.ellipse(0, 6, 8, 10, 0, 0, Math.PI * 2); ctx.ellipse(0, -8, 5, 6, 0, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
        ctx.fillStyle = '#c63b4f'; ctx.fillRect(-6, -3, 12, 3); ctx.restore();
      }
      if (ball) { const rg = ctx.createRadialGradient(ball.x - 5, ball.y - 5, 2, ball.x, ball.y, ball.r); rg.addColorStop(0, '#ffffff'); rg.addColorStop(1, '#c8dcec'); ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = rg; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#1d1a2b'; ctx.stroke(); }
      if (state === 'aim') {
        const ax = W / 2 + aim * (R - L) * 0.42, ay = H - 50;
        ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2); ctx.fillStyle = '#f4f8fc'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
        ctx.strokeStyle = '#c63b4f'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay - 24); ctx.lineTo(ax - aim * 10, ay - 70); ctx.stroke();
        ctx.fillStyle = '#c63b4f'; ctx.beginPath(); ctx.moveTo(ax - aim * 10, ay - 82); ctx.lineTo(ax - aim * 10 - 9, ay - 66); ctx.lineTo(ax - aim * 10 + 9, ay - 66); ctx.fill();
      }
      hud(ctx, W, [`Roll ${Math.min(frame, 3)}/3`, `Pins ${total}`, `☃️ ${strikes}`]);
    });
  }
  function bowlIntro() {
    const s = S();
    intro({ title: 'Snowball Bowling', npc: 'Teba', art: ART.teba(), backLabel: '◀ Rito Village', onBack: toRegion('verbal'), theme: 'verbal', music: 'verbal', play: bowling,
      text: 'The skies are clear thanks to you. Fancy a game? Watch the arrow sweep and roll your snowball at just the right moment. Ten pins down is a strike!', best: `Best game: <b>${s.counters.bowlBest || 0}</b> pins · Strikes: <b>${s.counters.strikes || 0}</b>` });
  }

  /* ======================= GERUDO DESERT: Sand Seal Rally ======================= */
  // Surf the dunes behind a sand seal and steer through the flag gates. Each gate adds time.
  function sealRally() {
    const el = gameScreen('Sand Seal Rally', '<div class="mg-ctrl"><button class="btn big" id="u">▲</button><button class="btn big" id="d">▼</button></div>', 'nonverbal', 'battle');
    const { cv, ctx, W, H } = stage(el, 0.75);
    const seal = sprite('sandSeal', ART.sandSeal(), 160, 90);
    const rowsY = [H * 0.38, H * 0.56, H * 0.74]; let row = 1, py = rowsY[1];
    let t = 22, gatesHit = 0, missed = 0, speed = 200, spawn = 0.6, scroll = 0, over = false;
    const gates = [], dust = [];
    const move = d => { if (!over) row = Math.max(0, Math.min(2, row + d)); };
    UI().on('#u', () => move(-1)); UI().on('#d', () => move(1));
    cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); move(e.clientY - r.top < r.height / 2 ? -1 : 1); });
    bindKeys({ ArrowUp: () => move(-1), ArrowDown: () => move(1), w: () => move(-1), s: () => move(1) });
    const px = W * 0.22;
    loop(cv, dt => {
      if (!over) {
        t -= dt; speed += dt * 5; scroll += speed * dt; spawn -= dt;
        if (spawn <= 0) { spawn = Math.max(0.55, 1.0 - gatesHit * 0.015); gates.push({ x: W + 40, r: U.int(0, 2) }); }
        py += (rowsY[row] - py) * Math.min(1, dt * 10);
        for (const g of gates) {
          g.x -= speed * dt;
          if (!g.done && g.x < px + 10) { g.done = true; if (Math.abs(rowsY[g.r] - py) < 26) { gatesHit++; t += 1.6; U.sfx.coin(); g.ok = true; for (let i = 0; i < 12; i++) dust.push({ x: px + 30, y: py, vx: (Math.random() - 0.3) * 160, vy: (Math.random() - 0.5) * 160, life: 0.5, c: '#ffd23d' }); } else { missed++; U.sfx.wrong(); } }
        }
        for (let i = gates.length - 1; i >= 0; i--) if (gates[i].x < -40) gates.splice(i, 1);
        if (Math.random() < dt * 30) dust.push({ x: px - 50, y: py + 22, vx: -speed * 0.6, vy: -Math.random() * 40, life: 0.5, c: '#e8c88a' });
        if (t <= 0) {
          over = true; const s = S(); const best = gatesHit > (s.counters.sealBest || 0); State.countMax('sealBest', gatesHit); const prize = gatesHit * 5; s.rupees += prize; State.save();
          finish('Time\'s up!', `<p>You rode through <b>${gatesHit}</b> gate${gatesHit === 1 ? '' : 's'}${best ? ' — a new best! 🏆' : ''}.</p><p>Prize: <b>${prize} rupees</b></p>`, sealIntro);
        }
      }
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#ffcf7a'); sky.addColorStop(0.35, '#ffe2a8'); sky.addColorStop(0.36, '#e8b862'); sky.addColorStop(1, '#c8903e'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#d9a456'; ctx.beginPath(); ctx.moveTo(0, H * 0.36); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, H * 0.33 + Math.sin((x + scroll * 0.2) / 60) * 8); ctx.lineTo(W, H * 0.4); ctx.lineTo(0, H * 0.4); ctx.fill();
      ctx.fillStyle = '#b07a3a'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.22, 16, 0, Math.PI * 2); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(120,70,20,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { const x = ((i * 90) - scroll) % (W + 90); const xx = x < -90 ? x + W + 90 : x; ctx.beginPath(); ctx.moveTo(xx, H * 0.5 + (i % 3) * 30); ctx.quadraticCurveTo(xx + 30, H * 0.47 + (i % 3) * 30, xx + 60, H * 0.5 + (i % 3) * 30); ctx.stroke(); }
      for (const g of gates) {
        const y = rowsY[g.r];
        for (const dy of [-30, 30]) { ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(g.x, y + dy + 14); ctx.lineTo(g.x, y + dy - 18); ctx.stroke(); ctx.fillStyle = g.ok ? '#7ee35a' : '#c63b4f'; ctx.beginPath(); ctx.moveTo(g.x, y + dy - 18); ctx.lineTo(g.x + 16, y + dy - 12); ctx.lineTo(g.x, y + dy - 6); ctx.fill(); ctx.strokeStyle = '#1d1a2b'; ctx.lineWidth = 1; ctx.stroke(); }
      }
      for (let i = dust.length - 1; i >= 0; i--) { const p = dust[i]; p.life -= dt; if (p.life <= 0) { dust.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; ctx.globalAlpha = p.life * 1.6; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      if (ready(seal)) ctx.drawImage(seal, px - 70, py - 46, 140, 79);
      hud(ctx, W, [`🚩 ${gatesHit}`, `⏱ ${Math.max(0, Math.ceil(t))}`]);
    });
  }
  function sealIntro() {
    const s = S();
    intro({ title: 'Sand Seal Rally', npc: 'Riju', art: ART.riju(), backLabel: '◀ Gerudo Desert', onBack: toRegion('nonverbal'), theme: 'nonverbal', music: 'nonverbal', play: sealRally,
      text: 'Thanks to you, Vah Naboris sleeps peacefully. Grab a shield and let my sand seal tow you through the flag gates! Each gate you pass gives you more time.', best: `Best rally: <b>${s.counters.sealBest || 0}</b> gates. Steer with ▲ ▼ or tap the top/bottom half.` });
  }

  /* ======================= MASTER CYCLE ZERO ======================= */
  // Ride across Hyrule: jump (tap / Space, double-jump in the air) over boulders and Bokoblins, collect rupees.
  function cycleRun() {
    const s = S();
    if ((s.cycleDay || {}).day !== today()) s.cycleDay = { day: today(), runs: 0 };
    s.cycleDay.runs++; State.save(); const paid = s.cycleDay.runs <= 3;
    const el = gameScreen('Master Cycle Run', '<p class="muted">Tap the track or press Space to jump. You can jump again in mid-air!</p>', 'map', 'castle');
    const { cv, ctx, W, H } = stage(el, 0.62);
    const bike = sprite('masterCycle', ART.masterCycle(), 160, 92), boko = sprite('bokoRed', ART.bokoblin('red'), 130, 150);
    const ground = H - 40; let y = ground, vy = 0, jumps = 0, dist = 0, speed = 260, coins = 0, hearts = 3, inv = 0, over = false, spawn = 1, scroll = 0, t = 0;
    const obs = [], gems = [];
    const jump = () => { if (over || jumps >= 2) return; vy = jumps ? -520 : -600; jumps++; U.sfx.click(); };
    cv.addEventListener('pointerdown', jump); bindKeys({ ' ': jump, ArrowUp: jump, Enter: jump });
    const bx = W * 0.18;
    loop(cv, dt => {
      t += dt;
      if (!over) {
        speed += dt * 8; dist += speed * dt / 12; scroll += speed * dt; inv = Math.max(0, inv - dt);
        vy += 1600 * dt; y += vy * dt; if (y >= ground) { y = ground; vy = 0; jumps = 0; }
        spawn -= dt;
        if (spawn <= 0) {
          spawn = Math.max(0.7, 1.6 - dist / 3000) + Math.random() * 0.6;
          obs.push({ x: W + 40, kind: Math.random() < 0.55 ? 'rock' : 'boko' });
          const high = Math.random() < 0.5; for (let i = 0; i < 3; i++) gems.push({ x: W + 140 + i * 28, y: high ? ground - 120 : ground - 40 });
        }
        for (const o of obs) {
          o.x -= speed * dt;
          const w = o.kind === 'rock' ? 22 : 24, h = o.kind === 'rock' ? 26 : 50;
          if (!o.hit && !inv && Math.abs(o.x - bx) < w + 14 && y > ground - h) { o.hit = true; hearts--; inv = 1.2; U.sfx.hurt(); FX.shake(1); }
        }
        for (const g of gems) { g.x -= speed * dt; if (!g.got && Math.abs(g.x - bx) < 24 && Math.abs(g.y - (y - 30)) < 34) { g.got = true; coins++; U.sfx.coin(); } }
        for (let i = obs.length - 1; i >= 0; i--) if (obs[i].x < -60) obs.splice(i, 1);
        for (let i = gems.length - 1; i >= 0; i--) if (gems[i].x < -20 || gems[i].got) gems.splice(i, 1);
        if (hearts <= 0) {
          over = true; const m = Math.floor(dist); const best = m > (s.counters.cycleBest || 0); State.countMax('cycleBest', m);
          const prize = paid ? coins * 5 + (best ? Math.floor(m / 20) : 0) : 0; s.rupees += prize; State.save();
          finish('Crash! 🏍️💨', `<p>You rode <b>${m.toLocaleString('en-GB')} m</b>${best ? ' — a new record! 🏆' : ''} and grabbed ${coins} rupee${coins === 1 ? '' : 's'}.</p><p>${paid ? `Prize: <b>${prize} rupees</b>` : 'Your rupee pouch is full from today\'s rides. Ride for fun, and come back tomorrow for more prizes!'}</p>`, cycleIntro);
        }
      }
      // Hyrule Field at sunset, Hyrule Castle in the distance
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#5a7fc9'); sky.addColorStop(0.6, '#ffc58a'); sky.addColorStop(1, '#ffdcae'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#7a6a9a'; ctx.beginPath(); ctx.moveTo(0, H * 0.62); for (let x = 0; x <= W + 40; x += 40) ctx.lineTo(x, H * 0.5 + Math.sin((x + scroll * 0.1) / 90) * 18); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      const cx = W * 0.7 - (scroll * 0.03) % (W * 1.6); ctx.fillStyle = '#5a4a6a';
      ctx.fillRect(cx - 20, H * 0.42, 40, 24); ctx.fillRect(cx - 4, H * 0.32, 8, 14); ctx.beginPath(); ctx.moveTo(cx - 6, H * 0.32); ctx.lineTo(cx, H * 0.26); ctx.lineTo(cx + 6, H * 0.32); ctx.fill();
      for (const dx of [-16, 12]) { ctx.fillRect(cx + dx, H * 0.37, 6, 8); ctx.beginPath(); ctx.moveTo(cx + dx - 1, H * 0.37); ctx.lineTo(cx + dx + 3, H * 0.34); ctx.lineTo(cx + dx + 7, H * 0.37); ctx.fill(); }
      ctx.fillStyle = '#5c8f48'; ctx.beginPath(); ctx.moveTo(0, H * 0.72); for (let x = 0; x <= W + 30; x += 30) ctx.lineTo(x, H * 0.66 + Math.sin((x + scroll * 0.35) / 50) * 10); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      ctx.fillStyle = '#2f6b3a'; for (let i = 0; i < 7; i++) { const x = ((i * 120) - scroll * 0.5) % (W + 120); const xx = x < -60 ? x + W + 120 : x; ctx.beginPath(); ctx.moveTo(xx, H * 0.62); ctx.lineTo(xx + 12, H * 0.74); ctx.lineTo(xx - 12, H * 0.74); ctx.fill(); }
      ctx.fillStyle = '#8f7a52'; ctx.fillRect(0, ground, W, H - ground); ctx.fillStyle = '#6b5a3a'; for (let x = -(scroll % 40); x < W; x += 40) ctx.fillRect(x, ground + 8, 20, 3);
      ctx.fillStyle = '#7d9e5c'; ctx.fillRect(0, ground - 2, W, 4);
      for (const g of gems) rupee(ctx, g.x, g.y, 1.1, '#5cb8ff', '#1f5fbf');
      for (const o of obs) {
        if (o.kind === 'rock') { const rg = ctx.createRadialGradient(o.x - 6, ground - 20, 2, o.x, ground - 12, 26); rg.addColorStop(0, '#a8a090'); rg.addColorStop(1, '#5a5448'); ctx.beginPath(); ctx.ellipse(o.x, ground - 12, 24, 16, 0, Math.PI, 0); ctx.lineTo(o.x + 24, ground); ctx.lineTo(o.x - 24, ground); ctx.fillStyle = rg; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#1d1a2b'; ctx.stroke(); }
        else if (ready(boko)) ctx.drawImage(boko, o.x - 26, ground - 60, 52, 60);
      }
      if (ready(bike)) { ctx.save(); ctx.globalAlpha = inv > 0 && Math.floor(inv * 10) % 2 ? 0.35 : 1; ctx.translate(bx, y); ctx.rotate(vy < 0 ? -0.12 : vy > 100 ? 0.08 : 0); ctx.drawImage(bike, -64, -72, 128, 74); ctx.restore(); }
      ctx.strokeStyle = 'rgba(63,224,255,.6)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(bx - 70 - i * 14, y - 20 - i * 8); ctx.lineTo(bx - 100 - i * 14 - Math.random() * 20, y - 20 - i * 8); ctx.stroke(); }
      hud(ctx, W, [`${Math.floor(dist).toLocaleString('en-GB')} m`, `${'❤️'.repeat(Math.max(0, hearts))}`, `💎 ${coins}`]);
    });
  }
  function cycleIntro() {
    const s = S(); const runs = (s.cycleDay || {}).day === today() ? s.cycleDay.runs : 0;
    intro({ title: 'Master Cycle Run', npc: 'Zelda', art: `<div class="mc-art">${ART.masterCycle()}</div>`, backLabel: '◀ Map', onBack: Game.map, theme: 'map', music: 'castle', play: cycleRun, free: true,
      text: 'The Master Cycle Zero, the final Divine Beast, is yours! Ride it as far as you can across Hyrule. Jump over boulders and Bokoblins, and grab the rupees!', best: `Record: <b>${(s.counters.cycleBest || 0).toLocaleString('en-GB')} m</b> · Rupee prizes for your first 3 rides each day (${Math.max(0, 3 - runs)} left today). No tickets needed!` });
  }

  /* ---------------- region panel (shown on each region's saga screen) ---------------- */
  const ACT = {
    maths: { game: 'Yunobo\'s Rock Roll', art: () => ART.yunobo(), people: 'Goron', open: rockIntro },
    english: { game: 'Zora Fishing', art: () => ART.sidon(), people: 'Zora', open: fishIntro },
    verbal: { game: 'Snowball Bowling', art: () => ART.teba(), people: 'Rito', open: bowlIntro },
    nonverbal: { game: 'Sand Seal Rally', art: () => ART.riju(), people: 'Gerudo', open: sealIntro },
  };
  function regionPanel(r) {
    const s = S(); const A = ACT[r.id]; const free = !!s.bosses[r.id];
    const qs = K.QUESTS.filter(q => q.region === r.id); const doneQ = qs.filter(q => s.quests[q.id]).length;
    return `<div class="region-act slate ${free ? '' : 'locked'}">
      <div class="ra-art">${A.art()}</div>
      <div><h3>${free ? `🎉 New in ${r.name}` : `🔒 ${r.beast}`}</h3>
        <p>${free ? `With ${r.beast.replace('Divine Beast ', '')} free, the ${A.people}s have new things for you to do!` : `Free ${r.beast} to unlock <b>${A.game}</b> and ${qs.length} new ${A.people} side quests.`}</p>
        ${free ? `<div class="row"><button class="btn primary" id="ra-play">▶ ${A.game}</button><button class="btn" id="ra-q">📜 ${A.people} quests (${doneQ}/${qs.length})</button></div>` : ''}</div></div>`;
  }
  function bindRegionPanel(r) { UI().on('#ra-play', () => ACT[r.id].open()); UI().on('#ra-q', () => World.quests()); }

  window.Regions = { regionPanel, bindRegionPanel, cycleIntro, rockIntro, fishIntro, bowlIntro, sealIntro };
})();
