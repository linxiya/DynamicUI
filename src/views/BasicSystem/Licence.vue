<template>
  <div class="app-container">
    <el-card class="box-card">
      <!-- 卡片头部，包含标题和上传按钮 -->
      <template #header>
        <div class="card-header">
          <span>许可证书</span>
          <!-- 
            el-upload 组件用于文件上传
            :http-request="handleUpload" 自定义了上传行为，覆盖默认的 action
            :show-file-list="false" 不显示已上传的文件列表
            :auto-upload="true" 选择文件后自动上传
           -->
          <el-upload
            :http-request="handleUpload"
            :show-file-list="false"
            :auto-upload="true"
          >
            <el-button type="primary" :loading="isUploading">上传证书</el-button>
          </el-upload>
        </div>
      </template>

      <!-- 
        使用 el-descriptions 组件来展示描述性信息
        :column="2" 设置为两列表格
        border 添加边框
      -->
      <el-descriptions :column="2" border>
        <!-- 证书时间 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Tickets /></el-icon>
              <span>证书时间</span>
            </div>
          </template>
          <!-- 使用 v-loading 指令在数据加载时显示加载动画 -->
          <div v-loading="loading.expiration" class="description-content">
            {{ expiration }}
          </div>
        </el-descriptions-item>

        <!-- 设备信息 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Iphone /></el-icon>
              <span>设备信息</span>
            </div>
          </template>
          <div v-loading="loading.deviceJson" class="description-content">
            {{ deviceJson }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup name="Licence">
import { ElMessage } from 'element-plus';
import { Tickets, Iphone } from '@element-plus/icons-vue';

// 引入您的 API 函数
import { getExpiration, getDeviceJson, register } from "@/api/BasicSystem/Licence";

// --- 响应式状态定义 ---

// 证书到期时间
const expiration = ref("正在获取...");
// 设备信息 JSON 字符串
const deviceJson = ref("正在获取...");
// 控制上传按钮的加载状态
const isUploading = ref(false);
// 分别控制各个数据项的加载状态，提供更精细的用户体验
const loading = reactive({
  expiration: true,
  deviceJson: true,
});

// --- 方法定义 ---

/**
 * @description 获取并设置证书到期时间。
 * @async
 */
async function fetchExpiration() {
  loading.expiration = true;
  try {
    const res = await getExpiration();
    // 假设成功的响应 res.data.data 包含了时间字符串
    expiration.value = res.data.data;
  } catch (err) {
    // 捕获错误，并从错误对象中尝试提取后端返回的错误信息
    expiration.value = err?.data?.data || "获取失败，请检查网络或联系管理员";
    console.error("获取证书时间失败:", err);
  } finally {
    loading.expiration = false;
  }
}

/**
 * @description 获取并设置设备信息。
 * @async
 */
async function fetchDeviceJson() {
  loading.deviceJson = true;
  try {
    const res = await getDeviceJson();
    deviceJson.value = res.data.data;
  } catch (err) {
    deviceJson.value = "获取失败，请检查网络或联系管理员";
    console.error("获取设备信息失败:", err);
  } finally {
    loading.deviceJson = false;
  }
}

/**
 * @description 处理 el-upload 的自定义上传请求。
 * @param {object} options - el-upload 传递的参数对象，包含 file 文件对象。
 * @async
 */
async function handleUpload(options) {
  const file = options.file;
  if (!file) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append("license", file); // 键名 "license" 与您旧代码保持一致

  try {
    // 调用注册/上传证书的 API
    await register(formData);
    ElMessage.success("证书上传成功！页面将刷新以应用新证书。");

    // 上传成功后，延迟一小段时间然后刷新页面，以便新的证书信息生效
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (err) {
    // API 请求失败时，ElMessage 会通过 axios 拦截器自动弹出错误提示
    console.error("证书上传失败:", err);
  } finally {
    isUploading.value = false;
  }
}

// --- 生命周期钩子 ---

// onMounted 会在组件挂载到 DOM 后执行
onMounted(() => {
  // 并行发起两个请求，提高加载效率
  fetchExpiration();
  fetchDeviceJson();
});
</script>

<style lang="scss" scoped>
/* 使用 scoped 来确保样式只作用于当前组件 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell-item {
  display: flex;
  align-items: center;
  gap: 8px; /* 使用 gap 属性创建图标和文字之间的间距 */
}

.description-content {
  min-height: 24px; /* 给内容一个最小高度，避免加载时布局跳动 */
}
</style>