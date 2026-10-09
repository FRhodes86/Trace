# Breath of Knowledge: an 11+ Quest to Save Hyrule

A fan-made, *Breath of the Wild*-style learning game that takes a child (aimed at about age 8 upwards) through the whole **GL Assessment 11+** curriculum: **English, Maths, Verbal Reasoning and Non-Verbal Reasoning**.

The hero (named by the player, default "Link") wakes on the Great Plateau and has to free four Divine Beasts from their Blights before facing **Calamity Ganon** and rescuing **Princess Zelda**.

## How to play

- **Easiest:** open `dist/breath-of-knowledge.html` in any modern browser. It's one self-contained file.
- **From source:** open `index.html`, or serve the folder (`npx serve quest11`).
- Progress saves automatically in the browser. Settings → *Copy save code* moves a save to another device.

## Install it as an app (phone or tablet, with its own icon)

1. Run `node tools/build-pwa.js`, or use the ready-made `dist/breath-of-knowledge-app.zip`.
2. Unzip it and upload the folder to a free static host. The easiest is **https://app.netlify.com/drop**: drag the folder onto the page and it gives you a web address.
3. Open that address on each device and add it to the home screen:
   - **iPhone or iPad (Safari):** tap Share, then **Add to Home Screen**.
   - **Android (Chrome):** tap ⋮, then **Install app** (or **Add to Home screen**).
4. It opens full-screen with the Triforce icon, like a normal app. After the first visit it works offline.

## Game structure

| Region | Subject | Shrines (topics) | Boss | Champion power earned |
|---|---|---|---|---|
| Great Plateau | All four (tutorial) | 4 tutorial shrines | none | 4 Sheikah Runes, then the paraglider |
| Death Mountain | Maths | 10 | Fireblight Ganon | Daruk's Protection: blocks your first mistake |
| Zora's Domain | English | 8 | Waterblight Ganon | Mipha's Grace: one revive per battle |
| Rito Village | Verbal Reasoning | 10 | Windblight Ganon | Revali's Gale: one second try per battle |
| Gerudo Desert | Non-Verbal Reasoning | 8 | Thunderblight Ganon | Urbosa's Fury: triple damage |
| Hyrule Castle | Everything | none | Calamity Ganon (3 phases) | the ending |

- Each **shrine** opens with a short lesson from the Monk (with a 🔊 *Read to me* button), then offers three **trials**:
  - ★ **Novice**: about Year 3/4
  - ★★ **Adept**: about Year 5
  - ★★★ **Master**: 11+ standard, timed
- Every trial is a fight against a monster: Chuchus and Keese at Novice, Bokoblins, Lizalfos and Moblins at Adept, Guardian Scouts and Lynels at Master. Land 6 hits (correct answers) before it lands 3 on you. A wrong answer always shows a worked explanation.
- Shrines unlock one after another. A region's **boss** unlocks once you've cleared Trial 1 everywhere in that region and have an average of 2★.
- Boss battles: each correct answer is a sword strike. Combos deal extra damage, and the questions get harder when the boss is enraged. They lean towards the child's **weakest topics**.

## Look and feel

- Everything is drawn in code, with no image files:
  - Hand-drawn SVG characters: Link (his outfit, sword and shield change with what you equip), Zelda, the Old Man, the Monks, Koroks, Hestu and Beedle.
  - Every item has its own drawn icon in the game's style, replacing the emoji: all 16 weapons, 9 shields, 13 armour sets, elixirs, the fairy, bomb arrows, 23 cooking ingredients, monster parts, 24 plated meals, saddles and house furniture.
  - Nine kinds of monster, the four Blights, Calamity Ganon and Dark Beast Ganon.
- Each region has an animated painted landscape on a canvas:
  - Embers and lava glow on Death Mountain, rain at Zora's Domain, snow at Rito Village.
  - Blowing sand and lightning in Gerudo, swirling malice at the castle, and a Blood Moon.
- Combat animations:
  - Sword swings with slash trails, hit sparks and screen shake.
  - Monsters lunge or fire elemental projectiles, and puff into smoke when defeated.
  - Hearts shatter, the timer is a Breath of the Wild–style stamina wheel, and combos trigger "Flurry Rush" banners.
- Reward moments:
  - "You got…" item-get fanfares with light rays.
  - Treasure chests that open with a burst of loot, and rupees that fly into your counter.
  - Hero Rank level-ups and a daily treasure chest.
- The map is an illustrated Hyrule:
  - Clouds cover unexplored regions until you visit, which activates a Sheikah Tower.
  - Divine Beasts glow red while corrupted and blue once freed, and freed beasts fire beams at the castle.
  - Link paraglides between locations.
