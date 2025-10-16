<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-30 16:46:37
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-20 15:10:52
 * @FilePath: /frontUI_vue3/src/components/DynamicUI/ToggleFold.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="toggle-fold" @click="$emit('toggle')">
    <span v-if="folded">展开</span>
    <span v-else>折叠</span>
    <component :is="iconComponent" class="toggle-icon" />
  </div>
</template>

<script setup>
import { ArrowDown, ArrowRight } from "@element-plus/icons-vue";

const emit = defineEmits(["toggle"]);

const props = defineProps({
  folded: { type: Boolean, default: false },
});

// 根据 folded 状态选择图标
const iconComponent = computed(() => (props.folded ? ArrowRight : ArrowDown));
</script>

<style scoped>
.toggle-fold {
  display: flex;
  align-items: center;
  float: right;
  top: 10px;
  right: 0;
  position: absolute;
  cursor: pointer;
  padding: 4px;
  height: 24px;
  width: 68px;
  font-size: 14px;
  margin-left: 10px;
}
.toggle-icon {
  /* font-size: 20px; */
  width: 16px;
}
</style>
