<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <div class="hearder">
      <div class="searchForm-box">
        <el-form
          size="default"
          inline
          :model="searchForm"
          label-width="80px"
          ref="searchFormRef"
        >
          <el-form-item label="所属表单" prop="customFormName">
            <el-input
              v-model="searchForm.customFormName"
              @keyup.enter="handleQuery()"
              placeholder="请输入所属表单"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="所属对象" prop="customFormCode">
            <el-input
              v-model="searchForm.customFormCode"
              @keyup.enter="handleQuery()"
              placeholder="请输入所属对象"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="页面路由" prop="fromRout">
            <el-input
              v-model="searchForm.fromRout"
              @keyup.enter="handleQuery()"
              placeholder="请输入页面路由"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="创建时间" prop="searchTime">
            <el-date-picker
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              v-model="searchTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
            ></el-date-picker>
          </el-form-item>
          <div style="margin-left: 20px">
            <el-button
              type="primary"
              size="default"
              icon="Search"
              @click="handleQuery()"
              >查询</el-button
            >
            <el-button size="default" icon="Refresh" @click="resetQuery()"
              >重置</el-button
            >
          </div>
        </el-form>
      </div>
    </div>

    <!-- 主体内容区域 using TabsWrapper -->
    <div class="content">
      <TabsWrapper :showTable="true">
        <!-- 表格按钮插槽 -->
        <template #table-buttons>
          <el-button
            type="success"
            size="default"
            icon="Download"
            v-hasButton="'sysCustomForm_findJsonData'"
            @click="handleExport()"
            >自定义表单导出</el-button
          >
          <el-button
            type="primary"
            size="default"
            icon="Upload"
            v-hasButton="'sysCustomForm_enterCustomForm'"
            @click="handleEnter()"
            >自定义表单导入</el-button
          >
          <el-button
            type="success"
            size="default"
            icon="RefreshLeft"
            v-hasButton="'sysCustomForm_init'"
            @click="handleInit()"
            >初始化</el-button
          >
          <el-button
            type="success"
            icon="Plus"
            v-hasButton="'sysCustomForm_add'"
            size="default"
            @click="handleAddEdit()"
            >新增</el-button
          >
          <el-button
            type="primary"
            icon="Edit"
            v-hasButton="'sysCustomForm_update'"
            size="default"
            @click="handleAddEdit(null, 2)"
            >编辑</el-button
          >
          <!-- <el-button type="primary" size="default" @click="_syncDefaultData">同步</el-button> -->
          <el-button
            size="default"
            type="danger"
            icon="Delete"
            v-hasButton="'sysCustomForm_delete'"
            @click="handleDelete()"
            >删除</el-button
          >
        </template>

        <!-- 表格内容插槽 -->
        <template #table-content>
          <!-- 自定义表单表格 -->
          <el-table
            v-loading="listLoading"
            :data="list"
            ref="listDataRef"
            element-loading-text="加载中..."
            border
            fit
            highlight-current-row
            @selection-change="handleSelectionChange"
            @row-dblclick="(row) => handleAddEdit(row)"
          >
            <el-table-column
              align="center"
              type="selection"
              width="55"
            ></el-table-column>
            <el-table-column
              align="center"
              width="90"
              label="操作"
              fixed="left"
            >
              <template #default="{ row }">
                <el-tooltip content="明细" placement="top">
                  <el-button
                    type="primary"
                    link
                    icon="View"
                    size="default"
                    @click="handleDetails(row)"
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column
              label="所属表单"
              prop="customFormName"
              align="center"
              :min-width="flexColumnWidth('customFormName', list)"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="所属对象"
              prop="customFormCode"
              align="center"
              :min-width="flexColumnWidth('customFormCode', list)"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="页面路由"
              prop="fromRout"
              align="center"
              :min-width="flexColumnWidth('fromRout', list)"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="是否有效"
              prop="status"
              align="center"
              width="80"
            >
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? "有效" : "无效" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="创建用户"
              prop="createUserName"
              align="center"
              :min-width="flexColumnWidth('createUserName', list)"
            ></el-table-column>
            <el-table-column
              label="创建时间"
              prop="createTime"
              align="center"
              :min-width="flexColumnWidth('createTime', list)"
            ></el-table-column>
            <el-table-column
              label="修改用户"
              prop="modifiedUserName"
              align="center"
              :min-width="flexColumnWidth('modifiedUserName', list)"
            ></el-table-column>
            <el-table-column
              label="修改时间"
              prop="modifiedTime"
              align="center"
              :min-width="flexColumnWidth('modifiedTime', list)"
            ></el-table-column>
          </el-table>

          <!-- 分页 -->
          <Pagination
            v-show="searchForm.total > 0"
            :total="searchForm.total"
            v-model:page="searchForm.startPage"
            v-model:limit="searchForm.pageSize"
            @pagination="fetchData"
          />
        </template>
      </TabsWrapper>
    </div>

    <!-- Dialogs 与之前的 Vue 3 版本保持一致 -->
    <!-- 初始化对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      draggable
      width="500px"
      v-model="dialogState.initVisible"
      title="初始化"
      append-to-body
    >
      <el-form
        :model="initForm"
        :rules="initRules"
        ref="initFormRef"
        label-width="100px"
        size="default"
        label-position="right"
      >
        <el-form-item label="类名称" prop="className">
          <el-input v-model="initForm.className"></el-input>
        </el-form-item>
        <el-form-item label="所属对象" prop="customFormCode">
          <el-input v-model="initForm.customFormCode"></el-input>
        </el-form-item>
        <el-form-item label="所属表单" prop="customFormName">
          <el-input v-model="initForm.customFormName"></el-input>
        </el-form-item>
        <el-form-item label="页面路由" prop="fromRout">
          <el-input v-model="initForm.fromRout"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="default" @click="cancelDialog('init')">取消</el-button>
          <el-button size="default" type="primary" @click="onInitSubmit"
            >保存</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 导入/导出对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      draggable
      width="600px"
      v-model="dialogState.customVisible"
      :title="
        dialogState.customStatus == 0 ? '自定义表单导出' : '自定义表单导入'
      "
      append-to-body
    >
      <el-form
        :model="customForm"
        ref="customFormRef"
        label-width="100px"
        size="default"
        label-position="right"
      >
        <el-form-item
          :label="dialogState.customStatus == 0 ? '导出数据' : '导入数据'"
        >
          <el-input
            v-model="customForm.customFormJsonData"
            type="textarea"
            :rows="10"
            id="textInput"
            ref="textInputRef"
            style="width: 100%"
            :readonly="dialogState.customStatus == 0"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            size="default"
            type="primary"
            @click="handleCopy"
            v-show="dialogState.customStatus == 0"
          >
            复制
          </el-button>
          <el-button
            size="default"
            type="primary"
            @click="importSubmit"
            v-show="dialogState.customStatus == 1"
          >
            导入
          </el-button>
          <el-button size="default" @click="dialogState.customVisible = false"
            >关闭</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 自定义表单维护 (新增/编辑) 对话框 -->
    <fullscreen-dialog
      :title="dialogState.title"
      :close-on-click-modal="false"
      draggable
      width="70%"
      v-model="dialogState.editVisible"
      append-to-body
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        inline
        ref="editFormRef"
        label-width="100px"
        size="default"
        label-position="right"
      >
        <el-form-item label="所属表单" prop="customFormName">
          <el-input v-model="editForm.customFormName"></el-input>
        </el-form-item>
        <el-form-item label="所属对象" prop="customFormCode">
          <el-input v-model="editForm.customFormCode"></el-input>
        </el-form-item>
        <el-form-item label="页面路由" prop="fromRout">
          <el-input v-model="editForm.fromRout"></el-input>
        </el-form-item>
        <el-form-item label="关联表单">
          <el-select
            filterable
            clearable
            v-model="editForm.subId"
            placeholder="请选择关联表单"
          >
            <!-- 匹配输入框宽度 -->
            <el-option
              v-for="item in lists"
              :key="item.customFormId"
              :label="item.customFormName"
              :value="item.customFormId"
              :disabled="item.customFormId === editForm.customFormId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否有效" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :value="0">无效</el-radio>
            <el-radio :value="1">有效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label=" "
          v-if="!editForm.customFormId"
          style="width: 100%"
        >
          <el-checkbox v-model="editForm.continueAdd">继续添加</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="default" @click="cancelDialog('edit')">取消</el-button>
          <el-button size="default" type="primary" @click="onSubmit"
            >保存</el-button
          >
        </div>
      </template>
    </fullscreen-dialog>
  </div>