- Music is generated live. Each region has its own calm, piano-like ambient track. Battles get a driving drum-and-bass theme, the Blights get a heavier boss theme, and Hyrule Castle gets its own. Battle music builds as the combo grows (3 and 5 in a row). It can be switched off in Settings.

## What keeps them coming back

- **Hero Rank:** every correct answer earns XP, and levels unlock titles from *Sleepy Hylian* to *Legend of Hyrule*.

- **Beedle's Shop** has over 100 things to buy, from an 80-rupee Boko Club up to the 15,000-rupee Fierce Deity Armour:
  - Weapons: more boss damage and coloured slash trails. The elemental blades are ×1.5 "super effective" (+25% damage) against one Blight.
  - Shields: block hits in boss fights. Some also earn rupees on a perfect guard, and the Mirror Shield reflects damage.
  - Armour: changes Link's look and boosts rewards (rupees, XP, Korok luck, extra ingredients).
  - Elixirs, fairies, bomb arrows, Lucky Clovers and gold nuggets.
  - Cooking ingredients and horse gear.
  - Style: Sheikah Slate colour themes, paraglider fabrics, and battle companions (dog, Korok, Rito chick, Chuchu, fairy, Mini Guardian) that cheer on correct answers.
  - A Sell tab for meals and monster parts.
- **Gear never makes the questions easier.** Perks only boost rewards or boss battles, so the learning stays just as challenging.
- **Loot:** every shrine win drops cooking ingredients (different in each region), a monster part, and **Adventure Tickets**.
- **Cooking:** throw up to 5 ingredients in the pot at the stable (or at home) to discover 24 recipes. Special ingredients add effects:
  - Hearty, Mighty and Hasty meals help in boss fights.
  - Spicy (+rupees), Electro (more Koroks) and Chilly (+XP) meals last 3 shrine trials.
- **Horses:** a new herd arrives in Hyrule Field every day.
  - Tame one with a timing mini-game (fiery horses are harder), then name it and register it at Outskirt Stable.
  - Brush and feed your horses daily to grow their bond.
  - Choose saddles, and race them for prizes.
- **Mini-games cost Adventure Tickets**, which are earned in the shrines. Fun breaks always lead back to learning. The mini-games are:
  - the Rito Flight Range (archery),
  - Kass's Song (a memory game),
  - Korok hide-and-seek in the Lost Woods,
  - horse racing.
- **Hateno house** (2,500 rupees): an illustrated room where every piece of Bolson Construction furniture has its own place. It's a trophy room to be proud of:
  - The fireplace has a flickering fire, the chandelier has candles, and the aquarium has fish.
  - The weapon rack shows every sword owned, and the trophy shelf shows each Blight (and Calamity Ganon) defeated.
  - The Divine Beast models sit on the mantelpiece, and the Triforce floats over the table.
  - The window shows your horse grazing outside, by day or by starlight.
  - Things not owned yet show as faint silhouettes. Tap any of them to see how to get it, or to build it.
  - The bed gives a daily XP boost.
  - Below the room, the **Hall of Fame** shows lifetime stats and 14 medals to earn.
- **Champion's Challenge:** get ★★★ in every shrine of a region to earn that Champion's one-of-a-kind reward. These can't be bought anywhere:
  - **Death Mountain:** Daruk's Boulder Breaker (the strongest weapon after the Master Sword) and a Vah Rudania model for the house.
  - **Zora's Domain:** Mipha's Lightscale Trident and a Vah Ruta model.
  - **Rito Village:** Revali's Great Eagle Bow (3 free Bomb Arrows in every boss battle), Revali's paraglider fabric and a Vah Medoh model.
  - **Gerudo Desert:** Urbosa's Scimitar of the Seven, the Daybreaker shield and a Vah Naboris model.
  - **All four regions:** the Triforce for the house, the Triforce Radiance slate colour and the Hero's Golden paraglider.
  - Each region also gives a 1,000-rupee bonus, and the full set gives 5,000.
- **Free a Divine Beast to open up its region.** New mini-games (paid with Adventure Tickets) and local side quests appear on the region screen:
  - **Death Mountain:** Yunobo's Rock Roll. Roll down the mountain dodging lava boulders and grabbing gems.
  - **Zora's Domain:** Zora Fishing with Prince Sidon. Ignore the nibbles and reel in on the bite. Your catch goes into your Bag for cooking.
  - **Rito Village:** Snowball Bowling with Teba. Time your aim, and the pins are knocked down with real physics.
  - **Gerudo Desert:** Sand Seal Rally with Riju. Surf through flag gates to earn more time.
  - Each region also brings quests from Yunobo and Bludo, Sidon and King Dorephan, Teba and Elder Kaneli, and Riju and Buliara. Rewards include house trophies and rare ingredients.
