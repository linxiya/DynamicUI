<template>
  <div class="dynamic-form-container">
    <!-- Element Plus 表单组件实例 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="effectiveRules"
      :label-position="props.labelPosition"
      class="dynamic-form-instance"
      v-bind="formComponentAttrs /* 透传给el-form的属性 */"
      :style="
        props.showFoldButton // 仅当启用折叠按钮时才应用折叠/展开样式
          ? localFold // 如果当前是折叠状态
            ? `max-height: ${formHight}; overflow: hidden; /* 折叠时样式：限制最大高度为36px并隐藏溢出内容以实现折叠效果 */`
            : 'max-height: 2000px; /* 展开时样式：设置一个足够大的最大高度（例如2000px）以容纳所有内容，可按需调整此值。内容超出此高度时，行为取决于 overflow 设置。 */ overflow: visible; /* 展开时允许内容正常显示和溢出，或者由其内部子元素处理滚动条 */'
          : '' // 如果不显示折叠按钮（即 props.showFoldButton 为 false），则不应用特殊的内联高度/溢出样式
      "
    >
      <template v-for="formItem in processedFormConfig" :key="formItem.itemKey">
        <!-- 遍历处理后的表单配置 (processedFormConfig)，动态渲染表单项 -->
        <!-- 1. 检查父组件是否为当前 formItem 提供了对应的具名插槽 -->
        <!-- $slots 是一个包含了所有传入插槽的对象，我们可以通过 key 来访问 -->
        <template v-if="$slots[`item-slot-${formItem.itemKey}`]">
          <!-- 
            2. 如果父组件提供了该插槽，就渲染这个插槽。
            我们通过 v-bind 将一些有用的内部状态（如 formRef, formData）作为作用域参数传递出去，
            这样父组件在定义插槽时就可以访问它们。
            在 PdaAutoUpdate.vue 中，我们使用了 `initialData`，它实际上就是这里的 `formData`。
            为了兼容，我们同时传递 `data` 和 `initialData`。
           -->
          <slot
            :name="`item-slot-${formItem.itemKey}`"
            :form="formRef"
            :data="formData"
            :initialData="formData"
            :item="formItem"
          ></slot>
        </template>

        <!-- 3. 如果父组件没有提供对应的插槽，则渲染默认的 dynamic-form-item 组件 -->
        <template v-else>
          <dynamic-form-item
            :mode="props.mode"
            :item="formItem"
            v-model="formData[formItem.itemKey]"
            @update:modelValue="
              (value) => handleItemFieldChange(formItem.itemKey, value)
            "
            @append-click="handleAppendClick"
            @item-click="itemClick"
            v-bind="getAttrsForItem(formItem.itemKey)"
          />
        </template>
      </template>
    </el-form>

    <!-- 折叠/展开切换组件 (ToggleFold) -->
    <toggle-fold
      v-if="
        props.showFoldButton &&
        Object.keys(formData).length !==
          0 /* 仅当 showFoldButton prop 为 true 且 formData不为空 时显示 */
      "
      :folded="localFold /* 将当前折叠状态传递给子组件 */"
      @toggle="myToggleFold"
      class="dynamic-form-fold-toggle"
    />

    <!-- 表单操作按钮区域 -->
    <div class="dynamic-form-actions">
      <!-- 高级查询配置按钮 -->
      <el-button
        v-if="
          props.enableAdvancedQuery /* 仅当 enableAdvancedQuery prop 为 true 时显示 */
        "
        @click="openAdvancedQueryDialog"
        type="default"
        class="advanced-query-button"
      >
        高级查询配置
      </el-button>

      <!-- 新增：可配置的“继续添加”复选框，仅在模式为 'add' 且 showContinueAdding 为 true 时显示 -->
      <el-checkbox
        v-if="props.showContinueAdding && props.mode === 'add'"
        v-model="localContinueAdding"
        class="continue-adding-checkbox"
      >
        {{ props.continueAddingLabel }}
      </el-checkbox>
      <!-- 操作区插槽，允许父组件自定义按钮，并传递表单实例 (formRef) 和表单数据 (formData) -->
      <slot
        name="actions"
        :form="formRef /* 传递表单实例给插槽 */"
        :data="formData /* 传递表单数据给插槽 */"
      ></slot>
    </div>

    <!-- 高级查询配置弹窗组件 (AdvancedQueryConfig) -->
    <advanced-query-config
      v-if="
        props.enableAdvancedQuery /* 仅当 enableAdvancedQuery prop 为 true 时渲染 */
      "
      :visible="showAdvancedQueryDialog"
      @update:visible="showAdvancedQueryDialog = $event"
      :queryable-fields="
        props.advancedQueryFieldsSource /* 传递可用于高级查询的字段定义列表 */
      "
      :allow-duplicate-fields="
        props.allowDuplicateFieldsInAdvancedQuery /* 是否允许在高级查询中选择重复字段 */
      "
      :initial-conditions="
        currentAppliedAdvConditions /* 传递当前已应用的高级查询条件 */
      "
      @confirm="
        (conditions) => {
          applyAdvancedQueryConfig(conditions, {
            source: 'userAction',
          }); /* 监听弹窗的 confirm 事件 */
        }
      "
    />
  </div>
