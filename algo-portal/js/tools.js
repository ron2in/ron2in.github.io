/**
 * Дополнительные инструменты AlgoPortal:
 * 1) Генератор тестов и стресс-тестер
 * 2) Справочник STL (C++) vs Python
 * 3) Интерактивный тренажёр побитовых операций
 * 4) Блиц-тренировка (выбор алгоритма по ограничениям)
 */

// ============================================================================
// 1. Генератор тестов
// ============================================================================
export function renderGeneratorView(container, showToast, escapeHtml) {
  let activeTab = 'array';

  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
    </div>
    <section class="card">
      <h1 class="topic-title" style="margin-top:0;">Генератор тестов и стресс-тестер</h1>
      <p style="color:var(--text-secondary); margin-top:4px;">
        Быстрая генерация случайных массивов, перестановок, строк и графов (включая случайные деревья по коду Прюфера) для локального тестирования.
      </p>

      <div class="tabs-header">
        <div class="tabs-list">
          <button type="button" class="tab-btn active" data-gen-tab="array">Массив / Перестановка</button>
          <button type="button" class="tab-btn" data-gen-tab="string">Строка</button>
          <button type="button" class="tab-btn" data-gen-tab="graph">Граф / Дерево</button>
        </div>
      </div>

      <div id="gen-form-mount"></div>
      <div style="margin-top:12px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <label class="checkbox-pill">
          <input type="checkbox" id="gen-include-header" checked>
          <span>Выводить N (и M) в первой строке</span>
        </label>
        <button type="button" id="gen-run-btn" class="btn btn-primary btn-sm">⚡ Сгенерировать и скопировать</button>
      </div>
      <pre id="gen-output" class="test-output-box">Нажмите «Сгенерировать и скопировать»...</pre>
    </section>
  `;

  const formMount = document.getElementById('gen-form-mount');
  const outputEl = document.getElementById('gen-output');

  const randInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

  function renderForm() {
    if (activeTab === 'array') {
      formMount.innerHTML = `
        <div class="custom-input-form">
          <div class="form-field">
            <label for="gen-arr-type">Тип</label>
            <select id="gen-arr-type" class="select-field">
              <option value="array">Случайный массив</option>
              <option value="sorted">Отсортированный массив</option>
              <option value="perm">Случайная перестановка 1..N</option>
            </select>
          </div>
          <div class="form-field" style="max-width:110px;">
            <label for="gen-n">N</label>
            <input id="gen-n" type="number" class="input-field input-mono" value="10" min="1" max="500">
          </div>
          <div class="form-field" style="max-width:110px;">
            <label for="gen-min">min</label>
            <input id="gen-min" type="number" class="input-field input-mono" value="1">
          </div>
          <div class="form-field" style="max-width:110px;">
            <label for="gen-max">max</label>
            <input id="gen-max" type="number" class="input-field input-mono" value="100">
          </div>
        </div>
      `;
    } else if (activeTab === 'string') {
      formMount.innerHTML = `
        <div class="custom-input-form">
          <div class="form-field">
            <label for="gen-str-alpha">Алфавит</label>
            <select id="gen-str-alpha" class="select-field">
              <option value="az">Строчные латинские (a-z)</option>
              <option value="01">Бинарная строка (0-1)</option>
              <option value="custom">Произвольный алфавит</option>
            </select>
          </div>
          <div class="form-field" id="gen-custom-alpha-wrap" hidden>
            <label for="gen-custom-alpha">Символы алфавита</label>
            <input id="gen-custom-alpha" type="text" class="input-field input-mono" value="abc">
          </div>
          <div class="form-field" style="max-width:120px;">
            <label for="gen-n">Длина N</label>
            <input id="gen-n" type="number" class="input-field input-mono" value="20" min="1" max="1000">
          </div>
        </div>
      `;
      document.getElementById('gen-str-alpha').addEventListener('change', (e) => {
        document.getElementById('gen-custom-alpha-wrap').hidden = e.target.value !== 'custom';
      });
    } else {
      formMount.innerHTML = `
        <div class="custom-input-form">
          <div class="form-field">
            <label for="gen-graph-type">Тип графа</label>
            <select id="gen-graph-type" class="select-field">
              <option value="tree">Дерево (код Прюфера)</option>
              <option value="connected">Связный граф</option>
              <option value="dag">DAG (ориентированный ацикличный)</option>
              <option value="complete">Полный граф</option>
            </select>
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="gen-n">Вершин N</label>
            <input id="gen-n" type="number" class="input-field input-mono" value="6" min="2" max="100">
          </div>
          <div class="form-field" style="max-width:95px;">
            <label for="gen-m">Рёбер M</label>
            <input id="gen-m" type="number" class="input-field input-mono" value="8" min="1" max="500">
          </div>
          <div class="form-field" style="max-width:130px;">
            <label for="gen-weighted">Веса рёбер</label>
            <select id="gen-weighted" class="select-field">
              <option value="no">Невзвешенный</option>
              <option value="yes">Взвешенный</option>
            </select>
          </div>
          <div class="form-field" style="max-width:90px;">
            <label for="gen-min">min W</label>
            <input id="gen-min" type="number" class="input-field input-mono" value="1">
          </div>
          <div class="form-field" style="max-width:90px;">
            <label for="gen-max">max W</label>
            <input id="gen-max" type="number" class="input-field input-mono" value="20">
          </div>
        </div>
      `;
    }
  }

  function generateTestText() {
    const withHeader = document.getElementById('gen-include-header').checked;
    const n = Math.max(1, Math.min(1000, Number(document.getElementById('gen-n').value) || 10));

    if (activeTab === 'array') {
      const type = document.getElementById('gen-arr-type').value;
      const lo = Number(document.getElementById('gen-min').value) || 1;
      const hi = Math.max(lo, Number(document.getElementById('gen-max').value) || 100);
      let arr = [];
      if (type === 'perm') {
        arr = Array.from({ length: n }, (_, i) => i + 1);
        for (let i = n - 1; i > 0; i--) {
          const j = randInt(0, i);
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      } else {
        arr = Array.from({ length: n }, () => randInt(lo, hi));
        if (type === 'sorted') arr.sort((a, b) => a - b);
      }
      return (withHeader ? `${n}\n` : '') + arr.join(' ');
    }

    if (activeTab === 'string') {
      const mode = document.getElementById('gen-str-alpha').value;
      let alpha = 'abcdefghijklmnopqrstuvwxyz';
      if (mode === '01') alpha = '01';
      else if (mode === 'custom') {
        alpha = document.getElementById('gen-custom-alpha').value || 'abc';
      }
      let s = '';
      for (let i = 0; i < n; i++) s += alpha[randInt(0, alpha.length - 1)];
      return (withHeader ? `${n}\n` : '') + s;
    }

    // Graph
    const gType = document.getElementById('gen-graph-type').value;
    const weighted = document.getElementById('gen-weighted').value === 'yes';
    const lo = Number(document.getElementById('gen-min').value) || 1;
    const hi = Math.max(lo, Number(document.getElementById('gen-max').value) || 20);
    const maxEdges = Math.floor((n * (n - 1)) / 2);
    const targetM = Math.max(n - 1, Math.min(maxEdges, Number(document.getElementById('gen-m').value) || n));

    let edges = [];
    const edgeSet = new Set();
    const addEdge = (u, v) => {
      const key = gType === 'dag' ? `${u}->${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (u !== v && !edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([u, v]);
        return true;
      }
      return false;
    };

    if (gType === 'complete') {
      for (let u = 1; u <= n; u++) {
        for (let v = u + 1; v <= n; v++) addEdge(u, v);
      }
    } else if (gType === 'dag') {
      const perm = Array.from({ length: n }, (_, i) => i + 1);
      for (let i = n - 1; i > 0; i--) {
        const j = randInt(0, i);
        [perm[i], perm[j]] = [perm[j], perm[i]];
      }
      let tries = 0;
      while (edges.length < targetM && tries < targetM * 10) {
        const i = randInt(0, n - 2);
        const j = randInt(i + 1, n - 1);
        addEdge(perm[i], perm[j]);
        tries++;
      }
    } else {
      // Дерево через код Прюфера (для tree и как остов для connected)
      if (n === 2) {
        addEdge(1, 2);
      } else {
        const prufer = Array.from({ length: n - 2 }, () => randInt(1, n));
        const deg = new Array(n + 1).fill(1);
        prufer.forEach((x) => deg[x]++);
        for (const x of prufer) {
          for (let v = 1; v <= n; v++) {
            if (deg[v] === 1) {
              addEdge(v, x);
              deg[v]--;
              deg[x]--;
              break;
            }
          }
        }
        const rem = [];
        for (let v = 1; v <= n; v++) if (deg[v] === 1) rem.push(v);
        if (rem.length === 2) addEdge(rem[0], rem[1]);
      }

      if (gType === 'connected') {
        let tries = 0;
        while (edges.length < targetM && tries < targetM * 10) {
          addEdge(randInt(1, n), randInt(1, n));
          tries++;
        }
      }
    }

    const lines = edges.map(([u, v]) => (weighted ? `${u} ${v} ${randInt(lo, hi)}` : `${u} ${v}`));
    return (withHeader ? `${n} ${edges.length}\n` : '') + lines.join('\n');
  }

  container.querySelectorAll('[data-gen-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-gen-tab');
      container.querySelectorAll('[data-gen-tab]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderForm();
    });
  });

  document.getElementById('gen-run-btn').addEventListener('click', async () => {
    const text = generateTestText();
    outputEl.textContent = text;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Тест сгенерирован и скопирован в буфер!');
    } catch {
      showToast('Тест сгенерирован!');
    }
  });

  renderForm();
}

