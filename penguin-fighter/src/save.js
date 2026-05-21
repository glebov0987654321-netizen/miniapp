// Save/load — cloud-first (Yandex Games) with localStorage fallback.
(function (global) {
  'use strict';

  const STORAGE_KEY = 'pf_save_v1';

  const DEFAULT_STATE = {
    coins: 0,
    levelReached: 1,
    selectedSkin: 'default',
    ownedSkins: ['default'],
    upgrades: {
      damage: 0,
      hp: 0,
      speed: 0,
    },
    bestScore: 0,
  };

  let cache = clone(DEFAULT_STATE);

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function localLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function localSave(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // private mode, ignore
    }
  }

  function merge(base, incoming) {
    if (!incoming) return base;
    const result = clone(base);
    Object.keys(incoming).forEach((k) => {
      if (k === 'upgrades' && typeof incoming[k] === 'object') {
        result.upgrades = Object.assign({}, base.upgrades, incoming[k]);
      } else {
        result[k] = incoming[k];
      }
    });
    // Make sure default skin is always owned.
    if (!result.ownedSkins.includes('default')) {
      result.ownedSkins.push('default');
    }
    return result;
  }

  async function load() {
    cache = clone(DEFAULT_STATE);

    const local = localLoad();
    if (local) cache = merge(cache, local);

    if (global.YGSDK) {
      const remote = await global.YGSDK.cloudLoad();
      if (remote && typeof remote === 'object') {
        cache = merge(cache, remote);
        // Persist merged result back to local for offline play.
        localSave(cache);
      }
    }
    return cache;
  }

  let cloudDebounceTimer = null;

  function save() {
    localSave(cache);
    if (cloudDebounceTimer) clearTimeout(cloudDebounceTimer);
    cloudDebounceTimer = setTimeout(() => {
      if (global.YGSDK) global.YGSDK.cloudSave(cache);
    }, 1500);
  }

  function get() {
    return cache;
  }

  function setCoins(n) {
    cache.coins = Math.max(0, n | 0);
    save();
  }

  function addCoins(n) {
    cache.coins = Math.max(0, (cache.coins | 0) + (n | 0));
    save();
  }

  function setLevelReached(n) {
    if (n > cache.levelReached) {
      cache.levelReached = n;
      save();
    }
  }

  function selectSkin(id) {
    if (cache.ownedSkins.includes(id)) {
      cache.selectedSkin = id;
      save();
      return true;
    }
    return false;
  }

  function ownSkin(id) {
    if (!cache.ownedSkins.includes(id)) {
      cache.ownedSkins.push(id);
      save();
    }
  }

  function upgrade(name) {
    if (!(name in cache.upgrades)) return;
    cache.upgrades[name] = (cache.upgrades[name] | 0) + 1;
    save();
  }

  function reset() {
    cache = clone(DEFAULT_STATE);
    save();
  }

  function setBestScore(n) {
    if (n > cache.bestScore) {
      cache.bestScore = n;
      save();
    }
  }

  global.Save = {
    load,
    save,
    get,
    setCoins,
    addCoins,
    setLevelReached,
    selectSkin,
    ownSkin,
    upgrade,
    reset,
    setBestScore,
  };
})(window);
