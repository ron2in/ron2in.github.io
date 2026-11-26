/**
 * База тем AlgoPortal (по материалам e-maxx.ru / cp-algorithms).
 */

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
  },

  {
    id: 'bfs',
    title: 'Поиск в ширину (BFS)',
    category: 'Графы',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    summary:
      'Поиск в ширину (Breadth-First Search) обходит граф слоями в порядке удаления от стартовой вершины. В невзвешенном графе BFS гарантированно находит кратчайшие пути от стартовой вершины до всех достижимых.',
    pitfalls: [
      'Пометка visited/dist должна происходить при добавлении в очередь, а НЕ при извлечении из неё — иначе одна вершина попадёт в очередь многократно.',
      'В несвязном графе недостижимые вершины сохраняют расстояние ∞ (или -1).',
      'Для графов с разными весами рёбер BFS не подходит — нужен алгоритм Дейкстры или 0-1 BFS.'
    ],
    traceCode: [
      'dist.assign(n, INF);',
      'dist[start] = 0; q.push(start);',
      'while (!q.empty()) {',
      '    int u = q.front(); q.pop();',
      '    for (int v : adj[u]) {',
      '        if (dist[v] == INF) {',
      '            dist[v] = dist[u] + 1;',
      '            q.push(v);',
      '        }',
      '    }',
      '}'
    ],
    presets: [
      {
        id: 'connected',
        label: 'Связный граф (6 вершин)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 90, y: 130 },
            { id: 1, x: 210, y: 60 },
            { id: 2, x: 210, y: 200 },
            { id: 3, x: 350, y: 60 },
            { id: 4, x: 350, y: 200 },
            { id: 5, x: 470, y: 130 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 1, to: 3 },
            { from: 1, to: 2 },
            { from: 2, to: 4 },
            { from: 3, to: 5 },
            { from: 4, to: 5 }
          ]
        }
      },
      {
        id: 'disconnected',
        label: '2 компоненты связности',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 90, y: 70 },
            { id: 1, x: 220, y: 70 },
            { id: 2, x: 155, y: 185 },
            { id: 3, x: 360, y: 80 },
            { id: 4, x: 470, y: 80 },
            { id: 5, x: 415, y: 185 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 0, to: 2 },
            { from: 3, to: 4 },
            { from: 4, to: 5 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges, startNode }) {
      const adj = new Map();
      nodes.forEach((n) => adj.set(n.id, []));
      edges.forEach((e) => {
        if (adj.has(e.from) && adj.has(e.to)) {
          adj.get(e.from).push(e.to);
          adj.get(e.to).push(e.from);
        }
      });
      adj.forEach((list) => list.sort((a, b) => a - b));

      const dist = {};
      nodes.forEach((n) => {
        dist[n.id] = Infinity;
      });

      const frames = [];
      const queue = [];
      const visited = new Set();
      const treeEdges = [];

      const snap = (extra = {}) => ({
        nodes,
        edges,
        weighted: false,
        currentNode: null,
        queuedNodes: [...queue],
        visitedNodes: [...visited],
        activeEdge: null,
        treeEdges: treeEdges.map((e) => [...e]),
        queue: [...queue],
        dist: { ...dist },
        ...extra
      });

      frames.push(
        snap({
          line: 0,
          vars: { start: startNode, queue: '[]' },
          explanation: `Инициализируем расстояния dist[v] = ∞ для всех вершин.`
        })
      );

      dist[startNode] = 0;
      queue.push(startNode);

      frames.push(
        snap({
          currentNode: startNode,
          line: 1,
          vars: { start: startNode, 'dist[start]': 0, queue: `[${queue.join(', ')}]` },
          explanation: `Задаём dist[${startNode}] = 0 и помещаем стартовую вершину ${startNode} в очередь.`
        })
      );

      while (queue.length > 0) {
        const u = queue.shift();
        visited.add(u);

        frames.push(
          snap({
            currentNode: u,
            line: 3,
            vars: { u, 'dist[u]': dist[u], queue: `[${queue.join(', ')}]` },
            explanation: `Извлекаем вершину u = ${u} из начала очереди. Начинаем просмотр её соседей.`
          })
        );

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
          frames.push(
            snap({
              currentNode: u,
              activeEdge: [u, v],
              line: 5,
              vars: { u, v, 'dist[v]': dist[v] === Infinity ? '∞' : dist[v] },
              explanation: `Проверяем соседа v = ${v} по ребру (${u}, ${v}).`
            })
          );

          if (dist[v] === Infinity) {
            dist[v] = dist[u] + 1;
            queue.push(v);
            treeEdges.push([u, v]);

            frames.push(
              snap({
                currentNode: u,
                activeEdge: [u, v],
                line: 7,
                vars: {
                  u,
                  v,
                  'dist[v]': dist[v],
                  queue: `[${queue.join(', ')}]`
                },
                guess: {
                  expected: v,
                  prompt: `Какая непосещённая вершина будет добавлена в очередь из вершины ${u}? Кликните по вершине на графе.`
                },
                explanation: `Вершина ${v} ещё не посещена! Устанавливаем dist[${v}] = dist[${u}] + 1 = ${dist[v]} и добавляем ${v} в очередь.`
              })
            );
          }
        }
      }

      frames.push(
        snap({
          line: 10,
          vars: { queue: '[]', visited: visited.size },
          explanation: `Очередь пуста — обход BFS завершён! Все достижимые вершины получили кратчайшие расстояния.`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <queue>
using namespace std;

vector<int> bfs(int start, const vector<vector<int>>& adj) {
    const int INF = 1e9;
    int n = (int)adj.size();
    vector<int> dist(n, INF);
    queue<int> q;

    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (dist[v] == INF) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}`,
      python: `from collections import deque

def bfs(start: int, adj: list[list[int]]) -> list[int]:
    inf = float('inf')
    dist = [inf] * len(adj)
    q = deque([start])
    dist[start] = 0

    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == inf:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist`
    },
    problems: [
      {
        title: 'CSES: Message Route',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1667'
      },
      {
        title: 'CSES: Labyrinth',
        platform: 'CSES',
        difficulty: 'Medium',
        url: 'https://cses.fi/problemset/task/1193'
      },
      {
        title: 'ACMP #127: Путь',
        platform: 'ACMP',
        difficulty: 'Easy',
        url: 'https://acmp.ru/index.asp?main=task&id_task=127'
      }
    ],
    quiz: {
      snippet: `// Граф задан матрицей смежности n x n
queue<int> q;
q.push(start);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v = 0; v < n; ++v)
        if (g[u][v] && dist[v] == INF) { ... }
}`,
      question: 'Какова временная сложность BFS при использовании матрицы смежности?',
      options: ['O(V + E)', 'O(V²)', 'O(E log V)', 'O(V · E)'],
      answer: 'O(V²)',
      explanation: 'Для каждой из V вершин цикл по v проходит все V столбцов матрицы смежности, что даёт O(V²).'
    }
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
  },
  {
    id: 'dijkstra',
    title: 'Алгоритм Дейкстры',
    category: 'Графы',
    difficulty: 'Средний',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    summary:
      'Жадный алгоритм нахождения кратчайших путей от одной стартовой вершины до всех остальных во взвешенном графе с неотрицательными весами рёбер. На каждом шаге извлекается вершина с минимальным текущим расстоянием и выполняются релаксации исходящих рёбер.',
    pitfalls: [
      'Отрицательные веса рёбер ломают жадный инвариант: уже зафиксированная вершина может получить более короткий путь позже (в таких случаях нужен Беллман–Форд).',
      'Ленивое удаление в priority_queue: при извлечении пары (d, u) обязательно проверяйте if (d > dist[u]) continue;, иначе асимптотика ухудшится.',
      'Переполнение int: при весах до 10^9 сумма расстояний легко превышает 2·10^9 — используйте long long и INF = 1e18.'
    ],
    traceCode: [
      'dist.assign(n, INF); dist[start] = 0;',
      'pq.push({0, start});',
      'while (!pq.empty()) {',
      '    auto [d, u] = pq.top(); pq.pop();',
      '    if (d > dist[u]) continue;',
      '    for (auto [v, w] : adj[u]) {',
      '        if (dist[u] + w < dist[v]) {',
      '            dist[v] = dist[u] + w;',
      '            pq.push({dist[v], v});',
      '        }',
      '    }',
      '}'
    ],
    presets: [
      {
        id: 'classic',
        label: 'Классический граф (6 вершин)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 80, y: 130 },
            { id: 1, x: 205, y: 55 },
            { id: 2, x: 205, y: 205 },
            { id: 3, x: 355, y: 55 },
            { id: 4, x: 355, y: 205 },
            { id: 5, x: 480, y: 130 }
          ],
          edges: [
            { from: 0, to: 1, weight: 4 },
            { from: 0, to: 2, weight: 2 },
            { from: 1, to: 2, weight: 1 },
            { from: 1, to: 3, weight: 5 },
            { from: 2, to: 4, weight: 8 },
            { from: 2, to: 3, weight: 7 },
            { from: 3, to: 4, weight: 2 },
            { from: 3, to: 5, weight: 3 },
            { from: 4, to: 5, weight: 1 }
          ]
        }
      },
      {
        id: 'shortcut',
        label: 'Обходной путь короче прямого',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 90, y: 130 },
            { id: 1, x: 240, y: 55 },
            { id: 2, x: 390, y: 130 },
            { id: 3, x: 240, y: 205 }
          ],
          edges: [
            { from: 0, to: 2, weight: 12 },
            { from: 0, to: 1, weight: 2 },
            { from: 1, to: 2, weight: 3 },
            { from: 0, to: 3, weight: 6 },
            { from: 3, to: 2, weight: 4 }
          ]
        }
      },
      {
        id: 'disconnected',
        label: 'Крайний случай: недостижимые вершины',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 95, y: 80 },
            { id: 1, x: 225, y: 80 },
            { id: 2, x: 160, y: 190 },
            { id: 3, x: 380, y: 80 },
            { id: 4, x: 480, y: 180 }
          ],
          edges: [
            { from: 0, to: 1, weight: 3 },
            { from: 1, to: 2, weight: 5 },
            { from: 0, to: 2, weight: 10 },
            { from: 3, to: 4, weight: 2 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges, startNode }) {
      const adj = new Map();
      nodes.forEach((n) => adj.set(n.id, []));
      edges.forEach((e) => {
        const w = e.weight ?? 1;
        if (adj.has(e.from) && adj.has(e.to)) {
          adj.get(e.from).push({ to: e.to, weight: w });
          adj.get(e.to).push({ to: e.from, weight: w });
        }
      });
      adj.forEach((list) => list.sort((a, b) => a.to - b.to));

      const dist = {};
      const parentEdge = {};
      nodes.forEach((n) => {
        dist[n.id] = Infinity;
      });

      const frames = [];
      const pq = []; // [{ d, u }]
      const visited = new Set();

      const formatPQ = () =>
        pq
          .slice()
          .sort((a, b) => a.d - b.d || a.u - b.u)
          .map((item) => `(${item.d}, v${item.u})`);

      const snap = (extra = {}) => {
        const pqItems = formatPQ();
        const distEntries = nodes.map(
          (n) => `${n.id}:${dist[n.id] === Infinity || dist[n.id] === undefined ? '∞' : dist[n.id]}`
        );
        return {
          nodes,
          edges: edges.map((e) => ({ ...e, weight: e.weight ?? 1 })),
          weighted: true,
          currentNode: null,
          queuedNodes: [...new Set(pq.map((item) => item.u).filter((id) => !visited.has(id)))],
          visitedNodes: [...visited],
          activeEdge: null,
          treeEdges: Object.values(parentEdge),
          queue: pqItems,
          dist: { ...dist },
          auxPanels: [
            {
              title: 'Приоритетная очередь (priority_queue)',
              value: `[${pqItems.length ? pqItems.join(', ') : 'пусто'}]`,
              color: 'var(--info)'
            },
            {
              title: 'Массив расстояний (dist)',
              value: distEntries.join('  '),
              color: 'var(--accent-light)'
            }
          ],
          ...extra
        };
      };

      dist[startNode] = 0;
      frames.push(
        snap({
          currentNode: startNode,
          line: 0,
          vars: { start: startNode, 'dist[start]': 0 },
          explanation: `Инициализация: dist[v] = ∞ для всех вершин, кроме стартовой dist[${startNode}] = 0.`
        })
      );

      pq.push({ d: 0, u: startNode });
      frames.push(
        snap({
          currentNode: startNode,
          line: 1,
          vars: { start: startNode, pq: formatPQ().join(' ') },
          explanation: `Помещаем стартовую пару (0, ${startNode}) в очередь с приоритетом.`
        })
      );

      while (pq.length > 0) {
        pq.sort((a, b) => a.d - b.d || a.u - b.u);
        const { d, u } = pq.shift();

        frames.push(
          snap({
            currentNode: u,
            line: 3,
            vars: { d, u, 'dist[u]': dist[u] },
            guess:
              !visited.has(u) && u !== startNode
                ? {
                    expected: u,
                    prompt: `Какая вершина с минимальным расстоянием будет извлечена из очереди следующей? Кликните по вершине.`
                  }
                : undefined,
            explanation: `Извлекаем из очереди вершину u = ${u} с расстоянием d = ${d}.`
          })
        );

        if (d > dist[u]) {
          frames.push(
            snap({
              currentNode: u,
              line: 4,
              vars: { d, u, 'dist[u]': dist[u] },
              explanation: `Устаревшая запись: d (${d}) > dist[${u}] (${dist[u]}), пропускаем её.`
            })
          );
          continue;
        }

        visited.add(u);
        const neighbors = adj.get(u) || [];

        for (const { to: v, weight: w } of neighbors) {
          frames.push(
            snap({
              currentNode: u,
              activeEdge: [u, v],
              line: 6,
              vars: {
                u,
                v,
                w,
                'dist[u]+w': dist[u] + w,
                'dist[v]': dist[v] === Infinity ? '∞' : dist[v]
              },
              explanation: `Проверяем ребро (${u}, ${v}) весом ${w}: можно ли улучшить путь до ${v} (${dist[u]} + ${w} < ${dist[v] === Infinity ? '∞' : dist[v]})?`
            })
          );

          if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            parentEdge[v] = [u, v];
            pq.push({ d: dist[v], u: v });

            frames.push(
              snap({
                currentNode: u,
                activeEdge: [u, v],
                line: 8,
                vars: {
                  u,
                  v,
                  'dist[v]': dist[v],
                  pq: formatPQ().join(' ')
                },
                explanation: `Релаксация успешна! Обновляем dist[${v}] = ${dist[v]} и добавляем (${dist[v]}, ${v}) в очередь.`
              })
            );
          }
        }
      }

      frames.push(
        snap({
          line: 11,
          vars: { pq: 'пусто', visited: visited.size },
          explanation: `Очередь с приоритетом пуста — алгоритм Дейкстры завершён! Все достижимые вершины имеют минимальные расстояния.`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <queue>
using namespace std;

// Возвращает массив кратчайших расстояний от start до всех вершин
vector<long long> dijkstra(int start, const vector<vector<pair<int, int>>>& adj) {
    const long long INF = 1e18;
    int n = (int)adj.size();
    vector<long long> dist(n, INF);
    // Мин-куча хранит пары {расстояние, вершина}
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue; // Пропускаем устаревшую запись

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
      python: `import heapq

def dijkstra(start: int, adj: list[list[tuple[int, int]]]) -> list[float]:
    """Возвращает список кратчайших расстояний от start до всех вершин."""
    inf = float('inf')
    dist = [inf] * len(adj)
    dist[start] = 0
    pq = [(0, start)]  # мин-куча (расстояние, вершина)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # пропускаем устаревшую запись

        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`
    },
    problems: [
      {
        title: 'CF #20C: Dijkstra?',
        platform: 'Codeforces',
        difficulty: 'Medium',
        url: 'https://codeforces.com/problemset/problem/20/C'
      },
      {
        title: 'CSES: Shortest Routes I',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1671'
      },
      {
        title: 'ACMP #132: Алгоритм Дейкстры',
        platform: 'ACMP',
        difficulty: 'Easy',
        url: 'https://acmp.ru/index.asp?main=task&id_task=132'
      },
      {
        title: 'CSES: Flight Discount',
        platform: 'CSES',
        difficulty: 'Hard',
        url: 'https://cses.fi/problemset/task/1195'
      }
    ],
    quiz: {
      snippet: `// Реализация Дейкстры на плотном графе без кучи:
for (int i = 0; i < n; ++i) {
    int u = findMinUnvisited(dist, used); // за O(V)
    used[u] = true;
    for (auto [v, w] : adj[u])
        dist[v] = min(dist[v], dist[u] + w);
}`,
      question: 'Какова временная сложность алгоритма Дейкстры без использования очереди с приоритетом (наивный поиск минимума)?',
      options: ['O(V² + E)', 'O((V + E) log V)', 'O(V · E)', 'O(E log V)'],
      answer: 'O(V² + E)',
      explanation: 'Поиск минимума за O(V) выполняется V раз (итого O(V²)), плюс каждое ребро просматривается O(1) раз (итого O(E)). Для плотных графов (E ≈ V²) это даже быстрее, чем с кучей.'
    }
  },
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
  },
  {
    id: 'segment-tree',
    title: 'Дерево отрезков (Segment Tree)',
    category: 'Структуры данных',
    difficulty: 'Средний',
    isStub: false,
    engine: 'tree',
    customInputType: 'segtree',
    timeComplexity: 'O(N) построение, O(log N) запрос',
    spaceComplexity: 'O(4N)',
    summary:
      'Универсальная древовидная структура данных, позволяющая за O(log N) отвечать на ассоциативные запросы на отрезке [l, r] (сумма, минимум, максимум) и обновлять значения элементов массива.',
    pitfalls: [
      'Размер массива дерева: для безопасной 1-индексации выделяйте 4 * N памяти (так как N может не быть степенью двойки).',
      'Не путайте границы текущего узла [tl, tr] и границы запроса [l, r]: при полном вложении (l <= tl && tr <= r) сразу возвращайте tree[v].',
      'При 0-индексации исходного массива корень дерева удобно держать в v = 1 с детьми 2*v и 2*v + 1.'
    ],
    traceCode: [
      'void build(int v, int tl, int tr) {',
      '    if (tl == tr) tree[v] = a[tl];',
      '    else {',
      '        int tm = (tl + tr) / 2;',
      '        build(2*v, tl, tm); build(2*v+1, tm+1, tr);',
      '        tree[v] = tree[2*v] + tree[2*v+1];',
      '    }',
      '}',
      'int query(int v, int tl, int tr, int l, int r) { ... }',
      'void update(int v, int tl, int tr, int pos, int val) { ... }'
    ],
    presets: [
      {
        id: 'classic',
        label: 'Массив [2, 5, 1, 4, 9, 3]',
        data: { array: [2, 5, 1, 4, 9, 3], queryL: 1, queryR: 4, updateIdx: 2, updateVal: 7 }
      },
      {
        id: 'power2',
        label: 'Степень двойки [1, 3, 5, 7]',
        data: { array: [1, 3, 5, 7], queryL: 0, queryR: 2, updateIdx: 1, updateVal: 6 }
      },
      {
        id: 'single',
        label: 'Точечный запрос [4, 8, 2, 6]',
        data: { array: [4, 8, 2, 6], queryL: 2, queryR: 2, updateIdx: 3, updateVal: 1 }
      }
    ],
    generateFrames({ array, queryL, queryR, updateIdx, updateVal }) {
      const a = [...array];
      const n = a.length;
      const nodeMap = new Map();
      const frames = [];

      function initStructure(v, tl, tr) {
        const node = { id: v, val: null, range: [tl, tr], left: null, right: null };
        nodeMap.set(v, node);
        if (tl < tr) {
          const tm = Math.floor((tl + tr) / 2);
          node.left = 2 * v;
          node.right = 2 * v + 1;
          initStructure(2 * v, tl, tm);
          initStructure(2 * v + 1, tm + 1, tr);
        }
      }
      initStructure(1, 0, n - 1);

      const snapshotNodes = () =>
        Array.from(nodeMap.values()).map((nd) => ({ ...nd, range: [...nd.range] }));

      // 1. Построение дерева
      function build(v, tl, tr) {
        if (tl === tr) {
          nodeMap.get(v).val = a[tl];
          frames.push({
            nodes: snapshotNodes(),
            rootId: 1,
            activeNodes: [v],
            updatedNodes: [],
            queryNodes: [],
            activeEdges: [],
            line: 1,
            vars: { этап: 'build', v, отрезок: `[${tl}, ${tr}]`, val: a[tl] },
            explanation: `Лист v=${v} для [${tl}, ${tr}] получает значение a[${tl}] = ${a[tl]}.`
          });
        } else {
          const tm = Math.floor((tl + tr) / 2);
          build(2 * v, tl, tm);
          build(2 * v + 1, tm + 1, tr);
          const sumVal = nodeMap.get(2 * v).val + nodeMap.get(2 * v + 1).val;
          nodeMap.get(v).val = sumVal;
          frames.push({
            nodes: snapshotNodes(),
            rootId: 1,
            activeNodes: [v],
            updatedNodes: [],
            queryNodes: [],
            activeEdges: [[v, 2 * v], [v, 2 * v + 1]],
            line: 5,
            vars: { этап: 'build', v, отрезок: `[${tl}, ${tr}]`, sum: sumVal },
            explanation: `Узел v=${v} [${tl}, ${tr}] = tree[${2 * v}] (${nodeMap.get(2 * v).val}) + tree[${2 * v + 1}] (${nodeMap.get(2 * v + 1).val}) = ${sumVal}.`
          });
        }
      }

      build(1, 0, n - 1);

      // 2. Запрос суммы на [queryL, queryR]
      const matchedNodes = [];
      function query(v, tl, tr, l, r, parent = null) {
        if (l > r) return 0;
        const edge = parent ? [[parent, v]] : [];

        if (l === tl && r === tr) {
          matchedNodes.push(v);
          frames.push({
            nodes: snapshotNodes(),
            rootId: 1,
            activeNodes: [v],
            updatedNodes: [],
            queryNodes: [...matchedNodes],
            activeEdges: edge,
            line: 8,
            vars: { этап: 'query', v, отрезок: `[${tl}, ${tr}]`, вклад: nodeMap.get(v).val },
            explanation: `Отрезок узла v=${v} [${tl}, ${tr}] полностью внутри запроса — берём значение ${nodeMap.get(v).val}.`
          });
          return nodeMap.get(v).val;
        }

        frames.push({
          nodes: snapshotNodes(),
          rootId: 1,
          activeNodes: [v],
          updatedNodes: [],
          queryNodes: [...matchedNodes],
          activeEdges: edge,
          line: 8,
          vars: { этап: 'query', v, отрезок: `[${tl}, ${tr}]`, запрос: `[${l}, ${r}]` },
          explanation: `Узел v=${v} [${tl}, ${tr}] частично пересекается с [${l}, ${r}], спускаемся в детей.`
        });

        const tm = Math.floor((tl + tr) / 2);
        const leftRes = query(2 * v, tl, tm, l, Math.min(r, tm), v);
        const rightRes = query(2 * v + 1, tm + 1, tr, Math.max(l, tm + 1), r, v);
        return leftRes + rightRes;
      }

      const qSum = query(1, 0, n - 1, queryL, queryR);
      frames.push({
        nodes: snapshotNodes(),
        rootId: 1,
        activeNodes: [],
        updatedNodes: [],
        queryNodes: [...matchedNodes],
        activeEdges: [],
        line: 8,
        vars: { этап: 'ответ query', запрос: `[${queryL}, ${queryR}]`, сумма: qSum },
        explanation: `Сумма на отрезке [${queryL}, ${queryR}] равна ${qSum}.`
      });

      // 3. Обновление элемента a[updateIdx] = updateVal
      const updatedPath = [];
      function update(v, tl, tr, pos, newVal) {
        if (tl === tr) {
          nodeMap.get(v).val = newVal;
          updatedPath.push(v);
          frames.push({
            nodes: snapshotNodes(),
            rootId: 1,
            activeNodes: [v],
            updatedNodes: [...updatedPath],
            queryNodes: [],
            activeEdges: [],
            line: 9,
            vars: { этап: 'update', pos, newVal, v },
            guess: {
              expected: v,
              prompt: `Какой лист дерева соответствует позиции pos = ${pos}? Кликните по узлу.`
            },
            explanation: `Дошли до листа v=${v} [${tl}, ${tr}]: обновляем значение на ${newVal}.`
          });
        } else {
          const tm = Math.floor((tl + tr) / 2);
          if (pos <= tm) update(2 * v, tl, tm, pos, newVal);
          else update(2 * v + 1, tm + 1, tr, pos, newVal);

          nodeMap.get(v).val = nodeMap.get(2 * v).val + nodeMap.get(2 * v + 1).val;
          updatedPath.push(v);
          frames.push({
            nodes: snapshotNodes(),
            rootId: 1,
            activeNodes: [v],
            updatedNodes: [...updatedPath],
            queryNodes: [],
            activeEdges: [[v, 2 * v], [v, 2 * v + 1]],
            line: 9,
            vars: { этап: 'update', v, отрезок: `[${tl}, ${tr}]`, новаяСумма: nodeMap.get(v).val },
            explanation: `Пересчитываем предка v=${v} [${tl}, ${tr}] = ${nodeMap.get(v).val}.`
          });
        }
      }

      update(1, 0, n - 1, updateIdx, updateVal);
      return frames;
    },
    code: {
      cpp: `#include <vector>
using namespace std;

struct SegTree {
    int n;
    vector<long long> tree;

    SegTree(const vector<int>& a) : n((int)a.size()), tree(4 * n, 0) {
        build(a, 1, 0, n - 1);
    }

    void build(const vector<int>& a, int v, int tl, int tr) {
        if (tl == tr) tree[v] = a[tl];
        else {
            int tm = (tl + tr) / 2;
            build(a, 2 * v, tl, tm);
            build(a, 2 * v + 1, tm + 1, tr);
            tree[v] = tree[2 * v] + tree[2 * v + 1];
        }
    }

    long long query(int v, int tl, int tr, int l, int r) {
        if (l > r) return 0;
        if (l == tl && r == tr) return tree[v];
        int tm = (tl + tr) / 2;
        return query(2 * v, tl, tm, l, min(r, tm)) +
               query(2 * v + 1, tm + 1, tr, max(l, tm + 1), r);
    }

    void update(int v, int tl, int tr, int pos, int val) {
        if (tl == tr) tree[v] = val;
        else {
            int tm = (tl + tr) / 2;
            if (pos <= tm) update(2 * v, tl, tm, pos, val);
            else update(2 * v + 1, tm + 1, tr, pos, val);
            tree[v] = tree[2 * v] + tree[2 * v + 1];
        }
    }
};`,
      python: `class SegTree:
    def __init__(self, a: list[int]):
        self.n = len(a)
        self.tree = [0] * (4 * self.n)
        self._build(a, 1, 0, self.n - 1)

    def _build(self, a: list[int], v: int, tl: int, tr: int) -> None:
        if tl == tr:
            self.tree[v] = a[tl]
        else:
            tm = (tl + tr) // 2
            self._build(a, 2 * v, tl, tm)
            self._build(a, 2 * v + 1, tm + 1, tr)
            self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]

    def query(self, v: int, tl: int, tr: int, l: int, r: int) -> int:
        if l > r:
            return 0
        if l == tl and r == tr:
            return self.tree[v]
        tm = (tl + tr) // 2
        return (self.query(2 * v, tl, tm, l, min(r, tm)) +
                self.query(2 * v + 1, tm + 1, tr, max(l, tm + 1), r))

    def update(self, v: int, tl: int, tr: int, pos: int, val: int) -> None:
        if tl == tr:
            self.tree[v] = val
        else:
            tm = (tl + tr) // 2
            if pos <= tm:
                self.update(2 * v, tl, tm, pos, val)
            else:
                self.update(2 * v + 1, tm + 1, tr, pos, val)
            self.tree[v] = self.tree[2 * v] + self.tree[2 * v + 1]`
    },
    problems: [
      {
        title: 'CF EDU: Segment Tree for the Sum',
        platform: 'Codeforces',
        difficulty: 'Easy',
        url: 'https://codeforces.com/edu/course/2/lesson/4/1/practice/contest/273169/problem/A'
      },
      {
        title: 'CSES: Dynamic Range Sum Queries',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1648'
      },
      {
        title: 'CSES: Dynamic Range Minimum Queries',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1649'
      }
    ],
    quiz: {
      snippet: `// Запрос суммы на [l, r] в дереве отрезков