</template>

<script setup>
// --- 子组件导入 ---
import DynamicFormItem from "./DynamicFormItem.vue"; // 渲染单个表单项的组件
import ToggleFold from "./ToggleFold.vue"; // 折叠/展开按钮组件
import AdvancedQueryConfig from "./AdvancedQueryConfig.vue"; // 高级查询配置弹窗组件

// --- 工具函数导入 ---
import { getAdvOperatorOptions } from "./utils/queryOperatorUtils.js"; // 高级查询操作符选项生成工具函数
import { camelToSnakeCase } from "@/utils/index"; // 工具函数：将驼峰命名字符串转换为下划线命名
// 大小
import useAppStore from "@/store/modules/app";
import { computed } from "vue";
const appStore = useAppStore();
const slots = useSlots(); // 在 setup 中声明，模板中即可使用 $slots
const size = computed(() => appStore.size);
// 计算 form 折叠高度
const formHight = computed(() => {
  // 根据当前应用的 size 设置表单的高度
  switch (size.value) {
    case "large":
      return "56px"; // 大号表单高度
    case "default":
      return "46px"; // 默认表单高度
    case "small":
      return "36px"; // 小号表单高度
    default:
      return "50px"; // 如果没有匹配，使用默认高度
  }
});

// --- Props 定义 ---
// 定义组件接收的属性及其类型、默认值和验证器
const props = defineProps({
  // 基础表单配置数组 (当没有高级查询或高级查询未启用时使用)
  // 每个对象应包含 itemKey, type, itemName 等 DynamicFormItem 需要的属性
  formConfig: {
    type: Array,
    default: () => [], // 默认空数组
    validator: (
      config // 校验器，确保 formConfig 结构正确
    ) =>
      Array.isArray(config) &&
      config.every((item) => item && typeof item.itemKey !== "undefined"),
  },
  // 表单的初始数据对象，键应与 formConfig 或高级查询生成的 itemKey 对应
  initialData: {
    type: Object,
    default: () => ({}), // 默认空对象
  },
  // Element Plus 的表单验证规则对象
  rules: {
    type: Object,
    default: () => ({}), // 默认空对象
  },
  // 标签在表单项中的位置 ('left', 'right', 'top')
  labelPosition: {
    type: String,
    default: "right", // 默认右对齐
  },
  // 是否在组件挂载后，如果 initialData 未提供对应key，则自动基于 formConfig 初始化 formData
  autoInitFormData: {
    type: Boolean,
    default: true, // 默认开启自动初始化
  },
  // 表单的初始折叠状态 (仅当 showFoldButton 为 true 时有效)
  initialFold: {
    type: Boolean,
    default: true, // 默认折叠
  },
  // 是否显示折叠/展开按钮
  showFoldButton: {
    type: Boolean,
    default: false, // 默认不显示
  },
  // 是否启用高级查询功能
  enableAdvancedQuery: {
    type: Boolean,
    default: false, // 默认不启用
  },
  // 可用于高级查询的字段定义列表，其结构与 formConfig 中的项类似
  // AdvancedQueryConfig 组件将直接使用此数据源
  advancedQueryFieldsSource: {
    type: Array,
    default: () => [], // 默认空数组
    validator: (
      val // 校验器，确保 advancedQueryFieldsSource 结构正确
    ) =>
      Array.isArray(val) &&
      val.every(
        (item) =>
          item && item.itemKey && item.itemName && item.type !== undefined
      ),
  },
  // 初始的高级查询条件列表 (用于 AdvancedQueryConfig 组件首次加载或外部设置)
  initialAdvancedConditions: {
    type: Array,
    default: () => [], // 默认空数组
  },
  //  在高级查询中是否允许选择重复字段，默认不允许
  allowDuplicateFieldsInAdvancedQuery: {
    type: Boolean,
    default: false,
  },

  // 新增：表示当前表单的模式（'add' 或 'update' 或 'view'）
  mode: {
    type: String,
    default: "add", // 默认为 'add' 模式
    validator: (value) => ['add', 'update', 'view'].includes(value),
  },

  // --- 新增：可配置的“继续添加”功能 Props ---
  showContinueAdding: {
    // 是否显示“继续添加”复选框
    type: Boolean,
    default: false,
  },
  initialContinueAdding: {
    // “继续添加”复选框的初始状态
    type: Boolean,
    default: false,
  },
  continueAddingLabel: {
    // “继续添加”复选框的文本标签
    type: String,
    default: "继续添加",
  },
  
  // 新增：禁用整个表单的属性
  disabled: { 
    type: Boolean,
    default: false,
  },
});

// --- Emits 定义 ---
// 定义组件可以触发的自定义事件
const emit = defineEmits([
  "submit", // 表单验证成功后触发，传递 { formData, _formConfigSnapshot, apiParams }
  "reset", // 表单重置后触发
  "fieldChange", // 任一表单字段值发生变化时触发，传递 { key, value }
  "appendClick", // 当 DynamicFormItem 内部的输入框后置按钮被点击时触发 (type 30)，传递 itemKey 和当前字段值
  "itemClick", // 当 DynamicFormItem 本身被点击时触发，传递表单项配置对象
  "advancedQueryChange", // 当高级查询的配置被用户确认并应用后触发，传递新的条件列表和触发来源
]);

