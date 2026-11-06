/* ============================================================================
   职工健康 · pku-employee-health 运营
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const H = () => Store.db.employee;
  const MOD = (id) => (H().modules.find((m) => m.id === id) || {}).name || '—';

  const ST = {
    confirmed: ['已确认', 'blue'], pending: ['待确认', 'amber'], completed: ['已完成', 'green'], cancelled: ['已取消', 'grey']
  };

  /* ------------------------------------------------------- 概览 */
  P['e-dashboard'] = {
    app: 'employee', title: '服务概览', sub: '示例科技有限公司 · 2026 年 11 月',
    preview: 'emp-home',
    render() {
      const h = H();
      const svc = h.services;
      return K.head('服务概览', '5 大模块 · ' + svc.filter((s) => s.on).length + ' 项在架服务 · 本月预约 ' + h.bookings.length + ' 单',
        K.btn('导出月报', 'export', { icon: 'download' })) +
        K.kpis([
          { k: '在架服务', v: svc.filter((s) => s.on).length, unit: '项', d: '可预约 ' + svc.filter((s) => s.bookable && s.on).length + ' 项', icon: 'package' },
          { k: '本月预约', v: 326, unit: '单', d: '较上月 <b>+12%</b>', tone: 'up', icon: 'calendar' },
          { k: '履约完成率', v: '94.2', unit: '%', d: '超时 3 单', icon: 'check' },
          { k: '员工覆盖率', v: '68', unit: '%', d: '1,204 / 1,780 人', icon: 'users' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '近 7 天预约量', sub: '按提交时间', body: UI.lineChart([{ data: [18, 26, 22, 34, 41, 28, 36], color: '#f5520a' }], { height: 160, dots: true, min: 10, max: 46, labels: ['10-31', '11-01', '11-02', '11-03', '11-04', '11-05', '11-06'] }) }) +
          K.panel({ title: '模块分布', body: '<div class="stack" style="gap:12px">' +
            h.modules.map((m) => {
              const n = svc.filter((s) => s.mod === m.id).length;
              return '<div><div class="row small" style="justify-content:space-between"><span>' + E(m.name) + '</span><b class="tnum">' + n + ' 项</b></div>' +
                '<div class="progress" style="margin-top:5px"><b style="width:' + (n / 9 * 100) + '%;background:' + m.ink + '"></b></div></div>';
            }).join('') + '</div>' }) +
        '</div><div style="height:16px"></div>' +
        '<div class="grid g-1-2">' +
          K.panel({ title: '待处理预约', sub: '按提交时间', flush: true,
            actions: K.btn('全部', 'goBookings', { cls: 'ghost sm' }),
            body: '<div style="padding:4px 18px 12px">' + h.bookings.filter((b) => b.status === 'pending').map((b) =>
              '<div class="listrow"><div class="meta"><b>' + E(b.person) + ' · ' + E(b.service) + '</b><span>' + E(b.dept) + ' · ' + b.date + ' ' + b.time + '</span></div>' +
              '<button class="btn sm right" data-act="confirm" data-id="' + b.id + '">确认</button></div>').join('') + '</div>' }) +
          K.panel({ title: '热门服务', sub: '按预约量', flush: true,
            body: UI.table([
              { label: '服务', render: (s) => '<b>' + E(s.name) + '</b>' },
              { label: '模块', render: (s) => UI.pill(MOD(s.mod), 'grey') },
              { label: '预约', align: 'right', render: (s) => '<span class="tnum">' + s.sold + '</span>' },
              { label: '状态', render: (s) => s.on ? UI.pill('在架', 'green') : UI.pill('下架', 'grey') }
            ], svc.slice().sort((a, b) => b.sold - a.sold).slice(0, 5).map((s) => Object.assign({ _id: s.id }, s))) })
        + '</div>';
    },
    actions: {
      export() { UI.toast('月报已导出'); },
      goBookings() { App.go('e-bookings'); },
      confirm(d) {
        const b = H().bookings.find((x) => x.id === d.id);
        Store.saveItem('employee.bookings', { id: b.id, status: 'confirmed' }, 'id', '确认预约');
        UI.toast('已确认 ' + b.person + ' 的预约'); App.refresh();
      }
    }
  };

  /* ------------------------------------------------------- 服务目录 */
  P['e-services'] = {
    app: 'employee', title: '服务目录', sub: '28 项服务，详情文案与预约能力在此维护',
    preview: 'emp-services',
    state: { mod: '' },
    render() {
      const h = H(), mod = P['e-services'].state.mod;
      const list = h.services.filter((s) => !mod || s.mod === mod);
      return K.head('服务目录', h.services.length + ' 项服务 · 上架 ' + h.services.filter((s) => s.on).length + ' 项',
        K.btn('新增服务', 'newSvc', { icon: 'plus', cls: 'primary' })) +
        K.toolbar(K.seg([{ id: '', label: '全部 ' + h.services.length }].concat(h.modules.map((m) => ({ id: m.id, label: m.name }))), mod, 'svcFilter'), K.search('搜索服务名称', 'svcSearch')) +
        K.panel({ flush: true, body: UI.table([
          { label: '服务', render: (s) => '<div style="min-width:0"><div class="strong">' + E(s.name) + '</div><div class="small muted clip">' + E(s.en) + '</div></div>' },
          { label: '模块', render: (s) => '<span class="nw">' + UI.pill(MOD(s.mod), 'grey') + '</span>' },
          { label: '履约', render: (s) => '<span class="small nw">' + E(s.scope.replace('履约', '')) + '</span>' },
          { label: '标签', render: (s) => '<span class="clip-sm">' + s.tags.slice(0, 2).map((t) => UI.pill(t, 'blue')).join(' ') + '</span>' },
          { label: '可预约', render: (s) => '<button class="switch ' + (s.bookable ? 'on' : '') + '" data-toggle="employee.services.' + h.services.indexOf(s) + '.bookable"></button>' },
          { label: '在架', render: (s) => '<button class="switch ' + (s.on ? 'on' : '') + '" data-toggle="employee.services.' + h.services.indexOf(s) + '.on"></button>' },
          { label: '预约量', align: 'right', render: (s) => '<span class="tnum">' + s.sold + '</span>' },
          { label: '', align: 'right', render: (s) => '<div class="rowact"><button data-act="editSvc" data-id="' + s.id + '">' + I('edit', 14) + '</button></div>' }
        ], list.map((s) => Object.assign({ _id: s.id }, s))) });
    },
    actions: {
      newSvc() { UI.toast('新增服务表单已打开'); },
      svcFilter(d) { P['e-services'].state.mod = d.id; App.refresh(); },
      editSvc(d) {
        const s = H().services.find((x) => x.id === d.id), i = H().services.indexOf(s);
        UI.drawer({ title: '编辑服务', sub: s.name, icon: 'package', width: 520,
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '服务名称', value: s.name, path: 'employee.services.' + i + '.name' }) +
            UI.fInput({ label: '英文名', value: s.en, path: 'employee.services.' + i + '.en' }) +
            '<div class="frow">' + UI.fSelect({ label: '所属模块', value: s.mod, options: H().modules.map((m) => ({ v: m.id, l: m.name })), path: 'employee.services.' + i + '.mod' }) +
            UI.fSelect({ label: '履约范围', value: s.scope, options: ['属地履约', '全国履约'], path: 'employee.services.' + i + '.scope' }) + '</div>' +
            UI.fArea({ label: '服务介绍', value: s.intro, rows: 4, path: 'employee.services.' + i + '.intro' }) +
            '</div><div class="formsec"><h4>履约信息</h4><div class="frow">' +
            UI.fInput({ label: '服务时长', value: s.duration, path: 'employee.services.' + i + '.duration' }) +
            UI.fInput({ label: '报告时效', value: s.resp, path: 'employee.services.' + i + '.resp' }) + '</div>' +
            UI.fInput({ label: '标签', value: s.tags.join(' / '), hint: '用 / 分隔，最多 3 个', path: 'employee.services.' + i + '.tagsText' }) +
            '</div><div class="formsec"><h4>预约</h4>' +
            UI.fSwitch({ label: '允许在线预约', value: s.bookable, path: 'employee.services.' + i + '.bookable', hint: '关闭后详情页只展示「咨询」' }) +
            UI.fSwitch({ label: '在服务目录展示', value: s.on, path: 'employee.services.' + i + '.on' }) +
            '</div><div class="note teal">服务详情页与预约表单由同一份配置驱动，保存后可在右侧预览。</div>',
          onOk() { UI.toast('服务已保存'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------- 模块 */
  P['e-modules'] = {
    app: 'employee', title: '模块与分类', sub: '首页「选服务」的五宫格',
    preview: 'emp-home',
    render() {
      const h = H();
      return K.head('模块与分类', '关闭模块后首页入口与下属服务一并隐藏',
        K.btn('新增模块', 'newMod', { icon: 'plus', cls: 'primary' })) +
        '<div class="grid g-2">' + h.modules.map((m, i) =>
          '<div class="panel" style="padding:16px">' +
            '<div class="row"><div style="width:38px;height:38px;border-radius:12px;background:' + m.tint + ';color:' + m.ink + ';display:grid;place-items:center;font-weight:600;font-size:12px">' + E(m.stab) + '</div>' +
            '<div style="flex:1;min-width:0"><div class="row"><b style="font-size:13.5px">' + E(m.name) + '</b><span class="small mut">· ' + E(m.sub) + '</span></div>' +
            '<div class="small mut" style="margin-top:3px">' + h.services.filter((s) => s.mod === m.id).length + ' 项服务 · 排序 ' + m.order + '</div></div>' +
            '<button class="switch ' + (m.on ? 'on' : '') + '" data-toggle="employee.modules.' + i + '.on"></button></div>' +
            '<div class="hairline"></div>' +
            '<div class="frow"><input class="input" value="' + E(m.name) + '" data-set="employee.modules.' + i + '.name">' +
            '<input class="input" value="' + E(m.stab) + '" data-set="employee.modules.' + i + '.stab" title="底部标签短名"></div>' +
            '<div class="row" style="gap:6px;margin-top:10px">' + h.services.filter((s) => s.mod === m.id).slice(0, 4).map((s) => '<span class="chip">' + E(s.name.slice(0, 8)) + '</span>').join('') + '</div>' +
          '</div>').join('') + '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '展示规则', body: '<div class="note">首页五宫格按排序值升序展示，仅展示启用模块。模块关闭时，其下服务在搜索与详情页也不可访问，但历史预约记录保留。</div>' });
    },
    actions: { newMod() { UI.toast('新增模块'); } }
  };

  /* ------------------------------------------------------- 预约配置 */
  P['e-booking'] = {
    app: 'employee', title: '预约设置', sub: '表单字段、可约日期与时段库存',
    preview: 'emp-detail',
    state: { tab: 'fields' },
    render() {
      const h = H(), st = P['e-booking'].state;
      let body = '';
      if (st.tab === 'fields') {
        body = K.panel({ title: '表单字段', sub: '按模块生效', flush: true,
          actions: K.btn('新增字段', 'newField', { icon: 'plus', cls: 'sm' }),
          body: UI.table([
            { label: '字段', render: (f) => '<b>' + E(f.label) + '</b>' },
            { label: '类型', render: (f) => UI.pill({ select: '下拉选择', radio: '单选', date: '日期', time: '时段', number: '数字', text: '文本' }[f.type], 'grey') },
            { label: '适用模块', render: (f) => f.mods.map((m) => MOD(m)).join('、') },
            { label: '必填', render: (f) => f.required ? UI.pill('必填', 'amber') : '<span class="muted">选填</span>' },
            { label: '启用', render: (f) => '<button class="switch ' + (f.on ? 'on' : '') + '" data-toggle="employee.bookingFields.' + h.bookingFields.indexOf(f) + '.on"></button>' },
            { label: '', align: 'right', render: (f) => '<div class="rowact"><button data-act="editField" data-id="' + f.key + '">' + I('edit', 14) + '</button></div>' }
          ], h.bookingFields.map((f) => Object.assign({ _id: f.key }, f))) });
      } else if (st.tab === 'schedule') {
        body = '<div class="grid g-2">' +
          K.panel({ title: '可约日期', sub: '按天开关', flush: true,
            body: '<div style="padding:4px 18px 12px">' + h.schedule.dates.map((d, i) =>
              '<div class="listrow"><div class="meta"><b>' + d.d + ' · ' + d.w + '</b><span>' + (d.on ? '可预约' : '已关闭') + '</span></div>' +
              '<button class="switch right ' + (d.on ? 'on' : '') + '" data-toggle="employee.schedule.dates.' + i + '.on"></button></div>').join('') + '</div>' }) +
          K.panel({ title: '时段与库存', sub: '每个时段独立名额', flush: true,
            body: '<div style="padding:4px 18px 12px">' + h.schedule.times.map((t, i) =>
              '<div class="listrow"><div class="meta"><b>' + t.t + ' · ' + t.n + '</b><span>剩余名额</span></div>' +
              '<div class="right row" style="gap:10px"><span class="tnum small">' + t.quota + '</span>' +
              '<button class="switch ' + (t.on ? 'on' : '') + '" data-toggle="employee.schedule.times.' + i + '.on"></button></div></div>').join('') + '</div>' }) +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '预约规则', body: '<div class="grid g-3" style="gap:14px">' +
          UI.fNum({ label: '提前预约天数', value: h.schedule.leadDays, path: 'employee.schedule.leadDays' }) +
          UI.fNum({ label: '最多可约未来天数', value: h.schedule.maxDays, path: 'employee.schedule.maxDays' }) +
          UI.fNum({ label: '免费取消（小时）', value: h.schedule.cancelHours, path: 'employee.schedule.cancelHours' }) +
        '</div>' });
      } else {
        body = K.panel({ title: '预约单据', sub: '最近 ' + h.bookings.length + ' 单', flush: true,
          body: UI.table([
            { label: '编号', render: (b) => '<span class="tnum small">' + E(b.id) + '</span>' },
            { label: '员工', render: (b) => '<b>' + E(b.person) + '</b> <span class="small mut">' + E(b.dept) + '</span>' },
            { label: '服务', render: (b) => E(b.service) },
            { label: '时间', render: (b) => '<span class="small tnum">' + b.date + ' ' + b.time + '</span>' },
            { label: '状态', render: (b) => UI.pill(ST[b.status][0], ST[b.status][1]) }
          ], h.bookings.map((b) => Object.assign({ _id: b.id }, b))) });
      }
      return K.head('预约设置', '字段、日期与时段共同决定员工预约时看到的表单',
        K.btn('保存并发布', 'publishBooking', { icon: 'send', cls: 'primary' })) +
        K.tabs([{ id: 'fields', label: '表单字段', n: h.bookingFields.length }, { id: 'schedule', label: '日期与时段' }, { id: 'rules', label: '预约单据', n: h.bookings.length }], st.tab, 'bkTab') +
        body;
    },
    actions: {
      bkTab(d) { P['e-booking'].state.tab = d.id; App.refresh(); },
      publishBooking() { App.openPublish('预约设置更新'); },
      newField() { UI.toast('新增字段'); },
      editField(d) {
        const f = H().bookingFields.find((x) => x.key === d.id), i = H().bookingFields.indexOf(f);
        UI.drawer({ title: '编辑字段', sub: f.label, icon: 'sliders',
          body: '<div class="formsec"><h4>字段</h4>' + UI.fInput({ label: '显示名称', value: f.label, path: 'employee.bookingFields.' + i + '.label' }) +
            UI.fSelect({ label: '类型', value: f.type, options: ['select', 'radio', 'date', 'time', 'number', 'text'], path: 'employee.bookingFields.' + i + '.type' }) +
            UI.fSwitch({ label: '必填', value: f.required, path: 'employee.bookingFields.' + i + '.required' }) +
            UI.fSwitch({ label: '启用', value: f.on, path: 'employee.bookingFields.' + i + '.on' }) +
            '</div><div class="formsec"><h4>适用模块</h4><div class="chips">' +
            H().modules.map((m) => '<span class="chip ' + (f.mods.indexOf(m.id) >= 0 ? 'on' : '') + '">' + E(m.name) + '</span>').join('') + '</div></div>',
          onOk() { UI.toast('字段已保存'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------- 预约订单 */
  P['e-bookings'] = {
    app: 'employee', title: '预约订单', sub: '确认、完成与取消的全流程',
    preview: 'emp-detail',
    state: { tab: 'all' },
    render() {
      const h = H(), tab = P['e-bookings'].state.tab;
      const list = h.bookings.filter((b) => tab === 'all' ? true : b.status === tab);
      return K.head('预约订单', '共 ' + h.bookings.length + ' 单 · 待确认 ' + h.bookings.filter((b) => b.status === 'pending').length,
        K.btn('导出', 'exportBk', { icon: 'download' })) +
        K.kpis([
          { k: '今日预约', v: h.bookings.filter((b) => b.date === '2026-11-07').length, unit: '单', d: '08:30 时段已满' },
          { k: '待确认', v: h.bookings.filter((b) => b.status === 'pending').length, unit: '单', d: '建议 2h 内确认', tone: 'down' },
          { k: '完成率', v: '94', unit: '%', d: '取消 1 单' }
        ]) +
        K.tabs([{ id: 'all', label: '全部', n: h.bookings.length }, { id: 'pending', label: '待确认', n: h.bookings.filter((b) => b.status === 'pending').length },
          { id: 'confirmed', label: '已确认' }, { id: 'completed', label: '已完成' }, { id: 'cancelled', label: '已取消' }], tab, 'bkStTab') +
        K.panel({ flush: true, body: UI.table([
          { label: '编号', render: (b) => '<span class="tnum small">' + E(b.id) + '</span>' },
          { label: '员工', render: (b) => '<div class="cellflex">' + UI.avatar(b.person) + '<div><div class="strong">' + E(b.person) + '</div><div class="small muted">' + E(b.dept) + '</div></div></div>' },
          { label: '服务', render: (b) => E(b.service) },
          { label: '预约时间', render: (b) => '<span class="small tnum">' + b.date + ' ' + b.time + '</span>' },
          { label: '机构', render: (b) => '<span class="small">' + E(b.org) + '</span>' },
          { label: '状态', render: (b) => UI.pill(ST[b.status][0], ST[b.status][1]) },
          { label: '', align: 'right', render: (b) => '<div class="rowact">' +
            (b.status === 'pending' ? '<button data-act="setBk" data-id="' + b.id + '" title="确认">' + I('check', 14) + '</button>' : '') +
            (b.status === 'confirmed' ? '<button data-act="setBk" data-id="' + b.id + '" title="完成">' + I('check', 14) + '</button>' : '') +
            '<button data-act="cancelBk" data-id="' + b.id + '" title="取消">' + I('x', 14) + '</button></div>' }
        ], list.map((b) => Object.assign({ _id: b.id }, b))) });
    },
    actions: {
      bkStTab(d) { P['e-bookings'].state.tab = d.id; App.refresh(); },
      exportBk() { UI.toast('预约订单已导出'); },
      setBk(d) {
        const b = H().bookings.find((x) => x.id === d.id);
        const next = b.status === 'pending' ? 'confirmed' : 'completed';
        Store.saveItem('employee.bookings', { id: b.id, status: next }, 'id', '预约状态');
        UI.toast(next === 'confirmed' ? '已确认预约' : '已标记完成'); App.refresh();
      },
      cancelBk(d) {
        const b = H().bookings.find((x) => x.id === d.id);
        UI.confirm({ title: '取消该预约？', desc: b.person + ' · ' + b.service + '，取消后会通知员工。', danger: true, okText: '取消预约' })
          .then((ok) => { if (!ok) return; Store.saveItem('employee.bookings', { id: b.id, status: 'cancelled' }, 'id', '取消预约'); UI.toast('已取消'); App.refresh(); });
      }
    }
  };

  /* ------------------------------------------------------- 内容运营 */
  P['e-content'] = {
    app: 'employee', title: '内容运营', sub: '首页 Banner、发现页资讯与健康知识',
    preview: 'emp-home',
    state: { tab: 'banner' },
    render() {
      const h = H(), tab = P['e-content'].state.tab;
      const body = tab === 'banner'
        ? K.panel({ title: '首页 Banner', sub: '自动轮播 · ' + h.site.bannerInterval + ' 秒', flush: true,
            actions: K.btn('新增 Banner', 'newBanner', { icon: 'plus', cls: 'sm' }),
            body: '<div style="padding:4px 18px 12px">' + h.banners.map((b, i) =>
              '<div class="listrow"><div style="width:64px;height:38px;border-radius:8px;background:linear-gradient(135deg,#0b63e5,#08356f)"></div>' +
              '<div class="meta"><b>' + E(b.title) + '</b><span>' + E(b.sub) + '</span></div>' +
              '<div class="right row" style="gap:8px"><span class="small mut">' + b.order + '</span><button class="switch ' + (b.on ? 'on' : '') + '" data-toggle="employee.banners.' + i + '.on"></button></div></div>').join('') + '</div>' })
        : K.panel({ title: '健康资讯', sub: '发现页内容流', flush: true,
            actions: K.btn('新建文章', 'newArticle', { icon: 'plus', cls: 'sm' }),
            body: UI.table([
              { label: '标题', render: (a) => '<div class="strong">' + E(a.title) + '</div><div class="small muted">' + E(a.author) + '</div>' },
              { label: '分类', render: (a) => UI.pill(a.cat, 'grey') },
              { label: '发布时间', render: (a) => '<span class="small tnum muted">' + a.date + '</span>' },
              { label: '阅读', align: 'right', render: (a) => '<span class="tnum">' + a.views + '</span>' },
              { label: '上线', render: (a) => '<button class="switch ' + (a.on ? 'on' : '') + '" data-toggle="employee.articles.' + h.articles.indexOf(a) + '.on"></button>' }
            ], h.articles.map((a) => Object.assign({ _id: a.id }, a))) });
      return K.head('内容运营', '内容只影响展示，不改变服务与预约能力',
        K.btn('发布', 'publishContent', { icon: 'send', cls: 'primary' })) +
        K.tabs([{ id: 'banner', label: '首页 Banner', n: h.banners.length }, { id: 'article', label: '健康资讯', n: h.articles.length }], tab, 'ctTab') + body +
        '<div style="height:16px"></div>' +
        K.panel({ title: '轮播设置', body: '<div class="grid g-3" style="gap:14px">' +
          UI.fNum({ label: '轮播间隔（秒）', value: h.site.bannerInterval, path: 'employee.site.bannerInterval' }) +
          UI.fSwitch({ label: '自动轮播', value: true, path: 'employee.site.autoPlay' }) +
          UI.fSwitch({ label: '显示指示点', value: true, path: 'employee.site.dots' }) + '</div>' });
    },
    actions: {
      ctTab(d) { P['e-content'].state.tab = d.id; App.refresh(); },
      publishContent() { App.openPublish('内容运营更新'); },
      newBanner() { UI.toast('新增 Banner'); },
      newArticle() { UI.toast('新建文章'); }
    }
  };

  /* ------------------------------------------------------- 深度问答 */
  P['e-qa'] = {
    app: 'employee', title: '深度问答', sub: 'AI 问答的知识库与推荐问题由运营维护',
    preview: 'emp-home',
    render() {
      const h = H();
      return K.head('深度问答', h.qa.length + ' 条问答 · 命中 ' + h.qa.reduce((a, b) => a + b.hits, 0) + ' 次',
        K.btn('新增问答', 'newQa', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '问答条数', v: h.qa.length, unit: '条', d: '启用 ' + h.qa.filter((q) => q.on).length },
          { k: '本月命中', v: '5,284', unit: '次', d: '较上月 +22%', tone: 'up' },
          { k: '无答案率', v: '8.2', unit: '%', d: '建议补充 3 个高频问题', tone: 'down' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '问题', render: (q) => '<div class="strong">' + E(q.q) + '</div><div class="small muted" style="margin-top:2px">' + E(q.answer).slice(0, 46) + '…</div>' },
          { label: '分类', render: (q) => UI.pill(q.cat, 'grey') },
          { label: '命中', align: 'right', render: (q) => '<span class="tnum">' + q.hits + '</span>' },
          { label: '启用', render: (q) => '<button class="switch ' + (q.on ? 'on' : '') + '" data-toggle="employee.qa.' + h.qa.indexOf(q) + '.on"></button>' },
          { label: '', align: 'right', render: (q) => '<div class="rowact"><button data-act="editQa" data-id="' + q.id + '">' + I('edit', 14) + '</button></div>' }
        ], h.qa.map((q) => Object.assign({ _id: q.id }, q))) });
    },
    actions: {
      newQa() { UI.toast('新增问答'); },
      editQa(d) {
        const q = H().qa.find((x) => x.id === d.id), i = H().qa.indexOf(q);
        UI.drawer({ title: '编辑问答', sub: q.cat, icon: 'message',
          body: '<div class="formsec"><h4>问答</h4>' + UI.fArea({ label: '问题', value: q.q, rows: 2, path: 'employee.qa.' + i + '.q' }) +
            UI.fArea({ label: '答案', value: q.answer, rows: 6, path: 'employee.qa.' + i + '.answer' }) +
            UI.fSelect({ label: '分类', value: q.cat, options: ['体检解读', '慢病管理', '运动康复', '营养'], path: 'employee.qa.' + i + '.cat' }) +
            UI.fSwitch({ label: '启用', value: q.on, path: 'employee.qa.' + i + '.on' }) +
            '</div><div class="note warn">答案涉及诊断与用药建议时必须保留「请以医生面诊为准」的提示。</div>',
          onOk() { UI.toast('问答已保存'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------- 企业与权益 */
  P['e-orgs'] = {
    app: 'employee', title: '企业与权益', sub: '服务机构与员工可享权益额度',
    preview: 'emp-home',
    render() {
      const h = H(), e = h.site.entitlement;
      return K.head('企业与权益', h.site.company + ' · 1,780 名员工',
        K.btn('保存', 'saveOrg', { icon: 'check', cls: 'primary' })) +
        '<div class="grid g-2"><div class="stack">' +
          K.panel({ title: '服务机构', flush: true, body: '<div style="padding:4px 18px 12px">' + h.orgs.map((o, i) =>
            '<div class="listrow"><div class="meta"><b>' + E(o.name) + '</b><span>' + E(o.sub) + '</span></div>' +
            '<button class="switch right ' + (o.on ? 'on' : '') + '" data-toggle="employee.orgs.' + i + '.on"></button></div>').join('') + '</div>' }) +
          K.panel({ title: '预约入口', body: '<div class="small mut" style="line-height:1.8">员工从企业微信工作台进入，免登录。<br>每个员工可见的服务由其权益包决定。</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '权益额度', body: '<div class="stack" style="gap:14px">' +
            UI.fNum({ label: '年度体检（次/人/年）', value: e.annualExam, path: 'employee.site.entitlement.annualExam' }) +
            UI.fNum({ label: 'EAP 咨询（次/人/年）', value: e.eap, path: 'employee.site.entitlement.eap' }) +
            UI.fSwitch({ label: '开放企业医务室', value: e.clinic, path: 'employee.site.entitlement.clinic' }) +
            '</div><div class="note teal">额度用尽后，员工仍可查看服务详情，但预约按钮变为「咨询客服」。</div>' }) +
          K.panel({ title: '预算消耗', body: '<div class="stack" style="gap:12px">' +
            [['年度体检', 62], ['慢病管理', 38], ['EAP', 21], ['急救培训', 44]].map((x) =>
              '<div><div class="row small" style="justify-content:space-between"><span>' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%"></b></div></div>').join('') + '</div>' }) +
        '</div></div>';
    },
    actions: { saveOrg() { UI.toast('权益配置已保存'); } }
  };

  /* ------------------------------------------------------- 站点设置 */
  P['e-site'] = {
    app: 'employee', title: '站点设置', sub: '企业信息、客服电话与主题',
    preview: 'emp-home',
    render() {
      const s = H().site;
      return K.head('站点设置', 'logo 与主题色沿用北大医疗品牌规范',
        K.btn('保存', 'saveSite', { icon: 'check', cls: 'primary' })) +
        '<div class="grid g-2">' +
          K.panel({ title: '企业信息', body: '<div class="stack" style="gap:14px">' +
            UI.fInput({ label: '页面标题', value: s.title, path: 'employee.site.title' }) +
            UI.fInput({ label: '企业名称', value: s.company, path: 'employee.site.company' }) +
            UI.fInput({ label: '客服电话', value: s.servicePhone, path: 'employee.site.servicePhone' }) +
            UI.fInput({ label: '搜索框占位', value: s.searchPlaceholder, path: 'employee.site.searchPlaceholder' }) +
            '</div>' }) +
          K.panel({ title: '主题', body: '<div class="chips">' +
            [['warm', '暖橙（默认）', 'linear-gradient(135deg,#f5520a,#b93a05)'], ['blue', '北医蓝', 'linear-gradient(135deg,#0b63e5,#08356f)']].map((t) =>
              '<button class="chip ' + (s.theme === t[0] ? 'on' : '') + '" data-act="setTheme" data-id="' + t[0] + '"><i style="width:14px;height:14px;border-radius:4px;background:' + t[2] + ';display:inline-block"></i>' + t[1] + '</button>').join('') +
            '</div><div class="note" style="margin-top:12px">职工健康端沿用暖橙，与品牌站蓝区分场景。</div>' +
            '<div class="hairline"></div><div class="row"><span class="small mut">上次发布</span><b class="right small tnum">' + Store.db.meta.publishedAt + '</b></div>' }) +
        '</div>';
    },
    actions: {
      saveSite() { UI.toast('站点设置已保存'); },
      setTheme(d) { Store.set('employee.site.theme', d.id, '主题'); UI.toast('主题已切换'); App.refresh(); }
    }
  };

  window.NAV.employee = [
    { group: '', items: [{ id: 'e-dashboard', label: '服务概览', icon: 'grid' }] },
    { group: '服务', items: [
      { id: 'e-services', label: '服务目录', icon: 'package', count: 28 },
      { id: 'e-modules', label: '模块与分类', icon: 'layers' },
      { id: 'e-booking', label: '预约设置', icon: 'calendar' },
      { id: 'e-bookings', label: '预约订单', icon: 'check', count: 2, hot: true }
    ] },
    { group: '运营', items: [
      { id: 'e-content', label: '内容运营', icon: 'image' },
      { id: 'e-qa', label: '深度问答', icon: 'message' },
      { id: 'e-orgs', label: '企业与权益', icon: 'building' }
    ] },
    { group: '站点', items: [{ id: 'e-site', label: '站点设置', icon: 'settings' }] }
  ];
})();
