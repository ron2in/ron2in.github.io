/**
 * main.js
 * Связующий модуль UI, редактора CodeMirror, localStorage и игрового цикла.
 * Вся бизнес-логика вынесена в cppEngine.js, levels.js, cards.js и gameEngine.js.
 */

import { runCppCode } from './cppEngine.js';
import { FLOORS, SANDBOX_TEMPLATE } from './levels.js';
import { STARTER_CARDS, REWARD_POOL, pickRewardChoices, computeDeckBonuses } from './cards.js';
import { DungeonRenderer } from './gameEngine.js';

const STORAGE_KEY = 'cpp_dungeon_save_v1';

const defaultSave = () => ({
  unlockedFloor: 1,
  currentFloor: 1,
  currentRoom: 0,
  heroHp: 100,
  heroMaxHp: 100,
  heroMana: 100,
  heroMaxMana: 100,
  deckIds: ['scroll_int'],
  clearedRooms: []
});

let state = loadState();
let sandboxMode = false;
let roomCleared = false;
let currentEnemyHp = 25;
let editorInstance = null;

// DOM элементы
const el = {
  floorTitle: document.getElementById('floor-title'),
  roomTitle: document.getElementById('room-title'),
  heroHpText: document.getElementById('hero-hp-text'),
  heroHpBar: document.getElementById('hero-hp-bar'),
  heroManaText: document.getElementById('hero-mana-text'),
  heroManaBar: document.getElementById('hero-mana-bar'),
  enemyNameText: document.getElementById('enemy-name-text'),
  enemyHpText: document.getElementById('enemy-hp-text'),
  enemyHpBar: document.getElementById('enemy-hp-bar'),
  roomGoal: document.getElementById('room-goal'),
  roomActions: document.getElementById('room-actions'),
  btnNextRoom: document.getElementById('btn-next-room'),
  btnRun: document.getElementById('btn-run'),
  btnResetCode: document.getElementById('btn-reset-code'),
  btnSandbox: document.getElementById('btn-sandbox'),
  btnFloors: document.getElementById('btn-floors'),
  btnCloseFloors: document.getElementById('btn-close-floors'),
  btnResetSave: document.getElementById('btn-reset-save'),
  runStatus: document.getElementById('run-status'),
  coutOutput: document.getElementById('cout-output'),
  errorOutput: document.getElementById('error-output'),
  spellbookContent: document.getElementById('spellbook-content'),
  deckCards: document.getElementById('deck-cards'),
  deckBonuses: document.getElementById('deck-bonuses'),
  rewardModal: document.getElementById('reward-modal'),
  rewardChoices: document.getElementById('reward-choices'),
  floorsModal: document.getElementById('floors-modal'),
  floorsList: document.getElementById('floors-list'),
  textarea: document.getElementById('cpp-editor')
};

