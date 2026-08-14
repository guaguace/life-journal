import React, { useRef, useState } from 'react'
import { getSyncConfig, setSyncConfig, pushToCloud, pullFromCloud } from '../sync'

/* 统计当前设备上的数据量（排除同步配置） */
function countData() {
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('lifejournal_') && !k.startsWith('lifejournal_sync')) {
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
    if (k && k.startsWith('lifejournal_') && !k.startsWith('lifejournal_sync')) {
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
  const [syncMsg, setSyncMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [cfg, setCfg] = useState(() => getSyncConfig() || { url: '', key: '', code: '' })

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        let restored = 0
        for (const [k, v] of Object.entries(data)) {
          if (k.startsWith('lifejournal_') && !k.startsWith('lifejournal_sync')) {
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
        if (k && k.startsWith('lifejournal_') && !k.startsWith('lifejournal_sync')) keys.push(k)
      }
      keys.forEach(k => localStorage.removeItem(k))
      location.reload()
    }
  }

  /* ── 云端同步 ── */
  const handleSaveSync = async () => {
    setBusy(true)
    setSyncMsg('')
    if (!cfg.url.trim() || !cfg.key.trim() || !cfg.code.trim()) {
      setSyncMsg('请填写完整的项目地址、API Key 和同步码')
      setBusy(false)
      return
    }
    setSyncConfig({ url: cfg.url.trim(), key: cfg.key.trim(), code: cfg.code.trim() })
    const r = await pushToCloud()
    setSyncMsg(r.ok ? '✅ 配置已保存并完成首次上传' : '⚠️ ' + r.msg)
    setBusy(false)
  }

  const handlePush = async () => {
    setBusy(true)
    const r = await pushToCloud()
    setSyncMsg(r.ok ? '✅ ' + r.msg : '⚠️ ' + r.msg)
    setBusy(false)
  }

  const handlePull = async () => {
    setBusy(true)
    const r = await pullFromCloud()
    setSyncMsg(r.ok ? (r.applied ? '✅ 云端数据已恢复，即将刷新...' : '✅ ' + r.msg) : '⚠️ ' + r.msg)
    if (r.ok && r.applied) setTimeout(() => { location.reload() }, 1000)
    setBusy(false)
  }

  const inputStyle = {
    width: '100%', border: '1px solid rgba(123,79,44,0.15)', borderRadius: 10,
    padding: '9px 12px', fontSize: 'var(--fs-body)', fontFamily: 'var(--font-body)',
    color: '#2D1F14', outline: 'none', background: '#FFFCF8', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', marginBottom: 4 }

  return (
    <>
      <div className="page-header">
        <h2>我的</h2>
        <p className="subtitle">云端同步 · 数据备份 · 设置</p>
      </div>

      {/* ── 云端同步 ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">☁️ 云端同步</h3>
        </div>
        <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', lineHeight: 1.7, marginBottom: 14 }}>
          配置后数据自动备份到云端：每次修改自动上传，打开 App 自动恢复。多台设备用<b style={{ color: '#7B4F2C' }}>同一个同步码</b>即可共享数据。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={labelStyle}>项目地址（Project URL）</div>
            <input style={inputStyle} placeholder="https://xxxx.supabase.co" value={cfg.url}
              onChange={e => setCfg(c => ({ ...c, url: e.target.value }))} />
          </div>
          <div>
            <div style={labelStyle}>API Key（anon public key）</div>
            <input style={inputStyle} placeholder="eyJhbGciOi..." value={cfg.key}
              onChange={e => setCfg(c => ({ ...c, key: e.target.value }))} />
          </div>
          <div>
            <div style={labelStyle}>同步码（自己随便设一个，所有设备填一样的）</div>
            <input style={inputStyle} placeholder="例如 myjournal2026" value={cfg.code}
              onChange={e => setCfg(c => ({ ...c, code: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button disabled={busy} onClick={handleSaveSync} style={{
            flex: 1, minWidth: 120, height: 40, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: '#7B4F2C', color: '#FFFCF8', fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-label)', fontWeight: 600, opacity: busy ? 0.6 : 1,
          }}>
            {getSyncConfig() ? '保存并上传' : '启用同步'}
          </button>
          {getSyncConfig() && (
            <>
              <button disabled={busy} onClick={handlePush} style={{
                flex: 1, minWidth: 100, height: 40, borderRadius: 13, cursor: 'pointer',
                border: '1.5px solid rgba(123,79,44,0.35)', background: '#FFFCF8',
                color: '#7B4F2C', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-label)', fontWeight: 600,
              }}>立即上传</button>
              <button disabled={busy} onClick={handlePull} style={{
                flex: 1, minWidth: 100, height: 40, borderRadius: 13, cursor: 'pointer',
                border: '1.5px solid rgba(123,79,44,0.35)', background: '#FFFCF8',
                color: '#7B4F2C', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-label)', fontWeight: 600,
              }}>立即下载</button>
            </>
          )}
        </div>
        {syncMsg && <p style={{
          fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', marginTop: 10,
          color: syncMsg.startsWith('✅') ? '#52784B' : '#C24040',
        }}>{syncMsg}</p>}
      </div>

      {/* 数据备份（手动） */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">数据备份</h3>
        </div>
        <p style={{ fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-body)', color: '#9C856B', lineHeight: 1.7, marginBottom: 14 }}>
          本设备已保存 <b style={{ color: '#7B4F2C' }}>{countData()}</b> 条记录。已启用云端同步后无需手动备份；手动导出可作为额外保险。
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
            ['☁️', '云端同步', '修改自动上传，打开自动恢复，多设备共享（需在 Supabase 免费建库）。'],
            ['📤', '手动导出', '生成 JSON 备份文件，可存微信收藏、网盘、邮箱。'],
            ['💾', '保存位置', '数据存浏览器本地 + 云端（若已配置），只有你自己能访问。'],
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
        生活手账 v1.2 · 温暖手账 · 记录每一天
      </p>
    </>
  )
}
