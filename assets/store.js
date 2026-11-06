/* ============================================================================
   Store — 单一数据源 + 未发布变更队列
   任何页面只通过 Store 读写，预览区与发布中心都消费同一份状态。
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'pku-console-v1';
  const deep = (o) => JSON.parse(JSON.stringify(o));

  let db = null;
  let dirty = [];            // [{path, label, app}]
  let history = [];          // undo snapshots
  let listeners = [];

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setPath(obj, path, val) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[keys[keys.length - 1]] = val;
  }

  function appOf(path) {
    if (path.indexOf('versionall') === 0) return 'versionall';
    if (path.indexOf('brand') === 0) return 'pku';
    if (path.indexOf('employee') === 0) return 'employee';
    return 'system';
  }

  const Store = {
    init() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && saved.db && saved.db.meta && saved.db.meta.version) {
            db = saved.db;
            dirty = saved.dirty || [];
            return;
          }
        }
      } catch (e) { /* ignore broken cache */ }
      db = deep(window.SEED);
      dirty = [];
      this.persist();
    },

    get db() { return db; },
    get dirty() { return dirty; },
    get dirtyCount() { return dirty.length; },

    persist() {
      try { localStorage.setItem(KEY, JSON.stringify({ db: db, dirty: dirty })); } catch (e) {}
    },

    subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter((f) => f !== fn); }; },
    emit() { listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); },

    snapshot() {
      history.push(deep({ db: db, dirty: dirty }));
      if (history.length > 24) history.shift();
    },
    undo() {
      if (!history.length) return false;
      const s = history.pop();
      db = s.db; dirty = s.dirty;
      this.persist(); this.emit();
      return true;
    },

    mark(path, label) {
      const app = appOf(path);
      const found = dirty.find((d) => d.path === path);
      if (found) { found.label = label || found.label; found.at = Date.now(); return; }
      dirty.push({ path: path, label: label || path.split('.').slice(-1)[0], app: app, at: Date.now() });
      if (dirty.length > 200) dirty.shift();
    },

    set(path, value, label) {
      setPath(db, path, value);
      this.mark(path, label);
      this.persist();
      this.emit();
      return value;
    },

    /** 列表编辑：整体替换某个数组元素 / 追加 / 删除 */
    saveItem(listPath, item, idKey, label) {
      const list = getPath(db, listPath);
      if (!Array.isArray(list)) return;
      const id = item[idKey || 'id'];
      const idx = list.findIndex((x) => x[idKey || 'id'] === id);
      if (idx >= 0) list[idx] = Object.assign({}, list[idx], item);
      else list.unshift(item);
      this.mark(listPath, label || (idx >= 0 ? '编辑' : '新增'));
      this.persist(); this.emit();
    },
    removeItem(listPath, id, idKey, label) {
      const list = getPath(db, listPath);
      if (!Array.isArray(list)) return;
      const i = list.findIndex((x) => x[idKey || 'id'] === id);
      if (i >= 0) list.splice(i, 1);
      this.mark(listPath, label || '删除');
      this.persist(); this.emit();
    },
    pushItem(listPath, item, label) {
      const list = getPath(db, listPath);
      if (!Array.isArray(list)) return;
      list.unshift(item);
      this.mark(listPath, label || '新增');
      this.persist(); this.emit();
    },

    publish(note) {
      const now = new Date();
      const p = (n) => (n < 10 ? '0' + n : n);
      const at = now.getFullYear() + '-' + p(now.getMonth() + 1) + '-' + p(now.getDate()) + ' ' + p(now.getHours()) + ':' + p(now.getMinutes());
      const groups = {};
      dirty.forEach((d) => { groups[d.app] = groups[d.app] || []; groups[d.app].push(d); });
      Object.keys(groups).forEach((app) => {
        db.publishes.unshift({
          id: 'pv' + Date.now() + app, app: app, title: note || '日常配置更新',
          by: '孙敏', at: at, items: groups[app].length, status: 'online'
        });
      });
      db.meta.publishedAt = at;
      db.meta.version = (parseFloat(db.meta.version) + 0.01).toFixed(2);
      const n = dirty.length;
      dirty = [];
      this.persist(); this.emit();
      return { count: n, at: at };
    },

    discard() { dirty = []; this.persist(); this.emit(); },

    reset() {
      this.snapshot();
      db = deep(window.SEED);
      dirty = [];
      this.persist(); this.emit();
    },

    exportApp(app) {
      if (app === 'versionall') return { version: db.meta.version, camp: 'camp1', rules: db.versionall };
      if (app === 'pku') return { version: db.meta.version, brand: db.brand };
      return { version: db.meta.version, health: db.employee };
    },

    get dirtyByApp() {
      const m = {};
      dirty.forEach((d) => { m[d.app] = (m[d.app] || 0) + 1; });
      return m;
    }
  };

  window.Store = Store;
})();
