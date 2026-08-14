import React from 'react'

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const MOOD_LABELS = ['难过', '低落', '平静', '开心', '兴奋']
const MOOD_SCORE = { excited: 5, happy: 4, calm: 3, low: 2, sad: 1 }

const HEAT_COLORS = {
  excited: '#E05656', happy: '#ED8A7D', calm: '#F0D78A', low: '#8FB3D9', sad: '#6E93C0',
}

const HEAT_GROUPS = [
  { label: '正向', color: '#E05656', moods: ['excited', 'happy'] },
  { label: '中性', color: '#F0D78A', moods: ['calm'] },
  { label: '负向', color: '#6E93C0', moods: ['low', 'sad'] },
]

const HEAT_LABELS = { excited: '兴奋', happy: '开心', calm: '平静', low: '低落', sad: '难过' }
const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1
const TODAY = new Date()
const todayKey = `${CURRENT_YEAR}-${String(CURRENT_MONTH).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`

/* 获取指定年月的天数 */
function daysInMonth(year, month) { return new Date(year, month, 0).getDate() }
/* 获取指定年月1号是星期几 (0=日) */
function monthStartDay(year, month) { return new Date(year, month - 1, 1).getDay() }

/* 折线图：动态计算全年月度均分，未来月份为 null */
function computeMonthlyScores(moodHistory) {
  return MONTHS.map((_, mi) => {
    const m = mi + 1
    if (m > CURRENT_MONTH) return null // 未来月份
    const dim = daysInMonth(CURRENT_YEAR, m)
    let sum = 0, count = 0
    for (let d = 1; d <= dim; d++) {
      const key = `${CURRENT_YEAR}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      if (moodHistory[key]) { sum += MOOD_SCORE[moodHistory[key]] || 3; count++ }
    }
    return count > 0 ? +(sum / count).toFixed(1) : null
  })
}

/* 折线图 */
function MoodLineChart({ data, width = 660, height = 200 }) {
  const pad = { top: 20, right: 20, bottom: 30, left: 40 }
  const cw = width - pad.left - pad.right
  const ch = height - pad.top - pad.bottom
  const stepX = cw / 11
  const minY = 1, maxY = 5

  const validPoints = data.map((v, i) => v !== null ? `${pad.left + i * stepX},${pad.top + ch - ((v - minY) / (maxY - minY)) * ch}` : null).filter(Boolean)

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }}>
      {[1,2,3,4,5].map(v => {
        const y = pad.top + ch - ((v - minY) / (maxY - minY)) * ch
        return <g key={v}>
          <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="rgba(123,79,44,0.08)" strokeWidth="1" />
          <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#9C856B" fontSize="10" fontFamily="Inter">{MOOD_LABELS[v-1]}</text>
        </g>
      })}
      {data.map((_, i) => <text key={i} x={pad.left + i * stepX} y={height - 6} textAnchor="middle" fill="#9C856B" fontSize="9" fontFamily="var(--font-body)">{MONTHS[i]}</text>)}
      {validPoints.length > 1 && <polyline points={validPoints.join(' ')} fill="none" stroke="#7B4F2C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {data.map((v, i) => {
        if (v === null) return null
        const x = pad.left + i * stepX
        const y = pad.top + ch - ((v - minY) / (maxY - minY)) * ch
        const mv = Math.round(v)
        const dc = ['', '#6E93C0', '#8FB3D9', '#F0D78A', '#ED8A7D', '#E05656'][mv] || '#D4A03E'
        return <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#FFFCF8" stroke={dc} strokeWidth="2" />
          <circle cx={x} cy={y} r="3" fill={dc} />
          <text x={x} y={y - 13} textAnchor="middle" fill="#2D1F14" fontSize="10" fontFamily="Inter" fontWeight="600">{v.toFixed(1)}</text>
        </g>
      })}
    </svg>
  )
}

/* 热力图：全年12月, 分两行显示 */
function MoodHeatmap({ moodHistory }) {
  const cell = 13, gap = 3, mgap = 16, lw = 28
  const DAY_LABELS = ['日','一','二','三','四','五','六']
  const monthsPerRow = 6
  const rowW = monthsPerRow * (7 * (cell + gap) + mgap)
  const totalW = lw + rowW + 10
  const rowH = 20 + 7 * (cell + gap) + 10
  const totalH = rowH * 2 + 10

  const renderMonth = (mi, rowIndex) => {
    const m = mi + 1
    const sd = monthStartDay(CURRENT_YEAR, m)
    const dim = daysInMonth(CURRENT_YEAR, m)
    const colInRow = mi % monthsPerRow
    const ox = lw + 5 + colInRow * (7 * (cell + gap) + mgap)
    const oy = 16 + rowIndex * rowH

    return (
      <g key={mi}>
        <text x={ox + 7*(cell+gap)/2} y={oy - 2} textAnchor="middle" fill="#9C856B" fontSize="9" fontFamily="var(--font-body)" fontWeight="500">{MONTHS[mi]}</text>
        {Array.from({length: dim}, (_, di) => {
          const w = Math.floor((di + sd) / 7)
          const dow = (di + sd) % 7
          const cx = ox + w * (cell + gap) + cell/2
          const cy = oy + 4 + dow * (cell + gap) + cell/2
          const dk = `${CURRENT_YEAR}-${String(m).padStart(2,'0')}-${String(di+1).padStart(2,'0')}`
          const mood = moodHistory[dk]
          const color = mood ? HEAT_COLORS[mood] : 'rgba(123,79,44,0.04)'
          const isT = dk === todayKey
          return (
            <rect key={di} x={cx-cell/2} y={cy-cell/2} width={cell} height={cell} rx="2"
              fill={color} stroke={isT ? '#7B4F2C' : 'none'} strokeWidth={isT ? 1.5 : 0}>
              <title>{`${MONTHS[mi]} ${di+1}日${mood ? ': '+HEAT_LABELS[mood] : ' · 未打卡'}`}</title>
            </rect>
          )
        })}
      </g>
    )
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <svg width="100%" height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} style={{ minWidth: 620 }}>
        {/* 星期标签 - 两行各一套 */}
        {[0, 1].map(row => (
          DAY_LABELS.map((day, i) => (
            <text key={`${row}-${day}`} x={lw - 4} y={16 + row * rowH + 4 + i * (cell + gap) + cell/2 + 4} textAnchor="end" fill="#9C856B" fontSize="8" fontFamily="var(--font-body)">{day}</text>
          ))
        ))}
        {/* 1-6月 (第0行) + 7-12月 (第1行) */}
        {Array.from({length: 12}, (_, mi) => renderMonth(mi, mi < 6 ? 0 : 1))}
      </svg>
    </div>
  )
}

export function MoodScreen({ moodHistory }) {
  const monthlyScores = computeMonthlyScores(moodHistory)
  const checkedDays = Object.keys(moodHistory).length
  const currentMonthName = MONTHS[CURRENT_MONTH - 1]

  return (
    <>
      <div className="page-header">
        <h2>心绪轨迹</h2>
        <p className="subtitle">已打卡 {checkedDays} 天</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">全年情绪趋势</h3>
          <span className="card-badge">1-{currentMonthName}</span>
        </div>
        {checkedDays === 0 ? (
          <p style={{ textAlign: 'center', color: '#9C856B', padding: '40px 0', fontSize: 'var(--fs-body)' }}>
            还没有打卡记录，去"今天"页记录心情吧 🌱
          </p>
        ) : (
          <MoodLineChart data={monthlyScores} />
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">全年心绪日历</h3>
          <span className="card-badge">{CURRENT_YEAR}</span>
        </div>
        <MoodHeatmap moodHistory={moodHistory} />
        <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {HEAT_GROUPS.map(g => (
            <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: g.color }} />
              <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644' }}>{g.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(123,79,44,0.06)', border: '1px solid rgba(123,79,44,0.1)' }} />
            <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B' }}>未打卡</span>
          </div>
        </div>
      </div>
    </>
  )
}