// --- 组件实例引用 ---
// 对 el-form 组件实例的引用 (如果需要直接操作 el-form)
const formRef = shallowRef(null); // 使用 shallowRef 因为 el-form 实例通常不需要深度响应其内部变化

// --- 响应式状态 ---
// 存储表单数据的响应式对象
const formData = reactive({});
// 控制表单折叠状态的响应式变量，初始值来自 prop
const localFold = ref(props.initialFold);
// 控制高级查询配置弹窗显示状态的响应式变量
const showAdvancedQueryDialog = ref(false);
// 存储当前已应用到表单的高级查询条件列表
const currentAppliedAdvConditions = ref([]);
// 内部管理“继续添加”复选框的状态
const localContinueAdding = ref(props.initialContinueAdding);
// --- Attributes 处理 ---
// 获取所有未被 props 接收的 attribute 和事件监听器
const instanceAttrs = useAttrs();

// 计算需要传递给根 <el-form> 组件的属性
// 这样可以避免将不相关的 attrs 传递给 el-form 导致 Vue 警告
const formComponentAttrs = computed(() => {
  // 列出 el-form 支持的 props
  const elFormSupportedProps = [
    "inline",
    "size",
    "disabled",
    "validate-on-rule-change",
    "hide-required-asterisk",
    "require-asterisk-position",
    "scroll-to-error",
    "show-message",
    "inline-message",
    "status-icon",
    "validate-trigger",
    "label-width"
    // label-width 和 label-position 由 props 控制，但如果通过 attrs 传入也应考虑
  ];
  const result = {};
  for (const key in instanceAttrs) {
    // 如果是 el-form 支持的 prop 或者以 'label-' 开头的（如 label-suffix）
    if (elFormSupportedProps.includes(key) || key.startsWith("label-")) {
      result[key] = instanceAttrs[key];
    }
  }
  return result; // 返回筛选后的属性对象
});

// (高级用法) 为特定 itemKey 的 DynamicFormItem 准备透传的 attrs
// 大部分情况下，DynamicFormItem 内部的 v-bind="$attrs" 已经足够处理透传
function getAttrsForItem(itemKey) {
  // 创建一个要透传的属性对象
  const attrsToPass = {};

  // 1. 将来自父组件的全局 disabled 状态添加进去
  if (props.disabled) {
    attrsToPass.disabled = true;
  }

  // 2. (可选) 保留您原有的、处理特殊 itemKey 的逻辑
  //    这部分代码可以处理更复杂的、针对单个字段的属性透传
  // if (instanceAttrs[`item-${itemKey}-customProp`]) {
  //   attrsToPass.customProp = instanceAttrs[`item-${itemKey}-customProp`];
  // }
  
  return attrsToPass;
}

// 隐藏的属性直接过滤
const filterFormConfig = computed(() => {
  return props.formConfig
    .filter((item) => {
      const isEditDisplay = item?.isEditDisplay;
      // const isHide = item?.isHide; // 是否隐藏
      if (isEditDisplay == "3") {
        return false;
      }
      const mode = props?.mode; // 安全访问 mode
      if (mode) {
        if (mode === "add" && isEditDisplay == "0") {
          return false;
        } else if (mode === "update" && isEditDisplay == "2") {
          return false;
        }
        return true; // 默认情况下不隐藏
      }
      return true; // 如果没有 mode，则默认不隐藏
    })
    .map((item) => ({
      ...item,
      type: item.itemDetailType,
    }));
});

// 核心计算属性：根据是否启用高级查询以及当前应用的条件，
// 动态决定最终渲染到表单中的表单项配置列表。
const processedFormConfig = computed(() => {
  // 如果启用了高级查询功能
  if (props.enableAdvancedQuery) {
    // 并且有已应用的高级查询条件 (来自用户配置或 initialAdvancedConditions)
    if (currentAppliedAdvConditions.value.length > 0) {
      const advancedFormItems = [];
      currentAppliedAdvConditions.value.forEach((advCond, index) => {
        // 从高级查询字段源中找到基础配置
        const baseItemConfig = props.advancedQueryFieldsSource.find(
          (f) => f.itemKey === advCond.itemKey
        );
        if (baseItemConfig) {
          // 基于基础配置和当前条件，构建一个新的表单项配置
          advancedFormItems.push({
            ...baseItemConfig, // 继承基础配置 (type, itemName, options 等)
            itemKey: `${advCond.itemKey}_adv_${index}`, // 创建唯一的 itemKey，防止与普通表单项或同字段其他高级条件冲突
            itemName: advCond.itemName || baseItemConfig.itemName, // 优先使用高级查询条件中定义的名称，否则使用基础配置的名称
            placeholder: advCond.operatorText || baseItemConfig.placeholder, // 使用操作符文本作为 placeholder，增强提示
            _advancedInfo: {
              // 存储高级查询相关元信息，供后续处理 (如构建 API 参数、规则映射)
              originalKey: advCond.itemKey, // 原始字段的 key (例如 'userName')
              originalName: advCond.itemName || baseItemConfig.itemName, // 原始字段的名称
              operator: advCond.operator, // 操作符的值 (如 '1' 代表 '等于', '6' 代表 '包含')
              operatorText: advCond.operatorText, // 操作符的显示文本 (如 '等于', '包含')
              querySign: advCond.querySign, // 与下一个条件的连接方式 ('AND' 或 'OR')
            },
          });
        } else {
          // 如果在字段源中找不到对应的高级查询项配置，发出警告
          console.warn(
            `DynamicForm: 未找到高级查询项 "${advCond.itemKey}" 的基础配置。`
          );
        }
      });
      return advancedFormItems; // 返回构建好的高级查询表单项列表
    } else {
      // ★★★ 启用了高级查询，但当前没有任何已应用的条件 (用户未配置，也没有初始条件) ★★★
      // ★★★ 此时表单应该为空，等待用户打开高级查询弹窗进行配置 ★★★
      return []; // 返回空数组，表示不渲染任何表单项
    }
  } else {
    // ★★★ 未启用高级查询功能，使用 props.formConfig (普通表单模式) ★★★
    return filterFormConfig.value; // 直接返回通过 props 传入的基础表单配置
  }
});

