import { G, type G as GType, type Path } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type { DataSource } from '../..'
import Shape from './Shape'
import nodeCreateContentMethods from './nodeCreateContent'
import { EnumDataSource } from '../constant/constant'

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
  parent: Node | null
  children: Node[]
  isRoot: boolean
  group: GType | null
  shape: Shape | null
  shapeElem: Path | null
  shapePadding: {
    paddingX: number
    paddingY: number
  }

  paddingX:number
  paddingY:number
  childrenAreaHeight: number
  brainMap: BrainMap
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
    // 思维导图所有节点容器
    this.nodeDrawing = this.brainMap.nodeDrawing
    // 思维导图所有连线节点容器
    this.lineDrawing = this.brainMap.lineDrawing
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

  handleOpt(opt:NodeCreateOption){
    if(opt.data){
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

    this.width = _width + 2 * (this.getData(EnumDataSource.PADDINGX) as number) + 2 * this.shapePadding.paddingX
    this.height = _height + 2 * (this.getData(EnumDataSource.PADDINGY) as number) + 2 * this.shapePadding.paddingY

    return {
      width: this.width,
      height: this.height
    }
  }

  getData (key: string | undefined): unknown {
    if (this.nodeData !== null) {
      return (key != null) ? this.nodeData.data[key] : this.nodeData.data
    }
  }

  // 根据数据源渲染出节点
  render (): void {
    this.group = new G()
    this.group.translate(this.left, this.top)
    if (this.textData !== null) { this.group.add(this.textData.element) }
    this.shape = new Shape(this)
    this.shapeElem = this.shape.createRect()
    this.group.add(this.shapeElem)
    if (this.nodeDrawing !== null) {
      this.group.addTo(this.nodeDrawing)
    }
    this.children.forEach((item) => {
      item.render()
    })
  }
}

export default Node
