// Shop catalogue + render/buy logic.
(function (global) {
  'use strict';

  const SKINS = [
    { id: 'default', price: 0 },
    { id: 'arctic', price: 150 },
    { id: 'fire', price: 350 },
    { id: 'ninja', price: 600 },
    { id: 'golden', price: 1000 },
  ];

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

  function renderShop() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const save = global.Save.get();
    const t = global.I18N.t;

    // Skin items
    SKINS.forEach((skin) => {
      const owned = save.ownedSkins.includes(skin.id);
      const equipped = save.selectedSkin === skin.id;

      const card = document.createElement('div');
      card.className = 'shop-item' + (equipped ? ' selected' : owned ? ' owned' : '');

      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      canvas.className = 'shop-item-preview';
      card.appendChild(canvas);
      // Draw asynchronously after appending so canvas has its 2D context ready.
      setTimeout(() => global.Render.drawSkinPreview(canvas, skin.id), 0);

      const name = document.createElement('div');
      name.className = 'shop-item-name';
      name.textContent = t('skin_' + skin.id + '_name');
      card.appendChild(name);

      const desc = document.createElement('div');
      desc.className = 'shop-item-desc';
      desc.textContent = t('skin_' + skin.id + '_desc');
      card.appendChild(desc);

      const btn = document.createElement('button');
      btn.className = 'shop-item-btn';

      if (equipped) {
        btn.textContent = t('equipped');
        btn.className += ' equipped';
        btn.disabled = true;
      } else if (owned) {
        btn.textContent = t('equip');
        btn.addEventListener('click', () => {
          global.Save.selectSkin(skin.id);
          global.SFX && global.SFX.click();
          renderShop();
          updateCoinDisplay();
        });
      } else {
        btn.textContent = t('buy') + ' ● ' + skin.price;
        if (save.coins < skin.price) {
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => {
            global.Save.addCoins(-skin.price);
            global.Save.ownSkin(skin.id);
            global.Save.selectSkin(skin.id);
            global.SFX && global.SFX.coin();
            renderShop();
            updateCoinDisplay();
          });
        }
      }
      card.appendChild(btn);
      grid.appendChild(card);
    });

    // Upgrade items
    UPGRADES.forEach((u) => {
      const lvl = save.upgrades[u.id] | 0;
      const maxed = lvl >= u.maxLevel;
      const price = upgradePrice(u);

      const card = document.createElement('div');
      card.className = 'shop-item';

      const name = document.createElement('div');
      name.className = 'shop-item-name';
      name.textContent =
        global.I18N.t('upgrade_' + u.id + '_name') + ' (' + global.I18N.t('level') + lvl + '/' + u.maxLevel + ')';
      card.appendChild(name);

      const desc = document.createElement('div');
      desc.className = 'shop-item-desc';
      desc.textContent = global.I18N.t('upgrade_' + u.id + '_desc');
      card.appendChild(desc);

      const btn = document.createElement('button');
      btn.className = 'shop-item-btn';
      if (maxed) {
        btn.textContent = 'MAX';
        btn.disabled = true;
      } else {
        btn.textContent = global.I18N.t('buy') + ' ● ' + price;
        if (save.coins < price) {
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => {
            global.Save.addCoins(-price);
            global.Save.upgrade(u.id);
            global.SFX && global.SFX.coin();
            renderShop();
            updateCoinDisplay();
          });
        }
      }
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function updateCoinDisplay() {
    const el = document.getElementById('shop-coins');
    if (el) el.textContent = global.Save.get().coins;
  }

  global.Shop = { renderShop, updateCoinDisplay };
})(window);
