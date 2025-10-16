<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-09-22 10:22:24
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-23 10:29:00
 * @FilePath: /frontUI_vue3/src/views/BasicSystem/SysRole.vue
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
    id-field-name="roleId"
    @cell-item-click="cellItemClick"
  >
    <!-- 弹窗插槽 -->
   <template #dialog>
    <!-- 角色用户维护 -->
    <edit-role-user-auth-com
      v-model:visible="editRoleUserAuthVisible"
      :role-data="currentEditing"
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
} from "@/api/BasicSystem/SysRole";

import EditRoleUserAuthCom from "@/views/Common/EditRoleUserAuthCom.vue"; // 引入新的维护组件

const route = useRoute();

const editRoleUserAuthVisible = ref(false); // 用户角色维护弹窗的显示状态
const currentEditing = ref({}); // 当前正在编辑的数据
const dynamicCrudPageRef = ref(null); // 引用动态增删改查组件实例

// --- 方法 ---

/**
 * @description 处理表格单元格点击事件的回调函数。
 * @param {object} cellData - 包含行数据和列配置的对象
 */
function cellItemClick({itemConfig, row}) {
  // 当点击的是角色编码列时，打开维护对话框
  if(itemConfig.itemKey === "roleCode") {
    currentEditing.value = row; // 设置当前正在编辑的角色数据
    editRoleUserAuthVisible.value = true; // 显示用户角色维护弹窗
  }
} 

/**
 * @description 处理绑定成功的回调函数。
 */
function handleBindingSuccess() {
  editRoleUserAuthVisible.value = false; // 隐藏对话框
  dynamicCrudPageRef?.value.fetchData(); // 刷新主列表数据
}
</script>