/* ============================================================================
   UI kit — icons, overlays, form primitives, tables, charts
   ========================================================================== */
(function () {
  'use strict';

  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    activity: '<path d="M22 12h-4l-3 8-4-16-3 8H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9"/><path d="M12 8S9.5 2 7 3.5 8 8 12 8zM12 8s2.5-6 5-4.5S16 8 12 8z"/>',
    package: '<path d="m21 8-9-5-9 5v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    truck: '<rect x="1" y="6" width="13" height="11" rx="1.5"/><path d="M14 9h4l3 3.5V17h-7z"/><circle cx="5.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/>',
    message: '<path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/>',
    chart: '<path d="M3 21V9M9 21V4M15 21v-7M21 21V7"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    medal: '<circle cx="12" cy="15" r="5"/><path d="M8.5 11 6 3h4l2 5 2-5h4l-2.5 8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    hospital: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20M9 21v-5h6v5M12 7v4M10 9h4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 21h16"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    map: '<path d="m9 3-6 3v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.6"/><path d="m21 16-5-5-9 9"/>',
    video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4V8z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>',
    external: '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    command: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
    undo: '<path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.6-7.4L3 8"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7z"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    run: '<circle cx="13" cy="4" r="2"/><path d="m5 21 3-7 4 2 2-5 4 2 2-3"/><path d="m9 11 3-4"/>'
  };

  function icon(name, size) {
    const s = size || 16;
    const p = P[name] || P.grid;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* ------------------------------------------------------------ overlays */
  let overlayEl = null;

  function mountOverlay(node, onClose) {
    closeOverlay(true);
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.addEventListener('click', () => { closeOverlay(); if (onClose) onClose(); });
    document.body.appendChild(ov);
    document.body.appendChild(node);
    overlayEl = { ov: ov, node: node };
  }

  function closeOverlay(silent) {
    if (!overlayEl) return;
    const { ov, node } = overlayEl;
    overlayEl = null;
    ov.remove();
    node.remove();
    if (!silent) document.dispatchEvent(new CustomEvent('overlay:closed'));
  }

  function drawer(opts) {
    const n = document.createElement('div');
    n.className = 'drawer';
    n.style.width = (opts.width || 486) + 'px';
    n.innerHTML =
      '<div class="drawer-h">' +
        (opts.icon ? '<div class="ava lg ' + (opts.tone || '') + '">' + icon(opts.icon, 18) + '</div>' : '') +
        '<div class="tt"><h2>' + esc(opts.title) + '</h2>' + (opts.sub ? '<p>' + esc(opts.sub) + '</p>' : '') + '</div>' +
        '<button class="iconbtn x" data-x>' + icon('x', 17) + '</button>' +
      '</div>' +
      '<div class="drawer-b">' + opts.body + '</div>' +
      (opts.footer === false ? '' :
        '<div class="drawer-f"><div class="left">' + (opts.note || '') + '</div><div class="spacer"></div>' +
          (opts.extra || '') +
          '<button class="btn" data-x>取消</button>' +
          '<button class="btn primary" data-ok>' + (opts.okText || '保存') + '</button>' +
        '</div>');
    mountOverlay(n, opts.onClose);
    n.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => { closeOverlay(); if (opts.onClose) opts.onClose(); }));
    const ok = n.querySelector('[data-ok]');
    if (ok) ok.addEventListener('click', () => {
      if (opts.onOk) {
        const r = opts.onOk(n);
        if (r === false) return;
      }
      closeOverlay();
    });
    if (typeof opts.mount === 'function') opts.mount(n);
    return { close: closeOverlay, node: n };
  }

  function modal(opts) {
    const n = document.createElement('div');
    n.className = 'modal';
    n.innerHTML =
      '<div class="modal-h"><h3>' + esc(opts.title) + '</h3>' + (opts.desc ? '<p>' + esc(opts.desc) + '</p>' : '') + '</div>' +
      '<div class="modal-b">' + (opts.body || '') + '</div>' +
      '<div class="modal-f">' + (opts.cancelText === false ? '' : '<button class="btn" data-x>' + (opts.cancelText || '取消') + '</button>') +
      '<button class="btn ' + (opts.danger ? 'danger' : 'primary') + '" data-ok>' + (opts.okText || '确定') + '</button></div>';
    mountOverlay(n, opts.onClose);
    n.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => { closeOverlay(); if (opts.onCancel) opts.onCancel(); }));
    n.querySelector('[data-ok]').addEventListener('click', () => {
      if (opts.onOk) opts.onOk(n);
      if (!opts.keepOpen) closeOverlay();
    });
    if (typeof opts.mount === 'function') opts.mount(n);
    return { close: closeOverlay, node: n };
  }

  function confirm(opts) {
    return new Promise((resolve) => {
      modal({
        title: opts.title, desc: opts.desc, body: opts.body || '', danger: opts.danger,
        okText: opts.okText || '确认', cancelText: '取消',
        onOk: () => resolve(true), onCancel: () => resolve(false), onClose: () => resolve(false)
      });
    });
  }

  let toastTimer = null;
  function toast(msg, kind) {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast' + (kind === 'warn' ? ' warn' : '');
    t.innerHTML = '<i class="dot"></i><span>' + esc(msg) + '</span>';
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(6px)'; t.style.transition = 'all .25s'; setTimeout(() => t.remove(), 260); }, 2400);
  }

  /* ------------------------------------------------------------ form bits */
  function fInput(o) {
    const path = o.path ? ' data-set="' + o.path + '" data-kind="' + (o.kind || 'text') + '"' : '';
    return '<div class="field">' +
      (o.label ? '<label>' + esc(o.label) + (o.opt ? ' <em>选填</em>' : '') + '</label>' : '') +
      '<input class="input" ' + path + ' value="' + esc(o.value == null ? '' : o.value) + '" placeholder="' + esc(o.ph || '') + '" ' + (o.disabled ? 'disabled' : '') + '>' +
      (o.hint ? '<div class="hint">' + esc(o.hint) + '</div>' : '') +
      '</div>';
  }
  function fArea(o) {
    const path = o.path ? ' data-set="' + o.path + '" data-kind="text"' : '';
    return '<div class="field">' +
      (o.label ? '<label>' + esc(o.label) + '</label>' : '') +
      '<textarea class="input" ' + path + ' rows="' + (o.rows || 3) + '" placeholder="' + esc(o.ph || '') + '">' + esc(o.value == null ? '' : o.value) + '</textarea>' +
      (o.hint ? '<div class="hint">' + esc(o.hint) + '</div>' : '') +
      '</div>';
  }
  function fSelect(o) {
    const opts = o.options.map((x) => {
      const v = typeof x === 'string' ? x : x.v, l = typeof x === 'string' ? x : x.l;
      return '<option value="' + esc(v) + '"' + (String(o.value) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('');
    const path = o.path ? ' data-set="' + o.path + '" data-kind="' + (o.kind || 'text') + '"' : '';
    return '<div class="field">' + (o.label ? '<label>' + esc(o.label) + '</label>' : '') +
      '<select class="select" ' + path + '>' + opts + '</select>' +
      (o.hint ? '<div class="hint">' + esc(o.hint) + '</div>' : '') + '</div>';
  }
  function fNum(o) {
    const path = o.path ? ' data-set="' + o.path + '" data-kind="num"' : '';
    return '<div class="field">' + (o.label ? '<label>' + esc(o.label) + '</label>' : '') +
      '<input class="input tnum" type="number" ' + path + ' value="' + esc(o.value) + '" ' + (o.min != null ? 'min="' + o.min + '"' : '') + (o.max != null ? 'max="' + o.max + '"' : '') + '>' +
      (o.hint ? '<div class="hint">' + esc(o.hint) + '</div>' : '') + '</div>';
  }
  function fSwitch(o) {
    return '<div class="row" style="justify-content:space-between;padding:9px 0">' +
      '<div><div style="font-size:12.5px">' + esc(o.label) + '</div>' + (o.hint ? '<div class="hint">' + esc(o.hint) + '</div>' : '') + '</div>' +
      '<button class="switch ' + (o.value ? 'on' : '') + '" data-toggle="' + o.path + '"></button></div>';
  }
  function fRange(o) {
    return '<div class="field"><label>' + esc(o.label) + ' <em>' + (o.suffix || '') + '</em></label>' +
      '<div class="row"><input class="range" type="range" min="' + (o.min || 0) + '" max="' + (o.max || 100) + '" value="' + o.value + '" data-set="' + o.path + '" data-kind="num">' +
      '<b class="tnum" style="width:42px;text-align:right;font-weight:500">' + o.value + '</b></div></div>';
  }

  /* --------------------------------------------------------------- table */
  function table(cols, rows, opts) {
    opts = opts || {};
    if (!rows.length) return '<div class="empty"><b>' + (opts.emptyTitle || '暂无数据') + '</b>' + (opts.emptyHint || '调整筛选条件后再试') + '</div>';
    let h = '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
    cols.forEach((c) => { h += '<th style="' + (c.w ? 'width:' + c.w + ';' : '') + (c.align ? 'text-align:' + c.align : '') + '">' + c.label + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach((r) => {
      h += '<tr' + (r._id ? ' data-row="' + r._id + '"' : '') + '>';
      cols.forEach((c) => {
        const v = typeof c.render === 'function' ? c.render(r) : r[c.key];
        h += '<td style="' + (c.align ? 'text-align:' + c.align : '') + '">' + (v == null ? '' : v) + '</td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* -------------------------------------------------------------- charts */
  function lineChart(series, opts) {
    opts = opts || {};
    const W = 560, H = opts.height || 150, pad = { l: 8, r: 8, t: 10, b: 18 };
    const all = series.reduce((a, s) => a.concat(s.data), []);
    const min = opts.min != null ? opts.min : Math.min.apply(null, all) - 1;
    const max = opts.max != null ? opts.max : Math.max.apply(null, all) + 1;
    const n = Math.max.apply(null, series.map((s) => s.data.length));
    const x = (i) => pad.l + (W - pad.l - pad.r) * (n === 1 ? 0 : i / (n - 1));
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (max - min || 1));
    let h = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">';
    for (let i = 0; i <= 3; i++) {
      const yy = pad.t + (H - pad.t - pad.b) * (i / 3);
      h += '<line class="gl" x1="' + pad.l + '" y1="' + yy + '" x2="' + (W - pad.r) + '" y2="' + yy + '"/>';
    }
    series.forEach((s, si) => {
      const pts = s.data.map((v, i) => x(i) + ',' + y(v)).join(' ');
      const area = 'M' + x(0) + ',' + (H - pad.b) + ' L' + s.data.map((v, i) => x(i) + ',' + y(v)).join(' L') + ' L' + x(s.data.length - 1) + ',' + (H - pad.b) + ' Z';
      const color = s.color || ['#0b63e5', '#0aa39a', '#c8871a'][si % 3];
      if (opts.area !== false) h += '<path d="' + area + '" fill="' + color + '" opacity=".06"/>';
      h += '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      if (opts.dots) h += s.data.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="2.4" fill="#fff" stroke="' + color + '" stroke-width="2"/>').join('');
    });
    if (opts.labels) h += opts.labels.map((l, i) => '<text class="lbl" x="' + x(i) + '" y="' + (H - 4) + '" text-anchor="middle">' + esc(l) + '</text>').join('');
    return h + '</svg>';
  }

  function donut(pct, color, size, label) {
    const s = size || 96, r = s / 2 - 7, c = 2 * Math.PI * r;
    const col = color || '#0b63e5';
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" class="donut">' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="#eaf0f8" stroke-width="8"/>' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (c * pct / 100) + ' ' + c + '"/>' +
      '<text x="' + s / 2 + '" y="' + (s / 2 + 5) + '" text-anchor="middle" style="transform:rotate(90deg);transform-origin:' + s / 2 + 'px ' + s / 2 + 'px" font-size="16" font-weight="600" fill="#0b1626">' + (label != null ? label : pct + '%') + '</text>' +
      '</svg>';
  }

  function sparkbars(values, hot) {
    const max = Math.max.apply(null, values) || 1;
    return '<div class="sparkbars">' + values.map((v, i) => '<i style="height:' + Math.max(6, v / max * 100) + '%" class="' + (hot != null && i === hot ? 'hi' : (i >= values.length - 2 ? 'hi' : '')) + '"></i>').join('') + '</div>';
  }

  function avatar(name, tone) {
    return '<div class="ava ' + (tone || '') + '">' + esc(String(name || '?').slice(0, 1)) + '</div>';
  }

  function pill(text, tone) {
    return '<span class="pill ' + (tone || 'grey') + '">' + esc(text) + '</span>';
  }

  function statusPill(st) {
    const map = {
      active: ['进行中', 'green'], ended: ['已结营', 'grey'], upcoming: ['待开营', 'blue'], draft: ['草稿', 'grey'],
      pending: ['待处理', 'amber'], confirmed: ['已确认', 'blue'], shipped: ['已发货', 'green'], 'in-person': ['已线下发放', 'green'],
      completed: ['已完成', 'green'], cancelled: ['已取消', 'grey'], fulfilled: ['已发货', 'green'],
      published: ['已发布', 'green'], offline: ['已下架', 'grey'], online: ['已上线', 'green'],
      paused: ['已暂停', 'amber'], high: ['高风险', 'red'], mid: ['关注', 'amber'], low: ['正常', 'green']
    };
    const m = map[st] || [st, 'grey'];
    return pill(m[0], m[1]);
  }

  function copy(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => toast('已复制')); return; }
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); toast('已复制'); } catch (e) {}
    t.remove();
  }

  window.UI = {
    icon, esc, drawer, modal, confirm, toast, closeOverlay,
    fInput, fArea, fSelect, fNum, fSwitch, fRange,
    table, lineChart, donut, sparkbars, avatar, pill, statusPill, copy
  };
})();
