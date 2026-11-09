/* ============================================================================
   上下游经营：甲方业务公司（客户所属企业）× 乙方服务商（履约与供货）
   服务、实物商品、员工客户、履约订单与应收/应付都回到同一对象。
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};

  const U = () => Store.db.upstream || { companies: [], providers: [], payables: [] };
  const C = () => U().companies || [];
  const R = () => U().providers || [];
  const PAY = () => U().payables || [];
  const nf = (n) => Number(n || 0).toLocaleString('zh-CN');
  const money = (n) => '¥' + nf(Math.round(Number(n) || 0));
  const wan = (n) => {
    const v = Number(n) || 0;
    return v >= 10000 ? '¥' + (v / 10000).toFixed(v >= 1000000 ? 0 : 1) + ' 万' : money(v);
  };
  const pct = (a, b) => Math.max(0, Math.min(100, Math.round((Number(a) || 0) / (Number(b) || 1) * 100)));

  const CO_ST = { active: ['合作中', 'green'], renewing: ['待续约', 'amber'], risk: ['风险', 'red'] };
  const PR_ST = { active: ['合作中', 'green'], paused: ['已暂停', 'grey'], risk: ['需观察', 'red'] };
  const PAY_ST = { pending: ['待结算', 'amber'], approved: ['已审核', 'blue'], paid: ['已打款', 'green'], overdue: ['已逾期', 'red'] };
  const SOURCE = { brand: '品牌站', employee: '职工端', camp: '减重营', web: '官网', offline: '线下活动', exam: '体检活动' };
  const stPill = (map, key) => UI.pill((map[key] || map.active)[0], (map[key] || map.active)[1]);

  function ensure() {
    const d = Store.db;
    if (!d.upstream) d.upstream = { companies: [], providers: [], payables: [] };
    const u = d.upstream;
    if (!Array.isArray(u.companies)) u.companies = [];
    if (!Array.isArray(u.providers)) u.providers = [];
    if (!Array.isArray(u.payables)) u.payables = [];
    if (window.CRM && CRM.ensure) CRM.ensure();
    const providers = u.providers;
    (d.employee && d.employee.services ? d.employee.services : []).forEach((s) => {
      if (s.providerId) return;
      let p = providers.find((x) => (x.aliases || []).some((a) => (s.orgs || []).some((o) => o.indexOf(a) >= 0 || a.indexOf(o) >= 0)));
      if (!p) p = providers.find((x) => x.id === (s.mod === 'screen' ? 'sp1' : s.mod === 'chronic' ? 'sp2' : s.mod === 'safety' ? 'sp8' : s.mod === 'special' ? 'sp7' : 'sp3'));
      s.providerId = (p || providers[0] || {}).id || '';
    });
    (d.supplements || []).forEach((g) => { if (!g.providerId) g.providerId = 'sp6'; });
  }

  const companyById = (id) => C().find((c) => c.id === id) || C()[0] || {};
  const providerById = (id) => R().find((p) => p.id === id) || R()[0] || {};
  const crmOf = (c) => ((Store.db.crm && Store.db.crm.customers) || []).filter((x) => x.company === c.name || x.company === c.short);
  const profilesOf = (c) => ((Store.db.health && Store.db.health.profiles) || []).filter((p) => p.company === c.name || p.company === c.short);
  const providersOfCompany = (c) => R().filter((p) => (p.clients || []).indexOf(c.id) >= 0);
  const servicesOfProvider = (p) => ((Store.db.employee && Store.db.employee.services) || []).filter((s) => s.providerId === p.id);
  const goodsOfProvider = (p) => (Store.db.supplements || []).filter((g) => g.providerId === p.id);
  const payablesOf = (p) => PAY().filter((x) => x.providerId === p.id);
  const receivablesOf = (c) => ((Store.db.settle && Store.db.settle.records) || []).filter((r) => r.partner === c.name || r.partner === c.settlePartner);
  const companyHealth = (c) => Math.max(58, Math.min(98, ({ A: 92, B: 84, C: 74 }[c.level] || 78) - (c.status === 'risk' ? 14 : c.status === 'renewing' ? 6 : 0) + (c.tags || []).length));

  function companyItem(c, sel) {
    return '<button class="up-item ' + (sel === c.id ? 'on' : '') + '" data-act="selectCompany" data-id="' + c.id + '">' +
      '<span class="up-ava">' + E((c.short || c.name || '企').slice(0, 1)) + '</span>' +
      '<div><b>' + E(c.short || c.name) + '</b><span>' + E(c.industry) + ' · ' + nf(c.employees) + ' 人</span><em>' + E((c.contract || {}).name || '未签合同') + '</em></div>' +
      stPill(CO_ST, c.status) + '</button>';
  }

  function providerItem(p, sel) {
    return '<button class="up-item ' + (sel === p.id ? 'on' : '') + '" data-act="selectProvider" data-id="' + p.id + '">' +
      '<span class="up-ava alt">' + E((p.short || p.name || '商').slice(0, 1)) + '</span>' +
      '<div><b>' + E(p.short || p.name) + '</b><span>' + E(p.type) + ' · ' + E(p.city) + '</span><em>★ ' + p.rating + ' · 准时 ' + p.onTime + '%</em></div>' +
      stPill(PR_ST, p.status) + '</button>';
  }

  function contactRow(c) {
    return '<button class="up-linkrow" data-act="openCustomer" data-id="' + E(c.id || c.name) + '">' + UI.avatar(c.name) +
      '<div><b>' + E(c.name) + '</b><span>' + E(c.dept || '—') + ' · ' + E(c.position || '员工') + '</span></div>' +
      '<em>' + E(c.lastAt || '') + '</em>' + I('chevron', 13) + '</button>';
  }

  function providerRow(p) {
    return '<button class="up-linkrow" data-act="openProvider" data-id="' + p.id + '">' +
      '<span class="up-ava sm">' + E((p.short || p.name).slice(0, 1)) + '</span>' +
      '<div><b>' + E(p.short || p.name) + '</b><span>' + E(p.type) + ' · ' + E(p.city) + '</span></div>' +
      '<em>★ ' + p.rating + '</em>' + I('chevron', 13) + '</button>';
  }

  function clientRow(c) {
    return '<button class="up-linkrow" data-act="openCompany" data-id="' + c.id + '">' +
      '<span class="up-ava sm">' + E((c.short || c.name).slice(0, 1)) + '</span>' +
      '<div><b>' + E(c.short || c.name) + '</b><span>' + E(c.industry) + ' · ' + nf(c.employees) + ' 人</span></div>' +
      '<em>' + E((c.contract || {}).settlement || '') + '</em>' + I('chevron', 13) + '</button>';
  }

  function infoRow(label, value) {
    return '<div class="up-row"><span>' + E(label) + '</span><b>' + value + '</b></div>';
  }

  /* ================================================================ 甲方业务公司 */
  P['up-companies'] = {
    app: 'all', grp: 'v.ops', papp: 'employee', title: '业务公司（甲方）', sub: '签约企业是客户的归属，也是合同、服务、应收与健康项目的源头',
    state: { selected: 'bc1', filter: 'all' },
    render(ctx) {
      ensure();
      const st = P['up-companies'].state;
      if (ctx && ctx.id && companyById(ctx.id).id) st.selected = ctx.id;
      const all = C();
      const list = all.filter((c) => st.filter === 'all' || c.status === st.filter);
      const c = companyById(st.selected);
      if (list.length && !list.some((x) => x.id === c.id)) st.selected = list[0].id;
      const sel = companyById(st.selected);
      const contacts = crmOf(sel), profiles = profilesOf(sel);
      const names = {};
      contacts.forEach((x) => { names[x.name] = 1; }); profiles.forEach((x) => { names[x.name] = 1; });
      const bookings = ((Store.db.employee && Store.db.employee.bookings) || []).filter((b) => names[b.person]);
      const orders = ((window.Engine && Engine.orders()) || []).filter((o) => names[o.customer]);
      const provs = providersOfCompany(sel);
      const recs = receivablesOf(sel);
      const contract = sel.contract || {};
      const used = pct(contract.used, contract.amount);
      const highRisk = profiles.filter((p) => p.risk === 'high' || p.risk === 'critical').length;
      const score = companyHealth(sel);
      const allContacts = all.reduce((n, x) => n + crmOf(x).length, 0);
      return K.head('上下游 · 业务公司', all.length + ' 家签约企业 · ' + nf(all.reduce((n, x) => n + (x.employees || 0), 0)) + ' 名员工 · ' + nf(all.reduce((n, x) => n + ((x.contract || {}).amount || 0), 0)) + ' 元合同额',
        K.btn('编辑当前企业', 'editCompany', { icon: 'edit' }) + ' ' + K.btn('新增业务公司', 'newCompany', { icon: 'plus', cls: 'primary' }), 'UPSTREAM / CLIENT SIDE') +
        K.kpis([
          { k: '签约企业', v: all.length, unit: '家', d: '在执行 ' + all.filter((x) => x.status === 'active').length + ' 家', icon: 'building' },
          { k: '覆盖员工', v: nf(all.reduce((n, x) => n + (x.employees || 0), 0)), unit: '人', d: '客户随之归属企业', icon: 'users' },
          { k: '年度合同额', v: wan(all.reduce((n, x) => n + ((x.contract || {}).amount || 0), 0)), d: '含体检、健管与五好', icon: 'file' },
          { k: '待续约', v: all.filter((x) => x.status === 'renewing').length, unit: '家', d: '90 天内到期', tone: 'down', icon: 'clock' },
          { k: 'CRM 联系人', v: allContacts, unit: '人', d: '已进入客户台账', icon: 'user' }
        ]) +
        '<div class="up-layout"><div class="up-list"><div class="up-list-head">' +
          K.seg([{ id: 'all', label: '全部' }, { id: 'active', label: '合作中' }, { id: 'renewing', label: '待续约' }, { id: 'risk', label: '风险' }], st.filter, 'filterCompanies') +
          '<span>' + list.length + ' 家</span></div>' +
          list.map((x) => companyItem(x, sel.id)).join('') +
          (!list.length ? K.empty('没有匹配企业', '切换筛选条件后再看') : '') +
        '</div><div class="up-main">' +
          '<div class="up-hero"><div><span class="up-tag">' + sel.level + ' 级客户 · ' + ((CO_ST[sel.status] || CO_ST.active)[0]) + '</span>' +
            '<h2>' + E(sel.name) + '</h2><p>' + E(sel.industry) + ' · ' + E(sel.city) + ' · 客户负责人 ' + E(sel.owner) + ' · 来源 ' + E(SOURCE[sel.source] || sel.source) + '</p>' +
            '<div class="up-chips"><span>合同至 ' + E(contract.end || '—') + '</span><span>' + nf(sel.employees) + ' 名员工</span><span>' + E(contract.settlement || '—') + '</span><span>' + contacts.length + ' 位 CRM 联系人</span></div></div>' +
            '<div class="up-score"><b>' + score + '</b><span>客户健康度</span><em>' + (sel.status === 'risk' ? '需客户成功介入' : sel.status === 'renewing' ? '续约窗口已到' : '合作稳定') + '</em></div></div>' +
          '<div class="up-kv"><div><span>合同金额</span><b>' + wan(contract.amount) + '</b><em>已用 ' + used + '%</em></div>' +
            '<div><span>员工客户</span><b>' + nf(sel.employees) + '</b><em>健康档案 ' + profiles.length + ' 份</em></div>' +
            '<div><span>服务预约</span><b>' + bookings.length + '</b><em>统一订单 ' + orders.length + ' 条</em></div>' +
            '<div><span>履约服务商</span><b>' + provs.length + '</b><em>乙方协同</em></div></div>' +
          '<div class="grid g-2" style="margin-top:14px">' +
            K.panel({ title: '合同与权益', sub: E(contract.no || '未签合同'), actions: K.btn('续约 / 调整', 'renewCompany', { icon: 'edit', cls: 'ghost sm' }),
              body: '<div class="up-contract">' + infoRow('合同名称', E(contract.name || '—')) + infoRow('有效期', E(contract.start || '—') + ' → ' + E(contract.end || '—')) +
                infoRow('结算方式', E(contract.settlement || '—')) + infoRow('续约启动', E(contract.renewal || '—')) + '</div>' +
                '<div class="up-budget"><div class="row small" style="justify-content:space-between"><span>预算使用</span><b>' + money(contract.used) + ' / ' + money(contract.amount) + '</b></div>' +
                '<div class="progress" style="margin-top:5px"><b style="width:' + used + '%"></b></div></div>' +
                '<div class="up-chips" style="margin-top:10px">' + (contract.services || []).map((s) => '<span>' + E(s) + '</span>').join('') + '</div>' }) +
            K.panel({ title: '客户与员工', sub: contacts.length + ' 位联系人 · ' + profiles.length + ' 份健康档案', actions: K.btn('新增联系人', 'newContact', { icon: 'plus', cls: 'ghost sm' }),
              body: (contacts.length ? contacts.slice(0, 4).map(contactRow).join('') : K.empty('还没有 CRM 联系人', '新增联系人后会进入客户 360')) +
                '<div class="up-note">企业员工是客户，不是独立客户；人员异动只改归属，不重复建档。</div>' }) +
          '</div>' +
          '<div class="grid g-2" style="margin-top:14px">' +
            K.panel({ title: '服务与履约', sub: '从合同权益到真实发生', actions: K.btn('履约台', 'goServiceFlow', { icon: 'activity', cls: 'ghost sm' }),
              body: '<div class="up-mini"><div><b>' + (contract.services || []).length + '</b><span>合同服务</span></div><div><b>' + profiles.length + '</b><span>健康档案</span></div><div><b>' + bookings.length + '</b><span>预约</span></div><div><b>' + highRisk + '</b><span>高风险</span></div></div>' +
                (bookings.length ? '<div class="up-listblock">' + bookings.slice(0, 3).map((b) =>
                  '<div class="up-row"><span>' + E(b.service) + ' · ' + E(b.person) + '</span><b>' + E(b.date) + ' ' + E(b.time) + '</b></div>').join('') + '</div>'
                  : '<div class="up-note">合同服务已配置，等待员工从 H5 预约。</div>') }) +
            K.panel({ title: '履约服务商（乙方）', sub: provs.length + ' 家已关联', actions: K.btn('全部服务商', 'goProviders', { icon: 'link', cls: 'ghost sm' }),
              body: (provs.length ? provs.slice(0, 4).map(providerRow).join('') : K.empty('还没有履约服务商', '在服务商页面把服务挂到企业')) }) +
          '</div>' +
          '<div class="grid g-2" style="margin-top:14px">' +
            K.panel({ title: '应收与结算', sub: recs.length + ' 张对账单', actions: K.btn('结算中心', 'goSettle', { icon: 'chart', cls: 'ghost sm' }),
              body: (recs.length ? recs.map((r) => '<div class="up-row"><span>' + E(r.period) + ' · ' + r.orders + ' 单</span><b>' + money(r.amount) + '</b><em>' + stPill({ pending: ['待结算', 'amber'], invoiced: ['已开票', 'blue'], settled: ['已结清', 'green'] }, r.status) + '</em></div>').join('')
                : '<div class="up-note">本期还没有应收对账单；履约完成后自动进入结算。</div>') +
                '<div class="up-total"><span>已确认应收</span><b>' + money(recs.reduce((n, r) => n + (r.amount || 0), 0)) + '</b></div>' }) +
            K.panel({ title: '风险与下一步', body:
              (sel.status === 'risk' ? '<div class="note warn"><b>合同风险</b><br>职业健康覆盖不足且临近续约，建议客户成功与 EHS 一起复盘。</div>'
                : sel.status === 'renewing' ? '<div class="note warn"><b>续约窗口</b><br>合同即将到期，先确认员工使用率与服务满意度，再谈续约。</div>'
                : highRisk > 0 ? '<div class="note"><b>' + highRisk + ' 位高风险员工</b><br>建议把异常复查和健康计划纳入本次客户回访。</div>'
                : '<div class="note teal">合作稳定。继续提升体检后管理覆盖率与五好生活参与率。</div>') +
                '<div class="up-actions"><button class="btn primary" data-act="newContact">' + I('plus', 14) + '新增联系人</button>' +
                '<button class="btn" data-act="openCustomerList">' + I('users', 14) + '查看客户名单</button>' +
                '<button class="btn ghost" data-act="goSettle">' + I('file', 14) + '查看应收</button></div>' }) +
          '</div>' +
        '</div></div>';
    },
    actions: {
      selectCompany(d) { P['up-companies'].state.selected = d.id; App.refresh(true); },
      filterCompanies(d) { P['up-companies'].state.filter = d.id; App.refresh(); },
      openCompany(d) { App.go('up-companies', { id: d.id }); },
      openCustomer(d) { UI.closeOverlay && UI.closeOverlay(); App.go('crm-360', { id: d.id }); },
      openCustomerList() {
        const c = companyById(P['up-companies'].state.selected);
        const list = crmOf(c);
        UI.modal({ title: '客户名单 · ' + c.short, desc: list.length + ' 位联系人，归属企业 ' + c.name,
          body: (list.length ? '<div class="up-modal-list">' + list.map(contactRow).join('') + '</div>' : K.empty('暂无联系人', '新增后会进入客户 360')),
          okText: '关闭', cancelText: false });
      },
      newContact() {
        const c = companyById(P['up-companies'].state.selected);
        UI.formDrawer({ title: '新增企业联系人', sub: c.name + ' · 录入后进入客户 360', icon: 'user',
          fields: [
            { key: 'name', label: '姓名' },
            { key: 'phone', label: '手机号' },
            { key: 'dept', label: '部门', ph: '如 人力资源部' },
            { key: 'position', label: '职位', ph: '如 HRBP / 工会干事' },
            { key: 'source', label: '来源', type: 'select', options: Object.keys(SOURCE).map((k) => ({ v: k, l: SOURCE[k] })) },
            { key: 'owner', label: '负责人', value: c.owner }
          ],
          onSave(v) {
            if (!v.name) { UI.toast('请填写联系人姓名', 'warn'); return; }
            Store.pushItem('crm.customers', {
              id: 'c' + Date.now(), name: v.name, phone: v.phone || '—', company: c.name, companyId: c.id,
              dept: v.dept || '—', position: v.position || '员工', source: v.source || 'offline',
              firstAt: '2026-11-09', lastAt: '2026-11-09', tags: ['企业联系人'], owner: v.owner || c.owner,
              note: '从企业上下游新增，归属 ' + c.short + '。', channels: [v.source || 'offline'], lifecycle: 'new', value: 'normal'
            }, '新增企业联系人');
            UI.toast('联系人已加入客户 360'); App.refresh();
          } });
      },
      newCompany() {
        UI.formDrawer({ title: '新增业务公司（甲方）', sub: '先建企业与合同，后续服务、客户与应收都挂到这里', icon: 'building',
          fields: [
            { key: 'name', label: '企业全称' }, { key: 'short', label: '企业简称' },
            { key: 'industry', label: '行业' }, { key: 'employees', label: '员工人数', type: 'num', value: 200 },
            { key: 'city', label: '城市', ph: '北京 · 海淀' },
            { key: 'contact', label: '主要联系人' }, { key: 'phone', label: '联系电话' },
            { key: 'owner', label: '客户负责人', type: 'select', options: ['王雪', '张伟', '周琳', '赵医生', '客户成功部'] },
            { key: 'level', label: '客户等级', type: 'select', options: ['A', 'B', 'C'] },
            { key: 'contractName', label: '合同名称', value: '2027 员工健康福利' },
            { key: 'amount', label: '合同金额', type: 'num', value: 300000 },
            { key: 'start', label: '合同开始', value: '2026-11-09' }, { key: 'end', label: '合同结束', value: '2027-11-08' }
          ],
          onSave(v) {
            const id = 'bc' + Date.now();
            Store.pushItem('upstream.companies', {
              id: id, name: v.name || '新业务公司', short: v.short || v.name || '新公司', industry: v.industry || '其他',
              employees: Number(v.employees) || 0, city: v.city || '—', contact: v.contact || '—', phone: v.phone || '—',
              owner: v.owner || '客户成功部', source: 'offline', level: v.level || 'B', status: 'active', tags: [], settlePartner: v.name,
              note: '新建业务公司，等待补充合同与服务范围。',
              contract: { no: 'HT-' + new Date().getFullYear() + '-NEW', name: v.contractName || '员工健康福利', start: v.start || '2026-11-09', end: v.end || '2027-11-08', amount: Number(v.amount) || 0, used: 0, people: Number(v.employees) || 0, settlement: '月结 30 天', renewal: v.end || '2027-10-09', services: [] }
            }, '新增业务公司');
            P['up-companies'].state.selected = id;
            UI.toast('业务公司已创建'); App.refresh();
          } });
      },
      editCompany() {
        const c = companyById(P['up-companies'].state.selected), ct = c.contract || {};
        UI.formDrawer({ title: '编辑业务公司', sub: c.name, icon: 'edit',
          fields: [
            { key: 'name', label: '企业全称', value: c.name }, { key: 'short', label: '企业简称', value: c.short },
            { key: 'industry', label: '行业', value: c.industry }, { key: 'employees', label: '员工人数', type: 'num', value: c.employees },
            { key: 'city', label: '城市', value: c.city }, { key: 'contact', label: '主要联系人', value: c.contact },
            { key: 'phone', label: '联系电话', value: c.phone },
            { key: 'owner', label: '客户负责人', type: 'select', value: c.owner, options: ['王雪', '张伟', '周琳', '赵医生', '客户成功部'] },
            { key: 'level', label: '客户等级', type: 'select', value: c.level, options: ['A', 'B', 'C'] },
            { key: 'status', label: '合作状态', type: 'select', value: c.status, options: [{ v: 'active', l: '合作中' }, { v: 'renewing', l: '待续约' }, { v: 'risk', l: '风险' }] },
            { key: 'settlement', label: '结算方式', value: ct.settlement }
          ],
          onSave(v) {
            Store.saveItem('upstream.companies', Object.assign({}, c, {
              name: v.name || c.name, short: v.short || c.short, industry: v.industry || c.industry,
              employees: Number(v.employees) || 0, city: v.city, contact: v.contact, phone: v.phone,
              owner: v.owner, level: v.level, status: v.status,
              contract: Object.assign({}, ct, { settlement: v.settlement || ct.settlement })
            }), 'id', '编辑业务公司');
            UI.toast('业务公司已更新'); App.refresh();
          } });
      },
      renewCompany() {
        const c = companyById(P['up-companies'].state.selected), ct = c.contract || {};
        UI.formDrawer({ title: '续约 / 调整合同', sub: c.short + ' · ' + (ct.no || ''), icon: 'file',
          fields: [
            { key: 'amount', label: '合同金额', type: 'num', value: ct.amount },
            { key: 'end', label: '新到期日', value: ct.end },
            { key: 'renewal', label: '下次续约启动', value: ct.renewal },
            { key: 'settlement', label: '结算方式', value: ct.settlement },
            { key: 'status', label: '合作状态', type: 'select', value: c.status, options: [{ v: 'active', l: '合作中' }, { v: 'renewing', l: '待续约' }, { v: 'risk', l: '风险' }] }
          ],
          onSave(v) {
            Store.saveItem('upstream.companies', Object.assign({}, c, {
              status: v.status, contract: Object.assign({}, ct, { amount: Number(v.amount) || 0, end: v.end, renewal: v.renewal, settlement: v.settlement })
            }), 'id', '续约业务公司');
            UI.toast('合同已更新，进入待发布'); App.refresh();
          } });
      },
      goServiceFlow() { App.go('h-service-flow'); },
      goProviders() { App.go('up-providers'); },
      goSettle() { App.go('trd-settle'); }
    }
  };

  /* ================================================================ 乙方服务商 */
  P['up-providers'] = {
    app: 'all', grp: 'v.ops', papp: 'employee', title: '服务商（乙方）', sub: '服务商提供医疗服务或实物商品，履约、质量与应付都在这里闭环',
    state: { selected: 'sp1', filter: 'all' },
    render(ctx) {
      ensure();
      const st = P['up-providers'].state;
      if (ctx && ctx.id && providerById(ctx.id).id) st.selected = ctx.id;
      const all = R();
      const kinds = ['all'].concat([...new Set(all.map((p) => p.type))]);
      const list = all.filter((p) => st.filter === 'all' || p.type === st.filter);
      let p = providerById(st.selected);
      if (list.length && !list.some((x) => x.id === p.id)) { p = list[0]; st.selected = p.id; }
      const services = servicesOfProvider(p), goods = goodsOfProvider(p), pays = payablesOf(p);
      const clients = C().filter((c) => (p.clients || []).indexOf(c.id) >= 0);
      const payableAmount = pays.reduce((n, x) => n + (x.amount || 0), 0);
      const pendingAmount = PAY().filter((x) => x.status !== 'paid').reduce((n, x) => n + (x.amount || 0), 0);
      const allSvc = ((Store.db.employee && Store.db.employee.services) || []).length;
      const allGoods = (Store.db.supplements || []).length;
      return K.head('上下游 · 服务商', all.length + ' 家合作服务商 · ' + allSvc + ' 项服务 · ' + allGoods + ' 个实物商品 · 待付 ' + money(pendingAmount),
        K.btn('新增服务商', 'newProvider', { icon: 'plus', cls: 'primary' }), 'UPSTREAM / SUPPLY SIDE') +
        K.kpis([
          { k: '合作服务商', v: all.length, unit: '家', d: all.filter((x) => x.status === 'active').length + ' 家合作中', icon: 'building' },
          { k: '覆盖服务', v: ((Store.db.employee && Store.db.employee.services) || []).length, unit: '项', d: '每项服务都有履约方', icon: 'stethoscope' },
          { k: '实物供应', v: (Store.db.supplements || []).length, unit: '个', d: '商品与库存已关联', icon: 'package' },
          { k: '本期应付', v: money(pendingAmount), d: PAY().filter((x) => x.status === 'overdue').length + ' 笔逾期', tone: 'down', icon: 'file' },
          { k: '平均评分', v: (all.reduce((n, x) => n + (x.rating || 0), 0) / (all.length || 1)).toFixed(1), unit: '分', d: '来自履约评价', icon: 'star' }
        ]) +
        '<div class="up-layout"><div class="up-list"><div class="up-list-head">' +
          '<div class="up-filter-scroll"><button class="fv-mini ' + (st.filter === 'all' ? 'on' : '') + '" data-act="filterProviders" data-id="all">全部</button>' +
          kinds.slice(1).map((k) => '<button class="fv-mini ' + (st.filter === k ? 'on' : '') + '" data-act="filterProviders" data-id="' + E(k) + '">' + E(k) + '</button>').join('') + '</div>' +
          '<span>' + list.length + ' 家</span></div>' +
          list.map((x) => providerItem(x, p.id)).join('') +
          (!list.length ? K.empty('没有匹配服务商', '切换类型后再看') : '') +
        '</div><div class="up-main">' +
          '<div class="up-hero alt"><div><span class="up-tag">' + E(p.type) + ' · ' + E(p.level) + ' 级 · ' + ((PR_ST[p.status] || PR_ST.active)[0]) + '</span>' +
            '<h2>' + E(p.name) + '</h2><p>' + E(p.city) + ' · ' + E(p.qualification) + ' · 对接人 ' + E(p.contact) + ' ' + E(p.phone) + '</p>' +
            '<div class="up-chips"><span>合同至 ' + E((p.contract || {}).end || '—') + '</span><span>' + E(p.settlement) + '</span><span>' + services.length + ' 项服务</span><span>' + goods.length + ' 个商品</span></div></div>' +
            '<div class="up-score"><b>' + p.rating.toFixed(1) + '</b><span>履约评分</span><em>准时率 ' + p.onTime + '%</em></div></div>' +
          '<div class="up-kv"><div><span>关联服务</span><b>' + services.length + '</b><em>可直接编辑</em></div>' +
            '<div><span>实物商品</span><b>' + goods.length + '</b><em>供货与库存</em></div>' +
            '<div><span>本期应付</span><b>' + money(payableAmount) + '</b><em>' + pays.filter((x) => x.status !== 'paid').length + ' 笔待付</em></div>' +
            '<div><span>服务企业</span><b>' + clients.length + '</b><em>甲方覆盖</em></div></div>' +
          '<div class="grid g-2" style="margin-top:14px">' +
            K.panel({ title: '资质与合同', sub: E((p.contract || {}).no || '未签合同'), actions: K.btn('编辑服务商', 'editProvider', { icon: 'edit', cls: 'ghost sm' }),
              body: '<div class="up-contract">' + infoRow('资质', E(p.qualification)) + infoRow('许可证', E(p.license)) +
                infoRow('合同名称', E((p.contract || {}).name || '—')) + infoRow('合同金额', money((p.contract || {}).amount)) +
                infoRow('结算', E(p.settlement)) + infoRow('开户行', E((p.contract || {}).bank || '—')) + '</div>' +
                '<div class="up-note">服务商资质与合同是服务上架、商品供货和应付结算的前置条件。</div>' }) +
            K.panel({ title: '服务能力', sub: services.length + ' 项已挂服务', actions: K.btn('新增服务', 'addProviderService', { icon: 'plus', cls: 'ghost sm' }),
              body: (services.length ? services.slice(0, 5).map((s) =>
                '<button class="up-linkrow" data-act="editProviderService" data-id="' + s.id + '">' + UI.avatar(s.name) +
                '<div><b>' + E(s.name) + '</b><span>' + E(s.cat || s.mod) + ' · ' + E(s.scope || '') + '</span></div><em>' + (s.bookable ? '可预约' : '仅咨询') + '</em>' + I('chevron', 13) + '</button>').join('')
                : K.empty('还没有挂服务', '新增服务后自动关联本服务商')) }) +
          '</div>' +
          '<div class="grid g-2" style="margin-top:14px">' +
            K.panel({ title: '实物供应', sub: goods.length + ' 个商品', actions: K.btn('新增商品', 'addProviderGoods', { icon: 'plus', cls: 'ghost sm' }),
              body: (goods.length ? goods.slice(0, 5).map((g) =>
                '<button class="up-linkrow" data-act="editProviderGood" data-id="' + g.id + '">' +
                '<div style="width:38px;height:38px;border-radius:9px;overflow:hidden;background:#eef3f9;flex:none"><img src="' + E((g.images || [])[0] || '') + '" style="width:100%;height:100%;object-fit:cover" alt=""></div>' +
                '<div><b>' + E(g.name) + '</b><span>' + E(g.cat) + ' · 库存 ' + nf(g.stock) + '</span></div><em>' + money(g.price) + '</em>' + I('chevron', 13) + '</button>').join('')
                : K.empty('还没有供货商品', '新增商品时选择本服务商')) }) +
            K.panel({ title: '应付结算', sub: pays.length + ' 张结算单', actions: K.btn('应付中心', 'goPayable', { icon: 'chart', cls: 'ghost sm' }),
              body: (pays.length ? pays.map((x) =>
                '<button class="up-linkrow" data-act="viewPayable" data-id="' + x.id + '"><div><b>' + E(x.period) + ' · ' + x.orders + ' 单</b><span>应付 ' + money(x.amount) + ' · 到期 ' + E(x.due) + '</span></div>' + stPill(PAY_ST, x.status) + I('chevron', 13) + '</button>').join('')
                : '<div class="up-note">本期无应付；履约完成后自动生成结算单。</div>') +
                '<div class="up-total"><span>本期应付合计</span><b>' + money(payableAmount) + '</b></div>' }) +
          '</div>' +
          '<div class="grid g-2" style="margin-top:14px">' +
            K.panel({ title: '服务企业与履约质量', sub: clients.length + ' 家甲方', body:
              (clients.length ? clients.slice(0, 4).map(clientRow).join('') : K.empty('还没有服务企业', '在合同中关联本服务商')) +
              '<div class="up-quality"><div><b>' + p.onTime + '%</b><span>准时率</span></div><div><b>' + p.capacity + '</b><span>日产能</span></div><div><b>' + p.rating + '</b><span>评分</span></div><div><b>' + services.length + '</b><span>在架服务</span></div></div>' }) +
            K.panel({ title: '协同与风险', body:
              '<div class="note teal">' + E(p.note || '') + '</div>' +
              '<div class="up-actions"><button class="btn primary" data-act="addProviderService">' + I('plus', 14) + '挂服务</button>' +
              '<button class="btn" data-act="addProviderGoods">' + I('package', 14) + '挂商品</button>' +
              '<button class="btn ghost" data-act="editProvider">' + I('edit', 14) + '编辑主体</button></div>' }) +
          '</div>' +
        '</div></div>';
    },
    actions: {
      selectProvider(d) { P['up-providers'].state.selected = d.id; App.refresh(true); },
      filterProviders(d) { P['up-providers'].state.filter = d.id; App.refresh(); },
      openProvider(d) { App.go('up-providers', { id: d.id }); },
      openCompany(d) { App.go('up-companies', { id: d.id }); },
      newProvider() {
        UI.formDrawer({ title: '新增服务商（乙方）', sub: '先建主体与合同，再挂服务或实物商品', icon: 'building',
          fields: [
            { key: 'name', label: '服务商全称' }, { key: 'short', label: '简称' },
            { key: 'type', label: '类型', type: 'select', options: ['体检机构', '康复机构', '线上医疗', '第三方检验', '药品配送', '实物供应商', '心理服务', '培训机构'] },
            { key: 'city', label: '城市 / 覆盖' }, { key: 'qualification', label: '资质' },
            { key: 'contact', label: '对接人' }, { key: 'phone', label: '电话' },
            { key: 'settlement', label: '结算方式', value: '月结 30 天' },
            { key: 'rating', label: '初始评分', type: 'num', value: 4.5 },
            { key: 'onTime', label: '准时率 %', type: 'num', value: 95 }
          ],
          onSave(v) {
            const id = 'sp' + Date.now();
            Store.pushItem('upstream.providers', {
              id: id, name: v.name || '新服务商', short: v.short || v.name || '新服务商', type: v.type || '体检机构',
              aliases: [v.name || '新服务商'], city: v.city || '—', qualification: v.qualification || '待补充', license: '待补充',
              contact: v.contact || '—', phone: v.phone || '—', owner: '供应商管理', status: 'active', level: 'B',
              rating: Number(v.rating) || 4.5, onTime: Number(v.onTime) || 95, capacity: 0, settlement: v.settlement || '月结 30 天',
              clients: [], cats: [], note: '新建服务商，等待补充资质、服务与合同。',
              contract: { no: 'PS-NEW', name: '待签合同', start: '2026-11-09', end: '2027-11-08', amount: 0, bank: '—', taxNo: '—' }
            }, '新增服务商');
            P['up-providers'].state.selected = id;
            UI.toast('服务商已创建'); App.refresh();
          } });
      },
      editProvider() {
        const p = providerById(P['up-providers'].state.selected), ct = p.contract || {};
        UI.formDrawer({ title: '编辑服务商', sub: p.name, icon: 'edit',
          fields: [
            { key: 'name', label: '服务商全称', value: p.name }, { key: 'short', label: '简称', value: p.short },
            { key: 'type', label: '类型', value: p.type },
            { key: 'city', label: '城市 / 覆盖', value: p.city }, { key: 'qualification', label: '资质', value: p.qualification },
            { key: 'contact', label: '对接人', value: p.contact }, { key: 'phone', label: '电话', value: p.phone },
            { key: 'status', label: '合作状态', type: 'select', value: p.status, options: [{ v: 'active', l: '合作中' }, { v: 'paused', l: '已暂停' }, { v: 'risk', l: '需观察' }] },
            { key: 'rating', label: '评分', type: 'num', value: p.rating },
            { key: 'onTime', label: '准时率 %', type: 'num', value: p.onTime },
            { key: 'settlement', label: '结算方式', value: p.settlement },
            { key: 'contractName', label: '合同名称', value: ct.name },
            { key: 'amount', label: '合同金额', type: 'num', value: ct.amount }
          ],
          onSave(v) {
            Store.saveItem('upstream.providers', Object.assign({}, p, {
              name: v.name || p.name, short: v.short || p.short, type: v.type, city: v.city,
              qualification: v.qualification, contact: v.contact, phone: v.phone, status: v.status,
              rating: Number(v.rating) || p.rating, onTime: Number(v.onTime) || p.onTime, settlement: v.settlement,
              contract: Object.assign({}, ct, { name: v.contractName || ct.name, amount: Number(v.amount) || 0 })
            }), 'id', '编辑服务商');
            UI.toast('服务商已更新'); App.refresh();
          } });
      },
      addProviderService() {
        const p = providerById(P['up-providers'].state.selected);
        if (P['e-services']) P['e-services'].state.pendingProvider = p.id;
        if (P['e-services'] && P['e-services'].actions.newSvc) P['e-services'].actions.newSvc({ providerId: p.id });
        else { UI.toast('正在打开服务目录'); App.go('e-services'); }
      },
      addProviderGoods() {
        const p = providerById(P['up-providers'].state.selected);
        if (P['svc-goods']) P['svc-goods'].state.pendingProvider = p.id;
        if (P['svc-goods'] && P['svc-goods'].actions.newGoods) P['svc-goods'].actions.newGoods({ providerId: p.id });
        else App.go('svc-goods');
      },
      editProviderService(d) { if (P['e-services'] && P['e-services'].actions.editSvc) P['e-services'].actions.editSvc(d); },
      editProviderGood(d) { if (P['svc-goods'] && P['svc-goods'].actions.gdEdit) P['svc-goods'].actions.gdEdit(d); },
      viewPayable(d) {
        const x = PAY().find((v) => v.id === d.id);
        if (x) App.go('up-providers', { id: x.providerId });
      },
      goPayable() { App.go('trd-payable'); }
    }
  };

  /* ================================================================ 服务商应付 */
  P['trd-payable'] = {
    app: 'all', grp: 'v.ops', papp: 'employee', title: '服务商应付', sub: '甲方应收之外的另一半：按履约与供货给乙方结算',
    state: { filter: 'all' },
    render() {
      ensure();
      const st = P['trd-payable'].state;
      const all = PAY();
      const list = all.filter((x) => st.filter === 'all' || (st.filter === 'open' ? x.status !== 'paid' : x.status === st.filter));
      const total = all.reduce((n, x) => n + x.amount, 0);
      const open = all.filter((x) => x.status !== 'paid');
      const overdue = all.filter((x) => x.status === 'overdue');
      const paid = all.filter((x) => x.status === 'paid');
      return K.head('服务商应付', all.length + ' 张结算单 · 待付 ' + money(open.reduce((n, x) => n + x.amount, 0)) + ' · 已付 ' + money(paid.reduce((n, x) => n + x.amount, 0)),
        K.btn('导出应付表', 'exportPay', { icon: 'download' }), 'SETTLEMENT / PAYABLE') +
        K.kpis([
          { k: '本期应付', v: money(total), d: all.length + ' 张结算单', icon: 'file' },
          { k: '待付', v: money(open.reduce((n, x) => n + x.amount, 0)), d: open.length + ' 笔未完成', tone: 'down', icon: 'clock' },
          { k: '逾期', v: overdue.length, unit: '笔', d: money(overdue.reduce((n, x) => n + x.amount, 0)), tone: 'down', icon: 'bell' },
          { k: '已打款', v: money(paid.reduce((n, x) => n + x.amount, 0)), d: paid.length + ' 笔已完成', tone: 'up', icon: 'check' }
        ]) +
        K.toolbar(K.seg([{ id: 'all', label: '全部' }, { id: 'open', label: '待付' }, { id: 'pending', label: '待结算' }, { id: 'approved', label: '已审核' }, { id: 'overdue', label: '已逾期' }, { id: 'paid', label: '已打款' }], st.filter, 'payFilter'),
          '<span class="small mut">应付按履约完成与商品签收生成，服务商与合同可追溯到上游</span>') +
        K.panel({ flush: true, body: UI.table([
          { label: '服务商', render: (x) => '<div class="cellflex"><span class="up-ava sm">' + E((providerById(x.providerId).short || x.provider).slice(0, 1)) + '</span><div><div class="strong">' + E(providerById(x.providerId).short || x.provider) + '</div><div class="small muted">' + E((providerById(x.providerId).contract || {}).no || '') + '</div></div></div>' },
          { label: '账期', render: (x) => '<span class="tnum small strong">' + E(x.period) + '</span>' },
          { label: '履约单', align: 'right', render: (x) => '<span class="tnum">' + x.orders + '</span>' },
          { label: '应付', align: 'right', render: (x) => '<b class="tnum">' + money(x.amount) + '</b>' },
          { label: '到期', render: (x) => '<span class="small tnum">' + E(x.due) + '</span>' },
          { label: '状态', render: (x) => stPill(PAY_ST, x.status) },
          { label: '', align: 'right', render: (x) => '<div class="rowact"><button data-act="viewPayable" data-id="' + x.id + '" title="查看服务商">' + I('eye', 14) + '</button>' +
            (x.status !== 'paid' ? '<button data-act="payPayable" data-id="' + x.id + '" title="确认打款">' + I('check', 14) + '</button>' : '') + '</div>' }
        ], list.map((x) => Object.assign({ _id: x.id }, x))) }) +
        '<div class="note" style="margin-top:12px">应付结算与甲方应收分开：甲方按合同付款给我们，我们按履约与服务商结算。服务商资质、合同与结算单必须三处一致。</div>';
    },
    actions: {
      payFilter(d) { P['trd-payable'].state.filter = d.id; App.refresh(); },
      viewPayable(d) {
        const x = PAY().find((v) => v.id === d.id);
        if (x) App.go('up-providers', { id: x.providerId });
      },
      payPayable(d) {
        const x = PAY().find((v) => v.id === d.id);
        if (!x || x.status === 'paid') return;
        UI.confirm({ title: '确认给服务商打款？', desc: x.provider + ' · ' + x.period + ' · ' + money(x.amount) + ' · 到期 ' + x.due, okText: '确认打款' })
          .then((ok) => {
            if (!ok) return;
            Store.saveItem('upstream.payables', { id: x.id, status: 'paid' }, 'id', '服务商应付打款');
            UI.toast('已标记为已打款'); App.refresh();
          });
      },
      exportPay() { UI.toast('服务商应付表已导出'); }
    }
  };
})();

