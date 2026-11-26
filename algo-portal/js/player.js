/**
 * Универсальный контроллер пошаговой визуализации (плеер кадров).
 */
export class StepPlayer {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер для панели управления плеера
   * @param {Function} options.onRenderFrame - Колбэк (frame, index, total)
   * @param {Function} [options.onGuessState] - Колбэк (guessInfo | null) при режиме «Угадай следующий шаг»
   */
  constructor({ container, onRenderFrame, onGuessState, onNotice }) {
    this.container = container;
    this.onRenderFrame = onRenderFrame;
    this.onGuessState = onGuessState || (() => {});
    this.onNotice = onNotice || (() => {});

    this.frames = [];
    this.index = 0;
    this.isPlaying = false;
    this.timerId = null;
    this.speedMultiplier = 1; // 0.5 .. 3.0
    this.guessMode = false;
    this.pendingGuess = null; // { targetFrameIndex, expected, prompt }
    this.solvedIndices = new Set();
    this.breakpoints = new Set();
    this.watchLog = [];

    this._renderControls();
  }

  setFrames(frames) {
    this.pause();
    this.frames = Array.isArray(frames) ? frames : [];
    this.index = 0;
    this.pendingGuess = null;
    this.solvedIndices.clear();
    this.watchLog = this._computeWatchLog(this.frames);
    this.onGuessState(null);
    this._syncUI();
    if (this.frames.length > 0) {
      this.onRenderFrame(this.frames[0], 0, this.frames.length);
    }
  }

  _computeWatchLog(frames) {
    const log = [];
    if (frames.length < 2) return log;
    let prevVars = frames[0].vars || {};
    for (let i = 1; i < frames.length; i++) {
      const curVars = frames[i].vars || {};
      const changes = [];
      for (const [k, v] of Object.entries(curVars)) {
        if (prevVars[k] !== undefined && String(prevVars[k]) !== String(v)) {
          changes.push(`${k}: ${prevVars[k]} → ${v}`);
        }
      }
      if (changes.length > 0) {
        log.push({ frameIndex: i, text: `Шаг ${i + 1}: ${changes.slice(0, 2).join(', ')}` });
      }
      prevVars = curVars;
    }
    return log;
  }

  toggleBreakpoint(lineIdx) {
    if (this.breakpoints.has(lineIdx)) {
      this.breakpoints.delete(lineIdx);
      return false;
    }
    this.breakpoints.add(lineIdx);
    return true;
  }

  runToBreakpoint() {
    if (this.frames.length === 0) return false;
    if (this.breakpoints.size === 0) {
      this.onNotice('Сначала поставьте точку останова кликом по номеру строки.');
      return false;
    }
    for (let i = this.index + 1; i < this.frames.length; i++) {
      if (this.breakpoints.has(this.frames[i].line)) {
        this.goTo(i);
        return true;
      }
    }
    this.onNotice('До конца выполнения ни одна точка останова не сработала.');
    return false;
  }

  stepUntil(mode) {
    if (this.frames.length === 0) return;
    if (mode === 'half') {
      this.goTo(Math.floor(this.frames.length / 2));
      return;
    }
    if (mode === 'end') {
      this.goTo(this.frames.length - 1);
      return;
    }
    if (mode === 'var-change') {
      const curVars = this.frames[this.index]?.vars || {};
      const curSnap = JSON.stringify(curVars);
      for (let i = this.index + 1; i < this.frames.length; i++) {
        if (JSON.stringify(this.frames[i].vars || {}) !== curSnap) {
          this.goTo(i);
          return;
        }
      }
      this.onNotice('До конца выполнения переменные больше не меняются.');
    }
  }

  setGuessMode(enabled) {
    this.guessMode = Boolean(enabled);
    if (!this.guessMode && this.pendingGuess) {
      this.pendingGuess = null;
      this.onGuessState(null);
    }
  }

  get baseDelayMs() {
    return Math.round(950 / this.speedMultiplier);
  }