// 根据字段的原始类型和配置的 defaultValue，获取其在 formData 中的默认值
function getDefaultValueForType(type, defaultValueFromConfig) {
  // 特殊处理类型 9 (Upload)，确保其值始终是数组
  // if (type === 9) {
  //   // 如果提供了 defaultValueFromConfig 并且它本身就是个数组，则使用它 (深拷贝)
  //   if (Array.isArray(defaultValueFromConfig)) {
  //     return JSON.parse(JSON.stringify(defaultValueFromConfig));
  //   }
  //   // 否则，忽略非数组的 defaultValueFromConfig，返回空数组
  //   return [];
  // }

  // 对于其他类型，如果配置中明确指定了 defaultValue，则优先使用它 (深拷贝)
  if (defaultValueFromConfig !== undefined) {
    return JSON.parse(JSON.stringify(defaultValueFromConfig)); // 返回深拷贝以避免共享引用问题
  }

  // 根据类型推断默认值
  switch (type) {
    case 50: // 多选下拉 (el-select multiple)
    case 7: // 多选框组 (el-checkbox-group)
    case 16: // 日期范围 (el-date-picker type="daterange")
    case 19: // 日期时间范围 (el-date-picker type="datetimerange")
    case 14: // 时间范围 (el-time-picker is-range)
    case 8: // 级联选择器 (el-cascader, 如果 emitPath=true 或 multiple=true, value 是数组)
      return []; // 这些类型通常对应数组
    case 6: // 单个复选框 (el-checkbox, modelValue 通常是 boolean 或由 true/false-label 决定的值)
      return false; // 或者根据 true-label/false-label 来定，但这里简化为 boolean
    case 13: // 数字输入框 (el-input-number)
      return 0; // 或 null，取决于业务需求，0 比较常见
    case 3: // 开关 (el-switch)
      return false; //  或者可以从 props.advancedQueryFieldsSource 中对应项的 inactiveValue 获取，这里简化
    default: // 文本输入框, 单选下拉, 单选框组, 日期选择器等，通常默认为 null 或空字符串
      return null;
  }
}

// 初始化或重置表单数据模型 (formData)
function initializeFormData() {
  const newFormData = {}; // 创建一个新的空对象来构建表单数据
  const configToUse = processedFormConfig.value; // 获取当前生效的表单项配置 (普通或高级查询)

  configToUse.forEach((item) => {
    const key = item.itemKey; // 表单项在 formData 中的键 (可能是原始 key，也可能是 'originalKey_adv_index')
    let valueToSet; // 准备设置的值
    let initialValueSourceKey = item.itemKey; // 默认从 initialData 中查找的 key

    // --- 处理高级查询下的 initialData 映射 ---
    if (
      props.enableAdvancedQuery &&
      item._advancedInfo &&
      item._advancedInfo.originalKey
    ) {
      // 如果是高级查询生成的表单项，尝试从 initialData 中查找其原始 key (originalKey) 对应的值
      initialValueSourceKey = item._advancedInfo.originalKey;
    }
    // --- 结束处理 ---

    // 检查 initialData 中是否存在对应的值
    if (
      props.initialData &&
      Object.prototype.hasOwnProperty.call(
        props.initialData,
        initialValueSourceKey
      )
    ) {
      const initialValue = props.initialData[initialValueSourceKey];
      if (item.type === 9) {
        // 类型 9 (Upload) 特殊处理，确保是数组
        valueToSet = Array.isArray(initialValue)
          ? JSON.parse(JSON.stringify(initialValue)) // 深拷贝数组
          : []; // 如果 initialData 中的不是数组，则设为空数组
      } else {
        valueToSet = JSON.parse(JSON.stringify(initialValue)); // 其他类型深拷贝
      }
    } else if (props.autoInitFormData) {
      // 如果 initialData 中没有，并且 autoInitFormData 为 true，则根据类型或配置的 defaultValue 获取默认值
      valueToSet = getDefaultValueForType(item.type, item.defaultValue);
    } else {
      // 如果 initialData 中没有，且 autoInitFormData 为 false，则仅根据类型获取最基础的默认值（不考虑 item.defaultValue）
      valueToSet = getDefaultValueForType(item.type, undefined);
    }
    newFormData[key] = valueToSet; // 将计算得到的值赋给新表单数据对象
  });

  // 清空旧的 formData 并用新的 newFormData 替换，以确保响应性
  Object.keys(formData).forEach((key) => delete formData[key]); // 先删除 formData 中所有旧的键
  Object.assign(formData, newFormData); // 再将 newFormData 中的键值对合并到 formData
}

