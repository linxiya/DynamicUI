<template>
  <div class="app-container">
     <div class="hearder">
       <div class="searchForm-box">
         <dynamic-form
           ref="queryFormRef"
           :initial-data="initialQueryData"
           :initial-advanced-conditions="searchItems"
           :rules="queryRules"
           label-width="100px"
           :enable-advanced-query="true"
           :advanced-query-fields-source="allFieldsForQuery"
           @submit="handleFormSubmit"
           @advancedQueryChange="handleAdvancedQueryConditionsChange"
           @fieldChange="handleFieldChange"
           :show-fold-button="true"
           :initial-fold="false"
           inline
           class="main-query-form"
         >
           <!-- 自定义操作按钮 -->
           <template #actions="{ form, data }">
             <div class="action-buttons">
               <el-button @click="clearAllQuery" type="info">全部清空</el-button>
               <el-button @click="resetQueryForm" type="warning"
                 >重置表单</el-button
               >
               <el-button
                 type="primary"
                 @click="submitQueryForm"
                 :loading="loading"
               >
                 {{ loading ? "查询中..." : "执行查询" }}
               </el-button>
             </div>
           </template>
         </dynamic-form>
       </div>
     </div>
   </div>
 </template>
 
 <script setup>
 
 import {getCustomFormDet,getSearchDetail} from "@/api/BasicSystem/CustomFormDetails"; 
 import { ref } from "vue";
 
 const route = useRoute();
 
 const queryFormRef = ref(null); // 用于访问 DynamicForm 的方法
 const loading = ref(false);
 // 自定义表单高级查询初始配置
 const baseAllFields = ref([]);
 
 // 1. 定义所有可以参与高级查询的字段 
 //    - itemKey: 唯一标识，用于数据绑定和后端字段映射
 //    - itemName: 显示的标签名
 //    - type: 对应 DynamicFormItem 支持的组件类型
 //    - placeholder: 默认的占位符 (在高级查询中会被操作符覆盖)
 //    - enumData: (可选) 用于下拉、单选、多选等组件的选项
 //    - defaultValue: (可选) 字段的默认值
 const allFieldsForQuery = computed(() => {
   if (!Array.isArray(baseAllFields.value)) {
     console.warn("baseAllFields.value is not an array, returning empty for allFieldsForQuery. Value:", baseAllFields.value);
     return []; // 返回空数组
   }
   return baseAllFields.value.filter(v=>v.isHide === 0).map((item) => ({
     itemKey: item.itemKey,
     itemName: item.itemName,
     type: item.itemSearchType,
     isEnum: item.isEnum,
     enumData: item.enumData ? JSON.parse(item.enumData) : null,
     defaultValue: item.itemValue,
   }));
 });
 
 // 2. 定义高级查询的初始配置
 const searchItems = ref([]); 
 
 // 2. 定义基础表单配置 (当没有高级查询时，或者你希望总是有一些固定查询项时使用)
 //    如果希望默认表单为空，直到用户配置高级查询，可以返回空数组 `[]`
 const baseFormConfig = computed(() => {
   // return allFieldsForQuery.value.filter(f => searchItemKeys.value.includes(f.itemKey));
   return []; // 如果希望默认是空的
 });
 
 // 3. 表单初始数据 (可选)
 //    Key 应该匹配 baseFormConfig 中的 itemKey，或者高级查询生成的 itemKey (如 'name_adv_0')
 const initialQueryData = ref({
   orgCode: '默认名称', // 初始值示例
   // orgCode_adv_0:111
 });
 
 // 4. 表单验证规则 (可选)
 //    Key 应该匹配 baseFormConfig 中的 itemKey，或者高级查询生成的 itemKey
 const queryRules = ref({
   'orgCode': [{ isRequired: true, message: '名称必须填写 (高级查询)', trigger: 'blur' }],
   // 'status': [{ isRequired: true, message: '状态必须选择 (普通查询)', trigger: 'change' }],
 });
 
 // 5. 存储和预览状态
 const appliedAdvancedConditions = ref([]); // 从 DynamicForm 的 @advancedQueryChange 事件获取
 const finalApiParams = ref([]); // 存储最终构建的API查询参数
 const tableData = ref([]); // 模拟查询结果
 
 // --- 方法 ---
 // 获取配置项
 async function getConfigSetting(){
   try {
     const {data} = await getCustomFormDet({
       status: 1,
       startPage: 1,
       pageSize: 99999,
       fromRout: route.name,
     })
     console.log(data);
     baseAllFields.value = data;
 
 
     // 获取初始高级查询配置
    getSearchDetail({ customFormId: data && data[0]?.customFormId }).then(res=>{
     searchItems.value = res.data;
    })
   } catch (error) {
     console.error("获取配置项失败:", error);
   }
 }
 
 function handleFieldChange(field, value) {
   console.log("字段变化:", field, value);
   // 这里可以处理字段变化的逻辑，例如更新状态或执行其他操作
 }
 // 当 DynamicForm 内部的高级查询配置发生变化时
 function handleAdvancedQueryConditionsChange(conditions) {
   console.log("父页面感知到高级查询条件变化:", conditions);
   appliedAdvancedConditions.value = conditions;
 }
 
 // 当 DynamicForm 提交时 (通过其内部的 submitForm 方法或插槽按钮触发)
 function handleFormSubmit(payload) {
   console.log("DynamicForm 提交事件，父组件接收到:", payload);
   // payload 结构:
   // {
   //   formData: { orgCode_adv_0: "123", orgName_adv_0: "abc", ... }, (原始UI数据)
   //   _formConfigSnapshot: [ ... ], (原始UI配置)
   //   apiParams: { // ★★★ 这就是你想要的结构 ★★★
   //     orgCode: { fieldName: "org_code", queryType: "8", joinQuery: "1", value: "123" },
   //     orgName: { fieldName: "org_name", queryType: "8", joinQuery: "1", value: "abc" }
   //   }
   // }
 
   loading.value = true;
   const apiParamsForRequest = payload.apiParams; // 直接使用
 
   console.log("将要发送给API的参数:", apiParamsForRequest);
 
   if (Object.keys(apiParamsForRequest).length > 0) {
     // 模拟API请求
     setTimeout(() => {
       tableData.value = [{ id: 1, query: JSON.stringify(apiParamsForRequest) }];
       loading.value = false;
     }, 1000);
     // 实际API请求:
     // yourApiService.fetchData(apiParamsForRequest)
     //   .then(response => { tableData.value = response.data; })
     //   .catch(error => { console.error("API请求失败:", error); })
     //   .finally(() => { loading.value = false; });
   } else {
     tableData.value = [];
     loading.value = false;
   }
 }
 
 // 通过 ref 调用 DynamicForm 的 submitForm 方法
 function submitQueryForm() {
   if (queryFormRef.value) {
     queryFormRef.value.submitForm();
   }
 }
 
 // 通过 ref 调用 DynamicForm 的 resetForm 方法
 function resetQueryForm() {
   if (queryFormRef.value) {
     queryFormRef.value.resetForm(); // 重置表单值和校验
     finalApiParams.value = []; // 清空参数预览
     tableData.value = []; // 清空结果
   }
 }
 
 // 清空所有查询条件 (包括高级查询)
 function clearAllQuery() {
   if (queryFormRef.value) {
     queryFormRef.value.clearAdvancedQuery(); // 清除高级查询条件
     queryFormRef.value.resetForm(); // 重置表单（这会基于清空后的配置来初始化）
     appliedAdvancedConditions.value = []; // 清空本地存储的高级条件
     finalApiParams.value = [];
     tableData.value = [];
     // ElMessage.info('所有查询条件已清空。');
   }
 }
 
 onMounted(() => {
 
   // 可以在这里加载一些默认的查询结果或执行一次默认查询
   // submitQueryForm(); // 如果需要默认加载
   getConfigSetting()
 });
 </script>