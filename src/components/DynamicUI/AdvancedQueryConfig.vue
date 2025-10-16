<template>
  <fullscreen-dialog
    title="高级查询配置"
    :model-value="visible /* 控制弹窗显示/隐藏，通过 props.visible 绑定 */"
    width="750px"
    draggable
    @update:modelValue="$emit('update:visible',  $event) /* 关闭弹窗时通知父组件更新 visible状态 */"
    @closed="handleDialogClosed /* 弹窗关闭动画完成后触发的事件 */"
    :close-on-click-modal="false /* 禁止点击遮罩层关闭弹窗 */"
    append-to-body 
    class="advanced-query-dialog "
  >
    <!-- 条件配置区域容器 -->
    <div class="query-conditions-container">
      <!-- Element Plus 滚动条组件，用于当条件过多时提供滚动 -->
      <el-scrollbar wrap-class="query-conditions-scrollbar /* 滚动条包裹层类名 */">
        <!-- 当没有查询条件时显示空状态 -->
        <div v-if="localConditions.length === 0 /* 如果条件列表为空 */" class="empty-conditions">
          <el-empty description="暂无查询条件，请点击下方“添加条件”按钮新增" />
        </div>
        <!-- 遍历 localConditions 数组，为每个条件渲染一行配置 -->
        <div
          v-for="(condition, index) in localConditions /* 遍历当前配置的条件 */"
          :key="condition.id /* 使用唯一 ID 作为 key */"
          class="condition-row /* 条件行类名 */"
        >
          <!-- 查询字段选择 -->
          <el-form-item label="查询字段" class="query-item field-selector">
            <el-select
              v-model="condition.itemKey /* 绑定到条件的 itemKey */"
              placeholder="选择字段"
              @change="handleFieldChange(condition) /* 字段变化时触发处理函数 */"
              filterable 
              clearable
            >
              <el-option
                v-for="field in props.queryableFields /* 遍历可查询字段列表 */"
                :key="field.itemKey /* 选项key */"
                :label="field.itemName /* 选项标签 */"
                :value="field.itemKey /* 选项值 */"
                :disabled="isFieldDisabled(field.itemKey, condition.id) /* 根据是否允许重复选择来禁用选项 */"
              />
            </el-select>
          </el-form-item>

          <!-- 查询方式 (操作符) 选择 -->
          <el-form-item label="查询方式" class="query-item operator-selector">
            <el-select
              v-model="condition.operator /* 绑定到条件的 operator */"
              placeholder="选择方式"
              :disabled="!condition.itemKey /* 未选择字段时禁用 */"
              filterable
              clearable
            >
              <el-option
                v-for="op in getOperatorOptions(condition.originalType) /* 根据字段类型获取操作符选项 */"
                :key="op.value /* 选项key */"
                :label="op.text /* 选项标签 */"
                :value="op.value /* 选项值 */"
              />
            </el-select>
          </el-form-item>

          <!-- 连接方式选择 (AND/OR)，仅在非最后一个条件时显示 -->
          <el-form-item
            v-if="index < localConditions.length - 1 /* 非最后一行条件时显示 */"
            label="连接方式"
            class="query-item querySign-selector"
          >
            <el-select v-model="condition.querySign" placeholder="连接符">
              <el-option label="并且 (AND)" value="1" />
              <el-option label="或者 (OR)" value="2" />
            </el-select>
          </el-form-item>
          <!-- 占位符，用于当条件多于一个且当前是最后一个条件时，保持布局对齐 -->
          <div
            v-else-if="localConditions.length > 1 /* 条件数大于1且为最后一行 */"
            class="query-item placeholder-querySign /* 占位符类名，用于对齐 */"
          >
            <!-- 此 div 宽度与连接方式选择框相同，使删除按钮能正确对齐 -->
          </div>

          <!-- 删除条件按钮 -->
          <el-button
            type="danger"
            :icon="Delete /* 删除图标 */"
            circle
            @click="removeCondition(index) /* 点击时移除当前条件 */"
            class="delete-button "
            title="删除此条件"
          />
        </div>
      </el-scrollbar>
    </div>

    <!-- 弹窗底部操作按钮区域 -->
    <template #footer>
      <div class="dialog-footer">
        <!-- 添加条件按钮，位于左侧 -->
        <el-button @click="addCondition" type="primary" :icon="Plus" class="add-condition-btn">
          添加条件
        </el-button>
        <span style="flex-grow: 1; /* 弹性占位符，将右侧按钮推到最右边 */"></span>
        <!-- 取消按钮 -->
        <el-button @click="$emit('update:visible', false) /* 点击取消事件，关闭弹窗 */">取 消</el-button>
        <!-- 确定按钮，当没有条件时禁用 -->
        <el-button type="success" @click="handleConfirm /* 点击确定事件 */" :disabled="localConditions.length === 0 /* 无条件时禁用确定按钮 */">
          确 定
        </el-button>
      </div>
    </template>
  </fullscreen-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'; // 按需引入 Element Plus 组件
