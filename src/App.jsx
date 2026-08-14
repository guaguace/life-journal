import React, { useState, useCallback, useEffect } from 'react'

/* localStorage 持久化 Hook */
function useStoredState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem('lifejournal_' + key)
      if (stored !== null) return JSON.parse(stored)
    } catch (e) { /* ignore */ }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try { localStorage.setItem('lifejournal_' + key, JSON.stringify(state)) }
    catch (e) { /* quota exceeded */ }
  }, [key, state])

  return [state, setState]
}
import { tabIcons } from './Icons'
import { TodayScreen } from './screens/TodayScreen'
import { MoodScreen } from './screens/MoodScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { BodyScreen } from './screens/BodyScreen'
import { InspirationScreen } from './screens/InspirationScreen'
import DateTodoModal from './modals/DateTodoModal'
import ExerciseRecordModal from './modals/ExerciseRecordModal'
import PeriodRecordModal from './modals/PeriodRecordModal'
import DietRecordModal from './modals/DietRecordModal'
import './App.css'

const TABS = [
  { key: 'today', label: '今天', icon: 'today' },
  { key: 'mood', label: '心绪', icon: 'mood' },
  { key: 'calendar', label: '月历', icon: 'calendar' },
  { key: 'body', label: '身体', icon: 'body' },
  { key: 'inspiration', label: '灵感', icon: 'inspiration' },
]

const SCREENS = {
  today: TodayScreen,
  mood: MoodScreen,
  calendar: CalendarScreen,
  body: BodyScreen,
  inspiration: InspirationScreen,
}