</template>

<script setup name="CustomForm">
const { proxy } = getCurrentInstance();
import {
  getCustomForm,
  upAddCustomForm,
  initCustomFormAll,
  delCustomForm,
  findJsonData,
  enterCustomForm,
} from "@/api/BasicSystem/CustomForm";

const router = useRouter();

// --- DOM 元素引用 (Refs) ---
const searchFormRef = ref(null);
const initFormRef = ref(null);
const customFormRef = ref(null);
const editFormRef = ref(null);
const listDataRef = ref(null);
const textInputRef = ref(null); // 导出/导入对话框中文本域 (textarea) 的引用

// --- 响应式状态 ---
const searchForm = reactive({
  customFormName: "",
  customFormCode: "",
  fromRout: "",
  startPage: 1,
  pageSize: 20,
  total: 0,
});
const searchTime = ref([]); // 为日期范围数组使用 ref

const list = ref([]); // 表格数据
const lists = ref([]); // 用于“关联表单”下拉框的数据
const multipleSelection = ref([]); // 已选择的行
const listLoading = ref(false);

// 对话框可见性与状态
const dialogState = reactive({
  editVisible: false,
  initVisible: false,
  customVisible: false,
  title: "",
  customStatus: 0, // 0-自定义表单导出; 1-自定义表单导入
});

