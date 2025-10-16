/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-15 15:19:54
 * @FilePath: /web3.1/src/permission.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register','/Licence']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (usePermissionStore().routes.length === 0) {
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // console.log('accessRoutes',accessRoutes);
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            // console.log(to);
            // next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
            // 创建一个新的导航对象，明确地包含所有需要的参数
            const redirectPath = { 
              path: to.path, 
              query: to.query, 
              params: to.params,
              replace: true 
            };
            next(redirectPath);
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          }).catch(() => {
            ElMessage.error(err)
          })
        })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
