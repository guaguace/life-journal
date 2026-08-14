import React, { useRef, useState } from 'react'

/* 统计当前设备上的数据量 */
function countData() {
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('lifejournal_')) {
      try { count += Object.keys(JSON.parse(localStorage.getItem(k))).length } catch (e) {}
    }
  }
  return count
}

/* 导出全部数据为 JSON 文件 */
function exportData() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('lifejournal_')) {
      try { data[k] = JSON.parse(localStorage.getItem(k)) } catch (e) {}
    }
  }
  const d = new Date()
  const filename = `生活手账备份-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return filename
}

export function SettingsScreen() {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        let restored = 0
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('lifejournal_')) {
            localStorage.setItem(k, JSON.stringify(v))
            restored++
          }
        }
        if (restored === 0) {
          setMsg('文件里没有找到手账数据，请确认选择了正确的备份文件')
        } else {
          setMsg(`✅ 已恢复 ${restored} 组数据，页面即将刷新...`)
          setTimeout(() => { location.reload() }, 1200)
        }
      } catch (err) {
        setMsg('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = () => {
    if (confirm('确定要清除本设备上的全部手账数据吗？此操作不可恢复，建议先导出备份。')) {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('lifejournal_')) keys.push(k)
      }
      keys.forEach(k => localStorage.removeItem(k))
      location.reload()
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>我的</h2>
        <p className="subtitle">数据备份与设置</p>
      </div>

      {/* 数据备份 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">数据备份</h3>
        </div>
        <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', lineHeight: 1.7, marginBottom: 14 }}>
          本设备已保存 <b style={{ color: '#7B4F2C' }}>{countData()}</b> 条记录（心情、待办、睡眠、运动等）。
          数据保存在浏览器本地——换设备或清缓存前，请先导出备份。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { const f = exportData(); setMsg('✅ 已导出 ' + f + '，文件在浏览器下载目录') }} style={{
            width: '100%', height: 42, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: '#7B4F2C', color: '#FFFCF8', fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-label)', fontWeight: 600,
          }}>
            导出全部数据
          </button>
          <button onClick={() => fileRef.current && fileRef.current.click()} style={{
            width: '100%', height: 42, borderRadius: 13, cursor: 'pointer',
            border: '1.5px solid rgba(123,79,44,0.35)', background: '#FFFCF8',
            color: '#7B4F2C', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-label)', fontWeight: 600,
          }}>
            导入备份文件
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
        {msg && <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: msg.startsWith('✅') ? '#52784B' : '#C24040', marginTop: 10 }}>{msg}</p>}
      </div>

      {/* 使用说明 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">数据说明</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['📤', '导出', '生成一个 JSON 备份文件，可存到微信收藏、网盘、邮箱。'],
            ['📥', '导入', '换设备或清缓存后，上传备份文件即可全部恢复。'],
            ['💾', '保存位置', '数据存在浏览器本地，只有你自己能访问。'],
            ['🔄', '更新版本', 'App 更新不会影响已保存的数据。'],
          ].map(([ico, title, desc]) => (
            <div key={title} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 12px', background: 'rgba(123,79,44,0.03)', borderRadius: 12,
            }}>
              <span style={{ fontSize: 16 }}>{ico}</span>
              <div>
                <div style={{ fontSize: 'var(--fs-label)', fontFamily: 'var(--font-body)', fontWeight: 600, color: '#2D1F14' }}>{title}</div>
                <div style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 2, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 危险操作 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">危险操作</h3>
        </div>
        <button onClick={handleClear} style={{
          width: '100%', height: 42, borderRadius: 13, cursor: 'pointer',
          border: '1.5px solid rgba(224,86,86,0.4)', background: 'rgba(224,86,86,0.06)',
          color: '#C24040', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-label)', fontWeight: 600,
        }}>
          清除本机全部数据
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginTop: 8 }}>
        生活手账 v1.1 · 温暖手账 · 记录每一天
      </p>
    </>
  )
}
