import { type G, SVG, type Svg } from '@svgdotjs/svg.js'
import Render from './src/render/Render'
import type Node from './src/node/Node'
import View from './src/view/View'
import Event from './src/event/Event'
import theme from './src/themes'
import merge from 'deepmerge'
import { type EnumCommandName, cssConstant } from './src/constant/constant'
import Shortcut from './src/shortcut/Shortcut'
import Command from './src/command/Command'
import { type ThemeConfig } from './src/themes/default'
import Style from './src/Style/Style'

export type Pair<T1, T2> = [T1, T2]

interface BrainMapOption {
  [prop: string]: any
  // 思维导图容器元素
  el: HTMLElement
  // 思维导图数据源
  dataSource: DataSource
  // 思维导图布局结构
  layout?: string
  // 鱼骨图斜线角度
  fishBoneDeg?: number
  // 样式主题
  theme?: string
  // 自定义主题配置对象
  themeConfig?: Partial<ThemeConfig>
  // 缩放比例的单位增量，默认0.1
  scaleDelta?: number
  // 是否是只读模式
  readOnly?: boolean
  // 是否允许拖动节点
  enableDrag?: boolean
  // 文本节点达到该宽度时自动更换行
  textAutoWrapWidth?: number
  // 导图图片的内边距
  exportPadding?: number
}

export interface DataSourceItem {
  [prop: string]: any

  // 节点唯一id
  uid?: string
  // 文本数据
  text: string
  // 图片url
  image?: string
  // 图标列表
  icon?: string[]
  // 标签列表
  tag?: string[]
  // 节点是否展开
  isExpand: boolean
  // 节点激活状态
  isActive: boolean
  // 该节点是否处于编辑状态
  isEdit: boolean
  // 该节点是否是富文本模式
  richText?: boolean
  // 超链接url
  hyperLink?: string

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
  theme: string
  themeConfig: ThemeConfig | null

  // 已注册的插件列表
  static pluginList: any[] = []
  // 注册插件
  // static async usePlugin (plugin: string, brainMap: BrainMap): Promise<typeof BrainMap> {
  //   if (BrainMap.hasPlugin(plugin)) {
  //     return this
  //   }

  //   const pluginModule = await import(`./src/plugins/${plugin}.ts`)

  //   // tip:类静态成员的this指向的类本身而不是实例
  //   this.pluginList.push(pluginModule)
  //   const instanceName = pluginModule.default.name.toLocaleLowerCase()
  //   const Constructor = pluginModule.default
  //   brainMap[instanceName] = new Constructor({
  //     brainMap
  //   })
  //   return this
  // }

  // // 检查插件是否已被注册过
  // static hasPlugin (plugin: string): boolean {
  //   return !!BrainMap.pluginList.find((item) => {
  //     return item.name === plugin
  //   })
  // }

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
    // 主题名称
    this.theme = 'default'
    // 主题配置对象
    this.themeConfig = null

    // 注入选项数据
    this.handleOpt(opt)
    // 初始化容器DOM尺寸位置信息
    this.initContainerSize()
    // 初始化容器
    this.initContainer()
    // 添加基础常量样式
    this.addCss()
    // 初始化主题
    this.initTheme(opt)

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

    // this.initPlugins()

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
      this.elRect = this.el.getBoundingClientRect()
      this.width = this.elRect.width
      this.height = this.elRect.height
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
      this.el.style.overflow = 'hidden'
    }
  }

  // 初始化插件
  // initPlugins (): void {
  //   BrainMap.pluginList.forEach((plugin) => {
  //     const instanceName = plugin.default.name.toLocaleLowerCase()
  //     const Constructor = plugin.default
  //     this[instanceName] = new Constructor({
  //       brainMap: this
  //     })
  //   })
  // }

  // 初始化主题
  initTheme (opt: BrainMapOption): void {
    this.themeConfig = merge(theme[this.theme], opt.themeConfig ?? {})
    if (this.el) {
      Style.setBackgroundStyle(this.el, this.themeConfig)
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
  registerCommand (cmdName: EnumCommandName.SET_NODE_TEXT, task: (arg1: [Node], arg2: string) => void): void
  registerCommand (cmdName: EnumCommandName.SET_NODE_DATA, task: (arg1: [Node], arg2: Partial<DataSourceItem>) => void): void
  registerCommand (cmdName: EnumCommandName.REDO |
  EnumCommandName.UNDO |
  EnumCommandName.CLEAR_ACTIVE_NODE, task: () => void): void
  registerCommand (cmdName:
  EnumCommandName.SET_NODE_ACTIVE |
  EnumCommandName.SET_NODE_EDIT, task: (arg1: [Node], arg2: boolean) => void): void
  registerCommand (cmdName:
  EnumCommandName.DELETE_SINGLE_NODE |
  EnumCommandName.INSERT_CHILD_NODE |
  EnumCommandName.SET_NODE_EXPAND |
  EnumCommandName.DELETE_NODE |
  EnumCommandName.INSERT_SIBLING_NODE |
  EnumCommandName.RESIZE_NODE, task: (arg1: Node[]) => void): void
  registerCommand (cmdName: EnumCommandName.SET_NODE_STYLE, task: (arg1: Node[], arg2: string, arg3: string) => void): void

  // 函数实现
  registerCommand (cmdName: string, task: (...args: any) => void): void {
    this.command.addCommand(cmdName, task)
  }

  // 执行命令
  // 函数重载
  execCommand (cmdName: EnumCommandName.SET_NODE_TEXT, arg1: [Node], arg2: string): void
  execCommand (cmdName: EnumCommandName.SET_NODE_DATA, arg1: [Node], arg2: Partial<DataSourceItem>): void
  execCommand (cmdName: EnumCommandName.REDO |
  EnumCommandName.UNDO |
  EnumCommandName.CLEAR_ACTIVE_NODE |
  EnumCommandName.RESIZE_NODE): void
  execCommand (cmdName:
  EnumCommandName.SET_NODE_ACTIVE |
  EnumCommandName.SET_NODE_EDIT, arg1: [Node], arg2: boolean): void
  execCommand (cmdName:
  EnumCommandName.DELETE_SINGLE_NODE |
  EnumCommandName.INSERT_CHILD_NODE |
  EnumCommandName.SET_NODE_EXPAND |
  EnumCommandName.INSERT_SIBLING_NODE |
  EnumCommandName.RESIZE_NODE, arg1: Node[]): void
  execCommand (cmdName: EnumCommandName.DELETE_NODE, arg1: Node[]): void
  execCommand (cmdName: EnumCommandName.SET_NODE_STYLE, arg1: Node[], arg2: string, arg3: string): void

  // 函数实现
  execCommand (cmdName: keyof typeof EnumCommandName, ...args: any[]): void {
    this.command.exec(cmdName, args)
  }

  // 触发自定义事件
  emit (event: string, ...args: any[]): void {
    this.event.emit(event, args)
  }

  // 订阅自定义事件
  on (event: string, fn: (...args: any[]) => void): void {
    this.event.on(event, fn)
  }

  // 解绑自定义事件
  off (event: string, fn?: (...args: any[]) => void): void {
    this.event.off(event, fn)
  }

  // 鼠标位置转相对位置
  toRelativePos (x: number, y: number): { x: number, y: number } {
    if (this.elRect) {
      return {
        x: x - this.elRect.left,
        y: y - this.elRect.top
      }
    } else {
      return { x: 0, y: 0 }
    }
  }
}

export default BrainMap
