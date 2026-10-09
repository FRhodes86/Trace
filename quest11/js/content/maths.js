// MATHS — procedurally generated, three difficulty tiers.
// Tier 1 ≈ Year 3/4, tier 2 ≈ Year 4/5, tier 3 ≈ Year 5/6 (11+ standard).
(function () {
  const { int, pick, chance, shuffle, mc, near, fmt, gcd, svg, money } = U;

  const frac = (n, d) => `<span class="frac"><sup>${n}</sup><sub>${d}</sub></span>`;
  const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const fracTxt = (n, d) => (d === 1 ? String(n) : `${n}/${d}`);
  const roman = n => {
    const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = ''; for (const [v, r] of map) while (n >= v) { s += r; n -= v; } return s;
  };
  const roundTo = (n, p) => Math.round(n / p) * p;

  const topics = [];

  /* 1. Place value & rounding */
  topics.push({
    id: 'm-place', name: 'Place Value & Rounding', shrine: 'Ja Baij Shrine', icon: '🔢',
    lesson: `<p>Every digit has a <b>value</b> that depends on its <b>place</b>. In <b>4,372</b> the 3 is worth <b>300</b> because it sits in the hundreds column.</p>
      <p><b>Rounding:</b> look at the digit to the <i>right</i> of the place you're rounding to. <b>5 or more → round up</b>, 4 or less → round down. 4,372 to the nearest 100 is <b>4,400</b> (the tens digit is 7).</p>
      <p><b>Roman numerals:</b> I=1, V=5, X=10, L=50, C=100, D=500, M=1000. A smaller one in front means subtract: IX = 9.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['value', 'round', 'value', 'compare'] : lv === 2 ? ['value', 'round', 'roman', 'negative', 'compare'] : ['value', 'round', 'roman', 'negative', 'roundDec']);
      if (t === 'value') {
        const digits = lv === 1 ? 4 : lv === 2 ? 5 : 7;
        const n = int(10 ** (digits - 1), 10 ** digits - 1);
        const s = String(n); const pos = int(0, digits - 2);
        const d = s[pos]; if (d === '0') return this.gen(lv);
        const val = +d * 10 ** (digits - 1 - pos);
        return mc(`What is the value of the digit <b>${d}</b> in <b>${fmt(n)}</b>?`, val,
          [val * 10, val / 10, +d, val * 100].filter(x => x >= 1 && Number.isInteger(x)),
          `The ${d} is in the ${['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'][digits - 1 - pos]} column, so it is worth ${fmt(val)}.`);
      }
      if (t === 'round') {
        const places = lv === 1 ? [10, 100] : lv === 2 ? [10, 100, 1000] : [100, 1000, 10000, 100000];
        const p = pick(places); const n = int(p * 3, lv === 3 ? 999999 : lv === 2 ? 99999 : 9999);
        const r = roundTo(n, p); if (r === n) return this.gen(lv);
        const down = Math.floor(n / p) * p, up = down + p;
        return mc(`Round <b>${fmt(n)}</b> to the nearest <b>${fmt(p)}</b>.`, r, [r === up ? down : up, roundTo(n, p / 10), roundTo(n, p * 10), r + p, r - p > 0 ? r - p : r + 2 * p, n],
          `Look at the digit after the ${fmt(p)}s place. ${fmt(n)} lies between ${fmt(down)} and ${fmt(up)} and is closer to ${fmt(r)}.`);
      }
      if (t === 'compare') {
        const base = int(1000, 9999);
        const nums = shuffle([base, base + int(1, 9) * 10, base - int(1, 9), +String(base).split('').reverse().join('') || base + 1]);
        const max = Math.max(...nums);
        return mc(`Which number is the <b>largest</b>?`, max, nums.filter(x => x !== max), `Compare digits from the left: thousands first, then hundreds, tens, ones. ${fmt(max)} is the largest.`);
      }
      if (t === 'roman') {
        const n = lv === 2 ? int(4, 50) : int(40, 2025);
        const r = roman(n);
        if (chance(0.5)) return mc(`What is <b>${r}</b> in ordinary numbers?`, n, [n + 1, n - 1, n + 10, n - 10, n + 5].filter(x => x > 0), `Break it up: ${r} = ${n}. Remember a smaller numeral before a bigger one means subtract (e.g. IV = 4, XC = 90).`);
        return mc(`How is <b>${n}</b> written in Roman numerals?`, r, [roman(n + 1), roman(Math.max(1, n - 1)), roman(n + 10), r.split('').reverse().join('')], `${n} = ${r}.`);
      }
      if (t === 'negative') {
        const a = int(-12, 5), b = int(1, 15);
        if (chance(0.5)) {
          const hi = a + b;
          return mc(`At night it was <b>${a}°C</b>. By midday it was <b>${hi}°C</b>. How many degrees did the temperature rise?`, b, [Math.abs(hi) + Math.abs(a) === b ? b + 2 : Math.abs(hi) + Math.abs(a), Math.abs(hi - Math.abs(a)), b + 1, b - 1].filter(x => x >= 0),
            `Count up on a number line from ${a} to ${hi}: that's ${b} degrees.`);
        }
        return mc(`What is <b>${a} + ${b}</b>?`, a + b, [a - b, -(a + b), a + b + 1, a + b - 1, Math.abs(a) + b], `Start at ${a} on the number line and move ${b} to the right: you land on ${a + b}.`);
      }
      // roundDec
      let n = int(100, 9999) / 100;
      if (Math.round(n * 100) % 10 === 0) n = +(n + 0.03).toFixed(2);
      const dp = pick([0, 1]);
      const r = +n.toFixed(dp);
      return mc(`Round <b>${n}</b> to ${dp === 0 ? 'the nearest whole number' : '1 decimal place'}.`, r, [Math.floor(n * 10 ** dp) / 10 ** dp === r ? Math.ceil(n * 10 ** dp) / 10 ** dp : Math.floor(n * 10 ** dp) / 10 ** dp, +n.toFixed(dp + 1), Math.round(n / 10) * 10, r + 10 ** -dp, r - 10 ** -dp, r + 1].map(x => +x.toFixed(2)),
        `Look at the next digit along. ${n} rounds to ${r}.`);
    },
  });

  /* 2. Addition & subtraction */
  topics.push({
    id: 'm-addsub', name: 'Adding & Subtracting', shrine: 'Rota Ooh Shrine', icon: '➕',
    lesson: `<p><b>Column method:</b> line the digits up by place value and start from the <b>ones</b>. If a column adds to 10 or more, <b>carry</b> the ten into the next column.</p>
      <p>For subtracting, if the top digit is smaller, <b>exchange</b> (borrow) 10 from the next column.</p>
      <p><b>Check it!</b> Subtraction undoes addition: if 63 − 28 = 35 then 35 + 28 should be 63.</p>`,
    gen(lv) {
      const [lo, hi] = lv === 1 ? [10, 99] : lv === 2 ? [100, 9999] : [1000, 99999];
      const t = pick(lv === 3 ? ['add', 'sub', 'missing', 'decimal', 'word'] : lv === 2 ? ['add', 'sub', 'missing', 'word'] : ['add', 'sub', 'add', 'word']);
      let a = int(lo, hi), b = int(lo, hi);
      if (t === 'add') return mc(`What is <b>${fmt(a)} + ${fmt(b)}</b>?`, a + b, [a + b + 10, a + b - 10, a + b + 1, a + b - 1, a + b + 100], `Add column by column from the ones, carrying when a column makes 10 or more. ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`);
      if (t === 'sub') {
        if (b > a) [a, b] = [b, a];
        return mc(`What is <b>${fmt(a)} − ${fmt(b)}</b>?`, a - b, [a - b + 10, a - b - 10, a - b + 1, a - b - 1, a - b + 100].filter(x => x >= 0), `Subtract column by column, exchanging when the top digit is smaller. Check: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.`);
      }
      if (t === 'missing') {
        if (b > a) [a, b] = [b, a];
        if (chance(0.5)) return mc(`<b>? − ${fmt(b)} = ${fmt(a - b)}</b>. What is the missing number?`, a, [a - b - b > 0 ? a - 2 * b : a + 10, a + 10, a - 10, b], `Work backwards: the missing number is ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.`);
        return mc(`<b>${fmt(b)} + ? = ${fmt(a)}</b>. What is the missing number?`, a - b, [a + b, a - b + 10, a - b - 1, a - b + 1], `Find the difference: ${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`);
      }
      if (t === 'decimal') {
        const x = int(100, 9999) / 100, y = int(100, 9999) / 100;
        const plus = chance(0.5);
        const ans = +(plus ? x + y : Math.abs(x - y)).toFixed(2);
        const [p, q] = plus ? [x, y] : [Math.max(x, y), Math.min(x, y)];
        return mc(`What is <b>${p} ${plus ? '+' : '−'} ${q}</b>?`, ans, [+(ans + 0.1).toFixed(2), +(ans - 1).toFixed(2), +(ans + 1).toFixed(2), +(ans - 0.01).toFixed(2)].filter(v => v > 0), `Line up the decimal points, then work column by column. Answer: ${ans}.`);
      }
      // word
      const who = pick(['Link', 'Zelda', 'Beedle', 'Impa', 'Hestu', 'Kass']);
      const item = pick(['rupees', 'arrows', 'apples', 'Korok seeds', 'acorns']);
      if (chance(0.5)) {
        if (b > a) [a, b] = [b, a];
        return mc(`${who} had <b>${fmt(a)}</b> ${item} and gave away <b>${fmt(b)}</b>. How many are left?`, a - b, [a + b, a - b + 10, a - b - 10, a - b + 1].filter(x => x >= 0), `"Gave away" means subtract: ${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`);
      }
      return mc(`${who} collected <b>${fmt(a)}</b> ${item} on Monday and <b>${fmt(b)}</b> on Tuesday. How many altogether?`, a + b, [Math.abs(a - b), a + b + 10, a + b - 10, a + b + 1], `"Altogether" means add: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`);
    },
  });

  /* 3. Multiplication, factors & multiples */
  topics.push({
    id: 'm-mult', name: 'Multiplication & Factors', shrine: 'Keh Namut Shrine', icon: '✖️',
    lesson: `<p>Knowing your <b>times tables up to 12 × 12</b> by heart is a superpower for the 11+!</p>
      <p><b>Multiples</b> of 6: 6, 12, 18, 24… (the 6 times table). <b>Factors</b> of 12: numbers that divide into it exactly — 1, 2, 3, 4, 6, 12.</p>
      <p>A <b>prime number</b> has exactly two factors: 1 and itself (2, 3, 5, 7, 11, 13…). A <b>square number</b> is a number times itself: 4 = 2×2, 9 = 3×3.</p>
      <p>Multiplying by 10 shifts every digit one place to the left: 34 × 10 = 340.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['table', 'table', 'x10'] : lv === 2 ? ['table', 'bigger', 'x10', 'multiple'] : ['long', 'factor', 'prime', 'square', 'multiple', 'bigger']);
      if (t === 'table') {
        const a = int(2, lv === 1 ? 10 : 12), b = int(2, lv === 1 ? 10 : 12);
        return mc(`What is <b>${a} × ${b}</b>?`, a * b, [a * (b + 1), a * (b - 1), (a + 1) * b, a * b + 1, a + b], `${a} × ${b} = ${a * b}. Count up in ${a}s ${b} times if you're not sure.`);
      }
      if (t === 'x10') {
        const n = lv === 1 ? int(2, 99) : int(11, 999); const p = pick(lv === 1 ? [10, 100] : [10, 100, 1000]);
        return mc(`What is <b>${fmt(n)} × ${fmt(p)}</b>?`, n * p, [n * p * 10, n * p / 10, n + p, n * p * 100], `Multiplying by ${fmt(p)} moves every digit ${String(p).length - 1} place${p > 10 ? 's' : ''} to the left: ${fmt(n * p)}.`);
      }
      if (t === 'bigger') {
        const a = int(12, lv === 2 ? 99 : 999), b = int(3, 9);
        return mc(`What is <b>${a} × ${b}</b>?`, a * b, [a * b + 10, a * b - 10, a * (b + 1), a * b + b], `Split it up: ${a} × ${b} = (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}) = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b} = ${a * b}.`);
      }
      if (t === 'long') {
        const a = int(23, 499), b = int(12, 49);
        return mc(`What is <b>${a} × ${b}</b>?`, a * b, [a * b + 10, a * b - a, a * b + a, a * (b % 10) + a * Math.floor(b / 10)], `Long multiplication: ${a} × ${b % 10} = ${a * (b % 10)} and ${a} × ${b - (b % 10)} = ${a * (b - (b % 10))}. Add them: ${a * b}.`);
      }
      if (t === 'multiple') {
        const k = int(3, 12);
        const yes = k * int(3, 12);
        const nos = [yes + 1, yes + 2, yes - 1, yes + Math.ceil(k / 2)].filter(x => x % k !== 0);
        return mc(`Which of these is a <b>multiple of ${k}</b>?`, yes, nos, `${yes} = ${k} × ${yes / k}, so it is in the ${k} times table.`);
      }
      if (t === 'factor') {
        const n = pick([24, 36, 48, 60, 72, 84, 90, 96, 30, 42, 56, 64]);
        const fs = []; for (let i = 2; i < n; i++) if (n % i === 0) fs.push(i);
        const f = pick(fs);
        const non = []; for (let i = 5; i < n; i++) if (n % i !== 0) non.push(i);
        return mc(`Which number is a <b>factor of ${n}</b>?`, f, shuffle(non), `${n} ÷ ${f} = ${n / f} exactly, so ${f} is a factor of ${n}.`);
      }
      if (t === 'prime') {
        const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        const p = pick(primes);
        const nonP = shuffle([21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 15, 25, 35, 45]);
        return mc(`Which of these is a <b>prime number</b>?`, p, nonP, `${p} can only be divided exactly by 1 and ${p}. Watch out: ${nonP[0]} looks prime but isn't — try dividing by 3 and 7!`);
      }
      // square
      const s = int(4, 15);
      if (chance(0.5)) return mc(`What is <b>${s}²</b> (${s} squared)?`, s * s, [s * 2, s * s + s, (s - 1) * (s - 1), (s + 1) * (s + 1)], `${s}² means ${s} × ${s} = ${s * s}. It is not ${s} × 2!`);
      return mc(`Which of these is a <b>square number</b>?`, s * s, [s * s + 1, s * s - 2, s * (s + 1), s * s + s + 3], `${s * s} = ${s} × ${s}.`);
    },
  });

  /* 4. Division */
  topics.push({
    id: 'm-div', name: 'Division & Remainders', shrine: 'Owa Daim Shrine', icon: '➗',
    lesson: `<p>Division is <b>sharing</b> or <b>grouping</b>. It's the opposite of multiplying: if 7 × 8 = 56 then 56 ÷ 8 = 7.</p>
      <p>When it doesn't share exactly you get a <b>remainder</b>: 23 ÷ 5 = 4 remainder 3 (because 4 × 5 = 20, and 3 is left over).</p>
      <p><b>Word problem trap!</b> "How many boxes of 6 do I need for 50 eggs?" 50 ÷ 6 = 8 r 2, but those 2 eggs still need a box — so the answer is <b>9</b>.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['fact', 'fact', 'share'] : lv === 2 ? ['fact', 'rem', 'short', 'share'] : ['short', 'rem', 'roundup', 'div10', 'long']);
      if (t === 'fact') {
        const a = int(2, lv === 1 ? 10 : 12), b = int(2, lv === 1 ? 10 : 12);
        return mc(`What is <b>${a * b} ÷ ${a}</b>?`, b, [b + 1, b - 1, a, b + 2], `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}.`);
      }
      if (t === 'share') {
        const k = int(2, 6), each = int(2, 10);
        const who = pick(['Koroks', 'Gorons', 'Zoras', 'Rito', 'friends']);
        return mc(`${k * each} rupees are shared equally between ${k} ${who}. How many rupees does each get?`, each, [each + 1, each - 1, k * each - k, k], `${k * each} ÷ ${k} = ${each}.`);
      }
      if (t === 'rem') {
        const d = int(3, 9), q = int(4, 15), r = int(1, d - 1); const n = d * q + r;
        return mc(`What is <b>${n} ÷ ${d}</b>?`, `${q} r ${r}`, [`${q} r ${r + 1 < d ? r + 1 : r - 1}`, `${q + 1} r ${r}`, `${q - 1} r ${r + d}`, `${q}`], `${d} × ${q} = ${d * q}. ${n} − ${d * q} = ${r} left over, so the answer is ${q} remainder ${r}.`);
      }
      if (t === 'short') {
        const d = int(3, 9), q = int(lv === 2 ? 21 : 101, lv === 2 ? 99 : 999);
        return mc(`What is <b>${fmt(d * q)} ÷ ${d}</b>?`, q, [q + 10, q - 10, q + 1, q * 10], `Use short division (the "bus stop"). Check: ${q} × ${d} = ${fmt(d * q)}.`);
      }
      if (t === 'roundup') {
        const per = int(4, 12), need = per * int(3, 9) + int(1, per - 1);
        const thing = pick([['eggs', 'boxes'], ['children', 'minibuses'], ['arrows', 'quivers'], ['apples', 'baskets']]);
        const exact = Math.floor(need / per);
        return mc(`Each of the ${thing[1]} holds <b>${per}</b> ${thing[0]}. How many ${thing[1]} are needed for <b>${need}</b> ${thing[0]}?`, exact + 1, [exact, exact + 2, need - per, need % per], `${need} ÷ ${per} = ${exact} remainder ${need % per}. The ${need % per} left over still need one more, so ${exact + 1}.`);
      }
      if (t === 'div10') {
        const n = int(10, 9999) * 10; const p = pick([10, 100, 1000]);
        const ans = n / p;
        return mc(`What is <b>${fmt(n)} ÷ ${fmt(p)}</b>?`, ans, [ans * 10, ans / 10, n - p, ans * 100], `Dividing by ${fmt(p)} moves every digit ${String(p).length - 1} place${p > 10 ? 's' : ''} to the right: ${fmt(ans)}.`);
      }
      const d = int(11, 25), q = int(12, 60);
      return mc(`What is <b>${fmt(d * q)} ÷ ${d}</b>?`, q, [q + 1, q - 1, q + 10, q - 10], `Check by multiplying: ${q} × ${d} = ${fmt(d * q)}.`);
    },
  });

  /* 5. Fractions */
  function pizza(num, den) {
    const r = 46, cx = 55, cy = 55; let paths = '';
    for (let i = 0; i < den; i++) {
      const a0 = (i / den) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const large = a1 - a0 > Math.PI ? 1 : 0;
      paths += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" class="${i < num ? 'shade' : 'blank'}"/>`;
    }
    return svg(110, 110, paths);
  }
  function bar(num, den) {
    let s = ''; const w = 220 / den;
    for (let i = 0; i < den; i++) s += `<rect x="${5 + i * w}" y="5" width="${w}" height="40" class="${i < num ? 'shade' : 'blank'}"/>`;
    return svg(230, 50, s);
  }
  topics.push({
    id: 'm-frac', name: 'Fractions', shrine: 'Toto Sah Shrine', icon: '🍕',
    lesson: `<p>A fraction has a <b>numerator</b> (top: how many parts we have) and a <b>denominator</b> (bottom: how many equal parts the whole is split into).</p>
      <p><b>Fraction of an amount:</b> divide by the bottom, multiply by the top. ¾ of 20 → 20 ÷ 4 = 5, then 5 × 3 = <b>15</b>.</p>
      <p><b>Equivalent fractions:</b> multiply or divide top and bottom by the same number. ½ = 2/4 = 4/8. To <b>simplify</b>, divide both by a common factor: 6/8 = 3/4.</p>
      <p><b>Adding:</b> the denominators must match first. ½ + ⅓ = 3/6 + 2/6 = 5/6.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['shade', 'of', 'shade', 'unitof'] : lv === 2 ? ['equiv', 'of', 'compare', 'addsame', 'simplify'] : ['of', 'add', 'mixed', 'simplify', 'compare', 'reverse']);
      if (t === 'shade') {
        const den = pick([2, 3, 4, 5, 6, 8, 10]), num = int(1, den - 1);
        const vis = chance(0.5) ? pizza(num, den) : bar(num, den);
        return mc(`What fraction of the shape is <b>shaded</b>?`, fracTxt(num, den), [fracTxt(den - num, den), fracTxt(num, den + 1), fracTxt(num, den - num || 1), `${den}/${num}`], `There are ${den} equal parts and ${num} ${num === 1 ? 'is' : 'are'} shaded, so ${num}/${den}.`, { visual: vis });
      }
      if (t === 'unitof') {
        const den = pick([2, 3, 4, 5, 10]), each = int(2, 10), n = den * each;
        return mc(`What is ${frac(1, den)} of <b>${n}</b>?`, each, [each + 1, n - den, each * 2, n / 2 === each ? each + 2 : n / 2], `Divide by the denominator: ${n} ÷ ${den} = ${each}.`);
      }
      if (t === 'of') {
        const den = pick(lv === 3 ? [3, 4, 5, 6, 7, 8, 9, 12] : [3, 4, 5, 8, 10]);
        const num = int(2, den - 1); const each = int(lv === 3 ? 4 : 2, lv === 3 ? 15 : 9); const n = den * each;
        return mc(`What is ${frac(num, den)} of <b>${n}</b>?`, num * each, [each, num * each + each, n - num * each, num * each - 1], `${n} ÷ ${den} = ${each}, then ${each} × ${num} = ${num * each}.`);
      }
      if (t === 'equiv') {
        const den = pick([2, 3, 4, 5]), num = int(1, den - 1), k = int(2, 5);
        return mc(`Which fraction is <b>equivalent</b> to ${frac(num, den)}?`, fracTxt(num * k, den * k), [fracTxt(num * k, den * k + 1), fracTxt(num + k, den + k), fracTxt(num * k, den + k), fracTxt(den * k, num * k)], `Multiply top and bottom by ${k}: ${num}×${k} = ${num * k} and ${den}×${k} = ${den * k}.`);
      }
      if (t === 'simplify') {
        const den = pick([4, 5, 6, 7, 8, 9, 10, 12]); let num = int(1, den - 1); const [sn, sd] = simp(num, den); const k = int(2, 6);
        return mc(`Write ${frac(sn * k, sd * k)} in its <b>simplest form</b>.`, fracTxt(sn, sd), [fracTxt(sn * k / (k > 2 && k % 2 === 0 ? 2 : 1), sd * k / (k > 2 && k % 2 === 0 ? 2 : 1)), fracTxt(sn + 1, sd), fracTxt(sd, sn), fracTxt(sn, sd + 1)], `Divide top and bottom by ${k} (their highest common factor): ${sn}/${sd}.`);
      }
      if (t === 'compare') {
        const opts = shuffle([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 8], [3, 8], [7, 10], [5, 6], [1, 6]]).slice(0, 4);
        const best = opts.reduce((m, f) => (f[0] / f[1] > m[0] / m[1] ? f : m));
        return mc(`Which fraction is the <b>largest</b>?`, fracTxt(...best), opts.filter(f => f !== best).map(f => fracTxt(...f)), `Turn them into decimals or find a common denominator. ${fracTxt(...best)} = ${(best[0] / best[1]).toFixed(3).replace(/0+$/, '')} is the biggest.`);
      }
      if (t === 'addsame') {
        const den = pick([5, 6, 7, 8, 9, 10, 12]); const a = int(1, den - 2), b = int(1, den - 1 - a);
        return mc(`What is ${frac(a, den)} + ${frac(b, den)}?`, fracTxt(a + b, den), [fracTxt(a + b, den * 2), fracTxt(a + b + 1, den), fracTxt(a * b, den), fracTxt(a + b, den - 1)], `Same denominator, so just add the numerators: ${a} + ${b} = ${a + b}. Keep the denominator: ${a + b}/${den}.`);
      }
      if (t === 'add') {
        const pairs = [[2, 3], [2, 5], [3, 4], [4, 6], [3, 5], [2, 7], [4, 5], [3, 8]];
        const [d1, d2] = pick(pairs); const a = int(1, d1 - 1), b = int(1, d2 - 1); const L = d1 * d2 / gcd(d1, d2);
        const n = a * (L / d1) + b * (L / d2); const [sn, sd] = simp(n, L);
        const show = sn >= sd ? `${Math.floor(sn / sd)} ${sn % sd ? fracTxt(sn % sd, sd) : ''}`.trim() : fracTxt(sn, sd);
        const wrong1 = fracTxt(a + b, d1 + d2);
        return mc(`What is ${frac(a, d1)} + ${frac(b, d2)}?`, show, [wrong1, fracTxt(n + 1, L), fracTxt(a * b, L), fracTxt(n, L * 2)], `Use a common denominator of ${L}: ${a}/${d1} = ${a * L / d1}/${L} and ${b}/${d2} = ${b * L / d2}/${L}. Add: ${n}/${L}${n !== sn || L !== sd ? ` = ${show}` : ''}. (Never add the bottoms!)`);
      }
      if (t === 'mixed') {
        const den = pick([3, 4, 5, 6, 8]); const whole = int(1, 4); const num = int(1, den - 1);
        if (chance(0.5)) return mc(`Write <b>${whole}</b>${frac(num, den)} as an <b>improper fraction</b>.`, fracTxt(whole * den + num, den), [fracTxt(whole + num, den), fracTxt(whole * num + den, den), fracTxt(whole * den, den), fracTxt(whole * den + num, den * whole), fracTxt(whole * den + num + 1, den), fracTxt(whole * den - num, den)], `${whole} whole = ${whole * den}/${den}. Add ${num}/${den}: ${whole * den + num}/${den}.`);
        return mc(`Write ${frac(whole * den + num, den)} as a <b>mixed number</b>.`, `${whole} ${num}/${den}`, [`${whole + 1} ${num}/${den}`, `${whole} ${den - num}/${den}`, `${num} ${whole}/${den}`, `${whole - 1 || 3} ${num}/${den}`, `${whole} ${num}/${den + 1}`], `${whole * den + num} ÷ ${den} = ${whole} remainder ${num}, so ${whole} ${num}/${den}.`);
      }
      // reverse
      const den = pick([3, 4, 5, 8]), num = int(1, den - 1), each = int(3, 12);
      return mc(`${frac(num, den)} of a number is <b>${num * each}</b>. What is the number?`, den * each, [num * each * den, each, den * each + each, num * each + den], `If ${num}/${den} is ${num * each}, then 1/${den} is ${num * each} ÷ ${num} = ${each}. The whole is ${each} × ${den} = ${den * each}.`);
    },
  });

  /* 6. Decimals & percentages */
  topics.push({
    id: 'm-dec', name: 'Decimals & Percentages', shrine: 'Shee Venath Shrine', icon: '💯',
    lesson: `<p>Decimals are another way to write fractions: 0.1 = 1/10, 0.25 = 1/4, 0.5 = 1/2, 0.75 = 3/4.</p>
      <p><b>Percent</b> means "out of 100". 50% = ½, 25% = ¼, 10% = 1/10.</p>
      <p><b>Finding a percentage:</b> find 10% first (divide by 10), then build up. 30% of 80 → 10% is 8, so 30% is 8 × 3 = <b>24</b>. 5% is half of 10%.</p>
      <p><b>Ordering decimals:</b> line up the decimal points. 0.7 is bigger than 0.65 (think 0.70 vs 0.65).</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['tenths', 'money', 'half'] : lv === 2 ? ['pct', 'convert', 'order', 'money'] : ['pct', 'pct', 'convert', 'order', 'discount']);
      if (t === 'tenths') {
        const n = int(1, 9);
        return mc(`Which decimal is the same as ${frac(n, 10)}?`, `0.${n}`, [`${n}.0`, `0.0${n}`, `${n}.10`, `1.${n}`], `${n} tenths = 0.${n}. The first place after the decimal point is tenths.`);
      }
      if (t === 'half') {
        const n = int(2, 40) * 2;
        return mc(`What is <b>50%</b> of ${n}?`, n / 2, [n * 2, n - 50, n / 4, n / 2 + 1].filter(x => x > 0), `50% means half. Half of ${n} is ${n / 2}.`);
      }
      if (t === 'money') {
        const price = int(15, 450); const paid = price < 100 ? 100 : price < 200 ? 200 : 500;
        return mc(`Beedle sells a lamp for <b>${money(price)}</b>. You pay with <b>${money(paid)}</b>. How much change do you get?`, money(paid - price), [money(paid - price + 10), money(paid - price - 1 > 0 ? paid - price - 1 : paid - price + 5), money(price), money(paid - price + 100)], `Count up from ${money(price)} to ${money(paid)}: ${money(paid - price)}.`);
      }
      if (t === 'pct') {
        const p = pick(lv === 2 ? [10, 25, 50, 20, 75] : [5, 15, 30, 35, 40, 60, 45, 12.5]);
        const base = p === 12.5 ? 8 * int(2, 12) : (p % 10 === 5 ? 20 : 10) * int(2, 20);
        const ans = base * p / 100;
        return mc(`What is <b>${p}%</b> of ${base}?`, ans, [base * (p + 10) / 100, base / p, ans * 10, base - ans].map(x => +x.toFixed(2)), `10% of ${base} = ${base / 10}. Build up to ${p}%: ${ans}.`);
      }
      if (t === 'convert') {
        const f = pick([[1, 2, 0.5, 50], [1, 4, 0.25, 25], [3, 4, 0.75, 75], [1, 5, 0.2, 20], [2, 5, 0.4, 40], [1, 10, 0.1, 10], [3, 10, 0.3, 30], [1, 8, 0.125, 12.5], [3, 5, 0.6, 60], [7, 10, 0.7, 70]]);
        const form = pick(['dec', 'pct', 'frac']);
        if (form === 'dec') return mc(`Write ${frac(f[0], f[1])} as a <b>decimal</b>.`, f[2], [f[0] / 10, f[0] + f[1] / 100, f[3], +(1 - f[2]).toFixed(3)].filter(x => x !== f[2]), `${f[0]} ÷ ${f[1]} = ${f[2]}.`);
        if (form === 'pct') return mc(`Write <b>${f[2]}</b> as a <b>percentage</b>.`, f[3] + '%', [f[2] + '%', f[3] / 10 + '%', f[3] * 10 + '%', (100 - f[3]) + '%'], `Multiply by 100: ${f[2]} × 100 = ${f[3]}%.`);
        return mc(`Write <b>${f[3]}%</b> as a fraction in its simplest form.`, fracTxt(f[0], f[1]), [`${f[3]}/10`, `${f[1]}/${f[0]}`, fracTxt(f[0], f[1] + 1), fracTxt(100 - f[3], 100)], `${f[3]}% = ${f[3]}/100 = ${f[0]}/${f[1]}.`);
      }
      if (t === 'order') {
        const a = int(1, 9) / 10;
        const set = shuffle([a, +(a + 0.05).toFixed(2), +(a + 0.009).toFixed(3), +(a - 0.01 > 0 ? a - 0.01 : a + 0.11).toFixed(2)]);
        const big = Math.max(...set);
        return mc(`Which is the <b>largest</b>?`, big, set.filter(x => x !== big), `Line up the decimal points and compare digit by digit (add zeros: ${set.map(x => x.toFixed(3)).join(', ')}).`);
      }
      const price = int(4, 30) * 10; const p = pick([10, 20, 25, 50]);
      return mc(`A shield costs <b>${price} rupees</b>. In a sale it has <b>${p}% off</b>. What is the sale price?`, price - price * p / 100, [price * p / 100, price - p, price + price * p / 100, price - price * p / 50], `${p}% of ${price} = ${price * p / 100}. Take it away: ${price} − ${price * p / 100} = ${price - price * p / 100}.`);
    },
  });

  /* 7. Measurement, time & money */
  topics.push({
    id: 'm-meas', name: 'Measures & Time', shrine: 'Hila Rao Shrine', icon: '⏳',
    lesson: `<p><b>Units:</b> 10 mm = 1 cm · 100 cm = 1 m · 1000 m = 1 km · 1000 g = 1 kg · 1000 ml = 1 litre.</p>
      <p><b>Time:</b> 60 seconds = 1 minute · 60 minutes = 1 hour · 24 hours = 1 day · 7 days = 1 week. <b>Careful:</b> time is not decimal! 1 hour 30 minutes is 90 minutes, not 130.</p>
      <p><b>24-hour clock:</b> afternoon times add 12 to the hour: 3:45 pm = 15:45.</p>
      <p>To find how long something takes, <b>count on</b> to the next hour, then add the rest.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['units1', 'after', 'mins'] : lv === 2 ? ['units', 'clock24', 'after', 'duration'] : ['units', 'duration', 'clock24', 'timetable', 'units']);
      if (t === 'units1' || (t === 'units' && lv === 2)) {
        const c = pick([['m', 'cm', 100], ['kg', 'g', 1000], ['litres', 'ml', 1000], ['cm', 'mm', 10], ['km', 'm', 1000]]);
        const n = int(2, 9);
        return mc(`How many <b>${c[1]}</b> are in <b>${n} ${c[0]}</b>?`, n * c[2], [n * c[2] / 10, n * c[2] * 10, n + c[2], n * 100 === n * c[2] ? n * 1000 : n * 100], `1 ${c[0].replace(/s$/, '')} = ${c[2]} ${c[1]}, so ${n} × ${c[2]} = ${fmt(n * c[2])} ${c[1]}.`);
      }
      if (t === 'units') {
        const c = pick([['m', 'cm', 100], ['kg', 'g', 1000], ['litres', 'ml', 1000], ['km', 'm', 1000]]);
        const big = int(12, 95) / 10;
        if (chance(0.5)) return mc(`Write <b>${big} ${c[0]}</b> in <b>${c[1]}</b>.`, Math.round(big * c[2]), [Math.round(big * c[2] / 10), Math.round(big * c[2] * 10), Math.round(big * 100) === Math.round(big * c[2]) ? Math.round(big * 1000) : Math.round(big * 100)], `Multiply by ${c[2]}: ${big} × ${c[2]} = ${fmt(Math.round(big * c[2]))} ${c[1]}.`);
        const small = int(150, 9500);
        return mc(`Write <b>${fmt(small)} ${c[1]}</b> in <b>${c[0]}</b>.`, +(small / c[2]).toFixed(3), [+(small / c[2] * 10).toFixed(3), +(small / c[2] / 10).toFixed(4), +(small / (c[2] === 100 ? 1000 : 100)).toFixed(3)], `Divide by ${c[2]}: ${fmt(small)} ÷ ${c[2]} = ${+(small / c[2]).toFixed(3)} ${c[0]}.`);
      }
      const tstr = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h}:${String(mm).padStart(2, '0')}`; };
      const t12 = (m) => { m = ((m % 1440) + 1440) % 1440; let h = Math.floor(m / 60); const mm = m % 60; const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(mm).padStart(2, '0')} ${ap}`; };
      if (t === 'mins') {
        const h = int(1, 4), m = pick([0, 15, 30, 45]);
        return mc(`How many minutes are in <b>${h} hour${h > 1 ? 's' : ''}${m ? ' ' + m + ' minutes' : ''}</b>?`, h * 60 + m, [h * 100 + m, h * 60 + m + 10, h * 60, (h + 1) * 60 + m], `${h} × 60 = ${h * 60}, plus ${m} = ${h * 60 + m} minutes.`);
      }
      if (t === 'after') {
        const start = int(8 * 4, 17 * 4) * 15 + pick([0, 5, 10]); const add = pick(lv === 1 ? [15, 20, 25, 30, 45] : [35, 40, 50, 55, 75, 85, 95]);
        return mc(`Link sets off at <b>${t12(start)}</b>. The journey takes <b>${add} minutes</b>. What time does he arrive?`, t12(start + add), [t12(start + add + 40), t12(start + add - 10), t12(start + add + 10), t12(start + add - 60)], `Count on to the next hour, then add what's left. ${t12(start)} + ${add} min = ${t12(start + add)}.`);
      }
      if (t === 'clock24') {
        const m = int(13 * 4, 23 * 4) * 15 + pick([0, 5]);
        if (chance(0.5)) return mc(`What is <b>${t12(m)}</b> on the 24-hour clock?`, tstr(m), [tstr(m - 12 * 60), tstr(m + 60), `${Math.floor(m / 60) + 10}:${String(m % 60).padStart(2, '0')}`, tstr(m - 60)], `Afternoon/evening: add 12 to the hour → ${tstr(m)}.`);
        return mc(`What is <b>${tstr(m)}</b> on the 12-hour clock?`, t12(m), [t12(m - 12 * 60), t12(m + 60), t12(m - 120), t12(m - 60)], `Take 12 off the hour and it's pm: ${t12(m)}.`);
      }
      if (t === 'duration') {
        const s = int(8 * 12, 14 * 12) * 5, d = int(5, 30) * 5 + (lv === 3 ? 60 : 0);
        const hm = x => [Math.floor(x / 60) ? Math.floor(x / 60) + ' h' : '', x % 60 || x < 60 ? (x % 60) + ' min' : ''].filter(Boolean).join(' ');
        return mc(`A trial started at <b>${tstr(s)}</b> and ended at <b>${tstr(s + d)}</b>. How long did it last?`, hm(d), [hm(d + 40), hm(Math.abs(d - 10)), hm(d + 60), hm(d + 10)], `Count on from ${tstr(s)} to the next hour, then on to ${tstr(s + d)}: ${hm(d)}. Don't subtract times like normal numbers — there are 60 minutes in an hour, not 100!`);
      }
      // timetable
      const st = int(9 * 4, 15 * 4) * 15; const gaps = [int(2, 5) * 5, int(3, 8) * 5, int(4, 9) * 5];
      const stops = ['Kakariko', 'Hateno', 'Lurelin', 'Gerudo Town'];
      let tm = st; const times = [tm]; gaps.forEach(g => { tm += g; times.push(tm); });
      const rows = stops.map((s, i) => `<tr><td>${s}</td><td>${tstr(times[i])}</td></tr>`).join('');
      const a = int(0, 1), b = int(a + 2, 3);
      const d = times[b] - times[a];
      return mc(`Use the stagecoach timetable. How long does the journey take from <b>${stops[a]}</b> to <b>${stops[b]}</b>?`, `${d} minutes`, [`${d + 10} minutes`, `${d - 5} minutes`, `${times[b] - times[0] === d ? d + 15 : times[b] - times[0]} minutes`, `${d + 40} minutes`], `${tstr(times[b])} − ${tstr(times[a])} = ${d} minutes.`, { visual: `<table class="qtable"><tr><th>Stop</th><th>Time</th></tr>${rows}</table>` });
    },
  });

  /* 8. Shape, angles, perimeter & area */
  function rectSvg(w, h, label = true) {
    const sc = Math.min(160 / w, 90 / h); const W = w * sc, H = h * sc;
    return svg(220, 130, `<rect x="${(220 - W) / 2}" y="${(130 - H) / 2}" width="${W}" height="${H}" class="shape"/>` + (label ? `<text x="110" y="${(130 - H) / 2 - 4}" class="lbl" text-anchor="middle">${w} cm</text><text x="${(220 + W) / 2 + 6}" y="67" class="lbl">${h} cm</text>` : ''));
  }
  function lShape(a, b, c, d) { // a,b outer; c,d cut-out
    const sc = 160 / Math.max(a, b); const A = a * sc, B = b * sc, C = c * sc, D = d * sc, ox = 25, oy = 10;
    return svg(230, 190, `<path class="shape" d="M${ox},${oy} h${A - C} v${D} h${C} v${B - D} h-${A} Z"/>
      <text class="lbl" x="${ox + A / 2}" y="${oy + B + 16}" text-anchor="middle">${a} cm</text>
      <text class="lbl" x="${ox - 4}" y="${oy + B / 2}" text-anchor="end">${b} cm</text>
      <text class="lbl" x="${ox + A - C / 2}" y="${oy + D - 4}" text-anchor="middle">${c} cm</text>
      <text class="lbl" x="${ox + A - C - 4}" y="${oy + D / 2 + 4}" text-anchor="end">${d} cm</text>`);
  }
  topics.push({
    id: 'm-shape', name: 'Shape, Angles & Area', shrine: 'Kaam Ya\'tak Shrine', icon: '📐',
    lesson: `<p><b>Perimeter</b> = the distance all the way <i>around</i> the edge. Add up every side.</p>
      <p><b>Area</b> = the space <i>inside</i>. Rectangle: length × width (in cm²). Triangle: ½ × base × height.</p>
      <p><b>Angles:</b> a right angle is 90°. Angles on a straight line add to <b>180°</b>. Angles in a triangle add to <b>180°</b>. Angles around a point add to <b>360°</b>. Angles in a quadrilateral add to <b>360°</b>.</p>
      <p>Pentagon 5 sides · hexagon 6 · heptagon 7 · octagon 8. A cube has 6 faces, 12 edges and 8 vertices.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['sides', 'perim', '3d', 'right'] : lv === 2 ? ['perim', 'area', 'line', 'sides', '3d'] : ['tri', 'compound', 'area', 'line', 'point', 'volume', 'triarea']);
      if (t === 'sides') {
        const s = pick([['triangle', 3], ['quadrilateral', 4], ['pentagon', 5], ['hexagon', 6], ['heptagon', 7], ['octagon', 8], ['decagon', 10]]);
        if (chance(0.5)) return mc(`How many sides does a <b>${s[0]}</b> have?`, s[1], [s[1] + 1, s[1] - 1, s[1] + 2, s[1] - 2].filter(x => x > 2), `A ${s[0]} has ${s[1]} sides.`);
        const names = ['triangle', 'quadrilateral', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'decagon'];
        return mc(`What is a shape with <b>${s[1]} straight sides</b> called?`, s[0], names.filter(n => n !== s[0]), `${s[1]} sides = ${s[0]}. (Tip: OCTopus has 8 legs, an OCTagon has 8 sides!)`);
      }
      if (t === '3d') {
        const s = pick([['cube', 6, 12, 8], ['cuboid', 6, 12, 8], ['square-based pyramid', 5, 8, 5], ['triangular prism', 5, 9, 6], ['tetrahedron (triangular pyramid)', 4, 6, 4]]);
        const k = pick([['faces', 1], ['edges', 2], ['vertices (corners)', 3]]);
        return mc(`How many <b>${k[0]}</b> does a <b>${s[0]}</b> have?`, s[k[1]], [s[1], s[2], s[3], s[k[1]] + 1, s[k[1]] - 2].filter(x => x !== s[k[1]] && x > 0), `A ${s[0]} has ${s[1]} faces, ${s[2]} edges and ${s[3]} vertices.`);
      }
      if (t === 'right') {
        const a = pick([['a quarter turn', '90°'], ['a half turn', '180°'], ['a full turn', '360°'], ['three quarter turns', '270°']]);
        return mc(`How many degrees are in <b>${a[0]}</b>?`, a[1], ['90°', '180°', '270°', '360°', '45°'].filter(x => x !== a[1]), `A full turn is 360°, so ${a[0]} is ${a[1]}.`);
      }
      if (t === 'perim') {
        const w = int(3, 15), h = int(2, 10);
        return mc(`What is the <b>perimeter</b> of this rectangle?`, `${2 * (w + h)} cm`, [`${w + h} cm`, `${w * h} cm`, `${2 * w + h} cm`, `${2 * (w + h) + 2} cm`], `Perimeter = add all four sides: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`, { visual: rectSvg(w, h) });
      }
      if (t === 'area') {
        const w = int(3, 15), h = int(2, 12);
        if (lv === 3 && chance(0.4)) {
          const A = w * h;
          return mc(`A rectangle has an <b>area of ${A} cm²</b>. One side is <b>${w} cm</b>. How long is the other side?`, `${h} cm`, [`${A - w} cm`, `${h + 1} cm`, `${A / 2 - w} cm`, `${w} cm`].filter(x => !x.startsWith('-')), `Area = length × width, so ${A} ÷ ${w} = ${h} cm.`);
        }
        return mc(`What is the <b>area</b> of this rectangle?`, `${w * h} cm²`, [`${2 * (w + h)} cm²`, `${w + h} cm²`, `${w * h + w} cm²`, `${(w - 1) * h} cm²`], `Area = length × width = ${w} × ${h} = ${w * h} cm².`, { visual: rectSvg(w, h) });
      }
      if (t === 'compound') {
        const a = int(8, 14), b = int(6, 12), c = int(2, a - 4), d = int(2, b - 3);
        const area = a * b - c * d; const per = 2 * (a + b);
        if (chance(0.5)) return mc(`What is the <b>area</b> of this shape?`, `${area} cm²`, [`${a * b} cm²`, `${area + c * d * 2} cm²`, `${per} cm²`, `${area - c} cm²`], `Big rectangle ${a} × ${b} = ${a * b}, minus the missing corner ${c} × ${d} = ${c * d}. ${a * b} − ${c * d} = ${area} cm².`, { visual: lShape(a, b, c, d) });
        return mc(`What is the <b>perimeter</b> of this shape?`, `${per} cm`, [`${per - c - d} cm`, `${area} cm`, `${a + b + c + d} cm`, `${per + 2 * c} cm`], `A cut-out corner doesn't change the perimeter of an L-shape: it's the same as the full rectangle, 2 × (${a} + ${b}) = ${per} cm.`, { visual: lShape(a, b, c, d) });
      }
      if (t === 'line') {
        const x = int(20, 160);
        return mc(`Two angles sit on a <b>straight line</b>. One is <b>${x}°</b>. What is the other?`, `${180 - x}°`, [`${360 - x}°`, `${90 - x > 0 ? 90 - x : x + 10}°`, `${180 - x + 10}°`, `${x}°`], `Angles on a straight line add up to 180°: 180 − ${x} = ${180 - x}°.`);
      }
      if (t === 'point') {
        const a = int(60, 150), b = int(40, 140);
        return mc(`Three angles meet at a point. Two of them are <b>${a}°</b> and <b>${b}°</b>. What is the third?`, `${360 - a - b}°`, [`${180 - a - b > 0 ? 180 - a - b : 400 - a - b}°`, `${360 - a - b + 10}°`, `${a + b}°`, `${360 - a}°`], `Angles around a point add to 360°: 360 − ${a} − ${b} = ${360 - a - b}°.`);
      }
      if (t === 'tri') {
        const a = int(30, 80), b = int(30, 80);
        if (chance(0.3)) return mc(`An <b>isosceles</b> triangle has one angle of <b>${a * 2 > 180 ? 40 : a * 2}°</b> between its two equal sides. What size is each of the other two angles?`, `${(180 - (a * 2 > 180 ? 40 : a * 2)) / 2}°`, [`${180 - (a * 2 > 180 ? 40 : a * 2)}°`, `${a * 2 > 180 ? 40 : a * 2}°`, `${(180 - (a * 2 > 180 ? 40 : a * 2)) / 2 + 10}°`, `60°`], `Angles in a triangle add to 180°. The other two are equal, so (180 − ${a * 2 > 180 ? 40 : a * 2}) ÷ 2.`);
        return mc(`Two angles of a triangle are <b>${a}°</b> and <b>${b}°</b>. What is the third angle?`, `${180 - a - b}°`, [`${360 - a - b}°`, `${180 - a - b + 10}°`, `${90 - Math.min(a, b)}°`, `${a + b}°`], `Angles in a triangle add to 180°: 180 − ${a} − ${b} = ${180 - a - b}°.`);
      }
      if (t === 'triarea') {
        const b = int(2, 12) * 2, h = int(3, 12);
        return mc(`A triangle has a base of <b>${b} cm</b> and a height of <b>${h} cm</b>. What is its area?`, `${b * h / 2} cm²`, [`${b * h} cm²`, `${b + h} cm²`, `${b * h / 2 + h} cm²`, `${2 * (b + h)} cm²`], `Area of a triangle = ½ × base × height = ½ × ${b} × ${h} = ${b * h / 2} cm².`);
      }
      const l = int(2, 10), w = int(2, 8), h = int(2, 6);
      return mc(`A treasure chest is a cuboid <b>${l} cm × ${w} cm × ${h} cm</b>. What is its volume?`, `${l * w * h} cm³`, [`${l + w + h} cm³`, `${l * w} cm³`, `${2 * (l * w + w * h + l * h)} cm³`, `${l * w * h + l} cm³`], `Volume = length × width × height = ${l} × ${w} × ${h} = ${l * w * h} cm³.`);
    },
  });

  /* 9. Algebra & sequences */
  topics.push({
    id: 'm-alg', name: 'Algebra & Sequences', shrine: 'Dah Kaso Shrine', icon: '🧮',
    lesson: `<p>In algebra a <b>letter stands for a number</b> we don't know yet. 3n means 3 × n.</p>
      <p><b>Solve it by undoing:</b> 3n + 4 = 19 → take away 4: 3n = 15 → divide by 3: <b>n = 5</b>. Always check: 3 × 5 + 4 = 19 ✓.</p>
      <p><b>Sequences:</b> find the rule between neighbours. 5, 8, 11, 14… goes up by 3 each time. The <b>nth term</b> of this one is 3n + 2.</p>
      <p><b>Function machines:</b> to go backwards, do the opposite operations in the opposite order.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['box', 'seq', 'box'] : lv === 2 ? ['box', 'seq', 'machine', 'subst'] : ['solve', 'subst', 'nth', 'think', 'machineback', 'seq']);
      if (t === 'box') {
        const a = int(2, lv === 1 ? 20 : 12), b = int(2, lv === 1 ? 20 : 12);
        const op = pick(lv === 1 ? ['+', '-'] : ['+', '-', '×', '÷']);
        if (op === '+') return mc(`□ + ${a} = ${a + b}. What number goes in the box?`, b, [a + b + a, b + 1, b - 1, a], `Undo adding ${a} by subtracting: ${a + b} − ${a} = ${b}.`);
        if (op === '-') return mc(`□ − ${a} = ${b}. What number goes in the box?`, a + b, [b - a > 0 ? b - a : b + 2, a + b + 1, a + b - 1, b], `Undo subtracting by adding: ${b} + ${a} = ${a + b}.`);
        if (op === '×') return mc(`${a} × □ = ${a * b}. What number goes in the box?`, b, [b + 1, b - 1, a * b - a, a], `${a * b} ÷ ${a} = ${b}.`);
        return mc(`□ ÷ ${a} = ${b}. What number goes in the box?`, a * b, [a + b, a * b + a, a * b - b, b], `Undo dividing by multiplying: ${b} × ${a} = ${a * b}.`);
      }
      if (t === 'seq') {
        const start = int(1, 30), step = lv === 1 ? int(2, 10) : pick([int(3, 15), -int(3, 9)]);
        const geo = lv === 3 && chance(0.3);
        const seq = []; let x = geo ? int(1, 4) : start + (step < 0 ? 60 : 0);
        for (let i = 0; i < 5; i++) { seq.push(x); x = geo ? x * 2 : x + step; }
        const ans = seq.pop();
        return mc(`What comes next? <b>${seq.join(', ')}, ?</b>`, ans, geo ? [ans + seq[1], ans - 2, seq[3] + seq[2]] : [ans + step, ans + 1, ans - step * 2, ans - 1], geo ? `Each number doubles. ${seq[3]} × 2 = ${ans}.` : `The rule is ${step > 0 ? 'add' : 'subtract'} ${Math.abs(step)}. ${seq[3]} ${step > 0 ? '+' : '−'} ${Math.abs(step)} = ${ans}.`);
      }
      if (t === 'machine') {
        const m = int(2, 6), a = int(1, 9), n = int(2, 12);
        return mc(`A function machine does <b>× ${m}</b> then <b>+ ${a}</b>. What comes out if you put in <b>${n}</b>?`, n * m + a, [(n + a) * m, n * m, n + m + a, n * m - a], `${n} × ${m} = ${n * m}, then + ${a} = ${n * m + a}.`);
      }
      if (t === 'machineback') {
        const m = int(2, 6), a = int(1, 9), n = int(2, 12);
        return mc(`A function machine does <b>× ${m}</b> then <b>+ ${a}</b>. The output is <b>${n * m + a}</b>. What was the input?`, n, [(n * m + a) / m === n ? n + 1 : Math.round((n * m + a) / m), n * m, n + a, n * m + a - m], `Work backwards with opposite operations: ${n * m + a} − ${a} = ${n * m}, then ÷ ${m} = ${n}.`);
      }
      if (t === 'subst') {
        const p = int(2, 5), b = int(2, 9), a = int(Math.ceil((b + 1) / p), 9);
        const form = pick([[`${p}a + b`, p * a + b], [`a × b`, a * b], [`${p}a − b`, p * a - b], [`a + ${p}b`, a + p * b]]);
        return mc(`If <b>a = ${a}</b> and <b>b = ${b}</b>, what is <b>${form[0]}</b>?`, form[1], [form[1] + 1, a + b + p, form[1] + p, p * (a + b)], `Swap the letters for numbers: ${form[0].replace('a', `(${a})`).replace('b', `(${b})`)} = ${form[1]}.`);
      }
      if (t === 'solve') {
        const m = int(2, 9), n = int(2, 12), c = int(1, 20);
        return mc(`Solve: <b>${m}n + ${c} = ${m * n + c}</b>. What is n?`, n, [n + 1, n * m, (m * n + c) / m === n ? n - 1 : +((m * n + c) / m).toFixed(1), m * n], `Take away ${c}: ${m}n = ${m * n}. Divide by ${m}: n = ${n}.`);
      }
      if (t === 'nth') {
        const m = int(2, 7), c = int(1 - m, 8) || 1;
        const terms = [1, 2, 3, 4].map(i => m * i + c);
        const expr = `${m}n ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)}`;
        if (chance(0.5)) return mc(`What is the <b>nth term</b> of the sequence <b>${terms.join(', ')} …</b>?`, expr, [`n + ${m}`, `${m}n`, `${m + c}n`, `${c + m}n + ${m}`], `It goes up by ${m} each time so it starts "${m}n". ${m} × 1 = ${m}, and the first term is ${terms[0]}, so adjust by ${c}: ${expr}.`);
        const k = int(10, 30);
        return mc(`The nth term of a sequence is <b>${expr}</b>. What is the <b>${k}th</b> term?`, m * k + c, [m * k, m * (k + c), m * k + c + m, k + c], `Put n = ${k}: ${m} × ${k} ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${m * k + c}.`);
      }
      const n = int(4, 20), m = int(2, 5), a = int(2, Math.min(15, n * m - 1));
      return mc(`Zelda thinks of a number. She multiplies it by ${m}, then subtracts ${a}. The answer is <b>${n * m - a}</b>. What was her number?`, n, [n * m, n + 1, (n * m - a) / m === n ? n - 1 : Math.round((n * m - a) / m), n * m - a + m], `Work backwards: ${n * m - a} + ${a} = ${n * m}, then ÷ ${m} = ${n}.`);
    },
  });

  /* 10. Data, averages, ratio & problem solving */
  function barChart(labels, values, title) {
    const max = Math.max(...values), top = Math.ceil(max / 5) * 5 || 5;
    const W = 260, H = 160, x0 = 30, y0 = 140, bw = 180 / labels.length;
    let s = `<text class="lbl" x="${W / 2}" y="12" text-anchor="middle">${title}</text>`;
    for (let v = 0; v <= top; v += top / 5) { const y = y0 - (v / top) * 115; s += `<line x1="${x0}" x2="${x0 + 200}" y1="${y}" y2="${y}" class="grid"/><text class="lbl sm" x="${x0 - 4}" y="${y + 4}" text-anchor="end">${v}</text>`; }
    labels.forEach((l, i) => { const h = (values[i] / top) * 115; s += `<rect class="bar" x="${x0 + 10 + i * bw}" y="${y0 - h}" width="${bw - 14}" height="${h}"/><text class="lbl sm" x="${x0 + 10 + i * bw + (bw - 14) / 2}" y="${y0 + 14}" text-anchor="middle">${l}</text>`; });
    return svg(W, H + 2, s);
  }
  topics.push({
    id: 'm-data', name: 'Data, Averages & Ratio', shrine: 'Ka\'o Makagh Shrine', icon: '📊',
    lesson: `<p><b>Reading charts:</b> check the scale on the side — each line might be worth 2, 5 or 10!</p>
      <p><b>Mean (average):</b> add them all up, then divide by how many there are. Mean of 4, 6, 8 → 18 ÷ 3 = <b>6</b>.</p>
      <p><b>Ratio</b> compares parts. Red : blue = 2 : 3 means for every 2 red there are 3 blue. To share 20 in the ratio 2 : 3, there are 2 + 3 = 5 parts, so one part is 4 → <b>8 and 12</b>.</p>
      <p><b>Mode</b> = most common. <b>Range</b> = biggest − smallest. <b>Median</b> = middle value when in order.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['chart', 'chart', 'mode'] : lv === 2 ? ['chart', 'mean', 'ratio', 'range'] : ['mean', 'missingmean', 'share', 'median', 'multi', 'chart']);
      if (t === 'chart') {
        const labels = U.sample(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 4).sort((a, b) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(a) - ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(b));
        const step = lv === 1 ? 1 : 2; const values = labels.map(() => int(1, 10) * step);
        const vis = barChart(labels, values, 'Korok seeds found');
        const q = pick(['most', 'diff', 'total']);
        if (q === 'most' || new Set(values).size < 4) {
          const mi = values.indexOf(Math.max(...values));
          if (values.filter(v => v === values[mi]).length > 1) return this.gen(lv);
          return mc(`On which day were the <b>most</b> Korok seeds found?`, labels[mi], labels.filter((_, i) => i !== mi), `The tallest bar is ${labels[mi]} (${values[mi]} seeds).`, { visual: vis });
        }
        let [i, j] = U.sample([0, 1, 2, 3], 2); if (values[i] < values[j]) [i, j] = [j, i];
        if (q === 'diff') return mc(`How many <b>more</b> seeds were found on ${labels[i]} than on ${labels[j]}?`, values[i] - values[j], [values[i] + values[j], Math.abs(values[i] - values[j]) + step, values[i], values[j]], `${labels[i]}: ${values[i]}, ${labels[j]}: ${values[j]}. Difference: ${values[i]} − ${values[j]} = ${values[i] - values[j]}.`, { visual: vis });
        const tot = values.reduce((a, b) => a + b, 0);
        return mc(`How many seeds were found <b>altogether</b>?`, tot, [tot + step, tot - step, tot + 10, Math.max(...values) * 4], `Add every bar: ${values.join(' + ')} = ${tot}.`, { visual: vis });
      }
      if (t === 'mode') {
        const m = int(2, 9); const arr = shuffle([m, m, m, int(1, 9), int(1, 9), int(1, 9)].map((x, i) => (i > 2 && x === m ? x + 1 : x)));
        const counts = {}; arr.forEach(x => (counts[x] = (counts[x] || 0) + 1));
        const mode = +Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b));
        if (Object.values(counts).filter(c => c === counts[mode]).length > 1) return this.gen(lv);
        return mc(`What is the <b>mode</b> of: ${arr.join(', ')}?`, mode, [...new Set(arr)].filter(x => x !== mode).concat([arr.length]), `The mode is the number that appears most often: ${mode} appears ${counts[mode]} times.`);
      }
      if (t === 'range') {
        const arr = Array.from({ length: 5 }, () => int(3, 60)); const r = Math.max(...arr) - Math.min(...arr);
        return mc(`What is the <b>range</b> of: ${arr.join(', ')}?`, r, [Math.max(...arr), r + 1, arr.reduce((a, b) => a + b, 0) / 5 | 0, Math.max(...arr) + Math.min(...arr)], `Range = biggest − smallest = ${Math.max(...arr)} − ${Math.min(...arr)} = ${r}.`);
      }
      if (t === 'mean') {
        const k = lv === 2 ? 3 : int(4, 5); const mean = int(4, 20);
        const arr = Array.from({ length: k - 1 }, () => mean + int(-4, 4)); arr.push(mean * k - arr.reduce((a, b) => a + b, 0));
        if (arr.some(x => x <= 0)) return this.gen(lv);
        const sum = mean * k;
        return mc(`What is the <b>mean</b> of: ${arr.join(', ')}?`, mean, [sum, mean + 1, mean - 1, arr.slice().sort((a, b) => a - b)[Math.floor(k / 2)] === mean ? mean + 2 : arr.slice().sort((a, b) => a - b)[Math.floor(k / 2)]], `Add them: ${arr.join(' + ')} = ${sum}. Divide by ${k}: ${sum} ÷ ${k} = ${mean}.`);
      }
      if (t === 'median') {
        const arr = U.sample(Array.from({ length: 40 }, (_, i) => i + 1), 5); const sorted = arr.slice().sort((a, b) => a - b);
        return mc(`What is the <b>median</b> of: ${arr.join(', ')}?`, sorted[2], [arr[2], sorted[1], sorted[3], Math.round(arr.reduce((a, b) => a + b) / 5)], `Put them in order: ${sorted.join(', ')}. The middle one is ${sorted[2]}.`);
      }
      if (t === 'missingmean') {
        const mean = int(5, 15), k = 4; const arr = [mean + int(-3, 3), mean + int(-3, 3), mean + int(-3, 3)];
        const missing = mean * k - arr.reduce((a, b) => a + b, 0);
        if (missing <= 0) return this.gen(lv);
        return mc(`The mean of four numbers is <b>${mean}</b>. Three of them are ${arr.join(', ')}. What is the fourth?`, missing, [mean, missing + 1, mean * 3 - arr[0], missing + k], `Total = mean × how many = ${mean} × 4 = ${mean * 4}. ${mean * 4} − ${arr.reduce((a, b) => a + b)} = ${missing}.`);
      }
      if (t === 'ratio') {
        const a = int(1, 4), b = int(2, 5), k = int(2, 6);
        return mc(`In a stable, for every <b>${a}</b> brown horse${a > 1 ? 's' : ''} there ${b > 1 ? 'are' : 'is'} <b>${b}</b> white horses. There are <b>${a * k}</b> brown horses. How many white horses are there?`, b * k, [a * k + b, b * k + 1, a * b * k, (a + b) * k], `The ratio ${a} : ${b} has been multiplied by ${k} (${a} × ${k} = ${a * k}), so white = ${b} × ${k} = ${b * k}.`);
      }
      if (t === 'share') {
        const a = int(1, 5), b = int(2, 6), k = int(3, 12); const tot = (a + b) * k;
        return mc(`Link and Zelda share <b>${tot} rupees</b> in the ratio <b>${a} : ${b}</b>. How many rupees does Zelda get?`, b * k, [a * k, tot / 2, b * k + k, tot - b], `${a} + ${b} = ${a + b} parts. One part = ${tot} ÷ ${a + b} = ${k}. Zelda gets ${b} parts = ${b * k}.`);
      }
      // multi-step
      const p1 = int(12, 45), q1 = int(2, 5), p2 = int(8, 30), q2 = int(2, 4), paid = 500;
      const cost = p1 * q1 + p2 * q2;
      return mc(`Link buys <b>${q1}</b> apples at <b>${p1}p</b> each and <b>${q2}</b> mushrooms at <b>${p2}p</b> each. He pays with a <b>£5</b> note. How much change does he get?`, money(paid - cost), [money(cost), money(paid - cost - 10), money(paid - p1 - p2), money(paid - cost + p2)], `${q1} × ${p1}p = ${p1 * q1}p and ${q2} × ${p2}p = ${p2 * q2}p. Total ${money(cost)}. Change: £5.00 − ${money(cost)} = ${money(paid - cost)}.`);
    },
  });

  /* ---------------- Extra question types mixed into each topic ---------------- */
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const words99 = n => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
  const words999 = n => { const h = Math.floor(n / 100), r = n % 100; return [h ? ONES[h] + ' hundred' : '', r ? (h ? 'and ' : '') + words99(r) : ''].filter(Boolean).join(' '); };
  const inWords = n => { const th = Math.floor(n / 1000), r = n % 1000; return [th ? words999(th) + ' thousand' : '', r ? (th && r < 100 ? 'and ' : '') + words999(r) : ''].filter(Boolean).join(' ') || 'zero'; };
  const dp = (x, k = 3) => +x.toFixed(k);
  const EXTRA = {
    'm-place'(lv) {
      const t = pick(lv === 1 ? ['words', 'neg'] : lv === 2 ? ['words', 'neg', 'decval'] : ['decval', 'neg']);
      if (t === 'words') {
        const n = lv === 1 ? int(101, 9999) : int(10001, 99999); const w = inWords(n);
        const s = String(n); const swap = +(s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1));
        return mc(`Which number is <b>${w}</b>?`, n, [swap, n + 100 * (n % 1000 < 900 ? 1 : -1), +String(n).replace(/0/g, '') || n + 1, n * 10], `Read it in parts: ${w} = ${fmt(n)}.`);
      }
      if (t === 'neg') {
        const set = shuffle([-int(1, 15), -int(16, 30), int(0, 9), -int(1, 9) * 2]); if (new Set(set).size < 4) return null;
        const small = Math.min(...set);
        return mc(`Which number is the <b>smallest</b>?`, small, set.filter(x => x !== small), `On a number line, numbers further left are smaller. ${small} is the furthest left.`);
      }
      const n = int(1001, 99999) / 1000; const s = n.toFixed(3); const k = int(1, 3); const d = +s.split('.')[1][k - 1]; if (!d) return null;
      const val = dp(d / 10 ** k);
      return mc(`What is the value of the digit <b>${d}</b> in <b>${s}</b>?`, val, [dp(d / 10 ** (k + 1), 4), dp(d / 10 ** (k - 1)), d], `It is in the ${['tenths', 'hundredths', 'thousandths'][k - 1]} column, so it is worth ${val}.`);
    },
    'm-addsub'(lv) {
      const t = pick(lv === 1 ? ['money', 'inverse'] : ['money', 'estimate', 'inverse']);
      if (t === 'money') { const a = int(45, lv === 1 ? 299 : 899), b = int(45, lv === 1 ? 299 : 899); return mc(`A bow costs <b>${money(a)}</b> and a quiver costs <b>${money(b)}</b>. How much do they cost altogether?`, money(a + b), [money(a + b + 10), money(a + b - 10), money(Math.abs(a - b) || 5), money(a + b + 100)], `${money(a)} + ${money(b)} = ${money(a + b)}.`); }
      if (t === 'inverse') { const a = int(12, lv === 1 ? 60 : 600), b = int(12, lv === 1 ? 60 : 600); return mc(`If <b>${a} + ${b} = ${a + b}</b>, what is <b>${a + b} − ${b}</b>?`, a, [b, a + 1, a + b + b, a - 10].filter(x => x > 0), `Subtraction undoes addition, so ${a + b} − ${b} = ${a}.`); }
      const a = int(11, 89) * 10 + int(1, 9) * (chance(0.5) ? 1 : -1), b = int(11, 89) * 10 + int(1, 9) * (chance(0.5) ? 1 : -1);
      const est = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
      return mc(`Which is the <b>best estimate</b> of <b>${a} + ${b}</b>?`, est, [est + 100, est - 100, est + 200, est + 1000].filter(x => x > 0), `Round each to the nearest hundred: ${Math.round(a / 100) * 100} + ${Math.round(b / 100) * 100} = ${est}.`);
    },
    'm-mult'(lv) {
      if (lv === 1) {
        const n = int(11, 49) * (chance(0.5) ? 2 : 1);
        if (chance(0.5)) return mc(`What is <b>double ${n}</b>?`, n * 2, [n + 2, n * 2 + 10, n * 2 - 10, n * 2 + 1], `Double means × 2: ${n} + ${n} = ${n * 2}.`);
        const e = n % 2 ? n + 1 : n; return mc(`What is <b>half of ${e}</b>?`, e / 2, [e / 2 + 1, e - 2, e / 2 + 10, e * 2], `Half means ÷ 2: ${e} ÷ 2 = ${e / 2}.`);
      }
      if (lv === 3 && chance(0.4)) { const a = pick([4, 6, 8, 9, 10, 12]), b = pick([3, 5, 6, 8, 9, 15]); if (a === b) return null; const l = U.lcm(a, b); return mc(`What is the <b>smallest</b> number that is a multiple of both <b>${a}</b> and <b>${b}</b>?`, l, [a * b === l ? l + a : a * b, l + a, l - b > 0 ? l - b : l + b, Math.max(a, b)], `List the multiples of ${Math.max(a, b)} and find the first one that ${Math.min(a, b)} also goes into: <b>${l}</b>.`); }
      const a = int(3, 9), b = int(3, 9), c = int(2, Math.min(6, a * b - 1));
      const f = pick([[`${a} + ${b} × ${c}`, a + b * c, (a + b) * c], [`(${a} + ${b}) × ${c}`, (a + b) * c, a + b * c], [`${a * c} ÷ ${c} + ${b}`, a + b, a * c / (c + b)], [`${a} × ${b} − ${c}`, a * b - c, a * (b - c)]]);
      return mc(`What is <b>${f[0]}</b>?`, f[1], [f[2], f[1] + 1, f[1] + c, f[1] - 1].filter(x => Number.isInteger(x) && x >= 0), `Remember BIDMAS: Brackets first, then × and ÷, then + and −. ${f[0]} = <b>${f[1]}</b>.`);
    },
    'm-div'(lv) {
      if (lv === 1) { const k = int(3, 6), n = k * int(3, 9) + int(1, k - 1); return mc(`<b>${n}</b> sweets are shared equally between <b>${k}</b> children. How many sweets are <b>left over</b>?`, n % k, [Math.floor(n / k), n % k + 1, k, 0].filter(x => x !== n % k || true), `${k} × ${Math.floor(n / k)} = ${k * Math.floor(n / k)}. ${n} − ${k * Math.floor(n / k)} = ${n % k} left over.`); }
      const d = pick([3, 4, 5, 6, 9]); const rule = { 3: 'its digits add up to a multiple of 3', 4: 'its last two digits make a multiple of 4', 5: 'it ends in 0 or 5', 6: 'it is even and its digits add up to a multiple of 3', 9: 'its digits add up to a multiple of 9' }[d];
      const yes = d * int(12, lv === 2 ? 99 : 999); const nos = [yes + 1, yes + 2, yes - 1, yes + d + 1, yes + 2 * d - 1].filter(x => x % d);
      return mc(`Which number can be divided <b>exactly by ${d}</b>?`, yes, nos, `A number divides exactly by ${d} if ${rule}. ${yes} ÷ ${d} = ${yes / d}.`);
    },
    'm-frac'(lv) {
      if (lv === 1) {
        const n = pick([4, 5, 6, 8, 10]), r = int(1, n - 1);
        const row = shuffle(Array.from({ length: n }, (_, i) => (i < r ? '🍎' : '🍏'))).join(' ');
        return mc(`What fraction of these apples are <b>red</b>?`, fracTxt(r, n), [fracTxt(n - r, n), fracTxt(r, n - r), fracTxt(r, n + 1), `${n}/${r}`], `${r} out of ${n} apples are red, so ${r}/${n}.`, { visual: `<div class="emoji-row">${row}</div>` });
      }
      const ds = U.sample([2, 3, 4, 5, 6, 8, 10, 12], 4); const big = chance(0.5);
      const target = big ? Math.min(...ds) : Math.max(...ds);
      return mc(`Which fraction is the <b>${big ? 'largest' : 'smallest'}</b>?`, fracTxt(1, target), ds.filter(d => d !== target).map(d => fracTxt(1, d)), `With unit fractions, the <b>bigger</b> the bottom number, the <b>smaller</b> each piece. So 1/${target} is the ${big ? 'largest' : 'smallest'}.`);
    },
    'm-dec'(lv) {
      if (lv === 1) { const p = int(2, 9) * 10 + int(0, 1) * 5; const coin = pick([10, 20, 50]); const tot = coin * int(3, 12); return mc(`How many <b>${coin}p</b> coins make <b>${money(tot)}</b>?`, tot / coin, [tot / coin + 1, tot / coin - 1, tot / 10, coin].filter(x => x !== p), `${money(tot)} = ${tot}p. ${tot} ÷ ${coin} = ${tot / coin}.`); }
      const x = int(11, 999) / 100; const op = pick([['× 10', 10], ['× 100', 100], ['÷ 10', 0.1], ['÷ 100', 0.01]]);
      const ans = dp(x * op[1], 4);
      if (lv === 3 && chance(0.4)) { const f = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]); const n = int(2, 20) * 10; return mc(`What is <b>${f}</b> of <b>${n}</b>?`, dp(f * n), [dp(f * n * 10), dp(n / f / 10), dp(n - f * n), dp(f * n + 1)], `${f} = ${Math.round(f * 10)}/10. One tenth of ${n} is ${n / 10}, so ${Math.round(f * 10)} tenths is ${dp(f * n)}.`); }
      return mc(`What is <b>${x} ${op[0]}</b>?`, ans, [dp(ans * 10, 4), dp(ans / 10, 5), dp(x + (op[1] >= 10 ? op[1] : 0), 4), dp(x * (op[1] >= 10 ? 1 / op[1] : 1 / op[1]), 4)], `${op[0].startsWith('×') ? 'Multiplying' : 'Dividing'} by ${op[0].slice(2)} moves the digits ${op[0].slice(2).length - 1} place${op[0].slice(2) === '10' ? '' : 's'} to the ${op[0].startsWith('×') ? 'left' : 'right'}: <b>${ans}</b>.`);
    },
    'm-meas'(lv) {
      const MONTHS = [['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30], ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31]];
      const t = pick(lv === 1 ? ['weeks', 'month', 'later'] : ['weeks', 'later', 'jug', 'month']);
      if (t === 'weeks') { const w = int(2, lv === 1 ? 5 : 12); return mc(`How many days are there in <b>${w} weeks</b>?`, w * 7, [w * 7 + 1, w * 5, w * 7 - 7, w + 7], `There are 7 days in a week: ${w} × 7 = ${w * 7}.`); }
      if (t === 'month') { const m = pick(MONTHS.filter(x => x[0] !== 'February')); return mc(`How many days are there in <b>${m[0]}</b>?`, m[1], [m[1] === 31 ? 30 : 31, 28, 29], `"30 days has September, April, June and November. All the rest have 31, except February…" ${m[0]} has ${m[1]} days.`); }
      if (t === 'later') { const i = int(0, 11), n = int(2, lv === 1 ? 5 : 11); const ans = MONTHS[(i + n) % 12][0]; return mc(`Which month comes <b>${n} months after ${MONTHS[i][0]}</b>?`, ans, [MONTHS[(i + n + 1) % 12][0], MONTHS[(i + n + 11) % 12][0], MONTHS[(i + 12 - n) % 12][0]], `Count on ${n} months from ${MONTHS[i][0]}: ${ans}.`); }
      const L = int(1, 4), g = pick([100, 200, 250, 500]); return mc(`A jug holds <b>${L} litre${L > 1 ? 's' : ''}</b>. How many <b>${g} ml</b> glasses can it fill?`, (L * 1000) / g, [(L * 1000) / g + 1, L * g / 100, (L * 100) / g, (L * 1000) / g * 2].filter(x => Number.isInteger(x)), `${L} litre${L > 1 ? 's' : ''} = ${L * 1000} ml. ${L * 1000} ÷ ${g} = ${(L * 1000) / g}.`);
    },
    'm-shape'(lv) {
      const t = pick(lv === 1 ? ['angletype', 'sym'] : lv === 2 ? ['coord', 'sym', 'quad', 'angletype'] : ['coord', 'translate', 'quad']);
      if (t === 'angletype') { const a = pick([int(10, 85), 90, int(95, 175), int(185, 350)]); const ty = a < 90 ? 'acute' : a === 90 ? 'a right angle' : a < 180 ? 'obtuse' : 'reflex'; return mc(`An angle of <b>${a}°</b> is…`, ty, ['acute', 'a right angle', 'obtuse', 'reflex'].filter(x => x !== ty), `Acute < 90°, right angle = 90°, obtuse is between 90° and 180°, reflex is more than 180°. So ${a}° is ${ty}.`); }
      if (t === 'sym') { const s = pick([['a square', 4], ['a rectangle', 2], ['an equilateral triangle', 3], ['a regular pentagon', 5], ['a regular hexagon', 6], ['a circle', 'infinitely many'], ['an isosceles triangle', 1]]); return mc(`How many <b>lines of symmetry</b> does ${s[1] === 'infinitely many' ? 'a circle' : s[0]} have?`, s[1], ['infinitely many', 1, 2, 3, 4, 5, 6, 0].filter(x => x !== s[1]).slice(0, 5), `${U.cap(s[0])} has ${s[1]} line${s[1] === 1 ? '' : 's'} of symmetry. Try folding it in your head!`); }
      if (t === 'quad') { const q = pick([['four equal sides and four right angles', 'square'], ['four right angles but only opposite sides equal', 'rectangle'], ['four equal sides but no right angles', 'rhombus'], ['exactly one pair of parallel sides', 'trapezium'], ['two pairs of parallel sides but no right angles and sides not all equal', 'parallelogram'], ['two pairs of equal adjacent sides and one line of symmetry', 'kite']]); return mc(`Which quadrilateral has <b>${q[0]}</b>?`, q[1], ['square', 'rectangle', 'rhombus', 'trapezium', 'parallelogram', 'kite'].filter(x => x !== q[1]), `A ${q[1]} has ${q[0]}.`); }
      const x = int(1, 7), y = int(1, 6);
      const grid = (px, py, lbl) => { let g = ''; for (let i = 0; i <= 8; i++) g += `<line x1="${20 + i * 22}" y1="10" x2="${20 + i * 22}" y2="${10 + 7 * 22}" class="grid"/>`; for (let j = 0; j <= 7; j++) g += `<line x1="20" y1="${10 + j * 22}" x2="${20 + 8 * 22}" y2="${10 + j * 22}" class="grid"/>`; for (let i = 0; i <= 8; i++) g += `<text class="lbl sm" x="${20 + i * 22}" y="${10 + 7 * 22 + 13}" text-anchor="middle">${i}</text>`; for (let j = 1; j <= 7; j++) g += `<text class="lbl sm" x="12" y="${10 + (7 - j) * 22 + 4}" text-anchor="middle">${j}</text>`; return g + `<circle cx="${20 + px * 22}" cy="${10 + (7 - py) * 22}" r="5" class="bar"/><text class="lbl" x="${20 + px * 22 + 7}" y="${10 + (7 - py) * 22 - 6}">${lbl}</text>`; };
      if (t === 'coord') return mc(`What are the <b>coordinates</b> of point A?`, `(${x}, ${y})`, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y - 1})`, `(${x - 1}, ${y + 1})`], `Go <b>along</b> the x-axis first (${x}), then <b>up</b> the y-axis (${y}): (${x}, ${y}). "Along the corridor, then up the stairs!"`, { visual: U.svg(210, 185, grid(x, y, 'A')) });
      const dx = int(1, 4) * (chance(0.5) ? 1 : -1), dy = int(1, 3) * (chance(0.5) ? 1 : -1);
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0) return null;
      return mc(`Point <b>(${x}, ${y})</b> moves <b>${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}</b> and <b>${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}</b>. Where does it end up?`, `(${nx}, ${ny})`, [`(${x + dy}, ${y + dx})`, `(${x - dx}, ${y + dy})`, `(${nx}, ${y - dy})`, `(${ny}, ${nx})`], `Left/right changes the first number: ${x} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${nx}. Up/down changes the second: ${y} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${ny}.`);
    },
    'm-alg'(lv) {
      if (lv === 1) { const s = int(2, 10), k = int(2, 9); const seq = [0, 1, 2, 3, 4].map(i => s + i * k); const gap = int(1, 3); const ans = seq[gap]; return mc(`What is the missing number? <b>${seq.map((v, i) => (i === gap ? '?' : v)).join(', ')}</b>`, ans, [ans + 1, ans - 1, ans + k, seq[gap - 1] + 1], `The numbers go up in ${k}s, so the missing number is ${seq[gap - 1]} + ${k} = ${ans}.`); }
      if (lv === 2) { const m = int(2, 5), y = m * int(2, 9), c = int(1, 9); return mc(`If <b>y ÷ ${m} + ${c} = ${y / m + c}</b>, what is y?`, y, [y / m, y + c, (y / m + c) * m, y - m].filter(v => v !== y || true), `Take away ${c}: y ÷ ${m} = ${y / m}. Multiply by ${m}: y = ${y}.`); }
      const a = int(5, 20), b = int(1, a - 1);
      return mc(`Two numbers add up to <b>${a + b}</b>. Their difference is <b>${a - b}</b>. What is the <b>larger</b> number?`, a, [b, a + b, a - b, a + 1], `Add the total and the difference, then halve: (${a + b} + ${a - b}) ÷ 2 = ${a}. Check: ${a} + ${b} = ${a + b} and ${a} − ${b} = ${a - b}.`);
    },
    'm-data'(lv) {
      if (lv === 1) {
        const key = pick([2, 4, 5]); const names = U.sample(['Link', 'Zelda', 'Paya', 'Sidon'], 3); const vals = names.map(() => int(1, 5));
        const tbl = `<table class="qtable"><tr><th>Name</th><th>Apples eaten</th></tr>${names.map((n, i) => `<tr><td>${n}</td><td>${'🍎'.repeat(vals[i])}</td></tr>`).join('')}</table><p class="key">Key: 🍎 = ${key} apples</p>`;
        const i = int(0, 2);
        return mc(`Use the pictogram. How many apples did <b>${names[i]}</b> eat?`, vals[i] * key, [vals[i], vals[i] * key + key, vals[i] + key, (vals[i] - 1) * key].filter(x => x > 0), `${names[i]} has ${vals[i]} apple symbols. Each is worth ${key}: ${vals[i]} × ${key} = ${vals[i] * key}.`, { visual: tbl });
      }
      const red = int(0, 10), blue = int(0, 10); if (red + blue === 0) return null; const tot = red + blue;
      const p = red / tot; const word = p === 0 ? 'impossible' : p === 1 ? 'certain' : p === 0.5 ? 'an even chance' : p < 0.5 ? 'unlikely' : 'likely';
      return mc(`A bag has <b>${red} red</b> and <b>${blue} blue</b> marbles. Picking a <b>red</b> marble without looking is…`, word, ['impossible', 'unlikely', 'an even chance', 'likely', 'certain'].filter(x => x !== word), `${red} out of ${tot} marbles are red, so it is ${word}.`);
    },
  };
  topics.forEach(t => {
    const base = t.gen;
    if (EXTRA[t.id]) t.gen = function (lv) { if (chance(0.35)) { const q = EXTRA[t.id](lv); if (q) return q; } return base.call(this, lv); };
  });

  window.CONTENT = window.CONTENT || {};
  window.CONTENT.maths = topics;
})();
