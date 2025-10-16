<template>
  <!-- 登录页面的根容器 -->
  <div class="login-container" :style="{ backgroundImage: `url(${webConfig.loginBackgroundImage})` }">
    <!-- 登录内容盒子，用于居中和设定最大宽度 -->
    <div class="login-box">
      <!-- 登录表单卡片，包含左右两部分 -->
      <div class="login-form card">
        <!-- 左侧区域：系统名称和插画 -->
        <div class="form-left">
          <!-- 系统名称 -->
          <!-- <div class="tit">{{ sysName }}</div> -->
          <!-- 项目插画图片，阻止右键菜单 -->
          <img @contextmenu.prevent="preventImageContextMenu" :src="webConfig.loginThemeImage" alt="项目插画" />
        </div>

        <!-- 右侧区域：Element Plus 表单 -->
        <el-form
          size="large"
          ref="loginFormRef"  
          :model="loginForm"
          :rules="loginRules"
          @submit.prevent="handleLogin"  
          class="form-right"
        >
          <!-- Logo 图片 -->
          <img class="imgSideBar" :src="webConfig.loginLogoImage" alt="Logo" />

          <!-- 表单内容区域 -->
          <div style="width: 100%">
            <!-- 组织选择下拉框 -->
            <el-form-item prop="orgId">
              <el-select
                v-model="loginForm.orgId"
                placeholder="请选择组织"
                clearable
                style="width: 100%" 
              >
                <el-option
                  v-for="item in orgList"
                  :key="item.orgId"
                  :label="item.orgName"
                  :value="item.orgId"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 用户名输入框 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="账号"
              >
                <!-- 输入框前缀图标 -->
                <template #prefix>
                  <svg-icon
                    icon-class="user"
                    class="el-input__icon input-icon"
                  />
                </template>
              </el-input>
            </el-form-item>

            <!-- 密码输入框 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                auto-complete="off"
                placeholder="密码"
                show-password 
              >
                <!-- 输入框前缀图标 -->
                <template #prefix>
                  <svg-icon
                    icon-class="password"
                    class="el-input__icon input-icon"
                  />
                </template>
              </el-input>
            </el-form-item>

            <!-- 记住密码和忘记密码区域 -->
            <el-form-item
              class="check-form"
              style="color: #858d9f; padding: 0 10px"
            >
              <!-- 记住密码复选框 -->
              <el-checkbox
                style="float: left; color: #858d9f"
                v-model="loginForm.rememberMe"
              >
                记住密码
              </el-checkbox>
              <!-- 忘记密码功能 (注释掉的部分) -->
              <!-- <span style="float: right">忘记密码</span> -->
              <!--
              <el-popover
                style="float: right"
                placement="right"
                width="100"
                trigger="click"
                content="请联系相关管理员"
                ref="reference"
              >
                <el-button type="text" style="color: #858d9f" slot="reference">忘记密码</el-button>
              </el-popover>
              -->
            </el-form-item>
          </div>

          <!-- 登录按钮 -->
          <el-button
            :loading="loading" 
            type="primary"
            class="loginbtn"
            style="width: 100%"
            native-type="submit" 
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>

          <!-- 底部提示信息 -->
          <div class="tips">
            <!-- 联系方式 -->
            <div>{{ webConfig.loginDutyTelephone }}</div>
            <!-- 版权声明 -->
            <div class="loginCopyrightName">{{ webConfig.loginCopyrightName }}</div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup name="login">
import { ref, reactive, onMounted, watch, getCurrentInstance } from 'vue'; // 引入 Vue 组合式 API
import { useRoute, useRouter } from 'vue-router'; // 引入 Vue Router
import Cookies from 'js-cookie'; // 引入 js-cookie 操作 Cookie
import { encrypt, decrypt } from '@/utils/jsencrypt'; // 引入加解密工具
import useUserStore from '@/store/modules/user'; // 引入用户状态管理 Store
import useConfigurationStore from '@/store/modules/configuration';// 引入页面配置状态管理 Store
import { getList } from '@/api/BaseData/EnterpriseBase/Organization'; // 引入获取组织列表的 API
import loginThemeImage from '@/assets/images/bg2.jpg'; // 引入左侧插画图片
import loginLogoImage from '@/assets/images/logo0609-08.png'; // 引入表单内 Logo 图片
import loginBackgroundImage from '@/assets/images/bg1.jpg'; // 默认登录背景图
import { ElMessage } from 'element-plus'; // 引入 Element Plus 消息提示