const renderer = new DungeonRenderer(
  document.getElementById('dungeon-canvas'),
  document.getElementById('minimap-canvas')
);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch {
    return defaultSave();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

function initEditor() {
  if (typeof globalThis.CodeMirror === 'function') {
    editorInstance = globalThis.CodeMirror.fromTextArea(el.textarea, {
      mode: 'text/x-c++src',
      theme: 'dracula',
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      matchBrackets: true
    });
  }
}

function getEditorCode() {
  return editorInstance ? editorInstance.getValue() : el.textarea.value;
}

function setEditorCode(code) {
  if (editorInstance) {
    editorInstance.setValue(code);
  } else {
    el.textarea.value = code;
  }
}

function insertSnippet(snippet) {
  if (editorInstance) {
    const doc = editorInstance.getDoc();
    doc.replaceSelection('\n' + snippet + '\n');
    editorInstance.focus();
  } else {
    el.textarea.value += '\n' + snippet + '\n';
  }
}

function getCurrentFloor() {
  return FLOORS.find(f => f.id === state.currentFloor) || FLOORS[0];
}

function getCurrentRoom() {
  const floor = getCurrentFloor();
  return floor.rooms[state.currentRoom] || floor.rooms[0];
}

function loadRoomUI(resetCode = true) {
  if (sandboxMode) {
    el.floorTitle.textContent = '🧪 Режим Песочницы';
    el.roomTitle.textContent = 'Свободная тренировка на манекене';
    el.roomGoal.textContent = 'Пиши любой код на C++ и проверяй заклинания на тренировочном манекене!';
    currentEnemyHp = 999;
    roomCleared = false;
    el.roomActions.classList.add('hidden');
    if (resetCode) setEditorCode(SANDBOX_TEMPLATE);
    renderer.setState({
      sandbox: true,
      roomCleared: false,
      enemy: { name: 'Манекен', sprite: 'dummy', hp: 999, maxHp: 999, armor: 0 },
      enemies: []
    });
    updateBars({ name: 'Манекен', hp: 999, maxHp: 999 });
    return;
  }

  const floor = getCurrentFloor();
  const room = getCurrentRoom();
  roomCleared = state.clearedRooms.includes(room.id);

  // Авто-разблокировка карточки темы этажа
  if (floor.unlockedCardId && !state.deckIds.includes(floor.unlockedCardId)) {
    state.deckIds.push(floor.unlockedCardId);
    saveState();
  }

  el.floorTitle.textContent = floor.title;
  el.roomTitle.textContent = `Комната ${state.currentRoom + 1}/${floor.rooms.length}: ${room.title}`;
  el.roomGoal.textContent = room.goal;
  el.spellbookContent.innerHTML = floor.theory;

  currentEnemyHp = room.enemy.hp;
  if (roomCleared) {
    currentEnemyHp = 0;
    el.roomActions.classList.remove('hidden');
  } else {
    el.roomActions.classList.add('hidden');
  }

  if (resetCode) {
    setEditorCode(room.starterCode);
  }

  el.coutOutput.textContent = '...';
  el.errorOutput.textContent = 'Ошибок нет.';
  el.runStatus.textContent = 'Готов к компиляции';

  renderer.setState({
    sandbox: false,
    floorIndex: floor.id - 1,
    roomIndex: state.currentRoom,
    totalRooms: floor.rooms.length,
    roomCleared,
    enemy: { ...room.enemy, hp: currentEnemyHp },
    enemies: room.enemies ? room.enemies.map(e => ({ ...e })) : []
  });

  updateBars({ ...room.enemy, hp: currentEnemyHp });
  renderDeck();
}

function updateBars(enemy) {
  el.heroHpText.textContent = `${state.heroHp} / ${state.heroMaxHp}`;
  el.heroHpBar.style.width = `${Math.max(0, Math.min(100, (state.heroHp / state.heroMaxHp) * 100))}%`;

  el.heroManaText.textContent = `${state.heroMana} / ${state.heroMaxMana}`;
  el.heroManaBar.style.width = `${Math.max(0, Math.min(100, (state.heroMana / state.heroMaxMana) * 100))}%`;

  const maxHp = enemy.maxHp || enemy.hp || 1;
  el.enemyNameText.textContent = `👾 ${enemy.name}`;
  el.enemyHpText.textContent = `${Math.max(0, enemy.hp)} / ${maxHp}`;
  el.enemyHpBar.style.width = `${Math.max(0, Math.min(100, (enemy.hp / maxHp) * 100))}%`;
}

function renderDeck() {
  const bonuses = computeDeckBonuses(state.deckIds);
  const parts = [];
  if (bonuses.flatDamage) parts.push(`+${bonuses.flatDamage} урон`);
  if (bonuses.loopBonus) parts.push(`+${bonuses.loopBonus} циклы`);
  if (bonuses.healBonus) parts.push(`+${bonuses.healBonus} лечение`);
  if (bonuses.shieldBonus) parts.push(`+${bonuses.shieldBonus} щит`);
  el.deckBonuses.textContent = `Бонусы: ${parts.length ? parts.join(', ') : 'нет'}`;

  const allCards = [...STARTER_CARDS, ...REWARD_POOL];
  el.deckCards.innerHTML = '';

  for (const id of state.deckIds) {
    const card = allCards.find(c => c.id === id);
    if (!card) continue;
    const div = document.createElement('div');
    div.className = `rpg-card rarity-${card.rarity}`;
    div.innerHTML = `
      <div class="rpg-card-title">${card.icon} ${card.title}</div>
      <div class="rpg-card-desc">${card.desc}</div>
    `;
    div.addEventListener('click', () => insertSnippet(card.snippet));
    el.deckCards.appendChild(div);
  }
}

function handleRun() {
  const code = getEditorCode();
  const bonuses = computeDeckBonuses(state.deckIds);

  if (sandboxMode) {
    const res = runCppCode(code, {
      heroHp: state.heroHp,
      heroMana: state.heroMana,
      enemy: { hp: currentEnemyHp, armor: 0 },
      bonuses
    });
    el.coutOutput.textContent = res.stdout || '(пусто)';
    if (!res.ok) {
      el.errorOutput.textContent = res.error.formatted;
      el.runStatus.textContent = '❌ Ошибка компиляции';
      return;
    }
    currentEnemyHp = Math.max(0, currentEnemyHp - res.stats.totalDamage);
    renderer.playActions(res.actions);
    renderer.setState({ enemy: { name: 'Манекен', sprite: 'dummy', hp: currentEnemyHp, maxHp: 999, armor: 0 } });
    updateBars({ name: 'Манекен', hp: currentEnemyHp, maxHp: 999 });
    el.errorOutput.textContent = `✅ Успешно! Нанесено урона: ${res.stats.totalDamage}, лечение: ${res.stats.totalHeal}`;
    el.runStatus.textContent = '✅ Заклинание сработало';
    return;
  }

  const room = getCurrentRoom();
  const res = runCppCode(code, {
    heroHp: state.heroHp,
    heroMana: state.heroMana,
    enemy: room.enemy,
    enemies: room.enemies || [room.enemy],
    runeCode: room.runeCode ?? 1,
    doorPassword: room.doorPassword ?? 'OPEN',
    bonuses
  });

  el.coutOutput.textContent = res.stdout || '(пусто)';

  if (!res.ok) {
    el.errorOutput.textContent = res.error.formatted;
    el.runStatus.textContent = '❌ Магический сбой';
    return;
  }

  renderer.playActions(res.actions);

  if (res.stats.totalHeal > 0) {
    state.heroHp = Math.min(state.heroMaxHp, state.heroHp + res.stats.totalHeal);
  }

  const validation = room.validate(res);
  if (validation.passed) {
    currentEnemyHp = 0;
    roomCleared = true;
    if (!state.clearedRooms.includes(room.id)) {
      state.clearedRooms.push(room.id);
    }

    const floor = getCurrentFloor();
    if (state.currentRoom === floor.rooms.length - 1 && state.unlockedFloor < floor.id + 1 && floor.id < FLOORS.length) {
      state.unlockedFloor = floor.id + 1;
    }
    saveState();

    renderer.setState({
      roomCleared: true,
      enemy: { ...room.enemy, hp: 0 }
    });
    updateBars({ ...room.enemy, hp: 0 });

    el.errorOutput.textContent = `✅ ${validation.message}`;
    el.runStatus.textContent = '🏆 Комната пройдена!';
    el.roomActions.classList.remove('hidden');

    // Предлагаем выбрать 1 из 3 карточек-бонусов
    setTimeout(() => showRewardModal(), 650);
  } else {
    // Враг отвечает ударом, если задание не выполнено
    const enemyDmg = res.stats.shieldActive ? Math.max(0, (room.enemy.atk || 0) - 15) : (room.enemy.atk || 0);
    state.heroHp = Math.max(10, state.heroHp - enemyDmg);
    currentEnemyHp = Math.max(1, room.enemy.hp - res.stats.totalDamage);
    saveState();

    renderer.setState({ enemy: { ...room.enemy, hp: currentEnemyHp } });
    updateBars({ ...room.enemy, hp: currentEnemyHp });
    el.errorOutput.textContent = `⚠️ ${validation.message}` + (enemyDmg > 0 ? `\nВраг контратаковал на -${enemyDmg} HP!` : '');
    el.runStatus.textContent = '⚠️ Попробуй доработать код';
  }
}

function showRewardModal() {
  const choices = pickRewardChoices(state.deckIds, 3);
  el.rewardChoices.innerHTML = '';
  for (const card of choices) {
    const div = document.createElement('div');
    div.className = `rpg-card rarity-${card.rarity}`;
    div.innerHTML = `
      <div class="rpg-card-title">${card.icon} ${card.title}</div>
      <div class="rpg-card-desc">${card.desc}</div>
    `;
    div.addEventListener('click', () => {
      if (card.instantHeal) {
        state.heroHp = Math.min(state.heroMaxHp, state.heroHp + card.instantHeal);
      }
      if (!state.deckIds.includes(card.id)) {
        state.deckIds.push(card.id);
      }
      saveState();
      renderDeck();
      updateBars({ ...getCurrentRoom().enemy, hp: currentEnemyHp });
      el.rewardModal.classList.add('hidden');
    });
    el.rewardChoices.appendChild(div);
  }
  el.rewardModal.classList.remove('hidden');
}

function goNextRoom() {
  const floor = getCurrentFloor();
  if (state.currentRoom + 1 < floor.rooms.length) {
    state.currentRoom += 1;
  } else if (state.currentFloor < FLOORS.length) {
    state.currentFloor += 1;
    state.currentRoom = 0;
  } else {
    el.errorOutput.textContent = '🎉 Поздравляем! Вы прошли все 6 этажей C++ Dungeon!';
    return;
  }
  saveState();
  loadRoomUI(true);
}

function openFloorsModal() {
  el.floorsList.innerHTML = '';
  for (const f of FLOORS) {
    const locked = f.id > state.unlockedFloor;
    const item = document.createElement('div');
    item.className = `floor-item ${locked ? 'locked' : ''}`;
    item.innerHTML = `
      <div>
        <strong>${f.title}</strong><br/>
        <small style="color:#94a3b8">${f.topic}</small>
      </div>
    `;
    const btn = document.createElement('button');
    btn.className = `pixel-btn tiny ${locked ? 'secondary' : 'primary'}`;
    btn.textContent = locked ? '🔒 Закрыто' : 'Перейти';
    btn.disabled = locked;
    btn.addEventListener('click', () => {
      sandboxMode = false;
      state.currentFloor = f.id;
      state.currentRoom = 0;
      saveState();
      el.floorsModal.classList.add('hidden');
      loadRoomUI(true);
    });
    item.appendChild(btn);
    el.floorsList.appendChild(item);
  }
  el.floorsModal.classList.remove('hidden');
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

// Инициализация событий
el.btnRun.addEventListener('click', handleRun);
el.btnNextRoom.addEventListener('click', goNextRoom);
el.btnResetCode.addEventListener('click', () => loadRoomUI(true));
el.btnSandbox.addEventListener('click', () => {
  sandboxMode = !sandboxMode;
  el.btnSandbox.textContent = sandboxMode ? '⚔️ Вернуться в кампанию' : '🧪 Песочница';
  loadRoomUI(true);
});
el.btnFloors.addEventListener('click', openFloorsModal);
el.btnCloseFloors.addEventListener('click', () => el.floorsModal.classList.add('hidden'));
el.btnResetSave.addEventListener('click', () => {
  if (confirm('Сбросить весь прогресс и начать с 1-го этажа?')) {
    state = defaultSave();
    sandboxMode = false;
    saveState();
    loadRoomUI(true);
  }
});

// Старт приложения
setupTabs();
initEditor();
loadRoomUI(true);
renderer.start();
