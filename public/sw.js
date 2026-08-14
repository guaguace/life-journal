/* Service Worker — 离线缓存 */
const CACHE = 'lifejournal-v1'
const BASE = self.location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '')

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([BASE + '/', BASE + '/index.html'])
    })
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  )
})
