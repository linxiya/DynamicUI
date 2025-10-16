// 计算表格列宽度
import flexColumnWidth from '@/utils/flexColumnWidth'

/**
 * 根据后端返回的原始表格字段配置，将其转换为 DynamicTable 组件期望的 `columns` 配置数组。
 * 此函数负责筛选、排序原始数据，并为每列生成 `el-table-column` 和 `DynamicInputControl` 所需的配置。
 * 
 * @param {Array<Object>} rawConfigArray - 后端返回的原始字段配置数组。每个对象应包含字段的元数据，如 itemKey, itemName, itemListType, isHide 等。
 * @param {object} [options] - 转换选项对象。
 * @param {Function} [options.itemAttrsHandler] - 可选的自定义函数。
 *   - 作用：用于为 `DynamicInputControl` 内部渲染的具体 Element Plus 控件（如 `el-input`, `el-select`）生成额外的属性（attrs）。
 *   - 接收参数：`rawItem` (当前的原始列配置对象)。
 *   - 返回值：
 *     - 一个对象：其属性将静态绑定到 `DynamicInputControl` 内部的控件上。
 *     - 或一个函数：`function(scope) { return { ...attrs }; }`，该函数会在 `DynamicInputControl` 内部执行，并接收 `el-table-column` 的作用域插槽 `scope` 参数，允许你根据行数据动态生成属性。
 * @returns {Array<Object>} - `DynamicTable` 组件期望的 `columns` 配置数组，每个对象包含渲染 `el-table-column` 和 `DynamicInputControl` 所需的所有信息。
 */
