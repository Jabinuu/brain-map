import { G, type Polyline, type G as GType, type Path, Rect, type Circle, type ForeignObject } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type { DataSource, DataSourceItem } from '../..'
import Shape from '../shape/Shape'
import nodeCreateContentMethods from './nodeCreateContent'
import { EnumCommandName } from '../constant/constant'
import type Render from '../render/Render'
import Style from '../Style/Style'
import { getDigitCount, getNumberOfAllChildren, throttle } from '../utils'

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
  layerIndex: number
}

type NodeSize = [width: number, height: number]

export interface TextData {
  width: number
  height: number
  element: GType
  div: HTMLElement
  foreignObject: ForeignObject
}

// 思维导图节点类
class Node {
  [prop: string]: any
  uid: string
  width: number
  height: number
  beforWidth: number
  beforeHeight: number
  beforeDivWidth: number
  beforeForeignObjectWidth: number
  beforForeignObjectHeight: number
  minWidth: number
  left: number
  top: number
  nodeData: DataSource | null
  textData: TextData | null
  lines: Array<Path | Polyline>
  parent: Node | null
  children: Node[]
  layerIndex: number
  isResized: boolean
  resizeLog: NodeSize[]
  isRoot: boolean
  group: GType | null
  shape: Shape
  style: Style
  shapeElem: Path | null
  controlPtElem: Circle | null
  genericExpandArea: Rect | null
  expandBtnElem: GType | null
  shapePadding: {
    paddingX: number
    paddingY: number
  }

  lastText: string
  textChange: boolean
  needLayout: boolean
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
    // resize前的宽度
    this.beforWidth = 0
    // resize前的高度
    this.beforeHeight = 0
    // resize前的编辑div宽度
    this.beforeDivWidth = 0
    this.beforeForeignObjectWidth = 0
    this.beforForeignObjectHeight = 0
    // 节点最小宽度
    this.minWidth = 40
    // 节点相对于画布left
    this.left = opt.top ?? 0
    // 节点相对于画布top
    this.top = opt.top ?? 0

    // 双亲节点
    this.parent = opt.parent ?? null
    // 孩子节点列表
    this.children = opt.children ?? []
    // 该节点是否是根节点
    this.isRoot = opt.isRoot ?? false

    // 节点容器(包括形状和内容)
    this.group = null

    // 节点形状元素
    this.shapeElem = null
    // 展开收起按钮元素
    this.expandBtnElem = null
    // 控制点元素
    this.controlPtElem = null
    // 泛展开按钮区域元素
    this.genericExpandArea = null
    // 节点形状所需的额外内边距
    this.shapePadding = {
      paddingX: 0,
      paddingY: 0
    }
    // 节点所处层
    this.layerIndex = opt.layerIndex
    // 所有后代节点所占的总高度
    this.childrenAreaHeight = 0

    this.lastText = opt.text ?? ''
    // 节点文本是否发生变化
    this.textChange = false
    // 是否需要在有节点内容组合的情况下重新布局内容
    this.needLayout = false

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

    // 是否通过控制点调整过尺寸
    this.isResized = false

    // Style实例
    this.style = new Style(this)
    // Shape实例
    this.shape = new Shape(this)

    // 节点内边距
    this.paddingX = this.style.getStyle('paddingX', true) as number
    this.paddingY = this.style.getStyle('paddingY', true) as number
    // 通过控制点resize的历史记录
    this.resizeLog = []

    /* 该节点的内容元素 */
    // 文本元素
    this.textData = null

    // 创建节点各种内容元素方法
    Object.keys(nodeCreateContentMethods).forEach((item) => {
      this[item] = (nodeCreateContentMethods)[item].bind(this)
    })

