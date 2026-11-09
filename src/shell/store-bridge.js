// 与旧 Store / App / Fusion 的桥：Vue 壳所有读写都走这里，不复制状态。
export const bridge = {
  get pages() { return window.PAGES || {} },
  get store() { return window.Store },
  get app() { return window.App },
  get fusion() { return window.Fusion },
  get console() { return window.__CONSOLE },
  get dirtyCount() { try { return window.Store.dirtyCount || 0 } catch (e) { return 0 } },
  get role() { try { return window.Store.role } catch (e) { return { name: '', perms: '' } } },
  // 全局搜索数据源：复刻旧壳 cmdOpen 的 items 构造
  searchItems() {
    const db = window.Store.db, items = []
    try {
      Object.entries(window.PAGES).forEach(([r, p]) => {
        if (p.hideNav) return
        items.push({ route: r, title: p.title || r, sub: p.sub || '', kind: '页面' })
      })
      ;(db.employee.services || []).slice(0, 40).forEach((s) => items.push({ route: 'e-services', title: s.name, sub: '服务 · ' + s.cat + ' · ' + s.status, kind: '服务' }))
      ;(db.versionall.students || []).forEach((s) => items.push({ route: 'v-students', title: s.name, sub: '学员 · ' + (s.status === 'active' ? '在营' : s.status), kind: '学员' }))
      ;(db.employee.bookings || []).slice(0, 20).forEach((b) => items.push({ route: 'e-bookings', title: b.service + ' · ' + b.person, sub: '预约 · ' + b.date + ' · ' + b.status, kind: '预约' }))
      ;(db.versionall.camps || []).forEach((c) => items.push({ route: 'v-camps', title: c.name, sub: '营期 · ' + c.status, kind: '营期' }))
      items.push({ route: 'workbench', title: '发布所有待发布变更', sub: '操作', kind: '操作' })
    } catch (e) { /* 数据未就绪时给出空列表 */ }
    return items
  }
}
