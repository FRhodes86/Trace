// Shared helpers: randomness, multiple-choice builder, maths utils, SVG helpers, sound.
(function () {
  const U = {};

  U.int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.chance = p => Math.random() < p;
  U.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  U.sample = (arr, n) => U.shuffle(arr).slice(0, n);
  U.gcd = (a, b) => (b ? U.gcd(b, a % b) : Math.abs(a));
  U.lcm = (a, b) => (a * b) / U.gcd(a, b);
  U.fmt = n => (typeof n === 'number' ? n.toLocaleString('en-GB', { maximumFractionDigits: 3 }) : n);
  U.money = p => (p >= 100 ? '£' + (p / 100).toFixed(2) : p + 'p');
  U.round = (n, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;
  U.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  U.cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  U.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /**
   * Build a multiple-choice question.
   * correct: the right answer (string/number); distractors: wrong answers (duplicates/clashes removed).
   * opts: {n: number of options, explain, visual, passage, alphabet, keepOrder}
   */
  U.mc = (prompt, correct, distractors, explain, opts = {}) => {
    const n = opts.n || 4;
    const key = x => String(x).replace(/\s+/g, ' ').trim();
    const seen = new Set([key(correct)]);
    const wrong = [];
    const nonNeg = typeof correct === 'number' && correct >= 0;
    for (const d of distractors) {
      if (nonNeg && typeof d === 'number' && d < 0) continue;
      if (d === undefined || d === null || d === '' || (typeof d === 'number' && !isFinite(d))) continue;
      if (seen.has(key(d))) continue;
      seen.add(key(d)); wrong.push(d);
    }
    // distractors are listed most-tempting first; keep the first n-1
    let options = U.shuffle([correct, ...wrong.slice(0, n - 1)]);
    // numbers read best in ascending order, like a real answer sheet
    if (options.every(o => typeof o === 'number')) options.sort((a, b) => a - b);
    return {
      prompt,
      options: options.map(o => (typeof o === 'number' ? U.fmt(o) : String(o))),
      answer: options.indexOf(correct),
      explain: explain || '',
      visual: opts.visual || '',
      passage: opts.passage || '',
      alphabet: !!opts.alphabet,
      html: !!opts.html,
    };
  };

  /** Numeric distractors: near-misses typical of real mistakes. */
  U.near = (ans, spread = [1, 2, 10]) => {
    const out = [];
    for (const s of spread) { out.push(ans + s, ans - s); }
    return U.shuffle(out.filter(x => x >= 0 && x !== ans));
  };

  /* ---------------- SVG helpers ---------------- */
  U.svg = (w, h, inner, cls = '') => `<svg class="qsvg ${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  /* ---------------- Sound (tiny WebAudio synth, no files) ---------------- */
  let ctx = null;
  U.soundOn = true;
  function tone(freq, start, dur, type = 'sine', vol = 0.15) {
    if (!U.soundOn) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      const t = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* audio unavailable */ }
  }
  const N = { C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, B5: 988, C6: 1047, D6: 1175, E6: 1319, G4: 392, A4: 440, E4: 330, C4: 262, Bb4: 466, Fs5: 740 };
  U.sfx = {
    correct() { [N.E5, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.07, 0.25, 'triangle')); },
    wrong() { tone(196, 0, 0.25, 'sawtooth', 0.08); tone(147, 0.12, 0.35, 'sawtooth', 0.08); },
    click() { tone(880, 0, 0.05, 'square', 0.04); },
    coin() { tone(N.B5, 0, 0.08, 'square', 0.06); tone(N.E6, 0.07, 0.2, 'square', 0.06); },
    // "puzzle solved" style rising arpeggio (original melody)
    solved() { [N.G4, N.D5, N.G5, N.Bb4 * 2, N.D6].forEach((f, i) => tone(f, i * 0.11, 0.35, 'triangle', 0.12)); tone(N.G5 * 2, 0.6, 0.8, 'sine', 0.1); },
    korok() { [N.C6, N.E6, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.06, 0.12, 'square', 0.05)); },
    hit() { tone(110, 0, 0.15, 'square', 0.1); tone(220, 0.02, 0.1, 'sawtooth', 0.06); },
    hurt() { tone(300, 0, 0.1, 'square', 0.08); tone(200, 0.1, 0.2, 'square', 0.08); },
    fanfare() { const m = [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6, N.E6]; m.forEach((f, i) => tone(f, i * 0.13, i === m.length - 1 ? 1 : 0.2, 'triangle', 0.12)); },
    orb() { [N.E5, N.A5, N.C6, N.E6, N.A5 * 2].forEach((f, i) => tone(f, i * 0.09, 0.5, 'sine', 0.1)); },
    boss() { [N.E4, N.E4, 311, N.E4].forEach((f, i) => tone(f / 2, i * 0.18, 0.2, 'sawtooth', 0.07)); },
    tick() { tone(1400, 0, 0.03, 'square', 0.03); },
  };

  window.U = U;
})();
