/*
/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-09 17:35:48
 * @FilePath: /web3.1/src/main.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

// 计算表格列宽度
import flexColumnWidth from '@/utils/flexColumnWidth'
// 引入权限检查函数
import { checkButtonPermission } from '@/utils/permissionUtils'; 
// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'
// 标签页组件
import TabsWrapper from '@/components/TabsWrapper'
// 全屏弹窗组件
import FullscreenDialog from '@/components/FullscreenDialog'
// 自定义表单组件
import DynamicForm from '@/components/DynamicUI/DynamicForm'
// 自定义表格组件
import DynamicTable from '@/components/DynamicUI/DynamicTable'
// 导入文件组件
import UserImportDialog from '@/components/UserImportDialog'
// 导入前端分页
import PagingCom from '@/components/PagingCom'
// 引入动态增删改查页面组件
import DynamicCrudPage from '@/components/DynamicCrudPage'; // 引入新的公共组件

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels
app.config.globalProperties.flexColumnWidth = flexColumnWidth
app.config.globalProperties.checkButtonPermission = checkButtonPermission

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('TabsWrapper', TabsWrapper)
app.component('FullscreenDialog', FullscreenDialog)
app.component('DynamicForm', DynamicForm)
app.component('DynamicTable', DynamicTable)
app.component('UserImportDialog', UserImportDialog)
app.component('PagingCom', PagingCom)
app.component('DynamicCrudPage', DynamicCrudPage)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
