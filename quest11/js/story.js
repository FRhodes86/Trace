// Story, names and world layout. Character/place names live here so they're easy to change.
(function () {
  const STORY = {
    gameTitle: 'Breath of Knowledge',
    gameSubtitle: 'An 11+ Quest to Save Hyrule',
    defaultHero: 'Link',
    princess: 'Zelda',
    villain: 'Calamity Ganon',
    kingdom: 'Hyrule',
    oldMan: 'the Old Man',

    intro: [
      ['???', 'Open your eyes…'],
      ['???', 'Open your eyes, {hero}…'],
      ['Zelda', 'You have slept for one hundred years. Calamity Ganon has returned, and it has spread a fog of forgetfulness across Hyrule.'],
      ['Zelda', 'Its power grows wherever knowledge is lost. Only a hero with a sharp mind can defeat it.'],
      ['Zelda', 'Four Blights now control the Divine Beasts. Each feeds on a different kind of knowledge: Maths, English, Verbal Reasoning and Non-Verbal Reasoning.'],
      ['Zelda', 'Train in the ancient shrines. Grow stronger. Free the Champions… and then come and find me.'],
      ['Zelda', 'Please, {hero}. I believe in you. Hyrule believes in you.'],
    ],
    plateauIntro: [
      ['Old Man', 'Ah, a traveller! You look like you have just woken from a very long nap.'],
      ['Old Man', 'This is the Great Plateau. Four shrines lie hidden here, one for each of the four kinds of knowledge.'],
      ['Old Man', 'Complete all four and each will give you a Sheikah Rune. Do that, and I shall give you my paraglider so you can leave this place.'],
    ],
    plateauDone: [
      ['Old Man', 'Well done, young one! You have mastered all four runes.'],
      ['Old Man', 'As promised — take my paraglider. With it you can soar to any corner of Hyrule.'],
      ['Old Man', 'I was once King of Hyrule. Please… free the Divine Beasts and save my daughter, Zelda.'],
      ['Old Man', 'Visit the Goddess Statue to turn Spirit Orbs into Heart Containers, Hestu to grow your pouch, and Beedle to buy supplies. Off you go!'],
    ],

    // One region per GL 11+ subject
    regions: [
      {
        id: 'maths', subject: 'maths', name: 'Death Mountain', emoji: '🌋', color: '#ff6a3d',
        beast: 'Divine Beast Vah Rudania', beastEmoji: '🦎', boss: 'Fireblight Ganon', bossEmoji: '👹', element: 'fire',
        champion: 'Daruk', championEmoji: '🪨', ability: 'daruk',
        shrines: ['Rota Ooh', 'Toto Sah', 'Shee Venath', 'Shee Vaneer', 'Hila Rao', 'Kaam Ya\'tak', 'Dah Kaso', 'Ka\'o Makagh', 'Kuh Takkar', 'Sah Dahaj'],
        intro: [['Yunobo', 'Goro! The Divine Beast is raining fire on Goron City! Fireblight Ganon feeds on forgotten numbers, goro.'], ['Yunobo', 'Train in the shrines on the mountain and sharpen your Maths — then we can take it down together!']],
        bossIntro: 'Fireblight Ganon roars from the heart of Vah Rudania. Flames twist into numbers around it…',
        victory: [['Daruk', 'Hah! Now THAT is what I call a big brain, little guy! You freed me!'], ['Daruk', 'Take my power — Daruk\'s Protection. It\'ll shield you from your first mistake in every battle!']],
      },
      {
        id: 'english', subject: 'english', name: 'Zora\'s Domain', emoji: '🌊', color: '#3db8ff',
        beast: 'Divine Beast Vah Ruta', beastEmoji: '🐘', boss: 'Waterblight Ganon', bossEmoji: '👺', element: 'water',
        champion: 'Mipha', championEmoji: '🐟', ability: 'mipha',
        shrines: ['Mozo Shenno', 'Bosh Kala', 'Ta\'loh Naeg', 'Ze Kasho', 'Myahm Agana', 'Kah Mael', 'Ree Dahee', 'Sheem Dag'],
        intro: [['Sidon', 'Ah, the hero! Vah Ruta has flooded our home with endless rain. Waterblight Ganon is drowning the words of our people!'], ['Sidon', 'Master the shrines of language — spelling, grammar, reading — and together we shall calm the waters!']],
        bossIntro: 'Waterblight Ganon rises in the flooded chamber of Vah Ruta, its spear made of jumbled words…',
        victory: [['Mipha', '{hero}… it\'s really you. Thank you for freeing me.'], ['Mipha', 'Take my healing power — Mipha\'s Grace. If you ever fall in battle, it will bring you back once more.']],
      },
      {
        id: 'verbal', subject: 'verbal', name: 'Rito Village', emoji: '🪶', color: '#7ad97a',
        beast: 'Divine Beast Vah Medoh', beastEmoji: '🦅', boss: 'Windblight Ganon', bossEmoji: '👺', element: 'wind',
        champion: 'Revali', championEmoji: '🏹', ability: 'revali',
        shrines: ['Ha Dahamar', 'Wahgo Katta', 'Kaya Wan', 'Shai Utoh', 'Mijah Rokee', 'Kam Urog', 'Tena Ko\'sah', 'Ishto Soh', 'Tah Muhl', 'Sha Warvo'],
        intro: [['Teba', 'Hylian. Vah Medoh circles our village in a storm of riddles and codes. Windblight Ganon twists words into puzzles.'], ['Teba', 'Prove your wits in the shrines of reasoning. Then fly with me to the Beast.']],
        bossIntro: 'Windblight Ganon hovers in the storm above Vah Medoh, hurling letter-codes on the wind…',
        victory: [['Revali', 'Hmph. Not bad… for a Hylian. I suppose you\'ve earned this.'], ['Revali', 'Revali\'s Gale! Once per battle, if you get a question wrong, my gale gives you a second try. Don\'t waste it.']],
      },
      {
        id: 'nonverbal', subject: 'nonverbal', name: 'Gerudo Desert', emoji: '🏜️', color: '#ffd23d',
        beast: 'Divine Beast Vah Naboris', beastEmoji: '🐪', boss: 'Thunderblight Ganon', bossEmoji: '👹', element: 'thunder',
        champion: 'Urbosa', championEmoji: '🗡️', ability: 'urbosa',
        shrines: ['Daka Tuss', 'Dow Na\'eh', 'Chaas Qeta', 'Jee Noh', 'Kema Zoos', 'Hia Miu', 'Akh Va\'quot', 'Voo Lota'],
        intro: [['Riju', 'Vah Naboris walks the sands in a thunderstorm of shapes. Thunderblight Ganon scrambles every pattern it touches.'], ['Riju', 'The desert shrines will train your eyes — rotations, reflections, sequences. Show me what you can do, Hylian.']],
        bossIntro: 'Thunderblight Ganon flickers in and out of sight inside Vah Naboris, its shield crackling with spinning shapes…',
        victory: [['Urbosa', 'Ha! You remind me of a little bird I once knew. Thank you, {hero}.'], ['Urbosa', 'Take Urbosa\'s Fury. Call on it and your next strike will hit with the force of lightning!']],
      },
    ],

    plateauShrines: [
      { name: 'Oman Au', subject: 'maths', rune: 'magnesis' },
      { name: 'Ja Baij', subject: 'english', rune: 'bomb' },
      { name: 'Owa Daim', subject: 'verbal', rune: 'stasis' },
      { name: 'Keh Namut', subject: 'nonverbal', rune: 'cryonis' },
    ],

    runes: {
      magnesis: { name: 'Magnesis', emoji: '🧲', desc: 'Pulls two wrong answers out of the way.' },
      bomb: { name: 'Remote Bomb', emoji: '💣', desc: 'Your next correct answer deals double damage (or earns triple rupees in a shrine).' },
      stasis: { name: 'Stasis', emoji: '⏸️', desc: 'Freezes the timer for this question.' },
      cryonis: { name: 'Cryonis', emoji: '🧊', desc: 'Freezes this question and swaps it for a new one — no penalty.' },
    },
    champions: {
      daruk: { name: 'Daruk\'s Protection', emoji: '🛡️', desc: 'Automatically blocks your first wrong answer in each battle.' },
      mipha: { name: 'Mipha\'s Grace', emoji: '💧', desc: 'If your hearts run out, you are revived with full hearts (once per battle).' },
      revali: { name: 'Revali\'s Gale', emoji: '🌬️', desc: 'Once per battle, a wrong answer gives you a second try instead.' },
      urbosa: { name: 'Urbosa\'s Fury', emoji: '⚡', desc: 'Once per battle: your next correct answer hits for triple damage (triple rupees in shrines).' },
    },

    calamity: {
      name: 'Calamity Ganon', emoji: '🐗', beastName: 'Dark Beast Ganon', beastEmoji: '🐉',
      intro: [
        ['Zelda', '{hero}! You\'ve freed all four Champions. Their Divine Beasts are aiming at the castle!'],
        ['Zelda', 'Calamity Ganon will use every kind of question against you — Maths, English and Reasoning all at once.'],
        ['Zelda', 'Stay calm. Read carefully. Check your answers. You are ready.'],
      ],
      phase2: 'Calamity Ganon screams and grows stronger! The questions become harder…',
      phase3: [['Zelda', 'It has become Dark Beast Ganon! {hero} — take the Bow of Light! Every correct answer fires a Light Arrow!']],
      ending: [
        ['Zelda', 'You did it… Calamity Ganon is sealed away. The fog of forgetfulness is lifting from Hyrule.'],
        ['Zelda', 'You didn\'t win with a sword alone. You won by practising, by learning from every mistake, and by never giving up.'],
        ['Zelda', 'Thank you, {hero}. Shall we go home?'],
      ],
    },

    memories: [
      { id: 'm-plateau', title: 'Memory: The Paraglider', text: 'You remember a field of flowers and a princess laughing as she tried to name every plant in Hyrule. "Knowledge is a kind of courage," she said. "The more you understand, the less there is to fear."' },
      { id: 'm-maths', title: 'Memory: Daruk\'s Training', text: 'Daruk once counted the boulders on Death Mountain for fun — all 12,846 of them. "Numbers are like rocks, little guy," he laughed. "Stack \'em up the right way and they\'ll hold anything!"' },
      { id: 'm-english', title: 'Memory: Mipha\'s Stories', text: 'Mipha read stories to the Zora children every evening by the reservoir. "Every word is a little light," she said softly. "Put enough of them together and you can see anything."' },
      { id: 'm-verbal', title: 'Memory: Revali\'s Riddle', text: '"Riddle me this," Revali smirked. "What has keys but opens no locks?" You both looked at the piano in the corner. He groaned when you got it straight away.' },
      { id: 'm-nonverbal', title: 'Memory: Urbosa\'s Lesson', text: 'Urbosa traced shapes in the desert sand. "See how this pattern turns? A warrior who sees the pattern sees the next strike before it lands."' },
      { id: 'm-sword', title: 'Memory: The Master Sword', text: 'In the Lost Woods the sword whispered to you: "Strength comes not from the blade, but from the mind of the one who carries it."' },
      { id: 'm-final', title: 'Memory: Zelda\'s Promise', text: '"When this is over," Zelda said, "I want to learn everything. Will you help me?" You nodded. The two of you have been learning ever since.' },
    ],

    korokLines: ['Yahaha! You found me!', 'Ya-ha-ha! You got me!', 'Whoa, you found me!', 'Yahaha! Clever!'],
    praise: ['Brilliant!', 'Excellent!', 'Superb!', 'Spot on!', 'Amazing!', 'Well done!', 'Perfect!', 'Fantastic!'],
    encourage: ['Not quite — read the explanation and you\'ll get it next time!', 'Mistakes make you stronger. Check how it works below.', 'So close! Every hero learns from a stumble.', 'Don\'t give up — even Link fell off cliffs while learning to climb!'],
  };

  window.STORY = STORY;
})();
