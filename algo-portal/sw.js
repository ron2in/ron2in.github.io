/**
 * Service Worker для AlgoPortal (PWA + офлайн-работа на GitHub Pages).
 * Использует относительные пути ./ для корректной работы на подпути репозитория.
 */
const CACHE_NAME = 'algoportal-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/player.js',
  './js/tools.js',
  './js/advancedTools.js',
  './js/pyodideRunner.js',
  './js/cfApi.js',
  './js/engines/arrayEngine.js',
  './js/engines/graphEngine.js',
  './js/engines/gridEngine.js',
  './js/engines/treeEngine.js',
  './js/engines/mathEngine.js',
  './js/engines/stringEngine.js',
  './data/topicsIndex.js',
  './data/topics/arrays.js',
  './data/topics/graphs.js',
  './data/topics/trees.js',
  './data/topics/dp.js',
  './data/topics/strings.js',
  './data/topics/math.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const reqUrl = new URL(request.url);

  // Внешние ресурсы (API Codeforces, CDN Pyodide, шрифты): Network First
  if (reqUrl.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Внутренние статические ресурсы портала: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return resp;
      });
    })
  );
});