  play() {
    if (this.isPlaying || this.frames.length <= 1) return;
    if (this.index >= this.frames.length - 1) {
      this.index = 0;
      this.onRenderFrame(this.frames[0], 0, this.frames.length);
    }
    this.isPlaying = true;
    this._syncUI();
    this._scheduleNext();
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this._syncUI();
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  goTo(idx) {
    if (this.frames.length === 0) return;
    this.pause();
    this.pendingGuess = null;
    this.onGuessState(null);
    this.index = Math.max(0, Math.min(this.frames.length - 1, idx));
    this._syncUI();
    this.onRenderFrame(this.frames[this.index], this.index, this.frames.length);
  }

  stepBack() {
    this.goTo(this.index - 1);
  }

  stepForward(bypassGuess = false) {
    if (this.index >= this.frames.length - 1) {
      this.pause();
      return;
    }

    const nextIdx = this.index + 1;
    const nextFrame = this.frames[nextIdx];

    if (
      !bypassGuess &&
      this.guessMode &&
      nextFrame.guess &&
      !this.solvedIndices.has(nextIdx)
    ) {
      this.pause();
      this.pendingGuess = {
        targetFrameIndex: nextIdx,
        expected: nextFrame.guess.expected,
        prompt: nextFrame.guess.prompt
      };
      this.onGuessState({
        status: 'waiting',
        prompt: nextFrame.guess.prompt
      });
      return;
    }

    this.pendingGuess = null;
    this.onGuessState(null);
    this.index = nextIdx;
    this._syncUI();
    this.onRenderFrame(this.frames[this.index], this.index, this.frames.length);
  }

  /**
   * Вызывается движком визуализации, когда пользователь кликает по элементу в режиме угадывания.
   * @param {string|number} value
   * @returns {boolean}
   */
  submitGuess(value) {
    if (!this.pendingGuess) return false;
    const isCorrect = String(value) === String(this.pendingGuess.expected);

    if (isCorrect) {
      const targetIdx = this.pendingGuess.targetFrameIndex;
      this.solvedIndices.add(targetIdx);
      this.onGuessState({
        status: 'correct',
        prompt: 'Верно! Переходим к следующему шагу.'
      });
      setTimeout(() => {
        if (this.pendingGuess && this.pendingGuess.targetFrameIndex === targetIdx) {
          this.stepForward(true);
        }
      }, 420);
      return true;
    }

    this.onGuessState({
      status: 'wrong',
      prompt: `Не совсем так (выбрано: ${value}). Попробуйте ещё раз: ${this.pendingGuess.prompt}`
    });
    return false;
  }

  _scheduleNext() {
    if (!this.isPlaying) return;
    this.timerId = setTimeout(() => {
      if (!this.isPlaying) return;
      if (this.index >= this.frames.length - 1) {
        this.pause();
        return;
      }
      this.stepForward(false);
      if (this.isPlaying && !this.pendingGuess) {
        this._scheduleNext();
      }
    }, this.baseDelayMs);
  }

  _renderControls() {
    this.container.innerHTML = `
      <div class="player-bar">
        <div class="player-buttons">
          <button type="button" class="btn btn-secondary btn-sm" data-action="start" title="В начало">|&lt;</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="prev" title="Шаг назад">&lt;</button>
          <button type="button" class="btn btn-primary btn-sm" data-action="toggle" title="Play / Pause">▶ Старт</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="next" title="Шаг вперёд">&gt;</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="end" title="В конец">&gt;|</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="bp" title="До точки останова (F9)">🔴 До BP (F9)</button>
          <select class="select-field timer-select" data-role="step-until" aria-label="Перемотать до" style="margin-left:4px;">
            <option value="">Перемотать до...</option>
            <option value="var-change">Изменения переменной</option>
            <option value="half">Середины алгоритма</option>
            <option value="end">Конца алгоритма</option>
          </select>
        </div>
        <div class="player-scrubber">
          <input type="range" class="range-slider" data-role="scrubber" min="0" max="0" value="0" aria-label="Шкала кадров">
          <span class="mono" style="font-size:12px; color:var(--text-secondary); min-width:68px; text-align:right;" data-role="counter">0 / 0</span>
        </div>
        <div class="player-speed">
          <span>Скорость:</span>
          <input type="range" class="range-slider" data-role="speed" min="0.5" max="3" step="0.25" value="1" style="width:84px;" aria-label="Скорость воспроизведения">
          <span class="mono" data-role="speed-val">1.0x</span>
        </div>
      </div>
      <div class="player-hotkeys-hint">
        <span><kbd>Space</kbd> Старт/Пауза</span>
        <span><kbd>←</kbd> <kbd>→</kbd> Шаг</span>
        <span><kbd>F9</kbd> До BP</span>
        <span><kbd>Home</kbd> <kbd>End</kbd> Край</span>
        <span><kbd>+</kbd> <kbd>-</kbd> Скорость</span>
      </div>
    `;

    this.btnStart = this.container.querySelector('[data-action="start"]');
    this.btnPrev = this.container.querySelector('[data-action="prev"]');
    this.btnToggle = this.container.querySelector('[data-action="toggle"]');
    this.btnNext = this.container.querySelector('[data-action="next"]');
    this.btnEnd = this.container.querySelector('[data-action="end"]');
    this.btnBp = this.container.querySelector('[data-action="bp"]');
    this.stepUntilSelect = this.container.querySelector('[data-role="step-until"]');
    this.scrubber = this.container.querySelector('[data-role="scrubber"]');
    this.counter = this.container.querySelector('[data-role="counter"]');
    this.speedInput = this.container.querySelector('[data-role="speed"]');
    this.speedVal = this.container.querySelector('[data-role="speed-val"]');

    this.btnStart.addEventListener('click', () => this.goTo(0));
    this.btnPrev.addEventListener('click', () => this.stepBack());
    this.btnToggle.addEventListener('click', () => this.togglePlay());
    this.btnNext.addEventListener('click', () => this.stepForward(false));
    this.btnEnd.addEventListener('click', () => this.goTo(this.frames.length - 1));
    this.btnBp.addEventListener('click', () => this.runToBreakpoint());
    this.stepUntilSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        this.stepUntil(e.target.value);
        e.target.value = '';
      }
    });

    this.scrubber.addEventListener('input', (e) => {
      this.goTo(Number(e.target.value));
    });

    this.speedInput.addEventListener('input', (e) => {
      this._setSpeed(Number(e.target.value));
    });

    this._onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.stepBack();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.stepForward(false);
      } else if (e.code === 'Home') {
        e.preventDefault();
        this.goTo(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        this.goTo(this.frames.length - 1);
      } else if (e.code === 'F9') {
        e.preventDefault();
        this.runToBreakpoint();
      } else if (e.key === '+' || e.key === '=') {
        this._setSpeed(Math.min(3, this.speedMultiplier + 0.25));
      } else if (e.key === '-' || e.key === '_') {
        this._setSpeed(Math.max(0.5, this.speedMultiplier - 0.25));
      }
    };
    window.addEventListener('keydown', this._onKeyDown);
  }

  _setSpeed(val) {
    this.speedMultiplier = Math.max(0.5, Math.min(3, val));
    if (this.speedInput) this.speedInput.value = String(this.speedMultiplier);
    if (this.speedVal) {
      this.speedVal.textContent = `${this.speedMultiplier.toFixed(2).replace(/\.00$/, '.0')}x`;
    }
  }

  _syncUI() {
    const total = this.frames.length;
    const maxIdx = Math.max(0, total - 1);
    this.scrubber.max = String(maxIdx);
    this.scrubber.value = String(this.index);
    this.counter.textContent = total > 0 ? `${this.index + 1} / ${total}` : '0 / 0';

    this.btnToggle.textContent = this.isPlaying ? '⏸ Пауза' : '▶ Старт';
    this.btnStart.disabled = this.index === 0 || total === 0;
    this.btnPrev.disabled = this.index === 0 || total === 0;
    this.btnNext.disabled = this.index >= maxIdx || total === 0;
    this.btnEnd.disabled = this.index >= maxIdx || total === 0;
  }

  destroy() {
    this.pause();
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
  }
}
