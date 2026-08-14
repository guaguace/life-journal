import React, { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'

const COLORS = [
  { key: 'honey', color: '#D4A03E', label: '蜜' },
  { key: 'green', color: '#A8C49A', label: '绿' },
  { key: 'blue', color: '#8FB3D9', label: '蓝' },
]

/* 从 dateKey "2026-07-15" 解析为中文日期 */
function formatDate(dateKey) {
  const parts = dateKey.split('-')
  const month = parseInt(parts[1])
  const day = parseInt(parts[2])
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const date = new Date(parseInt(parts[0]), month - 1, day)
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 周${weekday}`
}

export default function DateTodoModal({ isOpen, onClose, dateKey, initialTodos, onSave }) {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
  const [newColor, setNewColor] = useState('#D4A03E')

  useEffect(() => {
    if (isOpen) {
      setTodos(initialTodos || [])
      setNewText('')
    }
  }, [isOpen, initialTodos])

  const handleAdd = () => {
    if (!newText.trim()) return
    const updated = [...todos, { id: Date.now(), text: newText.trim(), color: newColor, done: false }]
    setTodos(updated)
    onSave(updated)
    setNewText('')
  }

  const handleToggle = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTodos(updated)
    onSave(updated)
  }

  const handleDelete = (id) => {
    const updated = todos.filter(t => t.id !== id)
    setTodos(updated)
    onSave(updated)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}
      title={dateKey ? formatDate(dateKey) : ''}
      subtitle="点选日期即可增删当日待办 · 色块标记类型"
    >
      <div className="modal-list">
        {todos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9C856B', fontSize: 'var(--fs-body)', padding: '12px 0' }}>
            这天还没有待办
          </p>
        )}
        {todos.map(todo => (
          <div key={todo.id} className="modal-list-item"
            onClick={() => handleToggle(todo.id)}
            style={{ cursor: 'pointer' }}
          >
            {/* 勾选框 */}
            <div style={{
              width: 18, height: 18, borderRadius: 9, flexShrink: 0, marginRight: 8,
              border: todo.done ? 'none' : '2px solid #7B4F2C',
              background: todo.done ? '#7B4F2C' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}>
              {todo.done && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6l2 2 4-4" stroke="#FFFCF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* 颜色标记 */}
            <div style={{ width: 10, height: 10, borderRadius: 3, background: todo.color, flexShrink: 0, marginRight: 8 }} />

            {/* 文案 */}
            <span style={{
              flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
              color: todo.done ? '#9C856B' : '#2D1F14',
              textDecoration: todo.done ? 'line-through' : 'none',
            }}>{todo.text}</span>

            <button onClick={(e) => { e.stopPropagation(); handleDelete(todo.id) }} className="modal-delete-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="7" fill="rgba(123,79,44,0.1)"/>
                <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#9C856B" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 新增待办 */}
      <div className="modal-add-row">
        <input type="text" placeholder="添加待办，如 瑜伽 40min"
          value={newText} onChange={e => setNewText(e.target.value)}
          onKeyDown={handleKeyDown} className="modal-input"
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {COLORS.map(c => (
            <button key={c.key} onClick={() => setNewColor(c.color)} title={c.label} style={{
              width: 20, height: 20, borderRadius: 4,
              border: newColor === c.color ? '2px solid #7B4F2C' : '2px solid transparent',
              background: c.color, cursor: 'pointer', padding: 0,
            }} />
          ))}
        </div>
        <button onClick={handleAdd} className="modal-add-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="#FFFCF8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </BottomSheet>
  )
}
