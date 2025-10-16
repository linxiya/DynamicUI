
<template>
  <fullscreen-dialog
    :close-on-click-modal="false"
    title="角色维护"
    draggable
    v-model="dialogVisible"
    width="80%"
    center
    @close="handleClose"
    append-to-body
  >
    <el-form ref="transferFormRef" :model="transferForm" label-width="80px" :inline="true">
      <el-form-item label="角色名称">
        <el-input maxlength="100" v-model="transferForm.roleName" disabled />
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input maxlength="100" v-model="transferForm.roleDesc" disabled />
      </el-form-item>
    </el-form>

    <el-tabs v-model="activeTabName" type="card">
      <!-- 绑定用户 Tab -->
      <el-tab-pane label="绑定用户" name="bindUser">
        <el-row :gutter="20">
          <!-- 未绑定用户列 -->
          <el-col :span="11">
             <div style="font-weight: bold;text-align: center;" >未绑定用户</div>
            <el-form inline :model="searchUnboundForm" style="margin-top: 10px;">
              <el-form-item label="用户编码">
                <el-input v-model="searchUnboundForm.userCode" @keyup.enter="fetchUnboundUsers(1)" clearable />
              </el-form-item>
              <el-form-item label="用户名称">
                <el-input v-model="searchUnboundForm.userName" @keyup.enter="fetchUnboundUsers(1)" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchUnboundUsers(1)" icon="Search">查询</el-button>
              </el-form-item>
            </el-form>
            <el-table ref="unboundTableRef" v-loading="loadingUnbound" :data="unboundUserList" border height="350" :row-key="getRowKey" @selection-change="handleUnboundSelectionChange">
              <el-table-column type="selection" :reserve-selection="true" width="55" :selectable="isUserSelectable"/>
              <el-table-column label="用户编码" prop="userCode" />
              <el-table-column label="用户名称" prop="userName" />
            </el-table>
            <Pagination v-show="paginationUnbound.total > 0" :total="paginationUnbound.total" v-model:page="paginationUnbound.startPage" v-model:limit="paginationUnbound.pageSize" @pagination="fetchUnboundUsers" />
          </el-col>

          <!-- 操作按钮列 -->
          <el-col :span="2" style="padding-top: 150px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <el-button @click="addSelectedUsers" type="primary" :disabled="selectedUnboundUsers.length === 0" icon="ArrowRightBold" circle title="添加选中用户" />
            <el-button @click="removeSelectedUsers" type="primary" style="margin: 0;" :disabled="selectedBoundUsers.length === 0" icon="ArrowLeftBold" circle title="移除选中用户" />
          </el-col>

          <!-- 已绑定用户列 -->
          <el-col :span="11">
             <div style="font-weight: bold;text-align: center;" >已绑定用户</div>
            <paging-com :list="boundUserList" :dialogOpen="visible" style="margin-top: 66px;">
              <template #actions="{ pagingList }">
                <el-table ref="boundTableRef" :data="pagingList" border height="350" :row-key="getRowKey" @selection-change="handleBoundSelectionChange">
                  <el-table-column type="selection" :reserve-selection="true" width="55" />
                  <el-table-column label="用户编码" prop="userCode" />
                  <el-table-column label="用户名称" prop="userName" />
                </el-table>
              </template>
            </paging-com>
          </el-col>
        </el-row>
        <div style="text-align: center; margin-top: 20px;">
          <el-button @click="closeDialog">取消</el-button>
          <el-button v-hasButton="'SysRole_bindingUser'" type="primary" @click="saveUserBinding" :loading="saving">保存</el-button>
        </div>
      </el-tab-pane>

      <!-- 功能权限 Tab -->
      <el-tab-pane label="功能权限" name="functionPerm">
         <el-form :inline="true">
            <el-form-item label="权限所属平台" label-width="110px">
              <el-select v-model="menuType" @change="fetchFunctionPermissions">
                <el-option label="Windows" :value="1"></el-option>
                <el-option label="WEB" :value="2"></el-option>
                <el-option label="PDA" :value="3"></el-option>
                <el-option label="安卓其他设备" :value="4"></el-option>
              </el-select>
            </el-form-item>
         </el-form>
        <el-scrollbar height="400px" style="border: 1px solid #e5e7eb; border-radius: 4px;">
            <el-tree
              ref="funcTreeRef"
              :data="funcTreeData"
              show-checkbox
              node-key="menuId"
              :props="{ children: 'sysMenuinList', label: 'menuName' }"
            />
        </el-scrollbar>
        <div style="text-align: center; margin-top: 20px;">
          <el-button @click="closeDialog">取消</el-button>
          <el-button v-hasButton="'SysRole_permission'" type="primary" @click="saveFunctionPermissions" :loading="saving">保存</el-button>
        </div>
      </el-tab-pane>

      <!-- 数据权限 Tab -->
      <el-tab-pane label="数据权限" name="dataPerm">
        <el-form label-width="100px">
          <el-form-item label="权限范围">
            <el-select v-model="transferForm.dataScope" placeholder="请选择">
              <el-option label="全部数据权限" :value="1" />
              <el-option label="指定部门数据权限" :value="2" />
              <el-option label="所在部门数据权限" :value="3" />
              <el-option label="所在部门及以下数据权限" :value="4" />
              <el-option label="仅本人数据" :value="5" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-scrollbar v-if="transferForm.dataScope === 2" height="350px" style="border: 1px solid #e5e7eb; border-radius: 4px;">
            <el-tree
              ref="dataTreeRef"
              :data="dataTreeData"
              show-checkbox
              node-key="deptId"
              default-expand-all
              :props="{ children: 'depts', label: 'deptName' }"
            />
        </el-scrollbar>
        <div style="text-align: center; margin-top: 20px;">
          <el-button @click="closeDialog">取消</el-button>
          <el-button v-hasButton="'SysRole_assignRoleDataPerm'" type="primary" @click="saveDataPermissions" :loading="saving">保存</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </fullscreen-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import {
  bindRoleUser,
  updateBatch as saveRoleMenu,
  assignRoleDataPerm
} from "@/api/BasicSystem/SysRole";
import {
  getList as searchUserRoles,
} from "@/api/BasicSystem/SysUser";
import { getListAll as getMenuinfoAll} from "@/api/BasicSystem/Menuinfo";
// import { getDept } from "@/api/BaseData/EnterpriseBase/Organization";
// import { dataTree } from "@/utils/index.js";
function dataTree(arr) {
    arr.forEach(item => {
        Object.assign(item, JSON.parse(JSON.stringify(item.sysMenuInfoDto)));
        delete item.sysMenuInfoDto;
        if (item.sysMenuinList) {
            dataTree(item.sysMenuinList);
        }
    });
    return arr;
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  roleData: { type: Object, default: () => ({}) },
});

