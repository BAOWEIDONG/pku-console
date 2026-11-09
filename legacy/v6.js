/* ============================================================================
   Console v6 — 共享服务层
   资产库 / 消息模板 / 触达旅程 / 权益与券 / 规则模板 / 项目模板
   关系图谱 / 关联缺口 / 服务 360 / 客户 360
   依赖：data*.js → store.js → ui.js → kit.js → v5.js → v6.js → app.js
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const dbx = () => Store.db;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const nf = (n) => (n == null ? '—' : Number(n).toLocaleString('zh-CN'));
  const money = (n) => '¥' + nf(n);

  const TONE = { pku: 'teal', employee: 'amber', versionall: 'blue', system: 'grey' };
  const APP = { pku: '品牌站', employee: '职工健康', versionall: '减重营', all: '跨端' };
  const TYPE_ICON = { image: 'image', video: 'video', doc: 'file', faq: 'message', script: 'message' };
  const TYPE_NAME = { image: '图片', video: '视频', doc: '文档', faq: 'FAQ', script: '话术' };

  /* ================================================================= seed */
  const SEED = {
    assets: [
      { id: 'as1', type: 'image', name: '年度体检主视觉', path: '/assets/exam-hero.jpg', size: '1.8 MB', owner: '品牌部', updated: '2026-11-04 10:22', tags: ['体检', '首屏'], tone: 'blue', reuse: [{ t: 'content', id: 'c1', name: '年度体检预约开启' }, { t: 'svc', id: 'annual-exam', name: '职工年度体检' }] },
      { id: 'as2', type: 'image', name: '健康营第 7 期招募', path: '/assets/camp7-cover.jpg', size: '2.4 MB', owner: '运营中心', updated: '2026-11-03 16:08', tags: ['减重营', '招募'], tone: 'teal', reuse: [{ t: 'content', id: 'c2', name: '北医健康营第 7 期招募' }, { t: 'camp', id: 'camp1', name: '第七期 · 代谢重塑' }] },
      { id: 'as3', type: 'video', name: '五好生活品牌片', path: '/assets/fivegood-30s.mp4', size: '86 MB', owner: '品牌部', updated: '2026-10-30 14:40', tags: ['品牌', '五好'], tone: 'violet', reuse: [{ t: 'content', id: 'c3', name: '五高一重共管计划' }] },
      { id: 'as4', type: 'image', name: '体检流程长图', path: '/assets/exam-flow.jpg', size: '3.1 MB', owner: '健康管理中心', updated: '2026-10-28 09:15', tags: ['体检', '流程'], tone: 'blue', reuse: [{ t: 'svc', id: 'annual-exam', name: '职工年度体检' }] },
      { id: 'as5', type: 'doc', name: '企业体检服务手册 2026', path: '/assets/enterprise-exam-2026.pdf', size: '12.6 MB', owner: '客户成功部', updated: '2026-10-24 11:30', tags: ['企业', '销售'], tone: 'grey', reuse: [{ t: 'benefit', id: 'bf-exam', name: '年度体检' }] },
      { id: 'as6', type: 'faq', name: '体检常见问题（12 条）', path: 'FAQ 组', size: '12 条', owner: '健康管理中心', updated: '2026-10-20 18:02', tags: ['体检', '客服'], tone: 'teal', reuse: [{ t: 'svc', id: 'annual-exam', name: '职工年度体检' }, { t: 'svc', id: 'risk-report', name: '检后管理 · 深度报告解读' }] },
      { id: 'as7', type: 'script', name: '体检报告异常回访话术', path: '话术组', size: '6 段', owner: '客户成功部', updated: '2026-10-18 15:26', tags: ['回访', '企微'], tone: 'amber', reuse: [] },
      { id: 'as8', type: 'image', name: 'EAP 隐私保护说明', path: '/assets/eap-privacy.jpg', size: '860 KB', owner: '健康管理部', updated: '2026-10-15 09:40', tags: ['EAP', '隐私'], tone: 'amber', reuse: [{ t: 'svc', id: 'eap', name: '心理健康管理服务（EAP）' }, { t: 'benefit', id: 'bf-eap', name: 'EAP 咨询' }] },
      { id: 'as9', type: 'doc', name: '入职健康告知模板', path: '/assets/onboard-health.docx', size: '240 KB', owner: '人力资源部', updated: '2026-10-12 13:12', tags: ['入职', 'HR'], tone: 'grey', reuse: [] },
      { id: 'as10', type: 'video', name: '胃肠镜术前宣教', path: '/assets/gastro-pre.mp4', size: '64 MB', owner: '消化内科', updated: '2026-10-08 10:05', tags: ['胃肠镜', '宣教'], tone: 'blue', reuse: [{ t: 'svc', id: 'gastro', name: '无痛胃肠镜检查' }] },
      { id: 'as11', type: 'faq', name: '减重营打卡答疑', path: 'FAQ 组', size: '18 条', owner: '运营中心', updated: '2026-10-06 17:22', tags: ['减重营', '打卡'], tone: 'teal', reuse: [{ t: 'camp', id: 'camp1', name: '第七期 · 代谢重塑' }] },
      { id: 'as12', type: 'image', name: '企业医务室门头', path: '/assets/clinic-sign.jpg', size: '1.2 MB', owner: '客户成功部', updated: '2026-09-28 15:00', tags: ['医务室', '企业'], tone: 'amber', reuse: [{ t: 'svc', id: 'clinic', name: '企业医务室' }] }
    ],
    msgTemplates: [
      { id: 'mt1', name: '预约成功提醒', scene: '预约', channel: '企业微信', title: '预约成功 · {{服务名称}}', body: '{{姓名}}，您已预约 {{日期}} {{时间}} 在 {{机构}} 的「{{服务名称}}」。请提前 {{提醒分钟}} 分钟到院，点击查看预约详情。', vars: ['姓名', '服务名称', '日期', '时间', '机构', '提醒分钟'], approved: true, updated: '2026-11-04', use: 3820 },
      { id: 'mt2', name: '体检前 48 小时提醒', scene: '体检', channel: '短信', title: '【北大医疗】体检提醒', body: '{{姓名}}，您的体检预约在 {{日期}}。请提前 8 小时禁食，携带身份证。如需改约请点击 {{链接}}。', vars: ['姓名', '日期', '链接'], approved: true, updated: '2026-11-02', use: 1260 },
      { id: 'mt3', name: '报告解读邀请', scene: '检后', channel: '企业微信', title: '您的体检报告已生成', body: '{{姓名}}，{{日期}} 的体检报告已生成。{{异常提示}} 建议预约「深度报告解读」，由 {{医生}} 为您逐项说明。', vars: ['姓名', '日期', '异常提示', '医生'], approved: true, updated: '2026-10-30', use: 742 },
      { id: 'mt4', name: '五高复检召回', scene: '召回', channel: '短信', title: '【北大医疗】复检提醒', body: '{{姓名}}，您上次 {{指标}} 为 {{数值}}，建议在 {{截止日}} 前完成复查。回复 1 预约，回复 2 转人工。', vars: ['姓名', '指标', '数值', '截止日'], approved: false, updated: '2026-10-26', use: 186 },
      { id: 'mt5', name: '连续打卡奖励到账', scene: '激励', channel: '站内信', title: '奖励已到账 · {{奖励名称}}', body: '恭喜完成连续 {{天数}} 天打卡，{{奖励名称}} 已放入您的奖励箱，{{有效期}} 前有效。', vars: ['奖励名称', '天数', '有效期'], approved: true, updated: '2026-10-20', use: 956 },
      { id: 'mt6', name: '权益即将到期', scene: '权益', channel: '企业微信', title: '您的 {{权益名称}} 即将到期', body: '{{姓名}}，您的 {{权益名称}} 剩余 {{剩余次数}} 次，将于 {{到期日}} 到期，点击预约使用。', vars: ['姓名', '权益名称', '剩余次数', '到期日'], approved: true, updated: '2026-10-18', use: 468 }
    ],
    journeys: [
      { id: 'jr1', name: '体检后关怀', audience: '完成年度体检的员工', trigger: '体检报告生成后 1 天', status: 'active', entered: 1860, conversion: 34, steps: [{ day: 1, channel: '企业微信', tpl: 'mt3', name: '报告解读邀请' }, { day: 7, channel: '短信', tpl: 'mt2', name: '异常复查提醒' }, { day: 14, channel: '站内信', tpl: 'mt6', name: '权益到期提醒' }] },
      { id: 'jr2', name: '五高 12 周共管', audience: '五高标记且未入组员工', trigger: '健康风险标签命中', status: 'active', entered: 642, conversion: 41, steps: [{ day: 0, channel: '企业微信', tpl: 'mt4', name: '风险告知' }, { day: 3, channel: '短信', tpl: 'mt4', name: '复检召回' }, { day: 21, channel: '企业微信', tpl: 'mt3', name: '阶段复盘' }] },
      { id: 'jr3', name: '减重营开营陪跑', audience: '已报名第 8 期学员', trigger: '开营前 7 天', status: 'active', entered: 236, conversion: 62, steps: [{ day: -7, channel: '站内信', tpl: 'mt1', name: '开营提醒' }, { day: 0, channel: '企业微信', tpl: 'mt5', name: '首日打卡' }, { day: 7, channel: '企业微信', tpl: 'mt5', name: '周奖励' }] },
      { id: 'jr4', name: '权益到期召回', audience: '权益 30 天内到期', trigger: '到期前 30 天', status: 'draft', entered: 0, conversion: 0, steps: [{ day: -30, channel: '企业微信', tpl: 'mt6', name: '首次提醒' }, { day: -7, channel: '短信', tpl: 'mt6', name: '最后提醒' }] }
    ],
    touches: [
      { id: 'tc1', holder: '林悦', channel: '企业微信', tpl: '体检前 48 小时提醒', title: '体检提醒', at: '2026-11-05 09:10', status: '已送达' },
      { id: 'tc2', holder: '陈嘉禾', channel: '企业微信', tpl: '报告解读邀请', title: '报告已生成', at: '2026-11-04 15:22', status: '已打开' },
      { id: 'tc3', holder: '徐一鸣', channel: '短信', tpl: '五高复检召回', title: '复检提醒', at: '2026-11-03 11:05', status: '已送达' },
      { id: 'tc4', holder: '周雯', channel: '站内信', tpl: '连续打卡奖励到账', title: '奖励到账', at: '2026-11-02 18:40', status: '已点击' },
      { id: 'tc5', holder: '赵启明', channel: '企业微信', tpl: '权益即将到期', title: '权益到期', at: '2026-11-01 10:30', status: '已送达' },
      { id: 'tc6', holder: '吴倩', channel: '站内信', tpl: '体检前 48 小时提醒', title: '体检提醒', at: '2026-10-31 08:50', status: '已送达' }
    ],
    benefits: [
      { id: 'bf-exam', name: '年度体检', type: '体检', quota: 1, unit: '次/人/年', validity: 365, scope: '企业员工', stock: 2400, issued: 1780, used: 1102, owner: '健康管理中心', tone: 'blue', desc: '基础体检套餐，可按企业升级深度版并补差价。' },
      { id: 'bf-eap', name: 'EAP 心理咨询', type: '心理', quota: 6, unit: '次/人/年', validity: 365, scope: '企业员工及直系亲属', stock: 9999, issued: 642, used: 212, owner: '健康管理部', tone: 'amber', desc: '含 24 小时热线与线下一对一咨询，全程隐私保护。' },
      { id: 'bf-clinic', name: '企业医务室', type: '门诊', quota: 999, unit: '次/人/年', validity: 365, scope: '驻场企业', stock: 9999, issued: 1780, used: 864, owner: '客户成功部', tone: 'teal', desc: '驻场护士与全科医生，支持常见病处置与转诊。' },
      { id: 'bf-coupon', name: '商城 100 元券', type: '券', quota: 2, unit: '张/人/季', validity: 90, scope: '全员', stock: 500, issued: 268, used: 96, owner: '运营中心', tone: 'violet', desc: '积分商城与健康好物通用，可与积分叠加。' },
      { id: 'bf-body', name: '体成分检测', type: '检测', quota: 4, unit: '次/人/年', validity: 180, scope: '减重营 / 五好会员', stock: 0, issued: 486, used: 388, owner: '健康管理中心', tone: 'coral', desc: 'InBody 体成分检测，营期第 0/4/8/12 周各一次。' }
    ],
    grants: [
      { id: 'gr1', benefitId: 'bf-exam', holder: '林悦', company: '示例科技', qty: 1, remaining: 1, expires: '2027-03-31', status: 'active', at: '2026-03-01' },
      { id: 'gr2', benefitId: 'bf-eap', holder: '林悦', company: '示例科技', qty: 6, remaining: 4, expires: '2027-03-31', status: 'active', at: '2026-03-01' },
      { id: 'gr3', benefitId: 'bf-exam', holder: '陈嘉禾', company: '示例科技', qty: 1, remaining: 0, expires: '2026-12-31', status: 'used', at: '2026-05-12' },
      { id: 'gr4', benefitId: 'bf-eap', holder: '徐一鸣', company: '示例科技', qty: 6, remaining: 5, expires: '2027-01-31', status: 'active', at: '2026-06-20' },
      { id: 'gr5', benefitId: 'bf-coupon', holder: '周雯', company: '示例科技', qty: 2, remaining: 1, expires: '2026-12-20', status: 'active', at: '2026-09-20' },
      { id: 'gr6', benefitId: 'bf-body', holder: '周雯', company: '示例科技', qty: 4, remaining: 2, expires: '2027-02-01', status: 'active', at: '2026-10-19' },
      { id: 'gr7', benefitId: 'bf-exam', holder: '赵启明', company: '示例科技', qty: 1, remaining: 1, expires: '2027-03-31', status: 'active', at: '2026-04-15' },
      { id: 'gr8', benefitId: 'bf-clinic', holder: '何雨桐', company: '示例科技', qty: 999, remaining: 987, expires: '2027-03-31', status: 'active', at: '2026-08-02' }
    ],
    redemptions: [
      { id: 'rd1', grantId: 'gr3', benefitId: 'bf-exam', holder: '陈嘉禾', qty: 1, at: '2026-10-28 10:22', order: 'BK20261028001', channel: '职工健康 H5' },
      { id: 'rd2', grantId: 'gr2', benefitId: 'bf-eap', holder: '林悦', qty: 1, at: '2026-10-24 16:40', order: 'BK20261024002', channel: '企业微信' },
      { id: 'rd3', grantId: 'gr5', benefitId: 'bf-coupon', holder: '周雯', qty: 1, at: '2026-10-18 20:05', order: 'EX20261018003', channel: '减重营 H5' },
      { id: 'rd4', grantId: 'gr6', benefitId: 'bf-body', holder: '周雯', qty: 1, at: '2026-10-15 09:30', order: 'BK20261015004', channel: '减重营 H5' },
      { id: 'rd5', grantId: 'gr8', benefitId: 'bf-clinic', holder: '何雨桐', qty: 2, at: '2026-10-12 14:10', order: 'BK20261012005', channel: '企业医务室' },
      { id: 'rd6', grantId: 'gr2', benefitId: 'bf-eap', holder: '林悦', qty: 1, at: '2026-09-28 19:20', order: 'BK20260928006', channel: '企业微信' }
    ],
    rules: [
      { id: 'rl-book', name: '标准预约规则', type: '预约', desc: '次日可约，最远 14 天，提前 24 小时免费取消。', values: [{ k: 'leadDays', l: '最早可约', v: 1, u: '天' }, { k: 'maxDays', l: '最远可约', v: 14, u: '天' }, { k: 'cancelHours', l: '免费取消', v: 24, u: '小时' }], appliedTo: ['服务 · 职工年度体检', '服务 · 企业医务室'], owner: '健康管理中心', updated: '2026-11-02' },
      { id: 'rl-exam', name: '体检预约规则', type: '预约', desc: '需空腹与问卷，改约需提前 48 小时。', values: [{ k: 'leadDays', l: '最早可约', v: 1, u: '天' }, { k: 'maxDays', l: '最远可约', v: 30, u: '天' }, { k: 'cancelHours', l: '免费取消', v: 48, u: '小时' }], appliedTo: ['服务 · 职工年度体检', '服务 · 无痛胃肠镜检查'], owner: '健康管理中心', updated: '2026-10-28' },
      { id: 'rl-cancel', name: '宽松取消规则', type: '取消', desc: '履约前 4 小时仍可免费取消，适合企业医务室。', values: [{ k: 'cancelHours', l: '免费取消', v: 4, u: '小时' }, { k: 'noShow', l: '爽约冻结', v: 2, u: '次' }], appliedTo: ['服务 · 企业医务室'], owner: '客户成功部', updated: '2026-10-20' },
      { id: 'rl-points', name: '减重营积分规则', type: '积分', desc: '体重 2 分、饮食 1 分、运动 2 分，每日上限 8 分。', values: [{ k: 'weight', l: '体重打卡', v: 2, u: '分' }, { k: 'diet', l: '饮食打卡', v: 1, u: '分' }, { k: 'exercise', l: '运动打卡', v: 2, u: '分' }, { k: 'dailyCap', l: '每日上限', v: 8, u: '分' }], appliedTo: ['营期 · 第七期 · 代谢重塑', '营期 · 第八期 · 轻盈启程'], owner: '运营中心', updated: '2026-10-25' },
      { id: 'rl-score', name: '五好评分规则', type: '评分', desc: '及格 70、优秀 85，按月生成五维雷达。', values: [{ k: 'pass', l: '及格线', v: 70, u: '分' }, { k: 'excellent', l: '优秀线', v: 85, u: '分' }, { k: 'reportCycle', l: '报告周期', v: '月', u: '' }], appliedTo: ['五好 · 评分权重'], owner: '健康管理部', updated: '2026-10-22' },
      { id: 'rl-reward', name: '连续打卡奖励规则', type: '奖励', desc: '3/5/8 天阶梯发奖，库存不足时自动顺延。', values: [{ k: 'steps', l: '奖励阶梯', v: '3 / 5 / 8', u: '天' }, { k: 'stockGuard', l: '库存保护', v: '开', u: '' }], appliedTo: ['营期 · 第七期 · 代谢重塑'], owner: '运营中心', updated: '2026-10-18' }
    ],
    templates: [
      { id: 'tp1', name: '28 天减重营 · 标准模板', type: 'camp', desc: '打卡规则、积分、三档奖励与结营报告一次带走。', scope: '减重营', updated: '2026-10-30', uses: 6, tone: 'blue', items: ['体重 / 饮食 / 运动三类打卡', '每日 8 分积分规则', '3 / 5 / 8 天连续奖励', '开营问卷 + 结营报告'], camp: { theme: '28 天代谢重塑计划', capacity: 60, days: 28 } },
      { id: 'tp2', name: '五好生活 · 年度计划', type: 'fivegood', desc: '五维权重、12 个月任务库与阶段报告。', scope: '企业员工', updated: '2026-10-26', uses: 3, tone: 'teal', items: ['吃 / 睡 / 动 / 心 / 查 五维', '12 个月任务', '月度雷达 + 年度报告', '权益联动'], dims: { eat: 25, sleep: 20, move: 25, mind: 15, check: 15 }, tasks: [{ dim: 'eat', week: 1, title: '记录 3 天饮食并标注主食', type: '打卡', points: 10 }, { dim: 'move', week: 1, title: '完成 3 次 30 分钟中等强度运动', type: '打卡', points: 15 }, { dim: 'mind', week: 1, title: '完成一次压力自评', type: '评估', points: 10 }] },
      { id: 'tp3', name: '企业体检季 · 触达模板', type: 'campaign', desc: '从告知、预约、检前提醒到报告解读的四段旅程。', scope: '企业客户', updated: '2026-10-20', uses: 8, tone: 'amber', items: ['体检告知', '预约提醒', '检前 48 小时', '报告解读'], steps: [{ day: -14, channel: '企业微信', name: '体检季启动' }, { day: -7, channel: '短信', name: '预约提醒' }, { day: -2, channel: '短信', name: '检前提醒' }, { day: 3, channel: '企业微信', name: '报告解读' }] },
      { id: 'tp4', name: '企业家尊享 · 健康管家', type: 'bundle', desc: '深度体检 + 专属管家 + 全球就医协助。', scope: '高管 / 企业家', updated: '2026-10-16', uses: 2, tone: 'violet', items: ['深度体检', '专属健康管家', '二次诊疗', '全球就医协助'], bundle: { price: 28800, settle: 23800, cost: 14600 } }
    ]
  };

  function ensure() {
    const db = dbx();
    if (!db || !db.shared) return;
    let changed = false;
    ['assets', 'msgTemplates', 'journeys', 'touches', 'benefits', 'grants', 'redemptions', 'rules', 'templates'].forEach((k) => {
      if (!db.shared[k]) { db.shared[k] = clone(SEED[k]); changed = true; }
    });
    if (db.meta && parseFloat(db.meta.version) < 6) { db.meta.version = '6.0.0'; changed = true; }
    if (changed) Store.persist();
  }

  /* =============================================================== helpers */
  function usageLabel(u) {
    if (!u) return '';
    if (u.t === 'svc') return '服务 · ' + u.name;
    if (u.t === 'content') return '内容 · ' + u.name;
    if (u.t === 'camp') return '营期 · ' + u.name;
    if (u.t === 'benefit') return '权益 · ' + u.name;
    return u.name;
  }
  function routeOfUsage(u) {
    if (!u) return 'workbench';
    if (u.t === 'svc') return 'svc-360';
    if (u.t === 'content') return 'g-content';
    if (u.t === 'camp') return 'v-camps';
    if (u.t === 'benefit') return 'lib-benefits';
    return 'workbench';
  }
  function assetUsage(a) {
    return (a.reuse || []).length;
  }
  function customerList() {
    const db = dbx();
    const map = {};
    (db.employee.bookings || []).forEach((b) => {
      const key = b.person;
      map[key] = map[key] || { name: key, dept: b.dept, phone: b.phone, bookings: [], student: null, last: b.created || '', tags: [] };
      map[key].bookings.push(b);
      if (b.created > map[key].last) map[key].last = b.created;
    });
    (db.versionall.students || []).forEach((s) => {
      map[s.name] = map[s.name] || { name: s.name, dept: '减重营', phone: s.phone, bookings: [], student: null, last: s.joined || '', tags: [] };
      map[s.name].student = s;
      map[s.name].tags = s.tags || [];
      if (s.joined > map[s.name].last) map[s.name].last = s.joined;
    });
    return Object.keys(map).map((k) => map[k]).sort((a, b) => (a.last < b.last ? 1 : -1));
  }
  function benefitOf(id) {
    return (dbx().shared.benefits || []).find((b) => b.id === id) || {};
  }
  function personGrants(name) {
    return (dbx().shared.grants || []).filter((g) => g.holder === name);
  }
  function personTouches(name) {
    return (dbx().shared.touches || []).filter((t) => t.holder === name);
  }

  /* ================================================================= ASSETS */
  P['lib-assets'] = {
    app: 'all', title: '共享资产库', sub: '图片、视频、文档、FAQ 与话术，一次沉淀多端复用',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    state: { type: 'all', q: '' },
    render() {
      ensure();
      const list = dbx().shared.assets;
      const st = P['lib-assets'].state;
      const rows = list.filter((a) => st.type === 'all' || a.type === st.type);
      const used = list.filter((a) => assetUsage(a) > 0).length;
      const reuse = list.reduce((n, a) => n + assetUsage(a), 0);
      return K.head('共享资产库', '资产不是附件，而是被多个服务、内容与权益引用的共享对象',
        '<button class="btn" data-act="assetAudit">' + I('target', 15) + '查看引用关系</button>' +
        '<button class="btn primary" data-act="assetNew">' + I('upload', 15) + '上传资产</button>', 'SHARED / ASSETS') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>资产</span><b>' + list.length + '</b><em>5 种类型 · ' + (list.length * 1.4).toFixed(1) + ' GB</em></div>' +
          '<div class="vsum-card ok"><span>被引用</span><b>' + used + '</b><em>' + Math.round(used / list.length * 100) + '% 有实际使用方</em></div>' +
          '<div class="vsum-card"><span>复用次数</span><b>' + reuse + '</b><em>跨服务 / 内容 / 权益</em></div>' +
          '<div class="vsum-card warn"><span>孤立资产</span><b>' + (list.length - used) + '</b><em>无引用，可清理或补挂</em></div>' +
        '</div>' +
        '<div class="vfilter"><div class="vseg">' + [['all', '全部'], ['image', '图片'], ['video', '视频'], ['doc', '文档'], ['faq', 'FAQ'], ['script', '话术']].map((x) =>
          '<button data-act="assetType" data-id="' + x[0] + '" class="' + (st.type === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
          '<div class="lib-search">' + I('search', 14) + '<input data-live-filter="asset" placeholder="搜索名称 / 标签 / 负责人"></div>' +
          '<span class="vfilter-n">' + rows.length + ' 项</span></div>' +
        '<div class="lib-grid">' + rows.map((a) =>
          '<button class="asset-card" data-act="assetOpen" data-id="' + a.id + '" data-filter-item="asset" data-text="' + E(a.name + ' ' + a.tags.join(' ') + ' ' + a.owner) + '">' +
            '<div class="asset-thumb ' + a.tone + '">' + I(TYPE_ICON[a.type] || 'image', 26) +
              '<span class="asset-type">' + TYPE_NAME[a.type] + '</span></div>' +
            '<div class="asset-body"><b>' + E(a.name) + '</b><span>' + E(a.path) + '</span>' +
              '<div class="asset-meta"><span>' + E(a.size) + '</span><span>' + E(a.owner) + '</span></div>' +
              '<div class="asset-foot">' + (assetUsage(a) ? '<em class="ok">' + assetUsage(a) + ' 处引用</em>' : '<em class="warn">未引用</em>') +
              '<span>' + E(a.updated.slice(5)) + '</span></div>' +
            '</div></button>').join('') + '</div>';
    },
    actions: {
      assetType(d) { P['lib-assets'].state.type = d.id; App.refresh(); },
      assetOpen(d) { openAsset(d.id); },
      assetNew() { openAsset(null); },
      assetAudit() { App.go('g-graph'); }
    }
  };

  function openAsset(id) {
    ensure();
    const list = dbx().shared.assets;
    const a = id ? list.find((x) => x.id === id) : null;
    const usage = (a && a.reuse) || [];
    UI.drawer({
      width: 540,
      title: a ? a.name : '上传共享资产', sub: a ? (TYPE_NAME[a.type] + ' · ' + a.size + ' · ' + a.owner) : '上传后可在服务、内容、权益与营期中复用',
      icon: a ? (TYPE_ICON[a.type] || 'image') : 'upload', tone: a ? a.tone : 'blue',
      body: '<div class="formsec"><h4>资产信息</h4>' +
        UI.fInput({ label: '名称', value: a ? a.name : '', ph: '如 年度体检主视觉' }) +
        '<div class="frow">' + UI.fSelect({ label: '类型', value: a ? a.type : 'image', options: [{ v: 'image', l: '图片' }, { v: 'video', l: '视频' }, { v: 'doc', l: '文档' }, { v: 'faq', l: 'FAQ' }, { v: 'script', l: '话术' }] }) +
        UI.fInput({ label: '负责人', value: a ? a.owner : '品牌部' }) + '</div>' +
        UI.fInput({ label: '文件 / 路径', value: a ? a.path : '', ph: '/assets/xxx.jpg' }) +
        UI.fInput({ label: '标签', value: a ? a.tags.join(' / ') : '', ph: '体检 / 首屏' }) + '</div>' +
        (a ? '<div class="formsec"><h4>被谁引用</h4>' + (usage.length ? usage.map((u) =>
          '<button class="asset-use" data-act="go" data-id="' + routeOfUsage(u) + '"><span class="vdot ' + (u.t === 'svc' ? 'blue' : u.t === 'content' ? 'teal' : u.t === 'camp' ? 'amber' : 'violet') + '"></span>' +
          '<div><b>' + E(usageLabel(u)) + '</b><span>' + E(u.id) + '</span></div>' + I('chevron', 13) + '</button>').join('')
          : '<div class="vempty-sm">还没有被任何业务对象引用。</div>') + '</div>' : '') +
        '<div class="note">修改文件会同步到所有引用处；删除前必须先解除全部引用。</div>',
      okText: a ? '保存资产' : '上传',
      onOk(n) {
        const inputs = Array.from(n.querySelectorAll('.field .input'));
        const select = n.querySelector('select');
        const fv = (i, fallback) => (inputs[i] && inputs[i].value != null ? inputs[i].value.trim() : '') || fallback;
        const name = fv(0, '未命名资产');
        const owner = fv(1, '未指定');
        const path = fv(2, '本地文件');
        const tags = (inputs[3] ? inputs[3].value : '').split(/[，,/]/).map((x) => x.trim()).filter(Boolean);
        if (a) {
          Store.saveItem('shared.assets', { id: a.id, name: name, type: select.value, owner: owner, path: path, tags: tags, updated: '2026-11-08 10:00' }, 'id', '编辑资产');
          UI.toast('资产已更新，引用处同步生效');
        } else {
          Store.pushItem('shared.assets', { id: 'as' + Date.now(), type: select.value, name: name, path: path, size: '—', owner: owner, updated: '2026-11-08 10:00', tags: tags, tone: 'blue', reuse: [] }, '新增资产');
          UI.toast('资产已入库');
        }
        App.refresh();
      }
    });
  }

  /* ============================================================== MESSAGES */
  P['lib-messages'] = {
    app: 'all', title: '消息模板', sub: '短信、企微、站内信统一文案与变量',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home', hideNav: true,
    state: { id: 'mt1' },
    render() {
      ensure();
      const list = dbx().shared.msgTemplates;
      const sel = list.find((t) => t.id === P['lib-messages'].state.id) || list[0];
      return K.head('消息模板', '先定模板再编排旅程，避免同一句话在四个渠道里各写一遍',
        '<button class="btn" data-act="msgNew">' + I('plus', 15) + '新建模板</button>' +
        '<button class="btn primary" data-act="go" data-id="lib-journeys">' + I('send', 15) + '编排旅程</button>', 'SHARED / MESSAGES') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>模板</span><b>' + list.length + '</b><em>覆盖 5 个场景</em></div>' +
          '<div class="vsum-card ok"><span>已审核</span><b>' + list.filter((t) => t.approved).length + '</b><em>未审核 ' + list.filter((t) => !t.approved).length + ' 条</em></div>' +
          '<div class="vsum-card"><span>累计触达</span><b>' + nf(list.reduce((a, b) => a + b.use, 0)) + '</b><em>本月 3,020 人次</em></div>' +
          '<div class="vsum-card"><span>变量规范</span><b>100%</b><em>全部模板可解析</em></div>' +
        '</div>' +
        '<div class="msg-layout">' +
          '<aside class="msg-list">' + list.map((t) =>
            '<button class="msg-item ' + (t.id === sel.id ? 'on' : '') + '" data-act="msgPick" data-id="' + t.id + '">' +
              '<span class="vdot ' + (t.channel === '企业微信' ? 'teal' : t.channel === '短信' ? 'amber' : 'blue') + '"></span>' +
              '<div><b>' + E(t.name) + '</b><span>' + E(t.scene) + ' · ' + E(t.channel) + '</span></div>' +
              (t.approved ? '<em class="msg-ok">' + I('check', 11) + '</em>' : '<em class="msg-warn">待审</em>') +
            '</button>').join('') + '</aside>' +
          '<section class="msg-preview">' +
            '<header><div><h3>' + E(sel.name) + '</h3><p>' + E(sel.scene) + ' · ' + E(sel.channel) + ' · 最近更新 ' + E(sel.updated) + '</p></div>' +
              '<div class="row" style="gap:6px"><button class="btn sm" data-act="msgEdit" data-id="' + sel.id + '">' + I('edit', 13) + '编辑</button>' +
              '<button class="btn sm primary" data-act="msgTest" data-id="' + sel.id + '">' + I('send', 13) + '发送测试</button></div></header>' +
            '<div class="msg-phone ' + (sel.channel === '企业微信' ? 'teal' : sel.channel === '短信' ? 'amber' : 'blue') + '">' +
              '<div class="mp-top"><span>北大医疗</span><em>' + E(sel.channel) + '</em></div>' +
              '<div class="mp-title">' + E(sel.title) + '</div>' +
              '<div class="mp-body">' + E(sel.body).replace(/\{\{([^}]+)\}\}/g, '<mark>{{$1}}</mark>').replace(/\n/g, '<br>') + '</div>' +
              '<div class="mp-foot">' + (sel.channel === '短信' ? '回复 TD 退订 · 400-820-8866' : '点击查看详情 ›') + '</div>' +
            '</div>' +
            '<div class="msg-vars"><h4>可用变量</h4><div class="chips">' + sel.vars.map((v) => '<span class="chip">{{' + E(v) + '}}</span>').join('') + '</div>' +
              '<div class="small mut">变量由业务对象在发送时自动填充；缺失变量会被拦截，不会发出。</div></div>' +
            '<div class="msg-usage"><h4>被这些旅程使用</h4>' + (dbx().shared.journeys.filter((j) => j.steps.some((s) => s.tpl === sel.id)).map((j) =>
              '<button class="asset-use" data-act="go" data-id="lib-journeys"><span class="vdot blue"></span><div><b>' + E(j.name) + '</b><span>' + E(j.audience) + '</span></div>' + I('chevron', 12) + '</button>').join('') || '<div class="vempty-sm">暂未被旅程引用</div>') + '</div>' +
          '</section>' +
        '</div>';
    },
    actions: {
      msgPick(d) { P['lib-messages'].state.id = d.id; App.refresh(); },
      msgNew() { openMsg(null); },
      msgEdit(d) { openMsg(d.id); },
      msgTest(d) {
        const t = dbx().shared.msgTemplates.find((x) => x.id === d.id);
        Store.snapshot();
        Store.pushItem('shared.touches', { id: 'tc' + Date.now(), holder: '测试账号', channel: t.channel, tpl: t.name, title: '测试发送 · ' + t.title, at: '2026-11-08 10:00', status: '已送达' }, '测试发送');
        UI.toast('测试消息已发送到运营账号');
        App.refresh();
      }
    }
  };

  function openMsg(id) {
    ensure();
    const list = dbx().shared.msgTemplates;
    const t = id ? list.find((x) => x.id === id) : null;
    UI.drawer({
      width: 560, title: t ? '编辑消息模板' : '新建消息模板', sub: t ? t.name : '模板可在多条旅程里复用',
      icon: 'message', tone: 'teal',
      body: '<div class="formsec"><h4>基本信息</h4>' +
        '<div class="frow">' + UI.fInput({ label: '模板名称', value: t ? t.name : '' }) +
        UI.fSelect({ label: '场景', value: t ? t.scene : '预约', options: ['预约', '体检', '检后', '召回', '激励', '权益'] }) + '</div>' +
        UI.fSelect({ label: '渠道', value: t ? t.channel : '企业微信', options: ['企业微信', '短信', '站内信'] }) +
        UI.fInput({ label: '标题', value: t ? t.title : '', ph: '可使用 {{变量}}' }) +
        UI.fArea({ label: '正文', value: t ? t.body : '', rows: 5, hint: '变量格式 {{姓名}}，发送前会自动替换' }) +
        '</div><div class="formsec"><h4>审核</h4>' + UI.fSwitch({ label: '已通过合规审核', value: t ? t.approved : false }) + '</div>' +
        '<div class="note">模板改动会影响所有引用它的旅程与活动。发布前会检查未解析变量。</div>',
      okText: t ? '保存模板' : '创建模板',
      onOk(n) {
        const inputs = n.querySelectorAll('.field .input');
        const textarea = n.querySelector('textarea');
        const selects = n.querySelectorAll('select');
        const approved = n.querySelector('.switch') && n.querySelector('.switch').classList.contains('on');
        const vals = Array.from(inputs).map((x) => x.value.trim());
        const tpl = { name: vals[0] || '未命名模板', scene: selects[0].value, channel: selects[1].value, title: vals[1] || '通知', body: textarea.value || '', approved: !!approved, updated: '2026-11-08' };
        if (t) {
          Store.saveItem('shared.msgTemplates', Object.assign({ id: t.id, vars: t.vars, use: t.use }, tpl), 'id', '编辑模板');
        } else {
          const vars = Array.from((tpl.body + tpl.title).matchAll(/\{\{([^}]+)\}\}/g)).map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i);
          Store.pushItem('shared.msgTemplates', Object.assign({ id: 'mt' + Date.now(), vars: vars, use: 0 }, tpl), '新增模板');
        }
        UI.toast('模板已保存');
        App.refresh();
      }
    });
  }

  /* ============================================================== JOURNEYS */
  P['lib-journeys'] = {
    app: 'all', title: '触达旅程', sub: '按人群与事件自动编排，多步触达不再手工群发',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home', hideNav: true,
    render() {
      ensure();
      const list = dbx().shared.journeys;
      const active = list.filter((j) => j.status === 'active');
      return K.head('触达旅程', active.length + ' 条运行中 · 平均转化 41% · 本月进入 2,738 人',
        '<button class="btn" data-act="jrNew">' + I('plus', 15) + '新建旅程</button>' +
        '<button class="btn primary" data-act="go" data-id="msg-center">' + I('send', 15) + '发送记录</button>', 'SHARED / JOURNEYS') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>旅程</span><b>' + list.length + '</b><em>' + active.length + ' 条运行中</em></div>' +
          '<div class="vsum-card ok"><span>进入人数</span><b>' + nf(list.reduce((a, b) => a + b.entered, 0)) + '</b><em>近 30 天</em></div>' +
          '<div class="vsum-card"><span>平均转化</span><b>41%</b><em>预约 / 打卡 / 领奖</em></div>' +
          '<div class="vsum-card warn"><span>草稿</span><b>' + list.filter((j) => j.status === 'draft').length + '</b><em>待发布后生效</em></div>' +
        '</div>' +
        '<div class="jr-grid">' + list.map((j) =>
          '<section class="jr-card ' + (j.status === 'draft' ? 'draft' : '') + '">' +
            '<header><div><span class="vdot ' + (j.status === 'active' ? 'teal' : 'amber') + '"></span><b>' + E(j.name) + '</b></div>' +
              '<div class="row" style="gap:5px"><span class="pill ' + (j.status === 'active' ? 'green' : 'grey') + '">' + (j.status === 'active' ? '运行中' : '草稿') + '</span>' +
              '<button class="vmini" data-act="jrToggle" data-id="' + j.id + '">' + (j.status === 'active' ? '暂停' : '启用') + '</button></div></header>' +
            '<p>' + E(j.audience) + '<span class="mut"> · 触发：' + E(j.trigger) + '</span></p>' +
            '<div class="jr-steps">' + j.steps.map((s, k) =>
              '<div class="jr-step"><span class="jr-day">' + (s.day === 0 ? 'D0' : (s.day > 0 ? 'D+' : 'D') + s.day) + '</span>' +
                '<div><b>' + E(s.name) + '</b><span>' + E(s.channel) + '</span></div>' +
              '</div>' + (k < j.steps.length - 1 ? '<i class="jr-line"></i>' : '')).join('') + '</div>' +
            '<footer><div><b class="tnum">' + nf(j.entered) + '</b><span>进入</span></div><div><b class="tnum">' + j.conversion + '%</b><span>转化</span></div>' +
              '<div class="spacer"></div><button class="vmini" data-act="jrTest" data-id="' + j.id + '">' + I('send', 12) + '测试</button>' +
              '<button class="vmini" data-act="jrEdit" data-id="' + j.id + '">' + I('edit', 12) + '编排</button></footer>' +
          '</section>').join('') + '</div>';
    },
    actions: {
      jrToggle(d) {
        const j = dbx().shared.journeys.find((x) => x.id === d.id);
        Store.snapshot();
        j.status = j.status === 'active' ? 'draft' : 'active';
        Store.mark('shared.journeys', (j.status === 'active' ? '启用' : '暂停') + '旅程 · ' + j.name);
        UI.toast(j.status === 'active' ? '旅程已启用' : '旅程已暂停');
        App.refresh();
      },
      jrTest(d) {
        const j = dbx().shared.journeys.find((x) => x.id === d.id);
        Store.snapshot();
        Store.pushItem('shared.touches', { id: 'tc' + Date.now(), holder: '测试账号', channel: j.steps[0].channel, tpl: j.steps[0].name, title: '旅程测试 · ' + j.name, at: '2026-11-08 10:00', status: '已送达' }, '旅程测试');
        UI.toast('已用测试人群走完整条旅程');
        App.refresh();
      },
      jrNew() { openJourney(null); },
      jrEdit(d) { openJourney(d.id); }
    }
  };

  function openJourney(id) {
    ensure();
    const list = dbx().shared.journeys;
    const j = id ? list.find((x) => x.id === id) : null;
    const tpls = dbx().shared.msgTemplates;
    const stepHTML = (j ? j.steps : [{ day: 0, channel: '企业微信', tpl: 'mt1', name: '首条消息' }]).map((s, k) =>
      '<div class="journey-row" data-step="' + k + '"><span class="jr-day">D' + (s.day >= 0 ? '+' : '') + s.day + '</span>' +
      '<select class="select jr-ch">' + ['企业微信', '短信', '站内信'].map((c) => '<option' + (c === s.channel ? ' selected' : '') + '>' + c + '</option>').join('') + '</select>' +
      '<select class="select jr-tpl">' + tpls.map((t) => '<option value="' + t.id + '"' + (t.id === s.tpl ? ' selected' : '') + '>' + E(t.name) + '</option>').join('') + '</select>' +
      '<input class="input jr-dayin tnum" type="number" value="' + s.day + '" title="相对天数"></div>').join('');
    UI.drawer({
      width: 640, title: j ? '编排旅程 · ' + j.name : '新建触达旅程', sub: '人群 → 触发 → 多步触达 → 转化',
      icon: 'send', tone: 'blue',
      body: '<div class="formsec"><h4>基础</h4>' +
        UI.fInput({ label: '旅程名称', value: j ? j.name : '' }) +
        '<div class="frow">' + UI.fInput({ label: '目标人群', value: j ? j.audience : '未预约员工' }) + UI.fInput({ label: '触发条件', value: j ? j.trigger : '事件发生时' }) + '</div></div>' +
        '<div class="formsec"><h4>步骤</h4><div class="journey-steps" id="jr-steps">' + stepHTML + '</div>' +
        '<button class="btn sm" data-add-step style="margin-top:8px">' + I('plus', 13) + '增加一步</button>' +
        '<div class="hint">D0 为触发当天，D+7 为触发后 7 天。每一步可换渠道与模板。</div></div>' +
        '<div class="note teal">旅程启用后只影响新进入人群，已在途用户按进入时的版本继续执行。</div>',
      okText: j ? '保存旅程' : '创建旅程',
      mount(n) {
        n.querySelector('[data-add-step]').addEventListener('click', () => {
          const box = n.querySelector('#jr-steps');
          const row = document.createElement('div');
          row.className = 'journey-row';
          row.innerHTML = '<span class="jr-day">D+7</span><select class="select jr-ch"><option>企业微信</option><option>短信</option><option>站内信</option></select>' +
            '<select class="select jr-tpl">' + tpls.map((t) => '<option value="' + t.id + '">' + E(t.name) + '</option>').join('') + '</select><input class="input jr-dayin tnum" type="number" value="7">';
          box.appendChild(row);
        });
      },
      onOk(n) {
        const inputs = n.querySelectorAll('.field .input');
        const name = inputs[0].value.trim() || '未命名旅程';
        const audience = inputs[1].value.trim();
        const trigger = inputs[2].value.trim();
        const steps = Array.from(n.querySelectorAll('.journey-row')).map((row) => {
          const tplSel = row.querySelector('.jr-tpl');
          const t = tpls.find((x) => x.id === tplSel.value);
          return { day: Number(row.querySelector('.jr-dayin').value || 0), channel: row.querySelector('.jr-ch').value, tpl: tplSel.value, name: t ? t.name : '消息' };
        });
        if (j) Store.saveItem('shared.journeys', { id: j.id, name: name, audience: audience, trigger: trigger, steps: steps, entered: j.entered, conversion: j.conversion }, 'id', '编排旅程');
        else Store.pushItem('shared.journeys', { id: 'jr' + Date.now(), name: name, audience: audience, trigger: trigger, steps: steps, status: 'draft', entered: 0, conversion: 0 }, '新建旅程');
        UI.toast('旅程已保存');
        App.refresh();
      }
    });
  }

  /* ============================================================== BENEFITS */
  P['lib-benefits'] = {
    app: 'all', title: '权益与券引擎', sub: '额度、人群、有效期与核销，全部可跨企业复用',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    state: { tab: 'grants' },
    render() {
      ensure();
      const list = dbx().shared.benefits;
      const grants = dbx().shared.grants;
      const reds = dbx().shared.redemptions;
      const tab = P['lib-benefits'].state.tab;
      const active = grants.filter((g) => g.status === 'active');
      const totalRemaining = active.reduce((n, g) => n + g.remaining, 0);
      return K.head('权益与券引擎', '权益是跨服务、跨营期、跨企业的可复用额度对象',
        '<button class="btn" data-act="go" data-id="e-orgs">' + I('building', 15) + '企业额度' +
        '</button><button class="btn primary" data-act="grantNew">' + I('gift', 15) + '发放权益</button>', 'SHARED / ENTITLEMENT') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>权益类型</span><b>' + list.length + '</b><em>体检 / 心理 / 门诊 / 券 / 检测</em></div>' +
          '<div class="vsum-card"><span>有效发放</span><b>' + active.length + '</b><em>共 ' + nf(active.reduce((n, g) => n + g.qty, 0)) + ' 份</em></div>' +
          '<div class="vsum-card ok"><span>剩余额度</span><b>' + nf(totalRemaining) + '</b><em>可继续使用</em></div>' +
          '<div class="vsum-card warn"><span>库存告警</span><b>' + list.filter((b) => b.stock <= 50).length + '</b><em>需补库存</em></div>' +
        '</div>' +
        '<div class="bene-grid">' + list.map((b) =>
          '<section class="bene-card ' + b.tone + '"><header><span class="bene-ic">' + I(b.type === '券' ? 'gift' : b.type === '心理' ? 'heart' : b.type === '检测' ? 'activity' : 'shield', 17) + '</span>' +
            '<div><b>' + E(b.name) + '</b><span>' + E(b.type) + ' · ' + E(b.owner) + '</span></div>' +
            '<em class="pill ' + (b.stock <= 50 ? 'red' : 'green') + '">库存 ' + nf(b.stock) + '</em></header>' +
            '<p>' + E(b.desc) + '</p>' +
            '<div class="bene-stats"><div><b>' + b.quota + '</b><span>' + E(b.unit) + '</span></div><div><b>' + nf(b.issued) + '</b><span>已发放</span></div><div><b>' + nf(b.used) + '</b><span>已核销</span></div></div>' +
            '<div class="bene-bar"><i style="width:' + Math.min(100, Math.round(b.used / (b.issued || 1) * 100)) + '%"></i><em>' + Math.round(b.used / (b.issued || 1) * 100) + '% 核销</em></div>' +
            '<footer><span class="small mut">有效期 ' + b.validity + ' 天 · ' + E(b.scope) + '</span><button class="vmini" data-act="grantNew" data-id="' + b.id + '">发放</button></footer>' +
          '</section>').join('') + '</div>' +
        '<div class="vcard" style="margin-top:4px"><div class="vcard-h"><div><h3>发放与核销台账</h3><p>' + grants.length + ' 条发放 · ' + reds.length + ' 条核销</p></div>' +
          '<div class="vseg">' + [['grants', '发放记录'], ['redemptions', '核销记录']].map((x) =>
            '<button data-act="beneTab" data-id="' + x[0] + '" class="' + (tab === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div></div>' +
          '<div style="padding:0 6px 6px">' + (tab === 'grants' ? UI.table([
            { label: '持有人', render: (g) => '<b>' + E(g.holder) + '</b><div class="small muted">' + E(g.company) + '</div>' },
            { label: '权益', render: (g) => E(benefitOf(g.benefitId).name || g.benefitId) },
            { label: '额度', align: 'right', render: (g) => '<span class="tnum">' + g.remaining + ' / ' + g.qty + '</span>' },
            { label: '到期', render: (g) => '<span class="small tnum">' + E(g.expires) + '</span>' },
            { label: '状态', render: (g) => UI.pill(g.status === 'active' ? '生效中' : g.status === 'used' ? '已用完' : '已过期', g.status === 'active' ? 'green' : 'grey') },
            { label: '', align: 'right', render: (g) => '<div class="rowact">' + (g.status === 'active' ? '<button data-act="redeem" data-id="' + g.id + '" title="核销一次">' + I('check', 13) + '</button>' : '') +
              '<button data-act="grantRevoke" data-id="' + g.id + '" title="撤回">' + I('undo', 13) + '</button></div>' }
          ], grants.map((g) => Object.assign({ _id: g.id }, g))) : UI.table([
            { label: '时间', render: (r) => '<span class="small tnum">' + E(r.at) + '</span>' },
            { label: '持有人', render: (r) => '<b>' + E(r.holder) + '</b>' },
            { label: '权益', render: (r) => E(benefitOf(r.benefitId).name || r.benefitId) },
            { label: '数量', align: 'right', render: (r) => '<span class="tnum">' + r.qty + '</span>' },
            { label: '来源', render: (r) => '<span class="small">' + E(r.channel) + '</span>' },
            { label: '关联订单', render: (r) => '<span class="small tnum">' + E(r.order) + '</span>' }
          ], reds.map((r) => Object.assign({ _id: r.id }, r)))) + '</div></div>';
    },
    actions: {
      beneTab(d) { P['lib-benefits'].state.tab = d.id; App.refresh(); },
      grantNew(d) { openGrant(d && d.id); },
      redeem(d) {
        const g = dbx().shared.grants.find((x) => x.id === d.id);
        if (!g || g.remaining <= 0) { UI.toast('该权益已无剩余额度', 'warn'); return; }
        Store.snapshot();
        g.remaining--;
        if (g.remaining <= 0) g.status = 'used';
        const b = benefitOf(g.benefitId);
        b.used = (b.used || 0) + 1;
        Store.pushItem('shared.redemptions', { id: 'rd' + Date.now(), grantId: g.id, benefitId: g.benefitId, holder: g.holder, qty: 1, at: '2026-11-08 10:00', order: 'BK' + Date.now(), channel: '后台手工核销' }, '核销权益');
        Store.mark('shared.grants', '核销 · ' + g.holder);
        UI.toast('已核销 1 次，剩余 ' + g.remaining);
        App.refresh();
      },
      grantRevoke(d) {
        const g = dbx().shared.grants.find((x) => x.id === d.id);
        UI.confirm({ title: '撤回这份权益？', desc: g.holder + ' · ' + (benefitOf(g.benefitId).name || '') + '，撤回后客户端立即不可用。', danger: true, okText: '撤回' })
          .then((ok) => { if (!ok) return; Store.removeItem('shared.grants', d.id, 'id', '撤回权益'); UI.toast('已撤回'); App.refresh(); });
      }
    }
  };

  function openGrant(benefitId) {
    ensure();
    const benefits = dbx().shared.benefits;
    const people = customerList();
    UI.formDrawer({
      title: '发放权益', sub: '可发给个人，也可按企业批量发放', icon: 'gift', okText: '确认发放',
      fields: [
        { key: 'benefitId', label: '权益', type: 'select', value: benefitId || benefits[0].id, options: benefits.map((b) => ({ v: b.id, l: b.name + '（剩余 ' + b.stock + '）' })) },
        { key: 'holder', label: '持有人', type: 'select', value: people[0] ? people[0].name : '林悦', options: people.slice(0, 16).map((p) => p.name) },
        { key: 'qty', label: '数量', type: 'num', value: 1 },
        { key: 'expires', label: '到期日', value: '2027-03-31' }
      ],
      hint: '发放后员工在职工健康 H5 的「我的权益」中立即可见；核销会回写台账。',
      onSave(v) {
        const b = benefitOf(v.benefitId);
        const p = people.find((x) => x.name === v.holder);
        Store.snapshot();
        Store.pushItem('shared.grants', { id: 'gr' + Date.now(), benefitId: v.benefitId, holder: v.holder, company: (p && p.dept) || '示例科技', qty: v.qty, remaining: v.qty, expires: v.expires || '2027-03-31', status: 'active', at: '2026-11-08' }, '发放权益');
        b.issued = (b.issued || 0) + v.qty;
        UI.toast('已向 ' + v.holder + ' 发放 ' + v.qty + ' 份「' + b.name + '」');
        App.refresh();
      }
    });
  }

  /* ================================================================== RULES */
  P['lib-rules'] = {
    app: 'all', title: '规则模板库', sub: '预约、取消、积分、评分、奖励规则一次定义多处套用',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    render() {
      ensure();
      const list = dbx().shared.rules;
      const use = list.reduce((n, r) => n + r.appliedTo.length, 0);
      return K.head('规则模板库', '规则是跨对象共享的约束，不是每个服务里重新填一遍',
        '<button class="btn" data-act="go" data-id="g-gaps">' + I('target', 15) + '未套用检查</button>' +
        '<button class="btn primary" data-act="ruleNew">' + I('plus', 15) + '新建规则</button>', 'SHARED / RULES') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>规则模板</span><b>' + list.length + '</b><em>5 种类型</em></div>' +
          '<div class="vsum-card ok"><span>已套用</span><b>' + use + '</b><em>服务 / 营期 / 五好</em></div>' +
          '<div class="vsum-card warn"><span>未套用</span><b>' + list.filter((r) => !r.appliedTo.length).length + '</b><em>可一键应用</em></div>' +
          '<div class="vsum-card"><span>最近变更</span><b>' + E(list.slice().sort((a, b) => (a.updated < b.updated ? 1 : -1))[0].updated.slice(5)) + '</b><em>规则改动需发布</em></div>' +
        '</div>' +
        '<div class="rule-grid">' + list.map((r) =>
          '<section class="rule-card"><header><span class="rule-ic ' + (r.type === '预约' ? 'blue' : r.type === '积分' ? 'teal' : r.type === '评分' ? 'violet' : 'amber') + '">' + I(r.type === '取消' ? 'undo' : r.type === '积分' ? 'star' : r.type === '评分' ? 'chart' : r.type === '奖励' ? 'gift' : 'calendar', 16) + '</span>' +
            '<div><b>' + E(r.name) + '</b><span>' + E(r.type) + '规则 · ' + E(r.owner) + '</span></div><em class="pill grey">' + r.appliedTo.length + ' 处</em></header>' +
            '<p>' + E(r.desc) + '</p><div class="rule-vals">' + r.values.map((v) => '<span><b>' + E(String(v.v)) + (v.u ? ' ' + E(v.u) : '') + '</b><em>' + E(v.l) + '</em></span>').join('') + '</div>' +
            '<div class="rule-applied">' + (r.appliedTo.length ? r.appliedTo.map((x) => '<span>' + E(x) + '</span>').join('') : '<span class="warn">尚未套用到任何对象</span>') + '</div>' +
            '<footer><button class="vmini" data-act="ruleEdit" data-id="' + r.id + '">' + I('edit', 12) + '编辑</button>' +
              '<button class="vmini" data-act="ruleApply" data-id="' + r.id + '">' + I('link', 12) + '套用</button>' +
              '<span class="spacer"></span><span class="small mut">' + E(r.updated) + '</span></footer>' +
          '</section>').join('') + '</div>';
    },
    actions: {
      ruleNew() {
        UI.formDrawer({ title: '新建规则模板', sub: '定义一次，可套用到多个对象', icon: 'sliders',
          fields: [{ key: 'name', label: '规则名称' }, { key: 'type', label: '类型', type: 'select', options: ['预约', '取消', '积分', '评分', '奖励'] }, { key: 'desc', label: '说明', type: 'area' }],
          onSave(v) {
            Store.pushItem('shared.rules', { id: 'rl' + Date.now(), name: v.name || '新规则', type: v.type, desc: v.desc, values: [], appliedTo: [], owner: '运营中心', updated: '2026-11-08' }, '新建规则');
            UI.toast('规则模板已创建');
            App.refresh();
          } });
      },
      ruleEdit(d) { openRule(d.id); },
      ruleApply(d) { openApply(d.id); }
    }
  };

  function openRule(id) {
    ensure();
    const r = dbx().shared.rules.find((x) => x.id === id);
    if (!r) return;
    UI.drawer({
      width: 520, title: '编辑规则 · ' + r.name, sub: r.type + '规则 · ' + r.owner, icon: 'sliders', tone: 'blue',
      body: '<div class="formsec"><h4>规则说明</h4>' + UI.fInput({ label: '名称', value: r.name }) + UI.fArea({ label: '说明', value: r.desc, rows: 3 }) + '</div>' +
        '<div class="formsec"><h4>参数</h4>' + r.values.map((v, k) =>
          '<div class="frow">' + UI.fInput({ label: v.l, value: v.v }) + UI.fInput({ label: '单位', value: v.u }) + '</div>').join('') +
        '<div class="hint">改参数不会自动改已套用的对象，需在「套用」里重新下发。</div></div>' +
        '<div class="formsec"><h4>已套用到</h4>' + (r.appliedTo.length ? r.appliedTo.map((x) => '<span class="chip on" style="margin:0 6px 6px 0">' + E(x) + '</span>').join('') : '<div class="vempty-sm">尚未套用</div>') + '</div>',
      okText: '保存规则',
      onOk(n) {
        const inputs = n.querySelectorAll('.field .input');
        const area = n.querySelector('textarea');
        r.name = inputs[0].value.trim() || r.name;
        r.desc = area.value;
        r.values = r.values.map((v, k) => ({ k: v.k, l: v.l, v: inputs[1 + k * 2] ? inputs[1 + k * 2].value : v.v, u: inputs[2 + k * 2] ? inputs[2 + k * 2].value : v.u }));
        r.updated = '2026-11-08';
        Store.mark('shared.rules', '编辑规则 · ' + r.name);
        UI.toast('规则已保存');
        App.refresh();
      }
    });
  }

  function applyTargets(r) {
    const db = dbx();
    const out = [];
    if (r.type === '积分' || r.type === '奖励') {
      (db.versionall.camps || []).slice(0, 3).forEach((c) => out.push({ v: 'camp:' + c.id, l: '营期 · ' + c.name }));
    } else if (r.type === '评分') {
      out.push({ v: 'fivegood', l: '五好生活 · 评分权重' });
    } else {
      (db.employee.services || []).filter((s) => s.status !== 'draft').slice(0, 10).forEach((s) => out.push({ v: 'svc:' + s.id, l: '服务 · ' + s.name }));
    }
    return out;
  }

  function openApply(id) {
    ensure();
    const r = dbx().shared.rules.find((x) => x.id === id);
    const targets = applyTargets(r);
    UI.drawer({
      width: 520, title: '套用规则 · ' + r.name, sub: '选择目标后，规则参数会写入对象并进入待发布', icon: 'link', tone: 'teal',
      body: '<div class="formsec"><h4>目标对象</h4><div class="chips" data-role="targets">' +
        targets.map((t) => '<button class="chip" data-t="' + t.v + '">' + E(t.l) + '</button>').join('') + '</div>' +
        '<div class="hint">可多选。已套用的对象会保持勾选。</div></div>' +
        '<div class="formsec"><h4>下发内容</h4><div class="rule-vals">' + r.values.map((v) => '<span><b>' + E(String(v.v)) + (v.u ? ' ' + E(v.u) : '') + '</b><em>' + E(v.l) + '</em></span>').join('') + '</div></div>' +
        UI.impact(['预约表单', '客户端可约范围', '结算规则']),
      okText: '套用并标记发布',
      mount(n) {
        n.querySelectorAll('[data-role="targets"] .chip').forEach((b) => {
          if (r.appliedTo.some((x) => x.indexOf(b.textContent.replace('服务 · ', '').replace('营期 · ', '').replace('五好生活 · ', '')) >= 0)) b.classList.add('on');
          b.addEventListener('click', () => b.classList.toggle('on'));
        });
      },
      onOk(n) {
        const chosen = Array.from(n.querySelectorAll('[data-role="targets"] .chip.on')).map((b) => b.dataset.t);
        if (!chosen.length) { UI.toast('请至少选择一个目标对象', 'warn'); return false; }
        Store.snapshot();
        const db = dbx();
        const vals = {};
        r.values.forEach((v) => { vals[v.k] = v.v; });
        chosen.forEach((t) => {
          if (t.indexOf('svc:') === 0) {
            const s = db.employee.services.find((x) => x.id === t.slice(4));
            if (s) {
              s.rules = s.rules || {};
              if (vals.leadDays != null) s.rules.leadDays = Number(vals.leadDays);
              if (vals.maxDays != null) s.rules.maxDays = Number(vals.maxDays);
              if (vals.cancelHours != null) s.rules.cancelHours = Number(vals.cancelHours);
              if (vals.noShow != null) s.rules.noShow = '爽约 ' + vals.noShow + ' 次冻结预约 30 天';
              Store.mark('employee.services', '套用规则 · ' + s.name);
              if (r.appliedTo.indexOf('服务 · ' + s.name) < 0) r.appliedTo.push('服务 · ' + s.name);
            }
          } else if (t.indexOf('camp:') === 0) {
            const c = db.versionall.camps.find((x) => x.id === t.slice(5));
            if (c) {
              if (vals.weight != null) db.versionall.checkin.points.weight = Number(vals.weight);
              if (vals.diet != null) db.versionall.checkin.points.diet = Number(vals.diet);
              if (vals.exercise != null) db.versionall.checkin.points.exercise = Number(vals.exercise);
              if (vals.dailyCap != null) db.versionall.checkin.points.dailyCap = Number(vals.dailyCap);
              Store.mark('versionall.checkin', '套用积分规则 · ' + c.name);
              if (r.appliedTo.indexOf('营期 · ' + c.name) < 0) r.appliedTo.push('营期 · ' + c.name);
            }
          } else if (t === 'fivegood') {
            if (vals.pass != null) db.fivegood.scoreRule.pass = Number(vals.pass);
            if (vals.excellent != null) db.fivegood.scoreRule.excellent = Number(vals.excellent);
            Store.mark('fivegood.scoreRule', '套用评分规则');
            if (r.appliedTo.indexOf('五好 · 评分权重') < 0) r.appliedTo.push('五好 · 评分权重');
          }
        });
        r.updated = '2026-11-08';
        Store.mark('shared.rules', '套用规则 · ' + r.name);
        UI.toast('已套用 ' + chosen.length + ' 个对象');
        App.refresh();
      }
    });
  }

  /* ============================================================= TEMPLATES */
  P['lib-templates'] = {
    app: 'all', title: '项目模板', sub: '营期、五好、企业体检季与高客方案一键复用',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    render() {
      ensure();
      const list = dbx().shared.templates;
      return K.head('项目模板', '把跑通过的方案固化成模板，新营期与新企业不再从零配置',
        '<button class="btn" data-act="go" data-id="v-camps">' + I('calendar', 15) + '营期管理</button>', 'SHARED / TEMPLATES') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>模板</span><b>' + list.length + '</b><em>4 类项目</em></div>' +
          '<div class="vsum-card ok"><span>累计复用</span><b>' + list.reduce((n, t) => n + t.uses, 0) + '</b><em>营期 / 企业 / 旅程</em></div>' +
          '<div class="vsum-card"><span>覆盖场景</span><b>4</b><em>减重 / 五好 / 体检 / 高客</em></div>' +
          '<div class="vsum-card"><span>最近使用</span><b>2026-11-04</b><em>第 8 期轻盈启程</em></div>' +
        '</div>' +
        '<div class="tpl-grid">' + list.map((t) =>
          '<section class="tpl-card"><header><span class="tpl-ic ' + t.tone + '">' + I(t.type === 'fivegood' ? 'spark' : t.type === 'campaign' ? 'send' : t.type === 'bundle' ? 'gift' : 'calendar', 18) + '</span>' +
            '<div><b>' + E(t.name) + '</b><span>' + E(t.scope) + ' · 已复用 ' + t.uses + ' 次</span></div></header>' +
            '<p>' + E(t.desc) + '</p><ul>' + t.items.map((x) => '<li>' + I('check', 12) + E(x) + '</li>').join('') + '</ul>' +
            '<footer><span class="small mut">更新 ' + E(t.updated) + '</span><button class="vmini" data-act="tplView" data-id="' + t.id + '">预览</button>' +
            '<button class="vmini primary" data-act="tplUse" data-id="' + t.id + '">' + I('copy', 12) + '使用模板</button></footer>' +
          '</section>').join('') + '</div>';
    },
    actions: {
      tplView(d) { viewTemplate(d.id); },
      tplUse(d) { useTemplate(d.id); }
    }
  };

  function viewTemplate(id) {
    const t = dbx().shared.templates.find((x) => x.id === id);
    UI.modal({
      wide: true, title: t.name, desc: t.desc,
      body: '<div class="tpl-preview"><div class="tpl-preview-side"><span class="pill ' + (t.type === 'camp' ? 'blue' : t.type === 'fivegood' ? 'green' : t.type === 'campaign' ? 'amber' : 'violet') + '">' + E(t.scope) + '</span>' +
        '<h3>包含内容</h3><ul>' + t.items.map((x) => '<li>' + I('check', 12) + E(x) + '</li>').join('') + '</ul></div>' +
        '<div class="tpl-preview-main">' + (t.type === 'camp' ? '<div class="tpl-flow">' + ['开营评估', '28 天打卡', '周度批注', '结营报告'].map((x, k) => '<div><span>' + (k + 1) + '</span><b>' + x + '</b></div>').join('<i></i>') + '</div>'
          : t.type === 'campaign' ? '<div class="tpl-flow">' + t.steps.map((s) => '<div><span>D' + s.day + '</span><b>' + E(s.name) + '</b></div>').join('<i></i>') + '</div>'
            : t.type === 'bundle' ? '<div class="tpl-price"><b>' + money(t.bundle.price) + '</b><span>结算 ' + money(t.bundle.settle) + ' · 成本 ' + money(t.bundle.cost) + '</span></div>'
              : '<div class="tpl-dims">' + Object.keys(t.dims).map((k) => '<div><b>' + ({ eat: '吃', sleep: '睡', move: '动', mind: '心', check: '查' }[k]) + '</b><span>' + t.dims[k] + '%</span></div>').join('') + '</div>') + '</div></div>',
      okText: '使用此模板', onOk() { viewTemplateCloseThenUse(id); }
    });
  }
  function viewTemplateCloseThenUse(id) { setTimeout(() => useTemplate(id), 30); }

  function useTemplate(id) {
    const t = dbx().shared.templates.find((x) => x.id === id);
    const label = t.type === 'camp' ? '新营期名称' : t.type === 'campaign' ? '新旅程名称' : t.type === 'bundle' ? '新服务包名称' : '新周期名称';
    UI.formDrawer({
      title: '使用「' + t.name + '」', sub: '模板会生成一份新的草稿，原模板不变', icon: 'copy', okText: '生成草稿',
      fields: [{ key: 'name', label: label, value: t.name.replace('标准模板', '').replace('模板', '') + ' · 副本' }, { key: 'owner', label: '负责人', value: '孙敏' }],
      hint: '生成后进入待发布队列，可在对应模块继续微调。',
      onSave(v) {
        const name = v.name.trim() || t.name;
        Store.snapshot();
        let route = 'workbench';
        if (t.type === 'camp') {
          Store.pushItem('versionall.camps', { id: 'camp' + Date.now(), code: 'PKU-2026-T' + (dbx().versionall.camps.length + 1), name: name, theme: t.camp.theme, start: '2027-01-05', end: '2027-02-01', status: 'draft', capacity: t.camp.capacity, host: '北京大学国际医院', location: '线上', enrolled: 0, owner: v.owner || '孙敏' }, '使用营期模板');
          route = 'v-camps';
        } else if (t.type === 'campaign') {
          Store.pushItem('shared.journeys', { id: 'jr' + Date.now(), name: name, audience: t.scope, trigger: '活动开始时', status: 'draft', entered: 0, conversion: 0, steps: t.steps.map((s) => ({ day: s.day, channel: s.channel, tpl: 'mt2', name: s.name })) }, '使用旅程模板');
          route = 'lib-journeys';
        } else if (t.type === 'bundle') {
          Store.pushItem('bundles', { id: 'b' + Date.now(), name: name, code: 'PKG-T' + Date.now().toString().slice(-4), type: 'bundle', status: 'draft', price: t.bundle.price, settle: t.bundle.settle, cost: t.bundle.cost, audience: t.scope, svcCount: 7, sold: 0, owner: v.owner || '客户成功部', desc: t.desc }, '使用服务包模板');
          route = 'svc-bundles';
        } else {
          t.tasks.forEach((task) => Store.pushItem('fivegood.tasks', { id: 'ft' + Date.now() + Math.random().toString(36).slice(2, 5), dim: task.dim, week: task.week, title: task.title, type: task.type, points: task.points, on: true }, '使用五好模板任务'));
          route = 'fg-overview';
        }
        t.uses++;
        Store.mark('shared.templates', '模板使用 · ' + t.name);
        UI.toast('已从模板生成草稿');
        App.go(route);
      }
    });
  }

  /* ================================================================= GRAPH */
  const NODE_GROUP = { channel: '渠道', page: '前端页面', service: '服务', camp: '项目', benefit: '权益', content: '内容', customer: '客户', org: '机构', enterprise: '企业', settle: '结算', journey: '旅程', rule: '规则' };
  const NODE_COLOR = { channel: '#0A9E94', page: '#0B63E5', service: '#3F8CFF', camp: '#6B5CE0', benefit: '#C8871A', content: '#0AA39A', customer: '#43526A', org: '#8B7CF6', enterprise: '#0B63E5', settle: '#5B6B82', journey: '#D9503F', rule: '#0A9E94' };
  const EDGE_NAME = { deploy: '投放', ref: '引用', trigger: '触发', settle: '结算', impact: '影响' };

  function graphNodes() {
    const db = dbx();
    const camp = (db.versionall.camps || [])[0] || {};
    return [
      { id: 'ch:brand', name: '品牌站 H5', sub: '公众获客', group: 'channel', route: 'b-home', x: 92, y: 112 },
      { id: 'ch:emp', name: '职工健康 H5', sub: '企业员工', group: 'channel', route: 'e-site', x: 92, y: 338 },
      { id: 'ch:camp', name: '减重营 H5', sub: '营期学员', group: 'channel', route: 'v-dashboard', x: 92, y: 566 },
      { id: 'pg:brand', name: '品牌站首页', sub: '服务 / 专家 / 机构', group: 'page', route: 'b-home', x: 304, y: 112 },
      { id: 'pg:emp', name: '职工端首页', sub: '服务目录 / 预约', group: 'page', route: 'e-site', x: 304, y: 338 },
      { id: 'pg:camp', name: '学员首页', sub: '打卡 / 奖励 / 报告', group: 'page', route: 'v-dashboard', x: 304, y: 566 },
      { id: 'sv:exam', name: '职工年度体检', sub: 'SVC-1001 · 在售', group: 'service', route: 'svc-360', x: 520, y: 108, ctx: { id: 'annual-exam' } },
      { id: 'sv:fivehigh', name: '五高一重共管', sub: '慢病 · 12 周', group: 'service', route: 'svc-360', x: 520, y: 252, ctx: { id: 'fivehigh' } },
      { id: 'sv:gastro', name: '无痛胃肠镜', sub: '深度筛查', group: 'service', route: 'svc-360', x: 520, y: 396, ctx: { id: 'gastro' } },
      { id: 'sv:fast', name: '就医快通', sub: '就医服务', group: 'service', route: 'svc-360', x: 520, y: 540, ctx: { id: 'fast' } },
      { id: 'cp:7', name: camp.name || '第七期', sub: '28 天营期', group: 'camp', route: 'v-camps', x: 520, y: 684 },
      { id: 'bf:exam', name: '年度体检权益', sub: '1 次 / 人 / 年', group: 'benefit', route: 'lib-benefits', x: 724, y: 108 },
      { id: 'bf:eap', name: 'EAP 咨询', sub: '6 次 / 人 / 年', group: 'benefit', route: 'lib-benefits', x: 724, y: 252 },
      { id: 'bf:coupon', name: '商城 100 元券', sub: '2 张 / 季', group: 'benefit', route: 'lib-benefits', x: 724, y: 396 },
      { id: 'ct:autumn', name: '秋季体检内容', sub: 'Banner + 公告', group: 'content', route: 'g-content', x: 724, y: 540 },
      { id: 'jr:report', name: '体检后关怀', sub: '3 步旅程', group: 'journey', route: 'lib-journeys', x: 724, y: 684 },
      { id: 'crm:lin', name: '林悦', sub: '示例科技 · 高价值', group: 'customer', route: 'crm-360', x: 936, y: 108, ctx: { id: '林悦' } },
      { id: 'crm:chen', name: '陈嘉禾', sub: '示例科技', group: 'customer', route: 'crm-360', x: 936, y: 252, ctx: { id: '陈嘉禾' } },
      { id: 'crm:zhao', name: '赵启明', sub: '五高 · 高风险', group: 'customer', route: 'crm-360', x: 936, y: 396, ctx: { id: '赵启明' } },
      { id: 'org:guoji', name: '北大国际医院', sub: '属地履约', group: 'org', route: 'g-orgs', x: 936, y: 540 },
      { id: 'org:online', name: '线上视频面诊', sub: '全国履约', group: 'org', route: 'g-orgs', x: 936, y: 684 },
      { id: 'ent:demo', name: '示例科技', sub: '1,780 员工', group: 'enterprise', route: 'e-orgs', x: 1110, y: 108 },
      { id: 'st:month', name: '月结 30 天', sub: '对账 · 开票 · 回款', group: 'settle', route: 'trd-settle', x: 1110, y: 252 },
      { id: 'rl:book', name: '标准预约规则', sub: '2 处套用', group: 'rule', route: 'lib-rules', x: 1110, y: 396 }
    ];
  }
  function graphEdges() {
    return [
      { from: 'ch:brand', to: 'pg:brand', type: 'deploy' },
      { from: 'ch:emp', to: 'pg:emp', type: 'deploy' },
      { from: 'ch:camp', to: 'pg:camp', type: 'deploy' },
      { from: 'pg:brand', to: 'sv:exam', type: 'deploy' },
      { from: 'pg:brand', to: 'sv:gastro', type: 'deploy' },
      { from: 'pg:emp', to: 'sv:exam', type: 'deploy' },
      { from: 'pg:emp', to: 'sv:fivehigh', type: 'deploy' },
      { from: 'pg:emp', to: 'sv:fast', type: 'deploy' },
      { from: 'pg:camp', to: 'cp:7', type: 'deploy' },
      { from: 'sv:exam', to: 'bf:exam', type: 'trigger' },
      { from: 'sv:exam', to: 'org:guoji', type: 'ref' },
      { from: 'sv:exam', to: 'rl:book', type: 'ref' },
      { from: 'sv:exam', to: 'ct:autumn', type: 'ref' },
      { from: 'sv:fivehigh', to: 'bf:eap', type: 'trigger' },
      { from: 'sv:fivehigh', to: 'crm:zhao', type: 'trigger' },
      { from: 'sv:fast', to: 'crm:chen', type: 'trigger' },
      { from: 'sv:gastro', to: 'org:guoji', type: 'ref' },
      { from: 'sv:gastro', to: 'crm:zhao', type: 'trigger' },
      { from: 'cp:7', to: 'bf:coupon', type: 'trigger' },
      { from: 'cp:7', to: 'crm:lin', type: 'ref' },
      { from: 'bf:exam', to: 'crm:lin', type: 'ref' },
      { from: 'bf:eap', to: 'crm:lin', type: 'ref' },
      { from: 'bf:coupon', to: 'crm:chen', type: 'ref' },
      { from: 'jr:report', to: 'ct:autumn', type: 'ref' },
      { from: 'jr:report', to: 'crm:lin', type: 'trigger' },
      { from: 'ent:demo', to: 'bf:exam', type: 'impact' },
      { from: 'ent:demo', to: 'st:month', type: 'settle' },
      { from: 'crm:lin', to: 'st:month', type: 'settle' },
      { from: 'crm:chen', to: 'st:month', type: 'settle' }
    ];
  }

  P['g-graph'] = {
    app: 'all', title: '关系图谱', sub: '渠道、页面、服务、权益、客户与结算的完整链路',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    state: { filter: 'all', sel: 'sv:exam' },
    render() {
      ensure();
      const nodes = graphNodes(), edges = graphEdges();
      const st = P['g-graph'].state;
      const sel = nodes.find((n) => n.id === st.sel) || nodes[0];
      const vis = edges.filter((e) => st.filter === 'all' || e.type === st.filter);
      const nodeMap = {};
      nodes.forEach((n) => { nodeMap[n.id] = n; });
      const linked = edges.filter((e) => e.from === sel.id || e.to === sel.id);
      const missing = [
        { from: 'sv:fivehigh', to: 'ct:autumn', type: 'ref', note: '服务已上架但无内容投放' },
        { from: 'bf:coupon', to: 'st:month', type: 'settle', note: '券核销未进入结算口径' },
        { from: 'org:online', to: 'crm:lin', type: 'trigger', note: '线上履约未回写客户' }
      ];
      const counts = Object.keys(NODE_GROUP).map((g) => ({ g: g, n: nodes.filter((x) => x.group === g).length, color: NODE_COLOR[g] })).filter((x) => x.n);
      return K.head('关系图谱', '把「改了一个价格，谁受影响」变成一张可点击的网，而不是一串菜单',
        '<div class="vseg">' + ['all', 'deploy', 'ref', 'trigger', 'settle', 'impact'].map((x) =>
          '<button data-act="gFilter" data-id="' + x + '" class="' + (st.filter === x ? 'on' : '') + '">' + (x === 'all' ? '全部关系' : EDGE_NAME[x]) + '</button>').join('') + '</div>' +
        '<button class="btn" data-act="go" data-id="g-gaps">' + I('target', 15) + '关联缺口</button>', 'SHARED / GRAPH') +
        '<div class="graph-legend">' + counts.map((c) => '<span><i style="background:' + c.color + '"></i>' + NODE_GROUP[c.g] + '<b>' + c.n + '</b></span>').join('') +
          '<span class="right"><i class="dash"></i>缺失关系 ' + missing.length + '</span></div>' +
        '<div class="graph-wrap">' +
          '<div class="graph-canvas"><svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet">' +
            '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="#a9bdd7"/></marker></defs>' +
            vis.map((e) => {
              const a = nodeMap[e.from], b = nodeMap[e.to];
              if (!a || !b) return '';
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + (b.y - a.y ? 24 : 0);
              const hot = e.from === sel.id || e.to === sel.id;
              const dim = st.filter !== 'all';
              return '<path class="gedge ' + e.type + (hot ? ' hot' : '') + (dim ? ' dim' : '') + '" d="M' + (a.x + 58) + ' ' + a.y + ' Q' + mx + ' ' + my + ' ' + (b.x - 58) + ' ' + b.y + '"/>';
            }).join('') +
            missing.map((e) => {
              const a = nodeMap[e.from], b = nodeMap[e.to];
              if (!a || !b || !linked.some((l) => l.from === sel.id || l.to === sel.id)) return '';
              const mx = (a.x + b.x) / 2;
              return '<path class="gedge missing" d="M' + (a.x + 58) + ' ' + a.y + ' Q' + mx + ' ' + (a.y - 50) + ' ' + (b.x - 58) + ' ' + b.y + '"/>';
            }).join('') +
            nodes.map((n) => {
              const on = n.id === sel.id;
              const dim = st.filter !== 'all' && !vis.some((e) => (e.from === n.id || e.to === n.id));
              const color = NODE_COLOR[n.group];
              return '<g class="gnode ' + (on ? 'on' : '') + (dim ? ' dim' : '') + '" data-act="gNode" data-id="' + n.id + '" transform="translate(' + n.x + ',' + n.y + ')">' +
                '<rect x="-58" y="-27" width="116" height="54" rx="13" fill="#fff" stroke="' + (on ? color : '#dce7f5') + '" stroke-width="' + (on ? 1.8 : 1) + '"/>' +
                '<circle cx="-41" cy="-11" r="4.5" fill="' + color + '"/>' +
                '<text class="gn-t" x="-31" y="-7">' + E(n.name.length > 9 ? n.name.slice(0, 8) + '…' : n.name) + '</text>' +
                '<text class="gn-s" x="-31" y="9">' + E(n.sub.length > 12 ? n.sub.slice(0, 11) + '…' : n.sub) + '</text>' +
                '<text class="gn-g" x="-41" y="20">' + E(NODE_GROUP[n.group]) + '</text></g>';
            }).join('') +
          '</svg></div>' +
          '<aside class="graph-side"><div class="gs-head"><span class="vdot" style="background:' + NODE_COLOR[sel.group] + '"></span><div><b>' + E(sel.name) + '</b><span>' + E(NODE_GROUP[sel.group]) + '</span></div></div>' +
            '<p class="gs-sub">' + E(sel.sub) + '</p>' +
            '<div class="gs-count"><b>' + linked.length + '</b><span>条直接关系</span></div>' +
            '<div class="gs-list">' + (linked.length ? linked.map((e) => {
              const other = nodeMap[e.from === sel.id ? e.to : e.from];
              if (!other) return '';
              return '<button data-act="gNode" data-id="' + other.id + '"><span class="vdot" style="background:' + NODE_COLOR[other.group] + '"></span>' +
                '<div><b>' + E(other.name) + '</b><span>' + EDGE_NAME[e.type] + ' · ' + E(NODE_GROUP[other.group]) + '</span></div>' + I('chevron', 12) + '</button>';
            }).join('') : '<div class="vempty-sm">暂无直接关系</div>') + '</div>' +
            (missing.filter((e) => e.from === sel.id || e.to === sel.id).length ? '<div class="gs-missing"><em>缺失关系</em>' + missing.filter((e) => e.from === sel.id || e.to === sel.id).map((e) => '<div>' + I('x', 12) + E(e.note) + '</div>').join('') + '</div>' : '') +
            '<button class="btn primary" data-act="gGo" data-id="' + sel.id + '" style="width:100%;justify-content:center">打开管理页' + I('chevron', 13) + '</button>' +
          '</aside>' +
        '</div>';
    },
    actions: {
      gFilter(d) { P['g-graph'].state.filter = d.id; App.refresh(); },
      gNode(d) { P['g-graph'].state.sel = d.id; App.refresh(); },
      gGo(d) {
        const n = graphNodes().find((x) => x.id === d.id);
        if (n) App.go(n.route, n.ctx || {});
      }
    }
  };

  /* ================================================================== GAPS */
  function scanGaps() {
    ensure();
    const db = dbx();
    const out = [];
    const services = db.employee.services || [];
    (services.filter((s) => s.status === 'online').slice(0, 12)).forEach((s) => {
      const used = (db.shared.assets || []).some((a) => (a.reuse || []).some((u) => u.t === 'svc' && u.id === s.id));
      if (!used) out.push({ id: 'asset-' + s.id, sev: 'mid', obj: s.name, type: '服务缺素材', missing: '没有引用任何共享资产', route: 'svc-360', ctx: { id: s.id }, fix: 'svc-asset' });
    });
    out.length = Math.min(out.length, 3);
    const noContent = services.filter((s) => s.status === 'online' && !(db.shared.assets || []).some((a) => (a.reuse || []).some((u) => u.t === 'svc' && u.id === s.id && u.content)));
    if (noContent.length) out.push({ id: 'content-svc', sev: 'low', obj: services.find((s) => s.id === 'fivehigh').name, type: '内容未关联', missing: '服务未在内容中心生成投放素材', route: 'g-content', fix: '' });
    const campDraft = (db.versionall.camps || []).find((c) => c.status === 'draft');
    if (campDraft) out.push({ id: 'camp-' + campDraft.id, sev: 'high', obj: campDraft.name, type: '营期未开招', missing: '草稿营期没有报名入口与开营时间', route: 'v-camps', fix: 'camp-open' });
    const stock0 = (db.shared.benefits || []).filter((b) => b.stock <= 0);
    stock0.forEach((b) => out.push({ id: 'stock-' + b.id, sev: 'high', obj: b.name, type: '权益库存为 0', missing: '体成分权益已发放 ' + b.issued + ' 份但库存耗尽', route: 'lib-benefits', fix: 'benefit-stock' }));
    (db.shared.assets || []).filter((a) => !(a.reuse || []).length).slice(0, 2).forEach((a) => out.push({ id: 'orphan-' + a.id, sev: 'low', obj: a.name, type: '孤立资产', missing: '上传后未被任何服务 / 内容引用', route: 'lib-assets', fix: 'asset-attach' }));
    const noRule = (db.shared.rules || []).filter((r) => !r.appliedTo.length);
    noRule.forEach((r) => out.push({ id: 'rule-' + r.id, sev: 'mid', obj: r.name, type: '规则未套用', missing: '规则模板存在但没有任何对象使用', route: 'lib-rules', fix: 'rule-apply' }));
    const pageNoOwner = [{ id: 'camp-report', name: '减重营 · 报告页', route: 'b-camp' }];
    pageNoOwner.forEach((p) => out.push({ id: 'page-' + p.id, sev: 'low', obj: p.name, type: '页面无负责人', missing: '上线页面未指定内容与发布责任人', route: 'b-camp', fix: '' }));
    return out;
  }

  P['g-gaps'] = {
    app: 'all', title: '关联缺口', sub: '自动扫描对象之间缺失的关系，并给出补全动作',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    render() {
      const gaps = scanGaps();
      const high = gaps.filter((g) => g.sev === 'high').length;
      const mid = gaps.filter((g) => g.sev === 'mid').length;
      const low = gaps.length - high - mid;
      return K.head('关联缺口', '后台不缺页面，缺的是对象之间没有接上的线',
        '<button class="btn" data-act="gapScan">' + I('refresh', 15) + '重新扫描</button>' +
        '<button class="btn primary" data-act="go" data-id="g-graph">' + I('layers', 15) + '看关系图谱</button>', 'SHARED / GAPS') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>缺口</span><b>' + gaps.length + '</b><em>扫描 5 类共享对象</em></div>' +
          '<div class="vsum-card bad"><span>阻断</span><b>' + high + '</b><em>影响履约或发放</em></div>' +
          '<div class="vsum-card warn"><span>待补</span><b>' + mid + '</b><em>不影响主流程</em></div>' +
          '<div class="vsum-card ok"><span>轻微</span><b>' + low + '</b><em>治理项</em></div>' +
        '</div>' +
        '<div class="gap-list">' + gaps.map((g) =>
          '<div class="gap-row ' + g.sev + '"><span class="gap-sev">' + (g.sev === 'high' ? '阻断' : g.sev === 'mid' ? '待补' : '轻微') + '</span>' +
            '<div class="gap-obj"><b>' + E(g.obj) + '</b><span>' + E(g.type) + '</span></div>' +
            '<div class="gap-miss">' + I('link', 13) + '<span>' + E(g.missing) + '</span></div>' +
            '<div class="gap-act">' + (g.fix ? '<button class="btn sm primary" data-act="gapFix" data-id="' + g.id + '" data-kind="' + g.fix + '">一键补全</button>' : '') +
              '<button class="btn sm" data-act="gapGo" data-id="' + g.route + '" data-ctx="' + E(g.ctx ? g.ctx.id : '') + '">去处理</button></div>' +
          '</div>').join('') + '</div>' +
        '<div class="note">缺口按实时数据计算。补全动作会写入配置并进入待发布队列，不会直接改变线上。</div>';
    },
    actions: {
      gapScan() { UI.toast('已重新扫描 ' + scanGaps().length + ' 项缺口'); App.refresh(); },
      gapGo(d) { App.go(d.id, d.ctx ? { id: d.ctx } : {}); },
      gapFix(d) { fixGap(d.id, d.kind); }
    }
  };

  function fixGap(id, kind) {
    ensure();
    const db = dbx();
    Store.snapshot();
    if (kind === 'svc-asset') {
      const svcId = id.replace('asset-', '');
      const s = db.employee.services.find((x) => x.id === svcId);
      const a = db.shared.assets[0];
      a.reuse = a.reuse || [];
      a.reuse.push({ t: 'svc', id: svcId, name: s.name });
      Store.mark('shared.assets', '服务关联素材 · ' + s.name);
      UI.toast('已把「' + a.name + '」挂到 ' + s.name);
    } else if (kind === 'camp-open') {
      const c = db.versionall.camps.find((x) => ('camp-' + x.id) === id);
      c.status = 'upcoming';
      c.start_open = true;
      Store.mark('versionall.camps', '开放报名 · ' + c.name);
      UI.toast('已开放报名入口');
    } else if (kind === 'benefit-stock') {
      const b = db.shared.benefits.find((x) => ('stock-' + x.id) === id);
      b.stock = 500;
      b.issued = b.issued || 0;
      Store.mark('shared.benefits', '补充库存 · ' + b.name);
      UI.toast('已补充 500 份库存');
    } else if (kind === 'journey-on') {
      const j = db.shared.journeys.find((x) => ('jr-' + x.id) === id);
      j.status = 'active';
      Store.mark('shared.journeys', '启用旅程 · ' + j.name);
      UI.toast('旅程已启用');
    } else if (kind === 'asset-attach') {
      const a = db.shared.assets.find((x) => ('orphan-' + x.id) === id);
      a.reuse = [{ t: 'content', id: 'c1', name: '年度体检预约开启' }];
      Store.mark('shared.assets', '补齐引用 · ' + a.name);
      UI.toast('已挂到年度体检内容');
    } else if (kind === 'channel-off') {
      const ch = db.channels.find((x) => ('ch-' + x.id) === id);
      ch.on = false;
      ch.owner = ch.owner || '运营中心';
      Store.mark('channels', '归档渠道 · ' + ch.name);
      UI.toast('未接入渠道已归档');
    } else if (kind === 'rule-apply') {
      const r = db.shared.rules.find((x) => ('rule-' + x.id) === id);
      r.appliedTo = ['服务 · 职工年度体检'];
      Store.mark('shared.rules', '套用规则 · ' + r.name);
      UI.toast('已套用到标准服务');
    } else {
      UI.toast('该缺口需要人工确认，已打开处理页', 'warn');
    }
    App.refresh();
  }

  /* ================================================================ SVC 360 */
  P['svc-360'] = {
    app: 'all', title: '服务 360', sub: '一个服务从素材到结算的完整链路',
    grp: 'e.services', papp: 'employee', preview: 'emp-detail',
    render(ctx) {
      ensure();
      const db = dbx();
      const list = db.employee.services || [];
      const s = list.find((x) => x.id === (ctx && ctx.id)) || list[0];
      const idx = list.indexOf(s);
      const price = (s.pricing || [])[0] || {};
      const bookings = db.employee.bookings.filter((b) => b.service.indexOf(s.name.replace('职工', '').replace('服务', '')) >= 0 || s.name.indexOf(b.service) >= 0);
      const assets = db.shared.assets.filter((a) => (a.reuse || []).some((u) => u.t === 'svc' && u.id === s.id));
      const rules = db.shared.rules.filter((r) => r.appliedTo.some((x) => x.indexOf(s.name) >= 0));
      const channels = (s.channels || []).map((c) => (db.channels.find((x) => x.id === c) || {}));
      const content = db.shared.assets.filter((a) => (a.reuse || []).some((u) => u.t === 'svc' && u.id === s.id && u.t === 'content'));
      const pages = [];
      if (s.channels.indexOf('h5-employee') >= 0) pages.push('职工端 · 服务目录/详情/预约');
      if (s.channels.indexOf('h5-brand') >= 0) pages.push('品牌站 · 首页/机构详情');
      if (s.channels.indexOf('web') >= 0) pages.push('官网 PC · 服务页');
      const steps = [
        { k: '素材', ok: !!assets.length, n: assets.length + ' 个资产', route: 'lib-assets' },
        { k: '定价', ok: !!(s.pricing && s.pricing.length), n: '¥' + nf(price.list) + ' 起', route: 'svc-pricing' },
        { k: '规则', ok: !!rules.length, n: rules.length + ' 套规则', route: 'lib-rules' },
        { k: '机构', ok: (db.employee.orgs || []).some((o) => o.on), n: '3 家可约', route: 'g-orgs' },
        { k: '渠道', ok: channels.length > 0, n: channels.length + ' 个渠道', route: 'svc-360' },
        { k: '页面', ok: pages.length > 0, n: pages.length + ' 个页面', route: 'g-coverage' },
        { k: '预约', ok: bookings.length > 0, n: bookings.length + ' 条', route: 'e-bookings' },
        { k: '结算', ok: true, n: '月结', route: 'trd-settle' }
      ];
      return K.head(s.name, s.code + ' · ' + s.cat + ' · ' + (s.owner || ''), 
        '<button class="btn" data-act="svcPreview">' + I('eye', 15) + '预览前端</button>' +
        '<button class="btn primary" data-act="svcEdit" data-id="' + s.id + '">' + I('edit', 15) + '编辑商品</button>', 'CATALOG / SERVICE 360') +
        '<div class="svc360-hero"><div class="svc360-mark ' + (s.status === 'online' ? 'on' : '') + '">' + I('stethoscope', 26) + '</div>' +
          '<div class="svc360-id"><h2>' + E(s.name) + '</h2><p>' + E(s.intro) + '</p><div class="vchips"><span>' + E(s.cat) + '</span><span>' + E(s.scope) + '</span>' +
            '<span class="' + (s.status === 'online' ? 'green' : '') + '">' + (s.status === 'online' ? '在售' : s.status === 'draft' ? '草稿' : '已下架') + '</span></div></div>' +
          '<div class="svc360-score"><b>' + (s.margin || 0) + '%</b><span>毛利率</span></div></div>' +
        '<div class="svc360-kpis">' +
          [['挂牌价', money(price.list), '结算 ' + money(price.settle)], ['月度预约', bookings.length + ' 单', '履约率 94%'], ['关联资产', assets.length + ' 个', '跨内容与权益'], ['覆盖渠道', channels.length + ' 个', pages.length + ' 个前端页面']].map((x) =>
            '<div><span>' + x[0] + '</span><b>' + x[1] + '</b><em>' + x[2] + '</em></div>').join('') + '</div>' +
        '<div class="svc-flow">' + steps.map((x, k) =>
          '<button class="svc-step ' + (x.ok ? 'ok' : 'bad') + '" data-act="go" data-id="' + x.route + '"><span>' + (k + 1) + '</span><b>' + x.k + '</b><em>' + x.n + '</em></button>' +
          (k < steps.length - 1 ? '<i class="svc-arrow">' + I('chevron', 11) + '</i>' : '')).join('') + '</div>' +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '商业化结构', sub: 'SKU · 价格 · 毛利', flush: true, body: UI.table([
            { label: 'SKU', render: (p) => '<b>' + E(p.name) + '</b><div class="small muted">' + p.unit + ' · 有效期 ' + p.validity + ' 天</div>' },
            { label: '成本', align: 'right', render: (p) => money(p.cost) },
            { label: '结算', align: 'right', render: (p) => '<b>' + money(p.settle) + '</b>' },
            { label: '挂牌', align: 'right', render: (p) => money(p.list) },
            { label: '毛利', align: 'right', render: (p) => '<span class="pill ' + (Math.round((p.settle - p.cost) / p.settle * 100) < 20 ? 'red' : 'green') + '">' + Math.round((p.settle - p.cost) / p.settle * 100) + '%</span>' }
          ], (s.pricing || []).map((p) => Object.assign({ _id: p.id }, p))) }) +
          K.panel({ title: '复用资产', sub: assets.length + ' 个共享资产', body: assets.length ? '<div class="svc-assets">' + assets.map((a) =>
            '<button data-act="go" data-id="lib-assets"><span class="asset-mini ' + a.tone + '">' + I(TYPE_ICON[a.type] || 'image', 15) + '</span><div><b>' + E(a.name) + '</b><span>' + TYPE_NAME[a.type] + ' · ' + E(a.owner) + '</span></div>' + I('chevron', 11) + '</button>').join('') + '</div>' : '<div class="vempty-sm">还没有引用共享资产</div>' }) +
          K.panel({ title: '最近预约', sub: bookings.length + ' 条', flush: true, body: UI.table([
            { label: '客户', render: (b) => '<b>' + E(b.person) + '</b><div class="small muted">' + E(b.dept) + '</div>' },
            { label: '时间', render: (b) => '<span class="small tnum">' + E(b.date) + ' ' + E(b.time) + '</span>' },
            { label: '机构', render: (b) => '<span class="small">' + E(b.org) + '</span>' },
            { label: '状态', render: (b) => UI.pill(b.status === 'pending' ? '待确认' : '已预约', b.status === 'pending' ? 'amber' : 'green') },
            { label: '', align: 'right', render: (b) => '<div class="rowact"><button data-act="svcCrm" data-id="' + E(b.person) + '">' + I('chevron', 12) + '</button></div>' }
          ], bookings.map((b) => Object.assign({ _id: b.id }, b))) })
        '</div><aside class="stack">' +
          K.panel({ title: '关系完整度', sub: steps.filter((x) => x.ok).length + ' / 8 环节', body: '<div class="svc-rel">' + steps.map((x) =>
            '<div class="' + (x.ok ? 'ok' : 'bad') + '"><span>' + I(x.ok ? 'check' : 'x', 12) + '</span><b>' + x.k + '</b><em>' + x.n + '</em></div>').join('') + '</div>' +
            '<div class="note ' + (steps.every((x) => x.ok) ? 'teal' : 'warn') + '">' + (steps.every((x) => x.ok) ? '链路完整，可直接投放。' : '部分环节缺失，补全后再发布。') + '</div>' }) +
          K.panel({ title: '影响面', body: '<div class="svc-impact">' + ['服务目录', '服务详情', '预约表单', '机构页', '结算单'].map((x) => '<span>' + x + '</span>').join('') + '</div>' +
            '<div class="small mut" style="margin-top:8px">修改价格 / 规则 / 渠道会同时影响以上 ' + pages.length + ' 个前端页面。</div>' }) +
          K.panel({ title: '下一步', body: '<div class="stack" style="gap:8px">' +
            '<button class="btn" data-act="svcEdit" data-id="' + s.id + '">' + I('edit', 14) + '编辑商品与价格</button>' +
            '<button class="btn" data-act="go" data-id="lib-rules">' + I('sliders', 14) + '套用规则模板</button>' +
            '<button class="btn" data-act="go" data-id="lib-assets">' + I('image', 14) + '复用素材</button></div>' }) +
        '</aside></div>';
    },
    actions: {
      svcEdit(d) { App.go('svc-detail', { id: d.id }); },
      svcPreview() { App.openPreview(); },
      svcCrm(d) { App.go('crm-360', { id: d.id }); }
    }
  };

  /* ================================================================ CRM 360 */
  P['crm-360'] = {
    app: 'all', title: '客户 360', sub: '一个人在三端的所有关系与权益',
    grp: 'trade', papp: 'employee', preview: 'emp-home',
    state: { sel: '林悦', tab: 'overview' },
    render(ctx) {
      ensure();
      const list = customerList();
      const want = (ctx && ctx.id) || P['crm-360'].state.sel;
      const sel = list.find((c) => c.name === want) || list[0];
      P['crm-360'].state.sel = sel.name;
      const tab = P['crm-360'].state.tab;
      const grants = personGrants(sel.name);
      const touches = personTouches(sel.name);
      const reds = dbx().shared.redemptions.filter((r) => r.holder === sel.name);
      const s = sel.student;
      const weights = s ? dbx().versionall.records.weight.filter((r) => r.studentId === s.id).map((r) => r.weight) : [];
      const trend = weights.length > 2 ? weights : [78.2, 77.6, 77.1, 76.4, 75.9, 75.2];
      const spend = sel.bookings.length * 1280 + (s ? 3980 : 0);
      const score = s ? Math.min(99, Math.round(s.completion)) : 62;
      return K.head('客户 360', '权益、服务、健康与触达在一个时间轴上，不再跨 5 个系统找人',
        '<button class="btn" data-act="go" data-id="crm-customer">' + I('users', 15) + '客户台账</button>' +
        '<button class="btn primary" data-act="crmExport">' + I('download', 15) + '导出档案</button>', 'TRADE / CUSTOMER 360') +
        '<div class="v360">' +
          '<aside class="v360-list"><div class="v360-search">' + I('search', 14) + '<input data-live-filter="c360" placeholder="搜索姓名 / 手机号 / 部门"></div>' +
            '<div class="v360-count">' + list.length + ' 位客户 · 最近活跃</div>' +
            list.map((c) => '<button class="v360-item ' + (c.name === sel.name ? 'on' : '') + '" data-act="pickCustomer" data-id="' + E(c.name) + '" data-filter-item="c360" data-text="' + E(c.name + ' ' + (c.phone || '') + ' ' + (c.dept || '')) + '">' +
              '<span class="vava">' + E(c.name.slice(0, 1)) + '</span><div><b>' + E(c.name) + '</b><span>' + E(c.dept || '—') + ' · ' + E((c.last || '').slice(5, 10)) + '</span></div>' +
              (c.student ? '<em class="vdot blue"></em>' : '<em class="vdot amber"></em>') + '</button>').join('') + '</aside>' +
          '<section class="v360-main"><header class="v360-hero"><span class="vava xl">' + E(sel.name.slice(0, 1)) + '</span>' +
            '<div class="v360-id"><h2>' + E(sel.name) + '</h2><p>' + E(sel.dept || '') + ' · ' + E(sel.phone || '') + ' · 最近活跃 ' + E((sel.last || '').slice(0, 10)) + '</p>' +
              '<div class="vchips">' + (sel.tags || []).map((t) => '<span>' + E(t) + '</span>').join('') + '<span class="blue">' + (s ? '减重营在营' : '企业员工') + '</span></div></div>' +
            '<div class="v360-actions"><button class="vbtn ghost" data-act="touchCustomer">' + I('send', 13) + '触达</button>' +
              '<button class="vbtn ghost" data-act="grantCustomer">' + I('gift', 13) + '发权益</button></div></header>' +
            '<div class="v360-kpis">' + [['累计服务', (sel.bookings.length + (s ? 1 : 0)) + ' 次'], ['累计消费', money(spend)], ['有效权益', grants.filter((g) => g.status === 'active').length + ' 项'], ['健康评分', score + ' 分']].map((x) =>
              '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>').join('') + '</div>' +
            '<div class="v360-tabs">' + [['overview', '概览'], ['orders', '服务订单'], ['benefits', '权益'], ['health', '健康'], ['touch', '触达']].map((x) =>
              '<button data-act="crmTab" data-id="' + x[0] + '" class="' + (tab === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
            '<div class="v360-body">' + crmBody(sel, tab, grants, touches, reds, trend, score) + '</div>' +
          '</section></div>';
    },
    actions: {
      pickCustomer(d) { P['crm-360'].state.sel = d.id; App.refresh(); },
      crmTab(d) { P['crm-360'].state.tab = d.id; App.refresh(); },
      grantCustomer() { grantTo(P['crm-360'].state.sel); },
      touchCustomer() { touchTo(P['crm-360'].state.sel); },
      crmRedeem(d) { P['lib-benefits'].actions.redeem(d); },
      crmExport() {
        const name = P['crm-360'].state.sel;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['客户档案（脱敏）\n' + name], { type: 'text/csv' }));
        a.download = 'customer-' + name + '.csv'; a.click();
        UI.toast('客户档案已导出');
      }
    }
  };

  function crmBody(sel, tab, grants, touches, reds, trend, score) {
    const s = sel.student;
    if (tab === 'orders') {
      return '<div class="v360-block"><h3>职工端预约</h3>' + (sel.bookings.length ? sel.bookings.map((b) =>
        '<div class="v360-row"><span class="vdot ' + (b.status === 'pending' ? 'amber' : 'teal') + '"></span><div><b>' + E(b.service) + '</b><span>' + E(b.date) + ' ' + E(b.time) + ' · ' + E(b.org) + '</span></div>' +
          '<em>' + (b.status === 'pending' ? '待确认' : '已预约') + '</em></div>').join('') : '<div class="vempty-sm">暂无职工端预约</div>') + '</div>' +
        '<div class="v360-block"><h3>营期关系</h3>' + (s ? '<div class="v360-row"><span class="vdot blue"></span><div><b>减重营 · ' + E(s.campIds.join(' / ')) + '</b><span>入营 ' + E(s.joined) + ' · 当前 ' + s.weight + 'kg</span></div><em>在营</em></div>' : '<div class="vempty-sm">未参加营期</div>') + '</div>';
    }
    if (tab === 'benefits') {
      return '<div class="v360-block"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">权益钱包</h3><button class="vmini primary" data-act="grantCustomer">+ 发放</button></div>' +
        (grants.length ? grants.map((g) => '<div class="crm-grant"><span class="vdot ' + (g.status === 'active' ? 'teal' : 'grey') + '"></span>' +
          '<div><b>' + E(benefitOf(g.benefitId).name || g.benefitId) + '</b><span>剩余 ' + g.remaining + ' / ' + g.qty + ' · ' + E(g.expires) + ' 到期</span></div>' +
          (g.status === 'active' ? '<button class="vmini" data-act="crmRedeem" data-id="' + g.id + '">核销</button>' : '<em class="pill grey">已用完</em>') + '</div>').join('') : '<div class="vempty-sm">暂无权益</div>') + '</div>' +
        '<div class="v360-block"><h3>核销记录</h3>' + (reds.length ? reds.map((r) => '<div class="v360-row"><span class="vdot amber"></span><div><b>' + E(benefitOf(r.benefitId).name) + '</b><span>' + E(r.at) + ' · ' + E(r.channel) + '</span></div><em>' + E(r.order) + '</em></div>').join('') : '<div class="vempty-sm">暂无核销</div>') + '</div>';
    }
    if (tab === 'health') {
      return '<div class="v360-block"><div class="row" style="justify-content:space-between"><h3>体重趋势</h3><span class="pill ' + (s && s.risk === 'high' ? 'red' : 'green') + '">' + (s ? (s.risk === 'high' ? '高风险' : s.risk === 'mid' ? '中风险' : '低风险') : '未建档') + '</span></div>' +
        '<div class="crm-chart">' + V5.spark(trend, '#0B63E5', 520, 120) + '</div><div class="crm-chart-x">' + trend.map((v, i) => '<span>' + (i === trend.length - 1 ? '当前 ' + v + 'kg' : 'W' + i) + '</span>').join('') + '</div></div>' +
        '<div class="v360-block"><h3>档案</h3>' + (s ? '<dl class="vkv"><dt>身高</dt><dd>' + s.height + ' cm</dd><dt>起始体重</dt><dd>' + s.startWeight + ' kg</dd><dt>当前体重</dt><dd>' + s.weight + ' kg</dd><dt>体脂</dt><dd>' + s.bodyFat + '%</dd><dt>目标</dt><dd>' + s.targetWeight + ' kg</dd><dt>完成度</dt><dd>' + s.completion + '%</dd></dl>' : '<div class="vempty-sm">暂无健康档案，可发起评估问卷</div>') +
        '<div class="note">健康数据来自 H5 打卡与体检报告，后台只读，不能手工修改临床指标。</div></div>';
    }
    if (tab === 'touch') {
      return '<div class="v360-block"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">触达时间轴</h3><button class="vmini primary" data-act="touchCustomer">+ 发送</button></div>' +
        (touches.length ? touches.map((t) => '<div class="vtl-row"><i class="teal"></i><div><b>' + E(t.title) + '</b><span>' + E(t.at) + ' · ' + E(t.channel) + ' · ' + E(t.tpl) + '</span></div><em class="pill ' + (t.status === '已打开' || t.status === '已点击' ? 'green' : 'grey') + '">' + E(t.status) + '</em></div>').join('') : '<div class="vempty-sm">还没有触达记录</div>') + '</div>';
    }
    return '<div class="v360-cols"><div class="v360-block"><h3>服务与订单</h3>' +
      (sel.bookings.length ? sel.bookings.slice(0, 4).map((b) => '<div class="v360-row"><span class="vdot ' + (b.status === 'pending' ? 'amber' : 'teal') + '"></span><div><b>' + E(b.service) + '</b><span>' + E(b.date) + ' · ' + E(b.org) + '</span></div><em>' + (b.status === 'pending' ? '待确认' : '已完成') + '</em></div>').join('') : '<div class="vempty-sm">暂无预约</div>') +
      (s ? '<div class="v360-row"><span class="vdot blue"></span><div><b>减重营 · ' + E(s.campIds.join(' / ')) + '</b><span>当前 ' + s.weight + 'kg · 连续 ' + s.streak + ' 天</span></div><em>在营</em></div>' : '') + '</div>' +
      '<div class="v360-block"><h3>权益与关系</h3><dl class="vkv"><dt>所属企业</dt><dd>示例科技</dd><dt>有效权益</dt><dd>' + grants.filter((g) => g.status === 'active').length + ' 项</dd><dt>责任营养师</dt><dd>' + E(s ? s.dietitian : '—') + '</dd><dt>责任教练</dt><dd>' + E(s ? s.coach : '—') + '</dd><dt>最近触达</dt><dd>' + E(touches[0] ? touches[0].at.slice(0, 10) : '—') + '</dd></dl></div>' +
      '<div class="v360-block"><h3>健康概览</h3><div class="crm-mini">' + V5.spark(trend, '#0A9E94', 210, 64) + '</div>' +
        '<div class="small mut">' + (s ? '体重 ' + s.weight + 'kg · 体脂 ' + s.bodyFat + '% · 完成度 ' + s.completion + '%' : '暂无健康档案') + '</div></div></div>' +
      '<div class="v360-block v360-timeline"><h3>最近动态</h3>' +
        sel.bookings.slice(0, 2).map((b) => '<div class="vtl-row"><i></i><div><b>预约「' + E(b.service) + '」</b><span>' + E(b.created || b.date) + '</span></div></div>').join('') +
        touches.slice(0, 2).map((t) => '<div class="vtl-row"><i class="teal"></i><div><b>收到「' + E(t.title) + '」</b><span>' + E(t.at) + ' · ' + E(t.channel) + '</span></div></div>').join('') +
        (s ? '<div class="vtl-row"><i class="violet"></i><div><b>完成第 ' + (s.streak || 0) + ' 天打卡</b><span>减重营 H5</span></div></div>' : '') + '</div>';
  }

  function grantTo(name) {
    const benefits = dbx().shared.benefits;
    UI.formDrawer({
      title: '向 ' + name + ' 发放权益', sub: '发放后立即进入个人权益钱包', icon: 'gift', okText: '确认发放',
      fields: [
        { key: 'benefitId', label: '权益', type: 'select', value: benefits[0].id, options: benefits.map((b) => ({ v: b.id, l: b.name + '（库存 ' + b.stock + '）' })) },
        { key: 'qty', label: '数量', type: 'num', value: 1 },
        { key: 'expires', label: '到期日', value: '2027-03-31' }
      ],
      hint: '同一权益可叠加发放，剩余额度会合并显示。',
      onSave(v) {
        const b = benefitOf(v.benefitId);
        Store.snapshot();
        Store.pushItem('shared.grants', { id: 'gr' + Date.now(), benefitId: v.benefitId, holder: name, company: '示例科技', qty: v.qty, remaining: v.qty, expires: v.expires, status: 'active', at: '2026-11-08' }, '发放权益 · ' + name);
        b.issued = (b.issued || 0) + v.qty;
        UI.toast('已发放「' + b.name + '」×' + v.qty);
        App.refresh();
      }
    });
  }

  function touchTo(name) {
    const tpls = dbx().shared.msgTemplates;
    UI.formDrawer({
      title: '触达 ' + name, sub: '选择一个模板，发送记录会进入客户时间轴', icon: 'send', okText: '发送',
      fields: [
        { key: 'tpl', label: '模板', type: 'select', value: tpls[0].name, options: tpls.map((t) => t.name) },
        { key: 'note', label: '个性化补充', type: 'area', value: '请在本周内完成预约，如有疑问可直接回复。' }
      ],
      hint: '发送前会检查该客户是否有可用权益与未完成预约，避免重复打扰。',
      onSave(v) {
        const t = tpls.find((x) => x.name === v.tpl);
        Store.snapshot();
        Store.pushItem('shared.touches', { id: 'tc' + Date.now(), holder: name, channel: t.channel, tpl: t.name, title: t.title.replace(/\{\{[^}]+\}\}/g, ''), at: '2026-11-08 10:00', status: '已送达' }, '客户触达 · ' + name);
        UI.toast('已通过' + t.channel + '发送给 ' + name);
        App.refresh();
      }
    });
  }

  /* ============================================================== MODULE REVIEW */
  const MODULES = [
    { id: 'command', name: '指挥', route: 'workbench', icon: 'grid', score: 92, own: ['跨端漏斗', '作战队列', '风险雷达', '发布列车'], shared: ['变更影响', '发布中心', '前端功能地图'], next: '补企业 / 营期分组指挥视图，让区域负责人只看自己盘子' },
    { id: 'growth', name: '内容', route: 'b-home', icon: 'spark', score: 88, own: ['品牌站 8 页', '职工端 6 页', '内容中心', '图片素材'], shared: ['共享资产', '品牌与主体', '主题与入口'], next: '补内容 A/B 与 SEO / 分享卡，让内容运营可复盘' },
    { id: 'catalog', name: '商品', route: 'svc-catalog', icon: 'package', score: 94, own: ['SPU / SKU / 价格', '服务包', '服务 360', '机构与时段'], shared: ['规则模板', '共享资产', '权益引擎'], next: '补合同价审批流与按企业差异定价，避免协议价手工维护' },
    { id: 'trade', name: '交易', route: 'trd-orders', icon: 'file', score: 86, own: ['订单中心', '预约履约', '结算对账', '客户 360'], shared: ['权益核销', '客户档案', '服务 360'], next: '补退款自动冲销与结算争议工单，减少跨系统对账' },
    { id: 'program', name: '项目', route: 'fg-overview', icon: 'layers', score: 90, own: ['五好生活', '28 天减重营', '打卡与激励', '结营报告'], shared: ['项目模板', '规则模板', '健康档案'], next: '补营期 cohort 对比与自动复盘，模板复制后能一键生成下一期' },
    { id: 'shared', name: '共享', route: 'lib-assets', icon: 'link', score: 96, own: ['资产库', '权益 / 规则 / 模板'], shared: ['关系图谱', '关联缺口'], next: '补共享对象的引用锁与批量替换，避免删除时误伤业务' },
    { id: 'insight', name: '洞察', route: 'g-insights', icon: 'chart', score: 80, own: ['经营洞察', '覆盖矩阵', '渠道数据', '健康结果'], shared: ['关系图谱', '指标口径'], next: '补渠道归因与 LTV / CAC 联动，让“看到”能直接生成动作' },
    { id: 'platform', name: '平台', route: 's-publish', icon: 'settings', score: 84, own: ['发布中心', '影响分析', 'RBAC', '操作日志'], shared: ['变更队列', '快照回滚'], next: '补按企业 / 人群灰度发布与发布审批流，降低全量风险' }
  ];

  P['g-depth'] = {
    app: 'all', title: '模块复盘', sub: '八个工作区的深度、复用与下一步',
    grp: 'shared.content', papp: 'employee', preview: 'emp-home',
    render() {
      ensure();
      const avg = Math.round(MODULES.reduce((n, m) => n + m.score, 0) / MODULES.length);
      return K.head('模块复盘', '不是“页面够不够”，而是每个模块是否形成了可复用、可关联、可闭环的能力',
        '<button class="btn" data-act="depthExport">' + I('download', 15) + '导出复盘报告</button>' +
        '<button class="btn primary" data-act="go" data-id="g-gaps">' + I('target', 15) + '查看关联缺口</button>', 'INSIGHT / MODULE REVIEW') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>工作区</span><b>8</b><em>103 个后台页面</em></div>' +
          '<div class="vsum-card ok"><span>平均深度</span><b>' + avg + '</b><em>满分 100</em></div>' +
          '<div class="vsum-card"><span>共享能力</span><b>6</b><em>资产 / 消息 / 权益 / 规则 / 模板 / 图谱</em></div>' +
          '<div class="vsum-card warn"><span>下一步</span><b>8</b><em>每域 1 个高价值动作</em></div>' +
        '</div>' +
        '<div class="depth-grid">' + MODULES.map((m) =>
          '<section class="depth-card"><header><span class="depth-ic">' + I(m.icon, 17) + '</span>' +
            '<div><b>' + E(m.name) + '工作区</b><span>' + m.score + ' / 100 · 深度评分</span></div>' +
            '<button class="vmini" data-act="go" data-id="' + m.route + '">' + I('chevron', 12) + '进入</button></header>' +
            '<div class="depth-bar"><i style="width:' + m.score + '%"></i></div>' +
            '<div class="depth-cols"><div><em>已有能力</em>' + m.own.map((x) => '<span>' + E(x) + '</span>').join('') + '</div>' +
              '<div><em>已接共享</em>' + m.shared.map((x) => '<span class="shared">' + E(x) + '</span>').join('') + '</div></div>' +
            '<div class="depth-next">' + I('up', 12) + '<div><b>下一步</b><span>' + E(m.next) + '</span></div></div>' +
          '</section>').join('') + '</div>' +
        '<div class="depth-priority"><header><div><h3>下一阶段优先级</h3><p>按业务价值 / 实现成本排序</p></div></header>' +
          [['P0', '权益与结算打通', '券核销进入结算口径，避免权益成本悬空', 'lib-benefits'], ['P0', '灰度发布', '按企业与人群灰度，降低全量配置风险', 's-publish'], ['P1', '渠道归因', '从曝光到预约归因，指导预算分配', 'g-insights'], ['P1', '营期自动复盘', '结营后自动生成对比与下一期建议', 'v-stats']].map((x) =>
            '<button data-act="go" data-id="' + x[3] + '"><span class="pill ' + (x[0] === 'P0' ? 'red' : 'amber') + '">' + x[0] + '</span><div><b>' + E(x[1]) + '</b><span>' + E(x[2]) + '</span></div>' + I('chevron', 12) + '</button>').join('') +
        '</div>';
    },
    actions: {
      depthExport() {
        const csv = ['工作区,深度评分,已有能力,共享能力,下一步'].concat(MODULES.map((m) => [m.name, m.score, m.own.join(' / '), m.shared.join(' / '), m.next].join(','))).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
        a.download = 'pku-console-module-review.csv'; a.click();
        UI.toast('模块复盘已导出');
      }
    }
  };

  /* live filter for searchable lists */
  document.addEventListener('input', (e) => {
    const input = e.target.closest('[data-live-filter]');
    if (!input) return;
    const key = input.dataset.liveFilter;
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('[data-filter-item="' + key + '"]').forEach((el) => {
      el.style.display = !q || (el.dataset.text || '').toLowerCase().indexOf(q) >= 0 ? '' : 'none';
    });
  });

  window.V6 = { ensure, customerList, personGrants, personTouches, benefitOf, scanGaps, graphNodes, graphEdges, SEED };
})();
