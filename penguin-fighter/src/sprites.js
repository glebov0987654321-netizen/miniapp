// Image sprite loader — loads PNGs from assets/ and caches them.
// Game falls back to procedural rendering if a sprite isn't available yet.
(function (global) {
  'use strict';

  const cache = {}; // id -> { img, ready, failed }

  function load(id, src) {
    if (cache[id]) return cache[id];
    const entry = { img: new Image(), ready: false, failed: false, src };
    entry.img.onload = () => {
      entry.ready = true;
    };
    entry.img.onerror = () => {
      entry.failed = true;
    };
    entry.img.src = src;
    cache[id] = entry;
    return entry;
  }

  function get(id) {
    const e = cache[id];
    if (e && e.ready) return e.img;
    return null;
  }

  function preloadAll(manifest) {
    Object.keys(manifest).forEach((id) => load(id, manifest[id]));
  }

  function ready(id) {
    return !!(cache[id] && cache[id].ready);
  }

  global.Sprites = { load, get, preloadAll, ready };
})(window);
