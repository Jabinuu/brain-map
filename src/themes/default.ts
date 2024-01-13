//  默认主题
// 定义节点样式类型
export interface NodeStyle {
  [prop: string]: any
  shape: 'line' | 'rectangle' | 'capsule'
  fillColor: string
  fontFamily: string
  color: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  lineHeight: number
  borderColor: string
  borderWidth: number
  borderDasharray: string
  borderRadius: number
  textDecoration: string
  gradientStyle: boolean
  startColor: string
  endColor: string
}

// 定义概要节点样式类型
type GeneralizationStyle = NodeStyle

// 定义根节点样式类型
export type RootStyle = NodeStyle & {
  [prop: string]: any
  shape: string
  fillColor: string
  color: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  lineHeight: number
  borderColor: string
  borderWidth: number
  borderDasharray: string
  borderRadius: number
  textDecoration: string
  gradientStyle: boolean
  startColor: string
  endColor: string
}

// 定义图表样式类型
export interface ThemeConfig {
  [prop: string]: any
  paddingX: number
  paddingY: number
  imgMaxWidth: number
  imgMaxHeight: number
  iconSize: number
  lineWidth: number
  lineColor: string
  lineDasharray: string
  lineStyle: string
  rootLineKeepSameInCurve: boolean
  showLineMarker: boolean
  generalizationLineWidth: number
  generalizationLineColor: string
  generalizationLineMargin: number
  generalizationNodeMargin: number
  associativeLineWidth: number
  associativeLineColor: string
  associativeLineActiveWidth: number
  associativeLineActiveColor: string
  associativeLineTextColor: string
  associativeLineTextFontSize: number
  associativeLineTextLineHeight: number
  associativeLineTextFontFamily: string
  backgroundColor: string
  backgroundImage: string
  backgroundRepeat: string
  backgroundPosition: string
  backgroundSize: string
  nodeUseLineStyle: boolean
  root: RootStyle
  second: NodeStyle
  node: NodeStyle
  generalization: GeneralizationStyle
}

export default {
  // 节点内边距
  paddingX: 10,
  paddingY: 5,
  // 图片显示的最大宽度
  imgMaxWidth: 100,
  // 图片显示的最大高度
  imgMaxHeight: 100,
  // icon的大小
  iconSize: 20,
  // 连线的粗细
  lineWidth: 1,
  // 连线的颜色
  lineColor: '#549688',
  // 连线样式
  lineDasharray: 'none',
  // 连线风格
  lineStyle: 'straight', // 针对logicalStructure、mindMap两种结构。曲线（curve）、直线（straight）、直连（direct）
  // 曲线连接时，根节点和其他节点的连接线样式保持统一，默认根节点为 ( 型，其他节点为 { 型，设为true后，都为 { 型
  rootLineKeepSameInCurve: true,
  // 连线尾部是否显示标记，目前只支持箭头
  showLineMarker: false,
  // 概要连线的粗细
  generalizationLineWidth: 1,
  // 概要连线的颜色
  generalizationLineColor: '#549688',
  // 概要曲线距节点的距离
  generalizationLineMargin: 0,
  // 概要节点距节点的距离
  generalizationNodeMargin: 20,
  // 关联线默认状态的粗细
  associativeLineWidth: 2,
  // 关联线默认状态的颜色
  associativeLineColor: 'rgb(51, 51, 51)',
  // 关联线激活状态的粗细
  associativeLineActiveWidth: 8,
  // 关联线激活状态的颜色
  associativeLineActiveColor: 'rgba(2, 167, 240, 1)',
  // 关联线文字颜色
  associativeLineTextColor: 'rgb(51, 51, 51)',
  // 关联线文字大小
  associativeLineTextFontSize: 14,
  // 关联线文字行高
  associativeLineTextLineHeight: 1.2,
  // 关联线文字字体
  associativeLineTextFontFamily: '微软雅黑, Microsoft YaHei',
  // 背景颜色
  backgroundColor: '#fafafa',
  // 背景图片
  backgroundImage: 'none',
  // 背景重复
  backgroundRepeat: 'no-repeat',
  // 设置背景图像的起始位置
  backgroundPosition: 'center center',
  // 设置背景图片大小
  backgroundSize: 'cover',
  // 节点使用横线样式
  nodeUseLineStyle: false,
  // 根节点样式
  root: {
    shape: 'rectangle',
    fillColor: '#549688',
    fontFamily: '微软雅黑, Microsoft YaHei',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: 'transparent',
    borderWidth: 0,
    borderDasharray: 'none',
    borderRadius: 5,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '#549688',
    endColor: '#fff'
  },
  // 二级节点样式
  second: {
    shape: 'rectangle',
    fillColor: '#fff',
    fontFamily: '微软雅黑, Microsoft YaHei',
    color: '#565656',
    fontSize: 16,
    fontWeight: 'noraml',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: '#549688',
    borderWidth: 1,
    borderDasharray: 'none',
    borderRadius: 5,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '#549688',
    endColor: '#fff'
  },
  // 三级及以下节点样式
  node: {
    shape: 'rectangle',
    fillColor: 'transparent',
    fontFamily: '微软雅黑, Microsoft YaHei',
    color: '#6a6d6c',
    fontSize: 14,
    fontWeight: 'noraml',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 5,
    borderDasharray: 'none',
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '#549688',
    endColor: '#fff'
  },
  // 概要节点样式
  generalization: {
    shape: 'rectangle',
    marginX: 100,
    marginY: 40,
    fillColor: '#fff',
    fontFamily: '微软雅黑, Microsoft YaHei',
    color: '#565656',
    fontSize: 16,
    fontWeight: 'noraml',
    fontStyle: 'normal',
    lineHeight: 1.5,
    borderColor: '#549688',
    borderWidth: 1,
    borderDasharray: 'none',
    borderRadius: 5,
    textDecoration: 'none',
    gradientStyle: false,
    startColor: '#549688',
    endColor: '#fff'
  }
}

// 支持激活样式的属性
// 简单来说，会改变节点大小的都不支持在激活时设置，为了性能考虑，节点切换激活态时不会重新计算节点大小
export const supportActiveStyle = [
  'fillColor',
  'borderColor',
  'borderWidth',
  'borderDasharray',
  'borderRadius'
]

// 检测主题配置是否是节点大小无关的
const nodeSizeIndependenceList = [
  'lineWidth',
  'lineColor',
  'lineDasharray',
  'lineStyle',
  'generalizationLineWidth',
  'generalizationLineColor',
  'associativeLineWidth',
  'associativeLineColor',
  'associativeLineActiveWidth',
  'associativeLineActiveColor',
  'associativeLineTextColor',
  'associativeLineTextFontSize',
  'associativeLineTextLineHeight',
  'associativeLineTextFontFamily',
  'backgroundColor',
  'backgroundImage',
  'backgroundRepeat',
  'backgroundPosition',
  'backgroundSize',
  'rootLineKeepSameInCurve',
  'showLineMarker',
  'gradientStyle',
  'startColor',
  'endColor'
]

export const checkIsNodeSizeIndependenceConfig = (config: any): boolean => {
  const keys = Object.keys(config)
  for (let i = 0; i < keys.length; i++) {
    if (
      !nodeSizeIndependenceList.find(item => {
        return item === keys[i]
      })
    ) {
      return false
    }
  }
  return true
}

export const lineStyleProps = ['lineColor', 'lineDasharray', 'lineWidth']
