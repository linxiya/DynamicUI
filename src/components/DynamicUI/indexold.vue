<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="effectiveRules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    class="dynamic-form"
    v-bind="$attrs"
    :style="localFold ? 'height: 50px;overflow: hidden' : ''"
  >
    <template v-for="formItem in props.formConfig" :key="formItem.itemKey">
      <dynamic-form-item
        :item="formItem"
        :model-value="formData[formItem.itemKey]"
        @update:modelValue="
          (value) => handleUpdateModelValue(formItem.itemKey, value)
        "
        :file-list="
          formItem.type === 9 ? formData[formItem.itemKey] : undefined
        "
        @update:fileList="
          (files) => handleUpdateFileList(formItem.itemKey, files)
        "
        @append-click="handleAppendClick"
        @item-click="itemClick"
      />
      <!-- @change="handleChange" -->
      <!-- @preview="handlePreview" -->
      <!-- @remove="handleRemove" -->
      <!-- etc. -->
      <!-- 如果 type 是 6 (单个 checkbox) 且 item 有 label, 显示在这里 -->
      <!-- 注意：DynamicFormItem 内部目前没有处理 item.label for checkbox -->
      <!-- <span v-if="formItem.type === 6 && formItem.label" style="margin-left: 5px;">
            {{ formItem.label }}
          </span> -->
    </template>
  </el-form>
  <!-- 折叠按钮 -->
  <toggle-fold :folded="localFold" @toggle="myToggleFold" v-if="initialFold" />

  <!-- 表单操作按钮区域 -->
  <div class="form-actions">
    <slot name="actions" :form="formRef" :data="formData">
      <!-- 默认提供提交和重置按钮 -->
      <!-- <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button> -->
    </slot>
  </div>
</template>

<script setup>
import DynamicFormItem from "./DynamicFormItem.vue"; //
import ToggleFold from "./ToggleFold.vue"; //
// 按需导入 Element Plus 类型，用于 JSDoc 或类型检查
// import type { FormInstance, FormRules } from 'element-plus';

// --- 定义组件 Props ---
const props = defineProps({
  // 表单配置数组，每个对象对应 DynamicFormItem 的 item prop
  formConfig: {
    type: Array,
    required: true,
    default: () => [],
    validator: (config) =>
      Array.isArray(config) &&
      config.every((item) => item && item.itemKey && item.type !== undefined),
  },
  initialFold: { type: Boolean, default: false },
  // 表单的初始数据对象，键应与 formConfig 中的 itemKey 对应
  initialData: {
    type: Object,
    default: () => ({}),
  },
  // Element Plus 的表单验证规则对象
  rules: {
    type: Object,
    default: () => ({}),
  },
  // 统一设置标签宽度
  labelWidth: {
    type: [String, Number],
    default: "100px",
  },
  // 标签位置
  labelPosition: {
    type: String,
    default: "right", // 或 'left', 'top'
  },
  // 是否在组件挂载后自动基于 formConfig 初始化 formData (如果 initialData 未提供对应 key)
  autoInitFormData: {
    type: Boolean,
    default: true,
  },
});

// --- 定义组件 Emits ---
const emit = defineEmits([
  "submit", // 表单验证成功后触发，传递表单数据
  "reset", // 表单重置后触发
  "fieldChange", // 字段值变化时触发 (可选)
  "appendClick", // 转发 DynamicFormItem 的 append-click 事件
  "itemClick", // 转发 DynamicFormItem 的 item-click 事件
]);

// 初始化后自己控制
const localFold = ref(props.initialFold);

const myToggleFold = () => {
  localFold.value = !localFold.value;
};

// --- 组件内部状态 ---

// el-form 组件实例的引用
// const formRef = ref<FormInstance | null>(null); // 使用 TypeScript 类型
const formRef = ref(null); // JS 用法

// 表单数据模型
const formData = reactive({});

// --- 表单数据初始化与更新 ---