// --- 静态常量 ---
const sysName = '聚创云平台'; // 系统名称 (常量)
const loginDutyTelephone = '020-3170 7961'; // 登录页备注信息 (常量)
const loginCopyrightName = 'Copyright © 2023 聚创云平台 All Rights Reserved'; // 版权声明 (常量)

// --- 组件实例和路由 ---
const { proxy } = getCurrentInstance(); // 获取当前组件实例，用于访问 refs
const userStore = useUserStore(); // 获取用户 Store 实例
const route = useRoute(); // 获取当前路由信息
const router = useRouter(); // 获取路由实例

// --- 响应式状态 ---
const orgList = ref([]); // 组织列表
const loading = ref(false); // 登录按钮加载状态
const redirect = ref(undefined); // 登录成功后的重定向路径

// 登录表单数据模型
const loginForm = reactive({
  username: '', // 用户名
  password: '', // 密码
  rememberMe: false, // 是否记住密码
  orgId: null, // 选中的组织 ID
});

// 登录表单验证规则
const loginRules = {
  // 组织ID验证：必填，触发方式为 change
  orgId: [{ required: true, trigger: 'change', message: '请选择组织' }],
  // 用户名验证：必填，触发方式为 blur
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  // 密码验证：必填，触发方式为 blur
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
};

// 页面初始化配置
const configurationStore = useConfigurationStore();

console.log(configurationStore.webConfig);

// --- Refs ---
const loginFormRef = ref(null); // 登录表单的引用

// --- 生命周期钩子 ---
onMounted(() => {
  // 组件挂载后，获取组织列表
  getOrgList();
  // 组件挂载后，尝试从 Cookie 读取已保存的信息
  loadCredentialsFromCookie();
});

// 计算属性
const webConfig = computed(() => {
  const object = configurationStore.webConfig || {};
  return {
    loginBackgroundImage: object.loginBackgroundImage || loginBackgroundImage,
    loginThemeImage: object.loginThemeImage || loginThemeImage,  
    loginLogoImage: object.loginLogoImage || loginLogoImage,
    loginCopyrightName: object.loginCopyrightName || loginCopyrightName,
    loginDutyTelephone: object.loginDutyTelephone || loginDutyTelephone,
  }
});

// --- 监听器 ---
// 监听路由变化，获取重定向路径
watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true } // 立即执行一次，确保初始加载时也能获取 redirect
);

// --- 方法 ---

/**
 * @description 处理登录逻辑
 */
const handleLogin = async () => {
  // 校验表单
  if (!loginFormRef.value) return; // 防御：确保 ref 存在
  try {
    await loginFormRef.value.validate(); // 调用 Element Plus 表单的 validate 方法
  } catch (error) {
    // 校验失败，不继续执行
    console.log('表单校验失败', error);
    return;
  }

  // 设置加载状态
  loading.value = true;

  try {
    // 处理"记住密码"逻辑
    if (loginForm.rememberMe) {
      // 勾选了记住密码，将用户名、加密后的密码、组织ID 和 记住状态 存入 Cookie，有效期 30 天
      Cookies.set('username', loginForm.username, { expires: 30 });
      Cookies.set('password', encrypt(loginForm.password), { expires: 30 }); // 只加密密码
      Cookies.set('orgId', loginForm.orgId, { expires: 30 }); // orgId 无需加密
      Cookies.set('rememberMe', String(loginForm.rememberMe), { expires: 30 }); // 存储布尔值的字符串形式
    } else {
      // 未勾选，则移除相关 Cookie
      Cookies.remove('username');
      Cookies.remove('password');
      Cookies.remove('orgId');
      Cookies.remove('rememberMe');
    }

    // 调用 Pinia store 中的 login action
    await userStore.login(loginForm);

    // 登录成功，处理重定向
    const query = route.query;
    // 构造重定向时的查询参数 (排除 'redirect' 参数本身)
    const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
      if (cur !== 'redirect') {
        acc[cur] = query[cur];
      }
      return acc;
    }, {});
    // 跳转到目标页面 (redirect 指定的页面或首页)
    router.push({ path: redirect.value || '/', query: otherQueryParams });

  } catch (error) {
    // 登录失败，通常 store action 会处理错误提示，这里只重置加载状态
    console.error('登录失败:', error);
    // 可以在这里添加统一的错误提示，如果 store action 没有处理的话
    // ElMessage.error('登录失败，请检查您的账号或密码');
  } finally {
    // 无论成功或失败，最终都将加载状态设为 false
    loading.value = false;
  }
};

