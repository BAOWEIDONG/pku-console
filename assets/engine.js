/* 业务引擎：状态机 / 校验 / 快照 / 审计 / SLA */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  window.Engine = window.Engine || {};

  // ---------- 状态机 ----------
  const FSM = {
    '服务预约': {
      states: ['pending', 'confirmed', 'completed', 'cancelled', 'settled'],
      label: { pending: '待确认', confirmed: '已确认', completed: '已履约', cancelled: '已取消', settled: '已结算' },
      next: { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: ['settled'], cancelled: [], settled: [] },
      sla: { pending: 2, confirmed: 24 } // 小时
    },
    '商品': {
      states: ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'settled'],
      label: { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已签收', cancelled: '已取消', settled: '已结算' },
      next: { pending: ['paid', 'cancelled'], paid: ['shipped', 'cancelled'], shipped: ['completed'], completed: ['settled'], cancelled: [], settled: [] },
      sla: { pending: 24, paid: 48 }
    }
  };
  Engine.FSM = FSM;
  Engine.fsmOf = (kind) => FSM[kind] || FSM['服务预约'];

  // ---------- 统一订单 ----------
  Engine.orders = function () {
    const db = Store.db;
    const out = [];
    db.employee.bookings.forEach((b) => out.push({ id: b.id, kind: '服务预约', customer: b.person, item: b.service, amount: 0, price: 1280, at: b.created, status: b.status, meta: b.date + ' ' + b.time + ' · ' + b.org, channel: 'h5-employee' }));
    db.supplements.filter((g) => g.sold > 0).slice(0, 6).forEach((g, i) => out.push({ id: 'GD2026' + (1100 + i), kind: '商品', customer: ['林悦', '陈嘉禾', '周雯', '徐一鸣', '何雨桐', '赵启明'][i], item: g.name, amount: g.price, price: g.price, at: '2026-11-0' + (i + 1) + ' 10:00', status: i % 3 === 0 ? 'pending' : 'paid', meta: '×1 · 顺丰', channel: 'wxwork', sku: g.id }));
    db.versionall.exchanges.forEach((e) => out.push({ id: e.id, kind: '积分兑换', customer: e.studentName, item: e.productName, amount: 0, price: 0, at: e.date, status: e.status === 'fulfilled' ? 'completed' : e.status, meta: e.points + ' 积分', channel: 'h5-camp' }));
    return out;
  };
  Engine.orderById = (id) => Engine.orders().find((o) => o.id === id);

  // ---------- 审计 ----------
  Engine.audit = function (orderId, act, from, to, reason) {
    Store.db.audits = Store.db.audits || [];
    Store.db.audits.unshift({ id: 'a' + Date.now() + Math.random().toString(36).slice(2, 5), orderId: orderId, act: act, from: from, to: to, reason: reason || '', at: '2026-11-08 10:20', by: Store.role.name });
    Store.persist();
  };
  Engine.auditsOf = (orderId) => (Store.db.audits || []).filter((a) => a.orderId === orderId);

  // ---------- 服务商品校验 ----------
  Engine.validateService = function (s) {
    const r = [];
    const p = s.pricing && s.pricing[0];
    if (!p) r.push(['error', '未配置价格 SKU']);
    else if (p.settle > p.list) r.push(['error', '结算价高于挂牌价']);
    else if ((p.settle - p.cost) / p.settle < 0.2) r.push(['warn', '毛利率低于 20%']);
    if (!s.channels || !s.channels.length) r.push(['error', '未选择投放渠道']);
    if (!s.orgs || !s.orgs.length) r.push(['warn', '未配置履约机构']);
    if (!s.rules || !s.rules.leadDays) r.push(['warn', '履约规则不完整']);
    if (!s.assets || !s.assets.gallery || !s.assets.gallery.length) r.push(['warn', '缺少详情图']);
    return r;
  };
  Engine.serviceErrors = (s) => Engine.validateService(s).filter((x) => x[0] === 'error');

  // ---------- 食谱发布校验 ----------
  Engine.validateDay = function (p) {
    const r = [];
    const meals = p.meals || {};
    ['早餐', '午餐', '晚餐', '加餐'].forEach((m) => { if (!meals[m]) r.push(['error', m + ' 未选择餐次模板']); });
    const dishes = Object.keys(meals).reduce((a, m) => {
      const t = (Store.db.mealTemplates || []).find((x) => x.id === meals[m]);
      return a.concat(t ? t.dishes : []);
    }, []);
    const allergens = {};
    dishes.forEach((d) => {
      const dish = (Store.db.dishes || []).find((x) => x.id === d) || {};
      (dish.allerg || []).forEach((a) => { allergens[a] = (allergens[a] || 0) + 1; });
    });
    Object.keys(allergens).forEach((a) => { if (allergens[a] >= 3) r.push(['warn', '过敏原 ' + a + ' 出现 ' + allergens[a] + ' 次，注意人群']); });
    if (p.kcal < 1200 || p.kcal > 2600) r.push(['warn', '总热量 ' + p.kcal + ' kcal 偏离常规区间']);
    return r;
  };

  // ---------- 订单详情页 ----------
  P['trd-order'] = {
    app: 'all', grp: 'v.fulfill', papp: 'employee', title: '订单详情', sub: '状态机 / 快照 / 审计 / SLA', hideNav: true,
    render(ctx) {
      const o = Engine.orderById((ctx && ctx.id) || '') || Engine.orders()[0];
      state0.id = o.id;
      const fsm = Engine.fsmOf(o.kind);
      const audits = Engine.auditsOf(o.id);
      const idx = fsm.states.indexOf(o.status);
      const can = fsm.next[o.status] || [];
      return K.head(o.id, o.kind + ' · ' + E(o.customer) + ' · ' + E(o.item),
        K.btn('返回订单', 'back', { icon: 'undo' }) +
        can.map((s) => '<button class="btn ' + (s === 'cancelled' ? 'danger' : s === 'settled' ? '' : 'primary') + '" data-act="adv" data-id="' + s + '">' + (fsm.label[s] || s) + '</button>').join('')) +
        '<div class="grid g-2-1" style="align-items:start">' +
          '<div class="stack">' +
            K.panel({ title: '状态流转', sub: '只允许合法迁移', body: '<div class="row" style="gap:0;padding:4px 0">' +
              fsm.states.filter((s) => s !== 'cancelled').map((s, i, arr) => {
                const on = fsm.states.indexOf(s) <= idx;
                const cur = s === o.status;
                return '<div style="flex:1;text-align:center"><div class="ava" style="margin:0 auto;width:26px;height:26px;border-radius:50%;background:' + (on ? '#0b63e5' : '#eef3fa') + ';color:' + (on ? '#fff' : '#9aa8bd') + ';font-size:11px">' + (on ? '✓' : i + 1) + '</div>' +
                  '<div class="small" style="margin-top:6px;' + (cur ? 'font-weight:600' : 'color:var(--ink-3)') + '">' + fsm.label[s] + '</div></div>' +
                  (i < arr.length - 1 ? '<div style="flex:0 0 18px;height:1px;background:' + (on ? '#0b63e5' : '#e4ebf5') + ';align-self:center"></div>' : '');
              }).join('') + '</div>' +
              '<div class="note" style="margin-top:12px">当前状态：<b>' + (fsm.label[o.status] || o.status) + '</b>；可执行：' + (can.length ? can.map((s) => fsm.label[s]).join('、') : '无（终态）') + '</div>' }) +
            K.panel({ title: '订单快照', sub: '下单时的价格与规则，不随配置变更', body: dsHTML(o) }) +
            K.panel({ title: '操作审计', sub: audits.length + ' 条', flush: true, body:
              audits.length ? UI.table([
                { label: '时间', render: (a) => '<span class="small tnum muted">' + E(a.at) + '</span>' },
                { label: '动作', render: (a) => E(a.act) },
                { label: '状态', render: (a) => '<span class="small">' + E((fsm.label[a.from] || a.from) + ' → ' + (fsm.label[a.to] || a.to)) + '</span>' },
                { label: '操作人', render: (a) => E(a.by) },
                { label: '原因', render: (a) => '<span class="small muted">' + E(a.reason) + '</span>' }
              ], audits.map((a) => Object.assign({ _id: a.id }, a))) : '<div class="empty" style="padding:26px">暂无操作记录</div>' }) +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '履约 SLA', body: slaHTML(o, fsm) }) +
            K.panel({ title: '金额与退款', body: moneyHTML(o) }) +
          '</div>' +
        '</div>';
    },
    actions: {
      back() { App.go('trd-orders'); },
      adv(d) {
        const o = Engine.orderById(state0.id);
        const to = d.id;
        const fsm = Engine.fsmOf(o.kind);
        if (!(fsm.next[o.status] || []).includes(to)) { UI.toast('非法状态迁移', 'warn'); return; }
        if (to === 'cancelled') {
          const refund = Math.round((o.price || 0) * (o.status === 'pending' ? 1 : 0.5));
          UI.modal({ title: '取消订单', desc: '按当前状态计算退款', body: '<dl class="kv"><dt>订单金额</dt><dd class="tnum">¥' + (o.price || 0) + '</dd><dt>可退金额</dt><dd class="tnum">¥' + refund + '</dd><dt>原因</dt><dd><select class="select" id="cx"><option>客户主动取消</option><option>超时未履约</option><option>资源不可用</option></select></dd></dl>',
            okText: '确认取消', danger: true,
            onOk(n) { apply(to, o, '取消：' + n.querySelector('#cx').value); } });
          return;
        }
        apply(to, o, '');
      }
    }
  };

  let state0 = {};
  function apply(to, o, reason) {
    const fsm = Engine.fsmOf(o.kind);
    const db = Store.db;
    if (o.kind === '服务预约') {
      const b = db.employee.bookings.find((x) => x.id === o.id);
      if (b) { b.status = to === 'completed' ? 'completed' : to === 'settled' ? 'completed' : to; }
    }
    if (o.kind === '商品') {
      const g = db.supplements.find((x) => x.id === o.sku);
      if (g && to === 'paid') { g.stock = Math.max(0, g.stock - 1); }
      if (g && to === 'cancelled') { g.stock = g.stock + 1; }
    }
    Engine.audit(o.id, '状态变更', o.status, to, reason);
    Store.mark('orders', '订单状态');
    UI.closeOverlay();
    UI.toast('已更新为「' + (fsm.label[to] || to) + '」');
    App.refresh();
  }

  function dsHTML(o) {
    const rows = [['订单号', o.id], ['类型', o.kind], ['客户', o.customer], ['商品 / 服务', o.item], ['渠道', (Store.db.channels.find((c) => c.id === o.channel) || {}).name || o.channel], ['下单时间', o.at], ['明细', o.meta || '—'], ['价格口径', o.price ? '¥' + o.price : '权益 / 积分']];
    return '<dl class="kv">' + rows.map((r) => '<dt>' + r[0] + '</dt><dd>' + E(r[1]) + '</dd>').join('') + '</dl>';
  }
  function slaHTML(o, fsm) {
    const limit = fsm.sla[o.status];
    if (!limit) return '<div class="small mut">终态，无 SLA 要求。</div>';
    const used = 6;
    const pct = Math.min(100, Math.round(used / limit * 100));
    return '<div class="row small" style="justify-content:space-between"><span>当前状态时限</span><b class="tnum">' + limit + ' 小时</b></div>' +
      '<div class="progress" style="margin-top:8px"><b style="width:' + pct + '%;background:' + (pct > 80 ? '#d9503f' : '#0b63e5') + '"></b></div>' +
      '<div class="small mut" style="margin-top:6px">已等待 ' + used + ' 小时 · ' + (pct > 80 ? '临近超时，需升级' : '正常') + '</div>';
  }
  function moneyHTML(o) {
    return '<div class="stack" style="gap:8px">' +
      '<div class="row small"><span class="mut">订单金额</span><b class="right tnum">¥' + (o.price || 0) + '</b></div>' +
      '<div class="row small"><span class="mut">已退款</span><b class="right tnum">¥0</b></div>' +
      '<div class="row small"><span class="mut">结算状态</span><b class="right">' + (o.status === 'settled' ? '已结算' : '未结算') + '</b></div>' +
      '</div><div class="note" style="margin-top:10px">退款按状态计算：待确认全退，已确认退 50%，已履约不退。</div>';
  }
})();