export function transformRawConfigToTableColumns(rawConfigArray, options = {}) {
  // 参数校验：确保输入是一个数组
  if (!Array.isArray(rawConfigArray)) {
    console.error("transformRawConfigToTableColumns: 输入参数 rawConfigArray 必须是一个数组。");
    return []; // 如果不是数组，返回空数组
  }

  const { itemAttrsHandler } = options; // 解构出转换选项中的 itemAttrsHandler

  return rawConfigArray
    .filter(item => {
      // 过滤条件：只保留那些有效且未被隐藏的字段配置
      // 1. item 必须存在 (非 null/undefined)
      // 2. item 必须包含 itemKey (字段标识)
      // 3. item 必须包含 itemName (字段名称)
      // 4. itemListType 不等于仅详情显示类型 (3)，因为这种类型不在表格中显示
      return item && item.itemKey && item.itemName && item.showType !== 3;
    })
    .sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0)) // 根据 `orderNum` (排序号) 升序排序，决定列在表格中的显示顺序
    .map((rawItem, index) => {
      // 为每个通过筛选和排序的 `rawItem` (后端原始列配置) 创建一个 `column` 配置对象，
      // 这个 `column` 对象将作为 `DynamicTable` 的 `columns` prop 的一个元素。
      const column = {
        key: rawItem.itemKey,      // `key` 用于 RightToolbar 列表的唯一标识
        label: rawItem.itemName,   // `label` 用于在 RightToolbar 的下拉列表中显示列名
        visible: true,           // `visible` 标志，RightToolbar 将通过它控制列的显隐，默认为 true
        
        itemKey: rawItem.itemKey,     // 列的唯一标识符，也用作 `el-table-column` 的 `prop` (数据绑定键)
        itemName: rawItem.itemName,   // 列的表头显示名称，也用作 `el-table-column` 的 `label`
        width: rawItem.itemWidth,     // 列的固定宽度 (`el-table-column` 的 `width`)
        minWidth:(list) => flexColumnWidth(rawItem.itemKey, list, rawItem.minWidth, rawItem.maxWidth), // 列的最小宽度 (`el-table-column` 的 `min-width`)，用于响应式布局
        align: index === 0 ? 'left' : (rawItem.align || 'center'),
        // 是否显示溢出提示 tooltip：如果 `rawItem.showOverflowTooltip` 明确设置，则使用其值；
        // 否则根据 `itemListType` 判断是否需要 tooltip 提示 (如 10: tips 显示, 0: 默认显示文字)
        showOverflowTooltip: rawItem.showOverflowTooltip !== undefined ? rawItem.showOverflowTooltip : (rawItem.itemListType === 10 || rawItem.itemListType === 0), 

        colAttrs: { /* `colAttrs` 是一个对象，其中的属性将直接透传给 `el-table-column` 组件 */ 
          // 示例：可以根据 rawItem 的其他属性设置 `sortable` (是否可排序), `resizable` (是否可调整大小), `className` (CSS 类名) 等
          // ...(rawItem.sortable ? { sortable: true } : {}), 
          // ...(rawItem.fixed ? { fixed: rawItem.fixed } : {}),
        },

        // 保留一些原始属性在列配置顶层，这些属性可能在只读状态下 `formatter` 函数中使用，
        // 或 `DynamicTable` 内部的其他逻辑中使用。
        isEnum: rawItem.isEnum,              // 是否是枚举类型
        isEditDisplay: rawItem.isEditDisplay,    // 是否在编辑模式下显示
        isHide: rawItem.isHide,              // 是否隐藏 (0: 显示, 1: 隐藏)
        enumData: rawItem.enumData,          // 枚举数据 (通常是 JSON 字符串)
        format: rawItem.format,              // 日期/时间格式化字符串 (如 'YYYY-MM-DD')
        valueFormat: rawItem.valueFormat,    // 日期/时间绑定值格式
        itemListType: rawItem.itemListType,  // 原始的控件类型标识，用于判断渲染方式 (只读/编辑/链接等)
        rangeSeparator: rawItem.rangeSeparator, // 范围选择器的分隔符 (如 '至', '-')
      };

      // 根据 `rawItem.itemListType` 判断这一列是否需要渲染为可编辑的 `DynamicInputControl`。
      // 定义纯只读的 `itemListType` 类型，这些类型不会渲染 `DynamicInputControl`。
      // 0: 默认显示文字 (纯只读文本)
      // 10: tips 显示 (鼠标悬停显示详细内容的只读文本)
      const pureReadOnlyTypes = [0, 10]; 
      const needsInputControl = !pureReadOnlyTypes.includes(rawItem.itemListType); // 如果类型不在纯只读列表里，则认为需要渲染输入控件

      if (needsInputControl) {
        // 如果需要渲染输入控件，则构建 `itemConfig` 对象。
        // `itemConfig` 将作为 `DynamicInputControl` 组件的 `item` prop 传递，用于指导控件的渲染。
        const baseItemConfig = { 
          itemKey: rawItem.itemKey,          // 控件的字段标识
          type: rawItem.itemListType,        // 关键：决定 `DynamicInputControl` 渲染哪个具体的 Element Plus 组件 (如 el-input, el-select 等)
          itemName: rawItem.itemName,        // 控件名称，用于内部显示或占位符
          placeholder: rawItem.placeholder || `请输入${rawItem.itemName || rawItem.itemKey}`, // 控件的占位符文本
          isEnum: rawItem.isEnum,            // 枚举相关属性，`DynamicInputControl` 内部会使用
          enumData: rawItem.enumData,        // 枚举数据
          format: rawItem.format,            // 日期/时间显示格式
          valueFormat: rawItem.valueFormat,  // 日期/时间绑定值格式
          
          // 文件上传 (el-upload) 相关属性，直接从 `rawItem` 映射
          listType: rawItem.listType,        // 文件列表类型 (text/picture/picture-card)
          limit: rawItem.limit,              // 最大允许上传文件个数
          accept: rawItem.accept,            // 接受的文件类型
          autoUpload: rawItem.autoUpload,    // 是否自动上传
          drag: rawItem.drag,                // 是否启用拖拽上传
          multiple: rawItem.multiple,        // 是否支持多选文件
          uploadData: rawItem.uploadData,    // 上传时附带的额外参数
          customHttpRequest: rawItem.customHttpRequest, // 自定义上传方法

          // 文本域 (el-input type="textarea") 相关属性
          rows: rawItem.rows,                // 文本域的行数
          resize: rawItem.resize,            // 文本域是否可调整大小

          // 开关 (el-switch) 相关属性
          activeColor: rawItem.activeColor,
          inactiveColor: rawItem.inactiveColor,
          activeValue: rawItem.activeValue,
          inactiveValue: rawItem.inactiveValue,

          // 级联选择器 (el-cascader) 相关属性
          options: rawItem.options,          // 级联数据源
          cascaderProps: rawItem.cascaderProps, // 级联组件的内部配置属性

          // 数字输入框 (el-input-number) 相关属性
          controlsPosition: rawItem.controlsPosition, // 控制按钮位置
          min: rawItem.minValue,             // 最小值 (注意：原始属性是 `minValue`)
          max: rawItem.maxValue,             // 最大值 (注意：原始属性是 `maxValue`)
          step: rawItem.step,                // 步长
          precision: rawItem.precision,      // 数值精度
          stepStrictly: rawItem.stepStrictly, // 是否只能输入 step 的倍数

          // 日期/时间范围选择器相关属性
          rangeSeparator: rawItem.rangeSeparator, // 范围分隔符
          startPlaceholder: rawItem.startPlaceholder, // 开始占位符
          endPlaceholder: rawItem.endPlaceholder,   // 结束占位符
          arrowControl: rawItem.arrowControl,       // 时间选择器是否使用箭头控制

          // 单个复选框 (el-checkbox) 相关属性
          checkboxLabel: rawItem.checkboxLabel, // 复选框的标签文本
          border: rawItem.border, // 复选框是否带边框
          
          // ... 其他 DynamicInputControl 的 item prop 可能需要的特定配置，从 rawItem 映射
        };

        // 构建 `itemAttrs` 对象：这些属性将直接 `v-bind` 到 `DynamicInputControl` 内部渲染的 Element Plus 控件上。
        // 优先级：`options.itemAttrsHandler` 返回的结果 > `defaultStaticAttrs`。
        const defaultStaticAttrs = { // 一些通用的、可以从 `rawItem` 推断的 Element Plus 控件属性
          disabled: rawItem.disabled === 3 || rawItem.disabled === true, // 假设 `disabled: 3` 或 `true` 表示禁用
          // size: rawItem.size || 'small', // 示例：可以统一设置控件大小
          clearable: rawItem.clearable !== false, // 默认控件可清除内容
          // 额外的透传属性，如 `type="password"` 或 `type="textarea"`，如果 `itemListType` 仅是通用类型，
          // 而具体的 `type` 属性需要传递给 `el-input`，可以在这里补充。
          // type: (rawItem.itemListType === 40 ? 'password' : (rawItem.itemListType === 12 ? 'textarea' : undefined)),
          // showPassword: rawItem.itemListType === 40,
        };

        let finalItemAttrs = defaultStaticAttrs;

        // 如果提供了 `itemAttrsHandler` 函数，则调用它来生成或覆盖 `itemAttrs`。
        if (typeof itemAttrsHandler === 'function') {
          const customAttrs = itemAttrsHandler(rawItem); // 调用处理函数，传入原始列配置
          // 处理器可以返回一个对象 (静态 attrs) 或一个函数 (动态 attrs, `function(scope) { ... }`)
          if (typeof customAttrs === 'function' || (typeof customAttrs === 'object' && customAttrs !== null)) {
            finalItemAttrs = customAttrs; // 使用处理器返回的结果作为最终的 `itemAttrs`
          } else if (customAttrs !== undefined) { 
            // 如果返回了非对象/函数但不是 undefined 的值，发出警告
            console.warn(`transformRawConfigToTableColumns: itemAttrsHandler for ${rawItem.itemKey} 返回了非预期的类型 (${typeof customAttrs})，期望是对象或函数。`);
          }
        }
        
        // 将构建好的控件配置和其内部属性赋给 `column.itemConfig`。
        // `DynamicTable` 会将 `column.itemConfig` 传递给 `DynamicInputControl`，
        // 而 `DynamicInputControl` 再将其中的 `itemAttrs` `v-bind` 给内部的具体 Element Plus 控件。
        column.itemConfig = { 
          ...baseItemConfig,
          itemAttrs: finalItemAttrs 
        };

      } else {
        // 如果不需要 DynamicInputControl (即为纯只读列，或有特殊模板渲染如链接)，则不设置 `itemConfig`。
        delete column.itemConfig; 

        // 为只读列配置 `formatter` 函数，用于自定义内容的显示格式。
        // 注意：`DynamicTable` 模板中对 `itemListType === 11` (链接) 有特殊处理，会优先于此 `formatter`。
        // 此 `formatter` 主要用于 `itemListType === 10` (tips) 或其他没有 `itemConfig` 的只读情况下的数据显示。
        // 也可以用于格式化枚举值、日期、时间等。
        
        // 此处 `formatter` 的定义在 `column` 对象内部，可以访问到 `col` (即当前的 `column` 对象)。
        column.formatter = (row, col, cellValue, rowIndex) => {
          // `col` 参数即为当前的 `column` 配置对象，包含 `isEnum`, `enumData`, `format` 等。
          // 1. 枚举值转换：如果列是枚举类型且有枚举数据，则将单元格值转换为对应的文本。
          if (col.isEnum == 1 && col.enumData) {
            try {
              const enumArray = JSON.parse(col.enumData); // 解析枚举数据字符串为数组
              const matchedOption = enumArray.find(opt => String(opt.value) === String(cellValue)); // 统一转字符串比较，避免数字和字符串不匹配的问题
              return matchedOption ? matchedOption.text : cellValue; // 返回匹配的文本，否则返回原始值
            } catch (e) {
              console.error("Formatter: 解析枚举数据失败:", e, "原始数据:", col.enumData, "单元格值:", cellValue);
              return cellValue; // 解析失败时返回原始值
            }
          }

          // 2. 日期/时间格式化 (需要引入日期处理库，例如 `dayjs` 或 `moment.js`)
          // 示例：在文件顶部或单独引入 `import dayjs from 'dayjs';`
          const dateTypes = [4, 17, 18];        // 单个日期或日期时间类型
          const dateRangeTypes = [16, 19];      // 日期范围或日期时间范围类型
          const timeTypes = [26];               // 单个时间类型
          const timeRangeTypes = [14];          // 时间范围类型

          if (col.format && cellValue) { // 必须有格式化字符串 (col.format) 并且单元格值不为空
            if (dateTypes.includes(col.itemListType)) {
              // return dayjs(cellValue).isValid() ? dayjs(cellValue).format(col.format) : cellValue; // 实际使用时替换为 dayjs 逻辑
              return `日期: ${cellValue}`; // 占位符，替换为实际日期格式化逻辑
            }
            if (dateRangeTypes.includes(col.itemListType) && Array.isArray(cellValue) && cellValue.length === 2) {
              // const start = cellValue[0] && dayjs(cellValue[0]).isValid() ? dayjs(cellValue[0]).format(col.format) : '';
              // const end = cellValue[1] && dayjs(cellValue[1]).isValid() ? dayjs(cellValue[1]).format(col.format) : '';
              // return `${start} ${col.rangeSeparator || '至'} ${end}`; // 实际使用时替换为 dayjs 逻辑
              return `日期范围: ${cellValue.join(` ${col.rangeSeparator || '至'} `)}`; // 占位符
            }
            if (timeTypes.includes(col.itemListType)) {
                // 假设时间值是 "HH:mm:ss" 字符串或可被 dayjs 解析
                // return dayjs(cellValue, guessFormat(cellValue)).isValid() ? dayjs(cellValue, guessFormat(cellValue)).format(col.format) : cellValue; // 实际使用时替换为 dayjs 逻辑
                return `时间: ${cellValue}`; // 占位符
            }
            if (timeRangeTypes.includes(col.itemListType) && Array.isArray(cellValue) && cellValue.length === 2) {
                // const start = cellValue[0] && dayjs(cellValue[0], guessFormat(cellValue[0])).isValid() ? dayjs(cellValue[0], guessFormat(cellValue[0])).format(col.format) : '';
                // const end = cellValue[1] && dayjs(cellValue[1], guessFormat(cellValue[1])).isValid() ? dayjs(cellValue[1], guessFormat(cellValue[1])).format(col.format) : '';
                // return `${start} ${col.rangeSeparator || '-'} ${end}`; // 实际使用时替换为 dayjs 逻辑
                return `时间范围: ${cellValue.join(` ${col.rangeSeparator || '-'} `)}`; // 占位符
            }
          }

          // 默认返回原始值 (如果以上条件都不满足)
          return cellValue;
        };
      }
      return column; // 返回处理好的列配置对象
    });
}
