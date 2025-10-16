/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-04-27 17:40:28
 * @FilePath: /RuoYi-Vue3/src/api/BasicSystem/CustomForm.js
 * @Description: 自定义表单
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getCustomForm(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomForm/findList",
    data,
    module:"ocean-base",
  });
}

// 初始化
export function initCustomFormAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomForm/init",
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getCustomFormAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomForm/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function upAddCustomForm(url,data) {
  return moduleRequest({
    method: "post",
    url: `sysCustomForm/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function delCustomForm(ids) {
  return moduleRequest({
    method: "post",
    url: `sysCustomForm/delete?ids=${ids}`,
    module:"ocean-base",
  });
}

// 自定义表单导出
export function findJsonData(code) {
  return moduleRequest({
    method: "post",
    url: `sysCustomForm/findJsonData?customFormCode=${code}`,
    module:"ocean-base",
  });
}

// 自定义表单导入
export function enterCustomForm(data) {
  return moduleRequest({
    method: "post",
    url: `sysCustomForm/enterCustomForm?customFormJsonData=${data}`,
    module:"ocean-base",
  });
}

// 导入
export function importData(fromRout,data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomForm/import",
    data,
    headers: { "fromRout": fromRout },
    module:"ocean-base",
  });
}

//导出
export function exportData() {
  return `ocean-base/sysCustomForm/export`
}