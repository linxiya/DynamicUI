
<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- WEB 页面配置 -->
      <el-tab-pane label="WEB页面配置" name="web">
        <div v-loading="loading" class="config-form-container">
          <el-form :model="webForm" label-width="200px">
            <el-divider content-position="left">系统主界面</el-divider>
            <el-row>
              <el-col :span="12">
                <el-form-item label="产品线名称">
                  <el-input v-model="webForm.systemProductLineName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="欢迎主题">
                  <el-input v-model="webForm.systemThemeContent" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="菜单栏 Logo">
                  <ImageUploadField v-model="webForm.systemMenuLogoImage" />
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="背景图片">
                  <ImageUploadField v-model="webForm.systemBackgroundImage" />
                </el-form-item>
              </el-col> -->
            </el-row>

            <el-divider content-position="left">登录页</el-divider>
            <el-row>
              <el-col :span="12">
                <el-form-item label="版权名称">
                  <el-input v-model="webForm.loginCopyrightName" />
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="产品线名称">
                  <el-input v-model="webForm.loginProductLineName" />
                </el-form-item>
              </el-col> -->
              <el-col :span="12">
                <el-form-item label="值班电话">
                  <el-input v-model="webForm.loginDutyTelephone" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="背景图片">
                  <ImageUploadField v-model="webForm.loginBackgroundImage" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Logo">
                  <ImageUploadField v-model="webForm.loginLogoImage" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="主题图片">
                  <ImageUploadField v-model="webForm.loginThemeImage" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-divider />
            <el-form-item>
              <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 移动端页面配置 -->
      <el-tab-pane label="移动端页面配置" name="pda">
        <div v-loading="loading" class="config-form-container">
            <el-form :model="pdaForm" label-width="200px">
                <el-divider content-position="left">登录页</el-divider>
                 <el-row>
                    <el-col :span="12">
                        <el-form-item label="版权名称">
                            <el-input v-model="pdaForm.loginCopyrightName" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="产品线名称">
                            <el-input v-model="pdaForm.loginProductLineName" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="值班电话">
                            <el-input v-model="pdaForm.loginDutyTelephone" />
                        </el-form-item>
                    </el-col>
                 </el-row>
                <el-divider />
                <el-form-item>
                    <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
                </el-form-item>
            </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup name="PageConfiguration">
import { ElMessageBox, ElMessage } from 'element-plus';
import useConfigurationStore  from '@/store/modules/configuration';
import ImageUploadField from '@/components/ImageUploadField/index.vue';

const configStore = useConfigurationStore();

const activeTab = ref('web');
const loading = ref(true); // 初始为 true，表示正在加载
const saving = ref(false);


// --- 创建组件本地的表单状态 ---
// 这是用户编辑的“草稿”，它与 Pinia store 是分离的
const webForm = reactive({});
const pdaForm = reactive({});

// --- 新增一个状态，记录每个 Tab 是否已被加载过 ---
const loadedTabs = reactive({
  web: false,
  pda: false,
});


// --- loadConfig 的职责是：从 store 获取数据，并“重置”本地表单 ---
async function loadConfig(type, force = false) {
  const targetForm = type === 1 ? webForm : pdaForm;
  const tabName = type === 1 ? 'web' : 'pda';

  // 只有在首次加载该 Tab，或者需要强制刷新时，才从 Store 获取数据
  if (!loadedTabs[tabName] || force) {
    loading.value = true;
    try {
      const configFromStore = await configStore.fetchConfig(type);
      
      // 使用 Object.assign 填充数据，不清空
      Object.assign(targetForm, JSON.parse(JSON.stringify(configFromStore)));
      
      // 标记该 Tab 已被加载
      loadedTabs[tabName] = true;
    } finally {
      loading.value = false;
    }
  }
}


function handleTabChange(tabName) {
  const type = tabName === 'web' ? 1 : 2;
  loadConfig(type);
}

// --- handleSave 的职责是：将本地表单的数据提交给 store ---
async function handleSave() {
  await ElMessageBox.confirm("确定要保存当前配置吗?", "提示", { type: "warning" });
  
  saving.value = true;
  try {
    const type = activeTab.value === 'web' ? 1 : 2;
    // 获取当前激活的本地表单数据
    const formData = activeTab.value === 'web' ? webForm : pdaForm;

    // 调用 store 的 action 来处理保存逻辑
    await configStore.updateConfiguration(type, formData);
    
    ElMessage.success("配置保存成功！");
  } finally {
    saving.value = false;
  }
}


onMounted(() => {
  // 组件挂载时，加载 WEB 端的配置到本地表单
  loadConfig(1);
});
</script>

<style lang="scss" scoped>
.config-form-container {
  padding: 20px;
}
.el-form-item {
    margin-bottom: 22px;
}
.el-col {
    padding-right: 20px;
}
</style>