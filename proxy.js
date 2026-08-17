/* ============================================================
 * AI 本地代理（零依赖，需 Node.js 18+）
 * 用途：DeepSeek 等 API 不允许浏览器直连（CORS），
 *       通过这个小代理中转即可在生活手账里使用。
 *
 * 启动：  node proxy.js            （默认端口 8787）
 *        node proxy.js 9000        （指定端口）
 *
 * 使用：在生活手账「我的」→ AI 知己 → DeepSeek 里，
 *       把「接口地址」改为 http://localhost:8787
 *       （手机访问时填电脑的局域网 IP，如 http://192.168.1.5:8787）
 * ============================================================ */
const http = require('http')
const PORT = Number(process.argv[2]) || 8787

const server = http.createServer((req, res) => {
  /* CORS 放行 */
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-Url')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  if (req.method !== 'POST') {
    res.writeHead(405)
    return res.end('only POST')
  }

  /* 真实目标地址由前端放在 X-Target-Url 里，本代理只做转发 */
  const target = req.headers['x-target-url']
  if (!target || !/^https:\/\/api\./i.test(target)) {
    res.writeHead(400)
    return res.end('missing or invalid X-Target-Url')
  }

  let body = ''
  req.on('data', c => { body += c })
  req.on('end', () => {
    fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers['authorization'] || '',
      },
      body,
    }).then(async (up) => {
      res.writeHead(up.status, {
        'Content-Type': up.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-cache',
      })
      /* 透传流式响应（SSE） */
      const reader = up.body.getReader()
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(Buffer.from(value))
        }
        res.end()
      }
      pump().catch(() => { try { res.end() } catch (e) {} })
    }).catch(e => {
      res.writeHead(502)
      res.end('proxy error: ' + String(e && e.message || e))
    })
  })
})

server.listen(PORT, () => {
  console.log('')
  console.log('  ✅ AI 本地代理已启动')
  console.log('     地址：http://localhost:' + PORT)
  console.log('     在生活手账「我的」→ AI 知己 → DeepSeek 的「接口地址」里填这个地址')
  console.log('     （手机访问时填电脑局域网 IP，如 http://192.168.x.x:' + PORT + '）')
  console.log('')
  console.log('  按 Ctrl+C 停止')
  console.log('')
})
