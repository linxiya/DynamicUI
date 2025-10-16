<template>
  <!-- 用户导入对话框 -->
  <el-dialog
    :title="props.title"
    :model-value="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    width="400px"
    append-to-body
    @close="handleCloseDialog"
  >
    <el-upload
      ref="uploadRef"
      :limit="1"
      accept=".xlsx, .xls"
      :headers="currentHeaders"
      :action="uploadActionUrl"
      :disabled="isUploading"
      :on-progress="handleFileUploadProgress"
      :on-success="handleFileSuccess"
      :on-error="handleFileError"
      :on-exceed="handleUploadExceed"
      @change="handleFileChange"
      :auto-upload="false"
      drag
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="downloadTemplate"
            v-if="props.templateDownloadPath"
          >下载模板</el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <div class="dialog-footer">
        
        <el-button @click="closeDialog" :disabled="isUploading">取 消</el-button>
        <el-button type="primary" @click="submitFileForm" :loading="isUploading">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { getToken } from "@/utils/auth"; // 获取认证 token 的工具函数 (用于上传)
/**
 * @description 定义组件的 props。
 * @property {Boolean} modelValue - 用于 v-model 双向绑定，控制对话框的显示/隐藏。
 * @property {String} title - 对话框的标题。
 * @property {String} uploadUrl - 文件上传的目标完整 URL (必需)。
 * @property {Object|null} headers - 可选的自定义请求头对象。
 * @property {String} templateDownloadPath - 可选的模板下载路径 (例如 "system/user/importTemplate")。
 * @property {String} templateFilenamePrefix - 可选的下载模板文件名的前缀。
 * @property {String} baseApiUrl - 可选的基础 API URL，当 templateDownloadPath 是相对路径时使用。
 */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '文件导入',
  },
  uploadUrl: {
    type: String,
    required: true,
  },
  headers: {
    type: Object,
    default: null,
  },
  
  templateDownloadPath: {
    type: String,
    default: '',
  },
  templateFilenamePrefix: {
    type: String,
    default: 'template_',
  },
  baseApiUrl: {
    type: String,
    default: import.meta.env.VITE_APP_BASE_API || '',
  }
});

/**
 * @description 定义组件的 emits 事件。
 * @event update:modelValue - v-model 更新事件。
 * @event import-success - 文件导入成功时触发。
 * @event download-template-error - 模板下载失败时触发。
 */
const emit = defineEmits(['update:modelValue', 'import-success', 'download-template-error']);

// 获取当前组件实例，用于访问全局属性如 proxy.$download (如果存在)
const { proxy } = getCurrentInstance();

// el-upload 组件的引用
const uploadRef = ref(null);
// 标记文件是否正在上传中
const isUploading = ref(false);

const internalFileList = ref([]); // ***** 自己维护的文件列表 *****

/**
 * @description 计算最终用于 el-upload 的请求头。
 * 如果 props.headers 存在则使用它，否则尝试使用 getToken() 生成默认的 Authorization 请求头。
 * @returns {Object} 请求头对象。
 */
const currentHeaders = computed(() => {
  const baseHeaders = {
      token: getToken()
  }
  if (props.headers) {
    return {...baseHeaders, ...props.headers};
  }
  try {
    return baseHeaders;
  } catch (e) {
    console.warn("getToken() 函数不可用或未定义，上传请求头可能不完整。");
    return {};
  }
});

/**
 * @description 计算 el-upload 组件的 action URL。
 * @returns {String} 完整的上传 URL。
 */
const uploadActionUrl = computed(() => {
  return `${props.baseApiUrl + props.uploadUrl}`;
});

/**
 * @description 下载导入模板的操作。
 * @async
 */
async function downloadTemplate() {
  if (!props.templateDownloadPath) {
    ElMessage.warning('未配置模板下载路径');
    return;
  }
  try {
    if (proxy && proxy.download) {
      await proxy.download(
        props.baseApiUrl + props.templateDownloadPath, // 模板下载的相对或绝对路径
        {}, // 下载时可能需要的额外参数
        `${props.templateFilenamePrefix}${new Date().getTime()}.xlsx`, // 下载的文件名
      );
    } else {
      console.error("下载工具 (proxy.download) 未找到。");
      ElMessage.error("下载功能不可用。");
      emit('download-template-error', 'Download utility not found');
    }
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('下载模板失败，请稍后再试');
    emit('download-template-error', error);
  }
}

/**
 * @description 文件上传过程中的处理函数 (el-upload 的 on-progress 钩子)。
 * @param {object} event - 上传进度事件对象。
 * @param {object} file - 当前正在上传的文件对象。
 * @param {Array<object>} fileList - 当前上传的文件列表。
 */
