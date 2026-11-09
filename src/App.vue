<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import HomeMatrix from './shell/HomeMatrix.vue'
import LegacyShell from './shell/LegacyShell.vue'
import { bridge } from './shell/store-bridge'

const booted = ref(false)
const route = ref('')          // 当前旧路由（'' = 矩阵首页）
const tick = ref(0)            // 强制刷新计数

function syncFromHash() {
  const h = location.hash.replace(/^#\/?/, '')
  route.value = h.split('?')[0]
}

function shellSync() {
  // 旧引擎 render() 后回调：同步路由与角标
  const st = bridge.console && bridge.console.state
  if (st) route.value = st.route
  tick.value++
  history.replaceState(null, '', '#/' + (st ? st.route : ''))
}

function goLegacy(r) {
  // 矩阵首页 → 子后台
  if (bridge.app && bridge.pages[r]) {
    bridge.app.go(r)
  } else {
    location.hash = '#/' + r
  }
}

function goHome() {
  // 子后台 → 矩阵首页
  route.value = ''
  history.replaceState(null, '', '#/')
  if (bridge.console && bridge.console.state) {
    // 让旧引擎停止驱动 legacy-root（仅清空，不渲染）
    const host = document.getElementById('legacy-root')
    if (host) host.innerHTML = ''
  }
}

onMounted(async () => {
  // 等旧引擎就绪（app-patched.js 同步加载，理论上此刻已可用）
  await nextTick()
  booted.value = !!bridge.app && !!bridge.pages && Object.keys(bridge.pages).length > 0
  window.__shellSync = shellSync
  window.addEventListener('hashchange', syncFromHash)
  syncFromHash()
  if (route.value && bridge.pages[route.value]) {
    bridge.app.go(route.value)
  }
})

function onKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('shell-cmdk'))
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <HomeMatrix v-if="!booted || !route" :tick="tick" @open="goLegacy" @search="goLegacy" />
  <LegacyShell v-else :route="route" :tick="tick" @home="goHome" />
</template>

<style>
/* 新壳的全局样式在 shell.css，这里留空避免 SFC scoped 隔离 */
</style>
