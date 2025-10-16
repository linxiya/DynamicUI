/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-10-09 15:23:08
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-11 16:31:40
 * @FilePath: /web3.1/src/store/modules/configuration.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { getConfig, updateConfig } from "@/api/BasicSystem/PageConfiguration";

const useConfigurationStore = defineStore('configuration', {
  persist: true, // 开启持久化

  state: () => ({
    webConfig: null, // 初始化为 null
    pdaConfig: null,
  }),

  actions: {
    /**
     * @description 获取并缓存页面配置，智能处理 URL 前缀
     * @param {number} type - 配置类型 (1: WEB, 2: PDA)
     * @param {boolean} force - 是否强制从 API 刷新
     */
    async fetchConfig(type = 1) {
      const target = type === 1 ? 'webConfig' : 'pdaConfig';

      // 1. 检查缓存
      // 如果 state 中已有数据 (由持久化插件恢复) 且不强制刷新，直接返回
      if (this[target] && Object.keys(this[target]).length > 0) {
        console.log(`配置 (type: ${type}) 从持久化缓存加载。`, this[target]);
        return this[target];
      }

      // 2. 如果缓存不存在或需要强制刷新，则从 API 获取
      console.log(`从 API 获取配置 (type: ${type})...`);
      try {
        const res = await getConfig(type);
        let configData = res.data || {};
        
        // [!code focus--start]
        // --- 核心逻辑：只在从 API 获取新数据时才添加前缀 ---
        const baseUploadUrl = import.meta.env.VITE_APP_BASE_URL; 
        for (const key in configData) {
          if (key.includes('Image') && configData[key] && !configData[key].startsWith('http')) {
            configData[key] = baseUploadUrl + configData[key];
          }
        }
        // [!code focus--end]
        
        this[target] = configData; // 将处理好的、带前缀的数据存入 state
        return this[target];
      } catch (error) {
        console.error(`获取配置 (type: ${type}) 失败:`, error);
        return {}; 
      }
    },
    
    /**
     * @description 更新页面配置
     */
    async updateConfiguration(type, data) {
      // 提交前，移除前缀的逻辑保持不变
      const baseUploadUrl = import.meta.env.VITE_APP_BASE_URL;
      const payload = { ...data };
      for (const key in payload) {
        if (key.includes('Image') && payload[key] && payload[key].startsWith(baseUploadUrl)) {
          payload[key] = payload[key].replace(baseUploadUrl, '');
        }
      }

      await updateConfig(payload);
      
      // 保存成功后，用带有完整 URL 的视图数据直接更新 state
      // 插件会自动将这份带前缀的数据持久化
      const target = type === 1 ? 'webConfig' : 'pdaConfig';
      this[target] = data;
    },
  },
});

export default useConfigurationStore;