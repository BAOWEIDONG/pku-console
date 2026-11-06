/* ============================================================================
   Console shell — rail, routing, preview dock, publish flow
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;

  const APPS = [
    { id: 'versionall', name: '减重营', label: '减重营', dot: '#3f8cff', home: 'v-dashboard' },
    { id: 'pku', name: '品牌站', label: '品牌站', dot: '#0aa39a', home: 'b-dashboard' },
    { id: 'employee', name: '职工健康', label: '职工健康', dot: '#c8871a', home: 'e-dashboard' },
    { id: 'all', name: '平台', label: '平台', dot: '#94a7c0', home: 'workbench' }
  ];

  const state = {
    route: 'workbench',
    ctx: {},
    previewOpen: true,
    previewApp: 'pku',
    previewScreen: 'pku-home',
    previewCtx: {},
    history: []
  };

  function appMeta(id) { return APPS.find((a) => a.id === id) || APPS[3]; }

  function currentPage() {
    return PAGES[state.route] || PAGES['workbench'];
  }

  /* ------------------------------------------------------------ render */
  function railHTML() {
    const page = currentPage();
    const appId = page.app || 'all';
    const nav = NAV[appId] || NAV.system;
    return '<div class="rail-inner">' +
      '<div class="brand"><div class="brand-mark">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>' +
      '</div><div class="brand-txt"><b>北大医疗</b><span>运营中台 CONSOLE</span></div></div>' +
      '<div class="appswitch">' + APPS.map((a) =>
        '<button data-app="' + a.id + '" class="' + (a.id === appId ? 'on' : '') + '" title="' + a.name + '">' +
        '<i class="dot" style="background:' + a.dot + '"></i><span>' + a.label + '</span>' +
        (Store.dirtyByApp[a.id] ? '<span class="count" style="margin-left:auto;font-size:10px;background:rgba(255,255,255,.14);padding:0 5px;border-radius:8px">' + Store.dirtyByApp[a.id] + '</span>' : '') +
        '<i class="arw">›</i></button>').join('') + '</div>' +
      '<nav class="nav">' + nav.map((g) =>
        '<div class="navgrp">' + (g.group ? '<div class="navgrp-h">' + E(g.group) + '</div>' : '') +
        g.items.map((it) =>
          '<button class="navitem ' + (it.id === state.route ? 'on' : '') + '" data-nav="' + it.id + '">' +
          I(it.icon, 16) + '<span>' + E(it.label) + '</span>' +
          (it.count ? '<span class="count ' + (it.hot ? 'hot' : '') + '">' + it.count + '</span>' : '') + '</button>').join('') +
        '</div>').join('') + '</nav>' +
      '<div class="rail-foot"><div class="ava">孙</div><div class="who"><b>孙敏</b><span>运营负责人</span></div>' +
      '<button class="ic" data-act="settings" title="设置">' + I('settings', 16) + '</button></div>' +
      '</div>';
  }

  function topbarHTML() {
    const page = currentPage();
    const app = appMeta(page.app || 'all');
    const dirty = Store.dirtyCount;
    return '<div class="crumb"><span>' + E(app.name) + '</span><span class="sep">/</span><b>' + E(page.title || '') + '</b></div>' +
      '<div class="top-actions">' +
      '<button class="searchbtn" data-act="cmdk">' + I('search', 15) + '<span>搜索页面、功能、配置</span><kbd>⌘K</kbd></button>' +
      (dirty ? '<button class="btn" data-act="publish" style="color:#b83c2c;border-color:#f3d3ce">' + I('send', 14) + dirty + ' 项待发布</button>' : '') +
      '<button class="iconbtn" data-act="togglePreview" title="实时预览" style="' + (state.previewOpen ? 'background:var(--brand-wash);color:var(--brand)' : '') + '">' + I('eye', 17) + '</button>' +
      '<button class="btn primary" data-act="publish">' + I('send', 15) + '发布</button>' +
      '<div style="width:1px;height:20px;background:var(--line);margin:0 3px"></div>' +
      '<button class="iconbtn" data-act="notify" style="position:relative">' + I('bell', 17) +
      '<span style="position:absolute;top:6px;right:7px;width:6px;height:6px;border-radius:50%;background:#d9503f;border:1.5px solid #fff"></span></button>' +
      '<div class="ava" style="width:32px;height:32px">孙</div>' +
      '</div>';
  }

  function dockHTML() {
    if (!state.previewOpen) return '';
    const scr = Preview.SCREENS[state.previewApp] || [];
    return '<aside class="dock"><div class="dock-h">' +
      '<div><div class="tt">实时预览</div><div class="sub">' + E(appMeta(state.previewApp).name) + ' · 与配置同源</div></div>' +
      '<div class="right"><button class="iconbtn" data-act="closePreview" style="width:26px;height:26px">' + I('x', 14) + '</button></div></div>' +
      '<div style="padding:0 16px 8px">' + K.seg(scr.map((s) => ({ id: s.id, label: s.label })), state.previewScreen, 'previewScreen') + '</div>' +
      '<div class="dock-b"><div class="device"><div class="device-screen"><div class="pv" id="pv-root">' + Preview.render(state.previewScreen, state.previewCtx) + '</div></div></div></div>' +
      '<div style="padding:0 16px 14px"><div class="row small mut" style="justify-content:space-between">' +
      '<span>改动即时生效</span><span style="color:var(--brand)">' + E(scr.find((s) => s.id === state.previewScreen) ? scr.find((s) => s.id === state.previewScreen).label : '') + '</span></div></div>' +
      '</aside>';
  }

  function render() {
    const page = currentPage();
    const scrollTop = (document.querySelector('.scrollarea') || {}).scrollTop || 0;
    document.getElementById('app').innerHTML =
      '<div class="shell"><aside class="rail">' + railHTML() + '</aside><div class="main">' +
      '<header class="topbar">' + topbarHTML() + '</header>' +
      '<div class="canvas ' + (state.previewOpen ? 'has-dock' : '') + '">' +
      '<div class="scrollarea scroll"><div class="page">' + page.render(state.ctx) + '</div></div>' +
      dockHTML() + '</div></div></div>';
    const sc = document.querySelector('.scrollarea');
    if (sc) sc.scrollTop = scrollTop;
    syncPreview();
  }

  function syncPreview() {
    const root = document.getElementById('pv-root');
    if (root) root.innerHTML = Preview.render(state.previewScreen, state.previewCtx);
  }

  /* -------------------------------------------------------------- router */
  const App = {
    go(route, ctx) {
      if (!PAGES[route]) return;
      state.history.push({ route: state.route, ctx: state.ctx });
      if (state.history.length > 30) state.history.shift();
      state.route = route;
      state.ctx = ctx || {};
      const page = currentPage();
      // 自动把预览切到该页对应的前端页面
      const app = page.app && page.app !== 'all' ? page.app : state.previewApp;
      if (Preview.SCREENS[app]) {
        state.previewApp = app;
        const want = (typeof page.preview === 'function' ? page.preview(state.ctx) : page.preview);
        if (want && Preview.SCREENS[app].some((s) => s.id === want)) state.previewScreen = want;
        else if (!Preview.SCREENS[app].some((s) => s.id === state.previewScreen)) state.previewScreen = Preview.SCREENS[app][0].id;
      }
      location.hash = '#/' + route + (Object.keys(state.ctx).length ? '?' + Object.keys(state.ctx).map((k) => k + '=' + encodeURIComponent(state.ctx[k])).join('&') : '');
      render();
      document.querySelector('.scrollarea').scrollTop = 0;
    },
    back() {
      const prev = state.history.pop();
      if (!prev) return this.go('workbench');
      state.route = prev.route; state.ctx = prev.ctx;
      location.hash = '#/' + prev.route;
      render();
    },
    refresh() { render(); },
    setPreview(screen, ctx) {
      state.previewScreen = screen;
      if (ctx) state.previewCtx = ctx;
      if (!state.previewOpen) state.previewOpen = true;
      render();
    },
    openPreview() {
      state.previewOpen = true;
      render();
    },
    closePreview() { state.previewOpen = false; render(); },

    openPublish(note) {
      const dirty = Store.dirty;
      if (!dirty.length) { UI.toast('没有待发布的变更'); return; }
      const groups = {};
      dirty.forEach((d) => { (groups[d.app] = groups[d.app] || []).push(d); });
      const list = Object.keys(groups).map((app) =>
        '<div style="margin-bottom:12px"><div class="row" style="gap:7px;margin-bottom:6px">' +
        '<span class="pill ' + ({ versionall: 'blue', pku: 'green', employee: 'amber', system: 'grey' }[app]) + '">' +
        ({ versionall: '减重营', pku: '品牌站', employee: '职工健康', system: '系统' }[app]) + '</span>' +
        '<span class="small mut">' + groups[app].length + ' 项</span></div>' +
        '<div class="diff">' + groups[app].slice(0, 8).map((d) => '<div><span class="add">+</span> ' + E(d.label) + ' <span class="mut">' + E(d.path) + '</span></div>').join('') +
        (groups[app].length > 8 ? '<div class="mut">… 另有 ' + (groups[app].length - 8) + ' 项</div>' : '') + '</div></div>').join('');

      UI.modal({
        title: '发布变更',
        desc: '将 ' + dirty.length + ' 项配置写入线上，发布后 1 分钟内生效',
        body: '<div class="stack" style="gap:14px">' +
          UI.fInput({ label: '发布说明', value: note || '', ph: '如 第 7 期奖励档位调整' }) +
          list +
          '<div class="note warn">发布前请确认：奖励与商品的价格、库存、上下架状态是否与线下一致。</div></div>',
        okText: '确认发布',
        onOk(n) {
          const noteVal = (n.querySelector('.input') || {}).value || note || '日常配置更新';
          const r = Store.publish(noteVal);
          UI.toast('已发布 ' + r.count + ' 项变更');
          setTimeout(() => App.refresh(), 60);
        }
      });
    },

    cmdOpen() {
      const items = [];
      Object.keys(PAGES).forEach((r) => {
        const p = PAGES[r];
        if (p.hideNav) return;
        items.push({ route: r, title: p.title, app: p.app || 'all', sub: p.sub || '' });
      });
      let sel = 0, filtered = items;
      const n = document.createElement('div');
      n.className = 'cmdk';
      n.innerHTML = '<div class="cmdk-in">' + I('search', 17) + '<input placeholder="输入页面名称或功能关键词…" autofocus><kbd>ESC</kbd></div><div class="cmdk-list"></div>';
      const listEl = n.querySelector('.cmdk-list');
      const input = n.querySelector('input');
      function paint() {
        const q = input.value.trim().toLowerCase();
        filtered = items.filter((i) => !q || (i.title + i.sub + i.route).toLowerCase().indexOf(q) >= 0);
        listEl.innerHTML = filtered.length ? filtered.map((i, k) =>
          '<button class="cmdk-i ' + (k === sel ? 'sel' : '') + '" data-r="' + i.route + '">' +
          I('chevron', 14) + '<span>' + E(i.title) + '</span><span class="k">' + E(appMeta(i.app).name) + '</span></button>').join('')
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
      listEl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-r]');
        if (b) { close(); App.go(b.dataset.r); }
      });
      document.addEventListener('keydown', key);
      setTimeout(() => input.focus(), 30);
    }
  };

  window.App = App;

  /* ------------------------------------------------------- event plumbing */
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { App.go(nav.dataset.nav); return; }

    const appBtn = e.target.closest('[data-app]');
    if (appBtn) { App.go(appMeta(appBtn.dataset.app).home); return; }

    const tg = e.target.closest('[data-toggle]');
    if (tg) {
      const path = tg.dataset.toggle;
      const cur = path.split('.').reduce((o, k) => (o == null ? o : o[k]), Store.db);
      Store.snapshot();
      Store.set(path, !cur, '开关');
      tg.classList.toggle('on', !cur);
      syncPreview();
      App.refresh();
      return;
    }

    const act = e.target.closest('[data-act]');
    if (act) {
      const name = act.dataset.act;
      if (name === 'togglePreview') { state.previewOpen = !state.previewOpen; render(); return; }
      if (name === 'closePreview') { state.previewOpen = false; render(); return; }
      if (name === 'previewScreen') { state.previewScreen = act.dataset.id; render(); return; }
      if (name === 'cmdk') { App.cmdOpen(); return; }
      if (name === 'publish') { App.openPublish(''); return; }
      if (name === 'notify') { UI.toast('暂无新通知'); return; }
      if (name === 'settings') { App.go('s-settings'); return; }
      if (name === 'preview') { state.previewOpen = true; render(); return; }
      const page = currentPage();
      const fn = page.actions && page.actions[name];
      if (fn) { fn(act.dataset, act); return; }
      UI.toast('该操作在演示环境中为占位');
      return;
    }
  });

  /* field bindings — 直接写库并即时刷新预览，不整页重绘，避免输入失焦 */
  function applyField(el) {
    const path = el.dataset.set;
    const kind = el.dataset.kind || 'text';
    let v = el.value;
    if (kind === 'num') v = v === '' ? 0 : Number(v);
    const before = path.split('.').reduce((o, k) => (o == null ? o : o[k]), Store.db);
    if (String(before) === String(v)) return;
    Store.snapshot();
    Store.set(path, v, '编辑字段');
    syncPreview();
    const badge = document.querySelector('.top-actions .btn');
    // 更新侧栏未发布计数
    const navCount = document.querySelector('[data-nav="s-publish"] .count');
    if (navCount) navCount.textContent = Store.dirtyCount;
  }
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-set]');
    if (!el) return;
    if (el.tagName === 'SELECT') return;
    if (el.type === 'range') { applyField(el); const b = el.parentElement.querySelector('b'); if (b) b.textContent = el.value; return; }
    clearTimeout(el._t);
    el._t = setTimeout(() => applyField(el), 350);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-set]');
    if (!el) return;
    if (el.tagName === 'SELECT') { applyField(el); App.refresh(); }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); App.cmdOpen(); }
    if (e.key === 'Escape') UI.closeOverlay();
  });

  /* --------------------------------------------------------------- boot */
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h) return;
    const [route, qs] = h.split('?');
    if (PAGES[route]) {
      state.route = route;
      state.ctx = {};
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
  parseHash();
  render();
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (h && PAGES[h] && h !== state.route) { state.route = h; render(); }
  });
})();
