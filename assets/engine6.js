/* 食谱版本快照 + 推荐 A/B 实验 */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const EN = window.Engine;
  const money = (n) => '¥' + Number(n).toLocaleString('zh-CN');

  /* ---------------- 版本 ---------------- */
  EN.ensureVer = function () {
    const db = Store.db;
    if (!db.dayVersions) db.dayVersions = [
      { id: 'v1', planId: 'dp1', plan: '标准均衡 1800kcal', ver: 1, at: '2026-10-28 09:10', by: '王雪', note: '首发版本', kcal: 1800, dishes: 12, status: 'history' },
      { id: 'v2', planId: 'dp1', plan: '标准均衡 1800kcal', ver: 2, at: '2026-11-02 14:30', by: '王雪', note: '晚餐换清蒸鱼', kcal: 1780, dishes: 12, status: 'published' },
      { id: 'v3', planId: 'dp3', plan: '减脂 1500kcal', ver: 1, at: '2026-11-05 10:20', by: '张楠', note: '减脂首发', kcal: 1500, dishes: 11, status: 'published' }
    ];
    if (!db.snapshots) db.snapshots = {};
  };
  EN.publishDay = function (plan) {
    EN.ensureVer();
    const prev = (Store.db.dayVersions || []).filter((v) => v.planId === plan.id);
    const ver = prev.reduce((a, v) => Math.max(a, v.ver), 0) + 1;
    Store.db.dayVersions.unshift({ id: 'v' + Date.now(), planId: plan.id, plan: plan.name, ver: ver, at: '2026-11-08 10:30', by: Store.role.name, note: '手动发布', kcal: plan.kcal, dishes: 12, status: 'published' });
    Store.db.dayVersions.forEach((v) => { if (v.planId === plan.id && v.id !== Store.db.dayVersions[0].id) v.status = 'history'; });
    Store.db.snapshots[plan.id] = JSON.parse(JSON.stringify(plan));
    Store.mark('dayVersions', '食谱发布');
    Store.persist();
    return ver;
  };
  EN.snapshotOf = (planId) => (Store.db.snapshots || {})[planId];

  P['fg-version'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: '食谱版本', sub: '发布即快照，已下发的餐单不被追溯', preview: 'emp-home',
    render() {
      EN.ensureVer();
      const vers = Store.db.dayVersions;
      const plans = Store.db.dayPlans;
      return K.head('食谱版本', vers.length + ' 个版本 · 覆盖 ' + new Set(vers.map((v) => v.planId)).size + ' 套食谱',
        '<button class="btn primary" data-act="pubAll">' + I('send', 15) + '发布当前食谱</button>') +
        K.kpis([
          { k: '版本数', v: vers.length, unit: '个', d: '当前生效 ' + vers.filter((v) => v.status === 'published').length, icon: 'layers' },
          { k: '已快照', v: Object.keys(Store.db.snapshots || {}).length, unit: '套', d: '客户端按快照执行', icon: 'lock' },
          { k: '历史版本', v: vers.filter((v) => v.status === 'history').length, unit: '个', d: '可回滚', icon: 'undo' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '食谱', render: (v) => '<div><div class="strong">' + E(v.plan) + '</div><div class="small muted">' + E(v.note) + '</div></div>' },
          { label: '版本', render: (v) => '<b class="tnum">v' + v.ver + '</b>' },
          { label: '热量', align: 'right', render: (v) => '<span class="tnum">' + v.kcal + ' kcal</span>' },
          { label: '发布时间', render: (v) => '<span class="small tnum muted">' + v.at + '</span>' },
          { label: '发布人', render: (v) => E(v.by) },
          { label: '状态', render: (v) => v.status === 'published' ? UI.pill('生效中', 'green') : UI.pill('历史', 'grey') },
          { label: '', align: 'right', render: (v) => v.status === 'history' ? '<div class="rowact"><button data-act="rollback" data-id="' + v.id + '">' + I('undo', 14) + '</button></div>' : '' }
        ], vers.map((v) => Object.assign({ _id: v.id }, v))) }) +
        '<div class="note" style="margin-top:14px">发布时会把整套食谱写入快照；客户端已经领到的餐单仍按旧快照执行，营养师改食谱不会影响历史执行记录。</div>';
    },
    actions: {
      pubAll() {
        const p = Store.db.dayPlans[0];
        const v = EN.publishDay(p);
        UI.toast('已发布 v' + v + '，快照已生成'); App.refresh();
      },
      rollback(d) {
        const v = Store.db.dayVersions.find((x) => x.id === d.id);
        UI.confirm({ title: '回滚到 v' + v.ver + '？', desc: '将把 ' + v.plan + ' 的内容恢复为该版本，并生成一个新的发布版本。', okText: '回滚' }).then((ok) => {
          if (!ok) return;
          v.status = 'published';
          Store.db.dayVersions.forEach((x) => { if (x.planId === v.planId && x.id !== v.id) x.status = 'history'; });
          Store.mark('dayVersions', '回滚版本'); UI.toast('已回滚到 v' + v.ver); App.refresh();
        });
      }
    }
  };

  /* ---------------- A/B ---------------- */
  EN.ensureAB = function () {
    const db = Store.db;
    if (!db.experiments) db.experiments = [
      { id: 'ab1', name: '减重食谱推荐位', rule: 'rr1', seg: '减重期', a: '首页卡片', b: '食谱页顶部', split: '50/50', aExp: 4200, aCtr: 8.2, bExp: 4100, bCtr: 11.4, status: 'running', start: '2026-10-28' },
      { id: 'ab2', name: 'EAP 文案', rule: 'rr3', seg: '高管高压', a: '睡眠监测优先', b: 'EAP 优先', split: '50/50', aExp: 900, aCtr: 9.1, bExp: 860, bCtr: 7.8, status: 'running', start: '2026-11-01' },
      { id: 'ab3', name: '蛋白粉加购位', rule: 'rr7', seg: '减重期', a: '食谱页加购', b: '支付后推荐', split: '50/50', aExp: 2300, aCtr: 7.2, bExp: 2280, bCtr: 4.1, status: 'done', start: '2026-10-10', winner: 'A' }
    ];
  };
  const lift = (e) => Math.round((e.bCtr - e.aCtr) / e.aCtr * 100);
  const significant = (e) => Math.abs(lift(e)) >= 20 && (e.aExp + e.bExp) >= 2000;

  P['fg-ab'] = {
    app: 'all', grp: 'e.content', papp: 'employee', title: 'A/B 实验', sub: '同一人群分流比对，胜出方案一键全量', preview: 'emp-home',
    render() {
      EN.ensureAB();
      const list = Store.db.experiments;
      return K.head('A/B 实验', list.filter((e) => e.status === 'running').length + ' 个进行中 · ' + list.filter((e) => e.status === 'done').length + ' 个已结论',
        '<button class="btn primary" data-act="newAb">' + I('plus', 15) + '新建实验</button>') +
        '<div class="stack">' + list.map((e) => {
          const l = lift(e), sig = significant(e);
          return '<div class="panel" style="padding:16px">' +
            '<div class="row"><div><div class="row" style="gap:8px"><b style="font-size:13.5px">' + E(e.name) + '</b>' +
            (e.status === 'done' ? UI.pill('已结论', 'green') : UI.pill('进行中', 'blue')) + UI.pill(e.seg, 'grey') + '</div>' +
            '<div class="small muted" style="margin-top:3px">分流 ' + e.split + ' · 开始 ' + e.start + ' · 关联规则 ' + e.rule + '</div></div>' +
            '<div class="right small ' + (sig ? 'strong' : 'mut') + '">' + (l > 0 ? 'B 高 ' : l < 0 ? 'A 高 ' : '') + Math.abs(l) + '%' + (sig ? ' · 显著' : ' · 未显著') + '</div></div>' +
            '<div class="grid g-2" style="gap:12px;margin-top:12px">' +
            [['A', e.a, e.aExp, e.aCtr], ['B', e.b, e.bExp, e.bCtr]].map((x, i) =>
              '<div style="border:1px solid ' + (i === 1 && sig && l > 0 ? '#bcd6fb' : 'var(--line)') + ';border-radius:10px;padding:10px 12px;' + (i === 1 && sig && l > 0 ? 'background:#f6faff' : '') + '">' +
              '<div class="row"><b style="font-size:12px">' + x[0] + '：' + E(x[1]) + '</b>' + (i === 1 && sig && l > 0 ? '<span class="right pill green">胜出</span>' : '') + '</div>' +
              '<div class="row small mut" style="margin-top:4px;justify-content:space-between"><span>曝光 ' + x[2].toLocaleString() + '</span><b class="tnum">CTR ' + x[3] + '%</b></div></div>').join('') +
            '</div>' +
            '<div class="row" style="margin-top:12px;gap:6px">' +
            (e.status === 'running' ? '<button class="btn sm" data-act="stop" data-id="' + e.id + '">结束并判定</button>' : '<button class="btn sm primary" data-act="apply" data-id="' + e.id + '">应用到全量</button>') +
            '<span class="small mut" style="margin-left:auto">' + (sig ? '样本与提升均达阈值，可结束' : '样本不足或提升 < 20%，建议继续') + '</span></div>' +
            '</div>';
        }).join('') + '</div>';
    },
    actions: {
      newAb() { UI.formDrawer({ title: '新建 A/B 实验', sub: '选两条方案对比', icon: 'chart',
        fields: [{ key: 'name', label: '实验名称' },
          { key: 'seg', label: '人群', type: 'select', options: Store.db.recoEngine.segments.map((s) => ({ v: s.name, l: s.name })) },
          { key: 'a', label: 'A 方案', type: 'select', options: ['首页卡片', '食谱页顶部', '消息推送'] },
          { key: 'b', label: 'B 方案', type: 'select', options: ['首页卡片', '食谱页顶部', '消息推送'] },
          { key: 'split', label: '分流', type: 'select', options: ['50/50', '30/70', '20/80'] }],
        onSave(v) { Store.pushItem('experiments', { id: 'ab' + Date.now(), name: v.name || '新实验', rule: 'rr1', seg: v.seg, a: v.a, b: v.b, split: v.split, aExp: 0, aCtr: 0, bExp: 0, bCtr: 0, status: 'running', start: '2026-11-08' }, '新建实验'); UI.toast('实验已创建'); App.refresh(); } }); },
      stop(d) { const e = Store.db.experiments.find((x) => x.id === d.id); const l = lift(e); if (!significant(e)) { UI.toast('样本或提升未达阈值，暂不能判定', 'warn'); return; } e.status = 'done'; e.winner = l > 0 ? 'B' : 'A'; Store.mark('experiments', '结束实验'); UI.toast('判定完成：' + e.winner + ' 胜出'); App.refresh(); },
      apply(d) { const e = Store.db.experiments.find((x) => x.id === d.id); const r = Store.db.recoEngine.rules.find((x) => x.id === e.rule); if (r) { r.slot = e.winner === 'B' ? e.b : e.a; r.on = true; } Store.mark('recoEngine.rules', '应用胜出方案'); UI.toast('已将 ' + e.winner + ' 方案应用到全量'); App.refresh(); }
    }
  };
})();
