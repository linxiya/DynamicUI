<template>
  <el-dialog
    v-bind="attrs"
    :title="title"
    :fullscreen="isFullscreen"
    v-model="visible"
    @open="onOpen"
    @close="onClose"
  >
    <template #header>
      <span>{{ title }}</span>
      <!-- 使用原生 span 包裹图标，避免 el-button deprecation 警告 -->
      <span
        class="toggle-fullscreen-btn"
        role="button"
        @click="toggleFs"
      >
        <el-icon>
          <component :is="isFullscreen ? exitIcon : enterIcon" />
        </el-icon>
      </span>
    </template>

    <slot />

    <template #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import { FullScreen, CopyDocument } from '@element-plus/icons-vue'

// 接收 v-model:value 和 title，其他属性透传
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title:      { type: String,  default: '' }
})
const emit = defineEmits(['update:modelValue'])
const { title } = toRefs(props)
const attrs = useAttrs()

// 用 computed 处理 v-model
const visible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

// 全屏状态
const isFullscreen = ref(false)
const enterIcon = FullScreen
const exitIcon  = CopyDocument

function onOpen() {
  // 打开时不重置全屏状态，如需重置可取消注释：
  // isFullscreen.value = false
}

function onClose() {
  // 关闭时重置全屏状态
  isFullscreen.value = false
}

function toggleFs() {
  isFullscreen.value = !isFullscreen.value
}
</script>

<style scoped>
.toggle-fullscreen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 40px;
  top: 10px;
  cursor: pointer;
  padding: 4px;
  z-index: 10;
  color: var(--el-color-info);
}
</style>
