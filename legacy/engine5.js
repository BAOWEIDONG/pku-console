/* 开票与回款核销 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine;
  const money = (n) => '¥' + Number(n).toLocaleString('zh-CN');

  EN.ensureInvoice = function () {
    const db = Store.db;
    if (!db.invoices) db.invoices = [
      { id: 'INV2026100001', period: '2026-10', partner: '示例科技有限公司', amount: 428600, tax: 6, no: '0261100001', at: '2026-11-01', status: 'issued', paid: 0 },
      { id: 'INV2026100002', period: '2026-10', partner: '北京某银行工会', amount: 186000, tax: 6, no: '0261100002', at: '2026-11-02', status: 'issued', paid: 100000 },
      { id: 'INV2026090003', period: '2026-09', partner: '某保险TPA', amount: 96200, tax: 6, no: '0260900003', at: '2026-10-08', status: 'settled', paid: 96200 }
    ];
    if (!db.payments) db.payments = [
      { id: 'PA2026110601', invoice: 'INV2026100002', amount: 100000, at: '2026-11-06', way: '银行转账', by: '财务' },
      { id: 'PA2026101501', invoice: 'INV2026090003', amount: 96200, at: '2026-10-15', way: '银行转账', by: '财务' }
    ];
  };
  EN.invoiceOf = (period, partner) => { EN.ensureInvoice(); return Store.db.invoices.find((v) => v.period === period && v.partner === partner && v.status !== 'void'); };
  EN.unpaidOf = (inv) => Math.max(0, inv.amount - (inv.paid || 0));
  EN.aging = function () {
    EN.ensureInvoice();
    const today = new Date('2026-11-08');
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    Store.db.invoices.filter((v) => v.status !== 'settled' && v.status !== 'void').forEach((v) => {
      const days = Math.round((today - new Date(v.at)) / 86400000);
      const k = days <= 30 ? '0-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : '90+';
      buckets[k] += EN.unpaidOf(v);
    });
    return buckets;
  };

  P['trd-invoice'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '开票与回款', sub: '开票 → 回款 → 核销 → 账龄', preview: 'emp-home',
    render() {
      EN.ensureInvoice();
      const invoices = Store.db.invoices;
      const payments = Store.db.payments;
      const ag = EN.aging();
      const unpaid = invoices.reduce((a, v) => a + (v.status === 'settled' || v.status === 'void' ? 0 : EN.unpaidOf(v)), 0);
      return K.head('开票与回款', invoices.length + ' 张发票 · 未核销 ' + money(unpaid),
        '<button class="btn primary" data-act="pay">' + I('send', 15) + '登记回款</button>') +
        K.kpis([
          { k: '已开票', v: invoices.filter((v) => v.status !== 'void').length, unit: '张', d: '合计 ' + money(invoices.reduce((a, v) => a + v.amount, 0)), icon: 'file' },
          { k: '未核销', v: money(unpaid), d: invoices.filter((v) => v.status !== 'settled').length + ' 张未结清', tone: 'down', icon: 'clock' },
          { k: '本月回款', v: money(payments.filter((p) => p.at.indexOf('2026-11') === 0).reduce((a, p) => a + p.amount, 0)), d: '较上月 +18%', tone: 'up', icon: 'check' },
          { k: '90 天以上', v: money(ag['90+']), d: '需催收', tone: 'down', icon: 'x' }
        ]) +
        K.panel({ title: '发票', flush: true, body: UI.table([
          { label: '发票号', render: (v) => '<span class="tnum small">' + E(v.no) + '</span>' },
          { label: '账期', render: (v) => '<span class="tnum small">' + v.period + '</span>' },
          { label: '合作方', render: (v) => '<span class="small">' + E(v.partner) + '</span>' },
          { label: '金额 / 税', align: 'right', render: (v) => '<b class="tnum">' + money(v.amount) + '</b><div class="small muted">' + v.tax + '%</div>' },
          { label: '已回款', align: 'right', render: (v) => '<span class="tnum" style="color:#087e76">' + money(v.paid || 0) + '</span>' },
          { label: '未核销', align: 'right', render: (v) => '<span class="tnum" style="color:' + (EN.unpaidOf(v) ? '#b83c2c' : 'inherit') + '">' + money(EN.unpaidOf(v)) + '</span>' },
          { label: '状态', render: (v) => v.status === 'settled' ? UI.pill('已结清', 'green') : v.paid ? UI.pill('部分回款', 'blue') : UI.pill('待回款', 'amber') },
          { label: '', align: 'right', render: (v) => v.status === 'settled' ? '' : '<div class="rowact"><button data-act="payFor" data-id="' + v.id + '">' + I('send', 14) + '</button></div>' }
        ], invoices.map((v) => Object.assign({ _id: v.id }, v))) }) +
        '<div style="height:16px"></div>' +
        '<div class="grid g-2-1">' +
          K.panel({ title: '回款记录', flush: true, body: UI.table([
            { label: '回款单', render: (p) => '<span class="tnum small">' + p.id + '</span>' },
            { label: '发票', render: (p) => '<span class="tnum small muted">' + p.invoice + '</span>' },
            { label: '金额', align: 'right', render: (p) => '<b class="tnum">' + money(p.amount) + '</b>' },
            { label: '方式', render: (p) => '<span class="small">' + p.way + '</span>' },
            { label: '日期', render: (p) => '<span class="small tnum muted">' + p.at + '</span>' }
          ], payments.map((p) => Object.assign({ _id: p.id }, p))) }) +
          K.panel({ title: '应收账龄', body: ['0-30', '31-60', '61-90', '90+'].map((k) =>
            '<div style="margin-bottom:12px"><div class="row small" style="justify-content:space-between"><span class="mut">' + k + ' 天</span><b class="tnum">' + money(ag[k]) + '</b></div>' +
            '<div class="progress" style="margin-top:5px"><b style="width:' + (ag[k] / (unpaid || 1) * 100) + '%;background:' + (k === '90+' ? '#d9503f' : k === '61-90' ? '#c8871a' : '#0b63e5') + '"></b></div></div>').join('') +
            '<div class="note" style="margin-top:8px">核销顺序：最早账期优先。</div>' }) +
        '</div>';
    },
    actions: {
      pay() { openPay(null); },
      payFor(d) { openPay(d.id); }
    }
  };

  function openPay(invoiceId) {
    EN.ensureInvoice();
    const list = Store.db.invoices.filter((v) => v.status !== 'settled');
    const target = invoiceId ? list.find((v) => v.id === invoiceId) : list[0];
    if (!target) { UI.toast('没有待回款的发票'); return; }
    UI.formDrawer({ title: '登记回款', sub: target.id + ' · 未核销 ' + money(EN.unpaidOf(target)), icon: 'send',
      fields: [
        { key: 'invoice', label: '发票', type: 'select', options: list.map((v) => ({ v: v.id, l: v.no + ' · ' + v.partner + ' · ' + money(EN.unpaidOf(v)) })) },
        { key: 'amount', label: '回款金额', type: 'num', value: EN.unpaidOf(target) },
        { key: 'way', label: '方式', type: 'select', options: ['银行转账', '承兑汇票', '现金'] },
        { key: 'at', label: '到账日期', type: 'select', options: ['2026-11-08', '2026-11-07', '2026-11-06'] }
      ],
      onSave(v) {
        const inv = Store.db.invoices.find((x) => x.id === v.invoice) || target;
        const amt = Math.min(v.amount, EN.unpaidOf(inv));
        if (amt <= 0) { UI.toast('金额需大于 0', 'warn'); return false; }
        Store.pushItem('payments', { id: 'PA' + Date.now(), invoice: inv.id, amount: amt, at: v.at, way: v.way, by: Store.role.name }, '登记回款');
        inv.paid = (inv.paid || 0) + amt;
        if (inv.paid >= inv.amount) { inv.status = 'settled'; }
        const sr = (Store.db.settle.records || []).find((r) => r.period === inv.period && r.partner === inv.partner);
        if (sr && inv.status === 'settled') sr.status = 'settled';
        Store.mark('invoices', '回款核销');
        UI.toast('已核销 ' + money(amt) + (inv.status === 'settled' ? '，发票已结清' : ''));
        App.refresh();
      } });
  }
})();
