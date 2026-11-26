import {
  TOPICS_INDEX as TOPICS,
  loadTopicById,
  loadTopicsByIds,
  preloadAllTopics
} from '../data/topicsIndex.js';
import { StepPlayer } from './player.js';
import { renderArrayFrame } from './engines/arrayEngine.js';
import { renderGraphFrame } from './engines/graphEngine.js';
import { renderGridFrame } from './engines/gridEngine.js';
import { renderTreeFrame } from './engines/treeEngine.js';
import { renderMathFrame } from './engines/mathEngine.js';
import { renderStringFrame } from './engines/stringEngine.js';
import {
  renderGeneratorView,
  renderStlView,
  renderBitwiseView,
  renderBlitzView
} from './tools.js';
import { renderDebugHuntView, renderAlgoSelectorView } from './advancedTools.js';
import { runPythonTests, getTestsForTopic } from './pyodideRunner.js';
import { fetchCfProblems, getCfTagForTopic, fetchCfUserProfile } from './cfApi.js';

const STORAGE_KEY = 'algoportal_state_v1';

const state = {
  completed: new Set(),
  cheatsheet: new Set(),
  notes: {},
  cfProfile: null,
  searchQuery: '',
  roadmapCategory: 'Все',
  activePlayer: null,
  activeTopicId: null
};

// ============================================================================
// Хранилище и утилиты
// ============================================================================
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.completed)) {
      state.completed = new Set(parsed.completed);
    }
    if (Array.isArray(parsed.cheatsheet)) {
      state.cheatsheet = new Set(parsed.cheatsheet);
    }
    if (parsed.notes && typeof parsed.notes === 'object') {
      state.notes = parsed.notes;
    }
    if (parsed.cfProfile && typeof parsed.cfProfile === 'object') {
      state.cfProfile = parsed.cfProfile;
    }
  } catch {
    // Игнорируем повреждённый JSON в localStorage
  }
}

