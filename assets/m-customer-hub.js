/* ============================================================================
   全渠道客户管理 · 客户总览 / 客户经营台 / 客户 360
   一个客户只出现一次；服务、体检、预约、权益、订单、内容与触达全部回流到人。
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};

  const SOURCES = [
    { id: 'employee', label: '职工健康 H5', short: '职工端', color: '#0B63E5', icon: 'stethoscope' },
    { id: 'brand', label: '品牌站 H5', short: '品牌站', color: '#0AA39A', icon: 'hospital' },
    { id: 'camp', label: '减重营 H5', short: '减重营', color: '#3F8CFF', icon: 'spark' },
    { id: 'wecom', label: '企业微信', short: '企微', color: '#C8871A', icon: 'message' },
    { id: 'web', label: '官网咨询', short: '官网', color: '#8B7CF6', icon: 'globe' },
    { id: 'xhs', label: '小红书', short: '小红书', color: '#E15B64', icon: 'heart' },
    { id: 'offline', label: '线下活动', short: '线下', color: '#D9892B', icon: 'users' },
    { id: 'exam', label: '体检活动', short: '体检', color: '#0A9E94', icon: 'shield' }
  ];
  const LIFE = [
    { id: 'prospect', label: '潜客', tone: 'grey', color: '#94A7C0' },
    { id: 'new', label: '新客', tone: 'blue', color: '#3F8CFF' },
    { id: 'active', label: '活跃', tone: 'green', color: '#0AA39A' },
    { id: 'highvalue', label: '高价值', tone: 'amber', color: '#C8871A' },
    { id: 'dormant', label: '沉默', tone: 'grey', color: '#8496AD' },
    { id: 'risk', label: '流失风险', tone: 'red', color: '#D9503F' }
  ];
  const LEADS = [
    { name: '张曼', phone: '186****0921', company: '海辰医疗', dept: '人力资源部', position: 'HRBP', source: 'xhs', firstAt: '2026-11-06', lastAt: '2026-11-08', tags: ['体检咨询', '小红书'], owner: '客户成功部', note: '关注企业体检套餐与检后解读。' },
    { name: '李睿', phone: '139****7710', company: '亦庄科技', dept: '行政部', position: '行政经理', source: 'web', firstAt: '2026-11-04', lastAt: '2026-11-07', tags: ['官网留资', '企业福利'], owner: '张伟', note: '官网咨询企业健康福利，等待方案。' },
    { name: '王宁', phone: '137****2048', company: '青禾资本', dept: '投后管理', position: '投资经理', source: 'brand', firstAt: '2026-10-28', lastAt: '2026-11-06', tags: ['分院网络', '高净值'], owner: '客户成功部', note: '浏览分院网络与企业家健康管理中心。' },
    { name: '郑然', phone: '151****6630', company: '博远制造', dept: 'EHS', position: 'EHS 负责人', source: 'offline', firstAt: '2026-09-18', lastAt: '2026-10-12', tags: ['急救培训', '线下活动'], owner: '周琳', note: '线下安全月活动留资，暂未跟进。' },
    { name: '孙禾', phone: '158****3362', company: '南城银行', dept: '工会', position: '工会干事', source: 'wecom', firstAt: '2026-11-01', lastAt: '2026-11-08', tags: ['五好生活', '企微'], owner: '王雪', note: '咨询员工五好生活与心理关怀。' },
    { name: '陈思远', phone: '133****8819', company: '远望设计', dept: '创始人办公室', position: '合伙人', source: 'exam', firstAt: '2026-10-20', lastAt: '2026-11-05', tags: ['企业家体检', '体检活动'], owner: '赵医生', note: '体检活动后咨询年度健康管理。' }
  ];

  const src = (id) => SOURCES.find((s) => s.id === id) || SOURCES[0];
  const life = (id) => LIFE.find((l) => l.id === id) || LIFE[0];
  const db = () => Store.db;
  const minDate = (a, b) => (!a ? b : !b ? a : a < b ? a : b);
  const maxDate = (a, b) => (!a ? b : !b ? a : a > b ? a : b);
  const day = (s) => (s || '').slice(0, 10);

  function ensure() {
    const d = db();
    if (!d.crm || !Array.isArray(d.crm.customers)) d.crm = { customers: [], interactions: [], built: '' };
    const crm = d.crm;
    let changed = false;
    const names = {};
    crm.customers.forEach((c) => {
      names[c.name] = 1;
      if (!Array.isArray(c.channels) || !c.channels.length) { c.channels = [c.source]; changed = true; }
    });

    const add = (c) => {
      if (!c.name || names[c.name]) return;
      names[c.name] = 1;
      crm.customers.push(c);
      changed = true;
    };

    const health = d.health || { profiles: [], carePlans: [], followups: [], serviceCases: [] };
    const fg = (d.fivegood && d.fivegood.memberProfiles) || [];
    const students = (d.versionall && d.versionall.students) || [];
    const bookings = (d.employee && d.employee.bookings) || [];
    const grants = (d.shared && d.shared.grants) || [];
    const touches = (d.shared && d.shared.touches) || [];
    const allNames = [];
    const seen = {};
    const collect = (n) => { if (n && !seen[n]) { seen[n] = 1; allNames.push(n); } };
    (health.profiles || []).forEach((p) => collect(p.name));
    students.forEach((s) => collect(s.name));
    bookings.forEach((b) => collect(b.person));
    fg.forEach((m) => collect(m.name));
    grants.forEach((g) => collect(g.holder));
    touches.forEach((t) => collect(t.holder));

    allNames.forEach((name, i) => {
      if (names[name]) return;
      const p = (health.profiles || []).find((x) => x.name === name);
      const s = students.find((x) => x.name === name);
      const b = bookings.find((x) => x.person === name);
      const m = fg.find((x) => x.name === name);
      const gs = grants.filter((x) => x.holder === name);
      const ts = touches.filter((x) => x.holder === name);
      const source = s ? 'camp'
        : b ? 'employee'
          : p && /EAP/i.test(p.source || '') ? 'wecom'
            : p && /体检/.test(p.source || '') ? 'exam'
              : m ? 'employee' : 'brand';
      const channels = [];
      if (bookings.some((x) => x.person === name)) channels.push('employee');
      if (s) channels.push('camp');
      if (m) channels.push('employee');
      if (p && /EAP/i.test(p.source || '')) channels.push('wecom');
      if (p && /体检/.test(p.source || '')) channels.push('exam');
      if (!channels.length) channels.push(source);
      let firstAt = minDate(p && p.joined, s && s.joined);
      firstAt = minDate(firstAt, m && m.joined);
      firstAt = minDate(firstAt, b && b.created);
      firstAt = firstAt || '2026-01-01';
      let lastAt = maxDate(p && p.lastContact, s && s.joined);
      lastAt = maxDate(lastAt, m && m.lastActive);
      lastAt = maxDate(lastAt, b && b.created);
      ts.forEach((t) => { lastAt = maxDate(lastAt, t.at); });
      const bookingCount = bookings.filter((x) => x.person === name).length;
      const activeGrants = gs.filter((g) => g.status === 'active').length;
      const lifecycle = lastAt < '2026-10-01' ? 'risk'
        : lastAt < '2026-10-20' ? 'dormant'
          : (s && s.completion >= 85) || bookingCount >= 2 || activeGrants >= 2 ? 'highvalue'
            : firstAt >= '2026-10-20' ? 'new' : 'active';
      add({
        id: 'c' + (100 + i), name,
        phone: (p && p.phone) || (b && b.phone) || (s && s.phone) || '—',
        gender: (p && p.sex) || (s && s.gender === 'male' ? '男' : '女') || '—',
        age: (p && p.age) || (s && s.age) || '—',
        company: (p && p.company) || '示例科技', dept: (p && p.dept) || (b && b.dept) || (s ? '减重营' : '—'),
        position: p ? '员工' : s ? '学员' : '—', source,
        sourceLabel: src(source).label,
        channels: Array.from(new Set(channels)),
        firstAt: day(firstAt), lastAt: day(lastAt), lifecycle,
        owner: (p && p.owner) || (s && s.dietitian) || (m && m.coach) || '客户成功部',
        tags: ((p && p.tags) || (s && s.tags) || []).slice(0, 4),
        consents: (p && p.consent) || 'pending',
        risk: (p && p.risk) || (s && s.risk) || (m && m.risk) || 'low',
        note: p ? '来自健康档案与职工端服务记录。' : s ? '来自减重营学员档案。' : '来自跨端服务记录。'
      });
    });

    LEADS.forEach((x, i) => {
      if (names[x.name]) return;
      add(Object.assign({
        id: 'c9' + i, gender: i % 2 ? '男' : '女', age: 30 + i,
        lifecycle: x.lastAt < '2026-10-20' ? 'risk' : 'prospect',
        consents: 'pending', risk: 'low', sourceLabel: src(x.source).label,
        channels: [x.source]
      }, x));
    });

    if (!crm.interactions || !crm.interactions.length) {
      const articles = ((d.shared && d.shared.contents) || []).filter((c) => c.type === 'article');
      crm.interactions = [];
      crm.customers.forEach((c, i) => {
        if (articles.length) {
          const a = articles[i % articles.length];
          crm.interactions.push({ id: 'ci' + i, name: c.name, type: 'content', title: '阅读《' + a.title + '》', detail: '停留 ' + (1 + i % 4) + ' 分 ' + (10 + i * 3 % 50) + ' 秒 · ' + src(c.source).short, at: c.lastAt + ' 2' + (i % 4) + ':1' + (i % 6) });
        }
        if (i % 2 === 0) {
          crm.interactions.push({ id: 'cv' + i, name: c.name, type: 'visit', title: '访问「' + (c.source === 'brand' ? '分院网络' : c.source === 'camp' ? '营期详情' : '我的健康') + '」', detail: src(c.source).label + ' · 页面停留 ' + (1 + i % 3) + ' 分钟', at: c.firstAt + ' 10:0' + (i % 9) });
        }
      });
      changed = true;
    }
    crm.built = '9.1';
    if (changed) Store.persist();
    return crm;
  }

  function customerOf(key) {
    const list = ensure().customers;
    return list.find((c) => c.id === key || c.name === key) || list[0];
  }

  function tracesOf(c) {
    const d = db();
    const h = d.health || {};
    const out = [];
    const add = (at, type, title, detail, tone) => { if (at) out.push({ at: String(at), type, title, detail, tone: tone || 'blue' }); };
    add(c.firstAt + ' 09:00', '来源', '客户首次进入 · ' + src(c.source).label, '渠道来源：' + src(c.source).label + (c.note ? ' · ' + c.note : ''), 'teal');
    ((d.employee && d.employee.bookings) || []).filter((b) => b.person === c.name).forEach((b) => {
      add(b.created, '服务预约', '预约「' + b.service + '」', b.date + ' ' + b.time + ' · ' + b.org + ' · ' + ({ pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }[b.status] || b.status), b.status === 'cancelled' ? 'grey' : 'blue');
    });
    const p = (h.profiles || []).find((x) => x.name === c.name);
    if (p) {
      add(p.joined, '健康档案', '建立健康档案', '来源：' + (p.source || '职工健康') + ' · 风险：' + ({ high: '高', medium: '中', low: '低' }[p.risk] || p.risk), 'violet');
      if (p.exam && p.exam.date) add(p.exam.date, '体检报告', '体检报告归档 · ' + p.exam.org, (p.exam.abnormal || []).length ? '异常项：' + p.exam.abnormal.join('、') : '未见明显异常', (p.exam.abnormal || []).length ? 'amber' : 'teal');
      (h.carePlans || []).filter((x) => x.profileId === p.id).forEach((x) => add(x.start, '管理计划', '建立「' + x.name + '」', x.owner + ' 负责 · 目标：' + x.goal + ' · 依从性 ' + x.adherence + '%', 'teal'));
      (h.followups || []).filter((x) => x.profileId === p.id).forEach((x) => add(x.due + ' ' + (x.time || '09:00'), '随访', x.type + ' · ' + x.owner, x.status === 'completed' ? '已完成：' + (x.outcome || '') : '状态：' + ({ due: '待执行', overdue: '已逾期', upcoming: '待安排' }[x.status] || x.status) + ' · ' + (x.note || ''), x.status === 'overdue' ? 'red' : 'amber'));
      (h.outcomes || []).filter((x) => x.profileId === p.id).forEach((x) => add(x.at, '结果评估', x.metric + ' ' + x.current + x.unit, '基线 ' + x.baseline + ' → 当前 ' + x.current + ' · 目标 ' + x.target + ' · ' + ({ improving: '改善中', reached: '已达标', stable: '稳定' }[x.status] || x.status), 'teal'));
    }
    (h.serviceCases || []).filter((x) => x.person === c.name).forEach((x) => {
      add((x.due || '').slice(0, 10), '服务履约', x.service + ' · ' + x.stage, x.owner + ' · ' + x.next + ' · ' + (x.benefit || ''), x.risk === 'high' ? 'red' : 'blue');
    });
    const s = ((d.versionall && d.versionall.students) || []).find((x) => x.name === c.name);
    if (s) {
      add(s.joined, '减重营', '加入减重营', '当前体重 ' + s.weight + 'kg · 连续打卡 ' + s.streak + ' 天 · 完成度 ' + s.completion + '%', 'blue');
      const w = (((d.versionall || {}).records || {}).weight || []).filter((r) => r.studentId === s.id).slice(-1)[0];
      if (w) add(w.date, '营期打卡', '体重打卡 ' + w.weight + 'kg', '营养师 ' + s.dietitian + (w.dietitianComment ? ' · ' + w.dietitianComment : ''), 'teal');
    }
    const m = (((d.fivegood || {}).memberProfiles) || []).find((x) => x.name === c.name);
    if (m) add(m.joined, '五好生活', '加入五好生活 · ' + m.tier, '阶段 ' + m.stage + ' · 连续 ' + m.streak + ' 天 · 教练 ' + m.coach, 'violet');
    (((d.fivegood || {}).checkins) || []).filter((x) => x.name === c.name).forEach((x) => add(x.at, '打卡审核', x.title + ' · ' + (x.status === 'approved' ? '已通过' : x.status === 'rejected' ? '已退回' : '待审核'), x.evidence + ' · ' + (x.note || ''), x.status === 'pending' ? 'amber' : 'teal'));
    (((d.shared || {}).grants) || []).filter((x) => x.holder === c.name).forEach((x) => {
      const b = (((d.shared || {}).benefits) || []).find((y) => y.id === x.benefitId) || {};
      add(x.at, '权益发放', '获得「' + (b.name || x.benefitId) + '」', '共 ' + x.qty + ' 次 · 剩余 ' + x.remaining + ' 次 · ' + x.expires + ' 到期', 'amber');
    });
    (((d.shared || {}).redemptions) || []).filter((x) => x.holder === c.name).forEach((x) => {
      const b = (((d.shared || {}).benefits) || []).find((y) => y.id === x.benefitId) || {};
      add(x.at, '权益核销', '使用「' + (b.name || x.benefitId) + '」', x.channel + ' · 单号 ' + x.order, 'teal');
    });
    (((d.shared || {}).touches) || []).filter((x) => x.holder === c.name).forEach((x) => add(x.at, '运营触达', x.title + ' · ' + x.channel, x.tpl + ' · ' + x.status, 'violet'));
    ((d.versionall || {}).claims || []).filter((x) => x.studentName === c.name).forEach((x) => add(x.claimDate, '领奖订单', x.tierName, '状态 ' + x.status + (x.tracking ? ' · 物流 ' + x.tracking : ''), 'amber'));
    ((d.versionall || {}).exchanges || []).filter((x) => x.studentName === c.name).forEach((x) => add(x.date, '积分兑换', x.productName, '消耗 ' + x.points + ' 积分 · ' + x.status + (x.tracking ? ' · ' + x.tracking : ''), 'blue'));
    ((ensure().interactions || [])).filter((x) => x.name === c.name).forEach((x) => add(x.at, '内容互动', x.title, x.detail, 'teal'));
    return out.sort((a, b) => (a.at < b.at ? 1 : -1));
  }

  function statOf(c) {
    const d = db();
    const bookings = ((d.employee && d.employee.bookings) || []).filter((b) => b.person === c.name);
    const p = ((d.health || {}).profiles || []).find((x) => x.name === c.name);
    const grants = (((d.shared || {}).grants) || []).filter((x) => x.holder === c.name && x.status === 'active');
    const traces = tracesOf(c);
    const spend = bookings.length * 1280 + (((d.versionall || {}).students || []).some((x) => x.name === c.name) ? 2980 : 0);
    return { bookings, profile: p, grants, traces, spend };
  }

  function lifecyclePill(id) {
    const l = life(id);
    return '<span class="crm-life ' + l.tone + '"><i style="background:' + l.color + '"></i>' + l.label + '</span>';
  }

  function sourcePill(id) {
    const s = src(id);
    return '<span class="crm-src" style="color:' + s.color + ';border-color:' + s.color + '33;background:' + s.color + '0f">' + I(s.icon, 11) + s.label + '</span>';
  }

  function customerItem(c) {
    return '<button class="crm-list-item" data-act="crmPick" data-id="' + E(c.name) + '">' +
      UI.avatar(c.name) +
      '<div class="ci-main"><b>' + E(c.name) + '</b><span>' + E(c.company || '') + ' · ' + E(c.dept || '—') + '</span></div>' +
      '<div class="ci-side">' + sourcePill(c.source) + '<em>' + E(c.lastAt) + '</em></div></button>';
  }

  function kpiSpark(c, traces) {
    return '<span class="crm-count">' + traces.length + '</span>';
  }

  /* ================================================================ 客户总览 */
  P['crm-hub'] = {
    app: 'all', title: '客户总览', sub: '不同渠道进来的客户，最终都汇到同一个人',
    grp: 'v.ops', state: {},
    render() {
      const crm = ensure();
      const all = crm.customers;
      const counts = {};
      SOURCES.forEach((s) => { counts[s.id] = all.filter((c) => (c.channels || [c.source]).indexOf(s.id) >= 0); });
      const active = all.filter((c) => c.lifecycle === 'active' || c.lifecycle === 'highvalue');
      const high = all.filter((c) => c.lifecycle === 'highvalue');
      const risk = all.filter((c) => c.lifecycle === 'risk' || c.lifecycle === 'dormant');
      const newMonth = all.filter((c) => c.firstAt >= '2026-11-01');
      const needTouch = high.filter((c) => c.lastAt < '2026-11-02');
      const examNoPlan = all.filter((c) => {
        const p = ((db().health || {}).profiles || []).find((x) => x.name === c.name);
        return p && (p.exam.abnormal || []).length && !((db().health.carePlans || []).some((x) => x.profileId === p.id));
      });
      const lead48 = all.filter((c) => c.lifecycle === 'prospect' && c.lastAt < '2026-11-07');
      const stages = [
        { id: 'prospect', label: '潜客', n: all.filter((c) => c.lifecycle === 'prospect').length, hint: '未成交 / 待跟进' },
        { id: 'new', label: '新客', n: all.filter((c) => c.lifecycle === 'new').length, hint: '首次进入 30 天内' },
        { id: 'active', label: '活跃', n: all.filter((c) => c.lifecycle === 'active').length, hint: '近 30 天有服务或互动' },
        { id: 'highvalue', label: '高价值', n: high.length, hint: '多服务 / 权益 / 营期' },
        { id: 'risk', label: '沉默与风险', n: risk.length, hint: '需要召回或人工介入' }
      ];
      return K.head('客户总览', '从渠道到服务再到健康结果，客户经营看这一页就够',
        K.btn('新建客户', 'crmNew', { icon: 'plus' }) + K.btn('导出客户', 'crmExport', { icon: 'download', cls: 'primary' }), 'CUSTOMER / OVERVIEW') +
        K.kpis([
          { k: '客户总数', v: all.length, unit: '人', d: '本月新增 ' + newMonth.length + ' 人', icon: 'users' },
          { k: '活跃客户', v: active.length, unit: '人', d: '占比 ' + Math.round(active.length / Math.max(1, all.length) * 100) + '%', icon: 'activity', tone: 'up' },
          { k: '高价值', v: high.length, unit: '人', d: '需要专属经营', icon: 'star' },
          { k: '沉默 / 风险', v: risk.length, unit: '人', d: '建议 48 小时内召回', icon: 'clock', tone: 'down' },
          { k: '待跟进线索', v: lead48.length, unit: '条', d: '超过 48 小时未触达', icon: 'send', tone: 'down' }
        ]) +
        '<div class="crm-overview">' +
          '<section class="crm-channel-grid">' + SOURCES.map((s) => {
            const list = counts[s.id] || [];
            const hv = list.filter((c) => c.lifecycle === 'highvalue' || c.lifecycle === 'active').length;
            return '<button class="crm-channel" data-act="crmChannel" data-id="' + s.id + '">' +
              '<span class="cc-ic" style="background:' + s.color + '14;color:' + s.color + '">' + I(s.icon, 16) + '</span>' +
              '<div><b>' + s.label + '</b><em>' + list.length + ' 位客户 · 活跃 ' + hv + '</em></div>' +
              '<strong>' + (list.length ? Math.round(hv / list.length * 100) : 0) + '%</strong></button>';
          }).join('') + '</section>' +
          '<aside class="crm-funnel panel"><div class="panel-h"><h3>客户生命周期</h3><span class="sub">从线索到高价值</span></div>' +
            '<div class="crm-funnel-list">' + stages.map((s, i) =>
              '<button data-act="crmLife" data-id="' + s.id + '"><span class="cf-n">' + (i + 1) + '</span>' +
              '<div><b>' + s.label + '</b><em>' + s.hint + '</em></div><strong>' + s.n + '</strong></button>').join('') +
            '</div></aside>' +
        '</div>' +
        '<div class="crm-todo-grid">' +
          '<section class="panel"><div class="panel-h"><h3>今天该跟进谁</h3><span class="sub">按优先级自动生成</span></div><div class="crm-todos">' +
            (needTouch.length ? needTouch.slice(0, 3).map((c) =>
              '<div class="crm-todo"><span class="ct-dot amber"></span><div><b>' + E(c.name) + ' · 高价值客户 7 天未触达</b><em>' + E(c.company + ' · 最近 ' + c.lastAt) + '</em></div>' +
              '<button class="vmini" data-act="crmOpen" data-id="' + c.id + '">去经营</button></div>').join('') : '') +
            (examNoPlan.length ? examNoPlan.slice(0, 2).map((c) =>
              '<div class="crm-todo"><span class="ct-dot red"></span><div><b>' + E(c.name) + ' · 体检异常未进入管理</b><em>建议建立 12 周管理计划并安排随访</em></div>' +
              '<button class="vmini" data-act="crmOpen" data-id="' + c.id + '">处理</button></div>').join('') : '') +
            (lead48.length ? lead48.slice(0, 3).map((c) =>
              '<div class="crm-todo"><span class="ct-dot blue"></span><div><b>' + E(c.name) + ' · 线索 48 小时未跟进</b><em>' + E(src(c.source).label + ' · 留资于 ' + c.firstAt) + '</em></div>' +
              '<button class="vmini" data-act="crmOpen" data-id="' + c.id + '">跟进</button></div>').join('') : '') +
            (!needTouch.length && !examNoPlan.length && !lead48.length ? '<div class="vempty-sm">今天没有高优先级待办</div>' : '') +
          '</div></section>' +
          '<section class="panel"><div class="panel-h"><h3>最近活跃</h3><span class="sub">点击整行进入 360</span><div class="right"><button class="vmini" data-act="go" data-id="crm-customer">全部客户 ›</button></div></div>' +
            '<div class="crm-recent">' + all.slice().sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1)).slice(0, 6).map((c) =>
              '<button class="crm-recent-row" data-act="crmOpen" data-id="' + c.id + '">' + UI.avatar(c.name) +
              '<div><b>' + E(c.name) + '</b><span>' + E(c.company + ' · ' + c.dept) + '</span></div>' + sourcePill(c.source) +
              '<em>' + E(c.lastAt) + '</em>' + I('chevron', 12) + '</button>').join('') + '</div></section>' +
        '</div>';
    },
    actions: {
      crmChannel(d) { App.go('crm-customer', { source: d.id }); },
      crmLife(d) { App.go('crm-customer', { life: d.id }); },
      crmOpen(d) { App.go('crm-360', { id: d.id }); },
      crmNew() { P['crm-customer'].actions.crmNew(); },
      crmExport() { P['crm-customer'].actions.crmExport(); }
    }
  };

  /* ================================================================ 全渠道客户 */
  P['crm-customer'] = {
    app: 'all', title: '全渠道客户', sub: '按渠道、生命周期和风险经营客户，而不是查一张姓名表',
    grp: 'v.ops', state: { source: '', life: '', owner: '' },
    render(ctx) {
      ensure();
      const st = P['crm-customer'].state;
      if (ctx && ctx.source) st.source = ctx.source;
      if (ctx && ctx.life) st.life = ctx.life;
      const all = ensure().customers;
      const owners = Array.from(new Set(all.map((c) => c.owner))).filter(Boolean);
      let list = all.filter((c) => (!st.source || (c.channels || [c.source]).indexOf(st.source) >= 0) && (!st.life || c.lifecycle === st.life));
      if (st.owner) list = list.filter((c) => c.owner === st.owner);
      const channelCounts = SOURCES.map((s) => ({ s, n: all.filter((c) => (c.channels || [c.source]).indexOf(s.id) >= 0).length }));
      return K.head('全渠道客户', all.length + ' 位客户 · ' + SOURCES.length + ' 个来源渠道 · 每个人只有一份档案',
        K.btn('新建客户', 'crmNew', { icon: 'plus' }) +
        K.btn('导出电话名单', 'crmExportPhones', { icon: 'download' }) +
        K.btn('导出当前视图', 'crmExport', { icon: 'download' }), 'CUSTOMER / ALL CHANNELS') +
        '<div class="crm-foot-note" style="margin:0 0 10px">' + I('shield', 14) + ' 当前为演示客户池：新增、发权益、建计划、随访与跟进只写入本机台账，没有接真实账号、服务端与消息通道。触达方式仅支持导出手机号后人工电话联系。</div>' +
        '<div class="crm-filterbar">' +
          '<div class="crm-source-tabs"><button class="' + (!st.source ? 'on' : '') + '" data-act="crmChannel" data-id="">全部 ' + all.length + '</button>' +
            channelCounts.map((x) => '<button class="' + (st.source === x.s.id ? 'on' : '') + '" data-act="crmChannel" data-id="' + x.s.id + '">' +
              '<i style="background:' + x.s.color + '"></i>' + x.s.short + ' ' + x.n + '</button>').join('') + '</div>' +
          '<div class="crm-filter-right">' + K.seg([{ id: '', label: '全部阶段' }].concat(LIFE.map((l) => ({ id: l.id, label: l.label }))), st.life, 'crmLife') +
            '<div class="minisearch">' + I('search', 13) + '<input placeholder="搜索姓名 / 公司 / 部门 / 标签" data-live-filter="crm"></div></div>' +
        '</div>' +
        '<div class="crm-owner-line"><span>负责人</span>' +
          '<button class="' + (!st.owner ? 'on' : '') + '" data-act="crmOwner" data-id="">全部</button>' +
          owners.map((o) => '<button class="' + (st.owner === o ? 'on' : '') + '" data-act="crmOwner" data-id="' + E(o) + '">' + E(o) + '</button>').join('') +
          '<em>共 ' + list.length + ' 位</em></div>' +
        '<div class="crm-card-grid">' + list.map((c) => {
          const stt = statOf(c);
          return '<button class="crm-card" data-act="crmOpen" data-id="' + c.id + '" data-filter-item="crm" data-text="' + E([c.name, c.company, c.dept, c.phone, c.tags.join(' '), c.owner].join(' ')) + '">' +
            '<div class="crm-card-top">' + UI.avatar(c.name) +
              '<div class="crm-card-id"><b>' + E(c.name) + '<span>' + E(c.gender + ' · ' + c.age + '岁') + '</span></b><em>' + E(c.company || '—') + ' · ' + E(c.dept || '—') + '</em></div>' +
              lifecyclePill(c.lifecycle) + '</div>' +
            '<div class="crm-card-src">' + sourcePill(c.source) + '<em>负责人 ' + E(c.owner) + '</em></div>' +
            '<div class="crm-card-tags">' + (c.tags.length ? c.tags.slice(0, 3).map((t) => '<span>' + E(t) + '</span>').join('') : '<span>暂无标签</span>') + '</div>' +
            '<div class="crm-card-stats"><div><b>' + stt.bookings.length + '</b><span>预约</span></div>' +
              '<div><b>' + stt.grants.length + '</b><span>有效权益</span></div>' +
              '<div><b>' + stt.traces.length + '</b><span>痕迹</span></div>' +
              '<div><b>' + E(c.lastAt.slice(5)) + '</b><span>最近活跃</span></div></div>' +
            '<div class="crm-card-foot"><span>' + (c.risk === 'high' ? '高风险 · 需重点关注' : c.lifecycle === 'prospect' ? '待转化线索' : '服务关系正常') + '</span><em>打开 360 ' + I('chevron', 12) + '</em></div>' +
          '</button>';
        }).join('') + '</div>' +
        (list.length ? '' : K.empty('当前筛选下没有客户', '切换渠道、生命周期或负责人再试')) +
        '<div class="crm-foot-note">' + I('link', 14) + ' 客户 360 会把演示台账里的预约、权益、健康计划、五好打卡、订单与跟进行动聚合到一条时间线；这些记录与线上 H5 暂不互通。</div>';
    },
    actions: {
      crmChannel(d) { P['crm-customer'].state.source = d.id; App.refresh(); },
      crmLife(d) { P['crm-customer'].state.life = d.id; App.refresh(); },
      crmOwner(d) { P['crm-customer'].state.owner = d.id; App.refresh(); },
      crmOpen(d) { App.go('crm-360', { id: d.id }); },
      crmNew() {
        UI.formDrawer({
          title: '新建客户', sub: '先建档，再补服务与健康信息', icon: 'users',
          fields: [
            { key: 'name', label: '姓名' }, { key: 'phone', label: '手机号' },
            { key: 'company', label: '企业' }, { key: 'dept', label: '部门' },
            { key: 'source', label: '来源渠道', type: 'select', options: SOURCES.map((s) => ({ v: s.id, l: s.label })) },
            { key: 'owner', label: '负责人', type: 'select', options: ['客户成功部', '王雪', '赵医生', '陈放', '张伟', '周琳'] },
            { key: 'note', label: '需求与备注', type: 'area', rows: 2 }
          ],
          onSave(v) {
            if (!v.name) { UI.toast('请填写客户姓名', 'warn'); return; }
            const crm = ensure();
            crm.customers.unshift({
              id: 'c' + Date.now(), name: v.name, phone: v.phone || '—', gender: '—', age: '—',
              company: v.company || '—', dept: v.dept || '—', position: '—', source: v.source || 'web',
              sourceLabel: src(v.source || 'web').label, firstAt: '2026-11-09', lastAt: '2026-11-09',
              lifecycle: 'prospect', owner: v.owner || '客户成功部', tags: ['新建客户'],
              consents: 'pending', risk: 'low', note: v.note || ''
            });
            Store.persist(); UI.toast('客户已创建'); App.refresh();
          }
        });
      },
      crmExport() {
        const rows = [['客户', '手机', '企业', '部门', '来源', '生命周期', '负责人', '最近活跃', '标签']].concat(
          ensure().customers.map((c) => [c.name, c.phone, c.company, c.dept, c.sourceLabel, life(c.lifecycle).label, c.owner, c.lastAt, c.tags.join('/')]));
        const csv = rows.map((r) => r.map((x) => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
        a.download = 'pku-customers.csv'; a.click(); UI.toast('客户清单已导出');
      },
      crmExportPhones() {
        const st = P['crm-customer'].state;
        const list = ensure().customers.filter((c) => (!st.source || (c.channels || [c.source]).indexOf(st.source) >= 0) && (!st.life || c.lifecycle === st.life) && (!st.owner || c.owner === st.owner));
        const rows = [['姓名', '手机号', '企业', '部门', '负责人', '来源', '最近活跃', '建议动作']].concat(
          list.map((c) => [c.name, c.phone, c.company, c.dept, c.owner, c.sourceLabel || c.source, c.lastAt,
            c.risk === 'high' ? '优先电话回访' : c.lifecycle === 'prospect' ? '电话确认需求' : '电话服务回访']));
        const csv = rows.map((r) => r.map((x) => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
        a.download = 'pku-phone-list.csv'; a.click();
        UI.toast('已导出 ' + list.length + ' 条电话名单');
      }
    }
  };

  /* ================================================================ 客户 360 */
  P['crm-360'] = {
    app: 'all', title: '客户 360', sub: '一个人在所有渠道、所有服务里的完整使用痕迹',
    grp: 'v.ops', state: { sel: '', tab: 'overview' },
    render(ctx) {
      ensure();
      const st = P['crm-360'].state;
      if (ctx && ctx.id) st.sel = ctx.id;
      const list = ensure().customers;
      const sel = customerOf(st.sel || list[0].id);
      st.sel = sel.id;
      const traces = tracesOf(sel);
      const stt = statOf(sel);
      const tab = st.tab || 'overview';
      const tabs = [['overview', '概览'], ['profile', '个人资料'], ['service', '服务与预约'], ['health', '健康管理'], ['trade', '订单与权益'], ['content', '内容与触达'], ['timeline', '全部时间线']];
      return K.head('客户 360', '服务、体检、计划、随访、权益、订单、内容与触达，都回到同一个人',
        K.btn('返回客户列表', 'go', { id: 'crm-customer', icon: 'users' }) +
        K.btn('导出客户档案', 'crmExport', { icon: 'download', cls: 'primary' }), 'CUSTOMER / 360') +
        '<div class="crm360">' +
        '<aside class="crm360-side"><div class="crm360-search">' + I('search', 14) + '<input placeholder="搜索姓名 / 手机 / 企业" data-live-filter="c360x"></div>' +
          '<div class="crm360-count">' + list.length + ' 位客户 · 全部渠道</div>' +
          '<div class="crm360-list">' + list.slice().sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1)).map((c) =>
            '<button class="crm-list-item ' + (c.id === sel.id ? 'on' : '') + '" data-act="crmPick" data-id="' + E(c.name) + '" data-filter-item="c360x" data-text="' + E(c.name + ' ' + c.phone + ' ' + c.company + ' ' + c.dept) + '">' +
              UI.avatar(c.name) + '<div class="ci-main"><b>' + E(c.name) + '</b><span>' + E(c.company || '') + ' · ' + E(c.dept || '—') + '</span></div>' +
              '<div class="ci-side">' + lifecyclePill(c.lifecycle) + '<em>' + E(c.lastAt.slice(5)) + '</em></div></button>').join('') +
          '</div></aside>' +
        '<section class="crm360-main">' +
          '<header class="crm360-hero">' + UI.avatar(sel.name) +
            '<div class="crm360-id"><div class="crm360-name"><h2>' + E(sel.name) + '</h2>' + lifecyclePill(sel.lifecycle) + sourcePill(sel.source) +
              (sel.risk === 'high' ? '<span class="pill red">高风险</span>' : '') + '</div>' +
              '<p>' + E(sel.company || '—') + ' · ' + E(sel.dept || '—') + ' · ' + E(sel.phone) + ' · 负责人 ' + E(sel.owner) + ' · 最近活跃 ' + E(sel.lastAt) + '</p>' +
              '<div class="crm360-tags">' + (sel.tags.length ? sel.tags.map((t) => '<span>' + E(t) + '</span>').join('') : '<span>暂无标签</span>') + '</div></div>' +
            '<div class="crm360-actions">' +
              '<button class="vbtn ghost" data-act="crmTouch">' + I('message', 13) + '电话跟进</button>' +
              '<button class="vbtn ghost" data-act="crmGrant">' + I('gift', 13) + '发权益</button>' +
              '<button class="vbtn primary" data-act="crmPlan">' + I('target', 13) + '建管理计划</button>' +
            '</div></header>' +
          '<div class="crm360-kpis">' +
            [['服务预约', stt.bookings.length + ' 次'], ['有效权益', stt.grants.length + ' 项'], ['健康风险', stt.profile ? ({ high: '高', medium: '中', low: '低' }[stt.profile.risk] || '—') : '未建档'], ['互动痕迹', traces.length + ' 条']].map((x) =>
              '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>').join('') + '</div>' +
          '<div class="crm360-tabs">' + tabs.map((x) => '<button data-act="crmTab" data-id="' + x[0] + '" class="' + (tab === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
          '<div class="crm360-body">' + crm360Body(sel, tab, stt, traces) + '</div>' +
        '</section></div>';
    },
    actions: {
      crmPick(d) { P['crm-360'].state.sel = d.id; P['crm-360'].state.tab = 'overview'; App.refresh(); },
      crmTab(d) { P['crm-360'].state.tab = d.id; App.refresh(); },
      crmGrant() { grantTo(customerOf(P['crm-360'].state.sel)); },
      crmTouch() { touchTo(customerOf(P['crm-360'].state.sel)); },
      crmPlan() { planFor(customerOf(P['crm-360'].state.sel)); },
      crmFollow() { followFor(customerOf(P['crm-360'].state.sel)); },
      crmExport() { P['crm-customer'].actions.crmExport(); }
    }
  };

  function block(title, body, sub, actions) {
    return '<section class="crm-block"><header><h3>' + E(title) + '</h3>' + (sub ? '<span>' + E(sub) + '</span>' : '') + (actions ? '<div class="right">' + actions + '</div>' : '') + '</header>' + body + '</section>';
  }

  function traceRows(traces) {
    return '<div class="crm-timeline">' + traces.map((t) =>
      '<div class="crm-tl-row"><span class="crm-tl-dot ' + (t.tone || 'blue') + '"></span>' +
      '<div class="crm-tl-main"><b>' + E(t.title) + '</b><em>' + E(t.detail || '') + '</em></div>' +
      '<div class="crm-tl-meta"><span>' + E(t.type) + '</span><time>' + E(t.at) + '</time></div></div>').join('') + '</div>';
  }

  function crm360Body(sel, tab, stt, traces) {
    const d = db();
    const p = stt.profile;
    const h = d.health || {};
    const bookings = stt.bookings;
    const grants = ((d.shared || {}).grants || []).filter((g) => g.holder === sel.name);
    const reds = ((d.shared || {}).redemptions || []).filter((r) => r.holder === sel.name);
    const touches = ((d.shared || {}).touches || []).filter((t) => t.holder === sel.name);
    const ints = (ensure().interactions || []).filter((x) => x.name === sel.name);
    const claims = ((d.versionall || {}).claims || []).filter((x) => x.studentName === sel.name);
    const exchanges = ((d.versionall || {}).exchanges || []).filter((x) => x.studentName === sel.name);
    const plans = p ? (h.carePlans || []).filter((x) => x.profileId === p.id) : [];
    const fus = p ? (h.followups || []).filter((x) => x.profileId === p.id) : [];
    const outcomes = p ? (h.outcomes || []).filter((x) => x.profileId === p.id) : [];
    const cases = (h.serviceCases || []).filter((x) => x.person === sel.name);
    const member = (((d.fivegood || {}).memberProfiles) || []).find((x) => x.name === sel.name);
    const student = (((d.versionall || {}).students) || []).find((x) => x.name === sel.name);

    if (tab === 'profile') {
      return '<div class="crm-2col">' +
        block('身份与联系', '<dl class="vkv">' +
          [['姓名', sel.name], ['性别 / 年龄', sel.gender + ' / ' + sel.age], ['手机号', sel.phone], ['企业', sel.company], ['部门', sel.dept], ['岗位', sel.position], ['来源渠道', src(sel.source).label], ['覆盖渠道', (sel.channels || [sel.source]).map((x) => src(x).short).join(' / ')], ['首次进入', sel.firstAt], ['最近活跃', sel.lastAt]].map((r) =>
            '<dt>' + E(r[0]) + '</dt><dd>' + E(r[1]) + '</dd>').join('') + '</dl>') +
        block('经营关系', '<dl class="vkv">' + [['负责人', sel.owner], ['生命周期', life(sel.lifecycle).label], ['健康风险', p ? ({ high: '高', medium: '中', low: '低' }[p.risk] || '—') : '未建档'], ['授权状态', sel.consents === 'signed' ? '已签署' : '待签署'], ['客户标签', sel.tags.join('、') || '—'], ['需求备注', sel.note || '—']].map((r) =>
          '<dt>' + E(r[0]) + '</dt><dd>' + E(r[1]) + '</dd>').join('') + '</dl>' +
          '<div class="note" style="margin-top:10px">客户资料变更会同步到三端账号与权益系统；健康数据只读，不在这里手工修改临床指标。</div>') + '</div>';
    }

    if (tab === 'service') {
      return '<div class="crm-2col">' +
        block('职工端预约', bookings.length ? bookings.map((b) =>
          '<div class="crm-row"><span class="vdot ' + (b.status === 'pending' ? 'amber' : b.status === 'cancelled' ? 'grey' : 'teal') + '"></span>' +
          '<div><b>' + E(b.service) + '</b><span>' + E(b.date + ' ' + b.time + ' · ' + b.org) + '</span></div><em>' + E({ pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }[b.status] || b.status) + '</em></div>').join('') : '<div class="vempty-sm">还没有职工端预约</div>') +
        block('服务履约', cases.length ? cases.map((c) =>
          '<div class="crm-row"><span class="vdot ' + (c.risk === 'high' ? 'red' : 'blue') + '"></span><div><b>' + E(c.service) + '</b><span>' + E(c.owner + ' · ' + c.next) + '</span></div><em>' + E(c.stage) + '</em></div>').join('') : '<div class="vempty-sm">暂无服务履约案例</div>') +
        (cases.length ? '' : '<div class="crm-wide-note">新预约确认后会在这里生成履约案例，并同步到「健康服务履约台」。</div>') + '</div>';
    }

    if (tab === 'health') {
      if (!p) return '<div class="crm-empty-panel">' + I('stethoscope', 26) + '<b>还没有健康档案</b><span>可从体检报告、风险评估或服务履约结果建立档案；建档后才能创建管理计划与随访。</span>' +
        '<div class="row" style="margin-top:12px;gap:8px"><button class="btn sm primary" data-act="crmPlan">' + I('plus', 13) + '发起健康评估</button></div></div>';
      const metrics = p.metrics || {};
      return '<div class="crm-2col">' +
        block('健康档案', '<div class="crm-metric-grid">' +
          [['血压', (metrics.bpSys || '—') + '/' + (metrics.bpDia || '—'), 'mmHg'], ['空腹血糖', metrics.glucose || '—', 'mmol/L'], ['BMI', metrics.bmi || '—', ''], ['睡眠', metrics.sleep || '—', '小时'], ['步数', metrics.steps || '—', '步/日'], ['LDL-C', metrics.ldl || '—', 'mmol/L']].map((x) =>
            '<div><span>' + x[0] + '</span><b>' + x[1] + '<em>' + x[2] + '</em></b></div>').join('') + '</div>' +
          '<div class="crm-exam"><div class="row" style="justify-content:space-between"><b>最近体检 · ' + E(p.exam.date) + '</b><span class="pill ' + ((p.exam.abnormal || []).length ? 'amber' : 'green') + '">' + ((p.exam.abnormal || []).length ? '异常 ' + p.exam.abnormal.length + ' 项' : '无明显异常') + '</span></div>' +
          '<div class="small mut" style="margin-top:6px;line-height:1.7">' + E(p.exam.summary) + '</div>' +
          ((p.exam.abnormal || []).length ? '<div class="crm-abn">' + p.exam.abnormal.map((a) => '<span>' + E(a) + '</span>').join('') + '</div>' : '') + '</div>') +
        block('管理计划', plans.length ? plans.map((x) =>
          '<div class="crm-plan"><div class="row" style="justify-content:space-between"><b>' + E(x.name) + '</b>' + UI.pill(x.status === 'active' ? '进行中' : '已结束', x.status === 'active' ? 'green' : 'grey') + '</div>' +
          '<div class="small mut" style="margin-top:4px">' + E(x.owner + ' · ' + x.start + ' → ' + x.end + ' · 依从性 ' + x.adherence + '%') + '</div>' +
          '<div class="progress" style="margin-top:7px"><b style="width:' + x.adherence + '%"></b></div></div>').join('') : '<div class="vempty-sm">暂无管理计划</div>') +
        block('随访与结果', (fus.length || outcomes.length) ?
          fus.slice(0, 4).map((f) => '<div class="crm-row"><span class="vdot ' + (f.status === 'overdue' ? 'red' : f.status === 'completed' ? 'teal' : 'amber') + '"></span><div><b>' + E(f.type) + '</b><span>' + E(f.due + ' ' + f.time + ' · ' + f.owner) + '</span></div><em>' + E({ due: '待执行', overdue: '已逾期', upcoming: '待安排', completed: '已完成' }[f.status] || f.status) + '</em></div>').join('') +
          outcomes.slice(0, 4).map((o) => '<div class="crm-row"><span class="vdot teal"></span><div><b>' + E(o.metric + ' ' + o.current + o.unit) + '</b><span>基线 ' + o.baseline + ' → 目标 ' + o.target + '</span></div><em>改善中</em></div>').join('')
          : '<div class="vempty-sm">暂无随访与结果记录</div>',
          '', '<button class="vmini" data-act="crmFollow">+ 安排随访</button>') + '</div>';
    }

    if (tab === 'trade') {
      const benefitName = (id) => ((((d.shared || {}).benefits) || []).find((b) => b.id === id) || {}).name || id;
      return '<div class="crm-2col">' +
        block('权益钱包', grants.length ? grants.map((g) =>
          '<div class="crm-row"><span class="vdot ' + (g.status === 'active' ? 'teal' : 'grey') + '"></span><div><b>' + E(benefitName(g.benefitId)) + '</b><span>剩余 ' + g.remaining + ' / ' + g.qty + ' · ' + E(g.expires) + ' 到期</span></div><em>' + (g.status === 'active' ? '可用' : '已用完') + '</em></div>').join('') : '<div class="vempty-sm">暂无权益</div>',
          '', '<button class="vmini" data-act="crmGrant">+ 发放</button>') +
        block('核销记录', reds.length ? reds.map((r) =>
          '<div class="crm-row"><span class="vdot amber"></span><div><b>' + E(benefitName(r.benefitId)) + '</b><span>' + E(r.channel + ' · ' + r.order) + '</span></div><em>' + E(r.at) + '</em></div>').join('') : '<div class="vempty-sm">暂无核销记录</div>') +
        block('领奖与兑换', (claims.length || exchanges.length) ?
          claims.map((x) => '<div class="crm-row"><span class="vdot amber"></span><div><b>领奖 · ' + E(x.tierName) + '</b><span>' + E(x.claimDate + (x.tracking ? ' · ' + x.tracking : '')) + '</span></div><em>' + E(x.status) + '</em></div>').join('') +
          exchanges.map((x) => '<div class="crm-row"><span class="vdot blue"></span><div><b>积分兑换 · ' + E(x.productName) + '</b><span>' + E(x.date + ' · ' + x.points + ' 积分') + '</span></div><em>' + E(x.status) + '</em></div>').join('')
          : '<div class="vempty-sm">暂无订单</div>') + '</div>';
    }

    if (tab === 'content') {
      return '<div class="crm-2col">' +
        block('触达记录', touches.length ? touches.map((t) =>
          '<div class="crm-row"><span class="vdot violet"></span><div><b>' + E(t.title) + '</b><span>' + E(t.channel + ' · ' + t.tpl) + '</span></div><em>' + E(t.status) + '</em></div>').join('') : '<div class="vempty-sm">暂无触达</div>',
          '', '<button class="vmini" data-act="crmTouch">+ 记录跟进</button>') +
        block('内容互动', ints.length ? ints.map((x) =>
          '<div class="crm-row"><span class="vdot teal"></span><div><b>' + E(x.title) + '</b><span>' + E(x.detail) + '</span></div><em>' + E(x.at) + '</em></div>').join('') : '<div class="vempty-sm">暂无内容互动</div>') +
        block('五好生活', member ? '<dl class="vkv"><dt>会员版本</dt><dd>' + E(member.tier) + '</dd><dt>当前阶段</dt><dd>' + E(member.stage) + '</dd><dt>任务完成</dt><dd>' + member.tasksDone + ' / ' + member.tasksDue + '</dd><dt>连续打卡</dt><dd>' + member.streak + ' 天</dd><dt>责任教练</dt><dd>' + E(member.coach) + '</dd></dl>' : '<div class="vempty-sm">未加入五好生活</div>') + '</div>';
    }

    if (tab === 'timeline') {
      return '<div class="crm-timeline-head"><div><b>' + traces.length + ' 条使用痕迹</b><span>按时间倒序 · 覆盖来源、预约、体检、计划、随访、权益、订单、内容与触达</span></div>' +
        '<div class="crm-tl-filter">' + ['全部', '服务', '健康', '权益', '内容'].map((x, i) => '<button class="' + (i === 0 ? 'on' : '') + '">' + x + '</button>').join('') + '</div></div>' + traceRows(traces);
    }

    const nexts = [];
    if (sel.lifecycle === 'prospect') nexts.push(['线索待转化', '48 小时内完成首次电话沟通，确认企业与需求', 'crmTouch', '立即电话跟进']);
    if (p && (p.exam.abnormal || []).length && !plans.length) nexts.push(['体检异常未管理', '建立 12 周管理计划并安排首次随访', 'crmPlan', '建计划']);
    if (plans.length) nexts.push(['计划进行中', '完成第 ' + (plans[0].week || 1) + ' 周复盘，确认下一阶段任务', 'crmFollow', '安排复盘']);
    if (plans.length && fus.some((f) => f.status === 'overdue')) nexts.push(['随访已逾期', '优先处理逾期随访，避免管理断档', 'crmFollow', '去随访']);
    if (grants.some((g) => g.status === 'active' && g.remaining > 0)) nexts.push(['权益未使用', '电话提醒客户使用即将到期的权益', 'crmTouch', '电话提醒']);
    if (!touches.length) nexts.push(['近期未跟进', '完成一次电话沟通，确认近期健康与服务需求', 'crmTouch', '记录电话跟进']);
    if (!nexts.length) nexts.push(['关系维护中', '保持服务节奏，下一次电话跟进安排在 7 天内', 'crmTouch', '安排电话跟进']);
    return '<div class="crm-overview-grid">' +
      block('客户摘要', '<dl class="vkv">' +
        [['来源', src(sel.source).label], ['企业 / 部门', sel.company + ' / ' + sel.dept], ['负责人', sel.owner], ['生命周期', life(sel.lifecycle).label], ['健康风险', p ? ({ high: '高', medium: '中', low: '低' }[p.risk] || '—') : '未建档'], ['最近体检', p && p.exam ? p.exam.date : '—'], ['有效权益', stt.grants.length + ' 项'], ['互动痕迹', traces.length + ' 条']].map((r) =>
          '<dt>' + E(r[0]) + '</dt><dd>' + E(r[1]) + '</dd>').join('') + '</dl>') +
      block('下一步建议', '<div class="crm-next-list">' + nexts.slice(0, 4).map((x) =>
        '<div class="crm-next"><span>' + I('target', 14) + '</span><div><b>' + x[0] + '</b><em>' + x[1] + '</em></div>' +
        '<button class="vmini primary" data-act="' + x[2] + '">' + x[3] + '</button></div>').join('') + '</div>') +
      block('最近痕迹', traces.slice(0, 6).length ? traceRows(traces.slice(0, 6)) : '<div class="vempty-sm">暂无记录</div>',
        '', '<button class="vmini" data-act="crmTab" data-id="timeline">查看全部 ›</button>', 'crm-wide') +
    '</div>';
  }

  /* ================================================================ 快速动作 */
  function touchProfile(c) {
    const d = db();
    let p = ((d.health || {}).profiles || []).find((x) => x.name === c.name);
    if (p) return p;
    p = {
      id: 'hp' + Date.now(), name: c.name, memberId: '', dept: c.dept, company: c.company,
      age: Number(c.age) || 30, sex: c.gender === '男' ? '男' : '女', phone: c.phone,
      risk: 'low', score: 0, owner: c.owner, source: src(c.source).label, joined: '2026-11-09',
      tags: c.tags.slice(), consent: 'pending', lastContact: '2026-11-09', metrics: {},
      exam: { date: '—', org: '—', abnormal: [], summary: '尚未完成体检或健康评估。' },
      meds: [], allergies: [], lifestyle: ''
    };
    d.health.profiles.push(p);
    Store.mark('health.profiles', '客户建档 · ' + c.name);
    return p;
  }

  function grantTo(c) {
    const benefits = ((db().shared || {}).benefits) || [];
    UI.formDrawer({
      title: '发放权益', sub: c.name + ' · 体检 / EAP / 商城券 / 服务权益', icon: 'gift',
      fields: [
        { key: 'benefitId', label: '权益', type: 'select', options: benefits.map((b) => ({ v: b.id, l: b.name + '（库存 ' + b.stock + '）' })) },
        { key: 'qty', label: '数量', type: 'num', value: 1 },
        { key: 'expires', label: '到期日', value: '2027-12-31' },
        { key: 'note', label: '发放说明', type: 'area', rows: 2 }
      ],
      onSave(v) {
        const b = benefits.find((x) => x.id === v.benefitId) || benefits[0];
        if (!b) { UI.toast('没有可发放的权益', 'warn'); return; }
        Store.pushItem('shared.grants', {
          id: 'gr' + Date.now(), benefitId: b.id, holder: c.name, company: c.company,
          qty: Number(v.qty) || 1, remaining: Number(v.qty) || 1, expires: v.expires || '2027-12-31',
          status: 'active', at: '2026-11-09'
        }, '发放权益 · ' + c.name);
        if (b.stock != null) b.stock = Math.max(0, b.stock - (Number(v.qty) || 1));
        c.lastAt = '2026-11-09';
        Store.persist(); UI.toast('权益已发放给 ' + c.name); App.refresh();
      }
    });
  }

  function touchTo(c) {
    UI.formDrawer({
      title: '记录人工跟进', sub: c.name + ' · 当前仅支持电话人工跟进，未接短信 / 企微', icon: 'message', okText: '登记跟进',
      fields: [
        { key: 'channel', label: '跟进方式', type: 'select', options: ['电话人工跟进'] },
        { key: 'title', label: '跟进主题', value: '健康服务电话回访' },
        { key: 'tpl', label: '通话要点', type: 'area', rows: 3, value: '您好，针对您近期的健康与权益情况，建议安排一次服务跟进。' }
      ],
      hint: '当前没有短信服务商与企业微信接口。保存只会生成人工待办，不会发送任何消息。',
      onSave(v) {
        Store.pushItem('shared.touches', {
          id: 'tc' + Date.now(), holder: c.name, channel: '电话人工跟进',
          tpl: v.tpl || '人工电话回访', title: v.title || '健康服务电话回访', at: '2026-11-09 10:00', status: '待电话跟进'
        }, '人工跟进 · ' + c.name);
        c.lastAt = '2026-11-09';
        Store.persist(); UI.toast('已登记人工跟进，请按手机号电话联系'); App.refresh();
      }
    });
  }

  function planFor(c) {
    const templates = (db().health || {}).planTemplates || [];
    UI.formDrawer({
      title: '建立管理计划', sub: c.name + ' · 计划会自动进入随访工作台', icon: 'target',
      fields: [
        { key: 'templateId', label: '计划模板', type: 'select', options: templates.map((t) => ({ v: t.id, l: t.name + ' · ' + t.weeks + ' 周' })) },
        { key: 'owner', label: '责任人', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师', '健康管理中心'] },
        { key: 'goal', label: '目标', type: 'area', rows: 2, value: '完成风险评估，关键指标改善并按时复测' }
      ],
      onSave(v) {
        const p = touchProfile(c);
        const t = templates.find((x) => x.id === v.templateId) || templates[0];
        if (!t) { UI.toast('没有可用计划模板', 'warn'); return; }
        const planId = 'cp' + Date.now();
        Store.pushItem('health.carePlans', {
          id: planId, profileId: p.id, name: t.name, templateId: t.id,
          goal: v.goal || t.goal, owner: v.owner || c.owner, start: '2026-11-09',
          end: '2027-02-01', week: 1, status: 'active', adherence: 0, nextReview: '2026-11-16',
          service: t.service, milestones: (t.tasks || []).slice(0, 4).map((x, i) => ({ w: i + 1, t: x, done: false }))
        }, '建立管理计划 · ' + c.name);
        Store.pushItem('health.followups', {
          id: 'fu' + Date.now(), profileId: p.id, planId, type: '计划首次随访',
          due: '2026-11-12', time: '10:00', channel: '电话人工跟进', owner: v.owner || c.owner,
          status: 'upcoming', priority: 'normal', note: '确认计划目标与首次任务。'
        }, '安排首次随访 · ' + c.name);
        c.lifecycle = c.lifecycle === 'prospect' ? 'new' : c.lifecycle;
        c.lastAt = '2026-11-09';
        Store.persist(); UI.toast('计划与首次随访已建立'); App.refresh();
      }
    });
  }

  function followFor(c) {
    const p = ((db().health || {}).profiles || []).find((x) => x.name === c.name);
    if (!p) { UI.toast('请先建立健康档案或管理计划', 'warn'); return; }
    UI.formDrawer({
      title: '安排随访', sub: c.name + ' · 会出现在随访工作台', icon: 'clock',
      fields: [
        { key: 'type', label: '随访类型', type: 'select', options: ['健康回访', '指标复核', '用药依从性', '报告解读', '计划复盘'] },
        { key: 'due', label: '随访日期', value: '2026-11-12' },
        { key: 'owner', label: '责任人', type: 'select', options: ['王雪', '赵医生', '陈放', '李咨询师'] },
        { key: 'note', label: '随访重点', type: 'area', rows: 2 }
      ],
      onSave(v) {
        Store.pushItem('health.followups', {
          id: 'fu' + Date.now(), profileId: p.id, planId: '', type: v.type || '健康回访',
          due: v.due || '2026-11-12', time: '10:00', channel: '电话人工跟进', owner: v.owner || c.owner,
          status: 'upcoming', priority: 'normal', note: v.note || ''
        }, '安排随访 · ' + c.name);
        c.lastAt = '2026-11-09';
        Store.persist(); UI.toast('随访已安排'); App.refresh();
      }
    });
  }

  window.CRM = { ensure, tracesOf, sources: SOURCES };
})();
