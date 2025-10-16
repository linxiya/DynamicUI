<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-10-09 15:30:38
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-11 16:42:05
 * @FilePath: /web3.1/src/components/ImageUploadField/index.vue
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="image-upload-field">
    <el-upload
      :action="uploadUrl"
      :headers="{ token: getToken() }"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      class="avatar-uploader"
    >
      <img v-if="modelValue" :src="modelValue" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <div v-if="modelValue" class="actions">
      <el-icon title="移除图片" @click.stop="handleRemove"><CircleCloseFilled /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getToken } from '@/utils/auth';
import { Plus, CircleCloseFilled } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: String, // v-model
});
const emit = defineEmits(['update:modelValue']);

const uploadUrl = computed(() => import.meta.env.VITE_APP_BASE_API + "/ocean-support/file/upload");

const handleSuccess = (res, file) => {
  if (res.code === 200) {
    emit('update:modelValue', import.meta.env.VITE_APP_BASE_URL + res.data.url);
    ElMessage.success("上传成功");
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
};

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
  }
  return isImage;
};

const handleRemove = () => {
  emit('update:modelValue', '');
};
</script>

<style scoped>
.image-upload-field {
  position: relative;
  width: 178px;
  height: 178px;
}
.avatar-uploader .avatar {
  width: 178px;
  /* height: 178px; */
  display: block;
}
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.actions {
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  color: #ff4d4f;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
  display: flex;
  font-size: 16px;
}
</style>