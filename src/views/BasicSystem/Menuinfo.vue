<template>
  <div class="app-container MenuManage">
    <!-- 1. 查询区域 -->
    <div class="hearder">
      <div class="searchForm-box">
        <!-- 使用原生 el-form 进行查询 -->
        <el-form :model="searchForm" ref="queryFormRef" :inline="true" label-width="80px">
          <el-form-item label="菜单名称" prop="menuName">
            <el-input v-model="searchForm.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="所属平台" prop="menuType">
            <el-select v-model="searchForm.menuType" placeholder="请选择平台" clearable>
              <el-option label="Windows" :value="1" />
              <el-option label="WEB" :value="2" />
              <el-option label="PDA" :value="3" />
              <el-option label="安卓其他" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 2. 主内容区域 -->
    <div class="content">
      <div class="tabs-wrapper">
        <div class="tabs-header">
          <div class="tabs-buttons">
            <el-button v-hasButton="'Menuinfo_add'" type="success" icon="Plus" @click="handleAddEdit()">新增</el-button>
            <el-button v-hasButton="'Menuinfo_update'" type="primary" icon="Edit"
              @click="handleAddEdit(null, 'button')">编辑</el-button>
            <el-button v-hasButton="'Menuinfo_delete'" type="danger" icon="Delete"
              @click="handleDelete()">删除</el-button>
            <el-button v-hasButton="'Menuinfo_export'" type="primary" icon="Download"
              @click="exportExcel">导出</el-button>
            <el-button v-hasButton="'Menuinfo_exportAll'" type="primary" @click="exportAll">导出全部菜单</el-button>
            <!-- 导入功能可在此处添加 -->
          </div>
        </div>
        <div class="tabs-content">
          <el-table ref="tableRef" v-loading="loading" :data="menuList" row-key="menuId" lazy :load="loadSubMenus"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @selection-change="handleSelectionChange"
            @row-dblclick="handleAddEdit" border fit highlight-current-row>
            <el-table-column type="selection" align="center" width="55" />
            <el-table-column prop="menuCode" label="菜单编码" min-width="160" show-overflow-tooltip />
            <el-table-column prop="menuName" label="菜单名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="url" label="菜单地址" min-width="180" show-overflow-tooltip />
            <el-table-column prop="premenuId" label="菜单路径" min-width="180" show-overflow-tooltip />
            <el-table-column prop="orderNum" label="排序号" width="80" align="center" />
            <el-table-column prop="menuType" label="所属平台" align="center" width="120">
              <template #default="{ row }">
                <span>{{ formatPlatform(row.menuType) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="isHide" label="菜单状态" align="center" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isHide === 0 ? 'success' : 'info'">{{ row.isHide === 0 ? '显示' : '隐藏' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isOppen" label="打开方式" align="center" width="100">
              <template #default="{ row }">
                <span>{{ row.isOppen === 1 ? '原始页' : '新页面' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="isAuthorise" label="是否授权" align="center" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isAuthorise === 1 ? 'success' : 'danger'">{{ row.isAuthorise === 1 ? '需授权' : '免授权'
                  }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 3. 新增/编辑对话框 -->
    <fullscreen-dialog :close-on-click-modal="false" :title="dialogTitle" v-model="editDialogVisible" width="800px"
      draggable>
      <el-form ref="editFormRef" :model="editForm" :rules="rules" label-width="110px" inline>
        <el-form-item label="菜单编码" prop="menuCode">
          <el-input v-model="editForm.menuCode" placeholder="请输入菜单编码" />
        </el-form-item>
        <el-form-item label="所属菜单" prop="parentId">
          <el-tree-select v-model="editForm.parentId" :data="menuTreeOptions"
            :props="{ value: 'menuId', label: 'menuName', children: 'children' }" check-strictly filterable
            placeholder="请选择上级菜单" />
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="editForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单地址" prop="url">
          <el-input v-model="editForm.url" placeholder="请输入菜单地址" />
        </el-form-item>
        <el-form-item label="菜单路径" prop="premenuId">
          <el-input v-model="editForm.premenuId" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item label="排列序号" prop="orderNum">
          <el-input-number v-model="editForm.orderNum" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-popover placement="bottom-start" :width="540" trigger="click">
            <template #reference>
              <el-input v-model="editForm.icon" placeholder="点击选择图标" @blur="showSelectIcon" readonly>
                <template #prefix>
                  <svg-icon v-if="editForm.icon" :icon-class="editForm.icon" class="el-input__icon"
                    style="height: 32px;width: 16px;" />
                  <el-icon v-else style="height: 32px;width: 16px;">
                    <search />
                  </el-icon>
                </template>
              </el-input>
            </template>
            <icon-select ref="iconSelectRef" @selected="selected" :active-icon="editForm.icon" />
          </el-popover>
        </el-form-item>
        <el-form-item label="应用版本" prop="appVersion">
          <el-input v-model="editForm.appVersion" placeholder="请输入应用版本" />
        </el-form-item>
        <el-form-item label="应用dll" prop="appLink">
          <el-input v-model="editForm.appLink" placeholder="请输入应用dll" />
        </el-form-item>
        <el-form-item label="应用表单" prop="formName">
          <el-input v-model="editForm.formName" placeholder="请输入应用表单" />
        </el-form-item>
        <el-form-item label="菜单描述" prop="menuDesc" style="width: 100%;">
          <el-input type="textarea" :rows="2" v-model="editForm.menuDesc" placeholder="请输入菜单描述" />
        </el-form-item>
        <el-form-item label="菜单状态">
          <el-radio-group v-model="editForm.isHide">
            <el-radio :value="0">显示</el-radio>
            <el-radio :value="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-radio-group v-model="editForm.isMenu">
            <el-radio :value="0">菜单</el-radio>
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否授权">
          <el-radio-group v-model="editForm.isAuthorise">
            <el-radio :value="1">需授权</el-radio>
            <el-radio :value="0">免授权</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="打开方式">
          <el-radio-group v-model="editForm.isOppen">
            <el-radio :value="1">原始网页</el-radio>
            <el-radio :value="2">新网页</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属平台" style="width: 100%;">
          <el-radio-group v-model="editForm.menuType">
            <el-radio :value="1">Windows</el-radio>
            <el-radio :value="2">WEB</el-radio>
            <el-radio :value="3">PDA</el-radio>
            <el-radio :value="4">安卓其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label=" " v-if="!editForm.menuId" style="width: 100%;">
          <el-checkbox v-model="continueAdd">继续添加</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </fullscreen-dialog>
  </div>
</template>

<script setup name="MenuManage">

import { ElMessage, ElMessageBox } from 'element-plus';

import SvgIcon from "@/components/SvgIcon";
import IconSelect from "@/components/IconSelect";

import {
  getList,
  addEdit,
  deleteData,
  exportData,
  exportAllData
} from "@/api/BasicSystem/Menuinfo";
import download from '@/plugins/download';



// --- Refs and Reactive State ---
const queryFormRef = ref(null);
const tableRef = ref(null);
const editFormRef = ref(null);

const loading = ref(false);
const menuList = ref([]);
const menuTreeOptions = ref([]);
const multipleSelection = ref([]);
const editDialogVisible = ref(false);
const dialogTitle = ref('');
const continueAdd = ref(false);
const iconSelectRef = ref(null);

const searchForm = reactive({
  menuType: 2,
  menuName: '',
});

const initialEditForm = {
    menuId: null,
    menuCode: '',
    menuName: '',
    parentId: 0,
    url: '',
    premenuId: '',
    orderNum: 0,
    isHide: 0,
    isMenu: 0,
    isOppen: 1,
    isAuthorise: 1,
    menuType: 2,
    appVersion: '',
    appLink: '',
    formName: '',
    menuDesc: '',
};
const editForm = reactive({ ...initialEditForm });

const rules = {
  menuCode: [{ required: true, message: "请输入菜单编码", trigger: "blur" }],
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  url: [{ required: true, message: "请输入菜单地址", trigger: "blur" }],
  orderNum: [{ required: true, message: "请输入菜单序号", trigger: "blur" }],
  premenuId: [{ required: true, message: "请输入路径", trigger: "blur" }],
};

// --- Helper Functions ---
const formatPlatform = (type) => {
    const map = { 1: 'Windows', 2: 'WEB', 3: 'PDA', 4: '安卓其他' };
    return map[type] || '未知';
};

// --- Core Methods ---
/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset();
}

/** 选择图标 */
function selected(name) {
  editForm.icon = name;
}

/**
 * @description 将平铺的菜单数据转换为树形结构
 * @param {Array} data - 平铺的菜单数据数组
 * @returns {Array} 转换后的树形结构数组
 */
function dataTree(data) {
  // 防御性检查：如果输入不是一个数组，直接返回一个空数组
  if (!Array.isArray(data)) {
    return [];
  }

  let cloneData = JSON.parse(JSON.stringify(data));
  return cloneData.filter((father) => {
    let branchArr = cloneData.filter(
      (child) => father.menuId == child.parentId
    );
    if (branchArr.length > 0) {
      father.children = branchArr;
    }
    // 注意：这里的 parentId == 0 假设所有根节点的 parentId 都是 0。
    // 如果根节点的 parentId 可能是 null 或 undefined，需要调整为：
    // return father.parentId == 0 || father.parentId == null;
    return father.parentId == 0;
  });
}

/**
 * @description 获取顶层菜单 (parentId = 0)
 */
async function fetchTopLevelMenus() {
  loading.value = true;
  try {
    const params = { ...searchForm, parentId: 0 };
    const res = await getList(params);
    menuList.value = (res.data || []).map(item => ({
      ...item,
      hasChildren: item.isMenu !== 2,
    }));
  } catch (error) {
    console.error("获取顶层菜单失败:", error);
  } finally {
    loading.value = false;
  }
}

/**
 * @description el-table 懒加载方法
 */
async function loadSubMenus(tree, treeNode, resolve) {
  try {
    const res = await getList({ parentId: tree.menuId, menuType: searchForm.menuType });
    const children = (res.data || []).map(item => ({
      ...item,
      hasChildren: item.isMenu !== 2,
    }));
    resolve(children);
  } catch (error) {
    console.error("加载子菜单失败:", error);
    resolve([]);
  }
}

/**
 * @description 【核心】刷新指定父节点下的子节点列表，完全模拟旧版逻辑
 * @param {number} parentId - 要刷新其子节点的父菜单ID
 */
async function refreshRow(parentId) {
  const tableEl = tableRef.value;
  if (!tableEl) return;

  // 重新请求该父节点下的所有子节点数据
  try {
    const res = await getList({ parentId: parentId, menuType: searchForm.menuType });
    const newChildren = (res.data || []).map(item => ({
        ...item,
        hasChildren: item.isMenu !== 2,
    }));

    if (parentId === 0) {
      // 如果是刷新根节点，直接替换整个 menuList
      menuList.value = newChildren;
    } else {
      // 如果是刷新子节点，更新 el-table 内部的懒加载数据缓存
      // this.$set(this.$refs.table.store.states.lazyTreeNodeMap, id, res.data.data) 的 Vue 3 写法
      if (tableEl.store.states.lazyTreeNodeMap.value[parentId]) {
        tableEl.store.states.lazyTreeNodeMap.value[parentId] = newChildren;
      }
    }
    // ElMessage.success("节点刷新成功！");
  } catch(error) {
    console.error(`刷新节点 ${parentId} 失败:`, error);
  }
}


async function fetchMenuTreeForSelect() {
    try {
        const res = await getList({ menuType: searchForm.menuType, pageSize: 99999 });
        const root = { menuId: 0, menuName: '首层菜单', children: [] };
        root.children = dataTree(res.data || []);
        menuTreeOptions.value = [root];
    } catch (error) {
        console.error("获取菜单树失败:", error);
    }
}

function handleQuery() {
  fetchTopLevelMenus();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  // searchForm.menuType = 2; // 如果需要重置为默认值
  fetchTopLevelMenus();
}

function handleSelectionChange(selection) {
  multipleSelection.value = selection;
}



function handleAddEdit(row, source = 'row') {
  if (source === 'button') {
    if (multipleSelection.value.length !== 1) {
      return ElMessage.warning("请选择一条数据进行编辑！");
    }
    row = multipleSelection.value[0];
  }
  if (row && row.menuId) {
    dialogTitle.value = "修改菜单";
    Object.assign(editForm, row);
  } else {
    dialogTitle.value = "新增菜单";
    Object.assign(editForm, initialEditForm);
    if (multipleSelection.value.length === 1) {
        const parent = multipleSelection.value[0];
        if (parent.isMenu === 2) {
            return ElMessage.warning("按钮下不能新增子菜单！");
        }
        editForm.parentId = parent.menuId;
    } else if (multipleSelection.value.length > 1) {
        return ElMessage.warning("新增时只能选择一个父级菜单或不选！");
    }
  }
  continueAdd.value = false;
  editDialogVisible.value = true;
}

/**
 * @description 提交新增或编辑表单
 */
async function submitForm() {
  await editFormRef.value.validate();
  
  const action = editForm.menuId ? 'update' : 'add';
  try {
    await addEdit(action, editForm);
    // ElMessage.success(`${action === 'add' ? '新增' : '修改'}成功！`);
    ElMessage.info("提示：菜单将在重新登录后生效。");

    const parentIdToRefresh = editForm.parentId;

    if (continueAdd.value && action === 'add') {
      editFormRef.value.resetFields();
      Object.assign(editForm, initialEditForm);
      editForm.parentId = parentIdToRefresh;
    } else {
      editDialogVisible.value = false;
    }
    
    // 【关键】无论新增还是修改，都调用 refreshRow 刷新父节点
    await refreshRow(parentIdToRefresh);
    // await fetchMenuTreeForSelect(); // 同时刷新下拉树
  } catch (error) {
    // 校验失败会自动提示，API 失败由拦截器处理
    console.error("保存菜单失败:", error);
  }
}

async function handleDelete() {
  if (multipleSelection.value.length === 0) {
    return ElMessage.warning("请至少选择一条数据进行删除！");
  }
  const ids = multipleSelection.value.map(item => item.menuId).join(',');
  const names = multipleSelection.value.map(item => item.menuName).join(', ');
  try {
    await ElMessageBox.confirm(`确定要删除菜单 [${names}] 吗?`, "确认删除", { type: 'warning' });
    await deleteData(ids);
    ElMessage.success("删除成功！");
    
    const parentIds = new Set(multipleSelection.value.map(item => item.parentId));
    // 使用 Promise.all 并行刷新所有受影响的父节点
    await Promise.all(Array.from(parentIds).map(pid => refreshRow(pid)));
    await fetchMenuTreeForSelect();

  } catch (error) {
    if (error !== 'cancel') console.error("删除菜单失败:", error);
  }
}

function exportExcel() {
  download.exportExcel(exportData(), searchForm, "菜单信息.xlsx");
}

function exportAll() {
  download.exportExcel(exportAllData(), searchForm, "菜单全部信息.xlsx");
}

onMounted(() => {
  fetchTopLevelMenus();
  fetchMenuTreeForSelect();
});
</script>

<style lang="scss" scoped>
/* 使用 scoped 确保样式只作用于当前组件 */
.MenuManage .el-table {
  /* 确保表格在 .tabs-content 内正确显示滚动条 */
  flex-grow: 1; 
}
.tabs-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 0;
  .tabs-buttons{
    margin-bottom: 10px;
  }
}
.tabs-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
}
</style>