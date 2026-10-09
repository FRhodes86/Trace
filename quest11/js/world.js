// Side content: shop, bag, cooking, horses (taming, stable, racing), mini-games, house, side quests, Great Fairy.
// Fun activities run on Adventure Tickets and ingredients, which are earned in the shrines, so play always leads back to learning.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const S = () => State.s;
  const K = CATALOG;
  const UI = () => Game.ui;
  const IC = ART.icons;
  const today = () => new Date().toISOString().slice(0, 10);
  const ING = id => K.INGREDIENTS.find(x => x.id === id) || K.MATERIALS.find(x => x.id === id);
  const fmt = n => n.toLocaleString('en-GB');
  const price = n => `${IC.rupee('green')} ${fmt(n)}`;
  const back = (label = '◀ Map', fn) => `<button class="btn ghost" id="back">${label}</button>`;

  function applyTheme() {
    const t = K.THEMES.find(x => x.id === S().theme) || K.THEMES[0];
    document.documentElement.style.setProperty('--rune', t.color);
    const g = K.GLIDERS.find(x => x.id === S().glider) || K.GLIDERS[0];
    document.documentElement.style.setProperty('--glider-hue', g.hue + 'deg');
  }

  /* ---------------- rewards & drops ---------------- */
  function addIng(id, n = 1) { const s = S(); const bag = K.MATERIALS.some(m => m.id === id) ? s.materials : s.ingredients; bag[id] = (bag[id] || 0) + n; }
  function spend(n) { S().rupees -= n; State.count('spent', n); }
  // shrine/boss win drops: ingredients from the region, a part from the monster, and tickets
  function trialDrops(regionKey, foeName, lv, isBoss) {
    const s = S(); const loot = [];
    const pool = K.REGION_DROPS[regionKey] || K.REGION_DROPS.plateau;
    let n = (isBoss ? 4 : 1 + Math.floor(Math.random() * 2) + (lv >= 3 ? 1 : 0)) + State.perk().drops;
    if (s.lucky > 0) { n *= 2; s.lucky--; }
    const got = {};
    for (let i = 0; i < n; i++) { const id = U.pick(pool); got[id] = (got[id] || 0) + 1; }
    const part = Object.keys(K.FOE_DROPS).find(k => (foeName || '').includes(k));
    if (part) got[K.FOE_DROPS[part]] = (got[K.FOE_DROPS[part]] || 0) + (isBoss ? 2 : 1);
    for (const [id, c] of Object.entries(got)) { addIng(id, c); const I = ING(id); loot.push({ icon: `<span class="emo">${I.emoji}</span>`, label: `${I.name}${c > 1 ? ' ×' + c : ''}` }); }
    const t = isBoss ? 3 : 1 + (lv >= 3 ? 1 : 0); s.tickets += t; loot.push({ icon: '<span class="emo">🎫</span>', label: `${t} Adventure Ticket${t > 1 ? 's' : ''}` });
    State.save(); return loot;
  }
  // apply a quest/reward object; returns a list of item-get steps
  function grant(r) {
    const s = S(); const steps = [];
    if (r.rupees) { s.rupees += r.rupees; steps.push(n => FX.itemGet(IC.rupee(r.rupees >= 500 ? 'gold' : r.rupees >= 200 ? 'purple' : 'red'), `${fmt(r.rupees)} rupees!`, '', n)); }
    if (r.tickets) { s.tickets += r.tickets; steps.push(n => FX.itemGet('<span class="emo big">🎫</span>', `${r.tickets} Adventure Tickets!`, 'Spend them on mini-games and horse races.', n)); }
    if (r.ingredient) for (const [id, c] of Object.entries(r.ingredient)) { addIng(id, c); const I = ING(id); steps.push(n => FX.itemGet(`<span class="emo big">${I.emoji}</span>`, `${I.name} ×${c}`, '', n)); }
    if (r.item) for (const [id, c] of Object.entries(r.item)) { s.items[id] = (s.items[id] || 0) + c; const I = K.ITEMS.find(x => x.id === id); steps.push(n => FX.itemGet(`<span class="emo big">${I.emoji}</span>`, `${I.name} ×${c}`, I.desc, n)); }
    if (r.armour) { if (!s.ownedArmour.includes(r.armour)) s.ownedArmour.push(r.armour); const A = K.ARMOUR.find(x => x.id === r.armour); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `You got the ${A.name}!`, A.desc + ' Equip it in Beedle\'s shop.', n)); }
    if (r.saddle) { if (!s.ownedSaddles.includes(r.saddle)) s.ownedSaddles.push(r.saddle); const A = K.SADDLES.find(x => x.id === r.saddle); steps.push(n => FX.itemGet('<span class="emo big">🐎</span>', `You got the ${A.name}!`, 'Put it on a horse at the stable.', n)); }
    if (r.pet) { if (!s.ownedPets.includes(r.pet)) s.ownedPets.push(r.pet); const A = K.PETS.find(x => x.id === r.pet); steps.push(n => FX.itemGet(`<div class="pet-get">${ART.pet(r.pet)}</div>`, `New companion: ${A.name}!`, (A.desc || '') + ' Choose companions in the shop\'s Style tab.', n)); }
    if (r.theme) { if (!s.ownedThemes.includes(r.theme)) s.ownedThemes.push(r.theme); const A = K.THEMES.find(x => x.id === r.theme); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `New Sheikah Slate colour: ${A.name}!`, 'Choose it in the shop\'s Style tab.', n)); }
    if (r.decor) { if (!s.house.decor.includes(r.decor)) s.house.decor.push(r.decor); const A = K.DECOR.find(x => x.id === r.decor); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `${A.name} for your house!`, s.house.owned ? '' : 'It will appear once you own the Hateno house.', n)); }
    State.save(); return steps;
  }

  /* ---------------- SHOP ---------------- */
  const SHOP_TABS = [['items', '🧪 Items'], ['food', '🍎 Food'], ['weapons', '⚔️ Weapons'], ['shields', '🛡️ Shields'], ['armour', '👕 Armour'], ['style', '✨ Style'], ['horse', '🐎 Horse gear'], ['sell', '💰 Sell']];
  function shop(tab = 'items') {
    const s = S(); const { screen, hud, on, toast, heroArt } = UI();
    const can = p => s.rupees >= p;
    const buyBtn = (kind, id, p) => `<button class="btn small ${can(p) ? 'primary' : ''}" data-buy="${id}" data-kind="${kind}" ${can(p) ? '' : 'disabled'}>${price(p)}</button>`;
    const row = (emo, name, desc, right, cls = '') => `<div class="shop-row slate ${cls}"><span class="si">${emo}</span><div><b>${name}</b><p class="muted">${desc}</p></div>${right}</div>`;
    const gearRow = (list, kind, ownedKey, eqKey, descFn) => list.map(it => {
      const owned = s[ownedKey].includes(it.id), eq = s[eqKey] === it.id;
      const right = eq ? '<span class="tag ok">Equipped</span>' : owned ? `<button class="btn small" data-equip="${it.id}" data-kind="${eqKey}">Equip</button>` : it.price === null ? `<span class="muted small-note">${it.quest ? '📜 Side-quest reward' : 'Not for sale'}</span>` : buyBtn(kind, it.id, it.price);
      return row(it.emoji, it.name, descFn(it), right, it.price >= 5000 ? 'legend' : '');
    }).join('');
    let body = '';
    if (tab === 'items') body = K.ITEMS.map(it => row(it.emoji, it.name, it.desc, `<span class="muted">Have ${it.id === 'ticket' ? s.tickets : s.items[it.id] || 0}</span>${buyBtn('item', it.id, it.price)}`)).join('');
    if (tab === 'food') body = K.INGREDIENTS.filter(i => i.price).map(it => row(it.emoji, it.name, `Cooking ingredient. Rarer ones drop from shrines in each region.`, `<span class="muted">Have ${s.ingredients[it.id] || 0}</span>${buyBtn('food', it.id, it.price)}`)).join('');
    if (tab === 'weapons') body = gearRow(K.WEAPONS, 'weapon', 'ownedWeapons', 'weapon', w => `Boss damage ${w.dmg}. ${w.desc || ''}`);
    if (tab === 'shields') body = gearRow(K.SHIELDS, 'shield', 'ownedShields', 'shield', w => w.desc || (w.blocks ? `Blocks ${w.blocks} hit${w.blocks > 1 ? 's' : ''} in every boss battle.` : 'Better than nothing!'));
    if (tab === 'armour') body = gearRow(K.ARMOUR, 'armour', 'ownedArmour', 'armour', a => `${a.desc}${s.fairy.levels[a.id] ? ` <b class="stars">${'★'.repeat(s.fairy.levels[a.id])}</b>` : ''}`);
    if (tab === 'style') body = '<h3>Sheikah Slate colour</h3>' + gearRow(K.THEMES, 'theme', 'ownedThemes', 'theme', () => 'Changes the glow colour of the whole game.')
      + '<h3>Battle companion</h3>' + gearRow(K.PETS, 'pet', 'ownedPets', 'pet', p => p.desc || 'Fight on your own.')
      + '<h3>Paraglider fabric</h3>' + gearRow(K.GLIDERS.map(g => ({ ...g, emoji: `<span class="glider-sw">${ART.glider(g.id, false)}</span>` })), 'glider', 'ownedGliders', 'glider', () => 'Shows when you fly across the map.');
    if (tab === 'horse') body = K.SADDLES.map(sd => row(`<span class="saddle-sw" style="background:${sd.color}"></span>`, sd.name, 'A saddle for your horses. Choose it at the stable.', s.ownedSaddles.includes(sd.id) ? '<span class="tag ok">Owned</span>' : buyBtn('saddle', sd.id, sd.price))).join('')
      + K.INGREDIENTS.filter(i => i.id === 'carrot' || i.id === 'apple').map(it => row(it.emoji, it.name, 'Horses love these! Feed them at the stable.', `<span class="muted">Have ${s.ingredients[it.id] || 0}</span>${buyBtn('food', it.id, it.price)}`)).join('');
    if (tab === 'sell') {
      const sellRows = [];
      for (const [k, c] of Object.entries(s.meals)) if (c > 0) { const m = mealInfo(k); sellRows.push(row(m.emoji, `${m.name} ×${c}`, m.effect ? K.EFFECTS[m.effect].desc : 'A tasty meal.', `<button class="btn small" data-sell="meal:${k}">Sell for ${price(m.value)}</button>`)); }
      for (const m of K.MATERIALS) if (s.materials[m.id]) sellRows.push(row(m.emoji, `${m.name} ×${s.materials[m.id]}`, 'Monster part. The Great Fairy uses these to upgrade armour.', `<button class="btn small" data-sell="mat:${m.id}">Sell for ${price(m.value)}</button>`));
      if (s.items.goldnugget) sellRows.push(row('🪙', `Gold Nugget ×${s.items.goldnugget}`, 'Shiny!', `<button class="btn small" data-sell="gold:goldnugget">Sell for ${price(300)}</button>`));
      body = sellRows.join('') || '<p class="muted center">Nothing to sell yet. Cook meals or collect monster parts in the shrines!</p>';
    }
    screen(`${hud()}<div class="page">
      <div class="page-head">${back()}<h2>Beedle's Shop</h2></div>
      <div class="shop-top"><div class="npc-stand">${ART.beedle()}</div><div class="mirror">${heroArt()}<small>Your gear</small></div><p class="intro slate">"Thank you! Please come again! …Oh, you haven't bought anything yet. Take a look!"</p></div>
      <div class="tabs">${SHOP_TABS.map(([t, l]) => `<button class="tab ${t === tab ? 'on' : ''}" data-tab="${t}">${l}</button>`).join('')}</div>
      <div class="shop">${body}</div></div>`, 'plateau', 'field');
    on('#back', Game.map);
    on('[data-tab]', (e, el) => shop(el.dataset.tab));
    on('[data-buy]', (e, el) => {
      const kind = el.dataset.kind, id = el.dataset.buy;
      const lists = { item: K.ITEMS, food: K.INGREDIENTS, weapon: K.WEAPONS, shield: K.SHIELDS, armour: K.ARMOUR, theme: K.THEMES, pet: K.PETS, glider: K.GLIDERS, saddle: K.SADDLES };
      const it = lists[kind].find(x => x.id === id); if (!it || !can(it.price)) return;
      spend(it.price); U.sfx.coin(); FX.flyTo(el, '#hud-rupees', IC.rupee('green'));
      if (kind === 'item') { if (id === 'ticket') s.tickets++; else if (id === 'luckycharm') { s.lucky += 3; } else s.items[id] = (s.items[id] || 0) + 1; State.save(); toast(`Bought ${it.emoji} ${it.name}!`, 'good'); return shop(tab); }
      if (kind === 'food') { addIng(id); State.save(); toast(`Bought ${it.emoji} ${it.name}!`, 'good'); return shop(tab); }
      const own = { weapon: 'ownedWeapons', shield: 'ownedShields', armour: 'ownedArmour', theme: 'ownedThemes', pet: 'ownedPets', glider: 'ownedGliders', saddle: 'ownedSaddles' }[kind];
      s[own].push(id); if (kind !== 'saddle') s[kind] = id; State.save(); applyTheme();
      FX.itemGet(kind === 'pet' ? `<div class="pet-get">${ART.pet(id)}</div>` : kind === 'glider' ? `<div class="pet-get wide">${ART.glider(id)}</div>` : kind === 'saddle' ? '<span class="emo big">🐎</span>' : `<span class="emo big">${it.emoji}</span>`, `You got the ${it.name}!`, it.desc || (it.dmg ? `Boss damage: ${it.dmg}` : it.blocks ? `Blocks ${it.blocks} hit${it.blocks > 1 ? 's' : ''} per boss battle.` : ''), () => shop(tab));
    });
    on('[data-equip]', (e, el) => { s[el.dataset.kind] = el.dataset.equip; State.save(); applyTheme(); shop(tab); });
    on('[data-sell]', (e, el) => {
      const [k, id] = el.dataset.sell.split(':');
      if (k === 'meal') { const m = mealInfo(id); s.meals[id]--; if (!s.meals[id]) delete s.meals[id]; s.rupees += m.value; }
      if (k === 'mat') { s.materials[id]--; if (!s.materials[id]) delete s.materials[id]; s.rupees += ING(id).value; }
      if (k === 'gold') { s.items.goldnugget--; s.rupees += 300; }
      State.save(); U.sfx.coin(); shop('sell');
    });
  }

  /* ---------------- BAG ---------------- */
  function bag(tab = 'meals') {
    const s = S(); const { screen, hud, on, toast } = UI();
    let body = '';
    const card = (emo, name, sub, btn = '') => `<div class="bag-item slate"><span class="emo">${emo}</span><div><b>${name}</b><small>${sub}</small></div>${btn}</div>`;
    if (tab === 'meals') {
      const active = Object.entries(s.buffs).filter(([, v]) => v > 0).map(([k, v]) => `${K.EFFECTS[k].icon} ${K.EFFECTS[k].name}: ${v} trial${v > 1 ? 's' : ''} left`);
      body = `${active.length ? `<p class="buffs slate">Active food effects: ${active.join(' · ')}</p>` : ''}<div class="bag-grid">${Object.entries(s.meals).filter(([, c]) => c > 0).map(([k, c]) => { const m = mealInfo(k); const E = m.effect && K.EFFECTS[m.effect]; return card(m.emoji, `${m.name} ×${c}`, E ? `${E.icon} ${E.desc}` : 'No special effect. Sell it to Beedle!', E && E.trials ? `<button class="btn small primary" data-eat="${k}">Eat</button>` : E ? '<span class="muted small-note">Eat before a boss fight</span>' : ''); }).join('') || '<p class="muted">No meals yet. Cook some at the stable or your house!</p>'}</div>`;
    }
    if (tab === 'ingredients') body = `<div class="bag-grid">${K.INGREDIENTS.filter(i => s.ingredients[i.id]).map(i => card(i.emoji, `${i.name} ×${s.ingredients[i.id]}`, i.tag ? `${K.EFFECTS[i.tag].icon} Adds the ${K.EFFECTS[i.tag].name} effect` : 'Cooking ingredient')).join('') || '<p class="muted">No ingredients. Win shrine trials to collect them!</p>'}</div>`;
    if (tab === 'materials') body = `<div class="bag-grid">${K.MATERIALS.filter(i => s.materials[i.id]).map(i => card(i.emoji, `${i.name} ×${s.materials[i.id]}`, 'Monster part for Great Fairy upgrades')).join('') || '<p class="muted">Defeat monsters in shrine trials to collect their parts.</p>'}</div>`;
    if (tab === 'items') body = `<div class="bag-grid">${card('🎫', `Adventure Tickets ×${s.tickets}`, 'Earned from shrines. Spend on mini-games and races.')}${K.ITEMS.filter(i => s.items[i.id]).map(i => card(i.emoji, `${i.name} ×${s.items[i.id]}`, i.desc)).join('')}${s.lucky ? card('🍀', 'Lucky Clover', `Double ingredients for ${s.lucky} more shrine win${s.lucky > 1 ? 's' : ''}`) : ''}</div>`;
    screen(`${hud()}<div class="page"><div class="page-head">${back()}<h2>Bag</h2><span class="pill">🎫 ${s.tickets}</span></div>
      <div class="tabs">${[['meals', '🍲 Meals'], ['ingredients', '🍎 Ingredients'], ['materials', '🦴 Monster parts'], ['items', '🎒 Items']].map(([t, l]) => `<button class="tab ${t === tab ? 'on' : ''}" data-tab="${t}">${l}</button>`).join('')}</div>${body}</div>`, 'map', 'field');
    on('#back', Game.map); on('[data-tab]', (e, el) => bag(el.dataset.tab));
    on('[data-eat]', (e, el) => { const k = el.dataset.eat; const m = mealInfo(k); s.meals[k]--; if (!s.meals[k]) delete s.meals[k]; s.buffs[m.effect] = (s.buffs[m.effect] || 0) + K.EFFECTS[m.effect].trials; State.save(); U.sfx.orb(); toast(`Yum! ${K.EFFECTS[m.effect].icon} ${K.EFFECTS[m.effect].name} for your next ${K.EFFECTS[m.effect].trials} trials!`, 'good'); bag('meals'); });
  }

  /* ---------------- COOKING ---------------- */
  function mealInfo(key) { const [rid, effect] = key.split('|'); const R = K.RECIPES.find(r => r.id === rid) || K.RECIPES[K.RECIPES.length - 1]; const E = effect && K.EFFECTS[effect]; const base = R.bonus + 10; return { id: rid, effect: effect || null, name: (E && !R.name.startsWith(E.name) ? E.name + ' ' : '') + R.name, emoji: R.emoji, value: base + (E ? 15 : 0) }; }
  function cookResult(ids) {
    const items = ids.map(ING);
    if (items.every(i => !i.kind || i.kind === 'salt')) return { dubious: true };
    const kinds = new Set(items.map(i => i.kind));
    const R = K.RECIPES.find(r => r.need.every(k => kinds.has(k)) && (!r.only || items.every(i => r.only.includes(i.kind))) && (!r.ids || r.ids.some(x => ids.includes(x)))) || K.RECIPES[K.RECIPES.length - 1];
    const tags = {}; items.forEach(i => { if (i.tag) tags[i.tag] = (tags[i.tag] || 0) + 1; });
    const effect = Object.keys(tags).sort((a, b) => tags[b] - tags[a])[0] || '';
    return { recipe: R, effect };
  }
  function kitchen(from = 'stable', tab = 'cook') {
    const s = S(); const { screen, hud, on } = UI();
    const sel = [];
    const draw = () => {
      $('#pot-slots').innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="slot">${sel[i] ? ING(sel[i]).emoji : ''}</span>`).join('');
      $$('[data-ing]').forEach(b => { const id = b.dataset.ing; const left = (s.ingredients[id] || 0) - sel.filter(x => x === id).length; b.querySelector('i').textContent = left; b.disabled = left <= 0 || sel.length >= 5; });
      $('#cookbtn').disabled = !sel.length;
      const prev = sel.length ? cookResult(sel) : null;
      $('#preview').innerHTML = !prev ? 'Choose up to 5 ingredients.' : prev.dubious ? 'Hmm… that doesn\'t look tasty.' : `Looks like: <b>${prev.recipe.emoji} ${s.recipes.includes(prev.recipe.id) ? mealInfo(prev.recipe.id + '|' + prev.effect).name : (prev.effect ? K.EFFECTS[prev.effect].name + ' ' : '') + '???'}</b>`;
    };
    const book = `<div class="bag-grid">${K.RECIPES.map(r => s.recipes.includes(r.id) ? `<div class="bag-item slate"><span class="emo">${r.emoji}</span><div><b>${r.name}</b><small>${r.need.length ? 'Needs: ' + r.need.join(', ') : 'Any mix of food'}${r.ids ? ' (with ' + r.ids.map(x => ING(x).name).join('/') + ')' : ''}</small></div></div>` : '<div class="bag-item slate locked"><span class="emo">❔</span><div><b>???</b><small>Not discovered yet</small></div></div>').join('')}</div>`;
    screen(`${hud()}<div class="page"><div class="page-head">${back(from === 'house' ? '◀ House' : '◀ Stable')}<h2>Cooking Pot</h2><span class="pill">📖 ${s.recipes.length}/${K.RECIPES.length} recipes</span></div>
      <div class="tabs"><button class="tab ${tab === 'cook' ? 'on' : ''}" data-tab="cook">🍲 Cook</button><button class="tab ${tab === 'book' ? 'on' : ''}" data-tab="book">📖 Recipe book</button></div>
      ${tab === 'book' ? book : `<div class="kitchen">
        <div class="pot-wrap"><div class="pot" id="pot"><span class="steam">♨️</span>🍲</div><div class="pot-slots" id="pot-slots"></div><p id="preview" class="muted"></p>
          <div class="row center"><button class="btn" id="clear">Empty</button><button class="btn primary glow" id="cookbtn">Cook! 🔥</button></div></div>
        <div class="ing-grid">${K.INGREDIENTS.filter(i => s.ingredients[i.id]).map(i => `<button class="ing" data-ing="${i.id}" title="${i.name}"><span>${i.emoji}</span><small>${i.name}</small><i></i>${i.tag ? `<em>${K.EFFECTS[i.tag].icon}</em>` : ''}</button>`).join('') || '<p class="muted">No ingredients yet. Win shrine trials, or buy some from Beedle.</p>'}</div>
      </div>
      <p class="muted center">Special ingredients (❤️ 💪 💨 🌶️ ⚡ ❄️) give meals powers. Eat ❤️💪💨 meals before boss fights, and 🌶️⚡❄️ meals from your Bag for bonus rupees, Koroks or XP.</p>`}</div>`, from === 'house' ? 'plateau' : 'plateau', from === 'house' ? 'home' : 'stable');
    on('#back', () => (from === 'house' ? house() : stable()));
    on('[data-tab]', (e, el) => kitchen(from, el.dataset.tab));
    if (tab === 'book') return;
    on('[data-ing]', (e, el) => { if (sel.length < 5) { sel.push(el.dataset.ing); draw(); const p = $('#pot'); p.classList.remove('plop'); void p.offsetWidth; p.classList.add('plop'); } });
    on('#clear', () => { sel.length = 0; draw(); });
    on('#cookbtn', () => {
      if (!sel.length) return;
      const r = cookResult(sel); sel.forEach(id => { s.ingredients[id]--; if (!s.ingredients[id]) delete s.ingredients[id]; });
      const pot = $('#pot'); pot.classList.add('cooking'); U.sfx.tick();
      let k = 0; const t = setInterval(() => { U.sfx.tick(); if (++k > 8) clearInterval(t); }, 150);
      setTimeout(() => {
        State.count('cooked');
        if (r.dubious) { State.save(); FX.itemGet('<span class="emo big">🤢</span>', 'Dubious Food', 'Oops! Try mixing real food ingredients next time.', () => kitchen(from)); return; }
        const key = r.recipe.id + '|' + r.effect; s.meals[key] = (s.meals[key] || 0) + 1;
        const isNew = !s.recipes.includes(r.recipe.id); if (isNew) s.recipes.push(r.recipe.id);
        State.save(); const m = mealInfo(key); const E = r.effect && K.EFFECTS[r.effect];
        FX.itemGet(`<span class="emo big">${m.emoji}</span>`, `${m.name}${isNew ? ' ✨ NEW RECIPE!' : ''}`, E ? `${E.icon} ${E.desc}` : `Worth ${m.value} rupees at Beedle's shop.`, () => kitchen(from));
      }, 1500);
    });
    draw();
  }

  /* ---------------- HORSES ---------------- */
  function rollHorse() {
    const rare = Math.random() < 0.04;
    const coat = rare ? 'golden' : U.pick(K.COATS.filter(c => !c.rare)).id;
    const sp = U.int(1, 5), st = U.int(1, 5), temper = U.int(1, 5);
    return { coat, speed: rare ? 5 : sp, stamina: rare ? 5 : st, temper: rare ? 5 : temper };
  }
  function herd() { const s = S(); if (s.wild.day !== today()) { s.wild = { day: today(), herd: [rollHorse(), rollHorse(), rollHorse()] }; State.save(); } return s.wild.herd; }
  const starsTxt = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  function stable() {
    const s = S(); const { screen, hud, on, dialogue } = UI();
    const horses = s.horses;
    screen(`${hud()}<div class="page"><div class="page-head">${back()}<h2>Outskirt Stable</h2><span class="pill">🎫 ${s.tickets}</span></div>
      <div class="stable-top"><div class="npc-stand">${IC.stable()}</div><p class="intro slate">"Welcome! Tame wild horses in Hyrule Field, then bring them here. Brush and feed them every day to grow your bond, and race them for prizes!"</p></div>
      <div class="row center"><button class="btn primary" id="field">🌾 Hyrule Field: find wild horses</button><button class="btn" id="cook">🍲 Cooking Pot</button></div>
      <div class="horse-list">${horses.length ? horses.map((h, i) => `<div class="horse-card slate ${s.activeHorse === i ? 'active' : ''}">
          <div class="horse-art">${ART.horse(h, { saddle: h.saddle || 'stable', anim: 'idle' })}</div>
          <div class="horse-info"><h3>${U.esc(h.name)} ${s.activeHorse === i ? '<span class="tag">Riding</span>' : ''}</h3>
            <small>${(K.COATS.find(c => c.id === h.coat) || {}).name} · Speed <b>${starsTxt(h.speed)}</b> · Stamina <b>${starsTxt(h.stamina)}</b></small>
            <div class="bond">Bond ${'💗'.repeat(h.bond)}${'🤍'.repeat(5 - h.bond)}</div>
            <div class="row">
              <button class="btn small" data-brush="${i}" ${h.brushed === today() ? 'disabled' : ''}>🪮 Brush${h.brushed === today() ? 'ed today' : ''}</button>
              <button class="btn small" data-feed="${i}" ${(s.ingredients.carrot || s.ingredients.apple) ? '' : 'disabled'}>🥕 Feed</button>
              <button class="btn small primary" data-race="${i}" ${s.tickets ? '' : 'disabled'}>🏇 Race (🎫1)</button>
              ${s.activeHorse === i ? '' : `<button class="btn small" data-ride="${i}">Ride</button>`}
              <select data-saddle="${i}" class="saddle-sel">${s.ownedSaddles.map(id => `<option value="${id}" ${(h.saddle || 'stable') === id ? 'selected' : ''}>${K.SADDLES.find(x => x.id === id).name}</option>`).join('')}</select>
            </div></div></div>`).join('') : '<p class="muted center">No horses yet. Head out to Hyrule Field to tame one!</p>'}</div>
      <p class="muted center">Stable space: ${horses.length}/${K.STABLE_CAP}. Bond grows by 1 each day you brush or feed a horse. A strong bond makes your horse faster in races.</p></div>`, 'plateau', 'stable');
    on('#back', Game.map); on('#field', wildField); on('#cook', () => kitchen('stable'));
    const bondUp = h => { if (h.bonded !== today() && h.bond < 5) { h.bond++; h.bonded = today(); FX.banner(`${U.esc(h.name)} loves you more! 💗`, 'grace'); } };
    on('[data-brush]', (e, el) => { const h = horses[+el.dataset.brush]; h.brushed = today(); bondUp(h); U.sfx.korok(); State.save(); stable(); });
    on('[data-feed]', (e, el) => { const h = horses[+el.dataset.feed]; const food = s.ingredients.carrot ? 'carrot' : 'apple'; s.ingredients[food]--; if (!s.ingredients[food]) delete s.ingredients[food]; bondUp(h); h.fed = (h.fed || 0) + 1; U.sfx.coin(); State.save(); UI().toast(`${U.esc(h.name)} munches the ${food}! 😋`, 'good'); stable(); });
    on('[data-ride]', (e, el) => { s.activeHorse = +el.dataset.ride; State.save(); stable(); });
    on('[data-race]', (e, el) => race(+el.dataset.race));
    $$('[data-saddle]').forEach(sel => sel.addEventListener('change', () => { horses[+sel.dataset.saddle].saddle = sel.value; State.save(); stable(); }));
    if (!s.flags.stableIntro) { s.flags.stableIntro = true; State.save(); dialogue([['Stable Master', 'Every horse in Hyrule has its own personality. The wild ones buck hardest, but they\'re often the fastest!'], ['Stable Master', 'Races cost one Adventure Ticket. You earn tickets by clearing shrine trials, so keep training!']]); }
  }
  function wildField() {
    const s = S(); const { screen, hud, on } = UI(); const h = herd();
    screen(`${hud()}<div class="page"><div class="page-head">${back('◀ Stable')}<h2>Hyrule Field</h2></div>
      <p class="intro slate">Wild horses are grazing! Choose one to tame. Horses with a fiery temper are harder to calm down, but they're often the strongest. A new herd arrives every day.</p>
      <div class="herd">${h.map((x, i) => x ? `<button class="wild slate" data-tame="${i}"><div class="horse-art">${ART.horse(x, { anim: 'graze' })}</div><b>${(K.COATS.find(c => c.id === x.coat) || {}).name}${x.coat === 'golden' ? ' ✨' : ''}</b><small>Speed ${starsTxt(x.speed)}<br>Stamina ${starsTxt(x.stamina)}<br>Temper ${'🔥'.repeat(x.temper)}</small></button>` : '<div class="wild slate gone">🌾<small>Gone to your stable</small></div>').join('')}</div></div>`, 'plateau', 'stable');
    on('#back', stable);
    on('[data-tame]', (e, el) => { if (s.horses.length >= K.STABLE_CAP) return UI().toast('Your stable is full!', 'bad'); tame(+el.dataset.tame); });
  }
  function tame(i) {
    const s = S(); const { screen, on, addInterval, onKey } = UI(); const h = herd()[i];
    const need = 2 + h.temper; const maxStam = 3 + s.stamina; let stam = maxStam, got = 0, pos = 0, dir = 1, done = false;
    const zone = Math.max(14, 34 - h.temper * 4); const zoneAt = U.int(20, 80 - zone);
    screen(`<div class="page center tame-page"><h2>Taming a wild horse!</h2><p class="muted">Tap <b>Soothe</b> when the marker is in the green zone. Each miss uses stamina.</p>
      <div class="tame-horse buck" id="th">${ART.horse(h, { anim: 'buck' })}<div class="rider">${UI().heroArt()}</div></div>
      <div class="meter"><div class="zone" style="left:${zoneAt}%;width:${zone}%"></div><div class="needle" id="needle"></div></div>
      <div class="tame-stats"><span>Calm: <b id="got">0</b>/${need}</span><span>Stamina: <b id="stam">${'🟢'.repeat(stam)}</b></span></div>
      <button class="btn big primary" id="soothe">💚 Soothe!</button></div>`, 'plateau', 'battle');
    const spd = 1.4 + h.temper * 0.45;
    addInterval(setInterval(() => { if (done) return; pos += dir * spd; if (pos >= 100 || pos <= 0) { dir *= -1; pos = Math.max(0, Math.min(100, pos)); } $('#needle').style.left = pos + '%'; }, 16));
    const press = () => {
      if (done) return;
      if (pos >= zoneAt && pos <= zoneAt + zone) { got++; U.sfx.correct(); FX.burst(...FX.center($('#th')), { n: 14, colors: ['#7ee35a', '#fff'], speed: 160 }); }
      else { stam--; U.sfx.wrong(); FX.shake(0.6); }
      $('#got').textContent = got; $('#stam').textContent = '🟢'.repeat(Math.max(0, stam)) + '⚫'.repeat(maxStam - Math.max(0, stam));
      if (got >= need) { done = true; $('#th').classList.remove('buck'); FX.banner('Tamed!', 'victory'); U.sfx.fanfare(); setTimeout(() => nameHorse(i), 1300); }
      else if (stam <= 0) { done = true; FX.banner('Thrown off!', 'danger'); setTimeout(() => UI().modal('<h3>The horse threw you off!</h3><p>Try again. Every Stamina Vessel from the Goddess Statue gives you one more try per attempt.</p>', [{ label: 'Back to the field', fn: wildField }, { label: 'Try again', cls: 'primary', fn: () => tame(i) }]), 900); }
    };
    on('#soothe', press);
    onKey(e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); } });
  }
  function nameHorse(i) {
    const s = S(); const h = herd()[i]; const ov = $('#overlay'); ov.className = 'modal-wrap'; ov.onclick = null;
    const def = h.coat === 'golden' ? 'Sunbeam' : U.pick(['Epona', 'Storm', 'Clover', 'Biscuit', 'Comet', 'Maple', 'Pebble', 'Thunder']);
    ov.innerHTML = `<div class="modal slate"><div class="prep-art">${ART.horse(h)}</div><h3>Register your horse</h3><p>What will you name your new horse?</p><input id="hname" class="name-in" maxlength="14" value="${def}"><div class="row"><button class="btn primary" id="reg">Register ✔</button></div></div>`;
    const inp = $('#hname'); inp.focus(); inp.select();
    const finish = () => {
      const name = inp.value.trim() || def; ov.innerHTML = ''; ov.className = '';
      s.horses.push({ ...h, name, bond: 0, saddle: 'stable' }); s.wild.herd[i] = null; if (s.activeHorse === null) s.activeHorse = s.horses.length - 1;
      State.count('tamed'); State.save(); U.sfx.fanfare();
      FX.itemGet(`<div class="pet-get wide">${ART.horse(h, { saddle: 'stable' })}</div>`, `${U.esc(name)} joined your stable!`, 'Brush and feed them every day to build your bond.', stable);
    };
    $('#reg').addEventListener('click', finish, { once: true });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#reg').click(); } });
  }
  function race(i) {
    const s = S(); const { screen, on, addInterval, onKey } = UI(); const h = s.horses[i];
    if (!s.tickets) return UI().toast('You need an Adventure Ticket. Clear a shrine trial to earn one!', 'bad');
    s.tickets--; State.save();
    const rivals = [rollHorse(), rollHorse(), rollHorse()].map((r, k) => ({ ...r, name: ['Royal Steed', 'Dusty', 'Gerudo Racer'][k] }));
    const racers = [{ ...h, me: true }, ...rivals].map(r => ({ ...r, x: 0, v: 0, boost: 0 }));
    const lanes = racers.map((r, k) => `<div class="lane"><span class="lane-name">${r.me ? U.esc(h.name) : r.name}</span><div class="runner" id="run${k}">${ART.horse(r, { saddle: r.me ? (h.saddle || 'stable') : 'stable', anim: 'gallop' })}</div></div>`).join('');
    screen(`<div class="page center race-page"><h2>Horse Race!</h2><p class="muted">Tap <b>Gallop!</b> when the spur meter is in the green zone for a burst of speed. Don't spam it: a bad spur slows you down!</p>
      <div class="track"><div class="finish"></div>${lanes}</div>
      <div class="meter"><div class="zone" style="left:62%;width:22%"></div><div class="needle" id="needle"></div></div>
      <div class="row center"><span class="pill">Spurs: <b id="spurs"></b></span></div>
      <button class="btn big primary" id="gallop">🏇 Gallop!</button></div>`, 'plateau', 'battle');
    let spurs = 3 + h.stamina; const spursMax = spurs; $('#spurs').textContent = '🥕'.repeat(spurs);
    let pos = 0, done = false, t0 = performance.now(), finish = [];
    const base = r => 0.22 + r.speed * 0.035 + (r.me ? h.bond * 0.012 : 0);
    addInterval(setInterval(() => {
      if (done) return;
      pos = (pos + 2.2) % 100; $('#needle').style.left = pos + '%';
      racers.forEach((r, k) => {
        if (!r.me && Math.random() < 0.012 * r.stamina) r.boost = 40;
        const v = base(r) * (r.boost > 0 ? 1.9 : 1) * (0.9 + Math.random() * 0.2); if (r.boost > 0) r.boost--;
        if (r.x < 100) { r.x += v; if (r.x >= 100 && !finish.includes(k)) finish.push(k); }
        $('#run' + k).style.left = `calc(${Math.min(100, r.x) * 0.82}% )`;
      });
      if (finish.includes(0) || finish.length === 4 || performance.now() - t0 > 40000) {
        done = true; const place = finish.indexOf(0) + 1 || 4;
        const prize = [0, 120, 60, 30, 10][place]; s.rupees += prize; if (place === 1) { State.count('racesWon'); addIng('carrot'); } State.save();
        FX.banner(place === 1 ? '1st place! 🏆' : `${place}${['', 'st', 'nd', 'rd', 'th'][place]} place`, place === 1 ? 'victory' : 'appear');
        if (place === 1) { U.sfx.fanfare(); FX.burst(window.innerWidth / 2, window.innerHeight / 3, { n: 60, colors: ['#ffd23d', '#fff', '#3fe0ff'], kind: 'star', speed: 400 }); }
        setTimeout(() => UI().modal(`<h3>${place === 1 ? '🏆 You won!' : 'Race over'}</h3><p>You finished <b>${place}${['', 'st', 'nd', 'rd', 'th'][place]}</b> and won <b>${prize} rupees</b>${place === 1 ? ' and a Swift Carrot 🥕' : ''}.</p><p class="muted">Faster horses and a stronger bond win more often.</p>`, [{ label: 'Back to stable', cls: 'primary', fn: stable }]), 1400);
      }
    }, 30));
    const gallop = () => {
      if (done || spurs <= 0) return; spurs--; $('#spurs').textContent = '🥕'.repeat(spurs) + '·'.repeat(spursMax - spurs);
      const me = racers[0];
      if (pos >= 62 && pos <= 84) { me.boost = 45; U.sfx.correct(); FX.floatText($('#run0'), 'Burst!', 'xp'); } else { me.boost = -1; me.x = Math.max(0, me.x - 1.5); U.sfx.wrong(); FX.floatText($('#run0'), 'Too early!', 'xp'); }
    };
    on('#gallop', gallop); onKey(e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); gallop(); } });
  }

  /* ---------------- MINI-GAMES ---------------- */
  function ticketGate(name, play) {
    const s = S();
    if (!s.tickets) return UI().modal(`<h3>${name}</h3><p>You need an <b>🎫 Adventure Ticket</b> to play. Clear shrine trials to earn tickets!</p>`, [{ label: 'OK' }]);
    UI().modal(`<h3>${name}</h3><p>Play for <b>🎫 1 Adventure Ticket</b>? You have ${s.tickets}.</p>`, [{ label: 'Not now' }, { label: 'Play! 🎫', cls: 'primary', fn: () => { s.tickets--; State.save(); play(); } }]);
  }
  function archeryIntro() {
    const s = S(); const { screen, hud, on } = UI();
    screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Rito Flight Range</h2></div>
      <div class="npc-stand big"><span class="emo big">🦅</span></div>
      <p class="intro slate">Teba: "Hit as many targets as you can in 30 seconds. Gold targets are worth 3 points! Best score: <b>${s.counters.archeryBest || 0}</b>"</p>
      <button class="btn big primary glow" id="go">🎯 Play (🎫1)</button></div>`, 'verbal', 'verbal');
    on('#back', Game.map); on('#go', () => ticketGate('Flight Range', archery));
  }
  function archery() {
    const { screen, addInterval } = UI(); let score = 0, left = 30, done = false;
    screen(`<div class="page center"><h2>🎯 Flight Range</h2><div class="row center"><span class="pill">Score <b id="sc">0</b></span><span class="pill">⏱ <b id="tl">30</b></span></div><div class="range" id="range"></div></div>`, 'verbal', 'battle');
    const range = $('#range');
    const spawn = () => {
      if (done) return; const gold = Math.random() < 0.18; const t = document.createElement('button'); t.className = 'target' + (gold ? ' gold' : '');
      const y = U.int(5, 75), dur = U.int(2400, 4200) - (gold ? 800 : 0), fromLeft = Math.random() < 0.5;
      t.style.top = y + '%'; t.style.left = fromLeft ? '-12%' : '104%';
      range.appendChild(t);
      t.animate([{ left: fromLeft ? '-12%' : '104%' }, { left: fromLeft ? '104%' : '-12%' }], { duration: dur, easing: 'linear' }).onfinish = () => t.remove();
      t.addEventListener('pointerdown', () => { if (done) return; score += gold ? 3 : 1; $('#sc').textContent = score; U.sfx.hit(); const [x, yy] = FX.center(t); FX.burst(x, yy, { n: 16, colors: gold ? ['#ffd23d', '#fff'] : ['#ff5a5a', '#fff'], speed: 200 }); FX.floatText(t, gold ? '+3' : '+1', 'xp'); t.remove(); });
    };
    addInterval(setInterval(spawn, 650));
    addInterval(setInterval(() => {
      if (done) return; left--; $('#tl').textContent = left;
      if (left <= 0) {
        done = true; const s = S(); const best = score > (s.counters.archeryBest || 0); State.countMax('archeryBest', score); const prize = score * 3; s.rupees += prize; State.save();
        UI().modal(`<h3>Time's up!</h3><p>You scored <b>${score}</b>${best ? ' — a new best! 🏆' : ''}</p><p>Prize: <b>${prize} rupees</b></p>`, [{ label: 'Done', cls: 'primary', fn: archeryIntro }]);
      }
    }, 1000));
  }
  const SONG_PADS = [['#3fe0ff', 523, '◆'], ['#ffd23d', 659, '▲'], ['#ff5a6e', 784, '●'], ['#7ee35a', 988, '■']];
  function kassIntro() {
    const s = S(); const { screen, hud, on } = UI();
    screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Kass's Song</h2></div>
      <div class="npc-stand big"><span class="emo big">🪗</span></div>
      <p class="intro slate">Kass: "Listen to my melody, then play it back! Each round adds one more note. Best melody: <b>${s.counters.songBest || 0}</b> notes."</p>
      <button class="btn big primary glow" id="go">🎵 Play (🎫1)</button></div>`, 'verbal', 'field');
    on('#back', Game.map); on('#go', () => ticketGate('Kass\'s Song', kass));
  }
  function kass() {
    const { screen } = UI(); const seq = []; let input = 0, busy = true, over = false;
    screen(`<div class="page center"><h2>🎵 Kass's Song</h2><p id="msg" class="muted">Listen…</p><div class="pads">${SONG_PADS.map((p, i) => `<button class="pad" data-pad="${i}" style="--c:${p[0]}">${p[2]}</button>`).join('')}</div><p>Melody length: <b id="len">0</b></p></div>`, 'verbal', 'home');
    const flash = i => { const b = $(`[data-pad="${i}"]`); if (!b) return; b.classList.add('lit'); playNote(SONG_PADS[i][1]); setTimeout(() => b.classList.remove('lit'), 320); };
    const round = () => { if (!$('#len')) return; seq.push(U.int(0, 3)); $('#len').textContent = seq.length; busy = true; input = 0; $('#msg').textContent = 'Listen…'; seq.forEach((n, k) => setTimeout(() => flash(n), 600 + k * 520)); setTimeout(() => { busy = false; if ($('#msg')) $('#msg').textContent = 'Your turn!'; }, 600 + seq.length * 520); };
    const end = () => {
      over = true; const s = S(); const len = seq.length - 1; State.countMax('songBest', len); const prize = len * 12; s.rupees += prize; State.save();
      UI().modal(`<h3>Lovely playing!</h3><p>You remembered <b>${len}</b> note${len === 1 ? '' : 's'}.</p><p>Prize: <b>${prize} rupees</b></p>`, [{ label: 'Done', cls: 'primary', fn: kassIntro }]);
    };
    $$('[data-pad]').forEach(b => b.addEventListener('pointerdown', () => {
      if (busy || over) return; const i = +b.dataset.pad; flash(i);
      if (i !== seq[input]) { U.sfx.wrong(); return end(); }
      input++; if (input === seq.length) { busy = true; $('#msg').textContent = 'Brilliant!'; setTimeout(round, 700); }
    }));
    setTimeout(round, 400);
  }
  let actx;
  function playNote(f) { if (!S().settings.sound) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, actx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.5); o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.55); } catch (e) { /* no audio */ } }

  function leafIntro() {
    const s = S(); const { screen, hud, on } = UI();
    screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Korok Hide-and-Seek</h2></div>
      <div class="npc-stand">${ART.korok()}</div>
      <p class="intro slate">"Yahaha! I'll hide under a leaf and shuffle them around. Find me! Every 2 rounds you win, I'll give you a Korok seed!"</p>
      <button class="btn big primary glow" id="go">🍃 Play (🎫1)</button></div>`, 'plateau', 'field');
    on('#back', Game.map); on('#go', () => ticketGate('Hide-and-Seek', leafGame));
  }
  function leafGame() {
    const { screen } = UI(); let roundN = 0, wins = 0;
    screen(`<div class="page center"><h2>🍃 Where's the Korok?</h2><p id="msg" class="muted"></p><div class="leaves" id="leaves">${[0, 1, 2].map(i => `<button class="leaf" data-leaf="${i}" style="left:${8 + i * 32}%"><span class="lf">🍃</span><span class="kk">${ART.korok(true)}</span></button>`).join('')}</div><p>Round <b id="rn">1</b> · Found <b id="wn">0</b></p></div>`, 'plateau', 'field');
    let korokAt = 0, busy = true; const pos = [0, 1, 2];
    const place = () => $$('[data-leaf]').forEach(b => { b.style.left = (8 + pos[+b.dataset.leaf] * 32) + '%'; });
    const round = () => {
      if (!$('#rn')) return; roundN++; $('#rn').textContent = roundN; busy = true; korokAt = U.int(0, 2);
      $$('[data-leaf]').forEach(b => b.classList.toggle('show', +b.dataset.leaf === korokAt));
      $('#msg').textContent = 'Watch the Korok…';
      setTimeout(() => {
        if (!$('#msg')) return; $$('[data-leaf]').forEach(b => b.classList.remove('show'));
        const swaps = 3 + roundN * 2, speed = Math.max(220, 520 - roundN * 50); let k = 0;
        const sw = setInterval(() => { if (!$('#leaves')) return clearInterval(sw); const a = U.int(0, 2); let b = U.int(0, 2); if (a === b) b = (b + 1) % 3; const ia = pos.indexOf(a), ib = pos.indexOf(b); [pos[ia], pos[ib]] = [pos[ib], pos[ia]]; place(); U.sfx.tick(); if (++k >= swaps) { clearInterval(sw); busy = false; if ($('#msg')) $('#msg').textContent = 'Which leaf is the Korok under?'; } }, speed);
      }, 1100);
    };
    $$('[data-leaf]').forEach(b => b.addEventListener('click', () => {
      if (busy) return; busy = true; const i = +b.dataset.leaf; $$('[data-leaf]').forEach(x => x.classList.toggle('show', +x.dataset.leaf === korokAt));
      if (i === korokAt) {
        wins++; $('#wn').textContent = wins; U.sfx.korok(); State.count('leafWins'); FX.floatText(b, 'Yahaha!', 'xp');
        const s = S(); if (wins % 2 === 0) { s.seeds++; s.seedsTotal++; FX.banner('+1 Korok Seed! 🌰', 'grace'); } State.save();
        setTimeout(round, 1300);
      } else { U.sfx.wrong(); $('#msg').textContent = 'Oh no! It was over there!'; setTimeout(() => { const s = S(); const prize = wins * 8; s.rupees += prize; State.save(); UI().modal(`<h3>Game over</h3><p>You found the Korok <b>${wins}</b> time${wins === 1 ? '' : 's'}.</p><p>Prize: <b>${prize} rupees</b>${wins >= 2 ? ` and ${Math.floor(wins / 2)} Korok seed${wins >= 4 ? 's' : ''}` : ''}</p>`, [{ label: 'Done', cls: 'primary', fn: leafIntro }]); }, 1100); }
    }));
    setTimeout(round, 500);
  }

  /* ---------------- HOUSE ---------------- */
  function house() {
    const s = S(); const { screen, hud, on, heroArt, toast } = UI();
    if (!s.house.owned) {
      screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Hateno Village</h2></div>
        <div class="house-outside">${IC.house()}</div>
        <p class="intro slate">Hudson: "This old house is for sale! It needs some love, but it could be a real home. Only <b>${fmt(K.HOUSE_PRICE)} rupees</b>, and I'll throw in the bed once you finish my quest!"</p>
        <button class="btn big ${s.rupees >= K.HOUSE_PRICE ? 'primary glow' : ''}" id="buy" ${s.rupees >= K.HOUSE_PRICE ? '' : 'disabled'}>Buy the house (${price(K.HOUSE_PRICE)})</button>
        <p class="muted">You have ${fmt(s.rupees)} rupees. Keep clearing shrines to save up!</p></div>`, 'plateau', 'home');
      on('#back', Game.map);
      on('#buy', () => { spend(K.HOUSE_PRICE); s.house.owned = true; State.save(); FX.itemGet('<span class="emo big">🏡</span>', 'You bought a house!', 'Decorate it with furniture from Bolson Construction.', house); });
      return;
    }
    const has = id => s.house.decor.includes(id);
    const rack = has('rack') ? `<div class="deco-extra" style="left:66%;top:22%">${s.ownedWeapons.map(w => K.WEAPONS.find(x => x.id === w).emoji).join('')}</div>` : '';
    const trophies = has('trophies') ? `<div class="deco-extra" style="left:84%;top:26%">${STORY.regions.filter(r => s.bosses[r.id]).map(r => r.emoji).join('') || '—'}</div>` : '';
    const rested = s.rested === today();
    screen(`${hud()}<div class="page"><div class="page-head">${back()}<h2>Your House</h2></div>
      <div class="room">
        <svg class="room-bg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="62" fill="#c9a87a"/><rect y="62" width="100" height="38" fill="#8a5a32"/><path d="M0,62 h100" stroke="#5a3a1a" stroke-width="1"/><g stroke="#a88a5a" stroke-width=".4">${Array.from({ length: 9 }, (_, i) => `<path d="M0,${i * 7} h100"/>`).join('')}</g><g stroke="#6a4222" stroke-width=".4">${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 11},62 v38"/>`).join('')}</g><rect x="40" y="16" width="20" height="18" fill="#bfe6ff" stroke="#5a3a1a" stroke-width="1.2"/><path d="M50,16 v18 M40,25 h20" stroke="#5a3a1a" stroke-width=".8"/></svg>
        ${K.DECOR.filter(d => has(d.id)).map(d => `<div class="deco" style="left:${d.x}%;top:${d.y}%" title="${d.name}">${d.emoji}</div>`).join('')}
        ${rack}${trophies}
        <div class="room-hero">${heroArt()}</div>
        ${s.pet !== 'none' ? `<div class="room-pet">${ART.pet(s.pet)}</div>` : ''}
      </div>
      <div class="row center">${has('bed') ? `<button class="btn ${rested ? '' : 'primary'}" id="sleep" ${rested ? 'disabled' : ''}>🛏️ ${rested ? 'Rested today' : 'Sleep (+10% XP next trial)'}</button>` : ''}${has('pot') ? '<button class="btn" id="cook">🍲 Cook</button>' : ''}</div>
      <h3>Bolson Construction: furniture</h3>
      <div class="shop">${K.DECOR.map(d => `<div class="shop-row slate"><span class="si">${d.emoji}</span><div><b>${d.name}</b><p class="muted">${d.desc || 'Makes your house cosier.'}</p></div>${has(d.id) ? '<span class="tag ok">Placed</span>' : `<button class="btn small ${s.rupees >= d.price ? 'primary' : ''}" data-decor="${d.id}" ${s.rupees >= d.price ? '' : 'disabled'}>${price(d.price)}</button>`}</div>`).join('')}</div></div>`, 'plateau', 'home');
    on('#back', Game.map);
    on('#sleep', () => { s.rested = today(); s.restedBonus = true; State.save(); FX.flash('#0a0a30', 0.9); FX.banner('Zzz… Well rested!', 'grace'); setTimeout(house, 1200); });
    on('#cook', () => kitchen('house'));
    on('[data-decor]', (e, el) => { const d = K.DECOR.find(x => x.id === el.dataset.decor); if (s.rupees < d.price) return; spend(d.price); s.house.decor.push(d.id); State.save(); U.sfx.coin(); toast(`${d.emoji} ${d.name} placed!`, 'good'); house(); });
  }

  /* ---------------- SIDE QUESTS ---------------- */
  function quests() {
    const s = S(); const { screen, hud, on, sequence } = UI();
    const list = K.QUESTS.map(q => { const v = State.questValue(q.goal[0]); const done = v >= q.goal[1]; const claimed = s.quests[q.id]; return { q, v: Math.min(v, q.goal[1]), done, claimed }; })
      .sort((a, b) => (a.claimed - b.claimed) || (b.done - a.done));
    const rewardTxt = r => [r.rupees && `${fmt(r.rupees)} rupees`, r.tickets && `${r.tickets} tickets`, r.armour && K.ARMOUR.find(x => x.id === r.armour).name, r.saddle && K.SADDLES.find(x => x.id === r.saddle).name, r.pet && 'companion: ' + K.PETS.find(x => x.id === r.pet).name, r.theme && 'Slate colour: ' + K.THEMES.find(x => x.id === r.theme).name, r.decor && K.DECOR.find(x => x.id === r.decor).name, r.item && Object.keys(r.item).map(k => K.ITEMS.find(x => x.id === k).name).join(', '), r.ingredient && Object.keys(r.ingredient).map(k => ING(k).name).join(', ')].filter(Boolean).join(' · ');
    screen(`${hud()}<div class="page"><div class="page-head">${back()}<h2>Side Quests</h2><span class="pill">${Object.keys(s.quests).length}/${K.QUESTS.length} done</span></div>
      <div class="quests">${list.map(({ q, v, done, claimed }) => `<div class="quest slate ${claimed ? 'claimed' : done ? 'ready' : ''}">
        <span class="q-ico">${q.icon}</span><div><h3>${q.title}</h3><p><b>${q.npc}:</b> "${q.text}"</p>
        <div class="bar"><i style="width:${(v / q.goal[1]) * 100}%"></i></div><small class="muted">${fmt(v)}/${fmt(q.goal[1])} · Reward: ${rewardTxt(q.reward)}</small></div>
        <div>${claimed ? '<span class="tag ok">Done ✓</span>' : done ? `<button class="btn primary glow" data-claim="${q.id}">Claim!</button>` : ''}</div></div>`).join('')}</div></div>`, 'map', 'field');
    on('#back', Game.map);
    on('[data-claim]', (e, el) => { const q = K.QUESTS.find(x => x.id === el.dataset.claim); s.quests[q.id] = true; const steps = grant(q.reward); State.save(); U.sfx.fanfare(); UI().confetti(60); sequence(steps, quests); });
  }

  /* ---------------- GREAT FAIRY ---------------- */
  function fairy() {
    const s = S(); const { screen, hud, on } = UI();
    if (!s.fairy.open) {
      screen(`${hud()}<div class="page center"><div class="page-head">${back('◀ Goddess Statue')}<h2>Great Fairy Fountain</h2></div>
        <div class="fountain closed">🌸</div>
        <p class="intro slate">A giant flower bud sleeps in the fountain. A voice whispers: "Offer <b>${fmt(K.FAIRY_OPEN)} rupees</b>, and I shall awaken… and make your armour stronger."</p>
        <button class="btn big ${s.rupees >= K.FAIRY_OPEN ? 'primary glow' : ''}" id="wake" ${s.rupees >= K.FAIRY_OPEN ? '' : 'disabled'}>Offer ${price(K.FAIRY_OPEN)}</button></div>`, 'shrine', 'shrine');
      on('#back', () => Game.statue()); on('#wake', () => { spend(K.FAIRY_OPEN); s.fairy.open = true; State.save(); FX.flash('#ffc0f0', 1); FX.itemGet('<span class="emo big">🧚‍♀️</span>', 'The Great Fairy awakens!', 'Bring her rupees and monster parts to upgrade your armour.', fairy); });
      return;
    }
    const rows = K.ARMOUR.filter(a => s.ownedArmour.includes(a.id) && a.id !== 'tunic').map(a => {
      const lv = s.fairy.levels[a.id] || 0; const cost = K.FAIRY_COSTS[lv];
      if (!cost) return `<div class="shop-row slate"><span class="si">${a.emoji}</span><div><b>${a.name} <span class="stars">★★★★</span></b><p class="muted">Fully upgraded! Perk ×2.</p></div><span class="tag ok">MAX</span></div>`;
      const matsOk = Object.entries(cost.mats).every(([m, n]) => (s.materials[m] || 0) >= n); const ok = matsOk && s.rupees >= cost.rupees;
      return `<div class="shop-row slate"><span class="si">${a.emoji}</span><div><b>${a.name} <span class="stars">${'★'.repeat(lv)}${'☆'.repeat(4 - lv)}</span></b><p class="muted">Next level: perk ×${(1 + 0.25 * (lv + 1)).toFixed(2)}. Needs ${Object.entries(cost.mats).map(([m, n]) => `${ING(m).emoji} ${ING(m).name} ${s.materials[m] || 0}/${n}`).join(', ')}</p></div><button class="btn small ${ok ? 'primary' : ''}" data-up="${a.id}" ${ok ? '' : 'disabled'}>${price(cost.rupees)}</button></div>`;
    }).join('') || '<p class="muted center">Buy armour from Beedle (or earn it in side quests), then bring it here.</p>';
    screen(`${hud()}<div class="page"><div class="page-head">${back('◀ Goddess Statue')}<h2>Great Fairy Fountain</h2></div>
      <div class="fountain">🧚‍♀️</div><p class="intro slate">"Ahh, a hero! Bring me rupees and monster parts, and I will make your armour's power grow!"</p><div class="shop">${rows}</div></div>`, 'shrine', 'shrine');
    on('#back', () => Game.statue());
    on('[data-up]', (e, el) => {
      const a = K.ARMOUR.find(x => x.id === el.dataset.up); const lv = s.fairy.levels[a.id] || 0; const cost = K.FAIRY_COSTS[lv];
      spend(cost.rupees); for (const [m, n] of Object.entries(cost.mats)) { s.materials[m] -= n; if (!s.materials[m]) delete s.materials[m]; }
      s.fairy.levels[a.id] = lv + 1; State.save(); FX.flash('#ffc0f0', 0.8);
      FX.itemGet(`<span class="emo big">${a.emoji}</span>`, `${a.name} ${'★'.repeat(lv + 1)}`, 'Its power has grown!', fairy);
    });
  }

  window.World = { applyTheme, shop, bag, kitchen, stable, wildField, archeryIntro, kassIntro, leafIntro, house, quests, fairy, trialDrops, grant, mealInfo };
  if (S()) applyTheme();
})();
