<template>
  <div class="app-container">
    <!-- 1. 查询区域  -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件名" prop="fileName">
        <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="原名" prop="originalName">
        <el-input v-model="queryParams.originalName" placeholder="请输入原名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="上传人" prop="createBy">
        <el-input v-model="queryParams.createBy" placeholder="请输入上传人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 2. 操作按钮行 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleUploadFile">上传文件</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 3. 数据表格 -->
    <el-table v-loading="loading" :data="ossList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件名" prop="fileName" align="center" show-overflow-tooltip />
      <el-table-column label="原名" prop="originalName" align="center" show-overflow-tooltip />
      <el-table-column label="文件后缀" prop="fileSuffix" align="center" />
      <el-table-column label="文件预览" align="center" prop="url">
        <template #default="{ row }">
          <ImagePreview v-if="isImage(row.fileSuffix)" :width="100" :height="100" :src="row.url" :preview-src-list="[row.url]" />
          <span v-else>{{ row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
      <el-table-column label="上传人" prop="createBy" align="center" />
      <el-table-column label="服务商" prop="service" align="center" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button link type="primary" icon="Download" @click="handleDownload(row)">下载</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 4. 上传文件对话框 -->
    <el-dialog :title="uploadDialog.title" v-model="uploadDialog.open" width="700px" append-to-body @close="cancelUpload">
      <el-form ref="uploadFormRef" :model="uploadForm" label-width="100px">
        <el-form-item label="上传路径">
          <el-input v-model="uploadForm.path" placeholder="请输入自定义上传路径 (可选)" />
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            :action="uploadUrl"
            :headers="{ token: getToken() }"
            :data="uploadForm"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-change="handleFileChange"
            :file-list="fileList"
            :auto-upload="false"
            :limit="1"
          >
            <template #trigger>
              <el-button type="primary">选取文件</el-button>
            </template>
          </el-upload>
        </el-form-item>
       <el-form-item label="文件URL" v-if="fileDownloadUrl">
        <div class="file-path">
          <span class="file-download">{{ fileDownloadUrl }}</span>
          <el-button
            ref="copyBtnRef"
            link
            type="primary"
            class="copy-btn"
            :data-clipboard-text="fileDownloadUrl"
          >
            复制
          </el-button>
          <!-- [!code focus--end] -->
        </div>
      </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelUpload">关闭</el-button>
          <el-button :loading="uploading" type="primary" @click="submitUpload">开始上传</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup >
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken } from '@/utils/auth';
import { listOss, delOss, uploadCustomPath } from '@/api/BasicSystem/FileUploading';
import Clipboard from 'clipboard'; //  引入 clipboard 库

const { proxy } = getCurrentInstance();

// --- State ---
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const ossList = ref([]);
const dateRange = ref([]);
const ids = ref([]);

// Upload URL
const baseApi = import.meta.env.VITE_APP_BASE_API;
const uploadUrl = baseApi + "/ocean-support/file/uploadCustomPath";

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  fileName: undefined,
  originalName: undefined,
  createBy: undefined,
});

const uploadDialog = reactive({
  open: false,
  title: '',
});

const uploadForm = reactive({
  path: '',
});

const fileList = ref([]);
const fileDownloadUrl = ref('');
let clipboardInstance = null; // [!code ++] <<< 用于存放 clipboard 实例
const uploading = ref(false);

// Refs
const queryFormRef = ref(null);
const uploadRef = ref(null);
const uploadFormRef = ref(null);
const copyBtnRef = ref(null); // [!code ++] <<< 为复制按钮创建一个 ref



// --- Methods ---

function getList() {
  loading.value = true;
  const params = proxy.addDateRange({ ...queryParams }, dateRange.value, 'CreateTime');
  // listOss(params).then(response => {
  //   ossList.value = response.rows;
  //   total.value = response.total;
  //   loading.value = false;
  // });
}

function isImage(fileSuffix) {
  if (!fileSuffix) return false;
  const imageSuffixes = ["png", "jpg", "jpeg", "gif", "bmp"];
  return imageSuffixes.includes(fileSuffix.toLowerCase());
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function resetQuery() {
  dateRange.value = [];
  queryFormRef.value?.resetFields();
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ossId);
  multiple.value = !selection.length;
}

function handleUploadFile() {
  uploadDialog.title = "上传文件";
  uploadDialog.open = true;
}

async function handleDelete(row) {
  const ossIds = row.ossId ? [row.ossId] : ids.value;
  try {
    await ElMessageBox.confirm(`是否确认删除OSS对象存储编号为 "${ossIds.join(',')}" 的数据项?`, "确认删除", { type: 'warning' });
    loading.value = true;
    await delOss(ossIds.join(','));
    getList();
    ElMessage.success("删除成功");
  } catch(e) {
    if (e !== 'cancel') console.error(e);
  } finally {
    loading.value = false;
  }
}

function handleDownload(row) {
    // 使用 a 标签下载
    proxy.download(row.url, {}, row.originalName);
}

// --- Upload Dialog Methods ---
function cancelUpload() {
  uploadDialog.open = false;
  fileList.value = [];
  uploadForm.path = '';
  fileDownloadUrl.value = '';
  uploadRef.value?.clearFiles();
}

function handleFileChange(file, updatedFileList) {
  if (updatedFileList.length > 1) {
    updatedFileList.shift();
  }
  fileList.value = updatedFileList;
  fileDownloadUrl.value = ''; // 清空上次的URL
}

function submitUpload() {
  if (fileList.value.length === 0) {
    return ElMessage.warning("请先选取文件");
  }
  uploading.value = true;
  // el-upload 的 submit 方法会触发表单的 action
  uploadRef.value?.submit();
}

function handleUploadSuccess(res, file, updatedFileList) {
  uploading.value = false;
  if (res.code === 200 || res.code === 0) { // 兼容不同的成功码
    fileDownloadUrl.value = baseApi + res.data.url;
    ElMessage.success("上传成功");
    getList(); // 刷新列表
  } else {
    ElMessage.error(res.msg || res.message || "上传失败");
  }
}

function handleUploadError(err, file, updatedFileList) {
  uploading.value = false;
  ElMessage.error("上传失败: " + (err.message || '未知错误'));
}

async function handleCopyUrl() {
  if (!fileDownloadUrl.value) return;
  try {
    await toClipboard(fileDownloadUrl.value);
    ElMessage.success("URL已复制到剪贴板");
  } catch (e) {
    ElMessage.error("复制失败");
  }
}

onMounted(() => {
  getList();

  // 使用 nextTick 确保按钮 DOM 已经渲染
  nextTick(() => {
    // 初始化 Clipboard.js
    clipboardInstance = new Clipboard(copyBtnRef.value.$el); // 注意：对于 el-button，需要访问 .$el

    // 监听成功事件
    clipboardInstance.on('success', (e) => {
      ElMessage.success("URL已复制到剪贴板");
      e.clearSelection(); // 清除文本选中状态
    });

    // 监听失败事件
    clipboardInstance.on('error', (e) => {
      ElMessage.error("复制失败，请手动复制");
    });
  });
});
</script>

<style lang="scss" scoped>
.file-path {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  height: 32px;
  line-height: 32px;

  .file-download {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #495057;
  }
  .copy {
    margin-left: 10px;
  }
}
</style>