/**
 * Ленивый раннер Python (Pyodide) + юнит-тесты для тем AlgoPortal.
 */

let pyodidePromise = null;

export function getPyodide() {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise((resolve, reject) => {
    const init = async () => {
      try {
        const py = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        });
        resolve(py);
      } catch (err) {
        pyodidePromise = null;
        reject(err);
      }
    };

    if (typeof window.loadPyodide === 'function') {
      init();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    script.async = true;
    script.onload = init;
    script.onerror = () => {
      pyodidePromise = null;
      reject(new Error('Не удалось загрузить Pyodide с CDN.'));
    };
    document.head.appendChild(script);
  });

  return pyodidePromise;
}

export async function runPythonTests(userCode, tests) {
  const py = await getPyodide();
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const tc = tests[i];
    const t0 = performance.now();
    try {
      py.globals.set('__user_code__', userCode);
      py.globals.set('__test_input__', tc.input);
      const output = await py.runPythonAsync(`
import sys, io
_old_in, _old_out = sys.stdin, sys.stdout
sys.stdin = io.StringIO(__test_input__)
sys.stdout = io.StringIO()
try:
    exec(compile(__user_code__, '<sandbox>', 'exec'), {})
    __captured__ = sys.stdout.getvalue()
finally:
    sys.stdin, sys.stdout = _old_in, _old_out
__captured__
      `);
      const ms = Math.round(performance.now() - t0);
      const actual = String(output).trim().replace(/\r\n/g, '\n');
      const expected = String(tc.expected).trim().replace(/\r\n/g, '\n');
      results.push({
        index: i + 1,
        verdict: actual === expected ? 'OK' : 'Wrong Answer',
        input: tc.input,
        expected,
        actual,
        ms
      });
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      results.push({
        index: i + 1,
        verdict: 'Runtime Error',
        input: tc.input,
        expected: tc.expected,
        actual: String(err.message || err),
        ms
      });
    }
  }
  return results;
}