function saveState() {
  const payload = {
    completed: [...state.completed],
    cheatsheet: [...state.cheatsheet],
    notes: state.notes,
    cfProfile: state.cfProfile
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  updateProgressUI();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightCode(code, lang) {
  let html = escapeHtml(code);
  // Комментарии
  if (lang === 'cpp') {
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
    html = html.replace(
      /\b(int|void|bool|const|vector|queue|using|namespace|std|return|while|if|else|for|auto)\b/g,
      '<span class="tok-kw">$1</span>'
    );
  } else {
    html = html.replace(/(#[^\n]*)/g, '<span class="tok-com">$1</span>');
    html = html.replace(
      /\b(def|return|while|if|else|for|in|from|import|list|int|float|len)\b/g,
      '<span class="tok-kw">$1</span>'
    );
  }
  html = html.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
  return html;
}

// ============================================================================
// Сайдбар, прогресс и мобильное меню
// ============================================================================
function updateProgressUI() {
  const total = TOPICS.length;
  const doneCount = TOPICS.filter((t) => state.completed.has(t.id)).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const textEl = document.getElementById('sidebar-progress-text');
  const fillEl = document.getElementById('sidebar-progress-fill');
  const mobileBadge = document.getElementById('mobile-progress-badge');
  const cheatCount = document.getElementById('cheatsheet-count');

  if (textEl) textEl.textContent = `${doneCount} / ${total}`;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (mobileBadge) mobileBadge.textContent = `${pct}%`;
  if (cheatCount) cheatCount.textContent = String(state.cheatsheet.size);
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const q = state.searchQuery.trim().toLowerCase();
  const filtered = TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q)
  );

  const categories = new Map();
  filtered.forEach((topic) => {
    if (!categories.has(topic.category)) categories.set(topic.category, []);
    categories.get(topic.category).push(topic);
  });

  if (filtered.length === 0) {
    nav.innerHTML = `<div style="padding:14px; color:var(--text-secondary); font-size:13px;">Темы не найдены</div>`;
    return;
  }

  let html = '';
  categories.forEach((items, catName) => {
    html += `<div class="nav-category"><div class="nav-category-title">${escapeHtml(catName)}</div>`;
    items.forEach((t) => {
      const isActive = state.activeTopicId === t.id;
      const isDone = state.completed.has(t.id);
      const dotClass = isDone ? 'done' : t.isStub ? 'stub' : '';
      html += `
        <a href="#topic=${t.id}" class="nav-item ${isActive ? 'active' : ''}" data-topic-link="${t.id}">
          <span class="nav-item-left">
            <span class="nav-status-dot ${dotClass}" title="${isDone ? 'Изучено' : t.isStub ? 'Скоро' : 'В процессе'}"></span>
            <span class="nav-item-title">${escapeHtml(t.title)}</span>
          </span>
        </a>
      `;
    });
    html += `</div>`;
  });

  nav.innerHTML = html;
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('menu-toggle');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.hidden = true;
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function openMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('menu-toggle');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.hidden = false;
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
}

// ============================================================================
// Роутинг
// ============================================================================
function parseRoute() {
  const hash = window.location.hash || '#roadmap';
  if (hash === '#calculator') return { view: 'calculator' };
  if (hash === '#timbook') return { view: 'timbook' };
  if (hash === '#generator') return { view: 'generator' };
  if (hash === '#stl') return { view: 'stl' };
  if (hash === '#bitwise') return { view: 'bitwise' };
  if (hash === '#blitz') return { view: 'blitz' };
  if (hash === '#debughunt') return { view: 'debughunt' };
  if (hash === '#selector') return { view: 'selector' };
  if (hash.startsWith('#topic=')) {
    const id = hash.slice('#topic='.length).trim();
    const topic = TOPICS.find((t) => t.id === id);
    if (topic) return { view: 'topic', topic };
  }
  return { view: 'roadmap' };
}

async function renderCurrentRoute() {
  if (state.activePlayer) {
    state.activePlayer.destroy();
    state.activePlayer = null;
  }

  const route = parseRoute();
  state.activeTopicId = route.view === 'topic' ? route.topic.id : null;
  renderSidebar();
  closeMobileSidebar();

  const main = document.getElementById('main-content');
  if (!main) return;

  if (route.view === 'roadmap') {
    renderRoadmapView(main);
  } else if (route.view === 'calculator') {
    renderCalculatorView(main);
  } else if (route.view === 'timbook') {
    renderTimbookView(main);
  } else if (route.view === 'generator') {
    renderGeneratorView(main, showToast, escapeHtml);
  } else if (route.view === 'stl') {
    renderStlView(main, escapeHtml);
  } else if (route.view === 'bitwise') {
    renderBitwiseView(main);
  } else if (route.view === 'blitz') {
    renderBlitzView(main, escapeHtml);
  } else if (route.view === 'debughunt') {
    renderDebugHuntView(main, escapeHtml);
  } else if (route.view === 'selector') {
    renderAlgoSelectorView(main, escapeHtml);
  } else {
    main.innerHTML = `<section class="card"><div style="color:var(--text-secondary);">⏳ Загрузка модуля темы...</div></section>`;
    try {
      const fullTopic = await loadTopicById(route.topic.id);
      if (fullTopic) renderTopicView(main, fullTopic);
      else renderRoadmapView(main);
    } catch {
      main.innerHTML = `<section class="card"><div style="color:var(--danger);">Не удалось загрузить тему (проверьте сеть или офлайн-кэш).</div></section>`;
    }
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ============================================================================
// Главная страница: Роадмап тем
// ============================================================================
function renderRoadmapView(container) {
  const categories = ['Все', ...new Set(TOPICS.map((t) => t.category))];
  const doneCount = TOPICS.filter((t) => state.completed.has(t.id)).length;
  const interactiveCount = TOPICS.filter((t) => !t.isStub).length;

  const visibleTopics = TOPICS.filter((t) => {
    const matchCat = state.roadmapCategory === 'Все' || t.category === state.roadmapCategory;
    const q = state.searchQuery.trim().toLowerCase();
    const matchSearch =
      !q || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  container.innerHTML = `
    <section class="hero-banner">
      <h1 class="hero-title">AlgoPortal — Интерактивный тренажёр алгоритмов</h1>
      <p class="hero-subtitle">
        Пошаговая визуализация структур данных, синхронизация выполнения с кодом (Dry-Run) и режим «Угадай следующий шаг» на базе материалов e-maxx.ru / cp-algorithms.
      </p>
      <div class="hero-stats">
        <div class="stat-pill">Изучено тем: <strong>${doneCount} / ${TOPICS.length}</strong></div>
        <div class="stat-pill">Интерактивных песочниц: <strong>${interactiveCount}</strong></div>
        <div class="stat-pill">В шпаргалке: <strong>${state.cheatsheet.size}</strong></div>
      </div>
    </section>

    <div class="roadmap-filters" id="roadmap-filters">
      ${categories
        .map(
          (cat) => `
          <button type="button" class="filter-chip ${state.roadmapCategory === cat ? 'active' : ''}" data-cat="${escapeHtml(cat)}">
            ${escapeHtml(cat)}
          </button>`
        )
        .join('')}
    </div>

    <div class="roadmap-grid">
      ${visibleTopics
        .map((t) => {
          const isDone = state.completed.has(t.id);
          return `
            <article class="topic-card ${isDone ? 'completed' : ''}" data-open-topic="${t.id}">
              <div>
                <div class="topic-card-top">
                  <span class="badge badge-muted">${escapeHtml(t.category)}</span>
                  ${
                    isDone
                      ? '<span class="badge badge-success">✓ Изучено</span>'
                      : t.isStub
                        ? '<span class="badge badge-warning">Скоро</span>'
                        : '<span class="badge badge-accent">Интерактив</span>'
                  }
                </div>
                <h2 class="topic-card-title">${escapeHtml(t.title)}</h2>
                <p class="topic-card-desc">${escapeHtml(t.summary)}</p>
              </div>
              <div class="topic-card-footer">
                <span class="mono">Время: ${escapeHtml(t.timeComplexity)}</span>
                <span style="color:var(--accent-light); font-weight:500;">Открыть →</span>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;

  container.querySelectorAll('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.roadmapCategory = btn.getAttribute('data-cat');
      renderRoadmapView(container);
    });
  });

  container.querySelectorAll('[data-open-topic]').forEach((card) => {
    card.addEventListener('click', () => {
      window.location.hash = `#topic=${card.getAttribute('data-open-topic')}`;
    });
  });
}

// ============================================================================
// Страница алгоритма
// ============================================================================
function renderTopicView(container, topic) {
  const isDone = state.completed.has(topic.id);
  const inCheat = state.cheatsheet.has(topic.id);

  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
    </div>

    <!-- Карточка алгоритма -->
    <section class="card">
      <div class="card-header">
        <div>
          <span class="badge badge-muted">${escapeHtml(topic.category)} • ${escapeHtml(topic.difficulty)}</span>
          <h1 class="topic-title">${escapeHtml(topic.title)}</h1>
        </div>
        <div class="complexity-badges">
          <span class="badge badge-accent">Время: ${escapeHtml(topic.timeComplexity)}</span>
          <span class="badge badge-muted">Память: ${escapeHtml(topic.spaceComplexity)}</span>
        </div>
      </div>

      <p style="margin:0; color:var(--text-primary);">${escapeHtml(topic.summary)}</p>

      <div class="pitfalls-box">
        <div class="pitfalls-title">⚠ Подводные камни и крайние случаи</div>
        <ul class="pitfalls-list">
          ${topic.pitfalls.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>

      <div class="topic-actions-bar">
        <label class="checkbox-pill">
          <input type="checkbox" id="topic-done-checkbox" ${isDone ? 'checked' : ''}>
          <span>Тема изучена</span>
        </label>
        <button type="button" id="toggle-cheatsheet-btn" class="btn btn-secondary btn-sm">
          ${inCheat ? '✓ В шпаргалке (убрать)' : '+ Добавить в шпаргалку для печати'}
        </button>
      </div>
    </section>

    <div id="topic-workspace"></div>
  `;

  document.getElementById('topic-done-checkbox').addEventListener('change', (e) => {
    if (e.target.checked) state.completed.add(topic.id);
    else state.completed.delete(topic.id);
    saveState();
    renderSidebar();
    showToast(e.target.checked ? 'Тема отмечена как изученная!' : 'Отметка снята');
  });

  const cheatBtn = document.getElementById('toggle-cheatsheet-btn');
  cheatBtn.addEventListener('click', () => {
    if (state.cheatsheet.has(topic.id)) {
      state.cheatsheet.delete(topic.id);
      cheatBtn.textContent = '+ Добавить в шпаргалку для печати';
      showToast('Удалено из шпаргалки');
    } else {
      state.cheatsheet.add(topic.id);
      cheatBtn.textContent = '✓ В шпаргалке (убрать)';
      showToast('Добавлено в шпаргалку для печати');
    }
    saveState();
  });

  const workspace = document.getElementById('topic-workspace');
  if (topic.isStub) {
    workspace.innerHTML = `
      <section class="card">
        <div class="stub-notice">
          <h2 style="margin:0 0 8px;">Интерактивный визуализатор в разработке</h2>
          <p style="color:var(--text-secondary); max-width:520px; margin:0 auto;">
            Эта тема добавлена в роадмап для цельной программы подготовки. Полные пошаговые визуализаторы уже доступны в темах
            <a href="#topic=binary-search">Бинарный поиск</a> и <a href="#topic=bfs">Поиск в ширину (BFS)</a>.
          </p>
        </div>
      </section>
    `;
  } else {
    renderInteractiveWorkspace(workspace, topic);
  }

  // Персональный блокнот заметок по теме
  const notesCard = document.createElement('section');
  notesCard.className = 'card';
  notesCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <h2 class="section-title" style="margin:0;">📝 Мои заметки по теме</h2>
      <span id="notes-saved-hint" style="font-size:12px; color:var(--text-secondary);">Автосохранение в localStorage</span>
    </div>
    <textarea id="topic-notes-input" class="notes-textarea" placeholder="Запишите ключевые идеи, формулы, номера задач или крайние случаи..."></textarea>
  `;
  container.appendChild(notesCard);

  const notesInput = document.getElementById('topic-notes-input');
  const notesHint = document.getElementById('notes-saved-hint');
  notesInput.value = state.notes[topic.id] || '';
  notesInput.addEventListener('input', () => {
    state.notes[topic.id] = notesInput.value;
    saveState();
    notesHint.textContent = '✓ Сохранено';
    notesHint.style.color = 'var(--success)';
  });
}

// ============================================================================
// Интерактивный визуализатор + Dry-run + Вкладки
// ============================================================================
function renderInteractiveWorkspace(container, topic) {
  let currentData = structuredClone(topic.presets[0].data);
  let activePresetId = topic.presets[0].id;
  let graphEditMode = false;
  let edgeStartNode = null;

  container.innerHTML = `
    <section class="card">
      <div class="visualizer-toolbar">
        <h2 class="section-title" style="margin:0;">Интерактивный визуализатор</h2>
        <label class="checkbox-pill" title="Плеер будет останавливаться перед ключевым шагом и просить вас выбрать элемент">
          <input type="checkbox" id="guess-mode-toggle">
          <span>🎯 Режим «Угадай следующий шаг»</span>
        </label>
      </div>

      <div class="visualizer-toolbar">
        <div class="preset-group" id="preset-buttons">
          ${topic.presets
            .map(
              (p) => `
              <button type="button" class="preset-btn ${p.id === activePresetId ? 'active' : ''}" data-preset="${p.id}">
                ${escapeHtml(p.label)}
              </button>`
            )
            .join('')}
        </div>
      </div>

      <div id="custom-input-area"></div>

      <div id="guess-banner" class="guess-banner" hidden>
        <span id="guess-banner-text"></span>
        <button type="button" id="guess-skip-btn" class="btn btn-ghost btn-xs">Пропустить шаг</button>
      </div>

      <div class="dryrun-grid">
        <div class="stage-panel">
          <div id="stage-canvas" class="stage-canvas-wrap"></div>
          <div id="step-explanation" class="step-explanation"></div>
        </div>

        <div class="code-trace-panel">
          <div class="panel-subbar">
            <span>Трассировка кода (Dry-Run)</span>
            <span class="mono" style="color:var(--accent-light);">C++</span>
          </div>
          <div id="trace-code-lines" class="trace-code-lines">
            ${topic.traceCode
              .map(
                (line, idx) => `
                <div class="trace-line" data-line="${idx}">
                  <span class="trace-line-num">${idx + 1}</span>
                  <span>${escapeHtml(line)}</span>
                </div>`
              )
              .join('')}
          </div>
          <div class="variables-table-wrap">
            <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:6px;">Текущие переменные:</div>
            <div id="variables-grid" class="variables-grid"></div>
          </div>
          <details class="watchlist-box">
            <summary>📋 Лог изменений переменных (Watchlist)</summary>
            <div id="watchlist-items" class="watchlist-items"></div>
          </details>
        </div>
      </div>

      <div id="player-controls-mount"></div>
    </section>

    <!-- Вкладки с реализацией и практикой -->
    <section class="card">
      <div class="tabs-header">
        <div class="tabs-list" role="tablist">
          <button type="button" class="tab-btn active" data-tab="cpp">C++</button>
          <button type="button" class="tab-btn" data-tab="python">Python</button>
          <button type="button" class="tab-btn" data-tab="fill">Практика: Допиши код</button>
          <button type="button" class="tab-btn" data-tab="pysandbox">🐍 Песочница Python</button>
          <button type="button" class="tab-btn" data-tab="practice">Задачи и тест</button>
        </div>
      </div>
      <div id="tab-content-area"></div>
    </section>
  `;

  const stageCanvas = document.getElementById('stage-canvas');
  const stepExp = document.getElementById('step-explanation');
  const varsGrid = document.getElementById('variables-grid');
  const guessBanner = document.getElementById('guess-banner');
  const guessBannerText = document.getElementById('guess-banner-text');
  const guessToggle = document.getElementById('guess-mode-toggle');
  const customInputArea = document.getElementById('custom-input-area');

  const player = new StepPlayer({
    container: document.getElementById('player-controls-mount'),
    onNotice: showToast,
    onGuessState: (info) => {
      if (!info) {
        guessBanner.hidden = true;
        guessBanner.className = 'guess-banner';
        return;
      }
      guessBanner.hidden = false;
      guessBanner.className = `guess-banner ${info.status === 'wrong' ? 'wrong' : info.status === 'correct' ? 'correct' : ''}`;
      guessBannerText.textContent = `🎯 ${info.prompt}`;
    },
    onRenderFrame: (frame) => {
      if (topic.engine === 'array') {
        renderArrayFrame(stageCanvas, frame, {
          clickable: Boolean(player.pendingGuess || player.guessMode),
          onCellClick: (idx) => {
            if (player.pendingGuess) player.submitGuess(idx);
          }
        });
      } else if (topic.engine === 'grid') {
        renderGridFrame(stageCanvas, frame, {
          clickable: Boolean(player.pendingGuess || player.guessMode),
          onCellClick: (cellKey) => {
            if (player.pendingGuess) player.submitGuess(cellKey);
          }
        });
      } else if (topic.engine === 'tree') {
        renderTreeFrame(stageCanvas, frame, {
          clickableNodes: Boolean(player.pendingGuess || player.guessMode),
          onNodeClick: (nodeId) => {
            if (player.pendingGuess) player.submitGuess(nodeId);
          }
        });
      } else if (topic.engine === 'string') {
        renderStringFrame(stageCanvas, frame, {
          clickable: Boolean(player.pendingGuess || player.guessMode),
          onCharClick: (idx) => {
            if (player.pendingGuess) player.submitGuess(idx);
          }
        });
      } else if (topic.engine === 'math') {
        renderMathFrame(stageCanvas, frame, {
          clickable: Boolean(player.pendingGuess || player.guessMode),
          onItemClick: (val) => {
            if (player.pendingGuess) player.submitGuess(val);
          }
        });
      } else if (topic.engine === 'graph') {
        renderGraphFrame(stageCanvas, frame, {
          clickableNodes: Boolean(player.pendingGuess || graphEditMode),
          selectedForEdge: edgeStartNode,
          onCanvasClick: graphEditMode
            ? (x, y) => {
                const nextId = currentData.nodes.length
                  ? Math.max(...currentData.nodes.map((n) => n.id)) + 1
                  : 0;
                currentData.nodes.push({ id: nextId, x, y });
                rebuildCustomForm();
                runVisualization();
              }
            : null,
          onNodeClick: (nodeId) => {
            if (player.pendingGuess) {
              player.submitGuess(nodeId);
              return;
            }
            if (graphEditMode) {
              if (edgeStartNode === null) {
                edgeStartNode = nodeId;
                player.onRenderFrame(player.frames[player.index], player.index, player.frames.length);
              } else if (edgeStartNode !== nodeId) {
                const exists = currentData.edges.some(
                  (e) =>
                    (e.from === edgeStartNode && e.to === nodeId) ||
                    (e.from === nodeId && e.to === edgeStartNode)
                );
                if (!exists) currentData.edges.push({ from: edgeStartNode, to: nodeId });
                if (Array.isArray(currentData.ops)) {
                  currentData.ops.push({ type: 'union', a: edgeStartNode, b: nodeId });
                }
                edgeStartNode = null;
                runVisualization();
              } else {
                edgeStartNode = null;
                player.onRenderFrame(player.frames[player.index], player.index, player.frames.length);
              }
            }
          }
        });
      }

      stepExp.textContent = frame.explanation || '';

      container.querySelectorAll('.trace-line').forEach((el) => {
        el.classList.toggle('active', Number(el.getAttribute('data-line')) === frame.line);
      });

      const vars = frame.vars || {};
      varsGrid.innerHTML = Object.entries(vars)
        .map(
          ([k, v]) =>
            `<span class="var-chip"><span class="var-name">${escapeHtml(k)} = </span><span class="var-val">${escapeHtml(v)}</span></span>`
        )
        .join('');
    }
  });

  state.activePlayer = player;

  guessToggle.addEventListener('change', (e) => {
    player.setGuessMode(e.target.checked);
    // Перерисовать текущий кадр, чтобы обновить курсор кликабельности
    if (player.frames[player.index]) {
      player.onRenderFrame(player.frames[player.index], player.index, player.frames.length);
    }
  });

  document.getElementById('guess-skip-btn').addEventListener('click', () => {
    player.stepForward(true);
  });

  function runVisualization() {
    const frames = topic.generateFrames(currentData);
    player.setFrames(frames);

    const wl = document.getElementById('watchlist-items');
    if (wl) {
      wl.innerHTML = player.watchLog.length
        ? player.watchLog
            .map(
              (item) =>
                `<div class="watchlist-item" data-wl-idx="${item.frameIndex}">${escapeHtml(item.text)}</div>`
            )
            .join('')
        : '<div style="color:var(--text-secondary);">Изменений не зафиксировано.</div>';

      wl.querySelectorAll('[data-wl-idx]').forEach((el) => {
        el.addEventListener('click', () => {
          player.goTo(Number(el.getAttribute('data-wl-idx')));
        });
      });
    }
  }

  container.querySelectorAll('.trace-line-num').forEach((numEl) => {
    numEl.title = 'Поставить / снять точку останова (F9)';
    numEl.addEventListener('click', () => {
      const lineIdx = Number(numEl.parentElement.getAttribute('data-line'));
      const active = player.toggleBreakpoint(lineIdx);
      numEl.classList.toggle('bp-active', active);
    });
  });

  function rebuildCustomForm() {
    const inputType = topic.customInputType || (topic.engine === 'array' ? 'array-target' : topic.engine);

    if (inputType === 'array-target') {
      const isSortedOnly = topic.id === 'binary-search';
      customInputArea.innerHTML = `
        <form id="array-custom-form" class="custom-input-form">
          <div class="form-field" style="flex:2;">
            <label for="arr-input">${isSortedOnly ? 'Отсортированный массив' : 'Неотрицательный массив'} (через запятую или пробел)</label>
            <input id="arr-input" type="text" class="input-field input-mono" value="${currentData.array.join(', ')}">
          </div>
          <div class="form-field" style="max-width:140px;">
            <label for="target-input">Искомое (target)</label>
            <input id="target-input" type="number" class="input-field input-mono" value="${currentData.target}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить визуализацию</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;

      document.getElementById('array-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const nums = document.getElementById('arr-input').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const rawTarget = document.getElementById('target-input').value.trim();

        if (nums.length === 0 || nums.length > 18 || nums.some(Number.isNaN)) {
          errEl.textContent = 'Введите от 1 до 18 корректных чисел.';
          errEl.hidden = false;
          return;
        }
        if (isSortedOnly) {
          for (let i = 1; i < nums.length; i++) {
            if (nums[i] < nums[i - 1]) {
              errEl.textContent = 'Массив должен быть отсортирован по неубыванию!';
              errEl.hidden = false;
              return;
            }
          }
        } else if (nums.some((x) => x < 0)) {
          errEl.textContent = 'Для двух указателей введите неотрицательные числа (>= 0).';
          errEl.hidden = false;
          return;
        }
        const target = Number(rawTarget);
        if (rawTarget === '' || Number.isNaN(target)) {
          errEl.textContent = 'Укажите корректное число target.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { array: nums, target };
        runVisualization();
      });
    } else if (inputType === 'array-range') {
      customInputArea.innerHTML = `
        <form id="range-custom-form" class="custom-input-form">
          <div class="form-field" style="flex:2;">
            <label for="arr-input">Массив (через запятую или пробел)</label>
            <input id="arr-input" type="text" class="input-field input-mono" value="${currentData.array.join(', ')}">
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="ql-input">L</label>
            <input id="ql-input" type="number" class="input-field input-mono" value="${currentData.queryL}">
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="qr-input">R</label>
            <input id="qr-input" type="number" class="input-field input-mono" value="${currentData.queryR}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить визуализацию</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;

      document.getElementById('range-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const nums = document.getElementById('arr-input').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const ql = Number(document.getElementById('ql-input').value);
        const qr = Number(document.getElementById('qr-input').value);

        if (nums.length === 0 || nums.length > 14 || nums.some(Number.isNaN)) {
          errEl.textContent = 'Введите от 1 до 14 чисел.';
          errEl.hidden = false;
          return;
        }
        if (Number.isNaN(ql) || Number.isNaN(qr) || ql < 0 || qr >= nums.length || ql > qr) {
          errEl.textContent = `Укажите корректный отрезок 0 <= L <= R < ${nums.length}.`;
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { array: nums, queryL: ql, queryR: qr };
        runVisualization();
      });
    } else if (inputType === 'knapsack') {
      customInputArea.innerHTML = `
        <form id="knapsack-custom-form" class="custom-input-form">
          <div class="form-field">
            <label for="wt-input">Веса предметов (wt)</label>
            <input id="wt-input" type="text" class="input-field input-mono" value="${currentData.weights.join(', ')}">
          </div>
          <div class="form-field">
            <label for="val-input">Стоимости (val)</label>
            <input id="val-input" type="text" class="input-field input-mono" value="${currentData.values.join(', ')}">
          </div>
          <div class="form-field" style="max-width:110px;">
            <label for="cap-input">Вместимость W</label>
            <input id="cap-input" type="number" class="input-field input-mono" value="${currentData.capacity}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить визуализацию</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;

      document.getElementById('knapsack-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const weights = document.getElementById('wt-input').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const values = document.getElementById('val-input').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const capacity = Number(document.getElementById('cap-input').value);

        if (
          weights.length === 0 ||
          weights.length > 6 ||
          weights.length !== values.length ||
          weights.some((x) => Number.isNaN(x) || x <= 0) ||
          values.some((x) => Number.isNaN(x) || x < 0)
        ) {
          errEl.textContent = 'Введите от 1 до 6 предметов: одинаковое число положительных весов и неотрицательных стоимостей.';
          errEl.hidden = false;
          return;
        }
        if (Number.isNaN(capacity) || capacity < 1 || capacity > 12) {
          errEl.textContent = 'Укажите вместимость W от 1 до 12.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { weights, values, capacity };
        runVisualization();
      });
    } else if (inputType === 'segtree') {
      customInputArea.innerHTML = `
        <form id="segtree-custom-form" class="custom-input-form">
          <div class="form-field" style="flex:2;">
            <label for="arr-input">Массив (до 8 чисел)</label>
            <input id="arr-input" type="text" class="input-field input-mono" value="${currentData.array.join(', ')}">
          </div>
          <div class="form-field" style="max-width:75px;">
            <label for="ql-input">L</label>
            <input id="ql-input" type="number" class="input-field input-mono" value="${currentData.queryL}">
          </div>
          <div class="form-field" style="max-width:75px;">
            <label for="qr-input">R</label>
            <input id="qr-input" type="number" class="input-field input-mono" value="${currentData.queryR}">
          </div>
          <div class="form-field" style="max-width:85px;">
            <label for="uidx-input">pos</label>
            <input id="uidx-input" type="number" class="input-field input-mono" value="${currentData.updateIdx}">
          </div>
          <div class="form-field" style="max-width:85px;">
            <label for="uval-input">newVal</label>
            <input id="uval-input" type="number" class="input-field input-mono" value="${currentData.updateVal}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;

      document.getElementById('segtree-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const nums = document.getElementById('arr-input').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const ql = Number(document.getElementById('ql-input').value);
        const qr = Number(document.getElementById('qr-input').value);
        const uIdx = Number(document.getElementById('uidx-input').value);
        const uVal = Number(document.getElementById('uval-input').value);

        if (nums.length < 2 || nums.length > 8 || nums.some(Number.isNaN)) {
          errEl.textContent = 'Введите от 2 до 8 чисел.';
          errEl.hidden = false;
          return;
        }
        if (Number.isNaN(ql) || Number.isNaN(qr) || ql < 0 || qr >= nums.length || ql > qr) {
          errEl.textContent = `Отрезок запроса: 0 <= L <= R < ${nums.length}.`;
          errEl.hidden = false;
          return;
        }
        if (Number.isNaN(uIdx) || uIdx < 0 || uIdx >= nums.length || Number.isNaN(uVal)) {
          errEl.textContent = `Индекс обновления pos: 0 .. ${nums.length - 1}.`;
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { array: nums, queryL: ql, queryR: qr, updateIdx: uIdx, updateVal: uVal };
        runVisualization();
      });
    } else if (inputType === 'matrix') {
      const matrixStr = currentData.matrix.map((r) => r.join(' ')).join('; ');
      customInputArea.innerHTML = `
        <form id="matrix-custom-form" class="custom-input-form">
          <div class="form-field" style="flex:2;">
            <label for="mat-input">Квадратная матрица стоимостей (строки через «;», числа через пробел)</label>
            <input id="mat-input" type="text" class="input-field input-mono" value="${matrixStr}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить визуализацию</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;

      document.getElementById('matrix-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const rows = document
          .getElementById('mat-input')
          .value.split(';')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((rowStr) => rowStr.split(/[\s,]+/).filter(Boolean).map(Number));

        const n = rows.length;
        if (
          n < 2 ||
          n > 6 ||
          rows.some((r) => r.length !== n || r.some(Number.isNaN))
        ) {
          errEl.textContent = 'Введите квадратную матрицу размера от 2×2 до 6×6 (строки разделяйте точкой с запятой ;).';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { matrix: rows };
        runVisualization();
      });
    } else if (inputType === 'sieve') {
      customInputArea.innerHTML = `
        <form id="sieve-custom-form" class="custom-input-form">
          <div class="form-field" style="max-width:180px;">
            <label for="sieve-n">Верхняя граница N (2..100)</label>
            <input id="sieve-n" type="number" class="input-field input-mono" value="${currentData.n}" min="2" max="100">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить визуализацию</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('sieve-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const nVal = Number(document.getElementById('sieve-n').value);
        if (Number.isNaN(nVal) || nVal < 2 || nVal > 100) {
          errEl.textContent = 'Введите целое N от 2 до 100.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { n: nVal };
        runVisualization();
      });
    } else if (inputType === 'binpow') {
      customInputArea.innerHTML = `
        <form id="binpow-custom-form" class="custom-input-form">
          <div class="form-field" style="max-width:120px;">
            <label for="bp-a">Основание a</label>
            <input id="bp-a" type="number" class="input-field input-mono" value="${currentData.a}">
          </div>
          <div class="form-field" style="max-width:120px;">
            <label for="bp-n">Степень n (≥ 0)</label>
            <input id="bp-n" type="number" class="input-field input-mono" value="${currentData.n}" min="0">
          </div>
          <div class="form-field" style="max-width:120px;">
            <label for="bp-m">Модуль m (≥ 1)</label>
            <input id="bp-m" type="number" class="input-field input-mono" value="${currentData.m}" min="1">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('binpow-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const aVal = Number(document.getElementById('bp-a').value);
        const nVal = Number(document.getElementById('bp-n').value);
        const mVal = Number(document.getElementById('bp-m').value);
        if ([aVal, nVal, mVal].some(Number.isNaN) || nVal < 0 || nVal > 1e9 || mVal < 1) {
          errEl.textContent = 'Проверьте числа: n ≥ 0, m ≥ 1.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { a: aVal, n: nVal, m: mVal };
        runVisualization();
      });
    } else if (inputType === 'extgcd') {
      customInputArea.innerHTML = `
        <form id="extgcd-custom-form" class="custom-input-form">
          <div class="form-field" style="max-width:140px;">
            <label for="eg-a">Число a (≥ 0)</label>
            <input id="eg-a" type="number" class="input-field input-mono" value="${currentData.a}" min="0">
          </div>
          <div class="form-field" style="max-width:140px;">
            <label for="eg-b">Число b (≥ 0)</label>
            <input id="eg-b" type="number" class="input-field input-mono" value="${currentData.b}" min="0">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('extgcd-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const aVal = Number(document.getElementById('eg-a').value);
        const bVal = Number(document.getElementById('eg-b').value);
        if (Number.isNaN(aVal) || Number.isNaN(bVal) || aVal < 0 || bVal < 0 || (aVal === 0 && bVal === 0)) {
          errEl.textContent = 'Введите неотрицательные числа (хотя бы одно > 0).';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { a: aVal, b: bVal };
        runVisualization();
      });
    } else if (inputType === 'crt') {
      const crtStr = currentData.congruences.map((c) => `${c.r} ${c.m}`).join('; ');
      customInputArea.innerHTML = `
        <form id="crt-custom-form" class="custom-input-form">
          <div class="form-field" style="flex:2;">
            <label for="crt-input">Пары «r m» через «;» (взаимно простые модули)</label>
            <input id="crt-input" type="text" class="input-field input-mono" value="${crtStr}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Решить систему</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('crt-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const pairs = document
          .getElementById('crt-input')
          .value.split(';')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((p) => p.split(/[\s,]+/).filter(Boolean).map(Number));

        if (
          pairs.length < 2 ||
          pairs.length > 4 ||
          pairs.some((p) => p.length !== 2 || p.some(Number.isNaN) || p[1] < 2)
        ) {
          errEl.textContent = 'Введите от 2 до 4 пар «r m» (m ≥ 2), разделённых точкой с запятой.';
          errEl.hidden = false;
          return;
        }

        const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
        for (let i = 0; i < pairs.length; i++) {
          for (let j = i + 1; j < pairs.length; j++) {
            if (gcd(pairs[i][1], pairs[j][1]) !== 1) {
              errEl.textContent = `Модули ${pairs[i][1]} и ${pairs[j][1]} должны быть взаимно простыми!`;
              errEl.hidden = false;
              return;
            }
          }
        }
        errEl.hidden = true;
        currentData = { congruences: pairs.map(([r, m]) => ({ r, m })) };
        runVisualization();
      });
    } else if (inputType === 'lca') {
      customInputArea.innerHTML = `
        <form id="lca-custom-form" class="custom-input-form">
          <div class="form-field" style="max-width:150px;">
            <label for="lca-u">Вершина u</label>
            <select id="lca-u" class="select-field input-mono">
              ${currentData.nodes
                .map((n) => `<option value="${n.id}" ${n.id === currentData.u ? 'selected' : ''}>Вершина ${n.id}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-field" style="max-width:150px;">
            <label for="lca-v">Вершина v</label>
            <select id="lca-v" class="select-field input-mono">
              ${currentData.nodes
                .map((n) => `<option value="${n.id}" ${n.id === currentData.v ? 'selected' : ''}>Вершина ${n.id}</option>`)
                .join('')}
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Найти LCA(u, v)</button>
        </form>
      `;
      document.getElementById('lca-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        currentData.u = Number(document.getElementById('lca-u').value);
        currentData.v = Number(document.getElementById('lca-v').value);
        runVisualization();
      });
    } else if (inputType === 'string-algo') {
      customInputArea.innerHTML = `
        <form id="str-custom-form" class="custom-input-form">
          <div class="form-field" style="max-width:190px;">
            <label for="str-mode">Алгоритм</label>
            <select id="str-mode" class="select-field">
              <option value="pi" ${currentData.algoMode === 'pi' ? 'selected' : ''}>Префикс-функция π[i]</option>
              <option value="z" ${currentData.algoMode === 'z' ? 'selected' : ''}>Z-функция Z[i]</option>
            </select>
          </div>
          <div class="form-field" style="flex:2;">
            <label for="str-text">Строка (можно pattern#text, до 24 симв.)</label>
            <input id="str-text" type="text" class="input-field input-mono" value="${escapeHtml(currentData.text)}" maxlength="24">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('str-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const txt = document.getElementById('str-text').value.trim();
        const mode = document.getElementById('str-mode').value;
        if (txt.length < 2 || txt.length > 24) {
          errEl.textContent = 'Введите строку длиной от 2 до 24 символов.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { text: txt, algoMode: mode };
        runVisualization();
      });
    } else if (inputType === 'fenwick') {
      customInputArea.innerHTML = `
        <form id="fenwick-custom-form" class="custom-input-form">
          <div class="form-field" style="flex:2;">
            <label for="fw-arr">Массив a[1..n] (до 12 чисел)</label>
            <input id="fw-arr" type="text" class="input-field input-mono" value="${currentData.array.join(', ')}">
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="fw-r">sum(r)</label>
            <input id="fw-r" type="number" class="input-field input-mono" value="${currentData.queryR}" min="1">
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="fw-idx">add idx</label>
            <input id="fw-idx" type="number" class="input-field input-mono" value="${currentData.addIdx}" min="1">
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="fw-delta">delta</label>
            <input id="fw-delta" type="number" class="input-field input-mono" value="${currentData.addDelta}">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('fenwick-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const nums = document.getElementById('fw-arr').value.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
        const qr = Number(document.getElementById('fw-r').value);
        const idx = Number(document.getElementById('fw-idx').value);
        const delta = Number(document.getElementById('fw-delta').value);
        if (nums.length < 2 || nums.length > 12 || nums.some(Number.isNaN)) {
          errEl.textContent = 'Введите от 2 до 12 чисел.';
          errEl.hidden = false;
          return;
        }
        if (Number.isNaN(qr) || qr < 1 || qr > nums.length || Number.isNaN(idx) || idx < 1 || idx > nums.length || Number.isNaN(delta)) {
          errEl.textContent = `Укажите индексы в диапазоне 1..${nums.length}.`;
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { array: nums, queryR: qr, addIdx: idx, addDelta: delta };
        runVisualization();
      });
    } else if (inputType === 'two-strings') {
      customInputArea.innerHTML = `
        <form id="twostr-custom-form" class="custom-input-form">
          <div class="form-field" style="max-width:190px;">
            <label for="ts-mode">Задача</label>
            <select id="ts-mode" class="select-field">
              <option value="lcs" ${currentData.algoMode === 'lcs' ? 'selected' : ''}>LCS (подпоследовательность)</option>
              <option value="levenshtein" ${currentData.algoMode === 'levenshtein' ? 'selected' : ''}>Расстояние Левенштейна</option>
            </select>
          </div>
          <div class="form-field">
            <label for="ts-s1">Строка s1 (1..8)</label>
            <input id="ts-s1" type="text" class="input-field input-mono" value="${escapeHtml(currentData.s1)}" maxlength="8">
          </div>
          <div class="form-field">
            <label for="ts-s2">Строка s2 (1..8)</label>
            <input id="ts-s2" type="text" class="input-field input-mono" value="${escapeHtml(currentData.s2)}" maxlength="8">
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Запустить</button>
          <div id="custom-form-err" class="form-error" hidden></div>
        </form>
      `;
      document.getElementById('twostr-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('custom-form-err');
        const s1 = document.getElementById('ts-s1').value.trim();
        const s2 = document.getElementById('ts-s2').value.trim();
        const mode = document.getElementById('ts-mode').value;
        if (!s1 || !s2 || s1.length > 8 || s2.length > 8) {
          errEl.textContent = 'Введите две непустые строки длиной до 8 символов.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        currentData = { s1, s2, algoMode: mode };
        runVisualization();
      });
    } else if (topic.engine === 'graph') {
      const hasStartNode = currentData.startNode !== undefined;
      customInputArea.innerHTML = `
        <div class="custom-input-form">
          ${
            hasStartNode
              ? `<div class="form-field" style="max-width:180px;">
                  <label for="bfs-start-select">Стартовая вершина</label>
                  <select id="bfs-start-select" class="select-field input-mono">
                    ${currentData.nodes
                      .map(
                        (n) =>
                          `<option value="${n.id}" ${n.id === currentData.startNode ? 'selected' : ''}>Вершина ${n.id}</option>`
                      )
                      .join('')}
                  </select>
                </div>`
              : ''
          }
          <button type="button" id="toggle-graph-edit" class="btn ${graphEditMode ? 'btn-primary' : 'btn-secondary'} btn-sm">
            ${graphEditMode ? '✓ Режим редактирования (вкл)' : '✎ Добавить вершину / ребро кликом'}
          </button>
          <button type="button" id="reset-graph-btn" class="btn btn-ghost btn-sm">Сбросить граф</button>
          ${
            graphEditMode
              ? '<div style="width:100%; font-size:12px; color:var(--accent-light);">Клик по пустому фону графа — добавить вершину. Клик по двум вершинам подряд — соединить ребром (или объединить в DSU).</div>'
              : ''
          }
        </div>
      `;

      const startSelect = document.getElementById('bfs-start-select');
      if (startSelect) {
        startSelect.addEventListener('change', (e) => {
          currentData.startNode = Number(e.target.value);
          runVisualization();
        });
      }

      document.getElementById('toggle-graph-edit').addEventListener('click', () => {
        graphEditMode = !graphEditMode;
        edgeStartNode = null;
        rebuildCustomForm();
        player.onRenderFrame(player.frames[player.index], player.index, player.frames.length);
      });

      document.getElementById('reset-graph-btn').addEventListener('click', () => {
        const preset = topic.presets.find((p) => p.id === activePresetId) || topic.presets[0];
        currentData = structuredClone(preset.data);
        edgeStartNode = null;
        rebuildCustomForm();
        runVisualization();
      });

      // Вставка графа в формате Codeforces (n m + m строк u v [w])
      const cfGraphBox = document.createElement('details');
      cfGraphBox.className = 'cf-import-box';
      cfGraphBox.innerHTML = `
        <summary>📋 Ввод графа как на Codeforces (n m + рёбра 1-индексации)</summary>
        <textarea id="cf-graph-ta" class="cf-textarea" placeholder="4 4&#10;1 2 3&#10;2 3 5&#10;3 4 2&#10;4 1 7"></textarea>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" id="cf-graph-apply" class="btn btn-primary btn-xs">Загрузить граф</button>
          <span id="cf-graph-err" style="font-size:12px; color:var(--danger);" hidden></span>
        </div>
      `;
      customInputArea.appendChild(cfGraphBox);

      document.getElementById('cf-graph-apply').addEventListener('click', () => {
        const errEl = document.getElementById('cf-graph-err');
        const lines = document.getElementById('cf-graph-ta').value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        if (lines.length === 0) {
          errEl.textContent = 'Вставьте строки в формате: n m, затем m рёбер.';
          errEl.hidden = false;
          return;
        }
        const [n, m] = lines[0].split(/\s+/).map(Number);
        if (Number.isNaN(n) || n < 2 || n > 12 || Number.isNaN(m) || m < 0) {
          errEl.textContent = 'Первая строка: n (2..12) и m (≥ 0).';
          errEl.hidden = false;
          return;
        }
        const parsedEdges = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(/\s+/).map(Number);
          if (parts.length < 2 || parts.some(Number.isNaN)) continue;
          const u = parts[0] - 1;
          const v = parts[1] - 1;
          if (u < 0 || u >= n || v < 0 || v >= n) {
            errEl.textContent = `Вершины должны быть от 1 до ${n} (строка ${i + 1}).`;
            errEl.hidden = false;
            return;
          }
          parsedEdges.push(parts[2] !== undefined ? { from: u, to: v, weight: parts[2] } : { from: u, to: v });
        }
        const nodes = Array.from({ length: n }, (_, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          return {
            id: i,
            x: Math.round(280 + 95 * Math.cos(angle)),
            y: Math.round(130 + 90 * Math.sin(angle))
          };
        });
        errEl.hidden = true;
        currentData = {
          nodes,
          edges: parsedEdges,
          ...(currentData.startNode !== undefined ? { startNode: 0 } : {})
        };
        rebuildCustomForm();
        runVisualization();
        showToast(`Граф загружен (${n} вершин, ${parsedEdges.length} рёбер)`);
      });
    }

    // Универсальный парсер массива как на Codeforces (n на 1-й строке, элементы на 2-й)
    if (topic.engine === 'array') {
      const cfArrBox = document.createElement('details');
      cfArrBox.className = 'cf-import-box';
      cfArrBox.innerHTML = `
        <summary>📋 Ввод массива как на Codeforces (n и элементы)</summary>
        <textarea id="cf-arr-ta" class="cf-textarea" placeholder="6&#10;2 5 8 12 16 23"></textarea>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" id="cf-arr-apply" class="btn btn-primary btn-xs">Подставить массив</button>
          <span id="cf-arr-err" style="font-size:12px; color:var(--danger);" hidden></span>
        </div>
      `;
      customInputArea.appendChild(cfArrBox);

      document.getElementById('cf-arr-apply').addEventListener('click', () => {
        const errEl = document.getElementById('cf-arr-err');
        const lines = document.getElementById('cf-arr-ta').value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        if (lines.length < 2) {
          errEl.textContent = 'Нужно минимум 2 строки: n на первой, элементы на второй.';
          errEl.hidden = false;
          return;
        }
        const header = lines[0].split(/\s+/).map(Number);
        const nums = lines.slice(1).join(' ').split(/[\s,]+/).filter(Boolean).map(Number);
        if (Number.isNaN(header[0]) || nums.length === 0 || nums.some(Number.isNaN)) {
          errEl.textContent = 'Некорректные числа во вводе.';
          errEl.hidden = false;
          return;
        }
        errEl.hidden = true;
        const arrField = document.getElementById('arr-input') || document.getElementById('fw-arr');
        if (arrField) arrField.value = nums.join(', ');
        if (header.length >= 2 && document.getElementById('target-input')) {
          document.getElementById('target-input').value = header[1];
        }
        const form = customInputArea.querySelector('form');
        if (form) form.requestSubmit();
      });
    }
  }

  // Переключение пресетов
  container.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activePresetId = btn.getAttribute('data-preset');
      const preset = topic.presets.find((p) => p.id === activePresetId);
      if (!preset) return;
      currentData = structuredClone(preset.data);
      edgeStartNode = null;

      container.querySelectorAll('[data-preset]').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-preset') === activePresetId);
      });

      rebuildCustomForm();
      runVisualization();
    });
  });

  // Вкладки C++ / Python / Задачи и тест
  const tabContentArea = document.getElementById('tab-content-area');
  function renderTab(tabName) {
    if (tabName === 'cpp' || tabName === 'python') {
      const codeStr = topic.code[tabName];
      const label = tabName === 'cpp' ? 'C++17' : 'Python 3';
      tabContentArea.innerHTML = `
        <div class="code-block-wrap">
          <div class="code-block-header">
            <span>${label}</span>
            <button type="button" id="copy-code-btn" class="btn btn-secondary btn-xs">Копировать код</button>
          </div>
          <pre class="code-pre"><code>${highlightCode(codeStr, tabName)}</code></pre>
        </div>
      `;
      document.getElementById('copy-code-btn').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeStr);
          showToast('Код скопирован в буфер обмена');
        } catch {
          showToast('Не удалось скопировать автоматически');
        }
      });
    } else if (tabName === 'fill') {
      const tasks = topic.fillBlanks || [];
      if (tasks.length === 0) {
        tabContentArea.innerHTML = `<p style="color:var(--text-secondary);">Задачи для этой темы скоро появятся.</p>`;
        return;
      }

      const normalizeCode = (s) =>
        String(s)
          .trim()
          .replace(/;+$/, '')
          .replace(/\s+/g, '')
          .replace(/\(\s*/g, '(')
          .replace(/\s*\)/g, ')');

      tabContentArea.innerHTML = tasks
        .map(
          (task, tIdx) => `
          <div class="fill-task-card" data-fill-task="${tIdx}">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong>${escapeHtml(task.title)}</strong>
              <span class="badge badge-accent">${task.lang === 'cpp' ? 'C++' : 'Python'}</span>
            </div>
            <div class="fill-code-box">
              ${task.lines
                .map((ln) => {
                  if (typeof ln === 'string') {
                    return `<div class="fill-line">${highlightCode(ln, task.lang)}</div>`;
                  }
                  return `<div class="fill-blank-row"><span>${escapeHtml(ln.indent || '')}</span><input type="text" class="fill-input" data-blank-id="${ln.blankId}" placeholder="${escapeHtml(ln.placeholder)}" autocomplete="off" spellcheck="false"></div>`;
                })
                .join('')}
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <button type="button" class="btn btn-primary btn-sm" data-check-fill="${tIdx}">Проверить</button>
              <button type="button" class="btn btn-secondary btn-sm" data-hint-fill="${tIdx}">Показать подсказку / ответ</button>
              <span class="fill-result-msg" style="font-size:13px;"></span>
            </div>
          </div>
        `
        )
        .join('');

      tasks.forEach((task, tIdx) => {
        const card = tabContentArea.querySelector(`[data-fill-task="${tIdx}"]`);
        const msgEl = card.querySelector('.fill-result-msg');
        const blanks = task.lines.filter((ln) => typeof ln === 'object');

        card.querySelector(`[data-check-fill="${tIdx}"]`).addEventListener('click', () => {
          let allOk = true;
          blanks.forEach((b) => {
            const input = card.querySelector(`[data-blank-id="${b.blankId}"]`);
            const normUser = normalizeCode(input.value);
            const ok = normUser.length > 0 && b.answers.some((ans) => normalizeCode(ans) === normUser);
            input.classList.remove('correct', 'wrong');
            input.classList.add(ok ? 'correct' : 'wrong');
            if (!ok) allOk = false;
          });
          msgEl.style.color = allOk ? 'var(--success)' : 'var(--danger)';
          msgEl.textContent = allOk ? '✓ Все строки верны!' : '✕ Есть ошибки в подсвеченных строках.';
        });

        card.querySelector(`[data-hint-fill="${tIdx}"]`).addEventListener('click', () => {
          blanks.forEach((b) => {
            const input = card.querySelector(`[data-blank-id="${b.blankId}"]`);
            input.value = b.hint;
            input.classList.remove('wrong');
            input.classList.add('correct');
          });
          msgEl.style.color = 'var(--accent-light)';
          msgEl.textContent = 'Показан эталонный вариант.';
        });
      });
    } else if (tabName === 'pysandbox') {
      const { starter, tests } = getTestsForTopic(topic.id);
      tabContentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
          <div>
            <strong>Запуск Python-решения в браузере (Pyodide)</strong>
            <div style="font-size:12px; color:var(--text-secondary);">Pyodide загружается лениво только при первом запуске тестов.</div>
          </div>
          <button type="button" id="py-run-btn" class="btn btn-primary btn-sm">▶ Запустить на тестах (${tests.length})</button>
        </div>
        <textarea id="py-code-editor" class="py-editor" spellcheck="false">${escapeHtml(starter)}</textarea>
        <div id="py-status" style="margin-top:8px; font-size:13px; color:var(--accent-light);" hidden></div>
        <div id="py-results" class="py-test-list"></div>
      `;

      const runBtn = document.getElementById('py-run-btn');
      const statusEl = document.getElementById('py-status');
      const resultsEl = document.getElementById('py-results');
      const editorEl = document.getElementById('py-code-editor');

      runBtn.addEventListener('click', async () => {
        runBtn.disabled = true;
        statusEl.hidden = false;
        statusEl.textContent = '⏳ Инициализация Pyodide и выполнение тестов...';
        resultsEl.innerHTML = '';

        try {
          const results = await runPythonTests(editorEl.value, tests);
          const passed = results.filter((r) => r.verdict === 'OK').length;
          statusEl.textContent = `Готово: пройдено ${passed} из ${results.length} тестов.`;
          resultsEl.innerHTML = results
            .map(
              (r) => `
              <div class="py-test-row ${r.verdict === 'OK' ? 'ok' : 'fail'}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>Тест #${r.index}: <span class="${r.verdict === 'OK' ? 'status-ok' : 'status-tle'}">${r.verdict}</span></strong>
                  <span class="mono" style="font-size:12px; color:var(--text-secondary);">${r.ms} мс</span>
                </div>
                ${
                  r.verdict !== 'OK'
                    ? `<div class="mono" style="font-size:12px; margin-top:6px; color:var(--text-secondary);">
                        Ввод: ${escapeHtml(r.input.trim().replace(/\n/g, ' | '))}<br>
                        Ожидалось: ${escapeHtml(r.expected)}<br>
                        Получено: ${escapeHtml(r.actual)}
                       </div>`
                    : ''
                }
              </div>
            `
            )
            .join('');
        } catch (err) {
          statusEl.textContent = `Ошибка загрузки Pyodide: ${err.message}`;
        } finally {
          runBtn.disabled = false;
        }
      });
    } else {
      const q = topic.quiz;
      const cfTag = getCfTagForTopic(topic.id);
      const staticProblemsHtml = topic.problems
        .map(
          (pr) => `
          <a href="${pr.url}" target="_blank" rel="noopener noreferrer" class="problem-link-card">
            <div>
              <div style="font-weight:500; font-size:14px;">${escapeHtml(pr.title)}</div>
              <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(pr.platform)}</div>
            </div>
            <span class="badge ${pr.difficulty === 'Easy' ? 'badge-success' : 'badge-accent'}">${escapeHtml(pr.difficulty)}</span>
          </a>
        `
        )
        .join('');

      tabContentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
          <h3 style="margin:0; font-size:15px;">Задачи на закрепление (Codeforces API: <span class="mono" style="color:var(--accent-light);">${escapeHtml(cfTag)}</span>)</h3>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <select id="cf-rating-filter" class="select-field" style="width:auto; padding:4px 8px; font-size:12.5px;">
              <option value="all">Любой рейтинг</option>
              <option value="my-rating">Под мой рейтинг (+100..200)</option>
              <option value="800-1100">800–1100</option>
              <option value="1200-1500">1200–1500</option>
              <option value="1600-1900">1600–1900</option>
              <option value="2000+">2000+</option>
            </select>
            <label class="checkbox-pill" style="padding:4px 8px; font-size:12.5px;">
              <input type="checkbox" id="cf-hide-solved">
              <span>Скрывать решённые</span>
            </label>
            <button type="button" id="cf-refresh-btn" class="btn btn-secondary btn-xs">🔄 Обновить подборку задач</button>
          </div>
        </div>
        <div id="cf-status-msg" style="font-size:12.5px; color:var(--text-secondary); margin-bottom:8px;">⏳ Загрузка задач с Codeforces...</div>
        <div id="cf-problems-list" class="problems-list">${staticProblemsHtml}</div>

        <h3 style="margin:0 0 10px; font-size:15px;">Мини-тест: определите асимптотику</h3>
        <div class="quiz-box">
          <pre class="code-pre" style="padding:10px 12px; background:var(--bg-code); border-radius:6px; margin-bottom:12px;"><code>${highlightCode(q.snippet, 'cpp')}</code></pre>
          <div style="font-size:14px; font-weight:500;">${escapeHtml(q.question)}</div>
          <div class="quiz-options">
            ${q.options
              .map(
                (opt) => `<button type="button" class="quiz-option-btn" data-opt="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`
              )
              .join('')}
          </div>
          <div id="quiz-feedback" style="margin-top:10px; font-size:13px;" hidden></div>
        </div>
      `;

      const cfStatus = document.getElementById('cf-status-msg');
      const cfList = document.getElementById('cf-problems-list');
      const cfRating = document.getElementById('cf-rating-filter');
      const cfHideSolved = document.getElementById('cf-hide-solved');
      const cfRefresh = document.getElementById('cf-refresh-btn');

      async function loadCfProblems() {
        cfStatus.textContent = '⏳ Загрузка задач с Codeforces...';
        cfRefresh.disabled = true;
        try {
          let ratingArg = cfRating.value;
          const solvedSet = new Set(state.cfProfile?.solved || []);

          if (ratingArg === 'my-rating') {
            if (!state.cfProfile) {
              cfStatus.textContent = 'Синхронизируйте профиль CF в сайдбаре, чтобы использовать фильтр по вашему рейтингу.';
              ratingArg = 'all';
            } else {
              const r = state.cfProfile.rating || 1200;
              const lo = Math.max(800, r - 100);
              const hi = r + 200;
              const { items: rawAll } = await fetchCfProblems(topic.id, 'all', 40);
              const matched = rawAll
                .filter((p) => p.rating >= lo && p.rating <= hi && (!cfHideSolved.checked || !solvedSet.has(p.code)))
                .slice(0, 5);
              renderCfItems(matched, solvedSet, `Показано ${matched.length} задач под ваш рейтинг (${lo}–${hi}):`);
              return;
            }
          }

          const { items: rawItems } = await fetchCfProblems(topic.id, ratingArg, 20);
          const filtered = cfHideSolved.checked ? rawItems.filter((p) => !solvedSet.has(p.code)) : rawItems;
          const finalItems = filtered.slice(0, 5);
          renderCfItems(finalItems, solvedSet, `Показано ${finalItems.length} случайных задач с Codeforces (кэш 30 мин):`);
        } catch {
          cfStatus.textContent = 'API Codeforces временно недоступен — показаны сохранённые задачи темы.';
          cfList.innerHTML = staticProblemsHtml;
        } finally {
          cfRefresh.disabled = false;
        }
      }

      function renderCfItems(items, solvedSet, okText) {
        if (items.length === 0) {
          cfStatus.textContent = 'По выбранным фильтрам задач не найдено — показаны базовые задачи темы.';
          cfList.innerHTML = staticProblemsHtml;
          return;
        }
        cfStatus.textContent = okText;
        cfList.innerHTML = items
          .map((pr) => {
            const isAc = solvedSet.has(pr.code);
            return `
              <a href="${pr.url}" target="_blank" rel="noopener noreferrer" class="problem-link-card">
                <div>
                  <div style="font-weight:500; font-size:14px;">
                    <span class="mono" style="color:var(--accent-light);">${escapeHtml(pr.code)}</span> ${escapeHtml(pr.name)}
                    ${isAc ? '<span class="badge badge-success" style="margin-left:4px;">✓ AC</span>' : ''}
                  </div>
                  <div style="font-size:12px; color:var(--text-secondary);">Решили: ${pr.solvedCount}</div>
                </div>
                <span class="badge badge-accent">${pr.rating}</span>
              </a>
            `;
          })
          .join('');
      }

      cfRating.addEventListener('change', loadCfProblems);
      cfHideSolved.addEventListener('change', loadCfProblems);
      cfRefresh.addEventListener('click', loadCfProblems);
      loadCfProblems();

      tabContentArea.querySelectorAll('.quiz-option-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const chosen = btn.getAttribute('data-opt');
          const fb = document.getElementById('quiz-feedback');
          tabContentArea.querySelectorAll('.quiz-option-btn').forEach((b) => {
            b.classList.remove('correct', 'wrong');
          });
          if (chosen === q.answer) {
            btn.classList.add('correct');
            fb.style.color = 'var(--success)';
            fb.textContent = `✓ Верно! ${q.explanation}`;
          } else {
            btn.classList.add('wrong');
            fb.style.color = 'var(--danger)';
            fb.textContent = `✕ Неверно. Попробуйте другой вариант.`;
          }
          fb.hidden = false;
        });
      });
    }
  }

  container.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderTab(btn.getAttribute('data-tab'));
    });
  });

  rebuildCustomForm();
  runVisualization();
  renderTab('cpp');
}

// ============================================================================
// Калькулятор ограничений (N -> O) и Сборщик Тимбука
// ============================================================================
function renderCalculatorView(container) {
  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
    </div>
    <section class="card">
      <h1 class="topic-title" style="margin-top:0;">Анализатор асимптотики и ограничений (N → O)</h1>
      <p style="color:var(--text-secondary); margin-top:4px;">
        Оцените, какие алгоритмы уложатся в Time Limit на C++ (~2·10⁸ оп/с) и Python / PyPy (~10⁷ оп/с) при заданном размере входа N.
      </p>

      <div class="custom-input-form">
        <div class="form-field">
          <label for="calc-n">Максимальное N</label>
          <input id="calc-n" type="number" class="input-field input-mono" value="100000" min="1">
        </div>
        <div class="form-field" style="max-width:160px;">
          <label for="calc-t">Лимит времени (сек)</label>
          <input id="calc-t" type="number" step="0.1" class="input-field input-mono" value="1.0" min="0.1">
        </div>
      </div>

      <div class="calc-table-wrap">
        <table class="calc-table">
          <thead>
            <tr>
              <th>Асимптотика</th>
              <th>~Операций</th>
              <th>C++ (2·10⁸ оп/с)</th>
              <th>Python / PyPy (10⁷ оп/с)</th>
              <th>Темы в портале</th>
            </tr>
          </thead>
          <tbody id="calc-tbody"></tbody>
        </table>
      </div>
    </section>
  `;

  const nInput = document.getElementById('calc-n');
  const tInput = document.getElementById('calc-t');
  const tbody = document.getElementById('calc-tbody');

  const formatOps = (ops) => {
    if (!Number.isFinite(ops) || ops > 1e18) return '> 10¹⁸';
    if (ops < 1000) return String(Math.round(ops));
    return ops.toExponential(1).replace('+', '');
  };

  const evalStatus = (ops, limit) => {
    if (!Number.isFinite(ops) || ops > limit * 1.5) return { text: 'TLE (Превышение)', cls: 'status-tle' };
    if (ops > limit * 0.4) return { text: 'Риск TL', cls: 'status-risk' };
    return { text: 'OK (Пройдёт)', cls: 'status-ok' };
  };

  function updateCalc() {
    const N = Math.max(1, Number(nInput.value) || 1);
    const T = Math.max(0.1, Number(tInput.value) || 1.0);
    const cppLimit = 2e8 * T;
    const pyLimit = 1e7 * T;

    const rows = [
      { label: 'O(log N)', ops: Math.log2(N + 1), topics: ['binary-search', 'segment-tree'] },
      { label: 'O(N)', ops: N, topics: ['two-pointers', 'bfs', 'dfs'] },
      { label: 'O(N log N)', ops: N * Math.log2(N + 1), topics: ['sorting-prefix', 'dijkstra', 'kruskal'] },
      { label: 'O(N √N)', ops: N * Math.sqrt(N), topics: [] },
      { label: 'O(N²)', ops: N * N, topics: ['knapsack'] },
      { label: 'O(2^N)', ops: N > 60 ? Infinity : Math.pow(2, N), topics: [] }
    ];

    tbody.innerHTML = rows
      .map((r) => {
        const cpp = evalStatus(r.ops, cppLimit);
        const py = evalStatus(r.ops, pyLimit);
        const links = r.topics
          .map((id) => {
            const t = TOPICS.find((x) => x.id === id);
            return t ? `<a href="#topic=${t.id}" class="badge badge-accent" style="margin:2px;">${escapeHtml(t.title)}</a>` : '';
          })
          .join(' ');
        return `
          <tr>
            <td class="mono" style="color:var(--accent-light); font-weight:600;">${r.label}</td>
            <td class="mono">${formatOps(r.ops)}</td>
            <td class="${cpp.cls}">${cpp.text}</td>
            <td class="${py.cls}">${py.text}</td>
            <td>${links || '<span style="color:var(--text-secondary);">—</span>'}</td>
          </tr>
        `;
      })
      .join('');
  }

  nInput.addEventListener('input', updateCalc);
  tInput.addEventListener('input', updateCalc);
  updateCalc();
}

