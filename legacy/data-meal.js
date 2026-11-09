/* ============================================================================
   食谱工程：食材 → 菜品 → 餐次模板 → 全天食谱 → 补剂
   推荐引擎：人群分层 × 特征权重 × 多维打分
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SEED;

  /* ------------------------------------------------------------- 食材库 */
  S.ingredients = [
    { id: 'i1', name: '鸡胸肉', cat: '蛋白', kcal: 133, p: 24, c: 0, f: 3, unit: '100g', tags: ['高蛋白', '低脂'], allerg: [], price: 3.2 },
    { id: 'i2', name: '三文鱼', cat: '蛋白', kcal: 208, p: 20, c: 0, f: 13, unit: '100g', tags: ['优质脂肪', 'Omega-3'], allerg: ['海鲜'], price: 12.8 },
    { id: 'i3', name: '北豆腐', cat: '蛋白', kcal: 116, p: 12, c: 3, f: 7, unit: '100g', tags: ['植物蛋白', '软食'], allerg: ['大豆'], price: 2.1 },
    { id: 'i4', name: '糙米', cat: '主食', kcal: 348, p: 7, c: 75, f: 3, unit: '100g', tags: ['低GI', '高纤维'], allerg: [], price: 2.4 },
    { id: 'i5', name: '藜麦', cat: '主食', kcal: 368, p: 14, c: 64, f: 6, unit: '100g', tags: ['低GI', '高蛋白'], allerg: [], price: 6.5 },
    { id: 'i6', name: '西兰花', cat: '蔬菜', kcal: 34, p: 2.8, c: 7, f: 0.4, unit: '100g', tags: ['高纤维', '高维C'], allerg: [], price: 2.8 },
    { id: 'i7', name: '菠菜', cat: '蔬菜', kcal: 23, p: 2.9, c: 3.6, f: 0.4, unit: '100g', tags: ['叶酸', '铁'], allerg: [], price: 2.2 },
    { id: 'i8', name: '牛油果', cat: '水果', kcal: 160, p: 2, c: 9, f: 15, unit: '100g', tags: ['优质脂肪'], allerg: [], price: 5.6 },
    { id: 'i9', name: '蓝莓', cat: '水果', kcal: 57, p: 0.7, c: 14, f: 0.3, unit: '100g', tags: ['抗氧化'], allerg: [], price: 8.9 },
    { id: 'i10', name: '无糖希腊酸奶', cat: '乳制品', kcal: 59, p: 10, c: 3.6, f: 0.4, unit: '100g', tags: ['高蛋白', '益生菌'], allerg: ['乳'], price: 4.5 },
    { id: 'i11', name: '燕麦片', cat: '主食', kcal: 377, p: 15, c: 66, f: 7, unit: '100g', tags: ['β-葡聚糖', '饱腹'], allerg: ['麸质'], price: 1.8 },
    { id: 'i12', name: '橄榄油', cat: '油脂', kcal: 899, p: 0, c: 0, f: 100, unit: '100g', tags: ['单不饱和'], allerg: [], price: 9.0 }
  ];

  /* ------------------------------------------------------------- 菜品库 */
  S.dishes = [
    { id: 'd1', name: '香煎鸡胸', meal: ['午餐', '晚餐'], slot: '蛋白', ing: [['i1', 120], ['i12', 5]], kcal: 205, p: 29, c: 0, f: 8, tags: ['高蛋白', '低脂'], allerg: [], on: true },
    { id: 'd2', name: '清蒸三文鱼', meal: ['午餐', '晚餐'], slot: '蛋白', ing: [['i2', 120]], kcal: 250, p: 24, c: 0, f: 16, tags: ['Omega-3'], allerg: ['海鲜'], on: true },
    { id: 'd3', name: '家常豆腐', meal: ['午餐', '晚餐'], slot: '蛋白', ing: [['i3', 150], ['i12', 4]], kcal: 210, p: 18, c: 5, f: 13, tags: ['植物蛋白', '软食'], allerg: ['大豆'], on: true },
    { id: 'd4', name: '藜麦糙米饭', meal: ['早餐', '午餐', '晚餐'], slot: '主食', ing: [['i4', 60], ['i5', 30]], kcal: 300, p: 12, c: 60, f: 4, tags: ['低GI', '高纤维'], allerg: [], on: true },
    { id: 'd5', name: '全麦吐司', meal: ['早餐'], slot: '主食', ing: [['i11', 40]], kcal: 150, p: 6, c: 26, f: 3, tags: ['快手'], allerg: ['麸质'], on: true },
    { id: 'd6', name: '蒜蓉西兰花', meal: ['午餐', '晚餐'], slot: '蔬菜', ing: [['i6', 150], ['i12', 3]], kcal: 70, p: 4, c: 10, f: 3, tags: ['高纤维'], allerg: [], on: true },
    { id: 'd7', name: '麻油菠菜', meal: ['午餐', '晚餐'], slot: '蔬菜', ing: [['i7', 120], ['i12', 3]], kcal: 55, p: 4, c: 5, f: 3, tags: ['叶酸', '铁'], allerg: [], on: true },
    { id: 'd8', name: '牛油果沙拉', meal: ['早餐', '加餐'], slot: '蔬果', ing: [['i8', 60], ['i6', 60]], kcal: 150, p: 3, c: 10, f: 11, tags: ['优质脂肪'], allerg: [], on: true },
    { id: 'd9', name: '希腊酸奶碗', meal: ['早餐', '加餐'], slot: '乳品', ing: [['i10', 150], ['i9', 40]], kcal: 145, p: 16, c: 12, f: 1, tags: ['高蛋白', '益生菌'], allerg: ['乳'], on: true },
    { id: 'd10', name: '燕麦牛奶粥', meal: ['早餐'], slot: '主食', ing: [['i11', 50], ['i10', 100]], kcal: 220, p: 12, c: 38, f: 5, tags: ['饱腹', '快手'], allerg: ['麸质', '乳'], on: true },
    { id: 'd11', name: '水煮蛋', meal: ['早餐', '加餐'], slot: '蛋白', ing: [['i1', 50]], kcal: 78, p: 6, c: 1, f: 5, tags: ['快手'], allerg: ['蛋'], on: true },
    { id: 'd12', name: '坚果小把', meal: ['加餐'], slot: '加餐', ing: [['i8', 20], ['i9', 10]], kcal: 130, p: 3, c: 8, f: 11, tags: ['优质脂肪'], allerg: ['坚果'], on: true },
    { id: 'd13', name: '清炒时蔬', meal: ['午餐', '晚餐'], slot: '蔬菜', ing: [['i6', 100], ['i7', 80]], kcal: 60, p: 4, c: 9, f: 2, tags: ['高纤维'], allerg: [], on: true },
    { id: 'd14', name: '低脂牛肉丸汤', meal: ['午餐', '晚餐'], slot: '汤', ing: [['i1', 80], ['i7', 40]], kcal: 120, p: 16, c: 3, f: 4, tags: ['高蛋白', '暖胃'], allerg: [], on: true }
  ];

  /* ---------------------------------------------------------- 餐次模板 */
  S.mealTemplates = [
    { id: 'mt1', name: '标准早餐', meal: '早餐', dishes: ['d10', 'd11', 'd9'], kcal: 443, p: 34, c: 51, f: 11, tags: ['均衡'], on: true, used: 1840 },
    { id: 'mt2', name: '减脂午餐', meal: '午餐', dishes: ['d1', 'd4', 'd6', 'd14'], kcal: 625, p: 51, c: 65, f: 19, tags: ['低脂', '高蛋白'], on: true, used: 1260 },
    { id: 'mt3', name: '清淡晚餐', meal: '晚餐', dishes: ['d2', 'd4', 'd7'], kcal: 605, p: 40, c: 65, f: 23, tags: ['控糖'], on: true, used: 980 },
    { id: 'mt4', name: '高蛋白加餐', meal: '加餐', dishes: ['d9', 'd12'], kcal: 275, p: 19, c: 20, f: 12, tags: ['高蛋白'], on: true, used: 1560 }
  ];

  /* ---------------------------------------------------------- 全天食谱 */
  S.dayPlans = [
    { id: 'dp1', name: '标准均衡 1800kcal', audience: '普通职工', kcal: 1800, p: 128, c: 196, f: 58, meals: { 早餐: 'mt1', 午餐: 'mt2', 晚餐: 'mt3', 加餐: 'mt4' }, tags: ['均衡'], on: true, used: 1240, owner: '王雪' },
    { id: 'dp2', name: '控糖 1600kcal', audience: '血糖偏高', kcal: 1600, p: 120, c: 150, f: 55, meals: { 早餐: 'mt1', 午餐: 'mt2', 晚餐: 'mt3', 加餐: 'mt4' }, tags: ['低GI', '控糖'], on: true, used: 610, owner: '张楠' },
    { id: 'dp3', name: '减脂 1500kcal', audience: 'BMI ≥ 28', kcal: 1500, p: 135, c: 130, f: 45, meals: { 早餐: 'mt1', 午餐: 'mt2', 晚餐: 'mt3', 加餐: 'mt4' }, tags: ['高蛋白', '低脂'], on: true, used: 980, owner: '王雪' }
  ];

  /* ------------------------------------------------------------- 补剂 */
  S.supplements = [
    { id: 'su1', name: '乳清蛋白粉 750g', cat: '蛋白补充', price: 328, settle: 260, cost: 168, stock: 120, on: true, fit: '力量训练 / 蛋白摄入不足', avoid: ['乳糖不耐', '肾功能不全'], sold: 428, svc: 'weight' },
    { id: 'su2', name: '复合维生素（30 天）', cat: '基础营养', price: 168, settle: 132, cost: 82, stock: 240, on: true, fit: '饮食不规律', avoid: [], sold: 1260, svc: 'annual-exam' },
    { id: 'su3', name: '深海鱼油 90 粒', cat: '心血管', price: 268, settle: 210, cost: 132, stock: 86, on: true, fit: '血脂偏高 / 久坐', avoid: ['服用抗凝药'], sold: 742, svc: 'fivehigh' },
    { id: 'su4', name: '益生菌 30 条', cat: '肠道', price: 228, settle: 180, cost: 118, stock: 0, on: false, fit: '腹胀 / 抗生素后', avoid: [], sold: 316, svc: 'lecture' },
    { id: 'su5', name: '钙 + 维生素 D3', cat: '骨骼', price: 158, settle: 126, cost: 76, stock: 310, on: true, fit: '45 岁以上 / 少晒太阳', avoid: ['高钙血症'], sold: 590, svc: 'cpet' },
    { id: 'su6', name: '膳食纤维粉', cat: '肠道', price: 138, settle: 110, cost: 62, stock: 180, on: true, fit: '蔬果摄入不足', avoid: [], sold: 880, svc: 'fivehigh' }
  ];

  S.myMeals = [];

  /* ------------------------------------------------------ 推荐引擎模型 */
  S.recoEngine = {
    features: [
      { key: 'risk', name: '健康风险', weight: 32, desc: 'BMI / 血糖 / 血压 / 体检异常' },
      { key: 'habit', name: '行为依从', weight: 24, desc: '打卡率、运动频率、执行率' },
      { key: 'prefer', name: '个人偏好', weight: 18, desc: '口味、作息、素食、预算' },
      { key: 'scene', name: '场景时机', weight: 16, desc: '体检后、加班、季节、节点' },
      { key: 'biz', name: '商业价值', weight: 10, desc: '毛利、库存、履约能力' }
    ],
    segments: [
      { id: 'sg1', name: '新会员', size: 42, focus: '建立基线', boost: ['体检', '评估问卷'] },
      { id: 'sg2', name: '减重期', size: 168, focus: '食谱 + 训练营', boost: ['减重训练营', '食谱'] },
      { id: 'sg3', name: '五高人群', size: 96, focus: '指标干预', boost: ['五高一重共管', '鱼油'] },
      { id: 'sg4', name: '孕期哺乳', size: 14, focus: '营养安全', boost: ['营养咨询', '钙维D'] },
      { id: 'sg5', name: '银发人群', size: 61, focus: '筛查与康复', boost: ['深度体检', '康复'] },
      { id: 'sg6', name: '高管高压', size: 28, focus: '睡眠与心理', boost: ['睡眠监测', 'EAP'] }
    ],
    rules: [
      { id: 'rr1', seg: 'sg2', name: '减重食谱 + 训练营', score: 68, when: 'BMI ≥ 28 且近 7 天饮食打卡 ≥ 3', excl: '孕期 / 进食障碍', target: '减脂 1500kcal + 减重营', type: '内容 + 服务', slot: '首页卡片', freq: '每周 2 次', priority: 1, on: true, exp: 12400, ctr: '8.6%', cvr: '4.1%' },
      { id: 'rr2', seg: 'sg3', name: '血糖异常 → 共管 + 鱼油', score: 72, when: '空腹血糖 ≥ 6.1 或糖化 ≥ 6.0', excl: '服用抗凝药（排除鱼油）', target: '五高一重共管 + 深海鱼油', type: '服务 + 商品', slot: '指标页', freq: '每周 1 次', priority: 1, on: true, exp: 5400, ctr: '11.2%', cvr: '6.8%' },
      { id: 'rr3', seg: 'sg6', name: '睡眠差 → 监测 + EAP', score: 65, when: 'ISI ≥ 15 或连续 5 天情绪低', excl: '已预约 EAP 30 天内', target: '多导睡眠监测 + EAP', type: '服务', slot: '睡眠页', freq: '每 2 周 1 次', priority: 1, on: true, exp: 1800, ctr: '9.4%', cvr: '5.2%' },
      { id: 'rr4', seg: 'sg1', name: '新会员 → 体检 + 评估', score: 55, when: '入组 30 天内且未体检', excl: '无', target: '职工年度体检 + 五好评估', type: '服务', slot: '新人引导', freq: '仅 1 次', priority: 2, on: true, exp: 3200, ctr: '13.8%', cvr: '9.1%' },
      { id: 'rr5', seg: 'sg4', name: '孕期 → 营养咨询 + 钙维D', score: 60, when: '档案标记孕期/哺乳', excl: '含酒精/高汞鱼类', target: '营养师 1v1 + 钙维D', type: '服务 + 商品', slot: '营养页', freq: '每周 1 次', priority: 1, on: true, exp: 620, ctr: '16.2%', cvr: '7.4%' },
      { id: 'rr6', seg: 'sg5', name: '银发 → 深度筛查 + 康复', score: 58, when: '年龄 ≥ 60 且两年未做胃肠镜', excl: '严重心肺禁忌', target: '深度筛查 + 康复评估', type: '服务', slot: '体检页', freq: '每季 1 次', priority: 2, on: true, exp: 2100, ctr: '10.6%', cvr: '6.1%' },
      { id: 'rr7', seg: 'sg2', name: '蛋白摄入不足 → 蛋白粉', score: 48, when: '连续 7 天蛋白 < 1.0g/kg', excl: '肾功能不全', target: '乳清蛋白粉', type: '商品', slot: '食谱页加购', freq: '每周 1 次', priority: 3, on: true, exp: 4600, ctr: '7.2%', cvr: '3.4%' },
      { id: 'rr8', seg: 'sg5', name: '久坐低步数 → 关节友好计划', score: 45, when: '日均步数 < 4000', excl: '关节急性疼痛', target: '久坐修复 10 分钟', type: '内容', slot: '运动页', freq: '每周 2 次', priority: 3, on: false, exp: 0, ctr: '—', cvr: '—' }
    ]
  };
})();
