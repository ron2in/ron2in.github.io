export const TOPICS = [
  {
    id: 'knapsack',
    title: 'ДП: Задача о рюкзаке (0-1)',
    category: 'Динамическое программирование',
    difficulty: 'Средний',
    isStub: false,
    engine: 'grid',
    customInputType: 'knapsack',
    timeComplexity: 'O(N · W)',
    spaceComplexity: 'O(N · W)',
    summary:
      'Классическая задача динамического программирования: даны N предметов с весами wt[i] и стоимостями val[i], нужно набрать максимальную стоимость при ограничении вместимости рюкзака W (каждый предмет можно взять не более одного раза).',
    pitfalls: [
      'При оптимизации памяти до 1D-массива цикл по весу w обязан идти в обратном порядке (от W до wt[i]), иначе один предмет будет взят многократно.',
      'Для восстановления ответа (какие предметы выбраны) необходима полная 2D-таблица dp[i][w].',
      'Если W слишком велико (например, 10^9), а суммы стоимостей невелики — меняйте состояние местами: dp[cost] = min_weight.'
    ],
    traceCode: [
      'vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));',
      'for (int i = 1; i <= n; ++i) {',
      '    for (int w = 0; w <= W; ++w) {',
      '        dp[i][w] = dp[i - 1][w];',
      '        if (w >= wt[i - 1]) {',
      '            dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);',
      '        }',
      '    }',
      '}',
      '// Восстановление выбранных предметов от dp[n][W]'
    ],
    presets: [
      {
        id: 'classic',
        label: 'Классический (4 предмета, W=5)',
        data: { weights: [2, 3, 4, 5], values: [3, 4, 5, 6], capacity: 5 }
      },
      {
        id: 'tight',
        label: 'Плотная укладка (W=6)',
        data: { weights: [3, 4, 2], values: [4, 5, 3], capacity: 6 }
      },
      {
        id: 'zero',
        label: 'Крайний случай: ничего не влезает',
        data: { weights: [4, 5], values: [10, 12], capacity: 3 }
      }
    ],
    generateFrames({ weights, values, capacity }) {
      const n = weights.length;
      const W = capacity;
      const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
      const rowHeaders = ['0', ...weights.map((wt, idx) => `#${idx + 1} (${wt}кг,${values[idx]})`)];
      const colHeaders = Array.from({ length: W + 1 }, (_, w) => String(w));

      const cloneGrid = () => dp.map((row) => [...row]);
      const frames = [];

      frames.push({
        grid: cloneGrid(),
        rowHeaders,
        colHeaders,
        currentCell: null,
        depCells: [],
        pathCells: [],
        arrows: [],
        line: 0,
        vars: { n, W, maxVal: 0 },
        explanation: `Инициализируем таблицу dp[${n + 1}][${W + 1}] нулями (0 предметов — стоимость 0).`
      });

      for (let i = 1; i <= n; i++) {
        const wt = weights[i - 1];
        const val = values[i - 1];

        for (let w = 0; w <= W; w++) {
          const deps = [[i - 1, w]];
          const arrows = [{ from: [i - 1, w], to: [i, w] }];

          dp[i][w] = dp[i - 1][w];
          let exp = `Ячейка dp[${i}][${w}]: не берём предмет #${i} → ${dp[i - 1][w]}.`;

          if (w >= wt) {
            const takeVal = dp[i - 1][w - wt] + val;
            deps.push([i - 1, w - wt]);
            arrows.push({ from: [i - 1, w - wt], to: [i, w] });

            if (takeVal > dp[i][w]) {
              dp[i][w] = takeVal;
              exp = `Ячейка dp[${i}][${w}]: выгоднее взять предмет #${i} (вес ${wt}, цена ${val}): dp[${i - 1}][${w - wt}] (${dp[i - 1][w - wt]}) + ${val} = ${takeVal}.`;
            } else {
              exp = `Ячейка dp[${i}][${w}]: вариант взять предмет #${i} (${takeVal}) не лучше, чем не брать (${dp[i][w]}).`;
            }
          }

          frames.push({
            grid: cloneGrid(),
            rowHeaders,
            colHeaders,
            currentCell: [i, w],
            depCells: deps,
            pathCells: [],
            arrows,
            line: w >= wt ? 5 : 3,
            vars: { i, w, wt, val, [`dp[${i}][${w}]`]: dp[i][w] },
            guess:
              w === W
                ? {
                    expected: `${i},${w}`,
                    prompt: `Кликните по ячейке dp[${i}][${w}], которая вычисляется для полной вместимости W=${W}.`
                  }
                : undefined,
            explanation: exp
          });
        }
      }

      // Восстановление ответа
      const chosen = [];
      const pathCells = [[n, W]];
      let curW = W;
      for (let i = n; i >= 1; i--) {
        if (dp[i][curW] !== dp[i - 1][curW]) {
          chosen.push(i);
          curW -= weights[i - 1];
        }
        pathCells.push([i - 1, curW]);
      }
      chosen.reverse();

      frames.push({
        grid: cloneGrid(),
        rowHeaders,
        colHeaders,
        currentCell: [n, W],
        depCells: [],
        pathCells,
        arrows: [],
        line: 9,
        vars: {
          maxCost: dp[n][W],
          items: chosen.length ? chosen.map((x) => `#${x}`).join(', ') : 'нет'
        },
        explanation: `Готово! Максимальная стоимость = ${dp[n][W]}. Выбранные предметы: ${chosen.length ? chosen.map((x) => `#${x}`).join(', ') : 'ни одного'}.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

// 0-1 Рюкзак с восстановлением ответа: O(N * W)
int knapsack(int W, const vector<int>& wt, const vector<int>& val) {
    int n = (int)wt.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));

    for (int i = 1; i <= n; ++i) {
        for (int w = 0; w <= W; ++w) {
            dp[i][w] = dp[i - 1][w]; // не берём i-й предмет
            if (w >= wt[i - 1]) {
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
            }
        }
    }
    return dp[n][W];
}`,
      python: `def knapsack(W: int, wt: list[int], val: list[int]) -> int:
    """Классический 0-1 рюкзак за O(N * W)."""
    n = len(wt)
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if w >= wt[i - 1]:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1])
    return dp[n][W]`
    },
    problems: [
      {
        title: 'AtCoder DP D: Knapsack 1',
        platform: 'AtCoder',
        difficulty: 'Easy',
        url: 'https://atcoder.jp/contests/dp/tasks/dp_d'
      },
      {
        title: 'CSES: Book Shop',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1158'
      },
      {
        title: 'ACMP #309: Рюкзак',
        platform: 'ACMP',
        difficulty: 'Medium',
        url: 'https://acmp.ru/index.asp?main=task&id_task=309'
      }
    ],
    quiz: {
      snippet: `vector<int> dp(W + 1, 0);
for (int i = 0; i < n; ++i)
    for (int w = W; w >= wt[i]; --w)
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);`,
      question: 'Почему внутренний цикл по w идёт от W вниз до wt[i], а не от wt[i] до W?',
      options: [
        'Чтобы каждый предмет можно было использовать не более 1 раза',
        'Чтобы ускорить цикл в 2 раза',
        'Чтобы избежать деления на ноль',
        'Разницы нет, порядок не влияет на ответ'
      ],
      answer: 'Чтобы каждый предмет можно было использовать не более 1 раза',
      explanation: 'При обходе слева направо dp[w - wt[i]] уже содержал бы обновлённое значение для текущего предмета i, что превратило бы задачу в неограниченный рюкзак.'
    }
  ,
    fillBlanks: [
      {
        "title": "Переход в 0-1 рюкзаке (C++)",
        "lang": "cpp",
        "lines": [
          "for (int i = 1; i <= n; ++i) {",
          "    for (int w = 0; w <= W; ++w) {",
          {
            "blankId": "skip",
            "indent": "        ",
            "placeholder": "вариант: не брать i-й предмет",
            "hint": "dp[i][w] = dp[i - 1][w];",
            "answers": [
              "dp[i][w] = dp[i - 1][w];"
            ]
          },
          "        if (w >= wt[i - 1]) {",
          {
            "blankId": "take",
            "indent": "            ",
            "placeholder": "обновление dp[i][w], если берём i-й предмет",
            "hint": "dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);",
            "answers": [
              "dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);"
            ]
          },
          "        }",
          "    }",
          "}"
        ]
      }
    ]
  },
  {
    id: 'lcs-levenshtein',
    title: 'LCS и Расстояние Левенштейна',
    category: 'Динамическое программирование',
    difficulty: 'Средний',
    isStub: false,
    engine: 'grid',
    customInputType: 'two-strings',
    timeComplexity: 'O(|s₁| · |s₂|)',
    spaceComplexity: 'O(|s₁| · |s₂|)',
    summary:
      'Классические задачи ДП на двух строках. LCS находит длину наибольшей общей подпоследовательности (при s1[i-1] == s2[j-1] берём dp[i-1][j-1] + 1, иначе max(dp[i-1][j], dp[i][j-1])). Расстояние Левенштейна находит минимальное число вставок, удалений и замен символов для превращения s1 в s2.',
    pitfalls: [
      'База для Левенштейна: dp[i][0] = i и dp[0][j] = j (в отличие от LCS, где первая строка и первый столбец заполнены нулями).',
      'Не путайте подпоследовательность (символы могут идти не подряд) и подстроку (символы идут подряд).',
      'Если восстановление ответа не требуется, память можно сжать до O(min(|s1|, |s2|)), храня только 2 строки таблицы.'
    ],
    traceCode: [
      '// LCS (если s1[i-1] == s2[j-1]):',
      'dp[i][j] = dp[i - 1][j - 1] + 1;',
      'else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);',
      '// Расстояние Левенштейна:',
      'int cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;',
      'dp[i][j] = min({dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost});'
    ],
    presets: [
      { id: 'lcs', label: 'LCS: ABCBDAB и BDCABA', data: { s1: 'ABCBD', s2: 'BDCAB', algoMode: 'lcs' } },
      { id: 'lev', label: 'Левенштейн: KITTEN → SITTING', data: { s1: 'KITTEN', s2: 'SIT', algoMode: 'levenshtein' } }
    ],
    generateFrames({ s1, s2, algoMode = 'lcs' }) {
      const n = s1.length;
      const m = s2.length;
      const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      const rowHeaders = ['""', ...[...s1]];
      const colHeaders = ['""', ...[...s2]];
      const clone = () => dp.map((r) => [...r]);
      const frames = [];

      if (algoMode === 'levenshtein') {
        for (let i = 0; i <= n; i++) dp[i][0] = i;
        for (let j = 0; j <= m; j++) dp[0][j] = j;
      }

      frames.push({
        grid: clone(),
        rowHeaders,
        colHeaders,
        currentCell: null,
        depCells: [],
        pathCells: [],
        arrows: [],
        line: algoMode === 'lcs' ? 0 : 4,
        vars: { режим: algoMode === 'lcs' ? 'LCS' : 'Левенштейн', s1, s2 },
        explanation:
          algoMode === 'lcs'
            ? `Инициализируем матрицу LCS нулями.`
            : `База Левенштейна: dp[i][0] = i, dp[0][j] = j (превращение в пустую строку).`
      });

      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          const same = s1[i - 1] === s2[j - 1];
          let deps = [];
          let arrows = [];

          if (algoMode === 'lcs') {
            if (same) {
              dp[i][j] = dp[i - 1][j - 1] + 1;
              deps = [[i - 1, j - 1]];
              arrows = [{ from: [i - 1, j - 1], to: [i, j] }];
            } else {
              dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
              deps = [[i - 1, j], [i, j - 1]];
              arrows = [{ from: dp[i - 1][j] >= dp[i][j - 1] ? [i - 1, j] : [i, j - 1], to: [i, j] }];
            }
          } else {
            const cost = same ? 0 : 1;
            const dDel = dp[i - 1][j] + 1;
            const dIns = dp[i][j - 1] + 1;
            const dSub = dp[i - 1][j - 1] + cost;
            dp[i][j] = Math.min(dDel, dIns, dSub);
            deps = [[i - 1, j], [i, j - 1], [i - 1, j - 1]];
            const bestFrom = dp[i][j] === dSub ? [i - 1, j - 1] : dp[i][j] === dDel ? [i - 1, j] : [i, j - 1];
            arrows = [{ from: bestFrom, to: [i, j] }];
          }

          frames.push({
            grid: clone(),
            rowHeaders,
            colHeaders,
            currentCell: [i, j],
            depCells: deps,
            pathCells: [],
            arrows,
            line: algoMode === 'lcs' ? (same ? 1 : 2) : 5,
            vars: { i, j, 's1[i-1]': s1[i - 1], 's2[j-1]': s2[j - 1], [`dp[${i}][${j}]`]: dp[i][j] },
            explanation:
              algoMode === 'lcs'
                ? same
                  ? `Символы '${s1[i - 1]}' совпали! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
                  : `Разные символы ('${s1[i - 1]}' ≠ '${s2[j - 1]}'): берём max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`
                : `(${s1[i - 1]}, ${s2[j - 1]}): ${same ? 'совпадение (+0)' : 'операция (+1)'} → dp[${i}][${j}] = ${dp[i][j]}.`
          });
        }
      }

      // Восстановление пути
      const pathCells = [[n, m]];
      let r = n;
      let c = m;
      let lcsStr = '';
      while (r > 0 && c > 0) {
        if (algoMode === 'lcs') {
          if (s1[r - 1] === s2[c - 1]) {
            lcsStr = s1[r - 1] + lcsStr;
            r--;
            c--;
          } else if (dp[r - 1][c] >= dp[r][c - 1]) r--;
          else c--;
        } else {
          const cost = s1[r - 1] === s2[c - 1] ? 0 : 1;
          if (dp[r][c] === dp[r - 1][c - 1] + cost) {
            r--;
            c--;
          } else if (dp[r][c] === dp[r - 1][c] + 1) r--;
          else c--;
        }
        pathCells.push([r, c]);
      }

      frames.push({
        grid: clone(),
        rowHeaders,
        colHeaders,
        currentCell: [n, m],
        depCells: [],
        pathCells,
        arrows: [],
        line: algoMode === 'lcs' ? 1 : 5,
        vars: algoMode === 'lcs' ? { длинаLCS: dp[n][m], LCS: lcsStr || '""' } : { расстояниеЛевенштейна: dp[n][m] },
        explanation:
          algoMode === 'lcs'
            ? `Готово! Длина LCS = ${dp[n][m]} (подпоследовательность: "${lcsStr}").`
            : `Готово! Минимальное расстояние Левенштейна = ${dp[n][m]}.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int editDistance(const string& s1, const string& s2) {
    int n = (int)s1.size(), m = (int)s2.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 0; i <= n; ++i) dp[i][0] = i;
    for (int j = 0; j <= m; ++j) dp[0][j] = j;
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            int cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;
            dp[i][j] = min({dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost});
        }
    }
    return dp[n][m];
}`,
      python: `def edit_distance(s1: str, s2: str) -> int:
    n, m = len(s1), len(s2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = i
    for j in range(m + 1): dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[n][m]`
    },
    problems: [
      { title: 'CSES: Edit Distance', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1639' },
      { title: 'AtCoder DP F: LCS', platform: 'AtCoder', difficulty: 'Easy', url: 'https://atcoder.jp/contests/dp/tasks/dp_f' },
      { title: 'ACMP #1124: Расстояние по Левенштейну', platform: 'ACMP', difficulty: 'Medium', url: 'https://acmp.ru/index.asp?main=task&id_task=1124' }
    ],
    quiz: {
      snippet: `// Поиск расстояния Левенштейна между строками длины N и M`,
      question: 'До какого объёма можно оптимизировать память в задачах LCS и расстояния Левенштейна, если нужно вывести только число (без восстановления строки)?',
      options: ['O(min(N, M))', 'O(N · M)', 'O(1)', 'O(N² + M²)'],
      answer: 'O(min(N, M))',
      explanation: 'Для вычисления текущей строки таблицы нужна только предыдущая строка, а более короткую строку можно выбрать в качестве столбцов.'
    }
  ,
    fillBlanks: [
      {
        "title": "Переход в задаче LCS (Python)",
        "lang": "python",
        "lines": [
          "if s1[i - 1] == s2[j - 1]:",
          {
            "blankId": "eq",
            "indent": "    ",
            "placeholder": "символы совпали",
            "hint": "dp[i][j] = dp[i - 1][j - 1] + 1",
            "answers": [
              "dp[i][j] = dp[i - 1][j - 1] + 1"
            ]
          },
          "else:",
          {
            "blankId": "neq",
            "indent": "    ",
            "placeholder": "максимум из соседа сверху и слева",
            "hint": "dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])",
            "answers": [
              "dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])"
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'tsp',
    title: 'Задача коммивояжёра (TSP — ДП по маскам)',
    category: 'Динамическое программирование',
    difficulty: 'Продвинутый',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(n² · 2ⁿ)',
    spaceComplexity: 'O(n · 2ⁿ)',
    summary:
      'Постановка: дан полный взвешенный граф G = (V, E) с матрицей расстояний w(i, j). Требуется найти гамильтонов цикл минимального веса, проходящий через все n вершин ровно по одному разу и возвращающийся в стартовую вершину: min ∑ w(v_i, v_{i+1}). Идея: состояние dp[mask][v] хранит минимальную стоимость пути, посетившего подмножество вершин mask и закончившегося в вершине v. Переход: dp[mask][v] = min_{u ∈ mask \\ {v}} (dp[mask \\ {v}][u] + w(u, v)).',
    pitfalls: [
      'Экспоненциальный рост: алгоритм применим только при n ≤ 20 (при n = 20 таблица 20 · 2^20 ≈ 2·10^7 состояний).',
      'Переполнение при сложении INF + w(u, v): проверяйте, что dp[prevMask][u] < INF, либо используйте INF = 1e9 / 1e15.',
      'Асимметричные матрицы расстояний: в общем случае w(u, v) ≠ w(v, u), поэтому порядок обхода вершин важен.'
    ],
    traceCode: [
      'dp[1 << start][start] = 0;',
      'for (int mask = 1; mask < (1 << n); ++mask) {',
      '    for (int v = 0; v < n; ++v) {',
      '        if (!(mask & (1 << v)) || dp[mask][v] == INF) continue;',
      '        for (int to = 0; to < n; ++to) {',
      '            if (mask & (1 << to)) continue;',
      '            int nmask = mask | (1 << to);',
      '            dp[nmask][to] = min(dp[nmask][to], dp[mask][v] + w[v][to]);',
      '        }',
      '    }',
      '}',
      'ans = min_v (dp[(1 << n) - 1][v] + w[v][start]);'
    ],
    presets: [
      {
        id: 'tsp4',
        label: 'Полный граф (4 вершины)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 130, y: 65 },
            { id: 1, x: 410, y: 65 },
            { id: 2, x: 410, y: 195 },
            { id: 3, x: 130, y: 195 }
          ],
          edges: [
            { from: 0, to: 1, weight: 10 },
            { from: 0, to: 2, weight: 15 },
            { from: 0, to: 3, weight: 20 },
            { from: 1, to: 2, weight: 35 },
            { from: 1, to: 3, weight: 25 },
            { from: 2, to: 3, weight: 30 }
          ]
        }
      },
      {
        id: 'tsp5',
        label: 'Полный граф (5 вершин)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 280, y: 40 },
            { id: 1, x: 440, y: 105 },
            { id: 2, x: 380, y: 215 },
            { id: 3, x: 180, y: 215 },
            { id: 4, x: 120, y: 105 }
          ],
          edges: [
            { from: 0, to: 1, weight: 3 },
            { from: 0, to: 2, weight: 10 },
            { from: 0, to: 3, weight: 11 },
            { from: 0, to: 4, weight: 7 },
            { from: 1, to: 2, weight: 4 },
            { from: 1, to: 3, weight: 12 },
            { from: 1, to: 4, weight: 9 },
            { from: 2, to: 3, weight: 5 },
            { from: 2, to: 4, weight: 8 },
            { from: 3, to: 4, weight: 6 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges, startNode = 0 }) {
      const n = nodes.length;
      const idToIdx = new Map(nodes.map((nd, idx) => [nd.id, idx]));
      const INF = 1e9;
      const w = Array.from({ length: n }, () => new Array(n).fill(INF));
      for (let i = 0; i < n; i++) w[i][i] = 0;
      edges.forEach((e) => {
        const u = idToIdx.get(e.from);
        const v = idToIdx.get(e.to);
        const wt = e.weight ?? 1;
        if (u !== undefined && v !== undefined) {
          w[u][v] = Math.min(w[u][v], wt);
          w[v][u] = Math.min(w[v][u], wt);
        }
      });

      const sIdx = idToIdx.get(startNode) ?? 0;
      const totalMasks = 1 << n;
      const dp = Array.from({ length: totalMasks }, () => new Array(n).fill(INF));
      const parent = Array.from({ length: totalMasks }, () => new Array(n).fill(-1));
      dp[1 << sIdx][sIdx] = 0;

      const fmtMask = (m) => m.toString(2).padStart(n, '0') + '₂';
      const frames = [];

      const snap = (extra = {}) => ({
        nodes,
        edges: edges.map((e) => ({ ...e, weight: e.weight ?? 1 })),
        weighted: true,
        currentNode: null,
        visitedNodes: [],
        activeEdge: null,
        treeEdges: [],
        ...extra
      });

      frames.push(
        snap({
          currentNode: nodes[sIdx].id,
          line: 0,
          vars: { start: nodes[sIdx].id, mask: fmtMask(1 << sIdx), ans: '∞' },
          auxPanels: [
            { title: 'Текущая маска (mask)', value: fmtMask(1 << sIdx), color: 'var(--info)' },
            { title: 'Лучший цикл (ans)', value: '∞', color: 'var(--accent-light)' }
          ],
          explanation: `База ДП: начинаем в вершине ${nodes[sIdx].id}, dp[${fmtMask(1 << sIdx)}][${nodes[sIdx].id}] = 0.`
        })
      );

      for (let mask = 1; mask < totalMasks; mask++) {
        if (!(mask & (1 << sIdx))) continue;
        for (let v = 0; v < n; v++) {
          if (!(mask & (1 << v)) || dp[mask][v] >= INF) continue;

          const visitedIds = [];
          for (let k = 0; k < n; k++) if (mask & (1 << k)) visitedIds.push(nodes[k].id);

          for (let to = 0; to < n; to++) {
            if (mask & (1 << to) || w[v][to] >= INF) continue;
            const nmask = mask | (1 << to);
            const cand = dp[mask][v] + w[v][to];
            const improved = cand < dp[nmask][to];
            if (improved) {
              dp[nmask][to] = cand;
              parent[nmask][to] = v;
            }

            // Показываем ключевые шаги обновления (чтобы плеер был информативным и не перегруженным)
            if (improved) {
              frames.push(
                snap({
                  currentNode: nodes[to].id,
                  visitedNodes: visitedIds,
                  activeEdge: [nodes[v].id, nodes[to].id],
                  line: 7,
                  vars: {
                    mask: fmtMask(mask),
                    v: nodes[v].id,
                    to: nodes[to].id,
                    nmask: fmtMask(nmask),
                    [`dp[nmask][${nodes[to].id}]`]: dp[nmask][to]
                  },
                  guess:
                    nmask === totalMasks - 1
                      ? {
                          expected: nodes[to].id,
                          prompt: `В какую последнюю вершину переходит путь из ${nodes[v].id} при заполнении полной маски? Кликните по вершине.`
                        }
                      : undefined,
                  auxPanels: [
                    { title: 'Переход по маске', value: `${fmtMask(mask)} → ${fmtMask(nmask)}`, color: 'var(--info)' },
                    { title: 'Стоимость состояния', value: `dp[${nodes[to].id}] = ${dp[nmask][to]}`, color: 'var(--accent-light)' }
                  ],
                  explanation: `Переход ${nodes[v].id} → ${nodes[to].id} (вес ${w[v][to]}): обновляем dp[${fmtMask(nmask)}][${nodes[to].id}] = ${cand}.`
                })
              );
            }
          }
        }
      }

      // Замыкаем гамильтонов цикл
      const fullMask = totalMasks - 1;
      let ans = INF;
      let lastV = -1;
      for (let v = 0; v < n; v++) {
        if (v === sIdx || dp[fullMask][v] >= INF || w[v][sIdx] >= INF) continue;
        if (dp[fullMask][v] + w[v][sIdx] < ans) {
          ans = dp[fullMask][v] + w[v][sIdx];
          lastV = v;
        }
      }

      const cycleNodes = [];
      const cycleEdges = [];
      if (lastV !== -1) {
        let cur = lastV;
        let curMask = fullMask;
        while (cur !== -1) {
          cycleNodes.push(nodes[cur].id);
          const prev = parent[curMask][cur];
          if (prev !== -1) cycleEdges.push([nodes[prev].id, nodes[cur].id]);
          curMask ^= 1 << cur;
          cur = prev;
        }
        cycleNodes.reverse();
        cycleEdges.push([nodes[lastV].id, nodes[sIdx].id]);
        cycleNodes.push(nodes[sIdx].id);
      }

      frames.push(
        snap({
          currentNode: nodes[sIdx].id,
          visitedNodes: nodes.map((nd) => nd.id),
          treeEdges: cycleEdges,
          line: 11,
          vars: { mask: fmtMask(fullMask), ans: ans >= INF ? '∞' : ans, цикл: cycleNodes.join(' → ') },
          auxPanels: [
            { title: 'Оптимальный цикл', value: cycleNodes.length ? cycleNodes.join(' → ') : 'не найден', color: 'var(--success)' },
            { title: 'Минимальный вес (ans)', value: ans >= INF ? '∞' : String(ans), color: 'var(--accent-light)' }
          ],
          explanation:
            ans >= INF
              ? `Гамильтонов цикл не найден.`
              : `Гамильтонов цикл найден: ${cycleNodes.join(' → ')}, суммарный вес ans = ${ans}.`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

// Задача коммивояжёра: O(n^2 * 2^n), возвращает {min_cost, cycle}
pair<long long, vector<int>> solveTSP(const vector<vector<long long>>& w, int start = 0) {
    const long long INF = 1e15;
    int n = (int)w.size();
    int FULL = 1 << n;
    vector<vector<long long>> dp(FULL, vector<long long>(n, INF));
    vector<vector<int>> parent(FULL, vector<int>(n, -1));
    dp[1 << start][start] = 0;

    for (int mask = 1; mask < FULL; ++mask) {
        for (int v = 0; v < n; ++v) {
            if (!(mask & (1 << v)) || dp[mask][v] >= INF) continue;
            for (int to = 0; to < n; ++to) {
                if (mask & (1 << to)) continue;
                int nmask = mask | (1 << to);
                if (dp[mask][v] + w[v][to] < dp[nmask][to]) {
                    dp[nmask][to] = dp[mask][v] + w[v][to];
                    parent[nmask][to] = v;
                }
            }
        }
    }

    long long ans = INF;
    int last = -1;
    for (int v = 0; v < n; ++v) {
        if (v != start && dp[FULL - 1][v] + w[v][start] < ans) {
            ans = dp[FULL - 1][v] + w[v][start];
            last = v;
        }
    }
    vector<int> path;
    for (int cur = last, mask = FULL - 1; cur != -1;) {
        path.push_back(cur);
        int p = parent[mask][cur];
        mask ^= (1 << cur);
        cur = p;
    }
    reverse(path.begin(), path.end());
    if (!path.empty()) path.push_back(start);
    return {ans, path};
}`,
      python: `def solve_tsp(w: list[list[int]], start: int = 0) -> tuple[int, list[int]]:
    """Задача коммивояжёра методом ДП по подмножествам: O(n^2 * 2^n)."""
    INF = 10**15
    n = len(w)
    full = 1 << n
    dp = [[INF] * n for _ in range(full)]
    parent = [[-1] * n for _ in range(full)]
    dp[1 << start][start] = 0

    for mask in range(1, full):
        for v in range(n):
            if not (mask & (1 << v)) or dp[mask][v] >= INF:
                continue
            for to in range(n):
                if mask & (1 << to):
                    continue
                nmask = mask | (1 << to)
                if dp[mask][v] + w[v][to] < dp[nmask][to]:
                    dp[nmask][to] = dp[mask][v] + w[v][to]
                    parent[nmask][to] = v

    ans, last = INF, -1
    for v in range(n):
        if v != start and dp[full - 1][v] + w[v][start] < ans:
            ans = dp[full - 1][v] + w[v][start]
            last = v

    path = []
    cur, mask = last, full - 1
    while cur != -1:
        path.append(cur)
        p = parent[mask][cur]
        mask ^= (1 << cur)
        cur = p
    path.reverse()
    if path:
        path.append(start)
    return ans, path`
    },
    problems: [
      {
        title: 'CSES: Hamiltonian Flights',
        platform: 'CSES',
        difficulty: 'Medium',
        url: 'https://cses.fi/problemset/task/1690'
      },
      {
        title: 'AtCoder ABC 180E: Traveling Salesman among Aerial Cities',
        platform: 'AtCoder',
        difficulty: 'Medium',
        url: 'https://atcoder.jp/contests/abc180/tasks/abc180_e'
      },
      {
        title: 'ACMP #186: Задача коммивояжёра',
        platform: 'ACMP',
        difficulty: 'Medium',
        url: 'https://acmp.ru/index.asp?main=task&id_task=186'
      }
    ],
    quiz: {
      snippet: `// Таблица ДП: dp[1 << n][n]
for (int mask = 0; mask < (1 << n); ++mask)
    for (int v = 0; v < n; ++v)
        for (int to = 0; to < n; ++to) ...`,
      question: 'Каково максимальное разумное значение N для решения задачи коммивояжёра за O(n² · 2ⁿ) при лимите 1 секунда в C++?',
      options: ['n ≤ 18–20', 'n ≤ 100', 'n ≤ 1000', 'n ≤ 10⁵'],
      answer: 'n ≤ 18–20',
      explanation: 'При n = 20 имеем 20² · 2²⁰ ≈ 4·10⁸ операций (укладывается за ~1–2 сек с простым внутренним циклом), а при n = 25 уже > 10¹⁰.'
    }
  ,
    fillBlanks: [
      {
        "title": "Переход по битовой маске в TSP (C++)",
        "lang": "cpp",
        "lines": [
          "for (int to = 0; to < n; ++to) {",
          {
            "blankId": "chk",
            "indent": "    ",
            "placeholder": "пропуск, если вершина to уже в mask",
            "hint": "if (mask & (1 << to)) continue;",
            "answers": [
              "if (mask & (1 << to)) continue;",
              "if ((mask >> to) & 1) continue;"
            ]
          },
          "    int nmask = mask | (1 << to);",
          {
            "blankId": "rel",
            "indent": "    ",
            "placeholder": "обновите dp[nmask][to]",
            "hint": "dp[nmask][to] = min(dp[nmask][to], dp[mask][v] + w[v][to]);",
            "answers": [
              "dp[nmask][to] = min(dp[nmask][to], dp[mask][v] + w[v][to]);"
            ]
          },
          "}"
        ]
      }
    ]
  }
];
