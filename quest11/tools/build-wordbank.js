// Builds js/content/wordbank.js — dictionary-checked Verbal Reasoning puzzles.
// Usage:  npm i wordlist-english   (anywhere on NODE_PATH)
//         node tools/build-wordbank.js
// The game itself never needs the dictionary; this script bakes validated puzzles in.
const fs = require('fs');
const path = require('path');
const w = require('wordlist-english');

const clean = a => a.filter(x => /^[a-z]+$/.test(x));
const BIG = new Set(clean([...w['english'], ...w['english/british']]));
const C10 = new Set(clean([...w['english/10'], ...w['english/british/10']]));
const C20 = new Set(clean([...w['english/20'], ...w['english/british/20'], ...C10]));
const C35 = new Set(clean([...w['english/35'], ...w['english/british/35'], ...C20]));

// Deterministic RNG so rebuilds are stable
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Words a child might reasonably know but that are too obscure / unsuitable for answers
const BAN = new Set(['sex', 'gay', 'hell', 'damn', 'kill', 'die', 'dead', 'drug', 'gun', 'beer', 'wine', 'drunk', 'nazi', 'rape', 'ass', 'arse', 'bum', 'piss', 'crap', 'hoe', 'tit', 'pot', 'fag', 'god', 'sin', 'war', 'bra', 'nude', 'vat', 'tax', 'ion', 'ism', 'ere', 'tho', 'nee', 'ole', 'pus', 'tit', 'cox', 'dago']);
const okWord = x => !BAN.has(x) && x.length >= 3 && x.length <= 5;

/* ---------- Missing letter: ends first word, starts second (two pairs) ---------- */
function buildMissing(pool, count, level) {
  const words = [...pool].filter(okWord);
  const out = []; const seen = new Set();
  const letters = 'abcdefghiklmnoprstwy'.split('');
  let guard = 0;
  while (out.length < count && guard++ < 200000) {
    const L = pick(letters);
    const ends = words.filter(x => x.endsWith(L));
    const starts = words.filter(x => x.startsWith(L));
    if (ends.length < 2 || starts.length < 2) continue;
    const w1 = pick(ends), w2 = pick(starts), w3 = pick(ends), w4 = pick(starts);
    if (new Set([w1, w2, w3, w4]).size < 4) continue;
    const p1 = w1.slice(0, -1), s1 = w2.slice(1), p2 = w3.slice(0, -1), s2 = w4.slice(1);
    if (p1.length < 2 || p2.length < 2 || s1.length < 2 || s2.length < 2) continue;
    // unique: no other letter makes all four real words
    const fits = X => BIG.has(p1 + X) && BIG.has(X + s1) && BIG.has(p2 + X) && BIG.has(X + s2);
    const others = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(X => X !== L && fits(X));
    if (others.length) continue;
    const key = [p1, s1, p2, s2].join('|');
    if (seen.has(key)) continue; seen.add(key);
    // distractors: letters that fit at least one bracket (tempting) but not all
    const tempting = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(X => X !== L && (BIG.has(p1 + X) || BIG.has(X + s2)));
    const pad = shuffle('aeioustrnl'.split('').filter(X => X !== L && !tempting.includes(X)));
    const distract = shuffle(tempting).concat(pad).slice(0, 4);
    out.push({ l: level, p1, s1, p2, s2, a: L, d: distract, w: [w1, w2, w3, w4] });
  }
  return out;
}

