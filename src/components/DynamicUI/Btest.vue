<template>
  <div class="app-container">
     <div class="hearder">
       <div class="searchForm-box">
       <DynamicForm
         ref="dynamicFormRef"
         :form-config="myFormConfig"
         :initial-data="myInitialData"
         :rules="myFormRules"
         label-width="120px"
         @submit="handleFormSubmit"
         @append-click="handleItemAppendClick"
         @fieldChange="handleFieldUpdate"
         inline
         :show-fold-button="true"
         :initial-fold="false"
       >
         <!-- 可以自定义操作按钮区域 -->
         <template #actions="{ form, data }">
           <el-button type="success" @click="customSubmit(data)">自定义提交</el-button>
           <el-button @click="() => form.resetFields()">调用内部重置</el-button>
         </template>
       </DynamicForm>
       </div>
     </div>
     <div style="margin-top: 20px;">
       <el-button @click="validateForm">外部验证</el-button>
       <el-button @click="resetFormExternally">外部重置</el-button>
       <el-button @click="getFormDataExternally">获取数据</el-button>
       <el-button @click="setFormDataExternally">设置数据</el-button>
     </div>
     <pre>{{ currentFormData }}</pre>
   </div>
 </template>
 
 <script setup>
 
 
 const dynamicFormRef = ref(null); // 用于获取 DynamicForm 组件实例的引用
 const currentFormData = ref({});
 
 // 1. 表单配置 (示例)
 const myFormConfig = ref([
   { itemKey: 'name', itemName: '姓名', type: 0, isRequired: true, placeholder: '姓名的角度' },
   { itemKey: 'age', itemName: '年龄', type: 13, minValue: 0, maxValue: 120, isRequired: true },
   { itemKey: 'gender', itemName: '性别', type: 5, isEnum: 1, enumData: '[{"value":1,"text":"男"},{"value":2,"text":"女"}]', isRequired: true },
   { itemKey: 'hobbies', itemName: '爱好', type: 7, isEnum: 1, enumData: '[{"value":"reading","text":"阅读"},{"value":"music","text":"音乐"},{"value":"sports","text":"运动"}]' },
   { itemKey: 'birthDate', itemName: '出生日期', type: 4, format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
   { itemKey: 'isAdmin', itemName: '管理员', type: 3 }, // 开关
   { itemKey: 'description', itemName: '描述', type: 12, rows: 3 }, // 文本域
   { itemKey: 'avatar', itemName: '头像', type: 9, limit: 1, accept: '.jpg,.png' }, // 文件上传
   { itemKey: 'searchCode', itemName: '搜索代码', type: 30 }, // 带后置按钮输入框
   { itemKey: 'status', itemName: '状态', type: 50, isEnum: 1, enumData: JSON.stringify([{value: 'active', text: '激活'}, {value: 'inactive', text: '禁用'}]) },
   { itemKey: 'password', itemName: '密码', type: 40, isRequired: true },
 ]);
 
 // 2. 初始数据 (可选)
 const myInitialData = ref({
   name: '张三',
   hobbies: ['music'],
   isAdmin: '1',
   avatar: [ // 初始文件列表示例 (需要符合 el-upload 的 file 对象结构)
     { name: 'existing.jpg', url: 'https://example.com/existing.jpg', status: 'success', uid: 12345 }
   ],
   gender:1
 });
 
 // 3. 验证规则 (Element Plus 格式)
 const myFormRules = ref({
   // name: [
   //   { required: true, message: '姓名是必填项', trigger: 'blur' },
   //   { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
   // ],
   // age: [
   //   { required: true, message: '年龄是必填项', trigger: 'change' },
   //   { type: 'number', message: '年龄必须为数字值', trigger: 'change' },
   //   { validator: (rule, value, callback) => {
   //       if (value < 18) {
   //         callback(new Error('必须年满18岁'));
   //       } else {
   //         callback();
   //       }
   //     }, trigger: 'change'
   //   }
   // ],
   // gender: [ { required: true, message: '请选择性别', trigger: 'change' } ],
   // password: [ { required: true, message: '请输入密码', trigger: 'blur' } ],
 });
 
 // --- 父组件方法 ---
 
 // 处理表单提交事件
 function handleFormSubmit(formData) {
   console.log('父组件收到提交事件，数据:', formData);
   currentFormData.value = formData;
   // 在这里可以发送数据到后端等操作
   alert('表单提交成功! (查看控制台)');
 }
 
 // 处理字段值变化事件 (可选)
 function handleFieldUpdate({ key, value }) {
   console.log(`父组件监听到字段 ${key} 变化为:`, value);
 }
 
 // 处理后置按钮点击事件
 function handleItemAppendClick(itemKey, currentValue) {
   console.log(`父组件收到 ${itemKey} 的 append-click 事件, 当前值: ${currentValue}`);
   alert(`点击了 ${itemKey} 的搜索按钮!`);
 }
 
 // --- 通过 ref 调用 DynamicForm 方法 ---
 async function validateForm() {
   if (dynamicFormRef.value) {
     const isValid = await dynamicFormRef.value.validate();
     alert(isValid ? '外部验证通过' : '外部验证失败');
   }
 }
 
 function resetFormExternally() {
   dynamicFormRef.value?.resetForm();
 }
 
 function getFormDataExternally() {
   if (dynamicFormRef.value) {
     const data = dynamicFormRef.value.getFormData();
     console.log('外部获取数据:', data);
     currentFormData.value = data;
     alert('数据已打印到控制台');
   }
 }
  
 function customSubmit(data) {
   console.log('自定义提交:', toRaw(data) );
   // alert('自定义提交成功! (查看控制台)');
 }
 
 function setFormDataExternally() {
    if (dynamicFormRef.value) {
      const newData = {
        name: '李四-外部设置',
        age: 30,
        hobbies: ['reading', 'sports'],
        avatar: [], // 清空头像
      };
      dynamicFormRef.value.setFormData(newData);
      console.log('外部设置数据完成');
    }
 }
 
 </script>