/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-05-09 14:55:19
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-05-09 17:24:54
 * @FilePath: /RuoYi-Vue3/src/components/DynamicForm/queryOperatorUtils.js
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
export const ADV_OPERATOR_SETS = {
  string: [
    { text: "等于", value: "1" }, { text: "包含", value: "6" }, { text: "不包含", value: "7" },
    { text: "全模糊", value: "8" }, { text: "左模糊", value: "9" }, { text: "右模糊", value: "10" },
    { text: "为空", value: "12" }, { text: "不为空", value: "13" },
  ],
  time: [ // 也可用于日期
    { text: "等于", value: "1" }, { text: "小于", value: "2" }, { text: "小于等于", value: "3" },
    { text: "大于", value: "4" }, { text: "大于等于", value: "5" },
    { text: "为空", value: "12" }, { text: "不为空", value: "13" },
    { text: "范围", value: "11" }, // 时间范围通常由 DynamicForm 层面用两个组件实现
  ],
  number: [ // 也可用于 el-switch, el-select (如果value是数字)
    { text: "等于", value: "1" }, { text: "小于", value: "2" }, { text: "小于等于", value: "3" },
    { text: "大于", value: "4" }, { text: "大于等于", value: "5" },
    { text: "范围", value: "11" }, // 数字范围在此处是一个操作符，DynamicForm层面可能用一个输入框或两个
    { text: "为空", value: "12" }, { text: "不为空", value: "13" },
  ],
  // 如果有其他特定类型的操作符，可以在这里添加，例如 'enum' 类型
  // enum: [
  //   { text: "等于", value: "1" }, { text: "不等于", value: "14" },
  //   { text: "为空", value: "12" }, { text: "不为空", value: "13" },
  // ]
  // ... 其他类型
};

export function getAdvOperatorTypeKey(itemType) {
  // ... (你的类型到操作符集键的映射逻辑) ...
  // 例如:
  switch (itemType) {
    case 0: case 1: case 12: case 30: case 40: return 'string';
    case 4: case 14: case 16: case 17: case 18: case 19: case 26: return 'time';
    case 13: return 'number';
    case 2: case 3: case 5: case 6: case 7: case 8: case 50: return 'string'; // Or 'enum'
    default: return 'string';
  }
}

export function getAdvOperatorOptions(itemType) {
  if (itemType === null || itemType === undefined) return [];
  const key = getAdvOperatorTypeKey(itemType);
  return ADV_OPERATOR_SETS[key] || ADV_OPERATOR_SETS.string;
}

export function getAdvOperatorText(itemType, operatorValue) {
  const options = getAdvOperatorOptions(itemType);
  const operator = options.find(op => op.value === operatorValue);
  return operator ? operator.text : '';
}