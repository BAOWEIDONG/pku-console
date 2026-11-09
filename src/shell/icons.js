// 复用旧 UI kit 的图标（页面里的 UI.icon 也来自这里，保持一致）
export function icon(name, size) {
  try { return window.UI.icon(name, size || 16) } catch (e) { return '' }
}
