// Save data, progression rules and mastery tracking.
(function () {
  const KEY = 'botk-save-v1';
  const today = () => new Date().toISOString().slice(0, 10);

  const SUBJECTS = ['maths', 'english', 'verbal', 'nonverbal'];
  const SUBJECT_NAMES = { maths: 'Maths', english: 'English', verbal: 'Verbal Reasoning', nonverbal: 'Non-Verbal Reasoning' };

  const WEAPONS = [
    { id: 'traveler', name: 'Traveller\'s Sword', emoji: '🗡️', dmg: 10, price: 0 },
    { id: 'soldier', name: 'Soldier\'s Broadsword', emoji: '⚔️', dmg: 13, price: 200 },
    { id: 'knight', name: 'Knight\'s Claymore', emoji: '🔱', dmg: 16, price: 500 },
    { id: 'royal', name: 'Royal Guard\'s Sword', emoji: '👑', dmg: 20, price: 1000 },
    { id: 'master', name: 'Master Sword', emoji: '✨', dmg: 26, price: null },
  ];
  const SHIELDS = [
    { id: 'none', name: 'Pot Lid', emoji: '🍳', blocks: 0, price: 0 },
    { id: 'traveler', name: 'Traveller\'s Shield', emoji: '🛡️', blocks: 1, price: 300 },
    { id: 'hylian', name: 'Hylian Shield', emoji: '🔰', blocks: 2, price: 900 },
  ];
  const ARMOUR = [
    { id: 'tunic', name: 'Hylian Tunic', emoji: '👕', desc: 'Cosy and reliable.', price: 0 },
    { id: 'sheikah', name: 'Sheikah Set', emoji: '🥷', desc: 'Koroks are much easier to find.', price: 250 },
    { id: 'champion', name: 'Champion\'s Tunic', emoji: '💙', desc: '+25% rupees from every correct answer.', price: 600 },
  ];
  const ITEMS = [
    { id: 'hearty', name: 'Hearty Elixir', emoji: '❤️', desc: '+3 extra hearts in your next battle.', price: 40 },
    { id: 'hasty', name: 'Hasty Elixir', emoji: '💨', desc: '+20 seconds on every timer in your next battle.', price: 30 },
    { id: 'fairy', name: 'Fairy', emoji: '🧚', desc: 'If you run out of hearts, a fairy revives you with 3 hearts.', price: 80 },
    { id: 'bombarrow', name: 'Bomb Arrows', emoji: '🏹', desc: 'Use in a boss battle: next correct answer deals double damage.', price: 35 },
  ];
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
      items: { hearty: 0, hasty: 0, fairy: 0, bombarrow: 0 },
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
      swordBest: 0,
      mocks: [], // {date, subject, score, total}
      settings: { sound: true, timers: true, speech: true },
    };
  }

  const State = {
    SUBJECTS, SUBJECT_NAMES, WEAPONS, SHIELDS, ARMOUR, ITEMS, MASTER_SWORD_HEARTS, HESTU_COSTS,
    s: null,
    load() {
      try { const raw = localStorage.getItem(KEY); if (raw) { this.s = Object.assign(fresh(), JSON.parse(raw)); return true; } } catch (e) { /* storage blocked */ }
      this.s = null; return false;
    },
    newGame(hero) { this.s = fresh(); this.s.hero = hero || 'Link'; this.save(); },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* storage full or blocked */ } },
    wipe() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } this.s = null; },
    exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(this.s)))); },
    importCode(code) { const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (!obj || obj.v !== 1) throw new Error('Not a save code'); this.s = Object.assign(fresh(), obj); this.save(); },

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
    rupeeBonus() { return this.s.armour === 'champion' ? 1.25 : 1; },
    korokChance() { return this.s.armour === 'sheikah' ? 0.16 : 0.07; },
    timerBonus() { return this.s.stamina * 6; },

    /* ---- mastery ---- */
    record(topicId, lv, correct) {
      const m = (this.s.mastery[topicId] = this.s.mastery[topicId] || []);
      m.push({ l: lv, c: correct ? 1 : 0 }); if (m.length > 30) m.shift();
      const st = this.s.stats; st.answered++; if (correct) { st.correct++; this.s.daily.correct++; }
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
  };

  window.State = State;
})();
