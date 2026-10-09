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
      // Death Mountain's smoking peak glowing on the horizon
      const hz = ctx.createLinearGradient(0, 0, 0, H * 0.16); hz.addColorStop(0, '#2a1410'); hz.addColorStop(1, 'rgba(255,106,26,.35)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H * 0.16);
      ctx.fillStyle = '#2a1714'; ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.16); ctx.lineTo(W * 0.42, H * 0.03); ctx.lineTo(W * 0.5, H * 0.05); ctx.lineTo(W * 0.58, H * 0.03); ctx.lineTo(W * 0.9, H * 0.16); ctx.fill();
      ctx.fillStyle = '#ff7a1a'; ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.04, W * 0.07, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(80,60,60,.5)'; for (let i = 0; i < 3; i++) { const sy = H * 0.03 - ((scroll * 0.2 + i * 20) % 40); ctx.beginPath(); ctx.arc(W * 0.5 + Math.sin(i + scroll / 80) * 8, sy, 8 + i * 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2;
      for (let y = -60 + scroll; y < H; y += 60) { if (y < H * 0.16) continue; ctx.beginPath(); ctx.moveTo(W * 0.12, y); ctx.lineTo(W * 0.88, y + 20); ctx.stroke(); }
      for (const side of [0, 1]) {
        const x0 = side ? W * 0.88 : 0; const lg2 = ctx.createLinearGradient(x0, 0, x0 + W * 0.12, 0);
        lg2.addColorStop(side ? 0 : 1, '#ff9a2e'); lg2.addColorStop(side ? 1 : 0, '#c2381c'); ctx.fillStyle = lg2; ctx.fillRect(x0, H * 0.15, W * 0.12, H);
        ctx.fillStyle = 'rgba(255,230,120,.5)'; for (let y = (scroll * 1.5) % 40 - 40; y < H; y += 40) { if (y < H * 0.17) continue; ctx.beginPath(); ctx.ellipse(x0 + W * 0.06, y, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.setLineDash([10, 14]); ctx.strokeStyle = 'rgba(255,200,150,.18)'; ctx.lineWidth = 2;
      for (const x of [W * 0.375, W * 0.625]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.setLineDash([]);
      for (const o of objs) {
        const x = lanes[o.l];
        if (o.kind === 'rock') {
          const rg = ctx.createRadialGradient(x - 6, o.y - 6, 2, x, o.y, 22); rg.addColorStop(0, '#5a4a44'); rg.addColorStop(1, '#2a1f1c');
          ctx.beginPath(); ctx.arc(x, o.y, 22, 0, Math.PI * 2); ctx.fillStyle = rg; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
          ctx.save(); ctx.translate(x, o.y); ctx.rotate(o.y / 30);
          ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 2.2; ctx.shadowColor = '#ffb02e'; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(-3, 1); ctx.lineTo(5, -9); ctx.moveTo(-3, 1); ctx.lineTo(2, 13); ctx.moveTo(5, -9); ctx.lineTo(14, -3); ctx.stroke(); ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,170,60,.35)'; ctx.beginPath(); ctx.arc(-8, 8, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          ctx.fillStyle = 'rgba(255,120,30,.25)'; ctx.beginPath(); ctx.ellipse(x, o.y - 26, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
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

  /* ======================= ZORA'S DOMAIN: catching fish by hand ======================= */
  // Like the game, there's no fishing rod: fish swim as shadows and rise to the surface. Grab them while they're up!
  // Tap a fish that's still deep and it darts away. Ironshell crabs sometimes scuttle along the shore.
  const FISH = { fish: ['Hyrule Bass', '#8fb06a', '#4f7a4a'], salmon: ['Hearty Salmon', '#ff8a7a', '#c2385a'], crab: ['Ironshell Crab', '#6a8aaa', '#34465e'] };
  function fishShape(ctx, kind) {
    const [, c1, c2] = FISH[kind]; const g = ctx.createLinearGradient(0, -8, 0, 8); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.quadraticCurveTo(4, -10, -10, -2); ctx.lineTo(-20, -9); ctx.lineTo(-17, 0); ctx.lineTo(-20, 9); ctx.lineTo(-10, 2); ctx.quadraticCurveTo(4, 10, 16, 0); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(4, -3, 12, 0); ctx.stroke();
    ctx.fillStyle = '#1d1a2b'; ctx.beginPath(); ctx.arc(10, -2, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  function crabShape(ctx, t) {
    ctx.fillStyle = '#4a6a8a'; ctx.strokeStyle = '#1d1a2b'; ctx.lineWidth = 1.4;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 8, 2); ctx.lineTo(s * 15, 7 + Math.sin(t * 20) * 2); ctx.moveTo(s * 6, 3); ctx.lineTo(s * 11, 9 - Math.sin(t * 20) * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 12, -6, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-3, -5, 1.6, 0, Math.PI * 2); ctx.arc(3, -5, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  function fishing() {
    const el = gameScreen('Zora\'s Reservoir', '<p id="fmsg" class="muted">Tap a fish when it rises to the surface and splashes!</p>', 'english', 'english');
    const { cv, ctx, W, H } = stage(el, 0.9);
    const sid = sprite('sidon', ART.sidon(), 120, 150);
    const WATER = H * 0.34, SHORE = H * 0.86;
    let time = 40, caught = 0, over = false, t = 0, spawnCrab = 6;
    const fish = [], fx = [], catches = [];
    const msg = m => { const e = $('#fmsg'); if (e) e.innerHTML = m; };
    const newFish = () => ({ x: W * (0.15 + Math.random() * 0.7), y: WATER + 30 + Math.random() * (SHORE - WATER - 60), a: Math.random() * Math.PI * 2, sp: 30 + Math.random() * 25, up: 0, wait: 1 + Math.random() * 3.5, kind: Math.random() < 0.3 ? 'salmon' : 'fish', flee: 0 });
    for (let i = 0; i < 5; i++) fish.push(newFish());
    const splash = (x, y, n = 14, c = '#e8f6ff') => { for (let i = 0; i < n; i++) fx.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 140, life: 0.7, c }); fx.push({ ring: true, x, y, r: 4, life: 0.6 }); };
    const grab = (kind, x, y) => {
      caught++; State.count('fishCaught'); const s = S(); s.ingredients[kind] = (s.ingredients[kind] || 0) + 1; State.save(); catches.push(kind);
      U.sfx.correct(); splash(x, y, 22, '#ffffff'); fx.push({ leap: true, x, y, kind, life: 0.9 }); msg(`Got a <b>${FISH[kind][0]}</b>! It's in your Bag.`);
    };
    cv.addEventListener('pointerdown', e => {
      if (over) return; const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
      let best = null, bd = 34;
      for (const f of fish) { const d = Math.hypot(f.x - x, f.y - y); if (d < bd) { bd = d; best = f; } }
      if (best) {
        if (best.kind === 'crab' || best.up > 0) { grab(best.kind, best.x, best.y); fish.splice(fish.indexOf(best), 1); if (best.kind !== 'crab') fish.push(newFish()); }
        else { best.flee = 1; best.a = Math.atan2(best.y - y, best.x - x); U.sfx.wrong(); msg('Too deep! Wait for it to surface.'); }
      } else splash(x, y, 6);
    });
    loop(cv, dt => {
      t += dt;
      if (!over) {
        time -= dt; spawnCrab -= dt;
        if (spawnCrab <= 0) { spawnCrab = 7 + Math.random() * 6; fish.push({ kind: 'crab', x: -20, y: SHORE + 16, a: 0, sp: 60, up: 1, wait: 99, flee: 0 }); }
        for (const f of fish) {
          if (f.kind === 'crab') { f.x += f.sp * dt; continue; }
          const sp = f.sp * (f.flee > 0 ? 4 : 1); f.flee = Math.max(0, f.flee - dt);
          f.a += (Math.random() - 0.5) * dt * 2; f.x += Math.cos(f.a) * sp * dt; f.y += Math.sin(f.a) * sp * dt * 0.5;
          if (f.x < W * 0.12 || f.x > W * 0.92) { f.a = Math.PI - f.a; f.x = Math.max(W * 0.12, Math.min(W * 0.92, f.x)); }
          if (f.y < WATER + 24 || f.y > SHORE - 24) { f.a = -f.a; f.y = Math.max(WATER + 24, Math.min(SHORE - 24, f.y)); }
          if (f.up > 0) { f.up -= dt; if (f.up <= 0) f.wait = 1.5 + Math.random() * 3; }
          else { f.wait -= dt; if (f.wait <= 0 && !f.flee) { f.up = 1.15; splash(f.x, f.y, 10); } }
        }
        for (let i = fish.length - 1; i >= 0; i--) if (fish[i].kind === 'crab' && fish[i].x > W + 20) fish.splice(i, 1);
        if (time <= 0) {
          over = true; const s = S(); const prize = caught * 10; s.rupees += prize; State.save();
          const icons = catches.map(k => K.INGREDIENTS.find(i => i.id === k).emoji).join(' ');
          finish('Time\'s up!', `<p>You caught <b>${caught}</b>: ${icons || 'nothing this time'}.</p><p>They're in your Bag for cooking, and Sidon gives you <b>${prize} rupees</b>!</p>`, fishIntro);
        }
      }
      // East Reservoir: Zora's Domain glowing in the distance, the lake, a stone shore
      const sky = ctx.createLinearGradient(0, 0, 0, WATER); sky.addColorStop(0, '#1d3f78'); sky.addColorStop(1, '#5a8ac8'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, WATER);
      ctx.fillStyle = '#3a5a8a'; ctx.beginPath(); ctx.moveTo(0, WATER); ctx.lineTo(0, WATER * 0.55); ctx.quadraticCurveTo(W * 0.2, WATER * 0.4, W * 0.35, WATER * 0.62); ctx.lineTo(W * 0.65, WATER * 0.62); ctx.quadraticCurveTo(W * 0.8, WATER * 0.38, W, WATER * 0.5); ctx.lineTo(W, WATER); ctx.fill();
      ctx.save(); ctx.shadowColor = '#7ff3ff'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#d6eef6'; ctx.beginPath(); ctx.ellipse(W * 0.5, WATER * 0.58, W * 0.13, WATER * 0.18, 0, Math.PI, 0); ctx.fill();
      ctx.fillRect(W * 0.44, WATER * 0.2, W * 0.12, WATER * 0.4); ctx.beginPath(); ctx.moveTo(W * 0.42, WATER * 0.22); ctx.quadraticCurveTo(W * 0.5, -WATER * 0.05, W * 0.58, WATER * 0.22); ctx.fill();
      ctx.restore(); ctx.fillStyle = '#7ff3ff'; for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.6 + Math.sin(t * 2 + i) * 0.3; ctx.fillRect(W * (0.455 + i * 0.03), WATER * 0.32, 3, 6); } ctx.globalAlpha = 1;
      const wg = ctx.createLinearGradient(0, WATER, 0, SHORE); wg.addColorStop(0, '#2c8fc8'); wg.addColorStop(1, '#14507e'); ctx.fillStyle = wg; ctx.fillRect(0, WATER, W, SHORE - WATER);
      ctx.strokeStyle = 'rgba(200,240,255,.25)'; ctx.lineWidth = 1.4; for (let i = 0; i < 10; i++) { const y = WATER + 10 + ((i * 29 + t * 10) % (SHORE - WATER - 10)); const x = (i * 83 + t * 14) % W; ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.quadraticCurveTo(x, y - 3, x + 16, y); ctx.stroke(); }
      for (const f of fish) {
        if (f.kind === 'crab') continue;
        const dirx = Math.cos(f.a) >= 0 ? 1 : -1;
        ctx.save(); ctx.translate(f.x, f.y); ctx.scale(dirx, 1);
        if (f.up > 0) {
          ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(0, 4, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
          fishShape(ctx, f.kind);
          if (f.kind === 'salmon') { ctx.fillStyle = '#ffe0e8'; ctx.globalAlpha = 0.5 + Math.sin(t * 8) * 0.3; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
        } else {
          ctx.globalAlpha = 0.35; ctx.fillStyle = '#062a46'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2); ctx.moveTo(-12, 0); ctx.lineTo(-20, -6); ctx.lineTo(-20, 6); ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
      // shore with the stone Zora dock, Sidon cheering you on
      ctx.fillStyle = '#c9dce4'; ctx.fillRect(0, SHORE, W, H - SHORE); ctx.fillStyle = '#9fb8c4'; for (let x = 0; x < W; x += 26) { ctx.beginPath(); ctx.ellipse(x + 10, SHORE + 3, 13, 4, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#7fa0b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, SHORE); ctx.lineTo(W, SHORE); ctx.stroke();
      for (const f of fish) {
        if (f.kind !== 'crab') continue;
        ctx.save(); ctx.translate(f.x, f.y); crabShape(ctx, t); ctx.restore();
      }
      if (ready(sid)) ctx.drawImage(sid, W * 0.82, SHORE - 60, 50, 64);
      for (let i = fx.length - 1; i >= 0; i--) {
        const p = fx[i]; p.life -= dt; if (p.life <= 0) { fx.splice(i, 1); continue; }
        if (p.ring) { p.r += dt * 50; ctx.globalAlpha = p.life; ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.35, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
        else if (p.leap) { const k = 1 - p.life / 0.9; const y = p.y - Math.sin(k * Math.PI) * 60; ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.translate(p.x, y); ctx.scale(1.3, 1.3); ctx.rotate(-0.6 + k * 1.2); if (p.kind === 'crab') crabShape(ctx, t); else fishShape(ctx, p.kind); ctx.restore(); }
        else { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt; ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      }
      hud(ctx, W, [`🐟 ${caught}`, `⏱ ${Math.max(0, Math.ceil(time))}`]);
    });
  }
  function fishIntro() {
    const s = S();
    intro({ title: 'Zora\'s Reservoir', npc: 'Prince Sidon', art: ART.sidon(), backLabel: '◀ Zora\'s Domain', onBack: toRegion('english'), theme: 'english', music: 'english', play: fishing,
      text: 'The reservoir is full of fish again, thanks to you! Catch them with your bare hands, just like we Zora do. Grab each fish the moment it splashes up to the surface. Oh, and watch for crabs scuttling along the shore!', best: `Fish caught so far: <b>${s.counters.fishCaught || 0}</b>. Everything you catch goes in your Bag for cooking.` });
  }

  /* ======================= RITO VILLAGE: Snowball Bowling ======================= */
  // Seen from behind the bowler, like the game: push a snowball down the slope (it grows as it rolls) into ten wooden pins.
  // The head pin is nearest you; the row of four is at the back. Pins are knocked over with simple physics.
  function bowling() {
    const el = gameScreen('Snowball Bowling', '<p id="bmsg" class="muted">Watch the arrow, then tap <b>Roll!</b> to push the snowball. Aim for the pin at the front!</p><button class="btn big primary" id="act">☃️ Roll!</button>', 'verbal', 'verbal');
    const { cv, ctx, W, H } = stage(el, 1.15);
    const HZ = H * 0.25, BOT = H + 6, HALF = W * 0.46;
    const P = (x, z) => { const p = 1 / (1 + z * 0.13); return { x: W / 2 + x * HALF * p, y: HZ + (BOT - HZ) * p, s: p }; };
    const PIN_R = 0.12, Z0 = 6.4, DZ = 0.46, DX = 0.27;
    let pins, ball = null, aim = 0, dir = 1, state = 'aim', frame = 1, total = 0, strikes = 0, settle = 0, results = [], t = 0;
    const flakes = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.6 + Math.random() * 1.4 }));
    const msg = m => { const e = $('#bmsg'); if (e) e.innerHTML = m; };
    const rack = () => { pins = []; for (let k = 0; k < 4; k++) for (let j = 0; j <= k; j++) pins.push({ x: (j - k / 2) * 2 * DX, z: Z0 + k * DZ, vx: 0, vz: 0, down: false, tilt: 0, side: 1 }); };
    rack();
    const act = () => { if (state !== 'aim') return; state = 'roll'; ball = { x: 0, z: 0.5, vx: aim * 0.55 + (Math.random() - 0.5) * 0.04, vz: 6.8, r: 0.2, spin: 0 }; U.sfx.click(); };
    UI().on('#act', act); bindKeys({ ' ': act, Enter: act });
    function drawPin(p) {
      const q = P(p.x, p.z); const h = HALF * q.s * 0.8, w = h * 0.36;
      ctx.save(); ctx.translate(q.x, q.y);
      ctx.fillStyle = 'rgba(40,60,90,.22)'; ctx.beginPath(); ctx.ellipse(p.tilt * p.side * h * 0.5, 0, w * (0.6 + p.tilt * 0.8), w * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(p.tilt * p.side * Math.PI / 2 * 0.95);
      const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#f4d8a4'); g.addColorStop(0.5, '#e0b878'); g.addColorStop(1, '#a87a44');
      ctx.beginPath(); ctx.moveTo(-w * 0.32, 0); ctx.bezierCurveTo(-w * 0.62, -h * 0.3, -w * 0.5, -h * 0.5, -w * 0.18, -h * 0.66); ctx.bezierCurveTo(-w * 0.3, -h * 0.8, -w * 0.32, -h, 0, -h); ctx.bezierCurveTo(w * 0.32, -h, w * 0.3, -h * 0.8, w * 0.18, -h * 0.66); ctx.bezierCurveTo(w * 0.5, -h * 0.5, w * 0.62, -h * 0.3, w * 0.32, 0); ctx.closePath();
      ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(1, 1.6 * q.s * 2); ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
      ctx.fillStyle = '#c63b4f'; ctx.fillRect(-w * 0.2, -h * 0.72, w * 0.4, h * 0.06); ctx.fillRect(-w * 0.21, -h * 0.64, w * 0.42, h * 0.035);
      ctx.strokeStyle = 'rgba(120,80,40,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-w * 0.1, -h * 0.1); ctx.lineTo(-w * 0.14, -h * 0.5); ctx.stroke();
      ctx.restore();
    }
    function drawBall(b) {
      const q = P(b.x, b.z); const r = b.r * HALF * q.s;
      ctx.fillStyle = 'rgba(40,60,90,.25)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, r * 1.05, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      const g = ctx.createRadialGradient(q.x - r * 0.35, q.y - r * 1.3, r * 0.1, q.x, q.y - r, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#e4f0f8'); g.addColorStop(1, '#a8c4dc');
      ctx.beginPath(); ctx.arc(q.x, q.y - r, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
      ctx.fillStyle = 'rgba(160,190,215,.6)'; for (let i = 0; i < 5; i++) { const a = b.spin + i * 1.26; ctx.beginPath(); ctx.arc(q.x + Math.cos(a) * r * 0.55, q.y - r + Math.sin(a) * r * 0.5, r * 0.09, 0, Math.PI * 2); ctx.fill(); }
    }
    loop(cv, dt => {
      t += dt;
      if (state === 'aim') { aim += dir * dt * 1.15; if (aim > 1 || aim < -1) { dir *= -1; aim = Math.max(-1, Math.min(1, aim)); } }
      if (state === 'roll' || state === 'settle') {
        if (ball) {
          ball.x += ball.vx * dt; ball.z += ball.vz * dt; ball.r = Math.min(0.34, 0.2 + ball.z * 0.018); ball.spin += dt * 9;
          if (Math.abs(ball.x) > 1 - ball.r) { ball.x = Math.sign(ball.x) * (1 - ball.r); ball.vx *= -0.3; }
          if (ball.z > 12) ball = null;
        }
        for (const p of pins) {
          if (ball) { const dx = p.x - ball.x, dz = p.z - ball.z, d = Math.hypot(dx, dz); if (d < ball.r + PIN_R && d > 0) { const sp = Math.hypot(ball.vx, ball.vz) * 0.85; p.vx += dx / d * sp + ball.vx * 0.3; p.vz += dz / d * sp * 0.6 + ball.vz * 0.25; if (!p.down) { p.down = true; U.sfx.hit(); } ball.vz *= 0.93; } }
          p.x += p.vx * dt; p.z += p.vz * dt; const f = Math.max(0, 1 - dt * 2.6); p.vx *= f; p.vz *= f;
          if (p.down) { p.tilt = Math.min(1, p.tilt + dt * 4); if (Math.abs(p.vx) > 0.05) p.side = Math.sign(p.vx); }
        }
        for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
          const a = pins[i], b = pins[j]; const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
          if (d < PIN_R * 2.4 && d > 0) {
            const sa = Math.hypot(a.vx, a.vz), sb = Math.hypot(b.vx, b.vz);
            if (sa > 0.5 && !b.down) { b.down = true; b.vx += dx / d * sa * 0.7; b.vz += dz / d * sa * 0.7; U.sfx.tick(); }
            if (sb > 0.5 && !a.down) { a.down = true; a.vx -= dx / d * sb * 0.7; a.vz -= dz / d * sb * 0.7; U.sfx.tick(); }
          }
        }
        if (state === 'roll' && !ball) { state = 'settle'; settle = 1.2; }
        if (state === 'settle') {
          settle -= dt;
          if (settle <= 0) {
            const n = pins.filter(p => p.down).length; total += n; results.push(n);
            if (n === 10) { strikes++; State.count('strikes'); FX.banner('STRIKE! ☃️', 'victory'); U.sfx.fanfare(); } else { (n ? U.sfx.coin : U.sfx.wrong)(); FX.floatText(cv, `${n} pin${n === 1 ? '' : 's'}`, 'xp'); }
            frame++; State.save();
            if (frame > 3) {
              state = 'over'; const s = S(); const prize = total * 3 + strikes * 30; s.rupees += prize; State.countMax('bowlBest', total); State.save();
              finish('Game over!', `<p>Your rolls: <b>${results.join(' · ')}</b> (total ${total}/30)${strikes ? ` with <b>${strikes} strike${strikes > 1 ? 's' : ''}</b>! ☃️` : '.'}</p><p>Prize: <b>${prize} rupees</b></p>`, bowlIntro);
            } else { state = 'aim'; rack(); msg(`Roll ${frame} of 3. ${n === 10 ? 'Amazing!' : n >= 7 ? 'So close! Aim for the front pin.' : 'Try rolling straight at the front pin!'}`); }
          }
        }
      }
      // Hebra sky, snowy peaks and pines
      const sky = ctx.createLinearGradient(0, 0, 0, HZ + 20); sky.addColorStop(0, '#7fb0e0'); sky.addColorStop(1, '#dcecf8'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HZ + 20);
      ctx.fillStyle = '#c8d8ec'; ctx.beginPath(); ctx.moveTo(0, HZ + 6); [[0.08, 0.5], [0.2, 0.25], [0.32, 0.55], [0.46, 0.2], [0.6, 0.6], [0.74, 0.3], [0.9, 0.55], [1, 0.4]].forEach(([x, y]) => ctx.lineTo(W * x, HZ - HZ * 0.8 * (1 - y))); ctx.lineTo(W, HZ + 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); [[0.2, 0.25], [0.46, 0.2], [0.74, 0.3]].forEach(([x, y]) => { const px = W * x, py = HZ - HZ * 0.8 * (1 - y); ctx.moveTo(px, py); ctx.lineTo(px - 14, py + 14); ctx.lineTo(px - 4, py + 10); ctx.lineTo(px + 2, py + 16); ctx.lineTo(px + 14, py + 13); ctx.closePath(); }); ctx.fill();
      // the slope
      const a = P(-1.35, 0), b = P(1.35, 0), c = P(1.35, 14), d = P(-1.35, 14);
      ctx.fillStyle = '#eef5fb'; ctx.fillRect(0, HZ, W, H - HZ);
      const sg = ctx.createLinearGradient(0, HZ, 0, H); sg.addColorStop(0, '#dfeaf4'); sg.addColorStop(1, '#ffffff'); ctx.fillStyle = sg;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); ctx.fill();
      for (let z = 0; z < 14; z += 1.6) for (const side of [-1, 1]) { const q = P(side * 1.25, z); const hh = 30 * q.s; ctx.fillStyle = '#7a5230'; ctx.fillRect(q.x - 2 * q.s, q.y - hh, 4 * q.s, hh); ctx.fillStyle = '#c63b4f'; ctx.fillRect(q.x - 2 * q.s, q.y - hh, 4 * q.s, 5 * q.s); }
      for (const [side, z] of [[-1, 3], [1, 5], [-1, 9], [1, 11], [-1, 13]]) { const q = P(side * 1.9, z); const hh = 120 * q.s; ctx.fillStyle = '#2f5a3a'; ctx.beginPath(); ctx.moveTo(q.x, q.y - hh); ctx.lineTo(q.x - hh * 0.32, q.y); ctx.lineTo(q.x + hh * 0.32, q.y); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(q.x, q.y - hh); ctx.lineTo(q.x - hh * 0.14, q.y - hh * 0.58); ctx.lineTo(q.x + hh * 0.14, q.y - hh * 0.58); ctx.fill(); }
      ctx.strokeStyle = 'rgba(150,180,210,.5)'; ctx.lineWidth = 1; for (const x of [-0.5, 0, 0.5]) { const n0 = P(x, 0), n1 = P(x, 14); ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(n0.x, n0.y); ctx.lineTo(n1.x, n1.y); ctx.stroke(); } ctx.setLineDash([]);
      // aim line
      if (state === 'aim') {
        ctx.strokeStyle = 'rgba(198,59,79,.85)'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.beginPath();
        for (let z = 0.6; z <= Z0; z += 0.4) { const q = P(aim * 0.55 * (z - 0.5) / 6.8, z); if (z === 0.6) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); } ctx.stroke(); ctx.setLineDash([]);
        const tip = P(aim * 0.55 * (Z0 - 0.5) / 6.8, Z0 - 0.2); ctx.fillStyle = '#c63b4f'; ctx.beginPath(); ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2); ctx.fill();
      }
      // far things first
      const things = pins.map(p => ({ z: p.z, draw: () => drawPin(p) }));
      if (ball) things.push({ z: ball.z, draw: () => drawBall(ball) }); else if (state === 'aim') things.push({ z: 0.5, draw: () => drawBall({ x: 0, z: 0.5, r: 0.2, spin: t }) });
      things.sort((p, q) => q.z - p.z).forEach(o => o.draw());
      ctx.fillStyle = '#ffffff'; for (const f of flakes) { f.y += f.s * 30 * dt; f.x += Math.sin(t + f.y / 40) * 0.3; if (f.y > H) { f.y = -4; f.x = Math.random() * W; } ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
      hud(ctx, W, [`Roll ${Math.min(frame, 3)}/3`, `Pins ${total}`, `☃️ ${strikes}`]);
    });
  }
  function bowlIntro() {
    const s = S();
    intro({ title: 'Snowball Bowling', npc: 'Teba', art: ART.teba(), backLabel: '◀ Rito Village', onBack: toRegion('verbal'), theme: 'verbal', music: 'verbal', play: bowling,
      text: 'The skies are clear thanks to you. Fancy a game? Watch the arrow sweep and roll your snowball at just the right moment. Ten pins down is a strike!', best: `Best game: <b>${s.counters.bowlBest || 0}</b> pins · Strikes: <b>${s.counters.strikes || 0}</b>` });
  }

  /* ======================= GERUDO DESERT: Sand Seal Rally ======================= */
  // Shield-surf behind Riju's sand seal Patricia. Steer between three lanes and pass through each pair of flags; every gate adds time.
  function sealRally() {
    const el = gameScreen('Sand Seal Rally', '<div class="mg-ctrl"><button class="btn big" id="u">▲</button><button class="btn big" id="d">▼</button></div>', 'nonverbal', 'battle');
    const { cv, ctx, W, H } = stage(el, 0.8);
    const seal = sprite('sandSeal', ART.sandSeal(), 160, 90);
    const HOR = H * 0.34; const rowsY = [H * 0.5, H * 0.66, H * 0.84]; const scaleOf = y => 0.62 + (y - HOR) / (H - HOR) * 0.5;
    let row = 1, py = rowsY[1];
    let t = 22, gatesHit = 0, streak = 0, speed = 210, spawn = 0.6, scroll = 0, over = false, clock = 0;
    const gates = [], dust = [];
    const move = d => { if (!over) row = Math.max(0, Math.min(2, row + d)); };
    UI().on('#u', () => move(-1)); UI().on('#d', () => move(1));
    cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); move(e.clientY - r.top < r.height * 0.62 ? -1 : 1); });
    bindKeys({ ArrowUp: () => move(-1), ArrowDown: () => move(1), w: () => move(-1), s: () => move(1) });
    const px = W * 0.24;
    const flag = (x, y, sc, ok) => {
      const h = 46 * sc; ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3 * sc; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
      ctx.fillStyle = ok ? '#7ee35a' : '#c63b4f'; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + 12 * sc, y - h + 2 * sc + Math.sin(clock * 8 + x) * 2, x + 22 * sc, y - h + 6 * sc); ctx.lineTo(x, y - h + 14 * sc); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1d1a2b'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#ffd23d'; ctx.beginPath(); ctx.arc(x, y - h, 2.4 * sc, 0, Math.PI * 2); ctx.fill();
    };
    loop(cv, dt => {
      clock += dt;
      if (!over) {
        t -= dt; speed += dt * 5; scroll += speed * dt; spawn -= dt;
        if (spawn <= 0) { spawn = Math.max(0.55, 1.0 - gatesHit * 0.015); gates.push({ x: W + 40, r: U.int(0, 2) }); }
        py += (rowsY[row] - py) * Math.min(1, dt * 10);
        for (const g of gates) {
          g.x -= speed * dt;
          if (!g.done && g.x < px + 14) { g.done = true; if (row === g.r && Math.abs(rowsY[g.r] - py) < 22) { gatesHit++; streak++; t += 1.6; U.sfx.coin(); g.ok = true; FX.floatText(cv, streak >= 3 ? `+1.6s · ${streak} in a row!` : '+1.6s', 'xp'); for (let i = 0; i < 14; i++) dust.push({ x: px + 30, y: py - 10, vx: (Math.random() - 0.3) * 180, vy: (Math.random() - 0.8) * 180, life: 0.6, c: '#ffd23d' }); } else { streak = 0; U.sfx.wrong(); } }
        }
        for (let i = gates.length - 1; i >= 0; i--) if (gates[i].x < -40) gates.splice(i, 1);
        if (Math.random() < dt * 40) dust.push({ x: px - 40, y: py + 4, vx: -speed * (0.5 + Math.random() * 0.4), vy: -Math.random() * 60, life: 0.55, c: '#f0d090' });
        if (t <= 0) {
          over = true; const s = S(); const best = gatesHit > (s.counters.sealBest || 0); State.countMax('sealBest', gatesHit); const prize = gatesHit * 5; s.rupees += prize; State.save();
          finish('Time\'s up!', `<p>Patricia pulled you through <b>${gatesHit}</b> gate${gatesHit === 1 ? '' : 's'}${best ? ' — a new best! 🏆' : ''}.</p><p>Prize: <b>${prize} rupees</b></p>`, sealIntro);
        }
      }
      // Gerudo Desert: hazy sky, the walls of Gerudo Town, rolling dunes
      const sky = ctx.createLinearGradient(0, 0, 0, HOR); sky.addColorStop(0, '#f6b25a'); sky.addColorStop(1, '#ffe2a8'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HOR + 2);
      ctx.fillStyle = 'rgba(255,250,220,.8)'; ctx.beginPath(); ctx.arc(W * 0.82, HOR * 0.38, 18, 0, Math.PI * 2); ctx.fill();
      const tx = W * 0.7 - (scroll * 0.03) % (W * 1.8);
      ctx.fillStyle = '#c99a5a'; ctx.fillRect(tx - 40, HOR - 22, 80, 22); for (let i = 0; i < 5; i++) ctx.fillRect(tx - 40 + i * 18, HOR - 30, 8, 8);
      ctx.beginPath(); ctx.arc(tx, HOR - 26, 12, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#7a3aa0'; ctx.fillRect(tx - 2, HOR - 50, 2, 14); ctx.fillStyle = '#c63b4f'; ctx.fillRect(tx, HOR - 50, 8, 5);
      for (const [yy, c, sp, amp] of [[HOR - 4, '#e8b862', 0.15, 6], [HOR + 6, '#ddaa58', 0.3, 8]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, yy + Math.sin((x + scroll * sp) / 70) * amp); ctx.lineTo(W, H); ctx.fill(); }
      const sand = ctx.createLinearGradient(0, HOR, 0, H); sand.addColorStop(0, '#e2b468'); sand.addColorStop(1, '#c8903e'); ctx.fillStyle = sand; ctx.fillRect(0, HOR + 12, W, H - HOR - 12);
      ctx.strokeStyle = 'rgba(140,90,30,.28)'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { const y = HOR + 20 + (i % 6) * ((H - HOR - 20) / 6); const x = ((i * 120 - scroll * scaleOf(y)) % (W + 120) + W + 120) % (W + 120) - 60; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 6, x + 60, y); ctx.stroke(); }
      // gates and Patricia drawn back to front
      const items = gates.map(g => ({ y: rowsY[g.r], draw: () => { const y = rowsY[g.r], sc = scaleOf(y); flag(g.x - 6 * sc, y - 26 * sc, sc * 0.9, g.ok); ctx.strokeStyle = 'rgba(90,58,34,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(g.x - 6 * sc, y - 26 * sc - 36 * sc); ctx.lineTo(g.x + 6 * sc, y + 20 * sc - 40 * sc); ctx.stroke(); } }));
      items.push({ y: py + 0.5, draw: () => { const sc = scaleOf(py); if (ready(seal)) ctx.drawImage(seal, px - 72 * sc, py - 66 * sc, 144 * sc, 81 * sc); } });
      gates.forEach(g => items.push({ y: rowsY[g.r] + 1, draw: () => { const y = rowsY[g.r], sc = scaleOf(y); flag(g.x + 6 * sc, y + 20 * sc, sc, g.ok); } }));
      items.sort((a, b) => a.y - b.y).forEach(o => o.draw());
      for (let i = dust.length - 1; i >= 0; i--) { const p = dust[i]; p.life -= dt; if (p.life <= 0) { dust.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; ctx.globalAlpha = p.life * 1.5; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.fillStyle = 'rgba(255,240,200,.08)'; ctx.fillRect(0, HOR, W, 30);
      hud(ctx, W, [`🚩 ${gatesHit}`, `⏱ ${Math.max(0, Math.ceil(t))}`]);
    });
  }
  function sealIntro() {
    const s = S();
    intro({ title: 'Sand Seal Rally', npc: 'Riju', art: ART.riju(), backLabel: '◀ Gerudo Desert', onBack: toRegion('nonverbal'), theme: 'nonverbal', music: 'nonverbal', play: sealRally,
      text: 'Thanks to you, Vah Naboris sleeps peacefully. Borrow my sand seal Patricia and surf behind her on your shield! Ride between each pair of flags. Every gate you pass gives you more time.', best: `Best rally: <b>${s.counters.sealBest || 0}</b> gates. Steer with ▲ ▼ or tap the top/bottom of the sand.` });
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
    english: { game: 'Zora\'s Reservoir', art: () => ART.sidon(), people: 'Zora', open: fishIntro },
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

  // shared helpers for the canvas mini-games in world.js
  window.MG = { sprite, ready, stage, loop, rr, rupee, hud, bindKeys, finish, gameScreen };
  window.Regions = { regionPanel, bindRegionPanel, cycleIntro, rockIntro, fishIntro, bowlIntro, sealIntro };
})();
