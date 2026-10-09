// Everything you can own: gear, consumables, ingredients, recipes, cosmetics, horse gear, house decor and side quests.
// Gear perks only boost rewards (rupees, XP, Korok luck, drops) or boss battles — never the difficulty of shrine questions.
(function () {
  const C = {};

  /* ---------- Weapons: boss damage + slash trail. Elemental blades are super effective against one Blight. ---------- */
  C.WEAPONS = [
    { id: 'traveler', name: 'Traveller\'s Sword', emoji: '🗡️', dmg: 10, price: 0, trail: '#ffffff', blade: '#d7dde4', hilt: '#7a5230' },
    { id: 'boko', name: 'Boko Club', emoji: '🏏', dmg: 11, price: 80, trail: '#c8a06a', blade: '#a8794a', hilt: '#5a3a22', desc: 'Made from a Bokoblin\'s favourite tree branch.' },
    { id: 'soldier', name: 'Soldier\'s Broadsword', emoji: '⚔️', dmg: 13, price: 250, trail: '#e8f0ff', blade: '#dfe6ee', hilt: '#4a5a7a' },
    { id: 'knight', name: 'Knight\'s Claymore', emoji: '⚜️', dmg: 15, price: 600, trail: '#e8f0ff', blade: '#e6ecf2', hilt: '#2f4a8a' },
    { id: 'flame', name: 'Flameblade', emoji: '🔥', dmg: 16, price: 1100, trail: '#ff7a2a', blade: '#ff9a5a', hilt: '#7a2010', weak: 'wind', desc: 'Leaves a trail of fire. Super effective (+25% damage) against Windblight Ganon!' },
    { id: 'frost', name: 'Frostblade', emoji: '❄️', dmg: 16, price: 1100, trail: '#9fe8ff', blade: '#c8f4ff', hilt: '#1f4f8a', weak: 'fire', desc: 'Leaves a trail of ice. Super effective (+25% damage) against Fireblight Ganon!' },
    { id: 'thunder', name: 'Thunderblade', emoji: '⚡', dmg: 16, price: 1100, trail: '#ffe866', blade: '#fff3a0', hilt: '#8a6a10', weak: 'water', desc: 'Crackles with lightning. Super effective (+25% damage) against Waterblight Ganon!' },
    { id: 'eightfold', name: 'Eightfold Blade', emoji: '🗾', dmg: 17, price: 1600, trail: '#c8e8ff', blade: '#f2f6fa', hilt: '#3a2a2a', weak: 'thunder', desc: 'A Sheikah katana. Super effective (+25% damage) against Thunderblight Ganon!' },
    { id: 'royal', name: 'Royal Guard\'s Sword', emoji: '👑', dmg: 18, price: 2200, trail: '#ffe9a0', blade: '#f3e7b0', hilt: '#c9a227' },
    { id: 'lynel', name: 'Savage Lynel Sword', emoji: '🦁', dmg: 20, price: 4000, trail: '#ff5a5a', blade: '#e8c8b0', hilt: '#6a2a1a', desc: 'Taken from the fiercest monster in Hyrule.' },
    { id: 'biggoron', name: 'Biggoron\'s Sword', emoji: '🗻', dmg: 22, price: 7500, trail: '#b8ffb0', blade: '#eef4f8', hilt: '#4a3a8a', desc: 'A gigantic blade forged by the greatest Goron smith.' },
    { id: 'goddess', name: 'Goddess Sword', emoji: '🌟', dmg: 23, price: 14000, trail: '#fff6c8', blade: '#ffffff', hilt: '#3fe0ff', desc: 'Glows with sacred light. The finest blade money can buy.' },
    // Champions' weapons: never sold. Each one is earned by getting 3 stars in every shrine of its region.
    { id: 'boulder', name: 'Boulder Breaker', emoji: '🪨', dmg: 25, price: null, mastery: 'maths', shape: 'great', trail: '#ff9a2e', blade: '#9a9488', hilt: '#c2381c', desc: 'Daruk\'s colossal two-handed blade. The strongest weapon a hero can carry, after the Master Sword.' },
    { id: 'trident', name: 'Lightscale Trident', emoji: '🔱', dmg: 24, price: null, mastery: 'english', shape: 'trident', weak: 'fire', trail: '#7fe8ff', blade: '#c8f4ff', hilt: '#c9302c', desc: 'Mipha\'s graceful spear. Super effective (+25% damage) against Fireblight Ganon.' },
    { id: 'scimitar', name: 'Scimitar of the Seven', emoji: '🌙', dmg: 24, price: null, mastery: 'nonverbal', shape: 'scimitar', weak: 'water', trail: '#ffe866', blade: '#f6ecc0', hilt: '#c9a227', desc: 'Urbosa\'s golden curved sword. Super effective (+25% damage) against Waterblight Ganon.' },
    { id: 'master', name: 'Master Sword', emoji: '✨', dmg: 26, price: null, trail: '#bff6ff', blade: '#e9f4ff', hilt: '#3159c9', desc: 'Earned, not bought. Draw it in the Lost Woods.' },
  ];

  /* ---------- Shields: block hits in boss battles (max 3) ---------- */
  C.SHIELDS = [
    { id: 'none', name: 'Pot Lid', emoji: '🍳', blocks: 0, price: 0, look: 'pot' },
    { id: 'wooden', name: 'Wooden Shield', emoji: '🪵', blocks: 1, price: 150, look: 'wood' },
    { id: 'traveler', name: 'Traveller\'s Shield', emoji: '🛡️', blocks: 1, price: 300, look: 'traveler' },
    { id: 'soldier', name: 'Soldier\'s Shield', emoji: '🔷', blocks: 1, price: 500, look: 'soldier', desc: 'Blocks 1 hit. Perfect guards also earn 10 rupees.', bonus: 10 },
    { id: 'hylian', name: 'Hylian Shield', emoji: '🔰', blocks: 2, price: 1300, look: 'hylian' },
    { id: 'royal', name: 'Royal Shield', emoji: '🏰', blocks: 2, price: 2500, look: 'royal', desc: 'Blocks 2 hits. Perfect guards earn 25 rupees.', bonus: 25 },
    { id: 'lynel', name: 'Savage Lynel Shield', emoji: '🦁', blocks: 3, price: 6000, look: 'lynel' },
    { id: 'daybreaker', name: 'Daybreaker', emoji: '☀️', blocks: 3, price: null, mastery: 'nonverbal', look: 'daybreaker', bonus: 30, reflect: 10, desc: 'Urbosa\'s golden shield. Blocks 3 hits, earns 30 rupees per perfect guard and reflects 10 damage.' },
    { id: 'mirror', name: 'Mirror Shield', emoji: '🪞', blocks: 3, price: 11000, look: 'mirror', desc: 'Blocks 3 hits and reflects light back at the Blight for 15 damage!', reflect: 15 },
  ];

  /* ---------- Armour: changes Link's look and gives reward perks. Some are side-quest rewards. ---------- */
  // perk: { rupees, xp, korok (multiplier on Korok chance), drops (+ingredients), subject: {key, rupees} }
  C.ARMOUR = [
    { id: 'tunic', name: 'Hylian Tunic', emoji: '👕', price: 0, perk: {}, desc: 'Cosy and reliable.' },
    { id: 'sheikah', name: 'Sheikah Set', emoji: '🥷', price: 300, perk: { korok: 2 }, desc: 'Koroks are twice as easy to find.' },
    { id: 'climbing', name: 'Climbing Gear', emoji: '🧗', price: 450, perk: { xp: 0.15 }, desc: '+15% XP.' },
    { id: 'champion', name: 'Champion\'s Tunic', emoji: '💙', price: 700, perk: { rupees: 0.25 }, desc: '+25% rupees.' },
    { id: 'royalguard', name: 'Royal Guard Uniform', emoji: '💂', price: 1600, perk: { drops: 1 }, desc: '+1 extra ingredient from every shrine win.' },
    { id: 'barbarian', name: 'Barbarian Armour', emoji: '🪓', price: 2800, perk: { rupees: 0.2, xp: 0.2 }, desc: '+20% rupees and +20% XP.' },
    { id: 'flamebreaker', name: 'Flamebreaker Armour', emoji: '🌋', price: null, quest: 'q-maths100', perk: { subject: 'maths', subjRupees: 0.5 }, desc: '+50% rupees in Maths. Reward from Yunobo\'s quest.' },
    { id: 'zora', name: 'Zora Armour', emoji: '🐟', price: null, quest: 'q-english100', perk: { subject: 'english', subjRupees: 0.5 }, desc: '+50% rupees in English. Reward from Sidon\'s quest.' },
    { id: 'snowquill', name: 'Snowquill Set', emoji: '🪶', price: null, quest: 'q-verbal100', perk: { subject: 'verbal', subjRupees: 0.5 }, desc: '+50% rupees in Verbal Reasoning. Reward from Teba\'s quest.' },
    { id: 'desert', name: 'Desert Voe Set', emoji: '🏜️', price: null, quest: 'q-nonverbal100', perk: { subject: 'nonverbal', subjRupees: 0.5 }, desc: '+50% rupees in Non-Verbal Reasoning. Reward from Riju\'s quest.' },
    { id: 'time', name: 'Tunic of Time', emoji: '💚', price: 5500, perk: { rupees: 0.3, xp: 0.3, korok: 1.5 }, desc: 'The classic green tunic. +30% rupees, +30% XP and luckier Koroks.' },
    { id: 'wild', name: 'Tunic of the Wild', emoji: '🌌', price: 9000, perk: { rupees: 0.4, xp: 0.4, korok: 1.5, drops: 1 }, desc: '+40% rupees, +40% XP, luckier Koroks and extra ingredients.' },
    { id: 'deity', name: 'Fierce Deity Armour', emoji: '👹', price: 15000, perk: { rupees: 0.5, xp: 0.5, korok: 2, drops: 2 }, desc: 'The legendary armour. +50% rupees and XP, Koroks everywhere, extra ingredients.' },
  ];
  // Great Fairy upgrades: each level multiplies the armour perk by 1 + 0.25 × level
  C.FAIRY_COSTS = [
    { rupees: 150, mats: { jelly: 3 } },
    { rupees: 400, mats: { bokohorn: 3, keesewing: 2 } },
    { rupees: 1000, mats: { lizaltail: 2, moblinhorn: 2 } },
    { rupees: 2500, mats: { screw: 3, lynelhoof: 1 } },
  ];
  C.FAIRY_OPEN = 750;

  /* ---------- Consumables ---------- */
  C.ITEMS = [
    { id: 'hearty', name: 'Hearty Elixir', emoji: '❤️', desc: '+3 extra hearts in your next boss battle.', price: 40 },
    { id: 'hasty', name: 'Hasty Elixir', emoji: '💨', desc: '+20 seconds on every timer in your next battle.', price: 30 },
    { id: 'mighty', name: 'Mighty Elixir', emoji: '💪', desc: '+25% sword damage in your next boss battle.', price: 60 },
    { id: 'fairy', name: 'Fairy', emoji: '🧚', desc: 'If you run out of hearts, a fairy revives you with 3 hearts.', price: 90 },
    { id: 'bombarrow', name: 'Bomb Arrows', emoji: '🏹', desc: 'Boss battles: next correct answer deals double damage.', price: 35 },
    { id: 'ticket', name: 'Adventure Ticket', emoji: '🎫', desc: 'Play one mini-game or horse race. You also earn these from shrines!', price: 60 },
    { id: 'luckycharm', name: 'Lucky Clover', emoji: '🍀', desc: 'Your next 3 shrine wins drop double ingredients.', price: 120 },
    { id: 'goldnugget', name: 'Gold Nugget', emoji: '🪙', desc: 'Sell it later to Beedle for 300 rupees… or keep it as treasure!', price: 320 },
  ];

  /* ---------- Ingredients & materials ---------- */
  // tag: cooking effect it adds; kind: food group for recipes; value: sell value
  C.INGREDIENTS = [
    { id: 'apple', name: 'Apple', emoji: '🍎', kind: 'fruit', value: 3, price: 6 },
    { id: 'berry', name: 'Wildberry', emoji: '🫐', kind: 'fruit', value: 3, price: 8 },
    { id: 'banana', name: 'Mighty Banana', emoji: '🍌', kind: 'fruit', tag: 'mighty', value: 6 },
    { id: 'melon', name: 'Hydromelon', emoji: '🍈', kind: 'fruit', tag: 'chilly', value: 6 },
    { id: 'voltfruit', name: 'Voltfruit', emoji: '🌵', kind: 'fruit', tag: 'electro', value: 6 },
    { id: 'pepper', name: 'Spicy Pepper', emoji: '🌶️', kind: 'veg', tag: 'spicy', value: 5 },
    { id: 'carrot', name: 'Swift Carrot', emoji: '🥕', kind: 'veg', tag: 'hasty', value: 5, price: 15 },
    { id: 'radish', name: 'Hearty Radish', emoji: '🥬', kind: 'veg', tag: 'hearty', value: 8 },
    { id: 'shroom', name: 'Hylian Shroom', emoji: '🍄', kind: 'mushroom', value: 3, price: 8 },
    { id: 'truffle', name: 'Hearty Truffle', emoji: '🥔', kind: 'mushroom', tag: 'hearty', value: 8 },
    { id: 'meat', name: 'Raw Meat', emoji: '🥩', kind: 'meat', value: 8, price: 18 },
    { id: 'bird', name: 'Raw Bird Drumstick', emoji: '🍗', kind: 'meat', value: 8 },
    { id: 'fish', name: 'Hyrule Bass', emoji: '🐟', kind: 'fish', value: 7, price: 16 },
    { id: 'salmon', name: 'Hearty Salmon', emoji: '🐠', kind: 'fish', tag: 'hearty', value: 12 },
    { id: 'crab', name: 'Ironshell Crab', emoji: '🦀', kind: 'fish', value: 9 },
    { id: 'rice', name: 'Hylian Rice', emoji: '🍚', kind: 'grain', value: 4, price: 10 },
    { id: 'wheat', name: 'Tabantha Wheat', emoji: '🌾', kind: 'grain', value: 4, price: 10 },
    { id: 'butter', name: 'Goat Butter', emoji: '🧈', kind: 'dairy', value: 4, price: 10 },
    { id: 'milk', name: 'Fresh Milk', emoji: '🥛', kind: 'dairy', value: 4, price: 10 },
    { id: 'egg', name: 'Bird Egg', emoji: '🥚', kind: 'egg', value: 4, price: 8 },
    { id: 'sugar', name: 'Cane Sugar', emoji: '🍬', kind: 'sweet', value: 4, price: 10 },
    { id: 'honey', name: 'Courser Bee Honey', emoji: '🍯', kind: 'sweet', tag: 'hearty', value: 10 },
    { id: 'salt', name: 'Rock Salt', emoji: '🧂', kind: 'salt', value: 2, price: 5 },
  ];
  C.MATERIALS = [
    { id: 'jelly', name: 'Chuchu Jelly', emoji: '🟢', value: 5 },
    { id: 'keesewing', name: 'Keese Wing', emoji: '🦇', value: 6 },
    { id: 'bokohorn', name: 'Bokoblin Horn', emoji: '🦴', value: 8 },
    { id: 'lizaltail', name: 'Lizalfos Tail', emoji: '🦎', value: 12 },
    { id: 'moblinhorn', name: 'Moblin Horn', emoji: '📯', value: 12 },
    { id: 'screw', name: 'Ancient Screw', emoji: '⚙️', value: 20 },
    { id: 'lynelhoof', name: 'Lynel Hoof', emoji: '🐾', value: 40 },
  ];
  // What each region's shrines tend to drop
  C.REGION_DROPS = {
    plateau: ['apple', 'shroom', 'meat', 'bird', 'wheat'],
    maths: ['pepper', 'meat', 'salt', 'truffle', 'banana'],
    english: ['fish', 'salmon', 'crab', 'rice', 'radish'],
    verbal: ['bird', 'egg', 'wheat', 'berry', 'milk'],
    nonverbal: ['melon', 'voltfruit', 'butter', 'sugar', 'honey'],
  };
  // What each monster leaves behind
  C.FOE_DROPS = { Chuchu: 'jelly', Keese: 'keesewing', Bokoblin: 'bokohorn', Lizalfos: 'lizaltail', Moblin: 'moblinhorn', Guardian: 'screw', Lynel: 'lynelhoof' };

  /* ---------- Recipes (checked top to bottom; first match wins) ---------- */
  // need: food groups that must be present; only: if set, every ingredient must be from these groups
  C.RECIPES = [
    { id: 'applepie', name: 'Apple Pie', emoji: '🥧', need: ['grain', 'dairy', 'sweet', 'fruit'], ids: ['apple'], bonus: 30 },
    { id: 'eggtart', name: 'Egg Tart', emoji: '🥮', need: ['grain', 'egg', 'sweet', 'dairy'], bonus: 28 },
    { id: 'carrotcake', name: 'Carrot Cake', emoji: '🍰', need: ['grain', 'veg', 'sweet', 'dairy'], ids: ['carrot'], bonus: 30 },
    { id: 'fruitcake', name: 'Fruitcake', emoji: '🎂', need: ['grain', 'sweet', 'fruit'], bonus: 24 },
    { id: 'curry', name: 'Meat Curry', emoji: '🍛', need: ['grain', 'meat', 'veg'], ids: ['pepper'], bonus: 26 },
    { id: 'meatrice', name: 'Meat and Rice Bowl', emoji: '🍱', need: ['grain', 'meat'], ids: ['rice'], bonus: 18 },
    { id: 'seafoodrice', name: 'Seafood Fried Rice', emoji: '🍤', need: ['grain', 'fish'], ids: ['rice'], bonus: 18 },
    { id: 'omelet', name: 'Omelette', emoji: '🍳', need: ['egg'], only: ['egg', 'salt', 'dairy'], bonus: 8 },
    { id: 'creamysoup', name: 'Creamy Meat Soup', emoji: '🍲', need: ['meat', 'dairy'], bonus: 20 },
    { id: 'mushroomsoup', name: 'Cream of Mushroom Soup', emoji: '🥣', need: ['mushroom', 'dairy'], bonus: 16 },
    { id: 'crabstir', name: 'Crab Stir-fry', emoji: '🥘', need: ['fish', 'salt'], ids: ['crab'], bonus: 16 },
    { id: 'peppersteak', name: 'Pepper Steak', emoji: '🥩', need: ['meat', 'veg'], ids: ['pepper'], bonus: 14 },
    { id: 'meatstew', name: 'Meat Stew', emoji: '🫕', need: ['meat', 'veg'], bonus: 14 },
    { id: 'saltmeat', name: 'Salt-Grilled Meat', emoji: '🍖', need: ['meat', 'salt'], only: ['meat', 'salt'], bonus: 10 },
    { id: 'saltfish', name: 'Salt-Grilled Fish', emoji: '🐡', need: ['fish', 'salt'], only: ['fish', 'salt'], bonus: 10 },
    { id: 'meatmush', name: 'Meat and Mushroom Skewer', emoji: '🍢', need: ['meat', 'mushroom'], bonus: 12 },
    { id: 'meatskewer', name: 'Meat Skewer', emoji: '🍖', need: ['meat'], only: ['meat'], bonus: 4 },
    { id: 'fishskewer', name: 'Fish Skewer', emoji: '🍡', need: ['fish'], only: ['fish'], bonus: 4 },
    { id: 'honeyapple', name: 'Honeyed Apple', emoji: '🍏', need: ['sweet', 'fruit'], ids: ['honey'], bonus: 12 },
    { id: 'honeycandy', name: 'Honey Candy', emoji: '🍭', need: ['sweet'], only: ['sweet'], ids: ['honey'], bonus: 8 },
    { id: 'mushroomskewer', name: 'Mushroom Skewer', emoji: '🍄', need: ['mushroom'], only: ['mushroom'], bonus: 3 },
    { id: 'veggies', name: 'Glazed Veggies', emoji: '🥗', need: ['veg'], only: ['veg', 'salt', 'sweet'], bonus: 6 },
    { id: 'simmeredfruit', name: 'Simmered Fruit', emoji: '🍇', need: ['fruit'], only: ['fruit'], bonus: 4 },
    { id: 'mixedskewer', name: 'Hylian Hodgepodge', emoji: '🥙', need: [], bonus: 6 },
  ];
  C.EFFECTS = {
    hearty: { name: 'Hearty', icon: '❤️', desc: '+2 extra hearts in your next boss battle.', boss: true },
    mighty: { name: 'Mighty', icon: '💪', desc: '+20% sword damage in your next boss battle.', boss: true },
    hasty: { name: 'Hasty', icon: '💨', desc: '+15 seconds on timers in your next battle.', boss: true },
    spicy: { name: 'Spicy', icon: '🌶️', desc: '+50% rupees for your next 3 shrine trials.', trials: 3 },
    electro: { name: 'Electro', icon: '⚡', desc: 'Koroks twice as likely for your next 3 shrine trials.', trials: 3 },
    chilly: { name: 'Chilly', icon: '❄️', desc: '+30% XP for your next 3 shrine trials.', trials: 3 },
  };

  /* ---------- Style (pure cosmetics) ---------- */
  C.THEMES = [
    { id: 'sheikah', name: 'Sheikah Blue', emoji: '🔵', color: '#3fe0ff', price: 0 },
    { id: 'korok', name: 'Korok Green', emoji: '🟢', color: '#7ee35a', price: 400 },
    { id: 'zora', name: 'Zora Teal', emoji: '🩵', color: '#4fe8d0', price: 500 },
    { id: 'gerudo', name: 'Gerudo Crimson', emoji: '🔴', color: '#ff5a6e', price: 500 },
    { id: 'twilight', name: 'Twilight Purple', emoji: '🟣', color: '#b48bff', price: 1200 },
    { id: 'royal', name: 'Royal Gold', emoji: '🟡', color: '#ffd23d', price: 2000 },
    { id: 'triforce', name: 'Triforce Radiance', emoji: '🔺', color: '#fff0a0', price: null, mastery: 'all' },
  ];
  C.GLIDERS = [
    { id: 'hylian', name: 'Hylian Paraglider', emoji: '🪂', hue: 0, price: 0 },
    { id: 'zora', name: 'Zora Fabric', emoji: '🪂', hue: 170, price: 300 },
    { id: 'goron', name: 'Goron Fabric', emoji: '🪂', hue: 330, price: 300 },
    { id: 'rito', name: 'Rito Fabric', emoji: '🪂', hue: 90, price: 300 },
    { id: 'royal', name: 'Royal Fabric', emoji: '🪂', hue: 200, price: 900 },
    { id: 'revali', name: 'Revali\'s Fabric', emoji: '🪂', hue: 0, price: null, mastery: 'verbal' },
    { id: 'golden', name: 'Hero\'s Golden Fabric', emoji: '🪂', hue: 0, price: null, mastery: 'all' },
  ];
  C.PETS = [
    { id: 'none', name: 'No companion', emoji: '—', price: 0 },
    { id: 'dog', name: 'Hateno Dog', emoji: '🐕', price: 450, desc: 'Wags its tail and barks when you get answers right.' },
    { id: 'korok', name: 'Korok Buddy', emoji: '🌿', price: 700, desc: 'A tiny Korok who cheers you on.' },
    { id: 'chick', name: 'Rito Chick', emoji: '🐤', price: 900, desc: 'Flaps its little wings for every hit.' },
    { id: 'chuchu', name: 'Pet Chuchu', emoji: '🫧', price: 1200, desc: 'A friendly Chuchu that bounces with joy.' },
    { id: 'fairy', name: 'Fairy Friend', emoji: '🧚', price: 2200, desc: 'Sparkles around you during battle.' },
    { id: 'guardian', name: 'Mini Guardian', emoji: '🤖', price: 4500, desc: 'A tame, tiny Guardian. Its eye glows blue for you.' },
  ];
  C.SADDLES = [
    { id: 'stable', name: 'Stable Saddle', color: '#8a5a2b', price: 0 },
    { id: 'traveler', name: 'Traveller\'s Saddle', color: '#3a6a9a', price: 250 },
    { id: 'knight', name: 'Knight\'s Saddle', color: '#2f4a8a', price: 800 },
    { id: 'royal', name: 'Royal Saddle', color: '#c9a227', price: 1800 },
    { id: 'monster', name: 'Monster Saddle', color: '#6a1a4a', price: 3000 },
  ];

  /* ---------- Hateno house ---------- */
  C.HOUSE_PRICE = 2500;
  C.DECOR = [
    { id: 'bed', name: 'Cosy Bed', emoji: '🛏️', price: 300, x: 14, y: 70, desc: 'Sleep once a day for +10% XP on your next trial.' },
    { id: 'rug', name: 'Hylian Rug', emoji: '🟥', price: 150, x: 50, y: 86 },
    { id: 'table', name: 'Table & Chairs', emoji: '🪑', price: 250, x: 50, y: 70 },
    { id: 'pot', name: 'Cooking Pot', emoji: '🍲', price: 400, x: 84, y: 72, desc: 'Cook at home any time.' },
    { id: 'plant', name: 'Potted Plant', emoji: '🪴', price: 100, x: 92, y: 52 },
    { id: 'books', name: 'Bookshelf', emoji: '📚', price: 400, x: 8, y: 42 },
    { id: 'painting', name: 'Portrait of Zelda', emoji: '🖼️', price: 600, x: 34, y: 30 },
    { id: 'lamp', name: 'Chandelier', emoji: '🕯️', price: 900, x: 50, y: 12 },
    { id: 'rack', name: 'Weapon Rack', emoji: '⚔️', price: 500, x: 66, y: 30, desc: 'Shows off every weapon you own.' },
    { id: 'trophies', name: 'Trophy Shelf', emoji: '🏆', price: 700, x: 84, y: 34, desc: 'Displays a trophy for every Blight you defeat.' },
    { id: 'fire', name: 'Fireplace', emoji: '🔥', price: 800, x: 22, y: 56 },
    { id: 'korokstatue', name: 'Korok Statue', emoji: '🗿', price: 1500, x: 70, y: 60 },
    { id: 'aquarium', name: 'Zora Aquarium', emoji: '🐠', price: 2000, x: 30, y: 46 },
    // Champion trophies: only from mastering a region (3 stars in every shrine)
    { id: 'm-rudania', name: 'Vah Rudania Model', emoji: '🦎', price: null, mastery: 'maths', x: 24, y: 16 },
    { id: 'm-ruta', name: 'Vah Ruta Model', emoji: '🐘', price: null, mastery: 'english', x: 76, y: 14 },
    { id: 'm-medoh', name: 'Vah Medoh Model', emoji: '🦅', price: null, mastery: 'verbal', x: 8, y: 20 },
    { id: 'm-naboris', name: 'Vah Naboris Model', emoji: '🐪', price: null, mastery: 'nonverbal', x: 92, y: 18 },
    { id: 'm-triforce', name: 'The Triforce', emoji: '🔺', price: null, mastery: 'all', x: 60, y: 50 },
    { id: 'goldstatue', name: 'Golden Hero Statue', emoji: '🏅', price: 6000, x: 50, y: 46, desc: 'A shining statue of you. Only true heroes can afford it!' },
  ];

  /* ---------- Horses ---------- */
  C.COATS = [
    { id: 'bay', name: 'Bay', body: '#8b5a2b', mane: '#2a1a10' },
    { id: 'chestnut', name: 'Chestnut', body: '#a0522d', mane: '#6a2a10' },
    { id: 'black', name: 'Black', body: '#2b2b30', mane: '#111' },
    { id: 'white', name: 'White', body: '#ece8e0', mane: '#c8c0b0' },
    { id: 'grey', name: 'Dapple Grey', body: '#9aa0a8', mane: '#e8e8e8', spots: '#c8ccd2' },
    { id: 'palomino', name: 'Palomino', body: '#d8b26a', mane: '#f6eedc' },
    { id: 'spotted', name: 'Spotted', body: '#f2ece2', mane: '#3a2a20', spots: '#5a3a28' },
    { id: 'golden', name: 'Golden (rare)', body: '#f0c850', mane: '#fff3c4', rare: true },
  ];
  C.STABLE_CAP = 5;

  /* ---------- Region mastery: 3 stars in every shrine of a region. One-of-a-kind rewards that can't be bought. ---------- */
  C.MASTERY = {
    maths: { champion: 'Daruk', title: 'Champion of Death Mountain', reward: { weapon: 'boulder', decor: 'm-rudania', rupees: 1000 },
      lines: [['Daruk', 'Whoa, whoa, WHOA! Three stars in every single shrine on my mountain? Little guy, that\'s the stuff of legends!'], ['Daruk', 'Here, take my Boulder Breaker. Nobody else in all of Hyrule gets to swing this beauty. Hah!']] },
    english: { champion: 'Mipha', title: 'Champion of Zora\'s Domain', reward: { weapon: 'trident', decor: 'm-ruta', rupees: 1000 },
      lines: [['Mipha', 'Every shrine in Zora\'s Domain, mastered with three stars… I\'m so proud of you.'], ['Mipha', 'Please take my Lightscale Trident. I made it myself, and I want you to have it. There is no other like it.']] },
    verbal: { champion: 'Revali', title: 'Champion of Rito Village', reward: { relic: 'eaglebow', glider: 'revali', decor: 'm-medoh', rupees: 1000 },
      lines: [['Revali', 'Three stars in every shrine around Rito Village? Hmph. I suppose even I must admit… that\'s impressive.'], ['Revali', 'Take my Great Eagle Bow, and a paraglider made with my colours. Try not to embarrass me.']] },
    nonverbal: { champion: 'Urbosa', title: 'Champion of the Gerudo Desert', reward: { weapon: 'scimitar', shield: 'daybreaker', decor: 'm-naboris', rupees: 1000 },
      lines: [['Urbosa', 'Every shrine in the desert, all three stars. Now THAT is the mark of a true warrior, little one.'], ['Urbosa', 'The Scimitar of the Seven and the Daybreaker are the pride of the Gerudo. Today, they are yours.']] },
    all: { champion: 'Zelda', title: 'Hero of Hyrule', reward: { theme: 'triforce', glider: 'golden', decor: 'm-triforce', rupees: 5000 },
      lines: [['Zelda', 'You did it… three stars in every shrine, in every corner of Hyrule. No hero has ever done this before.'], ['Zelda', 'The goddess has chosen to reward you with the Triforce itself. Wear its light with pride!']] },
  };
  C.RELICS = {
    eaglebow: { name: 'Great Eagle Bow', emoji: '🏹', desc: 'Revali\'s bow. Every boss battle starts with 3 free Bomb Arrows.' },
  };

  /* ---------- Side quests ---------- */
  // goal: counter key + target. reward: { rupees, tickets, item, ingredient:{id:n}, armour, saddle, decor, pet, theme }
  C.QUESTS = [
    { id: 'q-firstshrine', npc: 'Hudson', icon: '🔨', title: 'Hudson\'s Hammer', text: 'I\'m building a town! Clear 3 shrine trials to show me you\'re a hard worker.', goal: ['trials', 3], reward: { rupees: 100, tickets: 2 } },
    { id: 'q-tame', npc: 'Stable Master', icon: '🐴', title: 'Wild at Heart', text: 'Wild horses roam Hyrule Field. Tame one and register it at my stable!', goal: ['tamed', 1], reward: { rupees: 80, ingredient: { carrot: 3 }, saddle: 'traveler' } },
    { id: 'q-cook', npc: 'Beedle', icon: '🍳', title: 'A Hungry Merchant', text: 'Thank you! Could you cook me 3 meals? Any meals will do!', goal: ['cooked', 3], reward: { rupees: 120, ingredient: { honey: 1, butter: 2 } } },
    { id: 'q-recipes', npc: 'Kilton', icon: '📖', title: 'The Recipe Collector', text: 'Discover 8 different recipes and write them in your recipe book.', goal: ['recipes', 8], reward: { rupees: 300, pet: 'chuchu' } },
    { id: 'q-combo', npc: 'Impa', icon: '🥷', title: 'Sheikah Focus', text: 'A true warrior strikes again and again. Get a 10-answer combo!', goal: ['bestStreak', 10], reward: { rupees: 200, theme: 'twilight' } },
    { id: 'q-koroks', npc: 'Hestu', icon: '🪇', title: 'Shake-Shake!', text: 'Hestu wants seeds! Find 15 Korok seeds in total.', goal: ['seedsTotal', 15], reward: { rupees: 150, pet: 'korok' } },
    { id: 'q-stars30', npc: 'Monk', icon: '🧘', title: 'Path of the Shrines', text: 'Collect 30 shrine stars across Hyrule.', goal: ['stars', 30], reward: { rupees: 500, tickets: 3 } },
    { id: 'q-stars80', npc: 'Monk', icon: '🧘', title: 'Shrine Master', text: 'Collect 80 shrine stars. Only the most dedicated heroes get this far.', goal: ['stars', 80], reward: { rupees: 1500, decor: 'goldstatue' } },
    { id: 'q-race', npc: 'Stable Master', icon: '🏇', title: 'Champion Rider', text: 'Win 3 horse races at the stable.', goal: ['racesWon', 3], reward: { rupees: 250, saddle: 'royal' } },
    { id: 'q-archery', npc: 'Teba', icon: '🎯', title: 'Eagle Eye', text: 'Score 20 points at the Flight Range.', goal: ['archeryBest', 20], reward: { rupees: 200, pet: 'chick' } },
    { id: 'q-song', npc: 'Kass', icon: '🪗', title: 'Song of the Champions', text: 'Remember a melody 8 notes long in my song game.', goal: ['songBest', 8], reward: { rupees: 200, theme: 'zora' } },
    { id: 'q-korokgame', npc: 'Korok', icon: '🍃', title: 'Hide and Seek', text: 'Yahaha! Find me 5 times in the Lost Woods leaf game!', goal: ['leafWins', 5], reward: { rupees: 120, ingredient: { honey: 2 } } },
    { id: 'q-maths100', npc: 'Yunobo', icon: '🪨', title: 'Goron Number Crunch', text: 'Goro! Answer 100 Maths questions correctly and I\'ll give you Goron armour!', goal: ['c_maths', 100], reward: { armour: 'flamebreaker' } },
    { id: 'q-english100', npc: 'Sidon', icon: '🐟', title: 'Words of the Zora', text: 'Answer 100 English questions correctly and the Zora armour is yours, my friend!', goal: ['c_english', 100], reward: { armour: 'zora' } },
    { id: 'q-verbal100', npc: 'Teba', icon: '🪶', title: 'Rito Riddles', text: 'Answer 100 Verbal Reasoning questions correctly to earn the Snowquill set.', goal: ['c_verbal', 100], reward: { armour: 'snowquill' } },
    { id: 'q-nonverbal100', npc: 'Riju', icon: '🏜️', title: 'Patterns of the Desert', text: 'Answer 100 Non-Verbal Reasoning questions correctly to earn the Desert Voe set.', goal: ['c_nonverbal', 100], reward: { armour: 'desert' } },
    { id: 'q-paper', npc: 'Purah', icon: '👩‍🔬', title: 'Purah\'s Test', text: 'Score 80% or more on one of my practice papers!', goal: ['mockBest', 80], reward: { rupees: 400, theme: 'royal' } },
    { id: 'q-bloodmoon', npc: 'Zelda', icon: '🌕', title: 'Moonlight Vigil', text: 'Survive 2 Blood Moons by beating your old mistakes.', goal: ['bloodMoons', 2], reward: { rupees: 300, item: { fairy: 2 } } },
    { id: 'q-house', npc: 'Hudson', icon: '🏠', title: 'Home Sweet Home', text: 'Buy the house in Hateno Village!', goal: ['house', 1], reward: { rupees: 200, decor: 'bed' } },
    { id: 'q-bond', npc: 'Stable Master', icon: '💞', title: 'Best Friends', text: 'Raise any horse to full bond (5 hearts).', goal: ['maxBond', 5], reward: { rupees: 300, ingredient: { carrot: 5 } } },
    { id: 'q-spend', npc: 'Beedle', icon: '💰', title: 'Big Spender', text: 'Spend 3,000 rupees in my shop. Thank you! Please come again!', goal: ['spent', 3000], reward: { rupees: 500, pet: 'dog' } },
    { id: 'q-blights', npc: 'Zelda', icon: '👑', title: 'The Four Champions', text: 'Free all four Divine Beasts.', goal: ['bosses', 4], reward: { rupees: 1000, pet: 'fairy' } },
  ];

  window.CATALOG = C;
})();