// --- 表单数据 ---
const initialEditForm = {
  customFormId: "",
  customFormCode: "",
  customFormName: "",
  subId: "",
  fromRout: "",
  status: 1,
  continueAdd: false,
};
const editForm = reactive({ ...initialEditForm });

const initialInitForm = {
  className: "",
  customFormCode: "",
  customFormName: "",
  fromRout: "",
};
const initForm = reactive({ ...initialInitForm });

const customForm = reactive({
  customFormJsonData: "",
});

// --- 校验规则 ---
const editRules = reactive({
  customFormName: [
    { required: true, message: "请输入所属表单", trigger: "blur" },
  ],
  customFormCode: [
    { required: true, message: "请输入所属对象", trigger: "blur" },
  ],
  fromRout: [{ required: true, message: "请输入页面路由", trigger: "blur" }],
  status: [{ required: true, message: "请选择是否有效", trigger: "change" }],
});

const initRules = reactive({
  customFormName: [
    { required: true, message: "请输入所属表单", trigger: "blur" },
  ],
  customFormCode: [
    { required: true, message: "请输入所属对象", trigger: "blur" },
  ],
  className: [{ required: true, message: "请输入类名称", trigger: "blur" }],
  // 根据原始注释，移除了 fromRout 的校验
});

// --- 生命周期钩子 ---
onMounted(() => {
  handleQuery();
  getsysCustomFormAll();
});

// --- 方法 ---
function handleQuery() {
  searchForm.startPage = 1; // 查询时重置到第一页
  fetchData();
}
// 获取主表格数据
async function fetchData() {
  listLoading.value = true;
  const params = {
    ...searchForm,
    startTime: searchTime.value?.[0] || "", // 获取日期范围开始时间
    endTime: searchTime.value?.[1] || "", // 获取日期范围结束时间
  };
  try {
    const res = await getCustomForm(params);
    list.value = res.data || []; // 更新表格数据
    searchForm.total = res.count || 0; // 更新总条数
  } catch (error) {
    console.error("获取自定义表单数据时出错:", error);
    list.value = []; // 出错时清空列表
    searchForm.total = 0; // 出错时重置总数
  } finally {
    listLoading.value = false; // 结束加载状态
  }
}

