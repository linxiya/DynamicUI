<!-- src/views/BasicSystem/SysNotifyTemplate.vue (重构后) -->
<template>
  <dynamic-crud-page
    ref="dynamicCrudPageRef"
    :route-name="route.name"
    :api="{ getList, addEdit, deleteData, importData, exportData }"
    id-field-name="id"
    @cell-event="handleCellEvent"
  >
    <!-- 1. 使用 #append-table-buttons 插槽添加“测试发送”按钮 -->
    <template #append-table-buttons="{ multipleSelection }">
      <el-button
        type="primary"
        plain
        :disabled="multipleSelection.length !== 1"
        @click="handleSendTest(multipleSelection)"
        v-hasButton="'SysNotifyTemplate_sendNotify'"
      >
        测试发送
      </el-button>
    </template>

    <!-- 2. 使用 #dialog 插槽来定义“测试发送”对话框 -->
    <template #dialog>
      <el-dialog
        :close-on-click-modal="false"
        v-model="sendDialog.visible"
        title="测试发送"
        width="500px"
        append-to-body
      >
        <el-form
          ref="sendFormRef"
          :model="sendForm"
          :rules="sendRules"
          label-width="140px"
        >
          <el-form-item label="模板内容" prop="content">
            <el-input
              type="textarea"
              disabled
              :value="sendDialog.templateContent"
            ></el-input>
          </el-form-item>
          <el-form-item label="接收人" prop="userIds">
            <el-select
              v-model="sendForm.userIds"
              multiple
              filterable
              placeholder="请选择接收人"
              style="width: 100%"
            >
              <el-option
                v-for="item in userList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <!-- 动态生成模板参数输入框 -->
          <el-form-item
            v-for="param in templateParams"
            :key="param.key"
            :label="param.label"
            :prop="param.key"
            :rules="{
              required: true,
              message: `${param.label}不能为空`,
              trigger: 'blur',
            }"
          >
            <el-input
              v-model="sendForm[param.key]"
              :placeholder="`请输入 ${param.label}`"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancelSend">取消</el-button>
            <el-button type="primary" @click="submitSendForm" :loading="sending"
              >确认发送</el-button
            >
          </div>
        </template>
      </el-dialog>
    </template>
  </dynamic-crud-page>
</template>

<script setup name="SysNotifyTemplate">
import { ElMessage } from "element-plus";
import {
  getList,
  exportData,
  addEdit,
  deleteData,
  importData,
  sendNotify,
} from "@/api/BasicSystem/SysNotifyTemplate";
import { getList as getUsers } from "@/api/BasicSystem/SysUser";
const route = useRoute();
const dynamicCrudPageRef = ref(null);
const { proxy } = getCurrentInstance();

// --- “测试发送”对话框相关状态 ---
const sendDialog = reactive({
  visible: false,
  templateContent: "",
});
const sendForm = reactive({
  templateCode: "",
  userIds: [],
  // 模板参数会动态添加到这里
});
const sendFormRef = ref(null);
const userList = ref([]);
const templateParams = ref([]);
const sending = ref(false);

const sendRules = {
  userIds: [
    { required: true, message: "请至少选择一个接收人", trigger: "change" },
  ],
};

/**
 * @description 加载所有可用的用户列表，用于“接收人”下拉框
 * @async
 */
async function fetchUserList() {
  try {
    const res = await getUsers({ pageSize: 99999, status: 1 });
    userList.value = (res.data || []).map((user) => ({
      value: user.userId,
      label: user.userName,
    }));
  } catch (error) {
    console.error("获取用户列表失败:", error);
  }
}

/**
 * @description 处理“测试发送”按钮点击事件
 * @param {Array} selection - 当前表格选中的行
 */
function handleSendTest(selection) {
  if (selection.length !== 1) {
    // 这个检查理论上会被 :disabled 阻止，但作为双重保险
    return ElMessage.warning("请选择一条模板进行测试发送！");
  }
  const template = selection[0];

  // 1. 重置表单
  if (sendFormRef.value) sendFormRef.value.resetFields();
  // 清空动态添加的属性
  templateParams.value.forEach((param) => delete sendForm[param.key]);

  // 2. 解析模板参数
  if (template.params) {
    templateParams.value = template.params.split(",").map((p, i) => ({
      key: p.trim(),
      label: `参数{${p.trim()}}`,
    }));
  } else {
    templateParams.value = [];
  }

  // 3. 填充表单基础数据
  sendDialog.templateContent = template.content;
  sendForm.templateCode = template.code;
  sendForm.userIds = [];

  // 4. 显示对话框
  sendDialog.visible = true;
}

/**
 * @description 提交测试发送表单
 * @async
 */
async function submitSendForm() {
  await sendFormRef.value.validate();

  sending.value = true;
  try {
    // 构造发送给后端的 payload
    const templateParamsPayload = { ...sendForm };
    delete templateParamsPayload.templateCode;
    delete templateParamsPayload.userIds;

    const payload = {
      templateCode: sendForm.templateCode,
      templateParams: templateParamsPayload,
      userIds: sendForm.userIds.join(","),
    };

    await sendNotify(payload);
    ElMessage.success("测试发送成功！");
    sendDialog.visible = false;
    dynamicCrudPageRef.value?.fetchData(); // 刷新列表，可能会更新“上次发送时间”等
  } catch (error) {
    console.error("测试发送失败:", error);
  } finally {
    sending.value = false;
  }
}

/**
 * @description 取消测试发送
 */
function cancelSend() {
  sendDialog.visible = false;
}

/**
 * @description 处理表格单元格事件的回调函数。
 * @param {object} eventData - 包含事件相关数据的对象 ({ eventName, row, itemKey, payload, rowIndex })。
 *                             eventName 可以是 'change', 'focus', 'blur' 等。
 */
function handleCellEvent({ eventName, row, itemKey }) {
  switch (eventName) {
    case "change":
      // 处理 change 事件
      if (itemKey === "status") {
        addEdit("update", { ...row }).then(() => {
          ElMessage.success("状态更新成功");
        }).catch((error) => {
          row.status = row.status === 1 ? 0 : 1; // 回滚状态
          console.error("状态更新失败:", error);
        });
      }
      break;
    default:
      break;
  }
  // 可在此处添加单元格事件的业务逻辑
}

// --- 生命周期钩子 ---
onMounted(() => {
  // 预加载用户列表，以便弹窗能快速显示
  fetchUserList();
});
</script>
