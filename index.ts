import { type G, SVG, type Svg } from '@svgdotjs/svg.js'
import Render from './src/render/Render'
import type Node from './src/node/Node'
import View from './src/view/View'
import Event from './src/event/Event'
import { type EnumCommandName, cssConstant } from './src/constant/constant'
import Shortcut from './src/shortcut/Shortcut'
import Command from './src/command/Command'

export type Pair<T1, T2> = [T1, T2]

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
  uid?: string
  text: string // 文本数据
  image?: string // 图片url
  icon?: string[] // 图标列表
  tag?: string[] // 标签列表
  isExpand: boolean // 节点是否展开
  isActive: boolean // 节点激活状态
  isEdit: boolean // 该节点是否处于编辑状态
  richText?: boolean // 该节点是否是富文本模式
  hyperLink?: string // 超链接url
  paddingX: number // 节点x轴内边距
  paddingY: number // 节点y轴内边距
  // ...其他样式字段,参考主题属性
}

export interface DataSource {
  [prop: string | symbol]: any
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
  shortcut: Shortcut
  command: Command
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

    // 事件类实例化
    this.event = new Event({
      brainMap: this
    })
    // 快捷键类实例化
    this.shortcut = new Shortcut({
      brainMap: this
    })

    // 命令类实例化
    this.command = new Command({
      brainMap: this
    })

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
    this.command.addHistory()
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

  // 注册快捷键
  registerShortcut (key: string, cb: (...arg: any) => void): void {
    this.shortcut.addShortcut(key, cb)
  }

  // 注册命令
  // 函数重载
  registerCommand (cmdName: EnumCommandName.SET_NODE_TEXT, task: (arg1: Node, arg2: string) => void): void
  registerCommand (cmdName: EnumCommandName.SET_NODE_DATA, task: (arg1: Node, arg2: Partial<DataSourceItem>) => void): void
  registerCommand (cmdName: EnumCommandName.REDO | EnumCommandName.UNDO, task: () => void): void
  registerCommand (cmdName:
  EnumCommandName.SET_NODE_ACTIVE |
  EnumCommandName.SET_NODE_EDIT |
  EnumCommandName.SET_NODE_EXPAND, task: (arg1: Node, arg2: boolean) => void): void
  registerCommand (cmdName:
  EnumCommandName.DELETE_SINGLE_NODE |
  EnumCommandName.DELETE_NODE |
  EnumCommandName.INSERT_CHILD_NODE |
  EnumCommandName.INSERT_SIBLING_NODE, task: (arg1: Node) => void): void

  // 函数实现
  registerCommand (cmdName: string, task: (...args: any) => void): void {
    this.command.addCommand(cmdName, task)
  }

  // 执行命令
  // 函数重载
  execCommand (cmdName: EnumCommandName.SET_NODE_TEXT, arg1: Node, arg2: string): void
  execCommand (cmdName: EnumCommandName.SET_NODE_DATA, arg1: Node, arg2: Partial<DataSourceItem>): void
  execCommand (cmdName: EnumCommandName.REDO | EnumCommandName.UNDO): void
  execCommand (cmdName:
  EnumCommandName.SET_NODE_ACTIVE |
  EnumCommandName.SET_NODE_EDIT |
  EnumCommandName.SET_NODE_EXPAND, arg1: Node, arg2: boolean): void
  execCommand (cmdName:
  EnumCommandName.DELETE_SINGLE_NODE |
  EnumCommandName.DELETE_NODE |
  EnumCommandName.INSERT_CHILD_NODE |
  EnumCommandName.INSERT_SIBLING_NODE, arg1: Node): void

  // 函数实现
  execCommand (cmdName: keyof typeof EnumCommandName, ...args: any[]): void {
    this.command.exec(cmdName, args)
  }
}

export default BrainMap
