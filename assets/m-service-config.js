/* ============================================================================
   职工端服务详情深化：主图 / 图集 / 图文块 / 流程 / 须知 / 适用与禁忌 / 机构
   服务目录不再只是名称和一段介绍，而是完整的前端详情配置。
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const H = () => Store.db.employee;
  const MOD = (id) => (H().modules.find((m) => m.id === id) || {}).name || '—';

  const COVER = { screen: 'f1', chronic: 'f2', medical: 'f4', special: 'f3', safety: 'f5' };

  function ensure() {
    Media.ensure();
    const img = window.IMG || {};
    H().services.forEach((s, i) => {
      if (!s.cover) s.cover = img[COVER[s.mod] || ('f' + (7 + (i % 4)))];
      if (!Array.isArray(s.gallery) || !s.gallery.length) {
        s.gallery = [s.cover, img['f' + (7 + (i % 4))], img['f' + (11 + (i % 6))]].filter(Boolean);
      }
      if (!Array.isArray(s.detail) || !s.detail.length) {
        s.detail = [
          { type: 'text', text: (s.intro || s.name) + '。' + (s.scope === '全国履约' ? '支持全国主要城市预约与报告解读。' : '由属地健康管理中心统筹预约、履约与检后管理。') },
          { type: 'image', url: s.cover, caption: s.name + ' · 服务场景' },
          { type: 'spec', items: [{ k: '服务时长', v: s.duration || '半天' }, { k: '报告时效', v: s.resp || '1 个工作日' }, { k: '履约方式', v: s.scope || '属地履约' }] },
          { type: 'quote', text: '具体检查项目、注意事项与禁忌请以预约确认单和医生面诊为准。' }
        ];
      }
      if (!Array.isArray(s.flow) || !s.flow.length) {
        s.flow = [
          { title: '资格与权益校验', desc: '确认企业权益、适用人群与禁忌，避免无效预约' },
          { title: '预约机构与时段', desc: '选择城市、机构、日期与可约时段，填写必要信息' },
          { title: '到院履约', desc: '签到、身份核验、服务执行；异常情况进入履约台' },
          { title: '报告与解读', desc: '报告生成后通知本人，异常结果进入医生解读' },
          { title: '转健康管理', desc: '需要干预时自动建立风险标签、计划与随访' }
        ];
      }
      if (!s.notice) s.notice = '预约成功后请按短信/站内信提示准备；需空腹的项目请提前 8 小时禁食。改约或取消请至少提前 24 小时操作。';
      if (!s.fit) s.fit = s.mod === 'screen' ? '年度体检人群、慢病高风险人群、企业健康福利覆盖人群' : '有相应健康管理需求、已完成基础评估的企业员工';
      if (!s.avoid) s.avoid = '妊娠期、急性感染期、严重心肺功能不全者需先由医生评估；具体以项目禁忌说明为准。';
      if (!Array.isArray(s.orgs) || !s.orgs.length) s.orgs = s.scope === '全国履约' ? ['北大国际医院', '北医三院健康管理中心', '当地合作三甲医院'] : ['北大国际医院', '北医三院健康管理中心'];
      if (!s.priceNote) s.priceNote = s.price ? '企业权益内按次核销；超出权益部分按协议价结算。' : '企业权益内服务，个人暂不单独收费。';
    });
    return H();
  }

  function score(s) {
    let n = 0;
    if (s.cover) n += 18;
    if (Array.isArray(s.gallery) && s.gallery.length >= 2) n += 12;
    if (Array.isArray(s.detail) && s.detail.length >= 3) n += 25;
    if (Array.isArray(s.flow) && s.flow.length >= 3) n += 20;
    if (s.notice) n += 10;
    if (s.fit && s.avoid) n += 10;
    if (s.bookable) n += 5;
    return Math.min(100, n);
  }

  function galleryHTML(list) {
    return list.map((u, i) =>
      '<div class="sg-item"><img src="' + E(u) + '" alt="">' +
      '<button data-sg-del="' + i + '" title="移除">' + I('x', 10) + '</button></div>').join('') +
      (list.length < 6 ? '<button class="sg-add" data-sg-add>' + I('plus', 13) + '加图</button>' : '');
  }

  function flowHTML(list) {
    return list.map((x, i) =>
      '<div class="flow-row" data-flow-row>' +
        '<span class="fl-n">' + (i + 1) + '</span>' +
        '<input class="input" data-flow-title value="' + E(x.title || '') + '" placeholder="步骤名称">' +
        '<input class="input" data-flow-desc value="' + E(x.desc || '') + '" placeholder="这一步做什么、谁负责">' +
        '<button class="iconbtn" data-flow-del="' + i + '">' + I('x', 11) + '</button>' +
      '</div>').join('');
  }

  function openEditor(s) {
    ensure();
    const i = H().services.indexOf(s);
    let cover = s.cover || '';
    let gallery = (s.gallery || []).slice();
    let flow = JSON.parse(JSON.stringify(s.flow || []));
    const bed = Media.blockEditor(s.detail || []);

    const paintGallery = (node) => {
      const box = node.querySelector('#svc-gal');
      if (box) box.innerHTML = galleryHTML(gallery);
    };
    const paintFlow = (node) => {
      const box = node.querySelector('#svc-flow');
      if (box) box.innerHTML = flowHTML(flow);
    };
    const collectFlow = (node) => {
      flow = Array.from(node.querySelectorAll('[data-flow-row]')).map((row) => ({
        title: (row.querySelector('[data-flow-title]') || {}).value || '',
        desc: (row.querySelector('[data-flow-desc]') || {}).value || ''
      })).filter((x) => x.title || x.desc);
    };

    UI.drawer({
      title: '编辑服务详情', sub: s.name + ' · 前端详情页与预约流程', icon: 'stethoscope', width: 820,
      okText: '保存服务',
      body:
        '<div class="note" style="margin-bottom:12px">这一份配置同时影响职工端「服务卡片、服务详情、预约确认、检后管理入口」。图片与图文块可复用素材库。</div>' +
        '<div class="gsection"><h4>基本信息</h4>' +
          UI.fInput({ label: '服务名称', value: s.name, path: 'employee.services.' + i + '.name' }) +
          '<div class="frow">' + UI.fInput({ label: '英文名', value: s.en, path: 'employee.services.' + i + '.en' }) +
            UI.fSelect({ label: '所属模块', value: s.mod, options: H().modules.map((m) => ({ v: m.id, l: m.name })), path: 'employee.services.' + i + '.mod' }) + '</div>' +
          '<div class="frow">' + UI.fSelect({ label: '履约范围', value: s.scope, options: ['属地履约', '全国履约'], path: 'employee.services.' + i + '.scope' }) +
            UI.fInput({ label: '服务标签', value: (s.tags || []).join(' / '), hint: '用 / 分隔，最多 3 个', path: 'employee.services.' + i + '.tagsText' }) + '</div>' +
          UI.fArea({ label: '一句话介绍', value: s.intro, rows: 2, path: 'employee.services.' + i + '.intro', hint: '显示在服务列表卡片上' }) +
        '</div>' +
        '<div class="gsection"><h4>展示素材</h4>' +
          '<div class="svc-editor-cover" id="svc-cover">' +
            (cover ? '<img src="' + E(cover) + '" alt="">' : '') +
            '<div class="cover-empty">' + I('image', 24) + '<b>' + (cover ? '服务主图' : '还没有服务主图') + '</b><span>建议 16:9，展示在服务列表与详情页顶部</span></div>' +
            '<div class="cover-tools"><button class="btn sm" data-cover-pick>' + I('upload', 12) + (cover ? '替换主图' : '上传主图') + '</button>' +
              (cover ? '<button class="btn sm ghost" data-cover-clear>移除</button>' : '') + '</div>' +
          '</div>' +
          '<div class="label" style="margin-top:14px">服务图集 <em>最多 6 张，建议展示环境、设备、报告样例</em></div>' +
          '<div class="svc-gallery" id="svc-gal">' + galleryHTML(gallery) + '</div>' +
          '<div class="hairline"></div>' +
          '<div class="label">图文详情 <em>文字、图片、参数表、提示块自由组合</em></div>' +
          '<div id="svc-blocks"></div>' +
        '</div>' +
        '<div class="gsection"><h4>服务流程</h4>' +
          '<div class="flow-list" id="svc-flow">' + flowHTML(flow) + '</div>' +
          '<button class="btn sm ghost flow-add" data-flow-add>' + I('plus', 12) + '增加一步</button>' +
        '</div>' +
        '<div class="gsection"><h4>适用人群与禁忌</h4>' +
          UI.fArea({ label: '适用人群', value: s.fit, rows: 2, path: 'employee.services.' + i + '.fit' }) +
          UI.fArea({ label: '禁忌与暂缓情形', value: s.avoid, rows: 2, path: 'employee.services.' + i + '.avoid' }) +
        '</div>' +
        '<div class="gsection"><h4>预约、须知与履约</h4>' +
          '<div class="frow">' + UI.fInput({ label: '服务时长', value: s.duration, path: 'employee.services.' + i + '.duration' }) +
            UI.fInput({ label: '报告时效', value: s.resp, path: 'employee.services.' + i + '.resp' }) + '</div>' +
          UI.fArea({ label: '预约须知', value: s.notice, rows: 3, path: 'employee.services.' + i + '.notice' }) +
          UI.fArea({ label: '可约机构', value: (s.orgs || []).join('\n'), rows: 2, path: 'employee.services.' + i + '.orgsText', hint: '每行一个机构；前端只在可约机构中展示' }) +
          UI.fInput({ label: '价格说明', value: s.priceNote, path: 'employee.services.' + i + '.priceNote' }) +
          '<div class="frow">' + UI.fSwitch({ label: '允许在线预约', value: s.bookable, path: 'employee.services.' + i + '.bookable', hint: '关闭后详情页只展示咨询入口' }) +
            UI.fSwitch({ label: '在服务目录展示', value: s.on, path: 'employee.services.' + i + '.on' }) + '</div>' +
        '</div>' +
        '<div class="note teal">保存后会进入待发布队列；发布前可在右侧预览「职工端服务详情」。</div>',
      mount(node) {
        bed.mount(node.querySelector('#svc-blocks'));
        node.querySelector('[data-cover-pick]').addEventListener('click', () => {
          Media.pick((url) => {
            cover = url;
            const box = node.querySelector('#svc-cover');
            box.querySelector('img') && box.querySelector('img').remove();
            const im = document.createElement('img'); im.src = url; box.insertBefore(im, box.firstChild);
            const empty = box.querySelector('.cover-empty'); if (empty) empty.style.display = 'none';
          }, { title: '选择服务主图', tag: '内容' });
        });
        node.querySelector('[data-cover-clear]') && node.querySelector('[data-cover-clear]').addEventListener('click', () => {
          cover = '';
          const im = node.querySelector('#svc-cover img'); if (im) im.remove();
          const empty = node.querySelector('.cover-empty'); if (empty) empty.style.display = '';
        });
        node.querySelector('#svc-gal').addEventListener('click', (e) => {
          const del = e.target.closest('[data-sg-del]');
          if (del) { gallery.splice(Number(del.dataset.sgDel), 1); paintGallery(node); return; }
          if (e.target.closest('[data-sg-add]')) {
            if (gallery.length >= 6) { UI.toast('最多 6 张图集', 'warn'); return; }
            Media.pick((url) => { gallery.push(url); paintGallery(node); }, { title: '添加服务图集', tag: '内容' });
          }
        });
        node.querySelector('#svc-flow').addEventListener('input', () => collectFlow(node));
        node.querySelector('#svc-flow').addEventListener('click', (e) => {
          const del = e.target.closest('[data-flow-del]');
          if (!del) return;
          collectFlow(node); flow.splice(Number(del.dataset.flowDel), 1); paintFlow(node);
        });
        node.querySelector('[data-flow-add]').addEventListener('click', () => {
          collectFlow(node); flow.push({ title: '', desc: '' }); paintFlow(node);
        });
      },
      onOk(node) {
        collectFlow(node);
        const detail = bed.get();
        const tags = String(s.tagsText || s.tags.join(' / ')).split('/').map((x) => x.trim()).filter(Boolean).slice(0, 3);
        const orgs = String(s.orgsText || s.orgs.join('\n')).split(/\n+/).map((x) => x.trim()).filter(Boolean);
        Store.saveItem('employee.services', {
          id: s.id, cover: cover, gallery: gallery, detail: detail, flow: flow,
          tags: tags, orgs: orgs
        }, 'id', '服务详情：' + s.name);
        UI.toast('服务详情已保存，待发布');
        App.refresh();
      }
    });
  }

  P['e-services'] = {
    app: 'employee', title: '职工端服务详情', sub: '服务卡片、图文详情、服务流程、须知与可约机构',
    preview: 'emp-services',
    state: { mod: '' },
    render() {
      const h = ensure(), mod = P['e-services'].state.mod;
      const list = h.services.filter((s) => !mod || s.mod === mod);
      return K.head('职工端服务详情', h.services.length + ' 项服务 · 详情完整度 ' + Math.round(h.services.reduce((a, s) => a + score(s), 0) / h.services.length) + '%',
        K.btn('轮播与开屏', 'goBanners', { icon: 'image' }) + ' ' +
        K.btn('去健康履约台', 'goFlow', { icon: 'activity' }) + ' ' +
        K.btn('新增服务', 'newSvc', { icon: 'plus', cls: 'primary' }), 'EMPLOYEE / SERVICE DETAIL') +
        K.toolbar(K.seg([{ id: '', label: '全部 ' + h.services.length }].concat(h.modules.map((m) => ({ id: m.id, label: m.name }))), mod, 'svcFilter'),
          '<div class="minisearch">' + I('search', 13) + '<input placeholder="搜索服务名称 / 标签" data-live-filter="svc"></div>') +
        '<div class="svc-grid">' + list.map((s) => {
          const p = score(s);
          return '<article class="svc-card" data-filter-item="svc" data-text="' + E(s.name + ' ' + s.en + ' ' + (s.tags || []).join(' ')) + '">' +
            '<div class="svc-cover">' +
              (s.cover ? '<img src="' + E(s.cover) + '" alt="">' : '<div class="svc-empty">' + I('image', 22) + '<span>缺服务主图</span></div>') +
              '<span class="svc-state">' + UI.pill(s.on ? '在架' : '下架', s.on ? 'green' : 'grey') + '</span>' +
              '<span class="svc-sold">' + s.sold + ' 次预约</span>' +
            '</div>' +
            '<div class="svc-body">' +
              '<div class="svc-title"><b>' + E(s.name) + '</b><button class="svc-edit" data-act="editSvc" data-id="' + s.id + '" title="编辑详情">' + I('edit', 14) + '</button></div>' +
              '<div class="svc-sub">' + E(MOD(s.mod)) + ' · ' + E(s.scope) + ' · ' + E(s.duration || '') + '</div>' +
              '<div class="svc-tags"><span class="pill blue">' + E((s.tags || [])[0] || '服务') + '</span>' +
                (s.bookable ? '<span class="pill green">可预约</span>' : '<span class="pill grey">仅咨询</span>') +
                ((s.detail || []).length >= 3 ? '<span class="pill grey">图文详情</span>' : '<span class="pill amber">待补图文</span>') + '</div>' +
              '<div class="svc-foot"><div class="svc-completeness"><span><em>详情完整度</em><b>' + p + '%</b></span><div class="progress"><b style="width:' + p + '%"></b></div></div>' +
                '<div class="svc-actions"><button class="iconbtn" data-act="editSvc" data-id="' + s.id + '" title="编辑">' + I('edit', 13) + '</button>' +
                '<button class="iconbtn" data-act="previewSvc" data-id="' + s.id + '" title="预览">' + I('eye', 13) + '</button></div></div>' +
            '</div></article>';
        }).join('') + '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '服务详情应该包含什么', sub: '少一项，前端就会显得单薄或无法履约', body: '<div class="grid g-4">' +
          [['主图', '服务列表与详情页的第一印象，缺图会明显降低可信度'], ['图文详情', '用文字、场景图、参数表和提示块解释服务价值'], ['流程与须知', '让员工知道怎么约、到哪里、要准备什么'], ['适用与禁忌', '避免无效预约与履约风险，是健康服务的底线']].map((x, i) =>
            '<div class="panel" style="padding:14px;box-shadow:none"><div class="ava" style="border-radius:8px;width:24px;height:24px;font-size:11px">0' + (i + 1) + '</div>' +
            '<div style="font-size:12.5px;font-weight:600;margin-top:8px">' + x[0] + '</div><div class="small mut" style="margin-top:4px;line-height:1.7">' + x[1] + '</div></div>').join('') +
          '</div>' });
    },
    actions: {
      svcFilter(d) { P['e-services'].state.mod = d.id; App.refresh(); },
      goBanners() { Media.ensure(); App.go('content-banners'); },
      goFlow() { App.go('h-service-flow'); },
      editSvc(d) { const s = H().services.find((x) => x.id === d.id); if (s) openEditor(s); },
      previewSvc(d) {
        const s = ensure().services.find((x) => x.id === d.id);
        if (!s) return;
        UI.modal({ title: s.name, desc: '职工端服务详情预览', wide: true, cancelText: false, okText: '关闭',
          body: '<div class="svc-preview"><div style="height:190px;border-radius:12px;overflow:hidden;background:#eef5ff">' +
            (s.cover ? '<img src="' + E(s.cover) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '') + '</div>' +
            '<div class="row" style="margin-top:12px;justify-content:space-between"><b style="font-size:16px">' + E(s.name) + '</b>' + UI.pill(s.on ? '在架' : '下架', 'green') + '</div>' +
            '<div class="small mut" style="margin:5px 0 10px">' + E(s.intro) + '</div>' +
            '<div class="row small" style="gap:14px;flex-wrap:wrap;color:var(--ink-3)"><span>时长 ' + E(s.duration) + '</span><span>报告 ' + E(s.resp) + '</span><span>' + E(s.scope) + '</span></div>' +
            Media.renderBlocks(s.detail) +
            (s.flow && s.flow.length ? '<div class="formsec" style="margin-top:14px"><h4>服务流程</h4><div class="flow-list">' + s.flow.map((x, i) => '<div class="flow-row" style="grid-template-columns:28px 1fr"><span class="fl-n">' + (i + 1) + '</span><div><b style="font-size:12px">' + E(x.title) + '</b><div class="small mut" style="margin-top:2px">' + E(x.desc) + '</div></div></div>').join('') + '</div></div>' : '') +
            '<div class="note warn" style="margin-top:14px">' + E(s.notice) + '</div></div>' });
      },
      newSvc() {
        UI.formDrawer({ title: '新增服务', sub: '先建基本信息，再补主图与图文详情', icon: 'package',
          fields: [
            { key: 'name', label: '服务名称' }, { key: 'en', label: '英文名' },
            { key: 'mod', label: '所属模块', type: 'select', options: H().modules.map((m) => ({ v: m.id, l: m.name })) },
            { key: 'scope', label: '履约范围', type: 'select', options: ['属地履约', '全国履约'] },
            { key: 'intro', label: '一句话介绍', type: 'area', rows: 2 }
          ],
          onSave(v) {
            Store.pushItem('employee.services', { id: 's' + Date.now(), mod: v.mod, name: v.name || '新服务', en: v.en, scope: v.scope,
              payer: ['企康'], tags: [], intro: v.intro, duration: '半天', resp: '1 个工作日', bookable: true, on: false, hot: false, order: 99,
              orgs: [], price: 0, sold: 0, flow: [], detail: [], gallery: [] }, '新增服务');
            UI.toast('服务已创建，请继续补主图与图文详情'); App.refresh();
          } });
      }
    }
  };

  window.SVCDEEP = { ensure, score };
})();
