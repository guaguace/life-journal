/* ===== AI 知己「小记」：多供应商支持（Claude / DeepSeek / 自定义 OpenAI 兼容） ===== */
import Anthropic from '@anthropic-ai/sdk'

const AI_CFG_KEY = 'lifejournal_ai_cfg'
const CHAT_KEY = 'lifejournal_ai_chat'

export const PROVIDERS = [
  { id: 'claude', label: 'Claude（Anthropic）· 网页直连' },
  { id: 'deepseek', label: 'DeepSeek · 需本地代理' },
  { id: 'custom', label: '自定义（OpenAI 兼容接口）' },
]

export const CLAUDE_MODELS = [
  { id: 'claude-opus-5', label: 'Opus 5 · 最聪明（推荐）' },
  { id: 'claude-sonnet-5', label: 'Sonnet 5 · 均衡' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 · 最快最省' },
]

export const DEEPSEEK_MODELS = [
  { id: 'deepseek-chat', label: 'deepseek-chat · 日常对话' },
  { id: 'deepseek-reasoner', label: 'deepseek-reasoner · 深度思考' },
]

/* 默认配置 */
function defaultCfg() {
  return {
    provider: 'claude',
    claude: { key: '', model: 'claude-opus-5' },
    deepseek: { key: '', model: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1' },
    custom: { key: '', model: '', baseUrl: '', target: '' },
  }
}

export function getAIConfig() {
  try {
    const raw = JSON.parse(localStorage.getItem(AI_CFG_KEY)) || null
    if (!raw) return null
    /* 兼容旧版 { key, model } 格式 → claude 供应商 */
    if (raw.key !== undefined) {
      const cfg = defaultCfg()
      cfg.claude = { key: raw.key, model: raw.model || 'claude-opus-5' }
      return cfg
    }
    return { ...defaultCfg(), ...raw }
  } catch (e) { return null }
}

export function setAIConfig(cfg) {
  localStorage.setItem(AI_CFG_KEY, JSON.stringify(cfg))
}

export function getChatHistory() {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || [] } catch (e) { return [] }
}

/* 取当前供应商的有效配置 */
export function getActiveProvider(cfg) {
  if (!cfg) return null
  const p = cfg.provider || 'claude'
  const pc = cfg[p] || {}
  if (p === 'claude') return { type: 'claude', key: pc.key, model: pc.model || 'claude-opus-5' }
  if (p === 'deepseek') return {
    type: 'openai', key: pc.key, model: pc.model || 'deepseek-chat',
    baseUrl: pc.baseUrl || 'https://api.deepseek.com/v1',
    target: 'https://api.deepseek.com/v1',
  }
  if (p === 'custom') return {
    type: 'openai', key: pc.key, model: pc.model || '',
    baseUrl: pc.baseUrl || '', target: pc.target || pc.baseUrl || '',
  }
  return null
}

/* 判断是否走代理（http 开头 = 本地代理） */
function isProxyUrl(url) { return /^http:\/\//i.test(url) }

export const AI_SYSTEM_PROMPT = `你是「小记」——生活在「生活手账」App 里的 AI 知己，一个温暖、敏锐、不做评判的自我探索引导者。

每次对话你都会收到用户的最新数据快照（心情打卡、睡眠、运动、饮食、月事、待办、年度目标、灵感与碎碎念）。这是你的全部依据。

你的方式：
1. 从数据里找规律与关联——比如睡眠不足之后几天心情偏低、运动后情绪转好、月事前后状态起伏、待办堆积与压力感受的对应
2. 用户问「为什么」时，结合数据给出 2-3 个可能的缘故，语气是「观察与猜测」而非断言
3. 多用提问引导用户自己看见：一次只问一个开放问题，等 ta 回答，不要连珠炮
4. 引用数据时落到具体日期（如「8月13日你只睡了 5.5 小时，第二天的心情是低落」）

边界：
- 不诊断任何疾病，不替代医生或心理咨询师；若察觉用户可能需要专业支持，温柔建议求助专业人士
- 不说教、不评判、不给空洞鸡汤；洞察要具体，落到 ta 自己的记录上
- 用户没问就不给建议清单；先共情，再探索

风格：像深夜聊天的好朋友。中文回复，通常 80-180 字，最多不超过 300 字；偶尔用 emoji；称呼用户为「你」。
如果用户的数据很少（打卡天数少），先肯定 ta 已经开始记录，鼓励继续，不要硬分析。`

/* ── Claude 流式 ── */
async function claudeStream(def, system, messages, onDelta) {
  const client = new Anthropic({ apiKey: def.key, dangerouslyAllowBrowser: true })
  const stream = client.messages.stream({
    model: def.model,
    max_tokens: 2048,
    system,
    messages,
  })
  stream.on('text', onDelta)
  await stream.finalMessage()
}

/* ── OpenAI 兼容流式（DeepSeek / 自定义），SSE 解析 ── */
async function openaiStream(def, system, messages, onDelta) {
  const endpoint = def.baseUrl.replace(/\/+$/, '') + '/chat/completions'
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + def.key,
  }
  /* 走本地代理时，把真实目标地址放在 x-target-url 里 */
  if (isProxyUrl(def.baseUrl) && def.target) {
    headers['x-target-url'] = def.target.replace(/\/+$/, '') + '/chat/completions'
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: def.model,
      messages: [{ role: 'system', content: system }, ...messages],
      stream: true,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const err = new Error('HTTP ' + res.status)
    err.status = res.status
    throw err
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const payload = t.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const json = JSON.parse(payload)
        const delta = json.choices && json.choices[0] && json.choices[0].delta
        if (delta && delta.content) onDelta(delta.content)
      } catch (e) { /* 忽略非 JSON 心跳行 */ }
    }
  }
}

