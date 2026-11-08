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
    pku: 'https://baoweidong.github.io/PKU-introduce/mobile.html',
    employee: 'https://baoweidong.github.io/pku-employee-health/'
  };
  const PKU_PAGE = { 'pku-home': '', 'pku-hospitals': '', 'pku-team': '', 'pku-camp': '' };

  const APPS = {
    versionall: { name: '减重营', dot: '#3f8cff' },
    pku: { name: '品牌站', dot: '#0aa39a' },
    employee: { name: '职工健康', dot: '#c8871a' },
    all: { name: '跨端', dot: '#0b63e5' }
  };

  /* ---------------------------------------------------------- 业务工作台 */
  const WORKBENCHES = [
    { id: 'service', label: '服务与商品', dot: '#0b63e5', home: 'svc-catalog' },
    { id: 'customer', label: '客户与交易', dot: '#0aa39a', home: 'trd-orders' },
    { id: 'content', label: '内容与渠道', dot: '#6b5ce0', home: 'chn-channels' },
    { id: 'program', label: '项目运营', dot: '#3f8cff', home: 'v-dashboard' },
    { id: 'platform', label: '平台', dot: '#94a7c0', home: 'workbench' }
  ];

  const NAV_OF = {
    service: [
      { group: '', items: [{ id: 'svc-catalog', label: '服务商品', icon: 'package' }] },
      { group: '定价', items: [{ id: 'svc-pricing', label: '价格与政策', icon: 'target' }, { id: 'svc-bundles', label: '服务包与组合', icon: 'layers' }] },
      { group: '履约基础', items: [{ id: 'g-orgs', label: '服务机构', icon: 'hospital' }, { id: 'e-booking', label: '预约设置', icon: 'calendar' }, { id: 'e-dashboard', label: '服务概览', icon: 'grid' }] }
    ],
    customer: [
      { group: '', items: [{ id: 'trd-orders', label: '订单中心', icon: 'file' }] },
      { group: '履约', items: [{ id: 'v-fulfill', label: '履约工作台', icon: 'truck' }, { id: 'v-claims', label: '领奖订单', icon: 'gift' }, { id: 'v-exchanges', label: '积分兑换', icon: 'package' }] },
      { group: '结算', items: [{ id: 'trd-settle', label: '结算与对账', icon: 'chart' }] },
      { group: '客户', items: [{ id: 'g-accounts', label: '客户账号', icon: 'users' }, { id: 'e-orgs', label: '企业客户与权益', icon: 'building' }] }
    ],
    content: [
      { group: '渠道', items: [{ id: 'chn-channels', label: '渠道与触点', icon: 'layers' }] },
      { group: '内容', items: [{ id: 'g-content', label: '内容中心', icon: 'image' }, { id: 'e-content', label: '职工端内容', icon: 'video' }, { id: 'e-qa', label: '深度问答', icon: 'message' }] },
      { group: '品牌站页面', items: [{ id: 'b-home', label: '首页内容', icon: 'layout' }, { id: 'b-about', label: '品牌页', icon: 'file' }, { id: 'b-departments', label: '学科与科室', icon: 'layers' }, { id: 'b-team', label: '师资团队', icon: 'stethoscope' }, { id: 'b-camp', label: '健康营展示页', icon: 'spark' }] },
      { group: '职工端页面', items: [{ id: 'e-modules', label: '模块与分类', icon: 'grid' }] },
      { group: '全局', items: [{ id: 'g-brand', label: '品牌与主体', icon: 'spark' }, { id: 'g-theme', label: '主题与入口', icon: 'sliders' }] }
    ],
    program: [
      { group: '五好生活', items: [{ id: 'fg-overview', label: '五好生活', icon: 'spark' }, { id: 'fg-eat', label: '吃好 · 食谱', icon: 'package' }, { id: 'fg-sleep', label: '睡好 · 睡眠', icon: 'moon' }, { id: 'fg-move', label: '动好 · 运动', icon: 'run' }, { id: 'fg-mind', label: '心好 · 心理', icon: 'heart' }, { id: 'fg-check', label: '查好 · 体检', icon: 'stethoscope' }, { id: 'fg-reco', label: '推荐规则', icon: 'target' }, { id: 'fg-survey', label: '评估问卷', icon: 'file' }, { id: 'fg-report', label: '月度报告', icon: 'send' }, { id: 'fg-config', label: '评分与权重', icon: 'sliders' }] },
      { group: '减重营 · 营期', items: [{ id: 'v-dashboard', label: '运营概览', icon: 'grid' }, { id: 'v-camps', label: '营期管理', icon: 'calendar' }, { id: 'v-students', label: '学员管理', icon: 'users' }, { id: 'v-records', label: '打卡记录', icon: 'check' }, { id: 'v-annotations', label: '批注工作台', icon: 'message' }, { id: 'v-attendance', label: '出勤看板', icon: 'layout' }, { id: 'v-content', label: '活动与课程', icon: 'video' }, { id: 'v-messages', label: '消息与公告', icon: 'bell' }] },
      { group: '减重营 · 规则', items: [{ id: 'v-rules', label: '打卡规则', icon: 'sliders' }, { id: 'v-points-rules', label: '积分规则', icon: 'target' }, { id: 'v-metrics', label: '健康指标库', icon: 'activity' }, { id: 'v-questionnaire', label: '入营问卷', icon: 'file' }, { id: 'v-activities', label: '活动与入口', icon: 'spark' }, { id: 'v-tiers', label: '连续打卡奖励', icon: 'gift' }, { id: 'v-products', label: '积分商城', icon: 'package' }, { id: 'v-badges', label: '徽章体系', icon: 'medal' }, { id: 'v-ranking', label: '排行榜', icon: 'star' }] },
      { group: '减重营 · 报告', items: [{ id: 'v-stats', label: '营期统计', icon: 'chart' }, { id: 'v-report', label: '结营报告', icon: 'file' }, { id: 'v-enterprise', label: '企业健康报告', icon: 'building' }, { id: 'v-supervisor', label: '督导总览', icon: 'eye' }] }
    ],
    platform: [
      { group: '', items: [{ id: 'workbench', label: '工作台', icon: 'grid' }, { id: 's-publish', label: '发布中心', icon: 'send' }, { id: 's-logs', label: '操作日志', icon: 'clock' }, { id: 'g-roles', label: '角色与权限', icon: 'lock' }, { id: 's-settings', label: '系统设置', icon: 'settings' }] }
    ]
  };

  const ROUTE_WB = {};
  Object.keys(NAV_OF).forEach((wb) => NAV_OF[wb].forEach((g) => g.items.forEach((it) => { ROUTE_WB[it.id] = wb; })));
  const wbOf = (route) => ROUTE_WB[route] || 'service';

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
    route: 'workbench', ctx: {}, app: 'platform', openGroup: {},
    previewOpen: true, previewMode: 'live',
    previewApp: 'pku', previewScreen: 'pku-home', previewCtx: {},
    history: [], autoMocked: false
  };

  function currentPage() { return PAGES[state.route] || PAGES.workbench; }

  /* ---------------------------------------------------------- rail */
  function railHTML() {
    const role = Store.role;
    const nav = NAV_OF[state.app] || NAV_OF.platform;
    const navOpen = state.openGroup[state.app] || ((nav.find((g) => g.items.some((it) => it.id === state.route)) || nav[0] || {}).group || '_top');
    return '<div class="rail-inner">' +
      '<div class="brand"><div class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></div>' +
      '<div class="brand-txt"><b>北大医疗</b><span>SUPER CONSOLE</span></div></div>' +
      '<div class="appswitch">' + WORKBENCHES.map((a) =>
        '<button data-app="' + a.id + '" class="' + (a.id === state.app ? 'on' : '') + '" title="' + a.label + '">' +
        '<i class="dot" style="background:' + a.dot + '"></i><span>' + a.label + '</span></button>').join('') + '</div>' +
      '<nav class="nav">' + nav.map((g) => {
        const items = g.items.filter((it) => visible(it.id));
        if (!items.length) return '';
        const key = g.group || '_top';
        const cl = g.group ? key !== navOpen : false;
        return '<div class="navgrp ' + (cl ? 'collapsed' : '') + '">' +
          (g.group ? '<button class="navgrp-h" data-collapse="' + key + '">' + E(g.group) +
            '<span style="margin-left:auto;font-size:10px;opacity:.5">' + items.length + '</span>' +
            '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="margin-left:6px;opacity:.55;transition:transform .18s;' + (cl ? 'transform:rotate(-90deg)' : '') + '"><path d="m6 9 6 6 6-6"/></svg></button>' : '') +
          items.map((it) => {
            const cnt = navCount(it.id);
            const lvl = Store.can(groupOf(it.id), 2);
            return '<button class="navitem ' + (it.id === state.route ? 'on' : '') + '" data-nav="' + it.id + '" title="' + E(it.label) + '">' +
              I(it.icon, 16) + '<span>' + E(it.label) + '</span>' +
              (cnt ? '<span class="count ' + (it.hot ? 'hot' : '') + '">' + cnt + '</span>' : '') +
              (lvl ? '' : '<span class="count" style="background:transparent;color:#5f7797;font-size:9px">只读</span>') + '</button>';
          }).join('') + '</div>';
      }).join('') + '</nav>' +
      '<button class="rail-foot" data-act="roleMenu">' +
      '<div class="ava">' + E(role.name.slice(0, 1)) + '</div><div class="who"><b>' + E(role.name) + '</b><span>' + E(role.desc) + '</span></div>' +
      '<span class="ic">' + I('refresh', 14) + '</span></button></div>';
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
    const wb = WORKBENCHES.find((x) => x.id === state.app) || WORKBENCHES[4];
    const app = APPS[page.app || 'all'];
    const dirty = Store.dirtyCount;
    return '<div class="crumb"><span style="display:inline-flex;align-items:center;gap:6px"><i style="width:6px;height:6px;border-radius:50%;background:' + wb.dot + '"></i>' + E(wb.label) + '</span>' +
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
      '<div style="padding:2px 16px 8px">' + K.seg((live ? [{ id: scr[0].id, label: '线上页面' }] : scr).map((s) => ({ id: s.id, label: s.label })), state.previewScreen, 'previewScreen') + '</div>' +
      '<div class="dock-b"><div class="device"><div class="device-screen">' +
        (live ? liveFrame() : '<div class="pv" id="pv-root">' + Preview.render(state.previewScreen, state.previewCtx) + '</div>') +
      '</div></div></div>' +
      '<div style="padding:0 16px 12px"><div class="row small mut" style="justify-content:space-between">' +
      '<span>' + (live ? '真实线上页面，不可交互' : '按当前配置渲染') + '</span>' +
      '<a href="' + liveUrl() + '" target="_blank" rel="noopener" style="color:var(--brand);font-size:11px;display:inline-flex;align-items:center;gap:3px">打开新窗口' + I('external', 11) + '</a></div></div>' +
      '</aside>';
  }
  function liveUrl() {
    if (state.previewApp === 'pku') return LIVE.pku + (PKU_PAGE[state.previewScreen] || '');
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
      (readonly ? '<div class="readonly-bar">' + I('lock', 14) + '<b>' + E(Store.role.name) + '</b> 对该模块仅有查看权限，编辑与发布已关闭' +
        '<button class="btn sm" data-act="switchSuper" style="margin-left:auto">切换为超级管理员</button></div>' : '') +
      safeRender(page, state.ctx) + '</div></div>' +
      dockHTML() + '</div></div></div>';
    const sc = document.querySelector('.scrollarea');
    if (sc) sc.scrollTop = top;
    wireLive();
    syncPreview();
  }

  function safeRender(page, ctx) {
    try { return page.render(ctx); }
    catch (e) {
      console.error(e);
      return '<div class="panel" style="padding:28px"><div class="empty"><b>该页面加载失败</b>' +
        '请刷新页面；若仍失败，可能是本地缓存与新版本不兼容。<br>' +
        '<button class="btn" style="margin-top:12px" data-act="clearCache">清理本地缓存并刷新</button></div></div>';
    }
  }

  function wireLive() {
    const f = document.getElementById('live-frame');
    if (!f) return;
    const fb = document.getElementById('live-fallback');
    let done = false;
    f.addEventListener('load', () => { done = true; if (fb) fb.style.display = 'none'; });
    setTimeout(() => {
      if (done) return;
      if (fb) fb.innerHTML = '线上页面加载超时<br><span style="opacity:.7">已切换到配置模拟，可点「实况」重试</span>';
      state.previewMode = 'mock';
      state.autoMocked = true;
      render(true);
      UI.toast('线上页面加载超时，已切换到配置模拟', 'warn');
    }, 6000);
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
      state.app = wbOf(route);
      delete state.openGroup[state.app];
      state.ctx = ctx || {};
      const page = currentPage();
      const app = page.papp || (page.app && page.app !== 'all' ? page.app : state.previewApp);
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
          '<span>' + E(i.title) + '</span><span class="k">' + E((WORKBENCHES.find((w) => w.id === wbOf(i.route)) || {}).label || '') + '</span></button>').join('')
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

  /* ---------------------------------------------------------- 配置文件 */
  function buildConfig() {
    const db = Store.db;
    return {
      version: db.meta.version,
      updatedAt: db.meta.publishedAt,
      brand: db.shared.brand,
      contact: db.shared.contact,
      theme: db.shared.theme,
      employee: {
        site: db.employee.site,
        modules: db.employee.modules.filter((m) => m.on).map((m) => ({ id: m.id, name: m.name, stab: m.stab })),
        services: db.employee.services.map((s) => ({
          id: s.id, name: s.name, intro: s.intro, status: s.status, cat: s.cat,
          pricing: s.pricing, channels: s.channels, bookable: s.bookable
        }))
      },
      versionall: {
        activity: db.versionall.activity,
        tiers: db.versionall.tiers.map((t) => ({ id: t.id, name: t.name, stock: t.stock, active: t.active, requiredDays: t.requiredDays }))
      },
      fivegood: { program: db.fivegood.program, dims: db.fivegood.dims, tiers: db.fivegood.tiers }
    };
  }

  App.exportConfig = function () {
    const cfg = buildConfig();
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'admin-config.json'; a.click();
    UI.toast('配置文件已下载');
    return cfg;
  };

  App.pushConfig = function (token) {
    const cfg = buildConfig();
    const json = JSON.stringify(cfg, null, 2);
    const content = btoa(unescape(encodeURIComponent(json)));
    const url = 'https://api.github.com/repos/BAOWEIDONG/pku-console/contents/config.json';
    return fetch(url, { headers: { Authorization: 'token ' + token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((meta) => fetch(url, {
        method: 'PUT',
        headers: { Authorization: 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'chore: 更新运营配置 ' + cfg.version, content: content, sha: meta && meta.sha })
      }))
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  };

  App.configDialog = function () {
    const saved = localStorage.getItem('pku-gh-token') || '';
    UI.modal({
      title: '发布配置文件', desc: '三端 H5 在启动时读取同一份 config.json',
      body: '<div class="stack" style="gap:12px">' +
        '<div class="small mut" style="line-height:1.8">① 生成 config.json（品牌 / 服务 / 价格 / 渠道 / 五好）<br>② 推送到 pku-console 仓库根目录<br>③ H5 启动时同域读取，覆盖默认值</div>' +
        UI.fInput({ label: 'GitHub Token', value: saved, ph: 'ghp_… 仅存本地', hint: '需要该仓库 contents 写权限' }) +
        '<div class="note warn">Token 只存在浏览器 localStorage，仅用于这次提交。</div></div>',
      okText: '推送到 GitHub',
      extra: '<button class="btn" data-dl>仅下载 JSON</button>',
      mount(n) {
        n.querySelector('[data-dl]').addEventListener('click', () => { App.exportConfig(); });
      },
      onOk(n) {
        const token = (n.querySelector('.input') || {}).value || '';
        if (!token) { UI.toast('请填写 Token，或改用「仅下载 JSON」', 'warn'); return false; }
        localStorage.setItem('pku-gh-token', token);
        UI.toast('正在推送…');
        App.pushConfig(token).then(() => {
          Store.publish('发布配置文件');
          UI.toast('配置已推送到线上，H5 下次打开即生效');
          App.refresh(true);
        }).catch((e) => UI.toast('推送失败：' + e.message, 'warn'));
      }
    });
  };

  window.App = App;

  /* ---------------------------------------------------------- events */
  const ALLOW_READONLY = /^(go|goPublish|back|preview|previewAll|export|cmdk|notify|togglePreview|closePreview|previewScreen|previewMode|roleMenu|switchSuper|clearCache|impact|search|filter|tab|seg|pickRole|previewRole)/;

  document.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-app]');
    if (sw) {
      const def = WORKBENCHES.find((a) => a.id === sw.dataset.app);
      if (def) App.go(def.home);
      return;
    }
    const col = e.target.closest('[data-collapse]');
    if (col) {
      const k = col.dataset.collapse;
      state.openGroup[state.app] = (state.openGroup[state.app] === k) ? '' : k;
      render(true);
      return;
    }
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
    if (name === 'switchSuper') { Store.setRole('super'); UI.toast('已切换为超级管理员'); App.refresh(); return; }
    if (name === 'publish') { App.openPublish(''); return; }
    if (name === 'goPublish') { App.go('s-publish'); return; }
    if (name === 'notify') { UI.toast('暂无新通知'); return; }
    if (name === 's-settings') { App.go('s-settings'); return; }
    if (name === 'preview') { App.openPreview(); return; }
    if (name === 'clearCache') { localStorage.removeItem('pku-console-v1'); location.reload(); return; }
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
      state.route = route; state.app = wbOf(route); state.ctx = {};
      (qs || '').split('&').filter(Boolean).forEach((kv) => {
        const [k, v] = kv.split('=');
        state.ctx[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
      const page = currentPage();
      const app = page.papp || (page.app && page.app !== 'all' ? page.app : state.previewApp);
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
