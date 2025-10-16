import { moduleRequest } from "@/utils/request";

//查询
export function getConfig(type,data) {
  return moduleRequest({
    method: "get",
    url: `sysConfig/getConfig?configType=${type}`,
    data,
    module:"ocean-base",
  });
}

// 查询全部
export function updateConfig(data) {
  return moduleRequest({
    method: "post",
    url: "sysConfig/update",
    data,
    module:"ocean-base",
  });
}