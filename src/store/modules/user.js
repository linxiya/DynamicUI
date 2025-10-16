/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-20 11:41:02
 * @FilePath: /frontUI_vue3/src/store/modules/user.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from "@/utils/validate"
import defAva from '@/assets/images/profile.jpg'
import cache from '@/plugins/cache'
import usePermissionStore from '@/store/modules/permission'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      refreshtoken: cache.session.get('refreshtoken') || '',
      permissions: ["*:*:*"],
      roles: cache.session.getJSON('roles') || '',
    }),
    actions: {
      // 登录
      login(userInfo) {

        return new Promise((resolve, reject) => {
          login(userInfo).then(res => {
            console.log(res);
            const { data } = res
            setToken(data.token)
            this.roles = data.roles
            // 设置token和刷新token
            cache.session.set('refreshtoken', data.refreshToken)
            cache.session.setJSON("menuList", data["menuList"] || [])
            cache.session.setJSON("roles", data["roles"] || [])
            // 存权限id
            cache.session.set("userId", data.userId);
            cache.session.set("userName", data.userName);
            cache.session.set("orgId", data.orgId);
            cache.session.set("deptId", data.deptId);

            // 获取菜单并登入
            // return new Promise((onFullfilled) => {
            //   onFullfilled(dispatch("any_SET_MUEN"));
            // });
            
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      async logOut() {
        // 无论退出接口是否成功，先清除本地状态
        this.roles = []
        this.permissions = []
      
        removeToken()
        cache.session.remove('refreshtoken')
        cache.session.remove('menuList')
        cache.session.remove('roles')
        cache.session.remove('userId')
        cache.session.remove('userName')
        cache.session.remove('orgId')
        cache.session.remove('deptId')
      
        // 然后尝试请求服务器退出接口
        try {
          await logout() // 可以不传 token，后端应通过请求头判断
        } catch (error) {
          console.warn('退出接口调用失败:', error)
          // 不影响前端退出流程
        }
      }
      
    }
  })

export default useUserStore
