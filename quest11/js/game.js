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
  const IC = ART.icons;
  const heroArt = () => ART.hero({ armour: S().armour, shield: S().shield, weapon: S().weapon });
  const wait = ms => new Promise(r => setTimeout(r, FX.reduce ? 0 : ms));
  const ELEMENT = { maths: 'fire', english: 'water', verbal: 'wind', nonverbal: 'thunder' };

  let intervals = [];
  let keyHandler = null;
  function clearScreen() {
    intervals.forEach(clearInterval); intervals = [];
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    $('#overlay').innerHTML = ''; $('#overlay').className = '';
  }
  // theme = background scene; music = ambient track
  function screen(html, theme = 'map', music = null) {
    clearScreen(); FX.theme(theme); if (music) FX.Music.play(music);
    app.className = 'scr-' + theme; app.innerHTML = html; window.scrollTo(0, 0);
    app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
  }
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
  function heartsHtml(n, max, breaking = []) {
    let h = ''; for (let i = 0; i < max; i++) h += `<span class="hslot ${breaking.includes(i) ? 'breaking' : ''}">${IC.heart(i < n || breaking.includes(i))}</span>`;
    return `<span class="hearts">${h}</span>`;
  }
  function rankBadge() {
    const r = State.rank(); const pct = Math.round((r.into / r.need) * 100);
    return `<div class="rank" id="rank" title="${r.title}"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" class="rk-bg"/><circle cx="20" cy="20" r="17" class="rk-fg" style="stroke-dasharray:${(pct / 100) * 106.8} 107"/></svg><b>${r.level}</b><span>${r.title}</span></div>`;
  }
  function hud() {
    const s = S();
    return `<div class="hud">
      <div class="hud-l">${rankBadge()}${heartsHtml(s.hearts, s.hearts)}</div>
      <div class="hud-r">
        <span class="pill" id="hud-rupees" title="Rupees">${IC.rupee('green')} <b>${s.rupees}</b></span>
        <span class="pill" id="hud-seeds" title="Korok Seeds">${IC.seed()} <b>${s.seeds}</b></span>
        <span class="pill" id="hud-orbs" title="Spirit Orbs">${IC.orb()} <b>${s.orbs}</b></span>
        <span class="pill" title="Days in a row">🔥 <b>${s.streak.days}</b></span>
      </div></div>`;
  }
  function toast(msg, kind = '') {
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = msg;
    document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
  }
  function confetti(n = 60) {
    FX.burst(window.innerWidth / 2, window.innerHeight * 0.35, { n, colors: ['#3fe0ff', '#ffd23d', '#7ad97a', '#ff6a3d', '#c78bff', '#fff'], kind: 'star', speed: 520, size: 5, life: 1.6, gravity: 380 });
  }

  /* ---------------- Dialogue (BotW-style box with portrait) ---------------- */
  const PORTRAIT = { Zelda: ART.zelda, 'Old Man': ART.oldMan, Monk: ART.monk, Hestu: ART.hestu, Beedle: ART.beedle, Korok: ART.korok };
  function dialogue(lines, done) {
    const ov = $('#overlay'); ov.className = 'dlg-wrap'; let i = 0; let typing = null; let full = '';
    const show = () => {
      const [who, text] = lines[i]; full = fillName(text);
      const pf = PORTRAIT[who];
      ov.innerHTML = `<div class="dlg ${pf ? 'has-p' : ''}" role="dialog">${pf ? `<div class="portrait">${pf()}</div>` : ''}<div class="dlg-body"><div class="who">${U.esc(fillName(who))}</div><p class="txt"></p><div class="more">${i < lines.length - 1 ? '▼' : '✔'}</div></div></div>`;
      const p = $('.txt', ov); let k = 0; clearInterval(typing);
      typing = setInterval(() => { k += 2; p.textContent = full.slice(0, k); if (k % 6 === 0) U.sfx.tick(); if (k >= full.length) { clearInterval(typing); typing = null; } }, 22);
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
    ov.innerHTML = `<div class="modal slate">${html}<div class="row">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
    ov.onclick = null;
    $$('button[data-i]', ov).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); U.sfx.click(); ov.innerHTML = ''; ov.className = ''; const fn = buttons[+b.dataset.i].fn; fn && fn(); }));
  }
  // run reward overlays one after another
  function sequence(steps, done) { const next = () => { const st = steps.shift(); if (!st) return done && done(); st(next); }; next(); }
  const gainXp = (n, el) => {
    const up = State.addXp(n);
    if (el) FX.floatText(el, `+${n} XP`, 'xp');
    if (up) { const r = State.rank(); setTimeout(() => { FX.banner(`Hero Rank ${r.level}! <small>${r.title}</small>`, 'rankup'); U.sfx.fanfare(); confetti(40); }, 500); }
    const rb = $('#rank'); if (rb) rb.outerHTML = rankBadge();
  };

  /* =========================================================== TITLE */
  function title() {
    const has = State.load();
    screen(`<div class="title-screen">
      <div class="logo">
        <svg class="triforce" viewBox="0 0 100 88"><defs><linearGradient id="tfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#e0a420"/></linearGradient></defs><path d="M50,0 L75,44 H25Z M25,44 L50,88 H0Z M75,44 L100,88 H50Z" fill="url(#tfg)" stroke="#8a5a10" stroke-width="2"/></svg>
        <h1><small>The Legend of the Eleven</small>${STORY.gameTitle}</h1>
        <h2>${STORY.gameSubtitle}</h2>
      </div>
      <div class="title-hero">${S() ? heroArt() : ART.hero({})}</div>
      <div class="menu">
        ${has ? `<button class="btn big primary glow" id="cont">▶ Continue: ${U.esc(S().hero)} <small>Rank ${State.rank().level}</small></button>` : ''}
        <button class="btn big ${has ? '' : 'primary glow'}" id="new">✦ New Adventure</button>
      </div>
      <p class="fine">A fan-made learning game for the GL Assessment 11+: English · Maths · Verbal Reasoning · Non-Verbal Reasoning.<br>Not affiliated with or endorsed by Nintendo.</p>
    </div>`, 'title');
    const start = () => { FX.Music.unlock(); if (S()) FX.Music.set(S().settings.music !== false); FX.Music.play('field'); };
    on('#cont', () => { start(); State.touchDay(); U.soundOn = S().settings.sound; FX.flash('#fff', 0.7); map(); });
    on('#new', () => {
      start();
      if (has) modal('<h3>Start a new adventure?</h3><p>This will replace your current save.</p>', [{ label: 'Cancel' }, { label: 'Start over', cls: 'danger', fn: newGame }]);
      else newGame();
    });
  }

  function newGame() {
    screen(`<div class="center-card slate">
      <div class="nm-hero">${ART.hero({})}</div>
      <h2>What is your hero's name?</h2>
      <input id="nm" maxlength="14" value="${STORY.defaultHero}" autocomplete="off">
      <p class="muted">You can be Link, or use your own name!</p>
      <button class="btn big primary" id="go">Begin ▶</button></div>`, 'shrine', 'shrine');
    const go = () => { const n = $('#nm').value.trim() || STORY.defaultHero; State.newGame(n); State.touchDay(); U.soundOn = true; intro(); };
    on('#go', go); $('#nm').focus(); $('#nm').select();
    $('#nm').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  function intro() {
    screen(`<div class="resurrection"><div class="pod"></div><div class="sleeper">${heroArt()}</div></div>`, 'shrine', 'shrine');
    dialogue(STORY.intro, () => {
      S().flags.introSeen = true; State.save();
      FX.flash('#ffffff', 1); U.sfx.solved();
      setTimeout(() => plateau(true), 300);
    });
  }

  /* =========================================================== MAP */
  const PINS = { maths: [77, 21], english: [86, 52], verbal: [20, 26], nonverbal: [20, 80], castle: [50, 44], woods: [49, 17], plateau: [50, 79], hateno: [76, 79], blood: [33, 62], stable: [38, 53], house: [89, 70], range: [27, 41], kass: [63, 30] };
  function map() {
    const s = S();
    if (!s.flags.introSeen) return intro();
    if (!State.plateauDone()) return plateau();
    World.applyTheme();
    // daily treasure chest
    const today = new Date().toISOString().slice(0, 10);
    const freed = id => s.bosses[id];
    const pin = (r) => {
      const stars = State.regionStars(r), max = topicsOf(r.subject).length * 3; const pct = Math.round((stars / max) * 100);
      const [x, y] = PINS[r.id];
      return `<button class="pin region ${freed(r.id) ? 'freed' : ''} ${s.fog[r.id] ? '' : 'unexplored'}" style="left:${x}%;top:${y}%;--c:${r.color}" data-region="${r.id}">
        <span class="pin-art">${ART.beast(r.subject, freed(r.id))}</span>
        <span class="pin-lbl"><b>${s.mastered[r.id] ? '🏆 ' : ''}${r.name}</b><small>${State.SUBJECT_NAMES[r.subject]}</small><i class="pbar"><i style="width:${pct}%"></i></i></span></button>`;
    };
    const beams = R().filter(r => freed(r.id)).map(r => `<line x1="${PINS[r.id][0]}" y1="${PINS[r.id][1]}" x2="50" y2="44" class="beam"/>`).join('');
    const daily = s.daily; const goal = State.DAILY_GOAL;
    const bloodMoon = s.mistakes.length >= 6;
    const here = PINS[s.lastRegion] || PINS.plateau;
    screen(`${hud()}
      <div class="slate-frame">
        <div class="map-scroll" id="mapscroll"><div class="map-wrap">
          ${ART.worldMap(s)}
          <svg class="beams" viewBox="0 0 100 100" preserveAspectRatio="none">${beams}</svg>
          ${R().map(pin).join('')}
          <button class="pin castle ${State.calamityUnlocked() ? 'ready' : 'locked'} ${s.calamity ? 'freed' : ''}" style="left:${PINS.castle[0]}%;top:${PINS.castle[1]}%" id="castle"><span class="pin-lbl"><b>Hyrule Castle</b><small>${s.calamity ? 'Peace restored' : State.calamityUnlocked() ? 'Face Calamity Ganon!' : `${State.bossesBeaten()}/4 Champions freed`}</small></span></button>
          <button class="pin small" style="left:${PINS.woods[0]}%;top:${PINS.woods[1]}%" id="woods"><span class="pin-art sm">${IC.sword()}</span><span class="pin-lbl"><b>Lost Woods</b></span></button>
          <button class="pin small" style="left:${PINS.plateau[0]}%;top:${PINS.plateau[1]}%" id="plat"><span class="pin-art sm">${IC.tower(true)}</span><span class="pin-lbl"><b>Great Plateau</b></span></button>
          <button class="pin small" style="left:${PINS.hateno[0]}%;top:${PINS.hateno[1]}%" id="hateno"><span class="pin-art sm">${IC.lab()}</span><span class="pin-lbl"><b>Hateno Lab</b><small>Practice papers</small></span></button>
          <button class="pin small side" style="left:${PINS.stable[0]}%;top:${PINS.stable[1]}%" id="stable"><span class="pin-art sm">${IC.stable()}</span><span class="pin-lbl"><b>Outskirt Stable</b><small>Horses &amp; cooking</small></span></button>
          <button class="pin small side" style="left:${PINS.house[0]}%;top:${PINS.house[1]}%" id="house"><span class="pin-art sm">${IC.house()}</span><span class="pin-lbl"><b>Hateno House</b></span></button>
          <button class="pin small side" style="left:${PINS.range[0]}%;top:${PINS.range[1]}%" id="range"><span class="pin-art sm">${IC.range()}</span><span class="pin-lbl"><b>Flight Range</b></span></button>
          <button class="pin small side" style="left:${PINS.kass[0]}%;top:${PINS.kass[1]}%" id="kass"><span class="pin-art sm">${IC.kass()}</span><span class="pin-lbl"><b>Kass's Song</b></span></button>
          ${bloodMoon ? `<button class="pin bloodmoon" style="left:${PINS.blood[0]}%;top:${PINS.blood[1]}%" id="blood"><span class="pin-art sm">🌕</span><span class="pin-lbl"><b>Blood Moon!</b><small>${s.mistakes.length} mistakes return</small></span></button>` : ''}
          <div class="me" id="me" style="left:${here[0]}%;top:${here[1]}%">${ART.hero({ armour: s.armour, shield: s.shield, weapon: s.weapon })}</div>
        </div></div>
      </div>
      <p class="map-hint">👆 Drag the map to explore Hyrule</p>
      <div class="daily slate">
        <div class="dq">${IC.chest()}<div><b>Daily Quest:</b> answer ${goal} questions correctly today <span class="muted">(${Math.min(daily.correct, goal)}/${goal})</span><div class="bar"><i style="width:${Math.min(100, (daily.correct / goal) * 100)}%"></i></div></div></div>
        ${daily.correct >= goal && !daily.claimed ? '<button class="btn primary glow" id="claim">Claim reward!</button>' : daily.claimed ? '<span class="tag ok">Complete ✓</span>' : ''}
      </div>
      <nav class="dock">
        <button class="dock-b" id="shop">${ART.beedle()}<span>Shop</span></button>
        <button class="dock-b" id="statue">${ART.goddess()}<span>Goddess</span></button>
        <button class="dock-b" id="hestu">${ART.hestu()}<span>Hestu</span></button>
        <button class="dock-b" id="quests"><span class="dock-ic">📜</span><span>Quests</span>${State.questsReady() ? `<i class="badge">${State.questsReady()}</i>` : ''}</button>
        <button class="dock-b" id="bag"><span class="dock-ic">🎒</span><span>Bag</span></button>
        <button class="dock-b" id="log"><span class="dock-ic">📒</span><span>Log</span></button>
        <button class="dock-b" id="gear"><span class="dock-ic">⚙️</span><span>Settings</span></button>
      </nav>`, 'map', 'field');
    // centre the map on the hero on small screens
    const sc = $('#mapscroll'); if (sc) sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) * (here[0] / 100);
    const travel = (to, go) => {
      const me = $('#me'); const [x, y] = PINS[to];
      if (!me || FX.reduce) return go();
      me.classList.add('flying'); me.insertAdjacentHTML('afterbegin', `<div class="me-glider">${ART.glider(s.glider, false)}</div>`); U.sfx.korok();
      me.animate([{ left: me.style.left, top: me.style.top }, { left: `${(parseFloat(me.style.left) + x) / 2}%`, top: `${Math.min(parseFloat(me.style.top), y) - 12}%`, offset: 0.5 }, { left: x + '%', top: y + '%' }], { duration: 750, easing: 'ease-in-out' }).onfinish = () => { s.lastRegion = to; State.save(); go(); };
    };
    on('[data-region]', (e, el) => travel(el.dataset.region, () => regionScreen(el.dataset.region)));
    on('#castle', () => (State.calamityUnlocked() ? travel('castle', calamityIntro) : toast('Free all four Divine Beasts to reach Hyrule Castle.')));
    on('#woods', () => travel('woods', masterSword));
    on('#plat', () => travel('plateau', () => plateau()));
    on('#hateno', () => travel('hateno', mockMenu));
    on('#blood', bloodMoonIntro);
    on('#stable', () => travel('stable', World.stable)); on('#house', () => travel('house', World.house));
    on('#range', () => travel('range', World.archeryIntro)); on('#kass', () => travel('kass', World.kassIntro));
    on('#quests', World.quests); on('#bag', () => World.bag());
    on('#claim', () => {
      const bonus = 50 + Math.min(50, s.streak.days * 5);
      s.rupees += bonus; s.seeds++; s.seedsTotal++; s.tickets += 2; s.daily.claimed = true; State.save();
      FX.chest([{ icon: IC.rupee('red'), label: `${bonus} rupees` }, { icon: IC.seed(), label: 'Korok seed' }, { icon: '<span class="emo">🎫</span>', label: '2 Adventure Tickets' }], map, 'Daily Quest complete!');
    });
    on('#shop', () => World.shop()); on('#statue', () => statue()); on('#hestu', () => hestu()); on('#log', () => adventureLog()); on('#gear', settings);
    if (!s.flags.mapSeen) {
      s.flags.mapSeen = true; State.save();
      dialogue([['Old Man', 'This is Hyrule. Each region holds shrines for one subject, and a Divine Beast controlled by a Blight.'], ['Old Man', 'Clouds hide the regions you haven\'t explored yet. Travel there to reveal them!'], ['Old Man', 'Clear shrines to earn stars. Earn enough stars and you can challenge the Blight. Free all four Champions and you can face Calamity Ganon himself!']]);
    } else if (s.dailyChest !== today) {
      s.dailyChest = today; const r = U.pick([['rupee', 30], ['rupee', 50], ['seed', 1], ['item', 'hearty'], ['item', 'hasty'], ['rupee', 80]]);
      let label, icon;
      if (r[0] === 'rupee') { s.rupees += r[1]; label = `${r[1]} rupees`; icon = IC.rupee(r[1] >= 80 ? 'purple' : r[1] >= 50 ? 'red' : 'blue'); }
      else if (r[0] === 'seed') { s.seeds++; s.seedsTotal++; label = 'Korok seed'; icon = IC.seed(); }
      else { s.items[r[1]]++; const it = State.ITEMS.find(x => x.id === r[1]); label = it.name; icon = `<span class="emo">${it.emoji}</span>`; }
      State.save();
      setTimeout(() => FX.chest([{ icon, label }, { icon: '🔥', label: `Day streak: ${s.streak.days}` }], map, 'Daily treasure!'), 500);
    }
  }

  /* =========================================================== GREAT PLATEAU (tutorial) */
  function plateau(first) {
    const s = S();
    const done = State.plateauDone();
    const cards = STORY.plateauShrines.map((p, i) => {
      const ok = s.plateau[p.subject]; const rune = STORY.runes[p.rune];
      return `<button class="shrine-node ${ok ? 'done' : 'new'}" style="--d:${i * 0.12}s" data-sub="${p.subject}">
        ${IC.shrine(ok ? 'done' : 'new')}
        <b>${p.name} Shrine</b><small>${State.SUBJECT_NAMES[p.subject]}</small>
        <span class="rune-get ${ok ? '' : 'dim'}">${IC.rune(p.rune)} ${rune.name}</span></button>`;
    }).join('');
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>The Great Plateau</h2></div>
      <div class="plateau-scene"><div class="npc-stand">${ART.oldMan()}</div><p class="intro slate">Four tutorial shrines, one for each 11+ subject. Each one gives you a <b>Sheikah Rune</b>.</p></div>
      <div class="shrine-grid">${cards}</div>
      ${done ? '<p class="ok-note">✔ You have the paraglider! The whole of Hyrule is open to you.</p>' : ''}
    </div>`, 'plateau', 'field');
    on('#back', () => (done ? map() : toast('Complete all four shrines to get the paraglider!')));
    on('[data-sub]', (e, el) => plateauShrine(el.dataset.sub));
    if (first) dialogue(STORY.plateauIntro);
  }
  function plateauShrine(subject) {
    const p = STORY.plateauShrines.find(x => x.subject === subject);
    const rune = STORY.runes[p.rune];
    const ts = topicsOf(subject);
    battle({
      kind: 'tutorial', title: `${p.name} Shrine`, subtitle: `Tutorial · ${State.SUBJECT_NAMES[subject]}`, total: 6, hearts: 3, theme: 'shrine',
      foe: { name: 'Training Chuchu', art: ART.chuchu('plain'), attack: 'water' },
      next: B => { const t = ts[B.idx % ts.length]; return { topic: t, lv: 1 }; },
      intro: [['Monk', `Welcome, ${S().hero}. This shrine tests ${State.SUBJECT_NAMES[subject]}. A Chuchu blocks the way!`], ['Monk', 'Each right answer is a sword strike. Land 4 hits before it hits you 3 times. If you get one wrong, read the explanation — that is how heroes learn!']],
      onEnd: r => {
        const s = S();
        if (r.won) {
          const firstTime = !s.plateau[subject];
          s.plateau[subject] = true;
          const rewards = [];
          if (firstTime) {
            s.runes[p.rune] = true; s.orbs++; s.orbsTotal++;
            rewards.push(n => FX.itemGet(`<div class="rune-big">${IC.rune(p.rune)}</div>`, `You got the ${rune.name} rune!`, rune.desc, n));
            rewards.push(n => FX.itemGet(IC.orb(), 'You got a Spirit Orb!', 'Collect four and offer them at a Goddess Statue.', n));
          }
          State.save();
          results(r, { rewards, next: () => {
            if (State.plateauDone() && !s.flags.paraglider) {
              s.flags.paraglider = true; State.addMemory('m-plateau'); State.save();
              screen(`<div class="cutscene"><div class="npc-stand big">${ART.oldMan()}</div></div>`, 'plateau', 'field');
              dialogue(STORY.plateauDone, () => FX.itemGet('<div class="glider">🪂</div>', 'You got the Paraglider!', 'Now you can fly anywhere in Hyrule.', () => memoryScreen('m-plateau', map)));
            } else plateau();
          } });
        } else results(r, { retry: () => plateauShrine(subject), next: plateau });
      },
    });
  }

  /* =========================================================== REGION (saga-style path of shrines) */
  function regionScreen(id) {
    const r = region(id); const s = S(); const ts = topicsOf(r.subject);
    const firstVisit = !s.fog[id];
    const n = ts.length; const narrow = window.innerWidth < 600; const rowH = narrow ? 150 : 118;
    const pos = i => { const y = (n - i) * rowH + 40; const x = 50 + Math.sin(i * 1.15) * (narrow ? 24 : 30); return [x, y]; };
    const H = (n + 1) * rowH + 140;
    let current = ts.findIndex((t, i) => State.shrineUnlocked(r, i) && (s.stars[t.id] || 0) < 3); if (current < 0) current = n - 1;
    const pts = []; for (let i = 0; i < n; i++) pts.push(pos(i));
    const path = `M${pts.map(([x, y]) => `${x * 4},${y}`).join(' L')} L200,70`;
    const nodes = ts.map((t, i) => {
      const st = s.stars[t.id] || 0; const open = State.shrineUnlocked(r, i); const [x, y] = pos(i);
      const state = !open ? 'locked' : st >= 1 ? 'done' : 'new';
      return `<button class="shrine-node path-node ${state} ${st === 3 ? 'gold' : ''} ${i === current ? 'current' : ''}" style="left:${x}%;top:${y}px;--d:${i * 0.06}s" data-t="${t.id}" ${open ? '' : 'disabled'}>
        ${IC.shrine(state)}
        <span class="sn-stars">${'★'.repeat(st)}<span class="dim">${'★'.repeat(3 - st)}</span></span>
        <b>${r.shrines[i]}</b><small>${t.icon} ${t.name}</small>
        ${i === current ? `<span class="you">${heroArt()}</span>` : ''}</button>`;
    }).join('');
    const stars = State.regionStars(r), need = State.bossNeed(r);
    const unlocked = State.bossUnlocked(r); const beaten = s.bosses[r.id];
    screen(`${hud()}<div class="page region-page" style="--c:${r.color}">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>${r.name}</h2><span class="pill">${State.SUBJECT_NAMES[r.subject]} · ★ ${stars}/${n * 3}</span></div>
      ${s.mastered[r.id] ? '' : `<p class="mastery-hint">🏆 Champion's Challenge: ★★★ in every shrine here = ${STORY.regions.length ? CATALOG.MASTERY[r.id].champion : ''}'s one-of-a-kind reward (${World.masteryProgress(r.subject).done}/${n})</p>`}
      <div class="saga" style="height:${H}px">
        <svg class="saga-path" viewBox="0 0 400 ${H}" preserveAspectRatio="none"><path d="${path}" /></svg>
        <button class="beast-node ${beaten ? 'freed' : unlocked ? 'ready' : 'locked'}" id="boss" style="top:10px">
          <span class="bn-art">${ART.beast(r.subject, beaten)}</span>
          <span class="bn-boss">${beaten ? '' : ART.blight(r.element)}</span>
          <b>${r.beast}</b>
          <small>${beaten ? `✔ ${r.champion} is free! Rematch?` : unlocked ? `${r.boss} awaits!` : `🔒 Clear Trial 1 everywhere and earn ${need} ★ (${Math.min(stars, need)}/${need})`}</small>
        </button>
        ${nodes}
      </div>${World.masteryPanel(r)}</div>`, id, id);
    on('#back', map);
    on('[data-t]', (e, el) => shrineScreen(el.dataset.t));
    on('#boss', () => (unlocked ? bossPrep(r) : toast(`Earn ${need} ★ in ${r.name} to board the Divine Beast.`)));
    // scroll to current shrine
    const cur = $('.path-node.current'); if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: FX.reduce ? 'auto' : 'smooth' }), 150);
    if (firstVisit) {
      s.fog[id] = true; State.save();
      setTimeout(() => { FX.flash('#3fe0ff', 0.4); FX.banner(`Sheikah Tower activated<small>${r.name} map data updated</small>`, 'tower'); U.sfx.orb(); }, 250);
      setTimeout(() => dialogue(r.intro), 1500);
    } else {
      // award any Champion's reward already earned (e.g. stars from before this feature existed)
      const ms = World.checkMastery(); if (ms.length) setTimeout(() => sequence(ms, () => regionScreen(id)), 700);
    }
  }

  /* =========================================================== SHRINE (lesson + trials) */
  const TRIALS = [
    { lv: 1, name: 'Trial of Beginnings', label: 'Novice' },
    { lv: 2, name: 'Trial of Wisdom', label: 'Adept' },
    { lv: 3, name: 'Test of Strength', label: 'Master' },
  ];
  const ELNAME = { fire: 'Fire', water: '', wind: 'Ice', thunder: 'Electric', plain: '' };
  function trialFoe(subject, lv, idx) {
    const el = ELEMENT[subject];
    const opts = [
      [{ name: `${ELNAME[el]} Chuchu`.trim(), art: () => ART.chuchu(el), attack: el }, { name: `${ELNAME[el]} Keese`.trim(), art: () => ART.keese(el), attack: el }],
      [{ name: 'Red Bokoblin', art: () => ART.bokoblin('red'), attack: 'melee' }, { name: `${ELNAME[el]} Lizalfos`.trim(), art: () => ART.lizalfos(el), attack: el }, { name: 'Blue Moblin', art: () => ART.moblin(), attack: 'melee' }, { name: 'Blue Bokoblin', art: () => ART.bokoblin('blue'), attack: 'melee' }],
      [{ name: 'Guardian Scout', art: () => ART.guardianScout(), attack: 'laser' }, { name: 'Lynel', art: () => ART.lynel(), attack: 'fire' }, { name: 'Silver Bokoblin', art: () => ART.bokoblin('silver'), attack: 'melee' }],
    ][lv - 1];
    const f = opts[idx % opts.length]; return { name: f.name, art: f.art(), attack: f.attack };
  }
  function shrineScreen(topicId) {
    const t = topicById(topicId); const subj = subjectOf(topicId); const r = regionOfSubject(subj); const idx = topicsOf(subj).indexOf(t); const s = S();
    const st = s.stars[topicId] || 0;
    screen(`${hud()}<div class="page shrine-page">
      <div class="page-head"><button class="btn ghost" id="back">◀ ${r.name}</button><h2>${r.shrines[idx]} Shrine</h2></div>
      <div class="lesson-wrap">
        <div class="monk-seat">${ART.monk()}</div>
        <div class="lesson scroll"><h3>The Monk's Teaching: ${t.icon} ${t.name}</h3>${t.lesson}
          <button class="btn ghost small" id="read">${IC.rune('read')} Read to me</button></div>
      </div>
      <div class="trials">${TRIALS.map(tr => {
        const open = st >= tr.lv - 1; const done = st >= tr.lv; const foe = trialFoe(subj, tr.lv, idx);
        return `<button class="trial ${done ? 'done' : ''} ${open ? '' : 'locked'}" data-lv="${tr.lv}" ${open ? '' : 'disabled'}>
          <span class="tlv">${'★'.repeat(tr.lv)}</span>
          <span class="t-foe">${open ? foe.art : '<span class="qm">?</span>'}</span>
          <b>${tr.name}</b><span class="muted">${tr.label} · ${open ? foe.name : 'locked'}${tr.lv === 3 ? ' · timed' : ''}</span>
          <span class="t-go">${done ? '✔ Cleared · replay' : open ? 'Fight ⚔' : '🔒'}</span></button>`;
      }).join('')}</div>
      <p class="muted center">Land <b>6 hits</b> before the monster lands 3 on you. ${st === 0 ? 'Your first win here earns a <b>Spirit Orb</b>!' : ''}</p>
    </div>`, 'shrine', 'shrine');
    on('#back', () => regionScreen(r.id));
    on('#read', () => speak(plain(t.lesson)));
    on('[data-lv]', (e, el) => { FX.flash('#3fe0ff', 0.5); trial(topicId, +el.dataset.lv); });
  }

  // meal buffs last a number of shrine trials; the bed's rested bonus lasts one
  function endTrialBuffs() { const s = S(); for (const k of Object.keys(s.buffs)) if (s.buffs[k] > 0) s.buffs[k]--; s.restedBonus = false; }
  function trial(topicId, lv) {
    const t = topicById(topicId); const subj = subjectOf(topicId); const idx = topicsOf(subj).indexOf(t); const name = shrineName(subj, idx);
    const tr = TRIALS[lv - 1];
    const fixed = t.trial ? t.trial(lv, S().recentPassages || []) : null; // comprehension uses one passage per trial
    if (fixed) { const rp = S().recentPassages = (S().recentPassages || []).filter(x => x !== fixed.title); rp.push(fixed.title); if (rp.length > 4) rp.shift(); }
    const foe = trialFoe(subj, lv, idx);
    battle({
      kind: 'trial', title: name, subtitle: `${tr.name} · ${t.name}`, total: fixed ? fixed.length : 8, hearts: 3, fixed: !!fixed, theme: 'shrine',
      timer: lv === 3 ? 75 : 0, foe,
      next: B => (fixed && fixed[B.idx] ? { topic: t, lv, q: fixed[B.idx]() } : { topic: t, lv }),
      onEnd: r => {
        const s = S();
        if (r.won) {
          const prev = s.stars[topicId] || 0; const rewards = []; const loot = [];
          if (lv > prev) {
            s.stars[topicId] = lv;
            if (lv === 1) { s.orbs++; s.orbsTotal++; rewards.push(n => FX.itemGet(IC.orb(), 'You got a Spirit Orb!', 'Take four to a Goddess Statue for a Heart Container.', n)); }
            const chestR = [0, 30, 60, 120][lv]; s.rupees += chestR; loot.push({ icon: IC.rupee(lv === 3 ? 'purple' : lv === 2 ? 'red' : 'blue'), label: `${chestR} rupees` });
            if (lv === 3) { const it = U.pick(['hearty', 'fairy', 'bombarrow', 'hasty']); s.items[it]++; const I = State.ITEMS.find(i => i.id === it); loot.push({ icon: `<span class="emo">${I.emoji}</span>`, label: I.name }); }
            loot.push({ icon: '⭐', label: `${'★'.repeat(lv)} star${lv > 1 ? 's' : ''}` });
            rewards.push(n => FX.chest(loot, n, 'Shrine treasure!'));
            if (lv === 3) rewards.push(...World.checkMastery());
          }
          const drops = World.trialDrops(subj, foe.name, lv, false);
          if (r.B.wrong === 0) { s.tickets++; drops.push({ icon: '<span class="emo">🎫</span>', label: 'Perfect run: +1 ticket' }); }
          if (loot.length) loot.push(...drops); else rewards.push(n => FX.chest(drops, n, 'Monster loot!'));
          s.stats.trials++; endTrialBuffs(); State.save();
          results(r, { rewards, retry: () => trial(topicId, lv), next: () => shrineScreen(topicId), nextLabel: 'Back to shrine' });
        } else { endTrialBuffs(); State.save(); results(r, { retry: () => trial(topicId, lv), next: () => shrineScreen(topicId) }); }
      },
    });
  }

  /* =========================================================== BATTLE ENGINE */
  /*
    cfg: { kind, title, subtitle, total (number of questions in a trial; foe HP = total - 2), hearts, timer (sec/question, 0 = none),
           next(B) -> {topic, lv, q?}, foe: {name, art, attack}, boss: {name, art, hp, element, onPhase(B), enrage, dmg(B)},
           intro: dialogue lines, exam (no feedback), examTime (sec overall), theme, onEnd(result) }
    Trials: land (total - 2) hits before losing 3 hearts — the same pass mark as "at most 2 wrong out of 8".
  */
  function battle(cfg) {
    const s = S();
    const isBoss = !!cfg.boss; const exam = !!cfg.exam; const sword = cfg.kind === 'sword';
    const useItems = cfg.items || {};
    const mealFx = useItems.meal ? useItems.meal.split('|')[1] : '';
    const maxHearts = cfg.hearts + (useItems.hearty ? 3 : 0) + (mealFx === 'hearty' ? 2 : 0);
    const mightMult = Math.max(useItems.mighty ? 1.25 : 1, mealFx === 'mighty' ? 1.2 : 1); // elixir and meal don't stack
    const pet = !exam && s.pet && s.pet !== 'none' ? s.pet : null;
    const trail = (CATALOG.WEAPONS.find(w => w.id === s.weapon) || {}).trail || '#fff';
    document.documentElement.style.setProperty('--trail', trail);
    const foeHp = isBoss ? cfg.boss.hp : cfg.total ? cfg.total - 2 : 1;
    const B = {
      cfg, idx: 0, hearts: maxHearts, maxHearts, correct: 0, wrong: 0, streak: 0, best: 0, rupees: 0, seeds: 0, xp: 0, log: [],
      hp: foeHp, maxHp: foeHp, phase: 0, kills: 0,
      runes: {}, champ: {}, blocks: isBoss ? State.shield().blocks : 0, bombNext: false, furyNext: false,
      arrows: isBoss ? s.items.bombarrow + (s.mastered.verbal ? 3 : 0) : 0, freeArrows: isBoss && s.mastered.verbal ? 3 : 0, fairy: s.items.fairy > 0 && !exam && !sword,
      timeLeft: 0, frozen: false, q: null, cur: null, answered: false, revaliUsed: false,
      examLeft: cfg.examTime || 0, done: false, seen: new Set(),
    };
    if (!exam && !sword) {
      for (const k of Object.keys(STORY.runes)) if (s.runes[k]) B.runes[k] = State.runeCharges();
      for (const k of Object.keys(STORY.champions)) if (s.champions[k]) B.champ[k] = true;
    }
    for (const k of ['hearty', 'hasty', 'mighty']) if (useItems[k]) s.items[k]--;
    if (useItems.meal) { s.meals[useItems.meal]--; if (!s.meals[useItems.meal]) delete s.meals[useItems.meal]; }
    State.save(); FX.Music.intensity(0);
    const timerFor = () => (s.settings.timers && cfg.timer ? cfg.timer + State.timerBonus() + (useItems.hasty ? 20 : 0) + (mealFx === 'hasty' ? 15 : 0) : 0);
    const foe = isBoss ? { name: cfg.boss.name, art: cfg.boss.art, attack: cfg.boss.element } : cfg.foe || { name: 'Bokoblin', art: ART.bokoblin('red'), attack: 'melee' };
    const theme = cfg.theme || (isBoss ? (cfg.boss.theme || 'castle') : 'shrine');

    const arena = exam ? '' : `<div class="arena ${isBoss ? 'boss-arena' : ''}" id="arena">
        <div class="ground"></div>
        <div class="fighter hero-f" id="hero">${heroArt()}<svg class="stamina" id="stamina" viewBox="0 0 40 40" hidden><circle cx="20" cy="20" r="15" class="st-bg"/><circle cx="20" cy="20" r="15" class="st-fg" id="stfg"/></svg><div class="shield-bubble"></div></div>
        ${pet ? `<div class="pet-f" id="pet">${ART.pet(pet)}</div>` : ''}
        <div class="fighter foe-f ${isBoss ? 'boss' : ''}" id="foe">${foe.art}</div>
        <div class="combo" id="combo"></div>
      </div>`;
    screen(`<div class="battle ${isBoss ? 'is-boss' : ''} ${exam ? 'exam' : ''}">
      <header class="bhead slate">
        <div class="bh-l"><span id="hearts"></span><span class="bt"><b>${cfg.title}</b><small>${cfg.subtitle || ''}</small></span></div>
        ${exam ? '<div class="exam-clock" id="prog"></div>' : `<div class="foe-bar"><span class="fname" id="fname">${foe.name}</span><div class="hpbar ${isBoss ? 'boss' : ''}"><i id="hpfill"></i>${!isBoss ? '<span class="segs" id="segs"></span>' : ''}</div><span id="prog" class="prog"></span></div>`}
        <div class="bh-r"><span class="pill" id="b-rupees">${IC.rupee('green')} <b>${B.rupees}</b></span></div>
      </header>
      ${arena}
      <section class="qcard" id="qcard"></section>
      <footer class="runebar" id="runebar"></footer>
    </div>`, theme, isBoss ? (theme === 'castle' ? 'castle' : 'boss') : exam ? 'shrine' : 'battle');

    const elHearts = $('#hearts'), elProg = $('#prog'), qcard = $('#qcard');
    let prevHearts = B.hearts;
    const updateTop = () => {
      const breaking = []; for (let i = B.hearts; i < prevHearts; i++) breaking.push(i);
      elHearts.innerHTML = exam ? '' : heartsHtml(B.hearts, B.maxHearts, breaking); prevHearts = B.hearts;
      if (exam) elProg.textContent = `Question ${Math.min(B.idx + 1, cfg.total)} of ${cfg.total} · ⏱ ${Math.floor(B.examLeft / 60)}:${String(B.examLeft % 60).padStart(2, '0')}`;
      else elProg.textContent = '';
      if (!exam) {
        $('#hpfill').style.width = Math.max(0, (B.hp / B.maxHp) * 100) + '%';
        const sg = $('#segs'); if (sg) sg.innerHTML = Array.from({ length: B.maxHp - 1 }, () => '<i></i>').join('');
        const c = $('#combo'); c.innerHTML = B.streak >= 2 ? `<b>${B.streak}</b><span>combo</span>` : ''; c.className = 'combo ' + (B.streak >= 5 ? 'hot' : B.streak >= 3 ? 'warm' : '');
      }
      const br = $('#b-rupees'); if (br) br.innerHTML = `${IC.rupee('green')} <b>${B.rupees}</b>`;
    };
    const runeBar = () => {
      if (exam) { $('#runebar').innerHTML = `<button class="btn" id="finish">Finish paper ▶</button>`; on('#finish', () => modal('<h3>Finish now?</h3><p>Unanswered questions will be marked wrong.</p>', [{ label: 'Keep going' }, { label: 'Finish', cls: 'primary', fn: () => end(false, true) }])); return; }
      const rb = [];
      for (const [k, n] of Object.entries(B.runes)) {
        if (k === 'stasis' && !timerFor()) continue;
        const ru = STORY.runes[k]; rb.push(`<button class="rb ${n ? '' : 'spent'}" data-rune="${k}" title="${ru.name}: ${ru.desc}">${IC.rune(k)}<span>${ru.name}</span><i>${n}</i></button>`);
      }
      if (B.champ.urbosa !== undefined) rb.push(`<button class="rb champ ${B.champ.urbosa ? '' : 'spent'}" data-champ="urbosa" title="${STORY.champions.urbosa.desc}">${IC.rune('fury')}<span>Urbosa's Fury</span></button>`);
      if (isBoss && B.arrows) rb.push(`<button class="rb" data-arrow="1" title="Next correct answer deals double damage">${IC.rune('arrow')}<span>Bomb Arrow</span><i>${B.arrows}</i></button>`);
      const passive = [];
      if (B.champ.daruk === true) passive.push('<span title="Daruk\'s Protection">🛡️</span>'); if (B.champ.mipha === true) passive.push('<span title="Mipha\'s Grace">💧</span>'); if (B.champ.revali && !B.revaliUsed) passive.push('<span title="Revali\'s Gale">🌬️</span>');
      if (B.blocks) passive.push(`<span title="Shield blocks">🔰×${B.blocks}</span>`); if (B.fairy) passive.push('<span title="Fairy">🧚</span>');
      if (B.bombNext) passive.push('💣'); if (B.furyNext) passive.push('⚡');
      rb.push(`<button class="rb" id="speak" title="Read the question aloud">${IC.rune('read')}<span>Read</span></button>`);
      if (passive.length) rb.push(`<span class="passive">${passive.join(' ')}</span>`);
      if (!isBoss) rb.push(`<button class="rb quit" id="quit" title="Leave">✕</button>`);
      $('#runebar').innerHTML = rb.join('');
      on('[data-rune]', (e, el) => useRune(el.dataset.rune, el), $('#runebar'));
      on('[data-champ]', (e, el) => { if (!B.champ.urbosa || B.answered) return; B.champ.urbosa = false; B.furyNext = true; FX.flash('#ffe866', 0.5); FX.banner('Urbosa\'s Fury!', 'fury'); runeBar(); }, $('#runebar'));
      on('[data-arrow]', () => { if (B.answered || B.bombNext || !B.arrows) return; B.arrows--; if (B.freeArrows > 0) B.freeArrows--; else s.items.bombarrow--; State.save(); B.bombNext = true; toast('🏹 Bomb arrow nocked!'); runeBar(); }, $('#runebar'));
      on('#speak', () => speak(plain(B.q.prompt) + '. ' + (B.q.figs ? '' : B.q.options.map((o, i) => `${'ABCDE'[i]}: ${plain(o)}`).join('. '))), $('#runebar'));
      on('#quit', () => modal('<h3>Leave the battle?</h3><p>Progress in this trial will be lost.</p>', [{ label: 'Stay' }, { label: 'Leave', cls: 'danger', fn: () => cfg.onEnd({ won: false, quit: true, B }) }]), $('#runebar'));
    };
    function useRune(k, el) {
      if (!B.runes[k] || B.answered) return;
      const [x, y] = FX.center(el); FX.burst(x, y, { n: 16, colors: ['#3fe0ff', '#fff'], speed: 160, gravity: 0 });
      if (k === 'magnesis') {
        const wrong = $$('.opt', qcard).filter(b => +b.dataset.i !== B.q.answer && !b.disabled);
        if (wrong.length < 2) return;
        U.shuffle(wrong).slice(0, 2).forEach(b => { b.disabled = true; b.classList.add('pulled'); });
      } else if (k === 'bomb') { if (B.bombNext) return; B.bombNext = true; toast('💣 Remote Bomb set!'); }
      else if (k === 'stasis') { if (!B.timeLeft) return; B.frozen = true; $('#stamina').classList.add('frozen'); FX.flash('#ffd23d', 0.3); toast('⏸️ Time frozen!'); }
      else if (k === 'cryonis') { if (cfg.fixed) return toast('Cryonis can\'t freeze a reading passage question.'); B.runes[k]--; runeBar(); toast('🧊 Question frozen and replaced!'); return ask(); }
      B.runes[k]--; runeBar();
    }

    // No repeats inside a battle, and avoid anything asked in recent play. Small banks fall back
    // to an older question rather than stalling.
    function pickNext() {
      let fallback = null;
      for (let tries = 0; tries < 40; tries++) {
        const n = cfg.next(B);
        let q;
        try { q = n.q || n.topic.gen(n.lv); } catch (e) { console.warn('generator failed', n.topic && n.topic.id, e); continue; }
        if (!q || !q.options) continue;
        const sig = State.qSig(q);
        if (n.q || (!B.seen.has(sig) && (tries >= 25 || !State.recentlyAsked(sig)))) { B.seen.add(sig); State.markAsked(sig); return Object.assign(n, { q }); }
        if (!fallback && !B.seen.has(sig)) fallback = Object.assign(n, { q, sig });
      }
      if (fallback) { B.seen.add(fallback.sig); State.markAsked(fallback.sig); return fallback; }
      throw new Error('No question available');
    }
    function ask() {
      B.answered = false; B.frozen = false;
      B.cur = pickNext();
      const q = B.q = B.cur.q; window.__lastQ = q; // used by the automated play-test
      updateTop(); runeBar();
      const letters = 'ABCDE';
      qcard.innerHTML = `
        ${q.passage ? `<details class="passage" open><summary>📜 Read the passage</summary><div>${q.passage}</div></details>` : ''}
        <div class="prompt">${q.prompt}</div>
        ${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
        ${q.alphabet ? `<div class="alpha">${U.ALPHA.split('').map(c => `<span>${c}</span>`).join('')}</div>` : ''}
        <div class="opts ${q.figs ? 'figs' : ''} ${q.long || q.options.some(o => o.length > 38 && !q.figs) ? 'long' : ''}">
          ${q.options.map((o, i) => `<button class="opt" data-i="${i}" style="--d:${i * 0.05}s"><span class="k">${letters[i]}</span><span class="o">${o}</span></button>`).join('')}
        </div>
        <div class="feedback" id="fb" hidden></div>`;
      $$('.opt', qcard).forEach(b => b.addEventListener('click', () => answer(+b.dataset.i)));
      qcard.classList.remove('flash-ok', 'flash-no'); void qcard.offsetWidth; qcard.classList.add('qin');
      // timer = BotW stamina wheel
      const T = timerFor();
      intervals.forEach(clearInterval); intervals = [];
      if (exam) {
        intervals.push(setInterval(() => { B.examLeft--; updateTop(); if (B.examLeft <= 0) { toast('⏱ Time is up!'); end(false, true); } }, 1000));
      } else if (T) {
        B.timeLeft = T; const wheel = $('#stamina'); wheel.removeAttribute('hidden'); wheel.classList.remove('frozen', 'low');
        const fg = $('#stfg'); const C = 94.2; fg.style.strokeDasharray = `${C} ${C}`;
        intervals.push(setInterval(() => {
          if (B.answered || B.frozen) return;
          B.timeLeft--; fg.style.strokeDasharray = `${(B.timeLeft / T) * C} ${C}`;
          wheel.classList.toggle('low', B.timeLeft <= 10);
          if (B.timeLeft <= 5 && B.timeLeft > 0) U.sfx.tick();
          if (B.timeLeft <= 0) answer(-1);
        }, 1000));
      } else if ($('#stamina')) { $('#stamina').setAttribute('hidden', ''); B.timeLeft = 0; }
      if (s.settings.speech && s.settings.autoRead) speak(plain(q.prompt));
    }

    function answer(i) {
      if (B.answered || B.done) return;
      const q = B.q; const ok = i === q.answer; const btns = $$('.opt', qcard);
      // Revali's Gale: one free retry
      if (!ok && i >= 0 && B.champ.revali && !B.revaliUsed && !exam) {
        B.revaliUsed = true; btns[i].disabled = true; btns[i].classList.add('wrong');
        FX.banner('Revali\'s Gale!', 'gale'); FX.flash('#bff2dc', 0.3); U.sfx.wrong(); runeBar(); return;
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
      if (exam) { State.save(); return setTimeout(advance, 250); }
      let msg = '';
      const foeEl = $('#foe');
      if (ok) {
        U.sfx.correct(); qcard.classList.add('flash-ok');
        if (btns[i]) { const [x, y] = FX.center(btns[i]); FX.burst(x, y, { n: 14, colors: ['#5ce06a', '#fff'], speed: 180, gravity: 200 }); }
        let mult = 1; if (B.bombNext) { mult *= isBoss ? 2 : 3; B.bombNext = false; } if (B.furyNext) { mult *= 3; B.furyNext = false; }
        let dmg = 1;
        const weak = isBoss && State.weapon().weak && State.weapon().weak === cfg.boss.element;
        if (isBoss) { const base = cfg.boss.dmg ? cfg.boss.dmg(B) : State.weapon().dmg; dmg = Math.round(base * (1 + 0.1 * Math.min(B.streak - 1, 5)) * mult * mightMult * (weak ? 1.25 : 1)); }
        if (weak && !B.weakShown) { B.weakShown = true; setTimeout(() => FX.banner('Super effective!', 'flurry hot'), 500); }
        if (!exam) FX.Music.intensity(B.streak >= 5 ? 2 : B.streak >= 3 ? 1 : 0);
        const petEl = $('#pet'); if (petEl) { petEl.classList.remove('cheer'); void petEl.offsetWidth; petEl.classList.add('cheer'); }
        B.hp = Math.max(0, B.hp - dmg);
        strike(dmg, mult > 1, B.hp <= 0);
        const gain = Math.round((5 + Math.min(B.streak, 5)) * State.rupeeBonus(subjectOf(B.cur.topic.id)) * (isBoss ? 1 : mult));
        B.rupees += gain;
        const color = gain >= 15 ? 'red' : gain >= 8 ? 'blue' : 'green';
        setTimeout(() => { FX.flyTo(foeEl, '#b-rupees', IC.rupee(color)); updateTop(); }, 300);
        const xp = Math.round((10 + Math.min(B.streak, 5) * 2) * State.xpBonus()); B.xp += xp; setTimeout(() => gainXp(xp, $('#hero')), 450);
        msg = isBoss ? `<b>${U.pick(STORY.praise)}</b> You hit for <b>${dmg}</b> damage!` : `<b>${U.pick(STORY.praise)}</b> +${gain} rupees${mult > 1 ? ' (power bonus!)' : ''}`;
        if (B.streak === 3) setTimeout(() => { FX.banner('Flurry Rush!', 'flurry'); FX.flash('#3fe0ff', 0.25); }, 250);
        else if (B.streak === 5 || (B.streak > 5 && B.streak % 5 === 0)) setTimeout(() => { FX.banner(`${B.streak} Combo! Unstoppable!`, 'flurry hot'); FX.flash('#ffd23d', 0.3); }, 250);
        if (!sword && Math.random() < State.korokChance()) { B.seeds++; setTimeout(korok, 900); }
      } else {
        U.sfx.wrong(); qcard.classList.add('flash-no'); if (!exam) FX.Music.intensity(0);
        let dmg = cfg.wrongDamage ? cfg.wrongDamage(B) : 1;
        let blockedBy = '';
        if (B.champ.daruk === true) { B.champ.daruk = 'used'; dmg = 0; blockedBy = '🛡️ Daruk\'s Protection blocked the hit!'; }
        else if (isBoss && B.blocks > 0) {
          B.blocks--; dmg = 0; const sh = State.shield(); blockedBy = `${sh.emoji} Perfect Guard! Your shield blocked the hit!`;
          if (sh.bonus) { B.rupees += sh.bonus; blockedBy += ` +${sh.bonus} rupees!`; }
          if (sh.reflect && B.hp > sh.reflect) { B.hp -= sh.reflect; blockedBy += ` 🪞 The light reflects for ${sh.reflect} damage!`; setTimeout(() => { const f = $('#foe'); if (f) { FX.floatText(f, `-${sh.reflect}`, 'dmg'); FX.flash('#fff6c8', 0.4); } updateTop(); }, 500); }
        }
        B.hearts = Math.max(0, B.hearts - dmg);
        foeAttack(dmg, blockedBy);
        msg = `<b>${i < 0 ? '⏱ Out of stamina!' : U.pick(STORY.encourage)}</b>${blockedBy ? `<br>${blockedBy}` : ''}`;
        if (B.hearts <= 0) {
          if (B.champ.mipha === true) { B.champ.mipha = 'used'; B.hearts = B.maxHearts; msg += '<br>💧 <b>Mipha\'s Grace</b> heals you completely!'; setTimeout(() => { FX.banner('Mipha\'s Grace!', 'grace'); FX.flash('#5cc8ff', 0.5); U.sfx.orb(); updateTop(); }, 700); }
          else if (B.fairy) { B.fairy = false; s.items.fairy--; B.hearts = 3; msg += '<br>🧚 A <b>fairy</b> appears and revives you!'; setTimeout(() => { FX.banner('A fairy saves you!', 'grace'); FX.flash('#ffc0f0', 0.5); U.sfx.orb(); updateTop(); }, 700); }
        }
        setTimeout(updateTop, 520);
      }
      State.save(); runeBar();
      const fb = $('#fb'); fb.hidden = false; fb.className = 'feedback ' + (ok ? 'good' : 'bad');
      fb.innerHTML = `<div class="fb-msg">${msg}</div>${!ok || q.explain ? `<div class="explain">${ok ? '✔ ' : `The answer is <b>${'ABCDE'[q.answer]}</b>. `}${q.explain}</div>` : ''}<button class="btn primary" id="cont">Continue ▶</button>`;
      on('#cont', advance, fb); $('#cont').focus({ preventScroll: true });
      setTimeout(() => fb.scrollIntoView({ behavior: FX.reduce ? 'auto' : 'smooth', block: 'nearest' }), 200);
    }

    function advance() {
      if (B.done || !B.answered) return;
      B.answered = false;
      B.idx++;
      if (!exam && B.hearts <= 0) return end(false);
      if (!exam && B.hp <= 0) {
        if (isBoss && cfg.boss.onPhase && cfg.boss.onPhase(B)) return; // phase change handles continuation
        if (sword) { B.kills++; nextSwordFoe(); return ask(); }
        return end(true);
      }
      if (isBoss && cfg.boss.enrage && !B.enraged && B.hp <= B.maxHp / 2) { B.enraged = true; $('#foe').classList.add('enraged'); FX.banner(`${foe.name} is enraged!`, 'danger'); FX.shake(1.5); U.sfx.boss(); }
      if (exam && B.idx >= cfg.total) return end(true, true);
      ask();
    }
    B.resume = () => { ask(); };
    B.setFoe = (name, art, hp) => {
      B.hp = B.maxHp = hp; $('#fname').textContent = name; const f = $('#foe'); f.innerHTML = art; f.classList.remove('dying', 'enraged'); f.classList.add('appear'); updateTop();
    };
    function nextSwordFoe() {
      const pool = [['Chuchu', () => ART.chuchu(U.pick(['fire', 'water', 'thunder', 'plain'])), 'water'], ['Keese', () => ART.keese(), 'malice'], ['Bokoblin', () => ART.bokoblin(U.pick(['red', 'blue', 'black'])), 'melee'], ['Lizalfos', () => ART.lizalfos(), 'water'], ['Moblin', () => ART.moblin(), 'melee'], ['Guardian Scout', () => ART.guardianScout(), 'laser'], ['Lynel', () => ART.lynel(), 'fire']];
      const p = pool[Math.min(pool.length - 1, Math.floor(B.kills / 3) + Math.floor(Math.random() * 2))];
      foe.attack = p[2]; B.setFoe(`${p[0]} · Floor ${B.kills + 1}`, p[1](), 1);
    }

    function end(won, examDone) {
      if (B.done) return; B.done = true; intervals.forEach(clearInterval); intervals = [];
      if (examDone) { while (B.log.length < cfg.total) { B.log.push({ ok: false, q: null, picked: -1 }); } }
      s.rupees += B.rupees; s.seeds += B.seeds; s.seedsTotal += B.seeds;
      if (won && !exam && B.wrong === 0 && !sword) { s.stats.perfect++; const bonus = 25; s.rupees += bonus; B.perfectBonus = bonus; }
      State.save();
      const finish = () => cfg.onEnd({ won, B });
      if (exam || FX.reduce) return finish();
      if (won) { FX.banner(isBoss ? `${foe.name} defeated!` : 'Victory!', 'victory'); setTimeout(finish, 1400); }
      else { const h = $('#hero'); if (h) h.classList.add('fallen'); FX.banner('You fell…', 'danger'); setTimeout(finish, 1400); }
    }

    // ---- combat animation ----
    function strike(dmg, big, kill) {
      const h = $('#hero'), f = $('#foe'); if (!h || !f) return;
      h.classList.remove('attack'); void h.offsetWidth; h.classList.add('attack');
      setTimeout(() => {
        FX.slash(f); U.sfx.hit(); FX.shake(big ? 1.4 : 0.6);
        f.classList.remove('hit'); void f.offsetWidth; f.classList.add('hit');
        FX.floatText(f, isBoss ? `-${dmg}` : big ? 'CRITICAL!' : 'HIT!', big ? 'dmg big' : 'dmg');
        if (big) FX.flash('#fff', 0.35);
        updateTop();
        if (kill) setTimeout(() => {
          f.classList.add('dying'); const [x, y] = FX.center(f); FX.smoke(x, y, isBoss ? '#5a1438' : '#2a1030');
          FX.burst(x, y, { n: 40, colors: ['#ff2d6f', '#3a0a22', '#fff'], speed: 300, size: 4 });
          if (isBoss) { FX.flash('#fff', 0.9); FX.shake(2.5); U.sfx.boss(); }
          setTimeout(() => FX.flyTo(f, '#b-rupees', IC.rupee(isBoss ? 'gold' : 'purple')), 300);
        }, 350);
      }, 180);
    }
    function foeAttack(dmg, blocked) {
      const h = $('#hero'), f = $('#foe'); if (!h || !f) return;
      f.classList.remove('lunge', 'cast'); void f.offsetWidth;
      const kind = foe.attack || 'melee';
      const land = () => {
        if (blocked) { h.classList.remove('guard'); void h.offsetWidth; h.classList.add('guard'); FX.banner(blocked.includes('Daruk') ? 'Daruk\'s Protection!' : 'Perfect Guard!', 'guard'); U.sfx.coin(); return; }
        if (!dmg) return;
        U.sfx.hurt(); FX.shake(1.2); FX.flash('#ff2244', 0.25);
        h.classList.remove('hurt'); void h.offsetWidth; h.classList.add('hurt');
      };
      if (kind === 'melee') { f.classList.add('lunge'); setTimeout(land, 280); }
      else { f.classList.add('cast'); setTimeout(() => FX.projectile(f, h, kind === 'laser' ? 'laser' : kind, land), 200); }
    }
    function korok() {
      U.sfx.korok(); const k = document.createElement('div'); k.className = 'korok-pop'; k.innerHTML = `${ART.korok()}<div class="kp-say"><b>${U.pick(STORY.korokLines)}</b><small>+1 Korok Seed</small></div>`;
      document.body.appendChild(k); setTimeout(() => k.classList.add('show'), 10);
      setTimeout(() => { const [x, y] = FX.center(k); FX.burst(x, y - 30, { n: 20, colors: ['#ffe066', '#7ed957'], kind: 'star', speed: 200 }); }, 300);
      setTimeout(() => { k.classList.remove('show'); setTimeout(() => k.remove(), 500); }, 2400);
    }

    onKey(e => {
      if ($('#overlay').innerHTML || $('.itemget, .chest-ov')) return;
      const k = e.key.toUpperCase();
      if (!B.answered && 'ABCDE12345'.includes(k) && k.length === 1) { const i = 'ABCDE'.includes(k) ? 'ABCDE'.indexOf(k) : +k - 1; const b = $$('.opt', qcard)[i]; if (b && !b.disabled) answer(i); }
      else if (B.answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(); }
    });

    const start = () => {
      if (isBoss) { U.sfx.boss(); FX.shake(1.5); FX.banner(foe.name, 'boss-name'); }
      else if (!exam) FX.banner(sword ? 'Trial of the Sword' : `${foe.name} appears!`, 'appear');
      ask();
    };
    if (cfg.intro) dialogue(cfg.intro, start); else start();
    return B;
  }

  /* =========================================================== RESULTS */
  function results(r, opt = {}) {
    const B = r.B;
    if (r.quit) return opt.next ? opt.next() : map();
    const won = r.won; const pct = B.log.length ? Math.round((B.correct / B.log.length) * 100) : 0;
    const wrong = B.log.filter(l => !l.ok && l.q);
    const stars = won ? (B.wrong === 0 ? 3 : B.wrong === 1 ? 2 : 1) : 0;
    screen(`${hud()}<div class="page results ${won ? 'win' : 'lose'}">
      <div class="res-head">${won
        ? `<div class="res-hero win">${heroArt()}</div><h2 class="shine">${opt.heading || 'Trial Complete!'}</h2><div class="perf-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}" style="--d:${0.3 + i * 0.25}s">★</span>`).join('')}</div>`
        : `<div class="res-hero lose">${heroArt()}</div><h2>You ran out of hearts…</h2><p class="muted">Every hero falls sometimes. Read the explanations below, then try again — you'll be stronger!</p>`}</div>
      <div class="res-stats">
        <div><b>${B.correct}/${B.log.length}</b><span>correct</span></div>
        <div><b>${pct}%</b><span>accuracy</span></div>
        <div><b>${B.best}</b><span>best combo</span></div>
        <div><b>${IC.rupee('green')} ${B.rupees + (B.perfectBonus || 0)}</b><span>rupees</span></div>
        <div><b>+${B.xp}</b><span>XP</span></div>
        ${B.seeds ? `<div><b>${IC.seed()} ${B.seeds}</b><span>Korok seeds</span></div>` : ''}
      </div>
      ${B.perfectBonus ? `<div class="reward">🌟 PERFECT! No mistakes: +${B.perfectBonus} bonus rupees</div>` : ''}
      ${opt.extra || ''}
      ${wrong.length ? `<details class="review" ${won ? '' : 'open'}><summary>📖 Review your mistakes (${wrong.length})</summary>${wrong.map(reviewItem).join('')}</details>` : ''}
      <div class="row center">${opt.retry ? `<button class="btn ${won ? '' : 'primary'}" id="retry">↻ Try again</button>` : ''}<button class="btn ${won ? 'primary' : ''}" id="next">${opt.nextLabel || 'Continue ▶'}</button></div>
    </div>`, won ? 'win' : 'shrine', won ? 'field' : 'shrine');
    if (won) { U.sfx.solved(); setTimeout(() => confetti(80), 200); }
    on('#retry', () => opt.retry()); on('#next', () => (opt.next ? opt.next() : map()));
    if (opt.rewards && opt.rewards.length) setTimeout(() => sequence(opt.rewards.slice(), () => { const h = $('.hud'); if (h) h.outerHTML = hud(); }), 900);
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
  function itemPrep(title, desc, go, art) {
    const s = S(); const avail = ['hearty', 'hasty', 'mighty'].filter(k => s.items[k] > 0);
    const meals = Object.keys(s.meals).filter(k => s.meals[k] > 0 && CATALOG.EFFECTS[k.split('|')[1]] && CATALOG.EFFECTS[k.split('|')[1]].boss);
    const chosen = {};
    const html = `${art ? `<div class="prep-art">${art}</div>` : ''}<h3>${title}</h3><p>${desc}</p>
      <div class="prep">
        <div class="prep-gear">${heartsHtml(s.hearts, s.hearts)}<span>${State.weapon().emoji} ${State.weapon().name} (${State.weapon().dmg} dmg)</span><span>${State.shield().emoji} ${State.shield().name}</span></div>
        ${avail.length ? `<p><b>Drink an elixir?</b></p>${avail.map(k => { const it = State.ITEMS.find(i => i.id === k); return `<label class="chk"><input type="checkbox" data-item="${k}"> ${it.emoji} ${it.name} (×${s.items[k]}): ${it.desc}</label>`; }).join('')}` : '<p class="muted">Tip: Beedle sells elixirs that help in boss battles.</p>'}
        ${meals.length ? `<p><b>Eat a meal?</b> (one only. A Mighty meal and a Mighty Elixir don't add together.)</p>${meals.map(k => { const m = World.mealInfo(k); const E = CATALOG.EFFECTS[m.effect]; return `<label class="chk"><input type="radio" name="meal" data-meal="${k}"> ${m.emoji} ${m.name} (×${s.meals[k]}): ${E.desc}</label>`; }).join('')}` : ''}
        ${s.items.fairy ? `<p>🧚 Your fairy (×${s.items.fairy}) will revive you if you fall.</p>` : ''}
        ${s.items.bombarrow ? `<p>🏹 Bomb Arrows ready: ${s.items.bombarrow}</p>` : ''}
      </div>`;
    modal(html, [{ label: 'Not yet' }, { label: 'Fight! ⚔', cls: 'danger', fn: () => go(chosen) }]);
    $$('[data-item]', $('#overlay')).forEach(c => c.addEventListener('change', () => (chosen[c.dataset.item] = c.checked)));
    $$('[data-meal]', $('#overlay')).forEach(c => c.addEventListener('change', () => (chosen.meal = c.dataset.meal)));
  }
  function bossPrep(r) { itemPrep(`${r.beast}`, `${r.bossIntro}`, items => bossFight(r, items), ART.blight(r.element)); }
  function bossFight(r, items) {
    const s = S(); const ts = topicsOf(r.subject);
    battle({
      kind: 'boss', title: r.beast, subtitle: State.SUBJECT_NAMES[r.subject], total: null, hearts: s.hearts, timer: 60, items,
      boss: { name: r.boss, art: ART.blight(r.element), hp: 150, element: r.element, enrage: true, theme: r.id },
      next: B => ({ topic: weakWeighted(ts), lv: B.enraged ? (Math.random() < 0.35 ? 3 : 2) : (Math.random() < 0.3 ? 1 : 2) }),
      intro: [[r.boss, '…'], ['Zelda', `${S().hero}, be careful! ${r.boss} attacks every time you answer wrongly. Each correct answer strikes back. Build a combo for extra damage!`]],
      onEnd: res => {
        if (res.won) {
          const first = !s.bosses[r.id];
          s.bosses[r.id] = true; s.rupees += 300;
          const drops = World.trialDrops(r.subject, '', 3, true);
          const rewards = [n => FX.chest([{ icon: IC.rupee('gold'), label: '300 rupees' }, ...drops], n, 'Divine Beast treasure!')];
          if (first) {
            s.champions[r.ability] = true; s.hearts++; State.addMemory('m-' + r.subject);
            rewards.unshift(n => FX.itemGet(IC.heart(true), 'Heart Container!', `You now have ${s.hearts} hearts.`, n));
            rewards.push(n => FX.itemGet(`<span class="emo big">${STORY.champions[r.ability].emoji}</span>`, STORY.champions[r.ability].name, STORY.champions[r.ability].desc, n));
          }
          State.save();
          const after = () => results(res, { heading: `${r.beast} is free!`, rewards, next: () => (first ? memoryScreen('m-' + r.subject, () => regionScreen(r.id)) : regionScreen(r.id)) });
          if (first) { screen(`<div class="cutscene"><div class="spirit-champ">${ART.beast(r.subject, true)}</div></div>`, 'win', 'field'); FX.flash('#3fe0ff', 0.8); dialogue(r.victory, after); } else after();
        } else results(res, { retry: () => bossPrep(r), next: () => regionScreen(r.id), nextLabel: 'Retreat' });
      },
    });
  }

  function calamityIntro() {
    const s = S();
    if (!s.flags.calamityIntro) {
      s.flags.calamityIntro = true; State.save();
      screen(`<div class="cutscene"><div class="npc-stand big">${ART.zelda()}</div></div>`, 'castle', 'castle');
      return dialogue(STORY.calamity.intro, calamityIntro);
    }
    itemPrep('Hyrule Castle: Calamity Ganon', 'The final battle. Questions from every subject. Three phases. Take a deep breath.', calamityFight, ART.calamity());
  }
  function calamityFight(items) {
    const s = S(); const C = STORY.calamity;
    const all = State.SUBJECTS.flatMap(x => topicsOf(x));
    battle({
      kind: 'calamity', title: 'Hyrule Castle', subtitle: 'The final battle', total: null, hearts: s.hearts, timer: 70, items,
      boss: {
        name: C.name, art: ART.calamity(), hp: 160, element: 'malice', theme: 'castle',
        dmg: B => (B.phase === 2 ? 40 : State.weapon().dmg),
        onPhase: B => {
          if (B.phase === 0) {
            B.phase = 1; U.sfx.boss(); FX.shake(2); FX.flash('#ff2d6f', 0.6); FX.banner(C.phase2, 'danger');
            setTimeout(() => { B.setFoe(C.name + ' (enraged)', ART.calamity(), 180); $('#foe').classList.add('enraged'); B.resume(); }, 900); return true;
          }
          if (B.phase === 1) {
            B.phase = 2; B.hearts = B.maxHearts;
            dialogue(C.phase3, () => { FX.flash('#fff6c8', 1); B.setFoe(C.beastName, ART.darkBeast(), 160); FX.theme('win'); $('#arena').classList.add('light'); B.resume(); });
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
          FX.flash('#fff', 1); confetti(200);
          screen(`<div class="cutscene"><div class="duo"><span>${heroArt()}</span><span>${ART.zelda()}</span></div></div>`, 'win', 'field');
          dialogue(C.ending, () => ending(res, first));
        } else results(res, { retry: calamityIntro, next: map, nextLabel: 'Retreat' });
      },
    });
  }
  function ending(res, first) {
    const s = S(); const st = s.stats;
    screen(`<div class="page ending">
      <div class="duo"><span>${heroArt()}</span><span>${ART.zelda()}</span></div>
      <h1 class="shine">The End</h1><h2>…and the beginning of ${U.esc(s.hero)}'s legend.</h2>
      <div class="res-stats">
        <div><b>${st.answered}</b><span>questions answered</span></div>
        <div><b>${st.answered ? Math.round((st.correct / st.answered) * 100) : 0}%</b><span>accuracy</span></div>
        <div><b>${st.bestStreak}</b><span>best combo</span></div>
        <div><b>${State.rank().level}</b><span>hero rank</span></div>
        <div><b>${s.seedsTotal}</b><span>Korok seeds</span></div>
        <div><b>${Math.round(st.playSeconds / 60)}</b><span>minutes played</span></div>
      </div>
      <p>Hyrule is safe, but a true hero keeps training. Aim for ★★★ in every shrine, beat your Trial of the Sword record and take the Hateno practice papers to get 11+ ready!</p>
      ${first ? `<div class="reward big">${IC.rupee('gold')} +1000 rupees · Memory unlocked: Zelda's Promise</div>` : ''}
      <button class="btn big primary glow" id="next">Return to Hyrule ▶</button></div>`, 'win', 'field');
    on('#next', map);
  }

  /* =========================================================== MASTER SWORD & TRIAL OF THE SWORD */
  function masterSword() {
    const s = S();
    const scene = (inner) => { screen(`${hud()}<div class="page center woods"><div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>The Lost Woods</h2></div>${inner}<div class="woods-side slate"><span class="emo">🍃</span><div><b>Yahaha! A Korok wants to play hide-and-seek.</b><small>Costs 🎫 1 ticket · win Korok seeds</small></div><button class="btn small primary" id="leaf">Play</button></div></div>`, 'plateau', 'shrine'); on('#leaf', World.leafIntro); };
    if (s.ownedWeapons.includes('master')) {
      scene(`<div class="pedestal">${ART.korok()}</div><p class="intro slate">The Great Deku Tree rumbles: "The <b>Trial of the Sword</b> awaits. How many floors can you climb with only three hearts and no runes?"</p><p>Your record: <b>Floor ${s.swordBest}</b></p><button class="btn big primary glow" id="go">Begin the Trial ⚔</button>`);
      on('#back', map); on('#go', swordTrial); return;
    }
    if (State.masterSwordReady()) {
      scene(`<div class="pedestal sword-in">${IC.sword()}</div><p class="intro slate">The legendary sword rests in its pedestal. With ${s.hearts} hearts, you are strong enough to draw it.</p><button class="btn big primary glow" id="draw">Draw the sword! ✨</button>`);
      on('#back', map);
      on('#draw', () => {
        s.ownedWeapons.push('master'); s.weapon = 'master'; State.addMemory('m-sword'); State.save();
        FX.flash('#fff', 1); FX.shake(2);
        FX.itemGet(`<div class="sword-get">${IC.sword()}</div>`, 'You got the Master Sword!', `The sword that seals the darkness. Boss damage: ${State.weapon().dmg}.`, () =>
          dialogue([['Great Deku Tree', `${s.hero}… the sword has chosen you.`], ['Great Deku Tree', 'The Trial of the Sword is now open to you here in the Lost Woods.']], () => memoryScreen('m-sword', map)));
      });
      return;
    }
    scene(`<div class="pedestal sword-in locked">${IC.sword()}</div><p class="intro slate">Deep in the misty woods rests the <b>Master Sword</b>. Only a hero with at least <b>${State.MASTER_SWORD_HEARTS} hearts</b> who has freed a Champion can draw it.</p><p>You have ${heartsHtml(s.hearts, s.hearts)} and have freed ${State.bossesBeaten()} Champion${State.bossesBeaten() === 1 ? '' : 's'}.</p>`);
    on('#back', map);
  }
  function swordTrial() {
    const s = S(); const all = State.SUBJECTS.flatMap(x => topicsOf(x));
    battle({
      kind: 'sword', title: 'Trial of the Sword', subtitle: 'How far can you go?', total: null, hearts: 3, timer: 45, theme: 'shrine',
      foe: { name: 'Chuchu · Floor 1', art: ART.chuchu('plain'), attack: 'water' },
      next: B => ({ topic: U.pick(all), lv: Math.min(3, 1 + Math.floor(B.kills / 8)) }),
      onEnd: res => {
        const floor = res.B.kills; const rec = floor > s.swordBest; if (rec) s.swordBest = floor; s.rupees += floor * 5; State.save();
        results(res, { heading: 'The trial ends', extra: `<div class="reward big">🗡️ You cleared <b>${floor}</b> floor${floor === 1 ? '' : 's'}${rec ? ': a NEW RECORD!' : ` (record: ${s.swordBest})`}<br><small>+${floor * 5} rupees</small></div>`, retry: swordTrial, next: map });
      },
    });
  }

  /* =========================================================== BLOOD MOON (spaced review of mistakes) */
  function bloodMoonIntro() {
    screen(`<div class="cutscene"><div class="npc-stand big">${ART.zelda()}</div></div>`, 'bloodmoon', 'castle');
    FX.flash('#ff0000', 0.5);
    dialogue([['Zelda', `${S().hero}, beware! The Blood Moon rises… questions you got wrong before have come back to life!`], ['Zelda', 'Defeat them now and they\'ll be gone for good. Remember what the explanations taught you!']], bloodMoon);
  }
  function bloodMoon() {
    const s = S();
    const pool = U.shuffle(s.mistakes.slice()).slice(0, 8);
    battle({
      kind: 'bloodmoon', title: 'Blood Moon', subtitle: 'Your old mistakes return!', total: pool.length + 2, hearts: 4, theme: 'bloodmoon',
      foe: { name: 'Revived Moblin', art: ART.moblin(), attack: 'melee' },
      next: B => {
        const m = pool[B.idx % pool.length]; const t = topicById(m.topicId);
        // half the time it's the exact question again; otherwise a fresh one of the same kind
        return { topic: t, lv: m.lv, q: Math.random() < 0.5 && B.idx < pool.length ? m.q : null, mistake: m };
      },
      fromMistake: (cur, ok) => { if (ok && cur.mistake) { const i = s.mistakes.indexOf(cur.mistake); if (i > -1) s.mistakes.splice(i, 1); } },
      onEnd: res => {
        const bonus = res.B.correct * 10; s.rupees += bonus; if (res.won) { State.count('bloodMoons'); s.tickets++; } State.save();
        results(res, { heading: 'The Blood Moon sets', extra: `<div class="reward">🌕 You banished ${res.B.correct} returning monster${res.B.correct === 1 ? '' : 's'}! +${bonus} rupees</div>`, next: map });
      },
    });
  }

  /* =========================================================== PRACTICE PAPERS (exam mode) */
  function mockMenu() {
    const s = S();
    const hist = s.mocks.slice(-6).reverse();
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Hateno Ancient Tech Lab</h2></div>
      <div class="lesson-wrap"><div class="monk-seat purah">👩‍🔬</div><div class="lesson scroll"><h3>Purah's Practice Papers</h3>
      <p>"Want to know how ready you are for the real 11+? Try one of my practice papers! Just like the real exam: <b>no hints, no runes, no feedback until the end</b>, and a time limit."</p>
      <p class="muted">20 questions · 15 minutes · mark your answers carefully!</p></div></div>
      <div class="cards">${State.SUBJECTS.map(x => `<button class="card slate" data-sub="${x}"><div class="card-art">${ART.beast(x, S().bosses[regionOfSubject(x).id])}</div><div><h3>${State.SUBJECT_NAMES[x]}</h3><p class="muted">Readiness: ${State.subjectMastery(x)}%</p></div><div>Start ▶</div></button>`).join('')}
      <button class="card slate" data-sub="mixed"><div class="card-art">🧭</div><div><h3>Mixed Paper</h3><p class="muted">All four subjects</p></div><div>Start ▶</div></button></div>
      <div class="row center"><label class="chk"><input type="checkbox" id="hard"> 11+ standard (Master level). Leave unticked for Adept level.</label></div>
      ${hist.length ? `<h3>Recent papers</h3><table class="hist">${hist.map(h => `<tr><td>${h.date}</td><td>${h.subject}</td><td>${h.level === 3 ? 'Master' : 'Adept'}</td><td><b>${h.score}/${h.total}</b> (${Math.round((h.score / h.total) * 100)}%)</td></tr>`).join('')}</table>` : ''}
    </div>`, 'shrine', 'shrine');
    on('#back', map);
    on('[data-sub]', (e, el) => mock(el.dataset.sub, $('#hard').checked ? 3 : 2));
  }
  function mock(subject, lv) {
    const s = S();
    const ts = subject === 'mixed' ? State.SUBJECTS.flatMap(x => topicsOf(x)) : topicsOf(subject);
    const order = []; for (let i = 0; i < 20; i++) order.push(ts[i % ts.length]);
    const seq = U.shuffle(order);
    battle({
      kind: 'mock', exam: true, title: 'Practice Paper', subtitle: subject === 'mixed' ? 'Mixed' : State.SUBJECT_NAMES[subject], total: 20, hearts: 99, examTime: 15 * 60, theme: 'shrine',
      next: B => ({ topic: seq[B.idx], lv }),
      onEnd: res => {
        const B = res.B; const score = B.correct; const reward = score * 4;
        s.rupees += reward; s.mocks.push({ date: new Date().toLocaleDateString('en-GB'), subject: subject === 'mixed' ? 'Mixed' : State.SUBJECT_NAMES[subject], level: lv, score, total: 20 });
        State.addXp(score * 5); State.save();
        const pct = Math.round((score / 20) * 100);
        const verdict = pct >= 85 ? 'Outstanding: that\'s a strong 11+ score! 🏆' : pct >= 70 ? 'Great work, you\'re on track. Keep practising! ⭐' : pct >= 50 ? 'Good effort. Review the mistakes and train in the shrines. 💪' : 'This is tough material. The shrines will help you build up to it. 🌱';
        screen(`<div class="page results">
          <div class="res-head"><div class="big-ico">📜</div><h2>Paper complete</h2><p>${verdict}</p></div>
          <div class="res-stats"><div><b>${score}/20</b><span>score</span></div><div><b>${pct}%</b><span>percentage</span></div><div><b>${IC.rupee('blue')} ${reward}</b><span>rupees</span></div><div><b>+${score * 5}</b><span>XP</span></div></div>
          <details class="review" open><summary>📖 Go through the paper</summary>${B.log.map((l, i) => l.q ? `<div class="rv-n ${l.ok ? 'ok' : 'no'}">Q${i + 1} ${l.ok ? '✔' : '✘'}</div>${l.ok ? '' : reviewItem(l)}` : `<div class="rv-n no">Q${i + 1}: not answered</div>`).join('')}</details>
          <div class="row center"><button class="btn primary" id="next">Back to the Lab ▶</button></div></div>`, 'shrine', 'shrine');
        on('#next', mockMenu);
      },
    });
  }

  /* =========================================================== GODDESS STATUE, HESTU, SHOP */
  function statue() {
    const s = S();
    screen(`${hud()}<div class="page center">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Goddess Statue</h2></div>
      <div class="npc-stand big">${ART.goddess()}</div>
      <p class="intro slate">"Hero… offer me <b>four Spirit Orbs</b> and I shall grant you strength."</p>
      <div class="orbs">${Array.from({ length: Math.min(s.orbs, 12) }, (_, i) => `<span style="--d:${i * 0.08}s">${IC.orb()}</span>`).join('')}${s.orbs > 12 ? ` +${s.orbs - 12}` : ''}${s.orbs ? '' : '<span class="muted">No orbs yet. Clear shrine trials to earn them.</span>'}</div>
      <div class="row center">
        <button class="btn big ${s.orbs >= 4 ? 'primary glow' : ''}" id="heart" ${s.orbs >= 4 ? '' : 'disabled'}>${IC.heart(true)} Heart Container<br><small>+1 heart in every boss battle</small></button>
        <button class="btn big ${s.orbs >= 4 ? 'primary' : ''}" id="stam" ${s.orbs >= 4 && s.stamina < 10 ? '' : 'disabled'}>🟢 Stamina Vessel<br><small>+6 seconds on every timer</small></button>
      </div>
      <p class="muted">You have ${s.hearts} hearts and ${s.stamina} stamina vessels. The Master Sword needs ${State.MASTER_SWORD_HEARTS} hearts.</p>
      <button class="btn big fairy-btn" id="fairy">🧚‍♀️ Great Fairy Fountain<br><small>${s.fairy.open ? 'Upgrade your armour' : 'A sleeping fairy waits nearby…'}</small></button>
    </div>`, 'plateau', 'shrine');
    on('#back', map); on('#fairy', World.fairy);
    on('#heart', () => { s.orbs -= 4; s.hearts++; State.save(); FX.flash('#fff6c8', 0.8); FX.itemGet(IC.heart(true), 'Heart Container!', `Your life grows. You now have ${s.hearts} hearts.`, statue); });
    on('#stam', () => { s.orbs -= 4; s.stamina++; State.save(); FX.flash('#9cff9c', 0.6); FX.itemGet('<span class="emo big">🟢</span>', 'Stamina Vessel!', 'Every timer now gives you 6 more seconds.', statue); });
  }
  function hestu() {
    const s = S(); const cost = State.HESTU_COSTS[s.hestuLevel];
    screen(`${hud()}<div class="page center">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Hestu</h2></div>
      <div class="npc-stand big dance">${ART.hestu()}</div>
      <p class="intro slate">"Shake-shake! Korok seeds! Give Hestu seeds and Hestu makes your pouch BIGGER!"</p>
      <p>Each upgrade gives every rune <b>one extra use</b> per battle. Current: <b>${s.runeLevel}</b> use${s.runeLevel > 1 ? 's' : ''} each.</p>
      ${cost ? `<button class="btn big ${s.seeds >= cost ? 'primary glow' : ''}" id="up" ${s.seeds >= cost ? '' : 'disabled'}>Give ${cost} ${IC.seed()} for a bigger pouch</button><p class="muted">You have ${s.seeds} seed${s.seeds === 1 ? '' : 's'}. Find Koroks by answering correctly. They hide everywhere!</p>` : '<p class="ok-note">"Your pouch is the BIGGEST! Shake-shake!"</p>'}
    </div>`, 'plateau', 'field');
    on('#back', map);
    on('#up', () => { s.seeds -= cost; s.hestuLevel++; s.runeLevel++; State.save(); U.sfx.korok(); FX.itemGet('<span class="emo big">🎒</span>', 'Your pouch grew!', `Each rune can now be used ${s.runeLevel} times per battle.`, hestu); });
  }
  function adventureLog(tab = 'mastery') {
    const s = S(); const st = s.stats; const rk = State.rank();
    let body = '';
    if (tab === 'mastery') {
      body = State.SUBJECTS.map(x => `<div class="subj slate"><h3>${ART.beast(x, s.bosses[regionOfSubject(x).id])} ${State.SUBJECT_NAMES[x]} <span class="pill">${State.subjectMastery(x)}% ready</span></h3>
        ${topicsOf(x).map(t => { const m = State.mastery(t.id); return `<div class="mrow"><span>${t.icon} ${t.name}</span><div class="mbar big"><i style="width:${m}%" class="${m >= 75 ? 'hi' : m >= 45 ? 'mid' : 'lo'}"></i></div><span class="pct">${m}%</span><span class="stars">${'★'.repeat(s.stars[t.id] || 0)}</span></div>`; }).join('')}</div>`).join('')
        + '<p class="muted">Readiness grows as you answer questions correctly. Harder trials count for more. 75%+ means that topic is in great shape for the 11+.</p>';
    }
    if (tab === 'memories') body = STORY.memories.map(m => State.hasMemory(m.id) ? `<div class="memory"><h3>📷 ${m.title}</h3><p>${fillName(m.text)}</p></div>` : '<div class="memory locked"><h3>📷 ???</h3><p class="muted">A memory not yet recovered…</p></div>').join('');
    if (tab === 'stats') body = `<div class="rank-card slate">${heroArt()}<div><h3>${U.esc(s.hero)}</h3><p>Hero Rank <b>${rk.level}</b> · ${rk.title}</p><div class="bar"><i style="width:${Math.round((rk.into / rk.need) * 100)}%"></i></div><small class="muted">${rk.into}/${rk.need} XP to next rank</small></div></div>
        <div class="res-stats">
        <div><b>${st.answered}</b><span>questions</span></div><div><b>${st.answered ? Math.round((st.correct / st.answered) * 100) : 0}%</b><span>accuracy</span></div>
        <div><b>${st.bestStreak}</b><span>best combo</span></div><div><b>${st.trials}</b><span>trials cleared</span></div><div><b>${st.perfect}</b><span>perfect runs</span></div>
        <div><b>${s.streak.best}</b><span>best day streak</span></div><div><b>${s.seedsTotal}</b><span>Korok seeds found</span></div><div><b>${s.orbsTotal}</b><span>Spirit Orbs</span></div>
        <div><b>${Math.round(st.playSeconds / 60)}</b><span>minutes played</span></div><div><b>${s.swordBest}</b><span>Sword Trial record</span></div></div>
        <h3>Sheikah Runes & Champion Powers</h3>
        <div class="powers">${Object.entries(STORY.runes).map(([k, r]) => `<div class="slate ${s.runes[k] ? '' : 'locked'}">${IC.rune(k)} <b>${r.name}</b>: ${r.desc}</div>`).join('')}
        ${Object.entries(STORY.champions).map(([k, r]) => `<div class="slate ${s.champions[k] ? '' : 'locked'}">${r.emoji} <b>${r.name}</b>: ${s.champions[k] ? r.desc : '???'}</div>`).join('')}</div>`;
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Adventure Log</h2></div>
      <div class="tabs">${[['mastery', '🧠 11+ Readiness'], ['memories', '📷 Memories'], ['stats', '🏅 Hero & Stats']].map(([k, l]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
      ${body}</div>`, 'map', 'field');
    on('#back', map); on('[data-tab]', (e, el) => adventureLog(el.dataset.tab));
  }
  function memoryScreen(id, next) {
    const m = STORY.memories.find(x => x.id === id);
    screen(`<div class="page memory-screen"><div class="memory big photo-frame"><div class="duo">${heroArt()}${ART.zelda()}</div><h2>${m.title}</h2><p>${fillName(m.text)}</p></div><button class="btn big primary" id="next">Continue ▶</button></div>`, 'memory', 'field');
    U.sfx.orb(); FX.flash('#fff8e0', 0.8); on('#next', next);
  }

  /* =========================================================== SETTINGS */
  function settings() {
    const s = S(); const st = s.settings;
    screen(`${hud()}<div class="page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Map</button><h2>Settings</h2></div>
      <div class="settings slate">
        <label class="chk"><input type="checkbox" id="snd" ${st.sound ? 'checked' : ''}> 🔊 Sound effects</label>
        <label class="chk"><input type="checkbox" id="mus" ${st.music !== false ? 'checked' : ''}> 🎵 Music</label>
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
    </div>`, 'map', 'field');
    on('#back', map);
    $('#snd').addEventListener('change', e => { st.sound = U.soundOn = e.target.checked; State.save(); });
    $('#mus').addEventListener('change', e => { st.music = e.target.checked; FX.Music.unlock(); FX.Music.set(st.music); State.save(); });
    $('#tmr').addEventListener('change', e => { st.timers = e.target.checked; State.save(); });
    $('#auto').addEventListener('change', e => { st.autoRead = e.target.checked; State.save(); });
    $('#nm').addEventListener('change', e => { s.hero = e.target.value.trim() || s.hero; State.save(); });
    on('#exp', () => { const c = State.exportCode(); $('#code').value = c; $('#code').select(); const fallback = () => toast('Select the code above and copy it.'); try { navigator.clipboard.writeText(c).then(() => toast('Save code copied!'), fallback); } catch (e) { fallback(); } });
    on('#imp', () => { try { State.importCode($('#code').value); toast('Save loaded!', 'good'); map(); } catch (e) { toast('That code didn\'t work.', 'bad'); } });
    on('#wipe', () => modal('<h3>Delete this save?</h3><p>All progress will be lost forever.</p>', [{ label: 'Cancel' }, { label: 'Delete', cls: 'danger', fn: () => { State.wipe(); title(); } }]));
  }

  // play-time tracker
  setInterval(() => { if (S() && document.visibilityState === 'visible') { S().stats.playSeconds += 30; State.save(); } }, 30000);

  // free static hosts like Netlify can overlay a badge in the bottom corner
  if (/netlify\.app$|netlify\.com$/.test(location.hostname)) document.documentElement.classList.add('host-badge');
  window.Game = { title, map, statue, ui: { screen, on, onKey, hud, toast, confetti, dialogue, modal, sequence, gainXp, heartsHtml, heroArt, speak, addInterval: id => intervals.push(id) } };
  title();
})();
