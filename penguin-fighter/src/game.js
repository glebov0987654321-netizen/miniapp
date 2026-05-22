// Main game state machine + render loop.
(function (global) {
  'use strict';

  const STATES = {
    MENU: 'menu',
    LEVEL_INTRO: 'level-intro',
    PLAYING: 'playing',
    VICTORY: 'victory',
    DEFEAT: 'defeat',
    FINALE: 'finale',
    SHOP: 'shop',
    SETTINGS: 'settings',
  };

  const game = {
    canvas: null,
    ctx: null,
    state: STATES.MENU,
    levelNum: 1,
    levelData: null,
    player: null,
    enemies: [],
    floatingTexts: [],
    pendingReward: 0,
    lastTime: 0,
  };

  async function bootstrap() {
    const loaderText = document.getElementById('loader-text');

    await global.YGSDK.init();
    global.I18N.setLang(global.YGSDK.getLang ? global.YGSDK.getLang() : global.I18N.detectLang());
    if (loaderText) loaderText.textContent = global.I18N.t('loading');

    await global.Save.load();
    global.Sprites.preloadAll(global.Heroes.HERO_MANIFEST);

    game.canvas = document.getElementById('game');
    game.ctx = game.canvas.getContext('2d');

    global.Input.init();
    setupUI();
    applyTranslations();
    showMobileControlsIfTouch();

    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    global.YGSDK.showBanner();
    window.addEventListener('orientationchange', showMobileControlsIfTouch);
    if (window.matchMedia) {
      window.matchMedia('(orientation: landscape)').addEventListener('change', showMobileControlsIfTouch);
    }
    requestAnimationFrame(loop);
  }

  function showMobileControlsIfTouch() {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isTouch = coarse || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const controls = document.getElementById('touch-controls');
    if (!controls) return;
    controls.classList.toggle('hidden', !isTouch);
  }

  function setupUI() {
    document.getElementById('btn-play').addEventListener('click', () => {
      global.SFX.resumeOnGesture();
      global.SFX.click();
      game.levelNum = clampLevel(global.Save.get().levelReached || 1);
      enterState(STATES.LEVEL_INTRO);
    });

    document.getElementById('btn-shop').addEventListener('click', () => {
      global.SFX.click();
      enterState(STATES.SHOP);
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      global.SFX.click();
      enterState(STATES.SETTINGS);
    });

    document.getElementById('btn-level-start').addEventListener('click', () => {
      global.SFX.click();
      startLevel();
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      global.SFX.click();
      maybeShowInterstitial(() => {
        const next = game.levelNum + 1;
        if (next > global.Levels.TOTAL) {
          enterState(STATES.FINALE);
        } else {
          game.levelNum = next;
          enterState(STATES.LEVEL_INTRO);
        }
      });
    });

    document.getElementById('btn-double-coins').addEventListener('click', () => {
      const btn = document.getElementById('btn-double-coins');
      btn.disabled = true;
      let claimed = false;
      global.YGSDK.showRewardedAd(
        () => {
          claimed = true;
          global.Save.addCoins(game.pendingReward);
          updateCoinHud();
          document.getElementById('victory-reward').textContent = global.I18N.t('victory_reward_format', { n: game.pendingReward * 2 });
          btn.classList.add('hidden');
        },
        (shown) => {
          if (!shown && !claimed) btn.disabled = false;
        }
      );
    });

    document.getElementById('btn-revive').addEventListener('click', () => {
      const btn = document.getElementById('btn-revive');
      btn.disabled = true;
      let claimed = false;
      global.YGSDK.showRewardedAd(
        () => {
          claimed = true;
          if (game.player) {
            game.player.hp = game.player.maxHp;
            game.player.invuln = 1.5;
            game.player.x = 180;
            game.player.y = global.Entities.GROUND_Y - game.player.h;
            game.enemies.forEach((e, i) => {
              e.x = 850 + i * 100;
            });
          }
          enterState(STATES.PLAYING);
        },
        (shown) => {
          if (!shown && !claimed) btn.disabled = false;
        }
      );
    });

    document.getElementById('btn-defeat-menu').addEventListener('click', () => enterState(STATES.MENU));
    document.getElementById('btn-finale-menu').addEventListener('click', () => enterState(STATES.MENU));
    document.getElementById('btn-shop-back').addEventListener('click', () => enterState(STATES.MENU));
    document.getElementById('btn-settings-back').addEventListener('click', () => enterState(STATES.MENU));

    document.getElementById('btn-lang').addEventListener('click', () => {
      global.SFX.click();
      global.I18N.toggleLang();
      applyTranslations();
      if (game.state === STATES.SHOP) global.Shop.renderShop();
    });

    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      const save = global.Save.get();
      global.Save.setSetting('sound', !save.settings.sound);
      applyTranslations();
    });

    document.getElementById('btn-toggle-vibration').addEventListener('click', () => {
      const save = global.Save.get();
      global.Save.setSetting('vibration', !save.settings.vibration);
      applyTranslations();
    });

    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      global.Save.reset();
      applyTranslations();
      global.Shop.renderShop();
      updateCoinHud();
      game.levelNum = 1;
      enterState(STATES.MENU);
    });
  }

  function applyTranslations() {
    const t = global.I18N.t;
    document.getElementById('btn-play').textContent = t('menu_play');
    document.getElementById('btn-shop').textContent = t('menu_shop');
    document.getElementById('btn-settings').textContent = t('menu_settings');
    document.getElementById('menu-subtitle').textContent = t('menu_subtitle');
    document.getElementById('menu-hint').textContent = t('menu_hint');
    document.getElementById('btn-level-start').textContent = t('go_fight');
    document.getElementById('btn-next').textContent = t('next');
    document.getElementById('btn-double-coins').textContent = t('double_coins');
    document.getElementById('btn-revive').textContent = t('revive');
    document.getElementById('btn-defeat-menu').textContent = t('menu_button');
    document.getElementById('btn-finale-menu').textContent = t('menu_button');
    document.getElementById('btn-shop-back').textContent = t('back');
    document.getElementById('btn-settings-back').textContent = t('back');
    document.getElementById('defeat-text').textContent = t('defeat_text');
    document.getElementById('finale-text').textContent = t('finale_text');
    document.getElementById('shop-title').textContent = t('shop');
    document.getElementById('settings-title').textContent = t('settings');
    const settings = global.Save.get().settings;
    document.getElementById('btn-toggle-sound').textContent = settings.sound ? t('sound_on') : t('sound_off');
    document.getElementById('btn-toggle-vibration').textContent = settings.vibration ? t('vibration_on') : t('vibration_off');
    document.getElementById('btn-lang').textContent = t('language_toggle');
    document.getElementById('btn-reset-progress').textContent = t('reset_progress');
    const rotateText = document.getElementById('rotate-text');
    if (rotateText) rotateText.textContent = t('rotate_phone');
    updateLevelLabel();
    updateCoinHud();
  }

  function updateLevelLabel() {
    const el = document.getElementById('level-label');
    if (!el) return;
    if (game.levelNum === global.Levels.TOTAL) {
      el.textContent = global.I18N.t('level_label') + ' ' + game.levelNum + ' — ' + global.I18N.t('level_boss');
    } else {
      el.textContent = global.I18N.t('level_label') + ' ' + game.levelNum;
    }
  }

  function updateCoinHud() {
    const el = document.getElementById('coin-count');
    if (el) el.textContent = global.Save.get().coins;
    global.Shop.updateCoinDisplay();
  }

  function updateHpHud() {
    const fill = document.getElementById('hp-fill');
    if (!fill || !game.player) return;
    fill.style.width = Math.max(0, Math.min(100, game.player.hp / game.player.maxHp * 100)).toFixed(1) + '%';
  }

  function clampLevel(n) {
    return Math.max(1, Math.min(global.Levels.TOTAL, n | 0));
  }

  const screenIds = {
    [STATES.MENU]: 'menu',
    [STATES.LEVEL_INTRO]: 'level-intro',
    [STATES.VICTORY]: 'victory',
    [STATES.DEFEAT]: 'defeat',
    [STATES.FINALE]: 'finale',
    [STATES.SHOP]: 'shop',
    [STATES.SETTINGS]: 'settings',
  };

  function hideAllScreens() {
    Object.values(screenIds).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  function enterState(next) {
    game.state = next;
    hideAllScreens();

    const hud = document.getElementById('hud');
    if (next === STATES.PLAYING) {
      hud.classList.remove('hidden');
      global.YGSDK.hideBanner();
      return;
    }

    hud.classList.add('hidden');
    if (next !== STATES.LEVEL_INTRO) global.YGSDK.showBanner();
    const id = screenIds[next];
    if (id) document.getElementById(id).classList.remove('hidden');

    if (next === STATES.LEVEL_INTRO) {
      document.getElementById('level-intro-num').textContent = game.levelNum === global.Levels.TOTAL ? '!' : game.levelNum;
      document.getElementById('level-intro-text').textContent = game.levelNum === global.Levels.TOTAL
        ? global.I18N.t('level_boss')
        : global.I18N.t('level_intro_format', { n: game.levelNum });
    }

    if (next === STATES.SHOP) global.Shop.renderShop();
    if (next === STATES.SETTINGS) applyTranslations();
    if (next === STATES.VICTORY) {
      const btn = document.getElementById('btn-double-coins');
      document.getElementById('victory-reward').textContent = global.I18N.t('victory_reward_format', { n: game.pendingReward });
      btn.disabled = false;
      btn.classList.remove('hidden');
    }
    if (next === STATES.DEFEAT) document.getElementById('btn-revive').disabled = false;
    if (next === STATES.MENU) updateCoinHud();
  }

  function startLevel() {
    game.levelData = global.Levels.level(game.levelNum);
    game.player = new global.Entities.Player(global.Save.get());
    game.enemies = game.levelData.enemies.map((spec) => new global.Entities.Enemy(spec));
    game.floatingTexts = [];
    if (game.levelNum === global.Levels.TOTAL) global.SFX.boss();
    updateLevelLabel();
    updateCoinHud();
    updateHpHud();
    enterState(STATES.PLAYING);
  }

  function maybeShowInterstitial(after) {
    global.YGSDK.showFullscreenAd(() => after());
  }

  function maybeVibrate(pattern) {
    const save = global.Save.get();
    if (save.settings && save.settings.vibration && navigator.vibrate) navigator.vibrate(pattern);
  }

  function resolveHits() {
    if (!game.player) return;

    const pBox = game.player.attackBox();
    if (pBox) {
      game.enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        if (global.Entities.rectsOverlap(pBox, enemy.rect())) {
          if (enemy.takeDamage(game.player.dmg)) {
            spawnFloat('-' + game.player.dmg, enemy.x + enemy.w / 2, enemy.y, '#ff8a80');
            maybeVibrate(20);
          }
        }
      });
    }

    game.player.projectiles.forEach((shot) => {
      if (!shot.alive) return;
      const rect = global.Entities.projectileRect(shot);
      game.enemies.forEach((enemy) => {
        if (!enemy.alive || !shot.alive) return;
        if (global.Entities.rectsOverlap(rect, enemy.rect())) {
          if (enemy.takeDamage(shot.dmg)) {
            shot.alive = false;
            spawnFloat('-' + shot.dmg, enemy.x + enemy.w / 2, enemy.y, '#ffd54f');
            maybeVibrate(18);
          }
        }
      });
    });

    game.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const eBox = enemy.attackBox();
      if (eBox && global.Entities.rectsOverlap(eBox, game.player.rect())) {
        if (game.player.takeDamage(enemy.dmg)) {
          spawnFloat('-' + enemy.dmg, game.player.x + game.player.w / 2, game.player.y, '#ff5252');
          maybeVibrate([30, 20, 30]);
        }
      }
    });
  }

  function spawnFloat(text, x, y, color) {
    game.floatingTexts.push({ text, x, y, vy: -90, life: 0.9, color: color || '#fff' });
  }

  function checkOutcome() {
    if (!game.player) return;

    if (game.player.hp <= 0) {
      global.SFX.defeat();
      enterState(STATES.DEFEAT);
      return;
    }

    if (game.enemies.every((e) => !e.alive)) {
      const killCoins = game.enemies.reduce((sum, e) => sum + e.coinReward, 0);
      const total = Math.round((killCoins + (game.levelData.coinsBonus || 0)) * (1 + (game.player.coinBonus || 0)));
      game.pendingReward = total;
      global.Save.addCoins(total);
      global.Save.setLevelReached(Math.min(global.Levels.TOTAL, game.levelNum + 1));
      global.YGSDK.submitLeaderboard('main', global.Save.get().levelReached * 100 + global.Save.get().coins);
      updateCoinHud();
      maybeVibrate(35);
      global.SFX.levelup();
      enterState(STATES.VICTORY);
    }
  }

  function render() {
    const ctx = game.ctx;
    const W = global.Entities.WORLD_W;
    const H = global.Entities.WORLD_H;

    fitCanvas();
    global.Render.drawBackground(ctx, W, H, game.levelData ? game.levelNum : 1);

    if (game.player) game.player.draw(ctx);
    game.player && game.player.projectiles.forEach((shot) => global.Render.drawProjectile(ctx, shot));
    game.enemies.forEach((e) => {
      if (e.alive) e.draw(ctx);
    });

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    game.enemies.forEach((e) => {
      if (!e.alive) return;
      const barW = e.isBoss ? 240 : 84;
      const barH = e.isBoss ? 14 : 7;
      const bx = e.x + e.w / 2 - barW / 2;
      const by = e.y - 16;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = e.isBoss ? '#ff5252' : '#ef5350';
      ctx.fillRect(bx, by, barW * Math.max(0, e.hp / e.maxHp), barH);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(bx, by, barW, barH);
    });

    game.floatingTexts.forEach((f) => {
      ctx.fillStyle = f.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });
  }

  function fitCanvas() {
    const canvas = game.canvas;
    const dpr = global.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const scale = Math.min(canvas.width / global.Entities.WORLD_W, canvas.height / global.Entities.WORLD_H);
    const offX = (canvas.width - global.Entities.WORLD_W * scale) / 2;
    const offY = (canvas.height - global.Entities.WORLD_H * scale) / 2;
    game.ctx.setTransform(scale, 0, 0, scale, offX, offY);
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - (game.lastTime || t)) / 1000);
    game.lastTime = t;

    if (game.state === STATES.PLAYING && game.player) {
      game.player.update(dt, global.Input.state);
      game.enemies.forEach((e) => e.update(dt, game.player));
      resolveHits();
      checkOutcome();
      for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
        const f = game.floatingTexts[i];
        f.y += f.vy * dt;
        f.life -= dt;
        if (f.life <= 0) game.floatingTexts.splice(i, 1);
      }
      updateHpHud();
    }

    render();
    requestAnimationFrame(loop);
  }

  window.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((err) => {
      console.error('Bootstrap failed', err);
      const lt = document.getElementById('loader-text');
      if (lt) lt.textContent = 'Ошибка загрузки';
    });
  });

  global.GAME = game;
})(window);
