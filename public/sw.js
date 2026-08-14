/* Service Worker — 网络优先，离线回退缓存
 * 每次打开都优先获取最新版本；断网时才使用缓存的旧页面 */
const CACHE = 'lifejournal-v2'
const BASE = self.location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '')

/* 新 SW 立即接管，不等旧页面关闭 */
self.addEventListener('install', () => { self.skipWaiting() })

/* 激活时清理旧版本缓存 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功拿到最新内容，顺便更新缓存
        const copy = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {})
        return res
      })
      .catch(() =>
        // 离线：回退缓存，最后兜底首页
        caches.match(e.request).then(r => r || caches.match(BASE + '/index.html'))
      )
  )
})
