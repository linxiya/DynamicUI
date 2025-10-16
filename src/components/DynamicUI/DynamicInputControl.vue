<template>
  <!-- 使用 Vue 的 <component> 动态渲染具体表单控件 -->
  <component
    :is="componentName /* 计算属性，根据 props.item.type 决定要渲染的 Element Plus 组件名 */"
    :ref="componentRef /* 对动态渲染出的组件实例的引用，按需使用 */"
    :modelValue="props.modelValue"
    @update:modelValue="handleModelValueUpdate"
    @change="handleChange" 
    v-model:file-list="uploadFileList /* 专为 el-upload 的 v-model:fileList 绑定 */"
    v-bind="{ ...componentPropsComputed, ...attrs /* 合并计算生成的组件 props 和从父组件透传的 attrs (包括事件监听器) */ }"
    @click="$emit('item-click', props.item?.itemKey) /* 为整个控件添加点击事件，触发 item-click，通常用于特殊交互 */"
  >
    <!-- 特定组件的插槽内容 -->

    <!-- 输入框后置按钮 (当 item.type === 30，通常表示搜索输入框) -->
    <template v-if="props.item?.type === 30" #append>
      <el-button :icon="Search /* Element Plus 图标 */" @click="emit('append-click', props.item.itemKey) /* 触发 append-click 事件 */" />
    </template>

    <!-- 下拉选择框 (el-select) 的选项 -->
    <template v-if="componentName === 'el-select'">
      <el-option
        v-for="opt in parsedEnumData /* 遍历解析后的枚举数据 (通常是 [{value: '', text: ''}]) */"
        :key="opt.value"
        :label="opt.text"
        :value="opt.value"
      />
    </template>

    <!-- 单选框组 (el-radio-group) 的选项 -->
    <template v-if="componentName === 'el-radio-group'">
      <el-radio
        v-for="opt in parsedEnumData"
        :key="opt.value"
        :value="opt.value" 
      >{{ opt.text }}</el-radio>
    </template>

    <!-- 多选框组 (el-checkbox-group) 的选项 -->
    <template v-if="componentName === 'el-checkbox-group'">
      <el-checkbox
        v-for="opt in parsedEnumData"
        :key="opt.value"
        :value="opt.value" 
      >{{ opt.text }}</el-checkbox>
    </template>

    <!-- 文件上传 (el-upload) 的触发器插槽 -->
    <template v-if="componentName === 'el-upload'" #trigger>
       <!-- 如果父组件通过 attrs 传递了 #trigger 插槽内容，则 attrs.trigger 会被渲染。 -->
       <!-- 若未传递，且 el-upload 自身也没有默认 trigger 内容，则这里可以提供一个默认触发器。 -->
       <!-- 此处代码表示：如果父组件在 v-bind="attrs" 中传递了 slot 内容 (例如通过 itemConfig.itemAttrs 传递)，则用父组件的；否则使用 el-upload 的默认触发器或此处的按钮 -->
        <el-button size="small" type="primary">点击上传</el-button>
    </template>
    <!-- 文件上传 (el-upload) 的提示信息插槽 -->
     <template v-if="componentName === 'el-upload'" #tip>
        <!-- 同上，优先使用父组件通过 attrs 传递的 #tip 内容 -->
        <!-- 此处提供了一个注释掉的示例，可以根据需要放开或自定义 -->
        <!-- <div class="el-upload__tip">只能上传 jpg/png 文件...</div> -->
    </template>

    <!-- 其他组件可能需要的插槽可以在这里根据 componentName 判断添加 -->
    <!-- 例如：级联选择器 (el-cascader) 的自定义后缀图标等 -->

    <!-- 通用插槽透传 (如果需要，但通常对于这种控件封装，具名插槽更明确) -->
     <!-- <slot></slot> -->
     <!-- <slot name="prefix"></slot> -->
     <!-- <slot name="suffix"></slot> -->

  </component>

  <!-- 图片预览的对话框 -->
  <el-dialog v-model="preview.visible" title="预览" append-to-body>
    <img :src="preview.url" style="display: block; max-width: 100%; margin: 0 auto;" />
  </el-dialog>

  <!-- 如果 componentName 计算为空 (即未识别的 item.type)，则显示回退提示 -->
  <span v-if="!componentName">未知控件类型: {{ props.item?.type }}</span>
