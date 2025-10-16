/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-15 15:20:17
 * @FilePath: /web3.1/src/store/modules/permission.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import auth from "@/plugins/auth";
import router, { constantRoutes, dynamicRoutes } from "@/router";
import { getRouters } from "@/api/menu";
import Layout from "@/layout/index";
import ParentView from "@/components/ParentView";
import InnerLink from "@/layout/components/InnerLink";
import cache from "@/plugins/cache";
import transformMenuToRoutes from "@/utils/transformMenuToRoutes";

// 匹配views里面所有的.vue文件
const modules = import.meta.glob("./../../views/**/*.vue");

const usePermissionStore = defineStore("permission", {
  state: () => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: [],
  }),
  actions: {
    setRoutes(routes) {
      this.addRoutes = routes;
      this.routes = constantRoutes.concat(routes);
    },
    setDefaultRoutes(routes) {
      this.defaultRoutes = constantRoutes.concat(routes);
    },
    setTopbarRoutes(routes) {
      this.topbarRouters = routes;
    },
    setSidebarRouters(routes) {
      this.sidebarRouters = routes;
    },
    generateRoutes(roles) {
      return new Promise((resolve) => {
        // 向后端请求路由数据
        const rawMenuList = cache.session.getJSON("menuList") || [];
        const routerList = transformMenuToRoutes(rawMenuList);
        // console.log(routerList);
        const sdata = JSON.parse(JSON.stringify(routerList));
        const rdata = JSON.parse(JSON.stringify(routerList));
        const defaultData = JSON.parse(JSON.stringify(routerList));
        const sidebarRoutes = filterAsyncRouter(sdata);
        const rewriteRoutes = filterAsyncRouter(rdata, false, true);
        const defaultRoutes = filterAsyncRouter(defaultData);
        const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
        // console.log(asyncRoutes);
        asyncRoutes.forEach((route) => {
          router.addRoute(route);
        });
        this.setRoutes(rewriteRoutes);
        this.setSidebarRouters(constantRoutes.concat(sidebarRoutes));
        this.setDefaultRoutes(sidebarRoutes);
        this.setTopbarRoutes(defaultRoutes);
        resolve(rewriteRoutes);
      });
    },
  },
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children);
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === "Layout") {
        route.component = Layout;
      } else if (route.component === "ParentView") {
        route.component = ParentView;
      } else if (route.component === "InnerLink") {
        route.component = InnerLink;
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type);
    } else {
      delete route["children"];
      delete route["redirect"];
    }
    return true;
  });
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = [];
  childrenMap.forEach((el) => {
    el.path = lastRouter ? lastRouter.path + "/" + el.path : el.path;
    if (el.children && el.children.length && el.component === "ParentView") {
      children = children.concat(filterChildren(el.children, el));
    } else {
      children.push(el);
    }
  });
  return children;
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = [];
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
}

/**
 * 根据 view 路径名动态加载组件
 * @param {string} view - 如 'user/info'
 * @returns {Function|undefined} 异步组件加载函数
 */
export const loadView = (view) => {
  let res;

  for (const path in modules) {
    // 获取相对路径，例如：'user/info' 或 'user/info/index'
    const dir = path.split("views/")[1].replace(".vue", "");

    // 精确匹配传入路径 或 匹配其 index.vue 形式
    if (dir === view || dir === `${view}/index`) {
      res = () => modules[path]();
      break;
    }
  }
  // 没找到就返回 404 页面
  if (!res) {
    const notFoundPath = Object.keys(modules).find((key) =>
      key.endsWith("error/404.vue")
    );
    if (notFoundPath) {
      res = () => modules[notFoundPath]();
    }
  }
  return res;
};

export default usePermissionStore;
