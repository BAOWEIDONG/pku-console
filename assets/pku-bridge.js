/* ============================================================================
   PKU Config Bridge v1
   三端 H5 共用：读取运营中台发布的 config.json，应用主题、联系方式、
   职工端模块显隐与服务上下架。所有改动可回退，不破坏前端默认值。
   ========================================================================== */
(function () {
  'use strict';
  var CONFIG_URL = 'https://baoweidong.github.io/pku-console/config.json?ts=';
  var channel = document.currentScript && document.currentScript.dataset.channel;
  if (!channel) {
    var h = location.hostname + location.pathname;
    channel = /employee/i.test(h) ? 'employee' : /versionall/i.test(h) ? 'camp' : 'brand';
  }
  var applied = false;

  function textReplace(root, map) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue;
      var changed = v;
      Object.keys(map).forEach(function (k) {
        if (k && changed.indexOf(k) >= 0) changed = changed.split(k).join(map[k]);
      });
      if (changed !== v) n.nodeValue = changed;
    });
  }

  function apply(cfg) {
    if (!cfg) return;
    applied = true;
    var theme = cfg.theme || {};
    var root = document.documentElement;
    if (theme.primary) root.style.setProperty('--pku-primary', theme.primary);
    if (theme.accent) root.style.setProperty('--pku-accent', theme.accent);
    root.setAttribute('data-pku-config', cfg.version || '');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && theme.primary) meta.setAttribute('content', theme.primary);

    var contact = cfg.contact || {};
    var map = {};
    if (contact.servicePhone) map['400-820-8866'] = contact.servicePhone;
    if (contact.hotline) map['010-6900 6688'] = contact.hotline;
    if (contact.address) map['北京市昌平区生命科学园路 1 号'] = contact.address;

    if (channel === 'employee' && cfg.employee) {
      var emp = cfg.employee;
      if (emp.site && emp.site.title) document.title = emp.site.title;
      if (emp.site && emp.site.servicePhone) map['400-820-8866'] = emp.site.servicePhone;

      var onMods = null;
      if (emp.modules) onMods = emp.modules.map(function (m) { return m.id; });
      document.querySelectorAll('.acc[data-id]').forEach(function (el) {
        var on = !onMods || onMods.indexOf(el.getAttribute('data-id')) >= 0;
        el.style.display = on ? '' : 'none';
        el.setAttribute('data-pku-hidden', on ? '0' : '1');
      });
      document.querySelectorAll('.gitem[data-mod]').forEach(function (el) {
        var on = !onMods || onMods.indexOf(el.getAttribute('data-mod')) >= 0;
        el.style.display = on ? '' : 'none';
      });

      var liveSvc = null;
      if (emp.services) liveSvc = emp.services.filter(function (s) { return s.status !== 'draft'; }).map(function (s) { return s.id; });
      document.querySelectorAll('[data-pid]').forEach(function (el) {
        var on = !liveSvc || liveSvc.indexOf(el.getAttribute('data-pid')) >= 0;
        el.style.display = on ? '' : 'none';
        el.setAttribute('data-pku-hidden', on ? '0' : '1');
      });
    }

    if (cfg.channelPages) {
      if (channel === 'employee') {
        var ep = cfg.channelPages.employee || {};
        var tabMap = { home: 'home', services: 'products', articles: 'discover', qa: 'discover', mine: 'mine' };
        document.querySelectorAll('.tab[data-tab]').forEach(function (el) {
          var page = el.getAttribute('data-tab');
          var key = Object.keys(tabMap).find(function (k) { return tabMap[k] === page; });
          var on = key ? ep[key] !== 0 : true;
          el.style.display = on ? '' : 'none';
        });
      }
      if (channel === 'brand') {
        var bp = cfg.channelPages.brand || {};
        var fileMap = { home: ['index.html', 'mobile.html'], hospitals: ['hospitals.html'], departments: ['departments.html', 'department.html'], team: ['team.html', 'member.html'], camp: ['camp.html'], about: ['brand.html'] };
        Object.keys(fileMap).forEach(function (key) {
          if (bp[key] === 0) {
            document.querySelectorAll('a[href]').forEach(function (a) {
              if (fileMap[key].some(function (f) { return a.getAttribute('href').indexOf(f) >= 0; })) a.style.display = 'none';
            });
          }
        });
      }
      if (channel === 'camp' && cfg.versionall && cfg.versionall.rankingOn === false) {
        document.querySelectorAll('button, a').forEach(function (el) {
          var t = (el.textContent || '').trim();
          if (t === '排行' || t === '排行榜' || t === '榜单') el.style.display = 'none';
        });
      }
    }

    if (Object.keys(map).length) textReplace(document.body, map);
    document.dispatchEvent(new CustomEvent('pku:config', { detail: cfg }));
  }

  function boot() {
    fetch(CONFIG_URL + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (cfg) {
        window.PKU_CONFIG = cfg;
        apply(cfg);
        var timer = null;
        var ob = new MutationObserver(function () {
          if (timer) return;
          timer = setTimeout(function () { timer = null; apply(cfg); }, 180);
        });
        ob.observe(document.body, { childList: true, subtree: true });
      })
      .catch(function () { /* 配置不可用时保持前端默认数据 */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
