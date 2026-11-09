/* ============================================================================
   内容配置深化：轮播与开屏 / 图片素材库
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const today = '2026-11-08';

  const SITES = [
    { id: 'employee', name: '职工健康首页', short: '职工端', get: () => Store.db.employee.banners, path: 'employee.banners', ratio: '750 × 340', max: 5 },
    { id: 'brand', name: '品牌站首页', short: '品牌站', get: () => Store.db.brand.banners, path: 'brand.banners', ratio: '750 × 420', max: 3 },
    { id: 'versionall', name: '减重营活动页', short: '减重营', get: () => Store.db.versionall.banners, path: 'versionall.banners', ratio: '750 × 300', max: 4 }
  ];
  const siteOf = (id) => SITES.find((s) => s.id === id) || SITES[0];

  const LINK_TYPES = [
    { v: 'service', l: '服务详情（职工端）' },
    { v: 'article', l: '文章 / 科普' },
    { v: 'qa', l: '健康问答' },
    { v: 'page', l: 'H5 页面' },
    { v: 'external', l: '外部链接' },
    { v: 'none', l: '不跳转' }
  ];
  const linkName = (t, v) => {
    const m = LINK_TYPES.find((x) => x.v === t);
    return (m ? m.l.replace(/（.*?）/, '') : '跳转') + (v ? ' · ' + v : '');
  };

  function field(o) {
    const k = ' data-k="' + o.k + '"';
    return '<div class="field"><label>' + E(o.label) + (o.opt ? ' <em>选填</em>' : '') + '</label>' +
      (o.type === 'select' ? '<select class="select" ' + k + '>' + o.options.map((x) =>
        '<option value="' + E(x.v) + '"' + (String(o.value) === String(x.v) ? ' selected' : '') + '>' + E(x.l) + '</option>').join('') + '</select>'
        : o.type === 'area' ? '<textarea class="input" rows="' + (o.rows || 2) + '" ' + k + ' placeholder="' + E(o.ph || '') + '">' + E(o.value || '') + '</textarea>'
        : '<input class="input" ' + (o.type === 'date' ? 'type="date"' : '') + ' ' + k + ' value="' + E(o.value == null ? '' : o.value) + '" placeholder="' + E(o.ph || '') + '">') +
      (o.hint ? '<div class="hint">' + E(o.hint) + '</div>' : '') + '</div>';
  }

  function saveBanner(site, rec, isNew) {
    const list = site.get();
    if (isNew) list.unshift(rec);
    else {
      const i = list.findIndex((x) => x.id === rec.id);
      if (i >= 0) list[i] = rec; else list.unshift(rec);
    }
    Store.mark(site.path, (isNew ? '新增轮播：' : '编辑轮播：') + rec.title);
    Store.persist();
    UI.toast(isNew ? '轮播已创建，待发布' : '轮播已保存，待发布');
    App.refresh();
  }

  function openBanner(b, site) {
    const isNew = !b.id;
    let img = b.image || '';
    let on = b.on !== false;
    UI.drawer({
      title: isNew ? '新增轮播' : '编辑轮播',
      sub: site.name + ' · 建议尺寸 ' + site.ratio,
      icon: 'image', width: 660, okText: isNew ? '创建并加入投放' : '保存',
      body:
        '<div class="gsection"><h4>轮播图片</h4>' +
          '<div class="bn-edit-img"><img id="bn-img" src="' + E(img || '') + '" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:12px;background:#eef3f9;display:block">' +
            '<div class="row" style="margin-top:8px;gap:8px"><button class="btn" data-bn-pick>' + I('upload', 14) + '上传 / 换图</button>' +
            '<span class="small mut">建议 ' + site.ratio + '，不超过 2MB；上传后进入图片素材库</span></div></div>' +
          '<div class="hint">图片上方会被标题文字压住，主体内容尽量放在中间偏下。</div></div>' +
        '<div class="gsection"><h4>文案</h4>' +
          field({ k: 'title', label: '主标题', value: b.title, ph: '如 年度体检预约开启' }) +
          field({ k: 'sub', label: '副标题', value: b.sub, ph: '如 11 月 30 日前完成，享检后报告解读' }) + '</div>' +
        '<div class="gsection"><h4>点击后去哪</h4>' +
          field({ k: 'linkType', label: '跳转类型', type: 'select', value: b.linkType || 'service', options: LINK_TYPES }) +
          field({ k: 'link', label: '跳转目标', value: b.link, ph: '服务 ID / 文章 ID / 页面文件名 / https 链接', hint: '职工端服务填服务 ID；品牌站页面填 team.html、camp.html 等' }) + '</div>' +
        '<div class="gsection"><h4>投放设置</h4>' +
          '<div class="grid g-2" style="gap:10px">' + field({ k: 'start', label: '开始日期', type: 'date', value: b.start || today }) +
          field({ k: 'end', label: '结束日期', type: 'date', value: b.end || '2026-12-31' }) + '</div>' +
          '<div class="grid g-2" style="gap:10px">' + field({ k: 'interval', label: '自动播放间隔（秒）', value: b.interval || 5 }) +
          field({ k: 'order', label: '排序', value: b.order || 1, hint: '数字越小越靠前' }) + '</div>' +
          '<div class="row" style="justify-content:space-between;padding:9px 0"><div><div style="font-size:12.5px">立即上线</div><div class="hint">关闭后保存为草稿，不出现在 H5</div></div>' +
          '<button class="switch ' + (on ? 'on' : '') + '" data-bn-on></button></div></div>',
      mount(n) {
        n.querySelector('[data-bn-pick]').addEventListener('click', () => {
          Media.pick((url) => {
            img = url;
            const el = n.querySelector('#bn-img');
            if (el) el.src = url;
          }, { tag: '内容' });
        });
        const sw = n.querySelector('[data-bn-on]');
        sw.addEventListener('click', () => { on = !on; sw.classList.toggle('on', on); });
      },
      onOk(n) {
        const val = (k) => { const el = n.querySelector('[data-k="' + k + '"]'); return el ? el.value.trim() : ''; };
        if (!img) { UI.toast('请先上传轮播图片', 'warn'); return false; }
        if (!val('title')) { UI.toast('请填写主标题', 'warn'); return false; }
        const rec = Object.assign({}, b, {
          id: b.id || 'bn' + Date.now(),
          image: img, title: val('title'), sub: val('sub'),
          linkType: val('linkType'), link: val('link'),
          start: val('start'), end: val('end'),
          interval: Number(val('interval') || 5), order: Number(val('order') || 1),
          on: on
        });
        saveBanner(site, rec, isNew);
      }
    });
  }

  P['content-banners'] = {
    app: 'all', grp: 'growth', papp: 'employee', title: '轮播与开屏', sub: '三个 H5 的首屏图片、文案、跳转与投放时间',
    preview: 'emp-home',
    state: { site: 'employee' },
    render() {
      Media.ensure();
      const st = P['content-banners'].state;
      const site = siteOf(st.site);
      const list = site.get().slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      const on = list.filter((b) => b.on !== false);
      const live = on.filter((b) => (!b.start || b.start <= today) && (!b.end || b.end >= today));
      const noImg = list.filter((b) => !b.image);
      const first = live[0] || list[0];
      return K.head('轮播与开屏', '这里改的是用户打开 H5 第一眼看到的大图：图片、标题、点击去向、什么时候上线',
        K.btn('预览投放', 'bnPreview', { icon: 'eye' }) +
        K.btn('新增轮播', 'bnNew', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '当前站点轮播', v: list.length, unit: '条', d: site.name, icon: 'image' },
          { k: '投放中', v: live.length, unit: '条', d: '按日期自动判断', icon: 'clock', tone: live.length ? 'up' : 'down' },
          { k: '素材缺失', v: noImg.length, unit: '条', d: noImg.length ? '未上传图片不会展示' : '全部有图', icon: 'upload', tone: noImg.length ? 'down' : 'up' },
          { k: '建议上限', v: site.max, unit: '条', d: '超过 5 条用户很难看完', icon: 'layout' }
        ]) +
        K.toolbar(K.seg(SITES.map((s) => ({ id: s.id, label: s.short })), st.site, 'bnSite'),
          '<span class="small mut">图片建议 ' + site.ratio + ' · 自动播放 ' + ((first && first.interval) || 5) + ' 秒/张</span>') +
        '<div class="bn-grid"><div class="stack">' +
          K.panel({ title: '轮播列表', sub: '拖动排序暂未开放，用上下箭头调整', flush: true, body:
            list.length ? '<div class="bn-list" style="padding:12px 14px">' + list.map((b, i) =>
            '<div class="bn-card ' + (b.on === false ? 'off' : '') + '" data-act="bnEdit" data-id="' + b.id + '">' +
              '<div class="bn-thumb"><img src="' + E(b.image || '') + '" alt=""><span class="n">' + (b.order || i + 1) + '</span></div>' +
              '<div class="bn-info"><b>' + E(b.title) + '</b><span>' + E(b.sub || '未填副标题') + '</span>' +
                '<div class="bn-meta"><span class="pill ' + (b.on === false ? 'grey' : 'green') + '">' + (b.on === false ? '未上线' : '投放中') + '</span>' +
                '<span class="pill grey">' + E(linkName(b.linkType, b.link)) + '</span>' +
                '<span class="pill grey">' + E((b.start || '—') + ' 至 ' + (b.end || '—')) + '</span></div></div>' +
              '<div class="bn-act">' +
                '<button class="iconbtn" data-act="bnUp" data-id="' + b.id + '" title="上移">' + I('up', 13) + '</button>' +
                '<button class="iconbtn" data-act="bnDown" data-id="' + b.id + '" title="下移">' + I('down', 13) + '</button>' +
                '<button class="iconbtn" data-act="bnEdit" data-id="' + b.id + '" title="编辑">' + I('edit', 13) + '</button>' +
                '<button class="iconbtn" data-act="bnDel" data-id="' + b.id + '" title="删除">' + I('trash', 13) + '</button>' +
                '<button class="switch ' + (b.on === false ? '' : 'on') + '" data-toggle="' + site.path + '.' + UI.ix(site.get(), b) + '.on"></button>' +
              '</div></div>').join('') + '</div>' : K.empty('这个站点还没有轮播', '点右上角「新增轮播」上传第一张图') }) +
        '</div><div class="bn-preview">' +
          K.panel({ title: 'H5 首屏预览', sub: site.name, body:
            '<div class="bn-phone"><div class="bn-screen">' +
              (first ? '<div class="bn-slide"><img src="' + E(first.image) + '" alt=""><div class="bn-slide-t"><b>' + E(first.title) + '</b><span>' + E(first.sub || '') + '</span></div></div>' : '') +
              '<div class="bn-dots">' + list.map((b, i) => '<i class="' + (i === 0 ? 'on' : '') + '"></i>').join('') + '</div>' +
              '<div class="bn-body">' +
                '<div class="bn-mod"><i>' + I('stethoscope', 13) + '</i>年度体检 · 报告解读</div>' +
                '<div class="bn-mod"><i>' + I('heart', 13) + '</i>五好生活 · 今日任务</div>' +
                '<div class="bn-mod"><i>' + I('calendar', 13) + '</i>我的预约 · 待确认</div>' +
              '</div></div></div>' +
            '<div class="note" style="margin-top:12px">预览只展示第一张投放中的图；真实 H5 按排序轮播。</div>' }) +
        '</div></div>';
    },
    actions: {
      bnSite(d) { P['content-banners'].state.site = d.id; App.refresh(); },
      bnNew() { openBanner({ on: true, 'linkType': 'service', interval: 5, start: today, end: '2026-12-31' }, siteOf(P['content-banners'].state.site)); },
      bnEdit(d) {
        const site = siteOf(P['content-banners'].state.site);
        const b = site.get().find((x) => x.id === d.id);
        if (b) openBanner(b, site);
      },
      bnDel(d) {
        const site = siteOf(P['content-banners'].state.site);
        const b = site.get().find((x) => x.id === d.id);
        UI.confirm({ title: '删除这条轮播？', desc: (b ? b.title : '') + ' · 删除后 H5 不再展示', danger: true, okText: '删除' }).then((ok) => {
          if (!ok) return;
          Store.removeItem(site.path, d.id, 'id', '删除轮播');
          App.refresh();
        });
      },
      bnUp(d) { moveBanner(d.id, -1); },
      bnDown(d) { moveBanner(d.id, 1); },
      bnPreview() { App.openPreview(); }
    }
  };

  function moveBanner(id, step) {
    const site = siteOf(P['content-banners'].state.site);
    const list = site.get();
    const i = list.findIndex((x) => x.id === id);
    const j = i + step;
    if (i < 0 || j < 0 || j >= list.length) return;
    const t = list[i]; list[i] = list[j]; list[j] = t;
    list.forEach((x, k) => { x.order = k + 1; });
    Store.mark(site.path, '调整轮播顺序');
    Store.persist();
    App.refresh();
  }

  /* ================================================================ 素材库 */
  P['media-lib'] = {
    app: 'all', grp: 'shared', papp: 'employee', title: '图片素材库', sub: '上传一次，商品、轮播、文章共用',
    state: { tag: '全部' },
    render() {
      Media.ensure();
      const st = P['media-lib'].state;
      const all = Media.list();
      const tags = ['全部'].concat(Array.from(new Set(all.map((m) => m.tag))));
      const list = st.tag === '全部' ? all : all.filter((m) => m.tag === st.tag);
      return K.head('图片素材库', '商品主图、详情图、轮播图、文章封面都在这里；上传后自动压缩，配置时直接选',
        K.btn('上传图片', 'mUpload', { icon: 'upload', cls: 'primary' })) +
        K.kpis([
          { k: '素材总数', v: all.length, unit: '张', d: '共享给三端', icon: 'image' },
          { k: '商品图', v: all.filter((m) => m.tag === '商品').length, unit: '张', d: '商品详情与商城', icon: 'package' },
          { k: '内容图', v: all.filter((m) => m.tag === '内容').length, unit: '张', d: '轮播 / 封面', icon: 'layout' },
          { k: '本次上传', v: all.filter((m) => m.tag === '上传').length, unit: '张', d: '自动压缩到 1440px', icon: 'upload' }
        ]) +
        K.toolbar(K.tabs(tags.map((t) => ({ id: t, label: t, n: t === '全部' ? all.length : all.filter((m) => m.tag === t).length })), st.tag, 'mTag'),
          '<span class="small mut">' + list.length + ' 张 · 点击卡片可改名、换图、复制链接</span>') +
        '<div class="media-grid">' + list.map((m) =>
          '<button class="media-card" data-act="mOpen" data-id="' + m.id + '">' +
            '<img src="' + E(m.url) + '" alt="' + E(m.name) + '">' +
            '<div class="media-card-b"><b>' + E(m.name) + '</b><span>' + E(m.tag) + ' · ' + E(m.size || '—') + '</span></div>' +
          '</button>').join('') +
          '<button class="media-card media-add" data-act="mUpload">' + I('plus', 24) + '<span>上传新图片</span></button>' +
        '</div>';
    },
    actions: {
      mTag(d) { P['media-lib'].state.tag = d.id; App.refresh(); },
      mUpload() {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = () => {
          const f = input.files && input.files[0];
          if (!f) return;
          Media.tempUpload(f, () => { UI.toast('图片已上传到素材库'); App.refresh(); });
        };
        input.click();
      },
      mOpen(d) {
        const m = Media.list().find((x) => x.id === d.id);
        if (!m) return;
        UI.drawer({
          title: m.name, sub: '素材详情 · ' + m.tag, icon: 'image', width: 560,
          body: '<img src="' + E(m.url) + '" alt="" style="width:100%;border-radius:12px;display:block;background:#eef3f9">' +
            '<div class="gsection"><h4>素材信息</h4>' +
            field({ k: 'name', label: '素材名称', value: m.name }) +
            field({ k: 'tag', label: '分类', type: 'select', value: m.tag, options: ['商品', '内容', '通用', '上传', '外链'].map((x) => ({ v: x, l: x })) }) +
            '<div class="field"><label>图片地址</label><div class="row" style="gap:6px"><input class="input" value="' + E(m.url.slice(0, 70)) + '..." readonly>' +
            '<button class="btn" data-m-copy>' + I('copy', 13) + '复制</button></div><div class="hint">外部系统可直接引用该地址</div></div>' +
            '</div><div class="row" style="gap:8px"><button class="btn danger" data-m-del>' + I('trash', 13) + '删除素材</button></div>',
          mount(n) {
            n.querySelector('[data-m-copy]').addEventListener('click', () => UI.copy(m.url));
            n.querySelector('[data-m-del]').addEventListener('click', () => {
              UI.confirm({ title: '删除这张素材？', desc: '已引用它的页面会显示空白，需要重新选择图片。', danger: true }).then((ok) => {
                if (!ok) return;
                Store.removeItem('media', m.id, 'id', '删除素材');
                UI.closeOverlay(); App.refresh();
              });
            });
          },
          onOk(n) {
            const name = n.querySelector('[data-k="name"]').value.trim();
            const tag = n.querySelector('[data-k="tag"]').value;
            m.name = name || m.name; m.tag = tag;
            Store.mark('media', '编辑素材：' + m.name);
            Store.persist(); App.refresh();
          }
        });
      }
    }
  };

  /* ============================================================ 职工端内容 */
  function openArticle(a, isNew) {
    let cover = a.cover || '';
    const ed = Media.blockEditor(a.blocks || []);
    UI.drawer({
      title: isNew ? '新建健康资讯' : '编辑健康资讯',
      sub: '封面 + 图文正文，发布后出现在职工端「发现」页',
      icon: 'file', width: 760, okText: isNew ? '创建文章' : '保存文章',
      body:
        '<div class="gsection"><h4>封面图</h4>' +
          '<div class="bn-edit-img"><img id="ar-cover" src="' + E(cover || '') + '" alt="" style="width:100%;height:170px;object-fit:cover;border-radius:12px;background:#eef3f9;display:block">' +
          '<div class="row" style="margin-top:8px;gap:8px"><button class="btn" data-ar-cover>' + I('upload', 14) + '上传 / 换图</button>' +
          '<span class="small mut">建议 16:9、1200×675，文章列表与详情页共用</span></div></div></div>' +
        '<div class="gsection"><h4>基本信息</h4>' +
          field({ k: 'title', label: '标题', value: a.title }) +
          '<div class="grid g-2" style="gap:10px">' +
            field({ k: 'cat', label: '分类', type: 'select', value: a.cat || '慢病', options: ['慢病', '体检', '运动', '营养', '心理', '睡眠'].map((x) => ({ v: x, l: x })) }) +
            field({ k: 'author', label: '作者 / 科室', value: a.author || '健康管理中心' }) + '</div></div>' +
        '<div class="gsection"><h4>图文正文</h4><div class="hint" style="margin-bottom:8px">正文按段落、图片、提示块顺序展示；不要把大段文字塞进一张图。</div>' +
          '<div data-ar-blocks></div></div>',
      mount(n) {
        ed.mount(n.querySelector('[data-ar-blocks]'));
        n.querySelector('[data-ar-cover]').addEventListener('click', () => {
          Media.pick((url) => {
            cover = url;
            const el = n.querySelector('#ar-cover');
            if (el) el.src = url;
          }, { tag: '内容' });
        });
      },
      onOk(n) {
        const val = (k) => { const el = n.querySelector('[data-k="' + k + '"]'); return el ? el.value.trim() : ''; };
        if (!val('title')) { UI.toast('请填写文章标题', 'warn'); return false; }
        const rec = Object.assign({}, a, {
          id: a.id || 'ar' + Date.now(),
          title: val('title'), cat: val('cat'), author: val('author'),
          cover: cover || '', blocks: ed.get(),
          date: a.date || '2026-11-08', views: a.views || 0, on: a.on !== false
        });
        const list = Store.db.employee.articles;
        const i = list.findIndex((x) => x.id === rec.id);
        if (i >= 0) list[i] = rec; else list.unshift(rec);
        Store.mark('employee.articles', (isNew ? '新建文章：' : '编辑文章：') + rec.title);
        Store.persist(); UI.toast(isNew ? '文章已创建，待发布' : '文章已保存，待发布'); App.refresh();
      }
    });
  }

  P['e-content'] = {
    app: 'employee', grp: 'e.content', title: '内容运营', sub: '首页横幅与健康资讯：封面、图文正文、上下线',
    preview: 'emp-home',
    state: { tab: 'article' },
    render() {
      Media.ensure();
      const h = Store.db.employee;
      const st = P['e-content'].state;
      const banners = h.banners || [];
      const arts = h.articles || [];
      const body = st.tab === 'banner'
        ? K.panel({ title: '首页横幅', sub: '图片、文案、跳转与投放时间在「轮播与开屏」里统一配置', flush: true,
            actions: K.btn('管理轮播', 'goBanners', { icon: 'image', cls: 'sm' }),
            body: '<div style="padding:8px 18px 14px">' + banners.map((b) =>
              '<div class="listrow"><div style="width:78px;height:44px;border-radius:8px;overflow:hidden;background:#eef3f9;flex:none">' +
              '<img src="' + E(b.image || '') + '" style="width:100%;height:100%;object-fit:cover" alt=""></div>' +
              '<div class="meta"><b>' + E(b.title) + '</b><span>' + E(b.sub) + ' · 自动播放 ' + (b.interval || 5) + ' 秒</span></div>' +
              '<div class="right row" style="gap:8px"><span class="pill ' + (b.on === false ? 'grey' : 'green') + '">' + (b.on === false ? '未上线' : '投放中') + '</span>' +
              '<button class="switch ' + (b.on === false ? '' : 'on') + '" data-toggle="employee.banners.' + UI.ix(banners, b) + '.on"></button></div></div>').join('') + '</div>' })
        : K.panel({ title: '健康资讯', sub: '发现页内容流 · 封面 + 图文正文', flush: true,
            actions: K.btn('新建文章', 'newArticle', { icon: 'plus', cls: 'sm' }),
            body: UI.table([
              { label: '文章', w: '260px', render: (a) => '<div class="cellflex"><img src="' + E(a.cover || '') + '" style="width:58px;height:36px;border-radius:8px;object-fit:cover;flex:none" alt="">' +
                '<div style="min-width:0"><div class="strong clip">' + E(a.title) + '</div><div class="small muted">' + E(a.author) + ' · ' + (a.blocks || []).length + ' 个图文块</div></div></div>' },
              { label: '分类', render: (a) => UI.pill(a.cat, 'grey') },
              { label: '发布时间', render: (a) => '<span class="small tnum muted">' + E(a.date) + '</span>' },
              { label: '阅读', align: 'right', render: (a) => '<span class="tnum">' + a.views + '</span>' },
              { label: '上线', render: (a) => '<button class="switch ' + (a.on ? 'on' : '') + '" data-toggle="employee.articles.' + UI.ix(arts, a) + '.on"></button>' },
              { label: '', align: 'right', render: (a) => '<button class="iconbtn" data-act="editArticle" data-id="' + a.id + '">' + I('edit', 14) + '</button>' }
            ], arts.map((a) => Object.assign({ _id: a.id }, a))) });
      return K.head('内容运营', '封面图、标题、分类、作者、图文正文都在这里配；轮播图去「轮播与开屏」',
        K.btn('发布', 'publishContent', { icon: 'send', cls: 'primary' })) +
        K.tabs([{ id: 'article', label: '健康资讯', n: arts.length }, { id: 'banner', label: '首页横幅', n: banners.length }], st.tab, 'ctTab') + body;
    },
    actions: {
      ctTab(d) { P['e-content'].state.tab = d.id; App.refresh(); },
      goBanners() { App.go('content-banners'); },
      newArticle() { Media.ensure(); openArticle({ on: true, blocks: [] }, true); },
      editArticle(d) {
        Media.ensure();
        const a = Store.db.employee.articles.find((x) => x.id === d.id);
        if (a) openArticle(a, false);
      },
      publishContent() { App.openPublish('内容运营更新'); }
    }
  };
})();