import { Delete, Plus } from '@element-plus/icons-vue'; // 引入图标
import {
  getAdvOperatorOptions, // 从外部 JS 文件导入获取高级查询操作符的工具函数
} from './utils/queryOperatorUtils.js';

// --- 定义组件 Props ---
const props = defineProps({
  // 控制弹窗是否可见
  visible: {
    type: Boolean,
    default: false,
  },
  // 可供选择的查询字段列表
  // 结构: [{ itemKey: string, itemName: string, type: number (DynamicFormItem的原始type) }]
  queryableFields: {
    type: Array,
    required: true, // 必须提供
    default: () => [], // 默认为空数组
  },
  // 外部传入的初始条件 (用于编辑场景回显)
  // 结构: [{ itemKey, itemName?, originalType?, operator, operatorText?, querySign }]
  initialConditions: {
    type: Array,
    default: () => [], // 默认为空数组
  },
  // 是否允许在多个条件行中选择同一个字段 (默认允许)
  allowDuplicateFields: {
    type: Boolean,
    default: true
  }
});

// --- 定义组件 Emits ---
const emit = defineEmits(['update:visible', 'confirm']); // 'update:visible' 用于 v-model:visible, 'confirm' 用于传递确认后的条件

// --- 组件内部状态 ---
const localConditions = ref([]); // 存储用户在弹窗中配置的查询条件列表，每个条件是一个对象
let uniqueIdCounter = 0; // 用于为每个条件行生成唯一的 ID (主要用于 v-for 的 key)

// --- 操作符相关函数 (原注释中的 operatorSets 和 getOperatorTypeKey 已被 getAdvOperatorOptions 替代) ---

// 根据字段的原始类型 (DynamicFormItem 的 type) 获取对应的操作符选项列表
function getOperatorOptions(originalItemType) {
  // 直接调用从 queryOperatorUtils.js 导入的函数
  return getAdvOperatorOptions(originalItemType);
}

// 创建一个新的、空的查询条件对象
function createNewCondition() {
  uniqueIdCounter++; // 递增 ID 计数器
  return {
    id: `cond-${uniqueIdCounter}`, // 生成唯一ID
    itemKey: null,      // 选中的字段的 itemKey，初始为 null
    itemName: '',       // 选中的字段的 itemName (冗余存储，方便显示或调试)
    originalType: null,  // 选中的字段的原始类型 (DynamicFormItem 的 type)，初始为 null
    operator: null,      // 选中的查询方式 (操作符) value，初始为 null
    querySign: '1',    // 与下一个条件的连接方式，默认为“并且” (AND, 假设 '1' 代表 AND)
  };
}

// 当条件行中的“查询字段”选择发生变化时调用
function handleFieldChange(condition) {
  // 根据选择的 itemKey 从 props.queryableFields 中找到对应的字段对象
  const selectedField = props.queryableFields.find(f => f.itemKey === condition.itemKey);
  if (selectedField) {
    // 如果找到了字段，更新条件对象的 originalType 和 itemName
    condition.originalType = selectedField.type;
    condition.itemName = selectedField.itemName;

    condition.customFormDetId = selectedField.customFormDetId; // [!code ++] <<< 新增：从选中的字段中捕获 customFormDetId
    // ★★★ 重置操作符 ★★★
    // 因为字段类型可能已经改变，之前选中的操作符可能不再适用于新字段类型
    condition.operator = null;
    // 可选: 自动选择该类型下的第一个可用操作符作为默认值
    const ops = getOperatorOptions(condition.originalType);
    if (ops && ops.length > 0) {
      condition.operator = ops[0].value;
    }
  } else {
    // 如果清空了字段选择 (condition.itemKey 变为 null)
    condition.originalType = null;
    condition.itemName = '';
    condition.operator = null; // 同时清空操作符

     condition.customFormDetId = null; // [!code ++] <<< 新增：清空字段时也清空ID
  }
}

