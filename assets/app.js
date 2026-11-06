/* ============================================================================
   Console shell v3 — 融合导航、权限门禁、线上实况预览
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;

  /* ---------------------------------------------------------- 路由 → 权限模块 */
  const G = {
    'v-dashboard': 'v.ops', 'v-camps': 'v.ops', 'v-students': 'v.ops', 'v-student-detail': 'v.ops',
    'v-records': 'v.ops', 'v-annotations': 'v.ops', 'v-attendance': 'v.ops', 'v-content': 'v.ops', 'v-messages': 'v.ops',
    'v-rules': 'v.rules', 'v-points-rules': 'v.rules', 'v-metrics': 'v.rules', 'v-questionnaire': 'v.rules', 'v-activities': 'v.rules',
    'v-tiers': 'v.incentive', 'v-products': 'v.incentive', 'v-badges': 'v.incentive',
    'v-claims': 'v.fulfill', 'v-exchanges': 'v.fulfill', 'v-fulfill': 'v.fulfill',
    'v-stats': 'v.report', 'v-ranking': 'v.report', 'v-report': 'v.report', 'v-enterprise': 'v.report', 'v-supervisor': 'v.report',
    'b-home': 'b.content', 'b-about': 'b.content', 'b-camp': 'b.content',
    'b-hospitals': 'shared.orgs', 'b-departments': 'b.team', 'b-team': 'b.team', 'b-site': 'shared.theme',
    'e-services': 'e.services', 'e-modules': 'e.services', 'e-orgs': 'e.services', 'e-dashboard': 'e.services',
    'e-booking': 'e.booking', 'e-bookings': 'e.booking',
    'e-content': 'e.content', 'e-qa': 'e.content', 'e-site': 'shared.theme',
    's-publish': 'publish', 's-logs': 'logs', 's-settings': 'roles', workbench: 'v.ops'
  };
  const groupOf = (route) => (PAGES[route] && PAGES[route].grp) || G[route] || 'v.ops';

  const LIVE = {
    versionall: 'https://baoweidong.github.io/versionall/',
    pku: 'https://baoweidong.github.io/PKU-introduce/',
    employee: 'https://baoweidong.github.io/pku-employee-health/'
  };
  const PKU_PAGE = { 'pku-home': 'index.html', 'pku-hospitals': 'hospitals.html', 'pku-team': 'team.html', 'pku-camp': 'camp.html' };

  const APPS = {
    versionall: { name: '减重营', dot: '#3f8cff' },
    pku: { name: '品牌站', dot: '#0aa39a' },
    employee: { name: '职工健康', dot: '#c8871a' },
    all: { name: '跨端', dot: '#0b63e5' }
  };

  /* ---------------------------------------------------------- 融合导航 */
  function buildNav() {
    const navs = [];
    navs.push({ group: '', items: [{ id: 'workbench', label: '工作台', icon: 'grid' }] });
    (window.SHARED_NAV || []).forEach((g) => navs.push(g));
    const push = (prefix, arr) => arr.forEach((g) => navs.push({ group: prefix + (g.group ? ' · ' + g.group : ''), items: g.items }));
    push('减重营', window.NAV.versionall || []);
    push('品牌站', window.NAV.pku || []);
    push('职工健康', window.NAV.employee || []);
    navs.push({ group: '平台', items: [
      { id: 's-publish', label: '发布中心', icon: 'send' },
      { id: 's-logs', label: '操作日志', icon: 'clock' },
      { id: 's-settings', label: '系统设置', icon: 'settings' }
    ] });
    return navs;
  }
  const NAV_ALL = buildNav();

  const ROUTE_META = (route) => PAGES[route] || {};
  function visible(route) {
    const p = ROUTE_META(route);
    if (p.app === 'all' && route === 'workbench') return true;
    return Store.can(groupOf(route), 1);
  }
  function canEdit(route) {
    if (route === 'workbench' || route.indexOf('s-') === 0) return true;
    return Store.can(groupOf(route), 2);
  }

  const state = {
    route: 'workbench', ctx: {},
    previewOpen: true, previewMode: 'live',
    previewApp: 'pku', previewScreen: 'pku-home', previewCtx: {},
    history: [], autoMocked: false
  };

  function currentPage() { return PAGES[state.route] || PAGES.workbench; }

  /* ---------------------------------------------------------- rail */
  function railHTML() {
    const role = Store.role;
    return '<div class="rail-inner">' +
      '<div class="brand"><div class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></div>' +
      '<div class="brand-txt"><b>北大医疗</b><span>SUPER CONSOLE</span></div></div>' +
      '<div style="margin:0 14px 10px;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.07)">' +
        '<div style="font-size:10px;color:#6f88a8;letter-spacing:.04em">当前角色</div>' +
        '<button data-act="roleMenu" style="display:flex;align-items:center;gap:7px;width:100%;margin-top:3px;color:#e8f1fd;font-size:12.5px">' +
        '<i style="width:6px;height:6px;border-radius:50%;background:' + dot(role.color) + '"></i>' + E(role.name) +
        '<span style="margin-left:auto;color:#7f97b9">' + I('down', 13) + '</span></button></div>' +
      '<nav class="nav">' + NAV_ALL.map((g) => {
        const items = g.items.filter((it) => visible(it.id));
        if (!items.length) return '';
        return '<div class="navgrp">' + (g.group ? '<div class="navgrp-h">' + E(g.group) + '</div>' : '') +
          items.map((it) => {
            const cnt = navCount(it.id);
            const lvl = Store.can(groupOf(it.id), 2);
            return '<button class="navitem ' + (it.id === state.route ? 'on' : '') + '" data-nav="' + it.id + '" title="' + E(it.label) + '">' +
              I(it.icon, 16) + '<span>' + E(it.label) + '</span>' +
              (cnt ? '<span class="count ' + (it.hot ? 'hot' : '') + '">' + cnt + '</span>' : '') +
              (lvl ? '' : '<span class="count" style="background:transparent;color:#5f7797;font-size:9px">只读</span>') + '</button>';
          }).join('') + '</div>';
      }).join('') + '</nav>' +
      '<div class="rail-foot"><div class="ava">' + E(role.name.slice(0, 1)) + '</div><div class="who"><b>' + E(Store.role.name) + '</b><span>' + E(Store.role.desc) + '</span></div>' +
      '<button class="ic" data-act="s-settings" title="设置">' + I('settings', 16) + '</button></div></div>';
  }
  function dot(c) { return c === 'green' ? '#0aa39a' : c === 'violet' ? '#8b7cf6' : c === 'amber' ? '#c8871a' : c === 'grey' ? '#94a7c0' : '#3f8cff'; }
  function navCount(route) {
    if (route === 'v-annotations') return Store.db.versionall.records.exercise.filter((r) => !r.comments || !r.comments.length).length;
    if (route === 'v-claims') return Store.db.versionall.claims.filter((c) => c.status === 'pending').length;
    if (route === 'e-bookings') return Store.db.employee.bookings.filter((b) => b.status === 'pending').length;
    if (route === 's-publish') return Store.dirtyCount || null;
    return null;
  }

  /* ---------------------------------------------------------- topbar */
  function topbarHTML() {
    const page = currentPage();
    const app = APPS[page.app || 'all'];
    const dirty = Store.dirtyCount;
    return '<div class="crumb"><span style="display:inline-flex;align-items:center;gap:6px"><i style="width:6px;height:6px;border-radius:50%;background:' + app.dot + '"></i>' + E(app.name) + '</span>' +
      '<span class="sep">/</span><b>' + E(page.title || '') + '</b>' +
      (Store.role.perms === 'ALL' ? '' : '<span class="pill grey" style="margin-left:6px;height:18px">' + E(Store.role.name) + '</span>') + '</div>' +
      '<div class="top-actions">' +
      '<button class="searchbtn" data-act="cmdk">' + I('search', 15) + '<span>搜索页面、功能、配置</span><kbd>⌘K</kbd></button>' +
      (dirty ? '<button class="btn" data-act="goPublish" style="color:#b83c2c;border-color:#f3d3ce">' + I('send', 14) + dirty + ' 项待发布</button>' : '') +
      '<button class="iconbtn" data-act="togglePreview" title="实时预览" style="' + (state.previewOpen ? 'background:var(--brand-wash);color:var(--brand)' : '') + '">' + I('eye', 17) + '</button>' +
      '<button class="btn primary" data-act="publish"' + (Store.canPublish ? '' : ' disabled title="当前角色无发布权限"') + '>' + I('send', 15) + '发布</button>' +
      '<div style="width:1px;height:20px;background:var(--line);margin:0 3px"></div>' +
      '<button class="iconbtn" data-act="notify" style="position:relative">' + I('bell', 17) + '<span style="position:absolute;top:6px;right:7px;width:6px;height:6px;border-radius:50%;background:#d9503f;border:1.5px solid #fff"></span></button>' +
      '<button data-act="roleMenu" style="display:flex;align-items:center;gap:7px;padding:3px 8px 3px 3px;border-radius:20px;border:1px solid var(--line);background:#fff">' +
      '<span class="ava" style="width:26px;height:26px;font-size:11px">' + E(Store.role.name.slice(0, 1)) + '</span>' +
      '<span style="font-size:11.5px;color:var(--ink-2)">' + E(Store.role.name) + '</span>' + I('down', 12) + '</button>' +
      '</div>';
  }

  /* ---------------------------------------------------------- dock */
  function dockHTML() {
    if (!state.previewOpen) return '';
    const scr = Preview.SCREENS[state.previewApp] || [];
    const live = state.previewMode === 'live';
    return '<aside class="dock"><div class="dock-h">' +
      '<div><div class="tt">' + (live ? '线上实况' : '配置模拟') + '</div><div class="sub">' + E(APPS[state.previewApp].name) + (live ? ' · 真实页面' : ' · 随配置变化') + '</div></div>' +
      '<div class="right row" style="gap:4px">' +
      '<div class="seg">' + [['live', '实况'], ['mock', '模拟']].map((m) => '<button data-act="previewMode" data-id="' + m[0] + '" class="' + (state.previewMode === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
      '<button class="iconbtn" data-act="closePreview" style="width:26px;height:26px">' + I('x', 14) + '</button></div></div>' +
      (live ? '<div class="live-hint"><i></i>已连接线上 H5，与用户所见一致' + (state.autoMocked ? ' · 改动已切到模拟' : '') + '</div>' : '') +
      '<div style="padding:2px 16px 8px">' + K.seg((live && state.previewApp !== 'pku' ? [{ id: scr[0].id, label: '线上首页' }] : scr).map((s) => ({ id: s.id, label: s.label })), state.previewScreen, 'previewScreen') + '</div>' +
      '<div class="dock-b"><div class="device"><div class="device-screen">' +
        (live ? liveFrame() : '<div class="pv" id="pv-root">' + Preview.render(state.previewScreen, state.previewCtx) + '</div>') +
      '</div></div></div>' +
      '<div style="padding:0 16px 12px"><div class="row small mut" style="justify-content:space-between">' +
      '<span>' + (live ? '真实线上页面，不可交互' : '按当前配置渲染') + '</span>' +
      '<a href="' + liveUrl() + '" target="_blank" rel="noopener" style="color:var(--brand);font-size:11px;display:inline-flex;align-items:center;gap:3px">打开新窗口' + I('external', 11) + '</a></div></div>' +
      '</aside>';
  }
  function liveUrl() {
    if (state.previewApp === 'pku') return LIVE.pku + (PKU_PAGE[state.previewScreen] || 'index.html');
    return LIVE[state.previewApp] || LIVE.pku;
  }
  function liveFrame() {
    return '<div class="pv-live"><div style="width:260px;height:562px;overflow:hidden;background:#fff;border-radius:4px">' +
      '<iframe id="live-frame" src="' + liveUrl() + '" loading="lazy" referrerpolicy="no-referrer" ' +
      'style="width:390px;height:844px;transform:scale(.666);transform-origin:top left"></iframe></div>' +
      '<div class="pv-fallback" id="live-fallback">正在加载线上页面…<br><span style="opacity:.7">若长时间空白，说明当前网络无法访问 GitHub Pages</span></div></div>';
  }

  /* ---------------------------------------------------------- render */
  function render(keepScroll) {
    const page = currentPage();
    const sc0 = document.querySelector('.scrollarea');
    const top = keepScroll && sc0 ? sc0.scrollTop : 0;
    const readonly = !canEdit(state.route);
    document.getElementById('app').innerHTML =
      '<div class="shell"><aside class="rail">' + railHTML() + '</aside><div class="main">' +
      '<header class="topbar">' + topbarHTML() + '</header>' +
      '<div class="canvas ' + (state.previewOpen ? 'has-dock' : '') + '">' +
      '<div class="scrollarea scroll"><div class="page ' + (readonly ? 'readonly' : '') + '">' +
      (readonly ? '<div class="readonly-bar">' + I('lock', 14) + '<b>' + E(Store.role.name) + '</b> 对该模块仅有查看权限，编辑与发布已关闭</div>' : '') +
      page.render(state.ctx) + '</div></div>' +
      dockHTML() + '</div></div></div>';
    const sc = document.querySelector('.scrollarea');
    if (sc) sc.scrollTop = top;
    wireLive();
    syncPreview();
  }

  function wireLive() {
    const f = document.getElementById('live-frame');
    if (!f) return;
    const fb = document.getElementById('live-fallback');
    let done = false;
    f.addEventListener('load', () => { done = true; if (fb) fb.style.display = 'none'; });
    setTimeout(() => { if (!done && fb) fb.innerHTML = '当前环境无法加载外部页面<br><span style="opacity:.7">点击下方「打开新窗口」查看真实 H5</span>'; }, 5000);
  }

  function syncPreview() {
    const root = document.getElementById('pv-root');
    if (root) root.innerHTML = Preview.render(state.previewScreen, state.previewCtx);
  }

  /* ---------------------------------------------------------- router */
  const App = {
    go(route, ctx) {
      if (!PAGES[route]) return;
      if (!visible(route)) { UI.toast('当前角色无权访问该模块'); return; }
      state.history.push({ route: state.route, ctx: state.ctx });
      if (state.history.length > 30) state.history.shift();
      state.route = route;
      state.ctx = ctx || {};
      const page = currentPage();
      const app = page.app && page.app !== 'all' ? page.app : state.previewApp;
      if (Preview.SCREENS[app]) {
        state.previewApp = app;
        const want = typeof page.preview === 'function' ? page.preview(state.ctx) : page.preview;
        if (want && Preview.SCREENS[app].some((s) => s.id === want)) state.previewScreen = want;
        else if (!Preview.SCREENS[app].some((s) => s.id === state.previewScreen)) state.previewScreen = Preview.SCREENS[app][0].id;
      }
      location.hash = '#/' + route + (Object.keys(state.ctx).length ? '?' + Object.keys(state.ctx).map((k) => k + '=' + encodeURIComponent(state.ctx[k])).join('&') : '');
      state.autoMocked = false;
      render();
      const sc = document.querySelector('.scrollarea');
      if (sc) sc.scrollTop = 0;
    },
    back() {
      const prev = state.history.pop();
      if (!prev) return this.go('workbench');
      state.route = prev.route; state.ctx = prev.ctx;
      location.hash = '#/' + prev.route; render();
    },
    refresh(keep) { render(keep); },
    setPreview(screen, ctx) {
      state.previewScreen = screen;
      if (ctx) state.previewCtx = ctx;
      state.previewOpen = true;
      state.previewMode = 'mock';
      render(true);
    },
    /** 配置改动后：自动切到模拟，让改动可见 */
    onConfigChange() {
      if (state.previewMode === 'live') { state.previewMode = 'mock'; state.autoMocked = true; render(true); }
      else syncPreview();
    },
    openPreview() { state.previewOpen = true; render(true); },
    closePreview() { state.previewOpen = false; render(true); },

    roleMenu(anchor) {
      const old = document.querySelector('.role-menu');
      if (old) { old.remove(); return; }
      const m = document.createElement('div');
      m.className = 'role-menu';
      m.innerHTML = '<div class="rm-h">切换登录角色（用于验证权限差异）</div>' +
        Store.db.rbac.roles.map((r) =>
          '<button data-role="' + r.id + '" class="' + (r.id === Store.roleId ? 'on' : '') + '">' +
          '<i style="width:7px;height:7px;border-radius:50%;background:' + dot(r.color) + '"></i>' +
          '<span style="flex:1"><span style="display:block">' + E(r.name) + '</span><span class="rm-d">' + E(r.desc) + '</span></span>' +
          (r.id === Store.roleId ? '<span class="pill blue">当前</span>' : '') + '</button>').join('') +
        '<div style="border-top:1px solid var(--line-2);margin-top:6px;padding:8px 10px 2px"><button data-act="goRoles" style="color:var(--brand);font-size:12px;width:100%;text-align:left">管理角色与权限 ›</button></div>';
      document.body.appendChild(m);
      const r = anchor.getBoundingClientRect();
      m.style.top = Math.min(window.innerHeight - 420, r.bottom + 8) + 'px';
      m.style.left = Math.max(12, r.right - 268) + 'px';
      m.addEventListener('click', (e) => {
        const b = e.target.closest('[data-role]');
        if (b) {
          Store.setRole(b.dataset.role);
          m.remove();
          UI.toast('已切换为「' + Store.role.name + '」');
          if (!visible(state.route)) App.go('workbench'); else render();
          return;
        }
        if (e.target.closest('[data-act="goRoles"]')) { m.remove(); App.go('g-roles'); }
      });
      setTimeout(() => document.addEventListener('click', function off(ev) {
        if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('click', off); }
      }), 0);
    },

    openPublish(note) {
      if (!Store.canPublish) { UI.toast('当前角色没有发布权限'); return; }
      const dirty = Store.dirty;
      if (!dirty.length) { UI.toast('没有待发布的变更'); return; }
      const groups = {};
      dirty.forEach((d) => { (groups[d.app] = groups[d.app] || []).push(d); });
      const list = Object.keys(groups).map((app) =>
        '<div style="margin-bottom:12px"><div class="row" style="gap:7px;margin-bottom:6px">' +
        '<span class="pill ' + (app === 'versionall' ? 'blue' : app === 'pku' ? 'green' : app === 'employee' ? 'amber' : 'grey') + '">' +
        (APPS[app] ? APPS[app].name : '跨端') + '</span><span class="small mut">' + groups[app].length + ' 项</span></div>' +
        '<div class="diff">' + groups[app].slice(0, 8).map((d) => '<div><span class="add">+</span> ' + E(d.label) + ' <span class="mut">' + E(d.path) + '</span></div>').join('') +
        (groups[app].length > 8 ? '<div class="mut">… 另有 ' + (groups[app].length - 8) + ' 项</div>' : '') + '</div></div>').join('');
      UI.modal({
        title: '发布变更', desc: '将 ' + dirty.length + ' 项配置写入线上，发布后 1 分钟内生效',
        body: '<div class="stack" style="gap:14px">' + UI.fInput({ label: '发布说明', value: note || '', ph: '如 第 7 期奖励档位调整' }) + list +
          UI.impact(['品牌站（PKU-introduce）', '职工健康（pku-employee-health）', '减重营（versionall）']) +
          '<div class="note warn">发布前请确认：奖励与商品的库存、上下架状态是否与线下一致。</div></div>',
        okText: '确认发布',
        onOk(n) {
          const v = (n.querySelector('.input') || {}).value || note || '日常配置更新';
          const r = Store.publish(v);
          UI.toast('已发布 ' + r.count + ' 项变更');
          setTimeout(() => App.refresh(true), 60);
        }
      });
    },

    cmdOpen() {
      const items = [];
      Object.keys(PAGES).forEach((r) => {
        const p = PAGES[r];
        if (p.hideNav || !visible(r)) return;
        items.push({ route: r, title: p.title, app: p.app || 'all', sub: p.sub || '' });
      });
      let sel = 0, filtered = items;
      const n = document.createElement('div');
      n.className = 'cmdk';
      n.innerHTML = '<div class="cmdk-in">' + I('search', 17) + '<input placeholder="输入页面名称或功能关键词…" autofocus><kbd>ESC</kbd></div><div class="cmdk-list"></div>';
      const listEl = n.querySelector('.cmdk-list'), input = n.querySelector('input');
      function paint() {
        const q = input.value.trim().toLowerCase();
        filtered = items.filter((i) => !q || (i.title + i.sub + i.route).toLowerCase().indexOf(q) >= 0);
        listEl.innerHTML = filtered.length ? filtered.map((i, k) =>
          '<button class="cmdk-i ' + (k === sel ? 'sel' : '') + '" data-r="' + i.route + '">' + I('chevron', 14) +
          '<span>' + E(i.title) + '</span><span class="k">' + E(APPS[i.app].name) + '</span></button>').join('')
          : '<div class="empty">没有匹配的页面</div>';
      }
      paint();
      const ov = document.createElement('div');
      ov.className = 'overlay';
      ov.addEventListener('click', close);
      document.body.appendChild(ov); document.body.appendChild(n);
      function close() { ov.remove(); n.remove(); document.removeEventListener('keydown', key); }
      function key(e) {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowDown') { sel = Math.min(filtered.length - 1, sel + 1); paint(); e.preventDefault(); }
        if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); paint(); e.preventDefault(); }
        if (e.key === 'Enter' && filtered[sel]) { close(); App.go(filtered[sel].route); }
      }
      input.addEventListener('input', () => { sel = 0; paint(); });
      listEl.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) { close(); App.go(b.dataset.r); } });
      document.addEventListener('keydown', key);
      setTimeout(() => input.focus(), 30);
    }
  };
  window.App = App;

  /* ---------------------------------------------------------- events */
  const ALLOW_READONLY = /^(go|goPublish|back|preview|previewAll|export|cmdk|notify|togglePreview|closePreview|previewScreen|previewMode|roleMenu|impact|search|filter|tab|seg|pickRole|previewRole)/;

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { App.go(nav.dataset.nav); return; }
    const tg = e.target.closest('[data-toggle]');
    if (tg) {
      if (!canEdit(state.route)) { UI.toast('当前角色仅可查看'); return; }
      const path = tg.dataset.toggle;
      const cur = path.split('.').reduce((o, k) => (o == null ? o : o[k]), Store.db);
      Store.snapshot();
      Store.set(path, !cur, '开关');
      tg.classList.toggle('on', !cur);
      App.onConfigChange();
      App.refresh(true);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const name = act.dataset.act;
    if (name === 'togglePreview') { state.previewOpen = !state.previewOpen; render(true); return; }
    if (name === 'closePreview') { state.previewOpen = false; render(true); return; }
    if (name === 'previewMode') { state.previewMode = act.dataset.id; state.autoMocked = false; render(true); return; }
    if (name === 'previewScreen') { state.previewScreen = act.dataset.id; render(true); return; }
    if (name === 'cmdk') { App.cmdOpen(); return; }
    if (name === 'roleMenu') { App.roleMenu(act); return; }
    if (name === 'publish') { App.openPublish(''); return; }
    if (name === 'goPublish') { App.go('s-publish'); return; }
    if (name === 'notify') { UI.toast('暂无新通知'); return; }
    if (name === 's-settings') { App.go('s-settings'); return; }
    if (name === 'preview') { App.openPreview(); return; }
    if (!ALLOW_READONLY.test(name) && !canEdit(state.route)) { UI.toast('当前角色没有编辑权限'); return; }
    const page = currentPage();
    const fn = page.actions && page.actions[name];
    if (fn) { fn(act.dataset, act); return; }
    UI.toast('该操作在演示环境中为占位');
  });

  /* 字段绑定：写库 + 刷新预览 */
  function applyField(el) {
    const path = el.dataset.set;
    if (!path) return;
    if (!canEdit(state.route)) { UI.toast('当前角色仅可查看'); return; }
    const kind = el.dataset.kind || 'text';
    let v = el.value;
    if (kind === 'num') v = v === '' ? 0 : Number(v);
    const before = path.split('.').reduce((o, k) => (o == null ? o : o[k]), Store.db);
    if (String(before) === String(v)) return;
    Store.snapshot();
    Store.set(path, v, '编辑字段');
    App.onConfigChange();
  }
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-set]');
    if (!el || el.tagName === 'SELECT') return;
    if (el.type === 'range') {
      applyField(el);
      const b = el.parentElement.querySelector('b');
      if (b) b.textContent = el.value;
      return;
    }
    clearTimeout(el._t);
    el._t = setTimeout(() => applyField(el), 350);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-set]');
    if (!el || el.tagName !== 'SELECT') return;
    applyField(el);
    App.refresh(true);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); App.cmdOpen(); }
    if (e.key === 'Escape') { UI.closeOverlay(); const m = document.querySelector('.role-menu'); if (m) m.remove(); }
  });

  /* ---------------------------------------------------------- boot */
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h) return;
    const [route, qs] = h.split('?');
    if (PAGES[route]) {
      state.route = route; state.ctx = {};
      (qs || '').split('&').filter(Boolean).forEach((kv) => {
        const [k, v] = kv.split('=');
        state.ctx[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
      const page = currentPage();
      const app = page.app && page.app !== 'all' ? page.app : state.previewApp;
      if (Preview.SCREENS[app]) {
        state.previewApp = app;
        const want = typeof page.preview === 'function' ? page.preview(state.ctx) : page.preview;
        state.previewScreen = (want && Preview.SCREENS[app].some((s) => s.id === want)) ? want : Preview.SCREENS[app][0].id;
      }
    }
  }

  Store.init();
  // 主题色注入
  try {
    const p = Store.db.shared.theme.primary;
    if (p) document.documentElement.style.setProperty('--brand', p);
  } catch (e) {}
  parseHash();
  render();
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (h && PAGES[h] && h !== state.route) { state.route = h; render(); }
  });
})();