// Сколько вершин дерева максимум посещается на каждом уровне?`,
      question: 'Почему запрос на отрезке [l, r] в дереве отрезков работает за O(log N), а не за O(N)?',
      options: [
        'На каждом из O(log N) уровней дерева посещается не более 4 вершин',
        'Запрос всегда спускается только в левого ребёнка',
        'Дерево имеет глубину O(1)',
        'Используется кэширование ответов'
      ],
      answer: 'На каждом из O(log N) уровней дерева посещается не более 4 вершин',
      explanation: 'Внутренние отрезки полностью накрываются запросом и сразу возвращают ответ, поэтому ветвление продолжается только на левой и правой границах [l, r].'
    }
  },
  {
    id: 'prefix-function',
    title: 'Префикс-функция (КМП) и Z-функция',
    category: 'Строки',
    difficulty: 'Средний',
    isStub: false,
    engine: 'string',
    customInputType: 'string-algo',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    summary:
      'Префикс-функция π[i] — длина наибольшего собственного суффикса подстроки s[0..i], совпадающего с её префиксом. Z-функция z[i] — длина наибольшего общего префикса строки s и её суффикса s[i..n-1]. Обе вычисляются за линейное время O(N) и позволяют находить все вхождения шаблона P в текст T через строку P + "#" + T.',
    pitfalls: [
      'Забытый символ-разделитель # (не встречающийся в P и T) при конкатенации P + "#" + T приводит к ложным значениям > |P|.',
      'В Z-функции важно не забывать обновлять границы самого правого Z-блока [l, r] только при i + z[i] - 1 > r.',
      'Индекс вхождения шаблона в текст при P + "#" + T: если π[i] == |P|, то начало вхождения в исходном T имеет индекс i - 2·|P|.'
    ],
    traceCode: [
      '// Префикс-функция π[i]:',
      'for (int i = 1; i < n; ++i) {',
      '    int j = pi[i - 1];',
      '    while (j > 0 && s[i] != s[j]) j = pi[j - 1];',
      '    if (s[i] == s[j]) ++j;',
      '    pi[i] = j;',
      '}',
      '// Z-функция: Z-блок [l, r]:',
      'for (int i = 1, l = 0, r = 0; i < n; ++i) {',
      '    if (i <= r) z[i] = min(r - i + 1, z[i - l]);',
      '    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];',
      '    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }',
      '}'
    ],
    presets: [
      { id: 'pi-classic', label: 'π-функция: abacabadabacabae', data: { text: 'abacabadabacabae', algoMode: 'pi' } },
      { id: 'kmp-search', label: 'КМП поиск: aba#abacaba', data: { text: 'aba#abacaba', algoMode: 'pi' } },
      { id: 'z-classic', label: 'Z-функция: aabxaabxcaabx', data: { text: 'aabxaabxcaabx', algoMode: 'z' } }
    ],
    generateFrames({ text, algoMode = 'pi' }) {
      const s = text;
      const n = s.length;
      const frames = [];
      const hashIdx = s.indexOf('#');

      if (algoMode === 'pi') {
        const pi = new Array(n).fill(null);
        pi[0] = 0;
        const matches = [];

        frames.push({
          mode: 'pi',
          text: s,
          values: [...pi],
          valuesLabel: 'π[i]',
          prefixRange: null,
          suffixRange: null,
          compareIndices: [],
          matchIndices: [],
          line: 0,
          vars: { режим: 'π-функция (КМП)', i: 0, 'π[0]': 0 },
          explanation: `Инициализация: π[0] = 0. Будем последовательно вычислять π[i] для i = 1..${n - 1}.`
        });

        for (let i = 1; i < n; i++) {
          let j = pi[i - 1];
          while (j > 0 && s[i] !== s[j]) {
            frames.push({
              mode: 'pi',
              text: s,
              values: [...pi],
              valuesLabel: 'π[i]',
              prefixRange: [0, j - 1],
              suffixRange: [i - j, i - 1],
              compareIndices: [i, j],
              matchIndices: [...matches],
              arc: { from: j, to: i },
              line: 3,
              vars: { i, j, 's[i]': s[i], 's[j]': s[j] },
              explanation: `Несовпадение s[${i}] ('${s[i]}') ≠ s[${j}] ('${s[j]}'): откатываемся j = π[${j - 1}] = ${pi[j - 1]}.`
            });
            j = pi[j - 1];
          }

          if (s[i] === s[j]) j++;
          pi[i] = j;
          if (hashIdx > 0 && j === hashIdx) matches.push(i);

          frames.push({
            mode: 'pi',
            text: s,
            values: [...pi],
            valuesLabel: 'π[i]',
            prefixRange: j > 0 ? [0, j - 1] : null,
            suffixRange: j > 0 ? [i - j + 1, i] : null,
            compareIndices: [i],
            matchIndices: [...matches],
            arc: j > 0 ? { from: j - 1, to: i } : null,
            line: 5,
            vars: { i, 'π[i]': j, 's[i]': s[i] },
            guess:
              i === Math.min(3, n - 1)
                ? {
                    expected: i,
                    prompt: `Кликните по текущему символу s[${i}], для которого вычислено π[${i}] = ${j}.`
                  }
                : undefined,
            explanation: `Устанавливаем π[${i}] = ${j}${hashIdx > 0 && j === hashIdx ? ' — найдено вхождение шаблона!' : '.'}`
          });
        }
        return frames;
      }

      // Z-функция
      const z = new Array(n).fill(null);
      z[0] = 0;
      let l = 0;
      let r = 0;
      const matches = [];

      frames.push({
        mode: 'z',
        text: s,
        values: [...z],
        valuesLabel: 'Z[i]',
        prefixRange: null,
        suffixRange: null,
        compareIndices: [],
        matchIndices: [],
        line: 8,
        vars: { режим: 'Z-функция', l: 0, r: 0 },
        explanation: `Инициализация Z-функции: Z[0] = 0, начальный Z-блок [l, r] = [0, 0].`
      });

      for (let i = 1; i < n; i++) {
        let zi = 0;
        if (i <= r) zi = Math.min(r - i + 1, z[i - l]);
        while (i + zi < n && s[zi] === s[i + zi]) zi++;
        z[i] = zi;
        if (i + zi - 1 > r) {
          l = i;
          r = i + zi - 1;
        }
        if (hashIdx > 0 && zi === hashIdx) matches.push(i);

        frames.push({
          mode: 'z',
          text: s,
          values: [...z],
          valuesLabel: 'Z[i]',
          prefixRange: zi > 0 ? [0, zi - 1] : null,
          suffixRange: zi > 0 ? [i, i + zi - 1] : null,
          compareIndices: [i],
          matchIndices: [...matches],
          arc: zi > 0 ? { from: 0, to: i } : null,
          line: 11,
          vars: { i, 'Z[i]': zi, '[l, r]': `[${l}, ${r}]` },
          explanation: `Позиция i = ${i}: Z[${i}] = ${zi}, текущий самый правый Z-блок [${l}, ${r}].`
        });
      }

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <string>
#include <algorithm>
using namespace std;

vector<int> prefix_function(const string& s) {
    int n = (int)s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; ++i) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) ++j;
        pi[i] = j;
    }
    return pi;
}

vector<int> z_function(const string& s) {
    int n = (int)s.size();
    vector<int> z(n, 0);
    for (int i = 1, l = 0, r = 0; i < n; ++i) {
        if (i <= r) z[i] = min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];
        if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
    }
    return z;
}`,
      python: `def prefix_function(s: str) -> list[int]:
    pi = [0] * len(s)
    for i in range(1, len(s)):
        j = pi[i - 1]
        while j > 0 and s[i] != s[j]:
            j = pi[j - 1]
        if s[i] == s[j]:
            j += 1
        pi[i] = j
    return pi

