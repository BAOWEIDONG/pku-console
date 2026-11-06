/* ============================================================================
   Preview — 用同一份配置渲染对应 H5 页面（真联动，不是截图）
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc;

  const SCREENS = {
    versionall: [
      { id: 'student-home', label: '学员首页' },
      { id: 'student-checkin', label: '打卡规则' },
      { id: 'student-reward', label: '连续打卡' },
      { id: 'student-points', label: '积分商城' }
    ],
    pku: [
      { id: 'pku-home', label: '首页' },
      { id: 'pku-hospitals', label: '分院网络' },
      { id: 'pku-team', label: '师资团队' },
      { id: 'pku-camp', label: '健康营' }
    ],
    employee: [
      { id: 'emp-home', label: '首页' },
      { id: 'emp-services', label: '服务目录' },
      { id: 'emp-detail', label: '服务详情' }
    ]
  };

  const statusBar = '<div class="pv-status"><span>9:41</span><span class="bars"><i style="height:3px"></i><i style="height:5px"></i><i style="height:7px"></i></span></div>';

  function tabbar(active) {
    const items = [['首页', '⌂'], ['服务', '▤'], ['发现', '◈'], ['我的', '☺']];
    return '<div class="pv-tabbar">' + items.map((t, i) =>
      '<div class="' + (i === active ? 'on' : '') + '"><em>' + t[1] + '</em>' + t[0] + '</div>').join('') + '</div>';
  }

  function header(title, sub) {
    return '<div style="padding:2px 16px 12px"><div style="font-size:19px;font-weight:600;letter-spacing:-.03em">' + E(title) + '</div>' +
      (sub ? '<div style="font-size:9.5px;color:#7d8a9e;margin-top:3px">' + E(sub) + '</div>' : '') + '</div>';
  }

  /* ---------------------------------------------------------- versionall */
  function studentHome(db) {
    const v = db.versionall, s = v.students[0], a = v.activity, c = v.checkin;
    const mealsOn = Object.keys(c.meals).filter((k) => c.meals[k].on);
    const done = v.records.weight.filter((r) => r.studentId === s.id).length;
    let h = statusBar;
    h += '<div class="pv-hero"><div class="hi">第 7 期 · 第 18 天</div><div class="ht">早上好，' + E(s.name) + '</div>' +
      '<div class="hs">已连续打卡 ' + s.streak + ' 天 · 完成度 ' + s.completion + '%</div></div>';
    h += '<div class="pv-glass"><div class="pv-kpi">' +
      '<div><b>' + s.weight + '</b><span>当前体重 kg</span></div>' +
      '<div><b>' + (s.startWeight - s.weight).toFixed(1) + '</b><span>已减 kg</span></div>' +
      '<div><b>' + s.streak + '</b><span>连续打卡</span></div></div></div>';
    if (a.checkinStreak) {
      h += '<div class="pv-sec"><div class="pv-card" style="background:linear-gradient(150deg,#0b63e5,#0846a8);color:#fff">' +
        '<div style="font-size:10px;font-weight:600">' + E(a.entranceTitle) + '</div>' +
        '<div style="font-size:8.5px;opacity:.78;margin-top:3px;line-height:1.5">' + E(a.entranceDesc) + '</div>' +
        '<div style="margin-top:8px;height:4px;border-radius:4px;background:rgba(255,255,255,.25)"><div style="width:' + Math.min(100, s.streak / 28 * 100) + '%;height:100%;background:#fff;border-radius:4px"></div></div></div></div>';
    }
    h += '<div class="pv-sec"><h5>今日打卡 <span>' + done + ' / ' + (mealsOn.length + 2) + '</span></h5><div class="pv-card">';
    c.items.filter((i) => i.on).forEach((it) => {
      h += '<div class="pv-row"><div style="width:26px;height:26px;border-radius:8px;background:#eaf2ff;display:grid;place-items:center;font-size:11px">✓</div>' +
        '<div><div class="b">' + E(it.name) + '</div><div class="s">' + E(it.desc) + '</div></div>' +
        '<div style="margin-left:auto" class="pv-pill">+' + it.points + '</div></div>';
    });
    h += '</div></div>';
    h += '<div class="pv-sec"><h5>今日餐次</h5><div class="pv-card">';
    mealsOn.forEach((k) => {
      const mm = c.meals[k], names = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
      h += '<div class="pv-row"><div class="b">' + names[k] + '</div><div class="s" style="margin-left:auto">' + mm.start + ' – ' + mm.end + '</div></div>';
    });
    h += '</div></div>';
    h += '<div style="height:12px"></div>' + tabbar(0);
    return h;
  }

  function studentCheckin(db) {
    const c = db.versionall.checkin;
    let h = statusBar + '<div style="padding:8px 16px 4px;font-size:15px;font-weight:600">打卡规则</div>';
    h += '<div class="pv-sec"><div class="pv-card">';
    c.items.forEach((it) => {
      h += '<div class="pv-row"><div><div class="b">' + E(it.name) + '</div><div class="s">' + E(it.desc) + '</div></div>' +
        '<div style="margin-left:auto" class="pv-pill">' + (it.on ? '+' + it.points + ' 分' : '已关闭') + '</div></div>';
    });
    h += '</div></div>';
    h += '<div class="pv-sec"><h5>餐次时段</h5><div class="pv-card">';
    Object.keys(c.meals).forEach((k) => {
      const m = c.meals[k], names = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
      h += '<div class="pv-row"><div class="b">' + names[k] + '</div><div class="s" style="margin-left:auto">' + (m.on ? m.start + ' – ' + m.end : '未开启') + '</div></div>';
    });
    h += '</div></div>';
    h += '<div class="pv-sec"><div class="note" style="font-size:9px">每日积分上限 ' + c.points.dailyCap + ' 分 · 补打卡 ' + c.makeupDays + ' 天</div></div>';
    return h;
  }

  function studentReward(db) {
    const v = db.versionall, a = v.activity;
    const list = v.tiers.filter((t) => t.campId === 'camp1' && t.active).sort((x, y) => x.requiredDays - y.requiredDays);
    let h = statusBar + '<div class="pv-dark-hero"><div style="font-size:9px;opacity:.65">连续打卡奖励</div>' +
      '<div style="font-size:17px;font-weight:600;margin-top:3px">' + E(a.entranceTitle) + '</div>' +
      '<div style="font-size:9px;opacity:.62;margin-top:4px">' + E(a.entranceDesc) + '</div></div>';
    h += '<div class="pv-sec" style="margin-top:-12px"><div class="pv-card">';
    list.forEach((t) => {
      const ok = 18 >= t.requiredDays;
      h += '<div class="pv-row"><div style="width:38px;height:38px;border-radius:10px;background:#f2f6fb;display:grid;place-items:center;font-size:9px;color:#7d8a9e">' + E(t.image) + '</div>' +
        '<div><div class="b">' + E(t.name) + '</div><div class="s">连续 ' + t.requiredDays + ' 天 · 剩余 ' + t.stock + ' 件</div></div>' +
        '<div style="margin-left:auto" class="pv-pill" style="' + (ok ? '' : 'background:#f1f5fa;color:#9aa8bd') + '">' + (ok ? '可领取' : '未解锁') + '</div></div>';
    });
    h += '</div></div>';
    if (!list.length) h += '<div class="pv-off">本期暂未配置奖励</div>';
    return h;
  }

  function studentPoints(db) {
    const p = db.versionall.products.filter((x) => x.campId === 'camp1' && x.active);
    let h = statusBar + '<div class="pv-hero" style="padding-bottom:20px"><div class="hi">我的积分</div><div class="ht">1,280</div>' +
      '<div class="hs">积分商城 ' + (db.versionall.activity.pointsMall ? '已开启' : '已关闭') + '</div></div>';
    h += '<div class="pv-sec" style="margin-top:-10px"><div class="pv-card">';
    p.forEach((x) => {
      h += '<div class="pv-row"><div class="pv-img" style="width:40px;height:40px;flex:none">' + E(x.image) + '</div>' +
        '<div><div class="b">' + E(x.name) + '</div><div class="s">' + x.points + ' 积分 · 库存 ' + x.stock + '</div></div></div>';
    });
    h += '</div></div>';
    if (!p.length) h += '<div class="pv-off">商城暂未上架商品</div>';
    h += '<div class="pv-sec"><div class="pv-btn">' + (db.versionall.activity.pointsMall ? '去兑换' : '商城已关闭') + '</div></div>';
    return h;
  }

  /* ------------------------------------------------------------------ pku */
  function pkuHome(db) {
    const b = db.brand;
    let h = statusBar;
    h += '<div class="pv-hero" style="background:linear-gradient(165deg,#0d2a4d,#071a30);border-radius:0 0 24px 24px;padding-bottom:26px">' +
      '<div style="font-size:8px;letter-spacing:.18em;opacity:.55">PKU HEALTHCARE</div>' +
      '<div class="ht" style="margin-top:6px">' + E(b.home.heroTitle) + '</div>' +
      '<div class="hs">' + E(b.home.heroSub) + '</div></div>';
    h += '<div class="pv-sec" style="margin-top:-14px"><div class="pv-card" style="padding:10px">' +
      '<div class="pv-kpi">' + b.home.stats.map((s) => '<div><b>' + s.value + '</b><span>' + E(s.label) + '</span></div>').join('') + '</div></div></div>';
    h += '<div class="pv-sec"><h5>服务入口</h5><div class="pv-card">';
    b.home.entries.filter((e) => e.on).sort((a, c) => a.order - c.order).forEach((e) => {
      h += '<div class="pv-row"><div class="b">' + E(e.title) + '</div><div class="s" style="margin-left:auto">' + E(e.sub) + ' ›</div></div>';
    });
    h += '</div></div>';
    h += '<div class="pv-sec"><h5>精选专家 <span>' + b.home.featuredCount + ' 位</span></h5><div class="pv-card">';
    b.doctors.filter((d) => d.featured && d.on).slice(0, 3).forEach((d) => {
      h += '<div class="pv-row"><div style="width:30px;height:30px;border-radius:9px;background:#eaf2ff;display:grid;place-items:center;font-size:11px;color:#0b63e5">' + E(d.name.slice(0, 1)) + '</div>' +
        '<div><div class="b">' + E(d.name) + ' · ' + E(d.title) + '</div><div class="s">' + E(d.dept) + '</div></div></div>';
    });
    h += '</div></div><div style="height:14px"></div>';
    return h;
  }

  function pkuHospitals(db) {
    const b = db.brand;
    let h = statusBar + header('分院网络', '覆盖 ' + b.regions.length + ' 个地区 · ' + b.institutions.filter((i) => i.on).length + ' 家机构');
    h += '<div class="pv-sec" style="padding-top:0"><div class="pv-card">';
    b.regions.forEach((r) => {
      const n = b.institutions.filter((i) => i.region === r.id && i.on).length;
      h += '<div class="pv-row"><div style="width:8px;height:8px;border-radius:3px;background:' + r.color + '"></div>' +
        '<div><div class="b">' + E(r.name) + '</div><div class="s">' + E(r.summary) + '</div></div>' +
        '<div class="s" style="margin-left:auto">' + n + ' 家 ›</div></div>';
    });
    h += '</div></div><div class="pv-sec"><h5>北京地区</h5><div class="pv-card">';
    b.institutions.filter((i) => i.region === 'beijing' && i.on).forEach((i) => {
      h += '<div class="pv-row"><div><div class="b">' + E(i.name) + '</div><div class="s">' + E(i.city) + ' · ' + E(i.level) + '</div></div></div>';
    });
    h += '</div></div>';
    return h;
  }

  function pkuTeam(db) {
    const b = db.brand;
    let h = statusBar + header('师资团队', '医师 ' + b.home.stats[0].value + ' · 专家 ' + b.home.stats[1].value);
    h += '<div class="pv-sec" style="padding-top:0"><div class="row" style="gap:6px;margin-bottom:10px">' +
      ['全部', '医师', '专家', '运营'].map((t, i) => '<span class="pv-pill" style="' + (i === 0 ? '' : 'background:#f1f5fa;color:#7d8a9e') + '">' + t + '</span>').join('') + '</div>';
    h += '<div class="pv-card">';
    b.doctors.filter((d) => d.on).slice(0, 8).forEach((d) => {
      h += '<div class="pv-row"><div style="width:34px;height:34px;border-radius:10px;background:' + (d.expert ? '#eaf2ff' : '#f1f5fa') + ';display:grid;place-items:center;font-size:12px;color:' + (d.expert ? '#0b63e5' : '#7d8a9e') + '">' + E(d.name.slice(0, 1)) + '</div>' +
        '<div style="min-width:0"><div class="b">' + E(d.name) + ' <span class="s">' + E(d.title) + '</span></div><div class="s">' + E(d.dept) + ' · ' + E(d.hospital) + '</div></div></div>';
    });
    h += '</div></div>';
    return h;
  }

  function pkuCamp(db) {
    const c = db.brand.camp;
    let h = statusBar + '<div class="pv-dark-hero"><div style="font-size:8.5px;opacity:.6">' + E(c.edition) + ' · ' + E(c.status) + '</div>' +
      '<div style="font-size:18px;font-weight:600;margin-top:4px">' + E(c.name) + '</div>' +
      '<div style="font-size:9.5px;opacity:.7;margin-top:2px">' + E(c.theme) + '</div>' +
      '<div style="margin-top:9px;height:4px;border-radius:4px;background:rgba(255,255,255,.2)"><div style="width:' + (c.day / c.totalDays * 100) + '%;height:100%;border-radius:4px;background:#7cb6ff"></div></div>' +
      '<div style="font-size:8px;opacity:.6;margin-top:4px">第 ' + c.day + ' / ' + c.totalDays + ' 天</div></div>';
    h += '<div class="pv-sec" style="margin-top:-12px"><div class="pv-card"><div class="pv-kpi">' +
      c.highlights.slice(0, 3).map((x) => '<div><b style="font-size:9px">' + E(x.value) + '</b><span>' + E(x.label) + '</span></div>').join('') + '</div></div></div>';
    h += '<div class="pv-sec"><h5>项目团队 <span>' + c.roster.length + ' 人</span></h5><div class="pv-card">';
    c.roster.slice(0, 5).forEach((r) => {
      h += '<div class="pv-row"><div class="b">' + E(r.name) + ' <span class="s">' + E(r.role) + '</span></div><div class="s" style="margin-left:auto">' + E(r.hospital.replace('北京大学国际医院', '北大国际')) + '</div></div>';
    });
    h += '</div></div>';
    return h;
  }

  /* ------------------------------------------------------------- employee */
  function empHome(db) {
    const e = db.employee;
    const mods = e.modules.filter((m) => m.on);
    let h = statusBar;
    h += '<div class="pv-hero" style="background:linear-gradient(160deg,#f5520a,#b93a05);padding-bottom:18px">' +
      '<div class="hi">' + E(e.site.company) + '</div><div class="ht" style="font-size:17px">' + E(e.site.title) + '</div>' +
      '<div class="hs">' + mods.length + ' 大模块 · ' + e.services.filter((s) => s.on).length + ' 项职工健康服务</div></div>';
    const bn = e.banners.filter((b) => b.on)[0];
    if (bn) h += '<div style="margin:-10px 16px 0"><div class="pv-card" style="background:linear-gradient(140deg,#0b63e5,#08356f);color:#fff">' +
      '<div style="font-size:10px;font-weight:600">' + E(bn.title) + '</div><div style="font-size:8px;opacity:.75;margin-top:2px">' + E(bn.sub) + '</div></div></div>';
    h += '<div class="pv-sec"><h5>选服务</h5><div class="pv-card" style="padding:6px">';
    mods.forEach((m) => {
      const n = e.services.filter((s) => s.mod === m.id && s.on).length;
      h += '<div class="pv-row"><div style="width:26px;height:26px;border-radius:8px;background:' + m.tint + ';color:' + m.ink + ';display:grid;place-items:center;font-size:9px;font-weight:600">' + E(m.stab) + '</div>' +
        '<div><div class="b">' + E(m.name) + '</div><div class="s">' + E(m.sub) + '</div></div><div class="s" style="margin-left:auto">' + n + ' 项 ›</div></div>';
    });
    h += '</div></div>';
    h += '<div class="pv-sec"><h5>热门服务</h5><div class="pv-card">';
    e.services.filter((s) => s.hot && s.on).slice(0, 3).forEach((s) => {
      h += '<div class="pv-row"><div class="b">' + E(s.name) + '</div><div class="pv-pill" style="margin-left:auto">' + E(s.scope) + '</div></div>';
    });
    h += '</div></div>' + tabbar(0);
    return h;
  }

  function empServices(db, ctx) {
    const e = db.employee;
    const mod = (ctx && ctx.mod) || '';
    const list = e.services.filter((s) => s.on && (!mod || s.mod === mod));
    let h = statusBar + header('选服务', list.length + ' 项可预约服务');
    h += '<div class="pv-sec" style="padding-top:0"><div class="row" style="gap:5px;flex-wrap:wrap;margin-bottom:10px">' +
      '<span class="pv-pill">' + (mod ? E(e.modules.find((m) => m.id === mod).name) : '全部') + '</span></div><div class="pv-card">';
    list.slice(0, 12).forEach((s) => {
      h += '<div class="pv-row"><div style="min-width:0"><div class="b">' + E(s.name) + '</div><div class="s">' + E(s.tags.join(' · ')) + '</div></div>' +
        '<div class="s" style="margin-left:auto;flex:none">' + (s.bookable ? '可约 ›' : '咨询 ›') + '</div></div>';
    });
    h += '</div></div>' + tabbar(1);
    return h;
  }

  function empDetail(db, ctx) {
    const e = db.employee;
    const s = e.services.find((x) => x.id === (ctx && ctx.svc)) || e.services[0];
    const mod = e.modules.find((m) => m.id === s.mod) || e.modules[0];
    let h = statusBar + '<div class="pv-hero" style="background:linear-gradient(160deg,#f5520a,#b93a05);padding-bottom:16px">' +
      '<div style="font-size:8.5px;opacity:.72">' + E(mod.name) + ' · ' + E(s.scope) + '</div>' +
      '<div style="font-size:17px;font-weight:600;margin-top:4px;line-height:1.3">' + E(s.name) + '</div>' +
      '<div style="font-size:8px;opacity:.7;margin-top:3px">' + E(s.en) + '</div></div>';
    h += '<div class="pv-sec" style="margin-top:-10px"><div class="pv-card">' +
      '<div style="font-size:9px;line-height:1.65;color:#45526a">' + E(s.intro) + '</div>' +
      '<div class="row" style="gap:6px;margin-top:8px">' + s.tags.map((t) => '<span class="pv-pill">' + E(t) + '</span>').join('') + '</div></div></div>';
    h += '<div class="pv-sec"><h5>服务信息</h5><div class="pv-card">' +
      '<div class="pv-row"><div class="b">服务时长</div><div class="s" style="margin-left:auto">' + E(s.duration) + '</div></div>' +
      '<div class="pv-row"><div class="b">报告时效</div><div class="s" style="margin-left:auto">' + E(s.resp) + '</div></div>' +
      '<div class="pv-row"><div class="b">履约方式</div><div class="s" style="margin-left:auto">' + E(s.scope) + '</div></div></div></div>';
    if (s.bookable) h += '<div style="padding:12px 16px 20px"><div class="pv-btn">立即预约</div></div>';
    return h;
  }

  const MAP = {
    'student-home': studentHome, 'student-checkin': studentCheckin, 'student-reward': studentReward, 'student-points': studentPoints,
    'pku-home': pkuHome, 'pku-hospitals': pkuHospitals, 'pku-team': pkuTeam, 'pku-camp': pkuCamp,
    'emp-home': empHome, 'emp-services': empServices, 'emp-detail': empDetail
  };

  window.Preview = {
    SCREENS: SCREENS,
    render(screen, ctx) {
      const fn = MAP[screen] || MAP['student-home'];
      try { return fn(Store.db, ctx || {}); } catch (e) { return '<div class="pv-off">预览渲染失败</div>'; }
    }
  };
})();
