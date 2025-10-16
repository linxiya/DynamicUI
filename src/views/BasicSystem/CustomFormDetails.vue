<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <div class="hearder">
      <div class="searchForm-box">
        <el-form
          size="default"
          :inline="true"
          :model="searchForm"
          class="demo-form-inline"
          ref="searchFormRef"
          label-width="80px"
        >
          <el-form-item label="所属对象" prop="customFormCode">
            <el-input
              v-model="searchForm.customFormCode"
              @keyup.enter="fetchData(1)"
              clearable
              placeholder="请输入所属对象"
            ></el-input>
          </el-form-item>
          <el-form-item label="页面路由" prop="fromRout">
            <el-input
              v-model="searchForm.fromRout"
              @keyup.enter="fetchData(1)"
              clearable
              placeholder="请输入页面路由"
            ></el-input>
          </el-form-item>
          <el-form-item label="表单名" prop="customFormName">
            <el-input
              v-model="searchForm.customFormName"
              @keyup.enter="fetchData(1)"
              clearable
              placeholder="请输入表单名"
            ></el-input>
          </el-form-item>
          <el-form-item label="中文名">
            <el-input
              v-model="searchForm.itemName"
              @keyup.enter="fetchData(1)"
              clearable
              placeholder="请输入中文名"
            ></el-input>
          </el-form-item>

          <el-form-item label="字段名" prop="itemKey">
            <el-input
              v-model="searchForm.itemKey"
              @keyup.enter="fetchData(1)"
              clearable
              placeholder="请输入字段名"
            ></el-input>
          </el-form-item>

          <el-form-item label="创建时间" prop="createTime">
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

    <div class="content">
      <TabsWrapper :showTable="true">
        <!-- 表格按钮插槽 -->
        <template #table-buttons>
          <el-button type="success" size="default" @click="handleAddEdit()">
            新增</el-button
          >
          <el-button size="default" type="danger" @click="handleDelete()"
            >删除</el-button
          >
          <el-button size="default" type="primary" @click="exportExcelHandler()">
            导出</el-button
          >
          <el-popover
            style="margin-left: 10px"
            placement="top-start"
            title="手动更新排序"
            :width="200"
            trigger="hover"
            content="在有多个字段排序重复时使用(如:都为0),排序方式按10/步长自增"
          >
            <template #reference>
              <el-button type="warning" size="default" @click="manualSort()">
                手动更新排序
              </el-button>
            </template>
          </el-popover>
        </template>

        <template #table-content>
          <el-table
            :data="list"
            ref="listTableRef"
            row-key="customFormDetId"
            v-loading="listLoading"
            element-loading-text="加载中..."
            border
            fit
            highlight-current-row
            height="68vh"
            @selection-change="selectRow"
            @row-dblclick="handleRowDblClick"
          >
            <el-table-column align="center" fixed="left" type="selection"></el-table-column>
            <el-table-column
              label="所属页面"
              prop="customFormCode"
              align="center"
              :min-width="flexColumnWidth('customFormCode', list)"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              label="字段名"
              prop="itemKey"
              align="center"
              :min-width="flexColumnWidth('itemKey', list)"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="字段中文名"
              prop="itemName"
              align="center"
              :min-width="flexColumnWidth('itemName', list)"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              label="显示类型"
              prop="showType"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ formatValue(scope.row.showType, showTypeOptions) }}
              </template>
            </el-table-column>
            <el-table-column
              label="排序"
              prop="orderNum"
              align="center"
              width="80"
              sortable
            ></el-table-column>
            <el-table-column
              label="列表字段属性"
              prop="itemListType"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ formatValue(scope.row.itemListType, itemtypeOptions) }}
              </template>
            </el-table-column>
            <el-table-column
              label="详情字段属性"
              prop="itemDetailType"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ formatValue(scope.row.itemDetailType, itemtypeOptions) }}
              </template>
            </el-table-column>

            <el-table-column
              label="检索字段属性"
              prop="itemSearchType"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ formatValue(scope.row.itemSearchType, itemtypeOptions) }}
              </template>
            </el-table-column>
            <el-table-column
              label="枚举json"
              prop="enumData"
              align="center"
              width="150"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              label="是否枚举"
              prop="isEnum"
              align="center"
              width="80"
            >
              <template #default="scope">
                {{ formatValue(scope.row.isEnum, isboolOptions) }}
              </template>
            </el-table-column>
            <!-- <el-table-column
              label="是否使用"
              prop="isHide"
              align="center"
              width="80"
            >
              <template #default="scope">
                {{ formatValue(scope.row.isHide, isnotboolOptions) }}
              </template>
            </el-table-column> -->
            <el-table-column
              label="是否必填"
              prop="isRequired"
              align="center"
              width="80"
            >
              <template #default="scope">
                {{ formatValue(scope.row.isRequired, isboolOptions) }}
              </template>
            </el-table-column>
            <el-table-column
              label="是否隐藏"
              prop="isEditDisplay"
              align="center"
              width="120"
            >
              <template #default="scope">
                {{ formatValue(scope.row.isEditDisplay, disabledOptions) }}
              </template>
            </el-table-column>

            <el-table-column
              label="是否导出"
              prop="isExport"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ scope.row.isExport == 1 ? "是" : "否" }}
              </template>
            </el-table-column>
            <el-table-column
              label="是否高级查询"
              prop="isHighGrade"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ scope.row.isHighGrade == 1 ? "是" : "否" }}
              </template>
            </el-table-column>
            <el-table-column
              label="导出列序号"
              prop="exportIndex"
              align="center"
              width="100"
            >
            </el-table-column>
            <el-table-column
              label="导出列宽度"
              prop="exportColumnWidth"
              align="center"
              width="100"
            >
            </el-table-column>
            <el-table-column
              label="是否禁用"
              prop="disabled"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{ formatValue(scope.row.disabled, DisplayOptions) }}
              </template>
            </el-table-column>
            <!-- <el-table-column
              label="触发事件方式"
              prop="eventTriggerMode"
              align="center"
              width="100"
            >
              <template #default="scope">
                {{
                  formatValue(
                    scope.row.eventTriggerMode,
                    eventTriggerModeOptions
                  )
                }}
              </template>
            </el-table-column> -->

            <el-table-column
              label="搜索默认值"
              prop="itemValue"
              align="center"
              :min-width="flexColumnWidth('itemValue', list, 90)"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="表格列宽"
              prop="itemWidth"
              align="center"
              width="80"
            ></el-table-column>

            <el-table-column
              label="状态"
              prop="status"
              align="center"
              width="80"
            >
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ formatValue(scope.row.status, statusOptions) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="配置项code"
              prop="specCode"
              align="center"
              :min-width="flexColumnWidth('specCode', list, 100)"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              label="修改时间"
              prop="modifiedTime"
              align="center"
              width="160"
            ></el-table-column>
            <el-table-column
              label="创建时间"
              prop="createTime"
              align="center"
              width="160"
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

    <!-- 自定义表单维护对话框 -->
    <fullscreen-dialog
      :close-on-click-modal="false"
      :title="dialogTitle"
      draggable
      width="800px"
      v-model="editDialogVisible"
      @close="cancel('dialogFormRef')"
    >
      <el-form
        :model="diaform"
        :rules="rules"
        :inline="true"
        ref="dialogFormRef"
        class="demo-form-inline"
        label-width="130px"
        size="default"
        label-position="right"
        :scroll-to-error="true"
      >
        <!-- 表单项的 label 仍为中文 -->
        <el-form-item label="字段名" prop="itemKey">
          <el-input
            v-model.trim="diaform.itemKey"
            placeholder="请输入字段名"
          ></el-input>
        </el-form-item>
        <el-form-item label="字段中文名" prop="itemName">
          <el-input
            v-model="diaform.itemName"
            placeholder="请输入字段中文名"
          ></el-input>
        </el-form-item>
        <el-form-item label="显示属性" prop="showType">
          <el-select v-model="diaform.showType" placeholder="请选择显示属性">
            <el-option
              v-for="item in showTypeOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否枚举" prop="isEnum">
          <el-select v-model="diaform.isEnum" placeholder="请选择是否枚举">
            <el-option
              v-for="item in isboolOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="是否使用" prop="isHide">
          <el-select v-model="diaform.isHide" placeholder="请选择是否使用">
            <el-option
              v-for="item in isnotboolOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="是否必填" prop="isRequired">
          <el-select v-model="diaform.isRequired" placeholder="请选择是否必填">
            <el-option
              v-for="item in isboolOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-select
            v-model="diaform.isEditDisplay"
            placeholder="请选择隐藏方式"
          >
            <el-option
              v-for="item in disabledOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否禁用">
          <el-select v-model="diaform.disabled" placeholder="请选择禁用方式">
            <el-option
              v-for="item in DisplayOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="get_dynamicDetail.includes(diaform.showType)"
          label="详情字段属性"
        >
          <el-select
            v-model="diaform.itemDetailType"
            clearable
            @change="changeType"
            placeholder="请选择详情字段属性"
          >
            <el-option
              v-for="item in itemtypeOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="get_dynamicList.includes(diaform.showType)"
          label="列表字段属性"
        >
          <el-select
            v-model="diaform.itemListType"
            clearable
            placeholder="请选择列表字段属性"
          >
            <el-option
              v-for="item in itemtypeOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="get_dynamicSearch.includes(diaform.showType)"
          label="检索字段属性"
        >
          <el-select
            v-model="diaform.itemSearchType"
            clearable
            placeholder="请选择检索字段属性"
          >
            <el-option
              v-for="item in searchOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="触发事件方式">
          <el-select
            v-model="diaform.eventTriggerMode"
            clearable
            placeholder="请选择触发事件方式"
          >
            <el-option
              v-for="item in eventTriggerModeOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="搜索默认值">
          <el-input
            v-model="diaform.itemValue"
            placeholder="请输入搜索默认值"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="最小值"
          v-if="diaform.itemDetailType == 13 || diaform.itemListType == 13"
        >
          <el-input-number
            v-model="diaform.minValue"
            :min="0"
            controls-position="right"
            placeholder="请输入最小值"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="diaform.orderNum"
            :min="0"
            controls-position="right"
            placeholder="数字越小越靠前"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="表格列宽">
          <el-input
            v-model="diaform.itemWidth"
            placeholder="例如: 150 或 10%"
          ></el-input>
        </el-form-item>
        <el-form-item label="字段描述">
          <el-input
            v-model="diaform.fieldDesc"
            placeholder="请输入字段描述"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="时间显示格式"
          v-if="
            [4, 14, 16, 17, 18, 19].includes(
              diaform.itemSearchType ??
                diaform.itemListType ??
                diaform.itemDetailType
            )
          "
        >
          <el-input
            v-model="diaform.format"
            placeholder="例如: YYYY-MM-DD HH:mm:ss"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="时间后台格式"
          v-if="
            [4, 14, 16, 17, 18, 19].includes(
              diaform.itemSearchType ??
                diaform.itemListType ??
                diaform.itemDetailType
            )
          "
        >
          <el-input
            v-model="diaform.valueFormat"
            placeholder="例如: YYYY-MM-DD HH:mm:ss"
          ></el-input>
        </el-form-item>
        <el-form-item label="配置项code">
          <el-input
            v-model="diaform.specCode"
            placeholder="请输入配置项code"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否导出" prop="isExport">
          <el-radio-group v-model="diaform.isExport">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="是否高级查询" prop="isHighGrade">
          <el-radio-group v-model="diaform.isHighGrade">
            <el-radio value="0">否</el-radio>
            <el-radio value="1">是</el-radio>
          </el-radio-group>
        </el-form-item> -->

        <el-form-item label="导出列序号">
          <el-input-number
            v-model="diaform.exportIndex"
            :min="0"
            controls-position="right"
            placeholder="导出Excel中的列顺序"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="导出列宽度">
          <el-input
            v-model="diaform.exportColumnWidth"
            placeholder="Excel列宽, 如20"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否有效" prop="status">
          <el-radio-group v-model="diaform.status">
            <el-radio :value="0">无效</el-radio>
            <el-radio :value="1">有效</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="枚举json" style="width: 95%">
          <el-input
            type="textarea"
            :rows="3"
            v-model.trim="diaform.enumData"
            placeholder='格式例如: [{"text":"选项1","value":1},{"text":"选项2","value":2}]'
          ></el-input>
        </el-form-item>
        <el-form-item
          label=" "
          v-if="!diaform.customFormDetId"
          style="margin-bottom: 5px; width: 100%"
        >
          <el-checkbox v-model="diaform.continueAdd">继续添加</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button size="default" @click="cancel('dialogFormRef')"
            >取消</el-button
          >
          <el-button
            size="default"
            type="primary"
            @click="onSubmit('dialogFormRef')"
            >保存</el-button
          >
        </div>
      </template>
    </fullscreen-dialog>
  </div>
