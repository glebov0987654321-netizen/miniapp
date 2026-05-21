// Level definitions — 10 levels with rising difficulty + a final boss.
(function (global) {
  'use strict';

  // Each level: array of enemy spawn configs.
  // coinsBonus: extra coins awarded for completing the level.
  function buildLevel(n) {
    // n is 1..10
    if (n === 10) {
      return {
        name: 'BOSS',
        coinsBonus: 200,
        enemies: [
          {
            x: 1050,
            w: 130,
            h: 180,
            hp: 280,
            dmg: 18,
            speed: 160,
            coins: 50,
            boss: true,
          },
        ],
      };
    }

    // Tiers
    let count, baseHp, baseDmg, baseSpeed, baseCoins, bonus;
    if (n <= 3) {
      count = 1 + Math.floor((n - 1) / 2); // 1,1,2
      baseHp = 28 + n * 6;
      baseDmg = 7 + n * 1;
      baseSpeed = 120 + n * 8;
      baseCoins = 6 + n;
      bonus = 15 + n * 5;
    } else if (n <= 6) {
      count = 2 + (n - 4); // 2,3,4
      baseHp = 42 + n * 8;
      baseDmg = 10 + n * 1;
      baseSpeed = 140 + n * 8;
      baseCoins = 8 + n;
      bonus = 30 + n * 6;
    } else {
      count = 3 + (n - 7); // 3,4,5
      baseHp = 60 + n * 9;
      baseDmg = 12 + n * 2;
      baseSpeed = 170 + n * 8;
      baseCoins = 10 + n;
      bonus = 60 + n * 8;
    }

    const enemies = [];
    for (let i = 0; i < count; i++) {
      enemies.push({
        x: 1000 + i * 110,
        hp: baseHp,
        dmg: baseDmg,
        speed: baseSpeed,
        coins: baseCoins,
      });
    }
    return {
      name: 'Level ' + n,
      coinsBonus: bonus,
      enemies,
    };
  }

  function level(n) {
    return buildLevel(Math.max(1, Math.min(10, n | 0)));
  }

  global.Levels = { level, TOTAL: 10 };
})(window);
