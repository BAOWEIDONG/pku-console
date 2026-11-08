/* ============================================================================
   PageKit — 页面级排版原语，保证 30+ 页视觉一致
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc;
  const I = UI.icon;

  const K = {
    head(title, desc, actions, eyebrow) {
      const help = window.PAGE_HELP && window.App && window.PAGE_HELP[App.route];
      return '<div class="page-head"><div class="t">' +
        (eyebrow ? '<div class="crumb" style="margin-bottom:7px">' + eyebrow + '</div>' : '') +
        '<h1>' + E(title) + '</h1>' + (desc ? '<p>' + E(desc) + '</p>' : '') + '</div>' +
        (actions ? '<div class="h-actions">' + actions + '</div>' : '') + '</div>' +
        (help ? '<div class="page-help">' +
          '<div><b>这页做什么</b><span>' + E(help.what) + '</span></div>' +
          '<div><b>改完影响哪里</b><span>' + E(help.front) + '</span></div>' +
          '<div class="who"><b>谁负责</b><span>' + E(help.who) + '</span></div></div>' : '');
    },
    btn(label, act, opts) {
      opts = opts || {};
      return '<button class="btn ' + (opts.cls || '') + '" ' + (act ? 'data-act="' + act + '"' : '') +
        (opts.id != null ? ' data-id="' + opts.id + '"' : '') + '>' + (opts.icon ? I(opts.icon, 15) : '') + E(label) + '</button>';
    },
    iconBtn(icon, act, id, title) {
      return '<button class="iconbtn" data-act="' + act + '"' + (id != null ? ' data-id="' + id + '"' : '') + ' title="' + E(title || '') + '">' + I(icon, 16) + '</button>';
    },
    kpis(list) {
      return '<div class="kpis">' + list.map((x) =>
        '<div class="kpi"><div class="k">' + (x.icon ? I(x.icon, 13) : '') + E(x.k) + '</div>' +
        '<div class="v">' + x.v + (x.unit ? '<small>' + E(x.unit) + '</small>' : '') + '</div>' +
        '<div class="d ' + (x.tone || '') + '">' + (x.d || '') + '</div></div>').join('') + '</div>';
    },
    panel(o) {
      return '<section class="panel ' + (o.cls || '') + '">' +
        (o.title ? '<div class="panel-h"><h3>' + E(o.title) + '</h3>' + (o.sub ? '<span class="sub">' + E(o.sub) + '</span>' : '') +
          (o.actions ? '<div class="right">' + o.actions + '</div>' : '') + '</div>' : '') +
        '<div class="panel-b ' + (o.flush ? 'flush' : '') + '">' + o.body + '</div></section>';
    },
    toolbar(left, right) {
      return '<div class="toolbar">' + (left || '') + '<div class="sp"></div>' + (right || '') + '</div>';
    },
    search(ph, act) {
      return '<div class="minisearch">' + I('search', 14) + '<input placeholder="' + E(ph || '搜索') + '" data-filter="' + (act || '') + '"></div>';
    },
    tabs(items, active, act) {
      return '<div class="tabs">' + items.map((t) =>
        '<button data-act="' + act + '" data-id="' + t.id + '" class="' + (t.id === active ? 'on' : '') + '">' + E(t.label) +
        (t.n != null ? '<span class="n">' + t.n + '</span>' : '') + '</button>').join('') + '</div>';
    },
    seg(items, active, act) {
      return '<div class="seg">' + items.map((t) =>
        '<button data-act="' + act + '" data-id="' + t.id + '" class="' + (t.id === active ? 'on' : '') + '">' + E(t.label) + '</button>').join('') + '</div>';
    },
    empty(title, hint) {
      return '<div class="empty"><b>' + E(title || '暂无数据') + '</b>' + E(hint || '') + '</div>';
    },
    listrow(inner) { return '<div class="listrow">' + inner + '</div>'; },
    progress(pct) { return '<div class="progress"><b style="width:' + Math.min(100, pct) + '%"></b></div>'; }
  };

  window.K = K;
})();
