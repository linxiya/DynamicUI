/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-25 14:56:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-10-15 10:47:30
 * @FilePath: /web3.1/src/api/BasicSystem/SysNotifyMessage.js
 * @Description:站内信信息
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from "@/utils/request";

//查询
export function getList(data) {
  return moduleRequest({
    method: "post",
    url: "sysNotifyMessage/findList",
    data,
    module:"ocean-base",
  });
}

// 查询详情
export function getDetail(id) {
 return moduleRequest({
    method: "post",
    url: `sysNotifyMessage/detail?id=${id}`,
    module:"ocean-base",
  });
}

// 查询全部
export function getListAll(data) {
  return moduleRequest({
    method: "post",
    url: "sysNotifyMessage/findAllList",
    data,
    module:"ocean-base",
  });
}

// 新增修改
export function addEdit(url,data) {
  return moduleRequest({
    method: "post",
    url: `sysNotifyMessage/${url}`,
    data,
    module:"ocean-base",
  });
}


// 获取当前登录用户未读的站内信条数
export function getUnReadNotifyMsg(data) {
  return moduleRequest({
    method: "post",
    url: `sysNotifyMessage/getUnReadNotifyMsg`,
    data,
    module:"ocean-base",
  });
}

// 删除
export function deleteData(ids) {
  return moduleRequest({
    method: "post",
    url: `sysNotifyMessage/delete?ids=${ids}`,
    module:"ocean-base",
  });
}



//导入
export function importData() {
  return `ocean-base/sysNotifyMessage/import`
}
//导出
export function exportData() {
  return `ocean-base/sysNotifyMessage/export`
}