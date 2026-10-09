// ENGLISH — curated banks + generators. Tier 1 ≈ Year 3/4, tier 2 ≈ Year 5, tier 3 ≈ Year 6 / 11+.
(function () {
  const { pick, shuffle, sample, chance, mc, esc } = U;
  const byLv = (arr, lv) => { const f = arr.filter(x => x[0] <= lv); const top = f.filter(x => x[0] === lv); return chance(0.65) && top.length ? top : f; };
  const topics = [];

  /* ---------------- 1. Spelling ---------------- */
  // [level, correct, [common misspellings], sentence using the word]
  const SPELL = [
    [1, 'address', ['adress', 'addres', 'adrress'], 'Write your address on the envelope.'],
    [1, 'calendar', ['calender', 'calander', 'callendar'], 'Mark the date on the calendar.'],
    [1, 'circle', ['circel', 'sircle', 'cirkle'], 'Draw a circle around the answer.'],
    [1, 'difficult', ['dificult', 'difficalt', 'diffecult'], 'The climb was difficult but fun.'],
    [1, 'enough', ['enuff', 'enogh', 'enouf'], 'We had enough food for everyone.'],
    [1, 'exercise', ['excercise', 'exersize', 'exercize'], 'Exercise keeps your body healthy.'],
    [1, 'favourite', ['favourate', 'faverite', 'favorute'], 'Apple pie is my favourite pudding.'],
    [1, 'guard', ['gaurd', 'gard', 'guarde'], 'A guard stood at the castle gate.'],
    [1, 'height', ['hight', 'heigth', 'hieght'], 'Measure the height of the tower.'],
    [1, 'minute', ['minit', 'minnute', 'minite'], 'Wait a minute while I find my boots.'],
    [1, 'often', ['offen', 'ofton', 'oftun'], 'We often go swimming on Saturdays.'],
    [1, 'probably', ['probly', 'probabley', 'probebly'], 'It will probably rain tomorrow.'],
    [1, 'remember', ['rember', 'remembor', 'rememmber'], 'Remember to bring your sword.'],
    [1, 'special', ['speshal', 'specal', 'speacial'], 'Today is a very special day.'],
    [1, 'straight', ['straigt', 'streight', 'straght'], 'Walk straight ahead to the shrine.'],
    [1, 'though', ['thogh', 'thoughe', 'thow'], 'It was cold, though the sun was shining.'],
    [2, 'accident', ['acident', 'accidant', 'axident'], 'It was an accident, so nobody was blamed.'],
    [2, 'actually', ['actualy', 'acshually', 'actully'], 'The quiet boy was actually very funny.'],
    [2, 'appear', ['apear', 'appeer', 'appere'], 'Stars appear when the sky grows dark.'],
    [2, 'awkward', ['awkard', 'akward', 'awkwerd'], 'There was an awkward silence.'],
    [2, 'bruise', ['bruse', 'brooze', 'bruize'], 'He had a bruise on his knee.'],
    [2, 'committee', ['comittee', 'commitee', 'committe'], 'The committee voted on the plan.'],
    [2, 'curiosity', ['curiousity', 'curiosaty', 'curiocity'], 'Curiosity made Link open the chest.'],
    [2, 'especially', ['especialy', 'expecially', 'espeshally'], 'I love fruit, especially mangoes.'],
    [2, 'forty', ['fourty', 'fortey', 'fourtie'], 'There were forty arrows in the quiver.'],
    [2, 'government', ['goverment', 'govenment', 'governmint'], 'The government built a new bridge.'],
    [2, 'language', ['langauge', 'languige', 'langwage'], 'The Gerudo speak their own language.'],
    [2, 'opportunity', ['oppertunity', 'opportunaty', 'oportunity'], 'This is a great opportunity to learn.'],
    [3, 'acquire', ['aquire', 'acquier', 'accquire'], 'Link hoped to acquire a new shield.'],
    [3, 'amateur', ['amature', 'amatuer', 'ammateur'], 'He was only an amateur painter.'],
    [3, 'cemetery', ['cemetary', 'cemetry', 'semetery'], 'An old cemetery lay beyond the village.'],
    [3, 'correspond', ['corespond', 'correspund', 'corrispond'], 'The two friends correspond by letter.'],
    [3, 'desperate', ['desparate', 'desprate', 'desperite'], 'The desperate travellers searched for water.'],
    [3, 'foreign', ['foriegn', 'forein', 'foreighn'], 'The merchant came from a foreign land.'],
    [3, 'lightning', ['litening', 'lightnning', 'lightneing'], 'A flash of lightning lit up the sky.'],
    [3, 'persuade', ['pursuade', 'perswade', 'persaude'], 'Try to persuade the guard to let us in.'],
    [3, 'pronunciation', ['pronounciation', 'pronunsiation', 'pronuciation'], 'Her pronunciation of the spell was perfect.'],
    [3, 'signature', ['signiture', 'signatur', 'sigature'], 'Please add your signature at the bottom.'],
    [3, 'vehicle', ['vehical', 'veicle', 'vehicel'], 'A strange vehicle rolled across the desert.'],
    [3, 'twelfth', ['twelth', 'twelvth', 'tweltfh'], 'Her birthday is on the twelfth of May.'],
    [1, 'because', ['becuase', 'becos', 'beacause'], 'Link ran home because it was raining.'],
    [1, 'friend', ['freind', 'frend', 'friennd'], 'Zelda is a loyal friend to everyone.'],
    [1, 'beautiful', ['beutiful', 'beautifull', 'beatiful'], 'The sunset over the lake was beautiful.'],
    [1, 'February', ['Febuary', 'Febrary', 'Feburary'], 'The snow fell heavily in February.'],
    [1, 'different', ['diffrent', 'differant', 'difrent'], 'Each shrine has a different puzzle.'],
    [1, 'heard', ['herd', 'heared', 'hurd'], 'We heard a strange noise in the forest.'],
    [1, 'surprise', ['suprise', 'surprize', 'serprise'], 'The Korok gave Link a surprise.'],
    [1, 'answer', ['anser', 'answear', 'awnser'], 'Write your answer on the line.'],
    [1, 'business', ['buisness', 'bisness', 'busness'], 'The shop was a busy business.'],
    [1, 'caught', ['cort', 'caugt', 'cought'], 'The fisherman caught three salmon.'],
    [1, 'library', ['libary', 'liberry', 'librery'], 'The old library was full of dusty books.'],
    [1, 'separate', ['seperate', 'seprate', 'separete'], 'Keep the red and blue gems separate.'],
    [1, 'thought', ['thougt', 'thort', 'thougth'], 'She thought hard about the riddle.'],
    [1, 'women', ['wimmen', 'womin', 'wemen'], 'Three women guarded the gate.'],
    [1, 'island', ['iland', 'ilund', 'islend'], 'A tiny island sat in the middle of the lake.'],
    [1, 'knowledge', ['knowlege', 'nowledge', 'knowlidge'], 'The sage had great knowledge of magic.'],
    [1, 'strength', ['strenth', 'strengh', 'stregnth'], 'The Goron used all his strength.'],
    [1, 'question', ['qestion', 'questoin', 'quesion'], 'The monk asked a tricky question.'],
    [2, 'necessary', ['neccessary', 'necesary', 'neccesary'], 'It is necessary to rest before a long climb.'],
    [2, 'immediately', ['immediatly', 'imediately', 'immeadiately'], 'The guards came immediately.'],
    [2, 'definitely', ['definately', 'definitly', 'defanitely'], 'We will definitely find the shrine today.'],
    [2, 'disappear', ['dissapear', 'disapear', 'dissappear'], 'The ghost seemed to disappear into the mist.'],
    [2, 'environment', ['enviroment', 'envirnment', 'enviromment'], 'The forest environment was peaceful.'],
    [2, 'familiar', ['familar', 'fammiliar', 'familliar'], 'The path looked familiar to Link.'],
    [2, 'restaurant', ['resturant', 'restaraunt', 'restarant'], 'The village restaurant served mushroom stew.'],
    [2, 'rhythm', ['rythm', 'rhythem', 'rhytm'], 'The drums kept a steady rhythm.'],
    [2, 'sincerely', ['sincerly', 'sinceerly', 'sincerley'], 'The letter ended "Yours sincerely".'],
    [2, 'temperature', ['temprature', 'tempreture', 'temperture'], 'The temperature dropped on the mountain.'],
    [2, 'vegetable', ['vegtable', 'vegatable', 'vegetible'], 'Every vegetable in the garden was ripe.'],
    [2, 'weird', ['wierd', 'weerd', 'wiered'], 'A weird glow came from the cave.'],
    [2, 'achieve', ['acheive', 'achive', 'acheeve'], 'You can achieve anything with practice.'],
    [2, 'believe', ['beleive', 'belive', 'beleeve'], 'I believe the princess is safe.'],
    [3, 'accommodation', ['accomodation', 'acommodation', 'accommadation'], 'The inn offered warm accommodation.'],
    [3, 'conscience', ['concience', 'consience', 'conscence'], 'His conscience told him to return the gem.'],
    [3, 'embarrass', ['embarass', 'embarras', 'embaress'], 'Please do not embarrass me in front of the king.'],
    [3, 'exaggerate', ['exagerate', 'exaggarate', 'exxagerate'], 'Fishermen often exaggerate the size of their catch.'],
    [3, 'harass', ['harrass', 'harras', 'herass'], 'The bokoblins continued to harass travellers.'],
    [3, 'mischievous', ['mischievious', 'mischevous', 'mischeivous'], 'The mischievous Korok hid under a rock.'],
    [3, 'occurred', ['occured', 'ocurred', 'occurrd'], 'A strange event occurred at midnight.'],
    [3, 'parliament', ['parliment', 'parlament', 'parlaiment'], 'The royal parliament met in the castle.'],
    [3, 'privilege', ['priviledge', 'privelege', 'privilige'], 'It was a privilege to meet the champions.'],
    [3, 'recommend', ['reccommend', 'recomend', 'reccomend'], 'I recommend the mountain trail.'],
    [3, 'rhyme', ['ryhme', 'rhime', 'ryme'], 'The children sang a rhyme about the hero.'],
    [3, 'sufficient', ['sufficeint', 'suficient', 'sufficiant'], 'We had sufficient food for the journey.'],
    [3, 'controversy', ['controversey', 'contraversy', 'controvercy'], 'There was some controversy over who had won.'],
    [3, 'yacht', ['yaght', 'yatch', 'yot'], 'A white yacht sailed into the harbour.'],
    [3, 'guarantee', ['garantee', 'guarentee', 'gaurantee'], 'There is no guarantee the weather will hold.'],
    [3, 'queue', ['que', 'queu', 'qeue'], 'A long queue formed outside the shop.'],
  ];
  function splitSentence(s) {
    const words = s.split(' '); const n = words.length; const cuts = [0, Math.round(n / 4), Math.round(n / 2), Math.round(3 * n / 4), n];
    const parts = []; for (let i = 0; i < 4; i++) parts.push(words.slice(cuts[i], cuts[i + 1]).join(' '));
    return parts.filter(p => p);
  }
  topics.push({
    id: 'e-spell', name: 'Spelling', shrine: 'Mozo Shenno Shrine', icon: '✍️',
    lesson: `<p>In the 11+ you'll see a sentence split into chunks and must find the chunk with a <b>spelling mistake</b> — or choose <b>"No mistake"</b>.</p>
      <p><b>Tricky rules:</b> "i before e except after c" (believe, receive) — but watch out for <i>weird</i>! Double letters often hide in words like <i>necessary</i> (1 collar, 2 sleeves: one c, two s), <i>accommodation</i> (2 c's, 2 m's) and <i>embarrass</i>.</p>
      <p><b>Tip:</b> say tricky words in a silly way to remember them: "Feb-RU-ary", "Wed-NES-day", "bus-I-ness".</p>`,
    gen(lv) {
      const it = pick(byLv(SPELL, lv));
      if (lv === 1 && chance(0.5)) {
        return mc(`Which is the <b>correct</b> spelling?`, it[1], it[2], `The correct spelling is <b>${it[1]}</b>. Example: "${it[3]}"`);
      }
      const noMistake = chance(0.2);
      const re = new RegExp('\\b' + it[1] + '\\b', 'i');
      let wrongWord = pick(it[2]);
      // keep a capital letter if the word starts the sentence
      const hit = it[3].match(re); if (hit && /^[A-Z]/.test(hit[0])) wrongWord = U.cap(wrongWord);
      const sentence = noMistake ? it[3] : it[3].replace(re, wrongWord);
      const parts = splitSentence(sentence);
      const labels = parts.map((p, i) => `${'ABCD'[i]}: ${p}`);
      labels.push('N: No mistake');
      const correctIdx = noMistake ? labels.length - 1 : parts.findIndex(p => p.split(' ').some(w => w.replace(/[^A-Za-z]/g, '') === wrongWord.replace(/[^A-Za-z]/g, '')));
      return {
        prompt: `Find the group of words with a <b>spelling mistake</b>. If there isn't one, choose N.`,
        options: labels, answer: correctIdx,
        explain: noMistake ? `Every word is spelt correctly here — including "${it[1]}".` : `"${wrongWord}" should be spelt <b>${it[1]}</b>.`,
        visual: `<div class="chunks">${parts.map((p, i) => `<span><i>${'ABCD'[i]}</i>${esc(p)}</span>`).join('')}</div>`, html: true,
      };
    },
  });

  /* ---------------- 2. Punctuation ---------------- */
  const PUNCT = [
    [2, "“Where is my bow?” asked Revali."],
    [2, "Daruk's boulder rolled down the mountain."],
    [2, "When the bell rang, the children ran outside."],
    [3, "“Listen carefully,” said Impa, “and you will learn.”"],
    [3, "The Rito, who live high in the mountains, are skilled archers."],
    [3, "Zelda's research notes were found in the library."],
    [1, "My sister's bike is red."],
    [1, "Can you help me carry the shield?"],
    [1, "On Saturday, Link went fishing with Sidon."],
    [1, "We bought eggs, milk, bread and cheese."],
    [1, "I'm going to Hateno Village tomorrow."],
    [1, "Link packed his sword, shield, bow and arrows."],
    [1, "Where did Zelda hide the map?"],
    [1, "On Monday, we visited Kakariko Village."],
    [1, "The dog's bone was buried under the tree."],
    [1, "I can't find my boots anywhere!"],
    [1, "Impa and Paya live in a big house."],
    [2, "“Run to the tower!” shouted Link."],
    [2, "The children's toys were scattered across the floor."],
    [2, "Although it was late, the market was still busy."],
    [2, "Have you ever seen a Lynel up close?"],
    [2, "We'll need apples, mushrooms, fish and salt for the stew."],
    [2, "Beedle, the travelling merchant, sells arrows."],
    [3, "“What a beautiful view,” whispered Zelda, “but where is the castle?”"],
    [3, "The knights' horses were waiting outside the gates of Hyrule Castle."],
    [3, "Link needed three things: a map, a torch and courage."],
    [3, "Mipha, who was a gifted healer, lived in Zora's Domain."],
    [3, "It's important that the guardian doesn't see us."],
    [3, "After the storm had passed, Revali flew over Rito Village."],
  ];
  function punctErrors(s) {
    const errs = [];
    // lowercase start
    const firstAlpha = s.search(/[A-Za-z]/);
    errs.push([s.slice(0, firstAlpha) + s[firstAlpha].toLowerCase() + s.slice(firstAlpha + 1), 'Every sentence must start with a capital letter.']);
    // ending punctuation swap
    if (/\?[”]?$/.test(s)) errs.push([s.replace(/\?([”]?)$/, '.$1'), 'This is a question, so it needs a question mark.']);
    else if (/[.!][”]?$/.test(s)) errs.push([s.replace(/[.!]([”]?)$/, '?$1'), 'This is not a question, so it should not end with a question mark.']);
    // proper noun lowercased
    const words = s.split(' ');
    words.forEach((w, i) => {
      if (i > 0 && /^[“]?[A-Z][a-z]/.test(w) && w !== 'I' && !/[.!?][”]?$/.test(words[i - 1])) {
        const c = words.slice(); c[i] = w.replace(/[A-Z]/, m => m.toLowerCase());
        errs.push([c.join(' '), `"${w.replace(/[^A-Za-z']/g, '')}" is a name (proper noun), so it needs a capital letter.`]);
      }
    });
    // apostrophe removed
    words.forEach((w, i) => {
      if (/[a-z]'[a-z]/i.test(w)) { const c = words.slice(); c[i] = w.replace("'", ''); errs.push([c.join(' '), `"${w.replace(/[^A-Za-z']/g, '')}" needs an apostrophe.`]); }
      if (/s'$|s',?$/.test(w)) { const c = words.slice(); c[i] = w.replace("s'", "'s"); errs.push([c.join(' '), `The apostrophe is in the wrong place: "${w.replace(/[^A-Za-z']/g, '')}" is plural, so the apostrophe goes after the s.`]); }
    });
    // plural given wrong apostrophe
    const plural = words.findIndex((w, i) => i > 1 && /^[a-z]{3,}s[.,]?$/.test(w) && !/ss[.,]?$/.test(w) && !/(was|has|is|this|us|his|its|across|always|perhaps)[.,]?$/.test(w));
    if (plural > -1) { const c = words.slice(); c[plural] = words[plural].replace(/s([.,]?)$/, "'s$1"); errs.push([c.join(' '), `"${words[plural].replace(/[.,]/, '')}" is just a plural — plurals don't need an apostrophe.`]); }
    // comma removed
    const ci = words.findIndex(w => /,$/.test(w));
    if (ci > -1) { const c = words.slice(); c[ci] = words[ci].replace(/,$/, ''); errs.push([c.join(' '), 'A comma is missing.']); }
    // speech mark removed
    if (s.includes('”')) errs.push([s.replace('”', ''), 'The closing speech marks are missing.']);
    return errs;
  }
  // Grammar-punctuation pairs: its/it's, there/their are covered in Words; here we also ask "which mark is missing?"
  topics.push({
    id: 'e-punct', name: 'Punctuation', shrine: 'Bosh Kala Shrine', icon: '❗',
    lesson: `<p><b>Capital letters</b> start sentences and names (Link, Hyrule, Monday).</p>
      <p><b>Apostrophes</b> show something belongs (the dog's bone) or letters are missing (can't = cannot). If the owner is a plural ending in s, the apostrophe goes after the s: the knights' horses. <b>Never</b> use an apostrophe just to make a plural!</p>
      <p><b>Commas</b> separate items in a list, and follow an opening phrase ("On Monday, …"). <b>Speech marks</b> go around the exact words spoken, including their punctuation: “Run!” shouted Link.</p>`,
    gen(lv) {
      const s = pick(byLv(PUNCT, lv))[1];
      const errs = shuffle(punctErrors(s));
      const uniq = []; const seen = new Set([s]);
      for (const e of errs) if (!seen.has(e[0])) { seen.add(e[0]); uniq.push(e); }
      const chosen = uniq.slice(0, 3);
      const q = mc(`Which sentence is punctuated <b>correctly</b>?`, s, chosen.map(e => e[0]), `The correct one is: ${s}<br>${chosen.map(e => '• ' + e[1]).join('<br>')}`);
      q.long = true;
      return q;
    },
  });

  /* ---------------- 3. Grammar ---------------- */
  // Tagged sentences for word classes
  const TAGGED = [
    'The {curious|adjective} fox {sniffed|verb} the {air|noun} {nervously|adverb}.',
    '{He|pronoun} {jumped|verb} {over|preposition} the {muddy|adjective} puddle.',
    'Mipha {sang|verb} {beautifully|adverb} {beside|preposition} the {lake|noun}.',
    'The {tired|adjective} {traveller|noun} {yawned|verb} {and|conjunction} slept.',
    '{They|pronoun} {cheered|verb} {loudly|adverb} {for|preposition} the {winner|noun}.',
    'Sidon {swam|verb} {gracefully|adverb} {through|preposition} the {waves|noun}.',
    'The {wise|adjective} owl {hooted|verb} {but|conjunction} {nobody|pronoun} listened.',
    '{We|pronoun} {carefully|adverb} {crossed|verb} the {narrow|adjective} {bridge|noun}.',
    'Riju {raised|verb} her {shining|adjective} {shield|noun} {proudly|adverb}.',
    'The {dragon|noun} {flew|verb} {silently|adverb} {across|preposition} the {starry|adjective} sky.',
    'The {brave|adjective} knight {galloped|verb} {swiftly|adverb} across the {meadow|noun}.',
    'Zelda {quietly|adverb} {opened|verb} the {ancient|adjective} {book|noun}.',
    'A {tiny|adjective} Korok {giggled|verb} {behind|preposition} the {tree|noun}.',
    'The {hungry|adjective} {Goron|noun} {ate|verb} the rocks {greedily|adverb}.',
    'Link {climbed|verb} the {steep|adjective} cliff {carefully|adverb} {but|conjunction} slipped.',
    '{She|pronoun} {carried|verb} the {glowing|adjective} orb {to|preposition} the {shrine|noun}.',
    'The {old|adjective} {monk|noun} spoke {softly|adverb} {and|conjunction} {smiled|verb}.',
    'Rain {fell|verb} {heavily|adverb} {on|preposition} the {silent|adjective} village.',
    '{They|pronoun} {waited|verb} {patiently|adverb} {under|preposition} the {wooden|adjective} bridge.',
    'The {fierce|adjective} {dragon|noun} {soared|verb} {above|preposition} the clouds.',
    '{We|pronoun} explored the {dark|adjective} {cave|noun} {because|conjunction} we were curious.',
    'The {clever|adjective} {sheikah|adjective} slate {beeped|verb} {loudly|adverb}.',
  ];
  const IRREG = [ // base, past, past participle, -ing
    ['dig', 'dug', 'dug', 'digging'], ['hide', 'hid', 'hidden', 'hiding'], ['take', 'took', 'taken', 'taking'],
    ['speak', 'spoke', 'spoken', 'speaking'], ['wake', 'woke', 'woken', 'waking'], ['grow', 'grew', 'grown', 'growing'],
    ['shake', 'shook', 'shaken', 'shaking'], ['bite', 'bit', 'bitten', 'biting'], ['find', 'found', 'found', 'finding'],
    ['buy', 'bought', 'bought', 'buying'], ['sell', 'sold', 'sold', 'selling'], ['hold', 'held', 'held', 'holding'],
    ['steal', 'stole', 'stolen', 'stealing'], ['give', 'gave', 'given', 'giving'],
    ['swim', 'swam', 'swum', 'swimming'], ['run', 'ran', 'run', 'running'], ['fly', 'flew', 'flown', 'flying'],
    ['catch', 'caught', 'caught', 'catching'], ['bring', 'brought', 'brought', 'bringing'], ['teach', 'taught', 'taught', 'teaching'],
    ['freeze', 'froze', 'frozen', 'freezing'], ['ride', 'rode', 'ridden', 'riding'], ['throw', 'threw', 'thrown', 'throwing'],
    ['write', 'wrote', 'written', 'writing'], ['sing', 'sang', 'sung', 'singing'], ['break', 'broke', 'broken', 'breaking'],
    ['choose', 'chose', 'chosen', 'choosing'], ['begin', 'began', 'begun', 'beginning'], ['draw', 'drew', 'drawn', 'drawing'],
    ['eat', 'ate', 'eaten', 'eating'], ['fight', 'fought', 'fought', 'fighting'], ['seek', 'sought', 'sought', 'seeking'],
  ];
  const AGREE = [
    [1, 'The children ___ playing in the garden.', 'are', ['is', 'was', 'be']],
    [1, 'She ___ her homework every evening.', 'does', ['do', 'doing', 'done']],
    [1, 'We ___ to the beach last summer.', 'went', ['go', 'goes', 'gone']],
    [2, 'The team ___ won every match this season.', 'has', ['have', 'are', 'were']],
    [2, 'There ___ lots of apples on the tree.', 'are', ['is', 'was', 'has']],
    [2, 'Everyone ___ excited about the festival.', 'was', ['were', 'are', 'be']],
    [2, 'Link and Zelda ___ best friends.', 'are', ['is', 'was', 'be']],
    [3, 'The box of swords ___ very heavy.', 'was', ['were', 'are', 'have']],
    [3, 'Neither of the guards ___ awake.', 'was', ['were', 'are', 'be']],
    [3, 'If she ___ harder, she would have passed the test.', 'had tried', ['tried', 'has tried', 'would try']],
    [3, 'I wish I ___ fly like a Rito.', 'could', ['can', 'will', 'am']],
    [1, 'The Koroks ___ hiding in the forest.', 'are', ['is', 'was', 'be']],
    [1, 'Link ___ to the stable every morning.', 'goes', ['go', 'going', 'gone']],
    [1, 'My friends and I ___ going to the market.', 'are', ['is', 'am', 'was']],
    [2, 'Each of the Champions ___ a Divine Beast.', 'pilots', ['pilot', 'piloting', 'are piloting']],
    [2, 'Neither Link nor Zelda ___ afraid.', 'was', ['were', 'are', 'be']],
    [2, 'The flock of birds ___ flying south.', 'was', ['were', 'are', 'have']],
    [2, 'Yesterday we ___ a huge fish.', 'caught', ['catched', 'catch', 'have caught']],
    [2, 'If I ___ a bird, I would fly to Rito Village.', 'were', ['was', 'am', 'be']],
    [3, 'Zelda and ___ explored the ruins.', 'I', ['me', 'myself', 'mine']],
    [3, 'The king gave the map to Impa and ___.', 'me', ['I', 'myself', 'mine']],
    [3, 'There ___ fewer monsters here than before.', 'are', ['is', 'was', 'has']],
    [3, 'She ran ___ than anyone else in the race.', 'faster', ['fastest', 'more fast', 'more faster']],
    [3, 'Of all the shrines, this one is the ___.', 'hardest', ['harder', 'most hardest', 'more hard']],
    [3, 'By the time we arrived, the guardian ___ already left.', 'had', ['has', 'have', 'was']],
  ];
  const CONJ = [
    [1, 'Do you want juice ___ water?', 'or', ['and', 'so', 'because']],
    [1, 'It was cold, ___ we lit a fire.', 'so', ['but', 'or', 'although']],
    [1, 'Link likes swimming ___ he likes climbing too.', 'and', ['but', 'because', 'or']],
    [2, 'Link waited ___ the rain stopped.', 'until', ['because', 'although', 'or']],
    [2, '___ the sun rose, the birds began to sing.', 'As', ['Unless', 'Although', 'Or']],
    [2, 'She was smiling ___ she had found the treasure.', 'because', ['although', 'unless', 'or']],
    [3, '___ it was raining, the match continued.', 'Even though', ['Because', 'So that', 'Unless']],
    [3, 'Gorons love rocks, ___ Zoras love water.', 'whereas', ['therefore', 'because', 'unless']],
    [3, 'Pack a torch ___ it gets dark.', 'in case', ['unless', 'although', 'whereas']],
    [3, 'The bridge was closed; ___, we took the long way round.', 'therefore', ['however', 'although', 'whereas']],
    [1, 'I wanted to go outside ___ it was raining.', 'but', ['and', 'because', 'so']],
    [1, 'Link was tired ___ he went to bed.', 'so', ['but', 'although', 'or']],
    [2, 'We stayed indoors ___ the storm was fierce.', 'because', ['although', 'unless', 'or']],
    [2, '___ he was frightened, Link entered the cave.', 'Although', ['Because', 'So', 'Unless']],
    [2, 'You cannot enter ___ you solve the riddle.', 'unless', ['because', 'and', 'so']],
    [3, 'The plan failed; ___, nobody gave up.', 'however', ['therefore', 'because', 'meanwhile']],
    [3, 'He trained every day; ___, he became the strongest knight.', 'consequently', ['however', 'although', 'nevertheless']],
    [3, 'Zelda studied the stars ___ Link kept watch.', 'while', ['unless', 'therefore', 'despite']],
  ];
  topics.push({
    id: 'e-gram', name: 'Grammar', shrine: 'Ta\'loh Naeg Shrine', icon: '📜',
    lesson: `<p><b>Noun</b> = a thing, person or place (sword, Link, castle). <b>Verb</b> = a doing or being word (run, is). <b>Adjective</b> = describes a noun (brave knight). <b>Adverb</b> = describes a verb, often ending in -ly (ran <i>quickly</i>). <b>Pronoun</b> = replaces a noun (he, she, they). <b>Preposition</b> = tells you where/when (under, above, after). <b>Conjunction</b> = joins ideas (and, but, because).</p>
      <p><b>Tense:</b> irregular verbs change shape in the past: swim → swam, catch → caught.</p>
      <p><b>"Zelda and I" or "Zelda and me"?</b> Take the other person away: "<i>I</i> explored" ✓, "gave it to <i>me</i>" ✓.</p>`,
    gen(lv) {
      const t = pick(lv === 1 ? ['class', 'tense', 'agree', 'conj'] : ['class', 'tense', 'agree', 'conj', 'agree']);
      if (t === 'class') {
        const s = pick(TAGGED);
        const tags = [...s.matchAll(/\{([^|}]+)\|([^}]+)\}/g)].map(m => ({ w: m[1], c: m[2] }));
        const classes = [...new Set(tags.map(x => x.c))];
        const want = pick(lv === 1 ? classes.filter(c => ['noun', 'verb', 'adjective'].includes(c)) : classes);
        if (!want) return this.gen(lv);
        const matches = tags.filter(x => x.c === want);
        if (matches.length !== 1) return this.gen(lv);
        const plain = s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
        const others = tags.filter(x => x.c !== want).map(x => x.w);
        return mc(`In this sentence, which word is ${/^[aeiou]/.test(want) ? 'an' : 'a'} <b>${want}</b>?<br><i>"${plain}"</i>`, matches[0].w, others, `"${matches[0].w}" is the ${want}. ${others.slice(0, 2).map(o => `"${o}" is ${tags.find(x => x.w === o).c === 'adjective' ? 'an adjective' : 'a ' + tags.find(x => x.w === o).c}`).join('; ')}.`);
      }
      if (t === 'tense') {
        const v = pick(IRREG);
        const who = pick(['Link', 'Zelda', 'The Rito', 'Mipha', 'Daruk']);
        if (lv >= 2 && chance(0.5)) return mc(`Which word completes the sentence?<br><i>"${who} has already ___ ."</i> (${v[0]})`, v[2], [v[1], v[0] + 'ed', v[3]], `With "has" or "have" we use the past participle: has ${v[2]}.`);
        return mc(`Which word completes the sentence in the <b>past tense</b>?<br><i>"Yesterday, ${who} ___ ."</i> (${v[0]})`, v[1], [v[0] + (v[0].endsWith('e') ? 'd' : 'ed'), v[3], v[0] + 's', v[2] === v[1] ? v[0] : v[2]], `"${v[0]}" is irregular: the past tense is "${v[1]}".`);
      }
      if (t === 'agree') {
        const a = pick(byLv(AGREE, lv));
        return mc(`Which word fits best?<br><i>"${a[1]}"</i>`, a[2], a[3], `"${a[1].replace('___', a[2])}" is correct.`);
      }
      const c = pick(byLv(CONJ, lv));
      return mc(`Which word best joins the ideas?<br><i>"${c[1]}"</i>`, c[2], c[3], `"${c[1].replace('___', c[2])}"`);
    },
  });

  /* ---------------- 4. Vocabulary ---------------- */
  // [level, word, meaning]
  const VOCAB = [
    [1, 'nibble', 'to take small bites'], [1, 'dash', 'to run very quickly'], [1, 'wobble', 'to move unsteadily from side to side'],
    [1, 'clumsy', 'often bumping into or dropping things'], [1, 'gaze', 'to look steadily for a long time'], [1, 'whisper', 'to speak very quietly'],
    [1, 'nervous', 'worried and a little afraid', 'fear'], [1, 'sparkle', 'to shine with little flashes of light'], [1, 'rescue', 'to save from danger'], [1, 'journey', 'a trip from one place to another'],
    [2, 'scarce', 'in short supply'], [2, 'hesitate', 'to pause before doing something'], [2, 'sturdy', 'strong and solid'], [2, 'generous', 'happy to give and share'],
    [2, 'obstacle', 'something that blocks your way'], [2, 'plummet', 'to fall straight down very fast'], [2, 'wander', 'to walk slowly without a clear direction'],
    [2, 'ferocious', 'fierce and violent', 'angry'], [2, 'murky', 'dark and dirty, hard to see through'], [2, 'quarrel', 'an angry argument'], [2, 'bewildered', 'very confused'], [2, 'radiant', 'shining brightly; glowing'],
    [3, 'ambivalent', 'having mixed feelings'], [3, 'clandestine', 'done secretly'], [3, 'diminish', 'to make or become smaller'], [3, 'eloquent', 'speaking fluently and persuasively'],
    [3, 'frivolous', 'silly and not serious'], [3, 'impartial', 'fair; not taking sides'], [3, 'melancholy', 'a deep, thoughtful sadness'], [3, 'obsolete', 'no longer used; out of date'],
    [3, 'pragmatic', 'dealing with things sensibly and practically'], [3, 'reticent', 'not revealing your thoughts easily; reserved'], [3, 'ubiquitous', 'found everywhere'], [3, 'venerable', 'respected because of age or wisdom'],
    [1, 'ancient', 'very old'], [1, 'brave', 'not afraid of danger'], [1, 'cosy', 'warm and comfortable'], [1, 'gloomy', 'dark and sad'],
    [1, 'swift', 'very fast'], [1, 'fragile', 'easily broken'], [1, 'furious', 'extremely angry', 'angry'], [1, 'peculiar', 'strange or odd', 'odd'],
    [1, 'exhausted', 'very tired', 'tired'], [1, 'glimpse', 'a quick look'], [1, 'timid', 'shy and easily frightened', 'fear'], [1, 'vanish', 'to disappear suddenly'],
    [1, 'feast', 'a large special meal'], [1, 'grumble', 'to complain quietly'], [1, 'soar', 'to fly high in the air'], [1, 'damp', 'slightly wet'],
    [2, 'abundant', 'more than enough; plentiful'], [2, 'cautious', 'careful to avoid danger'], [2, 'reluctant', 'unwilling to do something'], [2, 'vivid', 'bright and clear'],
    [2, 'desolate', 'empty and lonely'], [2, 'triumph', 'a great victory'], [2, 'eerie', 'strange and frightening', 'odd'], [2, 'agile', 'able to move quickly and easily'],
    [2, 'devour', 'to eat hungrily'], [2, 'loyal', 'faithful and true'], [2, 'summit', 'the top of a mountain'], [2, 'weary', 'tired and worn out', 'tired'],
    [2, 'enormous', 'very big', 'big'], [2, 'astonished', 'very surprised'], [2, 'humble', 'not proud; modest'], [2, 'linger', 'to stay longer than needed'],
    [3, 'benevolent', 'kind and generous'], [3, 'ominous', 'suggesting something bad will happen'], [3, 'tenacious', 'refusing to give up'], [3, 'meticulous', 'very careful about details'],
    [3, 'serene', 'calm and peaceful', 'calm'], [3, 'formidable', 'causing fear or respect because of strength'], [3, 'jubilant', 'full of joy at a success'], [3, 'candid', 'honest and direct'],
    [3, 'futile', 'pointless; having no effect'], [3, 'lethargic', 'sluggish and lacking energy', 'tired'], [3, 'notorious', 'famous for something bad'], [3, 'resilient', 'able to recover quickly'],
    [3, 'scrutinise', 'to examine very closely'], [3, 'tranquil', 'quiet and still', 'calm'], [3, 'vindictive', 'wanting revenge'], [3, 'ambiguous', 'having more than one possible meaning'],
  ];
  topics.push({
    id: 'e-vocab', name: 'Vocabulary', shrine: 'Ze Kasho Shrine', icon: '📖',
    lesson: `<p>A big vocabulary helps in every part of the 11+! When you meet a new word:</p>
      <p>1️⃣ Look for <b>clues in the sentence</b> around it. 2️⃣ Look for <b>word parts</b> you know: "<i>bene</i>volent" — <i>bene</i> means good. 3️⃣ Try each option <b>in the sentence</b> to see which makes sense.</p>
      <p>Collect brilliant words in a notebook — like a Hylian collecting treasures!</p>`,
    gen(lv) {
      const it = pick(byLv(VOCAB, lv));
      const pool = VOCAB.filter(v => v[1] !== it[1] && (!it[3] || v[3] !== it[3])); // never offer a near-synonym as a wrong answer
      if (chance(0.5)) return mc(`What does <b>${it[1]}</b> mean?`, it[2], sample(pool, 6).map(v => v[2]), `<b>${it[1]}</b> means "${it[2]}".`);
      return mc(`Which word means <b>"${it[2]}"</b>?`, it[1], sample(pool.filter(v => Math.abs(v[0] - it[0]) <= 1), 6).map(v => v[1]), `<b>${it[1]}</b> means "${it[2]}".`);
    },
  });

  /* ---------------- 5. Cloze (choose the best word) ---------------- */
  const CLOZE = [
    [1, 'The puppy wagged its ___ when it saw its owner.', 'tail', ['hat', 'shoe', 'nose']],
    [1, 'It was so dark that we needed a ___ to see.', 'torch', ['spoon', 'pillow', 'ladder']],
    [1, 'Link drank a glass of cold ___ after the race.', 'water', ['bread', 'sand', 'wood']],
    [1, 'The ice cream began to ___ in the hot sun.', 'melt', ['freeze', 'sing', 'grow']],
    [1, 'Zelda wrapped up warm because it was ___ outside.', 'freezing', ['boiling', 'sunny', 'dry']],
    [1, 'The farmer collected eggs from the ___.', 'hens', ['cows', 'sheep', 'fish']],
    [1, 'We used a pair of ___ to cut the paper.', 'scissors', ['hammers', 'spoons', 'brushes']],
    [1, 'The library was ___, so everyone whispered.', 'silent', ['noisy', 'broken', 'colourful']],
    [1, 'Birds build ___ to lay their eggs in.', 'nests', ['shells', 'puddles', 'boats']],
    [1, 'The cake smelled so ___ that my mouth watered.', 'delicious', ['horrible', 'loud', 'square']],
    [1, 'After the storm, a beautiful ___ appeared in the sky.', 'rainbow', ['river', 'mountain', 'carpet']],
    [2, 'The ___ crowd cheered as the knight returned home.', 'excited', ['silent', 'sleepy', 'bored']],
    [2, 'She was ___ to share her sweets, so she kept them all.', 'unwilling', ['eager', 'happy', 'quick']],
    [2, 'The old rope bridge was too ___ to cross safely.', 'fragile', ['sturdy', 'modern', 'wide']],
    [2, 'Link ___ the heavy boulder up the hill.', 'pushed', ['floated', 'whispered', 'painted']],
    [2, 'The thief ___ before anyone could catch him.', 'fled', ['arrived', 'stayed', 'waited']],
    [2, 'Everyone was ___ when the shy boy won the singing contest.', 'astonished', ['bored', 'angry', 'unsurprised']],
    [2, 'The baker ___ the dough before putting it in the oven.', 'kneaded', ['boiled', 'froze', 'sewed']],
    [2, 'The path was so ___ that the horses kept slipping.', 'icy', ['dry', 'sandy', 'grassy']],
    [2, 'The lion let out a mighty ___.', 'roar', ['whisper', 'giggle', 'squeak']],
    [2, 'The Gorons are ___ for their incredible strength.', 'famous', ['forgotten', 'ashamed', 'tiny']],
    [3, 'The witness gave such a ___ account that the judge believed her.', 'credible', ['dubious', 'fictional', 'careless']],
    [3, 'His ___ attitude meant he never shared anything.', 'selfish', ['generous', 'kindly', 'cheerful']],
    [3, 'The general devised an ___ plan to outwit the enemy.', 'ingenious', ['foolish', 'obvious', 'clumsy']],
    [3, 'After the long drought, the land was completely ___.', 'barren', ['fertile', 'flooded', 'lush']],
    [3, 'The ___ child asked question after question.', 'inquisitive', ['indifferent', 'silent', 'sleepy']],
    [3, 'Despite his ___ appearance, the old man was very strong.', 'frail', ['sturdy', 'robust', 'muscular']],
    [3, 'The king issued a ___ that all citizens must obey.', 'decree', ['rumour', 'song', 'riddle']],
    [3, 'The villagers were ___ of strangers after the robbery.', 'wary', ['fond', 'careless', 'trusting']],
    [3, 'Her speech was so ___ that the audience was moved to tears.', 'poignant', ['tedious', 'dull', 'trivial']],
    [1, 'The castle walls were so ___ that no army could climb them.', 'high', ['soft', 'happy', 'quick']],
    [1, 'Link was so ___ after the long climb that he fell asleep at once.', 'tired', ['excited', 'hungry', 'early']],
    [1, 'The Zora swam ___ through the cold water.', 'gracefully', ['clumsily', 'loudly', 'dryly']],
    [1, 'Please ___ the door behind you so the cold stays out.', 'close', ['open', 'paint', 'break']],
    [1, 'The baby bird could not fly yet because its wings were too ___.', 'weak', ['strong', 'blue', 'loud']],
    [2, 'The ___ explorer refused to turn back, even in the blizzard.', 'determined', ['nervous', 'lazy', 'forgetful']],
    [2, 'After weeks without rain, the river was almost completely ___.', 'dry', ['flooded', 'frozen', 'deep']],
    [2, 'The audience ___ loudly when the bard finished his song.', 'applauded', ['whispered', 'scowled', 'yawned']],
    [2, 'Zelda studied the ___ carving, trying to work out its meaning.', 'mysterious', ['obvious', 'delicious', 'noisy']],
    [2, 'The merchant was ___ — he never cheated a single customer.', 'honest', ['greedy', 'sly', 'rude']],
    [2, 'The ___ of the volcano glowed red against the night sky.', 'crater', ['shore', 'valley', 'meadow']],
    [3, 'Despite the ___ odds, the Champions believed they could win.', 'overwhelming', ['generous', 'trivial', 'pleasant']],
    [3, 'The old map was so ___ that the paths had almost faded away.', 'weathered', ['pristine', 'vibrant', 'modern']],
    [3, 'Her ___ reply left no doubt about what she thought.', 'blunt', ['vague', 'timid', 'hesitant']],
    [3, 'The guards were ___, checking every traveller twice.', 'vigilant', ['careless', 'drowsy', 'absent']],
    [3, 'He spoke with such ___ that everyone believed him.', 'conviction', ['hesitation', 'confusion', 'boredom']],
    [3, 'The scientist made a ___ discovery that changed history.', 'remarkable', ['mundane', 'minor', 'trivial']],
  ];
  topics.push({
    id: 'e-cloze', name: 'Cloze: Missing Words', shrine: 'Myahm Agana Shrine', icon: '🧩',
    lesson: `<p>A <b>cloze</b> question has a gap. Read the <b>whole</b> sentence first — the clue is often <i>after</i> the gap!</p>
      <p>Ask yourself: does the missing word need to be a noun, verb, adjective or adverb? Then try every option and pick the one that makes the <b>most sense</b> — not just one that sounds OK.</p>
      <p>Watch out for words like <i>despite</i>, <i>but</i> and <i>although</i> — they signal a contrast.</p>`,
    gen(lv) {
      const c = pick(byLv(CLOZE, lv));
      return mc(`Choose the best word to fill the gap:<br><i>"${c[1].replace('___', '<span class="gap">______</span>')}"</i>`, c[2], c[3], `"${c[1].replace('___', c[2])}"`);
    },
  });

  /* ---------------- 6. Word building: homophones, prefixes, suffixes ---------------- */
  const HOMO = [
    [1, 'The wind ___ the leaves off the tree.', 'blew', ['blue', 'blewe']],
    [1, 'I ate ___ slices of pizza.', 'eight', ['ate', 'eigth']],
    [1, 'Please ___ here until I come back.', 'wait', ['weight', 'wate']],
    [1, 'The ___ of my shoe has a hole in it.', 'sole', ['soul', 'sol']],
    [2, 'The ___ galloped across the field.', 'horse', ['hoarse', 'hors']],
    [2, 'He shouted so much that his voice was ___.', 'hoarse', ['horse', 'horce']],
    [2, 'We could ___ the bells ringing from far away.', 'hear', ['here', 'heer']],
    [3, 'Please read the poem ___ to the class.', 'aloud', ['allowed', 'alowd']],
    [3, 'The bride walked slowly down the ___.', 'aisle', ['isle', "I'll"]],
    [3, 'The princess will ___ over the kingdom.', 'reign', ['rain', 'rein']],
    [1, 'The Koroks hid ___ seeds under the rocks.', 'their', ['there', "they're"]],
    [1, 'Look over ___ by the waterfall!', 'there', ['their', "they're"]],
    [1, "___ going to the shrine after lunch.", "They're", ['Their', 'There']],
    [1, 'I want to come ___!', 'too', ['to', 'two']],
    [1, 'The knight rode through the dark ___.', 'night', ['knight', 'nite']],
    [1, 'Can you ___ the answer on the board?', 'write', ['right', 'rite']],
    [2, 'The dog wagged ___ tail.', 'its', ["it's", "its'"]],
    [2, "___ going to be a long journey.", "It's", ['Its', "Its'"]],
    [2, "___ sword is this?", 'Whose', ["Who's", 'Whos']],
    [2, 'The two kingdoms finally made ___.', 'peace', ['piece', 'peas']],
    [2, "I'd like a ___ of apple pie, please.", 'piece', ['peace', 'peice']],
    [2, "___ the best archer in Hyrule!", "You're", ['Your', 'Yore']],
    [3, 'The rain will not ___ our plans.', 'affect', ['effect', 'afect']],
    [3, 'The potion had a strange ___ on him.', 'effect', ['affect', 'efect']],
    [3, 'Pets are not ___ inside the palace.', 'allowed', ['aloud', 'alowed']],
    [3, 'Everyone came ___ the Yiga clan.', 'except', ['accept', 'expect']],
    [3, 'The ship stayed in the ___ to wait out the storm.', 'harbour', ['harbor', 'harbur']],
    [3, 'The ___ of the story was to always be kind.', 'moral', ['morale', 'mural']],
  ];
  const PREFIX = [
    [1, 'lock', 'unlock', ['dislock', 'mislock', 'inlock']], [1, 'like', 'dislike', ['mislike', 'inlike', 'imlike']], [1, 'fair', 'unfair', ['disfair', 'misfair', 'infair']],
    [2, 'perfect', 'imperfect', ['unperfect', 'disperfect', 'inperfect']], [2, 'polite', 'impolite', ['unpolite', 'dispolite', 'inpolite']], [2, 'obey', 'disobey', ['unobey', 'misobey', 'imobey']],
    [3, 'relevant', 'irrelevant', ['unrelevant', 'inrelevant', 'disrelevant']], [3, 'literate', 'illiterate', ['unliterate', 'inliterate', 'disliterate']], [3, 'accurate', 'inaccurate', ['unaccurate', 'disaccurate', 'imaccurate']],
    [1, 'happy', 'unhappy', ['dishappy', 'imhappy', 'nonhappy']], [1, 'kind', 'unkind', ['diskind', 'inkind', 'mikind']],
    [1, 'agree', 'disagree', ['unagree', 'imagree', 'misagree']], [1, 'appear', 'disappear', ['unappear', 'misappear', 'inappear']],
    [2, 'possible', 'impossible', ['unpossible', 'inpossible', 'dispossible']], [2, 'legal', 'illegal', ['unlegal', 'inlegal', 'dislegal']],
    [2, 'regular', 'irregular', ['unregular', 'inregular', 'disregular']], [2, 'behave', 'misbehave', ['unbehave', 'disbehave', 'inbehave']],
    [2, 'patient', 'impatient', ['unpatient', 'dispatient', 'inpatient']], [3, 'responsible', 'irresponsible', ['unresponsible', 'inresponsible', 'disresponsible']],
    [3, 'visible', 'invisible', ['unvisible', 'imvisible', 'disvisible']], [3, 'logical', 'illogical', ['unlogical', 'inlogical', 'dislogical']],
    [3, 'mature', 'immature', ['unmature', 'inmature', 'dismature']], [3, 'honest', 'dishonest', ['unhonest', 'inhonest', 'imhonest']],
  ];
  const PLURAL = [
    [1, 'box', 'boxes', ['boxs', 'boxies', 'boxen']], [1, 'lady', 'ladies', ['ladys', 'ladyes', "lady's"]], [1, 'wolf', 'wolves', ['wolfs', 'wolfes', 'wolvs']],
    [2, 'woman', 'women', ['womans', 'womens', 'womanes']], [2, 'goose', 'geese', ['gooses', 'geeses', 'goosen']], [2, 'hero', 'heroes', ['heros', "hero's", 'heroies']],
    [3, 'oasis', 'oases', ['oasises', 'oasis', 'oasi']], [3, 'ox', 'oxen', ['oxes', 'oxs', 'oxies']], [3, 'analysis', 'analyses', ['analysises', 'analysiss', 'analysi']],
    [1, 'baby', 'babies', ['babys', 'babyes', "baby's"]], [1, 'fox', 'foxes', ['foxs', 'foxies', 'foxen']], [1, 'child', 'children', ['childs', 'childes', 'childrens']],
    [1, 'mouse', 'mice', ['mouses', 'mices', 'meese']], [2, 'knife', 'knives', ['knifes', 'knifs', 'knive']], [2, 'leaf', 'leaves', ['leafs', 'leafes', 'leavs']],
    [2, 'potato', 'potatoes', ['potatos', "potato's", 'potatoe']], [2, 'tooth', 'teeth', ['tooths', 'teeths', 'toothes']], [2, 'cactus', 'cacti', ['cactuss', 'cactuses', 'cactis']],
    [3, 'sheep', 'sheep', ['sheeps', 'sheepes', 'shoop']], [3, 'crisis', 'crises', ['crisises', 'crisis', 'crisi']], [3, 'phenomenon', 'phenomena', ['phenomenons', 'phenomenas', 'phenomenoni']],
    [3, 'thief', 'thieves', ['thiefs', 'theives', 'thiefes']], [3, 'echo', 'echoes', ['echos', "echo's", 'echoies']],
  ];
  topics.push({
    id: 'e-words', name: 'Homophones & Word Building', shrine: 'Kah Mael Shrine', icon: '🔤',
    lesson: `<p><b>Homophones</b> sound the same but mean different things: <b>their</b> (belongs to them), <b>there</b> (a place), <b>they're</b> (they are). <b>its</b> (belongs to it) vs <b>it's</b> (it is).</p>
      <p><b>Prefixes</b> go at the front and change meaning: un-, dis-, mis-. Before p/m use <b>im</b>- (impossible), before l use <b>il</b>- (illegal), before r use <b>ir</b>- (irregular).</p>
      <p><b>Plurals:</b> consonant + y → -ies (babies). -f/-fe → -ves (knives). Some are irregular: mouse → mice, child → children.</p>`,
    gen(lv) {
      const t = pick(['homo', 'homo', 'prefix', 'plural']);
      if (t === 'homo') { const h = pick(byLv(HOMO, lv)); return mc(`Which word correctly fills the gap?<br><i>"${h[1]}"</i>`, h[2], h[3], `"${h[1].replace('___', h[2])}"`); }
      if (t === 'prefix') { const p = pick(byLv(PREFIX, lv)); return mc(`Which word means the <b>opposite</b> of <b>${p[1]}</b>?`, p[2], p[3], `The correct prefix is "${p[2].slice(0, p[2].length - p[1].length)}-": ${p[2]}.`); }
      const p = pick(byLv(PLURAL, lv)); return mc(`What is the <b>plural</b> of <b>${p[1]}</b>?`, p[2], p[3], `One ${p[1]}, two ${p[2]}.`);
    },
  });

  /* ---------------- 7. Figurative language ---------------- */
  const FIG = [
    [2, 'The stars were diamonds in the sky.', 'metaphor'], [2, 'The wind howled angrily all night.', 'personification'], [2, 'Whoosh! The arrow flew past.', 'onomatopoeia'],
    [2, 'He was as quiet as a mouse.', 'simile'], [2, 'My backpack weighs a million kilos!', 'hyperbole'], [3, 'Her eyes were deep pools of sorrow.', 'metaphor'],
    [3, 'The old car coughed and spluttered up the hill.', 'personification'], [3, 'Peter Piper picked a peck of pickled peppers.', 'alliteration'], [3, 'He ran faster than the speed of light.', 'hyperbole'],
    [3, 'Life is a rollercoaster.', 'metaphor'], [3, 'The kettle sang on the stove.', 'personification'],
    [1, 'The thunder roared like a lion.', 'simile'], [1, 'Sizzle went the sausages in the pan.', 'onomatopoeia'], [1, 'The sun smiled down on us.', 'personification'],
    [1, 'Tiny Tim took ten toys.', 'alliteration'], [1, 'The kitten was as soft as a cloud.', 'simile'], [1, 'The door creaked and the floor squeaked.', 'onomatopoeia'],
    [1, 'The wind howled like a hungry wolf.', 'simile'], [1, 'Link was as brave as a lion.', 'simile'], [1, 'Silly snakes slithered silently.', 'alliteration'],
    [1, 'Crash! Bang! The rocks tumbled down.', 'onomatopoeia'], [1, 'The flowers danced in the breeze.', 'personification'], [1, 'Big brown bears bounced on the bridge.', 'alliteration'],
    [1, 'The bees buzzed around the hive.', 'onomatopoeia'], [1, 'Her smile was as bright as the sun.', 'simile'],
    [2, 'The classroom was a zoo.', 'metaphor'], [2, 'The old house groaned in the storm.', 'personification'], [2, 'His heart was a block of ice.', 'metaphor'],
    [2, 'The leaves whispered secrets to each other.', 'personification'], [2, 'The snow was a white blanket over the valley.', 'metaphor'], [2, 'The guardian moved like a giant spider.', 'simile'],
    [2, "I've told you a million times!", 'hyperbole'], [2, 'This bag weighs a ton!', 'hyperbole'],
    [3, 'Time is a thief.', 'metaphor'], [3, 'The moon kept a watchful eye on the sleeping town.', 'personification'], [3, 'I am so hungry I could eat a horse.', 'hyperbole'],
    [3, 'Fear crept into the room.', 'personification'], [3, 'The fog was a grey ghost drifting through the streets.', 'metaphor'], [3, 'Her words cut like a knife.', 'simile'],
  ];
  const DEVICES = ['simile', 'metaphor', 'personification', 'alliteration', 'onomatopoeia', 'hyperbole'];
  const DEF = {
    simile: 'compares two things using "like" or "as"', metaphor: 'says something IS something else',
    personification: 'gives human actions or feelings to something that is not human', alliteration: 'repeats the same sound at the start of nearby words',
    onomatopoeia: 'is a word that sounds like the noise it describes', hyperbole: 'is a huge exaggeration',
  };
  topics.push({
    id: 'e-fig', name: 'Figurative Language', shrine: 'Ree Dahee Shrine', icon: '🎭',
    lesson: `<p>Writers use <b>figurative language</b> to paint pictures with words:</p>
      <p><b>Simile</b> — compares using <i>like</i> or <i>as</i>: "as brave as a lion". <b>Metaphor</b> — says it <i>is</i> something else: "the classroom was a zoo".</p>
      <p><b>Personification</b> — gives human qualities to non-human things: "the wind whispered". <b>Alliteration</b> — same starting sound: "silly snakes slithered". <b>Onomatopoeia</b> — sound words: crash, buzz, sizzle. <b>Hyperbole</b> — massive exaggeration: "I've told you a million times!"</p>`,
    gen(lv) {
      const f = pick(byLv(FIG, lv));
      const pool = lv === 1 ? ['simile', 'alliteration', 'onomatopoeia', 'personification', 'metaphor'] : DEVICES;
      return mc(`What technique is used here?<br><i>"${f[1]}"</i>`, f[2], shuffle(pool.filter(d => d !== f[2])), `This is <b>${f[2]}</b> — it ${DEF[f[2]]}.`);
    },
  });

  /* ---------------- 8. Comprehension ---------------- */
  // Each passage: level, title, text, questions [q, answer, distractors, explanation]
  const PASSAGES = [
    {
      l: 1, title: 'Paya’s Diary',
      text: `Monday
Today was the best day ever! Grandmother Impa let me help in the garden for the first time. We planted rows of carrots, and I watered every single one.

Tuesday
It rained all day, so I stayed inside and read a book about the Sheikah. I learned that they once built amazing machines. I wish I could see one!

Wednesday
This morning I found a tiny green shoot in the garden. My carrots are growing! I was so excited that I ran to tell Grandmother. She smiled and said, "Good things take time, Paya." I think she is right.`,
      qs: [
        ['What type of text is this?', 'A diary', ['A poem', 'A recipe', 'A newspaper report'], 'It is written by Paya about her own days, with a heading for each day.'],
        ['Who let Paya help in the garden?', 'Grandmother Impa', ['Link', 'Zelda', 'Her teacher'], '"Grandmother Impa let me help in the garden…"'],
        ['What did they plant?', 'Carrots', ['Potatoes', 'Apple trees', 'Flowers'], '"We planted rows of carrots."'],
        ['Why did Paya stay inside on Tuesday?', 'It rained all day', ['She was ill', 'It was too hot', 'She was tired'], '"It rained all day, so I stayed inside."'],
        ['What did Paya learn from her book?', 'The Sheikah once built amazing machines', ['How to grow carrots', 'How to cook soup', 'How to fly'], 'See Tuesday’s entry.'],
        ['How did Paya feel when she saw the green shoot?', 'Excited', ['Bored', 'Angry', 'Scared'], '"I was so excited that I ran to tell Grandmother."'],
        ['What does "Good things take time" mean?', 'You need to be patient', ['You should always hurry', 'Gardens are a waste of time', 'Clocks are useful'], 'Impa means the carrots will grow if Paya waits patiently.'],
      ],
    },
    {
      l: 2, title: 'The Zora: People of the Water',
      text: `The Zora are an aquatic people who live in Zora’s Domain, a sparkling city carved from luminous stone in the east of Hyrule. They are superb swimmers and can even leap up waterfalls.

Appearance
Zora have smooth, scaly skin in shades of red, blue and silver. Instead of hair, they have a tail-like head fin. Because their skin must stay moist, they rarely travel far from water.

Long lives
Zora live far longer than Hylians. Some Zora elders are over a hundred years old, and many still remember events that Hylians know only from history books.

Royal family
The Zora are ruled by a king. Prince Sidon, the king’s son, is famous for his cheerful nature and his enormous strength. His older sister, Mipha, was a skilled healer and one of the four Champions.`,
      qs: [
        ['What kind of text is this?', 'An information text', ['A story', 'A poem', 'A play script'], 'It gives facts about the Zora under sub-headings.'],
        ['Why are sub-headings like "Appearance" used?', 'To organise the information into sections', ['To tell a joke', 'To show who is speaking', 'To make the text rhyme'], 'Sub-headings help the reader find information quickly.'],
        ['What does "aquatic" mean?', 'Living in or near water', ['Living in the desert', 'Living in trees', 'Living underground'], 'The Zora are superb swimmers and stay near water.'],
        ['Why do Zora rarely travel far from water?', 'Their skin must stay moist', ['They are afraid of Hylians', 'They cannot walk', 'Their king forbids it'], '"Because their skin must stay moist, they rarely travel far from water."'],
        ['Which word describes the stone of Zora’s Domain?', 'luminous', ['smooth', 'scaly', 'enormous'], '"…a sparkling city carved from luminous stone."'],
        ['How is Sidon related to Mipha?', 'He is her younger brother', ['He is her father', 'He is her cousin', 'He is her older brother'], 'Mipha is described as Sidon’s "older sister".'],
        ['Which statement is TRUE according to the text?', 'Some Zora elders are over a hundred years old', ['All Zora have red skin', 'Zora cannot swim up waterfalls', 'Mipha ruled the Zora'], 'See the "Long lives" section.'],
      ],
    },
    {
      l: 3, title: 'The Keeper of Lurelin Light',
      text: `Old Garron had kept the lighthouse at Lurelin for forty winters. Each evening he climbed the hundred and twelve steps, polished the great lens until it gleamed, and coaxed the flame into life. Fishermen joked that the sea itself set its clock by him.

The night of the storm, however, the sea was in no mood for jokes. Waves hurled themselves at the rocks like furious giants, and the wind tore at the shutters with invisible claws. Halfway up the stairs, Garron’s lantern guttered and died.

He stood very still in the darkness, listening. Below him, the tower groaned. Somewhere out on the black water, he knew, the little fishing boats were turning for home, searching the horizon for his light.

Garron did not hurry. He had climbed these steps more times than he could count; his feet knew every worn edge. One by one, he counted them aloud, his voice steady against the roar. At the hundred and twelfth step, his hand found the cold brass of the lamp. A spark, a hiss, and then light, pouring out across the waves like a promise kept.`,
      qs: [
        ['How long had Garron kept the lighthouse?', 'Forty winters', ['A hundred and twelve years', 'One night', 'Ten years'], '"…for forty winters."'],
        ['What does "coaxed the flame into life" suggest?', 'He lit it gently and patiently', ['He blew it out', 'He was frightened of fire', 'He lit it carelessly'], 'To coax something is to persuade it gently.'],
        ['"Waves hurled themselves at the rocks like furious giants" is an example of…', 'a simile', ['a metaphor', 'onomatopoeia', 'a rhetorical question'], 'It compares waves to giants using "like".'],
        ['Why did Garron stand still when his lantern died?', 'He was listening and staying calm', ['He had fallen asleep', 'He was lost', 'He had given up'], '"He stood very still in the darkness, listening."'],
        ['How was Garron able to climb in the dark?', 'He knew the steps extremely well', ['He had a second lantern', 'Lightning lit the way', 'Someone guided him'], '"His feet knew every worn edge."'],
        ['Why was it so important that the light was lit?', 'The fishing boats needed it to find their way home', ['The village needed heating', 'It was a festival night', 'Garron wanted to read'], 'The boats were "searching the horizon for his light".'],
        ['What does "like a promise kept" suggest about the light?', 'Garron had done what people relied on him to do', ['The light was small and weak', 'Garron had broken a promise', 'The storm had ended'], 'The fishermen trusted him to light it, and he did.'],
        ['Which word best describes Garron?', 'Dependable', ['Careless', 'Impatient', 'Cowardly'], 'He stays calm and keeps his duty even in the storm.'],
      ],
    },
    {
      l: 1, title: 'Epona’s Apple',
      text: `Every morning, Link visited the stable to brush his horse, Epona. She had a shiny brown coat, a white mane and a mischievous twinkle in her eye.

One morning, Link brought a crunchy red apple as a treat. He put it in his pocket while he fetched the brush. When he came back, the apple had gone! Link looked under the hay bales and behind the water bucket, but he could not find it anywhere.

Then he heard a loud CRUNCH. Epona was munching happily, with juice dripping from her chin. She had pushed her nose into his pocket and taken the apple herself!

Link laughed so much that he had to sit down on a hay bale. "You clever girl," he said, patting her neck. From then on, he always kept her treats in a closed bag.`,
      qs: [
        ['What colour was Epona’s mane?', 'White', ['Brown', 'Black', 'Red'], '"She had a shiny brown coat, a white mane…"'],
        ['Why did Link bring the apple?', 'As a treat for Epona', ['For his own lunch', 'To sell at the market', 'To plant in the garden'], '"Link brought a crunchy red apple as a treat."'],
        ['Where did Link look for the apple?', 'Under the hay bales and behind the water bucket', ['In the river', 'Inside his house', 'Up a tree'], 'See the second paragraph.'],
        ['Which word from the passage is an example of onomatopoeia?', 'CRUNCH', ['shiny', 'laughed', 'clever'], '"CRUNCH" sounds like the noise it describes.'],
        ['How did Epona get the apple?', 'She took it from Link’s pocket', ['Link gave it to her', 'It fell on the floor', 'Another horse dropped it'], '"She had pushed her nose into his pocket and taken the apple herself!"'],
        ['What does "mischievous" suggest about Epona?', 'She likes to cause playful trouble', ['She is very old', 'She is frightened', 'She is very slow'], 'Mischievous means naughty in a playful way, just like taking the apple.'],
        ['How did Link feel when he found out?', 'Amused', ['Furious', 'Sad', 'Scared'], 'He "laughed so much that he had to sit down".'],
      ],
    },
    {
      l: 2, title: 'Night on the Great Plateau (a poem)',
      text: `The moon climbs up the mountain’s back,
A lantern made of silver light;
The old stone tower, tall and black,
Stands guard above the sleeping night.

The grasses whisper to the breeze,
The river hums a lullaby,
And fireflies dance between the trees
Like little stars that learned to fly.

Far off, a Guardian’s orange eye
Blinks once, then fades into the dark,
While somewhere, safe beneath the sky,
A traveller dreams beside a spark.`,
      qs: [
        ['What type of text is this?', 'A poem', ['A letter', 'A recipe', 'A newspaper report'], 'It is written in rhyming verses (stanzas).'],
        ['"A lantern made of silver light" describes…', 'the moon', ['the tower', 'a firefly', 'the river'], 'The line follows "The moon climbs up the mountain’s back".'],
        ['"The grasses whisper to the breeze" is an example of…', 'personification', ['a simile', 'onomatopoeia', 'alliteration'], 'Grass can’t really whisper, so the poet gives it a human action.'],
        ['Which line contains a simile?', 'Like little stars that learned to fly', ['The moon climbs up the mountain’s back', 'The river hums a lullaby', 'Blinks once, then fades into the dark'], 'It compares fireflies to stars using "like".'],
        ['Which word rhymes with "light" in the first verse?', 'night', ['back', 'black', 'tall'], 'light / night.'],
        ['What is the "spark" in the last line most likely to be?', 'A small campfire', ['A firework', 'A star', 'The Guardian’s eye'], 'A traveller sleeping outdoors would dream beside a campfire.'],
        ['Which words best describe the mood of the poem?', 'Calm and peaceful', ['Angry and loud', 'Busy and noisy', 'Silly and funny'], 'Lullabies, sleeping and dreams create a calm mood.'],
      ],
    },
    {
      l: 3, title: 'Why Every Traveller Should Climb a Sheikah Tower',
      text: `Hyrule is a vast and confusing land. Rivers twist without warning, forests swallow paths whole, and mountains hide entire villages from view. It is no surprise, then, that countless travellers have become hopelessly lost. Fortunately, there is a remarkably simple solution: climb a Sheikah Tower.

Firstly, the towers provide the most accurate maps available anywhere. Once activated, each tower uploads detailed information about the surrounding region directly onto a traveller’s Sheikah Slate. No hand-drawn map, however carefully made, can compete with such precision.

Secondly, the view from the summit is breathtaking. On a clear day, you can see from the snowy peaks of Hebra to the shimmering sands of Gerudo. Many visitors describe it as the most unforgettable moment of their journey.

Admittedly, the climb is not easy. The towers are tall, and some are surrounded by thorns or guarded by monsters. However, with patience and a full stamina wheel, almost anyone can reach the top.

In conclusion, a Sheikah Tower is not merely a landmark; it is a traveller’s best friend. Why wander blindly when the answers are waiting at the top?`,
      qs: [
        ['What is the main purpose of this text?', 'To persuade travellers to climb Sheikah Towers', ['To tell a funny story', 'To explain how the towers were built', 'To warn people never to travel'], 'The writer gives reasons and ends with "Why wander blindly…?" It is persuasive writing.'],
        ['Which word in the text means "exactness"?', 'precision', ['summit', 'landmark', 'stamina'], '"No hand-drawn map… can compete with such precision."'],
        ['Why does the writer use "Firstly" and "Secondly"?', 'To organise the arguments in order', ['To show time passing in a story', 'To describe the view', 'To introduce a character'], 'These connectives signpost each reason in turn.'],
        ['What does "Admittedly" show the writer is doing?', 'Accepting a point against their own argument', ['Changing the subject', 'Telling a lie', 'Giving up'], 'The writer admits the climb is hard, then answers that point with "However…".'],
        ['"Forests swallow paths whole" is an example of…', 'personification', ['a simile', 'alliteration', 'onomatopoeia'], 'Forests cannot really swallow. The writer gives them a living action.'],
        ['The final sentence of the text is…', 'a rhetorical question', ['a command', 'a statement of fact', 'a simile'], 'It is a question asked for effect, not one that needs an answer.'],
        ['According to the text, what does an activated tower do?', 'Uploads maps onto a Sheikah Slate', ['Lights up the sky', 'Defeats nearby monsters', 'Grows taller'], 'See the second paragraph.'],
        ['Which word best describes the writer’s attitude towards the towers?', 'Enthusiastic', ['Doubtful', 'Bored', 'Fearful'], 'Words like "breathtaking" and "best friend" show enthusiasm.'],
      ],
    },
    {
      l: 1, title: 'The Korok Who Lost His Leaf',
      text: `Deep in the Lost Woods lived a small Korok called Pip. Like all Koroks, Pip carried a leaf on his head, but his was special: it was the biggest, greenest leaf in the whole forest. Every morning, Pip polished it with dew drops until it shone.

One windy afternoon, a sudden gust snatched the leaf away. Pip watched in horror as it twirled high above the trees and vanished towards the river. "Oh no!" he squeaked, and he began to cry.

A traveller in a blue tunic heard the sobbing. He knelt down beside Pip. "Don't worry," he said kindly. "I'll help you find it." Together they followed the river until they spotted something green caught on a rock in the middle of the water. The traveller waded in, ignoring the icy current, and carried the leaf back.

Pip was so happy that he did a little dance. "Yahaha! Thank you!" he cried, and he gave the traveller a golden seed as a reward.`,
      qs: [
        ['Where did Pip live?', 'In the Lost Woods', ['By the river', 'In a castle', 'On a mountain'], 'The first sentence says Pip lived "deep in the Lost Woods".'],
        ['What made Pip’s leaf special?', 'It was the biggest, greenest leaf in the forest', ['It was golden', 'It could fly by itself', 'It belonged to the king'], 'The passage says "it was the biggest, greenest leaf in the whole forest".'],
        ['How did Pip lose his leaf?', 'A gust of wind blew it away', ['A bird stole it', 'He dropped it in the river', 'The traveller took it'], '"A sudden gust snatched the leaf away."'],
        ['What does "vanished" mean in the passage?', 'Disappeared from sight', ['Grew bigger', 'Fell down', 'Turned brown'], 'The leaf "vanished towards the river" — it went out of sight.'],
        ['Which word best describes the traveller?', 'Kind', ['Lazy', 'Rude', 'Frightened'], 'He "knelt down" and spoke "kindly", and he waded into icy water to help.'],
        ['Why do you think the traveller ignored the icy current?', 'He cared more about helping Pip than being cold', ['He enjoyed swimming', 'He did not notice the water', 'He wanted to catch fish'], 'This is an inference question: he put Pip’s problem before his own comfort.'],
        ['What did Pip give the traveller?', 'A golden seed', ['A green leaf', 'A rupee', 'Some dew drops'], 'The last sentence says "he gave the traveller a golden seed as a reward".'],
      ],
    },
    {
      l: 1, title: 'Fire on the Mountain',
      text: `Death Mountain is a volcano in the north-east of Hyrule. It is so hot near the top that ordinary clothes can burst into flames! Travellers must wear special flame-proof armour or drink a fireproof elixir before they climb.

The Gorons are the only people who live happily on the mountain. They are huge, rocky creatures who love to eat rocks — the tastier the better. Their favourite meal is a juicy slab of "rock roast".

Gorons are famous for their strength and their friendly nature. They often greet visitors with a booming "Hey, brother!" and a slap on the back that can knock a person over. Although they look fierce, most Gorons are gentle and generous. Many of them work in the mines, digging for precious gems which they trade with other people across Hyrule.`,
      qs: [
        ['What is Death Mountain?', 'A volcano', ['A forest', 'A lake', 'A castle'], 'The first sentence tells us it "is a volcano".'],
        ['Why must travellers wear special armour on the mountain?', 'Because ordinary clothes can catch fire', ['Because of the snow', 'To fight the Gorons', 'Because it is the law'], '"Ordinary clothes can burst into flames!"'],
        ['What do Gorons eat?', 'Rocks', ['Fish', 'Apples', 'Gems'], 'They "love to eat rocks".'],
        ['How do Gorons often greet visitors?', 'With "Hey, brother!" and a slap on the back', ['With a bow', 'With a song', 'By giving them gems'], 'See the third paragraph.'],
        ['Which word in the passage means "kind and willing to give"?', 'generous', ['fierce', 'famous', 'booming'], '"gentle and generous" — generous means willing to give.'],
        ['What does the word "Although" tell us in the sentence "Although they look fierce, most Gorons are gentle"?', 'Their looks are different from their personality', ['They are fierce', 'They are small', 'They are angry'], '"Although" introduces a contrast: they look fierce BUT are actually gentle.'],
      ],
    },
    {
      l: 2, title: 'The Rito Archer',
      text: `High among the cliffs of the Tabantha region, the Rito village clings to a towering stone pillar. The Rito are bird people, and from the moment they can stand, their children dream of flight.

Teba was the finest archer in the village. While other warriors relied on strength, Teba relied on patience. He would hover in the freezing air for hours, waiting for the perfect moment to release an arrow. His friends teased him, calling him "the statue", yet none of them could match his aim.

One bitter winter, a monstrous storm swirled around the Divine Beast that circled the village. Arrows shot from below were snatched away by the wind. The elders gathered, their feathers ruffled with worry. "We cannot fight what we cannot reach," one of them sighed.

Teba said nothing. That night he climbed to the highest platform, spread his wings and leapt into the gale. He let the storm carry him upward, higher than any Rito had ever flown, until he was above the clouds where the air was still. Then, calmly, he drew his bow.`,
      qs: [
        ['Where is the Rito village built?', 'On a towering stone pillar', ['In a forest', 'Beside a lake', 'Inside a volcano'], '"The Rito village clings to a towering stone pillar."'],
        ['What made Teba different from the other warriors?', 'He relied on patience rather than strength', ['He was the strongest', 'He could not fly', 'He was the oldest'], '"While other warriors relied on strength, Teba relied on patience."'],
        ['Why did his friends call him "the statue"?', 'Because he stayed still for a long time while waiting', ['Because he was made of stone', 'Because he never spoke', 'Because he was very tall'], 'He would "hover … for hours, waiting" — staying still like a statue.'],
        ['What does "bitter" mean in "One bitter winter"?', 'Extremely cold and harsh', ['Tasting sour', 'Angry', 'Short'], 'Here "bitter" describes the weather — painfully cold.'],
        ['Why were the arrows from below failing?', 'The wind carried them away', ['They were broken', 'The archers missed on purpose', 'The Beast was too small'], '"Arrows shot from below were snatched away by the wind."'],
        ['"Their feathers ruffled with worry" suggests the elders were…', 'anxious', ['excited', 'sleepy', 'cheerful'], 'Ruffled feathers show they were worried and anxious.'],
        ['How did Teba use the storm to his advantage?', 'He let it carry him up above the clouds', ['He hid inside it', 'He used it to put out fires', 'He waited for it to stop'], '"He let the storm carry him upward … until he was above the clouds."'],
        ['Which word best describes Teba at the end of the passage?', 'Determined', ['Careless', 'Terrified', 'Bored'], 'He leaps into the gale without a word and calmly draws his bow — he is determined.'],
      ],
    },
    {
      l: 2, title: 'How to Cook a Hearty Meal (Instructions)',
      text: `Every adventurer needs good food! Follow these steps to make Hearty Mushroom Skewers, which restore your strength after a long day.

You will need: 3 hearty truffles, 1 pinch of rock salt, a cooking pot and a fire.

1. First, find a cooking pot. Many villages have one, but you can also find them at stables along the road.
2. Next, light the fire beneath the pot using flint or a fire arrow. Wait until the flames are steady.
3. Carefully place the truffles and salt into the pot. Do not add more than five ingredients, or the meal may turn into "Dubious Food"!
4. Stand back and wait. The pot will bubble and jingle as the ingredients cook.
5. Finally, collect your skewers. Eat them straight away for a warm boost, or store them for later.

Top tip: cooking during a Blood Moon can create extra-powerful meals — but beware of the monsters it brings back to life!`,
      qs: [
        ['What type of text is this?', 'Instructions', ['A poem', 'A diary', 'A letter'], 'It has a list of things you need and numbered steps — features of instructions.'],
        ['What is the purpose of the meal?', 'To restore strength', ['To make you invisible', 'To keep you cold', 'To attract monsters'], '"…which restore your strength after a long day."'],
        ['What is the FIRST thing you should do?', 'Find a cooking pot', ['Light the fire', 'Add the truffles', 'Wait for the Blood Moon'], 'Step 1: "First, find a cooking pot."'],
        ['Why do some words in the steps, such as "First", "Next" and "Finally", appear?', 'To show the order of the steps', ['To make it rhyme', 'To describe the food', 'To name the ingredients'], 'These are time connectives (sequencing words).'],
        ['What could happen if you add too many ingredients?', 'The meal may become "Dubious Food"', ['The pot will explode', 'The fire will go out', 'The meal will taste better'], 'See step 3.'],
        ['Why should you be careful during a Blood Moon?', 'Monsters come back to life', ['The pot stops working', 'Food goes bad', 'The fire goes out'], '"…beware of the monsters it brings back to life!"'],
      ],
    },
    {
      l: 3, title: 'Memories of the Princess',
      text: `For a hundred years the castle had been wrapped in a writhing, crimson darkness. Those who dared to look upon it from the surrounding hills described it as a wound in the land — something that refused to heal.

Yet within that darkness, a single light endured. Princess Zelda, who had once doubted every one of her abilities, now held the Calamity at bay through sheer force of will. She had prayed at every sacred spring, studied every ancient text, and been met, time after time, with silence. Her father had despaired of her; her own heart had questioned her. And still she persisted.

It is tempting to imagine that her power arrived like a thunderbolt — sudden and complete. The truth is more ordinary, and perhaps more inspiring. Her strength was built from a thousand small failures, each one teaching her something the last had not. When the moment finally came, it was not luck that awakened her power, but the stubborn love she felt for the people she was trying to protect.

Now she waited. Somewhere, in a chamber far beneath a distant plateau, a young knight was stirring.`,
      qs: [
        ['How long had the castle been surrounded by darkness?', 'A hundred years', ['Ten years', 'A thousand years', 'One night'], '"For a hundred years the castle had been wrapped in … darkness."'],
        ['The castle is described as "a wound in the land". What technique is this?', 'Metaphor', ['Simile', 'Onomatopoeia', 'Alliteration'], 'It says the castle IS a wound, without "like" or "as" — a metaphor.'],
        ['What does "endured" mean in "a single light endured"?', 'Continued to exist', ['Went out', 'Grew brighter', 'Moved away'], 'The light lasted / kept going in spite of the darkness.'],
        ['What does the passage suggest about Zelda before she gained her power?', 'She doubted herself and failed many times', ['She was always confident', 'She never tried', 'She was given power at birth'], '"…who had once doubted every one of her abilities" and "a thousand small failures".'],
        ['According to the writer, what finally awakened Zelda’s power?', 'Her love for the people she protected', ['Pure luck', 'A thunderbolt', 'Her father’s command'], '"…it was not luck … but the stubborn love she felt for the people…"'],
        ['Why does the writer call the truth "more ordinary, and perhaps more inspiring"?', 'Because anyone can learn from small failures, which is encouraging', ['Because Zelda was ordinary', 'Because the story is boring', 'Because thunderbolts are rare'], 'The writer suggests that growing through many small failures is something we can all do — that’s why it inspires.'],
        ['Who is the "young knight" in the final paragraph most likely to be?', 'The hero who will come to save Zelda', ['Zelda’s father', 'A guard in the castle', 'Calamity Ganon'], 'The ending hints that a hero is waking up to begin the quest.'],
        ['Which word best describes the mood of the final paragraph?', 'Hopeful', ['Comic', 'Angry', 'Hopeless'], 'After the darkness, a knight "stirring" suggests rescue is coming — hope.'],
      ],
    },
    {
      l: 3, title: 'Letter from Hateno',
      text: `Hateno Village
Friday 14th

Dear Purah,

I am writing to tell you about the extraordinary events of this week, which I suspect you will find difficult to believe.

On Tuesday morning, the ancient furnace at the top of the hill — dark for as long as anyone can remember — suddenly burst into blue flame. The villagers were astonished; several of the older residents refused to go near it, muttering that it was a bad omen. I, however, recognised the colour immediately from your research notes. It is undoubtedly the Sheikah flame.

I must confess I was rather nervous to investigate alone, so I persuaded my assistant to accompany me. We found that the furnace is connected to a strange pillar that hums when touched. I have made detailed sketches, which I enclose with this letter.

Please reply as soon as you can. If my theory is correct, this discovery could change everything we understand about the old technology.

With warmest regards,
Symin`,
      qs: [
        ['What type of text is this?', 'A letter', ['A newspaper report', 'A diary', 'A set of instructions'], 'It has an address, date, "Dear…" greeting and a sign-off.'],
        ['On which day did the furnace light up?', 'Tuesday', ['Friday', 'Monday', 'It does not say'], '"On Tuesday morning, the ancient furnace … suddenly burst into blue flame."'],
        ['Why did some older villagers refuse to go near the furnace?', 'They thought it was a sign of bad luck', ['It was too hot', 'It was locked', 'Symin told them not to'], '"…muttering that it was a bad omen." An omen is a sign of the future.'],
        ['How did Symin recognise the flame?', 'From Purah’s research notes', ['From an old song', 'He had seen it before', 'A villager told him'], '"I recognised the colour immediately from your research notes."'],
        ['Which word could replace "astonished" without changing the meaning?', 'amazed', ['bored', 'annoyed', 'relieved'], 'Astonished means very surprised — amazed.'],
        ['What does "I must confess" tell us about Symin?', 'He is admitting something slightly embarrassing', ['He is guilty of a crime', 'He is very brave', 'He is telling a lie'], 'To "confess" here means to admit — he admits being nervous.'],
        ['What has Symin included with the letter?', 'Detailed sketches', ['A piece of the pillar', 'Some blue flame', 'A map'], '"I have made detailed sketches, which I enclose with this letter."'],
        ['What is the main purpose of the letter?', 'To report a discovery and ask for Purah’s reply', ['To complain about the villagers', 'To invite Purah to a party', 'To describe Hateno’s weather'], 'He describes what happened and ends "Please reply as soon as you can."'],
      ],
    },
  ];
  topics.push({
    id: 'e-comp', name: 'Reading Comprehension', shrine: 'Sheem Dag Shrine', icon: '🔍',
    lesson: `<p>Comprehension tests whether you <b>understand</b> what you read.</p>
      <p>1️⃣ Read the whole passage <b>carefully</b> first. 2️⃣ Read each question, then <b>scan back</b> to find the part of the text that answers it. 3️⃣ For "why" or "suggests" questions, the answer isn't written down — you need to <b>infer</b> it from clues (like a detective!).</p>
      <p>Always check every option — the wrong ones often use words copied from the text to trick you.</p>`,
    passages: PASSAGES,
    // Comprehension trials use a whole passage; gen() is used for mixed battles (one random question).
    gen(lv) { const p = pick(PASSAGES.filter(x => x.l <= lv)); return this.fromPassage(p, pick(p.qs)); },
    fromPassage(p, q) {
      const r = mc(q[0], q[1], q[2], q[3]);
      r.passage = `<h4>${esc(p.title)}</h4>${p.text.split('\n\n').map(par => `<p>${esc(par).replace(/\n/g, '<br>')}</p>`).join('')}`;
      return r;
    },
    // avoid: titles of recently read passages, so the same story doesn't come round again straight away
    trial(lv, avoid = []) {
      const opts = PASSAGES.filter(x => x.l === lv); const pool = opts.length ? opts : PASSAGES;
      const fresh = pool.filter(p => !avoid.includes(p.title));
      const p = pick(fresh.length ? fresh : pool);
      const list = p.qs.map(q => () => this.fromPassage(p, q)); list.title = p.title; return list;
    },
  });

  window.CONTENT = window.CONTENT || {};
  window.CONTENT.english = topics;
})();