</template>

<script setup name="CustomFormDetails">
// 从 Element Plus 引入 Message 和 MessageBox
import { ElMessage, ElMessageBox } from "element-plus";
import download from '@/plugins/download' // 引入下载插件
// 移除了类型导入: import type { FormInstance, FormRules, ElTable } from 'element-plus';
import Sortable from "sortablejs";

// 引入你的 API 函数
import {
  getCustomFormDet,
  upAddCustomFormDet,
  delCustomFormDet,
  exportData,
} from "@/api/BasicSystem/CustomFormDetails"; 

const { proxy } = getCurrentInstance();

// 如果使用 Vuex/Pinia，正常导入即可
// import { useStore } from 'vuex';
// import { useYourStore } from '@/stores/yourStore';

// --- 组合式函数 ---
const route = useRoute();
// const store = useStore();
// const yourStore = useYourStore();

// --- Refs 和 Reactive State (移除了类型注解) ---
const searchFormRef = ref(null);
const listTableRef = ref(); // 表格的引用
const dialogFormRef = ref(); // 对话框表单的引用
const sortableInstance = ref(null); // Sortable 实例的引用

const searchForm = reactive({
  customFormId: "", // 从路由初始化
  customFormCode: "",
  fromRout: "",
  customFormName: "",
  itemName: "",
  itemKey: "",
  startPage: 1,
  pageSize: 50,
  total: 0,
});

