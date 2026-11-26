/**
 * Продвинутые учебные модули AlgoPortal:
 * 1) Режим «Найди баг в решении» (12 классических ошибок)
 * 2) Мастер выбора алгоритма и сравнительная матрица
 */

// ============================================================================
// 1. Охота на баги (Debugging Challenge)
// ============================================================================
const DEBUG_CASES = [
  {
    title: 'Бинарный поиск: бесконечный цикл',
    lang: 'C++',
    lines: [
      'int l = 0, r = n - 1;',
      'while (l < r) {',
      '    int m = (l + r) / 2;',
      '    if (a[m] <= target) l = m;',
      '    else r = m - 1;',
      '}'
    ],
    bugLine: 2,
    options: [
      'int m = (l + r + 1) / 2; (округление вверх)',
      'while (l <= r)',
      'r = m + 1;'
    ],
    correctOpt: 0,
    failingTest: 'n = 2, a = [1, 5], target = 1: при l=0, r=1 имеем m = (0+1)/2 = 0, l остаётся 0 навсегда (TL).',
    explanation: 'Когда сужаем левую границу как l = m (а не l = m + 1), середину нужно округлять вверх: l + (r - l + 1) / 2.'
  },
  {
    title: 'Алгоритм Дейкстры: квадратичное замедление',
    lang: 'C++',
    lines: [
      'while (!pq.empty()) {',
      '    auto [d, u] = pq.top(); pq.pop();',
      '    for (auto [v, w] : adj[u]) {',
      '        if (dist[u] + w < dist[v]) {',
      '            dist[v] = dist[u] + w;',
      '            pq.push({dist[v], v});',
      '        }',
      '    }',
      '}'
    ],
    bugLine: 2,
    options: [
      'Добавить if (d > dist[u]) continue; перед циклом по соседям',
      'Заменить pq.pop() на pq.push()',
      'Использовать queue вместо priority_queue'
    ],
    correctOpt: 0,
    failingTest: 'Плотный граф с многократным улучшением dist[u]: устаревшие пары в куче заново обходят все рёбра из u (TLE).',
    explanation: 'Без проверки d > dist[u] устаревшая запись из очереди запускает цикл по всем исходящим рёбрам, что на некоторых графах даёт O(V·E).'
  },
  {
    title: 'Модульная арифметика: переполнение int',
    lang: 'C++',
    lines: [
      'const int MOD = 1e9 + 7;',
      'int a = 1000000000, b = 1000000000;',
      'int ans = (a * b) % MOD;',
      'cout << ans << "\\n";'
    ],
    bugLine: 2,
    options: [
      'int ans = (1LL * a * b) % MOD;',
      'int ans = (a % MOD) * (b % MOD);',
      'const long long MOD = 1e9 + 7;'
    ],
    correctOpt: 0,
    failingTest: 'a = 10⁹, b = 10⁹: произведение 10¹⁸ не помещается в 32-битный int до взятия % MOD (WA / UB).',
    explanation: 'Умножение двух int происходит в типе int до операции % MOD. Приведение 1LL * a * b переводит вычисление в 64-битный long long.'
  },
  {
    title: 'BFS: повторное добавление вершин в очередь',
    lang: 'C++',
    lines: [
      'while (!q.empty()) {',
      '    int u = q.front(); q.pop();',
      '    used[u] = true;',
      '    for (int v : adj[u])',
      '        if (!used[v]) q.push(v);',
      '}'
    ],
    bugLine: 2,
    options: [
      'Помечать used[v] = true сразу при q.push(v), а не при pop()',
      'Заменить queue на stack',
      'Убрать проверку if (!used[v])'
    ],
    correctOpt: 0,
    failingTest: 'Полный двудольный граф K_{n,n}: вершина попадает в очередь от каждого соседа (MLE / TLE).',
    explanation: 'Если помечать вершину только при извлечении, несколько вершин одного слоя добавят одного и того же соседа в очередь.'
  },
  {
    title: 'DFS: бесконечная рекурсия',
    lang: 'Python',
    lines: [
      'def dfs(u):',
      '    for v in adj[u]:',
      '        if not used[v]:',
      '            dfs(v)'
    ],
    bugLine: 1,
    options: [
      'Добавить used[u] = True в начале функции dfs(u)',
      'Заменить adj[u] на adj[v]',
      'Добавить return u в конце цикла'
    ],
    correctOpt: 0,
    failingTest: 'Любой граф с ребром (0, 1): 0 → 1 → 0 → 1 ... (RecursionError).',
    explanation: 'Вершина u никогда не помечается как посещённая, поэтому рекурсия бесконечно ходит по одному и тому же ребру.'
  },
  {
    title: '0-1 Рюкзак в 1D-массиве: повторное взятие предмета',
    lang: 'C++',
    lines: [
      'vector<int> dp(W + 1, 0);',
      'for (int i = 0; i < n; ++i)',
      '    for (int w = wt[i]; w <= W; ++w)',
      '        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);'
    ],
    bugLine: 2,
    options: [
      'Развернуть цикл: for (int w = W; w >= wt[i]; --w)',
      'Начать цикл с w = 0',
      'Инициализировать dp значениями INF'
    ],
    correctOpt: 0,
    failingTest: '1 предмет (wt=2, val=5), W=6: код выдаст 15 вместо 5, взяв предмет 3 раза.',
    explanation: 'При обходе слева направо dp[w - wt[i]] уже обновлено текущим предметом i.'
  },
  {
    title: 'Префиксные суммы: выход за границу массива',
    lang: 'C++',
    lines: [
      'pref[0] = a[0];',
      'for (int i = 1; i < n; ++i) pref[i] = pref[i - 1] + a[i];',
      'long long query(int l, int r) {',
      '    return pref[r] - pref[l - 1];',
      '}'
    ],
    bugLine: 3,
    options: [
      'Использовать pref размера n+1 с pref[0]=0 и возвращать pref[r+1] - pref[l]',
      'Возвращать pref[r] - pref[l]',
      'Начинать цикл с i = 0'
    ],
    correctOpt: 0,
    failingTest: 'Запрос query(0, 3): обращение к pref[-1] (UB / мусор в ответе).',
    explanation: 'Без сдвига на +1 запрос с левой границей l = 0 обращается к отрицательному индексу pref[-1].'
  },
  {
    title: 'Точки сочленения: неверное обновление по обратному ребру',
    lang: 'C++',
    lines: [
      'for (int to : adj[v]) {',
      '    if (to == p) continue;',
      '    if (used[to]) fup[v] = min(fup[v], fup[to]);',
      '    else { dfs(to, v); ... }',
      '}'
    ],
    bugLine: 2,
    options: [
      'Обновлять через tin: fup[v] = min(fup[v], tin[to]);',
      'Удалить ветку if (used[to])',
      'Сделать fup[v] = max(fup[v], fup[to]);'
    ],
    correctOpt: 0,
    failingTest: 'Два цикла, соединённых в точке сочленения v: через fup[to] вершина «проскочит» выше v и не определит точку сочленения.',
    explanation: 'По обратному ребру можно подняться только до самой вершины to (tin[to]), но не выше по её собственным обратным рёбрам.'
  },
  {
    title: 'КМП: ложные вхождения без разделителя',
    lang: 'Python',
    lines: [
      's = pattern + text',
      'pi = prefix_function(s)',
      'ans = [i for i, v in enumerate(pi) if v == len(pattern)]'
    ],
    bugLine: 0,
    options: [
      'Добавить разделитель: s = pattern + "#" + text',
      'Поменять местами: s = text + pattern',
      'Проверять v >= len(pattern)'
    ],
    correctOpt: 0,
    failingTest: 'pattern = "ab", text = "ab": строка "abab", pi[3] = 2, но совпадение пересекает границу pattern и text.',
    explanation: 'Без уникального разделителя # префикс шаблона может склеиться с началом текста, давая ложные совпадения.'
  },
  {
    title: 'Бинарное возведение: случай m = 1',
    lang: 'C++',
    lines: [
      'long long binpow(long long a, long long n, long long m) {',
      '    long long res = 1;',
      '    while (n > 0) { if (n & 1) res = res * a % m; a = a * a % m; n >>= 1; }',
      '    return res;',
      '}'
    ],
    bugLine: 1,
    options: [
      'long long res = 1 % m;',
      'long long res = 0;',
      'while (n >= 0)'
    ],
    correctOpt: 0,
    failingTest: 'a = 5, n = 0, m = 1: цикл while не выполнится, функция вернёт 1 вместо 0 (5⁰ mod 1 = 0).',
    explanation: 'Любое число по модулю 1 равно 0, поэтому начальное значение res должно быть 1 % m.'
  },
  {
    title: 'Алгоритм Крускала: цикл в остове',
    lang: 'C++',
    lines: [
      'sort(edges.begin(), edges.end());',
      'for (auto [w, u, v] : edges) {',
      '    union_sets(u, v);',
      '    mstWeight += w;',
      '}'
    ],
    bugLine: 2,
    options: [
      'Добавить проверку if (find_set(u) != find_set(v)) перед объединением',
      'Отсортировать рёбра по убыванию',
      'Считать mstWeight до сортировки'
    ],
    correctOpt: 0,
    failingTest: 'Треугольник из рёбер весом 1, 2, 3: код добавит все 3 ребра (вес 6 вместо 3).',
    explanation: 'Ребро добавляется в MST только если его концы лежат в разных компонентах связности DSU.'
  },
  {
    title: 'LCA: потеря предка при выравнивании глубин',
    lang: 'C++',
    lines: [
      'for (int k = LOG - 1; k >= 0; --k)',
      '    if ((diff >> k) & 1) u = up[u][k];',
      'for (int k = LOG - 1; k >= 0; --k)',
      '    if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }',
      'return up[u][0];'
    ],
    bugLine: 2,
    options: [
      'Добавить if (u == v) return u; перед вторым циклом',
      'Возвращать u вместо up[u][0]',
      'Начинать второй цикл с k = 0'
    ],
    correctOpt: 0,
    failingTest: 'Запрос LCA(4, 2), где 2 — предок 4: после выравнивания u == v == 2, но код вернёт up[2][0] = 1 (WA).',
    explanation: 'Если одна вершина является предком другой, после выравнивания глубин они совпадут, и нужно сразу вернуть u.'
  }
];