/**
 * @description 阻止图片右键菜单并提示
 * @param {Event} event - 右键事件对象
 */
function preventImageContextMenu(event) {
  // console.log(event); // 调试用，可注释或移除
  // 判断右击事件是否发生在图片元素上
  if (event.target.tagName === 'IMG') {
    // 提示用户图片不能复制
    ElMessage.warning('对不起，本图片不能复制，版权所有！');
    // 阻止默认的右键菜单行为 (注意：这种全局修改方式可能影响页面其他部分，谨慎使用)
    // document.oncontextmenu = () => false; // 临时禁用
    // setTimeout(() => { document.oncontextmenu = null; }, 0); // 异步恢复，避免影响后续操作
    // 更推荐的方式是直接在事件处理器中 event.preventDefault()，Vue 模板中已经做了
  }
  // Vue模板中的 .prevent 修饰符已经阻止了默认行为，这里主要用于弹出提示
}

/**
 * @description 异步获取组织列表
 */
const getOrgList = async () => {
  try {
    // 调用 API 获取组织数据
    const res = await getList({
      pageSize: 99999, // 获取所有数据
      status: 1,       // 只获取状态为 1 (通常表示启用) 的组织
      startPage: 1,    // 从第一页开始
    });
    // 更新组织列表数据，如果 API 返回数据为空，则默认为空数组
    orgList.value = res.data || [];
    // 如果之前 Cookie 中有 orgId，且列表加载完成，尝试恢复选中
    if (loginForm.orgId && orgList.value.length > 0) {
        // 可以在这里检查 orgId 是否在列表中有效，如果无效则清空
        const isValidOrg = orgList.value.some(org => org.orgId === loginForm.orgId);
        if (!isValidOrg) {
            loginForm.orgId = null; // 如果之前保存的 orgId 无效，则清空
        }
    }
  } catch (error) {
    // API 请求失败处理
    console.error('获取组织列表失败:', error);
    ElMessage.error('获取组织列表失败，请稍后重试');
    orgList.value = []; // 清空列表，避免显示旧数据
  }
};

/**
 * @description 从 Cookie 加载保存的登录凭据
 */
function loadCredentialsFromCookie() {
  const username = Cookies.get('username');
  const encryptedPassword = Cookies.get('password'); // 获取加密后的密码
  const orgId = Cookies.get('orgId');
  const rememberMe = Cookies.get('rememberMe');

  // 如果 Cookie 中存在用户名，则填充表单
  if (username) {
    loginForm.username = username;
  }
  // 如果 Cookie 中存在加密密码，则解密并填充表单
  if (encryptedPassword) {
    try {
      loginForm.password = decrypt(encryptedPassword); // 解密密码
    } catch (e) {
      console.error('解密密码失败:', e);
      Cookies.remove('password'); // 解密失败，移除错误的cookie
    }
  }
   // 如果 Cookie 中存在组织ID，则填充表单 (注意类型转换)
  if (orgId) {
    loginForm.orgId = parseInt(orgId, 10); // Cookie 存的是字符串，需转为数字
  }
  // 如果 Cookie 中存在记住密码状态，则更新复选框状态 (注意类型转换)
  if (rememberMe) {
    loginForm.rememberMe = rememberMe === 'true'; // Cookie 存的是字符串，需转为布尔值
  }
}

// --- 移除未使用的代码 ---
// const title = import.meta.env.VITE_APP_TITLE; // 如果模板中未使用 VITE_APP_TITLE，可以移除
// const codeUrl = ref(''); // 未使用，移除
// const passwordType = ref('password'); // 已使用 el-input 的 show-password 替代，移除

</script>

<style lang="scss" > /* 使用 scoped 限制样式作用域 */
/* 移除未使用的 SCSS 变量 $bg */
$dark_gray: #5f6368; /* 深灰色变量，如果未使用也可移除 */

