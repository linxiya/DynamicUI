/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-18 17:05:06
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-04-29 17:09:43
 * @FilePath: /RuoYi-Vue3/src/directive/index.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import hasButton from './permission/hasButton'
import copyText from './common/copyText'


export default function directive(app){
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('hasButton', hasButton)
  app.directive('copyText', copyText)
}