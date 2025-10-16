<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-09-30 14:27:29
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-11 15:19:49
 * @FilePath: /web3.1/src/views/BasicSystem/SysDictDet.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="pageApi"
    id-field-name="dictDetId"
  >
    <!-- 可以在这里添加返回按钮或面包屑导航增强 -->
    <template #query-actions="{ submitQueryForm, resetQueryForm }">
       <!-- 直接调用从插槽获取的函数 -->
       <el-button @click="() => submitQueryForm('table')" type="primary" icon="Search">数据查询</el-button>
       <el-button @click="resetQueryForm" icon="Refresh">重置表单</el-button>
    </template>
  </dynamic-crud-page>
</template>

<script setup name="SysDictDet">
// 引入字典数据的相关 API
import {
  getDetail as getList,
  // upAddSysDictDet as addEdit,
  // delSysDictDet as deleteData,
  // 字典数据的导入导出API可能需要单独创建
  // importData,
  // exportData,
} from "@/api/BasicSystem/SysDict";

const route = useRoute();
const dynamicCrudPageRef = ref(null);

// 从路由参数中获取 dictId
const dictId = route.query.dictId;
const paramName = route.query.paramName || '';

console.log(route);

// --- API 适配 ---
// 为所有 API 请求自动附加 dictId
const pageApi = computed(() => ({
  getList: (params) => getList({ ...params }, dictId),
  // addEdit: (mode, data) => addEdit(mode, { ...data, dictId }),
  // deleteData: deleteData,
  // importData: (formData) => importData(formData, dictId),
  // exportData: (params) => exportData({ ...params, dictId }),
}));



onActivated(() => {
  console.log(dynamicCrudPageRef);
  // dynamicCrudPageRef?.submitQueryForm()
  // dynamicCrudPageRef?.value.fetchData()
});

onMounted(() => {
  // (可选) 可以在这里设置页面标题或面包屑
  // 例如，使用 document.title
  document.title = `字典数据 - ${paramName}`;
});
</script>