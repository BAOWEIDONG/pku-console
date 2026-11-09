/* ============================================================================
   深度问答 2.0：图文回复 / 分类 / 置顶 / 来源 / 审核 / 未命中问题池 / 敏感词
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const H = () => Store.db.employee;

  const CATS = ['体检解读', '慢病管理', '运动康复', '营养', '心理', '就医指引'];

  function ensure() {
    const h = H();
    h.qa.forEach((q, i) => {
      if (!Array.isArray(q.blocks) || !q.blocks.length) q.blocks = [{ type: 'text', text: q.answer || '' }];
      if (q.pinned == null) q.pinned = i < 2;
      if (!q.audit) q.audit = 'approved';
      if (q.audit === 'approved' && !q.auditor) q.auditor = '赵医生 · 健康管理部';
      if (!q.source) q.source = '医生审核知识库';
      if (q.top == null) q.top = i < 2 ? 10 - i : 0;
      if (!q.service) q.service = '';
      if (!q.sensitiveHits) q.sensitiveHits = 0;
    });
    if (!Array.isArray(h.qaMisses)) {
      h.qaMisses = [
        { id: 'qm1', q: '体检报告里的甲状腺结节 3 类要紧吗？', n: 28, last: '2026-11-07 21:12', dept: '研发部', handled: false },
        { id: 'qm2', q: '长期吃降压药会不会伤肾？', n: 21, last: '2026-11-07 19:40', dept: '市场部', handled: false },
        { id: 'qm3', q: '睡眠监测显示深睡不足，需要做睡眠门诊吗？', n: 16, last: '2026-11-07 15:08', dept: '财务部', handled: false },
        { id: 'qm4', q: '公司体检能加做胃肠镜吗？', n: 12, last: '2026-11-06 10:32', dept: '人力资源部', handled: false },
        { id: 'qm5', q: '运动后膝盖疼还能继续跑步吗？', n: 9, last: '2026-11-05 18:26', dept: '销售部', handled: false }
      ];
    }
    if (!h.qaPolicy) {
      h.qaPolicy = {
        autoAudit: true, requireDoctor: true, fallback: '这个问题暂时没有标准答案。你可以补充年龄、性别、既往病史与最近检查结果，我们会转给健康管理师进一步判断。',
        sensitive: '确诊\n治愈\n保证有效\n停药\n包治\n秘方\n根治',
        escalate: '涉及用药调整、急性胸痛、呼吸困难、意识异常、自伤风险时，立即提示就医并转人工。'
      };
    }
    return h;
  }

  function statusPill(q) {
    return q.audit === 'pending' ? UI.pill('待医生审核', 'amber') : q.audit === 'rejected' ? UI.pill('已驳回', 'red') : UI.pill('已审核', 'green');
  }

  function openEditor(q) {
    ensure();
    const i = H().qa.indexOf(q);
    const bed = Media.blockEditor(q.blocks && q.blocks.length ? q.blocks : [{ type: 'text', text: q.answer || '' }]);
    const services = H().services.filter((s) => s.on);
    UI.drawer({
      title: q.id ? '编辑问答' : '新增问答', sub: '问题、富文本答案、审核与关联服务', icon: 'message', width: 760,
      okText: q.id ? '保存问答' : '创建问答',
      body: '<div class="gsection"><h4>问题与分类</h4>' +
        UI.fArea({ label: '用户问题', value: q.q, rows: 2, path: 'employee.qa.' + i + '.q' }) +
        '<div class="frow">' + UI.fSelect({ label: '分类', value: q.cat, options: CATS, path: 'employee.qa.' + i + '.cat' }) +
          UI.fSelect({ label: '关联服务', value: q.service || '', options: [{ v: '', l: '不关联' }].concat(services.map((s) => ({ v: s.id, l: s.name }))), path: 'employee.qa.' + i + '.service' }) + '</div>' +
        '<div class="frow">' + UI.fInput({ label: '来源 / 审核依据', value: q.source, path: 'employee.qa.' + i + '.source', ph: '如 体检中心共识 / 赵医生审核' }) +
          UI.fNum({ label: '置顶权重', value: q.top || 0, path: 'employee.qa.' + i + '.top', hint: '0 为不置顶，数字越大越靠前' }) + '</div>' +
      '</div>' +
      '<div class="gsection"><h4>标准回复（支持图文）</h4>' +
        '<div id="qa-blocks"></div>' +
        '<div class="note" style="margin-top:10px">先用一句话给出结论，再补充判断依据、什么时候需要就医。涉及诊断与用药时必须保留面诊提示。</div>' +
      '</div>' +
      '<div class="gsection"><h4>审核与展示</h4>' +
        '<div class="frow">' + UI.fSwitch({ label: '置顶展示', value: !!q.pinned, path: 'employee.qa.' + i + '.pinned' }) +
          UI.fSwitch({ label: '启用', value: q.on !== false, path: 'employee.qa.' + i + '.on' }) + '</div>' +
        UI.fSelect({ label: '审核状态', value: q.audit || 'pending', options: [{ v: 'pending', l: '待医生审核' }, { v: 'approved', l: '审核通过' }, { v: 'rejected', l: '驳回' }], path: 'employee.qa.' + i + '.audit' }) +
        UI.fInput({ label: '审核人', value: q.auditor || '', path: 'employee.qa.' + i + '.auditor', ph: '审核通过后自动显示' }) +
      '</div>' +
      '<div class="qa-rich-preview"><div class="small strong" style="margin-bottom:5px">前端预览</div>' + Media.renderBlocks(q.blocks) + '</div>',
      mount(node) { bed.mount(node.querySelector('#qa-blocks')); },
      onOk() {
        const blocks = bed.get();
        const plain = blocks.filter((b) => b.type === 'text' || b.type === 'quote').map((b) => b.text).join(' ');
        Store.saveItem('employee.qa', { id: q.id || ('q' + Date.now()), blocks: blocks, answer: plain || q.answer || '', q: q.q, cat: q.cat, on: q.on !== false, audit: q.audit || 'pending' }, 'id', '问答：' + (q.q || ''));
        UI.toast('问答已保存，待审核/发布'); App.refresh();
      }
    });
  }

  P['e-qa'] = {
    app: 'employee', title: '深度问答', sub: '知识库、审核规则与未命中问题池一起运营',
    preview: 'emp-home',
    state: { tab: 'knowledge' },
    render() {
      const h = ensure(), st = P['e-qa'].state.tab;
      const pending = h.qa.filter((q) => q.audit === 'pending').length;
      const misses = h.qaMisses.filter((m) => !m.handled);
      const knowledge = st === 'knowledge';
      return K.head('深度问答', h.qa.length + ' 条知识 · ' + pending + ' 条待审核 · ' + misses.length + ' 个未命中问题待处理',
        K.btn('新增问答', 'newQa', { icon: 'plus', cls: 'primary' }), 'EMPLOYEE / Q&A') +
        K.kpis([
          { k: '知识条目', v: h.qa.length, unit: '条', d: '启用 ' + h.qa.filter((q) => q.on !== false).length + ' 条' },
          { k: '本月命中', v: '5,284', unit: '次', d: '较上月 +22%', tone: 'up' },
          { k: '未命中问题', v: misses.length, unit: '个', d: '累计被问 ' + h.qaMisses.reduce((a, m) => a + m.n, 0) + ' 次', tone: 'down' },
          { k: '待审核', v: pending, unit: '条', d: '医生审核后才能上线', tone: pending ? 'down' : 'up' }
        ]) +
        K.tabs([{ id: 'knowledge', label: '知识库', n: h.qa.length }, { id: 'misses', label: '未命中问题', n: misses.length }, { id: 'policy', label: '审核与兜底' }], st, 'qaTab') +
        (knowledge ? renderKnowledge(h) : st === 'misses' ? renderMisses(h) : renderPolicy(h));
    },
    actions: {
      qaTab(d) { P['e-qa'].state.tab = d.id; App.refresh(); },
      newQa() {
        const draft = { id: 'q' + Date.now(), q: '新问题（请填写）', answer: '', cat: '体检解读', on: false, audit: 'pending', blocks: [{ type: 'text', text: '' }], hits: 0 };
        Store.pushItem('employee.qa', draft, '新增问答草稿');
        openEditor(H().qa.find((x) => x.id === draft.id));
      },
      editQa(d) { const q = H().qa.find((x) => x.id === d.id); if (q) openEditor(q); },
      toQa(d) {
        const m = H().qaMisses.find((x) => x.id === d.id);
        if (!m) return;
        const draft = { id: 'q' + Date.now(), q: m.q, answer: '', cat: '体检解读', on: false, audit: 'pending', source: '未命中问题转知识', blocks: [{ type: 'text', text: '' }], hits: 0 };
        Store.pushItem('employee.qa', draft, '未命中问题转知识');
        openEditor(H().qa.find((x) => x.id === draft.id));
      },
      ignoreMiss(d) {
        const m = H().qaMisses.find((x) => x.id === d.id);
        if (!m) return;
        Store.saveItem('employee.qaMisses', { id: m.id, handled: true }, 'id', '忽略未命中问题');
        UI.toast('已移出待处理池'); App.refresh();
      },
      savePolicy() { Store.mark('employee.qaPolicy', '问答审核与兜底策略'); Store.persist(); UI.toast('策略已保存，待发布'); }
    }
  };

  function renderKnowledge(h) {
    return '<div class="qa-tabs-line">' +
      '<div class="minisearch">' + I('search', 13) + '<input placeholder="搜索问题 / 答案 / 分类" data-live-filter="qa"></div>' +
      '<span class="small mut">按「置顶 → 命中量」排序</span></div>' +
      '<div class="grid g-2">' + h.qa.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.top || 0) - (a.top || 0) || b.hits - a.hits).map((q) =>
        '<article class="panel" data-filter-item="qa" data-text="' + E(q.q + ' ' + q.answer + ' ' + q.cat) + '" style="padding:14px">' +
          '<div class="row" style="align-items:flex-start;gap:9px"><div style="flex:1;min-width:0">' +
            '<div class="row" style="gap:6px;flex-wrap:wrap"><b style="font-size:13px">' + (q.pinned ? '<span class="pill blue">置顶</span> ' : '') + E(q.q) + '</b></div>' +
            '<div class="small mut" style="margin-top:5px;line-height:1.65;max-height:42px;overflow:hidden">' + E((Media.renderBlocks(q.blocks).replace(/<[^>]+>/g, ' ') || q.answer || '').slice(0, 110)) + '</div>' +
            '<div class="row" style="gap:5px;margin-top:8px;flex-wrap:wrap"><span class="pill grey">' + E(q.cat) + '</span>' + statusPill(q) +
              '<span class="small mut">命中 ' + q.hits + '</span>' + (q.sensitiveHits ? '<span class="pill red">敏感词 ' + q.sensitiveHits + '</span>' : '') + '</div>' +
          '</div><div class="row" style="gap:4px"><button class="iconbtn" data-act="editQa" data-id="' + q.id + '" title="编辑">' + I('edit', 13) + '</button></div></div>' +
        '</article>').join('') + '</div>';
  }

  function renderMisses(h) {
    const list = h.qaMisses.filter((m) => !m.handled);
    return '<div class="note warn" style="margin-bottom:12px">这些是 AI 没有标准答案、被员工反复问到的问题。优先把高频问题补进知识库，能直接降低转人工率。</div>' +
      '<div class="qa-miss">' + list.map((m) =>
        '<div class="qa-miss-row"><div class="qm-h"><b>' + E(m.q) + '</b><span class="pill amber">' + m.n + ' 次</span></div>' +
          '<span>' + E(m.dept) + ' · 最近 ' + E(m.last) + '</span>' +
          '<div class="row" style="margin-top:9px;gap:7px"><button class="btn sm primary" data-act="toQa" data-id="' + m.id + '">补成问答</button>' +
            '<button class="btn sm ghost" data-act="ignoreMiss" data-id="' + m.id + '">移出</button></div></div>').join('') + '</div>';
  }

  function renderPolicy(h) {
    const p = h.qaPolicy;
    return '<div class="grid g-2-1"><div class="stack">' +
      K.panel({ title: '回答边界', sub: '哪些问题不能直接回答，必须转医生', body:
        UI.fArea({ label: '转人工 / 就医提示规则', value: p.escalate, rows: 4, path: 'employee.qaPolicy.escalate' }) +
        '<div class="hairline"></div>' +
        UI.fArea({ label: '无答案兜底话术', value: p.fallback, rows: 3, path: 'employee.qaPolicy.fallback' }) +
        '<div class="hairline"></div><div class="frow">' +
        UI.fSwitch({ label: '敏感词自动审核', value: p.autoAudit, path: 'employee.qaPolicy.autoAudit' }) +
        UI.fSwitch({ label: '医疗建议必须医生审核', value: p.requireDoctor, path: 'employee.qaPolicy.requireDoctor' }) + '</div>' }) +
      K.panel({ title: '敏感词', sub: '命中后不直接发布，进入人工审核', body:
        UI.fArea({ label: '敏感词库（每行一个）', value: p.sensitive, rows: 7, path: 'employee.qaPolicy.sensitive' }) }) +
    '</div><div class="stack">' +
      K.panel({ title: '审核怎么走', body: '<div class="small mut" style="line-height:2">' +
        '① 运营新增问答 → 待审核<br>② 命中敏感词 / 涉及用药 → 强制医生审核<br>③ 医生通过后进入前端知识库<br>④ 员工点踩 / 追问 → 回到未命中池<br>⑤ 高频问题每周补齐，形成闭环</div>' }) +
      K.panel({ title: '审核数据', body: '<div class="stack" style="gap:10px">' +
        [['待医生审核', h.qa.filter((q) => q.audit === 'pending').length, 'amber'], ['本周通过', 9, 'green'], ['本周驳回', 2, 'red'], ['敏感词命中', h.qa.reduce((a, q) => a + (q.sensitiveHits || 0), 0), 'grey']].map((x) =>
          '<div class="row" style="justify-content:space-between"><span class="small mut">' + x[0] + '</span><b style="font-size:18px" class="tnum">' + x[1] + '</b></div>').join('') + '</div>' }) +
    '</div></div>';
  }
})();
