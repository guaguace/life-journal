import React, { useState } from 'react'
import BottomSheet from './BottomSheet'

const SPORT_TYPES = ['跑步', '瑜伽', '力量', '骑行', '有氧']

export default function ExerciseRecordModal({ isOpen, onClose, records, onRecordsChange }) {
  const [selectedType, setSelectedType] = useState('跑步')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [msg, setMsg] = useState('')

  const handleSave = () => {
    if (!duration.trim() || !calories.trim()) {
      setMsg('请填写时长和消耗')
      return
    }
    const d = parseInt(duration)
    const c = parseInt(calories)
    if (isNaN(d) || isNaN(c) || d <= 0 || c <= 0) {
      setMsg('请输入有效的数字')
      return
    }
    onRecordsChange(prev => [...prev, { id: Date.now(), type: selectedType, duration: d, calories: c }])
    setDuration('')
    setCalories('')
    setMsg('')
    // 不关闭弹层，用户可以继续添加
  }

  const handleDelete = (id) => {
    onRecordsChange(prev => prev.filter(r => r.id !== id))
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}
      title="新建运动记录"
      subtitle="选择运动类型，填写本次运动的时长与消耗"
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {SPORT_TYPES.map(type => (
          <button key={type} onClick={() => setSelectedType(type)}
            className={`chip ${selectedType === type ? 'chip-filled' : 'chip-soft'}`}
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >{type}</button>
        ))}
      </div>

      <div className="modal-input-row">
        <div className="modal-field">
          <label className="modal-label">时长（分钟）</label>
          <input type="number" placeholder="例如 30" value={duration}
            onChange={e => { setDuration(e.target.value); setMsg('') }}
            className="modal-input" />
        </div>
        <div className="modal-field">
          <label className="modal-label">消耗（千卡）</label>
          <input type="number" placeholder="例如 280" value={calories}
            onChange={e => { setCalories(e.target.value); setMsg('') }}
            className="modal-input" />
        </div>
      </div>

      {msg && <p style={{ color: '#E05656', fontSize: 12, marginBottom: 8, fontFamily: 'var(--font-body)' }}>{msg}</p>}

      <button onClick={handleSave} className="modal-save-btn">保存记录</button>

      {records.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginBottom: 8 }}>已记录 {records.length} 条</p>
          <div className="modal-list">
            {records.map(r => (
              <div key={r.id} className="modal-list-item">
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14', fontWeight: 500 }}>{r.type}</span>
                  <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginLeft: 10 }}>{r.duration}分钟 · {r.calories}千卡</span>
                </div>
                <button onClick={() => handleDelete(r.id)} className="modal-delete-btn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="rgba(123,79,44,0.1)"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#9C856B" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
