import { G, type Polyline, type G as GType, type Path, Rect, SVG } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type { DataSource, DataSourceItem } from '../..'
import Shape from '../shape/Shape'
import nodeCreateContentMethods from './nodeCreateContent'
import { EnumCommandName, EnumDataSource, EnumLineShape } from '../constant/constant'
import type Render from '../render/Render'
import { close as closeBtn } from '../svg/btns'
import { traversal } from '../utils'

interface NodeCreateOption {
  data: DataSource | null
  width?: number
  height?: number
  left?: number
  top?: number
  text?: string
  parent?: Node
  children?: Node[]
  isRoot?: boolean
  brainMap: BrainMap
  uid: string
}

export interface TextData {
  width: number
  height: number
  element: GType
  div: HTMLElement
}

// 思维导图节点类
class Node {
  [prop: string]: any
  uid: string
  width: number
  height: number
  left: number
  top: number
  nodeData: DataSource | null
  textData: TextData | null
  lines: Array<Path | Polyline>
  parent: Node | null
  children: Node[]
  isRoot: boolean
  group: GType | null
  shape: Shape | null
  shapeElem: Path | null
  genericExpandArea: Rect | null
  expandBtnElem: GType | null
  shapePadding: {
    paddingX: number
    paddingY: number
  }

  paddingX: number
  paddingY: number
  childrenAreaHeight: number
  brainMap: BrainMap
  renderer: Render
  nodeDrawing: GType | null
  lineDrawing: GType | null

  // 构造函数
  constructor (opt: NodeCreateOption) {
    // 节点唯一id
    this.uid = opt.uid || ''
    // 节点数据
    this.nodeData = opt.data
    // 节点宽度
    this.width = opt.width ?? 0
    // 节点高度
    this.height = opt.width ?? 0
    // 节点相对于画布left
    this.left = opt.top ?? 600
    // 节点相对于画布top
    this.top = opt.top ?? 200

    // 双亲节点
    this.parent = opt.parent ?? null
    // 孩子节点列表
    this.children = opt.children ?? []
    // 该节点是否是根节点
    this.isRoot = opt.isRoot ?? false
    // 节点容器(包括形状和内容)
    this.group = null
    // Shape实例
    this.shape = null
    // 节点形状元素
    this.shapeElem = null
    // 展开收起按钮元素
    this.expandBtnElem = null
    // 泛展开按钮区域元素
    this.genericExpandArea = null
    // 节点形状所需的额外内边距
    this.shapePadding = {
      paddingX: 0,
      paddingY: 0
    }
    // 所有后代节点所占的总高度
    this.childrenAreaHeight = 0
    // 节点内边距
    this.paddingX = 0
    this.paddingY = 0
    // 思维导图实例
    this.brainMap = opt.brainMap
    // 渲染器实例
    this.renderer = opt.brainMap.renderer
    // 思维导图所有节点容器
    this.nodeDrawing = this.brainMap.nodeDrawing
    // 思维导图所有连线节点容器
    this.lineDrawing = this.brainMap.lineDrawing
    // 连线元素
    this.lines = []
    /* 该节点的内容元素 */
    // 文本元素
    this.textData = null

    // 创建节点各种内容元素方法
    Object.keys(nodeCreateContentMethods).forEach((item) => {
      this[item] = (nodeCreateContentMethods)[item].bind(this)
    })

    this.handleOpt(opt)
    this.getSize()
  }

  handleOpt (opt: NodeCreateOption): void {
    if (opt.data) {
      this.paddingX = opt.data.data.paddingX
      this.paddingY = opt.data.data.paddingY
    }
  }

  // 生成该节点下的所有内容元素
  generateContentElem (): void {
    this.textData = this.createTextElem()
  }

  // 获得节点总宽高
  getSize (): { width: number, height: number } {
    // todo: 获取节点中所有类型元素的size，当前只有文本节点
    let _width: number = 0; let _height: number = 0
    this.generateContentElem()
    if (this.textData !== null) {
      _width = this.textData.width
      _height = this.textData.height
    }
    // 节点形状的边框线宽度
    const borderWidth = 2

    this.width = _width + 2 * (this.getData(EnumDataSource.PADDINGX) as number) + 2 * this.shapePadding.paddingX + borderWidth
    this.height = _height + 2 * (this.getData(EnumDataSource.PADDINGY) as number) + 2 * this.shapePadding.paddingY + borderWidth

    return {
      width: this.width,
      height: this.height
    }
  }

  // 获取去除边框宽度的节点总宽高
  getSizeWithoutBorderWidth (): { width: number, height: number } {
    const borderWidth = 2
    const width = this.width - borderWidth
    const height = this.height - borderWidth
    return {
      width,
      height
    }
  }

  // 绑定节点事件
  bindNodeEvent (): void {
    // 单击事件
    this.group?.on('click', (e: Event) => {
      // e.stopPropagation()
      // this.active()
    })

    // 鼠标移入事件,mouseenter事件默认不冒泡
    this.group?.on('mouseenter', () => {
      // 设置个异步 防止鼠标光标样式跳为default
      setTimeout(() => {
        this.showExpandBtn()
      }, 0)
    })

    // 鼠标移出事件
    this.group?.on('mouseleave', () => {
      if (!this.getData('isActive') && this.getData('isExpand')) {
        this.hideExpandBtn()
      }
    })

    // 鼠标双击事件
    this.group?.on('dblclick', () => {
      this.textData?.div.setAttribute('contenteditable', 'true')
    })
  }

