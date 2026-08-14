import React from 'react'
import { moodIcons, IconImage, IconMic, IconCheck } from '../Icons'

const MOOD_OPTIONS = [
  { key: 'excited', label: '兴奋' },
  { key: 'happy', label: '开心' },
  { key: 'calm', label: '平静' },
  { key: 'low', label: '低落' },
  { key: 'sad', label: '难过' },
]

function MoodSelector({ todayKey, moodHistory, onMoodChange }) {
  const currentMood = moodHistory[todayKey] || null
  const hasCheckedIn = currentMood !== null

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">今日心绪</h3>
        <span className="card-badge" style={{
          color: hasCheckedIn ? '#9C856B' : '#D4A03E', fontWeight: hasCheckedIn ? 400 : 500,
        }}>
          {hasCheckedIn ? '已打卡 ✓' : '今日未打卡'}
        </span>
      </div>
      <div style={{ display: 'flex', paddingTop: 4, gap: 2 }}>
        {MOOD_OPTIONS.map((mood) => {
          const Icon = moodIcons[mood.key]
          const isSelected = currentMood === mood.key
          // 小屏适配：flex:1 均分宽度，选中图标适度放大（52px），不再溢出
          return (
            <button
              key={mood.key}
              onClick={() => onMoodChange(todayKey, mood.key)}
              style={{
                flex: 1, minWidth: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, cursor: 'pointer',
                border: isSelected ? '2px solid #7B4F2C' : '2px solid transparent',
                background: isSelected ? 'rgba(123, 79, 44, 0.05)' : 'transparent',
                padding: '6px 2px', borderRadius: 14,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* 固定 44px 槽位 + transform 缩放，选中不引起布局跳变 */}
              <span style={{
                height: 44, display: 'flex', alignItems: 'center',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <Icon size={44} />
              </span>
              <span style={{
                fontSize: 'var(--fs-mood-label)', fontFamily: 'var(--font-body)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#7B4F2C' : '#6B5644',
                whiteSpace: 'nowrap',
              }}>
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AIChatCard() {
  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">和 AI 聊一聊</h3></div>
      <div className="ai-input-bar">
        <input type="text" placeholder="说说今天想聊什么..." className="ai-input" />
        <button className="ai-icon-btn" title="上传图片"><IconImage size={18} /></button>
        <button className="ai-icon-btn" title="语音输入"><IconMic size={18} /></button>
      </div>
    </div>
  )
}

/* 近期待办：优先显示今日，今日为空则显示离今天最近的待办 */
function TodoCard({ todayKey, calendarTodos, onCalendarTodosChange }) {
  const todayTodos = calendarTodos[todayKey] || []

  // 决定展示哪一天的待办
  let displayKey = null
  let displayTodos = []
  let isTodayView = false

  if (todayTodos.length > 0) {
    displayKey = todayKey
    displayTodos = todayTodos
    isTodayView = true
  } else {
    // 找离今天最近的日期（优先未来）
    const now = new Date(todayKey + 'T12:00:00')
    let best = null, bestDist = Infinity
    for (const [dk, ts] of Object.entries(calendarTodos)) {
      if (!ts || ts.length === 0) continue
      const d = new Date(dk + 'T12:00:00')
      const dist = Math.abs(d - now)
      if (dist < bestDist || (dist === bestDist && d >= now && new Date(best + 'T12:00:00') < now)) {
        bestDist = dist
        best = dk
      }
    }
    if (best) { displayKey = best; displayTodos = calendarTodos[best] }
  }

  const handleToggle = (id) => {
    const updated = displayTodos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    onCalendarTodosChange(displayKey, updated)
  }

  const doneCount = displayTodos.filter(t => t.done).length

  /* 日期显示文案 */
  const dateLabel = (() => {
    if (!displayKey) return ''
    if (displayKey === todayKey) return '今天'
    const [, m, d] = displayKey.split('-')
    return `${parseInt(m)}月${parseInt(d)}日`
  })()

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">近期待办</h3>
        <span className="card-badge">
          {displayKey ? `${dateLabel} · ${doneCount}/${displayTodos.length}` : '0/0'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayTodos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9C856B', padding: '16px 0', fontSize: 'var(--fs-body)' }}>
            近期没有待办 · 去月历页面添加
          </p>
        )}
        {displayTodos.map((todo) => (
          <div key={todo.id} onClick={() => handleToggle(todo.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#FFFCF8',
            borderRadius: 12, padding: '12px 12px', height: 44, cursor: 'pointer',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10, flexShrink: 0,
              border: todo.done ? 'none' : '2px solid #7B4F2C',
              background: todo.done ? '#7B4F2C' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}>
              {todo.done && <IconCheck size={14} />}
            </div>
            {/* 非今日的待办显示日期标记 */}
            {!isTodayView && (
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-number)', color: '#9C856B',
                background: 'rgba(123,79,44,0.05)', padding: '2px 7px', borderRadius: 7,
                flexShrink: 0,
              }}>{dateLabel}</span>
            )}
            <span style={{
              flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
              color: todo.done ? '#9C856B' : 'var(--text-primary)',
              textDecoration: todo.done ? 'line-through' : 'none',
            }}>{todo.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* 年度清单：汇总 calendarTodos 中所有 todo 的完成进度 */
function GoalsCard({ calendarTodos }) {
  const allTodos = Object.values(calendarTodos).flat()
  const done = allTodos.filter(t => t.done).length
  const total = allTodos.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">年度清单</h3>
        <span className="card-badge">{done}/{total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p style={{ marginTop: 10, fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: 'var(--text-disabled)' }}>
        {total === 0 ? '去月历添加待办吧 🌱' : `已完成 ${done} 项，继续加油 🌱`}
      </p>
    </div>
  )
}

export function TodayScreen({ todayKey, moodHistory, onMoodChange, calendarTodos, onCalendarTodosChange }) {
  const weekdays = ['日','一','二','三','四','五','六']
  const d = new Date()

  return (
    <>
      <div className="page-header">
        <h2>今天</h2>
        <p className="subtitle">{d.getMonth()+1}月{d.getDate()}日 星期{weekdays[d.getDay()]}</p>
      </div>
      <MoodSelector todayKey={todayKey} moodHistory={moodHistory} onMoodChange={onMoodChange} />
      <AIChatCard />
      <TodoCard todayKey={todayKey} calendarTodos={calendarTodos} onCalendarTodosChange={onCalendarTodosChange} />
      <GoalsCard calendarTodos={calendarTodos} />
    </>
  )
}
