import { G, SVG } from '@svgdotjs/svg.js'
import type Node from './Node'
import { EnumDataSource } from '../constant/constant'

export interface NodeCreateContentMethods {
  [prop: string]: any
  createTextElem: (arg0: Node) => void
}

function getEditAreaSize (node: Node): { height: number, width: number, div: HTMLElement } {
  const text = document.createTextNode(`${node.nodeData?.data.text as string}`)
  const div = document.createElement('div')
  node.style.text(div)

  div.appendChild(text)
  div.classList.add('bm-text-editer')

  div.style.display = 'inline-block'
  document.body.appendChild(div)
  const width = div.clientWidth
  const height = div.clientHeight
  div.style.removeProperty('display')
  document.body.removeChild(div)

  return {
    height,
    width,
    div
  }
}

// 创建文本元素
function createTextElem (this: Node): void {
  // 如果处于编辑模式，则复用之前文本元素，对其做修改更新即可
  if (this.getData('isEdit')) {
    const { width: divWidth, height: divHeight } = getEditAreaSize(this)
    if (this.textData) {
      this.textData.element.children().forEach((elem) => {
        if (elem.type === 'foreignObject') {
          elem.attr({
            width: divWidth,
            height: divHeight
          })
        }
      })
      const { width, height } = this.textData.element.bbox()
      this.textData.width = width
      this.textData.height = height
    }
  } else {
    const g = new G()
    const { width: initWidth, height: initHeight, div } = getEditAreaSize(this)

    const foreigObject = g.foreignObject(initWidth, initHeight)
    foreigObject.add(SVG(div))
    g.add(foreigObject)
    g.translate(this.getData(EnumDataSource.PADDINGX) as number, this.getData(EnumDataSource.PADDINGY) as number)
    const { width, height } = g.bbox()

    // 编辑节点文本事件
    div.addEventListener('input', (e: Event) => {
      this.renderer.onEditNodeText(e, this)
    })

    this.textData = {
      element: g,
      div,
      width,
      height
    }
  }
}
const nodeCreateContentMethods: NodeCreateContentMethods = {
  createTextElem
}

export default nodeCreateContentMethods