const handleFileUploadProgress = (event, file, fileList) => {
  isUploading.value = true;
};

/**
 * @description 文件上传成功后的处理函数 (el-upload 的 on-success 钩子)。
 * @param {object} response - 服务器返回的响应数据。
 * @param {object} uploadFile - 上传成功的文件对象。
 * @param {Array<object>} uploadFiles - 当前上传的文件列表。
 */
 const handleFileSuccess = (response, uploadFile, uploadFiles) => {
  isUploading.value = false;
  if (uploadRef.value) {
    uploadRef.value.clearFiles(); // 清空已上传文件列表
  }
  internalFileList.value = []; // 也清空我们自己维护的列表，因为导入已完成

  let alertTitle = '导入结果';
  let alertMessage = '';
  let messageType = 'success'; // 默认成功

  if (response && response.code === 200 && response.data) {
    const successCount = response.data.操作成功总数 !== undefined ? response.data.操作成功总数 : 0;
    const failureRows = response.data.操作失败行数 && Array.isArray(response.data.操作失败行数) ? response.data.操作失败行数 : [];
    const failureCount = failureRows.length;
    const totalProcessed = successCount + failureCount; // 尝试计算总处理数

    // 构建提示信息
    let detailMessages = [];
    detailMessages.push(`<strong>总处理行数：${totalProcessed}</strong>`); // 如果后端不直接给总数，可以这样估算
    detailMessages.push(`<strong>成功导入：<span style="color: green;">${successCount}</span> 条</strong>`);

    if (failureCount > 0) {
      messageType = 'warning'; // 如果有失败，即使 code 是 200，也给个警告色
      alertTitle = '导入部分成功';
      detailMessages.push(`<strong>失败：<span style="color: red;">${failureCount}</span> 条</strong>`);
      // 如果失败行数列表不为空，展示出来
      if (failureRows.length > 0) {
        // 为了防止行数过多导致弹窗过长，可以考虑只显示前N条，或提示用户查看日志
        const displayedFailureRows = failureRows.slice(0, 10); // 最多显示前10条失败行号
        detailMessages.push(`失败行号（或数据索引）：${displayedFailureRows.join(', ')}` + (failureRows.length > 10 ? ' 等...' : ''));
        // 如果后端返回了更详细的错误信息，比如一个错误消息列表，对应每一行，这里也要加上
        // 例如: if (response.data.errorDetails) { detailMessages.push(`错误详情: ...`); }
      }
      if (successCount === 0 && failureCount > 0) {
        alertTitle = '导入失败';
        messageType = 'error';
      }
    } else {
      // 全部成功
      if (successCount === 0 && totalProcessed === 0) {
        // 这种情况可能是上传了空文件或文件内容无法处理
         detailMessages.push('未处理任何数据，请检查文件内容是否符合要求。');
         messageType = 'info';
      } else {
        detailMessages.push('所有数据均已成功导入！');
      }
    }
    alertMessage = detailMessages.join('<br>');

  } else {
    // 接口返回非预期结构或code非200
    alertTitle = '导入异常';
    messageType = 'error';
    alertMessage = `导入失败或服务器返回异常。 <br> 错误信息：${response.msg || '未知错误'}`;
    if (response && response.code) {
        alertMessage += ` (错误码: ${response.code})`;
    }
  }

  ElMessageBox.alert(
    `<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>${alertMessage}</div>`,
    alertTitle,
    {
      dangerouslyUseHTMLString: true,
      type: messageType, // 'success', 'warning', 'info', 'error'
      callback: () => { // 可选的回调，例如关闭后刷新列表
        emit('import-success', response); // 仍然触发事件，让父组件知道完成了
        // closeDialog(); // 可以考虑在这里关闭，或者由父组件决定
      }
    }
  );
  // closeDialog(); // 根据你的流程决定是否在这里关闭对话框
};
/**
 * @description 文件上传失败后的处理函数 (el-upload 的 on-error 钩子)。
 * @param {Error} error - 错误对象。
 * @param {object} file - 上传失败的文件对象。
 * @param {Array<object>} fileList - 当前上传的文件列表。
 */
const handleFileError = (error, file, fileList) => {
  isUploading.value = false;
  if (uploadRef.value) {
    uploadRef.value.clearFiles(); // 清空文件列表
  }
  console.error("文件上传错误:", error);
  let errorMessage = '文件上传失败';
  try {
    // el-upload 发生错误时，实际的错误信息可能在 error.message 中，并且可能是 JSON 字符串
    const errResponse = JSON.parse(error.message);
    errorMessage = errResponse.message || errResponse.msg || '文件上传失败，请稍后再试';
  } catch (e) {
    // 如果解析 JSON 失败，则使用通用错误消息
  }
  ElMessage.error(errorMessage);
};

