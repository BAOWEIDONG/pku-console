// 应用注册表：应用矩阵首页的数据源。
// 每个应用对应旧架构的一个 Fusion 房间（工作区）；card 上的统计/待办来自旧 Fusion.navCount。
export const APP_REGISTRY = [
  {
    id: 'command', name: '经营总览', en: 'COMMAND CENTER', icon: 'grid',
    color: '#7CB6FF', room: 'command', home: 'fuse-command',
    desc: '今日待办、经营洞察、发布闸门与前端覆盖，先看信号再动手。',
    tags: ['指挥中心', '经营洞察', '发布与影响']
  },
  {
    id: 'customer', name: '客户与交易', en: 'CUSTOMER & TRADE', icon: 'users',
    color: '#F0B45E', room: 'customer', home: 'fuse-customer',
    desc: '客户 360、订单中心、预约履约、结算对账与上下游主数据。',
    tags: ['客户 360', '订单', '结算', '上下游']
  },
  {
    id: 'catalog', name: '商品与服务', en: 'SERVICE CATALOG', icon: 'package',
    color: '#8FB8FF', room: 'catalog', home: 'fuse-catalog',
    desc: '服务商品 SPU/SKU、价格政策、服务包、库存预留与端上详情。',
    tags: ['SPU/SKU', '价格', '服务包', '库存']
  },
  {
    id: 'health', name: '健康管理', en: 'CARE MANAGEMENT', icon: 'stethoscope',
    color: '#7FE6D8', room: 'health', home: 'fuse-health',
    desc: '健康档案、风险分层、管理计划、随访工作台与结果评估。',
    tags: ['档案', '风险分层', '随访', '结果']
  },
  {
    id: 'program', name: '健康项目', en: 'PROGRAMS', icon: 'layers',
    color: '#B7A6FF', room: 'program', home: 'fuse-program',
    desc: '五好生活（吃睡动心查）与减重训练营，会员、任务、规则、报告全链路。',
    tags: ['五好生活', '减重营', '规则', '报告']
  },
  {
    id: 'growth', name: '内容与渠道', en: 'CONTENT & CHANNELS', icon: 'spark',
    color: '#48D3C7', room: 'growth', home: 'fuse-content',
    desc: '品牌站、职工端、公共素材库与渠道图谱，改一次投三端。',
    tags: ['品牌站', '职工端', '素材库', '渠道']
  },
  {
    id: 'platform', name: '系统与权限', en: 'PLATFORM', icon: 'settings',
    color: '#A6B7CE', room: 'platform', home: 'fuse-platform',
    desc: '公共资源沉淀、权益券引擎、角色权限、发布审计与操作日志。',
    tags: ['权限', '发布', '审计', '模板']
  }
]

// 从旧壳拿实时待办数（Fusion.navCount），失败则返回 null（不显示角标）
export function badgeOf(room) {
  try { return (window.Fusion && window.Fusion.navCount(room)) || null } catch (e) { return null }
}
