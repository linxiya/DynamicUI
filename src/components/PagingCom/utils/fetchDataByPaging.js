/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-21 15:57:33
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-21 15:57:55
 * @FilePath: /frontUI_vue3/src/components/PagingCom/utils/fetchDataByPaging.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
// 前端分页（直接赋值，非深拷贝）
export default function fetchDataByPaging(list, pageSize, startPage, searchStr = '') {
  // console.log('list:', list)
  if (!list.length) {
      return {
          arr: [],
          total: 0
      }
  }

  // 带查询条件
  if (searchStr) {
      searchStr = searchStr.toUpperCase()
      list = list.filter(item => {
          if (item && Object.prototype.toString.call(item).toUpperCase() === '[OBJECT OBJECT]') {
              let keys = Object.keys(item)
              for (let i = 0; i < keys.length; i++) {
                  if (item[keys[i]] && item[keys[i]].toString().toUpperCase().indexOf(searchStr) !== -1) {
                      return item
                  }
              }
          } else if (item && item.toString().toUpperCase().indexOf(searchStr) !== -1) {
              return item
          }
      })
  }
  // 查询后的数组长度
  const total = list.length
  const arr = list.slice(pageSize * (startPage - 1), pageSize * startPage)

  return {
      arr,
      total
  }
}