/**
 * 根据配置和初始数据初始化或重置表单数据
 */
function initializeFormData() {
  // 清空现有 formData 的键，以防配置变化
  Object.keys(formData).forEach((key) => delete formData[key]);

  props.formConfig.forEach((item) => {
    const key = item.itemKey;
    if (props.initialData && props.initialData[key] !== undefined) {
      // 优先使用 initialData 的值
      formData[key] = props.initialData[key];
    } else if (props.autoInitFormData) {
      // 如果允许自动初始化，根据类型设置默认值
      switch (item.type) {
        case 50: // 多选下拉
        case 7: // 多选框组
        case 9: // 文件上传 (fileList 通常是数组)
        case 16: // 日期范围
        case 19: // 日期时间范围
        case 14: // 时间范围
        case 8: // 级联选择器 (可能返回数组)
          formData[key] = [];
          break;
        case 6: // 单个复选框 (使用数字 0/1)
        case 13: // 数字输入框
          formData[key] = item.defaultValue ?? 0;
          break; // 允许配置默认值
        case 3: // 开关 (使用字符串 '0'/'1')
          formData[key] = item.defaultValue ?? "0";
          break;
        default: // 其他类型默认为 null 或空字符串
          formData[key] = item.defaultValue ?? null;
      }
    } else {
      // 不自动初始化，则设为 null
      formData[key] = null;
    }
  });
  console.log(
    "Form data initialized/reset:",
    JSON.parse(JSON.stringify(formData))
  );
}

// 监听配置或初始数据的变化，重新初始化表单数据
// watch(() => [props.formConfig, props.initialData], initializeFormData, { deep: true, immediate: true });
// 使用 immediate: true 确保初始时执行一次
// 使用 deep: true 监听对象内部变化 (对于 initialData 可能需要)

// 在组件挂载后执行初始化，避免 setup 期间 props 可能未完全准备好
onMounted(() => {
  initializeFormData();
});

// 如果希望在配置或初始数据变化时动态重置表单，可以启用 watch
watch(
  () => props.formConfig,
  () => {
    console.log("Form config changed, re-initializing form data...");
    initializeFormData();
  },
  { deep: true }
);

watch(
  () => props.initialData,
  (newData, oldData) => {
    console.log("Initial data changed, updating form data...");
    // 仅更新变化的或新增的字段，避免完全重置可能导致用户输入丢失
    if (newData) {
      props.formConfig.forEach((item) => {
        const key = item.itemKey;
        if (newData[key] !== undefined && formData[key] !== newData[key]) {
          formData[key] = newData[key];
        }
      });
    }
  },
  { deep: true }
);

// --- 事件处理 ---
/**
 * 处理 DynamicFormItem 的 @update:modelValue 事件
 * @param {string} key 字段的 itemKey
 * @param {*} value 新的值
 */
function handleUpdateModelValue(key, value) {
  formData[key] = value;
  emit("fieldChange", { key, value }); // 可选：通知父组件字段变化
  // console.log(`Field ${key} updated to:`, value);
}

/**
 * 处理 DynamicFormItem 的 @update:fileList 事件 (用于 Upload)
 * @param {string} key 字段的 itemKey
 * @param {Array} files 新的文件列表
 */
function handleUpdateFileList(key, files) {
  // 确保目标是数组类型 (el-upload 的 fileList 应该是数组)
  if (
    Array.isArray(formData[key]) ||
    formData[key] === null ||
    formData[key] === undefined
  ) {
    formData[key] = files;
    emit("fieldChange", { key, value: files }); // 可选：通知父组件字段变化
    // console.log(`File list for ${key} updated.`);
  } else {
    console.warn(
      `Attempted to update file list for key "${key}", but formData.${key} is not an array.`
    );
  }
}
/**
 * 处理 DynamicFormItem 的 @item-click 事件
 * @param {object} item 被点击的表单项对象
 */
