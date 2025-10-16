/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-20 11:14:54
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-20 11:15:02
 * @FilePath: /frontUI_vue3/src/utils/permissionUtils.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import cache from "@/plugins/cache";

export function checkButtonPermission(permissionCode) {
  const buttonPermissions = cache.session.getJSON("buttonPermission") || [];
  return buttonPermissions.includes(permissionCode);
}
