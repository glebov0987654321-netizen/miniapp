// Hero registry — 4 unlockable photo heroes with different attack types.
(function (global) {
  'use strict';

  const HEROES = [
    {
      id: 'h1',
      nameKey: 'hero_h1_name',
      descKey: 'hero_h1_desc',
      attack: 'claws',
      weaponKey: 'weapon_claws',
      unlock: { level: 0, price: 0 },
      sprite: 'assets/heroes/h1.png',
      fallbackSkin: 'default',
      stats: { hpMul: 1.0, dmgMul: 1.0, speedMul: 1.0, coinMul: 0 },
    },
    {
      id: 'h2',
      nameKey: 'hero_h2_name',
      descKey: 'hero_h2_desc',
      attack: 'pistol',
      weaponKey: 'weapon_pistol',
      unlock: { level: 1, price: 40 },
      sprite: 'assets/heroes/h2.png',
      fallbackSkin: 'arctic',
      stats: { hpMul: 1.15, dmgMul: 1.05, speedMul: 0.95, coinMul: 0.05 },
    },
    {
      id: 'h3',
      nameKey: 'hero_h3_name',
      descKey: 'hero_h3_desc',
      attack: 'feather',
      weaponKey: 'weapon_feather',
      unlock: { level: 2, price: 100 },
      sprite: 'assets/heroes/h3.png',
      fallbackSkin: 'ninja',
      stats: { hpMul: 0.9, dmgMul: 1.1, speedMul: 1.15, coinMul: 0.1 },
    },
    {
      id: 'h4',
      nameKey: 'hero_h4_name',
      descKey: 'hero_h4_desc',
      attack: 'laser',
      weaponKey: 'weapon_laser',
      unlock: { level: 3, price: 200 },
      sprite: 'assets/heroes/h4.png',
      fallbackSkin: 'fire',
      stats: { hpMul: 1.2, dmgMul: 1.3, speedMul: 0.9, coinMul: 0.15 },
    },
  ];

  const HERO_MANIFEST = {};
  HEROES.forEach((hero) => {
    if (hero.sprite) HERO_MANIFEST[hero.id] = hero.sprite;
  });
  HERO_MANIFEST.boss1 = 'assets/bosses/boss1.png';

  function byId(id) {
    return HEROES.find((h) => h.id === id) || HEROES[0];
  }

  function isUnlocked(hero, saveData) {
    return !!(saveData.ownedHeroes && saveData.ownedHeroes.includes(hero.id));
  }

  function canUnlock(hero, saveData) {
    if (isUnlocked(hero, saveData)) return false;
    if ((saveData.levelReached || 1) - 1 < hero.unlock.level) return false;
    if ((saveData.coins || 0) < hero.unlock.price) return false;
    return true;
  }

  function reasonLocked(hero, saveData) {
    if ((saveData.levelReached || 1) - 1 < hero.unlock.level) return 'level';
    if ((saveData.coins || 0) < hero.unlock.price) return 'coins';
    return null;
  }

  global.Heroes = { HEROES, HERO_MANIFEST, byId, isUnlocked, canUnlock, reasonLocked };
})(window);