/* ---------- Compound words (GL "one word from each group") ---------- */
const COMPOUNDS = [
  // level 1 — easy, familiar
  [1, 'sun', 'flower'], [1, 'snow', 'man'], [1, 'rain', 'bow'], [1, 'foot', 'ball'], [1, 'bed', 'room'],
  [1, 'butter', 'fly'], [1, 'pan', 'cake'], [1, 'star', 'fish'], [1, 'tooth', 'brush'], [1, 'key', 'hole'],
  [1, 'fire', 'place'], [1, 'sand', 'castle'], [1, 'moon', 'light'], [1, 'rain', 'coat'], [1, 'horse', 'shoe'],
  [1, 'sea', 'weed'], [1, 'water', 'fall'], [1, 'gold', 'fish'], [1, 'tea', 'pot'], [1, 'wind', 'mill'],
  [1, 'note', 'book'], [1, 'play', 'ground'], [1, 'pop', 'corn'], [1, 'door', 'bell'], [1, 'cow', 'boy'],
  // level 2 — longer / less obvious
  [2, 'earth', 'quake'], [2, 'grass', 'hopper'], [2, 'ship', 'wreck'], [2, 'light', 'house'], [2, 'black', 'bird'],
  [2, 'farm', 'yard'], [2, 'scare', 'crow'], [2, 'milk', 'shake'], [2, 'heart', 'beat'], [2, 'eye', 'brow'],
  [2, 'sea', 'horse'], [2, 'snow', 'flake'], [2, 'thunder', 'storm'], [2, 'dragon', 'fly'], [2, 'jelly', 'fish'],
  [2, 'hedge', 'hog'], [2, 'pine', 'apple'], [2, 'foot', 'print'], [2, 'camp', 'fire'], [2, 'day', 'dream'],
  [2, 'cob', 'web'], [2, 'ginger', 'bread'], [2, 'knee', 'cap'], [2, 'space', 'ship'], [2, 'honey', 'comb'],
  [2, 'night', 'mare'], [2, 'lady', 'bird'], [2, 'cup', 'board'], [2, 'toad', 'stool'], [2, 'time', 'table'],
  // level 3 — the sneaky 11+ kind where the new word sounds different
  [3, 'car', 'pet'], [3, 'tar', 'get'], [3, 'off', 'ice'], [3, 'sea', 'son'], [3, 'man', 'age'],
  [3, 'pass', 'age'], [3, 'mess', 'age'], [3, 'car', 'ton'], [3, 'bar', 'gain'], [3, 'for', 'give'],
  [3, 'harm', 'less'], [3, 'band', 'age'], [3, 'ban', 'king'], [3, 'bar', 'row'], [3, 'pen', 'insula'],
  [3, 'kid', 'nap'], [3, 'wit', 'ness'], [3, 'cat', 'tle'], [3, 'fat', 'her'], [3, 'not', 'ice'],
  [3, 'pot', 'ash'], [3, 'war', 'den'], [3, 'him', 'self'], [3, 'pal', 'ace'], [3, 'for', 'ward'],
];

function buildCompounds() {
  const firsts = [...new Set(COMPOUNDS.map(c => c[1]))];
  const seconds = [...new Set(COMPOUNDS.map(c => c[2]))];
  const out = [];
  for (const [lvl, a, b] of COMPOUNDS) {
    if (!BIG.has(a + b)) throw new Error('not a word: ' + a + b);
    let made = 0, guard = 0;
    while (made < 3 && guard++ < 5000) {
      const g1 = [a, ...shuffle(firsts.filter(x => x !== a)).slice(0, 2)];
      const g2 = [b, ...shuffle(seconds.filter(x => x !== b)).slice(0, 2)];
      let clash = false;
      for (const x of g1) for (const y of g2) if (!(x === a && y === b) && BIG.has(x + y)) clash = true;
      if (clash) continue;
      out.push({ l: lvl, g1: shuffle(g1), g2: shuffle(g2), a, b });
      made++;
    }
  }
  return out;
}

