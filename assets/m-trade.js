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
    app: 'all', grp: 'v.report', papp: 'employee', title: '结算与对账', sub: '按签约企业周期结算：对账单生成 → 确认 → 开票 → 回款，全程写台账',
    preview: 'emp-home',
    render() {
      const s = Store.db.settle;
      const recs = (s.records || []).slice().sort((a, b) => (b.period || '').localeCompare(a.period || ''));
      const pending = recs.filter((r) => r.status === 'pending');
      const invoiced = recs.filter((r) => r.status === 'invoiced');
      const settled = recs.filter((r) => r.status === 'settled');
      const receivable = pending.reduce((n, r) => n + r.amount, 0);
      const invoicing = invoiced.reduce((n, r) => n + r.amount, 0);
      const margins = recs.filter((r) => r.margin != null);
      const avgMargin = margins.length ? (margins.reduce((n, r) => n + r.margin, 0) / margins.length).toFixed(1) : '—';
      const companies = ((Store.db.upstream || {}).companies || []);
      const partners = (s.partners || []);
      return K.head('结算与对账', recs.length + ' 张对账单 · 待结算 ' + pending.length + ' 期 · 平均毛利 ' + avgMargin + '%',
        K.btn('合同台账', 'goContracts', { icon: 'file' }) + ' ' + K.btn('服务商应付', 'goPayable', { icon: 'link' }) + ' ' + K.btn('导出对账单', 'export', { icon: 'download' }) + ' ' + K.btn('发起结算', 'runSettle', { icon: 'send', cls: 'primary' })) +
        K.kpis([
          { k: '待结算应收', v: (receivable / 10000).toFixed(1), unit: '万', d: pending.length + ' 期未确认', icon: 'target' },
          { k: '已开票待回款', v: (invoicing / 10000).toFixed(1), unit: '万', d: invoiced.length + ' 张发票在外', icon: 'file' },
          { k: '已结清', v: (settled.reduce((n, r) => n + r.amount, 0) / 10000).toFixed(1), unit: '万', d: settled.length + ' 期完成', tone: 'up', icon: 'check' },
          { k: '综合毛利', v: avgMargin, unit: '%', d: '低于 20% 预警', icon: 'chart' }
        ]) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            K.panel({ title: '对账记录', sub: '点状态推进：待结算 → 已开票 → 已结清', flush: true, body: UI.table([
              { label: '账期', render: (r) => '<span class="tnum small strong">' + E(r.period) + '</span>' },
              { label: '客户', render: (r) => '<div><div class="strong">' + E(r.partner) + '</div><div class="small muted tnum">' + E(r.id) + '</div></div>' },
              { label: '订单', align: 'right', render: (r) => '<span class="tnum">' + r.orders + '</span>' },
              { label: '应收', align: 'right', render: (r) => '<span class="tnum">' + money(r.amount) + '</span>' },
              { label: '结算额', align: 'right', render: (r) => '<span class="tnum small">' + money(r.settleAmount) + '</span>' },
              { label: '毛利', align: 'right', render: (r) => '<span class="tnum" style="color:' + (r.margin < 20 ? '#c2392b' : '#087e76') + '">' + r.margin + '%</span>' },
              { label: '期限', render: (r) => '<span class="small tnum">' + E(r.due) + '</span>' },
              { label: '状态', render: (r) => UI.pill(r.status === 'settled' ? '已结清' : r.status === 'invoiced' ? '已开票' : '待结算', r.status === 'settled' ? 'green' : r.status === 'invoiced' ? 'blue' : 'amber') },
              { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="viewSettle" data-id="' + r.id + '" title="对账单详情">' + I('eye', 14) + '</button>' +
                (r.status === 'pending' ? '<button data-act="markInvoiced" data-id="' + r.id + '" title="确认开票">' + I('file', 14) + '</button>' : '') +
                (r.status === 'invoiced' ? '<button data-act="markSettled" data-id="' + r.id + '" title="确认回款">' + I('check', 14) + '</button>' : '') + '</div>' }
            ], recs.map((r) => Object.assign({ _id: r.id }, r))) }) +
            K.panel({ title: '客户授信与结算周期', sub: '来自合同台账 · 与企业主数据一致', flush: true, body: UI.table([
              { label: '客户', render: (p) => '<div><div class="strong">' + E(p.name) + '</div><div class="small muted">' + E(p.type) + ' · ' + E(p.cycle) + '</div></div>' },
              { label: '结算方式', render: (p) => '<span class="small">' + E(p.plan) + '</span>' },
              { label: '已用 / 授信', align: 'right', render: (p) => '<span class="tnum small">' + money(p.used) + '</span><div class="small muted tnum">/ ' + money(p.limit) + '</div>' },
              { label: '额度使用', w: '110px', render: (p) => '<div class="progress"><b style="width:' + (p.used / p.limit * 100) + '%"></b></div>' }
            ], partners.map((p) => Object.assign({ _id: p.id }, p))) }) +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '毛利结构', body: [['服务成本', 62, '#c8871a'], ['履约人力', 12, '#0aa39a'], ['渠道分成', 8, '#6b5ce0'], ['毛利', 26, '#0b63e5']].map((x) =>
              '<div style="margin-bottom:12px"><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%;background:' + x[2] + '"></b></div></div>').join('') }) +
            K.panel({ title: '结算规则', body: '<div class="stack" style="gap:10px">' +
              UI.fSwitch({ label: '按人次结算', value: true, path: 'settle.byHead' }) +
              UI.fSwitch({ label: '毛利低于 20% 预警', value: true, path: 'settle.warn' }) +
              UI.fSwitch({ label: '自动生成对账单', value: false, path: 'settle.auto' }) + '</div>' +
              '<div class="note" style="margin-top:10px">对账单以履约完成的服务记录为准，取消订单不计入；周期口径来自各企业合同的「结算方式」。</div>' }) +
            K.panel({ title: '哪些客户还没对账单', body: (() => {
              const withRec = new Set(recs.map((r) => r.partner));
              const miss = companies.filter((c) => !withRec.has(c.name));
              return miss.length
                ? '<div class="up-listblock">' + miss.map((c) => '<div class="up-row"><span>' + E(c.short || c.name) + '</span><em class="small mut">' + E((c.contract || {}).settlement || '—') + '</em><button class="btn ghost sm" data-act="genFor" data-id="' + c.id + '">生成</button></div>').join('') + '</div>'
                : '<div class="note teal">全部签约客户本期都有对账单。</div>';
            })() }) +
          '</div>' +
        '</div>';
    },
    actions: {
      export() { UI.toast('对账单已导出'); },
      goPayable() { App.go('trd-payable'); },
      goContracts() { App.go('g-contracts'); },
      runSettle() {
        const companies = ((Store.db.upstream || {}).companies || []);
        const recs = Store.db.settle.records || [];
        const withRec = new Set(recs.filter((r) => r.period === '2026-11').map((r) => r.partner));
        const miss = companies.filter((c) => !withRec.has(c.name));
        if (!miss.length) { UI.toast('本期（2026-11）全部客户已有对账单'); return; }
        UI.confirm({ title: '生成 2026-11 对账单？', desc: '将为 ' + miss.length + ' 家客户生成对账单：' + miss.map((c) => c.short || c.name).join('、') + '。金额按已履约订单汇总，生成后进入「待结算」。', okText: '生成' })
          .then((ok) => {
            if (!ok) return;
            let gen = 0;
            miss.forEach((c, i) => {
              const ct = c.contract || {};
              const amt = Math.round(((ct.amount || 500000) / 12) * (0.6 + Math.random() * 0.4));
              recs.unshift({ id: 'ST202611' + String(i + 1).padStart(2, '0') + String(Date.now()).slice(-2), partner: c.name, period: '2026-11', orders: Math.max(8, Math.round((c.employees || 500) / 22)), amount: amt, settleAmount: Math.round(amt * 0.73), margin: 24 + Math.round(Math.random() * 40) / 10, status: 'pending', due: '2026-12-30' });
              gen++;
            });
            Store.mark('settle', '发起结算：生成 ' + gen + ' 张 2026-11 对账单');
            Store.persist();
            UI.toast('已生成 ' + gen + ' 张对账单，进入待结算');
            App.refresh();
          });
      },
      genFor(d) {
        const c = ((Store.db.upstream || {}).companies || []).find((x) => x.id === d.id);
        if (!c) return;
        const recs = Store.db.settle.records || [];
        const ct = c.contract || {};
        const amt = Math.round(((ct.amount || 500000) / 12) * (0.6 + Math.random() * 0.4));
        recs.unshift({ id: 'ST202611' + String(Date.now()).slice(-4), partner: c.name, period: '2026-11', orders: Math.max(8, Math.round((c.employees || 500) / 22)), amount: amt, settleAmount: Math.round(amt * 0.73), margin: 25.2, status: 'pending', due: '2026-12-30' });
        Store.mark('settle', '生成对账单：' + c.name + ' 2026-11');
        Store.persist();
        UI.toast('已生成 ' + (c.short || c.name) + ' 的 2026-11 对账单');
        App.refresh();
      },
      markInvoiced(d) {
        const r = (Store.db.settle.records || []).find((x) => x.id === d.id);
        if (!r || r.status !== 'pending') return;
        UI.confirm({ title: '确认开票？', desc: r.partner + ' · ' + r.period + ' · 应收 ' + money(r.amount) + '。开票后状态变为「已开票」，等待客户回款。', okText: '确认开票' })
          .then((ok) => {
            if (!ok) return;
            Store.saveItem('settle.records', { id: r.id, status: 'invoiced', invoicedAt: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') }, 'id', '对账开票 ' + r.id);
            UI.toast('已开票，等待回款');
            App.refresh();
          });
      },
      markSettled(d) {
        const r = (Store.db.settle.records || []).find((x) => x.id === d.id);
        if (!r || r.status !== 'invoiced') return;
        UI.confirm({ title: '确认收到回款？', desc: r.partner + ' · ' + r.period + ' · 回款 ' + money(r.amount) + '。确认后该期对账结清，合同预算用量同步更新。', okText: '确认回款' })
          .then((ok) => {
            if (!ok) return;
            Store.saveItem('settle.records', { id: r.id, status: 'settled', settledAt: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') }, 'id', '对账回款 ' + r.id);
            // 合同预算用量同步：累计回款计入 used
            const c = ((Store.db.upstream || {}).companies || []).find((x) => x.name === r.partner);
            if (c && c.contract) { c.contract.used = Math.min(c.contract.amount || Infinity, (c.contract.used || 0) + (r.amount || 0)); Store.mark('upstream', '回款计入 ' + (c.short || c.name) + ' 合同用量'); }
            UI.toast('已结清 ' + r.period + ' · ' + r.partner);
            App.refresh();
          });
      },
      viewSettle(d) {
        const r = (Store.db.settle.records || []).find((x) => x.id === d.id);
        if (!r) return;
        const stTxt = r.status === 'settled' ? '已结清' + (r.settledAt ? ' · ' + r.settledAt : '') : r.status === 'invoiced' ? '已开票' + (r.invoicedAt ? ' · ' + r.invoicedAt : '') + '，等待回款' : '待结算，可确认开票';
        UI.modal({ title: '对账单 · ' + r.period, desc: r.partner + ' · ' + r.orders + ' 单',
          body: '<dl class="kv"><dt>对账单号</dt><dd class="tnum">' + E(r.id) + '</dd><dt>应收金额</dt><dd class="tnum">' + money(r.amount) + '</dd>' +
            '<dt>结算金额</dt><dd class="tnum">' + money(r.settleAmount) + '</dd><dt>毛利率</dt><dd>' + r.margin + '%</dd>' +
            '<dt>付款期限</dt><dd>' + E(r.due) + '</dd><dt>状态</dt><dd>' + E(stTxt) + '</dd></dl>' +
            '<div class="note" style="margin-top:12px">差异项 0；退单已从账单剔除。金额口径：履约完成的服务记录 × 合同单价。</div>',
          okText: '关闭', cancelText: false });
      }
    }
  };
})();
