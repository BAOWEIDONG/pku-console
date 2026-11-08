/* ============================================================================
   种子数据 · 三端运营中台
   versionall（减重营）/ PKU-introduce（品牌站）/ pku-employee-health（职工健康）
   所有数据均可被后台编辑；编辑后进入变更队列，可预览 / 发布。
   ========================================================================== */
(function () {
  'use strict';

  /* deterministic pseudo random so demo data is stable */
  let _s = 20261106;
  function rnd() { _s = (_s * 1103515245 + 12345) % 2147483648; return _s / 2147483648; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function day(offset) {
    const d = new Date(2026, 10, 6 + offset);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function dt(offset, h, m) { return day(offset) + ' ' + pad(h) + ':' + pad(m) + ':00'; }

  const AV = ['', 'g', 'a', 'v'];

  /* ---------------------------------------------------------------- camps */
  const camps = [
    { id: 'camp1', code: 'PKU-2026-07', name: '第七期 · 代谢重塑', theme: '28 天代谢重塑计划', start: '2026-10-19', end: '2026-11-15', status: 'active', capacity: 60, host: '北京大学国际医院', location: '北京 · 昌平', enrolled: 48, owner: '孙敏' },
    { id: 'camp2', code: 'PKU-2026-08', name: '第八期 · 轻盈启程', theme: '28 天体重管理计划', start: '2026-12-01', end: '2026-12-28', status: 'upcoming', capacity: 60, host: '北京大学国际医院', start_open: true, enrolled: 23, owner: '孙敏' },
    { id: 'camp3', code: 'PKU-2026-06', name: '第六期 · 五高共管', theme: '28 天慢病风险干预', start: '2026-09-07', end: '2026-10-04', status: 'ended', capacity: 50, host: '北京大学国际医院', location: '北京 · 昌平', enrolled: 46, owner: '周琳' },
    { id: 'camp4', code: 'PKU-2026-09', name: '第九期 · 企业专场', theme: '企业员工减重专项', start: '2027-01-05', end: '2027-02-01', status: 'draft', capacity: 40, host: '北大医疗互联网医院', location: '线上', enrolled: 0, owner: '孙敏' }
  ];

  /* ------------------------------------------------------------- accounts */
  const people = [
    ['s1', '林悦', 'female', 32, '138****6621', 'student'], ['s2', '陈嘉禾', 'male', 38, '139****2087', 'student'],
    ['s3', '周雯', 'female', 29, '137****5540', 'student'], ['s4', '徐一鸣', 'male', 41, '186****7732', 'student'],
    ['s5', '何雨桐', 'female', 35, '135****9918', 'student'], ['s6', '赵启明', 'male', 46, '188****3341', 'student'],
    ['s7', '吴倩', 'female', 27, '136****8802', 'student'], ['s8', '郑凯', 'male', 33, '150****4476', 'student'],
    ['s9', '孙宁', 'female', 39, '158****6603', 'student'], ['s10', '马骁', 'male', 44, '133****1129', 'student'],
    ['s11', '郭子涵', 'female', 31, '182****7788', 'student'], ['s12', '高远', 'male', 36, '131****5521', 'student'],
    ['s13', '唐婧', 'female', 34, '187****2034', 'student'], ['s14', '冯乐', 'female', 30, '159****6612', 'student']
  ];
  const students = people.map(function (p, i) {
    const startW = i % 2 ? ri(72, 92) : ri(58, 74);
    const lost = +(rnd() * 5.4).toFixed(1);
    return {
      id: p[0], name: p[1], gender: p[2], age: p[3], phone: p[4],
      campIds: i < 12 ? ['camp1'] : (i === 12 ? ['camp1', 'camp2'] : ['camp2']),
      height: i % 2 ? ri(170, 182) : ri(158, 170),
      startWeight: startW,
      weight: +(startW - lost).toFixed(1),
      targetWeight: +(startW - ri(6, 10)).toFixed(1),
      bodyFat: +(rnd() * 9 + 24).toFixed(1),
      status: i === 10 ? 'paused' : (i === 13 ? 'pending' : 'active'),
      risk: i === 5 ? 'high' : (i % 4 === 0 ? 'mid' : 'low'),
      joined: day(-30 + i),
      streak: ri(0, 21),
      completion: ri(46, 98),
      tags: [i === 5 ? '五高' : '', i % 3 === 0 ? '久坐' : '', i % 5 === 0 ? '夜班' : ''].filter(Boolean),
      dietitian: i % 3 === 0 ? '王雪' : (i % 3 === 1 ? '张楠' : '李清'),
      coach: i % 2 ? '刘洋' : '陈放',
      avatar: AV[i % 4],
      note: i === 5 ? '血压偏高，运动强度已下调至 Lv.3' : ''
    };
  });

  const accounts = [
    { id: 'a1', name: '孙敏', phone: '138****0001', role: 'dietitian', campIds: ['camp1', 'camp2'], active: true, supervisor: true, lastLogin: dt(0, 9, 12), createdAt: '2026-03-02 10:00:00' },
    { id: 'a2', name: '王雪', phone: '138****0002', role: 'dietitian', campIds: ['camp1'], active: true, lastLogin: dt(0, 8, 46), createdAt: '2026-04-11 09:20:00' },
    { id: 'a3', name: '张楠', phone: '138****0003', role: 'dietitian', campIds: ['camp1', 'camp2'], active: true, lastLogin: dt(-1, 19, 30), createdAt: '2026-04-11 09:21:00' },
    { id: 'a4', name: '李清', phone: '138****0004', role: 'dietitian', campIds: ['camp2'], active: false, lastLogin: dt(-14, 11, 2), createdAt: '2026-05-06 14:00:00' },
    { id: 'a5', name: '刘洋', phone: '139****0005', role: 'coach', campIds: ['camp1'], active: true, lastLogin: dt(0, 7, 55), createdAt: '2026-04-12 10:30:00' },
    { id: 'a6', name: '陈放', phone: '139****0006', role: 'coach', campIds: ['camp1', 'camp2'], active: true, lastLogin: dt(-1, 20, 12), createdAt: '2026-04-12 10:31:00' },
    { id: 'a7', name: '周琳', phone: '137****0007', role: 'dietitian', campIds: ['camp3'], active: true, supervisor: true, lastLogin: dt(-3, 16, 40), createdAt: '2026-02-18 08:40:00' },
    { id: 'a8', name: '郑越', phone: '137****0008', role: 'coach', campIds: ['camp3'], active: true, lastLogin: dt(-6, 18, 5), createdAt: '2026-02-18 08:42:00' }
  ];
  students.slice(0, 12).forEach(function (s, i) {
    accounts.push({ id: 'acc_' + s.id, name: s.name, phone: s.phone, role: 'student', campIds: s.campIds, active: s.status !== 'paused', lastLogin: dt(-i % 4, 7 + (i % 12), 20), createdAt: s.joined + ' 09:00:00' });
  });

  /* ------------------------------------------------------------- records */
  const weightRecords = [];
  students.filter(function (s) { return s.campIds.indexOf('camp1') >= 0; }).forEach(function (s, si) {
    for (let d = 0; d < 12; d++) {
      const w = +(s.startWeight - (d * (s.startWeight - s.weight) / 11) + (rnd() - .5) * .6).toFixed(1);
      const rec = { id: 'w_' + s.id + '_' + d, studentId: s.id, campId: 'camp1', date: dt(-17 + d * 1.5 | 0, 7, ri(10, 50)), weight: w, photos: d % 3 === 0 ? 1 : 0, commentRead: d < 10 };
      if (d % 3 === 0 && si % 2 === 0) {
        rec.comments = [{ id: 'c' + d, role: 'dietitian', name: s.dietitian, text: d === 0 ? '开营基线已记录，接下来重点看第一周的波动。' : '下降节奏不错，注意蛋白质摄入不要低于每公斤 1.2g。', date: dt(-17 + d, 10, 20) }];
        rec.dietitianComment = rec.comments[0].text;
        rec.dietitianName = s.dietitian;
      }
      weightRecords.push(rec);
    }
  });

  const dietRecords = [];
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  students.filter(function (s) { return s.campIds.indexOf('camp1') >= 0; }).forEach(function (s) {
    for (let d = 0; d < 4; d++) {
      const m = meals[d % 4];
      dietRecords.push({
        id: 'd_' + s.id + '_' + d, studentId: s.id, campId: 'camp1', date: dt(-1 - (d % 2), m === 'breakfast' ? 8 : m === 'lunch' ? 12 : m === 'dinner' ? 18 : 15, ri(0, 55)),
        meal: m, description: m === 'breakfast' ? '全麦吐司 2 片 + 水煮蛋 + 无糖豆浆' : m === 'lunch' ? '糙米饭半碗 + 清蒸鲈鱼 + 西兰花' : m === 'dinner' ? '鸡胸沙拉 + 南瓜汤' : '无糖酸奶 + 蓝莓',
        photos: 1, hasStaple: m === 'lunch', hasProtein: true, hasVegetable: m !== 'snack',
        dietitianScore: d % 3 === 0 ? null : (d % 2 ? 2 : 1),
        comments: d === 0 ? [] : [{ id: 'dc' + d, role: 'dietitian', name: s.dietitian, text: '结构合理，晚餐主食可以再减 1/3。', date: dt(-1, 19, 10) }],
        commentRead: d % 2 === 0
      });
    }
  });

  const exerciseRecords = [];
  const sports = ['快走', '慢跑', '游泳', '力量训练', '骑行', '瑜伽'];
  students.filter(function (s) { return s.campIds.indexOf('camp1') >= 0; }).forEach(function (s) {
    for (let d = 0; d < 3; d++) {
      exerciseRecords.push({
        id: 'e_' + s.id + '_' + d, studentId: s.id, campId: 'camp1', date: dt(-d, 7 + d * 5, ri(0, 50)),
        type: sports[(d + s.name.length) % sports.length], duration: [30, 45, 60][d % 3], intensity: 2 + (d % 4),
        notes: d === 0 ? '晨跑，配速 6 分 30' : '', photos: d === 0 ? 1 : 0, videoUrls: d === 1 ? 1 : 0,
        coachScore: d === 0 ? 2 : (d === 1 ? 1 : null),
        comments: d === 2 ? [{ id: 'ec' + d, role: 'coach', name: s.coach, text: '动作基本到位，注意落地缓冲。', date: dt(-2, 20, 0) }] : [],
        commentRead: d !== 2
      });
    }
  });

  /* ---------------------------------------------------------- rules etc */
  const metrics = [
    { id: 'm1', name: '体重', unit: 'kg', normalRange: '', category: '身体测量', direction: 'down', active: true },
    { id: 'm2', name: '体脂率', unit: '%', normalRange: '18–28', category: '身体测量', direction: 'down', active: true },
    { id: 'm3', name: '腰围', unit: 'cm', normalRange: '男<90 女<85', category: '身体测量', direction: 'down', active: true },
    { id: 'm4', name: '收缩压', unit: 'mmHg', normalRange: '90–139', category: '五高指标', direction: 'down', active: true },
    { id: 'm5', name: '舒张压', unit: 'mmHg', normalRange: '60–89', category: '五高指标', direction: 'down', active: true },
    { id: 'm6', name: '空腹血糖', unit: 'mmol/L', normalRange: '3.9–6.1', category: '五高指标', direction: 'down', active: true },
    { id: 'm7', name: '总胆固醇', unit: 'mmol/L', normalRange: '<5.2', category: '血脂', direction: 'down', active: true },
    { id: 'm8', name: '甘油三酯', unit: 'mmol/L', normalRange: '<1.7', category: '血脂', direction: 'down', active: true },
    { id: 'm9', name: '尿酸', unit: 'μmol/L', normalRange: '男<420 女<360', category: '代谢', direction: 'down', active: true },
    { id: 'm10', name: '内脏脂肪等级', unit: '级', normalRange: '1–9', category: '身体测量', direction: 'down', active: false }
  ];

  const checkin = {
    items: [
      { key: 'weight', name: '体重打卡', desc: '每日 1 次，需上传体重秤照片', on: true, limit: 1, points: 2 },
      { key: 'diet', name: '饮食打卡', desc: '按餐次上传，需勾选餐次结构', on: true, limit: 3, points: 1 },
      { key: 'exercise', name: '运动打卡', desc: '需填写时长与强度，可传视频', on: true, limit: 1, points: 2 }
    ],
    meals: {
      breakfast: { start: '06:00', end: '09:30', on: true },
      lunch: { start: '11:00', end: '13:30', on: true },
      dinner: { start: '17:00', end: '20:00', on: true },
      snack: { start: '14:00', end: '16:00', on: false }
    },
    points: { weight: 2, diet: 1, exercise: 2, allDone: 2, comment: 1, weeklyBonus: 10, dailyCap: 8 },
    lateGrace: 30,
    makeupDays: 2,
    requirePhoto: true
  };

  const activityCfg = {
    checkinStreak: true, weightMilestone: true, weeklyChallenge: true, luckyDraw: false, pointsMall: true,
    weeklyStart: '2026-10-19', weeklyWeeks: 4,
    milestoneSteps: [3, 5, 8],
    luckyDrawScope: 'complete28',
    entranceTitle: '连续打卡 21 天，把奖励带回家',
    entranceDesc: '每日三项打卡全部完成计 1 天，中断即重新计数'
  };

  const tiers = [
    { id: 't1', campId: 'camp1', name: '坚持 7 天 · 运动毛巾', requiredDays: 7, stock: 40, image: '毛巾', delivery: ['shipped', 'in-person'], active: true, sort: 1, desc: '吸汗速干运动毛巾，结营前统一寄出' },
    { id: 't2', campId: 'camp1', name: '坚持 14 天 · 保温杯', requiredDays: 14, stock: 22, image: '保温杯', delivery: ['shipped'], active: true, sort: 2, desc: '500ml 316 不锈钢保温杯' },
    { id: 't3', campId: 'camp1', name: '坚持 21 天 · 体脂秤', requiredDays: 21, stock: 8, image: '体脂秤', delivery: ['shipped'], active: true, sort: 3, desc: '八电极智能体脂秤，连接小程序记录' },
    { id: 't4', campId: 'camp1', name: '全勤 28 天 · 运动手环', requiredDays: 28, stock: 3, image: '手环', delivery: ['shipped', 'in-person'], active: true, sort: 4, desc: '结营全勤专属，限量 3 份' },
    { id: 't5', campId: 'camp2', name: '坚持 7 天 · 定制水壶', requiredDays: 7, stock: 50, image: '水壶', delivery: ['shipped'], active: true, sort: 1, desc: '' },
    { id: 't6', campId: 'camp1', name: '坚持 3 天 · 电子秤贴', requiredDays: 3, stock: 0, image: '贴纸', delivery: ['in-person'], active: false, sort: 9, desc: '已下架，库存清空' }
  ];

  const products = [
    { id: 'p1', campId: 'camp1', name: '运动水杯 600ml', points: 120, stock: 36, active: true, delivery: ['shipped'], max: 1, sort: 1, image: '水杯', desc: 'Tritan 材质，冷热两用' },
    { id: 'p2', campId: 'camp1', name: '低 GI 杂粮礼盒', points: 260, stock: 18, active: true, delivery: ['shipped'], max: 2, sort: 2, image: '杂粮', desc: '6 种谷物，营养师配比' },
    { id: 'p3', campId: 'camp1', name: '营养师 1 对 1 咨询', points: 400, stock: 10, active: true, delivery: ['in-person'], max: 1, sort: 3, image: '咨询', desc: '30 分钟线上视频咨询' },
    { id: 'p4', campId: 'camp1', name: '瑜伽垫（加厚）', points: 320, stock: 0, active: false, delivery: ['shipped'], max: 1, sort: 4, image: '瑜伽垫', desc: '8mm TPE，已售罄下架' },
    { id: 'p5', campId: 'camp1', name: '健康食谱手册', points: 80, stock: 120, active: true, delivery: ['in-person'], max: 0, sort: 5, image: '手册', desc: '28 天食谱与替换表' },
    { id: 'p6', campId: 'camp2', name: '体脂夹', points: 150, stock: 40, active: true, delivery: ['shipped'], max: 1, sort: 1, image: '体脂夹', desc: '' },
    { id: 'p7', campId: 'camp1', name: '定制帆布袋', points: 60, stock: 60, active: true, delivery: ['shipped', 'in-person'], max: 0, sort: 6, image: '帆布袋', desc: '北医健康营联名' }
  ];

  const badges = [
    { id: 'b1', campId: 'camp1', cat: 'milestone', name: '减重 3% 里程碑', cond: 'weight_loss_percent', threshold: 3, icon: '🎯', on: true },
    { id: 'b2', campId: 'camp1', cat: 'milestone', name: '减重 5% 里程碑', cond: 'weight_loss_percent', threshold: 5, icon: '🎯', on: true },
    { id: 'b3', campId: 'camp1', cat: 'achievement', name: '连续打卡 7 天', cond: 'streak_days', threshold: 7, icon: '🏆', on: true },
    { id: 'b4', campId: 'camp1', cat: 'achievement', name: '连续打卡 14 天', cond: 'streak_days', threshold: 14, icon: '🔥', on: true },
    { id: 'b5', campId: 'camp1', cat: 'achievement', name: '全勤先锋', cond: 'streak_days', threshold: 28, icon: '🏅', on: true },
    { id: 'b6', campId: 'camp1', cat: 'achievement', name: '燃脂勇士', cond: 'fat_loss_kg', threshold: 2, icon: '🔥', on: true },
    { id: 'b7', campId: 'camp1', cat: 'achievement', name: '晨型人', cond: 'early_exercise_count', threshold: 3, icon: '🌅', on: true },
    { id: 'b8', campId: 'camp1', cat: 'achievement', name: '耐力王', cond: 'single_exercise_minutes', threshold: 60, icon: '🏅', on: true },
    { id: 'b9', campId: 'camp1', cat: 'activity', name: '每日打卡', cond: 'checkin_days', threshold: 1, icon: '🌱', cadence: 'day', on: true },
    { id: 'b10', campId: 'camp1', cat: 'activity', name: '全项达标', cond: 'all_items', threshold: 1, icon: '✅', cadence: 'day', on: true },
    { id: 'b11', campId: 'camp1', cat: 'activity', name: '本周坚持', cond: 'checkin_days', threshold: 3, icon: '🏅', cadence: 'week', on: true },
    { id: 'b12', campId: 'camp1', cat: 'activity', name: '月度坚持', cond: 'checkin_days', threshold: 5, icon: '🏆', cadence: 'month', on: false }
  ];

  const claims = students.slice(0, 9).map(function (s, i) {
    const tier = tiers[i % 4];
    const st = ['pending', 'pending', 'shipped', 'confirmed', 'in-person', 'pending', 'shipped', 'pending', 'confirmed'][i];
    return {
      id: 'cl' + (1001 + i), tierId: tier.id, tierName: tier.name, studentId: s.id, studentName: s.name, campId: 'camp1',
      phone: s.phone, recipient: s.name, address: ['北京市昌平区生命科学园路 1 号', '北京市朝阳区北苑路 88 号 3 单元', '北京市海淀区中关村大街 27 号'][i % 3],
      status: st, claimDate: dt(-i, 12, 30), tracking: st === 'shipped' ? 'SF' + (1400000000 + i * 7311) : '',
      shipDate: st === 'shipped' ? dt(-i + 1, 15, 10) : '', method: i % 3 === 0 ? 'in-person' : 'shipped', activityType: ''
    };
  });

  const exchanges = students.slice(2, 10).map(function (s, i) {
    const p = products[i % 5];
    const st = ['pending', 'pending', 'fulfilled', 'cancelled', 'pending', 'fulfilled', 'pending', 'fulfilled'][i];
    return {
      id: 'ex' + (2001 + i), productId: p.id, productName: p.name, points: p.points, studentId: s.id, studentName: s.name, campId: 'camp1',
      phone: s.phone, address: '北京市昌平区回龙观东大街 ' + (10 + i) + ' 号', status: st, date: dt(-i - 1, 16, 20),
      tracking: st === 'fulfilled' ? 'JD' + (8800000000 + i * 3719) : '', method: i % 4 === 0 ? 'in-person' : 'shipped',
      audit: [{ op: 'created', opName: s.name, time: dt(-i - 1, 16, 20), to: st, note: '' }]
    };
  });

  const coachActivities = [
    { id: 'ca1', campId: 'camp1', title: '晨间唤醒 · 10 分钟拉伸', desc: '起床后跟练，缓解久坐腰背紧张。', coach: '刘洋', date: dt(-2, 7, 30), media: 2, video: true, views: 128, status: 'published' },
    { id: 'ca2', campId: 'camp1', title: '低冲击有氧 · 膝盖友好版', desc: '适合体重基数较大的学员，全程无跳跃。', coach: '陈放', date: dt(-4, 19, 0), media: 3, video: true, views: 96, status: 'published' },
    { id: 'ca3', campId: 'camp1', title: '核心稳定性训练 A', desc: '平板支撑进阶组合，注意呼吸节奏。', coach: '刘洋', date: dt(-1, 20, 0), media: 1, video: false, views: 0, status: 'draft' },
    { id: 'ca4', campId: 'camp3', title: '结营后如何保持运动习惯', desc: '三次课的回放合集。', coach: '郑越', date: dt(-28, 18, 0), media: 4, video: true, views: 302, status: 'published' }
  ];

  const messages = [
    { id: 'msg1', campId: 'camp1', type: '公告', title: '第 3 周体测安排', body: '本周六 9:00–11:00 在健康管理中心进行中期体测，请提前 8 小时禁食。', target: 'all', sentAt: dt(-1, 10, 0), readRate: 86, status: 'sent' },
    { id: 'msg2', campId: 'camp1', type: '提醒', title: '今日还未完成体重打卡', body: '已连续 3 天未打卡的学员共 4 人，系统已自动推送提醒。', target: 'inactive3', sentAt: dt(0, 9, 0), readRate: 62, status: 'sent' },
    { id: 'msg3', campId: 'camp2', type: '公告', title: '第八期开营须知', body: '开营前请完成入营问卷与基线体测预约。', target: 'camp2', sentAt: '', readRate: 0, status: 'draft' }
  ];

  /* ------------------------------------------------------------- brand */
  const regions = [
    { id: 'beijing', name: '北京地区', city: '北京市', summary: '综合 · 康复 · 健管', color: '#2c6e9b', count: 5 },
    { id: 'tianjin', name: '天津地区', city: '天津市', summary: '滨海综合医疗', color: '#3d86ad', count: 1 },
    { id: 'shandong', name: '山东地区', city: '淄博市', summary: '淄博综合医疗', color: '#2f7f78', count: 1 },
    { id: 'shanxi', name: '山西地区', city: '长治市', summary: '长治综合医疗', color: '#557a96', count: 1 },
    { id: 'hunan', name: '湖南地区', city: '株洲市', summary: '心血管专科', color: '#9a5f6d', count: 1 },
    { id: 'guangdong', name: '广东地区', city: '深圳市', summary: '深圳康复医疗', color: '#b7864e', count: 2 }
  ];

  const institutions = [
    { id: 'i1', region: 'beijing', type: 'general', name: '北京大学国际医院', short: '北大国际', city: '北京 · 昌平', beds: 1800, level: '三级综合', open: '2014', tags: ['综合医院', '国际医疗部', 'JCI'], desc: '北大医疗体系旗舰医院，覆盖 60 余个临床科室。', on: true },
    { id: 'i2', region: 'beijing', type: 'rehab', name: '北大医疗康复医院', short: '康复医院', city: '北京 · 朝阳', beds: 300, level: '三级康复', open: '2016', tags: ['康复', '神经康复', '骨科康复'], desc: '以神经与骨科康复为特色。', on: true },
    { id: 'i3', region: 'beijing', type: 'center', name: '北京大学国际医院健康管理中心', short: '健管中心', city: '北京 · 昌平', beds: 0, level: '健康管理', open: '2015', tags: ['体检', '健康管理'], desc: '年体检量 12 万人次。', on: true },
    { id: 'i4', region: 'beijing', type: 'specialty', name: '北大医疗肿瘤医院', short: '肿瘤医院', city: '北京 · 丰台', beds: 400, level: '三级专科', open: '2018', tags: ['肿瘤', '放疗'], desc: '精准放疗与多学科会诊。', on: true },
    { id: 'i5', region: 'beijing', type: 'general', name: '北大医疗鲁中医院', short: '鲁中医院', city: '北京 · 海淀', beds: 600, level: '三级综合', open: '2003', tags: ['综合'], desc: '社区综合医疗服务。', on: false },
    { id: 'i6', region: 'tianjin', type: 'general', name: '北大医疗海洋石油医院', short: '海油医院', city: '天津 · 滨海', beds: 500, level: '三级综合', open: '1998', tags: ['综合', '职业病'], desc: '海洋石油职工医疗保障。', on: true },
    { id: 'i7', region: 'shandong', type: 'general', name: '北大医疗淄博医院', short: '淄博医院', city: '山东 · 淄博', beds: 800, level: '三级综合', open: '2005', tags: ['综合'], desc: '鲁中地区区域医疗中心。', on: true },
    { id: 'i8', region: 'shanxi', type: 'general', name: '北大医疗潞安医院', short: '潞安医院', city: '山西 · 长治', beds: 700, level: '三级综合', open: '2002', tags: ['综合', '职业病'], desc: '矿区职业健康服务。', on: true },
    { id: 'i9', region: 'hunan', type: 'specialty', name: '北大医疗株洲心血管医院', short: '株洲心血管', city: '湖南 · 株洲', beds: 350, level: '三级专科', open: '2019', tags: ['心血管'], desc: '心血管专科医院。', on: true },
    { id: 'i10', region: 'guangdong', type: 'rehab', name: '北大医疗深圳康复医院', short: '深圳康复', city: '广东 · 深圳', beds: 280, level: '二级康复', open: '2021', tags: ['康复'], desc: '大湾区康复服务。', on: true },
    { id: 'i11', region: 'guangdong', type: 'center', name: '深圳健康管理中心', short: '深圳健管', city: '广东 · 深圳', beds: 0, level: '健康管理', open: '2022', tags: ['体检'], desc: '企业健康管理服务。', on: true }
  ];

  const departments = [
    { id: 'dep1', cat: '内科', name: '心血管内科', on: true, featured: true, doctors: 24, intro: '集临床诊疗、学术研究与人才培养于一体的心脏疾病诊治中心，胸痛中心通过权威认证。', features: ['心力衰竭与心血管重症监护病房', '高龄共病复杂冠脉介入', '心脑联合 MDT'] },
    { id: 'dep2', cat: '内科', name: '肾脏内科', on: true, featured: true, doctors: 16, intro: '原发与继发性肾小球疾病、血液透析通路建立与长期维护。', features: ['CKD 一体化管理', '腹膜透析中心'] },
    { id: 'dep3', cat: '内科', name: '血液病门诊', on: true, featured: true, doctors: 12, intro: '白血病、淋巴瘤、骨髓瘤等血液系统疾病诊疗。', features: ['造血干细胞移植', 'CAR-T 治疗'] },
    { id: 'dep4', cat: '外科', name: '心外科', on: true, featured: true, doctors: 18, intro: '心脏及大血管外科，年手术量 600 余例。', features: ['主动脉夹层', '微创瓣膜'] },
    { id: 'dep5', cat: '外科', name: '骨科', on: true, featured: false, doctors: 21, intro: '关节、脊柱与运动医学。', features: ['关节置换', '脊柱微创'] },
    { id: 'dep6', cat: '妇儿', name: '妇科', on: true, featured: true, doctors: 19, intro: '妇科良恶性肿瘤与微创手术。', features: ['腹腔镜', '宫颈病变'] },
    { id: 'dep7', cat: '妇儿', name: '产科', on: true, featured: false, doctors: 14, intro: '高危妊娠管理与分娩镇痛。', features: ['高危产科', 'LDR 产房'] },
    { id: 'dep8', cat: '五官', name: '眼科门诊', on: true, featured: true, doctors: 15, intro: '复杂白内障、老花眼与屈光白内障。', features: ['多焦点人工晶体', '屈光手术'] },
    { id: 'dep9', cat: '五官', name: '耳鼻咽喉头颈外科', on: true, featured: false, doctors: 11, intro: '耳科、鼻科与头颈肿瘤。', features: ['人工耳蜗', '鼻内镜'] },
    { id: 'dep10', cat: '专科', name: '男科', on: true, featured: false, doctors: 8, intro: '男科多发疾病、男性不育与私密整形。', features: ['显微手术', '男性不育'] },
    { id: 'dep11', cat: '专科', name: '皮肤科', on: true, featured: false, doctors: 9, intro: '皮肤肿瘤、银屑病与医学美容。', features: ['皮肤镜', '光疗'] },
    { id: 'dep12', cat: '医技', name: '病理科门诊', on: true, featured: false, doctors: 7, intro: '细胞病理、消化病理与甲状腺病理诊断。', features: ['分子病理', '远程会诊'] },
    { id: 'dep13', cat: '专科', name: '中医科', on: false, featured: false, doctors: 10, intro: '中医内科与针灸推拿。', features: ['膏方', '针灸'] },
    { id: 'dep14', cat: '医技', name: '健康管理中心', on: true, featured: true, doctors: 6, intro: '体检、检后管理与健康风险评估。', features: ['深度体检', '检后管理'] }
  ];

  const doctors = [
    { id: 'doc1', name: '于存涛', title: '教授 主任医师', dept: '心外科', hospital: '北京大学国际医院', expert: true, on: true, featured: true, tags: ['教授'], specialty: '心脏及主动脉外科，主刀 12000 余例心脏大血管手术。', photo: '' },
    { id: 'doc2', name: '刘小慧', title: '教授 · 主任医师', dept: '心血管内科', hospital: '北京大学国际医院', expert: true, on: true, featured: true, tags: ['教授'], specialty: '高血压、心力衰竭、冠心病及复杂心血管疾病诊治。', photo: '' },
    { id: 'doc3', name: '于峰', title: '教授 主任医师', dept: '肾脏内科', hospital: '北京大学国际医院', expert: true, on: true, featured: true, tags: ['教授'], specialty: '原发和继发性免疫相关肾脏病诊治。', photo: '' },
    { id: 'doc4', name: '任汉云', title: '教授 · 主任医师', dept: '血液病门诊', hospital: '北京大学国际医院', expert: true, on: true, featured: true, tags: ['教授'], specialty: '白血病、淋巴瘤和骨髓瘤等肿瘤性疾病诊断与治疗。', photo: '' },
    { id: 'doc5', name: '丁嘉祥', title: '主任医师', dept: '肾脏内科', hospital: '北京大学国际医院', expert: true, on: true, featured: true, tags: [], specialty: '肾小球疾病诊治，透析通路建立与长期维护。', photo: '' },
    { id: 'doc6', name: '丁振强', title: '教授 主任医师', dept: '眼科门诊', hospital: '北京大学国际医院', expert: false, on: true, featured: false, tags: ['教授'], specialty: '复杂白内障、老花眼与屈光白内障。', photo: '' },
    { id: 'doc7', name: '任凤学', title: '主任医师', dept: '心血管内科', hospital: '北京大学国际医院', expert: false, on: true, featured: false, tags: [], specialty: '心血管疾病介入诊疗。', photo: '' },
    { id: 'doc8', name: '任明保', title: '主任医师', dept: '妇科', hospital: '北京大学国际医院', expert: false, on: true, featured: false, tags: [], specialty: '妇科良恶性肿瘤与宫颈癌前病变。', photo: '' },
    { id: 'doc9', name: '李喆', title: '主任医师', dept: '男科', hospital: '北京大学国际医院', expert: false, on: true, featured: false, tags: [], specialty: '男科多发疾病、男性不育与私密整形。', photo: '' },
    { id: 'doc10', name: '任玉波', title: '主任医师', dept: '病理科门诊', hospital: '北京大学国际医院', expert: false, on: true, featured: false, tags: [], specialty: '细胞病理、消化病理与甲状腺病理诊断。', photo: '' },
    { id: 'doc11', name: '张伟', title: '项目督导', dept: '运营', hospital: '北大医疗', expert: false, on: true, featured: false, tags: ['运营'], specialty: '跨营期督导与质量把控。', photo: '' },
    { id: 'doc12', name: '王雪', title: '注册营养师', dept: '营养', hospital: '北京大学国际医院', expert: false, on: true, featured: false, tags: ['健康营'], specialty: '体重管理与慢病营养干预。', photo: '' },
    { id: 'doc13', name: '刘洋', title: '康复治疗师', dept: '康复', hospital: '北大医疗康复医院', expert: false, on: true, featured: false, tags: ['健康营'], specialty: '运动评估与带练。', photo: '' },
    { id: 'doc14', name: '陈放', title: '康复治疗师', dept: '康复', hospital: '北大医疗康复医院', expert: false, on: true, featured: false, tags: ['健康营'], specialty: '低冲击有氧与关节保护。', photo: '' }
  ];

  const brandCamp = {
    id: 'camp-2026-autumn', name: '北医健康营', edition: '第 7 期', theme: '28 天代谢重塑计划',
    status: '进行中', statusKey: 'live', start: '2026-10-19', end: '2026-11-15', day: 18, totalDays: 28,
    location: '北京 · 昌平 · 北京大学国际医院', host: '北京大学国际医院',
    summary: '由北医系统专家与健康管理团队联合带队，围绕营养、运动、睡眠与慢病风险，为学员提供 28 天陪跑式健康管理。',
    highlights: [
      { label: '医学评估', value: '入营基线 + 结营复评' },
      { label: '营养干预', value: '一对一定制膳食方案' },
      { label: '运动康复', value: '每周 3 次带练与纠姿' },
      { label: '全程陪跑', value: '健管师每日跟进' }
    ],
    roles: [
      { key: 'lead', name: '项目负责人', desc: '统筹营期计划、跨角色排期与学员服务体验' },
      { key: 'doctor', name: '医师', desc: '负责入营评估、风险筛查与医学支持' },
      { key: 'nutrition', name: '营养师', desc: '负责营养评估、膳食方案与全程营养干预' },
      { key: 'rehab', name: '康复师（教练）', desc: '负责运动评估、带练与动作纠正' },
      { key: 'health', name: '健管师', desc: '负责健康档案、每日随访与计划执行' },
      { key: 'supervisor', name: '运营督导', desc: '负责服务质量巡查与跨营期标准落地' }
    ],
    roster: [
      { id: 'r1', name: '孙敏', role: '项目负责人', hospital: '北京大学国际医院' },
      { id: 'r2', name: '聂绍平', role: '医师', hospital: '北京大学国际医院' },
      { id: 'r3', name: '王雪', role: '营养师', hospital: '北京大学国际医院' },
      { id: 'r4', name: '张楠', role: '营养师', hospital: '北京大学国际医院' },
      { id: 'r5', name: '刘洋', role: '康复师', hospital: '北大医疗康复医院' },
      { id: 'r6', name: '陈放', role: '康复师', hospital: '北大医疗康复医院' },
      { id: 'r7', name: '周琳', role: '健管师', hospital: '北京大学国际医院' },
      { id: 'r8', name: '张伟', role: '运营督导', hospital: '北大医疗' }
    ]
  };

  const brandHome = {
    heroTitle: '让优质医疗 触手可及',
    heroSub: '北大医疗 · 覆盖 6 省 11 城的医疗服务网络',
    entries: [
      { id: 'e1', title: '分院网络', sub: '6 省 11 城', on: true, order: 1 },
      { id: 'e2', title: '学科与科室', sub: '70 个临床科室', on: true, order: 2 },
      { id: 'e3', title: '师资团队', sub: '726 位医师', on: true, order: 3 },
      { id: 'e4', title: '北医健康营', sub: '第 7 期进行中', on: true, order: 4 }
    ],
    stats: [
      { key: 'doctors', label: '医师', value: 726 },
      { key: 'experts', label: '专家', value: 57 },
      { key: 'nurses', label: '护理', value: 107 },
      { key: 'depts', label: '科室', value: 70 }
    ],
    featuredCount: 6,
    brandStrip: ['北京大学国际医院', '北大医疗康复医院', '北大医疗肿瘤医院', '北大医疗淄博医院', '北大医疗潞安医院', '北大医疗株洲心血管医院']
  };

  const brandInfo = {
    intro: '北大医疗以北京大学国际医院为核心，构建覆盖综合、康复、专科与健康管理的医疗服务网络。',
    timeline: [
      { year: '2014', title: '北京大学国际医院开业', desc: '亚洲最大单体医院之一，1800 张床位。' },
      { year: '2016', title: '康复医院投入运营', desc: '神经康复与骨科康复双中心。' },
      { year: '2018', title: '肿瘤医院成立', desc: '精准放疗与 MDT 体系落地。' },
      { year: '2021', title: '大湾区布局', desc: '深圳康复医院开业。' },
      { year: '2024', title: '健康营项目启动', desc: '面向企业的 28 天代谢管理。' },
      { year: '2026', title: '第 7 期健康营', desc: '累计服务学员 1,200+。' }
    ],
    numbers: [
      { label: '年服务患者', value: '320 万' }, { label: '开放床位', value: '5,000+' },
      { label: '临床科室', value: '70' }, { label: '合作企业', value: '180' }
    ]
  };

  const brandSite = {
    nav: [
      { id: 'n1', label: '首页', path: 'index.html', on: true },
      { id: 'n2', label: '关于北大医疗', path: 'brand.html', on: true },
      { id: 'n3', label: '分院网络', path: 'hospitals.html', on: true },
      { id: 'n4', label: '师资团队', path: 'team.html', on: true },
      { id: 'n5', label: '学科科室', path: 'department.html', on: true },
      { id: 'n6', label: '健康营', path: 'camp.html', on: true }
    ],
    seoTitle: '北大医疗 · 医疗服务网络',
    seoDesc: '覆盖 6 省 11 城，综合、康复、专科与健康管理一体化的医疗服务网络。',
    shareTitle: '北大医疗 · 让优质医疗触手可及',
    theme: '#0b63e5',
    footer: '© 2026 北大医疗产业集团'
  };

  /* --------------------------------------------------------- employee */
  const modules = [
    { id: 'screen', name: '健康筛查', stab: '筛查', sub: '发现潜在风险', icon: 'scan', tint: '#FFF1E7', ink: '#F5520A', on: true, order: 1 },
    { id: 'chronic', name: '慢病管理', stab: '慢病', sub: '长期干预控费', icon: 'pulse', tint: '#E9F7F1', ink: '#0A7A55', on: true, order: 2 },
    { id: 'medical', name: '就医服务', stab: '就医', sub: '解决看病难', icon: 'hospital', tint: '#EDF3FF', ink: '#1F4FD1', on: true, order: 3 },
    { id: 'special', name: '特色服务', stab: '特色', sub: '身心关怀 / EAP', icon: 'heart', tint: '#FDEEF4', ink: '#BE2A5E', on: true, order: 4 },
    { id: 'safety', name: '应急保障', stab: '应急', sub: '企业安全风控', icon: 'shield', tint: '#FFF6E0', ink: '#A86A06', on: true, order: 5 }
  ];

  const svcRaw = [
    ['annual-exam', 'screen', '职工年度体检', 'Annual Employee Health Checkup', '属地履约', ['职工福利费', '工会经费', '企康'], ['每年 1 次', '含报告解读'], '年度深度体检：基础检查、影像与肿瘤标志物一次完成，检后由医生统一解读并给出复查建议。', '半天', '1 个工作日出报告', 1],
    ['risk-report', 'screen', '检后管理 · 深度报告解读', 'Post-checkup Report Interpretation', '全国履约', ['职工福利费', '工会经费', '企康'], ['线上', '1 个工作日出结论'], '由全科与专科医生对近 3–6 个月体检报告逐项解读，标出需要复查和干预的指标。', '30–45 分钟', '1 个工作日出结论', 1],
    ['risk-survey', 'screen', '健康风险调研问卷', 'Health Risk Assessment', '全国履约', ['职工福利费', '工会经费', '企康'], ['10 分钟', '线上'], '围绕心脑血管、五高一重、睡眠与心理 4 个维度自评，生成个人风险画像与干预建议。', '约 10 分钟', '提交后即时出结果', 1],
    ['inpatient', 'screen', '住院体检服务', 'Inpatient Physical Examination', '属地履约', ['职工福利费', '工会经费', '企康'], ['2 天 1 晚', 'VIP 单人病房'], '检查、休养、管理一体化的沉浸式体检，护士全程陪诊。', '2 天 1 晚', '3–7 个工作日出正式报告', 1],
    ['gastro', 'screen', '无痛胃肠镜检查', 'Painless Gastrointestinal Endoscopy', '属地履约', ['职工福利费', '企康'], ['麻醉下检查', '含病理'], '麻醉下完成胃镜与肠镜联合检查，发现息肉可同期处理。', '半天（含术前准备）', '病理 5–7 个工作日', 1],
    ['cancer', 'screen', '重疾筛查服务', 'Cancer Screening Service', '属地履约', ['职工福利费', '企康'], ['按癌种定制', '含随访'], '围绕肺、胃、结直肠、乳腺等高发癌种的分层筛查。', '1–2 天', '5–7 个工作日', 1],
    ['cpet', 'screen', '心肺运动 CPET 筛查', 'Cardiopulmonary Exercise Testing', '属地履约', ['职工福利费', '企康'], ['运动风险评估', '含报告'], '运动前心肺功能评估，为运动处方提供安全边界。', '约 2 小时', '2 个工作日', 0],
    ['sleep', 'screen', '医疗级多导睡眠监测', 'Polysomnography', '属地履约', ['职工福利费', '企康'], ['住一晚', '含医生解读'], '院内睡眠监测，评估睡眠结构与呼吸暂停风险。', '1 晚', '3 个工作日', 0],
    ['occupational', 'screen', '职业病筛查服务', 'Occupational Disease Screening', '属地履约', ['企康', '安全生产费'], ['入企采样', '合规报告'], '按岗位危害因素定制职业健康检查。', '按人数', '7 个工作日', 1],
    ['fivehigh', 'chronic', '五高一重管理服务', 'Five-High Chronic Management', '全国履约', ['企康', '职工福利费'], ['12 周', '健康管家'], '血压、血糖、血脂、尿酸、体重与重疾风险的长期共管。', '12 周', '每周随访', 1],
    ['heart', 'chronic', '心脑健康训练营', 'Cardio-Cerebral Health Camp', '全国履约', ['企康'], ['8 周', '小组制'], '面向心脑血管高风险人群的线上训练营。', '8 周', '结营评估', 0],
    ['weight', 'chronic', '减重训练营', 'Weight Management Camp', '全国履约', ['企康', '职工福利费'], ['28 天', '营养师带练'], '28 天代谢重塑，营养、运动与行为干预结合。', '28 天', '结营报告', 1],
    ['lung', 'chronic', '肺结节管理服务', 'Pulmonary Nodule Management', '全国履约', ['企康'], ['12 个月', '影像随访'], '肺结节分层管理与随访提醒。', '12 个月', '按随访节点', 0],
    ['tcm', 'chronic', '中医康复综合解决服务', 'TCM Rehabilitation', '属地履约', ['职工福利费'], ['疗程制', '含理疗'], '中医内科、针灸与推拿综合干预。', '4–8 周', '疗程结束评估', 0],
    ['rehab', 'chronic', '远程居家康复健康指导', 'Remote Home Rehabilitation', '全国履约', ['企康'], ['12 周', '视频指导'], '术后与慢病居家康复的远程指导。', '12 周', '每周 1 次', 0],
    ['fast', 'medical', '职工就医快通服务', 'Priority Medical Access', '属地履约', ['企康', '职工福利费'], ['绿色通道', '陪诊'], '挂号、检查、住院的绿色通道与陪诊。', '按需', '24 小时内响应', 1],
    ['second', 'medical', '专家线上二次诊疗咨询', 'Online Second Opinion', '全国履约', ['企康'], ['线上', '48 小时'], '针对重大诊断的专家二次意见。', '45 分钟', '48 小时', 1],
    ['cloud', 'medical', '北大国际医院云门诊', 'Cloud Clinic', '全国履约', ['企康', '医保'], ['视频问诊', '可开药'], '线上视频问诊与处方流转。', '20 分钟', '实时', 1],
    ['clinic', 'medical', '企业医务室', 'On-site Clinic', '属地履约', ['企康'], ['驻场', '日常诊疗'], '企业内设医务室的运营与医护派驻。', '常驻', '即时', 0],
    ['onsite', 'special', '专家入企健管服务', 'On-site Expert Service', '属地履约', ['企康'], ['入企', '按场次'], '专家团队进企业开展健康咨询与评估。', '半天/场', '按排期', 0],
    ['lecture', 'special', '健康科普服务', 'Health Lecture', '全国履约', ['工会经费', '企康'], ['线上/线下', '可定制'], '按企业需求定制健康科普讲座。', '60–90 分钟', '按排期', 1],
    ['eap', 'special', '心理健康管理服务（EAP）', 'Employee Assistance Program', '全国履约', ['工会经费', '企康'], ['24 小时热线', '隐私保护'], '压力、情绪、职场关系与家庭议题的心理支持。', '按次', '24 小时响应', 1],
    ['travel', 'special', '医旅康养服务', 'Medical Wellness Travel', '属地履约', ['职工福利费'], ['3–7 天', '含评估'], '结合体检、康复与疗休养的康养行程。', '3–7 天', '按行程', 0],
    ['fivegood', 'special', '五好生活', 'Five-Good Life Program', '全国履约', ['企康'], ['会员制', '生活方式'], '吃、动、睡、心、检五位一体的生活方式项目。', '12 个月', '季度评估', 0],
    ['vip', 'special', '企业家健康管理中心', 'Executive Health Center', '属地履约', ['自费', '企康'], ['年度', '专属管家'], '企业家年度健康管理与专属医疗管家。', '年度', '7×24', 0],
    ['firstaid', 'safety', '职场急救培训服务', 'Workplace First Aid Training', '属地履约', ['安全生产费', '工会经费'], ['取证', '实操'], '心肺复苏、AED 与常见急症处置培训。', '1 天', '考核后发证', 1],
    ['env', 'safety', '职场环境健康安全服务', 'Workplace EHS Service', '属地履约', ['安全生产费'], ['消杀', '疫苗'], '环境消杀、集体疫苗接种与职业健康支持。', '按需', '按排期', 0],
    ['event', 'safety', '大型活动应急保障服务', 'Event Medical Support', '属地履约', ['安全生产费', '企康'], ['驻场', '救护车'], '年会、运动会等大型活动的现场医疗保障。', '按活动', '按排期', 1]
  ];

  const services = svcRaw.map(function (r, i) {
    return {
      id: r[0], mod: r[1], name: r[2], en: r[3], scope: r[4], payer: r[5], tags: r[6], intro: r[7],
      duration: r[8], resp: r[9], bookable: r[10], on: true, hot: i < 3, order: i + 1,
      orgs: r[1] === 'screen' ? ['北京大学国际医院 · 健康管理中心'] : ['北大医疗互联网医院'],
      price: r[10] ? ri(120, 980) * 10 : 0,
      sold: ri(12, 260)
    };
  });

  const orgs = [
    { id: 'o1', name: '北大国际医院', sub: '北京 · 昌平', on: true },
    { id: 'o2', name: '北大医疗康复医院', sub: '北京 · 朝阳', on: true },
    { id: 'o3', name: '线上视频面诊', sub: '全国', on: true }
  ];
  const schedule = {
    dates: [{ d: '11-07', w: '明天', on: true }, { d: '11-08', w: '周六', on: true }, { d: '11-09', w: '周日', on: true }, { d: '11-10', w: '周一', on: true }],
    times: [{ t: '08:30', n: '上午', quota: 6, on: true }, { t: '10:00', n: '上午', quota: 6, on: true }, { t: '14:00', n: '下午', quota: 4, on: true }, { t: '15:30', n: '下午', quota: 4, on: false }],
    leadDays: 1, maxDays: 14, cancelHours: 24
  };

  const bookingFields = [
    { key: 'org', label: '服务机构', type: 'select', mods: ['screen', 'medical'], required: true, on: true },
    { key: 'date', label: '预约日期', type: 'date', mods: ['screen', 'chronic', 'medical', 'special', 'safety'], required: true, on: true },
    { key: 'time', label: '时段', type: 'time', mods: ['screen', 'medical', 'special'], required: true, on: true },
    { key: 'fast', label: '是否需要空腹提醒', type: 'radio', mods: ['screen'], required: false, on: true },
    { key: 'mode', label: '服务形式', type: 'radio', mods: ['chronic'], required: true, on: true },
    { key: 'manager', label: '健康管家', type: 'select', mods: ['chronic'], required: false, on: true },
    { key: 'cycle', label: '管理周期', type: 'radio', mods: ['chronic'], required: true, on: true },
    { key: 'people', label: '参与人数', type: 'number', mods: ['safety', 'special'], required: true, on: true },
    { key: 'site', label: '活动场地', type: 'text', mods: ['safety'], required: false, on: true }
  ];

  const bookings = [
    { id: 'BK20261106001', service: '职工年度体检', serviceId: 'annual-exam', person: '林悦', dept: '研发中心', phone: '138****6621', date: '2026-11-07', time: '08:30', org: '北大国际医院', status: 'confirmed', created: dt(0, 9, 12) },
    { id: 'BK20261106002', service: '深度报告解读', serviceId: 'risk-report', person: '陈嘉禾', dept: '市场部', phone: '139****2087', date: '2026-11-07', time: '14:00', org: '线上视频面诊', status: 'pending', created: dt(0, 9, 40) },
    { id: 'BK20261105008', service: '无痛胃肠镜检查', serviceId: 'gastro', person: '周雯', dept: '财务部', phone: '137****5540', date: '2026-11-08', time: '10:00', org: '北大国际医院', status: 'confirmed', created: dt(-1, 11, 2) },
    { id: 'BK20261105007', service: '五高一重管理服务', serviceId: 'fivehigh', person: '徐一鸣', dept: '生产部', phone: '186****7732', date: '2026-11-09', time: '15:30', org: '线上视频面诊', status: 'completed', created: dt(-1, 10, 18) },
    { id: 'BK20261104012', service: '职场急救培训服务', serviceId: 'firstaid', person: '何雨桐', dept: '人力资源部', phone: '135****9918', date: '2026-11-10', time: '14:00', org: '企业场地', status: 'confirmed', created: dt(-2, 16, 30) },
    { id: 'BK20261104011', service: '专家线上二次诊疗咨询', serviceId: 'second', person: '赵启明', dept: '法务部', phone: '188****3341', date: '2026-11-08', time: '08:30', org: '线上视频面诊', status: 'cancelled', created: dt(-2, 9, 5) },
    { id: 'BK20261103004', service: '心理健康管理服务（EAP）', serviceId: 'eap', person: '吴倩', dept: '设计部', phone: '136****8802', date: '2026-11-07', time: '10:00', org: '线上视频面诊', status: 'completed', created: dt(-3, 14, 12) },
    { id: 'BK20261103003', service: '减重训练营', serviceId: 'weight', person: '郑凯', dept: '销售部', phone: '150****4476', date: '2026-11-09', time: '14:00', org: '线上视频面诊', status: 'confirmed', created: dt(-3, 10, 44) }
  ];

  const qa = [
    { id: 'q1', q: '体检报告上甲状腺结节 3 类需要马上手术吗？', cat: '体检解读', hits: 1284, on: true, answer: 'TI-RADS 3 类恶性概率通常低于 5%，多数以 6–12 个月复查超声为主。是否手术需结合结节大小、生长速度与超声特征，由专科医生面诊判断。' },
    { id: 'q2', q: '血压早上高、下午正常，是药吃错了吗？', cat: '慢病管理', hits: 962, on: true, answer: '晨峰现象较常见，不一定意味着用药错误。建议连续 7 天记录晨起与睡前血压，携带记录复诊由医生调整服药时间。' },
    { id: 'q3', q: '长期久坐，腰背酸痛怎么缓解？', cat: '运动康复', hits: 771, on: true, answer: '每 45 分钟起身活动 3 分钟，优先做髋屈肌拉伸与臀桥激活；持续超过 2 周的疼痛建议做康复评估。' },
    { id: 'q4', q: '空腹血糖 6.3，算糖尿病吗？', cat: '慢病管理', hits: 655, on: true, answer: '空腹血糖 6.1–7.0 属于空腹血糖受损，尚不能诊断糖尿病，建议做 OGTT 与糖化血红蛋白进一步评估。' },
    { id: 'q5', q: '公司体检套餐里哪些项目可以不加？', cat: '体检解读', hits: 431, on: false, answer: '体检项目应按年龄、性别与家族史配置，不建议简单删减。可先做健康风险问卷，再与健管师确认加做或替代项目。' },
    { id: 'q6', q: '减重期间晚餐不吃主食可以吗？', cat: '营养', hits: 388, on: true, answer: '不建议完全断主食，可把精制主食换成杂粮并控制在一小碗以内，同时保证蛋白质与蔬菜摄入。' }
  ];

  const banners = [
    { id: 'bn1', title: '年度体检预约开启', sub: '11 月 30 日前完成，享检后报告解读', on: true, order: 1, tone: 'blue' },
    { id: 'bn2', title: '五高一重共管计划', sub: '12 周健康管家全程跟进', on: true, order: 2, tone: 'teal' },
    { id: 'bn3', title: 'EAP 心理支持', sub: '24 小时热线，全程隐私保护', on: true, order: 3, tone: 'violet' }
  ];

  const articles = [
    { id: 'ar1', title: '晨峰血压：早上偏高要紧吗', cat: '慢病', author: '心血管内科', date: '2026-11-02', views: 2310, on: true },
    { id: 'ar2', title: '体检报告里的结节，先别慌', cat: '体检', author: '健康管理中心', date: '2026-10-28', views: 1876, on: true },
    { id: 'ar3', title: '久坐人群的 5 个碎片运动', cat: '运动', author: '康复医院', date: '2026-10-20', views: 1402, on: true },
    { id: 'ar4', title: '减重平台期怎么破', cat: '营养', author: '营养科', date: '2026-10-12', views: 988, on: false }
  ];

  const healthSite = {
    title: '北大医疗 · 职工健康服务',
    company: '示例科技有限公司',
    servicePhone: '400-820-8866',
    bannerInterval: 5,
    searchPlaceholder: '搜索服务，如 体检 / 睡眠 / 心理',
    entitlement: { annualExam: 1, eap: 6, clinic: true },
    theme: 'warm'
  };

  /* ------------------------------------------------------------ publish */
  const publishes = [
    { id: 'pv1', app: 'versionall', title: '第 7 期奖励档位调整', by: '孙敏', at: '2026-11-05 18:22', items: 4, status: 'online' },
    { id: 'pv2', app: 'pku-employee-health', title: '服务目录：新增肺结节管理', by: '周琳', at: '2026-11-04 11:08', items: 2, status: 'online' },
    { id: 'pv3', app: 'PKU-introduce', title: '师资团队 6 位专家资料更新', by: '张伟', at: '2026-11-02 16:40', items: 8, status: 'online' }
  ];

  window.SEED = {
    meta: {
      version: '8.0.0',
      env: '生产环境',
      publishedAt: '2026-11-05 18:22',
      apps: [
        { id: 'versionall', name: '减重营', desc: 'versionall · 学员 / 营养师 / 教练三端', dot: '#3f8cff' },
        { id: 'pku', name: '品牌站', desc: 'PKU-introduce · 医疗服务网络', dot: '#0aa39a' },
        { id: 'employee', name: '职工健康', desc: 'pku-employee-health · 企业员工服务', dot: '#c8871a' }
      ]
    },
    versionall: {
      camps: camps, accounts: accounts, students: students,
      records: { weight: weightRecords, diet: dietRecords, exercise: exerciseRecords },
      metrics: metrics, checkin: checkin, activity: activityCfg,
      tiers: tiers, products: products, badges: badges,
      claims: claims, exchanges: exchanges, coachActivities: coachActivities, messages: messages
    },
    brand: {
      home: brandHome, info: brandInfo, regions: regions, institutions: institutions,
      departments: departments, doctors: doctors, camp: brandCamp, site: brandSite
    },
    employee: {
      modules: modules, services: services, orgs: orgs, schedule: schedule,
      bookingFields: bookingFields, bookings: bookings, qa: qa, banners: banners,
      articles: articles, site: healthSite
    },
    publishes: publishes
  };
})();
