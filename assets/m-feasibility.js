/* ============================================================================
   能力边界 — 把「线上真的生效」「后台能存但前端没读」「浏览器本地演示」
   「必须接后端或第三方」四种状态分开，避免把演示按钮当成真实业务。
   ========================================================================== */
(function () {
  'use strict';
  const E = UI.esc, I = UI.icon;
  const P = window.PAGES = window.PAGES || {};

  const GROUPS = [
    {
      id: 'live', label: '已接通 · 线上真的会变', tone: 'green', icon: 'check',
      summary: '三个 H5 都加载了 pku-bridge.js，会读取 pku-console/config.json；发布后刷新页面即可看到变化。',
      items: [
        ['主题主色与强调色', '品牌站、职工端、减重营的全局主色', 'b-site'],
        ['客服电话 / 热线 / 地址', '只替换页面里已存在的固定文本，不新增入口', 'g-brand'],
        ['职工端站点标题', '浏览器标题与页面头部名称', 'e-site'],
        ['职工端模块显隐', '健康筛查 / 慢病 / 就医 / 特色 / 应急等模块', 'e-modules'],
        ['服务名称 / 介绍 / 上下架', '职工端服务目录与列表卡片，不改变服务详情页的图片与图文', 'e-services'],
        ['页面入口显隐', '品牌站导航与职工端底部 Tab；不删除页面本身', 'chn-map'],
        ['减重营排行榜入口', '只控制入口显示，不改榜单与积分数据', 'v-ranking']
      ]
    },
    {
      id: 'stored', label: '后台能存 · 但 H5 还没读取', tone: 'amber', icon: 'file',
      summary: '这些页面已经能编辑、保存、生成 config.json，但当前 H5 是静态页面，没有读取这些字段。保存不会改变线上。',
      items: [
        ['轮播图 / 开屏', '后台可配置图片与跳转，H5 未读取轮播配置', 'content-banners'],
        ['服务主图 / 图集 / 图文详情', '服务详情内容目前写死在 H5 中', 'e-services'],
        ['实物商品 / SKU / 图文介绍', '后台有商品与库存模型，H5 未接商品接口', 'svc-goods'],
        ['品牌站首页 / 专家 / 科室', '可编辑文案与人员信息，线上仍是静态内容', 'b-team'],
        ['科普文章 / 问答 / 评价', '内容可保存，H5 使用自身静态或 mock 内容', 'g-content'],
        ['五好任务 / 食谱 / 推荐规则', '后台可编排，H5 未读取任务与食谱配置', 'fg-tasks'],
        ['减重营营期 / 规则 / 积分 / 商品', '除排行榜入口外，其余配置不会影响线上', 'v-rules']
      ]
    },
    {
      id: 'local', label: '浏览器本地演示 · 刷新或换设备就没了', tone: 'blue', icon: 'clock',
      summary: 'H5 里能点通，但数据没有服务端。后台的客户、订单、预约、健康记录是演示台账，和 H5 不互通。',
      items: [
        ['手机号验证码登录', '减重营是 mock 登录；职工端没有真实账号体系', 'v-accounts'],
        ['提交预约 / 我的预约', '职工端本地状态，刷新后新预约会丢失', 'e-bookings'],
        ['打卡 / 积分 / 兑换 / 领奖', '减重营 mock 数据，部分筛选状态存 localStorage', 'v-records'],
        ['站内消息 / 公告', '由 mock 生成，后台不能真实推送', 'v-messages'],
        ['问卷草稿与提交', '减重营存 localStorage，后台看不到提交记录', 'v-questionnaire'],
        ['后台客户 / 订单 / 权益 / 健康档案', '所有新增与状态变更只写入本机演示台账', 'crm-hub']
      ]
    },
    {
      id: 'backend', label: '必须接后端或第三方 · 现在不能承诺', tone: 'red', icon: 'lock',
      summary: '页面可以先设计，但接口接通前，按钮只能生成待办或演示记录，不能显示「已发送」「已核销」「已支付」。',
      items: [
        ['短信 / 语音 / 推送', '需要短信服务商、签名、模板审核与发送回执；当前没有', 'msg-center'],
        ['企业微信 / 公众号', '没有企业微信主体与接口，不应把企微当成可用渠道', 'msg-center'],
        ['客户统一身份与跨端痕迹', '需要账号体系与服务端事件表；当前只有演示客户池', 'crm-360'],
        ['订单 / 支付 / 退款 / 发票', '需要交易后端与支付渠道', 'trd-orders'],
        ['库存 / 物流 / 权益核销', '需要库存中心与核销接口', 'trd-stock'],
        ['体检履约 / 报告 / 随访', '需要健康管理后端、报告系统与数据授权', 'h-overview'],
        ['企业报告 / 结算对账', '需要真实聚合数据与财务口径', 'h-enterprise']
      ]
    }
  ];

  P['s-capabilities'] = {
    app: 'all', title: '能力边界', sub: '先把「演示」和「真实生效」分开，再谈后台深度',
    grp: 'roles',
    render() {
      const counts = GROUPS.map((g) => g.items.length);
      return K.head('能力边界', '当前后台是「配置中心 + 运营方案台」，不是已经接通全部业务的后端系统',
        K.btn('看前端功能地图', 'go', { id: 'g-coverage', icon: 'target' }) +
        K.btn('看发布中心', 'go', { id: 's-publish', icon: 'send', cls: 'primary' }), 'PLATFORM / CAPABILITY') +
        '<div class="cap-hero">' +
          '<div class="cap-hero-main"><span>一句话结论</span><b>三个 H5 是静态演示，没有业务后端。</b>' +
            '<p>后台可以把配置、规则和运营流程设计完整；但真实登录、预约、打卡、订单、权益核销、健康档案与消息推送都需要接口。发布只提交 config.json，只有下面第一组字段会被 H5 读取。</p></div>' +
          '<div class="cap-hero-side"><div><b>' + counts[0] + '</b><span>类配置真实生效</span></div><div><b>' + counts[1] + '</b><span>类仅保存未读取</span></div><div><b>' + counts[2] + '</b><span>类仅浏览器本地</span></div><div><b>' + counts[3] + '</b><span>类必须接后端</span></div></div>' +
        '</div>' +
        '<div class="cap-groups">' + GROUPS.map((g) =>
          '<section class="cap-group ' + g.tone + '"><header><span class="cap-ic">' + I(g.icon, 16) + '</span>' +
            '<div><h3>' + E(g.label) + '</h3><p>' + E(g.summary) + '</p></div><em>' + g.items.length + ' 项</em></header>' +
            '<div class="cap-list">' + g.items.map((x) =>
              '<button data-act="go" data-id="' + x[2] + '"><span class="cap-dot"></span><div><b>' + E(x[0]) + '</b><span>' + E(x[1]) + '</span></div>' + I('chevron', 12) + '</button>').join('') + '</div>' +
          '</section>').join('') + '</div>' +
        '<div class="cap-principles"><div><b>发布 = 提交配置</b><span>不会部署代码、不会建表、不会发消息。GitHub Token 只负责把 config.json 写回仓库。</span></div>' +
          '<div><b>触达 = 人工待办</b><span>当前没有企业微信与短信服务商。客户触达只记录电话跟进，手机号名单可导出给人工使用。</span></div>' +
          '<div><b>真实系统优先级</b><span>手机号账号 → 预约与履约 → 权益核销 → 短信服务商 → 健康档案与报告。</span></div></div>';
    }
  };

  window.CAPABILITY = GROUPS;
})();
