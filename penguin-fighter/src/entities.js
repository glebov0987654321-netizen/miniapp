// Entity classes: Player (penguin commando), Miner (cubical enemy), Boss.
(function (global) {
  'use strict';

  const GRAVITY = 1800;
  const GROUND_Y = 600; // bottom Y of ground (in 1280x720 world)
  const WORLD_W = 1280;
  const WORLD_H = 720;

  const SKIN_BONUSES = {
    default: { hp: 0, dmg: 0, speed: 0, coins: 0 },
    arctic: { hp: 5, dmg: 0, speed: 0, coins: 0 },
    fire: { hp: 0, dmg: 0.10, speed: 0, coins: 0 },
    ninja: { hp: 0, dmg: 0, speed: 0.15, coins: 0 },
    golden: { hp: 0, dmg: 0, speed: 0, coins: 0.20 },
  };

  class Player {
    constructor(saveData) {
      this.w = 70;
      this.h = 100;
      this.x = 200;
      this.y = GROUND_Y - this.h;
      this.vx = 0;
      this.vy = 0;
      this.facing = 1;
      this.onGround = true;

      const skin = saveData.selectedSkin || 'default';
      const bonus = SKIN_BONUSES[skin] || SKIN_BONUSES.default;
      this.skin = skin;

      const upgrades = saveData.upgrades || {};
      this.maxHp = 100 + (upgrades.hp || 0) * 20 + bonus.hp;
      this.hp = this.maxHp;
      this.dmg = Math.round((10 + (upgrades.damage || 0) * 5) * (1 + bonus.dmg));
      this.speedBase = 320 * (1 + (upgrades.speed || 0) * 0.10) * (1 + bonus.speed);
      this.coinBonus = bonus.coins;

      this.attackCooldown = 0;
      this.attackTimer = 0;
      this.attackDuration = 0.28;
      this.invuln = 0;
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    attackBox() {
      if (this.attackTimer <= 0) return null;
      // Box in front of player based on facing.
      const reach = 60;
      const ax = this.facing > 0 ? this.x + this.w : this.x - reach;
      return { x: ax, y: this.y + 20, w: reach, h: this.h - 30 };
    }

    update(dt, input) {
      // Horizontal
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;
      this.vx = dir * this.speedBase;
      if (dir !== 0) this.facing = dir;

      // Vertical
      if (this.onGround && global.Input.consumeJump()) {
        this.vy = -780;
        this.onGround = false;
        global.SFX && global.SFX.jump();
      }
      this.vy += GRAVITY * dt;

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Ground collision
      if (this.y + this.h >= GROUND_Y) {
        this.y = GROUND_Y - this.h;
        this.vy = 0;
        this.onGround = true;
      }

      // Walls
      if (this.x < 20) this.x = 20;
      if (this.x + this.w > WORLD_W - 20) this.x = WORLD_W - 20 - this.w;

      // Attack
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.attackTimer = Math.max(0, this.attackTimer - dt);
      if (this.attackCooldown <= 0 && global.Input.consumeAttack()) {
        this.attackCooldown = 0.45;
        this.attackTimer = this.attackDuration;
        global.SFX && global.SFX.attack();
      }

      this.invuln = Math.max(0, this.invuln - dt);
    }

    takeDamage(dmg) {
      if (this.invuln > 0) return false;
      this.hp -= dmg;
      this.invuln = 0.7;
      global.SFX && global.SFX.hit();
      // Knockback
      this.vx = -this.facing * 200;
      this.vy = -240;
      this.onGround = false;
      return true;
    }

    draw(ctx) {
      const punch = this.attackTimer > 0 ? 1 - this.attackTimer / this.attackDuration : 0;
      global.Render.drawPenguin(ctx, this.x, this.y, this.w, this.h, {
        facing: this.facing,
        punch,
        skin: this.skin,
        hurt: this.invuln > 0.4,
      });
    }
  }

  class Miner {
    constructor(opts) {
      opts = opts || {};
      this.w = opts.w || 78;
      this.h = opts.h || 110;
      this.x = opts.x !== undefined ? opts.x : 1000;
      this.y = GROUND_Y - this.h;
      this.vx = 0;
      this.vy = 0;
      this.facing = -1;
      this.onGround = true;

      this.maxHp = opts.hp || 30;
      this.hp = this.maxHp;
      this.dmg = opts.dmg || 8;
      this.speed = opts.speed || 130;

      this.attackCooldown = 0;
      this.attackTimer = 0;
      this.attackDuration = 0.4;
      this.invuln = 0;
      this.alive = true;
      this.coinReward = opts.coins || 5;
      this.isBoss = !!opts.boss;
    }

    rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    attackBox() {
      if (this.attackTimer <= 0) return null;
      const reach = this.isBoss ? 100 : 70;
      const ax = this.facing > 0 ? this.x + this.w : this.x - reach;
      return { x: ax, y: this.y + 30, w: reach, h: this.h - 50 };
    }

    update(dt, player) {
      if (!this.alive) return;

      // Face the player
      const dx = player.x - this.x;
      this.facing = dx > 0 ? 1 : -1;

      // AI: chase, attack when close
      const dist = Math.abs(dx);
      if (dist > (this.isBoss ? 70 : 60)) {
        this.vx = this.facing * this.speed;
      } else {
        this.vx = 0;
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.isBoss ? 1.0 : 1.4;
          this.attackTimer = this.attackDuration;
        }
      }

      // Boss occasionally jumps to close the gap
      if (this.isBoss && this.onGround && dist > 200 && Math.random() < 0.005) {
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
      if (this.hp <= 0) {
        this.alive = false;
      }
      return true;
    }

    draw(ctx) {
      const swing = this.attackTimer > 0 ? 1 - this.attackTimer / this.attackDuration : 0;
      global.Render.drawMiner(ctx, this.x, this.y, this.w, this.h, {
        facing: this.facing,
        swing,
        hurt: this.invuln > 0.1,
        boss: this.isBoss,
      });
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  global.Entities = { Player, Miner, rectsOverlap, GROUND_Y, WORLD_W, WORLD_H };
})(window);
