import React, { useState, useEffect, useRef } from 'react'
import { moodIcons, IconImage, IconMic, IconCheck } from '../Icons'
import { getAIConfig, getActiveProvider, getChatHistory, AI_SYSTEM_PROMPT, buildContext, streamChat, explainError } from '../ai'

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

/* ── 与 AI 聊天：读取全部数据作为上下文，引导自我探索 ── */
function AIChat({ aiData }) {
  const [cfg] = useState(() => getAIConfig())
  const [messages, setMessages] = useState(() => getChatHistory().slice(-30))
  const [input, setInput] = useState('')
  const [pendingImage, setPendingImage] = useState(null) // { media_type, data }
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const listRef = useRef(null)
  const fileRef = useRef(null)

  /* 新消息自动滚到底部 */
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy, pendingImage])

  /* 持久化（仅文本，图片不落盘） */
  const persist = (msgs) => {
    const clean = msgs.map(m => ({
      role: m.role,
      content: Array.isArray(m.content)
        ? m.content.filter(b => b.type === 'text').map(b => b.text).join('')
        : m.content,
    }))
    try { localStorage.setItem('lifejournal_ai_chat', JSON.stringify(clean.slice(-30))) } catch (e) {}
  }

  const handlePickImage = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      setNotice('请选择图片文件（png / jpg / gif / webp）')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPendingImage({ media_type: file.type, data: String(reader.result).split(',')[1] })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const send = async () => {
    const text = input.trim()
    if (!text && !pendingImage) return
    const active = getActiveProvider(cfg)
    if (!active || !active.key || (active.type === 'openai' && !active.baseUrl && !active.target)) {
      setNotice('请先在「我的」页配置 AI 知己（选择供应商并填写 API Key）')
      return
    }
    setNotice('')

    /* 组装用户消息：纯文字用字符串；带图片（仅 Claude 支持）用内容块数组 */
    const userContent = []
    if (text) userContent.push({ type: 'text', text })
    let withImage = false
    if (pendingImage) {
      if (active.type === 'claude') {
        userContent.push({ type: 'image', source: { type: 'base64', media_type: pendingImage.media_type, data: pendingImage.data } })
        withImage = true
      } else {
        setNotice('当前供应商暂不支持图片，已仅发送文字')
      }
    }
    const userMsg = { role: 'user', content: withImage ? userContent : (text || '') }

    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setPendingImage(null)
    setBusy(true)
    persist(next)

    let acc = ''
    setMessages([...next, { role: 'assistant', content: '' }])

    try {
      await streamChat(
        cfg,
        AI_SYSTEM_PROMPT + '\n\n' + buildContext(aiData),
        next.slice(-20).map(m => ({ role: m.role, content: m.content })),
        (delta) => {
          acc += delta
          setMessages(msgs => {
            const copy = [...msgs]
            copy[copy.length - 1] = { role: 'assistant', content: acc }
            return copy
          })
        }
      )
      if (!acc) acc = '（我好像走神了，再说一次？）'
    } catch (err) {
      acc = explainError(err)
    }

    setBusy(false)
    setMessages(msgs => {
      const copy = [...msgs]
      copy[copy.length - 1] = { role: 'assistant', content: acc }
      return copy
    })
    persist([...next, { role: 'assistant', content: acc }])
  }

  const clearChat = () => {
    if (!confirm('清空与小记的对话记录？')) return
    setMessages([])
    try { localStorage.removeItem('lifejournal_ai_chat') } catch (e) {}
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">和 AI 聊一聊</h3>
          <p style={{ fontSize: 10.5, fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 2 }}>
            我是小记 ✨ 我了解你记录的所有心情、睡眠和点滴
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 11, fontFamily: 'var(--font-body)', color: '#9C856B',
            textDecoration: 'underline', textUnderlineOffset: 3,
          }}>清空对话</button>
        )}
      </div>

      {/* 消息列表 */}
      <div ref={listRef} style={{
        maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: 10, padding: '4px 2px 10px',
      }}>
        {messages.length === 0 && !pendingImage && (
          <p style={{
            textAlign: 'center', color: '#9C856B', fontSize: 12.5,
            fontFamily: 'var(--font-body)', lineHeight: 1.7, padding: '14px 8px',
          }}>
            试着问我：<br />「最近我状态怎么样？」「为什么总是睡不好？」<br />「我最近开心吗？」
          </p>
        )}
        {messages.map((m, i) => {
          const isUser = m.role === 'user'
          /* 兼容三种消息格式：字符串 / 内容块数组 / 单内容块对象 */
          const blocks = Array.isArray(m.content) ? m.content
            : (m.content && typeof m.content === 'object' ? [m.content] : null)
          const imgBlock = blocks ? blocks.find(b => b.type === 'image') : null
          let textParts = []
          if (typeof m.content === 'string') textParts = [m.content]
          else if (blocks) textParts = blocks.filter(b => b.type === 'text').map(b => b.text)
          return (
            <div key={i} style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {imgBlock && (
                <img
                  src={`data:${imgBlock.source.media_type};base64,${imgBlock.source.data}`}
                  alt="发送的图片"
                  style={{ maxWidth: 160, borderRadius: 12, alignSelf: 'flex-end' }}
                />
              )}
              {textParts.filter(t => t).map((t, ti) => (
                <div key={ti} style={{
                  background: isUser ? '#7B4F2C' : '#F5EDE3',
                  color: isUser ? '#FFFCF8' : '#2D1F14',
                  borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '9px 13px',
                  fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
                  lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {t || (busy && i === messages.length - 1 ? (
                    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  ) : '')}
                </div>
              ))}
            </div>
          )
        })}

        {/* 待发送图片预览 */}
        {pendingImage && (
          <div style={{ alignSelf: 'flex-end', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <img
              src={`data:${pendingImage.media_type};base64,${pendingImage.data}`}
              alt="待发送图片"
              style={{ maxWidth: 160, borderRadius: 12, opacity: 0.7 }}
            />
            <button onClick={() => setPendingImage(null)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 11, fontFamily: 'var(--font-body)', color: '#9C856B',
            }}>移除图片</button>
          </div>
        )}
      </div>

      {notice && (
        <p style={{ color: '#B8763A', fontSize: 11.5, fontFamily: 'var(--font-body)', margin: '0 2px 8px' }}>
          {notice}
        </p>
      )}

      {/* 输入栏 */}
      <div className="ai-input-bar">
        <input
          type="text"
          placeholder="说说今天想聊什么..."
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !busy) send() }}
        />
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handlePickImage} style={{ display: 'none' }} />
        <button className="ai-icon-btn" title="上传图片" onClick={() => fileRef.current && fileRef.current.click()}>
          <IconImage size={18} />
        </button>
        <button className="ai-icon-btn" title="语音输入（即将上线）" onClick={() => setNotice('语音输入即将上线，先用文字聊聊吧')}>
          <IconMic size={18} />
        </button>
        <button
          onClick={send}
          disabled={busy}
          title="发送"
          style={{
            width: 30, height: 30, minWidth: 30, borderRadius: 15, border: 'none',
            background: busy ? 'rgba(123,79,44,0.25)' : '#7B4F2C',
            cursor: busy ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, marginRight: 2,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 13V3M4 7l4-4 4 4" stroke="#FFFCF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
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

/* 年度清单：与月历「年度目标系列」共享同一份数据 */
function GoalsCard({ goals }) {
  const list = goals || []
  const completed = list.filter(g => g.done || (g.items || []).filter(i => i.done).length >= (g.target || 1)).length
  const pct = list.length > 0 ? Math.round((completed / list.length) * 100) : 0

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">年度清单</h3>
        <span className="card-badge">{completed}/{list.length}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {list.length === 0 && (
          <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', textAlign: 'center', padding: '8px 0' }}>
            去月历添加年度目标吧 🌱
          </p>
        )}
        {list.map(g => {
          const done = (g.items || []).filter(i => i.done).length
          const complete = g.done || done >= (g.target || 1)
          const gpct = g.target > 1 ? Math.min(100, Math.round((done / g.target) * 100)) : (complete ? 100 : 0)
          return (
            <div key={g.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  flex: 1, fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
                  color: complete ? '#9C856B' : '#2D1F14',
                  textDecoration: complete ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{g.title}</span>
                {complete ? (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#52784B',
                    background: 'rgba(168,196,154,0.25)', padding: '2px 8px', borderRadius: 8,
                    flexShrink: 0,
                  }}>✓ 已完成</span>
                ) : g.target > 1 ? (
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-number)', color: '#9C856B', flexShrink: 0,
                  }}>{done}/{g.target}</span>
                ) : null}
              </div>
              <div style={{ height: 4, background: '#F5EDE3', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: gpct + '%', borderRadius: 2,
                  background: complete ? '#A8C49A' : '#D4A03E',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TodayScreen({ todayKey, moodHistory, onMoodChange, calendarTodos, onCalendarTodosChange, goals, aiData }) {
  const weekdays = ['日','一','二','三','四','五','六']
  const d = new Date()

  return (
    <>
      <div className="page-header">
        <h2>今天</h2>
        <p className="subtitle">{d.getMonth()+1}月{d.getDate()}日 星期{weekdays[d.getDay()]}</p>
      </div>
      <MoodSelector todayKey={todayKey} moodHistory={moodHistory} onMoodChange={onMoodChange} />
      <AIChat aiData={aiData} />
      <TodoCard todayKey={todayKey} calendarTodos={calendarTodos} onCalendarTodosChange={onCalendarTodosChange} />
      <GoalsCard goals={goals} />
    </>
  )
}
