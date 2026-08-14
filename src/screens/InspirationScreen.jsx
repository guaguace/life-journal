import React, { useState } from 'react'
import { IconImage, IconMic } from '../Icons'

export function InspirationScreen({ inspirations, setInspirations, musings, setMusings }) {
  const [mode, setMode] = useState('inspiration') // 'inspiration' | 'musing'
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [msg, setMsg] = useState('')

  const tags = ['户外', '生活', '阅读', '摄影', '旅行', '美食', '设计']

  const handleAdd = () => {
    setMsg('')
    if (mode === 'inspiration') {
      if (!title.trim() && !text.trim()) { setMsg('请填写标题和描述'); return }
      if (!title.trim()) { setMsg('请填写标题'); return }
      if (!text.trim()) { setMsg('请填写描述'); return }
      const now = new Date()
      setInspirations(prev => [{
        id: Date.now(),
        title: title.trim(),
        desc: text.trim(),
        tag: tag || '生活',
        color: tags.includes(tag) ? ['#A8C49A', '#D4A03E', '#D4B896', '#A8B4C4', '#8FB3D9', '#ED8A7D', '#E05656'][tags.indexOf(tag)] : '#D4A03E',
        date: `${now.getMonth() + 1}月${now.getDate()}日`,
      }, ...prev])
      setTitle('')
    } else {
      if (!text.trim()) { setMsg('请输入碎碎念内容'); return }
      const now = new Date()
      setMusings(prev => [{
        id: Date.now(),
        text: text.trim(),
        date: `${now.getMonth() + 1}月${now.getDate()}日`,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      }, ...prev])
    }
    setText('')
    setTag('')
  }

  const handleDelete = (id, type) => {
    if (type === 'inspiration') setInspirations(prev => prev.filter(i => i.id !== id))
    else setMusings(prev => prev.filter(m => m.id !== id))
  }

  return (
    <>
      <div className="page-header">
        <h2>灵感簿</h2>
        <p className="subtitle">捕捉每一个闪光的瞬间</p>
      </div>

      {/* ── 添加灵感输入卡片 ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">添加灵感</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setMode('inspiration')}
              className={`chip ${mode === 'inspiration' ? 'chip-filled' : 'chip-soft'}`}
              style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              灵感收藏
            </button>
            <button onClick={() => setMode('musing')}
              className={`chip ${mode === 'musing' ? 'chip-filled' : 'chip-soft'}`}
              style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              碎碎念
            </button>
          </div>
        </div>

        {/* 灵感收藏模式：标题 + 标签 */}
        {mode === 'inspiration' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            <input type="text" placeholder="标题" value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', border: '1px solid rgba(123,79,44,0.12)', borderRadius: 10,
                padding: '8px 12px', fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
                color: '#2D1F14', outline: 'none', background: '#FFFCF8',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              {tags.slice(0, 4).map(t => (
                <button key={t} onClick={() => setTag(t)} style={{
                  border: tag === t ? '1.5px solid #7B4F2C' : '1px solid rgba(123,79,44,0.1)',
                  borderRadius: 10, padding: '4px 8px', cursor: 'pointer',
                  background: tag === t ? 'rgba(123,79,44,0.06)' : '#FFFCF8',
                  fontSize: 11, fontFamily: 'var(--font-body)', color: '#6B5644',
                }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* 输入栏（参考 AI 聊一聊） */}
        <div className="ai-input-bar">
          <input type="text"
            placeholder={mode === 'inspiration' ? '描述你的灵感...' : '记录此刻的想法...'}
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="ai-input"
          />
          <button className="ai-icon-btn" title="上传图片"><IconImage size={18} /></button>
          <button className="ai-icon-btn" title="语音输入"><IconMic size={18} /></button>
        </div>
        {msg && <p style={{ color: '#E05656', fontSize: 12, fontFamily: 'var(--font-body)', margin: '8px 0 0' }}>{msg}</p>}
        <button onClick={handleAdd} style={{
          width: '100%', marginTop: 10, height: 36, borderRadius: 13,
          border: 'none', background: '#7B4F2C', color: '#FFFCF8',
          fontFamily: 'var(--font-body)', fontSize: 'var(--fs-label)', fontWeight: 500,
          cursor: 'pointer',
        }}>添加{mode === 'inspiration' ? '灵感' : '碎碎念'}</button>
      </div>

      {/* ── 灵感收藏 ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">灵感收藏</h3>
          <span className="card-badge">{inspirations.length} 条</span>
        </div>
        <div className="card-grid-2" style={{ marginBottom: 0 }}>
          {inspirations.map((item) => (
            <div key={item.id} style={{
              padding: 14, borderRadius: 14, background: 'rgba(123, 79, 44, 0.02)',
              border: '1px solid rgba(123, 79, 44, 0.06)', position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="chip" style={{ background: item.color + '20', color: item.color, fontWeight: 600, height: 24, fontSize: 11 }}>{item.tag}</span>
                <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B' }}>{item.date}</span>
              </div>
              <h4 style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-title)', fontWeight: 600, color: '#2D1F14', marginBottom: 6 }}>{item.title}</h4>
              <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644', lineHeight: 1.6 }}>{item.desc}</p>
              <button onClick={() => handleDelete(item.id, 'inspiration')} style={{
                position: 'absolute', top: 8, right: 8, border: 'none', background: 'rgba(123,79,44,0.06)',
                borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#9C856B', fontSize: 14,
              }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 碎碎念 ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">絮语碎碎念</h3>
          <span className="card-badge">{musings.length} 条</span>
        </div>
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: 'rgba(123, 79, 44, 0.1)', borderRadius: 1 }} />
          {musings.map((item, i) => (
            <div key={item.id} style={{ position: 'relative', paddingBottom: i < musings.length - 1 ? 16 : 0 }}>
              <div style={{
                position: 'absolute', left: -18, top: 8, width: 10, height: 10, borderRadius: '50%',
                background: i === 0 ? '#7B4F2C' : '#D4B896', border: '2px solid #FFFCF8',
                boxShadow: '0 0 0 2px rgba(123, 79, 44, 0.15)',
              }} />
              <div style={{ padding: '12px 14px', background: '#FFFCF8', borderRadius: 14, border: '1px solid rgba(123, 79, 44, 0.06)', position: 'relative' }}>
                <p style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14', lineHeight: 1.7, marginBottom: 8 }}>{item.text}</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#9C856B' }}>
                  <span>{item.date}</span><span>{item.time}</span>
                </div>
                <button onClick={() => handleDelete(item.id, 'musing')} style={{
                  position: 'absolute', top: 8, right: 8, border: 'none', background: 'rgba(123,79,44,0.06)',
                  borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#9C856B', fontSize: 12,
                }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