function renderTimbookView(container) {
  const defaultSelected = state.cheatsheet.size > 0
    ? new Set(state.cheatsheet)
    : new Set(TOPICS.filter((t) => !t.isStub).map((t) => t.id));

  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
    </div>
    <section class="card">
      <h1 class="topic-title" style="margin-top:0;">Сборщик Тимбука (ICPC Reference)</h1>
      <p style="color:var(--text-secondary); margin-top:4px;">
        Выберите темы и язык для формирования компактного двухколоночного справочника с оглавлением и шаблонами кода, готового к печати в PDF.
      </p>

      <div class="custom-input-form" style="justify-content:space-between;">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" id="tb-select-all" class="btn btn-secondary btn-sm">Выбрать все</button>
          <button type="button" id="tb-select-done" class="btn btn-secondary btn-sm">Только изученные</button>
          <button type="button" id="tb-clear-all" class="btn btn-ghost btn-sm">Снять все</button>
        </div>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <select id="tb-lang" class="select-field" style="width:auto;">
            <option value="cpp">Язык: C++</option>
            <option value="python">Язык: Python</option>
            <option value="both">Язык: C++ и Python</option>
          </select>
          <button type="button" id="tb-print-btn" class="btn btn-primary btn-sm">🖨 Сформировать и распечатать (PDF)</button>
        </div>
      </div>

      <div class="timbook-grid">
        ${TOPICS.map((t) => {
          const checked = defaultSelected.has(t.id) ? 'checked' : '';
          return `
            <label class="timbook-item">
              <input type="checkbox" class="tb-topic-cb" value="${t.id}" ${checked}>
              <div>
                <div style="font-weight:600; font-size:14px;">${escapeHtml(t.title)}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(t.timeComplexity)} • ${escapeHtml(t.category)}</div>
              </div>
            </label>
          `;
        }).join('')}
      </div>
    </section>
  `;

  const checkboxes = () => Array.from(container.querySelectorAll('.tb-topic-cb'));

  document.getElementById('tb-select-all').addEventListener('click', () => {
    checkboxes().forEach((cb) => (cb.checked = true));
  });
  document.getElementById('tb-select-done').addEventListener('click', () => {
    checkboxes().forEach((cb) => (cb.checked = state.completed.has(cb.value)));
  });
  document.getElementById('tb-clear-all').addEventListener('click', () => {
    checkboxes().forEach((cb) => (cb.checked = false));
  });

  document.getElementById('tb-print-btn').addEventListener('click', async () => {
    const selectedIds = checkboxes().filter((cb) => cb.checked).map((cb) => cb.value);
    if (selectedIds.length === 0) {
      showToast('Выберите хотя бы одну тему для Тимбука');
      return;
    }

    const btn = document.getElementById('tb-print-btn');
    btn.disabled = true;
    const selected = await loadTopicsByIds(selectedIds);
    btn.disabled = false;

    const lang = document.getElementById('tb-lang').value;
    const printArea = document.getElementById('print-cheatsheet-area');

    printArea.innerHTML = `
      <h1 style="margin:0 0 6px; font-size:15pt;">AlgoPortal — ICPC Team Reference (${lang === 'both' ? 'C++ & Python' : lang.toUpperCase()})</h1>
      <div class="print-toc">
        <strong>Оглавление:</strong> ${selected.map((t, idx) => `${idx + 1}. ${escapeHtml(t.title)} (${escapeHtml(t.timeComplexity)})`).join(' • ')}
      </div>
      <div class="print-columns">
        ${selected
          .map((t, idx) => {
            const cppBlock = (lang === 'cpp' || lang === 'both') && t.code?.cpp ? `<pre>${escapeHtml(t.code.cpp)}</pre>` : '';
            const pyBlock = (lang === 'python' || lang === 'both') && t.code?.python ? `<pre>${escapeHtml(t.code.python)}</pre>` : '';
            return `
              <div class="print-topic">
                <h2>${idx + 1}. ${escapeHtml(t.title)}</h2>
                <div class="print-meta"><strong>Время:</strong> ${escapeHtml(t.timeComplexity)} | <strong>Память:</strong> ${escapeHtml(t.spaceComplexity)}</div>
                ${t.pitfalls?.length ? `<div class="print-meta"><em>Важно:</em> ${escapeHtml(t.pitfalls[0])}</div>` : ''}
                ${cppBlock}${pyBlock}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
    window.print();
  });
}

// ============================================================================
// Экспорт / Импорт
// ============================================================================
function setupGlobalActions() {
  document.getElementById('topic-search').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderSidebar();
    if (!state.activeTopicId && window.location.hash !== '#calculator' && window.location.hash !== '#timbook') {
      renderRoadmapView(document.getElementById('main-content'));
    }
  });

  document.getElementById('menu-toggle').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebar-close').addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebar-backdrop').addEventListener('click', closeMobileSidebar);

  document.getElementById('export-progress-btn').addEventListener('click', () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      completed: [...state.completed],
      cheatsheet: [...state.cheatsheet],
      notes: state.notes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = `algoportal-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Прогресс и заметки экспортированы в JSON');
  });

  document.getElementById('import-progress-input').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.completed)) throw new Error('Invalid format');
        state.completed = new Set(data.completed);
        state.cheatsheet = new Set(Array.isArray(data.cheatsheet) ? data.cheatsheet : []);
        state.notes = data.notes && typeof data.notes === 'object' ? data.notes : {};
        saveState();
        renderCurrentRoute();
        showToast('Прогресс и заметки успешно импортированы!');
      } catch {
        showToast('Ошибка: некорректный JSON-файл');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

function setupContestTimer() {
  const modeSelect = document.getElementById('timer-mode-select');
  const customInput = document.getElementById('timer-custom-mins');
  const display = document.getElementById('timer-display');
  const startBtn = document.getElementById('timer-start-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  if (!modeSelect || !display) return;

  let mode = 'stopwatch';
  let seconds = 0;
  let running = false;
  let intervalId = null;

  const formatTime = (sec) => {
    const abs = Math.max(0, sec);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const resetTimer = () => {
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    startBtn.textContent = '▶ Старт';
    if (mode === 'stopwatch') seconds = 0;
    else if (mode === 'pomo25') seconds = 25 * 60;
    else if (mode === 'pomo5') seconds = 5 * 60;
    else seconds = Math.max(1, Number(customInput.value) || 120) * 60;
    display.textContent = formatTime(seconds);
  };

  modeSelect.addEventListener('change', () => {
    mode = modeSelect.value;
    customInput.hidden = mode !== 'custom';
    resetTimer();
  });

  customInput.addEventListener('change', () => {
    if (mode === 'custom') resetTimer();
  });

  startBtn.addEventListener('click', () => {
    if (running) {
      running = false;
      clearInterval(intervalId);
      intervalId = null;
      startBtn.textContent = '▶ Старт';
      return;
    }
    running = true;
    startBtn.textContent = '⏸ Пауза';
    intervalId = setInterval(() => {
      if (mode === 'stopwatch') {
        seconds++;
      } else {
        seconds--;
        if (seconds <= 0) {
          seconds = 0;
          running = false;
          clearInterval(intervalId);
          intervalId = null;
          startBtn.textContent = '▶ Старт';
          showToast('⏰ Время таймера вышло!');
        }
      }
      display.textContent = formatTime(seconds);
    }, 1000);
  });

  resetBtn.addEventListener('click', resetTimer);
  resetTimer();
}

function setupProjectorMode() {
  const btn = document.getElementById('projector-mode-btn');
  if (!btn) return;

  const toggle = () => {
    const enabled = document.body.classList.toggle('projector-mode');
    btn.textContent = enabled ? '✕ Выйти из проектора' : '📽 Проектор';
    showToast(enabled ? 'Режим проектора включён (нажмите F для выхода)' : 'Режим проектора выключен');
  };

  btn.addEventListener('click', toggle);
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) {
      return;
    }
    if ((e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggle();
    } else if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      toggle();
    }
  });
}

