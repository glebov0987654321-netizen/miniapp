// Procedural sprite rendering for the penguin commando and cubical miners.
// Drawn entirely with canvas primitives — no PNG/JPG assets needed.
(function (global) {
  'use strict';

  const SKIN_COLORS = {
    default: { body: '#202830', belly: '#f5f5f5', accent: '#ffd54f', goggles: '#1a1a1a' },
    arctic: { body: '#dde6ee', belly: '#ffffff', accent: '#7ec0f4', goggles: '#1a1a1a' },
    fire: { body: '#3c1a14', belly: '#ffbf69', accent: '#ff5722', goggles: '#1a1a1a' },
    ninja: { body: '#15171f', belly: '#2a2f3c', accent: '#e53935', goggles: '#fafafa' },
    golden: { body: '#5c4a1f', belly: '#fff3c0', accent: '#ffd54f', goggles: '#1a1a1a' },
  };

  function drawPenguin(ctx, x, y, w, h, options) {
    options = options || {};
    const facing = options.facing || 1; // 1 = right, -1 = left
    const punch = options.punch || 0; // 0..1 punch progress
    const skinId = options.skin || 'default';
    const colors = SKIN_COLORS[skinId] || SKIN_COLORS.default;
    const hurt = options.hurt;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing, 1);

    if (hurt) {
      ctx.filter = 'brightness(2) saturate(0)';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, h / 2 - 2, w * 0.4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (oval)
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.42, h * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly
    ctx.fillStyle = colors.belly;
    ctx.beginPath();
    ctx.ellipse(w * 0.04, h * 0.06, w * 0.28, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beret / cap (commando-style)
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.ellipse(-w * 0.05, -h * 0.4, w * 0.3, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // Beret puff
    ctx.beginPath();
    ctx.arc(w * 0.16, -h * 0.46, w * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Eyes / goggles strip
    ctx.fillStyle = colors.goggles;
    ctx.fillRect(-w * 0.22, -h * 0.28, w * 0.45, h * 0.1);
    // Goggle lenses
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(-w * 0.08, -h * 0.23, w * 0.06, 0, Math.PI * 2);
    ctx.arc(w * 0.12, -h * 0.23, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // Lens highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w * 0.1, -h * 0.26, w * 0.02, h * 0.02);
    ctx.fillRect(w * 0.1, -h * 0.26, w * 0.02, h * 0.02);

    // Beak
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(w * 0.16, -h * 0.06);
    ctx.lineTo(w * 0.36, -h * 0.02);
    ctx.lineTo(w * 0.16, h * 0.04);
    ctx.closePath();
    ctx.fill();

    // Arm (punch animation)
    ctx.fillStyle = colors.body;
    const armLength = w * (0.18 + punch * 0.42);
    ctx.beginPath();
    ctx.ellipse(w * 0.34 + armLength * 0.4, h * 0.04, armLength * 0.55, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fist
    if (punch > 0.2) {
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(w * 0.34 + armLength * 0.85, h * 0.04, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Back arm
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(-w * 0.34, h * 0.04, w * 0.12, h * 0.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.ellipse(-w * 0.15, h * 0.48, w * 0.12, h * 0.05, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.15, h * 0.48, w * 0.12, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawMiner(ctx, x, y, w, h, options) {
    options = options || {};
    const facing = options.facing || -1;
    const swing = options.swing || 0; // 0..1 pickaxe swing
    const hurt = options.hurt;
    const isBoss = options.boss;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing, 1);

    if (hurt) {
      ctx.filter = 'brightness(2) saturate(0)';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, h / 2 - 2, w * 0.42, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (two pixel blocks)
    ctx.fillStyle = isBoss ? '#5d4037' : '#3e2723';
    ctx.fillRect(-w * 0.28, h * 0.2, w * 0.22, h * 0.3);
    ctx.fillRect(w * 0.06, h * 0.2, w * 0.22, h * 0.3);

    // Torso (cube)
    ctx.fillStyle = isBoss ? '#b71c1c' : '#5d4037';
    ctx.fillRect(-w * 0.36, -h * 0.05, w * 0.72, h * 0.3);
    // Torso shading
    ctx.fillStyle = isBoss ? '#7f0000' : '#3e2723';
    ctx.fillRect(-w * 0.36, -h * 0.05, w * 0.72, h * 0.06);

    // Arms (boxy)
    ctx.fillStyle = isBoss ? '#bf360c' : '#6d4c41';
    ctx.fillRect(-w * 0.48, -h * 0.05, w * 0.12, h * 0.3);
    ctx.fillRect(w * 0.36, -h * 0.05, w * 0.12, h * 0.3);

    // Head (cube)
    ctx.fillStyle = isBoss ? '#388e3c' : '#7cb342';
    ctx.fillRect(-w * 0.3, -h * 0.42, w * 0.6, h * 0.36);
    // Face shadow
    ctx.fillStyle = isBoss ? '#1b5e20' : '#558b2f';
    ctx.fillRect(-w * 0.3, -h * 0.42, w * 0.6, h * 0.05);

    // Eyes (angry pixel eyes)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w * 0.2, -h * 0.3, w * 0.12, h * 0.08);
    ctx.fillRect(w * 0.08, -h * 0.3, w * 0.12, h * 0.08);
    ctx.fillStyle = '#000';
    ctx.fillRect(-w * 0.14, -h * 0.28, w * 0.05, h * 0.05);
    ctx.fillRect(w * 0.12, -h * 0.28, w * 0.05, h * 0.05);

    // Frowning mouth
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-w * 0.12, -h * 0.16, w * 0.24, h * 0.04);

    // Pickaxe (held in front arm, swings)
    ctx.save();
    ctx.translate(w * 0.42, -h * 0.05);
    ctx.rotate(-0.4 + swing * 1.6);
    // Handle
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, -2, w * 0.36, 5);
    // Head
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(w * 0.32, -h * 0.12, w * 0.16, h * 0.16);
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(w * 0.32, -h * 0.12, w * 0.16, h * 0.04);
    ctx.restore();

    // Boss crown
    if (isBoss) {
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, -h * 0.42);
      ctx.lineTo(-w * 0.18, -h * 0.55);
      ctx.lineTo(-w * 0.06, -h * 0.42);
      ctx.lineTo(0, -h * 0.55);
      ctx.lineTo(w * 0.06, -h * 0.42);
      ctx.lineTo(w * 0.18, -h * 0.55);
      ctx.lineTo(w * 0.3, -h * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(-w * 0.18, -h * 0.53, 3, 0, Math.PI * 2);
      ctx.arc(0, -h * 0.53, 3, 0, Math.PI * 2);
      ctx.arc(w * 0.18, -h * 0.53, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawCoin(ctx, x, y, r, t) {
    const wobble = Math.cos(t * 0.008);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(wobble, 1);
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff9800';
    ctx.stroke();
    ctx.font = 'bold ' + r * 1.1 + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff9800';
    ctx.fillText('$', 0, 0);
    ctx.restore();
  }

  function drawBackground(ctx, w, h, level) {
    // Sky already drawn via CSS, but for level-specific tint we paint over.
    const tint = backgroundTint(level);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, tint.skyTop);
    grad.addColorStop(0.6, tint.skyBottom);
    grad.addColorStop(0.6, tint.ground);
    grad.addColorStop(1, tint.groundBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Mountains in background
    ctx.fillStyle = tint.mountain;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.6);
    ctx.lineTo(w * 0.18, h * 0.3);
    ctx.lineTo(w * 0.35, h * 0.55);
    ctx.lineTo(w * 0.55, h * 0.25);
    ctx.lineTo(w * 0.78, h * 0.5);
    ctx.lineTo(w * 1.0, h * 0.32);
    ctx.lineTo(w, h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Snow / ground line
    ctx.fillStyle = tint.groundTop;
    ctx.fillRect(0, h * 0.6 - 4, w, 8);
  }

  function backgroundTint(level) {
    // 1-3 : day, 4-6 : dusk, 7-9 : night, 10 : boss volcano
    if (level >= 10) {
      return {
        skyTop: '#3a1010',
        skyBottom: '#8a1818',
        mountain: '#2a0a0a',
        ground: '#7a3a0c',
        groundTop: '#ff6f00',
        groundBottom: '#3a1a04',
      };
    }
    if (level >= 7) {
      return {
        skyTop: '#0a1432',
        skyBottom: '#1c2a5a',
        mountain: '#080a18',
        ground: '#1a1f3a',
        groundTop: '#c5d6ff',
        groundBottom: '#0a0f1e',
      };
    }
    if (level >= 4) {
      return {
        skyTop: '#4a2a5a',
        skyBottom: '#ff7043',
        mountain: '#28184a',
        ground: '#9c4a3a',
        groundTop: '#ffd54f',
        groundBottom: '#3a1828',
      };
    }
    return {
      skyTop: '#4a7ab8',
      skyBottom: '#bcd6f4',
      mountain: '#3a5478',
      ground: '#cfe4ff',
      groundTop: '#ffffff',
      groundBottom: '#7c9cc4',
    };
  }

  function drawSkinPreview(canvas, skinId) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPenguin(ctx, 5, 0, canvas.width - 10, canvas.height, { skin: skinId, facing: 1, punch: 0 });
  }

  global.Render = {
    drawPenguin,
    drawMiner,
    drawCoin,
    drawBackground,
    drawSkinPreview,
    SKIN_COLORS,
  };
})(window);
