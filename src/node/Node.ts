import nodeCreateContentMethods from './nodeCreateContent'
import { type G as GType } from '@svgdotjs/svg.js'
interface NodeCreateOption {
  width?: number
  height?: number
  left?: number
  top?: number
  text?: string
}

interface NodeData {
  text?: string
}

export interface TextData {
  width: number
  height: number
  element: GType
}

// 思维导图节点类
class Node {
  [prop: string]: any
  _width: number
  _height: number
  left: number
  top: number
  nodeData: NodeData
  textData: TextData | null

  // 构造函数
  constructor (opt: NodeCreateOption = {}) {
    // 节点数据
    this.nodeData = { text: opt.text }
    // 节点宽度
    this._width = opt.width ?? 0
    // 节点高度
    this._height = opt.width ?? 0
    // 节点相对于画布left
    this.left = opt.top ?? 0
    // 节点相对于画布top
    this.top = opt.top ?? 0

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

  getSize (): { width: number, height: number } {
    let width = 20 * 2; let height = 10 * 2
    this.generateContentElem()
    if (this.textData != null) {
      width += this.textData.width
      height += this.textData.height
    }
    this._width = width
    this._height = height

    return {
      width,
      height
    }
  }
}

export default Node