// ============================================================================
// 2. Справочник STL (C++) и стандартной библиотеки Python
// ============================================================================
export function renderStlView(container, escapeHtml) {
  const rows = [
    {
      cpp: 'std::vector<T>',
      py: 'list',
      ins: 'O(1) аморт. в конец',
      del: 'O(1) с конца / O(N) из середины',
      search: 'O(N) / O(log N) на отсорт.',
      note: 'Непрерывный массив в памяти, быстрый кэш-доступ.'
    },
    {
      cpp: 'std::set / std::map',
      py: 'set / dict (нет аналога ordered tree)',
      ins: 'O(log N) [C++] / O(1) [Py]',
      del: 'O(log N) [C++] / O(1) [Py]',
      search: 'O(log N) [C++] / O(1) [Py]',
      note: 'C++ set/map — красно-чёрное дерево (есть lower_bound); в Python это хеш-таблица.'
    },
    {
      cpp: 'std::unordered_map',
      py: 'dict',
      ins: 'O(1) средн., O(N) худш.',
      del: 'O(1) средн., O(N) худш.',
      search: 'O(1) средн., O(N) худш.',
      note: 'В C++ уязвим к анти-хеш тестам! В Python для str есть random seed, но int хешируется сам в себя.'
    },
    {
      cpp: 'std::priority_queue',
      py: 'heapq',
      ins: 'O(log N)',
      del: 'O(log N) (pop максимума/минимума)',
      search: 'O(1) (только top)',
      note: 'C++ по умолчанию max-heap; Python heapq — всегда min-heap (для max храните -x).'
    },
    {
      cpp: 'std::deque',
      py: 'collections.deque',
      ins: 'O(1) в начало и конец',
      del: 'O(1) с начала и конца',
      search: 'O(1) по индексу [C++] / O(N) [Py]',
      note: 'Идеален для BFS, 0-1 BFS и скользящего окна.'
    },
    {
      cpp: 'lower_bound / upper_bound',
      py: 'bisect.bisect_left / bisect_right',
      ins: '—',
      del: '—',
      search: 'O(log N)',
      note: 'Работают только на отсортированном диапазоне. На std::set используйте метод s.lower_bound(x)!'
    }
  ];

  const splitmixSnippet = `struct custom_hash {
    static uint64_t splitmix64(uint64_t x) {
        x += 0x9e3779b97f4a7c15;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
        x = (x ^ (x >> 27)) * 0x94d049bb133111eb;
        return x ^ (x >> 31);
    }
    size_t operator()(uint64_t x) const {
        static const uint64_t FIXED_RANDOM = chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + FIXED_RANDOM);
    }
};
unordered_map<long long, int, custom_hash> safe_map;`;

  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
    </div>
    <section class="card">
      <h1 class="topic-title" style="margin-top:0;">Справочник STL (C++) и стандартной библиотеки Python</h1>
      <p style="color:var(--text-secondary); margin-top:4px;">
        Сравнение основных контейнеров, их асимптотики и подводных камней на контестах (Codeforces / ICPC).
      </p>

      <div class="calc-table-wrap">
        <table class="calc-table">
          <thead>
            <tr>
              <th>C++ STL</th>
              <th>Python</th>
              <th>Вставка</th>
              <th>Удаление</th>
              <th>Поиск</th>
              <th>Особенности</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr>
                <td class="mono" style="color:var(--accent-light); font-weight:600;">${escapeHtml(r.cpp)}</td>
                <td class="mono" style="color:var(--info);">${escapeHtml(r.py)}</td>
                <td class="mono" style="font-size:12px;">${escapeHtml(r.ins)}</td>
                <td class="mono" style="font-size:12px;">${escapeHtml(r.del)}</td>
                <td class="mono" style="font-size:12px;">${escapeHtml(r.search)}</td>
                <td style="font-size:13px; color:var(--text-secondary);">${escapeHtml(r.note)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="pitfalls-box" style="margin-top:18px;">
        <div class="pitfalls-title">⚠ Анти-хеш тесты (Hack на unordered_map в C++)</div>
        <p style="margin:0 0 10px; font-size:13.5px; color:var(--text-secondary);">
          Стандартный <code>std::unordered_map</code> использует тривиальное хеширование целых чисел, из-за чего на Codeforces его легко взломать до O(N²). Используйте кастомный хеш на базе <code>splitmix64</code> со случайным солением:
        </p>
        <pre class="code-pre" style="background:var(--bg-code); border:1px solid var(--border); border-radius:6px; padding:12px;"><code>${escapeHtml(splitmixSnippet)}</code></pre>
      </div>
    </section>
  `;
}

// ============================================================================
// 3. Интерактивный тренажёр побитовых операций
// ============================================================================
export function renderBitwiseView(container) {
  let x = 29; // 0000000000011101
  let y = 19; // 0000000000010011
  let k = 2;

  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
    </div>
    <section class="card">
      <h1 class="topic-title" style="margin-top:0;">Интерактивный тренажёр побитовых операций (16 бит)</h1>
      <p style="color:var(--text-secondary); margin-top:4px;">
        Кликайте по отдельным битам числа <code>x</code>, применяйте побитовые сдвиги, маски и наблюдайте перебор всех подмасок.
      </p>

      <div class="custom-input-form">
        <div class="form-field" style="max-width:150px;">
          <label for="bw-x">Число x (0..65535)</label>
          <input id="bw-x" type="number" class="input-field input-mono" value="${x}" min="0" max="65535">
        </div>
        <div class="form-field" style="max-width:150px;">
          <label for="bw-y">Второй операнд y</label>
          <input id="bw-y" type="number" class="input-field input-mono" value="${y}" min="0" max="65535">
        </div>
        <div class="form-field" style="max-width:120px;">
          <label for="bw-k">Бит / сдвиг k</label>
          <input id="bw-k" type="number" class="input-field input-mono" value="${k}" min="0" max="15">
        </div>
      </div>

      <div id="bw-readout" class="variables-grid" style="margin-bottom:10px;"></div>
      <div id="bw-bits" class="bits-row"></div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
        <button type="button" class="btn btn-secondary btn-sm" data-op="shl">x &lt;&lt; k</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="shr">x &gt;&gt; k</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="and">x &amp; y</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="or">x | y</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="xor">x ^ y</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="not">~x (16 бит)</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="setk">Установить бит k</button>
        <button type="button" class="btn btn-secondary btn-sm" data-op="cleark">Сбросить бит k</button>
        <button type="button" class="btn btn-primary btn-sm" data-op="lowbit">x &amp; (x - 1) — снять младший бит</button>
      </div>

      <div class="card" style="margin-top:18px; margin-bottom:0; background:var(--bg-main);">
        <h3 style="margin:0 0 6px; font-size:15px;">Перебор всех подмасок маски x</h3>
        <div class="mono" style="font-size:12.5px; color:var(--accent-light);">for (int s = x; s &gt; 0; s = (s - 1) &amp; x)</div>
        <div id="bw-submasks" class="submasks-list"></div>
      </div>
    </section>
  `;

  const xIn = document.getElementById('bw-x');
  const yIn = document.getElementById('bw-y');
  const kIn = document.getElementById('bw-k');
  const readout = document.getElementById('bw-readout');
  const bitsEl = document.getElementById('bw-bits');
  const submasksEl = document.getElementById('bw-submasks');

  function sync() {
    x = ((x % 65536) + 65536) % 65536;
    xIn.value = x;

    const binStr = x.toString(2).padStart(16, '0');
    const hexStr = '0x' + x.toString(16).toUpperCase().padStart(4, '0');
    const popcount = binStr.split('1').length - 1;

    readout.innerHTML = `
      <span class="var-chip"><span class="var-name">DEC: </span><span class="var-val">${x}</span></span>
      <span class="var-chip"><span class="var-name">BIN: </span><span class="var-val">${binStr}</span></span>
      <span class="var-chip"><span class="var-name">HEX: </span><span class="var-val">${hexStr}</span></span>
      <span class="var-chip"><span class="var-name">popcount: </span><span class="var-val">${popcount}</span></span>
    `;

    bitsEl.innerHTML = '';
    for (let bit = 15; bit >= 0; bit--) {
      const isOn = (x >> bit) & 1;
      const cell = document.createElement('div');
      cell.className = 'bit-cell';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `bit-btn ${isOn ? 'on' : ''}`;
      btn.textContent = isOn;
      btn.addEventListener('click', () => {
        x ^= 1 << bit;
        sync();
      });
      const idx = document.createElement('span');
      idx.className = 'bit-idx';
      idx.textContent = bit;
      cell.appendChild(btn);
      cell.appendChild(idx);
      bitsEl.appendChild(cell);
    }

    // Перебор подмасок
    const subs = [];
    let s = x;
    while (s > 0 && subs.length < 32) {
      subs.push(s);
      s = (s - 1) & x;
    }
    submasksEl.innerHTML = subs.length
      ? subs
          .map(
            (m) =>
              `<span class="var-chip">${m} <span style="color:var(--text-secondary);">(${m.toString(2).padStart(6, '0')}₂)</span></span>`
          )
          .join('') + (s > 0 ? '<span class="badge badge-muted">... (показаны первые 32)</span>' : '')
      : '<span style="color:var(--text-secondary); font-size:13px;">Маска x = 0 — ненулевых подмасок нет.</span>';
  }

  xIn.addEventListener('input', () => {
    x = Math.max(0, Math.min(65535, Number(xIn.value) || 0));
    sync();
  });
  yIn.addEventListener('input', () => {
    y = Math.max(0, Math.min(65535, Number(yIn.value) || 0));
  });
  kIn.addEventListener('input', () => {
    k = Math.max(0, Math.min(15, Number(kIn.value) || 0));
  });

  container.querySelectorAll('[data-op]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const op = btn.getAttribute('data-op');
      if (op === 'shl') x = (x << k) & 0xffff;
      else if (op === 'shr') x = (x >> k) & 0xffff;
      else if (op === 'and') x = (x & y) & 0xffff;
      else if (op === 'or') x = (x | y) & 0xffff;
      else if (op === 'xor') x = (x ^ y) & 0xffff;
      else if (op === 'not') x = (~x) & 0xffff;
      else if (op === 'setk') x = (x | (1 << k)) & 0xffff;
      else if (op === 'cleark') x = (x & ~(1 << k)) & 0xffff;
      else if (op === 'lowbit') x = (x & (x - 1)) & 0xffff;
      sync();
    });
  });

  sync();
}

