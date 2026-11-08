/* 退款冲销 + 食谱→商品转化闭环 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine;

  EN.ensureMoney = function () {
    const db = Store.db;
    if (!db.refunds) db.refunds = [
      { id: 'RF2026110801', order: 'BK20261105007', customer: '徐一鸣', item: '五高一重管理服务', amount: 3980, refund: 3980, type: '全额', reason: '未履约取消', status: 'pending', at: '2026-11-08 09:10' },
      { id: 'RF2026110802', order: 'GD20261101', customer: '林悦', item: '乳清蛋白粉 750g', amount: 328, refund: 164, type: '部分', reason: '包装破损', status: 'approved', at: '2026-11-08 10:20' },
      { id: 'RF2026110703', order: 'BK20261104012', customer: '何雨桐', item: '职场急救培训', amount: 1280, refund: 1280, type: '全额', reason: '企业改期', status: 'done', at: '2026-11-07 15:40' }
    ];
    if (!db.supplementOrders) db.supplementOrders = [];
  };
  const money = (n) => (n < 0 ? '-¥' : '¥') + Math.abs(n).toLocaleString('zh-CN');

  /* 把补剂订单并入统一订单 */
  if (!EN.__patched) {
    const orig = EN.orders;
    EN.orders = function () {
      const base = orig();
      const db = Store.db;
      (db.supplementOrders || []).forEach((o) => base.push({ id: o.id, kind: '商品', customer: o.customer, item: o.item, amount: o.amount, price: o.amount, at: o.at, status: o.status, meta: '×' + o.qty + ' · ' + o.source, channel: 'wxwork', sku: o.sku }));
      return base;
    };
    EN.__patched = true;
  }

  /* ---------------- 退款单 ---------------- */
  P['trd-refund'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '退款与冲销', sub: '退款按状态计算，批准后自动冲销对应账期', preview: 'emp-home',
    render() {
      EN.ensureMoney();
      const list = Store.db.refunds;
      const pend = list.filter((r) => r.status === 'pending');
      return K.head('退款与冲销', list.length + ' 笔退款 · 待审批 ' + pend.length,
        '<button class="btn primary" data-act="newRefund">' + I('plus', 15) + '发起退款</button>') +
        K.kpis([
          { k: '待审批', v: pend.length, unit: '笔', d: '金额 ' + money(pend.reduce((a, b) => a + b.refund, 0)), tone: 'down', icon: 'clock' },
          { k: '本月退款率', v: '1.8', unit: '%', d: '低于 3% 警戒线', tone: 'up', icon: 'chart' },
          { k: '已冲销', v: list.filter((r) => r.status === 'done').length, unit: '笔', d: '自动生成差异项', icon: 'check' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '退款单', render: (r) => '<span class="tnum small">' + r.id + '</span>' },
          { label: '订单', render: (r) => '<span class="tnum small muted">' + r.order + '</span>' },
          { label: '客户', render: (r) => E(r.customer) },
          { label: '内容', render: (r) => '<span class="small">' + E(r.item) + '</span>' },
          { label: '订单额 / 退款', align: 'right', render: (r) => '<span class="tnum small muted">' + money(r.amount) + '</span><div><b class="tnum" style="color:#b83c2c">' + money(-r.refund) + '</b></div>' },
          { label: '类型', render: (r) => UI.pill(r.type, r.type === '全额' ? 'red' : 'amber') },
          { label: '状态', render: (r) => r.status === 'done' ? UI.pill('已退款', 'green') : r.status === 'approved' ? UI.pill('已批准', 'blue') : UI.pill('待审批', 'amber') },
          { label: '', align: 'right', render: (r) => r.status === 'pending' ? '<div class="rowact"><button data-act="approve" data-id="' + r.id + '">' + I('check', 14) + '</button>' + '<button data-act="reject" data-id="' + r.id + '">' + I('x', 14) + '</button></div>' : r.status === 'approved' ? '<div class="rowact"><button data-act="pay" data-id="' + r.id + '">' + I('send', 14) + '</button></div>' : '' }
        ], list.map((r) => Object.assign({ _id: r.id }, r))) }) +
        '<div class="note" style="margin-top:14px">退款批准后，若原订单已结算，会自动生成一笔负数差异挂到该账期，账期重新打开直到冲销完成。</div>';
    },
    actions: {
      newRefund() {
        const orders = EN.orders().filter((o) => o.kind !== '积分兑换');
        UI.formDrawer({ title: '发起退款', sub: '选订单，自动带出可退金额', icon: 'undo',
          fields: [
            { key: 'order', label: '订单', type: 'select', options: orders.slice(0, 10).map((o) => ({ v: o.id, l: o.id + ' · ' + o.item })) },
            { key: 'type', label: '退款类型', type: 'select', options: ['全额', '部分'] },
            { key: 'amount', label: '退款金额', type: 'num', value: 0 },
            { key: 'reason', label: '原因', type: 'select', options: ['未履约取消', '服务不满意', '包装破损', '企业改期', '重复支付'] }
          ],
          onSave(v) {
            const o = EN.orders().find((x) => x.id === v.order) || {};
            Store.pushItem('refunds', { id: 'RF' + Date.now(), order: v.order, customer: o.customer || '—', item: o.item || '—', amount: o.price || v.amount, refund: v.amount || o.price || 0, type: v.type, reason: v.reason, status: 'pending', at: '2026-11-08 10:30' }, '发起退款');
            UI.toast('退款单已创建，待审批'); App.refresh();
          } });
      },
      approve(d) { const r = Store.db.refunds.find((x) => x.id === d.id); r.status = 'approved'; Store.mark('refunds', '退款审批'); UI.toast('已批准，待打款'); App.refresh(); },
      reject(d) { const r = Store.db.refunds.find((x) => x.id === d.id); r.status = 'rejected'; Store.mark('refunds', '退款驳回'); UI.toast('已驳回'); App.refresh(); },
      pay(d) {
        const r = Store.db.refunds.find((x) => x.id === d.id);
        r.status = 'done';
        Store.db.settleDiff = Store.db.settleDiff || [];
        Store.db.settleDiff.unshift({ id: 'df' + Date.now(), period: '2026-11', partner: '示例科技有限公司', type: '退款冲销', amount: -r.refund, order: r.order, status: 'pending' });
        EN.audit(r.order, '退款', 'completed', 'completed', '退款 ' + money(r.refund) + ' · ' + r.reason);
        Store.mark('refunds', '退款完成');
        UI.toast('已退款并生成冲销差异'); App.refresh();
      }
    }
  };

  /* ---------------- 食谱 → 商品转化 ---------------- */
  P['fg-convert'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '食谱转化', sub: '推荐 → 加购 → 下单，一条可追踪的转化链', preview: 'emp-home',
    render() {
      EN.ensureMoney();
      const so = Store.db.supplementOrders;
      const rules = (Store.db.recoEngine ? Store.db.recoEngine.rules : []).filter((r) => r.type.indexOf('商品') >= 0 || r.target.indexOf('蛋白') >= 0 || r.target.indexOf('鱼油') >= 0);
      return K.head('食谱转化', '本月加购 412 · 成单 138 · 转化率 33.5%',
        '<button class="btn primary" data-act="gen">' + I('send', 15) + '从食谱生成订单</button>') +
        K.kpis([
          { k: '曝光', v: '3.1', unit: '万', d: '食谱页 + 搭配器', icon: 'eye' },
          { k: '加购', v: 412, unit: '次', d: '加购率 1.3%', icon: 'plus' },
          { k: '成单', v: 138, unit: '单', d: '加购→成单 33.5%', tone: 'up', icon: 'check' },
          { k: '客单价', v: '¥246', d: '补剂为主', icon: 'target' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '转化漏斗', body: [['食谱/搭配器曝光', 31000, '#dbe9fb'], ['查看补剂推荐', 8600, '#8fbdfa'], ['加入食谱/加购', 412, '#3f8cff'], ['下单', 138, '#0b63e5'], ['支付', 121, '#08356f']].map((x) =>
            '<div style="margin-bottom:12px"><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1].toLocaleString() + '</b></div>' +
            '<div class="progress" style="margin-top:5px"><b style="width:' + (x[1] / 31000 * 100).toFixed(1) + '%;background:' + x[2] + '"></b></div></div>').join('') +
            '<div class="note">转化率 33.5%，高于商城自然转化 12%</div>' }) +
          K.panel({ title: '带量推荐规则', flush: true, body: UI.table([
            { label: '规则', render: (r) => '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.target) + '</div></div>' },
            { label: 'CTR', align: 'right', render: (r) => '<span class="tnum small">' + r.ctr + '</span>' },
            { label: 'CVR', align: 'right', render: (r) => '<span class="tnum small">' + r.cvr + '</span>' }
          ], rules.map((r) => Object.assign({ _id: r.id }, r)), { emptyTitle: '暂无商品类规则' }) }) +
        '</div><div style="height:16px"></div>' +
        K.panel({ title: '从食谱生成的订单', sub: so.length + ' 单', flush: true, body: so.length ? UI.table([
          { label: '订单', render: (o) => '<span class="tnum small">' + o.id + '</span>' },
          { label: '客户', render: (o) => E(o.customer) },
          { label: '商品', render: (o) => E(o.item) },
          { label: '来源', render: (o) => UI.pill(o.source, 'grey') },
          { label: '金额', align: 'right', render: (o) => '<span class="tnum">' + money(o.amount) + '</span>' },
          { label: '状态', render: (o) => UI.pill(o.status === 'pending' ? '待支付' : o.status === 'paid' ? '已支付' : o.status, o.status === 'paid' ? 'green' : 'amber') },
          { label: '', align: 'right', render: (o) => '<div class="rowact"><button data-act="open" data-id="' + o.id + '">' + I('chevron', 14) + '</button></div>' }
        ], so.map((o) => Object.assign({ _id: o.id }, o))) : '<div class="empty" style="padding:26px">还没有从食谱生成的订单</div>' });
    },
    actions: {
      gen() {
        const supps = Store.db.supplements.filter((g) => g.on).slice(0, 4);
        UI.formDrawer({ title: '从食谱生成订单', sub: '客户采纳食谱后的补剂加购', icon: 'gift',
          fields: [
            { key: 'customer', label: '客户', type: 'select', options: Store.db.fivegood.members.map((m) => ({ v: m.name, l: m.name })) },
            { key: 'sku', label: '商品', type: 'select', options: supps.map((g) => ({ v: g.id, l: g.name })) },
            { key: 'qty', label: '数量', type: 'num', value: 1 },
            { key: 'source', label: '来源', type: 'select', options: ['全天食谱', '搭配器', '补剂推荐'] }
          ],
          onSave(v) {
            const g = Store.db.supplements.find((x) => x.id === v.sku) || supps[0];
            Store.pushItem('supplementOrders', { id: 'GD' + Date.now(), customer: v.customer, item: g.name, sku: g.id, qty: v.qty, amount: g.price * v.qty, at: '2026-11-08 10:30', status: 'pending', source: v.source }, '生成商品订单');
            UI.toast('订单已生成，可在订单中心支付'); App.refresh();
          } });
      },
      open(d) { App.go('trd-order', { id: d.id }); }
    }
  };
})();
