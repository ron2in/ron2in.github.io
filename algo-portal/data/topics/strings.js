export const TOPICS = [
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
  ,
    fillBlanks: [
      {
        "title": "Откат и шаг префикс-функции (C++)",
        "lang": "cpp",
        "lines": [
          "for (int i = 1; i < n; ++i) {",
          "    int j = pi[i - 1];",
          {
            "blankId": "back",
            "indent": "    ",
            "placeholder": "откат j при несовпадении s[i] != s[j]",
            "hint": "while (j > 0 && s[i] != s[j]) j = pi[j - 1];",
            "answers": [
              "while (j > 0 && s[i] != s[j]) j = pi[j - 1];"
            ]
          },
          "    if (s[i] == s[j]) ++j;",
          "    pi[i] = j;",
          "}"
        ]
      }
    ]
  }
];
