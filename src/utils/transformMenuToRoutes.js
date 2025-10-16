/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-27 16:35:12
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-30 11:15:06
 * @FilePath: /web3.1/src/utils/transformMenuToRoutes.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import cache from "@/plugins/cache";
/**
 * 对外接口：只需传入后端菜单，内部会生成路由并 cache 一次按钮权限
 * @param {Array} menuList
 * @returns {Array} Vue 路由列表
 */
export default function transformMenuToRoutes(menuList) {
  const buttonPermissionList = [];
  const routes = _transformMenuToRoutes(menuList, '', buttonPermissionList);

  // 把收集到的按钮权限一次性存到 sessionCache
  cache.session.setJSON("buttonPermission", buttonPermissionList);

  return routes;
}

/**
 * 递归地把菜单转换为路由，并同时往同一个数组里收集所有 isMenu===2 的按钮权限
 * @param {Array} menuList - 后端返回的菜单数组
 * @param {string} parentViewPath - 父级视图路径，初次调用传 ''
 * @param {Array} buttonPermissionList - 用于全局收集按钮权限的数组，递归时传同一个实例
 * @returns {Array} Vue 路由数组
 */
function _transformMenuToRoutes(menuList, parentViewPath, buttonPermissionList) {
  return menuList
    .map((item) => {
      const dto = item.sysMenuInfoDto || {};
      const rawUrl = dto.premenuId;
      if (!rawUrl || typeof rawUrl !== 'string') {
        console.warn('跳过无效 url 的菜单项：', dto);
        return null;
      }

      const path = rawUrl;
      const name = rawUrl.replace(/\//g, '');
      const viewPath = parentViewPath ? `${parentViewPath}/${rawUrl}` : rawUrl;

      // 确定 component 和 redirect
      let component;
      if (parentViewPath === '') {
        component = 'Layout';
        dto.redirect = 'noRedirect';
        // dto.icon = "sunny"
      } else if (dto.isMenu === 1) {
        component = 'ParentView';
        dto.redirect = 'noRedirect';
      } else {
        component = viewPath.replace(/^\/+/, '');
      }

      // 收集按钮权限
      if (dto.isMenu === 2) {
        dto.isHide = true;
        component = '';
        buttonPermissionList.push(rawUrl);
      }

      const route = {
        path,
        component,
        name,
        meta: {
          title: dto.menuDesc || dto.menuName || name,
          icon: dto.icon || ''
        },
        alwaysShow: dto.alwaysShow || false,
        redirect: dto.redirect || null,
        hidden: !!dto.isHide
      };

      // 递归子菜单，传入同一个 buttonPermissionList
      if (Array.isArray(item.sysMenuinList) && item.sysMenuinList.length) {
        route.children = _transformMenuToRoutes(
          item.sysMenuinList,
          viewPath,
          buttonPermissionList
        );
      }

      return route;
    })
    .filter(r => r);
}