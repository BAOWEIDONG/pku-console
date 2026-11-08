/* ============================================================================
   Media — 图片素材库 + 图片选择器 + 图文块编辑器
   三端商品、轮播、文章共用同一份素材，上传即入库。
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;

  const SEED_NAMES = {
    g1: '商品图 · 蛋白补充', g2: '商品图 · 基础营养', g3: '商品图 · 心血管',
    g4: '商品图 · 肠道调理', g5: '商品图 · 骨骼关节', g6: '商品图 · 睡眠',
    g7: '商品图 · 代餐', g8: '商品图 · 礼盒', g9: '商品图 · 器械', g10: '商品图 · 耗材',
    f1: '首页横幅 · 体检预约', f2: '首页横幅 · 五高一重', f3: '首页横幅 · 心理支持',
    f4: '首页横幅 · 专家团队', f5: '首页横幅 · 健康营', f6: '首页横幅 · 分院网络',
    f7: '内容封面 · 慢病', f8: '内容封面 · 营养', f9: '内容封面 · 运动', f10: '内容封面 · 睡眠',
    f11: '科室配图 · 心血管', f12: '科室配图 · 消化', f13: '科室配图 · 骨科',
    f14: '科室配图 · 儿科', f15: '科室配图 · 妇科', f16: '科室配图 · 神经',
    f17: '科室配图 · 康复', f18: '品牌配图 · 集团'
  };

  function ensure() {
    const d = Store.db;
    if (!Array.isArray(d.media) || !d.media.length) {
      const img = window.IMG || {};
      d.media = Object.keys(img).map((k, i) => ({
        id: 'm' + (i + 1), name: SEED_NAMES[k] || ('素材 ' + (i + 1)),
        url: img[k], tag: k.indexOf('g') === 0 ? '商品' : k.indexOf('f') === 0 ? '内容' : '通用',
        size: '—', at: '2026-11-01'
      }));
    }
    if (!d.brand.banners) {
      const img = window.IMG || {};
      d.brand.banners = [
        { id: 'bb1', image: img.f4, title: '北医的专家，就在您身边', sub: '6 省 11 城 · 全周期医疗服务网络',
          linkType: 'page', link: 'team.html', order: 1, on: true, start: '2026-10-01', end: '2026-12-31', interval: 5 },
        { id: 'bb2', image: img.f5, title: '北医健康营', sub: '科学减重 · 多学科团队全程陪伴',
          linkType: 'page', link: 'camp.html', order: 2, on: true, start: '2026-10-01', end: '2026-12-31', interval: 5 },
        { id: 'bb3', image: img.f6, title: '覆盖 6 省 11 城', sub: '找到离您最近的分院与科室',
          linkType: 'page', link: 'hospitals.html', order: 3, on: true, start: '2026-10-01', end: '2026-12-31', interval: 5 }
      ];
    }
    if (!d.employee.banners) d.employee.banners = [];
    const fallback = ['f1', 'f2', 'f3', 'f7', 'f8'];
    d.employee.banners.forEach((b, i) => {
      if (!b.image) b.image = (window.IMG || {})[fallback[i % fallback.length]];
      if (b.order == null) b.order = i + 1;
      if (b.start == null) b.start = '2026-10-01';
      if (b.end == null) b.end = '2026-12-31';
      if (b.linkType == null) b.linkType = 'service';
      if (b.link == null) b.link = i === 0 ? 'annual-exam' : '';
      if (b.on == null) b.on = true;
      if (b.interval == null) b.interval = 5;
    });
    if (!d.versionall.banners) {
      d.versionall.banners = [
        { id: 'vb1', image: (window.IMG || {}).f9, title: '第 7 期 · 运动挑战', sub: '本周累计 150 分钟，解锁限定徽章',
          linkType: 'page', link: 'activities', order: 1, on: true, start: '2026-11-01', end: '2026-11-30' },
        { id: 'vb2', image: (window.IMG || {}).g7, title: '积分商城上新', sub: '低卡代餐 7 日装，限时 1200 积分',
          linkType: 'page', link: 'mall', order: 2, on: true, start: '2026-11-01', end: '2026-11-30' }
      ];
    }
    (d.employee.articles || []).forEach((a, i) => {
      if (!a.cover) a.cover = (window.IMG || {})['f' + (7 + (i % 4))];
      if (!Array.isArray(a.blocks) || !a.blocks.length) {
        a.blocks = [
          { type: 'text', text: (a.title || '') + '。' + (a.author ? '本文由' + a.author + '审核。' : '') },
          { type: 'image', url: a.cover, caption: a.title || '配图' },
          { type: 'quote', text: '以上内容用于健康科普，具体诊疗请以医生面诊为准。' }
        ];
      }
    });
    return d;
  }

  function list(tag) {
    ensure();
    const all = Store.db.media.slice();
    return tag ? all.filter((m) => m.tag === tag) : all;
  }

  function add(item) {
    ensure();
    const cur = Store.db.media;
    const rec = Object.assign({ id: 'm' + Date.now(), tag: '上传', size: '—', at: '2026-11-08' }, item);
    cur.unshift(rec);
    Store.mark('media', '素材库新增：' + (rec.name || '图片'));
    Store.persist();
    return rec;
  }

  /** 读取并压缩图片，避免 localStorage 被大图撑爆 */
  function readFile(file, cb) {
    if (!file || !/^image\//.test(file.type)) { UI.toast('请选择图片文件', 'warn'); return; }
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1440;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d');
        cx.drawImage(img, 0, 0, w, h);
        let data = '';
        try { data = cv.toDataURL('image/jpeg', 0.84); } catch (e) { data = String(fr.result); }
        cb(data, file.name || ('图片 ' + Date.now()));
      };
      img.onerror = () => cb(String(fr.result), file.name);
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  }

  function tempUpload(file, cb) {
    readFile(file, (url, name) => {
      const rec = add({ name: name, url: url, tag: '上传' });
      cb(url, rec);
    });
  }

  /** 独立层级的图片选择器：可以从抽屉里再次打开，不会关掉父级抽屉 */
  function pick(cb, opts) {
    opts = opts || {};
    ensure();
    const root = document.createElement('div');
    root.className = 'media-pick';
    root.innerHTML =
      '<div class="mp-mask" data-mp-x></div>' +
      '<div class="mp-panel">' +
        '<div class="mp-h"><div><h3>' + E(opts.title || '选择图片') + '</h3>' +
          '<p>上传后会进入共享素材库，商品、轮播、文章都可以复用</p></div>' +
          '<button class="iconbtn" data-mp-x>' + I('x', 16) + '</button></div>' +
        '<div class="mp-b">' +
          '<div class="mp-up" data-mp-up>' + I('upload', 20) +
            '<b>点击上传图片</b><span>支持 JPG / PNG / WEBP，自动压缩到 1440px</span>' +
            '<input type="file" accept="image/*" hidden data-mp-file></div>' +
          '<div class="mp-grid">' + list(opts.tag).map((m) =>
            '<button class="mp-item" data-url="' + E(m.url) + '" title="' + E(m.name) + '">' +
              '<img src="' + E(m.url) + '" alt="' + E(m.name) + '">' +
              '<span>' + E(m.name) + '</span></button>').join('') + '</div>' +
        '</div>' +
        '<div class="mp-f"><span class="small mut">素材库共 ' + list().length + ' 张</span>' +
          '<input class="input" data-mp-link placeholder="或粘贴图片 URL" style="max-width:280px">' +
          '<button class="btn primary" data-mp-linkok>使用链接</button></div>' +
      '</div>';
    document.body.appendChild(root);
    const close = () => root.remove();
    root.querySelectorAll('[data-mp-x]').forEach((x) => x.addEventListener('click', close));
    const fileEl = root.querySelector('[data-mp-file]');
    root.querySelector('[data-mp-up]').addEventListener('click', () => fileEl.click());
    fileEl.addEventListener('change', () => {
      const f = fileEl.files && fileEl.files[0];
      if (!f) return;
      tempUpload(f, (url) => { close(); cb(url); });
    });
    root.querySelectorAll('.mp-item').forEach((b) => b.addEventListener('click', () => {
      const url = b.dataset.url;
      close(); cb(url);
    }));
    root.querySelector('[data-mp-linkok]').addEventListener('click', () => {
      const v = root.querySelector('[data-mp-link]').value.trim();
      if (!v) { UI.toast('请先粘贴图片链接', 'warn'); return; }
      add({ name: '外链图片', url: v, tag: '外链' });
      close(); cb(v);
    });
  }

  /* --------------------------------------------------------------- 图文块 */
  function blank(type) {
    if (type === 'image') return { type: 'image', url: '', caption: '' };
    if (type === 'spec') return { type: 'spec', items: [{ k: '', v: '' }] };
    if (type === 'quote') return { type: 'quote', text: '' };
    return { type: 'text', text: '' };
  }

  function blockEditor(initial) {
    const blocks = (initial && initial.length ? JSON.parse(JSON.stringify(initial)) : [blank('text')]);
    let host = null;

    function rowTools(i) {
      return '<div class="bb-tools">' +
        '<button data-bb-up="' + i + '" title="上移">' + I('up', 12) + '</button>' +
        '<button data-bb-down="' + i + '" title="下移">' + I('down', 12) + '</button>' +
        '<button data-bb-del="' + i + '" title="删除">' + I('trash', 12) + '</button></div>';
    }

    function blockHTML(b, i) {
      if (b.type === 'image') {
        return '<div class="bblock bimg" data-type="image" data-i="' + i + '">' + rowTools(i) +
          (b.url ? '<img src="' + E(b.url) + '" alt="">' : '<div class="bimg-empty">' + I('image', 22) + '<span>还没有图片</span></div>') +
          '<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" data-bb-pick="' + i + '">' + I('upload', 13) + (b.url ? '替换图片' : '上传图片') + '</button>' +
          '<input class="input" data-bb-cap value="' + E(b.caption || '') + '" placeholder="图片说明（选填）"></div></div>';
      }
      if (b.type === 'spec') {
        return '<div class="bblock bspec" data-type="spec" data-i="' + i + '">' + rowTools(i) +
          '<div class="bb-spec-h">参数名</div><div class="bb-spec-h">参数值</div><div></div>' +
          (b.items || []).map((x, k) => '<input class="input" data-bb-k value="' + E(x.k) + '" placeholder="如 规格">' +
            '<input class="input" data-bb-v value="' + E(x.v) + '" placeholder="如 30 袋 / 盒">' +
            '<button class="iconbtn" data-bb-specdel="' + i + '|' + k + '">' + I('x', 12) + '</button>').join('') +
          '<button class="btn sm ghost" data-bb-specadd="' + i + '" style="grid-column:1/3">' + I('plus', 12) + '再加一行</button></div>';
      }
      if (b.type === 'quote') {
        return '<div class="bblock bquote" data-type="quote" data-i="' + i + '">' + rowTools(i) +
          '<textarea class="input" data-bb-text rows="2" placeholder="提示、注意事项、使用建议">' + E(b.text || '') + '</textarea></div>';
      }
      return '<div class="bblock btext" data-type="text" data-i="' + i + '">' + rowTools(i) +
        '<textarea class="input" data-bb-text rows="4" placeholder="输入商品介绍，支持分段；图片请用「图片块」插入">' + E(b.text || '') + '</textarea></div>';
    }

    function paint() {
      if (!host) return;
      host.innerHTML = '<div class="bb-list">' + blocks.map(blockHTML).join('') + '</div>' +
        '<div class="bb-add">' +
          '<button class="btn sm" data-bb-add="text">' + I('file', 13) + '文字</button>' +
          '<button class="btn sm" data-bb-add="image">' + I('image', 13) + '图片</button>' +
          '<button class="btn sm" data-bb-add="spec">' + I('layers', 13) + '参数表</button>' +
          '<button class="btn sm" data-bb-add="quote">' + I('shield', 13) + '提示</button>' +
        '</div>';
      bind();
    }

    function collect() {
      if (!host) return blocks;
      host.querySelectorAll('.bblock').forEach((el) => {
        const i = Number(el.dataset.i);
        const b = blocks[i];
        if (!b) return;
        if (b.type === 'text' || b.type === 'quote') {
          const ta = el.querySelector('[data-bb-text]');
          b[b.type === 'text' ? 'text' : 'text'] = ta ? ta.value : '';
        } else if (b.type === 'image') {
          const cap = el.querySelector('[data-bb-cap]');
          if (cap) b.caption = cap.value;
        } else if (b.type === 'spec') {
          const ks = el.querySelectorAll('[data-bb-k]');
          const vs = el.querySelectorAll('[data-bb-v]');
          b.items = Array.from(ks).map((k, n) => ({ k: k.value, v: vs[n] ? vs[n].value : '' }));
        }
      });
      return blocks;
    }

    function bind() {
      host.querySelectorAll('[data-bb-add]').forEach((b) => b.addEventListener('click', () => {
        collect(); blocks.push(blank(b.dataset.bbAdd)); paint();
      }));
      host.querySelectorAll('[data-bb-del]').forEach((b) => b.addEventListener('click', () => {
        collect(); blocks.splice(Number(b.dataset.bbDel), 1); paint();
      }));
      host.querySelectorAll('[data-bb-up]').forEach((b) => b.addEventListener('click', () => {
        collect(); const i = Number(b.dataset.bbUp); if (i <= 0) return;
        const t = blocks[i - 1]; blocks[i - 1] = blocks[i]; blocks[i] = t; paint();
      }));
      host.querySelectorAll('[data-bb-down]').forEach((b) => b.addEventListener('click', () => {
        collect(); const i = Number(b.dataset.bbDown); if (i >= blocks.length - 1) return;
        const t = blocks[i + 1]; blocks[i + 1] = blocks[i]; blocks[i] = t; paint();
      }));
      host.querySelectorAll('[data-bb-pick]').forEach((b) => b.addEventListener('click', () => {
        collect(); const i = Number(b.dataset.bbPick);
        pick((url) => { blocks[i].url = url; paint(); }, { tag: '商品' });
      }));
      host.querySelectorAll('[data-bb-specadd]').forEach((b) => b.addEventListener('click', () => {
        collect(); blocks[Number(b.dataset.bbSpecadd)].items.push({ k: '', v: '' }); paint();
      }));
      host.querySelectorAll('[data-bb-specdel]').forEach((b) => b.addEventListener('click', () => {
        collect(); const p = b.dataset.bbSpecdel.split('|').map(Number);
        const it = blocks[p[0]].items;
        if (it.length > 1) it.splice(p[1], 1); else it[0] = { k: '', v: '' };
        paint();
      }));
    }

    return {
      mount(node) { host = node; paint(); },
      get() { return collect(); }
    };
  }

  function renderBlocks(blocks) {
    if (!blocks || !blocks.length) return '<div class="empty small">还没有详情内容</div>';
    return '<div class="bview">' + blocks.map((b) => {
      if (b.type === 'image') return b.url ? '<figure class="bv-img"><img src="' + E(b.url) + '" alt="">' +
        (b.caption ? '<figcaption>' + E(b.caption) + '</figcaption>' : '') + '</figure>' : '';
      if (b.type === 'spec') return '<div class="bv-spec">' + (b.items || []).filter((x) => x.k || x.v).map((x, i) =>
        '<div><span>' + E(x.k) + '</span><b>' + E(x.v) + '</b></div>').join('') + '</div>';
      if (b.type === 'quote') return '<div class="bv-quote">' + E(b.text) + '</div>';
      return '<div class="bv-text">' + String(b.text || '').split(/\n+/).filter(Boolean).map((p) => '<p>' + E(p) + '</p>').join('') + '</div>';
    }).join('') + '</div>';
  }

  window.Media = { ensure, list, add, pick, tempUpload, readFile, blockEditor, renderBlocks, blank };
  window.V8 = {
    ensure() {
      ensure();
      const d = Store.db;
      if (parseFloat(d.meta.version) < 8) d.meta.version = '8.0.0';
      Store.persist();
    }
  };
})();
