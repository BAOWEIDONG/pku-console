/* ============================================================================
   五好生活：产品模型（五维 × 档位 × 任务 × 指数）× 运营
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const FG = () => Store.db.fivegood;

  function radar(dims, size) {
    const s = size || 190, cx = s / 2, cy = s / 2 + 4, r = s / 2 - 26;
    const pt = (i, v) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      const rr = r * (v / 100);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    };
    let h = '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">';
    [0.25, 0.5, 0.75, 1].forEach((k) => {
      h += '<polygon points="' + [0, 1, 2, 3, 4].map((i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
        return (cx + Math.cos(a) * r * k) + ',' + (cy + Math.sin(a) * r * k);
      }).join(' ') + '" fill="none" stroke="#e8eef7" stroke-width="1"/>';
    });
    const pts = dims.map((d, i) => pt(i, d.avg || 60));
    h += '<polygon points="' + pts.map((p) => p.join(',')).join(' ') + '" fill="rgba(11,99,229,.12)" stroke="#0b63e5" stroke-width="1.6"/>';
    pts.forEach((p, i) => { h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#0b63e5"/>'; });
    dims.forEach((d, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      const lx = cx + Math.cos(a) * (r + 16), ly = cy + Math.sin(a) * (r + 15);
      h += '<text x="' + lx + '" y="' + ly + '" font-size="10" fill="#7c8aa0" text-anchor="middle">' + E(d.name) + '</text>';
    });
    return h + '</svg>';
  }

  P['fg-overview'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '五好生活', sub: '年度会员制产品 · 五维打分 · 月度可感知',
    preview: 'emp-home',
    render() {
      const fg = FG();
      const ms = fg.members;
      const avg = +(ms.reduce((a, b) => a + b.score, 0) / ms.length).toFixed(1);
      const pass = Math.round(ms.filter((m) => m.score >= fg.scoreRule.pass).length / ms.length * 100);
      const dimAvg = fg.dims.map((d) => ({ ...d, avg: Math.round(ms.reduce((a, b) => a + b.dims[d.key], 0) / ms.length) }));
      return K.head('五好生活', fg.program.slogan + ' · ' + (fg.program.status === 'beta' ? '内测中' : '已上线'),
        K.btn('会员视角预览', 'preview', { icon: 'eye', cls: 'ghost' }) + K.btn('配置五好', 'goConfig', { icon: 'sliders', cls: 'primary' })) +
        K.kpis([
          { k: '在册会员', v: 186, unit: '人', d: '进阶版 116 · 尊享 23', icon: 'users' },
          { k: '平均五好指数', v: avg, unit: '', d: '达标线 ' + fg.scoreRule.pass, tone: avg >= fg.scoreRule.pass ? 'up' : 'down', icon: 'target' },
          { k: '达标率', v: pass, unit: '%', d: '较上月 +4pt', tone: 'up', icon: 'check' },
          { k: '年度续费意向', v: '73', unit: '%', d: '基于 42 份回访', icon: 'refresh' }
        ]) +
        '<div class="grid g-1-2">' +
          K.panel({ title: '五维画像', sub: '全员平均', body: '<div style="display:grid;place-items:center;padding:4px 0">' + radar(dimAvg, 210) + '</div>' +
            '<div class="stack" style="gap:8px;margin-top:6px">' + dimAvg.map((d) => '<div class="row small"><i style="width:7px;height:7px;border-radius:2px;background:' + d.color + '"></i>' +
              '<span class="mut" style="width:32px">' + d.name + '</span><div style="flex:1">' + K.progress(d.avg) + '</div><b class="tnum">' + d.avg + '</b></div>').join('') + '</div>' }) +
          '<div class="stack">' +
            K.panel({ title: '产品结构', sub: '三个档位', body: '<div class="stack" style="gap:12px">' + fg.tiers.map((t) => {
              const n = ms.filter((m) => m.tier === t.name).length;
              return '<div class="row" style="padding:10px 12px;border:1px solid var(--line);border-radius:10px">' +
                '<div style="flex:1"><div class="row" style="gap:8px"><b style="font-size:12.5px">' + E(t.name) + '</b><span class="small mut">' + E(t.target) + '</span></div>' +
                '<div class="small mut" style="margin-top:3px">' + E(t.benefits) + '</div></div>' +
                '<div style="text-align:right"><b class="tnum">¥' + t.price + '</b><div class="small mut">' + n + ' 人</div></div></div>';
            }).join('') + '</div>' }) +
            K.panel({ title: '会员', sub: '按指数排序', flush: true, body: UI.table([
              { label: '会员', render: (m) => '<div class="cellflex">' + UI.avatar(m.name, 'g') + '<div><div class="strong">' + E(m.name) + '</div><div class="small muted">' + E(m.tier) + '</div></div></div>' },
              { label: '五好指数', render: (m) => '<div class="row" style="gap:8px"><div style="width:64px">' + K.progress(m.score) + '</div><b class="small tnum">' + m.score + '</b></div>' },
              { label: '状态', render: (m) => m.status === 'risk' ? UI.pill('需干预', 'red') : m.status === 'paused' ? UI.pill('暂停', 'grey') : UI.pill('正常', 'green') }
            ], ms.slice(0, 6).map((m) => Object.assign({ _id: m.id }, m))) })
          + '</div>' +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '落地路线', sub: '从产品到可交付的四步', body: '<div class="grid g-4">' +
          [['1', '先把"五好"做成可售包', '定价与权益写进服务包，员工可按档位购买或企业统一采购。'],
           ['2', '五维评估打基线', '入组时做 5 份小评估，生成个人五好指数与短板维度。'],
           ['3', '月度任务驱动', '每周每维 1 个动作，打卡累积积分，月度出指数变化。'],
           ['4', '年度报告与续费', '12 个月后出结营式年度报告，用改善数据支撑续费。']].map((x) =>
            '<div class="panel" style="padding:14px;box-shadow:none"><div class="ava" style="border-radius:8px;width:24px;height:24px;font-size:11px">' + x[0] + '</div>' +
            '<div style="font-size:12.5px;font-weight:600;margin-top:8px">' + E(x[1]) + '</div><div class="small mut" style="margin-top:4px;line-height:1.7">' + E(x[2]) + '</div></div>').join('') +
          '</div>' });
    },
    actions: {
      preview() { App.setPreview('emp-home'); },
      goConfig() { App.go('fg-config'); }
    }
  };

  P['fg-config'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '五好配置', sub: '维度权重、权益、任务库与评分规则',
    preview: 'emp-home',
    state: { tab: 'dims' },
    render() {
      const fg = FG();
      const st = P['fg-config'].state;
      const sumW = fg.dims.reduce((a, d) => a + d.weight, 0);
      let body;
      if (st.tab === 'dims') {
        body = K.panel({ title: '五个维度', sub: '权重合计 ' + sumW + '%' + (sumW !== 100 ? '（应为 100%）' : ''), flush: true,
          body: UI.table([
            { label: '维度', render: (d) => '<div class="row"><span style="font-size:15px">' + d.icon + '</span><b>' + E(d.name) + '</b></div>' },
            { label: '核心指标', render: (d) => '<span class="small">' + E(d.metric) + '</span>' },
            { label: '目标', align: 'right', render: (d) => '<span class="tnum">' + d.target + '</span>' },
            { label: '权重', w: '90px', render: (d) => '<input class="input tnum" style="height:28px;text-align:center" value="' + d.weight + '" data-set="fivegood.dims.' + UI.ix(fg.dims, d) + '.weight" data-kind="num">' },
            { label: '权益', render: (d) => '<span class="small muted">' + E(d.benefit) + '</span>' },
            { label: '', align: 'right', render: (d) => '<div class="rowact"><button data-act="editDim" data-id="' + d.key + '">' + I('edit', 14) + '</button></div>' }
          ], fg.dims.map((d) => Object.assign({ _id: d.key }, d))) }) +
          (sumW !== 100 ? '<div class="note warn" style="margin-top:12px">权重合计 ' + sumW + '%，请调整到 100% 后再上线。</div>' : '');
      } else if (st.tab === 'tasks') {
        body = K.panel({ title: '任务库', sub: '每周每维 1 个动作', flush: true,
          actions: K.btn('新增任务', 'newTask', { icon: 'plus', cls: 'sm' }),
          body: UI.table([
            { label: '周次', render: (t) => '<span class="tnum small">W' + t.week + '</span>' },
            { label: '维度', render: (t) => UI.pill((fg.dims.find((d) => d.key === t.dim) || {}).name || t.dim, 'grey') },
            { label: '任务', render: (t) => '<b>' + E(t.title) + '</b>' },
            { label: '类型', render: (t) => UI.pill(t.type, 'blue') },
            { label: '积分', align: 'right', render: (t) => '<span class="tnum">+' + t.points + '</span>' },
            { label: '启用', render: (t) => '<button class="switch ' + (t.on ? 'on' : '') + '" data-toggle="fivegood.tasks.' + UI.ix(fg.tasks, t) + '.on"></button>' }
          ], fg.tasks.map((t) => Object.assign({ _id: t.id }, t))) });
      } else {
        body = '<div class="grid g-2">' +
          K.panel({ title: '评分规则', body: '<div class="stack" style="gap:14px">' +
            UI.fNum({ label: '基线分', value: fg.scoreRule.base, path: 'fivegood.scoreRule.base', hint: '各维达成 60 分起算' }) +
            UI.fNum({ label: '达标线', value: fg.scoreRule.pass, path: 'fivegood.scoreRule.pass' }) +
            UI.fNum({ label: '优秀线', value: fg.scoreRule.excellent, path: 'fivegood.scoreRule.excellent' }) +
            UI.fSelect({ label: '报告周期', value: fg.scoreRule.reportCycle, options: [{ v: 'month', l: '月度' }, { v: 'quarter', l: '季度' }], path: 'fivegood.scoreRule.reportCycle' }) +
            '</div>' }) +
          K.panel({ title: '上线检查', body: '<div class="stack" style="gap:10px">' +
            [['五维评估问卷已配置', true], ['服务包与价格已上架', true], ['任务库 ≥ 20 条', false], ['月度报告模板', false], ['会员端入口已投放', true]].map((x) =>
              '<div class="row small"><span class="pill ' + (x[1] ? 'green' : 'amber') + '">' + (x[1] ? '已完成' : '待完成') + '</span><span>' + x[0] + '</span></div>').join('') +
            '</div><div class="note" style="margin-top:12px">完成 5 项检查后可切到「已上线」，员工端才会出现入口。</div>' }) +
        '</div>';
      }
      return K.head('五好配置', '维度、任务与评分决定会员看到的五好指数',
        K.btn('保存并发布', 'publish', { icon: 'send', cls: 'primary' })) +
        K.tabs([{ id: 'dims', label: '维度与权益', n: 5 }, { id: 'tasks', label: '任务库', n: fg.tasks.length }, { id: 'score', label: '评分与上线' }], st.tab, 'fgTab') +
        body;
    },
    actions: {
      fgTab(d) { P['fg-config'].state.tab = d.id; App.refresh(); },
      publish() { App.openPublish('五好生活配置'); },
      editDim(d) {
        const fg = FG(), dim = fg.dims.find((x) => x.key === d.id), i = fg.dims.indexOf(dim);
        UI.drawer({ title: '编辑维度', sub: dim.name, icon: 'target',
          body: '<div class="formsec"><h4>定义</h4>' + UI.fInput({ label: '名称', value: dim.name, path: 'fivegood.dims.' + i + '.name' }) +
            UI.fInput({ label: '核心指标', value: dim.metric, path: 'fivegood.dims.' + i + '.metric' }) +
            UI.fNum({ label: '年度目标', value: dim.target, path: 'fivegood.dims.' + i + '.target' }) +
            UI.fNum({ label: '权重（%）', value: dim.weight, path: 'fivegood.dims.' + i + '.weight' }) +
            UI.fInput({ label: '包含权益', value: dim.benefit, path: 'fivegood.dims.' + i + '.benefit' }) + '</div>',
          onOk() { UI.toast('维度已更新'); App.refresh(); } });
      },
      newTask() {
        UI.formDrawer({ title: '新增任务', sub: '会员每周会收到该维度的任务', icon: 'check',
          fields: [{ key: 'title', label: '任务内容' },
            { key: 'dim', label: '维度', type: 'select', options: FG().dims.map((d) => ({ v: d.key, l: d.name })) },
            { key: 'week', label: '周次', type: 'num', value: 4 },
            { key: 'points', label: '积分', type: 'num', value: 10 }],
          onSave(v) { Store.pushItem('fivegood.tasks', { id: 't' + Date.now(), dim: v.dim, week: v.week, title: v.title || '新任务', type: '打卡', points: v.points, on: true }, '新增任务'); UI.toast('任务已创建'); App.refresh(); } });
      }
    }
  };
})();