// 点击“添加条件”按钮时调用，在列表末尾添加一个新的空条件行
function addCondition() {
  localConditions.value.push(createNewCondition());
  // 滚动到底部，确保新添加的行可见 (如果条件列表超出了可视区域)
  nextTick(() => {
    // 注意：选择器需要精确匹配到 el-scrollbar 的内部滚动区域
    // el-scrollbar 的结构通常是 .el-scrollbar > .el-scrollbar__wrap > .el-scrollbar__view
    // 如果 wrap-class="query-conditions-scrollbar" 是加在 .el-scrollbar__wrap 上的，那选择器应为:
    const scrollbarWrap = document.querySelector('.advanced-query-dialog .el-scrollbar__wrap.query-conditions-scrollbar');
    if (scrollbarWrap) {
      scrollbarWrap.scrollTop = scrollbarWrap.scrollHeight;
    }
  });
}

// 点击条件行右侧的删除按钮时调用，移除指定索引的条件
function removeCondition(index) {
  localConditions.value.splice(index, 1); // 从数组中移除
}

// 点击弹窗底部“确定”按钮时调用
function handleConfirm() {
  // 1. 数据校验：检查是否所有条件都选择了字段和操作符
  const invalidConditions = localConditions.value.filter(cond => !cond.itemKey || !cond.operator);
  if (invalidConditions.length > 0) {
    ElMessage.warning('请确保所有查询条件的“查询字段”和“查询方式”都已选择！');
    return; // 如果有未完成的条件，则不继续
  }

  // 2. 准备要 emit 给父组件的数据
  // 转换 localConditions 为父组件期望的格式，并补充 operatorText
  const conditionsToEmit = localConditions.value.map((cond, index) => {
    const operatorOptions = getOperatorOptions(cond.originalType); // 获取当前字段类型的操作符列表
    const selectedOperator = operatorOptions.find(op => op.value === cond.operator); // 找到选中的操作符对象
    console.log(cond);
    return {
      itemKey: cond.itemKey,
      itemName: cond.itemName, // itemName 已在 handleFieldChange 中设置
      originalType: cond.originalType, // 字段的原始类型
      operator: cond.operator, // 操作符的值
      operatorText: selectedOperator ? selectedOperator.text : '', // 操作符的显示文本
      // 最后一个条件没有连接符到下一个条件，所以 querySign 为 null
      querySign: index === localConditions.value.length - 1 ? null : cond.querySign,
      customFormDetId: cond.customFormDetId, // [!code ++] <<< 新增：在确认时将 customFormDetId 包含在内
    };
  });

  emit('confirm', conditionsToEmit); // 触发 confirm 事件，传递处理好的条件列表
  // emit('update:visible', false); // 关闭弹窗
}

// 控制字段选择器中的选项是否禁用 (如果不允许重复选择同一字段)
function isFieldDisabled(fieldItemKey, currentConditionId) {
  // 如果 props.allowDuplicateFields 为 true，则所有选项都不禁用
  if (props.allowDuplicateFields) {
    return false;
  }
  // 否则，检查此 fieldItemKey 是否已被其他条件行 (非当前行) 选择
  return localConditions.value.some(
    // cond.id !== currentConditionId确保是比较其他行
    // cond.itemKey === fieldItemKey检查字段是否已被占用
    cond => cond.id !== currentConditionId && cond.itemKey === fieldItemKey
  );
}

// --- Watchers (侦听器) ---
// 监听 props.visible，当弹窗从不可见变为可见时 (即打开时)，初始化或重置 localConditions
watch(() => props.visible, (newVal, oldVal) => {
  if (newVal && !oldVal) { // 确保是从 false 到 true 的变化，即弹窗打开时
    uniqueIdCounter = 0; // 重置条件行的唯一 ID 计数器
    if (props.initialConditions && props.initialConditions.length > 0) {
      // 如果父组件传入了 initialConditions (用于编辑回显)，则基于它们初始化 localConditions
      localConditions.value = props.initialConditions.map(initCond => {
        // 从 queryableFields 中找到对应的字段基础信息 (如 type, itemName)
        const baseField = props.queryableFields.find(f => f.itemKey === initCond.itemKey);
        uniqueIdCounter++;
        return {
          id: `cond-${uniqueIdCounter}`, // 生成唯一 ID
          itemKey: initCond.itemKey,
          // itemName 和 originalType 优先从 baseField 获取，如果找不到则用 initCond 里的 (如果有)
          itemName: baseField ? baseField.itemName : (initCond.itemName || ''),
          originalType: baseField ? baseField.type : (initCond.originalType || null),
          operator: initCond.operator,
          querySign: initCond.querySign || '1', // 默认为 AND ('1')
          customFormDetId: initCond.customFormDetId || (baseField ? baseField.customFormDetId : null), // [!code ++] <<< 新增：回显时也设置 customFormDetId
        };
      });
    } else {
      // 如果没有 initialConditions，则默认添加一个空的条件行，或保持为空让用户手动添加
      localConditions.value = [createNewCondition()]; // 默认创建一个空条件
      // localConditions.value = []; // 如果希望打开时默认是空的，则设为空数组
    }
  }
});

