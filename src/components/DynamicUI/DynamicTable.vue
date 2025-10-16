<template>
  <!-- Element Plus 表格组件 -->
  <el-table 
  :data="props.data" 
  border
  fit 
  ref="tableRef" 
  :row-key="props.rowKey"
  :lazy="props.isTree"
  :load="props.lazyLoadFn"
  :tree-props="props.treeProps"
    
  v-bind="$attrs"
  >
      <!-- 1. 静态功能列：选择框列 -->
      <!-- 它的显示只由 showSelectionColumn prop 决定 -->
      <el-table-column
        v-if="props.showSelectionColumn"
        type="selection"
        :reserve-selection="true /* 保留选择项，避免翻页后选择丢失 */" 
        width="55"
        :align="props.selectColumnAlign"
        :fixed="props.selectColumnFixed"
        :selectable="props.selectable"
      />

      <!-- 2. 静态功能列：序号列 -->
      <!-- 它的显示只由 showIndexColumn prop 决定 -->
      <el-table-column
        v-if="props.showIndexColumn"
        :label="props.indexColumnLabel"
        type="index"
        :width="props.indexColumnWidth"
        :align="props.indexColumnAlign"
        :fixed="props.indexColumnFixed"
        :index="props.indexMethod"
      />
     <!-- 3. 动态数据列 -->
    <!-- v-for 直接遍历从 props 传入的、可被 RightToolbar 修改的 columns 数组 -->
    <template v-for="(column, index) in props.columns" :key="column.itemKey || index">
      <!-- el-table-column 组件 -->
      <el-table-column
        v-if="column.visible"
        :prop="column.itemKey"
        :label="column.itemName"
        :min-width="column.minWidth && column.minWidth(props.data)"
        :align="column.align"
        :fixed="column.fixed"
        v-bind="column.colAttrs"
        :show-overflow-tooltip="column.showOverflowTooltip !== undefined ? column.showOverflowTooltip : true"
      >
        <!-- 使用作用域插槽 #default 来自定义单元格内容的渲染 -->
        <!-- 仅在列的 type 不是 'selection' 或 'index' 时，才使用自定义的 #default 插槽 -->
        <!-- Element Plus 会为 type="selection" 和 type="index" 提供内置的渲染逻辑 -->
        <template #default="scope" v-if="!['selection', 'index'].includes(column.type)">
          <!-- 特殊类型渲染 (例如链接) -->
          <template v-if="column.itemListType === 11">
            <!-- 类型 11: 连接点击 (使用 el-link) -->
            <el-link type="primary"
              @click="itemClickInTable(scope.row, column.itemConfig || column, scope.$index, $event) /* 如果有 itemConfig 用 itemConfig，否则用 column 本身作为配置 */"
              v-bind="typeof column.itemConfig.itemAttrs === 'function' ? column.itemConfig.itemAttrs(scope) : column.itemConfig.itemAttrs /* 透传给 DynamicInputControl 内部具体控件的属性，可以是静态对象或动态函数 */">
              {{ scope.row[column.itemKey] }}
            </el-link>
          </template>
          <!--
             核心渲染逻辑：
             1. 如果 column.itemConfig 存在 (表示该列“可能”是可编辑的配置)
             2. 并且 isCellEditable(scope.row, column.itemKey) 返回 true (表示当前单元格“应该”是可编辑的)
             则渲染 DynamicInputControl 实现编辑功能。
           -->
          <template v-else-if="column.itemConfig && isCellEditable(scope.row, column.itemKey)">
            <dynamic-input-control 
              :item="{ // 将列配置转换为 DynamicInputControl 所需的 item 配置
                ...column.itemConfig, // 基础控件配置
                itemKey: column.itemKey, // 确保 itemKey 传递
                itemName: column.itemName || column.itemConfig.itemName, // 确保 itemName 传递
              }" 
              v-model="scope.row[column.itemKey]"

              @change="handleCellEvent('change', scope, column, $event)"
              @focus="handleCellEvent('focus', scope, column, $event)"
              @blur="handleCellEvent('blur', scope, column, $event)"

              @append-click="() => handleAppendClickInTable(scope.row, column.itemKey)"
              @item-click="(itemConfig) => itemClickInTable(scope.row, itemConfig, scope.$index, $event)"
              
              v-on="uploadEventHandlers(scope, column)"
              v-bind="typeof column.itemConfig.itemAttrs === 'function' ? column.itemConfig.itemAttrs(scope) : column.itemConfig.itemAttrs /* 透传给 DynamicInputControl 内部具体控件的属性，可以是静态对象或动态函数 */" />
          </template>
          <!-- 如果不满足编辑条件，则进入只读模式的渲染 -->
          <template v-else>
            <!--  如果有 formatter 函数，则使用 formatter 进行格式化显示 -->
            <span v-if="column.formatter">
              {{ column.formatter(scope.row, column, scope.row[column.itemKey], scope.$index) }}
            </span>
            <!-- 3. 默认只读文本显示 (如果不是特殊类型或 formatter) -->
            <span v-else>
              {{ scope.row[column.itemKey] }}
            </span>
          </template>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script setup>
import DynamicInputControl from './DynamicInputControl.vue'; // 引入动态输入控件
const tableRef = ref(null); // 创建对 el-table 组件实例的引用

