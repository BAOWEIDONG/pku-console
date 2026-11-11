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
    { id: 'h5-brand', name: '品牌站 H5', type: 'h5', audience: '公众访问', entry: 'https://baoweidong.github.io/PKU-introduce/mobile.html', theme: '北医蓝', on: true, owner: '品牌部', hits: 124000, svcScope: '对外可售' },
    { id: 'h5-employee', name: '职工健康 H5', type: 'h5', audience: '企业员工', entry: 'https://baoweidong.github.io/pku-employee-health/', theme: '暖橙', on: true, owner: '健康管理部', hits: 68300, svcScope: '权益内' },
    { id: 'h5-camp', name: '减重营 H5', type: 'h5', audience: '营期学员', entry: 'https://baoweidong.github.io/versionall/', theme: '浅色卡片', on: true, owner: '运营中心', hits: 21400, svcScope: '营期内' },
    { id: 'web', name: '官网 PC', type: 'web', audience: '公众访问', entry: 'https://www.pkuhealthcare.com', theme: '北医蓝', on: true, owner: '品牌部', hits: 30800, svcScope: '对外可售' }
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
      : s.mod === 'chronic' ? ['h5-employee', 'h5-camp']
      : s.mod === 'special' ? ['h5-brand', 'h5-employee']
      : s.mod === 'safety' ? ['web', 'h5-employee'] : ['h5-employee'];
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
      { id: 'b5', name: '石油医院 · 减重系统（C端版）', code: 'PKG-SYM-01', type: 'bundle', status: 'draft', price: 10000, settle: 10000, cost: 6000, audience: 'C端个人用户', svcCount: 3, sold: 0, owner: '产品部', desc: '基于健康训练营系统去企业营期化：学员/营养师/教练三角色，保留积分商城，35 项 P0 功能。' },
      { id: 'b6', name: '石油医院 · 慢病五高版', code: 'PKG-SYM-02', type: 'bundle', status: 'draft', price: 10000, settle: 10000, cost: 5500, audience: '五高风险人群', svcCount: 3, sold: 0, owner: '健康管理部', desc: '血压/血糖/血脂/尿酸/同型半胱氨酸五项共管，学员/健康管理师双角色，22 项 P0 功能。' },
      { id: 'b7', name: '石油医院 · 五高一重打包版', code: 'PKG-SYM-03', type: 'bundle', status: 'draft', price: 10000, settle: 10000, cost: 6500, audience: '企业整体采购', svcCount: 4, sold: 0, owner: '产品部', desc: '减重+慢病打包：学员/医师/营养师/教练四角色协作，43 项 P0 功能；AI 功能走后续迭代。' },
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
      { id: 'p2', name: '南城银行', type: '企业客户', plan: '打包年费', credit: 45, used: 810000, limit: 2400000, cycle: '季结 45 天' },
      { id: 'p3', name: '博远制造', type: '企业客户', plan: '按人次结算', credit: 30, used: 642000, limit: 1800000, cycle: '月结 45 天' }
    ],
    records: [
      { id: 'ST2026110001', partner: '示例科技有限公司', period: '2026-10', orders: 326, amount: 428600, settleAmount: 312400, margin: 27.1, status: 'pending', due: '2026-11-30' },
      { id: 'ST2026100002', partner: '南城银行', period: '2026-10', orders: 112, amount: 186000, settleAmount: 139400, margin: 25.1, status: 'invoiced', due: '2026-12-15' },
      { id: 'ST2026090003', partner: '博远制造', period: '2026-09', orders: 84, amount: 96200, settleAmount: 71400, margin: 25.8, status: 'settled', due: '2026-10-15' },
      { id: 'ST2026100004', partner: '海辰医疗', period: '2026-10', orders: 96, amount: 152400, settleAmount: 112800, margin: 26.0, status: 'pending', due: '2026-12-10' },
      { id: 'ST2026100005', partner: '亦庄科技', period: '2026-10', orders: 71, amount: 98600, settleAmount: 73200, margin: 25.7, status: 'pending', due: '2026-11-30' }
    ]
  };

  S.price = { needApproval: true, floorGuard: true, tierDiscount: false };
  S.settle.byHead = true; S.settle.warn = true; S.settle.auto = false;

  /* ------------------------------------------------------ 上下游：甲方 / 乙方 */
  S.upstream = {
    companies: [
      {
        id: 'bc1', name: '示例科技有限公司', short: '示例科技', industry: '互联网 / 科技', employees: 1780, city: '北京 · 海淀',
        contact: '周敏', phone: '138****6621', owner: '王雪', source: 'brand', level: 'A', status: 'active',
        tags: ['年度体检', '慢病管理', '五好生活'], settlePartner: '示例科技有限公司',
        note: '总部与两个研发中心统一采购员工健康福利，重点在体检后管理和五好生活续约。',
        contract: { no: 'HT-2026-001', name: '2026 员工健康福利', start: '2026-01-01', end: '2026-12-31', amount: 1280000, used: 428600, people: 1780, settlement: '月结 30 天', renewal: '2026-12-01', services: ['年度体检', '慢病管理', '五好生活'] }
      },
      {
        id: 'bc2', name: '海辰医疗', short: '海辰医疗', industry: '医疗器械', employees: 860, city: '北京 · 大兴',
        contact: '张曼', phone: '186****0921', owner: '客户成功部', source: 'brand', level: 'A', status: 'renewing',
        tags: ['年度体检', '检后解读'], settlePartner: '海辰医疗',
        note: '体检季集中在 11 月，HR 关注报告解读和异常复查闭环。',
        contract: { no: 'HT-2026-018', name: '年度体检与检后管理', start: '2026-03-01', end: '2027-02-28', amount: 780000, used: 326000, people: 860, settlement: '季结 45 天', renewal: '2026-12-15', services: ['年度体检', '检后解读'] }
      },
      {
        id: 'bc3', name: '亦庄科技', short: '亦庄科技', industry: '智能制造', employees: 1200, city: '北京 · 亦庄',
        contact: '李睿', phone: '139****7710', owner: '张伟', source: 'web', level: 'B', status: 'active',
        tags: ['企业医务室', '急救培训'], settlePartner: '亦庄科技',
        note: '园区医务室与急救培训打包采购，正在评估扩大到职业健康。',
        contract: { no: 'HT-2026-023', name: '园区医务室与急救培训', start: '2026-04-01', end: '2027-03-31', amount: 960000, used: 210000, people: 1200, settlement: '月结 30 天', renewal: '2027-02-01', services: ['企业医务室', '急救培训'] }
      },
      {
        id: 'bc4', name: '青禾资本', short: '青禾资本', industry: '投资 / 金融', employees: 260, city: '北京 · 朝阳',
        contact: '王宁', phone: '137****2048', owner: '客户成功部', source: 'brand', level: 'A', status: 'active',
        tags: ['企业家体检', '五好生活'], settlePartner: '青禾资本',
        note: '合伙人层购买企业家体检，员工层试点五好生活。',
        contract: { no: 'HT-2026-031', name: '合伙人健康与员工五好试点', start: '2026-06-01', end: '2027-05-31', amount: 420000, used: 186000, people: 260, settlement: '季结 45 天', renewal: '2027-03-01', services: ['企业家体检', '五好生活'] }
      },
      {
        id: 'bc5', name: '博远制造', short: '博远制造', industry: '高端制造', employees: 2400, city: '天津 · 滨海',
        contact: '郑然', phone: '151****6630', owner: '周琳', source: 'offline', level: 'B', status: 'risk',
        tags: ['职业健康', '急救培训'], settlePartner: '博远制造',
        note: '职业健康体检覆盖不足，EHS 要求在安全月前补齐高风险岗位复查。',
        contract: { no: 'HT-2026-009', name: '职业健康与应急保障', start: '2026-02-01', end: '2027-01-31', amount: 1560000, used: 642000, people: 2400, settlement: '月结 45 天', renewal: '2026-11-20', services: ['职业健康', '急救培训'] }
      },
      {
        id: 'bc6', name: '南城银行', short: '南城银行', industry: '金融 / 银行', employees: 3200, city: '北京 · 西城',
        contact: '孙禾', phone: '158****3362', owner: '王雪', source: 'offline', level: 'A', status: 'active',
        tags: ['年度体检', '心理 EAP', '五好生活'], settlePartner: '北京某银行工会',
        note: '工会统一采购年度体检、心理 EAP 与五好生活，员工覆盖率高。',
        contract: { no: 'HT-2026-002', name: '员工体检与心理关怀', start: '2026-01-01', end: '2026-12-31', amount: 2080000, used: 810000, people: 3200, settlement: '季结 45 天', renewal: '2026-12-20', services: ['年度体检', '心理 EAP', '五好生活'] }
      },
      {
        id: 'bc7', name: '远望设计', short: '远望设计', industry: '设计 / 创意', employees: 180, city: '北京 · 朝阳',
        contact: '陈思远', phone: '133****8819', owner: '赵医生', source: 'exam', level: 'B', status: 'renewing',
        tags: ['企业家体检'], settlePartner: '远望设计',
        note: '合伙人团队在体检活动后咨询年度健康管理，等待续约方案。',
        contract: { no: 'HT-2026-044', name: '合伙人年度体检', start: '2026-09-01', end: '2027-08-31', amount: 260000, used: 78000, people: 180, settlement: '月结 30 天', renewal: '2027-01-10', services: ['企业家体检'] }
      }
    ],
    providers: [
      {
        id: 'sp1', name: '北京大学国际医院 · 健康管理中心', short: '北大国际医院', type: '体检机构',
        aliases: ['北京大学国际医院 · 健康管理中心', '北大国际医院'], city: '北京 · 昌平', qualification: '三级综合医院', license: '医疗机构执业许可证 PDY110108',
        contact: '李主任', phone: '010-6900****', owner: '健康管理部', status: 'active', level: 'A', rating: 4.9, onTime: 98, capacity: 220,
        settlement: '月结 30 天', clients: ['bc1', 'bc2', 'bc3', 'bc6'], cats: ['体检', '报告解读', '绿色通道'],
        note: '年度体检与异常复查主履约机构，报告解读能力稳定。',
        contract: { no: 'PS-2026-011', name: '体检与报告解读服务', start: '2026-01-01', end: '2026-12-31', amount: 860000, bank: '工商银行北京分行', taxNo: '91110108MA01****' }
      },
      {
        id: 'sp2', name: '北大医疗康复医院', short: '北大医疗康复医院', type: '康复机构',
        aliases: ['北大医疗康复医院'], city: '北京 · 朝阳', qualification: '三级康复医院', license: '医疗机构执业许可证 PDY110105',
        contact: '陈院长', phone: '010-5900****', owner: '健康管理部', status: 'active', level: 'A', rating: 4.8, onTime: 96, capacity: 90,
        settlement: '月结 30 天', clients: ['bc1', 'bc5'], cats: ['康复评估', '慢病干预', '运动处方'],
        note: '承接慢病管理与术后康复转介，档期相对紧张。',
        contract: { no: 'PS-2026-014', name: '康复评估与干预服务', start: '2026-02-01', end: '2027-01-31', amount: 420000, bank: '建设银行北京分行', taxNo: '91110105MA02****' }
      },
      {
        id: 'sp3', name: '北大医疗互联网医院', short: '互联网医院', type: '线上医疗',
        aliases: ['北大医疗互联网医院', '线上视频面诊'], city: '全国', qualification: '互联网医院执业许可', license: '互联网医院执业许可证',
        contact: '赵医生', phone: '400-820-****', owner: '就医服务中心', status: 'active', level: 'A', rating: 4.7, onTime: 94, capacity: 300,
        settlement: '月结 15 天', clients: ['bc1', 'bc3', 'bc6'], cats: ['视频问诊', '报告解读', '处方续方'],
        note: '覆盖全国员工，晚间问诊需求高。',
        contract: { no: 'PS-2026-020', name: '线上问诊与报告解读', start: '2026-01-01', end: '2026-12-31', amount: 360000, bank: '招商银行北京分行', taxNo: '91110108MA03****' }
      },
      {
        id: 'sp4', name: '北京华大医学检验所', short: '华大检验', type: '第三方检验',
        aliases: ['北京华大医学检验所'], city: '北京 · 顺义', qualification: '医学检验实验室', license: '医疗机构执业许可证 JY110113',
        contact: '王老师', phone: '010-8049****', owner: '健康管理中心', status: 'active', level: 'B', rating: 4.6, onTime: 92, capacity: 500,
        settlement: '月结 30 天', clients: ['bc1', 'bc5'], cats: ['基因检测', '专项检验', '肿瘤早筛'],
        note: '专项检验外包方，报告时效稳定但异常复核需加强。',
        contract: { no: 'PS-2026-026', name: '专项检验外包', start: '2026-03-01', end: '2027-02-28', amount: 280000, bank: '中国银行北京分行', taxNo: '91110113MA04****' }
      },
      {
        id: 'sp5', name: '京东健康药品配送', short: '京东健康配送', type: '药品配送',
        aliases: ['京东健康药品配送'], city: '全国', qualification: '药品经营许可证', license: '互联网药品交易服务资格',
        contact: '刘经理', phone: '400-606-****', owner: '药事服务组', status: 'active', level: 'B', rating: 4.8, onTime: 97, capacity: 800,
        settlement: '月结 15 天', clients: ['bc1', 'bc6'], cats: ['处方配送', '冷链配送', '用药提醒'],
        note: '处方药与营养品配送主通道，冷链覆盖一二线城市。',
        contract: { no: 'PS-2026-030', name: '药品与营养品配送', start: '2026-01-01', end: '2026-12-31', amount: 240000, bank: '中信银行北京分行', taxNo: '91110105MA05****' }
      },
      {
        id: 'sp6', name: '北大医疗健康优选供应链', short: '健康优选供应链', type: '实物供应商',
        aliases: ['北大医疗健康优选供应链'], city: '北京 · 大兴', qualification: '食品经营许可证', license: '食品经营许可证 JY111150',
        contact: '孙经理', phone: '010-6788****', owner: '商品运营组', status: 'active', level: 'A', rating: 4.7, onTime: 95, capacity: 1200,
        settlement: '月结 30 天', clients: ['bc1', 'bc4', 'bc6'], cats: ['营养品', '健康食品', '礼盒'],
        note: '实物商品主供货商，负责商品资质、库存与售后。',
        contract: { no: 'PS-2026-033', name: '健康商品供货与履约', start: '2026-01-01', end: '2026-12-31', amount: 520000, bank: '农业银行北京分行', taxNo: '91110115MA06****' }
      },
      {
        id: 'sp7', name: '心屿心理咨询中心', short: '心屿心理', type: '心理服务',
        aliases: ['心屿心理咨询中心'], city: '北京 · 东城', qualification: '心理咨询机构备案', license: '心理咨询服务备案',
        contact: '李咨询师', phone: '010-6522****', owner: 'EAP 项目组', status: 'active', level: 'A', rating: 4.9, onTime: 99, capacity: 60,
        settlement: '月结 30 天', clients: ['bc1', 'bc6'], cats: ['EAP 咨询', '危机干预', '心理测评'],
        note: '心理数据隔离要求高，只向企业输出匿名化报告。',
        contract: { no: 'PS-2026-037', name: 'EAP 心理咨询与危机干预', start: '2026-01-01', end: '2026-12-31', amount: 300000, bank: '北京银行', taxNo: '91110101MA07****' }
      },
      {
        id: 'sp8', name: '安泰急救培训中心', short: '安泰急救', type: '培训机构',
        aliases: ['安泰急救培训中心'], city: '北京 · 丰台', qualification: '急救培训资质', license: '红十字急救培训合作机构',
        contact: '周老师', phone: '010-6388****', owner: '企业服务部', status: 'active', level: 'B', rating: 4.8, onTime: 97, capacity: 40,
        settlement: '按场次结算', clients: ['bc3', 'bc5'], cats: ['急救培训', 'AED 配置', '应急演练'],
        note: '按场次排课，安全月与年度演练集中履约。',
        contract: { no: 'PS-2026-041', name: '急救培训与应急演练', start: '2026-02-01', end: '2027-01-31', amount: 180000, bank: '交通银行北京分行', taxNo: '91110106MA08****' }
      }
    ],
    payables: [
      { id: 'AP20261001', providerId: 'sp1', provider: '北京大学国际医院 · 健康管理中心', period: '2026-10', orders: 326, amount: 168400, status: 'pending', due: '2026-11-25' },
      { id: 'AP20261002', providerId: 'sp2', provider: '北大医疗康复医院', period: '2026-10', orders: 88, amount: 62300, status: 'approved', due: '2026-11-28' },
      { id: 'AP20261003', providerId: 'sp3', provider: '北大医疗互联网医院', period: '2026-10', orders: 120, amount: 36000, status: 'pending', due: '2026-11-20' },
      { id: 'AP20261004', providerId: 'sp4', provider: '北京华大医学检验所', period: '2026-10', orders: 142, amount: 38600, status: 'overdue', due: '2026-11-08' },
      { id: 'AP20261005', providerId: 'sp5', provider: '京东健康药品配送', period: '2026-10', orders: 214, amount: 18900, status: 'paid', due: '2026-11-15' },
      { id: 'AP20261006', providerId: 'sp6', provider: '北大医疗健康优选供应链', period: '2026-10', orders: 96, amount: 42800, status: 'pending', due: '2026-11-30' },
      { id: 'AP20261007', providerId: 'sp7', provider: '心屿心理咨询中心', period: '2026-10', orders: 64, amount: 25600, status: 'pending', due: '2026-11-26' },
      { id: 'AP20261008', providerId: 'sp8', provider: '安泰急救培训中心', period: '2026-10', orders: 18, amount: 14200, status: 'paid', due: '2026-11-18' }
    ]
  };

  /* 订单统一索引：预约 / 兑换 / 领奖 */
  S.orderIndex = { updated: '2026-11-08 09:00' };
})();
