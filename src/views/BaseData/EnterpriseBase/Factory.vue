<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-27 09:46:43
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-12 10:52:34
 * @FilePath: /frontUI_vue3/src/views/BaseData/EnterpriseBase/Factory.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <dynamic-crud-page
    :route-name="route.name"
    :api="{
      getList,
      addEdit,
      deleteData,
      importData,
      exportData,
    }"
    id-field-name="factoryId"
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
} from "@/api/BaseData/EnterpriseBase/Factory";

const route = useRoute(); // 获取当前路由信息
</script>