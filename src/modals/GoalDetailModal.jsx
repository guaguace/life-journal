import React, { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'

/* 目标详情弹层：子进度勾选/添加、目标数量、完成标记 */
export default function GoalDetailModal({ isOpen, onClose, goal, onUpdate }) {
  const [newItem, setNewItem] = useState('')

  useEffect(() => { if (isOpen) setNewItem('') }, [isOpen])

  if (!goal) return null

  const items = goal.items || []
  const target = goal.target || 1
  const doneCount = items.filter(i => i.done).length
  const autoDone = doneCount >= target
  const complete = goal.done || autoDone
  const pct = Math.min(100, Math.round((doneCount / target) * 100))

  const toggleItem = (id) => {
    onUpdate(goal.id, { items: items.map(i => i.id === id ? { ...i, done: !i.done } : i) })
  }
  const addItem = () => {
    if (!newItem.trim()) return
    onUpdate(goal.id, { items: [...items, { id: Date.now(), text: newItem.trim(), done: false }] })
    setNewItem('')
  }
  const deleteItem = (id) => {
    onUpdate(goal.id, { items: items.filter(i => i.id !== id) })
  }
  const toggleDone = () => {
    onUpdate(goal.id, { done: !complete })
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}
      title={goal.title}
      subtitle={complete ? '已完成 ✓' : '勾选子进度，或手动标记完成'}
    >
      {/* 完成徽标 */}
      {complete && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 12, marginBottom: 12,
          background: 'rgba(168,196,154,0.25)', color: '#52784B',
          fontSize: 'var(--fs-label)', fontWeight: 600, fontFamily: 'var(--font-body)',
        }}>
          ✓ 已完成
        </div>
      )}

      {/* 进度条 + 目标数量 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644' }}>
            完成进度 {doneCount}/{target}
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B' }}>
            目标数量
            <input type="number" min="1" value={target}
              onChange={e => {
                const v = parseInt(e.target.value)
                if (!isNaN(v) && v >= 1) onUpdate(goal.id, { target: v })
              }}
              style={{
                width: 52, border: '1px solid rgba(123,79,44,0.18)', borderRadius: 8,
                padding: '4px 8px', fontSize: 13, fontFamily: 'var(--font-number)',
                color: '#2D1F14', background: '#FFFCF8',
              }} />
          </label>
        </div>
        <div className="progress-bar" style={{ height: 7, marginTop: 0 }}>
          <div className="progress-bar-fill" style={{ width: pct + '%' }} />
        </div>
      </div>

      {/* 子进度列表 */}
      <div className="modal-list">
        {items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9C856B', fontSize: 'var(--fs-caption)', padding: '8px 0' }}>
            {target > 1 ? `还没有子进度，把完成的一项项加进来（目标 ${target} 项）` : '这个目标可以勾选完成即可'}
          </p>
        )}
        {items.map(item => (
          <div key={item.id} className="modal-list-item"
            onClick={() => toggleItem(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 9, flexShrink: 0, marginRight: 8,
              border: item.done ? 'none' : '2px solid #7B4F2C',
              background: item.done ? '#7B4F2C' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}>
              {item.done && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6l2 2 4-4" stroke="#FFFCF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{
              flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
              color: item.done ? '#9C856B' : '#2D1F14',
              textDecoration: item.done ? 'line-through' : 'none',
            }}>{item.text}</span>
            <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }} className="modal-delete-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="rgba(123,79,44,0.1)"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#9C856B" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* 添加子进度 */}
      {target > 1 && (
        <div className="modal-add-row" style={{ marginBottom: 12 }}>
          <input type="text" placeholder={`添加子进度，如《某本书》`}
            value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            className="modal-input" />
          <button onClick={addItem} className="modal-add-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#FFFCF8" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {/* 完成/取消完成 */}
      <button onClick={toggleDone} style={{
        width: '100%', height: 42, borderRadius: 13, cursor: 'pointer',
        border: complete ? '1.5px solid rgba(123,79,44,0.3)' : 'none',
        background: complete ? '#FFFCF8' : '#7B4F2C',
        color: complete ? '#7B4F2C' : '#FFFCF8',
        fontFamily: 'var(--font-body)', fontSize: 'var(--fs-label)', fontWeight: 600,
      }}>
        {complete ? '取消完成' : '标记为已完成'}
      </button>
    </BottomSheet>
  )
}