// ============================================================================
// Инициализация и синхронизация профиля Codeforces
// ============================================================================
function setupCfProfileSync() {
  const handleInput = document.getElementById('cf-handle-input');
  const syncBtn = document.getElementById('cf-sync-btn');
  const infoEl = document.getElementById('cf-profile-info');
  if (!handleInput || !syncBtn || !infoEl) return;

  const renderBadge = () => {
    if (!state.cfProfile) {
      infoEl.textContent = 'Профиль CF не подключён';
      return;
    }
    handleInput.value = state.cfProfile.handle;
    infoEl.innerHTML = `<span style="color:var(--accent-light); font-weight:600;">${escapeHtml(state.cfProfile.handle)}</span> • ${state.cfProfile.rating} (${escapeHtml(state.cfProfile.rank)}) • AC: ${state.cfProfile.solved.length}`;
  };

  syncBtn.addEventListener('click', async () => {
    const h = handleInput.value.trim();
    if (!h) {
      showToast('Введите хендл Codeforces');
      return;
    }
    syncBtn.disabled = true;
    infoEl.textContent = '⏳ Синхронизация...';
    try {
      state.cfProfile = await fetchCfUserProfile(h);
      saveState();
      renderBadge();
      showToast(`Профиль ${state.cfProfile.handle} синхронизирован!`);
    } catch (err) {
      infoEl.textContent = `Ошибка: ${err.message}`;
      showToast(`Ошибка CF: ${err.message}`);
    } finally {
      syncBtn.disabled = false;
    }
  });

  renderBadge();
}

