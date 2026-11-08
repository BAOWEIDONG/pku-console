/* ============================================================================
   渠道与触点：H5 只是渠道之一；新增端 = 新增渠道，不加后台入口
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};
  const CH = () => Store.db.channels;

  const TYPE = { h5: ['H5', 'blue'], miniapp: ['小程序', 'green'], web: ['官网', 'violet'], social: ['社媒', 'amber'] };

  P['chn-channels'] = {
    app: 'all', grp: 'shared.content', papp: 'pku', title: '渠道与触点', sub: '所有对外触点在这里统一管理，服务与内容按渠道投放',
    preview: 'pku-home',
    render() {
      const list = CH();
      const on = list.filter((c) => c.on);
      return K.head('渠道与触点', list.length + ' 个渠道 · 在线 ' + on.length + ' 个 · 覆盖 5 类终端',
        K.btn('新增渠道', 'newChannel', { icon: 'plus', cls: 'primary' })) +
        K.kpis([
          { k: '在线渠道', v: on.length, unit: '个', d: 'H5 3 · 企微 · 官网', icon: 'layers' },
          { k: '月度总曝光', v: '29.0', unit: '万', d: '较上月 <b>+9%</b>', tone: 'up', icon: 'eye' },
          { k: '预约转化', v: '6.4', unit: '%', d: '企微最高 9.1%', tone: 'up', icon: 'target' },
          { k: '本月新增触点', v: 1, unit: '个', d: '小红书（筹备中）', icon: 'plus' }
        ]) +
        '<div class="panel" style="margin-bottom:16px"><div style="padding:14px 18px;display:flex;gap:12px;align-items:flex-start">' +
          I('layers', 18) + '<div><b style="font-size:12.5px">为什么不再按 H5 分后台</b>' +
          '<div class="small mut" style="margin-top:3px;line-height:1.7">每新增一个 H5 / 小程序，只是在这里加一条渠道记录，配置「可见服务、主题、入口地址」即可上线；后台菜单不变，运营不用再学一套系统。</div></div></div></div>' +
        '<div class="grid g-3">' + list.map((c) => {
          const t = TYPE[c.type] || ['其他', 'grey'];
          return '<div class="panel" style="padding:16px">' +
            '<div class="row"><div style="width:38px;height:38px;border-radius:11px;background:' + (c.on ? '#eaf2ff' : '#f1f5fa') + ';display:grid;place-items:center;color:' + (c.on ? '#0b63e5' : '#9aa8bd') + '">' + I(c.type === 'web' ? 'layout' : c.type === 'social' ? 'message' : 'phone', 17) + '</div>' +
            '<div style="flex:1;min-width:0"><div class="row" style="gap:6px"><b style="font-size:13px">' + E(c.name) + '</b>' + UI.pill(t[0], t[1]) + '</div>' +
            '<div class="small muted" style="margin-top:2px">' + E(c.audience) + ' · ' + E(c.owner) + '</div></div>' +
            '<button class="switch ' + (c.on ? 'on' : '') + '" data-toggle="channels.' + UI.ix(CH(), c) + '.on"></button></div>' +
            '<div class="hairline"></div>' +
            '<div class="row small"><span class="mut">服务范围</span><b class="right">' + E(c.svcScope) + '</b></div>' +
            '<div class="row small" style="margin-top:5px"><span class="mut">主题</span><b class="right">' + E(c.theme) + '</b></div>' +
            '<div class="row small" style="margin-top:5px"><span class="mut">月曝光</span><b class="right tnum">' + (c.hits ? (c.hits / 10000).toFixed(1) + ' 万' : '—') + '</b></div>' +
            '<div class="row" style="margin-top:10px;gap:6px"><button class="btn sm" style="flex:1" data-act="editChannel" data-id="' + c.id + '">配置</button>' +
            (c.entry ? '<a class="btn sm" href="' + E(c.entry) + '" target="_blank" rel="noopener" title="打开渠道">' + I('external', 13) + '</a>' : '') + '</div>' +
          '</div>';
        }).join('') + '</div>';
    },
    actions: {
      newChannel() {
        UI.formDrawer({ title: '新增渠道', sub: '新增一个端，不需要新增后台菜单', icon: 'plus', section: '渠道信息',
          fields: [
            { key: 'name', label: '渠道名称', ph: '如 小红书企业号' },
            { key: 'type', label: '终端类型', type: 'select', options: [{ v: 'h5', l: 'H5' }, { v: 'miniapp', l: '小程序' }, { v: 'web', l: '官网 / PC' }, { v: 'social', l: '社媒 / 内容平台' }] },
            { key: 'audience', label: '触达人群', ph: '公众获客 / 企业员工' },
            { key: 'svcScope', label: '服务范围', type: 'select', options: ['对外可售', '权益内', '营期内', '内容种草'] },
            { key: 'entry', label: '入口地址', ph: 'https://' },
            { key: 'owner', label: '负责人', ph: '品牌部' }
          ],
          hint: '保存后到「服务商品」里勾选该渠道，即可让服务在这个端出现。',
          onSave(v) {
            Store.pushItem('channels', { id: 'ch' + Date.now(), name: v.name || '新渠道', type: v.type, audience: v.audience, entry: v.entry, theme: '跟随品牌', on: true, owner: v.owner, hits: 0, svcScope: v.svcScope }, '新增渠道');
            UI.toast('渠道已创建，请到服务商品里配置投放'); App.refresh();
          } });
      },
      editChannel(d) {
        const list = CH();
        const c = list.find((x) => x.id === d.id), i = list.indexOf(c);
        UI.drawer({ title: '配置渠道', sub: c.name, icon: 'layers', width: 520,
          body: '<div class="formsec"><h4>基本信息</h4>' +
            UI.fInput({ label: '渠道名称', value: c.name, path: 'channels.' + i + '.name' }) +
            '<div class="frow">' + UI.fInput({ label: '入口地址', value: c.entry, path: 'channels.' + i + '.entry' }) +
            UI.fInput({ label: '负责人', value: c.owner, path: 'channels.' + i + '.owner' }) + '</div>' +
            UI.fSelect({ label: '服务范围', value: c.svcScope, options: ['对外可售', '权益内', '营期内', '内容种草'], path: 'channels.' + i + '.svcScope' }) +
            '</div><div class="formsec"><h4>展示</h4>' +
            UI.fInput({ label: '主题口径', value: c.theme, path: 'channels.' + i + '.theme' }) +
            UI.fSwitch({ label: '渠道启用', value: c.on, path: 'channels.' + i + '.on' }) +
            '</div><div class="formsec"><h4>投放的服务</h4><div class="small mut" style="line-height:1.9">' +
            Store.db.employee.services.filter((s) => s.channels.indexOf(c.id) >= 0).slice(0, 8).map((s) => '· ' + s.name).join('<br>') +
            '</div><div class="small mut" style="margin-top:6px">共 ' + Store.db.employee.services.filter((s) => s.channels.indexOf(c.id) >= 0).length + ' 项，可在服务商品详情里调整。</div></div>' +
            UI.impact(['该渠道的商品列表、搜索与详情']),
          onOk() { UI.toast('渠道配置已保存'); App.refresh(); } });
      }
    }
  };
})();