// ============================================================================
// 4. Режим «Блиц-тренировка» (14 задач)
// ============================================================================
const BLITZ_QUESTIONS = [
  {
    prompt: 'Дан отсортированный массив из N ≤ 10⁵ чисел и Q ≤ 10⁵ запросов поиска первого элемента ≥ target. Лимит: 1.0 сек.',
    options: ['Бинарный поиск (lower_bound)', 'Линейный проход', 'Пузырьковая сортировка', 'ДП по маскам'],
    answer: 0,
    explanation: 'Бинарный поиск отвечает на каждый запрос за O(log N), итого O(Q log N) ≈ 1.7·10⁶ операций. Линейный проход за O(N·Q) ≈ 10¹⁰ даст TLE.'
  },
  {
    prompt: 'Невзвешенный граф (V ≤ 10⁵, E ≤ 2·10⁵). Найти кратчайшее расстояние от вершины 1 до всех остальных. Лимит: 1.0 сек.',
    options: ['Поиск в ширину (BFS)', 'Алгоритм Флойда–Уоршелла', 'DFS', 'Алгоритм Дейкстры O(V²)'],
    answer: 0,
    explanation: 'BFS находит кратчайшие пути в невзвешенном графе за линейное время O(V + E). Флойд O(V³) и наивная Дейкстра O(V²) не уложатся в 1 секунду.'
  },
  {
    prompt: 'Взвешенный граф с неотрицательными весами (V ≤ 10⁵, E ≤ 2·10⁵). Найти кратчайший путь от вершины S. Лимит: 1.0 сек.',
    options: ['Дейкстра с priority_queue', 'BFS', 'Полный перебор путей', 'Беллман–Форд O(V·E)'],
    answer: 0,
    explanation: 'Дейкстра с мин-кучей работает за O((V + E) log V) ≈ 5·10⁶ операций. Беллман–Форд за O(V·E) ≈ 2·10¹⁰ получит TLE, а BFS не учитывает веса.'
  },
  {
    prompt: 'Массив из N ≤ 2·10⁵ целых чисел, Q ≤ 2·10⁵ запросов суммы на отрезке [l, r] с обновлениями элементов a[i] = val. Лимит: 1.0 сек.',
    options: ['Дерево отрезков (Segment Tree)', 'Префиксные суммы', 'Цикл от l до r', 'Решето Эратосфена'],
    answer: 0,
    explanation: 'Дерево отрезков поддерживает и запросы, и обновления за O(log N). Префиксные суммы требуют O(N) на пересчёт при обновлении (TLE).'
  },
  {
    prompt: 'Найти сумму на отрезке [l, r] в статическом массиве (N ≤ 10⁵, Q ≤ 10⁵, обновлений нет). Лимит: 1.0 сек.',
    options: ['Префиксные суммы', 'ДП 0-1 рюкзак', 'Алгоритм Крускала', 'Расширенный Евклид'],
    answer: 0,
    explanation: 'Префиксные суммы строятся за O(N) и отвечают на каждый запрос за O(1), что быстрее и проще дерева отрезков.'
  },
  {
    prompt: 'Неотрицательный массив (N ≤ 2·10⁵). Найти самый длинный подотрезок с суммой ≤ S. Лимит: 1.0 сек.',
    options: ['Метод двух указателей', 'Перебор всех пар (l, r)', 'Венгерский алгоритм', 'Алгоритм Косарайю'],
    answer: 0,
    explanation: 'При неотрицательных элементах сумма монотонна, и два указателя находят ответ за O(N).'
  },
  {
    prompt: 'N ≤ 100 предметов, вместимость рюкзака W ≤ 10⁴. Максимизировать стоимость без повторов. Лимит: 1.0 сек.',
    options: ['ДП: 0-1 Рюкзак O(N·W)', 'Перебор всех 2^N подмножеств', 'Алгоритм Дейкстры', 'Бинарный поиск'],
    answer: 0,
    explanation: 'N·W = 10⁶ операций — мгновенно для ДП. Перебор 2¹⁰⁰ невозможен.'
  },
  {
    prompt: 'Связный взвешенный граф (V ≤ 10⁵, E ≤ 2·10⁵). Выбрать дороги минимальной суммарной длины, соединяющие все города.',
    options: ['Алгоритм Крускала + DSU', 'Задача коммивояжёра (TSP)', 'Топологическая сортировка', 'Китайская теорема об остатках'],
    answer: 0,
    explanation: 'Крускал находит минимальное остовное дерево (MST) за O(E log E). TSP решает другую задачу (гамильтонов цикл) и работает за O(n²·2ⁿ).'
  },
  {
    prompt: 'Ориентированный граф (V ≤ 10⁵, E ≤ 2·10⁵). Разбить вершины на классы взаимной достижимости. Лимит: 1.0 сек.',
    options: ['Алгоритм Косарайю (SCC)', 'DSU', 'Решето Эратосфена', 'Бинарное возведение в степень'],
    answer: 0,
    explanation: 'DSU работает только для неориентированной связности, а Косарайю за два DFS O(V + E) находит компоненты сильной связности.'
  },
  {
    prompt: 'Неориентированный граф (V ≤ 10⁵, E ≤ 2·10⁵). Найти все рёбра, удаление которых нарушает связность.',
    options: ['DFS Тарьяна (tin / fup)', 'BFS от каждой вершины', 'Сортировка рёбер', 'Венгерский алгоритм'],
    answer: 0,
    explanation: 'Алгоритм на базе tin/fup находит все мосты за один проход O(V + E).'
  },
  {
    prompt: 'Полный граф из N = 16 городов. Найти кратчайший замкнутый маршрут через все города. Лимит: 1.0 сек.',
    options: ['ДП по подмножествам (TSP)', 'Алгоритм Крускала', 'Алгоритм Дейкстры', 'BFS'],
    answer: 0,
    explanation: 'При N = 16 имеем 16² · 2¹⁶ ≈ 1.6·10⁷ операций — идеально для ДП по битовым маскам.'
  },
  {
    prompt: 'Дана матрица стоимостей 300 × 300 назначения работников на задачи. Найти минимальную сумму. Лимит: 1.0 сек.',
    options: ['Венгерский алгоритм O(N³)', 'Перебор N! перестановок', 'BFS', 'Бинарный поиск'],
    answer: 0,
    explanation: 'При N = 300 имеем N³ = 2.7·10⁷ операций, что уверенно проходит в C++ за 1 секунду.'
  },
  {
    prompt: 'Дерево из N ≤ 10⁵ вершин, Q ≤ 10⁵ запросов расстояния между вершинами u и v. Лимит: 1.0 сек.',
    options: ['LCA (Двоичные подъёмы)', 'Алгоритм Дейкстры на каждый запрос', 'Матрица смежности', 'Решето Эратосфена'],
    answer: 0,
    explanation: 'dist(u, v) = depth[u] + depth[v] - 2·depth[LCA(u, v)]. Двоичные подъёмы отвечают за O(log N) на запрос.'
  },
  {
    prompt: 'Вычислить a^n mod 10⁹+7 при n ≤ 10¹⁸. Лимит: 1.0 сек.',
    options: ['Бинарное возведение в степень', 'Цикл умножения n раз', 'Расширенный Евклид', 'КТО'],
    answer: 0,
    explanation: 'n = 10¹⁸ слишком велико для линейного цикла, а бинарное возведение требует всего ~60 шагов O(log n).'
  }
];