// --- Props 定义 ---
const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  cellEditableCheck: { type: Function, default: () => true },
  
  // --- 选择列 Props ---
  showSelectionColumn: { type: Boolean, default: false },
  selectable: { type: Function, default: null },
  selectColumnAlign: { type: String, default: 'center' },
  selectColumnFixed: { type: String, default: null },

  // --- 序号列 Props ---
  showIndexColumn: { type: Boolean, default: false },
  indexColumnLabel: { type: String, default: '序号' },
  indexColumnWidth: { type: [String, Number], default: 55 },
  indexColumnAlign: { type: String, default: 'center' },
  indexColumnFixed: { type: String, default: null },
  indexMethod: { type: Function, default: undefined },
  
  mode: { type: String, default: 'add' },

  // --- Props 用于控制树形表格 ---
  isTree: { // 是否为树形表格
    type: Boolean,
    default: false,
  },
  rowKey: { // 树形表格必须的 row-key
    type: [String, Function],
    default: 'id', // 提供一个通用默认值
  },
  treeProps: { // el-table 的 tree-props
    type: Object,
    default: () => ({ children: 'children', hasChildren: 'hasChildren' }),
  },
  lazyLoadFn: { // 懒加载数据的方法
    type: Function,
    default: null,
  },
});

// --- Emits 定义 ---
// 定义组件可以触发的自定义事件
const emit = defineEmits([
  "cell-value-change",  // 单元格值改变时触发
  "cell-append-click",  // DynamicInputControl 后置按钮点击时触发
  "cell-item-click",    // DynamicInputControl 内部元素点击 (如链接) 或只读链接点击时触发
  "cell-upload-event",  // DynamicInputControl 中上传组件相关事件的统一出口
  "cell-event",      // 用于处理通用的 change, focus, blur 等
]);

// --- 计算属性 (Computed) ---


// --- 方法 (Methods) ---

// 核心方法：根据行数据和列标识，判断该单元格是否应该进入编辑状态
function isCellEditable(row, itemKey) {
  // 直接调用父组件通过 props.cellEditableCheck 传入的函数
  // 父组件可以通过这个函数实现非常灵活的单元格级别编辑控制逻辑
  // 例如：根据行内某个字段的状态决定其他字段是否可编辑
  return props.cellEditableCheck(row, itemKey);
}

function handleAppendClickInTable(row, itemKey) {
  // 当 DynamicInputControl 的后置按钮被点击时触发
  emit("cell-append-click", { row, itemKey, value: row[itemKey] });
}

function itemClickInTable(row, itemConfigOrColumn, index, event) {
  // 当 DynamicInputControl 内部的 item-click 事件触发时 (通常是链接类型的控件)
  // 或者只读单元格内的 el-link 被点击时触发
  // itemConfigOrColumn 可能是 DynamicInputControl 传出的 itemConfig，也可能是只读链接列的 column 配置
  emit("cell-item-click", { row, itemConfig: itemConfigOrColumn, index, event });
}

/**
 * 统一处理单元格内【非上传】组件的事件 (change, focus, blur)
 */
function handleCellEvent(eventName, scope, columnConfig, eventPayload) {
  const { row, $index: rowIndex } = scope;
  const itemKey = columnConfig.itemKey;

  // 如果 rowIndex 是 -1，说明事件是在 el-table 初始渲染时触发的，而不是用户交互。
  // 我们应该忽略这类事件，以防止在页面加载时执行不必要的操作。
  if (rowIndex === -1) {
    console.log(`[Init Phase] Ignored '${eventName}' event for itemKey '${columnConfig.itemKey}' due to rowIndex being -1.`);
    return; // 立即返回，不向上 emit
  }

  emit('cell-event', {
    eventName,
    row,
    itemKey,
    payload: eventPayload,
    rowIndex,
  });
}

/**
 * 专门处理【上传组件】的所有事件
 */
function handleUploadEventInTable(eventName, row, itemKey, eventData) {
  emit("cell-upload-event", { eventName, row, itemKey, eventData });
}

/**
 * @description 创建一个包含所有上传事件监听器的对象，用于 v-on 动态绑定
 * @returns {object} - 事件监听器对象
 */
function uploadEventHandlers(scope, columnConfig) {
    const { row } = scope;
    const { itemKey } = columnConfig;
    
    // 我们只为上传组件 (type: 9) 创建这些监听器
    if (columnConfig.itemConfig.type !== 9) {
        return {};
    }
    
    return {
        // el-upload 的 change 事件比较特殊，它有两个参数
        onChange: (file, fileList) => handleUploadEventInTable('change', row, itemKey, { file, fileList }),
        onPreview: (file) => handleUploadEventInTable('preview', row, itemKey, file),
        onRemove: (file, fileList) => handleUploadEventInTable('remove', row, itemKey, { file, fileList }),
        onSuccess: (response, file, fileList) => handleUploadEventInTable('success', row, itemKey, { response, file, fileList }),
        onError: (error, file, fileList) => handleUploadEventInTable('error', row, itemKey, { error, file, fileList }),
        onExceed: (files, fileList) => handleUploadEventInTable('exceed', row, itemKey, { files, fileList }),
        // ... (可以添加 before-remove 等其他事件)
    };
}

// --- 暴露公共 API (Expose) ---
// 如果父组件需要直接访问 el-table 实例 (例如调用其方法)，可以通过 defineExpose 暴露
defineExpose({
    tableRef // 暴露 el-table 的 ref
});
</script>

<style scoped>
/* 局部样式 */
/* 通过 :deep() 修改 Element Plus 子组件的样式，这里是减小单元格的上下内边距 */
.el-table :deep(.el-table__cell) { padding: 5px 0; }
</style>