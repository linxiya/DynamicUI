<template>
  <div class="paging-wrapper">
    <div class="header">
      <div class="header-input">
        <el-input
          v-if="props.isSearch"
          v-model="searchQuery"
          size="small"
          placeholder="输入任意内容查询"
          @input="handleSearchInput"
          clearable
        >
          <template #append>
            <el-button icon="Search" @click="() => fetchData(1)"></el-button>
          </template>
        </el-input>
      </div>
      <div class="header-btn">
        <slot name="btn"></slot>
      </div>
    </div>

    <!-- 使用作用域插槽将当前页数据传递出去 -->
    <slot name="actions" :pagingList="currentPageData"></slot>

    <div class="footer">
      <!-- 分页 -->
      <Pagination
        v-show="pagination.total > 0"
        :total="pagination.total"
        v-model:page="pagination.startPage"
        v-model:limit="pagination.pageSize"
        @pagination="fetchData"
      />
    </div>
  </div>
</template>

<script setup>
import fetchDataByPaging from "./utils/fetchDataByPaging";

// Props 定义
const props = defineProps({
  isSearch: {
    type: Boolean,
    default: true,
  },
  // list 是从外部传入的完整数据源
  list: {
    type: Array,
    default: () => [],
  },
  dialogOpen: {
    // 用于在弹窗打开时重置分页和搜索状态
    type: Boolean,
    default: false,
  },
});

// 搜索查询字符串
const searchQuery = ref("");

// 分页状态
const pagination = reactive({
  startPage: 1,
  pageSize: 10,
  total: 0,
});

// 存储当前页应该显示的数据
const currentPageData = ref([]);

// 核心数据处理和分页逻辑
function processAndPaginateData(pageNum) {
  if (pageNum === 1) {
    pagination.startPage = 1;
  }

  // ★★★ 重要：为了避免直接修改 props.list，我们应该操作它的一个副本，或者让 fetchDataByPaging 内部处理副本
  // fetchDataByPaging 目前是非深拷贝的，它会直接在传入的 list 上 filter，这可能会修改原始 prop 数据。
  // 最佳实践是，如果 fetchDataByPaging 会修改数据源，应该传入一个副本。
  // 或者修改 fetchDataByPaging，使其在内部创建副本进行操作。
  // 为简单起见，这里假设 fetchDataByPaging 能够正确处理，或者你接受它可能修改原始list的副作用（不推荐）。
  // 一个更安全的方式：
  // const listCopy = props.isSearch && searchQuery.value ? [...props.list] : props.list; // 只有搜索时才需要拷贝进行filter
  // 但由于 filter 本身返回新数组，所以如果 fetchDataByPaging 的 filter 是第一步，那么原始 list 不会被修改。
  // 你的 fetchDataByPaging 实现是：searchStr ? list = list.filter(...) : ...
  // 这意味着如果 searchStr 存在，props.list 会被重新赋值为一个过滤后的新数组（在函数作用域内），
  // 但由于 JS 按值传递对象引用，如果 filter 返回的是新数组，原始 props.list 不会受影响。
  // slice 也是返回新数组。所以你的工具函数目前设计是安全的，不会修改原始 props.list。

  const result = fetchDataByPaging(
    props.list, // 直接传递 props.list
    pagination.pageSize,
    pagination.startPage,
    props.isSearch ? searchQuery.value : ""
  );

  // 处理当删除到最后一页没有数据时，自动跳到前一页
  if (pagination.startPage > 1 && result.arr.length === 0 && result.total > 0) {
    pagination.startPage--; // Vue 2 中 this.fetchData(--this.startPage) 的等价逻辑
    processAndPaginateData(); // 重新获取数据
    return;
  }

  currentPageData.value = result.arr;
  pagination.total = result.total;
}

// fetchData 现在只是 processAndPaginateData 的一个别名或触发器
function fetchData(pageNum) {
  processAndPaginateData(pageNum);
}

// 监听输入框变化，触发搜索 (可以考虑加防抖)
function handleSearchInput() {
  fetchData(1); // 输入时总是从第一页开始搜索
}

// 重置搜索和分页 (可以由父组件通过 ref 调用)
function reset() {
  searchQuery.value = "";
  // fetchData(1); // 重置搜索框后通常会重新获取第一页数据
  // 如果 reset 只是清空搜索框，而不立即查询，可以注释上面这行
}

// 监听外部传入的完整数据列表 list 的变化
watch(
  () => props.list,
  (newList, oldList) => {
    // console.log('Prop list changed, fetching data for PagingCom');
    fetchData(1); // 当完整数据源变化时，重新从第一页开始分页和渲染
    // 加一个判断避免不必要的初始化渲染，但通常源数据变了就需要重新分页
  },
  { immediate: true, deep: true } // immediate: 组件创建时立即执行一次
  // deep: 如果 list 是复杂对象数组，且内部项变化也需要触发，则用 deep (可能影响性能)
  // 对于数组长度变化或整个数组被替换，deep 不是必须的
);

// 监听弹窗打开状态，用于重置
watch(
  () => props.dialogOpen,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        // 确保在 DOM 更新后执行，虽然这里主要是数据操作
        searchQuery.value = "";
        pagination.startPage = 1;
        // pagination.pageSize = 10; // pageSize 通常不需要在弹窗打开时重置，除非有特定需求
        fetchData(1); // 弹窗打开时，重置搜索和分页，并获取数据
      });
    }
  }
);

// 暴露 reset 方法给父组件 (如果需要)
defineExpose({
  reset,
  fetchData, // 父组件可能需要手动触发刷新
});
</script>

<style lang="scss" scoped>
.paging-wrapper {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .el-input {
      /* Element Plus 中 el-input 的尺寸可能需要微调 */
      width: 260px;
    }
    .header-btn {
      display: flex;
      align-items: center;
      gap: 8px; /* Element Plus 推荐用 gap 控制按钮间距 */
    }
  }
  .footer {
    margin-top: 10px;
    text-align: right;
  }
}
</style>
