// Yandex Games SDK wrapper
// - On the Yandex platform: uses real ysdk methods
// - In local dev / outside Yandex: provides a mock so the game runs unchanged.
(function (global) {
  'use strict';

  const TAG = '[YGSDK]';

  const state = {
    ysdk: null,
    player: null,
    leaderboards: null,
    ready: false,
    isReal: false,
    lang: 'ru',
    canShowFullscreen: true, // throttle (Yandex enforces 60s cooldown on fullscreen)
    fullscreenCooldownMs: 60000,
    bannerVisible: false,
  };

  function log() {
    // Lightweight debug logger that only fires when ?debug-mode=16 is set
    // (Yandex Games debug indicator) or in localhost.
    const params = new URLSearchParams(location.search);
    if (params.get('debug-mode') === '16' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      // eslint-disable-next-line no-console
      console.log.apply(console, [TAG].concat(Array.from(arguments)));
    }
  }

  async function init() {
    if (typeof global.YaGames === 'undefined') {
      log('YaGames is not defined — running in local/mock mode.');
      installMock();
      state.ready = true;
      return state;
    }
    try {
      const ysdk = await global.YaGames.init();
      state.ysdk = ysdk;
      state.isReal = true;

      // Language from Yandex environment.
      try {
        const lang = (ysdk.environment && ysdk.environment.i18n && ysdk.environment.i18n.lang) || 'ru';
        state.lang = lang === 'ru' ? 'ru' : 'en';
      } catch (e) {
        state.lang = 'ru';
      }

      // Player (for cloud saves).
      try {
        state.player = await ysdk.getPlayer({ scopes: false });
      } catch (e) {
        log('getPlayer failed (probably unauthorized user) — using anonymous local saves.', e);
      }

      // Leaderboards (optional, gracefully degrade if not configured).
      try {
        state.leaderboards = await ysdk.getLeaderboards();
      } catch (e) {
        log('Leaderboards not configured yet — skip.');
      }

      // Signal Yandex that the game is loaded (closes the platform loader).
      try {
        ysdk.features.LoadingAPI.ready();
      } catch (e) {
        log('LoadingAPI.ready failed (older SDK).', e);
      }

      log('Initialized. lang=', state.lang);
      state.ready = true;
      return state;
    } catch (err) {
      log('YaGames.init() failed, falling back to mock.', err);
      installMock();
      state.ready = true;
      return state;
    }
  }

  // Local mock so devs can play the game outside Yandex.
  function installMock() {
    state.isReal = false;
    state.ysdk = {
      adv: {
        showFullscreenAdv(opts) {
          showAdMock('Fullscreen', opts && opts.callbacks);
        },
        showRewardedVideo(opts) {
          showAdMock('Rewarded', opts && opts.callbacks, true);
        },
        getBannerAdvStatus() {
          return Promise.resolve({ stickyAdvIsShowing: state.bannerVisible });
        },
        showBannerAdv() {
          state.bannerVisible = true;
          showBannerMock(true);
          return Promise.resolve({ stickyAdvIsShowing: true });
        },
        hideBannerAdv() {
          state.bannerVisible = false;
          showBannerMock(false);
          return Promise.resolve({ stickyAdvIsShowing: false });
        },
      },
      features: { LoadingAPI: { ready: () => {} } },
      environment: { i18n: { lang: state.lang } },
      getPlayer: () => Promise.resolve(null),
      getLeaderboards: () => Promise.resolve(null),
    };
  }

  function showAdMock(label, cb, withReward) {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;text-align:center;padding:24px;';
    overlay.innerHTML =
      '<div style="font-size:14px;letter-spacing:3px;opacity:0.6;margin-bottom:12px;">MOCK AD — ' +
      label +
      '</div>' +
      '<div style="font-size:22px;margin-bottom:24px;">Реклама проиграется ' +
      (withReward ? '4' : '2') +
      ' сек</div>' +
      '<div id="ad-mock-timer" style="font-size:48px;font-weight:700;color:#4fc3f7;"></div>';
    document.body.appendChild(overlay);
    if (cb && cb.onOpen) cb.onOpen();
    let seconds = withReward ? 4 : 2;
    const timerEl = overlay.querySelector('#ad-mock-timer');
    timerEl.textContent = seconds;
    const interval = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(interval);
        if (withReward && cb && cb.onRewarded) cb.onRewarded();
        document.body.removeChild(overlay);
        if (cb && cb.onClose) cb.onClose(true);
      } else {
        timerEl.textContent = seconds;
      }
    }, 1000);
  }

  function showBannerMock(visible) {
    let el = document.getElementById('mock-sticky-banner');
    if (visible) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'mock-sticky-banner';
        el.textContent = 'MOCK STICKY BANNER';
        el.style.cssText =
          'position:fixed;left:0;right:0;bottom:0;background:rgba(255,193,7,0.85);color:#1a1a1a;font-weight:700;letter-spacing:2px;font-family:sans-serif;text-align:center;padding:8px;font-size:12px;z-index:9998;';
        document.body.appendChild(el);
      }
    } else if (el) {
      el.remove();
    }
  }

  // ---- Public API used by the game ----

  function showFullscreenAd(onClose) {
    if (!state.ready) {
      if (onClose) onClose(false);
      return;
    }
    if (!state.canShowFullscreen) {
      log('Fullscreen ad skipped — still on cooldown.');
      if (onClose) onClose(false);
      return;
    }
    state.canShowFullscreen = false;
    setTimeout(() => {
      state.canShowFullscreen = true;
    }, state.fullscreenCooldownMs);

    state.ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: () => log('Fullscreen open'),
        onClose: (wasShown) => {
          log('Fullscreen closed wasShown=', wasShown);
          if (onClose) onClose(wasShown);
        },
        onError: (err) => {
          log('Fullscreen error', err);
          if (onClose) onClose(false);
        },
      },
    });
  }

  function showRewardedAd(onReward, onClose) {
    if (!state.ready) {
      if (onClose) onClose(false);
      return;
    }
    let rewarded = false;
    state.ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => log('Rewarded open'),
        onRewarded: () => {
          log('Rewarded granted');
          rewarded = true;
          if (onReward) onReward();
        },
        onClose: (wasShown) => {
          log('Rewarded closed wasShown=', wasShown, 'rewarded=', rewarded);
          if (onClose) onClose(wasShown && rewarded);
        },
        onError: (err) => {
          log('Rewarded error', err);
          if (onClose) onClose(false);
        },
      },
    });
  }

  async function showBanner() {
    if (!state.ready) return false;
    try {
      const status = await state.ysdk.adv.getBannerAdvStatus();
      if (status.stickyAdvIsShowing) return true;
      const res = await state.ysdk.adv.showBannerAdv();
      return !!res.stickyAdvIsShowing;
    } catch (e) {
      log('showBanner failed', e);
      return false;
    }
  }

  async function hideBanner() {
    if (!state.ready) return;
    try {
      await state.ysdk.adv.hideBannerAdv();
    } catch (e) {
      log('hideBanner failed', e);
    }
  }

  async function cloudSave(data) {
    if (state.player && state.player.setData) {
      try {
        await state.player.setData(data, true);
        log('Cloud save ok');
        return true;
      } catch (e) {
        log('Cloud save failed', e);
      }
    }
    return false;
  }

  async function cloudLoad() {
    if (state.player && state.player.getData) {
      try {
        const data = await state.player.getData();
        log('Cloud load ok');
        return data || null;
      } catch (e) {
        log('Cloud load failed', e);
      }
    }
    return null;
  }

  async function submitLeaderboard(leaderboardName, score) {
    if (!state.leaderboards) return;
    try {
      await state.leaderboards.setLeaderboardScore(leaderboardName, score);
      log('Leaderboard submit ok', leaderboardName, score);
    } catch (e) {
      log('Leaderboard submit failed', e);
    }
  }

  function getLang() {
    return state.lang;
  }

  function isReal() {
    return state.isReal;
  }

  global.YGSDK = {
    init,
    showFullscreenAd,
    showRewardedAd,
    showBanner,
    hideBanner,
    cloudSave,
    cloudLoad,
    submitLeaderboard,
    getLang,
    isReal,
    get lang() {
      return state.lang;
    },
  };
})(window);
