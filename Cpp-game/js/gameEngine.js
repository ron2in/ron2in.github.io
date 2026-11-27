/**
 * gameEngine.js
 * 2D Pixel Art Canvas рендерер подземелья.
 * Процедурно генерирует пиксельные спрайты, тайлы, факелы, частицы и боевые анимации.
 * Изолирован от остального DOM (работает только с переданным Canvas).
 */

const PALETTES = {
  hero: {
    '.': null,
    'H': '#cbd5e1', // шлем/сталь
    'D': '#64748b', // тень стали
    'B': '#3b82f6', // плащ мага
    'N': '#1d4ed8', // темный плащ
    'F': '#fde68a', // лицо
    'E': '#0f172a', // глаза
    'S': '#f59e0b', // золото/рукоять
    'C': '#38bdf8'  // кристалл посоха
  },
  slime: {
    '.': null,
    'G': '#22c55e',
    'L': '#86efac',
    'D': '#15803d',
    'E': '#0f172a'
  },
  slime_boss: {
    '.': null,
    'G': '#16a34a',
    'L': '#4ade80',
    'D': '#14532d',
    'E': '#ef4444',
    'Y': '#facc15' // корона
  },
  skeleton: {
    '.': null,
    'W': '#e2e8f0',
    'G': '#94a3b8',
    'D': '#334155',
    'E': '#ef4444'
  },
  skeleton_boss: {
    '.': null,
    'W': '#f1f5f9',
    'G': '#64748b',
    'D': '#1e293b',
    'E': '#a855f7',
    'P': '#7e22ce'
  },
  golem: {
    '.': null,
    'S': '#78716c',
    'L': '#a8a29e',
    'D': '#44403c',
    'C': '#38bdf8'
  },
  demon: {
    '.': null,
    'R': '#dc2626',
    'D': '#7f1d1d',
    'K': '#18181b',
    'Y': '#facc15',
    'E': '#fef08a'
  },
  architect: {
    '.': null,
    'P': '#9333ea',
    'D': '#3b0764',
    'G': '#facc15',
    'C': '#22d3ee',
    'K': '#09090b'
  },
  chest: {
    '.': null,
    'W': '#92400e',
    'L': '#b45309',
    'G': '#facc15',
    'D': '#451a03'
  },
  dummy: {
    '.': null,
    'W': '#a16207',
    'L': '#ca8a04',
    'D': '#422006',
    'R': '#ef4444'
  }
};