/* ---------- Hidden words: validate hand-written sentences ---------- */
const HIDDEN = [
  [1, 'We ate fish and chips by the sea.', 'hand'],
  [1, 'The cat entered the kitchen quietly.', 'tent'],
  [1, 'We explored the big old castle.', 'gold'],
  [1, 'We must go at once!', 'goat'],
  [1, 'Most arrows missed the target.', 'star'],
  [1, 'Gus and Max went fishing.', 'sand'],
  [2, 'The kite amazed everyone.', 'team'],
  [2, 'Grandpa thanked the guard.', 'path'],
  [2, 'Mr Smith opened the gate.', 'hope'],
  [2, 'The spider spun a web early today.', 'bear'],
  [2, 'Peter opened the shrine door.', 'rope'],
  [2, 'Mix our ingredients well.', 'ring'],
  [2, 'Smoke drifted from the vent.', 'even'],
  [2, 'Those all belong to the princess.', 'seal'],
  [3, 'They stopped near noon.', 'earn'],
  [3, 'The house at the top was empty.', 'seat'],
  [3, 'We crept past the old eerie tower.', 'deer'],
  [3, 'Look at the robot in the shrine!', 'hero'],
  [3, 'The small amber gem glowed.', 'lamb'],
  [3, 'Link can estimate the distance.', 'nest'],
  [1, 'Grandma skipped down the lane.', 'mask'],
  [2, 'Pat earned ten rupees.', 'tear'],
  [3, 'The owl endured the storm.', 'lend'],
  [3, 'Our estate was large.', 'rest'],
];

function spans(sentence, len) {
  const ws = sentence.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
  const found = new Map();
  for (let i = 0; i < ws.length - 1; i++) {
    const joined = ws[i] + ws[i + 1];
    for (let k = 1; k < len; k++) { // k letters from first word, rest from second
      if (ws[i].length < k || ws[i + 1].length < len - k) continue;
      const sub = ws[i].slice(-k) + ws[i + 1].slice(0, len - k);
      found.set(sub, ws[i] + ' ' + ws[i + 1]);
    }
  }
  return found;
}

function buildHidden() {
  const out = []; const problems = [];
  const fours = [...C10].filter(x => x.length === 4 && !BAN.has(x));
  for (const [lvl, s, ans] of HIDDEN) {
    if (ans.length !== 4) { problems.push('skip (not 4 letters): ' + ans); continue; }
    const sp = spans(s, 4);
    if (!C35.has(ans)) { problems.push('not a common word: ' + ans); continue; }
    if (!sp.has(ans)) { problems.push('NOT FOUND: ' + ans + ' in ' + s); continue; }
    const rivals = [...sp.keys()].filter(x => x !== ans && C20.has(x));
    if (rivals.length) { problems.push('RIVAL ' + rivals + ' in "' + s + '" (' + ans + ')'); continue; }
    const flat = s.toLowerCase().replace(/[^a-z]/g, '');
    const d = shuffle(fours.filter(x => !flat.includes(x))).slice(0, 4);
    out.push({ l: lvl, s, a: ans, pair: sp.get(ans), d });
  }
  return { out, problems };
}

// no plurals / -ed forms: they make puzzles feel like tricks rather than vocabulary
const base = [...C10].filter(x => !(x.endsWith('s') && C35.has(x.slice(0, -1))) && !x.endsWith('ed'));
const missing = [
  ...buildMissing(new Set(base.filter(x => x.length <= 4)), 70, 1),
  ...buildMissing(new Set(base), 70, 2),
  ...buildMissing(new Set(base.filter(x => x.length >= 4)), 70, 3),
];
const compounds = buildCompounds();
const hidden = buildHidden();
hidden.problems.forEach(p => console.warn(p));

const file = `// AUTO-GENERATED by tools/build-wordbank.js — dictionary-checked puzzles. Do not edit by hand.
window.WORDBANK = ${JSON.stringify({ missing, compounds, hidden: hidden.out })};
`;
fs.writeFileSync(path.join(__dirname, '..', 'js', 'content', 'wordbank.js'), file);
console.log('missing', missing.length, 'compounds', compounds.length, 'hidden', hidden.out.length);
console.log(missing.slice(0, 6).map(m => `${m.p1}(${m.a})${m.s1} ${m.p2}(${m.a})${m.s2}  [${m.d}]`).join('\n'));
console.log(missing.slice(-6).map(m => `${m.p1}(${m.a})${m.s1} ${m.p2}(${m.a})${m.s2}  [${m.d}]`).join('\n'));
