/* ===== AI 知己「小记」：配置存储 + 数据上下文构建 ===== */

const AI_CFG_KEY = 'lifejournal_ai_cfg'
const CHAT_KEY = 'lifejournal_ai_chat'

export const AI_MODELS = [
  { id: 'claude-opus-5', label: 'Opus 5 · 最聪明（推荐）' },
  { id: 'claude-sonnet-5', label: 'Sonnet 5 · 均衡' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 · 最快最省' },
]

export function getAIConfig() {
  try { return JSON.parse(localStorage.getItem(AI_CFG_KEY)) || null } catch (e) { return null }
}
export function setAIConfig(cfg) {
  localStorage.setItem(AI_CFG_KEY, JSON.stringify(cfg))
}
export function getChatHistory() {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || [] } catch (e) { return [] }
}

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

  /* 心情：近 30 天逐日 + 分布 */
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

  /* 睡眠：近 14 天 */
  const sleep = d.sleepRecords || {}
  const sleepKeys = Object.keys(sleep).sort().slice(-14)
  const sleepRows = sleepKeys.map(k => {
    const r = sleep[k]
    if (!r || !r.sleepTime || !r.wakeTime) return null
    return `${k.slice(5)}睡${(durMinutes(r.sleepTime, r.wakeTime) / 60).toFixed(1)}h(${r.sleepTime}-${r.wakeTime})`
  }).filter(Boolean)
  if (sleepRows.length) {
    const avg = sleepRows.length
      ? (sleepRows.reduce((s, _, i) => {
          const r = sleep[sleepKeys[i]]
          return s + durMinutes(r.sleepTime, r.wakeTime)
        }, 0) / sleepRows.length / 60).toFixed(1)
      : '0'
    parts.push(`睡眠（近14天）：${sleepRows.join('，')}；平均${avg}小时`)
  } else {
    parts.push('睡眠：还没有记录')
  }

  /* 年度目标 */
  const goals = d.goals || []
  if (goals.length) {
    parts.push('年度目标：' + goals.map(g => {
      const done = (g.items || []).filter(i => i.done).length
      const complete = g.done || done >= (g.target || 1)
      return `${g.title}${complete ? '✓已完成' : `(${done}/${g.target || 1})`}`
    }).join('，'))
  }

  /* 未完成待办 */
  const todos = []
  Object.entries(d.calendarTodos || {}).forEach(([k, arr]) => {
    (arr || []).forEach(t => { if (!t.done) todos.push(`${k.slice(5)} ${t.text}`) })
  })
  if (todos.length) parts.push('未完成待办：' + todos.slice(0, 10).join('，'))

  /* 运动 */
  const ex = d.exerciseRecords || []
  if (ex.length) {
    const total = ex.reduce((s, r) => s + (r.duration || 0), 0)
    parts.push('运动：' + ex.slice(-5).map(r => `${r.type}${r.duration}分钟`).join('，') + `；累计${total}分钟`)
  }

  /* 月事 */
  const pd = d.periodRecords || []
  if (pd.length) parts.push('月事记录（最近）：' + pd.slice(-3).map(r => r.text).join('，'))

  /* 今日饮食 */
  const diet = d.dietRecords || []
  if (diet.length) parts.push('今日饮食：' + diet.map(m => `${m.meal}·${m.content}`).join('，'))

  /* 灵感与碎碎念 */
  const ins = d.inspirations || []
  if (ins.length) parts.push('最近灵感：' + ins.slice(0, 3).map(i => i.title).join('、'))
  const mu = d.musings || []
  if (mu.length) parts.push('最近碎碎念：' + mu.slice(0, 3).map(m => `「${m.text.slice(0, 50)}」`).join('；'))

  parts.push('（请基于以上数据与用户对话；数据稀疏时先鼓励记录。）')
  return parts.join('\n')
}
