// VERBAL REASONING — GL-style question types.
(function () {
  const { int, pick, shuffle, sample, chance, mc, ALPHA } = U;
  const WB = window.WORDBANK;
  const byLv = (arr, lv, key = 0) => { const get = x => (Array.isArray(x) ? x[key] : x.l); const top = arr.filter(x => get(x) === lv); const all = arr.filter(x => get(x) <= lv); return chance(0.7) && top.length ? top : all; };
  const topics = [];

  /* Synonym & antonym banks. Each row is a meaning cluster, so distractors never come from the same row. */
  const SYN = [
    [1, 'big', 'large', 'big'], [1, 'small', 'tiny', 'small'], [1, 'happy', 'glad', 'happy'], [1, 'begin', 'start'], [1, 'shut', 'close'], [1, 'quick', 'fast', 'fast'],
    [1, 'shout', 'yell', 'loud'], [1, 'mend', 'repair'], [1, 'chilly', 'cold', 'cold'], [1, 'hop', 'jump'], [1, 'gift', 'present', 'give'], [1, 'stone', 'rock'],
    [1, 'sad', 'unhappy', 'sad'], [1, 'scared', 'afraid', 'fear'], [1, 'wealthy', 'rich'], [1, 'silent', 'quiet', 'calm'],
    [2, 'brave', 'courageous'], [2, 'ancient', 'old'], [2, 'tired', 'weary', 'weak'], [2, 'odd', 'strange', 'odd'], [2, 'risk', 'danger', 'fear'], [2, 'enormous', 'huge', 'big'],
    [2, 'cunning', 'sly'], [2, 'grab', 'seize'], [2, 'fury', 'rage', 'anger'], [2, 'reply', 'answer'], [2, 'wander', 'roam'], [2, 'gleam', 'shine'],
    [2, 'peculiar', 'unusual', 'odd'], [2, 'conceal', 'hide'], [2, 'tidy', 'neat'], [2, 'gloomy', 'dismal', 'sad'], [2, 'quarrel', 'argue', 'loud'], [2, 'swift', 'rapid', 'fast'],
    [3, 'abundant', 'plentiful'], [3, 'candid', 'frank', 'clear'], [3, 'diligent', 'hardworking'], [3, 'feeble', 'weak', 'weak'], [3, 'hostile', 'unfriendly', 'anger'], [3, 'jovial', 'cheerful', 'happy'],
    [3, 'lucid', 'clear', 'clear'], [3, 'novice', 'beginner'], [3, 'placid', 'calm', 'calm'], [3, 'ponder', 'consider'], [3, 'serene', 'tranquil', 'calm'], [3, 'tenacious', 'persistent', 'stub'],
    [3, 'vacant', 'empty', 'empty'], [3, 'meagre', 'scanty', 'small'], [3, 'obstinate', 'stubborn', 'stub'], [3, 'pinnacle', 'peak'], [3, 'pledge', 'promise', 'give'], [3, 'thrifty', 'economical'],
  ];
  const ANT = [
    [1, 'hot', 'cold'], [1, 'up', 'down', 'up'], [1, 'early', 'late'], [1, 'heavy', 'light'], [1, 'empty', 'full', 'full'], [1, 'win', 'lose', 'win'],
    [1, 'push', 'pull'], [1, 'remember', 'forget'], [1, 'always', 'never'], [1, 'friend', 'enemy', 'manner'], [1, 'loud', 'quiet', 'loud'], [1, 'buy', 'sell', 'money'],
    [2, 'ancient', 'modern'], [2, 'arrive', 'depart'], [2, 'brave', 'cowardly'], [2, 'generous', 'mean', 'money'], [2, 'shallow', 'deep'], [2, 'victory', 'defeat', 'win'],
    [2, 'accept', 'refuse', 'will'], [2, 'expand', 'shrink', 'full'], [2, 'rough', 'smooth'], [2, 'capture', 'release', 'hold'], [2, 'ascend', 'descend', 'up'], [2, 'polite', 'rude', 'manner'],
    [3, 'scarce', 'plentiful', 'full'], [3, 'humble', 'arrogant', 'manner'], [3, 'transparent', 'opaque'], [3, 'temporary', 'permanent'], [3, 'vague', 'precise'], [3, 'reluctant', 'eager', 'will'],
    [3, 'triumph', 'failure', 'win'], [3, 'lethargic', 'energetic', 'will'], [3, 'conceal', 'reveal', 'hold'], [3, 'novice', 'expert'], [3, 'frugal', 'extravagant', 'money'], [3, 'benevolent', 'malicious', 'manner'],
  ];
  function pairQuestion(bank, lv, kind) {
    const row = pick(byLv(bank, lv));
    const [, a, b] = chance(0.5) ? row : [row[0], row[2], row[1]];
    const others = bank.filter(r => r !== row && (!row[3] || r[3] !== row[3]));
    if (lv < 3) {
      // pick distractors that are themselves unrelated to a (they come from other rows)
      const ds = sample(others, 4).map(r => r[1 + int(0, 1)]);
      return mc(`Which word is ${kind === 'syn' ? '<b>closest in meaning</b> to' : '<b>most opposite</b> in meaning to'} <b>${a}</b>?`, b, ds, `<b>${a}</b> and <b>${b}</b> ${kind === 'syn' ? 'mean nearly the same' : 'are opposites'}.`, { n: 5 });
    }
    // GL format: one word from each group
    // four rows from four different meaning clusters, so only one pairing can match
    const picked = []; const used = new Set();
    for (const r of shuffle(others)) { const c = r[3] || r[1]; if (used.has(c)) continue; used.add(c); picked.push(r); if (picked.length === 4) break; }
    const r1 = picked.slice(0, 2), r2 = picked.slice(2, 4);
    const g1 = shuffle([a, r1[0][1], r1[1][1]]), g2 = shuffle([b, r2[0][2], r2[1][2]]);
    const opts = [];
    for (const x of g1) for (const y of g2) if (!(x === a && y === b)) opts.push(`${x} & ${y}`);
    return mc(`Find one word from each group that are ${kind === 'syn' ? '<b>closest in meaning</b>' : '<b>most opposite in meaning</b>'}.<div class="groups"><span>(${g1.join(', ')})</span><span>(${g2.join(', ')})</span></div>`, `${a} & ${b}`, shuffle(opts), `<b>${a}</b> and <b>${b}</b> ${kind === 'syn' ? 'mean nearly the same' : 'are opposites'}.`, { n: 5 });
  }

  topics.push({
    id: 'v-syn', name: 'Synonyms', shrine: 'Ha Dahamar Shrine', icon: '🤝',
    lesson: `<p><b>Synonyms</b> are words with the same or nearly the same meaning: big → large, quick → fast.</p>
      <p>In the 11+ you may get two groups of words and must choose one from each that mean the same. Try putting each pair into a sentence: "The <i>ancient</i> castle" / "The <i>old</i> castle" — same meaning? ✓</p>
      <p>Careful: some words have more than one meaning (e.g. "light" can mean not heavy OR not dark).</p>`,
    gen(lv) { return pairQuestion(SYN, lv, 'syn'); },
  });
  topics.push({
    id: 'v-ant', name: 'Antonyms', shrine: 'Wahgo Katta Shrine', icon: '🔄',
    lesson: `<p><b>Antonyms</b> are opposites: hot ↔ cold, arrive ↔ depart, ancient ↔ modern.</p>
      <p>Tip: Cover the options and think of your own opposite first, then look for it (or a word that means the same as it).</p>
      <p>Words with prefixes like un-, dis- and im- are often opposites too: happy ↔ unhappy.</p>`,
    gen(lv) { return pairQuestion(ANT, lv, 'ant'); },
  });

  /* Hidden words */
  topics.push({
    id: 'v-hidden', name: 'Hidden Words', shrine: 'Kaya Wan Shrine', icon: '🕵️',
    lesson: `<p>A <b>four-letter word</b> is hidden across the <b>end of one word and the start of the next</b>.</p>
      <p>Example: "We ate fis<b>h and</b> chips" hides <b>HAND</b> (fis<u>h</u> + <u>and</u>).</p>
      <p>Method: put your finger on the last letter of each word and read on into the next word, then try the last two letters, then the last three. The letters must stay in order and you can't skip any!</p>`,
    gen(lv) {
      const h = pick(byLv(WB.hidden, lv));
      return mc(`A four-letter word is hidden across two neighbouring words. Which is it?<br><i>"${h.s}"</i>`, h.a.toUpperCase(), h.d.map(x => x.toUpperCase()), `<b>${h.a.toUpperCase()}</b> is hidden in "<b>${h.pair}</b>".`, { n: 5 });
    },
  });

  /* Missing letter */
  topics.push({
    id: 'v-missing', name: 'Missing Letters', shrine: 'Shai Utoh Shrine', icon: '🔡',
    lesson: `<p>The <b>same letter</b> must finish the first word <i>and</i> start the second word — in <b>both</b> pairs.</p>
      <p>Example: pus [ ? ] ope &nbsp; inc [ ? ] alf → the letter is <b>H</b>: pus<b>h</b>, <b>h</b>ope, inc<b>h</b>, <b>h</b>alf.</p>
      <p>Go through the options one by one and test all four words. If even one isn't a real word, it's wrong!</p>`,
    gen(lv) {
      const m = pick(byLv(WB.missing, lv));
      return mc(`Which <b>one letter</b> completes both pairs of words? It ends the first word and starts the second.<div class="groups mono"><span>${m.p1} [ ? ] ${m.s1}</span><span>${m.p2} [ ? ] ${m.s2}</span></div>`, m.a.toUpperCase(), m.d.map(x => x.toUpperCase()), `<b>${m.a.toUpperCase()}</b> makes: ${m.w.map(x => x.toUpperCase()).join(', ')}.`, { n: 5 });
    },
  });

  /* Compound words */
  topics.push({
    id: 'v-compound', name: 'Compound Words', shrine: 'Mijah Rokee Shrine', icon: '🔗',
    lesson: `<p>Take <b>one word from each group</b> to make a new, real word. The word from the first group always comes first.</p>
      <p>Example: (sun, rain, mud) (shine, …) → <b>sunshine</b>.</p>
      <p><b>11+ trick:</b> the new word might not sound like its parts! car + pet = <b>carpet</b>, off + ice = <b>office</b>, sea + son = <b>season</b>.</p>`,
    gen(lv) {
      const c = pick(byLv(WB.compounds, lv));
      const opts = [];
      for (const x of c.g1) for (const y of c.g2) if (!(x === c.a && y === c.b)) opts.push(`${x}${y}`);
      return mc(`Choose one word from each group to make a <b>new word</b>.<div class="groups"><span>(${c.g1.join(', ')})</span><span>(${c.g2.join(', ')})</span></div>`, `${c.a}${c.b}`, shuffle(opts), `${c.a} + ${c.b} = <b>${c.a}${c.b}</b>.`, { n: 5 });
    },
  });

  /* Letter codes */
  const CODE_WORDS = ['LINK', 'SWORD', 'ZELDA', 'BOW', 'SHIELD', 'HORSE', 'MAP', 'FIRE', 'RUNE', 'KOROK', 'ORB', 'GLIDE', 'CLIMB', 'STONE', 'TOWER', 'FISH', 'APPLE', 'BOMB', 'HERO', 'MAGIC', 'QUEST', 'TORCH', 'GOAT', 'LAKE', 'BIRD'];
  const shiftL = (ch, k) => ALPHA[(ALPHA.indexOf(ch) + k + 26 * 3) % 26];
  topics.push({
    id: 'v-codes', name: 'Letter Codes', shrine: 'Kam Urog Shrine', icon: '🔐',
    lesson: `<p>Words are turned into secret codes by <b>moving letters along the alphabet</b>.</p>
      <p>If <b>CAT</b> is written as <b>DBU</b>, each letter has moved <b>+1</b> (C→D, A→B, T→U). So <b>DOG</b> would be <b>EPH</b>.</p>
      <p>Use the alphabet strip! Count how far each letter moves — sometimes every letter moves differently (+1, +2, +3…), and sometimes the code goes backwards. Mirror codes swap A↔Z, B↔Y, C↔X…</p>`,
    gen(lv) {
      const [w1, w2] = sample(CODE_WORDS, 2);
      let rule, desc;
      if (lv === 1) { const k = pick([1, 2, -1]); rule = (w) => w.split('').map(c => shiftL(c, k)).join(''); desc = `each letter moves ${k > 0 ? '+' : ''}${k}`; }
      else if (lv === 2) {
        const t = pick(['shift', 'step']);
        if (t === 'shift') { const k = pick([2, 3, -2, -3, 4]); rule = (w) => w.split('').map(c => shiftL(c, k)).join(''); desc = `each letter moves ${k > 0 ? '+' : ''}${k}`; }
        else { rule = (w) => w.split('').map((c, i) => shiftL(c, i + 1)).join(''); desc = 'the first letter moves +1, the second +2, the third +3, and so on'; }
      } else {
        const t = pick(['mirror', 'alt', 'step', 'reverse']);
        if (t === 'mirror') { rule = (w) => w.split('').map(c => ALPHA[25 - ALPHA.indexOf(c)]).join(''); desc = 'it is a mirror code: A↔Z, B↔Y, C↔X …'; }
        else if (t === 'alt') { rule = (w) => w.split('').map((c, i) => shiftL(c, i % 2 ? -1 : 1)).join(''); desc = 'the letters move +1, −1, +1, −1 …'; }
        else if (t === 'step') { rule = (w) => w.split('').map((c, i) => shiftL(c, -(i + 1))).join(''); desc = 'the first letter moves −1, the second −2, the third −3 …'; }
        else { const k = pick([1, 2]); rule = (w) => w.split('').reverse().map(c => shiftL(c, k)).join(''); desc = `the word is reversed and each letter moves +${k}`; }
      }
      const c1 = rule(w1), c2 = rule(w2);
      const decode = chance(lv === 3 ? 0.4 : 0.2);
      const wrongs = [rule(w2.split('').reverse().join('')), w2.split('').map(c => shiftL(c, 1)).join(''), w2.split('').map(c => shiftL(c, -1)).join(''), c2.slice(0, -1) + shiftL(c2.slice(-1), 1), shiftL(c2[0], 1) + c2.slice(1)];
      if (decode) return mc(`If <b>${w1}</b> is written in code as <b>${c1}</b>, what does the code <b>${c2}</b> mean?`, w2, sample(CODE_WORDS.filter(x => x !== w2 && x.length === w2.length), 3).concat([w2.split('').reverse().join(''), w2.slice(1) + w2[0], w2.slice(0, -1) + shiftL(w2.slice(-1), 1), shiftL(w2[0], 1) + w2.slice(1)]), `The rule: ${desc}. Undo it on ${c2} to get <b>${w2}</b>.`, { alphabet: true });
      return mc(`If <b>${w1}</b> is written in code as <b>${c1}</b>, how is <b>${w2}</b> written?`, c2, wrongs, `The rule: ${desc}. So ${w2} → <b>${c2}</b>.`, { alphabet: true });
    },
  });

  /* Letter sequences */
  topics.push({
    id: 'v-letseq', name: 'Letter Sequences', shrine: 'Tena Ko\'sah Shrine', icon: '🔠',
    lesson: `<p>Find the pattern in the letters. Use the alphabet strip and count the jumps.</p>
      <p>Single letters: A, C, E, G, ? → jumps of +2 → <b>I</b>.</p>
      <p>Pairs: <b>AZ, BY, CX, ?</b> — look at the first letters (A, B, C → D) and the second letters separately (Z, Y, X → W): <b>DW</b>.</p>
      <p>If you go past Z, wrap round to A again.</p>`,
    gen(lv) {
      const L = i => ALPHA[((i % 26) + 26) % 26];
      if (lv === 1) {
        const s = int(0, 10), k = pick([1, 2, 3, -1, -2]); const st = k < 0 ? s + 15 : s;
        const seq = [0, 1, 2, 3].map(i => L(st + i * k)); const ans = L(st + 4 * k);
        return mc(`What comes next? <b>${seq.join(', ')}, ?</b>`, ans, [L(st + 4 * k + 1), L(st + 4 * k - 1), L(st + 5 * k), L(st + 3 * k)], `The letters move ${k > 0 ? '+' : ''}${k} each time, so the next is <b>${ans}</b>.`, { alphabet: true, n: 5 });
      }
      const a0 = int(0, 25), b0 = int(0, 25);
      const ka = lv === 2 ? pick([1, 2, -1]) : pick([2, 3, -2, 4]);
      const kb = lv === 2 ? pick([1, -1, 2]) : pick([-1, -3, 'grow']);
      const second = i => (kb === 'grow' ? L(b0 + (i * (i + 1)) / 2) : L(b0 + i * kb));
      const term = i => L(a0 + i * ka) + second(i);
      const seq = [0, 1, 2, 3].map(term); const ans = term(4);
      return mc(`What comes next? <b>${seq.join(', ')}, ?</b>`, ans, [L(a0 + 4 * ka + 1) + second(4), L(a0 + 4 * ka) + L(ALPHA.indexOf(second(4)) + 1), term(5), L(a0 + 4 * ka - 1) + second(4), second(4) + L(a0 + 4 * ka)], `First letters move ${ka > 0 ? '+' : ''}${ka}; second letters ${kb === 'grow' ? 'move +1, +2, +3, +4' : 'move ' + (kb > 0 ? '+' : '') + kb}. So the next pair is <b>${ans}</b>.`, { alphabet: true, n: 5 });
    },
  });

  /* Number puzzles: sequences, brackets, letter sums */
  topics.push({
    id: 'v-numbers', name: 'Number Puzzles', shrine: 'Ishto Soh Shrine', icon: '🔢',
    lesson: `<p><b>Number sequences:</b> look at the gaps. They might be the same (+4), growing (+1, +2, +3), multiplying (×2) or two sequences taking turns!</p>
      <p><b>Number brackets:</b> (3 [12] 4) (5 [20] 4) (6 [?] 2) → the middle is the outside two multiplied: 6 × 2 = <b>12</b>. Find the rule from the first two brackets, then use it on the third.</p>
      <p><b>Letter sums:</b> if A = 2, B = 5, C = 10, then A × B = 10 = <b>C</b>.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['seq', 'seq', 'bracket'] : ['seq', 'bracket', 'lettersum', 'seq']);
      if (t === 'seq') {
        const kind = pick(lv === 1 ? ['add', 'sub'] : lv === 2 ? ['add', 'grow', 'mult', 'alt'] : ['grow', 'mult', 'alt', 'square', 'fib']);
        let seq = [];
        if (kind === 'add') { const s = int(1, 20), k = int(2, 9); seq = [0, 1, 2, 3, 4, 5].map(i => s + i * k); }
        if (kind === 'sub') { const s = int(50, 99), k = int(2, 9); seq = [0, 1, 2, 3, 4, 5].map(i => s - i * k); }
        if (kind === 'grow') { let x = int(1, 10); const s = int(1, 3); seq = [x]; for (let i = 0; i < 5; i++) { x += s + i; seq.push(x); } }
        if (kind === 'mult') { let x = int(1, 5); const m = pick([2, 3]); seq = [x]; for (let i = 0; i < 5; i++) { x *= m; seq.push(x); } }
        if (kind === 'alt') { const a = int(1, 10), b = int(20, 40), ka = int(2, 5), kb = -int(1, 3); seq = [0, 1, 2, 3, 4, 5].map(i => (i % 2 ? b + Math.floor(i / 2) * kb : a + (i / 2) * ka)); }
        if (kind === 'square') { const s = int(1, 5); seq = [0, 1, 2, 3, 4, 5].map(i => (s + i) ** 2); }
        if (kind === 'fib') { const a = int(1, 4), b = int(1, 5); seq = [a, b]; while (seq.length < 6) seq.push(seq[seq.length - 1] + seq[seq.length - 2]); }
        const ans = seq.pop(); const prev = seq[seq.length - 1];
        const why = { add: 'add the same number each time', sub: 'take away the same number each time', grow: 'the gap grows by 1 each time', mult: 'multiply each time', alt: 'there are two sequences taking turns', square: 'they are square numbers', fib: 'each number is the sum of the two before it' }[kind];
        return mc(`What comes next? <b>${seq.join(', ')}, ?</b>`, ans, [ans + 1, ans - 1, prev + (prev - seq[seq.length - 2]), ans + 2, ans * 2].filter(x => x !== ans), `Rule: ${why}. Next: <b>${ans}</b>.`, { n: 5 });
      }
      if (t === 'bracket') {
        const rules = lv === 1 ? [['a + b', (a, b) => a + b], ['a × b', (a, b) => a * b]] : [['a × b', (a, b) => a * b], ['a + b', (a, b) => a + b], ['(a + b) × 2', (a, b) => (a + b) * 2], ['a × b − 1', (a, b) => a * b - 1], ['a × a + b', (a, b) => a * a + b], ['a − b', (a, b) => a - b]];
        const [desc, f] = pick(rules);
        const tri = [0, 1, 2].map(() => { let a = int(2, 9), b = int(1, 9); if (desc === 'a − b' && b >= a) [a, b] = [b + 1, a]; return [a, b]; });
        const ans = f(...tri[2]);
        const show = tri.map((p, i) => `(${p[0]} [${i === 2 ? '?' : f(...p)}] ${p[1]})`).join('&nbsp;&nbsp;');
        return mc(`Find the missing number. The numbers in each set are worked out the same way.<div class="groups mono"><span>${show}</span></div>`, ans, [tri[2][0] + tri[2][1], tri[2][0] * tri[2][1], ans + 1, ans - 1, ans + 2].filter(x => x !== ans), `The rule is: middle = ${desc.replace(/a/g, 'left').replace(/b/g, 'right')}. ${desc.replace(/a/g, tri[2][0]).replace(/b/g, tri[2][1])} = <b>${ans}</b>.`, { n: 5 });
      }
      const vals = {}; const letters = ['A', 'B', 'C', 'D', 'E'];
      const base = sample([1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24], 5).sort((a, b) => a - b);
      letters.forEach((l, i) => (vals[l] = base[i]));
      const combos = [];
      for (const x of letters) for (const y of letters) {
        if (x === y) continue;
        for (const [sym, f] of [['+', (a, b) => a + b], ['×', (a, b) => a * b], ['−', (a, b) => a - b]]) {
          const r = f(vals[x], vals[y]); const hit = letters.find(l => vals[l] === r);
          if (hit) combos.push([`${x} ${sym} ${y}`, hit]);
        }
      }
      if (!combos.length) return this.gen(lv);
      const [expr, ans] = pick(combos);
      return mc(`If <b>${letters.map(l => `${l} = ${vals[l]}`).join(', ')}</b>, what is <b>${expr}</b>? Give your answer as a letter.`, ans, letters.filter(l => l !== ans), `${expr.replace(/[A-E]/g, l => vals[l])} = ${vals[ans]}, which is <b>${ans}</b>.`, { n: 5 });
    },
  });

  /* Word analogies */
  const ANALOGY = [
    [1, ['tall', 'short'], ['wet', 'dry'], ['rain', 'damp', 'water']], [1, ['cat', 'kitten'], ['dog', 'puppy'], ['bone', 'bark', 'cub']],
    [1, ['glove', 'hand'], ['sock', 'foot'], ['shoe', 'leg', 'wool']], [1, ['sun', 'day'], ['moon', 'night'], ['star', 'sky', 'cheese']],
    [1, ['bee', 'buzz'], ['dog', 'bark'], ['bone', 'tail', 'cat']], [1, ['cow', 'milk'], ['hen', 'eggs'], ['farm', 'chick', 'corn']],
    [1, ['pen', 'write'], ['scissors', 'cut'], ['paper', 'sharp', 'glue']], [1, ['nose', 'smell'], ['tongue', 'taste'], ['mouth', 'lick', 'teeth']],
    [2, ['library', 'books'], ['wardrobe', 'clothes'], ['bedroom', 'wood', 'mirror']], [2, ['teacher', 'school'], ['doctor', 'hospital'], ['nurse', 'medicine', 'patient']],
    [2, ['caterpillar', 'butterfly'], ['tadpole', 'frog'], ['pond', 'fish', 'lily']], [2, ['hand', 'finger'], ['foot', 'toe'], ['shoe', 'leg', 'sock']],
    [2, ['pilot', 'aeroplane'], ['captain', 'ship'], ['sea', 'sailor', 'anchor']], [2, ['few', 'many'], ['narrow', 'wide'], ['thin', 'road', 'long']],
    [2, ['hour', 'minute'], ['minute', 'second'], ['clock', 'time', 'day']], [2, ['north', 'south'], ['east', 'west'], ['left', 'compass', 'sunrise']],
    [3, ['pen', 'author'], ['brush', 'artist'], ['canvas', 'paint', 'gallery']], [3, ['wolf', 'howl'], ['owl', 'hoot'], ['night', 'feather', 'tree']],
    [3, ['cub', 'bear'], ['foal', 'horse'], ['pony', 'stable', 'hay']], [3, ['mason', 'stone'], ['carpenter', 'wood'], ['hammer', 'saw', 'nail']],
    [3, ['geese', 'gaggle'], ['fish', 'shoal'], ['pond', 'swim', 'fin']], [3, ['thermometer', 'temperature'], ['scales', 'weight'], ['kitchen', 'heavy', 'balance']],
    [3, ['ruler', 'length'], ['clock', 'time'], ['watch', 'hand', 'tick']], [3, ['interior', 'exterior'], ['maximum', 'minimum'], ['most', 'largest', 'middle']],
    [1, ['hot', 'cold'], ['up', 'down'], ['top', 'high', 'sky']], [1, ['puppy', 'dog'], ['kitten', 'cat'], ['mouse', 'pet', 'milk']],
    [1, ['bird', 'nest'], ['bee', 'hive'], ['honey', 'flower', 'sting']], [1, ['foot', 'shoe'], ['hand', 'glove'], ['finger', 'arm', 'ring']],
    [1, ['day', 'night'], ['black', 'white'], ['dark', 'grey', 'colour']], [1, ['fish', 'swim'], ['bird', 'fly'], ['feather', 'tree', 'sing']],
    [1, ['cow', 'calf'], ['sheep', 'lamb'], ['wool', 'farm', 'goat']], [1, ['eye', 'see'], ['ear', 'hear'], ['sound', 'head', 'loud']],
    [2, ['author', 'book'], ['composer', 'music'], ['piano', 'orchestra', 'conductor']], [2, ['bark', 'dog'], ['neigh', 'horse'], ['saddle', 'stable', 'gallop']],
    [2, ['tall', 'taller'], ['good', 'better'], ['best', 'great', 'well']], [2, ['knife', 'cut'], ['pen', 'write'], ['ink', 'paper', 'nib']],
    [2, ['wheel', 'car'], ['wing', 'aeroplane'], ['feather', 'bird', 'pilot']], [2, ['sculptor', 'statue'], ['baker', 'bread'], ['oven', 'flour', 'apron']],
    [2, ['seed', 'tree'], ['egg', 'chicken'], ['shell', 'nest', 'yolk']], [2, ['petal', 'flower'], ['page', 'book'], ['word', 'read', 'paper']],
    [3, ['wolf', 'pack'], ['fish', 'school'], ['water', 'pond', 'fin']], [3, ['herd', 'cattle'], ['pride', 'lions'], ['tigers', 'roar', 'jungle']],
    [3, ['frugal', 'spend'], ['taciturn', 'talk'], ['quiet', 'shout', 'listen']], [3, ['bibliophile', 'books'], ['astronomer', 'stars'], ['telescope', 'planets', 'moon']],
    [3, ['ewe', 'ram'], ['mare', 'stallion'], ['foal', 'pony', 'horse']], [3, ['cautious', 'reckless'], ['frugal', 'wasteful'], ['careful', 'mean', 'thrifty']],
    [3, ['water', 'thirst'], ['food', 'hunger'], ['eat', 'meal', 'starve']], [3, ['chapter', 'novel'], ['scene', 'play'], ['actor', 'stage', 'theatre']],
  ];
  topics.push({
    id: 'v-analogy', name: 'Word Analogies', shrine: 'Tah Muhl Shrine', icon: '⚖️',
    lesson: `<p>An <b>analogy</b> says: "A is to B as C is to D". The <b>link</b> between A and B must be the <b>same</b> as between C and D.</p>
      <p>Make a sentence for the first pair: "A <b>puppy</b> is a baby <b>dog</b>." Then use the same sentence for the second: "A <b>kitten</b> is a baby … <b>cat</b>!"</p>
      <p>Links to look for: opposites, young/adult, home, sound, job/tool, part/whole, group names.</p>`,
    gen(lv) {
      const a = pick(byLv(ANALOGY, lv));
      const [, p1, p2, wrong] = a;
      return mc(`<b>${p1[0]}</b> is to <b>${p1[1]}</b> as <b>${p2[0]}</b> is to …?`, p2[1], wrong, `Same link: ${p1[0]} → ${p1[1]}, so ${p2[0]} → <b>${p2[1]}</b>.`);
    },
  });

  /* Logic */
  const NAMES = ['Link', 'Zelda', 'Mipha', 'Daruk', 'Revali', 'Urbosa', 'Sidon', 'Riju', 'Teba', 'Yunobo', 'Paya', 'Impa'];
  topics.push({
    id: 'v-logic', name: 'Logic Puzzles', shrine: 'Sha Warvo Shrine', icon: '🧠',
    lesson: `<p>Logic puzzles give you clues to put things in <b>order</b> or work out <b>who is who</b>.</p>
      <p>Draw a quick line and place people on it as you read each clue: "Link is taller than Zelda" → Zelda ... Link. Add each new clue until the order is clear.</p>
      <p>Only use what the clues <b>definitely</b> tell you — don't guess!</p>`,
    gen(lv) {
      const k = lv === 1 ? 3 : lv === 2 ? 4 : 5;
      const people = sample(NAMES, k); // people[0] is the most
      const attr = pick([['taller', 'tallest', 'shortest'], ['older', 'oldest', 'youngest'], ['faster', 'fastest', 'slowest'], ['more rupees', 'most rupees', 'fewest rupees']]);
      const pretty = (a, b) => attr[0] === 'more rupees' ? `${a} has more rupees than ${b}.` : `${a} is ${attr[0]} than ${b}.`;
      const prettyRev = (a, b) => attr[0] === 'more rupees' ? `${b} has fewer rupees than ${a}.` : `${b} is ${{ taller: 'shorter', older: 'younger', faster: 'slower' }[attr[0]]} than ${a}.`;
      const cl = shuffle(people.slice(0, -1).map((p, i) => (chance(0.5) ? pretty(p, people[i + 1]) : prettyRev(p, people[i + 1]))));
      const q = lv === 3 && chance(0.4) ? 'middle' : chance(0.5) ? 'top' : 'bottom';
      let ans, label;
      if (q === 'top') { ans = people[0]; label = attr[0] === 'more rupees' ? `has the <b>${attr[1]}</b>` : `is the <b>${attr[1]}</b>`; }
      else if (q === 'bottom') { ans = people[k - 1]; label = attr[0] === 'more rupees' ? `has the <b>${attr[2]}</b>` : `is the <b>${attr[2]}</b>`; }
      else { ans = people[Math.floor(k / 2)]; label = `is <b>in the middle</b>`; }
      return mc(`${cl.join(' ')}<br><br>Who ${label}?`, ans, people.filter(p => p !== ans), `Put them in order: ${people.join(' → ')} (from ${attr[1].replace('most rupees', 'most')} to ${attr[2].replace('fewest rupees', 'fewest')}). So the answer is <b>${ans}</b>.`, { n: Math.min(5, k) });
    },
  });

  window.CONTENT = window.CONTENT || {};
  window.CONTENT.verbal = topics;
})();
