/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-27 14:08:54
 * @FilePath: /frontUI_vue3/src/api/BaseData/EnterpriseBase/Organization.js
 * @Description: 组织管理
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "baseOrganization/findList",
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "baseOrganization/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `baseOrganization/${url}`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `baseOrganization/delete?ids=${ids}`,
    module:"ocean-base",
  });
}

//保存绑定用户信息
export function binduserOrgs(id, data) {
  return moduleRequest({
    method: "post",
    url: `baseOrganization/addUser?orgId=${id}`,
    data,
    module:"ocean-base",
  });
}


//导入
export function importData() {
  return `ocean-base/baseOrganization/import`
}
//导出
export function exportData() {
  return `ocean-base/baseOrganization/export`
}