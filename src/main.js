import { createApp } from 'vue'
import App from './App.vue'
import './shell/shell.css'

// 阻止旧引擎自己的 hashchange 与 Vue 双驱动冲突：旧引擎保留 hashchange（兼容深链），新壳用 __shellSync 对齐
const app = createApp(App)
app.mount('#app')

// 旧引擎 boot：Store.init + parseHash + render 已在 app-patched.js 里执行。
// 但旧引擎 boot 时 #legacy-root 不存在（Vue 未挂载），需要手动触发一次渲染。
if (window.App && window.__shellSync) {
  // App.vue onMounted 会设置 __shellSync 并按 hash go()
}
