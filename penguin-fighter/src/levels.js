// Level definitions — 10 levels with rising difficulty + a final boss.
// Each level now picks a specific enemy type so the player meets a different
// foe per level (zombie → worm → miner → bat → skeleton → slime → spider →
// robot → ghost → BOSS).
(function (global) {
  'use strict';

  const LEVEL_ENEMY = [
    'zombie',   // 1
    'worm',     // 2
    'miner',    // 3
    'bat',      // 4
    'skeleton', // 5
    'slime',    // 6
    'spider',   // 7
    'robot',    // 8
    'ghost',    // 9
    'boss',     // 10
  ];

  function buildLevel(n) {
    const enemyType = LEVEL_ENEMY[n - 1] || 'zombie';

    if (n === 10) {
      return {
        name: 'BOSS',
        enemyType: 'boss',
        coinsBonus: 200,
        enemies: [
          {
            type: 'boss',
            x: 1050,
            w: 150,
            h: 200,
            hp: 320,
            dmg: 20,
            speed: 170,
            coins: 60,
            boss: true,
          },
        ],
      };
    }

    let count, baseHp, baseDmg, baseSpeed, baseCoins, bonus;
    if (n <= 3) {
      count = 1 + Math.floor((n - 1) / 2);
      baseHp = 28 + n * 6;
      baseDmg = 7 + n * 1;
      baseSpeed = 120 + n * 8;
      baseCoins = 6 + n;
      bonus = 15 + n * 5;
    } else if (n <= 6) {
      count = 2 + (n - 4);
      baseHp = 42 + n * 8;
      baseDmg = 10 + n * 1;
      baseSpeed = 140 + n * 8;
      baseCoins = 8 + n;
      bonus = 30 + n * 6;
    } else {
      count = 3 + (n - 7);
      baseHp = 60 + n * 9;
      baseDmg = 12 + n * 2;
      baseSpeed = 170 + n * 8;
      baseCoins = 10 + n;
      bonus = 60 + n * 8;
    }

    const enemies = [];
    for (let i = 0; i < count; i++) {
      enemies.push({
        type: enemyType,
        x: 1000 + i * 110,
        hp: baseHp,
        dmg: baseDmg,
        speed: baseSpeed,
        coins: baseCoins,
      });
    }
    return {
      name: 'Level ' + n,
      enemyType,
      coinsBonus: bonus,
      enemies,
    };
  }

  function level(n) {
    return buildLevel(Math.max(1, Math.min(10, n | 0)));
  }

  function enemyTypeForLevel(n) {
    return LEVEL_ENEMY[Math.max(0, Math.min(LEVEL_ENEMY.length - 1, (n | 0) - 1))];
  }

  global.Levels = { level, enemyTypeForLevel, TOTAL: 10 };
})(window);