const searchTime = ref([]); // 日期范围选择器

const list = ref([]); // 表格数据列表
const multipleSelection = ref([]); // 表格多选的数据
const listLoading = ref(false); // 列表加载状态
const editDialogVisible = ref(false); // 编辑对话框可见状态
const dialogTitle = ref(""); // 对话框标题

// 获取初始对话框表单数据的辅助函数
const getInitialDiaform = () => ({
  customFormDetId: "",
  itemKey: "",
  itemName: "",
  enumData: "",
  isEnum: 0,
  isHide: 1,
  isRequired: 0,
  showType: 1,
  isEditDisplay: 1,
  itemDetailType: 0,
  itemListType: 0,
  itemSearchType: 0,
  isHighGrade: "1",
  isSearch: 1,
  joinQuery: "and",
  queryType: "=",
  querySeq: "desc",
  itemValue: null,
  itemWidth: null,
  orderNum: null,
  status: 1,
  minWidth: 80,
  isExport: 1,
  eventTriggerMode: 0,
  dateType: "date",
  format: "",
  valueFormat: "",
  disabled: 0,
  minValue: 0,
  fieldDesc: "",
});

const diaform = reactive(getInitialDiaform()); // 对话框表单数据

// --- 选项数据 (保持不变，因为 text 是给用户看的中文) ---
const eventTriggerModeOptions = [
  { text: "不触发", value: 0 },
  { text: "聚焦触发", value: 1 },
];
const statusOptions = [
  { text: "无效", value: 0 },
  { text: "有效", value: 1 },
];
const isboolOptions = [
  { text: "否", value: 0 },
  { text: "是", value: 1 },
];
const isnotboolOptions = [
  { text: "否", value: 1 },
  { text: "是", value: 0 },
];
const disabledOptions = [
  { text: "新增隐藏", value: 0 },
  { text: "不隐藏", value: 1 },
  { text: "编辑隐藏", value: 2 },
  { text: "全部隐藏", value: 3 },
];
const DisplayOptions = [
  { text: "不禁用", value: 0 },
  { text: "编辑禁用", value: 1 },
  { text: "新增禁用", value: 2 },
  { text: "编辑、新增禁用", value: 4 },
  { text: "全部禁用", value: 3 },
];
const itemtypeOptions = [
  { text: "默认展示", value: 0 },
  { text: "输入框", value: 1 },
  { text: "按钮输入框", value: 30 },
  { text: "密码输入框", value: 40 },
  { text: "下拉框", value: 2 },
  { text: "多选下拉框", value: 50 },
  { text: "开关", value: 3 },
  { text: "日期", value: 4 },
  { text: "日期时间", value: 18 },
  { text: "时间(时分秒)", value: 26 },
  { text: "时间段", value: 14 },
  { text: "单选框", value: 5 },
  { text: "可选框", value: 6 },
  { text: "多选框", value: 7 },
  { text: "地区", value: 8 },
  { text: "树形选择器", value: 20 },
  { text: "文件", value: 9 },
  { text: "tips", value: 10 },
  { text: "链接", value: 11 },
  { text: "文本框", value: 12 },
  { text: "计数器", value: 13 },
  { text: "时间戳", value: 15 },
];
const searchOptions = [
  { text: "默认展示", value: 0 },
  { text: "输入框", value: 1 },
  { text: "按钮输入框", value: 30 },
  { text: "下拉框", value: 2 },
  { text: "多选下拉框", value: 50 },
  { text: "日期范围", value: 16 },
  { text: "日期和时间范围", value: 19 },
  { text: "时间范围", value: 14 },
  { text: "日期", value: 4 },
  { text: "日期时间", value: 18 },
  { text: "时间", value: 17 },
  { text: "文本框", value: 12 },
  { text: "计数器", value: 13 },
];
const showTypeOptions = [
  { text: "全部", value: 1 },
  { text: "列表页", value: 2 },
  { text: "详情页", value: 3 },
];

