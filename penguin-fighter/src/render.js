// Cartoon renderer with support for photo sprites and procedural enemies.
(function (global) {
  'use strict';

  const SKIN_COLORS = {
    default: { body: '#203349', belly: '#f7fbff', accent: '#ffd54f', trim: '#4fc3f7' },
    arctic: { body: '#dfefff', belly: '#ffffff', accent: '#7ec8ff', trim: '#d8f3ff' },
    fire: { body: '#40201b', belly: '#ffd6a3', accent: '#ff7043', trim: '#ffb74d' },
    ninja: { body: '#111827', belly: '#2a3342', accent: '#ef5350', trim: '#b0bec5' },
    golden: { body: '#6d5317', belly: '#fff4c2', accent: '#ffd54f', trim: '#ffec8b' },
  };

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawShadow(ctx, x, y, w, h, alpha) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,' + (alpha || 0.2) + ')';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 6, w * 0.35, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawImageSprite(ctx, img, x, y, w, h, facing, hurt) {
    ctx.save();
    if (hurt) ctx.filter = 'brightness(1.5) saturate(0.5)';
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing || 1, 1);
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, -dw / 2, h / 2 - dh, dw, dh);
    ctx.restore();
  }

  function drawFallbackHero(ctx, x, y, w, h, options) {
    options = options || {};
    const facing = options.facing || 1;
    const skinId = options.skin || 'default';
    const colors = SKIN_COLORS[skinId] || SKIN_COLORS.default;
    const attack = options.attack || 'claws';
    const action = options.action || 0;
    const hurt = options.hurt;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing, 1);
    if (hurt) ctx.filter = 'brightness(1.5) saturate(0.5)';

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.15, w * 0.28, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.34, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.belly;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.04, w * 0.2, h * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(0, -h * 0.28, w * 0.2, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#101418';
    ctx.beginPath();
    ctx.arc(-w * 0.08, -h * 0.16, w * 0.03, 0, Math.PI * 2);
    ctx.arc(w * 0.08, -h * 0.16, w * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffb74d';
    ctx.lineWidth = w * 0.06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.02);
    ctx.lineTo(w * (0.38 + action * 0.25), -h * 0.02);
    ctx.stroke();

    ctx.strokeStyle = colors.trim;
    ctx.lineWidth = w * 0.07;
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, h * 0.3);
    ctx.lineTo(-w * 0.08, h * 0.46);
    ctx.moveTo(w * 0.16, h * 0.3);
    ctx.lineTo(w * 0.08, h * 0.46);
    ctx.stroke();

    drawWeapon(ctx, attack, w, h, action);
    ctx.restore();
  }

  function drawWeapon(ctx, attack, w, h, action) {
    ctx.save();
    ctx.translate(w * 0.16, h * 0.02);
    switch (attack) {
      case 'pistol':
        ctx.fillStyle = '#424242';
        roundRect(ctx, w * 0.08, -h * 0.04, w * 0.22, h * 0.08, 8);
        ctx.fill();
        ctx.fillRect(w * 0.18, h * 0.03, w * 0.05, h * 0.12);
        break;
      case 'laser':
        ctx.strokeStyle = '#80d8ff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(w * 0.12, 0);
        ctx.lineTo(w * 0.32, -h * 0.02);
        ctx.stroke();
        break;
      case 'spray':
        ctx.fillStyle = '#66bb6a';
        roundRect(ctx, w * 0.08, -h * 0.06, w * 0.13, h * 0.18, 8);
        ctx.fill();
        break;
      case 'ice':
        ctx.fillStyle = '#90caf9';
        ctx.beginPath();
        ctx.moveTo(w * 0.1, 0);
        ctx.lineTo(w * 0.28, -h * 0.08);
        ctx.lineTo(w * 0.3, h * 0.02);
        ctx.closePath();
        ctx.fill();
        break;
      case 'cash':
        ctx.fillStyle = '#81c784';
        ctx.fillRect(w * 0.08, -h * 0.08, w * 0.22, h * 0.14);
        break;
      case 'feather':
        ctx.strokeStyle = '#fff59d';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(w * 0.08, 0);
        ctx.quadraticCurveTo(w * 0.2, -h * 0.12, w * 0.26, h * 0.02);
        ctx.stroke();
        break;
      default:
        ctx.fillStyle = '#ef5350';
        ctx.beginPath();
        ctx.arc(w * (0.12 + action * 0.18), -h * 0.02, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  function drawHero(ctx, x, y, w, h, options) {
    options = options || {};
    const img = options.spriteId ? global.Sprites.get(options.spriteId) : null;
    drawShadow(ctx, x, y, w, h, 0.2);
    if (img) {
      drawImageSprite(ctx, img, x, y, w, h, options.facing || 1, options.hurt);
      if (options.attack) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(options.facing || 1, 1);
        drawWeapon(ctx, options.attack, w, h, options.action || 0);
        ctx.restore();
      }
      return;
    }
    drawFallbackHero(ctx, x, y, w, h, options);
  }

  function drawEnemy(ctx, x, y, w, h, options) {
    options = options || {};
    const facing = options.facing || -1;
    const type = options.type || 'zombie';
    const colors = (options.colors || {});
    const hurt = options.hurt;
    const swing = options.swing || 0;
    const img = options.spriteId ? global.Sprites.get(options.spriteId) : null;

    drawShadow(ctx, x, y, w, h, options.boss ? 0.28 : 0.2);
    if (img) {
      drawImageSprite(ctx, img, x, y, w, h, facing, hurt);
      return;
    }

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing, 1);
    if (hurt) ctx.filter = 'brightness(1.7) saturate(0.6)';

    const body = colors.body || '#7cb342';
    const head = colors.head || '#558b2f';
    const accent = colors.accent || '#2e7d32';
    const eye = colors.eye || '#fff';

    if (type === 'worm') {
      ctx.fillStyle = body;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(-w * 0.18 + i * w * 0.12, h * 0.12 - Math.abs(1.5 - i) * 8, w * 0.16, h * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.ellipse(w * 0.18, h * 0.04, w * 0.18, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'slime' || type === 'ghost') {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-w * 0.28, h * 0.28);
      ctx.quadraticCurveTo(-w * 0.34, -h * 0.24, 0, -h * 0.3);
      ctx.quadraticCurveTo(w * 0.34, -h * 0.24, w * 0.28, h * 0.28);
      ctx.quadraticCurveTo(w * 0.18, h * 0.14, w * 0.08, h * 0.28);
      ctx.quadraticCurveTo(0, h * 0.12, -w * 0.08, h * 0.28);
      ctx.quadraticCurveTo(-w * 0.18, h * 0.14, -w * 0.28, h * 0.28);
      ctx.fill();
    } else {
      ctx.fillStyle = body;
      roundRect(ctx, -w * 0.28, -h * 0.08, w * 0.56, h * 0.42, 22);
      ctx.fill();
      ctx.fillStyle = head;
      roundRect(ctx, -w * 0.22, -h * 0.34, w * 0.44, h * 0.26, 18);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillRect(-w * 0.22, h * 0.1, w * 0.09, h * 0.34);
      ctx.fillRect(w * 0.13, h * 0.1, w * 0.09, h * 0.34);
    }

    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(-w * 0.08, -h * 0.22, w * 0.04, 0, Math.PI * 2);
    ctx.arc(w * 0.08, -h * 0.22, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#101418';
    ctx.beginPath();
    ctx.arc(-w * 0.06, -h * 0.22, w * 0.018, 0, Math.PI * 2);
    ctx.arc(w * 0.1, -h * 0.22, w * 0.018, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.18, -h * 0.02);
    ctx.lineTo(w * (0.32 + swing * 0.12), -h * (0.08 + swing * 0.06));
    ctx.stroke();

    if (options.boss) {
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.moveTo(-w * 0.18, -h * 0.36);
      ctx.lineTo(-w * 0.08, -h * 0.48);
      ctx.lineTo(0, -h * 0.34);
      ctx.lineTo(w * 0.08, -h * 0.48);
      ctx.lineTo(w * 0.18, -h * 0.36);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawProjectile(ctx, projectile) {
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    switch (projectile.kind) {
      case 'pistol':
        ctx.fillStyle = '#ffd54f';
        roundRect(ctx, -10, -3, 20, 6, 3);
        ctx.fill();
        break;
      case 'laser':
        ctx.fillStyle = '#80d8ff';
        roundRect(ctx, -24, -4, 48, 8, 4);
        ctx.fill();
        break;
      case 'spray':
        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'ice':
        ctx.fillStyle = '#90caf9';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(0, -7);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 7);
        ctx.closePath();
        ctx.fill();
        break;
      case 'cash':
        ctx.fillStyle = '#81c784';
        ctx.fillRect(-12, -8, 24, 16);
        break;
      case 'feather':
        ctx.strokeStyle = '#fff59d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 5);
        ctx.quadraticCurveTo(0, -10, 10, 0);
        ctx.stroke();
        break;
      default:
        ctx.fillStyle = '#ef5350';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  function drawBackground(ctx, w, h, level) {
    const bgId = level >= 7 ? 'bg3' : level >= 4 ? 'bg2' : 'bg1';
    const bgImg = global.Sprites && global.Sprites.get(bgId);
    if (bgImg) {
      // cover the canvas keeping aspect ratio
      const iw = bgImg.naturalWidth || bgImg.width;
      const ih = bgImg.naturalHeight || bgImg.height;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(bgImg, dx, dy, dw, dh);
      // dim overlay so heroes/enemies pop and the photo feels "horror-school"
      ctx.fillStyle = 'rgba(8, 12, 26, 0.45)';
      ctx.fillRect(0, 0, w, h);
      // ground strip so the floor reads clearly
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      return;
    }
    const tint = backgroundTint(level);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, tint.skyTop);
    grad.addColorStop(0.55, tint.skyBottom);
    grad.addColorStop(0.56, tint.groundTop);
    grad.addColorStop(1, tint.groundBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(120 + i * 180, 90 + (i % 2) * 22, 28 + (i % 3) * 12, 0, Math.PI * 2);
      ctx.arc(150 + i * 180, 82 + (i % 2) * 18, 36, 0, Math.PI * 2);
      ctx.arc(182 + i * 180, 92 + (i % 2) * 20, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = tint.mountainBack;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.6);
    ctx.lineTo(w * 0.12, h * 0.36);
    ctx.lineTo(w * 0.26, h * 0.56);
    ctx.lineTo(w * 0.48, h * 0.28);
    ctx.lineTo(w * 0.7, h * 0.56);
    ctx.lineTo(w * 0.92, h * 0.34);
    ctx.lineTo(w, h * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = tint.mountainFront;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.lineTo(w * 0.18, h * 0.42);
    ctx.lineTo(w * 0.34, h * 0.58);
    ctx.lineTo(w * 0.56, h * 0.34);
    ctx.lineTo(w * 0.74, h * 0.58);
    ctx.lineTo(w, h * 0.44);
    ctx.lineTo(w, h * 0.64);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = tint.groundTop;
    ctx.fillRect(0, h * 0.6, w, h * 0.08);
    ctx.fillStyle = tint.groundBottom;
    ctx.fillRect(0, h * 0.68, w, h * 0.32);

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(80 + i * 130, h * 0.66 + (i % 3) * 8, 22 - (i % 2) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function backgroundTint(level) {
    if (level >= 10) {
      return {
        skyTop: '#300d24',
        skyBottom: '#912f56',
        mountainBack: '#40102f',
        mountainFront: '#5e183f',
        groundTop: '#ffb347',
        groundBottom: '#6d2644',
      };
    }
    if (level >= 7) {
      return {
        skyTop: '#0c1d4f',
        skyBottom: '#3949ab',
        mountainBack: '#15245f',
        mountainFront: '#1d2f7f',
        groundTop: '#a5d6ff',
        groundBottom: '#26418a',
      };
    }
    if (level >= 4) {
      return {
        skyTop: '#6a4cff',
        skyBottom: '#ff8a65',
        mountainBack: '#5b3fc9',
        mountainFront: '#7c4dff',
        groundTop: '#ffe082',
        groundBottom: '#8d5a7c',
      };
    }
    return {
      skyTop: '#65c7f7',
      skyBottom: '#c7f0ff',
      mountainBack: '#7db1ff',
      mountainFront: '#4f83ff',
      groundTop: '#fff9c4',
      groundBottom: '#7ecb78',
    };
  }

  function drawSkinPreview(canvas, heroId) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hero = global.Heroes && global.Heroes.byId(heroId);
    drawHero(ctx, 4, 4, canvas.width - 8, canvas.height - 8, {
      spriteId: hero ? hero.id : null,
      attack: hero ? hero.attack : 'claws',
      skin: hero ? hero.fallbackSkin : 'default',
      facing: 1,
      action: 0.35,
    });
  }

  global.Render = {
    drawHero,
    drawEnemy,
    drawProjectile,
    drawCoin,
    drawBackground,
    drawSkinPreview,
    SKIN_COLORS,
  };

  function drawCoin(ctx, x, y, r, t) {
    const wobble = Math.cos(t * 0.008);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.max(0.15, Math.abs(wobble)), 1);
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ff9800';
    ctx.font = 'bold ' + r * 1.1 + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    ctx.restore();
  }
})(window);
