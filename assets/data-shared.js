/* ============================================================================
   跨端共享配置 + 角色权限（融合层）
   同一份配置被三个 H5 同时消费；改动一处，三端可见。
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SEED;

  S.shared = {
    brand: {
      name: '北大医疗',
      full: '北大医疗产业集团',
      slogan: '让优质医疗 触手可及',
      intro: '以北京大学国际医院为核心，覆盖综合、康复、专科与健康管理的医疗服务网络。',
      logoText: '北大医疗',
      primary: '#0B63E5',
      accent: '#0AA39A',
      englishName: 'PKU HEALTHCARE'
    },
    contact: {
      servicePhone: '400-820-8866',
      hotline: '010-6900 6688',
      email: 'service@pkuhealthcare.com',
      address: '北京市昌平区生命科学园路 1 号',
      workHours: '08:00 – 17:30（周一至周五）',
      complaint: '400-820-8899'
    },
    theme: {
      primary: '#0B63E5',
      accent: '#0AA39A',
      employeeWarm: true,
      radius: 18,
      fontScale: 100
    },
    entries: [
      { id: 'en1', app: 'pku', label: '分院网络', path: 'hospitals.html', on: true },
      { id: 'en2', app: 'pku', label: '学科科室', path: 'department.html', on: true },
      { id: 'en3', app: 'pku', label: '师资团队', path: 'team.html', on: true },
      { id: 'en4', app: 'pku', label: '健康营', path: 'camp.html', on: true },
      { id: 'en5', app: 'employee', label: '年度体检', path: 'annual-exam', on: true },
      { id: 'en6', app: 'employee', label: '五高共管', path: 'fivehigh', on: true },
      { id: 'en7', app: 'employee', label: 'EAP', path: 'eap', on: true },
      { id: 'en8', app: 'versionall', label: '连续打卡', path: 'reward', on: true },
      { id: 'en9', app: 'versionall', label: '积分商城', path: 'points-mall', on: true }
    ],
    contents: [
      { id: 'c1', type: 'banner', title: '年度体检预约开启', sub: '11 月 30 日前完成，享检后报告解读', apps: ['employee'], on: true, order: 1, start: '2026-11-01', end: '2026-11-30', views: 8421, tone: 'blue' },
      { id: 'c2', type: 'banner', title: '北医健康营第 7 期招募', sub: '28 天代谢重塑，专家团队全程陪跑', apps: ['pku', 'versionall'], on: true, order: 1, start: '2026-10-01', end: '2026-12-31', views: 12640, tone: 'teal' },
      { id: 'c3', type: 'banner', title: '五高一重共管计划', sub: '12 周健康管家全程跟进', apps: ['employee'], on: true, order: 2, start: '2026-09-15', end: '2026-12-31', views: 5233, tone: 'violet' },
      { id: 'c4', type: 'notice', title: '第 3 周体测安排', sub: '本周六 9:00–11:00 健康管理中心，请提前 8 小时禁食', apps: ['versionall'], on: true, start: '2026-11-05', end: '2026-11-08', views: 2210, tone: 'amber' },
      { id: 'c5', type: 'notice', title: '系统维护通知', sub: '11 月 10 日 00:00–02:00 预约服务暂停', apps: ['employee', 'pku'], on: false, start: '2026-11-09', end: '2026-11-10', views: 0, tone: 'grey' },
      { id: 'c6', type: 'article', title: '晨峰血压：早上偏高要紧吗', sub: '心血管内科 · 阅读 2,310', apps: ['employee', 'pku'], on: true, start: '2026-11-02', end: '2027-11-02', views: 2310, tone: 'blue' },
      { id: 'c7', type: 'article', title: '体检报告里的结节，先别慌', sub: '健康管理中心 · 阅读 1,876', apps: ['employee', 'pku'], on: true, start: '2026-10-28', end: '2027-10-28', views: 1876, tone: 'teal' }
    ]
  };

  // 机构投放端：同一家医院可同时出现在品牌站、职工端预约、健康营履约
  S.brand.institutions.forEach(function (i, k) {
    i.platforms = k < 3 ? ['brand', 'employee', 'camp'] : (k % 2 ? ['brand', 'employee'] : ['brand']);
    i.bookable = k < 3;
    i.campSite = k < 2;
  });

  S.rbac = {
    current: 'super',
    roles: [
      {
        id: 'super', name: '超级管理员', desc: '全部模块的查看、编辑与发布权限', color: 'blue', builtin: true,
        perms: 'ALL', members: 2
      },
      {
        id: 'ops', name: '运营负责人', desc: '三端运营与内容，可发布；不涉及角色权限', color: 'violet',
        perms: { 'shared.brand': 3, 'shared.content': 3, 'shared.orgs': 3, 'shared.theme': 3, accounts: 2, roles: 0, 'v.ops': 3, 'v.rules': 3, 'v.incentive': 3, 'v.fulfill': 3, 'v.report': 3, 'b.content': 2, 'b.team': 2, 'e.services': 2, 'e.booking': 2, 'e.content': 2, publish: 3, logs: 2 }
      },
      {
        id: 'diet', name: '营养师', desc: '看营期与学员，写批注与结营报告', color: 'green',
        perms: { 'v.ops': 1, 'v.rules': 1, 'v.incentive': 1, 'v.fulfill': 1, 'v.report': 2, 'shared.content': 1 }
      },
      {
        id: 'coach', name: '教练', desc: '运动记录批注与课程内容', color: 'amber',
        perms: { 'v.ops': 1, 'v.report': 1, 'shared.content': 1 }
      },
      {
        id: 'brand', name: '品牌运营', desc: '品牌站、跨端内容与机构信息', color: 'blue',
        perms: { 'shared.brand': 3, 'shared.content': 3, 'shared.orgs': 3, 'shared.theme': 3, 'b.content': 3, 'b.team': 3, 'e.content': 2, publish: 3, logs: 1 }
      },
      {
        id: 'hr', name: '企业 HR', desc: '查看职工健康服务与预约数据', color: 'grey',
        perms: { 'e.services': 1, 'e.booking': 1, 'e.content': 1, 'shared.orgs': 1, 'v.report': 1 }
      },
      {
        id: 'audit', name: '审计（只读）', desc: '全平台只读，可导出', color: 'grey',
        perms: { 'shared.brand': 1, 'shared.content': 1, 'shared.orgs': 1, 'shared.theme': 1, accounts: 1, 'v.ops': 1, 'v.rules': 1, 'v.incentive': 1, 'v.fulfill': 1, 'v.report': 1, 'b.content': 1, 'b.team': 1, 'e.services': 1, 'e.booking': 1, 'e.content': 1, logs: 1 }
      }
    ],
    members: [
      { id: 'm1', name: '孙敏', phone: '138****0001', dept: '运营中心', roles: ['super'], status: 'active', last: '2026-11-06 09:12' },
      { id: 'm2', name: '王雪', phone: '138****0002', dept: '营养科', roles: ['diet'], status: 'active', last: '2026-11-06 08:46' },
      { id: 'm3', name: '张楠', phone: '138****0003', dept: '营养科', roles: ['diet'], status: 'active', last: '2026-11-05 19:30' },
      { id: 'm4', name: '刘洋', phone: '139****0005', dept: '康复科', roles: ['coach'], status: 'active', last: '2026-11-06 07:55' },
      { id: 'm5', name: '陈放', phone: '139****0006', dept: '康复科', roles: ['coach'], status: 'active', last: '2026-11-05 20:12' },
      { id: 'm6', name: '张伟', phone: '137****0011', dept: '品牌部', roles: ['brand'], status: 'active', last: '2026-11-04 16:30' },
      { id: 'm7', name: '周琳', phone: '137****0007', dept: '健康管理部', roles: ['ops'], status: 'active', last: '2026-11-03 16:40' },
      { id: 'm8', name: '李静', phone: '135****0021', dept: '客户成功', roles: ['hr'], status: 'active', last: '2026-11-02 10:05' },
      { id: 'm9', name: '赵敏', phone: '136****0032', dept: '内审', roles: ['audit'], status: 'paused', last: '2026-10-28 14:12' }
    ]
  };

  /* 模块台账：权限矩阵与影响面共用 */
  S.shared.groups = [
    { key: 'shared.brand', label: '品牌与主体', scope: 'all', desc: '品牌名、slogan、联系方式' },
    { key: 'shared.content', label: '跨端内容', scope: 'all', desc: 'Banner / 公告 / 资讯的统一下发' },
    { key: 'shared.orgs', label: '服务机构', scope: 'all', desc: '医院院区与投放端' },
    { key: 'shared.theme', label: '主题与入口', scope: 'all', desc: '品牌色、字号、三端入口' },
    { key: 'accounts', label: '账号', scope: 'all', desc: '跨端统一账号与身份' },
    { key: 'roles', label: '角色与权限', scope: 'all', desc: '角色权限矩阵与成员' },
    { key: 'v.ops', label: '营期与人员', scope: 'versionall' },
    { key: 'v.rules', label: '规则与指标', scope: 'versionall' },
    { key: 'v.incentive', label: '激励与商品', scope: 'versionall' },
    { key: 'v.fulfill', label: '履约', scope: 'versionall' },
    { key: 'v.report', label: '数据与报告', scope: 'versionall' },
    { key: 'b.content', label: '品牌站页面', scope: 'pku' },
    { key: 'b.team', label: '师资与科室', scope: 'pku' },
    { key: 'e.services', label: '服务目录', scope: 'employee' },
    { key: 'e.booking', label: '预约', scope: 'employee' },
    { key: 'e.content', label: '内容与问答', scope: 'employee' },
    { key: 'publish', label: '发布上线', scope: 'all' },
    { key: 'logs', label: '操作日志', scope: 'all' }
  ];

  /* 影响面：路径前缀 → 受影响的前端页面 */
  S.shared.impact = {
    'shared.brand': ['品牌站 · 首页首屏', '品牌站 · 关于页', '职工端 · 服务页头部', '学员端 · 消息落款'],
    'shared.contact': ['品牌站 · 页脚与联系', '职工端 · 客服入口', '学员端 · 帮助中心'],
    'shared.content': ['三端对应投放位'],
    'shared.orgs': ['品牌站 · 分院网络', '职工端 · 预约机构', '健康营 · 履历医院'],
    'shared.theme': ['三端全局配色与入口'],
    'accounts': ['三端登录与可见范围'],
    'roles': ['控制台可见功能'],
    'v.ops': ['学员端首页 / 打卡 / 奖励'],
    'v.rules': ['学员端打卡页与积分'],
    'v.incentive': ['学员端奖励页 / 积分商城'],
    'v.fulfill': ['订单状态与物流'],
    'v.report': ['结营报告 / 企业报告'],
    'b.content': ['品牌站页面'],
    'b.team': ['品牌站师资与科室页'],
    'e.services': ['职工端服务目录与详情'],
    'e.booking': ['职工端预约表单'],
    'e.content': ['职工端 Banner / 发现 / 问答']
  };
})();