// --- Watchers (侦听器) ---
// 监听可能影响表单结构或初始数据的 props 变化，以及高级查询条件的变化
watch(
  () => [
    props.formConfig, // 基础表单配置
    props.initialData, // 初始数据
    currentAppliedAdvConditions.value, // 当前应用的高级查询条件 (重要：它的变化会改变 processedFormConfig)
    props.autoInitFormData, // 是否自动初始化表单数据
    // props.mode, // 侦听 mode 变化，以便在模式切换时重新初始化表单结构和数据
  ],
  () => {
    initializeFormData(); // 当这些依赖变化时，重新初始化 formData
  },
  { deep: true, immediate: true } // deep: 监听对象内部变化; immediate: 组件挂载时立即执行一次
);

// 侦听 initialContinueAdding prop，更新 localContinueAdding
// watch(() => props.initialContinueAdding, (newVal) => {
//   localContinueAdding.value = newVal;
// });

// 侦听 mode prop，更新 localContinueAdding
watch(
  () => props.mode,
  (newVal) => {
    if (newVal === "update") {
      localContinueAdding.value = false;
    }
    resetForm(); // 切换模式时重置表单
  }
);

// 监听初始高级查询条件 prop (initialAdvancedConditions)
watch(
  () => props.initialAdvancedConditions,
  (newInitialConditions) => {
    if (
      props.enableAdvancedQuery && // 必须启用高级查询
      newInitialConditions &&
      newInitialConditions.length > 0 && // 且有初始条件
      currentAppliedAdvConditions.value.length === 0 // 并且当前用户没有配置任何条件（避免覆盖用户操作）
    ) {
      // ★★★ 应用 props 传入的默认高级查询条件结构 ★★★
      applyAdvancedQueryConfig(newInitialConditions, { source: "initialLoad" }); // 标记来源为 'initialLoad'
    }
  },
  { immediate: true, deep: true } // 立即执行，深度监听
);

// --- 事件处理器 ---

// 处理 DynamicFormItem v-model:fileList 更新 (由子组件 emit('update:fileList'))
// function handleUpdateFileList(key, files) {
//   console.log(key, files);
//   // 校验 formData[key] 是否适合存储文件列表 (应该是数组或null/undefined)
//   if (
//     Array.isArray(formData[key]) ||
//     formData[key] === null ||
//     formData[key] === undefined
//   ) {
//     formData[key] = files; // 更新 formData 中对应的值
//     emit("fieldChange", { key, value: files }); // 统一向上层发出 fieldChange 事件，传递键和更新后的文件列表
//   } else {
//     // 如果 formData[key] 类型不正确，则发出警告
//     console.warn(
//       `DynamicForm: 尝试更新键 "${key}" 的文件列表，但 formData.${key} 不是数组或 undefined。当前类型: ${typeof formData[
//         key
//       ]}`
//     );
//   }
// }

// 处理 DynamicFormItem v-model 更新 (由子组件 emit('update:modelValue'))
function handleItemFieldChange(key, value) {
  // formData[key] = value; // 注意：这里不需要手动赋值，因为 v-model="formData[formItem.itemKey]" 已经做了
  emit("fieldChange", { key, value }); // 统一向上层发出 fieldChange 事件，传递键和更新后的值
}

// 处理 DynamicFormItem 的 itemClick 事件并转发
function itemClick(itemConfig) {
  emit("itemClick", itemConfig); // 将表单项配置对象转发出去
}

// 处理 DynamicFormItem 的 appendClick 事件并转发 (通常用于 type 30 的输入框后置按钮)
function handleAppendClick(itemKey) {
  emit("appendClick", itemKey, formData[itemKey]); // 将 itemKey 和当前字段值一起发出
}

