
# DynamicUI & DynamicCrudPage 组件套件文档

## 1. 概述

本组件套件旨在快速、高效地构建符合项目规范的、数据驱动的后台管理页面。其核心思想是**“配置驱动UI”**，大部分页面的布局、表单和表格都由后端数据库中的**自定义表单配置**来定义，前端组件负责解析这些配置并渲染出对应的界面。

### 核心组件层级

```
- 业务页面 (例如: SysDept.vue, PdaAutoUpdate.vue)
  |
  └─ DynamicCrudPage.vue (页面级框架)
     |
     ├─ DynamicForm.vue (用于查询和编辑)
     |  |
     |  └─ DynamicInputControl.vue (渲染具体的表单控件)
     |
     ├─ DynamicTable.vue (用于数据显示)
     |  |
     |  └─ DynamicInputControl.vue (用于表格内编辑)
     |
     ├─ TabsWrapper.vue (布局)
     |
     └─ RightToolbar.vue, Pagination.vue, 等辅助组件
```

## 2. 核心理念：后端配置驱动

本套件的基石是后端的**自定义表单配置**（例如 `tbl_sys_custom_form_det` 表）。前端通过 `getCustomFormDet` API 获取这些配置，然后动态生成界面。开发者应首先熟悉后端表单配置中的关键字段。

### 关键后端配置字段 (`tbl_sys_custom_form_det`)

| 字段名 | 作用 | 示例值 |
| :--- | :--- | :--- |
| `item_key` | **必需**。字段的唯一标识，用于`v-model`绑定。 | `userName` |
| `item_name` | **必需**。字段的中文标签。 | `用户名称` |
| `show_type` | **必需**。决定字段在哪个视图中显示。 | `1`: 全部显示, `2`: 仅列表, `3`: 仅表单 |
| `item_detail_type`| 详情/编辑表单中渲染的控件类型。 | `0`: `el-input`, `3`: `el-switch`, `20`: `el-tree-select` |
| `item_list_type` | 表格列的渲染类型。 | `0`: 纯文本, `11`: 可点击链接 |
| `item_search_type`| 查询表单中渲染的控件类型。 | `0`: `el-input`, `2`: `el-select`, `16`: `el-date-picker`(范围) |
| `is_enum` | 是否为枚举类型 (需要配合 `enum_data`)。 | `1`: 是, `0`: 否 |
| `enum_data` | 枚举数据，JSON字符串。 | `[{"text":"启用","value":1},{"text":"禁用","value":0}]` |
| `disabled` | 精细化禁用规则。 | `1`:编辑时禁用, `2`:新增时禁用, `3`:始终禁用 |
| `tree_select_props`| `el-tree-select`的数据结构配置，JSON字符串。 | `{"value":"deptId","label":"deptName","children":"depts"}` |
| `order_num` | 字段在表单或表格中的显示顺序。 | `10`, `20` |

---

## 3. `DynamicCrudPage.vue` (页面级框架)

这是构建一个标准CRUD页面的**主入口组件**。它封装了查询、表格、分页、新增/编辑对话框等所有通用逻辑。

### 3.1. 基本用法

在您的业务页面（如 `SysDept.vue`）中，您只需要提供 API 接口和一些页面特有的配置即可。

```vue
<!-- src/views/BasicSystem/SysDept.vue -->
<template>
  <dynamic-crud-page
    :route-name="route.name"
    :api="{ getList, addEdit, deleteData, importData, exportData }"
    id-field-name="deptId"
  />
</template>

<script setup name="SysDept">
import { useRoute } from 'vue-router';
import {
  getList,
  addEdit,
  deleteData,
  importData,
  exportData,
} from "@/api/BasicSystem/SysDept";

const route = useRoute();
</script>```

### 3.2. Props API

