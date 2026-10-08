// Stress-tests every question generator: node tools/test-content.js
// Checks that each question has a valid answer index, unique options and no "NaN"/"undefined" text.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { window: {}, console, Math, Date, Intl, JSON };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['js/util.js', 'js/content/wordbank.js', 'js/content/maths.js', 'js/content/english.js', 'js/content/verbal.js', 'js/content/nonverbal.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
}

const N = +process.argv[2] || 300;
let fails = 0, total = 0;
const bad = (topic, lv, q, msg) => { fails++; if (fails < 40) console.log(`✗ ${topic} L${lv}: ${msg}\n   ${q && q.prompt ? q.prompt.replace(/<[^>]+>/g, '').slice(0, 140) : ''}\n   ${q && q.options ? q.options.map(o => o.length > 60 ? '[svg]' : o).join(' | ') : ''}`); };

for (const subject of ['maths', 'english', 'verbal', 'nonverbal']) {
  for (const t of ctx.CONTENT[subject]) {
    for (const lv of [1, 2, 3]) {
      for (let i = 0; i < N; i++) {
        total++;
        let q;
        try { q = t.gen(lv); } catch (e) { bad(t.id, lv, null, 'threw ' + e.message); continue; }
        if (!q || !Array.isArray(q.options)) { bad(t.id, lv, q, 'no options'); continue; }
        if (q.options.length < 3) bad(t.id, lv, q, 'too few options: ' + q.options.length);
        if (!(q.answer >= 0 && q.answer < q.options.length)) bad(t.id, lv, q, 'bad answer index ' + q.answer);
        const norm = q.options.map(o => o.replace(/\s+/g, ' ').trim());
        if (new Set(norm).size !== norm.length) bad(t.id, lv, q, 'duplicate options');
        const text = q.prompt + q.options.join(' ') + (q.explain || '');
        if (/NaN|undefined|Infinity|null\b|\[object/.test(text)) bad(t.id, lv, q, 'bad text');
        if (q.options.some(o => /^-|−\d/.test(o) && !/°C|^\-?\d/.test(o) && !t.id.includes('place'))) { /* negative answers are only expected in place value */ }
        if (q.options.some(o => /^-\d|^-£|-\d+p$/.test(o)) && t.id !== 'm-place') bad(t.id, lv, q, 'negative option');
      }
    }
    if (t.trial) for (const lv of [1, 2, 3]) { const list = t.trial(lv); list.forEach(fn => { const q = fn(); total++; if (!(q.answer >= 0)) bad(t.id, lv, q, 'passage q bad'); }); }
  }
}
console.log(`${total} questions generated, ${fails} problems`);
process.exit(fails ? 1 : 0);
