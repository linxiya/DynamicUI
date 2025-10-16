import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const store = createPinia(); // 1. 创建 Pinia 实例
store.use(piniaPluginPersistedstate); // 2. 为实例注册持久化插件

export default store; // 3. 导出这个配置好的实例