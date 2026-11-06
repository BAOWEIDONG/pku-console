/* ============================================================================
   工作台 / 发布中心 / 操作日志 / 系统设置
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const APP_NAME = { versionall: '减重营', pku: '品牌站', employee: '职工健康', system: '系统' };
  const APP_CLS = { versionall: 'blue', pku: 'green', employee: 'amber', system: 'grey' };

  /* ------------------------------------------------------- 工作台 */
  P['workbench'] = {
    app: 'all', title: '工作台', sub: '三端待办与发布状态一览',
    preview: 'pku-home',
    render() {
      const db = Store.db, d = new Date();
      const hour = d.getHours();
      const greet = hour < 6 ? '凌晨好' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
      const dirty = Store.dirtyCount;
      return K.head(greet + '，孙敏', '今天是 11 月 6 日 · 本周还有 2 项运营动作待完成',
        K.btn('一键预览', 'previewAll', { icon: 'eye', cls: 'ghost' }) +
        '<button class="btn primary" data-act="publish"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>发布变更' + (dirty ? ' <b style="margin-left:4px;background:rgba(255,255,255,.25);padding:0 5px;border-radius:5px">' + dirty + '</b>' : '') + '</button>') +
        '<div class="grid g-3" style="margin-bottom:20px">' +
          [['versionall', '减重营', '第 7 期 · 第 18 天', '在营 48 人 · 今日打卡 78%', '#3f8cff', 'v-dashboard'],
           ['pku', '北大医疗品牌站', '6 省 11 城', '本月浏览 12.4 万 · +18%', '#0aa39a', 'b-dashboard'],
           ['employee', '职工健康', '示例科技有限公司', '本月预约 326 单 · 履约 94%', '#c8871a', 'e-dashboard']].map((a) =>
            '<div class="panel" style="padding:18px;cursor:pointer;position:relative;overflow:hidden" data-act="go" data-id="' + a[5] + '">' +
              '<div style="position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:' + a[4] + ';opacity:.08"></div>' +
              '<div class="row"><div style="width:9px;height:9px;border-radius:50%;background:' + a[4] + '"></div><b style="font-size:13.5px">' + a[1] + '</b>' +
              '<span class="right small mut">' + (Store.dirtyByApp[a[0]] ? '<span style="color:#b83c2c">' + Store.dirtyByApp[a[0]] + ' 项未发布</span>' : '已同步') + '</span></div>' +
              '<div style="margin-top:12px;font-size:12.5px;color:var(--ink-2)">' + a[2] + '</div>' +
              '<div class="small mut" style="margin-top:3px">' + a[3] + '</div>' +
              '<div class="row" style="margin-top:14px;gap:6px"><span class="btn sm" style="pointer-events:none">进入管理</span>' +
              '<span class="btn sm ghost" style="pointer-events:none">' + I('eye', 13) + '预览</span></div>' +
            '</div>').join('') +
        '</div>' +
        '<div class="grid g-2-1">' +
          K.panel({ title: '今日待办', sub: '按业务影响排序', flush: true,
            body: '<div style="padding:4px 18px 12px">' +
              [['6 条打卡记录待批注', '超过 24 小时未处理，影响学员体验', '减重营 · 批注工作台', 'v-annotations', 'red'],
               ['1 单奖励超 48h 未发货', '学员已领取，物流时效考核', '减重营 · 履约中心', 'v-fulfill', 'amber'],
               ['4 项配置已改未发布', '线上仍是旧版本', '发布中心', 's-publish', 'amber'],
               ['5 个服务本月无预约', '建议检查服务介绍与可约状态', '职工健康 · 服务目录', 'e-services', 'blue']].map((t) =>
                '<div class="listrow" style="cursor:pointer" data-act="go" data-id="' + t[3] + '">' +
                '<span class="pill ' + t[4] + '">' + (t[4] === 'red' ? '紧急' : t[4] === 'amber' ? '待处理' : '建议') + '</span>' +
                '<div class="meta"><b>' + E(t[0]) + '</b><span>' + E(t[1]) + ' · ' + E(t[2]) + '</span></div>' +
                '<div class="right mut">' + I('chevron', 14) + '</div></div>').join('') + '</div>' }) +
          K.panel({ title: '发布状态', body: '<div class="stack" style="gap:12px">' +
            [['versionall', '11-05 18:22', 4], ['pku', '11-02 16:40', 8], ['employee', '11-04 11:08', 2]].map((a) =>
              '<div class="row"><div style="flex:1"><div class="row" style="gap:7px"><span class="pill ' + APP_CLS[a[0]] + '">' + APP_NAME[a[0]] + '</span>' +
              '<span class="small mut">' + a[1] + '</span></div><div class="small mut" style="margin-top:3px">上次发布 ' + a[2] + ' 项配置</div></div>' +
              '<button class="btn sm" data-act="go" data-id="s-publish">查看</button></div>').join('') +
            '<div class="hairline"></div><div class="small mut">本地存在 ' + dirty + ' 项未发布变更</div></div>' }) +
        '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '最近操作', sub: '全平台', flush: true, body: UI.table([
          { label: '时间', render: (l) => '<span class="small tnum muted">' + E(l.at) + '</span>' },
          { label: '应用', render: (l) => UI.pill(APP_NAME[l.app], APP_CLS[l.app]) },
          { label: '操作', render: (l) => E(l.act) },
          { label: '操作人', render: (l) => E(l.by) }
        ], LOGS().slice(0, 6).map((l, i) => Object.assign({ _id: i }, l))) });
    },
    actions: {
      go(d) { App.go(d.id); },
      previewAll() { App.openPreview(); },
      publish() { App.openPublish('本次发布'); }
    }
  };

  function LOGS() {
    return [
      { at: '2026-11-06 09:12', app: 'versionall', act: '修改「连续打卡奖励」库存：体脂秤 12 → 8', by: '孙敏' },
      { at: '2026-11-05 18:22', app: 'versionall', act: '发布「第 7 期奖励档位调整」共 4 项', by: '孙敏' },
      { at: '2026-11-05 15:40', app: 'employee', act: '上架服务「肺结节管理服务」', by: '周琳' },
      { at: '2026-11-04 11:08', app: 'employee', act: '发布「服务目录更新」共 2 项', by: '周琳' },
      { at: '2026-11-03 16:30', app: 'pku', act: '更新 6 位专家资料与照片', by: '张伟' },
      { at: '2026-11-02 16:40', app: 'pku', act: '发布「师资团队资料更新」共 8 项', by: '张伟' },
      { at: '2026-11-02 10:05', app: 'versionall', act: '编辑结营寄语（王雪）', by: '王雪' }
    ];
  }

  /* ------------------------------------------------------- 发布中心 */
  P['s-publish'] = {
    app: 'all', title: '发布中心', sub: '配置改动从本地进入线上，可对比、可回滚',
    preview: 'pku-home',
    render() {
      const dirty = Store.dirty;
      const byApp = {};
      dirty.forEach((d) => { (byApp[d.app] = byApp[d.app] || []).push(d); });
      return K.head('发布中心', '当前有 ' + dirty.length + ' 项未发布变更 · 发布后线上 H5 拉取新配置',
        (dirty.length ? '<button class="btn" data-act="discard" style="color:var(--coral)">丢弃全部变更</button>' : '') +
        '<button class="btn primary" data-act="publish"' + (dirty.length ? '' : ' disabled') + '>' + I('send', 15) + '发布 ' + dirty.length + ' 项</button>') +
        K.kpis([
          { k: '未发布变更', v: dirty.length, unit: '项', d: dirty.length ? '涉及 ' + Object.keys(byApp).length + ' 个应用' : '全部已同步', tone: dirty.length ? 'down' : 'up' },
          { k: '上次发布', v: Store.db.meta.publishedAt.slice(5, 10), d: '共 4 项 · 孙敏', unit: '' },
          { k: '回滚点', v: 24, unit: '个', d: '保留最近 24 次快照' },
          { k: '线上环境', v: '生产', d: 'GitHub Pages · 3 个仓库' }
        ]) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            (dirty.length ? Object.keys(byApp).map((app) =>
              K.panel({ title: APP_NAME[app] + ' · ' + byApp[app].length + ' 项变更', sub: '待发布', cls: 'stack',
                body: byApp[app].map((d) =>
                  '<div class="listrow"><span class="pill ' + APP_CLS[app] + '">' + E(d.label) + '</span>' +
                  '<div class="meta"><b>' + E(d.path.replace(/\.\d+\./g, '[').replace(/\./g, ' · ')) + '</b><span>' + new Date(d.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + '</span></div>' +
                  '<button class="iconbtn right" data-act="revertOne" data-id="' + d.path + '">' + I('undo', 14) + '</button></div>').join('') }) +
              '</div>').join('') : '<div class="panel"><div class="empty"><b>所有变更都已发布</b>线上与本地一致。下一次编辑会出现在这里。</div></div>') +
          '</div>' +
          '<div class="stack">' +
            K.panel({ title: '发布选项', body: '<div class="stack" style="gap:12px">' +
              UI.fSwitch({ label: '发布前自动校验', value: true, path: 'meta.settings.validate' }) +
              UI.fSwitch({ label: '推送到 GitHub 仓库', value: false, path: 'meta.settings.pushGithub', hint: '需要仓库写入权限的 Token' }) +
              UI.fSwitch({ label: '通知相关运营人员', value: true, path: 'meta.settings.notify' }) +
              '</div>' }) +
            K.panel({ title: '发布须知', body: '<div class="small mut" style="line-height:1.8">' +
              '① 发布为整包发布，三端各自读取自己的配置文件。<br>② 已领取奖励、历史订单以快照为准，不受配置变更影响。<br>③ 发布后 1 分钟内 CDN 生效，可强制刷新。' +
              '</div><div class="note teal" style="margin-top:12px">支持回滚：每次发布会保存完整配置快照，可一键回到任意历史版本。</div>' }) +
          '</div>' +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '发布历史', flush: true, body: UI.table([
          { label: '时间', render: (p) => '<span class="tnum small">' + E(p.at) + '</span>' },
          { label: '应用', render: (p) => UI.pill(APP_NAME[p.app], APP_CLS[p.app]) },
          { label: '说明', render: (p) => E(p.title) },
          { label: '变更', align: 'right', render: (p) => '<span class="tnum">' + p.items + ' 项</span>' },
          { label: '操作人', render: (p) => E(p.by) },
          { label: '状态', render: (p) => UI.pill('已上线', 'green') },
          { label: '', align: 'right', render: (p) => '<div class="rowact"><button data-act="rollback" data-id="' + p.id + '">' + I('undo', 14) + '</button></div>' }
        ], Store.db.publishes.map((p) => Object.assign({ _id: p.id }, p))) });
    },
    actions: {
      publish() { App.openPublish('本次发布'); },
      discard() {
        UI.confirm({ title: '丢弃 ' + Store.dirtyCount + ' 项未发布变更？', desc: '本地改动将回到上次发布的状态，不可恢复。', danger: true, okText: '丢弃' })
          .then((ok) => { if (!ok) return; Store.discard(); UI.toast('已丢弃未发布变更'); App.refresh(); });
      },
      revertOne(d) { UI.toast('已撤回该字段的改动'); },
      rollback(d) {
        UI.confirm({ title: '回滚到该版本？', desc: '将以该次发布的完整配置覆盖当前配置，本次操作会记录在日志中。', okText: '回滚' })
          .then((ok) => { if (ok) UI.toast('已回滚，等待生效'); });
      }
    }
  };

  /* ------------------------------------------------------- 操作日志 */
  P['s-logs'] = {
    app: 'all', title: '操作日志', sub: '谁在什么时候改了什么',
    preview: 'pku-home',
    render() {
      return K.head('操作日志', '保留最近 90 天 · 支持按应用与操作人筛选',
        K.btn('导出日志', 'exportLog', { icon: 'download' })) +
        K.toolbar(K.seg([{ id: 'all', label: '全部' }, { id: 'versionall', label: '减重营' }, { id: 'pku', label: '品牌站' }, { id: 'employee', label: '职工健康' }], 'all', 'logFilter'), K.search('搜索操作内容', 'logSearch')) +
        K.panel({ flush: true, body: UI.table([
          { label: '时间', render: (l) => '<span class="small tnum muted">' + E(l.at) + '</span>' },
          { label: '应用', render: (l) => UI.pill(APP_NAME[l.app], APP_CLS[l.app]) },
          { label: '操作', render: (l) => E(l.act) },
          { label: '操作人', render: (l) => '<div class="cellflex">' + UI.avatar(l.by) + '<span class="small">' + E(l.by) + '</span></div>' },
          { label: '来源', render: () => '<span class="small muted">Web 控制台</span>' }
        ], LOGS().map((l, i) => Object.assign({ _id: i }, l))) });
    },
    actions: { logFilter() { UI.toast('已筛选'); }, logSearch() {}, exportLog() { UI.toast('日志已导出'); } }
  };

  /* ------------------------------------------------------- 系统设置 */
  P['s-settings'] = {
    app: 'all', title: '系统设置', sub: '环境、账号与本地数据',
    preview: 'pku-home',
    render() {
      const m = Store.db.meta;
      return K.head('系统设置', '控制台版本 v' + m.version + ' · ' + m.env) +
        '<div class="grid g-2">' +
          K.panel({ title: '账号', body: '<div class="row" style="gap:14px">' + UI.avatar('孙敏', '') +
            '<div><b>孙敏</b><div class="small mut">运营负责人 · 督导权限</div></div><button class="btn sm right">切换账号</button></div>' +
            '<div class="hairline"></div><dl class="kv"><dt>角色</dt><dd>超级管理员</dd><dt>可管理应用</dt><dd>减重营 · 品牌站 · 职工健康</dd><dt>最近登录</dt><dd>2026-11-06 09:02 · 北京</dd></dl>' }) +
          K.panel({ title: '环境', body: '<dl class="kv">' +
            '<dt>控制台版本</dt><dd>v' + m.version + '</dd><dt>数据源</dt><dd>本地配置 + 发布快照</dd>' +
            '<dt>线上仓库</dt><dd>baoweidong/versionall 等 3 个</dd><dt>上次发布</dt><dd>' + m.publishedAt + '</dd></dl>' +
            '<div class="hairline"></div><div class="row"><span class="small mut">本地变更</span><b class="right small">' + Store.dirtyCount + ' 项</b></div>' }) +
          K.panel({ title: '发布通道', body: '<div class="stack" style="gap:12px">' +
            UI.fInput({ label: 'GitHub Token', value: '', ph: 'ghp_… 仅保存在本机浏览器', hint: '用于将配置直接推送到三个 H5 仓库，不经过第三方服务器' }) +
            '<div class="note warn">Token 存储在浏览器 localStorage，仅在点击发布时用于 GitHub API 调用。演示环境可只用「下载配置包」。</div></div>' }) +
          K.panel({ title: '数据', body: '<div class="stack" style="gap:10px">' +
            '<div class="row"><div style="flex:1"><b style="font-size:12.5px">重置为演示数据</b><div class="small mut">清空本地改动，恢复初始配置</div></div>' +
            '<button class="btn danger" data-act="reset">重置</button></div>' +
            '<div class="hairline"></div>' +
            '<div class="row"><div style="flex:1"><b style="font-size:12.5px">导出全部配置</b><div class="small mut">下载三端完整 JSON</div></div>' +
            '<button class="btn" data-act="exportAll">导出</button></div></div>' }) +
        '</div>';
    },
    actions: {
      reset() {
        UI.confirm({ title: '重置为演示数据？', desc: '所有本地改动与未发布变更都会丢失。', danger: true, okText: '重置' })
          .then((ok) => { if (!ok) return; Store.reset(); UI.toast('已重置'); App.refresh(); });
      },
      exportAll() {
        const blob = new Blob([JSON.stringify({ versionall: Store.db.versionall, brand: Store.db.brand, employee: Store.db.employee }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'pku-console-config.json'; a.click();
        UI.toast('配置已导出');
      }
    }
  };

  window.NAV.system = [
    { group: '', items: [{ id: 'workbench', label: '工作台', icon: 'grid' }] },
    { group: '交付', items: [
      { id: 's-publish', label: '发布中心', icon: 'send', count: Store.dirtyCount || null },
      { id: 's-logs', label: '操作日志', icon: 'clock' },
      { id: 's-settings', label: '系统设置', icon: 'settings' }
    ] }
  ];
})();
