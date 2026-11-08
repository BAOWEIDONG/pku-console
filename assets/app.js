/* ============================================================================
   Console shell v3 — 融合导航、权限门禁、线上实况预览
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;

  /* ---------------------------------------------------------- 路由 → 权限模块 */
  const G = {
    workbench: 'v.ops',
    'g-coverage': 'v.report',
    'g-insights': 'v.report',
    'g-impact': 'logs',
    'chn-map': 'shared.content',
    'crm-360': 'v.ops',
    'v-dashboard': 'v.ops', 'v-camps': 'v.ops', 'v-students': 'v.ops', 'v-student-detail': 'v.ops',
    'v-records': 'v.ops', 'v-annotations': 'v.ops', 'v-attendance': 'v.ops', 'v-content': 'v.ops', 'v-messages': 'v.ops',
    'v-rules': 'v.rules', 'v-points-rules': 'v.rules', 'v-metrics': 'v.rules', 'v-questionnaire': 'v.rules', 'v-activities': 'v.rules',
    'v-accounts': 'v.ops', 'fg-meal': 'v.rules',
    'v-tiers': 'v.incentive', 'v-products': 'v.incentive', 'v-badges': 'v.incentive',
    'v-claims': 'v.fulfill', 'v-exchanges': 'v.fulfill', 'v-fulfill': 'v.fulfill',
    'v-stats': 'v.report', 'v-ranking': 'v.report', 'v-report': 'v.report', 'v-enterprise': 'v.report', 'v-supervisor': 'v.report',
    'b-home': 'b.content', 'b-about': 'b.content', 'b-camp': 'b.content',
    'b-hospitals': 'shared.orgs', 'b-departments': 'b.team', 'b-team': 'b.team', 'b-site': 'shared.theme',
    'e-services': 'e.services', 'e-modules': 'e.services', 'e-orgs': 'e.services', 'e-dashboard': 'e.services',
    'e-booking': 'e.booking', 'e-bookings': 'e.booking',
    'e-content': 'e.content', 'e-qa': 'e.content', 'e-site': 'shared.theme',
    's-publish': 'publish', 's-logs': 'logs', 's-settings': 'roles', workbench: 'v.ops',
    'lib-assets': 'shared.content', 'lib-messages': 'shared.content', 'lib-journeys': 'shared.content',
    'lib-benefits': 'shared.content', 'lib-rules': 'v.rules', 'lib-templates': 'v.ops',
    'g-graph': 'shared.content', 'g-gaps': 'shared.content', 'g-depth': 'v.report', 'svc-360': 'e.services',
    'content-banners': 'shared.content', 'media-lib': 'shared.content', 'feature-map': 'v.report',
    'h-overview': 'v.ops', 'h-service-flow': 'e.services', 'h-profiles': 'v.ops', 'h-risk': 'v.ops',
    'h-plans': 'v.ops', 'h-followups': 'v.ops', 'h-programs': 'v.ops', 'h-outcomes': 'v.report', 'h-enterprise': 'v.report',
    'fg-members': 'v.ops', 'fg-tasks': 'v.rules', 'fg-coach': 'v.ops', 'fg-escalation': 'v.ops',
    'fg-privacy': 'v.report', 'fg-loop': 'v.report'
  };
  const groupOf = (route) => G[route] || (PAGES[route] && PAGES[route].grp) || 'v.ops';

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
    { id: 'command', label: '指挥', en: 'COMMAND', icon: 'grid', dot: '#7CB6FF', home: 'workbench', desc: '实时经营 · 待办 · 发布状态' },
    { id: 'growth', label: '增长', en: 'GROWTH', icon: 'spark', dot: '#48D3C7', home: 'chn-map', desc: '渠道 · 内容 · 触点编排' },
    { id: 'catalog', label: '商品', en: 'CATALOG', icon: 'package', dot: '#8FB8FF', home: 'svc-catalog', desc: '服务 · 价格 · 履约能力' },
    { id: 'customer', label: '交易', en: 'TRADE', icon: 'file', dot: '#F0B45E', home: 'trd-orders', desc: '订单 · 预约 · 结算 · 客户' },
    { id: 'health', label: '健管', en: 'HEALTH', icon: 'stethoscope', dot: '#7FE6D8', home: 'h-overview', desc: '服务履约 · 风险 · 计划 · 随访 · 结果' },
    { id: 'program', label: '项目', en: 'PROGRAM', icon: 'layers', dot: '#B7A6FF', home: 'fg-overview', desc: '五好生活 · 减重营 · 激励' },
    { id: 'shared', label: '共享', en: 'SHARED', icon: 'link', dot: '#48D3C7', home: 'lib-assets', desc: '资产 · 触达 · 权益 · 规则' },
    { id: 'insight', label: '洞察', en: 'INSIGHT', icon: 'chart', dot: '#6FE3A8', home: 'g-insights', desc: '经营 · 覆盖 · 健康结果' },
    { id: 'platform', label: '平台', en: 'PLATFORM', icon: 'settings', dot: '#A6B7CE', home: 's-publish', desc: '发布 · 影响 · 权限 · 审计' }
  ];

  const NAV_OF = {
    command: [
      { group: '今天', items: [
        { id: 'workbench', label: '指挥中心', icon: 'grid' },
        { id: 'g-impact', label: '改动影响检查', icon: 'activity' },
        { id: 's-publish', label: '发布中心', icon: 'send' }
      ] },
      { group: '快速进入', items: [
        { id: 'chn-map', label: '渠道图谱', icon: 'layers' },
        { id: 'g-coverage', label: '前端功能地图', icon: 'target' },
        { id: 'crm-360', label: '客户 360', icon: 'user' },
        { id: 'v-dashboard', label: '减重营概览', icon: 'activity' }
      ] }
    ],
    growth: [
      { group: '触点', items: [
        { id: 'chn-map', label: '渠道图谱', icon: 'layers' },
        { id: 'chn-channels', label: '渠道与触点', icon: 'link' }
      ] },
      { group: '品牌站', items: [
        { id: 'b-home', label: '首页内容', icon: 'layout' },
        { id: 'content-banners', label: '轮播与开屏', icon: 'image' },
        { id: 'b-hospitals', label: '分院网络', icon: 'hospital' },
        { id: 'b-departments', label: '学科与科室', icon: 'layers' },
        { id: 'b-team', label: '师资团队', icon: 'stethoscope' },
        { id: 'b-camp', label: '健康营展示页', icon: 'spark' },
        { id: 'b-about', label: '品牌页', icon: 'file' }
      ] },
      { group: '职工端', items: [
        { id: 'e-site', label: '站点设置', icon: 'sliders' },
        { id: 'e-modules', label: '模块与分类', icon: 'grid' },
        { id: 'e-content', label: '内容与科普', icon: 'video' },
        { id: 'e-qa', label: '深度问答', icon: 'message' },
        { id: 'b-site', label: '站点设置', icon: 'settings' }
      ] },
      { group: '内容资产', items: [
        { id: 'g-content', label: '内容中心', icon: 'file' },
        { id: 'media-lib', label: '图片素材库', icon: 'image' },
        { id: 'msg-center', label: '触达中心', icon: 'send' },
        { id: 'g-brand', label: '品牌与主体', icon: 'spark' },
        { id: 'g-theme', label: '主题与入口', icon: 'sliders' }
      ] }
    ],
    catalog: [
      { group: '服务商品', items: [
        { id: 'svc-catalog', label: '服务目录', icon: 'package' },
        { id: 'svc-360', label: '服务 360', icon: 'stethoscope' },
        { id: 'svc-goods', label: '实物商品', icon: 'gift' },
        { id: 'trd-stock', label: '库存与预留', icon: 'layers' }
      ] },
      { group: '价格与组合', items: [
        { id: 'svc-pricing', label: '价格与政策', icon: 'target' },
        { id: 'svc-bundles', label: '服务包与组合', icon: 'layers' }
      ] },
      { group: '履约能力', items: [
        { id: 'e-services', label: '职工端服务', icon: 'stethoscope' },
        { id: 'g-orgs', label: '服务机构', icon: 'hospital' },
        { id: 'e-booking', label: '预约设置', icon: 'calendar' }
      ] }
    ],
    customer: [
      { group: '交易', items: [
        { id: 'trd-orders', label: '订单中心', icon: 'file' },
        { id: 'v-claims', label: '领奖订单', icon: 'gift' },
        { id: 'v-exchanges', label: '积分兑换', icon: 'package' }
      ] },
      { group: '履约', items: [
        { id: 'v-fulfill', label: '履约工作台', icon: 'truck' },
        { id: 'e-bookings', label: '预约订单', icon: 'calendar' },
        { id: 'trd-sla', label: '超时与升级', icon: 'clock' },
        { id: 'trd-slots', label: '时段与占号', icon: 'calendar' },
        { id: 'trd-capacity', label: '排班与产能', icon: 'users' }
      ] },
      { group: '结算', items: [
        { id: 'trd-settle', label: '结算与对账', icon: 'chart' },
        { id: 'trd-diff', label: '结算差异', icon: 'x' },
        { id: 'trd-refund', label: '退款与冲销', icon: 'undo' },
        { id: 'trd-invoice', label: '开票与回款', icon: 'file' }
      ] },
      { group: '客户', items: [
        { id: 'crm-360', label: '客户 360', icon: 'user' },
        { id: 'crm-customer', label: '客户台账', icon: 'users' },
        { id: 'e-orgs', label: '企业客户与权益', icon: 'building' },
        { id: 'g-accounts', label: '客户账号', icon: 'lock' }
      ] }
    ],
    health: [
      { group: '总览', items: [
        { id: 'h-overview', label: '健康管理总览', icon: 'grid' }
      ] },
      { group: '服务履约', items: [
        { id: 'h-service-flow', label: '服务履约台', icon: 'stethoscope' }
      ] },
      { group: '健康管理', items: [
        { id: 'h-profiles', label: '健康档案', icon: 'user' },
        { id: 'h-risk', label: '风险与缺口', icon: 'shield' },
        { id: 'h-plans', label: '管理计划', icon: 'target' },
        { id: 'h-followups', label: '随访工作台', icon: 'clock' },
        { id: 'h-programs', label: '干预项目', icon: 'layers' },
        { id: 'h-outcomes', label: '结果评估', icon: 'chart' }
      ] },
      { group: '企业报告', items: [
        { id: 'h-enterprise', label: '企业健康报告', icon: 'building' }
      ] }
    ],
    program: [
      { group: '五好生活', items: [
        { id: 'fg-overview', label: '五好总览', icon: 'spark' },
        { id: 'fg-eat', label: '吃好 · 食谱', icon: 'package' },
        { id: 'fg-sleep', label: '睡好 · 睡眠', icon: 'moon' },
        { id: 'fg-move', label: '动好 · 运动', icon: 'run' },
        { id: 'fg-mind', label: '心好 · 心理', icon: 'heart' },
        { id: 'fg-check', label: '查好 · 体检', icon: 'stethoscope' },
        { id: 'fg-config', label: '评分与权重', icon: 'sliders' },
        { id: 'fg-reco', label: '推荐规则', icon: 'target' },
        { id: 'fg-meal', label: '餐次配置', icon: 'clock' }
      ] },
      { group: '五好 · 内容', items: [
        { id: 'fg-version', label: '食谱版本', icon: 'layers' },
        { id: 'fg-convert', label: '食谱转化', icon: 'chart' },
        { id: 'fg-ab', label: 'A/B 实验', icon: 'activity' },
        { id: 'fg-survey', label: '评估问卷', icon: 'file' },
        { id: 'fg-report', label: '月度报告', icon: 'send' }
      ] },
      { group: '五好 · 运营', items: [
        { id: 'fg-members', label: '会员运营', icon: 'users' },
        { id: 'fg-tasks', label: '任务与发布', icon: 'check' },
        { id: 'fg-coach', label: '打卡审核', icon: 'message' },
        { id: 'fg-escalation', label: '信号与升级', icon: 'activity' },
        { id: 'fg-loop', label: '运营闭环', icon: 'refresh' },
        { id: 'fg-privacy', label: '授权与隐私', icon: 'lock' }
      ] },
      { group: '减重营 · 营期', items: [
        { id: 'v-dashboard', label: '运营概览', icon: 'grid' },
        { id: 'v-camps', label: '营期管理', icon: 'calendar' },
        { id: 'v-students', label: '学员管理', icon: 'users' },
        { id: 'v-records', label: '打卡记录', icon: 'check' },
        { id: 'v-annotations', label: '批注工作台', icon: 'message' },
        { id: 'v-attendance', label: '出勤看板', icon: 'layout' },
        { id: 'v-content', label: '活动与课程', icon: 'video' },
        { id: 'v-messages', label: '消息与公告', icon: 'bell' }
      ] },
      { group: '减重营 · 规则', items: [
        { id: 'v-rules', label: '打卡规则', icon: 'sliders' },
        { id: 'v-points-rules', label: '积分规则', icon: 'target' },
        { id: 'v-metrics', label: '健康指标库', icon: 'activity' },
        { id: 'v-questionnaire', label: '入营问卷', icon: 'file' },
        { id: 'v-accounts', label: '账号管理', icon: 'users' },
        { id: 'v-activities', label: '活动与入口', icon: 'spark' },
        { id: 'v-tiers', label: '连续打卡奖励', icon: 'gift' },
        { id: 'v-products', label: '积分商城', icon: 'package' },
        { id: 'v-badges', label: '徽章体系', icon: 'medal' },
        { id: 'v-ranking', label: '排行榜', icon: 'star' }
      ] },
      { group: '减重营 · 报告', items: [
        { id: 'v-stats', label: '营期统计', icon: 'chart' },
        { id: 'v-report', label: '结营报告', icon: 'file' },
        { id: 'v-enterprise', label: '企业健康报告', icon: 'building' },
        { id: 'v-supervisor', label: '督导总览', icon: 'eye' }
      ] }
    ],
    shared: [
      { group: '共享资产', items: [
        { id: 'lib-assets', label: '资产库', icon: 'image' },
        { id: 'lib-messages', label: '消息模板', icon: 'message' },
        { id: 'lib-journeys', label: '触达旅程', icon: 'send' },
        { id: 'lib-benefits', label: '权益与券', icon: 'gift' },
        { id: 'lib-rules', label: '规则模板', icon: 'sliders' },
        { id: 'lib-templates', label: '项目模板', icon: 'copy' }
      ] },
      { group: '关系治理', items: [
        { id: 'g-graph', label: '关系图谱', icon: 'layers' },
        { id: 'g-gaps', label: '关联缺口', icon: 'target' }
      ] }
    ],
    insight: [
      { group: '经营', items: [
        { id: 'g-insights', label: '经营洞察', icon: 'chart' },
        { id: 'g-depth', label: '模块复盘', icon: 'target' },
        { id: 'g-coverage', label: '前端功能地图', icon: 'target' },
        { id: 'rpt-report', label: '报表与口径', icon: 'file' }
      ] },
      { group: '渠道分析', items: [
        { id: 'b-dashboard', label: '品牌站数据', icon: 'activity' },
        { id: 'e-dashboard', label: '职工健康数据', icon: 'activity' },
        { id: 'v-stats', label: '营期统计', icon: 'chart' }
      ] },
      { group: '结果报告', items: [
        { id: 'v-report', label: '结营报告', icon: 'file' },
        { id: 'v-enterprise', label: '企业健康报告', icon: 'building' },
        { id: 'v-supervisor', label: '督导总览', icon: 'eye' }
      ] }
    ],
    platform: [
      { group: '交付', items: [
        { id: 's-publish', label: '发布中心', icon: 'send' },
        { id: 'g-impact', label: '变更影响', icon: 'activity' },
        { id: 's-logs', label: '操作日志', icon: 'clock' }
      ] },
      { group: '治理', items: [
        { id: 'g-roles', label: '角色与权限', icon: 'lock' },
        { id: 'g-fields', label: '字段级权限', icon: 'eye' },
        { id: 's-settings', label: '系统设置', icon: 'settings' }
      ] }
    ]
  };

  const ROUTE_WB = {};
  Object.keys(NAV_OF).forEach((wb) => NAV_OF[wb].forEach((g) => g.items.forEach((it) => { ROUTE_WB[it.id] = wb; })));
  ROUTE_WB.workbench = 'command';
  ROUTE_WB['g-impact'] = 'platform';
  ROUTE_WB['g-coverage'] = 'insight';
  ROUTE_WB['g-insights'] = 'insight';
  const wbOf = (route) => ROUTE_WB[route] || 'command';

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
    route: 'workbench', ctx: {}, app: 'command', openGroups: {},
    previewOpen: false, previewMode: 'live',
    previewApp: 'pku', previewScreen: 'pku-home', previewCtx: {},
    history: [], autoMocked: false, origin: null, navOpen: false
  };

  function currentPage() { return PAGES[state.route] || PAGES.workbench; }

  /* ---------------------------------------------------------- rail + contextual nav */
  function railDockHTML() {
    const role = Store.role;
    return '<div class="dock-brand" title="北大医疗 · 超级运营中台">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>' +
      '</div>' +
      '<nav class="dock-nav">' + WORKBENCHES.map((a) =>
        '<button data-app="' + a.id + '" class="' + (a.id === state.app ? 'on' : '') + '" title="' + a.label + '" aria-label="' + a.label + '">' +
          I(a.icon, 20) + '<span class="dock-tip">' + a.label + '</span><i class="dock-dot" style="background:' + a.dot + '"></i>' +
        '</button>').join('') + '</nav>' +
      '<div class="dock-bottom">' +
        '<button data-act="cmd" title="搜索">' + I('search', 19) + '<span class="dock-tip">搜索 ⌘K</span></button>' +
        '<button data-act="notify" title="通知" class="has-dot">' + I('bell', 19) + '</button>' +
        '<button data-act="roleMenu" class="dock-user" title="' + E(role.name) + '">' + E(role.name.slice(0, 1)) + '</button>' +
      '</div>';
  }

  function subnavHTML() {
    const space = WORKBENCHES.find((x) => x.id === state.app) || WORKBENCHES[0];
    const nav = NAV_OF[state.app] || NAV_OF.platform;
    const navOpen = state.openGroups[state.app] || nav.map((g) => g.group || '_top');
    return '<div class="subnav-head"><div class="subnav-eyebrow">' + E(space.en) + ' · 工作区</div>' +
        '<button class="space-switch" data-act="spaceMenu" title="切换工作区">' +
          '<span class="sp-dot" style="background:' + space.dot + '"></span>' +
          '<b>' + E(space.label) + '</b>' + I('down', 13) + '</button>' +
        '<div class="sp-desc">' + E(space.desc) + '</div>' +
        '<button class="subnav-new" data-act="quickNew">' + I('plus', 14) + '新建</button></div>' +
      '<div class="subnav-search" data-act="cmd">' + I('search', 14) + '<span>搜索 ' + E(space.label) + ' 内页面</span><kbd>⌘K</kbd></div>' +
      '<nav class="nav">' + nav.map((g) => {
        const items = g.items.filter((it) => visible(it.id));
        if (!items.length) return '';
        const key = g.group || '_top';
        const cl = g.group ? navOpen.indexOf(key) < 0 : false;
        return '<div class="navgrp ' + (cl ? 'collapsed' : '') + '">' +
          (g.group ? '<button class="navgrp-h" data-collapse="' + key + '">' + E(g.group) +
            '<span class="navgrp-n">' + items.length + '</span>' +
            '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="margin-left:auto;opacity:.45;transition:transform .18s;' + (cl ? 'transform:rotate(-90deg)' : '') + '"><path d="m6 9 6 6 6-6"/></svg></button>' : '') +
          items.map((it) => {
            const cnt = navCount(it.id);
            const lvl = Store.can(groupOf(it.id), 2);
            return '<button class="navitem ' + (it.id === state.route ? 'on' : '') + '" data-nav="' + it.id + '" title="' + E(it.label) + '">' +
              I(it.icon, 16) + '<span>' + E(it.label) + '</span>' +
              (cnt ? '<span class="count ' + (it.hot ? 'hot' : '') + '">' + cnt + '</span>' : '') +
              (lvl ? '' : '<span class="nav-ro">只读</span>') + '</button>';
          }).join('') + '</div>';
      }).join('') + '</nav>' +
      '<div class="subnav-foot">' +
        '<div class="subnav-sync"><span class="' + (Store.dirtyCount ? 'warn' : 'ok') + '"></span>' +
          '<div><b>' + (Store.dirtyCount ? Store.dirtyCount + ' 项待发布' : '全部已同步') + '</b><em>v' + Store.db.meta.version + ' · ' + Store.db.meta.publishedAt.slice(5) + '</em></div>' +
          '<button data-act="goPublish" title="发布中心">' + I('chevron', 13) + '</button></div>' +
      '</div>';
  }
  function dot(c) { return c === 'green' ? '#0aa39a' : c === 'violet' ? '#8b7cf6' : c === 'amber' ? '#c8871a' : c === 'grey' ? '#94a7c0' : '#3f8cff'; }
  function navCount(route) {
    if (route === 'v-annotations') return Store.db.versionall.records.exercise.filter((r) => !r.comments || !r.comments.length).length;
    if (route === 'v-claims') return Store.db.versionall.claims.filter((c) => c.status === 'pending').length;
    if (route === 'e-bookings') return Store.db.employee.bookings.filter((b) => b.status === 'pending').length;
    if (route === 'h-followups') return Store.db.health.followups.filter((f) => f.status === 'due' || f.status === 'overdue').length || null;
    if (route === 'fg-coach') return Store.db.fivegood.checkins.filter((c) => c.status === 'pending').length || null;
    if (route === 's-publish') return Store.dirtyCount || null;
    if (route === 'g-gaps' && window.V6) return V6.scanGaps().length || null;
    return null;
  }

  /* ---------------------------------------------------------- topbar */
  function topbarHTML() {
    const page = currentPage();
    const wb = WORKBENCHES.find((x) => x.id === state.app) || WORKBENCHES[0];
    const dirty = Store.dirtyCount;
    return '<div class="tb-left"><button class="tb-menu" data-act="toggleNav" title="展开菜单" aria-label="展开菜单">' +
        '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
      '<button class="tb-back" data-act="back" title="返回">' + I('chevron', 15) + '</button>' +
      (state.route === 'workbench' ? '' : '<button class="tb-home" data-act="home">' + I('grid', 14) + '<span>指挥中心</span></button>') +
      '<div class="crumb"><span class="crumb-space"><i style="background:' + wb.dot + '"></i>' + E(wb.label) + '</span>' +
      '<span class="sep">/</span><b>' + E(page.title || '') + '</b>' +
      (state.origin && state.origin.route !== state.route ? '<button class="tb-restore" data-act="restore">' + I('undo', 11) + '回到 ' + E(state.origin.label) + '</button>' : '') +
      (Store.role.perms === 'ALL' ? '' : '<span class="pill grey">' + E(Store.role.name) + '</span>') + '</div></div>' +
      '<div class="top-actions">' +
      '<button class="searchbtn" data-act="cmd"><span class="sb-ic">' + I('search', 15) + '</span><span>搜索页面、客户、服务、订单</span><kbd>⌘K</kbd></button>' +
      '<span class="tb-live"><i></i>3 端在线</span>' +
      (dirty ? '<button class="tb-dirty" data-act="goPublish"><i></i>' + dirty + ' 项待发布</button>' : '') +
      (page.preview ? '<button class="iconbtn" data-act="togglePreview" title="实时预览" style="' + (state.previewOpen ? 'background:var(--brand-wash);color:var(--brand)' : '') + '">' + I('eye', 17) + '</button>' : '') +
      '<button class="tb-publish" data-act="publish"' + (Store.canPublish ? '' : ' disabled title="当前角色无发布权限"') + '>' + I('send', 14) + '发布</button>' +
      '<button class="tb-user" data-act="roleMenu"><span class="ava">' + E(Store.role.name.slice(0, 1)) + '</span>' +
      '<span class="tb-user-t">' + E(Store.role.name) + '</span>' + I('down', 11) + '</button>' +
      '</div>';
  }

  /* ---------------------------------------------------------- 工作区切换面板 */
  function openSpaceMenu() {
    document.querySelectorAll('.space-menu, .space-menu-mask').forEach((x) => x.remove());
    const mask = document.createElement('div');
    mask.className = 'space-menu-mask';
    const box = document.createElement('div');
    box.className = 'space-menu';
    box.innerHTML =
      '<div class="space-menu-h"><div><h3>切换工作区</h3><p>每个工作区是一组职责相近的后台页面；页面说明会告诉你改完影响哪一端。</p></div>' +
        '<button class="iconbtn" data-space-close>' + I('x', 16) + '</button></div>' +
      '<div class="space-grid">' + WORKBENCHES.map((w) =>
        '<button class="space-card ' + (w.id === state.app ? 'on' : '') + '" data-space="' + w.id + '">' +
          '<span class="sp-ic" style="background:' + w.dot + ';color:#07223f">' + I(w.icon, 17) + '</span>' +
          '<span><b>' + E(w.label) + (w.id === state.app ? ' · 当前' : '') + '</b><span>' + E(w.desc) + '</span></span>' +
        '</button>').join('') + '</div>' +
      '<div class="row" style="margin-top:12px;justify-content:space-between">' +
        '<span class="small mut">找不到页面时，用 ⌘K 搜页面名；或在「前端功能地图」里按 H5 找。</span>' +
        '<button class="btn sm" data-space-map>' + I('target', 13) + '前端功能地图</button></div>';
    document.body.appendChild(mask);
    document.body.appendChild(box);
    const close = () => { mask.remove(); box.remove(); };
    mask.addEventListener('click', close);
    box.querySelector('[data-space-close]').addEventListener('click', close);
    box.querySelector('[data-space-map]').addEventListener('click', () => { close(); App.go('g-coverage'); });
    box.querySelectorAll('[data-space]').forEach((b) => b.addEventListener('click', () => {
      const def = WORKBENCHES.find((w) => w.id === b.dataset.space);
      close();
      if (def) App.go(def.home);
    }));
  }

  /* ---------------------------------------------------------- dock */
  function previewDockHTML() {
    if (!state.previewOpen) return '';
    const meta = ROUTE_META(state.route);
    if (!meta.preview) return '';
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
      '<div class="nav-scrim" data-act="toggleNav"></div>' +
      '<div class="shell"><aside class="bdock" aria-label="工作区">' + railDockHTML() + '</aside>' +
      '<aside class="subnav" aria-label="模块导航">' + subnavHTML() + '</aside><div class="main">' +
      '<header class="topbar">' + topbarHTML() + '</header>' +
      '<div class="canvas ' + (state.previewOpen ? 'has-dock' : '') + '">' +
      '<div class="scrollarea scroll"><div class="page ' + (readonly ? 'readonly' : '') + '">' +
      (readonly ? '<div class="readonly-bar">' + I('lock', 14) + '<b>' + E(Store.role.name) + '</b> 对该模块仅有查看权限，编辑与发布已关闭' +
        '<button class="btn sm" data-act="switchSuper" style="margin-left:auto">切换为超级管理员</button></div>' : '') +
      safeRender(page, state.ctx) + '</div></div>' +
      previewDockHTML() + '</div></div></div>';
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
    go(route, ctx, opts) {
      if (!PAGES[route]) return;
      if (!visible(route)) { UI.toast('当前角色无权访问该模块'); return; }
      opts = opts || {};
      const from = { route: state.route, ctx: state.ctx, app: state.app, origin: state.origin };
      state.history.push(from);
      if (state.history.length > 30) state.history.shift();
      if (route === 'workbench') { state.app = 'command'; state.origin = null; }
      const targetApp = wbOf(route);
      const inNav = route === 'workbench' ||
        (NAV_OF[state.app] || []).some((g) => g.items.some((it) => it.id === route));
      if (targetApp !== state.app && !inNav && !opts.keepApp) {
        state.origin = { route: from.route, app: from.app, label: (PAGES[from.route] || {}).title || '上一页' };
        state.app = targetApp;
      } else if (targetApp === state.app) {
        state.origin = null;
      }
      state.route = route;
      state.ctx = ctx || {};
      state.navOpen = false;
      document.body.classList.remove('nav-open');
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
      if (prev.app) state.app = prev.app;
      state.origin = prev.origin || null;
      location.hash = '#/' + prev.route; render();
    },
    refresh(keep) { render(keep); },
    get route() { return state.route; },
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
      const imp = window.V5 ? V5.impactOf(dirty) : { channels: [], pages: [] };
      const gates = window.V5 ? V5.gatesFor(dirty) : [];
      const bad = gates.filter((g) => !g.ok);
      const list = Object.keys(groups).map((app) =>
        '<div style="margin-bottom:12px"><div class="row" style="gap:7px;margin-bottom:6px">' +
        '<span class="pill ' + (app === 'versionall' ? 'blue' : app === 'pku' ? 'green' : app === 'employee' ? 'amber' : 'grey') + '">' +
        (APPS[app] ? APPS[app].name : '跨端') + '</span><span class="small mut">' + groups[app].length + ' 项</span></div>' +
        '<div class="diff">' + groups[app].slice(0, 6).map((d) => '<div><span class="add">+</span> ' + E(d.label) + ' <span class="mut">' + E(d.path) + '</span></div>').join('') +
        (groups[app].length > 8 ? '<div class="mut">… 另有 ' + (groups[app].length - 8) + ' 项</div>' : '') + '</div></div>').join('');
      UI.modal({
        wide: true,
        title: bad.length ? '发布前需修复 ' + bad.length + ' 项' : '发布 ' + dirty.length + ' 项变更',
        desc: bad.length ? '阻断项未通过，发布按钮已锁定' : '影响 ' + imp.channels.length + ' 个渠道 / ' + imp.pages.length + ' 个页面 · 发布后 1 分钟内生效',
        body: '<div class="stack" style="gap:14px">' +
          UI.fInput({ label: '发布说明', value: note || '', ph: '如 第 7 期奖励档位调整' }) +
          '<div class="pub-impact"><div class="pub-impact-h">' + I('activity', 14) + '影响面</div>' +
            '<div class="pub-chips">' + (imp.channels.length ? imp.channels.map((c) => '<span class="pill ' + (c === 'pku' ? 'green' : c === 'employee' ? 'amber' : 'blue') + '">' + (APPS[c] ? APPS[c].name : c) + '</span>').join('') : '<span class="small mut">跨端配置</span>') +
            imp.pages.map((p) => '<span class="pub-chip">' + E(p) + '</span>').join('') + '</div></div>' +
          list +
          '<div class="pub-gates">' + gates.map((g) => '<div class="' + (g.ok ? 'ok' : 'bad') + '">' + I(g.ok ? 'check' : 'x', 13) + '<span>' + E(g.k) + '</span><em>' + E(g.d) + '</em></div>').join('') + '</div>' +
          '<div class="note warn">发布后三个 H5 会在 1 分钟内拉取新的渠道配置；已产生的订单与领取记录不受影响。</div></div>',
        okText: bad.length ? '请先修复阻断项' : '确认发布',
        onOk(n) {
          if (bad.length) { UI.toast('存在阻断项，无法发布', 'warn'); return false; }
          const v = (n.querySelector('.input') || {}).value || note || '日常配置更新';
          const r = Store.publish(v);
          UI.toast('已发布 ' + r.count + ' 项变更');
          const token = localStorage.getItem('pku-gh-token');
          if (token) {
            UI.toast('正在把配置推送到三端…');
            App.pushConfig(token)
              .then(() => UI.toast('配置已推送，三个 H5 将在 1 分钟内生效'))
              .catch((e) => UI.toast('本地已发布，推送失败：' + e.message, 'warn'));
          }
          setTimeout(() => App.refresh(true), 60);
        }
      });
    },

    quickNew() {
      const acts = [
        { t: '新增服务', d: 'SPU + 价格 + 渠道 + 素材', go: 'svc-catalog', ic: 'package' },
        { t: '新建营期', d: '排期、容量、责任营养师', go: 'v-camps', ic: 'calendar' },
        { t: '新增内容', d: '品牌站 / 职工端 / 减重营', go: 'g-content', ic: 'image' },
        { t: '新建企业权益', d: '企业、人数、权益包', go: 'e-orgs', ic: 'building' },
        { t: '新建触达', d: '短信 / 企微 / 站内信', go: 'msg-center', ic: 'send' },
        { t: '新增奖励', d: '连续打卡 / 积分 / 徽章', go: 'v-tiers', ic: 'gift' },
        { t: '上传共享资产', d: '图片 / 视频 / FAQ / 话术', go: 'lib-assets', ic: 'image' },
        { t: '发放权益', d: '体检 / EAP / 门诊 / 商城券', go: 'lib-benefits', ic: 'gift' },
        { t: '从模板建项目', d: '营期 / 五好 / 体检季', go: 'lib-templates', ic: 'copy' }
      ];
      UI.modal({
        title: '新建', desc: '选择一个业务对象开始',
        body: '<div class="quicknew">' + acts.map((a) =>
          '<button data-qn="' + a.go + '"><span>' + I(a.ic, 17) + '</span><div><b>' + a.t + '</b><em>' + a.d + '</em></div>' + I('chevron', 13) + '</button>').join('') + '</div>',
        footer: false
      });
      setTimeout(() => {
        document.querySelectorAll('[data-qn]').forEach((b) => b.addEventListener('click', () => {
          UI.closeOverlay(); App.go(b.dataset.qn);
        }));
      }, 30);
    },

    cmdOpen() {
      const items = [];
      Object.keys(PAGES).forEach((r) => {
        const p = PAGES[r];
        if (p.hideNav || !visible(r)) return;
        items.push({ route: r, title: p.title, app: p.app || 'all', sub: p.sub || '', kind: '页面' });
      });
      const db = Store.db;
      (db.employee.services || []).slice(0, 40).forEach((s) => items.push({ route: 'e-services', title: s.name, sub: '服务 · ' + s.cat + ' · ' + s.status, kind: '服务' }));
      (db.versionall.students || []).forEach((s) => items.push({ route: 'v-students', title: s.name, sub: '学员 · ' + (s.status === 'active' ? '在营' : s.status), kind: '学员' }));
      (db.employee.bookings || []).slice(0, 20).forEach((b) => items.push({ route: 'e-bookings', title: b.service + ' · ' + b.person, sub: '预约 · ' + b.date + ' · ' + b.status, kind: '预约' }));
      (db.versionall.camps || []).forEach((c) => items.push({ route: 'v-camps', title: c.name, sub: '营期 · ' + c.status, kind: '营期' }));
      items.push({ route: 'workbench', title: '发布所有待发布变更', sub: '操作', kind: '操作' });
      let sel = 0, filtered = items;
      const n = document.createElement('div');
      n.className = 'cmdk';
      n.innerHTML = '<div class="cmdk-in">' + I('search', 17) + '<input placeholder="搜索页面、服务、学员、预约或操作…" autofocus><kbd>ESC</kbd></div>' +
        '<div class="cmdk-tip"><span>↑↓ 选择</span><span>↵ 打开</span><span>⌘K 随时唤起</span></div><div class="cmdk-list"></div>';
      const listEl = n.querySelector('.cmdk-list'), input = n.querySelector('input');
      function paint() {
        const q = input.value.trim().toLowerCase();
        filtered = items.filter((i) => !q || (i.title + i.sub + i.route + i.kind).toLowerCase().indexOf(q) >= 0).slice(0, 40);
        listEl.innerHTML = filtered.length ? filtered.map((i, k) =>
          '<button class="cmdk-i ' + (k === sel ? 'sel' : '') + '" data-r="' + i.route + '">' + I('chevron', 14) +
          '<span class="cmdk-kind">' + E(i.kind) + '</span><span>' + E(i.title) + '</span><span class="k">' + E(i.sub || '') + '</span></button>').join('')
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
      channelPages: db.channelPages,
      brandSite: {
        home: db.brand.home,
        institutions: (db.brand.institutions || []).map((i) => ({ id: i.id, name: i.name, city: i.city, address: i.address, phone: i.phone, on: i.on })),
        doctors: (db.brand.doctors || []).map((d) => ({ id: d.id, name: d.name, title: d.title, dept: d.dept, on: d.on }))
      },
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
        rankingOn: db.versionall.rankingOn,
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
      title: '连接 GitHub 并推送配置', desc: '三端 H5 启动时会读取同一份 config.json，令牌只保存在本机',
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
      const cur = state.openGroups[state.app] ||
        [((NAV_OF[state.app] || []).find((g) => g.items.some((it) => it.id === state.route)) || {}).group || '_top'];
      const idx = cur.indexOf(k);
      if (idx >= 0) cur.splice(idx, 1); else cur.push(k);
      if (!cur.length) cur.push(k);
      state.openGroups[state.app] = cur.slice();
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
      if (window.V5) {
        const imp = V5.impactOf([{ path: path }]);
        if (imp.pages.length) UI.toast('已标记待发布 · 影响 ' + imp.pages.length + ' 个页面（' + imp.pages.slice(0, 2).join('、') + '）');
      }
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
    if (name === 'cmd') { App.cmdOpen(); return; }
    if (name === 'back') { App.back(); return; }
    if (name === 'home') { App.go('workbench', null, { keepApp: true }); return; }
    if (name === 'toggleNav') {
      state.navOpen = !state.navOpen;
      document.body.classList.toggle('nav-open', state.navOpen);
      return;
    }
    if (name === 'spaceMenu') { openSpaceMenu(); return; }
    if (name === 'restore') {
      const o = state.origin;
      if (!o) return;
      state.history.push({ route: state.route, ctx: state.ctx, app: state.app, origin: state.origin });
      state.route = o.route; state.app = o.app; state.origin = null; state.ctx = {};
      location.hash = '#/' + o.route; render(); return;
    }
    if (name === 'quickNew') { App.quickNew(); return; }
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
  if (window.V6) V6.ensure();
  if (window.V7) V7.ensure();
  if (window.V8) V8.ensure();
  // 主题色注入
  try {
    const p = Store.db.shared.theme.primary;
    if (p) document.documentElement.style.setProperty('--brand', p);
  } catch (e) {}
  parseHash();
  render();
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (h && PAGES[h] && h !== state.route) {
      state.route = h;
      const inNav = h === 'workbench' || (NAV_OF[state.app] || []).some((g) => g.items.some((it) => it.id === h));
      if (!inNav) state.app = wbOf(h);
      render();
    }
  });
})();