const PROCEDURAL_TEMPLATES = [
  {
    title: 'Бинарный поиск (lower_bound)',
    lang: 'C++',
    cleanLines: [
      'int l = 0, r = n - 1, ans = n;',
      'while (l <= r) {',
      '    int m = l + (r - l) / 2;',
      '    if (a[m] >= target) { ans = m; r = m - 1; }',
      '    else l = m + 1;',
      '}'
    ],
    mutations: [
      {
        bugLine: 1,
        mutatedLine: 'while (l < r) {',
        options: ['while (l <= r) {', 'while (l != r) {', 'while (r - l > 1) {'],
        correctOpt: 0,
        failingTest: 'n = 1, a = [5], target = 5: цикл не выполнится, ответ останется ans = 1 вместо 0.',
        explanation: 'При границах [l, r] и ans = n условие l < r пропускает последний элемент при l == r.'
      },
      {
        bugLine: 3,
        mutatedLine: '    if (a[m] > target) { ans = m; r = m - 1; }',
        options: ['if (a[m] >= target) { ans = m; r = m - 1; }', 'if (a[m] == target)', 'r = m;'],
        correctOpt: 0,
        failingTest: 'a = [2, 5, 8], target = 5: строгое неравенство > пропустит a[1] = 5 и вернёт индекс 2 (upper_bound вместо lower_bound).',
        explanation: 'lower_bound ищет первый элемент >= target, а не строго > target.'
      }
    ]
  },
  {
    title: 'Алгоритм Дейкстры (priority_queue)',
    lang: 'C++',
    cleanLines: [
      'vector<long long> dist(n, 1e18); dist[s] = 0;',
      'pq.push({0, s});',
      'while (!pq.empty()) {',
      '    auto [d, u] = pq.top(); pq.pop();',
      '    if (d > dist[u]) continue;',
      '    for (auto [v, w] : adj[u])',
      '        if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }',
      '}'
    ],
    mutations: [
      {
        bugLine: 0,
        mutatedLine: 'vector<int> dist(n, 1e9); dist[s] = 0;',
        options: ['vector<long long> dist(n, 1e18); dist[s] = 0;', 'vector<int> dist(n, 1e6);', 'dist[s] = 1;'],
        correctOpt: 0,
        failingTest: 'Путь из 5 рёбер весом 10⁹: сумма 5·10⁹ переполнит 32-битный int.',
        explanation: 'При весах рёбер до 10⁹ суммарное расстояние может достигать 10¹⁴ — нужен long long и INF = 1e18.'
      },
      {
        bugLine: 4,
        mutatedLine: '    // нет проверки d > dist[u]',
        options: ['if (d > dist[u]) continue;', 'if (d < dist[u]) continue;', 'if (u == s) continue;'],
        correctOpt: 0,
        failingTest: 'Граф с многократным улучшением dist[u]: устаревшие пары в куче вызывают TLE.',
        explanation: 'Проверка d > dist[u] отсекает устаревшие записи из priority_queue.'
      }
    ]
  },
  {
    title: '2D ДП: 0-1 Рюкзак',
    lang: 'C++',
    cleanLines: [
      'for (int i = 1; i <= n; ++i) {',
      '    for (int w = 0; w <= W; ++w) {',
      '        dp[i][w] = dp[i - 1][w];',
      '        if (w >= wt[i - 1])',
      '            dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);',
      '    }',
      '}'
    ],
    mutations: [
      {
        bugLine: 4,
        mutatedLine: '            dp[i][w] = max(dp[i][w], dp[w - wt[i - 1]][i - 1] + val[i - 1]);',
        options: ['dp[i - 1][w - wt[i - 1]] + val[i - 1]', 'dp[i][w - wt[i]]', 'dp[i + 1][w]'],
        correctOpt: 0,
        failingTest: 'Перепутаны индексы i и w в таблице dp: выход за границы массива (RE / WA).',
        explanation: 'Первый индекс — номер предмета (i - 1), второй — оставшаяся вместимость (w - wt[i - 1]).'
      },
      {
        bugLine: 3,
        mutatedLine: '        if (w > wt[i - 1])',
        options: ['if (w >= wt[i - 1])', 'if (w <= wt[i - 1])', 'if (w == wt[i])'],
        correctOpt: 0,
        failingTest: 'Предмет весом ровно W: при строгом > предмет не будет взят (WA).',
        explanation: 'Предмет весом wt[i - 1] помещается в рюкзак вместимостью w, если w >= wt[i - 1].'
      }
    ]
  },
  {
    title: 'Дерево Фенвика (sum / add)',
    lang: 'C++',
    cleanLines: [
      'void add(int i, long long delta) {',
      '    for (; i <= n; i += i & -i) bit[i] += delta;',
      '}',
      'long long sum(int i) {',
      '    long long res = 0;',
      '    for (; i > 0; i -= i & -i) res += bit[i];',
      '    return res;',
      '}'
    ],
    mutations: [
      {
        bugLine: 5,
        mutatedLine: '    for (; i >= 0; i -= i & -i) res += bit[i];',
        options: ['for (; i > 0; i -= i & -i) res += bit[i];', 'for (; i > 1; i -= i & -i)', 'i += i & -i'],
        correctOpt: 0,
        failingTest: 'При достижении i = 0 выражение 0 - (0 & -0) остаётся 0: бесконечный цикл (TLE).',
        explanation: 'В 1-индексации дерева Фенвика цикл sum(i) обязан останавливаться при i > 0.'
      },
      {
        bugLine: 1,
        mutatedLine: '    for (; i < n; i += i & -i) bit[i] += delta;',
        options: ['for (; i <= n; i += i & -i) bit[i] += delta;', 'for (; i <= n; i -= i & -i)', 'bit[i] = delta;'],
        correctOpt: 0,
        failingTest: 'Запрос add(n, 5): последний элемент n в 1-индексации не обновится (off-by-one WA).',
        explanation: 'В 1-индексации последний элемент имеет индекс n, поэтому нужно i <= n.'
      }
    ]
  }
];

