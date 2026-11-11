/* ============================================================================
   品牌站 · PKU-introduce 内容运营
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const B = () => Store.db.brand;

  const REGION = (id) => (B().regions.find((r) => r.id === id) || {}).name || '—';

  /* ------------------------------------------------------- 概览 */
  P['b-dashboard'] = {
    app: 'pku', title: '门户概览', sub: '北大医疗医疗服务网络 · 官网与移动端',
    preview: 'pku-home',
    render() {
      const b = B();
      return K.head('门户概览', '内容更新会同步到官网与品牌 H5，发布后 1 分钟内生效',
        K.btn('查看线上站点', 'visit', { icon: 'external' })) +
        K.kpis([
          { k: '接入机构', v: b.institutions.filter((i) => i.on).length, unit: '家', d: b.regions.length + ' 个地区', icon: 'hospital' },
          { k: '在册医师', v: '726', unit: '位', d: '专家 57 位 · 本月新增 4', icon: 'stethoscope' },
          { k: '开放科室', v: b.departments.filter((d) => d.on).length, unit: '个', d: '精选 ' + b.departments.filter((d) => d.featured).length + ' 个', icon: 'layers' },
          { k: '本月浏览', v: '12.4', unit: '万', d: '较上月 <b>+18%</b>', tone: 'up', icon: 'eye' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '分院网络分布', sub: '按地区', body: '<div style="padding:6px 0">' +
            b.regions.map((r) => {
              const n = b.institutions.filter((i) => i.region === r.id).length;
              return '<div style="margin-bottom:11px"><div class="row small" style="justify-content:space-between"><span>' + E(r.name) + '</span><span class="mut">' + n + ' 家</span></div>' +
                '<div class="progress" style="margin-top:5px"><b style="width:' + (n / 5 * 100) + '%;background:' + r.color + '"></b></div></div>';
            }).join('') + '</div>' }) +
          K.panel({ title: '院区服务状态', body: '<div class="stack" style="gap:10px">' +
            [['北京大学国际医院', '在营', 'green'], ['北大医疗康复医院', '在营', 'green'], ['北大医疗淄博医院', '在营', 'green'], ['北大医疗肿瘤医院', '内容待更新', 'amber']].map((x) =>
              '<div class="row small"><span class="pill ' + x[2] + '">' + x[1] + '</span><span>' + x[0] + '</span></div>').join('') +
            '</div><div class="hairline"></div><div class="note">4 个院区本月有科目或专家变更，建议同步更新。</div>' }) +
        '</div><div style="height:16px"></div>' +
        '<div class="grid g-3">' +
          K.panel({ title: '常用入口', body: '<div class="stack" style="gap:8px">' +
            [['首页内容', 'b-home', '编辑头部、入口卡与精选专家'], ['分院网络', 'b-hospitals', '机构增删与地区分布'], ['师资团队', 'b-team', '医师与专家资料']].map((x) =>
              '<div class="listrow" style="cursor:pointer;border-bottom:0;padding:7px 0" data-act="go" data-id="' + x[1] + '">' +
              '<div class="meta"><b>' + x[0] + '</b><span>' + x[2] + '</span></div><div class="right mut">' + I('chevron', 14) + '</div></div>').join('') +
            '</div>' }) +
          K.panel({ title: '最近更新', body: '<div class="stack" style="gap:0">' +
            [['师资团队', '6 位专家资料更新', '11-02'], ['首页内容', '首页 Hero 文案调整', '10-30'], ['分院网络', '深圳健管中心上线', '10-28']].map((x) =>
              '<div class="listrow"><div class="meta"><b>' + x[0] + '</b><span>' + x[1] + '</span></div><span class="right small mut">' + x[2] + '</span></div>').join('') +
            '</div>' }) +
          K.panel({ title: '内容完整度', body: '<div style="display:flex;gap:16px;align-items:center">' + UI.donut(86, '#0aa39a', 96) +
            '<div class="small mut" style="line-height:1.8">机构简介 11/11<br>科室简介 12/14<br>医师照片 20/20<br>院落地址 10/11</div></div>' })
        + '</div>';
    },
    actions: {
      go(d) { App.go(d.id); },
      visit() { window.open('https://baoweidong.github.io/PKU-introduce/', '_blank'); }
    }
  };

  /* ------------------------------------------------------- 首页内容 */
  P['b-home'] = {
    app: 'pku', title: '首页内容', sub: '首屏、服务入口、数字与精选专家',
    preview: 'pku-home',
    render() {
      Media.ensure();
      const h = B().home;
      const banners = (B().banners || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      return K.head('首页内容', '首屏文案与入口顺序会直接影响移动端首屏信息密度',
        K.btn('保存并发布', 'publishHome', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            K.panel({ title: '首屏轮播', sub: banners.length + ' 张 · 图片、标题、跳转与投放时间', flush: true,
              actions: K.btn('管理轮播', 'goBanners', { icon: 'image', cls: 'sm' }),
              body: '<div style="padding:8px 18px 12px">' + banners.map((b) =>
                '<div class="listrow"><div style="width:82px;height:46px;border-radius:8px;overflow:hidden;background:#eef3f9;flex:none">' +
                '<img src="' + E(b.image || '') + '" style="width:100%;height:100%;object-fit:cover" alt=""></div>' +
                '<div class="meta"><b>' + E(b.title) + '</b><span>' + E(b.sub) + ' · ' + E(b.link || '不跳转') + '</span></div>' +
                '<div class="right row" style="gap:7px"><span class="pill ' + (b.on === false ? 'grey' : 'green') + '">' + (b.on === false ? '未上线' : '投放中') + '</span>' +
                '<button class="switch ' + (b.on === false ? '' : 'on') + '" data-toggle="brand.banners.' + UI.ix(B().banners, B().banners.find((x) => x.id === b.id)) + '.on"></button></div></div>').join('') +
                '</div>' }) +
            K.panel({ title: '首屏', sub: 'Hero', body: '<div class="stack" style="gap:14px">' +
              UI.fInput({ label: '主标题', value: h.heroTitle, path: 'brand.home.heroTitle', hint: '建议 8–12 字，超出行末自动换行' }) +
              UI.fInput({ label: '副标题', value: h.heroSub, path: 'brand.home.heroSub' }) + '</div>' }) +
            K.panel({ title: '服务入口', sub: '开关决定是否出现在首页', flush: true,
              body: '<div style="padding:4px 18px 10px">' + h.entries.map((e, i) =>
                '<div class="listrow"><div style="width:22px;text-align:center" class="small mut tnum">' + e.order + '</div>' +
                '<div class="meta"><b>' + E(e.title) + '</b><span>' + E(e.sub) + '</span></div>' +
                '<div class="right row" style="gap:8px"><button class="iconbtn" data-act="moveEntry" data-id="' + e.id + '">' + I('up', 14) + '</button>' +
                '<button class="switch ' + (e.on ? 'on' : '') + '" data-toggle="brand.home.entries.' + i + '.on"></button></div></div>').join('') + '</div>' }) +
            K.panel({ title: '品牌墙', sub: '首页底部机构名列表', body: '<div class="chips">' +
              h.brandStrip.map((x) => '<span class="chip">' + E(x) + '</span>').join('') +
              '<span class="chip" style="border-style:dashed;color:var(--brand)">+ 添加</span></div>' +
              '<div class="note" style="margin-top:12px">品牌墙只展示名称，不展示院徽图片，避免与集团视觉冲突。</div>' }) +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '首页数字', sub: '四大指标', body: '<div class="stack" style="gap:12px">' +
              h.stats.map((s, i) => '<div class="row"><div style="width:56px" class="small mut">' + E(s.label) + '</div>' +
                '<input class="input tnum" value="' + s.value + '" data-set="brand.home.stats.' + i + '.value" data-kind="num"></div>').join('') + '</div>' }) +
            K.panel({ title: '精选专家', body: '<div class="stack" style="gap:12px">' +
              UI.fNum({ label: '首页展示人数', value: h.featuredCount, path: 'brand.home.featuredCount' }) +
              '<div class="note teal">取「师资团队」中标记为精选且在线的医师，按排序展示。当前有 ' + B().doctors.filter((d) => d.featured).length + ' 位可选。</div></div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      publishHome() { App.openPublish('首页内容更新'); },
      goBanners() { Media.ensure(); App.go('content-banners'); },
      moveEntry(d) {
        const list = B().home.entries, i = list.findIndex((x) => x.id === d.id);
        if (i <= 0) return;
        const t = list[i - 1]; list[i - 1] = list[i]; list[i] = t;
        list.forEach((x, k) => { x.order = k + 1; });
        Store.mark('brand.home.entries', '调整入口顺序'); UI.toast('顺序已调整'); App.refresh();
      }
    }
  };

  /* ------------------------------------------------------- 品牌页 */
  P['b-about'] = {
    app: 'pku', title: '品牌页', sub: '集团介绍、发展历程与关键数字',
    preview: 'pku-home',
    render() {
      const info = B().info;
      return K.head('品牌页', '关于北大医疗 · 官网 brand.html',
        K.btn('预览页面', 'preview', { icon: 'eye', cls: 'ghost' })) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '集团介绍', body: UI.fArea({ label: '正文', value: info.intro, rows: 4, path: 'brand.info.intro', hint: '建议 60–120 字，用于关于页首段' }) }) +
          K.panel({ title: '发展历程', sub: '按年份排序', flush: true,
            actions: K.btn('新增节点', 'addYear', { icon: 'plus', cls: 'sm' }),
            body: '<div style="padding:6px 18px 14px">' + info.timeline.map((t, i) =>
              '<div class="listrow"><div class="tnum strong" style="width:44px;color:var(--brand)">' + E(t.year) + '</div>' +
              '<div class="meta"><b>' + E(t.title) + '</b><span>' + E(t.desc) + '</span></div>' +
              '<button class="iconbtn right" data-act="editYear" data-id="' + i + '">' + I('edit', 14) + '</button></div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '关键数字', body: '<div class="stack" style="gap:12px">' +
            info.numbers.map((n, i) => '<div class="frow"><input class="input" value="' + E(n.label) + '" data-set="brand.info.numbers.' + i + '.label">' +
              '<input class="input tnum" value="' + E(n.value) + '" data-set="brand.info.numbers.' + i + '.value"></div>').join('') + '</div>' }) +
          K.panel({ title: '页面结构', body: '<div class="small mut" style="line-height:2">' +
            '① Hero 主视觉<br>② 一所医院，一座医疗城<br>③ 发展历程时间轴<br>④ 关键数字<br>⑤ 分院网络入口</div>' }) +
        '</div></div>';
    },
    actions: {
      preview() { App.openPreview(); },
      addYear() {
        UI.formDrawer({ title: '新增大事记', sub: '按年份展示在品牌页时间轴', icon: 'calendar',
          fields: [{ key: 'year', label: '年份', ph: '2027' }, { key: 'title', label: '标题' }, { key: 'desc', label: '说明', type: 'area', rows: 2 }],
          onSave(v) {
            B().info.timeline.push({ year: v.year || '2027', title: v.title || '新节点', desc: v.desc });
            B().info.timeline.sort((a, b) => a.year - b.year);
            Store.mark('brand.info.timeline', '新增历程'); UI.toast('已添加'); App.refresh();
          } });
      },
      editYear(d) { UI.toast('编辑 ' + B().info.timeline[+d.id].year + ' 年节点'); }
    }
  };

  /* ------------------------------------------------------- 分院网络 */
  P['b-hospitals'] = {
    app: 'pku', title: '分院网络', sub: '地区、机构类型与院区信息',
    preview: 'pku-hospitals',
    render() {
      const b = B();
      return K.head('分院网络', b.institutions.length + ' 家机构 · ' + b.regions.length + ' 个地区',
        K.btn('新增机构', 'newInst', { icon: 'plus', cls: 'primary' })) +
        '<div class="grid g-3" style="margin-bottom:16px">' + b.regions.map((r) =>
          '<div class="panel" style="padding:14px 16px">' +
            '<div class="row"><div style="width:8px;height:8px;border-radius:3px;background:' + r.color + '"></div><b style="font-size:13px">' + E(r.name) + '</b>' +
            '<span class="right small mut">' + b.institutions.filter((i) => i.region === r.id).length + ' 家</span></div>' +
            '<div class="small mut" style="margin-top:6px">' + E(r.city) + ' · ' + E(r.summary) + '</div></div>').join('') + '</div>' +
        K.panel({ flush: true, body: UI.table([
          { label: '机构', render: (i) => '<div class="cellflex"><div class="ava g" style="border-radius:9px">' + I('hospital', 14) + '</div><div><div class="strong">' + E(i.name) + '</div><div class="small muted">' + E(i.city) + '</div></div></div>' },
          { label: '地区', render: (i) => '<span class="small">' + E(REGION(i.region)) + '</span>' },
          { label: '类型', render: (i) => UI.pill({ general: '综合医院', rehab: '康复医院', specialty: '专科医院', center: '健康管理中心' }[i.type], 'grey') },
          { label: '等级', render: (i) => '<span class="small">' + E(i.level) + '</span>' },
          { label: '床位', align: 'right', render: (i) => '<span class="tnum">' + (i.beds || '—') + '</span>' },
          { label: '上线', render: (i) => '<button class="switch ' + (i.on ? 'on' : '') + '" data-toggle="brand.institutions.' + UI.ix(b.institutions, i) + '.on"></button>' },
          { label: '', align: 'right', render: (i) => '<div class="rowact"><button data-act="editInst" data-id="' + i.id + '">' + I('edit', 14) + '</button></div>' }
        ], b.institutions.map((i) => Object.assign({ _id: i.id }, i))) });
    },
    actions: {
      newInst() {
        UI.formDrawer({ title: '新增机构', sub: '保存后可在投放端中选择展示位置', icon: 'hospital',
          fields: [
            { key: 'name', label: '机构全称' }, { key: 'city', label: '城市', ph: '北京 · 昌平' },
            { key: 'region', label: '所属地区', type: 'select', options: B().regions.map((r) => ({ v: r.id, l: r.name })) },
            { key: 'type', label: '机构类型', type: 'select', options: [{ v: 'general', l: '综合医院' }, { v: 'rehab', l: '康复医院' }, { v: 'specialty', l: '专科医院' }, { v: 'center', l: '健康管理中心' }] },
            { key: 'level', label: '等级', ph: '三级综合' }, { key: 'beds', label: '开放床位', type: 'num', value: 0 }
          ],
          onSave(v) {
            Store.pushItem('brand.institutions', { id: 'i' + Date.now(), region: v.region, type: v.type, name: v.name || '新机构', short: v.name, city: v.city, beds: v.beds, level: v.level, open: '2027', tags: [], desc: '', on: true, platforms: ['brand'], bookable: false }, '新增机构');
            UI.toast('机构已创建'); App.refresh();
          } });
      },
      editInst(d) {
        const i = B().institutions.find((x) => x.id === d.id), idx = B().institutions.indexOf(i);
        UI.drawer({ title: '编辑机构', sub: i.name, icon: 'hospital',
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '机构全称', value: i.name, path: 'brand.institutions.' + idx + '.name' }) +
            UI.fInput({ label: '简称', value: i.short, path: 'brand.institutions.' + idx + '.short' }) +
            '<div class="frow">' + UI.fSelect({ label: '所属地区', value: i.region, options: B().regions.map((r) => ({ v: r.id, l: r.name })), path: 'brand.institutions.' + idx + '.region' }) +
            UI.fInput({ label: '城市', value: i.city, path: 'brand.institutions.' + idx + '.city' }) + '</div>' +
            UI.fSelect({ label: '机构类型', value: i.type, options: [{ v: 'general', l: '综合医院' }, { v: 'rehab', l: '康复医院' }, { v: 'specialty', l: '专科医院' }, { v: 'center', l: '健康管理中心' }], path: 'brand.institutions.' + idx + '.type' }) +
            '</div><div class="formsec"><h4>规模</h4><div class="frow">' +
            UI.fInput({ label: '等级', value: i.level, path: 'brand.institutions.' + idx + '.level' }) +
            UI.fInput({ label: '开放床位', value: i.beds, kind: 'num', path: 'brand.institutions.' + idx + '.beds' }) + '</div>' +
            UI.fArea({ label: '简介', value: i.desc, rows: 2, path: 'brand.institutions.' + idx + '.desc' }) +
            '</div><div class="formsec"><h4>上线</h4>' + UI.fSwitch({ label: '在官网展示', value: i.on, path: 'brand.institutions.' + idx + '.on', hint: '关闭后地区计数同步减少' }) + '</div>',
          onOk() { UI.toast('机构已保存'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------- 科室 */
  P['b-departments'] = {
    app: 'pku', title: '学科与科室', sub: '科室简介、特色技术与关联医师',
    preview: 'pku-hospitals',
    render() {
      const list = B().departments;
      return K.head('学科与科室', list.length + ' 个科室 · 精选 ' + list.filter((d) => d.featured).length,
        K.btn('新增科室', 'newDep', { icon: 'plus', cls: 'primary' })) +
        K.toolbar(K.seg([{ id: 'all', label: '全部' }, { id: '内科', label: '内科' }, { id: '外科', label: '外科' }, { id: '妇儿', label: '妇儿' }, { id: '专科', label: '专科' }], 'all', 'depFilter'), K.search('搜索科室', 'depSearch')) +
        K.panel({ flush: true, body: UI.table([
          { label: '科室', render: (d) => '<div class="cellflex"><div class="ava" style="border-radius:9px">' + E(d.name.slice(0, 1)) + '</div><div><div class="strong">' + E(d.name) + '</div><div class="small muted">' + E(d.features[0] || '') + '</div></div></div>' },
          { label: '分类', render: (d) => UI.pill(d.cat, 'grey') },
          { label: '医师', align: 'right', render: (d) => '<span class="tnum">' + d.doctors + '</span>' },
          { label: '精选', render: (d) => d.featured ? UI.pill('首页露出', 'blue') : '<span class="muted">—</span>' },
          { label: '状态', render: (d) => d.on ? UI.pill('已上线', 'green') : UI.pill('已下线', 'grey') },
          { label: '', align: 'right', render: (d) => '<div class="rowact"><button data-act="editDep" data-id="' + d.id + '">' + I('edit', 14) + '</button></div>' }
        ], list.map((d) => Object.assign({ _id: d.id }, d))) });
    },
    actions: {
      newDep() {
        UI.formDrawer({ title: '新增科室', sub: '保存后出现在科室列表', icon: 'layers',
          fields: [
            { key: 'name', label: '科室名称' },
            { key: 'cat', label: '分类', type: 'select', options: ['内科', '外科', '妇儿', '五官', '专科', '医技'] },
            { key: 'doctors', label: '医师人数', type: 'num', value: 0 },
            { key: 'intro', label: '科室简介', type: 'area', rows: 3 }
          ],
          onSave(v) {
            Store.pushItem('brand.departments', { id: 'dep' + Date.now(), cat: v.cat, name: v.name || '新科室', on: true, featured: false, doctors: v.doctors, intro: v.intro, features: [] }, '新增科室');
            UI.toast('科室已创建'); App.refresh();
          } });
      },
      depFilter(d) { UI.toast('筛选：' + (d.id === 'all' ? '全部' : d.id)); },
      editDep(d) {
        const x = B().departments.find((y) => y.id === d.id), i = B().departments.indexOf(x);
        UI.drawer({ title: '编辑科室', sub: x.name, icon: 'layers',
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '科室名称', value: x.name, path: 'brand.departments.' + i + '.name' }) +
            UI.fSelect({ label: '分类', value: x.cat, options: ['内科', '外科', '妇儿', '五官', '专科', '医技'], path: 'brand.departments.' + i + '.cat' }) +
            UI.fArea({ label: '科室简介', value: x.intro, rows: 4, path: 'brand.departments.' + i + '.intro' }) +
            '</div><div class="formsec"><h4>特色方向</h4>' +
            x.features.map((f, k) => '<input class="input" value="' + E(f) + '" data-set="brand.departments.' + i + '.features.' + k + '">').join('') +
            '</div><div class="formsec"><h4>展示</h4>' +
            UI.fSwitch({ label: '在科室列表展示', value: x.on, path: 'brand.departments.' + i + '.on' }) +
            UI.fSwitch({ label: '首页精选', value: x.featured, path: 'brand.departments.' + i + '.featured' }) +
            '</div>',
          onOk() { UI.toast('科室已保存'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------- 师资 */
  P['b-team'] = {
    app: 'pku', title: '师资团队', sub: '医师、专家与运营团队',
    preview: 'pku-team',
    state: { tab: 'all' },
    render() {
      const list = B().doctors;
      const tab = P['b-team'].state.tab;
      const rows = list.filter((d) => tab === 'all' ? true : tab === 'expert' ? d.expert : tab === 'doctor' ? !d.expert : false);
      return K.head('师资团队', '共 ' + list.length + ' 位 · 精选 ' + list.filter((d) => d.featured).length + ' 位',
        K.btn('新增成员', 'newDoc', { icon: 'plus', cls: 'primary' })) +
        K.tabs([{ id: 'all', label: '全部', n: list.length }, { id: 'doctor', label: '医师', n: list.filter((d) => !d.expert).length }, { id: 'expert', label: '专家', n: list.filter((d) => d.expert).length }, { id: 'ops', label: '运营', n: 0 }], tab, 'teamTab') +
        K.panel({ flush: true, body: UI.table([
          { label: '成员', render: (d) => '<div class="cellflex">' + UI.avatar(d.name, d.expert ? '' : 'g') + '<div><div class="strong">' + E(d.name) + (d.expert ? ' ' + UI.pill('专家', 'blue') : '') + '</div><div class="small muted">' + E(d.title) + '</div></div></div>' },
          { label: '科室', render: (d) => E(d.dept) },
          { label: '所属医院', render: (d) => '<span class="small">' + E(d.hospital) + '</span>' },
          { label: '擅长', render: (d) => '<span class="small muted">' + E(d.specialty).slice(0, 26) + '…</span>' },
          { label: '首页', render: (d) => '<button class="switch ' + (d.featured ? 'on' : '') + '" data-toggle="brand.doctors.' + UI.ix(list, d) + '.featured"></button>' },
          { label: '在线', render: (d) => '<button class="switch ' + (d.on ? 'on' : '') + '" data-toggle="brand.doctors.' + UI.ix(list, d) + '.on"></button>' },
          { label: '', align: 'right', render: (d) => '<div class="rowact"><button data-act="editDoc" data-id="' + d.id + '">' + I('edit', 14) + '</button></div>' }
        ], rows.map((d) => Object.assign({ _id: d.id }, d))) });
    },
    actions: {
      teamTab(d) { P['b-team'].state.tab = d.id; App.refresh(); },
      newDoc() {
        UI.formDrawer({ title: '新增团队成员', sub: '可标注专家与首页精选', icon: 'user',
          fields: [
            { key: 'name', label: '姓名' }, { key: 'title', label: '职称', ph: '主任医师' },
            { key: 'dept', label: '科室' }, { key: 'hospital', label: '所属医院' },
            { key: 'specialty', label: '擅长领域', type: 'area', rows: 2 },
            { key: 'expert', label: '标注为专家', type: 'bool', value: false },
            { key: 'featured', label: '首页精选', type: 'bool', value: false }
          ],
          onSave(v) {
            Store.pushItem('brand.doctors', { id: 'doc' + Date.now(), name: v.name || '新成员', title: v.title, dept: v.dept, hospital: v.hospital, expert: v.expert, featured: v.featured, on: true, tags: [], specialty: v.specialty, photo: '' }, '新增成员');
            UI.toast('成员已创建'); App.refresh();
          } });
      },
      editDoc(d) {
        const x = B().doctors.find((y) => y.id === d.id), i = B().doctors.indexOf(x);
        UI.drawer({ title: '编辑成员', sub: x.name + ' · ' + x.title, icon: 'user',
          body: '<div class="row" style="gap:14px;margin-bottom:6px">' + UI.avatar(x.name, '') +
            '<div class="small mut">照片、职称与科室会同步到官网详情页与首页精选卡。</div></div>' +
            '<div class="formsec"><h4>资料</h4>' +
            UI.fInput({ label: '姓名', value: x.name, path: 'brand.doctors.' + i + '.name' }) +
            '<div class="frow">' + UI.fInput({ label: '职称', value: x.title, path: 'brand.doctors.' + i + '.title' }) +
            UI.fInput({ label: '科室', value: x.dept, path: 'brand.doctors.' + i + '.dept' }) + '</div>' +
            UI.fInput({ label: '所属医院', value: x.hospital, path: 'brand.doctors.' + i + '.hospital' }) +
            UI.fArea({ label: '擅长领域', value: x.specialty, rows: 3, path: 'brand.doctors.' + i + '.specialty' }) +
            '</div><div class="formsec"><h4>展示</h4>' +
            UI.fSwitch({ label: '专家标注', value: x.expert, path: 'brand.doctors.' + i + '.expert' }) +
            UI.fSwitch({ label: '首页精选', value: x.featured, path: 'brand.doctors.' + i + '.featured' }) +
            UI.fSwitch({ label: '对外展示', value: x.on, path: 'brand.doctors.' + i + '.on' }) +
            '</div>',
          onOk() { UI.toast('成员资料已保存'); App.refresh(); } });
      }
    }
  };

  /* ------------------------------------------------------- 健康营 */
  P['b-camp'] = {
    app: 'pku', title: '健康营展示页', sub: '品牌站上的项目页，与减重营的运营数据同源',
    preview: 'pku-camp',
    render() {
      Media.ensure();
      const c = B().camp;
      if (!c.cover) c.cover = (window.IMG || {}).f5;
      return K.head('健康营展示页', c.edition + ' · ' + c.status + ' · 第 ' + c.day + '/' + c.totalDays + ' 天',
        K.btn('同步运营数据', 'sync', { icon: 'refresh' }) + K.btn('发布', 'publishCamp', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '项目主图', sub: '展示在健康营页面顶部与分享卡片', body:
            '<div style="height:190px;border-radius:13px;overflow:hidden;background:#eef5ff;position:relative">' +
            (c.cover ? '<img src="' + E(c.cover) + '"style="width:100%;height:100%;object-fit:cover" alt="">' : '') +
            '<button class="btn sm" data-act="campCover" style="position:absolute;right:10px;bottom:10px">' + I('upload', 12) + '更换主图</button></div>' +
            '<div class="note" style="margin-top:9px">建议使用营期现场、团队或训练场景横图；与「轮播与开屏」共用素材库。</div>' }) +
          K.panel({ title: '营期信息', body: '<div class="stack" style="gap:14px">' +
            UI.fInput({ label: '项目名称', value: c.name, path: 'brand.camp.name' }) +
            '<div class="frow">' + UI.fInput({ label: '期数', value: c.edition, path: 'brand.camp.edition' }) +
            UI.fSelect({ label: '状态', value: c.statusKey, options: [{ v: 'live', l: '进行中' }, { v: 'soon', l: '招募中' }, { v: 'end', l: '已结营' }], path: 'brand.camp.statusKey' }) + '</div>' +
            UI.fInput({ label: '主题', value: c.theme, path: 'brand.camp.theme' }) +
            '<div class="frow">' + UI.fInput({ label: '开营', value: c.start, path: 'brand.camp.start' }) +
            UI.fInput({ label: '结营', value: c.end, path: 'brand.camp.end' }) + '</div>' +
            UI.fArea({ label: '项目简介', value: c.summary, rows: 3, path: 'brand.camp.summary' }) +
            '</div>' }) +
          K.panel({ title: '项目团队', sub: c.roster.length + ' 人', flush: true,
            actions: K.btn('添加成员', 'addRoster', { icon: 'plus', cls: 'sm' }),
            body: UI.table([
              { label: '姓名', render: (r) => '<b>' + E(r.name) + '</b>' },
              { label: '角色', render: (r) => UI.pill(r.role, 'blue') },
              { label: '所属医院', render: (r) => '<span class="small mut">' + E(r.hospital) + '</span>' }
            ], c.roster.map((r) => Object.assign({ _id: r.id }, r))) }) +
        '</div><div class="stack">' +
          K.panel({ title: '双项目结构', sub: '康复医院减重营 × 国际医院健康营（两个独立项目）', body:
            '<div class="stack" style="gap:10px">' + (c.projects || []).map((p) =>
              '<div style="padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:#fff">' +
              '<div class="row" style="gap:8px"><b style="font-size:12.5px">' + E(p.name) + '</b><span class="pill ' + (p.status.indexOf('在营') >= 0 ? 'green' : 'amber') + '">' + E(p.status) + '</span></div>' +
              '<div class="small mut" style="margin-top:5px">' + E(p.legal) + '</div>' +
              '<div class="small" style="margin-top:5px;line-height:1.6">' + E(p.scope) + '</div>' +
              '<div class="note" style="margin-top:7px;font-size:11px">' + E(p.note) + '</div></div>').join('') + '</div>' }) +
          K.panel({ title: '四大亮点', body: '<div class="stack" style="gap:10px">' + c.highlights.map((h, i) =>
            '<div class="frow"><input class="input" value="' + E(h.label) + '" data-set="brand.camp.highlights.' + i + '.label">' +
            '<input class="input" value="' + E(h.value) + '" data-set="brand.camp.highlights.' + i + '.value"></div>').join('') + '</div>' }) +
          K.panel({ title: '角色说明', body: '<div class="stack" style="gap:10px">' + c.roles.map((r) =>
            '<div><div class="row"><b style="font-size:12.5px">' + E(r.name) + '</b></div><div class="small mut" style="margin-top:2px">' + E(r.desc) + '</div></div>').join('') + '</div>' }) +
        '</div></div>';
    },
    actions: {
      sync() { UI.toast('已从减重营同步营期进度'); },
      campCover() { Media.pick((url) => { Store.set('brand.camp.cover', url, '健康营主图'); App.refresh(); }, { title: '选择健康营主图', tag: '内容' }); },
      publishCamp() { App.openPublish('健康营展示页更新'); },
      addRoster() { UI.toast('添加成员'); }
    }
  };

  /* ------------------------------------------------------- 站点设置 */
  P['b-site'] = {
    app: 'pku', title: '站点设置', sub: '导航、SEO、分享与品牌色',
    preview: 'pku-home',
    render() {
      const s = B().site;
      return K.head('站点设置', '影响官网与移动端 H5 的全局配置',
        K.btn('保存', 'saveSite', { icon: 'check', cls: 'primary' })) +
        '<div class="grid g-2">' +
          K.panel({ title: '导航', sub: '顺序即展示顺序', flush: true,
            body: '<div style="padding:4px 18px 12px">' + s.nav.map((n, i) =>
              '<div class="listrow"><div class="meta"><b>' + E(n.label) + '</b><span>' + E(n.path) + '</span></div>' +
              '<div class="right row" style="gap:8px"><button class="switch ' + (n.on ? 'on' : '') + '" data-toggle="brand.site.nav.' + i + '.on"></button></div></div>').join('') + '</div>' }) +
          K.panel({ title: 'SEO 与分享', body: '<div class="stack" style="gap:14px">' +
            UI.fInput({ label: '页面标题', value: s.seoTitle, path: 'brand.site.seoTitle' }) +
            UI.fArea({ label: '页面描述', value: s.seoDesc, rows: 3, path: 'brand.site.seoDesc' }) +
            UI.fInput({ label: '分享标题', value: s.shareTitle, path: 'brand.site.shareTitle' }) +
            '</div>' }) +
          K.panel({ title: '品牌色', body: '<div class="small mut" style="line-height:1.8">品牌色已上收到「全局 · 主题与入口」，三端共用一处设定，避免各端漂移。</div>' +
            '<div style="margin-top:12px"><button class="btn" data-act="goTheme">' + I('sliders', 15) + '前往主题与入口</button></div>' }) +
          K.panel({ title: '页脚', body: '<div class="stack" style="gap:14px">' +
            UI.fInput({ label: '版权信息', value: s.footer, path: 'brand.site.footer' }) + '</div>' })
        + '</div>';
    },
    actions: {
      saveSite() { UI.toast('站点设置已保存'); },
      goTheme() { App.go('g-theme'); }
    }
  };

  window.NAV.pku = [
    { group: '', items: [{ id: 'b-dashboard', label: '门户概览', icon: 'grid' }] },
    { group: '页面内容', items: [
      { id: 'b-home', label: '首页内容', icon: 'layout' },
      { id: 'b-about', label: '品牌页', icon: 'file' },
      { id: 'b-hospitals', label: '分院网络', icon: 'hospital' },
      { id: 'b-departments', label: '学科与科室', icon: 'layers' },
      { id: 'b-team', label: '师资团队', icon: 'stethoscope', count: 726 },
      { id: 'b-camp', label: '健康营展示页', icon: 'spark' }
    ] },
    { group: '站点', items: [
      { id: 'b-site', label: '站点设置', icon: 'settings' }
    ] }
  ];
})();
