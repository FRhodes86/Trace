// The main story: chapters with objectives, chapter title cards, and story scenes that play at key moments
// (after the Great Plateau, halfway through each region, when a Divine Beast can be boarded, after each Blight falls,
// when the Master Sword is within reach, and before and after the final battle). The guide is Elder Kiyo, an original
// Sheikah elder; Zelda speaks to the hero across Hyrule. Scenes play once each and are remembered in the save.
(function () {
  const S = () => State.s;
  const UI = () => Game.ui;
  const name = () => U.esc(S().hero);
  const R = id => STORY.regions.find(r => r.id === id);
  const beastShort = r => r.beast.replace('Divine Beast ', '');

  /* ---------------- chapters ---------------- */
  const CHAPTERS = [
    { id: 'plateau', title: 'The Great Plateau', done: () => State.plateauDone(),
      goal: () => 'Clear the four shrines of the Great Plateau to earn the Sheikah runes.',
      recap: () => `${name()} woke in a silent shrine with no memories. An old man on the Great Plateau taught the four runes, and gave the hero a paraglider to leave the plateau behind.` },
    { id: 'kiyo', title: 'The Elder\'s Tale', done: () => !!S().flags['story-kiyo'],
      goal: () => 'Return to the map to hear Elder Kiyo\'s tale.',
      recap: () => 'Elder Kiyo told the story of the Calamity and the Fog of Forgetting, which steals knowledge from the people of Hyrule. Only a hero who keeps learning can push it back.' },
    { id: 'beasts', title: 'The Four Divine Beasts', done: () => State.bossesBeaten() >= 4,
      goal: () => nextBeastGoal(),
      recap: () => 'One by one, the Blights fell and the Champions\' spirits were set free. Each Divine Beast turned its beam towards Hyrule Castle.' },
    { id: 'sword', title: 'The Blade of Evil\'s Bane', done: () => S().ownedWeapons.includes('master') || !!S().calamity,
      goal: () => S().hearts >= State.MASTER_SWORD_HEARTS ? 'Your heart is strong enough. Draw the Master Sword in the Lost Woods.' : `Grow to ${State.MASTER_SWORD_HEARTS} hearts (you have ${S().hearts}). Free Divine Beasts, and trade Spirit Orbs at a Goddess Statue.`,
      recap: () => 'Deep in the misty Lost Woods, the legendary sword recognised a hero who never stopped learning.' },
    { id: 'castle', title: 'Hyrule Castle', done: () => !!S().calamity,
      goal: () => State.calamityUnlocked() ? 'Storm Hyrule Castle and defeat Calamity Ganon.' : 'Free all four Divine Beasts to break the castle\'s defences.',
      recap: () => 'At Hyrule Castle, Zelda and the hero faced Calamity Ganon together, and sealed it away.' },
    { id: 'legend', title: 'A Legend Remembered', done: () => !!S().mastered.all,
      goal: () => 'Earn ★★★ in every shrine in Hyrule to complete the legend.',
      recap: () => 'Every shrine in Hyrule, mastered. The Fog of Forgetting is gone for good, and Hyrule will remember this hero forever.' },
  ];
  function current() { const i = CHAPTERS.findIndex(c => !c.done()); return i < 0 ? { i: CHAPTERS.length - 1, c: CHAPTERS[CHAPTERS.length - 1], all: true } : { i, c: CHAPTERS[i] }; }
  function nextBeastGoal() {
    const s = S(); const left = STORY.regions.filter(r => !s.bosses[r.id]);
    if (!left.length) return 'All four Divine Beasts are free!';
    const ready = left.find(r => State.bossUnlocked(r)); if (ready) return `${beastShort(ready)} is ready! Board it in ${ready.name} and defeat ${ready.boss}.`;
    const best = left.slice().sort((a, b) => State.regionStars(b) - State.regionStars(a))[0];
    if (!s.fog[best.id]) return `Travel to ${best.name} and activate its Sheikah Tower.`;
    const need = State.bossNeed(best) - State.regionStars(best);
    return need > 0 ? `Earn ${need} more ★ in ${best.name} to board ${beastShort(best)} (${State.bossesBeaten()}/4 freed).` : `Clear the first trial in every shrine of ${best.name} to board ${beastShort(best)}.`;
  }
  function banner() {
    const { i, c, all } = current();
    return `<button class="mainquest slate" id="mainquest"><span class="mq-ico">📜</span><div><small>${all && c.done() ? 'Main quest complete!' : `Chapter ${i + 1} · ${c.title}`}</small><b>${all && c.done() ? 'You are a legend of Hyrule. Keep training to stay sharp!' : c.goal()}</b></div><span class="mq-go">›</span></button>`;
  }

  /* ---------------- chapter title card ---------------- */
  function card(num, title, sub, done) {
    const el = document.createElement('div'); el.className = 'chapter-card';
    el.innerHTML = `<div class="cc-inner"><small>${num}</small><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}<span class="cc-tap">tap to continue</span></div>`;
    document.body.appendChild(el); U.sfx.orb();
    requestAnimationFrame(() => el.classList.add('in'));
    let gone = false; const close = () => { if (gone) return; gone = true; el.classList.remove('in'); setTimeout(() => { el.remove(); done && done(); }, 500); };
    setTimeout(() => el.addEventListener('click', close), 700); setTimeout(close, FX.reduce ? 200 : 4200);
  }

  /* ---------------- story scenes ---------------- */
  const seen = id => !!S().flags['story-' + id];
  const mark = id => { S().flags['story-' + id] = true; State.save(); };
  const say = (lines, done) => UI().dialogue(lines, done);
  const SPIRIT = {
    maths: ['Daruk', 'Hey, little guy… can you hear me? It\'s me, Daruk. I\'m stuck inside Vah Rudania with that nasty Fireblight. Keep crunching those numbers. Every shrine you clear cracks its armour!'],
    english: ['Mipha', 'Is someone there? It\'s Mipha. The Waterblight is using Ruta to flood the land with muddled words. Every sentence you untangle washes a little of its power away. Please… keep going.'],
    verbal: ['Revali', 'Well, well. So you\'re the one everyone\'s talking about. Revali here, stuck in Medoh, of all the indignities. The Windblight twists words into riddles. Solve enough of them and I might, just might, be impressed.'],
    nonverbal: ['Urbosa', 'Little one, it\'s Urbosa. The Thunderblight hides its tricks in shapes and patterns. Learn to see the pattern before it strikes, and you\'ll beat it every time.'],
  };
  const ZELDA = [
    'Can you hear me? It\'s Zelda. I felt it: one of the Divine Beasts is free! I\'m holding the Calamity back inside the castle, but I can feel my strength returning. Keep going!',
    'Two Champions are free! Each time you master something new, the Fog of Forgetting grows thinner. I can see a little light through the windows of the castle now.',
    'Three Divine Beasts! Calamity Ganon is furious. It\'s trying to make everyone forget how to think. One more, and its defences will fall!',
    'All four Champions are free, and their beams are aimed at the castle! Gather your courage. Train in the shrines if you need to, and come to me when you are ready.',
  ];
  // returns a function that plays the next pending scene for this place, or null
  function beat(where, region) {
    const s = S(); if (!s) return null;
    if (where === 'map') {
      if (State.plateauDone() && !seen('kiyo')) return () => { mark('kiyo'); card('Chapter 2', 'The Elder\'s Tale', 'An old friend has been waiting for you…', () => say([
        ['Elder Kiyo', `So, the hero wakes at last. I am Kiyo, eldest of the Sheikah. I have waited a hundred years to meet you, ${name()}.`, 'Elder Kiyo'],
        ['Elder Kiyo', 'Long ago, Calamity Ganon rose and wrapped Hyrule in the Fog of Forgetting. It steals what people know: numbers, words, patterns, all slipping away like sand.', 'Elder Kiyo'],
        ['Elder Kiyo', 'It took control of the four Divine Beasts, and trapped the Champions inside with its Blights. Princess Zelda is still holding the Calamity back inside Hyrule Castle, alone.', 'Elder Kiyo'],
        ['Elder Kiyo', 'The Fog cannot touch a mind that keeps learning. Clear the shrines in each region, grow wiser and stronger, and free the Divine Beasts one by one.', 'Elder Kiyo'],
        ['Elder Kiyo', 'Your Sheikah Slate will show your next task at the top of the map. Now go! Hyrule is counting on you.', 'Elder Kiyo'],
      ], () => card('Chapter 3', 'The Four Divine Beasts', 'Death Mountain · Zora\'s Domain · Rito Village · Gerudo Desert'))); };
      const freed = State.bossesBeaten();
      for (let n = 1; n <= freed; n++) if (!seen('zelda' + n)) return () => { mark('zelda' + n); say([['Zelda', ZELDA[n - 1]]], () => n === 4 && !seen('ch5') ? (mark('ch5'), card('Chapter 5', 'Hyrule Castle', 'The final battle awaits')) : null); };
      if (freed >= 1 && s.hearts >= State.MASTER_SWORD_HEARTS && !s.ownedWeapons.includes('master') && !seen('swordcall')) return () => { mark('swordcall'); card('Chapter 4', 'The Blade of Evil\'s Bane', '', () => say([['Elder Kiyo', 'Your heart has grown strong. Deep in the Lost Woods rests a blade that only a true hero can draw. I think it has been waiting for you.', 'Elder Kiyo']])); };
      if (Hunts.unlocked('hinox') && !seen('hinox')) return () => { mark('hinox'); say([['Elder Kiyo', 'Be careful out there. A giant Hinox has been seen sleeping in Hyrule Field. Strike it while it sleeps and it will drop rare treasures. It comes back every day, stronger each time!', 'Elder Kiyo']]); };
      if (Hunts.unlocked('molduga') && !seen('molduga')) return () => { mark('molduga'); say([['Riju', 'Hero! A Molduga is swimming through the sand near Gerudo Town. It\'s huge! If you\'re brave enough to hunt it, the reward will be worth it.']]); };
      if (s.calamity && !seen('epilogue')) return () => { mark('epilogue'); card('Epilogue', 'A Legend Remembered', 'Master every shrine in Hyrule to complete the legend', () => say([['Zelda', 'The Calamity is sealed, but the Fog of Forgetting still lingers in quiet places. If every shrine in Hyrule is mastered, it will be gone forever. Shall we finish what we started?']])); };
      return null;
    }
    if (where === 'region' && region) {
      const r = region; const stars = State.regionStars(r), need = State.bossNeed(r);
      if (s.bosses[r.id]) return null;
      if (State.bossUnlocked(r) && !seen('ready-' + r.id)) return () => { mark('ready-' + r.id); FX.shake(1.2); U.sfx.boss(); say([[r.champion, `${beastShort(r)} is shaking… the ${r.boss} knows you're coming. You've trained hard enough. Board the Divine Beast and set me free!`]]); };
      if (stars >= Math.ceil(need / 2) && !seen('half-' + r.id)) return () => { mark('half-' + r.id); FX.flash('#bff8ff', 0.4); say([SPIRIT[r.id]]); };
    }
    return null;
  }

  /* ---------------- journal (Adventure Log tab) ---------------- */
  function journal() {
    const { i } = current();
    return `<div class="journal">${CHAPTERS.map((c, k) => {
      const done = c.done(); const cur = k === i && !done;
      return `<div class="chapter slate ${done ? 'done' : cur ? 'current' : 'locked'}"><span class="ch-num">${done ? '✓' : k + 1}</span><div>
        <h3>Chapter ${k + 1}: ${k <= i || done ? c.title : '???'}</h3>
        <p>${done ? c.recap() : cur ? `<b>Current task:</b> ${c.goal()}` : 'This part of the story is still to come…'}</p></div></div>`;
    }).join('')}</div>`;
  }

  window.Storyline = { beat, banner, journal, current, CHAPTERS };
})();