/**
 * @description 文件选择超过限制时的处理函数 (el-upload 的 on-exceed 钩子)。
 * @param {Array<object>} files - 选择的文件列表。
 * @param {Array<object>} fileList - 当前的文件列表。
 */
function handleUploadExceed(files, fileList) {
  // 当选择的文件超过限制时的处理函数 (el-upload 的 on-exceed 钩子)
  ElMessage.warning(`只能上传 ${files.length} 个文件`);
  console.log('选择的文件超过限制:', files, fileList);
}

/**
 * @description 文件状态改变时的处理函数 (el-upload 的 @change 钩子)。
 * 主要用于调试，查看文件列表和状态。
 * @param {object} file - 当前改变状态的文件对象。
 * @param {Array<object>} fileList - 当前的文件列表。
 */
 const handleFileChange = (file, fileList) => {
  console.log('文件已选择或状态改变:', file, fileList);
  internalFileList.value = [...fileList]; // 更新我们自己维护的文件列表
  if (fileList.length > 0) {
    console.log('第一个文件的状态:', fileList[0].status);
  }
};

/**
 * @description 手动提交已选择的文件进行上传。
 */
 function submitFileForm() {
  if (internalFileList.value.length === 0) {
    ElMessage.warning('请先选择一个待上传的文件。');
    return;
  }

  // 检查是否有处于 'ready' 状态的文件
  const fileToUpload = internalFileList.value.find(f => f.status === 'ready');

  if (!fileToUpload) {
    ElMessage.warning('没有处于“待上传”状态的文件。可能文件已上传或状态异常。');
    // 可以打印 internalFileList.value 来查看每个文件的状态
    console.log('当前文件列表状态:', internalFileList.value.map(f => ({ name: f.name, status: f.status })));
    return;
  }

  // 仍然需要通过 ref 调用 el-upload 的 submit 方法
  if (uploadRef.value) {
    isUploading.value = true;
    uploadRef.value.submit(); // el-upload 会找到它内部 'ready' 状态的文件进行上传
  } else {
    ElMessage.error("el-upload 组件引用丢失，无法提交！");
  }
}

/**
 * @description 关闭导入对话框。
 * 通过 emit 'update:modelValue' 事件来通知父组件更新 v-model 绑定的值。
 */
function closeDialog() {
  emit('update:modelValue', false);
}

/**
 * @description 对话框关闭时的清理操作 (例如点击关闭按钮 'X' 或按下 ESC 键)。
 * 重置上传状态和已选文件。
 */
function handleCloseDialog() {
    if (isUploading.value) {
        // 可选: 如果文件正在上传，可以提示用户是否确认取消
        // ElMessageBox.confirm('文件正在上传中，确定要关闭吗？', '提示', { type: 'warning' })
        // .then(() => {
        //     if (uploadRef.value) uploadRef.value.abort(); // 如果 el-upload 支持，可以尝试中止上传
        //     isUploading.value = false;
        //     if (uploadRef.value) uploadRef.value.clearFiles();
        //     emit('update:modelValue', false);
        // })
        // .catch(() => {}); // 用户取消关闭
        // 为简单起见，这里只是提示，并重置状态。
        ElMessage.warning('文件正在上传，请稍候或取消上传。');
        // 注意: el-dialog 的 @close 事件是在对话框已经关闭后触发的。
        // 如果需要在关闭前进行严格控制 (例如阻止关闭)，应使用 :before-close 属性。
    }
    // 无论如何关闭，都重置组件状态
    isUploading.value = false;
    if (uploadRef.value) {
        uploadRef.value.clearFiles(); // 清空已选择的文件
    }
}

// 监听 props.modelValue (v-model 的值) 的变化
// 当对话框从外部被关闭时 (例如父组件直接将 v-model绑定的值设为 false)，也执行清理逻辑。
watch(() => props.modelValue, (newValue) => {
  if (!newValue) { // 如果 modelValue 变为 false (即对话框被关闭)
    handleCloseDialog(); // 调用统一的关闭处理逻辑
  }
});


</script>

<style scoped>
/* Add any component-specific styles here */
.el-upload__tip.text-center {
  text-align: center;
}
.el-upload__tip > .el-upload__tip { /* For the checkbox line */
  margin-bottom: 5px;
}
</style>