export const TOPICS = [
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
  ,
    fillBlanks: [
      {
        "title": "Просеивание кратных в решете Эратосфена (C++)",
        "lang": "cpp",
        "lines": [
          "for (int i = 2; 1LL * i * i <= n; ++i) {",
          "    if (isPrime[i]) {",
          {
            "blankId": "loop",
            "indent": "        ",
            "placeholder": "цикл по кратным начиная с i * i",
            "hint": "for (int j = i * i; j <= n; j += i)",
            "answers": [
              "for (int j = i * i; j <= n; j += i)",
              "for (int j = i * i; j <= n; j += i) {"
            ]
          },
          "            isPrime[j] = false;",
          "    }",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Шаг бинарного возведения в степень (C++)",
        "lang": "cpp",
        "lines": [
          "while (n > 0) {",
          {
            "blankId": "odd",
            "indent": "    ",
            "placeholder": "если n нечётное, умножьте res на a по модулю m",
            "hint": "if (n & 1) res = (res * a) % m;",
            "answers": [
              "if (n & 1) res = (res * a) % m;",
              "if (n % 2 == 1) res = (res * a) % m;"
            ]
          },
          {
            "blankId": "sq",
            "indent": "    ",
            "placeholder": "возведите a в квадрат по модулю m",
            "hint": "a = (a * a) % m;",
            "answers": [
              "a = (a * a) % m;"
            ]
          },
          "    n >>= 1;",
          "}"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Пересчёт коэффициентов Безу (Python)",
        "lang": "python",
        "lines": [
          "def extgcd(a: int, b: int):",
          "    if b == 0: return a, 1, 0",
          "    g, x1, y1 = extgcd(b, a % b)",
          {
            "blankId": "xval",
            "indent": "    ",
            "placeholder": "вычислите x",
            "hint": "x = y1",
            "answers": [
              "x = y1"
            ]
          },
          {
            "blankId": "yval",
            "indent": "    ",
            "placeholder": "вычислите y через x1, a, b, y1",
            "hint": "y = x1 - (a // b) * y1",
            "answers": [
              "y = x1 - (a // b) * y1"
            ]
          },
          "    return g, x, y"
        ]
      }
    ]
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
  ,
    fillBlanks: [
      {
        "title": "Сборка ответа в КТО (C++)",
        "lang": "cpp",
        "lines": [
          "for (size_t i = 0; i < m.size(); ++i) {",
          {
            "blankId": "mi",
            "indent": "    ",
            "placeholder": "вычислите частичное произведение Mi",
            "hint": "long long Mi = M / m[i];",
            "answers": [
              "long long Mi = M / m[i];",
              "Mi = M / m[i];"
            ]
          },
          "    long long yi = modInverse(Mi, m[i]);",
          {
            "blankId": "addx",
            "indent": "    ",
            "placeholder": "добавьте вклад i-го сравнения к x по модулю M",
            "hint": "x = (x + r[i] * Mi % M * yi) % M;",
            "answers": [
              "x = (x + r[i] * Mi % M * yi) % M;"
            ]
          },
          "}"
        ]
      }
    ]
  }
];
