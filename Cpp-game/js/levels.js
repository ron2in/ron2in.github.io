/**
 * levels.js
 * Изолированная база данных 6 этажей подземелья, комнат, теории (Книга заклинаний),
 * стартовых шаблонов C++ и валидаторов победы.
 * Не содержит никаких обращений к DOM.
 */

export const FLOORS = [
  {
    id: 1,
    title: 'Этаж 1. Склеп Переменных',
    topic: 'Типы данных (int, double, bool, char) и std::cout',
    unlockedCardId: 'scroll_int',
    theory: `
      <h4>📜 Типы данных и вывод</h4>
      <p>В C++ каждая переменная имеет строгий тип:</p>
      <ul>
        <li><code>int</code> — целые числа (например, <code>int dmg = 25;</code>)</li>
        <li><code>double</code> — дробные числа (например, <code>double mult = 1.5;</code>)</li>
        <li><code>bool</code> — логика (<code>true</code> или <code>false</code>)</li>
        <li><code>char</code> — одиночный символ (<code>'A'</code>)</li>
      </ul>
      <p>Для вывода в консоль используй <code>cout &lt;&lt; "Текст" &lt;&lt; dmg &lt;&lt; endl;</code>, а для удара в игре — <code>attack(dmg);</code>.</p>
    `,
    rooms: [
      {
        id: 'f1_r1',
        type: 'battle',
        title: 'Страж Склепа: Зелёный Слайм',
        enemy: { name: 'Зелёный Слайм', sprite: 'slime', hp: 25, maxHp: 25, armor: 0, atk: 8 },
        goal: 'Объяви переменные и нанеси Слайму не менее 25 урона с помощью attack(dmg), а также выведи урон через cout.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int base = 15;
    int bonus = 12;
    int dmg = base + bonus;

    // Вызови attack(dmg) и выведи результат в cout
    attack(dmg);
    cout << "Uron: " << dmg << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 25) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} урона, а нужно минимум 25!` };
          }
          return { passed: true, message: 'Слайм повержен! Ты освоил int и арифметику.' };
        }
      },
      {
        id: 'f1_r2',
        type: 'chest',
        title: 'Сундук Алхимика',
        enemy: { name: 'Сундук Алхимика', sprite: 'chest', hp: 1, maxHp: 1, armor: 0, atk: 0 },
        goal: 'Используй double и bool: рассчитай зелье (int hp = 15 * 2;) и восстанови здоровье через heal(hp), выведя "OK" в cout.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    double ratio = 1.5;
    int base = 20;
    bool ready = true;

    if (ready) {
        int potion = base * ratio;
        heal(potion);
        cout << "OK: " << potion << endl;
    }
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalHeal < 20) {
            return { passed: false, message: 'Нужно восстановить хотя бы 20 HP с помощью heal().' };
          }
          return { passed: true, message: 'Сундук открыт! Мана и здоровье пополнены.' };
        }
      },
      {
        id: 'f1_r3',
        type: 'boss',
        title: 'Босс Этажа: Король Слаймов',
        enemy: { name: 'Король Слаймов', sprite: 'slime_boss', hp: 60, maxHp: 60, armor: 0, atk: 14 },
        goal: 'Победи Короля Слаймов (60 HP), рассчитав итоговый урон с помощью переменных int и double.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int sword = 30;
    int rune = 35;
    int total = sword + rune;

    attack(total);
    cout << "Boss hit: " << total << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 60) {
            return { passed: false, message: `Боссу нанесено ${result.stats.totalDamage} урона из 60!` };
          }
          return { passed: true, message: 'Король Слаймов повержен! Лестница на 2-й этаж открыта!' };
        }
      }
    ]
  },

  {
    id: 2,
    title: 'Этаж 2. Лабиринт Развилок',
    topic: 'Условия (if / else, switch, &&, ||)',
    unlockedCardId: 'rune_if',
    theory: `
      <h4>⚖️ Ветвления if/else и switch</h4>
      <p>Некоторые враги носят тяжелую броню! Обычная <code>attack(dmg)</code> теряет урон об броню, а <code>pierceAttack(dmg)</code> игнорирует её.</p>
      <pre>if (getEnemyArmor() > 10) {
    pierceAttack(35);
} else {
    attack(35);
}</pre>
      <p>Для выбора из нескольких точных вариантов удобно использовать <code>switch (getRuneCode()) { case 1: ... break; }</code>.</p>
    `,
    rooms: [
      {
        id: 'f2_r1',
        type: 'battle',
        title: 'Бронированный Скелет',
        enemy: { name: 'Бронированный Скелет', sprite: 'skeleton', hp: 35, maxHp: 35, armor: 20, atk: 12 },
        goal: 'У Скелета броня 20! Используй if (getEnemyArmor() > 10), чтобы применить pierceAttack(35) вместо обычной атаки.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int armor = getEnemyArmor();
    if (armor > 10) {
        pierceAttack(35);
    } else {
        attack(35);
    }
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.pierceCount === 0 || result.stats.totalDamage < 35) {
            return { passed: false, message: 'Используй pierceAttack(35) внутри условия if, чтобы пробить броню!' };
          }
          return { passed: true, message: 'Броня Скелета пробита!' };
        }
      },
      {
        id: 'f2_r2',
        type: 'chest',
        title: 'Рунический Переключатель',
        enemy: { name: 'Рунический Алтарь', sprite: 'chest', hp: 1, maxHp: 1, armor: 0, atk: 0 },
        runeCode: 2,
        doorPassword: 'SOLVE',
        goal: 'Используй switch(getRuneCode()): если код равен 2, вызови unlockDoor("SOLVE") и heal(15).',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int code = getRuneCode();
    switch (code) {
        case 1:
            cout << "Wrong rune" << endl;
            break;
        case 2:
            unlockDoor("SOLVE");
            heal(15);
            break;
        default:
            cout << "Unknown" << endl;
    }
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (!result.stats.doorUnlocked) {
            return { passed: false, message: 'Вызови unlockDoor("SOLVE") в ветке case 2!' };
          }
          return { passed: true, message: 'Рунический замок щёлкнул и открылся!' };
        }
      },
      {
        id: 'f2_r3',
        type: 'boss',
        title: 'Босс Этажа: Рыцарь Склепа',
        enemy: { name: 'Рыцарь Склепа', sprite: 'skeleton_boss', hp: 70, maxHp: 70, armor: 25, atk: 18 },
        goal: 'У Рыцаря 70 HP и 25 брони. Проверь броню и здоровье: поставь щит castShield() и нанеси 70+ пробивающего урона.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    if (getHeroHp() <= 100 && getEnemyArmor() > 15) {
        castShield();
        pierceAttack(75);
    }
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (!result.stats.shieldActive) {
            return { passed: false, message: 'Не забудь активировать защиту castShield()!' };
          }
          if (result.stats.totalDamage < 70) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} урона из 70!` };
          }
          return { passed: true, message: 'Рыцарь Склепа пал! Путь на 3-й этаж свободен.' };
        }
      }
    ]
  },

  {
    id: 3,
    title: 'Этаж 3. Катакомбы Бесконечности',
    topic: 'Циклы (for, while, break, continue)',
    unlockedCardId: 'loop_for',
    theory: `
      <h4>🔄 Циклы for и while</h4>
      <p>Когда врагов много или у босса огромный запас HP, используй циклы:</p>
      <pre>for (int i = 0; i &lt; 5; i++) {
    attack(20); // 5 ударов по 20 = 100!
}</pre>
      <p><code>continue</code> пропускает шаг цикла, а <code>break</code> досрочно выходит из него.</p>
    `,
    rooms: [
      {
        id: 'f3_r1',
        type: 'battle',
        title: 'Орда Слаймов',
        enemy: { name: 'Орда Слаймов', sprite: 'slime', hp: 100, maxHp: 100, armor: 0, atk: 14 },
        goal: 'Используй цикл for, чтобы нанести серию ударов общей силой не менее 100 урона (например, 5 ударов по 20).',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    for (int i = 0; i < 5; i++) {
        attack(20);
        cout << "Hit #" << i + 1 << endl;
    }
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.attackCount < 2) {
            return { passed: false, message: 'Сделай серию атак в цикле (минимум 2 вызова attack).' };
          }
          if (result.stats.totalDamage < 100) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} из 100 урона!` };
          }
          return { passed: true, message: 'Орда слаймов рассеяна!' };
        }
      },
      {
        id: 'f3_r2',
        type: 'chest',
        title: 'Кристалл Энергии',
        enemy: { name: 'Кристалл Энергии', sprite: 'chest', hp: 1, maxHp: 1, armor: 0, atk: 0 },
        goal: 'Используй цикл while с break/continue: заряди лечение так, чтобы итоговый heal() был >= 30.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int charge = 0;
    int step = 0;
    while (step < 10) {
        step++;
        if (step % 2 == 0) continue;
        charge += 10;
        if (charge >= 30) break;
    }
    heal(charge);
    cout << "Charged: " << charge << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalHeal < 30) {
            return { passed: false, message: 'Заряди кристалл минимум на 30 единиц лечения.' };
          }
          return { passed: true, message: 'Кристалл заряжен! Энергия переполняет тебя.' };
        }
      },
      {
        id: 'f3_r3',
        type: 'boss',
        title: 'Босс Этажа: Некро-Скелет',
        enemy: { name: 'Некро-Скелет', sprite: 'skeleton_boss', hp: 130, maxHp: 130, armor: 10, atk: 20 },
        goal: 'У босса 130 HP и 10 брони. Используй цикл и pierceAttack(), чтобы нанести >= 130 урона.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        pierceAttack(28);
    }
    castShield();
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 130) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} урона из 130!` };
          }
          return { passed: true, message: 'Некро-Скелет рассыпался в прах!' };
        }
      }
    ]
  },

  {
    id: 4,
    title: 'Этаж 4. Залы Массивов и Строк',
    topic: 'Массивы, строки (char[] / string) и поиск минимума',
    unlockedCardId: 'scroll_array',
    theory: `
      <h4>📦 Массивы и строки</h4>
      <p>В этой комнате несколько врагов! Используй <code>getEnemyCount()</code> и <code>getEnemyHpAt(i)</code>, чтобы найти самого слабого врага (поиск минимума).</p>
      <p>Для строк можно использовать <code>char key[] = "OPEN";</code> или <code>string key = "OPEN";</code> и передавать в <code>unlockDoor(key)</code>.</p>
    `,
    rooms: [
      {
        id: 'f4_r1',
        type: 'battle',
        title: 'Отряд Големов (Поиск минимума)',
        enemies: [
          { name: 'Голем #0', sprite: 'golem', hp: 45, maxHp: 45, armor: 0, atk: 12 },
          { name: 'Слабый Голем #1', sprite: 'golem', hp: 18, maxHp: 18, armor: 0, atk: 10 },
          { name: 'Голем #2', sprite: 'golem', hp: 60, maxHp: 60, armor: 0, atk: 15 }
        ],
        enemy: { name: 'Отряд Големов', sprite: 'golem', hp: 18, maxHp: 60, armor: 0, atk: 15 },
        goal: 'Найди индекс самого слабого врага (с минимальным HP), выбери его через targetEnemy(minIdx) и атакуй (>= 18 урона).',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int n = getEnemyCount();
    int minIdx = 0;
    for (int i = 1; i < n; i++) {
        if (getEnemyHpAt(i) < getEnemyHpAt(minIdx)) {
            minIdx = i;
        }
    }
    targetEnemy(minIdx);
    attack(getEnemyHpAt(minIdx));
    cout << "Target weakest #" << minIdx << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.targetIndex !== 1) {
            return { passed: false, message: 'Самый слабый враг имеет индекс 1 (18 HP). Вызови targetEnemy(minIdx)!' };
          }
          if (result.stats.totalDamage < 18) {
            return { passed: false, message: 'Нанеси минимум 18 урона выбранному врагу.' };
          }
          return { passed: true, message: 'Точный удар в слабое звено! Отряд дрогнул.' };
        }
      },
      {
        id: 'f4_r2',
        type: 'chest',
        title: 'Рунический Замок',
        enemy: { name: 'Рунический Замок', sprite: 'chest', hp: 1, maxHp: 1, armor: 0, atk: 0 },
        doorPassword: 'CPP',
        goal: 'Сформируй строку "CPP" (через char[] или string) и передай её в unlockDoor(key).',
        starterCode: `#include <iostream>
#include <cstring>
#include <dungeon>
using namespace std;

int main() {
    char key[] = "CPP";
    unlockDoor(key);
    cout << "Key len: " << strlen(key) << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (!result.stats.doorUnlocked) {
            return { passed: false, message: 'Пароль неверный! Передай строку "CPP" в unlockDoor().' };
          }
          return { passed: true, message: 'Древний замок взломан!' };
        }
      },
      {
        id: 'f4_r3',
        type: 'boss',
        title: 'Босс Этажа: Каменный Голем',
        enemy: { name: 'Каменный Голем', sprite: 'golem', hp: 150, maxHp: 150, armor: 15, atk: 22 },
        goal: 'Сложи массив рун {40, 50, 65} в цикле и нанеси суммарный пробивающий урон Голему (150 HP).',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int runes[3] = {40, 50, 65};
    int sum = 0;
    for (int i = 0; i < 3; i++) {
        sum += runes[i];
    }
    pierceAttack(sum);
    cout << "Total rune dmg: " << sum << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 150) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} из 150 урона!` };
          }
          return { passed: true, message: 'Каменный Голем разрушен! Впереди Башня Указателей.' };
        }
      }
    ]
  },

  {
    id: 5,
    title: 'Этаж 5. Башня Ссылок и Указателей',
    topic: 'Указатели (*ptr, &x) и передача по ссылке (int&)',
    unlockedCardId: 'rune_ptr',
    theory: `
      <h4>🎯 Указатели и Ссылки</h4>
      <p>Указатель хранит адрес переменной в памяти:</p>
      <pre>int dmg = 20;
int* ptr = &amp;dmg;
*ptr = 80; // меняем dmg напрямую!</pre>
      <p>А передача по ссылке <code>void buff(int&amp; x)</code> позволяет функции изменять внешнюю переменную без копирования.</p>
    `,
    rooms: [
      {
        id: 'f5_r1',
        type: 'battle',
        title: 'Страж Адресов',
        enemy: { name: 'Баг-Страж', sprite: 'demon', hp: 80, maxHp: 80, armor: 10, atk: 18 },
        goal: 'Создай указатель int* ptr = &dmg, измени значение по указателю на >= 80 и нанеси пробивающий удар.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

int main() {
    int dmg = 10;
    int* ptr = &dmg;
    *ptr = 85;
    pierceAttack(dmg);
    cout << "Ptr dmg: " << *ptr << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 80) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} из 80 урона!` };
          }
          return { passed: true, message: 'Указатель сработал безупречно!' };
        }
      },
      {
        id: 'f5_r2',
        type: 'chest',
        title: 'Алтарь Ссылок',
        enemy: { name: 'Алтарь Ссылок', sprite: 'chest', hp: 1, maxHp: 1, armor: 0, atk: 0 },
        goal: 'Напиши функцию void empower(int& hp), которая увеличивает hp по ссылке минимум до 40, и вызови heal(hp).',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

void empower(int& hp) {
    hp += 30;
}

int main() {
    int myHeal = 15;
    empower(myHeal);
    heal(myHeal);
    cout << "Heal: " << myHeal << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalHeal < 40) {
            return { passed: false, message: 'Итоговое лечение должно быть >= 40 HP.' };
          }
          return { passed: true, message: 'Сила ссылок течёт в твоих венах!' };
        }
      },
      {
        id: 'f5_r3',
        type: 'boss',
        title: 'Босс Этажа: Баг-Демон Памяти',
        enemy: { name: 'Баг-Демон Памяти', sprite: 'demon', hp: 160, maxHp: 160, armor: 20, atk: 24 },
        goal: 'Обменяй значения двух сил через указатели swapPtr(&a, &b) и нанеси Баг-Демону >= 160 урона.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

void swapPtr(int* a, int* b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main() {
    int weak = 20;
    int strong = 170;
    swapPtr(&weak, &strong);
    pierceAttack(weak);
    castShield();
    cout << "Swapped attack: " << weak << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 160) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} из 160 урона!` };
          }
          return { passed: true, message: 'Утечка памяти устранена! Демон повержен!' };
        }
      }
    ]
  },

  {
    id: 6,
    title: 'Этаж 6. Цитадель Архитектора',
    topic: 'ООП: struct, class, конструкторы и методы',
    unlockedCardId: 'blueprint_class',
    theory: `
      <h4>🏛️ Структуры и Классы</h4>
      <p>Объединяй данные и поведение в собственные типы:</p>
      <pre>class Weapon {
public:
    int dmg;
    Weapon(int d) { dmg = d; }
    int strike() { return dmg * 2; }
};</pre>
      <p>Создай объект <code>Weapon w(50);</code> и вызывай его методы <code>w.strike()</code>!</p>
    `,
    rooms: [
      {
        id: 'f6_r1',
        type: 'battle',
        title: 'Страж Чертежей',
        enemy: { name: 'Конструкт', sprite: 'golem', hp: 100, maxHp: 100, armor: 10, atk: 20 },
        goal: 'Создай struct Spell с полями power и mult, вычисли power * mult и нанеси >= 100 урона.',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

struct Spell {
    int power;
    int mult;
};

int main() {
    Spell s;
    s.power = 25;
    s.mult = 4;
    pierceAttack(s.power * s.mult);
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 100) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} из 100 урона!` };
          }
          return { passed: true, message: 'Чертёж структуры воплощён в реальность!' };
        }
      },
      {
        id: 'f6_r2',
        type: 'chest',
        title: 'Кузница Классов',
        enemy: { name: 'Наковальня Архитектора', sprite: 'chest', hp: 1, maxHp: 1, armor: 0, atk: 0 },
        goal: 'Создай class Potion с конструктором и методом getPower(), верни >= 45 и вызови heal().',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

class Potion {
public:
    int base;
    Potion(int b) { base = b; }
    int getPower() { return base + 20; }
};

int main() {
    Potion p(30);
    heal(p.getPower());
    cout << "Potion power: " << p.getPower() << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalHeal < 45) {
            return { passed: false, message: 'Зелье должно лечить минимум на 45 HP!' };
          }
          return { passed: true, message: 'Класс Potion выкован идеально!' };
        }
      },
      {
        id: 'f6_r3',
        type: 'boss',
        title: 'Финальный Босс: Архитектор Бездны',
        enemy: { name: 'Архитектор Бездны', sprite: 'architect', hp: 250, maxHp: 250, armor: 30, atk: 28 },
        goal: 'Создай class TitanWeapon с конструктором и методом combo(int hits), чтобы нанести Архитектору >= 250 урона и поставить щит!',
        starterCode: `#include <iostream>
#include <dungeon>
using namespace std;

class TitanWeapon {
public:
    int dmg;
    TitanWeapon(int d) { dmg = d; }
    int combo(int hits) { return dmg * hits; }
};

int main() {
    TitanWeapon blade(65);
    castShield();
    pierceAttack(blade.combo(4));
    cout << "Final strike: " << blade.combo(4) << endl;
    return 0;
}`,
        validate(result) {
          if (!result.ok) return { passed: false, message: 'Исправь ошибки компиляции!' };
          if (result.stats.totalDamage < 250) {
            return { passed: false, message: `Нанесено ${result.stats.totalDamage} из 250 урона!` };
          }
          return { passed: true, message: 'ПОБЕДА! Архитектор Бездны повержен! Ты прошёл C++ Dungeon!' };
        }
      }
    ]
  }
];

export const SANDBOX_TEMPLATE = `#include <iostream>
#include <dungeon>
using namespace std;

// Режим Песочницы: тренируйся на манекене без ограничений!
int main() {
    int hp = getEnemyHp();
    cout << "HP manekena: " << hp << endl;

    for (int i = 0; i < 3; i++) {
        attack(25);
    }
    castShield();
    heal(10);
    return 0;
}`;
