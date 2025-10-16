<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-10-14 10:57:32
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-15 15:59:55
 * @FilePath: /web3.1/src/views/BasicSystem/SysNotifyMessage.vue
 * @Description: 站内信
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="{ getList, addEdit, deleteData, importData, exportData }"
    id-field-name="id"
    :is-form-disabled="isDetailMode"
    @cell-item-click="handleCellClick"
  >
  </dynamic-crud-page>
</template>

<script setup name="SysNotifyMessage">
import {
  getList,
  exportData,
  addEdit,
  deleteData,
  importData,
  getDetail,
} from '@/api/BasicSystem/SysNotifyMessage';

const route = useRoute();
const dynamicCrudPageRef = ref(null);

// --- 详情/只读模式控制 ---
const isDetailMode = ref(false);

// 我们可以选择覆盖 DynamicCrudPage 内部的 handleAddEdit 方法
function handleCellClick({ itemConfig, row }) {
    if (itemConfig.itemKey === 'templateCode') {
        showLogDetail(row);
    }
}

/**
 * @description 显示详情（只读模式）
 * @param {object} row - 要查看的行数据
 */
async function showLogDetail(row) {
  isDetailMode.value = true;
  if(dynamicCrudPageRef.value) {
    // 调用子组件的 handleAddEdit 方法，并传入 'view' 模式
    dynamicCrudPageRef.value.handleAddEdit('view', row, () => getDetail(row.id) );
  }
}
</script>