</template>

<script setup>
import { ElMessage } from 'element-plus'; // 按需引入 Element Plus 消息提示 (用于上传超出限制)
import { Search } from '@element-plus/icons-vue'; // 引入 Search 图标
import store from "@/store"; //  Vuex store 实例 (用于获取全局状态如语言)
import { getToken } from "@/utils/auth"; // 获取认证 token 的工具函数 (用于上传)

// --- 定义组件 Props ---
const props = defineProps({
  item: { // 核心配置对象，描述了控件的类型、属性、枚举数据等
    type: Object,
    required: true,
    validator: (value) => { // 校验器，确保 item 对象至少包含 itemKey 和 type
      return typeof value.itemKey !== 'undefined' && typeof value.type !== 'undefined';
    }
  },
  modelValue: null, // 用于 v-model 双向绑定的值
  // fileList: { // 专为 Upload 组件 (el-upload) 的 v-model:fileList 准备的 prop
  //   type: Array,
  //   default: () => []
  // }
});

// --- 定义组件 Emits ---
const emit = defineEmits([
  'update:modelValue',  // v-model 更新事件
  // 'update:fileList',    // v-model:fileList 更新事件 (用于 el-upload)
  'append-click',       // 输入框后置按钮点击事件
  'item-click',         // 控件整体点击事件
  'change', // 控件值变化事件 (例如 el-switch 的 change 事件)
  // --- 向上冒泡的 el-upload 组件事件 ---
  'preview',      // 预览文件
  'remove',       //移除文件
  'beforeRemove', // 移除文件前钩子
  'success',      // 上传成功
  'error',        // 上传失败
  'exceed',       // 文件超出个数限制
  'change'        // 文件状态改变 (el-upload 自带)
]);

// --- 组件内部状态和上下文 ---
const attrs = useAttrs(); // 获取所有未在 props 中声明但在父组件模板中使用的属性 (包括 class, style, onXxx 事件监听器)
const componentRef = ref(null); // 对动态渲染出的组件实例的引用 (可选)

// --- 计算属性 (Computed) ---

// 上传配置
// --- 基础配置 ---
// 从 Vite 环境变量中获取文件预览的基础 URL，例如 '/minio-public-api/'
const baseUploadUrl = import.meta.env.VITE_APP_BASE_URL;
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "ocean-support/file/upload"); // 文件上传的目标 URL
const importHeaders = computed(() => ({ token: getToken() })); // 上传请求的头部信息，通常包含认证 Token


// --- 专门为 el-upload 准备的内部 fileList 状态 ---
const uploadFileList = ref([]);
// 用于图片预览的对话框状态
const preview = reactive({
  visible: false,
  url: '',
});


// --- 核心逻辑：数据转换与同步 (只对 type:9 生效) ---

/**
 * 辅助函数：将相对路径转换为可供预览的完整 URL
 * @param {string | null} relativePath - 如 "2025/10/13/logo.png"
 * @returns {string} - 如 "/minio-public-api/2025/10/13/logo.png"
 */
const toFullPath = (relativePath) => {
  if (relativePath && !relativePath.startsWith('http') && !relativePath.startsWith(baseUploadUrl)) {
    return baseUploadUrl + relativePath;
  }
  return relativePath || '';
};

/**
 * 关键！监听外部传入的 modelValue (相对路径) 的变化，来同步内部的 uploadFileList。
 * 这解决了数据回显的问题。
 */
