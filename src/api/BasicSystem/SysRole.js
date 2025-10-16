/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-21 14:37:35
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-28 17:08:53
 * @FilePath: /web3.1/src/api/BasicSystem/RoleManagement.js
 * @Description: 角色管理
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "sysRole/findList",
    data,
    module:"ocean-base",
  });
}
// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysRole/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `sysRole/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `sysRole/delete?ids=${ids}`,
    module:"ocean-base",
  });
}

//保存角色绑定用户信息
export function bindRoleUser(id, data) {
  return moduleRequest({
    method: "post",
    url: `sysRole/addUser?roleId=${id}`,
    data,
    module:"ocean-base",
  });
}

//保存用户绑定角色信息
export function bindUserRole(id, data) {
  return moduleRequest({
    method: "post",
    url: `sysRole/addUserRole?userId=${id}`,
    data,
    module:"ocean-base",
  });
}

//权限管理控制器
export function updateBatch(id, data) {
  return moduleRequest({
    method: "post",
    url: `authRole/updateBatch?menuType=${id}`,
    data,
    module:"ocean-base",
  });
}

//赋予角色数据权限
export function assignRoleDataPerm(id,dataScope,dataScopeDeptIds) {
  return moduleRequest({
    method: "post",
    url: `sysRole/assignRoleDataPerm?roleId=${id}&dataScope=${dataScope}&dataScopeDeptIds=${dataScopeDeptIds}`,
    module:"ocean-base",
  });
}


//导入
export function importData() {
  return `ocean-base/sysRole/import`
}
//导出
export function exportData() {
  return `ocean-base/sysRole/export`
}
