<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-27 09:46:43
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-19 15:30:32
 * @FilePath: /frontUI_vue3/src/views/BaseData/EnterpriseBase/Organization.vue
 * @Description: 组织管理
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
    id-field-name="orgId"
    @cell-item-click="cellItemClick"
    ref="dynamicCrudPageRef"
  >
    <!-- 弹窗插槽 -->
   <template #dialog>
    <!-- 用户组织维护 -->
    <edit-org-user-com
      v-model:visible="editOrgUserVisible"
      :organization-data="currentEditingOrg"
      @binding-success="handleBindingSuccess" 
      />
   </template>
     
  </dynamic-crud-page>
</template>

<script setup>
import {
  getList,
  addEdit,
  deleteData,
  importData,
  exportData,
} from "@/api/BaseData/EnterpriseBase/Organization";

import EditOrgUserCom from "@/views/Common/EditOrgUserCom.vue";// 引入组织用户维护组件

const route = useRoute(); // 获取当前路由信息

const editOrgUserVisible = ref(false); // 组织用户维护弹窗的显示状态

const currentEditingOrg = ref({}); // 当前正在编辑的组织数据

const dynamicCrudPageRef = ref(null); // 引用动态增删改查组件实例

// --- 方法 ---

/**
 * @description 处理表格单元格点击事件的回调函数。
 * @param {object} row - 被点击的行数据对象。
 * @param {string} itemConfig - 被点击的列对象。
 * @param {number} index - 被点击的单元格索引。
 */
 function cellItemClick({itemConfig, row, index}) {
  // 处理单元格点击事件
  console.log("单元格点击:", {itemConfig, row, index});
  if(itemConfig.itemKey === "orgCode") {
    currentEditingOrg.value = row; // 设置当前编辑的组织数据
    editOrgUserVisible.value = true; // 显示组织用户维护弹窗
  }
} 

/**
 * @description 处理绑定成功的回调函数。
 */
 function handleBindingSuccess() {
  editOrgUserVisible.value = false; // 隐藏组织用户维护弹窗
  dynamicCrudPageRef?.value.fetchData(); // 刷新数据
}
</script>

