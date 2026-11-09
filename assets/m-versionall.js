/* ============================================================================
   减重营 · versionall 运营模块
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const V = () => Store.db.versionall;

  const ROLE = { student: '学员', coach: '教练', dietitian: '营养师' };
  const MEAL = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
  const CAMP = (id) => (V().camps.find((c) => c.id === id) || {}).name || '—';
  const STU = (id) => V().students.find((s) => s.id === id) || { name: '—' };

  function toneOf(i) { return ['', 'g', 'a', 'v'][i % 4]; }
  function fmt(n, d) { return d == null ? String(n) : Number(n).toFixed(d); }

  /* ------------------------------------------------------------ 1 概览 */
  P['v-dashboard'] = {
    app: 'versionall', title: '运营概览', sub: '第 7 期 · 代谢重塑 · 第 18 天',
    preview: 'student-home',
    render() {
      const v = V();
      const camp = v.camps[0];
      const active = v.students.filter((s) => s.campIds.indexOf('camp1') >= 0);
      const today = v.records.diet.filter((r) => r.date.indexOf('2026-11-05') === 0).length;
      const pending = v.records.exercise.filter((r) => !r.comments || !r.comments.length).length;
      const toShip = v.claims.filter((c) => c.status === 'pending').length;
      const weightSeries = v.students.slice(0, 1).map((s) => ({
        data: v.records.weight.filter((r) => r.studentId === s.id).map((r) => r.weight)
      }));
      const avg = [74.6, 74.1, 73.7, 73.2, 72.9, 72.6, 72.3, 71.9];
      return K.head('运营概览', '第 7 期 · 代谢重塑 · 开营 ' + camp.start + '，还剩 ' + 10 + ' 天结营',
        K.btn('导出周报', 'export', { icon: 'download' }) +
        K.btn('进入预览', 'preview', { icon: 'eye', cls: 'ghost' })) +
        K.kpis([
          { k: '在营学员', v: camp.enrolled, unit: '人', d: '较上周 <b>+2</b>', tone: 'up', icon: 'users' },
          { k: '今日打卡完成率', v: '78.4', unit: '%', d: '目标 80% · 差 1.6pt', icon: 'check' },
          { k: '待批注记录', v: pending, unit: '条', d: '教练端 3 人待处理', icon: 'message' },
          { k: '待发货', v: toShip, unit: '单', d: '超 48h 未发 <b>1</b> 单', tone: 'down', icon: 'truck' }
        ]) +
        '<div class="grid g-2-1 stack">' +
          K.panel({
            title: '全营平均体重趋势', sub: '近 8 个记录点',
            actions: '<span class="legend"><span><i style="background:#0b63e5"></i>平均体重</span></span>',
            body: UI.lineChart([{ data: avg, color: '#0b63e5' }], { height: 150, dots: true, min: 66, max: 76, labels: ['D1', 'D3', 'D6', 'D9', 'D12', 'D15', 'D18', 'D21'] })
          }) +
          K.panel({
            title: '打卡完成度', sub: '按当日全项完成口径',
            body: '<div style="display:flex;align-items:center;gap:18px;padding:4px 0 8px">' +
              UI.donut(78, '#0b63e5', 108) +
              '<div style="flex:1">' +
                [['饮食', 86, '#0b63e5'], ['运动', 71, '#0aa39a'], ['体重', 92, '#c8871a']].map((x) =>
                  '<div style="margin-bottom:10px"><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div>' +
                  '<div class="progress" style="margin-top:4px"><b style="width:' + x[1] + '%;background:' + x[2] + '"></b></div></div>').join('') +
              '</div></div>'
          }) +
        '</div>' +
        '<div class="grid g-1-2 stack" style="margin-top:16px">' +
          K.panel({
            title: '今日待办', sub: '按紧急度排序',
            body: '<div>' +
              [['3 条运动记录待批注', '教练 · 刘洋', 'amber', 'v-annotations'],
               ['1 单奖励超时未发货', '履约中心', 'red', 'v-claims'],
               ['第八期开营物料待确认', '营期管理', 'blue', 'v-camps']].map((t) =>
                '<div class="listrow" style="cursor:pointer" data-act="go" data-id="' + t[3] + '">' +
                '<span class="pill ' + (t[2] === 'red' ? 'red' : t[2] === 'amber' ? 'amber' : 'blue') + '">' + (t[2] === 'red' ? '紧急' : t[2] === 'amber' ? '待处理' : '待确认') + '</span>' +
                '<div class="meta"><b>' + E(t[0]) + '</b><span>' + E(t[1]) + '</span></div>' +
                '<div class="right mut">' + I('chevron', 14) + '</div></div>').join('') +
            '</div>'
          }) +
          K.panel({
            title: '学员打卡热力', sub: '最近 21 天 · 每行一名学员', flush: true,
            body: '<div style="padding:6px 18px 16px">' + attendanceGrid(v, 21) + '</div>'
          }) +
        '</div>';
    },
    actions: {
      go(d) { App.go(d.id); },
      preview() { App.openPreview(); },
      export() { UI.toast('周报已生成，正在下载'); }
    }
  };

  function attendanceGrid(v, days) {
    const list = v.students.filter((s) => s.campIds.indexOf('camp1') >= 0).slice(0, 8);
    let h = '<div style="display:grid;grid-template-columns:34px 1fr;gap:6px;align-items:center">';
    list.forEach((s, si) => {
      h += '<div class="small mut" style="font-size:10.5px">' + E(s.name.slice(0, 1)) + '</div><div style="display:grid;grid-template-columns:repeat(' + days + ',1fr);gap:3px">';
      for (let d = 0; d < days; d++) {
        const seed = (si * 7 + d * 13) % 10;
        const lvl = seed > 6 ? 0 : seed > 3 ? 1 : seed > 1 ? 2 : 3;
        const colors = ['#eef3fa', '#dbe9fb', '#8fbdfa', '#0b63e5'];
        h += '<div title="' + E(s.name) + ' · 第 ' + (d + 1) + ' 天" style="height:17px;border-radius:4px;background:' + colors[lvl] + '"></div>';
      }
      h += '</div>';
    });
    return h + '</div>';
  }

  /* ------------------------------------------------------- 2 营期管理 */
  P['v-camps'] = {
    app: 'versionall', title: '营期管理', sub: '一个营期是一份独立的数据与规则副本',
    preview: 'student-home',
    render() {
      const v = V();
      return K.head('营期管理', '营期之间的学员、奖励、商品、记录完全隔离；复制营期会带上规则但不带学员数据',
        '<button class="btn" data-act="go" data-id="lib-templates">' + I('copy', 15) + '从模板新建</button>' +
        K.btn('新建营期', 'newCamp', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '营期总数', v: v.camps.length, unit: '个', d: '进行中 1 · 待开营 1' },
          { k: '在营学员', v: v.camps[0].enrolled, unit: '人', d: '容量 ' + v.camps[0].capacity },
          { k: '累计结营', v: 6, unit: '期', d: '累计服务 1,204 人' },
          { k: '平均满员率', v: '81', unit: '%', d: '较上季度 <b>+6pt</b>', tone: 'up' }
        ]) +
        '<div class="grid g-2 stack">' + v.camps.map((c) =>
          '<div class="panel" style="padding:0;overflow:hidden">' +
            '<div style="padding:16px 18px;display:flex;gap:12px;align-items:flex-start">' +
              '<div class="ava lg ' + (c.status === 'active' ? '' : c.status === 'upcoming' ? 'g' : 'a') + '">' + (c.status === 'active' ? '营' : c.status === 'upcoming' ? '待' : '结') + '</div>' +
              '<div style="min-width:0;flex:1"><div class="row" style="gap:8px"><b style="font-size:14px">' + E(c.name) + '</b>' + UI.statusPill(c.status) + '</div>' +
                '<div class="small mut" style="margin-top:4px">' + E(c.code) + ' · ' + E(c.theme) + '</div>' +
                '<div class="small mut" style="margin-top:2px">' + c.start + ' → ' + c.end + ' · ' + E(c.host || '') + '</div></div>' +
              '<button class="iconbtn" data-act="editCamp" data-id="' + c.id + '">' + I('edit', 16) + '</button>' +
            '</div>' +
            '<div style="padding:0 18px 14px"><div class="row small mut" style="justify-content:space-between"><span>报名 ' + c.enrolled + ' / ' + c.capacity + '</span><span>' + Math.round(c.enrolled / c.capacity * 100) + '%</span></div>' +
              '<div style="margin-top:6px">' + K.progress(c.enrolled / c.capacity * 100) + '</div></div>' +
            '<div class="panel-foot"><span class="small mut">负责人 ' + E(c.owner) + '</span><div class="right row" style="gap:6px">' +
              '<button class="btn sm" data-act="copyCamp" data-id="' + c.id + '">复制</button>' +
              '<button class="btn sm" data-act="goStudents" data-id="' + c.id + '">学员</button>' +
            '</div></div>' +
          '</div>').join('') + '</div>';
    },
    actions: {
      editCamp(d) {
        const c = V().camps.find((x) => x.id === d.id);
        UI.drawer({
          title: '编辑营期', sub: c.code, icon: 'calendar',
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '营期名称', value: c.name, path: 'versionall.camps.' + UI.ix(V().camps, c) + '.name' }) +
            '<div class="frow">' + UI.fInput({ label: '开营日期', value: c.start, path: 'versionall.camps.' + UI.ix(V().camps, c) + '.start' }) +
            UI.fInput({ label: '结营日期', value: c.end, path: 'versionall.camps.' + UI.ix(V().camps, c) + '.end' }) + '</div>' +
            UI.fSelect({ label: '状态', value: c.status, options: [{ v: 'draft', l: '草稿' }, { v: 'upcoming', l: '待开营' }, { v: 'active', l: '进行中' }, { v: 'ended', l: '已结营' }], path: 'versionall.camps.' + UI.ix(V().camps, c) + '.status' }) +
            UI.fNum({ label: '学员容量', value: c.capacity, path: 'versionall.camps.' + UI.ix(V().camps, c) + '.capacity' }) +
            '</div><div class="formsec"><h4>履约信息</h4>' +
            UI.fInput({ label: '主办医院', value: c.host, path: 'versionall.camps.' + UI.ix(V().camps, c) + '.host' }) +
            UI.fInput({ label: '地点', value: c.location, path: 'versionall.camps.' + UI.ix(V().camps, c) + '.location' }) +
            '</div><div class="note">修改营期日期会同步影响打卡日历与结营报告的天数口径，保存后需重新发布。</div>',
          okText: '保存', extra: '<button class="btn danger" data-del="' + c.id + '">' + I('trash', 15) + '删除</button>',
          mount(n) {
            n.querySelector('[data-del]').addEventListener('click', () => {
              UI.confirm({ title: '删除该营期？', desc: '将同时删除该营期的打卡记录、奖励与订单，且不可恢复。', danger: true, okText: '删除' }).then((ok) => {
                if (!ok) return;
                UI.closeOverlay(); Store.removeItem('versionall.camps', c.id, 'id', '删除营期'); UI.toast('营期已删除'); App.refresh();
              });
            });
          },
          onOk() { UI.toast('营期已保存，待发布'); }
        });
      },
      newCamp() {
        UI.drawer({
          title: '新建营期', sub: '会复制当前营期的规则配置', icon: 'plus',
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '营期名称', value: '第十期 · 轻盈计划', ph: '如 第十期 · 轻盈计划' }) +
            '<div class="frow">' + UI.fInput({ label: '开营日期', value: '2027-03-01' }) + UI.fInput({ label: '结营日期', value: '2027-03-28' }) + '</div>' +
            UI.fNum({ label: '学员容量', value: 60 }) +
            UI.fSelect({ label: '规则模板', value: 'camp1', options: [{ v: 'camp1', l: '第七期 · 代谢重塑（推荐）' }, { v: 'blank', l: '空白规则' }] }) +
            '</div><div class="note teal">复制规则包含：打卡规则、积分规则、徽章、奖励档位、积分商品；不包含学员与订单。</div>',
          okText: '创建营期',
          onOk() {
            const list = V().camps;
            list.unshift({ id: 'camp' + Date.now(), code: 'PKU-2027-01', name: '第十期 · 轻盈计划', theme: '28 天体重管理计划', start: '2027-03-01', end: '2027-03-28', status: 'draft', capacity: 60, host: '北京大学国际医院', location: '北京 · 昌平', enrolled: 0, owner: '孙敏' });
            Store.mark('versionall.camps', '新建营期');
            UI.toast('营期已创建，当前为草稿');
            App.refresh();
          }
        });
      },
      copyCamp(d) {
        UI.confirm({ title: '复制该营期？', desc: '将复制规则与内容配置，学员和订单不会复制。', okText: '复制' }).then((ok) => {
          if (!ok) return;
          const c = V().camps.find((x) => x.id === d.id);
          const n = JSON.parse(JSON.stringify(c));
          n.id = 'camp' + Date.now(); n.name = c.name + '（副本）'; n.status = 'draft'; n.enrolled = 0; n.code = c.code + '-C';
          V().camps.unshift(n);
          Store.mark('versionall.camps', '复制营期');
          UI.toast('已复制为草稿');
          App.refresh();
        });
      },
      goStudents(d) { App.go('v-students', { camp: d.id }); }
    }
  };

  /* ------------------------------------------------------- 3 账户权限 */
  P['v-accounts'] = {
    app: 'versionall', title: '账户与权限', sub: '手机号是唯一登录凭证；停用后立即失去登录能力',
    preview: 'student-home',
    render() {
      const v = V();
      const rows = v.accounts.map((a) => Object.assign({ _id: a.id }, a));
      return K.head('账户与权限', '共 ' + v.accounts.length + ' 个账户 · 营养师可配置督导权限查看全营数据',
        K.toolbar(K.seg([{ id: 'all', label: '全部 ' + v.accounts.length }, { id: 'dietitian', label: '营养师' }, { id: 'coach', label: '教练' }, { id: 'student', label: '学员' }], 'all', 'roleFilter'),
          K.btn('批量导入', 'importAcc', { icon: 'upload' }) + K.btn('新增账户', 'newAcc', { icon: 'plus', cls: 'primary' }))) +
        K.panel({
          flush: true,
          body: UI.table([
            { label: '账户', render: (r) => '<div class="cellflex">' + UI.avatar(r.name, toneOf(r.name.length)) + '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.phone) + '</div></div></div>' },
            { label: '角色', render: (r) => UI.pill(ROLE[r.role], r.role === 'dietitian' ? 'blue' : r.role === 'coach' ? 'green' : 'grey') + (r.supervisor ? ' ' + UI.pill('督导', 'violet') : '') },
            { label: '所属营期', render: (r) => (r.campIds || []).map((c) => E(CAMP(c))).join('、') || '<span class="muted">全部</span>' },
            { label: '最近登录', render: (r) => '<span class="muted tnum">' + E(r.lastLogin || '从未') + '</span>' },
            { label: '状态', render: (r) => r.active ? UI.pill('启用', 'green') : UI.pill('已停用', 'grey') },
            { label: '', align: 'right', render: (r) => '<div class="rowact">' +
                '<button data-act="editAcc" data-id="' + r.id + '" title="编辑">' + I('edit', 14) + '</button>' +
                '<button data-act="toggleAcc" data-id="' + r.id + '" title="启停">' + I('lock', 14) + '</button></div>' }
          ], rows, { emptyTitle: '没有匹配的账户' })
        });
    },
    actions: {
      newAcc() {
        UI.drawer({
          title: '新增账户', sub: '手机号将作为首次登录凭证', icon: 'user',
          body: '<div class="formsec"><h4>身份</h4>' +
            UI.fInput({ label: '姓名', value: '', ph: '真实姓名' }) +
            UI.fInput({ label: '手机号', value: '', ph: '11 位手机号' }) +
            UI.fSelect({ label: '角色', value: 'student', options: [{ v: 'student', l: '学员' }, { v: 'dietitian', l: '营养师' }, { v: 'coach', l: '教练' }] }) +
            '</div><div class="formsec"><h4>权限</h4>' +
            UI.fSelect({ label: '所属营期', value: 'camp1', options: V().camps.map((c) => ({ v: c.id, l: c.name })) }) +
            UI.fSwitch({ label: '督导权限', value: false, path: 'tmp.supervisor', hint: '可查看全营学员、营养师与教练批注情况' }) +
            UI.fSwitch({ label: '启用账户', value: true, path: 'tmp.active' }) +
            '</div>',
          okText: '创建并发送短信',
          onOk() { UI.toast('账户已创建，邀请短信已发送'); App.refresh(); }
        });
      },
      editAcc(d) {
        const a = V().accounts.find((x) => x.id === d.id);
        const i = UI.ix(V().accounts, a);
        UI.drawer({
          title: a.name, sub: a.phone + ' · ' + ROLE[a.role], icon: 'user',
          body: '<div class="formsec"><h4>身份</h4>' +
            UI.fInput({ label: '姓名', value: a.name, path: 'versionall.accounts.' + i + '.name' }) +
            UI.fSelect({ label: '角色', value: a.role, options: [{ v: 'student', l: '学员' }, { v: 'dietitian', l: '营养师' }, { v: 'coach', l: '教练' }], path: 'versionall.accounts.' + i + '.role' }) +
            UI.fInput({ label: '最近登录', value: a.lastLogin, disabled: true }) +
            '</div><div class="formsec"><h4>权限</h4>' +
            UI.fInput({ label: '所属营期 ID', value: (a.campIds || []).join(', '), hint: '多个营期用逗号分隔', path: 'versionall.accounts.' + i + '.campIdsText' }) +
            UI.fSwitch({ label: '督导权限', value: !!a.supervisor, path: 'versionall.accounts.' + i + '.supervisor' }) +
            UI.fSwitch({ label: '启用账户', value: a.active, path: 'versionall.accounts.' + i + '.active' }) +
            '</div><div class="note warn">停用后该手机号将立即无法登录，已产生的数据保留。</div>',
          extra: '<button class="btn danger" data-reset>重置密码</button>',
          mount(n) { n.querySelector('[data-reset]').addEventListener('click', () => UI.toast('重置链接已发送至该手机号')); },
          onOk() { UI.toast('账户已更新'); App.refresh(); }
        });
      },
      toggleAcc(d) {
        const a = V().accounts.find((x) => x.id === d.id);
        Store.set('versionall.accounts.' + UI.ix(V().accounts, a) + '.active', !a.active, '账户启停');
        UI.toast(a.active ? '已停用 ' + a.name : '已启用 ' + a.name);
        App.refresh();
      },
      roleFilter(d) { UI.toast('筛选：' + (d.id === 'all' ? '全部角色' : ROLE[d.id])); },
      importAcc() { UI.toast('请上传含姓名、手机号、角色的 xlsx'); }
    }
  };

  /* --------------------------------------------------------- 4 学员 */
  P['v-students'] = {
    app: 'versionall', title: '学员管理', sub: '档案、打卡与批注的统一入口',
    preview: 'student-home',
    render() {
      const v = V();
      const rows = v.students.map((s) => Object.assign({ _id: s.id, _act: 'viewStudent' }, s));
      return K.head('学员管理', '第 7 期 48 人 · 高风险 1 人 · 暂停 1 人',
        K.toolbar(K.search('搜索姓名 / 手机号', 'studentSearch') + K.seg([{ id: 'all', label: '全部' }, { id: 'high', label: '高风险' }, { id: 'paused', label: '已暂停' }], 'all', 'stuFilter'),
          K.btn('导出名单', 'exportStudents', { icon: 'download' }) + K.btn('邀请学员', 'invite', { icon: 'plus', cls: 'primary' }))) +
        K.panel({
          flush: true,
          body: UI.table([
            { label: '学员', render: (s) => '<div class="cellflex">' + UI.avatar(s.name, toneOf(s.name.length)) + '<div><div class="strong">' + E(s.name) + '</div><div class="small muted">' + E(s.phone) + ' · ' + s.age + ' 岁</div></div></div>' },
            { label: '体重变化', align: 'right', render: (s) => '<span class="tnum strong">' + fmt(s.startWeight, 1) + ' → ' + fmt(s.weight, 1) + '</span><div class="small" style="color:#087e76">-' + fmt(s.startWeight - s.weight, 1) + ' kg</div>' },
            { label: '完成度', w: '130px', render: (s) => '<div class="row" style="gap:8px"><div style="flex:1">' + K.progress(s.completion) + '</div><span class="tnum small">' + s.completion + '%</span></div>' },
            { label: '连续', align: 'center', render: (s) => '<span class="tnum">' + s.streak + ' 天</span>' },
            { label: '风险', render: (s) => UI.statusPill(s.risk) },
            { label: '负责人', render: (s) => '<span class="small">' + E(s.dietitian) + '<br><span class="muted">' + E(s.coach) + '</span></span>' },
            { label: '状态', render: (s) => UI.statusPill(s.status) },
            { label: '', align: 'right', render: (s) => '<div class="rowact"><button data-act="viewStudent" data-id="' + s.id + '">' + I('chevron', 14) + '</button></div>' }
          ], rows, { emptyTitle: '没有匹配的学员' })
        });
    },
    actions: {
      viewStudent(d) { App.go('v-student-detail', { id: d.id }); },
      invite() { UI.toast('邀请链接已复制，可直接发给学员或转发到班级群'); },
      exportStudents() { UI.toast('学员名单已导出'); },
      stuFilter(d) { UI.toast('筛选：' + d.id); }
    }
  };

  P['v-student-detail'] = {
    app: 'versionall', title: '学员详情', sub: '档案与打卡轨迹',
    preview: 'student-home', hideNav: true,
    render(ctx) {
      const s = STU((ctx && ctx.id) || 's1');
      const v = V();
      const w = v.records.weight.filter((r) => r.studentId === s.id);
      return K.head(s.name, s.age + ' 岁 · ' + (s.gender === 'male' ? '男' : '女') + ' · ' + E(s.phone),
        K.btn('返回名单', 'back', { icon: 'undo' }) + K.btn('手动加减分', 'manualScore', { icon: 'plus' })) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '体重趋势', sub: '开营 ' + fmt(s.startWeight, 1) + 'kg → 当前 ' + fmt(s.weight, 1) + 'kg', body: UI.lineChart([{ data: w.map((r) => r.weight) }], { height: 160, dots: true, min: s.weight - 2, max: s.startWeight + 1 }) }) +
          K.panel({ title: '档案', body: '<dl class="kv">' +
            '<dt>身高</dt><dd>' + s.height + ' cm</dd><dt>目标体重</dt><dd>' + fmt(s.targetWeight, 1) + ' kg</dd>' +
            '<dt>体脂率</dt><dd>' + s.bodyFat + ' %</dd><dt>所属营期</dt><dd>' + s.campIds.map(CAMP).join('、') + '</dd>' +
            '<dt>营养师</dt><dd>' + E(s.dietitian) + '</dd><dt>教练</dt><dd>' + E(s.coach) + '</dd>' +
            '<dt>标签</dt><dd>' + (s.tags.length ? s.tags.map((t) => UI.pill(t, 'grey')).join(' ') : '—') + '</dd>' +
            '<dt>备注</dt><dd>' + E(s.note || '—') + '</dd></dl>' })
        + '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({
          title: '打卡记录', sub: '最近 12 条', flush: true,
          body: UI.table([
            { label: '日期', render: (r) => '<span class="tnum small">' + E(r.date) + '</span>' },
            { label: '类型', render: (r) => UI.pill(r._t, r._t === '体重' ? 'blue' : r._t === '饮食' ? 'green' : 'amber') },
            { label: '内容', render: (r) => E(r._c) },
            { label: '批注', render: (r) => r._cm ? '<span class="small">' + E(r._cm) + '</span>' : '<span class="muted">待批注</span>' }
          ], v.records.weight.filter((r) => r.studentId === s.id).slice(0, 5).map((r) => ({ _t: '体重', _c: r.weight + ' kg', _cm: r.dietitianComment, date: r.date }))
            .concat(v.records.diet.filter((r) => r.studentId === s.id).slice(0, 4).map((r) => ({ _t: '饮食', _c: MEAL[r.meal] + ' · ' + r.description, _cm: r.comments[0] && r.comments[0].text, date: r.date })))
            .concat(v.records.exercise.filter((r) => r.studentId === s.id).slice(0, 4).map((r) => ({ _t: '运动', _c: r.type + ' ' + r.duration + ' 分钟', _cm: r.comments[0] && r.comments[0].text, date: r.date }))))
        });
    },
    actions: {
      back() { App.back(); },
      manualScore() {
        UI.drawer({
          title: '手动加减分', sub: '用于补录线下打卡或纠正异常', icon: 'plus',
          body: '<div class="formsec"><h4>调整</h4>' +
            UI.fSelect({ label: '类型', value: 'add', options: [{ v: 'add', l: '加分' }, { v: 'sub', l: '减分' }] }) +
            UI.fNum({ label: '分值', value: 5 }) +
            UI.fInput({ label: '原因', value: '', ph: '如 参加线下体测 +5' }) +
            UI.fInput({ label: '关联日期', value: '2026-11-06' }) +
            '</div><div class="note">操作会写入积分明细，学员端可见。</div>',
          onOk() { UI.toast('积分已调整'); }
        });
      }
    }
  };

  /* ------------------------------------------------------- 5 打卡记录 */
  P['v-records'] = {
    app: 'versionall', title: '打卡记录', sub: '体重 / 饮食 / 运动三类记录的全量视图',
    preview: 'student-checkin',
    state: { tab: 'weight' },
    render() {
      const v = V(), tab = P['v-records'].state.tab;
      const list = tab === 'weight' ? v.records.weight : tab === 'diet' ? v.records.diet : v.records.exercise;
      const cols = tab === 'weight' ? [
        { label: '学员', render: (r) => '<div class="cellflex">' + UI.avatar(STU(r.studentId).name) + '<span class="strong">' + E(STU(r.studentId).name) + '</span></div>' },
        { label: '时间', render: (r) => '<span class="tnum small">' + E(r.date) + '</span>' },
        { label: '体重', align: 'right', render: (r) => '<b class="tnum">' + r.weight + '</b> kg' },
        { label: '照片', render: (r) => r.photos ? UI.pill('已上传', 'green') : '<span class="muted">无</span>' },
        { label: '批注', render: (r) => r.dietitianComment ? '<span class="small">' + E(r.dietitianComment.slice(0, 18)) + '…</span>' : UI.pill('待批注', 'amber') }
      ] : tab === 'diet' ? [
        { label: '学员', render: (r) => E(STU(r.studentId).name) },
        { label: '餐次', render: (r) => UI.pill(MEAL[r.meal], 'green') },
        { label: '时间', render: (r) => '<span class="tnum small">' + E(r.date) + '</span>' },
        { label: '内容', render: (r) => '<span class="small">' + E(r.description) + '</span>' },
        { label: '评分', render: (r) => r.dietitianScore == null ? '<span class="muted">未评</span>' : '★'.repeat(r.dietitianScore + 1) }
      ] : [
        { label: '学员', render: (r) => E(STU(r.studentId).name) },
        { label: '项目', render: (r) => UI.pill(r.type, 'amber') },
        { label: '时长', align: 'right', render: (r) => '<span class="tnum">' + r.duration + '</span> 分钟' },
        { label: '强度', render: (r) => '<span class="tnum small">Lv.' + r.intensity + '</span>' },
        { label: '评分', render: (r) => r.coachScore == null ? '<span class="muted">未评</span>' : ['未达标', '尚可', '到位'][r.coachScore] }
      ];
      return K.head('打卡记录', '共 ' + list.length + ' 条 · 记录不可删除，仅可批注与评分',
        K.btn('导出记录', 'exportRec', { icon: 'download' })) +
        K.tabs([{ id: 'weight', label: '体重', n: v.records.weight.length }, { id: 'diet', label: '饮食', n: v.records.diet.length }, { id: 'exercise', label: '运动', n: v.records.exercise.length }], tab, 'recTab') +
        K.panel({ flush: true, body: UI.table(cols, list.map((r) => Object.assign({ _id: r.id }, r))) });
    },
    actions: {
      recTab(d) { P['v-records'].state.tab = d.id; App.refresh(); },
      exportRec() { UI.toast('记录已导出为 xlsx'); }
    }
  };

  /* --------------------------------------------------------- 6 批注台 */
  P['v-annotations'] = {
    app: 'versionall', title: '批注工作台', sub: '营养师与教练的批注队列，超 24h 高亮',
    preview: 'student-checkin',
    render() {
      const v = V();
      const queue = v.records.exercise.filter((r) => !r.comments || !r.comments.length).slice(0, 6)
        .concat(v.records.diet.filter((r) => !r.comments || !r.comments.length).slice(0, 6));
      return K.head('批注工作台', '待批注 ' + queue.length + ' 条 · 今日已完成 27 条',
        K.toolbar(K.seg([{ id: 'todo', label: '待批注 ' + queue.length }, { id: 'done', label: '已批注' }], 'todo', 'annFilter'),
          K.btn('批量提醒', 'remind', { icon: 'bell' }))) +
        '<div class="grid g-2-1">' +
          K.panel({
            title: '待处理队列', sub: '按等待时长排序', flush: true,
            body: '<div style="padding:4px 18px 12px">' + queue.map((r, idx) => {
              const s = STU(r.studentId);
              return '<div class="listrow" style="cursor:pointer" data-act="openAnn" data-id="' + r.id + '">' +
                UI.avatar(s.name, toneOf(idx)) +
                '<div class="meta"><b>' + E(s.name) + ' · ' + (r.meal ? MEAL[r.meal] : r.type) + '</b><span>' + E(r.date) + '</span></div>' +
                '<div class="right row" style="gap:6px">' + (idx < 2 ? UI.pill('超 24h', 'red') : UI.pill('待处理', 'amber')) + I('chevron', 14) + '</div></div>';
            }).join('') + '</div>'
          }) +
          K.panel({
            title: '批注规范', sub: '运营侧统一口径',
            body: '<div class="stack" style="gap:12px">' +
              [['饮食批注', '先肯定结构，再给 1 条可执行调整；单条不超过 60 字。'],
               ['运动批注', '必须给出评分（未达标 / 尚可 / 到位），并说明动作要点。'],
               ['超时规则', '记录产生 24h 未批注进入红色队列，48h 未批注计入督导考核。'],
               ['多人批注', '同一记录可多名同角色人员分别批注，逐条展示、不覆盖。']].map((x) =>
                '<div><div style="font-size:12.5px;font-weight:500">' + E(x[0]) + '</div><div class="small mut" style="margin-top:3px;line-height:1.6">' + E(x[1]) + '</div></div>').join('') +
            '</div>'
          }) +
        '</div>';
    },
    actions: {
      annFilter() { UI.toast('已切换队列'); },
      remind() { UI.toast('已提醒 3 位负责人'); },
      openAnn(d) {
        const r = V().records.exercise.concat(V().records.diet).find((x) => x.id === d.id);
        const s = STU(r.studentId);
        UI.drawer({
          title: s.name + ' · ' + (r.meal ? MEAL[r.meal] : r.type), sub: r.date, icon: 'message',
          body: '<div class="panel" style="padding:14px"><div class="small" style="line-height:1.7">' +
              (r.description ? E(r.description) : r.type + ' · ' + r.duration + ' 分钟 · 强度 Lv.' + r.intensity) + '</div>' +
              '<div class="row" style="gap:6px;margin-top:10px">' + (r.photos ? UI.pill('1 张照片', 'grey') : '') + (r.videoUrls ? UI.pill('1 段视频', 'grey') : '') + '</div></div>' +
            '<div class="formsec" style="margin-top:14px"><h4>撰写批注</h4>' +
              UI.fArea({ label: '批注内容', value: '', rows: 4, ph: '先肯定，再给一条可执行建议' }) +
              UI.fSelect({ label: '评分', value: r.meal ? '1' : '2', options: r.meal ? [{ v: '0', l: '待改进' }, { v: '1', l: '尚可' }, { v: '2', l: '很好' }] : [{ v: '0', l: '未达标' }, { v: '1', l: '尚可' }, { v: '2', l: '到位' }] }) +
        '</div><div class="note">批注会实时推送到学员端消息中心，并计入本周响应时长。</div>',
          okText: '提交批注',
          onOk() { UI.toast('批注已提交'); App.refresh(); }
        });
      }
    }
  };

  /* --------------------------------------------------------- 7 排行榜 */
  P['v-ranking'] = {
    app: 'versionall', title: '排行榜', sub: '榜单只做正向激励，不对学员推送落后名次',
    preview: 'student-home',
    render() {
      const list = V().students.slice().sort((a, b) => (b.startWeight - b.weight) - (a.startWeight - a.weight));
      const max = Math.max.apply(null, list.map((s) => s.startWeight - s.weight));
      return K.head('排行榜', '按减重公斤数排序 · 每 6 小时刷新',
        K.seg([{ id: 'kg', label: '减重榜' }, { id: 'rate', label: '减重率' }, { id: 'points', label: '积分榜' }], 'kg', 'rankTab')) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '本期榜单', sub: '共 ' + list.length + ' 人', flush: true,
            body: '<div style="padding:6px 18px 14px">' + list.slice(0, 10).map((s, i) =>
              '<div class="listrow"><div style="width:22px;text-align:center" class="tnum ' + (i < 3 ? 'strong' : 'mut') + '">' + (i + 1) + '</div>' +
              UI.avatar(s.name, toneOf(i)) +
              '<div class="meta"><b>' + E(s.name) + '</b><span>' + E(s.dietitian) + ' · 连续 ' + s.streak + ' 天</span></div>' +
              '<div class="right" style="width:110px"><div class="row small" style="justify-content:flex-end"><b class="tnum">-' + fmt(s.startWeight - s.weight, 1) + ' kg</b></div>' +
              '<div class="progress" style="margin-top:4px"><b style="width:' + ((s.startWeight - s.weight) / max * 100) + '%"></b></div></div></div>').join('') + '</div>' }) +
          K.panel({ title: '榜单规则', body: '<div class="stack" style="gap:12px">' +
            [['统计口径', '以开营基线体重为准，取最新一条体重记录。'],
             ['并列处理', '减重相同时按打卡完成度排序。'],
             ['展示范围', '学员端仅展示前 20 名与自己，不显示总人数。'],
             ['隐私', '不展示体重绝对值，仅展示减重差值。']].map((x) => '<div><div style="font-size:12.5px;font-weight:500">' + x[0] + '</div><div class="small mut" style="margin-top:2px">' + x[1] + '</div></div>').join('') +
            '</div>' + '<div class="hairline"></div>' + UI.fSwitch({ label: '学员端展示排行榜', value: true, path: 'versionall.rankingOn' }) })
        + '</div>';
    },
    actions: { rankTab(d) { UI.toast('已切换到' + (d.id === 'kg' ? '减重榜' : d.id === 'rate' ? '减重率榜' : '积分榜')); } }
  };

  /* ------------------------------------------------------- 8 出勤看板 */
  P['v-attendance'] = {
    app: 'versionall', title: '出勤看板', sub: '28 天全周期打卡矩阵，快速发现掉队学员',
    preview: 'student-checkin',
    render() {
      const v = V();
      return K.head('出勤看板', '深色 = 全项完成，浅色 = 部分完成，空白 = 未打卡',
        K.btn('导出看板', 'exportBoard', { icon: 'download' })) +
        K.kpis([
          { k: '全勤人数', v: 6, unit: '人', d: '占在营 12.5%' },
          { k: '连续 3 天未打卡', v: 3, unit: '人', d: '已自动提醒', tone: 'down' },
          { k: '平均完成率', v: '78', unit: '%', d: '较上周 +4pt', tone: 'up' }
        ]) +
        K.panel({ title: '打卡矩阵', sub: '第 1 – 28 天', flush: true,
          body: '<div style="padding:8px 18px 16px;overflow:auto">' + bigGrid(v) + '</div>' }) +
        '<div style="height:16px"></div>' +
        K.panel({ title: '掉队提醒', sub: '连续未打卡 ≥ 3 天', flush: true,
          body: '<div style="padding:4px 18px 12px">' + v.students.slice(0, 3).map((s, i) =>
            '<div class="listrow">' + UI.avatar(s.name, toneOf(i)) + '<div class="meta"><b>' + E(s.name) + '</b><span>最近打卡 ' + (i + 3) + ' 天前 · 完成度 ' + s.completion + '%</span></div>' +
            '<div class="right row" style="gap:6px"><button class="btn sm" data-act="nudge" data-id="' + s.id + '">发送提醒</button></div></div>').join('') + '</div>' });
    },
    actions: {
      nudge(d) { UI.toast('提醒已推送至 ' + STU(d.id).name); },
      exportBoard() { UI.toast('出勤看板已导出'); }
    }
  };

  function bigGrid(v) {
    let h = '<div style="display:grid;grid-template-columns:78px repeat(28,1fr);gap:3px;align-items:center;min-width:560px">';
    h += '<div></div>';
    for (let d = 1; d <= 28; d++) h += '<div class="small mut" style="font-size:9px;text-align:center">' + d + '</div>';
    v.students.filter((s) => s.campIds.indexOf('camp1') >= 0).forEach((s, si) => {
      h += '<div class="small" style="font-size:11px">' + E(s.name) + '</div>';
      for (let d = 0; d < 28; d++) {
        const seed = (si * 11 + d * 7) % 11;
        const c = seed > 7 ? '#eef3fa' : seed > 4 ? '#dbe9fb' : seed > 2 ? '#8fbdfa' : '#0b63e5';
        h += '<div title="' + d + 1 + ' 天" style="height:15px;border-radius:3px;background:' + c + '"></div>';
      }
    });
    return h + '</div>';
  }

  /* --------------------------------------------------------- 9 打卡规则 */
  P['v-rules'] = {
    app: 'versionall', title: '打卡规则', sub: '规则改动会立即体现在学员端打卡页',
    preview: 'student-checkin',
    render() {
      const c = V().checkin;
      return K.head('打卡规则', '餐次时段、打卡项与积分上限 · 修改后右上角预览实时生效',
        K.btn('保存并发布', 'publishRules', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1">' +
          '<div class="stack">' +
            K.panel({ title: '打卡项', sub: '关闭后学员端不再显示该项',
              body: c.items.map((it, i) =>
                '<div class="row" style="padding:12px 0;border-bottom:1px solid var(--line-2)">' +
                '<div style="flex:1"><div style="font-size:12.5px;font-weight:500">' + E(it.name) + '</div><div class="small mut" style="margin-top:2px">' + E(it.desc) + '</div></div>' +
                '<div class="row" style="gap:10px"><span class="small mut">+' + it.points + ' 分</span>' +
                '<button class="switch ' + (it.on ? 'on' : '') + '" data-toggle="versionall.checkin.items.' + i + '.on"></button></div></div>').join('') }) +
            K.panel({ title: '餐次时段', sub: '超时后当日不可补录',
              body: Object.keys(c.meals).map((k) => {
                const m = c.meals[k];
                return '<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line-2)">' +
                  '<div style="width:56px;font-size:12.5px">' + MEAL[k] + '</div>' +
                  '<input class="input" style="width:78px;height:30px" value="' + m.start + '" data-set="versionall.checkin.meals.' + k + '.start">' +
                  '<span class="mut">–</span>' +
                  '<input class="input" style="width:78px;height:30px" value="' + m.end + '" data-set="versionall.checkin.meals.' + k + '.end">' +
                  '<div class="right"><button class="switch ' + (m.on ? 'on' : '') + '" data-toggle="versionall.checkin.meals.' + k + '.on"></button></div></div>';
              }).join('') })
          + '</div>' +
          '<div class="stack">' +
            K.panel({ title: '补卡与宽限', body:
              '<div class="stack" style="gap:14px">' +
              UI.fNum({ label: '迟到宽限（分钟）', value: c.lateGrace, path: 'versionall.checkin.lateGrace', hint: '超过时段结束后的宽限时间记为迟到' }) +
              UI.fNum({ label: '每月补卡次数', value: c.makeupDays, path: 'versionall.checkin.makeupDays' }) +
              UI.fSwitch({ label: '强制上传照片', value: c.requirePhoto, path: 'versionall.checkin.requirePhoto', hint: '关闭后学员可不传照片完成打卡' }) +
              '</div>' }) +
            K.panel({ title: '影响面', body: '<div class="small mut" style="line-height:1.7">当前规则影响：<br>· 48 名在营学员<br>· 28 天打卡日历<br>· 结营报告完成率口径<br>· 连续打卡奖励判定</div>' +
              '<div class="note warn" style="margin-top:10px">修改完成率口径会让历史报告的数值与新口径不一致，建议结营后不再调整。</div>' })
          + '</div>' +
        '</div>';
    },
    actions: { publishRules() { App.openPublish('打卡规则调整'); } }
  };

  /* --------------------------------------------------------- 10 积分规则 */
  P['v-points-rules'] = {
    app: 'versionall', title: '积分规则', sub: '积分是奖励与商城的唯一货币',
    preview: 'student-points',
    render() {
      const p = V().checkin.points;
      return K.head('积分规则', '分值调整只影响之后的记录，不追溯历史积分') +
        '<div class="grid g-2">' +
          K.panel({ title: '单次得分', body: '<div class="stack" style="gap:14px">' +
            UI.fNum({ label: '体重打卡', value: p.weight, path: 'versionall.checkin.points.weight' }) +
            UI.fNum({ label: '饮食打卡（每餐）', value: p.diet, path: 'versionall.checkin.points.diet' }) +
            UI.fNum({ label: '运动打卡', value: p.exercise, path: 'versionall.checkin.points.exercise' }) +
            UI.fNum({ label: '全项完成额外奖励', value: p.allDone, path: 'versionall.checkin.points.allDone' }) +
            UI.fNum({ label: '批注互动奖励', value: p.comment, path: 'versionall.checkin.points.comment' }) +
            '</div>' }) +
          K.panel({ title: '上限与周期', body: '<div class="stack" style="gap:14px">' +
            UI.fNum({ label: '每日积分上限', value: p.dailyCap, path: 'versionall.checkin.points.dailyCap', hint: '防止刷分，超出部分不计入' }) +
            UI.fNum({ label: '每周全勤奖励', value: p.weeklyBonus, path: 'versionall.checkin.points.weeklyBonus' }) +
            '</div><div class="note">按当前规则，满勤学员 28 天最多可获得 <b class="tnum">' + (p.dailyCap * 28 + p.weeklyBonus * 4) + '</b> 积分。</div>' }) +
        '</div>';
    }
  };

  /* --------------------------------------------------------- 11 指标库 */
  P['v-metrics'] = {
    app: 'versionall', title: '健康指标库', sub: '结营报告按此计算前后对比与异常判定',
    preview: 'student-checkin',
    render() {
      const m = V().metrics;
      return K.head('健康指标库', '共 ' + m.length + ' 项 · 启用 ' + m.filter((x) => x.active).length + ' 项',
        K.btn('新增指标', 'newMetric', { icon: 'plus', cls: 'primary' })) +
        K.panel({ flush: true, body: UI.table([
          { label: '指标', render: (r) => '<b>' + E(r.name) + '</b>' },
          { label: '单位', render: (r) => '<span class="mut">' + E(r.unit) + '</span>' },
          { label: '参考区间', render: (r) => E(r.normalRange || '—') },
          { label: '分类', render: (r) => UI.pill(r.category, 'grey') },
          { label: '改善方向', render: (r) => UI.pill(r.direction === 'down' ? '下降为佳' : '上升为佳', r.direction === 'down' ? 'blue' : 'green') },
          { label: '启用', render: (r, i) => '<button class="switch ' + (r.active ? 'on' : '') + '" data-toggle="versionall.metrics.' + UI.ix(m, r) + '.active"></button>' },
          { label: '', align: 'right', render: (r) => '<div class="rowact"><button data-act="editMetric" data-id="' + r.id + '">' + I('edit', 14) + '</button></div>' }
        ], m.map((x) => Object.assign({ _id: x.id }, x))) });
    },
    actions: {
      newMetric() {
        UI.formDrawer({
          title: '新增健康指标', sub: '会在结营报告中参与前后对比', icon: 'activity', section: '指标定义',
          fields: [
            { key: 'name', label: '指标名称', ph: '如 腰臀比' },
            { key: 'unit', label: '单位', ph: '如 %' },
            { key: 'normalRange', label: '参考区间', ph: '如 男<0.9 女<0.85' },
            { key: 'category', label: '分类', type: 'select', options: ['身体测量', '五高指标', '血脂', '代谢'] },
            { key: 'direction', label: '改善方向', type: 'select', options: [{ v: 'down', l: '下降为佳' }, { v: 'up', l: '上升为佳' }] }
          ],
          onSave(v) {
            Store.pushItem('versionall.metrics', { id: 'm' + Date.now(), name: v.name || '新指标', unit: v.unit, normalRange: v.normalRange, category: v.category, direction: v.direction, active: true }, '新增指标');
            UI.toast('指标已创建'); App.refresh();
          }
        });
      },
      editMetric(d) {
        const r = V().metrics.find((x) => x.id === d.id), i = UI.ix(V().metrics, r);
        UI.drawer({ title: '编辑指标', sub: r.name, icon: 'activity',
          body: '<div class="formsec"><h4>定义</h4>' +
            UI.fInput({ label: '指标名称', value: r.name, path: 'versionall.metrics.' + i + '.name' }) +
            '<div class="frow">' + UI.fInput({ label: '单位', value: r.unit, path: 'versionall.metrics.' + i + '.unit' }) +
            UI.fInput({ label: '参考区间', value: r.normalRange, path: 'versionall.metrics.' + i + '.normalRange' }) + '</div>' +
            UI.fSelect({ label: '改善方向', value: r.direction, options: [{ v: 'down', l: '下降为佳' }, { v: 'up', l: '上升为佳' }], path: 'versionall.metrics.' + i + '.direction' }) +
            '</div>', onOk() { UI.toast('指标已保存'); App.refresh(); } });
      }
    }
  };

  /* --------------------------------------------------------- 12 活动开关 */
  P['v-activities'] = {
    app: 'versionall', title: '活动与入口', sub: '学员端首页的活动入口由这里控制',
    preview: 'student-reward',
    render() {
      const a = V().activity;
      return K.head('活动与入口', '开关关闭后学员端入口即时隐藏，已产生的记录保留',
        K.btn('保存并发布', 'publishAct', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '活动开关', body:
            [['checkinStreak', '连续打卡奖励', '首页「连续打卡」入口与奖励页'], ['weightMilestone', '阶梯达标奖', '按减重百分比解锁阶梯奖励'],
             ['weeklyChallenge', '每周主题挑战', '每周一个主题任务，完成得积分'], ['luckyDraw', '全勤幸运抽奖', '28 天全勤获得抽奖资格'],
             ['pointsMall', '积分商城', '学员可用积分兑换商品']].map((x) =>
              '<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line-2)">' +
              '<div style="flex:1"><div style="font-size:12.5px;font-weight:500">' + x[1] + '</div><div class="small mut" style="margin-top:2px">' + x[2] + '</div></div>' +
              '<button class="switch ' + (a[x[0]] ? 'on' : '') + '" data-toggle="versionall.activity.' + x[0] + '"></button></div>').join('') }) +
          K.panel({ title: '每周挑战', body: '<div class="stack" style="gap:14px">' +
            '<div class="frow">' + UI.fInput({ label: '开始日期', value: a.weeklyStart, path: 'versionall.activity.weeklyStart' }) +
            UI.fNum({ label: '总周数', value: a.weeklyWeeks, path: 'versionall.activity.weeklyWeeks' }) + '</div>' +
            '<div class="note">开始日期留空则使用营期开营日。当前共 ' + a.weeklyWeeks + ' 周，最后一周截止 ' + a.weeklyStart + ' 后 ' + (a.weeklyWeeks * 7) + ' 天。</div></div>' }) +
          '</div>' +
          K.panel({ title: '入口文案', sub: '学员端所见即所得', body: '<div class="stack" style="gap:14px">' +
            UI.fInput({ label: '入口标题', value: a.entranceTitle, path: 'versionall.activity.entranceTitle' }) +
            UI.fArea({ label: '入口说明', value: a.entranceDesc, rows: 2, path: 'versionall.activity.entranceDesc' }) +
            '</div><div class="hairline"></div><div class="note teal">右侧预览为学员端「连续打卡」页，修改文案后立即刷新。</div>' }) +
        '</div>';
    },
    actions: { publishAct() { App.openPublish('活动入口配置'); } }
  };

  /* --------------------------------------------------------- 13 奖励档位 */
  P['v-tiers'] = {
    app: 'versionall', title: '连续打卡奖励', sub: '按营期独立配置；下架不影响已解锁记录',
    preview: 'student-reward',
    render() {
      const list = V().tiers.filter((t) => t.campId === 'camp1').sort((a, b) => a.requiredDays - b.requiredDays);
      return K.head('连续打卡奖励', '共 ' + list.length + ' 档 · 学员达到天数即可解锁领取',
        K.btn('新增档位', 'newTier', { icon: 'plus', cls: 'primary' })) +
        '<div class="grid g-4">' + list.map((t) => {
          const i = UI.ix(V().tiers, t);
          return '<div class="panel" style="padding:16px">' +
            '<div class="row"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(150deg,#eaf2ff,#dbe9fb);display:grid;place-items:center;font-size:10px;color:#0b63e5;text-align:center">' + E(t.image) + '</div>' +
            '<div class="right"><button class="switch ' + (t.active ? 'on' : '') + '" data-toggle="versionall.tiers.' + i + '.active"></button></div></div>' +
            '<div style="margin-top:12px;font-size:13px;font-weight:600">' + E(t.name) + '</div>' +
            '<div class="small mut" style="margin-top:4px;height:32px">' + E(t.desc || '—') + '</div>' +
            '<div class="hairline" style="margin:10px 0"></div>' +
            '<div class="row small"><span class="mut">连续天数</span><b class="right tnum">' + t.requiredDays + ' 天</b></div>' +
            '<div class="row small" style="margin-top:6px"><span class="mut">剩余库存</span><b class="right tnum" style="color:' + (t.stock < 10 ? '#b83c2c' : 'inherit') + '">' + t.stock + ' 件</b></div>' +
            '<div class="row" style="gap:6px;margin-top:10px"><button class="btn sm" style="flex:1" data-act="editTier" data-id="' + t.id + '">编辑</button>' +
            '<button class="btn sm danger" data-act="delTier" data-id="' + t.id + '">' + I('trash', 14) + '</button></div></div>';
        }).join('') + '</div>' +
        '<div style="height:16px"></div>' +
        K.panel({ title: '变更影响提示', body: '<div class="note warn">编辑奖励名称或所需天数会生成新版本快照；已领取的学员仍按下单时的快照展示，不会追溯变更。下架后学员端不再展示，但已解锁未领取的记录仍然有效。</div>' });
    },
    actions: {
      newTier() {
        UI.drawer({ title: '新增奖励档位', sub: '当前营期：第七期', icon: 'gift',
          body: '<div class="formsec"><h4>档位</h4>' +
            UI.fInput({ label: '奖励名称', value: '', ph: '如 坚持 30 天 · 运动背包' }) +
            UI.fNum({ label: '所需连续天数', value: 30 }) +
            UI.fNum({ label: '库存', value: 20 }) +
            UI.fInput({ label: '展示图文字', value: '', ph: '图片占位文字' }) +
            UI.fArea({ label: '说明', value: '', rows: 2 }) +
            '</div><div class="formsec"><h4>领取方式</h4>' +
            '<div class="chips"><span class="chip on">邮寄</span><span class="chip">线下领取</span></div></div>',
          onOk() { UI.toast('档位已创建，待发布'); App.refresh(); } });
      },
      editTier(d) {
        const t = V().tiers.find((x) => x.id === d.id), i = UI.ix(V().tiers, t);
        UI.drawer({ title: '编辑奖励', sub: t.name, icon: 'gift',
          body: '<div class="formsec"><h4>档位设置</h4>' +
            UI.fInput({ label: '奖励名称', value: t.name, path: 'versionall.tiers.' + i + '.name' }) +
            '<div class="frow">' + UI.fNum({ label: '所需天数', value: t.requiredDays, path: 'versionall.tiers.' + i + '.requiredDays' }) +
            UI.fNum({ label: '库存', value: t.stock, path: 'versionall.tiers.' + i + '.stock' }) + '</div>' +
            UI.fArea({ label: '说明', value: t.desc, path: 'versionall.tiers.' + i + '.desc', rows: 2 }) +
            '</div><div class="formsec"><h4>领取方式</h4><div class="chips">' +
            ['shipped', 'in-person'].map((v) => '<span class="chip ' + (t.delivery.indexOf(v) >= 0 ? 'on' : '') + '">' + (v === 'shipped' ? '邮寄' : '线下领取') + '</span>').join('') + '</div></div>' +
            '<div class="note">当前已解锁 ' + (t.requiredDays <= 18 ? 6 : 0) + ' 人，已领取 ' + (t.requiredDays <= 14 ? 3 : 0) + ' 人。</div>',
          onOk() { UI.toast('奖励已更新'); App.refresh(); } });
      },
      delTier(d) {
        const t = V().tiers.find((x) => x.id === d.id);
        UI.confirm({ title: '删除「' + t.name + '」？', desc: '已解锁该档位的 6 名学员仍可在学员端领取，删除只影响后续展示。', danger: true, okText: '删除' })
          .then((ok) => { if (!ok) return; Store.removeItem('versionall.tiers', t.id, 'id', '删除奖励'); UI.toast('已删除'); App.refresh(); });
      }
    }
  };

  /* --------------------------------------------------------- 14 积分商城 */
  P['v-products'] = {
    app: 'versionall', title: '积分商城', sub: '商品与库存；下单时锁定商品快照',
    preview: 'student-points',
    render() {
      const list = V().products.filter((p) => p.campId === 'camp1');
      return K.head('积分商城', list.length + ' 个商品 · 上架 ' + list.filter((p) => p.active).length + ' 个',
        K.btn('新增商品', 'newProduct', { icon: 'plus', cls: 'primary' })) +
        K.panel({ flush: true, body: UI.table([
          { label: '商品', render: (p) => '<div class="cellflex"><div style="width:30px;height:30px;border-radius:8px;background:#f2f6fb;display:grid;place-items:center;font-size:9px;color:#7d8a9e">' + E(p.image) + '</div><div><div class="strong">' + E(p.name) + '</div><div class="small muted">' + E(p.desc || '') + '</div></div></div>' },
          { label: '积分', align: 'right', render: (p) => '<b class="tnum">' + p.points + '</b>' },
          { label: '库存', align: 'right', render: (p) => '<span class="tnum" style="color:' + (p.stock === 0 ? '#b83c2c' : 'inherit') + '">' + p.stock + '</span>' },
          { label: '限兑', render: (p) => p.max ? p.max + ' 次/人' : '<span class="mut">不限</span>' },
          { label: '配送', render: (p) => p.delivery.map((d) => UI.pill(d === 'shipped' ? '邮寄' : '线下', 'grey')).join(' ') },
          { label: '状态', render: (p) => p.active ? UI.pill('已上架', 'green') : UI.pill('已下架', 'grey') },
          { label: '', align: 'right', render: (p) => '<div class="rowact"><button data-act="editProduct" data-id="' + p.id + '">' + I('edit', 14) + '</button></div>' }
        ], list.map((x) => Object.assign({ _id: x.id }, x))) });
    },
    actions: {
      newProduct() {
        UI.formDrawer({
          title: '新增积分商品', sub: '上架后学员可在积分商城兑换', icon: 'package', section: '商品信息',
          fields: [
            { key: 'name', label: '商品名称', ph: '如 运动水杯 600ml' },
            { key: 'desc', label: '描述', type: 'area', rows: 2 },
            { key: 'points', label: '所需积分', type: 'num', value: 100 },
            { key: 'stock', label: '库存', type: 'num', value: 20 },
            { key: 'max', label: '每人限兑（0=不限）', type: 'num', value: 1 },
            { key: 'active', label: '立即上架', type: 'bool', value: true }
          ],
          onSave(v) {
            Store.pushItem('versionall.products', { id: 'p' + Date.now(), campId: 'camp1', name: v.name || '新商品', points: v.points, stock: v.stock, max: v.max, active: v.active, delivery: ['shipped'], sort: 0, image: '礼品', desc: v.desc }, '新增商品');
            UI.toast('商品已创建'); App.refresh();
          }
        });
      },
      editProduct(d) {
        const p = V().products.find((x) => x.id === d.id), i = UI.ix(V().products, p);
        UI.drawer({ title: '编辑商品', sub: p.name, icon: 'package',
          body: '<div class="formsec"><h4>商品信息</h4>' +
            UI.fInput({ label: '名称', value: p.name, path: 'versionall.products.' + i + '.name' }) +
            UI.fArea({ label: '描述', value: p.desc, path: 'versionall.products.' + i + '.desc', rows: 2 }) +
            '<div class="frow">' + UI.fNum({ label: '所需积分', value: p.points, path: 'versionall.products.' + i + '.points' }) +
            UI.fNum({ label: '库存', value: p.stock, path: 'versionall.products.' + i + '.stock' }) + '</div>' +
            UI.fNum({ label: '每人限兑', value: p.max, path: 'versionall.products.' + i + '.max', hint: '0 表示不限次数' }) +
            '</div><div class="formsec"><h4>配送与状态</h4>' +
            '<div class="chips"><span class="chip ' + (p.delivery.indexOf('shipped') >= 0 ? 'on' : '') + '">邮寄</span><span class="chip ' + (p.delivery.indexOf('in-person') >= 0 ? 'on' : '') + '">线下领取</span></div>' +
            UI.fSwitch({ label: '上架销售', value: p.active, path: 'versionall.products.' + i + '.active' }) +
            '</div><div class="note">编辑不会影响历史订单，订单按下单时的商品快照结算。</div>',
          onOk() { UI.toast('商品已保存'); App.refresh(); } });
      }
    }
  };

  /* --------------------------------------------------------- 15 徽章 */
  P['v-badges'] = {
    app: 'versionall', title: '徽章体系', sub: '里程碑 / 成就 / 活动三类，条件由运营配置',
    preview: 'student-home',
    render() {
      const list = V().badges;
      const groups = [['milestone', '里程碑'], ['achievement', '成就'], ['activity', '活动']];
      return K.head('徽章体系', '共 ' + list.length + ' 枚 · 启用 ' + list.filter((b) => b.on).length + ' 枚',
        K.btn('新增徽章', 'newBadge', { icon: 'plus', cls: 'primary' })) +
        groups.map((g) => {
          const items = list.filter((b) => b.cat === g[0]);
          return '<div style="margin-bottom:20px"><div class="row" style="margin-bottom:10px"><h3 style="font-size:13px;font-weight:600">' + g[1] + '</h3><span class="small mut">' + items.length + ' 枚</span></div>' +
            '<div class="grid g-4">' + items.map((b) => {
              const i = UI.ix(list, b);
              return '<div class="panel" style="padding:14px;' + (b.on ? '' : 'opacity:.6') + '">' +
                '<div class="row"><div style="font-size:20px">' + b.icon + '</div><button class="switch right ' + (b.on ? 'on' : '') + '" data-toggle="versionall.badges.' + i + '.on" style="transform:scale(.85)"></button></div>' +
                '<div style="font-size:12.5px;font-weight:600;margin-top:8px">' + E(b.name) + '</div>' +
                '<div class="small mut" style="margin-top:3px">' + E(condText(b)) + '</div></div>';
            }).join('') + '</div></div>';
        }).join('');
    },
    actions: {
      newBadge() {
        UI.formDrawer({
          title: '新增徽章', sub: '条件达成后自动发放', icon: 'medal', section: '徽章定义',
          fields: [
            { key: 'name', label: '徽章名称', ph: '如 减重 8% 里程碑' },
            { key: 'cat', label: '分类', type: 'select', options: [{ v: 'milestone', l: '里程碑' }, { v: 'achievement', l: '成就' }, { v: 'activity', l: '活动' }] },
            { key: 'cond', label: '达成条件', type: 'select', options: [{ v: 'weight_loss_percent', l: '体重下降 %' }, { v: 'streak_days', l: '连续全项打卡 天' }, { v: 'checkin_days', l: '有打卡 天' }, { v: 'all_items', l: '全项完成 天' }] },
            { key: 'threshold', label: '阈值', type: 'num', value: 3 },
            { key: 'icon', label: '图标（emoji）', value: '🏅' }
          ],
          onSave(v) {
            Store.pushItem('versionall.badges', { id: 'b' + Date.now(), campId: 'camp1', name: v.name || '新徽章', cat: v.cat, cond: v.cond, threshold: v.threshold, icon: v.icon || '🏅', on: true, cadence: 'day' }, '新增徽章');
            UI.toast('徽章已创建'); App.refresh();
          }
        });
      }
    }
  };

  function condText(b) {
    const m = { weight_loss_percent: '体重下降 %', streak_days: '连续全项打卡 天', fat_loss_kg: '脂肪量下降 kg', early_exercise_count: '早 9 点前运动 次', single_exercise_minutes: '单次运动 分钟', checkin_days: '有打卡 天', all_items: '全项完成 天' };
    const scope = b.cat === 'activity' ? (b.cadence === 'week' ? '每自然周' : b.cadence === 'month' ? '每自然月' : '每天') + '：' : '';
    return scope + (m[b.cond] || b.cond) .replace(' ', ' ≥ ' + b.threshold + ' ');
  }

  /* --------------------------------------------------------- 16 领奖订单 */
  P['v-claims'] = {
    app: 'versionall', title: '领奖订单', sub: '连续打卡奖励的领取、发货与线下核销',
    preview: 'student-reward',
    render() {
      const list = V().claims;
      return K.head('领奖订单', '共 ' + list.length + ' 单 · 待发货 ' + list.filter((c) => c.status === 'pending').length,
        K.btn('批量发货', 'batchShip', { icon: 'truck', cls: 'primary' })) +
        K.kpis([
          { k: '待发货', v: list.filter((c) => c.status === 'pending').length, unit: '单', d: '其中超 48h 1 单', tone: 'down' },
          { k: '已发货', v: list.filter((c) => c.status === 'shipped').length, unit: '单', d: '平均 1.2 天发出' },
          { k: '线下发放', v: list.filter((c) => c.status === 'in-person').length, unit: '单', d: '' },
          { k: '待学员领取', v: list.filter((c) => c.status === 'confirmed').length, unit: '单', d: '已审核通过' }
        ]) +
        K.panel({ flush: true, body: UI.table([
          { label: '学员', render: (c) => '<div class="cellflex">' + UI.avatar(c.studentName) + '<div><div class="strong">' + E(c.studentName) + '</div><div class="small muted">' + E(c.phone) + '</div></div></div>' },
          { label: '奖励', render: (c) => E(c.tierName) },
          { label: '收货信息', render: (c) => '<span class="small">' + E(c.recipient) + ' · ' + E(c.address).slice(0, 16) + '…</span>' },
          { label: '领取时间', render: (c) => '<span class="small tnum muted">' + E(c.claimDate) + '</span>' },
          { label: '状态', render: (c) => UI.statusPill(c.status) },
          { label: '物流', render: (c) => c.tracking ? '<span class="tnum small">' + E(c.tracking) + '</span>' : '<span class="muted">—</span>' },
          { label: '', align: 'right', render: (c) => '<div class="rowact"><button data-act="shipClaim" data-id="' + c.id + '">' + I('truck', 14) + '</button></div>' }
        ], list.map((c) => Object.assign({ _id: c.id, _act: 'shipClaim' }, c))) });
    },
    actions: {
      shipClaim(d) {
        const c = V().claims.find((x) => x.id === d.id);
        UI.drawer({ title: '发货 · ' + c.tierName, sub: c.studentName + ' · ' + c.phone, icon: 'truck',
          body: '<div class="formsec"><h4>收货信息</h4>' +
            UI.fInput({ label: '收货人', value: c.recipient }) + UI.fInput({ label: '电话', value: c.phone }) +
            UI.fArea({ label: '地址', value: c.address, rows: 2 }) + '</div>' +
            '<div class="formsec"><h4>物流</h4>' + UI.fSelect({ label: '快递公司', value: 'SF', options: [{ v: 'SF', l: '顺丰速运' }, { v: 'JD', l: '京东物流' }, { v: 'YT', l: '圆通速递' }] }) +
            UI.fInput({ label: '快递单号', value: '', ph: '扫码或手动输入' }) + '</div>' +
            '<div class="note">发货后学员端状态变为「已发货」，不可再修改收货地址。</div>',
          okText: '确认发货', extra: '<button class="btn" data-print>打印面单</button>',
          mount(n) { n.querySelector('[data-print]').addEventListener('click', () => UI.toast('面单已发送至打印机')); },
          onOk() {
            const i = UI.ix(V().claims, c);
            Store.saveItem('versionall.claims', { id: c.id, status: 'shipped', tracking: 'SF' + Date.now().toString().slice(-10), shipDate: '2026-11-06 10:00' }, 'id', '领奖发货');
            UI.toast('已发货'); App.refresh();
          } });
      },
      batchShip() {
        const pend = V().claims.filter((c) => c.status === 'pending');
        if (!pend.length) { UI.toast('没有待发货订单'); return; }
        UI.confirm({ title: '批量发货 ' + pend.length + ' 单？', desc: '将按各单收货地址生成物流单号，发货后不可再改地址。', okText: '确认发货' })
          .then((ok) => {
            if (!ok) return;
            pend.forEach((c) => { c.status = 'shipped'; c.tracking = 'SF' + (Date.now() + Math.floor(Math.random() * 999)).toString().slice(-10); });
            Store.mark('versionall.claims', '批量发货');
            Store.persist(); UI.toast('已发货 ' + pend.length + ' 单'); App.refresh();
          });
      }
    }
  };

  /* --------------------------------------------------------- 17 兑换订单 */
  P['v-exchanges'] = {
    app: 'versionall', title: '兑换订单', sub: '积分商城的全量台账，含操作审计',
    preview: 'student-points',
    render() {
      const list = V().exchanges;
      return K.head('兑换订单', '共 ' + list.length + ' 单 · 消耗积分 ' + list.filter((e) => e.status !== 'cancelled').reduce((a, b) => a + b.points, 0),
        K.btn('导出订单', 'exportEx', { icon: 'download' })) +
        K.panel({ flush: true, body: UI.table([
          { label: '订单号', render: (e) => '<span class="tnum small strong">' + E(e.id) + '</span>' },
          { label: '学员', render: (e) => E(e.studentName) },
          { label: '商品', render: (e) => E(e.productName) },
          { label: '积分', align: 'right', render: (e) => '<span class="tnum">-' + e.points + '</span>' },
          { label: '兑换时间', render: (e) => '<span class="small tnum muted">' + E(e.date) + '</span>' },
          { label: '状态', render: (e) => UI.statusPill(e.status) },
          { label: '', align: 'right', render: (e) => '<div class="rowact"><button data-act="viewEx" data-id="' + e.id + '">' + I('eye', 14) + '</button></div>' }
        ], list.map((e) => Object.assign({ _id: e.id, _act: 'viewEx' }, e))) });
    },
    actions: {
      exportEx() { UI.toast('兑换台账已导出'); },
      viewEx(d) {
        const e = V().exchanges.find((x) => x.id === d.id);
        UI.drawer({ title: '兑换详情', sub: e.id, icon: 'package',
          body: '<dl class="kv"><dt>学员</dt><dd>' + E(e.studentName) + '</dd><dt>商品</dt><dd>' + E(e.productName) + '</dd>' +
            '<dt>消耗积分</dt><dd>' + e.points + '</dd><dt>配送方式</dt><dd>' + (e.method === 'shipped' ? '邮寄' : '线下领取') + '</dd>' +
            '<dt>收货地址</dt><dd>' + E(e.address) + '</dd><dt>物流单号</dt><dd>' + E(e.tracking || '—') + '</dd></dl>' +
            '<div class="hairline"></div><h4 style="font-size:12px;color:var(--ink-3);margin-bottom:8px">操作审计</h4>' +
            '<div class="small mut" style="line-height:1.9">' + (e.audit || []).map((a) => '· ' + a.opName + ' 于 ' + a.time + ' 创建订单').join('<br>') + '</div>' +
            '<div class="note" style="margin-top:14px">已发货订单不可取消；未发货订单取消后积分原路退回。</div>',
          footer: e.status === 'pending' ? undefined : false,
          extra: e.status === 'pending' ? '<button class="btn danger" data-cancel>取消并退积分</button>' : '',
          mount(n) { const b = n.querySelector('[data-cancel]'); if (b) b.addEventListener('click', () => { const i = UI.ix(V().exchanges, e); Store.saveItem('versionall.exchanges', { id: e.id, status: 'cancelled' }, 'id', '取消兑换'); UI.closeOverlay(); UI.toast('已取消，积分已退回'); App.refresh(); }); },
          onOk() {
            const i = UI.ix(V().exchanges, e);
            Store.saveItem('versionall.exchanges', { id: e.id, status: 'fulfilled', tracking: 'JD' + Date.now().toString().slice(-10) }, 'id', '兑换发货');
            UI.toast('已发货'); App.refresh();
          }, okText: e.status === 'pending' ? '确认发货' : '关闭'
        });
      }
    }
  };

  /* --------------------------------------------------------- 18 履约中心 */
  P['v-fulfill'] = {
    app: 'versionall', title: '履约中心', sub: '领奖与兑换的统一发货工作台',
    preview: 'student-reward',
    render() {
      const v = V();
      const a = v.claims.filter((c) => c.status === 'pending');
      const b = v.exchanges.filter((e) => e.status === 'pending');
      return K.head('履约中心', '待处理 ' + (a.length + b.length) + ' 单 · 建议 48h 内发出',
        K.btn('全部导出', 'exportAll', { icon: 'download' })) +
        K.kpis([
          { k: '待发货合计', v: a.length + b.length, unit: '单', d: '领奖 ' + a.length + ' · 兑换 ' + b.length, tone: 'down' },
          { k: '今日已发', v: 4, unit: '单', d: '平均处理 1.1 天', tone: 'up' },
          { k: '待线下核销', v: v.claims.filter((c) => c.method === 'in-person' && c.status === 'pending').length, unit: '单', d: '到院领取' }
        ]) +
        '<div class="grid g-2">' +
          K.panel({ title: '待发货 · 领奖', sub: a.length + ' 单', flush: true, body:
            '<div style="padding:4px 18px 12px">' + (a.length ? a.map((c) => '<div class="listrow">' + UI.avatar(c.studentName) +
              '<div class="meta"><b>' + E(c.studentName) + ' · ' + E(c.tierName) + '</b><span>' + E(c.address).slice(0, 22) + '…</span></div>' +
              '<button class="btn sm right" data-act="shipClaim" data-id="' + c.id + '">发货</button></div>').join('') : K.empty('没有待发货的领奖单', '')) + '</div>' }) +
          K.panel({ title: '待发货 · 兑换', sub: b.length + ' 单', flush: true, body:
            '<div style="padding:4px 18px 12px">' + (b.length ? b.map((e) => '<div class="listrow">' + UI.avatar(e.studentName, 'g') +
              '<div class="meta"><b>' + E(e.studentName) + ' · ' + E(e.productName) + '</b><span>' + e.points + ' 积分 · ' + E(e.date) + '</span></div>' +
              '<button class="btn sm right" data-act="viewEx" data-id="' + e.id + '">处理</button></div>').join('') : K.empty('没有待发货的兑换单', '')) + '</div>' })
        + '</div>';
    },
    actions: {
      exportAll() { UI.toast('履约台账已导出'); },
      shipClaim(d) { P['v-claims'].actions.shipClaim(d); },
      viewEx(d) { P['v-exchanges'].actions.viewEx(d); }
    }
  };

  /* --------------------------------------------------------- 19 内容 · 教练活动 */
  P['v-content'] = {
    app: 'versionall', title: '活动与课程内容', sub: '教练发布的视频/图文内容，学员端按营期可见',
    preview: 'student-home',
    render() {
      const list = V().coachActivities;
      return K.head('活动与课程内容', '共 ' + list.length + ' 条 · 已发布 ' + list.filter((c) => c.status === 'published').length,
        K.btn('发布内容', 'newContent', { icon: 'plus', cls: 'primary' })) +
        '<div class="grid g-3">' + list.map((c) => {
          const i = UI.ix(list, c);
          return '<div class="panel" style="padding:0;overflow:hidden">' +
            '<div style="height:96px;background:linear-gradient(135deg,#0d2a4d,#123f6f);position:relative;display:grid;place-items:center;color:rgba(255,255,255,.6)">' + I(c.video ? 'video' : 'image', 24) +
            '<div style="position:absolute;top:10px;right:10px">' + UI.statusPill(c.status) + '</div></div>' +
            '<div style="padding:12px 14px"><div style="font-size:12.5px;font-weight:600">' + E(c.title) + '</div>' +
            '<div class="small mut" style="margin-top:4px;height:36px">' + E(c.desc) + '</div>' +
            '<div class="row small mut" style="margin-top:8px"><span>' + E(c.coach) + '</span><span>·</span><span>' + E(c.date.slice(0, 10)) + '</span>' +
            '<span class="right">' + c.views + ' 次浏览</span></div>' +
            '<div class="row" style="gap:6px;margin-top:10px"><button class="btn sm" style="flex:1" data-act="editContent" data-id="' + c.id + '">编辑</button>' +
            '<button class="switch ' + (c.status === 'published' ? 'on' : '') + '" data-act="toggleContent" data-id="' + c.id + '"></button></div></div></div>';
        }).join('') + '</div>';
    },
    actions: {
      newContent() {
        UI.drawer({ title: '发布内容', sub: '学员端首页「教练带练」可见', icon: 'upload',
          body: '<div class="formsec"><h4>内容</h4>' + UI.fInput({ label: '标题', value: '' }) +
            UI.fArea({ label: '说明', value: '', rows: 3 }) +
            UI.fSelect({ label: '所属营期', value: 'camp1', options: V().camps.map((c) => ({ v: c.id, l: c.name })) }) +
            UI.fInput({ label: '教练', value: '刘洋' }) +
            '</div><div class="formsec"><h4>素材</h4><div class="note">支持视频（≤200MB）或 3 张以内图片，上传后自动压缩。</div>' +
            '<button class="btn" style="width:100%;height:56px;border-style:dashed">' + I('upload', 16) + '上传视频 / 图片</button></div>',
          onOk() { UI.toast('内容已发布'); } });
      },
      editContent(d) {
        const c = V().coachActivities.find((x) => x.id === d.id);
        UI.drawer({
          title: '编辑内容', sub: c.title, icon: 'video',
          body: '<div class="formsec"><h4>内容</h4>' +
            UI.fInput({ label: '标题', value: c.title, path: 'versionall.coachActivities.' + V().coachActivities.indexOf(c) + '.title' }) +
            UI.fArea({ label: '说明', value: c.desc, rows: 3, path: 'versionall.coachActivities.' + V().coachActivities.indexOf(c) + '.desc' }) +
            UI.fInput({ label: '教练', value: c.coach, path: 'versionall.coachActivities.' + V().coachActivities.indexOf(c) + '.coach' }) +
            '</div>' + UI.impact(['学员端 · 教练带练']),
          onOk() { UI.toast('内容已保存'); App.refresh(); }
        });
      },
      toggleContent(d) {
        const c = V().coachActivities.find((x) => x.id === d.id);
        Store.set('versionall.coachActivities.' + V().coachActivities.indexOf(c) + '.status', c.status === 'published' ? 'draft' : 'published', '内容上下架');
        UI.toast(c.status === 'published' ? '已下架' : '已发布'); App.refresh();
      }
    }
  };

  /* --------------------------------------------------------- 20 消息公告 */
  P['v-messages'] = {
    app: 'versionall', title: '消息与公告', sub: '公告推送、未打卡提醒与阅读率',
    preview: 'student-home',
    render() {
      const list = V().messages;
      return K.head('消息与公告', '已发送 ' + list.filter((m) => m.status === 'sent').length + ' 条 · 草稿 ' + list.filter((m) => m.status === 'draft').length,
        K.btn('新建公告', 'newMsg', { icon: 'plus', cls: 'primary' })) +
        K.panel({ flush: true, body: UI.table([
          { label: '类型', render: (m) => UI.pill(m.type, m.type === '公告' ? 'blue' : 'amber') },
          { label: '标题', render: (m) => '<div class="strong">' + E(m.title) + '</div><div class="small muted">' + E(m.body).slice(0, 34) + '…</div>' },
          { label: '对象', render: (m) => E(m.target === 'all' ? '全营' : m.target === 'inactive3' ? '3 天未打卡' : CAMP(m.campId)) },
          { label: '发送时间', render: (m) => '<span class="small tnum muted">' + E(m.sentAt || '未发送') + '</span>' },
          { label: '阅读率', w: '120px', render: (m) => m.status === 'sent' ? '<div class="row" style="gap:8px"><div style="flex:1">' + K.progress(m.readRate) + '</div><span class="small tnum">' + m.readRate + '%</span></div>' : '<span class="muted">—</span>' },
          { label: '状态', render: (m) => UI.statusPill(m.status === 'sent' ? 'published' : 'draft') },
          { label: '', align: 'right', render: (m) => '<div class="rowact"><button data-act="editMsg" data-id="' + m.id + '">' + I('edit', 14) + '</button></div>' }
        ], list.map((m) => Object.assign({ _id: m.id }, m))) });
    },
    actions: {
      newMsg() {
        UI.formDrawer({
          title: '新建公告', sub: '发布后进入学员端消息中心', icon: 'bell', section: '内容',
          fields: [
            { key: 'title', label: '标题', ph: '如 第 4 周体测安排' },
            { key: 'body', label: '正文', type: 'area', rows: 4 },
            { key: 'type', label: '类型', type: 'select', options: ['公告', '提醒'] },
            { key: 'target', label: '推送对象', type: 'select', options: [{ v: 'all', l: '全营学员' }, { v: 'inactive3', l: '3 天未打卡学员' }] },
            { key: 'send', label: '立即发送', type: 'bool', value: false }
          ],
          onSave(v) {
            Store.pushItem('versionall.messages', { id: 'msg' + Date.now(), campId: 'camp1', type: v.type, title: v.title || '未命名公告', body: v.body, target: v.target, sentAt: v.send ? '2026-11-06 10:00' : '', readRate: 0, status: v.send ? 'sent' : 'draft' }, '新建公告');
            UI.toast(v.send ? '公告已发送' : '已保存为草稿'); App.refresh();
          }
        });
      },
      editMsg(d) {
        const m = V().messages.find((x) => x.id === d.id);
        UI.drawer({ title: '编辑公告', sub: m.title, icon: 'message',
          body: '<div class="formsec"><h4>内容</h4>' + UI.fInput({ label: '标题', value: m.title }) +
            UI.fArea({ label: '正文', value: m.body, rows: 4 }) +
            UI.fSelect({ label: '推送对象', value: m.target, options: [{ v: 'all', l: '全营学员' }, { v: 'inactive3', l: '3 天未打卡学员' }, { v: 'camp2', l: '第八期学员' }] }) +
            '</div><div class="note">公告会同时出现在学员端消息中心与首页横幅（可关闭）。</div>',
          okText: '保存草稿', extra: '<button class="btn primary" data-send>立即发送</button>',
          mount(n) { n.querySelector('[data-send]').addEventListener('click', () => { UI.closeOverlay(); UI.toast('已发送至 48 名学员'); }); },
          onOk() { UI.toast('已保存草稿'); } });
      }
    }
  };

  /* --------------------------------------------------------- 21 营期统计 */
  P['v-stats'] = {
    app: 'versionall', title: '营期统计', sub: '完成率、依从性与健康指标改善',
    preview: 'student-home',
    render() {
      const v = V();
      return K.head('营期统计', '第 7 期 · 数据截至 2026-11-06 09:00',
        K.seg([{ id: 'camp1', label: '第七期' }, { id: 'camp3', label: '第六期' }], 'camp1', 'statCamp') +
        K.btn('导出统计', 'exportStats', { icon: 'download' })) +
        K.kpis([
          { k: '平均减重', v: '3.6', unit: 'kg', d: '较上期 <b>+0.4kg</b>', tone: 'up' },
          { k: '平均减重率', v: '4.8', unit: '%', d: '目标 5%' },
          { k: '全项完成率', v: '62', unit: '%', d: '较上周 +5pt', tone: 'up' },
          { k: '异常转正常', v: 11, unit: '人', d: '血压 6 · 血糖 3 · 血脂 2' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '每周平均体重', sub: '按自然周聚合', body: UI.lineChart([{ data: [74.2, 73.4, 72.6, 71.9], color: '#0b63e5' }], { height: 170, dots: true, min: 70, max: 76, labels: ['W1', 'W2', 'W3', 'W4'] }) }) +
          K.panel({ title: '依从性分布', body: '<div class="stack" style="gap:12px">' +
            [['每日全项完成', 62, '#0b63e5'], ['仅饮食完成', 21, '#0aa39a'], ['仅运动完成', 9, '#c8871a'], ['连续 3 天未打卡', 8, '#d9503f']].map((x) =>
              '<div><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%;background:' + x[2] + '"></b></div></div>').join('') + '</div>' }) +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '个体明细', sub: '按减重降序', flush: true, body: UI.table([
          { label: '学员', render: (s) => '<div class="cellflex">' + UI.avatar(s.name) + '<span class="strong">' + E(s.name) + '</span></div>' },
          { label: '基线', align: 'right', render: (s) => '<span class="tnum">' + fmt(s.startWeight, 1) + '</span>' },
          { label: '当前', align: 'right', render: (s) => '<span class="tnum">' + fmt(s.weight, 1) + '</span>' },
          { label: '减重', align: 'right', render: (s) => '<b class="tnum" style="color:#087e76">-' + fmt(s.startWeight - s.weight, 1) + '</b>' },
          { label: '完成度', align: 'right', render: (s) => '<span class="tnum">' + s.completion + '%</span>' },
          { label: '连续打卡', align: 'right', render: (s) => '<span class="tnum">' + s.streak + ' 天</span>' }
        ], v.students.slice(0, 12).map((s) => Object.assign({ _id: s.id }, s))) });
    },
    actions: { statCamp() { UI.toast('已切换营期'); }, exportStats() { UI.toast('统计已导出'); } }
  };

  /* --------------------------------------------------------- 22 结营报告 */
  P['v-report'] = {
    app: 'versionall', title: '结营报告', sub: '指标前后对比、打卡统计与寄语',
    preview: 'student-home',
    render() {
      const v = V(), s = v.students[0];
      const metrics = [
        ['体重', 'kg', '78.2', '74.6', true, true], ['体脂率', '%', '31.4', '28.2', true, true],
        ['腰围', 'cm', '92', '86', true, true], ['收缩压', 'mmHg', '142', '128', false, true],
        ['空腹血糖', 'mmol/L', '6.4', '5.8', false, true], ['尿酸', 'μmol/L', '468', '402', false, false]
      ];
      return K.head('结营报告', '学员 ' + s.name + ' · 生成于 2026-11-05',
        K.btn('预览学员报告', 'previewReport', { icon: 'eye' }) + K.btn('批量生成', 'genAll', { icon: 'send', cls: 'primary' })) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '指标前后对比', sub: '异常项自动标注', flush: true, body: UI.table([
            { label: '指标', render: (r) => '<b>' + r[0] + '</b>' },
            { label: '开营', align: 'right', render: (r) => '<span class="tnum">' + r[2] + '</span> ' + r[1] },
            { label: '结营', align: 'right', render: (r) => '<span class="tnum strong">' + r[3] + '</span> ' + r[1] },
            { label: '变化', align: 'right', render: (r) => '<span class="tnum" style="color:#087e76">' + (Number(r[3]) - Number(r[2])).toFixed(1) + '</span>' },
            { label: '开营异常', render: (r) => r[4] ? UI.pill('异常', 'red') : UI.pill('正常', 'green') },
            { label: '结营', render: (r) => r[5] ? UI.pill('已转正常', 'green') : UI.pill('仍异常', 'amber') }
          ], metrics.map((m) => ({ _id: m[0], 0: m[0], 1: m[1], 2: m[2], 3: m[3], 4: m[4], 5: m[5] }))) }) +
          K.panel({ title: '打卡统计', body: '<div class="stack" style="gap:14px">' +
            [['训练营天数', '28 天'], ['全项完成', '21 天'], ['完成率', '75%'], ['最长连续', '14 天'], ['运动总时长', '1,240 分钟'], ['饮食总得分', '168 分']].map((x) =>
              '<div class="row" style="justify-content:space-between;font-size:12.5px"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '</b></div>').join('') +
            '</div>' }) +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '结营寄语', sub: '多名营养师/教练各自撰写，逐条展示', flush: true,
          body: '<div style="padding:4px 18px 14px">' +
            '<div class="listrow"><div class="ava g">王</div><div class="meta"><b>王雪 · 营养师</b><span>2026-11-02 10:20</span></div><span class="right small mut">可编辑</span></div>' +
            '<div class="small" style="padding:8px 0 14px;line-height:1.7">坚持下来很不容易，你的自律大家都看在眼里。这段时间养成的饮食和运动习惯是最好的收获，继续保持。</div>' +
            '<div class="listrow"><div class="ava v">陈</div><div class="meta"><b>陈放 · 教练</b><span>2026-11-03 18:05</span></div><span class="right small mut">只读</span></div>' +
            '<div class="small" style="padding:8px 0 4px;line-height:1.7">结营后先保持每周 3 次运动，别急着上强度，膝盖的反馈比计划更重要。</div>' +
            '<div style="margin-top:12px"><button class="btn" data-act="addMsg">' + I('plus', 14) + '撰写寄语</button></div></div>' });
    },
    actions: {
      previewReport() {
        UI.modal({
          title: '结营报告预览', desc: '林悦 · 第 7 期 · 2026-11-05',
          body: '<div style="padding:4px 0 10px"><div style="font-size:15px;font-weight:600">28 天，你减掉了 3.6 kg</div>' +
            '<div class="small mut" style="margin-top:4px">体脂率 31.4% → 28.2%，血压与血糖均回到正常区间。</div>' +
            '<div class="hairline"></div><dl class="kv"><dt>打卡完成率</dt><dd>75%（21 / 28 天）</dd><dt>最长连续</dt><dd>14 天</dd>' +
            '<dt>运动总时长</dt><dd>1,240 分钟</dd><dt>获得徽章</dt><dd>🏆 连续 7 天 · 🔥 燃脂勇士</dd></dl></div>',
          okText: '知道了', cancelText: false
        });
      },
      genAll() { UI.toast('已为 48 名学员生成报告'); },
      addMsg() {
        UI.drawer({
          title: '撰写结营寄语', sub: '提交后逐条展示，不覆盖他人', icon: 'edit',
          body: '<div class="formsec"><h4>内容</h4>' + UI.fArea({ label: '寄语', value: '', rows: 5, ph: '写给学员的一段话，建议 60–120 字' }) +
            UI.fSelect({ label: '署名', value: '王雪 · 营养师', options: ['王雪 · 营养师', '张楠 · 营养师', '陈放 · 教练'] }) + '</div>' +
            UI.impact(['学员端 · 结营报告']),
          onOk() { UI.toast('寄语已提交'); }
        });
      }
    }
  };

  /* --------------------------------------------------------- 23 企业报告 */
  P['v-enterprise'] = {
    app: 'versionall', title: '企业健康报告', sub: '面向 HR 的脱敏汇总视图',
    preview: 'student-home',
    render() {
      return K.head('企业健康报告', '示例科技有限公司 · 2026 年 11 月 · 脱敏汇总',
        K.btn('导出 PDF', 'exportPdf', { icon: 'download', cls: 'primary' })) +
        K.kpis([
          { k: '参与人数', v: 48, unit: '人', d: '覆盖 6 个部门' },
          { k: '平均减重', v: '3.6', unit: 'kg', d: '较基线 -4.8%', tone: 'up' },
          { k: '高风险转正常', v: 11, unit: '人', d: '五高指标' },
          { k: '预计年度控费', v: '18.6', unit: '万', d: '按缺勤与门诊测算' }
        ]) +
        '<div class="grid g-2">' +
          K.panel({ title: '部门参与度', body: '<div class="stack" style="gap:12px">' +
            [['研发中心', 92, 16], ['市场部', 74, 12], ['生产部', 68, 10], ['财务部', 55, 6], ['人力资源部', 48, 4]].map((x) =>
              '<div><div class="row small" style="justify-content:space-between"><span>' + x[0] + '</span><span class="mut">' + x[2] + ' 人 · ' + x[1] + '%</span></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%"></b></div></div>').join('') + '</div>' }) +
          K.panel({ title: '风险分布', body: '<div style="display:flex;gap:20px;align-items:center">' + UI.donut(23, '#d9503f', 110, '11') +
            '<div class="stack" style="gap:8px;flex:1">' + [['高风险', 11, '#d9503f'], ['关注', 21, '#c8871a'], ['正常', 16, '#0aa39a']].map((x) =>
              '<div class="row small"><i style="width:7px;height:7px;border-radius:2px;background:' + x[2] + '"></i><span class="mut">' + x[0] + '</span><b class="right tnum">' + x[1] + ' 人</b></div>').join('') + '</div></div>' }) +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '健康指标改善 Top', sub: '结营 vs 开营', flush: true, body: UI.table([
          { label: '指标', render: (r) => '<b>' + r[0] + '</b>' },
          { label: '异常人数（开营）', align: 'right', render: (r) => r[1] },
          { label: '异常人数（结营）', align: 'right', render: (r) => r[2] },
          { label: '转正常', align: 'right', render: (r) => '<b style="color:#087e76">' + (r[1] - r[2]) + '</b>' },
          { label: '改善率', align: 'right', render: (r) => '<span class="tnum">' + Math.round((r[1] - r[2]) / r[1] * 100) + '%</span>' }
        ], [['血压偏高', 18, 12], ['空腹血糖受损', 12, 9], ['血脂异常', 15, 13], ['超重/肥胖', 34, 28], ['高尿酸', 9, 7]].map((r) => ({ _id: r[0], 0: r[0], 1: r[1], 2: r[2] }))) });
    },
    actions: { exportPdf() { UI.toast('企业报告 PDF 已生成'); } }
  };


  /* --------------------------------------------------------- 24 入营问卷 */
  const Q_DEFAULT = {
    intro: '为了给你更合适的方案，请用 3 分钟完成以下问题。答案仅用于健康评估。',
    questions: [
      { id: 'q1', text: '你本次最想改善的问题是？', type: 'single', options: ['体重与体脂', '血糖/血脂', '睡眠', '精力与疲劳'], required: true, on: true },
      { id: 'q2', text: '过去 3 个月，你平均每周运动几次？', type: 'single', options: ['几乎不运动', '1–2 次', '3–4 次', '5 次以上'], required: true, on: true },
      { id: 'q3', text: '是否有医生诊断为以下疾病？', type: 'multi', options: ['高血压', '糖尿病', '高血脂', '高尿酸', '均无'], required: true, on: true },
      { id: 'q4', text: '你平时几点入睡？', type: 'single', options: ['22 点前', '22–24 点', '0–1 点', '1 点后'], required: false, on: true },
      { id: 'q5', text: '饮食上最大的困难是？', type: 'multi', options: ['外卖多', '应酬多', '爱吃甜食', '晚餐太晚', '难以坚持'], required: false, on: true },
      { id: 'q6', text: '是否正在服用减重或慢病药物？', type: 'text', options: [], required: false, on: true },
      { id: 'q7', text: '你希望营养师多久联系你一次？', type: 'single', options: ['每天', '每 2–3 天', '每周'], required: false, on: false }
    ]
  };

  P['v-questionnaire'] = {
    app: 'versionall', title: '入营问卷', sub: '学员首次登录必填；答案同步到健康档案',
    preview: 'student-checkin',
    render() {
      const q = (V().questionnaire = V().questionnaire || {});
      if (!q.questions || !q.questions.length) { q.questions = Q_DEFAULT.questions; q.intro = q.intro || Q_DEFAULT.intro; }
      return K.head('入营问卷', q.questions.length + ' 道题 · 必填 ' + q.questions.filter((x) => x.required).length + ' 道',
        K.btn('预览问卷', 'previewQ', { icon: 'eye', cls: 'ghost' }) + K.btn('新增题目', 'newQ', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '完成率', v: '96', unit: '%', d: '46 / 48 人已完成', icon: 'check' },
          { k: '平均用时', v: '2.4', unit: '分钟', d: '较上期 -0.3', tone: 'up', icon: 'clock' },
          { k: '高风险命中', v: 9, unit: '人', d: '已推送营养师跟进', icon: 'shield' }
        ]) +
        '<div class="grid g-2-1"><div class="stack">' +
          K.panel({ title: '问卷设置', body: UI.fArea({ label: '引导语', value: q.intro, rows: 2, path: 'versionall.questionnaire.intro' }) +
            '<div class="hairline"></div>' +
            UI.fSwitch({ label: '首次登录强制填写', value: true, path: 'versionall.questionnaire.force' }) +
            UI.fSwitch({ label: '允许修改答案', value: false, path: 'versionall.questionnaire.editable' }) }) +
          K.panel({ title: '题目', sub: '拖拽排序暂以按钮实现', flush: true,
            body: '<div style="padding:4px 18px 12px">' + q.questions.map((x, i) =>
              '<div class="listrow"><div class="tnum small mut" style="width:20px">' + (i + 1) + '</div>' +
              '<div class="meta"><b>' + E(x.text) + '</b><span>' + ({ single: '单选', multi: '多选', text: '填空' }[x.type]) + ' · ' + (x.required ? '必填' : '选填') + (x.options.length ? ' · ' + x.options.length + ' 个选项' : '') + '</span></div>' +
              '<div class="right row" style="gap:8px"><button class="switch ' + (x.on ? 'on' : '') + '" data-toggle="versionall.questionnaire.questions.' + i + '.on"></button>' +
              '<button class="iconbtn" data-act="editQ" data-id="' + x.id + '">' + I('edit', 14) + '</button></div></div>').join('') + '</div>' }) +
        '</div><div class="stack">' +
          K.panel({ title: '答案去向', body: '<div class="small mut" style="line-height:1.9">' +
            '· 疾病史 → 健康档案「既往史」<br>· 运动频率 → 运动处方初始强度<br>· 睡眠与饮食困难 → 营养师首访清单<br>· 用药情况 → 风险提示（红色标注）</div>' }) +
          K.panel({ title: '高风险规则', body: '<div class="small mut" style="line-height:1.8">选中「高血压 / 糖尿病 / 高血脂 / 高尿酸」任意一项，或填写用药，即标记为高风险并进入营养师首访队列。</div>' +
            '<div class="note warn" style="margin-top:10px">高风险学员的运动强度上限自动锁定为 Lv.3。</div>' }) +
        '</div></div>';
    },
    actions: {
      previewQ() { App.openPreview(); },
      newQ() {
        UI.formDrawer({
          title: '新增问卷题目', sub: '学员首次登录时展示', icon: 'file', section: '题目',
          fields: [
            { key: 'text', label: '题干', type: 'area', rows: 2 },
            { key: 'type', label: '题型', type: 'select', options: [{ v: 'single', l: '单选' }, { v: 'multi', l: '多选' }, { v: 'text', l: '填空' }] },
            { key: 'options', label: '选项（用 / 分隔）', ph: '选项 A / 选项 B' },
            { key: 'required', label: '必填', type: 'bool', value: true }
          ],
          onSave(v) {
            const q = V().questionnaire || (V().questionnaire = { intro: '', questions: [] });
            q.questions.push({ id: 'q' + Date.now(), text: v.text || '新题目', type: v.type, options: v.options ? v.options.split('/').map((x) => x.trim()).filter(Boolean) : [], required: v.required, on: true });
            Store.mark('versionall.questionnaire.questions', '新增题目');
            UI.toast('题目已添加'); App.refresh();
          }
        });
      },
      editQ(d) {
        const q = (V().questionnaire = V().questionnaire || {});
      if (!q.questions || !q.questions.length) { q.questions = Q_DEFAULT.questions; q.intro = q.intro || Q_DEFAULT.intro; }
        const i = q.questions.findIndex((x) => x.id === d.id);
        UI.drawer({ title: '编辑题目', sub: q.questions[i].type, icon: 'file',
          body: '<div class="formsec"><h4>题目</h4>' +
            UI.fArea({ label: '题干', value: q.questions[i].text, rows: 2, path: 'versionall.questionnaire.questions.' + i + '.text' }) +
            UI.fSelect({ label: '题型', value: q.questions[i].type, options: [{ v: 'single', l: '单选' }, { v: 'multi', l: '多选' }, { v: 'text', l: '填空' }], path: 'versionall.questionnaire.questions.' + i + '.type' }) +
            UI.fSwitch({ label: '必填', value: q.questions[i].required, path: 'versionall.questionnaire.questions.' + i + '.required' }) +
            '</div><div class="formsec"><h4>选项</h4><div class="small mut">填空题无需选项。</div>' +
            q.questions[i].options.map((o, k) => '<input class="input" value="' + E(o) + '" data-set="versionall.questionnaire.questions.' + i + '.options.' + k + '">').join('') + '</div>',
          onOk() { UI.toast('题目已保存'); App.refresh(); } });
      }
    }
  };

  /* --------------------------------------------------------- 25 督导总览 */
  P['v-supervisor'] = {
    app: 'versionall', title: '督导总览', sub: '跨营期看批注质量与服务响应',
    preview: 'student-home',
    render() {
      const v = V();
      return K.head('督导总览', '仅督导账号可见 · 覆盖第七期与第八期',
        K.btn('导出督导周报', 'exportSup', { icon: 'download' })) +
        K.kpis([
          { k: '批注及时率', v: '86', unit: '%', d: '24h 内响应 · 目标 90%', tone: 'down' },
          { k: '平均响应时长', v: '9.4', unit: '小时', d: '较上周 -1.2h', tone: 'up' },
          { k: '超时未批注', v: 6, unit: '条', d: '教练端 4 · 营养师端 2', tone: 'down' },
          { k: '学员满意度', v: '4.7', unit: '/5', d: '基于 132 份反馈' }
        ]) +
        '<div class="grid g-2-1">' +
          K.panel({ title: '团队工作量', sub: '本周', flush: true, body: UI.table([
            { label: '成员', render: (r) => '<div class="cellflex">' + UI.avatar(r.name, r.role === '营养师' ? '' : 'g') + '<div><div class="strong">' + E(r.name) + '</div><div class="small muted">' + E(r.role) + '</div></div></div>' },
            { label: '负责学员', align: 'right', render: (r) => '<span class="tnum">' + r.students + '</span>' },
            { label: '批注数', align: 'right', render: (r) => '<span class="tnum">' + r.done + '</span>' },
            { label: '超时', align: 'right', render: (r) => '<span class="tnum" style="color:' + (r.late ? '#b83c2c' : 'inherit') + '">' + r.late + '</span>' },
            { label: '及时率', render: (r) => '<div class="row" style="gap:8px"><div style="width:70px">' + K.progress(Math.round((r.done - r.late) / r.done * 100)) + '</div><span class="small tnum">' + Math.round((r.done - r.late) / r.done * 100) + '%</span></div>' }
          ], [
            { _id: '1', name: '王雪', role: '营养师', students: 16, done: 84, late: 1 },
            { _id: '2', name: '张楠', role: '营养师', students: 16, done: 71, late: 1 },
            { _id: '3', name: '李清', role: '营养师', students: 16, done: 52, late: 0 },
            { _id: '4', name: '刘洋', role: '教练', students: 24, done: 66, late: 3 },
            { _id: '5', name: '陈放', role: '教练', students: 24, done: 58, late: 1 }
          ]) }) +
          K.panel({ title: '质量抽检', sub: '本周抽查 20 条', body: '<div class="stack" style="gap:14px">' +
            [['批注有具体建议', 85], ['含评分', 92], ['无复制粘贴重复', 78], ['学员有反馈', 64]].map((x) =>
              '<div><div class="row small" style="justify-content:space-between"><span class="mut">' + x[0] + '</span><b class="tnum">' + x[1] + '%</b></div><div class="progress" style="margin-top:5px"><b style="width:' + x[1] + '%"></b></div></div>').join('') +
            '<div class="note" style="margin-top:4px">重复批注检测到 3 条疑似复制，已退回重写。</div></div>' }) +
        '</div>' + '<div style="height:16px"></div>' +
        K.panel({ title: '超时记录', sub: '按等待时长', flush: true, body: UI.table([
          { label: '学员', render: (r) => E(r[0]) },
          { label: '类型', render: (r) => UI.pill(r[1], 'grey') },
          { label: '负责人', render: (r) => E(r[2]) },
          { label: '已等待', align: 'right', render: (r) => '<span class="tnum" style="color:#b83c2c">' + r[3] + ' 小时</span>' }
        ], [['赵启明', '运动记录', '刘洋', 38], ['马骁', '运动记录', '刘洋', 31], ['郑凯', '饮食记录', '张楠', 27], ['郭子涵', '运动记录', '陈放', 26]].map((r, i) => ({ _id: i, 0: r[0], 1: r[1], 2: r[2], 3: r[3] }))) });
    },
    actions: { exportSup() { UI.toast('督导周报已导出'); } }
  };

  /* --------------------------------------------------------- nav */
  window.NAV = window.NAV || {};
  window.NAV.versionall = [
    { group: '', items: [{ id: 'v-dashboard', label: '运营概览', icon: 'grid' }] },
    { group: '营期与人员', items: [
      { id: 'v-camps', label: '营期管理', icon: 'calendar' },
      { id: 'v-accounts', label: '账户与权限', icon: 'lock', count: 2 },
      { id: 'v-students', label: '学员管理', icon: 'users' },
      { id: 'v-records', label: '打卡记录', icon: 'check' },
      { id: 'v-annotations', label: '批注工作台', icon: 'message', count: 6, hot: true },
      { id: 'v-attendance', label: '出勤看板', icon: 'layout' }
    ] },
    { group: '规则与激励', items: [
      { id: 'v-rules', label: '打卡规则', icon: 'sliders' },
      { id: 'v-points-rules', label: '积分规则', icon: 'target' },
      { id: 'v-metrics', label: '健康指标库', icon: 'activity' },
      { id: 'v-questionnaire', label: '入营问卷', icon: 'file' },
      { id: 'v-activities', label: '活动与入口', icon: 'spark' },
      { id: 'v-tiers', label: '连续打卡奖励', icon: 'gift' },
      { id: 'v-products', label: '积分商城', icon: 'package' },
      { id: 'v-badges', label: '徽章体系', icon: 'medal' }
    ] },
    { group: '履约与内容', items: [
      { id: 'v-claims', label: '领奖订单', icon: 'gift', count: 4 },
      { id: 'v-exchanges', label: '兑换订单', icon: 'package' },
      { id: 'v-fulfill', label: '履约中心', icon: 'truck' },
      { id: 'v-content', label: '活动与课程', icon: 'video' },
      { id: 'v-messages', label: '消息与公告', icon: 'bell' }
    ] },
    { group: '数据与报告', items: [
      { id: 'v-stats', label: '营期统计', icon: 'chart' },
      { id: 'v-ranking', label: '排行榜', icon: 'star' },
      { id: 'v-report', label: '结营报告', icon: 'file' },
      { id: 'v-enterprise', label: '企业健康报告', icon: 'building' },
      { id: 'v-supervisor', label: '督导总览', icon: 'eye' }
    ] }
  ];
})();
