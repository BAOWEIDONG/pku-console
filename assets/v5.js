/* ============================================================================
   Console v5 — 运营指挥层
   新增：指挥中心 / 渠道图谱 / 覆盖矩阵 / 变更影响 / 客户 360 / 经营洞察
   依赖：data*.js → store.js → ui.js → kit.js → v5.js → app.js
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const dbx = () => Store.db;

  const APP = { pku: '品牌站', employee: '职工健康', versionall: '减重营', system: '平台' };
  const TONE = { pku: 'teal', employee: 'amber', versionall: 'blue', system: 'grey' };

  /* ------------------------------------------------------------------ utils */
  const nf = (n) => (n == null ? '—' : Number(n).toLocaleString('zh-CN'));
  const pct = (n) => Math.round(n) + '%';

  function pathOf(obj, path) {
    return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }

  function spark(values, color, w, h) {
    const W = w || 132, H = h || 38;
    const min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    const span = max - min || 1;
    const pts = values.map((v, i) => [i * (W / (values.length - 1)), H - 3 - ((v - min) / span) * (H - 8)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z';
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="sg' + color.replace('#', '') + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + color + '" stop-opacity=".22"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#sg' + color.replace('#', '') + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function bars(values, color) {
    const max = Math.max.apply(null, values) || 1;
    return '<div class="vbars">' + values.map((v) =>
      '<i style="height:' + Math.max(8, Math.round(v / max * 100)) + '%;background:' + color + '"></i>').join('') + '</div>';
  }

  function ring(value, size, color, label) {
    const s = size || 84, r = s / 2 - 7, c = 2 * Math.PI * r;
    return '<div class="vring" style="width:' + s + 'px;height:' + s + 'px">' +
      '<svg viewBox="0 0 ' + s + ' ' + s + '"><circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="#e8eef7" stroke-width="7"/>' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="7" stroke-linecap="round" ' +
      'stroke-dasharray="' + (c * value / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + s / 2 + ' ' + s / 2 + ')"/></svg>' +
      '<div class="vring-t"><b>' + Math.round(value) + '<small>%</small></b>' + (label ? '<span>' + E(label) + '</span>' : '') + '</div></div>';
  }

  function ensure() {
    const db = Store.db;
    if (!db) return;
    if (!db.channelPages) {
      db.channelPages = {
        brand: { home: 1, hospitals: 1, departments: 1, team: 1, camp: 1, about: 1 },
        employee: { home: 1, services: 1, booking: 1, mine: 1, qa: 1, articles: 1 },
        camp: { dashboard: 1, checkin: 1, diet: 1, exercise: 1, mall: 1, reward: 1, ranking: 1, report: 1 }
      };
    }
    if (!db.snapshots) db.snapshots = [];
  }

  function channelPages(ch) {
    ensure();
    return Store.db.channelPages[ch] || {};
  }

  /* ================================================================== data */
  const COVERAGE = [
    /* 品牌站 */
    { ch: 'pku', page: '首页', feature: '主视觉 / 三张 Banner / 快捷入口', route: 'b-home', ctrl: '首页内容编排', status: 'full', note: '主视觉、入口文案与跳转可配；首屏轮播直达「轮播与开屏」上传图片' },
    { ch: 'pku', page: '首页', feature: '集团介绍与品牌主张', route: 'b-about', ctrl: '品牌页', status: 'full', note: '简介、数字、里程碑、图片' },
    { ch: 'pku', page: '分院网络', feature: '6 省 11 城机构卡片与筛选', route: 'b-hospitals', ctrl: '服务机构 / 分院网络', status: 'full', note: '机构、城市、等级、地址、电话、封面' },
    { ch: 'pku', page: '科室', feature: '学科与科室导航、科室详情', route: 'b-departments', ctrl: '学科与科室', status: 'full', note: '一级学科、科室、简介、专家关联' },
    { ch: 'pku', page: '师资团队', feature: '专家卡片、筛选、成员详情', route: 'b-team', ctrl: '师资团队', status: 'full', note: '头像、职称、擅长、简介、排序' },
    { ch: 'pku', page: '专家详情', feature: '出诊信息与预约入口', route: 'b-team', ctrl: '师资团队 · 出诊', status: 'partial', note: '专家资料可维护；独立出诊排班尚未建表' },
    { ch: 'pku', page: '健康营', feature: '营期展示、课程与团队', route: 'b-camp', ctrl: '健康营展示页', status: 'full', note: '营期介绍、主图、亮点、团队与报名入口' },
    { ch: 'pku', page: '全站', feature: '站点标题 / 分享卡 / SEO', route: 'b-site', ctrl: '站点设置', status: 'partial', note: '标题与描述可改；分享卡图与多语言未接入' },
    { ch: 'pku', page: '全站', feature: '联系热线 / 地址 / 投诉', route: 'g-brand', ctrl: '品牌与主体', status: 'full', note: '三端共用一套联系方式' },
    { ch: 'pku', page: '全站', feature: '在线咨询与预约 CTA', route: 'e-booking', ctrl: '预约设置', status: 'full', note: '点击后进入职工健康预约流程' },
    { ch: 'pku', page: '数据', feature: '访问 / 来源 / 转化', route: 'b-dashboard', ctrl: '品牌站概览', status: 'full', note: '渠道来源、页面浏览、预约转化' },

    /* 职工健康 */
    { ch: 'employee', page: '首页', feature: '公司名 / 问候 / 客服热线', route: 'e-site', ctrl: '职工端站点', status: 'full', note: '企业名称、标题、热线、搜索占位' },
    { ch: 'employee', page: '首页', feature: '品牌横幅轮播与自动播放', route: 'content-banners', ctrl: '轮播与开屏', status: 'full', note: '图片上传、文案、跳转、排序、投放时间、自动播放' },
    { ch: 'employee', page: '首页', feature: '五大服务模块（筛查/慢病/就医/特色/应急）', route: 'e-modules', ctrl: '模块与分类', status: 'full', note: '名称、副标题、图标色、显隐、排序' },
    { ch: 'employee', page: '服务', feature: '服务列表、分类、搜索、热门推荐', route: 'e-services', ctrl: '服务目录', status: 'full', note: '分类、标签、推荐位、上下架' },
    { ch: 'employee', page: '服务详情', feature: '图文详情 / 服务须知 / 流程 / 机构', route: 'e-services', ctrl: '服务详情', status: 'full', note: '主图、图集、图文块、流程、须知、适用/禁忌、可约机构全部可配' },
    { ch: 'employee', page: '商品详情', feature: '商品主图 / 图集 / 图文详情 / SKU', route: 'svc-goods', ctrl: '实物商品', status: 'full', note: '主图与图集上传、图文块、规格 SKU、物流售后' },
    { ch: 'employee', page: '服务详情', feature: '价格、规格与权益抵扣', route: 'svc-pricing', ctrl: '价格与政策', status: 'full', note: '成本/结算/挂牌/协议价、税点、有效期' },
    { ch: 'employee', page: '预约', feature: '机构 / 日期 / 时段 / 表单字段', route: 'e-booking', ctrl: '预约设置', status: 'full', note: '可约机构、时段、字段必填与顺序' },
    { ch: 'employee', page: '预约', feature: '我的预约与取消', route: 'e-bookings', ctrl: '预约订单', status: 'full', note: '状态、改约、取消、履约记录' },
    { ch: 'employee', page: '权益', feature: '体检 / EAP / 门诊额度', route: 'e-orgs', ctrl: '企业客户与权益', status: 'partial', note: '企业额度可配；个人剩余额度视图待补' },
    { ch: 'employee', page: '问答', feature: '健康问答与医生回复', route: 'e-qa', ctrl: '深度问答', status: 'full', note: '图文回复、分类、置顶、审核、敏感词、未命中问题池与关联服务' },
    { ch: 'employee', page: '科普', feature: '文章、视频、专题', route: 'e-content', ctrl: '职工端内容', status: 'full', note: '封面、正文、分类、推荐、上下架' },
    { ch: 'employee', page: '企业专区', feature: '行业方案与企业权益包', route: 'e-orgs', ctrl: '企业客户与权益', status: 'full', note: '企业、行业、人数、权益、合同期' },
    { ch: 'employee', page: '我的', feature: '个人健康档案与报告', route: 'crm-360', ctrl: '客户 360', status: 'partial', note: '后台可看完整档案；端上档案页未拆分为独立配置' },

    /* 减重营 */
    { ch: 'camp', page: '登录', feature: '学员 / 营养师 / 教练登录', route: 'v-accounts', ctrl: '账号管理', status: 'full', note: '账号、角色、营期绑定、状态' },
    { ch: 'camp', page: '入营', feature: '入营问卷与健康基线', route: 'v-questionnaire', ctrl: '入营问卷', status: 'full', note: '题目、选项、必填、计分、版本' },
    { ch: 'camp', page: '学员首页', feature: '今日任务、进度、快捷入口', route: 'v-dashboard', ctrl: '运营概览', status: 'full', note: '任务卡、进度、文案与入口' },
    { ch: 'camp', page: '健康档案', feature: '身高体重、体脂、风险标签', route: 'v-students', ctrl: '学员管理', status: 'full', note: '档案、标签、风险分级、责任营养师' },
    { ch: 'camp', page: '饮食', feature: '饮食记录、食谱、餐次', route: 'v-records', ctrl: '打卡记录 / 食谱', status: 'full', note: '记录审核、食谱编排、餐次时间' },
    { ch: 'camp', page: '运动', feature: '运动记录、课程、批注', route: 'v-annotations', ctrl: '批注工作台', status: 'full', note: '运动类型、时长、强度、教练批注' },
    { ch: 'camp', page: '体重', feature: '每日体重打卡与趋势', route: 'v-records', ctrl: '打卡记录', status: 'full', note: '体重、体脂、达标、异常提醒' },
    { ch: 'camp', page: '日历', feature: '营期日历与出勤', route: 'v-attendance', ctrl: '出勤看板', status: 'full', note: '每日出勤、缺卡、补卡、周视图' },
    { ch: 'camp', page: '排行', feature: '积分 / 减重 / 打卡排行', route: 'v-ranking', ctrl: '排行榜', status: 'full', note: '榜单维度、周期、展示人数、匿名规则' },
    { ch: 'camp', page: '积分', feature: '积分明细与规则', route: 'v-points-rules', ctrl: '积分规则', status: 'full', note: '行为、分值、上限、生效营期' },
    { ch: 'camp', page: '商城', feature: '积分商品、兑换、库存', route: 'v-products', ctrl: '积分商城', status: 'full', note: '商品、积分价、库存、上下架、每人限兑' },
    { ch: 'camp', page: '商品详情', feature: '商品主图、图文介绍、规格', route: 'svc-goods', ctrl: '实物商品', status: 'full', note: '与职工端共用一份商品素材与图文详情' },
    { ch: 'camp', page: '奖励', feature: '连续打卡奖励与领取', route: 'v-tiers', ctrl: '连续打卡奖励', status: 'full', note: '天数门槛、库存、配送方式、排序' },
    { ch: 'camp', page: '奖励', feature: '领取订单与发货', route: 'v-claims', ctrl: '领奖订单', status: 'full', note: '待发货、物流单号、批量导出' },
    { ch: 'camp', page: '徽章', feature: '徽章获得与展示', route: 'v-badges', ctrl: '徽章体系', status: 'full', note: '徽章、条件、稀有度、展示位' },
    { ch: 'camp', page: '消息', feature: '公告、提醒、私信', route: 'v-messages', ctrl: '消息与公告', status: 'full', note: '模板、人群、定时、已读统计' },
    { ch: 'camp', page: '活动', feature: '活动中心与报名', route: 'v-activities', ctrl: '活动与入口', status: 'full', note: '活动、时间、名额、报名、入口图' },
    { ch: 'camp', page: '活动', feature: '活动上传与审核', route: 'v-content', ctrl: '活动与课程', status: 'full', note: '上传、审核、驳回原因、精选' },
    { ch: 'camp', page: '营养师', feature: '营养师工作台与待批注', route: 'v-annotations', ctrl: '批注工作台', status: 'full', note: '待办、超时、批量批注、常用语' },
    { ch: 'camp', page: '教练', feature: '教练工作台与运动批注', route: 'v-annotations', ctrl: '批注工作台', status: 'full', note: '按教练分配、运动处方、复查' },
    { ch: 'camp', page: '督导', feature: '督导总览与异常', route: 'v-supervisor', ctrl: '督导总览', status: 'full', note: '营期健康度、人员负荷、异常学员' },
    { ch: 'camp', page: '报告', feature: '营期统计', route: 'v-stats', ctrl: '营期统计', status: 'full', note: '入营、活跃、达标、流失、排行' },
    { ch: 'camp', page: '报告', feature: '结营报告', route: 'v-report', ctrl: '结营报告', status: 'full', note: '个人报告、寄语、生成与推送' },
    { ch: 'camp', page: '报告', feature: '企业健康报告', route: 'v-enterprise', ctrl: '企业健康报告', status: 'full', note: '企业维度、部门对比、风险分布' },
    { ch: 'camp', page: '履约', feature: '奖励发货与履约中心', route: 'v-fulfill', ctrl: '履约工作台', status: 'full', note: '待发货、批量导入单号、签收' },
    { ch: 'camp', page: '配置', feature: '餐次时间与提醒', route: 'fg-meal', ctrl: '餐次配置', status: 'full', note: '早中晚加餐时间、提醒文案' },
    { ch: 'camp', page: '配置', feature: '健康指标与阈值', route: 'v-metrics', ctrl: '健康指标库', status: 'full', note: '指标、单位、正常范围、预警阈值' },
    { ch: 'camp', page: '配置', feature: '奖励 / 徽章 / 活动配置', route: 'v-tiers', ctrl: '奖励与激励', status: 'full', note: '三类激励均有独立配置页' },
    { ch: 'camp', page: '全站', feature: '端上灰度与 A/B', route: 's-publish', ctrl: '发布中心', status: 'missing', note: '目前为整包发布，缺少按人群灰度能力' }
  ];

  const CH_PAGES = {
    brand: [
      { id: 'home', name: '首页', path: '/', desc: '主视觉、轮播、快捷入口', route: 'b-home' },
      { id: 'hospitals', name: '分院网络', path: '/hospitals.html', desc: '机构卡片与城市筛选', route: 'b-hospitals' },
      { id: 'departments', name: '学科与科室', path: '/departments.html', desc: '学科导航与科室详情', route: 'b-departments' },
      { id: 'team', name: '师资团队', path: '/team.html', desc: '专家列表与成员详情', route: 'b-team' },
      { id: 'camp', name: '健康营', path: '/camp.html', desc: '营期展示与报名', route: 'b-camp' },
      { id: 'about', name: '品牌页', path: '/brand.html', desc: '集团介绍与品牌资产', route: 'b-about' }
    ],
    employee: [
      { id: 'home', name: '首页', path: '/', desc: '横幅、模块、推荐服务', route: 'e-site' },
      { id: 'services', name: '服务目录', path: '/#services', desc: '分类、搜索、服务卡片', route: 'e-services' },
      { id: 'booking', name: '预约', path: '/#booking', desc: '机构、日期、时段、表单', route: 'e-booking' },
      { id: 'mine', name: '我的', path: '/#mine', desc: '预约、权益、健康档案', route: 'e-bookings' },
      { id: 'qa', name: '健康问答', path: '/#qa', desc: '提问、回复、置顶', route: 'e-qa' },
      { id: 'articles', name: '科普内容', path: '/#articles', desc: '文章、视频、专题', route: 'e-content' }
    ],
    camp: [
      { id: 'dashboard', name: '学员首页', path: '/#/dashboard', desc: '任务、进度、快捷入口', route: 'v-dashboard' },
      { id: 'checkin', name: '打卡', path: '/#/weight-checkin', desc: '体重、饮食、运动记录', route: 'v-records' },
      { id: 'diet', name: '饮食', path: '/#/diet', desc: '食谱、餐次、营养分析', route: 'fg-eat' },
      { id: 'exercise', name: '运动', path: '/#/exercise', desc: '运动记录与批注', route: 'v-annotations' },
      { id: 'mall', name: '积分商城', path: '/#/points-mall', desc: '商品、兑换、库存', route: 'v-products' },
      { id: 'reward', name: '奖励', path: '/#/reward', desc: '连续打卡奖励与领取', route: 'v-tiers' },
      { id: 'ranking', name: '排行榜', path: '/#/ranking', desc: '积分、减重、打卡榜', route: 'v-ranking' },
      { id: 'report', name: '报告', path: '/#/camp-report', desc: '个人、营期、企业报告', route: 'v-report' }
    ]
  };

  /* ------------------------------------------------------- impact mapping */
  const PATH_IMPACT = [
    { re: /^employee\.services\./, ch: 'employee', pages: ['服务目录', '服务详情', '预约'], label: '服务' },
    { re: /^employee\.site\./, ch: 'employee', pages: ['首页', '我的'], label: '站点设置' },
    { re: /^employee\.modules\./, ch: 'employee', pages: ['首页'], label: '服务模块' },
    { re: /^employee\.banners\./, ch: 'employee', pages: ['首页'], label: '首页横幅' },
    { re: /^employee\.bookings\./, ch: 'employee', pages: ['预约', '我的'], label: '预约' },
    { re: /^employee\.qa\./, ch: 'employee', pages: ['健康问答'], label: '问答' },
    { re: /^employee\.articles\./, ch: 'employee', pages: ['科普内容'], label: '文章' },
    { re: /^brand\.home|^brand\.site/, ch: 'pku', pages: ['首页'], label: '品牌站首页' },
    { re: /^brand\.institutions/, ch: 'pku', pages: ['分院网络'], label: '机构' },
    { re: /^brand\.departments/, ch: 'pku', pages: ['学科与科室'], label: '科室' },
    { re: /^brand\.doctors|^brand\.info/, ch: 'pku', pages: ['师资团队', '品牌页'], label: '专家资料' },
    { re: /^brand\.camp/, ch: 'pku', pages: ['健康营'], label: '健康营' },
    { re: /^versionall\.camps/, ch: 'versionall', pages: ['学员首页', '报告'], label: '营期' },
    { re: /^versionall\.students/, ch: 'versionall', pages: ['学员首页', '健康档案'], label: '学员' },
    { re: /^versionall\.records/, ch: 'versionall', pages: ['打卡', '饮食', '运动'], label: '打卡记录' },
    { re: /^versionall\.tiers/, ch: 'versionall', pages: ['奖励', '学员首页'], label: '奖励' },
    { re: /^versionall\.products/, ch: 'versionall', pages: ['积分商城'], label: '商城' },
    { re: /^versionall\.badges/, ch: 'versionall', pages: ['徽章'], label: '徽章' },
    { re: /^versionall\.messages/, ch: 'versionall', pages: ['消息'], label: '消息' },
    { re: /^versionall\.activity/, ch: 'versionall', pages: ['活动中心', '打卡'], label: '活动' },
    { re: /^health\.serviceCases/, ch: 'employee', pages: ['预约', '我的服务'], label: '服务履约' },
    { re: /^health\.(profiles|riskRules|carePlans|followups|programs|enrollments|outcomes|exceptions)/, ch: 'employee', pages: ['我的健康', '健康档案', '企业报告'], label: '健康管理' },
    { re: /^fivegood\.(ops|consents|escalations|memberProfiles|memberTasks|checkins)/, ch: 'employee', pages: ['我的五好', '任务', '月度报告'], label: '五好运营' },
    { re: /^fivegood|^recipes|^dishes|^mealTemplates|^dayPlans/, ch: 'versionall', pages: ['饮食', '食谱'], label: '食谱' },
    { re: /^shared\.assets/, ch: 'all', pages: ['服务详情', '内容位', '权益说明'], label: '共享资产' },
    { re: /^shared\.msgTemplates|^shared\.journeys|^shared\.touches/, ch: 'all', pages: ['消息中心', '我的消息'], label: '触达' },
    { re: /^shared\.benefits|^shared\.grants|^shared\.redemptions/, ch: 'employee', pages: ['我的权益', '服务详情'], label: '权益' },
    { re: /^shared\.rules/, ch: 'all', pages: ['预约表单', '营期打卡', '五好评分'], label: '规则' },
    { re: /^shared\.brand|^shared\.contact|^shared\.theme/, ch: 'all', pages: ['三端全站'], label: '品牌与主题' },
    { re: /^channels|^channelPages/, ch: 'all', pages: ['渠道触点'], label: '渠道' }
  ];

  function impactOf(paths) {
    const channels = {}; const pages = {}; const labels = []; const objects = {};
    const per = { pku: {}, employee: {}, versionall: {} };
    (paths || []).forEach((p) => {
      const pp = p.path || p;
      const cp = pp.match(/^channelPages\.(brand|employee|camp)\.([\w-]+)/);
      if (cp) {
        const ch = cp[1] === 'brand' ? 'pku' : cp[1] === 'employee' ? 'employee' : 'versionall';
        const meta = (CH_PAGES[cp[1]] || []).find((x) => x.id === cp[2]);
        channels[ch] = 1;
        per[ch][meta ? meta.name : cp[2]] = 1;
        pages[meta ? meta.name : cp[2]] = 1;
        labels.push('渠道页面');
        objects['渠道页面'] = (objects['渠道页面'] || 0) + 1;
        return;
      }
      const hit = PATH_IMPACT.find((m) => m.re.test(p.path || p));
      if (!hit) return;
      if (hit.ch === 'all') { channels.pku = 1; channels.employee = 1; channels.versionall = 1; }
      else channels[hit.ch] = 1;
      hit.pages.forEach((x) => { pages[x] = 1; });
      (hit.ch === 'all' ? ['pku', 'employee', 'versionall'] : [hit.ch]).forEach((ch) => {
        hit.pages.forEach((x) => { per[ch][x] = 1; });
      });
      labels.push(hit.label);
      objects[hit.label] = (objects[hit.label] || 0) + 1;
    });
    return {
      channels: Object.keys(channels),
      pages: Object.keys(pages),
      per: per,
      labels: labels.filter((v, i) => labels.indexOf(v) === i),
      objects: objects
    };
  }

  function gatesFor(paths) {
    const db = dbx();
    const gates = [];
    const p = (paths || []).map((x) => x.path || x).join(' ');
    if (/employee\.services/.test(p)) {
      const bad = (db.employee.services || []).filter((s) => s.status !== 'draft' && (!s.pricing || !s.pricing[0] || s.pricing[0].settle > s.pricing[0].list));
      gates.push({ ok: !bad.length, k: '价格与毛利', d: bad.length ? bad.length + ' 个服务存在价格异常' : '价格结构完整，毛利均高于 20%' });
      const noCh = (db.employee.services || []).filter((s) => s.status !== 'draft' && (!s.channels || !s.channels.length));
      gates.push({ ok: !noCh.length, k: '投放渠道', d: noCh.length ? noCh.length + ' 个服务未选择渠道' : '上架服务均已绑定渠道' });
    }
    if (/versionall\.tiers|versionall\.products/.test(p)) {
      const zero = (db.versionall.tiers || []).filter((t) => t.active && t.stock === 0);
      gates.push({ ok: !zero.length, k: '库存可兑', d: zero.length ? zero.length + ' 个启用奖励库存为 0' : '启用奖励库存充足' });
    }
    if (/brand\.|employee\.site|shared/.test(p)) {
      gates.push({ ok: true, k: '品牌一致性', d: '主色、Logo、联系方式与集团口径一致' });
    }
    gates.push({ ok: true, k: '发布窗口', d: '当前不在禁发时段，CDN 可正常刷新' });
    return gates;
  }

  /* ================================================================== HOME */
  function homeStats() {
    const db = dbx();
    const students = db.versionall.students || [];
    const active = students.filter((s) => s.status === 'active').length;
    const pendingClaims = (db.versionall.claims || []).filter((c) => c.status === 'pending').length;
    const pendingBookings = (db.employee.bookings || []).filter((b) => b.status === 'pending').length;
    const unannotated = ((db.versionall.records || {}).exercise || []).filter((r) => !r.comments || !r.comments.length).length;
    const dirty = Store.dirtyCount;
    const bookings = (db.employee.bookings || []).length;
    const hits = (db.channels || []).filter((c) => c.on).reduce((a, c) => a + (c.hits || 0), 0);
    return { active, pendingClaims, pendingBookings, unannotated, dirty, bookings, hits, students };
  }

  function homeHero() {
    const d = new Date();
    const hour = d.getHours();
    const greet = hour < 6 ? '凌晨好' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
    const s = homeStats();
    return '<section class="vhero">' +
      '<div class="vhero-aurora"></div>' +
      '<div class="vhero-actions">' +
        '<button class="vbtn ghost" data-act="cmd">' + I('search', 15) + '全局搜索 <kbd>⌘K</kbd></button>' +
        '<button class="vbtn ghost" data-act="previewAll">' + I('eye', 15) + '三端预览</button>' +
        '<button class="vbtn light" data-act="publish">' + I('send', 15) + '发布变更' + (s.dirty ? '<b>' + s.dirty + '</b>' : '') + '</button>' +
      '</div>' +
      '<div class="vhero-body"><div class="vhero-main">' +
        '<div class="veyebrow"><i></i>SUPER CONSOLE <span>·</span> ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 周' + '日一二三四五六'[d.getDay()] + '</div>' +
        '<h1>' + greet + '，孙敏</h1>' +
        '<p>三端在线 · 今日 48 名学员在营 · ' + s.bookings + ' 笔职工预约 · ' + (s.dirty ? '<b>' + s.dirty + ' 项变更等待发布</b>' : '全部配置已同步') + '</p>' +
        '<div class="vhero-quick">' +
          '<button data-act="go" data-id="svc-catalog">' + I('plus', 12) + '新建服务</button>' +
          '<button data-act="go" data-id="content-banners">' + I('image', 12) + '配置轮播</button>' +
          '<button data-act="go" data-id="svc-goods">' + I('gift', 12) + '商品图文</button>' +
          '<button data-act="go" data-id="e-services">' + I('stethoscope', 12) + '服务详情</button>' +
          '<button data-act="go" data-id="msg-center">' + I('send', 12) + '发起触达</button>' +
          '<button data-act="go" data-id="g-impact">' + I('activity', 12) + '变更影响</button>' +
        '</div>' +
      '</div>' +
      '<div class="vhero-focus">' +
        '<div class="vhf-h"><span>今日焦点</span><em>3 项</em></div>' +
        '<button data-act="go" data-id="v-annotations"><span class="vhf-n">' + s.unannotated + '</span><div><b>运动批注待处理</b><em>王雪 / 陈放 · 最早超时 26h</em></div>' + I('chevron', 12) + '</button>' +
        '<button data-act="go" data-id="v-claims"><span class="vhf-n">' + s.pendingClaims + '</span><div><b>奖励待发货</b><em>履约组 · 今日 18:00 前</em></div>' + I('chevron', 12) + '</button>' +
        '<button data-act="go" data-id="s-publish"><span class="vhf-n">' + s.dirty + '</span><div><b>变更待发布</b><em>影响 3 个渠道 · 校验通过</em></div>' + I('chevron', 12) + '</button>' +
      '</div>' +
      '</div>' +
      '<div class="vhero-status">' +
        '<span class="vstat-chip"><i class="live"></i>三个渠道在线</span>' +
        '<span class="vstat-chip"><i class="teal"></i>发布窗口 09:00–22:00</span>' +
        '<span class="vstat-chip"><i class="amber"></i>' + (s.unannotated + s.pendingClaims + s.pendingBookings) + ' 项需要处理</span>' +
      '</div>' +
    '</section>';
  }

  function kpiCard(o) {
    return '<article class="vcard vkpi">' +
      '<div class="vkpi-top"><span class="vkpi-k">' + E(o.k) + '</span>' + (o.icon ? '<span class="vkpi-ic">' + I(o.icon, 15) + '</span>' : '') + '</div>' +
      '<div class="vkpi-v">' + o.v + (o.unit ? '<small>' + E(o.unit) + '</small>' : '') + '</div>' +
      '<div class="vkpi-foot"><span class="' + (o.tone || '') + '">' + o.d + '</span>' + (o.spark || '') + '</div>' +
    '</article>';
  }

  function homeKpis() {
    const s = homeStats();
    const db = dbx();
    const revenue = 428600;
    return '<div class="vkpis">' +
      kpiCard({ k: '本月交易额', v: '¥42.86', unit: '万', d: '<b>+18.2%</b> 环比', icon: 'chart', spark: spark([24, 31, 28, 39, 36, 44, 43], '#0B63E5', 92, 30) }) +
      kpiCard({ k: '活跃服务用户', v: nf(2486), d: '<b>+126</b> 本周新增', icon: 'users', spark: spark([1660, 1780, 1720, 1950, 2080, 2320, 2486], '#0A9E94', 92, 30) }) +
      kpiCard({ k: '待处理事项', v: String(s.unannotated + s.pendingClaims + s.pendingBookings), unit: '项', d: s.unannotated + ' 批注 · ' + s.pendingClaims + ' 奖励 · ' + s.pendingBookings + ' 预约', icon: 'bell', spark: bars([3, 5, 2, 6, 4, 5, 3], '#C8871A') }) +
      kpiCard({ k: '履约达成率', v: '94.6', unit: '%', d: '<b>+2.1pt</b> 较上周', icon: 'shield', spark: spark([88, 90, 89, 92, 91, 94, 94.6], '#6B5CE0', 92, 30) }) +
    '</div>';
  }

  function homeChannels() {
    const db = dbx();
    const rows = [
      { id: 'versionall', name: '减重营', sub: '第 7 期 · 第 18 天', k: '48 人在营', d: [62, 70, 66, 78, 74, 81, 78], color: '#3F8CFF', route: 'v-dashboard', pv: '86,240', conv: '34.8%' },
      { id: 'pku', name: '品牌站', sub: '6 省 11 城', k: '12.4 万浏览', d: [48, 52, 61, 58, 66, 71, 74], color: '#0A9E94', route: 'b-dashboard', pv: '124,600', conv: '8.6%' },
      { id: 'employee', name: '职工健康', sub: '示例科技有限公司', k: '326 笔预约', d: [30, 42, 39, 51, 47, 55, 58], color: '#C8871A', route: 'e-dashboard', pv: '68,300', conv: '21.3%' }
    ];
    return '<section class="vcard vchannels">' +
      '<div class="vcard-h"><div><h3>渠道脉冲</h3><p>三个面向用户的触点，实时</p></div>' +
        '<button class="vlink" data-act="go" data-id="chn-map">渠道图谱 ' + I('chevron', 13) + '</button></div>' +
      '<div class="vch-list">' + rows.map((r) => {
        const dirty = Store.dirtyByApp[r.id] || 0;
        return '<div class="vch" data-act="go" data-id="' + r.route + '">' +
          '<span class="vch-dot" style="background:' + r.color + '"></span>' +
          '<div class="vch-main"><div class="vch-name"><b>' + r.name + '</b><span>' + E(r.sub) + '</span></div>' +
            '<div class="vch-meta"><span>' + r.k + '</span><span>转化 ' + r.conv + '</span><span>' + (dirty ? '<em>' + dirty + ' 项未发布</em>' : '已同步') + '</span></div></div>' +
          '<div class="vch-chart"><b>' + r.pv + '</b>' + spark(r.d, r.color, 120, 34) + '</div>' +
          '<span class="vch-go">' + I('chevron', 15) + '</span>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="vch-foot"><button data-act="go" data-id="chn-map">' + I('layers', 14) + '查看渠道 × 页面矩阵</button>' +
        '<button data-act="previewAll">' + I('eye', 14) + '打开三端预览</button></div>' +
    '</section>';
  }

  function homeTasks() {
    const s = homeStats();
    const tasks = [
      { p: 'red', t: s.unannotated + ' 条运动记录待批注', d: '超过 24 小时未处理 · 影响学员体验', who: '王雪 / 陈放', go: 'v-annotations', tag: '立即处理' },
      { p: 'amber', t: s.pendingClaims + ' 单奖励待发货', d: '物流时效考核 · 已领取未出库', who: '履约组', go: 'v-claims', tag: '今日' },
      { p: 'amber', t: s.dirty + ' 项配置已改未发布', d: '线上仍是上一版本', who: '孙敏', go: 's-publish', tag: '发布' },
      { p: 'blue', t: '3 个服务 7 天无预约', d: '建议检查可约状态与价格', who: '健康管理部', go: 'e-services', tag: '排查' },
      { p: 'teal', t: '第 8 期开营物料待确认', d: '离开营还有 23 天 · 报名 23/60', who: '运营中心', go: 'v-camps', tag: '排期' }
    ];
    return '<section class="vcard vqueue">' +
      '<div class="vcard-h"><div><h3>作战队列</h3><p>按影响与时序排序</p></div><span class="vbadge">' + tasks.length + '</span></div>' +
      '<div class="vq-list">' + tasks.map((t) =>
        '<button class="vq" data-act="go" data-id="' + t.go + '">' +
          '<i class="vq-p ' + t.p + '"></i>' +
          '<div class="vq-t"><b>' + E(t.t) + '</b><span>' + E(t.d) + '</span></div>' +
          '<div class="vq-side"><em>' + E(t.tag) + '</em><span>' + E(t.who) + '</span></div>' +
        '</button>').join('') + '</div>' +
      '<div class="vq-foot">' + I('check', 13) + ' 今日已处理 <b>7</b> 项 · 平均响应 1.8h</div>' +
    '</section>';
  }

  function homeFunnel() {
    const steps = [
      { k: '访问', v: 124600, w: 100, c: '#0B63E5' },
      { k: '注册 / 登录', v: 38600, w: 72, c: '#2377E8' },
      { k: '预约 / 报名', v: 9820, w: 46, c: '#0A9E94' },
      { k: '到院 / 开营', v: 7460, w: 32, c: '#2FA97F' },
      { k: '复购 / 续营', v: 2180, w: 18, c: '#6B5CE0' }
    ];
    return '<section class="vcard vfunnel">' +
      '<div class="vcard-h"><div><h3>跨端转化漏斗</h3><p>近 30 天 · 三端合并</p></div>' +
        '<div class="vseg"><button class="on">30 天</button><button>90 天</button></div></div>' +
      '<div class="vf-rows">' + steps.map((s, i) => {
        const conv = i ? Math.round(s.v / steps[i - 1].v * 100) : 100;
        return '<div class="vf-row"><span class="vf-k">' + s.k + '</span>' +
          '<div class="vf-bar"><i style="width:' + s.w + '%;background:' + s.c + '"></i><b>' + nf(s.v) + '</b></div>' +
          '<span class="vf-c">' + (i ? conv + '%' : '—') + '</span></div>';
      }).join('') + '</div>' +
      '<div class="vf-note">' + I('spark', 13) + ' 注册→预约 流失最大（-74.6%），建议优化服务详情页的首屏说明与价格锚点。</div>' +
    '</section>';
  }

  function homeRelease() {
    const dirty = Store.dirty;
    const by = {};
    dirty.forEach((d) => { by[d.app] = (by[d.app] || 0) + 1; });
    const imp = impactOf(dirty);
    const gates = dirty.length ? gatesFor(dirty) : [];
    return '<section class="vcard vrelease">' +
      '<div class="vcard-h"><div><h3>发布列车</h3><p>变更 → 校验 → 三端生效</p></div>' +
        '<span class="vbadge ' + (dirty.length ? 'warn' : 'ok') + '">' + (dirty.length ? dirty.length + ' 项待发' : '已同步') + '</span></div>' +
      (dirty.length ?
        '<div class="vr-groups">' + Object.keys(by).map((a) =>
          '<div class="vr-g"><span class="vdot ' + TONE[a] + '"></span><b>' + (APP[a] || a) + '</b><em>' + by[a] + '</em></div>').join('') + '</div>' +
        '<div class="vr-impact"><span>影响</span><b>' + imp.channels.length + '</b> 个渠道 · <b>' + imp.pages.length + '</b> 个页面</div>' +
        '<div class="vr-gates">' + gates.slice(0, 3).map((g) =>
          '<div class="' + (g.ok ? 'ok' : 'bad') + '">' + I(g.ok ? 'check' : 'x', 12) + '<span>' + E(g.k) + '</span><em>' + E(g.d) + '</em></div>').join('') + '</div>' +
        '<button class="vbtn dark block" data-act="publish">' + I('send', 14) + '进入发布检查</button>'
        : '<div class="vr-empty">' + I('check', 22) + '<b>线上与本地一致</b><span>下一次编辑会进入这里</span></div>') +
    '</section>';
  }

  function homeRisk() {
    const risks = [
      { l: '高', t: '3 个服务价格倒挂', d: '结算价高于挂牌价', go: 'svc-pricing' },
      { l: '中', t: '2 个奖励库存为 0', d: '仍在奖励页展示', go: 'v-tiers' },
      { l: '中', t: '1 位高风险学员 3 天无记录', d: '建议营养师回访', go: 'v-students' },
      { l: '低', t: '品牌站分享卡缺失', d: '影响社交传播', go: 'b-site' }
    ];
    return '<section class="vcard vrisk">' +
      '<div class="vcard-h"><div><h3>风险雷达</h3><p>规则自动扫描</p></div><span class="vbadge warn">4</span></div>' +
      '<div class="vrk-list">' + risks.map((r) =>
        '<button class="vrk" data-act="go" data-id="' + r.go + '"><i class="' + (r.l === '高' ? 'high' : r.l === '中' ? 'mid' : 'low') + '"></i>' +
        '<div><b>' + E(r.t) + '</b><span>' + E(r.d) + '</span></div><em>' + r.l + '</em></button>').join('') + '</div>' +
    '</section>';
  }

  function homeCoverage() {
    const full = COVERAGE.filter((c) => c.status === 'full').length;
    const partial = COVERAGE.filter((c) => c.status === 'partial').length;
    const missing = COVERAGE.filter((c) => c.status === 'missing').length;
    const total = COVERAGE.length;
    const ends = [
      { k: '品牌站', n: COVERAGE.filter((c) => c.ch === 'pku').length, tone: 'teal' },
      { k: '职工健康', n: COVERAGE.filter((c) => c.ch === 'employee').length, tone: 'amber' },
      { k: '减重营', n: COVERAGE.filter((c) => c.ch === 'camp').length, tone: 'blue' }
    ];
    return '<section class="vcard vcoverage">' +
      '<div class="vcard-h"><div><h3>前端功能地图</h3><p>每个 H5 功能是否都有后台操控</p></div>' +
        '<button class="vlink" data-act="go" data-id="g-coverage">打开矩阵 ' + I('chevron', 13) + '</button></div>' +
      '<div class="vcov-body">' + ring(full / total * 100, 88, '#0B63E5', '完全覆盖') +
        '<div class="vcov-nums"><div><b>' + total + '</b><span>前端功能点</span></div><div><b class="teal">' + full + '</b><span>完全可管</span></div>' +
        '<div><b class="amber">' + partial + '</b><span>部分可管</span></div><div><b class="coral">' + missing + '</b><span>缺口</span></div></div>' +
      '</div>' +
      '<div class="vcov-bars">' + ends.map((e) =>
        '<div><span>' + e.k + '</span><div class="vbar"><i class="' + e.tone + '" style="width:' + (e.n / total * 100 + 40) + '%"></i></div><b>' + e.n + '</b></div>').join('') + '</div>' +
    '</section>';
  }

  function homeSetup() {
    const db = Store.db;
    const eb = (db.brand && db.brand.banners) || [];
    const em = (db.employee && db.employee.banners) || [];
    const vb = (db.versionall && db.versionall.banners) || [];
    const goods = (db.supplements || []).length;
    const services = ((db.employee && db.employee.services) || []).length;
    const qa = ((db.employee && db.employee.qa) || []).length;
    const profiles = ((db.health && db.health.profiles) || []).length;
    const members = ((db.fivegood && db.fivegood.members) || []).length;
    const cards = [
      { t: '轮播与开屏', d: '三个 H5 的首屏图片、文案、跳转、投放时间', n: (eb.length + em.length + vb.length) + ' 张已配置', r: 'content-banners', ic: 'image' },
      { t: '职工端服务详情', d: '主图、图集、图文介绍、流程、须知与适用人群', n: services + ' 项服务', r: 'e-services', ic: 'stethoscope' },
      { t: '实物商品', d: '主图、图集、图文详情、SKU、库存与售后', n: goods + ' 个商品', r: 'svc-goods', ic: 'gift' },
      { t: '健康科普内容', d: '封面、作者、图文正文、分类与上下线', n: ((db.employee && db.employee.articles) || []).length + ' 篇文章', r: 'e-content', ic: 'video' },
      { t: '深度问答知识库', d: '标准回复、图文补充、置顶、审核与未命中问题', n: qa + ' 条问答', r: 'e-qa', ic: 'message' },
      { t: '健康管理闭环', d: '风险分层、管理计划、随访、结果与企业报告', n: profiles + ' 份档案', r: 'h-overview', ic: 'shield' },
      { t: '五好生活运营', d: '五维内容、任务、打卡审核、信号升级与月度报告', n: members + ' 名会员', r: 'fg-overview', ic: 'spark' },
      { t: '前端功能地图', d: '逐个 H5 功能看后台入口、覆盖状态与还缺什么', n: COVERAGE.length + ' 个功能点', r: 'g-coverage', ic: 'target' }
    ];
    return '<section class="vcard vsetup">' +
      '<div class="vcard-h"><div><h3>内容与服务配置入口</h3><p>用户在前端看到的图片、介绍、流程和问答，都在这里改</p></div>' +
        '<button class="vlink" data-act="go" data-id="g-coverage">看完整功能地图 ' + I('chevron', 13) + '</button></div>' +
      '<div class="setup-grid">' + cards.map((c) =>
        '<button class="setup-card" data-act="go" data-id="' + c.r + '">' +
          '<span class="sc-h"><span class="sc-ic">' + I(c.ic, 15) + '</span><b>' + E(c.t) + '</b></span>' +
          '<span>' + E(c.d) + '</span>' +
          '<span class="sc-foot"><span class="sc-count">' + E(c.n) + '</span><span class="sc-arrow">去配置 ' + I('chevron', 10) + '</span></span>' +
        '</button>').join('') + '</div></section>';
  }

  function homeInsights() {
    const items = [
      { t: '周三 20:00 是打卡低谷', d: '近 4 周同期完成率下降 12%，建议把提醒提前到 18:30。', tag: '项目运营', go: 'v-records' },
      { t: '体检→检后解读转化 18%', d: '低于同业 26%，可在报告页嵌入一键预约解读。', tag: '商品', go: 'svc-bundles' },
      { t: '品牌站→职工端跳转仅 3.2%', d: '分院页 CTA 文案偏弱，建议改为「为团队预约」。', tag: '增长', go: 'b-hospitals' }
    ];
    return '<section class="vcard vinsight">' +
      '<div class="vcard-h"><div><h3>经营洞察</h3><p>规则引擎 · 每日 06:00 更新</p></div>' +
        '<button class="vlink" data-act="go" data-id="g-insights">全部洞察 ' + I('chevron', 13) + '</button></div>' +
      '<div class="vi-list">' + items.map((x) =>
        '<button class="vi" data-act="go" data-id="' + x.go + '"><span class="vi-tag">' + x.tag + '</span>' +
        '<b>' + E(x.t) + '</b><p>' + E(x.d) + '</p><em>查看建议 ' + I('chevron', 12) + '</em></button>').join('') + '</div>' +
    '</section>';
  }

  P['workbench'] = {
    app: 'all', title: '指挥中心', sub: '三端经营、待办与发布',
    grp: 'command',
    preview: 'pku-home', papp: 'pku',
    render() {
      ensure();
      return '<div class="vhome">' + homeHero() + homeKpis() +
        '<div style="height:14px"></div>' + homeSetup() + '<div style="height:14px"></div>' +
        '<div class="vbento">' +
          '<div class="b8">' + homeChannels() + '</div>' +
          '<div class="b4">' + homeTasks() + '</div>' +
          '<div class="b5">' + homeFunnel() + '</div>' +
          '<div class="b4">' + homeRelease() + '</div>' +
          '<div class="b3">' + homeRisk() + '</div>' +
          '<div class="b7">' + homeInsights() + '</div>' +
          '<div class="b5">' + homeCoverage() + '</div>' +
        '</div></div>';
    },
    actions: {
      go(d) { App.go(d.id); },
      impact() { App.go('g-impact'); },
      previewAll() { App.openPreview(); },
      publish() { App.openPublish(''); }
    }
  };

  /* ============================================================ COVERAGE */
  let covFilter = { ch: 'all', status: 'all' };
  P['g-coverage'] = {
    app: 'all', title: '前端功能地图', sub: '三个 H5 每个可见功能 ↔ 后台具体入口',
    grp: 'insight',
    render() {
      const total = COVERAGE.length;
      const full = COVERAGE.filter((c) => c.status === 'full').length;
      const partial = COVERAGE.filter((c) => c.status === 'partial').length;
      const missing = COVERAGE.filter((c) => c.status === 'missing').length;
      const rows = COVERAGE.filter((c) => (covFilter.ch === 'all' || c.ch === covFilter.ch) && (covFilter.status === 'all' || c.status === covFilter.status));
      const ends = [['all', '全部端'], ['pku', '品牌站'], ['employee', '职工健康'], ['camp', '减重营']];
      return K.head('前端功能地图', '用户在前端看到的每一块，都能在右边找到对应的后台页面；点进去就是配置入口',
        '<button class="btn" data-act="exportCoverage">' + I('download', 15) + '导出覆盖报告</button>' +
        '<button class="btn primary" data-act="go" data-id="chn-map">' + I('layers', 15) + '渠道图谱</button>', 'INSIGHT / COVERAGE') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>功能点</span><b>' + total + '</b><em>覆盖 3 个 H5 · 9 个页面簇</em></div>' +
          '<div class="vsum-card ok"><span>完全可管</span><b>' + full + '</b><em>' + pct(full / total * 100) + ' 一键直达后台</em></div>' +
          '<div class="vsum-card warn"><span>部分可管</span><b>' + partial + '</b><em>已有入口，交互深度待补</em></div>' +
          '<div class="vsum-card bad"><span>能力缺口</span><b>' + missing + '</b><em>已进入下一迭代清单</em></div>' +
        '</div>' +
        '<div class="vfilter">' +
          '<div class="vseg">' + ends.map((e) => '<button data-act="covCh" data-id="' + e[0] + '" class="' + (covFilter.ch === e[0] ? 'on' : '') + '">' + e[1] + '</button>').join('') + '</div>' +
          '<div class="vseg">' + [['all', '全部状态'], ['full', '完全可管'], ['partial', '部分可管'], ['missing', '缺口']].map((e) =>
            '<button data-act="covStatus" data-id="' + e[0] + '" class="' + (covFilter.status === e[0] ? 'on' : '') + '">' + e[1] + '</button>').join('') + '</div>' +
          '<span class="vfilter-n">' + rows.length + ' 项</span>' +
        '</div>' +
        '<div class="vcov-table">' + ['pku', 'employee', 'camp'].filter((ch) => covFilter.ch === 'all' || covFilter.ch === ch).map((ch) => {
          const list = rows.filter((c) => c.ch === ch);
          if (!list.length) return '';
          const cc = list.filter((c) => c.status === 'full').length;
          return '<section class="vcov-sec"><header><span class="vdot ' + TONE[ch] + '"></span><h3>' + APP[ch === 'camp' ? 'versionall' : ch] + '</h3>' +
            '<em>' + cc + '/' + list.length + ' 完全可管</em><div class="vbar"><i class="' + TONE[ch] + '" style="width:' + (cc / list.length * 100) + '%"></i></div></header>' +
            list.map((c) =>
              '<button class="vcrow ' + c.status + '" data-act="go" data-id="' + c.route + '">' +
                '<div class="vcrow-f"><b>' + E(c.feature) + '</b><span>' + E(c.page) + '</span></div>' +
                '<div class="vcrow-c">' + I('chevron', 12) + '<span>' + E(c.ctrl) + '</span></div>' +
                '<div class="vcrow-n">' + E(c.note) + '</div>' +
                '<div class="vcrow-s">' + (c.status === 'full' ? '完全' : c.status === 'partial' ? '部分' : '缺口') + '</div>' +
              '</button>').join('') + '</section>';
        }).join('') + '</div>';
    },
    actions: {
      covCh(d) { covFilter.ch = d.id; App.refresh(); },
      covStatus(d) { covFilter.status = d.id; App.refresh(); },
      exportCoverage() {
        const csv = ['端,页面,功能,后台入口,状态,说明'].concat(COVERAGE.map((c) => [APP[c.ch === 'camp' ? 'versionall' : c.ch], c.page, c.feature, c.ctrl, c.status, c.note].join(','))).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
        a.download = 'pku-console-coverage.csv'; a.click();
        UI.toast('覆盖报告已导出');
      }
    }
  };

  /* ============================================================ CHANNEL MAP */
  function chCard(ch, page) {
    const on = !!channelPages(ch)[page.id];
    const dirtyPath = 'channelPages.' + ch + '.' + page.id;
    const isDirty = Store.dirty.some((d) => d.path === dirtyPath);
    return '<div class="vmap-page ' + (on ? '' : 'off') + '">' +
      '<div class="vmap-top"><b>' + E(page.name) + '</b><span class="vm-path">' + E(page.path) + '</span></div>' +
      '<p>' + E(page.desc) + '</p>' +
      '<div class="vmap-foot"><button class="vmap-link" data-act="go" data-id="' + page.route + '">' + I('sliders', 12) + '编辑</button>' +
        '<button class="vswitch ' + (on ? 'on' : '') + '" data-toggle="' + dirtyPath + '" title="' + (on ? '下线该页面' : '上线该页面') + '"><i></i></button>' +
        (isDirty ? '<span class="vmap-dirty">待发布</span>' : '') +
      '</div></div>';
  }

  P['chn-map'] = {
    app: 'all', title: '渠道图谱', sub: '一个渠道里有哪几页、每页管什么',
    grp: 'growth',
    render() {
      ensure();
      const chs = [
        { id: 'brand', name: '品牌站 H5', app: 'pku', tone: 'teal', url: 'https://baoweidong.github.io/PKU-introduce/mobile.html', desc: '公众获客 · 品牌与专家信任', pages: CH_PAGES.brand },
        { id: 'employee', name: '职工健康 H5', app: 'employee', tone: 'amber', url: 'https://baoweidong.github.io/pku-employee-health/', desc: '企业员工 · 权益与服务履约', pages: CH_PAGES.employee },
        { id: 'camp', name: '减重营 H5', app: 'versionall', tone: 'blue', url: 'https://baoweidong.github.io/versionall/', desc: '营期学员 · 打卡、激励与报告', pages: CH_PAGES.camp }
      ];
      const totalOn = chs.reduce((a, c) => a + c.pages.filter((p) => channelPages(c.id)[p.id]).length, 0);
      const total = chs.reduce((a, c) => a + c.pages.length, 0);
      return K.head('渠道图谱', '渠道不是菜单，而是内容与服务的投放面。每一页都可单独上下线、预览与编辑。',
        '<button class="btn" data-act="previewAll">' + I('eye', 15) + '三端预览</button>' +
        '<button class="btn primary" data-act="publish">' + I('send', 15) + '发布渠道变更</button>', 'GROWTH / CHANNELS') +
        '<div class="vmap-head"><div><b>' + totalOn + '</b><span>/ ' + total + ' 个页面在线</span></div>' +
        '<div class="vmap-legend"><span><i class="on"></i>在线</span><span><i></i>下线</span><span><i class="dirty"></i>待发布</span></div></div>' +
        '<div class="vmap-grid">' + chs.map((c) =>
          '<section class="vmap-col"><header><div class="vmap-ch"><span class="vdot ' + c.tone + '"></span><div><h3>' + c.name + '</h3><p>' + c.desc + '</p></div></div>' +
            '<a class="vmap-open" href="' + c.url + '" target="_blank" rel="noopener">' + I('external', 13) + '</a></header>' +
            '<div class="vmap-list">' + c.pages.map((p) => chCard(c.id, p)).join('') + '</div>' +
            '<footer><button data-act="go" data-id="' + (c.id === 'brand' ? 'b-home' : c.id === 'employee' ? 'e-site' : 'v-dashboard') + '">管理站点设置 ' + I('chevron', 12) + '</button></footer>' +
          '</section>').join('') + '</div>';
    },
    actions: {
      previewAll() { App.openPreview(); }
    }
  };

  /* ============================================================ IMPACT */
  P['g-impact'] = {
    app: 'all', title: '变更影响', sub: '一次改动会影响哪些端、哪些页',
    grp: 'command',
    render() {
      const dirty = Store.dirty;
      const imp = impactOf(dirty);
      const gates = gatesFor(dirty);
      const risk = gates.filter((g) => !g.ok).length;
      return K.head('变更影响', '在发布前看清影响面：渠道、页面、数据对象与校验闸门；从任何工作区点进来都会保留返回路径',
        '<button class="btn" data-act="go" data-id="s-publish">' + I('send', 15) + '去发布</button>', 'GLOBAL / IMPACT') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>未发布变更</span><b>' + dirty.length + '</b><em>本地工作区</em></div>' +
          '<div class="vsum-card"><span>影响渠道</span><b>' + imp.channels.length + '</b><em>共 3 个上线渠道</em></div>' +
          '<div class="vsum-card"><span>影响页面</span><b>' + imp.pages.length + '</b><em>跨端页面与模块</em></div>' +
          '<div class="vsum-card ' + (risk ? 'bad' : 'ok') + '"><span>阻断项</span><b>' + risk + '</b><em>' + (risk ? '发布前必须修复' : '全部校验通过') + '</em></div>' +
        '</div>' +
        (dirty.length ? '<div class="vimpact-grid">' +
          '<section class="vcard"><div class="vcard-h"><div><h3>变更清单</h3><p>按影响对象聚合</p></div></div>' +
            '<div class="vimp-list">' + dirty.map((d) =>
              '<div class="vimp-row"><span class="vdot ' + TONE[d.app] + '"></span><div><b>' + E(d.label) + '</b><span>' + E(d.path) + '</span></div>' +
              '<em>' + (APP[d.app] || d.app) + '</em></div>').join('') + '</div></section>' +
          '<section class="vcard"><div class="vcard-h"><div><h3>影响地图</h3><p>渠道 → 页面</p></div></div>' +
            '<div class="vimp-map">' + ['pku', 'employee', 'versionall'].map((ch) => {
              const on = imp.channels.indexOf(ch) >= 0;
              const cp = Object.keys(imp.per[ch] || {});
              return '<div class="vimp-ch ' + (on ? 'on' : '') + '"><div class="vimp-ch-h"><span class="vdot ' + TONE[ch] + '"></span><b>' + APP[ch] + '</b><em>' + (on ? cp.length + ' 个页面受影响' : '不受影响') + '</em></div>' +
                '<div class="vimp-pages">' + (cp.length ? cp.map((p) => '<span>' + E(p) + '</span>').join('') : '<span class="mut">—</span>') + '</div></div>';
            }).join('') + '</div></section>' +
          '<section class="vcard vgates"><div class="vcard-h"><div><h3>发布闸门</h3><p>不通过则阻断</p></div></div>' +
            '<div class="vgate-list">' + gates.map((g) =>
              '<div class="vgate ' + (g.ok ? 'ok' : 'bad') + '"><span class="vgate-ic">' + I(g.ok ? 'check' : 'x', 14) + '</span><div><b>' + E(g.k) + '</b><span>' + E(g.d) + '</span></div></div>').join('') + '</div></section>' +
        '</div>' : '<div class="vcard vempty-lg">' + I('check', 28) + '<b>没有未发布变更</b><span>编辑任意配置后，这里会自动生成影响面分析。</span></div>');
    }
  };

  /* ============================================================ INSIGHTS */
  P['g-insights'] = {
    app: 'all', title: '经营洞察', sub: '跨端增长、转化与健康结果',
    grp: 'insight',
    render() {
      const db = dbx();
      const trend = [186, 204, 198, 226, 241, 238, 262, 279, 268, 301, 318, 336];
      return K.head('经营洞察', '把三端数据放在一个口径下：规模、转化、履约与健康结果',
        '<div class="vseg"><button class="on">近 30 天</button><button>本季度</button><button>年度</button></div>' +
        '<button class="btn" data-act="exportInsight">' + I('download', 15) + '导出</button>', 'INSIGHT / OVERVIEW') +
        '<div class="vsummary">' +
          '<div class="vsum-card"><span>交易额</span><b>¥42.86万</b><em>环比 +18.2%</em></div>' +
          '<div class="vsum-card"><span>服务人次</span><b>2,486</b><em>环比 +9.4%</em></div>' +
          '<div class="vsum-card"><span>获客成本</span><b>¥86</b><em>环比 -12.5%</em></div>' +
          '<div class="vsum-card ok"><span>履约达成</span><b>94.6%</b><em>目标 92%</em></div>' +
        '</div>' +
        '<div class="vins-grid">' +
          '<section class="vcard vins-chart"><div class="vcard-h"><div><h3>收入与订单趋势</h3><p>2026 年 · 月度</p></div><span class="vbadge ok">+18.2%</span></div>' +
            '<div class="vchart-big">' + spark(trend, '#0B63E5', 760, 190) + '</div>' +
            '<div class="vchart-x">' + ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'].map((m) => '<span>' + m + '</span>').join('') + '</div>' +
          '</section>' +
          '<section class="vcard"><div class="vcard-h"><div><h3>渠道贡献</h3><p>交易额占比</p></div></div>' +
            '<div class="vdonut">' + ring(64, 132, '#0B63E5', '职工健康') +
              '<div class="vdonut-legend">' +
                '<div><i style="background:#0B63E5"></i><span>职工健康</span><b>64%</b></div>' +
                '<div><i style="background:#3F8CFF"></i><span>减重营</span><b>23%</b></div>' +
                '<div><i style="background:#0A9E94"></i><span>品牌站</span><b>9%</b></div>' +
                '<div><i style="background:#C8871A"></i><span>企业微信</span><b>4%</b></div>' +
              '</div></div></section>' +
          '<section class="vcard"><div class="vcard-h"><div><h3>服务结构</h3><p>按品类 · 近 30 天</p></div></div>' +
            '<div class="vsvc-list">' + [['健康筛查', 38, '#0B63E5'], ['慢病管理', 24, '#0A9E94'], ['就医服务', 18, '#6B5CE0'], ['特色服务', 12, '#C8871A'], ['应急保障', 8, '#D9503F']].map((x) =>
              '<div class="vsvc"><span>' + x[0] + '</span><div class="vbar"><i style="width:' + x[1] * 2 + '%;background:' + x[2] + '"></i></div><b>' + x[1] + '%</b></div>').join('') + '</div>' +
          '</section>' +
          '<section class="vcard vwide"><div class="vcard-h"><div><h3>营期健康结果</h3><p>第 7 期 · 入营 vs 当前</p></div>' +
            '<button class="vlink" data-act="go" data-id="v-stats">营期统计 ' + I('chevron', 12) + '</button></div>' +
            '<div class="vresult-grid">' +
              [['平均减重', '3.8', 'kg', '+0.6'], ['体脂下降', '2.4', 'pt', '+0.3'], ['打卡完成率', '78', '%', '+5'], ['高风险改善', '41', '%', '+8']].map((x) =>
                '<div class="vresult"><span>' + x[0] + '</span><b>' + x[1] + '<small>' + x[2] + '</small></b><em>' + x[3] + ' vs 上期</em></div>').join('') +
            '</div></section>' +
        '</div>';
    },
    actions: {
      exportInsight() { UI.toast('经营月报已生成，可在下载中心查看'); }
    }
  };

  /* ============================================================ CUSTOMER 360 */
  function customers() {
    const db = dbx();
    const map = {};
    (db.employee.bookings || []).forEach((b) => {
      const key = b.person;
      map[key] = map[key] || { name: key, dept: b.dept, phone: b.phone, bookings: [], orders: 0, spend: 0, tags: [], last: b.created };
      map[key].bookings.push(b);
      map[key].last = b.created > map[key].last ? b.created : map[key].last;
    });
    (db.versionall.students || []).forEach((s) => {
      map[s.name] = map[s.name] || { name: s.name, dept: '减重营', phone: s.phone, bookings: [], orders: 0, spend: 0, tags: [], last: s.joined };
      map[s.name].student = s;
      map[s.name].tags = s.tags || [];
    });
    (db.versionall.claims || []).forEach((c) => {
      if (map[c.studentName]) { map[c.studentName].orders++; map[c.studentName].claim = c; }
    });
    return Object.keys(map).map((k) => map[k]).sort((a, b) => (a.last < b.last ? 1 : -1));
  }

  P['crm-360'] = {
    app: 'all', title: '客户 360', sub: '一个人在三端的所有关系',
    grp: 'trade',
    render() {
      const list = customers();
      const sel = list[0];
      return K.head('客户 360', '客户不是一个订单，而是权益、服务、健康档案与触达的统一视图',
        '<button class="btn" data-act="exportCustomers">' + I('download', 15) + '导出客户</button>', 'TRADE / CUSTOMER 360') +
        '<div class="v360">' +
          '<aside class="v360-list">' +
            '<div class="v360-search">' + I('search', 14) + '<input placeholder="搜索姓名 / 手机号 / 部门" data-filter="c360"></div>' +
            '<div class="v360-count">' + list.length + ' 位客户 · 最近活跃</div>' +
            list.map((c, i) => '<button class="v360-item ' + (i === 0 ? 'on' : '') + '" data-act="pickCustomer" data-id="' + E(c.name) + '">' +
              '<span class="vava">' + E(c.name.slice(0, 1)) + '</span><div><b>' + E(c.name) + '</b><span>' + E(c.dept || '—') + ' · ' + E((c.last || '').slice(5, 10)) + '</span></div>' +
              (c.student ? '<em class="vdot blue"></em>' : '<em class="vdot amber"></em>') + '</button>').join('') +
          '</aside>' +
          '<section class="v360-main">' +
            '<header class="v360-hero"><span class="vava xl">' + E(sel.name.slice(0, 1)) + '</span>' +
              '<div class="v360-id"><h2>' + E(sel.name) + '</h2><p>' + E(sel.dept || '') + ' · ' + E(sel.phone || '') + ' · 最近活跃 ' + E((sel.last || '').slice(0, 10)) + '</p>' +
              '<div class="vchips">' + (sel.tags || []).map((t) => '<span>' + E(t) + '</span>').join('') + '<span class="blue">高价值</span></div></div>' +
              '<div class="v360-actions"><button class="vbtn ghost" data-act="touchCustomer">' + I('send', 13) + '触达</button>' +
              '<button class="vbtn ghost" data-act="grantCustomer">' + I('gift', 13) + '发权益</button></div>' +
            '</header>' +
            '<div class="v360-kpis">' +
              [['累计服务', (sel.bookings.length + (sel.student ? 1 : 0)) + ' 次'], ['累计消费', '¥' + nf(sel.bookings.length * 1280)], ['权益余额', '3 项'], ['健康风险', sel.student ? (sel.student.risk === 'high' ? '高' : sel.student.risk === 'mid' ? '中' : '低') : '—']].map((x) =>
                '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>').join('') + '</div>' +
            '<div class="v360-cols">' +
              '<div class="v360-block"><h3>服务与订单</h3>' +
                (sel.bookings.length ? sel.bookings.map((b) =>
                  '<div class="v360-row"><span class="vdot ' + (b.status === 'pending' ? 'amber' : 'teal') + '"></span><div><b>' + E(b.service) + '</b><span>' + E(b.date) + ' ' + E(b.time) + ' · ' + E(b.org) + '</span></div><em>' + (b.status === 'pending' ? '待确认' : '已预约') + '</em></div>').join('') : '<div class="vempty-sm">暂无职工端预约</div>') +
                (sel.student ? '<div class="v360-row"><span class="vdot blue"></span><div><b>减重营 · 第 7 期</b><span>入营 ' + E(sel.student.joined) + ' · 当前 ' + sel.student.weight + 'kg</span></div><em>在营</em></div>' : '') +
              '</div>' +
              '<div class="v360-block"><h3>健康档案</h3>' +
                (sel.student ? '<dl class="vkv"><dt>身高</dt><dd>' + sel.student.height + ' cm</dd><dt>起始体重</dt><dd>' + sel.student.startWeight + ' kg</dd><dt>当前体重</dt><dd>' + sel.student.weight + ' kg</dd><dt>体脂</dt><dd>' + sel.student.bodyFat + '%</dd><dt>目标</dt><dd>' + sel.student.targetWeight + ' kg</dd></dl>' : '<div class="vempty-sm">暂无健康档案</div>') +
              '</div>' +
              '<div class="v360-block"><h3>权益与关系</h3><dl class="vkv"><dt>所属企业</dt><dd>示例科技有限公司</dd><dt>年度体检</dt><dd>1 次 · 未使用</dd><dt>EAP</dt><dd>6 次 · 剩 4 次</dd><dt>责任营养师</dt><dd>' + E(sel.student ? sel.student.dietitian : '—') + '</dd><dt>责任教练</dt><dd>' + E(sel.student ? sel.student.coach : '—') + '</dd></dl></div>' +
            '</div>' +
            '<div class="v360-block v360-timeline"><h3>最近动态</h3>' +
              (sel.bookings.slice(0, 3).map((b) => '<div class="vtl-row"><i></i><div><b>预约「' + E(b.service) + '」</b><span>' + E(b.created) + '</span></div></div>').join('') || '') +
              '<div class="vtl-row"><i class="teal"></i><div><b>完成年度健康风险评估</b><span>2026-10-28 · 职工健康 H5</span></div></div>' +
              '<div class="vtl-row"><i class="violet"></i><div><b>收到运营触达「秋季体检提醒」</b><span>2026-10-21 · 企微模板消息</span></div></div>' +
            '</div>' +
          '</section>' +
        '</div>';
    },
    actions: {
      pickCustomer() { UI.toast('已切换客户（演示数据仅展示首位完整档案）'); },
      touchCustomer() { UI.toast('已打开触达编辑器，可选择短信 / 企微 / 站内信'); },
      grantCustomer() { UI.toast('已打开权益发放，支持体检、EAP、商城券'); },
      exportCustomers() { UI.toast('客户清单已导出（脱敏）'); }
    }
  };

  /* ============================================================ RELEASE CENTER */
  P['s-publish'] = {
    app: 'all', title: '发布中心', sub: '变更、校验、发布与回滚',
    grp: 'platform',
    render() {
      const dirty = Store.dirty;
      const by = {};
      dirty.forEach((d) => { (by[d.app] = by[d.app] || []).push(d); });
      const imp = impactOf(dirty);
      const gates = gatesFor(dirty);
      const bad = gates.filter((g) => !g.ok).length;
      const running = dirty.length > 0;
      return K.head('发布中心', '从工作区到线上：先看影响，再过闸门，最后按端发布',
        '<button class="btn" data-act="configFile">' + I('link', 15) + '连接 GitHub / 推送配置</button>' +
        (dirty.length ? '<button class="btn" data-act="discard" style="color:var(--coral)">丢弃变更</button>' : '') +
        '<button class="btn primary" data-act="publish"' + (dirty.length && !bad ? '' : ' disabled') + '>' + I('send', 15) + (bad ? '先修复 ' + bad + ' 项' : '发布 ' + dirty.length + ' 项') + '</button>', 'PLATFORM / RELEASE') +
        '<div class="vrel-top">' +
          '<div class="vrel-stage ' + (running ? 'on' : '') + '"><span>1</span><div><b>工作区</b><em>' + dirty.length + ' 项改动</em></div></div><i class="vrel-line"></i>' +
          '<div class="vrel-stage ' + (running && !bad ? 'on' : '') + '"><span>2</span><div><b>校验闸门</b><em>' + (bad ? bad + ' 项阻断' : '全部通过') + '</em></div></div><i class="vrel-line"></i>' +
          '<div class="vrel-stage"><span>3</span><div><b>发布</b><em>三端配置</em></div></div><i class="vrel-line"></i>' +
          '<div class="vrel-stage"><span>4</span><div><b>生效</b><em>1 分钟内</em></div></div>' +
        '</div>' +
        '<div class="vrel-grid">' +
          '<section class="vcard vrel-main"><div class="vcard-h"><div><h3>待发布变更</h3><p>' + dirty.length + ' 项 · 影响 ' + imp.channels.length + ' 个渠道 / ' + imp.pages.length + ' 个页面</p></div></div>' +
            (dirty.length ? ['versionall', 'employee', 'pku', 'system'].filter((a) => by[a]).map((a) =>
              '<div class="vrel-group"><header><span class="vdot ' + TONE[a] + '"></span><b>' + (APP[a] || a) + '</b><em>' + by[a].length + '</em></header>' +
                by[a].map((d) => '<div class="vrel-row"><div><b>' + E(d.label) + '</b><span>' + E(d.path) + '</span></div>' +
                  '<button class="vrel-x" data-act="revertOne" data-id="' + E(d.path) + '" title="撤回">' + I('undo', 13) + '</button></div>').join('') + '</div>').join('')
              : '<div class="vempty-lg">' + I('check', 28) + '<b>工作区是干净的</b><span>所有变更都已发布到线上</span></div>') +
          '</section>' +
          '<aside class="vstack">' +
            '<section class="vcard"><div class="vcard-h"><div><h3>发布闸门</h3><p>阻断项必须先修复</p></div></div>' +
              '<div class="vgate-list">' + gates.map((g) =>
                '<div class="vgate ' + (g.ok ? 'ok' : 'bad') + '"><span class="vgate-ic">' + I(g.ok ? 'check' : 'x', 14) + '</span><div><b>' + E(g.k) + '</b><span>' + E(g.d) + '</span></div></div>').join('') + '</div></section>' +
            '<section class="vcard"><div class="vcard-h"><div><h3>发布选项</h3><p>本次生效方式</p></div></div>' +
              '<div class="vopt"><div><b>发布说明</b><input class="vinput" placeholder="如：第 8 期奖励档位调整" data-set="meta.releaseNote"></div>' +
              '<label class="vcheck"><input type="checkbox" checked disabled><span>发布后通知相关运营</span></label>' +
              '<label class="vcheck"><input type="checkbox" checked disabled><span>保留回滚快照</span></label>' +
              '<label class="vcheck"><input type="checkbox" disabled><span>按企业灰度（下一迭代）</span></label></div></section>' +
            '<section class="vcard"><div class="vcard-h"><div><h3>发布历史</h3><p>最近 3 次</p></div></div>' +
              '<div class="vrel-history">' + (Store.db.publishes || []).slice(0, 3).map((p) =>
                '<div class="vrel-h"><div><b>' + E(p.title) + '</b><span>' + E(p.at) + ' · ' + E(p.by) + ' · ' + p.items + ' 项</span></div>' +
                '<button class="vmini" data-act="rollback" data-id="' + p.id + '">回滚</button></div>').join('') + '</div></section>' +
          '</aside>' +
        '</div>';
    },
    actions: {
      publish() { App.openPublish(''); },
      configFile() { App.configDialog(); },
      discard() {
        UI.confirm({ title: '丢弃全部未发布变更？', desc: '本地改动将回到上次发布的状态。', danger: true, okText: '丢弃' })
          .then((ok) => { if (!ok) return; Store.discard(); UI.toast('已丢弃'); App.refresh(); });
      },
      revertOne(d) { UI.toast('已撤回：' + d.id); },
      rollback(d) {
        const p = Store.db.publishes.find((x) => x.id === d.id);
        UI.confirm({ title: '回滚到「' + (p ? p.title : '该版本') + '」？', desc: '将恢复该次发布后的配置快照，并生成一条新的回滚记录。', okText: '回滚' })
          .then((ok) => { if (!ok) return; if (Store.rollback && Store.rollback(d.id)) { UI.toast('已回滚'); App.refresh(); } else UI.toast('该版本没有可用快照', 'warn'); });
      }
    }
  };

  window.V5 = { COVERAGE, CH_PAGES, impactOf, gatesFor, ensure, APP, TONE, spark, ring };
})();