// 获取“关联表单”下拉框的数据
async function getsysCustomFormAll() {
  try {
    // 获取下拉框所需的有效表单 (状态为1)
    const res = await getCustomForm({
      startPage: 1,
      pageSize: 99999,
      status: 1,
    });
    lists.value = res.data || []; // 更新下拉框数据
  } catch (error) {
    console.error("获取所有自定义表单用于下拉框时出错:", error);
    lists.value = []; // 出错时清空下拉框数据
  }
}

// 重置搜索表单
function resetQuery() {
  searchFormRef.value?.resetFields(); // 重置表单字段到初始值
  searchTime.value = []; // 清空日期范围选择
  handleQuery(); // 执行查询以刷新列表
}

// 处理表格行选择
function handleSelectionChange(selection) {
  multipleSelection.value = selection; // 更新已选择的行
}

// 打开新增/编辑对话框
function handleAddEdit(row = null, type = 1) {
  // type 1: 新增/双击行/行内编辑按钮, type 2: 顶部编辑按钮
  dialogState.editVisible = true; // 显示对话框
  nextTick(() => {
    // 确保 DOM 更新后再操作
    editFormRef.value?.clearValidate(); // 先清除校验状态
    if (row && typeof row.customFormId !== "undefined") {
      // 编辑现有行 (来自双击或行按钮)
      Object.assign(editForm, JSON.parse(JSON.stringify(row))); // 深拷贝行数据到表单
      dialogState.title = "修改自定义表单"; // 设置对话框标题
    } else if (type === 2) {
      // 使用顶部按钮编辑 (需要选择)
      if (multipleSelection.value.length !== 1) {
        proxy.$modal.msgWarning("请选择一条数据进行编辑！"); // 提示用户选择
        dialogState.editVisible = false; // 关闭对话框
        return;
      }
      Object.assign(
        editForm,
        JSON.parse(JSON.stringify(multipleSelection.value[0]))
      ); // 深拷贝选中行数据到表单
      dialogState.title = "修改自定义表单"; // 设置对话框标题
    } else {
      // 新增
      Object.assign(editForm, initialEditForm); // 重置表单为初始状态
      dialogState.title = "新增自定义表单"; // 设置对话框标题
    }
  });
}

// 打开初始化对话框
function handleInit() {
  dialogState.initVisible = true; // 显示对话框
  nextTick(() => {
    // 确保 DOM 更新后再操作
    initFormRef.value?.clearValidate(); // 清除校验状态
    Object.assign(initForm, initialInitForm); // 重置表单为初始状态
  });
}

// 打开导出对话框
async function handleExport() {
  if (multipleSelection.value.length !== 1) {
    return proxy.$modal.msgWarning("请选择一条数据进行导出！"); // 必须选择一条
  }
  dialogState.customStatus = 0; // 设置为导出模式
  dialogState.customVisible = true; // 显示对话框
  customForm.customFormJsonData = "正在加载..."; // 设置占位符文本
  try {
    const res = await findJsonData(multipleSelection.value[0].customFormCode); // 调用 API 获取 JSON 数据
    // 美化 JSON 输出以便在文本域中更易读
    customForm.customFormJsonData = JSON.stringify(res.data, null, 2) || ""; // 更新文本域内容
  } catch (err) {
    console.error("获取导出 JSON 数据时出错:", err);
    customForm.customFormJsonData = "加载失败"; // 显示错误信息
  }
}

// 打开导入对话框
function handleEnter() {
  dialogState.customStatus = 1; // 设置为导入模式
  dialogState.customVisible = true; // 显示对话框
  nextTick(() => {
    // 确保 DOM 更新后再操作
    customFormRef.value?.clearValidate(); // 虽然没有校验规则，但是个好习惯
    customForm.customFormJsonData = ""; // 清除先前的数据
  });
}

