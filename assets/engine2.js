/* 收入链闭环：时段库存/占号 · 超时升级 · 结算差异 · 履约清单 · 库存动账 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine = window.Engine || {};

  /* 初始化库存与占号（幂等） */
  EN.initOps = function () {
    const db = Store.db;
    if (!db.quota) db.quota = { '2026-11-07|08:30|annual-exam': { cap: 6, used: 5 }, '2026-11-07|10:00|annual-exam': { cap: 6, used: 6 }, '2026-11-08|14:00|gastro': { cap: 4, used: 2 }, '2026-11-09|08:30|fivehigh': { cap: 6, used: 3 } };
    if (!db.holds) db.holds = [];
    if (!db.stockLog) db.stockLog = [
      { id: 'sl1', sku: 'su1', delta: -2, reason: '订单 GD20261101 支付', at: '2026-11-01 10:02', by: '系统' },
      { id: 'sl2', sku: 'su3', delta: -1, reason: '订单 GD20261102 支付', at: '2026-11-02 10:02', by: '系统' },
      { id: 'sl3', sku: 'su1', delta: 6, reason: '入库单 RK20261103', at: '2026-11-03 09:20', by: '仓储' }
    ];
    if (!db.settleDiff) db.settleDiff = [
      { id: 'df1', period: '2026-10', partner: '示例科技有限公司', type: '退单未冲销', amount: -1280, order: 'BK20261009021', status: 'pending' },
      { id: 'df2', period: '2026-10', partner: '示例科技有限公司', type: '价格口径不一致', amount: 460, order: 'BK20261012008', status: 'pending' },
      { id: 'df3', period: '2026-09', partner: '某保险TPA', type: '重复计费', amount: -860, order: 'ST2026090003', status: 'fixed' }
    ];
    if (!db.checklists) db.checklists = { 'BK20261106001': [['登记到院', true, '前台'], ['基础检查', true, '护士站'], ['报告出具', false, '检验科'], ['报告解读', false, '医生']] };
  };
  EN.ensure = function () { if (window.Store && Store.db && !Store.db.quota) EN.initOps(); };

  const money = (n) => (n < 0 ? '-¥' : '¥') + Math.abs(n).toLocaleString('zh-CN');

  EN.slotKey = (date, time, svcId) => date + '|' + time + '|' + svcId;

  /* 占号：返回 {ok, left, reason} */
  EN.holdSlot = function (order) {
    EN.ensure();
    const db = Store.db;
    const key = EN.slotKey(order.date, order.time, order.serviceId || order.item);
    const q = db.quota[key] || (db.quota[key] = { cap: 6, used: 0 });
    if (q.used >= q.cap) return { ok: false, reason: '该时段已约满' };
    q.used += 1;
    db.holds.push({ id: 'h' + Date.now(), orderId: order.id, key: key, at: '2026-11-08 10:20' });
    db.audits = db.audits || [];
    db.audits.unshift({ id: 'a' + Date.now(), orderId: order.id, act: '占号', from: order.status, to: order.status, reason: key.replace(/\|/g, ' · '), at: '2026-11-08 10:20', by: Store.role.name });
    Store.persist();
    return { ok: true, left: q.cap - q.used };
  };
  EN.releaseSlot = function (orderId) {
    const db = Store.db;
    const h = (db.holds || []).find((x) => x.orderId === orderId);
    if (!h) return;
    const q = db.quota[h.key];
    if (q && q.used > 0) q.used -= 1;
    db.holds = db.holds.filter((x) => x.orderId !== orderId);
    Store.persist();
  };

  /* 超时扫描 */
  EN.slaScan = function () {
    const db = Store.db;
    db.escalations = db.escalations || [];
    const out = [];
    EN.orders().forEach((o) => {
      const fsm = EN.fsmOf(o.kind);
      const limit = fsm.sla[o.status];
      if (!limit) return;
      const mins = o.status === 'pending' ? 130 : 900;
      if (mins / 60 > limit) out.push({ id: o.id, kind: o.kind, item: o.item, status: fsm.label[o.status], waited: Math.round(mins / 60) + 'h', limit: limit + 'h' });
    });
    return out;
  };

  /* 履约清单 */
  EN.checklistOf = (orderId) => { EN.ensure(); return (Store.db.checklists || {})[orderId] || []; };
  EN.toggleCheck = function (orderId, idx) {
    const db = Store.db;
    db.checklists = db.checklists || {};
    const list = db.checklists[orderId] || (db.checklists[orderId] = [['预约登记', true, '前台'], ['到院签到', false, '前台'], ['服务履约', false, '医生'], ['报告/结果', false, '检验科'], ['客户确认', false, '客服']]);
    list[idx][1] = !list[idx][1];
    Store.mark('checklists', '履约清单');
    Store.persist();
  };
  EN.checkProgress = (orderId) => {
    const l = EN.checklistOf(orderId);
    if (!l.length) return 0;
    return Math.round(l.filter((x) => x[1]).length / l.length * 100);
  };

  /* 库存动账 */
  EN.stockMove = function (sku, delta, reason) {
    EN.ensure();
    const db = Store.db;
    const g = (db.supplements || []).find((x) => x.id === sku);
    if (!g) return false;
    if (g.stock + delta < 0) return false;
    g.stock += delta;
    (db.stockLog = db.stockLog || []).unshift({ id: 'sl' + Date.now(), sku: sku, delta: delta, reason: reason, at: '2026-11-08 10:20', by: Store.role.name });
    Store.mark('supplements', '库存动账');
    Store.persist();
    return true;
  };

  /* 结算差异 */
  EN.diffOf = (period, partner) => (Store.db.settleDiff || []).filter((d) => d.period === period && d.partner === partner);
  EN.settleBlocked = (period, partner) => EN.diffOf(period, partner).some((d) => d.status === 'pending');

  /* ---------------- 时段库存页 ---------------- */
  P['trd-slots'] = {
    app: 'all', grp: 'e.booking', papp: 'employee', title: '时段与占号', sub: '号源是有限资源，先占号再履约', preview: 'emp-detail',
    render() {
      EN.ensure();
      const q = Store.db.quota;
      const rows = Object.keys(q).map((k) => {
        const [date, time, svc] = k.split('|');
        return { id: k, date, time, svc, cap: q[k].cap, used: q[k].used };
      }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      const total = rows.reduce((a, r) => a + r.cap, 0), used = rows.reduce((a, r) => a + r.used, 0);
      return K.head('时段与占号', rows.length + ' 个号源时段 · 已占 ' + used + ' / ' + total,
        K.btn('批量放号', 'addSlot', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '号源总数', v: total, unit: '个', d: rows.length + ' 个时段', icon: 'calendar' },
          { k: '已占', v: used, unit: '个', d: '占号率 ' + Math.round(used / (total || 1) * 100) + '%', icon: 'users' },
          { k: '约满时段', v: rows.filter((r) => r.used >= r.cap).length, unit: '个', d: '需加号或引导改期', tone: 'down', icon: 'clock' },
          { k: '待释放', v: (Store.db.holds || []).length, unit: '个', d: '取消订单自动释放', icon: 'undo' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '日期', render: (r) => '<span class="tnum small">' + r.date + '</span>' },
          { label: '时段', render: (r) => '<b class="tnum">' + r.time + '</b>' },
          { label: '服务', render: (r) => '<span class="small">' + E((Store.db.employee.services.find((s) => s.id === r.svc) || {}).name || r.svc) + '</span>' },
          { label: '占号', w: '180px', render: (r) => '<div class="row" style="gap:8px"><div style="flex:1">' + K.progress(r.used / r.cap * 100) + '</div><span class="small tnum">' + r.used + '/' + r.cap + '</span></div>' },
          { label: '状态', render: (r) => r.used >= r.cap ? UI.pill('约满', 'red') : r.used / r.cap > 0.8 ? UI.pill('紧张', 'amber') : UI.pill('可约', 'green') },
          { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="editSlot" data-id="' + r.id + '">' + I('edit', 14) + '</button></div>' }
        ], rows.map((r) => Object.assign({ _id: r.id }, r))) });
    },
    actions: {
      addSlot() { UI.formDrawer({ title: '批量放号', sub: '按日期与时段的容量', icon: 'calendar',
        fields: [{ key: 'date', label: '日期', type: 'select', options: Store.db.employee.schedule.dates.map((d) => ({ v: '2026-' + d.d, l: d.d + ' ' + d.w })) },
          { key: 'time', label: '时段', type: 'select', options: Store.db.employee.schedule.times.map((t) => ({ v: t.t, l: t.t + ' ' + t.n })) },
          { key: 'svc', label: '服务', type: 'select', options: Store.db.employee.services.slice(0, 6).map((s) => ({ v: s.id, l: s.name })) },
          { key: 'cap', label: '容量', type: 'num', value: 6 }],
        onSave(v) { const k = EN.slotKey(v.date, v.time, v.svc); Store.db.quota[k] = { cap: v.cap, used: 0 }; Store.mark('quota', '放号'); UI.toast('已放号 ' + v.cap + ' 个'); App.refresh(); } }); },
      editSlot(d) { const k = d.id; const q = Store.db.quota[k]; Store.db.quota[k] = { cap: q.cap + 2, used: q.used }; Store.mark('quota', '加号'); UI.toast('已加 2 个号源'); App.refresh(); }
    }
  };

  /* ---------------- 超时升级页 ---------------- */
  P['trd-sla'] = {
    app: 'all', grp: 'v.fulfill', papp: 'employee', title: '超时与升级', sub: 'SLA 扫描 · 超时自动升级到负责人', preview: 'emp-detail',
    render() {
      EN.ensure();
      const list = EN.slaScan();
      return K.head('超时与升级', list.length + ' 单超过当前状态时限',
        K.btn('立即扫描', 'scan', { icon: 'refresh', cls: 'primary' })) +
        '<div class="note" style="margin-bottom:14px">规则：待确认超过 2 小时升级到运营主管；已确认超过 24 小时未履约升级到履约负责人；超时 3 次进入质量抽检。</div>' +
        K.panel({ flush: true, body: UI.table([
          { label: '订单', render: (o) => '<span class="tnum small">' + o.id + '</span>' },
          { label: '类型', render: (o) => UI.pill(o.kind, 'grey') },
          { label: '内容', render: (o) => E(o.item) },
          { label: '当前状态', render: (o) => UI.pill(o.status, 'amber') },
          { label: '已等待 / 时限', align: 'right', render: (o) => '<span class="tnum" style="color:#b83c2c">' + o.waited + '</span><span class="small mut"> / ' + o.limit + '</span>' },
          { label: '升级到', render: () => '<span class="small">运营主管</span>' },
          { label: '', align: 'right', render: (o) => '<div class="rowact"><button data-act="esc" data-id="' + o.id + '">' + I('send', 14) + '</button></div>' }
        ], list.map((o) => Object.assign({ _id: o.id }, o)), { emptyTitle: '当前没有超时订单' }) });
    },
    actions: { scan() { UI.toast('扫描完成，共 ' + EN.slaScan().length + ' 单超时'); App.refresh(); }, esc(d) { UI.toast('已升级并通知运营主管：' + d.id); } }
  };

  /* ---------------- 结算差异页 ---------------- */
  P['trd-diff'] = {
    app: 'all', grp: 'v.report', papp: 'employee', title: '结算差异', sub: '差异不处理，账单不能结', preview: 'emp-home',
    render() {
      EN.ensure();
      const list = Store.db.settleDiff;
      const pend = list.filter((d) => d.status === 'pending');
      return K.head('结算差异', list.length + ' 条差异 · 待处理 ' + pend.length,
        K.btn('新建差异', 'newDiff', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '待处理', v: pend.length, unit: '条', d: '影响 2 个账期', tone: 'down', icon: 'clock' },
          { k: '差异金额', v: money(pend.reduce((a, b) => a + b.amount, 0)), d: '含 1 笔负数', icon: 'target' },
          { k: '已修正', v: list.filter((d) => d.status === 'fixed').length, unit: '条', d: '本月', icon: 'check' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '账期', render: (d) => '<span class="tnum small">' + d.period + '</span>' },
          { label: '合作方', render: (d) => '<span class="small">' + E(d.partner) + '</span>' },
          { label: '差异类型', render: (d) => UI.pill(d.type, d.type === '退单未冲销' ? 'red' : 'amber') },
          { label: '关联订单', render: (d) => '<span class="tnum small">' + d.order + '</span>' },
          { label: '金额', align: 'right', render: (d) => '<b class="tnum" style="color:' + (d.amount < 0 ? '#b83c2c' : '#087e76') + '">' + money(d.amount) + '</b>' },
          { label: '状态', render: (d) => d.status === 'fixed' ? UI.pill('已修正', 'green') : UI.pill('待处理', 'amber') },
          { label: '', align: 'right', render: (d) => d.status === 'fixed' ? '' : '<div class="rowact"><button data-act="fix" data-id="' + d.id + '">' + I('check', 14) + '</button></div>' }
        ], list.map((d) => Object.assign({ _id: d.id }, d))) }) +
        '<div class="note warn" style="margin-top:14px">存在待处理差异的账期无法发起结算，需先冲销或调整。</div>';
    },
    actions: {
      newDiff() { UI.toast('新建差异'); },
      fix(d) { UI.confirm({ title: '确认修正该差异？', desc: '修正后该账期可发起结算，操作会记入审计。', okText: '确认修正' }).then((ok) => { if (!ok) return; const x = Store.db.settleDiff.find((y) => y.id === d.id); x.status = 'fixed'; Store.mark('settleDiff', '修正差异'); UI.toast('已修正'); App.refresh(); }); }
    }
  };

  /* ---------------- 订单详情增强（挂载） ---------------- */
  const oldRender = null;
  EN.orderExtras = function (o) {
    let h = '';
    if (o.kind === '服务预约') {
      const list = EN.checklistOf(o.id);
      const pct = EN.checkProgress(o.id);
      h += K.panel({ title: '履约清单', sub: pct + '%', flush: true, body: '<div style="padding:4px 18px 12px">' +
        list.map((c, i) => '<div class="listrow"><span class="pill ' + (c[1] ? 'green' : 'grey') + '">' + (c[1] ? '已完成' : '待完成') + '</span>' +
          '<div class="meta"><b>' + E(c[0]) + '</b><span>' + E(c[2]) + '</span></div>' +
          '<button class="switch right ' + (c[1] ? 'on' : '') + '" data-act="checkItem" data-id="' + i + '"></button></div>').join('') + '</div>' });
    }
    if (o.kind === '商品') {
      const log = (Store.db.stockLog || []).filter((x) => x.sku === o.sku);
      h += K.panel({ title: '库存动账', sub: log.length + ' 条', flush: true, body: log.length ? UI.table([
        { label: '时间', render: (l) => '<span class="small tnum muted">' + l.at + '</span>' },
        { label: '变动', align: 'right', render: (l) => '<b class="tnum" style="color:' + (l.delta < 0 ? '#b83c2c' : '#087e76') + '">' + (l.delta > 0 ? '+' : '') + l.delta + '</b>' },
        { label: '原因', render: (l) => '<span class="small">' + E(l.reason) + '</span>' },
        { label: '操作人', render: (l) => '<span class="small muted">' + E(l.by) + '</span>' }
      ], log.map((l) => Object.assign({ _id: l.id }, l))) : '<div class="empty" style="padding:24px">暂无动账</div>' });
    }
    return h;
  };
})();
