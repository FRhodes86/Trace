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
    const t = isBoss ? 3 : 1 + (lv >= 3 ? 1 : 0); s.tickets += t; loot.push({ icon: `<span class="emo">${ITEM_ICONS.ticket}</span>`, label: `${t} Adventure Ticket${t > 1 ? 's' : ''}` });
    State.save(); return loot;
  }
  // apply a quest/reward object; returns a list of item-get steps
  function grant(r) {
    const s = S(); const steps = [];
    if (r.rupees) { s.rupees += r.rupees; steps.push(n => FX.itemGet(IC.rupee(r.rupees >= 500 ? 'gold' : r.rupees >= 200 ? 'purple' : 'red'), `${fmt(r.rupees)} rupees!`, '', n)); }
    if (r.tickets) { s.tickets += r.tickets; steps.push(n => FX.itemGet(`<span class="emo big">${ITEM_ICONS.ticket}</span>`, `${r.tickets} Adventure Tickets!`, 'Spend them on mini-games and horse races.', n)); }
    if (r.ingredient) for (const [id, c] of Object.entries(r.ingredient)) { addIng(id, c); const I = ING(id); steps.push(n => FX.itemGet(`<span class="emo big">${I.emoji}</span>`, `${I.name} ×${c}`, '', n)); }
    if (r.item) for (const [id, c] of Object.entries(r.item)) { s.items[id] = (s.items[id] || 0) + c; const I = K.ITEMS.find(x => x.id === id); steps.push(n => FX.itemGet(`<span class="emo big">${I.emoji}</span>`, `${I.name} ×${c}`, I.desc, n)); }
    if (r.armour) { if (!s.ownedArmour.includes(r.armour)) s.ownedArmour.push(r.armour); const A = K.ARMOUR.find(x => x.id === r.armour); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `You got the ${A.name}!`, A.desc + ' Equip it in Beedle\'s shop.', n)); }
    if (r.saddle) { if (!s.ownedSaddles.includes(r.saddle)) s.ownedSaddles.push(r.saddle); const A = K.SADDLES.find(x => x.id === r.saddle); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `You got the ${A.name}!`, 'Put it on a horse at the stable.', n)); }
    if (r.pet) { if (!s.ownedPets.includes(r.pet)) s.ownedPets.push(r.pet); const A = K.PETS.find(x => x.id === r.pet); steps.push(n => FX.itemGet(`<div class="pet-get">${ART.pet(r.pet)}</div>`, `New companion: ${A.name}!`, (A.desc || '') + ' Choose companions in the shop\'s Style tab.', n)); }
    if (r.theme) { if (!s.ownedThemes.includes(r.theme)) s.ownedThemes.push(r.theme); if (r.theme === 'triforce') { s.theme = 'triforce'; applyTheme(); } const A = K.THEMES.find(x => x.id === r.theme); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `New Sheikah Slate colour: ${A.name}!`, 'Choose it in the shop\'s Style tab.', n)); }
    if (r.weapon) { if (!s.ownedWeapons.includes(r.weapon)) s.ownedWeapons.push(r.weapon); s.weapon = r.weapon; const A = K.WEAPONS.find(x => x.id === r.weapon); steps.push(n => FX.itemGet(`<div class="pet-get">${ART.hero({ armour: s.armour, shield: s.shield, weapon: r.weapon })}</div>`, `You got the ${A.name}!`, `${A.desc} Boss damage: ${A.dmg}.`, n)); }
    if (r.shield) { if (!s.ownedShields.includes(r.shield)) s.ownedShields.push(r.shield); s.shield = r.shield; const A = K.SHIELDS.find(x => x.id === r.shield); steps.push(n => FX.itemGet(`<div class="pet-get">${ART.hero({ armour: s.armour, shield: r.shield, weapon: s.weapon })}</div>`, `You got the ${A.name}!`, A.desc, n)); }
    if (r.relic) { const A = K.RELICS[r.relic]; steps.push(n => FX.itemGet(A.art ? `<div class="pet-get wide">${ART[A.art]()}</div>` : `<span class="emo big">${A.emoji}</span>`, `You got the ${A.name}!`, A.desc, n)); }
    if (r.glider) { if (!s.ownedGliders.includes(r.glider)) s.ownedGliders.push(r.glider); s.glider = r.glider; const A = K.GLIDERS.find(x => x.id === r.glider); steps.push(n => FX.itemGet(`<div class="pet-get wide">${ART.glider(r.glider)}</div>`, `You got ${A.name}!`, 'You\'ll see it every time you fly across the map.', n)); }
    if (r.decor) { if (!s.house.decor.includes(r.decor)) s.house.decor.push(r.decor); const A = K.DECOR.find(x => x.id === r.decor); steps.push(n => FX.itemGet(`<span class="emo big">${A.emoji}</span>`, `${A.name} for your house!`, s.house.owned ? '' : 'It will appear once you own the Hateno house.', n)); }
    State.save(); return steps;
  }

  /* ---------------- REGION MASTERY ---------------- */
  // 3 stars in every shrine of a region earns that Champion's one-of-a-kind reward; all four regions earn the Triforce.
  function masteryProgress(subject) { const ts = CONTENT[subject]; return { done: ts.filter(t => (S().stars[t.id] || 0) >= 3).length, total: ts.length }; }
  function rewardNames(r) {
    return [r.weapon && K.WEAPONS.find(x => x.id === r.weapon).name, r.shield && K.SHIELDS.find(x => x.id === r.shield).name, r.relic && K.RELICS[r.relic].name,
      r.glider && K.GLIDERS.find(x => x.id === r.glider).name, r.theme && K.THEMES.find(x => x.id === r.theme).name + ' slate colour', r.decor && K.DECOR.find(x => x.id === r.decor).name + ' (house trophy)', r.rupees && `${fmt(r.rupees)} rupees`].filter(Boolean);
  }
  function ceremony(key, next) {
    const M = K.MASTERY[key]; const { dialogue, confetti } = UI();
    FX.flash('#fff6c8', 1); U.sfx.fanfare(); confetti(160);
    FX.banner(`${M.title}!<small>${key === 'all' ? 'Every shrine in Hyrule mastered' : '3 ★ in every shrine'}</small>`, 'rankup');
    setTimeout(() => dialogue(M.lines, () => UI().sequence(grant(M.reward), next)), 1600);
  }
  // returns reward steps for any newly mastered regions (call after stars change)
  function checkMastery() {
    const s = S(); const steps = [];
    for (const r of STORY.regions) {
      if (s.mastered[r.id]) continue;
      const p = masteryProgress(r.subject);
      if (p.done === p.total) { s.mastered[r.id] = true; steps.push(n => ceremony(r.id, n)); }
    }
    if (!s.mastered.all && STORY.regions.every(r => s.mastered[r.id])) { s.mastered.all = true; steps.push(n => ceremony('all', n)); }
    State.save(); return steps;
  }
  function masteryPanel(r) {
    const s = S(); const M = K.MASTERY[r.id]; const p = masteryProgress(r.subject); const won = s.mastered[r.id];
    const names = rewardNames(M.reward);
    const previewWeapon = M.reward.weapon ? ART.hero({ armour: s.armour, shield: M.reward.shield || s.shield, weapon: M.reward.weapon }) : ART.glider(M.reward.glider);
    return `<div class="mastery slate ${won ? 'won' : ''}">
      <div class="m-art ${won ? '' : 'locked'}">${previewWeapon}</div>
      <div><h3>🏆 ${won ? M.title : 'Champion\'s Challenge'}</h3>
        <p>${won ? `You earned ${M.champion}'s one-of-a-kind reward!` : `Get <b>★★★ in every shrine</b> here to earn ${M.champion}'s one-of-a-kind reward. It can't be bought anywhere!`}</p>
        <div class="bar"><i style="width:${(p.done / p.total) * 100}%"></i></div>
        <small class="muted">${p.done}/${p.total} shrines with ★★★ · Reward: ${names.join(' · ')}</small></div></div>`;
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
      const right = eq ? '<span class="tag ok">Equipped</span>' : owned ? `<button class="btn small" data-equip="${it.id}" data-kind="${eqKey}">Equip</button>` : it.price === null ? `<span class="muted small-note">${it.mastery ? `🏆 ${it.mastery === 'all' ? '★★★ in every shrine in Hyrule' : `★★★ in every ${STORY.regions.find(x => x.id === it.mastery).name} shrine`}` : it.quest ? '📜 Side-quest reward' : 'Not for sale'}</span>` : buyBtn(kind, it.id, it.price);
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
    if (tab === 'horse') body = K.SADDLES.map(sd => row(sd.emoji, sd.name, 'A saddle for your horses. Choose it at the stable.', s.ownedSaddles.includes(sd.id) ? '<span class="tag ok">Owned</span>' : buyBtn('saddle', sd.id, sd.price))).join('')
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
      FX.itemGet(kind === 'pet' ? `<div class="pet-get">${ART.pet(id)}</div>` : kind === 'glider' ? `<div class="pet-get wide">${ART.glider(id)}</div>` : kind === 'saddle' ? `<span class="emo big">${it.emoji}</span>` : `<span class="emo big">${it.emoji}</span>`, `You got the ${it.name}!`, it.desc || (it.dmg ? `Boss damage: ${it.dmg}` : it.blocks ? `Blocks ${it.blocks} hit${it.blocks > 1 ? 's' : ''} per boss battle.` : ''), () => shop(tab));
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
    if (tab === 'items') body = `<div class="bag-grid">${card(ITEM_ICONS.ticket, `Adventure Tickets ×${s.tickets}`, 'Earned from shrines. Spend on mini-games and races.')}${K.ITEMS.filter(i => s.items[i.id]).map(i => card(i.emoji, `${i.name} ×${s.items[i.id]}`, i.desc)).join('')}${s.lucky ? card('🍀', 'Lucky Clover', `Double ingredients for ${s.lucky} more shrine win${s.lucky > 1 ? 's' : ''}`) : ''}</div>`;
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
        <div class="pot-wrap"><div class="pot" id="pot"><span class="steam">♨️</span>${ITEM_ICONS.DECOR.pot}</div><div class="pot-slots" id="pot-slots"></div><p id="preview" class="muted"></p>
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
        if (r.dubious) { State.save(); FX.itemGet(`<span class="emo big">${ITEM_ICONS.dubious}</span>`, 'Dubious Food', 'Oops! Try mixing real food ingredients next time.', () => kitchen(from)); return; }
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
  // the game's green stamina wheel: one segment per try
  function stamWheel(cur, max) {
    const seg = (2 * Math.PI) / max; const arcs = [];
    for (let k = 0; k < max; k++) { const a0 = -Math.PI / 2 + k * seg + 0.06, a1 = a0 + seg - 0.12; const p = (a, r) => `${(20 + Math.cos(a) * r).toFixed(2)},${(20 + Math.sin(a) * r).toFixed(2)}`; arcs.push(`<path d="M${p(a0, 16)} A16,16 0 0 1 ${p(a1, 16)}" stroke="${k < cur ? '#7ee35a' : '#3a4a3a'}" stroke-width="6" fill="none" stroke-linecap="round"/>`); }
    return `<svg class="stam-wheel" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#1d1a2b" stroke-width="9" opacity=".55"/>${arcs.join('')}</svg>`;
  }
  function tame(i) {
    const s = S(); const { screen, on, addInterval, onKey } = UI(); const h = herd()[i];
    const need = 2 + h.temper; const maxStam = 3 + s.stamina; let stam = maxStam, got = 0, pos = 0, dir = 1, done = false;
    const zone = Math.max(14, 34 - h.temper * 4); const zoneAt = U.int(20, 80 - zone);
    screen(`<div class="page center tame-page"><h2>Taming a wild horse!</h2><p class="muted">Tap <b>Soothe</b> when the marker is in the green zone. Each miss uses stamina.</p>
      <div class="tame-field"><div class="tame-horse buck" id="th">${ART.horse(h, { anim: 'buck' })}<div class="rider">${UI().heroArt()}</div></div><div class="tame-wheel" id="stamw">${stamWheel(maxStam, maxStam)}</div></div>
      <div class="meter"><div class="zone" style="left:${zoneAt}%;width:${zone}%"></div><div class="needle" id="needle"></div></div>
      <div class="tame-stats"><span>Calm: <b id="got">0</b>/${need}</span><span>Stamina tries left: <b id="stam">${stam}</b></span></div>
      <button class="btn big primary" id="soothe">💚 Soothe!</button></div>`, 'plateau', 'battle');
    const spd = 1.4 + h.temper * 0.45;
    addInterval(setInterval(() => { if (done) return; pos += dir * spd; if (pos >= 100 || pos <= 0) { dir *= -1; pos = Math.max(0, Math.min(100, pos)); } $('#needle').style.left = pos + '%'; }, 16));
    const press = () => {
      if (done) return;
      if (pos >= zoneAt && pos <= zoneAt + zone) { got++; U.sfx.correct(); FX.burst(...FX.center($('#th')), { n: 14, colors: ['#7ee35a', '#fff'], speed: 160 }); }
      else { stam--; U.sfx.wrong(); FX.shake(0.6); }
      $('#got').textContent = got; $('#stam').textContent = Math.max(0, stam); $('#stamw').innerHTML = stamWheel(Math.max(0, stam), maxStam);
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
    screen(`<div class="page center race-page"><h2>Horse Race!</h2><p class="muted">Tap <b>Gallop!</b> when the needle is in the green zone for a burst of speed. Spurs recharge over time, but a badly timed spur slows you down!</p>
      <div class="track"><svg class="track-bg" viewBox="0 0 400 100" preserveAspectRatio="none"><rect width="400" height="100" fill="#8fbf6a"/><path d="M0,30 Q60,10 120,26 T240,22 T400,18 V0 H0Z" fill="#bfe6ff"/><path d="M0,30 Q60,10 120,26 T240,22 T400,18" stroke="#6f9f50" stroke-width="3" fill="none"/>${Array.from({ length: 21 }, (_, k) => `<path d="M${k * 20},28 v-10" stroke="#f4ead0" stroke-width="2"/>`).join('')}<path d="M0,20 H400" stroke="#f4ead0" stroke-width="1.6"/></svg><div class="finish"><span>FINISH</span></div>${lanes}</div>
      <div class="meter"><div class="zone" style="left:62%;width:22%"></div><div class="needle" id="needle"></div></div>
      <div class="row center"><span class="pill">Spurs: <b id="spurs"></b></span></div>
      <button class="btn big primary" id="gallop">🏇 Gallop!</button></div>`, 'plateau', 'battle');
    let spurs = 3 + h.stamina; const spursMax = spurs; let regen = 0; const showSpurs = () => { const e = $('#spurs'); if (e) e.innerHTML = Array.from({ length: spursMax }, (_, k) => `<i class="spur ${k < spurs ? 'on' : ''}"></i>`).join(''); }; showSpurs();
    let pos = 0, done = false, t0 = performance.now(), finish = [];
    const base = r => 0.22 + r.speed * 0.035 + (r.me ? h.bond * 0.012 : 0);
    addInterval(setInterval(() => {
      if (done) return;
      pos = (pos + 2.2) % 100; $('#needle').style.left = pos + '%';
      if (spurs < spursMax && (regen += 30) >= 3500) { regen = 0; spurs++; showSpurs(); } // spurs recharge, as in the game
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
      if (done || spurs <= 0) return; spurs--; regen = 0; showSpurs();
      const me = racers[0];
      if (pos >= 62 && pos <= 84) { me.boost = 45; U.sfx.correct(); FX.floatText($('#run0'), 'Burst!', 'xp'); } else { me.boost = -1; me.x = Math.max(0, me.x - 1.5); U.sfx.wrong(); FX.floatText($('#run0'), pos < 62 ? 'Too early!' : 'Too late!', 'xp'); }
    };
    on('#gallop', gallop); onKey(e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); gallop(); } });
  }

  /* ---------------- MINI-GAMES ---------------- */
  function ticketGate(name, play) {
    const s = S();
    if (!s.tickets) return UI().modal(`<h3>${name}</h3><p>You need an <b>🎫 Adventure Ticket</b> to play. Clear shrine trials to earn tickets!</p>`, [{ label: 'OK' }]);
    UI().modal(`<h3>${name}</h3><p>Play for <b>🎫 1 Adventure Ticket</b>? You have ${s.tickets}.</p>`, [{ label: 'Not now' }, { label: 'Play! 🎫', cls: 'primary', fn: () => { s.tickets--; State.save(); play(); } }]);
  }

  /* Rito Flight Range: glide over Rito Village and shoot the wooden bullseye targets swinging on ropes in the updraft. */
  function archeryIntro() {
    const s = S(); const { screen, hud, on } = UI();
    screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Flight Range</h2><span class="pill">🎫 ${s.tickets}</span></div>
      <div class="npc-stand big">${ART.teba()}</div>
      <p class="intro slate"><b>Teba:</b> "Ride the updraft over the range and hit as many targets as you can in 30 seconds. Hit the centre for a bonus, and don't miss the golden targets: they're worth 3!"</p>
      <p class="muted">Best score: <b>${s.counters.archeryBest || 0}</b>. Tap a target to fire an arrow at it.</p>
      <button class="btn big primary glow" id="go">🎯 Play (🎫1)</button></div>`, 'verbal', 'verbal');
    on('#back', Game.map); on('#go', () => ticketGate('Flight Range', archery));
  }
  function archery() {
    const { gameScreen, stage, loop, hud: chud, sprite, ready } = MG;
    const el = gameScreen('Flight Range', '<p class="muted">Tap a target to shoot. Centre hits score a bonus!</p>', 'verbal', 'battle');
    const { cv, ctx, W, H } = stage(el, 1.12);
    const link = sprite('glider-' + S().glider, ART.glider(S().glider), 120, 92);
    let left = 30, score = 0, hits = 0, shots = 0, over = false, spawn = 0.2, t = 0;
    const targets = [], arrows = [], bits = [], pops = [];
    const lx = () => W * 0.5 + Math.sin(t * 0.8) * W * 0.18, ly = () => H - 70 + Math.sin(t * 2) * 6;
    cv.addEventListener('pointerdown', e => {
      if (over) return; const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
      if (y > H - 40) return; shots++; arrows.push({ x0: lx(), y0: ly() - 34, x1: x, y1: y, k: 0 }); U.sfx.click();
    });
    loop(cv, dt => {
      t += dt;
      if (!over) {
        left -= dt; spawn -= dt;
        if (spawn <= 0 && targets.filter(q => !q.fall).length < 6) { spawn = 0.75; const gold = Math.random() < 0.16; targets.push({ ax: W * (0.1 + Math.random() * 0.8), len: H * (0.18 + Math.random() * 0.36), sw: 0.3 + Math.random() * 0.4, ph: Math.random() * 6, sp: (gold ? 2.2 : 1.1) + Math.random() * 0.6, r: gold ? 15 : 22, gold, life: gold ? 4 : 9, fall: 0, x: 0, y: 0 }); }
        for (const a of arrows) {
          a.k += dt / 0.16;
          if (a.k >= 1 && !a.done) {
            a.done = true;
            const tg = targets.find(q => !q.fall && Math.hypot(q.x - a.x1, q.y - a.y1) <= q.r + 3);
            if (tg) {
              const bull = Math.hypot(tg.x - a.x1, tg.y - a.y1) < tg.r * 0.36; const pts = (tg.gold ? 3 : 1) + (bull ? 1 : 0);
              score += pts; hits++; tg.fall = 1; tg.vy = -80; U.sfx.hit(); pops.push({ x: tg.x, y: tg.y, txt: `${bull ? 'Bullseye! ' : ''}+${pts}`, life: 0.9, gold: tg.gold || bull });
              for (let i = 0; i < 12; i++) bits.push({ x: tg.x, y: tg.y, vx: (Math.random() - 0.5) * 240, vy: -Math.random() * 200, life: 0.7, c: i % 2 ? '#c8a06a' : (tg.gold ? '#ffd23d' : '#d8402e') });
            }
          }
        }
        for (let i = arrows.length - 1; i >= 0; i--) if (arrows[i].k > 1.6) arrows.splice(i, 1);
        if (left <= 0) {
          over = true; const s = S(); const best = score > (s.counters.archeryBest || 0); State.countMax('archeryBest', score); const prize = score * 3; s.rupees += prize; State.save();
          MG.finish('Time\'s up!', `<p>You scored <b>${score}</b> with ${hits} hit${hits === 1 ? '' : 's'} from ${shots} arrow${shots === 1 ? '' : 's'}${best ? ' — a new best! 🏆' : ''}</p><p>Prize: <b>${prize} rupees</b></p>`, archeryIntro);
        }
      }
      for (const q of targets) {
        if (q.fall) { q.vy += 600 * dt; q.y += q.vy * dt; q.fall += dt; continue; }
        q.life -= dt; const ang = Math.sin(t * q.sp + q.ph) * q.sw; q.x = q.ax + Math.sin(ang) * q.len; q.y = Math.cos(ang) * q.len;
      }
      for (let i = targets.length - 1; i >= 0; i--) if (targets[i].y > H + 40 || (!targets[i].fall && targets[i].life <= 0)) targets.splice(i, 1);
      // Rito Village sky: clouds, the great stone spire with its perches, the swirling updraft
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#5aa0e8'); sky.addColorStop(1, '#cfe8fa'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 5; i++) { const x = ((i * 140 + t * 12) % (W + 160)) - 80, y = 40 + (i * 53) % (H * 0.5); ctx.beginPath(); ctx.ellipse(x, y, 40, 12, 0, 0, Math.PI * 2); ctx.ellipse(x + 22, y - 8, 24, 12, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#7a8a9a'; ctx.beginPath(); ctx.moveTo(-10, H); ctx.lineTo(W * 0.04, H * 0.28); ctx.lineTo(W * 0.1, H * 0.22); ctx.lineTo(W * 0.16, H * 0.3); ctx.lineTo(W * 0.2, H); ctx.fill();
      ctx.strokeStyle = '#5a6a7a'; ctx.lineWidth = 2; ctx.stroke();
      for (const [y, w] of [[0.36, 0.16], [0.55, 0.18], [0.74, 0.2]]) { ctx.fillStyle = '#7a5230'; ctx.fillRect(W * 0.02, H * y, W * w, 5); ctx.fillStyle = '#c63b4f'; ctx.beginPath(); ctx.moveTo(W * 0.04, H * y); ctx.lineTo(W * 0.09, H * y - 14); ctx.lineTo(W * (0.02 + w), H * y); ctx.fill(); }
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const y = H - ((t * 90 + i * 60) % (H + 60)); const x = W * 0.5 + Math.sin(y / 40 + i) * 26; ctx.beginPath(); ctx.arc(x, y, 10 + (i % 3) * 4, 0.3, 2.6); ctx.stroke(); }
      for (const q of targets) {
        ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 1.4; if (!q.fall) { ctx.beginPath(); ctx.moveTo(q.ax, 0); ctx.lineTo(q.x, q.y - q.r); ctx.stroke(); }
        ctx.save(); ctx.translate(q.x, q.y); if (q.fall) ctx.rotate(q.fall * 6);
        if (q.gold) { ctx.shadowColor = '#ffd23d'; ctx.shadowBlur = 14; }
        ctx.beginPath(); ctx.arc(0, 0, q.r, 0, Math.PI * 2); ctx.fillStyle = q.gold ? '#c99a0c' : '#8a5a2b'; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.strokeStyle = '#1d1a2b'; ctx.stroke();
        const rings = q.gold ? ['#fff6c8', '#ffd23d', '#fff6c8', '#e8a020'] : ['#f4ead0', '#d8402e', '#f4ead0', '#d8402e'];
        rings.forEach((c, k) => { ctx.beginPath(); ctx.arc(0, 0, q.r * (0.82 - k * 0.18), 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); });
        ctx.strokeStyle = 'rgba(90,58,34,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-q.r, 0); ctx.lineTo(q.r, 0); ctx.stroke(); ctx.restore();
      }
      for (const a of arrows) {
        const k = Math.min(1, a.k); const x = a.x0 + (a.x1 - a.x0) * k, y = a.y0 + (a.y1 - a.y0) * k; const ang = Math.atan2(a.y1 - a.y0, a.x1 - a.x0);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = a.k > 1 ? Math.max(0, 1.6 - a.k) / 0.6 : 1;
        ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.fillStyle = '#c8c8c8'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-3, -3.4); ctx.lineTo(-3, 3.4); ctx.fill(); ctx.fillStyle = '#e8402e'; ctx.fillRect(-27, -3, 6, 2); ctx.fillRect(-27, 1, 6, 2); ctx.restore();
      }
      for (let i = bits.length - 1; i >= 0; i--) { const p = bits[i]; p.life -= dt; if (p.life <= 0) { bits.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); ctx.globalAlpha = 1; }
      for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.life -= dt; if (p.life <= 0) { pops.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, p.life * 2); ctx.font = '800 16px Lexend, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#1d1a2b'; ctx.strokeText(p.txt, p.x, p.y - (0.9 - p.life) * 40); ctx.fillStyle = p.gold ? '#ffd23d' : '#fff'; ctx.fillText(p.txt, p.x, p.y - (0.9 - p.life) * 40); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
      if (ready(link)) ctx.drawImage(link, lx() - 54, ly() - 70, 108, 83);
      chud(ctx, W, [`🎯 ${score}`, `⏱ ${Math.max(0, Math.ceil(left))}`]);
    });
  }

  /* Kass's Song: Kass plays a melody on the five Ocarina buttons (A and the four C buttons); play it back note for note. */
  const SONG_PADS = [['A', 587.33, 'a'], ['▲', 1174.66, 'up'], ['◀', 987.77, 'left'], ['▶', 880, 'right'], ['▼', 698.46, 'down']];
  const STAFF_Y = { a: 4, down: 3, right: 2, left: 1, up: 0 };
  function kassIntro() {
    const s = S(); const { screen, hud, on } = UI();
    screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Kass's Song</h2><span class="pill">🎫 ${s.tickets}</span></div>
      <div class="npc-stand big">${ART.kass()}</div>
      <p class="intro slate"><b>Kass:</b> "Ah, a fellow music lover! Listen closely to my melody, then play it back on the five ocarina buttons. Each round adds one more note."</p>
      <p class="muted">Longest melody: <b>${s.counters.songBest || 0}</b> notes.</p>
      <button class="btn big primary glow" id="go">🎵 Play (🎫1)</button></div>`, 'verbal', 'field');
    on('#back', Game.map); on('#go', () => ticketGate('Kass\'s Song', kass));
  }
  function kass() {
    const { screen } = UI(); const seq = []; let input = 0, busy = true, over = false;
    screen(`<div class="page center"><h2>🎵 Kass's Song</h2>
      <div class="kass-row"><div class="kass-mini">${ART.kass()}</div><div class="staff" id="staff"><div class="lines">${'<i></i>'.repeat(5)}</div><div class="notes" id="notes"></div></div></div>
      <p id="msg" class="muted">Listen…</p>
      <div class="ocarina"><button class="oc oc-a" data-pad="0">A</button><div class="cpad">${[1, 2, 3, 4].map(i => `<button class="oc oc-c ${SONG_PADS[i][2]}" data-pad="${i}">${SONG_PADS[i][0]}</button>`).join('')}</div></div>
      <p>Melody length: <b id="len">0</b></p></div>`, 'verbal', 'home');
    const notes = () => $('#notes');
    const addNote = (i, cls = '') => { const n = notes(); if (!n) return; const p = SONG_PADS[i]; const d = document.createElement('span'); d.className = 'note ' + p[2] + ' ' + cls; d.style.top = (STAFF_Y[p[2]] * 11 + 2) + 'px'; d.textContent = p[0]; n.appendChild(d); };
    const flash = i => { const b = $(`[data-pad="${i}"]`); if (!b) return; b.classList.add('lit'); playNote(SONG_PADS[i][1]); setTimeout(() => b.classList.remove('lit'), 320); };
    const round = () => {
      if (!$('#len')) return; seq.push(U.int(0, 4)); $('#len').textContent = seq.length; busy = true; input = 0; $('#msg').textContent = 'Kass plays…'; notes().innerHTML = '';
      seq.forEach((n, k) => setTimeout(() => { if (!$('#len')) return; flash(n); addNote(n, 'kass-note'); }, 600 + k * 560));
      setTimeout(() => { busy = false; if ($('#msg')) { $('#msg').textContent = 'Your turn!'; notes().innerHTML = ''; } }, 900 + seq.length * 560);
    };
    const end = () => {
      over = true; const s = S(); const len = seq.length - 1; State.countMax('songBest', len); const prize = len * 12; s.rupees += prize; State.save();
      UI().modal(`<h3>${len >= 8 ? 'What a performance!' : 'Lovely playing!'}</h3><p>You remembered <b>${len}</b> note${len === 1 ? '' : 's'}.</p><p>Prize: <b>${prize} rupees</b></p>`, [{ label: 'Done', cls: 'primary', fn: kassIntro }]);
    };
    const press = i => {
      if (busy || over) return; flash(i);
      if (i !== seq[input]) { addNote(i, 'wrong'); U.sfx.wrong(); return end(); }
      addNote(i); input++; if (input === seq.length) { busy = true; $('#msg').textContent = 'Brilliant!'; setTimeout(round, 800); }
    };
    $$('[data-pad]').forEach(b => b.addEventListener('pointerdown', () => press(+b.dataset.pad)));
    UI().onKey(e => { const k = { a: 0, Enter: 0, ArrowUp: 1, ArrowLeft: 2, ArrowRight: 3, ArrowDown: 4 }[e.key]; if (k !== undefined) { e.preventDefault(); press(k); } });
    setTimeout(round, 400);
  }
  let actx;
  function playNote(f) { if (!S().settings.sound) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), o2 = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2; const g2 = actx.createGain(); g2.gain.value = 0.15; g.gain.setValueAtTime(0.0001, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.22, actx.currentTime + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.6); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(actx.destination); o.start(); o2.start(); o.stop(actx.currentTime + 0.65); o2.stop(actx.currentTime + 0.65); } catch (e) { /* no audio */ } }

  /* Korok hide-and-seek in the Lost Woods: watch which big leaf the Korok hides under while they shuffle. */
  const LEAF = `<svg class="leaf-svg" viewBox="0 0 100 80"><ellipse cx="50" cy="74" rx="34" ry="5" fill="#000" opacity=".25"/><path d="M50,76 C20,72 6,52 10,34 C14,18 34,6 50,2 C66,6 86,18 90,34 C94,52 80,72 50,76Z" fill="#5fae3e" stroke="#1d1a2b" stroke-width="2.4"/><path d="M50,74 V6 M50,22 L36,14 M50,22 L64,14 M50,36 L26,26 M50,36 L74,26 M50,50 L20,42 M50,50 L80,42 M50,63 L26,58 M50,63 L74,58" stroke="#3f8f2d" stroke-width="2" fill="none"/><path d="M50,76 Q48,80 44,80" stroke="#6b4423" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M20,36 Q26,22 38,16" stroke="#9fe07a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;
  function leafIntro() {
    const s = S(); const { screen, hud, on } = UI();
    screen(`${hud()}<div class="page center"><div class="page-head">${back()}<h2>Korok Hide-and-Seek</h2><span class="pill">🎫 ${s.tickets}</span></div>
      <div class="npc-stand">${ART.korok()}</div>
      <p class="intro slate"><b>Korok:</b> "Yahaha! I'll hide under one of these big leaves, then shuffle them around. Find me! Every 2 rounds you win, I'll give you a Korok seed!"</p>
      <p class="muted">Times found: <b>${s.counters.leafWins || 0}</b></p>
      <button class="btn big primary glow" id="go">🍃 Play (🎫1)</button></div>`, 'plateau', 'field');
    on('#back', Game.map); on('#go', () => ticketGate('Hide-and-Seek', leafGame));
  }
  function leafGame() {
    const { screen } = UI(); let roundN = 0, wins = 0;
    screen(`<div class="page center"><h2>🍃 Where's the Korok?</h2><p id="msg" class="muted"></p>
      <div class="woods-clearing"><div class="leaves" id="leaves">${[0, 1, 2].map(i => `<button class="leaf" data-leaf="${i}" style="left:${8 + i * 32}%"><span class="kk">${ART.korok(true)}</span><span class="lf">${LEAF}</span></button>`).join('')}</div></div>
      <p>Round <b id="rn">1</b> · Found <b id="wn">0</b></p></div>`, 'plateau', 'field');
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
        wins++; $('#wn').textContent = wins; U.sfx.korok(); State.count('leafWins'); FX.floatText(b, 'Yahaha! You found me!', 'xp');
        const s = S(); if (wins % 2 === 0) { s.seeds++; s.seedsTotal++; FX.banner('+1 Korok Seed!', 'grace'); } State.save();
        setTimeout(round, 1400);
      } else { U.sfx.wrong(); $('#msg').textContent = 'Oh no! It was over there!'; setTimeout(() => { const s = S(); const prize = wins * 8; s.rupees += prize; State.save(); UI().modal(`<h3>Game over</h3><p>You found the Korok <b>${wins}</b> time${wins === 1 ? '' : 's'}.</p><p>Prize: <b>${prize} rupees</b>${wins >= 2 ? ` and ${Math.floor(wins / 2)} Korok seed${wins >= 4 ? 's' : ''}` : ''}</p>`, [{ label: 'Done', cls: 'primary', fn: leafIntro }]); }, 1200); }
    }));
    setTimeout(round, 500);
  }

  /* ---------------- HOUSE ---------------- */
  // the house lives in house.js (room scene + Hall of Fame)
  function house() { return House.show(); }

  /* ---------------- SIDE QUESTS ---------------- */
  function quests() {
    const s = S(); const { screen, hud, on, sequence } = UI();
    const lockedRegions = STORY.regions.filter(r => !s.bosses[r.id]);
    const list = K.QUESTS.filter(q => State.questOpen(q)).map(q => { const v = State.questValue(q.goal[0]); const done = v >= q.goal[1]; const claimed = s.quests[q.id]; return { q, v: Math.min(v, q.goal[1]), done, claimed }; })
      .sort((a, b) => (a.claimed - b.claimed) || (b.done - a.done));
    const rewardTxt = r => [r.rupees && `${fmt(r.rupees)} rupees`, r.tickets && `${r.tickets} tickets`, r.armour && K.ARMOUR.find(x => x.id === r.armour).name, r.saddle && K.SADDLES.find(x => x.id === r.saddle).name, r.pet && 'companion: ' + K.PETS.find(x => x.id === r.pet).name, r.theme && 'Slate colour: ' + K.THEMES.find(x => x.id === r.theme).name, r.decor && K.DECOR.find(x => x.id === r.decor).name, r.item && Object.keys(r.item).map(k => K.ITEMS.find(x => x.id === k).name).join(', '), r.ingredient && Object.keys(r.ingredient).map(k => ING(k).name).join(', ')].filter(Boolean).join(' · ');
    screen(`${hud()}<div class="page"><div class="page-head">${back()}<h2>Side Quests</h2><span class="pill">${Object.keys(s.quests).length}/${K.QUESTS.length} done</span></div>
      ${lockedRegions.map(r => `<div class="quest slate locked-q"><span class="q-ico">🔒</span><div><h3>${r.name}</h3><p class="muted">Free ${r.beast} to meet the locals and unlock their quests and mini-game.</p></div></div>`).join('')}
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

  window.World = { ticketGate, checkMastery, masteryPanel, masteryProgress, applyTheme, shop, bag, kitchen, stable, wildField, archeryIntro, kassIntro, leafIntro, house, quests, fairy, trialDrops, grant, mealInfo };
  if (S()) applyTheme();
})();
