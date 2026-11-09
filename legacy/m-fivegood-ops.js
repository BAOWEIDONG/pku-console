/* ============================================================================
   五好生活 · 五维运营台（吃/睡/动/心/查）+ 推荐规则中心
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const FG = () => Store.db.fivegood;
  const DIM = (k) => FG().dims.find((d) => d.key === k) || FG().dims[0];

  function dimHead(key, extra) {
    const d = DIM(key);
    return '<div class="panel" style="padding:14px 16px;margin-bottom:16px;border-left:3px solid ' + d.color + '">' +
      '<div class="row" style="gap:10px"><span style="font-size:20px">' + d.icon + '</span>' +
      '<div style="flex:1"><div class="row" style="gap:8px"><b style="font-size:13.5px">' + E(d.name) + '</b>' +
      '<span class="small mut">权重 ' + d.weight + '% · 目标 ' + E(d.metric) + ' ' + d.target + '</span></div>' +
      '<div class="small mut" style="margin-top:3px">数据来源：' + E(d.dataSource) + ' · 评估：' + E(d.assess) + '</div></div>' +
      (extra || '') + '</div></div>';
  }
  function ruleRow(r, onAct) {
    return '<div class="listrow"><div class="meta"><b>' + E(r.name) + '</b><span>' + E(r.when) + '</span></div>' +
      '<div class="right row" style="gap:8px">' + (r.svc ? '<span class="pill blue">' + E(r.svc) + '</span>' : '') +
      '<button class="switch ' + (r.on ? 'on' : '') + '" data-act="' + onAct + '" data-id="' + r.id + '"></button></div></div>';
  }

  /* ------------------------------------------------------------- 吃好 */
  P['fg-eat'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '吃好 · 食谱与推荐', sub: '食谱库 + 按人群自动推荐 + 客户可换可搭', preview: 'emp-home',
    render() {
      const rs = Store.db.recipes, rules = Store.db.eatRules;
      return K.head('吃好 · 食谱与推荐', '6 个食谱 · ' + rules.filter((r) => r.on).length + ' 条推荐规则 · 本月执行 5,660 餐',
        K.btn('新增食谱', 'newRecipe', { icon: 'plus', cls: 'primary' })) +
        dimHead('eat', '<button class="btn sm" data-act="goReco">推荐规则中心 ›</button>') +
        K.kpis([
          { k: '食谱库', v: rs.length, unit: '个', d: '在架 ' + rs.filter((r) => r.on).length, icon: 'package' },
          { k: '本月执行', v: '5,660', unit: '餐', d: '推荐采纳率 64%', tone: 'up', icon: 'check' },
          { k: '自搭占比', v: '31', unit: '%', d: '客户自行组合', icon: 'sliders' },
          { k: '转化到服务', v: 86, unit: '人', d: '食谱 → 减重营/五高', tone: 'up', icon: 'target' }
        ]) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '食谱库', sub: '按餐次与标签筛选', flush: true, body: UI.table([
            { label: '食谱', render: (r) => '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.tags.join(' · ')) + '</div></div>' },
            { label: '餐次', render: (r) => UI.pill(r.meal, 'grey') },
            { label: '热量', align: 'right', render: (r) => '<span class="tnum">' + r.kcal + '</span><span class="small mut"> kcal</span>' },
            { label: '蛋白', align: 'right', render: (r) => '<span class="tnum small">' + r.p + 'g</span>' },
            { label: '执行', align: 'right', render: (r) => '<span class="tnum">' + r.used + '</span>' },
            { label: '上架', render: (r) => '<button class="switch ' + (r.on ? 'on' : '') + '" data-toggle="recipes.' + UI.ix(rs, r) + '.on"></button>' }
          ], rs.map((r) => Object.assign({ _id: r.id }, r))) }) +
          K.panel({ title: '推荐规则', sub: '条件命中后自动出现在客户今日菜单', flush: true,
            body: '<div style="padding:4px 18px 12px">' + rules.map((r) => ruleRow(r, 'toggleRule')).join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '客户怎么选', body: '<div class="stack" style="gap:10px">' +
            [['推荐菜单', '系统按档案与当日打卡给出 3 个可选食谱', '70%'],
             ['一键替换', '同类目等热量替换（如鸡胸换鱼）', '22%'],
             ['自由搭配', '从食材库自选，系统实时算热量与结构', '31%']].map((x) =>
              '<div><div class="row small" style="justify-content:space-between"><span>' + x[0] + '</span><b class="tnum">' + x[2] + '</b></div>' +
              '<div class="small mut" style="margin-top:2px">' + x[1] + '</div></div>').join('') +
            '</div><div class="note" style="margin-top:12px">替换与自搭都会回写执行数据，用于调整推荐权重。</div>' }) +
          K.panel({ title: '联动服务', body: '<div class="small mut" style="line-height:1.9">食谱执行 2 周仍不达标 → 推荐减重训练营；血糖异常 → 推荐五高一重共管。</div>' +
            '<div style="margin-top:10px"><button class="btn sm" data-act="goReco">查看规则</button></div>' }) +
        '</div></div>';
    },
    actions: {
      newRecipe() {
        UI.formDrawer({ title: '新增食谱', sub: '选择为主，减少填写', icon: 'package', section: '基础信息',
          fields: [
            { key: 'name', label: '食谱名称', ph: '如 杂粮鸡胸便当' },
            { key: 'meal', label: '餐次', type: 'select', options: ['早餐', '午餐', '晚餐', '加餐'] },
            { key: 'kcal', label: '热量（kcal）', type: 'num', value: 450 },
            { key: 'p', label: '蛋白质（g）', type: 'num', value: 30 },
            { key: 'tags', label: '标签', type: 'select', options: ['高蛋白', '低GI', '低脂', '素食', '快手', '外卖友好'] },
            { key: 'on', label: '立即上架', type: 'bool', value: true }
          ],
          onSave(v) { Store.pushItem('recipes', { id: 'r' + Date.now(), name: v.name || '新食谱', meal: v.meal, kcal: v.kcal, p: v.p, c: 40, f: 12, tags: [v.tags], avoid: [], cost: 30, on: v.on, used: 0 }, '新增食谱'); UI.toast('食谱已创建'); App.refresh(); } });
      },
      toggleRule(d) { const r = Store.db.eatRules.find((x) => x.id === d.id); Store.set('eatRules.' + UI.ix(Store.db.eatRules, r) + '.on', !r.on, '推荐规则'); App.refresh(); },
      goReco() { App.go('fg-reco'); }
    }
  };

  /* ------------------------------------------------------------- 睡好 */
  P['fg-sleep'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '睡好 · 数据与干预', sub: '设备同步 + 手动记录 + 量表，三路取数', preview: 'emp-home',
    render() {
      const src = Store.db.sleepSources, rules = Store.db.sleepRules;
      return K.head('睡好 · 数据与干预', src.filter((s) => s.on).length + ' 个数据源 · 人均睡眠 6.4 小时',
        K.btn('推荐设置', 'goReco', { icon: 'sliders' })) +
        dimHead('sleep') +
        K.kpis([
          { k: '数据覆盖率', v: '72', unit: '%', d: '手环 38% · 手动 31%', icon: 'activity' },
          { k: '平均睡眠', v: '6.4', unit: '小时', d: '目标 7 小时', tone: 'down', icon: 'clock' },
          { k: '入睡困难占比', v: '34', unit: '%', d: '较上月 -3pt', tone: 'up', icon: 'eye' },
          { k: '睡眠服务转化', v: 42, unit: '人', d: '监测 12 · 课程 30', icon: 'target' }
        ]) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '数据来源', sub: '打开即开始采数', flush: true, body: '<div style="padding:4px 18px 12px">' +
            src.map((s) => '<div class="listrow"><div class="meta"><b>' + E(s.name) + ' <span class="pill grey" style="margin-left:4px">' + E(s.type) + '</span></b><span>' + E(s.desc) + '</span></div>' +
              '<div class="right row" style="gap:10px"><span class="small mut tnum">覆盖 ' + E(s.cover) + '</span><button class="switch ' + (s.on ? 'on' : '') + '" data-toggle="sleepSources.' + UI.ix(src, s) + '.on"></button></div></div>').join('') + '</div>' }) +
          K.panel({ title: '推荐策略', sub: '命中即推送，转化到服务', flush: true, body: '<div style="padding:4px 18px 12px">' +
            rules.map((r) => '<div class="listrow"><div class="meta"><b>' + E(r.name) + '</b><span>' + E(r.when) + ' → ' + E(r.then) + '</span></div>' +
              '<div class="right row" style="gap:8px">' + (r.svc ? '<span class="pill blue">' + E(r.svc) + '</span>' : '') + '<button class="switch ' + (r.on ? 'on' : '') + '" data-toggle="sleepRules.' + UI.ix(rules, r) + '.on"></button></div></div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '数据怎么来', body: '<div class="small mut" style="line-height:1.9">' +
            '· 手环：授权后每晚自动同步入睡/醒来/深睡<br>· 手机：iOS 健康、安卓 Health Connect<br>· 手动：睡前点「准备睡了」，起床点「起床」<br>· 量表：PSQI 月度、ISI 双周<br>· 医疗级：多导睡眠监测（需预约）</div>' }) +
          K.panel({ title: '干预阶梯', body: '<div class="stack" style="gap:8px">' +
            [['① 科普 + 作息计划', '入睡困难早期'], ['② CBT-I 失眠课程', '持续 2 周以上'], ['③ 睡眠门诊 / 监测', '疑似呼吸暂停'], ['④ 呼吸机与随访', '确诊后']].map((x) =>
              '<div class="row small"><span class="mut" style="width:120px">' + x[0] + '</span><span>' + x[1] + '</span></div>').join('') + '</div>' }) +
        '</div></div>';
    },
    actions: { goReco() { App.go('fg-reco'); } }
  };

  /* ------------------------------------------------------------- 动好 */
  P['fg-move'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '动好 · 处方与 DIY', sub: '按能力给处方，也允许客户自己组', preview: 'emp-home',
    render() {
      const plans = Store.db.exercisePlans;
      return K.head('动好 · 处方与 DIY', plans.length + ' 套处方 · 本月运动 12,480 人次',
        K.btn('新增处方', 'newPlan', { icon: 'plus', cls: 'primary' })) +
        dimHead('move') +
        '<div class="grid g-2"><div class="stack">' +
          K.panel({ title: '运动处方', sub: '按等级与关节条件匹配', flush: true, body: '<div style="padding:4px 18px 12px">' +
            plans.map((p) => '<div class="listrow"><div class="meta"><b>' + E(p.name) + '</b><span>' + E(p.goal) + ' · ' + E(p.freq) + ' · ' + E(p.items.join(' / ')) + '</span></div>' +
              '<div class="right row" style="gap:8px"><span class="pill grey">' + p.level + '</span><span class="small mut">' + p.joined + ' 人</span>' +
              '<button class="switch ' + (p.on ? 'on' : '') + '" data-toggle="exercisePlans.' + UI.ix(plans, p) + '.on"></button></div></div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: 'DIY 组合', body: '<div class="small mut" style="line-height:1.9">客户从动作库勾选 3–5 个动作 + 每周频次，系统自动校验：<br>· 关节风险（膝/腰）<br>· 强度是否超等级<br>· 是否覆盖目标肌群</div>' +
            '<div class="chips" style="margin-top:10px">' + ['快走', '慢跑', '游泳', '力量', '瑜伽', '拉伸'].map((x) => '<span class="chip">' + x + '</span>').join('') + '</div>' +
            '<div class="note teal" style="margin-top:12px">DIY 组合保存后进入教练审核队列，通过即可执行。</div>' }) +
          K.panel({ title: '与服务联动', body: '<div class="small mut" style="line-height:1.9">依从性连续 2 周 < 50% → 推荐康复师 1v1；关节疼痛 → 推荐康复评估；体测异常 → 推荐 CPET。</div>' }) +
        '</div></div>';
    },
    actions: {
      newPlan() {
        UI.formDrawer({ title: '新增运动处方', sub: '选择即可，不用写方案', icon: 'run',
          fields: [
            { key: 'name', label: '处方名称' },
            { key: 'level', label: '适用等级', type: 'select', options: ['L1 零基础', 'L2 进阶', 'L3 高强度'] },
            { key: 'goal', label: '目标', type: 'select', options: ['建立习惯', '减重', '体成分', '缓解酸痛'] },
            { key: 'freq', label: '频次', type: 'select', options: ['每周 3 次 × 20 分钟', '每周 4 次 × 40 分钟', '每天 2 次 × 10 分钟'] },
            { key: 'items', label: '动作', type: 'select', options: ['快走', '慢跑', '力量', '瑜伽', '拉伸'] }
          ],
          onSave(v) { Store.pushItem('exercisePlans', { id: 'ep' + Date.now(), name: v.name || '新处方', level: v.level.slice(0, 2), goal: v.goal, freq: v.freq, items: [v.items], joints: '常规', on: true, joined: 0 }, '新增处方'); UI.toast('处方已创建'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------------- 心好 */
  P['fg-mind'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '心好 · 数据从哪来', sub: '轻量情绪打卡 + 标准量表 + 服务使用，不做隐私越界', preview: 'emp-home',
    render() {
      const cks = Store.db.mindCheckins, rules = Store.db.mindRules;
      return K.head('心好 · 数据从哪来', '4 种采集方式 · 全部可授权关闭',
        K.btn('隐私边界说明', 'privacy', { icon: 'lock' })) +
        dimHead('mind') +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '采集方式', flush: true, body: '<div style="padding:4px 18px 12px">' +
            cks.map((c) => '<div class="listrow"><div class="meta"><b>' + E(c.name) + ' <span class="pill grey" style="margin-left:4px">' + E(c.type) + '</span></b><span>' + E(c.freq) + ' · ' + E(c.items) + ' · ' + E(c.privacy) + '</span></div>' +
              '<div class="right row" style="gap:10px"><span class="small mut tnum">参与 ' + E(c.rate) + '</span><button class="switch ' + (c.on ? 'on' : '') + '" data-toggle="mindCheckins.' + UI.ix(cks, c) + '.on"></button></div></div>').join('') + '</div>' }) +
          K.panel({ title: '推荐与干预', sub: '先关怀，后推荐', flush: true, body: '<div style="padding:4px 18px 12px">' +
            rules.map((r) => '<div class="listrow"><div class="meta"><b>' + E(r.name) + (r.urgent ? ' <span class="pill red">高优先级</span>' : '') + '</b><span>' + E(r.when) + ' → ' + E(r.then) + '</span></div>' +
              '<div class="right row" style="gap:8px">' + (r.svc ? '<span class="pill blue">' + E(r.svc) + '</span>' : '') + '<button class="switch ' + (r.on ? 'on' : '') + '" data-toggle="mindRules.' + UI.ix(rules, r) + '.on"></button></div></div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '怎么拿到数据（三个层次）', body: '<div class="stack" style="gap:12px">' +
            [['轻量', '每日 1 次情绪打卡：5 档表情 + 原因标签，3 秒完成', '#0aa39a'],
             ['标准', 'PHQ-2 / GAD-2 / PSS-10，双周或月度，10 题以内', '#0b63e5'],
             ['行为', '是否预约 EAP、是否参加正念课，只看行为不看内容', '#c8871a']].map((x) =>
              '<div style="border-left:2px solid ' + x[2] + ';padding-left:10px"><b style="font-size:12px">' + x[0] + '</b>' +
              '<div class="small mut" style="margin-top:2px">' + x[1] + '</div></div>').join('') +
            '</div>' }) +
          K.panel({ title: '隐私红线', body: '<div class="small mut" style="line-height:1.9">' +
            '· 个人情绪与量表结果仅本人可见，咨询师需本人授权<br>· 企业侧只看部门匿名分布，且样本 ≥10 人才出图<br>· 不做聊天内容分析、不做人脸/语音情绪识别<br>· 高危触发只做服务引导，不出具诊断结论</div>' +
            '<div class="note warn" style="margin-top:10px">任何向企业侧的呈现都必须脱敏到部门级。</div>' }) +
        '</div></div>';
    },
    actions: {
      privacy() { UI.modal({ title: '心理数据隐私边界', desc: '这是产品红线，不是配置项',
        body: '<div class="small" style="line-height:1.9">1. 情绪打卡与量表结果属于敏感个人信息，仅本人可查看完整记录。<br>2. EAP 咨询内容不进入任何后台，后台只记录「已使用/未使用」。<br>3. 企业报告只呈现部门级分布，样本不足 10 人不展示。<br>4. 高危识别仅用于触发关怀与服务引导，不生成诊断或风险标签对外使用。<br>5. 员工可随时关闭采集，关闭后不再产生新数据。</div>',
        okText: '知道了', cancelText: false }); }
    }
  };

  /* ------------------------------------------------------------- 查好 */
  P['fg-check'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '查好 · 体检与检后', sub: '套餐推荐 → 报告解读 → 复查转诊，一条链', preview: 'emp-detail',
    render() {
      const plans = Store.db.checkupPlans, flow = Store.db.checkFlow;
      return K.head('查好 · 体检与检后', plans.length + ' 个体检套餐 · 检后转化 18.6%',
        K.btn('新增套餐', 'newPlan', { icon: 'plus', cls: 'primary' })) +
        dimHead('check') +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '体检套餐', flush: true, body: UI.table([
            { label: '套餐', render: (p) => '<div><div class="strong">' + E(p.name) + '</div><div class="small muted">' + E(p.audience) + '</div></div>' },
            { label: '包含项', render: (p) => '<span class="small mut">' + p.items.length + ' 项</span>' },
            { label: '售价', align: 'right', render: (p) => '<b class="tnum">¥' + p.price + '</b>' },
            { label: '结算', align: 'right', render: (p) => '<span class="tnum muted">¥' + p.settle + '</span>' },
            { label: '上架', render: (p) => '<button class="switch ' + (p.on ? 'on' : '') + '" data-toggle="checkupPlans.' + UI.ix(plans, p) + '.on"></button>' }
          ], plans.map((p) => Object.assign({ _id: p.id }, p))) }) +
          K.panel({ title: '检后链路', sub: '每一步都可挂服务', body: '<div class="stack" style="gap:0">' +
            flow.map((f, i) => '<div class="row" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--line-2)">' +
              '<div class="ava" style="width:24px;height:24px;font-size:11px;border-radius:7px">' + (i + 1) + '</div>' +
              '<div style="flex:1"><b style="font-size:12.5px">' + E(f.name) + '</b><div class="small mut" style="margin-top:2px">' + E(f.items.join(' · ')) + '</div></div>' +
              (f.svc ? '<span class="pill blue">' + E(f.svc) + '</span>' : '<span class="small mut">—</span>') + '</div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '推荐逻辑', body: '<div class="small mut" style="line-height:1.9">' +
            '· 按年龄 / 性别 / 家族史匹配套餐<br>· 报告异常 ≥1 项 → 推深度解读<br>· 异常 ≥2 项且 30 天未复查 → 推就医快通<br>· 连续两年异常 → 推五高一重共管</div>' }) +
          K.panel({ title: '转化数据', body: '<div class="stack" style="gap:12px">' +
            [['体检 → 报告解读', 62], ['报告解读 → 复查', 38], ['复查 → 就医快通', 21], ['异常 → 五高共管', 18]].map((x) =>
              '<div><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%"></b></div></div>').join('') + '</div>' }) +
        '</div></div>';
    },
    actions: {
      newPlan() {
        UI.formDrawer({ title: '新增体检套餐', sub: '选择人群与项目', icon: 'stethoscope',
          fields: [
            { key: 'name', label: '套餐名称' },
            { key: 'audience', label: '适用人群', type: 'select', options: ['全员 · 每年 1 次', '40 岁以上 / 高危', '女性职工', '高管 / 企业家'] },
            { key: 'price', label: '售价', type: 'num', value: 980 },
            { key: 'settle', label: '结算价', type: 'num', value: 760 }
          ],
          onSave(v) { Store.pushItem('checkupPlans', { id: 'cp' + Date.now(), name: v.name || '新套餐', audience: v.audience, items: ['基础项'], price: v.price, settle: v.settle, upsell: [], on: true }, '新增套餐'); UI.toast('套餐已创建'); App.refresh(); } });
      }
    }
  };

  /* --------------------------------------------------- 推荐规则中心 */
  P['fg-reco'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '推荐规则中心', sub: '五维信号 → 内容或服务，一处配置全局生效', preview: 'emp-home',
    render() {
      const rules = Store.db.recoRules;
      const on = rules.filter((r) => r.on);
      return K.head('推荐规则中心', on.length + ' 条生效规则 · 覆盖 5 个维度',
        K.btn('新增规则', 'newRule', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '生效规则', v: on.length, unit: '条', d: '草稿 ' + (rules.length - on.length) + ' 条', icon: 'target' },
          { k: '本月曝光', v: '3.1', unit: '万', d: '五维合计', icon: 'eye' },
          { k: '平均点击率', v: '8.4', unit: '%', d: '服务类比内容类高 2pt', tone: 'up', icon: 'chart' },
          { k: '服务转化', v: '1,284', unit: '人', d: '推荐 → 预约', tone: 'up', icon: 'check' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '维度', render: (r) => UI.pill(DIM(r.dim).name, 'grey') },
          { label: '规则', render: (r) => '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.when) + '</div></div>' },
          { label: '推荐对象', render: (r) => E(r.target) },
          { label: '类型', render: (r) => UI.pill(r.type, r.type.indexOf('服务') >= 0 ? 'blue' : 'green') },
          { label: '位置', render: (r) => '<span class="small">' + E(r.slot) + '</span>' },
          { label: '曝光 / 点击', align: 'right', render: (r) => '<span class="tnum small">' + (r.exp ? (r.exp / 1000).toFixed(1) + 'k' : '—') + '</span><div class="small muted tnum">' + E(r.ctr) + '</div>' },
          { label: '启用', render: (r) => '<button class="switch ' + (r.on ? 'on' : '') + '" data-toggle="recoRules.' + UI.ix(rules, r) + '.on"></button>' },
          { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="editRule" data-id="' + r.id + '">' + I('edit', 14) + '</button></div>' }
        ], rules.map((r) => Object.assign({ _id: r.id }, r))) }) +
        '<div class="grid g-3" style="margin-top:16px">' +
          [['信号从哪来', '打卡、量表、体检报告、服务使用行为，全部来自五维数据源。'],
           ['推荐什么', '优先推荐服务（可履约、可结算），其次推荐内容与课程。'],
           ['怎么衡量', '曝光、点击、预约转化三档，按周复盘，低效规则自动降权。']].map((x) =>
            '<div class="panel" style="padding:14px"><b style="font-size:12.5px">' + x[0] + '</b><div class="small mut" style="margin-top:4px;line-height:1.7">' + x[1] + '</div></div>').join('') +
        '</div>';
    },
    actions: {
      newRule() {
        UI.formDrawer({ title: '新增推荐规则', sub: '选条件、选对象，不写表达式', icon: 'target', section: '规则',
          fields: [
            { key: 'name', label: '规则名称' },
            { key: 'dim', label: '所属维度', type: 'select', options: FG().dims.map((d) => ({ v: d.key, l: d.name })) },
            { key: 'when', label: '触发条件', type: 'select', options: ['BMI ≥ 28', 'ISI ≥ 15', '周运动 < 2 次', 'PSS-10 ≥ 27', '报告异常 ≥ 1 项'] },
            { key: 'type', label: '推荐类型', type: 'select', options: ['服务', '内容', '内容 + 服务'] },
            { key: 'target', label: '推荐服务', type: 'select', options: Store.db.employee.services.slice(0, 10).map((s) => ({ v: s.name, l: s.name })) },
            { key: 'slot', label: '展示位置', type: 'select', options: ['首页卡片', '维度页底部', '报告页弹层', '消息推送'] }
          ],
          onSave(v) { Store.pushItem('recoRules', { id: 'rc' + Date.now(), dim: v.dim, name: v.name || '新规则', when: v.when, target: v.target, type: v.type, slot: v.slot, priority: 3, on: true, exp: 0, ctr: '—' }, '新增推荐规则'); UI.toast('规则已创建'); App.refresh(); } });
      },
      editRule(d) { UI.toast('编辑规则：' + (Store.db.recoRules.find((r) => r.id === d.id) || {}).name); }
    }
  };
})();