- **Master Cycle Zero:** 3-star every shrine in Hyrule to win the final Divine Beast. The **Master Cycle Run** appears on the map: jump boulders and Bokoblins and collect rupees. Rides are free, and rupee prizes cover the first 3 rides each day.
- **22 side quests** from Hudson, Sidon, Yunobo, Teba, Riju, Kass, Purah, Beedle and others. Rewards include armour sets, companions, saddles, colour themes and decor.
- **Great Fairy Fountain** (next to the Goddess Statue): upgrade armour up to ★★★★ with rupees and monster parts, which boosts its perks.
- **Spirit Orbs** (first clear of each shrine) can be swapped at the Goddess Statue: 4 orbs make a Heart Container or a Stamina Vessel.
- **Korok seeds** pop up at random after correct answers. Give them to Hestu for extra rune uses.
- **Sheikah Runes** in battle:
  - Magnesis: removes two wrong answers.
  - Remote Bomb: double damage.
  - Stasis: freezes the timer.
  - Cryonis: swaps the question for a new one.
- **Master Sword** in the Lost Woods (needs 8 hearts), which opens the endless **Trial of the Sword** with a best-floor record.
- **Blood Moon:** questions the child got wrong come back for a rematch. This is spaced repetition: half the time it's the same question, half the time a fresh one on the same skill.
- **Daily Quest** (20 correct answers a day) and a day-streak bonus.
- **Memories** unlock as the story moves on.

## For parents

- **Adventure Log → 11+ Readiness** shows mastery per topic, based on recent accuracy and weighted towards the harder levels.
- **Hateno Lab practice papers** work like the real exam: 20 questions, 15 minutes, no hints, then a marked review.
- Timers can be turned off in Settings, and questions can be read aloud.

## Curriculum covered

- **Maths:** place value, rounding, negatives, Roman numerals · the four operations, including long multiplication and remainders · factors, primes, squares · fractions, decimals, percentages · measures, time, 24-hour clock, timetables · 2D/3D shape, angles, perimeter, area, volume · algebra, function machines, sequences, nth term · charts, mean/median/mode/range, ratio, multi-step problems.
- **English:** spelling (GL "find the mistake" format) · punctuation · grammar (word classes, tense, agreement, conjunctions) · vocabulary · cloze · homophones, prefixes, plurals · figurative language · comprehension (6 original passages: fiction, instructions, letter, descriptive).
- **Verbal Reasoning:** synonyms and antonyms (including GL's two-group format) · hidden words · missing letters · compound words · letter codes · letter sequences · number sequences, number brackets and letter sums · word analogies · logic and ordering.
- **Non-Verbal Reasoning:** odd one out · series · analogies · matrices (2×2 and 3×3) · reflections · rotations · shape codes · cube nets.

Most questions are **generated procedurally**, so practice never runs out. The word puzzles (missing letters, compound words, hidden words) are checked against an English dictionary at build time so that only one answer works, and cube-net answers are checked by actually "rolling" a cube over the net.

## Developer notes

```
quest11/
  index.html, css/style.css
  js/util.js            helpers, multiple-choice builder, WebAudio sound effects
  js/art.js             all SVG artwork (characters, monsters, icons, world map)
  js/fx.js              animated backgrounds, particles, item-get/chest overlays, music
  js/content/*.js       question generators per subject (+ wordbank.js, generated)
  js/story.js           all names, dialogue and story text (easy to rename characters)
  js/state.js           save data, progression rules, mastery
  js/catalog.js         every ownable thing: gear, items, ingredients, recipes, cosmetics, decor, horses, side quests
  js/items.js           game-style SVG icons for every item (weapons, shields, armour, elixirs, ingredients, monster parts, meals, saddles, furniture)
  js/game.js            screens, battle engine, story
  js/house.js           the Hateno house room scene and Hall of Fame
  js/world.js           side content: shop, bag, cooking, horses, mini-games, house, side quests, Great Fairy
  js/regions.js         regional mini-games unlocked by freeing each Divine Beast, and the Master Cycle Run (canvas)
  tools/test-content.js stress-tests every generator: node tools/test-content.js 1000
  tools/build-wordbank.js  rebuilds wordbank.js (needs `npm i wordlist-english`)
  tools/bundle.js       builds dist/breath-of-knowledge.html
```

The official free GL familiarisation papers are at <https://11plus.gl-assessment.co.uk/pages/free-materials>.

*Not affiliated with or endorsed by Nintendo or GL Assessment. Character and place names belong to their owners. This is a personal, non-commercial educational project.*
