import { moduleRequest } from "@/utils/request";

/**
 * @description 查询许可证书的到期时间
 * @param {object} [params] - 可选的查询参数，如果API需要的话。
 * @returns {Promise} Axios Promise 对象
 */
export const getExpiration = (params) => {
  return moduleRequest({
    url: '/license/expiration',
    method: 'get',
    params: params // 使用 params 选项来传递查询字符串参数
  })
}

/**
 * @description 获取当前设备的硬件信息JSON字符串
 * @param {object} [params] - 可选的查询参数。
 * @returns {Promise} Axios Promise 对象
 */
export const getDeviceJson = (params) => {
  return moduleRequest({
    url: '/license/getDeviceJson',
    method: 'get',
    params: params
  })
}

/**
 * @description 上传并注册新的许可证书文件
 * @param {FormData} data - 包含证书文件的 FormData 对象。
 *   - 例如: formData.append('license', file);
 * @returns {Promise} Axios Promise 对象
 */
export const register = (data) => {
  return moduleRequest({
    url: '/license/register',
    method: 'post',
    data: data,
    // 通常上传文件时，需要让浏览器自动设置 Content-Type 为 multipart/form-data
    // 你的 request.js 拦截器可能已经处理了这一点，但如果没有，可以显式设置 headers
    // headers: {
    //   'Content-Type': 'multipart/form-data'
    // }
  })
}