const SPRITES = {
  hero: [
    '....HHHH....',
    '...HHHHHH...',
    '...HDFFDH...',
    '...HFEEDH...',
    '..C.BBBB....',
    '..CBBBBBB...',
    '..SBBBBBB...',
    '..SBNNNNB...',
    '..S.NNNN....',
    '....DDDD....',
    '...DD..DD...',
    '...DD..DD...'
  ],
  slime: [
    '............',
    '............',
    '....GGGG....',
    '..GGLLLLGG..',
    '.GLLGGGGGGD.',
    '.GGEEGGEEGD.',
    '.GGGGGGGGGD.',
    '.GGGGGGGGDD.',
    '.GDDDDDDDDD.',
    '..DDDDDDDD..',
    '............',
    '............'
  ],
  slime_boss: [
    '...YY..YY...',
    '...YYYYYY...',
    '..GGGGGGGG..',
    '.GGLLLLLLGG.',
    'GLLGGGGGGGGD',
    'GGEEGGGGEEGD',
    'GGGGGGGGGGGD',
    'GGGGGGGGGGDD',
    'GDDDDDDDDDDD',
    '.DDDDDDDDDD.',
    '............',
    '............'
  ],
  skeleton: [
    '....WWWW....',
    '...WWWWWW...',
    '...WEEWEE...',
    '...WWDDWW...',
    '....GGGG....',
    '..WWGGGGWW..',
    '..W.GGGG.W..',
    '....WWWW....',
    '...WW..WW...',
    '...GG..GG...',
    '...WW..WW...',
    '............'
  ],
  skeleton_boss: [
    '...PPPPPP...',
    '..PWWWWWWP..',
    '..PWEEWEEP..',
    '...WWDDWW...',
    '..PPGGGGPP..',
    '.WWPGGGGPWW.',
    '.W..GGGG..W.',
    '....WWWW....',
    '...WW..WW...',
    '...PP..PP...',
    '...WW..WW...',
    '............'
  ],
  golem: [
    '..SSSSSSSS..',
    '.SLLLLLLLLS.',
    '.SLCCLLCCLS.',
    '.SSSSSSSSSS.',
    'SSSDDDDDDSSS',
    'SSSDCCCCDSSS',
    'SSSDDDDDDSSS',
    '.SS.SSSS.SS.',
    '.SS.SSSS.SS.',
    '.DD.DDDD.DD.',
    '.DD......DD.',
    '............'
  ],
  demon: [
    '.Y........Y.',
    '.YY.RRRR.YY.',
    '..RRRRRRRR..',
    '..RKEEEERK..',
    '..RRRRRRRR..',
    '.DDRRRRRRDD.',
    '.DRRYYYYRRD.',
    '..RRRRRRRR..',
    '...DR..RD...',
    '..DDR..RDD..',
    '..KK....KK..',
    '............'
  ],
  architect: [
    '..G..GG..G..',
    '..GGGGGGGG..',
    '...PPPPPP...',
    '..PPCCCCPP..',
    '..PPPPPPPP..',
    '.DDPPPPPPDD.',
    '.DPGGGGGGPD.',
    '..DPPPPPPD..',
    '..KKKKKKKK..',
    '...KK..KK...',
    '..KK....KK..',
    '............'
  ],
  chest: [
    '............',
    '............',
    '..DDDDDDDD..',
    '.DLLLLLLLLD.',
    '.DLGGGGGGGD.',
    '.DWWGGGGWWD.',
    '.DWWWWWWWWD.',
    '.DWWGGGGWWD.',
    '.DDDDDDDDDD.',
    '..DDDDDDDD..',
    '............',
    '............'
  ],
  dummy: [
    '....LLLL....',
    '...LWWWWL...',
    '...LWRRWL...',
    '...LWWWWL...',
    '....WWWW....',
    '.WWWWWWWWWW.',
    '....WWWW....',
    '....DDDD....',
    '....DDDD....',
    '...DDDDDD...',
    '............',
    '............'
  ]
};

export class DungeonRenderer {
  constructor(canvas, minimapCanvas = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.minimapCanvas = minimapCanvas;
    this.minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

    this.time = 0;
    this.heroPos = { x: 110, y: 175 };
    this.heroTargetOffset = { x: 0, y: 0 };
    this.shieldTimer = 0;
    this.enemyShake = 0;
    this.enemyFlash = 0;
    this.slashEffect = null;

    this.particles = [];
    this.floatingTexts = [];
    this.state = {
      floorIndex: 0,
      roomIndex: 0,
      totalRooms: 3,
      heroHp: 100,
      heroMaxHp: 100,
      enemy: { name: 'Слайм', sprite: 'slime', hp: 25, maxHp: 25, armor: 0 },
      enemies: [],
      roomCleared: false,
      sandbox: false
    };

    this._raf = null;
    this._lastTs = 0;
  }