function itemClick(item) {
  console.log(item);
  emit("itemClick", item); // 将事件和 item 转发给 DynamicForm 的父组件
}

/**
 * 处理 DynamicFormItem 的 @append-click 事件
 * @param {string} key 触发事件的字段的 itemKey
 */
function handleAppendClick(key) {
  console.log(`Append button clicked for item: ${key}`);
  // 将事件和 key 转发给 DynamicForm 的父组件
  emit("appendClick", key, formData[key]); // 可以将当前字段值也传出去
}

// --- 表单验证与操作 ---

// 合并传入的 rules 和可能从 formConfig 生成的 rules (如果需要)
const effectiveRules = computed(() => {
  // 这里可以添加逻辑，根据 formConfig 中的 required 等属性自动生成基础规则
  // 例如:
  // const generatedRules = {};
  // props.formConfig.forEach(item => {
  //   if (item.required) {
  //     generatedRules[item.itemKey] = [
  //       { required: true, message: `${item.itemName || item.itemKey}不能为空`, trigger: ['blur', 'change'] }
  //     ];
  //   }
  // });
  // return { ...generatedRules, ...props.rules };
  return props.rules; // 当前实现：直接使用传入的 rules
});

/**
 * 验证表单
 * @returns {Promise<boolean>} Promise resolves with true if validation passes, false otherwise.
 */
async function validate() {
  if (!formRef.value) {
    console.error("Form reference is not available.");
    return Promise.resolve(false);
  }
  try {
    await formRef.value.validate();
    return true;
  } catch (error) {
    console.log("Form validation failed:", error);
    return false;
  }
}

/**
 * 重置表单字段
 */
function resetForm() {
  if (!formRef.value) {
    console.error("Form reference is not available.");
    return;
  }
  formRef.value.resetFields(); // Element Plus 的重置方法

  // 手动重置 formData 回到初始状态，因为 resetFields 可能不完美，
  // 特别是对于数组类型（如 fileList, 多选）或初始值不是空的情况
  initializeFormData(); // 重新应用初始值或默认值

  emit("reset"); // 通知父组件已重置
  console.log("Form reset.");
}

/**
 * 提交表单（先验证）
 */
async function submitForm() {
  const isValid = await validate();
  if (isValid) {
    console.log(
      "Form submitted successfully:",
      JSON.parse(JSON.stringify(formData))
    );
    // 触发 submit 事件，并将当前表单数据传递出去
    // 传递深拷贝的数据，防止外部修改影响内部状态
    emit("submit", JSON.parse(JSON.stringify(formData)));
  } else {
    console.log("Form submission failed due to validation errors.");
  }
}

/**
 * 获取当前表单数据
 * @param {boolean} deepCopy 是否返回深拷贝的数据，默认为 true
 * @returns {object} 表单数据对象
 */
function getFormData(deepCopy = true) {
  return deepCopy ? JSON.parse(JSON.stringify(formData)) : formData;
}

/**
 * 手动设置表单数据
 * @param {object} data 要设置的数据对象
 */
function setFormData(data) {
  if (data && typeof data === "object") {
    Object.keys(data).forEach((key) => {
      if (formData.hasOwnProperty(key)) {
        formData[key] = data[key];
      } else {
        // 如果 key 不在 formConfig 中，可以选择性地忽略或添加
        console.warn(
          `Key "${key}" provided in setFormData does not exist in the current form configuration.`
        );
      }
    });
  }
}

// --- 暴露方法给父组件 ---
// 父组件可以通过 ref 调用这里暴露的方法
defineExpose({
  validate,
  resetForm,
  submitForm, // 如果父组件想直接触发表单提交逻辑
  getFormData,
  setFormData,
  formRef, // 暴露 el-form 实例引用 (可选，谨慎使用)
});
</script>

<style scoped>
.form-actions {
  text-align: right; /* 让按钮靠右对齐 (可选) */
}
</style>
