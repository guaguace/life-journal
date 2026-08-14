import React, { useState } from 'react'
import { IconMoon, IconMoonSmall, IconSun } from '../Icons'

const SLEEP_TIMES = ['21:30','22:00','22:30','23:00','23:30','00:00','00:30','01:00','01:30']
const WAKE_TIMES  = ['05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30']
const GOAL_HOURS = 8

function fmtDur(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h + '小时' + (m ? m + '分' : '')
}

/* 跨午夜自动处理：23:30 睡 → 07:00 起 = 7小时30分 */
function durMinutes(s, w) {
  const [sh, sm] = s.split(':').map(Number)
  const [wh, wm] = w.split(':').map(Number)
  let mins = (wh * 60 + wm) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60
  return mins
}

function qualityOf(h) {
  if (h >= GOAL_HOURS) return { t: '充足', bg: 'rgba(168,196,154,0.28)', color: '#52784B' }
  if (h >= 6.5) return { t: '正常', bg: 'rgba(212,160,62,0.20)', color: '#B8763A' }
  return { t: '偏短', bg: 'rgba(224,86,86,0.14)', color: '#C24040' }
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WK = ['日','一','二','三','四','五','六']

/* ===== 睡眠打卡卡：睡觉打卡记前一晚入睡时间，起床打卡记今早醒来时间 ===== */
export default function SleepCard({ dateKey, records, onRecord }) {
  const [picker, setPicker] = useState(null) // 'sleep' | 'wake' | null
  const [manual, setManual] = useState('')

  const rec = records[dateKey] || {}
  const sleepTime = rec.sleepTime || null
  const wakeTime = rec.wakeTime || null

  const save = (kind, t) => {
    onRecord(dateKey, { ...rec, [kind === 'sleep' ? 'sleepTime' : 'wakeTime']: t })
    setPicker(null)
    setManual('')
  }

  /* 近 7 天数据 */
  const weekKeys = []
  const base = keyToDate(dateKey)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    weekKeys.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }
  const weekDurations = weekKeys.map(k => {
    const r = records[k]
    return r && r.sleepTime && r.wakeTime ? durMinutes(r.sleepTime, r.wakeTime) : null
  })
  const valid = weekDurations.filter(d => d !== null)
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length / 60 : null

  const mins = sleepTime && wakeTime ? durMinutes(sleepTime, wakeTime) : null
  const quality = mins ? qualityOf(mins / 60) : null
  const goalPct = mins ? Math.min(100, Math.round((mins / 60) / GOAL_HOURS * 100)) : 0

  /* 状态徽标 */
  let status = { text: '昨晚未打卡', cls: 'warn' }
  if (sleepTime && wakeTime) status = { text: '已打卡 ✓', cls: 'ok' }
  else if (sleepTime) status = { text: '还差起床打卡', cls: 'warn' }
  else if (wakeTime) status = { text: '还差睡觉打卡', cls: 'warn' }

  const renderBtn = (kind) => {
    const isSleep = kind === 'sleep'
    const time = isSleep ? sleepTime : wakeTime
    const checked = !!time
    return (
      <button
        onClick={() => setPicker(isSleep ? 'sleep' : 'wake')}
        style={{
          border: checked
            ? `1.5px solid ${isSleep ? 'rgba(110,147,192,0.55)' : 'rgba(212,160,62,0.6)'}`
            : '1.5px dashed rgba(123,79,44,0.28)',
          background: checked
            ? (isSleep ? 'rgba(110,147,192,0.10)' : 'rgba(212,160,62,0.12)')
            : '#FFFCF8',
          borderRadius: 14, padding: '14px 10px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-body)', transition: 'transform 0.15s ease',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9C856B' }}>
          {isSleep ? <IconMoonSmall color="#4A6B9E" size={13} /> : <IconSun color="#B8763A" size={13} />}
          {isSleep ? '昨晚入睡' : '今早醒来'}
        </span>
        <span style={{ fontSize: 'var(--fs-label)', fontWeight: 500, color: '#6B5644' }}>
          {isSleep ? '睡觉打卡' : '起床打卡'}
        </span>
        <span style={{
          fontFamily: 'var(--font-number)', fontSize: 19, fontWeight: 600,
          color: checked ? (isSleep ? '#4A6B9E' : '#B8763A') : '#C4B49B',
        }}>{time || '未打卡'}</span>
      </button>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconMoon size={26} />
          <h3 className="card-title" style={{ marginBottom: 0 }}>睡眠打卡</h3>
        </div>
        <span className="card-badge" style={{
          color: status.cls === 'ok' ? '#52784B' : '#D4A03E',
          fontWeight: status.cls === 'ok' ? 400 : 500,
        }}>{status.text}</span>
      </div>
      <p style={{ fontSize: 10.5, color: '#9C856B', margin: '-6px 0 12px', paddingLeft: 36, lineHeight: 1.5 }}>
        睡觉打卡记的是<b style={{ color: '#6B5644', fontWeight: 600 }}>前一晚</b>入睡时间，早上补记也行
      </p>

      {/* 两个打卡按钮 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {renderBtn('sleep')}
        {renderBtn('wake')}
      </div>

      {/* 时间选择面板 */}
      {picker && (
        <div style={{
          marginTop: 12, background: 'rgba(123,79,44,0.035)',
          border: '1px solid rgba(123,79,44,0.10)', borderRadius: 14, padding: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: '#6B5644' }}>
              {picker === 'sleep' ? '选择昨晚入睡时间' : '选择今早醒来时间'}
            </span>
            <button onClick={() => setPicker(null)} style={{
              border: 'none', background: 'rgba(123,79,44,0.08)', width: 22, height: 22,
              borderRadius: 11, cursor: 'pointer', color: '#9C856B', fontSize: 11,
            }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {(picker === 'sleep' ? SLEEP_TIMES : WAKE_TIMES).map(t => (
              <button key={t} onClick={() => save(picker, t)} style={{
                border: '1px solid rgba(123,79,44,0.18)', background: '#FFFCF8',
                borderRadius: 10, padding: '5px 10px', cursor: 'pointer',
                fontFamily: 'var(--font-number)', fontSize: 12, color: '#6B5644',
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#9C856B' }}>
            或手动输入
            <input type="time" value={manual} onChange={e => setManual(e.target.value)}
              onBlur={e => { if (e.target.value) save(picker, e.target.value) }}
              style={{
                border: '1px solid rgba(123,79,44,0.18)', borderRadius: 10, padding: '4px 8px',
                fontFamily: 'var(--font-number)', fontSize: 12, color: '#2D1F14', background: '#FFFCF8',
              }} />
          </div>
        </div>
      )}

      {/* 时长横幅 */}
      <div style={{
        marginTop: 14, borderRadius: 14, padding: '12px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        background: mins ? 'rgba(123,79,44,0.055)' : 'rgba(212,160,62,0.07)',
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#9C856B' }}>{mins ? '昨晚睡了 ' + fmtDur(mins) : '昨晚睡了多久？'}</div>
          {mins ? (
            <div style={{ fontFamily: 'var(--font-number)', fontSize: 21, fontWeight: 700, color: '#7B4F2C', marginTop: 2 }}>
              {(mins / 60).toFixed(1)} <small style={{ fontSize: 11.5, fontWeight: 500, color: '#9C856B' }}>小时</small>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#B8763A', marginTop: 2 }}>
              {!sleepTime && !wakeTime ? '还差睡觉打卡与起床打卡' : !sleepTime ? '还差「睡觉打卡」——昨晚几点睡的？' : '还差「起床打卡」——今早几点醒的？'}
            </div>
          )}
        </div>
        {quality && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 10,
            background: quality.bg, color: quality.color, whiteSpace: 'nowrap',
          }}>{quality.t}</span>
        )}
      </div>

      {/* 目标进度 */}
      {mins && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#9C856B', marginBottom: 5 }}>
            <span>睡眠目标 {GOAL_HOURS} 小时</span>
            <span style={{ fontFamily: 'var(--font-number)' }}>{goalPct}%</span>
          </div>
          <div style={{ height: 6, background: '#F5EDE3', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: goalPct + '%', borderRadius: 3,
              background: 'linear-gradient(90deg, #6E93C0, #D4A03E)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* 近 7 天 */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <h4 style={{ fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 600, color: '#2D1F14' }}>近 7 天</h4>
          <span style={{ fontSize: 10.5, color: '#9C856B', fontFamily: 'var(--font-number)' }}>
            {avg ? '平均 ' + avg.toFixed(1) + ' 小时' : '平均 —'}
          </span>
        </div>
        <div style={{ position: 'relative', height: 88, display: 'flex', alignItems: 'flex-end', gap: 10, paddingTop: 18 }}>
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, borderTop: '1.5px dashed rgba(212,160,62,0.6)' }}>
            <span style={{ position: 'absolute', right: 0, top: -16, fontSize: 9, color: '#C9A04E' }}>目标 8h</span>
          </div>
          {weekDurations.map((m, i) => {
            const d = keyToDate(weekKeys[i])
            const label = i === 6 ? '今天' : WK[d.getDay()]
            const isLast = i === 6
            return (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 5, height: '100%', justifyContent: 'flex-end',
              }}>
                {m === null ? (
                  <div style={{
                    width: '100%', maxWidth: 22, height: 12, borderRadius: '4px 4px 2px 2px',
                    background: isLast ? 'repeating-linear-gradient(45deg, rgba(110,147,192,0.25) 0 4px, rgba(110,147,192,0.08) 4px 8px)' : 'rgba(123,79,44,0.06)',
                  }} />
                ) : (
                  <div style={{
                    width: '100%', maxWidth: 22, height: Math.max(4, Math.min(100, m / 600 * 100)) + '%',
                    borderRadius: '5px 5px 2px 2px',
                    background: isLast ? '#6E93C0' : (m < 390 ? 'rgba(224,86,86,0.55)' : 'rgba(123,79,44,0.22)'),
                    transition: 'height 0.4s ease',
                    position: 'relative',
                  }}>
                    {isLast && (
                      <span style={{
                        position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
                        fontSize: 9, color: '#7B4F2C', fontWeight: 600, fontFamily: 'var(--font-number)', whiteSpace: 'nowrap',
                      }}>{(m / 60).toFixed(1)}h</span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 9.5, color: isLast ? '#7B4F2C' : '#9C856B', fontWeight: isLast ? 600 : 400 }}>
                  {label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
