// Entity classes: photo hero player + enemy roster.
(function (global) {
  'use strict';

  const GRAVITY = 1800;
  const GROUND_Y = 600;
  const WORLD_W = 1280;
  const WORLD_H = 720;

  const ATTACK_PRESETS = {
    claws: { kind: 'melee', cooldown: 0.34, duration: 0.22, reach: 84, h: 60, speed: 0, size: 0, offsetY: 22, sfx: 'attack' },
    pistol: { kind: 'projectile', cooldown: 0.44, duration: 0.18, reach: 0, speed: 720, size: 12, offsetY: 34, sfx: 'attack' },
    feather: { kind: 'projectile', cooldown: 0.48, duration: 0.2, reach: 0, speed: 600, size: 14, offsetY: 28, sfx: 'attack' },
    laser: { kind: 'projectile', cooldown: 0.62, duration: 0.14, reach: 0, speed: 900, size: 18, offsetY: 30, sfx: 'attack' },
    spray: { kind: 'projectile', cooldown: 0.36, duration: 0.16, reach: 0, speed: 520, size: 16, offsetY: 34, sfx: 'attack' },
    ice: { kind: 'projectile', cooldown: 0.56, duration: 0.2, reach: 0, speed: 560, size: 18, offsetY: 30, sfx: 'attack' },
    cash: { kind: 'projectile', cooldown: 0.4, duration: 0.18, reach: 0, speed: 680, size: 18, offsetY: 26, sfx: 'coin' },
  };

  class Player {
    constructor(saveData) {
      this.w = 92;
      this.h = 128;
      this.x = 200;
      this.y = GROUND_Y - this.h;
      this.vx = 0;
      this.vy = 0;
      this.facing = 1;
      this.onGround = true;
      this.projectiles = [];
      this.hitIds = Object.create(null);

      const hero = global.Heroes.byId(saveData.selectedHero || 'h1');
      const upgrades = saveData.upgrades || {};
      this.hero = hero;
      this.skin = hero.fallbackSkin || 'default';
      this.attackType = hero.attack;
      this.attackPreset = ATTACK_PRESETS[hero.attack] || ATTACK_PRESETS.claws;

      this.maxHp = Math.round((100 + (upgrades.hp || 0) * 20) * (hero.stats.hpMul || 1));
      this.hp = this.maxHp;
      this.dmg = Math.round((10 + (upgrades.damage || 0) * 5) * (hero.stats.dmgMul || 1));
      this.speedBase = Math.round(320 * (1 + (upgrades.speed || 0) * 0.1) * (hero.stats.speedMul || 1));
      this.coinBonus = hero.stats.coinMul || 0;

      this.attackCooldown = 0;
      this.attackTimer = 0;
      this.attackDuration = this.attackPreset.duration;
      this.invuln = 0;
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    attackBox() {
      if (this.attackPreset.kind !== 'melee' || this.attackTimer <= 0) return null;
      const reach = this.attackPreset.reach;
      const ax = this.facing > 0 ? this.x + this.w - 8 : this.x - reach + 8;
      return { x: ax, y: this.y + this.attackPreset.offsetY, w: reach, h: this.attackPreset.h };
    }

    spawnProjectile() {
      const p = this.attackPreset;
      this.projectiles.push({
        id: Math.random().toString(36).slice(2),
        kind: this.attackType,
        x: this.facing > 0 ? this.x + this.w - 4 : this.x + 4,
        y: this.y + p.offsetY,
        vx: this.facing * p.speed,
        vy: 0,
        r: p.size,
        dmg: this.dmg,
        alive: true,
      });
    }

    update(dt, input) {
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;
      this.vx = dir * this.speedBase;
      if (dir !== 0) this.facing = dir;

      if (this.onGround && global.Input.consumeJump()) {
        this.vy = -780;
        this.onGround = false;
        global.SFX && global.SFX.jump();
      }
      this.vy += GRAVITY * dt;

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      if (this.y + this.h >= GROUND_Y) {
        this.y = GROUND_Y - this.h;
        this.vy = 0;
        this.onGround = true;
      }

      if (this.x < 20) this.x = 20;
      if (this.x + this.w > WORLD_W - 20) this.x = WORLD_W - 20 - this.w;

      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.attackTimer = Math.max(0, this.attackTimer - dt);
      if (this.attackCooldown <= 0 && global.Input.consumeAttack()) {
        this.attackCooldown = this.attackPreset.cooldown;
        this.attackTimer = this.attackDuration;
        if (this.attackPreset.kind === 'projectile') this.spawnProjectile();
        if (global.SFX) {
          const sfxName = this.attackPreset.sfx || 'attack';
          global.SFX[sfxName] ? global.SFX[sfxName]() : global.SFX.attack();
        }
      }

      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const shot = this.projectiles[i];
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        if (shot.kind === 'feather') shot.y += Math.sin(shot.x * 0.03) * 0.8;
        if (shot.kind === 'spray') shot.y += Math.sin(performance.now() * 0.02 + i) * 0.4;
        if (shot.x < -50 || shot.x > WORLD_W + 50 || !shot.alive) {
          this.projectiles.splice(i, 1);
        }
      }

      this.invuln = Math.max(0, this.invuln - dt);
    }

    takeDamage(dmg) {
      if (this.invuln > 0) return false;
      this.hp -= dmg;
      this.invuln = 0.7;
      global.SFX && global.SFX.hit();
      this.vx = -this.facing * 200;
      this.vy = -240;
      this.onGround = false;
      return true;
    }

    draw(ctx) {
      const action = this.attackTimer > 0 ? 1 - this.attackTimer / this.attackDuration : 0;
      global.Render.drawHero(ctx, this.x, this.y, this.w, this.h, {
        facing: this.facing,
        action,
        attack: this.attackType,
        skin: this.skin,
        hurt: this.invuln > 0.4,
        spriteId: this.hero.id,
      });
    }
  }

  class Enemy {
    constructor(opts) {
      opts = opts || {};
      this.w = opts.w || (opts.boss ? 150 : 96);
      this.h = opts.h || (opts.boss ? 180 : 124);
      this.x = opts.x !== undefined ? opts.x : 1000;
      this.y = GROUND_Y - this.h;
      this.vx = 0;
      this.vy = 0;
      this.facing = -1;
      this.onGround = true;
      this.type = opts.type || 'zombie';
      this.visual = global.EnemyTypes.get(this.type);

      this.maxHp = opts.hp || 30;
      this.hp = this.maxHp;
      this.dmg = opts.dmg || 8;
      this.speed = opts.speed || 130;
      this.attackCooldown = 0;
      this.attackTimer = 0;
      this.attackDuration = this.type === 'worm' ? 0.28 : 0.4;
      this.invuln = 0;
      this.alive = true;
      this.coinReward = opts.coins || 5;
      this.isBoss = !!opts.boss;
      this.spriteId = this.isBoss ? 'boss1' : null;
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    attackBox() {
      if (this.attackTimer <= 0) return null;
      const reach = this.isBoss ? 120 : this.type === 'worm' ? 90 : 74;
      const ax = this.facing > 0 ? this.x + this.w : this.x - reach;
      return { x: ax, y: this.y + 28, w: reach, h: this.h - 40 };
    }

    update(dt, player) {
      if (!this.alive) return;
      const dx = player.x - this.x;
      this.facing = dx > 0 ? 1 : -1;
      const dist = Math.abs(dx);
      const stopDist = this.isBoss ? 110 : this.type === 'worm' ? 78 : 64;

      if (dist > stopDist) {
        this.vx = this.facing * this.speed;
      } else {
        this.vx = 0;
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.isBoss ? 0.9 : 1.2;
          this.attackTimer = this.attackDuration;
        }
      }

      if ((this.type === 'bat' || this.type === 'ghost') && Math.random() < 0.02) {
        this.vy -= 12;
      }
      if (this.isBoss && this.onGround && dist > 220 && Math.random() < 0.005) {
        this.vy = -700;
        this.onGround = false;
      }

      this.vy += GRAVITY * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      if (this.y + this.h >= GROUND_Y) {
        this.y = GROUND_Y - this.h;
        this.vy = 0;
        this.onGround = true;
      }
      if (this.x < 20) this.x = 20;
      if (this.x + this.w > WORLD_W - 20) this.x = WORLD_W - 20 - this.w;

      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.attackTimer = Math.max(0, this.attackTimer - dt);
      this.invuln = Math.max(0, this.invuln - dt);
    }

    takeDamage(dmg) {
      if (this.invuln > 0) return false;
      this.hp -= dmg;
      this.invuln = 0.25;
      this.vx = -this.facing * 150;
      this.vy = -180;
      this.onGround = false;
      global.SFX && global.SFX.hit();
      if (this.hp <= 0) this.alive = false;
      return true;
    }

    draw(ctx) {
      const swing = this.attackTimer > 0 ? 1 - this.attackTimer / this.attackDuration : 0;
      global.Render.drawEnemy(ctx, this.x, this.y, this.w, this.h, {
        facing: this.facing,
        swing,
        hurt: this.invuln > 0.1,
        boss: this.isBoss,
        type: this.type,
        colors: this.visual.colors,
        spriteId: this.spriteId,
      });
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function projectileRect(p) {
    return { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
  }

  global.Entities = { Player, Enemy, rectsOverlap, projectileRect, GROUND_Y, WORLD_W, WORLD_H };
})(window);
