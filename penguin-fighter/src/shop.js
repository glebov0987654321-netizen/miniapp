// Hero shop + upgrades.
(function (global) {
  'use strict';

  const UPGRADES = [
    { id: 'damage', maxLevel: 10, basePrice: 80, growth: 1.6 },
    { id: 'hp', maxLevel: 10, basePrice: 80, growth: 1.6 },
    { id: 'speed', maxLevel: 5, basePrice: 100, growth: 1.8 },
  ];

  function upgradePrice(u) {
    const save = global.Save.get();
    const lvl = save.upgrades[u.id] | 0;
    return Math.round(u.basePrice * Math.pow(u.growth, lvl));
  }

  function renderHeroCard(grid, hero, save, t) {
    const owned = global.Heroes.isUnlocked(hero, save);
    const equipped = save.selectedHero === hero.id;
    const price = hero.unlock.price;
    const card = document.createElement('div');
    card.className = 'shop-item' + (equipped ? ' selected' : owned ? ' owned' : '');

    const canvas = document.createElement('canvas');
    canvas.width = 88;
    canvas.height = 88;
    canvas.className = 'shop-item-preview';
    card.appendChild(canvas);
    setTimeout(() => global.Render.drawSkinPreview(canvas, hero.id), 0);

    const name = document.createElement('div');
    name.className = 'shop-item-name';
    name.textContent = t(hero.nameKey);
    card.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'shop-item-desc';
    desc.textContent = t(hero.descKey) + ' · ' + t(hero.weaponKey);
    card.appendChild(desc);

    const meta = document.createElement('div');
    meta.className = 'shop-item-meta';
    meta.textContent = t('unlock_after_level', { n: hero.unlock.level + 1 }) + ' · ' + price + ' ●';
    card.appendChild(meta);

    const btn = document.createElement('button');
    btn.className = 'shop-item-btn';

    if (equipped) {
      btn.textContent = t('equipped');
      btn.className += ' equipped';
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = t('equip');
      btn.addEventListener('click', () => {
        global.Save.selectHero(hero.id);
        global.SFX && global.SFX.click();
        renderShop();
      });
    } else if (global.Heroes.canUnlock(hero, save)) {
      btn.textContent = t('buy') + ' ● ' + price;
      btn.addEventListener('click', () => {
        global.Save.addCoins(-price);
        global.Save.ownHero(hero.id);
        global.Save.selectHero(hero.id);
        global.SFX && global.SFX.coin();
        renderShop();
      });
    } else {
      const reason = global.Heroes.reasonLocked(hero, save);
      btn.textContent = reason === 'level' ? t('locked') : t('not_enough_coins');
      btn.disabled = true;
    }

    card.appendChild(btn);
    grid.appendChild(card);
  }

  function renderUpgradeCard(grid, u, save, t) {
    const lvl = save.upgrades[u.id] | 0;
    const maxed = lvl >= u.maxLevel;
    const price = upgradePrice(u);
    const card = document.createElement('div');
    card.className = 'shop-item';

    const name = document.createElement('div');
    name.className = 'shop-item-name';
    name.textContent = t('upgrade_' + u.id + '_name') + ' (' + t('level') + ' ' + lvl + '/' + u.maxLevel + ')';
    card.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'shop-item-desc';
    desc.textContent = t('upgrade_' + u.id + '_desc');
    card.appendChild(desc);

    const btn = document.createElement('button');
    btn.className = 'shop-item-btn';
    if (maxed) {
      btn.textContent = 'MAX';
      btn.disabled = true;
    } else {
      btn.textContent = t('buy') + ' ● ' + price;
      if (save.coins < price) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          global.Save.addCoins(-price);
          global.Save.upgrade(u.id);
          global.SFX && global.SFX.coin();
          renderShop();
        });
      }
    }

    card.appendChild(btn);
    grid.appendChild(card);
  }

  function renderShop() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const save = global.Save.get();
    const t = global.I18N.t;

    global.Heroes.HEROES.forEach((hero) => renderHeroCard(grid, hero, save, t));
    UPGRADES.forEach((u) => renderUpgradeCard(grid, u, save, t));
    updateCoinDisplay();
  }

  function updateCoinDisplay() {
    const coins = global.Save.get().coins;
    const shopEl = document.getElementById('shop-coins');
    const menuEl = document.getElementById('menu-coins');
    const heroEl = document.getElementById('menu-hero-name');
    const hero = global.Heroes.byId(global.Save.get().selectedHero);
    if (shopEl) shopEl.textContent = coins;
    if (menuEl) menuEl.textContent = coins;
    if (heroEl) heroEl.textContent = global.I18N.t(hero.nameKey);
  }

  global.Shop = { renderShop, updateCoinDisplay };
})(window);