function genCalendarTodos() {
  const t = {}
  t['2026-07-05'] = [
    { id: 1, text: '月底项目汇报准备', done: true, color: '#D4A03E' },
    { id: 2, text: '阅读笔记整理', done: true, color: '#A8C49A' },
  ]
  t['2026-07-12'] = [{ id: 3, text: '更新健身计划', done: false, color: '#8FB3D9' }]
  t['2026-07-19'] = [{ id: 4, text: '整理书架', done: true, color: '#D4A03E' }]
  t['2026-07-25'] = [
    { id: 5, text: '预约网球场地', done: false, color: '#A8C49A' },
    { id: 6, text: '有氧训练 30min', done: false, color: '#8FB3D9' },
  ]
  return t
}

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [activeModal, setActiveModal] = useState(null)
  const [modalDate, setModalDate] = useState(null)
  const [moodHistory, setMoodHistory] = useStoredState('moodHistory', {})
  const [calendarTodos, setCalendarTodos] = useStoredState('calendarTodos', genCalendarTodos)
  const [inspirations, setInspirations] = useStoredState('inspirations', [
    { id: 1, title: '周末徒步路线规划', desc: '从香山到植物园，全程约 8 公里。', tag: '户外', color: '#A8C49A', date: '7月28日' },
    { id: 2, title: '想学的手冲咖啡技巧', desc: '三段式注水法：闷蒸 30 秒 → 第二段注水 → 第三段注水。', tag: '生活', color: '#D4A03E', date: '7月26日' },
  ])
  const [musings, setMusings] = useStoredState('musings', [
    { id: 1, text: '今天路过街角的面包店，闻到了小时候姥姥家厨房的味道。', date: '7月30日', time: '09:15' },
    { id: 2, text: '有时候放下计划，随性地走走，反而能发现生活中真正重要的东西。', date: '7月29日', time: '18:42' },
  ])
  const [exerciseRecords, setExerciseRecords] = useStoredState('exerciseRecords', [
    { id: 1, type: '跑步', duration: 30, calories: 280 },
    { id: 2, type: '瑜伽', duration: 45, calories: 180 },
  ])
  const [periodRecords, setPeriodRecords] = useStoredState('periodRecords', [
    { id: 1, text: '7月18日 经期开始', status: '中' },
    { id: 2, text: '7月19日 量多，有腹痛', status: '多' },
  ])
  const [dietRecords, setDietRecords] = useStoredState('dietRecords', [
    { id: 1, meal: '早餐', content: '燕麦粥 + 水煮蛋 + 香蕉', cal: 420 },
    { id: 2, meal: '午餐', content: '鸡胸肉沙拉 + 全麦面包', cal: 580 },
    { id: 3, meal: '晚餐', content: '清蒸鱼 + 西兰花 + 糙米饭', cal: 680 },
  ])
  // 睡眠记录：key 为日期（起床当天），值为 { sleepTime: 前一晚入睡, wakeTime: 当天早上醒来 }
  const [sleepRecords, setSleepRecords] = useStoredState('sleepRecords', {})

  const td = new Date()
  const todayKey = `${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,'0')}-${String(td.getDate()).padStart(2,'0')}`

  const openDateModal = useCallback((dateKey) => { setModalDate(dateKey); setActiveModal('dateTodo') }, [])
  const handleMoodChange = useCallback((dateKey, mood) => { setMoodHistory(p => ({ ...p, [dateKey]: mood })) }, [])
  const handleCalendarTodosChange = useCallback((dateKey, todos) => {
    setCalendarTodos(p => { const n = { ...p }; if (todos.length === 0) delete n[dateKey]; else n[dateKey] = todos; return n })
  }, [])
  const handleSleepRecord = useCallback((dateKey, record) => {
    setSleepRecords(p => ({ ...p, [dateKey]: record }))
  }, [])
  const getDateTodos = (dateKey) => calendarTodos[dateKey] || []

  const ActiveScreen = SCREENS[activeTab]

  const screenProps = {
    onOpenModal: (type) => { setModalDate(null); setActiveModal(type) },
    todayKey, moodHistory, onMoodChange: handleMoodChange,
    calendarTodos, onCalendarTodosChange: handleCalendarTodosChange, openDateModal,
    inspirations, setInspirations, musings, setMusings,
    exerciseRecords, setExerciseRecords, periodRecords, setPeriodRecords, dietRecords, setDietRecords,
    sleepRecords, onSleepRecord: handleSleepRecord,
  }

  // 移动端检测
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 使用内联样式确保布局正常渲染（已定位 CSS class 在特定情况下有问题）
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif', color: '#2D1F14', background: '#F5EDE3' }}>
      {/* 侧边栏 - 仅桌面端 */}
      {!isMobile && (
        <aside style={{ width: 200, minWidth: 200, background: '#FFFCF8', borderRight: '1px solid rgba(123,79,44,0.08)', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 24px rgba(31,20,10,0.04)' }}>
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(123,79,44,0.06)' }}>
            <h1 style={{ fontFamily: '"Noto Serif SC", "STSong", serif', fontSize: 22, fontWeight: 600, color: '#7B4F2C', margin: 0 }}>生活手账</h1>
            <span style={{ fontSize: 11, color: '#9C856B' }}>Life Journal</span>
          </div>
          <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map((tab) => {
              const Icon = tabIcons[tab.icon]
              const isActive = activeTab === tab.key
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 14, cursor: 'pointer', border: 'none',
                  background: isActive ? 'rgba(123,79,44,0.1)' : 'transparent',
                  color: isActive ? '#7B4F2C' : '#9C856B',
                  fontWeight: isActive ? 600 : 500, fontSize: 14, fontFamily: 'inherit',
                  textAlign: 'left', width: '100%',
                }}>
                  <Icon size={22} color={isActive ? '#7B4F2C' : '#9C856B'} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(123,79,44,0.06)', textAlign: 'center', fontSize: 11, color: '#9C856B' }}>
            温暖手账 · 记录每一天
          </div>
        </aside>
      )}

      {/* 主内容区 - 手机端全宽适配 */}
      <main style={{
        flex: 1, overflow: 'auto',
        padding: isMobile ? '20px 16px 100px' : '32px 40px',
        background: '#F5EDE3',
      }}>
        <div style={{ maxWidth: isMobile ? '100%' : 960, margin: '0 auto' }}>
          <div key={activeTab} className="screen-enter">
            <ActiveScreen {...screenProps} />
          </div>
        </div>
      </main>

      {/* 底部胶囊 TabBar - 仅手机端 */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 16px 20px', pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            height: 66, background: '#FFFCF8', borderRadius: 33,
            boxShadow: '0 2px 12px rgba(31,20,10,0.07)', pointerEvents: 'auto',
          }}>
            {TABS.map((tab) => {
              const Icon = tabIcons[tab.icon]
              const isActive = activeTab === tab.key
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '8px 10px', border: 'none', background: 'transparent',
                  cursor: 'pointer', minWidth: 48, fontFamily: 'inherit',
                }}>
                  <Icon size={22} color={isActive ? '#7B4F2C' : '#9C856B'} />
                  <span style={{
                    fontSize: 11, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#7B4F2C' : '#9C856B',
                  }}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {/* 弹层 */}
      <DateTodoModal
        isOpen={activeModal === 'dateTodo'} onClose={() => setActiveModal(null)}
        dateKey={modalDate || todayKey}
        initialTodos={getDateTodos(modalDate || todayKey)}
        onSave={(todos) => handleCalendarTodosChange(modalDate || todayKey, todos)}
      />
      <ExerciseRecordModal
        isOpen={activeModal === 'exercise'} onClose={() => setActiveModal(null)}
        records={exerciseRecords} onRecordsChange={setExerciseRecords}
      />
      <PeriodRecordModal
        isOpen={activeModal === 'period'} onClose={() => setActiveModal(null)}
        records={periodRecords} onRecordsChange={setPeriodRecords}
      />
      <DietRecordModal
        isOpen={activeModal === 'diet'} onClose={() => setActiveModal(null)}
        records={dietRecords} onRecordsChange={setDietRecords}
      />
    </div>
  )
}
