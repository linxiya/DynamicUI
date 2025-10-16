<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-27 10:00:22
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-12 15:07:18
 * @FilePath: /frontUI_vue3/src/components/TabsWrapper/index.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="tabs-wrapper">
    <el-tabs v-model="activeTab" @tab-change="onInternalTabChange">
      <!-- 表格 tab -->
      <el-tab-pane v-if="showTable" label="表格数据" name="table">
        <div class="tabs-header">
          
          <div class="tabs-buttons">
            <slot name="table-buttons" />
          </div>
          <div class="tabs-buttons-sys">
            <slot name="table-buttons-sys" />
          </div>
        </div>
        <div class="tabs-content">
          <slot name="table-content" />
        </div>
      </el-tab-pane>

      <!-- 履历 tab -->
      <el-tab-pane v-if="showResume" label="履历数据" name="resume">
        <div class="tabs-content">
          <slot name="resume-content" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>

const props = defineProps({
  showTable: {
    type: Boolean,
    default: true,
  },
  showResume: {
    type: Boolean,
    default: false,
  },
  initialActiveTab: { // 允许外部设置初始 tab
    type: String,
    default: 'table',
  },
})

// 如果需要外部可以改变初始 tab (在组件创建前)
const emit = defineEmits(['tab-changed']);


// 通过 v-model 绑定的 activeTab
// 这里的 activeTab 是一个响应式引用，初始值为 props.initialActiveTab
const activeTab = ref(props.initialActiveTab);

// v-model="activeTab" 绑定到 tabs 组件
const onInternalTabChange = (tabName) => {
  // activeTab.value = tabName; // v-model="activeTab" 已处理
  emit('tab-changed', tabName); // 发射事件，传递新的 activeTab 值
};




// 如果需要外部可以改变初始 tab (在组件创建后)
watch(() => props.initialActiveTab, (newVal) => {
   if (newVal !== activeTab.value) {
      activeTab.value = newVal;
      // 注意：这里主动修改 activeTab 不会触发 el-tabs 的 tab-change 事件
      // 如果也需要通知，可以手动 emit
      // emit('active-tab-changed', newVal);
   }
});

// 使用 defineExpose 暴露 activeTab
defineExpose({
  activeTab, // 直接暴露 ref 对象，父组件可以 .value 访问
  // 或者暴露一个 getter
  // getActiveTab: () => activeTab.value,
  // 也可以暴露方法
  // setActiveTab: (name) => { activeTab.value = name; }
});
</script>

<style scoped>
.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs-buttons > * + * {
  margin-left: 10px;
}

.tabs-content {
  padding: 10px 0;
}
</style>
