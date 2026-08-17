/* ============================================================
 * AI 云端代理（部署到 Supabase Edge Functions，免费额度内可用）
 * 用途：DeepSeek 等 API 不允许浏览器直连（CORS），通过本函数中转。
 *
 * 部署步骤（Supabase 控制台网页操作，无需命令行）：
 *   1. 左侧菜单 → Edge Functions → Create a new function
 *   2. 名字填 ai-proxy，把本文件内容粘贴进去 → Deploy
 *   3. 打开该函数 → Settings → 关闭 Enforce JWT verification
 *   4. 在生活手账「我的」→ AI 知己 → DeepSeek 的「接口地址」填：
 *      https://<你的项目ID>.supabase.co/functions/v1/ai-proxy
 *
 * 安全设计：
 *   - 只允许转发到下方白名单域名，不能当作任意代理滥用
 *   - API Key 由请求方（你自己的浏览器）自带，本函数不保存任何密钥
 * ============================================================ */

const ALLOWED_HOSTS = [
  'https://api.deepseek.com',
  'https://api.openai.com',
  'https://api.moonshot.cn',
  'https://api.siliconflow.cn',
  'https://api.groq.com',
  'https://openrouter.ai',
]

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-Url',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }
  if (req.method !== 'POST') {
    return new Response('only POST', { status: 405, headers: CORS })
  }

  const target = req.headers.get('x-target-url') || ''
  if (!ALLOWED_HOSTS.some((h) => target.startsWith(h))) {
    return new Response('target not allowed', { status: 400, headers: CORS })
  }

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') || '',
      },
      body: req.body,
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...CORS,
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (e) {
    return new Response('upstream error: ' + String(e), { status: 502, headers: CORS })
  }
})
