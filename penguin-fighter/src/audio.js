// Minimal procedural audio — no external mp3/wav assets needed.
// Generates short SFX with WebAudio so the ZIP archive stays tiny.
(function (global) {
  'use strict';

  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      const AC = global.AudioContext || global.webkitAudioContext;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function beep(freq, dur, type, gain) {
    if (muted) return;
    const ac = ensureCtx();
    if (!ac) return;
    const now = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain || 0.15, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start(now);
    o.stop(now + dur);
  }

  function noise(dur, gain) {
    if (muted) return;
    const ac = ensureCtx();
    if (!ac) return;
    const now = ac.currentTime;
    const bufferSize = ac.sampleRate * dur;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain || 0.2, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(g);
    g.connect(ac.destination);
    src.start(now);
  }

  function resumeOnGesture() {
    const ac = ensureCtx();
    if (ac && ac.state === 'suspended') {
      ac.resume().catch(() => {});
    }
  }

  global.SFX = {
    attack: () => {
      beep(420, 0.08, 'square', 0.12);
      setTimeout(() => noise(0.05, 0.08), 30);
    },
    hit: () => {
      beep(180, 0.1, 'sawtooth', 0.18);
    },
    jump: () => {
      beep(300, 0.1, 'sine', 0.12);
      setTimeout(() => beep(420, 0.08, 'sine', 0.08), 50);
    },
    coin: () => {
      beep(880, 0.08, 'triangle', 0.16);
      setTimeout(() => beep(1320, 0.1, 'triangle', 0.12), 60);
    },
    levelup: () => {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => beep(f, 0.18, 'sine', 0.14), i * 100);
      });
    },
    defeat: () => {
      [392, 330, 261, 196].forEach((f, i) => {
        setTimeout(() => beep(f, 0.25, 'sawtooth', 0.16), i * 130);
      });
    },
    boss: () => {
      noise(0.4, 0.15);
      setTimeout(() => beep(110, 0.6, 'sawtooth', 0.25), 50);
    },
    click: () => beep(660, 0.05, 'square', 0.08),
    setMuted: (m) => {
      muted = !!m;
    },
    resumeOnGesture,
  };
})(window);