function generateProceduralCase() {
  const tpl = PROCEDURAL_TEMPLATES[Math.floor(Math.random() * PROCEDURAL_TEMPLATES.length)];
  const isClean = Math.random() < 0.18; // ~18% чистый код без бага
  if (isClean) {
    return {
      title: `${tpl.title} [Процедурный]`,
      lang: tpl.lang,
      lines: [...tpl.cleanLines],
      bugLine: -1,
      isClean: true,
      explanation: 'Этот фрагмент полностью корректен — в нём нет ни логических ошибок, ни переполнений.'
    };
  }
  const mut = tpl.mutations[Math.floor(Math.random() * tpl.mutations.length)];
  const lines = [...tpl.cleanLines];
  lines[mut.bugLine] = mut.mutatedLine;
  return {
    title: `${tpl.title} [Процедурный]`,
    lang: tpl.lang,
    lines,
    bugLine: mut.bugLine,
    options: mut.options,
    correctOpt: mut.correctOpt,
    failingTest: mut.failingTest,
    explanation: mut.explanation,
    isClean: false
  };
}

export function renderDebugHuntView(container, escapeHtml) {
  let mode = 'all'; // 'all' | 'procedural' | 'manual'
  let manualIdx = 0;
  let score = 0;
  let selectedLine = null;
  let solved = false;
  let currentCase = DEBUG_CASES[0];

  function pickNextCase() {
    selectedLine = null;
    solved = false;
    if (mode === 'procedural') {
      currentCase = generateProceduralCase();
    } else if (mode === 'manual') {
      currentCase = DEBUG_CASES[manualIdx];
      manualIdx = (manualIdx + 1) % DEBUG_CASES.length;
    } else {
      if (Math.random() < 0.5) {
        currentCase = generateProceduralCase();
      } else {
        currentCase = DEBUG_CASES[manualIdx];
        manualIdx = (manualIdx + 1) % DEBUG_CASES.length;
      }
    }
  }

  function render() {
    const dc = currentCase;
    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
      </div>
      <section class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-muted">${dc.lang} • ${dc.isClean ? 'Контрольная проверка' : 'Поиск бага'}</span>
            <h1 class="topic-title" style="margin-top:6px;">🐞 Охота на баги: ${escapeHtml(dc.title)}</h1>
          </div>
          <span class="badge badge-success">Решено: ${score}</span>
        </div>

        <div class="roadmap-filters" style="margin-bottom:12px;">
          <button type="button" class="filter-chip ${mode === 'all' ? 'active' : ''}" data-dh-mode="all">Все баги</button>
          <button type="button" class="filter-chip ${mode === 'procedural' ? 'active' : ''}" data-dh-mode="procedural">Только процедурные (бесконечный режим)</button>
          <button type="button" class="filter-chip ${mode === 'manual' ? 'active' : ''}" data-dh-mode="manual">Классические ловушки</button>
        </div>

        <p style="color:var(--text-secondary); margin:0 0 10px;">
          Кликните по строке кода с ошибкой (или нажмите «Код корректен!», если бага нет).
        </p>

        <div class="code-block-wrap">
          <div class="trace-code-lines">
            ${dc.lines
              .map(
                (ln, lIdx) => `
              <div class="trace-line debug-line ${selectedLine === lIdx ? 'active' : ''}" data-dline="${lIdx}">
                <span class="trace-line-num">${lIdx + 1}</span>
                <span>${escapeHtml(ln)}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>

        <div style="margin-top:12px;">
          <button type="button" id="debug-clean-btn" class="btn btn-secondary btn-sm">✓ Код корректен (бага нет)!</button>
        </div>

        <div id="debug-step2" style="margin-top:14px;" hidden>
          <div style="font-weight:600; font-size:14px; margin-bottom:8px;">Выберите исправление:</div>
          <div class="blitz-options">
            ${(dc.options || [])
              .map((opt, oIdx) => `<button type="button" class="blitz-opt-btn" data-fix="${oIdx}">${escapeHtml(opt)}</button>`)
              .join('')}
          </div>
        </div>

        <div id="debug-feedback" class="step-explanation" style="margin-top:14px;" hidden></div>

        <div style="margin-top:14px; display:flex; justify-content:flex-end;">
          <button type="button" id="debug-next-btn" class="btn btn-primary btn-sm" hidden>Следующая задача →</button>
        </div>
      </section>
    `;

    const step2 = document.getElementById('debug-step2');
    const fb = document.getElementById('debug-feedback');
    const nextBtn = document.getElementById('debug-next-btn');

    container.querySelectorAll('[data-dh-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.getAttribute('data-dh-mode');
        pickNextCase();
        render();
      });
    });

    document.getElementById('debug-clean-btn').addEventListener('click', () => {
      if (solved) return;
      solved = true;
      step2.hidden = true;
      if (dc.isClean) {
        score++;
        fb.style.borderLeftColor = 'var(--success)';
        fb.innerHTML = `<strong>✓ Верно!</strong> ${escapeHtml(dc.explanation)}`;
      } else {
        fb.style.borderLeftColor = 'var(--danger)';
        fb.innerHTML = `<strong>✕ На самом деле здесь есть баг в строке ${dc.bugLine + 1}.</strong> ${escapeHtml(dc.explanation)}`;
      }
      fb.hidden = false;
      nextBtn.hidden = false;
    });

    container.querySelectorAll('[data-dline]').forEach((el) => {
      el.addEventListener('click', () => {
        if (solved) return;
        const clicked = Number(el.getAttribute('data-dline'));
        selectedLine = clicked;
        container.querySelectorAll('[data-dline]').forEach((x) => x.classList.remove('active'));
        el.classList.add('active');

        if (!dc.isClean && clicked === dc.bugLine) {
          fb.hidden = true;
          step2.hidden = false;
          step2.querySelector('div').textContent = `✓ Верная строка (${clicked + 1})! Выберите исправление:`;
        } else {
          step2.hidden = true;
          fb.style.borderLeftColor = 'var(--warning)';
          fb.textContent = dc.isClean
            ? `В строке ${clicked + 1} ошибки нет (проверьте, может быть весь код корректен?).`
            : `В строке ${clicked + 1} ошибки нет. Посмотрите внимательнее на условия циклов, границы и переполнения.`;
          fb.hidden = false;
        }
      });
    });

    container.querySelectorAll('[data-fix]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (solved) return;
        solved = true;
        const chosen = Number(btn.getAttribute('data-fix'));
        const ok = chosen === dc.correctOpt;
        container.querySelectorAll('[data-fix]').forEach((b, i) => {
          b.disabled = true;
          if (i === dc.correctOpt) b.classList.add('correct');
          else if (i === chosen) b.classList.add('wrong');
        });
        if (ok) score++;
        fb.style.borderLeftColor = ok ? 'var(--success)' : 'var(--danger)';
        fb.innerHTML = `<strong>${ok ? '✓ Отлично!' : '✕ Неверный фикс.'}</strong> ${escapeHtml(dc.explanation)}<br><span style="color:var(--text-secondary); font-size:12.5px;">Падающий тест: ${escapeHtml(dc.failingTest)}</span>`;
        fb.hidden = false;
        nextBtn.hidden = false;
      });
    });

    nextBtn.addEventListener('click', () => {
      pickNextCase();
      render();
    });
  }

  render();
}

