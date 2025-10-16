<!-- src/components/RightToolbar/index.vue -->
<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <!-- ... (搜索和刷新按钮保持不变) ... -->
      <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top" v-if="search">
        <el-button circle icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button circle icon="Refresh" @click="refresh()" />
      </el-tooltip>

      <!-- 列设置按钮 -->
      <el-tooltip class="item" effect="dark" content="显隐/排序" placement="top" v-if="columns">
        <el-button circle icon="Menu" @click="openColumnDialog" />
      </el-tooltip>
    </el-row>

    <!-- [!code focus--start] -->
    <!-- 全新的列设置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <div class="dialog-content">
        <div class="info-tip">
          <el-alert title="操作提示：勾选/取消勾选可控制列的显隐，拖拽左侧图标可调整列的顺序。" type="info" show-icon :closable="false" />
        </div>
        <!-- 使用 vuedraggable -->
        <draggable
          :list="localColumns"
          item-key="key"
          class="draggable-list"
          ghost-class="ghost"
          handle=".drag-handle"
        >
          <template #item="{ element: col }">
            <div class="draggable-item">
              <el-icon class="drag-handle" :size="18"><Rank /></el-icon>
              <el-checkbox v-model="col.visible" :label="col.label" />
            </div>
          </template>
        </draggable>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- [!code focus--end] -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'; // [!code ++]
import draggable from 'vuedraggable/dist/vuedraggable.common.js'; // [!code ++]
import { Rank } from '@element-plus/icons-vue'; // [!code ++]

const props = defineProps({
  showSearch: { type: Boolean, default: true },
  columns: { type: Array },
  search: { type: Boolean, default: true },
  gutter: { type: Number, default: 10 },
});

// [!code focus--start]
// RightToolbar 现在会发出 'update:columns' 事件，而不是直接修改 prop
const emit = defineEmits(['update:showSearch', 'queryTable', 'update:columns']);
// [!code focus--end]

const open = ref(false);
const title = ref("列显隐与排序");

// [!code focus--start]
// 创建一个本地的、可修改的列配置副本
const localColumns = ref([]);

// 监听对话框的打开状态
watch(() => open.value, (isOpen) => {
  if (isOpen) {
    // 当对话框打开时，深拷贝 props.columns 到 localColumns
    localColumns.value = JSON.parse(JSON.stringify(props.columns));
  }
});
// [!code focus--end]

const style = computed(() => {
  const ret = {};
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`;
  }
  return ret;
});

function toggleSearch() {
  emit("update:showSearch", !props.showSearch);
}

function refresh() {
  emit("queryTable");
}

// [!code focus--start]
// 打开对话框的新方法
function openColumnDialog() {
  open.value = true;
}

// 当用户点击“确定”按钮时
function handleConfirm() {
  // 发出事件，将修改后的本地列配置数组传递给父组件
  emit('update:columns', localColumns.value);
  open.value = false;
}
// [!code focus--end]
</script>

<style lang='scss' scoped>
/* ... (保留你已有的 scoped 样式) ... */
:deep(.el-transfer__button) {
  border-radius: 50%;
  display: block;
  margin-left: 0px;
}
:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}

/* [!code focus--start] */
/* 为拖拽列表添加样式 */
.dialog-content {
  .info-tip {
    margin-bottom: 15px;
  }
}
.draggable-list {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
}

.draggable-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 5px;
  border: 1px solid #f1f1f1;
  border-radius: 4px;
  background-color: #f9fafb;
  cursor: grab;

  .drag-handle {
    margin-right: 10px;
    color: #909399;
    cursor: move;
  }

  .el-checkbox {
    flex-grow: 1;
  }
}

/* 拖拽时的占位符样式 */
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
/* [!code focus--end] */
</style>