/* 统一入口：按供应商分发流式对话 */
export async function streamChat(cfg, system, messages, onDelta) {
  const def = getActiveProvider(cfg)
  if (!def || !def.key) {
    const err = new Error('未配置')
    err.status = 401
    throw err
  }
  if (def.type === 'claude') return claudeStream(def, system, messages, onDelta)
  return openaiStream(def, system, messages, onDelta)
}

/* 把错误翻译成用户可读的中文提示 */
export function explainError(err) {
  if (!err) return '出错了，请稍后再试。'
  if (err.status === 401) return 'API Key 无效或未配置，请到「我的」页检查。'
  if (err.status === 429) return '提问有点频繁，稍等几秒再试试。'
  if (err.status === 403) return '这个 Key 没有访问权限，请换一个试试。'
  if (err instanceof TypeError || /Failed to fetch/i.test(String(err.message))) {
    return '请求被浏览器拦截：该服务不支持网页直连。DeepSeek 用户请按「我的」页说明运行本地代理；或用 Claude（支持直连）。'
  }
  return '出错了：' + String(err.message || err).slice(0, 100)
}

/* 睡眠时长（跨午夜） */
function durMinutes(s, w) {
  const [sh, sm] = s.split(':').map(Number)
  const [wh, wm] = w.split(':').map(Number)
  let mins = (wh * 60 + wm) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60
  return mins
}

const MOOD_NAME = { excited: '兴奋', happy: '开心', calm: '平静', low: '低落', sad: '难过' }

/* 把用户全部数据压缩成一段中文快照，作为每次对话的上下文 */
export function buildContext(d) {
  if (!d) return '（暂无数据）'
  const parts = [`【数据快照 · 今天 ${String(d.todayKey || '').slice(5).replace('-', '月') + '日'}】`]

  const mood = d.moodHistory || {}
  const moodKeys = Object.keys(mood).sort().slice(-30)
  if (moodKeys.length) {
    const counts = { excited: 0, happy: 0, calm: 0, low: 0, sad: 0 }
    moodKeys.forEach(k => { counts[mood[k]] = (counts[mood[k]] || 0) + 1 })
    const dist = Object.entries(counts).filter(([, c]) => c > 0)
      .map(([m, c]) => `${MOOD_NAME[m]}${c}天`).join('、')
    const rows = moodKeys.slice(-14).map(k => `${k.slice(5)}${MOOD_NAME[mood[k]]}`).join('，')
    parts.push(`心情（近30天打卡${moodKeys.length}天）：${rows}；分布：${dist}`)
  } else {
    parts.push('心情：还没有打卡记录')
  }

  const sleep = d.sleepRecords || {}
  const sleepKeys = Object.keys(sleep).sort().slice(-14)
  const sleepRows = sleepKeys.map(k => {
    const r = sleep[k]
    if (!r || !r.sleepTime || !r.wakeTime) return null
    return `${k.slice(5)}睡${(durMinutes(r.sleepTime, r.wakeTime) / 60).toFixed(1)}h(${r.sleepTime}-${r.wakeTime})`
  }).filter(Boolean)
  if (sleepRows.length) {
    let sum = 0
    sleepKeys.forEach(k => {
      const r = sleep[k]
      if (r && r.sleepTime && r.wakeTime) sum += durMinutes(r.sleepTime, r.wakeTime)
    })
    parts.push(`睡眠（近14天）：${sleepRows.join('，')}；平均${(sum / sleepRows.length / 60).toFixed(1)}小时`)
  } else {
    parts.push('睡眠：还没有记录')
  }

  const goals = d.goals || []
  if (goals.length) {
    parts.push('年度目标：' + goals.map(g => {
      const done = (g.items || []).filter(i => i.done).length
      const complete = g.done || done >= (g.target || 1)
      return `${g.title}${complete ? '✓已完成' : `(${done}/${g.target || 1})`}`
    }).join('，'))
  }

  const todos = []
  Object.entries(d.calendarTodos || {}).forEach(([k, arr]) => {
    (arr || []).forEach(t => { if (!t.done) todos.push(`${k.slice(5)} ${t.text}`) })
  })
  if (todos.length) parts.push('未完成待办：' + todos.slice(0, 10).join('，'))

  const ex = d.exerciseRecords || []
  if (ex.length) {
    const total = ex.reduce((s, r) => s + (r.duration || 0), 0)
    parts.push('运动：' + ex.slice(-5).map(r => `${r.type}${r.duration}分钟`).join('，') + `；累计${total}分钟`)
  }

  const pd = d.periodRecords || []
  if (pd.length) parts.push('月事记录（最近）：' + pd.slice(-3).map(r => r.text).join('，'))

  const diet = d.dietRecords || []
  if (diet.length) parts.push('今日饮食：' + diet.map(m => `${m.meal}·${m.content}`).join('，'))

  const ins = d.inspirations || []
  if (ins.length) parts.push('最近灵感：' + ins.slice(0, 3).map(i => i.title).join('、'))
  const mu = d.musings || []
  if (mu.length) parts.push('最近碎碎念：' + mu.slice(0, 3).map(m => `「${m.text.slice(0, 50)}」`).join('；'))

  parts.push('（请基于以上数据与用户对话；数据稀疏时先鼓励记录。）')
  return parts.join('\n')
}
