/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-20 10:43:14
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-20 10:44:33
 * @FilePath: /frontUI_vue3/src/composables/useAdvancedQueryPersistence.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { saveSearchDetail } from "@/api/BasicSystem/CustomFormDetails"; // 引入你的 API
/**
 * @description 用于处理高级查询条件持久化（保存到后端）的可组合函数。
 * @returns {object} 返回包含保存方法和状态的对象。
 * @returns {Function} .saveConditions - 异步函数，用于保存查询条件。
 * @returns {import('vue').Ref<boolean>} .isSaving - Ref 对象，表示当前是否正在保存。
 */
export function useAdvancedQueryPersistence() {
  // 1. 定义内部状态 (如果需要)
  const isSaving = ref(false); // 用于表示当前是否正在执行保存操作

  // 2. 定义核心的保存函数
  /**
   * @description 异步保存高级查询条件到后端。
   * @param {string|number} customFormId - 自定义表单的 ID。
   * @param {Array<object>} conditions - 要保存的高级查询条件数组。
   * @returns {Promise<void>} 成功则 resolve，失败则 reject 或抛出错误。
   */
  async function saveConditions(customFormId, conditions) {
    // 参数校验 (可选，但推荐)
    if (!customFormId) {
      console.warn('useAdvancedQueryPersistence: customFormId 不能为空。');
      return Promise.reject(new Error('customFormId 不能为空'));
    }
    if (!conditions || !Array.isArray(conditions)) {
      console.warn('useAdvancedQueryPersistence: conditions 必须是一个数组。');
      return Promise.reject(new Error('conditions 必须是一个数组'));
    }

    isSaving.value = true; // 开始保存，设置 loading 状态

    try {
      // 调用实际的 API 函数
      const response = await saveSearchDetail({
        customFormId: customFormId,
        customSearchDetailAddDTO: conditions, // API 需要的参数结构
      });
      console.log('高级查询条件已成功保存 (来自 Hook)。');
      return Promise.resolve(response); // API 调用成功，resolve
    } catch (error) {
      // 可选：在这里处理失败的提示，或者让调用方处理
      console.error('通过 Hook 保存高级查询条件失败:', error);
      return Promise.reject(error); // API 调用失败，reject 或重新抛出错误
    } finally {
      isSaving.value = false; // 无论成功或失败，结束保存，重置 loading 状态
    }
  }

  // 3. 返回需要暴露给组件使用的状态和方法
  return {
    saveConditions, // 保存方法
    isSaving,       // 保存状态 (loading)
  };
}