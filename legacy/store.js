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
    if (path.indexOf('channelPages.') === 0) {
      if (/^channelPages\.brand/.test(path)) return 'pku';
      if (/^channelPages\.employee/.test(path)) return 'employee';
      if (/^channelPages\.camp/.test(path)) return 'versionall';
    }
    if (path.indexOf('versionall') === 0) return 'versionall';
    if (path.indexOf('brand') === 0) return 'pku';
    if (path.indexOf('employee') === 0) return 'employee';
    return 'system';
  }

  /** 首次进入演示：留下 4 项未发布变更，便于体验影响分析与发布闸门 */
  function demoDirty() {
    const now = Date.now();
    return [
      { path: 'versionall.tiers.2.stock', label: '奖励库存 · 体脂秤', app: 'versionall', at: now - 1000 * 60 * 42 },
      { path: 'employee.services.0.pricing.0.list', label: '职工年度体检 · 标准版挂牌价', app: 'employee', at: now - 1000 * 60 * 96 },
      { path: 'brand.institutions.0.name', label: '机构名称 · 北大国际医院', app: 'pku', at: now - 1000 * 60 * 150 },
      { path: 'channelPages.camp.report', label: '减重营 · 报告页上线', app: 'versionall', at: now - 1000 * 60 * 180 }
    ];
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
            this.migrate();
            return;
          }
        }
      } catch (e) { /* ignore broken cache */ }
      db = deep(window.SEED);
      dirty = demoDirty();
      this.persist();
    },

    /** 旧版本缓存补齐新增结构，避免升级后按钮报错 */
    migrate() {
      const S = window.SEED;
      // 1) 顶层缺失的整块数据（channels/bundles/fivegood/settle/price…）
      Object.keys(S).forEach((k) => {
        if (db[k] === undefined) { db[k] = deep(S[k]); }
      });
      // 2) 集合型数据按 id 补齐新字段（v4 给服务加了 pricing/rules/assets/channels）
      const mergeList = (target, src, keys) => {
        if (!Array.isArray(target) || !Array.isArray(src)) return;
        target.forEach((item) => {
          const def = src.find((x) => x && x.id === item.id);
          if (!def) return;
          keys.forEach((k) => { if (item[k] === undefined) item[k] = deep(def[k]); });
        });
      };
      if (db.employee && db.employee.services) mergeList(db.employee.services, S.employee.services, ['code', 'cat', 'owner', 'channels', 'pricing', 'rules', 'assets', 'updatedAt', 'status', 'margin']);
      if (db.brand && db.brand.institutions) mergeList(db.brand.institutions, S.brand.institutions, ['platforms', 'bookable', 'campSite']);
      if (db.versionall && db.versionall.tiers) mergeList(db.versionall.tiers, S.versionall.tiers, ['delivery', 'active', 'sort']);
      this.__extraMigrate();
      this.persist();
    },

    __extraMigrate() {
      const S = window.SEED;
      let changed = false;
      const fill = (obj, src, key) => {
        if (obj[key] == null) { obj[key] = deep(src[key]); changed = true; }
      };
      fill(db, S, 'shared');
      fill(db, S, 'rbac');
      if (db.meta && S.meta.settings) fill(db.meta, S.meta, 'settings');
      fill(db, S, 'publishes');
      if (!db.channelPages) {
        db.channelPages = {
          brand: { home: 1, hospitals: 1, departments: 1, team: 1, camp: 1, about: 1 },
          employee: { home: 1, services: 1, booking: 1, mine: 1, qa: 1, articles: 1 },
          camp: { dashboard: 1, checkin: 1, diet: 1, exercise: 1, mall: 1, reward: 1, ranking: 1, report: 1 }
        };
        changed = true;
      }
      if (!db.snapshots) { db.snapshots = []; changed = true; }
      if (db.snapshots && !db.snapshots.length && db.publishes && db.publishes.length) {
        db.publishes.slice(0, 3).forEach((p) => {
          const s = deep(db);
          s.snapshots = [];
          db.snapshots.push({ id: p.id, at: p.at, db: s });
        });
        changed = true;
      }
      if (db.versionall) {
        if (db.versionall.rankingOn == null) { db.versionall.rankingOn = true; changed = true; }
        if (!db.versionall.questionnaire) { db.versionall.questionnaire = deep(S.versionall.questionnaire); changed = true; }
        if (!db.versionall.questionnaire.questions || !db.versionall.questionnaire.questions.length) {
          db.versionall.questionnaire.questions = deep(S.versionall.questionnaire.questions || []);
        }
      }
      if (db.employee && db.employee.site) {
        if (db.employee.site.autoPlay == null) { db.employee.site.autoPlay = true; changed = true; }
        if (db.employee.site.dots == null) { db.employee.site.dots = true; changed = true; }
      }
      if (db.brand && db.brand.institutions) {
        db.brand.institutions.forEach((i) => {
          if (!i.platforms) { i.platforms = i.on ? ['brand'] : []; changed = true; }
          if (i.bookable == null) { i.bookable = false; changed = true; }
        });
      }
      if (db.rbac && db.rbac.roles) {
        if (!db.rbac.roles.some((r) => r.id === db.rbac.current)) { db.rbac.current = 'super'; changed = true; }
      }
      if (changed) this.persist();
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
        const pid = 'pv' + Date.now() + app;
        db.publishes.unshift({
          id: pid, app: app, title: note || '日常配置更新',
          by: '孙敏', at: at, items: groups[app].length, status: 'online'
        });
        db.snapshots = db.snapshots || [];
        const snap = deep(db);
        snap.snapshots = [];
        db.snapshots.unshift({ id: pid, at: at, db: snap });
        if (db.snapshots.length > 6) db.snapshots.pop();
      });
      db.meta.publishedAt = at;
      db.meta.version = (parseFloat(db.meta.version) + 0.01).toFixed(2);
      const n = dirty.length;
      dirty = [];
      this.persist(); this.emit();
      return { count: n, at: at };
    },

    rollback(publishId) {
      const s = (db.snapshots || []).find((x) => x.id === publishId);
      if (!s) return false;
      this.snapshot();
      db = deep(s.db);
      dirty = [];
      db.meta.publishedAt = s.at;
      db.publishes.unshift({
        id: 'rb' + Date.now(), app: 'system', title: '回滚至 ' + s.at + ' 的版本',
        by: this.role.name, at: s.at, items: 0, status: 'rolled'
      });
      this.persist(); this.emit();
      return true;
    },

    discard() { dirty = []; this.persist(); this.emit(); },

    reset() {
      this.snapshot();
      db = deep(window.SEED);
      dirty = demoDirty();
      this.persist(); this.emit();
    },

    exportApp(app) {
      if (app === 'versionall') return { version: db.meta.version, camp: 'camp1', rules: db.versionall };
      if (app === 'pku') return { version: db.meta.version, brand: db.brand };
      return { version: db.meta.version, health: db.employee };
    },

    /* ---------------- 角色与权限 ---------------- */
    get roleId() { return (db.rbac && db.rbac.current) || 'super'; },
    get role() {
      const r = (db.rbac.roles || []).find((x) => x.id === this.roleId);
      return r || (db.rbac.roles || [])[0] || { id: 'super', name: '超级管理员', perms: 'ALL' };
    },
    setRole(id) {
      const r = db.rbac.roles.find((x) => x.id === id);
      if (!r) return;
      db.rbac.current = id;
      this.persist();
      this.emit();
    },
    /** level: 1 查看 / 2 编辑 / 3 发布 */
    can(group, level) {
      const need = level == null ? 1 : level;
      const p = this.role.perms;
      if (p === 'ALL') return true;
      if (!group) return true;
      const v = p[group] || 0;
      return v >= need;
    },
    get canPublish() { return this.can('publish', 3); },
    groupsForRole() {
      const p = this.role.perms;
      if (p === 'ALL') return null;
      return p;
    },

    get dirtyByApp() {
      const m = {};
      dirty.forEach((d) => { m[d.app] = (m[d.app] || 0) + 1; });
      return m;
    }
  };

  window.Store = Store;
})();
