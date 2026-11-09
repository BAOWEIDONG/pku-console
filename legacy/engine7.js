/* 字段级权限：能看单不能看号，能看价不能看成本 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine;

  const FIELDS = [
    { key: 'cost', name: '成本价', desc: '服务与商品的成本口径' },
    { key: 'margin', name: '毛利率', desc: '经营敏感指标' },
    { key: 'customer', name: '客户姓名', desc: '个人信息' },
    { key: 'phone', name: '手机号', desc: '个人敏感信息' }
  ];

  EN.ensureField = function () {
    const db = Store.db;
    if (!db.rbac.fieldPerms) db.rbac.fieldPerms = {
      super: { cost: true, margin: true, customer: true, phone: true },
      ops: { cost: true, margin: true, customer: true, phone: false },
      diet: { cost: false, margin: false, customer: true, phone: true },
      coach: { cost: false, margin: false, customer: true, phone: false },
      brand: { cost: false, margin: false, customer: false, phone: false },
      hr: { cost: false, margin: false, customer: false, phone: false },
      audit: { cost: true, margin: true, customer: false, phone: false }
    };
  };
  EN.canField = function (field) {
    EN.ensureField();
    if (Store.roleId === 'super') return true;
    const p = (Store.db.rbac.fieldPerms || {})[Store.roleId] || {};
    return !!p[field];
  };
  EN.mask = function (field, value) { return EN.canField(field) ? value : '<span style="letter-spacing:1px;color:#9aa8bd">••••••</span>'; };
  EN.maskText = function (field, value) { return EN.canField(field) ? value : '已隐藏'; };

  P['g-fields'] = {
    app: 'all', grp: 'roles', papp: 'pku', title: '字段级权限', sub: '同一角色可看单据，但不能看手机号与成本', preview: 'pku-home',
    render() {
      EN.ensureField();
      const roles = Store.db.rbac.roles;
      const fp = Store.db.rbac.fieldPerms;
      return K.head('字段级权限', roles.length + ' 个角色 · ' + FIELDS.length + ' 类敏感字段',
        '<button class="btn primary" data-act="save">' + I('check', 15) + '保存</button>') +
        '<div class="note" style="margin-bottom:14px">角色决定了能进哪些页面，字段权限决定了进去之后能看到什么。手机号、成本价默认不对非必要角色开放。</div>' +
        K.panel({ flush: true, body: UI.table([
          { label: '角色', render: (r) => '<div class="row"><i style="width:7px;height:7px;border-radius:50%;background:' + (r.color === 'green' ? '#0aa39a' : r.color === 'violet' ? '#8b7cf6' : r.color === 'amber' ? '#c8871a' : '#3f8cff') + '"></i><b>' + E(r.name) + '</b>' + (r.builtin ? '<span class="small mut">内置</span>' : '') + '</div>' },
          FIELDS.map((f) => ({
            label: f.name, align: 'center', w: '96px',
            render: (r) => {
              const on = (fp[r.id] || {})[f.key];
              const locked = r.id === 'super';
              return '<button class="switch ' + (on ? 'on' : '') + '" data-act="toggleField" data-id="' + r.id + '|' + f.key + '"' + (locked ? ' style="opacity:.45;pointer-events:none"' : '') + '></button>';
            }
          }))
        ].flat(), roles.map((r) => Object.assign({ _id: r.id }, r))) }) +
        '<div style="height:16px"></div>' +
        K.panel({ title: '生效示例', sub: '当前角色：' + Store.role.name, body: '<div class="grid g-3" style="gap:12px">' +
          [['成本价', EN.mask('cost', '¥720'), '服务商品 · 价格页'], ['毛利率', EN.mask('margin', '38%'), '服务商品列表'], ['客户姓名', EN.mask('customer', '林悦'), '订单详情']].map((x) =>
            '<div class="panel" style="padding:12px;box-shadow:none"><div class="small mut">' + x[2] + '</div><div style="margin-top:6px;font-size:15px;font-weight:600">' + x[1] + '</div></div>').join('') +
          '</div>' });
    },
    actions: {
      toggleField(d) {
        const [role, field] = String(d.id).split('|');
        if (role === 'super') return;
        const fp = Store.db.rbac.fieldPerms;
        fp[role] = fp[role] || {};
        fp[role][field] = !fp[role][field];
        Store.mark('rbac.fieldPerms', '字段权限');
        Store.persist(); App.refresh();
      },
      save() { UI.toast('字段权限已保存'); }
    }
  };
})();
