/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-11 17:04:49
 * @FilePath: /web3.1/src/api/BasicSystem/SysPdaAutoUpdate.js
 * @Description: pda 更新
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "sysPdaAutoUpdate/findList",
    data,
    module:"ocean-base",
  });
}

// 查询详情
export function getDetail(data,id) {
 return moduleRequest({
    method: "post",
    url: `sysPdaAutoUpdate/detail?id=${id}`,
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysPdaAutoUpdate/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `sysPdaAutoUpdate/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `sysPdaAutoUpdate/delete?ids=${ids}`,
    module:"ocean-base",
  });
}



//导入
export function importData() {
  return `ocean-base/sysPdaAutoUpdate/import`
}
//导出
export function exportData() {
  return `ocean-base/sysPdaAutoUpdate/export`
}