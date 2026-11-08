/* 排班产能 / 客户 360 / 触达中心 / 报表口径 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine;
  const money = (n) => '¥' + Number(n).toLocaleString('zh-CN');

  EN.ensureOps2 = function () {
    const db = Store.db;
    if (!db.staff) db.staff = [
      { id: 'st1', name: '王雪', role: '营养师', skill: '体重/慢病营养', cap: 16, load: 12, shift: '常白' },
      { id: 'st2', name: '张楠', role: '营养师', skill: '控糖/孕期', cap: 16, load: 14, shift: '常白' },
      { id: 'st3', name: '刘洋', role: '康复师', skill: '运动康复', cap: 24, load: 19, shift: '早晚轮' },
      { id: 'st4', name: '陈放', role: '康复师', skill: '低冲击训练', cap: 24, load: 16, shift: '晚班' },
      { id: 'st5', name: '李研', role: '医师', skill: '体检解读', cap: 12, load: 11, shift: '常白' },
      { id: 'st6', name: '周敏', role: '护士长', skill: '体检执行', cap: 30, load: 22, shift: '常白' }
    ];
    if (!db.shifts) db.shifts = [
      { id: 'sh1', date: '2026-11-08', slot: '08:30', staff: 'st5', booked: 6, cap: 6 },
      { id: 'sh2', date: '2026-11-08', slot: '10:00', staff: 'st5', booked: 5, cap: 6 },
      { id: 'sh3', date: '2026-11-08', slot: '14:00', staff: 'st1', booked: 4, cap: 4 },
      { id: 'sh4', date: '2026-11-09', slot: '08:30', staff: 'st3', booked: 7, cap: 8 },
      { id: 'sh5', date: '2026-11-09', slot: '15:30', staff: 'st6', booked: 9, cap: 10 }
    ];
    if (!db.campaigns) db.campaigns = [
      { id: 'cm1', name: '11 月体检预约提醒', channel: '企业微信', audience: '未预约员工', count: 1240, sent: 1240, open: 62, click: 18, status: 'done', at: '2026-11-03' },
      { id: 'cm2', name: '五好生活内测招募', channel: '站内信', audience: '全员', count: 1780, sent: 1780, open: 41, click: 12, status: 'done', at: '2026-11-05' },
      { id: 'cm3', name: '减重营第 8 期招募', channel: '短信', audience: 'BMI ≥ 28', count: 320, sent: 0, open: 0, click: 0, status: 'draft', at: '' }
    ];
    if (!db.metricsDict) db.metricsDict = [
      { id: 'md1', name: 'GMV', def: '已完成订单金额合计', rule: '含商品与服务，剔除取消', src: '订单中心', owner: '财务' },
      { id: 'md2', name: '服务核销率', def: '已履约 ÷ 已支付', rule: '按自然月', src: '履约清单', owner: '运营' },
      { id: 'md3', name: '毛利率', def: '(结算−成本) ÷ 结算', rule: '服务与商品分开统计', src: '价格与成本', owner: '经营' },
      { id: 'md4', name: '月度活跃率', def: '当月有任一行为的会员 ÷ 在册', rule: '行为含打卡/预约/浏览', src: '行为日志', owner: '运营' },
      { id: 'md5', name: '五好达标率', def: '指数 ≥ 70 的会员占比', rule: '月度快照', src: '五好生活', owner: '健康管理' }
    ];
  };

  /* ---------------- 排班与产能 ---------------- */
  P['trd-capacity'] = {
    app: 'all', grp: 'e.booking', papp: 'employee', title: '排班与产能', sub: '人能接多少单，系统才知道该不该放号', preview: 'emp-home',
    render() {
      EN.ensureOps2();
      const staff = Store.db.staff, shifts = Store.db.shifts;
      const cap = staff.reduce((a, s) => a + s.cap, 0), load = staff.reduce((a, s) => a + s.load, 0);
      const over = staff.filter((s) => s.load / s.cap > 0.9);
      const conflict = shifts.filter((x) => x.booked >= x.cap);
      return K.head('排班与产能', staff.length + ' 人 · 产能利用率 ' + Math.round(load / cap * 100) + '%',
        '<button class="btn primary" data-act="addShift">' + I('calendar', 15) + '排班</button>') +
        K.kpis([
          { k: '在岗人数', v: staff.length, unit: '人', d: '医师 1 · 营养 2 · 康复 2', icon: 'users' },
          { k: '总产能', v: cap, unit: '单/日', d: '已排 ' + load, icon: 'target' },
          { k: '利用率', v: Math.round(load / cap * 100), unit: '%', d: '超 90% 的 ' + over.length + ' 人', tone: over.length ? 'down' : 'up', icon: 'chart' },
          { k: '约满时段', v: conflict.length, unit: '个', d: '需加人或引导改期', tone: 'down', icon: 'clock' }
        ]) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '排班', sub: '按日期与时段', flush: true, body: UI.table([
            { label: '日期', render: (x) => '<span class="tnum small">' + x.date + '</span>' },
            { label: '时段', render: (x) => '<b class="tnum">' + x.slot + '</b>' },
            { label: '责任人', render: (x) => E((staff.find((s) => s.id === x.staff) || {}).name || '—') },
            { label: '占用', w: '150px', render: (x) => '<div class="row" style="gap:8px"><div style="flex:1">' + K.progress(x.booked / x.cap * 100) + '</div><span class="small tnum">' + x.booked + '/' + x.cap + '</span></div>' },
            { label: '状态', render: (x) => x.booked >= x.cap ? UI.pill('约满', 'red') : UI.pill('可约', 'green') }
          ], shifts.map((x) => Object.assign({ _id: x.id }, x))) }) +
          '</div><div class="stack">' +
          K.panel({ title: '人员负荷', body: staff.map((s) =>
            '<div style="margin-bottom:12px"><div class="row small" style="justify-content:space-between"><span>' + E(s.name) + ' · ' + E(s.role) + '</span><b class="tnum">' + s.load + '/' + s.cap + '</b></div>' +
            '<div class="progress" style="margin-top:5px"><b style="width:' + (s.load / s.cap * 100) + '%;background:' + (s.load / s.cap > 0.9 ? '#d9503f' : '#0b63e5') + '"></b></div></div>').join('') +
            '<div class="note warn" style="margin-top:8px">负荷超 90% 的排班建议不再放号，避免履约超时。</div>' }) +
          '</div></div>';
    },
    actions: {
      addShift() {
        EN.ensureOps2();
        UI.formDrawer({ title: '排班', sub: '选人与时段，容量自动带出', icon: 'calendar',
          fields: [
            { key: 'staff', label: '责任人', type: 'select', options: Store.db.staff.map((s) => ({ v: s.id, l: s.name + ' · ' + s.role })) },
            { key: 'date', label: '日期', type: 'select', options: ['2026-11-10', '2026-11-11', '2026-11-12'] },
            { key: 'slot', label: '时段', type: 'select', options: ['08:30', '10:00', '14:00', '15:30'] },
            { key: 'cap', label: '容量', type: 'num', value: 6 }],
          onSave(v) {
            const s = Store.db.staff.find((x) => x.id === v.staff);
            const clash = (Store.db.shifts || []).some((x) => x.staff === v.staff && x.date === v.date && x.slot === v.slot);
            if (clash) { UI.toast('该责任人此时段已排班', 'warn'); return false; }
            Store.pushItem('shifts', { id: 'sh' + Date.now(), date: v.date, slot: v.slot, staff: v.staff, booked: 0, cap: v.cap }, '排班');
            if (s) s.load += 0;
            UI.toast('已排班'); App.refresh();
          } });
      }
    }
  };

  /* ---------------- 客户 360 ---------------- */
  P['crm-customer'] = {
    app: 'all', grp: 'accounts', papp: 'versionall', title: '客户 360', sub: '一个人的健康、服务、订单、内容在一页', preview: 'student-home', hideNav: true,
    state: { id: 'fm1' },
    render() {
      EN.ensureOps2();
      const fg = Store.db.fivegood.members;
      const c = fg.find((x) => x.id === P['crm-customer'].state.id) || fg[0];
      const orders = (window.Engine.orders ? Engine.orders() : []).filter((o) => o.customer === c.name);
      const audits = ((Store.db.audits || []).filter((a) => orders.some((o) => o.id === a.orderId))).slice(0, 5);
      return K.head(c.name, c.tier + ' · ' + c.company + ' · 指数 ' + c.score,
        K.btn('返回客户', 'back', { icon: 'undo' }) + K.btn('发起随访', 'follow', { icon: 'message', cls: 'primary' })) +
        '<div class="grid g-1-2" style="align-items:start">' +
          '<div class="stack">' +
            K.panel({ title: '档案', body: '<dl class="kv"><dt>会员档位</dt><dd>' + E(c.tier) + '</dd><dt>入组时间</dt><dd>' + c.joined + '</dd><dt>状态</dt><dd>' + (c.status === 'risk' ? UI.pill('需干预', 'red') : c.status === 'paused' ? UI.pill('暂停', 'grey') : UI.pill('正常', 'green')) + '</dd><dt>五好指数</dt><dd class="tnum">' + c.score + '</dd></dl>' +
              '<div class="hairline"></div>' + K.progress(c.score) }) +
            K.panel({ title: '五维得分', body: ['eat', 'sleep', 'move', 'mind', 'check'].map((k) => {
              const d = Store.db.fivegood.dims.find((x) => x.key === k) || {};
              return '<div class="row small" style="margin-bottom:8px"><span style="width:34px">' + (d.name || k) + '</span><div style="flex:1">' + K.progress(c.dims[k]) + '</div><b class="tnum">' + c.dims[k] + '</b></div>';
            }).join('') }) +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '服务与订单', sub: orders.length + ' 单', flush: true, body: orders.length ? UI.table([
              { label: '订单', render: (o) => '<span class="tnum small">' + o.id + '</span>' },
              { label: '内容', render: (o) => E(o.item) },
              { label: '状态', render: (o) => UI.pill(o.status, 'grey') },
              { label: '', align: 'right', render: (o) => '<div class="rowact"><button data-act="openOrder" data-id="' + o.id + '">' + I('chevron', 13) + '</button></div>' }
            ], orders.map((o) => Object.assign({ _id: o.id }, o))) : '<div class="empty" style="padding:24px">暂无订单</div>' }) +
            K.panel({ title: '健康与内容', body: '<div class="stack" style="gap:8px">' +
              [['最近打卡', '饮食 3 天前 · 运动 昨天'], ['食谱执行', '本周采纳 4 餐，偏离 1 餐'], ['触达记录', '11-05 五好招募 · 已打开'], ['风险提示', c.status === 'risk' ? '指数连续两月下降，建议随访' : '无']].map((x) =>
                '<div><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span></div><div class="small" style="margin-top:2px">' + E(x[1]) + '</div></div>').join('') + '</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      back() { App.go('g-accounts'); },
      openOrder(d) { App.go('trd-order', { id: d.id }); },
      follow() { UI.toast('随访任务已创建'); }
    }
  };

  /* ---------------- 触达中心 ---------------- */
  P['msg-center'] = {
    app: 'all', grp: 'shared.content', papp: 'employee', title: '触达中心', sub: '企微 / 短信 / 站内信统一编排', preview: 'emp-home',
    render() {
      EN.ensureOps2();
      const list = Store.db.campaigns;
      return K.head('触达中心', list.length + ' 个活动 · 本月触达 3,020 人次',
        '<button class="btn" data-act="go" data-id="lib-messages">' + I('message', 15) + '消息模板</button>' +
        '<button class="btn" data-act="go" data-id="lib-journeys">' + I('send', 15) + '旅程编排</button>' +
        '<button class="btn primary" data-act="new">' + I('plus', 15) + '新建触达</button>') +
        K.kpis([
          { k: '本月发送', v: '3,020', unit: '人次', d: '3 个活动', icon: 'send' },
          { k: '打开率', v: '54', unit: '%', d: '企微最高 62%', tone: 'up', icon: 'eye' },
          { k: '点击率', v: '15', unit: '%', d: '较上月 +3pt', tone: 'up', icon: 'target' },
          { k: '退订/投诉', v: '0.4', unit: '%', d: '低于 1% 红线', tone: 'up', icon: 'x' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '活动', render: (c) => '<div><div class="strong">' + E(c.name) + '</div><div class="small muted">' + c.at + '</div></div>' },
          { label: '渠道', render: (c) => UI.pill(c.channel, c.channel === '企业微信' ? 'green' : c.channel === '短信' ? 'amber' : 'blue') },
          { label: '人群', render: (c) => '<span class="small">' + E(c.audience) + '</span>' },
          { label: '覆盖', align: 'right', render: (c) => '<span class="tnum">' + c.count + '</span>' },
          { label: '打开 / 点击', align: 'right', render: (c) => '<span class="tnum small">' + c.open + '% / ' + c.click + '%</span>' },
          { label: '状态', render: (c) => c.status === 'done' ? UI.pill('已发送', 'green') : UI.pill('草稿', 'grey') },
          { label: '', align: 'right', render: (c) => c.status !== 'done' ? '<div class="rowact"><button data-act="send" data-id="' + c.id + '">' + I('send', 14) + '</button></div>' : '' }
        ], list.map((c) => Object.assign({ _id: c.id }, c))) });
    },
    actions: {
      new() { UI.formDrawer({ title: '新建触达', sub: '选人群与渠道', icon: 'send',
        fields: [{ key: 'name', label: '活动名称' },
          { key: 'channel', label: '渠道', type: 'select', options: ['企业微信', '短信', '站内信'] },
          { key: 'audience', label: '人群', type: 'select', options: ['全员', '未预约员工', 'BMI ≥ 28', '五高人群'] },
          { key: 'count', label: '覆盖人数', type: 'num', value: 500 }],
        onSave(v) { Store.pushItem('campaigns', { id: 'cm' + Date.now(), name: v.name || '新活动', channel: v.channel, audience: v.audience, count: v.count, sent: 0, open: 0, click: 0, status: 'draft', at: '' }, '新建触达'); UI.toast('已创建草稿'); App.refresh(); } }); },
      send(d) { const c = Store.db.campaigns.find((x) => x.id === d.id); c.status = 'done'; c.sent = c.count; c.open = 48; c.click = 14; c.at = '2026-11-08'; Store.mark('campaigns', '发送触达'); UI.toast('已发送 ' + c.count + ' 人'); App.refresh(); }
    }
  };

  /* ---------------- 报表与口径 ---------------- */
  P['rpt-report'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '报表与口径', sub: '先定口径，再出报表', preview: 'emp-home',
    render() {
      EN.ensureOps2();
      const dict = Store.db.metricsDict;
      return K.head('报表与口径', dict.length + ' 个指标口径 · 5 张标准报表',
        '<button class="btn primary" data-act="newMetric">' + I('plus', 15) + '新增指标口径</button>') +
        K.panel({ title: '指标字典', sub: '同一指标只有一个口径', flush: true, body: UI.table([
          { label: '指标', render: (d) => '<b>' + E(d.name) + '</b>' },
          { label: '定义', render: (d) => '<span class="small">' + E(d.def) + '</span>' },
          { label: '计算规则', render: (d) => '<span class="small muted">' + E(d.rule) + '</span>' },
          { label: '数据源', render: (d) => UI.pill(d.src, 'grey') },
          { label: '责任人', render: (d) => '<span class="small">' + E(d.owner) + '</span>' }
        ], dict.map((d) => Object.assign({ _id: d.id }, d))) }) +
        '<div style="height:16px"></div>' +
        K.panel({ title: '标准报表', flush: true, body: UI.table([
          { label: '报表', render: (r) => '<b>' + E(r[0]) + '</b>' },
          { label: '口径', render: (r) => '<span class="small muted">' + E(r[1]) + '</span>' },
          { label: '周期', render: (r) => UI.pill(r[2], 'grey') },
          { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="export" data-id="' + r[0] + '">' + I('download', 14) + '</button></div>' }
        ], [['经营日报', 'GMV / 核销率 / 毛利率', '每日'], ['服务品类月报', '按类目 GMV 与毛利', '每月'], ['客户健康月报', '活跃率 / 五好达标率', '每月'], ['履约时效报表', 'SLA 达成 / 超时率', '每周'], ['渠道效果报表', '曝光 / 点击 / 转化', '每周']].map((r, i) => ({ _id: i, 0: r[0], 1: r[1], 2: r[2] }))) });
    },
    actions: {
      newMetric() { UI.toast('新增口径'); },
      export(d) { UI.toast(d.id + ' 已导出'); }
    }
  };
})();
