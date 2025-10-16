<template>
  <fullscreen-dialog
    :close-on-click-modal="false"
    :title="dialogTitle"
    draggable
    :model-value="visible"
    @update:modelValue="emit('update:visible', $event)"
    width="80%"
    center
    @close="handleClose"
    append-to-body
  >
    <div class="transferForm">
      <el-form
        ref="transferFormRef"
        :model="currentOrg"
        label-width="80px"
        :inline="true"
      >
        <el-form-item label="组织名称">
          <el-input
            maxlength="100"
            v-model="currentOrg.orgName"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="组织描述">
          <el-input
            maxlength="100"
            v-model="currentOrg.orgDesc"
            disabled
          ></el-input>
        </el-form-item>
      </el-form>

      <el-row :gutter="20" >
        <!-- 未绑定用户列 -->
        <el-col :span="11">
          <div style="font-weight: bold;text-align: center;" >未绑定用户</div>
          <el-form
            inline
            label-width="80px"
            :model="searchUnboundForm"
            style="height: 120px"
          >
            <el-form-item label="用户编码" >
              <el-input
                maxlength="100"
                v-model="searchUnboundForm.userCode"
                @keyup.enter="fetchUnboundUsers"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="用户名称">
              <el-input
                maxlength="100"
                v-model="searchUnboundForm.userName"
                @keyup.enter="fetchUnboundUsers"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item >
              <el-button type="primary" @click="fetchUnboundUsers(1)" icon="Search">查询</el-button>
            </el-form-item>
            
          </el-form>
          
          <el-table
            ref="unboundTableRef"
            v-loading="loadingUnbound"
            :data="unboundUserList"
            border
            fit
            highlight-current-row
            @selection-change="handleUnboundSelectionChange"
            height="300"
            :row-key="getRowKey"
          >
            <el-table-column
              align="center"
              type="selection"
              :reserve-selection="true"
              :selectable="isUserSelectable"
              width="55"
            ></el-table-column>
            <el-table-column
              label="用户编码"
              align="center"
              prop="userCode"
            ></el-table-column>
            <el-table-column
              label="用户名称"
              align="center"
              prop="userName"
            ></el-table-column>
          </el-table>

           <!-- 分页 -->
           <Pagination
            v-show="paginationUnbound.total > 0"
            :total="paginationUnbound.total"
            v-model:page="paginationUnbound.startPage"
            v-model:limit="paginationUnbound.pageSize"
            @pagination="fetchUnboundUsers"
          />
        </el-col>

        <!-- 操作按钮列 -->
        <el-col :span="2" style="padding-top: 150px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <el-button
            @click="addSelectedUsers"
            type="primary"
            :disabled="selectedUnboundUsers.length === 0"
            icon="ArrowRightBold"
            circle
            title="添加选中用户"
          ></el-button>
          <el-button
            @click="removeSelectedUsers"
            type="primary"
            style="margin: 0;"
            :disabled="selectedBoundUsers.length === 0"
            icon="ArrowLeftBold"
            circle
            title="移除选中用户"
          ></el-button>
        </el-col>

        <!-- 已绑定用户列 -->
        <el-col :span="11">
          <div style="font-weight: bold;text-align: center;" >已绑定用户</div>
           <div style="height: 80px; "> <!-- 占位，与左侧表单对齐 -->
           </div>
           <paging-com
            :list="boundUserList"
            :dialogOpen="visible"
            >
            <template #btn>
            </template>
            <template #actions="{ pagingList }">
            <el-table
              ref="boundTableRef"
              v-loading="loadingBound"
              :data="pagingList"
              border
              fit
              highlight-current-row
              @selection-change="handleBoundSelectionChange"
              height="300"
              :row-key="getRowKey"
            >
              <el-table-column
                align="center"
                type="selection"
                :reserve-selection="true"
                width="55"
              ></el-table-column>
              <el-table-column
                label="用户编码"
                align="center"
                prop="userCode"
              >
            </el-table-column>
              <el-table-column
                label="用户名称"
                align="center"
                prop="userName"
              ></el-table-column>
            </el-table>
          </template>
           </paging-com>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <div style="text-align: center; margin-bottom: 0">
        <el-button  @click="closeDialog">取消</el-button>
        <el-button v-hasButton="'Organization_addUser'" type="primary" @click="handleSaveBinding" :loading="saving">保存</el-button>
      </div>
    </template>
  </fullscreen-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { isAllEmpty } from "@/utils/validate"
