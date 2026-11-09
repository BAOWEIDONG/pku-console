/* ============================================================================
   v7 — 健康管理与五好生活数据模型
   健康档案 / 风险分层 / 管理计划 / 随访 / 干预项目 / 结果评估
   五好会员 / 任务 / 打卡审核 / 风险升级 / 数据授权
   ========================================================================== */
(function () {
  'use strict';
  const S = window.SEED;

  S.health = {
    profiles: [
      {
        id: 'hp1', name: '林悦', memberId: 'fm1', dept: '研发中心', company: '示例科技', age: 34, sex: '女', phone: '138****6621',
        risk: 'medium', score: 62, owner: '王雪', source: '年度体检 + 五好会员', joined: '2026-03-01',
        tags: ['血压偏高', '睡眠不足', '久坐'], consent: 'signed', lastContact: '2026-11-06',
        metrics: { bpSys: 138, bpDia: 88, glucose: 5.8, ldl: 3.4, bmi: 24.6, uric: 380, sleep: 6.2, mood: 5, steps: 5200 },
        exam: { date: '2026-10-28', org: '北大国际医院', abnormal: ['血压 138/88', 'LDL-C 3.4 mmol/L', '睡眠时长不足'], summary: '代谢指标轻度异常，建议 12 周生活方式干预后复测。' },
        meds: ['无长期用药'], allergies: ['青霉素'], lifestyle: '每周运动 1–2 次，工作日平均睡眠 6.2 小时。'
      },
      {
        id: 'hp2', name: '陈嘉禾', memberId: 'fm2', dept: '市场部', company: '示例科技', age: 29, sex: '男', phone: '139****2087',
        risk: 'low', score: 41, owner: '陈放', source: '五好会员', joined: '2026-05-12',
        tags: ['超重', '久坐', '外卖频繁'], consent: 'signed', lastContact: '2026-11-05',
        metrics: { bpSys: 124, bpDia: 80, glucose: 5.6, ldl: 3.1, bmi: 27.8, uric: 402, sleep: 6.8, mood: 7, steps: 6100 },
        exam: { date: '2026-06-18', org: '北大国际医院', abnormal: ['BMI 27.8', '尿酸 402 μmol/L'], summary: '以体重管理为主，暂不需要药物干预。' },
        meds: [], allergies: [], lifestyle: '每周外卖 8–10 次，运动以通勤步行为主。'
      },
      {
        id: 'hp3', name: '周雯', memberId: 'fm3', dept: '财务部', company: '示例科技', age: 38, sex: '女', phone: '137****5540',
        risk: 'low', score: 28, owner: '王雪', source: '年度体检 + 五好会员', joined: '2026-01-08',
        tags: ['全维度达标', '健康榜样'], consent: 'signed', lastContact: '2026-11-04',
        metrics: { bpSys: 118, bpDia: 76, glucose: 5.1, ldl: 2.6, bmi: 21.4, uric: 286, sleep: 7.4, mood: 9, steps: 9300 },
        exam: { date: '2026-09-22', org: '北大国际医院', abnormal: [], summary: '各项指标正常，继续保持当前生活方式。' },
        meds: [], allergies: [], lifestyle: '每周瑜伽 3 次，睡眠规律。'
      },
      {
        id: 'hp4', name: '徐一鸣', memberId: 'fm4', dept: '生产部', company: '示例科技', age: 45, sex: '男', phone: '186****7732',
        risk: 'high', score: 82, owner: '赵医生', source: '年度体检 + 五高筛查', joined: '2026-06-20',
        tags: ['五高', '肥胖', '睡眠呼吸暂停风险', '复查逾期'], consent: 'signed', lastContact: '2026-11-07',
        metrics: { bpSys: 162, bpDia: 98, glucose: 7.2, ldl: 4.2, bmi: 30.4, uric: 486, sleep: 5.4, mood: 4, steps: 3100 },
        exam: { date: '2026-10-12', org: '北大国际医院', abnormal: ['血压 162/98', '空腹血糖 7.2', 'LDL-C 4.2', 'BMI 30.4', '尿酸 486'], summary: '多项代谢指标显著异常，已纳入五高一重共管，建议尽快完成专科复诊。' },
        meds: ['氨氯地平 5mg qd'], allergies: [], lifestyle: '倒班作业，夜班后进食较多，几乎无规律运动。'
      },
      {
        id: 'hp5', name: '何雨桐', memberId: 'fm5', dept: '人力资源部', company: '示例科技', age: 31, sex: '女', phone: '135****9918',
        risk: 'medium', score: 56, owner: '陈放', source: '五好会员', joined: '2026-08-02',
        tags: ['睡眠不足', '压力偏高'], consent: 'signed', lastContact: '2026-11-06',
        metrics: { bpSys: 122, bpDia: 79, glucose: 5.3, ldl: 2.9, bmi: 23.2, uric: 320, sleep: 5.8, mood: 6, steps: 7600 },
        exam: { date: '2026-08-20', org: '北大国际医院', abnormal: ['睡眠时长 5.8 小时'], summary: '以睡眠与压力管理为主，代谢指标基本正常。' },
        meds: [], allergies: [], lifestyle: '招聘季加班频繁，睡前使用手机超过 1 小时。'
      },
      {
        id: 'hp6', name: '赵启明', memberId: 'fm6', dept: '法务部', company: '示例科技', age: 42, sex: '男', phone: '188****3341',
        risk: 'medium', score: 68, owner: '赵医生', source: '年度体检', joined: '2026-04-15',
        tags: ['血压偏高', '血脂异常', '压力偏高'], consent: 'signed', lastContact: '2026-11-05',
        metrics: { bpSys: 146, bpDia: 92, glucose: 6.0, ldl: 3.8, bmi: 25.8, uric: 412, sleep: 6.0, mood: 5, steps: 4600 },
        exam: { date: '2026-05-30', org: '北大国际医院', abnormal: ['血压 146/92', 'LDL-C 3.8', '空腹血糖 6.0'], summary: '代谢综合征早期表现，建议 8 周血压与体重管理。' },
        meds: ['无长期用药'], allergies: ['磺胺类'], lifestyle: '应酬较多，饮酒每周 2–3 次。'
      },
      {
        id: 'hp7', name: '吴倩', memberId: '', dept: '设计部', company: '示例科技', age: 28, sex: '女', phone: '136****8802',
        risk: 'high', score: 74, owner: '李咨询师', source: 'EAP 转介', joined: '2026-11-02',
        tags: ['情绪风险', 'EAP 跟进中', '隐私保护'], consent: 'signed', lastContact: '2026-11-08',
        metrics: { bpSys: 116, bpDia: 75, glucose: 5.0, ldl: 2.7, bmi: 20.9, uric: 278, sleep: 5.6, mood: 3, steps: 4800 },
        exam: { date: '2026-04-18', org: '北大国际医院', abnormal: [], summary: '躯体指标正常，当前以心理支持与睡眠改善为主。' },
        meds: [], allergies: [], lifestyle: '连续加班 3 周，情绪打卡连续 5 天偏低。'
      },
      {
        id: 'hp8', name: '孙宁', memberId: '', dept: '销售部', company: '示例科技', age: 36, sex: '男', phone: '150****4476',
        risk: 'medium', score: 58, owner: '王雪', source: '五高筛查', joined: '2026-09-12',
        tags: ['高尿酸', '饮酒', '体重管理'], consent: 'pending', lastContact: '2026-10-30',
        metrics: { bpSys: 132, bpDia: 86, glucose: 5.7, ldl: 3.2, bmi: 27.0, uric: 462, sleep: 6.6, mood: 6, steps: 7200 },
        exam: { date: '2026-09-08', org: '北大国际医院', abnormal: ['尿酸 462 μmol/L', 'BMI 27.0'], summary: '高尿酸血症，建议限制饮酒并完成 8 周尿酸管理。' },
        meds: [], allergies: [], lifestyle: '每周饮酒 3 次，夜宵频率较高。'
      }
    ],

    riskRules: [
      { id: 'hr1', name: '血压高危', dim: '血压', condition: '收缩压 ≥ 160 或舒张压 ≥ 100', level: 'high', action: '24 小时内护士复核，必要时安排就医快通', on: true, hits: 6 },
      { id: 'hr2', name: '血糖高风险', dim: '血糖', condition: '空腹血糖 ≥ 7.0 或 HbA1c ≥ 7%', level: 'high', action: '转专科复诊 + 纳入 12 周共管', on: true, hits: 4 },
      { id: 'hr3', name: '血脂异常', dim: '血脂', condition: 'LDL-C ≥ 4.1 mmol/L', level: 'medium', action: '营养师方案 + 8 周后复测', on: true, hits: 9 },
      { id: 'hr4', name: '肥胖风险', dim: '体重', condition: 'BMI ≥ 28', level: 'medium', action: '推荐减重营或体重管理计划', on: true, hits: 12 },
      { id: 'hr5', name: '睡眠呼吸暂停风险', dim: '睡眠', condition: '打鼾 + 夜间 SpO₂ 下降 ≥ 3 次', level: 'high', action: '建议多导睡眠监测', on: true, hits: 3 },
      { id: 'hr6', name: '情绪高风险', dim: '心理', condition: 'PHQ-2 ≥ 3 或连续 5 天情绪 ≤ 2 分', level: 'high', action: 'EAP 24 小时内回访，暂停非必要提醒', on: true, hits: 5 },
      { id: 'hr7', name: '高尿酸风险', dim: '尿酸', condition: '尿酸 ≥ 420 μmol/L', level: 'medium', action: '饮食干预 + 8 周复测', on: true, hits: 7 },
      { id: 'hr8', name: '随访逾期', dim: '依从性', condition: '计划内随访逾期 ≥ 7 天', level: 'medium', action: '升级至健管师人工跟进', on: true, hits: 8 }
    ],

    planTemplates: [
      { id: 'pt1', name: '五高一重 · 12 周共管', type: 'chronic', weeks: 12, cadence: '每周 1 次，异常时 48 小时内加访', goal: '血压 / 血糖 / 血脂 / 尿酸 / 体重至少 3 项达标', service: 'fivehigh', owner: '健康管理部', tasks: ['入组评估 + 用药核对', '第 4 周指标复测', '第 8 周方案调整', '第 12 周结营评估'] },
      { id: 'pt2', name: '睡眠改善 · 8 周', type: 'sleep', weeks: 8, cadence: '每 2 周 1 次，CBT-I 课程每周推送', goal: '入睡潜伏期 < 30 分钟，周均睡眠 ≥ 7 小时', service: 'sleep', owner: '睡眠中心', tasks: ['PSQI / ISI 基线', 'CBT-I 第 1–4 课', '睡眠日记复盘', '第 8 周复测'] },
      { id: 'pt3', name: '体重管理 · 12 周', type: 'weight', weeks: 12, cadence: '每周 1 次，营养师 + 教练双跟进', goal: '体重下降 ≥ 5%，腰围下降 ≥ 3cm', service: 'weight', owner: '运营中心', tasks: ['体成分基线', '饮食结构评估', '运动处方', '第 12 周复测'] },
      { id: 'pt4', name: '心理关怀 · 4 周', type: 'mind', weeks: 4, cadence: '每周 1 次，EAP 咨询师主导', goal: '情绪稳定，PHQ-2 / GAD-2 回落至安全区', service: 'eap', owner: 'EAP 团队', tasks: ['风险评估', '咨询 1–4 次', '睡眠与压力作业', '转介判断'] },
      { id: 'pt5', name: '高尿酸管理 · 8 周', type: 'uric', weeks: 8, cadence: '每 2 周 1 次，饮食打卡每周复盘', goal: '尿酸 < 420 μmol/L，饮酒频次 ≤ 1 次/周', service: 'fivehigh', owner: '健康管理部', tasks: ['饮食与饮酒评估', '低嘌呤方案', '第 4 周复测', '第 8 周复测'] },
      { id: 'pt6', name: '体检异常复查 · 30 天', type: 'exam', weeks: 4, cadence: '第 7 / 30 天两次跟进', goal: '异常项完成复查或专科就诊', service: 'risk-report', owner: '健康管理中心', tasks: ['报告逐项解读', '复查项目预约', '结果回传', '未复查升级'] }
    ],

    carePlans: [
      { id: 'cp1', profileId: 'hp4', name: '五高一重 · 12 周共管', templateId: 'pt1', goal: '血压 < 140/90，体重下降 3kg，完成专科复诊', owner: '赵医生', start: '2026-09-22', end: '2026-12-14', week: 7, status: 'active', adherence: 72, nextReview: '2026-11-12', service: 'fivehigh', milestones: [{ w: 1, t: '入组评估', done: true }, { w: 4, t: '指标复测', done: true }, { w: 8, t: '方案调整', done: false }, { w: 12, t: '结营评估', done: false }] },
      { id: 'cp2', profileId: 'hp1', name: '睡眠改善 · 8 周', templateId: 'pt2', goal: '周均睡眠 ≥ 7 小时，入睡潜伏期 < 30 分钟', owner: '王雪', start: '2026-10-12', end: '2026-12-07', week: 3, status: 'active', adherence: 68, nextReview: '2026-11-09', service: 'sleep', milestones: [{ w: 1, t: 'PSQI 基线', done: true }, { w: 2, t: '睡眠日记', done: true }, { w: 6, t: 'CBT-I 复盘', done: false }, { w: 8, t: '复测', done: false }] },
      { id: 'cp3', profileId: 'hp7', name: '心理关怀 · 4 周', templateId: 'pt4', goal: 'PHQ-2 回落至 2 分以下，恢复稳定睡眠', owner: '李咨询师', start: '2026-11-02', end: '2026-11-30', week: 2, status: 'active', adherence: 80, nextReview: '2026-11-09', service: 'eap', milestones: [{ w: 1, t: '风险评估', done: true }, { w: 2, t: '咨询第 1 次', done: true }, { w: 3, t: '咨询第 2 次', done: false }, { w: 4, t: '转介判断', done: false }] },
      { id: 'cp4', profileId: 'hp6', name: '血压与体重管理 · 8 周', templateId: 'pt3', goal: '血压 < 135/85，体重下降 2kg', owner: '赵医生', start: '2026-10-20', end: '2026-12-15', week: 4, status: 'active', adherence: 61, nextReview: '2026-11-10', service: 'weight', milestones: [{ w: 1, t: '基线评估', done: true }, { w: 4, t: '第 4 周复测', done: true }, { w: 8, t: '结营评估', done: false }] },
      { id: 'cp5', profileId: 'hp8', name: '高尿酸管理 · 8 周', templateId: 'pt5', goal: '尿酸 < 420 μmol/L，饮酒 ≤ 1 次/周', owner: '王雪', start: '2026-10-28', end: '2026-12-23', week: 2, status: 'active', adherence: 54, nextReview: '2026-11-11', service: 'fivehigh', milestones: [{ w: 1, t: '饮食评估', done: true }, { w: 4, t: '尿酸复测', done: false }, { w: 8, t: '结营评估', done: false }] },
      { id: 'cp6', profileId: 'hp2', name: '体重管理 · 12 周', templateId: 'pt3', goal: 'BMI < 26，腰围下降 3cm', owner: '陈放', start: '2026-11-02', end: '2027-01-25', week: 1, status: 'active', adherence: 74, nextReview: '2026-11-16', service: 'weight', milestones: [{ w: 1, t: '体成分基线', done: true }, { w: 4, t: '饮食复盘', done: false }, { w: 12, t: '复测', done: false }] }
    ],

    followups: [
      { id: 'fu1', profileId: 'hp4', planId: 'cp1', type: '血压复核', due: '2026-11-08', time: '09:30', channel: '电话', owner: '赵医生', status: 'due', priority: 'high', note: '昨日自测 158/96，需确认服药与复诊安排。' },
      { id: 'fu2', profileId: 'hp1', planId: 'cp2', type: '睡眠周复盘', due: '2026-11-08', time: '15:00', channel: '电话', owner: '王雪', status: 'due', priority: 'normal', note: '睡眠日记完成 5/7 天。' },
      { id: 'fu3', profileId: 'hp7', planId: 'cp3', type: 'EAP 咨询后回访', due: '2026-11-08', time: '17:30', channel: 'EAP 专线', owner: '李咨询师', status: 'due', priority: 'high', note: '仅记录服务完成情况，不采集咨询内容。' },
      { id: 'fu4', profileId: 'hp6', planId: 'cp4', type: '第 4 周复测', due: '2026-11-09', time: '10:00', channel: '电话', owner: '赵医生', status: 'upcoming', priority: 'normal', note: '需上传家庭血压 7 天记录。' },
      { id: 'fu5', profileId: 'hp8', planId: 'cp5', type: '饮食打卡复盘', due: '2026-11-09', time: '14:00', channel: '电话', owner: '王雪', status: 'upcoming', priority: 'normal', note: '重点确认饮酒频次。' },
      { id: 'fu6', profileId: 'hp2', planId: 'cp6', type: '运动处方调整', due: '2026-11-10', time: '11:00', channel: '电话', owner: '陈放', status: 'upcoming', priority: 'normal', note: '膝关节无不适后提升至 L2。' },
      { id: 'fu7', profileId: 'hp4', planId: 'cp1', type: '复查预约确认', due: '2026-11-06', time: '16:00', channel: '电话', owner: '赵医生', status: 'overdue', priority: 'high', note: '已逾期 2 天，复查尚未预约。' },
      { id: 'fu8', profileId: 'hp3', planId: '', type: '年度健康回访', due: '2026-11-06', time: '10:30', channel: '电话', owner: '王雪', status: 'completed', priority: 'low', note: '指标稳定，建议继续保持。', outcome: '已完成，无需升级。', next: '2027-03-01' },
      { id: 'fu9', profileId: 'hp5', planId: '', type: '睡眠筛查', due: '2026-11-04', time: '09:00', channel: '电话', owner: '陈放', status: 'completed', priority: 'normal', note: 'PSQI 得分 9，建议加入睡眠改善计划。', outcome: '已转睡眠改善计划。', next: '2026-11-20' },
      { id: 'fu10', profileId: 'hp4', planId: 'cp1', type: '用药依从性确认', due: '2026-11-03', time: '18:00', channel: '电话', owner: '赵医生', status: 'completed', priority: 'high', note: '患者自述偶有漏服。', outcome: '已设置每日提醒，下次复核。', next: '2026-11-10' },
      { id: 'fu11', profileId: 'hp6', planId: 'cp4', type: '血压记录复核', due: '2026-11-05', time: '09:00', channel: '电话', owner: '赵医生', status: 'completed', priority: 'normal', note: '7 天平均 142/90。', outcome: '继续当前方案，2 周后复测。', next: '2026-11-19' },
      { id: 'fu12', profileId: 'hp7', planId: 'cp3', type: '安全风险评估', due: '2026-11-02', time: '20:00', channel: 'EAP 专线', owner: '李咨询师', status: 'completed', priority: 'high', note: '已完成风险分级，无即时危机。', outcome: '进入 4 周关怀计划。', next: '2026-11-09' }
    ],

    programs: [
      { id: 'pg1', name: '五高一重共管 · 第 3 期', type: 'chronic', serviceId: 'fivehigh', cohort: 32, enrolled: 32, active: 29, week: 7, weeks: 12, start: '2026-09-22', end: '2026-12-14', owner: '赵医生', status: 'running', adherence: 71, riskCount: 9, completion: 0 },
      { id: 'pg2', name: '睡眠改善营 · 第 2 期', type: 'sleep', serviceId: 'sleep', cohort: 18, enrolled: 18, active: 16, week: 3, weeks: 8, start: '2026-10-12', end: '2026-12-07', owner: '王雪', status: 'running', adherence: 64, riskCount: 4, completion: 0 },
      { id: 'pg3', name: '体重管理营 · 第 8 期', type: 'weight', serviceId: 'weight', cohort: 60, enrolled: 56, active: 51, week: 1, weeks: 12, start: '2026-11-02', end: '2027-01-25', owner: '陈放', status: 'running', adherence: 78, riskCount: 6, completion: 0 },
      { id: 'pg4', name: '心理韧性计划 · 第 1 期', type: 'mind', serviceId: 'eap', cohort: 12, enrolled: 12, active: 11, week: 2, weeks: 4, start: '2026-10-26', end: '2026-11-23', owner: '李咨询师', status: 'running', adherence: 83, riskCount: 5, completion: 0 },
      { id: 'pg5', name: '高尿酸管理 · 试点', type: 'uric', serviceId: 'fivehigh', cohort: 16, enrolled: 14, active: 12, week: 2, weeks: 8, start: '2026-10-28', end: '2026-12-23', owner: '王雪', status: 'draft', adherence: 52, riskCount: 5, completion: 0 }
    ],

    enrollments: [
      { id: 'en1', programId: 'pg1', profileId: 'hp4', week: 7, status: 'active', adherence: 72, risk: 'high', coach: '赵医生' },
      { id: 'en2', programId: 'pg2', profileId: 'hp1', week: 3, status: 'active', adherence: 68, risk: 'medium', coach: '王雪' },
      { id: 'en3', programId: 'pg3', profileId: 'hp2', week: 1, status: 'active', adherence: 74, risk: 'low', coach: '陈放' },
      { id: 'en4', programId: 'pg4', profileId: 'hp7', week: 2, status: 'active', adherence: 80, risk: 'high', coach: '李咨询师' },
      { id: 'en5', programId: 'pg5', profileId: 'hp8', week: 2, status: 'active', adherence: 54, risk: 'medium', coach: '王雪' },
      { id: 'en6', programId: 'pg1', profileId: 'hp6', week: 7, status: 'active', adherence: 61, risk: 'medium', coach: '赵医生' },
      { id: 'en7', programId: 'pg2', profileId: 'hp5', week: 3, status: 'active', adherence: 66, risk: 'medium', coach: '陈放' },
      { id: 'en8', programId: 'pg3', profileId: 'hp3', week: 1, status: 'completed', adherence: 100, risk: 'low', coach: '陈放' },
      { id: 'en9', programId: 'pg1', profileId: 'hp3', week: 7, status: 'completed', adherence: 96, risk: 'low', coach: '赵医生' },
      { id: 'en10', programId: 'pg4', profileId: 'hp5', week: 2, status: 'active', adherence: 58, risk: 'medium', coach: '李咨询师' }
    ],

    outcomes: [
      { id: 'oc1', profileId: 'hp4', metric: '收缩压', baseline: 162, current: 148, target: 140, unit: 'mmHg', direction: 'down', at: '2026-11-05', status: 'improving' },
      { id: 'oc2', profileId: 'hp4', metric: '空腹血糖', baseline: 7.2, current: 6.7, target: 6.1, unit: 'mmol/L', direction: 'down', at: '2026-11-05', status: 'improving' },
      { id: 'oc3', profileId: 'hp4', metric: '体重', baseline: 92.8, current: 89.4, target: 88.0, unit: 'kg', direction: 'down', at: '2026-11-05', status: 'improving' },
      { id: 'oc4', profileId: 'hp1', metric: '睡眠时长', baseline: 5.8, current: 6.2, target: 7.0, unit: '小时', direction: 'up', at: '2026-11-06', status: 'improving' },
      { id: 'oc5', profileId: 'hp1', metric: 'LDL-C', baseline: 3.4, current: 3.1, target: 3.4, unit: 'mmol/L', direction: 'down', at: '2026-11-06', status: 'reached' },
      { id: 'oc6', profileId: 'hp7', metric: 'PHQ-2', baseline: 4, current: 2, target: 2, unit: '分', direction: 'down', at: '2026-11-08', status: 'reached' },
      { id: 'oc7', profileId: 'hp7', metric: '睡眠时长', baseline: 5.2, current: 5.9, target: 7.0, unit: '小时', direction: 'up', at: '2026-11-08', status: 'improving' },
      { id: 'oc8', profileId: 'hp6', metric: '收缩压', baseline: 146, current: 142, target: 135, unit: 'mmHg', direction: 'down', at: '2026-11-05', status: 'improving' },
      { id: 'oc9', profileId: 'hp6', metric: '体重', baseline: 78.4, current: 77.6, target: 76.0, unit: 'kg', direction: 'down', at: '2026-11-05', status: 'improving' },
      { id: 'oc10', profileId: 'hp8', metric: '尿酸', baseline: 462, current: 438, target: 420, unit: 'μmol/L', direction: 'down', at: '2026-11-04', status: 'improving' },
      { id: 'oc11', profileId: 'hp2', metric: '体重', baseline: 84.2, current: 83.6, target: 78.0, unit: 'kg', direction: 'down', at: '2026-11-03', status: 'improving' },
      { id: 'oc12', profileId: 'hp3', metric: 'BMI', baseline: 21.6, current: 21.4, target: 24.0, unit: '', direction: 'stable', at: '2026-11-04', status: 'reached' },
      { id: 'oc13', profileId: 'hp5', metric: 'PSQI', baseline: 9, current: 7, target: 5, unit: '分', direction: 'down', at: '2026-11-06', status: 'improving' },
      { id: 'oc14', profileId: 'hp4', metric: '尿酸', baseline: 486, current: 470, target: 420, unit: 'μmol/L', direction: 'down', at: '2026-11-05', status: 'improving' },
      { id: 'oc15', profileId: 'hp6', metric: 'LDL-C', baseline: 3.8, current: 3.6, target: 3.4, unit: 'mmol/L', direction: 'down', at: '2026-11-05', status: 'improving' }
    ],

    serviceCases: [
      { id: 'sc1', bookingId: 'BK20261106001', profileId: 'hp1', person: '林悦', service: '职工年度体检', stage: '已预约', owner: '健康管理中心', due: '2026-11-07 08:30', risk: 'medium', next: '检前提醒与空腹确认', benefit: '年度体检 1 次', amount: 8380 },
      { id: 'sc2', bookingId: 'BK20261106002', profileId: 'hp2', person: '陈嘉禾', service: '深度报告解读', stage: '待确认', owner: '健康管理中心', due: '2026-11-07 14:00', risk: 'low', next: '确认医生与视频链接', benefit: '报告解读权益', amount: 680 },
      { id: 'sc3', bookingId: 'BK20261105008', profileId: 'hp3', person: '周雯', service: '无痛胃肠镜检查', stage: '已签到', owner: '消化内科', due: '2026-11-08 10:00', risk: 'low', next: '术前评估与病理跟踪', benefit: '胃肠镜权益', amount: 3200 },
      { id: 'sc4', bookingId: 'BK20261105007', profileId: 'hp4', person: '徐一鸣', service: '五高一重管理服务', stage: '履约中', owner: '赵医生', due: '2026-11-09 15:30', risk: 'high', next: '第 8 周方案调整', benefit: '五高共管 12 周', amount: 4980 },
      { id: 'sc5', bookingId: 'BK20261104012', profileId: 'hp5', person: '何雨桐', service: '职场急救培训服务', stage: '已结算', owner: '客户成功部', due: '2026-11-10 14:00', risk: 'medium', next: '证书发放与满意度回访', benefit: '急救培训', amount: 1200 },
      { id: 'sc6', bookingId: 'BK20261103004', profileId: 'hp7', person: '吴倩', service: '心理健康管理服务（EAP）', stage: '报告待解读', owner: 'EAP 团队', due: '2026-11-07 10:00', risk: 'high', next: 'EAP 咨询记录回访，不采集内容', benefit: 'EAP 6 次', amount: 0 },
      { id: 'sc7', bookingId: 'BK20261103003', profileId: 'hp2', person: '郑凯', service: '减重训练营', stage: '已结算', owner: '运营中心', due: '2026-11-09 14:00', risk: 'low', next: '结营报告与复测', benefit: '减重营', amount: 2980 },
      { id: 'sc8', bookingId: 'BK20261102001', profileId: 'hp6', person: '赵启明', service: '体检报告深度解读', stage: '已转管理', owner: '赵医生', due: '2026-11-03 16:00', risk: 'medium', next: '纳入血压与体重计划', benefit: '报告解读权益', amount: 680 },
      { id: 'sc9', bookingId: 'BK20261101002', profileId: 'hp8', person: '孙宁', service: '五高筛查', stage: '报告待解读', owner: '健康管理中心', due: '2026-11-02 09:00', risk: 'medium', next: '尿酸异常解读与计划邀请', benefit: '五高筛查', amount: 1600 },
      { id: 'sc10', bookingId: 'BK20261030001', profileId: 'hp3', person: '周雯', service: '体成分检测', stage: '已结算', owner: '健康管理中心', due: '2026-10-30 10:00', risk: 'low', next: '季度复测提醒', benefit: '体成分 4 次', amount: 400 }
    ],

    exceptions: [
      { id: 'ex1', caseId: 'sc7', type: '报告逾期', severity: 'high', owner: '运营中心', desc: '结营报告超过 48 小时未生成', status: 'open' },
      { id: 'ex2', caseId: 'sc2', type: '待确认超时', severity: 'medium', owner: '健康管理中心', desc: '预约提交 18 小时仍未确认', status: 'open' },
      { id: 'ex3', caseId: 'sc9', type: '异常未解读', severity: 'high', owner: '健康管理中心', desc: '尿酸异常 3 天未完成解读', status: 'open' },
      { id: 'ex4', caseId: 'sc4', type: '随访逾期', severity: 'high', owner: '赵医生', desc: '复查预约逾期 2 天', status: 'open' },
      { id: 'ex5', caseId: 'sc10', type: '结算差异', severity: 'low', owner: '财务', desc: '体成分权益核销与订单金额差 20 元', status: 'resolved' }
    ]
  };

  const fg = S.fivegood;
  fg.memberProfiles = [
    { id: 'fmp1', memberId: 'fm1', name: '林悦', tier: '进阶版', stage: '执行中', coach: '王雪', consent: 'signed', risk: 'medium', tasksDone: 9, tasksDue: 10, streak: 12, lastActive: '2026-11-08', next: '今晚睡眠任务', joined: '2026-03-01' },
    { id: 'fmp2', memberId: 'fm2', name: '陈嘉禾', tier: '基础版', stage: '执行中', coach: '陈放', consent: 'signed', risk: 'medium', tasksDone: 6, tasksDue: 10, streak: 4, lastActive: '2026-11-07', next: '补交饮食记录', joined: '2026-05-12' },
    { id: 'fmp3', memberId: 'fm3', name: '周雯', tier: '尊享版', stage: '优秀', coach: '王雪', consent: 'signed', risk: 'low', tasksDone: 10, tasksDue: 10, streak: 28, lastActive: '2026-11-08', next: '月度报告已生成', joined: '2026-01-08' },
    { id: 'fmp4', memberId: 'fm4', name: '徐一鸣', tier: '进阶版', stage: '风险暂停', coach: '赵医生', consent: 'signed', risk: 'high', tasksDone: 4, tasksDue: 10, streak: 1, lastActive: '2026-11-05', next: '转健康管理计划', joined: '2026-06-20' },
    { id: 'fmp5', memberId: 'fm5', name: '何雨桐', tier: '基础版', stage: '执行中', coach: '陈放', consent: 'signed', risk: 'medium', tasksDone: 7, tasksDue: 10, streak: 7, lastActive: '2026-11-08', next: '压力自评待完成', joined: '2026-08-02' },
    { id: 'fmp6', memberId: 'fm6', name: '赵启明', tier: '进阶版', stage: '低活跃', coach: '王雪', consent: 'signed', risk: 'medium', tasksDone: 3, tasksDue: 10, streak: 0, lastActive: '2026-10-28', next: '电话回访', joined: '2026-04-15' }
  ];

  fg.memberTasks = [
    { id: 'mt1', memberId: 'fmp1', dim: 'eat', week: 4, title: '记录 3 天饮食并标注主食', type: '打卡', points: 10, due: '2026-11-08', status: 'done', evidence: '3 张餐盘照片', reviewed: true },
    { id: 'mt2', memberId: 'fmp1', dim: 'sleep', week: 4, title: '连续 5 天 23:30 前入睡', type: '打卡', points: 10, due: '2026-11-08', status: 'due', evidence: '', reviewed: false },
    { id: 'mt3', memberId: 'fmp2', dim: 'move', week: 4, title: '完成 3 次 30 分钟中等强度运动', type: '打卡', points: 15, due: '2026-11-08', status: 'due', evidence: '', reviewed: false },
    { id: 'mt4', memberId: 'fmp3', dim: 'mind', week: 4, title: '完成一次压力自评', type: '评估', points: 10, due: '2026-11-07', status: 'done', evidence: 'PSS-10 已完成', reviewed: true },
    { id: 'mt5', memberId: 'fmp4', dim: 'check', week: 4, title: '完成年度体检预约', type: '动作', points: 20, due: '2026-11-06', status: 'missed', evidence: '', reviewed: false },
    { id: 'mt6', memberId: 'fmp5', dim: 'mind', week: 4, title: '完成一次压力自评', type: '评估', points: 10, due: '2026-11-09', status: 'due', evidence: '', reviewed: false },
    { id: 'mt7', memberId: 'fmp6', dim: 'eat', week: 3, title: '一周外卖不超过 3 次', type: '打卡', points: 10, due: '2026-10-31', status: 'missed', evidence: '', reviewed: false },
    { id: 'mt8', memberId: 'fmp2', dim: 'eat', week: 4, title: '把 1 餐精制主食换成杂粮', type: '打卡', points: 10, due: '2026-11-07', status: 'done', evidence: '1 张午餐照片', reviewed: true },
    { id: 'mt9', memberId: 'fmp3', dim: 'move', week: 4, title: '尝试 1 种新运动', type: '打卡', points: 15, due: '2026-11-08', status: 'done', evidence: '攀岩照片', reviewed: true },
    { id: 'mt10', memberId: 'fmp4', dim: 'sleep', week: 4, title: '记录 5 天睡眠时长', type: '打卡', points: 10, due: '2026-11-07', status: 'missed', evidence: '', reviewed: false },
    { id: 'mt11', memberId: 'fmp5', dim: 'move', week: 4, title: '完成 3 次 20 分钟快走', type: '打卡', points: 15, due: '2026-11-08', status: 'done', evidence: '步数截图', reviewed: true },
    { id: 'mt12', memberId: 'fmp1', dim: 'eat', week: 4, title: '把 1 餐精制主食换成杂粮', type: '打卡', points: 10, due: '2026-11-06', status: 'done', evidence: '杂粮饭照片', reviewed: true }
  ];

  fg.checkins = [
    { id: 'ck1', taskId: 'mt8', memberId: 'fmp2', name: '陈嘉禾', dim: 'eat', title: '午餐杂粮替换', at: '2026-11-08 12:20', status: 'pending', evidence: '餐盘照片', note: '看起来主食仍是白米饭，需确认。', coach: '陈放' },
    { id: 'ck2', taskId: 'mt11', memberId: 'fmp5', name: '何雨桐', dim: 'move', title: '30 分钟快走', at: '2026-11-08 07:40', status: 'pending', evidence: '运动截图', note: '步数 3,600，心率区间未显示。', coach: '陈放' },
    { id: 'ck3', taskId: 'mt2', memberId: 'fmp1', name: '林悦', dim: 'sleep', title: '23:30 前入睡', at: '2026-11-08 07:10', status: 'pending', evidence: '手环睡眠截图', note: '入睡 23:18，已达标。', coach: '王雪' },
    { id: 'ck4', taskId: 'mt9', memberId: 'fmp3', name: '周雯', dim: 'move', title: '尝试新运动', at: '2026-11-07 19:30', status: 'approved', evidence: '攀岩照片', note: '完成质量高，积分已发放。', coach: '王雪' },
    { id: 'ck5', taskId: 'mt5', memberId: 'fmp4', name: '徐一鸣', dim: 'check', title: '年度体检预约', at: '2026-11-05 15:00', status: 'rejected', evidence: '无凭证', note: '未上传预约凭证，退回补充。', coach: '赵医生' },
    { id: 'ck6', taskId: 'mt1', memberId: 'fmp1', name: '林悦', dim: 'eat', title: '饮食记录', at: '2026-11-07 21:10', status: 'approved', evidence: '3 张餐盘照片', note: '记录完整。', coach: '王雪' },
    { id: 'ck7', taskId: 'mt3', memberId: 'fmp2', name: '陈嘉禾', dim: 'move', title: '中等强度运动', at: '2026-11-06 18:20', status: 'approved', evidence: '运动 App 截图', note: '完成 32 分钟。', coach: '陈放' },
    { id: 'ck8', taskId: 'mt7', memberId: 'fmp6', name: '赵启明', dim: 'eat', title: '外卖不超过 3 次', at: '2026-10-31 20:00', status: 'rejected', evidence: '无记录', note: '任务逾期且无打卡，计入低活跃。', coach: '王雪' }
  ];

  fg.escalations = [
    { id: 'fe1', memberId: 'fmp4', name: '徐一鸣', signal: '五维总分 53.6，睡眠 48，体检 50', level: 'high', from: '五好评分', action: '转入五高一重共管 + 随访', status: 'open', at: '2026-11-06' },
    { id: 'fe2', memberId: 'fmp6', name: '赵启明', signal: '连续 11 天无任务完成', level: 'medium', from: '活跃度', action: '电话回访 + 降低任务门槛', status: 'open', at: '2026-11-05' },
    { id: 'fe3', memberId: 'fmp1', name: '林悦', signal: '睡眠维度连续 2 周低于 65 分', level: 'medium', from: '睡好', action: '推荐睡眠改善计划', status: 'converted', at: '2026-11-03' },
    { id: 'fe4', memberId: 'fmp5', name: '何雨桐', signal: 'PSS-10 得分 29，压力偏高', level: 'medium', from: '心好', action: '推送压力管理课程 + EAP 入口', status: 'open', at: '2026-11-07' },
    { id: 'fe5', memberId: 'fmp3', name: '周雯', signal: '无风险，连续 28 天达标', level: 'low', from: '五好评分', action: '邀请成为健康榜样', status: 'converted', at: '2026-11-04' }
  ];

  fg.consents = [
    { id: 'fc1', memberId: 'fmp1', name: '林悦', status: 'signed', at: '2026-03-01', version: 'v3.2', scopes: { health: true, service: true, mind: false, report: true } },
    { id: 'fc2', memberId: 'fmp2', name: '陈嘉禾', status: 'signed', at: '2026-05-12', version: 'v3.2', scopes: { health: true, service: true, mind: false, report: true } },
    { id: 'fc3', memberId: 'fmp3', name: '周雯', status: 'signed', at: '2026-01-08', version: 'v3.0', scopes: { health: true, service: true, mind: false, report: true } },
    { id: 'fc4', memberId: 'fmp4', name: '徐一鸣', status: 'signed', at: '2026-06-20', version: 'v3.2', scopes: { health: true, service: true, mind: false, report: true } },
    { id: 'fc5', memberId: 'fmp5', name: '何雨桐', status: 'signed', at: '2026-08-02', version: 'v3.2', scopes: { health: true, service: true, mind: true, report: true } },
    { id: 'fc6', memberId: 'fmp6', name: '赵启明', status: 'pending', at: '', version: 'v3.2', scopes: { health: false, service: true, mind: false, report: false } }
  ];

  fg.ops = {
    releaseDay: '周一',
    taskWindow: 7,
    reviewSLA: 24,
    autoNudge: true,
    lowActivityDays: 7,
    riskEscalation: true,
    nutritionReview: true,
    mindPrivacy: true,
    reportAnonymize: true,
    retention: '服务结束后 24 个月',
    lastRelease: '2026-11-03',
    nextRelease: '2026-11-10'
  };
})();
