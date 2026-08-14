import React, { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'

const STATUS_COLORS = { '多': '#D4A03E', '中': '#A8C49A', '少': '#8FB3D9' }

export default function PeriodRecordModal({ isOpen, onClose, records, onRecordsChange }) {
  const [newText, setNewText] = useState('')
  const [newStatus, setNewStatus] = useState('中')

  useEffect(() => { if (isOpen) setNewText('') }, [isOpen])

  const [msg, setMsg] = useState('')

  const handleAdd = () => {
    if (!newText.trim()) { setMsg('请输入记录内容'); return }
    setMsg('')
    onRecordsChange(prev => [...prev, { id: Date.now(), text: newText.trim(), status: newStatus }])
    setNewText('')
  }

  const handleDelete = (id) => {
    onRecordsChange(prev => prev.filter(r => r.id !== id))
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}
      title="月事记录"
      subtitle="点按记录即可编辑 · 点 ✕ 删除一条记录"
    >
      <div className="modal-list">
        {records.length === 0 && <p style={{ textAlign: 'center', color: '#9C856B', fontSize: 'var(--fs-body)', padding: '12px 0' }}>暂无记录</p>}
        {records.map(r => (
          <div key={r.id} className="modal-list-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 6, background: STATUS_COLORS[r.status] || '#D4A03E', color: '#FFFCF8', fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 600, padding: '0 6px' }}>{r.status}</span>
              <span style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14' }}>{r.text}</span>
            </div>
            <button onClick={() => handleDelete(r.id)} className="modal-delete-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="rgba(123,79,44,0.1)"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#9C856B" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="modal-add-row">
        <div style={{ display: 'flex', gap: 4, marginRight: 6 }}>
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <button key={key} onClick={() => setNewStatus(key)} style={{
              width: 22, height: 22, borderRadius: 6, cursor: 'pointer',
              border: newStatus === key ? '2px solid #7B4F2C' : '2px solid transparent',
              background: color, color: '#FFFCF8', fontSize: 11, fontFamily: 'var(--font-body)',
              fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}>{key}</button>
          ))}
        </div>
        {msg && <p style={{ color: '#E05656', fontSize: 12, fontFamily: 'var(--font-body)', width: '100%', margin: 0 }}>{msg}</p>}
        <input type="text" placeholder="添加记录，如 7月20日 经期开始" value={newText}
          onChange={e => { setNewText(e.target.value); setMsg('') }} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="modal-input" style={{ flex: 1 }} />
        <button onClick={handleAdd} className="modal-add-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#FFFCF8" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
    </BottomSheet>
  )
}
