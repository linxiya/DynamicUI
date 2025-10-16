/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-28 17:13:21
 * @FilePath: /web3.1/src/api/BasicSystem/Menuinfo.js
 * @Description: 菜单
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "menuinfo/findList",
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "menuinfo/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `menuinfo/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `sysCustomForm/delete?ids=${ids}`,
    module:"ocean-base",
  });
}

// 导入
export function importData(fromRout,data) {
  return moduleRequest({
    method: "post",
    url: "menuinfo/import",
    data,
    headers: { "fromRout": fromRout },
    module:"ocean-base",
  });
}

//导出
export function exportData() {
  return `ocean-base/menuinfo/export`
}

//导出全部
export function exportAllData() {
    return `ocean-base/menuinfo/exportAll`
}