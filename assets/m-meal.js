/* ============================================================================
   吃好：餐次模板 / 全天食谱 / 搭配器 / 食材菜品 / 补剂
   推荐引擎：人群 × 特征权重 × 多维打分
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const M = () => Store.db;
  const mealOf = (d) => M().dishes.find((x) => x.id === d) || {};
  const tplOf = (t) => M().mealTemplates.find((x) => x.id === t) || {};

  /* ------------------------------------------------- 吃好 · 食谱工程 */
  P['fg-eat'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '吃好 · 食谱工程', sub: '食材 → 菜品 → 餐次 → 全天食谱 → 补剂', preview: 'emp-home',
    state: { tab: 'day' },
    render() {
      const st = P['fg-eat'].state;
      const tabs = [
        { id: 'day', label: '全天食谱', n: M().dayPlans.length },
        { id: 'tpl', label: '餐次模板', n: M().mealTemplates.length },
        { id: 'dish', label: '菜品库', n: M().dishes.length },
        { id: 'ing', label: '食材库', n: M().ingredients.length },
        { id: 'sup', label: '营养补剂', n: M().supplements.length }
      ];
      return K.head('吃好 · 食谱工程', '不只是单道菜：一餐 = 主食 + 蛋白 + 蔬菜 + 汤，一天 = 四餐',
        K.btn('去搭配器', 'goPlanner', { icon: 'sliders' }) + K.btn('新建全天食谱', 'newDay', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '全天食谱', v: M().dayPlans.length, unit: '套', d: '在架 ' + M().dayPlans.filter((d) => d.on).length, icon: 'package' },
          { k: '菜品 / 食材', v: M().dishes.length + ' / ' + M().ingredients.length, d: '可自由组合', icon: 'layers' },
          { k: '本月采纳', v: '2,830', unit: '人', d: '整套采纳 68%', tone: 'up', icon: 'check' },
          { k: '补剂销售', v: '2.4', unit: '万', d: '复购 31%', tone: 'up', icon: 'target' }
        ]) +
        K.tabs(tabs, st.tab, 'eatTab') + bodyFor(st.tab);
    },
    actions: {
      eatTab(d) { P['fg-eat'].state.tab = d.id; App.refresh(); },
      goPlanner() { App.go('fg-meal'); },
      newDay() {
        UI.formDrawer({ title: '新建全天食谱', sub: '先选人群，再套用餐次模板', icon: 'package', section: '基础',
          fields: [
            { key: 'name', label: '食谱名称', ph: '如 控糖 1600kcal' },
            { key: 'audience', label: '适用人群', type: 'select', options: ['普通职工', 'BMI ≥ 28', '血糖偏高', '孕期哺乳', '银发人群', '高管高压'] },
            { key: 'kcal', label: '目标热量', type: 'num', value: 1600 },
            { key: 'tag', label: '标签', type: 'select', options: ['均衡', '低GI', '高蛋白', '低脂', '软食'] }
          ],
          onSave(v) { Store.pushItem('dayPlans', { id: 'dp' + Date.now(), name: v.name || '新食谱', audience: v.audience, kcal: v.kcal, p: 110, c: 160, f: 50, meals: { 早餐: 'mt1', 午餐: 'mt2', 晚餐: 'mt3', 加餐: 'mt4' }, tags: [v.tag], on: true, used: 0, owner: '王雪' }, '新建全天食谱'); UI.toast('食谱已创建'); App.refresh(); } });
      },
      editDay(d) { App.go('fg-meal', { day: d.id }); },
      copyDay(d) {
        const p = M().dayPlans.find((x) => x.id === d.id);
        Store.pushItem('dayPlans', Object.assign({}, p, { id: 'dp' + Date.now(), name: p.name + '（副本）', used: 0 }), '复制食谱');
        UI.toast('已复制'); App.refresh();
      },
      addDish() { UI.toast('新增菜品：可先选食材组合'); },
      addIng() { UI.toast('新增食材'); },
      editSup(d) { UI.toast('补剂编辑'); }
    }
  };

  function bodyFor(tab) {
    const D = M();
    if (tab === 'day') {
      return '<div class="grid g-2">' + D.dayPlans.map((p) => '<div class="panel" style="padding:16px">' +
        '<div class="row"><div><div class="row" style="gap:8px"><b style="font-size:14px">' + E(p.name) + '</b>' + UI.pill(p.on ? '在售' : '草稿', p.on ? 'green' : 'amber') + '</div>' +
        '<div class="small muted" style="margin-top:3px">' + E(p.audience) + ' · ' + p.kcal + ' kcal · 采纳 ' + p.used + ' 人</div></div>' +
        '<button class="iconbtn right" data-act="editDay" data-id="' + p.id + '">' + I('edit', 15) + '</button></div>' +
        '<div class="hairline"></div>' +
        ['早餐', '午餐', '晚餐', '加餐'].map((m) => {
          const t = tplOf(p.meals[m]);
          return '<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line-2);align-items:flex-start">' +
            '<span class="pill grey" style="width:38px;justify-content:center">' + m + '</span>' +
            '<div style="flex:1;min-width:0"><div class="small" style="line-height:1.6">' + E((t.dishes || []).map((d) => mealOf(d).name).join(' · ')) + '</div>' +
            '<div class="small mut tnum">' + (t.kcal || 0) + ' kcal</div></div></div>';
        }).join('') +
        '<div class="row" style="margin-top:10px"><span class="small mut">蛋白 ' + p.p + 'g · 碳水 ' + p.c + 'g · 脂肪 ' + p.f + 'g</span>' +
        '<div class="right row" style="gap:6px"><button class="btn sm" data-act="copyDay" data-id="' + p.id + '">复制</button>' +
        '<button class="btn sm primary" data-act="editDay" data-id="' + p.id + '">搭配</button></div></div></div>').join('') + '</div>';
    }
    if (tab === 'tpl') {
      return K.panel({ flush: true, body: UI.table([
        { label: '模板', render: (t) => '<b>' + E(t.name) + '</b>' },
        { label: '餐次', render: (t) => UI.pill(t.meal, 'grey') },
        { label: '包含菜品', render: (t) => '<span class="small">' + E(t.dishes.map((d) => mealOf(d).name).join(' + ')) + '</span>' },
        { label: '热量', align: 'right', render: (t) => '<span class="tnum">' + t.kcal + '</span>' },
        { label: '蛋白', align: 'right', render: (t) => '<span class="tnum small">' + t.p + 'g</span>' },
        { label: '采纳', align: 'right', render: (t) => '<span class="tnum">' + t.used + '</span>' },
        { label: '上架', render: (t) => '<button class="switch ' + (t.on ? 'on' : '') + '" data-toggle="mealTemplates.' + UI.ix(M().mealTemplates, t) + '.on"></button>' }
      ], M().mealTemplates.map((t) => Object.assign({ _id: t.id }, t))) });
    }
    if (tab === 'dish') {
      return K.panel({ flush: true, body: UI.table([
        { label: '菜品', render: (d) => '<div><div class="strong">' + E(d.name) + '</div><div class="small muted">' + E(d.tags.join(' · ')) + (d.allerg.length ? ' · 过敏：' + E(d.allerg.join('/')) : '') + '</div></div>' },
        { label: '槽位', render: (d) => UI.pill(d.slot, 'grey') },
        { label: '适用餐次', render: (d) => '<span class="small">' + E(d.meal.join(' / ')) + '</span>' },
        { label: '食材', render: (d) => '<span class="small muted">' + E(d.ing.map((x) => (M().ingredients.find((i) => i.id === x[0]) || {}).name).join(' + ')) + '</span>' },
        { label: '热量', align: 'right', render: (d) => '<span class="tnum">' + d.kcal + '</span>' },
        { label: '上架', render: (d) => '<button class="switch ' + (d.on ? 'on' : '') + '" data-toggle="dishes.' + UI.ix(M().dishes, d) + '.on"></button>' }
      ], M().dishes.map((d) => Object.assign({ _id: d.id }, d))) });
    }
    if (tab === 'ing') {
      return K.panel({ flush: true, body: UI.table([
        { label: '食材', render: (i) => '<b>' + E(i.name) + '</b>' },
        { label: '类别', render: (i) => UI.pill(i.cat, 'grey') },
        { label: '每 100g', render: (i) => '<span class="small tnum">' + i.kcal + ' kcal · 蛋白 ' + i.p + 'g · 碳水 ' + i.c + 'g · 脂肪 ' + i.f + 'g</span>' },
        { label: '标签', render: (i) => '<span class="small muted">' + E(i.tags.join(' · ')) + '</span>' },
        { label: '过敏原', render: (i) => i.allerg.length ? UI.pill(i.allerg.join('/'), 'red') : '<span class="muted small">无</span>' },
        { label: '成本', align: 'right', render: (i) => '<span class="tnum">¥' + i.price.toFixed(1) + '</span>' }
      ], M().ingredients.map((i) => Object.assign({ _id: i.id }, i))) });
    }
    return K.panel({ flush: true, body: UI.table([
      { label: '补剂', render: (s) => '<div><div class="strong">' + E(s.name) + '</div><div class="small muted">' + E(s.cat) + '</div></div>' },
      { label: '适用', render: (s) => '<span class="small">' + E(s.fit) + '</span>' },
      { label: '禁忌', render: (s) => s.avoid.length ? '<span class="small" style="color:#b83c2c">' + E(s.avoid.join(' / ')) + '</span>' : '<span class="muted small">无</span>' },
      { label: '售价 / 结算', align: 'right', render: (s) => '<b class="tnum">¥' + s.price + '</b><div class="small muted tnum">结算 ¥' + s.settle + '</div>' },
      { label: '库存', align: 'right', render: (s) => '<span class="tnum" style="color:' + (s.stock === 0 ? '#b83c2c' : 'inherit') + '">' + s.stock + '</span>' },
      { label: '已售', align: 'right', render: (s) => '<span class="tnum">' + s.sold + '</span>' },
      { label: '上架', render: (s) => '<button class="switch ' + (s.on ? 'on' : '') + '" data-toggle="supplements.' + UI.ix(M().supplements, s) + '.on"></button>' }
    ], M().supplements.map((s) => Object.assign({ _id: s.id }, s))) });
  }

  /* ------------------------------------------------------------ 搭配器 */
  P['fg-meal'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '食谱搭配器', sub: '逐餐选菜品，实时算热量与结构', preview: 'emp-home', hideNav: true,
    state: { slot: '早餐', pick: { 早餐: [], 午餐: [], 晚餐: [], 加餐: [] } },
    render(ctx) {
      const st = P['fg-meal'].state;
      if (ctx && ctx.day && !st.loaded) {
        const p = M().dayPlans.find((x) => x.id === ctx.day);
        if (p) {
          st.pick = { 早餐: [], 午餐: [], 晚餐: [], 加餐: [] };
          ['早餐', '午餐', '晚餐', '加餐'].forEach((m) => {
            const t = tplOf(p.meals[m]);
            st.pick[m] = (t.dishes || []).slice();
          });
          st.name = p.name;
        }
        st.loaded = true;
      }
      const calc = (m) => st.pick[m].reduce((a, d) => { const x = mealOf(d); return { kcal: a.kcal + (x.kcal || 0), p: a.p + (x.p || 0), c: a.c + (x.c || 0), f: a.f + (x.f || 0) }; }, { kcal: 0, p: 0, c: 0, f: 0 });
      const total = ['早餐', '午餐', '晚餐', '加餐'].reduce((a, m) => { const x = calc(m); return { kcal: a.kcal + x.kcal, p: a.p + x.p, c: a.c + x.c, f: a.f + x.f }; }, { kcal: 0, p: 0, c: 0, f: 0 });
      const cands = M().dishes.filter((d) => d.on && d.meal.indexOf(st.slot) >= 0);
      return K.head(st.name || '我的搭配', '总热量 ' + total.kcal + ' kcal · 蛋白 ' + total.p + 'g · 碳水 ' + total.c + 'g · 脂肪 ' + total.f + 'g',
        K.btn('返回食谱', 'back', { icon: 'undo' }) + K.btn('保存为我的食谱', 'save', { icon: 'check', cls: 'primary' })) +
        '<div class="grid g-1-2" style="align-items:start">' +
          '<div class="stack">' + ['早餐', '午餐', '晚餐', '加餐'].map((m) => {
            const c = calc(m);
            const active = st.slot === m;
            return '<div class="panel" style="padding:12px 14px;' + (active ? 'border-color:#9dc0f7;box-shadow:0 0 0 3px rgba(11,99,229,.1)' : '') + '" data-act="pickSlot" data-id="' + m + '">' +
              '<div class="row"><b style="font-size:12.5px">' + m + '</b><span class="small mut tnum">' + c.kcal + ' kcal</span>' +
              (st.pick[m].length ? '<span class="right small mut">' + st.pick[m].length + ' 项</span>' : '<span class="right small" style="color:#b83c2c">未选择</span>') + '</div>' +
              '<div class="chips" style="margin-top:8px">' + (st.pick[m].length ? st.pick[m].map((d) => '<span class="chip sq">' + E(mealOf(d).name) + '</span>').join('') : '<span class="small mut">点此选择餐次，再点右侧菜品</span>') + '</div>' +
              '</div>';
          }).join('') +
            '<div class="panel" style="padding:14px"><div class="row"><b style="font-size:12.5px">营养结构</b><span class="right small mut">目标 1800 kcal</span></div>' +
            '<div style="margin-top:10px">' + K.progress(Math.min(100, total.kcal / 1800 * 100)) + '</div>' +
            '<div class="row small mut" style="margin-top:6px;justify-content:space-between"><span>' + total.kcal + ' / 1800 kcal</span><span>' + Math.round(total.kcal / 1800 * 100) + '%</span></div>' +
            '<div class="row small" style="margin-top:10px;gap:12px"><span>蛋白 <b class="tnum">' + total.p + 'g</b></span><span>碳水 <b class="tnum">' + total.c + 'g</b></span><span>脂肪 <b class="tnum">' + total.f + 'g</b></span></div></div>' +
          '</div>' +
          K.panel({ title: '可选菜品 · ' + st.slot, sub: '点击加入 / 再次点击移除', flush: true, body: '<div style="padding:6px 18px 14px">' +
            cands.map((d) => {
              const on = st.pick[st.slot].indexOf(d.id) >= 0;
              return '<div class="listrow" style="cursor:pointer" data-act="toggleDish" data-id="' + d.id + '">' +
                '<div class="ava ' + (on ? '' : 'g') + '" style="width:26px;height:26px;font-size:11px">' + (on ? '✓' : '+') + '</div>' +
                '<div class="meta"><b>' + E(d.name) + '</b><span>' + E(d.slot) + ' · ' + d.kcal + ' kcal · 蛋白 ' + d.p + 'g</span></div>' +
                '<div class="right small mut">' + E(d.tags[0] || '') + '</div></div>';
            }).join('') + '</div>' }) +
        '</div>';
    },
    actions: {
      pickSlot(d) { P['fg-meal'].state.slot = d.id; App.refresh(true); },
      toggleDish(d) {
        const st = P['fg-meal'].state, list = st.pick[st.slot];
        const i = list.indexOf(d.id);
        if (i >= 0) list.splice(i, 1); else list.push(d.id);
        App.refresh(true);
      },
      back() { App.go('fg-eat'); },
      save() {
        const st = P['fg-meal'].state;
        const used = Object.keys(st.pick).reduce((a, k) => a + st.pick[k].length, 0);
        if (!used) { UI.toast('还没有选择任何菜品', 'warn'); return; }
        Store.pushItem('myMeals', { id: 'mm' + Date.now(), name: st.name || '我的搭配', pick: JSON.parse(JSON.stringify(st.pick)), at: '2026-11-08' }, '保存搭配');
        UI.toast('已保存，可在客户端「我的食谱」看到'); App.refresh();
      }
    }
  };

  /* ------------------------------------------------------ 推荐引擎 */
  P['fg-reco'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '推荐引擎', sub: '人群分层 × 特征权重 × 多维打分，不是单条件 if', preview: 'emp-home',
    render() {
      const eng = Store.db.recoEngine;
      const rules = eng.rules;
      const wSum = eng.features.reduce((a, f) => a + f.weight, 0);
      return K.head('推荐引擎', rules.filter((r) => r.on).length + ' 条策略 · ' + eng.segments.length + ' 个人群 · 权重合计 ' + wSum + '%',
        K.btn('新增策略', 'newRule', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '覆盖人群', v: 409, unit: '人', d: eng.segments.length + ' 个分层', icon: 'users' },
          { k: '本月曝光', v: '3.0', unit: '万', icon: 'eye' },
          { k: '平均点击率', v: '9.6', unit: '%', d: '较上月 +1.2pt', tone: 'up', icon: 'chart' },
          { k: '服务 / 商品转化', v: '1,470', unit: '人', d: '商品占 31%', tone: 'up', icon: 'target' }
        ]) +
        '<div class="grid g-2-1" style="align-items:start">' +
          '<div class="stack">' +
            K.panel({ title: '人群分层', sub: '同一规则不对所有人推', body: '<div class="grid g-3" style="gap:10px">' +
              eng.segments.map((s) => '<div style="border:1px solid var(--line);border-radius:10px;padding:10px 12px">' +
                '<div class="row"><b style="font-size:12.5px">' + E(s.name) + '</b><span class="right small mut">' + s.size + ' 人</span></div>' +
                '<div class="small mut" style="margin-top:3px">主推：' + E(s.focus) + '</div>' +
                '<div class="chips" style="margin-top:6px">' + s.boost.map((b) => '<span class="chip" style="height:20px;font-size:10px">' + E(b) + '</span>').join('') + '</div></div>').join('') + '</div>' }) +
            K.panel({ title: '策略列表', sub: '得分阈值 + 排除条件 + 频控', flush: true, body: UI.table([
              { label: '人群', render: (r) => UI.pill((eng.segments.find((s) => s.id === r.seg) || {}).name || '—', 'grey') },
              { label: '策略', render: (r) => '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.when) + '</div></div>' },
              { label: '阈值', align: 'right', render: (r) => '<span class="pill ' + (r.score >= 65 ? 'blue' : 'grey') + '">' + r.score + '</span>' },
              { label: '排除', render: (r) => '<span class="small" style="color:#8a5a0c">' + E(r.excl) + '</span>' },
              { label: '频控', render: (r) => '<span class="small muted">' + E(r.freq) + '</span>' },
              { label: 'CTR / CVR', align: 'right', render: (r) => '<span class="tnum small">' + r.ctr + '</span><div class="small muted tnum">' + r.cvr + '</div>' },
              { label: '启用', render: (r) => '<button class="switch ' + (r.on ? 'on' : '') + '" data-toggle="recoEngine.rules.' + UI.ix(rules, r) + '.on"></button>' }
            ], rules.map((r) => Object.assign({ _id: r.id }, r))) }) +
          '</div><div class="stack">' +
            K.panel({ title: '特征权重', sub: '决定谁被推什么', body: eng.features.map((f) =>
              '<div style="margin-bottom:12px"><div class="row small" style="justify-content:space-between"><span>' + E(f.name) + '</span><b class="tnum">' + f.weight + '%</b></div>' +
              '<input class="range" type="range" min="0" max="50" value="' + f.weight + '" data-set="recoEngine.features.' + UI.ix(eng.features, f) + '.weight" data-kind="num">' +
              '<div class="hint">' + E(f.desc) + '</div></div>').join('') +
              '<div class="note">权重合计 ' + wSum + '%，建议保持 100%。</div>' }) +
            K.panel({ title: '打分怎么算', body: '<div class="small mut" style="line-height:1.9">' +
              '得分 = Σ(特征分 × 权重)<br>命中阈值且未被排除才进入候选<br>再按频控与优先级去重<br>最后按商业价值微调排序</div>' +
              '<div class="note teal" style="margin-top:10px">规则之间互斥由排除条件处理，例如孕期不推减重营。</div>' }) +
          '</div>' +
        '</div>';
    },
    actions: {
      newRule() {
        const eng = Store.db.recoEngine;
        UI.formDrawer({ title: '新增推荐策略', sub: '全部选择，不写公式', icon: 'target', section: '策略',
          fields: [
            { key: 'name', label: '策略名称' },
            { key: 'seg', label: '目标人群', type: 'select', options: eng.segments.map((s) => ({ v: s.id, l: s.name })) },
            { key: 'when', label: '触发条件', type: 'select', options: ['BMI ≥ 28', '血糖 ≥ 6.1', 'ISI ≥ 15', '步数 < 4000', '报告异常 ≥ 1', '入组 30 天内'] },
            { key: 'excl', label: '排除条件', type: 'select', options: ['无', '孕期 / 哺乳', '肾功能不全', '服用抗凝药'] },
            { key: 'target', label: '推荐对象', type: 'select', options: Store.db.employee.services.slice(0, 8).map((s) => ({ v: s.name, l: s.name }).v).concat(Store.db.supplements.slice(0, 3).map((s) => ({ v: s.name }))).map((x) => x.v || x) },
            { key: 'slot', label: '展示位置', type: 'select', options: ['首页卡片', '指标页', '睡眠页', '食谱页加购', '消息推送'] },
            { key: 'freq', label: '频控', type: 'select', options: ['每周 1 次', '每周 2 次', '每 2 周 1 次', '仅 1 次'] }
          ],
          onSave(v) { Store.pushItem('recoEngine.rules', { id: 'rr' + Date.now(), seg: v.seg, name: v.name || '新策略', score: 60, when: v.when, excl: v.excl, target: v.target, type: '服务', slot: v.slot, freq: v.freq, priority: 2, on: true, exp: 0, ctr: '—', cvr: '—' }, '新增推荐策略'); UI.toast('策略已创建'); App.refresh(); } });
      }
    }
  };
})();
