/* ============================================================================
   超级管理后台 · 工作区融合层
   每个工作区只有一个入口；业务域在页内切换，原始页面能力、动作与深链全部保留。
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const page = (route, label, hidden) => ({ route: route, label: label, hidden: !!hidden });

  const AREAS = {
    command: {
      id: 'command', route: 'fuse-command', label: '指挥', title: '指挥中心',
      en: 'COMMAND / CONTROL TOWER', grp: 'v.report',
      sub: '今日待办、经营洞察、发布影响与前端覆盖同屏，先看信号，再决定改什么、发到哪里。',
      flow: ['发现信号', '分派责任', '配置调整', '统一发布'],
      tabs: [
        { id: 'today', label: '今日指挥', icon: 'grid', pages: [page('workbench', '今日指挥')] },
        { id: 'insight', label: '经营洞察', icon: 'chart', pages: [page('g-insights', '经营洞察'), page('g-depth', '模块复盘'), page('rpt-report', '报表与口径')] },
        { id: 'release', label: '发布与影响', icon: 'send', pages: [page('cmd-publish', '发布中心'), page('g-impact', '变更影响'), page('g-coverage', '前端功能地图')] }
      ]
    },
    customer: {
      id: 'customer', route: 'fuse-customer', label: '客户', title: '客户中心',
      en: 'CUSTOMER / ONE PROFILE', grp: 'v.ops',
      sub: '一个客户只出现一次；档案、服务、健康、权益、订单与全部使用痕迹在同一屏聚合。',
      flow: ['识别客户', '查看关系', '推进服务', '完成履约'],
      tabs: [
        { id: 'person', label: '客户 360', icon: 'users', pages: [
          page('crm-360', '客户总览与 360'),
          page('crm-hub', '旧客户总览', true),
          page('crm-customer', '全渠道客户', true)
        ] },
        { id: 'trade', label: '交易与订单', icon: 'file', pages: [
          page('trd-orders', '订单中心'),
          page('trd-order', '订单详情', true),
          page('v-claims', '领奖订单'),
          page('v-exchanges', '积分兑换')
        ] },
        { id: 'booking', label: '预约与履约', icon: 'calendar', pages: [
          page('v-fulfill', '履约工作台'),
          page('e-bookings', '预约订单'),
          page('trd-sla', '超时与升级'),
          page('trd-slots', '时段与占号'),
          page('trd-capacity', '排班与产能')
        ] },
        { id: 'settle', label: '结算', icon: 'chart', pages: [
          page('trd-settle', '结算与对账'),
          page('trd-diff', '结算差异'),
          page('trd-refund', '退款与冲销'),
          page('trd-invoice', '开票与回款')
        ] },
        { id: 'org', label: '企业与账号', icon: 'building', pages: [
          page('e-orgs', '企业与权益'),
          page('g-accounts', '客户账号')
        ] }
      ]
    },
    catalog: {
      id: 'catalog', route: 'fuse-catalog', label: '商品', title: '商品中心',
      en: 'CATALOG / PRODUCT OS', grp: 'e.services',
      sub: '服务、实物、价格、库存、履约与端上详情共用一套商品化结构，卖什么、怎么卖、谁来履约都在这里。',
      flow: ['建商品', '定价格', '配履约', '投渠道'],
      tabs: [
        { id: 'services', label: '服务目录', icon: 'package', pages: [
          page('svc-catalog', '服务商品'),
          page('svc-detail', '商品详情', true),
          page('svc-360', '服务 360')
        ] },
        { id: 'goods', label: '实物商品', icon: 'gift', pages: [page('svc-goods', '实物商品')] },
        { id: 'pricing', label: '价格与履约', icon: 'sliders', pages: [
          page('svc-pricing', '价格与政策'),
          page('svc-bundles', '服务包与组合'),
          page('trd-stock', '库存与预留'),
          page('g-orgs', '服务机构'),
          page('e-booking', '预约设置')
        ] },
        { id: 'surface', label: '端上服务', icon: 'phone', pages: [
          page('e-services', '职工端服务详情'),
          page('e-dashboard', '服务概览')
        ] }
      ]
    },
    health: {
      id: 'health', route: 'fuse-health', label: '健管', title: '健康管理',
      en: 'HEALTH / CARE LOOP', grp: 'v.ops',
      sub: '从一次体检或服务开始，沿建档、分层、计划、随访、干预到结果评估形成一条不断档的管理链路。',
      flow: ['建档分层', '生成计划', '执行随访', '结果复盘'],
      tabs: [
        { id: 'workbench', label: '健康工作台', icon: 'user', pages: [
          page('h-profiles', '健康档案'),
          page('h-overview', '管理总览'),
          page('h-risk', '风险与缺口')
        ] },
        { id: 'service', label: '服务履约', icon: 'stethoscope', pages: [page('h-service-flow', '健康服务履约台')] },
        { id: 'plan', label: '计划与随访', icon: 'clock', pages: [
          page('h-plans', '管理计划'),
          page('h-followups', '随访工作台'),
          page('h-programs', '干预项目')
        ] },
        { id: 'result', label: '结果与报告', icon: 'chart', pages: [
          page('h-outcomes', '结果评估'),
          page('h-enterprise', '企业健康报告')
        ] }
      ]
    },
    program: {
      id: 'program', route: 'fuse-program', label: '项目', title: '项目中心',
      en: 'PROGRAM / FIVE-GOOD + CAMP', grp: 'v.ops',
      sub: '五好生活与减重营共用会员、任务、内容、规则、订单与报告能力；五好生活作为主推产品持续做深。',
      flow: ['评估入组', '任务执行', '教练审核', '报告续约'],
      tabs: [
        { id: 'five', label: '五好生活', icon: 'spark', pages: [
          page('fg-overview', '五好生活'),
          page('fg-members', '会员运营'),
          page('fg-report', '月度报告'),
          page('fg-loop', '运营闭环')
        ] },
        { id: 'five-content', label: '内容与转化', icon: 'heart', pages: [
          page('fg-eat', '吃好 · 食谱'),
          page('fg-sleep', '睡好 · 睡眠'),
          page('fg-move', '动好 · 运动'),
          page('fg-mind', '心好 · 心理'),
          page('fg-check', '查好 · 体检'),
          page('fg-meal', '餐次配置'),
          page('fg-version', '食谱版本'),
          page('fg-convert', '食谱转化'),
          page('fg-ab', 'A/B 实验'),
          page('fg-survey', '评估问卷'),
          page('fg-reco', '推荐规则')
        ] },
        { id: 'five-members', label: '会员与任务', icon: 'users', pages: [
          page('fg-tasks', '任务与发布'),
          page('fg-coach', '打卡审核'),
          page('fg-escalation', '信号与升级'),
          page('fg-privacy', '授权与隐私'),
          page('fg-config', '评分与权重')
        ] },
        { id: 'camp', label: '减重营', icon: 'activity', pages: [
          page('v-dashboard', '运营概览'),
          page('v-camps', '营期管理'),
          page('v-students', '学员管理'),
          page('v-student-detail', '学员详情', true),
          page('v-records', '打卡记录'),
          page('v-annotations', '批注工作台'),
          page('v-attendance', '出勤看板'),
          page('v-content', '活动与课程'),
          page('v-messages', '消息与公告'),
          page('v-accounts', '账号管理'),
          page('v-activities', '活动与入口')
        ] },
        { id: 'camp-rules', label: '规则与报告', icon: 'target', pages: [
          page('v-rules', '打卡规则'),
          page('v-points-rules', '积分规则'),
          page('v-metrics', '健康指标库'),
          page('v-questionnaire', '入营问卷'),
          page('v-tiers', '连续打卡奖励'),
          page('v-products', '积分商城'),
          page('v-badges', '徽章体系'),
          page('v-ranking', '排行榜'),
          page('v-stats', '营期统计'),
          page('v-report', '结营报告'),
          page('v-enterprise', '企业健康报告'),
          page('v-supervisor', '督导总览')
        ] }
      ]
    },
    growth: {
      id: 'growth', route: 'fuse-content', label: '内容', title: '内容中心',
      en: 'CONTENT / THREE SURFACES', grp: 'b.content',
      sub: '品牌站、职工端与公共内容素材共用一个内容底座；改一次内容，可以精确投放到需要它的 H5。',
      flow: ['创建内容', '选择投放端', '配置入口', '发布观察'],
      tabs: [
        { id: 'brand', label: '品牌站', icon: 'layout', pages: [
          page('b-dashboard', '门户概览'),
          page('b-home', '首页内容'),
          page('content-banners', '轮播与开屏'),
          page('b-hospitals', '分院网络'),
          page('b-departments', '学科与科室'),
          page('b-team', '师资团队'),
          page('b-camp', '健康营展示页'),
          page('b-about', '品牌页'),
          page('b-site', '站点设置')
        ] },
        { id: 'employee', label: '职工端', icon: 'stethoscope', pages: [
          page('e-site', '站点设置'),
          page('e-modules', '模块与分类'),
          page('e-content', '内容与科普'),
          page('e-qa', '深度问答')
        ] },
        { id: 'assets', label: '内容与素材', icon: 'image', pages: [
          page('g-content', '内容中心'),
          page('media-lib', '图片素材库'),
          page('g-brand', '品牌与主体'),
          page('g-theme', '主题与入口')
        ] },
        { id: 'channels', label: '渠道与入口', icon: 'link', pages: [
          page('chn-map', '渠道图谱'),
          page('chn-channels', '渠道入口')
        ] }
      ]
    },
    platform: {
      id: 'platform', route: 'fuse-platform', label: '平台', title: '平台中心',
      en: 'PLATFORM / SHARED FOUNDATION', grp: 'shared.content',
      sub: '公共资源、权益、规则、模板、关系治理、权限与发布审计集中在这里，后续新增 H5 直接复用。',
      flow: ['沉淀公共资源', '建立关联', '授权与治理', '发布与审计'],
      tabs: [
        { id: 'commons', label: '公共资源', icon: 'link', pages: [
          page('lib-assets', '共享资产库'),
          page('lib-benefits', '权益与券'),
          page('lib-rules', '规则模板'),
          page('lib-templates', '项目模板'),
          page('g-graph', '关系图谱'),
          page('g-gaps', '关联缺口')
        ] },
        { id: 'access', label: '权限与设置', icon: 'lock', pages: [
          page('g-roles', '角色与权限'),
          page('g-fields', '字段级权限'),
          page('s-settings', '系统设置')
        ] },
        { id: 'release', label: '发布与日志', icon: 'send', pages: [
          page('s-publish', '发布中心'),
          page('s-logs', '操作日志')
        ] }
      ]
    }
  };

  const ALIAS = {
    'crm-hub': 'fuse-customer', 'crm-customer': 'fuse-customer',
    'hub-customer': 'fuse-customer', 'hub-customer-trade': 'fuse-customer', 'hub-customer-settle': 'fuse-customer',
    'hub-catalog': 'fuse-catalog', 'hub-catalog-fulfill': 'fuse-catalog',
    'hub-health': 'fuse-health',
    'hub-fivegood': 'fuse-program', 'hub-camp': 'fuse-program', 'hub-program-rules': 'fuse-program', 'hub-program-report': 'fuse-program',
    'hub-content-brand': 'fuse-content', 'hub-content-employee': 'fuse-content', 'hub-content-assets': 'fuse-content',
    'hub-platform-commons': 'fuse-platform', 'hub-platform-access': 'fuse-platform',
    'hub-command-insight': 'fuse-command'
  };

  const state = {};
  const ROUTE_ROOM = {};
  Object.keys(AREAS).forEach((room) => {
    const def = AREAS[room];
    ROUTE_ROOM[def.route] = room;
    def.tabs.forEach((tab) => tab.pages.forEach((p) => { ROUTE_ROOM[p.route] = room; }));
  });
  const roomOf = (route) => {
    if (ROUTE_ROOM[route]) return ROUTE_ROOM[route];
    const alias = ALIAS[route];
    if (alias) {
      const def = Object.keys(AREAS).find((room) => AREAS[room].route === alias);
      return def || null;
    }
    return null;
  };
  Object.keys(ALIAS).forEach((route) => { ROUTE_ROOM[route] = roomOf(ALIAS[route]); });
  const ownerOf = (route) => {
    const room = roomOf(route);
    return room ? AREAS[room].route : null;
  };
  const pageOf = (room, route) => {
    const def = AREAS[room];
    for (const tab of def.tabs) {
      const found = tab.pages.find((p) => p.route === route);
      if (found) return { tab: tab, page: found };
    }
    return null;
  };
  const firstOfTab = (tab) => (tab.pages.find((p) => !p.hidden) || tab.pages[0]).route;
  const stateOf = (room) => {
    if (!state[room]) {
      const def = AREAS[room];
      state[room] = { tab: def.tabs[0].id, view: firstOfTab(def.tabs[0]), ctx: {} };
    }
    return state[room];
  };

  function activate(route, ctx) {
    const room = roomOf(route);
    if (!room) return false;
    const def = AREAS[room];
    const st = stateOf(room);
    const found = pageOf(room, route);
    if (found) {
      st.tab = found.tab.id;
      st.view = found.page.route;
      st.ctx = ctx || {};
    } else {
      st.tab = def.tabs[0].id;
      st.view = firstOfTab(def.tabs[0]);
      st.ctx = ctx || {};
    }
    return true;
  }

  function reset(room, ctx) {
    const def = AREAS[room];
    if (!def) return;
    state[room] = { tab: def.tabs[0].id, view: firstOfTab(def.tabs[0]), ctx: ctx || {} };
  }

  function proxyAction(name, d) {
    const owner = ownerOf(window.App && App.route);
    if (!owner) return false;
    const room = roomOf(owner);
    const st = stateOf(room);
    const target = PAGES[st.view];
    if (!target || !target.actions || !target.actions[name]) return false;
    target.actions[name](d || {}, null);
    return true;
  }

  function actionTab(d) {
    const room = roomOf(App.route);
    const def = AREAS[room];
    const tab = def.tabs.find((t) => t.id === d.id);
    if (!tab) return;
    App.go(firstOfTab(tab), {});
  }

  function actionView(d) {
    if (!PAGES[d.id]) return;
    App.go(d.id, {});
  }

  function navCount(room) {
    const db = Store.db;
    if (room === 'command') return Store.dirtyCount || null;
    if (room === 'customer') {
      const n = ((db.employee && db.employee.bookings) || []).filter((b) => b.status === 'pending').length;
      return n || null;
    }
    if (room === 'health') {
      const n = ((db.health && db.health.followups) || []).filter((f) => f.status === 'due' || f.status === 'overdue').length;
      return n || null;
    }
    if (room === 'program') {
      const check = ((db.fivegood && db.fivegood.checkins) || []).filter((c) => c.status === 'pending').length;
      const note = (((db.versionall || {}).records || {}).exercise || []).filter((r) => !r.comments || !r.comments.length).length;
      return (check + note) || null;
    }
    if (room === 'catalog') {
      const n = ((db.supplements || []).filter((g) => !g.stock).length);
      return n || null;
    }
    return null;
  }

  function renderView(route, ctx) {
    const target = PAGES[route];
    if (!target) return '<div class="empty"><b>页面不可用</b>该业务视图未注册。</div>';
    const previous = window.__FUSION_EMBED__;
    window.__FUSION_EMBED__ = true;
    try {
      const html = target.render(ctx || {});
      return (window.__FUSION_VIEWS__ && html.indexOf('fv-views') < 0
        ? '<div class="fusion-viewbar">' + window.__FUSION_VIEWS__ + '</div>' + html
        : html);
    } catch (e) {
      console.error(e);
      return '<div class="empty"><b>视图加载失败</b>' + E(target.title || route) + ' 的配置可能不兼容。<br>请刷新或清理本地缓存后重试。</div>';
    } finally {
      window.__FUSION_EMBED__ = previous;
    }
  }

  function renderArea(room) {
    const def = AREAS[room];
    const st = stateOf(room);
    let tab = def.tabs.find((t) => t.id === st.tab) || def.tabs[0];
    if (!tab.pages.some((p) => p.route === st.view)) {
      tab = def.tabs.find((t) => t.pages.some((p) => p.route === st.view)) || tab;
      st.tab = tab.id;
      st.view = firstOfTab(tab);
    }
    const visiblePages = tab.pages.filter((p) => !p.hidden);
    const activePage = PAGES[st.view] || {};
    const views = visiblePages.length > 1
      ? '<div class="fv-views">' + visiblePages.map((p) => '<button class="' + (p.route === st.view ? 'on' : '') + '" data-act="fView" data-id="' + p.route + '">' + E(p.label) + '</button>').join('') + '</div>'
      : '';
    const flows = def.flow.map((x, i) => '<span' + (i === def.flow.length - 1 ? ' class="end"' : '') + '><i>' + String(i + 1).padStart(2, '0') + '</i>' + E(x) + '</span>').join('');
    window.__FUSION_VIEWS__ = views;
    return '<header class="fusion-head">' +
        '<div class="fusion-head-main"><div class="fusion-eyebrow">' + E(def.en) + '</div>' +
          '<h1>' + E(def.title) + '</h1><p>' + E(def.sub) + '</p></div>' +
        '<div class="fusion-head-side"><div class="fusion-flow">' + flows + '</div>' +
          '<div class="fusion-meta"><span>' + def.tabs.length + ' 个业务域</span><span>' + def.tabs.reduce((n, t) => n + t.pages.filter((p) => !p.hidden).length, 0) + ' 个配置视图</span><span>统一权限 · 统一发布</span></div></div>' +
      '</header>' +
      '<nav class="fusion-tabs" aria-label="' + E(def.title) + '业务域">' +
        def.tabs.map((t) => '<button class="' + (t.id === tab.id ? 'on' : '') + '" data-act="fTab" data-id="' + t.id + '">' +
          I(t.icon, 15) + '<span>' + E(t.label) + '</span><em>' + t.pages.filter((p) => !p.hidden).length + '</em></button>').join('') +
      '</nav>' +
      '<div class="fusion-view" data-fusion-view="' + E(st.view) + '">' + renderView(st.view, st.ctx) + '</div>';
  }

  const sharedActions = {
    fTab(d) { actionTab(d); },
    fView(d) { actionView(d); },
    fReset() {
      const room = roomOf(App.route);
      if (room) { reset(room, {}); App.refresh(); }
    }
  };

  function mirrorPage(route, target, opts) {
    const src = PAGES[target];
    if (!src) return;
    opts = opts || {};
    const actions = {};
    Object.keys(src.actions || {}).forEach((name) => { actions[name] = (d) => src.actions[name](d || {}); });
    P[route] = {
      app: opts.app || src.app,
      grp: opts.grp || src.grp,
      title: opts.title || src.title,
      sub: opts.sub || src.sub,
      hideNav: true,
      render(ctx) { return PAGES[target].render(ctx || {}); },
      actions: actions
    };
  }

  mirrorPage('cmd-publish', 's-publish', { grp: 'v.report', title: '发布中心', sub: '同一套发布闸门，从指挥中心进入时仍留在指挥中心。' });

  Object.keys(AREAS).forEach((room) => {
    const def = AREAS[room];
    P[def.route] = {
      app: 'all', grp: def.grp, title: def.title, sub: def.sub,
      render() { return renderArea(room); },
      actions: Object.assign({}, sharedActions)
    };
  });

  window.Fusion = {
    AREAS: AREAS,
    roomOf: roomOf,
    ownerOf: ownerOf,
    activate: activate,
    reset: reset,
    action: proxyAction,
    navCount: navCount,
    tabOf(room) {
      const def = AREAS[room];
      if (!def) return null;
      const st = stateOf(room);
      return def.tabs.find((t) => t.id === st.tab) || def.tabs[0] || null;
    },
    snapshot() { return JSON.parse(JSON.stringify(state)); },
    restore(snap) {
      Object.keys(state).forEach((k) => { delete state[k]; });
      Object.keys(snap || {}).forEach((k) => { state[k] = snap[k]; });
    },
    current() {
      const room = roomOf(App.route);
      return room ? stateOf(room) : null;
    }
  };
})();
