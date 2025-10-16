<template>

  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="{
      getList,
      addEdit,
      deleteData,
      importData,
      exportData,
    }"
    id-field-name="deptId"
    @config-loaded="onConfigLoaded"
    @list-updated="handleListUpdate"
    :tree-table-props="{ children: 'depts', hasChildren: 'hasChildren' }"
    :dynamic-options-map="pageOptionsMap"
     @before-add="handleBeforeAdd"
    @cell-item-click="cellItemClick"
  >
  </dynamic-crud-page>
</template>

<script setup name="SysDept">
import { ElMessage } from "element-plus";

import {
  getAll as getList,
  addEdit,
  deleteData,
  importData,
  exportData,
} from "@/api/BasicSystem/SysDept";


const route = useRoute();
const dynamicCrudPageRef = ref(null);


// --- “所属部门”下拉框的响应式数据 ---
const deptTreeForSelect = ref([]);

// --- 数据映射配置 ---
// 创建一个计算属性，它就是我们的“数据映射指令”
const pageOptionsMap = computed(() => ({
  // 键 "parentId": 对应 baseAllFields 中需要注入数据的字段的 itemKey
  // 值 deptTreeForSelect: 是包含动态树形数据的响应式引用
  parentId: deptTreeForSelect,
}));


/**
 * @description 获取并构建用于 TreeSelect 的完整部门树
 * @async
 */
async function fetchDeptTreeForSelect(list) {
  try {
    const deptsTree = list || []; // 直接使用后端返回的树形数组

    // 2. 创建一个虚拟的根节点，并将后端的树作为其子节点
    const root = {
      deptId: -1,
      deptName: '根目录',
      depts: deptsTree 
    };
    
    // 3. 最终赋值
    deptTreeForSelect.value = [root];

  } catch (error) {
    console.error("获取部门树形下拉选项失败:", error);
    deptTreeForSelect.value = []; // 出错时清空
  }
}

/**
 * @description 加载并注入动态的树形选择器数据结构
 * @async
 */
async function loadAndInjectDynamicEnums() {
  try {
    if (dynamicCrudPageRef.value) {
      dynamicCrudPageRef.value.updateFieldConfig('parentId', {
        // 将格式化好的数组转为 JSON 字符串
        treeSelectProps: {"value": "deptId", "label": "deptName", "children": "depts"},
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
 * @description 处理列表更新事件
 * @param {Array} list - 更新后的列表数据
 */
function handleListUpdate(list) {
  // console.log('部门列表已更新:', list);
  fetchDeptTreeForSelect(list)
  // 在这里可以添加部门管理特有的列表更新逻辑
}

/**
 * @description 在 DynamicCrudPage 打开新增对话框前触发此回调
 * @param {object} payload - 包含 initialData 和 selection 的对象
 * @param {object} payload.initialData - 一个可被修改的空对象，用于设置初始值
 * @param {Array} payload.selection - 当前表格的选中项
 */
function handleBeforeAdd({ initialData, selection, cancel }) {
  console.log('SysDept 捕获到 before-add 事件', selection);
  
  // 在这里实现所有特定于“新增部门”的业务逻辑
  if (selection.length === 1) {
    const parentNode = selection[0];
    
    
    // 核心逻辑：修改 initialData 对象，为其 parentId 赋值
    initialData.parentId = parentNode.deptId;

  }  else if (selection.length > 1) {
    ElMessage.warning("新增时，请不要选择多于一个父级节点。");
    cancel(); //  调用 cancel 函数，阻止对话框打开
    return;
  }
  
  // 如果 selection.length === 0，我们什么都不做，initialData 保持为空
  // DynamicCrudPage 内部的 DynamicForm 会处理默认值
}

/**
 * @description 处理单元格点击事件
 * @param {object} cellData - 包含被点击的行数据、列配置和索引等信息
 */
function cellItemClick(cellData) {
  console.log('SysDept 页面接收到单元格点击:', cellData);
  // 在这里可以添加部门管理特有的单元格点击逻辑
}

</script>