// --- 表单操作 ---
// 计算最终生效的表单验证规则
const effectiveRules = computed(() => {
  const componentSpecificRules = {}; // 用于存储最终映射到具体 uiItemKey (实际渲染的key) 的规则

  // 遍历当前实际渲染的表单项配置 (processedFormConfig)
  processedFormConfig.value.forEach((uiItemConfig) => {
    const uiItemKey = uiItemConfig.itemKey; // 这是实际渲染的 key, e.g., 'name' or 'name_adv_0'
    let ruleSourceKey = uiItemKey; // 默认从 props.rules 中查找规则时使用的 key

    // --- 确定从 props.rules 中查找规则时应该使用的 key ---
    if (uiItemConfig._advancedInfo && uiItemConfig._advancedInfo.originalKey) {
      // 如果是高级查询生成的表单项，我们应该用它的 originalKey 去 props.rules 中查找
      ruleSourceKey = uiItemConfig._advancedInfo.originalKey;
    }
    // --- 结束确定 ---

    // 尝试从 props.rules 中获取基于 ruleSourceKey 的规则
    let rulesForThisItem = [];
    if (
      props.rules &&
      Object.prototype.hasOwnProperty.call(props.rules, ruleSourceKey)
    ) {
      const parentRules = props.rules[ruleSourceKey];
      rulesForThisItem = Array.isArray(parentRules)
        ? [...parentRules] // 如果是数组，则复制数组
        : [{ ...parentRules }]; // 如果是对象，则转换为包含该对象的数组并复制对象
    }

    // 处理 itemConfig.isRequired 自动添加必填规则的逻辑
    if (uiItemConfig.isRequired) {
      let needsDefaultRequiredRule = true;
      // 检查已有的规则中是否包含了必填 (required: true)
      if (rulesForThisItem.some((rule) => rule.required === true)) {
        needsDefaultRequiredRule = false; // 如果已存在必填规则，则不添加默认的
      }

      if (needsDefaultRequiredRule) {
        const defaultMessage = `${uiItemConfig.itemName || "该项"}不能为空`; // 默认提示信息
        let trigger = ["blur", "change"]; // 默认触发时机
        // 针对特定类型的组件，将触发时机调整为 'change'
        if (
          [2, 3, 4, 5, 6, 7, 8, 9, 14, 16, 17, 19, 26, 50].includes(
            uiItemConfig.type
          )
        ) {
          trigger = "change";
        }
        const newRule = {
          required: true,
          message: defaultMessage,
          trigger: trigger,
        };
        rulesForThisItem.unshift(newRule); // 将默认必填规则加到规则列表的最前面
      }
    }

    // 将最终处理好的规则赋给实际的 uiItemKey
    if (rulesForThisItem.length > 0) {
      componentSpecificRules[uiItemKey] = rulesForThisItem;
    }
  });
  return componentSpecificRules; // 返回映射好的规则对象
});

// 验证整个表单
async function validate() {
  if (!formRef.value) {
    // 如果 el-form 实例不存在，则无法验证
    console.error("DynamicForm: 表单引用 (formRef) 不可用，无法进行验证。");
    return Promise.resolve(false); // 或抛出错误，表示验证无法执行
  }
  try {
    await formRef.value.validate(); // 调用 Element Plus el-form 的 validate 方法
    return true; // 验证通过
  } catch (invalidFields) {
    // validate 方法在验证失败时会 reject 一个包含错误信息的对象
    // console.log("DynamicForm: 表单验证失败。", invalidFields);
    return false; // 验证失败
  }
}

// 重置表单
function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields(); // Element Plus 方法：重置表单项为初始值并移除校验结果
  }
  initializeFormData(); // ★★★ 关键：重新执行我们的初始化逻辑，以确保数据回到基于当前配置（包括高级查询状态）的正确初始状态
  emit("reset"); // 通知父组件表单已重置
}