// --- 计算属性 (保持不变) ---
const get_dynamicSearch = computed(() => [1, 2]);
const get_dynamicDetail = computed(() => [1, 3]);
const get_dynamicList = computed(() => [1, 2]);
// 如果使用 Vuex/Pinia:
// const get_dynamicSearch = computed(() => store.getters.get_dynamicSearch);

// --- 表单验证规则 (移除了类型 :FormRules) ---
const rules = reactive({
  itemKey: [{ required: true, message: "请输入字段名", trigger: "blur" }],
  itemName: [{ required: true, message: "请输入字段中文名", trigger: "blur" }],
  status: [{ required: true, message: "请选择是否有效", trigger: "change" }],
  isEnum: [{ required: true, message: "请选择是否枚举", trigger: "change" }],
  isHide: [{ required: true, message: "请选择是否使用", trigger: "change" }],
  isRequired: [
    { required: true, message: "请选择是否必填", trigger: "change" },
  ],
  showType: [{ required: true, message: "请选择显示属性", trigger: "change" }],
});

// --- 工具函数 (移除了类型注解) ---
/**
 * @description 格式化值，用于在表格中显示选项文本
 * @param value 当前值
 * @param options 选项数组 e.g. [{ text: '是', value: 1 }, { text: '否', value: 0 }]
 * @returns 匹配到的文本或原始值
 */
