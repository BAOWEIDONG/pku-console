/* 库存预留：下单占货 → 超时释放 → 支付实扣 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine;

  EN.ensureStock = function () {
    const db = Store.db;
    if (!db.reserves) db.reserves = [
      { id: 'r1', orderId: 'GD2026110801', sku: 'su3', qty: 1, at: '2026-11-08 09:40', expire: '2026-11-08 10:10', status: 'held' },
      { id: 'r2', orderId: 'GD2026110802', sku: 'su1', qty: 2, at: '2026-11-08 10:05', expire: '2026-11-08 10:35', status: 'held' },
      { id: 'r3', orderId: 'GD2026110703', sku: 'su6', qty: 1, at: '2026-11-07 16:12', expire: '2026-11-07 16:42', status: 'consumed' }
    ];
  };

  EN.heldOf = function (sku) {
    EN.ensureStock();
    return (Store.db.reserves || []).filter((r) => r.sku === sku && r.status === 'held').reduce((a, r) => a + r.qty, 0);
  };
  EN.availableOf = function (g) { return Math.max(0, (g.stock || 0) - EN.heldOf(g.id)); };

  EN.reserve = function (sku, qty, orderId) {
    EN.ensureStock();
    const g = Store.db.supplements.find((x) => x.id === sku);
    if (!g) return { ok: false, reason: '商品不存在' };
    if (EN.availableOf(g) < qty) return { ok: false, reason: '可售库存不足（可售 ' + EN.availableOf(g) + '）' };
    Store.db.reserves.unshift({ id: 'r' + Date.now(), orderId: orderId, sku: sku, qty: qty, at: '2026-11-08 10:30', expire: '2026-11-08 11:00', status: 'held' });
    Store.mark('reserves', '库存预留');
    Store.persist();
    return { ok: true };
  };
  EN.releaseReserve = function (orderId) {
    EN.ensureStock();
    let n = 0;
    Store.db.reserves.forEach((r) => { if (r.orderId === orderId && r.status === 'held') { r.status = 'released'; n += r.qty; } });
    if (n) { Store.mark('reserves', '释放预留'); Store.persist(); }
    return n;
  };
  EN.consumeReserve = function (orderId) {
    EN.ensureStock();
    Store.db.reserves.forEach((r) => { if (r.orderId === orderId && r.status === 'held') r.status = 'consumed'; });
    Store.persist();
  };
  EN.expireScan = function () {
    EN.ensureStock();
    const now = '2026-11-08 10:30';
    const expired = Store.db.reserves.filter((r) => r.status === 'held' && r.expire < now);
    return expired;
  };

  P['trd-stock'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '库存与预留', sub: '可售 = 在库 − 已预留，下单即占货', preview: 'emp-home',
    render() {
      EN.ensureStock();
      const list = Store.db.supplements;
      const reserves = Store.db.reserves;
      const held = reserves.filter((r) => r.status === 'held');
      const expired = EN.expireScan();
      return K.head('库存与预留', list.length + ' 个商品 · 已预留 ' + held.reduce((a, r) => a + r.qty, 0) + ' 件',
        '<button class="btn" data-act="scan">' + I('refresh', 15) + '扫描超时</button><button class="btn primary" data-act="stockIn">' + I('upload', 15) + '入库</button>') +
        K.kpis([
          { k: '在库', v: list.reduce((a, g) => a + g.stock, 0), unit: '件', d: '全部 SKU', icon: 'package' },
          { k: '已预留', v: held.reduce((a, r) => a + r.qty, 0), unit: '件', d: held.length + ' 笔未支付', icon: 'clock' },
          { k: '超时未释放', v: expired.length, unit: '笔', d: expired.length ? '需立即释放' : '正常', tone: expired.length ? 'down' : 'up', icon: 'x' },
          { k: '缺货 SKU', v: list.filter((g) => EN.availableOf(g) === 0).length, unit: '个', d: '不可下单', tone: 'down', icon: 'package' }
        ]) +
        K.panel({ title: '可售库存', sub: '在库 − 已预留', flush: true, body: UI.table([
          { label: '商品', render: (g) => '<div class="cellflex"><img src="' + ((window.IMG || {})['g' + ((String(g.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 10 + 1)] || '') + '" style="width:40px;height:30px;border-radius:8px;object-fit:cover" alt=""><div><div class="strong">' + E(g.name) + '</div><div class="small muted">' + E(g.cat) + '</div></div></div>' },
          { label: '在库', align: 'right', render: (g) => '<span class="tnum">' + g.stock + '</span>' },
          { label: '已预留', align: 'right', render: (g) => '<span class="tnum" style="color:#c8871a">' + EN.heldOf(g.id) + '</span>' },
          { label: '可售', align: 'right', render: (g) => '<b class="tnum" style="color:' + (EN.availableOf(g) === 0 ? '#b83c2c' : '#087e76') + '">' + EN.availableOf(g) + '</b>' },
          { label: '状态', render: (g) => EN.availableOf(g) === 0 ? UI.pill('缺货', 'red') : EN.availableOf(g) < 10 ? UI.pill('偏低', 'amber') : UI.pill('充足', 'green') }
        ], list.map((g) => Object.assign({ _id: g.id }, g))) }) +
        '<div style="height:16px"></div>' +
        K.panel({ title: '预留记录', sub: held.length + ' 笔占用中', flush: true, body: UI.table([
          { label: '订单', render: (r) => '<span class="tnum small">' + r.orderId + '</span>' },
          { label: '商品', render: (r) => E((list.find((g) => g.id === r.sku) || {}).name || r.sku) },
          { label: '数量', align: 'right', render: (r) => '<span class="tnum">' + r.qty + '</span>' },
          { label: '占用时间', render: (r) => '<span class="small tnum muted">' + r.at + '</span>' },
          { label: '释放时间', render: (r) => '<span class="small tnum muted">' + r.expire + '</span>' },
          { label: '状态', render: (r) => r.status === 'held' ? UI.pill('占用中', r.expire < '2026-11-08 10:30' ? 'red' : 'amber') : r.status === 'consumed' ? UI.pill('已实扣', 'green') : UI.pill('已释放', 'grey') },
          { label: '', align: 'right', render: (r) => r.status === 'held' ? '<div class="rowact"><button data-act="release" data-id="' + r.id + '">' + I('undo', 14) + '</button></div>' : '' }
        ], reserves.map((r) => Object.assign({ _id: r.id }, r))) });
    },
    actions: {
      scan() { const e = EN.expireScan(); e.forEach((r) => { r.status = 'released'; }); Store.persist(); UI.toast(e.length ? '已释放 ' + e.length + ' 笔超时预留' : '没有超时预留'); App.refresh(); },
      stockIn() { UI.formDrawer({ title: '商品入库', sub: '入库单', icon: 'upload', fields: [
        { key: 'sku', label: '商品', type: 'select', options: Store.db.supplements.map((g) => ({ v: g.id, l: g.name })) },
        { key: 'qty', label: '数量', type: 'num', value: 20 },
        { key: 'reason', label: '来源', type: 'select', options: ['采购入库', '退货入库', '调拨入库'] }],
        onSave(v) { EN.stockMove(v.sku, v.qty, v.reason); UI.toast('已入库 ' + v.qty + ' 件'); App.refresh(); } }); },
      release(d) { const r = Store.db.reserves.find((x) => x.id === d.id); r.status = 'released'; Store.mark('reserves', '释放预留'); UI.toast('已释放 ' + r.qty + ' 件'); App.refresh(); }
    }
  };
})();
