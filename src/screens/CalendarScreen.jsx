import React, { useState, useEffect } from 'react'
import { IconPlus, IconTrash, IconChevronDown } from '../Icons'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const GOAL_CHIPS = ['读完 12 本书', '学会游泳', '去一次海边', '存下旅行基金']

/* 获取某月天数 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/* 获取某月1号是星期几 (0=Sun) */
function getStartDay(year, month) {
  return new Date(year, month - 1, 1).getDay()
}

function MonthCalendar({ year, month, onPrevMonth, onNextMonth, calendarTodos, onDateClick }) {
  const now = new Date()
  const realToday = now.getDate()
  const realMonth = now.getMonth() + 1
  const realYear = now.getFullYear()
  const isCurrentMonth = (year === realYear && month === realMonth)

  const daysInMonth = getDaysInMonth(year, month)
  const startDay = getStartDay(year, month)

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const getDateKey = (day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={onPrevMonth} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, fontSize: 16, color: '#9C856B', fontFamily: 'var(--font-body)' }}>◀</button>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 'var(--fs-card-title)', fontWeight: 600, color: '#2D1F14' }}>{year}年 {month}月</h3>
        <button onClick={onNextMonth} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, fontSize: 16, color: '#9C856B', fontFamily: 'var(--font-body)' }}>▶</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {WEEKDAYS.map(day => <div key={day} style={{ textAlign: 'center', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', padding: '4px 0', fontWeight: 500 }}>{day}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((day, i) => {
          const dateKey = day ? getDateKey(day) : null
          const todos = dateKey ? (calendarTodos[dateKey] || []) : []
          const doneCount = todos.filter(t => t.done).length
          const totalCount = todos.length
          return (
            <div key={i} onClick={day ? () => onDateClick(dateKey) : undefined} style={{
              aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', borderRadius: 12, cursor: day ? 'pointer' : 'default',
              background: (isCurrentMonth && day === realToday) ? '#7B4F2C' : 'transparent',
              color: (isCurrentMonth && day === realToday) ? '#FFFCF8' : day ? '#2D1F14' : 'transparent',
              fontWeight: (isCurrentMonth && day === realToday) ? 600 : 400, fontSize: 'var(--fs-body)',
              fontFamily: 'var(--font-number)', transition: 'all 0.15s ease', padding: '2px',
            }}>
              <span>{day}</span>
              {day && totalCount > 0 && (
                <div style={{ display: 'flex', gap: 2, marginTop: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {todos.slice(0, 3).map((t, ti) => (
                    <div key={ti} style={{
                      width: 5, height: 5, borderRadius: 1.5,
                      background: t.done ? t.color : ((isCurrentMonth && day === realToday) ? 'rgba(255,255,255,0.4)' : 'rgba(123,79,44,0.12)'),
                      border: t.done ? 'none' : `1px solid ${(isCurrentMonth && day === realToday) ? 'rgba(255,255,255,0.5)' : 'rgba(123,79,44,0.2)'}`,
                    }} />
                  ))}
                  {totalCount > 3 && <span style={{ fontSize: 7, color: (isCurrentMonth && day === realToday) ? '#FFFCF8' : '#9C856B', lineHeight: '5px' }}>+</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarScreen({ calendarTodos, onCalendarTodosChange, openDateModal }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [showYearPicker, setShowYearPicker] = useState(false)
  // 年度目标：localStorage 持久化，支持增删
  const [goals, setGoals] = useState(() => {
    try {
      const s = localStorage.getItem('lifejournal_goals')
      return s ? JSON.parse(s) : GOAL_CHIPS
    } catch (e) { return GOAL_CHIPS }
  })
  useEffect(() => {
    try { localStorage.setItem('lifejournal_goals', JSON.stringify(goals)) } catch (e) {}
  }, [goals])

  const handlePrevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const handleNextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const handleAddGoal = () => { const g = prompt('输入新的年度目标：'); if (g && g.trim()) setGoals(prev => [...prev, g.trim()]) }
  const handleDeleteGoal = (idx) => {
    if (confirm('删除这个目标？')) setGoals(prev => prev.filter((_, i) => i !== idx))
  }

  const cy = now.getFullYear()
  const yearOptions = [cy-2, cy-1, cy, cy+1, cy+2]

  // 汇总当月待办
  const monthTodos = Object.entries(calendarTodos)
    .filter(([key]) => key.startsWith(`${year}-${String(month).padStart(2, '0')}`))
    .flatMap(([key, todos]) => todos.map(t => ({ ...t, dateKey: key })))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))

  const handleDeleteTodo = (todoId, dateKey) => {
    const current = calendarTodos[dateKey] || []
    onCalendarTodosChange(dateKey, current.filter(t => t.id !== todoId))
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>月历手账</h2>
          <p className="subtitle">记录每个月的点滴</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowYearPicker(!showYearPicker)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            background: '#FFFCF8', border: '1px solid rgba(123, 79, 44, 0.15)', borderRadius: 16,
            cursor: 'pointer', fontFamily: 'var(--font-number)', fontSize: 13, fontWeight: 500, color: '#7B4F2C',
          }}>{year} <IconChevronDown color="#7B4F2C" size={12} /></button>
          {showYearPicker && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#FFFCF8', borderRadius: 12, boxShadow: 'var(--shadow-card)', border: '1px solid rgba(123,79,44,0.08)', overflow: 'hidden', zIndex: 20, minWidth: 80 }}>
              {yearOptions.map(y => (
                <button key={y} onClick={() => { setYear(y); setShowYearPicker(false) }} style={{
                  display: 'block', width: '100%', padding: '8px 16px', border: 'none',
                  background: y === year ? 'rgba(123,79,44,0.06)' : 'transparent', cursor: 'pointer',
                  fontFamily: 'var(--font-number)', fontSize: 13,
                  color: y === year ? '#7B4F2C' : '#6B5644', fontWeight: y === year ? 600 : 400, textAlign: 'center',
                }}>{y}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <MonthCalendar year={year} month={month} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
          calendarTodos={calendarTodos} onDateClick={(dateKey) => openDateModal(dateKey)} />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">年度目标系列</h3>
            <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 2 }}>今年想完成的 12 件小事，慢慢来</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="card-badge">6 / 12 项</span>
            <button onClick={handleAddGoal} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex', color: '#7B4F2C' }} title="添加目标"><IconPlus color="#7B4F2C" size={18} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {goals.map((chip, i) => (
            <span key={i} className="chip chip-soft" style={{ position: 'relative', paddingRight: 24, gap: 0 }}>
              {chip}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteGoal(i) }}
                title="删除目标"
                style={{
                  position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'rgba(123,79,44,0.08)', borderRadius: '50%',
                  width: 16, height: 16, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#9C856B', fontSize: 9, padding: 0, lineHeight: 1,
                }}
              >✕</button>
            </span>
          ))}
        </div>
      </div>

      {/* ── 月度待办 → 小方块卡片展示 ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{month}月待办</h3>
          <span className="card-badge">{monthTodos.filter(t => t.done).length}/{monthTodos.length} 完成</span>
        </div>
        {monthTodos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9C856B', fontSize: 'var(--fs-body)', padding: '28px 0' }}>
            暂无待办 · 点击日历日期添加
          </p>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10,
          }}>
            {monthTodos.map((todo) => {
              const dateParts = todo.dateKey.split('-')
              const dateLabel = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`
              return (
                <div key={todo.id} style={{
                  position: 'relative', padding: '12px 14px',
                  borderRadius: 14, border: `1.5px solid ${todo.color}20`,
                  background: todo.done ? `${todo.color}08` : '#FFFCF8',
                  opacity: todo.done ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}>
                  {/* 顶部颜色条 */}
                  <div style={{
                    position: 'absolute', top: 0, left: 12, right: 12, height: 3,
                    borderRadius: '0 0 3px 3px',
                    background: todo.done ? `${todo.color}40` : todo.color,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, marginTop: 4 }}>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-number)', color: '#9C856B',
                      background: 'rgba(123,79,44,0.04)', padding: '2px 6px', borderRadius: 6,
                    }}>{dateLabel}</span>
                    {todo.done && <span style={{ fontSize: 10, color: '#A8C49A', fontWeight: 600 }}>✓</span>}
                  </div>
                  <p style={{
                    fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
                    color: todo.done ? '#9C856B' : '#2D1F14',
                    textDecoration: todo.done ? 'line-through' : 'none',
                    lineHeight: 1.4, margin: 0, wordBreak: 'break-word',
                  }}>{todo.text}</p>
                  <button onClick={() => handleDeleteTodo(todo.id, todo.dateKey)} style={{
                    position: 'absolute', top: 6, right: 8, border: 'none', background: 'rgba(123,79,44,0.06)',
                    borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#9C856B', fontSize: 11,
                  }}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