    this.getSize()
  }

  // 生成该节点下的所有内容元素
  generateContentElem (): void {
    this.createTextElem()
  }

  // 获得节点总宽高
  getSize (isResizeChange: boolean = false, needRegenerate: boolean = false): boolean {
    if (isResizeChange && this.renderer.resizeRecord) {
      if (needRegenerate) {
        this.generateContentElem()
      }
      this.width = this.renderer.resizeRecord.width
      this.height = this.renderer.resizeRecord.height
      if (this.textData) {
        this.textData.div.style.width = this.renderer.resizeRecord.divWidth + 'px'
        this.textData.width = this.renderer.resizeRecord.divWidth
      }
      this.textData?.foreignObject.attr({
        width: this.renderer.resizeRecord.foreignObjectWidth,
        height: this.renderer.resizeRecord.foreignObjectHeight
      })
      return true
    }

    // todo: 获取节点中所有类型元素的size，当前只有文本节点
    let _width: number = 0; let _height: number = 0
    this.generateContentElem()
    if (this.textData !== null) {
      _width = this.textData.width
      _height = this.textData.height
    }
    // 节点形状的线宽度
    const borderWidth = this.style.getStyle('borderWidth') as number

    const width = _width + 2 * this.paddingX + 2 * this.shapePadding.paddingX + borderWidth
    const height = _height + 2 * this.paddingY + 2 * this.shapePadding.paddingY + borderWidth
    const isSizeChange = this.width !== width || this.height !== height
    this.width = width
    this.height = height

    return isSizeChange
  }

  // 获取节点样式
  getStyle (prop: string): string {
    return this.style.getStyle(prop) as string
  }

  // 获取去除边框宽度的节点总宽高
  getSizeWithoutBorderWidth (): { width: number, height: number } {
    const borderWidth = this.style.getStyle('borderWidth') as number
    const width = this.width - borderWidth
    const height = this.height - borderWidth
    return {
      width,
      height
    }
  }

  // 绑定节点事件
  bindNodeEvent (): void {
    // 鼠标按下事件
    this.group?.on('mousedown', (e: Event) => {
      e.stopPropagation()
      this.brainMap.emit('node_mousedown')

      if (this.getData('isEdit')) return
      const isActive = this.getData('isActive')
      // if (!this.getData('isEdit')) {
      if ((e as MouseEvent).ctrlKey) {
        // ctrl键多选激活节点
        let activeNum = this.renderer.activeNodes.length

        if (isActive) {
          this.renderer.removeNodeFromActiveList(this)
        } else {
          this.renderer.addNodeToActiveList(this)
        }
        this.renderer.activeNodes[activeNum - 1].hideExpandBtn()
        this.renderer.activeNodes[activeNum - 1].hideControlPoint()

        if (++activeNum > 1) {
          this.renderer.createActiveNodesBoundingBox()
          this.renderer.activeNodes[activeNum - 1].hideControlPoint()
        }
      } else if (!this.renderer.activeNodes.includes(this)) {
        // 仅单击则只激活这一个节点
        this.active()
      }
      // }
    })

    this.group?.on('contextmenu', (e: Event) => {
      e.stopPropagation()
      this.brainMap.event.onContextMenu(e as MouseEvent)
    })

    // 单击事件
    this.group?.on('click', (e: Event) => {

    })

    // 鼠标移入事件,mouseenter事件默认不冒泡
    this.group?.on('mouseenter', (e) => {
      e.stopPropagation()
      // 设置个异步 防止鼠标光标样式跳为default
      setTimeout(() => {
        if (!this.renderer.isSelecting && this.renderer.activeNodes.length <= 1) {
          this.showExpandBtn()
        }
      })
    })

    // 鼠标移出事件
    this.group?.on('mouseleave', (e) => {
      e.stopPropagation()
      if (!this.getData('isActive') && this.getData('isExpand')) {
        this.hideExpandBtn()
      }
    })

    // 鼠标双击事件
    this.group?.on('dblclick', (e) => {
      e.stopPropagation()
      // todo: 清除节点的编辑状态
      if (!this.getData('isEdit')) {
        this.brainMap.execCommand(EnumCommandName.SET_NODE_EDIT, [this], true)
      }
    })
  }

  // 获取Node实例对应的数据源
  getData (key?: string): unknown {
    if (this.nodeData !== null) {
      return (key != null) ? this.nodeData.data[key] : this.nodeData.data
    }
  }

  // 修改Node对应的数据源
  setData<T>(key: string, val: T): void {
    if (this.nodeData) {
      this.nodeData.data[key] = val
    }
  }

  // 节点内的内容进行布局
  layout (): void {
    if (!this.group) {
      return
    }
    if (!this.getData('isEdit')) {
      this.group.clear()
    } else {
      this.group.children().forEach((item) => {
        if (item !== this.textData?.element) item.remove()
      })
    }

    // 节点形状
    // console.log(this.style.getStyle('shape'))
    this.shapeElem = this.shape.createNodeShape()
    this.style.shape(this)
    this.group.add(this.shapeElem)

    // todo: 将所有类型的内容元素在节点内布局
    if (this.textData !== null && !this.getData('isEdit')) {
      this.group.add(this.textData.element)
    }

    // 激活边框
    const borderWidth = this.style.getStyle('borderWidth') as number
    const borderRadius = this.style.getStyle('borderRadius') as number
    const { width, height } = this.getSizeWithoutBorderWidth()
    this.group.path().plot([
      ['M', borderRadius, -borderWidth / 2 + 0.5],
      ['H', width - borderRadius],
      ['A', borderRadius + borderWidth / 2 - 0.5, borderRadius + borderWidth / 2 - 0.5, 0, 0, 1, width + borderWidth / 2 - 0.5, borderRadius],
      ['V', height - borderRadius],
      ['A', borderRadius + borderWidth / 2 - 0.5, borderRadius + borderWidth / 2 - 0.5, 0, 0, 1, width - borderRadius, height + borderWidth / 2 - 0.5],
      ['H', borderRadius],
      ['A', borderRadius + borderWidth / 2 - 0.5, borderRadius + borderWidth / 2 - 0.5, 0, 0, 1, -borderWidth / 2 + 0.5, height - borderRadius + 0.5],
      ['V', borderRadius],
      ['A', borderRadius + borderWidth / 2 - 0.5, borderRadius + borderWidth / 2 - 0.5, 0, 0, 1, borderRadius, -borderWidth / 2 + 0.5]
    ])
      .fill('none')
      .stroke({ color: '#0984e3' })
      .addClass('bm-hover-node')

    // 控制点
    const controlPtRadius = 3
    this.controlPtElem = this.group.circle(controlPtRadius * 2)
      .fill('#fff')
      .stroke({ color: 'rgba(88, 90, 90, 0.7)' })
      .move(width + borderWidth / 2 - controlPtRadius - 2, 0)
      .addClass('bm-control-point')

    this.controlPtElem.on('mousedown', this.onMousedownControlPt.bind(this))

    // 创建泛扩展按钮区域
    if (!this.isRoot && this.nodeData?.children && this.nodeData.children.length > 0) {
      this.renderGenericExpandArea()
    }
  }

  // 根据数据源渲染出节点
  render (): void {
    const { isExpand } = this.getData() as DataSourceItem

    // 渲染节点连线
    this.renderLine(this)

    if (!this.group) {
      this.group = new G()
      this.group.translate(this.left, this.top)
      this.group.addClass('bm-node')
      this.group.css({
        cursor: 'default'
      })

      this.nodeDrawing?.add(this.group)
      // 绑定节点事件
      this.bindNodeEvent()
      this.layout()
    } else {
      if (this.needLayout) {
        this.needLayout = false
        this.layout()
      }

      const lastTransform = this.group.transform()
      if (lastTransform.translateX && lastTransform.translateY) {
        // 节点位置若发生变化则移动
        if (lastTransform.translateX !== this.left || lastTransform.translateY !== this.top) {
          this.group.translate(this.left - lastTransform.translateX, this.top - lastTransform.translateY)
        }
      }
    }

    // 节点激活
    this.updateNodeActiveClass()

    // 每次渲染重置收缩扩展节点状态
    this.expandBtnElem?.remove()
    this.expandBtnElem = null

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

  reRender (): boolean {
    const isSizeChange = this.getSize()
    return isSizeChange
  }

  // 渲染连线
  renderLine (node: Node): void {
    if (this.renderer.layout) {
      // 删除上次渲染的线
      node.lines.forEach((line) => line.remove())
      node.lines = []
      this.renderer.layout.renderLine(node)

      node.lines.forEach((item) => {
        if (this.lineDrawing != null) {
          item.addTo(this.lineDrawing)
        }
      })
    }
  }

  // 激活单个节点
  active (): void {
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.renderer.clearEditStatus()
    this.renderer.addNodeToActiveList(this)
    this.brainMap.emit('node_active', this.renderer.activeNodes)
  }

  // 更新节点激活状态
  updateNodeActiveClass (): void {
    if (!this.group) return
    const isActive = this.getData('isActive') as boolean
    if (isActive) {
      this.group.addClass('active')
      if (this.renderer.activeNodes.length <= 1 && !this.renderer.isSelecting) {
        this.showControlPoint()
      }
    } else {
      this.group.removeClass('active')
    }
  }

  // 渲染展开收起按钮
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
    this.bindExpandBtnEvent(g)

    return g
  }

  // 创建展开收缩按钮节点内容
  createExpandBtnContent (isExpand: boolean): GType {
    let { width, height } = this.getSizeWithoutBorderWidth()
    const fillColor = this.style.getStyle('lineColor', true) as string
    const borderWidth = this.style.getStyle('borderWidth') as number
    width += (borderWidth / 2)
    height += (borderWidth / 2)
    const g = new G()
    g.addClass('bm-expand-btn').css({
      cursor: 'pointer'
    })
    const btnRadius = 6
    const transformY = this.shape.shapeName === 'line'
      ? (height - btnRadius)
      : (height - btnRadius * 2) / 2

    if (isExpand) {
      g.circle(btnRadius * 2).fill(fillColor).x(5)
      g.text('<')
        .font({ size: btnRadius * 2 })
        .fill({ color: '#fff' })
        .x(btnRadius + 1)
        .y(-3)
    } else {
      const numSize = 9
      const num = getNumberOfAllChildren(this)
      const btnWidth = numSize / 2 * (getDigitCount(num) - 1)

      g.path().plot([
        ['M', btnRadius, 0],
        ['H', btnRadius + btnWidth],
        ['A', btnRadius, btnRadius, 0, 0, 1, btnRadius + btnWidth, btnRadius * 2],
        ['H', btnRadius],
        ['A', btnRadius, btnRadius, 0, 0, 1, btnRadius, 0]
      ]).fill(fillColor).x(5)

      g.line(-1, btnRadius - borderWidth / 2, btnRadius + 4, btnRadius - borderWidth / 2)
        .stroke({
          width: this.style.getStyle('lineWidth', true) as number,
          color: fillColor,
          linecap: 'round'
        })

      g.text(num.toString())
        .font({ size: numSize })
        .fill({ color: '#fff' })
        .x(btnRadius + 2)
        .y(0.5)
    }
    g.translate(width, transformY)

    return g
  }

  // 绑定展开收缩节点事件
  bindExpandBtnEvent (g: GType): void {
    g.on('click', (e) => {
      e.stopPropagation()
      this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
      this.brainMap.execCommand(EnumCommandName.SET_NODE_EXPAND, [this])
      this.renderer.clearEditStatus()
      this.brainMap.renderer.addNodeToActiveList(this)
    })
  }

  // 显示展开收起按钮
  showExpandBtn (): void {
    if (this.expandBtnElem) {
      this.expandBtnElem.css({
        visibility: 'visible'
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
    if (this.expandBtnElem && this.getData('isExpand')) {
      this.expandBtnElem.css({
        visibility: 'hidden'
      })
    }
  }

  // 显示控制点
  showControlPoint (): void {
    this.controlPtElem?.css({
      visibility: 'visible'
    })
  }

  // 隐藏控制点
  hideControlPoint (): void {
    this.controlPtElem?.css({
      visibility: 'hidden'
    })
  }

  // 点击下控制点的监听器
  onMousedownControlPt (e: Event): void {
    e.stopPropagation()

    let textDataWidth = 0; let textDataHeight = 0
    if (this.textData) {
      textDataWidth = this.textData.width
      textDataHeight = this.textData.height
    }

    const downX = (e as MouseEvent).clientX
    const foreignObjectWidth = this.textData?.foreignObject.width() as number
    let divWidth = 0; let divHeight = 0
    this.recordBeforeSize()
    this.brainMap.execCommand(EnumCommandName.SET_NODE_EDIT, [this], false)

    if (this.textData) {
      divWidth = this.textData.div.offsetWidth
      divHeight = this.textData.div.scrollHeight
    }

    if (this.brainMap.el) {
      this.brainMap.el.style.cursor = 'nesw-resize'
    }
    let bindFn = this.resize.bind(this, downX, this.width, this.height, foreignObjectWidth, divWidth, divHeight)
    bindFn = throttle(bindFn, 10)

    const onMouseup = (e: MouseEvent): void => {
      this.brainMap.el?.removeEventListener('mousemove', bindFn)
      this.brainMap.el?.style.removeProperty('cursor')
      if (this.textData) {
        this.textData.width = textDataWidth + (e.clientX - downX) / this.brainMap.view.scale
        this.textData.height = textDataHeight + (this.textData.div.scrollHeight - divHeight)
      }
      // 执行resize命令
      if (this.beforWidth !== this.width || this.beforeHeight !== this.height) {
        this.brainMap.execCommand(EnumCommandName.RESIZE_NODE, [this])
      }
      this.brainMap.el?.removeEventListener('mouseup', onMouseup)
    }

    this.brainMap.el?.addEventListener('mousemove', bindFn)
    this.brainMap.el?.addEventListener('mouseup', onMouseup)
  }

  // resize节点尺寸
  resize (
    downX: number,
    originWidth: number,
    originHeight: number,
    originForeignObjectWidth: number,
    originDivWidth: number,
    originDivHeight: number,
    e: MouseEvent
  ): void {
    const offsetX = (e.clientX - downX) / this.brainMap.view.scale

    // todo:考虑缩放
    if (this.width < this.minWidth && e.clientX < this.left + this.minWidth) {
      return
    }

    this.isResized = true
    this.isResizeChange = true
    this.needLayout = true

    let offsetY = 0; let scrollHeight = 0
    if (this.textData) {
      scrollHeight = this.textData.div.scrollHeight
      offsetY = scrollHeight - originDivHeight

      this.textData.div.style.width = `${originDivWidth + offsetX}px`

      this.textData.foreignObject.attr({
        width: originForeignObjectWidth + offsetX,
        height: scrollHeight
      })
    }
    this.width = originWidth + offsetX

    this.height = originHeight + offsetY

    this.renderer.render()
  }

  // 创建泛扩展按钮区域
  renderGenericExpandArea (): void {
    let { width, height } = this.getSizeWithoutBorderWidth()
    const borderWidth = this.style.getStyle('borderWidth') as number
    width += (borderWidth / 2)
    const btnRadius = 18
    const rect = new Rect().size(btnRadius + 8, height + borderWidth)
    rect.translate(width, -borderWidth / 2).fill('transparent')
    this.genericExpandArea = rect
    this.group?.add(rect)
  }

  // 重置复用节点布局相关数据
  reset (): void {
    this.children = []
    this.parent = null
    this.top = 0
    this.left = 0
  }

  // 销毁节点
  destroy (): void {
    this.group?.remove()
    this.group = null
    this.removeLine()
    this.parent?.removeLine()
  }

  // 移除节点上的连线
  removeLine (): void {
    this.lines.forEach((line) => {
      line.remove()
    })
    this.lines = []
  }

  // 记录节点尺寸发生变化前的尺寸
  recordBeforeSize (): void {
    this.beforWidth = this.width
    this.beforeHeight = this.height
    this.beforeDivWidth = this.textData?.div.offsetWidth as number
    this.beforeForeignObjectWidth = this.textData?.foreignObject.width() as number
    this.beforForeignObjectHeight = this.textData?.foreignObject.height() as number
  }

  // 设置样式
  setStyle (prop: string, val: string): void {
    this.needLayout = true
    this.brainMap.execCommand(EnumCommandName.SET_NODE_STYLE, this.renderer.activeNodes, prop, val)
  }
}

export default Node