// 提交表单 (先验证)
async function submitForm() {
  const isValid = await validate(); // 首先进行表单验证
  if (isValid) {
    // 1. 获取原始的、UI层面的表单数据和配置快照
    const rawFormData = JSON.parse(JSON.stringify(formData)); // 深拷贝当前表单数据 (键是 uiItemKey, e.g., 'orgCode_adv_0')
    const formConfigSnapshot = JSON.parse(
      JSON.stringify(processedFormConfig.value)
    ); // 深拷贝当前表单配置

    // 2. ★★★ 构建目标 API 参数对象 ★★★
    const targetApiParams = {}; // 用于存储预处理后的 API 参数
    // 用于处理当一个 originalKey 对应多个 UI 条件时，只取第一个有效条件的策略 (如果需要)
    // const processedFrontendKeys = new Set(); // 本示例中，通过 if (targetApiParams[frontendKey]) 实现

    props.enableAdvancedQuery &&
      formConfigSnapshot.forEach((uiItemConfig) => {
        const uiItemKeyValue = rawFormData[uiItemConfig.itemKey]; // 获取该UI项的值

        let frontendKey; // 作为 targetApiParams 的键, e.g., 'orgCode' (通常是原始字段名)
        let backendFieldName; // 发送到后端的字段名 (可能需要转换，如驼峰转下划线)
        let queryType; // 查询类型/操作符 (如 '等于', '包含')
        let joinQueryValue; // 条件之间的连接符 (如 'AND', 'OR')

        if (uiItemConfig._advancedInfo) {
          // 如果是高级查询生成的表单项
          frontendKey = uiItemConfig._advancedInfo.originalKey; // 使用原始 key
          backendFieldName = camelToSnakeCase(frontendKey); // 将原始 key 转换为下划线命名
          queryType = uiItemConfig._advancedInfo.operator; // 使用高级查询的操作符
          joinQueryValue = uiItemConfig._advancedInfo.querySign; // 使用高级查询的连接符 ('AND' 或 'OR')
        } else {
          // 如果是普通表单项
          frontendKey = uiItemConfig.itemKey; // 使用表单项的 key
          backendFieldName = camelToSnakeCase(frontendKey); // 转换为下划线命名
          queryType = uiItemConfig.defaultOperator || "6"; // 从配置中获取普通查询的默认操作符 (假设 '6' 是 '包含')
          joinQueryValue = "1"; // 普通查询默认AND (假设 '1' 代表 'AND')
        }

        // 空值处理: 如果值为空 (null, undefined, 空字符串, 空数组) 且操作符不是 "为空" 或 "不为空"，则不为这个 UI 项生成 API 参数
        const isEmptyOperator = ["12", "13"].includes(queryType?.toString()); // 假设 '12' 是 "为空", '13' 是 "不为空"
        if (
          (uiItemKeyValue === null ||
            uiItemKeyValue === undefined ||
            (typeof uiItemKeyValue === "string" &&
              uiItemKeyValue.trim() === "") ||
            (Array.isArray(uiItemKeyValue) && uiItemKeyValue.length === 0)) &&
          !isEmptyOperator // 如果值为空，并且操作符不是“为空/不为空”类型，则跳过
        ) {
          return; // 跳过这个空的UI条件
        }

        // 核心策略：如果目标API结构要求 frontendKey 唯一，我们只取第一个遇到的有效条件
        // if (targetApiParams[frontendKey]) {
        //   // 如果已经为这个 frontendKey 创建了一个条目，则忽略后续的 (实现了“取第一个”)
        //   // console.warn(`DynamicForm: API参数键 "${frontendKey}" 已处理，后续UI条件 "${uiItemConfig.itemKey}" 将被忽略 (策略：取第一个)。`);
        //   return; // 如果 API 不允许同一个原始字段有多个条件，则跳过后续的
        // }

        // 构建单个参数项
        targetApiParams[frontendKey] = {
          fieldName: backendFieldName,
          queryType: queryType?.toString(), // 确保 queryType 是字符串
          joinQuery: joinQueryValue,
          value: Array.isArray(uiItemKeyValue)
            ? uiItemKeyValue.join(",")
            : uiItemKeyValue?.toString(), // 确保值是字符串，数组则用逗号连接
        };
        // processedFrontendKeys.add(frontendKey); // 标记已处理 (虽然上面的 if 已实现此效果)
      });

    // 3. 构建并发出 payload
    const payload = {
      formData: rawFormData, // 原始UI表单数据
      _formConfigSnapshot: formConfigSnapshot, // 原始UI配置快照
      apiParams: targetApiParams, // ★★★ 你期望的、预处理好的对象结构 ★★★
      continueAdding: localContinueAdding.value, // ★★★ 将“继续添加”状态包含在 payload 中 ★★★
    };
    emit("submit", payload); // 触发 submit 事件，并传递包含原始数据、配置快照和API参数的 payload
  } else {
    // 如果表单验证失败
    console.log("DynamicForm: Submission prevented due to validation errors.");
  }
}

// 获取当前表单数据
function getFormData(deepCopy = true) {
  // 默认进行深拷贝
  return deepCopy ? JSON.parse(JSON.stringify(formData)) : formData; // 根据参数决定是否返回深拷贝
}

// 手动设置表单数据
function setFormData(newData) {
  if (newData && typeof newData === "object") {
    Object.keys(newData).forEach((key) => {
      // 检查 key 是否是当前 formData 或预期表单结构的一部分
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        // 如果 key 存在于当前 formData 中，直接赋值
        formData[key] = newData[key];
      } else {
        // 如果 key 不在 formData 中，但存在于 processedFormConfig (意味着它是有效字段，可能是高级查询动态生成的)
        const isInConfig = processedFormConfig.value.some(
          (item) => item.itemKey === key
        );
        if (isInConfig) {
          formData[key] = newData[key]; // 允许设置这些动态生成的有效字段
        } else {
          // 否则，这是一个未知的 key，可能是错误或预期之外的数据
          console.warn(
            `DynamicForm: 尝试通过 setFormData 为未知键 "${key}" 设置值。该键不在当前表单配置中。`
          );
        }
      }
    });
  } else {
    // 如果传入的 newData 无效
    console.warn(
      `DynamicForm: 提供给 setFormData 的数据无效，期望是一个对象。`
    );
  }
}

// --- 高级查询逻辑 ---
// 打开高级查询配置弹窗
function openAdvancedQueryDialog() {
  // 在打开弹窗前，currentAppliedAdvConditions 已经包含了当前应用的条件，
  // AdvancedQueryConfig 组件会通过其 initial-conditions prop 接收这些条件并回显。
  showAdvancedQueryDialog.value = true; // 设置为 true 以显示弹窗
}

