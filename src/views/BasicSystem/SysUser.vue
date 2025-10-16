<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-27 09:46:43
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-22 13:52:08
 * @FilePath: /frontUI_vue3/src/views/BasicSystem/SysUser.vue
 * @Description:用户管理
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
    id-field-name="userId"
    @cell-item-click="cellItemClick"
    ref="dynamicCrudPageRef"
    @config-loaded="onConfigLoaded"
  >
    <!-- 弹窗插槽 -->
   <template #dialog>
    <!-- 用户角色维护 -->
    <edit-user-role-com
      v-model:visible="editUserRoleVisible"
      :user-data="currentEditing"
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
} from "@/api/BasicSystem/SysUser";

import { getList as getFactory } from "@/api/BaseData/EnterpriseBase/Factory"; // 用于获取工厂列表

import EditUserRoleCom from "@/views/Common/EditUserRoleCom.vue";// 引入组织用户维护组件

const route = useRoute(); // 获取当前路由信息

const editUserRoleVisible = ref(false); // 用户角色维护弹窗的显示状态

const currentEditing = ref({}); // 当前正在编辑的数据

const dynamicCrudPageRef = ref(null); // 引用动态增删改查组件实例

// --- 方法 ---

/**
 * @description 加载并注入动态的枚举数据 
 * @async
 */
async function loadAndInjectDynamicEnums() {
  try {
    // 1. 调用 API 获取组织列表数据
    // 我们获取所有数据，所以设置一个很大的 pageSize
    const res = await getFactory({ startPage: 1, pageSize: 99999 });
    const FactoryList = res.data || [];

    // 2. 将返回的组织数据格式化为 enumData 需要的格式
    const factoryEnumData = FactoryList.map(o => ({
      text: o.factoryName, // 下拉框显示的文本
      value: o.factoryId,  // 下拉框选中的值
    }));

    // 3. 检查 dynamicCrudPageRef 是否已准备好
    if (dynamicCrudPageRef.value) {
      // 4. 调用子组件暴露的方法，更新 'factoryId' 字段的配置
      dynamicCrudPageRef.value.updateFieldConfig('factoryId', {
        // 将格式化好的数组转为 JSON 字符串
        enumData: JSON.stringify(factoryEnumData),
      });
    }
  } catch (error) {
    console.error("加载组织列表作为枚举数据失败:", error);
  }
}

/**
 * @description 当子组件的配置加载完成后触发此函数
 * @param {Array} loadedFields - (可选) 子组件传递过来的已加载字段
 */
async function onConfigLoaded(loadedFields) {
  await loadAndInjectDynamicEnums();
}

/**
 * @description 处理表格单元格点击事件的回调函数。
 * @param {object} row - 被点击的行数据对象。
 * @param {string} itemConfig - 被点击的列对象。
 * @param {number} index - 被点击的单元格索引。
 */
 function cellItemClick({itemConfig, row, index}) {
  // 处理单元格点击事件
  console.log("单元格点击:", {itemConfig, row, index});
  if(itemConfig.itemKey === "userCode") {
    currentEditing.value = row; // 设置当前编辑的用户角色数据
    editUserRoleVisible.value = true; // 显示用户角色维护弹窗
  }
} 

/**
 * @description 处理绑定成功的回调函数。
 */
 function handleBindingSuccess() {
  editUserRoleVisible.value = false; // 隐藏组织用户维护弹窗
  dynamicCrudPageRef?.value.fetchData(); // 刷新数据
}
</script>