/* ============================================================================
   合同台账（g-contracts）：甲方应收合同 × 乙方履约合同统一台账
   到期提醒 / 状态推进 / 编辑写回 / 跳转对方详情 —— 作为客户管理平台的合同主线
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const nf = (n) => Number(n || 0).toLocaleString('zh-CN');
  const money = (n) => '¥' + nf(Math.round(Number(n) || 0));
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const daysTo = (d) => { if (!d) return null; const t = new Date(String(d).slice(0, 10) + 'T00:00:00') - new Date(today() + 'T00:00:00'); return Math.round(t / 86400000); };

  const CT = () => { if (!Store.db.contracts) Store.db.contracts = []; return Store.db.contracts; };
  // 0=在执行 1=即将到期(≤90天) 2=已到期
  const ctStatus = (c) => { const d = daysTo(c.end); return d == null ? 0 : d < 0 ? 2 : d <= 90 ? 1 : 0; };
  const CT_ST = { 0: ['在执行', 'green'], 1: ['即将到期', 'amber'], 2: ['已到期', 'red'] };

  // 从甲方企业 + 乙方服务商同步合同台账（每次渲染前同步一次，编辑在合同台账与详情页双向可见）
  function ensureContracts() {
    const list = CT();
    const side = (arr, kind) => (arr || []).forEach((o) => {
      const ct = o.contract || {};
      const key = ct.no || (kind + '-' + o.id);
      let row = list.find((x) => x.no === key && x.kind === kind);
      if (!row) {
        row = { id: kind + '-' + (ct.no || o.id), no: key, kind, partyId: o.id, party: o.name || '', short: o.short || '', createdAt: today() };
        list.push(row);
      }
      ['name', 'start', 'end', 'amount', 'settlement', 'renewal', 'bank', 'taxNo'].forEach((k) => { if (ct[k] != null) row[k] = ct[k]; });
      row.party = o.name || row.party; row.short = o.short || row.short; row.partyId = o.id;
    });
    side(Store.db.upstream.companies, 'client');
    side(Store.db.upstream.providers, 'provider');
    // 同步编辑回源（在台账里改的合同，写回企业/服务商对象）
    list.forEach((row) => {
      const src = (row.kind === 'client' ? Store.db.upstream.companies : Store.db.upstream.providers).find((o) => o.id === row.partyId);
      if (src && src.contract && src.contract.no === row.no) {
        ['name', 'start', 'end', 'amount', 'settlement', 'renewal', 'bank', 'taxNo'].forEach((k) => { if (row[k] != null) src.contract[k] = row[k]; });
      }
    });
  }

  const partyOf = (row) => row.kind === 'client'
    ? (Store.db.upstream.companies.find((c) => c.id === row.partyId) || {})
    : (Store.db.upstream.providers.find((p) => p.id === row.partyId) || {});

  P['g-contracts'] = {
    app: 'all', grp: 'v.ops', papp: 'employee',
    title: '合同台账', sub: '甲方签约合同与乙方履约合同统一台账：到期提醒、续约、结算方式与金额一目了然',
    state: { filter: 'all', kind: 'all' },
    render() {
      ensureContracts();
      const st = P['g-contracts'].state;
      let all = CT().slice();
      if (st.kind !== 'all') all = all.filter((x) => x.kind === st.kind);
      if (st.filter === 'expiring') all = all.filter((x) => ctStatus(x) === 1);
      else if (st.filter === 'expired') all = all.filter((x) => ctStatus(x) === 2);
      const total = CT().reduce((n, x) => n + (Number(x.amount) || 0), 0);
      const expiring = CT().filter((x) => ctStatus(x) === 1);
      const expired = CT().filter((x) => ctStatus(x) === 2);
      const head = K.head('合同台账', CT().length + ' 份合同 · 年度总金额 ' + money(total) + ' · 到期 90 天内 ' + expiring.length + ' 份需要关注',
        K.btn('新增合同', 'newContract', { icon: 'plus', cls: 'primary' }), 'CONTRACTS / LEDGER');
      const kpis = K.kpis([
        { k: '合同总数', v: CT().length, unit: '份', d: '甲方 ' + CT().filter((x) => x.kind === 'client').length + ' · 乙方 ' + CT().filter((x) => x.kind === 'provider').length, icon: 'file' },
        { k: '年度总金额', v: (total / 10000).toFixed(0), unit: '万', d: '全部在册合同', icon: 'coins' },
        { k: '90 天内到期', v: expiring.length, unit: '份', d: '建议启动续约', tone: expiring.length ? 'down' : 'up', icon: 'clock' },
        { k: '已到期', v: expired.length, unit: '份', d: expired.length ? '需立即处理' : '无', tone: expired.length ? 'down' : 'up', icon: 'bell' }
      ]);
      const table = K.panel({ flush: true, body: UI.table([
        { label: '合同编号', render: (x) => '<span class="tnum small strong">' + E(x.no) + '</span>' },
        { label: '对方', render: (x) => '<div class="cellflex"><span class="up-ava sm">' + E((x.short || x.party || '?').slice(0, 1)) + '</span><div><div class="strong">' + E(x.short || x.party) + '</div><div class="small muted">' + E(x.kind === 'client' ? '甲方 · 业务公司' : '乙方 · 服务商') + '</div></div></div>' },
        { label: '合同名称', render: (x) => '<span class="small">' + E(x.name || '—') + '</span>' },
        { label: '金额', align: 'right', render: (x) => '<b class="tnum">' + money(x.amount) + '</b>' },
        { label: '有效期', render: (x) => '<span class="small tnum">' + E(x.start || '—') + ' → ' + E(x.end || '—') + '</span>' },
        { label: '结算方式', render: (x) => '<span class="small">' + E(x.settlement || '—') + '</span>' },
        { label: '状态', render: (x) => {
            const s = ctStatus(x), d = daysTo(x.end);
            return UI.pill(CT_ST[s][0], CT_ST[s][1]) + (s === 1 ? '<span class="small mut" style="margin-left:5px">剩 ' + d + ' 天</span>' : '');
          } },
        { label: '', align: 'right', render: (x) => '<div class="rowact">' +
            '<button data-act="viewContract" data-id="' + x.id + '" title="详情">' + I('eye', 14) + '</button>' +
            '<button data-act="editContract" data-id="' + x.id + '" title="编辑">' + I('edit', 14) + '</button>' +
            (x.kind === 'client' ? '<button data-act="toCompany" data-id="' + x.partyId + '" title="查看企业">' + I('building', 14) + '</button>'
              : '<button data-act="toProvider" data-id="' + x.partyId + '" title="查看服务商">' + I('link', 14) + '</button>') + '</div>' }
      ], all.map((x) => Object.assign({ _id: x.id }, x))) });
      return head + kpis +
        K.toolbar(
          K.seg([{ id: 'all', label: '全部' }, { id: 'client', label: '甲方合同' }, { id: 'provider', label: '乙方合同' }], st.kind, 'kindFilter') +
          K.seg([{ id: 'all', label: '全部状态' }, { id: 'expiring', label: '90 天内到期' }, { id: 'expired', label: '已到期' }], st.filter, 'statusFilter'),
          '<span class="small mut">合同在台账与企业/服务商详情双向同步；结算方式与金额是结算对账的口径来源</span>') +
        table +
        '<div class="note" style="margin-top:12px">合同台账是应收应付的上游：甲方合同驱动「结算与对账」的应收口径（金额/结算周期），乙方合同驱动「服务商应付」。到期前 90 天自动进入续约提醒。</div>';
    },
    actions: {
      kindFilter(d) { P['g-contracts'].state.kind = d.id; App.refresh(); },
      statusFilter(d) { P['g-contracts'].state.filter = d.id; App.refresh(); },
      toCompany(d) { App.go('up-companies', { id: d.id }); },
      toProvider(d) { App.go('up-providers', { id: d.id }); },
      viewContract(d) {
        const x = CT().find((v) => v.id === d.id); if (!x) return;
        const src = partyOf(x);
        UI.modal({ title: '合同 · ' + x.no, desc: (x.kind === 'client' ? '甲方' : '乙方') + ' · ' + (x.short || x.party),
          body: '<dl class="kv">' +
            '<dt>合同名称</dt><dd>' + E(x.name || '—') + '</dd><dt>金额</dt><dd class="tnum">' + money(x.amount) + '</dd>' +
            '<dt>有效期</dt><dd>' + E(x.start || '—') + ' → ' + E(x.end || '—') + '</dd><dt>结算方式</dt><dd>' + E(x.settlement || '—') + '</dd>' +
            (x.bank ? '<dt>开户行</dt><dd>' + E(x.bank) + '</dd>' : '') + (x.taxNo ? '<dt>税号</dt><dd>' + E(x.taxNo) + '</dd>' : '') +
            (src.contact ? '<dt>对方联系人</dt><dd>' + E(src.contact) + ' ' + E(src.phone || '') + '</dd>' : '') +
            '</dl>' + '<div class="note" style="margin-top:12px">' + (x.kind === 'client'
              ? '该合同的结算方式驱动对账单生成周期；已确认应收见「结算与对账」。'
              : '该合同约定按履约与服务商结算；应付明细见「服务商应付」。') + '</div>',
          okText: '关闭', cancelText: false });
      },
      editContract(d) { openForm(CT().find((v) => v.id === d.id)); },
      newContract() { openForm(null); },
      renewContract(d) {
        const x = CT().find((v) => v.id === d.id); if (!x) return;
        openForm(x, true);
      }
    }
  };

  function openForm(row, renew) {
    const isNew = !row;
    row = row || {};
    const isClient = row.kind !== 'provider';
    const comOpts = (Store.db.upstream.companies || []).map((c) => ({ v: c.id, l: c.name }));
    const proOpts = (Store.db.upstream.providers || []).map((p) => ({ v: p.id, l: p.name }));
    UI.formDrawer({
      title: isNew ? '新增合同' : renew ? '续约 · ' + (row.no || '') : '编辑合同 · ' + (row.no || ''),
      sub: '甲方合同挂业务公司，乙方合同挂服务商；保存后同步到对方详情页',
      fields: [
        { key: 'kind', label: '合同类型', type: 'select', value: isClient ? 'client' : 'provider', options: [{ v: 'client', l: '甲方 · 业务公司' }, { v: 'provider', l: '乙方 · 服务商' }] },
        { key: 'partyId', label: '对方', type: 'select', value: row.partyId || (Store.db.upstream.companies[0] || {}).id, options: comOpts },
        { key: 'providerId', label: '服务商（乙方合同时选）', type: 'select', value: row.partyId || (Store.db.upstream.providers[0] || {}).id, options: proOpts },
        { key: 'no', label: '合同编号', value: row.no || (isNew ? 'HT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100) : row.no), ph: '如 HT-2026-056' },
        { key: 'name', label: '合同名称', value: row.name || '', ph: '如 2026 员工健康福利' },
        { key: 'amount', label: '合同金额（元）', type: 'num', value: row.amount || 0 },
        { key: 'start', label: '生效日期', value: row.start || today(), ph: 'YYYY-MM-DD' },
        { key: 'end', label: '到期日期', value: row.end || '', ph: 'YYYY-MM-DD' },
        { key: 'settlement', label: '结算方式', value: row.settlement || '月结 30 天', ph: '如 月结 30 天 / 季结 45 天' },
        { key: 'renewal', label: '续约启动日', value: row.renewal || '', ph: 'YYYY-MM-DD' }
      ],
      hint: '保存后：① 进入合同台账；② 同步到企业/服务商详情；③ 甲方合同的结算方式作为对账单周期口径。',
      okText: isNew ? '创建合同' : '保存',
      onOk(v) {
        if (!v.no || !v.name) { UI.toast('合同编号与名称必填', 'warn'); return false; }
        const kind = v.kind;
        const partyId = kind === 'client' ? v.partyId : v.providerId;
        const list = CT();
        let target = list.find((x) => x.id === (row.id || ''));
        if (!target) {
          target = { id: kind + '-' + v.no + '-' + String(Date.now()).slice(-4), kind, partyId, createdAt: today() };
          list.unshift(target);
        }
        Object.assign(target, { no: v.no, name: v.name, amount: Number(v.amount) || 0, start: v.start, end: v.end, settlement: v.settlement, renewal: v.renewal, kind, partyId });
        // 写回源对象
        const srcList = kind === 'client' ? Store.db.upstream.companies : Store.db.upstream.providers;
        const src = srcList.find((o) => o.id === partyId);
        if (src) {
          src.contract = src.contract || {};
          ['no', 'name', 'start', 'end', 'amount', 'settlement', 'renewal'].forEach((k) => { src.contract[k] = target[k]; });
        }
        Store.mark('upstream', renew ? '续约合同 ' + v.no : isNew ? '新增合同 ' + v.no : '编辑合同 ' + v.no);
        Store.persist();
        UI.toast(renew ? '已按新周期续约' : isNew ? '合同已创建' : '合同已保存');
        App.refresh(true);
      }
    });
  }

})();
