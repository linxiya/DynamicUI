<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="webConfig.systemMenuLogoImage" :src="webConfig.systemMenuLogoImage" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ webConfig.systemProductLineName }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="webConfig.systemMenuLogoImage" :src="webConfig.systemMenuLogoImage" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ webConfig.systemProductLineName }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import systemMenuLogoImage from '@/assets/logo/jiafanLogo.png'
import useSettingsStore from '@/store/modules/settings'
import useConfigurationStore from '@/store/modules/configuration';// 引入页面配置状态管理 Store
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const systemProductLineName = import.meta.env.VITE_APP_TITLE;
const settingsStore = useSettingsStore();
// 页面初始化配置
const configurationStore = useConfigurationStore();
const sideTheme = computed(() => settingsStore.sideTheme);

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)';
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg;
});

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)';
  }
  return sideTheme.value === 'theme-dark' ? '#fff' : variables.menuLightText;
});

// 获取配置的Logo
const webConfig = computed(() => {
  const object = configurationStore.webConfig || {};
  return {
    systemMenuLogoImage: object.systemMenuLogoImage || systemProductLineName,
    systemProductLineName: object.systemProductLineName || systemProductLineName,  
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: v-bind(getLogoBackground);
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>