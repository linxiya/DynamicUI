/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-09-30 09:52:38
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-30 09:54:13
 * @FilePath: /web3.1/src/api/BasicSystem/FileUploading.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { moduleRequest } from '@/utils/request'

/**
 * @description 上传文件到自定义路径
 * @param {FormData} data - 包含文件和路径信息的 FormData 对象
 * @returns {Promise}
 */
export const uploadCustomPath = (data) => {
  return moduleRequest({
    url: '/file/uploadCustomPath',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * @description 上传文件到默认路径
 * @param {FormData} data - 包含文件的 FormData 对象
 * @returns {Promise}
 */
export const upload = (data) => {
  return moduleRequest({
    url: '/file/upload',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


export const listOss = (params) => {
    return moduleRequest({
        url: '/system/oss/list', // 请替换为实际的列表 API 地址
        method: 'get',
        params,
    })
}

export const delOss = (ids) => {
    return moduleRequest({
        url: `/system/oss/${ids}`, // 请替换为实际的删除 API 地址
        method: 'delete',
    })
}