// ============================================================================
// 2. Дерево решений «Какой алгоритм выбрать?» и Сравнительная матрица
// ============================================================================
const DECISION_TREE = {
  graphs: {
    label: 'Графы',
    questions: [
      { label: 'Невзвешенный граф — найти кратчайшие пути от 1 вершины', algo: 'Поиск в ширину (BFS)', complexity: 'O(V + E)', topicId: 'bfs' },
      { label: 'Взвешенный граф (веса ≥ 0) — кратчайшие пути', algo: 'Алгоритм Дейкстры', complexity: 'O((V + E) log V)', topicId: 'dijkstra' },
      { label: 'Поиск циклов или топологическая сортировка в DAG', algo: 'DFS (3 цвета)', complexity: 'O(V + E)', topicId: 'dfs' },
      { label: 'Минимальное остовное дерево (MST)', algo: 'Алгоритм Крускала + DSU', complexity: 'O(E log E)', topicId: 'kruskal' },
      { label: 'Мосты и точки сочленения', algo: 'Алгоритм Тарьяна (tin / fup)', complexity: 'O(V + E)', topicId: 'bridges-ap' },
      { label: 'Компоненты сильной связности (SCC)', algo: 'Алгоритм Косарайю', complexity: 'O(V + E)', topicId: 'scc' },
      { label: 'Запросы LCA или расстояния в дереве', algo: 'LCA (Двоичные подъёмы)', complexity: 'O(log N) на запрос', topicId: 'lca' }
    ]
  },
  ranges: {
    label: 'Отрезки и массивы',
    questions: [
      { label: 'Поиск значения / ответа на монотонной функции', algo: 'Бинарный поиск (lower_bound)', complexity: 'O(log N)', topicId: 'binary-search' },
      { label: 'Сумма на отрезке БЕЗ обновлений элементов', algo: 'Префиксные суммы', complexity: 'O(N + Q)', topicId: 'sorting-prefix' },
      { label: 'Сумма на отрезке С точечными обновлениями (простой код)', algo: 'Дерево Фенвика (BIT)', complexity: 'O(log N)', topicId: 'fenwick-tree' },
      { label: 'Любая ассоциативная операция (min/max/sum) с обновлениями', algo: 'Дерево отрезков', complexity: 'O(log N)', topicId: 'segment-tree' },
      { label: 'Самый длинный/короткий подотрезок с монотонным условием', algo: 'Метод двух указателей', complexity: 'O(N)', topicId: 'two-pointers' }
    ]
  },
  strings: {
    label: 'Строки',
    questions: [
      { label: 'Поиск подстроки / границы (бордеры) строки', algo: 'Префикс-функция (КМП) / Z-функция', complexity: 'O(N)', topicId: 'prefix-function' },
      { label: 'Наибольшая общая подпоследовательность или правки', algo: 'LCS / Расстояние Левенштейна', complexity: 'O(|s1| · |s2|)', topicId: 'lcs-levenshtein' }
    ]
  },
  dp: {
    label: 'ДП и комбинаторика',
    questions: [
      { label: 'Выбор предметов ограниченного веса W', algo: 'ДП: 0-1 Рюкзак', complexity: 'O(N · W)', topicId: 'knapsack' },
      { label: 'Обход всех N ≤ 20 вершин (гамильтонов цикл)', algo: 'TSP — ДП по битовым маскам', complexity: 'O(n² · 2ⁿ)', topicId: 'tsp' },
      { label: 'Оптимальное назначение N × N (работники и задачи)', algo: 'Венгерский алгоритм', complexity: 'O(N³)', topicId: 'assignment-hungarian' }
    ]
  },
  math: {
    label: 'Теория чисел',
    questions: [
      { label: 'Найти все простые числа до N ≤ 10⁷', algo: 'Решето Эратосфена', complexity: 'O(N log log N)', topicId: 'sieve' },
      { label: 'Вычислить aⁿ mod m при больших n', algo: 'Бинарное возведение в степень', complexity: 'O(log n)', topicId: 'binpow' },
      { label: 'Решить a·x + b·y = gcd(a, b) или найти обратный элемент', algo: 'Расширенный алгоритм Евклида', complexity: 'O(log min(a, b))', topicId: 'ext-gcd' },
      { label: 'Восстановить число по остаткам от взаимно простых модулей', algo: 'Китайская теорема об остатках', complexity: 'O(k log M)', topicId: 'crt' }
    ]
  }
};

