/* ============================================================================
   v7 — 健康管理 / 五好生活深度运营
   体检服务 → 履约 → 异常 → 风险分层 → 管理计划 → 随访 → 结果评估
   五好会员 → 任务 → 打卡审核 → 信号升级 → 健康计划 → 权益与报告
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const SEED = window.SEED;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const H = () => Store.db.health;
  const FG = () => Store.db.fivegood;
  const nf = (n) => Number(n == null ? 0 : n).toLocaleString('zh-CN');
  const pct = (n) => Math.max(0, Math.min(100, Math.round(n))) + '%';

  const RISK = {
    critical: ['极高', 'red'], high: ['高', 'red'], medium: ['中', 'amber'], low: ['低', 'green']
  };
  const PLAN_ST = {
    active: ['执行中', 'green'], paused: ['已暂停', 'grey'], completed: ['已完成', 'blue'], draft: ['草稿', 'grey']
  };
  const FU_ST = {
    due: ['今日到期', 'amber'], upcoming: ['待跟进', 'blue'], overdue: ['已逾期', 'red'], completed: ['已完成', 'green']
  };
  const STAGE = ['待确认', '已预约', '已签到', '履约中', '报告待解读', '已转管理', '已结算'];
  const STAGE_HINT = {
    '待确认': '核权益、核资格、确认时间',
    '已预约': '发送检前提醒与准备事项',
    '已签到': '现场接待，记录异常即时提示',
    '履约中': '服务执行，采集过程与结果',
    '报告待解读': '生成报告，异常项分级',
    '已转管理': '建立计划，安排首次随访',
    '已结算': '权益核销、结算与回访'
  };

  function profileOf(id) { return H().profiles.find((p) => p.id === id) || {}; }
  function planOf(id) { return H().carePlans.find((p) => p.id === id) || {}; }
  function profileName(id) { const p = profileOf(id); return p.name || '—'; }
  function riskPill(level) { const r = RISK[level] || RISK.low; return UI.pill(r[0], r[1]); }
  function programOf(id) { return H().programs.find((p) => p.id === id) || {}; }
  function riskCount(level) { return H().profiles.filter((p) => p.risk === level).length; }
  function activePlanOf(pid) { return H().carePlans.find((p) => p.profileId === pid && p.status === 'active'); }
  function memberProfileOf(memberId) { return FG().memberProfiles.find((m) => m.memberId === memberId || m.id === memberId) || {}; }
  function tierOf(memberId) { const m = FG().members.find((x) => x.id === memberId); return m ? m.tier : '—'; }
  function pMetrics(p) {
    const m = p.metrics || {};
    return m;
  }
  function fmtMetric(k, v) {
    if (k === 'bpSys') return v + '/' + (pMetrics({ metrics: {} }).bpDia || '');
    return v;
  }
  function touch(name, channel, title, status) {
    Store.pushItem('shared.touches', {
      id: 'tc' + Date.now() + Math.floor(Math.random() * 90), holder: name,
      channel: channel || '企业微信', tpl: title || '健管提醒', title: title || '健管提醒',
      at: '2026-11-08 09:30', status: status || '已送达'
    }, '健康触达');
  }
  function log(action, name, desc) {
    Store.pushItem('shared.touches', {
      id: 'au' + Date.now() + Math.floor(Math.random() * 90), holder: name || '系统',
      channel: '审计', tpl: action, title: desc || action, at: '2026-11-08 09:30', status: '已记录'
    }, '操作记录');
  }
  function newPlan(pid, templateId, owner) {
    const p = profileOf(pid), tpl = H().planTemplates.find((t) => t.id === templateId) || H().planTemplates[0];
    const start = '2026-11-08';
    const end = '2027-' + (tpl.weeks >= 12 ? '01-31' : '12-31');
    const plan = {
      id: 'cp' + Date.now(), profileId: pid, name: tpl.name, templateId: tpl.id,
      goal: tpl.goal, owner: owner || p.owner || '健康管理部', start: start, end: end,
      week: 1, status: 'active', adherence: 0, nextReview: '2026-11-15', service: tpl.service,
      milestones: (tpl.tasks || []).map((t, i) => ({ w: i + 1, t: t, done: false }))
    };
    Store.pushItem('health.carePlans', plan, '新建管理计划');
    return plan;
  }
  function newFollowup(pid, planId, type, due, owner, note) {
    const f = {
      id: 'fu' + Date.now(), profileId: pid, planId: planId || '',
      type: type || '计划随访', due: due || '2026-11-15', time: '10:00',
      channel: '企业微信', owner: owner || profileOf(pid).owner || '健康管理部',
      status: 'upcoming', priority: 'normal', note: note || ''
    };
    Store.pushItem('health.followups', f, '新建随访');
    return f;
  }
  function advanceStage(c) {
    const i = STAGE.indexOf(c.stage);
    return i < 0 || i >= STAGE.length - 1 ? c.stage : STAGE[i + 1];
  }
  function memberDims(mid) {
    const m = FG().members.find((x) => x.id === mid);
    return m ? m.dims : {};
  }
  function memberScore(mid) {
    const m = FG().members.find((x) => x.id === mid);
    return m ? m.score : 0;
  }

  const V7 = {
    ensure() {
      const db = Store.db;
      let changed = false;
      if (!db.health) { db.health = clone(SEED.health); changed = true; }
      if (db.health) {
        ['profiles', 'riskRules', 'planTemplates', 'carePlans', 'followups', 'programs', 'enrollments', 'outcomes', 'serviceCases', 'exceptions'].forEach((k) => {
          if (!db.health[k]) { db.health[k] = clone(SEED.health[k] || []); changed = true; }
        });
        (db.health.serviceCases || []).forEach((c) => {
          if (c.stage === '已完成') { c.stage = '已结算'; changed = true; }
        });
      }
      if (db.fivegood) {
        ['memberProfiles', 'memberTasks', 'checkins', 'escalations', 'consents', 'ops'].forEach((k) => {
          if (!db.fivegood[k]) { db.fivegood[k] = clone(SEED.fivegood[k]); changed = true; }
        });
        const CHECK_TASK = { ck1: 'mt8', ck2: 'mt11', ck3: 'mt2', ck4: 'mt9', ck5: 'mt5', ck6: 'mt1', ck7: 'mt3', ck8: 'mt7' };
        (db.fivegood.checkins || []).forEach((c) => {
          if (!c.taskId && CHECK_TASK[c.id]) { c.taskId = CHECK_TASK[c.id]; changed = true; }
        });
      }
      if (db.meta && parseFloat(db.meta.version) < 7) { db.meta.version = '7.0.0'; changed = true; }
      if (changed) Store.persist();
    }
  };
  window.V7 = V7;

  function healthChain() {
    const steps = [
      { n: '01', t: '服务详情', d: '主图、图文、流程、须知、适用禁忌', r: 'e-services' },
      { n: '02', t: '模块与入口', d: '首页五宫格、分类、推荐位', r: 'e-modules' },
      { n: '03', t: '预约与履约', d: '机构、时段、资格、现场签到', r: 'h-service-flow' },
      { n: '04', t: '风险分层', d: '阈值规则、高风险名单、关怀缺口', r: 'h-risk' },
      { n: '05', t: '管理计划', d: '模板、目标、里程碑、责任人', r: 'h-plans' },
      { n: '06', t: '随访执行', d: '今日、逾期、下一次随访', r: 'h-followups' },
      { n: '07', t: '结果评估', d: '前后指标、改善率、未达标原因', r: 'h-outcomes' },
      { n: '08', t: '企业报告', d: '匿名聚合、部门对比、预算建议', r: 'h-enterprise' }
    ];
    return K.panel({ title: '健康服务配置链路', sub: '八个环节共享同一份服务与人群数据，改一处要顺着链路检查', cls: 'chain-panel',
      actions: K.btn('看功能地图', 'goMap', { cls: 'ghost sm', icon: 'target' }),
      body: '<div class="chain-grid">' + steps.map((x) =>
        '<button class="chain-step" data-act="go" data-id="' + x.r + '"><span class="cs-n">' + x.n + '</span><div><b>' + x.t + '</b><span>' + x.d + '</span></div></button>').join('') +
      '</div><div class="chain-foot"><span class="small mut">关键原则：服务详情中的「适用/禁忌」会进入预约资格校验；报告异常会进入风险与随访；随访结果会回到下一次计划调整。</span>' +
        '<button class="btn sm" data-act="go" data-id="g-coverage">核对前端覆盖 ' + I('chevron', 11) + '</button></div>' });
  }

  /* ============================================================ 健康总览 */
  P['h-overview'] = {
    app: 'employee', title: '健康管理总览', sub: '从一次服务到长期健康结果，管理动作必须闭环',
    render() {
      const h = H();
      const due = h.followups.filter((f) => f.status === 'due').length;
      const overdue = h.followups.filter((f) => f.status === 'overdue').length;
      const high = riskCount('high') + riskCount('critical');
      const active = h.carePlans.filter((p) => p.status === 'active');
      const adherence = Math.round(active.reduce((a, b) => a + b.adherence, 0) / (active.length || 1));
      const openEx = h.exceptions.filter((e) => e.status === 'open');
      let prev = h.serviceCases.length;
      const cumulative = (n) => { prev = Math.min(prev, n); return prev; };
      const funnel = [
        ['预约完成', h.serviceCases.length],
        ['服务履约', cumulative(h.serviceCases.filter((c) => STAGE.indexOf(c.stage) >= 2).length)],
        ['报告生成', cumulative(h.serviceCases.filter((c) => STAGE.indexOf(c.stage) >= 4).length)],
        ['异常识别', cumulative(h.serviceCases.filter((c) => c.risk !== 'low' && STAGE.indexOf(c.stage) >= 4).length)],
        ['纳入管理', cumulative(h.serviceCases.filter((c) => STAGE.indexOf(c.stage) >= 5).length)],
        ['计划执行', cumulative(active.length)],
        ['随访完成', cumulative(h.followups.filter((f) => f.status === 'completed').length)]
      ];
      return K.head('健康管理总览', '把「做过什么服务」变成「健康有没有变好」', 
        K.btn('导出季度报告', 'exportH', { icon: 'download' }) + ' ' + K.btn('进入随访台', 'goFollow', { icon: 'clock', cls: 'primary' }), 'HEALTH / OVERVIEW') +
        healthChain() +
        '<div class="hn-hero"><div class="hn-hero-main"><div class="hn-eyebrow">HEALTH LOOP · 2026 Q4</div><h2>从服务履约到健康结果，一条链管理到底</h2><p>健康管理不是多做几个页面，而是每个异常都能找到责任人、每个计划都有随访、每次随访都有结果、每个结果都能回到下一次决策。</p>' +
          '<div class="hn-chain">' + ['服务', '履约', '异常', '分层', '计划', '随访', '结果'].map((x, i) => '<span class="' + (i < 5 ? 'on' : '') + '">' + x + '</span>' + (i < 6 ? '<i>→</i>' : '')).join('') + '</div></div>' +
          '<div class="hn-hero-score"><b>76</b><span>闭环完整度 / 100</span><em>已打通 5 / 7 个环节</em></div></div>' +
        K.kpis([
          { k: '在管人群', v: h.profiles.length, unit: '人', d: '覆盖 6 个部门', icon: 'users' },
          { k: '高风险', v: high, unit: '人', d: '需 24h 内首次触达', tone: 'down', icon: 'activity' },
          { k: '今日随访', v: due, unit: '项', d: overdue + ' 项已逾期', tone: 'down', icon: 'clock' },
          { k: '计划达成', v: adherence, unit: '%', d: active.length + ' 个计划执行中', tone: 'up', icon: 'target' },
          { k: '服务履约', v: Math.round(h.serviceCases.filter((c) => c.stage === '已结算').length / (h.serviceCases.length || 1) * 100), unit: '%', d: h.exceptions.filter((e) => e.status === 'open').length + ' 个异常待处理', icon: 'check' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '今天必须处理', sub: '按风险与时限排序', flush: true,
            actions: K.btn('全部待办', 'goFollow', { cls: 'ghost sm' }),
            body: '<div style="padding:4px 18px 12px">' +
              h.followups.filter((f) => f.status === 'due' || f.status === 'overdue').sort((a, b) => (a.status === 'overdue' ? -1 : 1)).slice(0, 5).map((f) => {
                const p = profileOf(f.profileId);
                return '<div class="hn-task ' + (f.status === 'overdue' ? 'overdue' : '') + '"><span class="hn-dot"></span><div><b>' + E(f.type) + ' · ' + E(p.name || profileName(f.profileId)) + '</b><span>' + E(f.note || '') + '</span></div>' +
                  '<em>' + f.due + '</em><button class="vmini" data-act="openFollow" data-id="' + f.id + '">处理</button></div>';
              }).join('') + '</div>' }) +
          K.panel({ title: '风险分层', sub: '按规则引擎实时计算', flush: true,
            actions: K.btn('规则中心', 'goRisk', { cls: 'ghost sm' }),
            body: '<div class="hn-riskbars">' + [
              ['critical', '极高风险', '需立即医疗介入'],
              ['high', '高风险', '24 小时内人工触达'],
              ['medium', '中风险', '纳入计划或 7 天内随访'],
              ['low', '低风险', '内容与年度复测']
            ].map((x) => '<div><div class="row small" style="justify-content:space-between"><span><b class="hn-rb ' + x[0] + '"></b>' + x[1] + '</span><b class="tnum">' + riskCount(x[0]) + ' 人</b></div><div class="progress"><b class="' + x[0] + '" style="width:' + Math.min(100, riskCount(x[0]) / 8 * 100) + '%"></b></div><em>' + x[2] + '</em></div>').join('') + '</div>' }) +
        '</div><div style="height:16px"></div>' +
        K.panel({ title: '服务到管理转化', sub: '不是预约量，而是有多少人真正进入管理', body:
          '<div class="hn-funnel">' + funnel.map((x, i) => '<div class="hn-fstep"><span>0' + (i + 1) + '</span><b>' + x[1] + '</b><em>' + x[0] + '</em>' + (i ? '<i>' + Math.round(x[1] / (funnel[i - 1][1] || 1) * 100) + '%</i>' : '<i>入口</i>') + '</div>').join('') + '</div>' }) +
        '<div style="height:16px"></div>' +
        '<div class="grid g-2">' +
          K.panel({ title: '最近异常', sub: '异常不是告警，是管理入口', flush: true,
            body: UI.table([
              { label: '对象', render: (e) => '<b>' + E((h.serviceCases.find((c) => c.id === e.caseId) || {}).person || '—') + '</b>' },
              { label: '异常', render: (e) => '<span class="pill ' + (e.severity === 'high' ? 'red' : 'amber') + '">' + E(e.type) + '</span>' },
              { label: '责任人', render: (e) => E(e.owner) },
              { label: '', align: 'right', render: (e) => '<div class="rowact"><button data-act="resolveEx" data-id="' + e.id + '">' + I('check', 14) + '</button></div>' }
            ], openEx.slice(0, 5)) }) +
          K.panel({ title: '管理动作', sub: '今天最值得做的三件事', body: '<div class="hn-actions">' +
            '<button data-act="quickPlan"><span>' + I('target', 16) + '</span><div><b>给高风险人群建计划</b><em>' + (high - active.length > 0 ? high - active.length : 0) + ' 人尚未进入管理</em></div>' + I('chevron', 14) + '</button>' +
            '<button data-act="quickFollow"><span>' + I('clock', 16) + '</span><div><b>清理逾期随访</b><em>' + overdue + ' 项逾期，优先高优先级</em></div>' + I('chevron', 14) + '</button>' +
            '<button data-act="quickReport"><span>' + I('file', 16) + '</span><div><b>生成本月企业健康报告</b><em>含风险、履约、结果与建议</em></div>' + I('chevron', 14) + '</button></div>' }) +
        '</div>';
    },
    actions: {
      exportH() { UI.toast('健康管理季度报告已导出'); },
      goFollow() { App.go('h-followups'); },
      goRisk() { App.go('h-risk'); },
      openFollow(d) { P['h-followups'].actions.openFollow(d); },
      resolveEx(d) {
        const e = H().exceptions.find((x) => x.id === d.id);
        Store.saveItem('health.exceptions', { id: e.id, status: 'resolved' }, 'id', '异常已处理');
        UI.toast('异常已标记处理'); App.refresh();
      },
      quickPlan() {
        const p = H().profiles.find((x) => x.risk === 'high' && !activePlanOf(x.id));
        if (p) P['h-profiles'].actions.createPlan({ id: p.id });
        else UI.toast('高风险人群均已进入管理');
      },
      quickFollow() { App.go('h-followups'); },
      quickReport() { App.go('h-enterprise'); },
      go(d) { App.go(d.id); },
      goMap() { App.go('g-coverage'); }
    }
  };

  /* ============================================================ 服务履约 */
  P['h-service-flow'] = {
    app: 'employee', title: '健康服务履约台', sub: '预约、履约、报告与管理不是四个系统，而是一条服务链',
    state: { stage: '' },
    render() {
      const h = H();
      const stages = STAGE.map((s) => ({ s: s, n: h.serviceCases.filter((c) => c.stage === s).length }));
      const openEx = h.exceptions.filter((e) => e.status === 'open');
      const st = P['h-service-flow'].state;
      const list = h.serviceCases.filter((c) => !st.stage || c.stage === st.stage);
      return K.head('健康服务履约台', h.serviceCases.length + ' 个服务案例 · ' + openEx.length + ' 个异常待处理',
        K.btn('导出履约清单', 'exportS', { icon: 'download' }), 'HEALTH / SERVICE OPS') +
        '<div class="hn-pipeline">' + stages.map((x, i) => '<button class="hn-stage ' + (st.stage === x.s ? 'on' : '') + '" data-act="filterStage" data-id="' + x.s + '"><span>0' + (i + 1) + '</span><b>' + x.n + '</b><em>' + x.s + '</em><small>' + STAGE_HINT[x.s] + '</small></button>' + (i < stages.length - 1 ? '<i>→</i>' : '')).join('') + '</div>' +
        K.kpis([
          { k: '待确认', v: h.serviceCases.filter((c) => c.stage === '待确认').length, unit: '单', d: '18 小时内确认', tone: 'down' },
          { k: '履约中', v: h.serviceCases.filter((c) => c.stage === '履约中' || c.stage === '已签到').length, unit: '单', d: '今日 4 单到院' },
          { k: '报告待解读', v: h.serviceCases.filter((c) => c.stage === '报告待解读').length, unit: '单', d: '异常 2 单优先', tone: 'down' },
          { k: '已转管理', v: h.serviceCases.filter((c) => c.stage === '已转管理').length, unit: '单', d: '计划已建立' },
          { k: '闭环率', v: '62', unit: '%', d: '目标 80%', tone: 'up' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '服务案例', sub: '按阶段推进，每一步都可追责', flush: true,
            actions: K.btn('新增异常', 'newEx', { icon: 'plus', cls: 'ghost sm' }),
            body: UI.table([
              { label: '对象', render: (c) => '<div class="cellflex">' + UI.avatar(c.person) + '<div><div class="strong">' + E(c.person) + '</div><div class="small muted">' + E(c.service) + '</div></div></div>' },
              { label: '阶段', render: (c) => UI.pill(c.stage, STAGE.indexOf(c.stage) >= 4 ? 'green' : 'blue') },
              { label: '责任人', render: (c) => '<span class="small">' + E(c.owner) + '</span>' },
              { label: '时限', render: (c) => '<span class="small tnum">' + E(c.due) + '</span>' },
              { label: '下一步', render: (c) => '<span class="small mut clip">' + E(c.next) + '</span>' },
              { label: '查看', align: 'right', render: (c) => '<div class="rowact"><button data-act="viewCase" data-id="' + c.id + '" title="查看服务案例">' + I('eye', 13) + '</button><button data-act="advanceCase" data-id="' + c.id + '" title="推进">' + I('chevron', 14) + '</button><button data-act="caseToPlan" data-id="' + c.id + '" title="转管理">' + I('target', 14) + '</button></div>' }
            ], list.map((c) => Object.assign({ _id: c.id, _act: 'viewCase' }, c))) }) +
          '<div class="stack">' +
            K.panel({ title: '履约前置检查', sub: '缺口在预约前暴露', body: '<div class="hn-checks">' +
              [['权益校验', 8, '1 人权益不足'], ['知情同意', 7, '1 人待签署'], ['风险问卷', 6, '2 人未完成'], ['空腹/准备', 5, '1 单需提醒'], ['禁忌核对', 9, '全部通过']].map((x) =>
                '<div><span>' + (x[1] === 9 ? I('check', 13) : I('clock', 13)) + '</span><div><b>' + x[0] + '</b><em>' + x[2] + '</em></div><strong>' + x[1] + '/9</strong></div>').join('') + '</div>' }) +
            K.panel({ title: '履约异常', sub: '需人工介入', flush: true, body: '<div style="padding:4px 18px 12px">' + openEx.map((e) =>
              '<div class="hn-task ' + (e.severity === 'high' ? 'overdue' : '') + '"><span class="hn-dot"></span><div><b>' + E(e.type) + '</b><span>' + E(e.desc) + '</span></div><button class="vmini" data-act="resolveExFlow" data-id="' + e.id + '">处理</button></div>').join('') + '</div>' }) +
          '</div>' +
        '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '服务链设计原则', sub: '后台按这个顺序校验，前端就不会断', body: '<div class="hn-principles">' +
          [['01', '先校验资格', '权益、企业、人群、禁忌，避免无效预约'], ['02', '再确认履约', '机构、时段、医生、空腹与材料'], ['03', '结果必须回流', '报告异常自动生成管理任务'], ['04', '管理必须随访', '计划有责任人与下一次时间'], ['05', '结束必须结算', '权益核销、费用、满意度与复测']].map((x) =>
            '<div><b>' + x[0] + '</b><h4>' + x[1] + '</h4><p>' + x[2] + '</p></div>').join('') + '</div>' });
    },
    actions: {
      filterStage(d) { const st = P['h-service-flow'].state; st.stage = d.id === st.stage ? '' : d.id; App.refresh(true); },
      exportS() { UI.toast('履约清单已导出'); },
      viewCase(d) {
        const c = H().serviceCases.find((x) => x.id === d.id);
        if (!c) return;
        const profile = H().profiles.find((p) => p.id === c.profileId) || {};
        const exs = H().exceptions.filter((e) => e.caseId === c.id);
        const plan = H().carePlans.find((p) => p.profileId === c.profileId);
        const rows = [
          ['服务对象', c.person + ' · ' + (profile.dept || '—')],
          ['服务项目', c.service],
          ['当前阶段', c.stage],
          ['责任人', c.owner],
          ['时限', c.due],
          ['权益使用', c.benefit || '—'],
          ['结算金额', c.amount ? '¥' + Number(c.amount).toLocaleString('zh-CN') : '权益内'],
          ['下一步', c.next]
        ];
        UI.drawer({
          title: '服务案例 · ' + c.person, sub: c.service + ' · ' + c.stage,
          icon: 'stethoscope', width: 620, okText: '关闭', footer: true,
          body: '<div class="note" style="margin-bottom:12px">从预约到报告、转管理、结算都在同一个案例里推进，任何一项逾期都会进入履约台待办。</div>' +
            '<dl class="vkv">' + rows.map((r) => '<dt>' + E(r[0]) + '</dt><dd>' + E(r[1]) + '</dd>').join('') + '</dl>' +
            '<div class="formsec" style="margin-top:14px"><h4>阶段进展</h4><div class="hn-pipeline" style="margin:0">' +
              STAGE.map((s, i) => '<button class="hn-stage ' + (s === c.stage ? 'on' : '') + '" style="cursor:default"><span>0' + (i + 1) + '</span><em>' + s + '</em><small>' + STAGE_HINT[s] + '</small></button>' + (i < STAGE.length - 1 ? '<i>→</i>' : '')).join('') +
            '</div></div>' +
            '<div class="grid g-2" style="margin-top:14px;gap:10px">' +
              '<div class="panel" style="padding:13px 14px;box-shadow:none"><b style="font-size:12px">健康与风险</b>' +
                '<div class="small mut" style="margin-top:6px;line-height:1.7">' + (profile.risk ? '风险分层：' + ({ high: '高', medium: '中', low: '低' }[profile.risk] || profile.risk) + '<br>' : '') +
                (profile.exam ? '最近体检：' + E(profile.exam.date || '') + '<br>异常：' + E((profile.exam.abnormal || []).join('、') || '无') : '暂无体检档案') + '</div></div>' +
              '<div class="panel" style="padding:13px 14px;box-shadow:none"><b style="font-size:12px">管理衔接</b>' +
                '<div class="small mut" style="margin-top:6px;line-height:1.7">' + (plan ? '计划：' + E(plan.name) + '<br>责任人：' + E(plan.owner) + '<br>依从性：' + plan.adherence + '%' : '尚未建立管理计划') +
                '<br>异常：' + (exs.length ? E(exs.map((e) => e.type).join('、')) : '无') + '</div></div>' +
            '</div>' +
            '<div class="row" style="margin-top:14px;gap:8px">' +
              '<button class="btn sm primary" data-case-go="advanceCase" data-id="' + c.id + '">' + I('chevron', 13) + '推进到下一阶段</button>' +
              '<button class="btn sm" data-case-go="caseToPlan" data-id="' + c.id + '">' + I('target', 13) + '转入健康管理</button>' +
              '<button class="btn sm ghost" data-case-go="openProfile" data-id="' + c.profileId + '">' + I('user', 13) + '查看健康档案</button>' +
            '</div>',
          mount(n) {
            n.querySelectorAll('[data-case-go]').forEach((b) => b.addEventListener('click', () => {
              const act = b.dataset.caseGo;
              UI.closeOverlay();
              if (act === 'openProfile') App.go('h-profiles', { id: b.dataset.id });
              else P['h-service-flow'].actions[act]({ id: b.dataset.id });
            }));
          }
        });
      },
      advanceCase(d) {
        const c = H().serviceCases.find((x) => x.id === d.id);
        const next = advanceStage(c);
        Store.saveItem('health.serviceCases', { id: c.id, stage: next, next: next === '已转管理' ? '建立管理计划' : next === '已结算' ? '回访与满意度' : STAGE_HINT[next] }, 'id', '服务阶段推进');
        log('服务阶段推进', c.person, c.service + '：' + c.stage + ' → ' + next);
        UI.toast(c.person + ' · ' + next); App.refresh();
      },
      caseToPlan(d) {
        const c = H().serviceCases.find((x) => x.id === d.id);
        P['h-profiles'].actions.createPlan({ id: c.profileId }, true);
      },
      resolveExFlow(d) {
        const e = H().exceptions.find((x) => x.id === d.id);
        Store.saveItem('health.exceptions', { id: e.id, status: 'resolved' }, 'id', '履约异常处理');
        UI.toast('异常已关闭'); App.refresh();
      },
      newEx() {
        UI.formDrawer({ title: '登记履约异常', sub: '异常会成为责任人的待办，而不是一条日志', icon: 'activity',
          fields: [
            { key: 'type', label: '异常类型', type: 'select', options: ['待确认超时', '报告逾期', '异常未解读', '随访逾期', '结算差异', '爽约'] },
            { key: 'owner', label: '责任人', type: 'select', options: ['健康管理中心', '赵医生', '王雪', '陈放', '财务'] },
            { key: 'desc', label: '说明', type: 'area', rows: 3 }
          ],
          onSave(v) {
            Store.pushItem('health.exceptions', { id: 'ex' + Date.now(), caseId: 'sc1', type: v.type || '履约异常', severity: 'medium', owner: v.owner, desc: v.desc, status: 'open' }, '登记异常');
            UI.toast('异常已登记'); App.refresh();
          } });
      }
    }
  };

  /* ============================================================ 健康档案 */
  P['h-profiles'] = {
    app: 'employee', title: '健康档案', sub: '档案不是资料柜，是风险、计划、随访与结果的共同入口',
    state: { selected: 'hp4', filter: 'all' },
    render(ctx) {
      const h = H(), st = P['h-profiles'].state;
      if (ctx && ctx.id) st.selected = ctx.id;
      const list = h.profiles.filter((p) => st.filter === 'all' || p.risk === st.filter);
      const sel = profileOf(st.selected) || list[0] || h.profiles[0];
      const plan = activePlanOf(sel.id);
      const fus = h.followups.filter((f) => f.profileId === sel.id).slice(0, 4);
      const outs = h.outcomes.filter((o) => o.profileId === sel.id).slice(0, 6);
      const m = sel.metrics || {};
      return K.head('健康档案', h.profiles.length + ' 份在管档案 · ' + riskCount('high') + ' 人高风险', 
        K.btn('新增档案', 'newProfile', { icon: 'plus', cls: 'primary' }), 'HEALTH / PROFILE') +
        '<div class="hn-profile-layout">' +
          '<div class="hn-people">' +
            '<div class="hn-people-head">' + K.seg([{ id: 'all', label: '全部' }, { id: 'high', label: '高风险' }, { id: 'medium', label: '中风险' }, { id: 'low', label: '低风险' }], st.filter, 'filterPeople') + '<span>' + list.length + ' 人</span></div>' +
            list.map((p) => '<button class="hn-person ' + (sel.id === p.id ? 'on' : '') + '" data-act="selectProfile" data-id="' + p.id + '">' + UI.avatar(p.name) +
              '<div><b>' + E(p.name) + '</b><span>' + E(p.dept) + ' · ' + p.age + ' 岁</span><em>' + (p.tags || []).slice(0, 2).join(' / ') + '</em></div>' + riskPill(p.risk) + '</button>').join('') +
          '</div>' +
          '<div class="hn-profile-main">' +
            '<div class="hn-ph-hero"><div><span class="hn-ph-tag">' + E(sel.source) + '</span><h2>' + E(sel.name) + '</h2><p>' + E(sel.dept) + ' · ' + sel.age + ' 岁 · 健管师 ' + E(sel.owner) + ' · 最近联系 ' + E(sel.lastContact) + '</p>' +
              '<div class="vchips">' + (sel.tags || []).map((t) => '<span>' + E(t) + '</span>').join('') + '</div></div>' +
              '<div class="hn-ph-score"><b>' + sel.score + '</b><span>风险分</span>' + riskPill(sel.risk) + '</div></div>' +
            '<div class="hn-metric-grid">' + [['血压', m.bpSys + '/' + m.bpDia, 'mmHg'], ['空腹血糖', m.glucose, 'mmol/L'], ['LDL-C', m.ldl, 'mmol/L'], ['BMI', m.bmi, ''], ['尿酸', m.uric, 'μmol/L'], ['睡眠', m.sleep, '小时'], ['情绪', m.mood, '/10'], ['步数', nf(m.steps), '步']].map((x) =>
              '<div><span>' + x[0] + '</span><b>' + x[1] + '</b><em>' + x[2] + '</em></div>').join('') + '</div>' +
            '<div class="grid g-2" style="margin-top:14px">' +
              K.panel({ title: '最近体检', sub: sel.exam.date, body: '<div class="small mut" style="line-height:1.8">' + E(sel.exam.summary) + '</div><div class="chips" style="margin-top:10px">' + (sel.exam.abnormal.length ? sel.exam.abnormal.map((a) => '<span class="chip">' + E(a) + '</span>').join('') : '<span class="chip on">全部正常</span>') + '</div>' }) +
              K.panel({ title: '当前管理', sub: plan ? plan.week + ' / ' + ((h.planTemplates.find((t) => t.id === plan.templateId) || {}).weeks || 12) + ' 周' : '尚未建立计划', body: plan ? '<div class="row"><div><b style="font-size:13px">' + E(plan.name) + '</b><div class="small mut" style="margin-top:3px">' + E(plan.goal) + '</div></div><b class="right tnum">' + plan.adherence + '%</b></div><div class="progress" style="margin-top:10px"><b style="width:' + plan.adherence + '%"></b></div><div class="row small mut" style="margin-top:9px;justify-content:space-between"><span>责任人 ' + E(plan.owner) + '</span><span>下次复核 ' + plan.nextReview + '</span></div>' : '<div class="note warn">高风险人群尚未进入管理，建议立即建立计划。</div>' }) +
            '</div>' +
            '<div class="grid g-2" style="margin-top:16px">' +
              K.panel({ title: '随访记录', sub: fus.length + ' 条', flush: true, body: fus.length ? '<div style="padding:4px 18px 12px">' + fus.map((f) => '<div class="listrow"><div class="meta"><b>' + E(f.type) + '</b><span>' + f.due + ' · ' + E(f.note) + '</span></div>' + UI.pill(FU_ST[f.status][0], FU_ST[f.status][1]) + '</div>').join('') + '</div>' : K.empty('暂无随访') }) +
              K.panel({ title: '结果趋势', sub: '基线 → 当前', flush: true, body: outs.length ? UI.table([
                { label: '指标', render: (o) => '<b>' + E(o.metric) + '</b>' },
                { label: '基线', render: (o) => '<span class="tnum">' + o.baseline + '</span>' },
                { label: '当前', render: (o) => '<span class="tnum strong">' + o.current + '</span>' },
                { label: '目标', render: (o) => '<span class="tnum mut">' + o.target + '</span>' },
                { label: '状态', render: (o) => UI.pill(o.status === 'reached' ? '已达标' : '改善中', o.status === 'reached' ? 'green' : 'amber') }
              ], outs) : K.empty('暂无结果记录') }) +
            '</div>' +
            '<div class="hn-ph-actions"><button class="btn primary" data-act="createPlan" data-id="' + sel.id + '">' + I('target', 15) + '建立管理计划</button>' +
              '<button class="btn" data-act="addFollow" data-id="' + sel.id + '">' + I('clock', 15) + '安排随访</button>' +
              '<button class="btn" data-act="editProfile" data-id="' + sel.id + '">' + I('edit', 15) + '编辑档案</button>' +
              '<button class="btn" data-act="openCrm" data-id="' + sel.name + '">' + I('user', 15) + '客户 360</button></div>' +
          '</div></div>';
    },
    actions: {
      selectProfile(d) { P['h-profiles'].state.selected = d.id; App.refresh(true); },
      filterPeople(d) { P['h-profiles'].state.filter = d.id; App.refresh(true); },
      newProfile() {
        UI.formDrawer({ title: '新增健康档案', sub: '先建最小档案，后续由服务与随访补齐', icon: 'user',
          fields: [
            { key: 'name', label: '姓名' }, { key: 'dept', label: '部门' },
            { key: 'age', label: '年龄', type: 'num', value: 30 },
            { key: 'risk', label: '初始风险', type: 'select', options: [{ v: 'low', l: '低' }, { v: 'medium', l: '中' }, { v: 'high', l: '高' }] },
            { key: 'tags', label: '风险标签', ph: '用 / 分隔' }
          ],
          onSave(v) {
            const id = 'hp' + Date.now();
            Store.pushItem('health.profiles', { id: id, name: v.name || '新档案', dept: v.dept || '待补充', company: '示例科技', age: v.age, sex: '', phone: '', risk: v.risk || 'low', score: 30, owner: '王雪', source: '手工建档', joined: '2026-11-08', tags: (v.tags || '').split('/').filter(Boolean), consent: 'pending', lastContact: '2026-11-08', metrics: { bpSys: 120, bpDia: 80, glucose: 5.2, ldl: 2.9, bmi: 22, uric: 300, sleep: 7, mood: 7, steps: 6000 }, exam: { date: '—', org: '—', abnormal: [], summary: '待补充体检结果。' }, meds: [], allergies: [], lifestyle: '待补充' }, '新增健康档案');
            P['h-profiles'].state.selected = id; UI.toast('档案已创建'); App.refresh();
          } });
      },
      editProfile(d) {
        const p = profileOf(d.id), i = H().profiles.indexOf(p);
        UI.drawer({ title: '编辑健康档案', sub: p.name, icon: 'user', width: 560,
          body: '<div class="formsec"><h4>基本信息</h4><div class="frow">' + UI.fInput({ label: '姓名', value: p.name, path: 'health.profiles.' + i + '.name' }) + UI.fInput({ label: '部门', value: p.dept, path: 'health.profiles.' + i + '.dept' }) + '</div>' +
            UI.fInput({ label: '风险标签', value: (p.tags || []).join(' / '), hint: '用 / 分隔', path: 'health.profiles.' + i + '.tagsText' }) +
            '<div class="frow">' + UI.fSelect({ label: '风险等级', value: p.risk, options: [{ v: 'low', l: '低' }, { v: 'medium', l: '中' }, { v: 'high', l: '高' }, { v: 'critical', l: '极高' }], path: 'health.profiles.' + i + '.risk' }) +
            UI.fSelect({ label: '知情同意', value: p.consent, options: [{ v: 'signed', l: '已签署' }, { v: 'pending', l: '待签署' }, { v: 'revoked', l: '已撤回' }], path: 'health.profiles.' + i + '.consent' }) + '</div>' +
            UI.fArea({ label: '生活方式', value: p.lifestyle, rows: 3, path: 'health.profiles.' + i + '.lifestyle' }) +
            '</div><div class="note warn">档案只用于健康管理与服务履约，心理数据单独授权，不进入企业报告明细。</div>',
          onOk() { UI.toast('档案已保存'); App.refresh(); } });
      },
      createPlan(d, quiet) {
        const p = profileOf(d.id);
        UI.formDrawer({ title: '建立管理计划', sub: p.name + ' · 从模板开始，不写空白方案', icon: 'target', section: '计划',
          fields: [
            { key: 'tpl', label: '计划模板', type: 'select', options: H().planTemplates.map((t) => ({ v: t.id, l: t.name })) },
            { key: 'owner', label: '责任人', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师'] },
            { key: 'goal', label: '本次目标', type: 'area', rows: 2, ph: '留空则使用模板目标' }
          ],
          onSave(v) {
            const plan = newPlan(p.id, v.tpl, v.owner);
            if (v.goal) Store.saveItem('health.carePlans', { id: plan.id, goal: v.goal }, 'id', '调整计划目标');
            newFollowup(p.id, plan.id, '计划启动首次随访', '2026-11-09', v.owner, '确认目标与执行条件');
            log('建立管理计划', p.name, plan.name);
            UI.toast('计划已建立并生成首次随访'); App.refresh();
          } });
      },
      addFollow(d) {
        const p = profileOf(d.id), plan = activePlanOf(p.id);
        UI.formDrawer({ title: '安排随访', sub: p.name + ' · 下一次必须有人负责', icon: 'clock',
          fields: [
            { key: 'type', label: '随访类型', type: 'select', options: ['计划随访', '血压复核', '血糖复核', '睡眠复盘', '心理关怀', '复查确认'] },
            { key: 'due', label: '日期', type: 'date', value: '2026-11-12' },
            { key: 'owner', label: '责任人', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师'] },
            { key: 'note', label: '关注点', type: 'area', rows: 2 }
          ],
          onSave(v) {
            newFollowup(p.id, plan ? plan.id : '', v.type, v.due, v.owner, v.note);
            UI.toast('随访已安排'); App.refresh();
          } });
      },
      openCrm(d) { App.go('crm-360', { person: d.id }); }
    }
  };

  /* ============================================================ 风险分层 */
  P['h-risk'] = {
    app: 'employee', title: '风险分层与关怀缺口', sub: '规则负责发现，人负责处理，系统负责不漏',
    render() {
      const h = H();
      const gaps = [];
      h.profiles.forEach((p) => {
        if ((p.risk === 'high' || p.risk === 'critical') && !activePlanOf(p.id)) gaps.push({ p: p, type: '高风险未建计划', level: 'high', act: '建计划' });
        if (p.consent !== 'signed') gaps.push({ p: p, type: '知情同意未签署', level: 'medium', act: '补授权' });
        if (!p.exam || p.exam.date === '—') gaps.push({ p: p, type: '缺少体检基线', level: 'medium', act: '补体检' });
      });
      h.followups.filter((f) => f.status === 'overdue').forEach((f) => gaps.push({ p: profileOf(f.profileId), type: '随访逾期 · ' + f.type, level: 'high', act: '处理随访' }));
      return K.head('风险分层与关怀缺口', '按规则实时分层，但每条高风险都必须有责任人', 
        K.btn('重新计算', 'rescan', { icon: 'refresh' }) + ' ' + K.btn('新增规则', 'newRule', { icon: 'plus', cls: 'primary' }), 'HEALTH / RISK') +
        '<div class="hn-board">' + ['critical', 'high', 'medium', 'low'].map((lv) => {
          const list = h.profiles.filter((p) => p.risk === lv);
          const r = RISK[lv];
          return '<div class="hn-col ' + lv + '"><header><div><b>' + r[0] + '风险</b><span>' + (lv === 'critical' ? '立即医疗介入' : lv === 'high' ? '24h 人工触达' : lv === 'medium' ? '7 天内随访' : '内容与复测') + '</span></div><em>' + list.length + '</em></header>' +
            list.map((p) => '<div class="hn-riskcard"><div class="row"><div><b>' + E(p.name) + '</b><span>' + E(p.dept) + ' · ' + E(p.owner) + '</span></div><strong>' + p.score + '</strong></div>' +
              '<div class="hn-rtags">' + (p.tags || []).slice(0, 3).map((t) => '<em>' + E(t) + '</em>').join('') + '</div>' +
              '<footer><button data-act="riskPlan" data-id="' + p.id + '">计划</button><button data-act="riskFollow" data-id="' + p.id + '">随访</button><button data-act="riskProfile" data-id="' + p.id + '">档案</button></footer></div>').join('') +
            (!list.length ? '<div class="hn-empty">当前无人群</div>' : '') + '</div>';
        }).join('') + '</div>' +
        '<div class="grid g-2" style="margin-top:16px">' +
          K.panel({ title: '风险规则', sub: '条件 → 分层 → 动作', flush: true,
            actions: K.btn('新增规则', 'newRule', { icon: 'plus', cls: 'ghost sm' }),
            body: UI.table([
              { label: '规则', render: (r) => '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.condition) + '</div></div>' },
              { label: '维度', render: (r) => UI.pill(r.dim, 'grey') },
              { label: '分层', render: (r) => riskPill(r.level) },
              { label: '命中', align: 'right', render: (r) => '<span class="tnum">' + r.hits + '</span>' },
              { label: '启用', render: (r) => '<button class="switch ' + (r.on ? 'on' : '') + '" data-toggle="health.riskRules.' + UI.ix(h.riskRules, r) + '.on"></button>' }
            ], h.riskRules) }) +
          K.panel({ title: '关怀缺口', sub: gaps.length + ' 项需要处理', flush: true,
            body: gaps.length ? '<div style="padding:4px 18px 12px">' + gaps.slice(0, 10).map((g, i) =>
              '<div class="hn-gap"><span class="' + g.level + '"></span><div><b>' + E(g.p.name || '—') + ' · ' + E(g.type) + '</b><em>' + E(g.p.dept || '') + '</em></div><button data-act="gapFix" data-id="' + (g.p.id || '') + '" data-kind="' + g.type + '">' + g.act + '</button></div>').join('') + '</div>' : K.empty('关怀缺口已清零') }) +
        '</div>';
    },
    actions: {
      riskPlan(d) { P['h-profiles'].actions.createPlan(d); },
      riskFollow(d) { P['h-profiles'].actions.addFollow(d); },
      riskProfile(d) { App.go('h-profiles', { id: d.id }); },
      rescan() { UI.toast('已按 8 条规则重新计算分层'); App.refresh(); },
      gapFix(d) {
        if (d.kind.indexOf('计划') >= 0) P['h-profiles'].actions.createPlan(d);
        else if (d.kind.indexOf('随访') >= 0) App.go('h-followups');
        else UI.toast('已加入待办：' + d.kind);
      },
      newRule() {
        UI.formDrawer({ title: '新增风险规则', sub: '运营可配置，但医学阈值需医生审核', icon: 'activity',
          fields: [
            { key: 'name', label: '规则名称' },
            { key: 'dim', label: '维度', type: 'select', options: ['血压', '血糖', '血脂', '体重', '睡眠', '心理', '尿酸', '依从性'] },
            { key: 'condition', label: '条件', type: 'area', rows: 2 },
            { key: 'level', label: '分层', type: 'select', options: [{ v: 'high', l: '高' }, { v: 'medium', l: '中' }] },
            { key: 'action', label: '动作', type: 'area', rows: 2 }
          ],
          onSave(v) {
            Store.pushItem('health.riskRules', { id: 'hr' + Date.now(), name: v.name || '新规则', dim: v.dim, condition: v.condition, level: v.level || 'medium', action: v.action, on: false, hits: 0 }, '新增风险规则');
            UI.toast('规则已创建，默认关闭，审核后启用'); App.refresh();
          } });
      }
    }
  };

  /* ============================================================ 管理计划 */
  P['h-plans'] = {
    app: 'employee', title: '健康管理计划', sub: '每个计划都有目标、周期、责任人、随访与结果',
    state: { selected: 'cp1' },
    render() {
      const h = H(), st = P['h-plans'].state;
      const sel = planOf(st.selected) || h.carePlans[0];
      const p = profileOf(sel.profileId);
      const fus = h.followups.filter((f) => f.planId === sel.id);
      const outs = h.outcomes.filter((o) => o.profileId === sel.profileId);
      const active = h.carePlans.filter((x) => x.status === 'active');
      return K.head('健康管理计划', active.length + ' 个计划执行中 · 平均依从性 ' + Math.round(active.reduce((a, b) => a + b.adherence, 0) / (active.length || 1)) + '%', 
        K.btn('从模板建计划', 'newPlan', { icon: 'plus', cls: 'primary' }), 'HEALTH / CARE PLAN') +
        '<div class="hn-plan-layout">' +
          '<div class="hn-plan-list">' + h.carePlans.map((c) => {
            const pp = profileOf(c.profileId);
            const totalW = (H().planTemplates.find((t) => t.id === c.templateId) || {}).weeks || 12;
            return '<button class="hn-plancard ' + (sel.id === c.id ? 'on' : '') + '" data-act="selectPlan" data-id="' + c.id + '"><header><div><b>' + E(c.name) + '</b><span>' + E(pp.name) + ' · ' + E(c.owner) + '</span></div>' + UI.pill(PLAN_ST[c.status][0], PLAN_ST[c.status][1]) + '</header><div class="progress"><b style="width:' + c.adherence + '%"></b></div><footer><span>第 ' + c.week + ' / ' + totalW + ' 周</span><em>' + c.adherence + '% 依从</em></footer></button>';
          }).join('') + '</div>' +
          '<div class="hn-plan-main">' +
            '<div class="hn-ph-hero"><div><span class="hn-ph-tag">' + E(sel.service) + '</span><h2>' + E(sel.name) + '</h2><p>' + E(p.name) + ' · ' + E(sel.owner) + ' · ' + sel.start + ' → ' + sel.end + ' · 下次复核 ' + sel.nextReview + '</p><div class="hn-goal">' + E(sel.goal) + '</div></div><div class="hn-ph-score"><b>' + sel.adherence + '</b><span>依从性 %</span>' + UI.pill(PLAN_ST[sel.status][0], PLAN_ST[sel.status][1]) + '</div></div>' +
            '<div class="hn-mile">' + (sel.milestones || []).map((m, i) => '<div class="hn-mstone ' + (m.done ? 'done' : '') + '"><span>' + (m.done ? I('check', 13) : (i + 1)) + '</span><b>' + E(m.t) + '</b><em>第 ' + m.w + ' 周</em></div>').join('') + '</div>' +
            '<div class="grid g-2" style="margin-top:16px">' +
              K.panel({ title: '随访计划', sub: fus.length + ' 条', flush: true, body: fus.length ? '<div style="padding:4px 18px 12px">' + fus.map((f) => '<div class="listrow"><div class="meta"><b>' + E(f.type) + '</b><span>' + f.due + ' · ' + E(f.owner) + '</span></div>' + UI.pill(FU_ST[f.status][0], FU_ST[f.status][1]) + '</div>').join('') + '</div>' : K.empty('暂无随访') }) +
              K.panel({ title: '结果指标', sub: outs.length + ' 个', flush: true, body: outs.length ? UI.table([
                { label: '指标', render: (o) => '<b>' + E(o.metric) + '</b>' },
                { label: '基线', render: (o) => '<span class="tnum">' + o.baseline + '</span>' },
                { label: '当前', render: (o) => '<span class="tnum strong">' + o.current + '</span>' },
                { label: '状态', render: (o) => UI.pill(o.status === 'reached' ? '已达标' : '改善中', o.status === 'reached' ? 'green' : 'amber') }
              ], outs) : K.empty('暂无结果') }) +
            '</div>' +
            '<div class="hn-ph-actions"><button class="btn" data-act="advancePlan" data-id="' + sel.id + '">' + I('chevron', 15) + '推进一周</button>' +
              '<button class="btn" data-act="pausePlan" data-id="' + sel.id + '">' + I('clock', 15) + (sel.status === 'active' ? '暂停计划' : '恢复计划') + '</button>' +
              '<button class="btn" data-act="planFollow" data-id="' + sel.profileId + '">' + I('clock', 15) + '加随访</button>' +
              '<button class="btn" data-act="planProfile" data-id="' + sel.profileId + '">' + I('user', 15) + '查看档案</button></div>' +
          '</div></div>';
    },
    actions: {
      selectPlan(d) { P['h-plans'].state.selected = d.id; App.refresh(true); },
      newPlan() {
        UI.formDrawer({ title: '从模板建计划', sub: '选择对象与模板，自动生成随访与里程碑', icon: 'target',
          fields: [
            { key: 'pid', label: '管理对象', type: 'select', options: H().profiles.map((p) => ({ v: p.id, l: p.name + ' · ' + p.dept })) },
            { key: 'tpl', label: '计划模板', type: 'select', options: H().planTemplates.map((t) => ({ v: t.id, l: t.name })) },
            { key: 'owner', label: '责任人', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师'] }
          ],
          onSave(v) {
            const plan = newPlan(v.pid, v.tpl, v.owner);
            newFollowup(v.pid, plan.id, '计划启动首次随访', '2026-11-09', v.owner, '确认目标与执行条件');
            P['h-plans'].state.selected = plan.id; UI.toast('计划已创建'); App.refresh();
          } });
      },
      advancePlan(d) {
        const c = H().carePlans.find((x) => x.id === d.id);
        const next = Math.min(12, c.week + 1);
        Store.saveItem('health.carePlans', { id: c.id, week: next, nextReview: '2026-11-' + (12 + next) }, 'id', '计划推进');
        log('计划推进', profileName(c.profileId), c.name + ' → 第 ' + next + ' 周');
        UI.toast('已推进到第 ' + next + ' 周'); App.refresh();
      },
      pausePlan(d) {
        const c = H().carePlans.find((x) => x.id === d.id);
        const next = c.status === 'active' ? 'paused' : 'active';
        Store.saveItem('health.carePlans', { id: c.id, status: next }, 'id', '计划状态');
        UI.toast(next === 'paused' ? '计划已暂停' : '计划已恢复'); App.refresh();
      },
      planFollow(d) { P['h-profiles'].actions.addFollow({ id: d.id }); },
      planProfile(d) { App.go('h-profiles', { id: d.id }); }
    }
  };

  /* ============================================================ 随访工作台 */
  P['h-followups'] = {
    app: 'employee', title: '随访工作台', sub: '今天该联系谁、说什么、结果是什么，一屏完成',
    render() {
      const h = H();
      const cols = [
        { id: 'overdue', label: '已逾期', items: h.followups.filter((f) => f.status === 'overdue'), tone: 'red' },
        { id: 'due', label: '今日到期', items: h.followups.filter((f) => f.status === 'due'), tone: 'amber' },
        { id: 'upcoming', label: '本周待办', items: h.followups.filter((f) => f.status === 'upcoming'), tone: 'blue' },
        { id: 'completed', label: '最近完成', items: h.followups.filter((f) => f.status === 'completed').slice(0, 4), tone: 'green' }
      ];
      return K.head('随访工作台', '逾期 ' + h.followups.filter((f) => f.status === 'overdue').length + ' 项 · 今日 ' + h.followups.filter((f) => f.status === 'due').length + ' 项 · 本周 ' + h.followups.filter((f) => f.status === 'upcoming').length + ' 项',
        K.btn('导出随访清单', 'exportF', { icon: 'download' }), 'HEALTH / FOLLOW-UP') +
        K.kpis([
          { k: '今日任务', v: h.followups.filter((f) => f.status === 'due').length, unit: '项', d: '按优先级处理', icon: 'clock' },
          { k: '已逾期', v: h.followups.filter((f) => f.status === 'overdue').length, unit: '项', d: '需升级责任人', tone: 'down', icon: 'activity' },
          { k: '本周完成', v: h.followups.filter((f) => f.status === 'completed').length, unit: '项', d: '完成率 86%', tone: 'up', icon: 'check' },
          { k: '高风险随访', v: h.followups.filter((f) => f.priority === 'high' && f.status !== 'completed').length, unit: '项', d: '24h 内完成', tone: 'down', icon: 'target' }
        ]) +
        '<div class="hn-followboard">' + cols.map((c) => '<div class="hn-fcol ' + c.tone + '"><header><b>' + c.label + '</b><em>' + c.items.length + '</em></header>' +
          c.items.map((f) => {
            const p = profileOf(f.profileId);
            return '<div class="hn-fcard ' + (f.priority === 'high' ? 'high' : '') + '"><div class="row"><b>' + E(f.type) + '</b><em>' + E(f.due) + '</em></div><span>' + E(p.name || '—') + ' · ' + E(p.dept || '') + ' · ' + E(f.owner) + '</span><p>' + E(f.note || '') + '</p><footer><button data-act="openFollow" data-id="' + f.id + '">' + (f.status === 'completed' ? '查看' : '处理') + '</button></footer></div>';
          }).join('') + (!c.items.length ? '<div class="hn-empty">暂无</div>' : '') + '</div>').join('') + '</div>' +
        '<div class="note teal" style="margin-top:14px">' + I('shield', 15) + '<span>心理类随访只记录「是否完成、下次时间」，不记录咨询内容；企业报告只看聚合指标。</span></div>';
    },
    actions: {
      exportF() { UI.toast('随访清单已导出'); },
      openFollow(d) {
        const f = H().followups.find((x) => x.id === d.id);
        if (!f) return;
        const p = profileOf(f.profileId);
        const done = f.status === 'completed';
        if (done) {
          UI.drawer({ title: '随访记录', sub: p.name + ' · ' + f.type, icon: 'clock', width: 520,
            body: '<div class="hn-fdetail"><span class="hn-ph-tag">已完成</span><h3>' + E(f.type) + '</h3><p>' + E(f.note || '') + '</p>' +
              '<div class="hn-kv"><div><span>责任人</span><b>' + E(f.owner) + '</b></div><div><span>渠道</span><b>' + E(f.channel) + '</b></div><div><span>截止</span><b>' + E(f.due) + '</b></div><div><span>风险</span><b>' + (p.risk ? RISK[p.risk][0] : '—') + '</b></div></div>' +
              '<div class="note teal">结果：' + E(f.outcome || '已完成') + '<br>下次：' + E(f.next || '无') + '</div></div>',
            okText: '关闭' });
          return;
        }
        UI.formDrawer({ title: '执行随访', sub: p.name + ' · ' + f.type, icon: 'clock', section: '随访记录',
          fields: [
            { key: 'result', label: '本次结果', type: 'area', rows: 3, ph: '记录可公开的服务结果，不记录心理内容' },
            { key: 'nextSel', label: '下一步', type: 'select', options: [{ v: 'schedule', l: '安排下次随访' }, { v: 'plan', l: '调整管理计划' }, { v: 'escalate', l: '升级处理' }, { v: 'close', l: '结束管理' }] },
            { key: 'nextDate', label: '下次日期', type: 'date', value: '2026-11-15' }
          ],
          onSave(v) {
            const outcome = v.result || '已完成随访';
            Store.saveItem('health.followups', { id: f.id, status: 'completed', outcome: outcome, next: v.nextDate }, 'id', '完成随访');
            if (v.nextSel === 'schedule') newFollowup(f.profileId, f.planId, f.type, v.nextDate, f.owner, '上次随访：' + outcome);
            if (v.nextSel === 'plan') Store.saveItem('health.carePlans', { id: f.planId, nextReview: v.nextDate }, 'id', '计划复核日期');
            if (v.nextSel === 'escalate') {
              newFollowup(f.profileId, f.planId, '升级复核', '2026-11-09', '赵医生', '随访升级：' + outcome);
              Store.saveItem('health.profiles', { id: f.profileId, risk: 'high' }, 'id', '风险升级');
            }
            if (v.nextSel === 'close') Store.saveItem('health.carePlans', { id: f.planId, status: 'completed' }, 'id', '结束管理');
            touch(p.name, f.channel, '随访完成 · ' + f.type, '已记录');
            log('完成随访', p.name, f.type);
            UI.toast('随访已完成'); App.refresh();
          } });
      }
    }
  };

  /* ============================================================ 干预项目 */
  P['h-programs'] = {
    app: 'employee', title: '干预项目与队列', sub: '把单个计划组织成可运营的 cohort，按周推进',
    render() {
      const h = H();
      const running = h.programs.filter((p) => p.status === 'running');
      return K.head('干预项目与队列', running.length + ' 个项目运行中 · ' + h.enrollments.filter((e) => e.status === 'active').length + ' 人在组',
        K.btn('新建项目', 'newProg', { icon: 'plus', cls: 'primary' }), 'HEALTH / PROGRAM') +
        K.kpis([
          { k: '运行项目', v: running.length, unit: '个', d: '覆盖 4 类干预' },
          { k: '在组人数', v: h.enrollments.filter((e) => e.status === 'active').length, unit: '人', d: '平均依从 69%', tone: 'up' },
          { k: '本周风险', v: h.enrollments.filter((e) => e.risk === 'high').length, unit: '人', d: '需教练优先跟进', tone: 'down' },
          { k: '完成率', v: '78', unit: '%', d: '结营评估完成率' }
        ]) +
        '<div class="hn-programs">' + h.programs.map((p) => {
          const prog = Math.round(p.week / p.weeks * 100);
          return '<div class="hn-prog ' + p.status + '"><header><div><span>' + E(p.type) + '</span><b>' + E(p.name) + '</b></div>' + UI.pill(p.status === 'running' ? '运行中' : '草稿', p.status === 'running' ? 'green' : 'grey') + '</header>' +
            '<div class="hn-prog-meta"><span>' + E(p.owner) + '</span><em>' + p.start + ' → ' + p.end + '</em></div>' +
            '<div class="hn-prog-stat"><div><b>' + p.active + '</b><span>在组</span></div><div><b>' + p.riskCount + '</b><span>高风险</span></div><div><b>' + p.adherence + '%</b><span>依从</span></div></div>' +
            '<div class="progress"><b style="width:' + prog + '%"></b></div><footer><span>第 ' + p.week + ' / ' + p.weeks + ' 周</span><button data-act="progDetail" data-id="' + p.id + '">管理</button></footer></div>';
        }).join('') + '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '在组名单', sub: '按风险与依从性排序', flush: true,
          actions: K.btn('入组', 'enroll', { icon: 'plus', cls: 'ghost sm' }),
          body: UI.table([
            { label: '成员', render: (e) => '<div class="cellflex">' + UI.avatar(profileName(e.profileId)) + '<div><div class="strong">' + E(profileName(e.profileId)) + '</div><div class="small muted">' + E(profileOf(e.profileId).dept) + '</div></div></div>' },
            { label: '项目', render: (e) => '<span class="small">' + E(programOf(e.programId).name) + '</span>' },
            { label: '周次', render: (e) => '<span class="tnum">第 ' + e.week + ' 周</span>' },
            { label: '依从', render: (e) => '<div style="min-width:90px"><div class="progress"><b style="width:' + e.adherence + '%"></b></div><div class="small muted" style="margin-top:3px">' + e.adherence + '%</div></div>' },
            { label: '风险', render: (e) => riskPill(e.risk) },
            { label: '教练', render: (e) => E(e.coach) },
            { label: '', align: 'right', render: (e) => '<div class="rowact"><button data-act="enrollPlan" data-id="' + e.profileId + '">' + I('target', 14) + '</button><button data-act="enrollProfile" data-id="' + e.profileId + '">' + I('chevron', 14) + '</button></div>' }
          ], h.enrollments.map((e) => Object.assign({ _id: e.id }, e))) });
    },
    actions: {
      newProg() {
        UI.formDrawer({ title: '新建干预项目', sub: '项目是 cohort，不是单次活动', icon: 'layers',
          fields: [
            { key: 'name', label: '项目名称' }, { key: 'type', label: '类型', type: 'select', options: ['chronic', 'sleep', 'weight', 'mind', 'uric'] },
            { key: 'cohort', label: '计划人数', type: 'num', value: 20 },
            { key: 'weeks', label: '周期（周）', type: 'num', value: 8 },
            { key: 'owner', label: '负责人', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师'] }
          ],
          onSave(v) {
            Store.pushItem('health.programs', { id: 'pg' + Date.now(), name: v.name || '新项目', type: v.type, serviceId: '', cohort: v.cohort, enrolled: 0, active: 0, week: 0, weeks: v.weeks, start: '2026-11-08', end: '2027-01-31', owner: v.owner, status: 'draft', adherence: 0, riskCount: 0, completion: 0 }, '新建干预项目');
            UI.toast('项目已创建（草稿）'); App.refresh();
          } });
      },
      progDetail(d) {
        const p = programOf(d.id);
        const list = H().enrollments.filter((e) => e.programId === p.id);
        UI.drawer({ title: p.name, sub: p.owner + ' · 第 ' + p.week + ' / ' + p.weeks + ' 周', icon: 'layers', width: 620,
          body: '<div class="hn-kv"><div><span>在组</span><b>' + p.active + ' 人</b></div><div><span>高风险</span><b>' + p.riskCount + ' 人</b></div><div><span>依从性</span><b>' + p.adherence + '%</b></div><div><span>周期</span><b>' + p.weeks + ' 周</b></div></div>' +
            '<div class="formsec"><h4>在组成员</h4><div class="stack">' + list.map((e) => '<div class="listrow"><div class="meta"><b>' + E(profileName(e.profileId)) + '</b><span>第 ' + e.week + ' 周 · 依从 ' + e.adherence + '% · ' + E(e.coach) + '</span></div>' + riskPill(e.risk) + '</div>').join('') + '</div></div>',
          extra: '<button class="btn" data-prog-advance>推进一周</button>',
          mount(n) { const b = n.querySelector('[data-prog-advance]'); if (b) b.addEventListener('click', () => { Store.saveItem('health.programs', { id: p.id, week: Math.min(p.weeks, p.week + 1) }, 'id', '项目推进'); UI.closeOverlay(); UI.toast('项目已推进'); App.refresh(); }); } });
      },
      enroll() {
        UI.formDrawer({ title: '成员入组', sub: '入组即生成计划与首次随访', icon: 'users',
          fields: [
            { key: 'pid', label: '成员', type: 'select', options: H().profiles.map((p) => ({ v: p.id, l: p.name + ' · ' + p.dept })) },
            { key: 'prog', label: '项目', type: 'select', options: H().programs.map((p) => ({ v: p.id, l: p.name })) },
            { key: 'coach', label: '教练/健管师', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师'] }
          ],
          onSave(v) {
            const p = profileOf(v.pid), prog = programOf(v.prog);
            Store.pushItem('health.enrollments', { id: 'en' + Date.now(), programId: prog.id, profileId: p.id, week: 1, status: 'active', adherence: 0, risk: p.risk, coach: v.coach }, '成员入组');
            Store.saveItem('health.programs', { id: prog.id, enrolled: prog.enrolled + 1, active: prog.active + 1 }, 'id', '项目人数');
            const plan = newPlan(p.id, prog.type === 'mind' ? 'pt4' : prog.type === 'sleep' ? 'pt2' : prog.type === 'uric' ? 'pt5' : prog.type === 'weight' ? 'pt3' : 'pt1', v.coach);
            newFollowup(p.id, plan.id, '入组首次随访', '2026-11-09', v.coach, '确认目标与基线');
            UI.toast(p.name + ' 已入组并生成计划'); App.refresh();
          } });
      },
      enrollPlan(d) { P['h-profiles'].actions.createPlan(d); },
      enrollProfile(d) { App.go('h-profiles', { id: d.id }); }
    }
  };

  /* ============================================================ 结果评估 */
  P['h-outcomes'] = {
    app: 'employee', title: '健康结果评估', sub: '不只看服务量，要看指标、体验与成本',
    render() {
      const h = H();
      const reached = h.outcomes.filter((o) => o.status === 'reached').length;
      const improving = h.outcomes.filter((o) => o.status === 'improving').length;
      return K.head('健康结果评估', h.outcomes.length + ' 个指标追踪 · ' + reached + ' 个已达标', 
        K.btn('录入结果', 'newOutcome', { icon: 'plus' }) + ' ' + K.btn('导出结果报告', 'exportO', { icon: 'download', cls: 'primary' }), 'HEALTH / OUTCOME') +
        '<div class="hn-outcome-hero"><div><span>QUARTERLY VALUE</span><h2>管理是否有效，用前后对比说话</h2><p>血压、血糖、体重、睡眠、心理与复查完成率，统一回到个人档案与计划，不再散落在报告里。</p></div><div class="hn-outcome-nums"><div><b>71%</b><span>至少 1 项改善</span></div><div><b>43%</b><span>达到目标</span></div><div><b>92%</b><span>随访完成率</span></div></div></div>' +
        K.kpis([
          { k: '已达标', v: reached, unit: '项', d: '占 ' + Math.round(reached / h.outcomes.length * 100) + '%', tone: 'up' },
          { k: '改善中', v: improving, unit: '项', d: '继续随访', tone: 'up' },
          { k: '复查完成率', v: '78', unit: '%', d: '目标 85%' },
          { k: '服务转化', v: '41', unit: '%', d: '异常 → 管理' },
          { k: '满意度', v: '4.8', unit: '/5', d: 'NPS 62' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '结果明细', sub: '按人、按指标追踪', flush: true,
            body: UI.table([
              { label: '对象', render: (o) => '<div class="cellflex">' + UI.avatar(profileName(o.profileId)) + '<div><div class="strong">' + E(profileName(o.profileId)) + '</div><div class="small muted">' + E(profileOf(o.profileId).dept) + '</div></div></div>' },
              { label: '指标', render: (o) => '<b>' + E(o.metric) + '</b>' },
              { label: '基线', align: 'right', render: (o) => '<span class="tnum">' + o.baseline + '</span>' },
              { label: '当前', align: 'right', render: (o) => '<span class="tnum strong">' + o.current + '</span>' },
              { label: '目标', align: 'right', render: (o) => '<span class="tnum mut">' + o.target + '</span>' },
              { label: '变化', render: (o) => { const d = o.current - o.baseline; const good = o.direction === 'down' ? d < 0 : d > 0; return '<span class="pill ' + (good ? 'green' : 'amber') + '">' + (d > 0 ? '+' : '') + Math.round(d * 10) / 10 + '</span>'; } },
              { label: '状态', render: (o) => UI.pill(o.status === 'reached' ? '已达标' : '改善中', o.status === 'reached' ? 'green' : 'amber') }
            ], h.outcomes.map((o) => Object.assign({ _id: o.id }, o))) }) +
          '<div class="stack">' +
            K.panel({ title: '价值证明', sub: '健康管理不只是一项成本', body: '<div class="hn-value">' +
              [['避免误工', '¥186,000', '高风险人群缺勤下降'], ['减少重复检查', '¥92,400', '报告互认与复查管理'], ['服务转化', '¥148,000', '异常转管理带来的增量'], ['续约意向', '82%', '企业客户健康项目续约']].map((x) => '<div><b>' + x[1] + '</b><span>' + x[0] + '</span><em>' + x[2] + '</em></div>').join('') + '</div>' }) +
            K.panel({ title: '哪些结果最值得看', body: '<div class="small mut" style="line-height:1.9">· 高风险人群是否在 24h 内被触达<br>· 异常项是否完成复查<br>· 管理计划是否按期随访<br>· 指标是否改善而非只完成服务<br>· 企业报告是否能解释下一步投入</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      exportO() { UI.toast('健康结果报告已导出'); },
      newOutcome() {
        UI.formDrawer({ title: '录入结果指标', sub: '结果必须回到个人档案与计划', icon: 'activity',
          fields: [
            { key: 'pid', label: '对象', type: 'select', options: H().profiles.map((p) => ({ v: p.id, l: p.name })) },
            { key: 'metric', label: '指标' }, { key: 'baseline', label: '基线值', type: 'num' }, { key: 'current', label: '当前值', type: 'num' }, { key: 'target', label: '目标值', type: 'num' },
            { key: 'unit', label: '单位', ph: 'mmHg / mmol/L / kg' }
          ],
          onSave(v) {
            Store.pushItem('health.outcomes', { id: 'oc' + Date.now(), profileId: v.pid, metric: v.metric || '新指标', baseline: v.baseline, current: v.current, target: v.target, unit: v.unit, direction: 'down', at: '2026-11-08', status: 'improving' }, '录入结果');
            UI.toast('结果已录入'); App.refresh();
          } });
      }
    }
  };

  /* ============================================================ 企业报告 */
  P['h-enterprise'] = {
    app: 'employee', title: '企业健康经营报告', sub: '给企业看的不是体检名单，是风险、投入与下一步',
    render() {
      const h = H();
      const depts = ['研发中心', '市场部', '财务部', '生产部', '人力资源部', '法务部', '设计部', '销售部'];
      const rows = depts.map((d) => {
        const list = h.profiles.filter((p) => p.dept === d);
        return { d: d, n: list.length, high: list.filter((p) => p.risk === 'high' || p.risk === 'critical').length, plans: list.filter((p) => activePlanOf(p.id)).length, rate: list.length ? Math.round(list.filter((p) => activePlanOf(p.id)).length / list.length * 100) : 0 };
      }).filter((x) => x.n);
      return K.head('企业健康经营报告', '示例科技有限公司 · 2026 Q4 · 1,780 名员工', 
        K.btn('生成报告', 'genReport', { icon: 'file', cls: 'primary' }) + ' ' + K.btn('导出 PDF', 'exportE', { icon: 'download' }), 'HEALTH / ENTERPRISE') +
        '<div class="svc360-hero"><div class="svc360-mark on">' + I('building', 26) + '</div><div class="svc360-id"><h2>示例科技 · 2026 年健康经营报告</h2><p>从体检季到长期管理：高风险识别、服务履约、计划覆盖、结果改善与 2027 年投入建议一次说明。</p><div class="vchips"><span>1,780 员工</span><span>8 个部门</span><span>健康投入 ¥428,600</span><span class="green">续约意向 82%</span></div></div><div class="svc360-score"><b>76</b><span>健康管理成熟度 / 100</span></div></div>' +
        '<div class="svc360-kpis"><div><span>高风险人数</span><b>' + (riskCount('high') + riskCount('critical')) + '</b><em>较上季 -3 人</em></div><div><span>管理覆盖率</span><b>62%</b><em>目标 80%</em></div><div><span>异常复查完成</span><b>78%</b><em>目标 85%</em></div><div><span>人均健康投入</span><b>¥241</b><em>低于预算 ¥260</em></div></div>' +
        '<div class="grid g-2-1">' +
          K.panel({ title: '部门健康风险', sub: '按高风险与管理覆盖率', flush: true, body: UI.table([
            { label: '部门', render: (r) => '<b>' + E(r.d) + '</b>' },
            { label: '在管', align: 'right', render: (r) => '<span class="tnum">' + r.n + ' 人</span>' },
            { label: '高风险', align: 'right', render: (r) => '<span class="pill ' + (r.high ? 'red' : 'grey') + '">' + r.high + ' 人</span>' },
            { label: '计划覆盖', render: (r) => '<div style="min-width:110px"><div class="progress"><b style="width:' + r.rate + '%"></b></div><div class="small muted" style="margin-top:3px">' + r.rate + '%</div></div>' }
          ], rows) }) +
          '<div class="stack">' +
            K.panel({ title: '风险金字塔', body: '<div class="hn-pyramid">' + [['low', '低风险', riskCount('low')], ['medium', '中风险', riskCount('medium')], ['high', '高风险', riskCount('high')], ['critical', '极高风险', riskCount('critical')]].map((x) => '<div class="' + x[0] + '" style="width:' + (30 + (x[0] === 'low' ? 70 : x[0] === 'medium' ? 55 : x[0] === 'high' ? 40 : 26)) + '%"><b>' + x[2] + '</b><span>' + x[1] + '</span></div>').join('') + '</div>' }) +
            K.panel({ title: '2027 建议投入', body: '<div class="hn-actions">' +
              '<button data-act="goRisk"><span>' + I('target', 16) + '</span><div><b>高风险人群扩面</b><em>把计划覆盖率从 62% 提到 85%</em></div>' + I('chevron', 14) + '</button>' +
              '<button data-act="goService"><span>' + I('check', 16) + '</span><div><b>异常复查闭环</b><em>报告解读 → 复查 → 转管理</em></div>' + I('chevron', 14) + '</button>' +
              '<button data-act="goFive"><span>' + I('spark', 16) + '</span><div><b>五好生活续约</b><em>从年度会员转为季度可续</em></div>' + I('chevron', 14) + '</button></div>' }) +
          '</div>' +
        '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '报告口径', body: '<div class="note teal">' + I('shield', 15) + '<span>企业报告只呈现人数、比例、部门分布与匿名化结果；心理数据、个人咨询内容与可识别明细不进入企业侧。</span></div>' });
    },
    actions: {
      genReport() { UI.toast('企业健康报告已重新生成'); },
      exportE() { UI.toast('PDF 已导出'); },
      goRisk() { App.go('h-risk'); },
      goService() { App.go('h-service-flow'); },
      goFive() { App.go('fg-members'); }
    }
  };

  /* ============================================================ 五好会员 */
  P['fg-members'] = {
    app: 'all', grp: 'v.ops', papp: 'employee', title: '五好会员运营', sub: '会员不是一个名单，是五维执行、任务、风险与续约',
    render() {
      const fg = FG();
      const members = fg.memberProfiles || [];
      const active = members.filter((m) => m.stage !== '风险暂停' && m.stage !== '低活跃');
      const risk = members.filter((m) => m.risk === 'high');
      return K.head('五好会员运营', members.length + ' 位会员 · ' + active.length + ' 位活跃 · ' + risk.length + ' 位高风险', 
        K.btn('邀请入会', 'enrollMember', { icon: 'plus', cls: 'primary' }), 'FIVE-GOOD / MEMBER') +
        K.kpis([
          { k: '会员', v: members.length, unit: '人', d: '尊享 1 / 进阶 3 / 基础 2' },
          { k: '活跃', v: active.length, unit: '人', d: '近 7 天有任务' },
          { k: '平均完成', v: Math.round(members.reduce((a, b) => a + (b.tasksDone / (b.tasksDue || 1)), 0) / (members.length || 1) * 100), unit: '%', d: '本周任务完成率', tone: 'up' },
          { k: '风险', v: risk.length, unit: '人', d: '需健康管理介入', tone: 'down' },
          { k: '续约意向', v: '82', unit: '%', d: '季度调研' }
        ]) +
        K.panel({ title: '会员台账', sub: '五维分数、任务、授权与下一步动作', flush: true,
          actions: K.btn('批量提醒', 'batchNudge', { cls: 'ghost sm' }),
          body: UI.table([
            { label: '会员', render: (m) => '<div class="cellflex">' + UI.avatar(m.name) + '<div><div class="strong">' + E(m.name) + '</div><div class="small muted">' + E(m.tier) + ' · 教练 ' + E(m.coach) + '</div></div></div>' },
            { label: '五维', render: (m) => { const d = memberDims(m.memberId); return '<div class="hn-minidims">' + ['eat', 'sleep', 'move', 'mind', 'check'].map((k) => '<i class="' + k + '" style="height:' + Math.max(12, d[k] || 0) + '%"></i>').join('') + '</div>'; } },
            { label: '总分', align: 'right', render: (m) => '<b class="tnum">' + memberScore(m.memberId) + '</b>' },
            { label: '任务', render: (m) => '<span class="tnum">' + m.tasksDone + '/' + m.tasksDue + '</span>' },
            { label: '连续', render: (m) => '<span class="tnum">' + m.streak + ' 天</span>' },
            { label: '状态', render: (m) => UI.pill(m.stage, m.stage === '优秀' ? 'green' : m.stage === '风险暂停' ? 'red' : m.stage === '低活跃' ? 'amber' : 'blue') },
            { label: '授权', render: (m) => UI.pill(m.consent === 'signed' ? '已签署' : '待签署', m.consent === 'signed' ? 'green' : 'amber') },
            { label: '', align: 'right', render: (m) => '<div class="rowact"><button data-act="nudgeMember" data-id="' + m.id + '" title="提醒">' + I('send', 14) + '</button><button data-act="openMember" data-id="' + m.id + '" title="详情">' + I('chevron', 14) + '</button></div>' }
          ], members.map((m) => Object.assign({ _id: m.id }, m))) });
    },
    actions: {
      batchNudge() {
        const fg = FG();
        fg.memberProfiles.filter((m) => m.stage === '低活跃').forEach((m) => touch(m.name, '企业微信', '五好召回', '已送达'));
        UI.toast('已向低活跃会员发送召回提醒'); App.refresh();
      },
      nudgeMember(d) {
        const m = FG().memberProfiles.find((x) => x.id === d.id);
        touch(m.name, '企业微信', '五好任务提醒', '已送达');
        UI.toast('已提醒 ' + m.name + ' 完成本周任务'); App.refresh();
      },
      openMember(d) {
        const m = FG().memberProfiles.find((x) => x.id === d.id);
        const score = memberScore(m.memberId), dims = memberDims(m.memberId);
        UI.drawer({ title: m.name + ' · 五好会员', sub: m.tier + ' · 教练 ' + m.coach + ' · ' + m.stage, icon: 'user', width: 600,
          body: '<div class="hn-kv"><div><span>五好总分</span><b>' + score + '</b></div><div><span>本周任务</span><b>' + m.tasksDone + '/' + m.tasksDue + '</b></div><div><span>连续</span><b>' + m.streak + ' 天</b></div><div><span>最近活跃</span><b>' + m.lastActive + '</b></div></div>' +
            '<div class="formsec"><h4>五维表现</h4>' + ['eat', 'sleep', 'move', 'mind', 'check'].map((k) => '<div class="hn-dimrow"><span>' + ({ eat: '吃好', sleep: '睡好', move: '动好', mind: '心好', check: '查好' }[k]) + '</span><div class="progress"><b style="width:' + (dims[k] || 0) + '%"></b></div><b class="tnum">' + (dims[k] || 0) + '</b></div>').join('') + '</div>' +
            '<div class="note ' + (m.risk === 'high' ? 'warn' : 'teal') + '">' + (m.risk === 'high' ? '该会员已命中健康风险，建议转健康管理计划并暂停营销类触达。' : '继续按当前节奏执行；月度报告已生成，可提醒查看。') + '</div>',
          extra: '<button class="btn" data-member-plan>转健康计划</button>',
          mount(n) { const b = n.querySelector('[data-member-plan]'); if (b) b.addEventListener('click', () => { UI.closeOverlay(); P['fg-escalation'].actions.convert({ id: (FG().escalations.find((e) => e.memberId === m.memberId) || {}).id || '' }); }); } });
      },
      enrollMember() {
        UI.formDrawer({ title: '邀请入会', sub: '从在管人群中选择，授权后生效', icon: 'users',
          fields: [
            { key: 'pid', label: '健康档案', type: 'select', options: H().profiles.filter((p) => !FG().memberProfiles.some((m) => m.memberId === p.memberId)).map((p) => ({ v: p.id, l: p.name + ' · ' + p.dept })) },
            { key: 'tier', label: '会员档位', type: 'select', options: ['基础版', '进阶版', '尊享版'] },
            { key: 'coach', label: '教练', type: 'select', options: ['王雪', '陈放', '赵医生', '李咨询师'] }
          ],
          onSave(v) {
            const p = profileOf(v.pid);
            Store.pushItem('fivegood.memberProfiles', { id: 'fmp' + Date.now(), memberId: p.memberId || '', name: p.name, tier: v.tier, stage: '待评估', coach: v.coach, consent: p.consent, risk: p.risk, tasksDone: 0, tasksDue: 10, streak: 0, lastActive: '2026-11-08', next: '完成入组评估', joined: '2026-11-08' }, '邀请入会');
            Store.pushItem('fivegood.consents', { id: 'fc' + Date.now(), memberId: p.memberId || '', name: p.name, status: 'pending', at: '', version: 'v3.2', scopes: { health: false, service: true, mind: false, report: false } }, '会员授权');
            UI.toast('会员已创建，待签署授权'); App.refresh();
          } });
      }
    }
  };

  /* ============================================================ 五好任务 */
  P['fg-tasks'] = {
    app: 'all', grp: 'v.rules', papp: 'employee', title: '五好任务与发布', sub: '任务不是内容列表，要按周发布、按人触达、按结果收口',
    render() {
      const fg = FG();
      const tasks = fg.tasks || [];
      const weekTasks = fg.memberTasks || [];
      const done = weekTasks.filter((t) => t.status === 'done').length;
      const due = weekTasks.filter((t) => t.status === 'due').length;
      const missed = weekTasks.filter((t) => t.status === 'missed').length;
      return K.head('五好任务与发布', weekTasks.length + ' 条会员任务 · 本周完成率 ' + Math.round(done / (weekTasks.length || 1) * 100) + '%', 
        K.btn('发布本周任务', 'releaseWeek', { icon: 'send', cls: 'primary' }), 'FIVE-GOOD / TASK') +
        K.kpis([
          { k: '任务模板', v: tasks.length, unit: '个', d: '启用 ' + tasks.filter((t) => t.on).length + ' 个' },
          { k: '本周任务', v: weekTasks.length, unit: '条', d: '已发布 ' + fg.ops.lastRelease },
          { k: '已完成', v: done, unit: '条', d: '完成率 ' + Math.round(done / (weekTasks.length || 1) * 100) + '%', tone: 'up' },
          { k: '待完成', v: due, unit: '条', d: '今晚 24:00 截止', tone: 'down' },
          { k: '已错过', v: missed, unit: '条', d: '触发召回', tone: 'down' }
        ]) +
        '<div class="grid g-2">' +
          K.panel({ title: '任务模板库', sub: '按维度与周次发布', flush: true,
            actions: K.btn('新增任务', 'newTask', { icon: 'plus', cls: 'ghost sm' }),
            body: UI.table([
              { label: '任务', render: (t) => '<div><div class="strong">' + E(t.title) + '</div><div class="small muted">第 ' + t.week + ' 周 · ' + E(t.type) + '</div></div>' },
              { label: '维度', render: (t) => UI.pill({ eat: '吃好', sleep: '睡好', move: '动好', mind: '心好', check: '查好' }[t.dim], 'grey') },
              { label: '积分', align: 'right', render: (t) => '<span class="tnum">' + t.points + '</span>' },
              { label: '启用', render: (t) => '<button class="switch ' + (t.on ? 'on' : '') + '" data-toggle="fivegood.tasks.' + UI.ix(tasks, t) + '.on"></button>' },
              { label: '', align: 'right', render: (t) => '<div class="rowact"><button data-act="editTask" data-id="' + t.id + '">' + I('edit', 14) + '</button></div>' }
            ], tasks) }) +
          K.panel({ title: '本周发布状态', sub: '发布后自动写入会员任务', body: '<div class="hn-release"><div class="hn-release-top"><div><b>第 4 周 · 五好任务</b><span>计划发布 ' + fg.ops.nextRelease + ' · 截止 ' + fg.ops.taskWindow + ' 天</span></div><em>' + (fg.ops.autoNudge ? '自动提醒开' : '自动提醒关') + '</em></div>' +
            ['eat', 'sleep', 'move', 'mind', 'check'].map((k) => {
              const n = tasks.filter((t) => t.dim === k && t.on).length;
              return '<div class="hn-dimrow"><span>' + ({ eat: '吃好', sleep: '睡好', move: '动好', mind: '心好', check: '查好' }[k]) + '</span><div class="progress"><b style="width:' + (n / 3 * 100) + '%"></b></div><b class="tnum">' + n + '</b></div>';
            }).join('') +
            '<div class="note teal">发布动作会为每位会员生成本周任务，并按低活跃规则自动触达。</div></div>' }) +
        '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '会员任务进度', sub: '按人追踪，不按模板自嗨', flush: true, body: UI.table([
          { label: '会员', render: (t) => '<div class="cellflex">' + UI.avatar((FG().memberProfiles.find((m) => m.id === t.memberId) || {}).name || '—') + '<div><div class="strong">' + E((FG().memberProfiles.find((m) => m.id === t.memberId) || {}).name || '—') + '</div><div class="small muted">第 ' + t.week + ' 周 · ' + E(t.type) + '</div></div></div>' },
          { label: '任务', render: (t) => '<div><b>' + E(t.title) + '</b><div class="small muted">' + ({ eat: '吃好', sleep: '睡好', move: '动好', mind: '心好', check: '查好' }[t.dim]) + '</div></div>' },
          { label: '截止', render: (t) => '<span class="small tnum">' + t.due + '</span>' },
          { label: '状态', render: (t) => UI.pill(t.status === 'done' ? '已完成' : t.status === 'due' ? '待完成' : '已错过', t.status === 'done' ? 'green' : t.status === 'due' ? 'amber' : 'red') },
          { label: '积分', align: 'right', render: (t) => '<span class="tnum">' + (t.status === 'done' ? '+' + t.points : '—') + '</span>' },
          { label: '', align: 'right', render: (t) => '<div class="rowact"><button data-act="nudgeTask" data-id="' + t.id + '">' + I('send', 14) + '</button><button data-act="reviewTask" data-id="' + t.id + '">' + I('eye', 14) + '</button></div>' }
        ], weekTasks.filter((t) => t.status !== 'done' || t.week === 4).map((t) => Object.assign({ _id: t.id }, t))) });
    },
    actions: {
      releaseWeek() {
        const fg = FG();
        const templates = fg.tasks.filter((t) => t.on);
        fg.memberProfiles.forEach((m) => {
          templates.forEach((t) => {
            const exists = fg.memberTasks.some((x) => x.memberId === m.id && x.week === 5 && x.title === t.title);
            if (!exists) Store.pushItem('fivegood.memberTasks', { id: 'mt' + Date.now() + Math.floor(Math.random() * 99), memberId: m.id, dim: t.dim, week: 5, title: t.title, type: t.type, points: t.points, due: '2026-11-15', status: 'due', evidence: '', reviewed: false }, '发布会员任务');
          });
          if (m.stage === '低活跃') touch(m.name, '企业微信', '五好第 5 周任务已发布', '已送达');
        });
        Store.set('fivegood.ops.lastRelease', '2026-11-08', '任务发布周期');
        Store.set('fivegood.ops.nextRelease', '2026-11-15', '任务发布周期');
        UI.toast('第 5 周任务已发布并触达低活跃会员'); App.refresh();
      },
      newTask() {
        UI.formDrawer({ title: '新增任务模板', sub: '会员每周会收到该维度的任务', icon: 'check',
          fields: [
            { key: 'dim', label: '维度', type: 'select', options: [{ v: 'eat', l: '吃好' }, { v: 'sleep', l: '睡好' }, { v: 'move', l: '动好' }, { v: 'mind', l: '心好' }, { v: 'check', l: '查好' }] },
            { key: 'week', label: '周次', type: 'num', value: 5 },
            { key: 'title', label: '任务标题' }, { key: 'type', label: '类型', type: 'select', options: ['打卡', '评估', '动作'] },
            { key: 'points', label: '积分', type: 'num', value: 10 }
          ],
          onSave(v) {
            Store.pushItem('fivegood.tasks', { id: 't' + Date.now(), dim: v.dim, week: v.week, title: v.title || '新任务', type: v.type, points: v.points, on: true }, '新增任务模板');
            UI.toast('任务模板已创建'); App.refresh();
          } });
      },
      editTask(d) {
        const t = FG().tasks.find((x) => x.id === d.id), i = FG().tasks.indexOf(t);
        UI.drawer({ title: '编辑任务模板', sub: t.title, icon: 'check',
          body: '<div class="formsec"><h4>任务</h4>' + UI.fInput({ label: '标题', value: t.title, path: 'fivegood.tasks.' + i + '.title' }) +
            UI.fSelect({ label: '维度', value: t.dim, options: [{ v: 'eat', l: '吃好' }, { v: 'sleep', l: '睡好' }, { v: 'move', l: '动好' }, { v: 'mind', l: '心好' }, { v: 'check', l: '查好' }], path: 'fivegood.tasks.' + i + '.dim' }) +
            UI.fNum({ label: '周次', value: t.week, path: 'fivegood.tasks.' + i + '.week' }) + UI.fNum({ label: '积分', value: t.points, path: 'fivegood.tasks.' + i + '.points' }) +
            UI.fSwitch({ label: '启用', value: t.on, path: 'fivegood.tasks.' + i + '.on' }) + '</div>',
          onOk() { UI.toast('任务已保存'); App.refresh(); } });
      },
      nudgeTask(d) {
        const t = FG().memberTasks.find((x) => x.id === d.id), m = FG().memberProfiles.find((x) => x.id === t.memberId);
        touch(m.name, '企业微信', '任务提醒 · ' + t.title, '已送达');
        UI.toast('已提醒 ' + m.name); App.refresh();
      },
      reviewTask(d) {
        const t = FG().memberTasks.find((x) => x.id === d.id);
        UI.modal({ title: '任务详情', desc: t.title + ' · 第 ' + t.week + ' 周', body: '<div class="hn-kv"><div><span>状态</span><b>' + t.status + '</b></div><div><span>证据</span><b>' + E(t.evidence || '未上传') + '</b></div><div><span>审核</span><b>' + (t.reviewed ? '已审核' : '待审核') + '</b></div><div><span>积分</span><b>' + t.points + '</b></div></div>', okText: '关闭' });
      }
    }
  };

  /* ============================================================ 五好打卡审核 */
  P['fg-coach'] = {
    app: 'all', grp: 'v.ops', papp: 'employee', title: '五好打卡审核', sub: '教练不是监工，审核是为了及时纠偏与给出下一步',
    state: { selected: 'ck1' },
    render() {
      const fg = FG(), st = P['fg-coach'].state;
      const pending = fg.checkins.filter((c) => c.status === 'pending');
      const sel = fg.checkins.find((c) => c.id === st.selected) || pending[0] || fg.checkins[0];
      return K.head('五好打卡审核', pending.length + ' 条待审核 · 24h 内完成率 88%', 
        K.btn('批量通过', 'batchApprove', { icon: 'check', cls: 'primary' }), 'FIVE-GOOD / COACH') +
        '<div class="hn-coach">' +
          '<div class="hn-check-list">' + pending.map((c) => '<button class="hn-checkcard ' + (sel.id === c.id ? 'on' : '') + '" data-act="selectCheckin" data-id="' + c.id + '"><header><div>' + UI.avatar(c.name) + '<div><b>' + E(c.name) + '</b><span>' + E(c.title) + '</span></div></div>' + UI.pill({ eat: '吃好', sleep: '睡好', move: '动好', mind: '心好', check: '查好' }[c.dim], 'grey') + '</header><p>' + E(c.evidence) + '</p><footer><em>' + c.at + '</em><span>待审核</span></footer></button>').join('') + (!pending.length ? '<div class="hn-empty">今日已清空</div>' : '') + '</div>' +
          '<div class="hn-check-main">' +
            '<div class="hn-ph-hero"><div><span class="hn-ph-tag">打卡证据</span><h2>' + E(sel.name) + ' · ' + E(sel.title) + '</h2><p>' + E(sel.at) + ' · ' + E(sel.coach) + ' · ' + ({ eat: '吃好', sleep: '睡好', move: '动好', mind: '心好', check: '查好' }[sel.dim]) + '</p><div class="hn-goal">' + E(sel.evidence) + '</div></div><div class="hn-ph-score"><b>' + (sel.status === 'pending' ? '待审' : sel.status === 'approved' ? '已过' : '驳回') + '</b><span>审核状态</span></div></div>' +
            '<div class="hn-evidence"><div class="hn-evidence-thumb">' + I('image', 30) + '<span>证据预览</span></div><div><b>审核要点</b><p>' + E(sel.note || '核对时间、内容与任务要求是否一致。') + '</p><div class="chips"><span class="chip on">时间有效</span><span class="chip">内容匹配</span><span class="chip">可计入积分</span></div></div></div>' +
            '<div class="hn-review-actions"><button class="btn primary" data-act="approveCheckin" data-id="' + sel.id + '">' + I('check', 15) + '通过并计分</button><button class="btn" data-act="rejectCheckin" data-id="' + sel.id + '">' + I('x', 15) + '驳回并说明</button><button class="btn" data-act="coachNudge" data-id="' + sel.id + '">' + I('message', 15) + '发教练提醒</button></div>' +
          '</div></div>';
    },
    actions: {
      selectCheckin(d) { P['fg-coach'].state.selected = d.id; App.refresh(true); },
      approveCheckin(d) {
        const c = FG().checkins.find((x) => x.id === d.id);
        Store.saveItem('fivegood.checkins', { id: c.id, status: 'approved', note: '审核通过，已计入积分。' }, 'id', '打卡审核');
        const task = FG().memberTasks.find((x) => x.id === c.taskId) || FG().memberTasks.find((x) => x.memberId === c.memberId && x.title === c.title);
        if (task) Store.saveItem('fivegood.memberTasks', { id: task.id, status: 'done', reviewed: true, evidence: c.evidence }, 'id', '任务完成');
        touch(c.name, '企业微信', '打卡已通过 · ' + c.title, '已送达');
        UI.toast(c.name + ' 打卡已通过'); App.refresh();
      },
      rejectCheckin(d) {
        const c = FG().checkins.find((x) => x.id === d.id);
        UI.formDrawer({ title: '驳回打卡', sub: c.name + ' · ' + c.title, icon: 'message',
          fields: [{ key: 'note', label: '驳回原因', type: 'area', rows: 3, value: '证据不完整，请补充后重新提交。' }],
          onSave(v) {
            Store.saveItem('fivegood.checkins', { id: c.id, status: 'rejected', note: v.note }, 'id', '打卡驳回');
            const task = FG().memberTasks.find((x) => x.id === c.taskId) || FG().memberTasks.find((x) => x.memberId === c.memberId && x.title === c.title);
            if (task) Store.saveItem('fivegood.memberTasks', { id: task.id, status: 'due', reviewed: false }, 'id', '任务退回');
            touch(c.name, '企业微信', '打卡需补充 · ' + c.title, '已送达');
            UI.toast('已驳回并通知会员'); App.refresh();
          } });
      },
      batchApprove() {
        FG().checkins.filter((c) => c.status === 'pending').forEach((c) => {
          Store.saveItem('fivegood.checkins', { id: c.id, status: 'approved', note: '批量审核通过。' }, 'id', '批量审核');
        });
        UI.toast('待审核打卡已批量通过'); App.refresh();
      },
      coachNudge(d) {
        const c = FG().checkins.find((x) => x.id === d.id);
        touch(c.name, '企业微信', '教练提醒 · ' + c.title, '已送达');
        UI.toast('教练提醒已发送'); App.refresh();
      }
    }
  };

  /* ============================================================ 五好信号与升级 */
  P['fg-escalation'] = {
    app: 'all', grp: 'v.ops', papp: 'employee', title: '五好信号与健康升级', sub: '五好不是打分游戏，低分要能进入健康管理',
    render() {
      const fg = FG();
      const open = fg.escalations.filter((e) => e.status === 'open');
      const high = fg.escalations.filter((e) => e.level === 'high' && e.status === 'open');
      return K.head('五好信号与健康升级', open.length + ' 条待处理 · ' + high.length + ' 条高风险信号', 
        K.btn('规则配置', 'goRules', { icon: 'sliders' }), 'FIVE-GOOD / ESCALATION') +
        K.kpis([
          { k: '待处理信号', v: open.length, unit: '条', d: '按风险与时限', tone: 'down' },
          { k: '高风险', v: high.length, unit: '条', d: '24h 内转计划' },
          { k: '已转化', v: fg.escalations.filter((e) => e.status === 'converted').length, unit: '条', d: '进入健康管理' },
          { k: '自动升级', v: '5', unit: '条规则', d: '五维 + 活跃度' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '待处理信号', sub: '从五维、任务、活跃度与心理量表而来', flush: true,
            body: '<div style="padding:4px 18px 12px">' + fg.escalations.map((e) => {
              const p = memberProfileOf(e.memberId);
              return '<div class="hn-signal ' + e.level + '"><span class="hn-signal-ic">' + I(e.level === 'high' ? 'activity' : 'target', 16) + '</span><div><div class="row"><b>' + E(e.name) + ' · ' + E(e.from) + '</b>' + riskPill(e.level) + '</div><p>' + E(e.signal) + '</p><em>' + e.at + ' · ' + E(e.action) + '</em></div><div class="hn-signal-act">' +
                (e.status === 'open' ? '<button class="btn sm primary" data-act="convert" data-id="' + e.id + '">转健康计划</button><button class="vmini" data-act="dismissSignal" data-id="' + e.id + '">关闭</button>' : '<span class="pill green">已转化</span>') + '</div></div>';
            }).join('') + '</div>' }) +
          '<div class="stack">' +
            K.panel({ title: '升级规则', sub: '信号 → 动作 → 责任人', flush: true, body: '<div style="padding:4px 18px 12px">' +
              [['睡眠维度 < 65 分 2 周', '推荐睡眠改善计划', '王雪'], ['心理量表高风险', 'EAP 24h 回访，暂停营销', '李咨询师'], ['连续 7 天无任务', '降低任务门槛 + 召回', '陈放'], ['体检维度未完成', '预约体检 + 复查提醒', '健康管理中心'], ['五维总分 < 55', '转五高一重共管', '赵医生']].map((x) =>
                '<div class="hn-rule"><span>' + I('target', 14) + '</span><div><b>' + x[0] + '</b><em>' + x[1] + '</em></div><strong>' + x[2] + '</strong></div>').join('') + '</div>' }) +
            K.panel({ title: '升级后必须发生什么', body: '<div class="small mut" style="line-height:1.9">① 生成健康管理计划<br>② 生成首次随访任务<br>③ 写入会员时间线<br>④ 暂停营销类触达<br>⑤ 30 天后回看结果</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      goRules() { App.go('fg-config'); },
      convert(d) {
        const e = FG().escalations.find((x) => x.id === d.id);
        const p = H().profiles.find((x) => x.name === e.name && x.memberId === e.memberId) || H().profiles.find((x) => x.name === e.name);
        if (!p) { UI.toast('找不到对应健康档案，请先补建档案', 'warn'); return; }
        const tpl = e.from === '心好' ? 'pt4' : e.from === '睡好' ? 'pt2' : 'pt1';
        const existing = activePlanOf(p.id);
        const plan = existing || newPlan(p.id, tpl, p.owner);
        newFollowup(p.id, plan.id, existing ? '信号升级复核' : '升级后首次随访', '2026-11-09', p.owner, existing ? '已存在管理计划，补充一次风险复核' : '确认风险信号与计划目标');
        Store.saveItem('fivegood.escalations', { id: e.id, status: 'converted' }, 'id', '信号转化');
        Store.saveItem('health.profiles', { id: p.id, risk: e.level === 'high' ? 'high' : p.risk }, 'id', '风险升级');
        log('五好转健康管理', e.name, e.signal);
        UI.toast(e.name + (existing ? ' 已在管理中，已补充风险复核' : ' 已转入健康管理并生成随访')); App.refresh();
      },
      dismissSignal(d) {
        const e = FG().escalations.find((x) => x.id === d.id);
        Store.saveItem('fivegood.escalations', { id: e.id, status: 'converted', action: '已人工关闭：' + e.action }, 'id', '关闭信号');
        UI.toast('信号已关闭'); App.refresh();
      }
    }
  };

  /* ============================================================ 五好隐私与授权 */
  P['fg-privacy'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '五好数据授权与隐私', sub: '数据能用，但必须知道边界、授权与谁看过',
    render() {
      const fg = FG();
      const signed = fg.consents.filter((c) => c.status === 'signed').length;
      return K.head('五好数据授权与隐私', signed + '/' + fg.consents.length + ' 位会员完成授权', 
        K.btn('导出授权清单', 'exportP', { icon: 'download' }), 'FIVE-GOOD / PRIVACY') +
        K.kpis([
          { k: '授权覆盖', v: Math.round(signed / (fg.consents.length || 1) * 100), unit: '%', d: '待签署 ' + (fg.consents.length - signed) + ' 人', tone: 'down' },
          { k: '心理数据', v: '独立', unit: '授权', d: '不进企业报告' },
          { k: '数据保留', v: '24', unit: '个月', d: '服务结束后' },
          { k: '访问审计', v: '100', unit: '%', d: '健管与教练可追溯' }
        ]) +
        '<div class="grid g-2">' +
          K.panel({ title: '数据使用边界', sub: '运营可配置，但不可越过产品红线', body: '<div class="hn-scopes">' +
            [['健康档案', '体检、指标、风险标签', true, '全部健管师'], ['服务记录', '预约、履约、权益核销', true, '服务与健管'], ['心理数据', '情绪打卡、PHQ/GAD、咨询记录', false, '仅本人 + 授权咨询师'], ['企业报告', '匿名化人数、比例、部门分布', true, '企业管理员']].map((x) =>
              '<div class="hn-scope ' + (x[2] ? 'ok' : 'lock') + '"><span>' + I(x[2] ? 'check' : 'lock', 15) + '</span><div><b>' + x[0] + '</b><em>' + x[1] + '</em></div><strong>' + x[3] + '</strong></div>').join('') + '</div>' +
            '<div class="note warn">' + I('shield', 15) + '<span>心理数据默认不进入企业报告、不做营销画像、不向直线经理展示。任何导出都必须二次确认。</span></div>' }) +
          K.panel({ title: '隐私开关', sub: '改动会留痕', body: '<div class="stack" style="gap:14px">' +
            UI.fSwitch({ label: '心理数据独立授权', value: fg.ops.mindPrivacy, path: 'fivegood.ops.mindPrivacy' }) +
            UI.fSwitch({ label: '企业报告匿名化', value: fg.ops.reportAnonymize, path: 'fivegood.ops.reportAnonymize' }) +
            UI.fSwitch({ label: '低活跃自动召回', value: fg.ops.autoNudge, path: 'fivegood.ops.autoNudge' }) +
            UI.fSwitch({ label: '风险信号自动升级', value: fg.ops.riskEscalation, path: 'fivegood.ops.riskEscalation' }) +
            UI.fInput({ label: '数据保留周期', value: fg.ops.retention, path: 'fivegood.ops.retention' }) + '</div>' }) +
        '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '会员授权台账', sub: '授权范围可核对、可撤回', flush: true, body: UI.table([
          { label: '会员', render: (c) => '<div class="cellflex">' + UI.avatar(c.name) + '<div><div class="strong">' + E(c.name) + '</div><div class="small muted">' + E(c.version) + '</div></div></div>' },
          { label: '状态', render: (c) => UI.pill(c.status === 'signed' ? '已签署' : '待签署', c.status === 'signed' ? 'green' : 'amber') },
          { label: '健康档案', render: (c) => c.scopes.health ? UI.pill('允许', 'green') : UI.pill('未授权', 'grey') },
          { label: '服务记录', render: (c) => c.scopes.service ? UI.pill('允许', 'green') : UI.pill('未授权', 'grey') },
          { label: '心理数据', render: (c) => c.scopes.mind ? UI.pill('单独授权', 'violet') : UI.pill('不采集', 'grey') },
          { label: '企业报告', render: (c) => c.scopes.report ? UI.pill('匿名纳入', 'blue') : UI.pill('不纳入', 'grey') },
          { label: '签署时间', render: (c) => '<span class="small tnum">' + (c.at || '—') + '</span>' },
          { label: '', align: 'right', render: (c) => '<div class="rowact"><button data-act="toggleConsent" data-id="' + c.id + '">' + I('edit', 14) + '</button></div>' }
        ], fg.consents.map((c) => Object.assign({ _id: c.id }, c))) });
    },
    actions: {
      exportP() { UI.toast('授权清单已导出'); },
      toggleConsent(d) {
        const c = FG().consents.find((x) => x.id === d.id);
        const next = c.status === 'signed' ? 'pending' : 'signed';
        Store.saveItem('fivegood.consents', { id: c.id, status: next, at: next === 'signed' ? '2026-11-08' : '' }, 'id', '授权状态');
        UI.toast(next === 'signed' ? '授权已补签' : '授权已撤回'); App.refresh();
      }
    }
  };

  /* ============================================================ 五好运营闭环 */
  P['fg-loop'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '五好运营闭环', sub: '从招募到续约，每一段都要有转化与下一步',
    render() {
      const fg = FG();
      const stages = [
        ['招募', 120, '进入评估'],
        ['评估', 96, '完成问卷'],
        ['入组', 82, '签署授权'],
        ['任务', 68, '本周执行'],
        ['打卡', 51, '提交证据'],
        ['审核', 44, '教练通过'],
        ['报告', 38, '月度报告'],
        ['续约', 31, '季度续约']
      ];
      const low = fg.memberProfiles.filter((m) => m.stage === '低活跃');
      return K.head('五好运营闭环', '会员运营不是发任务，是持续把低活跃拉回、把风险送进管理', 
        K.btn('运行召回旅程', 'runLoop', { icon: 'send', cls: 'primary' }), 'FIVE-GOOD / LOOP') +
        '<div class="hn-loop">' + stages.map((s, i) => '<div class="hn-loop-step"><span>0' + (i + 1) + '</span><b>' + s[1] + '</b><em>' + s[0] + '</em><small>' + s[2] + '</small>' + (i ? '<i>' + Math.round(s[1] / (stages[i - 1][1] || 1) * 100) + '%</i>' : '') + '</div>').join('') + '</div>' +
        K.kpis([
          { k: '入组转化', v: '68', unit: '%', d: '评估 → 入组' },
          { k: '任务完成', v: '75', unit: '%', d: '本周 51/68' },
          { k: '审核时效', v: '88', unit: '%', d: '24h 内完成' },
          { k: '风险升级', v: '5', unit: '条', d: '转健康计划' },
          { k: '季度续约', v: '31', unit: '%', d: '意向 82%' }
        ]) +
        '<div class="grid g-2">' +
          K.panel({ title: '自动旅程', sub: '触发 → 触达 → 结果', flush: true, body: '<div style="padding:4px 18px 12px">' +
            [['低活跃召回', '连续 7 天无任务', '企业微信 + 短信', low.length + ' 人'], ['任务截止提醒', '截止前 24 小时', '企业微信', '12 人'], ['月度报告', '每月 1 日', '站内信', '6 人'], ['风险升级', '五维或量表命中', 'EAP / 健管师', '5 条'], ['续约提醒', '到期前 30 天', '客户成功', '2 人']].map((x) =>
              '<div class="hn-journey"><span>' + I('send', 15) + '</span><div><b>' + x[0] + '</b><em>' + x[1] + ' · ' + x[2] + '</em></div><strong>' + x[3] + '</strong></div>').join('') + '</div>' }) +
          K.panel({ title: '低活跃名单', sub: '先拉回，再谈升级', flush: true,
            actions: K.btn('全部提醒', 'nudgeLow', { cls: 'ghost sm' }),
            body: low.length ? '<div style="padding:4px 18px 12px">' + low.map((m) => '<div class="listrow"><div class="meta"><b>' + E(m.name) + '</b><span>' + E(m.tier) + ' · 最近 ' + m.lastActive + ' · ' + E(m.next) + '</span></div><button class="vmini" data-act="nudgeOne" data-id="' + m.id + '">提醒</button></div>').join('') + '</div>' : K.empty('暂无低活跃会员') }) +
        '</div>';
    },
    actions: {
      runLoop() {
        FG().memberProfiles.filter((m) => m.stage === '低活跃').forEach((m) => touch(m.name, '企业微信', '五好召回旅程', '已送达'));
        UI.toast('召回旅程已运行，已触达低活跃会员'); App.refresh();
      },
      nudgeLow() {
        FG().memberProfiles.filter((m) => m.stage === '低活跃').forEach((m) => touch(m.name, '企业微信', '五好任务提醒', '已送达'));
        UI.toast('已批量提醒'); App.refresh();
      },
      nudgeOne(d) {
        const m = FG().memberProfiles.find((x) => x.id === d.id);
        touch(m.name, '企业微信', '五好召回提醒', '已送达');
        UI.toast('已提醒 ' + m.name); App.refresh();
      }
    }
  };
})();
