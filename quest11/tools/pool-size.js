// Estimates how many distinct questions each topic can produce per level: node tools/pool-size.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { console, Math, JSON, Intl }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['js/util.js', 'js/content/wordbank.js', 'js/content/maths.js', 'js/content/english.js', 'js/content/verbal.js', 'js/content/nonverbal.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
const sig = q => (q.prompt + '|' + (q.visual || '') + '|' + q.options.slice().sort().join('|')).replace(/id="[^"]*"|url\(#[^)]*\)/g, '');
const rows = [];
for (const s of ['maths', 'english', 'verbal', 'nonverbal']) for (const t of ctx.CONTENT[s]) {
  const r = [t.id]; for (const lv of [1, 2, 3]) { const set = new Set(); for (let i = 0; i < 3000; i++) set.add(sig(t.gen(lv))); r.push(set.size); } rows.push(r);
}
rows.sort((a, b) => Math.min(a[1], a[2], a[3]) - Math.min(b[1], b[2], b[3]));
rows.forEach(r => console.log(r[0].padEnd(12), r.slice(1).map(n => String(n).padStart(5)).join(' ')));
