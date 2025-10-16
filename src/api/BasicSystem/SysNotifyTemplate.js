/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-14 14:07:19
 * @FilePath: /web3.1/src/api/BasicSystem/SysNotifyTemplate.js
 * @Description:站内信模板
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "sysNotifyTemplate/findList",
    data,
    module:"ocean-base",
  });
}

// 查询详情
export function getDetail(data,id) {
 return moduleRequest({
    method: "post",
    url: `sysNotifyTemplate/detail?id=${id}`,
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysNotifyTemplate/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `sysNotifyTemplate/${url}`,
    data,
    module:"ocean-base",
  });
}

// 测试发送
export function sendNotify(data) {
  return moduleRequest({
    method: "post",
    url: `sysNotifyTemplate/sendNotify`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `sysNotifyTemplate/delete?ids=${ids}`,
    module:"ocean-base",
  });
}



//导入
export function importData() {
  return `ocean-base/sysNotifyTemplate/import`
}
//导出
export function exportData() {
  return `ocean-base/sysNotifyTemplate/export`
}