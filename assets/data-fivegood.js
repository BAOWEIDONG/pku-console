/* ============================================================================
   五好生活 · 五维运营模型（数据源 / 评估 / 推荐 / 服务转化）
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SEED;
  const fg = S.fivegood;

  /* 每个维度的运营四件事：数据从哪来、怎么评估、推荐什么、转化到哪个服务 */
  fg.dims[0].dataSource = '饮食打卡 + 食谱执行率';
  fg.dims[0].assess = '膳食结构评分（餐次/主食/蛋白/蔬果）';
  fg.dims[0].services = ['fivehigh', 'weight', 'annual-exam'];
  fg.dims[1].dataSource = '手环/手机健康 + 手动记录 + 睡眠量表';
  fg.dims[1].assess = 'PSQI 匹兹堡睡眠质量指数 + ISI 失眠严重度';
  fg.dims[1].services = ['sleep', 'eap', 'heart'];
  fg.dims[2].dataSource = '运动打卡 + 可穿戴设备步数';
  fg.dims[2].assess = '周运动时长 / 强度分布 / 依从性';
  fg.dims[2].services = ['weight', 'rehab', 'cpet'];
  fg.dims[3].dataSource = '每日情绪打卡 + PHQ-2 / GAD-2 / PSS-10';
  fg.dims[3].assess = '情绪波动 + 压力得分（仅本人与咨询师可见）';
  fg.dims[3].services = ['eap', 'lecture'];
  fg.dims[4].dataSource = '体检记录 + 报告异常项 + 复查完成';
  fg.dims[4].assess = '异常项数量与转归 + 复查及时率';
  fg.dims[4].services = ['annual-exam', 'risk-report', 'fast'];

  /* ------------------------------------------------------------ 吃好 */
  S.recipes = [
    { id: 'r1', name: '杂粮鸡胸便当', meal: '午餐', kcal: 520, p: 38, c: 52, f: 14, tags: ['高蛋白', '低GI', '外卖友好'], avoid: [], cost: 32, on: true, used: 1280 },
    { id: 'r2', name: '清蒸鲈鱼 + 西兰花', meal: '晚餐', kcal: 430, p: 34, c: 22, f: 18, tags: ['高蛋白', '低脂', '易做'], avoid: ['海鲜过敏'], cost: 45, on: true, used: 960 },
    { id: 'r3', name: '无糖豆浆 + 全麦吐司 + 蛋', meal: '早餐', kcal: 380, p: 22, c: 44, f: 12, tags: ['快手', '饱腹'], avoid: ['麸质过敏'], cost: 14, on: true, used: 2140 },
    { id: 'r4', name: '牛肉荞麦冷面', meal: '午餐', kcal: 560, p: 32, c: 62, f: 16, tags: ['低GI', '控糖'], avoid: [], cost: 38, on: true, used: 640 },
    { id: 'r5', name: '南瓜藜麦沙拉', meal: '晚餐', kcal: 360, p: 16, c: 48, f: 12, tags: ['素食', '高纤维'], avoid: [], cost: 28, on: false, used: 210 },
    { id: 'r6', name: '虾仁豆腐蒸蛋', meal: '晚餐', kcal: 300, p: 26, c: 10, f: 16, tags: ['高蛋白', '软食', '易消化'], avoid: ['海鲜过敏', '大豆过敏'], cost: 26, on: true, used: 430 }
  ];
  S.eatRules = [
    { id: 'er1', name: 'BMI ≥ 28 减重期', when: 'BMI ≥ 28 且目标为减重', dishes: ['r1', 'r2', 'r6'], svc: 'weight', priority: 1, on: true, hit: 86 },
    { id: 'er2', name: '血糖偏高', when: '空腹血糖 6.1–7.0', dishes: ['r4', 'r1', 'r3'], svc: 'fivehigh', priority: 2, on: true, hit: 54 },
    { id: 'er3', name: '加班外卖场景', when: '工作日 18 点后打卡', dishes: ['r1', 'r4'], svc: 'lecture', priority: 3, on: true, hit: 132 },
    { id: 'er4', name: '海鲜过敏自动排除', when: '档案标记海鲜过敏', dishes: ['r3', 'r4'], svc: '', priority: 1, on: true, hit: 18 }
  ];

  /* ------------------------------------------------------------ 睡好 */
  S.sleepSources = [
    { id: 'ss1', name: '智能手环 / 手表', type: '设备', desc: '华为、小米、Apple Watch 授权同步', on: true, cover: '38%' },
    { id: 'ss2', name: '手机健康 App', type: '设备', desc: 'iOS 健康 / 安卓 Health Connect', on: true, cover: '26%' },
    { id: 'ss3', name: '手动记录', type: '手动', desc: '睡前点一下，记入睡与起床时间', on: true, cover: '31%' },
    { id: 'ss4', name: '睡眠量表', type: '问卷', desc: 'PSQI 月度、ISI 双周', on: true, cover: '72%' },
    { id: 'ss5', name: '医疗级睡眠监测', type: '服务', desc: '院内多导睡眠监测，需预约', on: true, cover: '4%' }
  ];
  S.sleepRules = [
    { id: 'sr1', name: '入睡困难 > 30 分钟', when: '连续 7 天入睡潜伏期 > 30 分钟', then: '推荐 CBT-I 睡眠课程 + 睡眠监测服务', svc: 'sleep', on: true },
    { id: 'sr2', name: '睡眠时长不足', when: '周均睡眠 < 6.5 小时', then: '推送作息调整计划 + 睡眠科普', svc: 'lecture', on: true },
    { id: 'sr3', name: '打鼾 / 呼吸暂停风险', when: '手环记录 SpO₂ 夜间下降 ≥ 3 次', then: '强烈建议多导睡眠监测（医疗级）', svc: 'sleep', on: true }
  ];

  /* ------------------------------------------------------------ 动好 */
  S.exercisePlans = [
    { id: 'ep1', name: '零基础 · 关节友好', level: 'L1', goal: '建立习惯', freq: '每周 3 次 × 20 分钟', items: ['快走', '靠墙静蹲', '弹力带划船'], joints: '膝友好', on: true, joined: 128 },
    { id: 'ep2', name: '减脂 · 有氧为主', level: 'L2', goal: '减重', freq: '每周 4 次 × 40 分钟', items: ['慢跑', '椭圆机', '开合跳'], joints: '常规', on: true, joined: 246 },
    { id: 'ep3', name: '增肌 · 力量进阶', level: 'L3', goal: '体成分', freq: '每周 3 次 × 50 分钟', items: ['深蹲', '硬拉', '卧推'], joints: '需评估', on: true, joined: 87 },
    { id: 'ep4', name: '久坐修复 · 10 分钟', level: 'L1', goal: '缓解酸痛', freq: '每天 2 次 × 10 分钟', items: ['髋屈肌拉伸', '臀桥', '胸椎旋转'], joints: '颈腰友好', on: true, joined: 402 }
  ];

  /* ------------------------------------------------------------ 心好 */
  S.mindCheckins = [
    { id: 'mc1', name: '每日情绪打卡', type: '打卡', freq: '每天 1 次', items: '5 档表情 + 原因标签', privacy: '仅本人可见', on: true, rate: '61%' },
    { id: 'mc2', name: 'PHQ-2 抑郁筛查', type: '量表', freq: '每 2 周', items: '2 题', privacy: '本人 + 授权咨询师', on: true, rate: '48%' },
    { id: 'mc3', name: 'GAD-2 焦虑筛查', type: '量表', freq: '每 2 周', items: '2 题', privacy: '本人 + 授权咨询师', on: true, rate: '46%' },
    { id: 'mc4', name: 'PSS-10 压力自评', type: '量表', freq: '每月', items: '10 题', privacy: '本人可见', on: true, rate: '39%' }
  ];
  S.mindRules = [
    { id: 'mr1', name: '连续 5 天情绪低落', when: '情绪打卡连续 5 天 ≤ 2 分', then: '推送 EAP 咨询预约 + 正念课程', svc: 'eap', on: true, urgent: true },
    { id: 'mr2', name: 'PHQ-2 阳性', when: 'PHQ-2 ≥ 3 分', then: '建议 EAP 评估（不推送诊断结论）', svc: 'eap', on: true, urgent: true },
    { id: 'mr3', name: '压力持续偏高', when: 'PSS-10 ≥ 27 分', then: '推送压力管理讲座 + 呼吸训练', svc: 'lecture', on: true },
    { id: 'mr4', name: '高关怀不打扰', when: '已预约 EAP 且 30 天内', then: '暂停营销类推荐，仅保留服务提醒', svc: '', on: true }
  ];

  /* ------------------------------------------------------------ 查好 */
  S.checkupPlans = [
    { id: 'cp1', name: '职工基础体检', audience: '全员 · 每年 1 次', items: ['内外科', '血常规', '肝肾功能', '胸部 CT', '腹部超声'], price: 680, settle: 520, upsell: ['risk-report'], on: true },
    { id: 'cp2', name: '深度筛查（40+）', audience: '40 岁以上 / 高危', items: ['基础项', '胃肠镜', '肿瘤标志物', '颈动脉超声'], price: 2380, settle: 1880, upsell: ['risk-report', 'fast'], on: true },
    { id: 'cp3', name: '女性专项', audience: '女性职工', items: ['基础项', '乳腺超声', 'HPV + TCT', '妇科超声'], price: 1580, settle: 1240, upsell: ['risk-report'], on: true },
    { id: 'cp4', name: '企业家深度', audience: '高管 / 企业家', items: ['深度筛查', '头颅 MRI', '冠脉 CT', 'PET-CT 可选'], price: 8800, settle: 7200, upsell: ['fast', 'vip'], on: true }
  ];
  S.checkFlow = [
    { id: 'cf1', name: '检前', items: ['风险问卷', '套餐推荐', '预约排期'], svc: '' },
    { id: 'cf2', name: '检中', items: ['到院体检', '异常即时提示'], svc: '' },
    { id: 'cf3', name: '检后 7 天', items: ['报告解读（深度解读服务）', '异常项分级'], svc: 'risk-report' },
    { id: 'cf4', name: '检后 30 天', items: ['复查提醒', '专科转诊 / 就医快通'], svc: 'fast' },
    { id: 'cf5', name: '检后 90 天', items: ['干预方案（五高一重共管）'], svc: 'fivehigh' }
  ];

  /* ------------------------------------------------------ 推荐规则中心 */
  S.recoRules = [
    { id: 'rc1', dim: 'eat', name: '减重人群推荐食谱 + 减重营', when: 'BMI ≥ 28', target: '食谱 r1/r2 + 减重训练营', type: '内容 + 服务', slot: '首页卡片', priority: 1, on: true, exp: 12400, ctr: '6.8%' },
    { id: 'rc2', dim: 'sleep', name: '睡眠差推荐监测', when: 'ISI ≥ 15', target: '多导睡眠监测', type: '服务', slot: '睡眠页底部', priority: 1, on: true, exp: 3200, ctr: '9.1%' },
    { id: 'rc3', dim: 'move', name: '久坐推荐 10 分钟计划', when: '日均步数 < 4000', target: '久坐修复计划', type: '内容', slot: '运动页推荐', priority: 2, on: true, exp: 8600, ctr: '11.2%' },
    { id: 'rc4', dim: 'mind', name: '高压推荐 EAP', when: 'PSS-10 ≥ 27', target: 'EAP 心理咨询', type: '服务', slot: '心好页卡片', priority: 1, on: true, exp: 1800, ctr: '4.6%' },
    { id: 'rc5', dim: 'check', name: '体检异常推荐解读', when: '报告存在异常项', target: '深度报告解读', type: '服务', slot: '报告页弹层', priority: 1, on: true, exp: 5400, ctr: '12.4%' },
    { id: 'rc6', dim: 'check', name: '异常复查推荐快通', when: '异常项 ≥ 2 且未复查', target: '职工就医快通', type: '服务', slot: '检后 30 天', priority: 2, on: false, exp: 0, ctr: '—' }
  ];
})();