watch(() => props.modelValue, (newRelativePath) => {
  // 仅当处理上传组件时才执行
  if (props.item.type !== 9) return;

  // 获取当前 fileList 中文件的相对路径（如果有的话）
  const currentFile = uploadFileList.value[0];
  const currentRelativePath = currentFile ? (currentFile.relativePath || null) : null;

  // 如果外部传入了新的相对路径，并且与当前 fileList 中的不一致
  if (newRelativePath && newRelativePath !== currentRelativePath) {
    const fullUrl = toFullPath(newRelativePath);
    uploadFileList.value = [{
      name: String(newRelativePath).substring(newRelativePath.lastIndexOf('/') + 1),
      url: fullUrl,           // 存储【完整 URL】用于 el-upload 的预览
      status: 'success',
      uid: Date.now(),
      relativePath: newRelativePath, // 在文件对象上保存一份【相对路径】，用于后续比较
    }];
  } else if (!newRelativePath && uploadFileList.value.length > 0) {
    // 如果外部将路径清空 (modelValue 变为 null 或 '')，则清空 fileList
    uploadFileList.value = [];
  }
}, { immediate: true });

// 解析枚举数据 (用于 Select, RadioGroup, CheckboxGroup)
const parsedEnumData = computed(() => {
  const item = props.item ?? {}; // 安全访问 props.item
  // console.log(item);
  // 检查 item.isEnum 是否为1 (表示是枚举类型) 且 enumData 是非空字符串 或者是数组
  if (item.isEnum == 1) {
    let enumArray = [];
    if (Array.isArray(item.enumData)) {
      enumArray = item.enumData; // 直接使用数组
    } else if (typeof item.enumData === 'string' && item.enumData.trim() !== '') {
      try {
        enumArray = JSON.parse(item.enumData); // 尝试解析 JSON 字符串
      } catch (e) {
        console.error('DynamicInputControl: 无法解析 enumData:', item.enumData);
        return []; // 解析失败则返回空数组
      }
    }
    // 过滤掉不合法的项，确保每项至少有 value 和 text
    return enumArray.filter(opt => opt && typeof opt.value !== 'undefined' && typeof opt.text !== 'undefined');
  }
  return []; // 不满足条件也返回空数组
});

// 计算日期选择器 (el-date-picker) 的相关配置
const datePickerConfig = computed(() => {
  const item = props.item ?? {};
  // 映射 item.type 到 el-date-picker 的 type 和默认 format
  const map = {
    4: { value: "date", format: "YYYY-MM-DD" },            // 日期
    16: { value: "daterange", format: "YYYY-MM-DD" },       // 日期范围
    17: { value: "datetime", format: "YYYY-MM-DD HH:mm:ss" }, // 日期时间
    18: { value: "datetime", format: "YYYY-MM-DD HH:mm:ss" }, // (与17重复, 可能是旧配置兼容)
    19: { value: "datetimerange", format: "YYYY-MM-DD HH:mm:ss" }, // 日期时间范围
  };
  const config = map[item.type] || { value: "date", format: "YYYY-MM-DD" }; // 未匹配则默认为 "date"

  // 优先使用 item 中配置的 format 和 valueFormat，否则使用映射的默认值
  const displayFormat = item.format || config.format; // 显示格式
  const valueFormat = item.valueFormat || displayFormat; // 绑定值格式 (v-model 的值)

  return {
    type: config.value, // el-date-picker 的 type
    format: displayFormat,
    valueFormat: valueFormat,
    // pickerOptions: item.pickerOptions, // 旧版 Element UI 的 pickerOptions，Element Plus 中很多已扁平化或通过 attrs 传递
  };
});