| Prop | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `routeName` | `String` | **必需** | 当前页面的路由 `name`，用于获取对应的后端表单配置。 |
| `api` | `Object` | **必需** | 包含页面所需CRUD接口的对象，必须包含 `getList`, `addEdit`, `deleteData` 等方法。 |
| `idFieldName`| `String` | `'id'` | 表格数据的主键字段名，用于删除和编辑操作。 |
| `queryFormLabelWidth`|`String/Number`| `'120px'` | **查询表单**的标签宽度。 |
| `editFormLabelWidth`| `String/Number`| `'120px'` | **新增/编辑表单**的标签宽度。 |
| `isFormDisabled`| `Boolean` | `false` | **最高优先级**。设为`true`时，新增/编辑表单将整体禁用（只读），用于“查看详情”模式。 |
| `isTreeTable`| `Boolean` | `false` | 是否启用**树形表格**模式。 |
| `treeTableProps`| `Object` | `{ children: 'children', hasChildren: 'hasChildren' }` | `el-table` 的 `tree-props` 配置。 |
| `lazyLoadFn`| `Function` | `null` | 树形表格的**懒加载**函数。函数签名: `async function(row, treeNode, resolve)`。 |
| `dynamicOptionsMap`| `Object` | `{}` | 用于为表单字段**注入动态选项**。键为`itemKey`，值为包含选项数组的 `ref` 或 `computed`。 |
| `appendFormItems`| `Array` | `[]` | 用于在表单末尾**追加不受后端控制**的字段配置。 |
| `v-model:editDialogVisible` | `Boolean` | (可选) | 双向绑定对话框的显示状态，允许父组件从外部控制对话框。 |

### 3.3. Slots API (插槽)

插槽是 `DynamicCrudPage` 最强大的定制功能。

| 插槽名 | 作用域数据 | 描述 |
| :--- | :--- | :--- |
| `#query-actions`| `{ submitQueryForm, ... }` | 完全替换查询区域的按钮。 |
| `#table-operations`| `{ multipleSelection }` | 完全替换表格上方的默认操作按钮（新增、编辑等）。 |
| `#append-table-buttons` | `{ multipleSelection }` | 在默认表格操作按钮**之后追加**新的按钮。 |
| `#dialog` | | 完全替换默认的新增/编辑对话框。用于实现高度自定义的编辑界面。 |
| `#item-slot-{itemKey}` | `{ initialData, form, item }` | **透传插槽**。精确替换新增/编辑对话框中 `itemKey` 对应的那个表单项的渲染。 |

### 3.4. Events API (事件)

| 事件名 | 载荷 (Payload) | 描述 |
| :--- | :--- | :--- |
| `@config-loaded` | `(baseAllFields)` | 当从后端获取的自定义表单配置加载并处理完毕后触发。 |
| `@list-updated` | `(list)` | 当表格数据更新后触发。 |
| `@before-add` | `{ initialData, selection, cancel }` | 在打开新增对话框前触发，允许父组件修改初始值或调用 `cancel()` 来阻止打开。 |
| `@cell-event` | `{ eventName, row, itemKey, payload }` | 响应表格内可编辑控件的通用事件（如 `change`, `focus`）。 |
| `@cell-upload-event`| `{ eventName, row, itemKey, eventData }`| 专门响应表格内文件上传控件的所有事件。 |

### 3.5. Exposed API (暴露的方法)

通过 `ref` 可以调用子组件的方法。
```vue
<dynamic-crud-page ref="crudPageRef" ... />
```

| 方法名 | 参数 | 描述 |
| :--- | :--- | :--- |
| `fetchData()` | | 手动刷新主表格数据。 |
| `submitQueryForm()` | | 手动触发表单查询。 |
| `resetQueryForm()` | | 重置查询表单。 |
| `clearAllQuery()` | | 清空所有查询条件，包括高级查询。 |
| `handleAddEdit(mode, row, fetchFn)` | `mode`, `row?`, `fetchFn?` | 手动打开新增/编辑/查看对话框。 |
| `updateFieldConfig(itemKey, newConfig)` | `itemKey`, `newConfig` | 动态修改某个字段的配置（例如，为其添加点击事件）。 |

---

## 4. `DynamicForm.vue` & `DynamicInputControl.vue`

`DynamicForm` 是所有表单渲染的核心，`DynamicInputControl` 负责渲染具体的控件。它们通常由 `DynamicCrudPage` 内部调用，但了解其核心 `prop` 对后端配置数据很有帮助。

### 4.1. 核心 Prop: `form-config`

`DynamicForm` 接收一个**字段配置数组**，数组中的每个对象 (`formItem`) 定义了一个表单项。

#### `formItem` 对象的核心属性

