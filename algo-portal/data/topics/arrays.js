export const TOPICS = [
  {
    id: 'binary-search',
    title: 'Бинарный поиск (lower_bound)',
    category: 'Поиск и массивы',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'array',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    summary:
      'Бинарный поиск на отсортированном массиве позволяет за логарифмическое время найти первый элемент, который больше либо равен заданному значению target (lower_bound), а также используется для «бинарного поиска по ответу» на монотонных функциях.',
    pitfalls: [
      'Переполнение при вычислении середины: в C++/Java используйте l + (r - l) / 2 вместо (l + r) / 2.',
      'Ошибки на ±1 (off-by-one): чётко фиксируйте инвариант границ [l, r] и начальное значение ans = n.',
      'Неотсортированный массив: алгоритм корректно работает только при монотонности предиката a[i] >= target.'
    ],
    traceCode: [
      'int l = 0, r = n - 1, ans = n;',
      'while (l <= r) {',
      '    int mid = l + (r - l) / 2;',
      '    if (a[mid] >= target) {',
      '        ans = mid;',
      '        r = mid - 1;',
      '    } else {',
      '        l = mid + 1;',
      '    }',
      '}',
      'return ans;'
    ],
    presets: [
      {
        id: 'normal',
        label: 'Обычный случай',
        data: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72], target: 23 }
      },
      {
        id: 'duplicates',
        label: 'Дубликаты',
        data: { array: [1, 4, 4, 4, 7, 9, 12, 15], target: 4 }
      },
      {
        id: 'missing',
        label: 'Элемент отсутствует',
        data: { array: [3, 7, 11, 18, 25, 31], target: 15 }
      }
    ],
    generateFrames({ array, target }) {
      const n = array.length;
      const frames = [];
      let l = 0;
      let r = n - 1;
      let ans = n;

      const snapVars = (mid = '—') => ({
        l,
        r,
        mid,
        ans,
        target
      });

      frames.push({
        array,
        pointers: { L: l, R: r },
        activeRange: [l, r],
        midIndex: null,
        foundIndex: null,
        line: 0,
        vars: snapVars(),
        explanation: `Инициализация: l = 0, r = ${n - 1}, ans = ${n} (если элемент не найдётся, ответ будет за пределами массива).`
      });

      while (l <= r) {
        frames.push({
          array,
          pointers: { L: l, R: r, ans: ans < n ? ans : null },
          activeRange: [l, r],
          midIndex: null,
          foundIndex: null,
          line: 1,
          vars: snapVars(),
          explanation: `Проверяем условие цикла: l (${l}) <= r (${r}) — истина, продолжаем сужать диапазон.`
        });

        const mid = l + Math.floor((r - l) / 2);

        frames.push({
          array,
          pointers: { L: l, R: r, M: mid, ans: ans < n ? ans : null },
          activeRange: [l, r],
          midIndex: mid,
          foundIndex: null,
          line: 2,
          vars: snapVars(mid),
          guess: {
            expected: mid,
            prompt: `Какой индекс станет серединой mid на отрезке [${l}, ${r}]? Кликните по ячейке.`
          },
          explanation: `Вычисляем середину: mid = ${l} + (${r} - ${l}) / 2 = ${mid}. Значение a[${mid}] = ${array[mid]}.`
        });

        frames.push({
          array,
          pointers: { L: l, R: r, M: mid, ans: ans < n ? ans : null },
          activeRange: [l, r],
          midIndex: mid,
          foundIndex: null,
          line: 3,
          vars: snapVars(mid),
          explanation: `Сравниваем a[${mid}] (${array[mid]}) >= target (${target}): ${array[mid] >= target ? 'да' : 'нет'}.`
        });

        if (array[mid] >= target) {
          ans = mid;
          frames.push({
            array,
            pointers: { L: l, R: r, M: mid, ans },
            activeRange: [l, r],
            midIndex: mid,
            foundIndex: null,
            line: 4,
            vars: snapVars(mid),
            explanation: `Так как a[${mid}] >= ${target}, индекс ${mid} подходит. Обновляем ans = ${mid}.`
          });

          r = mid - 1;
          frames.push({
            array,
            pointers: { L: l, R: r >= 0 ? r : null, ans },
            activeRange: l <= r ? [l, r] : null,
            midIndex: null,
            foundIndex: null,
            line: 5,
            vars: snapVars(mid),
            explanation: `Пытаемся найти более левое вхождение: сдвигаем правую границу r = ${mid} - 1 = ${r}.`
          });
        } else {
          l = mid + 1;
          frames.push({
            array,
            pointers: { L: l < n ? l : null, R: r, ans: ans < n ? ans : null },
            activeRange: l <= r ? [l, r] : null,
            midIndex: null,
            foundIndex: null,
            line: 7,
            vars: snapVars(mid),
            explanation: `Так как a[${mid}] (${array[mid]}) < ${target}, отбрасываем левую половину: l = ${mid} + 1 = ${l}.`
          });
        }
      }

      frames.push({
        array,
        pointers: { ans: ans < n ? ans : null },
        activeRange: null,
        midIndex: null,
        foundIndex: ans < n ? ans : null,
        line: 10,
        vars: snapVars(),
        explanation:
          ans < n
            ? `Цикл завершён (l > r). Ответ: ans = ${ans}, a[${ans}] = ${array[ans]} (первый элемент >= ${target}).`
            : `Цикл завершён (l > r). Все элементы меньше ${target}, возвращаем ans = ${n}.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
using namespace std;

// Возвращает минимальный индекс i, такой что a[i] >= target (или n, если такого нет)
int lowerBound(const vector<int>& a, int target) {
    int n = (int)a.size();
    int l = 0, r = n - 1, ans = n;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (a[mid] >= target) {
            ans = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }
    return ans;
}`,
      python: `def lower_bound(a: list[int], target: int) -> int:
    """Возвращает минимальный индекс i, такой что a[i] >= target (или len(a))."""
    n = len(a)
    l, r, ans = 0, n - 1, n
    while l <= r:
        mid = l + (r - l) // 2
        if a[mid] >= target:
            ans = mid
            r = mid - 1
        else:
            l = mid + 1
    return ans`
    },
    problems: [
      {
        title: 'CF EDU: Binary Search (Step 1A)',
        platform: 'Codeforces',
        difficulty: 'Easy',
        url: 'https://codeforces.com/edu/course/2/lesson/6/1/practice'
      },
      {
        title: 'CSES: Factory Machines',
        platform: 'CSES',
        difficulty: 'Medium',
        url: 'https://cses.fi/problemset/task/1620'
      },
      {
        title: 'ACMP #1182: Двоичный поиск',
        platform: 'ACMP',
        difficulty: 'Easy',
        url: 'https://acmp.ru/asp/do/index.asp?main=task&id_course=1&id_section=7&id_topic=119&id_problem=733'
      }
    ],
    quiz: {
      snippet: `int l = 0, r = n;
while (r - l > 1) {
    int m = l + (r - l) / 2;
    if (check(m)) l = m;
    else r = m;
}`,
      question: 'Какова временная сложность приведённого фрагмента, если check(m) работает за O(log N)?',
      options: ['O(log N)', 'O(log² N)', 'O(N log N)', 'O(N)'],
      answer: 'O(log² N)',
      explanation: 'Цикл делает O(log N) итераций, на каждой из которых вызывается check(m) за O(log N). Итого O(log² N).'
    }
  ,
    fillBlanks: [
      {
        "title": "Сдвиг границ в lower_bound (C++)",
        "lang": "cpp",
        "lines": [
          "int l = 0, r = n - 1, ans = n;",
          "while (l <= r) {",
          {
            "blankId": "mid",
            "indent": "    ",
            "placeholder": "вычислите mid без переполнения",
            "hint": "int mid = l + (r - l) / 2;",
            "answers": [
              "int mid = l + (r - l) / 2;",
              "int mid = (l + r) / 2;",
              "int m = l + (r - l) / 2;",
              "int m = (l + r) / 2;"
            ]
          },
          "    if (a[mid] >= target) {",
          "        ans = mid;",
          {
            "blankId": "right",
            "indent": "        ",
            "placeholder": "сузьте правую границу",
            "hint": "r = mid - 1;",
            "answers": [
              "r = mid - 1;",
              "r = m - 1;"
            ]
          },
          "    } else {",
          {
            "blankId": "left",
            "indent": "        ",
            "placeholder": "сузьте левую границу",
            "hint": "l = mid + 1;",
            "answers": [
              "l = mid + 1;",
              "l = m + 1;"
            ]
          },
          "    }",
          "}"
        ]
      }
    ]
  },
  {
    id: 'two-pointers',
    title: 'Метод двух указателей',
    category: 'Поиск и массивы',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'array',
    customInputType: 'array-target',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    summary:
      'Техника поддержания двух индексов L и R, которые монотонно двигаются в одном направлении по массиву. На массиве неотрицательных чисел позволяет за линейное время найти подотрезок с заданной суммой target.',
    pitfalls: [
      'Монотонность работает только при неотрицательных элементах (если есть отрицательные числа, при расширении окна сумма может уменьшаться — нужен map + префиксные суммы).',
      'Следите, чтобы указатель L не обгонял R, либо корректно сбрасывайте окно при L > R.',
      'Сумму подотрезка храните в long long / int64, если элементы массива до 10^9.'
    ],
    traceCode: [
      'int l = 0; long long sum = 0;',
      'for (int r = 0; r < n; ++r) {',
      '    sum += a[r];',
      '    while (sum > target && l <= r) {',
      '        sum -= a[l];',
      '        l++;',
      '    }',
      '    if (sum == target) return {l, r};',
      '}',
      'return {-1, -1};'
    ],
    presets: [
      {
        id: 'normal',
        label: 'Обычный случай',
        data: { array: [1, 3, 2, 5, 1, 1, 2, 3], target: 8 }
      },
      {
        id: 'single',
        label: 'Один элемент',
        data: { array: [4, 2, 7, 1, 3], target: 7 }
      },
      {
        id: 'missing',
        label: 'Подотрезок не найден',
        data: { array: [2, 4, 6, 8], target: 5 }
      }
    ],
    generateFrames({ array, target }) {
      const n = array.length;
      const frames = [];
      let l = 0;
      let sum = 0;

      frames.push({
        array,
        pointers: { L: 0 },
        activeRange: null,
        midIndex: null,
        foundIndex: null,
        line: 0,
        vars: { l, r: '—', sum, target },
        explanation: `Инициализация: левая граница окна l = 0, текущая сумма sum = 0.`
      });

      for (let r = 0; r < n; r++) {
        sum += array[r];
        frames.push({
          array,
          pointers: { L: l, R: r },
          activeRange: [l, r],
          midIndex: r,
          foundIndex: null,
          line: 2,
          vars: { l, r, sum, target },
          guess: {
            expected: r,
            prompt: `На какой индекс сдвинется правый указатель R на следующем шаге? Кликните по ячейке.`
          },
          explanation: `Расширяем окно вправо: r = ${r}, прибавляем a[${r}] = ${array[r]}. Теперь sum = ${sum}.`
        });

        while (sum > target && l <= r) {
          sum -= array[l];
          l++;
          frames.push({
            array,
            pointers: { L: l <= r ? l : null, R: r },
            activeRange: l <= r ? [l, r] : null,
            midIndex: null,
            foundIndex: null,
            line: 5,
            vars: { l, r, sum, target },
            explanation: `Сумма превышала target (${target}), сдвигаем левую границу: l = ${l}, новая sum = ${sum}.`
          });
        }

        if (sum === target) {
          frames.push({
            array,
            pointers: { L: l, R: r, ans: l },
            activeRange: [l, r],
            midIndex: null,
            foundIndex: r,
            line: 7,
            vars: { l, r, sum, target },
            explanation: `Найдено окно [${l}, ${r}] с суммой ${sum} == target (${target})!`
          });
          return frames;
        }
      }

      frames.push({
        array,
        pointers: {},
        activeRange: null,
        midIndex: null,
        foundIndex: null,
        line: 9,
        vars: { l, r: n, sum, target },
        explanation: `Проход завершён. Подотрезок с суммой ${target} не найден.`
      });
      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <utility>
using namespace std;

// Находит границы [l, r] подотрезка с суммой target (массив a[i] >= 0)
pair<int, int> findSubarraySum(const vector<int>& a, long long target) {
    int l = 0;
    long long sum = 0;
    for (int r = 0; r < (int)a.size(); ++r) {
        sum += a[r];
        while (sum > target && l <= r) {
            sum -= a[l];
            ++l;
        }
        if (sum == target) return {l, r};
    }
    return {-1, -1};
}`,
      python: `def find_subarray_sum(a: list[int], target: int) -> tuple[int, int]:
    """Находит границы (l, r) подотрезка с суммой target для a[i] >= 0."""
    l = 0
    cur_sum = 0
    for r, val in enumerate(a):
        cur_sum += val
        while cur_sum > target and l <= r:
            cur_sum -= a[l]
            l += 1
        if cur_sum == target:
            return (l, r)
    return (-1, -1)`
    },
    problems: [
      {
        title: 'CF EDU: Segment with Small Sum',
        platform: 'Codeforces',
        difficulty: 'Easy',
        url: 'https://codeforces.com/edu/course/2/lesson/9/2/practice/contest/307093/problem/A'
      },
      {
        title: 'CSES: Subarray Sums I',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1660'
      },
      {
        title: 'CSES: Sum of Two Values',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1640'
      }
    ],
    quiz: {
      snippet: `int l = 0;
for (int r = 0; r < n; ++r) {
    add(a[r]);
    while (!good()) {
        remove(a[l]);
        l++;
    }
}`,
      question: 'Почему вложенный цикл while не делает алгоритм квадратичным O(N²)?',
      options: ['Оба указателя L и R суммарно делают ≤ 2N шагов', 'Цикл while выполняется не более log N раз', 'Удаление происходит за O(1/N)', 'Массив автоматически сжимается'],
      answer: 'Оба указателя L и R суммарно делают ≤ 2N шагов',
      explanation: 'Указатель l только увеличивается и никогда не превышает n, поэтому тело while выполнится не более n раз за весь алгоритм.'
    }
  ,
    fillBlanks: [
      {
        "title": "Сжатие окна при превышении суммы (Python)",
        "lang": "python",
        "lines": [
          "l = 0; cur_sum = 0",
          "for r, val in enumerate(a):",
          "    cur_sum += val",
          "    while cur_sum > target and l <= r:",
          {
            "blankId": "sub",
            "indent": "        ",
            "placeholder": "удалите левый элемент из cur_sum",
            "hint": "cur_sum -= a[l]",
            "answers": [
              "cur_sum -= a[l]",
              "cur_sum = cur_sum - a[l]"
            ]
          },
          {
            "blankId": "inc",
            "indent": "        ",
            "placeholder": "сдвиньте левый указатель",
            "hint": "l += 1",
            "answers": [
              "l += 1",
              "l = l + 1"
            ]
          },
          "    if cur_sum == target: return (l, r)"
        ]
      }
    ]
  },
  {
    id: 'sorting-prefix',
    title: 'Сортировки и префиксные суммы',
    category: 'Поиск и массивы',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'array',
    customInputType: 'array-range',
    timeComplexity: 'O(N log N + Q)',
    spaceComplexity: 'O(N)',
    summary:
      'Сортировка упорядочивает элементы массива, а массив префиксных сумм pref[i] = a[0] + ... + a[i-1] позволяет отвечать на любой запрос суммы на отрезке [l, r] за O(1) по формуле pref[r + 1] - pref[l].',
    pitfalls: [
      'Смещение на 1: используйте массив pref размера N + 1 с pref[0] = 0, чтобы не проверять отдельно случай l == 0.',
      'Переполнение типа int: сумма нескольких элементов легко превышает 2·10^9 — используйте long long для pref.',
      'Префиксные суммы подходят только для статического массива (без изменений элементов между запросами).'
    ],
    traceCode: [
      'sort(a.begin(), a.end());',
      'vector<long long> pref(n + 1, 0);',
      'for (int i = 0; i < n; ++i)',
      '    pref[i + 1] = pref[i] + a[i];',
      '// Ответ на запрос суммы на [l, r]:',
      'long long ans = pref[r + 1] - pref[l];'
    ],
    presets: [
      {
        id: 'normal',
        label: 'Обычный случай',
        data: { array: [5, 2, 8, 1, 4], queryL: 1, queryR: 3 }
      },
      {
        id: 'full',
        label: 'Весь массив',
        data: { array: [7, 3, 9, 2], queryL: 0, queryR: 3 }
      },
      {
        id: 'single',
        label: 'Отрезок длины 1',
        data: { array: [10, 4, 6, 1, 8], queryL: 2, queryR: 2 }
      }
    ],
    generateFrames({ array, queryL, queryR }) {
      const a = [...array];
      const n = a.length;
      const frames = [];

      frames.push({
        array: [...a],
        pointers: {},
        activeRange: null,
        midIndex: null,
        foundIndex: null,
        line: 0,
        vars: { этап: 'Исходный массив', query: `[${queryL}, ${queryR}]` },
        explanation: `Исходный массив: [${a.join(', ')}]. Начинаем упорядочивание элементов.`
      });

      // Пошаговая сортировка вставками для наглядности
      for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0 && a[j - 1] > a[j]) {
          [a[j - 1], a[j]] = [a[j], a[j - 1]];
          frames.push({
            array: [...a],
            pointers: { i: j - 1, j },
            activeRange: [0, i],
            midIndex: j - 1,
            foundIndex: null,
            line: 0,
            vars: { этап: 'Сортировка', swap: `(${j - 1}, ${j})` },
            explanation: `Меняем местами элементы на позициях ${j - 1} и ${j}: [${a.join(', ')}].`
          });
          j--;
        }
      }

      const pref = new Array(n + 1).fill(0);
      frames.push({
        array: [...a],
        pointers: {},
        activeRange: null,
        midIndex: null,
        foundIndex: null,
        line: 1,
        vars: { этап: 'Префиксы', pref: `[${pref.join(', ')}]` },
        explanation: `Массив отсортирован! Создаём массив префиксных сумм pref размера ${n + 1} с pref[0] = 0.`
      });

      for (let i = 0; i < n; i++) {
        pref[i + 1] = pref[i] + a[i];
        frames.push({
          array: [...a],
          pointers: { i },
          activeRange: [0, i],
          midIndex: i,
          foundIndex: null,
          line: 3,
          vars: {
            i,
            'a[i]': a[i],
            [`pref[${i + 1}]`]: pref[i + 1],
            pref: `[${pref.join(', ')}]`
          },
          guess: {
            expected: i,
            prompt: `Какой элемент массива a[i] добавляется к префиксной сумме на этом шаге? Кликните по ячейке.`
          },
          explanation: `pref[${i + 1}] = pref[${i}] (${pref[i]}) + a[${i}] (${a[i]}) = ${pref[i + 1]}.`
        });
      }

      const ans = pref[queryR + 1] - pref[queryL];
      frames.push({
        array: [...a],
        pointers: { L: queryL, R: queryR },
        activeRange: [queryL, queryR],
        midIndex: null,
        foundIndex: queryR,
        line: 5,
        vars: {
          l: queryL,
          r: queryR,
          [`pref[${queryR + 1}]`]: pref[queryR + 1],
          [`pref[${queryL}]`]: pref[queryL],
          ans
        },
        explanation: `Ответ на запрос [${queryL}, ${queryR}]: pref[${queryR + 1}] (${pref[queryR + 1]}) - pref[${queryL}] (${pref[queryL]}) = ${ans}.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

// Сортировка + ответы на запросы суммы на [l, r] за O(1)
vector<long long> buildPrefix(vector<int>& a) {
    sort(a.begin(), a.end());
    int n = (int)a.size();
    vector<long long> pref(n + 1, 0);
    for (int i = 0; i < n; ++i) {
        pref[i + 1] = pref[i] + a[i];
    }
    return pref;
}

long long rangeSum(const vector<long long>& pref, int l, int r) {
    return pref[r + 1] - pref[l];
}`,
      python: `def build_prefix(a: list[int]) -> list[int]:
    """Сортирует массив и строит массив префиксных сумм размера len(a) + 1."""
    a.sort()
    pref = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        pref[i + 1] = pref[i] + x
    return pref

def range_sum(pref: list[int], l: int, r: int) -> int:
    return pref[r + 1] - pref[l]`
    },
    problems: [
      {
        title: 'CSES: Static Range Sum Queries',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1646'
      },
      {
        title: 'CF #433B: Kuriyama Mirai\'s Stones',
        platform: 'Codeforces',
        difficulty: 'Easy',
        url: 'https://codeforces.com/problemset/problem/433/B'
      },
      {
        title: 'ACMP #1215: Префиксные суммы',
        platform: 'ACMP',
        difficulty: 'Easy',
        url: 'https://acmp.ru/asp/do/index.asp?main=task&id_course=1&id_section=5&id_topic=112&id_problem=686'
      }
    ],
    quiz: {
      snippet: `// Построение pref[n + 1] за O(N), затем Q запросов:
for (int q = 0; q < Q; ++q) {
    int l, r; cin >> l >> r;
    cout << pref[r + 1] - pref[l] << '\\n';
}`,
      question: 'Какова итоговая временная сложность построения префиксных сумм и обработки Q запросов?',
      options: ['O(N + Q)', 'O(N · Q)', 'O(Q log N)', 'O(N log N)'],
      answer: 'O(N + Q)',
      explanation: 'Массив pref строится за O(N), а каждый из Q запросов вычисляется разностью двух чисел за O(1).'
    }
  ,
    fillBlanks: [
      {
        "title": "Построение pref и запрос суммы на [l, r] (C++)",
        "lang": "cpp",
        "lines": [
          "vector<long long> pref(n + 1, 0);",
          "for (int i = 0; i < n; ++i)",
          {
            "blankId": "build",
            "indent": "    ",
            "placeholder": "формула префиксной суммы pref[i + 1]",
            "hint": "pref[i + 1] = pref[i] + a[i];",
            "answers": [
              "pref[i + 1] = pref[i] + a[i];",
              "pref[i + 1] = a[i] + pref[i];"
            ]
          },
          "// Запрос суммы на отрезке [l, r]:",
          {
            "blankId": "query",
            "indent": "",
            "placeholder": "верните сумму на [l, r]",
            "hint": "return pref[r + 1] - pref[l];",
            "answers": [
              "return pref[r + 1] - pref[l];",
              "long long ans = pref[r + 1] - pref[l];"
            ]
          }
        ]
      }
    ]
  }
];
