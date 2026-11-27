/**
 * cards.js
 * Изолированная система рогалик-карточек, свитков C++ и пассивных бонусов.
 * Не содержит никаких обращений к DOM.
 */

export const STARTER_CARDS = [
  {
    id: 'scroll_int',
    title: 'Свиток int',
    category: 'syntax',
    icon: '📜',
    rarity: 'common',
    desc: 'Объявление целочисленной переменной и вывод через std::cout.',
    snippet: 'int dmg = 25;\nattack(dmg);\ncout << "Удар: " << dmg << endl;'
  },
  {
    id: 'rune_if',
    title: 'Руна if/else',
    category: 'syntax',
    icon: '⚖️',
    rarity: 'common',
    desc: 'Ветвление для проверки брони или HP врага.',
    snippet: 'if (getEnemyArmor() > 10) {\n    pierceAttack(30);\n} else {\n    attack(30);\n}'
  },
  {
    id: 'loop_for',
    title: 'Цикл for',
    category: 'syntax',
    icon: '🔄',
    rarity: 'rare',
    desc: 'Серия повторяющихся атак по орде монстров.',
    snippet: 'for (int i = 0; i < 4; i++) {\n    attack(20);\n}'
  },
  {
    id: 'scroll_array',
    title: 'Массив arr[]',
    category: 'syntax',
    icon: '📦',
    rarity: 'rare',
    desc: 'Хранение списка значений и поиск минимума.',
    snippet: 'int n = getEnemyCount();\nint minIdx = 0;\nfor (int i = 1; i < n; i++) {\n    if (getEnemyHpAt(i) < getEnemyHpAt(minIdx)) minIdx = i;\n}\ntargetEnemy(minIdx);\nattack(30);'
  },
  {
    id: 'rune_ptr',
    title: 'Указатель *ptr',
    category: 'syntax',
    icon: '🎯',
    rarity: 'epic',
    desc: 'Прямой доступ к памяти переменной через адрес & и разыменование *.',
    snippet: 'int power = 20;\nint* ptr = &power;\n*ptr = 65;\nattack(power);'
  },
  {
    id: 'blueprint_class',
    title: 'Чертеж class',
    category: 'syntax',
    icon: '🏛️',
    rarity: 'legendary',
    desc: 'Создание собственного типа с полями и методами.',
    snippet: 'class Weapon {\npublic:\n    int dmg;\n    Weapon(int d) { dmg = d; }\n    int strike() { return dmg * 2; }\n};'
  }
];

export const REWARD_POOL = [
  {
    id: 'bonus_loop_dmg',
    title: '+10 к урону атак',
    category: 'passive',
    icon: '⚔️',
    rarity: 'rare',
    desc: 'Каждая ваша attack() и pierceAttack() наносит на 10 урона больше.',
    bonus: { flatDamage: 10 },
    snippet: 'attack(20); // Нанесет 30 с руной силы!'
  },
  {
    id: 'skill_crithit',
    title: 'Навык critHit()',
    category: 'skill',
    icon: '💥',
    rarity: 'epic',
    desc: 'Открывает заклинание critHit(dmg) — наносит двойной урон и пробивает 50% брони.',
    bonus: { flatDamage: 5 },
    snippet: 'critHit(25); // 50+ урона!'
  },
  {
    id: 'potion_hp',
    title: 'Зелье жизни',
    category: 'consumable',
    icon: '🧪',
    rarity: 'common',
    desc: 'Мгновенно восстанавливает +30 HP героя и усиливает heal() на +5.',
    instantHeal: 30,
    bonus: { healBonus: 5 },
    snippet: 'heal(25);'
  },
  {
    id: 'rune_shield',
    title: 'Щит предков',
    category: 'passive',
    icon: '🛡️',
    rarity: 'rare',
    desc: 'Усиливает castShield() на +10 защиты и добавляет +15 макс. маны.',
    bonus: { shieldBonus: 10 },
    snippet: 'castShield();'
  },
  {
    id: 'loop_mastery',
    title: 'Мастер циклов',
    category: 'passive',
    icon: '♾️',
    rarity: 'epic',
    desc: '+8 дополнительного урона к каждой атаке из цикла.',
    bonus: { loopBonus: 8 },
    snippet: 'for (int i = 0; i < 3; i++) {\n    attack(15);\n}'
  },
  {
    id: 'scroll_pierce',
    title: 'Бронебойная руна',
    category: 'skill',
    icon: '🗡️',
    rarity: 'rare',
    desc: 'Усиливает все заклинания на +7 урона.',
    bonus: { flatDamage: 7 },
    snippet: 'pierceAttack(30);'
  }
];

/**
 * Выбирает 3 случайные карточки-награды из пула.
 */
export function pickRewardChoices(ownedIds = [], count = 3) {
  const candidates = REWARD_POOL.filter(c => c.category === 'consumable' || !ownedIds.includes(c.id));
  const pool = candidates.length >= count ? [...candidates] : [...REWARD_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Суммирует все пассивные бонусы колоды игрока.
 */
export function computeDeckBonuses(deckIds = []) {
  const bonuses = {
    flatDamage: 0,
    loopBonus: 0,
    healBonus: 0,
    shieldBonus: 0
  };
  for (const id of deckIds) {
    const card = REWARD_POOL.find(c => c.id === id);
    if (!card || !card.bonus) continue;
    bonuses.flatDamage += card.bonus.flatDamage || 0;
    bonuses.loopBonus += card.bonus.loopBonus || 0;
    bonuses.healBonus += card.bonus.healBonus || 0;
    bonuses.shieldBonus += card.bonus.shieldBonus || 0;
  }
  return bonuses;
}