| 属性 | 类型 | 描述 |
| :--- | :--- | :--- |
| `itemKey` | `String` | **必需**。字段的 `v-model` 键名。 |
| `itemName`| `String` | **必需**。`el-form-item` 的 `label`。 |
| `type` | `Number` | **必需**。决定渲染哪个控件，见下方的类型映射表。 |
| `isRequired`| `Boolean` | 是否为必填项，会自动添加校验规则。 |
| `disabled` | `String/Number`| `1`:编辑时禁用, `2`:新增时禁用, `3`:始终禁用 |
| `isEnum` | `Number` | `1` 表示是枚举类型，将使用 `enumData`。 |
| `enumData`| `String` | `JSON.stringify` 后的选项数组 `[{text, value}]`。 |
| `options` | `Array` | 如果是**动态注入**的数据，使用此属性（例如，为 `el-tree-select` 提供数据）。 |
| `placeholder`| `String` | 占位提示文本。 |
| `defaultValue`| `any` | 字段的默认值。 |

#### `type` 属性映射表 (`item_detail_type`, `item_search_type`)

| type | 渲染组件 | 描述 |
| :--- | :--- | :--- |
| `0` | `el-input` | 普通输入框 |
| `1` | `el-input` | (同0) |
| `2` | `el-select` | 下拉选择 (单选) |
| `3` | `el-switch` | 开关 |
| `4` | `el-date-picker` | 日期选择器 (date) |
| `5` | `el-radio-group` | 单选框组 |
| `7` | `el-checkbox-group` | 多选框组 |
| `8` | `el-cascader` | 级联选择器 |
| `9` | `el-upload` | 文件/图片上传 |
| `12`| `el-input` | 文本域 (textarea) |
| `13`| `el-input-number` | 数字输入框 |
| `16`| `el-date-picker` | 日期范围 (daterange) |
| `19`| `el-date-picker` | 日期时间范围 (datetimerange) |
| `20`| `el-tree-select` | 树形选择器 |
| `30`| `el-input` | 带后置搜索按钮的输入框 |
| `40`| `el-input` | 密码输入框 |
| `50`| `el-select` | 下拉选择 (多选) |

---

好的，我们继续完成 `DynamicTable.vue` 的文档部分，并对整个文档进行最终的润色。

---

## 5. `DynamicTable.vue` (表格生成器)

`DynamicTable` 是所有列表数据的核心展示组件。它负责解析列配置 (`columns` prop) 并渲染出一个功能丰富的 `el-table`，支持普通列表、树形懒加载、可编辑单元格、以及自定义渲染等多种模式。

#### 5.1. 核心 Prop: `columns`

`DynamicTable` 的行为完全由 `columns` 这个 prop 驱动。它是一个对象数组，每一项都定义了一列表格的行为和外观。这个数组通常由 `utils/tableConfigConverter.js` 中的 `transformRawConfigToTableColumns` 函数从后端配置自动生成。

一个典型的列 (`column`) 对象包含以下核心属性：

| 属性 | 类型 | 描述 |
| :--- | :--- | :--- |
| `itemKey` | `String` | **必需**。列的唯一标识，对应 `el-table-column` 的 `prop`，用于从行数据中取值。 |
| `itemName` | `String` | **必需**。列的表头 `label`。 |
| `visible` | `Boolean` | **必需**。由 `RightToolbar` 控制，决定该列是否显示。 |
| `key` | `String` | **必需**。与 `itemKey` 相同，用于 `RightToolbar` 的内部 `key`。 |
| `label` | `String` | **必需**。与 `itemName` 相同，用于 `RightToolbar` 的显示。 |
| `width` | `String/Number`| 列的固定宽度。 |
| `minWidth` | `Function` | 一个返回最小宽度的函数，用于自适应列宽。 |
| `align` | `String` | 单元格内容的对齐方式，默认为 `'center'` (树形表格首列强制为 `'left'`)。 |
| `formatter`| `Function` | 单元格内容格式化函数。签名：`(row, column, cellValue, index)`。用于处理枚举值、日期格式化等。 |
| `itemConfig`| `Object` | **(可选)** 如果该列在表格内是**可编辑**的，则必须提供此对象。它会被直接传递给 `DynamicInputControl` 作为 `item` prop。 |
| `itemListType`| `Number` | 列的渲染类型。`11`: 渲染为可点击链接；`0` 或 `10`: 渲染为纯文本。 |

#### 5.2. 其他重要 Props

除了 `columns`，`DynamicTable` 还接收以下 `props` 来控制其行为：

| Prop | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | `[]` | **必需**。要渲染的表格数据。 |
| `showSelectionColumn`|`Boolean`| `false`| 是否显示第一列的多选框。 |
| `showIndexColumn` | `Boolean`| `false`| 是否显示序号列。 |
| `isTree` | `Boolean`| `false`| 是否启用树形表格模式。 |
| `rowKey` | `String/Function`| `'id'` | 树形表格必须的 `row-key`。 |
| `treeProps` | `Object` | `{...}` | `el-table` 的 `tree-props` 配置。 |
| `lazyLoadFn`| `Function`| `null` | 树形表格的懒加载函数。 |

