// Game engine: screens, dialogue, battles, rewards.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const S = () => State.s;
  const R = () => STORY.regions;
  const fillName = str => String(str).replace(/\{hero\}/g, U.esc(S() ? S().hero : STORY.defaultHero));
  const plain = html => { const d = document.createElement('div'); d.innerHTML = String(html).replace(/<svg[\s\S]*?<\/svg>/g, ' picture '); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const region = id => R().find(r => r.id === id);
  const topicsOf = subject => CONTENT[subject];
  const topicById = id => { for (const s of State.SUBJECTS) { const t = CONTENT[s].find(x => x.id === id); if (t) return t; } return null; };
  const subjectOf = id => State.SUBJECTS.find(s => CONTENT[s].some(t => t.id === id));
  const regionOfSubject = subj => R().find(r => r.subject === subj);
  const shrineName = (subject, idx) => regionOfSubject(subject).shrines[idx] + ' Shrine';

  let intervals = [];
  let keyHandler = null;
  function clearScreen() {
    intervals.forEach(clearInterval); intervals = [];
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    $('#overlay').innerHTML = ''; $('#overlay').className = '';
  }
  function screen(html, cls = '') { clearScreen(); app.className = cls; app.innerHTML = html; window.scrollTo(0, 0); }
  function on(sel, fn, root = app) { $$(sel, root).forEach(el => el.addEventListener('click', e => { U.sfx.click(); fn(e, el); })); }
  function onKey(fn) { keyHandler = fn; document.addEventListener('keydown', fn); }

  /* ---------------- Speech ---------------- */
  function speak(text) {
    if (!window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = 0.95;
      const v = speechSynthesis.getVoices().find(x => /en-GB/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  /* ---------------- HUD ---------------- */
  function heartsHtml(n, max) {
    let h = ''; for (let i = 0; i < max; i++) h += `<span class="heart ${i < n ? 'full' : 'empty'}">${i < n ? '❤' : '♡'}</span>`; return `<span class="hearts">${h}</span>`;
  }
  function hud() {
    const s = S();
    return `<div class="hud">
      <div class="hud-l">${heartsHtml(s.hearts, s.hearts)}${s.stamina ? `<span class="pill" title="Stamina">🟢 ${s.stamina}</span>` : ''}</div>
      <div class="hud-r">
        <span class="pill" title="Rupees"><b class="rupee">◆</b> ${s.rupees}</span>
        <span class="pill" title="Korok Seeds">🌰 ${s.seeds}</span>
        <span class="pill" title="Spirit Orbs">🔮 ${s.orbs}</span>
        <span class="pill" title="Days in a row">🔥 ${s.streak.days}</span>
      </div></div>`;
  }
  function toast(msg, kind = '') {
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = msg;
    document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
  }
  function confetti(n = 60) {
    const box = document.createElement('div'); box.className = 'confetti';
    for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.animationDelay = Math.random() * 0.8 + 's'; p.style.background = U.pick(['#3fe0ff', '#ffd23d', '#7ad97a', '#ff6a3d', '#c78bff']); box.appendChild(p); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3500);
  }

  /* ---------------- Dialogue (typewriter, click to advance) ---------------- */
  function dialogue(lines, done) {
    const ov = $('#overlay'); ov.className = 'dlg-wrap'; let i = 0; let typing = null; let full = '';
    const show = () => {
      const [who, text] = lines[i]; full = fillName(text);
      ov.innerHTML = `<div class="dlg" role="dialog"><div class="who">${U.esc(fillName(who))}</div><p class="txt"></p><div class="more">${i < lines.length - 1 ? '▼' : '✔'}</div></div>`;
      const p = $('.txt', ov); let k = 0; clearInterval(typing);
      typing = setInterval(() => { k += 2; p.textContent = full.slice(0, k); if (k >= full.length) { clearInterval(typing); typing = null; } }, 18);
      if (S() && S().settings.speech && S().settings.autoRead) speak(full);
    };
    const adv = () => {
      if (typing) { clearInterval(typing); typing = null; $('.txt', ov).textContent = full; return; }
      U.sfx.click(); i++;
      if (i >= lines.length) { ov.innerHTML = ''; ov.className = ''; ov.onclick = null; document.removeEventListener('keydown', kh); done && done(); return; }
      show();
    };
    const kh = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); adv(); } };
    document.addEventListener('keydown', kh);
    ov.onclick = adv; show();
  }
  function modal(html, buttons) { // buttons: [{label, cls, fn}]
    const ov = $('#overlay'); ov.className = 'modal-wrap';
    ov.innerHTML = `<div class="modal">${html}<div class="row">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
    ov.onclick = null;
    $$('button[data-i]', ov).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); U.sfx.click(); ov.innerHTML = ''; ov.className = ''; const fn = buttons[+b.dataset.i].fn; fn && fn(); }));
  }

  /* =========================================================== TITLE */
  function title() {
    const has = State.load();
    screen(`<div class="title-screen">
      <div class="title-glow"></div>
      <div class="triforce">▲<br>▲▲</div>
      <h1>${STORY.gameTitle}</h1>
      <h2>${STORY.gameSubtitle}</h2>
      <div class="menu">
        ${has ? `<button class="btn big primary" id="cont">▶ Continue — ${U.esc(S().hero)}</button>` : ''}
        <button class="btn big ${has ? '' : 'primary'}" id="new">✦ New Adventure</button>
      </div>
      <p class="fine">A fan-made learning game for the GL Assessment 11+ — English · Maths · Verbal Reasoning · Non-Verbal Reasoning.<br>Not affiliated with or endorsed by Nintendo.</p>
    </div>`, 'bg-title');
    on('#cont', () => { State.touchDay(); U.soundOn = S().settings.sound; map(); });
    on('#new', () => {
      if (has) modal('<h3>Start a new adventure?</h3><p>This will replace your current save.</p>', [{ label: 'Cancel' }, { label: 'Start over', cls: 'danger', fn: newGame }]);
      else newGame();
    });
  }

  function newGame() {
    screen(`<div class="center-card">
      <h2>What is your hero's name?</h2>
      <input id="nm" maxlength="14" value="${STORY.defaultHero}" autocomplete="off">
      <p class="muted">You can be Link, or use your own name!</p>
      <button class="btn big primary" id="go">Begin ▶</button></div>`, 'bg-dark');
    const go = () => { const n = $('#nm').value.trim() || STORY.defaultHero; State.newGame(n); State.touchDay(); U.soundOn = true; intro(); };
    on('#go', go); $('#nm').focus(); $('#nm').select();
    $('#nm').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  function intro() {
    screen(`<div class="shrine-of-resurrection"><div class="pod"></div></div>`, 'bg-dark');
    dialogue(STORY.intro, () => { S().flags.introSeen = true; State.save(); plateau(true); });
  }

  /* =========================================================== MAP */
  function map() {
    const s = S();
    if (!s.flags.introSeen) return intro();
    if (!State.plateauDone()) return plateau();
    const freed = id => s.bosses[id];
    const pos = { maths: [76, 20], english: [84, 50], verbal: [17, 22], nonverbal: [18, 78] };
    const beams = R().filter(r => freed(r.id)).map(r => `<line x1="${pos[r.id][0]}" y1="${pos[r.id][1]}" x2="50" y2="46" class="beam"/>`).join('');
    const node = (r) => {
      const stars = State.regionStars(r), max = topicsOf(r.subject).length * 3;
      return `<button class="node region ${freed(r.id) ? 'freed' : ''}" style="left:${pos[r.id][0]}%;top:${pos[r.id][1]}%;--c:${r.color}" data-region="${r.id}">
        <span class="ico">${r.emoji}</span><span class="lbl">${r.name}</span><span class="sub">${State.SUBJECT_NAMES[r.subject]}</span>
        <span class="bar"><i style="width:${Math.round((stars / max) * 100)}%"></i></span>${freed(r.id) ? '<span class="tag">FREED</span>' : ''}</button>`;
    };
    const daily = s.daily; const goal = State.DAILY_GOAL;
    const bloodMoon = s.mistakes.length >= 6;
    screen(`${hud()}
      <div class="map-wrap ${s.calamity ? 'peace' : ''}">
        <svg class="map-art" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><radialGradient id="mg" cx="50%" cy="50%"><stop offset="0" stop-color="#5a8f4e"/><stop offset="1" stop-color="#3c6b3a"/></radialGradient></defs>
          <path class="land" d="M8,12 C20,2 40,6 55,4 C72,2 90,6 95,18 C99,30 94,44 97,58 C99,72 92,90 78,95 C60,99 40,97 25,95 C10,93 3,80 4,64 C5,48 1,30 8,12Z"/>
          <path class="snow" d="M8,12 C16,6 26,6 32,10 C34,20 30,34 22,38 C12,40 5,32 6,22Z"/>
          <path class="desert" d="M4,64 C10,58 22,60 30,66 C34,76 32,90 25,95 C12,94 4,82 4,64Z"/>
          <path class="volcano" d="M62,6 C74,3 88,6 93,16 C92,28 82,32 72,30 C64,26 60,16 62,6Z"/>
          <path class="water" d="M80,36 C90,36 96,44 96,56 C94,64 86,66 80,62 C76,54 76,42 80,36Z"/>
          <path class="river" d="M50,46 C58,52 66,50 74,56 C80,60 86,58 92,64" />
          <path class="river" d="M50,46 C44,56 36,60 30,70" />
          ${beams}
          <circle cx="50" cy="46" r="7" class="${s.calamity ? 'castle-clear' : 'malice'}"/>
        </svg>
        ${R().map(node).join('')}
        <button class="node castle ${State.calamityUnlocked() ? '' : 'locked'} ${s.calamity ? 'freed' : ''}" style="left:50%;top:46%" id="castle"><span class="ico">🏰</span><span class="lbl">Hyrule Castle</span><span class="sub">${s.calamity ? 'Peace restored' : State.calamityUnlocked() ? 'Face Calamity Ganon!' : `${State.bossesBeaten()}/4 Champions freed`}</span></button>
        <button class="node small" style="left:44%;top:10%" id="woods"><span class="ico">🌲</span><span class="lbl">Lost Woods</span></button>
        <button class="node small" style="left:52%;top:80%" id="plat"><span class="ico">⛰️</span><span class="lbl">Great Plateau</span></button>
        <button class="node small" style="left:70%;top:72%" id="hateno"><span class="ico">🏚️</span><span class="lbl">Hateno Lab</span><span class="sub">Practice Papers</span></button>
        ${bloodMoon ? `<button class="node bloodmoon" style="left:27%;top:60%" id="blood"><span class="ico">🌕</span><span class="lbl">Blood Moon!</span><span class="sub">${s.mistakes.length} mistakes return</span></button>` : ''}
      </div>
      <div class="daily">
        <div><b>Daily Quest:</b> answer ${goal} questions correctly today <span class="muted">(${Math.min(daily.correct, goal)}/${goal})</span></div>
        <div class="bar"><i style="width:${Math.min(100, (daily.correct / goal) * 100)}%"></i></div>
        ${daily.correct >= goal && !daily.claimed ? '<button class="btn primary" id="claim">Claim reward!</button>' : daily.claimed ? '<span class="tag ok">Complete ✓</span>' : ''}
      </div>
      <nav class="dock">
        <button class="dock-b" id="shop"><span>🎒</span>Beedle's Shop</button>
        <button class="dock-b" id="statue"><span>🗿</span>Goddess Statue</button>
        <button class="dock-b" id="hestu"><span>🪇</span>Hestu</button>
        <button class="dock-b" id="log"><span>📒</span>Adventure Log</button>
        <button class="dock-b" id="gear"><span>⚙️</span>Settings</button>
      </nav>`, 'bg-map');
    on('[data-region]', (e, el) => regionScreen(el.dataset.region));
    on('#castle', () => (State.calamityUnlocked() ? calamityIntro() : toast('Free all four Divine Beasts to reach Hyrule Castle.')));
    on('#woods', masterSword);
    on('#plat', () => plateau());
    on('#hateno', mockMenu);
    on('#blood', bloodMoonIntro);
    on('#claim', () => {
      const bonus = 50 + Math.min(50, s.streak.days * 5);
      s.rupees += bonus; s.seeds++; s.seedsTotal++; s.daily.claimed = true; State.save(); U.sfx.fanfare(); confetti();
      toast(`Daily Quest complete! +${bonus} rupees, +1 Korok Seed 🌰`, 'good'); map();
    });
    on('#shop', shop); on('#statue', statue); on('#hestu', hestu); on('#log', () => adventureLog()); on('#gear', settings);
    if (!s.flags.mapSeen) { s.flags.mapSeen = true; State.save(); dialogue([['Old Man', 'This is Hyrule. Each region holds shrines for one subject, and a Divine Beast controlled by a Blight.'], ['Old Man', 'Clear shrines to earn stars. Earn enough stars and you can challenge the Blight. Free all four Champions and you can face Calamity Ganon himself!']]); }
  }

  /* =========================================================== GREAT PLATEAU (tutorial) */
  function plateau(first) {
    const s = S();
    const done = State.plateauDone();
    const cards = STORY.plateauShrines.map(p => {
      const ok = s.plateau[p.subject]; const rune = STORY.runes[p.rune];
      return `<button class="card shrine ${ok ? 'done' : ''}" data-sub="${p.subject}">
        <div class="shrine-ico">${ok ? rune.emoji : '◈'}</div>
        <div><h3>${p.name} Shrine</h3><p>${State.SUBJECT_NAMES[p.subject]} · Rune: <b>${rune.name}</b></p><p class="muted">${rune.desc}</p></div>
        <div class="stars">${ok ? '✔' : 'Enter ▶'}</div></button>`;
    }).join('');
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>⛰️ The Great Plateau</h2></div>
      <p class="intro">Four tutorial shrines — one for each 11+ subject. Each one teaches you a Sheikah Rune.</p>
      <div class="cards">${cards}</div>
      ${done ? '<p class="ok-note">✔ You have the paraglider! The whole of Hyrule is open to you.</p>' : ''}
    </div>`, 'bg-plateau');
    on('#back', () => (done ? map() : toast('Complete all four shrines to get the paraglider!')));
    on('[data-sub]', (e, el) => plateauShrine(el.dataset.sub));
    if (first) dialogue(STORY.plateauIntro);
  }
  function plateauShrine(subject) {
    const p = STORY.plateauShrines.find(x => x.subject === subject);
    const rune = STORY.runes[p.rune];
    const ts = topicsOf(subject);
    battle({
      kind: 'tutorial', title: `${p.name} Shrine`, subtitle: `Tutorial · ${State.SUBJECT_NAMES[subject]}`, total: 6, hearts: 3,
      next: B => { const t = ts[B.idx % ts.length]; return { topic: t, lv: 1 }; },
      intro: [['Monk', `Welcome, ${S().hero}. This shrine tests ${State.SUBJECT_NAMES[subject]}. Answer the questions — six of them — without losing all of your hearts.`], ['Monk', 'If you get one wrong, read the explanation carefully. That is how heroes learn!']],
      onEnd: r => {
        const s = S();
        if (r.won) {
          const firstTime = !s.plateau[subject];
          s.plateau[subject] = true;
          if (firstTime) { s.runes[p.rune] = true; s.orbs++; s.orbsTotal++; }
          State.save();
          results(r, { extra: firstTime ? `<div class="reward big">${rune.emoji} You learned the <b>${rune.name}</b> rune!<br><small>${rune.desc}</small></div><div class="reward">🔮 You received a Spirit Orb!</div>` : '', next: () => {
            if (State.plateauDone() && !s.flags.paraglider) {
              s.flags.paraglider = true; State.addMemory('m-plateau'); State.save();
              screen('<div class="paraglider">🪂</div>', 'bg-plateau');
              dialogue(STORY.plateauDone, () => { U.sfx.fanfare(); confetti(); memoryScreen('m-plateau', map); });
            } else plateau();
          } });
        } else results(r, { retry: () => plateauShrine(subject), next: plateau });
      },
    });
  }

  /* =========================================================== REGION */
  function regionScreen(id) {
    const r = region(id); const s = S(); const ts = topicsOf(r.subject);
    const cards = ts.map((t, i) => {
      const st = s.stars[t.id] || 0; const open = State.shrineUnlocked(r, i);
      return `<button class="card shrine ${open ? '' : 'locked'} ${st === 3 ? 'gold' : ''}" data-t="${t.id}" ${open ? '' : 'disabled'}>
        <div class="shrine-ico">${open ? t.icon : '🔒'}</div>
        <div><h3>${r.shrines[i]} Shrine</h3><p>${t.name}</p>${open ? `<div class="mbar" title="Mastery"><i style="width:${State.mastery(t.id)}%"></i></div>` : '<p class="muted">Earn a star in the previous shrine to unlock</p>'}</div>
        <div class="stars">${'★'.repeat(st)}<span class="dim">${'★'.repeat(3 - st)}</span></div></button>`;
    }).join('');
    const stars = State.regionStars(r), need = State.bossNeed(r);
    const unlocked = State.bossUnlocked(r); const beaten = s.bosses[r.id];
    screen(`${hud()}<div class="page" style="--c:${r.color}">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>${r.emoji} ${r.name}</h2><span class="pill">${State.SUBJECT_NAMES[r.subject]} · ★ ${stars}</span></div>
      <div class="cards">${cards}</div>
      <div class="card beast ${beaten ? 'done' : unlocked ? 'ready' : 'locked'}">
        <div class="beast-ico">${r.beastEmoji}</div>
        <div><h3>${r.beast}</h3>
          <p>${beaten ? `✔ ${r.champion} is free! You have <b>${STORY.champions[r.ability].name}</b>.` : unlocked ? `${r.boss} awaits…` : `To challenge ${r.boss}: clear Trial 1 of every shrine and collect <b>${need} ★</b> (you have ${stars}).`}</p></div>
        <div>${unlocked ? `<button class="btn ${beaten ? '' : 'danger pulse'}" id="boss">${beaten ? 'Rematch' : 'Board the Beast ⚔'}</button>` : `<span class="lock">🔒 ${Math.min(stars, need)}/${need} ★</span>`}</div>
      </div></div>`, `bg-${r.id}`);
    on('#back', map);
    on('[data-t]', (e, el) => shrineScreen(el.dataset.t));
    on('#boss', () => bossPrep(r));
    if (!s.flags['visit-' + id]) { s.flags['visit-' + id] = true; State.save(); dialogue(r.intro); }
  }

  /* =========================================================== SHRINE (lesson + trials) */
  const TRIALS = [
    { lv: 1, name: 'Trial of Beginnings', label: 'Novice' },
    { lv: 2, name: 'Trial of Wisdom', label: 'Adept' },
    { lv: 3, name: 'Trial of the 11+', label: 'Master' },
  ];
  function shrineScreen(topicId) {
    const t = topicById(topicId); const subj = subjectOf(topicId); const r = regionOfSubject(subj); const idx = topicsOf(subj).indexOf(t); const s = S();
    const st = s.stars[topicId] || 0;
    screen(`${hud()}<div class="page shrine-page">
      <div class="page-head"><button class="btn ghost" id="back">◀ ${r.name}</button><h2>${r.shrines[idx]} Shrine</h2></div>
      <div class="lesson">
        <div class="monk">🧘</div>
        <div><h3>The Monk's Teaching: ${t.icon} ${t.name}</h3>${t.lesson}
        <button class="btn ghost small" id="read">🔊 Read to me</button></div>
      </div>
      <div class="trials">${TRIALS.map(tr => {
        const open = st >= tr.lv - 1; const done = st >= tr.lv;
        return `<button class="trial ${done ? 'done' : ''} ${open ? '' : 'locked'}" data-lv="${tr.lv}" ${open ? '' : 'disabled'}>
          <span class="tlv">${'★'.repeat(tr.lv)}</span><b>${tr.name}</b><span class="muted">${tr.label}${tr.lv === 3 ? ' · timed' : ''}</span>
          <span>${done ? '✔ Cleared' : open ? 'Begin ▶' : '🔒'}</span></button>`;
      }).join('')}</div>
      <p class="muted center">Each trial: 8 questions and 3 hearts. Don't run out of hearts! ${st === 0 ? 'Clearing the first trial earns a <b>Spirit Orb</b>.' : ''}</p>
    </div>`, `bg-shrine`);
    on('#back', () => regionScreen(r.id));
    on('#read', () => speak(plain(t.lesson)));
    on('[data-lv]', (e, el) => trial(topicId, +el.dataset.lv));
  }

  function trial(topicId, lv) {
    const t = topicById(topicId); const subj = subjectOf(topicId); const idx = topicsOf(subj).indexOf(t); const name = shrineName(subj, idx);
    const tr = TRIALS[lv - 1];
    const fixed = t.trial ? t.trial(lv) : null; // comprehension uses one passage per trial
    battle({
      kind: 'trial', title: name, subtitle: `${tr.name} · ${t.name}`, total: fixed ? fixed.length : 8, hearts: 3, fixed: !!fixed,
      timer: lv === 3 ? 75 : 0,
      next: B => (fixed ? { topic: t, lv, q: fixed[B.idx]() } : { topic: t, lv }),
      onEnd: r => {
        const s = S();
        if (r.won) {
          const prev = s.stars[topicId] || 0; let extra = '';
          if (lv > prev) {
            s.stars[topicId] = lv;
            if (lv === 1) { s.orbs++; s.orbsTotal++; extra += '<div class="reward big">🔮 You received a <b>Spirit Orb</b>!<br><small>Take 4 to a Goddess Statue for a Heart Container.</small></div>'; U.sfx.orb(); }
            const chest = [0, 30, 60, 120][lv]; s.rupees += chest; extra += `<div class="reward">🎁 Treasure chest! +${chest} rupees</div>`;
            if (lv === 3) { const it = U.pick(['hearty', 'fairy', 'bombarrow', 'hasty']); s.items[it]++; extra += `<div class="reward">${State.ITEMS.find(i => i.id === it).emoji} The chest also held a ${State.ITEMS.find(i => i.id === it).name}!</div>`; }
          }
          s.stats.trials++; State.save();
          results(r, { extra, retry: () => trial(topicId, lv), next: () => shrineScreen(topicId), nextLabel: 'Back to shrine' });
        } else results(r, { retry: () => trial(topicId, lv), next: () => shrineScreen(topicId) });
      },
    });
  }

  /* =========================================================== BATTLE ENGINE */
  /*
    cfg: { kind, title, subtitle, total (null = until boss defeated), hearts, timer (sec/question, 0 = none),
           next(B) -> {topic, lv, q?}, boss: {name, emoji, hp, color, element, onPhase(B)}, intro: dialogue lines,
           exam (no feedback), examTime (sec overall), onEnd(result) }
  */
  function battle(cfg) {
    const s = S();
    const isBoss = !!cfg.boss; const exam = !!cfg.exam; const sword = cfg.kind === 'sword';
    const useItems = cfg.items || {};
    const maxHearts = cfg.hearts + (useItems.hearty ? 3 : 0);
    const B = {
      cfg, idx: 0, hearts: maxHearts, maxHearts, correct: 0, wrong: 0, streak: 0, best: 0, rupees: 0, seeds: 0, log: [],
      hp: isBoss ? cfg.boss.hp : 0, maxHp: isBoss ? cfg.boss.hp : 0, phase: 0,
      runes: {}, champ: {}, blocks: isBoss ? State.shield().blocks : 0, bombNext: false, furyNext: false,
      arrows: isBoss ? s.items.bombarrow : 0, fairy: s.items.fairy > 0 && !exam && !sword,
      timeLeft: 0, frozen: false, q: null, cur: null, answered: false, revaliUsed: false, retrying: false,
      examLeft: cfg.examTime || 0, done: false,
    };
    if (!exam && !sword) {
      for (const k of Object.keys(STORY.runes)) if (s.runes[k]) B.runes[k] = State.runeCharges();
      for (const k of Object.keys(STORY.champions)) if (s.champions[k]) B.champ[k] = true;
    }
    if (useItems.hearty) s.items.hearty--; if (useItems.hasty) s.items.hasty--; State.save();
    const timerFor = () => (s.settings.timers && cfg.timer ? cfg.timer + State.timerBonus() + (useItems.hasty ? 20 : 0) : 0);

    const bossHtml = isBoss ? `<div class="arena el-${cfg.boss.element || 'malice'}">
        <div class="hero-sprite" id="hero">🧝<span class="wpn">${State.weapon().emoji}</span></div>
        <div class="boss-sprite" id="boss" style="--c:${cfg.boss.color || '#c03'}">${cfg.boss.emoji}</div>${cfg.boss.aura ? `<div class="aura">${cfg.boss.aura}</div>` : ''}
        <div class="boss-bar"><span class="bname" id="bname">${cfg.boss.name}</span><div class="hpbar"><i id="hpfill" style="width:100%"></i></div></div>
      </div>` : '';
    screen(`<div class="battle ${isBoss ? 'boss' : ''} ${exam ? 'exam' : ''}">
      <header class="bhead">
        <div class="bt"><b>${cfg.title}</b><span>${cfg.subtitle || ''}</span></div>
        <div class="bstat"><span id="hearts"></span><span id="streak" class="streak"></span><span id="prog" class="prog"></span></div>
        <div class="timer" id="timerwrap" hidden><i id="timer"></i></div>
      </header>
      ${bossHtml}
      <section class="qcard" id="qcard"></section>
      <footer class="runebar" id="runebar"></footer>
    </div>`, `bg-battle ${isBoss ? 'bg-' + (cfg.boss.element || 'malice') : ''}`);

    const elHearts = $('#hearts'), elProg = $('#prog'), elStreak = $('#streak'), qcard = $('#qcard');
    const updateTop = () => {
      elHearts.innerHTML = exam ? '' : heartsHtml(B.hearts, B.maxHearts);
      elStreak.innerHTML = B.streak >= 2 ? `🔥 ${B.streak} combo` : '';
      if (exam) elProg.textContent = `Question ${B.idx + 1} of ${cfg.total} · ⏱ ${Math.floor(B.examLeft / 60)}:${String(B.examLeft % 60).padStart(2, '0')}`;
      else if (sword) elProg.textContent = `Floor ${B.idx + 1}`;
      else if (cfg.total) elProg.innerHTML = Array.from({ length: cfg.total }, (_, i) => `<i class="${i < B.log.length ? (B.log[i].ok ? 'ok' : 'no') : i === B.idx ? 'cur' : ''}"></i>`).join('');
      else elProg.textContent = '';
      if (isBoss) $('#hpfill').style.width = Math.max(0, (B.hp / B.maxHp) * 100) + '%';
    };
    const runeBar = () => {
      if (exam) { $('#runebar').innerHTML = `<button class="rb" id="finish">Finish paper ▶</button>`; on('#finish', () => modal('<h3>Finish now?</h3><p>Unanswered questions will be marked wrong.</p>', [{ label: 'Keep going' }, { label: 'Finish', cls: 'primary', fn: () => end(false, true) }])); return; }
      const rb = [];
      for (const [k, n] of Object.entries(B.runes)) {
        if (k === 'stasis' && !timerFor()) continue;
        const ru = STORY.runes[k]; rb.push(`<button class="rb ${n ? '' : 'spent'}" data-rune="${k}" title="${ru.desc}"><span>${ru.emoji}</span>${ru.name}<i>${n}</i></button>`);
      }
      if (B.champ.urbosa !== undefined) rb.push(`<button class="rb champ ${B.champ.urbosa ? '' : 'spent'}" data-champ="urbosa" title="${STORY.champions.urbosa.desc}"><span>⚡</span>Urbosa's Fury</button>`);
      if (isBoss && B.arrows) rb.push(`<button class="rb" data-arrow="1" title="Next correct answer deals double damage"><span>🏹</span>Bomb Arrow<i>${B.arrows}</i></button>`);
      const passive = [];
      if (B.champ.daruk === true) passive.push('🛡️'); if (B.champ.mipha === true) passive.push('💧'); if (B.champ.revali && !B.revaliUsed) passive.push('🌬️'); if (B.blocks) passive.push('🔰×' + B.blocks); if (B.fairy) passive.push('🧚');
      if (B.bombNext) passive.push('💣 ready'); if (B.furyNext) passive.push('⚡ ready');
      rb.push(`<button class="rb" id="speak" title="Read the question aloud"><span>🔊</span>Read</button>`);
      if (passive.length) rb.push(`<span class="passive" title="Active protections">${passive.join(' ')}</span>`);
      if (!isBoss) rb.push(`<button class="rb quit" id="quit">✕</button>`);
      $('#runebar').innerHTML = rb.join('');
      on('[data-rune]', (e, el) => useRune(el.dataset.rune), $('#runebar'));
      on('[data-champ]', () => { if (!B.champ.urbosa || B.answered) return; B.champ.urbosa = false; B.furyNext = true; toast('⚡ Urbosa\'s Fury charged!'); runeBar(); }, $('#runebar'));
      on('[data-arrow]', () => { if (B.answered || B.bombNext || !B.arrows) return; B.arrows--; s.items.bombarrow--; State.save(); B.bombNext = true; toast('🏹 Bomb arrow nocked!'); runeBar(); }, $('#runebar'));
      on('#speak', () => speak(plain(B.q.prompt) + '. ' + (B.q.figs ? '' : B.q.options.map((o, i) => `${'ABCDE'[i]}: ${plain(o)}`).join('. '))), $('#runebar'));
      on('#quit', () => modal('<h3>Leave the shrine?</h3><p>Progress in this trial will be lost.</p>', [{ label: 'Stay' }, { label: 'Leave', cls: 'danger', fn: () => cfg.onEnd({ won: false, quit: true, B }) }]), $('#runebar'));
    };
    function useRune(k) {
      if (!B.runes[k] || B.answered) return;
      if (k === 'magnesis') {
        const wrong = $$('.opt', qcard).filter(b => +b.dataset.i !== B.q.answer && !b.disabled);
        if (wrong.length < 2) return;
        U.shuffle(wrong).slice(0, 2).forEach(b => { b.disabled = true; b.classList.add('pulled'); });
      } else if (k === 'bomb') { if (B.bombNext) return; B.bombNext = true; toast('💣 Remote Bomb set!'); }
      else if (k === 'stasis') { if (!B.timeLeft) return; B.frozen = true; $('#timerwrap').classList.add('frozen'); toast('⏸️ Time frozen!'); }
      else if (k === 'cryonis') { if (cfg.fixed) return toast('Cryonis can\'t freeze a reading passage question.'); B.runes[k]--; runeBar(); toast('🧊 Question frozen and replaced!'); return ask(true); }
      B.runes[k]--; runeBar();
    }

    function pickNext() {
      for (let tries = 0; tries < 8; tries++) {
        const n = cfg.next(B);
        try { const q = n.q || n.topic.gen(n.lv); if (q && q.options) return Object.assign(n, { q }); } catch (e) { console.warn('generator failed', n.topic && n.topic.id, e); }
      }
      throw new Error('No question available');
    }
    function ask(replace) {
      B.answered = false; B.frozen = false; B.retrying = false;
      B.cur = pickNext();
      const q = B.q = B.cur.q; window.__lastQ = q; // used by the automated play-test
      updateTop(); runeBar();
      const letters = 'ABCDE';
      qcard.innerHTML = `
        ${q.passage ? `<details class="passage" ${B.idx === 0 || exam ? 'open' : 'open'}><summary>📜 Read the passage</summary><div>${q.passage}</div></details>` : ''}
        <div class="prompt">${q.prompt}</div>
        ${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
        ${q.alphabet ? `<div class="alpha">${U.ALPHA.split('').map(c => `<span>${c}</span>`).join('')}</div>` : ''}
        <div class="opts ${q.figs ? 'figs' : ''} ${q.long || q.options.some(o => o.length > 38 && !q.figs) ? 'long' : ''}">
          ${q.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${letters[i]}</span><span class="o">${o}</span></button>`).join('')}
        </div>
        <div class="feedback" id="fb" hidden></div>`;
      $$('.opt', qcard).forEach(b => b.addEventListener('click', () => answer(+b.dataset.i)));
      qcard.classList.remove('flash-ok', 'flash-no'); void qcard.offsetWidth; qcard.classList.add('enter');
      // timer
      const T = timerFor();
      intervals.forEach(clearInterval); intervals = [];
      if (exam) {
        intervals.push(setInterval(() => { B.examLeft--; updateTop(); if (B.examLeft <= 0) { toast('⏱ Time is up!'); end(false, true); } }, 1000));
      } else if (T) {
        B.timeLeft = T; const tw = $('#timerwrap'); tw.hidden = false; tw.classList.remove('frozen');
        const bar = $('#timer'); bar.style.width = '100%';
        intervals.push(setInterval(() => {
          if (B.answered || B.frozen) return;
          B.timeLeft--; bar.style.width = (B.timeLeft / T) * 100 + '%';
          bar.classList.toggle('low', B.timeLeft <= 10);
          if (B.timeLeft <= 5 && B.timeLeft > 0) U.sfx.tick();
          if (B.timeLeft <= 0) answer(-1);
        }, 1000));
      } else { $('#timerwrap').hidden = true; B.timeLeft = 0; }
      if (s.settings.speech && s.settings.autoRead) speak(plain(q.prompt));
    }

    function answer(i) {
      if (B.answered || B.done) return;
      const q = B.q; const ok = i === q.answer; const btns = $$('.opt', qcard);
      // Revali's Gale: one free retry
      if (!ok && i >= 0 && B.champ.revali && !B.revaliUsed && !exam) {
        B.revaliUsed = true; btns[i].disabled = true; btns[i].classList.add('wrong');
        toast('🌬️ Revali\'s Gale! Try again.'); U.sfx.wrong(); runeBar(); return;
      }
      B.answered = true;
      btns.forEach(b => (b.disabled = true));
      if (exam) { if (i >= 0) btns[i].classList.add('picked'); }
      else { btns[q.answer].classList.add('right'); if (i >= 0 && !ok) btns[i].classList.add('wrong'); }
      State.record(B.cur.topic.id, B.cur.lv, ok);
      B.log.push({ ok, q, picked: i, topic: B.cur.topic.id, lv: B.cur.lv });
      if (ok) {
        B.correct++; B.streak++; B.best = Math.max(B.best, B.streak); s.stats.bestStreak = Math.max(s.stats.bestStreak, B.streak);
        if (cfg.fromMistake) cfg.fromMistake(B.cur, true);
      } else {
        B.wrong++; B.streak = 0;
        if (cfg.kind !== 'bloodmoon') State.addMistake(B.cur.topic.id, B.cur.lv, q);
        if (cfg.fromMistake) cfg.fromMistake(B.cur, false);
      }
      let msg = '';
      if (exam) { State.save(); return setTimeout(advance, 250); }
      if (ok) {
        U.sfx.correct(); qcard.classList.add('flash-ok');
        let mult = 1; if (B.bombNext) { mult *= isBoss ? 2 : 3; B.bombNext = false; } if (B.furyNext) { mult *= 3; B.furyNext = false; }
        if (isBoss) {
          const base = cfg.boss.dmg ? cfg.boss.dmg(B) : State.weapon().dmg;
          const dmg = Math.round(base * (1 + 0.1 * Math.min(B.streak - 1, 5)) * mult);
          B.hp = Math.max(0, B.hp - dmg); hitBoss(dmg, mult > 1);
          msg = `<b>${U.pick(STORY.praise)}</b> You hit for <b>${dmg}</b> damage!`;
        }
        const gain = Math.round((5 + Math.min(B.streak, 5)) * State.rupeeBonus() * (isBoss ? 1 : mult));
        B.rupees += gain;
        if (!isBoss) msg = `<b>${U.pick(STORY.praise)}</b> +${gain} rupees${mult > 1 ? ' (power bonus!)' : ''}`;
        if (!sword && Math.random() < State.korokChance()) { B.seeds++; setTimeout(korok, 400); }
      } else {
        U.sfx.wrong(); qcard.classList.add('flash-no');
        let dmg = cfg.wrongDamage ? cfg.wrongDamage(B) : 1;
        let blockedBy = '';
        if (B.champ.daruk === true) { B.champ.daruk = 'used'; dmg = 0; blockedBy = '🛡️ Daruk\'s Protection blocked the hit!'; }
        else if (isBoss && B.blocks > 0) { B.blocks--; dmg = 0; blockedBy = `${State.shield().emoji} Your shield blocked the hit!`; }
        if (isBoss) bossAttack(dmg);
        B.hearts = Math.max(0, B.hearts - dmg);
        if (dmg) hurt();
        msg = `<b>${i < 0 ? '⏱ Out of time!' : U.pick(STORY.encourage)}</b>${blockedBy ? `<br>${blockedBy}` : ''}`;
        if (B.hearts <= 0) {
          if (B.champ.mipha === true) { B.champ.mipha = 'used'; B.hearts = B.maxHearts; msg += '<br>💧 <b>Mipha\'s Grace</b> heals you completely!'; U.sfx.orb(); }
          else if (B.fairy) { B.fairy = false; s.items.fairy--; B.hearts = 3; msg += '<br>🧚 A <b>fairy</b> appears and revives you!'; U.sfx.orb(); }
        }
      }
      State.save(); updateTop(); runeBar();
      const fb = $('#fb'); fb.hidden = false; fb.className = 'feedback ' + (ok ? 'good' : 'bad');
      fb.innerHTML = `<div class="fb-msg">${msg}</div>${!ok || q.explain ? `<div class="explain">${ok ? '✔ ' : `The answer is <b>${'ABCDE'[q.answer]}</b>. `}${q.explain}</div>` : ''}<button class="btn primary" id="cont">Continue ▶</button>`;
      on('#cont', advance, fb); $('#cont').focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function advance() {
      if (B.done || !B.answered) return;
      B.answered = false;
      B.idx++;
      if (!exam && B.hearts <= 0) return end(false);
      if (isBoss && B.hp <= 0) {
        if (cfg.boss.onPhase && cfg.boss.onPhase(B)) return; // phase change handles continuation
        return end(true);
      }
      if (isBoss && cfg.boss.enrage && !B.enraged && B.hp <= B.maxHp / 2) { B.enraged = true; $('#boss').classList.add('enraged'); toast(`${cfg.boss.name} is enraged! Questions get harder!`, 'bad'); U.sfx.boss(); }
      if (cfg.total && B.idx >= cfg.total) return end(!exam ? B.hearts > 0 : true, exam);
      ask();
    }
    B.resume = () => { ask(); };
    B.setBoss = (name, emoji, hp) => { B.hp = B.maxHp = hp; $('#bname').textContent = name; $('#boss').textContent = emoji; updateTop(); };

    function end(won, examDone) {
      if (B.done) return; B.done = true; intervals.forEach(clearInterval); intervals = [];
      // exam: count unanswered as wrong
      if (examDone) { while (B.log.length < cfg.total) { B.log.push({ ok: false, q: null, picked: -1 }); } }
      s.rupees += B.rupees; s.seeds += B.seeds; s.seedsTotal += B.seeds;
      if (won && !exam && B.wrong === 0 && cfg.total) { s.stats.perfect++; const bonus = 25; s.rupees += bonus; B.perfectBonus = bonus; }
      State.save();
      cfg.onEnd({ won, B });
    }

    // visual effects
    function hitBoss(dmg, big) {
      const b = $('#boss'); if (!b) return; U.sfx.hit(); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
      const n = document.createElement('span'); n.className = 'dmg ' + (big ? 'big' : ''); n.textContent = '-' + dmg; b.parentElement.appendChild(n); setTimeout(() => n.remove(), 1200);
      const h = $('#hero'); h.classList.remove('attack'); void h.offsetWidth; h.classList.add('attack');
    }
    function bossAttack() { const b = $('#boss'); if (!b) return; b.classList.remove('lunge'); void b.offsetWidth; b.classList.add('lunge'); }
    function hurt() { U.sfx.hurt(); document.body.classList.remove('hurt'); void document.body.offsetWidth; document.body.classList.add('hurt'); }
    function korok() {
      U.sfx.korok(); const k = document.createElement('div'); k.className = 'korok'; k.innerHTML = `<span>🌿</span><b>${U.pick(STORY.korokLines)}</b><small>+1 Korok Seed 🌰</small>`;
      document.body.appendChild(k); setTimeout(() => k.classList.add('show'), 10); setTimeout(() => { k.classList.remove('show'); setTimeout(() => k.remove(), 500); }, 2200);
    }

    onKey(e => {
      if ($('#overlay').innerHTML) return;
      const k = e.key.toUpperCase();
      if (!B.answered && 'ABCDE12345'.includes(k) && k.length === 1) { const i = 'ABCDE'.includes(k) ? 'ABCDE'.indexOf(k) : +k - 1; const b = $$('.opt', qcard)[i]; if (b && !b.disabled) answer(i); }
      else if (B.answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(); }
    });

    const start = () => { if (isBoss) U.sfx.boss(); ask(); };
    if (cfg.intro) dialogue(cfg.intro, start); else start();
    return B;
  }

  /* =========================================================== RESULTS */
  function results(r, opt = {}) {
    const B = r.B; const s = S();
    if (r.quit) return opt.next ? opt.next() : map();
    const won = r.won; const pct = B.log.length ? Math.round((B.correct / B.log.length) * 100) : 0;
    const wrong = B.log.filter(l => !l.ok && l.q);
    if (won) { U.sfx.solved(); confetti(); }
    screen(`<div class="page results ${won ? 'win' : 'lose'}">
      <div class="res-head">${won ? `<div class="big-ico">✨</div><h2>${opt.heading || 'Trial Complete!'}</h2>` : '<div class="big-ico">💀</div><h2>You ran out of hearts…</h2><p class="muted">Every hero falls sometimes. Read the explanations below, then try again — you\'ll be stronger!</p>'}</div>
      <div class="res-stats">
        <div><b>${B.correct}/${B.log.length}</b><span>correct</span></div>
        <div><b>${pct}%</b><span>accuracy</span></div>
        <div><b>${B.best}</b><span>best combo</span></div>
        <div><b>◆ ${B.rupees + (B.perfectBonus || 0)}</b><span>rupees</span></div>
        ${B.seeds ? `<div><b>🌰 ${B.seeds}</b><span>Korok seeds</span></div>` : ''}
      </div>
      ${B.perfectBonus ? `<div class="reward">🌟 PERFECT! No mistakes — +${B.perfectBonus} bonus rupees</div>` : ''}
      ${opt.extra || ''}
      ${wrong.length ? `<details class="review" ${won ? '' : 'open'}><summary>📖 Review your mistakes (${wrong.length})</summary>${wrong.map(reviewItem).join('')}</details>` : ''}
      <div class="row center">${opt.retry ? `<button class="btn ${won ? '' : 'primary'}" id="retry">↻ Try again</button>` : ''}<button class="btn ${won ? 'primary' : ''}" id="next">${opt.nextLabel || 'Continue ▶'}</button></div>
    </div>`, won ? 'bg-win' : 'bg-lose');
    on('#retry', () => opt.retry()); on('#next', () => (opt.next ? opt.next() : map()));
  }
  function reviewItem(l) {
    const q = l.q;
    return `<div class="rv"><div class="prompt">${q.prompt}</div>${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
      <div class="opts mini ${q.figs ? 'figs' : ''}">${q.options.map((o, i) => `<div class="opt ${i === q.answer ? 'right' : ''} ${i === l.picked && i !== q.answer ? 'wrong' : ''}"><span class="k">${'ABCDE'[i]}</span><span class="o">${o}</span></div>`).join('')}</div>
      <div class="explain">${q.explain}</div></div>`;
  }

  /* =========================================================== BOSSES */
  function weakWeighted(topics) {
    const w = topics.map(t => 120 - State.mastery(t.id));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < topics.length; i++) { r -= w[i]; if (r <= 0) return topics[i]; }
    return topics[topics.length - 1];
  }
  function itemPrep(title, desc, go) {
    const s = S(); const avail = ['hearty', 'hasty'].filter(k => s.items[k] > 0);
    const chosen = {};
    const html = `<h3>${title}</h3><p>${desc}</p>
      <div class="prep">
        <div>${heartsHtml(s.hearts, s.hearts)} · ${State.weapon().emoji} ${State.weapon().name} (${State.weapon().dmg} dmg) · ${State.shield().emoji} ${State.shield().name}</div>
        ${avail.length ? `<p><b>Drink an elixir?</b></p>${avail.map(k => { const it = State.ITEMS.find(i => i.id === k); return `<label class="chk"><input type="checkbox" data-item="${k}"> ${it.emoji} ${it.name} (×${s.items[k]}) — ${it.desc}</label>`; }).join('')}` : '<p class="muted">Tip: Beedle sells elixirs that help in boss battles.</p>'}
        ${s.items.fairy ? `<p>🧚 Your fairy (×${s.items.fairy}) will revive you if you fall.</p>` : ''}
        ${s.items.bombarrow ? `<p>🏹 Bomb Arrows ready: ${s.items.bombarrow}</p>` : ''}
      </div>`;
    modal(html, [{ label: 'Not yet' }, { label: 'Fight! ⚔', cls: 'danger', fn: () => go(chosen) }]);
    $$('[data-item]', $('#overlay')).forEach(c => c.addEventListener('change', () => (chosen[c.dataset.item] = c.checked)));
  }
  function bossPrep(r) { itemPrep(`${r.beast}`, `${r.bossIntro}`, items => bossFight(r, items)); }
  function bossFight(r, items) {
    const s = S(); const ts = topicsOf(r.subject);
    battle({
      kind: 'boss', title: r.boss, subtitle: `${r.beast} · ${State.SUBJECT_NAMES[r.subject]}`, total: null, hearts: s.hearts, timer: 60, items,
      boss: { name: r.boss, emoji: r.bossEmoji, aura: { fire: '🔥', water: '💧', wind: '🌪️', thunder: '⚡' }[r.element], hp: 150, color: r.color, element: r.element, enrage: true },
      next: B => ({ topic: weakWeighted(ts), lv: B.enraged ? (Math.random() < 0.35 ? 3 : 2) : (Math.random() < 0.3 ? 1 : 2) }),
      intro: [[r.boss, '…'], ['Zelda', `${S().hero}, be careful! ${r.boss} attacks every time you answer wrongly. Each correct answer strikes back — build a combo for extra damage!`]],
      onEnd: res => {
        if (res.won) {
          const first = !s.bosses[r.id];
          s.bosses[r.id] = true;
          let extra = `<div class="reward">◆ +300 rupees from the Divine Beast's treasure</div>`; s.rupees += 300;
          if (first) {
            s.champions[r.ability] = true; s.hearts++; State.addMemory('m-' + r.subject);
            extra += `<div class="reward big">❤ Heart Container! You now have ${s.hearts} hearts.</div><div class="reward big">${STORY.champions[r.ability].emoji} <b>${STORY.champions[r.ability].name}</b><br><small>${STORY.champions[r.ability].desc}</small></div>`;
          }
          State.save(); U.sfx.fanfare(); confetti(120);
          const after = () => results(res, { heading: `${r.beast} is free!`, extra, next: () => (first ? memoryScreen('m-' + r.subject, () => regionScreen(r.id)) : regionScreen(r.id)) });
          if (first) { screen(`<div class="spirit">${r.championEmoji}</div>`, 'bg-win'); dialogue(r.victory, after); } else after();
        } else results(res, { retry: () => bossPrep(r), next: () => regionScreen(r.id), nextLabel: 'Retreat' });
      },
    });
  }

  function calamityIntro() {
    const s = S();
    if (!s.flags.calamityIntro) { s.flags.calamityIntro = true; State.save(); screen('<div class="castle-scene">🏰</div>', 'bg-malice'); return dialogue(STORY.calamity.intro, calamityIntro); }
    itemPrep('Hyrule Castle — Calamity Ganon', 'The final battle. Questions from every subject. Three phases. Take a deep breath.', calamityFight);
  }
  function calamityFight(items) {
    const s = S(); const C = STORY.calamity;
    const all = State.SUBJECTS.flatMap(x => topicsOf(x));
    battle({
      kind: 'calamity', title: C.name, subtitle: 'The final battle', total: null, hearts: s.hearts, timer: 70, items,
      boss: {
        name: C.name, emoji: C.emoji, hp: 160, color: '#d1004f', element: 'malice',
        dmg: B => (B.phase === 2 ? 40 : State.weapon().dmg),
        onPhase: B => {
          if (B.phase === 0) {
            B.phase = 1; U.sfx.boss(); toast(C.phase2, 'bad'); B.setBoss(C.name + ' (enraged)', '👿', 180); $('#boss').classList.add('enraged');
            setTimeout(B.resume, 600); return true;
          }
          if (B.phase === 1) {
            B.phase = 2; B.hearts = B.maxHearts; $('#boss').classList.remove('enraged');
            dialogue(C.phase3, () => { B.setBoss(C.beastName, C.beastEmoji, 160); $('.arena').classList.add('light'); B.resume(); });
            return true;
          }
          return false;
        },
      },
      wrongDamage: B => (B.phase === 1 ? 2 : 1),
      next: B => ({ topic: weakWeighted(all), lv: B.phase === 0 ? 2 : 3 }),
      intro: [[C.name, '…HYRULE… WILL… FORGET…'], ['Zelda', 'Don\'t listen to it! You know this. Show it everything you\'ve learned!']],
      onEnd: res => {
        if (res.won) {
          const first = !s.calamity; s.calamity = true; s.rupees += 1000; State.addMemory('m-final'); State.save();
          U.sfx.fanfare(); confetti(200);
          screen('<div class="dawn">🌅</div>', 'bg-win');
          dialogue(C.ending, () => ending(res, first));
        } else results(res, { retry: calamityIntro, next: map, nextLabel: 'Retreat' });
      },
    });
  }
  function ending(res, first) {
    const s = S(); const st = s.stats;
    screen(`<div class="page ending">
      <h1>The End</h1><h2>…and the beginning of ${U.esc(s.hero)}'s legend.</h2>
      <div class="res-stats">
        <div><b>${st.answered}</b><span>questions answered</span></div>
        <div><b>${st.answered ? Math.round((st.correct / st.answered) * 100) : 0}%</b><span>accuracy</span></div>
        <div><b>${st.bestStreak}</b><span>best combo</span></div>
        <div><b>${s.hearts}</b><span>hearts</span></div>
        <div><b>${s.seedsTotal}</b><span>Korok seeds</span></div>
        <div><b>${Math.round(st.playSeconds / 60)}</b><span>minutes played</span></div>
      </div>
      <p>Hyrule is safe — but a true hero keeps training. Aim for ★★★ in every shrine, beat your Trial of the Sword record and take the Hateno practice papers to get 11+ ready!</p>
      ${first ? '<div class="reward big">◆ +1000 rupees · Memory unlocked: Zelda\'s Promise</div>' : ''}
      <button class="btn big primary" id="next">Return to Hyrule ▶</button></div>`, 'bg-win');
    on('#next', map);
  }

  /* =========================================================== MASTER SWORD & TRIAL OF THE SWORD */
  function masterSword() {
    const s = S();
    if (s.weapon === 'master' || s.ownedWeapons.includes('master')) {
      return modal(`<h3>🌲 The Lost Woods</h3><p>The Great Deku Tree rumbles: "The <b>Trial of the Sword</b> awaits. How many floors can you climb with only three hearts and no runes?"</p><p>Your record: <b>Floor ${s.swordBest}</b></p>`, [{ label: 'Leave' }, { label: 'Begin the Trial ⚔', cls: 'primary', fn: swordTrial }]);
    }
    if (State.masterSwordReady()) {
      return modal(`<h3>🌲 The Master Sword</h3><p>The legendary sword rests in its pedestal. With ${s.hearts} hearts, you are strong enough to draw it.</p>`, [{ label: 'Leave' }, { label: 'Draw the sword! ✨', cls: 'primary', fn: () => {
        s.ownedWeapons.push('master'); s.weapon = 'master'; State.addMemory('m-sword'); State.save(); U.sfx.fanfare(); confetti();
        screen('<div class="sword-scene">🗡️</div>', 'bg-win');
        dialogue([['Great Deku Tree', `${s.hero}… you have drawn the Master Sword. It deals ${State.weapon().dmg} damage — the strongest blade in Hyrule.`], ['Great Deku Tree', 'The Trial of the Sword is now open to you here in the Lost Woods.']], () => memoryScreen('m-sword', map));
      } }]);
    }
    modal(`<h3>🌲 The Lost Woods</h3><p>Deep in the misty woods rests the <b>Master Sword</b>. Only a hero with at least <b>${State.MASTER_SWORD_HEARTS} hearts</b> who has freed a Champion can draw it.</p><p>You have ${s.hearts} heart${s.hearts > 1 ? 's' : ''} and have freed ${State.bossesBeaten()} Champion${State.bossesBeaten() === 1 ? '' : 's'}.</p>`, [{ label: 'OK' }]);
  }
  function swordTrial() {
    const s = S(); const all = State.SUBJECTS.flatMap(x => topicsOf(x));
    battle({
      kind: 'sword', title: 'Trial of the Sword', subtitle: 'How far can you go?', total: null, hearts: 3, timer: 45,
      next: B => ({ topic: U.pick(all), lv: Math.min(3, 1 + Math.floor(B.idx / 8)) }),
      onEnd: res => {
        const floor = res.B.correct; const rec = floor > s.swordBest; if (rec) s.swordBest = floor; s.rupees += floor * 5; State.save();
        results(res, { heading: 'The trial ends', extra: `<div class="reward big">🗡️ You reached floor <b>${floor}</b>${rec ? ' — a NEW RECORD!' : ` (record: ${s.swordBest})`}<br><small>+${floor * 5} rupees</small></div>`, retry: swordTrial, next: map });
      },
    });
  }

  /* =========================================================== BLOOD MOON (spaced review of mistakes) */
  function bloodMoonIntro() {
    screen('<div class="moon">🌕</div>', 'bg-blood');
    dialogue([['Zelda', `${S().hero}, beware! The Blood Moon rises… questions you got wrong before have come back to life!`], ['Zelda', 'Defeat them now and they\'ll be gone for good. Remember what the explanations taught you!']], bloodMoon);
  }
  function bloodMoon() {
    const s = S();
    const pool = U.shuffle(s.mistakes.slice()).slice(0, 8);
    battle({
      kind: 'bloodmoon', title: 'Blood Moon', subtitle: 'Your old mistakes return!', total: pool.length, hearts: 4,
      next: B => {
        const m = pool[B.idx]; const t = topicById(m.topicId);
        // half the time it's the exact question again; otherwise a fresh one of the same kind
        return { topic: t, lv: m.lv, q: Math.random() < 0.5 ? m.q : null, mistake: m };
      },
      fromMistake: (cur, ok) => { if (ok && cur.mistake) { const i = s.mistakes.indexOf(cur.mistake); if (i > -1) s.mistakes.splice(i, 1); } },
      onEnd: res => {
        const bonus = res.B.correct * 10; s.rupees += bonus; State.save();
        results(res, { heading: 'The Blood Moon sets', extra: `<div class="reward">🌕 You banished ${res.B.correct} returning monster${res.B.correct === 1 ? '' : 's'}! +${bonus} rupees</div>`, next: map });
      },
    });
  }

  /* =========================================================== PRACTICE PAPERS (exam mode) */
  function mockMenu() {
    const s = S();
    const hist = s.mocks.slice(-6).reverse();
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>🏚️ Hateno Ancient Tech Lab</h2></div>
      <div class="lesson"><div class="monk">👩‍🔬</div><div><h3>Purah's Practice Papers</h3>
      <p>"Want to know how ready you are for the real 11+? Try one of my practice papers! Just like the real exam: <b>no hints, no runes, no feedback until the end</b>, and a time limit."</p>
      <p class="muted">20 questions · 15 minutes · mark your answers carefully!</p></div></div>
      <div class="cards">${State.SUBJECTS.map(x => `<button class="card" data-sub="${x}"><div class="shrine-ico">${regionOfSubject(x).emoji}</div><div><h3>${State.SUBJECT_NAMES[x]}</h3><p class="muted">Readiness: ${State.subjectMastery(x)}%</p></div><div>Start ▶</div></button>`).join('')}
      <button class="card" data-sub="mixed"><div class="shrine-ico">🧭</div><div><h3>Mixed Paper</h3><p class="muted">All four subjects</p></div><div>Start ▶</div></button></div>
      <div class="row center"><label class="chk"><input type="checkbox" id="hard"> 11+ standard (Master level). Leave unticked for Adept level.</label></div>
      ${hist.length ? `<h3>Recent papers</h3><table class="hist">${hist.map(h => `<tr><td>${h.date}</td><td>${h.subject}</td><td>${h.level === 3 ? 'Master' : 'Adept'}</td><td><b>${h.score}/${h.total}</b> (${Math.round((h.score / h.total) * 100)}%)</td></tr>`).join('')}</table>` : ''}
    </div>`, 'bg-shrine');
    on('#back', map);
    on('[data-sub]', (e, el) => mock(el.dataset.sub, $('#hard').checked ? 3 : 2));
  }
  function mock(subject, lv) {
    const s = S();
    const ts = subject === 'mixed' ? State.SUBJECTS.flatMap(x => topicsOf(x)) : topicsOf(subject);
    const order = []; for (let i = 0; i < 20; i++) order.push(ts[i % ts.length]);
    const seq = U.shuffle(order);
    battle({
      kind: 'mock', exam: true, title: 'Practice Paper', subtitle: subject === 'mixed' ? 'Mixed' : State.SUBJECT_NAMES[subject], total: 20, hearts: 99, examTime: 15 * 60,
      next: B => ({ topic: seq[B.idx], lv }),
      onEnd: res => {
        const B = res.B; const score = B.correct; const reward = score * 4;
        s.rupees += reward; s.mocks.push({ date: new Date().toLocaleDateString('en-GB'), subject: subject === 'mixed' ? 'Mixed' : State.SUBJECT_NAMES[subject], level: lv, score, total: 20 }); State.save();
        const pct = Math.round((score / 20) * 100);
        const verdict = pct >= 85 ? 'Outstanding — that\'s a strong 11+ score! 🏆' : pct >= 70 ? 'Great work — you\'re on track. Keep practising! ⭐' : pct >= 50 ? 'Good effort — review the mistakes and train in the shrines. 💪' : 'This is tough material — the shrines will help you build up to it. 🌱';
        screen(`<div class="page results">
          <div class="res-head"><div class="big-ico">📜</div><h2>Paper complete</h2><p>${verdict}</p></div>
          <div class="res-stats"><div><b>${score}/20</b><span>score</span></div><div><b>${pct}%</b><span>percentage</span></div><div><b>◆ ${reward}</b><span>rupees</span></div></div>
          <details class="review" open><summary>📖 Go through the paper</summary>${B.log.map((l, i) => l.q ? `<div class="rv-n ${l.ok ? 'ok' : 'no'}">Q${i + 1} ${l.ok ? '✔' : '✘'}</div>${l.ok ? '' : reviewItem(l)}` : `<div class="rv-n no">Q${i + 1} — not answered</div>`).join('')}</details>
          <div class="row center"><button class="btn primary" id="next">Back to the Lab ▶</button></div></div>`, 'bg-shrine');
        on('#next', mockMenu);
      },
    });
  }

  /* =========================================================== GODDESS STATUE, HESTU, SHOP */
  function statue() {
    const s = S();
    screen(`${hud()}<div class="page center">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>🗿 Goddess Statue</h2></div>
      <p class="intro">"Hero… offer me <b>four Spirit Orbs</b> and I shall grant you strength."</p>
      <div class="orbs">${'🔮'.repeat(Math.min(s.orbs, 12))}${s.orbs > 12 ? ` +${s.orbs - 12}` : ''}${s.orbs ? '' : '<span class="muted">No orbs yet — clear shrine trials to earn them.</span>'}</div>
      <div class="row center">
        <button class="btn big ${s.orbs >= 4 ? 'primary' : ''}" id="heart" ${s.orbs >= 4 ? '' : 'disabled'}>❤ Heart Container<br><small>+1 heart in every boss battle</small></button>
        <button class="btn big ${s.orbs >= 4 ? 'primary' : ''}" id="stam" ${s.orbs >= 4 && s.stamina < 10 ? '' : 'disabled'}>🟢 Stamina Vessel<br><small>+6 seconds on every timer</small></button>
      </div>
      <p class="muted">You have ${s.hearts} hearts and ${s.stamina} stamina vessels. The Master Sword needs ${State.MASTER_SWORD_HEARTS} hearts.</p>
    </div>`, 'bg-statue');
    on('#back', map);
    on('#heart', () => { s.orbs -= 4; s.hearts++; State.save(); U.sfx.fanfare(); toast('❤ Your hearts grow stronger!', 'good'); statue(); });
    on('#stam', () => { s.orbs -= 4; s.stamina++; State.save(); U.sfx.fanfare(); toast('🟢 Your stamina increases!', 'good'); statue(); });
  }
  function hestu() {
    const s = S(); const cost = State.HESTU_COSTS[s.hestuLevel];
    screen(`${hud()}<div class="page center">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>🪇 Hestu</h2></div>
      <div class="hestu">🌳</div>
      <p class="intro">"Shake-shake! Korok seeds! Give Hestu seeds and Hestu makes your pouch BIGGER!"</p>
      <p>Each upgrade gives every rune <b>one extra use</b> per battle. Current: <b>${s.runeLevel}</b> use${s.runeLevel > 1 ? 's' : ''} each.</p>
      ${cost ? `<button class="btn big ${s.seeds >= cost ? 'primary' : ''}" id="up" ${s.seeds >= cost ? '' : 'disabled'}>Give ${cost} 🌰 for a bigger pouch</button><p class="muted">You have ${s.seeds} seed${s.seeds === 1 ? '' : 's'}. Find Koroks by answering correctly — they hide everywhere!</p>` : '<p class="ok-note">"Your pouch is the BIGGEST! Shake-shake!"</p>'}
    </div>`, 'bg-plateau');
    on('#back', map);
    on('#up', () => { s.seeds -= cost; s.hestuLevel++; s.runeLevel++; State.save(); U.sfx.korok(); confetti(30); toast('🪇 Your rune pouch grew!', 'good'); hestu(); });
  }
  function shop(tab = 'items') {
    const s = S();
    const row = (it, owned, equipped, kind) => `<div class="shop-row"><span class="si">${it.emoji}</span><div><b>${it.name}</b><p class="muted">${it.desc || (it.dmg ? `Boss damage: ${it.dmg}` : `Blocks ${it.blocks} hit${it.blocks === 1 ? '' : 's'} per boss battle`)}</p></div>
      ${kind === 'item' ? `<span class="muted">Have ${s.items[it.id]}</span><button class="btn small ${s.rupees >= it.price ? 'primary' : ''}" data-buy="${it.id}" data-kind="item" ${s.rupees >= it.price ? '' : 'disabled'}>◆ ${it.price}</button>`
        : equipped ? '<span class="tag ok">Equipped</span>' : owned ? `<button class="btn small" data-equip="${it.id}" data-kind="${kind}">Equip</button>`
        : it.price === null ? '<span class="muted">Not for sale</span>' : `<button class="btn small ${s.rupees >= it.price ? 'primary' : ''}" data-buy="${it.id}" data-kind="${kind}" ${s.rupees >= it.price ? '' : 'disabled'}>◆ ${it.price}</button>`}</div>`;
    let body = '';
    if (tab === 'items') body = State.ITEMS.map(it => row(it, false, false, 'item')).join('');
    if (tab === 'weapons') body = State.WEAPONS.map(w => row(w, s.ownedWeapons.includes(w.id), s.weapon === w.id, 'weapon')).join('');
    if (tab === 'shields') body = State.SHIELDS.map(w => row(w, s.ownedShields.includes(w.id), s.shield === w.id, 'shield')).join('');
    if (tab === 'armour') body = State.ARMOUR.map(w => row(w, s.ownedArmour.includes(w.id), s.armour === w.id, 'armour')).join('');
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>🎒 Beedle's Shop</h2></div>
      <p class="intro">"Thank you! Please come again! …Oh, you haven't bought anything yet. Take a look!"</p>
      <div class="tabs">${['items', 'weapons', 'shields', 'armour'].map(t => `<button class="tab ${t === tab ? 'on' : ''}" data-tab="${t}">${{ items: '🧪 Items', weapons: '⚔️ Weapons', shields: '🛡️ Shields', armour: '👕 Armour' }[t]}</button>`).join('')}</div>
      <div class="shop">${body}</div></div>`, 'bg-shop');
    on('#back', map);
    on('[data-tab]', (e, el) => shop(el.dataset.tab));
    on('[data-buy]', (e, el) => {
      const k = el.dataset.kind, id = el.dataset.buy;
      const list = { item: State.ITEMS, weapon: State.WEAPONS, shield: State.SHIELDS, armour: State.ARMOUR }[k]; const it = list.find(x => x.id === id);
      if (s.rupees < it.price) return;
      s.rupees -= it.price; U.sfx.coin();
      if (k === 'item') s.items[id]++;
      if (k === 'weapon') { s.ownedWeapons.push(id); s.weapon = id; }
      if (k === 'shield') { s.ownedShields.push(id); s.shield = id; }
      if (k === 'armour') { s.ownedArmour.push(id); s.armour = id; }
      State.save(); toast(`Bought ${it.emoji} ${it.name}!`, 'good'); shop(tab);
    });
    on('[data-equip]', (e, el) => { const k = el.dataset.kind; s[k] = el.dataset.equip; State.save(); shop(tab); });
  }

  /* =========================================================== ADVENTURE LOG */
  function adventureLog(tab = 'mastery') {
    const s = S(); const st = s.stats;
    let body = '';
    if (tab === 'mastery') {
      body = State.SUBJECTS.map(x => `<div class="subj"><h3>${regionOfSubject(x).emoji} ${State.SUBJECT_NAMES[x]} <span class="pill">${State.subjectMastery(x)}% ready</span></h3>
        ${topicsOf(x).map(t => { const m = State.mastery(t.id); return `<div class="mrow"><span>${t.icon} ${t.name}</span><div class="mbar big"><i style="width:${m}%" class="${m >= 75 ? 'hi' : m >= 45 ? 'mid' : 'lo'}"></i></div><span class="pct">${m}%</span><span class="stars">${'★'.repeat(s.stars[t.id] || 0)}</span></div>`; }).join('')}</div>`).join('')
        + '<p class="muted">Readiness grows as you answer questions correctly — harder trials count for more. 75%+ means that topic is in great shape for the 11+.</p>';
    }
    if (tab === 'memories') body = STORY.memories.map(m => State.hasMemory(m.id) ? `<div class="memory"><h3>📷 ${m.title}</h3><p>${fillName(m.text)}</p></div>` : '<div class="memory locked"><h3>📷 ???</h3><p class="muted">A memory not yet recovered…</p></div>').join('');
    if (tab === 'stats') body = `<div class="res-stats">
        <div><b>${st.answered}</b><span>questions</span></div><div><b>${st.answered ? Math.round((st.correct / st.answered) * 100) : 0}%</b><span>accuracy</span></div>
        <div><b>${st.bestStreak}</b><span>best combo</span></div><div><b>${st.trials}</b><span>trials cleared</span></div><div><b>${st.perfect}</b><span>perfect runs</span></div>
        <div><b>${s.streak.best}</b><span>best day streak</span></div><div><b>${s.seedsTotal}</b><span>Korok seeds found</span></div><div><b>${s.orbsTotal}</b><span>Spirit Orbs</span></div>
        <div><b>${Math.round(st.playSeconds / 60)}</b><span>minutes played</span></div><div><b>${s.swordBest}</b><span>Sword Trial record</span></div></div>
        <h3>Sheikah Runes & Champion Powers</h3>
        <div class="powers">${Object.entries(STORY.runes).map(([k, r]) => `<div class="${s.runes[k] ? '' : 'locked'}">${r.emoji} <b>${r.name}</b> — ${r.desc}</div>`).join('')}
        ${Object.entries(STORY.champions).map(([k, r]) => `<div class="${s.champions[k] ? '' : 'locked'}">${r.emoji} <b>${r.name}</b> — ${s.champions[k] ? r.desc : '???'}</div>`).join('')}</div>`;
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>📒 Adventure Log</h2></div>
      <div class="tabs">${[['mastery', '🧠 11+ Readiness'], ['memories', '📷 Memories'], ['stats', '📊 Stats']].map(([k, l]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
      ${body}</div>`, 'bg-shrine');
    on('#back', map); on('[data-tab]', (e, el) => adventureLog(el.dataset.tab));
  }
  function memoryScreen(id, next) {
    const m = STORY.memories.find(x => x.id === id);
    screen(`<div class="page memory-screen"><div class="memory big"><div class="photo">📷</div><h2>${m.title}</h2><p>${fillName(m.text)}</p></div><button class="btn big primary" id="next">Continue ▶</button></div>`, 'bg-memory');
    U.sfx.orb(); on('#next', next);
  }

  /* =========================================================== SETTINGS */
  function settings() {
    const s = S(); const st = s.settings;
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>⚙️ Settings</h2></div>
      <div class="settings">
        <label class="chk"><input type="checkbox" id="snd" ${st.sound ? 'checked' : ''}> 🔊 Sound effects</label>
        <label class="chk"><input type="checkbox" id="tmr" ${st.timers ? 'checked' : ''}> ⏱ Timers in Master trials and boss battles</label>
        <label class="chk"><input type="checkbox" id="auto" ${st.autoRead ? 'checked' : ''}> 🗣️ Read every question aloud automatically</label>
        <label>Hero name <input id="nm" maxlength="14" value="${U.esc(s.hero)}"></label>
      </div>
      <h3>👪 Grown-ups' corner</h3>
      <p class="muted">Progress is saved in this browser. To move to another device, copy the save code and paste it there.</p>
      <div class="row"><button class="btn" id="exp">Copy save code</button><button class="btn" id="imp">Load save code</button><button class="btn danger" id="wipe">Delete save</button></div>
      <textarea id="code" rows="3" placeholder="Save code appears / paste here"></textarea>
      <p class="muted">Content follows the GL Assessment 11+ format (English, Maths, Verbal Reasoning, Non-Verbal Reasoning). Free official familiarisation papers: <a href="https://11plus.gl-assessment.co.uk/pages/free-materials" target="_blank" rel="noopener">11plus.gl-assessment.co.uk</a>.</p>
      <p class="muted">Fan-made educational game. Not affiliated with or endorsed by Nintendo.</p>
    </div>`, 'bg-shrine');
    on('#back', map);
    $('#snd').addEventListener('change', e => { st.sound = U.soundOn = e.target.checked; State.save(); });
    $('#tmr').addEventListener('change', e => { st.timers = e.target.checked; State.save(); });
    $('#auto').addEventListener('change', e => { st.autoRead = e.target.checked; State.save(); });
    $('#nm').addEventListener('change', e => { s.hero = e.target.value.trim() || s.hero; State.save(); });
    on('#exp', () => { const c = State.exportCode(); $('#code').value = c; $('#code').select(); const fallback = () => toast('Select the code above and copy it.'); try { navigator.clipboard.writeText(c).then(() => toast('Save code copied!'), fallback); } catch (e) { fallback(); } });
    on('#imp', () => { try { State.importCode($('#code').value); toast('Save loaded!', 'good'); map(); } catch (e) { toast('That code didn\'t work.', 'bad'); } });
    on('#wipe', () => modal('<h3>Delete this save?</h3><p>All progress will be lost forever.</p>', [{ label: 'Cancel' }, { label: 'Delete', cls: 'danger', fn: () => { State.wipe(); title(); } }]));
  }

  // play-time tracker
  setInterval(() => { if (S() && document.visibilityState === 'visible') { S().stats.playSeconds += 30; State.save(); } }, 30000);

  window.Game = { title, map };
  title();
})();
