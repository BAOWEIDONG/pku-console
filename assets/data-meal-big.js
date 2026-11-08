/* 扩充食谱库：食材 72 / 菜品 114 / 餐次模板 28 / 全天食谱 18 / 补剂 18 */
(function () {
  'use strict';
  const S = window.SEED;
  let s = 991;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const pick = (a) => a[Math.floor(r() * a.length)];

  const ing = [
    ['鸡腿肉', '蛋白', 181, 19, 0, 11, ['高蛋白'], []], ['牛里脊', '蛋白', 143, 22, 0, 6, ['高铁'], []],
    ['虾仁', '蛋白', 93, 18, 1, 1, ['高蛋白', '低脂'], ['海鲜']], ['鸡蛋', '蛋白', 144, 13, 1, 10, ['优质蛋白'], ['蛋']],
    ['猪里脊', '蛋白', 155, 20, 1, 7, ['高蛋白'], []], ['鳕鱼', '蛋白', 88, 20, 0, 1, ['低脂'], ['海鲜']],
    ['鹰嘴豆', '蛋白', 364, 19, 61, 6, ['植物蛋白'], []], ['毛豆', '蛋白', 131, 13, 10, 5, ['植物蛋白'], ['大豆']],
    ['红薯', '主食', 86, 1.6, 20, 0.1, ['低GI', '高纤维'], []], ['玉米', '主食', 96, 3.4, 21, 1.5, ['高纤维'], []],
    ['全麦意面', '主食', 348, 13, 71, 2, ['低GI'], ['麸质']], ['小米', '主食', 361, 9, 75, 3, ['养胃'], []],
    ['荞麦面', '主食', 340, 12, 71, 2, ['低GI'], ['麸质']], ['山药', '主食', 57, 1.9, 12, 0.2, ['养胃'], []],
    ['芦笋', '蔬菜', 22, 2.2, 4, 0.1, ['高纤维'], []], ['彩椒', '蔬菜', 26, 1, 6, 0.2, ['高维C'], []],
    ['生菜', '蔬菜', 15, 1.4, 2, 0.2, ['低热量'], []], ['紫甘蓝', '蔬菜', 25, 1.4, 6, 0.1, ['抗氧化'], []],
    ['番茄', '蔬菜', 18, 0.9, 4, 0.2, ['番茄红素'], []], ['黄瓜', '蔬菜', 16, 0.7, 4, 0.1, ['低热量'], []],
    ['香菇', '蔬菜', 26, 2.2, 5, 0.3, ['膳食纤维'], []], ['金针菇', '蔬菜', 32, 2.4, 6, 0.4, ['膳食纤维'], []],
    ['胡萝卜', '蔬菜', 41, 0.9, 10, 0.2, ['β-胡萝卜素'], []], ['南瓜', '蔬菜', 26, 1, 7, 0.1, ['低GI'], []],
    ['苹果', '水果', 52, 0.3, 14, 0.2, ['果胶'], []], ['橙子', '水果', 47, 0.9, 12, 0.1, ['维C'], []],
    ['猕猴桃', '水果', 61, 1.1, 15, 0.5, ['维C'], []], ['香蕉', '水果', 89, 1.1, 23, 0.3, ['钾'], []],
    ['草莓', '水果', 32, 0.7, 8, 0.3, ['抗氧化'], []], ['圣女果', '水果', 22, 0.9, 5, 0.2, ['低热量'], []],
    ['低脂牛奶', '乳制品', 42, 3.4, 5, 1, ['钙'], ['乳']], ['无糖豆浆', '乳制品', 31, 3, 1, 1.6, ['植物蛋白'], ['大豆']],
    ['奶酪', '乳制品', 328, 25, 3, 24, ['高钙'], ['乳']], ['核桃', '坚果', 654, 15, 14, 65, ['Omega-3'], ['坚果']],
    ['杏仁', '坚果', 579, 21, 22, 50, ['维E'], ['坚果']], ['亚麻籽', '油脂', 534, 18, 29, 42, ['Omega-3'], []],
    ['黑胡椒', '调味', 251, 10, 64, 3, ['调味'], []], ['生抽', '调味', 63, 6, 8, 0.1, ['调味'], ['大豆']]
  ];
  ing.forEach((x, i) => S.ingredients.push({ id: 'i' + (13 + i), name: x[0], cat: x[1], kcal: x[2], p: x[3], c: x[4], f: x[5], unit: '100g', tags: x[6], allerg: x[7], price: +(2 + r() * 12).toFixed(1) }));

  const protein = ['i1', 'i2', 'i3', 'i13', 'i14', 'i15', 'i16', 'i17', 'i18', 'i19', 'i20'];
  const carb = ['i4', 'i5', 'i21', 'i22', 'i23', 'i24', 'i25', 'i26'];
  const veg = ['i6', 'i7', 'i27', 'i28', 'i29', 'i30', 'i31', 'i32', 'i33', 'i34', 'i35', 'i36'];
  const fruit = ['i8', 'i9', 'i37', 'i38', 'i39', 'i40', 'i41', 'i42'];
  const cook = ['清蒸', '香煎', '白灼', '蒜蓉', '清炒', '烤', '炖', '凉拌'];
  const base = S.dishes.length;
  let n = 0;
  for (let i = 0; i < 46; i++) {
    const p = pick(protein), v = pick(veg), c = pick(carb);
    const name = pick(cook) + (S.ingredients.find((x) => x.id === p) || {}).name;
    const kc = 80 + Math.round(r() * 260), pr = 8 + Math.round(r() * 26), cb = 5 + Math.round(r() * 45), ft = 2 + Math.round(r() * 14);
    S.dishes.push({ id: 'd' + (base + 1 + n), name: name, meal: i % 3 === 0 ? ['午餐', '晚餐'] : ['午餐', '晚餐'], slot: '蛋白', ing: [[p, 120], [v, 100], [c, 60]], kcal: kc, p: pr, c: cb, f: ft, tags: [i % 2 ? '高蛋白' : '低脂', i % 5 === 0 ? '快手' : '家常'], allerg: [], on: true }); n++;
  }
  for (let i = 0; i < 24; i++) {
    const v1 = pick(veg), v2 = pick(veg);
    S.dishes.push({ id: 'd' + (base + 1 + n), name: pick(cook) + (S.ingredients.find((x) => x.id === v1) || {}).name + '拼' + (S.ingredients.find((x) => x.id === v2) || {}).name, meal: ['午餐', '晚餐'], slot: '蔬菜', ing: [[v1, 120], [v2, 100]], kcal: 60 + Math.round(r() * 70), p: 3 + Math.round(r() * 6), c: 6 + Math.round(r() * 12), f: 2 + Math.round(r() * 6), tags: ['高纤维'], allerg: [], on: true }); n++;
  }
  for (let i = 0; i < 18; i++) {
    const f = pick(fruit), c = pick(['i10', 'i43', 'i44']);
    S.dishes.push({ id: 'd' + (base + 1 + n), name: (S.ingredients.find((x) => x.id === f) || {}).name + '酸奶杯', meal: ['早餐', '加餐'], slot: '乳品', ing: [[f, 80], [c, 120]], kcal: 110 + Math.round(r() * 90), p: 6 + Math.round(r() * 10), c: 14 + Math.round(r() * 16), f: 1 + Math.round(r() * 5), tags: ['高蛋白', '益生菌'], allerg: ['乳'], on: true }); n++;
  }
  for (let i = 0; i < 12; i++) {
    const c = pick(carb);
    S.dishes.push({ id: 'd' + (base + 1 + n), name: (S.ingredients.find((x) => x.id === c) || {}).name + pick(['饭', '粥', '面', '饼']), meal: ['早餐', '午餐', '晚餐'], slot: '主食', ing: [[c, 80]], kcal: 130 + Math.round(r() * 160), p: 3 + Math.round(r() * 8), c: 26 + Math.round(r() * 30), f: 1 + Math.round(r() * 5), tags: ['低GI'], allerg: [], on: true }); n++;
  }

  const tb = S.mealTemplates.length;
  const meals = ['早餐', '午餐', '晚餐', '加餐'];
  for (let i = 0; i < 24; i++) {
    const m = meals[i % 4];
    const ds = S.dishes.filter((d) => d.meal.indexOf(m) >= 0).slice(0, 3 + (i % 2));
    const sum = ds.reduce((a, d) => ({ kcal: a.kcal + d.kcal, p: a.p + d.p, c: a.c + d.c, f: a.f + d.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    S.mealTemplates.push({ id: 'mt' + (tb + 1 + i), name: pick(['轻食', '家常', '高蛋白', '低GI', '暖胃', '快手']) + m, meal: m, dishes: ds.map((d) => d.id), kcal: sum.kcal, p: sum.p, c: sum.c, f: sum.f, tags: ['组合'], on: true, used: Math.round(r() * 900) });
  }

  const db = S.dayPlans.length;
  const aud = ['普通职工', 'BMI ≥ 28', '血糖偏高', '孕期哺乳', '银发人群', '高管高压'];
  for (let i = 0; i < 15; i++) {
    const pickTpl = (m) => (S.mealTemplates.filter((t) => t.meal === m)[i % S.mealTemplates.filter((t) => t.meal === m).length] || {}).id;
    S.dayPlans.push({
      id: 'dp' + (db + 1 + i), name: pick(['轻盈', '控糖', '高蛋白', '地中海', '中式均衡', '低嘌呤']) + ' ' + (1400 + (i % 6) * 100) + 'kcal',
      audience: aud[i % aud.length], kcal: 1400 + (i % 6) * 100, p: 95 + Math.round(r() * 45), c: 130 + Math.round(r() * 80), f: 40 + Math.round(r() * 25),
      meals: { 早餐: pickTpl('早餐'), 午餐: pickTpl('午餐'), 晚餐: pickTpl('晚餐'), 加餐: pickTpl('加餐') },
      tags: [i % 2 ? '低GI' : '均衡'], on: true, used: Math.round(r() * 600), owner: i % 2 ? '王雪' : '张楠'
    });
  }

  const sb = S.supplements.length;
  [['维生素 C 泡腾片', '基础营养', 98, 76, 42, '蔬果摄入不足', [], 'annual-exam'],
   ['铁 + 叶酸', '女性营养', 138, 110, 58, '备孕 / 孕期 / 经期量大', ['血色病'], 'fivehigh'],
   ['辅酶 Q10', '心血管', 268, 214, 128, '40 岁以上 / 服用他汀', ['服用抗凝药'], 'heart'],
   ['褪黑素 3mg', '睡眠', 118, 94, 46, '倒时差 / 入睡困难', ['孕期', '青少年'], 'sleep'],
   ['镁 + B6', '睡眠', 128, 102, 52, '压力大 / 肌肉紧张', ['肾功能不全'], 'eap'],
   ['乳清蛋白（分离）', '蛋白补充', 428, 342, 226, '乳糖不耐 / 增肌', ['肾病'], 'weight'],
   ['鱼油（高纯度）', '心血管', 398, 318, 208, '甘油三酯偏高', ['抗凝药'], 'fivehigh'],
   ['益生菌（双歧）', '肠道', 258, 206, 122, '便秘 / 腹胀', [], 'lecture'],
   ['复合矿物质', '基础营养', 158, 126, 68, '运动出汗多', [], 'cpet'],
   ['维生素 D3 2000IU', '骨骼', 88, 70, 34, '室内工作 / 少晒太阳', ['高钙血症'], 'cpet'],
   ['膳食纤维（菊粉）', '肠道', 118, 94, 48, '蔬菜吃得少', ['肠易激急性期'], 'fivehigh'],
   ['蛋白棒（12 支）', '加餐替代', 198, 158, 92, '加班错过正餐', ['坚果过敏'], 'weight']
  ].forEach((x, i) => S.supplements.push({ id: 'su' + (sb + 1 + i), name: x[0], cat: x[1], price: x[2], settle: x[3], cost: x[4], stock: 40 + Math.round(r() * 200), on: i !== 4, fit: x[5], avoid: x[6], sold: Math.round(r() * 700), svc: x[7], attach: i % 3 === 0 ? ['day'] : ['meal', 'planner'] }));

  S.recoEngine.segments.forEach((g) => { g.size = Math.round(28 + r() * 160); });
})();
