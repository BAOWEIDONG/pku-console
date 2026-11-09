/* ============================================================================
   融合层：一处配置，三端生效
   品牌与主体 / 跨端内容 / 服务机构 / 主题与入口 / 统一账号 / 角色权限
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const SH = () => Store.db.shared;
  const APP = { pku: '品牌站', employee: '职工健康', versionall: '减重营' };
  const APP_DOT = { pku: '#0aa39a', employee: '#c8871a', versionall: '#3f8cff' };

  function memberCount(id) {
    return Store.db.rbac.members.filter((m) => m.roles.indexOf(id) >= 0).length;
  }
  function crossBadge(text) {
    return '<span class="cross">' + I('layers', 11) + E(text || '跨端生效') + '</span>';
  }
  function appChips(apps) {
    return (apps || []).map((a) => '<span class="pill ' + (a === 'pku' ? 'green' : a === 'employee' ? 'amber' : 'blue') + '">' + APP[a] + '</span>').join(' ');
  }

  /* --------------------------------------------------- 1 品牌与主体 */
  P['g-brand'] = {
    app: 'all', papp: 'pku', grp: 'shared.brand', title: '品牌与主体', sub: '品牌名、主张与联系方式，三端共用一处',
    preview: 'pku-home',
    render() {
      const s = SH();
      return K.head('品牌与主体', '改一次，品牌站、职工端、学员端同步更新',
        crossBadge('三端共用') + K.btn('查看影响面', 'impact', { icon: 'eye', cls: 'ghost' }) +
        K.btn('保存并发布', 'publishBrand', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            K.panel({ title: '品牌信息', sub: '用于页面首屏与分享卡片',
              body: '<div class="stack" style="gap:14px">' +
                '<div class="frow">' + UI.fInput({ label: '中文名', value: s.brand.name, path: 'shared.brand.name' }) +
                UI.fInput({ label: '英文名', value: s.brand.englishName, path: 'shared.brand.englishName' }) + '</div>' +
                UI.fInput({ label: '主体全称', value: s.brand.full, path: 'shared.brand.full', hint: '用于页脚版权与合规信息' }) +
                UI.fInput({ label: '品牌主张', value: s.brand.slogan, path: 'shared.brand.slogan', hint: '品牌站首屏主标题，建议 8–12 字' }) +
                UI.fArea({ label: '简介', value: s.brand.intro, rows: 3, path: 'shared.brand.intro' }) +
                '</div>' }) +
            K.panel({ title: '联系方式', sub: '客服与投诉在三端底部统一展示',
              body: '<div class="stack" style="gap:14px">' +
                '<div class="frow">' + UI.fInput({ label: '客服电话', value: s.contact.servicePhone, path: 'shared.contact.servicePhone' }) +
                UI.fInput({ label: '总机', value: s.contact.hotline, path: 'shared.contact.hotline' }) + '</div>' +
                '<div class="frow">' + UI.fInput({ label: '投诉电话', value: s.contact.complaint, path: 'shared.contact.complaint' }) +
                UI.fInput({ label: '邮箱', value: s.contact.email, path: 'shared.contact.email' }) + '</div>' +
                UI.fInput({ label: '地址', value: s.contact.address, path: 'shared.contact.address' }) +
                UI.fInput({ label: '工作时间', value: s.contact.workHours, path: 'shared.contact.workHours' }) +
                '</div>' }) +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '三端落位', sub: '同一字段的展示位置',
              body: '<div class="stack" style="gap:12px">' +
                [['pku', '首页首屏主标题', s.brand.slogan], ['employee', '服务页头部企业信息', s.brand.name + ' · 职工健康'], ['versionall', '消息与报告落款', s.brand.full]]
                  .map((x) => '<div style="border-left:2px solid ' + APP_DOT[x[0]] + ';padding-left:10px">' +
                    '<div class="row small" style="gap:6px"><b style="font-size:12px">' + APP[x[0]] + '</b><span class="mut">' + E(x[1]) + '</span></div>' +
                    '<div class="small" style="margin-top:3px;color:var(--ink-2)">' + E(x[2]) + '</div></div>').join('') +
                '</div>' }) +
            K.panel({ title: '影响面', body: UI.impact(Store.db.shared.impact ? [] : []) ||
              '<div class="small mut" style="line-height:1.9">品牌站 · 首页首屏<br>品牌站 · 关于页<br>职工端 · 服务页头部<br>学员端 · 消息落款与报告的页脚</div>' }) +
            K.panel({ title: '变更提示', body: '<div class="note">品牌名与主体全称会出现在合同、报告与分享卡片中，修改前请确认已同步品牌部与法务。</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      publishBrand() { App.openPublish('品牌与主体更新'); },
      impact() { UI.toast('影响 4 个前端页面，详见右侧'); }
    }
  };

  /* --------------------------------------------------- 2 跨端内容 */
  P['g-content'] = {
    app: 'all', papp: 'pku', grp: 'shared.content', title: '跨端内容', sub: '一条内容可同时投放到多个端，不必重复配置',
    preview: 'pku-home',
    state: { tab: 'all' },
    render() {
      const list = SH().contents;
      const tab = P['g-content'].state.tab;
      const rows = list.filter((c) => tab === 'all' || c.type === tab);
      const count = (app) => list.filter((c) => c.on && c.apps.indexOf(app) >= 0).length;
      return K.head('跨端内容', 'Banner、公告、资讯统一在这里生产，按投放端分发',
        crossBadge('一处生产 · 多端投放') +
        '<button class="btn" data-act="go" data-id="lib-assets">' + I('image', 15) + '共享资产</button>' +
        K.btn('新建内容', 'newContent', { icon: 'plus', cls: 'primary' })) +
        '<div class="grid g-3" style="margin-bottom:16px">' +
          [['pku', '品牌站', count('pku')], ['employee', '职工健康', count('employee')], ['versionall', '减重营', count('versionall')]].map((x) =>
            '<div class="panel" style="padding:14px 16px"><div class="row"><i style="width:8px;height:8px;border-radius:50%;background:' + APP_DOT[x[0]] + '"></i>' +
            '<b style="font-size:12.5px">' + x[1] + '</b><span class="right small mut">当前生效</span></div>' +
            '<div class="row" style="margin-top:8px"><span style="font-size:26px;font-weight:600;letter-spacing:-.03em" class="tnum">' + x[2] + '</span><span class="small mut" style="margin-left:6px">条内容</span></div></div>').join('') +
        '</div>' +
        K.toolbar(K.seg([{ id: 'all', label: '全部 ' + list.length }, { id: 'banner', label: 'Banner' }, { id: 'notice', label: '公告' }, { id: 'article', label: '资讯' }], tab, 'cTab'),
          K.search('搜索标题', 'cSearch')) +
        K.panel({ flush: true, body: UI.table([
          { label: '类型', render: (c) => UI.pill({ banner: 'Banner', notice: '公告', article: '资讯' }[c.type], c.type === 'banner' ? 'blue' : c.type === 'notice' ? 'amber' : 'green') },
          { label: '标题', render: (c) => '<div class="strong">' + E(c.title) + '</div><div class="small muted clip">' + E(c.sub) + '</div>' },
          { label: '投放端', render: (c) => '<span class="nw">' + appChips(c.apps) + '</span>' },
          { label: '生效期', render: (c) => '<span class="small tnum muted">' + E(c.start) + ' → ' + E(c.end) + '</span>' },
          { label: '曝光', align: 'right', render: (c) => '<span class="tnum">' + (c.views || 0).toLocaleString() + '</span>' },
          { label: '状态', render: (c) => '<button class="switch ' + (c.on ? 'on' : '') + '" data-toggle="shared.contents.' + UI.ix(list, c) + '.on"></button>' },
          { label: '', align: 'right', render: (c) => '<div class="rowact"><button data-act="editContent" data-id="' + c.id + '">' + I('edit', 14) + '</button></div>' }
        ], rows.map((c) => Object.assign({ _id: c.id }, c))) });
    },
    actions: {
      cTab(d) { P['g-content'].state.tab = d.id; App.refresh(); },
      cSearch() {},
      newContent() { openContent(null); },
      editContent(d) { openContent(d.id); }
    }
  };

  function openContent(id) {
    const list = SH().contents;
    const c = id ? list.find((x) => x.id === id) : { type: 'banner', title: '', sub: '', apps: ['pku'], start: '2026-11-06', end: '2026-12-31', on: true, tone: 'blue' };
    const i = id ? UI.ix(list, c) : -1;
    UI.drawer({
      title: id ? '编辑内容' : '新建内容', sub: id ? c.title : '选择投放端后可多端复用', icon: 'image',
      body: '<div class="formsec"><h4>内容</h4>' +
        UI.fSelect({ label: '类型', value: c.type, options: [{ v: 'banner', l: 'Banner 轮播' }, { v: 'notice', l: '站内公告' }, { v: 'article', l: '健康资讯' }], path: i >= 0 ? 'shared.contents.' + i + '.type' : '' }) +
        UI.fInput({ label: '标题', value: c.title, path: i >= 0 ? 'shared.contents.' + i + '.title' : '', ph: '不超过 16 字' }) +
        UI.fInput({ label: '副标题 / 摘要', value: c.sub, path: i >= 0 ? 'shared.contents.' + i + '.sub' : '' }) +
        '</div><div class="formsec"><h4>投放端</h4><div class="small mut">选中即在该端展示，可多选。</div>' +
        '<div class="chips" data-role="apps">' + ['pku', 'employee', 'versionall'].map((a) =>
          '<button class="chip ' + (c.apps.indexOf(a) >= 0 ? 'on' : '') + '" data-app="' + a + '">' + APP[a] + '</button>').join('') + '</div></div>' +
        '<div class="formsec"><h4>生效时间</h4><div class="frow">' +
        UI.fInput({ label: '开始', value: c.start, path: i >= 0 ? 'shared.contents.' + i + '.start' : '' }) +
        UI.fInput({ label: '结束', value: c.end, path: i >= 0 ? 'shared.contents.' + i + '.end' : '' }) + '</div></div>' +
        UI.impact(['品牌站 · 首页 Banner', '职工端 · 首页轮播', '学员端 · 消息中心']),
      okText: id ? '保存' : '创建',
      mount(n) {
        n.querySelectorAll('[data-role="apps"] .chip').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
        const sel = n.querySelector('select');
        if (!id) { sel.disabled = false; }
      },
      onOk(n) {
        const apps = Array.from(n.querySelectorAll('[data-role="apps"] .chip.on')).map((b) => b.dataset.app);
        const inputs = n.querySelectorAll('.field .input');
        const val = (k) => (inputs[k] ? inputs[k].value : '');
        if (id) {
          Store.saveItem('shared.contents', { id: c.id, apps: apps }, 'id', '编辑内容');
        } else {
          Store.pushItem('shared.contents', {
            id: 'c' + Date.now(), type: val(0) || 'banner', title: val(1) || '未命名内容', sub: val(2) || '',
            apps: apps.length ? apps : ['pku'], on: true, order: 1, start: val(3) || '2026-11-06', end: val(4) || '2026-12-31', views: 0, tone: 'blue'
          }, '新增内容');
        }
        UI.toast(id ? '内容已更新' : '内容已创建');
        App.refresh();
      }
    });
  }

  /* --------------------------------------------------- 3 服务机构 */
  P['g-orgs'] = {
    app: 'all', papp: 'pku', grp: 'shared.orgs', title: '服务机构', sub: '一家医院一处维护，按投放端出现在不同产品里',
    preview: 'pku-hospitals',
    render() {
      const list = Store.db.brand.institutions;
      const n = (p) => list.filter((i) => i.on && (i.platforms || []).indexOf(p) >= 0).length;
      return K.head('服务机构', list.length + ' 家机构 · 品牌展示与预约履约共用同一份院区数据',
        crossBadge('三端共用') + K.btn('新增机构', 'newOrg', { icon: 'plus', cls: 'primary' })) +
        '<div class="grid g-3" style="margin-bottom:16px">' +
          [['brand', '品牌站', '分院网络展示', n('brand')], ['employee', '职工健康', '可预约机构', n('employee')], ['camp', '健康营', '履约与体检地点', n('camp')]].map((x) =>
            '<div class="panel" style="padding:14px 16px"><div class="row"><i style="width:8px;height:8px;border-radius:50%;background:' + (APP_DOT[x[0]] || '#0aa39a') + '"></i>' +
            '<b style="font-size:12.5px">' + x[1] + '</b><span class="right small mut">' + E(x[2]) + '</span></div>' +
            '<div class="row" style="margin-top:8px"><span class="tnum" style="font-size:26px;font-weight:600;letter-spacing:-.03em">' + x[3] + '</span><span class="small mut" style="margin-left:6px">家</span></div></div>').join('') +
        '</div>' +
        K.panel({ flush: true, body: UI.table([
          { label: '机构', render: (i) => '<div class="cellflex"><div class="ava g" style="border-radius:9px">' + I('hospital', 14) + '</div><div><div class="strong">' + E(i.name) + '</div><div class="small muted">' + E(i.city) + ' · ' + E(i.level) + '</div></div></div>' },
          { label: '投放端', render: (i) => '<span class="nw">' + (i.platforms || []).map((p) => '<span class="pill ' + (p === 'brand' ? 'green' : p === 'employee' ? 'amber' : 'blue') + '">' + ({ brand: '品牌站', employee: '职工端', camp: '健康营' }[p]) + '</span>').join(' ') + '</span>' },
          { label: '可预约', render: (i) => '<button class="switch ' + (i.bookable ? 'on' : '') + '" data-toggle="brand.institutions.' + UI.ix(list, i) + '.bookable"></button>' },
          { label: '床位', align: 'right', render: (i) => '<span class="tnum">' + (i.beds || '—') + '</span>' },
          { label: '上线', render: (i) => '<button class="switch ' + (i.on ? 'on' : '') + '" data-toggle="brand.institutions.' + UI.ix(list, i) + '.on"></button>' },
          { label: '', align: 'right', render: (i) => '<div class="rowact"><button data-act="editOrg" data-id="' + i.id + '">' + I('edit', 14) + '</button></div>' }
        ], list.map((i) => Object.assign({ _id: i.id }, i))) });
    },
    actions: {
      newOrg() {
        UI.formDrawer({ title: '新增服务机构', sub: '创建后可勾选投放端', icon: 'hospital',
          fields: [
            { key: 'name', label: '机构全称' }, { key: 'city', label: '城市', ph: '北京 · 昌平' },
            { key: 'region', label: '所属地区', type: 'select', options: Store.db.brand.regions.map((r) => ({ v: r.id, l: r.name })) },
            { key: 'type', label: '机构类型', type: 'select', options: [{ v: 'general', l: '综合医院' }, { v: 'rehab', l: '康复医院' }, { v: 'specialty', l: '专科医院' }, { v: 'center', l: '健康管理中心' }] },
            { key: 'level', label: '等级', ph: '三级综合' }
          ],
          impact: UI.impact(['品牌站 · 分院网络', '职工端 · 预约机构']),
          onSave(v) {
            Store.pushItem('brand.institutions', { id: 'i' + Date.now(), region: v.region, type: v.type, name: v.name || '新机构', short: v.name, city: v.city, beds: 0, level: v.level, open: '2027', tags: [], desc: '', on: true, platforms: ['brand'], bookable: false }, '新增机构');
            UI.toast('机构已创建'); App.refresh();
          } });
      },
      editOrg(d) {
        const list = Store.db.brand.institutions;
        const o = list.find((x) => x.id === d.id), i = UI.ix(list, o);
        UI.drawer({ title: '编辑机构', sub: o.name, icon: 'hospital',
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '机构全称', value: o.name, path: 'brand.institutions.' + i + '.name' }) +
            '<div class="frow">' + UI.fInput({ label: '城市', value: o.city, path: 'brand.institutions.' + i + '.city' }) +
            UI.fInput({ label: '等级', value: o.level, path: 'brand.institutions.' + i + '.level' }) + '</div>' +
            UI.fArea({ label: '简介', value: o.desc, rows: 2, path: 'brand.institutions.' + i + '.desc' }) +
            '</div><div class="formsec"><h4>投放端</h4><div class="small mut">勾选后该机构出现在对应产品中。</div><div class="chips" data-role="plat">' +
            [['brand', '品牌站 · 分院网络'], ['employee', '职工端 · 预约机构'], ['camp', '健康营 · 履约地点']].map((p) =>
              '<button class="chip ' + ((o.platforms || []).indexOf(p[0]) >= 0 ? 'on' : '') + '" data-p="' + p[0] + '">' + p[1] + '</button>').join('') +
            '</div></div>' +
            '<div class="formsec"><h4>预约</h4>' +
            UI.fSwitch({ label: '允许作为预约机构', value: o.bookable, path: 'brand.institutions.' + i + '.bookable' }) +
            UI.fSwitch({ label: '对外展示', value: o.on, path: 'brand.institutions.' + i + '.on' }) + '</div>' +
            UI.impact(['品牌站 · 分院网络', '职工端 · 预约表单机构列表', '健康营 · 官方展示页']),
          mount(n) { n.querySelectorAll('[data-role="plat"] .chip').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on'))); },
          onOk(n) {
            const plats = Array.from(n.querySelectorAll('[data-role="plat"] .chip.on')).map((b) => b.dataset.p);
            Store.saveItem('brand.institutions', { id: o.id, platforms: plats }, 'id', '机构投放端');
            UI.toast('机构已保存'); App.refresh();
          }
        });
      }
    }
  };

  /* --------------------------------------------------- 4 主题与入口 */
  P['g-theme'] = {
    app: 'all', papp: 'employee', grp: 'shared.theme', title: '主题与入口', sub: '品牌色与三端功能入口的唯一来源',
    preview: 'emp-home',
    render() {
      const t = SH().theme;
      return K.head('主题与入口', '品牌色一处设定；入口按端分别开关',
        crossBadge('三端共用') + K.btn('保存并发布', 'publishTheme', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '品牌色', body: '<div class="chips" style="margin-bottom:14px">' +
            [['#0B63E5', '北医蓝'], ['#08356F', '深海蓝'], ['#0AA39A', '医疗青'], ['#C8871A', '琥珀']].map((c) =>
              '<button class="chip sq ' + (t.primary.toLowerCase() === c[0].toLowerCase() ? 'on' : '') + '" data-act="setPrimary" data-id="' + c[0] + '">' +
              '<i style="width:12px;height:12px;border-radius:3px;background:' + c[0] + ';display:inline-block"></i>' + c[1] + '</button>').join('') +
            '</div><div class="row small mut" style="justify-content:space-between">' +
            '<span>主色</span><b class="tnum">' + E(t.primary) + '</b></div>' +
            '<div class="hairline"></div>' +
            '<div class="row small mut" style="justify-content:space-between"><span>辅色</span><b class="tnum">' + E(t.accent) + '</b></div>' +
            '<div class="note" style="margin-top:12px">更换主色会同时影响控制台强调色与三端 H5，属于全局动作。</div>' }) +
          K.panel({ title: '入口开关', sub: '关闭后入口隐藏，数据保留', flush: true,
            body: '<div style="padding:4px 18px 10px">' + SH().entries.map((en, i) =>
              '<div class="listrow"><span class="pill ' + (en.app === 'pku' ? 'green' : en.app === 'employee' ? 'amber' : 'blue') + '">' + APP[en.app] + '</span>' +
              '<div class="meta"><b>' + E(en.label) + '</b><span>' + E(en.path) + '</span></div>' +
              '<button class="switch right ' + (en.on ? 'on' : '') + '" data-toggle="shared.entries.' + i + '.on"></button></div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '版式', body: '<div class="stack" style="gap:16px">' +
            UI.fRange({ label: '圆角', value: t.radius, min: 8, max: 28, suffix: 'px', path: 'shared.theme.radius' }) +
            UI.fRange({ label: '字号比例', value: t.fontScale, min: 90, max: 115, suffix: '%', path: 'shared.theme.fontScale' }) +
            UI.fSwitch({ label: '职工端保持暖橙', value: t.employeeWarm, path: 'shared.theme.employeeWarm', hint: '关闭后职工端也使用品牌蓝' }) +
            '</div>' }) +
          K.panel({ title: '当前生效', body: '<div class="stack" style="gap:10px">' +
            [['pku', '品牌站', '蓝色玻璃质感'], ['employee', t.employeeWarm ? '职工健康（暖橙）' : '职工健康（品牌蓝）'], ['versionall', '减重营', '浅色卡片']].map((x) =>
              '<div class="row small"><i style="width:8px;height:8px;border-radius:50%;background:' + (x[1].indexOf('暖橙') >= 0 ? '#f5520a' : APP_DOT[x[0]]) + '"></i>' +
              '<span>' + x[1] + '</span><span class="right mut">' + x[2] + '</span></div>').join('') + '</div>' }) +
        '</div></div>';
    },
    actions: {
      setPrimary(d) {
        Store.set('shared.theme.primary', d.id, '品牌主色');
        Store.set('shared.brand.primary', d.id, '品牌主色');
        document.documentElement.style.setProperty('--brand', d.id);
        UI.toast('品牌主色已切换'); App.refresh();
      },
      publishTheme() { App.openPublish('主题与入口调整'); }
    }
  };

  /* --------------------------------------------------- 5 统一账号 */
  P['g-accounts'] = {
    app: 'all', papp: 'versionall', grp: 'accounts', title: '账号管理', sub: '一个手机号可在三端拥有不同身份',
    preview: 'student-home',
    state: { tab: 'staff' },
    render() {
      const tab = P['g-accounts'].state.tab;
      const members = Store.db.rbac.members;
      const stu = Store.db.versionall.accounts.filter((a) => a.role === 'student');
      if (tab === 'staff') {
        return K.head('账号管理', '员工账号 ' + members.length + ' 个 · 与角色权限联动',
          crossBadge('三端统一') + K.btn('新增账号', 'newMember', { icon: 'plus', cls: 'primary' })) +
          K.toolbar(K.seg([{ id: 'staff', label: '员工账号 ' + members.length }, { id: 'student', label: '学员账号 ' + stu.length }], tab, 'accTab'), K.search('搜索姓名 / 手机号', 'accSearch')) +
          K.panel({ flush: true, body: UI.table([
            { label: '账号', render: (m) => '<div class="cellflex">' + UI.avatar(m.name, '') + '<div><div class="strong">' + E(m.name) + '</div><div class="small muted">' + E(m.phone) + '</div></div></div>' },
            { label: '部门', render: (m) => '<span class="small">' + E(m.dept) + '</span>' },
            { label: '角色', render: (m) => m.roles.map((r) => { const role = Store.db.rbac.roles.find((x) => x.id === r); return UI.pill(role ? role.name : r, role && role.color !== 'grey' ? role.color : 'grey'); }).join(' ') },
            { label: '可管理端', render: (m) => '<span class="small mut">' + (m.roles.indexOf('hr') >= 0 ? '职工健康' : m.roles.indexOf('brand') >= 0 ? '品牌站 · 跨端内容' : '全部') + '</span>' },
            { label: '最近登录', render: (m) => '<span class="small tnum muted">' + E(m.last) + '</span>' },
            { label: '状态', render: (m) => m.status === 'active' ? UI.pill('启用', 'green') : UI.pill('已停用', 'grey') },
            { label: '', align: 'right', render: (m) => '<div class="rowact"><button data-act="editMember" data-id="' + m.id + '">' + I('edit', 14) + '</button></div>' }
          ], members.map((m) => Object.assign({ _id: m.id }, m))) });
      }
      return K.head('账号管理', '学员账号 ' + stu.length + ' 个 · 手机号即登录凭证',
        crossBadge('与减重营共用') + K.btn('导入学员', 'importStu', { icon: 'upload' })) +
        K.toolbar(K.seg([{ id: 'staff', label: '员工账号 ' + members.length }, { id: 'student', label: '学员账号 ' + stu.length }], tab, 'accTab'), K.search('搜索学员', 'accSearch')) +
        K.panel({ flush: true, body: UI.table([
          { label: '学员', render: (a) => '<div class="cellflex">' + UI.avatar(a.name, 'g') + '<div><div class="strong">' + E(a.name) + '</div><div class="small muted">' + E(a.phone) + '</div></div></div>' },
          { label: '身份', render: () => UI.pill('学员', 'grey') },
          { label: '所属营期', render: (a) => (a.campIds || []).map((c) => (Store.db.versionall.camps.find((x) => x.id === c) || {}).name || c).join('、') },
          { label: '最近登录', render: (a) => '<span class="small tnum muted">' + E(a.lastLogin) + '</span>' },
          { label: '状态', render: (a) => a.active ? UI.pill('启用', 'green') : UI.pill('已停用', 'grey') },
          { label: '', align: 'right', render: (a) => '<div class="rowact"><button data-act="editStu" data-id="' + a.id + '">' + I('edit', 14) + '</button></div>' }
        ], stu.map((a) => Object.assign({ _id: a.id }, a))) });
    },
    actions: {
      accTab(d) { P['g-accounts'].state.tab = d.id; App.refresh(); },
      accSearch() {},
      importStu() { UI.toast('请上传学员名单 xlsx'); },
      newMember() {
        UI.drawer({ title: '新增员工账号', sub: '账号需分配角色后才可见功能', icon: 'user',
          body: '<div class="formsec"><h4>基本信息</h4>' + UI.fInput({ label: '姓名', value: '' }) + UI.fInput({ label: '手机号', value: '' }) +
            UI.fInput({ label: '部门', value: '' }) + '</div><div class="formsec"><h4>角色</h4><div class="chips">' +
            Store.db.rbac.roles.filter((r) => r.id !== 'super').map((r) => '<span class="chip" data-r="' + r.id + '">' + E(r.name) + '</span>').join('') + '</div>' +
            '</div>' + UI.impact(['控制台可见功能与数据范围']),
          mount(n) { n.querySelectorAll('.chip[data-r]').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on'))); },
          onOk(n) {
            const roles = Array.from(n.querySelectorAll('.chip[data-r].on')).map((b) => b.dataset.r);
            const inp = n.querySelectorAll('.input');
            Store.pushItem('rbac.members', { id: 'm' + Date.now(), name: inp[0].value || '新成员', phone: inp[1].value || '—', dept: inp[2].value || '—', roles: roles.length ? roles : ['audit'], status: 'active', last: '从未登录' }, '新增账号');
            UI.toast('账号已创建'); App.refresh();
          } });
      },
      editMember(d) {
        const list = Store.db.rbac.members, m = list.find((x) => x.id === d.id), i = UI.ix(list, m);
        UI.drawer({ title: '编辑账号', sub: m.name + ' · ' + m.phone, icon: 'user',
          body: '<div class="formsec"><h4>基本信息</h4>' + UI.fInput({ label: '姓名', value: m.name, path: 'rbac.members.' + i + '.name' }) +
            UI.fInput({ label: '部门', value: m.dept, path: 'rbac.members.' + i + '.dept' }) +
            UI.fInput({ label: '手机号', value: m.phone, disabled: true }) + '</div>' +
            '<div class="formsec"><h4>角色</h4><div class="chips" data-role="r">' +
            Store.db.rbac.roles.map((r) => '<button class="chip ' + (m.roles.indexOf(r.id) >= 0 ? 'on' : '') + '" data-r="' + r.id + '">' + E(r.name) + '</button>').join('') +
            '</div><div class="hint">角色决定可见模块与可执行操作，可在「角色与权限」中调整。</div></div>' +
            '<div class="formsec"><h4>状态</h4>' + UI.fSwitch({ label: '启用账号', value: m.status === 'active', path: 'rbac.members.' + i + '.activeFlag' }) + '</div>' +
            UI.impact(['该账号登录后可见的功能范围']),
          mount(n) { n.querySelectorAll('[data-role="r"] .chip').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on'))); },
          onOk(n) {
            const roles = Array.from(n.querySelectorAll('[data-role="r"] .chip.on')).map((b) => b.dataset.r);
            Store.saveItem('rbac.members', { id: m.id, roles: roles }, 'id', '账号角色');
            UI.toast('账号已更新'); App.refresh();
          } });
      },
      editStu(d) { UI.toast('学员账号编辑'); }
    }
  };

  /* --------------------------------------------------- 6 角色与权限 */
  P['g-roles'] = {
    app: 'all', papp: 'pku', grp: 'roles', title: '角色与权限', sub: '按模块分配查看、编辑与发布权限',
    preview: 'pku-home',
    state: { role: 'ops' },
    render() {
      const rbac = Store.db.rbac;
      const gs = Store.db.shared.groups;
      const cur = rbac.roles.find((r) => r.id === P['g-roles'].state.role) || rbac.roles[1];
      const isAll = cur.perms === 'ALL';
      const lvl = (g) => isAll ? 3 : (cur.perms[g] || 0);
      return K.head('角色与权限', '共 ' + rbac.roles.length + ' 个角色 · ' + rbac.members.length + ' 名成员',
        '<button class="btn" data-act="previewRole">' + I('eye', 15) + '以该角色预览</button>' +
        K.btn('保存权限', 'savePerms', { icon: 'check', cls: 'primary' })) +
        '<div class="grid g-1-2" style="align-items:start">' +
          K.panel({ title: '角色', sub: '点击切换', flush: true,
            body: '<div style="padding:6px 12px 12px">' + rbac.roles.map((r) =>
              '<button class="listrow" style="width:100%;text-align:left;border-radius:9px;padding:10px 8px;' + (r.id === cur.id ? 'background:var(--brand-wash)' : '') + '" data-act="pickRole" data-id="' + r.id + '">' +
              '<div class="ava ' + (r.color === 'grey' ? 'a' : r.color === 'green' ? 'g' : r.color === 'violet' ? 'v' : '') + '" style="width:26px;height:26px;font-size:11px">' + E(r.name.slice(0, 1)) + '</div>' +
              '<div class="meta"><b>' + E(r.name) + (r.builtin ? ' <span class="small mut">内置</span>' : '') + '</b><span>' + memberCount(r.id) + ' 名成员</span></div>' +
              (r.id === rbac.current ? '<span class="pill blue" style="margin-left:auto">当前</span>' : '') + '</button>').join('') + '</div>' }) +
          '<div class="stack">' +
            K.panel({ title: cur.name, sub: cur.desc, actions: '<span class="small mut">' + (isAll ? '全部权限' : '按模块配置') + '</span>', flush: true,
              body: isAll
                ? '<div class="empty" style="padding:32px"><b>该角色拥有全部权限</b>内置超级管理员不可修改，如需差异化请复制为新角色</div>'
                : UI.table([
                  { label: '模块', render: (g) => '<b>' + E(g.label) + '</b><div class="small muted">' + E(g.key) + '</div>' },
                  { label: '范围', render: (g) => '<span class="small mut">' + (g.scope === 'all' ? '跨端' : APP[g.scope] || g.scope) + '</span>' },
                  { label: '查看', align: 'center', w: '64px', render: (g) => cell(cur.id, g.key, 1, lvl(g.key) >= 1) },
                  { label: '编辑', align: 'center', w: '64px', render: (g) => cell(cur.id, g.key, 2, lvl(g.key) >= 2) },
                  { label: '发布', align: 'center', w: '64px', render: (g) => cell(cur.id, g.key, 3, lvl(g.key) >= 3) }
                ], gs.map((g) => Object.assign({ _id: g.key }, g))) }) +
            K.panel({ title: '角色成员', sub: memberCount(cur.id) + ' 人', flush: true,
              body: '<div style="padding:4px 18px 12px">' + rbac.members.filter((m) => m.roles.indexOf(cur.id) >= 0).map((m) =>
                '<div class="listrow">' + UI.avatar(m.name, 'g') + '<div class="meta"><b>' + E(m.name) + '</b><span>' + E(m.dept) + ' · ' + E(m.phone) + '</span></div>' +
                '<span class="right">' + (m.status === 'active' ? UI.pill('启用', 'green') : UI.pill('停用', 'grey')) + '</span></div>').join('') +
              (rbac.members.filter((m) => m.roles.indexOf(cur.id) >= 0).length ? '' : '<div class="empty">暂无成员</div>') + '</div>' }) +
            K.panel({ title: '说明', body: '<div class="small mut" style="line-height:1.8">' +
              '· 查看：可进入页面与读取数据<br>· 编辑：可修改配置、执行操作<br>· 发布：可将变更推送到线上<br>· 「以该角色预览」会临时切换当前登录角色，用于验证权限差异。' +
              '</div><div class="note warn" style="margin-top:10px">权限变更需要重新登录才对新会话生效；当前会话会立即按新权限渲染菜单。</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      pickRole(d) { P['g-roles'].state.role = d.id; App.refresh(); },
      previewRole() { Store.setRole(P['g-roles'].state.role); UI.toast('已切换到该角色视角'); App.refresh(); },
      savePerms() { UI.toast('权限已保存'); App.refresh(); }
    }
  };

  function cell(roleId, group, level, checked) {
    return '<button class="pcell ' + (checked ? 'on' : '') + '" data-act="permToggle" data-role="' + roleId + '" data-g="' + group + '" data-l="' + level + '" ' +
      'style="width:22px;height:22px;border-radius:7px;border:1px solid ' + (checked ? '#0b63e5' : '#dbe4f0') + ';background:' + (checked ? '#0b63e5' : '#fff') + ';display:inline-grid;place-items:center;color:#fff">' +
      (checked ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3"><path d="m4 12 5 5L20 6"/></svg>' : '') + '</button>';
  }

  /* 权限矩阵点击：统一在这里处理，避免每个格子挂事件 */
  document.addEventListener('click', function (e) {
    const b = e.target.closest('[data-act="permToggle"]');
    if (!b) return;
    e.stopPropagation();
    const role = Store.db.rbac.roles.find((r) => r.id === b.dataset.role);
    if (!role || role.perms === 'ALL') return;
    const g = b.dataset.g, l = +b.dataset.l;
    const cur = role.perms[g] || 0;
    role.perms[g] = cur >= l ? l - 1 : l;
    Store.mark('rbac.roles', '权限调整');
    Store.persist();
    App.refresh();
  }, true);

  window.SHARED_NAV = [
    { group: '全局 · 跨端', items: [
      { id: 'g-brand', label: '品牌与主体', icon: 'spark' },
      { id: 'g-content', label: '跨端内容', icon: 'image' },
      { id: 'g-orgs', label: '服务机构', icon: 'hospital' },
      { id: 'g-theme', label: '主题与入口', icon: 'sliders' }
    ] },
    { group: '组织 · 权限', items: [
      { id: 'g-accounts', label: '账号管理', icon: 'users' },
      { id: 'g-roles', label: '角色与权限', icon: 'lock' }
    ] }
  ];
})();
