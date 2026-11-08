/* 预约配置（号源/人群/性别/年龄/前置条件）与商品规格 */
(function () {
  'use strict';
  const S = window.SEED;

  S.bookingRules = S.bookingRules || {};
  const R = {
    'annual-exam': { resource: '医师 + 设备', ageMin: 18, ageMax: 75, gender: 'any', audience: ['在职职工'], preSurvey: false, slotsPerDay: 12, needFast: true, needReport: true, note: '需空腹 8 小时' },
    'gastro': { resource: '内镜设备 + 麻醉', ageMin: 40, ageMax: 70, gender: 'any', audience: ['高危人群'], preSurvey: true, slotsPerDay: 6, needFast: true, needReport: true, note: '需家属陪同，停抗凝药' },
    'inpatient': { resource: '床位', ageMin: 25, ageMax: 70, gender: 'any', audience: ['高管', '企业家'], preSurvey: false, slotsPerDay: 3, needFast: true, needReport: true, note: '2 天 1 晚' },
    'cancer': { resource: '医师 + 设备', ageMin: 45, ageMax: 75, gender: 'any', audience: ['吸烟史', '家族史'], preSurvey: true, slotsPerDay: 8, needFast: false, needReport: true, note: '按癌种定制' },
    'sleep': { resource: '睡眠监测床位', ageMin: 18, ageMax: 70, gender: 'any', audience: ['打鼾', '失眠'], preSurvey: true, slotsPerDay: 2, needFast: false, needReport: true, note: '住一晚' },
    'fivehigh': { resource: '健康管理师', ageMin: 18, ageMax: 75, gender: 'any', audience: ['五高人群'], preSurvey: true, slotsPerDay: 16, needFast: false, needReport: true, note: '12 周管理' },
    'eap': { resource: '心理咨询师', ageMin: 18, ageMax: 70, gender: 'any', audience: ['全员'], preSurvey: false, slotsPerDay: 8, needFast: false, needReport: false, note: '隐私保护，不记录内容' },
    'firstaid': { resource: '培训师 + 场地', ageMin: 18, ageMax: 60, gender: 'any', audience: ['企业团体'], preSurvey: false, slotsPerDay: 2, needFast: false, needReport: false, note: '10 人起' },
    'cpet': { resource: '心肺设备', ageMin: 18, ageMax: 65, gender: 'any', audience: ['运动高风险'], preSurvey: true, slotsPerDay: 4, needFast: false, needReport: true, note: '运动前评估' },
    'tcm': { resource: '中医师', ageMin: 18, ageMax: 80, gender: 'any', audience: ['康复需求'], preSurvey: false, slotsPerDay: 10, needFast: false, needReport: false, note: '疗程制' },
    'weight': { resource: '营养师', ageMin: 18, ageMax: 65, gender: 'any', audience: ['BMI ≥ 24'], preSurvey: true, slotsPerDay: 20, needFast: false, needReport: true, note: '28 天营期' },
    'vip': { resource: '专属管家', ageMin: 30, ageMax: 75, gender: 'any', audience: ['企业家', '高管'], preSurvey: false, slotsPerDay: 2, needFast: true, needReport: true, note: '年度服务' }
  };
  Object.assign(S.bookingRules, R);

  S.employee.services.forEach(function (s) {
    s.booking = S.bookingRules[s.id] || { resource: '通用', ageMin: 18, ageMax: 75, gender: 'any', audience: ['全员'], preSurvey: false, slotsPerDay: 10, needFast: false, needReport: false, note: '' };
    s.genderText = { any: '不限', male: '仅男性', female: '仅女性' }[s.booking.gender];
    s.introBlocks = [
      { key: 'suitable', title: '适合谁', body: s.intro },
      { key: 'includes', title: '包含什么', body: '按项目清单执行，异常项自动分级' },
      { key: 'notice', title: '注意事项', body: s.booking.note || '按预约须知执行' }
    ];
  });

  /* 商品：规格 / 效期 / 储存 / 批准文号 / 禁忌 */
  const SPEC = {
    su1: [{ name: '750g 罐装', price: 328, stock: 80 }, { name: '1.5kg 袋装', price: 598, stock: 40 }],
    su2: [{ name: '30 天装', price: 168, stock: 160 }, { name: '90 天装', price: 448, stock: 80 }],
    su3: [{ name: '90 粒', price: 268, stock: 60 }, { name: '180 粒', price: 498, stock: 26 }],
    su5: [{ name: '60 片', price: 158, stock: 210 }, { name: '120 片', price: 288, stock: 100 }],
    su6: [{ name: '30 条', price: 138, stock: 120 }, { name: '60 条', price: 248, stock: 60 }]
  };
  S.supplements.forEach(function (g, i) {
    g.specs = SPEC[g.id] || [{ name: '标准装', price: g.price, stock: g.stock }];
    g.shelfLife = g.cat === '实物' ? '36 个月' : (i % 2 ? '24 个月' : '18 个月');
    g.storage = g.cat === '睡眠' ? '避光常温，≤25℃' : '常温干燥，避免高温';
    g.regNo = g.cat === '基础营养' ? '国食健注 G2026' + (1000 + i) : '—';
    g.spec = g.specs[0].name;
    g.audienceLimit = g.cat === '女性营养' ? '仅女性' : '不限';
    g.ageLimit = '18 岁以上';
  });
})();