const formatValue = (value, options) => {
  const option = options.find((opt) => opt.value == value);
  return option ? option.text : String(value);
};

/**
 * @description 安全地将值转换为数字
 * @param val 输入值
 * @returns 转换后的数字，如果无法转换则为 0
 */
const toNumber = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// --- 核心业务方法 (移除了函数参数和返回值的类型注解) ---

/**
 * @description 获取列表数据
 * @param {number} [page] 要查询的页码，可选
 */
const fetchData = async () => {
  listLoading.value = true;
  try {
    const params = {
      ...searchForm,
      startTime: searchTime.value?.[0] ?? "",
      endTime: searchTime.value?.[1] ?? "",
    };
    const res = await getCustomFormDet(params);

    list.value = res.data || [];
    searchForm.total = res.count || 0;
    nextTick(() => {
      initSortable();
    });
  } catch (error) {
    console.error("获取数据时出错:", error);
    ElMessage.error(error.message || "获取数据时发生错误");
    list.value = [];
    searchForm.total = 0;
  } finally {
    listLoading.value = false;
  }
};

const handleQuery = () => {
  searchForm.startPage = 1; // 查询时重置到第一页
  fetchData();
};




// 重置搜索表单
const resetQuery = () => {
  searchFormRef.value?.resetFields(); // 重置表单字段到初始值
  searchTime.value = []; // 清空日期范围选择
  handleQuery(); // 执行查询以刷新列表
}

