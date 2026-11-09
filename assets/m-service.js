/* ============================================================================
   服务经营：商品中心 / 价格政策 / 履约规则 / 素材 / 渠道 / 服务包
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const SV = () => Store.db.employee.services;
  const CH = () => Store.db.channels;
  const chName = (id) => (CH().find((c) => c.id === id) || {}).name || id;

  const money = (n) => '¥' + Number(n).toLocaleString('zh-CN');
  const margin = (p) => Math.round((p.settle - p.cost) / p.settle * 100);

  function stPill(s) {
    return s.status === 'online' ? UI.pill('在售', 'green') : s.status === 'draft' ? UI.pill('草稿', 'amber') : UI.pill('已下架', 'grey');
  }

  /* ------------------------------------------------------ 1 服务商品 */
  P['svc-catalog'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '服务商品', sub: '每一项对外服务都是一个可定价、可投放、可履约的商品',
    preview: 'emp-services',
    state: { cat: '', q: '' },
    render() {
      const list = SV();
      const st = P['svc-catalog'].state;
      let rows = list.filter((s) => (!st.cat || s.cat === st.cat) && (!st.q || (s.name + s.code).indexOf(st.q) >= 0));
      const online = list.filter((s) => s.status === 'online');
      const avgMargin = Math.round(online.reduce((a, b) => a + b.margin, 0) / (online.length || 1));
      const cats = ['健康筛查', '慢病管理', '就医服务', '特色服务', '应急保障'];
      return K.head('服务商品', '共 ' + list.length + ' 个 SPU · 在售 ' + online.length + ' 个 · 平均毛利率 ' + avgMargin + '%',
        K.btn('导出商品表', 'export', { icon: 'download' }) + K.btn('新建服务', 'newSvc', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '在售 SPU', v: online.length, unit: '个', d: '草稿 ' + list.filter((s) => s.status === 'draft').length + ' 个待上架', icon: 'package' },
          { k: '平均毛利率', v: avgMargin, unit: '%', d: '低于 25% 的有 3 个', tone: avgMargin < 30 ? 'down' : 'up', icon: 'chart' },
          { k: '本月服务收入', v: '42.8', unit: '万', d: '较上月 <b>+12%</b>', tone: 'up', icon: 'target' },
          { k: '覆盖渠道', v: CH().filter((c) => c.on).length, unit: '个', d: 'H5 3 · 官网', icon: 'layers' }
        ]) +
        K.toolbar(
          '<div class="row" style="gap:6px;flex-wrap:wrap">' + K.seg([{ id: '', label: '全部 ' + list.length }].concat(cats.map((c) => ({ id: c, label: c }))), st.cat, 'filterCat') + '</div>',
          K.btn('批量改价', 'batchPrice', { icon: 'sliders', cls: 'ghost' })) +
        K.panel({ flush: true, body: UI.table([
          { label: '服务', w: '224px', render: (s) => '<div style="min-width:0"><div class="strong clip" style="max-width:224px">' + E(s.name) + '</div><div class="small muted clip" style="max-width:224px">' + E(s.code) + ' · ' + E(s.cat) + '</div></div>' },
          { label: '售价 / 结算', align: 'right', w: '150px', render: (s) => '<div class="tnum strong">' + money(s.pricing[0].list) + '</div><div class="small muted tnum">结算 ' + money(s.pricing[0].settle) + '</div>' },
          { label: '毛利率', align: 'right', render: (s) => '<span class="pill ' + (s.margin < 20 ? 'red' : s.margin < 30 ? 'amber' : 'green') + '">' + s.margin + '%</span>' },
          { label: '投放渠道', w: '180px', render: (s) => '<span class="nw small">' + s.channels.slice(0, 2).map((c) => '<span class="chip" style="height:19px;font-size:10px;padding:0 6px">' + E(chName(c).replace(' H5', '')) + '</span>').join(' ') + (s.channels.length > 2 ? ' <span class="mut">+' + (s.channels.length - 2) + '</span>' : '') + '</span>' },
          { label: '状态', render: (s) => stPill(s) },
          { label: '更新', w: '64px', render: (s) => '<span class="small tnum muted nw">' + E(s.updatedAt.slice(5, 10)) + '</span>' },
          { label: '', align: 'right', render: (s) => '<div class="rowact"><button data-act="openSvc" data-id="' + s.id + '">' + I('chevron', 14) + '</button></div>' }
        ], rows.map((s) => Object.assign({ _id: s.id }, s))) }) +
        '<div style="height:14px"></div><div class="panel" style="padding:14px 16px"><div class="row">' +
        '<div class="ava a" style="border-radius:10px">' + I('gift', 16) + '</div>' +
        '<div style="flex:1"><b style="font-size:12.5px">实物商品：补剂、耗材与器械</b><div class="small mut" style="margin-top:2px">实物商品与补剂共用一套价格、库存与上下架规则</div></div>' +
        '<button class="btn sm" data-act="goGoods">进入商品库 ›</button></div></div>';
    },
    actions: {
      filterCat(d) { P['svc-catalog'].state.cat = d.id; App.refresh(); },
      openSvc(d) { App.go('svc-detail', { id: d.id }); },
      export() { UI.toast('商品表已导出'); },
      goGoods() { App.go('svc-goods'); },
      batchPrice() { UI.toast('批量改价：请在价格政策页选择商品'); },
      newSvc() { P['e-services'].actions.newSvc(); }
    }
  };

  /* ------------------------------------------------------ 2 商品详情 */
  P['svc-detail'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '商品详情', sub: '价格、规则、素材与渠道都在这里维护',
    preview: 'emp-detail', hideNav: true,
    state: { tab: 'basic' },
    render(ctx) {
      const list = SV();
      const s = list.find((x) => x.id === (ctx && ctx.id)) || list[0];
      const i = list.indexOf(s);
      const st = P['svc-detail'].state;
      const tabs = [{ id: 'basic', label: '基本信息' }, { id: 'price', label: '价格与 SKU' }, { id: 'booking', label: '预约配置' }, { id: 'rules', label: '履约规则' }, { id: 'assets', label: '素材与长图' }, { id: 'channels', label: '投放渠道' }];
      const val = window.Engine ? Engine.validateService(s) : [];
      const errs = val.filter((x) => x[0] === 'error');
      return (errs.length ? '<div class="readonly-bar">' + I('x', 14) + '<b>发布校验未通过</b>：' + errs.map((x) => E(x[1])).join('；') + '</div>' : '') +
        K.head(s.name, s.code + ' · ' + s.cat + ' · ' + chName(s.channels[0] || ''),
        K.btn('返回商品', 'back', { icon: 'undo' }) + K.btn('保存并发布', 'publish', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            '<div class="panel" style="padding:0"><div style="padding:12px 16px 0">' + K.tabs(tabs, st.tab, 'svcTab') + '</div><div style="padding:4px 18px 18px">' + bodyFor(s, i, st.tab) + '</div></div>' +
          '</div>' +
          '<div class="stack">' + summaryCard(s) + impactCard(s) + '</div>' +
        '</div>';
    },
    actions: {
      back() { App.go('svc-catalog'); },
      svcTab(d) { P['svc-detail'].state.tab = d.id; App.refresh(); },
      publish() { App.openPublish('服务商品更新'); },
      addSku() { UI.toast('新增 SKU'); },
      addAsset() { UI.formDrawer({ title: '上传素材', sub: '支持长图与视频，单张 ≤20MB', icon: 'upload',
        fields: [{ key: 'name', label: '素材名称' }, { key: 'type', label: '类型', type: 'select', options: ['详情长图', '主视觉', '流程图', '演示视频'] }],
        onSave(v) { UI.toast('素材「' + v.name + '」已上传（演示）'); } }); },
      addFaq() { UI.toast('新增 FAQ'); },
      addNote() { UI.toast('已增加一条须知，请在输入框中填写'); },
      toggleChannel(d) {
        const parts = String(d.id).split('|');
        const svc = SV().find((x) => x.id === parts[0]);
        const idx = svc.channels.indexOf(parts[1]);
        if (idx >= 0) svc.channels.splice(idx, 1); else svc.channels.push(parts[1]);
        Store.mark('employee.services.' + SV().indexOf(svc) + '.channels', '渠道投放');
        Store.persist(); App.refresh();
      }
    }
  };

  function bodyFor(s, i, tab) {
    if (tab === 'basic') {
      return '<div class="formsec"><h4>商品信息</h4>' +
        '<div class="frow">' + UI.fInput({ label: '服务名称', value: s.name, path: 'employee.services.' + i + '.name' }) +
        UI.fInput({ label: '英文名', value: s.en, path: 'employee.services.' + i + '.en' }) + '</div>' +
        '<div class="frow">' + UI.fSelect({ label: '服务类目', value: s.cat, options: ['健康筛查', '慢病管理', '就医服务', '特色服务', '应急保障'], path: 'employee.services.' + i + '.cat' }) +
        UI.fInput({ label: '责任部门', value: s.owner, path: 'employee.services.' + i + '.owner' }) + '</div>' +
        UI.fArea({ label: '对外介绍', value: s.intro, rows: 4, path: 'employee.services.' + i + '.intro', hint: '展示在商品详情首屏，建议 60–120 字' }) +
        '<div class="frow">' + UI.fInput({ label: '服务时长', value: s.duration, path: 'employee.services.' + i + '.duration' }) +
        UI.fInput({ label: '报告时效', value: s.resp, path: 'employee.services.' + i + '.resp' }) + '</div>' +
        UI.fSelect({ label: '履约范围', value: s.scope, options: ['属地履约', '全国履约'], path: 'employee.services.' + i + '.scope' }) +
        '</div>' +
        '<div class="formsec"><h4>上架状态</h4>' +
        UI.fSelect({ label: '状态', value: s.status, options: [{ v: 'online', l: '在售' }, { v: 'draft', l: '草稿' }, { v: 'offline', l: '已下架' }], path: 'employee.services.' + i + '.status' }) +
        '</div>';
    }
    if (tab === 'price') {
      return '<div class="small mut" style="margin-bottom:10px">一个商品最多三个 SKU。结算价 = 对企业客户的结算口径，售价 = 对外挂牌价，协议价 = 合同约定价。</div>' +
        UI.table([
          { label: 'SKU', render: (p) => '<b>' + E(p.name) + '</b><div class="small muted">' + E(p.unit) + ' · 有效期 ' + p.validity + ' 天</div>' },
          { label: '成本', align: 'right', render: (p) => '<span class="tnum">' + money(p.cost) + '</span>' },
          { label: '结算价', align: 'right', render: (p) => '<span class="tnum strong">' + money(p.settle) + '</span>' },
          { label: '建议售价', align: 'right', render: (p) => '<span class="tnum">' + money(p.list) + '</span>' },
          { label: '协议价', align: 'right', render: (p) => '<span class="tnum">' + money(p.contract) + '</span>' },
          { label: '毛利', align: 'right', render: (p) => '<span class="pill ' + (margin(p) < 20 ? 'red' : margin(p) < 30 ? 'amber' : 'green') + '">' + margin(p) + '%</span>' }
        ], s.pricing.map((p) => Object.assign({ _id: p.id }, p))) +
        '<div class="hairline"></div>' +
        UI.table([
          { label: 'SKU', render: (p) => E(p.name) },
          { label: '成本价', w: '120px', render: (p) => '<input class="input tnum" style="height:30px" value="' + p.cost + '" data-set="employee.services.' + i + '.pricing.' + UI.ix(s.pricing, p) + '.cost" data-kind="num">' },
          { label: '结算价', w: '120px', render: (p) => '<input class="input tnum" style="height:30px" value="' + p.settle + '" data-set="employee.services.' + i + '.pricing.' + UI.ix(s.pricing, p) + '.settle" data-kind="num">' },
          { label: '挂牌价', w: '120px', render: (p) => '<input class="input tnum" style="height:30px" value="' + p.list + '" data-set="employee.services.' + i + '.pricing.' + UI.ix(s.pricing, p) + '.list" data-kind="num">' },
          { label: '税点', w: '70px', render: (p) => '<input class="input tnum" style="height:30px" value="' + p.tax + '" data-set="employee.services.' + i + '.pricing.' + UI.ix(s.pricing, p) + '.tax" data-kind="num">' }
        ], s.pricing.map((p) => Object.assign({ _id: p.id + 'e' }, p))) +
        '<div class="note" style="margin-top:12px">改价会进入待发布队列。已成交订单按快照结算，不受影响。</div>';
    }
    if (tab === 'booking') {
      const b = s.booking || {};
      return '<div class="small mut" style="margin-bottom:12px">号源按资源配置：医师、床位、设备、咨询师，容量不同，规则也不同。</div>' +
        '<div class="formsec"><h4>可预约人群</h4><div class="grid g-3" style="gap:12px">' +
        UI.fNum({ label: '最小年龄', value: b.ageMin, path: 'employee.services.' + i + '.booking.ageMin' }) +
        UI.fNum({ label: '最大年龄', value: b.ageMax, path: 'employee.services.' + i + '.booking.ageMax' }) +
        UI.fSelect({ label: '性别限制', value: b.gender, options: [{ v: 'any', l: '不限' }, { v: 'male', l: '仅男性' }, { v: 'female', l: '仅女性' }], path: 'employee.services.' + i + '.booking.gender' }) + '</div>' +
        '<div class="field"><label>适用人群</label><div class="chips">' + (b.audience || []).map((a) => '<span class="chip on">' + E(a) + '</span>').join('') + '<span class="chip" style="border-style:dashed">+ 增加人群</span></div>' +
        '<div class="hint">不满足人群条件的员工在客户端看不到该服务。</div></div></div>' +
        '<div class="formsec"><h4>号源</h4>' +
        UI.fSelect({ label: '资源类型', value: b.resource, options: ['医师', '医师 + 设备', '内镜设备 + 麻醉', '床位', '睡眠监测床位', '营养师', '心理咨询师', '健康管理师', '培训师 + 场地', '专属管家', '通用'], path: 'employee.services.' + i + '.booking.resource' }) +
        UI.fNum({ label: '每日号源', value: b.slotsPerDay, path: 'employee.services.' + i + '.booking.slotsPerDay' }) +
        '</div>' +
        '<div class="formsec"><h4>前置条件</h4>' +
        UI.fSwitch({ label: '需填写问卷', value: b.preSurvey, path: 'employee.services.' + i + '.booking.preSurvey' }) +
        UI.fSwitch({ label: '需空腹提醒', value: b.needFast, path: 'employee.services.' + i + '.booking.needFast' }) +
        UI.fSwitch({ label: '需出报告', value: b.needReport, path: 'employee.services.' + i + '.booking.needReport' }) +
        UI.fInput({ label: '须知', value: b.note, path: 'employee.services.' + i + '.booking.note' }) +
        '</div>' + UI.impact(['职工端 · 预约表单与可见性', '号源与排班']) +
        '<div class="note" style="margin-top:12px">当前规则：' + b.ageMin + '–' + b.ageMax + ' 岁 · ' + (b.gender === 'any' ? '不限性别' : b.gender === 'female' ? '仅女性' : '仅男性') + ' · 每日 ' + b.slotsPerDay + ' 个号源</div>';
    }
    if (tab === 'rules') {
      const r = s.rules;
      return '<div class="formsec"><h4>预约规则</h4><div class="grid g-3" style="gap:12px">' +
        UI.fNum({ label: '最早可约（天）', value: r.leadDays, path: 'employee.services.' + i + '.rules.leadDays' }) +
        UI.fNum({ label: '最远可约（天）', value: r.maxDays, path: 'employee.services.' + i + '.rules.maxDays' }) +
        UI.fNum({ label: '免费取消（小时）', value: r.cancelHours, path: 'employee.services.' + i + '.rules.cancelHours' }) + '</div></div>' +
        '<div class="formsec"><h4>履约与退改</h4>' +
        UI.fInput({ label: '有效期（天）', value: r.validity, kind: 'num', path: 'employee.services.' + i + '.rules.validity' }) +
        UI.fArea({ label: '爽约规则', value: r.noShow, rows: 2, path: 'employee.services.' + i + '.rules.noShow' }) +
        UI.fArea({ label: '退款规则', value: r.refund, rows: 2, path: 'employee.services.' + i + '.rules.refund' }) +
        '</div>' +
        '<div class="formsec"><h4>服务须知</h4><div class="stack" style="gap:8px">' +
        r.notes.map((n, k) => '<div class="row" style="gap:8px"><span class="mut small tnum">' + (k + 1) + '</span>' +
          '<input class="input" value="' + E(n) + '" data-set="employee.services.' + i + '.rules.notes.' + k + '"></div>').join('') +
        '<button class="btn sm" data-act="addNote" style="justify-self:start">' + I('plus', 13) + '增加一条</button></div></div>';
    }
    if (tab === 'assets') {
      const a = s.assets;
      return '<div class="formsec"><h4>主视觉与长图</h4>' +
        '<div class="grid g-3" style="gap:12px">' +
        (a.gallery || []).map((g) => '<div class="panel" style="padding:0;overflow:hidden">' +
          '<div style="height:104px;background:linear-gradient(135deg,#eaf2ff,#dbe9fb);display:grid;place-items:center;color:#9db8dd;font-size:11px">' + E(g) + '</div>' +
          '<div class="row" style="padding:8px 10px"><span class="small">' + E(g) + '</span><span class="right small mut">替换</span></div></div>').join('') +
        '<button class="panel" data-act="addAsset" style="height:140px;border-style:dashed;display:grid;place-items:center;color:var(--ink-3);font-size:12px">' + I('upload', 20) + '<span style="margin-top:6px">上传长图 / 视频</span></button>' +
        '</div><div class="hint">建议长图宽度 750px，单张不超过 20MB；视频 ≤200MB，自动压缩。</div></div>' +
        '<div class="formsec"><h4>常见问题</h4>' +
        (a.faq || []).map((f, k) => '<div class="panel" style="padding:10px 12px"><div class="small strong">' + E(f.q) + '</div><div class="small mut" style="margin-top:3px">' + E(f.a) + '</div></div>').join('') +
        '<button class="btn sm" data-act="addFaq" style="justify-self:start">' + I('plus', 13) + '新增问答</button></div>';
    }
    const chans = CH();
    return '<div class="small mut" style="margin-bottom:12px">勾选后该服务会出现在对应渠道的商品列表与搜索中。新增 H5 只需要新增渠道，不需要新增后台入口。</div>' +
      chans.map((c, k) => {
        const on = s.channels.indexOf(c.id) >= 0;
        return '<div class="row" style="padding:12px 0;border-bottom:1px solid var(--line-2)">' +
          '<div style="width:34px;height:34px;border-radius:9px;background:#f1f5fa;display:grid;place-items:center;color:#7d8a9e">' + I(c.type === 'h5' ? 'phone' : c.type === 'web' ? 'layout' : 'layers', 15) + '</div>' +
          '<div style="flex:1"><div class="strong" style="font-size:12.5px">' + E(c.name) + '</div><div class="small muted">' + E(c.audience) + ' · ' + E(c.svcScope) + '</div></div>' +
          '<span class="pill ' + (c.on ? 'green' : 'grey') + '">' + (c.on ? '渠道在线' : '渠道关闭') + '</span>' +
          '<button class="switch ' + (on ? 'on' : '') + '" data-act="toggleChannel" data-id="' + s.id + '|' + c.id + '"></button></div>';
      }).join('');
  }

  function summaryCard(s) {
    return K.panel({ title: '商品概览', body:
      '<div class="stack" style="gap:12px">' +
      '<div class="row"><span class="mut small">编码</span><b class="right small tnum">' + E(s.code) + '</b></div>' +
      '<div class="row"><span class="mut small">挂牌价</span><b class="right tnum">' + money(s.pricing[0].list) + '</b></div>' +
      '<div class="row"><span class="mut small">结算价</span><b class="right tnum">' + money(s.pricing[0].settle) + '</b></div>' +
      '<div class="row"><span class="mut small">单笔毛利</span><b class="right tnum" style="color:' + (s.margin < 25 ? '#b83c2c' : '#087e76') + '">' + money(s.pricing[0].settle - s.pricing[0].cost) + '（' + s.margin + '%）</b></div>' +
      '<div class="row"><span class="mut small">SKU 数</span><b class="right tnum">' + s.pricing.length + '</b></div>' +
      '<div class="row"><span class="mut small">投放渠道</span><b class="right tnum">' + s.channels.length + ' 个</b></div>' +
      '<div class="hairline"></div>' +
      '<div class="row"><span class="mut small">本月销量</span><b class="right tnum">' + s.sold + ' 单</b></div>' +
      '</div>' });
  }
  function impactCard(s) {
    return K.panel({ title: '影响面', body: UI.impact(['职工端 · 服务列表与详情', '品牌站 · 可售服务（若投放）', '订单与结算口径']) +
      '<div class="note warn" style="margin-top:12px">改价与改规则会影响新订单；已支付订单按下单快照执行。</div>' });
  }


  /* ------------------------------------------------------ 5 商品库（补剂/实物） */
  P['svc-goods'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '实物商品', sub: '补剂、耗材、器械等实物，按商品管理', preview: 'emp-home',
    render() {
      const list = Store.db.supplements;
      const on = list.filter((g) => g.on);
      const gm = Math.round(on.reduce((a, g) => a + (g.settle - g.cost) / g.settle * 100, 0) / (on.length || 1));
      return K.head('实物商品', list.length + ' 个商品 · 在售 ' + on.length + ' · 平均毛利 ' + gm + '%',
        K.btn('导入商品', 'imp', { icon: 'upload' }) + K.btn('新增商品', 'newGoods', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '在售商品', v: on.length, unit: '个', d: '补剂 ' + on.filter((g) => g.cat !== '实物').length + ' · 实物 2', icon: 'gift' },
          { k: '平均毛利率', v: gm, unit: '%', d: '低于 30% 的 2 个', tone: 'down', icon: 'chart' },
          { k: '本月销售', v: '2.4', unit: '万', d: '复购 31%', tone: 'up', icon: 'target' },
          { k: '缺货', v: list.filter((g) => g.stock === 0).length, unit: '个', d: '益生菌待补货', tone: 'down', icon: 'package' }
        ]) +
        '<div class="note" style="margin-bottom:14px">' + UI.icon('link', 14) + ' 商品可挂载到：全天食谱（随餐建议）· 搭配器 · 积分商城 · 订单。补剂的推荐规则在「吃好 · 食谱工程」里配置。</div>' +
        K.panel({ flush: true, body: UI.table([
          { label: '商品', w: '250px', render: (g) => '<div class="cellflex"><img src="' + (window.IMG || {})['g' + ((String(g.id).split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % 10 + 1)] + '" style="width:44px;height:32px;border-radius:8px;object-fit:cover;flex:none" alt=""><div style="min-width:0"><div class="strong clip">' + E(g.name) + '</div><div class="small muted">' + E(g.cat) + '</div></div></div>' },
          { label: '售价 / 结算', align: 'right', render: (g) => '<b class="tnum">¥' + g.price + '</b><div class="small muted tnum">结算 ¥' + g.settle + '</div>' },
          { label: '毛利', align: 'right', render: (g) => '<span class="pill ' + ((g.settle - g.cost) / g.settle < 0.3 ? 'amber' : 'green') + '">' + Math.round((g.settle - g.cost) / g.settle * 100) + '%</span>' },
          { label: '规格 / 效期', render: (g) => '<div class="small">' + E((g.specs || []).map((x) => x.name).join(' / ') || g.spec || '—') + '</div><div class="small muted">' + E(g.shelfLife || '—') + ' · ' + E(g.storage || '') + '</div>' } +
          { label: '库存', align: 'right', render: (g) => '<span class="tnum" style="color:' + (g.stock === 0 ? '#b83c2c' : 'inherit') + '">' + g.stock + '</span>' },
          { label: '适用 / 禁忌', render: (g) => '<div class="small">' + E(g.fit) + '</div><div class="small" style="color:#b83c2c">' + E((g.avoid || []).join(' / ') || '') + '</div>' },
          { label: '挂载', render: (g) => '<span class="small muted">' + E((g.attach || ['meal']).map((x) => x === 'day' ? '食谱' : x === 'planner' ? '搭配器' : '餐次').join(' / ')) + '</span>' },
          { label: '已售', align: 'right', render: (g) => '<span class="tnum">' + g.sold + '</span>' },
          { label: '上架', render: (g) => '<button class="switch ' + (g.on ? 'on' : '') + '" data-toggle="supplements.' + UI.ix(list, g) + '.on"></button>' }
        ], list.map((g) => Object.assign({ _id: g.id }, g))) });
    },
    actions: {
      imp() { UI.toast('请上传商品表 xlsx'); },
      newGoods() {
        UI.formDrawer({ title: '新增商品', sub: '补剂与实物统一入口', icon: 'gift', section: '商品',
          fields: [
            { key: 'name', label: '商品名称' },
            { key: 'cat', label: '分类', type: 'select', options: ['蛋白补充', '基础营养', '心血管', '肠道', '骨骼', '睡眠', '实物'] },
            { key: 'price', label: '售价', type: 'num', value: 168 },
            { key: 'settle', label: '结算价', type: 'num', value: 132 },
            { key: 'stock', label: '库存', type: 'num', value: 100 },
            { key: 'fit', label: '适用人群', ph: '如 饮食不规律' },
            { key: 'attach', label: '挂载位', type: 'select', options: ['全天食谱', '餐次', '搭配器'] }
          ],
          hint: '创建后可在食谱工程里配置随餐推荐。',
          onSave(v) {
            Store.pushItem('supplements', { id: 'su' + Date.now(), name: v.name || '新商品', cat: v.cat, price: v.price, settle: v.settle, cost: Math.round(v.settle * 0.58), stock: v.stock, on: true, fit: v.fit, avoid: [], sold: 0, svc: '', attach: [v.attach === '全天食谱' ? 'day' : v.attach === '搭配器' ? 'planner' : 'meal'] }, '新增商品');
            UI.toast('商品已创建'); App.refresh();
          } });
      }
    }
  };

  /* ------------------------------------------------------ 3 价格政策 */
  P['svc-pricing'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '价格与政策', sub: '挂牌价、结算价、协议价与毛利一屏看清',
    preview: 'emp-detail',
    render() {
      const list = SV().filter((s) => s.status === 'online');
      const avg = Math.round(list.reduce((a, b) => a + b.margin, 0) / (list.length || 1));
      const low = list.filter((s) => s.margin < 25);
      return K.head('价格与政策', '在售 ' + list.length + ' 个商品 · 平均毛利率 ' + avg + '%',
        K.btn('导出价格表', 'export', { icon: 'download' }) + K.btn('发起调价', 'adjust', { icon: 'sliders', cls: 'primary' })) +
        K.kpis([
          { k: '平均毛利率', v: avg, unit: '%', d: '目标 ≥30%', tone: avg >= 30 ? 'up' : 'down' },
          { k: '低毛利商品', v: low.length, unit: '个', d: '低于 25%，建议复核成本', tone: 'down' },
          { k: '协议价客户', v: 3, unit: '家', d: '平均折扣 92 折' },
          { k: '年度调价', v: 2, unit: '次', d: '最近 2026-09-01' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '价格总表', sub: '标准版口径', flush: true, body: UI.table([
            { label: '服务', render: (s) => '<div><div class="strong">' + E(s.name) + '</div><div class="small muted">' + E(s.cat) + '</div></div>' },
            { label: '成本', align: 'right', render: (s) => '<span class="tnum muted">' + (window.Engine ? Engine.mask('cost', money(s.pricing[0].cost)) : money(s.pricing[0].cost)) + '</span>' },
            { label: '结算价', align: 'right', render: (s) => '<span class="tnum">' + money(s.pricing[0].settle) + '</span>' },
            { label: '挂牌价', align: 'right', render: (s) => '<b class="tnum">' + money(s.pricing[0].list) + '</b>' },
            { label: '协议价', align: 'right', render: (s) => '<span class="tnum">' + money(s.pricing[0].contract) + '</span>' },
            { label: '毛利率', align: 'right', render: (s) => '<span class="pill ' + (s.margin < 25 ? 'red' : s.margin < 30 ? 'amber' : 'green') + '">' + s.margin + '%</span>' }
          ], list.slice(0, 14).map((s) => Object.assign({ _id: s.id }, s))) }) +
          '<div class="stack">' +
            K.panel({ title: '毛利测算', sub: '快速试算', body:
              '<div class="stack" style="gap:12px">' +
              UI.fSelect({ label: '服务', value: 'annual-exam', options: list.map((s) => ({ v: s.id, l: s.name })) }) +
              UI.fNum({ label: '成交价', value: 1280 }) +
              UI.fNum({ label: '数量', value: 200 }) +
              '<div class="hairline"></div>' +
              '<div class="row"><span class="mut small">单笔成本</span><b class="right tnum">¥720</b></div>' +
              '<div class="row"><span class="mut small">单笔毛利</span><b class="right tnum" style="color:#087e76">¥560</b></div>' +
              '<div class="row"><span class="mut small">合计毛利</span><b class="right tnum">¥112,000</b></div>' +
              '<div class="progress" style="margin-top:4px"><b style="width:44%"></b></div>' +
              '<div class="small mut">毛利率 43.8%，高于同类目均值 32%</div></div>' }) +
            K.panel({ title: '价格政策', body:
              '<div class="stack" style="gap:10px">' +
              UI.fSwitch({ label: '协议价需审批', value: true, path: 'price.needApproval' }) +
              UI.fSwitch({ label: '低于成本价禁止成交', value: true, path: 'price.floorGuard' }) +
              UI.fSwitch({ label: '按客户等级自动折扣', value: false, path: 'price.tierDiscount' }) +
              '</div><div class="note">毛利低于 20% 的商品会在列表中标红，并阻断发布。</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      export() { UI.toast('价格表已导出'); },
      adjust() { UI.formDrawer({ title: '发起调价', sub: '提交后进入审批，通过后生效', icon: 'sliders',
        fields: [{ key: 'svc', label: '服务', type: 'select', options: SV().slice(0, 8).map((s) => ({ v: s.name, l: s.name })) },
          { key: 'type', label: '调整方式', type: 'select', options: ['按比例上浮', '按比例下调', '统一定价'] },
          { key: 'val', label: '幅度 / 金额', value: '5%' }, { key: 'reason', label: '调价原因', type: 'area', rows: 2 }],
        onSave(v) { UI.toast('调价申请已提交审批'); } }); }
    }
  };

  /* ------------------------------------------------------ 4 服务包 */
  P['svc-bundles'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '服务包与组合', sub: '把单品打包成可售方案，五好生活就是一种服务包',
    preview: 'emp-home',
    render() {
      const list = Store.db.bundles;
      return K.head('服务包与组合', list.length + ' 个服务包 · 在售 ' + list.filter((b) => b.status === 'online').length,
        K.btn('新建服务包', 'newBundle', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '在售服务包', v: list.filter((b) => b.status === 'online').length, unit: '个', d: '累计售出 ' + list.reduce((a, b) => a + b.sold, 0) + ' 单' },
          { k: '平均毛利', v: Math.round(list.filter((b) => b.sold).reduce((a, b) => a + (b.settle - b.cost) / b.settle * 100, 0) / 3), unit: '%', d: '高于单品约 6pt', tone: 'up' },
          { k: '五好生活会员', v: 186, unit: '人', d: '进阶版占 62%' }
        ]) +
        '<div class="grid g-2">' + list.map((b) => {
          const m = Math.round((b.settle - b.cost) / b.settle * 100);
          return '<div class="panel" style="padding:18px">' +
            '<div class="row"><div><div class="row" style="gap:8px"><b style="font-size:14px">' + E(b.name) + '</b>' + (b.status === 'online' ? UI.pill('在售', 'green') : UI.pill('草稿', 'amber')) + '</div>' +
            '<div class="small muted" style="margin-top:4px">' + E(b.code) + ' · ' + E(b.audience) + ' · 含 ' + b.svcCount + ' 项服务</div></div>' +
            '<button class="iconbtn right" data-act="editBundle" data-id="' + b.id + '">' + I('edit', 16) + '</button></div>' +
            '<div class="small" style="margin-top:10px;color:var(--ink-2);height:36px">' + E(b.desc) + '</div>' +
            '<div class="hairline"></div>' +
            '<div class="row"><div><div class="small mut">售价</div><b class="tnum" style="font-size:18px">' + money(b.price) + '</b></div>' +
            '<div style="margin-left:24px"><div class="small mut">结算价</div><b class="tnum">' + money(b.settle) + '</b></div>' +
            '<div class="right" style="text-align:right"><div class="small mut">毛利</div><b class="tnum" style="color:#087e76">' + m + '%</b></div></div>' +
            '<div class="row" style="margin-top:12px;gap:6px"><button class="btn sm" data-act="viewBundle" data-id="' + b.id + '">查看组成</button>' +
            (b.name.indexOf('五好') >= 0 ? '<button class="btn sm" data-act="goFive" style="color:var(--brand)">五好运营 ›</button>' : '') + '</div>' +
          '</div>';
        }).join('') + '</div>';
    },
    actions: {
      newBundle() {
        UI.formDrawer({ title: '新建服务包', sub: '选择已上架服务组合成套餐', icon: 'package', section: '套餐信息',
          fields: [
            { key: 'name', label: '套餐名称' }, { key: 'audience', label: '目标客群', ph: '企业员工 / 高管' },
            { key: 'price', label: '售价', type: 'num', value: 3980 }, { key: 'settle', label: '结算价', type: 'num', value: 2880 },
            { key: 'desc', label: '一句话卖点', type: 'area', rows: 2 }
          ],
          hint: '创建后可在组成里勾选服务项。',
          onSave(v) {
            Store.pushItem('bundles', { id: 'b' + Date.now(), name: v.name || '新服务包', code: 'PKG-NEW', type: 'bundle', status: 'draft', price: v.price, settle: v.settle, cost: Math.round(v.settle * 0.6), audience: v.audience, svcCount: 0, sold: 0, owner: '健康管理部', desc: v.desc }, '新建服务包');
            UI.toast('服务包已创建'); App.refresh();
          } });
      },
      editBundle(d) { UI.toast('编辑服务包：' + (Store.db.bundles.find((b) => b.id === d.id) || {}).name); },
      viewBundle(d) {
        const b = Store.db.bundles.find((x) => x.id === d.id);
        const sample = SV().slice(0, b.svcCount || 3);
        UI.modal({ title: b.name, desc: b.code + ' · 含 ' + (b.svcCount || sample.length) + ' 项服务',
          body: '<div class="stack" style="gap:8px">' + sample.map((s) => '<div class="listrow" style="border-bottom:0;padding:8px 0">' +
            '<div class="meta"><b>' + E(s.name) + '</b><span>' + E(s.cat) + ' · 标准版 ' + money(s.pricing[0].list) + '</span></div>' +
            '<span class="right small mut">含 1 次</span></div>').join('') + '</div>' +
            '<div class="note" style="margin-top:12px">套餐价按结算价打包，单买合计高于套餐价 18%。</div>',
          okText: '知道了', cancelText: false });
      },
      goFive() { App.go('fg-overview'); }
    }
  };
})();
