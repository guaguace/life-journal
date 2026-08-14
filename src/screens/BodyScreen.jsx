import React, { useState } from 'react'
import { IconPlus, IconExercise, IconPeriod, IconDiet } from '../Icons'

const FILTERS = [
  { key: 'exercise', label: '运动记' },
  { key: 'period', label: '月事' },
  { key: 'diet', label: '食光' },
]

export function BodyScreen({ onOpenModal, exerciseRecords, periodRecords, dietRecords }) {
  const [activeFilter, setActiveFilter] = useState('exercise')

  const totalDuration = exerciseRecords.reduce((s, r) => s + r.duration, 0)
  const totalCalories = exerciseRecords.reduce((s, r) => s + r.calories, 0)
  const weekCount = exerciseRecords.length

  const totalDietCal = dietRecords.reduce((s, r) => s + r.cal, 0)

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>身体记</h2>
            <p className="subtitle">关注身体，感受自己</p>
          </div>
          <span className="chip chip-soft" style={{ fontSize: 11 }}>本周</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            className={`chip ${activeFilter === f.key ? 'chip-filled' : 'chip-soft'}`}
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >{f.label}</button>
        ))}
      </div>

      <div className="card-grid-2" style={{ marginBottom: 0 }}>

        {/* ===== 运动概览卡 ===== */}
        {(activeFilter === 'exercise') && (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconExercise size={26} />
                <h3 className="card-title" style={{ marginBottom: 0 }}>运动概览</h3>
              </div>
              <button onClick={() => onOpenModal('exercise')} style={{
                display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)',
                color: '#7B4F2C', fontWeight: 500, padding: 4, borderRadius: 8,
              }}><IconPlus color="#7B4F2C" size={14} />记录</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14, padding: '12px 0', borderBottom: '1px solid rgba(123, 79, 44, 0.06)' }}>
              {[
                { value: `${weekCount}`, label: '本周运动', unit: '次' },
                { value: `${totalDuration}`, label: '总时长', unit: '分' },
                { value: totalCalories.toLocaleString(), label: '消耗', unit: '千卡' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-number)', fontWeight: 600, color: '#7B4F2C' }}>{stat.value}</div>
                  <div style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exerciseRecords.length === 0 && <p style={{ color: '#9C856B', fontSize: 'var(--fs-caption)', textAlign: 'center', padding: 12 }}>暂无记录，点击"+ 记录"添加</p>}
              {exerciseRecords.slice(0, 4).map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <div>
                    <div style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14', fontWeight: 500 }}>{r.type}</div>
                    <div style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 2 }}>{r.duration}分钟 · {r.calories}千卡</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== 月事记录卡 ===== */}
        {(activeFilter === 'period') && (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconPeriod size={26} />
                <h3 className="card-title" style={{ marginBottom: 0 }}>月事记录</h3>
              </div>
              <button onClick={() => onOpenModal('period')} style={{
                display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)',
                color: '#7B4F2C', fontWeight: 500, padding: 4, borderRadius: 8,
              }}><IconPlus color="#7B4F2C" size={14} />记录</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(212, 160, 62, 0.06)', borderRadius: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="chip chip-filled" style={{ fontSize: 11 }}>当前 第12期</span>
              </div>
              <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644', lineHeight: 1.5, margin: 0 }}>身体易疲惫 · 心情略低落敏感</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644' }}>本月周期</span>
                <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#7B4F2C', fontWeight: 600 }}>28 天</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}><div className="progress-bar-fill" style={{ width: '50%' }} /></div>
            </div>
            {periodRecords.length === 0 && <p style={{ color: '#9C856B', fontSize: 'var(--fs-caption)', textAlign: 'center' }}>暂无记录</p>}
            {periodRecords.slice(0, 3).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 6, background: { '多': '#D4A03E', '中': '#A8C49A', '少': '#8FB3D9' }[r.status] || '#D4A03E', color: '#FFFCF8', fontSize: 10, fontWeight: 600 }}>{r.status}</span>
                <span style={{ fontSize: 'var(--fs-caption)', color: '#6B5644' }}>{r.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ===== 今日食光卡 ===== */}
        {(activeFilter === 'diet') && (
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconDiet size={26} />
                <h3 className="card-title" style={{ marginBottom: 0 }}>今日食光</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#D4A03E', fontWeight: 500 }}>约 {totalDietCal.toLocaleString()} 千卡</span>
                <button onClick={() => onOpenModal('diet')} style={{
                  display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)',
                  color: '#7B4F2C', fontWeight: 500, padding: 4, borderRadius: 8,
                }}><IconPlus color="#7B4F2C" size={14} />记录</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dietRecords.length === 0 && <p style={{ color: '#9C856B', fontSize: 'var(--fs-caption)', textAlign: 'center', padding: 12 }}>暂无记录，点击"+ 记录"添加</p>}
              {dietRecords.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(123, 79, 44, 0.03)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)', color: '#7B4F2C', fontWeight: 600, minWidth: 32 }}>{item.meal}</span>
                    <span style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14' }}>{item.content}</span>
                  </div>
                  <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#9C856B', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.cal} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 右侧补充卡 */}
        {activeFilter === 'exercise' && (
          <div className="card">
            <div className="card-header"><h3 className="card-title" style={{ marginBottom: 0 }}>本周目标</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { goal: '运动次数', current: weekCount, target: 5, unit: '次' },
                { goal: '运动时长', current: totalDuration, target: 400, unit: '分钟' },
                { goal: '卡路里消耗', current: totalCalories, target: 2500, unit: '千卡' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--fs-label)', color: '#6B5644', fontFamily: 'var(--font-body)' }}>{item.goal}</span>
                    <span style={{ fontSize: 'var(--fs-caption)', color: '#9C856B', fontFamily: 'var(--font-number)' }}>{item.current.toLocaleString()} / {item.target.toLocaleString()} {item.unit}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}><div className="progress-bar-fill" style={{ width: `${Math.min(100, (item.current / item.target) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeFilter === 'period' && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">经期小贴士</h3></div>
            {['多喝温水，保持温暖', '适量补充铁质食物', '避免生冷辛辣食物', '保证充足睡眠'].map((tip, i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'rgba(123, 79, 44, 0.03)', borderRadius: 12, fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#6B5644', display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                <span style={{ color: '#D4A03E', fontWeight: 600 }}>0{i+1}</span>{tip}
              </div>
            ))}
          </div>
        )}
        {activeFilter === 'diet' && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">营养分布</h3></div>
            {[
              { label: '蛋白质', pct: Math.min(100, Math.round(totalDietCal * 0.35 / 2000 * 100)), color: '#A8C49A' },
              { label: '碳水', pct: Math.min(100, Math.round(totalDietCal * 0.45 / 2000 * 100)), color: '#D4A03E' },
              { label: '脂肪', pct: Math.min(100, Math.round(totalDietCal * 0.2 / 2000 * 100)), color: '#D4A88E' },
            ].map((macro, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 'var(--fs-label)', color: '#6B5644', fontFamily: 'var(--font-body)' }}>{macro.label}</span>
                  <span style={{ fontSize: 'var(--fs-caption)', color: '#9C856B', fontFamily: 'var(--font-number)' }}>{macro.pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 6, background: 'rgba(123, 79, 44, 0.06)' }}><div style={{ height: '100%', width: `${macro.pct}%`, background: macro.color, borderRadius: 3 }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
