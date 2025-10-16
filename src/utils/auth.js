/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-20 11:38:46
 * @FilePath: /frontUI_vue3/src/utils/auth.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import Cookies from 'js-cookie'

// const TokenKey = 'token'

const projectPrefix = import.meta.env.VITE_APP_TOKEN_KEY_PREFIX || 'defaultProject_'; // 提供一个默认值
const TokenKey = `${projectPrefix}token`;

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
