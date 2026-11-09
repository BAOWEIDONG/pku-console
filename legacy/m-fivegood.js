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

  function fgChain() {
    const steps = [
      { n: '01', t: '产品与档位', d: '五维权重、三档权益、价格与周期', r: 'fg-config' },
      { n: '02', t: '评估基线', d: '问卷题目、维度权重、高风险触发', r: 'fg-survey' },
      { n: '03', t: '五维内容', d: '吃、睡、动、心、查的方案与食谱', r: 'fg-eat' },
      { n: '04', t: '任务发布', d: '每周动作、积分、人群与截止时间', r: 'fg-tasks' },
      { n: '05', t: '打卡审核', d: '饮食/运动/睡眠凭证、通过或驳回', r: 'fg-coach' },
      { n: '06', t: '信号升级', d: '低活跃、异常指标、心理信号转关怀', r: 'fg-escalation' },
      { n: '07', t: '隐私授权', d: '采集范围、可见角色、是否进企业报告', r: 'fg-privacy' },
      { n: '08', t: '报告与续费', d: '月度指数、年度报告、续费意向', r: 'fg-report' }
    ];
    return K.panel({ title: '五好生活运营链路', sub: '从会员入组到年度续费，每一步都要有配置、有责任人、有数据回流', cls: 'chain-panel',
      actions: K.btn('看运营闭环', 'goLoop', { cls: 'ghost sm', icon: 'refresh' }),
      body: '<div class="chain-grid">' + steps.map((x) =>
        '<button class="chain-step" data-act="go" data-id="' + x.r + '"><span class="cs-n">' + x.n + '</span><div><b>' + x.t + '</b><span>' + x.d + '</span></div></button>').join('') +
      '</div><div class="chain-foot"><span class="small mut">关键原则：任务必须挂在五维之一；打卡审核通过才计分；异常信号先进关怀、严重时才升级健康计划；心理数据默认不进企业报告。</span>' +
        '<button class="btn sm" data-act="go" data-id="fg-loop">查看转化漏斗 ' + I('chevron', 11) + '</button></div>' });
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
        K.btn('会员运营', 'goMembers', { icon: 'users' }) + K.btn('打卡审核', 'goCoach', { icon: 'check' }) + K.btn('配置五好', 'goConfig', { icon: 'sliders', cls: 'primary' })) +
        fgChain() +
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
      goConfig() { App.go('fg-config'); },
      goMembers() { App.go('fg-members'); },
      goCoach() { App.go('fg-coach'); },
      goLoop() { App.go('fg-loop'); },
      go(d) { App.go(d.id); }
    }
  };


  /* ------------------------------------------------------ 五好评估问卷 */
  P['fg-survey'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '五好评估问卷', sub: '入组基线数据的来源，决定五维指数从哪算起',
    preview: 'emp-home',
    render() {
      const fg = FG();
      const sv = Store.db.fivegood.survey || (Store.db.fivegood.survey = {
        intro: '用 3 分钟完成 10 道题，我们会生成你的五好基线与短板维度。',
        force: true, questions: [
          { id: 'sq1', dim: 'eat', text: '你每天吃早餐的频率是？', opts: ['几乎每天', '每周 3–4 天', '很少'], weight: 30 },
          { id: 'sq2', dim: 'eat', text: '你每天蔬菜摄入大约多少？', opts: ['≥500g', '200–500g', '不足 200g'], weight: 40 },
          { id: 'sq3', dim: 'eat', text: '每周外卖或外出就餐次数？', opts: ['≤3 次', '4–8 次', '>8 次'], weight: 30 },
          { id: 'sq4', dim: 'sleep', text: '你平均每晚睡眠时长？', opts: ['≥7 小时', '6–7 小时', '<6 小时'], weight: 50 },
          { id: 'sq5', dim: 'sleep', text: '入睡困难或早醒的频率？', opts: ['几乎没有', '偶尔', '经常'], weight: 50 },
          { id: 'sq6', dim: 'move', text: '每周中等强度运动时长？', opts: ['≥150 分钟', '60–150 分钟', '<60 分钟'], weight: 60 },
          { id: 'sq7', dim: 'move', text: '每天久坐时长？', opts: ['<6 小时', '6–9 小时', '>9 小时'], weight: 40 },
          { id: 'sq8', dim: 'mind', text: '近一个月压力自评（0–10）', opts: ['0–3', '4–6', '7–10'], weight: 60 },
          { id: 'sq9', dim: 'mind', text: '是否经常感到情绪低落？', opts: ['很少', '有时', '经常'], weight: 40 },
          { id: 'sq10', dim: 'check', text: '最近一次体检距今？', opts: ['1 年内', '1–2 年', '超过 2 年'], weight: 100 }
        ]
      });
      const sv2 = Store.db.fivegood.survey;
      const byDim = (k) => sv2.questions.filter((q) => q.dim === k).length;
      return K.head('五好评估问卷', sv2.questions.length + ' 题 · 覆盖 5 个维度',
        K.btn('试填问卷', 'previewQ', { icon: 'eye', cls: 'ghost' }) + K.btn('新增题目', 'newQ', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '题目数', v: sv2.questions.length, unit: '题', d: '平均用时 3 分钟', icon: 'file' },
          { k: '完成率', v: '82', unit: '%', d: '186 名会员中 152 人已填', icon: 'check' },
          { k: '高风险命中', v: 27, unit: '人', d: '推送健康管理师跟进', tone: 'down', icon: 'shield' },
          { k: '最近更新', v: '11-06', d: '王雪 · 营养师', icon: 'clock' }
        ]) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '问卷设置', body: UI.fArea({ label: '引导语', value: sv2.intro, rows: 2, path: 'fivegood.survey.intro' }) +
            '<div class="hairline"></div>' + UI.fSwitch({ label: '入组强制填写', value: sv2.force, path: 'fivegood.survey.force' }) }) +
          K.panel({ title: '题目', sub: '按维度分组', flush: true,
            body: '<div style="padding:6px 18px 12px">' + fg.dims.map((d) => {
              const qs = sv2.questions.filter((q) => q.dim === d.key);
              return '<div style="margin-bottom:10px"><div class="row" style="gap:6px;margin-bottom:4px"><span>' + d.icon + '</span><b style="font-size:12px">' + E(d.name) + '</b><span class="small mut">' + qs.length + ' 题</span></div>' +
                qs.map((q) => '<div class="listrow" style="padding:8px 0 8px 10px"><div class="meta"><b>' + E(q.text) + '</b><span>' + q.opts.length + ' 个选项 · 权重 ' + q.weight + '</span></div>' +
                '<button class="iconbtn right" data-act="editQ" data-id="' + q.id + '">' + I('edit', 13) + '</button></div>').join('') + '</div>';
            }).join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '维度覆盖', body: '<div class="stack" style="gap:10px">' + fg.dims.map((d) =>
            '<div class="row small"><span style="width:32px">' + d.name + '</span><div style="flex:1">' + K.progress(byDim(d.key) / 3 * 100) + '</div><b class="tnum">' + byDim(d.key) + '</b></div>').join('') +
            '</div><div class="note" style="margin-top:10px">每个维度建议 ≥2 题，少于 2 题无法形成基线。</div>' }) +
          K.panel({ title: '结果怎么用', body: '<div class="small mut" style="line-height:1.9">' +
            '① 每题按选项折算 0–100 分<br>② 维度分 = 题分加权平均<br>③ 维度分即会员的五好基线<br>④ 高风险选项触发健康管理师跟进</div>' +
            '<div class="note warn" style="margin-top:10px">题目改动会使历史基线口径不一致，建议按年度版本管理。</div>' }) +
        '</div></div>';
    },
    actions: {
      previewQ() { UI.modal({ title: '试填 · 五好评估问卷', desc: '10 题 · 约 3 分钟',
        body: '<div class="stack" style="gap:12px">' + (Store.db.fivegood.survey.questions.slice(0, 4)).map((q, i) =>
          '<div><div class="small strong">' + (i + 1) + '. ' + E(q.text) + '</div><div class="chips" style="margin-top:6px">' + q.opts.map((o) => '<span class="chip">' + E(o) + '</span>').join('') + '</div></div>').join('') + '</div>',
        okText: '提交', onOk() { UI.toast('已提交，基线已更新'); } }); },
      newQ() { UI.formDrawer({ title: '新增题目', sub: '加入五好评估问卷', icon: 'file',
        fields: [{ key: 'text', label: '题干', type: 'area', rows: 2 },
          { key: 'dim', label: '维度', type: 'select', options: FG().dims.map((d) => ({ v: d.key, l: d.name })) },
          { key: 'opts', label: '选项（用 / 分隔）', value: '是 / 偶尔 / 否' },
          { key: 'weight', label: '权重', type: 'num', value: 30 }],
        onSave(v) { const s = Store.db.fivegood.survey; s.questions.push({ id: 'sq' + Date.now(), dim: v.dim, text: v.text || '新题目', opts: v.opts.split('/').map((x) => x.trim()), weight: v.weight }); Store.mark('fivegood.survey', '新增题目'); UI.toast('题目已添加'); App.refresh(); } }); },
      editQ(d) { UI.toast('题目编辑'); }
    }
  };

  /* ------------------------------------------------------ 月度报告 */
  P['fg-report'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '月度报告', sub: '每月自动生成五好指数报告，推送给会员',
    preview: 'emp-home',
    render() {
      const ms = FG().members;
      const rpt = Store.db.fivegood.report || (Store.db.fivegood.report = {
        title: '我的五好月度报告', push: true, pushDay: 1,
        sections: [
          { key: 'score', name: '五好指数与变化', on: true },
          { key: 'radar', name: '五维雷达', on: true },
          { key: 'dim', name: '维度解读', on: true },
          { key: 'task', name: '任务完成情况', on: true },
          { key: 'advice', name: '下月建议', on: true },
          { key: 'benefit', name: '权益使用提醒', on: false }
        ]
      });
      const r = Store.db.fivegood.report;
      return K.head('月度报告', '每月 1 日生成上月报告 · 已推送 ' + ms.length + ' 人',
        K.btn('预览报告', 'previewReport', { icon: 'eye' }) + K.btn('立即生成', 'gen', { icon: 'send', cls: 'primary' })) +
        K.kpis([
          { k: '本月已生成', v: ms.length, unit: '份', d: '覆盖率 100%', icon: 'file' },
          { k: '打开率', v: '68', unit: '%', d: '较上月 +5pt', tone: 'up', icon: 'eye' },
          { k: '平均指数变化', v: '+2.4', d: '较上月', tone: 'up', icon: 'chart' }
        ]) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '报告模板', sub: '模块顺序即阅读顺序', flush: true,
            body: '<div style="padding:4px 18px 12px">' + r.sections.map((sec, i) =>
              '<div class="listrow"><span class="tnum small mut" style="width:18px">' + (i + 1) + '</span>' +
              '<div class="meta"><b>' + E(sec.name) + '</b><span>' + (sec.on ? '已启用' : '已关闭') + '</span></div>' +
              '<button class="switch right ' + (sec.on ? 'on' : '') + '" data-toggle="fivegood.report.sections.' + i + '.on"></button></div>').join('') + '</div>' }) +
          K.panel({ title: '报告明细', sub: '最近一期', flush: true, body: UI.table([
            { label: '会员', render: (m) => '<div class="cellflex">' + UI.avatar(m.name, 'g') + '<div><div class="strong">' + E(m.name) + '</div><div class="small muted">' + E(m.tier) + '</div></div></div>' },
            { label: '指数', align: 'right', render: (m) => '<span class="tnum strong">' + m.score + '</span>' },
            { label: '状态', render: (m) => UI.pill('已推送', 'green') },
            { label: '', align: 'right', render: (m) => '<div class="rowact"><button data-act="viewRpt" data-id="' + m.id + '">' + I('eye', 13) + '</button></div>' }
          ], ms.map((m) => Object.assign({ _id: m.id }, m))) })
        + '</div><div class="stack">' +
          K.panel({ title: '推送设置', body: '<div class="stack" style="gap:12px">' +
            UI.fInput({ label: '报告标题', value: r.title, path: 'fivegood.report.title' }) +
            UI.fNum({ label: '每月生成日', value: r.pushDay, path: 'fivegood.report.pushDay' }) +
            UI.fSwitch({ label: '自动推送', value: r.push, path: 'fivegood.report.push' }) +
            '</div><div class="note">报告由健康管家电话或当面反馈，未读会在 3 天后由管家再次联系。</div>' }) +
          K.panel({ title: '报告会回答的问题', body: '<div class="small mut" style="line-height:1.9">' +
            '· 我这个月有没有变好？<br>· 哪个维度拖了后腿？<br>· 下个月该做哪三件事？<br>· 还有哪些权益没用？</div>' }) +
        '</div></div>';
    },
    actions: {
      previewReport() {
        const m = FG().members[0];
        UI.modal({ title: '我的五好月度报告', desc: m.name + ' · 2026 年 10 月 · 指数 ' + m.score,
          body: '<div class="stack" style="gap:12px">' +
            '<div class="row"><div style="font-size:22px;font-weight:600">' + m.score + '</div><div style="margin-left:8px" class="small mut">较上月 +2.4<br>超过 68% 的会员</div></div>' +
            '<div class="progress"><b style="width:' + m.score + '%"></b></div>' +
            '<div class="hairline"></div>' +
            FG().dims.map((d) => '<div class="row small"><span style="width:34px">' + d.name + '</span><div style="flex:1">' + K.progress(m.dims[d.key]) + '</div><b class="tnum">' + m.dims[d.key] + '</b></div>').join('') +
            '<div class="note" style="margin-top:6px">本月短板：' + FG().dims.slice().sort((a, b) => m.dims[a.key] - m.dims[b.key])[0].name + '。下月建议先做一次专项评估。</div></div>',
          okText: '关闭', cancelText: false });
      },
      gen() { UI.toast('已生成 ' + FG().members.length + ' 份报告并推送'); },
      viewRpt(d) { P['fg-report'].actions.previewReport(); }
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