// --- 创建一个本地的、可写的 computed 属性 ---
const dialogVisible = computed({
  // get 方法返回父组件传递过来的 prop 值
  get() {
    return props.visible;
  },
  // set 方法在子组件（fullscreen-dialog）尝试更新值时被调用
  set(value) {
    // 不直接修改 prop，而是通过 emit 事件通知父组件去更新
    emit('update:visible', value);
  }
});

const emit = defineEmits(['update:visible', 'binding-success']);

// Refs
const transferFormRef = ref(null);
const unboundTableRef = ref(null);
const boundTableRef = ref(null);
const funcTreeRef = ref(null);
const dataTreeRef = ref(null);

const { proxy } = getCurrentInstance();

// State
const saving = ref(false);
const activeTabName = ref('bindUser');
const transferForm = ref({});
const menuType = ref(2); // 默认WEB

// 用户绑定相关
const loadingUnbound = ref(false);
const unboundUserList = ref([]);
const boundUserList = ref([]);
const selectedUnboundUsers = ref([]);
const selectedBoundUsers = ref([]);
const searchUnboundForm = reactive({ userCode: '', userName: '' });
const paginationUnbound = reactive({ startPage: 1, pageSize: 10, total: 0 });

// 判断用户是否可选 (避免在未绑定列表中选择已绑定的用户)
const isUserSelectable = (row) => {
  return !boundUserList.value.some(boundUser => boundUser.userId === row.userId);
};

// 功能权限相关
const funcTreeData = ref([]);

// 数据权限相关
const dataTreeData = ref([]);

// --- 核心方法 ---

// 获取未绑定用户
async function fetchUnboundUsers(page = 0) {
  if (page === 1) paginationUnbound.startPage = 1;
  loadingUnbound.value = true;
  try {
    const res = await searchUserRoles({
      startPage: paginationUnbound.startPage,
      pageSize: paginationUnbound.pageSize,
      roleId: transferForm.value.roleId,
      userCode: searchUnboundForm.userCode,
      userName: searchUnboundForm.userName,
    });
    unboundUserList.value = res.data;
    paginationUnbound.total = res.count;
  } finally {
    loadingUnbound.value = false;
  }
}

