export const TOPICS = [
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
  ,
    fillBlanks: [
      {
        "title": "Выход и объединение в query (C++)",
        "lang": "cpp",
        "lines": [
          "long long query(int v, int tl, int tr, int l, int r) {",
          "    if (l > r) return 0;",
          {
            "blankId": "exact",
            "indent": "    ",
            "placeholder": "если отрезок полностью совпадает с запросом",
            "hint": "if (l == tl && r == tr) return tree[v];",
            "answers": [
              "if (l == tl && r == tr) return tree[v];",
              "if (l <= tl && tr <= r) return tree[v];"
            ]
          },
          "    int tm = (tl + tr) / 2;",
          "    return query(2*v, tl, tm, l, min(r, tm)) +",
          "           query(2*v+1, tm+1, tr, max(l, tm+1), r);",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Прыжки в дереве Фенвика (C++)",
        "lang": "cpp",
        "lines": [
          "void add(int i, long long delta) {",
          {
            "blankId": "addloop",
            "indent": "    ",
            "placeholder": "цикл вверх с шагом i += i & -i",
            "hint": "for (; i <= n; i += i & -i) bit[i] += delta;",
            "answers": [
              "for (; i <= n; i += i & -i) bit[i] += delta;"
            ]
          },
          "}",
          "long long sum(int i) {",
          "    long long res = 0;",
          {
            "blankId": "sumloop",
            "indent": "    ",
            "placeholder": "цикл вниз с шагом i -= i & -i",
            "hint": "for (; i > 0; i -= i & -i) res += bit[i];",
            "answers": [
              "for (; i > 0; i -= i & -i) res += bit[i];"
            ]
          },
          "    return res;",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Сжатие путей в find_set (C++)",
        "lang": "cpp",
        "lines": [
          "int find_set(int v) {",
          {
            "blankId": "base",
            "indent": "    ",
            "placeholder": "базовый случай: v является корнем",
            "hint": "if (v == parent[v]) return v;",
            "answers": [
              "if (v == parent[v]) return v;",
              "if (parent[v] == v) return v;"
            ]
          },
          {
            "blankId": "comp",
            "indent": "    ",
            "placeholder": "рекурсивный вызов со сжатием пути",
            "hint": "return parent[v] = find_set(parent[v]);",
            "answers": [
              "return parent[v] = find_set(parent[v]);"
            ]
          },
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Выравнивание глубин и возврат LCA (C++)",
        "lang": "cpp",
        "lines": [
          "for (int k = LOG - 1; k >= 0; --k)",
          {
            "blankId": "lift",
            "indent": "    ",
            "placeholder": "прыжок u вверх, если установлен k-й бит diff",
            "hint": "if ((diff >> k) & 1) u = up[u][k];",
            "answers": [
              "if ((diff >> k) & 1) u = up[u][k];"
            ]
          },
          "if (u == v) return u;",
          "for (int k = LOG - 1; k >= 0; --k)",
          "    if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }",
          {
            "blankId": "ret",
            "indent": "",
            "placeholder": "верните непосредственного родителя u",
            "hint": "return up[u][0];",
            "answers": [
              "return up[u][0];"
            ]
          }
        ]
      }
    ]
  }
];