/* 登录容器 */
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: #4675fd; /* 使用固定背景色 */
  position: relative;
  overflow: hidden; /* 隐藏溢出的动画元素 */
  // background: url('../assets/images/bg1.jpg'); /* 替换为实际背景图路径 */
  background-size: 100%; /* 设置条纹大小 */

  // /* 背景动态效果 - 使用伪元素创建斜纹背景 */
  // &::before {
  //   content: "";
  //   position: absolute;
  //   width: 100%; /* 放大确保覆盖 */
  //   height: 100%;
  //   // top: -50%; /* 调整位置使其居中 */
  //   // left: -50%;
  //   background: url('../assets//背景图/bg1.jpg'); /* 替换为实际背景图路径 */
  //   background-size: 100%; /* 设置条纹大小 */
  //   // transform: rotate(15deg); /* 旋转背景 */
  //   opacity: 0.5; /* 调整透明度 */
  //   z-index: 0; /* 置于内容下方 */
  //   animation: moveBackground 20s linear infinite; /* 添加动画效果 */
  // }
}



/* 登录盒子 */
.login-box {
  position: relative; /* 确保在伪元素之上 */
  z-index: 1;
  width: 90%; /* 使用百分比宽度，适应不同屏幕 */
  max-width: 1100px; /* 限制最大宽度 */
  margin: 0 auto; /* 水平居中 */
}

