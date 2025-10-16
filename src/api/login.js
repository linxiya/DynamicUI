/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-04-22 18:00:41
 * @FilePath: /RuoYi-Vue3/src/api/login.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import request from "@/utils/request";
import { moduleRequest } from "@/utils/request";

// 登录方法
// export function login(username, password, code, uuid) {
//   const data = {
//     username,
//     password,
//     code,
//     uuid,
//   };
//   return request({
//     url: "/login",
//     headers: {
//       isToken: false,
//       repeatSubmit: false,
//     },
//     method: "post",
//     data: data,
//   });
// }

// 登录接口
export function login(data) {
  let username = encodeURIComponent(data.username);
  let password = encodeURIComponent(data.password);
  if (data.orgCode) {
    return moduleRequest({
      method: "post",
      url: "loginByOrgCode",
      params: { username, password: "123456", orgCode: data.orgCode},
      module:"ocean-base",
    });
  } else {
    return moduleRequest({
      method: "post",
      url: "meslogin",
      params: { username, password, orgId: data.orgId,browserKernel:"2"},
      module:"ocean-base",
    });
  }
}

// 注册方法
export function register(data) {
  return request({
    url: "/register",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: "/getInfo",
    method: "get",
  });
}

// 退出方法
export function logout() {
  return moduleRequest({
    url: "/logout",
    method: "get",
    module:"ocean-base",
  });
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: "/captchaImage",
    headers: {
      isToken: false,
    },
    method: "get",
    timeout: 20000,
  });
}