def z_function(s: str) -> list[int]:
    n = len(s)
    z = [0] * n
    l = r = 0
    for i in range(1, n):
        if i <= r:
            z[i] = min(r - i + 1, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] - 1 > r:
            l, r = i, i + z[i] - 1
    return z`
    },
    problems: [
      { title: 'CSES: String Matching', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1753' },
      { title: 'CSES: Finding Borders', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1732' },
      { title: 'CF #126B: Password', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/126/B' }
    ],
    quiz: {
      snippet: `// Строка S = P + "#" + T, вычислена π-функция`,
      question: 'Почему цикл while (j > 0 && s[i] != s[j]) j = pi[j - 1]; суммарно работает за O(N)?',
      options: [
        'Значение j увеличивается не более N раз (на 1 за итерацию i) и каждое срабатывание while уменьшает j ≥ 1',
        'Массив pi всегда отсортирован',
        'Цикл while выполняется не более 2 раз',
        'Символы сравниваются только с началом строки'
      ],
      answer: 'Значение j увеличивается не более N раз (на 1 за итерацию i) и каждое срабатывание while уменьшает j ≥ 1',
      explanation: 'Это классический амортизационный анализ: j растёт максимум на 1 на каждом шаге i и никогда не бывает отрицательным.'
    }
  },
  {
    id: 'fenwick-tree',
    title: 'Дерево Фенвика (Binary Indexed Tree)',
    category: 'Структуры данных',
    difficulty: 'Средний',
    isStub: false,
    engine: 'array',
    customInputType: 'fenwick',
    timeComplexity: 'O(log N) запрос и обновление',
    spaceComplexity: 'O(N)',
    summary:
      'Сверхкомпактная структура данных (BIT) для префиксных сумм и точечных обновлений за O(log N). В 1-индексации ячейка bit[i] отвечает за отрезок длиной i & -i (младший единичный бит числа i). Запрос sum(r) делает прыжки i -= i & -i, а обновление add(idx, delta) — i += i & -i.',
    pitfalls: [
      'Всегда используйте 1-индексацию для массива bit[1..n] (в 0-индексации формула i += i & -i зациклится при i = 0).',
      'Для суммы на отрезке [l, r] в 1-индексации считайте sum(r) - sum(l - 1).',
      'В отличие от дерева отрезков, классический Фенвик работает только для обратимых операций (+, XOR), но не для min/max на произвольном отрезке.'
    ],
    traceCode: [
      'void add(int i, int delta) {',
      '    for (; i <= n; i += i & -i) bit[i] += delta;',
      '}',
      'long long sum(int i) {',
      '    long long res = 0;',
      '    for (; i > 0; i -= i & -i) res += bit[i];',
      '    return res;',
      '}'
    ],
    presets: [
      {
        id: 'bit8',
        label: 'Массив [3, 2, -1, 6, 5, 4, -3, 3]',
        data: { array: [3, 2, -1, 6, 5, 4, -3, 3], queryR: 6, addIdx: 3, addDelta: 5 }
      },
      {
        id: 'bit6',
        label: 'Массив [1, 4, 2, 8, 5, 7]',
        data: { array: [1, 4, 2, 8, 5, 7], queryR: 5, addIdx: 2, addDelta: 3 }
      }
    ],
    generateFrames({ array, queryR, addIdx, addDelta }) {
      const a = [...array];
      const n = a.length;
      const bit = new Array(n).fill(0);
      const frames = [];

      // Построение BIT
      for (let i = 1; i <= n; i++) {
        for (let j = i; j <= n; j += j & -j) {
          bit[j - 1] += a[i - 1];
        }
      }

      frames.push({
        array: [...a],
        primaryLabel: 'Исходный массив a[1..n]:',
        secondaryArray: [...bit],
        secondaryLabel: 'Массив Фенвика bit[1..n] (построен):',
        secondaryHighlight: [],
        pointers: {},
        activeRange: null,
        line: 0,
        vars: { n, queryR, add: `a[${addIdx}] += ${addDelta}` },
        explanation: `Построено дерево Фенвика bit[1..${n}]. Каждый bit[i] хранит сумму на отрезке длины i & -i.`
      });

      // Запрос sum(queryR)
      let res = 0;
      let i = queryR;
      const visitedSum = [];
      while (i > 0) {
        const lsb = i & -i;
        res += bit[i - 1];
        visitedSum.push(i - 1);
        frames.push({
          array: [...a],
          primaryLabel: 'Исходный массив a[1..n]:',
          secondaryArray: [...bit],
          secondaryLabel: 'Массив Фенвика bit[1..n] — запрос sum(r):',
          secondaryHighlight: [...visitedSum],
          pointers: { i: i - 1 },
          activeRange: [i - lsb, i - 1],
          midIndex: i - 1,
          line: 5,
          vars: { i, 'i & -i': lsb, 'отрезок bit[i]': `[${i - lsb + 1}, ${i}]`, res },
          guess:
            i === queryR
              ? {
                  expected: i - 1,
                  prompt: `С какой ячейки начнётся запрос sum(${queryR})? Кликните по ячейке массива.`
                }
              : undefined,
          explanation: `sum(${queryR}): прибавляем bit[${i}] = ${bit[i - 1]} (отрезок [${i - lsb + 1}, ${i}]), сумма = ${res}. Следующий прыжок: ${i} - ${lsb} = ${i - lsb}.`
        });
        i -= lsb;
      }

      frames.push({
        array: [...a],
        primaryLabel: 'Исходный массив a[1..n]:',
        secondaryArray: [...bit],
        secondaryLabel: 'Массив Фенвика bit[1..n]:',
        secondaryHighlight: [...visitedSum],
        pointers: {},
        activeRange: [0, queryR - 1],
        line: 6,
        vars: { [`sum(${queryR})`]: res },
        explanation: `Запрос sum(${queryR}) завершён: сумма префикса [1..${queryR}] равна ${res}.`
      });

      // Обновление add(addIdx, addDelta)
      a[addIdx - 1] += addDelta;
      let j = addIdx;
      const visitedAdd = [];
      while (j <= n) {
        const lsb = j & -j;
        bit[j - 1] += addDelta;
        visitedAdd.push(j - 1);
        frames.push({
          array: [...a],
          primaryLabel: `Исходный массив a[1..n] (a[${addIdx}] += ${addDelta}):`,
          secondaryArray: [...bit],
          secondaryLabel: 'Массив Фенвика bit[1..n] — обновление add():',
          secondaryHighlight: [...visitedAdd],
          pointers: { i: j - 1 },
          activeRange: null,
          foundIndex: j - 1,
          line: 1,
          vars: { i: j, 'i & -i': lsb, delta: addDelta, 'новый bit[i]': bit[j - 1] },
          explanation: `add(${addIdx}, ${addDelta}): обновляем bit[${j}] → ${bit[j - 1]}. Следующий прыжок вверх: ${j} + ${lsb} = ${j + lsb}.`
        });
        j += lsb;
      }

      return frames;
    },
    code: {
      cpp: `#include <vector>
using namespace std;

struct Fenwick {
    int n;
    vector<long long> bit;
    Fenwick(int n) : n(n), bit(n + 1, 0) {}

    void add(int i, long long delta) {
        for (; i <= n; i += i & -i) bit[i] += delta;
    }

    long long sum(int i) const {
        long long res = 0;
        for (; i > 0; i -= i & -i) res += bit[i];
        return res;
    }

    long long range_sum(int l, int r) const {
        return sum(r) - sum(l - 1);
    }
};`,
      python: `class Fenwick:
    def __init__(self, n: int):
        self.n = n
        self.bit = [0] * (n + 1)

    def add(self, i: int, delta: int) -> None:
        while i <= self.n:
            self.bit[i] += delta
            i += i & -i

    def sum(self, i: int) -> int:
        res = 0
        while i > 0:
            res += self.bit[i]
            i -= i & -i
        return res

    def range_sum(self, l: int, r: int) -> int:
        return self.sum(r) - self.sum(l - 1)`
    },
    problems: [
      { title: 'CSES: Dynamic Range Sum Queries', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1648' },
      { title: 'CF #1354D: Multiset', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/1354/D' },
      { title: 'ACMP #1184: Дерево Фенвика', platform: 'ACMP', difficulty: 'Medium', url: 'https://acmp.ru/asp/do/index.asp?main=task&id_course=2&id_section=20&id_topic=46&id_problem=594' }
    ],
    quiz: {
      snippet: `for (; i > 0; i -= i & -i) res += bit[i];`,
      question: 'Что вычисляет побитовое выражение (i & -i) в дополнительном коде?',
      options: [
        'Младший единичный бит числа i (степень двойки)',
        'Старший единичный бит числа i',
        'Количество единиц в числе i',
        'Инверсию всех битов числа i'
      ],
      answer: 'Младший единичный бит числа i (степень двойки)',
      explanation: 'Отрицание -i равно (~i + 1), поэтому i & -i оставляет ровно один самый правый единичный бит.'
    }
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
  },
  {
    id: 'dfs',
    title: 'DFS: циклы и топологическая сортировка',
    category: 'Графы',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    summary:
      'Поиск в глубину (Depth-First Search) с раскраской вершин в 3 цвета: белый (не посещена), серый (в текущем стеке рекурсии) и чёрный (обработка завершена). Переход в серую вершину означает наличие цикла, а в ацикличном ориентированном графе (DAG) обратный порядок выхода tout даёт топологическую сортировку.',
    pitfalls: [
      'В ориентированном графе для поиска цикла недостаточно 2 цветов (visited/unvisited): ребро в уже завершённую (чёрную) вершину циклом не является.',
      'Если граф несвязный, запускайте DFS циклом по всем вершинам от 0 до n - 1, а не только от одной стартовой.',
      'На больших графах (V ~ 10^5) глубокая рекурсия может вызвать переполнение стека (Stack Overflow) — в Python увеличивайте sys.setrecursionlimit.'
    ],
    traceCode: [
      'void dfs(int u) {',
      '    color[u] = GRAY; // 1 — в стеке',
      '    for (int v : adj[u]) {',
      '        if (color[v] == WHITE) dfs(v);',
      '        else if (color[v] == GRAY) hasCycle = true;',
      '    }',
      '    color[u] = BLACK; // 2 — завершена',
      '    toposort.push_back(u);',
      '}'
    ],
    presets: [
      {
        id: 'dag',
        label: 'DAG (топологическая сортировка)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 85, y: 130 },
            { id: 1, x: 210, y: 55 },
            { id: 2, x: 210, y: 205 },
            { id: 3, x: 350, y: 55 },
            { id: 4, x: 350, y: 205 },
            { id: 5, x: 475, y: 130 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 1, to: 3 },
            { from: 2, to: 3 },
            { from: 2, to: 4 },
            { from: 3, to: 5 },
            { from: 4, to: 5 }
          ]
        }
      },
      {
        id: 'cycle',
        label: 'Граф с циклом (обратное ребро)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 95, y: 130 },
            { id: 1, x: 230, y: 55 },
            { id: 2, x: 380, y: 55 },
            { id: 3, x: 380, y: 205 },
            { id: 4, x: 230, y: 205 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 1 },
            { from: 0, to: 4 }
          ]
        }
      },
      {
        id: 'disconnected',
        label: 'Несвязный DAG (2 компоненты)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 95, y: 75 },
            { id: 1, x: 225, y: 75 },
            { id: 2, x: 160, y: 185 },
            { id: 3, x: 375, y: 75 },
            { id: 4, x: 475, y: 185 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 3, to: 4 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges, startNode }) {
      const adj = new Map();
      nodes.forEach((n) => adj.set(n.id, []));
      edges.forEach((e) => {
        if (adj.has(e.from) && adj.has(e.to)) {
          adj.get(e.from).push(e.to);
        }
      });
      adj.forEach((list) => list.sort((a, b) => a - b));

      const color = {};
      nodes.forEach((n) => {
        color[n.id] = 'white';
      });

      const frames = [];
      const callStack = [];
      const toutOrder = [];
      const treeEdges = [];
      const backEdges = [];
      let hasCycle = false;

      const snap = (extra = {}) => ({
        nodes,
        edges,
        directed: true,
        weighted: false,
        currentNode: null,
        nodeColors: { ...color },
        activeEdge: null,
        treeEdges: treeEdges.map((e) => [...e]),
        backEdges: backEdges.map((e) => [...e]),
        auxPanels: [
          {
            title: 'Стек вызовов (call stack)',
            value: `[${callStack.length ? callStack.join(' → ') : 'пусто'}]`,
            color: 'var(--info)'
          },
          {
            title: 'Порядок выхода (tout / reverse = toposort)',
            value: `[${toutOrder.length ? toutOrder.join(', ') : '—'}]`,
            color: 'var(--accent-light)'
          }
        ],
        ...extra
      });

      frames.push(
        snap({
          line: 0,
          vars: { start: startNode, hasCycle: 'false' },
          explanation: `Все вершины белые (не посещены). Запускаем DFS от стартовой вершины ${startNode}.`
        })
      );

      function dfs(u) {
        color[u] = 'gray';
        callStack.push(u);

        frames.push(
          snap({
            currentNode: u,
            line: 1,
            vars: { u, color: 'GRAY', stack: callStack.join('→') },
            explanation: `Входим в вершину u = ${u}: красим в СЕРЫЙ цвет и помещаем в стек рекурсии.`
          })
        );

        for (const v of adj.get(u) || []) {
          frames.push(
            snap({
              currentNode: u,
              activeEdge: [u, v],
              line: 2,
              vars: { u, v, 'color[v]': color[v].toUpperCase() },
              explanation: `Просматриваем ориентированное ребро (${u} → ${v}), цвет вершины ${v}: ${color[v].toUpperCase()}.`
            })
          );

          if (color[v] === 'white') {
            treeEdges.push([u, v]);
            frames.push(
              snap({
                currentNode: u,
                activeEdge: [u, v],
                line: 3,
                vars: { u, v, переход: `${u} → ${v}` },
                guess: {
                  expected: v,
                  prompt: `В какую непосещённую (белую) вершину перейдёт DFS из ${u}? Кликните по вершине.`
                },
                explanation: `Вершина ${v} белая — рекурсивно спускаемся в dfs(${v}).`
              })
            );
            dfs(v);
          } else if (color[v] === 'gray') {
            hasCycle = true;
            backEdges.push([u, v]);
            frames.push(
              snap({
                currentNode: u,
                activeEdge: [u, v],
                line: 4,
                vars: { u, v, hasCycle: 'true', ребро: `${u}→${v}` },
                explanation: `Обнаружено обратное ребро (${u} → ${v}) в СЕРУЮ вершину! В графе найден цикл.`
              })
            );
          }
        }

        color[u] = 'black';
        callStack.pop();
        toutOrder.push(u);

        frames.push(
          snap({
            currentNode: u,
            line: 7,
            vars: { u, color: 'BLACK', tout: `[${toutOrder.join(', ')}]` },
            explanation: `Все соседи вершины ${u} обработаны: красим в ЧЁРНЫЙ цвет и добавляем ${u} в tout.`
          })
        );
      }

      dfs(startNode);
      for (const n of nodes) {
        if (color[n.id] === 'white') dfs(n.id);
      }

      const topo = [...toutOrder].reverse();
      frames.push(
        snap({
          line: 8,
          vars: {
            hasCycle: String(hasCycle),
            toposort: hasCycle ? 'не существует (есть цикл)' : `[${topo.join(', ')}]`
          },
          explanation: hasCycle
            ? `Обход DFS завершён. Обнаружен цикл — топологическая сортировка невозможна.`
            : `Обход DFS завершён! Топологический порядок (развёрнутый tout): [${topo.join(', ')}].`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

enum Color { WHITE = 0, GRAY = 1, BLACK = 2 };

void dfs(int u, const vector<vector<int>>& adj, vector<int>& color,
         vector<int>& order, bool& hasCycle) {
    color[u] = GRAY;
    for (int v : adj[u]) {
        if (color[v] == WHITE) {
            dfs(v, adj, color, order, hasCycle);
        } else if (color[v] == GRAY) {
            hasCycle = true; // Найдено обратное ребро (цикл)
        }
    }
    color[u] = BLACK;
    order.push_back(u); // Для топологической сортировки затем делаем reverse(order)
}`,
      python: `WHITE, GRAY, BLACK = 0, 1, 2

def dfs(u: int, adj: list[list[int]], color: list[int],
        order: list[int]) -> bool:
    """Возвращает True, если в компоненте найден цикл."""
    color[u] = GRAY
    has_cycle = False
    for v in adj[u]:
        if color[v] == WHITE:
            if dfs(v, adj, color, order):
                has_cycle = True
        elif color[v] == GRAY:
            has_cycle = True  # Обратное ребро (цикл)
    color[u] = BLACK
    order.append(u)  # Разворот order[::-1] даст топологическую сортировку
    return has_cycle`
    },
    problems: [
      {
        title: 'CSES: Course Schedule (Топосорт)',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1679'
      },
      {
        title: 'CSES: Round Trip II (Цикл в орграфе)',
        platform: 'CSES',
        difficulty: 'Medium',
        url: 'https://cses.fi/problemset/task/1678'
      },
      {
        title: 'CF #510C: Fox And Names',
        platform: 'Codeforces',
        difficulty: 'Medium',
        url: 'https://codeforces.com/problemset/problem/510/C'
      }
    ],
    quiz: {
      snippet: `// В ориентированном графе при DFS встретилось ребро (u -> v):
// color[v] == BLACK (2)`,
      question: 'Что означает переход по ребру (u → v) в уже чёрную вершину v при обходе ориентированного графа?',
      options: [
        'Это прямое или перекрёстное ребро (цикл не обязательно есть)',
        'В графе гарантированно есть цикл',
        'Граф является неориентированным',
        'Ошибка в инициализации массива color'
      ],
      answer: 'Это прямое или перекрёстное ребро (цикл не обязательно есть)',
      explanation: 'Цикл в ориентированном графе образуется только при переходе в серую вершину (находящуюся сейчас в стеке рекурсии).'
    }
  },
  {
    id: 'kruskal',
    title: 'Алгоритм Крускала (MST)',
    category: 'Графы',
    difficulty: 'Средний',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V + E)',
    summary:
      'Жадный алгоритм построения минимального остовного дерева (Minimum Spanning Tree) во взвешенном неориентированном графе: все рёбра сортируются по возрастанию веса и поочерёдно добавляются в остов, если не образуют цикл (проверка через DSU).',
    pitfalls: [
      'Если граф несвязный, алгоритм построит минимальный остовный лес (число рёбер в MST окажется меньше V - 1).',
      'Не забудьте проверять find_set(u) != find_set(v) перед объединением — иначе остов перестанет быть деревом.',
      'Суммарный вес MST может превышать 2·10^9 — используйте long long.'
    ],
    traceCode: [
      'sort(edges.begin(), edges.end()); // по весу w',
      'for (auto [w, u, v] : edges) {',
      '    if (find_set(u) != find_set(v)) {',
      '        union_sets(u, v);',
      '        mstWeight += w;',
      '        mstEdges.push_back({u, v});',
      '    }',
      '}'
    ],
    presets: [
      {
        id: 'classic',
        label: 'Классический граф (6 вершин)',
        data: {
          nodes: [
            { id: 0, x: 85, y: 130 },
            { id: 1, x: 205, y: 55 },
            { id: 2, x: 205, y: 205 },
            { id: 3, x: 355, y: 55 },
            { id: 4, x: 355, y: 205 },
            { id: 5, x: 475, y: 130 }
          ],
          edges: [
            { from: 0, to: 1, weight: 4 },
            { from: 0, to: 2, weight: 2 },
            { from: 1, to: 2, weight: 1 },
            { from: 1, to: 3, weight: 5 },
            { from: 2, to: 4, weight: 7 },
            { from: 3, to: 4, weight: 3 },
            { from: 3, to: 5, weight: 6 },
            { from: 4, to: 5, weight: 2 }
          ]
        }
      },
      {
        id: 'equal',
        label: 'Граф с равными весами',
        data: {
          nodes: [
            { id: 0, x: 120, y: 65 },
            { id: 1, x: 320, y: 65 },
            { id: 2, x: 440, y: 175 },
            { id: 3, x: 220, y: 195 }
          ],
          edges: [
            { from: 0, to: 1, weight: 3 },
            { from: 1, to: 2, weight: 3 },
            { from: 2, to: 3, weight: 3 },
            { from: 3, to: 0, weight: 5 },
            { from: 0, to: 2, weight: 4 }
          ]
        }
      },
      {
        id: 'forest',
        label: 'Крайний случай: несвязный граф',
        data: {
          nodes: [
            { id: 0, x: 95, y: 75 },
            { id: 1, x: 225, y: 75 },
            { id: 2, x: 160, y: 190 },
            { id: 3, x: 375, y: 80 },
            { id: 4, x: 475, y: 185 }
          ],
          edges: [
            { from: 0, to: 1, weight: 2 },
            { from: 1, to: 2, weight: 4 },
            { from: 0, to: 2, weight: 5 },
            { from: 3, to: 4, weight: 3 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges }) {
      const sortedEdges = edges
        .map((e) => ({ from: e.from, to: e.to, weight: e.weight ?? 1 }))
        .sort((a, b) => a.weight - b.weight || a.from - b.from || a.to - b.to);

      const parent = {};
      nodes.forEach((n) => {
        parent[n.id] = n.id;
      });
      const findSet = (v) => (parent[v] === v ? v : (parent[v] = findSet(parent[v])));

      const mstEdges = [];
      let mstWeight = 0;
      const frames = [];

      const snap = (extra = {}) => ({
        nodes,
        edges: sortedEdges,
        weighted: true,
        currentNode: null,
        visitedNodes: [...new Set(mstEdges.flat())],
        activeEdge: null,
        treeEdges: mstEdges.map((e) => [...e]),
        auxPanels: [
          {
            title: 'Отсортированные рёбра (u-v: w)',
            value: sortedEdges.map((e) => `${e.from}-${e.to}:${e.weight}`).join('  '),
            color: 'var(--info)'
          },
          {
            title: 'DSU parent[] / Вес MST',
            value: `parent: [${nodes.map((n) => `${n.id}→${parent[n.id]}`).join(' ')}]  |  MST = ${mstWeight}`,
            color: 'var(--accent-light)'
          }
        ],
        ...extra
      });

      frames.push(
        snap({
          line: 0,
          vars: { edges: sortedEdges.length, mstWeight: 0 },
          explanation: `Сортируем все ${sortedEdges.length} рёбер по возрастанию веса. Инициализируем DSU (каждая вершина — отдельное множество).`
        })
      );

      for (const e of sortedEdges) {
        const ru = findSet(e.from);
        const rv = findSet(e.to);

        frames.push(
          snap({
            currentNode: e.from,
            activeEdge: [e.from, e.to],
            line: 2,
            vars: { u: e.from, v: e.to, w: e.weight, 'root(u)': ru, 'root(v)': rv },
            guess:
              ru !== rv
                ? {
                    expected: e.to,
                    prompt: `Ребро (${e.from}, ${e.to}) весом ${e.weight} соединяет разные компоненты. Кликните по вершине ${e.to}, чтобы включить его в MST.`
                  }
                : undefined,
            explanation: `Рассматриваем ребро (${e.from}, ${e.to}) весом ${e.weight}. Корни в DSU: root(${e.from})=${ru}, root(${e.to})=${rv}.`
          })
        );

        if (ru !== rv) {
          parent[rv] = ru;
          mstWeight += e.weight;
          mstEdges.push([e.from, e.to]);
          frames.push(
            snap({
              activeEdge: [e.from, e.to],
              line: 5,
              vars: { добавлено: `(${e.from}, ${e.to})`, w: e.weight, mstWeight },
              explanation: `Корни различны — цикла нет! Добавляем ребро (${e.from}, ${e.to}) в остов. Текущий вес MST = ${mstWeight}.`
            })
          );
        } else {
          frames.push(
            snap({
              activeEdge: [e.from, e.to],
              backEdges: [[e.from, e.to]],
              line: 2,
              vars: { пропущено: `(${e.from}, ${e.to})`, причина: 'образует цикл' },
              explanation: `Вершины ${e.from} и ${e.to} уже в одной компоненте (root=${ru}) — ребро пропущено.`
            })
          );
        }
      }

      frames.push(
        snap({
          line: 7,
          vars: { mstWeight, реберВMST: mstEdges.length },
          explanation: `Алгоритм Крускала завершён! Итоговый вес минимального остова: ${mstWeight} (рёбер: ${mstEdges.length}).`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, w;
    bool operator<(const Edge& other) const { return w < other.w; }
};

long long kruskal(int n, vector<Edge>& edges, vector<int>& parent) {
    sort(edges.begin(), edges.end());
    auto find_set = [&](auto& self, int v) -> int {
        return parent[v] == v ? v : parent[v] = self(self, parent[v]);
    };
    long long mstWeight = 0;
    for (const auto& e : edges) {
        int a = find_set(find_set, e.u), b = find_set(find_set, e.v);
        if (a != b) {
            parent[b] = a;
            mstWeight += e.w;
        }
    }
    return mstWeight;
}`,
      python: `def kruskal(n: int, edges: list[tuple[int, int, int]]) -> int:
    """edges: список кортежей (w, u, v). Возвращает вес MST."""
    edges.sort()
    parent = list(range(n))

    def find_set(v: int) -> int:
        if parent[v] != v:
            parent[v] = find_set(parent[v])
        return parent[v]

    mst_weight = 0
    for w, u, v in edges:
        ru, rv = find_set(u), find_set(v)
        if ru != rv:
            parent[rv] = ru
            mst_weight += w
    return mst_weight`
    },
    problems: [
      {
        title: 'CSES: Road Reparation',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1675'
      },
      {
        title: 'CF EDU: Spanning Tree',
        platform: 'Codeforces',
        difficulty: 'Easy',
        url: 'https://codeforces.com/edu/course/2/lesson/7/2/practice/contest/289391/problem/E'
      },
      {
        title: 'ACMP #1376: Минимальное остовное дерево',
        platform: 'ACMP',
        difficulty: 'Medium',
        url: 'https://acmp.ru/asp/do/index.asp?main=task&id_course=2&id_section=32&id_topic=55&id_problem=682'
      }
    ],
    quiz: {
      snippet: `sort(edges.begin(), edges.end()); // E рёбер
for (auto [w, u, v] : edges)
    if (find_set(u) != find_set(v)) union_sets(u, v);`,
      question: 'Какая операция определяет итоговую асимптотику O(E log E) алгоритма Крускала?',
      options: [
        'Сортировка списка всех рёбер по весу',
        'Операции union_sets в DSU',
        'Инициализация массива parent',
        'Подсчёт количества вершин'
      ],
      answer: 'Сортировка списка всех рёбер по весу',
      explanation: 'Сортировка E рёбер занимает O(E log E), тогда как E обращений к DSU со сжатием путей и ранговой эвристикой работают за почти линейное время O(E · α(V)).'
    }
  },
  {
    id: 'dsu',
    title: 'Система непересекающихся множеств (DSU)',
    category: 'Структуры данных',
    difficulty: 'Средний',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(α(N))',
    spaceComplexity: 'O(N)',
    summary:
      'Структура данных (Disjoint Set Union) для представления непересекающихся множеств в виде леса корневых деревьев. Эвристики сжатия путей (path compression) в find_set и объединения по рангу/размеру в union_sets дают амортизированное время O(α(N)) ≈ O(1) на операцию.',
    pitfalls: [
      'Без сжатия путей или ранговой эвристики дерево может выродиться в бамбук высоты N, что замедлит find_set до O(N).',
      'В union_sets(a, b) обязательно объединяйте корни a = find_set(a), b = find_set(b), а не исходные вершины.',
      'Сжатие путей меняет структуру дерева «на лету», поэтому его нельзя напрямую откатывать (для DSU с откатами используют только эвристику по размеру/рангу).'
    ],
    traceCode: [
      'int find_set(int v) {',
      '    if (v == parent[v]) return v;',
      '    return parent[v] = find_set(parent[v]); // сжатие',
      '}',
      'void union_sets(int a, int b) {',
      '    a = find_set(a); b = find_set(b);',
      '    if (a != b) {',
      '        if (rank[a] < rank[b]) swap(a, b);',
      '        parent[b] = a;',
      '        if (rank[a] == rank[b]) rank[a]++;',
      '    }',
      '}'
    ],
    presets: [
      {
        id: 'unions',
        label: 'Объединения и сжатие пути',
        data: {
          nodes: [
            { id: 0, x: 85, y: 130 },
            { id: 1, x: 185, y: 65 },
            { id: 2, x: 185, y: 195 },
            { id: 3, x: 330, y: 65 },
            { id: 4, x: 330, y: 195 },
            { id: 5, x: 465, y: 130 }
          ],
          edges: [],
          ops: [
            { type: 'union', a: 0, b: 1 },
            { type: 'union', a: 2, b: 3 },
            { type: 'union', a: 4, b: 5 },
            { type: 'union', a: 1, b: 3 },
            { type: 'union', a: 3, b: 5 },
            { type: 'find', v: 2 }
          ]
        }
      },
      {
        id: 'ranks',
        label: 'Объединение по рангу',
        data: {
          nodes: [
            { id: 0, x: 100, y: 80 },
            { id: 1, x: 220, y: 80 },
            { id: 2, x: 160, y: 190 },
            { id: 3, x: 360, y: 80 },
            { id: 4, x: 460, y: 185 }
          ],
          edges: [],
          ops: [
            { type: 'union', a: 0, b: 1 },
            { type: 'union', a: 0, b: 2 },
            { type: 'union', a: 3, b: 4 },
            { type: 'union', a: 4, b: 2 },
            { type: 'find', v: 4 }
          ]
        }
      },
      {
        id: 'same',
        label: 'Крайний случай: уже в одном множестве',
        data: {
          nodes: [
            { id: 0, x: 120, y: 130 },
            { id: 1, x: 270, y: 70 },
            { id: 2, x: 270, y: 190 },
            { id: 3, x: 420, y: 130 }
          ],
          edges: [],
          ops: [
            { type: 'union', a: 0, b: 1 },
            { type: 'union', a: 1, b: 2 },
            { type: 'union', a: 0, b: 2 },
            { type: 'union', a: 2, b: 3 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges = [], ops }) {
      const parent = {};
      const rank = {};
      nodes.forEach((n) => {
        parent[n.id] = n.id;
        rank[n.id] = 0;
      });

      // Если пользователь добавил рёбра кликом, превращаем их в операции union
      const operations =
        Array.isArray(ops) && ops.length > 0
          ? ops
          : edges.map((e) => ({ type: 'union', a: e.from, b: e.to }));

      const frames = [];

      const buildForestEdges = () =>
        nodes
          .filter((n) => parent[n.id] !== n.id)
          .map((n) => ({ from: n.id, to: parent[n.id] }));

      const snap = (extra = {}) => ({
        nodes,
        edges: buildForestEdges(),
        directed: true,
        weighted: false,
        currentNode: null,
        visitedNodes: nodes.filter((n) => parent[n.id] === n.id).map((n) => n.id),
        activeEdge: null,
        treeEdges: buildForestEdges().map((e) => [e.from, e.to]),
        auxPanels: [
          {
            title: 'Массив parent[] (вершина → родитель)',
            value: nodes.map((n) => `${n.id}→${parent[n.id]}`).join('  '),
            color: 'var(--info)'
          },
          {
            title: 'Массив rank[] (высота дерева)',
            value: nodes.map((n) => `${n.id}:${rank[n.id]}`).join('  '),
            color: 'var(--accent-light)'
          }
        ],
        ...extra
      });

      frames.push(
        snap({
          line: 0,
          vars: { множества: nodes.length },
          explanation: `Инициализация DSU: каждый элемент v является корнем собственного дерева (parent[v] = v, rank[v] = 0).`
        })
      );

      const findWithTrace = (v) => {
        if (parent[v] === v) return v;
        const root = findWithTrace(parent[v]);
        if (parent[v] !== root) {
          parent[v] = root;
          frames.push(
            snap({
              currentNode: v,
              activeEdge: [v, root],
              line: 2,
              vars: { v, 'new parent[v]': root },
              explanation: `Сжатие пути: переподвешиваем вершину ${v} напрямую к корню ${root}.`
            })
          );
        }
        return root;
      };

      for (const op of operations) {
        if (op.type === 'find') {
          frames.push(
            snap({
              currentNode: op.v,
              line: 0,
              vars: { операция: `find_set(${op.v})` },
              explanation: `Выполняем find_set(${op.v}) со сжатием путей на всём пути до корня.`
            })
          );
          const r = findWithTrace(op.v);
          frames.push(
            snap({
              currentNode: r,
              line: 1,
              vars: { элемент: op.v, корень: r },
              explanation: `Корень множества для ${op.v} — вершина ${r}.`
            })
          );
        } else {
          const ra = findWithTrace(op.a);
          const rb = findWithTrace(op.b);
          frames.push(
            snap({
              currentNode: ra,
              line: 5,
              vars: { операция: `union(${op.a}, ${op.b})`, 'root(a)': ra, 'root(b)': rb },
              guess:
                ra !== rb
                  ? {
                      expected: rank[ra] < rank[rb] ? rb : ra,
                      prompt: `Какая вершина станет новым корнем при объединении ${op.a} (root=${ra}, rank=${rank[ra]}) и ${op.b} (root=${rb}, rank=${rank[rb]})? Кликните по вершине.`
                    }
                  : undefined,
              explanation: `union_sets(${op.a}, ${op.b}): корни ra = ${ra} (rank=${rank[ra]}), rb = ${rb} (rank=${rank[rb]}).`
            })
          );

          if (ra !== rb) {
            let mainRoot = ra;
            let childRoot = rb;
            if (rank[mainRoot] < rank[childRoot]) {
              [mainRoot, childRoot] = [childRoot, mainRoot];
            }
            parent[childRoot] = mainRoot;
            if (rank[mainRoot] === rank[childRoot]) rank[mainRoot]++;

            frames.push(
              snap({
                currentNode: mainRoot,
                activeEdge: [childRoot, mainRoot],
                line: 8,
                vars: { новыйКорень: mainRoot, присоединён: childRoot, 'rank[root]': rank[mainRoot] },
                explanation: `Подвешиваем корень ${childRoot} к ${mainRoot} (parent[${childRoot}] = ${mainRoot}).`
              })
            );
          } else {
            frames.push(
              snap({
                currentNode: ra,
                line: 6,
                vars: { статус: 'уже в одном множестве', корень: ra },
                explanation: `Элементы ${op.a} и ${op.b} уже принадлежат одному множеству с корнем ${ra}.`
              })
            );
          }
        }
      }

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <utility>
using namespace std;

struct DSU {
    vector<int> parent, rnk;
    DSU(int n) : parent(n), rnk(n, 0) {
        for (int i = 0; i < n; ++i) parent[i] = i;
    }

    int find_set(int v) {
        if (v == parent[v]) return v;
        return parent[v] = find_set(parent[v]); // сжатие путей
    }

    void union_sets(int a, int b) {
        a = find_set(a);
        b = find_set(b);
        if (a != b) {
            if (rnk[a] < rnk[b]) swap(a, b); // объединение по рангу
            parent[b] = a;
            if (rnk[a] == rnk[b]) rnk[a]++;
        }
    }
};`,
      python: `class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find_set(self, v: int) -> int:
        if self.parent[v] != v:
            self.parent[v] = self.find_set(self.parent[v])  # сжатие путей
        return self.parent[v]

    def union_sets(self, a: int, b: int) -> None:
        a, b = self.find_set(a), self.find_set(b)
        if a != b:
            if self.rank[a] < self.rank[b]:
                a, b = b, a  # объединение по рангу
            self.parent[b] = a
            if self.rank[a] == self.rank[b]:
                self.rank[a] += 1`
    },
    problems: [
      {
        title: 'CF EDU: Disjoint Sets Union',
        platform: 'Codeforces',
        difficulty: 'Easy',
        url: 'https://codeforces.com/edu/course/2/lesson/7/1/practice/contest/289390/problem/A'
      },
      {
        title: 'CSES: Road Construction',
        platform: 'CSES',
        difficulty: 'Easy',
        url: 'https://cses.fi/problemset/task/1676'
      },
      {
        title: 'CF #25D: Roads not only in Berland',
        platform: 'Codeforces',
        difficulty: 'Medium',
        url: 'https://codeforces.com/problemset/problem/25/D'
      }
    ],
    quiz: {
      snippet: `int find_set(int v) {
    if (v == parent[v]) return v;
    return parent[v] = find_set(parent[v]);
}`,
      question: 'Какова амортизированная сложность одной операции в DSU при совместном использовании сжатия путей и ранговой эвристики?',
      options: ['O(α(N))', 'O(log² N)', 'O(√N)', 'O(N)'],
      answer: 'O(α(N))',
      explanation: 'α(N) — обратная функция Аккермана, которая для любых практических значений N (до 10^80) не превышает 4–5.'
    }
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
  },
  {
    id: 'assignment-hungarian',
    title: 'Задача о назначениях (Венгерский алгоритм)',
    category: 'Графы',
    difficulty: 'Продвинутый',
    isStub: false,
    engine: 'grid',
    customInputType: 'matrix',
    timeComplexity: 'O(n³)',
    spaceComplexity: 'O(n²)',
    summary:
      'Постановка: дана квадратная матрица стоимостей C = (c_{ij}) размера n × n (назначение n работников на n задач). Требуется выбрать перестановку π ∈ S_n, минимизирующую суммарную стоимость ∑ c_{i, π(i)} (паросочетание минимального веса в полном двудольном графе). Венгерский алгоритм использует редукцию строк/столбцов и метод потенциалов Джонсона (u_i + v_j ≤ c_{ij}), что эквивалентно поиску потока минимальной стоимости (Min-Cost Max-Flow) за O(n³).',
    pitfalls: [
      'Прямоугольная матрица (n ≠ m): дополните недостающие строки или столбцы нулями (или фиктивными значениями) до квадрата max(n, m) × max(n, m).',
      'Задача максимизации: замените все элементы матрицы на -c_{ij} (или M - c_{ij}) и запустите стандартную минимизацию.',
      'В классической реализации за O(n³) используется 1-индексация (индекс 0 служит фиктивным столбцом-истоком для увеличивающей цепи).'
    ],
    traceCode: [
      '// 1. Редукция строк: вычитаем минимум каждой строки',
      '// 2. Редукция столбцов: вычитаем минимум каждого столбца',
      'vector<int> u(n + 1), v(m + 1), p(m + 1), way(m + 1);',
      'for (int i = 1; i <= n; ++i) {',
      '    p[0] = i; int j0 = 0;',
      '    vector<int> minv(m + 1, INF); vector<bool> used(m + 1, false);',
      '    do { ... // обновление потенциалов u, v на delta } while (p[j0] != 0);',
      '    do { int j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);',
      '}'
    ],
    presets: [
      {
        id: 'm3x3',
        label: 'Матрица 3 × 3',
        data: {
          matrix: [
            [4, 1, 3],
            [2, 0, 5],
            [3, 2, 2]
          ]
        }
      },
      {
        id: 'm4x4',
        label: 'Матрица 4 × 4',
        data: {
          matrix: [
            [8, 4, 7, 3],
            [5, 2, 3, 6],
            [9, 4, 8, 5],
            [7, 6, 4, 2]
          ]
        }
      }
    ],
    generateFrames({ matrix }) {
      const n = matrix.length;
      const a = matrix.map((row) => [...row]);
      const rowHeaders = Array.from({ length: n }, (_, i) => `R${i + 1}`);
      const colHeaders = Array.from({ length: n }, (_, j) => `C${j + 1}`);
      const clone = (m) => m.map((r) => [...r]);
      const frames = [];

      frames.push({
        grid: clone(a),
        rowHeaders,
        colHeaders,
        currentCell: null,
        depCells: [],
        pathCells: [],
        arrows: [],
        line: 0,
        vars: { n, этап: 'Исходная матрица' },
        explanation: `Исходная матрица стоимостей ${n} × ${n}. Начинаем редукцию строк и столбцов.`
      });

      // Шаг 1: редукция строк
      for (let i = 0; i < n; i++) {
        const minRow = Math.min(...a[i]);
        const rowCells = Array.from({ length: n }, (_, j) => [i, j]);
        for (let j = 0; j < n; j++) a[i][j] -= minRow;
        frames.push({
          grid: clone(a),
          rowHeaders,
          colHeaders,
          currentCell: null,
          depCells: rowCells,
          pathCells: [],
          arrows: [],
          line: 0,
          vars: { строка: `R${i + 1}`, minRow },
          explanation: `Редукция строки R${i + 1}: вычитаем минимум ${minRow} из каждого элемента строки.`
        });
      }

      // Шаг 2: редукция столбцов
      for (let j = 0; j < n; j++) {
        let minCol = Infinity;
        for (let i = 0; i < n; i++) minCol = Math.min(minCol, a[i][j]);
        const colCells = Array.from({ length: n }, (_, i) => [i, j]);
        for (let i = 0; i < n; i++) a[i][j] -= minCol;
        frames.push({
          grid: clone(a),
          rowHeaders,
          colHeaders,
          currentCell: null,
          depCells: colCells,
          pathCells: [],
          arrows: [],
          line: 1,
          vars: { столбец: `C${j + 1}`, minCol },
          explanation: `Редукция столбца C${j + 1}: вычитаем минимум ${minCol} из каждого элемента столбца.`
        });
      }

      // Точный венгерский алгоритм O(n^3) для нахождения оптимального назначения
      const INF = 1e9;
      const u = new Array(n + 1).fill(0);
      const v = new Array(n + 1).fill(0);
      const p = new Array(n + 1).fill(0);
      const way = new Array(n + 1).fill(0);

      for (let i = 1; i <= n; i++) {
        p[0] = i;
        let j0 = 0;
        const minv = new Array(n + 1).fill(INF);
        const used = new Array(n + 1).fill(false);
        do {
          used[j0] = true;
          const i0 = p[j0];
          let delta = INF;
          let j1 = 0;
          for (let j = 1; j <= n; j++) {
            if (!used[j]) {
              const cur = matrix[i0 - 1][j - 1] - u[i0] - v[j];
              if (cur < minv[j]) {
                minv[j] = cur;
                way[j] = j0;
              }
              if (minv[j] < delta) {
                delta = minv[j];
                j1 = j;
              }
            }
          }
          for (let j = 0; j <= n; j++) {
            if (used[j]) {
              u[p[j]] += delta;
              v[j] -= delta;
            } else {
              minv[j] -= delta;
            }
          }
          j0 = j1;
        } while (p[j0] !== 0);
        do {
          const j1 = way[j0];
          p[j0] = p[j1];
          j0 = j1;
        } while (j0 !== 0);
      }

      const assignment = new Array(n).fill(-1);
      for (let j = 1; j <= n; j++) {
        if (p[j] >= 1 && p[j] <= n) assignment[p[j] - 1] = j - 1;
      }

      const zeroCells = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (a[i][j] === 0) zeroCells.push([i, j]);
        }
      }

      frames.push({
        grid: clone(a),
        rowHeaders,
        colHeaders,
        currentCell: null,
        depCells: zeroCells,
        pathCells: [],
        arrows: [],
        line: 6,
        vars: { нулейВМатрице: zeroCells.length, этап: 'Поиск независимых нулей' },
        guess: {
          expected: `0,${assignment[0]}`,
          prompt: `Какая ячейка в первой строке R1 войдёт в оптимальное назначение? Кликните по ячейке.`
        },
        explanation: `Покрываем нули минимальным числом линий и находим независимое паросочетание из ${n} нулей.`
      });

      const optCells = assignment.map((col, row) => [row, col]);
      const totalCost = optCells.reduce((acc, [r, c]) => acc + matrix[r][c], 0);

      frames.push({
        grid: clone(matrix),
        rowHeaders,
        colHeaders,
        currentCell: null,
        depCells: [],
        pathCells: optCells,
        arrows: [],
        line: 8,
        vars: {
          назначение: optCells.map(([r, c]) => `R${r + 1}→C${c + 1}`).join(', '),
          minCost: totalCost
        },
        explanation: `Оптимальное назначение найдено: ${optCells.map(([r, c]) => `(${r + 1},${c + 1}:${matrix[r][c]})`).join(' + ')} = ${totalCost}.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

// Венгерский алгоритм за O(n^3), 1-индексация матрицы a[1..n][1..m]
pair<long long, vector<int>> hungarian(const vector<vector<long long>>& a) {
    const long long INF = 1e18;
    int n = (int)a.size() - 1;
    int m = (int)a[0].size() - 1;
    vector<long long> u(n + 1), v(m + 1);
    vector<int> p(m + 1), way(m + 1);

    for (int i = 1; i <= n; ++i) {
        p[0] = i;
        int j0 = 0;
        vector<long long> minv(m + 1, INF);
        vector<char> used(m + 1, false);
        do {
            used[j0] = true;
            int i0 = p[j0], j1 = 0;
            long long delta = INF;
            for (int j = 1; j <= m; ++j) {
                if (!used[j]) {
                    long long cur = a[i0][j] - u[i0] - v[j];
                    if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                    if (minv[j] < delta) { delta = minv[j]; j1 = j; }
                }
            }
            for (int j = 0; j <= m; ++j) {
                if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                else minv[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] != 0);
        do {
            int j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0);
    }

    vector<int> ans(n + 1);
    for (int j = 1; j <= m; ++j) ans[p[j]] = j;
    return {-v[0], ans};
}`,
      python: `def hungarian(a: list[list[int]]) -> tuple[int, list[int]]:
    """Венгерский алгоритм за O(n^3) для 0-индексированной матрицы n x n."""
    INF = 10**18
    n = len(a)
    u = [0] * (n + 1)
    v = [0] * (n + 1)
    p = [0] * (n + 1)
    way = [0] * (n + 1)

    for i in range(1, n + 1):
        p[0] = i
        j0 = 0
        minv = [INF] * (n + 1)
        used = [False] * (n + 1)
        while True:
            used[j0] = True
            i0 = p[j0]
            delta, j1 = INF, 0
            for j in range(1, n + 1):
                if not used[j]:
                    cur = a[i0 - 1][j - 1] - u[i0] - v[j]
                    if cur < minv[j]:
                        minv[j] = cur
                        way[j] = j0
                    if minv[j] < delta:
                        delta = minv[j]
                        j1 = j
            for j in range(n + 1):
                if used[j]:
                    u[p[j]] += delta
                    v[j] -= delta
                else:
                    minv[j] -= delta
            j0 = j1
            if p[j0] == 0:
                break
        while True:
            j1 = way[j0]
            p[j0] = p[j1]
            j0 = j1
            if j0 == 0:
                break

    ans = [0] * n
    for j in range(1, n + 1):
        ans[p[j] - 1] = j - 1
    return -v[0], ans`
    },
    problems: [
      {
        title: 'CSES: Task Assignment',
        platform: 'CSES',
        difficulty: 'Medium',
        url: 'https://cses.fi/problemset/task/2129'
      },
      {
        title: 'CF #277E: Binary Tree on Plane (Min-Cost)',
        platform: 'Codeforces',
        difficulty: 'Hard',
        url: 'https://codeforces.com/problemset/problem/277/E'
      },
      {
        title: 'ACMP #396: Задача о назначениях',
        platform: 'ACMP',
        difficulty: 'Hard',
        url: 'https://acmp.ru/asp/do/index.asp?main=task&id_course=2&id_section=21&id_topic=49&id_problem=639'
      }
    ],
    quiz: {
      snippet: `// Требуется найти назначение МАКСИМАЛЬНОЙ суммарной стоимости
// в матрице c[i][j] с помощью венгерского алгоритма минимизации.`,
      question: 'Как свести задачу максимизации суммы назначений к стандартному венгерскому алгоритму минимизации?',
      options: [
        'Заменить каждый элемент c[i][j] на -c[i][j] (или M - c[i][j])',
        'Взять обратные величины 1 / c[i][j]',
        'Отсортировать строки по убыванию',
        'Венгерский алгоритм не умеет решать задачу максимизации'
      ],
      answer: 'Заменить каждый элемент c[i][j] на -c[i][j] (или M - c[i][j])',
      explanation: 'Максимизация ∑ c[i, π(i)] эквивалентна минимизации ∑ (-c[i, π(i)]), а метод потенциалов корректно работает и с отрицательными числами.'
    }
  },
  {
    id: 'sieve',
    title: 'Решето Эратосфена',
    category: 'Теория чисел и математика',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'math',
    customInputType: 'sieve',
    timeComplexity: 'O(N log log N)',
    spaceComplexity: 'O(N)',
    summary:
      'Классический алгоритм нахождения всех простых чисел до N. Проходя числа p от 2 до √N, если p не вычеркнуто, оно простое — вычёркиваем все его кратные, начиная с p² (так как меньшие кратные p·k при k < p уже вычеркнуты делителями числа k).',
    pitfalls: [
      'Переполнение i * i при i > 46340 (для N ~ 10^9): используйте long long (1LL * i * i <= n) или условие i <= n / i.',
      'Числа 0 и 1 не являются простыми — обязательно помечайте isPrime[0] = isPrime[1] = false.',
      'Для N > 10^7 используйте побитовую упаковку (bitset) или блочное решето для экономии памяти.'
    ],
    traceCode: [
      'vector<bool> isPrime(n + 1, true);',
      'isPrime[0] = isPrime[1] = false;',
      'for (int i = 2; 1LL * i * i <= n; ++i) {',
      '    if (isPrime[i]) {',
      '        for (int j = i * i; j <= n; j += i) {',
      '            isPrime[j] = false;',
      '        }',
      '    }',
      '}'
    ],
    presets: [
      { id: 'n30', label: 'N = 30', data: { n: 30 } },
      { id: 'n50', label: 'N = 50', data: { n: 50 } },
      { id: 'n100', label: 'N = 100', data: { n: 100 } }
    ],
    generateFrames({ n }) {
      const isPrime = new Array(n + 1).fill(true);
      isPrime[0] = isPrime[1] = false;
      const composites = new Set();
      const primes = new Set();
      const frames = [];

      frames.push({
        mode: 'sieve',
        n,
        currentPrime: null,
        currentMultiple: null,
        composites: [],
        primes: [],
        line: 1,
        vars: { n, найденоПростых: 0 },
        explanation: `Инициализируем числа от 2 до ${n} как потенциально простые.`
      });

      for (let i = 2; i * i <= n; i++) {
        if (!isPrime[i]) continue;
        primes.add(i);

        frames.push({
          mode: 'sieve',
          n,
          currentPrime: i,
          currentMultiple: null,
          composites: [...composites],
          primes: [...primes],
          line: 3,
          vars: { p: i, 'p²': i * i, найденоПростых: primes.size },
          guess: {
            expected: i * i,
            prompt: `С какого первого составного числа начнётся вычёркивание для простого p = ${i}? Кликните по ячейке.`
          },
          explanation: `Число p = ${i} простое! Начинаем вычёркивать его кратные с p² = ${i * i}.`
        });

        for (let j = i * i; j <= n; j += i) {
          isPrime[j] = false;
          composites.add(j);
          frames.push({
            mode: 'sieve',
            n,
            currentPrime: i,
            currentMultiple: j,
            composites: [...composites],
            primes: [...primes],
            line: 5,
            vars: { p: i, вычёркиваем: j, шаг: `+${i}` },
            explanation: `Вычёркиваем составное число ${j} (делится на ${i}).`
          });
        }
      }

      for (let i = 2; i <= n; i++) {
        if (isPrime[i]) primes.add(i);
      }

      frames.push({
        mode: 'sieve',
        n,
        currentPrime: null,
        currentMultiple: null,
        composites: [...composites],
        primes: [...primes],
        line: 8,
        vars: { n, всегоПростых: primes.size },
        explanation: `Просеивание завершено! На отрезке [2, ${n}] найдено ${primes.size} простых чисел.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
using namespace std;

vector<bool> sieve(int n) {
    vector<bool> isPrime(n + 1, true);
    if (n >= 0) isPrime[0] = false;
    if (n >= 1) isPrime[1] = false;
    for (int i = 2; 1LL * i * i <= n; ++i) {
        if (isPrime[i]) {
            for (int j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }
    return isPrime;
}`,
      python: `def sieve(n: int) -> list[bool]:
    """Решето Эратосфена за O(N log log N)."""
    is_prime = [True] * (n + 1)
    if n >= 0: is_prime[0] = False
    if n >= 1: is_prime[1] = False
    i = 2
    while i * i <= n:
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
        i += 1
    return is_prime`
    },
    problems: [
      { title: 'CSES: Counting Divisors', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1713' },
      { title: 'CF #26A: Almost Prime', platform: 'Codeforces', difficulty: 'Easy', url: 'https://codeforces.com/problemset/problem/26/A' },
      { title: 'ACMP #349: Простые числа', platform: 'ACMP', difficulty: 'Easy', url: 'https://acmp.ru/index.asp?main=task&id_task=349' }
    ],
    quiz: {
      snippet: `for (int i = 2; i * i <= n; ++i)
    if (isPrime[i])
        for (int j = i * i; j <= n; j += i) isPrime[j] = false;`,
      question: 'Какова точная асимптотика решета Эратосфена по времени?',
      options: ['O(N log log N)', 'O(N log N)', 'O(N √N)', 'O(N²)'],
      answer: 'O(N log log N)',
      explanation: 'Сумма обратных простых ∑ (1/p) для p ≤ N асимптотически равна ln(ln N), что даёт O(N log log N).'
    }
  },
  {
    id: 'binpow',
    title: 'Бинарное возведение в степень (aⁿ mod m)',
    category: 'Теория чисел и математика',
    difficulty: 'Базовый',
    isStub: false,
    engine: 'math',
    customInputType: 'binpow',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    summary:
      'Быстрое вычисление aⁿ mod m за O(log n) умножений путём разложения показателя n в двоичную систему: если младший бит n равен 1, умножаем ответ res на текущую степень основания a, затем возводим a в квадрат и сдвигаем n вправо (n >>= 1).',
    pitfalls: [
      'Переполнение при умножении (res * a) % m: в C++ при m > 2^31 используйте long long (и __int128 при m ~ 10^18).',
      'Случай n = 0 или m = 1: при m = 1 даже a⁰ mod 1 должно возвращать 0, поэтому инициализируйте res = 1 % m.',
      'Отрицательное основание a: в C++ остаток от деления отрицателен, приводите a = (a % m + m) % m.'
    ],
    traceCode: [
      'long long res = 1 % m; a %= m;',
      'while (n > 0) {',
      '    if (n & 1) res = (res * a) % m;',
      '    a = (a * a) % m;',
      '    n >>= 1;',
      '}',
      'return res;'
    ],
    presets: [
      { id: 'p1', label: '3¹³ mod 100', data: { a: 3, n: 13, m: 100 } },
      { id: 'p2', label: '2¹⁰ mod 1000', data: { a: 2, n: 10, m: 1000 } },
      { id: 'p3', label: 'Крайний случай: 5⁰ mod 7', data: { a: 5, n: 0, m: 7 } }
    ],
    generateFrames({ a, n, m }) {
      let base = ((a % m) + m) % m;
      let exp = n;
      let res = 1 % m;
      const rows = [];
      const frames = [];

      const cols = ['Шаг', 'n (dec)', 'n (bin)', 'Бит n&1', 'a (mod m)', 'res'];
      rows.push(['Иниц.', exp, exp.toString(2), '—', base, res]);

      frames.push({
        mode: 'table',
        formula: `res = 1 % ${m} = ${res},  a = ${a} % ${m} = ${base}`,
        columns: cols,
        rows: rows.map((r) => [...r]),
        activeRow: 0,
        line: 0,
        vars: { a: base, n: exp, m, res },
        explanation: `Начальное состояние: res = ${res}, a = ${base}, степень n = ${exp} (${exp.toString(2)}₂).`
      });

      let step = 1;
      while (exp > 0) {
        const bit = exp & 1;
        let formula = `n = ${exp} (${exp.toString(2)}₂), бит = ${bit}: `;
        if (bit === 1) {
          res = (res * base) % m;
          formula += `res = (res · ${base}) % ${m} = ${res}; `;
        } else {
          formula += `res без изменений (${res}); `;
        }
        const nextBase = (base * base) % m;
        const nextExp = exp >> 1;
        formula += `a = ${base}² % ${m} = ${nextBase}, n >>= 1 → ${nextExp}`;

        rows.push([step, exp, exp.toString(2), bit, `${base} → ${nextBase}`, res]);
        frames.push({
          mode: 'table',
          formula,
          columns: cols,
          rows: rows.map((r) => [...r]),
          activeRow: rows.length - 1,
          line: bit === 1 ? 2 : 3,
          vars: { шаг: step, 'n & 1': bit, a: nextBase, n: nextExp, res },
          explanation: `Шаг ${step}: младший бит n равен ${bit}. ${bit ? `Умножаем res на ${base} → ${res}.` : 'Пропускаем умножение res.'} Возводим основание в квадрат → ${nextBase}.`
        });

        base = nextBase;
        exp = nextExp;
        step++;
      }

      frames.push({
        mode: 'table',
        formula: `Ответ: ${a}^${n} mod ${m} = ${res}`,
        columns: cols,
        rows: rows.map((r) => [...r]),
        activeRow: rows.length - 1,
        line: 6,
        vars: { ответ: res },
        explanation: `Степень n достигла 0. Итоговый ответ: ${res}.`
      });

      return frames;
    },
    code: {
      cpp: `long long binpow(long long a, long long n, long long m) {
    long long res = 1 % m;
    a = (a % m + m) % m;
    while (n > 0) {
        if (n & 1) res = (res * a) % m;
        a = (a * a) % m;
        n >>= 1;
    }
    return res;
}`,
      python: `def binpow(a: int, n: int, m: int) -> int:
    """Бинарное возведение в степень за O(log n)."""
    res = 1 % m
    a %= m
    while n > 0:
        if n & 1:
            res = (res * a) % m
        a = (a * a) % m
        n >>= 1
    return res`
    },
    problems: [
      { title: 'CSES: Exponentiation', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1095' },
      { title: 'CSES: Exponentiation II', platform: 'CSES', difficulty: 'Medium', url: 'https://cses.fi/problemset/task/1712' },
      { title: 'CF #630I: Parking Lot', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/630/I' }
    ],
    quiz: {
      snippet: `// Вычисление a^n mod m, где m = 10^9 + 7 (простое)`,
      question: 'Как с помощью binpow найти обратный элемент a⁻¹ mod m для простого m (по малой теореме Ферма)?',
      options: ['binpow(a, m - 2, m)', 'binpow(a, m - 1, m)', 'binpow(a, m, m)', 'binpow(a, m / 2, m)'],
      answer: 'binpow(a, m - 2, m)',
      explanation: 'По малой теореме Ферма a^(m-1) ≡ 1 (mod m), откуда a⁻¹ ≡ a^(m-2) (mod m).'
    }
  },
  {
    id: 'ext-gcd',
    title: 'Расширенный алгоритм Евклида',
    category: 'Теория чисел и математика',
    difficulty: 'Средний',
    isStub: false,
    engine: 'math',
    customInputType: 'extgcd',
    timeComplexity: 'O(log(min(a, b)))',
    spaceComplexity: 'O(log(min(a, b)))',
    summary:
      'Помимо нахождения наибольшего общего делителя gcd(a, b), расширенный алгоритм Евклида находит целые коэффициенты Безу x и y такие, что a·x + b·y = gcd(a, b). Используется для решения диофантовых уравнений и поиска обратного элемента по непростому модулю.',
    pitfalls: [
      'Обратный элемент a⁻¹ mod m существует тогда и только тогда, когда gcd(a, m) == 1.',
      'Коэффициент x может получиться отрицательным — при поиске обратного по модулю приведите его: x = (x % m + m) % m.',
      'Следите за переполнением int при вычислении x1 - (a / b) * y1.'
    ],
    traceCode: [
      'int extgcd(int a, int b, int& x, int& y) {',
      '    if (b == 0) { x = 1; y = 0; return a; }',
      '    int x1, y1;',
      '    int g = extgcd(b, a % b, x1, y1);',
      '    x = y1;',
      '    y = x1 - (a / b) * y1;',
      '    return g;',
      '}'
    ],
    presets: [
      { id: 'p30_18', label: 'a = 30, b = 18', data: { a: 30, b: 18 } },
      { id: 'p55_34', label: 'a = 55, b = 34 (взаимно простые)', data: { a: 55, b: 34 } },
      { id: 'p17_0', label: 'Крайний случай: b = 0', data: { a: 17, b: 0 } }
    ],
    generateFrames({ a, b }) {
      const frames = [];
      const cols = ['Этап', 'a', 'b', 'a / b', 'x', 'y', 'gcd'];
      const rows = [];

      function trace(curA, curB, depth) {
        if (curB === 0) {
          rows.push([`База (уровень ${depth})`, curA, 0, '—', 1, 0, curA]);
          frames.push({
            mode: 'table',
            formula: `База рекурсии (b = 0): gcd = ${curA}, x = 1, y = 0`,
            columns: cols,
            rows: rows.map((r) => [...r]),
            activeRow: rows.length - 1,
            line: 1,
            vars: { a: curA, b: 0, x: 1, y: 0, gcd: curA },
            explanation: `Достигли b = 0: возвращаем gcd = ${curA}, коэффициенты Безу x = 1, y = 0.`
          });
          return { g: curA, x: 1, y: 0 };
        }

        const q = Math.floor(curA / curB);
        rows.push([`Спуск (уровень ${depth})`, curA, curB, q, '?', '?', '?']);
        frames.push({
          mode: 'table',
          formula: `extgcd(${curA}, ${curB}) → вызываем extgcd(${curB}, ${curA % curB})`,
          columns: cols,
          rows: rows.map((r) => [...r]),
          activeRow: rows.length - 1,
          line: 3,
          vars: { a: curA, b: curB, 'a % b': curA % curB },
          explanation: `Спуск: ${curA} = ${q} · ${curB} + ${curA % curB}. Переходим к (${curB}, ${curA % curB}).`
        });

        const { g, x: x1, y: y1 } = trace(curB, curA % curB, depth + 1);
        const x = y1;
        const y = x1 - q * y1;

        rows.push([`Подъём (уровень ${depth})`, curA, curB, q, x, y, g]);
        frames.push({
          mode: 'table',
          formula: `x = y1 = ${x},  y = x1 - ⌊${curA}/${curB}⌋·y1 = ${x1} - ${q}·${y1} = ${y}`,
          columns: cols,
          rows: rows.map((r) => [...r]),
          activeRow: rows.length - 1,
          line: 5,
          vars: { a: curA, b: curB, x, y, check: `${curA}·(${x}) + ${curB}·(${y}) = ${g}` },
          explanation: `Обратный ход: для (${curA}, ${curB}) получаем x = ${x}, y = ${y}. Проверка: ${curA}·(${x}) + ${curB}·(${y}) = ${curA * x + curB * y}.`
        });

        return { g, x, y };
      }

      trace(a, b, 0);
      return frames;
    },
    code: {
      cpp: `long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) {
        x = 1; y = 0;
        return a;
    }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}`,
      python: `def extgcd(a: int, b: int) -> tuple[int, int, int]:
    """Возвращает (gcd, x, y), где a*x + b*y == gcd."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extgcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y`
    },
    problems: [
      { title: 'ACMP #1562: Расширенный алгоритм Евклида', platform: 'ACMP', difficulty: 'Medium', url: 'https://acmp.ru/asp/do/index.asp?main=task&id_course=2&id_section=19&id_topic=44&id_problem=287' },
      { title: 'CF #7C: Line', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/7/C' },
      { title: 'CSES: Common Divisors', platform: 'CSES', difficulty: 'Medium', url: 'https://cses.fi/problemset/task/1081' }
    ],
    quiz: {
      snippet: `long long g = extgcd(a, m, x, y); // ищем a^(-1) mod m`,
      question: 'При каком условии существует обратный элемент a⁻¹ по модулю m?',
      options: ['gcd(a, m) == 1', 'm — чётное число', 'a < m', 'gcd(a, m) > 1'],
      answer: 'gcd(a, m) == 1',
      explanation: 'Уравнение a·x + m·y = 1 имеет решение в целых числах тогда и только тогда, когда a и m взаимно просты.'
    }
  },
  {
    id: 'crt',
    title: 'Китайская теорема об остатках (КТО)',
    category: 'Теория чисел и математика',
    difficulty: 'Средний',
    isStub: false,
    engine: 'math',
    customInputType: 'crt',
    timeComplexity: 'O(k log M)',
    spaceComplexity: 'O(k)',
    summary:
      'Если модули m₁, m₂, ..., mₖ попарно взаимно просты, система сравнений x ≡ rᵢ (mod mᵢ) имеет единственное решение по модулю M = ∏ mᵢ. Решение строится как x ≡ ∑ rᵢ · Mᵢ · (Mᵢ⁻¹ mod mᵢ) (mod M), где Mᵢ = M / mᵢ.',
    pitfalls: [
      'Если модули не являются попарно взаимно простыми, классическая формула не работает — нужно попарно объединять сравнения через extgcd.',
      'Произведение M = ∏ mᵢ может переполнить 64-битный тип long long (используйте __int128 или схему Гарнера).',
      'Всегда приводите итоговый x к неотрицательному остатку: x = (x % M + M) % M.'
    ],
    traceCode: [
      'long long M = 1; for (auto m_i : m) M *= m_i;',
      'long long x = 0;',
      'for (int i = 0; i < k; ++i) {',
      '    long long Mi = M / m[i];',
      '    long long yi = modInverse(Mi, m[i]);',
      '    x = (x + r[i] * Mi % M * yi) % M;',
      '}',
      'return (x + M) % M;'
    ],
    presets: [
      {
        id: 'crt3',
        label: '3 сравнения (mod 3, 5, 7)',
        data: { congruences: [{ r: 2, m: 3 }, { r: 3, m: 5 }, { r: 2, m: 7 }] }
      },
      {
        id: 'crt2',
        label: '2 сравнения (mod 4, 9)',
        data: { congruences: [{ r: 3, m: 4 }, { r: 5, m: 9 }] }
      }
    ],
    generateFrames({ congruences }) {
      const k = congruences.length;
      const M = congruences.reduce((acc, c) => acc * c.m, 1);

      const extgcd = (a, b) => {
        if (b === 0) return [a, 1, 0];
        const [g, x1, y1] = extgcd(b, a % b);
        return [g, y1, x1 - Math.floor(a / b) * y1];
      };

      const cols = ['i', 'rᵢ', 'mᵢ', 'Mᵢ = M/mᵢ', 'yᵢ = Mᵢ⁻¹ mod mᵢ', 'Вклад в x'];
      const rows = [];
      const frames = [];

      frames.push({
        mode: 'table',
        formula: `Общий модуль M = ${congruences.map((c) => c.m).join(' · ')} = ${M}`,
        columns: cols,
        rows: [],
        activeRow: -1,
        line: 0,
        vars: { k, M },
        explanation: `Вычисляем произведение всех модулей M = ${M}.`
      });

      let x = 0;
      congruences.forEach((c, idx) => {
        const Mi = Math.floor(M / c.m);
        const [g, invRaw] = extgcd(Mi, c.m);
        const yi = g === 1 ? ((invRaw % c.m) + c.m) % c.m : 0;
        const term = (c.r * Mi * yi) % M;
        x = (x + term) % M;

        rows.push([idx + 1, c.r, c.m, Mi, yi, term]);
        frames.push({
          mode: 'table',
          formula: `Шаг ${idx + 1}: M_${idx + 1} = ${Mi}, y_${idx + 1} = ${yi}, вклад = ${c.r}·${Mi}·${yi} ≡ ${term} (mod ${M})`,
          columns: cols,
          rows: rows.map((r) => [...r]),
          activeRow: rows.length - 1,
          line: 5,
          vars: { i: idx + 1, Mi, yi, term, 'текущий x': x },
          explanation: `Для x ≡ ${c.r} (mod ${c.m}): Mᵢ = ${Mi}, обратный yᵢ = ${yi}, добавляем ${term} к x (итого ${x}).`
        });
      });

      const finalX = ((x % M) + M) % M;
      frames.push({
        mode: 'table',
        formula: `Итоговое решение: x ≡ ${finalX} (mod ${M})`,
        columns: cols,
        rows: rows.map((r) => [...r]),
        activeRow: rows.length - 1,
        line: 7,
        vars: { x: finalX, M },
        explanation: `Все сравнения учтены! Наименьшее неотрицательное решение: x = ${finalX} (mod ${M}).`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
using namespace std;

long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1, g = extgcd(b, a % b, x1, y1);
    x = y1; y = x1 - (a / b) * y1;
    return g;
}

long long crt(const vector<long long>& r, const vector<long long>& m) {
    long long M = 1, x = 0;
    for (long long mi : m) M *= mi;
    for (size_t i = 0; i < m.size(); ++i) {
        long long Mi = M / m[i], yi, tmp;
        extgcd(Mi, m[i], yi, tmp);
        yi = (yi % m[i] + m[i]) % m[i];
        x = (x + (r[i] % m[i]) * Mi % M * yi) % M;
    }
    return (x + M) % M;
}`,
      python: `def extgcd(a: int, b: int) -> tuple[int, int, int]:
    if b == 0: return a, 1, 0
    g, x1, y1 = extgcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def crt(r: list[int], m: list[int]) -> int:
    """Китайская теорема об остатках для попарно взаимно простых модулей."""
    M = 1
    for mi in m:
        M *= mi
    x = 0
    for ri, mi in zip(r, m):
        Mi = M // mi
        _, yi, _ = extgcd(Mi, mi)
        yi %= mi
        x = (x + ri * Mi * yi) % M
    return x % M`
    },
    problems: [
      { title: 'CF #707D / Kattis: Chinese Remainder', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/687/B' },
      { title: 'AtCoder ABC 193E: Oversleeping', platform: 'AtCoder', difficulty: 'Medium', url: 'https://atcoder.jp/contests/abc193/tasks/abc193_e' },
      { title: 'ACMP #1397: Китайская теорема', platform: 'ACMP', difficulty: 'Medium', url: 'https://acmp.ru/index.asp?main=task&id_task=1397' }
    ],
    quiz: {
      snippet: `// Система: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)`,
      question: 'По какому модулю гарантируется единственность решения системы в Китайской теореме об остатках (для попарно взаимно простых mᵢ)?',
      options: ['M = m₁ · m₂ · ... · mₖ', 'M = max(mᵢ)', 'M = m₁ + m₂ + ... + mₖ', 'M = min(mᵢ)'],
      answer: 'M = m₁ · m₂ · ... · mₖ',
      explanation: 'Для попарно взаимно простых модулей НОК равен произведению M = ∏ mᵢ, и решение единственно в диапазоне [0, M - 1].'
    }
  },
  {
    id: 'bridges-ap',
    title: 'Поиск мостов и точек сочленения',
    category: 'Графы',
    difficulty: 'Продвинутый',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    summary:
      'Алгоритм Тарьяна за один DFS вычисляет для каждой вершины время входа tin[v] и минимальное достижимое время по обратным рёбрам fup[v]. Ребро (v, to) является мостом, если fup[to] > tin[v]. Вершина v (не корень) является точкой сочленения, если найдётся потомок to с fup[to] >= tin[v] (а корень — если у него ≥ 2 детей в дереве DFS).',
    pitfalls: [
      'Для точек сочленения непустое условие fup[to] >= tin[v], а для мостов строгое fup[to] > tin[v].',
      'Обратное ребро обновляет fup[v] = min(fup[v], tin[to]), а НЕ min(fup[v], fup[to]) — это критично для точек сочленения!',
      'Кратные рёбра: если в графе есть кратные рёбра, передавайте в DFS индекс входящего ребра, а не только id родителя p.'
    ],
    traceCode: [
      'tin[v] = fup[v] = timer++;',
      'for (int to : adj[v]) {',
      '    if (to == p) continue;',
      '    if (used[to]) fup[v] = min(fup[v], tin[to]);',
      '    else {',
      '        dfs(to, v);',
      '        fup[v] = min(fup[v], fup[to]);',
      '        if (fup[to] > tin[v]) bridges.push_back({v, to});',
      '        if (fup[to] >= tin[v] && p != -1) isCutpoint[v] = true;',
      '    }',
      '}'
    ],
    presets: [
      {
        id: 'two-biconn',
        label: '2 компоненты + мост (6 вершин)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 80, y: 70 },
            { id: 1, x: 80, y: 190 },
            { id: 2, x: 205, y: 130 },
            { id: 3, x: 350, y: 130 },
            { id: 4, x: 475, y: 70 },
            { id: 5, x: 475, y: 190 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 0, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 5 },
            { from: 3, to: 5 }
          ]
        }
      },
      {
        id: 'chain-cycles',
        label: 'Цепочка циклов и мост',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 90, y: 130 },
            { id: 1, x: 200, y: 65 },
            { id: 2, x: 200, y: 195 },
            { id: 3, x: 320, y: 130 },
            { id: 4, x: 450, y: 130 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 3 },
            { from: 0, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 4 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges, startNode = 0 }) {
      const adj = new Map();
      nodes.forEach((n) => adj.set(n.id, []));
      edges.forEach((e) => {
        if (adj.has(e.from) && adj.has(e.to)) {
          adj.get(e.from).push(e.to);
          adj.get(e.to).push(e.from);
        }
      });
      adj.forEach((list) => list.sort((a, b) => a - b));

      const tin = {};
      const fup = {};
      const used = new Set();
      const treeEdges = [];
      const backEdges = [];
      const bridgeEdges = [];
      const cutpoints = new Set();
      let timer = 0;
      const frames = [];

      const buildBadges = () => {
        const b = {};
        nodes.forEach((n) => {
          b[n.id] = tin[n.id] !== undefined ? `${tin[n.id]}/${fup[n.id]}` : '·/·';
        });
        return b;
      };

      const snap = (extra = {}) => ({
        nodes,
        edges,
        weighted: false,
        currentNode: null,
        visitedNodes: [...used],
        articulationNodes: [...cutpoints],
        nodeBadges: buildBadges(),
        activeEdge: null,
        treeEdges: treeEdges.map((e) => [...e]),
        backEdges: backEdges.map((e) => [...e]),
        bridgeEdges: bridgeEdges.map((e) => [...e]),
        auxPanels: [
          {
            title: 'Найденные мосты (красные)',
            value: bridgeEdges.length ? bridgeEdges.map(([u, v]) => `(${u}-${v})`).join(' ') : 'нет',
            color: 'var(--danger)'
          },
          {
            title: 'Точки сочленения (фиолетовые)',
            value: cutpoints.size ? [...cutpoints].join(', ') : 'нет',
            color: 'var(--accent-light)'
          }
        ],
        ...extra
      });

      function dfs(v, p = -1) {
        used.add(v);
        tin[v] = fup[v] = timer++;
        let children = 0;

        frames.push(
          snap({
            currentNode: v,
            line: 0,
            vars: { v, p, 'tin[v]': tin[v], 'fup[v]': fup[v] },
            explanation: `Входим в вершину v = ${v}: tin[${v}] = fup[${v}] = ${tin[v]}.`
          })
        );

        for (const to of adj.get(v) || []) {
          if (to === p) continue;

          if (used.has(to)) {
            fup[v] = Math.min(fup[v], tin[to]);
            backEdges.push([v, to]);
            frames.push(
              snap({
                currentNode: v,
                activeEdge: [v, to],
                line: 3,
                vars: { v, to, 'tin[to]': tin[to], 'fup[v]': fup[v] },
                explanation: `Обратное ребро (${v}, ${to}): обновляем fup[${v}] = min(fup[${v}], tin[${to}]) = ${fup[v]}.`
              })
            );
          } else {
            children++;
            treeEdges.push([v, to]);
            frames.push(
              snap({
                currentNode: v,
                activeEdge: [v, to],
                line: 5,
                vars: { v, to },
                guess: {
                  expected: to,
                  prompt: `В какую новую вершину спустится DFS по дереву из ${v}? Кликните по вершине.`
                },
                explanation: `Ребро дерева (${v}, ${to}): рекурсивно запускаем dfs(${to}, ${v}).`
              })
            );

            dfs(to, v);
            fup[v] = Math.min(fup[v], fup[to]);

            let note = `Возврат из ${to} в ${v}: fup[${v}] = min(fup[${v}], fup[${to}]) = ${fup[v]}.`;
            if (fup[to] > tin[v]) {
              bridgeEdges.push([v, to]);
              note += ` Так как fup[${to}] (${fup[to]}) > tin[${v}] (${tin[v]}), ребро (${v}, ${to}) — МОСТ!`;
            }
            if (fup[to] >= tin[v] && p !== -1) {
              cutpoints.add(v);
              note += ` Вершина ${v} — ТОЧКА СОЧЛЕНЕНИЯ!`;
            }

            frames.push(
              snap({
                currentNode: v,
                activeEdge: [v, to],
                line: fup[to] > tin[v] ? 7 : 6,
                vars: { v, to, 'fup[v]': fup[v], 'fup[to]': fup[to], 'tin[v]': tin[v] },
                explanation: note
              })
            );
          }
        }

        if (p === -1 && children > 1) {
          cutpoints.add(v);
          frames.push(
            snap({
              currentNode: v,
              line: 8,
              vars: { корень: v, детейВДереве: children },
              explanation: `Корень ${v} имеет ${children} ≥ 2 детей в дереве DFS — это ТОЧКА СОЧЛЕНЕНИЯ!`
            })
          );
        }
      }

      dfs(startNode, -1);
      for (const n of nodes) {
        if (!used.has(n.id)) dfs(n.id, -1);
      }

      frames.push(
        snap({
          line: 10,
          vars: { мостов: bridgeEdges.length, точекСочленения: cutpoints.size },
          explanation: `Поиск завершён! Найдено мостов: ${bridgeEdges.length}, точек сочленения: ${cutpoints.size}.`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

void dfs(int v, int p, const vector<vector<int>>& adj, vector<bool>& used,
         vector<int>& tin, vector<int>& fup, int& timer,
         vector<pair<int,int>>& bridges, vector<bool>& isCut) {
    used[v] = true;
    tin[v] = fup[v] = timer++;
    int children = 0;
    for (int to : adj[v]) {
        if (to == p) continue;
        if (used[to]) {
            fup[v] = min(fup[v], tin[to]);
        } else {
            dfs(to, v, adj, used, tin, fup, timer, bridges, isCut);
            fup[v] = min(fup[v], fup[to]);
            if (fup[to] > tin[v]) bridges.push_back({v, to});
            if (fup[to] >= tin[v] && p != -1) isCut[v] = true;
            ++children;
        }
    }
    if (p == -1 && children > 1) isCut[v] = true;
}`,
      python: `def find_bridges_and_cuts(n: int, adj: list[list[int]]):
    used = [False] * n
    tin = [0] * n
    fup = [0] * n
    is_cut = [False] * n
    bridges = []
    timer = 0

    def dfs(v: int, p: int = -1) -> None:
        nonlocal timer
        used[v] = True
        tin[v] = fup[v] = timer
        timer += 1
        children = 0
        for to in adj[v]:
            if to == p:
                continue
            if used[to]:
                fup[v] = min(fup[v], tin[to])
            else:
                dfs(to, v)
                fup[v] = min(fup[v], fup[to])
                if fup[to] > tin[v]:
                    bridges.append((v, to))
                if fup[to] >= tin[v] and p != -1:
                    is_cut[v] = True
                children += 1
        if p == -1 and children > 1:
            is_cut[v] = True

    for i in range(n):
        if not used[i]:
            dfs(i)
    return bridges, [i for i, ok in enumerate(is_cut) if ok]`
    },
    problems: [
      { title: 'CSES: Necessary Roads (Мосты)', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/2076' },
      { title: 'CSES: Necessary Cities (Точки сочленения)', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/2077' },
      { title: 'CF #118E: Bertown roads', platform: 'Codeforces', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/118/E' }
    ],
    quiz: {
      snippet: `if (used[to]) fup[v] = min(fup[v], tin[to]);`,
      question: 'Почему при проходе по обратному ребру (v, to) для точек сочленения берётся min с tin[to], а не с fup[to]?',
      options: [
        'Через fup[to] можно ошибочно «перепрыгнуть» через точку сочленения v вверх по другому циклу',
        'Массив fup[to] ещё не инициализирован',
        'Разницы нет, это просто оптимизация',
        'Иначе возникнет бесконечная рекурсия'
      ],
      answer: 'Через fup[to] можно ошибочно «перепрыгнуть» через точку сочленения v вверх по другому циклу',
      explanation: 'Обратное ребро разрешает подняться только до самой вершины to (tin[to]), а не дальше по другим обратным рёбрам, выходящим из to.'
    }
  },
  {
    id: 'scc',
    title: 'Компоненты сильной связности (Косарайю)',
    category: 'Графы',
    difficulty: 'Продвинутый',
    isStub: false,
    engine: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    summary:
      'Алгоритм Косарайю находит все компоненты сильной связности (SCC) в ориентированном графе за два обхода DFS: 1) первый DFS на исходном графе запоминает порядок выхода tout; 2) инвертируем все рёбра графа и запускаем второй DFS в порядке убывания tout — каждый запуск выделяет ровно одну компоненту сильной связности.',
    pitfalls: [
      'Второй DFS должен идти строго по транспонированному (инвертированному) графу g_rev и в порядке убывания tout (от конца стека order к началу).',
      'Не забудьте обнулить массив used перед вторым проходом DFS.',
      'Сжатие каждой SCC в одну вершину даёт конденсацию графа — всегда ацикличный ориентированный граф (DAG).'
    ],
    traceCode: [
      '// 1. Первый проход DFS по исходному графу:',
      'for (int i = 0; i < n; ++i) if (!used[i]) dfs1(i);',
      '// 2. Инвертируем рёбра (u -> v становится v -> u)',
      '// 3. Второй проход DFS по g_rev в обратном порядке order:',
      'reverse(order.begin(), order.end());',
      'for (int v : order) {',
      '    if (!used[v]) { dfs2(v, ++compId); }',
      '}'
    ],
    presets: [
      {
        id: 'scc3',
        label: '3 компоненты (6 вершин)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 90, y: 70 },
            { id: 1, x: 90, y: 190 },
            { id: 2, x: 220, y: 130 },
            { id: 3, x: 350, y: 70 },
            { id: 4, x: 470, y: 70 },
            { id: 5, x: 410, y: 190 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 0 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 3 },
            { from: 4, to: 5 }
          ]
        }
      },
      {
        id: 'scc2',
        label: '2 цикла с переходом (5 вершин)',
        data: {
          startNode: 0,
          nodes: [
            { id: 0, x: 100, y: 75 },
            { id: 1, x: 230, y: 75 },
            { id: 2, x: 165, y: 190 },
            { id: 3, x: 375, y: 75 },
            { id: 4, x: 470, y: 190 }
          ],
          edges: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 0 },
            { from: 1, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 3 }
          ]
        }
      }
    ],
    generateFrames({ nodes, edges }) {
      const PALETTE = ['#A855F7', '#38BDF8', '#22C55E', '#F59E0B', '#F472B6', '#FB7185'];
      const adj = new Map();
      const rev = new Map();
      nodes.forEach((n) => {
        adj.set(n.id, []);
        rev.set(n.id, []);
      });
      edges.forEach((e) => {
        if (adj.has(e.from) && adj.has(e.to)) {
          adj.get(e.from).push(e.to);
          rev.get(e.to).push(e.from);
        }
      });

      const order = [];
      const used1 = new Set();
      const frames = [];

      function dfs1(u) {
        used1.add(u);
        for (const v of adj.get(u) || []) {
          if (!used1.has(v)) dfs1(v);
        }
        order.push(u);
        frames.push({
          nodes,
          edges,
          directed: true,
          currentNode: u,
          visitedNodes: [...used1],
          auxPanels: [
            { title: 'Этап 1: DFS1 (порядок выхода tout)', value: `[${order.join(', ')}]`, color: 'var(--info)' },
            { title: 'Компоненты SCC', value: 'Формируются на этапе 2', color: 'var(--text-secondary)' }
          ],
          line: 1,
          vars: { этап: 'DFS1', toutДобавлен: u },
          explanation: `DFS1 завершил обработку вершины ${u} — добавляем ${u} в стек order.`
        });
      }

      for (const n of nodes) {
        if (!used1.has(n.id)) dfs1(n.id);
      }

      const revEdges = edges.map((e) => ({ from: e.to, to: e.from }));
      const revOrder = [...order].reverse();
      frames.push({
        nodes,
        edges: revEdges,
        directed: true,
        currentNode: null,
        auxPanels: [
          { title: 'Порядок обхода для DFS2 (reverse tout)', value: `[${revOrder.join(', ')}]`, color: 'var(--info)' },
          { title: 'Граф инвертирован', value: 'Все рёбра развёрнуты', color: 'var(--accent-light)' }
        ],
        line: 4,
        vars: { этап: 'Инверсия графа', порядок: revOrder.join(', ') },
        explanation: `Инвертируем все рёбра графа. Запускаем DFS2 в порядке [${revOrder.join(', ')}].`
      });

      const used2 = new Set();
      const nodePalette = {};
      const components = [];

      function dfs2(u, comp, colorHex) {
        used2.add(u);
        comp.push(u);
        nodePalette[u] = colorHex;
        frames.push({
          nodes,
          edges: revEdges,
          directed: true,
          currentNode: u,
          nodePalette: { ...nodePalette },
          auxPanels: [
            { title: 'Порядок DFS2', value: `[${revOrder.join(', ')}]`, color: 'var(--info)' },
            {
              title: `Найдено SCC: ${components.length + 1}`,
              value: [...components.map((c) => `{${c.join(',')}}`), `{${comp.join(',')}}`].join('  '),
              color: 'var(--success)'
            }
          ],
          line: 6,
          vars: { этап: 'DFS2', вершина: u, компонента: `{${comp.join(', ')}}` },
          explanation: `DFS2 по инвертированному графу: вершина ${u} входит в SCC #${components.length + 1}.`
        });
        for (const v of rev.get(u) || []) {
          if (!used2.has(v)) dfs2(v, comp, colorHex);
        }
      }

      for (const v of revOrder) {
        if (!used2.has(v)) {
          const comp = [];
          const col = PALETTE[components.length % PALETTE.length];
          dfs2(v, comp, col);
          components.push(comp);
        }
      }

      frames.push({
        nodes,
        edges,
        directed: true,
        currentNode: null,
        nodePalette: { ...nodePalette },
        auxPanels: [
          { title: 'Всего компонент сильной связности', value: String(components.length), color: 'var(--accent-light)' },
          { title: 'Список SCC', value: components.map((c) => `{${c.join(', ')}}`).join('  '), color: 'var(--success)' }
        ],
        line: 7,
        vars: { всегоSCC: components.length },
        explanation: `Алгоритм Косарайю завершён! Найдено компонент сильной связности: ${components.length}.`
      });

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

void dfs1(int v, const vector<vector<int>>& g, vector<bool>& used, vector<int>& order) {
    used[v] = true;
    for (int to : g[v]) if (!used[to]) dfs1(to, g, used, order);
    order.push_back(v);
}

void dfs2(int v, int id, const vector<vector<int>>& gr, vector<int>& comp) {
    comp[v] = id;
    for (int to : gr[v]) if (comp[to] == -1) dfs2(to, id, gr, comp);
}

int kosaraju(int n, const vector<vector<int>>& g, const vector<vector<int>>& gr, vector<int>& comp) {
    vector<bool> used(n, false);
    vector<int> order;
    for (int i = 0; i < n; ++i) if (!used[i]) dfs1(i, g, used, order);
    reverse(order.begin(), order.end());
    comp.assign(n, -1);
    int cnt = 0;
    for (int v : order) if (comp[v] == -1) dfs2(v, cnt++, gr, comp);
    return cnt;
}`,
      python: `def kosaraju(n: int, g: list[list[int]], gr: list[list[int]]) -> list[int]:
    used = [False] * n
    order = []

    def dfs1(v: int) -> None:
        used[v] = True
        for to in g[v]:
            if not used[to]:
                dfs1(to)
        order.append(v)

    for i in range(n):
        if not used[i]:
            dfs1(i)

    comp = [-1] * n
    cid = 0

    def dfs2(v: int) -> None:
        comp[v] = cid
        for to in gr[v]:
            if comp[to] == -1:
                dfs2(to)

    for v in reversed(order):
        if comp[v] == -1:
            dfs2(v)
            cid += 1
    return comp`
    },
    problems: [
      { title: 'CSES: Flight Routes Check', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1682' },
      { title: 'CSES: Planets and Kingdoms', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1683' },
      { title: 'CSES: Coin Collector', platform: 'CSES', difficulty: 'Hard', url: 'https://cses.fi/problemset/task/1686' }
    ],
    quiz: {
      snippet: `// После выделения SCC сжимаем каждую компоненту в одну вершину`,
      question: 'Каким графом всегда является конденсация произвольного ориентированного графа?',
      options: [
        'Ациклическим ориентированным графом (DAG)',
        'Деревом',
        'Полным графом',
        'Двудольным графом'
      ],
      answer: 'Ациклическим ориентированным графом (DAG)',
      explanation: 'Если бы в конденсации был цикл, все компоненты этого цикла были бы взаимно достижимы и образовывали одну большую SCC.'
    }
  },
  {
    id: 'lca',
    title: 'LCA — Наименьший общий предок (Binary Lifting)',
    category: 'Деревья',
    difficulty: 'Продвинутый',
    isStub: false,
    engine: 'tree',
    customInputType: 'lca',
    timeComplexity: 'O(N log N) преподсчёт, O(log N) запрос',
    spaceComplexity: 'O(N log N)',
    summary:
      'Метод двоичных подъёмов: для каждой вершины v вычисляется таблица предков up[v][k] на расстоянии 2^k шагов вверх. Для ответа на запрос lca(u, v) сначала выравниваем глубины u и v двоичными прыжками, затем одновременно поднимаем обе вершины, пока up[u][k] ≠ up[v][k], и возвращаем непосредственного родителя up[u][0].',
    pitfalls: [
      'Проверка до одновременного подъёма: если после выравнивания глубин u == v, сразу верните u (одна вершина является предком другой).',
      'Для корня дерева задавайте up[root][k] = root (чтобы прыжки выше корня оставались в корне).',
      'Значение LOG выбирайте как ceil(log2(N)) + 1 (например, LOG = 20 для N ≤ 2·10^5).'
    ],
    traceCode: [
      'if (depth[u] < depth[v]) swap(u, v);',
      'int diff = depth[u] - depth[v];',
      'for (int k = LOG - 1; k >= 0; --k)',
      '    if ((diff >> k) & 1) u = up[u][k];',
      'if (u == v) return u;',
      'for (int k = LOG - 1; k >= 0; --k)',
      '    if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }',
      'return up[u][0];'
    ],
    presets: [
      {
        id: 'tree7',
        label: 'Дерево из 7 вершин (LCA(4, 6))',
        data: {
          nodes: [
            { id: 1, val: 1, children: [2, 3] },
            { id: 2, val: 2, children: [4, 5] },
            { id: 3, val: 3, children: [6] },
            { id: 4, val: 4, children: [7] },
            { id: 5, val: 5, children: [] },
            { id: 6, val: 6, children: [] },
            { id: 7, val: 7, children: [] }
          ],
          u: 7,
          v: 5
        }
      },
      {
        id: 'ancestor',
        label: 'Предок и потомок (LCA(7, 2))',
        data: {
          nodes: [
            { id: 1, val: 1, children: [2, 3] },
            { id: 2, val: 2, children: [4, 5] },
            { id: 3, val: 3, children: [6] },
            { id: 4, val: 4, children: [7] },
            { id: 5, val: 5, children: [] },
            { id: 6, val: 6, children: [] },
            { id: 7, val: 7, children: [] }
          ],
          u: 7,
          v: 2
        }
      }
    ],
    generateFrames({ nodes, u: initU, v: initV }) {
      const rootId = nodes[0].id;
      const LOG = 4;
      const depth = {};
      const up = {};
      const nodeMap = new Map(nodes.map((nd) => [nd.id, nd]));

      function dfs(cur, p, d) {
        depth[cur] = d;
        up[cur] = new Array(LOG).fill(p);
        for (let k = 1; k < LOG; k++) {
          up[cur][k] = up[up[cur][k - 1]][k - 1];
        }
        const ch = nodeMap.get(cur)?.children || [];
        for (const nxt of ch) dfs(nxt, cur, d + 1);
      }
      dfs(rootId, rootId, 0);

      const baseNodes = () =>
        nodes.map((nd) => ({ ...nd, subLabel: `d=${depth[nd.id]}` }));

      let u = initU;
      let v = initV;
      const frames = [];

      const snap = (extra = {}) => ({
        nodes: baseNodes(),
        rootId,
        activeNodes: [u, v],
        updatedNodes: [],
        queryNodes: [],
        activeEdges: [],
        jumpEdges: [],
        auxPanels: [
          { title: 'Текущие вершины', value: `u = ${u} (d=${depth[u]}),  v = ${v} (d=${depth[v]})`, color: 'var(--info)' },
          { title: 'Таблица прыжков up[u] / up[v]', value: `up[${u}]=[${up[u].slice(0, 3).join(',')}]  up[${v}]=[${up[v].slice(0, 3).join(',')}]`, color: 'var(--accent-light)' }
        ],
        ...extra
      });

      frames.push(
        snap({
          line: 0,
          vars: { u, v, 'depth[u]': depth[u], 'depth[v]': depth[v] },
          explanation: `Начинаем поиск LCA(${u}, ${v}). Глубины: depth[${u}] = ${depth[u]}, depth[${v}] = ${depth[v]}.`
        })
      );

      if (depth[u] < depth[v]) {
        [u, v] = [v, u];
        frames.push(
          snap({
            line: 0,
            vars: { u, v, 'depth[u]': depth[u], 'depth[v]': depth[v] },
            explanation: `Меняем местами, чтобы u была глубже: u = ${u}, v = ${v}.`
          })
        );
      }

      const diff = depth[u] - depth[v];
      for (let k = LOG - 1; k >= 0; k--) {
        if ((diff >> k) & 1) {
          const prevU = u;
          u = up[u][k];
          frames.push(
            snap({
              jumpEdges: [[prevU, u]],
              line: 3,
              vars: { k, '2^k': 1 << k, прыжок: `${prevU} → ${u}`, 'depth[u]': depth[u] },
              explanation: `Выравниваем глубину: прыгаем из ${prevU} на 2^${k} = ${1 << k} вверх в вершину u = ${u}.`
            })
          );
        }
      }

      if (u === v) {
        frames.push(
          snap({
            activeNodes: [],
            queryNodes: [u],
            line: 4,
            vars: { lca: u },
            explanation: `После выравнивания глубин u == v == ${u}. Одна вершина — предок другой! LCA = ${u}.`
          })
        );
        return frames;
      }

      for (let k = LOG - 1; k >= 0; k--) {
        if (up[u][k] !== up[v][k]) {
          const prevU = u;
          const prevV = v;
          u = up[u][k];
          v = up[v][k];
          frames.push(
            snap({
              jumpEdges: [[prevU, u], [prevV, v]],
              line: 6,
              vars: { k, '2^k': 1 << k, u, v },
              explanation: `up[${prevU}][${k}] (${u}) ≠ up[${prevV}][${k}] (${v}): одновременно прыгаем на 2^${k} вверх.`
            })
          );
        }
      }

      const lcaNode = up[u][0];
      frames.push(
        snap({
          activeNodes: [u, v],
          queryNodes: [lcaNode],
          activeEdges: [[lcaNode, u], [lcaNode, v]],
          line: 7,
          vars: { u, v, lca: lcaNode },
          explanation: `Вершины ${u} и ${v} находятся прямо под общим предком! LCA = up[${u}][0] = ${lcaNode}.`
        })
      );

      return frames;
    },
    code: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

const int LOG = 20;
vector<int> depth;
vector<vector<int>> up;

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = LOG - 1; k >= 0; --k)
        if ((diff >> k) & 1) u = up[u][k];
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; --k) {
        if (up[u][k] != up[v][k]) {
            u = up[u][k];
            v = up[v][k];
        }
    }
    return up[u][0];
}`,
      python: `LOG = 20

def lca(u: int, v: int, depth: list[int], up: list[list[int]]) -> int:
    if depth[u] < depth[v]:
        u, v = v, u
    diff = depth[u] - depth[v]
    for k in range(LOG - 1, -1, -1):
        if (diff >> k) & 1:
            u = up[u][k]
    if u == v:
        return u
    for k in range(LOG - 1, -1, -1):
        if up[u][k] != up[v][k]:
            u = up[u][k]
            v = up[v][k]
    return up[u][0]`
    },
    problems: [
      { title: 'CSES: Company Queries II', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1688' },
      { title: 'CSES: Distance Queries', platform: 'CSES', difficulty: 'Easy', url: 'https://cses.fi/problemset/task/1135' },
      { title: 'CF #519E: A and B and Lecture Rooms', platform: 'Codeforces', difficulty: 'Hard', url: 'https://codeforces.com/problemset/problem/519/E' }
    ],
    quiz: {
      snippet: `for (int k = LOG - 1; k >= 0; --k)
    if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }`,
      question: 'Почему цикл по k идёт сверху вниз (от LOG - 1 к 0), а не от 0 к LOG - 1?',
      options: [
        'Любое расстояние можно однозначно разложить по степеням двойки жадным выбором старших битов',
        'Массив up заполнен в обратном порядке',
        'Чтобы избежать деления на 2',
        'Разницы нет, снизу вверх работает так же'
      ],
      answer: 'Любое расстояние можно однозначно разложить по степеням двойки жадным выбором старших битов',
      explanation: 'Двигаясь от старших степеней двойки к младшим, мы строим двоичное представление расстояния до вершины, стоящей на 1 шаг ниже LCA.'
    }
  }
];

const FILL_BLANKS_BY_ID = {
  'binary-search': [
    {
      title: 'Сдвиг границ в lower_bound (C++)',
      lang: 'cpp',
      lines: [
        'int l = 0, r = n - 1, ans = n;',
        'while (l <= r) {',
        { blankId: 'mid', indent: '    ', placeholder: 'вычислите mid без переполнения', hint: 'int mid = l + (r - l) / 2;', answers: ['int mid = l + (r - l) / 2;', 'int mid = (l + r) / 2;', 'int m = l + (r - l) / 2;', 'int m = (l + r) / 2;'] },
        '    if (a[mid] >= target) {',
        '        ans = mid;',
        { blankId: 'right', indent: '        ', placeholder: 'сузьте правую границу', hint: 'r = mid - 1;', answers: ['r = mid - 1;', 'r = m - 1;'] },
        '    } else {',
        { blankId: 'left', indent: '        ', placeholder: 'сузьте левую границу', hint: 'l = mid + 1;', answers: ['l = mid + 1;', 'l = m + 1;'] },
        '    }',
        '}'
      ]
    }
  ],
  bfs: [
    {
      title: 'Пометка и добавление соседа в очередь (C++)',
      lang: 'cpp',
      lines: [
        'while (!q.empty()) {',
        '    int u = q.front(); q.pop();',
        '    for (int v : adj[u]) {',
        { blankId: 'cond', indent: '        ', placeholder: 'проверка, что вершина v не посещена', hint: 'if (dist[v] == INF) {', answers: ['if (dist[v] == INF) {', 'if (dist[v] == -1) {'] },
        { blankId: 'upd', indent: '            ', placeholder: 'обновите dist[v]', hint: 'dist[v] = dist[u] + 1;', answers: ['dist[v] = dist[u] + 1;'] },
        '            q.push(v);',
        '        }',
        '    }',
        '}'
      ]
    }
  ],
  'two-pointers': [
    {
      title: 'Сжатие окна при превышении суммы (Python)',
      lang: 'python',
      lines: [
        'l = 0; cur_sum = 0',
        'for r, val in enumerate(a):',
        '    cur_sum += val',
        '    while cur_sum > target and l <= r:',
        { blankId: 'sub', indent: '        ', placeholder: 'удалите левый элемент из cur_sum', hint: 'cur_sum -= a[l]', answers: ['cur_sum -= a[l]', 'cur_sum = cur_sum - a[l]'] },
        { blankId: 'inc', indent: '        ', placeholder: 'сдвиньте левый указатель', hint: 'l += 1', answers: ['l += 1', 'l = l + 1'] },
        '    if cur_sum == target: return (l, r)'
      ]
    }
  ],
  'sorting-prefix': [
    {
      title: 'Построение pref и запрос суммы на [l, r] (C++)',
      lang: 'cpp',
      lines: [
        'vector<long long> pref(n + 1, 0);',
        'for (int i = 0; i < n; ++i)',
        { blankId: 'build', indent: '    ', placeholder: 'формула префиксной суммы pref[i + 1]', hint: 'pref[i + 1] = pref[i] + a[i];', answers: ['pref[i + 1] = pref[i] + a[i];', 'pref[i + 1] = a[i] + pref[i];'] },
        '// Запрос суммы на отрезке [l, r]:',
        { blankId: 'query', indent: '', placeholder: 'верните сумму на [l, r]', hint: 'return pref[r + 1] - pref[l];', answers: ['return pref[r + 1] - pref[l];', 'long long ans = pref[r + 1] - pref[l];'] }
      ]
    }
  ],
  dijkstra: [
    {
      title: 'Условие ленивого удаления и релаксации (C++)',
      lang: 'cpp',
      lines: [
        'while (!pq.empty()) {',
        '    auto [d, u] = pq.top(); pq.pop();',
        { blankId: 'stale', indent: '    ', placeholder: 'пропуск устаревшей записи в куче', hint: 'if (d > dist[u]) continue;', answers: ['if (d > dist[u]) continue;', 'if (d != dist[u]) continue;'] },
        '    for (auto [v, w] : adj[u]) {',
        { blankId: 'relax', indent: '        ', placeholder: 'условие релаксации ребра (u, v) весом w', hint: 'if (dist[u] + w < dist[v]) {', answers: ['if (dist[u] + w < dist[v]) {', 'if (d + w < dist[v]) {'] },
        '            dist[v] = dist[u] + w;',
        '            pq.push({dist[v], v});',
        '        }',
        '    }',
        '}'
      ]
    }
  ],
  knapsack: [
    {
      title: 'Переход в 0-1 рюкзаке (C++)',
      lang: 'cpp',
      lines: [
        'for (int i = 1; i <= n; ++i) {',
        '    for (int w = 0; w <= W; ++w) {',
        { blankId: 'skip', indent: '        ', placeholder: 'вариант: не брать i-й предмет', hint: 'dp[i][w] = dp[i - 1][w];', answers: ['dp[i][w] = dp[i - 1][w];'] },
        '        if (w >= wt[i - 1]) {',
        { blankId: 'take', indent: '            ', placeholder: 'обновление dp[i][w], если берём i-й предмет', hint: 'dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);', answers: ['dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);'] },
        '        }',
        '    }',
        '}'
      ]
    }
  ],
  'segment-tree': [
    {
      title: 'Выход и объединение в query (C++)',
      lang: 'cpp',
      lines: [
        'long long query(int v, int tl, int tr, int l, int r) {',
        '    if (l > r) return 0;',
        { blankId: 'exact', indent: '    ', placeholder: 'если отрезок полностью совпадает с запросом', hint: 'if (l == tl && r == tr) return tree[v];', answers: ['if (l == tl && r == tr) return tree[v];', 'if (l <= tl && tr <= r) return tree[v];'] },
        '    int tm = (tl + tr) / 2;',
        '    return query(2*v, tl, tm, l, min(r, tm)) +',
        '           query(2*v+1, tm+1, tr, max(l, tm+1), r);',
        '}'
      ]
    }
  ],
  dfs: [
    {
      title: 'Проверка цикла и выход из DFS (C++)',
      lang: 'cpp',
      lines: [
        'void dfs(int u) {',
        '    color[u] = GRAY;',
        '    for (int v : adj[u]) {',
        '        if (color[v] == WHITE) dfs(v);',
        { blankId: 'cycle', indent: '        ', placeholder: 'обнаружение обратного ребра (цикла)', hint: 'else if (color[v] == GRAY) hasCycle = true;', answers: ['else if (color[v] == GRAY) hasCycle = true;', 'if (color[v] == GRAY) hasCycle = true;'] },
        '    }',
        { blankId: 'black', indent: '    ', placeholder: 'пометьте вершину u как завершённую', hint: 'color[u] = BLACK;', answers: ['color[u] = BLACK;', 'color[u] = 2;'] },
        '    order.push_back(u);',
        '}'
      ]
    }
  ],
  kruskal: [
    {
      title: 'Проверка и объединение компонент в Крускале (Python)',
      lang: 'python',
      lines: [
        'edges.sort()',
        'mst_weight = 0',
        'for w, u, v in edges:',
        '    ru, rv = find_set(u), find_set(v)',
        { blankId: 'diff', indent: '    ', placeholder: 'проверка, что вершины в разных компонентах', hint: 'if ru != rv:', answers: ['if ru != rv:', 'if find_set(u) != find_set(v):'] },
        '        parent[rv] = ru',
        { blankId: 'addw', indent: '        ', placeholder: 'добавьте вес ребра к mst_weight', hint: 'mst_weight += w', answers: ['mst_weight += w', 'mst_weight = mst_weight + w'] }
      ]
    }
  ],
  dsu: [
    {
      title: 'Сжатие путей в find_set (C++)',
      lang: 'cpp',
      lines: [
        'int find_set(int v) {',
        { blankId: 'base', indent: '    ', placeholder: 'базовый случай: v является корнем', hint: 'if (v == parent[v]) return v;', answers: ['if (v == parent[v]) return v;', 'if (parent[v] == v) return v;'] },
        { blankId: 'comp', indent: '    ', placeholder: 'рекурсивный вызов со сжатием пути', hint: 'return parent[v] = find_set(parent[v]);', answers: ['return parent[v] = find_set(parent[v]);'] },
        '}'
      ]
    }
  ],
  tsp: [
    {
      title: 'Переход по битовой маске в TSP (C++)',
      lang: 'cpp',
      lines: [
        'for (int to = 0; to < n; ++to) {',
        { blankId: 'chk', indent: '    ', placeholder: 'пропуск, если вершина to уже в mask', hint: 'if (mask & (1 << to)) continue;', answers: ['if (mask & (1 << to)) continue;', 'if ((mask >> to) & 1) continue;'] },
        '    int nmask = mask | (1 << to);',
        { blankId: 'rel', indent: '    ', placeholder: 'обновите dp[nmask][to]', hint: 'dp[nmask][to] = min(dp[nmask][to], dp[mask][v] + w[v][to]);', answers: ['dp[nmask][to] = min(dp[nmask][to], dp[mask][v] + w[v][to]);'] },
        '}'
      ]
    }
  ],
  'assignment-hungarian': [
    {
      title: 'Обновление потенциалов в Венгерском алгоритме (C++)',
      lang: 'cpp',
      lines: [
        'for (int j = 0; j <= m; ++j) {',
        '    if (used[j]) {',
        { blankId: 'uupd', indent: '        ', placeholder: 'обновите потенциал u[p[j]]', hint: 'u[p[j]] += delta;', answers: ['u[p[j]] += delta;', 'u[p[j]] = u[p[j]] + delta;'] },
        { blankId: 'vupd', indent: '        ', placeholder: 'обновите потенциал v[j]', hint: 'v[j] -= delta;', answers: ['v[j] -= delta;', 'v[j] = v[j] - delta;'] },
        '    } else minv[j] -= delta;',
        '}'
      ]
    }
  ],
  sieve: [
    {
      title: 'Просеивание кратных в решете Эратосфена (C++)',
      lang: 'cpp',
      lines: [
        'for (int i = 2; 1LL * i * i <= n; ++i) {',
        '    if (isPrime[i]) {',
        { blankId: 'loop', indent: '        ', placeholder: 'цикл по кратным начиная с i * i', hint: 'for (int j = i * i; j <= n; j += i)', answers: ['for (int j = i * i; j <= n; j += i)', 'for (int j = i * i; j <= n; j += i) {'] },
        '            isPrime[j] = false;',
        '    }',
        '}'
      ]
    }
  ],
  binpow: [
    {
      title: 'Шаг бинарного возведения в степень (C++)',
      lang: 'cpp',
      lines: [
        'while (n > 0) {',
        { blankId: 'odd', indent: '    ', placeholder: 'если n нечётное, умножьте res на a по модулю m', hint: 'if (n & 1) res = (res * a) % m;', answers: ['if (n & 1) res = (res * a) % m;', 'if (n % 2 == 1) res = (res * a) % m;'] },
        { blankId: 'sq', indent: '    ', placeholder: 'возведите a в квадрат по модулю m', hint: 'a = (a * a) % m;', answers: ['a = (a * a) % m;'] },
        '    n >>= 1;',
        '}'
      ]
    }
  ],
  'ext-gcd': [
    {
      title: 'Пересчёт коэффициентов Безу (Python)',
      lang: 'python',
      lines: [
        'def extgcd(a: int, b: int):',
        '    if b == 0: return a, 1, 0',
        '    g, x1, y1 = extgcd(b, a % b)',
        { blankId: 'xval', indent: '    ', placeholder: 'вычислите x', hint: 'x = y1', answers: ['x = y1'] },
        { blankId: 'yval', indent: '    ', placeholder: 'вычислите y через x1, a, b, y1', hint: 'y = x1 - (a // b) * y1', answers: ['y = x1 - (a // b) * y1'] },
        '    return g, x, y'
      ]
    }
  ],
  crt: [
    {
      title: 'Сборка ответа в КТО (C++)',
      lang: 'cpp',
      lines: [
        'for (size_t i = 0; i < m.size(); ++i) {',
        { blankId: 'mi', indent: '    ', placeholder: 'вычислите частичное произведение Mi', hint: 'long long Mi = M / m[i];', answers: ['long long Mi = M / m[i];', 'Mi = M / m[i];'] },
        '    long long yi = modInverse(Mi, m[i]);',
        { blankId: 'addx', indent: '    ', placeholder: 'добавьте вклад i-го сравнения к x по модулю M', hint: 'x = (x + r[i] * Mi % M * yi) % M;', answers: ['x = (x + r[i] * Mi % M * yi) % M;'] },
        '}'
      ]
    }
  ],
  'bridges-ap': [
    {
      title: 'Проверка моста и точки сочленения (C++)',
      lang: 'cpp',
      lines: [
        'dfs(to, v);',
        'fup[v] = min(fup[v], fup[to]);',
        { blankId: 'bridge', indent: '', placeholder: 'условие того, что (v, to) — мост', hint: 'if (fup[to] > tin[v]) bridges.push_back({v, to});', answers: ['if (fup[to] > tin[v]) bridges.push_back({v, to});'] },
        { blankId: 'cut', indent: '', placeholder: 'условие точки сочленения для некорневой вершины v', hint: 'if (fup[to] >= tin[v] && p != -1) isCut[v] = true;', answers: ['if (fup[to] >= tin[v] && p != -1) isCut[v] = true;'] }
      ]
    }
  ],
  scc: [
    {
      title: 'Второй проход Косарайю (Python)',
      lang: 'python',
      lines: [
        'for v in reversed(order):',
        { blankId: 'cond', indent: '    ', placeholder: 'проверка, что вершина v ещё не в компоненте', hint: 'if comp[v] == -1:', answers: ['if comp[v] == -1:'] },
        '        dfs2(v)',
        '        cid += 1'
      ]
    }
  ],
  lca: [
    {
      title: 'Выравнивание глубин и возврат LCA (C++)',
      lang: 'cpp',
      lines: [
        'for (int k = LOG - 1; k >= 0; --k)',
        { blankId: 'lift', indent: '    ', placeholder: 'прыжок u вверх, если установлен k-й бит diff', hint: 'if ((diff >> k) & 1) u = up[u][k];', answers: ['if ((diff >> k) & 1) u = up[u][k];'] },
        'if (u == v) return u;',
        'for (int k = LOG - 1; k >= 0; --k)',
        '    if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }',
        { blankId: 'ret', indent: '', placeholder: 'верните непосредственного родителя u', hint: 'return up[u][0];', answers: ['return up[u][0];'] }
      ]
    }
  ],
  'prefix-function': [
    {
      title: 'Откат и шаг префикс-функции (C++)',
      lang: 'cpp',
      lines: [
        'for (int i = 1; i < n; ++i) {',
        '    int j = pi[i - 1];',
        { blankId: 'back', indent: '    ', placeholder: 'откат j при несовпадении s[i] != s[j]', hint: 'while (j > 0 && s[i] != s[j]) j = pi[j - 1];', answers: ['while (j > 0 && s[i] != s[j]) j = pi[j - 1];'] },
        '    if (s[i] == s[j]) ++j;',
        '    pi[i] = j;',
        '}'
      ]
    }
  ],
  'fenwick-tree': [
    {
      title: 'Прыжки в дереве Фенвика (C++)',
      lang: 'cpp',
      lines: [
        'void add(int i, long long delta) {',
        { blankId: 'addloop', indent: '    ', placeholder: 'цикл вверх с шагом i += i & -i', hint: 'for (; i <= n; i += i & -i) bit[i] += delta;', answers: ['for (; i <= n; i += i & -i) bit[i] += delta;'] },
        '}',
        'long long sum(int i) {',
        '    long long res = 0;',
        { blankId: 'sumloop', indent: '    ', placeholder: 'цикл вниз с шагом i -= i & -i', hint: 'for (; i > 0; i -= i & -i) res += bit[i];', answers: ['for (; i > 0; i -= i & -i) res += bit[i];'] },
        '    return res;',
        '}'
      ]
    }
  ],
  'lcs-levenshtein': [
    {
      title: 'Переход в задаче LCS (Python)',
      lang: 'python',
      lines: [
        'if s1[i - 1] == s2[j - 1]:',
        { blankId: 'eq', indent: '    ', placeholder: 'символы совпали', hint: 'dp[i][j] = dp[i - 1][j - 1] + 1', answers: ['dp[i][j] = dp[i - 1][j - 1] + 1'] },
        'else:',
        { blankId: 'neq', indent: '    ', placeholder: 'максимум из соседа сверху и слева', hint: 'dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])', answers: ['dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])'] }
      ]
    }
  ]
};

TOPICS.forEach((topic) => {
  if (FILL_BLANKS_BY_ID[topic.id]) {
    topic.fillBlanks = FILL_BLANKS_BY_ID[topic.id];
  }
});
