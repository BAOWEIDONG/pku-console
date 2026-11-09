/* ============================================================================
   交易与履约：统一订单中心 / 结算对账
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const money = (n) => '¥' + Number(n).toLocaleString('zh-CN');

  function allOrders() {
    const db = Store.db;
    const bk = db.employee.bookings.map((b) => ({
      id: b.id, kind: '服务预约', customer: b.person, dept: b.dept,
      item: b.service, amount: 0, channel: 'h5-employee', status: b.status, at: b.created, extra: b.date + ' ' + b.time
    }));
    const ex = db.versionall.exchanges.map((e) => ({
      id: e.id, kind: '兑换', customer: e.studentName, dept: '学员',
      item: e.productName, amount: 0, channel: 'h5-camp', status: e.status === 'pending' ? 'pending' : e.status === 'fulfilled' ? 'completed' : 'cancelled',
      at: e.date, extra: e.points + ' 积分'
    }));
    const cl = db.versionall.claims.map((c) => ({
      id: c.id, kind: '领奖', customer: c.studentName, dept: '学员',
      item: c.tierName, amount: 0, channel: 'h5-camp', status: c.status === 'pending' ? 'pending' : c.status === 'shipped' ? 'completed' : c.status,
      at: c.claimDate, extra: c.method === 'shipped' ? '邮寄' : '线下'
    }));
    const gd = db.supplements.filter((g) => g.sold > 0).slice(0, 6).map((g, i) => ({
      id: 'GD2026' + (1100 + i), kind: '商品', customer: ['林悦', '陈嘉禾', '周雯', '徐一鸣', '何雨桐', '赵启明'][i], dept: '企业员工',
      item: g.name, amount: g.price, channel: 'wxwork', status: i % 3 === 0 ? 'pending' : 'completed', at: '2026-11-0' + (i + 1) + ' 10:00', extra: '×1'
    }));
    return bk.concat(gd).concat(ex).concat(cl);
  }

  const ST = { confirmed: ['已确认', 'blue'], pending: ['待处理', 'amber'], completed: ['已完成', 'green'], cancelled: ['已取消', 'grey'], shipped: ['已发货', 'green'], 'in-person': ['已线下发放', 'green'] };
  function stPill(s) { const x = ST[s] || [s, 'grey']; return UI.pill(x[0], x[1]); }

  /* ------------------------------------------------------ 订单中心 */
  P['trd-orders'] = {
    app: 'all', grp: 'v.fulfill', papp: 'employee', title: '订单中心', sub: '预约、兑换、领奖统一成一张订单台账',
    preview: 'emp-home',
    state: { kind: '', status: '' },
    render() {
      const st = P['trd-orders'].state;
      let rows = allOrders();
      const kpiRows = rows;
      if (st.kind) rows = rows.filter((r) => r.kind === st.kind);
      if (st.status) rows = rows.filter((r) => r.status === st.status);
      const gmv = rows.filter((r) => (r.kind === '服务预约' || r.kind === '商品') && r.status !== 'cancelled').reduce((a, b) => a + (b.amount || 1280), 0);
      return K.head('订单中心', '预约 / 兑换 / 领奖三类订单统一检索与处理',
        K.btn('导出订单', 'export', { icon: 'download' })) +
        K.kpis([
          { k: '订单总数', v: kpiRows.length, unit: '单', d: '今日新增 6 单', icon: 'file' },
          { k: '待处理', v: kpiRows.filter((r) => r.status === 'pending').length, unit: '单', d: '超 48h 未处理 2 单', tone: 'down', icon: 'clock' },
          { k: '本月成交额', v: '42.8', unit: '万', d: '预约类按标准价折算', tone: 'up', icon: 'target' },
          { k: '取消率', v: '3.2', unit: '%', d: '较上月 -0.8pt', tone: 'up', icon: 'x' }
        ]) +
        K.toolbar(
          K.seg([{ id: '', label: '全部 ' + kpiRows.length }, { id: '服务预约', label: '服务预约' }, { id: '商品', label: '商品' }, { id: '兑换', label: '积分兑换' }, { id: '领奖', label: '领奖' }], st.kind, 'kindTab') +
          K.seg([{ id: '', label: '全部状态' }, { id: 'pending', label: '待处理' }, { id: 'confirmed', label: '已确认' }, { id: 'completed', label: '已完成' }, { id: 'cancelled', label: '已取消' }], st.status, 'statusTab'),
          K.search('搜索订单号 / 姓名', 'search')) +
        K.panel({ flush: true, body: UI.table([
          { label: '订单号', render: (r) => '<span class="tnum small strong">' + E(r.id) + '</span>' },
          { label: '类型', render: (r) => UI.pill(r.kind, r.kind === '服务预约' ? 'blue' : r.kind === '商品' ? 'green' : r.kind === '兑换' ? 'violet' : 'amber') },
          { label: '客户', render: (r) => '<div><div class="strong">' + E(r.customer) + '</div><div class="small muted">' + E(r.dept) + '</div></div>' },
          { label: '商品 / 服务', render: (r) => '<div style="max-width:220px"><div class="small">' + E(r.item) + '</div><div class="small muted">' + E(r.extra) + '</div></div>' },
          { label: '金额', align: 'right', render: (r) => r.amount ? '<b class="tnum">' + money(r.amount) + '</b>' : '<span class="muted small">积分/权益</span>' },
          { label: '来源渠道', render: (r) => '<span class="small muted nw">' + E((Store.db.channels.find((c) => c.id === r.channel) || {}).name || r.channel) + '</span>' },
          { label: '状态', render: (r) => stPill(r.status) },
          { label: '时间', render: (r) => '<span class="small tnum muted">' + E(r.at.slice(0, 10)) + '</span>' },
          { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="openOrder" data-id="' + r.id + '">' + I('chevron', 14) + '</button></div>' }
        ], rows.map((r) => Object.assign({ _id: r.id, _act: 'openOrder' }, r)), { emptyTitle: '没有符合条件的订单' }) });
    },
    actions: {
      kindTab(d) { P['trd-orders'].state.kind = d.id; App.refresh(); },
      statusTab(d) { P['trd-orders'].state.status = d.id; App.refresh(); },
      search() {},
      export() { UI.toast('订单已导出'); },
      openOrder(d) { App.go('trd-order', { id: d.id }); }
    }
  };

  /* ------------------------------------------------------ 结算对账 */
  P['trd-settle'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '结算与对账', sub: '按合作方周期结算，核对服务量与毛利',
    preview: 'emp-home',
    render() {
      const s = Store.db.settle;
      return K.head('结算与对账', '3 个合作方 · 待结算 2 期',
        K.btn('导出对账单', 'export', { icon: 'download' }) + K.btn('发起结算', 'runSettle', { icon: 'send', cls: 'primary' })) +
        K.kpis([
          { k: '本期应收', v: '61.4', unit: '万', d: '含 2 个合作方', icon: 'target' },
          { k: '已开票', v: '18.6', unit: '万', d: '回款周期 45 天', icon: 'file' },
          { k: '综合毛利', v: '26.2', unit: '%', d: '较上期 +1.4pt', tone: 'up', icon: 'chart' },
          { k: '逾期', v: 0, unit: '笔', d: '无逾期账款', tone: 'up', icon: 'check' }
        ]) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            K.panel({ title: '合作方', sub: '授信与结算周期', flush: true, body: UI.table([
              { label: '合作方', render: (p) => '<div><div class="strong">' + E(p.name) + '</div><div class="small muted">' + E(p.type) + ' · ' + E(p.cycle) + '</div></div>' },
              { label: '结算方式', render: (p) => '<span class="small">' + E(p.plan) + '</span>' },
              { label: '已用 / 授信', align: 'right', render: (p) => '<span class="tnum small">' + money(p.used) + '</span><div class="small muted tnum">/ ' + money(p.limit) + '</div>' },
              { label: '额度使用', w: '110px', render: (p) => '<div class="progress"><b style="width:' + (p.used / p.limit * 100) + '%"></b></div>' }
            ], s.partners.map((p) => Object.assign({ _id: p.id }, p))) }) +
            K.panel({ title: '对账记录', flush: true, body: UI.table([
              { label: '账期', render: (r) => '<span class="tnum small strong">' + E(r.period) + '</span>' },
              { label: '合作方', render: (r) => '<span class="small">' + E(r.partner) + '</span>' },
              { label: '订单', align: 'right', render: (r) => '<span class="tnum">' + r.orders + '</span>' },
              { label: '应收', align: 'right', render: (r) => '<span class="tnum">' + money(r.amount) + '</span>' },
              { label: '毛利', align: 'right', render: (r) => '<span class="tnum" style="color:#087e76">' + r.margin + '%</span>' },
              { label: '状态', render: (r) => UI.pill(r.status === 'settled' ? '已结算' : r.status === 'invoiced' ? '已开票' : '待结算', r.status === 'settled' ? 'green' : r.status === 'invoiced' ? 'blue' : 'amber') },
              { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="viewSettle" data-id="' + r.id + '">' + I('eye', 14) + '</button></div>' }
            ], s.records.map((r) => Object.assign({ _id: r.id }, r))) }) +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '毛利结构', body: [['服务成本', 62, '#c8871a'], ['履约人力', 12, '#0aa39a'], ['渠道分成', 8, '#6b5ce0'], ['毛利', 26, '#0b63e5']].map((x) =>
              '<div style="margin-bottom:12px"><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%;background:' + x[2] + '"></b></div></div>').join('') }) +
            K.panel({ title: '规则', body: '<div class="stack" style="gap:10px">' +
              UI.fSwitch({ label: '按人次结算', value: true, path: 'settle.byHead' }) +
              UI.fSwitch({ label: '毛利低于 20% 预警', value: true, path: 'settle.warn' }) +
              UI.fSwitch({ label: '自动生成对账单', value: false, path: 'settle.auto' }) + '</div>' +
              '<div class="note" style="margin-top:10px">对账单以履约完成的服务记录为准，取消订单不计入。</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      export() { UI.toast('对账单已导出'); },
      runSettle() { UI.confirm({ title: '生成本期对账单？', desc: '将汇总 2026-11 已履约订单，生成 3 份对账单待确认。', okText: '生成' }).then((ok) => { if (ok) UI.toast('对账单已生成'); }); },
      viewSettle(d) {
        const r = Store.db.settle.records.find((x) => x.id === d.id);
        UI.modal({ title: '对账单 · ' + r.period, desc: r.partner + ' · ' + r.orders + ' 单',
          body: '<dl class="kv"><dt>应收金额</dt><dd class="tnum">' + money(r.amount) + '</dd><dt>结算金额</dt><dd class="tnum">' + money(r.settleAmount) + '</dd>' +
            '<dt>毛利率</dt><dd>' + r.margin + '%</dd><dt>付款期限</dt><dd>' + r.due + '</dd><dt>状态</dt><dd>' + r.status + '</dd></dl>' +
            '<div class="note" style="margin-top:12px">差异项 0；退单 2 笔已从账单剔除。</div>',
          okText: '关闭', cancelText: false });
      }
    }
  };
})();
