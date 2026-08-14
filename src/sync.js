/* ===== 云端同步模块（Supabase REST，免 SDK） =====
 * 表结构（在 Supabase SQL Editor 执行一次）：
 *   create table journals (
 *     id text primary key,
 *     data jsonb not null default '{}',
 *     updated_at timestamptz not null default now()
 *   );
 *   alter table journals enable row level security;
 *   create policy "all" on journals for all using (true) with check (true);
 */

const CFG_KEY = 'lifejournal_sync_cfg'
const LAST_SYNC_KEY = 'lifejournal_sync_last'

export function getSyncConfig() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || null } catch (e) { return null }
}

export function setSyncConfig(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
}

export function isSyncEnabled() {
  const cfg = getSyncConfig()
  return !!(cfg && cfg.url && cfg.key && cfg.code)
}

export function getLastSync() {
  try { return localStorage.getItem(LAST_SYNC_KEY) } catch (e) { return null }
}

/* 收集全部业务数据（排除同步配置本身） */
function collectData() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('lifejournal_') && !k.startsWith('lifejournal_sync')) {
      try { data[k] = JSON.parse(localStorage.getItem(k)) } catch (e) {}
    }
  }
  return data
}

function headers(cfg) {
  return {
    'apikey': cfg.key,
    'Authorization': 'Bearer ' + cfg.key,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  }
}

/* 上传本地数据到云端（整体覆盖，last-write-wins） */
export async function pushToCloud() {
  const cfg = getSyncConfig()
  if (!cfg) return { ok: false, msg: '未配置云端同步' }
  const data = collectData()
  if (Object.keys(data).length === 0) return { ok: true, msg: '本地无数据，跳过上传' }
  try {
    const res = await fetch(`${cfg.url.replace(/\/$/, '')}/rest/v1/journals`, {
      method: 'POST',
      headers: headers(cfg),
      body: JSON.stringify([{ id: cfg.code, data, updated_at: new Date().toISOString() }]),
    })
    if (!res.ok) return { ok: false, msg: '上传失败 HTTP ' + res.status + '，请检查配置' }
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
    return { ok: true, msg: '已上传云端' }
  } catch (e) {
    return { ok: false, msg: '网络错误：' + e.message }
  }
}

/* 从云端拉取数据；若云端更新则应用到本地 */
export async function pullFromCloud() {
  const cfg = getSyncConfig()
  if (!cfg) return { ok: false, msg: '未配置云端同步' }
  try {
    const url = `${cfg.url.replace(/\/$/, '')}/rest/v1/journals?id=eq.${encodeURIComponent(cfg.code)}&select=data,updated_at`
    const res = await fetch(url, { headers: headers(cfg) })
    if (!res.ok) return { ok: false, msg: '下载失败 HTTP ' + res.status + '，请检查配置' }
    const rows = await res.json()
    const row = rows && rows[0]
    if (!row || !row.data || Object.keys(row.data).length === 0) {
      // 云端还没有数据：把本地数据推上去
      return await pushToCloud()
    }
    const last = getLastSync()
    const cloudNewer = !last || new Date(row.updated_at) > new Date(last)
    if (cloudNewer) {
      let changed = false
      for (const [k, v] of Object.entries(row.data)) {
        if (k.startsWith('lifejournal_') && !k.startsWith('lifejournal_sync')) {
          localStorage.setItem(k, JSON.stringify(v))
          changed = true
        }
      }
      localStorage.setItem(LAST_SYNC_KEY, row.updated_at)
      return { ok: true, msg: '已从云端恢复最新数据', applied: changed }
    }
    return { ok: true, msg: '本地已是最新' }
  } catch (e) {
    return { ok: false, msg: '网络错误：' + e.message }
  }
}
