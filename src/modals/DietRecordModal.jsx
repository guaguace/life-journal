import React, { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐']

export default function DietRecordModal({ isOpen, onClose, records, onRecordsChange }) {
  const [newMeal, setNewMeal] = useState('加餐')
  const [newContent, setNewContent] = useState('')
  const [newCal, setNewCal] = useState('')

  useEffect(() => { if (isOpen) { setNewContent(''); setNewCal('') } }, [isOpen])

  const [msg, setMsg] = useState('')

  const handleAdd = () => {
    if (!newContent.trim() || !newCal) { setMsg('请填写食物内容和热量'); return }
    const c = parseInt(newCal)
    if (isNaN(c) || c <= 0) { setMsg('请输入有效的热量值'); return }
    setMsg('')
    onRecordsChange(prev => [...prev, { id: Date.now(), meal: newMeal, content: newContent.trim(), cal: c }])
    setNewContent('')
    setNewCal('')
  }

  const handleDelete = (id) => {
    onRecordsChange(prev => prev.filter(m => m.id !== id))
  }

  const totalCal = records.reduce((sum, m) => sum + m.cal, 0)

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}
      title="今日食光"
      subtitle="记录一餐 · 点 ✕ 删除"
    >
      <div style={{ textAlign: 'center', padding: '8px 0 14px', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B' }}>
        今日总计 <span style={{ fontFamily: 'var(--font-number)', color: '#D4A03E', fontWeight: 600, fontSize: 16 }}>{totalCal.toLocaleString()}</span> 千卡
      </div>

      <div className="modal-list">
        {records.length === 0 && <p style={{ textAlign: 'center', color: '#9C856B', fontSize: 'var(--fs-body)', padding: '12px 0' }}>暂无记录</p>}
        {records.map(m => (
          <div key={m.id} className="modal-list-item">
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)', color: '#7B4F2C', fontWeight: 600, minWidth: 32 }}>{m.meal}</span>
              <span style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14', flex: 1 }}>{m.content}</span>
              <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#B8763A', fontWeight: 500, whiteSpace: 'nowrap' }}>{m.cal} kcal</span>
            </div>
            <button onClick={() => handleDelete(m.id)} className="modal-delete-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="rgba(123,79,44,0.1)"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#9C856B" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="modal-add-row" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {MEAL_TYPES.map(type => (
            <button key={type} onClick={() => setNewMeal(type)}
              className={`chip ${newMeal === type ? 'chip-filled' : 'chip-soft'}`}
              style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', height: 28, fontSize: 11 }}
            >{type}</button>
          ))}
        </div>
        {msg && <p style={{ color: '#E05656', fontSize: 12, fontFamily: 'var(--font-body)', width: '100%', margin: 0 }}>{msg}</p>}
        <input type="text" placeholder="食物内容，如 酸奶" value={newContent}
          onChange={e => { setNewContent(e.target.value); setMsg('') }} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="modal-input" style={{ flex: 1, minWidth: 100 }} />
        <input type="number" placeholder="千卡" value={newCal}
          onChange={e => { setNewCal(e.target.value); setMsg('') }} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="modal-input" style={{ width: 64 }} />
        <button onClick={handleAdd} className="modal-add-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#FFFCF8" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
    </BottomSheet>
  )
}