// 当 AdvancedQueryConfig 弹窗确认后，应用新的查询条件
// source: 'userAction' 表示用户操作触发的应用 (通过弹窗确认)
// source: 'initialLoad' 表示初始条件（来自 props.initialAdvancedConditions 自动加载）
function applyAdvancedQueryConfig(conditionsToApply, { source }) {
  // 将传入的条件（来自弹窗或 initialAdvancedConditions）丰富化，确保包含必要信息
  const enrichedConditions = conditionsToApply
    .map((cond) => {
      // 从字段源 (advancedQueryFieldsSource) 查找基础信息
      const baseField = props.advancedQueryFieldsSource.find(
        (f) => f.itemKey === cond.itemKey
      );
      if (!baseField) return null; // 如果找不到基础字段定义，则忽略此条件

      // 获取操作符的文本表示
      const operatorOptions = getAdvOperatorOptions(baseField.type); // 根据字段类型获取可选操作符列表
      const selectedOperator = operatorOptions.find(
        (op) => op.value === cond.operator // 从选项中找到选中的操作符
      );

      return {
        itemKey: cond.itemKey, // 字段的 key
        operator: cond.operator, // 操作符的值
        querySign: cond.querySign, // 与下一条件的连接符 ('AND'/'OR')，确保被传递
        itemName: cond.itemName || baseField.itemName, // 字段名称 (优先用条件自带的，否则用基础配置的)
        // originalType: baseField.type, // 字段原始类型 (来自基础配置)
        operatorText: selectedOperator // 操作符的显示文本
          ? selectedOperator.text // 从查找到的操作符选项中获取文本
          : cond.operatorText || "", // 如果弹窗传递了 operatorText (例如自定义输入的操作符)，也可用作备选
        // customFormDetId: cond.customFormDetId || null, // 自定义表单明细ID (如果有)
        ...baseField,
      };
    })
    .filter(Boolean); // 过滤掉为 null 的项（即找不到 baseField 的条件）

  // 深拷贝并更新当前应用的条件 (currentAppliedAdvConditions)
  currentAppliedAdvConditions.value = JSON.parse(
    JSON.stringify(enrichedConditions)
  );

  showAdvancedQueryDialog.value = false; // 关闭高级查询配置弹窗
  emit("advancedQueryChange", currentAppliedAdvConditions.value, { source }); // 通知父组件高级查询配置已更改，并传递来源

  // 由于 currentAppliedAdvConditions 的变化会触发 watcher，
  // initializeFormData() 会自动被调用来更新 formData 的结构和值。
  // 在 DOM 更新后（表单项可能已改变），清除可能存在的旧的表单校验状态。
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate(); // 清除 el-form 的校验状态
    }
  });
}

// 清除所有已应用的高级查询条件
function clearAdvancedQuery() {
  currentAppliedAdvConditions.value = []; // 清空当前应用的条件
  emit("advancedQueryChange", [], { source: "clearAction" }); // 通知父组件条件已清空，标记来源为 'clearAction'

  // initializeFormData() 会被 watcher 自动调用。
  // 因为 currentAppliedAdvConditions 变为空数组，processedFormConfig 会根据
  // props.enableAdvancedQuery 的状态决定是显示空表单（如果启用）还是 props.formConfig（如果未启用）。
  // 无论如何，DOM 结构可能改变，需要清除校验。
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate(); // 清除校验状态
    }
  });
}

// --- 折叠/展开逻辑 ---
// 切换表单的折叠/展开状态
const myToggleFold = () => {
  localFold.value = !localFold.value; // 切换 localFold 的布尔值
};

// --- 生命周期钩子 ---
onMounted(() => {
  // 组件挂载后，初始的 formData 设置由 watcher 的 immediate: true 选项处理
  // console.log('DynamicForm 已挂载。初始 formData:', JSON.parse(JSON.stringify(formData)));
  // console.log('DynamicForm 接收到的插槽:', Object.keys(slots));
});

// --- 暴露公共 API ---
// 通过 defineExpose 将组件内部的方法和属性暴露给父组件，
// 父组件可以通过 ref 访问这些API (例如: <dynamic-form ref="myForm" /> then myForm.value.submitForm())
defineExpose({
  validate, // 验证整个表单方法
  resetForm, // 重置表单到初始状态方法
  submitForm, // 验证并提交表单方法
  getFormData, // 获取当前表单数据方法
  setFormData, // 手动设置表单数据方法
  clearAdvancedQuery, // 清除高级查询配置并重置表单的方法
  formRef, // 暴露 el-form 组件实例 (谨慎使用，主要用于特定场景或访问 Element Plus 原生API)
  continueAdding: computed(() => localContinueAdding.value), // 暴露计算属性，方便父组件获取当前复选框状态
});
</script>

<style scoped>
.dynamic-form-instance {
  /* el-form 实例的样式 */
  /* transition: max-height 0.3s ease-in-out; 为折叠/展开时 max-height 的变化提供平滑过渡动画效果 */
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.dynamic-form-actions {
  /* 表单底部操作按钮区域的样式 */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: right;
  /* 默认使内部按钮（如提交、重置）靠右对齐 */
  /* margin-top: 15px; 与表单主体或折叠按钮保持间距 */
  /* padding-top: 10px; 在按钮区域上方添加一些内边距 */
  /* border-top: 1px solid #ebeef5; (可选) 在按钮区域上方添加一条分隔线，增加视觉分离 */
}

.advanced-query-button {
  /* 高级查询配置按钮的特定样式 */
  float: left;
  /* 使其靠左浮动，与右侧的常规操作按钮（如提交、重置）分开 */
  /* margin-right: 10px; */
  /* 与右侧按钮保持一些间距，如果右侧有按钮的话 */
  margin-right: auto;
}

/* 清除浮动，确保 .dynamic-form-actions 容器高度正确包裹浮动元素（如高级查询按钮） */
.dynamic-form-actions::after {
  content: "";
  clear: both;
  display: table;
}

.continue-adding-checkbox {
  margin-right: 15px;
  /* 与右侧的提交/重置按钮保持间距 */
}

.dynamic-form-actions :deep(.el-button) {
  margin-left: 10px;
}
</style>
