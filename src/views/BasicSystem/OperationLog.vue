<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-09-22 10:22:24
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-30 10:41:07
 * @FilePath: /web3.1/src/views/BasicSystem/OperationLog.vue
 * @Description: 角色管理
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="{
      getList,
      addEdit,
      deleteData,
      importData,
      exportData,
    }"
    id-field-name="id"
    @cell-item-click="cellItemClick"
    :is-form-disabled="true"
  >
   
  </dynamic-crud-page>
</template>

<script setup>
import {
  getList,
  addEdit,
  deleteData,
  importData,
  exportData,
} from "@/api/BasicSystem/OperationLog";



const route = useRoute();


const dynamicCrudPageRef = ref(null); // 引用动态增删改查组件实例

// --- 方法 ---

/**
 * @description 处理表格单元格点击事件的回调函数。
 * @param {object} cellData - 包含行数据和列配置的对象
 */
function cellItemClick({itemConfig, row}) {
  
} 


</script>