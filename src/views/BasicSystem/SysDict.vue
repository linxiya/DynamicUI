<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-09-30 13:40:15
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-11 17:43:34
 * @FilePath: /web3.1/src/views/BasicSystem/SysDict.vue
 * @Description: 数据字典
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="{ getList, addEdit, deleteData, importData, exportData }"
    id-field-name="dictId"
    @cell-item-click="handleCellClick"
  >
  </dynamic-crud-page>
</template>

<script setup name="SysDict">
import {
  getList,
  addEdit,
  deleteData,
  importData,
  exportData,
} from "@/api/BasicSystem/SysDict";

const route = useRoute();
const router = useRouter();
const dynamicCrudPageRef = ref(null);

/**
 * @description 处理表格单元格点击事件，用于跳转到明细页
 * @param {object} cellData - 包含行数据和列配置的对象
 */
function handleCellClick({ itemConfig, row }) {
  console.log({ itemConfig, row});
  // 当用户点击的是 'paramName' 这一列时，我们跳转到明细页
  if (itemConfig.itemKey === 'paramName') {
    router.push({
      name: 'SysDictDet',
      query: { paramName: row.paramName ,dictId: row.dictId}
    });
  }
}
</script>