function setupPwaAndOffline() {
  const pill = document.getElementById('net-status-pill');
  const cacheBtn = document.getElementById('cache-all-btn');

  const updateNetStatus = () => {
    if (!pill) return;
    if (navigator.onLine) {
      pill.className = 'badge badge-success';
      pill.textContent = '● Online';
    } else {
      pill.className = 'badge badge-warning';
      pill.textContent = '● Offline (кэш)';
    }
  };

  window.addEventListener('online', updateNetStatus);
  window.addEventListener('offline', updateNetStatus);
  updateNetStatus();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Игнорируем ошибку регистрации SW (например, при открытии через file://)
    });
  }

  if (cacheBtn) {
    cacheBtn.addEventListener('click', async () => {
      cacheBtn.disabled = true;
      cacheBtn.textContent = '⏳ Кэширование...';
      try {
        const count = await preloadAllTopics();
        showToast(`Все ${count} тем загружены в офлайн-кэш!`);
        cacheBtn.textContent = '✓ В кэше';
      } catch {
        showToast('Не удалось предзагрузить темы');
        cacheBtn.textContent = '📥 Кэш офлайн';
      } finally {
        cacheBtn.disabled = false;
      }
    });
  }
}

loadState();
updateProgressUI();
setupGlobalActions();
setupContestTimer();
setupProjectorMode();
setupCfProfileSync();
setupPwaAndOffline();
window.addEventListener('hashchange', renderCurrentRoute);
renderCurrentRoute();