/**
 * @description 处理新增或编辑操作，打开对话框
 * @param {object} [row] 可选参数，如果传入则为编辑模式，否则为新增模式
 */
const handleAddEdit = (row) => {
  if (row && row.customFormDetId) {
    dialogTitle.value = "修改自定义表单";
    Object.assign(diaform, row);
    diaform.orderNum = toNumber(row.orderNum);
    diaform.minValue = toNumber(row.minValue);
    diaform.exportIndex = toNumber(row.exportIndex);
    diaform.isHighGrade = String(row.isHighGrade ?? "1");
  } else {
    dialogTitle.value = "新增自定义表单";
    Object.assign(diaform, getInitialDiaform());
    diaform.customFormId =
      searchForm.customFormId || route.params.customFormId || "";
  }
  editDialogVisible.value = true;
  nextTick(() => {
    dialogFormRef.value?.clearValidate();
  });
};

/**
 * @description 处理表格行双击事件
 * @param {object} row 被双击的行数据
 */
const handleRowDblClick = (row) => {
  handleAddEdit(row);
};

/**
 * @description 处理表格多选变化事件
 * @param {array} val 当前选中的行数据数组
 */
const selectRow = (val) => {
  multipleSelection.value = val;
};

// 处理删除 (单个或批量)
const handleDelete =  async () => {
  const selectedRows = multipleSelection.value; // 获取选中的行
  if (selectedRows.length === 0) {
    return proxy.$modal.msgWarning("请至少选择一条数据进行删除！"); // 未选择时提示
  }

  const ids = selectedRows.map((v) => v.customFormDetId); // 获取选中行的 ID 列表
  const names = selectedRows.map((v) => v.itemName).join(", "); // 获取选中行的名称列表

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
    await delCustomFormDet(ids.join()); // API 可能需要逗号分隔的字符串 ID
    proxy.$modal.msgSuccess(`表单 [${names}] 删除成功`); // 显示成功消息

    // 刷新逻辑：如果删除的是当前页的最后一条或多条数据，则跳转到前一页 (如果不是第一页)
    const totalItemsAfterDelete = searchForm.total - ids.length;
    const totalPage = Math.ceil(totalItemsAfterDelete / searchForm.pageSize); // 计算删除后的总页数
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
      proxy.$modal.msg("删除操作已取消"); // 用户取消操作提示
    }
  }
}

