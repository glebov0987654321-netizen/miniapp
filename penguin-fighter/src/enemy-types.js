// Enemy type registry — one type per level (with the 10th being the boss).
// 'fallback' tells the procedural renderer which preset to draw if no image
// is available yet.
(function (global) {
  'use strict';

  const ENEMY_TYPES = {
    zombie: {
      id: 'zombie',
      nameKey: 'enemy_zombie',
      fallback: 'zombie',
      sprite: 'assets/enemies/e1.png',
      spriteId: 'e1',
      colors: { body: '#6d8e35', head: '#4a6a1c', accent: '#3a5a0c', eye: '#ffeb3b' },
    },
    worm: {
      id: 'worm',
      nameKey: 'enemy_worm',
      fallback: 'worm',
      sprite: 'assets/enemies/e2.png',
      spriteId: 'e2',
      colors: { body: '#d65a78', head: '#a83a58', accent: '#5a1828', eye: '#ffffff' },
    },
    miner: {
      id: 'miner',
      nameKey: 'enemy_miner',
      fallback: 'miner',
      sprite: 'assets/enemies/e3.png',
      spriteId: 'e3',
      colors: { body: '#5d4037', head: '#7cb342', accent: '#3e2723', eye: '#ffffff' },
    },
    bat: {
      id: 'bat',
      nameKey: 'enemy_bat',
      fallback: 'bat',
      sprite: 'assets/enemies/e4.png',
      spriteId: 'e4',
      colors: { body: '#2a1a3a', head: '#1a0c2a', accent: '#ff5252', eye: '#ff5252' },
    },
    skeleton: {
      id: 'skeleton',
      nameKey: 'enemy_skeleton',
      fallback: 'skeleton',
      sprite: 'assets/enemies/e5.png',
      spriteId: 'e5',
      colors: { body: '#e0e0e0', head: '#f5f5f5', accent: '#9e9e9e', eye: '#1a1a1a' },
    },
    slime: {
      id: 'slime',
      nameKey: 'enemy_slime',
      fallback: 'slime',
      sprite: 'assets/enemies/e6.png',
      spriteId: 'e6',
      colors: { body: '#7fdf6f', head: '#a8f098', accent: '#3a8a2a', eye: '#1a1a1a' },
    },
    spider: {
      id: 'spider',
      nameKey: 'enemy_spider',
      fallback: 'spider',
      sprite: 'assets/enemies/e7.png',
      spriteId: 'e7',
      colors: { body: '#3a1a4a', head: '#5a2a6a', accent: '#ff5252', eye: '#ff5252' },
    },
    robot: {
      id: 'robot',
      nameKey: 'enemy_robot',
      fallback: 'robot',
      sprite: 'assets/enemies/e8.png',
      spriteId: 'e8',
      colors: { body: '#9e9e9e', head: '#b0bec5', accent: '#4fc3f7', eye: '#ff5252' },
    },
    ghost: {
      id: 'ghost',
      nameKey: 'enemy_ghost',
      fallback: 'ghost',
      sprite: 'assets/enemies/e9.png',
      spriteId: 'e9',
      colors: { body: '#f5f5f5', head: '#e0e0e0', accent: '#9c27b0', eye: '#1a1a1a' },
    },
    boss: {
      id: 'boss',
      nameKey: 'enemy_boss',
      fallback: 'boss',
      sprite: 'assets/bosses/boss1.png',
      spriteId: 'boss1',
      colors: { body: '#b71c1c', head: '#388e3c', accent: '#ffd54f', eye: '#ff5252' },
    },
  };

  const ENEMY_MANIFEST = {};
  Object.keys(ENEMY_TYPES).forEach((k) => {
    const t = ENEMY_TYPES[k];
    if (t.sprite && t.spriteId) ENEMY_MANIFEST[t.spriteId] = t.sprite;
  });

  function get(id) {
    return ENEMY_TYPES[id] || ENEMY_TYPES.zombie;
  }

  global.EnemyTypes = { ENEMY_TYPES, ENEMY_MANIFEST, get };
})(window);
