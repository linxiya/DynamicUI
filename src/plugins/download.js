/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-19 11:11:06
 * @FilePath: /frontUI_vue3/src/plugins/download.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import axios from 'axios'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { blobValidate } from '@/utils/ruoyi'

const baseURL = import.meta.env.VITE_APP_BASE_API
let downloadLoadingInstance;

function getFileNameFromHeader(contentDisposition) {
  const fileNameMatch = contentDisposition?.match(/filename\*=UTF-8''(.+)|filename="(.+)"|filename=(.+)/);
  return decodeURIComponent(fileNameMatch?.[1] || fileNameMatch?.[2] || fileNameMatch?.[3] || 'unknown');
}

export default {
  exportExcel(url, data, fileName, config = {}) {
    return new Promise(async (resolve, reject) => {
      let ext = '.xlsx'
      try {
        await ElMessageBox.confirm('请确认Excel格式：', '提示', {
          confirmButtonText: ".xlsx",
          cancelButtonText: ".xls",
          distinguishCancelAndClose: true,
          type: "warning",
        })
      } catch (err) {
        // console.log('err:', err)
        if (err === 'close') {
          return false
        }
        ext = '.xls'
      }
      downloadLoadingInstance = ElLoading.service({ text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)", })
      axios.post(
        baseURL + url,
        // 'http://192.168.200.81:8101/' + url,
        data, 
        {
          headers: { 'Content-Type': 'application/json', 'token': getToken(), 'fromRout': data.fromRout },
          responseType: 'blob', // 表明返回服务器返回的数据类型
          ...config
        }
      )
        .then(res => {
          console.log('res:', res);
          resolve(res);
          const isBlob = blobValidate(res.data);
          downloadLoadingInstance.close();
          if (isBlob) {
            const blob = new Blob([res.data])
            // this.saveAs(blob, decodeURIComponent(res.headers['download-filename']))
             
            this.saveAs(blob, fileName + ext || getFileNameFromHeader(res.headers['content-disposition']));
          } else {
            this.printErrMsg(res.data);
          }

        }).catch((err) => {
          downloadLoadingInstance.close();
          reject(err)
        })

    });
  },
  name(name, isDelete = true) {
    var url = baseURL + "/common/download?fileName=" + encodeURIComponent(name) + "&delete=" + isDelete
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'token': getToken() }
    }).then((res) => {
      const isBlob = blobValidate(res.data);
      if (isBlob) {
        const blob = new Blob([res.data])
        this.saveAs(blob, decodeURIComponent(res.headers['download-filename']))
      } else {
        this.printErrMsg(res.data);
      }
    })
  },
  resource(resource) {
    var url = baseURL + "/common/download/resource?resource=" + encodeURIComponent(resource);
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'token': getToken() }
    }).then((res) => {
      const isBlob = blobValidate(res.data);
      if (isBlob) {
        const blob = new Blob([res.data])
        this.saveAs(blob, decodeURIComponent(res.headers['download-filename']))
      } else {
        this.printErrMsg(res.data);
      }
    })
  },
  zip(url, name) {
    var url = baseURL + url
    downloadLoadingInstance = ElLoading.service({ text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)", })
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'token': getToken() }
    }).then((res) => {
      const isBlob = blobValidate(res.data);
      if (isBlob) {
        const blob = new Blob([res.data], { type: 'application/zip' })
        this.saveAs(blob, name)
      } else {
        this.printErrMsg(res.data);
      }
      downloadLoadingInstance.close();
    }).catch((r) => {
      console.error(r)
      ElMessage.error('下载文件出现错误，请联系管理员！')
      downloadLoadingInstance.close();
    })
  },
  saveAs(text, name, opts) {
    saveAs(text, name, opts);
  },
  async printErrMsg(data) {
    const resText = await data.text();
    const rspObj = JSON.parse(resText);
    const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
    ElMessage.error(errMsg);
  }
}

