<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-21 17:04:04
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-13 09:57:34
 * @FilePath: /web3.1/src/components/DynamicUI/DynamicFormItem.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <!-- Element Plus 表单项，提供标签和校验功能 -->
  <el-form-item
    :prop="props.item.itemKey /* 绑定 prop 用于表单校验 */"
    :label="props.item.itemName /* 显示 item 配置中的 itemName 作为标签 */"
  >
    <!-- 使用抽离出的 DynamicInputControl 组件 -->
     <!--
        这里将父组件传递给 DynamicFormItem 的所有 attrs (包括事件监听器)
        以及 DynamicInputControl 自身可能需要但不在 DynamicFormItem props 中的属性
        通过一个 v-bind 合并绑定。
        理论上，$attrs 包含了所有未被 DynamicFormItem props 声明的属性。
        将 $attrs 直接绑定到 DynamicInputControl 是标准的向下传递属性的方式。
        Upload 相关的事件监听器 (onPreview, onRemove, etc.) 也会包含在 $attrs 中被传递下去。
      -->
    <dynamic-input-control
      :item="props.item /* 将 item 配置传递给内部控件 */"
      :modelValue="props.modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      v-bind="$attrs"
      @append-click="(itemKey) => emit('append-click', itemKey)"
      @item-click="(itemKey) => emit('item-click', itemKey)"
      @change="(data) => emit('change', data)"
      @preview="(data) => emit('preview', data)"
      @remove="(data) => emit('remove', data)"
      @before-remove="(data) => emit('beforeRemove', data)"
      @success="(data) => emit('success', data)"
      @error="(data) => emit('error', data)"
      @exceed="(data) => emit('exceed', data)"
    />
  </el-form-item>
</template>

<script setup>
// 导入新创建的 DynamicInputControl 组件
import DynamicInputControl from './DynamicInputControl.vue';

// --- 定义组件 Props ---
const props = defineProps({
  item: { type: Object, required: true },
  modelValue: null,
  fileList: { type: Array, default: () => [] }
});

const emit = defineEmits([
  'update:modelValue',
  // 'update:fileList',
  'append-click',
  'item-click',
  'preview', 'remove', 'beforeRemove', 'success', 'error', 'exceed', 'change'
]);

// --- 组件内部状态和上下文 ---
// useAttrs() 获取所有父组件传递的、但未在 DynamicFormItem props 中声明的属性和事件监听器
const attrs = useAttrs();
const slots = useSlots();

// --- 不需要单独计算 inputControlAttrs 或 passThroughAttrs ---
// 直接将 $attrs (Element Plus 内部的) 和明确的 props 传递给 DynamicInputControl
// DynamicInputControl 内部会通过 useAttrs() 接收到所有传递给它的非 props 属性。


</script>

<style scoped>
/* DynamicFormItem 自身的样式，例如调整 label 对齐等 */
/* 注意：el-form-item 内部的样式，特别是对输入控件的样式，可能需要使用深度选择器 :deep() */

/* 默认让内容区域占满可用宽度 */
:deep(.el-form-item__content) {
  flex-grow: 1;
}

/* 如果需要，可以覆盖 DynamicInputControl 中的 100% 宽度规则 */
/* 例如，让特定类型的控件不占满 */
/* :deep(.el-form-item__content .el-input-number),
:deep(.el-form-item__content .el-switch) {
   width: auto !important;
} */

</style>