#### 5.3. 事件

| 事件名 | 载荷 (Payload) | 描述 |
| :--- | :--- | :--- |
| `@cell-event` | `{ eventName, row, itemKey, payload }` | 响应可编辑单元格内控件的通用事件 (如 `el-switch` 的 `change`)。 |
| `@cell-upload-event`| `{ eventName, row, itemKey, eventData }`| 专门响应可编辑单元格内 `el-upload` 控件的所有事件。 |

---

## 6. 进阶用法与最佳实践

### 6.1. 场景一：添加页面特有的操作按钮

**需求**：在“站内信模板”页面的表格上方，除了默认的“增删改”按钮外，还想添加一个“测试发送”按钮。

**解决方案**：使用 `DynamicCrudPage` 的 `#append-table-buttons` 插槽。

```vue
<!-- src/views/BasicSystem/SysNotifyTemplate.vue -->
<template>
  <dynamic-crud-page ... >
    <template #append-table-buttons="{ multipleSelection }">
      <el-button 
        type="primary"
        plain
        :disabled="multipleSelection.length !== 1"
        @click="handleSendTest(multipleSelection)"
      >
        测试发送
      </el-button>
    </template>
    <!-- ... (#dialog 插槽用于定义测试发送的对话框) ... -->
  </dynamic-crud-page>
</template>

<script setup>
function handleSendTest(selection) {
  // ... 打开对话框和处理发送逻辑
}
</script>
```

### 6.2. 场景二：表单字段需要动态数据源

**需求**：“工厂管理”页面的新增/编辑表单中，“所属组织”字段需要一个从 API 动态获取的组织列表作为下拉选项。

**解决方案**：使用 `DynamicCrudPage` 的 `dynamicOptionsMap` prop。

```vue
<!-- src/views/BaseData/EnterpriseBase/Factory.vue -->
<template>
  <dynamic-crud-page
    ...
    :dynamic-options-map="pageOptionsMap"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getOrganizationList } from '@/api/org';

const orgOptions = ref([]);

// 1. 创建一个数据映射
const pageOptionsMap = computed(() => ({
  // 'orgId' 是后端配置中“所属组织”字段的 itemKey
  // orgOptions 是包含动态数据的 ref
  orgId: orgOptions,
}));

// 2. 在 onMounted 中获取数据
onMounted(async () => {
  const list = await getOrganizationList();
  orgOptions.value = list.map(item => ({
    text: item.orgName,
    value: item.orgId,
  }));
});
</script>
```

### 6.3. 场景三：自定义新增/编辑表单中的某个字段

**需求**：“PDA自动更新”页面需要一个特殊的 `.apk` 文件上传组件，而不是 `DynamicInputControl` 提供的默认上传组件。

**解决方案**：使用 `DynamicCrudPage` 透传的 `#item-slot-{itemKey}` 插槽。

```vue
<!-- src/views/BasicSystem/PdaAutoUpdate.vue -->
<template>
  <dynamic-crud-page ... >
    <!-- 插槽名称精确匹配: item-slot- + 后端配置的 itemKey -->
    <template #item-slot-filePath="{ initialData }">
      <el-form-item label="上传APK文件" prop="filePath">
        <MyCustomApkUpload 
          v-model="initialData.filePath"
        />
      </el-form-item>
    </template>
  </dynamic-crud-page>
</template>
```

### 6.4. 场景四：实现树形表格页面

**需求**：“部门管理”页面需要以树形结构展示数据。

**解决方案**：在 `DynamicCrudPage` 上设置树形表格相关的 `props`。

```vue
<!-- src/views/BasicSystem/SysDept.vue -->
<template>
  <dynamic-crud-page
    ...
    :is-tree-table="true"
    id-field-name="deptId"
    :tree-table-props="{ children: 'depts', hasChildren: 'hasChildren' }"
    :lazy-load-fn="lazyLoadDepts"
  />
</template>

<script setup>
// lazyLoadDepts 函数负责根据父节点ID，异步加载子节点数据
async function lazyLoadDepts(tree, treeNode, resolve) {
  const res = await getDeptList({ parentId: tree.deptId });
  resolve(res.data);
}
</script>
```

---
这份文档应该已经完整了，涵盖了从基础用法到高级定制的各种场景。希望能对您和您的团队有所帮助！