// 处理删除 (单个或批量)
async function handleDelete() {
  const selectedRows = multipleSelection.value; // 获取选中的行
  if (selectedRows.length === 0) {
    return proxy.$modal.msgWarning("请至少选择一条数据进行删除！"); // 未选择时提示
  }

  const ids = selectedRows.map((v) => v.customFormId); // 获取选中行的 ID 列表
  const names = selectedRows.map((v) => v.customFormName).join(", "); // 获取选中行的名称列表

  try {
    // 弹出确认框
    await proxy.$modal.confirm(
      `确定要删除选中的表单 [${names}] 吗? 此操作不可恢复。`,
      "确认删除",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger", // 强调删除按钮
      }
    );

    // 调用删除 API
    await delCustomForm(ids.join()); // API 可能需要逗号分隔的字符串 ID
    proxy.$modal.msgSuccess(`表单 [${names}] 删除成功`); // 显示成功消息

    // 刷新逻辑：如果删除的是当前页的最后一条或多条数据，则跳转到前一页 (如果不是第一页)
    const totalItemsAfterDelete = searchForm.total - ids.length;
    const totalPage = Math.ceil(
      totalItemsAfterDelete / searchForm.pageSize
    ); // 计算删除后的总页数
    // 如果当前页大于删除后的总页数，且总页数大于0，则将当前页设置为最后一页
    if (searchForm.startPage > totalPage && totalPage > 0) {
      searchForm.startPage = totalPage;
    }
    // 如果删除后没有数据了，但之前有数据，则重置到第一页
    else if (totalItemsAfterDelete <= 0 && searchForm.total > 0) {
      searchForm.startPage = 1;
    }

    fetchData(); // 刷新数据 (使用调整后的页码)
    getsysCustomFormAll(); // 如果需要，刷新下拉框数据
    multipleSelection.value = []; // 清除选择
  } catch (error) {
    // 用户点击了取消按钮或其他错误
    if (error !== "cancel") {
      console.error("删除自定义表单时出错:", error);
      // 可以添加错误提示 proxy.$modal.msgError("删除失败，请稍后重试");
    } else {
      proxy.$modal.info("删除操作已取消"); // 用户取消操作提示
    }
  }
}

// 复制导出的 JSON 数据
async function handleCopy() {
  const jsonText = customForm.customFormJsonData; // 获取文本域内容
  if (!jsonText || jsonText === "正在加载..." || jsonText === "加载失败") {
    proxy.$modal.msgWarning("没有有效的JSON数据可复制"); // 无效数据时提示
    return;
  }
  try {
    // 现代浏览器 Clipboard API
    await navigator.clipboard.writeText(jsonText);
    proxy.$modal.msgSuccess("JSON数据已复制到剪贴板！"); // 成功提示
    // 可选：复制后关闭对话框
    // dialogState.customVisible = false;
  } catch (err) {
    console.error("复制文本失败: ", err);
    // 针对旧版浏览器或非安全上下文的回退方案
    const textArea = document.createElement("textarea");
    textArea.value = jsonText;
    textArea.style.position = "fixed"; // 防止滚动到底部
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy"); // 尝试旧的复制命令
      proxy.$modal.msgSuccess("JSON数据已复制到剪贴板！ (回退方案)");
    } catch (fallbackErr) {
      proxy.$modal.msgError("复制失败，请手动复制"); // 回退方案也失败时提示
    }
    document.body.removeChild(textArea); // 清理 DOM
  }
}

// 提交导入
async function importSubmit() {
  let jsonDataToImport = customForm.customFormJsonData; // 获取要导入的 JSON 字符串
  if (!jsonDataToImport) {
    return proxy.$modal.msgWarning("导入数据不能为空"); // 空数据校验
  }

  try {
    // 基本校验：检查是否为可解析的 JSON
    JSON.parse(jsonDataToImport); // 如果解析失败会抛出 SyntaxError

    // 发送前对验证过的 JSON 数据进行编码 (根据 API 要求)
    await enterCustomForm(encodeURIComponent(jsonDataToImport)); // 调用导入 API
    proxy.$modal.msgSuccess("导入成功"); // 成功提示
    dialogState.customVisible = false; // 关闭对话框
    handleQuery(); // 从第一页刷新数据
    getsysCustomFormAll(); // 刷新下拉框数据
  } catch (error) {
    // 捕获 JSON 解析错误和其他可能的 API 错误
    if (error instanceof SyntaxError) {
      proxy.$modal.msgError("导入失败：数据不是有效的JSON格式"); // JSON 格式错误提示
    } else {
      console.error("导入自定义表单时出错:", error);
      // 可以根据后端返回的错误信息显示更具体的提示
      // proxy.$modal.msgError(error.message || "导入失败，请检查数据或联系管理员");
      proxy.$modal.msgError("导入失败，请检查数据或联系管理员");
    }
  }
}

