// Monster Hunts: giant mini-bosses that appear on the map as the story moves on. Each can be defeated once a day for big
// rewards, and returns tougher (three levels). Questions come from every subject, weighted towards weaker topics.
//  - Hinox: starts asleep, so the first three correct answers are sneak attacks (double damage); combos of 3 hit its eye.
//  - Molduga: dives into the sand after a wrong answer (healing a little); the next correct answer is a bomb lure for double damage.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const S = () => State.s;
  const UI = () => Game.ui;
  const K = CATALOG;
  const today = () => new Date().toISOString().slice(0, 10);
  const LEVELS = ['', 'Blue ', 'Black '];

  const HUNTS = {
    hinox: {
      name: 'Hinox', where: 'Hyrule Field', theme: 'plateau', art: lv => ART.hinox(lv), needBosses: 1,
      hp: [100, 130, 170], rupees: [250, 400, 650], tickets: [3, 4, 5], mats: [['hinoxtoe', 2], ['hinoxguts', 1]],
      intro: 'A giant one-eyed Hinox is snoring in Hyrule Field! Creep up while it sleeps: your first three correct answers are sneak attacks for double damage. Once it wakes, build combos of 3 to strike its eye!',
      tip: '😴 Sneak attack: first 3 hits deal double damage · 👁️ Every 3-answer combo hits its eye',
    },
    molduga: {
      name: 'Molduga', where: 'the Gerudo Desert', theme: 'nonverbal', art: lv => ART.molduga(lv), needBosses: 2,
      hp: [110, 140, 180], rupees: [300, 450, 700], tickets: [3, 4, 5], mats: [['moldugafin', 2], ['moldugaguts', 1]],
      intro: 'The sand is shaking… a Molduga is hunting in the Gerudo Desert! Each wrong answer lets it dive under the sand and heal. Answer correctly to lure it out with a bomb for a huge hit!',
      tip: '🏜️ It dives (and heals) after a wrong answer · 💣 The next right answer lures it out for double damage',
    },
  };

  const rec = id => { const s = S(); s.hunts = s.hunts || {}; return s.hunts[id] || (s.hunts[id] = { level: 0, beatenOn: '', kills: 0 }); };
  function unlocked(id) { const H = HUNTS[id]; return !!S() && State.bossesBeaten() >= H.needBosses; }
  function available(id) { return unlocked(id) && rec(id).beatenOn !== today(); }

  /* ---------- the hunt screen ---------- */
  function intro(id) {
    const s = S(); const H = HUNTS[id]; const r = rec(id); const { screen, hud, on } = UI();
    const lvName = LEVELS[r.level] + H.name;
    const beaten = r.beatenOn === today();
    screen(`${hud()}<div class="page center hunt-page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Monster Hunt: ${lvName}</h2></div>
      <div class="hunt-art ${beaten ? 'beaten' : ''} ${id}">${H.art(r.level)}</div>
      <p class="intro slate"><b>Elder Kiyo:</b> "${H.intro}"</p>
      <p class="muted">${H.tip}</p>
      <div class="hunt-loot slate"><b>Rewards</b><span>${ART.icons.rupee('gold')} ${H.rupees[r.level]} rupees</span><span>🎫 ${H.tickets[r.level]} tickets</span><span>${H.mats.map(([m]) => K.MATERIALS.find(x => x.id === m).emoji).join(' ')} rare monster parts</span>${id === 'hinox' ? '<span>⚔️ a chance at a weapon from its hoard</span>' : '<span>🪙 desert treasure</span>'}</div>
      <p class="muted">Defeated ${r.kills} time${r.kills === 1 ? '' : 's'}. ${r.level < 2 ? `Each victory makes it come back stronger: next is the <b>${LEVELS[Math.min(2, r.level + 1)]}${H.name}</b>.` : 'This is the mightiest of its kind.'}</p>
      ${beaten ? `<p class="ok-note">You defeated it today! It will be back tomorrow… ${r.level ? `as the <b>${lvName}</b>` : ''}</p>` : '<button class="btn big danger glow" id="fight">⚔️ Hunt it!</button>'}
    </div>`, H.theme, 'hunt');
    on('#back', Game.map);
    on('#fight', () => Game.itemPrep(lvName, H.intro, items => fight(id, items), H.art(r.level)));
  }

  function fight(id, items) {
    const s = S(); const H = HUNTS[id]; const r = rec(id); const lv = r.level; const lvName = LEVELS[lv] + H.name;
    const all = State.SUBJECTS.flatMap(x => CONTENT[x]);
    let hits = 0, lure = false;
    const foeEl = () => $('#foe');
    Game.battle({
      kind: 'hunt', title: `Monster Hunt`, subtitle: lvName, total: null, hearts: s.hearts, timer: 60, items, theme: H.theme, music: 'hunt',
      boss: {
        name: lvName, art: H.art(lv), hp: H.hp[lv], element: 'none', theme: H.theme,
        dmg: B => {
          let base = State.weapon().dmg; hits++;
          if (id === 'hinox') {
            if (hits <= 3) { base *= 2; setTimeout(() => FX.banner(hits === 1 ? 'Sneak attack! ×2' : `Sneak attack ${hits}/3! ×2`, 'flurry'), 300); }
            if (hits === 3) setTimeout(() => { const f = foeEl(); if (f) f.classList.add('awake'); FX.shake(1.4); U.sfx.boss(); FX.banner('The Hinox wakes up!', 'danger'); }, 1100);
            if (hits > 3 && B.streak > 0 && B.streak % 3 === 0) { base = Math.round(base * 1.6); setTimeout(() => FX.banner('Eye shot! It staggers!', 'flurry hot'), 300); }
          } else if (lure) {
            base *= 2; lure = false; const f = foeEl(); if (f) f.classList.remove('dive');
            setTimeout(() => { FX.banner('💣 Bomb lure! Direct hit!', 'flurry hot'); FX.shake(1.6); }, 300);
          }
          return base;
        },
      },
      wrongDamage: B => {
        if (id === 'molduga') {
          lure = true; B.hp = Math.min(B.maxHp, B.hp + 6); const f = foeEl(); if (f) f.classList.add('dive');
          setTimeout(() => FX.banner('It dives under the sand!', 'danger'), 600);
        } else if (hits < 3) { hits = 3; setTimeout(() => { const f = foeEl(); if (f) f.classList.add('awake'); FX.banner('You woke the Hinox!', 'danger'); }, 600); }
        return 1;
      },
      next: B => ({ topic: Game.weakWeighted(all), lv: B.hp < B.maxHp / 2 || lv >= 1 ? 3 : 2 }),
      intro: [['Elder Kiyo', id === 'hinox' ? 'Shhh… it\'s asleep. Strike while you can!' : 'Here it comes! Stay sharp. Every mistake gives it a chance to dive.', 'Elder Kiyo']],
      onEnd: res => {
        if (!res.won) return Game.results(res, { heading: `The ${lvName} was too strong…`, retry: () => intro(id), next: Game.map, nextLabel: 'Retreat' });
        r.beatenOn = today(); r.kills++; r.level = Math.min(2, lv + 1); State.count(id + 'Kills');
        const loot = []; s.rupees += H.rupees[lv]; loot.push({ icon: ART.icons.rupee('gold'), label: `${H.rupees[lv]} rupees` });
        s.tickets += H.tickets[lv]; loot.push({ icon: `<span class="emo">${ITEM_ICONS.ticket}</span>`, label: `${H.tickets[lv]} Adventure Tickets` });
        H.mats.forEach(([m, n]) => { const c = n + (lv >= 1 && Math.random() < 0.5 ? 1 : 0); s.materials[m] = (s.materials[m] || 0) + c; const M = K.MATERIALS.find(x => x.id === m); loot.push({ icon: `<span class="emo">${M.emoji}</span>`, label: `${M.name}${c > 1 ? ' ×' + c : ''}` }); });
        const extra = {};
        if (id === 'hinox') { // its hoard: a weapon you don't own yet
          const cap = [1100, 2200, 4000][lv]; const pool = K.WEAPONS.filter(w => w.price && w.price <= cap && !s.ownedWeapons.includes(w.id));
          if (pool.length && Math.random() < 0.7) extra.weapon = U.pick(pool).id;
        } else { s.items.goldnugget = (s.items.goldnugget || 0) + 1 + lv; loot.push({ icon: `<span class="emo">${K.ITEMS.find(i => i.id === 'goldnugget').emoji}</span>`, label: `Gold Nugget ×${1 + lv}` }); }
        const trophy = id === 'hinox' ? 'hinoxtrophy' : 'moldugatrophy'; if (!s.house.decor.includes(trophy)) extra.decor = trophy;
        State.save();
        const rewards = [n => FX.chest(loot, n, `${lvName} defeated!`)];
        if (extra.weapon) { const w = K.WEAPONS.find(x => x.id === extra.weapon); s.ownedWeapons.push(w.id); State.save(); rewards.push(n => FX.itemGet(`<span class="emo big">${w.emoji}</span>`, `From the Hinox's hoard: ${w.name}!`, `Boss damage ${w.dmg}. Equip it in Beedle's shop.`, n)); }
        if (extra.decor) rewards.push(...World.grant({ decor: extra.decor }));
        Game.results(res, { heading: `You defeated the ${lvName}!`, extra: `<div class="reward">It will return tomorrow${r.level > lv ? ` as the <b>${LEVELS[r.level]}${H.name}</b>` : ''}.</div>`, rewards, next: Game.map });
      },
    });
  }

  // map pins for available hunts
  function pins() {
    return Object.keys(HUNTS).filter(unlocked).map(id => {
      const H = HUNTS[id]; const r = rec(id); const up = available(id);
      return `<button class="pin small hunt-pin ${up ? 'ready' : 'resting'}" style="left:${id === 'hinox' ? 41 : 11}%;top:${id === 'hinox' ? 32 : 70}%" data-hunt="${id}"><span class="pin-art sm">${H.art(r.level)}</span><span class="pin-lbl"><b>${LEVELS[r.level]}${H.name}</b><small>${up ? (id === 'hinox' ? 'Sleeping… sneak up!' : 'The sand is shaking!') : 'Back tomorrow'}</small></span></button>`;
    }).join('');
  }

  window.Hunts = { intro, pins, unlocked, available, HUNTS };
})();
