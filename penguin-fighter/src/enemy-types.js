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
      colors: { body: '#6d8e35', head: '#4a6a1c', accent: '#3a5a0c', eye: '#ffeb3b' },
    },
    worm: {
      id: 'worm',
      nameKey: 'enemy_worm',
      fallback: 'worm',
      colors: { body: '#d65a78', head: '#a83a58', accent: '#5a1828', eye: '#ffffff' },
    },
    miner: {
      id: 'miner',
      nameKey: 'enemy_miner',
      fallback: 'miner',
      colors: { body: '#5d4037', head: '#7cb342', accent: '#3e2723', eye: '#ffffff' },
    },
    bat: {
      id: 'bat',
      nameKey: 'enemy_bat',
      fallback: 'bat',
      colors: { body: '#2a1a3a', head: '#1a0c2a', accent: '#ff5252', eye: '#ff5252' },
    },
    skeleton: {
      id: 'skeleton',
      nameKey: 'enemy_skeleton',
      fallback: 'skeleton',
      colors: { body: '#e0e0e0', head: '#f5f5f5', accent: '#9e9e9e', eye: '#1a1a1a' },
    },
    slime: {
      id: 'slime',
      nameKey: 'enemy_slime',
      fallback: 'slime',
      colors: { body: '#7fdf6f', head: '#a8f098', accent: '#3a8a2a', eye: '#1a1a1a' },
    },
    spider: {
      id: 'spider',
      nameKey: 'enemy_spider',
      fallback: 'spider',
      colors: { body: '#3a1a4a', head: '#5a2a6a', accent: '#ff5252', eye: '#ff5252' },
    },
    robot: {
      id: 'robot',
      nameKey: 'enemy_robot',
      fallback: 'robot',
      colors: { body: '#9e9e9e', head: '#b0bec5', accent: '#4fc3f7', eye: '#ff5252' },
    },
    ghost: {
      id: 'ghost',
      nameKey: 'enemy_ghost',
      fallback: 'ghost',
      colors: { body: '#f5f5f5', head: '#e0e0e0', accent: '#9c27b0', eye: '#1a1a1a' },
    },
    boss: {
      id: 'boss',
      nameKey: 'enemy_boss',
      fallback: 'boss',
      colors: { body: '#b71c1c', head: '#388e3c', accent: '#ffd54f', eye: '#ff5252' },
    },
  };

  function get(id) {
    return ENEMY_TYPES[id] || ENEMY_TYPES.zombie;
  }

  global.EnemyTypes = { ENEMY_TYPES, get };
})(window);
