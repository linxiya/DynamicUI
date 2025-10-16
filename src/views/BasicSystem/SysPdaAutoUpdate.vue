<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-10-11 17:02:31
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-13 09:33:58
 * @FilePath: /web3.1/src/views/BasicSystem/SysPdaAutoUpdate.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="{ getList, addEdit, deleteData, importData, exportData }"
    id-field-name="pdaAutoUpdateId"
  >
    <!-- 
      #item-slot-filePath:
      这个插槽的名称精确匹配 `DynamicForm` 内部期望的格式。
      它会被 `DynamicCrudPage` 捕获，并原封不动地透传给其内部的 `DynamicForm`。
      `DynamicForm` 内部的 `v-if="$slots['item-slot-filePath']"` 条件将为 true，
      从而渲染这个插槽，而不是默认的 `DynamicFormItem`。
    -->
    <!-- <template #item-slot-filePath="{ initialData }">
      <el-form-item label="上传文件" prop="filePath">
        <FileUpload
          :model-value="getRelativePath(initialData.filePath)"
          :fileType="['png','jpg','jpeg','bin','exe','zip','rar']"
          @update:modelValue="setFilePath(initialData, $event)"
        />
      </el-form-item>
    </template> -->
  </dynamic-crud-page>
</template>

<script setup name="SysPdaAutoUpdate">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  getList,
  addEdit,
  deleteData,
  importData,
  exportData,
} from '@/api/BasicSystem/SysPdaAutoUpdate';
import FileUpload from "@/components/FileUpload/index.vue";

const route = useRoute();

// 从环境变量获取基础上传URL，确保路径末尾有斜杠
const baseUploadUrl = (import.meta.env.VITE_APP_BASE_URL || '') + 'minio-public-api/';

/**
 * @description 从完整 URL 中提取相对路径，用于传递给 FileUpload 组件
 * @param {string} fullPath - 带有前缀的完整路径
 * @returns {string} - 不带前缀的相对路径
 */
function getRelativePath(fullPath) {
  if (fullPath && fullPath.startsWith(baseUploadUrl)) {
    return fullPath.substring(baseUploadUrl.length);
  }
  return fullPath || '';
}

/**
 * @description 当 FileUpload 组件更新时，用相对路径和前缀拼接成完整 URL
 * @param {object} targetObject - 要更新的对象 (即 initialData)
 * @param {string} relativePath - FileUpload 返回的相对路径
 */
function setFilePath(targetObject, relativePath) {
  // 使用 Vue 的响应式赋值方式
  targetObject.filePath = relativePath ? `${baseUploadUrl}${relativePath}` : '';
}
</script>