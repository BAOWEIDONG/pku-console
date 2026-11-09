/* ============================================================================
   实物商品深化：主图/图集、图文详情、SKU、库存、物流售后、挂载位
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const IMGS = () => window.IMG || {};

  function ensure() {
    const db = Store.db;
    if (!Array.isArray(db.supplements)) db.supplements = [];
    db.supplements.forEach((g, i) => {
      if (!Array.isArray(g.images) || !g.images.length) g.images = [IMGS()['g' + ((i % 10) + 1)]];
      if (!g.code) g.code = 'SP-' + (2601 + i);
      if (!g.brand) g.brand = '北大医疗健康优选';
      if (!g.unit) g.unit = '盒';
      if (!g.shipping) g.shipping = '顺丰包邮 · 48 小时内发出';
      if (!g.afterSale) g.afterSale = '7 天无理由（未拆封）';
      if (!Array.isArray(g.detail) || !g.detail.length) {
        g.detail = [
          { type: 'text', text: (g.name || '') + '适合' + (g.fit || '日常营养补充') + '。建议按包装说明每日规律使用，特殊情况请先咨询医生或营养师。' },
          { type: 'image', url: g.images[1] || g.images[0], caption: (g.name || '商品') + ' · 产品实拍' },
          { type: 'spec', items: [{ k: '规格', v: (g.specs && g.specs[0] && g.specs[0].name) || g.spec || '标准装' },
            { k: '保质期', v: g.shelfLife || '18 个月' }] },
          { type: 'quote', text: '保健食品不是药物，不能代替药物治疗疾病。' + (g.avoid && g.avoid.length ? '禁用于：' + g.avoid.join('、') + '。' : '') }
        ];
      }
      if (!g.tags) g.tags = [g.cat || '营养', '自营'];
      if (!g.channels) g.channels = ['employee', 'versionall'];
    });
  }

  function field(o) {
    const k = ' data-k="' + o.k + '"';
    return '<div class="field"><label>' + E(o.label) + (o.opt ? ' <em>选填</em>' : '') + '</label>' +
      (o.type === 'select' ? '<select class="select" ' + k + '>' + o.options.map((x) =>
        '<option value="' + E(x.v) + '"' + (String(o.value) === String(x.v) ? ' selected' : '') + '>' + E(x.l) + '</option>').join('') + '</select>'
        : o.type === 'area' ? '<textarea class="input" rows="' + (o.rows || 2) + '" ' + k + ' placeholder="' + E(o.ph || '') + '">' + E(o.value || '') + '</textarea>'
        : '<input class="input ' + (o.type === 'num' ? 'tnum' : '') + '" ' + (o.type === 'num' ? 'type="number"' : '') + ' ' + k + ' value="' + E(o.value == null ? '' : o.value) + '" placeholder="' + E(o.ph || '') + '">') +
      (o.hint ? '<div class="hint">' + E(o.hint) + '</div>' : '') + '</div>';
  }

  function galHTML(images) {
    return (images.map((u, i) =>
      '<div class="gd-pic ' + (i === 0 ? 'main' : '') + '"><img src="' + E(u) + '" alt="">' +
      (i > 0 ? '<button data-gd-delimg="' + i + '" title="移除">' + I('x', 11) + '</button>' : '') + '</div>').join('')) +
      (images.length < 6 ? '<div class="gd-pic add" data-gd-addimg>' + I('plus', 16) + '<span>加图</span></div>' : '');
  }

  function skuHTML(specs) {
    return '<div class="gd-sku" style="margin-bottom:4px"><span class="gd-sku-h">规格名</span><span class="gd-sku-h">售价</span><span class="gd-sku-h">库存</span><span class="gd-sku-h">编码</span><span></span></div>' +
      '<div data-sku-list>' + (specs || []).map((s, i) =>
        '<div class="gd-sku" data-sku-row style="margin-bottom:5px">' +
          '<input class="input" data-sku-name value="' + E(s.name || '') + '">' +
          '<input class="input tnum" data-sku-price type="number" value="' + E(s.price == null ? '' : s.price) + '">' +
          '<input class="input tnum" data-sku-stock type="number" value="' + E(s.stock == null ? '' : s.stock) + '">' +
          '<input class="input" data-sku-code value="' + E(s.code || '') + '">' +
          '<button class="iconbtn" data-sku-del>' + I('x', 11) + '</button></div>').join('') + '</div>' +
      '<button class="btn sm ghost" data-sku-add style="margin-top:4px">' + I('plus', 12) + '添加规格</button>';
  }

  function saveGood(g, isNew) {
    const list = Store.db.supplements;
    if (isNew) list.unshift(g);
    else {
      const i = list.findIndex((x) => x.id === g.id);
      if (i >= 0) list[i] = g; else list.unshift(g);
    }
    Store.mark('supplements', (isNew ? '新增商品：' : '编辑商品：') + g.name);
    Store.persist();
    UI.toast(isNew ? '商品已创建，待发布' : '商品已保存，待发布');
    App.refresh();
  }

  function openEditor(g) {
    ensure();
    const isNew = !g.id;
    let images = (g.images && g.images.length ? g.images : ['']).slice();
    let detail = JSON.parse(JSON.stringify(g.detail || []));
    let on = g.on !== false;
    const cats = ['蛋白补充', '基础营养', '心血管', '肠道', '骨骼', '睡眠', '女性营养', '实物'];
    const editor = Media.blockEditor(detail);
    UI.drawer({
      title: isNew ? '新增实物商品' : '编辑商品',
      sub: (g.name || '新商品') + ' · 商品图、图文详情、SKU、库存与售后',
      icon: 'gift', width: 780, okText: isNew ? '创建商品' : '保存商品',
      body:
        '<div class="gsection"><h4>基本信息</h4>' +
          field({ k: 'name', label: '商品名称', value: g.name, ph: '如 乳清蛋白粉 750g' }) +
          '<div class="grid g-2" style="gap:10px">' +
            field({ k: 'cat', label: '分类', type: 'select', value: g.cat || '基础营养', options: cats.map((x) => ({ v: x, l: x })) }) +
            field({ k: 'brand', label: '品牌', value: g.brand || '北大医疗健康优选' }) + '</div>' +
          '<div class="grid g-2" style="gap:10px">' +
            field({ k: 'code', label: '商品编码', value: g.code, hint: '用于订单、库存、结算对账' }) +
            field({ k: 'unit', label: '销售单位', value: g.unit || '盒' }) + '</div>' +
          field({ k: 'tags', label: '标签', value: (g.tags || []).join(' / '), hint: '用 / 分隔，展示在商品卡片上' }) +
        '</div>' +
        '<div class="gsection"><h4>商品图片</h4>' +
          '<div class="hint">第一张为主图，建议 1:1、800px 以上；最多 6 张。详情里还可以再插入大图。</div>' +
          '<div id="gd-gal" class="gd-pics">' + galHTML(images) + '</div>' +
        '</div>' +
        '<div class="gsection"><h4>图文详情</h4>' +
          '<div class="hint" style="margin-bottom:8px">支持文字段落、图片、参数表、提示块；用户在 H5 商品详情页按顺序看到。</div>' +
          '<div data-detail-editor></div>' +
        '</div>' +
        '<div class="gsection"><h4>规格与 SKU</h4>' + skuHTML(g.specs) + '</div>' +
        '<div class="gsection"><h4>价格与库存</h4>' +
          '<div class="grid g-3" style="gap:10px">' +
            field({ k: 'price', label: '售价（元）', type: 'num', value: g.price }) +
            field({ k: 'settle', label: '结算价（元）', type: 'num', value: g.settle }) +
            field({ k: 'cost', label: '成本（元）', type: 'num', value: g.cost }) + '</div>' +
          '<div class="grid g-2" style="gap:10px">' +
            field({ k: 'stock', label: '总库存', type: 'num', value: g.stock }) +
            field({ k: 'safeStock', label: '安全库存预警', type: 'num', value: g.safeStock || 20 }) + '</div>' +
        '</div>' +
        '<div class="gsection"><h4>物流与售后</h4>' +
          field({ k: 'shipping', label: '配送方式', value: g.shipping }) +
          field({ k: 'afterSale', label: '售后政策', value: g.afterSale }) +
        '</div>' +
        '<div class="gsection"><h4>适用与禁忌</h4>' +
          field({ k: 'fit', label: '适用人群', value: g.fit, ph: '如 饮食不规律 / 力量训练' }) +
          field({ k: 'avoid', label: '禁忌人群', value: (g.avoid || []).join(' / '), ph: '用 / 分隔，如 肾功能不全 / 乳糖不耐' }) +
          '<div class="grid g-2" style="gap:10px">' +
            field({ k: 'shelfLife', label: '保质期', value: g.shelfLife || '18 个月' }) +
            field({ k: 'storage', label: '储存条件', value: g.storage || '常温干燥' }) + '</div>' +
        '</div>' +
        '<div class="gsection"><h4>挂载与上架</h4>' +
          field({ k: 'attach', label: '前台挂载位', value: (g.attach || ['meal']).join(' / '), hint: 'day=全天食谱 / meal=餐次 / planner=搭配器 / mall=积分商城 / detail=商品详情' }) +
          field({ k: 'channels', label: '投放端', value: (g.channels || ['employee', 'versionall']).join(' / '), hint: 'employee=职工健康 / versionall=减重营' }) +
          '<div class="row" style="justify-content:space-between;padding:9px 0"><div><div style="font-size:12.5px">上架销售</div><div class="hint">关闭后前台不展示，但历史订单不受影响</div></div>' +
          '<button class="switch ' + (on ? 'on' : '') + '" data-gd-on></button></div>' +
        '</div>',
      mount(n) {
        editor.mount(n.querySelector('[data-detail-editor]'));
        n.querySelector('[data-gd-on]').addEventListener('click', (e) => { on = !on; e.currentTarget.classList.toggle('on', on); });
        const gal = n.querySelector('#gd-gal');
        function paintGal() { gal.innerHTML = galHTML(images); bindGal(); }
        function bindGal() {
          gal.querySelectorAll('[data-gd-delimg]').forEach((b) => b.addEventListener('click', () => {
            images.splice(Number(b.dataset.gdDelimg), 1);
            if (!images.length) images.push('');
            paintGal();
          }));
          gal.querySelector('[data-gd-addimg]').addEventListener('click', () => {
            Media.pick((url) => { if (images.length < 6) images.push(url); paintGal(); }, { tag: '商品' });
          });
          const main = gal.querySelector('.gd-pic.main');
          if (main) main.addEventListener('click', () => {
            Media.pick((url) => { images[0] = url; paintGal(); }, { tag: '商品' });
          });
        }
        bindGal();
        const list = n.querySelector('[data-sku-list]');
        n.querySelector('[data-sku-add]').addEventListener('click', () => {
          const row = document.createElement('div');
          row.className = 'gd-sku'; row.dataset.skuRow = ''; row.style.marginBottom = '5px';
          row.innerHTML = '<input class="input" data-sku-name placeholder="规格名"><input class="input tnum" data-sku-price type="number" placeholder="售价">' +
            '<input class="input tnum" data-sku-stock type="number" placeholder="库存"><input class="input" data-sku-code placeholder="编码">' +
            '<button class="iconbtn" data-sku-del>' + I('x', 11) + '</button>';
          list.appendChild(row);
          bindDel(row);
        });
        function bindDel(row) { row.querySelector('[data-sku-del]').addEventListener('click', () => row.remove()); }
        list.querySelectorAll('[data-sku-row]').forEach(bindDel);
      },
      onOk(n) {
        const val = (k) => { const el = n.querySelector('[data-k="' + k + '"]'); return el ? el.value.trim() : ''; };
        if (!val('name')) { UI.toast('请填写商品名称', 'warn'); return false; }
        if (!images[0]) { UI.toast('请上传至少一张商品主图', 'warn'); return false; }
        const specs = Array.from(n.querySelectorAll('[data-sku-row]')).map((row) => ({
          name: row.querySelector('[data-sku-name]').value.trim(),
          price: Number(row.querySelector('[data-sku-price]').value || 0),
          stock: Number(row.querySelector('[data-sku-stock]').value || 0),
          code: row.querySelector('[data-sku-code]').value.trim()
        })).filter((x) => x.name);
        const rec = Object.assign({}, g, {
          id: g.id || 'su' + Date.now(),
          name: val('name'), cat: val('cat'), brand: val('brand'), code: val('code'), unit: val('unit'),
          tags: val('tags').split('/').map((x) => x.trim()).filter(Boolean),
          price: Number(val('price') || 0), settle: Number(val('settle') || 0), cost: Number(val('cost') || 0),
          stock: Number(val('stock') || 0), safeStock: Number(val('safeStock') || 20),
          images: images.filter(Boolean), detail: editor.get(),
          specs: specs.length ? specs : [{ name: '标准装', price: Number(val('price') || 0), stock: Number(val('stock') || 0) }],
          fit: val('fit'), avoid: val('avoid').split('/').map((x) => x.trim()).filter(Boolean),
          shelfLife: val('shelfLife'), storage: val('storage'),
          shipping: val('shipping'), afterSale: val('afterSale'),
          attach: val('attach').split('/').map((x) => x.trim()).filter(Boolean),
          channels: val('channels').split('/').map((x) => x.trim()).filter(Boolean),
          on: on, sold: g.sold || 0
        });
        saveGood(rec, isNew);
      }
    });
  }

  function openGoodPreview(g) {
    ensure();
    UI.drawer({
      title: g.name, sub: '用户看到的商品详情（示意）', icon: 'eye', width: 460, okText: '关闭', footer: false,
      body: '<div class="gd-prod-preview">' +
        '<div class="gd-pp-hero"><img src="' + E((g.images || [])[0] || '') + '" alt=""></div>' +
        '<div class="gd-pp-b"><b style="font-size:15px">' + E(g.name) + '</b>' +
          '<div class="gd-price"><b>¥' + E(g.price) + '</b><span>结算 ¥' + E(g.settle) + ' · ' + E(g.unit || '盒') + '</span></div>' +
          '<div class="gd-meta">' + (g.tags || []).map((t) => '<span class="pill grey">' + E(t) + '</span>').join('') + '</div>' +
          '<div class="hairline"></div>' +
          Media.renderBlocks(g.detail) +
          '<div class="note" style="margin-top:8px">' + E(g.shipping || '') + ' · ' + E(g.afterSale || '') + '</div>' +
        '</div></div>'
    });
  }

  P['svc-goods'] = {
    app: 'all', grp: 'e.services', papp: 'employee', title: '实物商品', sub: '主图、图文详情、SKU、库存与挂载位',
    preview: 'emp-home',
    state: { cat: '全部' },
    render() {
      ensure();
      const st = P['svc-goods'].state;
      const all = Store.db.supplements;
      const cats = ['全部'].concat(Array.from(new Set(all.map((g) => g.cat))));
      const list = st.cat === '全部' ? all : all.filter((g) => g.cat === st.cat);
      const on = all.filter((g) => g.on);
      const noImg = all.filter((g) => !g.images || !g.images[0]);
      const noDetail = all.filter((g) => !g.detail || !g.detail.length);
      return K.head('实物商品', '这里不是一张商品表：图片、详情、规格、库存、物流、挂载位都在同一个商品里配齐',
        K.btn('导入商品', 'imp', { icon: 'upload' }) + K.btn('新增商品', 'newGoods', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '商品总数', v: all.length, unit: '个', d: '在售 ' + on.length, icon: 'gift' },
          { k: '缺主图', v: noImg.length, unit: '个', d: noImg.length ? '前台卡片会开天窗' : '全部有图', icon: 'image', tone: noImg.length ? 'down' : 'up' },
          { k: '缺图文详情', v: noDetail.length, unit: '个', d: noDetail.length ? '详情页内容不足' : '详情完整', icon: 'file', tone: noDetail.length ? 'down' : 'up' },
          { k: '缺货', v: all.filter((g) => !g.stock).length, unit: '个', d: '前台仍展示但不可下单', icon: 'package', tone: 'down' }
        ]) +
        '<div class="note" style="margin-bottom:12px">' + I('link', 14) + ' 商品可挂载到：全天食谱（随餐建议）· 搭配器 · 积分商城 · 订单。推荐规则在「吃好 · 食谱工程」里配置。</div>' +
        K.toolbar(K.tabs(cats.map((c) => ({ id: c, label: c, n: c === '全部' ? all.length : all.filter((g) => g.cat === c).length })), st.cat, 'gdCat'),
          '<div class="minisearch">' + I('search', 13) + '<input placeholder="搜索商品名称 / 编码" data-live-filter="goods"></div>') +
        '<div class="gd-grid">' + list.map((g) =>
          '<article class="gd-card" data-filter-item="goods" data-text="' + E(g.name + ' ' + (g.code || '') + ' ' + (g.cat || '')) + '" data-act="gdEdit" data-id="' + g.id + '">' +
            '<div class="gd-cover"><img src="' + E((g.images || [])[0] || '') + '" alt="">' +
              '<span class="gd-state"><span class="pill ' + (g.on ? 'green' : 'grey') + '">' + (g.on ? '在售' : '下架') + '</span></span>' +
              '<span class="gd-count">' + ((g.images || []).length) + ' 张图 · ' + ((g.specs || []).length || 1) + ' 规格</span></div>' +
            '<div class="gd-body"><b>' + E(g.name) + '</b><span class="gd-sub">' + E(g.cat + ' · ' + (g.code || '')) + '</span>' +
              '<div class="gd-price"><b>¥' + E(g.price) + '</b><span>结算 ¥' + E(g.settle) + ' · 库存 ' + E(g.stock) + '</span></div>' +
              '<div class="gd-meta">' + (g.tags || []).slice(0, 3).map((t) => '<span class="pill grey">' + E(t) + '</span>').join('') +
                (g.stock < 20 ? '<span class="pill amber">库存偏低</span>' : '') + '</div></div>' +
            '<div class="gd-foot"><button class="btn" data-act="gdEdit" data-id="' + g.id + '">' + I('edit', 13) + '编辑</button>' +
              '<button class="btn ghost" data-act="gdView" data-id="' + g.id + '">' + I('eye', 13) + '预览</button>' +
              '<button class="switch ' + (g.on ? 'on' : '') + '" data-toggle="supplements.' + UI.ix(all, g) + '.on"></button></div>' +
          '</article>').join('') + '</div>' +
        (list.length ? '' : K.empty('这个分类还没有商品', '切换分类或新增商品'));
    },
    actions: {
      gdCat(d) { P['svc-goods'].state.cat = d.id; App.refresh(); },
      newGoods() { openEditor({ on: true, cat: '基础营养', images: [], specs: [{ name: '标准装', price: 168, stock: 50 }], price: 168, settle: 132, cost: 82, stock: 50 }); },
      gdEdit(d) { const g = Store.db.supplements.find((x) => x.id === d.id); if (g) openEditor(g); },
      gdView(d) { const g = Store.db.supplements.find((x) => x.id === d.id); if (g) openGoodPreview(g); },
      imp() { UI.toast('请上传商品表 xlsx：名称 / 分类 / 售价 / 结算价 / 库存'); }
    }
  };
})();
