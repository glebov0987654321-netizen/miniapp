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
    lastTime: 0,
    pendingReward: 0, // coins to award on victory after multiplier
    levelStartTime: 0,
    elapsedSinceLastFullscreen: 0, // ms since last fullscreen ad
  };

  // ---- Init ----
  async function bootstrap() {
    const loaderText = document.getElementById('loader-text');

    await global.YGSDK.init();
    global.I18N.setLang(global.YGSDK.getLang());
    if (loaderText) loaderText.textContent = global.I18N.t('loading');

    await global.Save.load();

    game.canvas = document.getElementById('game');
    game.ctx = game.canvas.getContext('2d');

    global.Input.init();

    setupUI();
    showMobileControlsIfTouch();

    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Sticky banner during menu (graceful if not yet configured in console).
    global.YGSDK.showBanner();

    requestAnimationFrame(loop);
  }

  function showMobileControlsIfTouch() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) {
      document.getElementById('touch-controls').classList.remove('hidden');
    }
  }

  // ---- UI ----
  function setupUI() {
    applyTranslations();

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

    document.getElementById('btn-lang').addEventListener('click', () => {
      global.SFX.click();
      global.I18N.toggleLang();
      applyTranslations();
      if (game.state === STATES.SHOP) global.Shop.renderShop();
    });

    document.getElementById('btn-level-start').addEventListener('click', () => {
      global.SFX.click();
      startLevel();
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      global.SFX.click();
      // Show interstitial between levels (Yandex throttles to 60s; SDK wrapper handles cooldown).
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
          const extra = game.pendingReward;
          global.Save.addCoins(extra);
          updateCoinHud();
          const reward = document.getElementById('victory-reward');
          reward.textContent = global.I18N.t('victory_reward_format', { n: game.pendingReward * 2 });
          btn.classList.add('hidden');
        },
        (wasShown) => {
          if (!wasShown && !claimed) {
            btn.disabled = false;
          }
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
          // Heal player to full and resume.
          if (game.player) {
            game.player.hp = game.player.maxHp;
            game.player.invuln = 1.5;
            game.player.x = 200;
            game.player.y = global.Entities.GROUND_Y - game.player.h;
            // Knock enemies back to give the player room.
            game.enemies.forEach((e) => {
              e.x = Math.max(700, Math.min(global.Entities.WORLD_W - 100, e.x + 200));
            });
          }
          enterState(STATES.PLAYING);
        },
        (wasShown) => {
          if (!wasShown && !claimed) {
            btn.disabled = false;
          }
        }
      );
    });

    document.getElementById('btn-defeat-menu').addEventListener('click', () => {
      global.SFX.click();
      enterState(STATES.MENU);
    });

    document.getElementById('btn-finale-menu').addEventListener('click', () => {
      global.SFX.click();
      enterState(STATES.MENU);
    });

    document.getElementById('btn-shop-back').addEventListener('click', () => {
      global.SFX.click();
      enterState(STATES.MENU);
    });
  }

  function applyTranslations() {
    const t = global.I18N.t;
    document.getElementById('btn-play').textContent = t('menu_play');
    document.getElementById('btn-shop').textContent = t('menu_shop');
    document.getElementById('menu-subtitle').textContent = t('menu_subtitle');
    document.getElementById('menu-hint').textContent = t('menu_hint');
    document.getElementById('btn-level-start').textContent = t('go_fight');
    document.getElementById('btn-next').textContent = t('next');
    document.getElementById('btn-double-coins').textContent = t('double_coins');
    document.getElementById('btn-revive').textContent = t('revive');
    document.getElementById('btn-defeat-menu').textContent = t('menu_button');
    document.getElementById('btn-finale-menu').textContent = t('menu_button');
    document.getElementById('btn-shop-back').textContent = t('back');
    document.getElementById('defeat-text').textContent = t('defeat_text');
    document.getElementById('finale-text').textContent = t('finale_text');
    document.querySelector('#menu h1').textContent = 'PENGUIN FIGHTER';
    document.querySelector('#victory h1').textContent = t('victory');
    document.querySelector('#defeat h1').textContent = t('defeat');
    document.querySelector('#finale h1').textContent = t('finale_title');
    document.querySelector('#shop h1').textContent = t('shop');
    updateLevelLabel();
  }

  function updateLevelLabel() {
    const el = document.getElementById('level-label');
    if (!el) return;
    if (game.levelNum === global.Levels.TOTAL) {
      el.textContent = global.I18N.t('level_label') + ' 10 — ' + global.I18N.t('level_boss');
    } else {
      el.textContent = global.I18N.t('level_label') + ' ' + game.levelNum;
    }
  }

  function updateCoinHud() {
    const hudCoins = document.getElementById('coin-count');
    if (hudCoins) hudCoins.textContent = global.Save.get().coins;
  }

  function updateHpHud() {
    const fill = document.getElementById('hp-fill');
    if (!fill || !game.player) return;
    const ratio = Math.max(0, Math.min(1, game.player.hp / game.player.maxHp));
    fill.style.width = (ratio * 100).toFixed(1) + '%';
  }

  function clampLevel(n) {
    return Math.max(1, Math.min(global.Levels.TOTAL, n | 0));
  }

  // ---- State transitions ----
  const screenIds = {
    [STATES.MENU]: 'menu',
    [STATES.LEVEL_INTRO]: 'level-intro',
    [STATES.VICTORY]: 'victory',
    [STATES.DEFEAT]: 'defeat',
    [STATES.FINALE]: 'finale',
    [STATES.SHOP]: 'shop',
  };

  function hideAllScreens() {
    Object.values(screenIds).forEach((id) => {
      document.getElementById(id).classList.add('hidden');
    });
  }

  function enterState(next) {
    game.state = next;
    hideAllScreens();

    const hud = document.getElementById('hud');
    if (next === STATES.PLAYING) {
      hud.classList.remove('hidden');
      // Hide sticky banner during gameplay to avoid covering controls.
      global.YGSDK.hideBanner();
      return;
    }

    hud.classList.add('hidden');
    // Show banner on non-gameplay screens.
    if (next !== STATES.LEVEL_INTRO) {
      global.YGSDK.showBanner();
    }

    const id = screenIds[next];
    if (id) {
      document.getElementById(id).classList.remove('hidden');
    }

    if (next === STATES.LEVEL_INTRO) {
      const introNum = document.getElementById('level-intro-num');
      const introText = document.getElementById('level-intro-text');
      if (game.levelNum === global.Levels.TOTAL) {
        introNum.textContent = '!';
        introText.textContent = global.I18N.t('level_boss');
      } else {
        introNum.textContent = game.levelNum;
        introText.textContent = global.I18N.t('level_intro_format', { n: game.levelNum });
      }
    }

    if (next === STATES.SHOP) {
      global.Shop.updateCoinDisplay();
      global.Shop.renderShop();
    }

    if (next === STATES.VICTORY) {
      const r = document.getElementById('victory-reward');
      r.textContent = global.I18N.t('victory_reward_format', { n: game.pendingReward });
      const btn = document.getElementById('btn-double-coins');
      btn.classList.remove('hidden');
      btn.disabled = false;
    }

    if (next === STATES.DEFEAT) {
      const btn = document.getElementById('btn-revive');
      btn.disabled = false;
      // Save was already updated up to the last level reached.
    }

    if (next === STATES.MENU) {
      updateCoinHud();
    }
  }

  function startLevel() {
    game.levelData = global.Levels.level(game.levelNum);
    game.player = new global.Entities.Player(global.Save.get());
    game.enemies = game.levelData.enemies.map((spec, i) => new global.Entities.Miner(spec));
    game.floatingTexts = [];
    game.levelStartTime = performance.now();
    if (game.levelNum === global.Levels.TOTAL) {
      global.SFX && global.SFX.boss();
    }
    updateLevelLabel();
    updateCoinHud();
    updateHpHud();
    enterState(STATES.PLAYING);
  }

  function maybeShowInterstitial(after) {
    // Show fullscreen between levels — SDK wrapper enforces 60s cooldown.
    global.YGSDK.showFullscreenAd(() => {
      after();
    });
  }

  // ---- Combat resolution ----
  function resolveHits() {
    if (!game.player) return;

    const pBox = game.player.attackBox();
    if (pBox) {
      game.enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        if (global.Entities.rectsOverlap(pBox, enemy.rect())) {
          if (enemy.takeDamage(game.player.dmg)) {
            spawnFloat('-' + game.player.dmg, enemy.x + enemy.w / 2, enemy.y, '#ff5252');
          }
          if (!enemy.alive) {
            const earned = enemy.coinReward;
            spawnFloat('+' + earned + ' ●', enemy.x + enemy.w / 2, enemy.y - 20, '#ffd54f');
          }
        }
      });
    }

    game.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const eBox = enemy.attackBox();
      if (eBox && global.Entities.rectsOverlap(eBox, game.player.rect())) {
        if (game.player.takeDamage(enemy.dmg)) {
          spawnFloat('-' + enemy.dmg, game.player.x + game.player.w / 2, game.player.y, '#ff8a80');
        }
      }
    });
  }

  function spawnFloat(text, x, y, color) {
    game.floatingTexts.push({
      text,
      x,
      y,
      vy: -90,
      life: 0.9,
      color: color || '#fff',
    });
  }

  function checkOutcome() {
    if (!game.player) return;

    if (game.player.hp <= 0) {
      global.SFX && global.SFX.defeat();
      enterState(STATES.DEFEAT);
      return;
    }

    const aliveEnemies = game.enemies.filter((e) => e.alive).length;
    if (aliveEnemies === 0) {
      // Victory: compute coin reward (per kill already counted into pendingReward).
      const killCoins = game.enemies.reduce((sum, e) => sum + e.coinReward, 0);
      const bonus = game.levelData.coinsBonus || 0;
      const base = killCoins + bonus;
      const total = Math.round(base * (1 + (game.player.coinBonus || 0)));
      game.pendingReward = total;
      global.Save.addCoins(total);
      global.Save.setLevelReached(Math.min(global.Levels.TOTAL, game.levelNum + 1));
      global.SFX && global.SFX.levelup();
      // Submit to leaderboard (no-op if not configured).
      global.YGSDK.submitLeaderboard('main', global.Save.get().levelReached * 100 + global.Save.get().coins);
      updateCoinHud();
      enterState(STATES.VICTORY);
    }
  }

  // ---- Render ----
  function render() {
    const ctx = game.ctx;
    const W = global.Entities.WORLD_W;
    const H = global.Entities.WORLD_H;

    // Resize canvas drawing buffer to its CSS size (preserve world coords by scaling).
    fitCanvas();

    // Background depends on level
    const lvl = game.levelData ? game.levelNum : 1;
    global.Render.drawBackground(ctx, W, H, lvl);

    if (game.state === STATES.PLAYING || game.state === STATES.VICTORY || game.state === STATES.DEFEAT) {
      // Entities
      game.enemies.forEach((e) => {
        if (e.alive) e.draw(ctx);
      });
      if (game.player) game.player.draw(ctx);

      // Enemy HP bars
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      game.enemies.forEach((e) => {
        if (!e.alive) return;
        const barW = e.isBoss ? 220 : 80;
        const barH = e.isBoss ? 14 : 6;
        const bx = e.x + e.w / 2 - barW / 2;
        const by = e.y - 14;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx, by, barW, barH);
        const ratio = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = e.isBoss ? '#ff5252' : '#f44336';
        ctx.fillRect(bx, by, barW * ratio, barH);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, barH);
      });

      // Floating texts
      game.floatingTexts.forEach((f) => {
        ctx.fillStyle = f.color;
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      });
    } else {
      // For non-gameplay states, draw a calm scene with the player idling.
      if (game.player) game.player.draw(ctx);
    }
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
    // Scale world (1280x720) into the canvas surface.
    const scale = Math.min(canvas.width / global.Entities.WORLD_W, canvas.height / global.Entities.WORLD_H);
    const offX = (canvas.width - global.Entities.WORLD_W * scale) / 2;
    const offY = (canvas.height - global.Entities.WORLD_H * scale) / 2;
    game.ctx.setTransform(scale, 0, 0, scale, offX, offY);
  }

  // ---- Game loop ----
  function loop(t) {
    const dt = Math.min(0.033, (t - (game.lastTime || t)) / 1000);
    game.lastTime = t;

    if (game.state === STATES.PLAYING && game.player) {
      game.player.update(dt, global.Input.state);
      game.enemies.forEach((e) => e.update(dt, game.player));
      resolveHits();
      checkOutcome();

      // Floating texts decay
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

  // ---- Boot ----
  window.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((err) => {
      console.error('Bootstrap failed', err);
      const lt = document.getElementById('loader-text');
      if (lt) lt.textContent = 'Ошибка загрузки';
    });
  });

  // Expose for debugging.
  global.GAME = game;
})(window);
