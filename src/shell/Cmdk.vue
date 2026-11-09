<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { bridge } from './store-bridge'

const emit = defineEmits(['close'])
const q = ref('')
const sel = ref(0)
const input = ref(null)

const items = computed(() => bridge.searchItems())
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return items.value.slice(0, 40)
  return items.value.filter(i => (i.title + i.sub + i.route + i.kind).toLowerCase().includes(s)).slice(0, 40)
})

function paint(dir) {
  sel.value = Math.max(0, Math.min(filtered.value.length - 1, sel.value + dir))
}
function choose(i) {
  if (!filtered.value[i]) return
  emit('close')
  bridge.app.go(filtered.value[i].route)
}
function onKey(e) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowDown') { paint(1); e.preventDefault() }
  if (e.key === 'ArrowUp') { paint(-1); e.preventDefault() }
  if (e.key === 'Enter') { choose(sel.value) }
}
onMounted(async () => {
  await nextTick()
  input.value && input.value.focus()
})
</script>

<template>
  <div class="cmdk-overlay" @click.self="emit('close')">
    <div class="cmdk">
      <div class="cmdk-in">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input ref="input" v-model="q" placeholder="搜索页面、服务、学员、预约或操作…" @input="sel = 0" @keydown="onKey" />
        <kbd>ESC</kbd>
      </div>
      <div class="cmdk-tip"><span>↑↓ 选择</span><span>↵ 打开</span></div>
      <div class="cmdk-list">
        <button v-for="(i, k) in filtered" :key="i.route + i.title + k" class="cmdk-i" :class="{ sel: k === sel }" @click="choose(k)" @mousemove="sel = k">
          <span class="cmdk-kind">{{ i.kind }}</span><span>{{ i.title }}</span><span class="k">{{ i.sub }}</span>
        </button>
        <div v-if="!filtered.length" class="empty">没有匹配的页面</div>
      </div>
    </div>
  </div>
</template>

<style>
.cmdk-overlay { position: fixed; inset: 0; background: rgba(4, 14, 26, .55); z-index: 300; display: flex; justify-content: center; align-items: flex-start; padding-top: 12vh; backdrop-filter: blur(4px); }
.cmdk { width: min(640px, 92vw); background: #0d2038; border: 1px solid rgba(126, 168, 216, .25); border-radius: 14px; overflow: hidden; box-shadow: 0 24px 70px rgba(0,0,0,.5); }
.cmdk-in { display: flex; align-items: center; gap: 10px; padding: 14px 16px; color: #9db6d4; border-bottom: 1px solid rgba(126,168,216,.15); }
.cmdk-in input { flex: 1; background: none; border: none; outline: none; color: #eaf2fb; font-size: 14px; }
.cmdk-in kbd, .cmdk-tip kbd { background: rgba(126,168,216,.15); border-radius: 4px; padding: 2px 6px; font-size: 11px; color: #9db6d4; }
.cmdk-tip { display: flex; gap: 12px; padding: 8px 16px; font-size: 11px; color: #7e93b3; }
.cmdk-list { max-height: 46vh; overflow: auto; padding: 6px; }
.cmdk-i { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 9px 12px; border: none; background: none; color: #dbe8f6; border-radius: 8px; cursor: pointer; font-size: 13px; }
.cmdk-i.sel { background: rgba(59, 130, 246, .18); }
.cmdk-kind { font-size: 11px; color: #7e93b3; background: rgba(126,168,216,.12); border-radius: 4px; padding: 1px 6px; flex: none; }
.cmdk-i .k { margin-left: auto; font-size: 11px; color: #7e93b3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 40%; }
.empty { padding: 22px; text-align: center; color: #7e93b3; font-size: 13px; }
</style>