  start() {
    if (this._raf) return;
    const loop = (ts) => {
      const dt = Math.min(0.05, (ts - (this._lastTs || ts)) / 1000);
      this._lastTs = ts;
      this.update(dt);
      this.render();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  setState(partial) {
    Object.assign(this.state, partial);
    this.renderMinimap();
  }

  /**
   * Проигрывает анимацию последовательности действий из C++ кода.
   */
  playActions(actions = []) {
    actions.forEach((act, idx) => {
      setTimeout(() => {
        if (act.type === 'attack' || act.type === 'pierceAttack' || act.type === 'critHit') {
          this.heroTargetOffset.x = 34;
          setTimeout(() => { this.heroTargetOffset.x = 0; }, 160);
          this.enemyShake = 0.35;
          this.enemyFlash = 0.25;

          const isPierce = act.type === 'pierceAttack';
          const isCrit = act.type === 'critHit';
          this.slashEffect = {
            timer: 0.28,
            color: isCrit ? '#facc15' : isPierce ? '#38bdf8' : '#f87171',
            x: 345,
            y: 165
          };

          const color = isCrit ? '#facc15' : isPierce ? '#38bdf8' : '#ef4444';
          const label = isCrit ? `CRIT -${act.value}!` : isPierce ? `PIERCE -${act.value}` : `-${act.value}`;
          this.spawnFloatingText(345, 115, label, color);
          this.spawnParticles(345, 165, color, isCrit ? 18 : 12);
        } else if (act.type === 'heal') {
          this.spawnFloatingText(115, 115, `+${act.value} HP`, '#4ade80');
          this.spawnParticles(115, 165, '#4ade80', 14);
        } else if (act.type === 'castShield') {
          this.shieldTimer = 2.0;
          this.spawnFloatingText(115, 110, 'SHIELD!', '#60a5fa');
          this.spawnParticles(115, 165, '#60a5fa', 10);
        } else if (act.type === 'move') {
          this.heroTargetOffset.x = Math.max(-30, Math.min(40, (act.x || 0) * 8));
          this.heroTargetOffset.y = Math.max(-25, Math.min(25, (act.y || 0) * 6));
          this.spawnParticles(115, 195, '#94a3b8', 6);
        } else if (act.type === 'unlockDoor') {
          this.spawnFloatingText(345, 110, `KEY: ${act.value}`, '#facc15');
          this.spawnParticles(345, 165, '#facc15', 14);
        }
      }, idx * 220);
    });
  }

  spawnFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 16,
      y,
      text,
      color,
      life: 1.1
    });
  }

  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 3 + Math.floor(Math.random() * 4),
        color,
        life: 0.45 + Math.random() * 0.35
      });
    }
  }

  update(dt) {
    this.time += dt;
    if (this.shieldTimer > 0) this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    if (this.enemyShake > 0) this.enemyShake = Math.max(0, this.enemyShake - dt);
    if (this.enemyFlash > 0) this.enemyFlash = Math.max(0, this.enemyFlash - dt);
    if (this.slashEffect) {
      this.slashEffect.timer -= dt;
      if (this.slashEffect.timer <= 0) this.slashEffect = null;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.imageSmoothingEnabled = false;

    // 1. Каменный пол и стены подземелья
    this.drawDungeonRoom(ctx, w, h);

    // 2. Факелы с мерцающим светом
    this.drawTorch(ctx, 56, 72);
    this.drawTorch(ctx, w - 56, 72);

    // 3. Лестница вниз (активна, если комната пройдена)
    if (this.state.roomCleared && !this.state.sandbox) {
      this.drawStairs(ctx, w - 70, h - 68);
    }

    // 4. Герой
    const bob = Math.sin(this.time * 4) * 2;
    const hx = this.heroPos.x + this.heroTargetOffset.x;
    const hy = this.heroPos.y + this.heroTargetOffset.y + bob;
    this.drawShadow(ctx, hx + 28, this.heroPos.y + 62, 22);
    this.drawPixelSprite(ctx, 'hero', hx, hy, 5);

    if (this.shieldTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hx + 30, hy + 30, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Враг(и) или манекен
    const enemies = (this.state.enemies && this.state.enemies.length > 1)
      ? this.state.enemies
      : [this.state.enemy];

    enemies.forEach((en, idx) => {
      if (!en) return;
      const offsetX = enemies.length > 1 ? (idx - 1) * 48 : 0;
      const offsetY = enemies.length > 1 ? (idx % 2) * 18 : 0;
      const shakeX = this.enemyShake > 0 ? Math.sin(this.time * 60) * 5 : 0;
      const ex = 315 + offsetX + shakeX;
      const ey = 165 + offsetY + Math.cos(this.time * 3 + idx) * 2;
      const scale = enemies.length > 1 ? 4 : 5.5;

      this.drawShadow(ctx, ex + 28, ey + 60, 24);
      const spriteKey = this.state.sandbox ? 'dummy' : (en.sprite || 'slime');
      this.drawPixelSprite(ctx, spriteKey, ex, ey, scale, this.enemyFlash > 0);

      // Мини-полоска HP над врагом
      const maxHp = en.maxHp || en.hp || 1;
      const ratio = Math.max(0, Math.min(1, en.hp / maxHp));
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ex + 2, ey - 14, 56, 7);
      ctx.fillStyle = en.sprite === 'chest' ? '#facc15' : '#ef4444';
      ctx.fillRect(ex + 3, ey - 13, Math.round(54 * ratio), 5);
    });

    // 6. Эффект удара
    if (this.slashEffect) {
      ctx.save();
      ctx.strokeStyle = this.slashEffect.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.slashEffect.x - 24, this.slashEffect.y - 24);
      ctx.lineTo(this.slashEffect.x + 28, this.slashEffect.y + 28);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Частицы
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }

    // 8. Плавающий текст урона/лечения
    ctx.save();
    ctx.font = 'bold 13px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  drawDungeonRoom(ctx, w, h) {
    // Стена
    ctx.fillStyle = '#181825';
    ctx.fillRect(0, 0, w, 108);

    // Кирпичная кладка стены
    const brickW = 32;
    const brickH = 18;
    for (let row = 0; row < 6; row++) {
      const offset = (row % 2) * (brickW / 2);
      for (let x = -brickW; x < w + brickW; x += brickW) {
        ctx.fillStyle = (row + x) % 3 === 0 ? '#232336' : '#1e1e2e';
        ctx.fillRect(x + offset + 1, row * brickH + 1, brickW - 2, brickH - 2);
      }
    }

    // Пол (плиты подземелья)
    const tileSize = 32;
    for (let y = 108; y < h; y += tileSize) {
      for (let x = 0; x < w; x += tileSize) {
        const checker = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = checker ? '#262938' : '#212432';
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeStyle = '#161822';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  }

  drawTorch(ctx, x, y) {
    const flicker = Math.sin(this.time * 14 + x) * 4;
    const grad = ctx.createRadialGradient(x, y, 4, x, y, 56 + flicker);
    grad.addColorStop(0, 'rgba(251, 146, 60, 0.42)');
    grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Держатель и пламя
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 3, y, 6, 16);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x - 5, y - 10, 10, 10);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x - 3, y - 8 - (flicker > 0 ? 2 : 0), 6, 6);
  }

  drawStairs(ctx, x, y) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, 44, 44);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 44, 44);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 4 + i * 3, y + 6 + i * 9, 36 - i * 6, 6);
    }
  }

  drawShadow(ctx, cx, cy, rx) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPixelSprite(ctx, key, x, y, scale = 5, flashWhite = false) {
    const grid = SPRITES[key] || SPRITES.slime;
    const palette = PALETTES[key] || PALETTES.slime;
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        const color = palette[ch];
        if (!color) continue;
        ctx.fillStyle = flashWhite ? '#ffffff' : color;
        ctx.fillRect(Math.round(x + c * scale), Math.round(y + r * scale), scale, scale);
      }
    }
  }

  renderMinimap() {
    if (!this.minimapCtx || !this.minimapCanvas) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    const total = this.state.totalRooms || 3;
    const roomW = 22;
    const gap = 14;
    const startX = (w - (total * roomW + (total - 1) * gap)) / 2;
    const cy = h / 2 - 9;

    for (let i = 0; i < total; i++) {
      const rx = startX + i * (roomW + gap);
      if (i < total - 1) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx + roomW, cy + 7, gap, 4);
      }
      ctx.fillStyle = i === this.state.roomIndex
        ? '#facc15'
        : i < this.state.roomIndex
          ? '#22c55e'
          : '#334155';
      ctx.fillRect(rx, cy, roomW, 18);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(rx, cy, roomW, 18);
    }
  }
}
