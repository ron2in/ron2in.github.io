/**
 * Лёгкий индекс тем AlgoPortal для меню, поиска, роадмапа и динамической загрузки.
 */
export const TOPICS_INDEX = [
  {
    "id": "binary-search",
    "title": "Бинарный поиск (lower_bound)",
    "category": "Поиск и массивы",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(log N)",
    "spaceComplexity": "O(1)",
    "summary": "Бинарный поиск на отсортированном массиве позволяет за логарифмическое время найти первый элемент, который больше либо равен заданному значению target (lower_bound), а также используется для «бинарного поиска по ответу» на монотонных функциях.",
    "modulePath": "./topics/arrays.js"
  },
  {
    "id": "bfs",
    "title": "Поиск в ширину (BFS)",
    "category": "Графы",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V)",
    "summary": "Поиск в ширину (Breadth-First Search) обходит граф слоями в порядке удаления от стартовой вершины. В невзвешенном графе BFS гарантированно находит кратчайшие пути от стартовой вершины до всех достижимых.",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "two-pointers",
    "title": "Метод двух указателей",
    "category": "Поиск и массивы",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "summary": "Техника поддержания двух индексов L и R, которые монотонно двигаются в одном направлении по массиву. На массиве неотрицательных чисел позволяет за линейное время найти подотрезок с заданной суммой target.",
    "modulePath": "./topics/arrays.js"
  },
  {
    "id": "sorting-prefix",
    "title": "Сортировки и префиксные суммы",
    "category": "Поиск и массивы",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(N log N + Q)",
    "spaceComplexity": "O(N)",
    "summary": "Сортировка упорядочивает элементы массива, а массив префиксных сумм pref[i] = a[0] + ... + a[i-1] позволяет отвечать на любой запрос суммы на отрезке [l, r] за O(1) по формуле pref[r + 1] - pref[l].",
    "modulePath": "./topics/arrays.js"
  },
  {
    "id": "dijkstra",
    "title": "Алгоритм Дейкстры",
    "category": "Графы",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O((V + E) log V)",
    "spaceComplexity": "O(V + E)",
    "summary": "Жадный алгоритм нахождения кратчайших путей от одной стартовой вершины до всех остальных во взвешенном графе с неотрицательными весами рёбер. На каждом шаге извлекается вершина с минимальным текущим расстоянием и выполняются релаксации исходящих рёбер.",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "knapsack",
    "title": "ДП: Задача о рюкзаке (0-1)",
    "category": "Динамическое программирование",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(N · W)",
    "spaceComplexity": "O(N · W)",
    "summary": "Классическая задача динамического программирования: даны N предметов с весами wt[i] и стоимостями val[i], нужно набрать максимальную стоимость при ограничении вместимости рюкзака W (каждый предмет можно взять не более одного раза).",
    "modulePath": "./topics/dp.js"
  },
  {
    "id": "segment-tree",
    "title": "Дерево отрезков (Segment Tree)",
    "category": "Структуры данных",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(N) построение, O(log N) запрос",
    "spaceComplexity": "O(4N)",
    "summary": "Универсальная древовидная структура данных, позволяющая за O(log N) отвечать на ассоциативные запросы на отрезке [l, r] (сумма, минимум, максимум) и обновлять значения элементов массива.",
    "modulePath": "./topics/trees.js"
  },
  {
    "id": "prefix-function",
    "title": "Префикс-функция (КМП) и Z-функция",
    "category": "Строки",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "summary": "Префикс-функция π[i] — длина наибольшего собственного суффикса подстроки s[0..i], совпадающего с её префиксом. Z-функция z[i] — длина наибольшего общего префикса строки s и её суффикса s[i..n-1]. Обе вычисляются за линейное время O(N) и позволяют находить все вхождения шаблона P в текст T через строку P + \"#\" + T.",
    "modulePath": "./topics/strings.js"
  },
  {
    "id": "fenwick-tree",
    "title": "Дерево Фенвика (Binary Indexed Tree)",
    "category": "Структуры данных",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(log N) запрос и обновление",
    "spaceComplexity": "O(N)",
    "summary": "Сверхкомпактная структура данных (BIT) для префиксных сумм и точечных обновлений за O(log N). В 1-индексации ячейка bit[i] отвечает за отрезок длиной i & -i (младший единичный бит числа i). Запрос sum(r) делает прыжки i -= i & -i, а обновление add(idx, delta) — i += i & -i.",
    "modulePath": "./topics/trees.js"
  },
  {
    "id": "lcs-levenshtein",
    "title": "LCS и Расстояние Левенштейна",
    "category": "Динамическое программирование",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(|s₁| · |s₂|)",
    "spaceComplexity": "O(|s₁| · |s₂|)",
    "summary": "Классические задачи ДП на двух строках. LCS находит длину наибольшей общей подпоследовательности (при s1[i-1] == s2[j-1] берём dp[i-1][j-1] + 1, иначе max(dp[i-1][j], dp[i][j-1])). Расстояние Левенштейна находит минимальное число вставок, удалений и замен символов для превращения s1 в s2.",
    "modulePath": "./topics/dp.js"
  },
  {
    "id": "dfs",
    "title": "DFS: циклы и топологическая сортировка",
    "category": "Графы",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V)",
    "summary": "Поиск в глубину (Depth-First Search) с раскраской вершин в 3 цвета: белый (не посещена), серый (в текущем стеке рекурсии) и чёрный (обработка завершена). Переход в серую вершину означает наличие цикла, а в ацикличном ориентированном графе (DAG) обратный порядок выхода tout даёт топологическую сортировку.",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "kruskal",
    "title": "Алгоритм Крускала (MST)",
    "category": "Графы",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(E log E)",
    "spaceComplexity": "O(V + E)",
    "summary": "Жадный алгоритм построения минимального остовного дерева (Minimum Spanning Tree) во взвешенном неориентированном графе: все рёбра сортируются по возрастанию веса и поочерёдно добавляются в остов, если не образуют цикл (проверка через DSU).",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "dsu",
    "title": "Система непересекающихся множеств (DSU)",
    "category": "Структуры данных",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(α(N))",
    "spaceComplexity": "O(N)",
    "summary": "Структура данных (Disjoint Set Union) для представления непересекающихся множеств в виде леса корневых деревьев. Эвристики сжатия путей (path compression) в find_set и объединения по рангу/размеру в union_sets дают амортизированное время O(α(N)) ≈ O(1) на операцию.",
    "modulePath": "./topics/trees.js"
  },
  {
    "id": "tsp",
    "title": "Задача коммивояжёра (TSP — ДП по маскам)",
    "category": "Динамическое программирование",
    "difficulty": "Продвинутый",
    "isStub": false,
    "timeComplexity": "O(n² · 2ⁿ)",
    "spaceComplexity": "O(n · 2ⁿ)",
    "summary": "Постановка: дан полный взвешенный граф G = (V, E) с матрицей расстояний w(i, j). Требуется найти гамильтонов цикл минимального веса, проходящий через все n вершин ровно по одному разу и возвращающийся в стартовую вершину: min ∑ w(v_i, v_{i+1}). Идея: состояние dp[mask][v] хранит минимальную стоимость пути, посетившего подмножество вершин mask и закончившегося в вершине v. Переход: dp[mask][v] = min_{u ∈ mask \\ {v}} (dp[mask \\ {v}][u] + w(u, v)).",
    "modulePath": "./topics/dp.js"
  },
  {
    "id": "assignment-hungarian",
    "title": "Задача о назначениях (Венгерский алгоритм)",
    "category": "Графы",
    "difficulty": "Продвинутый",
    "isStub": false,
    "timeComplexity": "O(n³)",
    "spaceComplexity": "O(n²)",
    "summary": "Постановка: дана квадратная матрица стоимостей C = (c_{ij}) размера n × n (назначение n работников на n задач). Требуется выбрать перестановку π ∈ S_n, минимизирующую суммарную стоимость ∑ c_{i, π(i)} (паросочетание минимального веса в полном двудольном графе). Венгерский алгоритм использует редукцию строк/столбцов и метод потенциалов Джонсона (u_i + v_j ≤ c_{ij}), что эквивалентно поиску потока минимальной стоимости (Min-Cost Max-Flow) за O(n³).",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "sieve",
    "title": "Решето Эратосфена",
    "category": "Теория чисел и математика",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(N log log N)",
    "spaceComplexity": "O(N)",
    "summary": "Классический алгоритм нахождения всех простых чисел до N. Проходя числа p от 2 до √N, если p не вычеркнуто, оно простое — вычёркиваем все его кратные, начиная с p² (так как меньшие кратные p·k при k < p уже вычеркнуты делителями числа k).",
    "modulePath": "./topics/math.js"
  },
  {
    "id": "binpow",
    "title": "Бинарное возведение в степень (aⁿ mod m)",
    "category": "Теория чисел и математика",
    "difficulty": "Базовый",
    "isStub": false,
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)",
    "summary": "Быстрое вычисление aⁿ mod m за O(log n) умножений путём разложения показателя n в двоичную систему: если младший бит n равен 1, умножаем ответ res на текущую степень основания a, затем возводим a в квадрат и сдвигаем n вправо (n >>= 1).",
    "modulePath": "./topics/math.js"
  },
  {
    "id": "ext-gcd",
    "title": "Расширенный алгоритм Евклида",
    "category": "Теория чисел и математика",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(log(min(a, b)))",
    "spaceComplexity": "O(log(min(a, b)))",
    "summary": "Помимо нахождения наибольшего общего делителя gcd(a, b), расширенный алгоритм Евклида находит целые коэффициенты Безу x и y такие, что a·x + b·y = gcd(a, b). Используется для решения диофантовых уравнений и поиска обратного элемента по непростому модулю.",
    "modulePath": "./topics/math.js"
  },
  {
    "id": "crt",
    "title": "Китайская теорема об остатках (КТО)",
    "category": "Теория чисел и математика",
    "difficulty": "Средний",
    "isStub": false,
    "timeComplexity": "O(k log M)",
    "spaceComplexity": "O(k)",
    "summary": "Если модули m₁, m₂, ..., mₖ попарно взаимно просты, система сравнений x ≡ rᵢ (mod mᵢ) имеет единственное решение по модулю M = ∏ mᵢ. Решение строится как x ≡ ∑ rᵢ · Mᵢ · (Mᵢ⁻¹ mod mᵢ) (mod M), где Mᵢ = M / mᵢ.",
    "modulePath": "./topics/math.js"
  },
  {
    "id": "bridges-ap",
    "title": "Поиск мостов и точек сочленения",
    "category": "Графы",
    "difficulty": "Продвинутый",
    "isStub": false,
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V)",
    "summary": "Алгоритм Тарьяна за один DFS вычисляет для каждой вершины время входа tin[v] и минимальное достижимое время по обратным рёбрам fup[v]. Ребро (v, to) является мостом, если fup[to] > tin[v]. Вершина v (не корень) является точкой сочленения, если найдётся потомок to с fup[to] >= tin[v] (а корень — если у него ≥ 2 детей в дереве DFS).",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "scc",
    "title": "Компоненты сильной связности (Косарайю)",
    "category": "Графы",
    "difficulty": "Продвинутый",
    "isStub": false,
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V + E)",
    "summary": "Алгоритм Косарайю находит все компоненты сильной связности (SCC) в ориентированном графе за два обхода DFS: 1) первый DFS на исходном графе запоминает порядок выхода tout; 2) инвертируем все рёбра графа и запускаем второй DFS в порядке убывания tout — каждый запуск выделяет ровно одну компоненту сильной связности.",
    "modulePath": "./topics/graphs.js"
  },
  {
    "id": "lca",
    "title": "LCA — Наименьший общий предок (Binary Lifting)",
    "category": "Деревья",
    "difficulty": "Продвинутый",
    "isStub": false,
    "timeComplexity": "O(N log N) преподсчёт, O(log N) запрос",
    "spaceComplexity": "O(N log N)",
    "summary": "Метод двоичных подъёмов: для каждой вершины v вычисляется таблица предков up[v][k] на расстоянии 2^k шагов вверх. Для ответа на запрос lca(u, v) сначала выравниваем глубины u и v двоичными прыжками, затем одновременно поднимаем обе вершины, пока up[u][k] ≠ up[v][k], и возвращаем непосредственного родителя up[u][0].",
    "modulePath": "./topics/trees.js"
  }
];

const topicCache = new Map();

export async function loadTopicById(id) {
  if (topicCache.has(id)) return topicCache.get(id);
  const meta = TOPICS_INDEX.find((t) => t.id === id);
  if (!meta) return null;
  const mod = await import(meta.modulePath);
  for (const t of mod.TOPICS || []) {
    topicCache.set(t.id, t);
  }
  return topicCache.get(id) || null;
}

export async function loadTopicsByIds(ids) {
  const uniquePaths = [...new Set(
    ids.map((id) => TOPICS_INDEX.find((t) => t.id === id)?.modulePath).filter(Boolean)
  )];
  await Promise.all(
    uniquePaths.map(async (p) => {
      const mod = await import(p);
      for (const t of mod.TOPICS || []) {
        topicCache.set(t.id, t);
      }
    })
  );
  return ids.map((id) => topicCache.get(id)).filter(Boolean);
}

export async function preloadAllTopics() {
  const uniquePaths = [...new Set(TOPICS_INDEX.map((t) => t.modulePath))];
  await Promise.all(
    uniquePaths.map(async (p) => {
      const mod = await import(p);
      for (const t of mod.TOPICS || []) {
        topicCache.set(t.id, t);
      }
    })
  );
  return topicCache.size;
}