// 核心计算属性：根据 props.item.type 决定要渲染的组件名称
const componentName = computed(() => {
  const type = props.item?.type;
  switch (type) {
    case 0: return 'el-input';         // 普通输入框
    case 1: return 'el-input';         // (可能与0类型相同，或有细微差别由 componentPropsComputed 处理)
    case 30: return 'el-input';        // 带后置按钮的输入框 (通过 #append slot 实现)
    case 40: return 'el-input';        // 密码输入框 (通过 el-input 的 type='password' 实现)
    case 2: return 'el-select';        // 下拉选择框 (单选)
    case 50: return 'el-select';       // 下拉选择框 (多选，通过 el-select 的 multiple=true 实现)
    case 3: return 'el-switch';        // 开关
    case 4:                             // 日期选择器 (date)
    case 16:                            // 日期范围选择器 (daterange)
    case 17:                            // 日期时间选择器 (datetime)
    case 18:                            // 日期时间选择器 (datetime)
    case 19: return 'el-date-picker';   // 日期时间范围选择器 (datetimerange)
    case 5: return 'el-radio-group';   // 单选框组
    case 6: return 'el-checkbox';      // 单个多选框
    case 7: return 'el-checkbox-group';// 多选框组
    case 8: return 'el-cascader';      // 级联选择器
    case 20: return 'el-tree-select';   // 类型 20 对应 el-tree-select
    case 9: return 'el-upload';        // 文件上传
    case 12: return 'el-input';        // 文本域 (通过 el-input 的 type='textarea' 实现)
    case 13: return 'el-input-number'; // 数字输入框
    case 14:                            // 时间范围选择器
    case 26: return 'el-time-picker';   // 时间选择器 (单个时间点)
    default:
      console.warn('DynamicInputControl: 未知的控件类型:', type, '对应的 itemKey:', props.item?.itemKey);
      return null; // 返回 null 或一个占位组件名，模板中有处理
  }
});

/**
 * @description 处理内部组件的 modelValue 更新事件
 * @param {*} value - 组件返回的新值
 */
function handleModelValueUpdate(value) {
  emit('update:modelValue', value);
}

/**
 * @description 处理内部组件的 change 事件，并将其向上 emit
 * @param {*} value - change 事件的回调参数 (例如 el-switch 的新值)
 */
function handleChange(value) {
  // 我们将 change 事件原封不动地向上 emit
  emit('change', value);
}

// --- el-upload 事件处理器 ---
// 这些处理器将 el-upload 的原生事件参数进行包装 (如果需要) 或直接透传，并通过 emit 向上层组件派发。
// 这样做的好处是 DynamicInputControl 的父组件可以统一监听这些事件，而不需要关心内部是哪个上传组件。

/**
 * 点击文件列表中已上传的文件时的钩子 (预览)。
 */
const handleUploadPreview = (uploadFile) => {
  const previewUrl = uploadFile.url; // 此时的 url 已经是我们处理好的完整 URL

  // 判断文件类型，如果是图片则显示预览，否则触发下载
  const isImage = (file) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
    const fileSuffix = file.name.split('.').pop().toLowerCase();
    const imageSuffixes = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    return imageTypes.includes(file.raw?.type) || imageSuffixes.includes(fileSuffix);
  };
  if (isImage(uploadFile)) {
    preview.url = previewUrl;
    preview.visible = true;
  } else {
    // 非图片文件，触发下载
    const link = document.createElement('a');
    link.href = previewUrl;
    link.target = '_blank';
    link.download = uploadFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  emit('preview', uploadFile);
};

/**
 * 文件列表移除文件时的回调。
 */
const handleUploadRemove = (uploadFile, uploadFiles) => {
  // 当文件被移除时，清空 v-model (相对路径)
  emit('update:modelValue', '');
  uploadFileList.value = uploadFiles; // 同步内部列表
  emit('remove', { uploadFile, uploadFiles });
};

const handleUploadBeforeRemove = (uploadFile, uploadFiles) => { // 删除文件之前的钩子，参数为上传的文件和文件列表。若返回 false 或者返回 Promise且被 reject，则停止删除。
  // 检查父组件是否通过 $attrs (即 v-on:before-remove) 传递了 onBeforeRemove 监听器
  const parentListener = attrs.onBeforeRemove; // attrs.onXxxx 对应父组件的 @xxxx
  if (typeof parentListener === 'function') {
    // 如果父组件提供了监听器，调用它并返回其结果 (父组件可以决定是否阻止删除)
    return parentListener(uploadFile, uploadFiles);
  }
  // 如果父组件没有提供监听器，则仅触发 beforeRemove 事件作为通知，并默认允许删除
  emit('beforeRemove', { uploadFile, uploadFiles });
  return true; // 默认允许删除
};

