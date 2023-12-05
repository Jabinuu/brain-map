import { G, Text } from '@svgdotjs/svg.js'
import type Node from './Node'
import type { TextData } from './Node'
import { EnumDataSource } from '../constant/constant'

interface NodeCreateContentMethods {
  [props: string]: any
  createTextElem: () => TextData
}

// 创建文本元素
function createTextElem (this: Node): TextData {
  const g = new G()
  const textElem = new Text().text(this.nodeData?.data.text as string).font({ size: 16, family: 'Helvetica' }).y(0)
  const { width, height } = textElem.bbox()
  g.add(textElem).translate(this.getData(EnumDataSource.PADDINGX) as number, this.getData(EnumDataSource.PADDINGY) as number)
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
