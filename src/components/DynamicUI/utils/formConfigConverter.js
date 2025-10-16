/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-09-29 16:17:13
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-29 16:18:07
 * @FilePath: /web3.1/src/components/DynamicUI/utils/formConfigConverter.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
/**
 * 将从父组件提供的动态选项映射 (dynamicOptionsMap) 合并到基础表单字段配置中。
 * 
 * @param {Array} baseFields - 从后端获取的基础字段配置数组 (例如 baseAllFields)。
 * @param {Object} dynamicOptionsMap - 父组件提供的动态数据映射。
 *   - 格式: { itemKey1: ref(options1), itemKey2: ref(options2), ... }
 *   - 或者更通用的: { itemKey1: ref({ options: [...], disabled: true }), ... }
 * @returns {Array} - 合并了动态数据后的、可用于渲染 DynamicForm 的最终配置数组。
 */
export function mergeDynamicOptions(baseFields, dynamicOptionsMap) {
  // 防御性检查
  if (!Array.isArray(baseFields)) {
    console.error("mergeDynamicOptions: baseFields 必须是一个数组。");
    return [];
  }
  if (typeof dynamicOptionsMap !== 'object' || dynamicOptionsMap === null) {
    return baseFields; // 如果没有提供映射，则直接返回基础配置
  }

  return baseFields.map(field => {
    // 检查当前字段的 itemKey 是否存在于映射对象中
    const dynamicConfigProvider = dynamicOptionsMap[field.itemKey];

    if (dynamicConfigProvider) {
      // 如果存在，说明这个字段需要动态配置
      // 使用 unref 安全地获取 ref 或普通对象的值
      const dynamicConfig = unref(dynamicConfigProvider);

      // 创建一个新的字段对象，合并基础配置和动态配置
      // 如果 dynamicConfig 只是一个 options 数组，则创建一个 { options: ... } 的对象
      const overrides = Array.isArray(dynamicConfig) 
        ? { options: dynamicConfig } 
        : dynamicConfig;
      
      return {
        ...field,
        ...overrides,
      };
    }
    
    // 如果不在映射中，直接返回原始字段配置
    return field;
  });
}