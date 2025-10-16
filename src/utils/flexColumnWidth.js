/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-29 15:33:21
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-04-29 15:42:42
 * @FilePath: /RuoYi-Vue3/src/utils/flexColumnWidth.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
export default function flexColumnWidth(str, tableData, minWidth = 80, flag = "max", ref) {
  // console.log("str", str, "tableData", tableData, "minWidth", minWidth, "flag", flag, "ref", ref);
  // 如果数据无效或列名为空，则返回最小宽度
  if (!tableData || !tableData.length || !str) {
      return minWidth;
  }

  /**
   * 计算字符串的显示宽度
   * - 英文字母（A-Z, a-z）：11 个单位宽度
   * - 中文字符（\u4e00 - \u9fa5）：18 个单位宽度
   * - 其他字符（数字、标点、特殊字符等）：10 个单位宽度
   * @param {string} s - 需要计算的字符串
   * @returns {number} - 计算出的宽度
   */
  const getCharWidth = (s) => [...s].reduce((width, char) => {
      if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")) {
          return width + 11; // 英文字母
      } else if (char >= "\u4e00" && char <= "\u9fa5") {
          return width + 18; // 中文字符
      } else {
          return width + 10; // 其他字符
      }
  }, 0);

  let columnContent = "";

  if (flag === "equal") {
      // 获取该列第一行的非空内容，若为空则默认为 ""
      columnContent = tableData.find(row => row[str])?.[str] || "";
  } else {
      // 在该列数据中找到最长的内容
      columnContent = tableData.reduce((maxContent, row) => {
          const currentContent = row[str] ? String(row[str]) : "";
          return getCharWidth(currentContent) > getCharWidth(maxContent) ? currentContent : maxContent;
      }, "");
  }

  // 若列内容为空，则返回最小宽度
  if (!columnContent) return minWidth;

  // 计算该列的宽度
  let flexWidth = getCharWidth(columnContent);

  // 确保列宽不小于最小宽度
  flexWidth = Math.max(flexWidth, minWidth);

  // 使用 requestAnimationFrame 异步触发表格重新布局
  requestAnimationFrame(() => ref?.doLayout());

  return flexWidth;
}