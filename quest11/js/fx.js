// Visual effects: animated painted backgrounds (canvas), particle bursts, screen shake,
// floating text, flying rupees, item-get fanfare overlay, treasure chests, and ambient music.
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bg = document.getElementById('bgfx');
  const fg = document.getElementById('fgfx');
  const bctx = bg.getContext('2d');
  const fctx = fg.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let theme = null, layers = [], amb = [], bursts = [], t0 = performance.now(), flashA = 0, flashC = '#fff';

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    for (const c of [bg, fg]) { c.width = W * DPR; c.height = H * DPR; c.style.width = W + 'px'; c.style.height = H + 'px'; }
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0); fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (theme) build(theme);
  }

  /* ---------- seeded noise for mountain ridges ---------- */
  function ridge(seed, n, rough) {
    let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    let pts = [r(), r()];
    for (let it = 0; it < n; it++) {
      const next = [];
      for (let i = 0; i < pts.length - 1; i++) next.push(pts[i], (pts[i] + pts[i + 1]) / 2 + (r() - 0.5) * rough / (it + 1));
      next.push(pts[pts.length - 1]); pts = next;
    }
    return pts;
  }

  /* ---------- themes ---------- */
  const THEMES = {
    title: { sky: ['#ffb27a', '#ffd9a8', '#8ec5ff'], sun: { x: 0.72, y: 0.36, r: 70, c: '#fff1c4' }, hills: [['#8aa6c9', 0.52, 0.18, 11], ['#6f8fb5', 0.6, 0.16, 7], ['#4e7a5b', 0.72, 0.14, 5], ['#2f5a3a', 0.84, 0.1, 3]], castle: 0.58, castleX: 0.8, malice: true, clouds: 5, part: 'sparkle' },
    plateau: { sky: ['#5fa8e8', '#a9d8ff', '#e6f5ff'], sun: { x: 0.2, y: 0.18, r: 50, c: '#fffbe0' }, hills: [['#9cb8d6', 0.55, 0.16, 21], ['#6f9a6a', 0.66, 0.14, 13], ['#4f8048', 0.78, 0.12, 4], ['#355f31', 0.9, 0.08, 9]], clouds: 6, part: 'leaf' },
    map: { sky: ['#06121d', '#0b1f30', '#102a40'], hills: [], part: 'mote', grid: true },
    maths: { sky: ['#2a0b08', '#5a1a0e', '#a3361a'], sun: { x: 0.78, y: 0.3, r: 34, c: '#ff8a3d' }, hills: [['#4a1c14', 0.5, 0.3, 31, 'volcano'], ['#3a1510', 0.68, 0.14, 2], ['#24100c', 0.84, 0.1, 17]], part: 'ember', lava: true },
    english: { sky: ['#0a1e33', '#13426a', '#2a6d9a'], hills: [['#1c4a6e', 0.55, 0.16, 41], ['#16405f', 0.68, 0.12, 8], ['#0e2f47', 0.82, 0.08, 6]], part: 'rain', water: true, clouds: 4, cloudC: 'rgba(80,110,140,.5)' },
    verbal: { sky: ['#5b7fa8', '#a8c3dd', '#e8f0f7'], hills: [['#c9d6e3', 0.45, 0.3, 51], ['#9fb1c7', 0.6, 0.2, 12], ['#7d93ad', 0.76, 0.12, 3]], part: 'snow', pillar: true, clouds: 4 },
    nonverbal: { sky: ['#ff9e5a', '#ffc77a', '#ffe2a8'], sun: { x: 0.5, y: 0.42, r: 80, c: '#fff1c4' }, hills: [['#e0a35e', 0.62, 0.08, 61], ['#d18c45', 0.72, 0.07, 14], ['#b8722f', 0.84, 0.06, 15]], part: 'sand', lightning: true },
    shrine: { sky: ['#030a12', '#081a2a', '#0c2438'], hills: [], part: 'mote', circuits: true },
    castle: { sky: ['#14030b', '#3a0a22', '#6a1038'], hills: [['#2a0a1c', 0.58, 0.18, 71], ['#1a0612', 0.78, 0.1, 18]], castle: 0.52, malice: true, part: 'malice' },
    bloodmoon: { sky: ['#1a0206', '#4a0812', '#7a1020'], moon: true, hills: [['#2a060c', 0.68, 0.14, 81], ['#150306', 0.84, 0.08, 19]], part: 'bloodmote' },
    win: { sky: ['#0f3b52', '#2b7a8f', '#ffd98a'], sun: { x: 0.5, y: 0.75, r: 90, c: '#fff4c8' }, hills: [['#2c5a4a', 0.78, 0.1, 91], ['#1d4034', 0.88, 0.06, 23]], part: 'sparkle', rays: true },
    memory: { sky: ['#3a3424', '#6a5d3e', '#a8956a'], hills: [['#5a5038', 0.7, 0.12, 7]], part: 'sparkle', sepia: true },
  };

  function build(name) {
    const T = THEMES[name] || THEMES.map; theme = name;
    layers = T.hills.map(([c, base, amp, seed, kind]) => ({ c, base, amp, kind, pts: ridge(seed * 7919 + 13, 7, 1.2) }));
    amb = []; const n = reduce ? 0 : Math.round(Math.min(110, (W * H) / 14000));
    for (let i = 0; i < n; i++) amb.push(spawnAmb(T.part, true));
    clouds = []; for (let i = 0; i < (T.clouds || 0); i++) clouds.push({ x: Math.random() * W, y: H * (0.08 + Math.random() * 0.3), s: 0.6 + Math.random() * 0.9, v: 4 + Math.random() * 8 });
  }
  let clouds = [];
  function spawnAmb(kind, anywhere) {
    const p = { kind, x: Math.random() * W, y: anywhere ? Math.random() * H : 0, a: Math.random() * Math.PI * 2, s: Math.random() };
    switch (kind) {
      case 'ember': p.y = anywhere ? p.y : H + 10; p.vx = (Math.random() - 0.5) * 20; p.vy = -20 - Math.random() * 50; p.r = 1 + Math.random() * 2.2; break;
      case 'rain': p.y = anywhere ? p.y : -20; p.vx = -60; p.vy = 520 + Math.random() * 200; p.r = 10 + Math.random() * 10; break;
      case 'snow': p.y = anywhere ? p.y : -10; p.vx = 30 + Math.random() * 40; p.vy = 30 + Math.random() * 40; p.r = 1 + Math.random() * 2.6; break;
      case 'sand': p.x = anywhere ? p.x : -10; p.vx = 120 + Math.random() * 160; p.vy = (Math.random() - 0.3) * 20; p.r = 0.8 + Math.random() * 1.6; break;
      case 'leaf': p.y = anywhere ? p.y : -10; p.vx = 20 + Math.random() * 30; p.vy = 25 + Math.random() * 30; p.r = 3 + Math.random() * 3; break;
      case 'malice': case 'bloodmote': p.y = anywhere ? p.y : H + 10; p.vx = (Math.random() - 0.5) * 16; p.vy = -14 - Math.random() * 30; p.r = 2 + Math.random() * 4; break;
      case 'mote': p.y = anywhere ? p.y : H + 10; p.vx = (Math.random() - 0.5) * 8; p.vy = -8 - Math.random() * 18; p.r = 1 + Math.random() * 2; break;
      default: p.vx = 0; p.vy = 0; p.r = 1 + Math.random() * 2; // sparkle
    }
    return p;
  }

  function drawSky(T, tm) {
    const g = bctx.createLinearGradient(0, 0, 0, H);
    T.sky.forEach((c, i) => g.addColorStop(i / (T.sky.length - 1), c));
    bctx.fillStyle = g; bctx.fillRect(0, 0, W, H);
    if (T.circuits || T.grid) {
      bctx.save(); bctx.strokeStyle = 'rgba(63,224,255,.08)'; bctx.lineWidth = 1;
      const step = 48; for (let x = 0; x < W; x += step) { bctx.beginPath(); bctx.moveTo(x, 0); bctx.lineTo(x, H); bctx.stroke(); }
      for (let y = 0; y < H; y += step) { bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(W, y); bctx.stroke(); }
      if (T.circuits) {
        const cx = W / 2, cy = H * 0.42;
        for (let i = 1; i <= 4; i++) {
          bctx.strokeStyle = `rgba(63,224,255,${0.05 + 0.04 * i})`; bctx.lineWidth = 2;
          bctx.beginPath(); const r = 60 * i + 20; const a0 = tm * 0.15 * (i % 2 ? 1 : -1);
          for (let k = 0; k < 6; k++) bctx.arc(cx, cy, r, a0 + k * Math.PI / 3, a0 + k * Math.PI / 3 + 0.7);
          bctx.stroke();
        }
      }
      bctx.restore();
    }
    if (T.rays) {
      bctx.save(); bctx.translate(W / 2, H * 0.75); bctx.rotate(tm * 0.05);
      for (let i = 0; i < 14; i++) { bctx.rotate(Math.PI / 7); bctx.fillStyle = 'rgba(255,240,190,.07)'; bctx.beginPath(); bctx.moveTo(0, 0); bctx.lineTo(-60, -H * 1.2); bctx.lineTo(60, -H * 1.2); bctx.fill(); }
      bctx.restore();
    }
    if (T.sun) {
      const s = T.sun; const gx = W * s.x, gy = H * s.y;
      const sg = bctx.createRadialGradient(gx, gy, 0, gx, gy, s.r * 4);
      sg.addColorStop(0, s.c); sg.addColorStop(0.25, s.c + 'aa'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      bctx.fillStyle = sg; bctx.fillRect(0, 0, W, H);
      bctx.fillStyle = s.c; bctx.beginPath(); bctx.arc(gx, gy, s.r * 0.6, 0, 7); bctx.fill();
    }
    if (T.moon) {
      const gx = W * 0.7, gy = H * 0.25, r = Math.min(W, H) * 0.14;
      const mg = bctx.createRadialGradient(gx, gy, r * 0.2, gx, gy, r * 3);
      mg.addColorStop(0, 'rgba(255,60,60,.6)'); mg.addColorStop(1, 'rgba(255,0,0,0)');
      bctx.fillStyle = mg; bctx.fillRect(0, 0, W, H);
      bctx.fillStyle = '#d42a2a'; bctx.beginPath(); bctx.arc(gx, gy, r, 0, 7); bctx.fill();
      bctx.fillStyle = 'rgba(120,0,0,.35)'; bctx.beginPath(); bctx.arc(gx - r * 0.3, gy - r * 0.2, r * 0.25, 0, 7); bctx.arc(gx + r * 0.25, gy + r * 0.3, r * 0.18, 0, 7); bctx.fill();
    }
  }
  function drawClouds(T, dt) {
    for (const c of clouds) {
      c.x += c.v * dt; if (c.x > W + 200) c.x = -200;
      bctx.fillStyle = T.cloudC || 'rgba(255,255,255,.55)';
      bctx.beginPath();
      for (const [dx, dy, r] of [[0, 0, 30], [30, -10, 36], [62, 0, 28], [30, 8, 30]]) bctx.arc(c.x + dx * c.s, c.y + dy * c.s, r * c.s, 0, 7);
      bctx.fill();
    }
  }
  function drawLayers(T, tm) {
    layers.forEach((L, li) => {
      const baseY = H * L.base, amp = H * L.amp; const n = L.pts.length;
      bctx.fillStyle = L.c; bctx.beginPath(); bctx.moveTo(0, H);
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * W; let y = baseY - L.pts[i] * amp;
        if (L.kind === 'volcano') { const d = Math.abs(i / (n - 1) - 0.62); y = baseY - Math.max(0, 1 - d * 3.2) * amp * 1.6 - L.pts[i] * amp * 0.3; if (d < 0.04) y = baseY - amp * 1.45; }
        bctx.lineTo(x, y);
      }
      bctx.lineTo(W, H); bctx.closePath(); bctx.fill();
      if (L.kind === 'volcano') {
        const vx = W * 0.62, vy = baseY - amp * 1.45;
        const lg = bctx.createRadialGradient(vx, vy, 0, vx, vy, 90); lg.addColorStop(0, `rgba(255,${120 + 40 * Math.sin(tm * 2)},40,.9)`); lg.addColorStop(1, 'rgba(255,80,20,0)');
        bctx.fillStyle = lg; bctx.fillRect(vx - 90, vy - 90, 180, 180);
        bctx.strokeStyle = 'rgba(255,110,30,.8)'; bctx.lineWidth = 3; bctx.beginPath(); bctx.moveTo(vx - 6, vy + 4); bctx.quadraticCurveTo(vx - 20, vy + 60, vx - 40, vy + 120); bctx.stroke();
      }
      // castle on its own layer
      if (T.castle && li === 0) drawCastle(W * (T.castleX || 0.5), H * T.castle, Math.min(W, H) / 700, T.malice, tm);
      if (T.pillar && li === 1) { bctx.fillStyle = '#6f8099'; const px = W * 0.22, py = H * 0.6; bctx.fillRect(px - 16, py - H * 0.32, 32, H * 0.32); bctx.beginPath(); bctx.ellipse(px, py - H * 0.32, 40, 10, 0, 0, 7); bctx.fill(); }
    });
    if (T.water) {
      const y = H * 0.8; const g = bctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#1f6fa8'); g.addColorStop(1, '#0b2c45');
      bctx.fillStyle = g; bctx.fillRect(0, y, W, H - y);
      bctx.strokeStyle = 'rgba(180,230,255,.25)'; bctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) { const yy = y + 10 + i * 14; bctx.beginPath(); for (let x = 0; x <= W; x += 20) bctx.lineTo(x, yy + Math.sin(x / 40 + tm * 2 + i) * 2); bctx.stroke(); }
    }
    if (T.lava) {
      const y = H * 0.93; const g = bctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#ff7a2a'); g.addColorStop(1, '#a3240c');
      bctx.fillStyle = g; bctx.beginPath(); bctx.moveTo(0, H); for (let x = 0; x <= W; x += 24) bctx.lineTo(x, y + Math.sin(x / 50 + tm * 1.5) * 4); bctx.lineTo(W, H); bctx.fill();
    }
  }
  function drawCastle(x, y, s, malice, tm) {
    bctx.save(); bctx.translate(x, y); bctx.scale(s, s);
    if (malice) {
      const g = bctx.createRadialGradient(0, -60, 10, 0, -60, 220); g.addColorStop(0, `rgba(255,45,111,${0.55 + 0.15 * Math.sin(tm * 1.5)})`); g.addColorStop(1, 'rgba(160,16,63,0)');
      bctx.fillStyle = g; bctx.fillRect(-240, -280, 480, 360);
      bctx.strokeStyle = 'rgba(255,45,111,.55)'; bctx.lineWidth = 6;
      for (let i = 0; i < 5; i++) { const a = tm * 0.4 + i * 1.3; bctx.beginPath(); bctx.arc(0, -70, 110 + i * 8, a, a + 1.2); bctx.stroke(); }
    }
    bctx.fillStyle = malice ? '#3a2a3e' : '#c9c3d6';
    bctx.beginPath();
    bctx.moveTo(-90, 0); bctx.lineTo(-90, -50); bctx.lineTo(-70, -50); bctx.lineTo(-70, -80); bctx.lineTo(-55, -95); bctx.lineTo(-40, -80); bctx.lineTo(-40, -60);
    bctx.lineTo(-20, -60); bctx.lineTo(-20, -130); bctx.lineTo(0, -175); bctx.lineTo(20, -130); bctx.lineTo(20, -60); bctx.lineTo(40, -60); bctx.lineTo(40, -90); bctx.lineTo(55, -110); bctx.lineTo(70, -90); bctx.lineTo(70, -50); bctx.lineTo(90, -50); bctx.lineTo(90, 0);
    bctx.closePath(); bctx.fill();
    bctx.restore();
  }
  function drawAmb(T, dt, tm) {
    for (let i = 0; i < amb.length; i++) {
      const p = amb[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.a += dt;
      if (p.kind === 'leaf' || p.kind === 'snow') p.x += Math.sin(p.a * 2) * 0.4;
      if (p.kind === 'firefly' || p.kind === 'mote') p.x += Math.sin(p.a) * 0.3;
      const out = p.y > H + 30 || p.y < -30 || p.x > W + 30 || p.x < -30;
      if (out) { amb[i] = spawnAmb(p.kind, false); continue; }
      switch (p.kind) {
        case 'ember': bctx.fillStyle = `rgba(255,${120 + Math.random() * 100},40,${0.5 + 0.5 * Math.sin(p.a * 6)})`; bctx.fillRect(p.x, p.y, p.r, p.r); break;
        case 'rain': bctx.strokeStyle = 'rgba(190,225,255,.45)'; bctx.lineWidth = 1; bctx.beginPath(); bctx.moveTo(p.x, p.y); bctx.lineTo(p.x - p.r * 0.12, p.y + p.r); bctx.stroke(); break;
        case 'snow': bctx.fillStyle = 'rgba(255,255,255,.85)'; bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, 7); bctx.fill(); break;
        case 'sand': bctx.fillStyle = 'rgba(255,230,180,.6)'; bctx.fillRect(p.x, p.y, p.r * 3, p.r); break;
        case 'leaf': bctx.save(); bctx.translate(p.x, p.y); bctx.rotate(p.a * 2); bctx.fillStyle = 'rgba(120,190,80,.85)'; bctx.beginPath(); bctx.ellipse(0, 0, p.r, p.r / 2.4, 0, 0, 7); bctx.fill(); bctx.restore(); break;
        case 'malice': bctx.fillStyle = `rgba(255,45,111,${0.25 + 0.2 * Math.sin(p.a * 3)})`; bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, 7); bctx.fill(); break;
        case 'bloodmote': bctx.fillStyle = `rgba(255,40,40,${0.3 + 0.3 * Math.sin(p.a * 3)})`; bctx.beginPath(); bctx.arc(p.x, p.y, p.r * 0.6, 0, 7); bctx.fill(); break;
        case 'mote': bctx.fillStyle = `rgba(63,224,255,${0.35 + 0.35 * Math.sin(p.a * 2)})`; bctx.beginPath(); bctx.arc(p.x, p.y, p.r, 0, 7); bctx.fill(); break;
        default: { const tw = 0.5 + 0.5 * Math.sin(p.a * 3 + p.s * 9); bctx.fillStyle = `rgba(255,250,220,${tw * 0.8})`; bctx.beginPath(); bctx.arc(p.x, p.y, p.r * tw, 0, 7); bctx.fill(); }
      }
    }
    if (T.lightning && Math.random() < 0.002) flash('#fff8c4', 0.35);
  }

  /* ---------- bursts on the foreground canvas ---------- */
  function burst(x, y, o = {}) {
    if (reduce) return;
    const n = o.n || 24, colors = o.colors || ['#3fe0ff', '#ffffff'];
    for (let i = 0; i < n; i++) {
      const a = o.dir !== undefined ? o.dir + (Math.random() - 0.5) * (o.spread || 1.2) : Math.random() * Math.PI * 2;
      const sp = (o.speed || 260) * (0.3 + Math.random() * 0.9);
      bursts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: (o.life || 0.8) * (0.6 + Math.random() * 0.6), r: (o.size || 3) * (0.5 + Math.random()), c: colors[i % colors.length], g: o.gravity ?? 300, kind: o.kind || 'dot' });
    }
  }
  function smoke(x, y, color = '#3a1a3a') { burst(x, y, { n: 30, colors: [color, '#5a2a5a', '#1a0a1a'], speed: 90, life: 1.4, size: 14, gravity: -60, kind: 'smoke' }); }
  function flash(c = '#fff', a = 0.8) { flashC = c; flashA = a; }

  function drawFg(dt) {
    fctx.clearRect(0, 0, W, H);
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i]; p.life += dt; if (p.life > p.max) { bursts.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985;
      const k = 1 - p.life / p.max;
      fctx.globalAlpha = p.kind === 'smoke' ? k * 0.55 : k;
      fctx.fillStyle = p.c;
      if (p.kind === 'star') { fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.life * 6); fctx.fillRect(-p.r, -p.r / 4, p.r * 2, p.r / 2); fctx.fillRect(-p.r / 4, -p.r, p.r / 2, p.r * 2); fctx.restore(); }
      else { fctx.beginPath(); fctx.arc(p.x, p.y, p.kind === 'smoke' ? p.r * (1.6 - k) : p.r, 0, 7); fctx.fill(); }
    }
    fctx.globalAlpha = 1;
    if (flashA > 0.01) { fctx.fillStyle = flashC; fctx.globalAlpha = flashA; fctx.fillRect(0, 0, W, H); fctx.globalAlpha = 1; flashA *= 0.88; }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const tm = (now - t0) / 1000;
    if (document.visibilityState === 'visible' && theme) {
      const T = THEMES[theme];
      drawSky(T, tm); drawClouds(T, dt); drawLayers(T, tm); drawAmb(T, dt, tm);
      if (T.sepia) { bctx.fillStyle = 'rgba(80,60,30,.25)'; bctx.fillRect(0, 0, W, H); }
      drawFg(dt);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- DOM effects ---------- */
  const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  function shake(strength = 1) { if (reduce) return; const a = document.getElementById('app'); a.style.setProperty('--shake', strength * 8 + 'px'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
  function floatText(el, text, cls = '') {
    const [x, y] = el ? center(el) : [W / 2, H / 2];
    const d = document.createElement('div'); d.className = 'float-text ' + cls; d.innerHTML = text; d.style.left = x + 'px'; d.style.top = y + 'px';
    document.body.appendChild(d); setTimeout(() => d.remove(), 1400);
  }
  function flyTo(fromEl, toSel, html, cls = '') {
    const to = document.querySelector(toSel); if (!fromEl) return;
    const [x, y] = center(fromEl); const [tx, ty] = to ? center(to) : [W - 60, 20];
    const d = document.createElement('div'); d.className = 'fly ' + cls; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px';
    document.body.appendChild(d);
    const jump = -60 - Math.random() * 40, jx = (Math.random() - 0.5) * 80;
    d.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', offset: 0 },
      { transform: `translate(calc(-50% + ${jx}px), calc(-50% + ${jump}px)) scale(1.2)`, offset: 0.35 },
      { transform: `translate(calc(-50% + ${tx - x}px), calc(-50% + ${ty - y}px)) scale(.6)`, offset: 1 },
    ], { duration: reduce ? 10 : 900, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = () => { d.remove(); if (to) { to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); } };
  }
  function banner(text, cls = '') {
    const d = document.createElement('div'); d.className = 'banner ' + cls; d.innerHTML = `<span>${text}</span>`;
    document.body.appendChild(d); setTimeout(() => d.remove(), 1700);
  }
  // "You got X!" — item held aloft with radiating light
  function itemGet(icon, title, sub = '', done) {
    U.sfx.fanfare();
    const ov = document.createElement('div'); ov.className = 'itemget';
    ov.innerHTML = `<div class="ig-rays"></div><div class="ig-icon">${icon}</div><div class="ig-text"><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}<small>tap to continue</small></div>`;
    document.body.appendChild(ov);
    const [x, y] = center(ov.querySelector('.ig-icon'));
    setTimeout(() => burst(x, y, { n: 50, colors: ['#fff6c8', '#ffd75a', '#3fe0ff'], kind: 'star', size: 6, gravity: 40, speed: 320, life: 1.2 }), 250);
    let closed = false;
    const close = () => { if (closed) return; closed = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); done && done(); }, 300); };
    setTimeout(() => ov.addEventListener('click', close), 400);
    const kh = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.removeEventListener('keydown', kh); close(); } };
    setTimeout(() => document.addEventListener('keydown', kh), 400);
  }
  // treasure chest that opens to reveal rewards: items = [{icon, label}]
  function chest(items, done, title = 'Treasure Chest!') {
    const ov = document.createElement('div'); ov.className = 'chest-ov';
    ov.innerHTML = `<h2>${title}</h2><div class="chest-big">${ART.icons.chest()}</div><p class="muted">Tap the chest to open it!</p><div class="loot"></div>`;
    document.body.appendChild(ov);
    const box = ov.querySelector('.chest-big');
    let opened = false;
    box.addEventListener('click', () => {
      if (opened) return; opened = true; U.sfx.solved();
      box.innerHTML = ART.icons.chest(true); box.classList.add('opened');
      ov.querySelector('p').textContent = '';
      const [x, y] = center(box); burst(x, y - 20, { n: 60, colors: ['#ffe066', '#fff', '#5ce06a', '#5cb8ff'], kind: 'star', size: 5, speed: 380, dir: -Math.PI / 2, spread: 1.8 });
      const loot = ov.querySelector('.loot');
      items.forEach((it, i) => setTimeout(() => { const d = document.createElement('div'); d.className = 'loot-item'; d.innerHTML = `${it.icon}<span>${it.label}</span>`; loot.appendChild(d); U.sfx.coin(); }, 350 + i * 260));
      setTimeout(() => { const b = document.createElement('button'); b.className = 'btn primary'; b.textContent = 'Collect ▶'; b.onclick = () => { ov.remove(); done && done(); }; ov.appendChild(b); b.focus(); }, 450 + items.length * 260);
    });
  }
  // projectile from one element to another (boss attacks)
  function projectile(fromEl, toEl, kind = 'malice', onHit) {
    if (!fromEl || !toEl) { onHit && onHit(); return; }
    const [x, y] = center(fromEl), [tx, ty] = center(toEl);
    const d = document.createElement('div'); d.className = 'proj proj-' + kind; d.style.left = x + 'px'; d.style.top = y + 'px';
    document.body.appendChild(d);
    if (kind === 'thunder') { d.style.left = tx + 'px'; d.style.top = (ty - 140) + 'px'; }
    const anim = kind === 'thunder'
      ? d.animate([{ opacity: 0, transform: 'translate(-50%,0) scaleY(.2)' }, { opacity: 1, transform: 'translate(-50%,0) scaleY(1)' }, { opacity: 0 }], { duration: 380 })
      : d.animate([{ transform: 'translate(-50%,-50%) scale(.6)' }, { transform: `translate(calc(-50% + ${tx - x}px), calc(-50% + ${ty - y}px)) scale(1.2)` }], { duration: reduce ? 10 : 420, easing: 'ease-in' });
    anim.onfinish = () => {
      d.remove();
      const col = { fire: ['#ff7a45', '#ffd75a'], water: ['#5cc8ff', '#e8f6ff'], wind: ['#bff2dc', '#fff'], thunder: ['#ffe866', '#fff'], malice: ['#ff2d6f', '#3a0a22'] }[kind] || ['#fff'];
      burst(tx, ty, { n: 26, colors: col, speed: 220, size: 4 });
      onHit && onHit();
    };
  }
  function slash(el) {
    if (!el) return;
    const [x, y] = center(el);
    const d = document.createElement('div'); d.className = 'slash'; d.style.left = x + 'px'; d.style.top = y + 'px';
    d.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
    document.body.appendChild(d); setTimeout(() => d.remove(), 400);
    burst(x, y, { n: 18, colors: ['#ffffff', '#bfefff', '#ffe066'], kind: 'star', speed: 300, size: 4, gravity: 120 });
  }

  /* ---------- ambient music: sparse piano-like notes, BotW style ---------- */
  // Original music engine. Every area has its own key, tempo, instruments and chord progressions; melodies are composed
  // on the fly from short motifs that develop across A/B sections, so the music never loops exactly the same way.
  // Exploration themes are sparse and gentle (piano, harp, strings, flute); battle themes add drums, ostinato and brass.
  const Music = (() => {
    let ctx, master, comp, verb, verbIn, noiseBuf, timer = null, mode = null, on = true, step = 0, nextT = 0, intensity = 0, plan = null;
    const SC = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10], hijaz: [0, 1, 4, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11] };
    // progs: chord roots as scale degrees (0 = tonic). inst: which voices play. sparse: chance a phrase rests (gentle themes breathe).
    const STYLES = {
      field: { bpm: 84, key: 60, scale: 'major', progs: [[0, 4, 5, 3], [3, 0, 1, 4], [5, 3, 0, 4]], inst: ['pad', 'piano', 'harp'], lead: 'flute', sparse: 0.35, drums: null },
      plateau: { bpm: 74, key: 62, scale: 'mixo', progs: [[0, 6, 3, 0], [3, 4, 0, 0], [5, 6, 0, 4]], inst: ['pad', 'piano'], lead: 'piano', sparse: 0.45, drums: null },
      shrine: { bpm: 66, key: 57, scale: 'dorian', progs: [[0, 3, 0, 6], [5, 3, 4, 0]], inst: ['pad', 'bell'], lead: 'bell', sparse: 0.5, drums: null },
      maths: { bpm: 92, key: 50, scale: 'phryg', progs: [[0, 1, 0, 6], [0, 5, 6, 1]], inst: ['pad', 'pluck'], lead: 'brass', sparse: 0.3, drums: 'taiko' },
      english: { bpm: 78, key: 63, scale: 'lydian', progs: [[0, 1, 0, 4], [5, 3, 1, 4], [0, 2, 3, 1]], inst: ['pad', 'harp', 'bell'], lead: 'flute', sparse: 0.35, drums: null },
      verbal: { bpm: 98, key: 64, scale: 'mixo', progs: [[0, 6, 3, 0], [0, 3, 4, 6], [5, 6, 0, 0]], inst: ['pad', 'harp'], lead: 'flute', sparse: 0.25, drums: 'light' },
      nonverbal: { bpm: 102, key: 55, scale: 'hijaz', progs: [[0, 1, 0, 6], [3, 1, 0, 0], [5, 6, 1, 0]], inst: ['pad', 'pluck'], lead: 'pluck', sparse: 0.25, drums: 'hand' },
      stable: { bpm: 108, key: 60, scale: 'major', progs: [[0, 3, 4, 0], [0, 5, 3, 4], [3, 4, 0, 5]], inst: ['strum', 'piano'], lead: 'flute', sparse: 0.2, drums: 'light' },
      home: { bpm: 70, key: 65, scale: 'major', progs: [[0, 5, 3, 4], [3, 0, 3, 4], [0, 2, 3, 4]], inst: ['piano', 'pad'], lead: 'piano', sparse: 0.3, drums: null },
      battle: { bpm: 140, key: 57, scale: 'minor', progs: [[0, 5, 2, 6], [0, 3, 4, 4], [5, 6, 0, 0]], inst: ['pad', 'ostinato', 'brass'], lead: 'lead', sparse: 0, drums: 'battle' },
      boss: { bpm: 154, key: 50, scale: 'harm', progs: [[0, 5, 3, 4], [0, 1, 0, 4], [5, 3, 6, 4]], inst: ['choir', 'ostinato', 'brass'], lead: 'lead', sparse: 0, drums: 'heavy', dist: true },
      castle: { bpm: 126, key: 52, scale: 'phryg', progs: [[0, 1, 0, 6], [5, 1, 3, 0], [0, 6, 5, 1]], inst: ['organ', 'choir', 'ostinato'], lead: 'brass', sparse: 0, drums: 'heavy', dist: true },
      hunt: { bpm: 146, key: 55, scale: 'dorian', progs: [[0, 6, 3, 4], [0, 3, 6, 0], [5, 6, 0, 4]], inst: ['pad', 'ostinato', 'brass'], lead: 'lead', sparse: 0, drums: 'taikoFast' },
    };
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const deg = (st, d, oct = 0) => { const s = SC[st.scale]; const n = ((d % 7) + 7) % 7; return st.key + s[n] + 12 * (Math.floor(d / 7) + oct); };

    /* ---------- composition ---------- */
    const RHYTHMS = [[0, 4, 6, 8, 12], [0, 2, 4, 8, 10, 12], [0, 6, 8, 14], [0, 3, 4, 8, 11, 12], [0, 4, 8, 10, 12, 14], [0, 8, 12], [0, 2, 3, 4, 8]];
    function motif(st) { // one bar of melody: positions + scale degrees, walking mostly by step
      const r = pick(RHYTHMS); let d = pick([2, 4, 7, 4]); const notes = [];
      r.forEach((p, i) => { notes.push([p, d, i === r.length - 1 ? 6 : Math.max(2, (r[i + 1] || 16) - p)]); d += pick([-2, -1, -1, 1, 1, 2, 0, 3]); d = Math.max(0, Math.min(11, d)); });
      return notes;
    }
    function section(st) { // 4 bars: motif, varied motif, contrasting bar, cadence
      const m = motif(st), c = motif(st);
      const vary = (x, shift) => x.map(([p, d, l]) => [p, d + shift, l]);
      const cad = [[0, pick([4, 2, 1]), 4], [4, pick([2, 1]), 4], [8, 0, 8]];
      return { prog: pick(st.progs), bars: [m, vary(m, pick([1, 2, -1])), c, cad], rest: [0, 1, 2, 3].map(() => Math.random() < st.sparse) };
    }
    function newPlan(st) { const A = section(st), B = section(st); return { st, form: Math.random() < 0.5 ? [A, A, B, A] : [A, B, A, B], idx: 0 }; }

    /* ---------- instruments ---------- */
    function voice(type, freq, t, dur, vol, o = {}) {
      const os = ctx.createOscillator(), g = ctx.createGain(); os.type = type; os.frequency.setValueAtTime(freq, t);
      if (o.detune) os.detune.value = o.detune;
      if (o.slideTo) os.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
      if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.2; lg.gain.value = freq * 0.006; l.connect(lg); lg.connect(os.frequency); l.start(t + 0.15); l.stop(t + dur + 0.1); }
      let node = os;
      if (o.lp || o.bp) { const f = ctx.createBiquadFilter(); f.type = o.bp ? 'bandpass' : 'lowpass'; f.frequency.value = o.bp || o.lp; f.Q.value = o.q || 0.8; os.connect(f); node = f; }
      const a = o.attack || 0.01;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a);
      if (o.sustain) { g.gain.setValueAtTime(vol, t + Math.max(a, dur - (o.release || 0.3))); }
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      node.connect(g); g.connect(master); if (o.wet) { const w = ctx.createGain(); w.gain.value = o.wet; g.connect(w); w.connect(verbIn); }
      os.start(t); os.stop(t + dur + 0.1);
    }
    function noiseHit(t, dur, vol, hp, lp) {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); src.connect(f);
      if (lp) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; f.connect(f2); f2.connect(g); } else f.connect(g);
      g.connect(master); src.start(t); src.stop(t + dur + 0.02);
    }
    const INST = {
      piano: (m, t, d, v = 0.07) => { voice('triangle', mtof(m), t, Math.min(2.2, d * 2.5), v, { wet: 0.35 }); voice('sine', mtof(m) * 2, t, 0.6, v * 0.25); },
      harp: (m, t, d, v = 0.05) => voice('triangle', mtof(m), t, 1.1, v, { lp: 3200, wet: 0.45 }),
      bell: (m, t, d, v = 0.035) => { voice('sine', mtof(m), t, 2.4, v, { wet: 0.6 }); voice('sine', mtof(m) * 2.76, t, 1.2, v * 0.3, { wet: 0.6 }); },
      flute: (m, t, d, v = 0.06) => voice('sine', mtof(m), t, d * 1.05, v, { attack: 0.06, vib: true, sustain: true, release: 0.12, wet: 0.4 }),
      pluck: (m, t, d, v = 0.06) => voice('sawtooth', mtof(m), t, 0.45, v, { lp: 1800, q: 2, wet: 0.25 }),
      strum: (ch, t) => ch.forEach((m, i) => voice('triangle', mtof(m), t + i * 0.025, 0.8, 0.04, { lp: 2600, wet: 0.2 })),
      brass: (m, t, d, v = 0.06) => { voice('sawtooth', mtof(m), t, d, v, { lp: 1500, attack: 0.04, sustain: true, release: 0.1, detune: -6 }); voice('sawtooth', mtof(m), t, d, v * 0.7, { lp: 1500, attack: 0.04, sustain: true, release: 0.1, detune: 6 }); },
      lead: (m, t, d, v = 0.06) => voice('square', mtof(m), t, d, v, { lp: 2800, attack: 0.01, sustain: true, release: 0.08, vib: true }),
      pad: (ch, t, d) => ch.forEach(m => [-8, 8].forEach(dt => voice('sawtooth', mtof(m - 12), t, d, 0.016, { lp: 1100, attack: 0.5, sustain: true, release: 0.6, detune: dt, wet: 0.5 }))),
      choir: (ch, t, d) => ch.forEach(m => [-6, 0, 6].forEach(dt => voice('triangle', mtof(m), t, d, 0.016, { bp: 900, q: 1.2, attack: 0.4, sustain: true, release: 0.5, detune: dt, wet: 0.6 }))),
      organ: (ch, t, d) => ch.forEach(m => [1, 2, 3].forEach((h, i) => voice('sine', mtof(m - 12) * h, t, d, 0.022 / (i + 1), { attack: 0.05, sustain: true, release: 0.2, wet: 0.5 }))),
    };
    const DRUM = {
      kick: (t, heavy) => voice('sine', heavy ? 115 : 140, t, heavy ? 0.3 : 0.22, heavy ? 0.85 : 0.7, { slideTo: 40 }),
      snare: t => { noiseHit(t, 0.16, 0.26, 1500); voice('triangle', 190, t, 0.08, 0.14); },
      hat: (t, open) => noiseHit(t, open ? 0.12 : 0.03, open ? 0.06 : 0.045, 7500),
      taiko: (t, v = 0.6) => { voice('sine', 90, t, 0.45, v, { slideTo: 48 }); noiseHit(t, 0.06, 0.12, 300, 1200); },
      hand: (t, hi) => voice('sine', hi ? 330 : 210, t, 0.18, 0.28, { slideTo: hi ? 260 : 150 }),
      shaker: t => noiseHit(t, 0.05, 0.035, 6000),
    };
    function drums(kind, s16, bar, t, sp) {
      if (!kind) return;
      const fill = bar === 3 && s16 >= 12;
      if (kind === 'light') { if (s16 % 4 === 0) DRUM.shaker(t); if (s16 === 0 || s16 === 10) DRUM.hand(t, false); if (s16 === 6) DRUM.hand(t, true); return; }
      if (kind === 'hand') { if ([0, 3, 6, 10].includes(s16)) DRUM.hand(t, s16 === 6 || s16 === 10); if (s16 % 2 === 0) DRUM.shaker(t); return; }
      if (kind === 'taiko') { if (s16 === 0 || s16 === 10) DRUM.taiko(t, 0.5); if (fill && s16 % 2 === 0) DRUM.taiko(t, 0.35); return; }
      if (kind === 'taikoFast') { if ([0, 3, 6, 8, 11, 14].includes(s16)) DRUM.taiko(t, s16 % 8 === 0 ? 0.7 : 0.45); if (s16 % 4 === 2 || intensity >= 1) DRUM.hat(t, false); if (fill) DRUM.snare(t + sp / 2); return; }
      const heavy = kind === 'heavy';
      if ((heavy ? [0, 4, 8, 11] : [0, 8, 10]).includes(s16)) DRUM.kick(t, heavy);
      if (s16 === 4 || s16 === 12) DRUM.snare(t);
      if (fill) DRUM.snare(t + sp / 2);
      if (s16 % 2 === 0 || intensity >= 2) DRUM.hat(t, s16 % 4 === 2 && intensity >= 1);
      if (s16 === 0 && bar === 0) noiseHit(t, 1.2, 0.08, 4000); // crash at each phrase
    }
    function triad(st, rootDeg, oct = 0) { return [deg(st, rootDeg, oct), deg(st, rootDeg + 2, oct), deg(st, rootDeg + 4, oct)]; }
    function scheduleStep(t) {
      const st = plan.st; const sp = 60 / st.bpm / 4;
      const s16 = step % 16, bar = Math.floor(step / 16) % 4, cyc = Math.floor(step / 64);
      if (s16 === 0 && bar === 0 && step > 0) { plan.idx++; if (plan.idx >= plan.form.length) plan = newPlan(st); } // next section
      const sec = plan.form[plan.idx % plan.form.length];
      const rootDeg = sec.prog[bar]; const ch = triad(st, rootDeg);
      const battleish = !!st.drums && st.sparse === 0;
      // harmony
      for (const ins of st.inst) {
        if ((ins === 'pad' || ins === 'choir' || ins === 'organ') && s16 === 0) INST[ins](ch, t, sp * 16);
        if (ins === 'piano' && !battleish && (s16 === 0 || s16 === 8)) { INST.piano(deg(st, rootDeg, -1), t, sp * 8, 0.05); if (s16 === 8) ch.forEach((m, i) => INST.piano(m, t + i * 0.04, sp * 6, 0.025)); }
        if (ins === 'harp' && s16 % 2 === 0) { const arp = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[0] + 12, ch[1] + 12]; INST.harp(arp[(s16 / 2) % 8], t, sp * 2); }
        if (ins === 'bell' && s16 === 12 && Math.random() < 0.5) INST.bell(ch[2] + 12, t, sp * 4);
        if (ins === 'pluck' && !battleish && [0, 3, 6, 10, 12].includes(s16)) INST.pluck(s16 === 0 ? ch[0] - 12 : pick(ch), t, sp);
        if (ins === 'strum' && [0, 6, 8, 12].includes(s16)) INST.strum(ch, t);
        if (ins === 'ostinato' && s16 % 2 === 0) { const r = deg(st, rootDeg, -1); voice('sawtooth', mtof(r + (s16 % 8 === 6 ? 12 : 0)), t, sp * 1.7, 0.11, { lp: st.dist ? 900 : 750, q: 3 }); if (intensity >= 1) voice('square', mtof(ch[(s16 / 2) % 3] + 12), t, sp * 0.9, 0.025, { lp: 3000 }); }
        if (ins === 'brass' && battleish && (s16 === 0 || (s16 === 10 && bar % 2 === 1))) INST.brass(ch[1], t, sp * (s16 === 0 ? 3 : 2), 0.045);
      }
      // bass for gentle themes
      if (!battleish && s16 === 0) voice('triangle', mtof(deg(st, rootDeg, -2)), t, sp * 14, 0.07, { sustain: true, release: 0.4, lp: 600 });
      drums(st.drums, s16, bar, t, sp);
      // melody (rests in sparse themes so phrases breathe)
      if (!sec.rest[bar]) {
        const n = sec.bars[bar].find(x => x[0] === s16);
        if (n) { const m = deg(st, n[1] + rootDeg * 0, battleish ? 1 : 1) ; const L = INST[st.lead]; L(m, t, sp * n[2], st.lead === 'lead' ? (intensity >= 2 ? 0.07 : 0.055) : undefined); if (battleish && intensity >= 2) INST.brass(m - 12, t, sp * n[2], 0.03); }
      }
    }
    function sequencer() {
      if (!ctx || !on || !plan) return;
      const sp = 60 / plan.st.bpm / 4;
      while (nextT < ctx.currentTime + 0.15) { scheduleStep(nextT); step++; nextT += sp; }
    }
    function stopAll() { clearInterval(timer); timer = null; }
    function start() {
      stopAll(); if (!ctx || !on || !mode) return;
      const st = STYLES[mode] || STYLES.field; plan = newPlan(st); step = 0; nextT = ctx.currentTime + 0.08; timer = setInterval(sequencer, 25);
    }
    function buildVerb() { // a simple feedback-delay "hall" so instruments sit in a space
      verbIn = ctx.createGain(); verbIn.gain.value = 0.5; const d1 = ctx.createDelay(1), d2 = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter();
      d1.delayTime.value = 0.13; d2.delayTime.value = 0.21; fb.gain.value = 0.42; lp.type = 'lowpass'; lp.frequency.value = 2400;
      verbIn.connect(d1); d1.connect(d2); d2.connect(lp); lp.connect(fb); fb.connect(d1); const out = ctx.createGain(); out.gain.value = 0.55; lp.connect(out); out.connect(master);
    }
    return {
      unlock() {
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          if (!master) { comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination); master = ctx.createGain(); master.gain.value = 0.6; master.connect(comp);
            noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; buildVerb(); }
          if (ctx.state === 'suspended') ctx.resume();
          if (mode && !timer) start();
        } catch (e) { /* no audio */ }
      },
      play(m) { if (m === mode) return; mode = m; intensity = 0; start(); },
      set(v) { on = v; if (on) start(); else stopAll(); },
      intensity(n) { intensity = n; },
      modes: Object.keys(STYLES),
    };
  })();

  window.addEventListener('resize', resize);
  resize(); requestAnimationFrame(loop);
  window.FX = { theme: name => { if (name !== theme) build(name); }, burst, smoke, flash, shake, floatText, flyTo, banner, itemGet, chest, projectile, slash, center, Music, reduce };
})();