/**
 * @description 执行导出 Excel 操作的函数。
 */
 function exportExcelHandler() {
  // 导出操作
  console.log("导出操作");
  download.exportExcel(
    exportData(),
    {
      ...searchForm,
      fromRout: route.name,
    },
    "自定义表单明细",
  );
}


/**
 * @description 下拉框类型改变时的处理逻辑 (示例)
 * @param {*} data 当前选中的值
 */
const changeType = (data) => {
  if (data == 12) {
    diaform.itemListType = 10;
    diaform.itemWidth = "140";
  }
};

/**
 * @description 关闭对话框时的处理函数
 * @param {string} refName 对话框表单的引用名称
 */
const cancel = (refName) => {
  if (refName === "dialogFormRef" && dialogFormRef.value) {
    dialogFormRef.value.resetFields();
    Object.assign(diaform, getInitialDiaform());
  }
  editDialogVisible.value = false;
};

/**
 * @description 提交对话框表单（新增或修改）
 * @param {string} refName 对话框表单的引用名称
 */
const onSubmit = async (refName) => {
  const formEl = refName === "dialogFormRef" ? dialogFormRef.value : null;
  if (!formEl) return;

  try {
    await formEl.validate();

    diaform.customFormId =
      searchForm.customFormId || route.params.customFormId || "";
    if (!diaform.customFormId) {
      ElMessage.error("所属自定义表单ID丢失，无法保存！");
      return;
    }

    if (diaform.isEditDisplay != 1) {
      diaform.isRequired = 0;
    }

    const payload = {
      ...diaform,
      isHighGrade: Number(diaform.isHighGrade),
    };

    if (!diaform.customFormDetId) {
      await upAddCustomFormDet("add", payload);
      ElMessage.success("新增成功");
      fetchData(1);
      if (!diaform.continueAdd) {
        editDialogVisible.value = false;
      }
    } else {
      await upAddCustomFormDet("update", payload);
      ElMessage.success("修改成功");
      fetchData();
      editDialogVisible.value = false;
    }
  } catch (validationError) {
    console.log("表单校验失败:", validationError);
  }
};

// --- 拖拽排序相关 ---
/**
 * @description 初始化 Sortable.js 拖拽功能（增强“0 值”边界检测）
 */
const initSortable = () => {
  // 先销毁旧实例，防止重复绑定
  if (sortableInstance.value) {
    sortableInstance.value.destroy();
    sortableInstance.value = null;
  }

  const table = listTableRef.value?.$el;
  const tbody = table?.querySelector(".el-table__body-wrapper .el-table__body tbody");
  if (!tbody) {
    console.warn("拖拽排序初始化失败: 未找到 tbody 元素。");
    return;
  }

  sortableInstance.value = Sortable.create(tbody, {
    animation: 150,
    ghostClass: "sortable-ghost",
    onEnd: async (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
        return;
      }

      // 1. 立即在前端更新 list 数组的顺序，以提供即时反馈
      const movedItem = list.value.splice(oldIndex, 1)[0];
      list.value.splice(newIndex, 0, movedItem);

      try {
        listLoading.value = true;

        // 2. 获取拖拽位置的前后项
        const prevItem = list.value[newIndex - 1] || null;
        const nextItem = list.value[newIndex + 1] || null;
        const prevOrder = prevItem ? Number(prevItem.orderNum) : null;
        const nextOrder = nextItem ? Number(nextItem.orderNum) : null;

        let newOrderNum;

        // --- [!code focus--start] ---
        // --- 核心：健壮的边界条件检查 ---

        // 检查是否需要触发全量重排
        // 条件：前后项 orderNum 相同，或者差值小于1 (精度问题)，或者拖拽到顶部且顶部项 orderNum 过小
        const needsReorder = 
            (prevOrder !== null && nextOrder !== null && nextOrder - prevOrder < 1) ||
            (nextOrder !== null && newIndex === 0 && nextOrder <= 1); // 拖到顶部，且第一项是1或0

        if (needsReorder) {
          console.warn("检测到排序冲突或边界情况，触发全量手动重排...");
          await manualSort();
          return; // 重排后直接结束，因为 manualSort 已经处理了所有事情
        }

        // 3. 计算新的 orderNum
        if (newIndex === 0) {
          // 拖拽到最顶部
          newOrderNum = nextOrder / 2;
        } else if (newIndex === list.value.length - 1) {
          // 拖拽到最底部
          newOrderNum = prevOrder + 10;
        } else {
          // 拖拽到中间
          newOrderNum = (prevOrder + nextOrder) / 2;
        }
        // --- [!code focus--end] ---

        // 4. 更新被移动项的 orderNum 并提交到后端
        const updatedItem = { ...movedItem, orderNum: newOrderNum };
        await upAddCustomFormDet("update", updatedItem);
        
        // 5. 将后端确认的值更新回前端 list，确保数据一致性
        movedItem.orderNum = newOrderNum;
        
        ElMessage.success("排序更新成功");

      } catch (err) {
        console.error("更新排序失败:", err);
        ElMessage.error("排序失败，将重新加载数据以恢复顺序。");
        // 如果出错，重新获取数据以纠正前端可能错误的排序
        await fetchData();
      } finally {
        listLoading.value = false;
      }
    },
  });
};



