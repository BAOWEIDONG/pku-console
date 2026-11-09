<script setup>
import { ref, computed } from 'vue'
import { APP_REGISTRY, badgeOf } from './registry'
import { bridge } from './store-bridge'

defineProps({ tick: Number })
const emit = defineEmits(['open'])

const q = ref('')
const apps = computed(() => {
  // badgeOf 每次渲染时取实时待办
  return APP_REGISTRY.map(a => ({ ...a, badge: badgeOf(a.room), dirty: a.id === 'command' ? bridge.dirtyCount : 0 }))
})
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return apps.value
  return apps.value.filter(a => (a.name + a.en + a.desc + a.tags.join('')).toLowerCase().includes(s))
})

function open(app) { emit('open', app.home) }
</script>

<template>
  <div class="mx-page">
    <header class="mx-head">
      <div class="mx-brand">
        <span class="mx-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></span>
        <div>
          <h1>北大医疗 · 超级管理后台</h1>
          <p>一个中台管全部业务 · {{ apps.length }} 个应用 · 统一权限 / 统一发布 / 统一客户</p>
        </div>
      </div>
      <div class="mx-side">
        <span v-if="bridge.role && bridge.role.name" class="mx-role" :title="'当前角色：' + bridge.role.name">
          <i>{{ bridge.role.name.slice(0,1) }}</i>{{ bridge.role.name }}
        </span>
        <span class="mx-live"><b></b>3 端在线</span>
      </div>
    </header>

    <div class="mx-search">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input v-model="q" placeholder="搜索应用：客户、商品、健康管理、五好生活、发布…" />
      <kbd>⌘K</kbd>
    </div>

    <section class="mx-grid">
      <button v-for="a in filtered" :key="a.id" class="mx-card" :style="'--mc:' + a.color" @click="open(a)">
        <div class="mx-card-top">
          <span class="mx-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="iconSvg(a.icon)"></svg></span>
          <span v-if="a.badge" class="mx-badge">{{ a.badge }}</span>
          <span v-else-if="a.dirty" class="mx-badge mx-badge-dirty">{{ a.dirty }} 待发布</span>
        </div>
        <div class="mx-name">{{ a.name }}<em>{{ a.en }}</em></div>
        <p class="mx-desc">{{ a.desc }}</p>
        <div class="mx-tags"><span v-for="t in a.tags" :key="t">{{ t }}</span></div>
        <div class="mx-go">进入 <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 5 7 7-7 7"/></svg></div>
      </button>
    </section>

    <footer class="mx-foot">
      <span>快捷键：⌘K 全局搜索 · 页面内所有改动先进入「待发布」，在发布中心统一生效</span>
    </footer>
  </div>
</template>

<script>
// 简单图标映射（矩阵卡片用；页面内部仍用旧 UI.icon）
const ICON_PATHS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-4-4h-1"/><path d="M16 3.3a4 4 0 0 1 0 7.4"/>',
  package: '<path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v9l8 4 8-4V8"/><path d="M12 12v9"/>',
  stethoscope: '<path d="M4 3v6a5 5 0 0 0 10 0V3"/><path d="M9 14v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="10" r="2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  spark: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>'
}
export default {
  methods: { iconSvg(n) { return ICON_PATHS[n] || ICON_PATHS.grid } }
}
</script>
