<template>
  <div class="app-container">
    <!-- 顶部查询区域 -->
    <div class="hearder" v-show="showSearch">
      <div class="searchForm-box">
        <!-- 动态查询表单组件 -->
        <!--
          ref="queryFormRef": 用于在JS中访问DynamicForm组件实例，调用其方法（如submitForm, resetForm, clearAdvancedQuery）
          :initial-advanced-conditions="searchItems": 设置高级查询的初始条件配置，这些条件是从后端获取并保存的用户自定义查询
          itemName-width="100px": 表单项名称的宽度
          :enable-advanced-query="true": 启用高级查询功能
          :advanced-query-fields-source="allFieldsForQuery": 定义所有可用于高级查询的字段列表，通过computed属性从baseAllFields转换而来
          :initial-data="adInitialData": 高级查询表单的初始数据（通常为空对象，或用于加载已保存的高级查询值）
          @submit="handleFormSubmit": 监听DynamicForm的提交事件，当表单提交时触发handleFormSubmit方法
          @advancedQueryChange="handleAdvancedQueryConditionsChange": 监听高级查询条件变化事件，用于保存用户自定义的高级查询
          @fieldChange="handleFieldChange": 监听表单字段值变化事件
          :show-fold-button="true": 显示折叠/展开按钮，用于控制表单的显示行数
          inline: 表单项以内联方式排列
          class="main-query-form": 自定义样式类
        -->
        <dynamic-form
          ref="queryFormRef"
          :initial-advanced-conditions="searchItems"
          :label-width="props.queryFormLabelWidth"
          itemName-width="100px"
          :enable-advanced-query="true"
          :advanced-query-fields-source="allFieldsForQuery"
          :initial-data="adInitialData"
          @submit="handleFormSubmit"
          @advancedQueryChange="handleAdvancedQueryConditionsChange"
          @fieldChange="handleFieldChange"
          :show-fold-button="true"
          inline
          class="main-query-form"
        >
          <!-- 查询表单操作按钮插槽 -->
          <!--
            #actions: DynamicForm组件提供的一个插槽，用于自定义表单底部的操作按钮
            slotProps: 通过插槽属性将公共组件内部的方法（submitQueryForm, resetQueryForm, clearAllQuery）和数据（loading, activeTab）暴露给父组件
          -->
          <template #actions>
            <div class="action-buttons">
              <!--
                query-actions插槽: 允许父组件自定义查询区域的按钮。
                默认按钮: 如果父组件不提供此插槽内容，则显示以下默认按钮。
              -->
              <slot
                name="query-actions"
                :submitQueryForm="submitQueryForm"
                :resetQueryForm="resetQueryForm"
                :clearAllQuery="clearAllQuery"
                :loading="loading"
                :activeTab="tabsWrapperRef?.value?.activeTab"
              >
                <el-button @click="clearAllQuery" type="info"
                  >全部清空</el-button
                >
                <el-button @click="resetQueryForm" type="warning"
                  >重置表单</el-button
                >
                <el-button
                  type="primary"
                  @click="submitQueryForm('table')"
                  :loading="loading"
                >
                  {{ loading ? "查询中..." : "数据查询" }}
                </el-button>
                <!-- 履历查询按钮，默认带有v-hasButton权限指令，使用props传入的权限key -->
                <el-button
                  type="primary"
                  v-hasButton="resumeButtonPermissionName"
                  @click="submitQueryForm('resume')"
                  :loading="loading"
                >
                  {{ loading ? "查询中..." : "履历查询" }}
                </el-button>
              </slot>
            </div>
          </template>
        </dynamic-form>
      </div>
    </div>

    <!-- 主内容区域：包含表格和履历（可选）的TabsWrapper -->
    <div class="content">
      <!--
        ref="tabsWrapperRef": 用于在JS中访问TabsWrapper组件实例，如切换当前激活的tab
        :showTable="true": 始终显示主数据表格tab
        :showResume="checkButtonPermission(resumeButtonPermissionKey)": 根据权限判断是否显示履历tab。
          checkButtonPermission是一个由父组件传入的权限校验函数，resumeButtonPermissionKey是履历tab的权限标识。
      -->
      <tabs-wrapper
        ref="tabsWrapperRef"
        :showTable="true"
        :showResume="checkButtonPermission(resumeButtonPermissionName)"
      >
        <!-- 表格操作按钮插槽 -->
        <!--
          #table-buttons: TabsWrapper组件提供的插槽，用于自定义表格上方的操作按钮。
          slotProps: 同样暴露公共组件内部的方法和数据给父组件。
        -->
        <template #table-buttons>
          <slot name="table-operation" :multipleSelection="multipleSelection">
            <!-- 默认按钮 -->
            <el-button
              type="success"
              v-hasButton="`${routeName}_add`"
              @click="handleAddEdit('add')"
              >新增</el-button
            >
            <el-button
              type="primary"
              v-hasButton="`${routeName}_update`"
              @click="handleAddEdit('update')"
              :disabled="multipleSelection.length !== 1"
              >编辑</el-button
            >
            <el-button
              :disabled="multipleSelection.length === 0"
              type="danger"
              v-hasButton="`${routeName}_delete`"
              @click="handleDelete()"
              >删除</el-button
            >
            <el-button
              type="primary"
              v-hasButton="`${routeName}_import`"
              @click="importHandler()"
              >导入</el-button
            >
            <el-button
              type="primary"
              v-hasButton="`${routeName}_export`"
              @click="exportExcelHandler()"
              >导出</el-button
            >
          </slot>

          <!-- 追加按钮插槽 -->
          <slot
            name="append-table-buttons"
            :multipleSelection="multipleSelection"
          ></slot>
        </template>

        <template #table-buttons-sys>
          <slot>
            <!-- 右侧系统按钮插槽 -->
            <right-toolbar
              v-model:showSearch="showSearch"
              v-model:columns="tableColumns"
              @queryTable="fetchData"
            ></right-toolbar>
          </slot>
        </template>

        <!-- 主数据表格内容 -->
        <!-- #table-content: TabsWrapper组件提供的插槽，用于放置主表格 -->
        <template #table-content>
          <!-- 动态表格组件 -->
          <!--
            :data="list": 表格数据
            :columns="dynamicTableColumns": 表格列配置，由baseAllFields动态生成
            :show-selection-column="true": 显示多选列
            @row-dblclick="handleEdit": 双击行触发编辑操作
            @selection-change="selectionChange": 监听多选框选中状态变化
            @cell-item-click="cellItemClick": 监听单元格点击事件
          -->
          <dynamic-table
            :data="list"
            :columns="tableColumns"
            :show-selection-column="true"
            :is-tree="props.isTreeTable"
            :row-key="props.idFieldName"
            :lazy-load-fn="props.lazyLoadFn"
            :tree-props="props.treeTableProps"
            @row-dblclick="handleEdit"
            @selection-change="selectionChange"
            @cell-item-click="cellItemClick"
            @cell-value-change="cellValueChange"
            @cell-event="handleCellEventFromTable"
          />

          <!-- 分页组件 -->
          <Pagination
            v-show="searchForm.total > 0"
            :total="searchForm.total"
            v-model:page="searchForm.startPage"
            v-model:limit="searchForm.pageSize"
            @pagination="fetchData"
          />
        </template>

        <!-- 履历表格内容 -->
        <!-- #resume-content: TabsWrapper组件提供的插槽，用于放置履历表格 -->
        <template #resume-content>
          <dynamic-table :data="htList" :columns="htDynamicTableColumns" />

          <!-- 履历分页 -->
          <Pagination
            v-show="htSearchForm.total > 0"
            :total="htSearchForm.total"
            v-model:page="htSearchForm.startPage"
            v-model:limit="htSearchForm.pageSize"
            @pagination="getRecordData"
          />
        </template>
      </tabs-wrapper>
    </div>

    <!-- 主表维护/新增/编辑对话框 -->
    <fullscreen-dialog
      :close-on-click-modal="false"
      :title="dialogTitle"
      draggable
      width="400px"
      v-model="editDialogVisible"
      @close="cancel('editFormRef')"
    >
      <!-- 动态表单组件，用于新增/编辑操作 -->
      <!--
            ref="editFormRef": 用于在JS中访问DynamicForm组件实例，调用其验证和重置方法
            label-width="100px": 表单项label宽度
            :form-config="editFormConfig": 表单字段配置，从baseAllFields过滤生成
            :initial-data="editInitialData": 表单的初始数据，用于编辑时回显或新增时清空
            @fieldChange="handleFieldChange": 监听字段变化
            inline: 表单项内联
            :mode="url": 表单模式，"add"或"update"
            :show-continue-adding="true": 显示“继续添加”复选框，用于连续新增场景
            :isFormDisabled: 控制表单是否禁用
            class="main-query-form": 自定义样式
          -->
      <dynamic-form
        ref="editFormRef"
        :label-width="props.editFormLabelWidth"
        :form-config="editFormConfig"
        :initial-data="editInitialData"
        @fieldChange="handleFieldChange"
        inline
        :mode="url"
        :show-continue-adding="true"
        :disabled="props.isFormDisabled || url === 'view'"
        class="main-query-form"
      >
        <!-- 
        遍历所有父组件传来的插槽 ($slots)。
        为每一个插槽，在 dynamic-form 内部创建一个同名的动态插槽 (#[slotName])。
        并将父插槽的内容 (<slot ... />) 放入这个新的动态插槽中。
      -->
        <template v-for="(_, slotName) in $slots" #[slotName]="scope">
          <slot :name="slotName" v-bind="scope" />
        </template>
        <!-- 提交操作按钮（此按钮区域为dynamic-form内部插槽，不暴露给父组件） -->
        <template #actions="{ data }">
          <div class="action-buttons text-center">
            <el-button @click="cancel('editFormRef')">{{ url === 'view' ? '关闭' : '取消' }}</el-button>
            <el-button
              size="default"
              v-if="url !== 'view'"
              type="primary"
              @click="onSubmit(data)"
              >保存</el-button
            >
          </div>
        </template>
      </dynamic-form>
    </fullscreen-dialog>

    <!-- 导入数据对话框 -->
    <UserImportDialog
      v-model="showImportVisible"
      title="数据导入"
      :headers="{ fromrout: routeName }"
      :upload-url="importApi()"
      @import-success="handleUserImportSuccess"
    />

    <slot name="dialog" />
  </div>
</template>

<script setup>
import { useSlots } from "vue"; // 确保导入
import { ElLoading } from "element-plus";
const slots = useSlots(); // 确保声明
// 引入必要的库和组件
import {
  getCustomFormDet, // 获取自定义表单详情配置的API
  getSearchDetail, // 获取用户保存的高级查询配置的API
} from "@/api/BasicSystem/CustomFormDetails";
import download from "@/plugins/download"; // 下载插件，用于导出Excel

import { transformRawConfigToTableColumns } from "@/components/DynamicUI/utils/tableConfigConverter"; // 将后端返回的表单配置转换为DynamicTable的列配置
import { mergeDynamicOptions } from "@/components/DynamicUI/utils/formConfigConverter"; // 将动态选项映射合并到表单配置中
import { useAdvancedQueryPersistence } from "@/composables/useAdvancedQueryPersistence"; // 高级查询持久化Hook

import RightToolbar from "@/components/RightToolbar/index.vue"; // [!code ++]
import { computed } from "vue";

const { saveConditions } = useAdvancedQueryPersistence(); // 从Hook中获取保存高级查询条件的方法
const { proxy } = getCurrentInstance(); // 获取当前组件实例的代理对象，用于访问全局属性如$modal

// 定义组件的props，使其具有高度的通用性和可配置性
const props = defineProps({
  /**
   * @property {string} routeName - 当前页面的路由名称，用于获取对应的自定义表单配置 (fromRout参数)，以及导入/导出时的文件名。
   * @required true
   */
  routeName: {
    type: String,
    required: true,
    default: "",
  },
  /**
   * @property {object} api - 包含CRUD操作的API接口对象。
   * @default 包含空操作的Promise函数，避免未传入时报错。
   * @example { getList: api.getList, addEdit: api.addEdit, delete: api.delete, import: api.import, export: api.export }
   */
  api: {
    type: Object,
    default: () => ({
      getList: () => Promise.resolve({ data: [], count: 0 }),
      addEdit: () => Promise.resolve({}),
      deleteData: () => Promise.resolve({}),
      importData: () => Promise.resolve(""),
      exportData: () => Promise.resolve(""),
    }),
  },

  /**
   * @property {string} idFieldName - 数据记录的唯一标识字段名，用于删除操作时获取选中行的ID。
   * @default 'id'
   * @example 'factoryId', 'userId'
   */
  idFieldName: {
    type: String,
    default: "id", // 默认ID字段名
  },

  /**
   * isTreeTable - 是否为树形表格。
   * 用于控制DynamicTable组件的isTree属性。
   */
  isTreeTable: { type: Boolean, default: false },

  /**
   * treeTableProps - 树形表格的配置项。
   * 用于配置DynamicTable组件的treeProps属性。
   * @default { children: "children", hasChildren: "hasChildren" }
   */
  treeTableProps: {
    type: Object,
    default: () => ({ children: "children", hasChildren: "hasChildren" }),
  },

  /**
   * lazyLoadFn - 树形表格的懒加载函数。
   * 用于DynamicTable组件的load属性，实现按需加载子节点数据。
   * @default null
   */
  lazyLoadFn: { type: Function, default: null },

  /**
   * @property {object} dynamicOptionsMap - 动态选项映射对象，用于为表单字段注入动态数据源。
   * @default {}
   */
  dynamicOptionsMap: {
    type: Object,
    default: () => ({}),
  },

  isFormDisabled: {
    type: Boolean,
    default: false,
  },
  queryFormLabelWidth: { type: [String, Number], default: "120px" },
  editFormLabelWidth: { type: [String, Number], default: "120px" },
});

//履历标识
const resumeButtonPermissionName = computed(() => {
  return `${props.routeName}_findHtList`;
});

// --- Emits 定义 ---
// 定义组件可以触发的自定义事件
const emit = defineEmits([
  "cell-append-click", // DynamicInputControl 后置按钮点击时触发
  "cell-item-click", // DynamicInputControl 内部元素点击 (如链接) 或只读链接点击时触发
  "cell-value-change", // 单元格值改变时触发
  "cell-upload-event", // DynamicInputControl 中上传组件相关事件的统一出口
  "config-loaded", // 当子组件的配置加载完成后触发
  "list-updated", // 当列表数据更新后触发
  "before-add", // 在新增操作前触发
  "cell-event", // 用于处理通用的 change, focus, blur 等
]);

// 暴露方法
defineExpose({
  fetchData, // 获取主数据列表
  updateFieldConfig, // 更新字段配置
  handleAddEdit, // 暴露 handleAddEdit 方法
});

// 模板引用，用于访问子组件实例
const queryFormRef = ref(null); // 查询表单的引用
const loading = ref(false); // 查询加载状态
const tabsWrapperRef = ref(null); // 主页面TabsWrapper的引用
const editFormRef = ref(null); // 编辑/新增表单的引用

// 查询表单的状态和分页信息
const searchForm = reactive({
  startPage: 1, // 当前页码
  pageSize: 20, // 每页条数
  total: 0, // 总条数
  query: {}, // 实际提交的查询参数
});

// 履历查询表单的状态和分页信息
const htSearchForm = reactive({
  startPage: 1,
  pageSize: 20,
  total: 0,
  query: {},
});

// 存储从后端获取的原始表单字段配置
const baseAllFields = ref([]);

// 计算属性：用于高级查询的字段列表
const allFieldsForQuery = computed(() => {
  if (!Array.isArray(baseAllFields.value)) {
    return [];
  }
  // 转换原始字段配置为DynamicForm高级查询所需的格式
  return baseAllFields.value.map((item) => ({
    itemKey: item.itemKey, // 字段键名
    itemName: item.itemName, // 字段显示名称
    type: item.itemSearchType, // 搜索类型 (例如：'text', 'number', 'date', 'select')
    isEnum: item.isEnum, // 是否为枚举类型
    enumData: item.enumData , // 枚举数据（如果isEnum为true）
    defaultValue: item.itemValue, // 默认值
    customFormDetId: item.customFormDetId, // [!code ++] <<< 核心修改：在这里添加 customFormDetId
  }));
});

// 计算属性：用于新增/编辑表单的字段配置
const editFormConfig = computed(() => {
  // 1. 先从 baseAllFields 过滤出需要在表单中显示的字段
  const filteredFields = baseAllFields.value.filter((v) =>
    [1, 3].includes(v.showType)
  );

  // 2. 调用工具函数，将动态选项合并进去
  return mergeDynamicOptions(filteredFields, props.dynamicOptionsMap);
});

// 高级查询的初始数据（通常为空，或用于加载已保存的高级查询值）
const adInitialData = ref({});
// 新增/编辑表单的初始数据
const editInitialData = ref({});

const customFormId = ref(""); // 当前自定义表单的ID
const searchItems = ref([]); // 从后端获取的高级查询初始配置
const appliedAdvancedConditions = ref([]); // 当前应用的高级查询条件

const showSearch = ref(true); // [!code ++] RightToolbar 需要此状态来控制搜索区域的显隐
const tableColumns = ref([]); // [!code ++] 将表格列配置改为 ref，以便 RightToolbar 可以修改

// 弹窗名称
const dialogTitle = computed(() => {
  if (url.value === "add") return "新增";
  if (url.value === "update") return "编辑";
  if (url.value === "view") return "查看";
  return "";
});

// // 计算属性：主数据表格的列配置
// const dynamicTableColumns = computed(() => {
//   // 调用工具函数，将原始字段配置转换为DynamicTable所需的列配置
//   return transformRawConfigToTableColumns(baseAllFields.value);
// });

watch(
  baseAllFields,
  (newFields) => {
    const transformedColumns = transformRawConfigToTableColumns(newFields);
    // 保留用户已经设置的显隐和排序状态
    if (tableColumns.value.length > 0) {
      // 创建一个映射，保存旧列的 visible 状态
      const visibilityMap = new Map(
        tableColumns.value.map((c) => [c.key, c.visible])
      );

      // 创建一个新的有序列表，按照旧的顺序排列
      const orderedNewColumns = [];
      const newColumnsMap = new Map(transformedColumns.map((c) => [c.key, c]));

      // 1. 按照旧顺序添加列
      tableColumns.value.forEach((oldCol) => {
        if (newColumnsMap.has(oldCol.key)) {
          const newCol = newColumnsMap.get(oldCol.key);
          newCol.visible = visibilityMap.get(oldCol.key); // 恢复可见性
          orderedNewColumns.push(newCol);
          newColumnsMap.delete(oldCol.key); // 从map中移除，剩下的就是新增的列
        }
      });

      // 2. 添加新增的列
      orderedNewColumns.push(...newColumnsMap.values());
      tableColumns.value = orderedNewColumns;
    } else {
      tableColumns.value = transformedColumns;
    }
  },
  { deep: true, immediate: true }
);

// 计算属性：履历表格的列配置
const htDynamicTableColumns = computed(() => {
  // 履历表格通常需要显示所有字段，或有不同的显示规则，这里将所有字段都设为列表类型
  const htAllFields = baseAllFields.value.map((item) => ({
    ...item,
    itemListType: 0, // 假设0表示所有字段都在履历列表中显示
  }));
  return transformRawConfigToTableColumns(htAllFields);
});

// 列表数据
const list = ref([]); // 主数据列表
const htList = ref([]); // 履历数据列表

// 表格多选框选中的数据
const multipleSelection = ref([]);

// 编辑/新增对话框的显示状态
const editDialogVisible = ref(false);

// 导入对话框的显示状态
const showImportVisible = ref(false);

// 当前操作类型标识 ('add' 或 'update')
const url = ref("");

/**
 * @description 查询主数据列表。
 * @async
 */
async function fetchData() {
  loading.value = true;
  let params = { query: searchForm.query }; // 从查询表单获取参数

  if (props.isTreeTable) {
    // 树形表格模式下，初始查询只获取根节点
    // params.parentId = 0;
  } else {
    // 普通表格模式下，添加分页参数
    params.startPage = searchForm.startPage;
    params.pageSize = searchForm.pageSize;
  }

  try {
    const res = await props.api.getList(params);
    if (props.isTreeTable) {
      // 对返回的根节点数据进行处理，添加 hasChildren 标志
      list.value = (res.data || []).map((item) => ({
        ...item,
        // 根据业务逻辑判断，例如 isMenu !== 2
        hasChildren: item.hasChildren !== false,
      }));
    } else {
      list.value = res.data || [];
      searchForm.total = res.count || 0;
      emit("list-updated", list.value);
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    list.value = [];
    if (!props.isTreeTable) searchForm.total = 0;
  } finally {
    loading.value = false;
    // 数据加载完成后，触发事件通知父组件
    // emit("fetch-loaded", baseAllFields.value);
  }
}

/**
 * @description 查询履历数据列表。
 * @async
 */
async function getRecordData() {
  loading.value = true;
  const params = {
    query: htSearchForm.query,
    startPage: htSearchForm.startPage,
    pageSize: htSearchForm.pageSize,
    resumeQuery: true, // 标识为履历查询
  };
  try {
    const res = await props.api.getList(params); // 调用父组件传入的getList API
    htList.value = res.data || [];
    htSearchForm.total = res.count || 0;
  } catch (error) {
    console.error("获取履历数据时出错:", error);
    htList.value = [];
    htSearchForm.total = 0;
  } finally {
    loading.value = false;
  }
}

/**
 * @description 获取自定义表单的配置项。
 * @async
 */
async function getConfigSetting() {
  try {
    // 根据props.routeName获取对应路由的自定义表单配置
    const { data } = await getCustomFormDet({
      status: 1,
      startPage: 1,
      pageSize: 99999,
      fromRout: props.routeName,
    });
    baseAllFields.value = data; // 存储所有字段配置
    customFormId.value = data && data[0]?.customFormId; // 获取第一个表单的ID，用于高级查询保存

    // 获取并设置用户保存的高级查询条件
    if (customFormId.value) {
      await getSearchDetail({ customFormId: customFormId.value }).then(
        (res) => {
          searchItems.value = res.data;
        }
      );
    }
  } catch (error) {
    console.error("获取配置项失败:", error);
    return Promise.reject(error);
  } finally {
    // 配置加载完成后，触发事件通知父组件
    emit("config-loaded", baseAllFields.value);
  }
}

/**
 * @description 更新 baseAllFields 中特定字段的配置。
 * @param {string} itemKey - 要更新的字段的 itemKey。
 * @param {object} newConfig - 一个包含要更新的键值对的对象, 例如 { enumData: '[...]' }。
 */
function updateFieldConfig(itemKey, newConfig) {
  if (!baseAllFields.value || baseAllFields.value.length === 0) {
    console.warn("DynamicCrudPage: baseAllFields 尚未加载，无法更新字段配置。");
    return;
  }

  const fieldIndex = baseAllFields.value.findIndex(
    (field) => field.itemKey === itemKey
  );

  if (fieldIndex !== -1) {
    // 找到了字段，使用 Object.assign 更新它
    // 这样做可以保留原有属性，只覆盖新传入的属性
    Object.assign(baseAllFields.value[fieldIndex], newConfig);
  } else {
    console.warn(
      `DynamicCrudPage: 未在 baseAllFields 中找到 itemKey 为 "${itemKey}" 的字段。`
    );
  }
}

/**
 * @description 处理DynamicForm内部字段值变化的回调函数。
 * @param {object} fieldData - 包含字段键和新值的对象。
 */
function handleFieldChange({ key, value }) {
  // console.log("字段变化:", key, value);
  // 可在此处添加额外的字段联动逻辑
}

/**
 * @description 当DynamicForm内部的高级查询配置发生变化时的回调函数。
 *              用于保存用户自定义的高级查询条件。
 * @param {Array<object>} conditions - 变化后的高级查询条件数组。
 * @param {object} eventMeta - 事件相关的元数据 (例如，变化的来源)。
 */
async function handleAdvancedQueryConditionsChange(conditions, eventMeta) {
  appliedAdvancedConditions.value = conditions; // 更新本地存储的条件

  // 只有当变化是由用户操作触发时才执行保存
  if (eventMeta && eventMeta.source === "userAction") {
    if (!customFormId.value) {
      proxy.$modal.msgError("无法保存高级查询：自定义表单ID丢失。");
      return;
    }
    try {
      await saveConditions(customFormId.value, conditions); // 调用useAdvancedQueryPersistence中的保存方法
    } catch (error) {
      console.error("保存高级查询条件失败:", error);
    }
  }
}

/**
 * @description 处理DynamicForm表单提交时的回调函数。
 * @param {object} payload - 表单提交的数据，包含最终提交给API的参数 `apiParams`。
 */
function handleFormSubmit(payload) {
  // 根据当前激活的tab来更新对应的查询参数并重新获取数据
  if (tabsWrapperRef.value.activeTab === "resume") {
    htSearchForm.query = payload.apiParams;
    htSearchForm.startPage = 1; // 重置页码
    getRecordData(); // 调用获取履历数据的方法
  } else if (tabsWrapperRef.value.activeTab === "table") {
    searchForm.query = payload.apiParams;
    searchForm.startPage = 1; // 重置页码
    fetchData(); // 调用获取主数据的方法
  }
}

/**
 * @description 通过ref调用DynamicForm的submitForm方法来提交查询表单。
 * @param {string} tabsName - 指定提交后要激活的tab名称 ('table' 或 'resume')。
 */
function submitQueryForm(tabsName = "table") {
  tabsWrapperRef.value.activeTab = tabsName; // 切换到目标tab
  if (queryFormRef.value) {
    queryFormRef.value.submitForm(); // 触发DynamicForm的内部提交逻辑
  }
}

/**
 * @description 通过ref调用DynamicForm的resetForm方法来重置查询表单并清空结果列表。
 */
function resetQueryForm() {
  if (queryFormRef.value) {
    queryFormRef.value.resetForm(); // 重置表单值和校验
    list.value = []; // 清空主数据列表
    htList.value = []; // 清空履历数据列表
  }
}

/**
 * @description 清空所有查询条件 (包括高级查询和表单) 并清空结果列表。
 */
function clearAllQuery() {
  if (queryFormRef.value) {
    queryFormRef.value.clearAdvancedQuery(); // 清除高级查询条件
    queryFormRef.value.resetForm(); // 重置表单（这会基于清空后的配置来初始化）
    appliedAdvancedConditions.value = []; // 清空本地存储的高级条件
    list.value = []; // 清空主数据列表
    htList.value = []; // 清空履历数据列表
    proxy.$modal.msgSuccess("所有查询条件已清空。"); // 提示用户
  }
}

/**
 * @description 处理表格多选框选中数据变化的回调函数。
 * @param {Array<object>} selection - 当前选中的数据行对象数组。
 */
function selectionChange(selection) {
  multipleSelection.value = JSON.parse(JSON.stringify(selection));
  // console.log("选中数据:", selection);
}

/**
 * @description 处理表格单元格点击事件的回调函数。
 * @param {object} cellData - 包含单元格相关数据的对象 ({ itemConfig, row, index })。
 */
function cellItemClick(cellData) {
  // console.log("单元格点击:", cellData);
  // 可在此处添加点击单元格的业务逻辑
  emit("cell-item-click", cellData); // 触发自定义事件，传递单元格数据
}

/**
 * @description 通用的单元格事件处理函数，用于处理来自 DynamicTable 组件的各种事件。
 * @param {object} eventData - 包含事件相关数据的对象 ({ eventType, itemConfig, row, index, value })。
 *                             eventType 可以是 'change', 'focus', 'blur' 等。
 */
function handleCellEventFromTable(eventData) {
  // 直接将从 DynamicTable 接收到的事件数据原封不动地 emit 出去
  emit("cell-event", eventData);
}

/**
 * @description 处理表格单元格值变化事件的回调函数。
 * @param {object} cellData - 包含单元格相关数据的对象 ({ itemConfig, row, index, newValue, oldValue })。
 */
function cellValueChange(cellData) {
  // console.log("单元格值变化:", cellData);
  // 可在此处添加单元格值变化的业务逻辑
  emit("cell-value-change", cellData); // 触发自定义事件，传递单元格数据
}

/**
 * @description 处理表格行双击编辑的操作。
 * @param {object} row - 被双击的行数据对象。
 */
function handleEdit(row) {
  handleAddEdit("update", row);
}

/**
 * @description 处理新增/编辑/查看操作。
 * @param {'add' | 'update' | 'view'} type - 操作模式。
 * @param {object} [row] - (可选) 基础行数据，主要用于获取ID。如果未提供，则尝试使用 multipleSelection。
 * @param {Function} [fetchDetailFn] - (可选) 获取详情数据的异步函数。
 */
async function handleAddEdit(type, row, fetchDetailFn) {
  url.value = type; // 设置当前操作模式

  // --- 1. 确定操作的基础数据源 (targetRow) ---
  let targetRow = row;
  if (!targetRow && (type === 'update' || type === 'view')) {
    if (multipleSelection.value.length !== 1) {
      proxy.$modal.msgWarning("请选择一条记录进行操作！");
      return;
    }
    targetRow = multipleSelection.value[0];
  }

  // --- 2. 根据模式执行不同的数据准备逻辑 ---
  if (type === 'add') {
    let initialData = {};
    // 触发 before-add 事件，允许父组件进一步修改或取消
    let proceed = true;
    emit("before-add", {
      initialData: initialData,
      selection: multipleSelection.value,
      cancel: () => { proceed = false; },
    });

    if (!proceed) {
      console.log("新增操作已被父组件取消。");
      return;
    }
    editInitialData.value = initialData;

  } else {
    // --- 编辑 或 查看 模式 ---
    if (!targetRow || !targetRow[props.idFieldName]) {
        proxy.$modal.msgWarning("无效的数据，无法进行操作。");
        return;
    }
    
    // 统一的数据加载流程
    let loadingInstance;
    try {
      if (typeof fetchDetailFn === 'function') {
        loadingInstance = ElLoading.service({ text: '正在加载数据...' });
        // 如果提供了 fetchDetailFn，则调用它获取最新数据
        let response;
        if (fetchDetailFn.length > 0) { // 检查函数是否需要参数
          response = await fetchDetailFn(targetRow[props.idFieldName]);
        } else {
          response = await fetchDetailFn();
        }
        editInitialData.value = response.data;
        loadingInstance.close();
      } else {
        // 如果没有提供，则直接使用行数据（深拷贝）
        editInitialData.value = JSON.parse(JSON.stringify(targetRow));
      }
    } catch (error) {
      console.error("加载详情数据失败:", error);
      ElMessage.error("加载数据失败！");
      return; // 失败则不打开对话框
    }
  }

  // --- 3. 打开对话框 ---
  editDialogVisible.value = true;
}

/**
 * @description 处理编辑/新增对话框内表单提交的异步函数。
 * @async
 * @param {object} data - 从对话框内表单提交的数据（仅包含用户修改或输入的新数据）。
 */
async function onSubmit(data) {
  let isValid = false;
  if (editFormRef.value) {
    isValid = await editFormRef.value.validate(); // 触发表单验证
  }
  if (isValid) {
    const continueAdding = editFormRef.value.continueAdding; // 获取“继续添加”复选框状态
    try {
      // 合并初始数据和表单修改的数据，然后调用父组件传入的addEdit API
      await props.api.addEdit(url.value, { ...editInitialData.value, ...data });
      proxy.$modal.msgSuccess(
        url.value === "add" ? "新增成功！" : "编辑成功！"
      );

      // 根据“继续添加”状态决定后续操作
      if (continueAdding) {
        editFormRef.value.resetForm(); // 重置表单，以便继续填写下一条
        editInitialData.value = {}; // 重置数据模型，确保表单清空
        proxy.$modal.msg("请继续填写下一条数据。");
      } else {
        editDialogVisible.value = false; // 关闭弹窗
      }
      fetchData(); // 刷新主列表数据
    } catch (error) {
      console.error("提交表单失败:", error);
      // 错误已由axios拦截器处理，这里无需额外处理用户提示
    }
  }
}

/**
 * @description 处理删除选中记录操作的异步函数。
 * @async
 */
async function handleDelete() {
  if (multipleSelection.value.length === 0) {
    proxy.$modal.msgWarning("请至少选择一条记录进行删除");
    return;
  }
  // 根据props.idFieldName字段名获取所有选中记录的ID
  const idsToDelete = multipleSelection.value.map(
    (item) => item[props.idFieldName]
  );
  try {
    await proxy.$modal.confirm("确定要删除选中的记录吗？"); // 弹出确认框
    await props.api.deleteData(idsToDelete); // 调用父组件传入的delete API
    proxy.$modal.msgSuccess("删除成功！");
    fetchData(); // 刷新数据
  } catch (err) {
    console.log("用户取消删除操作或删除失败:", err);
  }
}

/**
 * @description 关闭对话框时的处理函数，重置表单数据。
 * @param {string} refName - 对话框内表单的引用名称。
 */
function cancel(refName) {
  if (refName === "editFormRef" && editFormRef.value) {
    editInitialData.value = {}; // 清空初始数据
    // editFormRef.value.resetForm(); // 重置表单校验和数据
  }
  editDialogVisible.value = false; // 关闭对话框
}

/**
 * @description 返回用于导出的API函数。
 * @returns {Function} 导出API函数。
 */
function exportApi() {
  return props.api.exportData();
}

/**
 * @description 返回用于导入的API函数。
 * @returns {Function} 导入API函数。
 */
function importApi() {
  return props.api.importData && props.api.importData();
}

/**
 * @description 执行导出Excel操作的函数。
 */
function exportExcelHandler() {
  download.exportExcel(
    exportApi(), // 调用内部封装的导出API函数
    {
      query: searchForm.query, // 使用当前的查询参数
      fromRout: props.routeName, // 使用prop中的路由名称
    },
    `${props.routeName}_数据.xlsx` // 文件名
  );
}

/**
 * @description 显示导入对话框。
 */
function importHandler() {
  showImportVisible.value = true;
}

/**
 * @description 处理导入成功的回调函数。
 */
function handleUserImportSuccess() {
  proxy.$modal.msgSuccess("导入成功！");
  fetchData(); // 导入成功后刷新数据
}

// 生命周期钩子：组件挂载后执行
onMounted(async () => {
  await getConfigSetting(); // 获取自定义表单配置
  submitQueryForm(); // 默认执行一次数据查询
  // console.log('DynamicCrudPage 接收到的插槽:', Object.keys(slots));
});
</script>
