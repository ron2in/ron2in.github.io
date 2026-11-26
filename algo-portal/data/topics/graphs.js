export const TOPICS = [
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
  ,
    fillBlanks: [
      {
        "title": "Пометка и добавление соседа в очередь (C++)",
        "lang": "cpp",
        "lines": [
          "while (!q.empty()) {",
          "    int u = q.front(); q.pop();",
          "    for (int v : adj[u]) {",
          {
            "blankId": "cond",
            "indent": "        ",
            "placeholder": "проверка, что вершина v не посещена",
            "hint": "if (dist[v] == INF) {",
            "answers": [
              "if (dist[v] == INF) {",
              "if (dist[v] == -1) {"
            ]
          },
          {
            "blankId": "upd",
            "indent": "            ",
            "placeholder": "обновите dist[v]",
            "hint": "dist[v] = dist[u] + 1;",
            "answers": [
              "dist[v] = dist[u] + 1;"
            ]
          },
          "            q.push(v);",
          "        }",
          "    }",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Условие ленивого удаления и релаксации (C++)",
        "lang": "cpp",
        "lines": [
          "while (!pq.empty()) {",
          "    auto [d, u] = pq.top(); pq.pop();",
          {
            "blankId": "stale",
            "indent": "    ",
            "placeholder": "пропуск устаревшей записи в куче",
            "hint": "if (d > dist[u]) continue;",
            "answers": [
              "if (d > dist[u]) continue;",
              "if (d != dist[u]) continue;"
            ]
          },
          "    for (auto [v, w] : adj[u]) {",
          {
            "blankId": "relax",
            "indent": "        ",
            "placeholder": "условие релаксации ребра (u, v) весом w",
            "hint": "if (dist[u] + w < dist[v]) {",
            "answers": [
              "if (dist[u] + w < dist[v]) {",
              "if (d + w < dist[v]) {"
            ]
          },
          "            dist[v] = dist[u] + w;",
          "            pq.push({dist[v], v});",
          "        }",
          "    }",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Проверка цикла и выход из DFS (C++)",
        "lang": "cpp",
        "lines": [
          "void dfs(int u) {",
          "    color[u] = GRAY;",
          "    for (int v : adj[u]) {",
          "        if (color[v] == WHITE) dfs(v);",
          {
            "blankId": "cycle",
            "indent": "        ",
            "placeholder": "обнаружение обратного ребра (цикла)",
            "hint": "else if (color[v] == GRAY) hasCycle = true;",
            "answers": [
              "else if (color[v] == GRAY) hasCycle = true;",
              "if (color[v] == GRAY) hasCycle = true;"
            ]
          },
          "    }",
          {
            "blankId": "black",
            "indent": "    ",
            "placeholder": "пометьте вершину u как завершённую",
            "hint": "color[u] = BLACK;",
            "answers": [
              "color[u] = BLACK;",
              "color[u] = 2;"
            ]
          },
          "    order.push_back(u);",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Проверка и объединение компонент в Крускале (Python)",
        "lang": "python",
        "lines": [
          "edges.sort()",
          "mst_weight = 0",
          "for w, u, v in edges:",
          "    ru, rv = find_set(u), find_set(v)",
          {
            "blankId": "diff",
            "indent": "    ",
            "placeholder": "проверка, что вершины в разных компонентах",
            "hint": "if ru != rv:",
            "answers": [
              "if ru != rv:",
              "if find_set(u) != find_set(v):"
            ]
          },
          "        parent[rv] = ru",
          {
            "blankId": "addw",
            "indent": "        ",
            "placeholder": "добавьте вес ребра к mst_weight",
            "hint": "mst_weight += w",
            "answers": [
              "mst_weight += w",
              "mst_weight = mst_weight + w"
            ]
          }
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Обновление потенциалов в Венгерском алгоритме (C++)",
        "lang": "cpp",
        "lines": [
          "for (int j = 0; j <= m; ++j) {",
          "    if (used[j]) {",
          {
            "blankId": "uupd",
            "indent": "        ",
            "placeholder": "обновите потенциал u[p[j]]",
            "hint": "u[p[j]] += delta;",
            "answers": [
              "u[p[j]] += delta;",
              "u[p[j]] = u[p[j]] + delta;"
            ]
          },
          {
            "blankId": "vupd",
            "indent": "        ",
            "placeholder": "обновите потенциал v[j]",
            "hint": "v[j] -= delta;",
            "answers": [
              "v[j] -= delta;",
              "v[j] = v[j] - delta;"
            ]
          },
          "    } else minv[j] -= delta;",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Проверка моста и точки сочленения (C++)",
        "lang": "cpp",
        "lines": [
          "dfs(to, v);",
          "fup[v] = min(fup[v], fup[to]);",
          {
            "blankId": "bridge",
            "indent": "",
            "placeholder": "условие того, что (v, to) — мост",
            "hint": "if (fup[to] > tin[v]) bridges.push_back({v, to});",
            "answers": [
              "if (fup[to] > tin[v]) bridges.push_back({v, to});"
            ]
          },
          {
            "blankId": "cut",
            "indent": "",
            "placeholder": "условие точки сочленения для некорневой вершины v",
            "hint": "if (fup[to] >= tin[v] && p != -1) isCut[v] = true;",
            "answers": [
              "if (fup[to] >= tin[v] && p != -1) isCut[v] = true;"
            ]
          }
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Второй проход Косарайю (Python)",
        "lang": "python",
        "lines": [
          "for v in reversed(order):",
          {
            "blankId": "cond",
            "indent": "    ",
            "placeholder": "проверка, что вершина v ещё не в компоненте",
            "hint": "if comp[v] == -1:",
            "answers": [
              "if comp[v] == -1:"
            ]
          },
          "        dfs2(v)",
          "        cid += 1"
        ]
      }
    ]
  }
];
