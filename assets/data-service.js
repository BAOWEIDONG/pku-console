/* ============================================================================
   服务商品化：SPU / SKU / 价格政策 / 履约规则 / 素材 / 渠道 / 服务包
   以及「五好生活」产品模型
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SEED;

  let seed = 77;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  /* ---------------------------------------------------------------- 渠道 */
  S.channels = [
    { id: 'h5-brand', name: '品牌站 H5', type: 'h5', audience: '公众获客', entry: 'https://baoweidong.github.io/PKU-introduce/mobile.html', theme: '北医蓝', on: true, owner: '品牌部', hits: 124000, svcScope: '对外可售' },
    { id: 'h5-employee', name: '职工健康 H5', type: 'h5', audience: '企业员工', entry: 'https://baoweidong.github.io/pku-employee-health/', theme: '暖橙', on: true, owner: '健康管理部', hits: 68300, svcScope: '权益内' },
    { id: 'h5-camp', name: '减重营 H5', type: 'h5', audience: '营期学员', entry: 'https://baoweidong.github.io/versionall/', theme: '浅色卡片', on: true, owner: '运营中心', hits: 21400, svcScope: '营期内' },
    { id: 'wxwork', name: '企业微信工作台', type: 'miniapp', audience: '企业员工', entry: 'wxwork://pku-health', theme: '跟随企微', on: true, owner: '客户成功', hits: 45100, svcScope: '权益内' },
    { id: 'web', name: '官网 PC', type: 'web', audience: '公众获客', entry: 'https://www.pkuhealthcare.com', theme: '北医蓝', on: true, owner: '品牌部', hits: 30800, svcScope: '对外可售' },
    { id: 'xhs', name: '小红书企业号', type: 'social', audience: '公众获客', entry: '', theme: '—', on: false, owner: '品牌部', hits: 0, svcScope: '内容种草' }
  ];

  const CAT = { screen: '健康筛查', chronic: '慢病管理', medical: '就医服务', special: '特色服务', safety: '应急保障' };
  const VERSION = ['标准版', '深度版', '企业版'];

  S.employee.services.forEach(function (s, i) {
    const list = s.price || (1200 + Math.floor(rnd() * 60) * 100);
    const cost = Math.round(list * (0.38 + rnd() * 0.16) / 10) * 10;
    const settle = Math.round(list * (0.72 + rnd() * 0.1) / 10) * 10;
    s.code = 'SVC-' + String(1001 + i);
    s.cat = CAT[s.mod] || '其他';
    s.owner = s.mod === 'chronic' ? '健康管理部' : s.mod === 'medical' ? '就医服务中心' : s.mod === 'special' ? '客户成功部' : '健康管理中心';
    s.channels = s.mod === 'screen' ? ['h5-brand', 'h5-employee', 'web']
      : s.mod === 'chronic' ? ['h5-employee', 'wxwork', 'h5-camp']
      : s.mod === 'special' ? ['h5-brand', 'h5-employee']
      : s.mod === 'safety' ? ['web', 'wxwork'] : ['h5-employee'];
    s.pricing = [
      { id: 'base', name: '标准版', cost: cost, settle: settle, list: list, contract: Math.round(settle * 0.92 / 10) * 10, tax: 6, unit: '次', validity: 365, times: 1 },
      { id: 'deep', name: '深度版', cost: Math.round(cost * 1.6 / 10) * 10, settle: Math.round(settle * 1.5 / 10) * 10, list: Math.round(list * 1.45 / 10) * 10, contract: Math.round(settle * 1.35 / 10) * 10, tax: 6, unit: '次', validity: 365, times: 1 },
      { id: 'ent', name: '企业版', cost: Math.round(cost * 2.2 / 10) * 10, settle: Math.round(settle * 1.9 / 10) * 10, list: Math.round(list * 1.8 / 10) * 10, contract: Math.round(settle * 1.7 / 10) * 10, tax: 6, unit: '人/年', validity: 365, times: 1 }
    ];
    s.rules = {
      leadDays: s.mod === 'screen' ? 1 : 2,
      maxDays: 14,
      cancelHours: 24,
      noShow: '爽约 2 次自动冻结预约 30 天',
      refund: s.mod === 'screen' ? '体检前 48 小时可全额退' : '未履约可全额退，已履约按次结算',
      validity: 365,
      notes: [s.mod === 'screen' ? '需空腹项目请提前 8 小时禁食' : '首次服务前需完成健康问卷', '未成年人需监护人陪同']
    };
    s.assets = {
      cover: '主视觉 1080×608',
      gallery: ['详情长图 1', '详情长图 2', '流程图'],
      video: s.mod === 'chronic' || s.mod === 'special',
      faq: [
        { q: '需要提前预约吗？', a: '需要，最早可约次日起，最远 14 天。' },
        { q: '可以开票吗？', a: '支持增值税普通发票，结算后 5 个工作日内开具。' }
      ]
    };
    s.updatedAt = '2026-11-0' + (1 + (i % 7)) + ' 10:2' + (i % 9);
    s.status = i % 9 === 4 ? 'draft' : 'online';
    s.margin = Math.round((s.pricing[0].settle - s.pricing[0].cost) / s.pricing[0].settle * 100);
  });

  /* 服务包：把单品组合成可售套餐 */
  S.bundles = [
    { id: 'b1', name: '五好生活 · 年度会员', code: 'PKG-FG-01', type: 'bundle', status: 'online', price: 6980, settle: 5200, cost: 3140, audience: '企业员工 / 个人', svcCount: 5, sold: 186, owner: '健康管理部', desc: '吃好、睡好、动好、心好、查好，一年期全维度健康管理会员。' },
    { id: 'b2', name: '职工年度体检 + 检后管理', code: 'PKG-SCR-02', type: 'bundle', status: 'online', price: 1680, settle: 1280, cost: 720, audience: '企业团检', svcCount: 3, sold: 742, owner: '健康管理中心', desc: '体检 + 报告解读 + 异常复查转诊，企业团检主力包。' },
    { id: 'b3', name: '五高一重 · 12 周共管', code: 'PKG-CHR-03', type: 'bundle', status: 'online', price: 4980, settle: 3980, cost: 2140, audience: '高风险人群', svcCount: 4, sold: 231, owner: '健康管理部', desc: '评估 + 12 周干预 + 复测 + 结营报告。' },
    { id: 'b4', name: '企业家尊享年度', code: 'PKG-VIP-04', type: 'bundle', status: 'draft', price: 28800, settle: 23800, cost: 14600, audience: '企业家 / 高管', svcCount: 7, sold: 0, owner: '客户成功部', desc: '专属管家 + 深度体检 + 全球就医协助。' }
  ];

  /* ------------------------------------------------------- 五好生活模型 */
  S.fivegood = {
    program: {
      name: '五好生活',
      slogan: '吃好 · 睡好 · 动好 · 心好 · 查好',
      status: 'beta',
      cycle: 'annual',
      launch: '2027-01-01',
      owner: '健康管理部',
      intro: '把一年拆成 12 个可执行的健康动作，用五个维度持续打分，让员工看得见自己在变好。'
    },
    dims: [
      { key: 'eat', name: '吃好', icon: '🥗', color: '#0aa39a', weight: 25, metric: '膳食结构达标天数', target: 240, benefit: '营养评估 1 次 + 月度方案 12 次', tasks: 12 },
      { key: 'sleep', name: '睡好', icon: '🌙', color: '#6b5ce0', weight: 20, metric: '睡眠时长 ≥7h 天数', target: 200, benefit: '睡眠评估 2 次 + 改善计划', tasks: 8 },
      { key: 'move', name: '动好', icon: '🏃', color: '#0b63e5', weight: 25, metric: '每周运动 ≥150 分钟周数', target: 40, benefit: '体测 4 次 + 运动处方 12 周', tasks: 12 },
      { key: 'mind', name: '心好', icon: '💬', color: '#c8871a', weight: 15, metric: '压力自评达标月数', target: 10, benefit: 'EAP 咨询 6 次 + 压力评估', tasks: 6 },
      { key: 'check', name: '查好', icon: '🩺', color: '#d9503f', weight: 15, metric: '完成年度体检与复测', target: 2, benefit: '年度体检 1 次 + 报告解读 2 次', tasks: 2 }
    ],
    tiers: [
      { id: 'fg-base', name: '基础版', price: 3980, settle: 2880, cost: 1640, benefits: '五维评估 + 12 次月度任务 + 年度报告', target: '全员普惠' },
      { id: 'fg-plus', name: '进阶版', price: 6980, settle: 5200, cost: 3140, benefits: '基础版 + 营养师月度 1v1 + 体测 4 次', target: '高风险人群' },
      { id: 'fg-pro', name: '尊享版', price: 12800, settle: 9800, cost: 6200, benefits: '进阶版 + 专属健康管家 + EAP 6 次 + 深度体检', target: '高管 / 核心人才' }
    ],
    tasks: [
      { id: 't1', dim: 'eat', week: 1, title: '记录 3 天饮食并标注主食', type: '打卡', points: 10, on: true },
      { id: 't2', dim: 'eat', week: 2, title: '把 1 餐精制主食换成杂粮', type: '打卡', points: 10, on: true },
      { id: 't3', dim: 'sleep', week: 1, title: '连续 5 天 23:30 前入睡', type: '打卡', points: 10, on: true },
      { id: 't4', dim: 'move', week: 1, title: '完成 3 次 30 分钟中等强度运动', type: '打卡', points: 15, on: true },
      { id: 't5', dim: 'move', week: 2, title: '尝试 1 种新运动', type: '打卡', points: 15, on: true },
      { id: 't6', dim: 'mind', week: 1, title: '完成一次压力自评', type: '评估', points: 10, on: true },
      { id: 't7', dim: 'check', week: 12, title: '完成年度体检预约', type: '动作', points: 20, on: true },
      { id: 't8', dim: 'eat', week: 3, title: '一周外卖不超过 3 次', type: '打卡', points: 10, on: false }
    ],
    members: [
      { id: 'fm1', name: '林悦', tier: '进阶版', company: '示例科技', dims: { eat: 82, sleep: 64, move: 88, mind: 70, check: 100 }, score: 80.4, joined: '2026-03-01', status: 'active' },
      { id: 'fm2', name: '陈嘉禾', tier: '基础版', company: '示例科技', dims: { eat: 61, sleep: 72, move: 45, mind: 66, check: 100 }, score: 65.1, joined: '2026-05-12', status: 'active' },
      { id: 'fm3', name: '周雯', tier: '尊享版', company: '示例科技', dims: { eat: 90, sleep: 86, move: 78, mind: 88, check: 100 }, score: 87.6, joined: '2026-01-08', status: 'active' },
      { id: 'fm4', name: '徐一鸣', tier: '进阶版', company: '示例科技', dims: { eat: 55, sleep: 48, move: 60, mind: 52, check: 50 }, score: 53.6, joined: '2026-06-20', status: 'risk' },
      { id: 'fm5', name: '何雨桐', tier: '基础版', company: '示例科技', dims: { eat: 74, sleep: 70, move: 66, mind: 74, check: 100 }, score: 75.2, joined: '2026-08-02', status: 'active' },
      { id: 'fm6', name: '赵启明', tier: '进阶版', company: '示例科技', dims: { eat: 68, sleep: 58, move: 72, mind: 60, check: 100 }, score: 69.8, joined: '2026-04-15', status: 'paused' }
    ],
    scoreRule: { base: 60, excellent: 85, pass: 70, reportCycle: 'month' }
  };

  /* -------------------------------------------------------- 结算与合作方 */
  S.settle = {
    partners: [
      { id: 'p1', name: '示例科技有限公司', type: '企业客户', plan: '按人次结算', credit: 60, used: 428600, limit: 900000, cycle: '月结 30 天' },
      { id: 'p2', name: '北京某银行工会', type: '工会采购', plan: '打包年费', credit: 45, used: 186000, limit: 300000, cycle: '季结 45 天' },
      { id: 'p3', name: '某保险TPA', type: '渠道合作', plan: '按服务品类分润', credit: 30, used: 96200, limit: 500000, cycle: '月结 15 天' }
    ],
    records: [
      { id: 'ST2026110001', partner: '示例科技有限公司', period: '2026-10', orders: 326, amount: 428600, settleAmount: 312400, margin: 27.1, status: 'pending', due: '2026-11-30' },
      { id: 'ST2026100002', partner: '北京某银行工会', period: '2026-10', orders: 112, amount: 186000, settleAmount: 139400, margin: 25.1, status: 'invoiced', due: '2026-12-15' },
      { id: 'ST2026090003', partner: '某保险TPA', period: '2026-09', orders: 84, amount: 96200, settleAmount: 71400, margin: 25.8, status: 'settled', due: '2026-10-15' }
    ]
  };

  S.price = { needApproval: true, floorGuard: true, tierDiscount: false };
  S.settle.byHead = true; S.settle.warn = true; S.settle.auto = false;

  /* 订单统一索引：预约 / 兑换 / 领奖 */
  S.orderIndex = { updated: '2026-11-08 09:00' };
})();
