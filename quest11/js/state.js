// Save data, progression rules and mastery tracking.
(function () {
  const KEY = 'botk-save-v1';
  const today = () => new Date().toISOString().slice(0, 10);

  const SUBJECTS = ['maths', 'english', 'verbal', 'nonverbal'];
  const SUBJECT_NAMES = { maths: 'Maths', english: 'English', verbal: 'Verbal Reasoning', nonverbal: 'Non-Verbal Reasoning' };

  const { WEAPONS, SHIELDS, ARMOUR, ITEMS } = window.CATALOG;
  const MASTER_SWORD_HEARTS = 8;
  const HESTU_COSTS = [2, 4, 7, 10, 15];

  function fresh() {
    return {
      v: 1, hero: 'Link', created: Date.now(),
      flags: {}, // introSeen, plateauDone, etc.
      hearts: 3, stamina: 0, orbs: 0, orbsTotal: 0, rupees: 0, seeds: 0, seedsTotal: 0,
      runes: {}, // magnesis/bomb/stasis/cryonis: true
      runeLevel: 1, hestuLevel: 0,
      champions: {}, // daruk/mipha/revali/urbosa: true
      weapon: 'traveler', ownedWeapons: ['traveler'], shield: 'none', ownedShields: ['none'], armour: 'tunic', ownedArmour: ['tunic'],
      items: { hearty: 0, hasty: 0, mighty: 0, fairy: 0, bombarrow: 0, ticket: 0, luckycharm: 0, goldnugget: 0 },
      tickets: 3, ingredients: { apple: 3, shroom: 2, meat: 1, salt: 1 }, materials: {}, meals: {}, recipes: [], buffs: { spicy: 0, electro: 0, chilly: 0 }, lucky: 0,
      horses: [], activeHorse: null, wild: { day: '', herd: [] },
      house: { owned: false, decor: [] }, rested: '',
      theme: 'sheikah', glider: 'hylian', pet: 'none', ownedThemes: ['sheikah'], ownedGliders: ['hylian'], ownedPets: ['none'], ownedSaddles: ['stable'],
      fairy: { open: false, levels: {} },
      quests: {}, counters: {},
      plateau: {}, // subject -> true
      stars: {}, // topicId -> 0..3 (highest trial cleared)
      bosses: {}, // regionId -> true
      calamity: false,
      memories: [],
      mastery: {}, // topicId -> [{l, c}] last 30
      mistakes: [], // {topicId, lv, q}
      stats: { answered: 0, correct: 0, bestStreak: 0, trials: 0, perfect: 0, playSeconds: 0 },
      daily: { date: '', correct: 0, claimed: false },
      streak: { last: '', days: 0, best: 0 },
      swordBest: 0, recentQs: [], recentPassages: [],
      xp: 0, fog: {}, dailyChest: '', lastRegion: 'plateau', compendium: {},
      mocks: [], // {date, subject, score, total}
      settings: { sound: true, music: true, timers: true, speech: true },
    };
  }

  const State = {
    SUBJECTS, SUBJECT_NAMES, WEAPONS, SHIELDS, ARMOUR, ITEMS, MASTER_SWORD_HEARTS, HESTU_COSTS,
    s: null,
    load() {
      try { const raw = localStorage.getItem(KEY); if (raw) { this.s = this.migrate(JSON.parse(raw)); return true; } } catch (e) { /* storage blocked */ }
      this.s = null; return false;
    },
    // older saves: fill in any new fields, including inside nested objects
    migrate(obj) {
      const f = fresh(); const s = Object.assign(f, obj);
      for (const k of ['items', 'buffs', 'house', 'fairy', 'wild', 'settings']) s[k] = Object.assign(fresh()[k], obj[k] || {});
      return s;
    },
    newGame(hero) { this.s = fresh(); this.s.hero = hero || 'Link'; this.save(); },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* storage full or blocked */ } },
    wipe() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } this.s = null; },
    exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(this.s)))); },
    importCode(code) { const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (!obj || obj.v !== 1) throw new Error('Not a save code'); this.s = this.migrate(obj); this.save(); },

    /* ---- daily streak ---- */
    touchDay() {
      const s = this.s, t = today();
      if (s.streak.last !== t) {
        const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        s.streak.days = s.streak.last === y ? s.streak.days + 1 : 1;
        s.streak.best = Math.max(s.streak.best, s.streak.days);
        s.streak.last = t;
      }
      if (s.daily.date !== t) s.daily = { date: t, correct: 0, claimed: false };
      this.save();
    },
    DAILY_GOAL: 20,

    /* ---- equipment ---- */
    weapon() { return WEAPONS.find(w => w.id === this.s.weapon) || WEAPONS[0]; },
    shield() { return SHIELDS.find(w => w.id === this.s.shield) || SHIELDS[0]; },
    armour() { return ARMOUR.find(a => a.id === this.s.armour) || ARMOUR[0]; },
    // armour perk, boosted by Great Fairy upgrades (+25% per level)
    perk() { const a = this.armour(); const lv = this.s.fairy.levels[a.id] || 0; const m = 1 + 0.25 * lv; const p = a.perk || {};
      return { rupees: (p.rupees || 0) * m, xp: (p.xp || 0) * m, korok: p.korok ? 1 + (p.korok - 1) * m : 1, drops: (p.drops || 0) + (lv >= 4 && p.drops ? 1 : 0), subject: p.subject, subjRupees: (p.subjRupees || 0) * m }; },
    rupeeBonus(subject) { const p = this.perk(); return 1 + p.rupees + (subject && subject === p.subject ? p.subjRupees : 0) + (this.s.buffs.spicy > 0 ? 0.5 : 0); },
    xpBonus() { const p = this.perk(); return 1 + p.xp + (this.s.buffs.chilly > 0 ? 0.3 : 0) + (this.s.restedBonus ? 0.1 : 0); },
    korokChance() { return Math.min(0.4, 0.07 * this.perk().korok * (this.s.buffs.electro > 0 ? 2 : 1)); },
    count(key, n = 1) { this.s.counters[key] = (this.s.counters[key] || 0) + n; },
    countMax(key, v) { this.s.counters[key] = Math.max(this.s.counters[key] || 0, v); },
    totalStars() { return Object.values(this.s.stars).reduce((a, b) => a + b, 0); },
    questValue(key) {
      const s = this.s, c = s.counters;
      switch (key) {
        case 'trials': return s.stats.trials; case 'stars': return this.totalStars(); case 'seedsTotal': return s.seedsTotal;
        case 'bestStreak': return s.stats.bestStreak; case 'recipes': return s.recipes.length; case 'house': return s.house.owned ? 1 : 0;
        case 'maxBond': return s.horses.reduce((m, h) => Math.max(m, h.bond), 0); case 'bosses': return this.bossesBeaten();
        case 'mockBest': return s.mocks.reduce((m, x) => Math.max(m, Math.round((x.score / x.total) * 100)), 0);
        default: return c[key] || 0;
      }
    },
    questsReady() { return CATALOG.QUESTS.filter(q => !this.s.quests[q.id] && this.questValue(q.goal[0]) >= q.goal[1]).length; },
    timerBonus() { return this.s.stamina * 6; },

    /* ---- mastery ---- */
    record(topicId, lv, correct) {
      const m = (this.s.mastery[topicId] = this.s.mastery[topicId] || []);
      m.push({ l: lv, c: correct ? 1 : 0 }); if (m.length > 30) m.shift();
      const st = this.s.stats; st.answered++; if (correct) { st.correct++; this.s.daily.correct++; const subj = SUBJECTS.find(x => CONTENT[x].some(t => t.id === topicId)); if (subj) this.count('c_' + subj); }
    },
    // 0..100 — recent accuracy, weighted so that hard questions count for more
    mastery(topicId) {
      const m = this.s.mastery[topicId]; if (!m || !m.length) return 0;
      const w = { 1: 0.55, 2: 0.8, 3: 1 };
      let sum = 0; m.forEach(r => (sum += r.c * w[r.l]));
      const conf = Math.min(1, m.length / 12); // need a decent sample before showing high mastery
      return Math.round((sum / m.length) * 100 * conf);
    },
    subjectMastery(subject) { const ts = CONTENT[subject]; return Math.round(ts.reduce((a, t) => a + this.mastery(t.id), 0) / ts.length); },
    addMistake(topicId, lv, q) {
      this.s.mistakes.push({ topicId, lv, q, t: Date.now() });
      if (this.s.mistakes.length > 40) this.s.mistakes.shift();
    },

    /* ---- progression ---- */
    plateauDone() { return SUBJECTS.every(x => this.s.plateau[x]); },
    regionStars(region) { return CONTENT[region.subject].reduce((a, t) => a + (this.s.stars[t.id] || 0), 0); },
    bossNeed(region) { return CONTENT[region.subject].length * 2; },
    shrineUnlocked(region, idx) { if (idx === 0) return true; const prev = CONTENT[region.subject][idx - 1]; return (this.s.stars[prev.id] || 0) >= 1; },
    bossUnlocked(region) {
      const ts = CONTENT[region.subject];
      return ts.every(t => (this.s.stars[t.id] || 0) >= 1) && this.regionStars(region) >= this.bossNeed(region);
    },
    bossesBeaten() { return STORY.regions.filter(r => this.s.bosses[r.id]).length; },
    calamityUnlocked() { return this.bossesBeaten() === 4; },
    masterSwordReady() { return this.s.hearts >= MASTER_SWORD_HEARTS && this.bossesBeaten() >= 1; },
    hasMemory(id) { return this.s.memories.includes(id); },
    addMemory(id) { if (!this.s.memories.includes(id)) this.s.memories.push(id); },
    runeCharges() { return this.s.runeLevel; },

    /* ---- repeat avoidance: remember fingerprints of recently asked questions ---- */
    qSig(q) {
      const raw = (q.prompt + '|' + (q.visual || '') + '|' + q.options.slice().sort().join('|')).replace(/id="[^"]*"|url\(#[^)]*\)/g, '');
      let h = 5381; for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) | 0;
      return h.toString(36);
    },
    recentlyAsked(sig) { return (this.s.recentQs || []).includes(sig); },
    markAsked(sig) { const r = this.s.recentQs = this.s.recentQs || []; r.push(sig); if (r.length > 600) r.splice(0, r.length - 600); },

    /* ---- hero rank (XP) ---- */
    TITLES: ['Sleepy Hylian', 'Plateau Explorer', 'Shrine Seeker', 'Korok Friend', 'Monster Hunter', 'Rune Master', 'Sheikah Scholar', 'Royal Guard', 'Knight of Hyrule', 'Champion', 'Hero of Wisdom', 'Legend of Hyrule'],
    xpFor(level) { return 60 * level + 15 * level * level; }, // XP needed to go from level-1 to level
    rank() {
      let lv = 1, left = this.s.xp;
      while (left >= this.xpFor(lv)) { left -= this.xpFor(lv); lv++; }
      return { level: lv, into: left, need: this.xpFor(lv), title: this.TITLES[Math.min(this.TITLES.length - 1, Math.floor((lv - 1) / 2))] };
    },
    addXp(n) { const before = this.rank().level; this.s.xp += n; return this.rank().level > before; },
  };

  window.State = State;
})();