export const PY_TESTS = {
  'binary-search': {
    starter: `import bisect
n, target = map(int, input().split())
a = list(map(int, input().split()))
print(bisect.bisect_left(a, target))`,
    tests: [
      { input: '5 6\n1 3 6 8 10\n', expected: '2' },
      { input: '6 4\n1 4 4 4 7 9\n', expected: '1' },
      { input: '4 99\n2 5 7 9\n', expected: '4' }
    ]
  },
  bfs: {
    starter: `from collections import deque
n, m, s = map(int, input().split())
adj = [[] for _ in range(n)]
for _ in range(m):
    u, v = map(int, input().split())
    adj[u].append(v); adj[v].append(u)
dist = [-1] * n
dist[s] = 0
q = deque([s])
while q:
    u = q.popleft()
    for v in adj[u]:
        if dist[v] == -1:
            dist[v] = dist[u] + 1
            q.append(v)
print(*dist)`,
    tests: [
      { input: '4 3 0\n0 1\n1 2\n2 3\n', expected: '0 1 2 3' },
      { input: '4 2 0\n0 1\n2 3\n', expected: '0 1 -1 -1' },
      { input: '3 3 1\n0 1\n1 2\n0 2\n', expected: '1 0 1' }
    ]
  },
  'two-pointers': {
    starter: `n, target = map(int, input().split())
a = list(map(int, input().split()))
l = cur = 0
ans = (-1, -1)
for r, x in enumerate(a):
    cur += x
    while cur > target and l <= r:
        cur -= a[l]; l += 1
    if cur == target:
        ans = (l, r); break
print(*ans)`,
    tests: [
      { input: '6 9\n1 2 3 4 5 1\n', expected: '1 3' },
      { input: '4 7\n4 2 7 1\n', expected: '2 2' },
      { input: '4 100\n1 2 3 4\n', expected: '-1 -1' }
    ]
  },
  'sorting-prefix': {
    starter: `n, l, r = map(int, input().split())
a = sorted(map(int, input().split()))
pref = [0] * (n + 1)
for i, x in enumerate(a): pref[i + 1] = pref[i] + x
print(pref[r + 1] - pref[l])`,
    tests: [
      { input: '5 1 3\n5 2 8 1 4\n', expected: '11' },
      { input: '4 0 3\n7 3 9 2\n', expected: '21' },
      { input: '3 2 2\n10 1 5\n', expected: '10' }
    ]
  },
  dijkstra: {
    starter: `import heapq
n, m, s = map(int, input().split())
adj = [[] for _ in range(n)]
for _ in range(m):
    u, v, w = map(int, input().split())
    adj[u].append((v, w)); adj[v].append((u, w))
INF = 10**15
dist = [INF] * n
dist[s] = 0
pq = [(0, s)]
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]: continue
    for v, w in adj[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            heapq.heappush(pq, (dist[v], v))
print(*[x if x < INF else -1 for x in dist])`,
    tests: [
      { input: '3 3 0\n0 2 10\n0 1 2\n1 2 3\n', expected: '0 2 5' },
      { input: '4 2 0\n0 1 5\n2 3 1\n', expected: '0 5 -1 -1' },
      { input: '1 0 0\n', expected: '0' }
    ]
  },
  knapsack: {
    starter: `n, W = map(int, input().split())
wt = list(map(int, input().split()))
val = list(map(int, input().split()))
dp = [0] * (W + 1)
for i in range(n):
    for w in range(W, wt[i] - 1, -1):
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i])
print(dp[W])`,
    tests: [
      { input: '4 5\n2 3 4 5\n3 4 5 6\n', expected: '7' },
      { input: '2 3\n4 5\n10 12\n', expected: '0' },
      { input: '3 6\n3 4 2\n4 5 3\n', expected: '8' }
    ]
  },
  'segment-tree': {
    starter: `n, l, r = map(int, input().split())
a = list(map(int, input().split()))
print(sum(a[l:r+1]))`,
    tests: [
      { input: '6 1 4\n2 5 1 4 9 3\n', expected: '19' },
      { input: '4 0 2\n1 3 5 7\n', expected: '9' },
      { input: '4 2 2\n4 8 2 6\n', expected: '2' }
    ]
  },
  sieve: {
    starter: `n = int(input())
is_p = [True] * (n + 1)
is_p[0] = is_p[1] = False
i = 2
while i * i <= n:
    if is_p[i]:
        for j in range(i * i, n + 1, i): is_p[j] = False
    i += 1
print(sum(is_p))`,
    tests: [
      { input: '10\n', expected: '4' },
      { input: '30\n', expected: '10' },
      { input: '2\n', expected: '1' }
    ]
  },
  binpow: {
    starter: `a, n, m = map(int, input().split())
print(pow(a, n, m))`,
    tests: [
      { input: '3 13 100\n', expected: '23' },
      { input: '2 10 1000\n', expected: '24' },
      { input: '5 0 7\n', expected: '1' }
    ]
  },
  'ext-gcd': {
    starter: `def extgcd(a, b):
    if b == 0: return a, 1, 0
    g, x1, y1 = extgcd(b, a % b)
    return g, y1, x1 - (a // b) * y1
a, b = map(int, input().split())
print(*extgcd(a, b))`,
    tests: [
      { input: '30 18\n', expected: '6 -1 2' },
      { input: '55 34\n', expected: '1 13 -21' },
      { input: '17 0\n', expected: '17 1 0' }
    ]
  }
};

export function getTestsForTopic(topicId) {
  if (PY_TESTS[topicId]) return PY_TESTS[topicId];
  return {
    starter: `# Напишите решение для проверки ввода/вывода\nprint(input().strip())`,
    tests: [
      { input: '42\n', expected: '42' },
      { input: 'algo\n', expected: 'algo' }
    ]
  };
}