/**
 * 上传成功的回调。
 * @param {object} response - 后端返回的响应，例如 { code: 200, data: { url: '...' } }
 */
const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  if (response.code === 200) {
    const relativeUrl = response.data.url; // 获取【相对路径】
    
    // 1. 通过 emit 更新 v-model，将【相对路径】传递给父组件
    emit('update:modelValue', relativeUrl);
    
    // 2. 更新内部 uploadFileList 中对应文件的 URL 为【完整路径】，以便预览
    const fullUrl = toFullPath(relativeUrl);
    const successFile = uploadFiles.find(f => f.uid === uploadFile.uid);
    if (successFile) {
      successFile.url = fullUrl;
      successFile.relativePath = relativeUrl; // 同时保存相对路径
    }
    
    ElMessage.success("上传成功");
  } else {
    ElMessage.error(response.msg || "上传失败");
    // 上传失败时，从 UI 列表中移除该文件
    uploadFileList.value = uploadFiles.filter(f => f.uid !== uploadFile.uid);
  }
  emit('success', { response, uploadFile, uploadFiles });
};

const handleUploadChange = (uploadFile, uploadFiles) => {
  // 当我们手动管理 v-model:file-list 时，需要确保这里的数组引用正确
  uploadFileList.value = uploadFiles;
  emit('change', { uploadFile, uploadFiles });
};

const handleUploadError = (error, uploadFile, uploadFiles) => { // 文件上传失败时的钩子
  console.error('DynamicInputControl: Upload error:', error, '文件:', uploadFile);
  emit('error', { error, uploadFile, uploadFiles });
};

const handleUploadExceed = (files, uploadFiles) => { // 当超出个数限制 (limit) 时的钩子
  // ElMessage.warning(`文件数量不能超过 ${props.item.limit || '设定'} 个`); // 可以从 item 中获取 limit
  ElMessage.warning(`当前限制选择 ${props.item.limit || 1} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + uploadFiles.length} 个文件`); // Element Plus 官方示例的提示更友好
  emit('exceed', { files, uploadFiles });
};

// --- 计算要传递给动态渲染的 Element Plus 组件的禁用项 ---
const isDisabled = computed(() => {
  // 规则0: 如果 attrs.disabled 明确为 true，则始终禁用 (最高优先级)
   if (attrs.disabled === true) {
    return true;
  }
  // 规则1: 如果 disabled 值为 "3"，则始终禁用 
  const disabledConfig = props.item?.disabled;
  if (disabledConfig === "3" || disabledConfig === 3) {
    return true; 
  }
  
  // 从 attrs 中获取当前表单的模式 ('add' or 'update')
  const mode = attrs?.mode;
  if (mode) {
    // 规则2: 如果是'新增'模式，且 disabled 值为 "2"，则禁用
    if (mode === 'add' && (disabledConfig === "2" || disabledConfig === 2)) {
      return true; 
    }
    // 规则3: 如果是'更新'(编辑)模式，且 disabled 值为 "1"，则禁用
    else if (mode === 'update' && (disabledConfig === "1" || disabledConfig === 1)) {
      return true; 
    }
  }
  
  // 其他所有情况，均不禁用
  return false;
});

