import type BrainMap from '../..'
import { type DataSource } from '../..'
import type Shape from './Shape'
import nodeCreateContentMethods from './nodeCreateContent'
import { type G as GType } from '@svgdotjs/svg.js'

interface NodeCreateOption {
  data?: DataSource
  width?: number
  height?: number
  left?: number
  top?: number
  text?: string
  parent?: Node
  children?: Node[]
  isRoot?: boolean
  brainMap: BrainMap
}

export interface TextData {
  width: number
  height: number
  element: GType
}

// 思维导图节点类
class Node {
  [prop: string]: any
  width: number
  height: number
  left: number
  top: number
  nodeData: DataSource | undefined
  textData: TextData | null
  parent: Node | null
  children: Node[]
  isRoot: boolean
  group: GType | null
  shape: Shape | null
  brainMap: BrainMap
  nodeDrawing: GType | null
  lineDrawing: GType | null

  // 构造函数
  constructor (opt: NodeCreateOption) {
    // 节点数据
    this.nodeData = opt.data
    // 节点宽度
    this.width = opt.width ?? 0
    // 节点高度
    this.height = opt.width ?? 0
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
    this.shape = null
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

    this.getSize()
  }

  // 生成该节点下的所有内容元素
  generateContentElem (): void {
    this.textData = this.createTextElem()
  }

  // 获得节点总宽高
  getSize (): { width: number, height: number } {
    let width = 20 * 2; let height = 10 * 2
    this.generateContentElem()
    if (this.textData != null) {
      width += this.textData.width
      height += this.textData.height
    }
    this.width = width
    this.height = height

    return {
      width,
      height
    }
  }

  // 根据数据源渲染出节点
  render (): void {
    if (this.nodeDrawing !== null) {
      this.group = this.nodeDrawing.group()
      if (this.textData !== null) {
        this.group.add(this.textData.element)
      }
    }
  }
}

export default Node