  // 获取Node实例对应的数据源
  getData (key?: string): unknown {
    if (this.nodeData !== null) {
      return (key != null) ? this.nodeData.data[key] : this.nodeData.data
    }
  }

  // 根据数据源渲染出节点
  render (): void {
    this.group = new G().translate(this.left, this.top)
    this.shape = new Shape(this)
    this.shapeElem = this.shape.createRect()
    this.group.add(this.shapeElem)
    this.group.addClass('bm-node')
    this.group.css({
      cursor: 'default'
    })
    // 根节点填充色
    if (this.isRoot) this.shapeElem.fill('#F0F0F0')
    // todo: 将所有类型的内容元素在节点内布局
    if (this.textData !== null) {
      this.group.add(this.textData.element)
    }
    // 激活边框
    const borderWidth = 2 // 激活边框宽度
    const { width, height } = this.getSizeWithoutBorderWidth()
    const wrapRect = new Rect().size(width + (borderWidth + 1) * 2, height + (borderWidth + 1) * 2)
      .fill('none').stroke({ color: '#FF8C00' }).radius(4).move(-3, -3)
    wrapRect.addClass('bm-hover-node')
    wrapRect.addTo(this.group)

    const { isActive, isExpand } = this.getData() as DataSourceItem
    // 节点激活
    if (isActive) {
      this.group.addClass('active')
    }
    if (!this.isRoot && this.children && this.children.length > 0) {
      // 创建泛扩展按钮区域
      this.renderGenericExpandArea()
    }
    // 绑定节点事件
    this.bindNodeEvent()

    if (this.nodeDrawing !== null) {
      this.group.addTo(this.nodeDrawing)
    }
    // 渲染节点连线
    this.renderLine(this)

    // 根据节点是否展开来决定是否渲染子节点
    if (isExpand) {
      // 递归渲染子节点
      this.children.forEach((item) => {
        item.render()
      })
    } else {
      // 显示扩展按钮
      this.showExpandBtn()
    }
  }

  // 渲染连线
  renderLine (node: Node): void {
    if (this.renderer.layout) {
      this.renderer.layout.renderLine(node, EnumLineShape.CURVE)
      node.lines.forEach((item) => {
        if (this.lineDrawing != null) {
          item.addTo(this.lineDrawing)
        }
      })
    }
  }

  // 激活节点
  active (): void {
    this.renderer.clearActiveNodesList()
    this.brainMap.execCommand<Node, boolean>(EnumCommandName.SET_NODE_ACTIVE, this, true)
    this.renderer.addActiveNodeList(this)
  }

  // 创建展开收起按钮
  renderExpandBtn (): GType | undefined {
    if (this.isRoot ||
      !this.nodeData?.children ||
      this.nodeData.children.length <= 0) {
      return
    }
    const { isExpand } = this.getData() as DataSourceItem
    // 创建按钮节点
    const g = this.createExpandBtnContent(isExpand)
    // 绑定事件
    this.bindExpandBtnEvent(g, isExpand)

    return g
  }

  // 创建展开收缩按钮节点内容
  createExpandBtnContent (isExpand: boolean): GType {
    let { width, height } = this.getSizeWithoutBorderWidth()
    const borderWidth = 2
    width += (borderWidth / 2)
    height += (borderWidth / 2)
    const g = new G()
    g.addClass('bm-expand-btn').css({
      cursor: 'pointer'
    })
    const btnRadius = 18
    g.circle(btnRadius - 1).fill('#f06')
    if (isExpand) {
      SVG(closeBtn).size(btnRadius, btnRadius).addTo(g)
    } else {
      const num = this.getNumberOfAllChildren()
      g.text(num.toString()).x(btnRadius / 2 - 6).y(-2).font({
        size: 14
      })
      g.circle(btnRadius - 1).stroke({ width: 1, color: '#000' }).fill('transparent')
    }
    g.translate(width, (height - btnRadius) / 2)

    return g
  }

  // 绑定展开收缩节点事件
  bindExpandBtnEvent (g: GType, isExpand: boolean): void {
    g.on('click', (e) => {
      e.stopPropagation()
      this.brainMap.execCommand<Node, boolean>(EnumCommandName.SET_NODE_EXPAND, this, !isExpand)
    })
  }

  // 显示展开收起按钮
  showExpandBtn (): void {
    if (this.expandBtnElem) {
      this.expandBtnElem.css({
        display: 'block'
      })
    } else {
      const btn = this.renderExpandBtn()
      if (btn) {
        this.expandBtnElem = btn
        this.group?.add(btn)
      }
    }
  }

  // 隐藏展开收起按钮
  hideExpandBtn (): void {
    if (this.expandBtnElem) {
      this.expandBtnElem.css({
        display: 'none'
      })
    }
  }

  // 创建泛扩展按钮区域
  renderGenericExpandArea (): void {
    let { width, height } = this.getSizeWithoutBorderWidth()
    const borderWidth = 2
    width += (borderWidth / 2)
    const btnRadius = 18
    const rect = new Rect().size(btnRadius + 8, height + borderWidth)
    rect.translate(width, -borderWidth / 2).fill('transparent')
    this.genericExpandArea = rect
    this.group?.add(rect)
  }

  // 获取后代节点个数
  getNumberOfAllChildren (): number {
    let cnt = -1
    if (this.nodeData) {
      traversal(this.nodeData, false, null, () => {
        cnt++
        return false
      })
    }
    return cnt
  }
}

export default Node
