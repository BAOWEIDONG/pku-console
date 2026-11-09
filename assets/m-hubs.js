/* ============================================================================
   工作台聚合页：把同一业务对象的多个子页收进一个入口
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};

  const HUBS = {
    'hub-customer': {
      title: '客户中心', sub: '客户档案、360 视图、企业权益与账号，统一从一处进入', eyebrow: 'CUSTOMER / HUB', grp: 'v.ops',
      groups: [
        { name: '客户档案', items: [
          { id: 'crm-hub', label: '客户总览', desc: '来源、生命周期与今日服务待办', icon: 'users' },
          { id: 'crm-customer', label: '全渠道客户', desc: '按来源、阶段、负责人筛选并导出', icon: 'user' },
          { id: 'crm-360', label: '客户 360', desc: '服务、健康、权益、订单与全部时间线', icon: 'activity' }
        ] },
        { name: '企业与账号', items: [
          { id: 'e-orgs', label: '企业客户与权益', desc: '企业、人数、权益包与服务范围', icon: 'building' },
          { id: 'g-accounts', label: '客户账号', desc: '三端账号、登录状态与身份绑定', icon: 'lock' }
        ] }
      ]
    },
    'hub-customer-trade': {
      title: '交易与履约', sub: '订单、预约、履约、时段与产能，按一条服务链路收口', eyebrow: 'CUSTOMER / TRADE', grp: 'v.ops',
      groups: [
        { name: '交易', items: [
          { id: 'trd-orders', label: '订单中心', desc: '服务订单、支付、退款与状态流转', icon: 'file' },
          { id: 'v-claims', label: '领奖订单', desc: '营期奖励领取、发货与物流', icon: 'gift' },
          { id: 'v-exchanges', label: '积分兑换', desc: '积分商城兑换与履约状态', icon: 'package' }
        ] },
        { name: '预约与履约', items: [
          { id: 'v-fulfill', label: '履约工作台', desc: '待确认、已预约、履约中与已完成', icon: 'truck' },
          { id: 'e-bookings', label: '预约订单', desc: '职工端预约确认与改期', icon: 'calendar' },
          { id: 'trd-sla', label: '超时与升级', desc: 'SLA 超时、升级与责任人', icon: 'clock' }
        ] },
        { name: '资源排期', items: [
          { id: 'trd-slots', label: '时段与占号', desc: '可约时段、占号与释放', icon: 'calendar' },
          { id: 'trd-capacity', label: '排班与产能', desc: '医生、机构与服务产能', icon: 'users' }
        ] }
      ]
    },
    'hub-customer-settle': {
      title: '结算中心', sub: '对账、差异、退款与开票，不再是四个孤立菜单', eyebrow: 'CUSTOMER / SETTLE', grp: 'v.ops',
      groups: [
        { name: '结算闭环', items: [
          { id: 'trd-settle', label: '结算与对账', desc: '账期、金额、机构与平台对账', icon: 'chart' },
          { id: 'trd-diff', label: '结算差异', desc: '差异原因、责任方与处理进度', icon: 'x' },
          { id: 'trd-refund', label: '退款与冲销', desc: '退款、冲销与财务凭证', icon: 'undo' },
          { id: 'trd-invoice', label: '开票与回款', desc: '开票申请、回款与逾期', icon: 'file' }
        ] }
      ]
    },
    'hub-catalog': {
      title: '服务与商品', sub: '服务 SPU、实物商品、服务 360 与库存，统一商品化视角', eyebrow: 'CATALOG / HUB', grp: 'e.services',
      groups: [
        { name: '商品目录', items: [
          { id: 'svc-catalog', label: '服务目录', desc: '服务、价格、状态与投放端', icon: 'package' },
          { id: 'svc-goods', label: '实物商品', desc: '主图、图文详情、SKU 与售后', icon: 'gift' },
          { id: 'svc-360', label: '服务 360', desc: '素材、定价、规则、机构与结算', icon: 'stethoscope' },
          { id: 'trd-stock', label: '库存与预留', desc: '库存、占用、释放与预警', icon: 'layers' }
        ] }
      ]
    },
    'hub-catalog-fulfill': {
      title: '价格与履约', sub: '定价、服务包、可约机构与预约规则，统一配置', eyebrow: 'CATALOG / PRICING', grp: 'e.services',
      groups: [
        { name: '价格与组合', items: [
          { id: 'svc-pricing', label: '价格与政策', desc: '标准价、协议价与结算价', icon: 'target' },
          { id: 'svc-bundles', label: '服务包与组合', desc: '企业套餐、权益包与组合销售', icon: 'layers' }
        ] },
        { name: '履约能力', items: [
          { id: 'e-services', label: '职工端服务', desc: '职工端可见服务与详情配置', icon: 'stethoscope' },
          { id: 'g-orgs', label: '服务机构', desc: '院区、科室、地址与可约范围', icon: 'hospital' },
          { id: 'e-booking', label: '预约设置', desc: '可约时段、取消规则与提醒', icon: 'calendar' }
        ] }
      ]
    },
    'hub-health': {
      title: '健康管理', sub: '档案、风险、计划、随访、干预与结果，沿一条健管链路推进', eyebrow: 'HEALTH / HUB', grp: 'v.ops',
      groups: [
        { name: '建档与分层', items: [
          { id: 'h-profiles', label: '健康档案', desc: '指标、体检异常与风险标签', icon: 'user' },
          { id: 'h-risk', label: '风险与缺口', desc: '高风险、关怀缺口与升级规则', icon: 'shield' }
        ] },
        { name: '计划与随访', items: [
          { id: 'h-plans', label: '管理计划', desc: '模板、里程碑、依从性与复盘', icon: 'target' },
          { id: 'h-followups', label: '随访工作台', desc: '逾期、今日、本周与完成', icon: 'clock' },
          { id: 'h-programs', label: '干预项目', desc: '五高一重、睡眠、体重与心理', icon: 'layers' }
        ] },
        { name: '结果与证明', items: [
          { id: 'h-outcomes', label: '结果评估', desc: '基线、当前、目标与改善率', icon: 'chart' }
        ] }
      ]
    },
    'hub-fivegood': {
      title: '五好生活', sub: '内容、会员、任务、审核、信号与配置，统一到五好运营台', eyebrow: 'PROGRAM / FIVE-GOOD', grp: 'v.ops',
      groups: [
        { name: '总览', items: [
          { id: 'fg-overview', label: '五好总览', desc: '五维分数、会员阶段与运营闭环', icon: 'spark' }
        ] },
        { name: '五维内容', items: [
          { id: 'fg-eat', label: '吃好 · 食谱', desc: '食谱、餐次与营养内容', icon: 'package' },
          { id: 'fg-sleep', label: '睡好 · 睡眠', desc: '睡眠任务、量表与改善建议', icon: 'moon' },
          { id: 'fg-move', label: '动好 · 运动', desc: '运动任务、打卡与教练反馈', icon: 'run' },
          { id: 'fg-mind', label: '心好 · 心理', desc: '心理量表、EAP 与关怀边界', icon: 'heart' },
          { id: 'fg-check', label: '查好 · 体检', desc: '体检任务、报告解读与复查', icon: 'stethoscope' }
        ] },
        { name: '内容与转化', items: [
          { id: 'fg-version', label: '食谱版本', desc: '版本、生效范围与回滚', icon: 'layers' },
          { id: 'fg-convert', label: '食谱转化', desc: '浏览、采纳与执行率', icon: 'chart' },
          { id: 'fg-ab', label: 'A/B 实验', desc: '内容实验、分组与结果', icon: 'activity' },
          { id: 'fg-survey', label: '评估问卷', desc: '入组评估、量表与基线', icon: 'file' },
          { id: 'fg-report', label: '月度报告', desc: '个人月报与反馈记录', icon: 'send' }
        ] },
        { name: '会员运营', items: [
          { id: 'fg-members', label: '会员运营', desc: '分数、任务、风险与下一步', icon: 'users' },
          { id: 'fg-tasks', label: '任务与发布', desc: '周任务、发布与回访清单', icon: 'check' },
          { id: 'fg-coach', label: '打卡审核', desc: '证据、通过与驳回', icon: 'message' },
          { id: 'fg-escalation', label: '信号与升级', desc: '低分、低活跃与风险转健管', icon: 'activity' },
          { id: 'fg-loop', label: '运营闭环', desc: '评估、入组、任务、报告与续约', icon: 'refresh' },
          { id: 'fg-privacy', label: '授权与隐私', desc: '数据边界、签署与访问审计', icon: 'lock' }
        ] },
        { name: '配置', items: [
          { id: 'fg-config', label: '评分与权重', desc: '五维评分、权重与等级', icon: 'sliders' },
          { id: 'fg-reco', label: '推荐规则', desc: '按分数、风险与阶段推荐', icon: 'target' },
          { id: 'fg-meal', label: '餐次配置', desc: '餐次、时段与食谱模板', icon: 'clock' }
        ] }
      ]
    },
    'hub-camp': {
      title: '减重营', sub: '营期、学员、打卡、批注、出勤与内容通知，一条营期链路', eyebrow: 'PROGRAM / CAMP', grp: 'v.ops',
      groups: [
        { name: '营期与学员', items: [
          { id: 'v-dashboard', label: '运营概览', desc: '在营人数、打卡与风险', icon: 'grid' },
          { id: 'v-camps', label: '营期管理', desc: '排期、容量、责任营养师', icon: 'calendar' },
          { id: 'v-students', label: '学员管理', desc: '学员档案、体重与完成度', icon: 'users' }
        ] },
        { name: '打卡与教练', items: [
          { id: 'v-records', label: '打卡记录', desc: '饮食、运动、体重与批注', icon: 'check' },
          { id: 'v-annotations', label: '批注工作台', desc: '待批注、超时与教练反馈', icon: 'message' },
          { id: 'v-attendance', label: '出勤看板', desc: '到课、缺勤与连续打卡', icon: 'layout' }
        ] },
        { name: '内容与通知', items: [
          { id: 'v-content', label: '活动与课程', desc: '课程、活动与营期内容', icon: 'video' },
          { id: 'v-messages', label: '消息与公告', desc: '营期公告与学员消息', icon: 'bell' }
        ] }
      ]
    },
    'hub-program-rules': {
      title: '规则与激励', sub: '打卡、积分、奖励、徽章、商城与账号入口，统一规则层', eyebrow: 'PROGRAM / RULES', grp: 'v.rules',
      groups: [
        { name: '规则', items: [
          { id: 'v-rules', label: '打卡规则', desc: '打卡时间、有效性与补卡', icon: 'sliders' },
          { id: 'v-points-rules', label: '积分规则', desc: '积分获取、消耗与上限', icon: 'target' },
          { id: 'v-metrics', label: '健康指标库', desc: '指标、单位、阈值与展示', icon: 'activity' },
          { id: 'v-questionnaire', label: '入营问卷', desc: '入营评估、量表与必填项', icon: 'file' }
        ] },
        { name: '激励', items: [
          { id: 'v-tiers', label: '连续打卡奖励', desc: '档位、奖励与领取条件', icon: 'gift' },
          { id: 'v-products', label: '积分商城', desc: '商品、库存、兑换与履约', icon: 'package' },
          { id: 'v-badges', label: '徽章体系', desc: '徽章、达成条件与展示', icon: 'medal' },
          { id: 'v-ranking', label: '排行榜', desc: '榜单口径、周期与展示', icon: 'star' }
        ] },
        { name: '账号与入口', items: [
          { id: 'v-accounts', label: '账号管理', desc: '学员账号、绑定与状态', icon: 'users' },
          { id: 'v-activities', label: '活动与入口', desc: '活动页、入口与投放', icon: 'spark' }
        ] }
      ]
    },
    'hub-program-report': {
      title: '报告与复盘', sub: '营期统计、结营报告、企业报告与督导总览，统一结果口径', eyebrow: 'PROGRAM / REPORT', grp: 'v.report',
      groups: [
        { name: '结果报告', items: [
          { id: 'v-stats', label: '营期统计', desc: '入营、打卡、减重与完成率', icon: 'chart' },
          { id: 'v-report', label: '结营报告', desc: '个人结果、证书与下一期建议', icon: 'file' },
          { id: 'v-enterprise', label: '企业健康报告', desc: '部门风险、参与率与投入建议', icon: 'building' },
          { id: 'v-supervisor', label: '督导总览', desc: '多营期、多团队与责任追踪', icon: 'eye' }
        ] }
      ]
    },
    'hub-content-brand': {
      title: '品牌站内容', sub: '首页、轮播、分院、学科、师资与品牌页，一个内容入口', eyebrow: 'CONTENT / BRAND', grp: 'b.content',
      groups: [
        { name: '首页与入口', items: [
          { id: 'b-home', label: '首页内容', desc: '首屏文案、服务入口与精选专家', icon: 'layout' },
          { id: 'content-banners', label: '轮播与开屏', desc: '图片、标题、跳转与投放时间', icon: 'image' }
        ] },
        { name: '站点内容', items: [
          { id: 'b-hospitals', label: '分院网络', desc: '院区、地址、电话与服务', icon: 'hospital' },
          { id: 'b-departments', label: '学科与科室', desc: '学科介绍、科室与专家关联', icon: 'layers' },
          { id: 'b-team', label: '师资团队', desc: '专家资料、擅长与出诊', icon: 'stethoscope' },
          { id: 'b-camp', label: '健康营展示页', desc: '营期介绍、图片与报名入口', icon: 'spark' },
          { id: 'b-about', label: '品牌页', desc: '品牌介绍、联系方式与资质', icon: 'file' },
          { id: 'b-site', label: '站点设置', desc: '品牌站主题、导航与入口', icon: 'settings' }
        ] }
      ]
    },
    'hub-content-employee': {
      title: '职工端内容', sub: '站点、模块、科普与问答，统一职工健康 H5 的配置', eyebrow: 'CONTENT / EMPLOYEE', grp: 'e.content',
      groups: [
        { name: '站点与模块', items: [
          { id: 'e-site', label: '站点设置', desc: '职工端主题、导航与入口', icon: 'sliders' },
          { id: 'e-modules', label: '模块与分类', desc: '首页模块、服务分类与顺序', icon: 'grid' }
        ] },
        { name: '内容与问答', items: [
          { id: 'e-content', label: '内容与科普', desc: '文章、视频、封面与上下线', icon: 'video' },
          { id: 'e-qa', label: '深度问答', desc: '标准回复、图文补充与未命中问题', icon: 'message' }
        ] }
      ]
    },
    'hub-content-assets': {
      title: '内容与素材', sub: '内容中心、图片素材、共享资产、品牌与主题，一次上传多处复用', eyebrow: 'CONTENT / ASSETS', grp: 'shared.content',
      groups: [
        { name: '内容', items: [
          { id: 'g-content', label: '内容中心', desc: '文章、视频、封面与投放位置', icon: 'file' },
          { id: 'media-lib', label: '图片素材库', desc: '商品图、横幅、封面与复用关系', icon: 'image' }
        ] },
        { name: '公共资产', items: [
          { id: 'lib-assets', label: '共享资产库', desc: '图片、视频、文档、FAQ 与话术', icon: 'link' }
        ] },
        { name: '品牌与主题', items: [
          { id: 'g-brand', label: '品牌与主体', desc: '品牌名、Logo、联系方式与资质', icon: 'spark' },
          { id: 'g-theme', label: '主题与入口', desc: '主题色、字体、入口与渠道页', icon: 'sliders' }
        ] }
      ]
    },
    'hub-platform-commons': {
      title: '公共模块', sub: '资产、权益、规则、模板、关系图谱与关联缺口，全平台共用一套底座', eyebrow: 'PLATFORM / COMMONS', grp: 'shared.content',
      groups: [
        { name: '共享对象', items: [
          { id: 'lib-assets', label: '共享资产库', desc: '图片、视频、文档、FAQ 与话术', icon: 'image' },
          { id: 'lib-benefits', label: '权益与券', desc: '额度、有效期、发放与核销', icon: 'gift' },
          { id: 'lib-rules', label: '规则模板', desc: '预约、取消、积分、评分与奖励', icon: 'sliders' },
          { id: 'lib-templates', label: '项目模板', desc: '营期、五好、体检季与高客方案', icon: 'copy' }
        ] },
        { name: '关系治理', items: [
          { id: 'g-graph', label: '关系图谱', desc: '渠道、页面、服务、权益与客户关系', icon: 'layers' },
          { id: 'g-gaps', label: '关联缺口', desc: '自动扫描缺失关系并补全', icon: 'target' }
        ] }
      ]
    },
    'hub-command-insight': {
      title: '经营洞察', sub: '经营数据、前端覆盖、模块深度与报表口径，集中在一个决策入口', eyebrow: 'COMMAND / INSIGHT', grp: 'v.report',
      groups: [
        { name: '经营与复盘', items: [
          { id: 'g-insights', label: '经营洞察', desc: '交易、服务、履约与健康结果', icon: 'chart' },
          { id: 'g-depth', label: '模块复盘', desc: '各工作区的深度、复用与下一步', icon: 'layers' }
        ] },
        { name: '覆盖与口径', items: [
          { id: 'g-coverage', label: '前端功能地图', desc: '三个 H5 功能 ↔ 后台入口', icon: 'target' },
          { id: 'rpt-report', label: '报表与口径', desc: '指标定义、数据源与标准报表', icon: 'file' }
        ] }
      ]
    },
    'hub-platform-access': {
      title: '权限与设置', sub: '角色、字段级权限、系统参数与审计边界，统一在一个治理入口', eyebrow: 'PLATFORM / ACCESS', grp: 'roles',
      groups: [
        { name: '权限治理', items: [
          { id: 'g-roles', label: '角色与权限', desc: '角色、菜单权限与发布权限', icon: 'lock' },
          { id: 'g-fields', label: '字段级权限', desc: '敏感字段的可见、可编与导出', icon: 'eye' }
        ] },
        { name: '系统设置', items: [
          { id: 's-settings', label: '系统设置', desc: '品牌、通知、数据与安全参数', icon: 'settings' }
        ] }
      ]
    }
  };

  function hubBody(def) {
    const groups = def.groups.map((g) =>
      '<section class="hub-group"><div class="hub-group-h"><h3>' + E(g.name) + '</h3><span>' + g.items.length + ' 个入口</span></div>' +
      '<div class="hub-grid">' + g.items.map((it) =>
        '<button class="hub-card" data-act="go" data-id="' + E(it.id) + '">' +
          '<span class="hub-ic">' + I(it.icon, 18) + '</span>' +
          '<span class="hub-card-b"><b>' + E(it.label) + '</b><span>' + E(it.desc) + '</span></span>' +
          '<span class="hub-card-go">进入 ' + I('chevron', 12) + '</span>' +
        '</button>').join('') + '</div></section>').join('');
    const total = def.groups.reduce((n, g) => n + g.items.length, 0);
    return '<div class="hub-intro"><div><b>' + total + ' 个功能页，1 个工作台入口</b>' +
      '<span>左侧菜单不再逐页堆叠；进入后按业务分组找到具体配置页，减少层级和来回切换。</span></div>' +
      '<div class="hub-intro-meta"><span>' + def.groups.length + ' 个分组</span><span>' + total + ' 个功能页</span><span>统一权限与发布</span></div></div>' +
      groups;
  }

  Object.keys(HUBS).forEach((id) => {
    const def = HUBS[id];
    P[id] = {
      app: 'all', grp: def.grp, title: def.title, sub: def.sub, state: {},
      render() {
        return K.head(def.title, def.sub, '', def.eyebrow) + hubBody(def);
      },
      actions: {}
    };
  });
})();
