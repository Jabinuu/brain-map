import { G, SVG } from '@svgdotjs/svg.js'
import type Node from './Node'
import type { TextData } from './Node'
import { EnumDataSource } from '../constant/constant'

export interface NodeCreateContentMethods {
  [prop: string]: any
  createTextElem: (arg0: Node) => TextData
}

function getEditAreaSize (div: HTMLElement): { height: number, width: number } {
  div.style.display = 'inline-block'
  document.body.appendChild(div)
  const width = div.clientWidth
  const height = div.clientHeight
  div.style.removeProperty('display')
  return {
    height,
    width
  }
}

// 创建文本元素
function createTextElem (this: Node): TextData {
  const g = new G()
  const text = document.createTextNode(`${this.nodeData?.data.text as string}`)
  const div = document.createElement('div')
  if (this.getData('isEdit')) {
    div.setAttribute('contenteditable', 'true')
    div.style.cursor = 'text'
  } else {
    div.removeAttribute('contenteditable')
  }

  div.appendChild(text)
  div.classList.add('bm-text-editer')

  const { width: initWidth, height: initHeight } = getEditAreaSize(div)

  const foreigObject = g.foreignObject(initWidth, initHeight)
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
