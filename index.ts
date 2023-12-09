import { type G, SVG, type Svg } from '@svgdotjs/svg.js'
import Render from './src/render/Render'
import type Node from './src/node/Node'
import View from './src/view/View'
import Event from './src/event/Event'
import { cssConstant } from './src/constant/constant'

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
  event: Event
  layout: string
  svg: Svg | null
  drawing: G | null
  lineDrawing: G | null
  nodeDrawing: G | null
  root: Node | null
  width: number
  height: number
  elRect: DOMRect | null
  dataSource: DataSource | null
  cssEl: HTMLStyleElement | null

  constructor (opt: BrainMapOption) {
    // 画布容器
    this.el = null
    // 画布
    this.svg = null
    // 思维导图容器
    this.drawing = null
    // 所有连线的容器
    this.lineDrawing = null
    // 所有节点的容器
    this.nodeDrawing = null
    // 根节点
    this.root = null
    // 画布宽
    this.width = 0
    // 画布高
    this.height = 0
    // 画布的尺寸位置信息
    this.elRect = null
    this.dataSource = null
    // 思维导图布局模式
    this.layout = ''
    // 样式容器
    this.cssEl = null

    // 注入选项数据
    this.handleOpt(opt)
    // 初始化容器DOM尺寸位置信息
    this.initContainerSize()
    // 初始化容器
    this.initContainer()
    // 添加基础常量样式
    this.addCss()

    // 渲染类实例化
    this.renderer = new Render({
      brainMap: this
    })

    // 视图类实例化
    this.view = new View({
      brainMap: this
    })

    // 事件类实例化
    this.event = new Event({
      brainMap: this,
      view: this.view,
      renderer: this.renderer
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
      this.svg.addClass('bm-svg-container')
      this.drawing = this.svg.group()
      this.drawing.addClass('bm-drawing')
      this.lineDrawing = this.drawing.group()
      this.lineDrawing.addClass('bm-line-drawing')
      this.nodeDrawing = this.drawing.group()
      this.nodeDrawing.addClass('bm-node-drawing')
    }
  }

  // 添加基础常量样式
  addCss (): void {
    this.cssEl = document.createElement('style')
    this.cssEl.innerHTML = cssConstant
    document.body.appendChild(this.cssEl)
  }
}

export default BrainMap