import { camelToSnakeCase } from '@/utils/index'; // 工具函数：将驼峰命名字符串转换为下划线命名
import { getList } from "@/api/BasicSystem/SysUser"; // 用于获取用户列表
import { binduserOrgs } from "@/api/BaseData/EnterpriseBase/Organization";     // 用于保存绑定关系

// Props 定义
const props = defineProps({
  visible: { // v-model:visible
    type: Boolean,
    default: false,
  },
  organizationData: { // 传入的当前组织信息
    type: Object,
    default: () => ({}),
  },
  dialogTitle: {
    type: String,
    default: '用户组织维护'
  }
});

// Emits 定义
const emit = defineEmits(['update:visible', 'binding-success']);

// Refs
const transferFormRef = ref(null);
const unboundTableRef = ref(null);
const boundTableRef = ref(null);

// 当前操作的组织信息
const currentOrg = reactive({
  orgId: null,
  orgName: '',
  orgDesc: '',
});

const initialSearchUnboundFormState = {
  userCode: '',
  userName: '',
  // ...其他字段的初始值
};

// 未绑定用户搜索表单
const searchUnboundForm = reactive({ ...initialSearchUnboundFormState });

// 未绑定用户列表和分页
const unboundUserList = ref([]);
const loadingUnbound = ref(false);
const paginationUnbound = reactive({
  startPage: 1,
  pageSize: 10,
  total: 0,
});

// 已绑定用户列表
const boundUserList = ref([]);
const loadingBound = ref(false);
// 已绑定用户通常一次性加载，如果需要分页，也需要类似 paginationUnbound 的结构

// 选中项
const selectedUnboundUsers = ref([]); // 左侧选中的用户
const selectedBoundUsers = ref([]);   // 右侧选中的用户

const saving = ref(false);

// 获取行数据的key，用于 el-table 的 row-key，确保跨页选择时能正确保留
const getRowKey = (row) => {
  return row.userId;
};

// 判断用户是否可选 (避免在未绑定列表中选择已绑定的用户)
const isUserSelectable = (row) => {
  return !boundUserList.value.some(boundUser => boundUser.userId === row.userId);
};

// 获取未绑定用户列表
async function fetchUnboundUsers(page = 0) {
  if (!currentOrg.orgId) return;
  if (page === 1) paginationUnbound.startPage = 1;

  loadingUnbound.value = true;
  const queryParams = {}; // 用来构建 params.query 的对象

  // 使用 for...in 循环遍历 searchUnboundForm 的属性
  for (const key in searchUnboundForm) {
    // 使用 Object.prototype.hasOwnProperty.call 确保是对象自身的属性 (好习惯，虽然对 reactive 对象通常不是大问题)
    if (Object.prototype.hasOwnProperty.call(searchUnboundForm, key)) {
      const value = searchUnboundForm[key]; // 获取属性值
      if (!isAllEmpty(value)) {
        queryParams[key] = { // 使用原始的 key (如 'userCode') 作为 queryParams 的键
          fieldName: camelToSnakeCase(key), // 将驼峰键名转为下划线 (如 'user_code')
          queryType: "8", //  "8" 代表 "模糊" 查询
          joinQuery: "1", // "1" 代表 "AND"
          value: String(value), // 确保值为字符串 (API 可能期望字符串)
        };
      }
    }
  }

  const params = {
    startPage: paginationUnbound.startPage,
    pageSize: paginationUnbound.pageSize,
    orgId: currentOrg.orgId,
    searchType: 2,
    query: queryParams, // 将构建好的 queryParams 赋值给 params.query
  };

  try {
    const res = await getList(params);
    unboundUserList.value = res.data || [];
    paginationUnbound.total = res.count || 0;
  } catch (error) {
    unboundUserList.value = [];
    paginationUnbound.total = 0;
  } finally {
    loadingUnbound.value = false;
  }
}


