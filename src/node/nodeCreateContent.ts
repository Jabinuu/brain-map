import { G, Text } from '@svgdotjs/svg.js'
import type Node from './Node'
import { type TextData } from './Node'
interface NodeCreateContentMethods {
  [props: string]: any
  createTextElem: () => TextData
}

// 创建文本元素
function createTextElem (this: Node): TextData {
  const g = new G()
  const textElem = new Text().text(this.nodeData.text as string).font({ size: 16, family: 'Helvetica' })
  const { width, height } = textElem.bbox()
  g.add(textElem)
  return {
    element: g,
    width,
    height
  }
}

const methods: NodeCreateContentMethods = {
  createTextElem
}

export default methods
