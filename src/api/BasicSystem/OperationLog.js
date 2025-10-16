/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-30 10:30:26
 * @FilePath: /web3.1/src/api/BasicSystem/OperationLog.js
 * @Description: 系统操作日志
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "OperationLog/findList",
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "OperationLog/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `OperationLog/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `OperationLog/delete?ids=${ids}`,
    module:"ocean-base",
  });
}



//导入
export function importData() {
  return `ocean-base/OperationLog/import`
}
//导出
export function exportData() {
  return `ocean-base/OperationLog/export`
}