// 获取已绑定用户列表
async function fetchBoundUsers() {
  if (!currentOrg.orgId) return;
  loadingBound.value = true;
  try {
    const res = await getList({
      startPage: 1,
      pageSize: 99999, // 一次性加载所有已绑定用户
      status: 1,
      orgId: currentOrg.orgId,
      searchType: 1, // 假设 searchType=1 表示查询已绑定到此 orgId 的用户
    });
    boundUserList.value = res.data || [];
  } catch (error) {
    boundUserList.value = [];
  } finally {
    loadingBound.value = false;
  }
}

// 处理左侧（未绑定）列表选择变化
function handleUnboundSelectionChange(selection) {
  selectedUnboundUsers.value = selection;
}

// 处理右侧（已绑定）列表选择变化
function handleBoundSelectionChange(selection) {
  selectedBoundUsers.value = selection;
}

// 添加选中用户到已绑定列表
function addSelectedUsers() {
  selectedUnboundUsers.value.forEach(userToAdd => {
    // 检查是否已存在于已绑定列表，避免重复添加
    if (!boundUserList.value.some(boundUser => boundUser.userId === userToAdd.userId)) {
      boundUserList.value.push({ ...userToAdd }); // 添加副本
    }
  });
  // 清空左侧选择，并让表格重新计算 selectable
  unboundTableRef.value?.clearSelection();
  selectedUnboundUsers.value = [];
  // 可选：从左侧列表中移除已添加的项，但这会使“查询未绑定用户”的逻辑更复杂
  // 这里选择不直接移除，而是通过 isUserSelectable 禁用它们
}

// 从已绑定列表移除选中用户
function removeSelectedUsers() {
  const idsToRemove = selectedBoundUsers.value.map(user => user.userId);
  boundUserList.value = boundUserList.value.filter(user => !idsToRemove.includes(user.userId));
  // 清空右侧选择
  boundTableRef.value?.clearSelection();
  selectedBoundUsers.value = [];
  // 左侧表格可能需要重新渲染以更新 selectable 状态，或者手动触发
  // unboundTableRef.value?.doLayout(); // 可能需要强制更新
}

// 保存绑定关系
async function handleSaveBinding() {
  if (!currentOrg.orgId) {
    ElMessage.warning('组织信息丢失，无法保存！');
    return;
  }
  saving.value = true;
  const userIdsToBind = boundUserList.value.map(user => user.userId);
  try {
    await binduserOrgs(currentOrg.orgId, userIdsToBind);
    emit('binding-success');
    closeDialog();
  } catch (error) {
    console.error("保存绑定关系失败:", error);
  } finally {
    saving.value = false;
  }
}



// 关闭对话框
function closeDialog() {
  emit('update:visible', false);
}

// 对话框关闭时的清理
function handleClose() {
  // 重置状态，可选
  Object.assign(searchUnboundForm, initialSearchUnboundFormState)
  unboundUserList.value = [];
  boundUserList.value = [];
  selectedUnboundUsers.value = [];
  selectedBoundUsers.value = [];
  paginationUnbound.startPage = 1;
  paginationUnbound.total = 0;
  unboundTableRef.value?.clearSelection();
  boundTableRef.value?.clearSelection();
}

// 监听 props.visible，当对话框显示时加载数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.organizationData && props.organizationData.orgId) {
      currentOrg.orgId = props.organizationData.orgId;
      currentOrg.orgName = props.organizationData.orgName || '';
      currentOrg.orgDesc = props.organizationData.orgDesc || '';
      // 使用 nextTick 确保 DOM 更新后再请求数据，或直接请求
      nextTick(() => {
        fetchBoundUsers();
        fetchUnboundUsers(1); // 传入1重置分页
      });
    } else {
      ElMessage.warning('未获取到有效的组织信息！');
      closeDialog();
    }
  }
});

</script>
