<!--
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-16 18:04:39
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-26 14:30:05
 * @FilePath: /frontUI_vue3/README.md
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
-->

<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">frontUI1.0</h1>
<h4 align="center">基于SpringBoot+Vue3前后端分离的Java快速开发框架</h4>


## 平台简介

* 本仓库为前端技术栈 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) 版本。
## 前端运行

```bash
# 克隆项目
git clone http://121.37.11.32:8091/frontUI/1.0.git

# 进入项目目录
cd 1.0

# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod
# 前端访问地址 http://localhost:80
```

## 本次重大更新
1.在多个项目下解决 token 在同域下冲突导致 token 失效
2.token失效重新登录保留在失效的页面
3.自定义表单重构，详情见组件 md
4.菜单根据后台生成，无需手动配置菜单
5.layout 重新布局，适配不同分辨率的显示
6.取消config.js，统一走proxy代理，.env配置
7.全屏对话框重构为FullscreenDialog
8.页面级导入数据组件UserImportDialog
9.表格按钮统一TabsWrapper组件布局
10.新增主题暗黑模式