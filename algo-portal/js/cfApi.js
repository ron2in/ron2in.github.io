/**
 * Интеграция с публичным API Codeforces (problemset.problems).
 * Кэширование в sessionStorage на 30 минут + rate-limit (1 запрос в 2 сек).
 */

const CACHE_TTL_MS = 30 * 60 * 1000;
const RATE_LIMIT_MS = 2000;
let lastRequestTs = 0;

export const TOPIC_CF_TAGS = {
  'binary-search': 'binary search',
  bfs: 'shortest paths',
  'two-pointers': 'two pointers',
  'sorting-prefix': 'sortings',
  dijkstra: 'shortest paths',
  knapsack: 'dp',
  'segment-tree': 'data structures',
  'prefix-function': 'strings',
  'fenwick-tree': 'data structures',
  'lcs-levenshtein': 'dp',
  dfs: 'dfs and similar',
  kruskal: 'dsu',
  dsu: 'dsu',
  tsp: 'bitmasks',
  'assignment-hungarian': 'flows',
  sieve: 'number theory',
  binpow: 'math',
  'ext-gcd': 'number theory',
  crt: 'number theory',
  'bridges-ap': 'dfs and similar',
  scc: 'graphs',
  lca: 'trees'
};

export function getCfTagForTopic(topicId) {
  return TOPIC_CF_TAGS[topicId] || 'implementation';
}

function readCache(tag) {
  try {
    const raw = sessionStorage.getItem(`cf_cache_${tag}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function writeCache(tag, items) {
  try {
    sessionStorage.setItem(`cf_cache_${tag}`, JSON.stringify({ ts: Date.now(), items }));
  } catch {
    // Игнорируем переполнение sessionStorage
  }
}

export function parseCfProblemsetResponse(json) {
  if (!json || json.status !== 'OK' || !json.result) {
    throw new Error('Invalid Codeforces API response');
  }
  const problems = json.result.problems || [];
  const stats = json.result.problemStatistics || [];
  const solvedMap = new Map();

  for (const st of stats) {
    solvedMap.set(`${st.contestId}_${st.index}`, st.solvedCount || 0);
  }

  return problems
    .filter((p) => p.contestId && p.index && p.name && p.rating)
    .map((p) => ({
      contestId: p.contestId,
      index: p.index,
      code: `${p.contestId}${p.index}`,
      name: p.name,
      rating: p.rating,
      solvedCount: solvedMap.get(`${p.contestId}_${p.index}`) || 0,
      url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
    }));
}

async function fetchTagProblems(tag) {
  const cached = readCache(tag);
  if (cached) return cached;

  const waitMs = Math.max(0, RATE_LIMIT_MS - (Date.now() - lastRequestTs));
  if (waitMs > 0) {
    await new Promise((r) => setTimeout(r, waitMs));
  }
  lastRequestTs = Date.now();

  const url = `https://codeforces.com/api/problemset.problems?tags=${encodeURIComponent(tag)}&lang=ru`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  const items = parseCfProblemsetResponse(json);
  writeCache(tag, items);
  return items;
}

export async function fetchCfProblems(topicId, ratingRange = 'all', count = 5) {
  const tag = getCfTagForTopic(topicId);
  const all = await fetchTagProblems(tag);

  const filtered = all.filter((p) => {
    if (ratingRange === '800-1100') return p.rating >= 800 && p.rating <= 1100;
    if (ratingRange === '1200-1500') return p.rating >= 1200 && p.rating <= 1500;
    if (ratingRange === '1600-1900') return p.rating >= 1600 && p.rating <= 1900;
    if (ratingRange === '2000+') return p.rating >= 2000;
    return true;
  });

  // Перемешиваем (Фишер–Йетс) и берём count случайных задач
  const pool = [...filtered];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { tag, items: pool.slice(0, count) };
}

export async function fetchCfUserProfile(handle) {
  const cleanHandle = String(handle || '').trim();
  if (!cleanHandle) throw new Error('Введите хендл Codeforces.');

  const wait1 = Math.max(0, RATE_LIMIT_MS - (Date.now() - lastRequestTs));
  if (wait1 > 0) await new Promise((r) => setTimeout(r, wait1));
  lastRequestTs = Date.now();

  const infoResp = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanHandle)}`);
  if (!infoResp.ok) throw new Error(`HTTP ${infoResp.status}`);
  const infoJson = await infoResp.json();
  if (infoJson.status !== 'OK' || !infoJson.result?.length) {
    throw new Error('Пользователь не найден на Codeforces.');
  }
  const user = infoJson.result[0];

  const wait2 = Math.max(0, RATE_LIMIT_MS - (Date.now() - lastRequestTs));
  if (wait2 > 0) await new Promise((r) => setTimeout(r, wait2));
  lastRequestTs = Date.now();

  const statusResp = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(cleanHandle)}`);
  if (!statusResp.ok) throw new Error(`HTTP ${statusResp.status}`);
  const statusJson = await statusResp.json();
  if (statusJson.status !== 'OK') {
    throw new Error('Не удалось загрузить посылки пользователя.');
  }

  const solved = new Set();
  for (const sub of statusJson.result || []) {
    if (sub.verdict === 'OK' && sub.problem?.contestId && sub.problem?.index) {
      solved.add(`${sub.problem.contestId}${sub.problem.index}`);
    }
  }

  return {
    handle: user.handle,
    rating: user.rating || 1200,
    rank: user.rank || 'unrated',
    solved: [...solved],
    syncedAt: new Date().toISOString()
  };
}
