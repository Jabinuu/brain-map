import { G, type Polyline, type G as GType, type Path, Rect, SVG } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type { DataSource, DataSourceItem } from '../..'
import Shape from '../shape/Shape'
import nodeCreateContentMethods from './nodeCreateContent'
import { EnumCommandName, EnumDataSource, EnumLineShape } from '../constant/constant'
import type Render from '../render/Render'
import { open as openBtn, close as closeBtn } from '../svg/btns'
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

  // 绑定节点事件
  bindNodeEvent (): void {
    // 单击事件
    this.group?.on('click', (e) => {
      e.stopPropagation()
      if (!Array.prototype.includes.call((e.target as HTMLElement).classList, 'bm-expand-btn')) {
        this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, this, {
          isActive: true
        })
        this.renderer.clearActiveNodesList()
        this.renderer.addActiveNodeList(this)
      }
    })

    // 鼠标移入事件,mouseenter事件默认不冒泡
    this.group?.on('mouseenter', (e) => {
      this.showExpandBtn()
    })
    // 鼠标移出事件
    this.group?.on('mouseleave', () => {
      this.hideExpandBtn()
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
    const wrapRect = new Rect().size(this.width + (2 + 1) * 2, this.height + (2 + 1) * 2)
      .fill('none').stroke({ color: '#FF8C00' }).radius(4).move(-3, -3)
    wrapRect.addClass('bm-hover-node')
    wrapRect.addTo(this.group)

    const { isActive } = this.getData() as DataSourceItem
    // 节点激活
    if (isActive) {
      this.group.addClass('active')
    }
    // 渲染节点展开按钮
    this.renderExpandBtn()
    // 绑定节点事件
    this.bindNodeEvent()
    if (this.nodeDrawing !== null) {
      this.group.addTo(this.nodeDrawing)
    }
    // 渲染节点连线
    this.renderLine(this)

    // 根据节点是否展开来决定是否渲染子节点
    if (this.getData('isExpand')) {
      // 递归渲染子节点
      this.children.forEach((item) => {
        item.render()
      })
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

  // 创建展开收起按钮
  renderExpandBtn (): GType | undefined {
    if (this.isRoot || !this.children || this.children.length <= 0) {
      return
    }
    const g = new G()
    g.addClass('bm-expand-btn')
    let svgString = closeBtn
    const { isExpand } = this.getData() as DataSourceItem
    if (!isExpand) {
      svgString = openBtn
    }

    const btnRadius = 18
    g.circle(btnRadius - 1).fill('#f06')
    SVG(svgString).size(btnRadius, btnRadius).addTo(g)
    g.translate(this.width, (this.height - btnRadius) / 2)
    // 绑定事件
    g.on('mouseenter', () => {
      g.css({
        cursor: 'pointer'
      })
    })
    g.on('click', () => {
      this.brainMap.execCommand<Node, boolean>(EnumCommandName.SET_NODE_EXPAND, this, !isExpand)
    })
    return g
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
}

export default Node
