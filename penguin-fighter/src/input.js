// Unified input — keyboard + touch buttons.
(function (global) {
  'use strict';

  const state = {
    left: false,
    right: false,
    jump: false, // edge-triggered; consumed by game loop
    attack: false, // edge-triggered
    pause: false,
  };

  let listening = false;

  function init() {
    if (listening) return;
    listening = true;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const consumed = handleKey(e.key, true);
      if (consumed) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      const consumed = handleKey(e.key, false);
      if (consumed) e.preventDefault();
    });

    // Touch buttons
    bindHold('btn-left', 'left');
    bindHold('btn-right', 'right');
    bindTap('btn-jump', 'jump');
    bindTap('btn-attack', 'attack');
  }

  function handleKey(key, down) {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
      case 'ф':
      case 'Ф':
        state.left = down;
        return true;
      case 'ArrowRight':
      case 'd':
      case 'D':
      case 'в':
      case 'В':
        state.right = down;
        return true;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case 'ц':
      case 'Ц':
      case ' ':
        if (key === ' ') {
          if (down) state.attack = true;
        } else {
          if (down) state.jump = true;
        }
        return true;
      case 'Escape':
        if (down) state.pause = true;
        return true;
      default:
        return false;
    }
  }

  function bindHold(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const down = (e) => {
      e.preventDefault();
      state[key] = true;
    };
    const up = (e) => {
      e.preventDefault();
      state[key] = false;
    };
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchend', up, { passive: false });
    el.addEventListener('touchcancel', up, { passive: false });
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);
    el.addEventListener('mouseleave', up);
  }

  function bindTap(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const fire = (e) => {
      e.preventDefault();
      state[key] = true;
    };
    el.addEventListener('touchstart', fire, { passive: false });
    el.addEventListener('mousedown', fire);
  }

  function consumeJump() {
    const v = state.jump;
    state.jump = false;
    return v;
  }

  function consumeAttack() {
    const v = state.attack;
    state.attack = false;
    return v;
  }

  function consumePause() {
    const v = state.pause;
    state.pause = false;
    return v;
  }

  global.Input = {
    init,
    state,
    consumeJump,
    consumeAttack,
    consumePause,
  };
})(window);
