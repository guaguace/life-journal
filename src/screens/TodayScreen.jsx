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
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 4 }}>
        {MOOD_OPTIONS.map((mood) => {
          const Icon = moodIcons[mood.key]
          const isSelected = currentMood === mood.key
          return (
            <button key={mood.key} onClick={() => onMoodChange(todayKey, mood.key)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              cursor: 'pointer', border: isSelected ? '2px solid #7B4F2C' : '2px solid transparent',
              background: isSelected ? 'rgba(123, 79, 44, 0.05)' : 'transparent',
              padding: '8px 12px', borderRadius: 16, transition: 'all 0.25s',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
            }}>
              <Icon size={isSelected ? 56 : 44} />
              <span style={{
                fontSize: 'var(--fs-mood-label)', fontFamily: 'var(--font-body)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#7B4F2C' : '#6B5644',
              }}>{mood.label}</span>
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

/* 今日待办：与月历共享 calendarTodos，读写今天日期的待办 */
function TodoCard({ todayKey, calendarTodos, onCalendarTodosChange }) {
  const todos = calendarTodos[todayKey] || []

  const handleToggle = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    onCalendarTodosChange(todayKey, updated)
  }

  const doneCount = todos.filter(t => t.done).length

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">今日待办</h3>
        <span className="card-badge">{doneCount}/{todos.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {todos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9C856B', padding: '16px 0', fontSize: 'var(--fs-body)' }}>
            今天还没有待办 · 去月历页面添加
          </p>
        )}
        {todos.map((todo) => (
          <div key={todo.id} onClick={() => handleToggle(todo.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#FFFCF8',
            borderRadius: 12, padding: '12px 12px', height: 44, cursor: 'pointer',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10, flexShrink: 0,
              border: todo.done ? 'none' : '2px solid #7B4F2C',
              background: todo.done ? '#7B4F2C' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {todo.done && <IconCheck size={14} />}
            </div>
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