export function renderBlitzView(container, escapeHtml) {
  let idx = 0;
  let streak = 0;
  let bestStreak = 0;
  let answered = false;

  function render() {
    const q = BLITZ_QUESTIONS[idx];
    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <a href="#roadmap" class="btn btn-ghost btn-sm">← К роадмапу тем</a>
      </div>
      <section class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-muted">Задача ${idx + 1} / ${BLITZ_QUESTIONS.length}</span>
            <h1 class="topic-title" style="margin-top:6px;">⚡ Блиц-тренировка: выбор алгоритма</h1>
          </div>
          <div style="display:flex; gap:8px;">
            <span class="badge badge-accent">Серия: ${streak}</span>
            <span class="badge badge-success">Рекорд: ${bestStreak}</span>
          </div>
        </div>

        <p style="font-size:16px; font-weight:500; margin:12px 0;">${escapeHtml(q.prompt)}</p>

        <div class="blitz-options">
          ${q.options
            .map((opt, oIdx) => `<button type="button" class="blitz-opt-btn" data-opt="${oIdx}">${escapeHtml(opt)}</button>`)
            .join('')}
        </div>

        <div id="blitz-feedback" class="step-explanation" style="margin-top:16px;" hidden></div>

        <div style="margin-top:16px; display:flex; justify-content:flex-end;">
          <button type="button" id="blitz-next-btn" class="btn btn-primary btn-sm" hidden>Следующая задача →</button>
        </div>
      </section>
    `;

    const fb = document.getElementById('blitz-feedback');
    const nextBtn = document.getElementById('blitz-next-btn');

    container.querySelectorAll('.blitz-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = Number(btn.getAttribute('data-opt'));
        const isRight = chosen === q.answer;

        container.querySelectorAll('.blitz-opt-btn').forEach((b, i) => {
          b.disabled = true;
          if (i === q.answer) b.classList.add('correct');
          else if (i === chosen) b.classList.add('wrong');
        });

        if (isRight) {
          streak++;
          if (streak > bestStreak) bestStreak = streak;
          fb.style.borderLeftColor = 'var(--success)';
          fb.textContent = `✓ Верно! ${q.explanation}`;
        } else {
          streak = 0;
          fb.style.borderLeftColor = 'var(--danger)';
          fb.textContent = `✕ Неверно. ${q.explanation}`;
        }
        fb.hidden = false;
        nextBtn.hidden = false;
      });
    });

    nextBtn.addEventListener('click', () => {
      answered = false;
      idx = (idx + 1) % BLITZ_QUESTIONS.length;
      render();
    });
  }

  render();
}