// 获取已绑定用户
async function fetchBoundUsers() {
  const res = await searchUserRoles({
    startPage: 1, pageSize: 99999, roleId: transferForm.value.roleId, searchType: 1
  });
  boundUserList.value = res.data;
}

// 获取功能权限树
async function fetchFunctionPermissions() {
  const res = await getMenuinfoAll({ menuType: menuType.value, roleId: transferForm.value.roleId });
  funcTreeData.value = dataTree(res.data);
  
  // 递归函数，找出所有已授权的叶子节点ID
  const getCheckedKeys = (nodes) => {
    let keys = [];
    nodes.forEach(node => {
        if (node.roles && node.roles.length > 0 && node.roles.some(r => r.roleId === transferForm.value.roleId)) {
            if (!node.sysMenuinList || node.sysMenuinList.length === 0) { // 是叶子节点
                keys.push(node.menuId);
            }
        }
        if (node.sysMenuinList) {
            keys = keys.concat(getCheckedKeys(node.sysMenuinList));
        }
    });
    return keys;
  };
  
  const checkedKeys = getCheckedKeys(funcTreeData.value);
  
  nextTick(() => {
    funcTreeRef.value?.setCheckedKeys(checkedKeys, false);
  });
}

// 获取数据权限树
async function fetchDataPermissions() {
    // const res = await getDept({ pageSize: 99999 });
    // dataTreeData.value = res.data;
    // nextTick(() => {
    //     const checkedKeys = transferForm.value.dataScopeDeptIds ? String(transferForm.value.dataScopeDeptIds).split(',') : [];
    //     dataTreeRef.value?.setCheckedKeys(checkedKeys, false);
    // });
}


// --- 事件处理器和辅助函数 ---

const getRowKey = (row) => row.userId;
const handleUnboundSelectionChange = (selection) => selectedUnboundUsers.value = selection;
const handleBoundSelectionChange = (selection) => selectedBoundUsers.value = selection;

const addSelectedUsers = () => {
  selectedUnboundUsers.value.forEach(user => {
    if (!boundUserList.value.some(bound => bound.userId === user.userId)) {
      boundUserList.value.push(user);
    }
  });
  unboundTableRef.value?.clearSelection();
};

const removeSelectedUsers = () => {
  const idsToRemove = selectedBoundUsers.value.map(u => u.userId);
  boundUserList.value = boundUserList.value.filter(u => !idsToRemove.includes(u.userId));
  boundTableRef.value?.clearSelection();
};

const saveUserBinding = async () => {
  saving.value = true;
  try {
    const userIds = boundUserList.value.map(u => u.userId);
    await bindRoleUser(transferForm.value.roleId, userIds);
    ElMessage.success("用户绑定成功！");
    emit('binding-success');
  } finally {
    saving.value = false;
  }
};

const saveFunctionPermissions = async () => {
    saving.value = true;
    try {
        const checkedNodes = funcTreeRef.value.getCheckedNodes(false, true); // 获取所有选中节点（包括半选的父节点）
        const menuRoleDTOs = checkedNodes.map(node => ({
            roleId: transferForm.value.roleId,
            menuId: node.menuId,
        }));
        if(menuRoleDTOs.length === 0) {
            menuRoleDTOs.push({roleId: transferForm.value.roleId, menuId: 0});
        }
        await saveRoleMenu( menuType.value, menuRoleDTOs);
        ElMessage.success("功能权限保存成功！");
        emit('binding-success');
    } finally {
        saving.value = false;
    }
};

const saveDataPermissions = async () => {
    saving.value = true;
    try {
        let deptIds = '';
        if (transferForm.value.dataScope === 2) {
            deptIds = dataTreeRef.value.getCheckedKeys(false, true).join(',');
            if (!deptIds) {
                return ElMessage.warning("请选择指定的部门数据权限");
            }
        }
        await assignRoleDataPerm(transferForm.value.roleId, transferForm.value.dataScope, deptIds);
        ElMessage.success("数据权限保存成功！");
        emit('binding-success');
    } finally {
        saving.value = false;
    }
};

const closeDialog = () => emit('update:visible', false);

const handleClose = () => {
  activeTabName.value = 'bindUser';
  searchUnboundForm.userCode = '';
  searchUnboundForm.userName = '';
};

// 监听对话框打开
watch(() => props.visible, (newVal) => {
  if (newVal) {
    transferForm.value = { ...props.roleData };
    // 默认加载第一个tab页的数据
    fetchBoundUsers();
    fetchUnboundUsers(1);
    fetchFunctionPermissions();
    fetchDataPermissions();
  }
});
</script>