export function renderAlgoSelectorView(container, escapeHtml) {
  let selectedCat = 'graphs';

  function render() {
    const cat = DECISION_TREE[selectedCat];
    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
      </div>

      <section class="card">
        <h1 class="topic-title" style="margin-top:0;">🧭 Мастер выбора алгоритма</h1>
        <p style="color:var(--text-secondary); margin-top:4px;">
          Выберите область задачи и свойства данных, чтобы сразу подобрать оптимальный алгоритм и перейти к разбору.
        </p>

        <div class="roadmap-filters" style="margin-top:14px;">
          ${Object.entries(DECISION_TREE)
            .map(
              ([key, val]) =>
                `<button type="button" class="filter-chip ${selectedCat === key ? 'active' : ''}" data-sel-cat="${key}">${escapeHtml(val.label)}</button>`
            )
            .join('')}
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${cat.questions
            .map(
              (q) => `
            <a href="#topic=${q.topicId}" class="problem-link-card" style="padding:14px 16px;">
              <div>
                <div style="font-size:13px; color:var(--text-secondary);">${escapeHtml(q.label)}</div>
                <div style="font-size:15.5px; font-weight:600; color:var(--text-primary); margin-top:2px;">→ ${escapeHtml(q.algo)}</div>
              </div>
              <span class="badge badge-accent">${escapeHtml(q.complexity)}</span>
            </a>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">Сравнительная матрица: кратчайшие пути и запросы на отрезках</h2>
        <div class="calc-table-wrap">
          <table class="calc-table">
            <thead>
              <tr>
                <th>Алгоритм</th>
                <th>Асимптотика</th>
                <th>Ограничения / Свойства</th>
                <th>Когда выбирать</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#topic=bfs">BFS</a></td>
                <td class="mono">O(V + E)</td>
                <td>Только невзвешенные графы (или веса = 1)</td>
                <td>Кратчайший путь по числу рёбер</td>
              </tr>
              <tr>
                <td><a href="#topic=dijkstra">Дейкстра</a></td>
                <td class="mono">O((V + E) log V)</td>
                <td>Неотрицательные веса рёбер (w ≥ 0)</td>
                <td>Основной выбор для взвешенных графов</td>
              </tr>
              <tr>
                <td class="mono" style="color:var(--text-secondary);">Форд–Беллман</td>
                <td class="mono">O(V · E)</td>
                <td>Допускает отрицательные веса и циклы</td>
                <td>Малые графы (V ≤ 2000) с w &lt; 0</td>
              </tr>
              <tr>
                <td><a href="#topic=sorting-prefix">Префиксные суммы</a></td>
                <td class="mono">O(N) / O(1)</td>
                <td>Без обновлений, обратимая операция (+)</td>
                <td>Статический массив, много запросов суммы</td>
              </tr>
              <tr>
                <td><a href="#topic=fenwick-tree">Дерево Фенвика</a></td>
                <td class="mono">O(log N)</td>
                <td>Точечные обновления, обратимая операция</td>
                <td>Быстрее и короче ДО для сумм и XOR</td>
              </tr>
              <tr>
                <td><a href="#topic=segment-tree">Дерево отрезков</a></td>
                <td class="mono">O(log N)</td>
                <td>Любая ассоциативная операция (min/max/gcd/sum)</td>
                <td>Универсальный солдат для отрезков</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `;

    container.querySelectorAll('[data-sel-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCat = btn.getAttribute('data-sel-cat');
        render();
      });
    });
  }

  render();
}
