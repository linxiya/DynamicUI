/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-20 13:53:34
 * @FilePath: /frontUI_vue3/src/api/BasicSystem/CustomFormDetails.js
 * @Description: 自定义表单
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询高级查询
export function getSearchDetail(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomSearchDetail/findList",
    data,
    module:"ocean-base",
  });
}

// 高级查询保存
export function saveSearchDetail(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomSearchDetail/save",
    data,
    module:"ocean-base",
  });
}

//查询
export function getCustomFormDet(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomFormDet/findList",
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getCustomFormDetAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysCustomFormDet/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function upAddCustomFormDet(url,data) {
  return moduleRequest({
    method: "post",
    url: `sysCustomFormDet/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function delCustomFormDet(ids) {
  return moduleRequest({
    method: "post",
    url: `sysCustomFormDet/delete?ids=${ids}`,
    module:"ocean-base",
  });
}


// 导入
export function importData() {
  eturn `ocean-base/sysCustomFormDet/import`
}

//导出
export function exportData() {
  return `ocean-base/sysCustomFormDet/export`
}