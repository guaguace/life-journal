import React from 'react'
import { IconPlus, IconExercise, IconPeriod, IconDiet } from '../Icons'
import SleepCard from '../components/SleepCard'

const STATUS_COLORS = { '多': '#D4A03E', '中': '#A8C49A', '少': '#8FB3D9' }

export function BodyScreen({ onOpenModal, exerciseRecords, periodRecords, dietRecords, sleepRecords, onSleepRecord, todayKey }) {
  const totalDuration = exerciseRecords.reduce((s, r) => s + r.duration, 0)
  const totalCalories = exerciseRecords.reduce((s, r) => s + r.calories, 0)
  const weekCount = exerciseRecords.length
  const totalDietCal = dietRecords.reduce((s, r) => s + r.cal, 0)

  return (
    <>
      <div className="page-header">
        <h2>身体记</h2>
        <p className="subtitle">睡眠 · 运动 · 月事 · 食光</p>
      </div>

      {/* ── 睡眠打卡 ── */}
      <SleepCard dateKey={todayKey} records={sleepRecords || {}} onRecord={onSleepRecord || (() => {})} />

      {/* ── 运动概览 ── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconExercise size={26} />
            <h3 className="card-title" style={{ marginBottom: 0 }}>运动概览</h3>
          </div>
          <button className="record-btn" onClick={() => onOpenModal('exercise')}>
            <IconPlus color="#7B4F2C" size={13} /> 记录
          </button>
        </div>

        {/* 3 项本周统计 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          marginBottom: 14, padding: '12px 4px',
          borderBottom: '1px solid rgba(123, 79, 44, 0.06)',
        }}>
          {[
            { value: `${weekCount}`, label: '本周运动', unit: '次' },
            { value: `${totalDuration}`, label: '总时长', unit: '分' },
            { value: totalCalories.toLocaleString(), label: '消耗', unit: '千卡' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 19, fontFamily: 'var(--font-number)', fontWeight: 600, color: '#7B4F2C' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* 运动内容列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {exerciseRecords.length === 0 && (
            <p style={{ color: '#9C856B', fontSize: 'var(--fs-caption)', textAlign: 'center', padding: 14 }}>
              本周还没有运动记录，点「记录」添加
            </p>
          )}
          {exerciseRecords.slice(-4).reverse().map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 6px', borderBottom: '1px solid rgba(123, 79, 44, 0.05)',
            }}>
              <span style={{ fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14', fontWeight: 500 }}>
                {r.type}
              </span>
              <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#9C856B' }}>
                {r.duration} 分钟 · {r.calories} 千卡
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 月事记录 ── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconPeriod size={26} />
            <h3 className="card-title" style={{ marginBottom: 0 }}>月事记录</h3>
          </div>
          <button className="record-btn" onClick={() => onOpenModal('period')}>
            <IconPlus color="#7B4F2C" size={13} /> 记录
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 10, background: 'rgba(212, 160, 62, 0.06)', borderRadius: 12, marginBottom: 12,
        }}>
          <span className="chip chip-filled" style={{ fontSize: 11 }}>当前 第12期</span>
          <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644' }}>
            身体易疲惫 · 心情略低落敏感
          </span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#6B5644' }}>本月周期</span>
            <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#7B4F2C', fontWeight: 600 }}>28 天</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-bar-fill" style={{ width: '50%' }} />
          </div>
        </div>

        {periodRecords.slice(-3).reverse().map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 22, height: 22, borderRadius: 6,
              background: STATUS_COLORS[r.status] || '#D4A03E',
              color: '#FFFCF8', fontSize: 10, fontWeight: 600, padding: '0 6px',
            }}>{r.status}</span>
            <span style={{ fontSize: 'var(--fs-caption)', color: '#6B5644' }}>{r.text}</span>
          </div>
        ))}
      </div>

      {/* ── 今日食光 ── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconDiet size={26} />
            <h3 className="card-title" style={{ marginBottom: 0 }}>今日食光</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)', color: '#D4A03E', fontWeight: 500 }}>
              约 {totalDietCal.toLocaleString()} 千卡
            </span>
            <button className="record-btn" onClick={() => onOpenModal('diet')}>
              <IconPlus color="#7B4F2C" size={13} /> 记录
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dietRecords.length === 0 && (
            <p style={{ color: '#9C856B', fontSize: 'var(--fs-caption)', textAlign: 'center', padding: 14 }}>
              今天还没有记录，点「记录」添加一餐
            </p>
          )}
          {dietRecords.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: 'rgba(123, 79, 44, 0.03)', borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{
                  fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)',
                  color: '#7B4F2C', fontWeight: 600, minWidth: 32, flexShrink: 0,
                }}>{item.meal}</span>
                <span style={{
                  fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)', color: '#2D1F14',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{item.content}</span>
              </div>
              <span style={{
                fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-number)',
                color: '#9C856B', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 8,
              }}>{item.cal} kcal</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