/**
 * @description 手动触发排序更新，根据当前列表顺序重新生成 orderNum
 */
const manualSort = async () => {
  if (searchForm.total > 100) {
    ElMessage.warning(
      "数据量过大 (>100)，请先通过筛选缩小范围后再使用手动更新排序功能。"
    );
    return;
  }
  if (list.value.length === 0) {
    ElMessage.warning("当前列表为空，无法执行手动更新排序。");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认要根据当前表格的显示顺序，更新全部 ${list.value.length} 条记录的排序值吗？(排序值将从 0 开始，步长为 10)`,
      "确认更新排序",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
    );

    listLoading.value = true;
    const updatePromises = list.value.map((item, index) => {
      const updatedItem = { ...item, orderNum: index * 10 };
      return upAddCustomFormDet("update", updatedItem);
    });

    await Promise.all(updatePromises);
    ElMessage.success("手动更新排序成功");
    await fetchData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("手动更新排序失败:", error);
      ElMessage.error("手动更新排序失败");
    }
  } finally {
    listLoading.value = false;
  }
};

// --- Vue 生命周期钩子 ---
// onMounted(() => {
//   searchForm.customFormId = route.params.customFormId || "";
//   searchForm.customFormCode = route.params.customFormCode || "";
//   searchForm.fromRout = route.params.fromRout || "";
//   searchForm.customFormName = route.params.customFormName || "";
//   fetchData(1);
// });

onActivated(() => {
  console.log(route);
  searchForm.customFormId = route.query.customFormId || "";
  searchForm.customFormCode = route.query.customFormCode || "";
  searchForm.fromRout = route.query.fromRout || "";
  searchForm.customFormName = route.query.customFormName || "";
  handleQuery();
});

onBeforeUnmount(() => {
  sortableInstance.value?.destroy();
});

// 监听路由参数变化
// watch(
//   () => route.query,
//   (newParams, oldParams) => {
//     console.log(newParams);
//     if (
//       newParams.customFormId &&
//       newParams.customFormId !== oldParams?.customFormId
//     ) {
//       console.log(
//         "Route params changed, refetching data for customFormId:",
//         newParams.customFormId
//       );
//       searchForm.customFormId = newParams.customFormId || "";
//       searchForm.customFormCode = newParams.customFormCode || "";
//       searchForm.fromRout = newParams.fromRout || "";
//       searchForm.customFormName = newParams.customFormName || "";
//       console.log(searchForm);
//       // resetSearchFormFields();
//       searchTime.value = [];
//       // fetchData(1);
//     }
//   }
//   // { deep: true } // 根据需要决定是否深度监听
// );
</script>