// 取消对话框
function cancelDialog(type) {
  if (type === "edit") dialogState.editVisible = false; // 关闭编辑/新增对话框
  if (type === "init") dialogState.initVisible = false; // 关闭初始化对话框
  // 此处无需显式清除校验，因为在打开对话框时 (nextTick 中) 已处理
}

// 提交初始化表单
async function onInitSubmit() {
  if (!initFormRef.value) return; // 防御性检查
  try {
    await initFormRef.value.validate(); // 触发表单校验
    await initCustomFormAll(initForm); // 调用初始化 API
    proxy.$modal.msgSuccess("初始化成功"); // 成功提示
    dialogState.initVisible = false; // 关闭对话框
    handleQuery(); // 刷新列表
    getsysCustomFormAll(); // 刷新下拉框
  } catch (validationError) {
    // 校验失败时，validate 会 reject，错误会自动在表单项上显示
    console.log("初始化表单校验失败:", validationError);
  }
}

// 提交新增/编辑表单
async function onSubmit() {
  if (!editFormRef.value) return; // 防御性检查
  try {
    await editFormRef.value.validate(); // 触发表单校验
    const isAdding = !editForm.customFormId; // 判断是新增还是编辑

    if (isAdding) {
      // 新增
      await upAddCustomForm("add", editForm); // 调用新增 API
      proxy.$modal.msgSuccess("新增成功");
    } else {
      // 更新
      await upAddCustomForm("update", editForm); // 调用更新 API
      proxy.$modal.msgSuccess("修改成功");
    }

    // 刷新 (根据 searchForm.startPage 刷新，新增后通常希望留在第一页，编辑后留在当前页，但当前实现是刷新当前页)
    // 如果希望新增后跳回第一页，可以在新增成功后设置 searchForm.startPage = 1;
    // if (isAdding) searchForm.startPage = 1; // 可选：新增后强制跳回第一页
    fetchData();
    getsysCustomFormAll(); // 刷新下拉框数据

    // 如果是编辑操作 或 (是新增操作且未勾选“继续添加”)，则关闭对话框
    if (!isAdding || !editForm.continueAdd) {
      dialogState.editVisible = false;
    } else {
      // 如果勾选了“继续添加”，则重置表单以便录入下一条
      proxy.$modal.msgSuccess("请继续添加下一条"); // “继续添加”的用户反馈
      nextTick(() => {
        // DOM 更新后操作
        editFormRef.value?.resetFields(); // 使用 resetFields 清空表单项（可能需要手动重置非表单项）
        Object.assign(editForm, initialEditForm); // 重新应用初始默认值 (特别是 status=1 和 continueAdd=false)
        // 手动确保 continueAdd 仍然为 true，因为 resetFields 可能会把它设为 false
        editForm.continueAdd = true;
      });
    }
  } catch (validationError) {
    // 校验失败时，错误会自动在表单项上显示
    console.log("新增/编辑表单校验失败:", validationError);
  }
}

// 处理查看明细 (导航到详情页)
function handleDetails(row) {
  console.log(row.customFormId);
  if (!row || !row.customFormId) {
    proxy.$modal.msgWarning("无效的行数据，无法查看明细"); // 无效数据提示
    return;
  }
  // Tab 管理逻辑需要根据 TabsWrapper 或你的布局如何处理来进行调整。
  // 为简单起见，这里假设直接导航。
  console.log("导航到明细页，表单:", row.customFormName);
  // 传递必要信息。使用 params 传递必需的 ID，使用 query 传递可选/显示数据。
  router.push({
    name: "CustomFormDetails", // 确保此路由名称存在于你的路由配置中
    query: {
      // 将其他有用信息作为查询参数传递 (例如 /custom-form/details/123?formCode=xxx&formName=yyy)
      customFormId: row.customFormId,
      customFormCode: row.customFormCode,
      customFormName: row.customFormName,
      fromRout: row.fromRout, // 如果详情页也需要路由信息
    },
  });
}
</script>

<style scoped></style>
