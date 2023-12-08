import { type G, SVG, type Svg } from '@svgdotjs/svg.js'
import Render from './src/render/Render'
import type Node from './src/node/Node'
import View from './src/view/View'

interface BrainMapOption {
  [prop: string]: any
  el: HTMLElement // 思维导图容器元素
  dataSource: DataSource // 思维导图数据源
  layout?: string // 思维导图布局结构
  fishBoneDeg?: number // 鱼骨图斜线角度
  theme?: string // 样式主题
  scaleDelta?: number // 缩放比例的单位增量，默认0.1
  readOnly?: boolean // 是否是只读模式
  enableDrag?: boolean // 是否允许拖动节点
  textAutoWrapWidth?: number // 文本节点达到该宽度时自动更换行
  exportPadding?: number // 导图图片的内边距

}

export interface DataSourceItem {
  [prop: string]: any
  text?: string // 文本数据
  image?: string // 图片url
  icon?: [] // 图标列表
  tag?: [] // 标签列表
  expand?: boolean // 节点是否展开
  richText?: boolean // 该节点是否是富文本模式
  hyperLink?: string // 超链接url
  paddingX: number // 节点x轴内边距
  paddingY: number // 节点y轴内边距
  // ...其他样式字段,参考主题属性
}

export interface DataSource {
  data: DataSourceItem // 仅该节点的数据
  children: DataSource[] // 该节点的所有子节点
  node?: Node
}

class BrainMap {
  [prop: string]: any
  el: HTMLElement | null
  renderer: Render
  view: View
  layout: string
  svg: Svg | null // 画布
  drawing: G | null // 思维导图容器
  lineDrawing: G | null // 所有连线的容器
  nodeDrawing: G | null // 所有节点的容器
  root: Node | null
  width: number // 画布宽
  height: number // 画布高
  elRect: DOMRect | null // 画布的尺寸位置信息
  dataSource: DataSource | null

  constructor (opt: BrainMapOption) {
    this.el = null
    this.svg = null
    this.drawing = null
    this.lineDrawing = null
    this.nodeDrawing = null
    this.root = null
    this.width = 0
    this.height = 0
    this.elRect = null
    this.dataSource = null
    this.layout = ''

    // 注入选项数据
    this.handleOpt(opt)
    // 初始化容器DOM尺寸位置信息
    this.initContainerSize()
    // 初始化容器
    this.initContainer()
    // 渲染类实例化
    this.renderer = new Render({
      brainMap: this
    })

    // 视图类实例化
    this.view = new View({
      brainMap: this
    })

    // 初次渲染
    this.renderer.render()
  }

  // 将选项属性动态赋值给类属性
  handleOpt (opt: BrainMapOption): void {
    if (opt.el === null) { throw new Error('缺少容器元素el') }
    // 将opt的属性动态添加到类属性
    Object.keys(opt).forEach((item) => {
      this[item] = typeof opt[item] === 'function' ? opt[item].bind(this) : opt[item]
    })
  }

  // 初始化容器DOM尺寸位置信息
  initContainerSize (): void {
    if (this.el !== null) {
      const elRect = this.el.getBoundingClientRect()
      this.width = elRect.width
      this.height = elRect.height
      if (this.width <= 0 || this.height <= 0) { throw new Error('容器DOM宽高不能为0') }
    }
  }

  // 初始化容器
  initContainer (): void {
    if (this.el !== null) {
      this.svg = SVG().addTo(this.el).size(this.width, this.height)
      this.drawing = this.svg.group()
      this.drawing.addClass('bm-drawing')
      this.lineDrawing = this.drawing.group()
      this.lineDrawing.addClass('bm-line-drawing')
      this.nodeDrawing = this.drawing.group()
      this.nodeDrawing.addClass('bm-node-drawing')
    }
  }
}

export default BrainMap