// --- 计算要传递给动态渲染的具体 Element Plus 组件的 Props ---
const componentPropsComputed = computed(() => {
  const item = props.item ?? {}; // 安全访问
  // 基础通用 Props，大部分组件都支持
  const baseProps = {
    // size: item.size || 'small', // 默认大小
    placeholder: !isDisabled.value ? (item.placeholder || `请输入${item.itemName || item.itemKey}`) : '',
    clearable: item.clearable !== false, // 默认可清除
    disabled: isDisabled.value, // 是否禁用 (根据 props.item.disabled 和 mode 决定)
    style: item.style || '', // 自定义样式
  };

  // 根据 item.type 为不同组件类型定制 Props
  switch (item.type) {
    case 0: case 1: case 30: // el-input (普通、类型1、带后置按钮)
      return { ...baseProps };
    case 40: // el-input (密码)
      return { ...baseProps, type: 'password', showPassword: true };
    case 12: // el-input (textarea)
      return { ...baseProps, type: 'textarea', rows: item.rows || 1, autosize:{ minRows: 1, maxRows: 10 }, resize: item.resize || 'vertical' };
    case 2: // el-select (单选)
      return { ...baseProps, filterable: item.filterable !== false /* 默认可筛选 */ };
    case 50: // el-select (多选)
      return { ...baseProps, filterable: item.filterable !== false, multiple: true, collapseTags: true, collapseTagsTooltip: true };
    case 3: // el-switch
      return {
        disabled: baseProps.disabled, // switch 没有 placeholder, clearable
        activeColor: item.activeColor,
        inactiveColor: item.inactiveColor,
        activeValue: item.activeValue !== undefined ? item.activeValue : 1, // 激活时的值
        inactiveValue: item.inactiveValue !== undefined ? item.inactiveValue : 0, // 关闭时的值
      };
    case 4: case 16: case 17: case 18: case 19: // el-date-picker
      const dpConfig = datePickerConfig.value; // 使用上面计算好的日期配置
      const isDateRange = dpConfig.type.includes('range'); // 判断是否是范围选择
      return {
        ...baseProps, // placeholder 会被下面的覆盖
        type: dpConfig.type,
        format: dpConfig.format,
        valueFormat: dpConfig.valueFormat,
        rangeSeparator: item.rangeSeparator || (isDateRange ? '至' : undefined), // 范围分隔符
        startPlaceholder: item.startPlaceholder || (isDateRange ? "开始日期" : undefined),
        endPlaceholder: item.endPlaceholder || (isDateRange ? "结束日期" : undefined),
        placeholder: isDateRange ? (item.placeholder || '选择日期范围') : (item.placeholder || '选择日期'), // 覆盖 baseProps 的 placeholder
      };
    case 5: // el-radio-group (选项通过 slot 渲染)
      return { disabled: baseProps.disabled, style: baseProps.style };
    case 6: // el-checkbox (单个)
      return {
        disabled: baseProps.disabled,
        trueLabel: item.trueLabel, // 选中状态的值
        falseLabel: item.falseLabel, // 未选中状态的值
        border: item.border, // 是否显示边框
        style: baseProps.style,
        label: item.checkboxLabel || item.itemName, // el-checkbox 自身标签 (若不用 slot)
      };
    case 7: // el-checkbox-group (选项通过 slot 渲染)
      return { disabled: baseProps.disabled, style: baseProps.style };
    case 8: // el-cascader
      return {
        ...baseProps,
        options: item.options || [], // 级联数据源
        props: item.cascaderProps || { checkStrictly: false, emitPath: true, expandTrigger: 'click' }, // 级联配置
        // showAllLevels, separator, filterable (已在 baseProps) 等
      };
    case 20: // el-tree-select
      return {
        ...baseProps,
        // 将 item.options 绑定到 el-tree-select 的 data 属性
        data: item.options || [], 
        
        // props 用于告诉组件如何解析 data 中的数据结构
        // 允许后端配置，或提供一个合理的默认值
        props: item.treeSelectProps || { value: 'value', label: 'label', children: 'children' },
        
        // el-tree-select 的其他常用属性
        checkStrictly: item.checkStrictly !== false, // 默认 true (可以选择任意一级)
        filterable: item.filterable === true,        // 是否可筛选
        "show-checkbox": item.showCheckbox === true, // 是否显示复选框 (用于多选)
        multiple: item.multiple === true,            // 是否多选
        
        // 确保 render-after-expand 默认为 false，以避免懒加载时出现问题
        "render-after-expand": item.renderAfterExpand === true,
      };
    case 9: // el-upload
      return { // 这些属性是 el-upload 特有的
        disabled: baseProps.disabled,
        action: import.meta.env.VITE_APP_BASE_API + "/ocean-support/file/upload", // 上传地址
        headers: { token: getToken() },
        listType: item.listType || 'text',
        accept: item.accept,
        limit: item.limit,
        
        // --- 绑定所有事件处理器 ---
        'on-change': handleUploadChange,
        'on-preview': handleUploadPreview,
        'on-remove': handleUploadRemove,
        'before-remove': handleUploadBeforeRemove,
        'on-success': handleUploadSuccess,
        'on-error': handleUploadError,
        'on-exceed': handleUploadExceed,
        
        autoUpload: item.autoUpload !== false,
        drag: item.drag === true, // 是否启用拖拽上传
        multiple: item.multiple === true, // 是否支持多选文件
        name: item.name || 'file', // 上传的文件字段名
        data: item.uploadData, // 上传时附带的额外参数
        withCredentials: item.withCredentials === true, // 是否支持发送 cookie 凭证信息
        showFileList: item.showFileList !== false, // 是否显示已上传文件列表 (默认true)
        style: baseProps.style,
        httpRequest: item.customHttpRequest, // 覆盖默认的上传行为，可以自定义上传实现
      };
    case 13: // el-input-number
      return {
        disabled: baseProps.disabled,
        placeholder: baseProps.placeholder,
        style: baseProps.style,
        controlsPosition: item.controlsPosition || 'right', // 控制按钮位置
        min: item.min, // 最小值
        max: item.max, // 最大值
        step: item.step, // 步长
        precision: item.precision, // 数值精度
        stepStrictly: item.stepStrictly, // 是否只能输入 step 的倍数
      };
    case 14: // el-time-picker (时间范围)
    case 26: // el-time-picker (单个时间点)
      const isTimeRange = item.type === 14;
      return {
        disabled: baseProps.disabled,
        style: baseProps.style,
        isRange: isTimeRange, // 是否为时间范围选择
        format: item.format || 'HH:mm:ss', // 显示在输入框中的格式
        valueFormat: item.valueFormat || 'HH:mm:ss', // 绑定值的格式
        rangeSeparator: item.rangeSeparator || (isTimeRange ? '-' : undefined),
        startPlaceholder: item.startPlaceholder || (isTimeRange ? "开始时间" : undefined),
        endPlaceholder: item.endPlaceholder || (isTimeRange ? "结束时间" : undefined),
        placeholder: isTimeRange ? (item.placeholder || '选择时间范围') : (item.placeholder || '选择时间'),
        arrowControl: item.arrowControl === true, // 是否使用箭头进行时间选择
      };
    default: // 未知类型或不需要特殊 props 的类型 (如已在 componentName 中处理的 el-input)
      return { ...baseProps };
  }
});

