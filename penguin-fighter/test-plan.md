# Photo Fighter — Test Plan (PR #1)

Preview: https://penguin-fighter-mpqxbyub.devinapps.com

## Adversarial Primary Flow
A single end-to-end flow proves the PR's main claims: 7 photo heroes, level-specific enemies, hero-specific attacks, settings (language), mobile auto-controls.

Each step has explicit pass/fail criteria so a broken implementation would produce visibly different results.

### Step 1 — Menu loads with new title and hero panel
Action: open `https://penguin-fighter-mpqxbyub.devinapps.com/?_=now` in maximized Chrome and let the loader finish.
Expected (PASS):
- Title text reads exactly `PHOTO FIGHTER` (not `PENGUIN FIGHTER`).
- A coin counter is visible top-left of the menu showing `0`.
- A hero name label (`Вампир` in RU) is visible near the coin counter.
- Three primary buttons exist: `ИГРАТЬ`, `ГЕРОИ И ПРОКАЧКА`, `НАСТРОЙКИ`.
FAIL if: any of the above strings/numbers are missing or different. (`src/i18n.js:7-12`, `index.html` menu block.)

### Step 2 — Shop shows 7 heroes, h2 locked at price 40
Action: click `ГЕРОИ И ПРОКАЧКА`. In console run `Heroes.HEROES.length`.
Expected (PASS):
- Console reports exactly `7`.
- A hero card titled `Жилетка` (h2) shows `После уровня 2` and price `40 ●`.
- Its button is `ЗАКРЫТО` (disabled) because save starts at `levelReached: 1` and `levelReached - 1 < 1`.
- First hero card `Вампир` shows button `ВЫБРАН`.
FAIL if: hero count ≠ 7, h2 price ≠ 40, or h2 button is `КУПИТЬ` (means lock check broken). (`src/heroes.js:23,99-104`, `src/shop.js:60-72`.)

### Step 3 — Level 1 enemy is the OLIVE-GREEN zombie
Action: click `НАЗАД` → `ИГРАТЬ` → `В БОЙ`.
Expected (PASS):
- Level intro briefly says `Уровень 1`.
- Combat screen has player on the left and an enemy on the right whose dominant body color is olive/yellow-green (`#6d8e35`).
FAIL if: the enemy is pink/red or visibly identical to the level-2 enemy used in Step 6.

### Step 4 — Win level 1 with claws (melee), earn coins
Action: press A/D to approach, then Space repeatedly to attack until enemies die. Reach VICTORY screen.
Expected (PASS):
- The attack hit is a SHORT-RANGE melee (no visible projectile leaves the player). This is the `claws` preset.
- VICTORY screen appears showing `+N монет` where N ≥ 10.
- Click `ДАЛЬШЕ` once. A fullscreen mock-ad overlay appears, counts down, then dismisses to level intro 2.
FAIL if: visible bullets/feathers appear during level 1 (means hero-attack routing is wrong), or coins don't increment after victory.

### Step 5 — Back to menu, buy + equip h2
Action: in mock-ad/Level Intro 2 screen press `В МЕНЮ` (or finish through level-intro back to menu via shop). Click `ГЕРОИ И ПРОКАЧКА`.
Expected (PASS):
- Menu coin counter now ≥ 10.
- The `Жилетка` (h2) card's button is now `КУПИТЬ ● 40` (no longer `ЗАКРЫТО`) because `levelReached` is now 2.
- Click it. The card becomes `ВЫБРАН`; the `Вампир` card flips from `ВЫБРАН` to `ВЫБРАТЬ`.
- The coin counter drops by 40.
FAIL if: h2 stays `ЗАКРЫТО` after winning level 1, or coin counter doesn't drop by exactly 40.

### Step 6 — Level 2 enemy is the PINK worm, attack switches to PISTOL projectile
Action: click `НАЗАД` → `ИГРАТЬ` → `В БОЙ`.
Expected (PASS):
- Combat screen on level 2. Enemy's dominant body color is pink/magenta (`#d65a78`) — visibly different hue from Step 3.
- When the player presses Space, a small projectile (bullet) leaves the player and travels horizontally — NOT a melee swing.
FAIL if: enemy looks identical to level 1's zombie (means enemy-per-level routing is wrong), or attack remains a melee swing (means hero-attack routing is wrong).

### Step 7 — Settings: language toggle changes UI strings
Action: from menu (after returning) click `НАСТРОЙКИ` → click `ЯЗЫК: RU / EN`.
Expected (PASS):
- The settings screen labels switch to English. Specifically: title `SETTINGS`, button `LANGUAGE: RU / EN`, button `RESET PROGRESS`, button `BACK`.
- Click `BACK`. The menu now shows `PLAY`, `HEROES & UPGRADES`, `SETTINGS`.
- Click `HEROES & UPGRADES`: hero h1 name reads `Vampire`, h2 reads `Vest Guy`.
FAIL if: any label remains in Russian after toggle, or the menu/shop strings don't switch.

### Step 8 — Mobile emulation auto-shows touch controls
Action: open Chrome DevTools → toggle device toolbar (Ctrl+Shift+M) → pick `iPhone 12 Pro`. Reload the page so `showMobileControlsIfTouch()` re-runs at boot.
Expected (PASS):
- After reload, the `#touch-controls` element is visible (no `hidden` class) and shows on-screen buttons overlaying the bottom of the game area.
- Switch back to desktop mode and reload: `#touch-controls` is hidden again.
FAIL if: touch controls do not appear in mobile mode, or remain visible in desktop mode. (`src/game.js:53-58`.)

## Regression sanity (single quick check, label clearly)
- Coin counter in menu and shop stays consistent during purchases (already covered by Step 5).

## Out of scope
- Real Yandex SDK ads — mock is used per `src/sdk.js`.
- Yandex moderation pass on photo assets — that is a content question, not a runtime test.