/* 登录表单容器 */
.login-form {
  display: grid; /* 使用 Grid 布局 */
  grid-template-columns: 1fr 1fr; /* 默认两列等宽 */
  background: rgba(255, 255, 255, 0.98); /* 半透明白色背景 */
  border-radius: 20px; /* 圆角 */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15); /* 更柔和的阴影 */
  overflow: hidden; /* 防止子元素溢出圆角 */
  min-height: 600px; /* 最小高度 */
  .el-input__prefix{
    height: 15px; /* 图标高度 */
  }
  /* 左侧区域 */
  .form-left {
    // padding: 40px; /* 内边距 */
    background: linear-gradient(135deg, #f8f9ff, #e6f0ff); /* 浅色渐变背景 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* 垂直居中 */
    text-align: center; /* 文本居中 */

    // .tit {
    //   font-size: 2.2rem; /* 调整字体大小 */
    //   font-weight: 700;
    //   color: #1a2f6d; /* 深蓝色字体 */
    //   margin-bottom: 2.5rem; /* 标题下方间距 */
    //   text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1); /* 轻微文字阴影 */
    // }

    img {
      max-width: 100%; /* 限制图片最大宽度 */
      height: 100%;
      // width: 100%;
      // height: auto; /* 高度自适应 */
      transition: transform 0.4s ease-in-out; /* 平滑过渡效果 */

      &:hover {
        transform: scale(1.03); /* 鼠标悬停时轻微放大 */
      }
    }
  }

  /* 右侧表单区域 */
  .form-right { /* 给右侧表单加一个 class 方便选择 */
    padding: 30px 50px; /* 内边距 */
    display: flex; /* 使用 Flex 布局 */
    flex-direction: column; /* 垂直排列 */
    justify-content: center; /* 内容垂直居中 */
    position: relative; /* 用于内部绝对定位元素 */

    .imgSideBar {
      width: 110px; /* Logo 宽度 */
      margin: 0 auto 2rem; /* 水平居中，下方间距 */
      display: block; /* 确保是块级元素 */
    }

    /* 输入框图标统一样式 */
    .input-icon {
      // height: 39px; /* Element Plus 默认会处理好 */
      width: 16px; /* 图标宽度 */
      margin-left: 2px; /* 图标左边距 */
      font-size: 1.1rem; /* 图标大小 */
      color: #4675fd; /* 图标颜色 */
      vertical-align: middle; /* 垂直居中 */
    }

    /* Element Plus 组件样式覆盖 */
    .el-form-item {
        margin-bottom: 1.8rem; /* 统一表单项间距 */
    }

    .el-input,
    .el-select {
      width: 100%; /* 宽度占满容器 */
      transition: all 0.3s ease; /* 平滑过渡 */

      .el-input__wrapper,
      .el-select__wrapper { /* 统一 input 和 select 的 wrapper 样式 */
        height: 50px; /* 统一高度 */
        background-color: #f5f6f7; /* 浅灰色背景 */
        border-radius: 10px; /* 圆角 */
        padding: 6px 15px; /* 内边距调整 */
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06); /* 轻微内阴影 */
        transition: box-shadow 0.3s ease, border-color 0.3s ease; /* 平滑过渡 */
        border: 1px solid transparent; /* 预留边框空间 */

        &:hover {
          border-color: #c0d8ff; /* 悬停时边框颜色 */
          box-shadow: 0 2px 8px rgba(70, 117, 253, 0.15); /* 悬停时外阴影 */
        }

        &.is-focus {
          border-color: #4675fd !important; /* 聚焦时边框颜色 */
          box-shadow: 0 0 0 2px rgba(70, 117, 253, 0.2) !important; /* 聚焦时外发光效果 */
          background-color: #fff; /* 聚焦时背景变白 */
        }
      }
    }

    /* 记住密码区域 */
    .check-form {
      margin: 0.5rem 0 1.5rem; /* 上下间距调整 */
      padding: 0 5px !important; /* 覆盖内联样式 */

      .el-checkbox {
        .el-checkbox__label {
          color: #6c757d; /* 标签文字颜色 */
          font-size: 0.9rem; /* 字体大小 */
        }
      }
    }

    /* 登录按钮 */
    .loginbtn {
      height: 48px;
      font-size: 1.1rem;
      letter-spacing: 3px; /* 增加字间距 */
      background: linear-gradient(135deg, #4675fd, #5a88fe); /* 按钮渐变色 */
      border: none;
      border-radius: 10px; /* 圆角 */
      transition: all 0.3s ease;
      width: 100%; /* 确保按钮宽度是 100% */
      margin-top: 0.5rem; /* 按钮上方间距 */

      &:hover {
        transform: translateY(-2px); /* 悬停时上移 */
        box-shadow: 0 6px 18px rgba(70, 117, 253, 0.35); /* 悬停时阴影加深 */
        background: linear-gradient(135deg, #5a88fe, #4675fd); /* 悬停时渐变反向或加深 */
      }
      &:active {
          transform: translateY(0px); /* 点击时恢复 */
          box-shadow: 0 3px 10px rgba(70, 117, 253, 0.25); /* 点击时阴影变浅 */
      }
       /* 加载状态 */
      &.is-loading {
        background: #a0bfff; /* 加载时按钮颜色变浅 */
        box-shadow: none;
        transform: none;
      }
    }

    /* 底部信息 */
    .tips {
      margin-top: 2.5rem; /* 顶部间距 */
      color: #6c757d; /* 文字颜色 */
      font-size: 0.9rem;
      line-height: 1.6;
      text-align: center; /* 居中显示 */

      .loginCopyrightName {
        margin-top: 0.8rem; /* 声明上方间距 */
        font-size: 0.8rem;
        color: #adb5bd; /* 版权文字颜色更浅 */
      }
    }
  }
}

/* 响应式适配 */
@media (max-width: 992px) { /* 中等屏幕，如平板 */
  .login-form {
    grid-template-columns: 1fr; /* 变为单列布局 */
    min-height: auto; /* 移除最小高度限制 */
    max-width: 500px; /* 在单列时限制最大宽度 */
    margin: 2rem auto; /* 上下边距，并保持水平居中 */

    .form-left {
      display: none; /* 在小屏幕上隐藏左侧插画区域 */
    }

    .form-right {
      padding: 30px 40px; /* 调整内边距 */
    }
  }
}

@media (max-width: 576px) { /* 小型屏幕，如手机 */
  .login-box {
    width: 95%; /* 宽度更宽一点 */
  }

  .login-form {
    border-radius: 15px; /* 圆角稍小 */
    max-width: 100%; /* 允许宽度占满 */

    .form-right {
      padding: 25px 25px; /* 进一步减小内边距 */

      .imgSideBar {
        width: 90px; /* Logo 再小一点 */
        margin-bottom: 1.5rem; /* 调整下方间距 */
      }

      .el-form-item {
        margin-bottom: 1.5rem; /* 调整表单项间距 */
      }

       .loginbtn {
        height: 45px; /* 按钮高度稍小 */
        font-size: 1rem; /* 字体大小 */
      }

      .tips {
        margin-top: 2rem; /* 调整提示信息间距 */
      }
    }
  }
}
</style>