// --- 暴露公共 API (如果需要) ---
// defineExpose({}); // 这个内部动态控件通常不需要对外暴露方法或属性
</script>

<style scoped>
/* 组件的局部样式 */

/* 允许文本域垂直调整大小 */
:deep(textarea.el-textarea__inner) {
  resize: vertical;
}

/* Upload 组件提示文字的样式 (如果使用默认 tip 插槽，且没有被父组件覆盖) */
:deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}


/* 特殊调整：对于内联性质的控件或组合控件，宽度通常自适应内容 */
:deep(.el-radio-group),
:deep(.el-checkbox-group),
:deep(.el-switch),
:deep(.el-checkbox) {
  width: auto; /* 移除继承的 width: 100% (如果父级有) */
  /* display: inline-flex;  可以考虑，确保内部元素良好对齐 */
  vertical-align: middle; /* 改善与其他行内元素的对齐 */
}

/* el-upload 根据 list-type 表现不同，通常不需要强制 width: 100% */
:deep(.el-upload) {
   /* 根据实际布局需求调整，例如在表格单元格中，可能希望上传按钮不要撑满 */
}

/* 调整带后置按钮的输入框 #append 插槽的内边距，使其看起来更紧凑 */
:deep(.el-input-group__append .el-button) { /* 更精确指向按钮 */
    padding: 0 10px;
    margin: -1px; /* 尝试修正边框问题 */
}
:deep(.el-input-group__append){
  padding: 0; /* 移除append容器的padding，让按钮自己控制 */
}

</style>