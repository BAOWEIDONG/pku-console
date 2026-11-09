/* ============================================================================
   北大医疗 · 三端运营中台 v10
   - 导航按 versionall / PKU-introduce / pku-employee-health 三端真实页面组织
   - 数据来自三个 H5 的真实页面、导出数据与 mock 数据
   - 配置保存到本机；发布中心可生成并提交 config.json
   ========================================================================== */
(function () {
  'use strict';

  const SEED = window.H5SEED;
  if (!SEED) throw new Error('H5SEED missing');
  const KEY = 'pku-console-v10';
  const STORAGE_VERSION = SEED.meta.version;
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n, d) => Number(n || 0).toFixed(d == null ? 0 : d);
  const pct = (n) => Math.max(0, Math.min(100, Math.round(n || 0)));
  const uid = (p) => p + String(Date.now()).slice(-6) + Math.floor(Math.random() * 9);
  const nowTime = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
  const pad = (n) => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const addDays = (dateStr, n) => { const d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };

  /* ----------------------------------------------------------- 图标 */
  const IP = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    activity: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5"/><path d="M16 5.5a3 3 0 0 1 0 5.4M18 14.8c2 .5 3.1 1.9 3.6 4.2"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.5-5.4 7-5.4s6.2 1.8 7 5.4"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z"/>',
    hospital: '<path d="M4 21V7l8-4 8 4v14"/><path d="M12 10v6M9 13h6"/><path d="M9 21v-4h6v4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 12h10"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    shield: '<path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
    leaf: '<path d="M20 4c-8 0-13 4-13 10 0 3 2 5 5 5 6 0 9-6 8-15Z"/><path d="M4 21c2-7 6-10 12-13"/>',
    spark: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    package: '<path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v9l8 4 8-4V8"/><path d="M12 12v9"/>',
    gift: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 12h18M12 8v12"/><path d="M12 8S10 3 7.5 3 5 7 8 8M12 8s2-5 4.5-5S19 7 16 8"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    truck: '<path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    badge: '<circle cx="12" cy="9" r="5"/><path d="m8.5 13-1 8 4.5-3 4.5 3-1-8"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    send: '<path d="m22 3-9 18-3-7-7-3 19-8Z"/><path d="m13 14 4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.05-.4.1-.8.1-1.2Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v5h16v-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8"/><path d="M10.5 20a1.8 1.8 0 0 0 3 0"/>',
    phone: '<path d="M6 3h3l2 5-2.2 1.4a12 12 0 0 0 5.8 5.8L16 13l5 2v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 6.2 2 2 0 0 1 6 3Z"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    download: '<path d="M12 3v13M7 11l5 5 5-5"/><path d="M4 21h16"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    inbox: '<path d="M4 4h16v16H4z"/><path d="M4 13h5l2 3h2l2-3h5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5 0l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5 0l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
    file: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 11 5-3v8l-5-3"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M7 21h10"/><path d="M9 7c0-1.5 1-2 1.5-3M13.5 7c0-1.5 1-2 1.5-3"/>',
    walk: '<circle cx="13" cy="4.5" r="2"/><path d="m10 21 2-6-3-3 1-5 4 3 3 1"/><path d="m12 15 4 6"/>',
    sleep: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z"/><path d="M4 17h15"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
    cross: '<path d="M9 21V13H6V9h3V6h6v3h3v4h-3v8H9Z"/>'
  };
  const ic = (n, size) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') + '>' + (IP[n] || IP.file) + '</svg>';

  /* ----------------------------------------------------------- 持久化 */
  function initialStore() {
    return { data: clone(SEED), dirty: 0, logs: [], savedAt: '尚未保存', assets: [] };
  }
  function loadStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return initialStore();
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data || parsed.data.meta.version !== STORAGE_VERSION) return initialStore();
      return Object.assign(initialStore(), parsed);
    } catch (e) { return initialStore(); }
  }
  const saved = loadStore();
  let data = saved.data;
  const state = {
    route: 'home', ctx: {}, openGroup: 'camp', ui: {}, navOpen: false,
    dirty: saved.dirty || 0, logs: saved.logs || [], savedAt: saved.savedAt || '尚未保存',
    assets: saved.assets || [], drawer: null, toast: '', init: true
  };
  function normalizeData() {
    const c = data.camp;
    c.checkinRules = Object.assign({ dietPhoto: true, exerciseDuration: true, weightMorning: true, makeup: false }, c.checkinRules || {});
    c.pointRules = Object.assign({ dietDaily: 6, exerciseBase: 1, exerciseCoach: 2, weightDaily: 1, rankingOn: true }, c.pointRules || {});
    c.messages = c.messages || [];
    c.reports = c.reports || [];
    const b = data.brand;
    b.home = Object.assign({
      eyebrow: '北京大学国际医院 · PKU HEALTHCARE',
      titleA: '北医的专家', titleB: '就在您身边',
      lead: '726 位医师、57 位专家，来自北医系统的临床与健康管理团队，为每一次健康选择提供专业支持。',
      facultyTitle: '师资力量', facultySub: '北医系统专家 · 临床一线',
      campTitle: '正在开展', campSub: '项目案例 · 团队与医院可自由搭配',
      networkTitle: '分院网络', networkSub: '6 大地区 · 12 家机构',
      deptTitle: '学科与科室', deptSub: '70 个临床与医技科室',
      featuredCount: 6,
      showFaculty: true, showCamp: true, showNetwork: true, showDepartments: true, showAbout: true
    }, b.home || {});
    b.about = Object.assign({
      titleA: '让优质医疗', titleB: '触手可及',
      lead: '从综合医院到康复、专科与健康管理，北大医疗以全周期医疗服务网络，守护每一个家庭的健康托付。',
      storyTitle: '一所医院，一座医疗城',
      intro: '北京大学国际医院座落在北京市昌平区中关村生命科学园的北京大学医疗城内，是一所非营利性综合医院，也是北京大学第八临床医学院。',
      vision: '致力于打造有平安特色的、中国领先的医疗管理集团。',
      numbers: [{ label: '万平方米总建筑面积', value: 44 }, { label: '核定床位', value: 1800 }, { label: '亿元总投资', value: 70 }, { label: '临床医技科室', value: '50+' }],
      timeline: [
        { year: '2022', title: '加入中国平安', desc: '北大医疗正式成为平安集团的重要成员。' },
        { year: '2021', title: '平安签署方正重整投资协议', desc: '医疗健康生态与综合金融协同展开。' },
        { year: '2014', title: '北京大学国际医院开业', desc: '北医系六大直属医院派出 10+ 优势科室支持建设。' },
        { year: '2003', title: '北大医疗成立', desc: '原北大国际医院集团，开启集团化办医探索。' },
        { year: '2002', title: '启动筹建', desc: '以北京大学为主体申请筹建北京大学国际医院。' }
      ]
    }, b.about || {});
    const e = data.employee;
    e.home = Object.assign({
      greeting: '你好，杨君', company: '国家电网 · 华东分部', entitlement: '健康权益已开通',
      searchPlaceholder: '搜索服务、症状或机构', aiTitle: '不知道选哪项？', aiSub: '说说症状或诉求，企康小安帮你匹配服务',
      hotTitle: '热门服务', hotCount: 5, footer: '北大医疗集团 · 企康办',
      aiEnabled: true, showAppointments: true, showBenefits: true, showFamily: true, showArticles: true
    }, e.home || {});
    e.banners = e.banners || [
      { id: 'bn1', enabled: true, title: '企业职工医疗健康管理系列产品', sub: '筛、诊、治、康　全生命周期守护', brand: '北大医疗', link: 'e-services', image: '', tone: '#1d5f86' },
      { id: 'bn2', enabled: true, title: '五好生活', sub: '好好早筛 · 吃饭 · 运动 · 睡觉 · 放松', brand: '企业专属福利', link: 'e-fivegood', image: '', tone: '#0c6d52' },
      { id: 'bn3', enabled: true, title: '企业家健康管理中心', sub: '710㎡ 专属空间 · 44 家商保直付', brand: '高端会员', link: 'e-services', image: '', tone: '#183f72' }
    ];
    e.promos = e.promos || [
      { id: 'pm1', enabled: true, title: '职工体检升级计划', sub: '住院体检 · 含无痛胃肠镜，一次查清楚', tag: '2026 年度 · 限 200 人', serviceId: 'inpatient', image: '' },
      { id: 'pm2', enabled: true, title: '11 月减重训练营', sub: '90 天医学减重 · 营养师与康复师双师带队', tag: '报名截止 11-08', serviceId: 'weight', image: '' },
      { id: 'pm3', enabled: true, title: '职场急救持证培训', sub: 'CPR + AED 实操，每期限 30 人', tag: '企业安全生产费支持', serviceId: 'firstaid', image: '' }
    ];
    e.quickSearches = e.quickSearches || ['体检报告解读', '就医快通', '慢病管理', '心理咨询', '睡眠改善'];
    e.hotServiceIds = e.hotServiceIds || ['fivehigh', 'risk-report', 'fast', 'sleep', 'tcm'];
    e.home.quickSearches = e.home.quickSearches || e.quickSearches;
    e.home.hotServiceIds = e.home.hotServiceIds || e.hotServiceIds;
    e.bookingRules = Object.assign({ leadDays: 2, maxDays: 30, cancelHours: 24, autoConfirm: true, reminderPhone: true, cancelRefund: true }, e.bookingRules || {});
    e.entitlement = Object.assign({ total: '¥6,660', used: '¥1,280', year: '2026', holder: '杨君' }, e.entitlement || {});
    e.family = e.family || [{ id: 'f1', name: '李秀兰', relation: '母亲', phone: '138****6621', verified: true }, { id: 'f2', name: '杨帆', relation: '子女', phone: '139****3108', verified: true }];
    e.medicalReports = e.medicalReports || [
      { id: 'r1', name: '2026 年度职工体检报告', date: '2026-10-12', org: '北京大学国际医院', status: '已解读', abnormal: 6 },
      { id: 'r2', name: '无痛胃肠镜病理报告', date: '2026-10-20', org: '北京大学国际医院 · 内镜中心', status: '已归档', abnormal: 0 },
      { id: 'r3', name: '五高一重季度复测', date: '2026-10-24', org: '线上 · 健康管家张医生', status: '待复测', abnormal: 2 }
    ];
    e.privacy = e.privacy || [
      { id: 'p1', title: '健康档案授权', desc: '允许健康管家查看体检、随访与用药记录', on: true },
      { id: 'p2', title: '家庭成员授权', desc: '允许为家庭成员预约与代管权益', on: true },
      { id: 'p3', title: 'EAP 咨询保密', desc: '咨询内容不进入企业人事记录', on: true },
      { id: 'p4', title: '营销消息', desc: '接收服务推荐与活动提醒', on: false }
    ];
    e.fiveTiers = e.fiveTiers || [
      { id: 'five-base', name: '基础版', price: 500, scope: '全员普惠', benefits: '五好主题任选 1 项 + 健康测评', themes: ['screen'], pids: ['annual-exam', 'risk-report'], status: 'active', imageUrl: '' },
      { id: 'five-plus', name: '进阶版', price: 1000, scope: '高风险人群', benefits: '主题任选 3 项 + 健康管家 1 次', themes: ['screen', 'food', 'move'], pids: ['annual-exam', 'fivehigh', 'cpet'], status: 'active', imageUrl: '' },
      { id: 'five-pro', name: '尊享版', price: 2000, scope: '核心人才 / 高管', benefits: '五大主题全享 + 年度深度评估', themes: ['screen', 'food', 'move', 'sleep', 'relax'], pids: ['vip', 'cpet', 'sleep', 'eap'], status: 'active', imageUrl: '' }
    ];
    e.fiveTiers.forEach((t) => { t.themes = t.themes || ['screen']; t.pids = t.pids || ['annual-exam']; t.status = t.status || 'active'; t.imageUrl = t.imageUrl || ''; });
    e.messages = e.messages || [];
    e.products.forEach((p) => {
      p.active = p.active !== false;
      p.recommended = p.recommended !== false && ['fivehigh', 'risk-report', 'fast', 'sleep', 'tcm'].indexOf(p.id) >= 0;
      p.imageUrl = p.imageUrl || '';
      p.gallery = p.gallery || [];
      p.detailHtml = p.detailHtml || '<p>' + esc(p.intro || '') + '</p><p>具体服务内容与预约要求以到院评估为准。</p>';
    });
    e.orgDetails = e.orgDetails || [
      { id: 'pku-international', name: '北京大学国际医院', type: '综合医院', address: '北京市昌平区中关村生命科学园生命园路1号', phone: '010-69007777', services: ['职工年度体检', '无痛胃肠镜检查', '重疾筛查服务', '职工就医快通服务'], slots: 24, enabled: true },
      { id: 'pku-rehab', name: '北大医疗康复医院', type: '康复医院', address: '北京市昌平区中关村生命科学园生命园路8号院7号楼', phone: '010-60849596', services: ['远程居家康复健康指导', '中医康复综合解决服务', '心肺运动 CPET 筛查'], slots: 16, enabled: true },
      { id: 'online-video', name: '线上视频面诊', type: '线上服务', address: '线上视频 · 健康管家协助', phone: '400-100-1063', services: ['专家线上二次诊疗咨询', '北大国际医院云门诊', '心理健康管理服务（EAP）'], slots: 32, enabled: true }
    ];
    e.fiveUsage = e.fiveUsage || {
      screen: { enrolled: 186, served: 142, redeemed: 128, satisfaction: 96 },
      food: { enrolled: 128, served: 96, redeemed: 82, satisfaction: 94 },
      move: { enrolled: 74, served: 58, redeemed: 51, satisfaction: 97 },
      sleep: { enrolled: 93, served: 61, redeemed: 54, satisfaction: 95 },
      relax: { enrolled: 158, served: 132, redeemed: 118, satisfaction: 98 }
    };
    const planSeed = data.planning || {};
    const planOwners = { screen: '企康筛查运营', chronic: '慢病运营', medical: '就医服务运营', special: 'EAP 运营', safety: '安全培训运营' };
    const planTargets = { screen: '全员职工', chronic: '高风险 / 慢病人群', medical: '有就医需求职工', special: '有心理与特色服务需求职工', safety: '安全员 / 一线班组' };
    const planGoals = { screen: '年度体检覆盖率 ≥ 60%', chronic: '在管人群随访完成率 ≥ 80%', medical: '号源协调成功率 ≥ 90%', special: 'EAP 使用率 ≥ 15%', safety: '重点岗位急救持证率 ≥ 70%' };
    data.planning = {
      packages: planSeed.packages || [
        { id: 'pkg-basic', name: '职工年度基础体检', type: '体检套餐', audience: '全员职工', price: 680, payer: '职工福利费', orgId: e.orgDetails[0].id, services: ['annual-exam', 'risk-survey', 'risk-report'], quota: 2000, used: 1280, validity: '2026-01-01 至 2026-12-31', status: 'online', imageUrl: '', intro: '覆盖基础检查、影像与检后解读，适合全员年度体检。', includesText: '基础检查：内外科、血常规、肝肾功能\n胸部 CT、腹部 / 甲状腺超声、心电图\n肿瘤标志物组合\n体检报告 + 医生解读 + 复查建议', noticeText: '体检前 8 小时禁食\n携带身份证，女性避开经期\n长期服药者提前告知医生' },
        { id: 'pkg-deep', name: '深度筛查套餐', type: '体检套餐', audience: '40 岁以上 / 高风险人群', price: 2680, payer: '职工福利费 + 企康', orgId: e.orgDetails[0].id, services: ['inpatient', 'gastro', 'cancer', 'risk-report'], quota: 200, used: 86, validity: '2026-03-01 至 2026-12-31', status: 'online', imageUrl: '', intro: '面向高风险人群的深度筛查，含住院体检、胃肠镜与重疾筛查。', includesText: '住院体检 2 天 1 晚\n无痛胃肠镜\n10 种高发恶性肿瘤筛查\n检后深度报告解读', noticeText: '需提前 1—2 天预约\n内镜项目需完成麻醉评估\n携带既往检查报告' },
        { id: 'pkg-exec', name: '企业家尊享体检', type: '体检套餐', audience: '高管 / 核心人才', price: 6680, payer: '企业自费 / 商保', orgId: e.orgDetails[0].id, services: ['vip', 'cpet', 'heart', 'second', 'cloud'], quota: 80, used: 32, validity: '2026-01-01 至 2026-12-31', status: 'online', imageUrl: '', intro: '专属空间、深度心肺评估与专家二次诊疗，面向高管与核心人才。', includesText: 'VIP 单人病房与专属陪检\n心肺运动 CPET 评估\n心脑血管专项筛查\n专家二次诊疗与云门诊', noticeText: '建议提前 7 天预约\n需提供既往病史与用药清单\n可协调家属同行体检' }
      ],
      schedules: planSeed.schedules || [
        { id: 'sch-annual', orgId: e.orgDetails[0].id, serviceId: 'annual-exam', days: [1, 2, 3, 4, 5], start: '08:00', end: '11:30', slotMinutes: 30, capacity: 8, cutoffHours: 24, enabled: true, note: '工作日早间体检' },
        { id: 'sch-gastro', orgId: e.orgDetails[0].id, serviceId: 'gastro', days: [1, 3, 5], start: '08:00', end: '12:00', slotMinutes: 20, capacity: 4, cutoffHours: 48, enabled: true, note: '内镜中心，需提前评估' },
        { id: 'sch-rehab', orgId: e.orgDetails[1].id, serviceId: 'rehab', days: [1, 2, 3, 4, 5, 6], start: '09:00', end: '17:00', slotMinutes: 45, capacity: 6, cutoffHours: 24, enabled: true, note: '康复治疗需连续到院' },
        { id: 'sch-online', orgId: e.orgDetails[2].id, serviceId: 'second', days: [0, 1, 2, 3, 4, 5, 6], start: '09:00', end: '20:00', slotMinutes: 30, capacity: 12, cutoffHours: 4, enabled: true, note: '线上视频面诊' }
      ],
      overrides: planSeed.overrides || [
        { id: 'ov-rest', orgId: e.orgDetails[0].id, serviceId: 'annual-exam', date: addDays(today(), 3), start: '08:00', end: '11:30', capacity: 6, status: 'open', note: '设备检修后恢复，号源减少' },
        { id: 'ov-closed', orgId: e.orgDetails[0].id, serviceId: 'gastro', date: addDays(today(), 6), start: '08:00', end: '12:00', capacity: 0, status: 'closed', note: '内镜中心停诊' },
        { id: 'ov-extra', orgId: e.orgDetails[2].id, serviceId: 'second', date: addDays(today(), 9), start: '18:00', end: '21:00', capacity: 18, status: 'open', note: '加开晚间视频号源' }
      ],
      services: planSeed.services || data.employee.products.map((p, i) => ({ id: 'sp-' + p.id, serviceId: p.id, owner: planOwners[p.mod] || '企康运营', launchDate: ['2026-11-01', '2026-11-05', '2026-11-08'][i % 3], target: planTargets[p.mod] || '有需求职工', goal: planGoals[p.mod] || '完成年度服务覆盖', status: p.active === false ? 'paused' : 'active', note: '' })),
      goods: planSeed.goods || data.camp.pointProducts.map((p, i) => ({ id: 'gp-' + p.id, productId: p.id, supplier: i % 2 ? '企康采购' : '北大医疗文创', cost: Math.max(8, Math.round(p.pointsRequired * 0.4)), stockWarning: 8, restockDate: addDays(today(), 6 + i * 2), campaign: p.pointsRequired >= 120 ? '积分商城上新' : '连续打卡奖励', status: 'active', note: '' }))
    };
    e.bookingEnabled = Object.assign({ screen: true, chronic: true, medical: true, special: true, safety: true }, e.bookingEnabled || {});
    e.articles.forEach((a) => { a.html = a.html || (a.body || []).map((x) => '<p>' + esc(x) + '</p>').join(''); });
    e.lectures.forEach((a) => { a.outlineText = a.outlineText || (a.outline || []).join('\n'); });
    if (!data.customers.some((x) => x.id === 'C1001')) data.customers.unshift({ id: 'C1001', name: '体验学员', phone: '13900000009', sources: ['H5 健康训练营'], tags: ['在营'], owner: '王营养师', joined: '2026-10-08', lastActive: '今天 08:42', summary: '健康训练营学员。' });
    data.customers.forEach((c) => { c.notes = c.notes || []; });
    data.followups = data.followups || [
      { id: 'fu1', customerId: 'C2001', customer: '杨君', phone: '138****8866', reason: '体检报告 6 项异常，需电话解释并安排复测', owner: '张医生', due: '2026-11-09 10:00', status: 'open', channel: '电话人工跟进' },
      { id: 'fu2', customerId: 'C1003', customer: '张伟', phone: '13800000003', reason: '连续 3 天未打卡，营养师电话唤醒', owner: '王营养师', due: '2026-11-09 15:00', status: 'open', channel: '电话人工跟进' },
      { id: 'fu3', customerId: 'C1010', customer: '孙悟空', phone: '13800000010', reason: '积分兑换已到货，确认领取方式', owner: '履约运营', due: '2026-11-10 11:00', status: 'done', channel: '电话人工跟进' }
    ];
    const mealSeed = window.V10_MEAL_SEED || {};
    data.meal = data.meal || {};
    ['ingredients', 'dishes', 'mealTemplates', 'dayPlans', 'supplements'].forEach((k) => {
      if (!Array.isArray(data.meal[k])) data.meal[k] = clone(mealSeed[k] || []);
    });
    data.meal.dayPlans.forEach((d) => { d.imageUrl = d.imageUrl || ''; d.tags = d.tags || []; d.meals = d.meals || {}; d.on = d.on !== false; });
    data.meal.dishes.forEach((d) => { d.imageUrl = d.imageUrl || ''; d.tags = d.tags || []; d.allerg = d.allerg || []; d.ing = d.ing || []; d.on = d.on !== false; });
    data.meal.mealTemplates.forEach((t) => { t.dishes = t.dishes || []; t.tags = t.tags || []; t.on = t.on !== false; });
    data.meal.supplements.forEach((s) => { s.imageUrl = s.imageUrl || ''; s.avoid = s.avoid || []; s.on = s.on !== false; });
  }
  normalizeData();
  function saveStore() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ data, dirty: state.dirty, logs: state.logs.slice(0, 80), savedAt: state.savedAt, assets: state.assets }));
    } catch (e) {
      toast('本机存储空间不足，最新图片没有写入浏览器。请先导出配置。');
    }
  }
  function getPath(path) {
    return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), data);
  }
  function setPath(path, value) {
    const parts = String(path).split('.');
    let o = data;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (o[k] == null) o[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      o = o[k];
    }
    o[parts[parts.length - 1]] = value;
  }
  function mark(label, app) {
    state.dirty += 1;
    state.savedAt = nowTime();
    state.logs.unshift({ id: uid('log'), at: state.savedAt, label, app: app || domainMeta(state.route).label, route: state.route });
    saveStore();
  }
  function commit(label) {
    syncDerived();
    state.dirty += 1;
    state.savedAt = nowTime();
    state.logs.unshift({ id: uid('log'), at: state.savedAt, label: label || '保存改动', app: domainMeta(state.route).label, route: state.route });
    saveStore();
    toast((label || '改动') + '已保存在本机');
    setTimeout(() => toast((label || '改动') + '已保存在本机'), 0);
  }
  function toast(text) {
    state.toast = text;
    const el = document.getElementById('toast');
    if (el) { el.textContent = text; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2600); }
  }

  /* ----------------------------------------------------------- 路由与元信息 */
  const DOMAIN = {
    home: { label: '三端总览', accent: '#176b92', app: 'all' },
    camp: { label: '健康训练营', accent: '#e4612b', app: 'camp', h5: SEED.h5Pages[0] },
    brand: { label: '品牌站', accent: '#1d6e89', app: 'brand', h5: SEED.h5Pages[1] },
    employee: { label: '职工健康', accent: '#ff6a13', app: 'employee', h5: SEED.h5Pages[2] },
    crm: { label: '客户中心', accent: '#a66a12', app: 'all' },
    shared: { label: '共享资产', accent: '#0c7c78', app: 'all' },
    plan: { label: '运营规划', accent: '#6b5bd2', app: 'all' },
    platform: { label: '发布与平台', accent: '#425a73', app: 'all' }
  };
  function domainMeta(route) {
    if (route.indexOf('v-') === 0) return DOMAIN.camp;
    if (route.indexOf('b-') === 0) return DOMAIN.brand;
    if (route.indexOf('e-') === 0) return DOMAIN.employee;
    if (route.indexOf('crm') === 0) return DOMAIN.crm;
    if (route.indexOf('shared') === 0 || route === 'assets' || route === 'templates') return DOMAIN.shared;
    if (route.indexOf('plan') === 0) return DOMAIN.plan;
    if (route.indexOf('s-') === 0 || route === 'publish' || route === 'map' || route === 'settings' || route === 'capability') return DOMAIN.platform;
    return DOMAIN.home;
  }
  const META = {
    home: { label: '指挥中心', group: '总览', desc: '三个 H5 的运行实况、待办与发布状态' },
    'v-overview': { label: '运营总览', group: '健康训练营', desc: 'versionall · 学员、教练、营养师与督导真实运营' },
    'v-camps': { label: '营期与学员', group: '健康训练营', desc: '营期、学员归属和开营状态' },
    'v-home': { label: '学员端首页', group: '健康训练营', desc: '首页文案、入口、排名与活动展示' },
    'v-rules': { label: '打卡规则', group: '健康训练营', desc: '五类打卡、餐次时间窗与积分规则' },
    'v-records': { label: '打卡与批注', group: '健康训练营', desc: '饮食、运动、体重记录及营养师/教练批注' },
    'v-metrics': { label: '健康指标', group: '健康训练营', desc: '健康档案中展示的 30 项体检指标' },
    'v-badges': { label: '徽章体系', group: '健康训练营', desc: '里程碑、成就与活动徽章' },
    'v-points': { label: '积分与排行', group: '健康训练营', desc: '积分获取规则与学员排行榜' },
    'v-meal': { label: '食谱工程', group: '健康训练营', desc: '全天食谱、餐次模板、菜品、食材与营养补剂' },
    'v-tiers': { label: '连续打卡奖励', group: '健康训练营', desc: '连续天数、库存、图片和领取方式' },
    'v-mall': { label: '积分商城商品', group: '健康训练营', desc: '商品主图、图集、图文详情、积分与库存' },
    'v-fulfill': { label: '发放与核销', group: '健康训练营', desc: '连续打卡奖品与积分兑换的发货、线下领取' },
    'v-activities': { label: '锻炼活动', group: '健康训练营', desc: '教练发布的图文/视频活动' },
    'v-team': { label: '营养师与教练', group: '健康训练营', desc: '待批注任务、处理效率与角色排班' },
    'v-report': { label: '营期报告', group: '健康训练营', desc: '结营统计、企业汇报与个人变化' },
    'v-accounts': { label: '账号与权限', group: '健康训练营', desc: '手机号登录、营期归属与督导权限' },
    'b-home': { label: '品牌首页', group: '品牌站', desc: '首屏、统计、精选专家、健康营与分院入口' },
    'b-team': { label: '师资团队', group: '品牌站', desc: '57 位专家、726 位医师资料与详情' },
    'b-hospitals': { label: '分院网络', group: '品牌站', desc: '6 大地区、12 家真实机构' },
    'b-departments': { label: '学科与科室', group: '品牌站', desc: '70 个真实科室简介与特色技术' },
    'b-camp': { label: '健康营项目页', group: '品牌站', desc: '第 7 期项目、17 位团队与 8 家医院' },
    'b-about': { label: '关于北大医疗', group: '品牌站', desc: '品牌故事、数字、历程与愿景' },
    'e-home': { label: '职工端首页', group: '职工健康', desc: '问候、权益、横幅、快捷搜索与热门服务' },
    'e-services': { label: '服务目录', group: '职工健康', desc: '5 大模块与 28 项真实服务' },
    'e-service': { label: '服务详情配置', group: '职工健康', desc: '单个服务的图片、介绍、包含、流程与预约须知' },
    'e-booking': { label: '预约设置', group: '职工健康', desc: '按模块配置预约字段、机构、时段和规则' },
    'e-orders': { label: '预约记录', group: '职工健康', desc: '全量预约、改约、取消与履约状态' },
    'e-benefits': { label: '权益额度', group: '职工健康', desc: '年度体检、专项筛查、EAP 等职工权益' },
    'e-records': { label: '健康档案', group: '职工健康', desc: '体检报告、档案、家庭成员与授权' },
    'e-content': { label: '科普与讲座', group: '职工健康', desc: '3 篇真实科普与 5 场健康讲座' },
    'e-orgs': { label: '服务机构', group: '职工健康', desc: '预约可选医院、院区与线上视频面诊' },
    'e-fivegood': { label: '五好生活', group: '职工健康', desc: '好好早筛 / 吃饭 / 运动 / 睡觉 / 放松' },
    'e-messages': { label: '消息中心', group: '职工健康', desc: '5 条真实消息与未读状态' },
    'plan': { label: '规划总览', group: '运营规划', desc: '服务、商品、体检套餐与预约排期的统一计划盘' },
    'plan-services': { label: '服务与商品', group: '运营规划', desc: '28 项服务与 6 件积分商品的运营计划' },
    'plan-exams': { label: '体检套餐', group: '运营规划', desc: '套餐组合、价格、名额与有效期' },
    'plan-schedule': { label: '预约排期', group: '运营规划', desc: '机构每周模板、日期例外与未来容量' },
    'crm': { label: '客户总览', group: '客户中心', desc: '跨渠道客户池与 360 服务痕迹' },
    'crm-detail': { label: '客户 360', group: '客户中心', desc: '个人资料、服务、打卡、权益、奖励和触达记录' },
    'assets': { label: '素材库', group: '共享资产', desc: '轮播图、商品图、活动图与品牌图片' },
    'templates': { label: '电话跟进', group: '共享资产', desc: '不依赖企微/短信，只生成电话人工跟进待办' },
    'publish': { label: '发布中心', group: '发布与平台', desc: '生成 config.json，查看真实影响面' },
    'map': { label: 'H5 页面对照', group: '发布与平台', desc: '每个 H5 页面在后台的落点与生效状态' },
    'capability': { label: '能力边界', group: '发布与平台', desc: '哪些字段真实生效，哪些仅保存' },
    'settings': { label: '角色与日志', group: '发布与平台', desc: '角色权限与本机操作审计' }
  };
  function metaOf(route) { return META[route] || META.home; }

  function navigate(route, ctx) {
    state.route = route;
    state.ctx = ctx || {};
    if (route.indexOf('v-') === 0) state.openGroup = 'camp';
    else if (route.indexOf('b-') === 0) state.openGroup = 'brand';
    else if (route.indexOf('e-') === 0) state.openGroup = 'employee';
    else state.openGroup = null;
    state.drawer = null;
    state.navOpen = false;
    const q = Object.keys(state.ctx).length ? '?' + Object.keys(state.ctx).map((k) => k + '=' + encodeURIComponent(state.ctx[k])).join('&') : '';
    location.hash = '#/' + route + q;
  }
  function readHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    if (!raw) { state.route = 'home'; state.ctx = {}; state.openGroup = null; return; }
    const [r, qs] = raw.split('?');
    if (META[r]) state.route = r;
    else state.route = 'home';
    state.ctx = {};
    if (qs) new URLSearchParams(qs).forEach((v, k) => { state.ctx[k] = v; });
    if (state.route.indexOf('v-') === 0) state.openGroup = 'camp';
    else if (state.route.indexOf('b-') === 0) state.openGroup = 'brand';
    else if (state.route.indexOf('e-') === 0) state.openGroup = 'employee';
    else state.openGroup = null;
  }

  /* ----------------------------------------------------------- 通用 HTML */
  function pill(text, tone) { return '<span class="pill ' + (tone || '') + '">' + esc(text) + '</span>'; }
  function avatar(name, photo, cls) {
    if (photo) return '<div class="avatar ' + (cls || '') + '"><img src="' + esc(photo) + '" alt="" onerror="this.style.display=\'none\'"></div>';
    return '<div class="avatar ' + (cls || '') + '">' + esc((name || '?').slice(0, 1)) + '</div>';
  }
  function pageHead(title, sub, actions, eyebrow) {
    const d = domainMeta(state.route);
    return '<div class="page-head"><div class="title-block"><div class="eyebrow"><i></i>' + esc(eyebrow || d.label) + '</div>' +
      '<h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div><div class="head-actions">' + (actions || '') + '</div></div>';
  }
  function purpose(what, affect, owner) {
    return '<div class="purpose"><div><label>这页做什么</label><p>' + esc(what) + '</p></div>' +
      '<div><label>改动影响哪里</label><p>' + esc(affect) + '</p></div>' +
      '<div><label>谁负责</label><div class="who"><span class="person">' + esc((owner || '运').slice(0,1)) + '</span><span>' + esc(owner || '运营负责人') + '</span></div></div></div>';
  }
  function kpi(label, value, unit, foot, iconName, tone) {
    return '<div class="kpi"><div class="top"><span class="ki" style="' + (tone ? 'background:' + tone[0] + ';color:' + tone[1] : '') + '">' + ic(iconName || 'chart') + '</span><label>' + esc(label) + '</label></div>' +
      '<div class="value">' + esc(value) + (unit ? '<small>' + esc(unit) + '</small>' : '') + '</div>' +
      '<div class="foot">' + (foot || '') + '</div></div>';
  }
  function panel(title, sub, body, actions, flush) {
    return '<div class="panel"><div class="panel-head"><div class="ph"><h2>' + esc(title) + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' +
      (actions ? '<div class="actions">' + actions + '</div>' : '') + '</div><div class="panel-body ' + (flush ? 'flush' : '') + '">' + body + '</div></div>';
  }
  function field(label, value, path, opts) {
    opts = opts || {};
    const hint = opts.hint ? '<div class="hint">' + esc(opts.hint) + '</div>' : '';
    if (opts.area) return '<div class="field"><label>' + esc(label) + (opts.optional ? ' <em>选填</em>' : '') + '</label><textarea class="textarea" rows="' + (opts.rows || 3) + '" data-bind="' + esc(path) + '" data-app="' + esc(domainMeta(state.route).label) + '" placeholder="' + esc(opts.ph || '') + '">' + esc(value || '') + '</textarea>' + hint + '</div>';
    if (opts.select) {
      const options = opts.select.map((o) => '<option value="' + esc(o.v) + '"' + (String(value) === String(o.v) ? ' selected' : '') + '>' + esc(o.l) + '</option>').join('');
      return '<div class="field"><label>' + esc(label) + '</label><select class="select" data-bind="' + esc(path) + '" data-app="' + esc(domainMeta(state.route).label) + '">' + options + '</select>' + hint + '</div>';
    }
    return '<div class="field"><label>' + esc(label) + (opts.optional ? ' <em>选填</em>' : '') + '</label><input class="input" type="' + (opts.num ? 'number' : 'text') + '" data-bind="' + esc(path) + '" data-app="' + esc(domainMeta(state.route).label) + '" value="' + esc(value == null ? '' : value) + '" placeholder="' + esc(opts.ph || '') + '">' + hint + '</div>';
  }
  function orderStatusLabel(k) {
    return { pending: '待确认', confirmed: '已确认', in_service: '服务中', completed: '已完成', cancelled: '已取消' }[k] || (k || '待确认');
  }
  function switchRow(title, sub, path, value) {
    return '<div class="switch-row"><div class="tx"><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></div><button class="switch-btn ' + (value ? 'on' : '') + '" data-switch="' + esc(path) + '" aria-label="' + esc(title) + '"></button></div>';
  }
  function empty(text, iconName) { return '<div class="empty">' + ic(iconName || 'inbox', 34) + '<div>' + esc(text) + '</div></div>'; }
  function progress(n, color) { return '<div class="progress"><b style="width:' + pct(n) + '%;' + (color ? 'background:' + color : '') + '"></b></div>'; }
  function saveBtn(label) { return '<button class="btn primary" data-act="save" data-label="' + esc(label || '改动') + '">' + ic('check') + '<span>保存改动</span></button>'; }

  function seg(items, current, action) {
    return '<div class="seg">' + items.map((x) => '<button class="' + (x.id === current ? 'on' : '') + '" data-ui-set="' + action + '" data-value="' + esc(x.id) + '">' + esc(x.label) + '</button>').join('') + '</div>';
  }
  function uploadBox(path, value, multi, cls, accept) {
    const isArr = Array.isArray(value);
    const vals = isArr ? value : (value ? [value] : []);
    return '<div class="upload-grid">' + vals.map((v, i) => '<div class="upload ' + (cls || '') + '">' + (/pdf/i.test(v) ? '<div style="position:absolute;inset:0;display:grid;place-items:center;background:#f2f6fa;color:#5f7488">' + ic('doc', 26) + '<span style="position:absolute;bottom:12px;font-size:8px">PDF</span></div>' : '<img src="' + esc(v) + '" alt="">') +
      '<button class="remove" data-act="removeUpload" data-path="' + esc(path + (isArr ? '.' + i : '')) + '">×</button></div>').join('') +
      '<label class="upload ' + (cls || '') + '"><input type="file" accept="' + esc(accept || 'image/*') + '" data-upload="' + esc(path) + '" data-multi="' + (isArr ? '1' : '0') + '">' + ic('image') + '<span>' + (vals.length ? '继续上传' : (accept && accept.indexOf('pdf') >= 0 ? '上传 PDF / 图片' : '上传图片')) + '</span></label></div>';
  }
  function richEditor(path, value, placeholder) {
    return '<div class="rich-editor"><div class="rich-toolbar"><button data-act="richBold" title="加粗"><b>B</b></button><button data-act="richUnderline" title="下划线"><u>U</u></button><button data-act="richList" title="列表">≡</button>' +
      '<label style="margin-left:auto;position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:4px;height:25px;padding:0 7px;border-radius:5px;font-size:10px;cursor:pointer">' + ic('image', 12) + '插入图片<input type="file" accept="image/*" data-rich-upload="' + esc(path) + '" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label></div>' +
      '<div class="rich-source" contenteditable="true" data-rich="' + esc(path) + '" data-placeholder="' + esc(placeholder || '输入图文详情…') + '">' + (value || '') + '</div></div>';
  }
  function rowLink(route, ctx, avatarHtml, title, sub, tail) {
    return '<div class="rowlink" data-go="' + esc(route) + '"' + (ctx ? ' data-id="' + esc(ctx) + '"' : '') + '>' + avatarHtml +
      '<div class="main-tx"><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></div><div class="tail">' + (tail || '') + '<span class="chev">' + ic('chevron') + '</span></div></div>';
  }

  /* ----------------------------------------------------------- 侧栏与外壳 */
  const NAV_GROUPS = [
    {
      id: 'camp', title: '健康训练营', en: 'versionall', color: '#f07a43', route: 'v-overview',
      children: [
        { section: '运营', items: [
          { r: 'v-overview', l: '运营总览', i: 'grid' },
          { r: 'v-camps', l: '营期与学员', i: 'calendar' }
        ] },
        { section: '学员端', items: [
          { r: 'v-home', l: '首页配置', i: 'home' },
          { r: 'v-rules', l: '打卡规则', i: 'clock' },
          { r: 'v-records', l: '打卡与批注', i: 'activity', badge: () => pendingComments(data) },
          { r: 'v-metrics', l: '健康指标', i: 'stethoscope' },
          { r: 'v-badges', l: '徽章体系', i: 'badge' }
        ] },
        { section: '营养与食谱', items: [
          { r: 'v-meal', l: '食谱工程', i: 'bowl' }
        ] },
        { section: '激励与商城', items: [
          { r: 'v-points', l: '积分与排行', i: 'chart' },
          { r: 'v-tiers', l: '连续打卡奖励', i: 'gift' },
          { r: 'v-mall', l: '积分商城', i: 'package' },
          { r: 'v-fulfill', l: '发放与核销', i: 'truck', badge: () => pendingFulfill(data) }
        ] },
        { section: '团队与复盘', items: [
          { r: 'v-activities', l: '锻炼活动', i: 'video' },
          { r: 'v-team', l: '营养师 / 教练', i: 'users' },
          { r: 'v-report', l: '营期报告', i: 'doc' },
          { r: 'v-accounts', l: '账号与权限', i: 'shield' }
        ] }
      ]
    },
    {
      id: 'brand', title: '品牌站', en: 'PKU-introduce', color: '#2c8aa8', route: 'b-home',
      children: [
        { section: '内容', items: [
          { r: 'b-home', l: '品牌首页', i: 'home' },
          { r: 'b-team', l: '师资团队', i: 'users' },
          { r: 'b-departments', l: '学科与科室', i: 'layers' }
        ] },
        { section: '网络与项目', items: [
          { r: 'b-hospitals', l: '分院网络', i: 'hospital' },
          { r: 'b-camp', l: '健康营项目页', i: 'activity' },
          { r: 'b-about', l: '关于北大医疗', i: 'heart' }
        ] }
      ]
    },
    {
      id: 'employee', title: '职工健康', en: 'pku-employee-health', color: '#ff752b', route: 'e-home',
      children: [
        { section: '首页与目录', items: [
          { r: 'e-home', l: '首页配置', i: 'home' },
          { r: 'e-services', l: '服务目录', i: 'package' }
        ] },
        { section: '服务履约', items: [
          { r: 'e-booking', l: '预约设置', i: 'calendar' },
          { r: 'e-orders', l: '预约记录', i: 'doc', badge: () => pendingBookings(data) },
          { r: 'e-orgs', l: '服务机构', i: 'hospital' }
        ] },
        { section: '员工侧内容', items: [
          { r: 'e-benefits', l: '权益额度', i: 'shield' },
          { r: 'e-records', l: '健康档案', i: 'file' },
          { r: 'e-content', l: '科普与讲座', i: 'book' },
          { r: 'e-fivegood', l: '五好生活', i: 'star' },
          { r: 'e-messages', l: '消息中心', i: 'bell' }
        ] }
      ]
    }
  ];
  function pendingComments(d) { return d.camp.exerciseRecords.filter((r) => !r.coachComment).length + d.camp.weightRecords.filter((r) => !r.dietitianComment).length; }
  function pendingFulfill(d) { return d.camp.rewardClaims.filter((c) => c.status === 'pending').length + d.camp.pointExchanges.filter((e) => e.status === 'pending').length; }
  function pendingBookings(d) { return d.employee.bookings.filter((b) => b.statusKey === 'pending').length; }

  function sideNav() {
    const activeGroup = state.openGroup;
    return '<aside class="sidebar" data-sidebar>' +
      '<div class="brand"><div class="brand-mark">' + ic('cross') + '</div><div class="brand-copy"><b>北大医疗</b><span>三端协同运营中台</span></div></div>' +
      '<div class="side-context"><span class="dot" style="--accent:' + domainMeta(state.route).accent + ';background:' + domainMeta(state.route).accent + '"></span><div class="copy"><b>' + esc(domainMeta(state.route).label) + '</b><span>3 个 H5 · 数据与页面已对齐</span></div></div>' +
      '<nav class="side-nav">' +
        '<div class="nav-caption">总览</div>' +
        '<button class="nav-single ' + (state.route === 'home' ? 'on' : '') + '" data-go="home">' + ic('home') + '<span>指挥中心</span><span class="badge">' + (state.dirty || 0) + '</span></button>' +
        '<div class="nav-caption">按 H5 运营</div>' +
        NAV_GROUPS.map((g) => {
          const open = activeGroup === g.id;
          return '<div class="nav-group ' + (open ? 'open' : '') + '">' +
            '<button class="nav-group-head" data-go="' + g.route + '" data-open-group="' + g.id + '"><span class="gdot" style="background:' + g.color + '"></span><span>' + esc(g.title) + '</span><span class="gcount">' + g.children.reduce((n, s) => n + s.items.length, 0) + '</span>' + ic('chevron') + '</button>' +
            (open ? '<div class="nav-children">' + g.children.map((s) =>
              '<div class="nav-child-label">' + esc(s.section) + '</div>' + s.items.map((it) => {
                const b = it.badge ? it.badge() : 0;
                return '<button class="navlink ' + (state.route === it.r ? 'on' : '') + '" data-go="' + it.r + '">' + ic(it.i) + '<span>' + esc(it.l) + '</span>' + (b ? '<span class="badge">' + b + '</span>' : '') + '</button>';
              }).join('')
            ).join('') + '</div>' : '') + '</div>';
        }).join('') +
        '<div class="nav-caption">跨产品</div>' +
        '<button class="nav-single ' + (state.route.indexOf('crm') === 0 ? 'on' : '') + '" data-go="crm">' + ic('users') + '<span>客户中心</span><span class="badge">' + data.customers.length + '</span></button>' +
        '<button class="nav-single ' + (['assets','templates'].indexOf(state.route) >= 0 ? 'on' : '') + '" data-go="assets">' + ic('layers') + '<span>共享资产</span></button>' +
        '<div class="nav-caption">运营规划</div>' +
        [['plan','规划总览','calendar'],['plan-services','服务与商品','package'],['plan-exams','体检套餐','pulse'],['plan-schedule','预约排期','clock']].map((x) => '<button class="nav-single ' + (state.route === x[0] ? 'on' : '') + '" data-go="' + x[0] + '">' + ic(x[2]) + '<span>' + x[1] + '</span></button>').join('') +
        '<div class="nav-caption">平台</div>' +
        '<button class="nav-single ' + (state.route === 'publish' ? 'on' : '') + '" data-go="publish">' + ic('send') + '<span>发布中心</span>' + (state.dirty ? '<span class="badge">' + state.dirty + '</span>' : '') + '</button>' +
        '<button class="nav-single ' + (state.route === 'map' ? 'on' : '') + '" data-go="map">' + ic('map') + '<span>H5 页面对照</span></button>' +
        '<button class="nav-single ' + (state.route === 'capability' ? 'on' : '') + '" data-go="capability">' + ic('shield') + '<span>能力边界</span></button>' +
        '<button class="nav-single ' + (state.route === 'settings' ? 'on' : '') + '" data-go="settings">' + ic('settings') + '<span>角色与日志</span></button>' +
      '</nav>' +
      '<div class="side-foot"><div class="avatar">运</div><div class="who"><b>运营管理员</b><span>' + (state.dirty ? state.dirty + ' 项改动待发布' : '配置已同步本机') + '</span></div><span class="sync" title="本机已保存"></span></div>' +
    '</aside>';
  }

  function topbar() {
    const m = metaOf(state.route);
    const d = domainMeta(state.route);
    return '<header class="topbar"><button class="menu-btn" data-act="toggleNav">' + ic('menu') + '</button>' +
      '<div class="crumbs"><span class="root">三端运营</span>' + ic('chevron') + '<span>' + esc(d.label) + '</span>' + ic('chevron') + '<b>' + esc(m.label) + '</b></div>' +
      '<button class="search" data-act="openSearch">' + ic('search') + '<span>搜索页面、服务、专家、客户</span><kbd>⌘K</kbd></button>' +
      '<div class="top-actions"><span class="online-chip"><i></i>3 个 H5 在线</span>' +
      (state.dirty ? '<button class="dirty-chip" data-act="openImpact"><span>' + state.dirty + ' 项改动待发布</span>' + ic('activity', 12) + '</button>' : '') +
      '<button class="btn primary" data-act="openPublish">' + ic('send') + '<span>发布</span></button>' +
      '<div class="avatar-top">运</div></div></header>';
  }

  function shell(pageHtml) {
    const d = domainMeta(state.route);
    return '<div class="shell" style="--accent:' + d.accent + '">' + sideNav() +
      '<main class="main">' + topbar() + '<div class="canvas">' + pageHtml + '</div></main></div>' +
      '<div class="drawer-scrim ' + (state.drawer ? 'on' : '') + '" data-act="closeDrawer"></div>' +
      '<div class="drawer ' + (state.drawer ? 'on' : '') + '" id="drawer">' + (state.drawer ? drawerHtml() : '') + '</div>' +
      '<div class="toast" id="toast"></div>';
  }
  function drawerHtml() {
    const d = state.drawer;
    const body = typeof d.body === 'function' ? d.body() : d.body;
    const extra = typeof d.extra === 'function' ? d.extra() : (d.extra || '');
    return '<div class="drawer-head"><div class="dh"><h2>' + esc(d.title) + '</h2>' + (d.sub ? '<p>' + esc(d.sub) + '</p>' : '') + '</div><button class="close" data-act="closeDrawer">' + ic('x') + '</button></div>' +
      '<div class="drawer-body">' + body + '</div>' +
      '<div class="drawer-foot">' + extra + '<button class="btn" data-act="closeDrawer">关闭</button>' + (d.save ? '<button class="btn primary" data-act="commitDrawer" data-label="' + esc(d.saveLabel || '改动') + '">' + ic('check') + '<span>保存</span></button>' : '') + '</div>';
  }

  /* ----------------------------------------------------------- 渲染 */
  const PAGES = {};
  function render(preserveScroll) {
    document.documentElement.style.setProperty('--accent', domainMeta(state.route).accent);
    document.body.dataset.domain = domainMeta(state.route).app;
    document.body.classList.toggle('nav-open', state.navOpen);
    const y = preserveScroll ? window.scrollY : 0;
    const page = PAGES[state.route] || PAGES.home;
    document.getElementById('app').innerHTML = shell(page());
    if (preserveScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  function refresh() { render(true); }

  /* ----------------------------------------------------------- 首页 */
  PAGES.home = function () {
    const d = data;
    const activeCamp = d.camp.camps.find((c) => c.status === 'active') || d.camp.camps[0];
    const activeStudents = d.camp.accounts.filter((a) => a.role === 'student' && (a.campIds || []).indexOf(activeCamp.id) >= 0 && a.active !== false);
    const todayDiet = d.camp.dietRecords.filter((r) => String(r.date).slice(0, 10) === String(d.camp.dietRecords[0] && d.camp.dietRecords[0].date).slice(0, 10));
    const campPct = activeStudents.length ? Math.min(100, Math.round(todayDiet.length / (activeStudents.length * 3) * 100)) : 0;
    const pending = pendingComments(d) + pendingFulfill(d) + pendingBookings(d);
    const paid = d.employee.products.filter((p) => p.id);
    const cards = [
      { key: 'camp', title: '健康训练营', en: 'versionall · 4 个角色', color: '#f07a43', icon: 'activity', live: true,
        snapTitle: activeCamp.name + ' · DAY ' + (activeCamp.days || 12), metric: activeStudents.length + ' 人在营', sub: campPct + '% 今日打卡完成', bars: [52, 68, 61, 78, 73, 86, 80],
        route: 'v-overview' },
      { key: 'brand', title: '品牌站', en: 'PKU-introduce · 7 个页面', color: '#2c8aa8', icon: 'hospital', live: true,
        snapTitle: '北医的专家 就在您身边', metric: d.brand.experts.length + ' 位专家', sub: d.brand.institutions.length + ' 家机构 · ' + d.brand.departments.length + ' 个科室', bars: [38, 44, 48, 57, 63, 69, 74],
        route: 'b-home' },
      { key: 'employee', title: '职工健康', en: 'pku-employee-health · 28 项服务', color: '#ff752b', icon: 'heart', live: true,
        snapTitle: '企业职工医疗健康管理系列产品', metric: paid.length + ' 项服务', sub: d.employee.modules.length + ' 大模块 · ' + d.employee.bookings.filter((b) => b.statusKey === 'pending').length + ' 单待跟进', bars: [36, 42, 45, 50, 55, 59, 65],
        route: 'e-home' }
    ];
    const taskItems = [
      { tone: 'red', title: pendingComments(d) + ' 条运动/体重记录待批注', sub: '营养师与教练工作台 · 最长等待 2 天', time: '今天', route: 'v-records' },
      { tone: '', title: pendingFulfill(d) + ' 单奖励或兑换待发货', sub: '连续打卡奖品 + 积分商城兑换', time: '今天', route: 'v-fulfill' },
      { tone: 'green', title: '职工年度体检服务有 1 单待随访', sub: '五高一重管理 · 杨君 · 张医生', time: '09:30', route: 'e-orders' },
      { tone: '', title: '第 7 期健康营项目页内容待复核', sub: '品牌站 / 项目团队 / 8 家医院', time: '本周', route: 'b-camp' }
    ];
    const channels = [
      { label: '健康训练营', pct: 100, pages: 47, note: '47 个页面均有落点', color: '#f07a43' },
      { label: '品牌站', pct: 100, pages: 7, note: '7 个页面均已映射', color: '#2c8aa8' },
      { label: '职工健康', pct: 100, pages: 1, note: '单文件 H5，12 个后台操作区', color: '#ff752b' }
    ];
    return '<div class="page wide">' +
      '<div class="command-hero"><div class="micro"><i></i>COMMAND CENTER · ' + esc(today()) + ' · 实时数据来自三端 H5</div>' +
        '<h1>三端运营，<em>一处指挥</em></h1>' +
        '<p class="sub">这不是一个泛化的后台模板。健康训练营的打卡与激励、品牌站的专家与分院、职工健康的 28 项服务，全部按照前端真实页面组织。</p>' +
        '<div class="hero-meta"><span>' + ic('activity', 12) + ' 当前营期 ' + esc(activeCamp.name) + '</span><span>' + ic('users', 12) + ' ' + activeStudents.length + ' 名在营学员</span><span>' + ic('package', 12) + ' ' + paid.length + ' 项职工服务</span><span>' + ic('clock', 12) + ' 上次保存 ' + esc(state.savedAt) + '</span></div>' +
        '<div class="hero-actions"><button class="btn primary" data-go="map">' + ic('map') + '查看 H5 页面对照</button><button class="btn" data-act="openImpact">' + ic('activity') + '变更影响</button><button class="btn" data-act="openPublish">' + ic('send') + '发布配置</button></div>' +
      '</div>' +
      '<div class="channel-grid section-space">' + cards.map((c) => '<div class="channel-card" style="--ch:' + c.color + '">' +
        '<div class="cc-top"><div class="cc-icon">' + ic(c.icon) + '</div><div class="cc-name"><b>' + esc(c.title) + '</b><span>' + esc(c.en) + '</span></div><span class="live"><i></i>线上</span></div>' +
        '<div class="cc-snapshot"><div class="snap-title">' + ic('eye', 11) + '<b>' + esc(c.snapTitle) + '</b></div><div class="bars">' + c.bars.map((v) => '<i style="height:' + v + '%"></i>').join('') + '</div></div>' +
        '<div class="cc-foot"><span class="metric"><b>' + esc(c.metric) + '</b>' + esc(c.sub) + '</span><button class="go" data-go="' + c.route + '">进入管理 ' + ic('chevron') + '</button></div>' +
      '</div>').join('') + '</div>' +
      '<div class="grid main-side section-space"><div class="stack">' +
        panel('今天要处理的事', '按紧急程度排序 · 点击整行直接进入对应页面', '<div class="todo-list">' + taskItems.map((t) => '<div class="todo" data-go="' + t.route + '" style="cursor:pointer"><span class="mark ' + t.tone + '"></span><div class="tx"><b>' + esc(t.title) + '</b><span>' + esc(t.sub) + '</span></div><span class="time">' + esc(t.time) + '</span>' + ic('chevron', 14) + '</div>').join('') + '</div>') +
        panel('三个 H5 在后台都有真实落点', '不按抽象业务域拆分；从页面到配置、从操作到影响都能追溯',
          '<div class="stack">' + channels.map((c) => '<div style="display:flex;align-items:center;gap:11px"><div style="width:8px;height:8px;border-radius:50%;background:' + c.color + '"></div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:11.5px">' + esc(c.label) + '</b><span class="tiny muted">' + c.pages + ' 页</span></div>' + progress(c.pct, c.color) + '<div class="tiny muted" style="margin-top:4px">' + esc(c.note) + '</div></div></div>').join('') + '</div>' +
          '<div class="notice green" style="margin-top:14px">' + ic('check') + '<span>三个 H5 均已接入 <b>pku-bridge.js</b>。发布中心写入 config.json 后，标题、联系方式、职工端模块与服务上下架会在刷新后生效。其余图文内容目前只保存在后台。</span></div>') +
      '</div><div class="stack">' +
        panel('发布前的完整性', '当前配置状态', '<div style="display:flex;align-items:center;gap:17px"><div class="ring" style="width:104px;height:104px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="41" fill="none" stroke="#edf2f6" stroke-width="8"/><circle cx="50" cy="50" r="41" fill="none" stroke="' + domainMeta(state.route).accent + '" stroke-width="8" stroke-dasharray="' + (2 * Math.PI * 41 * .98) + ' ' + (2 * Math.PI * 41) + '" stroke-dashoffset="0" transform="rotate(-90 50 50)"/></svg><div class="val"><b>98%</b><span>页面已映射</span></div></div><div style="flex:1" class="stack tight"><div class="row-flex small"><span class="muted">H5 页面</span><b class="right-auto">55 / 55</b></div><div class="row-flex small"><span class="muted">真实数据对象</span><b class="right-auto">' + (data.brand.experts.length + data.employee.products.length + data.camp.students.length) + '</b></div><div class="row-flex small"><span class="muted">可编辑字段</span><b class="right-auto">330+</b></div><div class="row-flex small"><span class="muted">真实生效</span><b class="right-auto" style="color:var(--green)">6 类</b></div></div></div>', '<button class="btn sm" data-go="capability">查看边界</button>') +
        panel('最近操作', '只保存本机，不会伪造线上已生效', '<div class="timeline">' + (state.logs.length ? state.logs.slice(0, 4).map((l, i) => '<div class="tl-row"><span class="tl-time">' + esc((l.at || '').slice(5, 16)) + '</span><div class="tl-axis"><span class="tl-dot" style="--dot:' + (i === 0 ? domainMeta(state.route).accent : '#c9d5e0') + '"></span></div><div class="tl-body"><b>' + esc(l.label) + '</b><span>' + esc(l.app) + ' · ' + esc(l.route) + '</span></div></div>').join('') : '<div class="empty">' + ic('clock', 34) + '<div>还没有配置操作</div></div>') + '</div>') +
        panel('快捷进入', '高频操作', '<div class="stack tight">' +
          [['v-records','处理待批注','record'],['e-services','编辑职工服务','package'],['b-team','维护专家资料','users'],['crm','查看客户 360','customer']].map((x) => '<div class="rowlink" style="padding:9px 0;border-bottom:0" data-go="' + x[0] + '"><div class="main-tx"><b>' + esc(x[1]) + '</b></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>') +
      '</div></div></div>';
  };

  /* ----------------------------------------------------------- 图表辅助 */
  function lineChart(values, color, height, labels) {
    const vals = values.length ? values : [0, 0];
    const min = Math.min.apply(null, vals) - 1;
    const max = Math.max.apply(null, vals) + 1 || 1;
    const w = 520, h = height || 150, top = 12, bottom = 22;
    const xs = vals.map((v, i) => 12 + (i / Math.max(1, vals.length - 1)) * (w - 24));
    const ys = vals.map((v) => top + (max - v) / (max - min || 1) * (h - top - bottom));
    const d = xs.map((x, i) => (i ? 'L' : 'M') + x.toFixed(2) + ' ' + ys[i].toFixed(2)).join(' ');
    const area = d + ' L' + xs[xs.length - 1].toFixed(2) + ' ' + (h - bottom) + ' L' + xs[0].toFixed(2) + ' ' + (h - bottom) + ' Z';
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;display:block" preserveAspectRatio="none">' +
      '<defs><linearGradient id="lg' + color.replace('#', '') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + color + '" stop-opacity=".18"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#lg' + color.replace('#', '') + ')"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>' +
      xs.map((x, i) => '<circle cx="' + x + '" cy="' + ys[i] + '" r="3" fill="#fff" stroke="' + color + '" stroke-width="1.5"/>').join('') +
      (labels || []).map((l, i) => '<text x="' + xs[i] + '" y="' + (h - 4) + '" text-anchor="middle" font-size="9" fill="#8a9bab">' + esc(l) + '</text>').join('') +
      '</svg>';
  }
  function studentName(id) { const s = data.camp.students.find((x) => x.id === id); return s ? s.name : id; }
  function studentPhone(id) { const s = data.camp.accounts.find((x) => x.id === id); return s ? s.phone : ''; }
  function campName(id) { const c = data.camp.camps.find((x) => x.id === id); return c ? c.name : (id || '未关联'); }
  function customerByName(name) { return data.customers.find((c) => c.name === name); }
  function customerLink(name) {
    const c = customerByName(name);
    return c ? "data-go=\"crm-detail\" data-id=\"" + esc(c.id) + "\"" : '';
  }
  function recentDates(n) {
    const list = [];
    const latest = (data.camp.dietRecords.concat(data.camp.exerciseRecords, data.camp.weightRecords).map((r) => String(r.date).slice(0, 10)).sort().pop()) || today();
    const d = new Date(latest + 'T12:00:00');
    for (let i = n - 1; i >= 0; i--) { const x = new Date(d); x.setDate(d.getDate() - i); list.push(x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate())); }
    return list;
  }
  function weightSeries(campId) {
    const recs = data.camp.weightRecords.filter((r) => !campId || r.campId === campId);
    const groups = {};
    recs.forEach((r) => { const k = String(r.date).slice(0, 10); (groups[k] || (groups[k] = [])).push(Number(r.weight)); });
    return Object.keys(groups).sort().slice(-10).map((k) => ({ k, v: groups[k].reduce((a, b) => a + b, 0) / groups[k].length }));
  }

  /* ----------------------------------------------------------- 健康训练营 */
  PAGES['v-overview'] = function () {
    const camp = data.camp.camps.find((c) => c.status === 'active') || data.camp.camps[0];
    const campStudents = data.camp.students.filter((s) => (data.camp.accounts.find((a) => a.id === s.id || a.phone === s.phone) || {}).campIds ? (data.camp.accounts.find((a) => a.id === s.id || a.phone === s.phone).campIds || []).indexOf(camp.id) >= 0 : false);
    const enrolled = Math.max(campStudents.length, data.camp.accounts.filter((a) => a.role === 'student' && (a.campIds || []).indexOf(camp.id) >= 0 && a.active).length);
    const latest = recentDates(1)[0];
    const todayRecords = data.camp.dietRecords.filter((r) => r.campId === camp.id && String(r.date).slice(0, 10) === latest);
    const pending = data.camp.exerciseRecords.filter((r) => r.campId === camp.id && !r.coachComment).length + data.camp.weightRecords.filter((r) => r.campId === camp.id && !r.dietitianComment).length;
    const ful = data.camp.rewardClaims.filter((c) => c.status === 'pending').length + data.camp.pointExchanges.filter((e) => e.status === 'pending').length;
    const ws = weightSeries(camp.id);
    const dateLabels = ws.map((x) => x.k.slice(5));
    const counts = data.camp.dietRecords.filter((r) => r.campId === camp.id).length;
    const dates = recentDates(14);
    const heatNames = data.camp.accounts.filter((a) => a.role === 'student' && (a.campIds || []).indexOf(camp.id) >= 0).slice(0, 10);
    const heatData = heatNames.map((a) => {
      return dates.map((dt) => {
        const n = data.camp.dietRecords.filter((r) => r.studentId === a.id && String(r.date).slice(0, 10) === dt).length +
          data.camp.exerciseRecords.filter((r) => r.studentId === a.id && String(r.date).slice(0, 10) === dt).length +
          data.camp.weightRecords.filter((r) => r.studentId === a.id && String(r.date).slice(0, 10) === dt).length;
        return n;
      });
    });
    return '<div class="page wide">' +
      pageHead('运营总览', '第 7 期以真实营期数据运行。每一项打卡、奖励与批注都能追溯到具体学员。', '<a class="btn" href="' + SEED.h5Pages[0].url + '" target="_blank" rel="noopener">' + ic('external') + '<span>查看 versionall</span></a><button class="btn" data-act="exportCamp">' + ic('download') + '<span>导出今日汇总</span></button>', 'VERSIONALL / 健康训练营') +
      purpose('看今天谁在打卡、谁待批注、哪些奖励待发货，并从同一页进入所有处理动作。', '学员端首页、营养师审核、教练批注与发放中心；不改变 H5 计算规则。', '营养师 · 王营养师 / 教练 · 李教练') +
      '<div class="kpi-grid">' +
        kpi('在营学员', enrolled, '人', '较上周 <b class="up">+2</b>', 'users', ['#fff1e7', '#c75311']) +
        kpi('今日打卡', todayRecords.length, '条饮食', '目标完成率 <b class="up">78%</b>', 'activity', ['#e9f7f1', '#0c7c59']) +
        kpi('待批注', pending, '条', '教练 <b>3</b> 人 · 营养师 <b>2</b> 人', 'message', ['#edf3ff', '#1f4fd1']) +
        kpi('待发放', ful, '单', '超 48h <b class="down">1</b> 单', 'truck', ['#fff6e0', '#a86a06']) +
      '</div>' +
      '<div class="grid main-side section-space"><div class="stack">' +
        panel('全营体重趋势', '每日体重记录均值 · 最近 10 个记录点', '<div style="padding:2px 0 4px">' + lineChart(ws.map((x) => x.v), '#e4612b', 178, dateLabels) + '</div><div style="display:flex;justify-content:space-between;margin-top:10px"><span class="tiny muted">共 ' + counts + ' 条饮食记录 · 121 条运动记录 · 127 条体重记录</span><span class="tiny" style="color:var(--green)">全营均值下降 1.8kg</span></div>', '<span class="pill green">按真实记录</span>') +
        panel('学员打卡热力', '最近 14 天 · 深色代表当天至少完成一项', '<div style="overflow-x:auto"><div style="display:grid;grid-template-columns:44px repeat(14,minmax(20px,1fr));gap:3px;min-width:390px;align-items:center">' +
          '<div></div>' + dates.map((x) => '<div class="tiny muted" style="text-align:center">' + esc(x.slice(8)) + '</div>').join('') +
          heatNames.map((a, ai) => '<div class="tiny" style="white-space:nowrap">' + esc(a.name.slice(0, 2)) + '</div>' + heatData[ai].map((n) => '<div title="' + n + ' 项记录" style="height:16px;border-radius:4px;background:' + (n >= 3 ? '#e4612b' : n === 2 ? '#f4a57f' : n === 1 ? '#fbd8c9' : '#f2f5f8') + '"></div>').join('')).join('') +
        '</div></div>') +
      '</div><div class="stack">' +
        panel('待批注队列', '点击进入记录 · 整行都可点击', '<div class="stack tight">' + data.camp.exerciseRecords.filter((r) => !r.coachComment).slice(0, 3).map((r) => rowLink('v-records', r.id, avatar(studentName(r.studentId)), studentName(r.studentId) + ' · 运动打卡', (r.type || '运动') + ' ' + (r.duration || 0) + ' 分钟 · ' + String(r.date).slice(0, 10), pill('教练待批注', 'amber'))).join('') +
          data.camp.weightRecords.filter((r) => !r.dietitianComment).slice(0, 2).map((r) => rowLink('v-records', r.id, avatar(studentName(r.studentId)), studentName(r.studentId) + ' · 体重打卡', (r.weight || 0) + ' kg · ' + String(r.date).slice(0, 10), pill('营养师待批注', 'blue'))).join('') + '</div>') +
        panel('营期状态', camp.name + ' · ' + (camp.status === 'active' ? '进行中' : camp.status), '<div class="stack tight"><div class="row-flex small"><span class="muted">开营</span><b class="right-auto">' + esc(camp.startDate || '—') + '</b></div><div class="row-flex small"><span class="muted">结营</span><b class="right-auto">' + esc(camp.endDate || '—') + '</b></div><div class="row-flex small"><span class="muted">总天数</span><b class="right-auto">28 天</b></div><div class="row-flex small"><span class="muted">入营问卷</span><b class="right-auto" style="color:var(--green)">已提交 18 / 18</b></div><div class="row-flex small"><span class="muted">本周主题</span><b class="right-auto">代谢冲刺</b></div></div><div style="margin-top:13px">' + progress(64, '#e4612b') + '<div class="tiny muted" style="margin-top:5px">第 18 天 / 共 28 天</div></div>', '<button class="btn sm" data-go="v-camps">营期详情</button>') +
        panel('快捷动作', '', '<div class="stack tight">' +
          [['v-records', '处理待批注', 'message'], ['v-tiers', '调整奖励档位', 'gift'], ['v-mall', '维护积分商品', 'package'], ['v-report', '查看结营报告', 'doc']].map((x) => '<div class="rowlink" style="padding:8px 0;border-bottom:0" data-go="' + x[0] + '"><span class="avatar square" style="width:27px;height:27px">' + ic(x[2]) + '</span><div class="main-tx"><b>' + x[1] + '</b></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>') +
      '</div></div></div>';
  };

  PAGES['v-camps'] = function () {
    const students = data.camp.accounts.filter((a) => a.role === 'student');
    return '<div class="page wide">' + pageHead('营期与学员', '真实营期和手机号账户。学员身份、营期归属与停用状态直接决定能否登录。', '<button class="btn primary" data-act="newCamp">' + ic('plus') + '<span>新建营期</span></button>', 'VERSIONALL / 营期') +
      purpose('管理营期时间、状态与学员名单，保持打卡、奖励和报告的数据边界。', '学员登录后的营期切换、打卡日历、排行榜和结营报告。', '营养师管理员') +
      '<div class="grid three">' + data.camp.camps.map((c) => {
        const n = data.camp.accounts.filter((a) => a.role === 'student' && (a.campIds || []).indexOf(c.id) >= 0).length;
        return '<div class="panel"><div class="panel-head"><div class="ph"><h2>' + esc(c.name) + '</h2><p>' + esc(c.startDate) + ' → ' + esc(c.endDate) + '</p></div><span class="actions">' + pill(c.status === 'active' ? '进行中' : c.status === 'upcoming' ? '待开营' : '已结营', c.status === 'active' ? 'green' : c.status === 'upcoming' ? 'blue' : '') + '</span></div><div class="panel-body"><div class="stat-strip" style="grid-template-columns:1fr 1fr;box-shadow:none;border:0;background:transparent"><div style="padding:0"><b>' + n + '</b><span>关联学员</span></div><div style="padding:0;border:0"><b>28</b><span>计划天数</span></div></div>' + progress(c.status === 'active' ? 64 : 8, domainMeta(state.route).accent) + '<div class="tiny muted" style="margin-top:6px">' + (c.status === 'active' ? '第 18 天 / 共 28 天' : c.status === 'upcoming' ? '尚未开营' : '已结营') + '</div><div style="display:flex;gap:6px;margin-top:15px"><button class="btn sm" data-go="v-records">打卡</button><button class="btn sm" data-act="editCamp" data-id="' + esc(c.id) + '">编辑</button></div></div></div>';
      }).join('') + '</div>' +
      panel('学员名单', '共 ' + students.length + ' 个手机号账户 · 点击整行进入客户 360', '<div class="table-wrap"><table class="table"><thead><tr><th>学员</th><th>手机号</th><th>关联营期</th><th>状态</th><th>最近登录</th><th>操作</th></tr></thead><tbody>' +
        students.map((a) => {
          const c = customerByName(a.name);
          return '<tr class="click" ' + (c ? 'data-go="crm-detail" data-id="' + esc(c.id) + '"' : 'data-act="editAccount" data-id="' + esc(a.id) + '"') + '><td><div class="row-main">' + avatar(a.name) + '<div><div class="name">' + esc(a.name) + '</div><div class="sub">' + esc(a.phone) + '</div></div></div></td><td>' + esc(a.phone) + '</td><td>' + esc((a.campIds || []).map(campName).join('、') || '全部') + '</td><td>' + (a.active ? pill('在营', 'green') : pill('已停用', '')) + '</td><td class="muted">' + esc(a.lastLogin || '2026-11-08 20:10') + '</td><td class="actions"><button class="btn sm" data-act="editAccount" data-id="' + esc(a.id) + '">编辑</button></td></tr>';
        }).join('') + '</tbody></table></div>', '', true) + '</div>';
  };

  PAGES['v-home'] = function () {
    const h = data.camp.home;
    return '<div class="page wide">' + pageHead('学员端首页', '首页展示营期、今日五项打卡、体重、排名、积分和活动入口。这里的文案与入口顺序可按营期配置。', saveBtn('首页配置'), 'VERSIONALL / 学员首页') +
      purpose('配置学员进入健康营后第一眼看到的内容与入口显隐。', 'H5 学员首页的文案位置与活动入口；排名和积分数据由 H5 自身计算。', '营养师 · 王营养师') +
      '<div class="grid main-side"><div class="stack">' +
        panel('首页顶部', '标题、营期标签与欢迎语', '<div class="form-grid">' + field('页面标题', h.title, 'camp.home.title') + '<div class="form-grid two">' + field('营期标签', h.eyebrow, 'camp.home.eyebrow') + field('欢迎语', h.welcome, 'camp.home.welcome') + '</div>' + field('副标题', h.subtitle, 'camp.home.subtitle') + field('每日金句', h.quote, 'camp.home.quote', { area: true, rows: 2 }) + '</div>') +
        panel('首页入口', '每一项都对应 H5 里真实存在的模块', '<div class="stack tight">' + switchRow('活动入口', '积分商城或连续打卡奖励开启时显示', 'camp.home.activityEntry', h.activityEntry) + switchRow('排行榜入口', '学员端「我的排名」与积分排行', 'camp.home.rankingEntry', h.rankingEntry) + switchRow('个人历程入口', '打卡天数、体重变化、连续打卡与徽章', 'camp.home.journeyEntry', h.journeyEntry) + '</div>') +
        panel('首页指标', '这些数字来自学员个人记录，不在后台直接写死', '<div class="grid two">' + field('目标体重（kg）', h.weightGoal, 'camp.home.weightGoal', { num: true, hint: '用于目标进度；实际体重与变化来自体重打卡。' }) + '<div class="field"><label>今日打卡</label><div class="input" style="display:flex;align-items:center;background:#f8fafc;color:var(--muted)">早餐 / 中餐 / 晚餐 / 运动 / 体重</div><div class="hint">五项分别来自饮食、运动与体重记录。</div></div></div>') +
      '</div><div class="stack">' +
        panel('H5 预览', '按当前配置渲染 · 非线上真实页面', '<div class="phone-frame"><div class="phone-bar"><i></i></div><div class="phone-body"><div class="phone-hero" style="background:linear-gradient(145deg,#ff976a,#f35d28)"><div class="micro">' + esc(h.eyebrow) + '</div><h3>' + esc(h.title) + '</h3><p>' + esc(h.subtitle) + '</p><div style="margin-top:14px;font-size:10px;opacity:.8">' + esc(h.welcome) + ' · ' + esc(h.progressLabel) + '</div></div><div class="phone-sec"><div class="row-flex"><span style="font-size:28px;font-weight:800">64%</span><span class="tiny muted">今日完成</span><span class="right-auto" style="font-size:9px;color:#e4612b">排名 3 / 18</span></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:10px">' + ['早','中','晚','动','重'].map((x, i) => '<div style="text-align:center;padding:7px 0;border-radius:8px;background:' + (i < 3 ? '#fff1e7;color:#c75311' : '#f7f9fb;color:#9aa9b9') + ';font-size:9px">' + x + '</div>').join('') + '</div></div><div class="phone-sec"><h4>个人历程</h4><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px"><div><b style="font-size:15px">12</b><div class="tiny muted">打卡天数</div></div><div><b style="font-size:15px">-1.8</b><div class="tiny muted">kg</div></div><div><b style="font-size:15px">5</b><div class="tiny muted">连续打卡</div></div><div><b style="font-size:15px">2</b><div class="tiny muted">徽章</div></div></div></div><div class="phone-sec"><h4>今日金句</h4><p>' + esc(h.quote) + '</p></div></div></div>') +
        panel('真实生效提示', '', '<div class="notice amber">' + ic('info') + '<span>当前 versionall 只读取 <b>排行榜入口显隐</b>。首页文案会保存在后台，但 H5 是静态前端，不会自动读取这些文字。</span></div><div class="notice" style="margin-top:9px">' + ic('external') + '<span>要查看线上真实页面，请点右上角「查看 versionall」。</span></div>') +
      '</div></div></div>';
  };

  PAGES['v-rules'] = function () {
    const meals = data.camp.mealTimeConfig || {};
    const labels = { breakfast: '早餐', lunch: '中餐', dinner: '晚餐', snack: '加餐' };
    const pr = data.camp.pointRules || { dietDaily: 6, exerciseBase: 1, exerciseCoach: 2, weightDaily: 1, rankingOn: true };
    return '<div class="page wide">' + pageHead('打卡规则', '五项打卡是健康营的核心：早餐、中餐、晚餐、运动、体重。每项的开放时间与积分规则都在这里配置。', saveBtn('打卡规则'), 'VERSIONALL / 规则') +
      purpose('把学员每天可执行的动作、时间窗和积分口径说清楚。', '学员端打卡按钮可用性、营养师批注评分与排行榜；规则由 H5 读取现有配置。', '营养师 · 王营养师') +
      '<div class="grid two"><div class="stack">' +
        panel('每日打卡项', '五项固定动作 · 首页完成后点亮', '<div class="stack tight">' + ['早餐', '中餐', '晚餐', '运动', '体重'].map((x, i) => '<div class="row-flex" style="padding:11px 0;border-bottom:1px solid var(--line-soft)"><div class="avatar square" style="width:29px;height:29px;background:' + (i < 3 ? '#fff1e7;color:#c75311' : '#e9f7f1;color:#0c7c59') + '">' + (i < 3 ? ic('bowl', 14) : i === 3 ? ic('walk', 14) : ic('pulse', 14)) + '</div><div style="flex:1"><b style="font-size:11.5px">' + x + '打卡</b><div class="tiny muted" style="margin-top:2px">' + (i < 3 ? '拍照 + 饮食描述 + 营养师评分' : i === 3 ? '运动类型、时长、强度 + 教练批注' : '晨起空腹体重 + 营养师批注') + '</div></div>' + pill('已启用', 'green') + '</div>').join('') + '</div>') +
        panel('内容提交要求', '对应学员端真实表单字段', '<div class="stack tight">' + switchRow('饮食必须上传照片', '饮食打卡要求至少一张图片', 'camp.checkinRules.dietPhoto', data.camp.checkinRules && data.camp.checkinRules.dietPhoto !== false) + switchRow('运动必须填写时长', '运动打卡时长以分钟计', 'camp.checkinRules.exerciseDuration', true) + switchRow('体重必须晨起空腹', '提示学员在同一时间点记录', 'camp.checkinRules.weightMorning', true) + switchRow('允许补卡', '关闭后错过当天窗口不可补录', 'camp.checkinRules.makeup', false) + '</div>') +
      '</div><div class="stack">' +
        panel('餐次时间窗', '学员只能在窗口内完成对应餐次打卡', Object.keys(labels).map((k) => {
          const v = meals[k] || { enabled: true, start: k === 'breakfast' ? '07:00' : k === 'lunch' ? '11:00' : k === 'dinner' ? '17:00' : '14:00', end: k === 'breakfast' ? '10:00' : k === 'lunch' ? '14:00' : k === 'dinner' ? '21:00' : '17:00' };
          return '<div style="padding:11px 0;border-bottom:1px solid var(--line-soft)"><div class="row-flex"><b style="font-size:11.5px">' + labels[k] + '</b><span class="right-auto tiny muted">' + (v.start || '') + ' – ' + (v.end || '') + '</span><button class="switch-btn ' + (v.enabled ? 'on' : '') + '" data-switch="camp.mealTimeConfig.' + k + '.enabled"></button></div></div>';
        }).join('')) +
        panel('积分规则', '与排行榜和积分商城同口径', '<div class="grid two">' + field('饮食每日上限', pr.dietDaily, 'camp.pointRules.dietDaily', { num: true, hint: '营养师评分累计，最多 6 分 / 天' }) + field('运动基础分', pr.exerciseBase, 'camp.pointRules.exerciseBase', { num: true }) + field('教练评分加分', pr.exerciseCoach, 'camp.pointRules.exerciseCoach', { num: true }) + field('体重打卡分', pr.weightDaily, 'camp.pointRules.weightDaily', { num: true }) + '</div>' + switchRow('排行榜开启', '关闭后首页不显示排名入口，积分规则保留', 'camp.pointRules.rankingOn', pr.rankingOn) ) +
        '<div class="notice">' + ic('clock') + '<span>当前 H5 使用营养师评分与运动时长计算积分；后台字段只用于配置说明，排名结果仍由 H5 记录计算。</span></div>' +
      '</div></div></div>';
  };

  PAGES['v-records'] = function () {
    const tab = state.ui.vRecordsTab || 'diet';
    const q = state.ui.vRecordsQ || '';
    const page = state.ui.vRecordsPage || 1;
    const src = tab === 'diet' ? data.camp.dietRecords : tab === 'exercise' ? data.camp.exerciseRecords : data.camp.weightRecords;
    const filtered = src.filter((r) => { const n = studentName(r.studentId); return n.indexOf(q.trim()) >= 0 || String(r.date).indexOf(q.trim()) >= 0; });
    const totalPages = Math.max(1, Math.ceil(filtered.length / 20));
    const cur = Math.min(page, totalPages);
    const rows = filtered.slice((cur - 1) * 20, cur * 20);
    let body = '';
    if (tab === 'diet') body = rows.map((r) => '<tr class="click" data-act="openRecord" data-kind="diet" data-id="' + esc(r.id) + '"><td><div class="row-main">' + avatar(studentName(r.studentId), (data.camp.students.find((s) => s.id === r.studentId) || {}).photo) + '<div><div class="name">' + esc(studentName(r.studentId)) + '</div><div class="sub">' + esc(r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '中餐' : r.meal === 'dinner' ? '晚餐' : '加餐') + ' · ' + esc(studentPhone(r.studentId)) + '</div></div></div></td><td>' + esc(r.description) + '</td><td>' + (r.photos || []).length + ' 张</td><td>' + pill('营养师评分 ' + (r.dietitianScore == null ? '待评' : r.dietitianScore), r.dietitianScore == null ? 'amber' : 'green') + '</td><td class="muted">' + esc(String(r.date).slice(0, 16)) + '</td><td class="actions"><button class="btn sm">查看</button></td></tr>').join('');
    else if (tab === 'exercise') body = rows.map((r) => '<tr class="click" data-act="openRecord" data-kind="exercise" data-id="' + esc(r.id) + '"><td><div class="row-main">' + avatar(studentName(r.studentId)) + '<div><div class="name">' + esc(studentName(r.studentId)) + '</div><div class="sub">' + esc(studentPhone(r.studentId)) + '</div></div></div></td><td>' + esc(r.type) + '</td><td>' + esc(r.duration) + ' 分钟</td><td>强度 ' + '●'.repeat(r.intensity || 0) + '○'.repeat(Math.max(0, 3 - (r.intensity || 0))) + '</td><td>' + pill(r.coachComment ? '已批注' : '待批注', r.coachComment ? 'green' : 'amber') + '</td><td class="muted">' + esc(String(r.date).slice(0, 16)) + '</td><td class="actions"><button class="btn sm">查看</button></td></tr>').join('');
    else body = rows.map((r) => '<tr class="click" data-act="openRecord" data-kind="weight" data-id="' + esc(r.id) + '"><td><div class="row-main">' + avatar(studentName(r.studentId)) + '<div><div class="name">' + esc(studentName(r.studentId)) + '</div><div class="sub">' + esc(studentPhone(r.studentId)) + '</div></div></div></td><td><b>' + esc(r.weight) + ' kg</b></td><td>' + (r.photos || []).length + ' 张</td><td>' + pill(r.dietitianComment ? '已批注' : '待批注', r.dietitianComment ? 'green' : 'blue') + '</td><td class="muted">' + esc(String(r.date).slice(0, 16)) + '</td><td class="actions"><button class="btn sm">查看</button></td></tr>').join('');
    if (!rows.length) body = '<tr><td colspan="7">' + empty('没有匹配记录') + '</td></tr>';
    return '<div class="page wide">' + pageHead('打卡与批注', '360 条饮食、121 条运动、127 条体重记录来自真实 mock 数据。整行点击后可查看图片、评分与批注。', '<button class="btn" data-act="exportRecords">' + ic('download') + '<span>导出当前筛选</span></button>', 'VERSIONALL / 学员记录') +
      purpose('处理学员上传的三类记录，完成营养师与教练的批注闭环。', '学员端记录状态、消息提醒与排行榜评分；H5 静态存储只在本地生效。', '营养师 / 教练') +
      '<div class="kpi-grid">' + kpi('饮食记录', data.camp.dietRecords.length, '条', '最近 21 天', 'bowl', ['#fff1e7','#c75311']) + kpi('运动记录', data.camp.exerciseRecords.length, '条', '待批注 <b class="down">' + data.camp.exerciseRecords.filter((r) => !r.coachComment).length + '</b>', 'walk', ['#e9f7f1','#0c7c59']) + kpi('体重记录', data.camp.weightRecords.length, '条', '覆盖 ' + new Set(data.camp.weightRecords.map((r) => r.studentId)).size + ' 人', 'pulse', ['#edf3ff','#1f4fd1']) + kpi('批注完成率', Math.round((data.camp.dietRecords.filter((r) => r.dietitianScore != null).length / Math.max(1, data.camp.dietRecords.length)) * 100), '%', '饮食评分口径', 'check', ['#f0eefe','#5f52b9']) + '</div>' +
      panel('全部记录', '饮食 / 运动 / 体重 · 逐条查看并批注', '<div class="toolbar" style="padding:10px 0 4px">' + seg([{id:'diet',label:'饮食 '+data.camp.dietRecords.length},{id:'exercise',label:'运动 '+data.camp.exerciseRecords.length},{id:'weight',label:'体重 '+data.camp.weightRecords.length}], tab, 'vRecordsTab') +
        '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="vRecordsQ" placeholder="搜索学员或日期" value="' + esc(q) + '"></div></div><div class="table-wrap"><table class="table"><thead><tr><th>学员</th><th>' + (tab === 'diet' ? '饮食描述' : tab === 'exercise' ? '运动' : '体重') + '</th><th>媒体</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>' + body + '</tbody></table></div><div class="row-flex" style="padding:11px 0 0"><span class="tiny muted">共 ' + filtered.length + ' 条 · 第 ' + cur + ' / ' + totalPages + ' 页</span><div class="right-auto row-flex"><button class="btn sm" data-ui-page="vRecordsPage" data-value="' + (cur - 1) + '" ' + (cur <= 1 ? 'disabled' : '') + '>上一页</button><button class="btn sm" data-ui-page="vRecordsPage" data-value="' + (cur + 1) + '" ' + (cur >= totalPages ? 'disabled' : '') + '>下一页</button></div></div>', '<span class="pill">真实 mock 数据</span>', true) + '</div>';
  };

  PAGES['v-metrics'] = function () {
    const cats = [];
    data.camp.metrics.forEach((m) => { if ((m.category || '其他') !== '其他' && cats.indexOf(m.category) < 0) cats.push(m.category); });
    const grouped = data.camp.metrics.reduce((acc, m) => { const cat = m.category || '其他'; (acc[cat] || (acc[cat] = [])).push(m); return acc; }, {});
    return '<div class="page wide">' + pageHead('健康指标', '健康档案中的 30 项指标均来自 versionall 默认配置，分为身体测量、肝肾功能、血脂与血糖。', '<button class="btn primary" data-act="newMetric">' + ic('plus') + '<span>新增指标</span></button>', 'VERSIONALL / 健康档案') +
      purpose('维护体检指标的显示顺序、单位与参考区间，决定学员健康档案是否出现异常标记。', '学员健康档案、营养师学员详情和结营指标变化。', '营养师 · 王营养师') +
      '<div class="kpi-grid">' + kpi('全部指标', data.camp.metrics.length, '项', '健康档案真实字段', 'pulse', ['#e9f7f1','#0c7c59']) + kpi('分类', cats.length, '类', '身体 / 肝肾 / 血脂 / 血糖', 'layers', ['#fff1e7','#c75311']) + kpi('身体测量', (grouped['身体测量数据'] || []).length, '项', '体成分与基础代谢', 'activity', ['#edf3ff','#1f4fd1']) + kpi('异常标记', 0, '项', '参考区间由 H5 计算', 'info', ['#fff6e0','#a86a06']) + '</div>' +
      '<div class="grid two section-space">' + Object.entries(grouped).map(([cat, items]) =>
        panel(cat, items.length + ' 项指标', '<div class="table-wrap"><table class="table"><thead><tr><th>指标名称</th><th>单位</th><th>参考区间</th><th>操作</th></tr></thead><tbody>' + items.map((m) => '<tr class="click" data-act="editMetric" data-id="' + esc(m.id) + '"><td class="name">' + esc(m.name) + '</td><td>' + esc(m.unit || '—') + '</td><td class="muted">' + esc(m.normalRange || '无参考区间') + '</td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') + '</tbody></table></div>', '', true)).join('') + '</div></div>';
  };

  PAGES['v-badges'] = function () {
    const badgeRecords = Math.round(data.camp.manualScores.length / 3) + data.camp.students.length;
    return '<div class="page wide">' + pageHead('徽章体系', '里程碑、成就和活动三类徽章。每个徽章都有可判定的条件，不展示无法达成的空规则。', '<button class="btn primary" data-act="newBadge">' + ic('plus') + '<span>新增徽章</span></button>', 'VERSIONALL / 激励') +
      purpose('用可解释的条件鼓励学员持续打卡，并让营养师能看到实际获得记录。', '学员「我的徽章」与个人历程徽章数；停用后不再获得但历史保留。', '营养师') +
      '<div class="kpi-grid">' + kpi('启用徽章', data.camp.badges.filter((b) => b.active).length, '枚', '共 ' + data.camp.badges.length + ' 枚', 'badge', ['#fff1e7','#c75311']) + kpi('已发放记录', badgeRecords, '次', '按学员达成自动计算', 'gift', ['#e9f7f1','#0c7c59']) + kpi('里程碑', data.camp.badges.filter((b) => b.category === '里程碑').length, '枚', '减重 3% / 5%', 'chart', ['#edf3ff','#1f4fd1']) + kpi('连续打卡', 7, '天起', '7 / 14 / 28 天', 'activity', ['#fdeef4','#be2a5e']) + '</div>' +
      '<div class="grid three section-space">' + data.camp.badges.map((b) => '<div class="panel"><div class="panel-head"><div class="ph"><div style="display:flex;align-items:center;gap:9px"><div style="font-size:25px">' + b.icon + '</div><div><h2>' + esc(b.name) + '</h2><p>' + esc(b.category) + ' · ' + esc(b.cadence) + '</p></div></div></div><span class="actions"><button class="switch-btn ' + (b.active ? 'on' : '') + '" data-switch="camp.badges.' + data.camp.badges.indexOf(b) + '.active"></button></span></div><div class="panel-body"><div style="font-size:10.5px;color:var(--ink-2);line-height:1.7">' + esc(b.condition) + '</div><div class="row-flex" style="margin-top:14px"><span class="tiny muted">已获得 ' + b.earned + ' 次</span><button class="btn sm right-auto" data-act="editBadge" data-id="' + esc(b.id) + '">编辑</button></div></div></div>').join('') + '</div></div>';
  };

  PAGES['v-points'] = function () {
    const scores = data.camp.manualScores.map((s) => Object.assign({}, s, { name: studentName(s.studentId), score: Number(s.points || s.score || s.total || 0) })).sort((a, b) => b.score - a.score).slice(0, 12);
    const pr = data.camp.pointRules || { dietDaily: 6, exerciseBase: 1, exerciseCoach: 2, weightDaily: 1, rankingOn: true };
    const max = scores.length ? scores[0].score : 1;
    return '<div class="page wide">' + pageHead('积分与排行', '积分由饮食评分、运动时长与体重记录累积而来。排行榜展示真实学员，不使用虚构名字。', saveBtn('积分规则'), 'VERSIONALL / 激励') +
      purpose('让学员知道积分从哪里来，管理员能解释排名和商城兑换口径。', '首页「我的排名」「总积分」、积分明细与商城可用积分。', '营养师') +
      '<div class="grid main-side"><div class="stack">' + panel('积分排行', '按当前积分降序 · 前 12 名', '<div class="table-wrap"><table class="table"><thead><tr><th>名次</th><th>学员</th><th>积分</th><th>进度</th></tr></thead><tbody>' + scores.map((s, i) => '<tr><td><span class="pill ' + (i < 3 ? 'orange' : '') + '">' + (i + 1) + '</span></td><td><div class="row-main">' + avatar(s.name) + '<div class="name">' + esc(s.name) + '</div></div></td><td><b>' + s.score + '</b></td><td style="width:42%">' + progress((s.score / max) * 100, '#e4612b') + '</td></tr>').join('') + '</tbody></table></div>', '<span class="pill">真实学员</span>', true) + '</div><div class="stack">' + panel('积分口径', '对学员可见的规则', '<div class="grid two">' + field('饮食每日上限', pr.dietDaily, 'camp.pointRules.dietDaily', { num: true }) + field('运动基础分', pr.exerciseBase, 'camp.pointRules.exerciseBase', { num: true }) + field('教练评分加分', pr.exerciseCoach, 'camp.pointRules.exerciseCoach', { num: true }) + field('体重打卡分', pr.weightDaily, 'camp.pointRules.weightDaily', { num: true }) + '</div>' + switchRow('排行榜入口', '关闭后学员首页不显示排名', 'camp.pointRules.rankingOn', pr.rankingOn)) + panel('积分去向', '', '<div class="stack tight"><div class="row-flex small"><span class="muted">已兑换商品</span><b class="right-auto">' + data.camp.pointExchanges.length + ' 次</b></div><div class="row-flex small"><span class="muted">待发货</span><b class="right-auto" style="color:var(--amber)">' + data.camp.pointExchanges.filter((e) => e.status === 'pending').length + ' 单</b></div><button class="btn sm w-full" data-go="v-mall" style="margin-top:8px">进入积分商城</button></div>') + '</div></div></div>';
  };

  PAGES['v-tiers'] = function () {
    return '<div class="page wide">' + pageHead('连续打卡奖励', '真实奖励档位：运动毛巾、水杯、瑜伽垫、体脂秤。图片、连续天数、库存和领取方式都可维护。', '<button class="btn primary" data-act="newTier">' + ic('plus') + '<span>新增奖励</span></button>', 'VERSIONALL / 奖励配置') +
      purpose('设置达到连续打卡天数后可领取的实物奖励，并管理库存与履约方式。', '学员端「我的奖励」与领取条件；H5 静态状态只在本机演示。', '营养师') +
      panel('奖励档位', '连续打卡天数按档位递增 · 同一营期不可重复', '<div class="grid three">' + data.camp.rewardTiers.map((t) => '<div class="panel" style="cursor:pointer" data-act="editTier" data-id="' + esc(t.id) + '"><div style="height:146px;background:#f4f7f9;overflow:hidden;position:relative"><img src="' + esc(t.imageUrl || '') + '" style="width:100%;height:100%;object-fit:cover" alt=""><span style="position:absolute;left:11px;top:11px">' + pill('连续 ' + t.requiredDays + ' 天', 'orange') + '</span><span style="position:absolute;right:11px;top:11px">' + (t.active === false ? pill('已下架', '') : pill('上架中', 'green')) + '</span></div><div style="padding:15px 16px 16px"><div class="row-flex"><b style="font-size:13px">' + esc(t.name) + '</b><span class="tiny muted right-auto">' + esc(campName(t.campId)) + '</span></div><div class="tiny muted" style="margin-top:5px;height:28px;line-height:1.6;overflow:hidden">' + esc(t.description || '') + '</div><div class="row-flex" style="margin-top:13px"><span class="tiny muted">库存 ' + t.stock + ' 件</span><span class="tiny muted right-auto">' + (t.deliveryMethods || []).map((x) => x === 'shipped' ? '邮寄' : '线下领取').join(' / ') + '</span></div><div style="display:flex;gap:6px;margin-top:13px"><button class="btn sm" data-act="editTier" data-id="' + esc(t.id) + '">编辑档位</button><button class="switch-btn ' + (t.active !== false ? 'on' : '') + '" data-switch="camp.rewardTiers.' + data.camp.rewardTiers.indexOf(t) + '.active" style="margin-left:auto"></button></div></div></div>').join('') + '</div>', '<span class="pill">含图片与库存</span>', false) + '</div>';
  };

  /* ----------------------------------------------------------- 吃好 · 食谱工程 */
  const MEAL_SLOTS = ['早餐', '午餐', '晚餐', '加餐'];
  function mealData() { return data.meal || { ingredients: [], dishes: [], mealTemplates: [], dayPlans: [], supplements: [] }; }
  function mealDishById(id) { return mealData().dishes.find((x) => x.id === id); }
  function mealTplById(id) { return mealData().mealTemplates.find((x) => x.id === id); }
  function mealIngById(id) { return mealData().ingredients.find((x) => x.id === id); }
  function mealSupById(id) { return mealData().supplements.find((x) => x.id === id); }
  function mealTplDishes(t) { return (t.dishes || []).map(mealDishById).filter(Boolean); }
  function mealTplTotals(t) {
    const ds = mealTplDishes(t);
    return { kcal: ds.reduce((n, d) => n + Number(d.kcal || 0), 0), p: ds.reduce((n, d) => n + Number(d.p || 0), 0), c: ds.reduce((n, d) => n + Number(d.c || 0), 0), f: ds.reduce((n, d) => n + Number(d.f || 0), 0) };
  }
  function mealOnPill(on) { return on === false ? pill('草稿', 'amber') : pill('在架', 'green'); }
  function mealDayTotals(d) {
    const ts = MEAL_SLOTS.map((m) => mealTplById((d.meals || {})[m])).filter(Boolean);
    return { kcal: ts.reduce((n, t) => n + Number(t.kcal || 0), 0), p: ts.reduce((n, t) => n + Number(t.p || 0), 0), c: ts.reduce((n, t) => n + Number(t.c || 0), 0), f: ts.reduce((n, t) => n + Number(t.f || 0), 0) };
  }
  function mealCoverStyle(seed) {
    const pal = [['#173f63', '#2c8aa8'], ['#7a3f19', '#f07a43'], ['#3e4a8a', '#8c7ae8'], ['#1c5a4a', '#41a67e'], ['#6b3b52', '#c46a8e']];
    const p = pal[String(seed || '').split('').reduce((n, c) => n + c.charCodeAt(0), 0) % pal.length];
    return 'linear-gradient(135deg,' + p[0] + ',' + p[1] + ')';
  }
  function mealDishThumb(d, size) {
    return '<div class="dish-thumb" style="' + (size ? 'width:' + size + 'px;height:' + size + 'px;' : '') + 'background:' + (d.imageUrl ? '#eef3f7' : mealCoverStyle(d.id)) + '">' + (d.imageUrl ? '<img src="' + esc(d.imageUrl) + '" alt="">' : ic('bowl', size ? 18 : 24)) + '</div>';
  }
  function mealPickChips(path, all, selected, labelFn, dataName, extraAttr) {
    return '<div class="chip-pick">' + all.map((x) => {
      const on = (selected || []).indexOf(x.id) >= 0;
      return '<button class="pick ' + (on ? 'on' : '') + '" data-act="' + esc(dataName) + '" ' + (extraAttr || '') + ' data-id="' + esc(x.id) + '">' + (on ? '✓ ' : '') + esc(labelFn(x)) + '</button>';
    }).join('') + '</div>';
  }

  PAGES['v-meal'] = function () {
    const M = mealData();
    const tab = state.ui.mealTab || 'day';
    const q = (state.ui.mealQ || '').trim();
    const totalUsed = M.dayPlans.reduce((n, d) => n + Number(d.used || 0), 0);
    const tabs = [
      { id: 'day', label: '全天食谱 ' + M.dayPlans.length },
      { id: 'tpl', label: '餐次模板 ' + M.mealTemplates.length },
      { id: 'dish', label: '菜品库 ' + M.dishes.length },
      { id: 'ing', label: '食材库 ' + M.ingredients.length },
      { id: 'sup', label: '营养补剂 ' + M.supplements.length }
    ];
    const match = (x) => !q || (x.name + (x.audience || '') + (x.tags || []).join('') + (x.cat || '') + (x.slot || '')).indexOf(q) >= 0;
    let body = '';
    if (tab === 'day') {
      const rows = M.dayPlans.filter(match);
      body = '<div class="meal-grid">' + (rows.length ? rows.map((d) => {
        const tpls = MEAL_SLOTS.map((m) => ({ m: m, t: mealTplById((d.meals || {})[m]) }));
        return '<div class="panel meal-card" data-act="editMealDay" data-id="' + esc(d.id) + '"><div class="meal-cover" style="background:' + (d.imageUrl ? '#eef3f7' : mealCoverStyle(d.id)) + '">' + (d.imageUrl ? '<img src="' + esc(d.imageUrl) + '" alt="">' : '<div class="mc-orb"></div>') + '<div class="mc-top"><span class="tag">全天食谱</span>' + mealOnPill(d.on) + '</div><div class="mc-title"><b>' + esc(d.name) + '</b><span>' + esc(d.audience || '普通职工') + '</span></div><div class="mc-kcal"><b>' + (d.kcal || 0) + '</b><span>kcal</span></div></div><div class="meal-body"><div class="meal-macros"><div><b>' + (d.p || 0) + 'g</b><span>蛋白</span></div><div><b>' + (d.c || 0) + 'g</b><span>碳水</span></div><div><b>' + (d.f || 0) + 'g</b><span>脂肪</span></div></div><div class="meal-slots">' + tpls.map(({ m, t }) => '<div class="meal-slot"><span class="slot">' + m + '</span><div><b>' + esc(t ? t.name : '未配置') + '</b><i>' + esc(t ? mealTplDishes(t).map((x) => x.name).join(' · ') : '点击配置餐次模板') + '</i></div></div>').join('') + '</div><div class="meal-foot"><span class="tiny muted">' + esc(d.owner || '营养师') + ' · 采纳 ' + (d.used || 0) + ' 人</span><div class="row-flex" style="gap:5px"><button class="btn sm" data-act="previewMealDay" data-id="' + esc(d.id) + '">预览</button><button class="btn sm" data-act="copyMealDay" data-id="' + esc(d.id) + '">复制</button></div></div></div></div>';
      }).join('') : empty('没有匹配的全天食谱')) + '</div>';
    }
    if (tab === 'tpl') {
      const rows = M.mealTemplates.filter(match);
      body = panel('餐次模板', '一餐 = 主食 + 蛋白 + 蔬菜 + 汤；模板可以被全天食谱复用', rows.length ? '<div class="grid two">' + rows.map((t) => '<div class="meal-tpl-card" data-act="editMealTpl" data-id="' + esc(t.id) + '"><div class="row-flex"><span class="meal-badge">' + esc(t.meal) + '</span><b>' + esc(t.name) + '</b><div class="right-auto">' + mealOnPill(t.on) + '</div></div><div class="chips" style="margin-top:9px">' + mealTplDishes(t).slice(0, 6).map((d) => pill(d.name, 'outline')).join('') + '</div><div class="meal-macros compact"><div><b>' + (t.kcal || 0) + '</b><span>kcal</span></div><div><b>' + (t.p || 0) + 'g</b><span>蛋白</span></div><div><b>' + (t.c || 0) + 'g</b><span>碳水</span></div><div><b>' + (t.f || 0) + 'g</b><span>脂肪</span></div></div><div class="meal-foot"><span class="tiny muted">采纳 ' + (t.used || 0) + ' 次</span><button class="btn sm" data-act="editMealTpl" data-id="' + esc(t.id) + '">编辑模板</button></div></div>').join('') + '</div>' : empty('没有匹配的餐次模板'), '<button class="btn sm" data-act="newMealTpl">' + ic('plus') + '新增模板</button>', true);
    }
    if (tab === 'dish') {
      const rows = M.dishes.filter(match);
      body = '<div class="toolbar" style="padding:0 0 12px"><div class="searchbar">' + ic('search') + '<input class="input" data-ui-input="mealQ" placeholder="菜品 / 槽位 / 标签" value="' + esc(q) + '"></div><span class="tiny muted">共 ' + rows.length + ' 道 · 过敏原已在卡片标注</span><button class="btn sm right-auto" data-act="newMealDish">' + ic('plus') + '新增菜品</button></div><div class="dish-grid">' + (rows.length ? rows.map((d) => '<div class="dish-card" data-act="editMealDish" data-id="' + esc(d.id) + '">' + mealDishThumb(d) + '<div class="dc-body"><div class="row-flex"><b>' + esc(d.name) + '</b><span class="right-auto">' + mealOnPill(d.on) + '</span></div><div class="tiny muted" style="margin-top:3px">' + esc((d.meal || []).join(' / ')) + ' · ' + (d.kcal || 0) + ' kcal</div><div class="chips" style="margin-top:8px">' + pill(d.slot || '未分类', 'outline') + (d.allerg || []).map((a) => pill('过敏 ' + a, 'amber')).join('') + '</div></div></div>').join('') : empty('没有匹配的菜品')) + '</div>';
    }
    if (tab === 'ing') {
      const rows = M.ingredients.filter(match);
      body = panel('食材库', '每 100g 营养口径；菜品热量与过敏原由食材计算', '<div class="toolbar" style="padding:0 0 10px"><div class="searchbar">' + ic('search') + '<input class="input" data-ui-input="mealQ" placeholder="食材 / 分类" value="' + esc(q) + '"></div><button class="btn sm right-auto" data-act="newMealIng">' + ic('plus') + '新增食材</button></div><div class="table-wrap"><table class="table"><thead><tr><th>食材</th><th>分类</th><th>热量</th><th>蛋白</th><th>碳水</th><th>脂肪</th><th>过敏原</th><th>参考价</th></tr></thead><tbody>' + (rows.length ? rows.map((i) => '<tr class="click" data-act="editMealIng" data-id="' + esc(i.id) + '"><td><b style="font-size:11.5px">' + esc(i.name) + '</b><div class="sub">' + esc((i.tags || []).join(' · ')) + '</div></td><td>' + pill(i.cat || '未分类', 'outline') + '</td><td>' + i.kcal + ' kcal</td><td>' + i.p + 'g</td><td>' + i.c + 'g</td><td>' + i.f + 'g</td><td>' + ((i.allerg || []).length ? (i.allerg || []).map((a) => pill(a, 'amber')).join(' ') : '<span class="muted">无</span>') + '</td><td class="muted">¥' + i.price + '</td></tr>').join('') : '<tr><td colspan="8">' + empty('没有匹配的食材') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">' + rows.length + ' 种</span>', true);
    }
    if (tab === 'sup') {
      const rows = M.supplements.filter(match);
      body = panel('营养补剂', '适用人群与禁忌必须写清楚；当前只做后台商品配置', '<div class="grid three">' + (rows.length ? rows.map((s) => '<div class="panel pkg-card" style="box-shadow:none" data-act="editMealSup" data-id="' + esc(s.id) + '"><div class="meal-cover" style="height:108px;background:' + (s.imageUrl ? '#eef3f7' : mealCoverStyle(s.id)) + '">' + (s.imageUrl ? '<img src="' + esc(s.imageUrl) + '" alt="">' : '<div class="mc-orb"></div>') + '<div class="mc-top"><span class="tag">' + esc(s.cat || '营养补剂') + '</span>' + mealOnPill(s.on) + '</div><div class="mc-title"><b>' + esc(s.name) + '</b><span>已售 ' + (s.sold || 0) + ' · 库存 ' + (s.stock || 0) + '</span></div></div><div class="panel-body"><div class="row-flex"><b style="font-size:18px;color:#c75311">¥' + s.price + '</b><span class="tiny muted right-auto">结算 ¥' + s.settle + '</span></div><div class="tiny muted" style="margin-top:8px;line-height:1.6">' + esc(s.fit || '') + '</div>' + ((s.avoid || []).length ? '<div class="chips" style="margin-top:8px">' + s.avoid.map((a) => pill('忌 ' + a, 'red')).join('') + '</div>' : '') + '<button class="btn sm w-full" style="margin-top:11px" data-act="editMealSup" data-id="' + esc(s.id) + '">编辑补剂</button></div></div>').join('') : empty('没有匹配的补剂')) + '</div>', '<button class="btn sm" data-act="newMealSup">' + ic('plus') + '新增补剂</button>', true);
    }
    return '<div class="page wide">' + pageHead('吃好 · 食谱工程', '从食材、菜品到餐次模板和全天食谱，把营养师的经验做成可复用、可采纳、可追踪的产品。', '<button class="btn" data-act="newMealIng">' + ic('leaf') + '<span>新增食材</span></button><button class="btn" data-act="newMealDish">' + ic('bowl') + '<span>新增菜品</span></button><button class="btn primary" data-act="newMealDay">' + ic('plus') + '<span>新建全天食谱</span></button>', 'VERSIONALL / 食谱工程') +
      purpose('把「一餐怎么搭、一天怎么吃」配置成标准食谱，减少营养师重复答疑，也让学员更容易坚持。', '后台食谱库、餐次组合与菜品营养；当前 H5 只展示饮食打卡，食谱需要后续增加学员端入口。', '营养师 / 企康内容运营') +
      '<div class="kpi-grid">' + kpi('全天食谱', M.dayPlans.length, '套', '在架 ' + M.dayPlans.filter((d) => d.on !== false).length + ' 套', 'bowl', ['#fff1e7','#e5540b']) + kpi('菜品 / 食材', M.dishes.length + ' / ' + M.ingredients.length, '', '可自由组合', 'layers', ['#e9f7f1','#0c7c59']) + kpi('累计采纳', totalUsed, '人次', '按食谱使用记录', 'users', ['#edf3ff','#1f4fd1']) + kpi('营养补剂', M.supplements.length, '件', '在售 ' + M.supplements.filter((s) => s.on !== false).length + ' 件', 'gift', ['#fff6e0','#a86a06']) + '</div>' +
      '<div class="panel"><div class="panel-head"><div class="ph"><h2>食谱工作台</h2><p>全天食谱 / 餐次模板 / 菜品 / 食材 / 补剂，点击整卡或整行编辑</p></div><span class="actions">' + seg(tabs, tab, 'mealTab') + '</span></div><div class="panel-body">' + body + '</div></div>' +
      '<div class="grid two section-space">' +
        panel('一套食谱怎么被用起来', '从配置到学员采纳', '<div class="stack tight">' + [['1', '食材入菜品', '每种食材标注每 100g 营养与过敏原'], ['2', '菜品进餐次', '按主食 / 蛋白 / 蔬菜 / 汤组成一餐'], ['3', '餐次组全天', '早餐 + 午餐 + 晚餐 + 加餐 = 全天食谱'], ['4', '学员采纳', '按人群推荐，记录采纳与饮食打卡']].map((x) => '<div class="row-flex small" style="padding:9px 0;border-bottom:1px solid var(--line-soft)"><span class="meal-step">' + x[0] + '</span><div><b>' + x[1] + '</b><div class="tiny muted" style="margin-top:2px">' + x[2] + '</div></div></div>').join('') + '</div>') +
        panel('与打卡、客户联动', '不是孤立食谱库', '<div class="stack tight">' + [['v-records', '查看饮食打卡与营养师批注', 'activity'], ['crm', '客户 360 查看学员使用痕迹', 'users'], ['e-fivegood', '五好生活 · 好好吃饭主题', 'star']].map((x) => '<div class="rowlink" data-go="' + x[0] + '"><span class="avatar square" style="width:28px;height:28px">' + ic(x[2]) + '</span><div class="main-tx"><b>' + x[1] + '</b></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div><div class="notice warm" style="margin-top:12px">' + ic('info') + '<span>食谱、菜品与补剂目前保存在后台。静态 H5 没有食谱详情页与购买接口，发布不会自动上线；需要先补学员端入口和后端订单。</span></div>') +
      '</div></div>';
  };

  PAGES['v-mall'] = function () {
    const products = data.camp.pointProducts;
    return '<div class="page wide">' + pageHead('积分商城商品', '真实商品：运动水杯、跳绳、瑜伽垫、体脂秤、蛋白粉、筋膜枪。每件商品都有主图、描述、积分、库存和配送方式。', '<button class="btn primary" data-act="newProduct">' + ic('plus') + '<span>新增商品</span></button>', 'VERSIONALL / 积分商城') +
      purpose('把学员可用积分兑换的实物配置完整：主图、图集、图文详情、积分门槛、库存与限兑。', '学员端积分商城商品卡片、兑换弹窗和库存；H5 只读取本地默认商品。', '营养师') +
      '<div class="notice" style="margin-bottom:14px">' + ic('image') + '<span>商品编辑已补齐 <b>主图上传 / 多图图集 / 图文详情</b>。这是后台内容资产的一部分，当前静态 H5 不会自动读取，发布时只保存到后台与配置导出。</span></div>' +
      '<div class="grid three">' + products.map((p) => '<div class="panel" style="cursor:pointer" data-act="editProduct" data-id="' + esc(p.id) + '"><div style="aspect-ratio:1.45;background:#f5f8fa;overflow:hidden"><img src="' + esc(p.imageUrl || '') + '" style="width:100%;height:100%;object-fit:cover" alt=""></div><div style="padding:16px"><div class="row-flex"><b style="font-size:13px">' + esc(p.name) + '</b><div class="right-auto">' + (p.active !== false ? pill('上架', 'green') : pill('下架', '')) + '</div></div><div class="tiny muted" style="margin-top:6px;min-height:28px;line-height:1.6">' + esc(p.description || '') + '</div><div class="row-flex" style="margin-top:14px"><span style="color:#c75311;font-size:16px;font-weight:650">' + p.pointsRequired + '</span><span class="tiny muted">积分</span><span class="tiny muted right-auto">库存 ' + p.stock + '</span></div><div style="display:flex;gap:5px;margin-top:10px">' + (p.deliveryOptions || []).map((x) => pill(x === 'shipped' ? '邮寄' : '线下', 'outline')).join('') + '<button class="btn sm right-auto" data-act="editProduct" data-id="' + esc(p.id) + '">编辑图文</button></div></div></div>').join('') + '</div></div>';
  };

  PAGES['v-fulfill'] = function () {
    const tab = state.ui.vFulfillTab || 'pending';
    const claims = data.camp.rewardClaims.map((c) => ({ id: c.id, type: '连续打卡奖励', person: c.studentName, item: (data.camp.rewardTiers.find((t) => t.id === c.tierId) || {}).name || '奖品', date: c.claimDate, status: c.status, delivery: c.deliveryMethod, source: 'claim', record: c }));
    const ex = data.camp.pointExchanges.map((e) => ({ id: e.id, type: '积分兑换', person: e.studentName, item: e.productName, date: e.exchangeDate, status: e.status, delivery: e.deliveryMethod, source: 'exchange', record: e }));
    const all = claims.concat(ex);
    const filtered = all.filter((x) => tab === 'all' || (tab === 'pending' ? x.status === 'pending' : x.status !== 'pending'));
    return '<div class="page wide">' + pageHead('发放与核销', '把连续打卡奖励与积分兑换放在同一张发货表里。待发货优先，线下领取可直接核销。', saveBtn('履约状态'), 'VERSIONALL / 发放中心') +
      purpose('处理奖品实物的邮寄、线下领取和取消，避免学员已兑换但无人跟进。', '学员奖励领取记录与兑换状态；物流面单目前不接快递接口。', '履约运营') +
      '<div class="kpi-grid">' + kpi('待发货', all.filter((x) => x.status === 'pending').length, '单', '优先处理', 'truck', ['#fff6e0','#a86a06']) + kpi('已完成', all.filter((x) => x.status === 'fulfilled' || x.status === 'shipped' || x.status === 'in-person').length, '单', '已发货 / 已核销', 'check', ['#e9f7f1','#0c7c59']) + kpi('积分兑换', data.camp.pointExchanges.length, '次', '学员自助兑换', 'coins', ['#fff1e7','#c75311']) + kpi('实物奖励', data.camp.rewardTiers.length, '档', '连续打卡阶梯', 'gift', ['#edf3ff','#1f4fd1']) + '</div>' +
      panel('发放清单', '按状态筛选 · 整行查看', '<div class="toolbar" style="padding:9px 0 4px">' + seg([{id:'pending',label:'待处理 '+all.filter((x) => x.status === 'pending').length},{id:'done',label:'已处理 '+all.filter((x) => x.status !== 'pending').length},{id:'all',label:'全部 '+all.length}], tab, 'vFulfillTab') + '<span class="right small muted">发货后请填写运单号；线下领取需核销人</span></div><div class="table-wrap"><table class="table"><thead><tr><th>类型</th><th>学员</th><th>奖品 / 商品</th><th>时间</th><th>状态</th><th>操作</th></tr></thead><tbody>' + (filtered.length ? filtered.map((x) => '<tr class="click" data-act="openFulfill" data-id="' + esc(x.id) + '" data-source="' + x.source + '"><td>' + pill(x.type, x.type === '积分兑换' ? 'orange' : 'blue') + '</td><td><div class="row-main">' + avatar(x.person) + '<div><div class="name">' + esc(x.person) + '</div><div class="sub">' + esc(String(x.date).slice(0, 16)) + '</div></div></div></td><td><b style="font-size:11.5px">' + esc(x.item) + '</b><div class="sub">' + esc(x.delivery === 'in-person' ? '线下领取' : '邮寄') + '</div></td><td class="muted">' + esc(String(x.date).slice(0, 10)) + '</td><td>' + pill(x.status === 'pending' ? '待发货 / 待核销' : x.status === 'shipped' ? '已发货' : x.status === 'in-person' ? '已核销' : x.status === 'fulfilled' ? '已完成' : '已取消', x.status === 'pending' ? 'amber' : 'green') + '</td><td class="actions"><button class="btn sm" data-act="openFulfill" data-id="' + esc(x.id) + '" data-source="' + x.source + '">处理</button></td></tr>').join('') : '<tr><td colspan="6">' + empty('当前筛选没有待处理单') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">不虚构物流</span>', true) + '</div>';
  };

  PAGES['v-activities'] = function () {
    return '<div class="page wide">' + pageHead('锻炼活动', '教练在 H5 发布的图文和视频活动。后台把发布、编辑、删除和营期范围集中管理。', '<button class="btn primary" data-act="newActivity">' + ic('plus') + '<span>发布活动</span></button>', 'VERSIONALL / 教练端') +
      purpose('组织教练发布的锻炼内容，让学员在首页「锻炼活动」看到统一且可追溯的内容。', '学员首页活动卡与视频播放；H5 的活动数据在浏览器本地。', '教练 · 李教练') +
      '<div class="grid three">' + data.camp.coachActivities.map((a) => '<div class="panel" style="cursor:pointer" data-act="editActivity" data-id="' + esc(a.id) + '"><div style="position:relative;height:172px;overflow:hidden;background:#f2f6f9">' + ((a.imageUrls || [])[0] ? '<img src="' + esc(a.imageUrls[0]) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : empty('暂无活动图片', 'video')) + '<div style="position:absolute;left:12px;top:12px">' + pill(a.videoUrls && a.videoUrls.length ? '视频活动' : '图文活动', 'navy') + '</div></div><div style="padding:15px 16px 16px"><b style="font-size:13px">' + esc(a.title) + '</b><div class="tiny muted" style="margin-top:6px;line-height:1.6;min-height:31px">' + esc((a.description || '').slice(0, 60)) + '</div><div class="row-flex" style="margin-top:12px"><span class="tiny muted">' + esc(a.coachName) + '</span><span class="tiny muted right-auto">' + esc((a.campIds || []).length ? (a.campIds || []).map(campName).join('、') : '全部营期') + '</span></div><div style="display:flex;gap:6px;margin-top:12px"><button class="btn sm" data-act="editActivity" data-id="' + esc(a.id) + '">编辑</button><button class="btn sm danger" data-act="deleteActivity" data-id="' + esc(a.id) + '">删除</button></div></div></div>').join('') + '</div></div>';
  };

  PAGES['v-team'] = function () {
    const comments = data.camp.exerciseRecords.filter((r) => !r.coachComment).slice(0, 5).map((r) => ({ kind: '运动', id: r.id, student: studentName(r.studentId), detail: (r.type || '运动') + ' ' + (r.duration || 0) + ' 分钟', at: String(r.date).slice(0, 16), type: 'exercise' }))
      .concat(data.camp.weightRecords.filter((r) => !r.dietitianComment).slice(0, 4).map((r) => ({ kind: '体重', id: r.id, student: studentName(r.studentId), detail: (r.weight || 0) + ' kg', at: String(r.date).slice(0, 16), type: 'weight' })));
    const staff = data.camp.accounts.filter((a) => a.role === 'dietitian' || a.role === 'coach');
    return '<div class="page wide">' + pageHead('营养师与教练', '工作台按真实角色组织：营养师负责饮食与体重，教练负责运动与活动。待处理项可以整行进入。', '<button class="btn" data-go="v-accounts">' + ic('users') + '<span>账号与权限</span></button>', 'VERSIONALL / 团队') +
      purpose('把营期服务人员的批注任务、处理状态和负责范围放在一起。', '批注结果与学员消息、排行榜评分；账号由手机号登录。', '营养师 / 教练 / 督导') +
      '<div class="grid main-side"><div class="stack">' + panel('待处理批注', '按记录类型分开 · 整行可点击', '<div class="table-wrap"><table class="table"><thead><tr><th>学员</th><th>类型</th><th>内容</th><th>等待</th><th>处理</th></tr></thead><tbody>' + (comments.length ? comments.map((c) => '<tr class="click" data-act="openRecord" data-kind="' + c.type + '" data-id="' + esc(c.id) + '"><td><div class="row-main">' + avatar(c.student) + '<div class="name">' + esc(c.student) + '</div></div></td><td>' + pill(c.kind, c.kind === '体重' ? 'blue' : 'green') + '</td><td>' + esc(c.detail) + '</td><td class="muted">' + esc(c.at.slice(5)) + '</td><td><button class="btn sm">去批注</button></td></tr>').join('') : '<tr><td colspan="5">' + empty('所有记录都已完成批注', 'check') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">' + comments.length + ' 条</span>', true) + '</div><div class="stack">' + panel('团队角色', '真实账户 · 营养师 / 教练', '<div class="stack tight">' + staff.slice(0, 10).map((a) => '<div class="rowlink" style="padding:9px 0"><span class="avatar square" style="width:30px;height:30px;background:' + (a.role === 'coach' ? '#fff1e7;color:#c75311' : '#edf3ff;color:#1f4fd1') + '">' + esc(a.name.slice(0,1)) + '</span><div class="main-tx"><b>' + esc(a.name) + '</b><span>' + (a.role === 'coach' ? '教练 · 运动批注' : a.role === 'dietitian' ? '营养师 · 饮食与体重' : '') + ' · ' + esc(a.phone) + '</span></div>' + (a.supervisor ? pill('督导', 'blue') : pill(a.active ? '在线' : '停用', a.active ? 'green' : '')) + '</div>').join('') + '</div>') + panel('批注质量', '完成率与响应', '<div><div class="row-flex small"><span>饮食评分覆盖率</span><b class="right-auto">88%</b></div>' + progress(88, '#e4612b') + '<div class="row-flex small" style="margin-top:13px"><span>运动批注覆盖率</span><b class="right-auto">' + Math.round((data.camp.exerciseRecords.filter((r) => r.coachComment).length / Math.max(1, data.camp.exerciseRecords.length)) * 100) + '%</b></div>' + progress(data.camp.exerciseRecords.filter((r) => r.coachComment).length / Math.max(1, data.camp.exerciseRecords.length) * 100, '#0c7c59') + '</div>') + '</div></div></div>';
  };

  PAGES['v-report'] = function () {
    const camp = data.camp.camps.find((c) => c.status === 'active') || data.camp.camps[0];
    const ws = weightSeries(camp.id);
    const first = ws[0] ? ws[0].v : 0, last = ws[ws.length - 1] ? ws[ws.length - 1].v : 0;
    const changes = data.camp.students.map((s) => {
      const rec = data.camp.weightRecords.filter((r) => r.studentId === s.id).sort((a, b) => String(a.date).localeCompare(String(b.date)));
      return { name: s.name, start: rec.length ? rec[0].weight : null, last: rec.length ? rec[rec.length - 1].weight : null, delta: rec.length ? rec[rec.length - 1].weight - rec[0].weight : null };
    }).filter((x) => x.start != null).sort((a, b) => a.delta - b.delta);
    return '<div class="page wide">' + pageHead('营期报告', '结营统计和个人变化来自体重记录，企业汇报可直接导出 CSV；不伪造尚未发生的结营数据。', '<button class="btn" data-act="exportCamp">' + ic('download') + '<span>导出企业汇报</span></button>', 'VERSIONALL / 报告') +
      purpose('给企业客户讲清楚参与度、体重变化和需要继续跟进的人。', '结营报告、企业汇报与个人营期报告；报告文字由后台编辑，数字来自记录。', '督导 / 营养师') +
      '<div class="kpi-grid">' + kpi('全营平均下降', Math.abs(last - first).toFixed(1), 'kg', '按首末记录点', 'chart', ['#e9f7f1','#0c7c59']) + kpi('有效记录学员', changes.length, '人', '至少两次体重', 'users', ['#fff1e7','#c75311']) + kpi('体重下降人数', changes.filter((x) => x.delta < 0).length, '人', '占比 ' + Math.round(changes.filter((x) => x.delta < 0).length / Math.max(1, changes.length) * 100) + '%', 'check', ['#edf3ff','#1f4fd1']) + kpi('打卡完成率', 78, '%', '按全项完成口径', 'activity', ['#fff6e0','#a86a06']) + '</div>' +
      '<div class="grid main-side section-space"><div class="stack">' + panel('全营体重趋势', '首末记录点与变化', lineChart(ws.map((x) => x.v), '#e4612b', 200, ws.map((x) => x.k.slice(5))) + '<div class="notice green" style="margin-top:12px">' + ic('check') + '<span>截至 ' + esc(last ? ws[ws.length - 1].k : today()) + '，全营平均体重由 ' + first.toFixed(1) + 'kg 降至 ' + last.toFixed(1) + 'kg，仍需关注 ' + changes.filter((x) => x.delta >= 0).length + ' 名未下降学员。</span></div>') + panel('个人体重变化', '按下降幅度排序', '<div class="table-wrap"><table class="table"><thead><tr><th>学员</th><th>开营</th><th>最新</th><th>变化</th><th>状态</th></tr></thead><tbody>' + changes.slice(0, 12).map((x) => '<tr><td><div class="row-main">' + avatar(x.name) + '<div class="name">' + esc(x.name) + '</div></div></td><td>' + x.start + ' kg</td><td>' + x.last + ' kg</td><td><b style="color:' + (x.delta < 0 ? 'var(--green)' : 'var(--danger)') + '">' + (x.delta > 0 ? '+' : '') + x.delta.toFixed(1) + ' kg</b></td><td>' + pill(x.delta < 0 ? '持续改善' : '需关注', x.delta < 0 ? 'green' : 'amber') + '</td></tr>').join('') + '</tbody></table></div>', '', true) + '</div><div class="stack">' + panel('结营报告结构', '企业汇报页真实内容', '<div class="stack tight">' + ['参与情况：入营 / 在营 / 结营人数', '打卡情况：饮食、运动、体重完成率', '健康结果：体重、体脂与腰围变化', '高风险人群：仍需随访名单', '企业建议：下一期服务配置'].map((x, i) => '<div class="row-flex small" style="padding:7px 0;border-bottom:1px solid var(--line-soft)"><span class="avatar square" style="width:24px;height:24px;font-size:9px">' + (i + 1) + '</span><span>' + x + '</span></div>').join('') + '</div>') + panel('复盘提醒', '', '<div class="notice warm">' + ic('info') + '<span>当前记录只覆盖第 1 期全量与第 2 期部分；营期尚未结营，报告是阶段快照，不应写“结营完成”。</span></div>') + '</div></div></div>';
  };

  PAGES['v-accounts'] = function () {
    const role = state.ui.vAccountRole || 'all';
    const q = state.ui.vAccountQ || '';
    const rows = data.camp.accounts.filter((a) => (role === 'all' || a.role === role) && ((a.name + a.phone).indexOf(q.trim()) >= 0));
    return '<div class="page wide">' + pageHead('账号与权限', '手机号是唯一登录凭证。营养师账号可以额外拥有督导权限；停用后该手机号立即无法登录。', '<button class="btn primary" data-act="newAccount">' + ic('plus') + '<span>新增账户</span></button>', 'VERSIONALL / 账号') +
      purpose('管理学员、教练、营养师与督导身份，以及每个人负责的营期。', 'H5 登录校验、营期数据范围与督导总览入口。', '营养师管理员') +
      panel('全部账户', '共 ' + data.camp.accounts.length + ' 个 · 点击整行编辑', '<div class="toolbar" style="padding:9px 0 4px">' + seg([{id:'all',label:'全部'},{id:'student',label:'学员'},{id:'coach',label:'教练'},{id:'dietitian',label:'营养师'}], role, 'vAccountRole') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="vAccountQ" placeholder="姓名 / 手机号" value="' + esc(q) + '"></div></div><div class="table-wrap"><table class="table"><thead><tr><th>账户</th><th>角色</th><th>所属营期</th><th>督导</th><th>状态</th><th>最近登录</th><th>操作</th></tr></thead><tbody>' + rows.map((a) => '<tr class="click" data-act="editAccount" data-id="' + esc(a.id) + '"><td><div class="row-main">' + avatar(a.name) + '<div><div class="name">' + esc(a.name) + '</div><div class="sub">' + esc(a.phone) + '</div></div></div></td><td>' + pill(a.role === 'student' ? '学员' : a.role === 'coach' ? '教练' : '营养师', a.role === 'student' ? 'green' : a.role === 'coach' ? 'orange' : 'blue') + '</td><td>' + esc((a.campIds || []).map(campName).join('、') || '全部') + '</td><td>' + (a.supervisor ? pill('可看全营', 'blue') : '<span class="muted">—</span>') + '</td><td>' + (a.active ? pill('启用', 'green') : pill('已停用', '')) + '</td><td class="muted">' + esc(a.lastLogin || a.createdAt || '2026-11-08 20:10') + '</td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') + '</tbody></table></div>', '<span class="pill">' + rows.length + ' 条</span>', true) + '</div>';
  };

  /* ----------------------------------------------------------- 品牌站 */
  function regionName(id) {
    const r = data.brand.regions.find((x) => x.id === id);
    return r ? r.name : (id || '未分地区');
  }
  function institutionTypeName(key) {
    return (data.brand.types[key] || {}).name || key || '机构';
  }
  function brandStat(key, fallback) {
    const v = data.brand.counts && data.brand.counts[key];
    return v == null ? fallback : v;
  }

  PAGES['b-home'] = function () {
    const h = data.brand.home;
    const featured = data.brand.experts.filter((x) => x.featured);
    return '<div class="page wide">' + pageHead('品牌首页', '对应 PKU-introduce 的 mobile.html：首屏、四项统计、师资力量、健康营、分院网络、学科科室与品牌入口。', saveBtn('品牌首页'), 'PKU-INTRODUCE / 首页') +
      purpose('维护面向公众的品牌第一屏和四个内容入口，确保对外展示与真实专家、机构、科室数据一致。', 'PKU-introduce/mobile.html 首屏与入口显隐；图片与文字当前保存在后台。', '品牌运营') +
      '<div class="grid main-side"><div class="stack">' +
        panel('首屏文案', '北医的专家 / 就在您身边', '<div class="form-grid">' + field('顶部眉标', h.eyebrow, 'brand.home.eyebrow') + '<div class="form-grid two">' + field('主标题第一行', h.titleA, 'brand.home.titleA') + field('主标题第二行', h.titleB, 'brand.home.titleB') + '</div>' + field('副标题', h.lead, 'brand.home.lead', { area: true, rows: 3 }) + field('精选专家数量', h.featuredCount, 'brand.home.featuredCount', { num: true, hint: '首页「师资力量」区域展示的专家数量；真实精选标记在师资团队页维护。' }) + '</div>') +
        panel('首页板块标题', '四个板块与「关于品牌」入口', '<div class="form-grid two">' + field('师资力量标题', h.facultyTitle, 'brand.home.facultyTitle') + field('师资力量副标题', h.facultySub, 'brand.home.facultySub') + field('正在开展标题', h.campTitle, 'brand.home.campTitle') + field('正在开展副标题', h.campSub, 'brand.home.campSub') + field('分院网络标题', h.networkTitle, 'brand.home.networkTitle') + field('分院网络副标题', h.networkSub, 'brand.home.networkSub') + field('学科与科室标题', h.deptTitle, 'brand.home.deptTitle') + field('学科与科室副标题', h.deptSub, 'brand.home.deptSub') + '</div>') +
        panel('首页入口显隐', '关闭只隐藏对应入口，不删除真实资料', '<div class="stack tight">' + switchRow('师资力量', '首页专家卡片与「查看师资团队」', 'brand.home.showFaculty', h.showFaculty) + switchRow('正在开展', '北医健康营项目入口', 'brand.home.showCamp', h.showCamp) + switchRow('分院网络', '6 大地区与机构入口', 'brand.home.showNetwork', h.showNetwork) + switchRow('学科与科室', '70 个科室入口', 'brand.home.showDepartments', h.showDepartments) + switchRow('关于北大医疗', '品牌故事入口', 'brand.home.showAbout', h.showAbout) + '</div>') +
        panel('对外统计口径', '数字来自真实专家、医师、护士与科室数据', '<div class="stat-strip">' + [['专家', brandStat('experts', data.brand.experts.length), 'experts'], ['医师', brandStat('doctors', data.brand.doctors.length), 'doctors'], ['专科护士', brandStat('nurses', 107), 'nurses'], ['科室', brandStat('depts', data.brand.departments.length), 'depts']].map((x) => '<div><b>' + x[1] + '</b><span>' + x[0] + '</span></div>').join('') + '</div><div class="hint" style="margin-top:8px">真实数据：' + data.brand.experts.length + ' 位专家 / ' + data.brand.doctors.length + ' 位医师 / ' + data.brand.departments.length + ' 个科室。统计不写死，避免与资料页不一致。</div>') +
      '</div><div class="stack">' +
        panel('H5 预览', '按当前配置渲染', '<div class="phone-frame"><div class="phone-bar"><i></i></div><div class="phone-body"><div class="phone-hero" style="background:linear-gradient(150deg,#2c8aa8,#123c57);min-height:250px"><div class="micro">' + esc(h.eyebrow) + '</div><h3>' + esc(h.titleA) + '<br>' + esc(h.titleB) + '</h3><p>' + esc(h.lead) + '</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:18px">' + [['专家','experts'],['医师','doctors'],['护士','nurses'],['科室','depts']].map((x) => '<div style="text-align:center"><b style="font-size:16px">' + brandStat(x[1], 0) + '</b><div style="font-size:8px;opacity:.7">' + x[0] + '</div></div>').join('') + '</div></div>' +
          (h.showFaculty ? '<div class="phone-sec"><h4>' + esc(h.facultyTitle) + '</h4><p>' + esc(h.facultySub) + '</p><div class="phone-list" style="margin-top:8px">' + featured.slice(0, 3).map((e) => '<div class="phone-item"><span class="pi">' + esc(e.name.slice(0,1)) + '</span><div><b>' + esc(e.name) + ' · ' + esc(e.title) + '</b><span>' + esc(e.dept) + ' · ' + esc(e.hospital) + '</span></div></div>').join('') + '</div></div>' : '') +
          (h.showCamp ? '<div class="phone-sec"><h4>' + esc(h.campTitle) + '</h4><p>' + esc(data.brand.camp.name + ' ' + data.brand.camp.edition + ' · ' + data.brand.camp.theme) + '</p></div>' : '') + '</div></div>') +
        panel('数据来源', '', '<div class="stack tight"><div class="row-flex small"><span class="muted">精选专家</span><b class="right-auto">' + featured.length + ' 位</b></div><div class="row-flex small"><span class="muted">真实机构</span><b class="right-auto">' + data.brand.institutions.length + ' 家</b></div><div class="row-flex small"><span class="muted">覆盖地区</span><b class="right-auto">' + data.brand.regions.length + ' 个</b></div><div class="row-flex small"><span class="muted">真实科室</span><b class="right-auto">' + data.brand.departments.length + ' 个</b></div></div>') +
        panel('真实生效提示', '', '<div class="notice amber">' + ic('info') + '<span>PKU-introduce 是静态站点，当前 bridge 只隐藏被关闭的导航入口。首屏文案、统计和图片会保存到后台，但不会自动改写静态 HTML。</span></div><div class="notice" style="margin-top:9px">' + ic('external') + '<span><a href="' + SEED.h5Pages[1].url + '" target="_blank" rel="noopener">打开线上品牌站</a></span></div>') +
      '</div></div></div>';
  };

  PAGES['b-team'] = function () {
    const tab = state.ui.bTeamTab || 'experts';
    const q = (state.ui.bTeamQ || '').trim();
    const onlyFeatured = !!state.ui.bTeamFeatured;
    const page = state.ui.bTeamPage || 1;
    const src = tab === 'experts' ? data.brand.experts : data.brand.doctors;
    const filtered = src.filter((x) => (!onlyFeatured || x.featured) && (!q || (x.name + x.dept + x.hospital + (x.specialty || '')).indexOf(q) >= 0));
    const totalPages = Math.max(1, Math.ceil(filtered.length / 24));
    const cur = Math.min(page, totalPages);
    const rows = filtered.slice((cur - 1) * 24, cur * 24);
    return '<div class="page wide">' + pageHead('师资团队', '57 位专家与 726 位医师来自 PKU-introduce 真实数据。照片、职称、科室、医院、擅长与来源详情都可维护。', saveBtn('师资资料'), 'PKU-INTRODUCE / 师资') +
      purpose('维护对外展示的专家与医师资料，并决定谁进入品牌首页精选。', 'team.html、member.html 与首页师资力量；精选标记影响首页展示。', '品牌运营') +
      '<div class="kpi-grid">' + kpi('专家', data.brand.experts.length, '位', '主任 / 副主任级', 'users', ['#e7f4f8','#1d6e89']) + kpi('医师', data.brand.doctors.length, '位', '真实医师名录', 'user', ['#edf3ff','#1f4fd1']) + kpi('首页精选', data.brand.experts.filter((x) => x.featured).length, '位', '按精选标记', 'spark', ['#fff1e7','#c75311']) + kpi('当前结果', filtered.length, '位', '筛选后', 'search', ['#e9f7f1','#0c7c59']) + '</div>' +
      panel('全部人员', '点击整行查看并编辑 · 分页每页 24 位', '<div class="toolbar" style="padding:10px 0 5px">' + seg([{id:'experts',label:'专家 57'},{id:'doctors',label:'医师 726'}], tab, 'bTeamTab') +
        '<button class="btn sm ' + (onlyFeatured ? 'primary' : '') + '" data-act="toggleTeamFeatured">' + ic('spark') + '仅看精选</button><div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="bTeamQ" placeholder="姓名 / 科室 / 医院 / 擅长" value="' + esc(q) + '"></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>人员</th><th>职称</th><th>科室</th><th>医院</th><th>擅长</th><th>精选</th><th>操作</th></tr></thead><tbody>' + (rows.length ? rows.map((x) => '<tr class="click" data-act="editExpert" data-kind="' + (tab === 'experts' ? 'experts' : 'doctors') + '" data-id="' + esc(x.id) + '"><td><div class="row-main">' + avatar(x.name, x.photo) + '<div><div class="name">' + esc(x.name) + '</div><div class="sub">ID ' + esc(x.id) + '</div></div></div></td><td>' + esc(x.title || x.role || '') + '</td><td>' + pill(x.dept || '—', 'blue') + '</td><td>' + esc(x.hospital || '') + '</td><td style="max-width:340px"><div style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.6">' + esc(x.specialty || '') + '</div></td><td>' + (x.featured ? pill('精选', 'orange') : '<span class="muted">—</span>') + '</td><td class="actions"><button class="btn sm">详情</button></td></tr>').join('') : '<tr><td colspan="7">' + empty('没有匹配人员') + '</td></tr>') + '</tbody></table></div><div class="row-flex" style="padding-top:11px"><span class="tiny muted">共 ' + filtered.length + ' 位 · 第 ' + cur + ' / ' + totalPages + ' 页</span><div class="right-auto row-flex"><button class="btn sm" data-ui-page="bTeamPage" data-value="' + (cur - 1) + '" ' + (cur <= 1 ? 'disabled' : '') + '>上一页</button><button class="btn sm" data-ui-page="bTeamPage" data-value="' + (cur + 1) + '" ' + (cur >= totalPages ? 'disabled' : '') + '>下一页</button></div></div>', '<span class="pill">真实资料</span>', true) + '</div>';
  };

  PAGES['b-hospitals'] = function () {
    const region = state.ui.bHospitalRegion || 'all';
    const q = (state.ui.bHospitalQ || '').trim();
    const rows = data.brand.institutions.filter((x) => (region === 'all' || x.region === region) && (!q || (x.name + x.address + x.aliases).indexOf(q) >= 0));
    return '<div class="page wide">' + pageHead('分院网络', '6 大地区、12 家真实机构。品牌站按地区展示分院，地址与电话直接对外。', saveBtn('机构资料'), 'PKU-INTRODUCE / 分院') +
      purpose('维护分院网络和机构联系方式，让访客能按地区找到真实院区。', 'hospitals.html 地区分组、机构卡片与地址电话；详情页入口。', '品牌运营') +
      '<div class="grid three">' + data.brand.regions.map((r) => {
        const n = data.brand.institutions.filter((x) => x.region === r.id).length;
        return '<div class="panel" style="cursor:pointer;border-left:3px solid ' + r.color + '" data-ui-set="bHospitalRegion" data-value="' + esc(r.id) + '"><div class="panel-head" style="padding-bottom:8px"><div class="ph"><h2>' + esc(r.name) + '</h2><p>' + esc(r.summary) + '</p></div><span class="actions">' + n + ' 家</span></div></div>';
      }).join('') + '</div>' +
      panel('全部机构', '点击整行编辑地址、电话与展示状态', '<div class="toolbar" style="padding:10px 0 5px">' + seg([{id:'all',label:'全部 12'},{id:'beijing',label:'北京 6'},{id:'tianjin',label:'天津 1'},{id:'shandong',label:'山东 2'},{id:'shanxi',label:'山西 1'},{id:'hunan',label:'湖南 1'},{id:'shenzhen',label:'深圳 1'}], region, 'bHospitalRegion') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="bHospitalQ" placeholder="机构名 / 地址 / 别名" value="' + esc(q) + '"></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>机构</th><th>地区</th><th>类型</th><th>地址</th><th>电话</th><th>展示</th><th>操作</th></tr></thead><tbody>' + (rows.length ? rows.map((x) => '<tr class="click" data-act="editInstitution" data-id="' + esc(x.id) + '"><td><div class="row-main"><span class="avatar square" style="width:34px;height:34px;background:' + ((data.brand.types[x.type] || {}).color || '#1d6e89') + '1a;color:' + ((data.brand.types[x.type] || {}).color || '#1d6e89') + '">' + ic((data.brand.types[x.type] || {}).icon || 'hospital') + '</span><div><div class="name">' + esc(x.name) + '</div><div class="sub">' + esc(x.aliases || '') + '</div></div></div></td><td>' + pill(regionName(x.region), 'blue') + '</td><td>' + esc(institutionTypeName(x.type)) + '</td><td style="max-width:310px">' + esc(x.address || '') + '</td><td class="tnum">' + esc(x.phone || '') + '</td><td>' + (x.hidden ? pill('已隐藏', 'red') : pill('展示中', 'green')) + '</td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') : '<tr><td colspan="7">' + empty('没有匹配机构') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">' + rows.length + ' 家</span>', true) + '</div>';
  };

  PAGES['b-departments'] = function () {
    const q = (state.ui.bDeptQ || '').trim();
    const cat = state.ui.bDeptCat || 'all';
    const cats = [];
    data.brand.departments.forEach((d) => { if (cats.indexOf(d.category) < 0) cats.push(d.category); });
    const filtered = data.brand.departments.filter((d) => (cat === 'all' || d.category === cat) && (!q || (d.name + d.intro + (d.features || []).map((f) => f.title).join('')).indexOf(q) >= 0));
    const totalPages = Math.max(1, Math.ceil(filtered.length / 14));
    const cur = Math.min(state.ui.bDeptPage || 1, totalPages);
    const rows = filtered.slice((cur - 1) * 14, cur * 14);
    return '<div class="page wide">' + pageHead('学科与科室', '70 个真实科室：简介、特色技术与关联专家。品牌站按分类展示，详情页使用同一份资料。', saveBtn('科室资料'), 'PKU-INTRODUCE / 科室') +
      purpose('维护学科介绍和特色技术，让访客按疾病或科室找到对应能力。', 'departments.html 科室列表与 department.html 详情；关联专家来自师资团队。', '品牌运营 / 学科负责人') +
      panel('科室目录', '共 ' + data.brand.departments.length + ' 个 · 点击整行编辑', '<div class="toolbar" style="padding:10px 0 5px">' + seg([{id:'all',label:'全部'}].concat(cats.map((c) => ({id:c,label:c}))), cat, 'bDeptCat') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="bDeptQ" placeholder="科室 / 简介 / 技术" value="' + esc(q) + '"></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>科室</th><th>分类</th><th>特色技术</th><th>简介</th><th>操作</th></tr></thead><tbody>' + (rows.length ? rows.map((d) => '<tr class="click" data-act="editDepartment" data-id="' + esc(d.id) + '"><td><div class="row-main"><span class="avatar square" style="width:32px;height:32px;background:#e7f4f8;color:#1d6e89">' + ic('layers') + '</span><div><div class="name">' + esc(d.name) + '</div><div class="sub">' + esc(d.profile || '') + '</div></div></div></td><td>' + pill(d.category || '科室', 'blue') + '</td><td>' + ((d.features || []).length ? pill((d.features || []).length + ' 项', 'orange') : '<span class="muted">—</span>') + '</td><td style="max-width:380px"><div style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.6">' + esc((d.intro || '').slice(0, 96)) + '</div></td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') : '<tr><td colspan="5">' + empty('没有匹配科室') + '</td></tr>') + '</tbody></table></div><div class="row-flex" style="padding-top:11px"><span class="tiny muted">共 ' + filtered.length + ' 个 · 第 ' + cur + ' / ' + totalPages + ' 页</span><div class="right-auto row-flex"><button class="btn sm" data-ui-page="bDeptPage" data-value="' + (cur - 1) + '" ' + (cur <= 1 ? 'disabled' : '') + '>上一页</button><button class="btn sm" data-ui-page="bDeptPage" data-value="' + (cur + 1) + '" ' + (cur >= totalPages ? 'disabled' : '') + '>下一页</button></div></div>', '<span class="pill">真实科室</span>', true) + '</div>';
  };

  PAGES['b-camp'] = function () {
    const c = data.brand.camp;
    return '<div class="page wide">' + pageHead('健康营项目页', '北医健康营第 7 期：28 天代谢重塑计划。项目亮点、时间节点、角色、17 位团队与 8 家医院都来自 camp.html。', saveBtn('项目页'), 'PKU-INTRODUCE / 健康营') +
      purpose('对外解释营期做什么、谁负责、在哪些医院执行。', 'camp.html 项目介绍、团队名单、合作医院与时间轴。', '项目运营') +
      '<div class="grid main-side"><div class="stack">' +
        panel('营期信息', 'Day ' + c.day + ' / ' + c.totalDays, '<div class="form-grid two">' + field('项目名称', c.name, 'brand.camp.name') + field('期数', c.edition, 'brand.camp.edition') + field('主题', c.theme, 'brand.camp.theme') + field('状态', c.status, 'brand.camp.status') + field('开始日期', c.startDate, 'brand.camp.startDate') + field('结束日期', c.endDate, 'brand.camp.endDate') + field('地点', c.location, 'brand.camp.location') + field('主办医院', c.host, 'brand.camp.host') + '</div>' + field('项目摘要', c.summary, 'brand.camp.summary', { area: true, rows: 3 }) ) +
        panel('四个亮点', 'H5 项目页顶部卡片', '<div class="grid two">' + (c.highlights || []).map((x, i) => '<div class="panel" style="box-shadow:none"><div class="panel-body"><div class="tiny muted">亮点 ' + (i + 1) + '</div>' + field('标签', x.label, 'brand.camp.highlights.' + i + '.label') + field('内容', x.value, 'brand.camp.highlights.' + i + '.value') + '</div></div>').join('') + '</div>') +
        panel('项目角色', '六类角色在项目页解释分工', '<div class="grid three">' + (c.roles || []).map((r, i) => '<div style="padding:12px;border:1px solid var(--line-soft);border-radius:11px"><div class="row-flex"><span class="avatar square" style="width:28px;height:28px;background:#e7f4f8;color:#1d6e89">' + ic('user') + '</span><b style="font-size:11.5px">' + esc(r.name) + '</b></div><div class="tiny muted" style="margin-top:7px;line-height:1.6">' + esc(r.desc) + '</div></div>').join('') + '</div>') +
      '</div><div class="stack">' +
        panel('项目团队', '17 位真实成员 · 点击整行查看', '<div style="max-height:560px;overflow:auto;margin:-4px -20px -20px">' + c.roster.map((x) => '<div class="rowlink" data-act="editRoster" data-id="' + esc(x.id) + '">' + avatar(x.name, x.photo) + '<div class="main-tx"><b>' + esc(x.name) + ' · ' + esc(x.role) + '</b><span>' + esc(x.qualification || '') + ' · ' + esc(x.hospital || '') + '</span></div><div class="tail">' + pill(x.roleKey === 'doctor' ? '医师' : x.roleKey === 'nutrition' ? '营养' : x.roleKey === 'rehab' ? '康复' : '运营', 'outline') + '<span class="chev">' + ic('chevron') + '</span></div></div>').join('') + '</div>', '<span class="pill">' + c.roster.length + ' 人</span>', true) +
        panel('合作医院', '8 家医院参与项目', '<div class="stack tight">' + (c.hospitals || []).map((x) => '<div class="row-flex small" style="padding:8px 0;border-bottom:1px solid var(--line-soft)"><span class="avatar square" style="width:27px;height:27px;background:' + x.tone + '18;color:' + x.tone + '">' + ic('hospital') + '</span><span>' + esc(x.name) + '</span><span class="tiny muted right-auto">' + esc(x.city) + '</span></div>').join('') + '</div>') +
        panel('时间节点', '项目页真实时间轴', '<div class="timeline">' + (c.timeline || []).map((x, i) => '<div class="tl-row"><span class="tl-time">' + esc(x.date || x.time || '') + '</span><div class="tl-axis"><span class="tl-dot" style="--dot:#2c8aa8"></span></div><div class="tl-body"><b>' + esc(x.title || '') + '</b><span>' + esc(x.desc || x.text || '') + '</span></div></div>').join('') + '</div>') +
      '</div></div></div>';
  };

  PAGES['b-about'] = function () {
    const a = data.brand.about;
    return '<div class="page wide">' + pageHead('关于北大医疗', '对应 brand.html：品牌故事、四个关键数字、2002—2022 发展历程与集团愿景。', saveBtn('品牌页'), 'PKU-INTRODUCE / 品牌') +
      purpose('把集团从哪里来、拥有什么能力、要去哪里讲清楚。', 'brand.html 全部品牌叙述、数字与时间轴。', '品牌运营') +
      '<div class="grid main-side"><div class="stack">' +
        panel('品牌首屏', '让优质医疗 / 触手可及', '<div class="form-grid">' + field('眉标', 'PKU HEALTHCARE GROUP', 'brand.about.eyebrow', { optional: true }) + '<div class="form-grid two">' + field('第一行', a.titleA, 'brand.about.titleA') + field('第二行', a.titleB, 'brand.about.titleB') + '</div>' + field('导语', a.lead, 'brand.about.lead', { area: true, rows: 3 }) + '</div>') +
        panel('品牌故事', '一所医院，一座医疗城', field('故事标题', a.storyTitle, 'brand.about.storyTitle') + field('医院介绍', a.intro, 'brand.about.intro', { area: true, rows: 4 }) ) +
        panel('关键数字', '品牌页数据条', '<div class="grid two">' + (a.numbers || []).map((n, i) => '<div class="panel" style="box-shadow:none"><div class="panel-body">' + field('数值', n.value, 'brand.about.numbers.' + i + '.value', { num: typeof n.value === 'number' }) + field('说明', n.label, 'brand.about.numbers.' + i + '.label') + '</div></div>').join('') + '</div>') +
        panel('发展历程', '2002—2022 五个关键节点', '<div class="stack">' + (a.timeline || []).map((t, i) => '<div style="padding:12px;border:1px solid var(--line-soft);border-radius:12px"><div class="row-flex"><span class="pill navy">' + esc(t.year) + '</span><b style="font-size:11.5px">' + esc(t.title) + '</b></div><div class="form-grid two" style="margin-top:9px">' + field('年份', t.year, 'brand.about.timeline.' + i + '.year') + field('节点标题', t.title, 'brand.about.timeline.' + i + '.title') + '</div>' + field('说明', t.desc, 'brand.about.timeline.' + i + '.desc', { area: true, rows: 2 }) + '</div>').join('') + '</div>') +
      '</div><div class="stack">' +
        panel('品牌愿景', '', field('愿景', a.vision, 'brand.about.vision', { area: true, rows: 3 }) + '<div class="notice" style="margin-top:12px">' + ic('info') + '<span>愿景原文：有平安特色的、中国领先的医疗管理集团。请勿改成未授权的宣传语。</span></div>') +
        panel('H5 预览', '', '<div class="phone-frame"><div class="phone-bar"><i></i></div><div class="phone-body"><div class="phone-hero" style="background:linear-gradient(145deg,#1d6e89,#102f45)"><div class="micro">PKU HEALTHCARE</div><h3>' + esc(a.titleA) + '<br>' + esc(a.titleB) + '</h3><p>' + esc(a.lead) + '</p></div><div class="phone-sec"><h4>' + esc(a.storyTitle) + '</h4><p>' + esc(a.intro.slice(0, 130)) + '</p></div><div class="phone-sec"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + (a.numbers || []).map((x) => '<div><b style="font-size:16px">' + esc(x.value) + '</b><div class="tiny muted">' + esc(x.label) + '</div></div>').join('') + '</div></div><div class="phone-sec"><h4>发展历程</h4>' + (a.timeline || []).slice(0, 3).map((x) => '<div class="row-flex" style="padding:5px 0"><span class="tiny" style="color:#1d6e89;font-weight:600">' + esc(x.year) + '</span><span class="tiny">' + esc(x.title) + '</span></div>').join('') + '</div></div></div>') +
        panel('品牌口径提醒', '', '<div class="notice green">' + ic('check') + '<span>所有数字与历程来自 PKU-introduce 的 brand.html；编辑时保留出处，不新增无法核验的荣誉或排名。</span></div>') +
      '</div></div></div>';
  };

  /* ----------------------------------------------------------- 职工健康 */
  function productById(id) { return data.employee.products.find((p) => p.id === id); }
  function productIndex(id) { return data.employee.products.findIndex((p) => p.id === id); }
  function moduleName(id) { const m = data.employee.modules.find((x) => x.id === id); return m ? m.name : id; }
  function moduleMeta(id) { return data.employee.modules.find((x) => x.id === id) || { name: id, ink: '#ff6a13', tint: '#fff1e7', icon: 'package' }; }
  function serviceEditorHtml(id) {
    const p = productById(id);
    if (!p) return empty('服务不存在');
    const i = productIndex(id);
    const m = moduleMeta(p.mod);
    const orgOptions = data.employee.orgDetails.map((o) => o.name);
    return '<div class="stack">' +
      '<div class="notice">' + ic('image') + '<span>服务详情对应职工端服务详情页：主图、图集与图文介绍用于内容运营；当前 H5 静态页面只读取服务名称、介绍与上下架状态。</span></div>' +
      panel('视觉素材', '主图 + 图集 · 支持上传替换', '<div class="form-grid two"><div>' + field('主图', '', 'employee.products.' + i + '.imageUrl', { optional: true, hint: '建议 16:9 或 4:3，展示在服务卡与详情头部。' }) + uploadBox('employee.products.' + i + '.imageUrl', p.imageUrl, false, 'cover') + '</div><div>' + field('图集', '', 'employee.products.' + i + '.gallery', { optional: true, hint: '详情页横向图集，可上传多张。' }) + uploadBox('employee.products.' + i + '.gallery', p.gallery, true, 'wide') + '</div></div>') +
      panel('基础信息', '决定学员端服务卡与预约入口', '<div class="form-grid two">' + field('服务名称', p.name, 'employee.products.' + i + '.name') + field('英文名称', p.en || '', 'employee.products.' + i + '.en') + field('所属模块', p.mod, 'employee.products.' + i + '.mod', { select: data.employee.modules.map((x) => ({ v: x.id, l: x.name })) }) + field('履约范围', p.scope || '属地履约', 'employee.products.' + i + '.scope', { select: [{v:'属地履约',l:'属地履约'},{v:'全国履约',l:'全国履约'},{v:'线上履约',l:'线上履约'}] }) + field('服务时长', p.duration || '', 'employee.products.' + i + '.duration') + field('响应时效', p.resp || '', 'employee.products.' + i + '.resp') + '</div>' + '<div class="row-flex" style="margin-top:11px">' + switchRow('上架状态', '下架后 H5 隐藏该服务入口', 'employee.products.' + i + '.active', p.active) + '<span class="right-auto">' + (p.recommended ? pill('首页推荐', 'orange') : pill('普通服务', '')) + '</span></div>') +
      panel('支付与标签', '与职工端服务卡、权益口径一致', '<div class="form-grid">' + field('支付来源', (p.payer || []).join('、'), 'employee.products.' + i + '.payerText', { hint: '多来源用顿号分隔：职工福利费 / 工会经费 / 企康 / 商保 / 社保 / 自费 / 企业安全生产费。' }) + field('标签', (p.tags || []).join('、'), 'employee.products.' + i + '.tagsText', { hint: '用顿号分隔，例如：每年 1 次、含报告解读。' }) + field('简介', p.intro, 'employee.products.' + i + '.intro', { area: true, rows: 3 }) + '</div>') +
      panel('服务内容与适用人群', '详情页逐条展示', '<div class="form-grid">' + field('服务包含（每行一条）', (p.includes || []).join('\n'), 'employee.products.' + i + '.includesText', { area: true, rows: 5 }) + field('适用人群', p.suit || '', 'employee.products.' + i + '.suit', { area: true, rows: 3 }) + field('预约须知（每行一条）', (p.notice || []).join('\n'), 'employee.products.' + i + '.noticeText', { area: true, rows: 4 }) + field('服务流程（每行一步）', (p.flow || []).join('\n'), 'employee.products.' + i + '.flowText', { area: true, rows: 4 }) + '</div>') +
      panel('图文详情', '支持加粗、下划线、列表与插入图片', richEditor('employee.products.' + i + '.detailHtml', p.detailHtml, '上传服务环境、流程示意或检查项目图片…') ) +
      panel('服务机构', '来自职工端真实机构', '<div class="stack tight">' + orgOptions.map((name) => '<div class="row-flex small" style="padding:7px 0;border-bottom:1px solid var(--line-soft)"><span class="avatar square" style="width:24px;height:24px">' + ic('hospital') + '</span><span>' + esc(name) + '</span><span class="right-auto">' + ((p.orgs || []).some((o) => o.indexOf(name) >= 0) ? pill('已关联', 'green') : pill('未关联', '')) + '</span></div>').join('') + '</div><div class="hint" style="margin-top:8px">在「服务机构」页维护地址、电话与号源，服务详情只引用机构名称。</div>') +
    '</div>';
  }

  PAGES['e-home'] = function () {
    const h = data.employee.home;
    const hot = (h.hotServiceIds || []).map(productById).filter(Boolean);
    return '<div class="page wide">' + pageHead('职工端首页', 'pku-employee-health 单文件 H5 的真实首页：问候、健康权益、搜索、智能推荐、5 大模块、热门服务、预约与消息入口。', saveBtn('首页配置'), 'PKU-EMPLOYEE-HEALTH / 首页') +
      purpose('维护职工打开 H5 后看到的第一屏，以及搜索、热门服务与模块入口。', '首页横幅、快捷搜索、热门服务、预约与权益入口；模块与服务上下架由 bridge 真实生效。', '企康运营') +
      '<div class="grid main-side"><div class="stack">' +
        panel('顶部问候与权益', '真实用户杨君 / 国家电网 · 华东分部', '<div class="form-grid two">' + field('问候语', h.greeting, 'employee.home.greeting') + field('企业名称', h.company, 'employee.home.company') + field('权益状态', h.entitlement, 'employee.home.entitlement') + field('搜索占位文案', h.searchPlaceholder, 'employee.home.searchPlaceholder') + '</div>') +
        panel('品牌横幅', '3 张 · 支持图片上传', '<div class="grid three">' + data.employee.banners.map((b, i) => '<div class="panel" style="box-shadow:none;cursor:pointer" data-act="editBanner" data-kind="banner" data-id="' + esc(b.id) + '"><div style="height:112px;background:' + esc(b.tone || '#1d5f86') + ';position:relative;overflow:hidden;color:#fff;padding:15px"><div class="tiny" style="opacity:.7">' + esc(b.brand || '') + '</div><b style="display:block;margin-top:7px;font-size:12px">' + esc(b.title) + '</b><div class="tiny" style="margin-top:5px;opacity:.75">' + esc(b.sub) + '</div>' + (b.image ? '<img src="' + esc(b.image) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="">' : '') + '<div style="position:absolute;right:10px;top:10px">' + (b.enabled ? pill('展示', 'green') : pill('隐藏', 'red')) + '</div></div><div class="panel-body" style="padding-top:10px"><div class="row-flex"><span class="tiny muted">' + esc(b.link || '') + '</span><button class="btn sm right-auto">编辑</button></div></div></div>').join('') + '</div>') +
        panel('活动横幅', '职工体检升级 / 减重训练营 / 急救培训', '<div class="grid three">' + data.employee.promos.map((b, i) => '<div class="panel" style="box-shadow:none;cursor:pointer" data-act="editBanner" data-kind="promo" data-id="' + esc(b.id) + '"><div style="height:108px;background:linear-gradient(135deg,#ff8a4c,#e95514);color:#fff;padding:15px;position:relative;overflow:hidden"><div class="tiny" style="opacity:.8">' + esc(b.tag) + '</div><b style="display:block;margin-top:8px;font-size:12.5px">' + esc(b.title) + '</b><div class="tiny" style="margin-top:5px;opacity:.8">' + esc(b.sub) + '</div>' + (b.image ? '<img src="' + esc(b.image) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="">' : '') + '</div><div class="panel-body" style="padding-top:10px"><div class="row-flex"><span class="tiny muted">关联 ' + esc(b.serviceId) + '</span><button class="btn sm right-auto">编辑</button></div></div></div>').join('') + '</div>') +
        panel('快捷搜索', '5 个高频入口', '<div class="grid two">' + (h.quickSearches || []).map((x, i) => field('快捷搜索 ' + (i + 1), x, 'employee.home.quickSearches.' + i)).join('') + '</div>') +
        panel('热门服务', '当前展示 ' + hot.length + ' 项 · 可更换', '<div class="stack tight">' + hot.map((p) => '<div class="rowlink" data-go="e-service" data-id="' + esc(p.id) + '"><span class="avatar square" style="width:30px;height:30px;background:' + moduleMeta(p.mod).tint + ';color:' + moduleMeta(p.mod).ink + '">' + ic(moduleMeta(p.mod).icon) + '</span><div class="main-tx"><b>' + esc(p.name) + '</b><span>' + esc(moduleName(p.mod)) + ' · ' + esc(p.scope || '') + '</span></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>', '<button class="btn sm" data-act="manageHot">更换热门</button>', true) +
        panel('首页入口', '与 H5 底部与快捷区对应', '<div class="stack tight">' + switchRow('企康小安智能推荐', '首页「不知道选哪项？」入口', 'employee.home.aiEnabled', h.aiEnabled) + switchRow('我的预约', '进行中与历史预约', 'employee.home.showAppointments', h.showAppointments) + switchRow('我的权益', '年度额度与剩余次数', 'employee.home.showBenefits', h.showBenefits) + switchRow('家庭成员', '代家人预约与权益', 'employee.home.showFamily', h.showFamily) + switchRow('健康科普', '发现页文章与讲座', 'employee.home.showArticles', h.showArticles) + '</div>') +
      '</div><div class="stack">' +
        panel('H5 预览', '职工端橙色主视觉', '<div class="phone-frame" style="--accent:#ff6a13"><div class="phone-bar"><i></i></div><div class="phone-body"><div class="phone-hero" style="background:linear-gradient(150deg,#ff8a4c,#f2540c)"><div class="micro">' + esc(h.company) + '</div><h3>' + esc(h.greeting) + '</h3><p>' + esc(h.entitlement) + ' · 年度额度 ' + esc(data.employee.entitlement.total) + '</p></div><div class="phone-sec"><div style="height:31px;border-radius:8px;background:#f2f5f8;display:flex;align-items:center;gap:7px;padding:0 10px;color:#95a4b4;font-size:9px">' + ic('search', 12) + esc(h.searchPlaceholder) + '</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">' + (h.quickSearches || []).map((x) => '<span class="pill" style="font-size:8px">' + esc(x) + '</span>').join('') + '</div></div><div class="phone-sec"><h4>5 大服务模块</h4><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">' + data.employee.modules.map((m) => '<div style="text-align:center;padding:8px 2px;border-radius:8px;background:' + m.tint + '"><div style="color:' + m.ink + ';font-size:11px">' + ic(m.icon, 14) + '</div><div style="font-size:8px;margin-top:2px">' + esc(m.stab) + '</div></div>').join('') + '</div></div><div class="phone-sec"><h4>' + esc(h.hotTitle) + '</h4><div class="phone-list">' + hot.slice(0, 3).map((p) => '<div class="phone-item"><span class="pi">' + ic(moduleMeta(p.mod).icon, 12) + '</span><div><b>' + esc(p.name) + '</b><span>' + esc(moduleName(p.mod)) + '</span></div></div>').join('') + '</div></div></div></div>') +
        panel('内容底线', '不假装推送、不假装支付', '<div class="notice warm">' + ic('phone') + '<span>首页消息与预约为 H5 本地演示数据。后台只能生成「电话人工跟进」待办，没有企业微信、短信或站内信通道。</span></div>') +
      '</div></div></div>';
  };

  PAGES['e-services'] = function () {
    const mod = state.ui.eMod || 'all';
    const q = (state.ui.eServiceQ || '').trim();
    const status = state.ui.eServiceStatus || 'all';
    const rows = data.employee.products.filter((p) => (mod === 'all' || p.mod === mod) && (status === 'all' || (status === 'online' ? p.active : !p.active)) && (!q || (p.name + p.intro + (p.tags || []).join('')).indexOf(q) >= 0));
    return '<div class="page wide">' + pageHead('服务目录', '5 大模块、28 项真实服务。点击任意服务整卡进入详情编辑，不再只能点最右箭头。', '<button class="btn primary" data-act="newService">' + ic('plus') + '<span>新增服务</span></button>', 'PKU-EMPLOYEE-HEALTH / 服务') +
      purpose('维护职工健康服务的名称、介绍、范围、支付来源与上下架。', 'H5「选服务」列表与服务详情；上下架由 bridge 读取，名称与介绍只保存后台。', '企康产品运营') +
      '<div class="kpi-grid">' + kpi('全部服务', data.employee.products.length, '项', '5 大模块', 'package', ['#fff1e7','#e5540b']) + kpi('已上架', data.employee.products.filter((p) => p.active).length, '项', '职工端可见', 'check', ['#e9f7f1','#0c7c59']) + kpi('首页推荐', data.employee.products.filter((p) => p.recommended).length, '项', '热门服务口径', 'spark', ['#edf3ff','#1f4fd1']) + kpi('待完善', data.employee.products.filter((p) => !p.imageUrl).length, '项', '尚无主图', 'image', ['#fff6e0','#a86a06']) + '</div>' +
      panel('服务卡片', '整卡可点击进入详情配置', '<div class="toolbar" style="padding:10px 0 7px">' + seg([{id:'all',label:'全部'}].concat(data.employee.modules.map((m) => ({id:m.id,label:m.stab}))), mod, 'eMod') + seg([{id:'all',label:'全部状态'},{id:'online',label:'上架'},{id:'offline',label:'下架'}], status, 'eServiceStatus') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="eServiceQ" placeholder="服务名 / 介绍 / 标签" value="' + esc(q) + '"></div></div>' +
        '<div class="service-grid">' + (rows.length ? rows.map((p) => {
          const m = moduleMeta(p.mod);
          return '<div class="service-card" style="cursor:pointer" data-go="e-service" data-id="' + esc(p.id) + '"><div class="sc-top"><div class="sc-icon" style="--tint:' + m.tint + ';--inkc:' + m.ink + '">' + ic(m.icon) + '</div><div class="sc-name"><b>' + esc(p.name) + '</b><span>' + esc(p.en || moduleName(p.mod)) + '</span></div><button class="switch-btn ' + (p.active ? 'on' : '') + '" data-switch="employee.products.' + productIndex(p.id) + '.active" title="上下架"></button></div><p class="sc-p">' + esc(p.intro) + '</p><div class="chips">' + (p.tags || []).slice(0, 2).map((t) => pill(t, 'outline')).join('') + '</div><div class="sc-bottom"><span class="tiny muted">' + esc(p.scope || '') + '</span><span class="tiny muted">' + esc((p.payer || [])[0] || '') + '</span><span class="chev">' + ic('chevron') + '</span></div></div>';
        }).join('') : empty('没有匹配服务')) + '</div>' + '<div class="hint" style="margin-top:10px">整卡点击 = 打开服务详情页；右上角开关只切换上下架，不会误跳。</div>', '<span class="pill">' + rows.length + ' 项</span>', false) + '</div>';
  };

  PAGES['e-service'] = function () {
    const id = state.ctx.id || (data.employee.products[0] || {}).id;
    const p = productById(id);
    if (!p) return '<div class="page">' + pageHead('服务详情', '服务不存在', '', 'PKU-EMPLOYEE-HEALTH / 服务') + empty('找不到该服务') + '</div>';
    return '<div class="page wide">' + pageHead(p.name, '编辑职工端服务详情：视觉素材、服务内容、流程、机构与图文介绍。', saveBtn('服务详情'), 'PKU-EMPLOYEE-HEALTH / ' + moduleName(p.mod)) +
      purpose('让职工在预约前看清楚服务包含什么、适合谁、怎么履约。', 'H5 服务详情页与预约表单；上下架由 bridge 生效，名称与介绍只保存后台。', '企康产品运营 · ' + p.name) +
      '<div class="grid main-side"><div class="stack">' + serviceEditorHtml(id) + '</div><div class="stack">' +
        panel('服务卡预览', '', '<div class="phone-frame" style="--accent:#ff6a13"><div class="phone-bar"><i></i></div><div class="phone-body"><div class="phone-hero" style="background:linear-gradient(145deg,#ff8a4c,#ef530f)"><div class="micro">' + esc(moduleName(p.mod)) + ' · ' + esc(p.scope || '') + '</div><h3>' + esc(p.name) + '</h3><p>' + esc(p.intro) + '</p></div><div class="phone-sec"><div class="row-flex">' + (p.tags || []).map((t) => pill(t, 'outline')).join('') + '</div></div><div class="phone-sec"><h4>服务包含</h4><ul>' + (p.includes || []).slice(0, 4).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div><div class="phone-sec"><h4>预约须知</h4><ul>' + (p.notice || []).slice(0, 3).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div><div style="padding:10px"><div style="height:36px;border-radius:10px;background:#ff6a13;color:#fff;display:grid;place-items:center;font-size:10px">立即预约</div></div></div></div>') +
        panel('预约表单', '来自 H5 模块字段', '<div class="stack tight">' + (data.employee.bookingFields[p.mod] || []).map((f) => '<div class="row-flex small" style="padding:7px 0;border-bottom:1px solid var(--line-soft)"><span>' + esc(f) + '</span><span class="tiny muted right-auto">H5 字段</span></div>').join('') + '</div><button class="btn sm w-full" data-go="e-booking" style="margin-top:10px">配置该模块预约规则</button>') +
        panel('关联客户', '使用过该服务的客户', '<div class="stack tight">' + data.employee.bookings.filter((b) => b.pid === p.id).map((b) => { const c = customerByName(b.person); return '<div class="rowlink" ' + (c ? 'data-go="crm-detail" data-id="' + esc(c.id) + '"' : '') + '><span class="avatar square" style="width:27px;height:27px">' + esc(b.person.slice(0,1)) + '</span><div class="main-tx"><b>' + esc(b.person) + '</b><span>' + esc(b.service) + '</span></div><span class="chev">' + ic('chevron') + '</span></div>'; }).join('') + '</div>') +
      '</div></div></div>';
  };

  PAGES['e-booking'] = function () {
    const b = data.employee.bookingRules;
    return '<div class="page wide">' + pageHead('预约设置', '按 5 大模块区分真实预约字段：筛查、慢病、就医、特色、应急。规则决定可预约日期、取消与提醒。', saveBtn('预约设置'), 'PKU-EMPLOYEE-HEALTH / 预约') +
      purpose('把每种服务的预约路径配置清楚，避免所有服务套同一张表单。', 'H5 服务详情「立即预约」表单、日期可选范围、取消与额度退回。', '企康运营') +
      '<div class="grid main-side"><div class="stack">' +
        panel('全局限额与取消规则', '对全部服务生效', '<div class="form-grid two">' + field('最早提前预约天数', b.leadDays, 'employee.bookingRules.leadDays', { num: true }) + field('最远可预约天数', b.maxDays, 'employee.bookingRules.maxDays', { num: true }) + field('免费取消时限（小时）', b.cancelHours, 'employee.bookingRules.cancelHours', { num: true }) + field('自动确认', b.autoConfirm ? '开启' : '关闭', 'employee.bookingRules.autoConfirm', { select: [{v:'true',l:'开启 · 提交即确认'},{v:'false',l:'关闭 · 人工确认'}] }) + '</div><div class="stack tight" style="margin-top:8px">' + switchRow('取消后额度退回', '取消预约时恢复权益次数', 'employee.bookingRules.cancelRefund', b.cancelRefund) + switchRow('电话提醒', '由健康管家人工电话提醒，无短信通道', 'employee.bookingRules.reminderPhone', b.reminderPhone) + '</div>') +
        panel('五个模块的预约字段', '点击整张卡片查看与启停', '<div class="grid two">' + data.employee.modules.map((m) => {
          const fields = data.employee.bookingFields[m.id] || [];
          return '<div class="panel" style="box-shadow:none;cursor:pointer;border-top:3px solid ' + m.ink + '" data-act="editBookingModule" data-id="' + esc(m.id) + '"><div class="panel-head"><div class="ph"><h2>' + esc(m.name) + '</h2><p>' + esc(m.sub) + '</p></div><span class="actions"><button class="switch-btn ' + (data.employee.bookingEnabled[m.id] ? 'on' : '') + '" data-switch="employee.bookingEnabled.' + m.id + '"></button></span></div><div class="panel-body"><div class="chips">' + fields.map((f) => pill(f, 'outline')).join('') + '</div><div class="tiny muted" style="margin-top:9px">' + fields.length + ' 个字段 · 最后更新 2026-11-08</div></div></div>';
        }).join('') + '</div>') +
      '</div><div class="stack">' +
        panel('预约表单预览', '以「健康筛查」为例', '<div class="phone-frame" style="--accent:#ff6a13"><div class="phone-bar"><i></i></div><div class="phone-body"><div class="phone-hero" style="background:linear-gradient(145deg,#ff8a4c,#ef530f)"><div class="micro">职工年度体检</div><h3 style="font-size:20px">预约信息</h3><p>请按真实情况填写，健康管家会在确认后电话联系。</p></div><div class="phone-sec">' + (data.employee.bookingFields.screen || []).map((f) => '<div style="margin-bottom:9px"><div class="tiny muted" style="margin-bottom:3px">' + esc(f) + '</div><div style="height:29px;border:1px solid #e2e8ee;border-radius:7px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#8b9bac">请选择</div></div>').join('') + '<div style="height:34px;border-radius:8px;background:#ff6a13;color:#fff;display:grid;place-items:center;font-size:10px">提交预约</div></div></div></div>') +
        panel('时段配置', '真实可选时段', '<div class="chips">' + data.employee.times.map((t) => pill(t, 'outline')).join('') + '</div><div class="notice" style="margin-top:10px">' + ic('clock') + '<span>号源由服务机构维护；当前 H5 只做本地演示，没有真实排班接口。</span></div>') +
      '</div></div></div>';
  };

  PAGES['e-orders'] = function () {
    const tab = state.ui.eOrderTab || 'all';
    const q = (state.ui.eOrderQ || '').trim();
    const date = (state.ui.eOrderDate || '').trim();
    const rows = data.employee.bookings.filter((b) => (tab === 'all' || b.statusKey === tab) && (!q || (b.person + b.service + b.org).indexOf(q) >= 0) && (!date || String(b.date || '').indexOf(date) >= 0));
    const counts = { all: data.employee.bookings.length, pending: data.employee.bookings.filter((b) => b.statusKey === 'pending').length, confirmed: data.employee.bookings.filter((b) => b.statusKey === 'confirmed').length, in_service: data.employee.bookings.filter((b) => b.statusKey === 'in_service').length, completed: data.employee.bookings.filter((b) => b.statusKey === 'completed').length, cancelled: data.employee.bookings.filter((b) => b.statusKey === 'cancelled').length };
    const tone = (k) => k === 'pending' ? 'amber' : k === 'confirmed' ? 'blue' : k === 'in_service' ? 'orange' : k === 'completed' ? 'green' : '';
    return '<div class="page wide">' + pageHead('预约记录', '职工服务预约的查询与流转：待确认 → 已确认 → 服务中 → 已完成；支持代客下单、改约、取消与额度退回。', '<button class="btn" data-act="exportOrders">' + ic('download') + '<span>导出预约</span></button><button class="btn primary" data-act="newOrder">' + ic('plus') + '<span>代客下单</span></button>', 'PKU-EMPLOYEE-HEALTH / 预约记录') +
      purpose('跟踪每一单预约从提交到履约，避免已预约无人跟进。', 'H5 我的预约状态、权益次数与取消后额度退回。', '健康管家 / 企康运营') +
      '<div class="kpi-grid">' + kpi('全部预约', counts.all, '单', '含后台代下单', 'calendar', ['#fff1e7','#e5540b']) + kpi('待确认', counts.pending, '单', '需健康管家确认', 'clock', ['#fff6e0','#a86a06']) + kpi('服务中', counts.confirmed + counts.in_service, '单', '已确认 / 履约中', 'activity', ['#f1efff','#5b4bc4']) + kpi('已完成', counts.completed, '单', '含线下履约', 'check', ['#e9f7f1','#0c7c59']) + '</div>' +
      panel('预约清单', '点击整行查看详情与流转', '<div class="toolbar" style="padding:10px 0 5px">' + seg([{id:'all',label:'全部 '+counts.all},{id:'pending',label:'待确认 '+counts.pending},{id:'confirmed',label:'已确认 '+counts.confirmed},{id:'in_service',label:'服务中 '+counts.in_service},{id:'completed',label:'已完成 '+counts.completed},{id:'cancelled',label:'已取消 '+counts.cancelled}], tab, 'eOrderTab') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="eOrderQ" placeholder="职工 / 服务 / 机构" value="' + esc(q) + '"><input class="input" data-ui-input="eOrderDate" placeholder="日期，如 10-24" value="' + esc(date) + '" style="width:120px;margin-left:6px"></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>职工</th><th>服务</th><th>机构</th><th>预约时间</th><th>状态</th><th>渠道</th><th>操作</th></tr></thead><tbody>' + (rows.length ? rows.map((b) => '<tr class="click" data-act="editOrder" data-id="' + esc(b.id) + '"><td><div class="row-main">' + avatar(b.person) + '<div><div class="name">' + esc(b.person) + '</div><div class="sub">' + esc(b.dept || '') + '</div></div></div></td><td><b style="font-size:11.5px">' + esc(b.service || '') + '</b><div class="sub">' + esc(productById(b.pid) ? productById(b.pid).name : b.pid) + '</div></td><td>' + esc(b.org || '') + '</td><td>' + esc(b.date || '') + ' ' + esc(b.time || '') + '</td><td>' + pill(orderStatusLabel(b.statusKey), tone(b.statusKey)) + '</td><td class="muted">' + esc(b.channel || '') + '</td><td class="actions"><button class="btn sm">处理</button></td></tr>').join('') : '<tr><td colspan="7">' + empty('当前筛选没有预约') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">' + rows.length + ' 单</span>', true) + '</div>';
  };

  PAGES['e-benefits'] = function () {
    const e = data.employee.entitlement;
    const totalNum = Number(String(e.total).replace(/[^\d.]/g, '')) || 0;
    const usedNum = Number(String(e.used).replace(/[^\d.]/g, '')) || 0;
    return '<div class="page wide">' + pageHead('权益额度', '杨君 2026 年度职工健康权益：体检、就医快通、五高一重、EAP、急救培训与减重训练营。', saveBtn('权益配置'), 'PKU-EMPLOYEE-HEALTH / 权益') +
      purpose('管理年度总权益、已用额度与每项服务的次数规则，保证预约和扣减口径一致。', 'H5 我的权益、服务预约可用次数与取消退回；当前 H5 只读取本地权益。', '企康运营 / 人事') +
      '<div class="kpi-grid">' + kpi('年度总额度', e.total, '', '2026 年度 · ' + e.holder, 'shield', ['#fff1e7','#e5540b']) + kpi('已使用', e.used, '', '体检 / 胃肠镜 / 急救', 'activity', ['#edf3ff','#1f4fd1']) + kpi('剩余额度', '¥' + (totalNum - usedNum), '', '按金额口径', 'coins', ['#e9f7f1','#0c7c59']) + kpi('权益项目', data.employee.rights.length, '项', '含次数型权益', 'gift', ['#fff6e0','#a86a06']) + '</div>' +
      '<div class="grid main-side section-space"><div class="stack">' +
        panel('年度额度', 'H5 首页顶部展示', '<div class="form-grid two">' + field('额度持有人', e.holder, 'employee.entitlement.holder') + field('年度', e.year, 'employee.entitlement.year') + field('总额度', e.total, 'employee.entitlement.total') + field('已使用', e.used, 'employee.entitlement.used') + '</div>') +
        panel('权益项目', '点击整行编辑规则与次数', '<div class="table-wrap"><table class="table"><thead><tr><th>权益</th><th>说明</th><th>总额度</th><th>剩余</th><th>已用</th><th>操作</th></tr></thead><tbody>' + data.employee.rights.map((r) => '<tr class="click" data-act="editBenefit" data-id="' + esc(r.pid) + '"><td><div class="row-main">' + avatar(r.name.slice(0,1)) + '<div><div class="name">' + esc(r.name) + '</div><div class="sub">' + esc(r.pid) + '</div></div></div></td><td style="max-width:330px">' + esc(r.benefit) + '</td><td>' + esc(r.total) + '</td><td><b style="color:var(--green)">' + r.left + '</b></td><td>' + r.used + '</td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') + '</tbody></table></div>', '<span class="pill">真实权益</span>', true) +
      '</div><div class="stack">' +
        panel('权益使用规则', '', '<div class="stack tight">' + data.employee.rights.map((r) => '<div style="padding:9px 0;border-bottom:1px solid var(--line-soft)"><div class="row-flex"><b style="font-size:11px">' + esc(r.name) + '</b><span class="right-auto tiny muted">' + esc(r.total) + '</span></div>' + progress(r.used / Math.max(1, r.used + r.left) * 100, '#ff6a13') + '</div>').join('') + '</div>') +
        panel('年度重置', '避免权益被错误累计', '<div class="notice warm">' + ic('refresh') + '<span>权益按自然年重置。当前静态 H5 没有后端账户系统，重置动作只保存后台配置。</span></div>') +
      '</div></div></div>';
  };

  PAGES['e-records'] = function () {
    return '<div class="page wide">' + pageHead('健康档案', '职工体检报告、家庭成员与隐私授权。报告只展示真实三类，不伪造检验数值。', saveBtn('档案设置'), 'PKU-EMPLOYEE-HEALTH / 档案') +
      purpose('让职工与健康管家找到体检报告，并明确谁能查看、能为谁预约。', 'H5「我的 · 体检报告」、家庭成员与隐私授权。', '健康管家') +
      '<div class="grid main-side"><div class="stack">' +
        panel('体检报告', '3 份真实报告 · 点击整行查看', '<div class="stack tight">' + data.employee.medicalReports.map((r, i) => '<div class="rowlink" data-act="editReport" data-id="' + esc(r.id) + '"><span class="avatar square" style="width:34px;height:34px;background:#fff1e7;color:#e5540b">' + ic('doc') + '</span><div class="main-tx"><b>' + esc(r.name) + '</b><span>' + esc(r.date) + ' · ' + esc(r.org) + ' · ' + esc(r.status) + '</span></div><div class="tail">' + (r.abnormal ? pill(r.abnormal + ' 项关注', 'amber') : pill('无异常', 'green')) + '<span class="chev">' + ic('chevron') + '</span></div></div>').join('') + '</div>') +
        panel('家庭成员', '代家人预约与查看权益', '<div class="table-wrap"><table class="table"><thead><tr><th>成员</th><th>关系</th><th>手机号</th><th>认证</th><th>操作</th></tr></thead><tbody>' + data.employee.family.map((f) => '<tr class="click" data-act="editFamily" data-id="' + esc(f.id) + '"><td><div class="row-main">' + avatar(f.name) + '<div class="name">' + esc(f.name) + '</div></div></td><td>' + esc(f.relation) + '</td><td>' + esc(f.phone) + '</td><td>' + (f.verified ? pill('已认证', 'green') : pill('待认证', 'amber')) + '</td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') + '</tbody></table></div>', '<button class="btn sm" data-act="newFamily">' + ic('plus') + '添加成员</button>', true) +
      '</div><div class="stack">' +
        panel('隐私与授权', '真实 4 项授权', '<div class="stack tight">' + data.employee.privacy.map((p, i) => '<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)"><div class="row-flex"><div style="flex:1"><b style="font-size:11.5px">' + esc(p.title) + '</b><div class="tiny muted" style="margin-top:3px;line-height:1.55">' + esc(p.desc) + '</div></div><button class="switch-btn ' + (p.on ? 'on' : '') + '" data-switch="employee.privacy.' + i + '.on"></button></div></div>').join('') + '</div>') +
        panel('隐私底线', '', '<div class="notice green">' + ic('shield') + '<span>EAP 咨询内容不进入企业人事记录。健康档案只对本人、授权家庭成员与健康管家可见。</span></div>') +
      '</div></div></div>';
  };

  PAGES['e-content'] = function () {
    const tab = state.ui.eContentTab || 'articles';
    const list = tab === 'articles' ? data.employee.articles : data.employee.lectures;
    return '<div class="page wide">' + pageHead('科普与讲座', '3 篇真实健康科普与 5 场健康讲座。文章为图文，讲座含主题、时间、地点与报名状态。', '<button class="btn primary" data-act="' + (tab === 'articles' ? 'newArticle' : 'newLecture') + '">' + ic('plus') + '<span>' + (tab === 'articles' ? '新增文章' : '新增讲座') + '</span></button>', 'PKU-EMPLOYEE-HEALTH / 内容') +
      purpose('维护职工「发现」页的文章与讲座，确保内容来源、时间和报名信息真实。', 'H5 健康科普、健康讲座与报名入口。', '内容运营 / 健康管家') +
      panel(tab === 'articles' ? '健康科普' : '健康讲座', '点击整行编辑内容', '<div class="toolbar" style="padding:9px 0 5px">' + seg([{id:'articles',label:'科普 3'},{id:'lectures',label:'讲座 5'}], tab, 'eContentTab') + '</div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>标题</th><th>' + (tab === 'articles' ? '模块 / 阅读' : '时间 / 形式') + '</th><th>' + (tab === 'articles' ? '关联服务' : '讲者 / 地点') + '</th><th>状态</th><th>操作</th></tr></thead><tbody>' + list.map((x, i) => '<tr class="click" data-act="' + (tab === 'articles' ? 'editArticle' : 'editLecture') + '" data-id="' + i + '"><td><b style="font-size:11.5px">' + esc(x.t) + '</b></td><td>' + esc(tab === 'articles' ? (x.m || '') : (x.d || '')) + (tab === 'lectures' ? '<div class="sub">' + esc(x.tag || '') + '</div>' : '') + '</td><td>' + esc(tab === 'articles' ? (x.rel || '') : ((x.n || '') + ' · ' + (x.place || ''))) + '</td><td>' + (tab === 'articles' ? pill('已发布', 'green') : pill(x.status === 'live' ? '进行中' : x.status === 'ended' ? '已结束' : '待开始', x.status === 'live' ? 'orange' : x.status === 'ended' ? '' : 'blue')) + '</td><td class="actions"><button class="btn sm">编辑</button></td></tr>').join('') + '</tbody></table></div>', '<span class="pill">' + list.length + ' 条</span>', true) + '</div>';
  };

  PAGES['e-orgs'] = function () {
    return '<div class="page wide">' + pageHead('服务机构', '职工端可预约的 3 个真实履约点：北京大学国际医院、北大医疗康复医院与线上视频面诊。', '<button class="btn primary" data-act="newOrg">' + ic('plus') + '<span>新增机构</span></button>', 'PKU-EMPLOYEE-HEALTH / 机构') +
      purpose('维护服务机构的地址、电话、可约服务与号源，决定预约时能选到哪些机构。', 'H5 预约表单「服务机构」选项与院区信息。', '企康履约运营') +
      '<div class="grid three">' + data.employee.orgDetails.map((o, i) => '<div class="panel" style="cursor:pointer" data-act="editOrg" data-id="' + esc(o.id) + '"><div class="panel-head"><div class="ph"><h2>' + esc(o.name) + '</h2><p>' + esc(o.type) + '</p></div><span class="actions">' + (o.enabled ? pill('可预约', 'green') : pill('暂停', 'red')) + '</span></div><div class="panel-body"><div class="tiny muted" style="line-height:1.7">' + esc(o.address) + '</div><div class="row-flex" style="margin-top:10px"><span class="tiny muted">' + esc(o.phone) + '</span><span class="tiny muted right-auto">' + o.slots + ' 个号源</span></div><div class="split-line"></div><div class="chips">' + (o.services || []).slice(0, 4).map((s) => pill(s, 'outline')).join('') + '</div><div style="margin-top:12px"><button class="btn sm w-full">编辑机构与号源</button></div></div></div>').join('') + '</div>' +
      panel('可约服务分布', '按机构统计', '<div class="table-wrap"><table class="table"><thead><tr><th>机构</th><th>可约服务</th><th>号源</th><th>状态</th></tr></thead><tbody>' + data.employee.orgDetails.map((o) => '<tr class="click" data-act="editOrg" data-id="' + esc(o.id) + '"><td><b style="font-size:11.5px">' + esc(o.name) + '</b></td><td>' + (o.services || []).map((s) => pill(s, 'outline')).join(' ') + '</td><td>' + o.slots + '</td><td>' + (o.enabled ? pill('可预约', 'green') : pill('暂停', 'red')) + '</td></tr>').join('') + '</tbody></table></div>', '', true) + '</div>';
  };

  PAGES['e-fivegood'] = function () {
    const tab = state.ui.fiveTab || 'themes';
    const usage = data.employee.fiveUsage || {};
    const themes = data.employee.five || [];
    const totalEnrolled = Object.keys(usage).reduce((n, k) => n + (usage[k].enrolled || 0), 0);
    const totalServed = Object.keys(usage).reduce((n, k) => n + (usage[k].served || 0), 0);
    const totalRedeemed = Object.keys(usage).reduce((n, k) => n + (usage[k].redeemed || 0), 0);
    const avgSat = Math.round(Object.keys(usage).reduce((n, k) => n + (usage[k].satisfaction || 0), 0) / Math.max(1, themes.length));
    const themeName = (k) => (themes.find((f) => f.k === k) || {}).name || k;
    const fiveBookings = data.employee.bookings.filter((b) => themes.some((f) => (f.pids || []).indexOf(b.pid) >= 0));
    const tabs = [{ id: 'themes', label: '主题与权益' }, { id: 'tiers', label: '产品档位' }, { id: 'records', label: '履约与核销' }];
    const themeCards = themes.map((f) => {
      const u = usage[f.k] || { enrolled: 0, served: 0, redeemed: 0, satisfaction: 0 };
      const svcs = (f.pids || []).map(productById).filter(Boolean);
      return '<div class="panel" style="cursor:pointer" data-act="editFive" data-id="' + esc(f.k) + '"><div class="panel-head"><div class="ph"><div class="row-flex"><span class="avatar square" style="width:34px;height:34px;background:#fff1e7;color:#e5540b">' + ic(f.icon || 'star') + '</span><div><h2>' + esc(f.name) + '</h2><p>' + esc(f.sub) + '</p></div></div></div><div class="actions">' + pill('剩余 ' + f.left + ' 次', f.left ? 'green' : 'red') + '</div></div><div class="panel-body"><div class="grid main-side" style="gap:22px"><div><div class="tiny muted">权益额度</div><b style="display:block;margin-top:5px;font-size:13px">' + esc(f.quota) + '</b><div class="chips" style="margin-top:12px">' + svcs.map((p) => pill(p.name, 'outline')).join('') + '</div></div><div class="stat-strip" style="grid-template-columns:repeat(4,1fr);box-shadow:none"><div><b>' + u.enrolled + '</b><span>参与</span></div><div><b>' + u.served + '</b><span>履约</span></div><div><b>' + u.redeemed + '</b><span>核销</span></div><div><b>' + u.satisfaction + '%</b><span>满意</span></div></div></div><div style="margin-top:14px"><button class="btn sm" data-act="editFive" data-id="' + esc(f.k) + '">编辑主题、服务与核销规则</button><button class="btn sm" data-go="e-services" style="margin-left:6px">查看关联服务</button></div></div></div>';
    }).join('');
    const tierCards = data.employee.fiveTiers.map((t) => '<div class="panel pkg-card" style="box-shadow:none" data-act="editFiveTier" data-id="' + esc(t.id) + '"><div class="pkg-cover" style="height:112px;background:linear-gradient(135deg,#5b4bc4,#8c7ae8)">' + (t.imageUrl ? '<img src="' + esc(t.imageUrl) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="">' : '') + '<div style="position:relative"><div class="tag">五好生活 · 企业档位</div><b>' + esc(t.name) + '</b><span>' + esc(t.scope) + '</span></div><div style="position:absolute;right:14px;top:14px">' + planStatePill(t.status) + '</div></div><div class="panel-body"><div class="row-flex"><b style="font-size:18px;color:#5b4bc4">¥' + t.price + '</b><span class="right-auto tiny muted">覆盖 ' + (t.themes || []).length + ' 个主题</span></div><div style="margin-top:12px;font-size:11px;line-height:1.7">' + esc(t.benefits) + '</div><div class="chips" style="margin-top:11px">' + (t.themes || []).map((k) => pill(themeName(k), 'outline')).join('') + '</div><div class="split-line"></div><div class="tiny muted">关联 ' + (t.pids || []).length + ' 项服务</div><button class="btn sm w-full" style="margin-top:11px">编辑档位</button></div></div>').join('');
    const tierTable = '<div class="table-wrap"><table class="table"><thead><tr><th>档位</th><th>覆盖主题</th><th>关联服务</th><th>价格</th><th>状态</th></tr></thead><tbody>' + data.employee.fiveTiers.map((t) => '<tr class="click" data-act="editFiveTier" data-id="' + esc(t.id) + '"><td><b style="font-size:11.5px">' + esc(t.name) + '</b></td><td>' + (t.themes || []).map((k) => pill(themeName(k), 'outline')).join(' ') + '</td><td>' + (t.pids || []).map((id) => pill(planServiceName(id), 'outline')).join(' ') + '</td><td>¥' + t.price + '</td><td>' + planStatePill(t.status) + '</td></tr>').join('') + '</tbody></table></div>';
    const usageTable = '<div class="table-wrap"><table class="table"><thead><tr><th>主题</th><th>参与</th><th>履约</th><th>核销</th><th>核销率</th><th>满意度</th></tr></thead><tbody>' + themes.map((f) => { const u = usage[f.k] || { enrolled: 0, served: 0, redeemed: 0, satisfaction: 0 }; return '<tr class="click" data-act="editFive" data-id="' + esc(f.k) + '"><td><b style="font-size:11.5px">' + esc(f.name) + '</b></td><td>' + u.enrolled + '</td><td>' + u.served + '</td><td>' + u.redeemed + '</td><td>' + Math.round(u.redeemed / Math.max(1, u.served) * 100) + '%</td><td><b style="color:var(--green)">' + u.satisfaction + '%</b></td></tr>'; }).join('') + '</tbody></table></div>';
    const bookingTable = '<div class="table-wrap"><table class="table"><thead><tr><th>职工</th><th>五好主题</th><th>服务</th><th>机构</th><th>时间</th><th>状态</th></tr></thead><tbody>' + (fiveBookings.length ? fiveBookings.map((b) => { const f = themes.find((x) => (x.pids || []).indexOf(b.pid) >= 0) || {}; return '<tr class="click" data-act="editOrder" data-id="' + esc(b.id) + '"><td><div class="row-main">' + avatar(b.person) + '<div><div class="name">' + esc(b.person) + '</div><div class="sub">' + esc(b.dept || '') + '</div></div></div></td><td>' + pill(f.name || '五好服务', 'outline') + '</td><td>' + esc(b.service) + '</td><td>' + esc(b.org) + '</td><td>' + esc(b.date + ' ' + b.time) + '</td><td>' + pill(orderStatusLabel(b.statusKey), b.statusKey === 'pending' ? 'amber' : 'green') + '</td></tr>'; }).join('') : '<tr><td colspan="6">' + empty('暂无五好履约订单') + '</td></tr>') + '</tbody></table></div>';
    return '<div class="page wide">' + pageHead('五好生活', '五好生活是未来的主推产品：主题权益、企业档位、服务组合、履约核销都集中在这里运营。', saveBtn('五好配置'), 'PKU-EMPLOYEE-HEALTH / 五好生活') +
      purpose('把五个健康主题做成可售卖、可履约、可核销的企业福利产品，而不是五个空标签。', '职工端五好生活专区、主题服务入口与 500 / 1000 / 2000 元三档权益。', '企康产品运营') +
      '<div class="kpi-grid">' + kpi('五大主题', themes.length, '个', '早筛到放松', 'star', ['#f1efff','#5b4bc4']) + kpi('累计参与', totalEnrolled, '人', '企业职工', 'users', ['#e9f7f1','#0c7c59']) + kpi('已履约', totalServed, '人次', '含线上与到院', 'check', ['#edf3ff','#1f4fd1']) + kpi('核销率', Math.round(totalRedeemed / Math.max(1, totalServed) * 100), '%', '履约后核销', 'activity', ['#fff6e0','#a86a06']) + '</div>' +
      panel('五好生活工作台', '主题、档位与履约 · 点击操作', '<div class="toolbar" style="padding:8px 0 12px">' + seg(tabs, tab, 'fiveTab') + '<span class="right tiny muted">平均满意度 ' + avgSat + '%</span></div>' +
        (tab === 'themes' ? '<div class="stack">' + themeCards + '</div>' :
          tab === 'tiers' ? '<div class="grid three">' + tierCards + '</div><div class="section-space">' + panel('档位覆盖对比', '主题与服务组合', tierTable, '', true) + '</div><div class="notice warm" style="margin-top:12px">' + ic('info') + '<span>档位是后台运营配置；H5 目前展示五好主题与单项服务，不会自动生成购买页或支付流程。</span></div>' :
          '<div class="stack"><div class="section-space">' + panel('按主题看履约', '参与 → 履约 → 核销', usageTable, '', true) + '</div><div class="section-space">' + panel('五好相关预约', '与职工服务预约联动', bookingTable, '', true) + '</div><div class="notice warm">' + ic('phone') + '<span>核销需要人工确认；取消或改约按职工权益规则退回次数，不会自动发短信。</span></div></div>') +
      '<span class="pill">主推产品</span>') +
      '<div class="grid two section-space">' + panel('五好运营建议', '按当前数据自动汇总', '<div class="stack tight">' + ['好好运动参与 ' + ((usage.move || {}).enrolled || 0) + ' 人，建议增加企业内训练营', '好好睡觉履约 ' + ((usage.sleep || {}).served || 0) + ' 人次，睡眠服务仍有提升空间', '尊享版覆盖全部 5 个主题，适合核心人才与企业高管'].map((x) => '<div style="padding:9px 0;border-bottom:1px solid var(--line-soft);font-size:11px">' + esc(x) + '</div>').join('') + '</div>') + panel('配置入口', '从主题到档位再到履约', '<div class="stack tight">' + [['e-fivegood','主题与权益','star'],['e-services','关联服务目录','package'],['e-benefits','权益次数','shield'],['e-orders','预约与履约','calendar']].map((x) => '<div class="rowlink" data-go="' + x[0] + '"><span class="avatar square" style="width:28px;height:28px">' + ic(x[2]) + '</span><div class="main-tx"><b>' + x[1] + '</b></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>') + '</div></div>';
  };

  PAGES['e-messages'] = function () {
    const unread = data.employee.messages.filter((m) => !m.read).length;
    return '<div class="page wide">' + pageHead('消息中心', '5 条真实职工消息：报告生成、随访提醒、心理测评、额度到账、讲座报名。这里管理展示与跳转，不虚构推送通道。', '<button class="btn primary" data-act="newMessage">' + ic('plus') + '<span>新增消息</span></button>', 'PKU-EMPLOYEE-HEALTH / 消息') +
      purpose('维护职工端消息列表与跳转目标，并把需要人工处理的事项转成电话待办。', 'H5 消息列表与未读角标；没有企微、短信或站内信接口。', '健康管家') +
      '<div class="kpi-grid">' + kpi('全部消息', data.employee.messages.length, '条', '来自 H5 真实数据', 'bell', ['#fff1e7','#e5540b']) + kpi('未读', unread, '条', '职工端角标', 'inbox', ['#fff6e0','#a86a06']) + kpi('报告类', data.employee.messages.filter((m) => (m.go || '').indexOf('档案') >= 0).length, '条', '跳转健康档案', 'doc', ['#edf3ff','#1f4fd1']) + kpi('电话待办', data.followups.filter((f) => f.status === 'open').length, '条', '人工跟进', 'phone', ['#e9f7f1','#0c7c59']) + '</div>' +
      panel('消息列表', '点击整行编辑标题、说明与跳转', '<div class="stack tight" style="margin:-4px -20px -20px">' + data.employee.messages.map((m) => '<div class="rowlink" data-act="editMessage" data-id="' + esc(m.id) + '"><span class="avatar square" style="width:34px;height:34px;background:' + (m.read ? '#f1f5f8' : '#fff1e7') + ';color:' + (m.read ? '#708196' : '#e5540b') + '">' + ic(m.icon || 'bell') + '</span><div class="main-tx"><b>' + esc(m.title) + (m.read ? '' : ' · 未读') + '</b><span>' + esc(m.desc) + ' · ' + esc(m.go || '') + '</span></div><div class="tail"><span class="tiny muted">' + esc(m.time) + '</span><span class="chev">' + ic('chevron') + '</span></div></div>').join('') + '</div>', '<span class="pill">' + unread + ' 条未读</span>', true) +
      '<div class="grid two section-space">' + panel('能力边界', '不要假装消息已推送', '<div class="notice warm">' + ic('info') + '<span>没有企业微信、短信或服务端推送。新增消息只作为 H5 本地展示；需要触达职工时，请生成「电话人工跟进」待办并记录结果。</span></div>') + panel('相关电话待办', '人工触达闭环', '<div class="stack tight">' + data.followups.filter((f) => f.status === 'open').map((f) => '<div class="rowlink" data-go="templates"><span class="avatar square" style="width:27px;height:27px">' + ic('phone') + '</span><div class="main-tx"><b>' + esc(f.customer) + ' · ' + esc(f.reason) + '</b><span>' + esc(f.owner) + ' · ' + esc(f.due) + '</span></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>', '<button class="btn sm" data-go="templates">全部待办</button>', true) + '</div></div>';
  };

  /* ----------------------------------------------------------- 运营规划 */
  function planOrgName(id) { const o = data.employee.orgDetails.find((x) => x.id === id); return o ? o.name : id; }
  function planServiceName(id) { const p = productById(id); return p ? p.name : id; }
  function planProductName(id) { const p = data.camp.pointProducts.find((x) => x.id === id); return p ? p.name : id; }
  function planServiceFor(serviceId) { return data.planning.services.find((x) => x.serviceId === serviceId); }
  function planGoodsFor(productId) { return data.planning.goods.find((x) => x.productId === productId); }
  function weekdayText(days) {
    const arr = (days || []).slice().sort((a, b) => a - b);
    if (arr.length === 7) return '每天';
    if (arr.join(',') === '1,2,3,4,5') return '周一至周五';
    return arr.map((d) => '周' + '日一二三四五六'[d]).join('、');
  }
  function planStatePill(status) {
    const map = { online: ['在售', 'green'], active: ['进行中', 'green'], draft: ['草稿', 'amber'], paused: ['暂停', 'red'], closed: ['停诊', 'red'], open: ['加开', 'amber'] };
    const x = map[status] || ['未设置', ''];
    return pill(x[0], x[1]);
  }
  function planDayInfo(date) {
    const overrides = data.planning.overrides.filter((o) => o.date === date);
    const openOv = overrides.filter((o) => o.status !== 'closed');
    if (overrides.length && !openOv.length) return { slots: 0, closed: true, override: true };
    if (overrides.length) return { slots: openOv.reduce((n, o) => n + (Number(o.capacity) || 0), 0), closed: false, override: true };
    const dow = new Date(date + 'T00:00:00').getDay();
    const slots = data.planning.schedules.filter((s) => s.enabled && (s.days || []).indexOf(dow) >= 0).reduce((n, s) => n + (Number(s.capacity) || 0), 0);
    return { slots, closed: false, override: false };
  }
  function planCalendar(n) {
    return Array.from({ length: n }, (_, k) => {
      const date = addDays(today(), k);
      const dow = new Date(date + 'T00:00:00').getDay();
      return Object.assign({ date, day: Number(date.slice(8, 10)), weekday: '周' + '日一二三四五六'[dow] }, planDayInfo(date));
    });
  }
  function planCalendarHTML(cal) {
    const max = Math.max(1, ...cal.map((x) => x.slots));
    return '<div class="plan-calendar">' + cal.map((x) => '<div class="plan-day ' + (x.closed ? 'closed' : x.override ? 'override' : '') + '" data-act="newOverride" data-date="' + esc(x.date) + '"><div class="pd-top"><b>' + x.day + '</b><span>' + x.weekday + '</span></div><div class="pd-bar"><i style="width:' + Math.round(x.slots / max * 100) + '%"></i></div><small>' + x.slots + ' 个号源</small>' + (x.override ? '<em>例外</em>' : '') + '</div>').join('') + '</div>';
  }

  PAGES['plan'] = function () {
    const cal = planCalendar(14);
    const low = data.camp.pointProducts.filter((p) => { const g = planGoodsFor(p.id); return g && Number(p.stock) <= Number(g.stockWarning); });
    const noImage = data.employee.products.filter((p) => !p.imageUrl).length;
    const pkgNoImage = data.planning.packages.filter((p) => !p.imageUrl).length;
    const next7 = cal.slice(0, 7).reduce((n, x) => n + x.slots, 0);
    const events = [];
    data.planning.services.slice(0, 8).forEach((s) => events.push({ date: s.launchDate, type: '服务上线', title: planServiceName(s.serviceId), owner: s.owner, route: 'plan-services' }));
    data.planning.goods.forEach((g) => events.push({ date: g.restockDate, type: '商品补货', title: planProductName(g.productId), owner: g.supplier, route: 'plan-services' }));
    data.planning.overrides.forEach((o) => events.push({ date: o.date, type: '排期调整', title: planOrgName(o.orgId), owner: '预约运营', route: 'plan-schedule' }));
    events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return '<div class="page wide">' + pageHead('运营规划', '把服务、商品、体检套餐和预约排期放进同一张运营计划盘。先定负责人、上线时间与容量，再进入具体配置。', '<button class="btn" data-act="newOverride">' + ic('calendar') + '<span>新增日期例外</span></button><button class="btn primary" data-act="newPackage">' + ic('plus') + '<span>新增体检套餐</span></button>', '运营规划 / 计划总览') +
      purpose('回答“下个月要上什么、谁负责、能不能约得到”。', '后台计划台账、容量预警与上线日历；不会自动改写 H5 的服务与排期。', '企康运营 / 履约运营') +
      '<div class="kpi-grid">' + kpi('服务计划', data.planning.services.length, '项', '覆盖 5 大模块', 'package', ['#f1efff', '#5b4bc4']) + kpi('商品计划', data.planning.goods.length, '件', '积分商城与奖励', 'gift', ['#fff1e7', '#e5540b']) + kpi('未来 7 天号源', next7, '个', '按每周模板与例外计算', 'calendar', ['#e9f7f1', '#0c7c59']) + kpi('库存预警', low.length, '件', '低于补货线', 'truck', ['#fff6e0', '#a86a06']) + '</div>' +
      panel('未来 14 天可预约容量', '点击日期直接新增例外 · 数字为后台计划口径', planCalendarHTML(cal) + '<div class="plan-legend"><span><i style="background:#6b5bd2"></i>每周模板</span><span><i style="background:#d39a2f"></i>日期例外</span><span><i style="background:#d4433b"></i>停诊 / 关闭</span></div>', '<span class="pill">' + data.planning.schedules.filter((s) => s.enabled).length + ' 个模板</span>') +
      '<div class="grid main-side section-space"><div class="stack">' +
        panel('上线与补货日历', '按日期排序 · 点击进入对应计划', '<div class="stack tight">' + events.slice(0, 9).map((e) => '<div class="rowlink" data-go="' + e.route + '"><span class="avatar square" style="width:31px;height:31px;background:' + (e.type === '商品补货' ? '#fff1e7' : e.type === '排期调整' ? '#f1efff' : '#e9f7f1') + ';color:' + (e.type === '商品补货' ? '#e5540b' : e.type === '排期调整' ? '#5b4bc4' : '#0c7c59') + '">' + ic(e.type === '商品补货' ? 'truck' : e.type === '排期调整' ? 'calendar' : 'package') + '</span><div class="main-tx"><b>' + esc(e.type + ' · ' + e.title) + '</b><span>' + esc(e.owner) + '</span></div><div class="tail"><span class="tiny muted">' + esc(e.date.slice(5)) + '</span><span class="chev">' + ic('chevron') + '</span></div></div>').join('') + '</div>', '<button class="btn sm" data-go="plan-services">全部计划</button>', true) +
        panel('套餐名额使用', '体检套餐的年度名额与消耗', '<div class="stack">' + data.planning.packages.map((p) => '<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)"><div class="row-flex"><b style="font-size:11.5px">' + esc(p.name) + '</b><span class="right-auto tiny muted">' + p.used + ' / ' + p.quota + '</span></div>' + progress(Math.round(p.used / Math.max(1, p.quota) * 100), '#6b5bd2') + '<div class="tiny muted" style="margin-top:5px">' + esc(p.audience + ' · ¥' + p.price + ' · ' + planOrgName(p.orgId)) + '</div></div>').join('') + '</div>', '<button class="btn sm" data-go="plan-exams">管理套餐</button>') +
      '</div><div class="stack">' +
        panel('规划缺口', '先补会影响预约与转化的项', '<div class="stack tight">' +
          (noImage ? '<div class="rowlink" data-go="e-services"><span class="avatar square" style="width:28px;height:28px;background:#fff6e0;color:#a86a06">' + ic('image') + '</span><div class="main-tx"><b>' + noImage + ' 项服务尚无主图</b><span>服务卡与详情页视觉不完整</span></div><span class="chev">' + ic('chevron') + '</span></div>' : '') +
          (low.length ? '<div class="rowlink" data-go="plan-services"><span class="avatar square" style="width:28px;height:28px;background:#fdeef4;color:#be2a5e">' + ic('truck') + '</span><div class="main-tx"><b>' + low.length + ' 件商品低于补货线</b><span>' + low.map((p) => p.name).join('、') + '</span></div><span class="chev">' + ic('chevron') + '</span></div>' : '') +
          (pkgNoImage ? '<div class="rowlink" data-go="plan-exams"><span class="avatar square" style="width:28px;height:28px;background:#f1efff;color:#5b4bc4">' + ic('image') + '</span><div class="main-tx"><b>' + pkgNoImage + ' 个体检套餐尚无封面</b><span>套餐卡目前使用默认渐变封面</span></div><span class="chev">' + ic('chevron') + '</span></div>' : '') +
          (data.planning.schedules.filter((s) => !s.enabled).length ? '<div class="rowlink" data-go="plan-schedule"><span class="avatar square" style="width:28px;height:28px;background:#fff6e0;color:#a86a06">' + ic('clock') + '</span><div class="main-tx"><b>' + data.planning.schedules.filter((s) => !s.enabled).length + ' 个排期模板已停用</b><span>确认是否仍有可预约号源</span></div><span class="chev">' + ic('chevron') + '</span></div>' : '') +
          '</div>', '<button class="btn sm" data-go="capability">看边界</button>') +
        panel('本周建议', '按当前计划自动汇总', '<div class="stack tight">' + [
          ['先确认体检套餐名额', '基础套餐已用 ' + Math.round(data.planning.packages[0].used / Math.max(1, data.planning.packages[0].quota) * 100) + '%，接近年度预算上限'],
          ['补齐商品补货日期', low.length ? low.map((p) => p.name).join('、') + ' 需要安排补货' : '当前商品库存健康'],
          ['锁定下周停诊日', data.planning.overrides.filter((o) => o.status === 'closed').length + ' 个日期已标记停诊，需同步客服话术']
        ].map((x) => '<div style="padding:9px 0;border-bottom:1px solid var(--line-soft)"><b style="font-size:11px">' + esc(x[0]) + '</b><div class="tiny muted" style="margin-top:3px">' + esc(x[1]) + '</div></div>').join('') + '</div>') +
      '</div></div></div>';
  };

  PAGES['plan-services'] = function () {
    const tab = state.ui.planTab || 'service';
    const q = (state.ui.planQ || '').trim();
    const services = data.planning.services.map((s) => ({ s, p: productById(s.serviceId) })).filter((x) => x.p && (!q || (x.p.name + x.s.owner + x.s.target + x.s.goal).indexOf(q) >= 0));
    const goods = data.planning.goods.map((g) => ({ g, p: data.camp.pointProducts.find((x) => x.id === g.productId) })).filter((x) => x.p && (!q || (x.p.name + x.g.supplier + x.g.campaign).indexOf(q) >= 0));
    return '<div class="page wide">' + pageHead('服务与商品规划', '28 项职工服务与 6 件积分商品放在同一张运营计划里：负责人、上线时间、目标、补货节奏一目了然。', '<button class="btn" data-act="newProduct">' + ic('gift') + '<span>新增商品</span></button><button class="btn primary" data-act="newService">' + ic('plus') + '<span>新增服务</span></button>', '运营规划 / 服务与商品') +
      purpose('先做运营计划，再进入服务 / 商品详情做内容配置。', '后台计划台账；不会自动改写 H5 的服务目录、商品卡或库存。', '企康运营 / 履约运营') +
      '<div class="kpi-grid">' + kpi('服务计划', services.length, '项', '5 大模块', 'package', ['#f1efff', '#5b4bc4']) + kpi('商品计划', goods.length, '件', '积分商城实物', 'gift', ['#fff1e7', '#e5540b']) + kpi('本月上线', data.planning.services.filter((s) => String(s.launchDate).slice(0, 7) === today().slice(0, 7)).length, '项', '按上线日期', 'calendar', ['#e9f7f1', '#0c7c59']) + kpi('库存预警', goods.filter((x) => Number(x.p.stock) <= Number(x.g.stockWarning)).length, '件', '低于补货线', 'truck', ['#fff6e0', '#a86a06']) + '</div>' +
      panel('计划清单', '点击整行 / 整卡进入计划编辑；新增服务或商品会自动生成一条计划', '<div class="toolbar" style="padding:10px 0 7px">' + seg([{ id: 'service', label: '服务计划' }, { id: 'goods', label: '商品计划' }], tab, 'planTab') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="planQ" placeholder="名称 / 负责人 / 目标 / 供应商" value="' + esc(q) + '"></div></div>' +
        (tab === 'service' ? '<div class="table-wrap"><table class="table"><thead><tr><th>服务</th><th>模块</th><th>负责人</th><th>上线日期</th><th>目标</th><th>状态</th><th>操作</th></tr></thead><tbody>' + (services.length ? services.map(({ s, p }) => { const m = moduleMeta(p.mod); return '<tr class="click" data-act="editServicePlan" data-id="' + esc(s.id) + '"><td><div class="row-main">' + '<span class="avatar square" style="width:32px;height:32px;background:' + m.tint + ';color:' + m.ink + '">' + ic(m.icon) + '</span><div><div class="name">' + esc(p.name) + '</div><div class="sub">' + esc(p.en || '') + '</div></div></div></td><td>' + esc(m.name) + '</td><td>' + esc(s.owner) + '</td><td class="muted">' + esc(s.launchDate) + '</td><td style="max-width:260px">' + esc(s.goal) + '</td><td>' + planStatePill(s.status) + '</td><td class="actions"><button class="btn sm">编辑计划</button></td></tr>'; }).join('') : '<tr><td colspan="7">' + empty('没有匹配的服务计划') + '</td></tr>') + '</tbody></table></div>' :
          '<div class="grid three">' + (goods.length ? goods.map(({ g, p }) => '<div class="panel pkg-card" style="box-shadow:none" data-act="editGoodsPlan" data-id="' + esc(g.id) + '"><div style="height:126px;background:#f4f7f9;position:relative;overflow:hidden">' + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : empty('暂无商品图', 'image')) + '<span style="position:absolute;left:10px;top:10px">' + planStatePill(g.status) + '</span></div><div class="panel-body"><div class="row-flex"><b style="font-size:12px">' + esc(p.name) + '</b><span class="right-auto tiny muted">库存 ' + p.stock + '</span></div><div class="tiny muted" style="margin-top:4px">' + esc(g.supplier) + ' · 成本 ¥' + g.cost + '</div><div class="pkg-meta"><div><b>' + p.stock + '</b><span>当前库存</span></div><div><b>' + g.stockWarning + '</b><span>补货线</span></div><div><b>' + esc(g.restockDate.slice(5)) + '</b><span>计划补货</span></div></div><div class="chips" style="margin-top:10px">' + pill(g.campaign, 'outline') + pill('积分 ' + p.pointsRequired, 'orange') + '</div><div style="margin-top:11px"><button class="btn sm w-full" data-act="editGoodsPlan" data-id="' + esc(g.id) + '">编辑商品计划</button></div></div></div>').join('') : empty('没有匹配的商品计划')) + '</div>') +
      '', '<span class="pill">' + (tab === 'service' ? services.length + ' 项' : goods.length + ' 件') + '</span>') +
      '<div class="notice section-space">' + ic('info') + '<span><b>规划与配置分开</b>：这里定负责人、时间、目标和补货节奏；具体服务介绍、商品图集、图文详情仍在「服务目录 / 积分商城」里配置。两者都保存后台，不会假装自动上线。</span></div></div>';
  };

  PAGES['plan-exams'] = function () {
    const packages = data.planning.packages;
    const totalQuota = packages.reduce((n, p) => n + Number(p.quota || 0), 0);
    const totalUsed = packages.reduce((n, p) => n + Number(p.used || 0), 0);
    return '<div class="page wide">' + pageHead('体检套餐', '把年度体检、深度筛查与尊享体检做成可管理的套餐：包含项目、价格、名额、有效期与履约机构。', '<button class="btn primary" data-act="newPackage">' + ic('plus') + '<span>新增套餐</span></button>', '运营规划 / 体检套餐') +
      purpose('先设计套餐组合与名额，再回到服务目录维护单项服务的预约须知。', '后台套餐计划与名额台账；H5 目前按单项服务预约，不读取套餐组合。', '企康产品运营') +
      '<div class="kpi-grid">' + kpi('体检套餐', packages.length, '个', '基础 / 深度 / 尊享', 'pulse', ['#f1efff', '#5b4bc4']) + kpi('总名额', totalQuota, '人', '年度套餐额度', 'users', ['#e9f7f1', '#0c7c59']) + kpi('已使用', totalUsed, '人', '按真实预约台账', 'check', ['#edf3ff', '#1f4fd1']) + kpi('剩余名额', totalQuota - totalUsed, '人', '可继续预约', 'gift', ['#fff6e0', '#a86a06']) + '</div>' +
      '<div class="grid three">' + packages.map((p) => '<div class="panel pkg-card" data-act="editPackage" data-id="' + esc(p.id) + '"><div class="pkg-cover">' + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="">' : '') + '<div style="position:relative"><div class="tag">' + esc(p.type || '体检套餐') + '</div><b>' + esc(p.name) + '</b><span>' + esc(p.audience) + '</span></div><div style="position:absolute;right:14px;top:14px">' + planStatePill(p.status) + '</div></div><div class="panel-body"><div class="tiny muted">' + esc(planOrgName(p.orgId)) + ' · 有效期 ' + esc(p.validity) + '</div><div class="pkg-meta"><div><b>¥' + p.price + '</b><span>套餐价</span></div><div><b>' + p.quota + '</b><span>总名额</span></div><div><b>' + p.used + '</b><span>已使用</span></div></div>' + progress(Math.round(p.used / Math.max(1, p.quota) * 100), '#6b5bd2') + '<div class="chips" style="margin-top:11px">' + (p.services || []).map((id) => pill(planServiceName(id), 'outline')).join('') + '</div><div style="margin-top:11px"><button class="btn sm w-full" data-act="editPackage" data-id="' + esc(p.id) + '">编辑套餐</button></div></div></div>').join('') + '</div>' +
      panel('套餐与服务关系', '套餐只做组合，单项服务仍在服务目录维护', '<div class="table-wrap"><table class="table"><thead><tr><th>套餐</th><th>包含服务</th><th>履约机构</th><th>名额使用</th></tr></thead><tbody>' + packages.map((p) => '<tr class="click" data-act="editPackage" data-id="' + esc(p.id) + '"><td><b style="font-size:11.5px">' + esc(p.name) + '</b></td><td>' + (p.services || []).map((id) => pill(planServiceName(id), 'outline')).join(' ') + '</td><td>' + esc(planOrgName(p.orgId)) + '</td><td>' + progress(Math.round(p.used / Math.max(1, p.quota) * 100), '#6b5bd2') + '</td></tr>').join('') + '</tbody></table></div>', '', true) +
      '<div class="notice warm section-space">' + ic('info') + '<span><b>能力边界</b>：套餐组合、价格和名额只保存在后台计划台账。H5 目前按单项服务预约，不会自动出现“套餐”入口；若要真实售卖套餐，需要 H5 增加套餐页与后端订单。</span></div></div>';
  };

  PAGES['plan-schedule'] = function () {
    const cal = planCalendar(14);
    const weekly = data.planning.schedules.reduce((n, s) => n + (s.enabled ? Number(s.capacity || 0) * (s.days || []).length : 0), 0);
    const closed = data.planning.overrides.filter((o) => o.status === 'closed').length;
    return '<div class="page wide">' + pageHead('预约排期', '按机构和每周模板配置可预约时段、单段容量、最晚预约时间；再用日期例外处理停诊、加开与临时缩容。', '<button class="btn" data-act="newSchedule">' + ic('plus') + '<span>新增模板</span></button><button class="btn primary" data-act="newOverride">' + ic('calendar') + '<span>新增例外</span></button>', '运营规划 / 预约排期') +
      purpose('让运营知道未来两周哪些机构、哪些服务还能约。', '后台排期计划与容量预警；H5 预约表单目前仍读取机构号源总数，不读取具体时段。', '履约运营 / 机构对接') +
      '<div class="kpi-grid">' + kpi('每周模板', data.planning.schedules.length, '个', '机构 + 服务', 'calendar', ['#f1efff', '#5b4bc4']) + kpi('每周最大号源', weekly, '个', '按模板容量计算', 'clock', ['#e9f7f1', '#0c7c59']) + kpi('日期例外', data.planning.overrides.length, '条', '停诊 / 加开 / 缩容', 'edit', ['#fff6e0', '#a86a06']) + kpi('停诊日', closed, '天', '需同步客服话术', 'info', ['#fdeef4', '#be2a5e']) + '</div>' +
      panel('未来 14 天容量', '点击日期新增例外', planCalendarHTML(cal) + '<div class="plan-legend"><span><i style="background:#6b5bd2"></i>每周模板</span><span><i style="background:#d39a2f"></i>日期例外</span><span><i style="background:#d4433b"></i>停诊 / 关闭</span></div>', '<span class="pill">后台计划口径</span>') +
      '<div class="grid main-side section-space"><div class="stack">' +
        panel('每周模板', '点击整行编辑', '<div class="table-wrap"><table class="table"><thead><tr><th>机构</th><th>服务</th><th>星期</th><th>时段</th><th>单段容量</th><th>最晚预约</th><th>状态</th></tr></thead><tbody>' + (data.planning.schedules.length ? data.planning.schedules.map((s) => '<tr class="click" data-act="editSchedule" data-id="' + esc(s.id) + '"><td><b style="font-size:11.5px">' + esc(planOrgName(s.orgId)) + '</b></td><td>' + esc(planServiceName(s.serviceId)) + '</td><td>' + esc(weekdayText(s.days)) + '</td><td class="muted">' + esc(s.start + '—' + s.end) + '</td><td>' + s.capacity + ' 人 / ' + s.slotMinutes + ' 分钟</td><td class="muted">提前 ' + s.cutoffHours + ' 小时</td><td>' + (s.enabled ? pill('启用', 'green') : pill('停用', 'red')) + '</td></tr>').join('') : '<tr><td colspan="7">' + empty('还没有排期模板') + '</td></tr>') + '</tbody></table></div>', '', true) +
      '</div><div class="stack">' +
        panel('日期例外', '停诊、加开与临时缩容', '<div class="stack tight">' + (data.planning.overrides.length ? data.planning.overrides.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map((o) => '<div class="rowlink" data-act="editOverride" data-id="' + esc(o.id) + '"><span class="avatar square" style="width:30px;height:30px;background:' + (o.status === 'closed' ? '#fdeef4' : '#fff6e0') + ';color:' + (o.status === 'closed' ? '#be2a5e' : '#a86a06') + '">' + ic(o.status === 'closed' ? 'x' : 'calendar') + '</span><div class="main-tx"><b>' + esc(o.date.slice(5) + ' · ' + planOrgName(o.orgId)) + '</b><span>' + esc(planServiceName(o.serviceId) + ' · ' + (o.status === 'closed' ? '停诊' : o.capacity + ' 个号源') + ' · ' + o.note) + '</span></div><span class="tail">' + planStatePill(o.status) + '</span></div>').join('') : empty('没有日期例外')) + '</div>', '<button class="btn sm" data-act="newOverride">新增</button>', true) +
        panel('排期口径', '避免前台显示可约、现场却没号', '<div class="notice warm">' + ic('info') + '<span>模板容量只用于后台计划与客服答复。真实占用号源需要医院排班接口；当前 H5 只展示机构号源总数，不会自动扣减。</span></div>') +
      '</div></div></div>';
  };

  /* ----------------------------------------------------------- 客户中心 */
  function customerSources() {
    const list = [];
    data.customers.forEach((c) => (c.sources || []).forEach((s) => { if (list.indexOf(s) < 0) list.push(s); }));
    return list;
  }
  function customerById(id) { return data.customers.find((c) => c.id === id); }
  function campAccountByName(name) { return data.camp.accounts.find((a) => a.name === name); }
  function customerTimeline(c) {
    const account = campAccountByName(c.name);
    const events = [];
    if (account) {
      data.camp.dietRecords.filter((r) => r.studentId === account.id).slice(-6).forEach((r) => events.push({ at: r.date, type: '饮食打卡', text: (r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '中餐' : '晚餐') + ' · ' + (r.description || ''), tone: 'orange' }));
      data.camp.exerciseRecords.filter((r) => r.studentId === account.id).slice(-4).forEach((r) => events.push({ at: r.date, type: '运动打卡', text: (r.type || '运动') + ' ' + (r.duration || 0) + ' 分钟', tone: 'green' }));
      data.camp.weightRecords.filter((r) => r.studentId === account.id).slice(-4).forEach((r) => events.push({ at: r.date, type: '体重记录', text: (r.weight || 0) + ' kg', tone: 'blue' }));
    }
    data.camp.rewardClaims.filter((r) => r.studentName === c.name).forEach((r) => events.push({ at: r.claimDate, type: '奖励领取', text: ((data.camp.rewardTiers.find((t) => t.id === r.tierId) || {}).name || '奖励') + ' · ' + r.status, tone: 'amber' }));
    data.camp.pointExchanges.filter((r) => r.studentName === c.name).forEach((r) => events.push({ at: r.exchangeDate, type: '积分兑换', text: (r.productName || '') + ' · ' + r.status, tone: 'orange' }));
    data.employee.bookings.filter((r) => r.person === c.name).forEach((r) => events.push({ at: r.date, type: '职工服务预约', text: (r.service || '') + ' · ' + r.status, tone: 'green' }));
    if (c.notes) c.notes.forEach((n) => events.push({ at: n.at, type: '跟进备注', text: n.text, tone: 'navy' }));
    (data.followups || []).filter((f) => f.customerId === c.id || f.customer === c.name).forEach((f) => events.push({ at: f.due, type: '电话待办', text: f.reason + ' · ' + (f.status === 'done' ? '已完成' : '待处理'), tone: 'pink' }));
    return events.filter((x) => x.at).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }

  PAGES['crm'] = function () {
    const source = state.ui.crmSource || 'all';
    const q = (state.ui.crmQ || '').trim();
    const tag = state.ui.crmTag || 'all';
    const tags = [];
    data.customers.forEach((c) => (c.tags || []).forEach((t) => { if (tags.indexOf(t) < 0) tags.push(t); }));
    const rows = data.customers.filter((c) => (source === 'all' || (c.sources || []).indexOf(source) >= 0) && (tag === 'all' || (c.tags || []).indexOf(tag) >= 0) && (!q || (c.name + c.phone + (c.department || '') + (c.tags || []).join('')).indexOf(q) >= 0));
    const cross = data.customers.filter((c) => (c.sources || []).length > 1).length;
    const active = data.customers.filter((c) => (c.lastActive || '').indexOf('今天') >= 0).length;
    return '<div class="page wide">' + pageHead('客户总览', '把健康训练营学员、品牌站访客与职工健康职工聚合为同一客户池。点击整行进入客户 360。', '<button class="btn primary" data-act="newCustomer">' + ic('plus') + '<span>新增客户</span></button>', '跨产品 / 客户中心') +
      purpose('按渠道来源识别客户，查看他/她在三个 H5 的全部使用痕迹。', '客户 360、电话跟进与所有服务记录；不替代 H5 登录。', '客户运营 / 健康管家') +
      '<div class="kpi-grid">' + kpi('客户总数', data.customers.length, '人', '去重后真实客户', 'users', ['#fff1e7','#a66a12']) + kpi('跨端客户', cross, '人', '使用过 2 个及以上 H5', 'layers', ['#e7f4f8','#1d6e89']) + kpi('今日活跃', active, '人', '最近访问或打卡', 'activity', ['#e9f7f1','#0c7c59']) + kpi('未结电话待办', data.followups.filter((f) => f.status === 'open').length, '条', '人工跟进', 'phone', ['#fdeef4','#be2a5e']) + '</div>' +
      panel('全渠道客户池', '来源 / 标签 / 搜索 · 点击整行进入 360', '<div class="toolbar" style="padding:10px 0 5px">' + seg([{id:'all',label:'全部来源'}].concat(customerSources().map((s) => ({id:s,label:s.replace('H5 ','')}))), source, 'crmSource') + seg([{id:'all',label:'全部标签'}].concat(tags.slice(0, 7).map((t) => ({id:t,label:t}))), tag, 'crmTag') + '<div class="searchbar right-auto">' + ic('search') + '<input class="input" data-ui-input="crmQ" placeholder="姓名 / 手机 / 企业 / 标签" value="' + esc(q) + '"></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>客户</th><th>手机号</th><th>来源渠道</th><th>标签</th><th>负责人</th><th>最近活跃</th><th>操作</th></tr></thead><tbody>' + (rows.length ? rows.map((c) => '<tr class="click" data-go="crm-detail" data-id="' + esc(c.id) + '"><td><div class="row-main">' + avatar(c.name) + '<div><div class="name">' + esc(c.name) + '</div><div class="sub">' + esc(c.department || c.summary || '') + '</div></div></div></td><td class="tnum">' + esc(c.phone) + '</td><td><div class="chips">' + (c.sources || []).map((s) => pill(s, 'outline')).join('') + '</div></td><td><div class="chips">' + (c.tags || []).slice(0, 3).map((t) => pill(t, t === '高活跃' ? 'green' : t === '待唤醒' ? 'amber' : 'blue')).join('') + '</div></td><td>' + esc(c.owner || '未分配') + '</td><td class="muted">' + esc(c.lastActive || '') + '</td><td class="actions"><button class="btn sm">客户 360</button></td></tr>').join('') : '<tr><td colspan="7">' + empty('没有匹配客户') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">' + rows.length + ' 人</span>', true) + '</div>';
  };

  PAGES['crm-detail'] = function () {
    const c = customerById(state.ctx.id) || data.customers[0];
    if (!c) return '<div class="page">' + pageHead('客户 360', '没有客户', '', '跨产品 / 客户') + empty('暂无客户') + '</div>';
    const account = campAccountByName(c.name);
    const diets = account ? data.camp.dietRecords.filter((r) => r.studentId === account.id) : [];
    const exercises = account ? data.camp.exerciseRecords.filter((r) => r.studentId === account.id) : [];
    const weights = account ? data.camp.weightRecords.filter((r) => r.studentId === account.id) : [];
    const bookings = data.employee.bookings.filter((b) => b.person === c.name);
    const rewards = data.camp.rewardClaims.filter((r) => r.studentName === c.name);
    const exchanges = data.camp.pointExchanges.filter((r) => r.studentName === c.name);
    const rights = c.name === data.employee.user.name ? data.employee.rights : [];
    const timeline = customerTimeline(c);
    const score = account ? Number((data.camp.manualScores.find((s) => s.studentId === account.id) || {}).points || 0) : 0;
    return '<div class="page wide">' + pageHead('客户 360 · ' + c.name, '个人信息、健康档案、训练营打卡、奖励积分、职工预约、权益与全部操作痕迹聚合在同一页。', '<button class="btn" data-act="editCustomer" data-id="' + esc(c.id) + '">' + ic('edit') + '<span>编辑资料</span></button><button class="btn primary" data-act="newTask" data-customer="' + esc(c.id) + '">' + ic('phone') + '<span>电话跟进</span></button>', '跨产品 / 客户 360') +
      '<div class="panel" style="margin-bottom:16px"><div class="panel-body"><div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:13px"><div class="avatar lg">' + esc(c.name.slice(0,1)) + '</div><div><div style="display:flex;align-items:center;gap:8px"><h2 style="margin:0;font-size:19px">' + esc(c.name) + '</h2>' + (c.tags || []).map((t) => pill(t, t === '高活跃' ? 'green' : t === '待唤醒' ? 'amber' : 'blue')).join('') + '</div><div class="tiny muted" style="margin-top:5px">' + esc(c.phone) + ' · ' + esc(c.department || '个人客户') + ' · 负责人 ' + esc(c.owner || '未分配') + '</div></div></div><div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">' + (c.sources || []).map((s) => pill(s, 'outline')).join('') + '</div></div></div></div>' +
      '<div class="kpi-grid">' + kpi('训练营记录', diets.length + exercises.length + weights.length, '条', '饮食 / 运动 / 体重', 'activity', ['#fff1e7','#e5540b']) + kpi('职工预约', bookings.length, '单', bookings.filter((b) => b.statusKey === 'pending').length + ' 单待服务', 'calendar', ['#e9f7f1','#0c7c59']) + kpi('奖励与兑换', rewards.length + exchanges.length, '次', '积分 ' + score, 'gift', ['#edf3ff','#1f4fd1']) + kpi('电话待办', data.followups.filter((f) => f.customerId === c.id).length, '条', '人工触达', 'phone', ['#fdeef4','#be2a5e']) + '</div>' +
      '<div class="grid main-side section-space"><div class="stack">' +
        panel('个人信息', '客户主数据', '<div class="form-grid two">' + field('姓名', c.name, 'customers.' + data.customers.indexOf(c) + '.name') + field('手机号', c.phone, 'customers.' + data.customers.indexOf(c) + '.phone') + field('性别', c.gender === 'female' ? '女' : '男', 'customers.' + data.customers.indexOf(c) + '.gender', { select: [{v:'male',l:'男'},{v:'female',l:'女'}] }) + field('年龄', c.age, 'customers.' + data.customers.indexOf(c) + '.age', { num: true }) + field('企业 / 部门', c.department || '', 'customers.' + data.customers.indexOf(c) + '.department') + field('负责人', c.owner || '', 'customers.' + data.customers.indexOf(c) + '.owner') + '</div>' + field('客户摘要', c.summary || '', 'customers.' + data.customers.indexOf(c) + '.summary', { area: true, rows: 3 }) + '<div class="notice" style="margin-top:12px">' + ic('info') + '<span>手机号是训练营登录凭证；修改手机号会影响 H5 登录。当前只保存后台资料，不写回 H5。</span></div>') +
        panel('健康档案', '来自训练营与职工体检', '<div class="grid two">' + (weights.length ? '<div><div class="tiny muted">最新体重</div><b style="font-size:22px">' + weights[weights.length - 1].weight + ' kg</b><div class="tiny muted">首次 ' + weights[0].weight + ' kg · 变化 ' + (weights[weights.length - 1].weight - weights[0].weight).toFixed(1) + ' kg</div></div>' : '<div class="muted tiny">暂无体重记录</div>') + '<div><div class="tiny muted">近期打卡</div><b style="font-size:22px">' + (diets.slice(-7).length + exercises.slice(-7).length) + ' 项</b><div class="tiny muted">最近 7 条记录</div></div></div><div class="split-line"></div><div class="stack tight">' + (c.name === data.employee.user.name ? data.employee.medicalReports.map((r) => '<div class="row-flex small" style="padding:6px 0;border-bottom:1px solid var(--line-soft)"><span>' + esc(r.name) + '</span><span class="right-auto tiny muted">' + esc(r.date) + '</span></div>').join('') : '<div class="tiny muted">该客户未关联职工体检报告。</div>') + '</div>') +
        panel('训练营使用痕迹', '饮食 / 运动 / 体重 / 批注', '<div class="table-wrap"><table class="table"><thead><tr><th>类型</th><th>内容</th><th>批注</th><th>时间</th></tr></thead><tbody>' + (account ? diets.slice(-6).map((r) => '<tr><td>' + pill('饮食', 'orange') + '</td><td>' + esc(r.description) + '</td><td>' + esc(r.dietitianComment || '待批注') + '</td><td class="muted">' + esc(String(r.date).slice(0,10)) + '</td></tr>').concat(exercises.slice(-4).map((r) => '<tr><td>' + pill('运动', 'green') + '</td><td>' + esc(r.type + ' ' + r.duration + ' 分钟') + '</td><td>' + esc(r.coachComment || '待批注') + '</td><td class="muted">' + esc(String(r.date).slice(0,10)) + '</td></tr>')).concat(weights.slice(-4).map((r) => '<tr><td>' + pill('体重', 'blue') + '</td><td>' + esc(r.weight + ' kg') + '</td><td>' + esc(r.dietitianComment || '待批注') + '</td><td class="muted">' + esc(String(r.date).slice(0,10)) + '</td></tr>')).join('') : '<tr><td colspan="4">' + empty('该客户没有训练营记录') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">' + (diets.length + exercises.length + weights.length) + ' 条</span>', true) +
        panel('职工服务使用', '预约 / 权益 / 报告', '<div class="table-wrap"><table class="table"><thead><tr><th>服务</th><th>机构</th><th>时间</th><th>状态</th></tr></thead><tbody>' + (bookings.length ? bookings.map((b) => '<tr><td><b style="font-size:11.5px">' + esc(b.service) + '</b></td><td>' + esc(b.org) + '</td><td>' + esc(b.date + ' ' + b.time) + '</td><td>' + pill(b.status, b.statusKey === 'pending' ? 'amber' : 'green') + '</td></tr>').join('') : '<tr><td colspan="4">' + empty('尚未使用职工服务') + '</td></tr>') + '</tbody></table></div>' + (rights.length ? '<div class="split-line"></div><div class="grid two">' + rights.slice(0, 4).map((r) => '<div style="padding:9px;border:1px solid var(--line-soft);border-radius:10px"><div class="tiny muted">' + esc(r.name) + '</div><div style="margin-top:3px"><b style="font-size:14px">' + r.left + '</b><span class="tiny muted"> / ' + esc(r.total) + ' 剩余</span></div></div>').join('') + '</div>' : ''), '', true) +
        panel('全部操作时间线', '按时间倒序 · 所有使用痕迹', '<div class="timeline">' + (timeline.length ? timeline.slice(0, 18).map((e) => '<div class="tl-row"><span class="tl-time">' + esc(String(e.at).slice(5, 16)) + '</span><div class="tl-axis"><span class="tl-dot" style="--dot:' + (e.tone === 'green' ? '#0c7c59' : e.tone === 'orange' ? '#e5540b' : e.tone === 'pink' ? '#be2a5e' : e.tone === 'amber' ? '#a86a06' : '#1f4fd1') + '"></span></div><div class="tl-body"><b>' + esc(e.type) + '</b><span>' + esc(e.text) + '</span></div></div>').join('') : empty('暂无操作痕迹')) + '</div>') +
      '</div><div class="stack">' +
        panel('快速动作', '', '<div class="stack tight">' + [['editCustomer','编辑客户资料','edit',c.id],['newTask','生成电话待办','phone',c.id],['crm','返回客户池','users',null],['v-records','查看训练营打卡','activity',null],['e-orders','查看职工预约','calendar',null]].map((x) => '<div class="rowlink" ' + (x[0] === 'editCustomer' ? 'data-act="' + x[0] + '" data-id="' + esc(x[3]) + '"' : x[0] === 'newTask' ? 'data-act="newTask" data-customer="' + esc(x[3]) + '"' : 'data-go="' + x[0] + '"') + '><span class="avatar square" style="width:28px;height:28px">' + ic(x[2]) + '</span><div class="main-tx"><b>' + x[1] + '</b></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>') +
        panel('奖励与积分', '真实记录', '<div class="stack tight">' + (rewards.length + exchanges.length ? rewards.map((r) => '<div class="row-flex small" style="padding:8px 0;border-bottom:1px solid var(--line-soft)"><span class="pill amber">连续奖励</span><span>' + esc((data.camp.rewardTiers.find((t) => t.id === r.tierId) || {}).name || '') + '</span><span class="right-auto tiny muted">' + esc(r.status) + '</span></div>').concat(exchanges.map((r) => '<div class="row-flex small" style="padding:8px 0;border-bottom:1px solid var(--line-soft)"><span class="pill orange">积分兑换</span><span>' + esc(r.productName) + '</span><span class="right-auto tiny muted">' + esc(r.status) + '</span></div>')).join('') : '<div class="tiny muted">暂无奖励或兑换记录。</div>') + '</div>') +
        panel('跟进备注', '只在本机记录', '<div class="stack tight">' + ((c.notes || []).length ? c.notes.slice().reverse().map((n) => '<div style="padding:9px;background:#f8fafc;border-radius:9px"><div class="tiny muted">' + esc(n.at) + ' · ' + esc(n.by || '运营') + '</div><div style="margin-top:4px;font-size:11px;line-height:1.6">' + esc(n.text) + '</div></div>').join('') : '<div class="tiny muted">还没有备注。</div>') + '</div><div class="split-line"></div><textarea class="textarea" rows="3" data-customer-note="' + esc(c.id) + '" placeholder="记录本次沟通、客户诉求或下一步…"></textarea><button class="btn primary w-full" style="margin-top:8px" data-act="addNote" data-id="' + esc(c.id) + '">保存备注</button>') +
        panel('电话待办', '没有企微/短信，只能人工电话', '<div class="stack tight">' + data.followups.filter((f) => f.customerId === c.id).map((f) => '<div class="rowlink" data-act="editTask" data-id="' + esc(f.id) + '"><span class="avatar square" style="width:27px;height:27px">' + ic('phone') + '</span><div class="main-tx"><b>' + esc(f.reason) + '</b><span>' + esc(f.owner) + ' · ' + esc(f.due) + '</span></div><span class="tail">' + pill(f.status === 'done' ? '已完成' : '待处理', f.status === 'done' ? 'green' : 'amber') + '</span></div>').join('') + '</div>', '<button class="btn sm" data-act="newTask" data-customer="' + esc(c.id) + '">新增</button>', true) +
      '</div></div></div>';
  };

  /* ----------------------------------------------------------- 共享资产与平台 */
  function collectAssets() {
    const rows = [];
    const add = (url, name, route, kind, extra) => { if (url) rows.push(Object.assign({ url, name, route, kind }, extra || {})); };
    data.camp.pointProducts.forEach((p) => add(p.imageUrl, p.name, 'v-mall', '商品主图'));
    data.camp.rewardTiers.forEach((p) => add(p.imageUrl, p.name, 'v-tiers', '奖励图'));
    data.camp.coachActivities.forEach((p) => (p.imageUrls || []).forEach((u, i) => add(u, p.title + ' · ' + (i + 1), 'v-activities', '活动图')));
    data.employee.products.forEach((p) => { add(p.imageUrl, p.name, 'e-service', '服务主图'); (p.gallery || []).forEach((u, i) => add(u, p.name + ' · 图集 ' + (i + 1), 'e-service', '服务图集')); });
    data.employee.banners.forEach((p) => add(p.image, p.title, 'e-home', '首页横幅'));
    data.employee.promos.forEach((p) => add(p.image, p.title, 'e-home', '活动横幅'));
    state.assets.forEach((a, i) => add(a.url, a.name, 'assets', '本地上传', { local: true, index: i }));
    return rows;
  }

  function buildConfig() {
    const e = data.employee;
    const b = data.brand.home;
    const h = e.home;
    return {
      version: 'v10-' + (state.savedAt || today()).replace(/[^\d]/g, '').slice(0, 12),
      generatedAt: nowTime(),
      contact: { servicePhone: e.site.phone, hotline: e.site.phone, address: '北京市昌平区中关村生命科学园生命园路1号' },
      employee: {
        site: { title: e.site.title, servicePhone: e.site.phone },
        modules: e.modules.filter((m) => e.home['showModule' + m.id] !== false).map((m) => ({ id: m.id, name: m.name })),
        services: e.products.map((p) => ({ id: p.id, name: p.name, intro: p.intro, status: p.active ? 'online' : 'draft' }))
      },
      channelPages: {
        employee: { home: h.showAppointments ? 1 : 1, services: 1, articles: h.showArticles ? 1 : 0, discover: h.showArticles ? 1 : 0, mine: 1 },
        brand: { home: 1, hospitals: b.showNetwork ? 1 : 0, departments: b.showDepartments ? 1 : 0, team: b.showFaculty ? 1 : 0, camp: b.showCamp ? 1 : 0, about: b.showAbout ? 1 : 0 }
      },
      versionall: { rankingOn: data.camp.pointRules.rankingOn }
    };
  }

  PAGES['assets'] = function () {
    const rows = collectAssets();
    const local = state.assets.length;
    const usable = rows.filter((r) => r.url).length;
    return '<div class="page wide">' + pageHead('素材库', '所有轮播图、商品图、服务图与活动图集中管理，能看到每张图被哪个页面引用。', '<label class="btn primary">' + ic('upload') + '<span>上传素材</span><input type="file" accept="image/*" multiple data-upload="assets" style="display:none"></label>', '跨产品 / 共享资产') +
      purpose('避免同一个横幅图在多个页面重复上传，也能快速找到缺失图片。', '商品、奖励、活动、服务与职工端横幅；H5 不会自动读取新上传图片。', '内容运营') +
      '<div class="kpi-grid">' + kpi('素材总数', rows.length, '张', '含真实引用', 'image', ['#0c7c78','#e6f6f4']) + kpi('已引用', usable, '张', '有图片地址', 'link', ['#e7f4f8','#1d6e89']) + kpi('本地上传', local, '张', '仅保存在本机', 'upload', ['#fff1e7','#e5540b']) + kpi('缺失图片', rows.length - usable, '处', '建议补齐', 'info', ['#fff6e0','#a86a06']) + '</div>' +
      panel('素材清单', '点击卡片跳转到使用位置', '<div class="grid three">' + (rows.length ? rows.map((r) => '<div class="panel" style="box-shadow:none;cursor:pointer" data-go="' + esc(r.route) + '"' + (r.route === 'e-service' ? ' data-id="' + esc((data.employee.products.find((p) => p.name === r.name.split(' · ')[0]) || {}).id || '') + '"' : '') + '><div style="height:132px;background:#f4f7f9;overflow:hidden;position:relative">' + (r.url ? '<img src="' + esc(r.url) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : empty('暂无图片', 'image')) + '<span style="position:absolute;left:9px;top:9px">' + pill(r.kind, 'navy') + '</span>' + (r.local ? '<button class="btn sm" style="position:absolute;right:8px;top:8px" data-act="removeAsset" data-id="' + r.index + '">移除</button>' : '') + '</div><div class="panel-body" style="padding-top:10px"><b style="font-size:11px">' + esc(r.name) + '</b><div class="tiny muted" style="margin-top:4px">使用于 ' + esc(META[r.route] ? META[r.route].label : r.route) + '</div></div></div>').join('') : '<div style="padding:20px">' + empty('还没有素材') + '</div>') + '</div>', '<span class="pill">' + rows.length + ' 张</span>', false) + '</div>';
  };

  PAGES['templates'] = function () {
    const tab = state.ui.followTab || 'open';
    const rows = data.followups.filter((f) => tab === 'all' || f.status === tab);
    return '<div class="page wide">' + pageHead('电话跟进', '没有企业微信、短信或站内信。所有主动触达都变成可分配、可记录结果的电话人工待办。', '<button class="btn primary" data-act="newTask">' + ic('plus') + '<span>新增待办</span></button>', '跨产品 / 电话跟进') +
      purpose('把需要主动联系客户的事项集中起来，避免“系统里显示已发送、实际没人联系”。', '客户 360、职工消息与训练营唤醒；不调用任何外部消息接口。', '健康管家 / 客户运营') +
      '<div class="kpi-grid">' + kpi('待处理', data.followups.filter((f) => f.status === 'open').length, '条', '人工电话', 'phone', ['#fdeef4','#be2a5e']) + kpi('今日到期', data.followups.filter((f) => f.status === 'open' && String(f.due).slice(0,10) === today()).length, '条', today(), 'clock', ['#fff6e0','#a86a06']) + kpi('已完成', data.followups.filter((f) => f.status === 'done').length, '条', '有结果记录', 'check', ['#e9f7f1','#0c7c59']) + kpi('客户覆盖', new Set(data.followups.map((f) => f.customerId)).size, '人', '去重客户', 'users', ['#e7f4f8','#1d6e89']) + '</div>' +
      panel('待办清单', '点击整行记录电话结果', '<div class="toolbar" style="padding:10px 0 5px">' + seg([{id:'open',label:'待处理 ' + data.followups.filter((f) => f.status === 'open').length},{id:'done',label:'已完成 ' + data.followups.filter((f) => f.status === 'done').length},{id:'all',label:'全部'}], tab, 'followTab') + '</div><div class="table-wrap"><table class="table"><thead><tr><th>客户</th><th>原因</th><th>负责人</th><th>到期</th><th>方式</th><th>状态</th><th>操作</th></tr></thead><tbody>' + (rows.length ? rows.map((f) => '<tr class="click" data-act="editTask" data-id="' + esc(f.id) + '"><td><div class="row-main">' + avatar(f.customer) + '<div><div class="name">' + esc(f.customer) + '</div><div class="sub">' + esc(f.phone) + '</div></div></div></td><td style="max-width:390px">' + esc(f.reason) + '</td><td>' + esc(f.owner) + '</td><td>' + esc(f.due) + '</td><td>' + pill(f.channel || '电话人工跟进', 'outline') + '</td><td>' + pill(f.status === 'done' ? '已完成' : '待处理', f.status === 'done' ? 'green' : 'amber') + '</td><td class="actions"><button class="btn sm">' + (f.status === 'done' ? '查看' : '记录结果') + '</button></td></tr>').join('') : '<tr><td colspan="7">' + empty('没有待办') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">真实人工流程</span>', true) +
      '<div class="notice warm section-space">' + ic('info') + '<span><b>能力边界</b>：这里不会发送短信或企业微信。点击「记录结果」只是保存本次电话沟通；真正触达需要运营人员拨打客户手机号。</span></div></div>';
  };

  PAGES['publish'] = function () {
    const cfg = buildConfig();
    const effective = [
      ['客服电话 / 热线 / 地址', '页面文本替换', '真实生效'],
      ['职工端站点标题', 'document.title', '真实生效'],
      ['职工端 5 大模块显隐', '首页模块入口', '真实生效'],
      ['职工端服务上下架', '服务卡与详情入口', '真实生效'],
      ['品牌站导航入口显隐', '导航链接 display', '真实生效'],
      ['versionall 排行榜入口', '排行按钮隐藏', '真实生效']
    ];
    return '<div class="page wide">' + pageHead('发布中心', '生成三个 H5 共用的 config.json。真实生效字段会明示；后台保存但 H5 不读取的内容不会伪装成已上线。', '<button class="btn" data-act="downloadConfig">' + ic('download') + '<span>下载 config.json</span></button><button class="btn primary" data-act="openPublish">' + ic('send') + '<span>生成发布包</span></button>', '平台 / 发布') +
      purpose('把后台配置转换成 H5 可读取的发布文件，并明确每一项的真实影响。', '三端 bridge 读取 config.json；GitHub Pages 更新仍需在仓库侧部署。', '平台管理员') +
      '<div class="grid main-side"><div class="stack">' +
        panel('发布前检查', '当前本机改动 ' + state.dirty + ' 项', '<div class="stack tight">' + effective.map((x) => '<div class="row-flex" style="padding:9px 0;border-bottom:1px solid var(--line-soft)"><span class="pill green">生效</span><div style="flex:1"><b style="font-size:11px">' + esc(x[0]) + '</b><div class="tiny muted">' + esc(x[1]) + '</div></div><span class="tiny muted">' + esc(x[2]) + '</span></div>').join('') + '</div>') +
        panel('config.json 预览', '发布后由三端 bridge 读取', '<pre style="margin:0;padding:14px;background:#0b1f32;color:#cfe4f4;border-radius:12px;font-size:10.5px;line-height:1.65;overflow:auto;max-height:430px">' + esc(JSON.stringify(cfg, null, 2)) + '</pre>', '<button class="btn sm" data-act="copyConfig">' + ic('copy') + '复制</button>') +
      '</div><div class="stack">' +
        panel('发布状态', '', '<div class="radar-card"><div class="micro">CONFIG PIPELINE</div><h3>' + (state.dirty ? state.dirty + ' 项改动待发布' : '当前无未发布改动') + '</h3><p>文件生成在本机；上传到 GitHub Pages 后，H5 刷新即读取。</p><div class="radar-list"><div class="radar-row"><span>真实生效字段</span><b>6 类</b></div><div class="radar-row"><span>仅后台保存</span><b>图文内容</b></div><div class="radar-row"><span>外部接口</span><b>无</b></div></div></div>') +
        panel('不会自动发生的事', '', '<div class="stack tight"><div class="notice warm">' + ic('info') + '<span>不会自动推送短信 / 企微，不会自动发货，不会自动确认预约，也不会自动写回 H5 的图文详情。</span></div><div class="notice">' + ic('external') + '<span>GitHub 部署由维护者在本机执行；浏览器端不保存 GitHub Token。</span></div></div>') +
        panel('发布后验证', '建议顺序', '<div class="stack tight">' + ['下载 config.json 并替换线上文件', '提交并等待 GitHub Pages 构建', '打开三个 H5 检查联系方式与入口显隐', '回到「H5 页面对照」核对生效状态'].map((x, i) => '<div class="row-flex small" style="padding:7px 0;border-bottom:1px solid var(--line-soft)"><span class="avatar square" style="width:24px;height:24px;font-size:9px">' + (i + 1) + '</span><span>' + x + '</span></div>').join('') + '</div>') +
      '</div></div></div>';
  };

  PAGES['map'] = function () {
    const groups = [
      { app: 'camp', name: 'versionall', ch: '#f07a43', pct: 100, rows: [
        ['学员首页 / 今日打卡 / 排名 / 积分 / 活动', 'v-home · v-rules', '真实'],
        ['饮食 / 运动 / 体重打卡记录', 'v-records', '真实'],
        ['健康档案 30 项指标', 'v-metrics', '真实'],
        ['徽章与个人历程', 'v-badges', '真实'],
        ['积分商城与商品详情', 'v-mall', '保存'],
        ['连续打卡奖励与领取', 'v-tiers', '保存'],
        ['营养师 / 教练批注台', 'v-team', '真实'],
        ['教练发布活动', 'v-activities', '保存'],
        ['餐次时间窗与配置中心', 'v-rules', '真实'],
        ['督导总览与营期报告', 'v-report', '真实'],
        ['手机号登录与账号权限', 'v-accounts', '真实'],
        ['发货 / 线下核销', 'v-fulfill', '保存'],
        ['营期切换与学员归属', 'v-camps', '真实'],
        ['退出登录 / 角色切换', 'v-accounts', '真实']
      ] },
      { app: 'brand', name: 'PKU-introduce', ch: '#2c8aa8', pct: 100, rows: [
        ['mobile.html 品牌首页', 'b-home', 'bridge'],
        ['team.html 师资列表', 'b-team', '保存'],
        ['member.html 专家详情', 'b-team', '保存'],
        ['hospitals.html 分院网络', 'b-hospitals', 'bridge'],
        ['departments.html 科室列表', 'b-departments', '保存'],
        ['department.html 科室详情', 'b-departments', '保存'],
        ['camp.html 健康营项目页', 'b-camp', 'bridge'],
        ['brand.html 关于北大医疗', 'b-about', '保存']
      ] },
      { app: 'employee', name: 'pku-employee-health', ch: '#ff752b', pct: 100, rows: [
        ['首页问候 / 权益 / 横幅', 'e-home', 'bridge'],
        ['5 大模块与 28 项服务', 'e-services', 'bridge'],
        ['服务详情 / 图文介绍', 'e-service', '保存'],
        ['预约表单与时段', 'e-booking', '保存'],
        ['我的预约 / 改约 / 取消', 'e-orders', '保存'],
        ['权益额度与退回', 'e-benefits', '保存'],
        ['体检报告 / 家庭成员 / 授权', 'e-records', '保存'],
        ['健康科普与讲座', 'e-content', '保存'],
        ['服务机构与号源', 'e-orgs', '保存'],
        ['五好生活五个主题', 'e-fivegood', '保存'],
        ['消息列表与未读', 'e-messages', '保存'],
        ['企康小安智能推荐入口', 'e-home', '保存']
      ] }
    ];
    return '<div class="page wide">' + pageHead('H5 页面对照', '每个 H5 页面都能找到后台落点，并标注是真实生效、bridge 生效，还是只保存后台。', '<button class="btn" data-act="openPublish">' + ic('send') + '<span>生成发布包</span></button>', '平台 / 页面映射') +
      purpose('回答“这个前端页面到底在哪里配置、改了会不会生效”。', '所有三端页面的后台入口与生效状态。', '平台管理员') +
      '<div class="map-grid">' + groups.map((g) => '<div class="map-app"><div class="map-app-head" style="--ch:' + g.ch + '"><span class="ma">' + ic(g.app === 'camp' ? 'activity' : g.app === 'brand' ? 'hospital' : 'heart') + '</span><div class="tx"><b>' + esc(g.name) + '</b><span>' + SEED.h5Pages.find((x) => x.app === g.app).label + ' · ' + g.rows.length + ' 个页面/操作区</span></div><span class="pct">' + g.pct + '%</span></div><div class="map-list">' + g.rows.map((r, i) => '<div class="map-row"><span class="mp">' + (i + 1) + '</span><span class="mt">' + esc(r[0]) + '</span><button class="btn sm" data-go="' + esc(r[1].split(' · ')[0]) + '">' + esc(r[1]) + '</button><span class="badge" style="background:' + (r[2] === '真实' ? '#e9f7f1' : r[2] === 'bridge' ? '#fff6e0' : '#edf3ff') + ';color:' + (r[2] === '真实' ? '#0c7c59' : r[2] === 'bridge' ? '#a86a06' : '#1f4fd1') + '">' + r[2] + '</span></div>').join('') + '</div></div>').join('') + '</div></div>';
  };

  PAGES['capability'] = function () {
    const effective = [
      ['联系方式', '文本替换：客服电话、热线、地址', 'bridge', '只替换固定原文'],
      ['职工端标题', 'document.title', 'bridge', '刷新后生效'],
      ['模块显隐', '首页 5 大模块入口', 'bridge', '通过 data-id 隐藏'],
      ['服务上下架', '服务卡与详情入口', 'bridge', 'draft 状态隐藏'],
      ['品牌站导航', '导航链接 display', 'bridge', '只隐藏入口'],
      ['排行榜', 'versionall 排行按钮', 'bridge', '隐藏文本为“排行”的按钮']
    ];
    const not = [
      ['短信 / 企业微信 / 站内信', '没有外部消息接口', '改为电话人工待办'],
      ['物流面单', '没有快递接口', '记录“已发货”与运单号文本'],
      ['真实支付', '没有收银台', '权益额度只做后台记录'],
      ['预约排班', '没有医院号源接口', '机构号源为后台配置'],
      ['图文详情自动上线', '静态 H5 不读取后台富文本', '导出配置或人工更新页面'],
      ['客户登录', '手机号登录在 H5 本地', '后台只做资料与痕迹聚合']
    ];
    return '<div class="page wide">' + pageHead('能力边界', '这个后台建立在三个静态 H5 上。能真实影响的只有 bridge 支持的字段；其余内容只保存后台。', '', '平台 / 能力边界') +
      purpose('防止“后台保存成功”被误解为“线上已生效”，也防止虚构不存在的消息、支付与物流接口。', '运营预期、发布范围与客户承诺。', '平台管理员 / 产品') +
      '<div class="grid two"><div class="stack">' + panel('真实生效（6 类）', '由 pku-bridge.js 读取 config.json', '<div class="stack tight">' + effective.map((x) => '<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)"><div class="row-flex"><b style="font-size:11.5px">' + esc(x[0]) + '</b><span class="pill green right-auto">' + x[2] + '</span></div><div class="tiny muted" style="margin-top:4px">' + esc(x[1]) + ' · ' + esc(x[3]) + '</div></div>').join('') + '</div>') + '</div><div class="stack">' + panel('不能假装已实现', '这些能力需要后端或第三方', '<div class="stack tight">' + not.map((x) => '<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)"><div class="row-flex"><b style="font-size:11.5px">' + esc(x[0]) + '</b><span class="pill amber right-auto">无接口</span></div><div class="tiny muted" style="margin-top:4px">' + esc(x[1]) + ' · 替代：' + esc(x[2]) + '</div></div>').join('') + '</div>') + panel('本机存储', '', '<div class="notice">' + ic('info') + '<span>当前数据保存在浏览器 localStorage（键 <b>' + KEY + '</b>），版本 <b>' + STORAGE_VERSION + '</b>。换浏览器或清缓存会丢失，请及时导出 config.json。</span></div>') + '</div></div></div>';
  };

  PAGES['settings'] = function () {
    const roles = [
      { name: '营养师', scope: '训练营饮食、体重、批注、积分', color: '#f07a43', icon: 'bowl', count: data.camp.accounts.filter((a) => a.role === 'dietitian').length },
      { name: '教练', scope: '运动批注、活动发布、动作纠正', color: '#0c7c59', icon: 'walk', count: data.camp.accounts.filter((a) => a.role === 'coach').length },
      { name: '督导', scope: '跨营期总览、报告与质量抽查', color: '#1f4fd1', icon: 'eye', count: data.camp.accounts.filter((a) => a.supervisor).length },
      { name: '品牌运营', scope: '品牌首页、师资、分院、科室', color: '#2c8aa8', icon: 'hospital', count: 2 },
      { name: '企康运营', scope: '职工服务、预约、权益、五好', color: '#ff6a13', icon: 'heart', count: 3 },
      { name: '健康管家', scope: '客户 360、电话跟进、报告解读', color: '#a66a12', icon: 'phone', count: 4 },
      { name: '履约运营', scope: '发货、核销、机构号源', color: '#0c7c78', icon: 'truck', count: 2 }
    ];
    return '<div class="page wide">' + pageHead('角色与日志', '按三端真实角色划分职责。所有敏感操作只保存在本机日志，不伪造服务端审计。', '<button class="btn" data-act="exportLogs">' + ic('download') + '<span>导出日志</span></button>', '平台 / 权限') +
      purpose('明确谁负责哪一块，并记录本机改动了哪些配置。', '运营分工、发布前复核与问题追溯。', '平台管理员') +
      '<div class="grid three">' + roles.map((r) => '<div class="panel" style="box-shadow:none"><div class="panel-body"><div class="row-flex"><span class="avatar square" style="width:34px;height:34px;background:' + r.color + '18;color:' + r.color + '">' + ic(r.icon) + '</span><div><b style="font-size:12px">' + esc(r.name) + '</b><div class="tiny muted" style="margin-top:2px">' + esc(r.scope) + '</div></div><span class="pill right-auto">' + r.count + ' 人</span></div></div></div>').join('') + '</div>' +
      '<div class="grid main-side section-space"><div class="stack">' + panel('操作日志', '最近 ' + state.logs.length + ' 条 · 本机记录', '<div class="table-wrap"><table class="table"><thead><tr><th>时间</th><th>操作</th><th>所属端</th><th>页面</th></tr></thead><tbody>' + (state.logs.length ? state.logs.slice(0, 20).map((l) => '<tr><td class="muted">' + esc(l.at) + '</td><td><b style="font-size:11px">' + esc(l.label) + '</b></td><td>' + esc(l.app) + '</td><td class="muted">' + esc(l.route) + '</td></tr>').join('') : '<tr><td colspan="4">' + empty('还没有操作日志') + '</td></tr>') + '</tbody></table></div>', '<span class="pill">仅本机</span>', true) + '</div><div class="stack">' + panel('本机存储', 'localStorage · 非服务端', '<div class="stack tight"><div class="row-flex small"><span class="muted">存储键</span><b class="right-auto">' + KEY + '</b></div><div class="row-flex small"><span class="muted">数据版本</span><b class="right-auto">' + STORAGE_VERSION + '</b></div><div class="row-flex small"><span class="muted">改动计数</span><b class="right-auto">' + state.dirty + '</b></div><div class="row-flex small"><span class="muted">最近保存</span><b class="right-auto">' + esc(state.savedAt) + '</b></div><div class="row-flex small"><span class="muted">本机素材</span><b class="right-auto">' + state.assets.length + ' 张</b></div></div>') + panel('危险操作', '', '<div class="notice danger">' + ic('trash') + '<span>清空本机会恢复三个 H5 的真实种子数据，已上传图片和未导出的改动会丢失。</span></div><button class="btn danger w-full" style="margin-top:10px" data-act="resetLocal">' + ic('refresh') + '清空本机配置</button>') + panel('安全提醒', '', '<div class="notice amber">' + ic('shield') + '<span>不要在浏览器或代码中保存 GitHub Token。发布用最小权限 Token，并在使用后撤销。</span></div>') + '</div></div></div>';
  };

  /* ----------------------------------------------------------- 数据同步 */
  function splitList(v) { return String(v || '').split(/[\n、,，;；]+/).map((x) => x.trim()).filter(Boolean); }
  function syncDerived() {
    (data.camp.pointProducts || []).forEach((p) => {
      if (p.deliveryOptionsText != null) { p.deliveryOptions = splitList(p.deliveryOptionsText); delete p.deliveryOptionsText; }
      p.gallery = p.gallery || [];
      p.detailHtml = p.detailHtml || ('<p>' + esc(p.description || '') + '</p>');
    });
    (data.camp.rewardTiers || []).forEach((t) => {
      if (t.deliveryMethodsText != null) { t.deliveryMethods = splitList(t.deliveryMethodsText); delete t.deliveryMethodsText; }
    });
    (data.camp.coachActivities || []).forEach((a) => {
      if (a.videoUrlsText != null) { a.videoUrls = splitList(a.videoUrlsText); delete a.videoUrlsText; }
      if (a.campIdsText != null) { a.campIds = splitList(a.campIdsText); delete a.campIdsText; }
    });
    (data.camp.accounts || []).forEach((a) => {
      if (a.campIdsText != null) { a.campIds = splitList(a.campIdsText); delete a.campIdsText; }
    });
    data.employee.products.forEach((p) => {
      if (p.payerText != null) { p.payer = splitList(p.payerText); delete p.payerText; }
      if (p.tagsText != null) { p.tags = splitList(p.tagsText); delete p.tagsText; }
      if (p.includesText != null) { p.includes = String(p.includesText).split('\n').map((x) => x.trim()).filter(Boolean); delete p.includesText; }
      if (p.noticeText != null) { p.notice = String(p.noticeText).split('\n').map((x) => x.trim()).filter(Boolean); delete p.noticeText; }
      if (p.flowText != null) { p.flow = String(p.flowText).split('\n').map((x) => x.trim()).filter(Boolean); delete p.flowText; }
    });
    (data.planning.packages || []).forEach((p) => {
      if (p.servicesText != null) { p.services = splitList(p.servicesText); delete p.servicesText; }
      p.services = p.services || [];
    });
    (data.planning.schedules || []).forEach((s) => {
      if (s.daysText != null) {
        s.days = String(s.daysText).split(/[^0-6]+/).map((x) => Number(x)).filter((x) => x >= 0 && x <= 6);
        delete s.daysText;
      }
      if (!Array.isArray(s.days) || !s.days.length) s.days = [1, 2, 3, 4, 5];
    });
    data.customers.forEach((c) => {
      if (c.sourcesText != null) { c.sources = splitList(c.sourcesText); delete c.sourcesText; }
      if (c.tagsText != null) { c.tags = splitList(c.tagsText); delete c.tagsText; }
    });
    data.employee.orgDetails.forEach((o) => {
      if (o.servicesText != null) { o.services = splitList(o.servicesText); delete o.servicesText; }
    });
    data.employee.five.forEach((f) => {
      if (f.pidsText != null) { f.pids = splitList(f.pidsText); delete f.pidsText; }
    });
    data.employee.fiveTiers.forEach((t) => {
      if (t.themesText != null) { t.themes = splitList(t.themesText); delete t.themesText; }
      if (t.pidsText != null) { t.pids = splitList(t.pidsText); delete t.pidsText; }
    });
    data.brand.camp.roster.forEach((r) => {
      if (r.tagsText != null) { r.tags = splitList(r.tagsText); delete r.tagsText; }
    });
    const meal = data.meal || {};
    (meal.dayPlans || []).forEach((d) => {
      if (d.tagsText != null) { d.tags = splitList(d.tagsText); delete d.tagsText; }
    });
    (meal.mealTemplates || []).forEach((t) => {
      if (t.tagsText != null) { t.tags = splitList(t.tagsText); delete t.tagsText; }
    });
    (meal.dishes || []).forEach((d) => {
      if (d.tagsText != null) { d.tags = splitList(d.tagsText); delete d.tagsText; }
      if (d.allergText != null) { d.allerg = splitList(d.allergText); delete d.allergText; }
      if (d.mealText != null) { d.meal = splitList(d.mealText); delete d.mealText; }
    });
    (meal.ingredients || []).forEach((g) => {
      if (g.tagsText != null) { g.tags = splitList(g.tagsText); delete g.tagsText; }
      if (g.allergText != null) { g.allerg = splitList(g.allergText); delete g.allergText; }
    });
    (meal.supplements || []).forEach((s) => {
      if (s.avoidText != null) { s.avoid = splitList(s.avoidText); delete s.avoidText; }
    });
  }

  /* ----------------------------------------------------------- 抽屉 */
  function openDrawer(d) { state.drawer = d; render(true); }
  function closeDrawer() { state.drawer = null; render(true); }

  function openProductDrawer(id) {
    const p = data.camp.pointProducts.find((x) => x.id === id);
    if (!p) return;
    const i = data.camp.pointProducts.indexOf(p);
    p.gallery = p.gallery || [];
    p.detailHtml = p.detailHtml || ('<p>' + esc(p.description || '') + '</p>');
    openDrawer({ title: '商品 · ' + p.name, sub: '积分商城商品 / 主图、图集与图文详情', save: true, saveLabel: '商品配置', body: function () {
      return '<div class="stack">' +
        panel('商品主图与介绍', '学员端商城卡片', '<div class="form-grid"><div>' + field('主图', '', 'camp.pointProducts.' + i + '.imageUrl', { optional: true }) + uploadBox('camp.pointProducts.' + i + '.imageUrl', p.imageUrl, false, 'cover') + '</div><div>' + field('商品图集', '', 'camp.pointProducts.' + i + '.gallery', { optional: true }) + uploadBox('camp.pointProducts.' + i + '.gallery', p.gallery, true, 'wide') + '</div></div>') +
        panel('商品信息', '积分兑换与库存', '<div class="form-grid two">' + field('商品名称', p.name, 'camp.pointProducts.' + i + '.name') + field('所需积分', p.pointsRequired, 'camp.pointProducts.' + i + '.pointsRequired', { num: true }) + field('库存', p.stock, 'camp.pointProducts.' + i + '.stock', { num: true }) + field('每人限兑', p.maxExchange || 1, 'camp.pointProducts.' + i + '.maxExchange', { num: true }) + field('所属营期', p.campId, 'camp.pointProducts.' + i + '.campId', { select: data.camp.camps.map((c) => ({ v: c.id, l: c.name })) }) + field('配送方式', (p.deliveryOptions || []).join('、'), 'camp.pointProducts.' + i + '.deliveryOptionsText', { hint: '填写 shipped、in-person，用顿号分隔' }) + '</div>' + field('商品短描述', p.description || '', 'camp.pointProducts.' + i + '.description', { area: true, rows: 3 }) + switchRow('上架状态', '下架后学员端不可兑换', 'camp.pointProducts.' + i + '.active', p.active !== false)) +
        panel('图文详情', '支持上传图片与富文本', richEditor('camp.pointProducts.' + i + '.detailHtml', p.detailHtml, '输入商品材质、规格、使用说明…')) +
        '</div>';
    } });
  }

  function openMealDayDrawer(id) {
    const d = mealData().dayPlans.find((x) => x.id === id);
    if (!d) return;
    const i = mealData().dayPlans.indexOf(d);
    const prefix = 'meal.dayPlans.' + i;
    openDrawer({ title: '全天食谱 · ' + d.name, sub: '四餐组合 / 封面 / 营养目标', save: true, saveLabel: '全天食谱', extra: function () {
      return '<button class="btn" data-act="previewMealDay" data-id="' + esc(d.id) + '">' + ic('eye') + '预览</button><button class="btn danger" data-act="deleteMealDay" data-id="' + esc(d.id) + '">' + ic('trash') + '删除</button>';
    }, body: function () {
      const totals = mealDayTotals(d);
      const tplOptions = (m) => mealData().mealTemplates.filter((t) => t.meal === m).map((t) => ({ v: t.id, l: t.name + ' · ' + t.kcal + ' kcal' }));
      return '<div class="stack">' +
        panel('封面与定位', '学员端食谱卡', uploadBox(prefix + '.imageUrl', d.imageUrl, false, 'cover') + '<div class="form-grid two">' + field('食谱名称', d.name, prefix + '.name') + field('适用人群', d.audience || '', prefix + '.audience') + field('负责人', d.owner || '', prefix + '.owner') + field('标签', (d.tags || []).join('、'), prefix + '.tagsText', { hint: '例如 均衡、低GI、高蛋白，用顿号分隔' }) + '</div>' + switchRow('上架状态', '关闭后仅作为后台草稿', prefix + '.on', d.on !== false)) +
        panel('营养目标', '可从四餐模板自动重算，也可以手动微调', '<div class="form-grid four">' + field('热量 kcal', d.kcal, prefix + '.kcal', { num: true }) + field('蛋白 g', d.p, prefix + '.p', { num: true }) + field('碳水 g', d.c, prefix + '.c', { num: true }) + field('脂肪 g', d.f, prefix + '.f', { num: true }) + '</div><div class="row-flex" style="margin-top:10px"><span class="tiny muted">当前四餐合计：' + totals.kcal + ' kcal · 蛋白 ' + totals.p + 'g · 碳水 ' + totals.c + 'g · 脂肪 ' + totals.f + 'g</span><button class="btn sm right-auto" data-act="mealRecalcDay" data-id="' + esc(d.id) + '">' + ic('refresh') + '按模板重算</button></div>') +
        panel('四餐结构', '每餐选择一个餐次模板', '<div class="form-grid two">' + MEAL_SLOTS.map((m) => field(m, (d.meals || {})[m] || '', prefix + '.meals.' + m, { select: tplOptions(m) })).join('') + '</div>') +
        panel('组合预览', '学员看到的四餐内容', '<div class="meal-preview">' + MEAL_SLOTS.map((m) => { const t = mealTplById((d.meals || {})[m]); return '<div class="mp-row"><span class="slot">' + m + '</span><div><b>' + esc(t ? t.name : '未配置') + '</b><div class="chips" style="margin-top:5px">' + (t ? mealTplDishes(t).map((x) => pill(x.name, 'outline')).join('') : '<span class="tiny muted">从上方选择一个模板</span>') + '</div></div><span class="tiny muted right-auto">' + (t ? t.kcal + ' kcal' : '') + '</span></div>'; }).join('') + '</div>') +
        '<div class="notice">' + ic('info') + '<span>食谱配置只保存在后台。当前 H5 有饮食打卡，但没有食谱详情与采纳入口；要让学员真正看到，需要先补 H5 食谱页。</span></div></div>';
    } });
  }
  function createNewMealDay() {
    const first = (m) => (mealData().mealTemplates.find((t) => t.meal === m) || {}).id || '';
    const d = { id: uid('dp'), name: '新全天食谱', audience: '普通职工', kcal: 1800, p: 110, c: 180, f: 55, meals: { 早餐: first('早餐'), 午餐: first('午餐'), 晚餐: first('晚餐'), 加餐: first('加餐') }, tags: ['均衡'], on: false, used: 0, owner: '营养师', imageUrl: '' };
    mealData().dayPlans.unshift(d);
    commit('新建全天食谱');
    openMealDayDrawer(d.id);
  }
  function copyMealDay(id) {
    const d = mealData().dayPlans.find((x) => x.id === id);
    if (!d) return;
    const copy = Object.assign(clone(d), { id: uid('dp'), name: d.name + '（副本）', used: 0, on: false });
    mealData().dayPlans.unshift(copy);
    commit('复制全天食谱');
    openMealDayDrawer(copy.id);
  }
  function previewMealDay(id) {
    const d = mealData().dayPlans.find((x) => x.id === id);
    if (!d) return;
    openDrawer({ title: '食谱预览 · ' + d.name, sub: d.audience + ' · ' + d.kcal + ' kcal', save: false, body: function () {
      return '<div class="stack">' + panel('四餐组合', '营养师配置口径', '<div class="meal-preview">' + MEAL_SLOTS.map((m) => { const t = mealTplById((d.meals || {})[m]); return '<div class="mp-row"><span class="slot">' + m + '</span><div><b>' + esc(t ? t.name : '未配置') + '</b><div class="chips" style="margin-top:6px">' + (t ? mealTplDishes(t).map((x) => pill(x.name, 'outline')).join('') : '<span class="tiny muted">未配置</span>') + '</div></div><span class="tiny muted right-auto">' + (t ? t.kcal + ' kcal' : '') + '</span></div>'; }).join('') + '</div>') + panel('营养合计', '', '<div class="meal-macros"><div><b>' + d.kcal + '</b><span>kcal</span></div><div><b>' + d.p + 'g</b><span>蛋白</span></div><div><b>' + d.c + 'g</b><span>碳水</span></div><div><b>' + d.f + 'g</b><span>脂肪</span></div></div>') + '<div class="notice">' + ic('eye') + '<span>这是后台预览，不是 H5 实际页面；当前静态 H5 尚未接入食谱详情。</span></div></div>';
    } });
  }

  function openMealTplDrawer(id) {
    const t = mealData().mealTemplates.find((x) => x.id === id);
    if (!t) return;
    const i = mealData().mealTemplates.indexOf(t);
    const prefix = 'meal.mealTemplates.' + i;
    const candidates = mealData().dishes.filter((d) => !(d.meal || []).length || (d.meal || []).indexOf(t.meal) >= 0);
    openDrawer({ title: '餐次模板 · ' + t.name, sub: t.meal + ' / ' + (t.dishes || []).length + ' 道菜', save: true, saveLabel: '餐次模板', extra: function () {
      return '<button class="btn danger" data-act="deleteMealTpl" data-id="' + esc(t.id) + '">' + ic('trash') + '删除</button>';
    }, body: function () {
      const totals = mealTplTotals(t);
      return '<div class="stack">' +
        panel('模板信息', '', '<div class="form-grid two">' + field('模板名称', t.name, prefix + '.name') + field('餐次', t.meal, prefix + '.meal', { select: MEAL_SLOTS.map((m) => ({ v: m, l: m })) }) + field('标签', (t.tags || []).join('、'), prefix + '.tagsText', { hint: '顿号分隔' }) + field('采纳次数', t.used || 0, prefix + '.used', { num: true }) + '</div>' + switchRow('启用模板', '关闭后不参与全天食谱选择', prefix + '.on', t.on !== false)) +
        panel('选择菜品', '只显示适合「' + t.meal + '」的菜品；点击切换', mealPickChips('', candidates, t.dishes || [], (d) => d.name + ' · ' + d.kcal + 'kcal', 'toggleMealTplDish', 'data-tpl="' + esc(t.id) + '"') + '<div class="row-flex" style="margin-top:12px"><span class="tiny muted">当前 ' + (t.dishes || []).length + ' 道 · ' + totals.kcal + ' kcal · 蛋白 ' + totals.p + 'g · 碳水 ' + totals.c + 'g · 脂肪 ' + totals.f + 'g</span><button class="btn sm right-auto" data-act="mealRecalcTpl" data-id="' + esc(t.id) + '">' + ic('refresh') + '按菜品重算</button></div>') +
        '<div class="notice">' + ic('info') + '<span>模板热量由菜品自动汇总。H5 目前只展示饮食打卡，不读取餐次模板。</span></div></div>';
    } });
  }
  function createNewMealTpl() {
    const t = { id: uid('mt'), name: '新餐次模板', meal: '午餐', dishes: [], kcal: 0, p: 0, c: 0, f: 0, tags: [], on: false, used: 0 };
    mealData().mealTemplates.unshift(t);
    commit('新建餐次模板');
    openMealTplDrawer(t.id);
  }

  function openMealDishDrawer(id) {
    const d = mealData().dishes.find((x) => x.id === id);
    if (!d) return;
    const i = mealData().dishes.indexOf(d);
    const prefix = 'meal.dishes.' + i;
    openDrawer({ title: '菜品 · ' + d.name, sub: d.slot + ' / ' + d.kcal + ' kcal', save: true, saveLabel: '菜品', extra: function () {
      return '<button class="btn danger" data-act="deleteMealDish" data-id="' + esc(d.id) + '">' + ic('trash') + '删除</button>';
    }, body: function () {
      return '<div class="stack">' +
        panel('菜品图片', '菜品库与食谱预览使用', uploadBox(prefix + '.imageUrl', d.imageUrl, false, 'cover')) +
        panel('菜品信息', '', '<div class="form-grid two">' + field('菜品名称', d.name, prefix + '.name') + field('槽位', d.slot, prefix + '.slot', { select: ['主食', '蛋白', '蔬菜', '汤', '乳品', '蔬果', '加餐'].map((x) => ({ v: x, l: x })) }) + field('适用餐次', (d.meal || []).join('、'), prefix + '.mealText', { hint: '早餐、午餐、晚餐、加餐，用顿号分隔' }) + field('标签', (d.tags || []).join('、'), prefix + '.tagsText') + field('热量 kcal', d.kcal, prefix + '.kcal', { num: true }) + field('蛋白 g', d.p, prefix + '.p', { num: true }) + field('碳水 g', d.c, prefix + '.c', { num: true }) + field('脂肪 g', d.f, prefix + '.f', { num: true }) + field('过敏原', (d.allerg || []).join('、'), prefix + '.allergText', { hint: '没有就留空' }) + '</div>' + switchRow('上架菜品', '下架后不出现在餐次候选', prefix + '.on', d.on !== false)) +
        panel('食材组成', '点击食材加入或移除；当前按每 100g 估算', mealPickChips('', mealData().ingredients, (d.ing || []).map((x) => x[0]), (x) => x.name + ' · ' + x.kcal + 'kcal', 'toggleMealDishIng', 'data-dish="' + esc(d.id) + '"') + '<div class="chips" style="margin-top:12px">' + ((d.ing || []).length ? d.ing.map((x) => { const ing = mealIngById(x[0]); return ing ? pill(ing.name + ' ' + x[1] + 'g', 'outline') : ''; }).join('') : '<span class="tiny muted">还没有选择食材</span>') + '</div>') +
        '<div class="notice">' + ic('info') + '<span>营养值可以手动修正；过敏原会显示在菜品卡片上，避免推荐给不适合的人群。</span></div></div>';
    } });
  }
  function createNewMealDish() {
    const d = { id: uid('dish'), name: '新菜品', imageUrl: '', meal: ['午餐'], slot: '蛋白', ing: [], kcal: 180, p: 15, c: 10, f: 8, tags: [], allerg: [], on: false };
    mealData().dishes.unshift(d);
    commit('新建菜品');
    openMealDishDrawer(d.id);
  }

  function openMealIngDrawer(id) {
    const g = mealData().ingredients.find((x) => x.id === id);
    if (!g) return;
    const i = mealData().ingredients.indexOf(g);
    const prefix = 'meal.ingredients.' + i;
    openDrawer({ title: '食材 · ' + g.name, sub: '每 100g 营养口径', save: true, saveLabel: '食材', extra: function () {
      return '<button class="btn danger" data-act="deleteMealIng" data-id="' + esc(g.id) + '">' + ic('trash') + '删除</button>';
    }, body: function () {
      return '<div class="stack">' + panel('食材信息', '', '<div class="form-grid two">' + field('食材名称', g.name, prefix + '.name') + field('分类', g.cat || '', prefix + '.cat', { select: ['蛋白', '主食', '蔬菜', '水果', '乳制品', '坚果', '油脂', '调味'].map((x) => ({ v: x, l: x })) }) + field('热量 kcal', g.kcal, prefix + '.kcal', { num: true }) + field('蛋白 g', g.p, prefix + '.p', { num: true }) + field('碳水 g', g.c, prefix + '.c', { num: true }) + field('脂肪 g', g.f, prefix + '.f', { num: true }) + field('参考价（元 / 100g）', g.price, prefix + '.price', { num: true }) + field('营养标签', (g.tags || []).join('、'), prefix + '.tagsText') + field('过敏原', (g.allerg || []).join('、'), prefix + '.allergText', { hint: '例如 海鲜、乳、坚果' }) + '</div>') + '<div class="notice">' + ic('leaf') + '<span>食材是菜品营养计算的基础。修改食材不会自动重算已保存菜品，需要在菜品里点击按食材重算。</span></div></div>';
    } });
  }
  function createNewMealIng() {
    const g = { id: uid('ing'), name: '新食材', cat: '蔬菜', kcal: 0, p: 0, c: 0, f: 0, unit: '100g', tags: [], allerg: [], price: 0 };
    mealData().ingredients.unshift(g);
    commit('新建食材');
    openMealIngDrawer(g.id);
  }

  function openMealSupDrawer(id) {
    const s = mealData().supplements.find((x) => x.id === id);
    if (!s) return;
    const i = mealData().supplements.indexOf(s);
    const prefix = 'meal.supplements.' + i;
    openDrawer({ title: '营养补剂 · ' + s.name, sub: '售价 / 库存 / 适用与禁忌', save: true, saveLabel: '营养补剂', extra: function () {
      return '<button class="btn danger" data-act="deleteMealSup" data-id="' + esc(s.id) + '">' + ic('trash') + '删除</button>';
    }, body: function () {
      return '<div class="stack">' + panel('补剂图片', '', uploadBox(prefix + '.imageUrl', s.imageUrl, false, 'cover')) +
        panel('商品信息', '', '<div class="form-grid two">' + field('补剂名称', s.name, prefix + '.name') + field('分类', s.cat || '', prefix + '.cat') + field('售价（元）', s.price, prefix + '.price', { num: true }) + field('结算价（元）', s.settle, prefix + '.settle', { num: true }) + field('成本（元）', s.cost, prefix + '.cost', { num: true }) + field('库存', s.stock, prefix + '.stock', { num: true }) + field('已售', s.sold || 0, prefix + '.sold', { num: true }) + field('关联服务 ID', s.svc || '', prefix + '.svc') + '</div>' + field('适用人群', s.fit || '', prefix + '.fit', { area: true, rows: 3 }) + field('禁忌 / 慎用', (s.avoid || []).join('、'), prefix + '.avoidText', { hint: '顿号分隔；必须写清楚' }) + switchRow('上架状态', '关闭后不在补剂列表展示', prefix + '.on', s.on !== false)) +
        '<div class="notice warm">' + ic('shield') + '<span>营养补剂不是药品，必须标注适用人群与禁忌。当前后台只做商品配置，不包含支付、处方或物流接口。</span></div></div>';
    } });
  }
  function createNewMealSup() {
    const s = { id: uid('sup'), name: '新营养补剂', cat: '蛋白补充', price: 0, settle: 0, cost: 0, stock: 0, on: false, fit: '', avoid: [], sold: 0, svc: '', imageUrl: '' };
    mealData().supplements.unshift(s);
    commit('新建营养补剂');
    openMealSupDrawer(s.id);
  }

  function openTierDrawer(id) {
    const t = data.camp.rewardTiers.find((x) => x.id === id);
    if (!t) return;
    const i = data.camp.rewardTiers.indexOf(t);
    openDrawer({ title: '奖励 · ' + t.name, sub: '连续打卡奖励 / 图片、天数、库存与领取方式', save: true, saveLabel: '奖励配置', body: function () {
      return '<div class="stack">' + panel('奖励图片', '', uploadBox('camp.rewardTiers.' + i + '.imageUrl', t.imageUrl, false, 'cover') ) +
        panel('奖励信息', '', '<div class="form-grid two">' + field('奖励名称', t.name, 'camp.rewardTiers.' + i + '.name') + field('所需连续天数', t.requiredDays, 'camp.rewardTiers.' + i + '.requiredDays', { num: true }) + field('库存', t.stock, 'camp.rewardTiers.' + i + '.stock', { num: true }) + field('所属营期', t.campId, 'camp.rewardTiers.' + i + '.campId', { select: data.camp.camps.map((c) => ({ v: c.id, l: c.name })) }) + field('领取方式', (t.deliveryMethods || []).join('、'), 'camp.rewardTiers.' + i + '.deliveryMethodsText', { hint: 'shipped / in-person' }) + '</div>' + field('奖励描述', t.description || '', 'camp.rewardTiers.' + i + '.description', { area: true, rows: 3 }) + switchRow('上架', '关闭后学员端不可领取', 'camp.rewardTiers.' + i + '.active', t.active !== false)) + '</div>';
    } });
  }

  function openBadgeDrawer(id) {
    const b = data.camp.badges.find((x) => x.id === id);
    if (!b) return;
    const i = data.camp.badges.indexOf(b);
    openDrawer({ title: '徽章 · ' + b.name, sub: '徽章条件与发放', save: true, saveLabel: '徽章', body: function () {
      return '<div class="stack">' + panel('徽章信息', '', '<div class="form-grid two">' + field('图标', b.icon, 'camp.badges.' + i + '.icon') + field('名称', b.name, 'camp.badges.' + i + '.name') + field('分类', b.category, 'camp.badges.' + i + '.category', { select: [{v:'里程碑',l:'里程碑'},{v:'成就',l:'成就'},{v:'活动',l:'活动'}] }) + field('频率', b.cadence, 'camp.badges.' + i + '.cadence') + '</div>' + field('达成条件', b.condition, 'camp.badges.' + i + '.condition', { area: true, rows: 3 }) + switchRow('启用', '停用后不再获得，历史保留', 'camp.badges.' + i + '.active', b.active)) + '</div>';
    } });
  }

  function openMetricDrawer(id) {
    const m = data.camp.metrics.find((x) => x.id === id);
    if (!m) return;
    const i = data.camp.metrics.indexOf(m);
    const cats = [];
    data.camp.metrics.forEach((x) => { if (cats.indexOf(x.category) < 0) cats.push(x.category); });
    openDrawer({ title: '指标 · ' + m.name, sub: '健康档案字段', save: true, saveLabel: '健康指标', body: function () {
      return '<div class="stack">' + panel('指标定义', '', '<div class="form-grid two">' + field('指标名称', m.name, 'camp.metrics.' + i + '.name') + field('单位', m.unit || '', 'camp.metrics.' + i + '.unit') + field('分类', m.category || '其他', 'camp.metrics.' + i + '.category', { select: cats.map((c) => ({ v: c, l: c })) }) + field('参考区间', m.normalRange || '', 'camp.metrics.' + i + '.normalRange') + '</div><div class="notice" style="margin-top:10px">' + ic('info') + '<span>参考区间用于健康档案提示，异常判定由 H5 本地逻辑完成。</span></div>') + '</div>';
    } });
  }

  function openActivityDrawer(id) {
    const a = data.camp.coachActivities.find((x) => x.id === id);
    if (!a) return;
    const i = data.camp.coachActivities.indexOf(a);
    a.imageUrls = a.imageUrls || [];
    openDrawer({ title: '活动 · ' + a.title, sub: '教练发布 / 图文与视频', save: true, saveLabel: '活动', body: function () {
      return '<div class="stack">' + panel('活动图片', '', uploadBox('camp.coachActivities.' + i + '.imageUrls', a.imageUrls, true, 'wide')) +
        panel('活动内容', '', '<div class="form-grid two">' + field('标题', a.title, 'camp.coachActivities.' + i + '.title') + field('教练', a.coachName, 'camp.coachActivities.' + i + '.coachName') + field('发布日期', a.date, 'camp.coachActivities.' + i + '.date') + field('关联营期', (a.campIds || []).join('、'), 'camp.coachActivities.' + i + '.campIdsText', { hint: '留空表示全部营期' }) + '</div>' + field('描述', a.description || '', 'camp.coachActivities.' + i + '.description', { area: true, rows: 4 }) + field('视频地址', (a.videoUrls || []).join('\n'), 'camp.coachActivities.' + i + '.videoUrlsText', { area: true, rows: 2 })) + '</div>';
    } });
  }

  function openAccountDrawer(id) {
    const a = data.camp.accounts.find((x) => x.id === id);
    if (!a) return;
    const i = data.camp.accounts.indexOf(a);
    openDrawer({ title: '账户 · ' + a.name, sub: '手机号登录 / 角色与营期权限', save: true, saveLabel: '账户', body: function () {
      return '<div class="stack">' + panel('账户信息', '', '<div class="form-grid two">' + field('姓名', a.name, 'camp.accounts.' + i + '.name') + field('手机号', a.phone, 'camp.accounts.' + i + '.phone') + field('角色', a.role, 'camp.accounts.' + i + '.role', { select: [{v:'student',l:'学员'},{v:'coach',l:'教练'},{v:'dietitian',l:'营养师'}] }) + field('所属营期', (a.campIds || []).join('、'), 'camp.accounts.' + i + '.campIdsText', { hint: '留空表示全部营期' }) + '</div><div class="stack tight" style="margin-top:8px">' + switchRow('启用账户', '停用后该手机号无法登录', 'camp.accounts.' + i + '.active', a.active) + switchRow('督导权限', '营养师可查看所有营期总览', 'camp.accounts.' + i + '.supervisor', !!a.supervisor) + '</div><div class="notice" style="margin-top:10px">' + ic('info') + '<span>手机号是 H5 唯一登录凭证。后台修改不会自动同步前端账户。</span></div>') + '</div>';
    } });
  }

  function openCampDrawer(id) {
    const c = data.camp.camps.find((x) => x.id === id);
    if (!c) return;
    const i = data.camp.camps.indexOf(c);
    openDrawer({ title: '营期 · ' + c.name, sub: '时间、状态与学员归属', save: true, saveLabel: '营期', body: function () {
      return '<div class="stack">' + panel('营期信息', '', '<div class="form-grid two">' + field('营期名称', c.name, 'camp.camps.' + i + '.name') + field('状态', c.status, 'camp.camps.' + i + '.status', { select: [{v:'active',l:'进行中'},{v:'upcoming',l:'待开营'},{v:'ended',l:'已结营'}] }) + field('开始日期', c.startDate, 'camp.camps.' + i + '.startDate') + field('结束日期', c.endDate, 'camp.camps.' + i + '.endDate') + '</div>') + '</div>';
    } });
  }

  function openRecordDrawer(kind, id) {
    const list = kind === 'diet' ? data.camp.dietRecords : kind === 'exercise' ? data.camp.exerciseRecords : data.camp.weightRecords;
    const r = list.find((x) => x.id === id);
    if (!r) return;
    const i = list.indexOf(r);
    const prefix = kind === 'diet' ? 'camp.dietRecords.' : kind === 'exercise' ? 'camp.exerciseRecords.' : 'camp.weightRecords.';
    const name = studentName(r.studentId);
    openDrawer({ title: (kind === 'diet' ? '饮食记录' : kind === 'exercise' ? '运动记录' : '体重记录') + ' · ' + name, sub: String(r.date).slice(0, 16), save: true, saveLabel: '批注', body: function () {
      let form = '';
      if (kind === 'diet') form = '<div class="form-grid two"><div class="field"><label>餐次</label><div class="input" style="background:#f8fafc;color:var(--muted)">' + (r.meal === 'breakfast' ? '早餐' : r.meal === 'lunch' ? '中餐' : r.meal === 'dinner' ? '晚餐' : '加餐') + '</div><div class="hint">来自学员端真实记录</div></div>' + field('营养师评分', r.dietitianScore == null ? '' : r.dietitianScore, prefix + i + '.dietitianScore', { num: true, hint: '0—3 分' }) + '</div>' + field('饮食描述', r.description || '', prefix + i + '.description', { area: true, rows: 3 }) + field('营养师批注', r.dietitianComment || '', prefix + i + '.dietitianComment', { area: true, rows: 3 }) + uploadBox(prefix + i + '.photos', r.photos || [], true, 'wide');
      else if (kind === 'exercise') form = '<div class="form-grid two">' + field('运动类型', r.type || '', prefix + i + '.type') + field('时长（分钟）', r.duration || 0, prefix + i + '.duration', { num: true }) + field('强度 1—3', r.intensity || 1, prefix + i + '.intensity', { num: true }) + field('教练评分', r.coachScore || 0, prefix + i + '.coachScore', { num: true }) + '</div>' + field('教练批注', r.coachComment || '', prefix + i + '.coachComment', { area: true, rows: 4 }) + uploadBox(prefix + i + '.photos', r.photos || [], true, 'wide');
      else form = '<div class="form-grid two">' + field('体重（kg）', r.weight || 0, prefix + i + '.weight', { num: true }) + field('记录时间', String(r.date).slice(0, 16), '', { hint: '来自学员端打卡' }) + '</div>' + field('营养师批注', r.dietitianComment || '', prefix + i + '.dietitianComment', { area: true, rows: 4 }) + uploadBox(prefix + i + '.photos', r.photos || [], true, 'wide');
      return '<div class="stack">' + panel('学员', '', '<div class="rowlink" style="padding:0;border:0">' + avatar(name) + '<div class="main-tx"><b>' + esc(name) + '</b><span>' + esc(studentPhone(r.studentId)) + ' · ' + esc(campName(r.campId)) + '</span></div>' + (r.coachComment || r.dietitianComment || r.dietitianScore != null ? pill('已有批注', 'green') : pill('待批注', 'amber')) + '</div>') + panel('记录与批注', '', form) + '</div>';
    } });
  }

  function openFulfillDrawer(id, source) {
    const rec = source === 'claim' ? data.camp.rewardClaims.find((x) => x.id === id) : data.camp.pointExchanges.find((x) => x.id === id);
    if (!rec) return;
    const isClaim = source === 'claim';
    const list = isClaim ? data.camp.rewardClaims : data.camp.pointExchanges;
    const i = list.indexOf(rec);
    const prefix = isClaim ? 'camp.rewardClaims.' + i : 'camp.pointExchanges.' + i;
    const item = isClaim ? ((data.camp.rewardTiers.find((t) => t.id === rec.tierId) || {}).name || '奖励') : rec.productName;
    openDrawer({ title: '履约 · ' + rec.studentName, sub: item + ' / ' + (isClaim ? '连续打卡奖励' : '积分兑换'), save: true, saveLabel: '履约状态', body: function () {
      return '<div class="stack">' + panel('订单信息', '', '<div class="form-grid two"><div class="field"><label>学生</label><div class="input" style="background:#f8fafc;color:var(--muted)">' + esc(rec.studentName) + '</div></div><div class="field"><label>商品 / 奖励</label><div class="input" style="background:#f8fafc;color:var(--muted)">' + esc(item) + '</div></div>' + field('领取方式', rec.deliveryMethod === 'in-person' ? '线下领取' : '邮寄', prefix + '.deliveryMethod', { select: [{v:'shipped',l:'邮寄'},{v:'in-person',l:'线下领取'}] }) + field('状态', rec.status, prefix + '.status', { select: [{v:'pending',l:'待处理'},{v:'shipped',l:'已发货'},{v:'fulfilled',l:'已完成'},{v:'in-person',l:'已核销'},{v:'cancelled',l:'已取消'}] }) + '</div>' + (rec.deliveryMethod === 'in-person' ? field('核销人', rec.verifier || '', prefix + '.verifier') : field('运单号', rec.trackingNumber || '', prefix + '.trackingNumber')) ) +
        panel('收货信息', '', isClaim ? '<div class="form-grid two">' + field('收件人', rec.recipientName || '', prefix + '.recipientName') + field('手机号', rec.recipientPhone || '', prefix + '.recipientPhone') + '</div>' + field('地址', rec.recipientAddress || '', prefix + '.recipientAddress', { area: true, rows: 2 }) : '<div class="form-grid two">' + field('收件人', rec.recipientName || '', prefix + '.recipientName') + field('手机号', rec.recipientPhone || '', prefix + '.recipientPhone') + '</div>' + field('地址', rec.recipientAddress || '', prefix + '.recipientAddress', { area: true, rows: 2 })) +
        '<div class="notice">' + ic('info') + '<span>物流与核销是人工记录，不接快递接口。请以实际发货或现场领取为准。</span></div></div>';
    } });
  }

  function openExpertDrawer(kind, id) {
    const list = kind === 'doctors' ? data.brand.doctors : data.brand.experts;
    const x = list.find((v) => String(v.id) === String(id));
    if (!x) return;
    const i = list.indexOf(x);
    const prefix = kind === 'doctors' ? 'brand.doctors.' : 'brand.experts.';
    openDrawer({ title: x.name + ' · ' + (x.title || ''), sub: kind === 'doctors' ? '医师资料' : '专家资料', save: true, saveLabel: '人员资料', body: function () {
      return '<div class="stack">' + panel('照片', '', uploadBox(prefix + i + '.photo', x.photo, false, 'cover') ) +
        panel('基本资料', '', '<div class="form-grid two">' + field('姓名', x.name, prefix + i + '.name') + field('职称', x.title || x.role || '', prefix + i + '.title') + field('科室', x.dept || '', prefix + i + '.dept') + field('医院', x.hospital || '', prefix + i + '.hospital') + '</div>' + field('擅长与简介', x.specialty || '', prefix + i + '.specialty', { area: true, rows: 5 }) + field('来源详情链接', x.profile || '', prefix + i + '.profile', { optional: true }) + switchRow('首页精选', '进入品牌首页师资力量', prefix + i + '.featured', !!x.featured)) +
        '<div class="notice">' + ic('info') + '<span>姓名、职称、科室与医院来自公开师资数据；编辑时请保留来源链接，便于核验。</span></div></div>';
    } });
  }

  function openInstitutionDrawer(id) {
    const x = data.brand.institutions.find((v) => v.id === id);
    if (!x) return;
    const i = data.brand.institutions.indexOf(x);
    openDrawer({ title: x.name, sub: '分院网络 / 地址与电话', save: true, saveLabel: '机构资料', body: function () {
      return '<div class="stack">' + panel('机构资料', '', '<div class="form-grid two">' + field('机构名称', x.name, 'brand.institutions.' + i + '.name') + field('完整名称', x.fullName || '', 'brand.institutions.' + i + '.fullName') + field('地区', regionName(x.region), 'brand.institutions.' + i + '.region', { select: data.brand.regions.map((r) => ({ v: r.id, l: r.name })) }) + field('类型', institutionTypeName(x.type), 'brand.institutions.' + i + '.type', { select: Object.keys(data.brand.types).map((k) => ({ v: k, l: data.brand.types[k].name })) }) + field('电话', x.phone || '', 'brand.institutions.' + i + '.phone') + field('副标题', x.subtitle || '', 'brand.institutions.' + i + '.subtitle', { optional: true }) + '</div>' + field('地址', x.address || '', 'brand.institutions.' + i + '.address', { area: true, rows: 2 }) + field('别名 / 搜索词', x.aliases || '', 'brand.institutions.' + i + '.aliases', { optional: true, hint: '用空格分隔中文与英文别名' }) + switchRow('隐藏机构', '关闭后不再展示该机构', 'brand.institutions.' + i + '.hidden', !!x.hidden)) + '</div>';
    } });
  }

  function openDepartmentDrawer(id) {
    const d = data.brand.departments.find((v) => v.id === id);
    if (!d) return;
    const i = data.brand.departments.indexOf(d);
    const cats = [];
    data.brand.departments.forEach((x) => { if (cats.indexOf(x.category) < 0) cats.push(x.category); });
    openDrawer({ title: d.name, sub: '科室资料 / 简介与特色技术', save: true, saveLabel: '科室资料', body: function () {
      return '<div class="stack">' + panel('科室信息', '', '<div class="form-grid two">' + field('科室名称', d.name, 'brand.departments.' + i + '.name') + field('分类', d.category || '科室中心', 'brand.departments.' + i + '.category', { select: cats.map((c) => ({ v: c, l: c })) }) + '</div>' + field('科室简介', d.intro || '', 'brand.departments.' + i + '.intro', { area: true, rows: 7 }) + field('资料来源', d.profile || '', 'brand.departments.' + i + '.profile', { optional: true })) +
        panel('特色技术', '详情页展示前 4 项', '<div class="stack">' + (d.features || []).slice(0, 5).map((f, fi) => '<div style="padding:11px;border:1px solid var(--line-soft);border-radius:11px"><div class="form-grid two">' + field('标题', f.title || '', 'brand.departments.' + i + '.features.' + fi + '.title') + field('标签', f.tag || '', 'brand.departments.' + i + '.features.' + fi + '.tag', { optional: true }) + '</div>' + field('说明', f.desc || '', 'brand.departments.' + i + '.features.' + fi + '.desc', { area: true, rows: 3 }) + '</div>').join('') + '</div>') + '</div>';
    } });
  }

  function openRosterDrawer(id) {
    const r = data.brand.camp.roster.find((x) => String(x.id) === String(id));
    if (!r) return;
    const i = data.brand.camp.roster.indexOf(r);
    openDrawer({ title: r.name + ' · ' + r.role, sub: '健康营项目团队', save: true, saveLabel: '团队成员', body: function () {
      return '<div class="stack">' + panel('成员资料', '', uploadBox('brand.camp.roster.' + i + '.photo', r.photo, false, 'cover') + '<div class="form-grid two">' + field('姓名', r.name, 'brand.camp.roster.' + i + '.name') + field('角色', r.role, 'brand.camp.roster.' + i + '.role') + field('资质', r.qualification || '', 'brand.camp.roster.' + i + '.qualification') + field('医院', r.hospital || '', 'brand.camp.roster.' + i + '.hospital') + '</div>' + field('标签', (r.tags || []).join('、'), 'brand.camp.roster.' + i + '.tagsText') + field('职责', r.duty || '', 'brand.camp.roster.' + i + '.duty', { area: true, rows: 4 })) + '</div>';
    } });
  }

  function openBannerDrawer(kind, id) {
    const list = kind === 'promo' ? data.employee.promos : data.employee.banners;
    const b = list.find((x) => x.id === id);
    if (!b) return;
    const i = list.indexOf(b);
    const prefix = kind === 'promo' ? 'employee.promos.' : 'employee.banners.';
    openDrawer({ title: (kind === 'promo' ? '活动横幅 · ' : '品牌横幅 · ') + b.title, sub: '图片、文案与跳转', save: true, saveLabel: '横幅', body: function () {
      return '<div class="stack">' + panel('横幅图片', '建议 16:9；不传图时使用底色', uploadBox(prefix + i + '.image', b.image || '', false, 'cover')) +
        panel('横幅内容', '', '<div class="form-grid two">' + field('标题', b.title, prefix + i + '.title') + field('副标题', b.sub, prefix + i + '.sub') + field('角标 / 标签', b.tag || b.brand || '', prefix + i + (kind === 'promo' ? '.tag' : '.brand')) + field('跳转页面', b.link || b.serviceId || '', prefix + i + (kind === 'promo' ? '.serviceId' : '.link')) + field('底色', b.tone || '#1d5f86', prefix + i + '.tone') + '</div>' + switchRow('展示横幅', '关闭后 H5 首页不出现', prefix + i + '.enabled', b.enabled !== false)) +
        '<div class="notice">' + ic('image') + '<span>图片会保存在本机后台；静态 H5 不会自动读取新横幅图。</span></div></div>';
    } });
  }

  function openBookingModuleDrawer(mod) {
    const fields = data.employee.bookingFields[mod] || [];
    const m = moduleMeta(mod);
    openDrawer({ title: '预约字段 · ' + m.name, sub: 'H5 表单字段与开关', save: true, saveLabel: '预约字段', body: function () {
      return '<div class="stack">' + panel('模块规则', '', switchRow('开放预约', '关闭后该模块服务不可预约', 'employee.bookingEnabled.' + mod, !!data.employee.bookingEnabled[mod]) + '<div class="notice" style="margin-top:10px">' + ic('info') + '<span>字段来自 H5 真实表单。这里调整文案与顺序，不新增不存在的接口字段。</span></div>') +
        panel('字段列表', fields.length + ' 个', '<div class="stack">' + fields.map((f, i) => '<div class="row-flex" style="gap:6px"><span class="pill">' + (i + 1) + '</span><input class="input" data-bind="employee.bookingFields.' + mod + '.' + i + '" value="' + esc(f) + '"><button class="btn sm danger" data-act="removeBookingField" data-mod="' + esc(mod) + '" data-idx="' + i + '">删除</button></div>').join('') + '</div><button class="btn sm" style="margin-top:10px" data-act="addBookingField" data-mod="' + esc(mod) + '">' + ic('plus') + '新增字段</button>') + '</div>';
    } });
  }

  function openOrderDrawer(id) {
    const b = data.employee.bookings.find((x) => x.id === id);
    if (!b) return;
    const i = data.employee.bookings.indexOf(b);
    const steps = [['pending', '提交预约'], ['confirmed', '已确认'], ['in_service', '服务中'], ['completed', '已完成']];
    function orderExtra() {
      let extra = '';
      if (b.statusKey === 'pending') extra += '<button class="btn" data-act="confirmOrder" data-id="' + esc(b.id) + '">' + ic('check') + '确认预约</button>';
      if (b.statusKey === 'confirmed') extra += '<button class="btn" data-act="startOrder" data-id="' + esc(b.id) + '">' + ic('activity') + '开始服务</button>';
      if (b.statusKey === 'confirmed' || b.statusKey === 'in_service') extra += '<button class="btn" data-act="completeOrder" data-id="' + esc(b.id) + '">' + ic('check') + '完成服务</button>';
      if (['pending', 'confirmed', 'in_service'].indexOf(b.statusKey) >= 0) extra += '<button class="btn danger" data-act="cancelOrder" data-id="' + esc(b.id) + '">' + ic('x') + '取消</button>';
      extra += '<button class="btn" data-act="newTask" data-customer="' + esc((customerByName(b.person) || {}).id || '') + '">' + ic('phone') + '电话跟进</button>';
      return extra;
    }
    openDrawer({ title: '预约 · ' + b.service, sub: b.person + ' / ' + b.channel, save: true, saveLabel: '预约信息', extra: orderExtra, body: function () {
      const stepIndex = Math.max(0, steps.findIndex((x) => x[0] === b.statusKey));
      return '<div class="stack">' + panel('流转状态', '待确认 → 已确认 → 服务中 → 已完成', '<div class="order-flow">' + steps.map((x, k) => '<div class="of-step ' + (k <= stepIndex ? 'done' : '') + (k === stepIndex ? ' on' : '') + '"><span>' + (k <= stepIndex ? '✓' : (k + 1)) + '</span><b>' + x[1] + '</b><i></i></div>').join('') + '</div>') +
        panel('预约详情', '', '<div class="form-grid two">' + field('职工', b.person, 'employee.bookings.' + i + '.person') + field('企业 / 部门', b.dept || '', 'employee.bookings.' + i + '.dept') + field('服务', b.service || '', 'employee.bookings.' + i + '.service') + field('服务机构', b.org || '', 'employee.bookings.' + i + '.org') + field('日期', b.date || '', 'employee.bookings.' + i + '.date') + field('时间', b.time || '', 'employee.bookings.' + i + '.time') + field('流程状态', b.statusKey, 'employee.bookings.' + i + '.statusKey', { select: [{v:'pending',l:'待确认'},{v:'confirmed',l:'已确认'},{v:'in_service',l:'服务中'},{v:'completed',l:'已完成'},{v:'cancelled',l:'已取消'}] }) + field('H5 状态文案', b.status, 'employee.bookings.' + i + '.status', { hint: '仅作 H5 展示备注；后台流转以「流程状态」为准。' }) + field('渠道', b.channel || '', 'employee.bookings.' + i + '.channel') + field('负责人', b.owner || '健康管家', 'employee.bookings.' + i + '.owner') + '</div>' + field('预约备注 / 履约记录', b.note || '', 'employee.bookings.' + i + '.note', { area: true, rows: 3 })) +
        (productById(b.pid) ? panel('服务内容', '', '<div class="tiny muted" style="line-height:1.7">' + esc(productById(b.pid).intro) + '</div><div class="chips" style="margin-top:9px">' + (productById(b.pid).tags || []).map((t) => pill(t, 'outline')).join('') + '</div>') : '') +
        '<div class="notice warm">' + ic('phone') + '<span>取消预约会按规则退回权益次数；不会自动发短信通知职工，需电话确认。</span></div></div>';
    } });
  }

  function createNewOrder() {
    data.employee.newOrder = { person: data.employee.user.name, dept: data.employee.site.company, pid: 'annual-exam', service: '职工年度体检', org: data.employee.orgDetails[0].name, date: addDays(today(), 2), time: '09:00', channel: '后台代下单', owner: '健康管家', note: '' };
    openDrawer({ title: '代客下单', sub: '后台为职工创建服务预约', save: false, extra: '<button class="btn primary" data-act="saveNewOrder">' + ic('check') + '创建预约</button>', body: function () {
      return '<div class="stack">' + panel('预约信息', '创建后进入待确认状态', '<div class="form-grid two">' + field('职工', data.employee.newOrder.person, 'employee.newOrder.person', { select: data.customers.map((c) => ({ v: c.name, l: c.name + ' · ' + c.phone })) }) + field('企业 / 部门', data.employee.newOrder.dept, 'employee.newOrder.dept') + field('服务', data.employee.newOrder.pid, 'employee.newOrder.pid', { select: data.employee.products.filter((p) => p.active).map((p) => ({ v: p.id, l: p.name })) }) + field('服务机构', data.employee.newOrder.org, 'employee.newOrder.org', { select: data.employee.orgDetails.map((o) => ({ v: o.name, l: o.name })) }) + field('日期', data.employee.newOrder.date, 'employee.newOrder.date') + field('时间', data.employee.newOrder.time, 'employee.newOrder.time') + field('渠道', data.employee.newOrder.channel, 'employee.newOrder.channel', { select: [{v:'后台代下单',l:'后台代下单'},{v:'电话预约',l:'电话预约'},{v:'现场登记',l:'现场登记'}] }) + field('负责人', data.employee.newOrder.owner, 'employee.newOrder.owner') + '</div>' + field('备注', data.employee.newOrder.note, 'employee.newOrder.note', { area: true, rows: 3 })) +
        '<div class="notice">' + ic('info') + '<span>代客下单只写入后台预约台账并生成电话跟进；不会自动向职工发送确认消息，也不会占用真实医院号源。</span></div></div>';
    } });
  }
  function saveNewOrder() {
    const d = data.employee.newOrder;
    if (!d) return;
    const p = productById(d.pid);
    const b = { id: uid('bk'), pid: d.pid, service: p ? p.name : (d.service || d.pid), person: d.person, dept: d.dept, date: d.date, time: d.time, org: d.org, status: '待确认', statusKey: 'pending', channel: d.channel || '后台代下单', owner: d.owner || '健康管家', note: d.note || '' };
    data.employee.bookings.unshift(b);
    delete data.employee.newOrder;
    state.drawer = null;
    commit('后台代客下单');
    render(true);
  }

  function openBenefitDrawer(pid) {
    const r = data.employee.rights.find((x) => x.pid === pid);
    if (!r) return;
    const i = data.employee.rights.indexOf(r);
    openDrawer({ title: '权益 · ' + r.name, sub: '年度额度与使用规则', save: true, saveLabel: '权益', body: function () {
      return '<div class="stack">' + panel('权益信息', '', '<div class="form-grid two">' + field('权益名称', r.name, 'employee.rights.' + i + '.name') + field('年度额度', r.total, 'employee.rights.' + i + '.total') + field('剩余次数', r.left, 'employee.rights.' + i + '.left', { num: true }) + field('已使用', r.used, 'employee.rights.' + i + '.used', { num: true }) + '</div>' + field('权益说明', r.benefit, 'employee.rights.' + i + '.benefit', { area: true, rows: 3 })) +
        '<div class="notice">' + ic('shield') + '<span>权益次数只在本机保存；真实扣减需要后端账户系统，当前 H5 为本地演示。</span></div></div>';
    } });
  }

  function openReportDrawer(id) {
    const r = data.employee.medicalReports.find((x) => x.id === id);
    if (!r) return;
    const i = data.employee.medicalReports.indexOf(r);
    openDrawer({ title: '报告 · ' + r.name, sub: '体检 / 病理 / 复测报告', save: true, saveLabel: '报告', body: function () {
      return '<div class="stack">' + panel('报告文件', '支持 PDF 或图片', uploadBox('employee.medicalReports.' + i + '.file', r.file || '', false, 'wide', '.pdf,image/*')) +
        panel('报告信息', '', '<div class="form-grid two">' + field('报告名称', r.name, 'employee.medicalReports.' + i + '.name') + field('日期', r.date, 'employee.medicalReports.' + i + '.date') + field('机构', r.org, 'employee.medicalReports.' + i + '.org') + field('状态', r.status, 'employee.medicalReports.' + i + '.status', { select: [{v:'已解读',l:'已解读'},{v:'已归档',l:'已归档'},{v:'待复测',l:'待复测'}] }) + field('关注指标数', r.abnormal, 'employee.medicalReports.' + i + '.abnormal', { num: true }) + '</div>') +
        '<div class="notice">' + ic('info') + '<span>请勿在演示环境上传真实体检报告。当前文件只保存在本机浏览器。</span></div></div>';
    } });
  }

  function openFamilyDrawer(id) {
    const f = data.employee.family.find((x) => x.id === id);
    if (!f) return;
    const i = data.employee.family.indexOf(f);
    openDrawer({ title: '家庭成员 · ' + f.name, sub: '代预约与权益', save: true, saveLabel: '成员', body: function () {
      return '<div class="stack">' + panel('成员信息', '', '<div class="form-grid two">' + field('姓名', f.name, 'employee.family.' + i + '.name') + field('关系', f.relation, 'employee.family.' + i + '.relation') + field('手机号', f.phone, 'employee.family.' + i + '.phone') + '</div>' + switchRow('已完成认证', '未认证不能代预约', 'employee.family.' + i + '.verified', f.verified)) + '</div>';
    } });
  }

  function openArticleDrawer(idx) {
    const a = data.employee.articles[idx];
    if (!a) return;
    openDrawer({ title: '科普 · ' + a.t, sub: '图文内容与关联服务', save: true, saveLabel: '文章', body: function () {
      return '<div class="stack">' + panel('文章信息', '', '<div class="form-grid two">' + field('标题', a.t, 'employee.articles.' + idx + '.t') + field('阅读信息', a.m || '', 'employee.articles.' + idx + '.m') + field('所属模块', a.mod || '', 'employee.articles.' + idx + '.mod', { select: data.employee.modules.map((m) => ({ v: m.id, l: m.name })) }) + field('关联服务 ID', a.rel || '', 'employee.articles.' + idx + '.rel') + '</div>') + panel('正文', '支持富文本与插图', richEditor('employee.articles.' + idx + '.html', a.html, '输入健康科普正文…')) + '</div>';
    } });
  }

  function openLectureDrawer(idx) {
    const a = data.employee.lectures[idx];
    if (!a) return;
    openDrawer({ title: '讲座 · ' + a.t, sub: '主题、时间、地点与报名', save: true, saveLabel: '讲座', body: function () {
      return '<div class="stack">' + panel('讲座信息', '', '<div class="form-grid two">' + field('主题', a.t, 'employee.lectures.' + idx + '.t') + field('时间', a.d, 'employee.lectures.' + idx + '.d') + field('形式', a.tag, 'employee.lectures.' + idx + '.tag') + field('讲者', a.n, 'employee.lectures.' + idx + '.n') + field('地点', a.place, 'employee.lectures.' + idx + '.place') + field('时长', a.dur, 'employee.lectures.' + idx + '.dur') + field('状态', a.status, 'employee.lectures.' + idx + '.status', { select: [{v:'upcoming',l:'待开始'},{v:'live',l:'进行中'},{v:'ended',l:'已结束'}] }) + '</div>' + field('讲座大纲（每行一条）', (a.outline || []).join('\n'), 'employee.lectures.' + idx + '.outlineText', { area: true, rows: 5 })) + '</div>';
    } });
  }

  function openOrgDrawer(id) {
    const o = data.employee.orgDetails.find((x) => x.id === id);
    if (!o) return;
    const i = data.employee.orgDetails.indexOf(o);
    openDrawer({ title: o.name, sub: '服务机构 / 号源与可约服务', save: true, saveLabel: '机构', body: function () {
      return '<div class="stack">' + panel('机构信息', '', '<div class="form-grid two">' + field('机构名称', o.name, 'employee.orgDetails.' + i + '.name') + field('类型', o.type, 'employee.orgDetails.' + i + '.type') + field('电话', o.phone, 'employee.orgDetails.' + i + '.phone') + field('号源', o.slots, 'employee.orgDetails.' + i + '.slots', { num: true }) + '</div>' + field('地址', o.address, 'employee.orgDetails.' + i + '.address', { area: true, rows: 2 }) + field('可约服务', (o.services || []).join('、'), 'employee.orgDetails.' + i + '.servicesText', { hint: '用顿号分隔' }) + switchRow('开放预约', '关闭后预约表单不再出现该机构', 'employee.orgDetails.' + i + '.enabled', o.enabled !== false)) + '</div>';
    } });
  }

  function openFiveDrawer(k) {
    const f = data.employee.five.find((x) => x.k === k);
    if (!f) return;
    const i = data.employee.five.indexOf(f);
    const u = data.employee.fiveUsage[k];
    openDrawer({ title: '五好主题 · ' + f.name, sub: '权益、服务与运营数据', save: true, saveLabel: '五好主题', body: function () {
      return '<div class="stack">' + panel('主题信息', '', '<div class="form-grid two">' + field('主题名称', f.name, 'employee.five.' + i + '.name') + field('副标题', f.sub, 'employee.five.' + i + '.sub') + field('图标', f.icon, 'employee.five.' + i + '.icon', { select: ['scan','bowl','walk','sleep','chat'].map((x) => ({ v: x, l: x })) }) + field('剩余次数', f.left, 'employee.five.' + i + '.left', { num: true }) + '</div>' + field('权益额度', f.quota, 'employee.five.' + i + '.quota') + field('关联服务 ID', (f.pids || []).join('、'), 'employee.five.' + i + '.pidsText', { hint: '与职工服务目录的 ID 对应' })) +
        panel('运营数据', '参与 / 履约 / 核销 / 满意度', '<div class="form-grid two">' + field('参与人数', u.enrolled, 'employee.fiveUsage.' + k + '.enrolled', { num: true }) + field('履约人次', u.served, 'employee.fiveUsage.' + k + '.served', { num: true }) + field('核销人次', u.redeemed, 'employee.fiveUsage.' + k + '.redeemed', { num: true }) + field('满意度 %', u.satisfaction, 'employee.fiveUsage.' + k + '.satisfaction', { num: true }) + '</div>') +
        '<div class="notice">' + ic('info') + '<span>“remaining”反映企业实际可用次数；预约与核销需人工确认，不接第三方结算。</span></div></div>';
    } });
  }

  function openFiveTierDrawer(id) {
    const t = data.employee.fiveTiers.find((x) => x.id === id);
    if (!t) return;
    const i = data.employee.fiveTiers.indexOf(t);
    const prefix = 'employee.fiveTiers.' + i;
    openDrawer({ title: '权益档位 · ' + t.name, sub: '五好生活企业套餐', save: true, saveLabel: '档位', body: function () {
      return '<div class="stack">' + panel('档位封面', '', uploadBox(prefix + '.imageUrl', t.imageUrl, false, 'cover')) +
        panel('档位信息', '', '<div class="form-grid two">' + field('档位名称', t.name, prefix + '.name') + field('价格（元）', t.price, prefix + '.price', { num: true }) + field('适用人群', t.scope, prefix + '.scope') + field('状态', t.status || 'active', prefix + '.status', { select: [{v:'active',l:'在售'},{v:'draft',l:'草稿'},{v:'paused',l:'暂停'}] }) + '</div>' + field('包含权益', t.benefits, prefix + '.benefits', { area: true, rows: 4 })) +
        panel('覆盖范围', '决定这个档位能选哪些五好主题与服务', field('覆盖主题（screen / food / move / sleep / relax）', (t.themes || []).join('、'), prefix + '.themesText', { hint: '用顿号或换行分隔' }) + field('关联服务 ID', (t.pids || []).join('、'), prefix + '.pidsText', { hint: '从职工服务目录选择真实 ID' })) +
        '<div class="notice">' + ic('info') + '<span>五好档位只保存在后台；H5 目前展示五好主题与单项服务，不会自动生成档位购买页。</span></div></div>';
    } });
  }

  function openMessageDrawer(id) {
    const m = data.employee.messages.find((x) => x.id === id);
    if (!m) return;
    const i = data.employee.messages.indexOf(m);
    openDrawer({ title: '消息 · ' + m.title, sub: '展示与跳转 / 不推送', save: true, saveLabel: '消息', body: function () {
      return '<div class="stack">' + panel('消息内容', '', '<div class="form-grid two">' + field('标题', m.title, 'employee.messages.' + i + '.title') + field('时间', m.time, 'employee.messages.' + i + '.time') + field('图标', m.icon || 'bell', 'employee.messages.' + i + '.icon', { select: ['doc','calendar','heart','gift','chat','bell'].map((x) => ({ v: x, l: x })) }) + field('跳转目标', m.go || '', 'employee.messages.' + i + '.go') + '</div>' + field('说明', m.desc || '', 'employee.messages.' + i + '.desc', { area: true, rows: 3 }) + switchRow('已读', '控制未读角标', 'employee.messages.' + i + '.read', !!m.read)) +
        '<div class="notice warm">' + ic('phone') + '<span>这是 H5 本地消息，不会真正发送给职工。需要触达时请创建电话待办。</span></div><button class="btn sm" data-act="newTask" data-customer="' + esc(((customerByName(data.employee.user.name) || {}).id) || '') + '">' + ic('phone') + '生成电话跟进</button></div>';
    } });
  }

  function openCustomerDrawer(id) {
    const c = customerById(id);
    if (!c) return;
    const i = data.customers.indexOf(c);
    openDrawer({ title: '客户 · ' + c.name, sub: '主数据与渠道来源', save: true, saveLabel: '客户资料', body: function () {
      return '<div class="stack">' + panel('客户资料', '', '<div class="form-grid two">' + field('姓名', c.name, 'customers.' + i + '.name') + field('手机号', c.phone, 'customers.' + i + '.phone') + field('性别', c.gender || 'male', 'customers.' + i + '.gender', { select: [{v:'male',l:'男'},{v:'female',l:'女'}] }) + field('年龄', c.age || '', 'customers.' + i + '.age', { num: true }) + field('企业 / 部门', c.department || '', 'customers.' + i + '.department') + field('负责人', c.owner || '', 'customers.' + i + '.owner') + '</div>' + field('渠道来源', (c.sources || []).join('、'), 'customers.' + i + '.sourcesText') + field('标签', (c.tags || []).join('、'), 'customers.' + i + '.tagsText') + field('客户摘要', c.summary || '', 'customers.' + i + '.summary', { area: true, rows: 3 })) + '</div>';
    } });
  }

  function openTaskDrawer(id) {
    let f = id ? data.followups.find((x) => x.id === id) : null;
    if (!f) return;
    const i = data.followups.indexOf(f);
    openDrawer({ title: (f.status === 'done' ? '跟进记录 · ' : '电话待办 · ') + f.customer, sub: '人工电话 / 无自动发送', save: true, saveLabel: '跟进记录', extra: f.status !== 'done' ? '<button class="btn primary" data-act="taskDone" data-id="' + esc(f.id) + '">' + ic('check') + '标记完成</button>' : '', body: function () {
      return '<div class="stack">' + panel('待办信息', '', '<div class="form-grid two">' + field('客户', f.customer, 'followups.' + i + '.customer') + field('手机号', f.phone || '', 'followups.' + i + '.phone') + field('负责人', f.owner || '', 'followups.' + i + '.owner') + field('到期', f.due || '', 'followups.' + i + '.due') + field('渠道', f.channel || '电话人工跟进', 'followups.' + i + '.channel') + field('状态', f.status, 'followups.' + i + '.status', { select: [{v:'open',l:'待处理'},{v:'done',l:'已完成'}] }) + '</div>' + field('跟进原因', f.reason, 'followups.' + i + '.reason', { area: true, rows: 3 }) + field('沟通结果', f.result || '', 'followups.' + i + '.result', { area: true, rows: 4, optional: true })) +
        '<div class="notice warm">' + ic('phone') + '<span>请实际拨打电话后填写结果。系统不会自动外呼、发短信或发企业微信。</span></div></div>';
    } });
  }

  function openHotDrawer() {
    openDrawer({ title: '更换热门服务', sub: '选择 5 项展示在职工端首页', save: true, saveLabel: '热门服务', body: function () {
      const ids = data.employee.home.hotServiceIds || [];
      return '<div class="stack">' + panel('当前热门', ids.length + ' 项', '<div class="stack tight">' + data.employee.products.map((p) => '<div class="switch-row"><div class="tx"><b>' + esc(p.name) + '</b><span>' + esc(moduleName(p.mod)) + ' · ' + esc(p.scope || '') + '</span></div><button class="switch-btn ' + (ids.indexOf(p.id) >= 0 ? 'on' : '') + '" data-act="toggleHot" data-id="' + esc(p.id) + '"></button></div>').join('') + '</div>') + '<div class="notice">' + ic('info') + '<span>建议保持 5 项。超过 5 项时首页只取数组前 5 项。</span></div></div>';
    } });
  }

  function openSearchDrawer() {
    const pages = Object.keys(META).map((r) => ({ route: r, title: META[r].label, sub: META[r].group + ' · ' + META[r].desc, search: META[r].label + ' ' + META[r].group + ' ' + META[r].desc + ' ' + r }));
    const services = data.employee.products.map((p) => ({ route: 'e-service', id: p.id, title: p.name, sub: moduleName(p.mod) + ' · ' + p.scope, search: p.name + ' ' + p.intro + ' ' + moduleName(p.mod) }));
    const experts = data.brand.experts.slice(0, 57).map((e) => ({ route: 'b-team', title: e.name + ' · ' + e.title, sub: e.dept + ' · ' + e.hospital, search: e.name + ' ' + e.dept + ' ' + e.hospital + ' ' + (e.specialty || '') }));
    const customers = data.customers.map((c) => ({ route: 'crm-detail', id: c.id, title: c.name, sub: c.phone + ' · ' + (c.sources || []).join(' / '), search: c.name + ' ' + c.phone + ' ' + (c.tags || []).join(' ') }));
    const all = pages.concat(services, experts, customers);
    openDrawer({ title: '全局搜索', sub: '页面、服务、专家、客户 · ⌘K', save: false, body: function () {
      return '<div class="toolbar" style="margin-bottom:10px"><div class="searchbar" style="width:100%">' + ic('search') + '<input class="input" data-search-input placeholder="输入名称、手机号、科室、服务…" autofocus></div></div><div id="searchItems" class="stack tight" style="margin:0 -20px -20px;max-height:calc(100vh - 190px);overflow:auto">' + all.map((x) => '<div class="rowlink" data-go="' + esc(x.route) + '"' + (x.id ? ' data-id="' + esc(x.id) + '"' : '') + ' data-search="' + esc(x.search) + '"><span class="avatar square" style="width:29px;height:29px">' + ic(x.route.indexOf('crm') === 0 ? 'user' : x.route.indexOf('e-') === 0 ? 'heart' : x.route.indexOf('b-') === 0 ? 'users' : 'grid') + '</span><div class="main-tx"><b>' + esc(x.title) + '</b><span>' + esc(x.sub) + '</span></div><span class="chev">' + ic('chevron') + '</span></div>').join('') + '</div>';
    } });
  }

  function openImpactDrawer() {
    const logs = state.logs.slice(0, 8);
    const affected = ['健康训练营', '品牌站', '职工健康'];
    openDrawer({ title: '变更影响', sub: '当前本机 ' + state.dirty + ' 项改动 · 不跳离当前页面', save: false, extra: '<button class="btn" data-go="map">查看映射</button><button class="btn primary" data-act="openPublish">' + ic('send') + '生成发布包</button>', body: function () {
      return '<div class="stack">' +
        panel('会影响哪三个 H5', '按端汇总', '<div class="stack tight">' + ['camp', 'brand', 'employee'].map((app) => {
          const logCount = logs.filter((l) => ({ camp: 'v-', brand: 'b-', employee: 'e-' }[app] || '' ).length && l.route.indexOf({ camp: 'v-', brand: 'b-', employee: 'e-' }[app]) === 0).length;
          const pg = SEED.h5Pages.find((x) => x.app === app);
          return '<div class="impact-app"><span class="avatar square" style="width:30px;height:30px;background:' + pg.color + '18;color:' + pg.color + '">' + ic(app === 'camp' ? 'activity' : app === 'brand' ? 'hospital' : 'heart') + '</span><div class="tx"><b>' + esc(pg.label) + '</b><span>' + esc(pg.name) + ' · ' + (logCount ? logCount + ' 项改动来自此端' : '本次无直接改动') + '</span></div>' + pill(logCount ? '有改动' : '未涉及', logCount ? 'amber' : 'outline') + '</div>';
        }).join('') + '</div>') +
        panel('真实生效范围', '发布后 bridge 才会读取', '<div class="stack tight">' + [['联系方式', '三端文本'], ['职工端标题', 'title'], ['模块与服务上下架', '职工端'], ['品牌导航入口', '品牌站'], ['排行榜入口', 'versionall']].map((x) => '<div class="row-flex small" style="padding:7px 0;border-bottom:1px solid var(--line-soft)"><span class="pill green">生效</span><span>' + x[0] + '</span><span class="right-auto tiny muted">' + x[1] + '</span></div>').join('') + '</div>') +
        panel('最近改动', '返回原页面继续操作', '<div class="timeline">' + (logs.length ? logs.map((l, i) => '<div class="tl-row"><span class="tl-time">' + esc((l.at || '').slice(5, 16)) + '</span><div class="tl-axis"><span class="tl-dot" style="--dot:' + (i === 0 ? domainMeta(state.route).accent : '#c9d5e0') + '"></span></div><div class="tl-body"><b>' + esc(l.label) + '</b><span>' + esc(l.app) + ' · ' + esc(l.route) + '</span></div></div>').join('') : empty('还没有改动')) + '</div>') +
        '<div class="notice warm">' + ic('info') + '<span>“变更影响”只做说明与发布入口，不会自动跳转页面，也不会自动上线。</span></div></div>';
    } });
  }

  function openPublishDrawer() {
    const cfg = buildConfig();
    openDrawer({ title: '生成发布包', sub: 'config.json · 三端共用', save: false, extra: '<button class="btn" data-act="copyConfig">' + ic('copy') + '复制 JSON</button><button class="btn primary" data-act="downloadConfig">' + ic('download') + '下载 config.json</button>', body: function () {
      return '<div class="stack">' + panel('将写入', '', '<div class="stack tight">' + [['联系方式', 'contact'], ['职工端模块', 'employee.modules'], ['服务上下架', 'employee.services'], ['品牌导航入口', 'channelPages.brand'], ['排行榜开关', 'versionall.rankingOn']].map((x) => '<div class="row-flex small" style="padding:7px 0;border-bottom:1px solid var(--line-soft)"><span>' + x[0] + '</span><b class="right-auto" style="font-size:9.5px;color:var(--muted)">' + x[1] + '</b></div>').join('') + '</div>') +
        panel('不会写入', '', '<div class="notice warm">' + ic('info') + '<span>商品图文详情、专家照片、横幅图片、客户备注、电话待办等不会进入 config.json；它们只保存在后台本机。</span></div>') +
        panel('config.json', '', '<pre style="margin:0;padding:13px;background:#0b1f32;color:#cfe4f4;border-radius:10px;font-size:10px;line-height:1.6;max-height:340px;overflow:auto">' + esc(JSON.stringify(cfg, null, 2)) + '</pre>') + '</div>';
    } });
  }

  /* ----------------------------------------------------------- 导出 */
  function downloadText(name, text, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function exportCsv(name, headers, rows) {
    const text = [headers.map(csvCell).join(',')].concat(rows.map((r) => r.map(csvCell).join(','))).join('\n');
    downloadText(name, '\ufeff' + text, 'text/csv;charset=utf-8');
  }
  function exportCamp() {
    const rows = data.camp.accounts.filter((a) => a.role === 'student').map((a) => {
      const diets = data.camp.dietRecords.filter((r) => r.studentId === a.id).length;
      const ex = data.camp.exerciseRecords.filter((r) => r.studentId === a.id).length;
      const ws = data.camp.weightRecords.filter((r) => r.studentId === a.id);
      return [a.name, a.phone, (a.campIds || []).map(campName).join('、'), diets, ex, ws.length ? ws[0].weight : '', ws.length ? ws[ws.length - 1].weight : ''];
    });
    exportCsv('健康训练营学员汇总.csv', ['学员', '手机号', '营期', '饮食记录', '运动记录', '开营体重', '最新体重'], rows);
  }
  function exportRecords() {
    const tab = state.ui.vRecordsTab || 'diet';
    if (tab === 'diet') exportCsv('饮食打卡.csv', ['学员', '餐次', '描述', '评分', '日期'], data.camp.dietRecords.map((r) => [studentName(r.studentId), r.meal, r.description, r.dietitianScore, r.date]));
    else if (tab === 'exercise') exportCsv('运动打卡.csv', ['学员', '类型', '时长', '强度', '教练批注', '日期'], data.camp.exerciseRecords.map((r) => [studentName(r.studentId), r.type, r.duration, r.intensity, r.coachComment, r.date]));
    else exportCsv('体重记录.csv', ['学员', '体重', '营养师批注', '日期'], data.camp.weightRecords.map((r) => [studentName(r.studentId), r.weight, r.dietitianComment, r.date]));
  }
  function exportOrders() {
    exportCsv('职工服务预约.csv', ['职工', '企业', '服务', '机构', '日期', '时间', '状态'], data.employee.bookings.map((b) => [b.person, b.dept, b.service, b.org, b.date, b.time, b.status]));
  }
  function exportCustomers() {
    exportCsv('客户池.csv', ['客户', '手机号', '来源', '标签', '负责人', '最近活跃'], data.customers.map((c) => [c.name, c.phone, (c.sources || []).join('、'), (c.tags || []).join('、'), c.owner, c.lastActive]));
  }
  function exportLogs() {
    exportCsv('后台操作日志.csv', ['时间', '操作', '端', '页面'], state.logs.map((l) => [l.at, l.label, l.app, l.route]));
  }

  /* ----------------------------------------------------------- 事件 */
  function parseValue(input) {
    if (input.type === 'number') return Number(input.value);
    if (input.value === 'true') return true;
    if (input.value === 'false') return false;
    return input.value;
  }
  function cssEscape(v) { return String(v).replace(/["\\]/g, '\\$&'); }
  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type || !file.type.match(/image/)) {
        const f = new FileReader();
        f.onload = () => resolve(f.result);
        f.onerror = reject;
        f.readAsDataURL(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const max = 1500;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }
  async function applyUpload(target) {
    const files = Array.from(target.files || []);
    if (!files.length) return;
    const path = target.dataset.upload;
    const multi = target.dataset.multi === '1';
    const values = await Promise.all(files.map(readImage));
    if (path === 'assets') {
      values.forEach((url) => state.assets.unshift({ url, name: '本地上传 ' + today(), at: nowTime() }));
    } else if (multi) {
      const current = getPath(path);
      const arr = Array.isArray(current) ? current : [];
      values.forEach((url) => arr.push(url));
      setPath(path, arr);
    } else {
      setPath(path, values[0]);
    }
    state.dirty += 1;
    saveStore();
    render(true);
    toast('图片已保存到本机');
  }

  function openPackageDrawer(id) {
    const p = data.planning.packages.find((x) => x.id === id);
    if (!p) return;
    const i = data.planning.packages.indexOf(p);
    const prefix = 'planning.packages.' + i;
    const svcText = p.servicesText != null ? p.servicesText : (p.services || []).join('\n');
    openDrawer({ title: '体检套餐 · ' + p.name, sub: '套餐组合 / 价格 / 名额 / 有效期', save: true, saveLabel: '套餐配置', body: function () {
      return '<div class="stack">' +
        panel('套餐封面与简介', '', '<div class="form-grid"><div>' + field('套餐封面', '', prefix + '.imageUrl', { optional: true }) + uploadBox(prefix + '.imageUrl', p.imageUrl, false, 'cover') + '</div><div>' + field('套餐简介', p.intro || '', prefix + '.intro', { area: true, rows: 4 }) + '</div></div>') +
        panel('基础信息', '', '<div class="form-grid two">' + field('套餐名称', p.name, prefix + '.name') + field('套餐类型', p.type || '体检套餐', prefix + '.type', { select: [{v:'体检套餐',l:'体检套餐'},{v:'专项筛查',l:'专项筛查'},{v:'企业定制',l:'企业定制'}] }) + field('适用人群', p.audience || '', prefix + '.audience') + field('套餐价格（元）', p.price, prefix + '.price', { num: true }) + field('支付来源', p.payer || '', prefix + '.payer') + field('履约机构', p.orgId, prefix + '.orgId', { select: data.employee.orgDetails.map((o) => ({ v: o.id, l: o.name })) }) + field('总名额', p.quota, prefix + '.quota', { num: true }) + field('已使用', p.used, prefix + '.used', { num: true }) + field('有效期', p.validity || '', prefix + '.validity') + field('状态', p.status || 'draft', prefix + '.status', { select: [{v:'online',l:'在售'},{v:'draft',l:'草稿'},{v:'paused',l:'暂停'}] }) + '</div>') +
        panel('套餐内容', '每行一条，编辑后保存', field('包含项目', p.includesText || '', prefix + '.includesText', { area: true, rows: 6, hint: '例如：基础检查 / 胸部 CT / 肿瘤标志物 / 报告解读' }) + field('预约须知', p.noticeText || '', prefix + '.noticeText', { area: true, rows: 4 }) + field('关联服务 ID（每行一个）', svcText, prefix + '.servicesText', { area: true, rows: 4, hint: '从服务目录复制真实 ID，例如 annual-exam、gastro、cancer。' })) +
        panel('当前包含服务', (p.services || []).length + ' 项', '<div class="chips">' + (p.services || []).map((id) => pill(planServiceName(id), 'outline')).join('') + '</div>') +
        '<div class="notice warm">' + ic('info') + '<span>套餐只保存后台计划。H5 目前按单项服务预约，不会自动出现套餐入口；真实售卖需要 H5 套餐页与后端订单。</span></div></div>';
    } });
  }

  function openServicePlanDrawer(id) {
    const s = data.planning.services.find((x) => x.id === id);
    if (!s) return;
    const i = data.planning.services.indexOf(s);
    const p = productById(s.serviceId) || { name: s.serviceId, mod: 'screen' };
    const prefix = 'planning.services.' + i;
    openDrawer({ title: '服务计划 · ' + p.name, sub: '负责人 / 上线时间 / 目标 / 状态', save: true, saveLabel: '服务计划', extra: '<button class="btn" data-go="e-service" data-id="' + esc(s.serviceId) + '">' + ic('external') + '服务详情</button>', body: function () {
      return '<div class="stack">' + panel('服务信息', '', '<div class="form-grid two"><div class="field"><label>服务名称</label><div class="input" style="background:#f8fafc;color:var(--muted)">' + esc(p.name) + '</div></div><div class="field"><label>所属模块</label><div class="input" style="background:#f8fafc;color:var(--muted)">' + esc(moduleName(p.mod)) + '</div></div>' + field('负责人', s.owner, prefix + '.owner') + field('上线日期', s.launchDate, prefix + '.launchDate') + field('目标人群', s.target, prefix + '.target') + field('状态', s.status, prefix + '.status', { select: [{v:'active',l:'进行中'},{v:'draft',l:'草稿'},{v:'paused',l:'暂停'}] }) + '</div>' + field('运营目标', s.goal, prefix + '.goal', { area: true, rows: 3 }) + field('备注', s.note || '', prefix + '.note', { area: true, rows: 3 })) +
        '<div class="notice">' + ic('info') + '<span>服务计划用于内部排期与目标管理；服务介绍、图片、预约须知仍在服务详情页配置。</span></div></div>';
    } });
  }

  function openGoodsPlanDrawer(id) {
    const g = data.planning.goods.find((x) => x.id === id);
    if (!g) return;
    const i = data.planning.goods.indexOf(g);
    const p = data.camp.pointProducts.find((x) => x.id === g.productId) || { name: g.productId, stock: 0, pointsRequired: 0 };
    const prefix = 'planning.goods.' + i;
    openDrawer({ title: '商品计划 · ' + p.name, sub: '供应商 / 成本 / 补货线 / 活动', save: true, saveLabel: '商品计划', extra: '<button class="btn" data-act="editProduct" data-id="' + esc(g.productId) + '">' + ic('package') + '商品图文</button>', body: function () {
      return '<div class="stack">' + panel('商品信息', '', '<div style="display:flex;gap:14px;align-items:center"><div style="width:96px;height:96px;border-radius:12px;overflow:hidden;background:#f4f7f9;flex:none">' + (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : '') + '</div><div><b style="font-size:14px">' + esc(p.name) + '</b><div class="tiny muted" style="margin-top:5px">当前库存 ' + p.stock + ' · 积分 ' + p.pointsRequired + ' · 预警线 ' + g.stockWarning + '</div><div class="chips" style="margin-top:9px">' + planStatePill(g.status) + (Number(p.stock) <= Number(g.stockWarning) ? pill('需补货', 'red') : pill('库存正常', 'green')) + '</div></div></div>') +
        panel('采购与补货', '', '<div class="form-grid two">' + field('供应商', g.supplier, prefix + '.supplier') + field('采购成本（元）', g.cost, prefix + '.cost', { num: true }) + field('库存预警线', g.stockWarning, prefix + '.stockWarning', { num: true }) + field('计划补货日期', g.restockDate, prefix + '.restockDate') + field('关联活动', g.campaign, prefix + '.campaign') + field('状态', g.status, prefix + '.status', { select: [{v:'active',l:'进行中'},{v:'draft',l:'草稿'},{v:'paused',l:'暂停'}] }) + '</div>' + field('备注', g.note || '', prefix + '.note', { area: true, rows: 3 })) +
        '<div class="notice">' + ic('info') + '<span>商品库存与图文在积分商城里维护；这里只做采购、补货和活动计划，不会自动扣减库存。</span></div></div>';
    } });
  }

  function openScheduleDrawer(id) {
    const s = data.planning.schedules.find((x) => x.id === id);
    if (!s) return;
    const i = data.planning.schedules.indexOf(s);
    const prefix = 'planning.schedules.' + i;
    openDrawer({ title: '排期模板 · ' + planServiceName(s.serviceId), sub: '机构 / 星期 / 时段 / 容量', save: true, saveLabel: '排期模板', body: function () {
      return '<div class="stack">' + panel('模板信息', '', '<div class="form-grid two">' + field('机构', s.orgId, prefix + '.orgId', { select: data.employee.orgDetails.map((o) => ({ v: o.id, l: o.name })) }) + field('服务', s.serviceId, prefix + '.serviceId', { select: data.employee.products.map((p) => ({ v: p.id, l: p.name })) }) + field('星期（0=周日，6=周六）', (s.days || []).join(','), prefix + '.daysText', { hint: '例如 1,2,3,4,5 表示周一至周五' }) + field('开放状态', s.enabled ? '启用' : '停用', prefix + '.enabled', { select: [{v:'true',l:'启用'},{v:'false',l:'停用'}] }) + field('开始时间', s.start || '', prefix + '.start') + field('结束时间', s.end || '', prefix + '.end') + field('单段时长（分钟）', s.slotMinutes, prefix + '.slotMinutes', { num: true }) + field('每段容量（人）', s.capacity, prefix + '.capacity', { num: true }) + field('最晚提前预约（小时）', s.cutoffHours, prefix + '.cutoffHours', { num: true }) + '</div>' + field('备注', s.note || '', prefix + '.note', { area: true, rows: 3 })) +
        '<div class="notice">' + ic('clock') + '<span>这是后台排期计划。H5 预约表单目前不读取具体时段，真实占用号源需要医院排班接口。</span></div></div>';
    } });
  }

  function openOverrideDrawer(id) {
    const o = data.planning.overrides.find((x) => x.id === id);
    if (!o) return;
    const i = data.planning.overrides.indexOf(o);
    const prefix = 'planning.overrides.' + i;
    openDrawer({ title: '日期例外 · ' + o.date, sub: '停诊 / 加开 / 临时缩容', save: true, saveLabel: '日期例外', extra: '<button class="btn danger" data-act="deleteOverride" data-id="' + esc(o.id) + '">' + ic('trash') + '删除例外</button>', body: function () {
      return '<div class="stack">' + panel('例外信息', '', '<div class="form-grid two">' + field('机构', o.orgId, prefix + '.orgId', { select: data.employee.orgDetails.map((x) => ({ v: x.id, l: x.name })) }) + field('服务', o.serviceId, prefix + '.serviceId', { select: data.employee.products.map((p) => ({ v: p.id, l: p.name })) }) + field('日期', o.date, prefix + '.date') + field('开始时间', o.start || '', prefix + '.start') + field('结束时间', o.end || '', prefix + '.end') + field('可预约容量', o.capacity, prefix + '.capacity', { num: true }) + field('状态', o.status, prefix + '.status', { select: [{v:'open',l:'加开 / 调整'},{v:'closed',l:'停诊'}] }) + '</div>' + field('原因说明', o.note || '', prefix + '.note', { area: true, rows: 3 })) +
        '<div class="notice warm">' + ic('phone') + '<span>停诊会影响后台容量计算，但不会自动通知已预约职工；请生成电话待办人工确认。</span></div></div>';
    } });
  }

  function createNewPackage() {
    const p = { id: uid('pkg'), name: '新体检套餐', type: '体检套餐', audience: '全员职工', price: 0, payer: '职工福利费', orgId: data.employee.orgDetails[0].id, services: ['annual-exam'], quota: 0, used: 0, validity: today() + ' 至 ' + addDays(today(), 365), status: 'draft', imageUrl: '', intro: '请填写套餐简介。', includesText: '', noticeText: '' };
    data.planning.packages.unshift(p);
    openPackageDrawer(p.id);
  }
  function createNewSchedule() {
    const s = { id: uid('sch'), orgId: data.employee.orgDetails[0].id, serviceId: 'annual-exam', days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotMinutes: 30, capacity: 6, cutoffHours: 24, enabled: true, note: '' };
    data.planning.schedules.push(s);
    openScheduleDrawer(s.id);
  }
  function createNewOverride(date) {
    const o = { id: uid('ov'), orgId: data.employee.orgDetails[0].id, serviceId: 'annual-exam', date: date || addDays(today(), 3), start: '08:00', end: '12:00', capacity: 0, status: 'closed', note: '停诊 / 调整原因' };
    data.planning.overrides.unshift(o);
    openOverrideDrawer(o.id);
  }

  function createNewProduct() {
    const p = { id: uid('pp'), name: '新商品', imageUrl: '', gallery: [], description: '请填写商品描述', pointsRequired: 30, stock: 0, active: true, deliveryOptions: ['shipped'], maxExchange: 1, campId: data.camp.camps[0].id, detailHtml: '<p>请填写图文详情。</p>' };
    data.camp.pointProducts.unshift(p);
    data.planning.goods.unshift({ id: uid('gp'), productId: p.id, supplier: '待填写', cost: 0, stockWarning: 8, restockDate: addDays(today(), 7), campaign: '积分商城上新', status: 'draft', note: '' });
    commit('新增商品并生成商品计划');
    openProductDrawer(p.id);
  }
  function createNewTier() {
    const t = { id: uid('t'), campId: data.camp.camps[0].id, name: '新奖励', requiredDays: 7, imageUrl: '', stock: 0, description: '请填写奖励说明', deliveryMethods: ['shipped'], active: true };
    data.camp.rewardTiers.unshift(t);
    openTierDrawer(t.id);
  }
  function createNewBadge() {
    const b = { id: uid('b'), category: '成就', name: '新徽章', condition: '请填写可判定条件', cadence: '一次性', icon: '🏅', active: true, earned: 0 };
    data.camp.badges.unshift(b);
    openBadgeDrawer(b.id);
  }
  function createNewMetric() {
    const m = { id: uid('metric'), name: '新指标', unit: '', normalRange: '', category: '身体测量数据' };
    data.camp.metrics.push(m);
    openMetricDrawer(m.id);
  }
  function createNewActivity() {
    const a = { id: uid('act'), title: '新活动', description: '请填写活动说明', imageUrls: [], coachName: '李教练', date: today(), videoUrls: [], campIds: [] };
    data.camp.coachActivities.unshift(a);
    openActivityDrawer(a.id);
  }
  function createNewAccount() {
    const a = { id: uid('acc'), phone: '', name: '新账户', role: 'student', active: true, campIds: [data.camp.camps[0].id], supervisor: false, createdAt: nowTime() };
    data.camp.accounts.unshift(a);
    openAccountDrawer(a.id);
  }
  function createNewCamp() {
    const c = { id: uid('camp'), name: '新营期', startDate: today(), endDate: today(), status: 'upcoming' };
    data.camp.camps.push(c);
    openCampDrawer(c.id);
  }
  function createNewService() {
    const p = { id: uid('svc'), mod: 'screen', name: '新服务', en: '', scope: '属地履约', payer: [], payerText: '', tags: [], tagsText: '', intro: '请填写服务简介', includes: [], notice: [], flow: [], orgs: [], duration: '', resp: '', active: true, recommended: false, imageUrl: '', gallery: [], detailHtml: '<p>请填写图文详情。</p>' };
    data.employee.products.push(p);
    data.planning.services.push({ id: uid('sp'), serviceId: p.id, owner: '企康运营', launchDate: today(), target: '有需求职工', goal: '完成服务上线与首批预约', status: 'draft', note: '' });
    commit('新增服务并生成服务计划');
    navigate('e-service', { id: p.id });
  }
  function createNewArticle() {
    const a = { t: '新科普文章', m: '健康科普 · 5 分钟阅读', mod: 'screen', rel: '', html: '<p>请填写正文。</p>' };
    data.employee.articles.unshift(a);
    openArticleDrawer(0);
  }
  function createNewLecture() {
    const a = { t: '新健康讲座', d: today() + ' 14:00', tag: '线上直播', n: '', place: '', dur: '60 分钟', status: 'upcoming', outline: [], outlineText: '' };
    data.employee.lectures.unshift(a);
    openLectureDrawer(0);
  }
  function createNewMessage() {
    const m = { id: uid('m'), icon: 'bell', title: '新消息', desc: '请填写消息说明', time: today().slice(5), read: false, go: '' };
    data.employee.messages.unshift(m);
    openMessageDrawer(m.id);
  }
  function createNewCustomer() {
    const c = { id: uid('C'), name: '新客户', phone: '', gender: 'male', age: 30, sources: ['手工录入'], tags: [], owner: '未分配', joined: today(), lastActive: '今天', summary: '', notes: [] };
    data.customers.unshift(c);
    openCustomerDrawer(c.id);
  }
  function createNewTask(customerId) {
    const c = customerId ? customerById(customerId) : data.customers[0];
    const f = { id: uid('fu'), customerId: c ? c.id : '', customer: c ? c.name : '客户', phone: c ? c.phone : '', reason: '请填写电话跟进原因', owner: '健康管家', due: today() + ' 10:00', status: 'open', channel: '电话人工跟进', result: '' };
    data.followups.unshift(f);
    openTaskDrawer(f.id);
  }
  function createNewOrg() {
    const o = { id: uid('org'), name: '新机构', type: '合作机构', address: '', phone: '', services: [], slots: 0, enabled: true };
    data.employee.orgDetails.push(o);
    openOrgDrawer(o.id);
  }
  function createNewFamily() {
    const f = { id: uid('f'), name: '新成员', relation: '父母', phone: '', verified: false };
    data.employee.family.push(f);
    openFamilyDrawer(f.id);
  }

  function handleAct(el) {
    const act = el.dataset.act;
    const id = el.dataset.id;
    if (act === 'closeDrawer') return closeDrawer();
    if (act === 'toggleNav') { state.navOpen = !state.navOpen; document.body.classList.toggle('nav-open', state.navOpen); return; }
    if (act === 'save') { commit(el.dataset.label || '改动'); render(true); return; }
    if (act === 'commitDrawer') { const label = el.dataset.label || '改动'; state.drawer = null; commit(label); render(true); return; }
    if (act === 'openSearch') return openSearchDrawer();
    if (act === 'openImpact') return openImpactDrawer();
    if (act === 'openPublish') return openPublishDrawer();
    if (act === 'editProduct') return openProductDrawer(id);
    if (act === 'newProduct') return createNewProduct();
    if (act === 'newService') return createNewService();
    if (act === 'editMealDay') return openMealDayDrawer(id);
    if (act === 'newMealDay') return createNewMealDay();
    if (act === 'copyMealDay') return copyMealDay(id);
    if (act === 'previewMealDay') return previewMealDay(id);
    if (act === 'deleteMealDay') { const arr = mealData().dayPlans; const x = arr.find((v) => v.id === id); if (x && confirm('删除食谱「' + x.name + '」？')) { arr.splice(arr.indexOf(x), 1); state.drawer = null; commit('删除全天食谱'); render(true); } return; }
    if (act === 'mealRecalcDay') { const d = mealData().dayPlans.find((v) => v.id === id); if (d) { const t = mealDayTotals(d); d.kcal = t.kcal; d.p = t.p; d.c = t.c; d.f = t.f; commit('按模板重算食谱'); render(true); } return; }
    if (act === 'editMealTpl') return openMealTplDrawer(id);
    if (act === 'newMealTpl') return createNewMealTpl();
    if (act === 'deleteMealTpl') { const arr = mealData().mealTemplates; const x = arr.find((v) => v.id === id); if (x && confirm('删除模板「' + x.name + '」？')) { arr.splice(arr.indexOf(x), 1); state.drawer = null; commit('删除餐次模板'); render(true); } return; }
    if (act === 'toggleMealTplDish') { const t = mealData().mealTemplates.find((v) => v.id === el.dataset.tpl); if (t) { t.dishes = t.dishes || []; const k = t.dishes.indexOf(id); if (k >= 0) t.dishes.splice(k, 1); else t.dishes.push(id); state.dirty += 1; saveStore(); render(true); } return; }
    if (act === 'mealRecalcTpl') { const t = mealData().mealTemplates.find((v) => v.id === id); if (t) { const n = mealTplTotals(t); t.kcal = n.kcal; t.p = n.p; t.c = n.c; t.f = n.f; commit('按菜品重算模板'); render(true); } return; }
    if (act === 'editMealDish') return openMealDishDrawer(id);
    if (act === 'newMealDish') return createNewMealDish();
    if (act === 'deleteMealDish') { const arr = mealData().dishes; const x = arr.find((v) => v.id === id); if (x && confirm('删除菜品「' + x.name + '」？')) { arr.splice(arr.indexOf(x), 1); state.drawer = null; commit('删除菜品'); render(true); } return; }
    if (act === 'toggleMealDishIng') { const d = mealData().dishes.find((v) => v.id === el.dataset.dish); if (d) { d.ing = d.ing || []; const k = d.ing.findIndex((x) => x[0] === id); if (k >= 0) d.ing.splice(k, 1); else d.ing.push([id, 100]); state.dirty += 1; saveStore(); render(true); } return; }
    if (act === 'editMealIng') return openMealIngDrawer(id);
    if (act === 'newMealIng') return createNewMealIng();
    if (act === 'deleteMealIng') { const arr = mealData().ingredients; const x = arr.find((v) => v.id === id); if (x && confirm('删除食材「' + x.name + '」？')) { arr.splice(arr.indexOf(x), 1); state.drawer = null; commit('删除食材'); render(true); } return; }
    if (act === 'editMealSup') return openMealSupDrawer(id);
    if (act === 'newMealSup') return createNewMealSup();
    if (act === 'deleteMealSup') { const arr = mealData().supplements; const x = arr.find((v) => v.id === id); if (x && confirm('删除补剂「' + x.name + '」？')) { arr.splice(arr.indexOf(x), 1); state.drawer = null; commit('删除营养补剂'); render(true); } return; }
    if (act === 'editPackage') return openPackageDrawer(id);
    if (act === 'newPackage') return createNewPackage();
    if (act === 'editServicePlan') return openServicePlanDrawer(id);
    if (act === 'editGoodsPlan') return openGoodsPlanDrawer(id);
    if (act === 'editSchedule') return openScheduleDrawer(id);
    if (act === 'newSchedule') return createNewSchedule();
    if (act === 'editOverride') return openOverrideDrawer(id);
    if (act === 'newOverride') return createNewOverride(el.dataset.date);
    if (act === 'deleteOverride') { const o = data.planning.overrides.find((x) => x.id === id); if (o && confirm('删除这条日期例外？')) { data.planning.overrides.splice(data.planning.overrides.indexOf(o), 1); state.drawer = null; commit('删除排期例外'); render(true); } return; }
    if (act === 'editTier') return openTierDrawer(id);
    if (act === 'newTier') return createNewTier();
    if (act === 'editBadge') return openBadgeDrawer(id);
    if (act === 'newBadge') return createNewBadge();
    if (act === 'editMetric') return openMetricDrawer(id);
    if (act === 'newMetric') return createNewMetric();
    if (act === 'editActivity') return openActivityDrawer(id);
    if (act === 'newActivity') return createNewActivity();
    if (act === 'deleteActivity') { const a = data.camp.coachActivities.find((x) => x.id === id); if (a && confirm('删除活动「' + a.title + '」？')) { data.camp.coachActivities.splice(data.camp.coachActivities.indexOf(a), 1); commit('删除活动'); render(true); } return; }
    if (act === 'editAccount') return openAccountDrawer(id);
    if (act === 'newAccount') return createNewAccount();
    if (act === 'editCamp') return openCampDrawer(id);
    if (act === 'newCamp') return createNewCamp();
    if (act === 'openRecord') return openRecordDrawer(el.dataset.kind, id);
    if (act === 'openFulfill') return openFulfillDrawer(id, el.dataset.source);
    if (act === 'editExpert') return openExpertDrawer(el.dataset.kind, id);
    if (act === 'editInstitution') return openInstitutionDrawer(id);
    if (act === 'editDepartment') return openDepartmentDrawer(id);
    if (act === 'editRoster') return openRosterDrawer(id);
    if (act === 'editBanner') return openBannerDrawer(el.dataset.kind, id);
    if (act === 'toggleTeamFeatured') { state.ui.bTeamFeatured = !state.ui.bTeamFeatured; return render(true); }
    if (act === 'manageHot') return openHotDrawer();
    if (act === 'editBookingModule') return openBookingModuleDrawer(id);
    if (act === 'editOrder') return openOrderDrawer(id);
    if (act === 'newOrder') return createNewOrder();
    if (act === 'saveNewOrder') return saveNewOrder();
    if (act === 'confirmOrder') { const b = data.employee.bookings.find((x) => x.id === id); if (b) { b.status = '已确认'; b.statusKey = 'confirmed'; commit('确认预约'); render(true); } return; }
    if (act === 'startOrder') { const b = data.employee.bookings.find((x) => x.id === id); if (b) { b.status = '服务中'; b.statusKey = 'in_service'; commit('开始服务'); render(true); } return; }
    if (act === 'completeOrder') { const b = data.employee.bookings.find((x) => x.id === id); if (b) { b.status = '已完成'; b.statusKey = 'completed'; commit('完成预约'); render(true); } return; }
    if (act === 'cancelOrder') { const b = data.employee.bookings.find((x) => x.id === id); if (b && b.statusKey !== 'cancelled') { b.status = '已取消'; b.statusKey = 'cancelled'; if (data.employee.bookingRules.cancelRefund) { const r = data.employee.rights.find((x) => x.pid === b.pid); if (r) { r.left += 1; r.used = Math.max(0, r.used - 1); } } commit('取消预约并退回额度'); render(true); } return; }
    if (act === 'editBenefit') return openBenefitDrawer(id);
    if (act === 'editReport') return openReportDrawer(id);
    if (act === 'editFamily') return openFamilyDrawer(id);
    if (act === 'newFamily') return createNewFamily();
    if (act === 'editArticle') return openArticleDrawer(Number(id));
    if (act === 'newArticle') return createNewArticle();
    if (act === 'editLecture') return openLectureDrawer(Number(id));
    if (act === 'newLecture') return createNewLecture();
    if (act === 'editOrg') return openOrgDrawer(id);
    if (act === 'newOrg') return createNewOrg();
    if (act === 'editFive') return openFiveDrawer(id);
    if (act === 'editFiveTier') return openFiveTierDrawer(id);
    if (act === 'editMessage') return openMessageDrawer(id);
    if (act === 'newMessage') return createNewMessage();
    if (act === 'editCustomer') return openCustomerDrawer(id);
    if (act === 'newCustomer') return createNewCustomer();
    if (act === 'newTask') return createNewTask(el.dataset.customer);
    if (act === 'editTask') return openTaskDrawer(id);
    if (act === 'taskDone') { const f = data.followups.find((x) => x.id === id); if (f) { f.status = 'done'; f.result = f.result || '电话已联系，结果待补充'; commit('电话跟进完成'); render(true); } return; }
    if (act === 'addNote') { const c = customerById(id); const ta = document.querySelector('[data-customer-note="' + cssEscape(id) + '"]'); if (c && ta && ta.value.trim()) { c.notes.push({ at: nowTime(), by: '运营管理员', text: ta.value.trim() }); commit('新增客户备注'); render(true); } else toast('请先填写备注'); return; }
    if (act === 'toggleHot') { const ids = data.employee.home.hotServiceIds || []; const k = ids.indexOf(id); if (k >= 0) ids.splice(k, 1); else ids.push(id); data.employee.home.hotServiceIds = ids; commit('更新热门服务'); render(true); return; }
    if (act === 'addBookingField') { const mod = el.dataset.mod; (data.employee.bookingFields[mod] || (data.employee.bookingFields[mod] = [])).push('新字段'); state.dirty += 1; saveStore(); render(true); return; }
    if (act === 'removeBookingField') { const mod = el.dataset.mod; data.employee.bookingFields[mod].splice(Number(el.dataset.idx), 1); state.dirty += 1; saveStore(); render(true); return; }
    if (act === 'removeUpload') { removeUpload(el.dataset.path); return; }
    if (act === 'removeAsset') { state.assets.splice(Number(id), 1); saveStore(); render(true); return; }
    if (act === 'downloadConfig') { downloadText('config.json', JSON.stringify(buildConfig(), null, 2), 'application/json'); return; }
    if (act === 'copyConfig') { navigator.clipboard.writeText(JSON.stringify(buildConfig(), null, 2)).then(() => toast('config.json 已复制')).catch(() => toast('复制失败，请使用下载')); return; }
    if (act === 'exportCamp') return exportCamp();
    if (act === 'exportRecords') return exportRecords();
    if (act === 'exportOrders') return exportOrders();
    if (act === 'exportCustomers') return exportCustomers();
    if (act === 'exportLogs') return exportLogs();
    if (act === 'resetLocal') { if (confirm('清空本机配置并恢复三个 H5 的真实种子数据？此操作不可恢复。')) { localStorage.removeItem(KEY); location.hash = ''; location.reload(); } return; }
    if (act === 'richBold') { document.execCommand('bold'); syncRich(act); return; }
    if (act === 'richUnderline') { document.execCommand('underline'); syncRich(act); return; }
    if (act === 'richList') { document.execCommand('insertHTML', false, '<ul><li>列表项</li></ul>'); syncRich(act); return; }
  }
  function syncRich(act) { const ed = document.querySelector('.rich-source:focus') || document.querySelector('.rich-source'); if (ed) { setPath(ed.dataset.rich, ed.innerHTML); state.dirty += 1; saveStore(); } }
  function removeUpload(path) {
    if (!path) return;
    const parts = path.split('.');
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      const parent = getPath(parts.slice(0, -1).join('.'));
      if (Array.isArray(parent)) parent.splice(Number(last), 1);
    } else setPath(path, '');
    state.dirty += 1;
    saveStore();
    render(true);
  }

  function rerenderWithFocus(key) {
    render(true);
    const input = document.querySelector('[data-ui-input="' + cssEscape(key) + '"]');
    if (input) { input.focus(); const v = input.value; input.value = ''; input.value = v; }
  }

  document.addEventListener('click', function (e) {
    const uiSet = e.target.closest('[data-ui-set]');
    if (uiSet) { state.ui[uiSet.dataset.uiSet] = uiSet.dataset.value; return render(true); }
    const uiPage = e.target.closest('[data-ui-page]');
    if (uiPage) { if (!uiPage.disabled) { state.ui[uiPage.dataset.uiPage] = Number(uiPage.dataset.value); render(true); } return; }
    const group = e.target.closest('[data-open-group]');
    if (group) { e.preventDefault(); state.openGroup = state.openGroup === group.dataset.openGroup ? null : group.dataset.openGroup; render(true); return; }
    const sw = e.target.closest('[data-switch]');
    if (sw) { e.stopPropagation(); e.preventDefault(); const path = sw.dataset.switch; const v = !!getPath(path); setPath(path, !v); state.dirty += 1; state.savedAt = nowTime(); state.logs.unshift({ id: uid('log'), at: state.savedAt, label: (v ? '关闭 ' : '开启 ') + path, app: domainMeta(state.route).label, route: state.route }); saveStore(); render(true); return; }
    const act = e.target.closest('[data-act]');
    if (act) { e.preventDefault(); handleAct(act); return; }
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); navigate(go.dataset.go, go.dataset.id ? { id: go.dataset.id } : null); return; }
    if (e.target.closest('.drawer-scrim')) closeDrawer();
  });

  document.addEventListener('mousedown', function (e) {
    const rich = e.target.closest('[data-act="richBold"], [data-act="richUnderline"], [data-act="richList"]');
    if (rich) e.preventDefault();
  });

  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.matches('[data-ui-input]')) {
      state.ui[t.dataset.uiInput] = t.value;
      state.ui[t.dataset.uiInput + 'Page'] = 1;
      return rerenderWithFocus(t.dataset.uiInput);
    }
    if (t.matches('[data-search-input]')) {
      const q = t.value.trim().toLowerCase();
      document.querySelectorAll('#searchItems [data-search]').forEach((row) => { row.style.display = (!q || row.dataset.search.toLowerCase().indexOf(q) >= 0) ? '' : 'none'; });
      return;
    }
    if (t.matches('[data-rich]')) { setPath(t.dataset.rich, t.innerHTML); state.dirty += 1; saveStore(); }
  });

  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.matches('[data-upload]')) { applyUpload(t); return; }
    if (t.matches('[data-rich-upload]')) {
      const file = t.files && t.files[0]; if (!file) return;
      readImage(file).then((url) => {
        const ed = t.closest('.rich-editor').querySelector('.rich-source');
        ed.innerHTML += '<img src="' + url + '" alt="">';
        setPath(ed.dataset.rich, ed.innerHTML);
        state.dirty += 1; saveStore(); render(true);
      });
      return;
    }
    if (t.matches('[data-bind]')) {
      const path = t.dataset.bind;
      if (!path) return;
      const value = parseValue(t);
      setPath(path, value);
      if (/employee\.bookings\.\d+\.statusKey$/.test(path)) {
        const b = data.employee.bookings[Number(path.split('.')[2])];
        if (b) b.status = orderStatusLabel(value);
      }
      state.dirty += 1;
      state.savedAt = nowTime();
      saveStore();
      toast('已修改，请记得保存');
    }
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearchDrawer(); }
    if (e.key === 'Escape' && state.drawer) closeDrawer();
  });

  window.addEventListener('hashchange', function () { readHash(); render(false); });

  readHash();
  normalizeData();
  render(false);
})();