// 弹窗关闭动画完成后触发的事件处理函数
function handleDialogClosed() {
  // 如果不希望保留上次编辑的状态 (即每次打开都是全新的，除非有 initialConditions)，可以在这里清空
  // localConditions.value = [];
  // 但通常，如果用户取消关闭，再次打开时应保留上次未确认的修改。
  // 如果 props.initialConditions 是动态变化的，可能需要更复杂的逻辑来决定是否清空。
  // 当前实现是：再次打开时，会根据最新的 props.initialConditions 重新初始化。
}

</script>

<style scoped>
/* 针对高级查询配置弹窗的特定样式 */
.advanced-query-dialog .el-dialog__body {
  padding: 15px 20px; /* 调整弹窗内容区域的内边距 */
}

.query-conditions-container {
  /* 限制最大高度，使其在内容过多时出现滚动条，180px 大约是弹窗头部和底部的预估高度 */
  max-height: calc(70vh - 180px);
  min-height: 150px; /* 保证即使是空状态也有一定的高度 */
  overflow: hidden; /* 由 el-scrollbar 组件处理内部滚动 */
  border: 1px solid #dcdfe6; /* 边框 */
  border-radius: 4px; /* 圆角 */
  padding: 10px; /* 内边距 */
}

.query-conditions-scrollbar .el-scrollbar__view {
  /* 如果需要对 el-scrollbar 内部的 .el-scrollbar__view (实际内容区域) 进行样式调整 */
  /* padding-bottom: 5px;  例如，给底部留一点空间 */
}

.empty-conditions {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; /* 给空状态提示一些固定高度 */
  color: #909399;
}

.condition-row {
  display: flex; /* 使用 Flexbox 布局单行条件 */
  align-items: center; /* 子项垂直居中对齐 (表单项和删除按钮) */
  gap: 10px; /* Flex 子项之间的间距 */
  margin-bottom: 15px; /* 每行条件之间的垂直间距 */
  padding-right: 5px; /* 给行末的删除按钮留出一些右边距 */
}

.condition-row:last-child {
  margin-bottom: 0; /* 最后一行条件不需要底部外边距 */
}

.query-item {
  margin-bottom: 0 !important; /* 覆盖 Element Plus el-form-item 默认的 margin-bottom，因为行间距由 .condition-row 控制 */
  display: flex; /* 使 el-form-item 内部的 label 和 content 水平排列 */
  align-items: center; /* label 和 content 垂直居中 */
}

.query-item .el-form-item__label {
  padding-right: 8px; /* 调整标签和输入框之间的间距 */
  white-space: nowrap; /* 防止标签换行 */
  flex-shrink: 0; /* 防止标签在空间不足时被压缩 */
}
.query-item .el-form-item__content {
  flex-grow: 1; /* 让输入框（或其他控件）占据剩余的可用空间 */
}

/* 为不同选择器设置建议的基础宽度和最小宽度，以适应不同内容长度 */
.field-selector { /* 查询字段选择框 */
  flex-basis: 220px; /* 理想基础宽度 */
  min-width: 180px; /* 最小宽度 */
}

.operator-selector { /* 查询方式选择框 */
  flex-basis: 180px;
  min-width: 150px;
}

.querySign-selector { /* 连接方式选择框 */
  flex-basis: 180px;
  min-width: 150px;
}

/* 用于对齐的占位符 (当是最后一行且条件数大于1时显示) */
.placeholder-querySign {
  flex-basis: 150px; /* 与连接方式选择框的基础宽度近似，以保持删除按钮对齐 */
  min-width: 120px; /* 确保占位符有一定宽度 */
  /* background-color: #f0f0f0; */ /* 仅用于调试时查看占位符位置 */
}

.delete-button {
  margin-left: auto; /* 将删除按钮自动推到 Flex 容器的最右边 */
  flex-shrink: 0; /* 防止按钮在空间不足时被压缩 */
}

.dialog-footer {
  display: flex; /* 使用 Flexbox 布局底部按钮 */
  width: 100%;
  justify-content: flex-end; /* 默认情况下，按钮组（取消、确定）靠右对齐 */
}
.add-condition-btn {
  margin-right: auto; /* 将“添加条件”按钮推到最左边，与右侧按钮组分开 */
}
</style>