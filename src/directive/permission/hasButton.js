/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-27 15:58:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-06-07 10:23:04
 * @FilePath: /frontUI_vue3/src/directive/permission/hasButton.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { checkButtonPermission } from '@/utils/permissionUtils'; // 从公共工具导入

export default {
  mounted(el, binding) {
    // console.log(el, binding);
    if (!checkButtonPermission(binding.value)) { // 调用导入的函数
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
  // updated(el, binding) {
  //   console.log(el, binding);
  //   if (!checkButtonPermission(binding.value)) { // 调用导入的函数
  //     el.parentNode && el.parentNode.removeChild(el);
  //   }
  // },
};