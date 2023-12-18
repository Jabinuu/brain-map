import { G, SVG } from '@svgdotjs/svg.js'
import type Node from './Node'
import type { TextData } from './Node'
import { EnumDataSource } from '../constant/constant'

export interface NodeCreateContentMethods {
  [prop: string]: any
  createTextElem: (arg0: Node) => TextData
}

// 创建文本元素
function createTextElem (this: Node): TextData {
  const g = new G()
  const div = document.createElement('div')
  div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  div.innerHTML = `${this.nodeData?.data.text as string}`
  div.style.cssText = `
      font-size: 20px;
      font-family: "Helvetica";
  `
  const foreigObject = g.foreignObject(200, 200)
  foreigObject.add(SVG(div))
  g.add(foreigObject)
  g.translate(this.getData(EnumDataSource.PADDINGX) as number, this.getData(EnumDataSource.PADDINGY) as number)
  const { width, height } = g.bbox()
  return {
    element: g,
    div,
    width,
    height
  }
}
const nodeCreateContentMethods: NodeCreateContentMethods = {
  createTextElem

}

export default nodeCreateContentMethods
