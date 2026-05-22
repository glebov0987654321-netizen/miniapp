// Hero registry — 7 unlockable photo heroes with different attack types.
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
      fallbackSkin: 'ninja',
      stats: { hpMul: 0.95, dmgMul: 1.15, speedMul: 1.08, coinMul: 0 },
    },
    {
      id: 'h2',
      nameKey: 'hero_h2_name',
      descKey: 'hero_h2_desc',
      attack: 'pistol',
      weaponKey: 'weapon_pistol',
      unlock: { level: 1, price: 40 },
      sprite: '',
      fallbackSkin: 'default',
      stats: { hpMul: 1.05, dmgMul: 1.0, speedMul: 1.0, coinMul: 0 },
    },
    {
      id: 'h3',
      nameKey: 'hero_h3_name',
      descKey: 'hero_h3_desc',
      attack: 'feather',
      weaponKey: 'weapon_feather',
      unlock: { level: 2, price: 90 },
      sprite: 'assets/heroes/h3.png',
      fallbackSkin: 'arctic',
      stats: { hpMul: 1.1, dmgMul: 0.95, speedMul: 1.02, coinMul: 0.08 },
    },
    {
      id: 'h4',
      nameKey: 'hero_h4_name',
      descKey: 'hero_h4_desc',
      attack: 'laser',
      weaponKey: 'weapon_laser',
      unlock: { level: 3, price: 170 },
      sprite: 'assets/heroes/h4.png',
      fallbackSkin: 'fire',
      stats: { hpMul: 1.0, dmgMul: 1.25, speedMul: 0.95, coinMul: 0 },
    },
    {
      id: 'h5',
      nameKey: 'hero_h5_name',
      descKey: 'hero_h5_desc',
      attack: 'spray',
      weaponKey: 'weapon_spray',
      unlock: { level: 4, price: 280 },
      sprite: 'assets/heroes/h5.png',
      fallbackSkin: 'golden',
      stats: { hpMul: 0.9, dmgMul: 1.0, speedMul: 1.15, coinMul: 0.05 },
    },
    {
      id: 'h6',
      nameKey: 'hero_h6_name',
      descKey: 'hero_h6_desc',
      attack: 'ice',
      weaponKey: 'weapon_ice',
      unlock: { level: 5, price: 420 },
      sprite: '',
      fallbackSkin: 'arctic',
      stats: { hpMul: 1.05, dmgMul: 1.15, speedMul: 0.98, coinMul: 0.1 },
    },
    {
      id: 'h7',
      nameKey: 'hero_h7_name',
      descKey: 'hero_h7_desc',
      attack: 'cash',
      weaponKey: 'weapon_cash',
      unlock: { level: 6, price: 600 },
      sprite: '',
      fallbackSkin: 'golden',
      stats: { hpMul: 1.0, dmgMul: 1.1, speedMul: 1.05, coinMul: 0.25 },
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
