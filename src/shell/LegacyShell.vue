<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { bridge } from './store-bridge'
import { APP_REGISTRY } from './registry'
import Cmdk from './Cmdk.vue'

const props = defineProps({ route: String, tick: Number })
const emit = defineEmits(['home'])

const sidebarOpen = ref(true)
const searchOpen = ref(false)
const dirty = computed(() => bridge.dirtyCount)
const role = computed(() => bridge.role || { name: '', perms: '' })

// 当前路由归属哪个应用（Fusion 房间）
const room = computed(() => {
  const c = bridge.console
  if (!c) return APP_REGISTRY[0]
  const r = c.wbOf(props.route) || c.state.app
  return APP_REGISTRY.find(a => a.id === r) || APP_REGISTRY[0]
})

// 侧栏树：当前房间的 tabs → pages（来自 Fusion.AREAS）
const tabs = computed(() => {
  const f = bridge.fusion
  if (!f) return []
  const area = f.AREAS[room.value.id]
  return (area ? area.tabs : []).map(t => ({
    id: t.id, label: t.label,
    open: true,
    pages: t.pages.filter(p => !p.hidden)
  }))
})

const pageInfo = computed(() => bridge.pages[props.route] || {})

function go(r) { bridge.app.go(r) }
function back() { bridge.app.back() }
function publish() { bridge.app.openPublish('') }
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
</script>

<template>
  <div class="shell" :class="{ 'rail-collapsed': !sidebarOpen }">
    <aside class="subnav" aria-label="主导航">
      <div class="side-brand">
        <span class="side-mark" @click="emit('home')" title="回到应用矩阵" style="cursor:pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>
        </span>
        <span class="side-name"><b>北大医疗</b><em>超级管理后台</em></span>
        <button class="sn-fold" @click="toggleSidebar" title="收起/展开侧栏">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
      </div>

      <div class="mx-ws">
        <button class="mx-ws-home" @click="emit('home')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>
          全部应用
        </button>
        <div class="mx-ws-list">
          <button v-for="a in APP_REGISTRY" :key="a.id" class="mx-ws-item" :class="{ on: a.id === room.id }" :style="a.id === room.id ? '--wc:' + a.color : ''" @click="go(a.home)" :title="a.name">
            <i :style="{ background: a.color }"></i><span>{{ a.name }}</span>
          </button>
        </div>
      </div>

      <div class="sn-work">
        <div v-for="t in tabs" :key="t.id" class="sn-sec">
          <div class="sn-h"><span class="sn-h-t">{{ t.label }}</span><span class="sn-n">{{ t.pages.length }}</span></div>
          <div class="sn-items">
            <button v-for="p in t.pages" :key="p.route" class="sn-item" :class="{ on: p.route === route }" @click="go(p.route)">
              <i class="sn-dot"></i>{{ p.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="sn-foot">
        <button @click="searchOpen = true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <span>全部功能（⌘K）</span>
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="tb-left">
          <button class="tb-back" @click="back" title="返回">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 5-7 7 7 7"/></svg>
          </button>
          <button class="tb-home" @click="emit('home')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>
            <span>应用矩阵</span>
          </button>
          <div class="crumb">
            <span class="crumb-space"><i :style="{ background: room.color }"></i>{{ room.name }}</span>
            <span class="sep">/</span><b>{{ pageInfo.title || route }}</b>
          </div>
        </div>
        <div class="top-actions">
          <button class="searchbtn" @click="searchOpen = true">
            <span class="sb-ic"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>
            <span>搜索页面、客户、服务、订单</span><kbd>⌘K</kbd>
          </button>
          <span class="tb-live"><i></i>3 端在线</span>
          <button v-if="dirty" class="tb-dirty" @click="bridge.app.go('s-publish')"><i></i>{{ dirty }} 项待发布</button>
          <button class="tb-publish" @click="publish">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m22 3-9 18-3-7-7-3 19-8Z"/></svg>
            <span>发布</span>
          </button>
          <button class="tb-user"><span class="ava">{{ (role.name || '?').slice(0,1) }}</span><span class="tb-user-t">{{ role.name }}</span></button>
        </div>
      </header>

      <div id="legacy-root"></div>
    </div>
  </div>

  <Cmdk v-if="searchOpen" @close="searchOpen = false" />
</template>

<style>
/* 旧引擎把内容渲染进 #legacy-root；补上它在 .main 里的占位样式 */
#legacy-root { flex: 1; display: flex; flex-direction: column; min-height: 0; }
#legacy-root .canvas { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr); min-height: 0; }
</style>
