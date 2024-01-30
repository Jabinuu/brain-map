import { G, SVG } from '@svgdotjs/svg.js'
import type Node from './Node'

export interface NodeCreateContentMethods {
  [prop: string]: any
  createTextElem: (arg1: boolean) => void
}

function getEditAreaSize (node: Node): { height: number, width: number, div: HTMLElement } {
  const minWidth = 20
  const minHeight = 21
  const isEdit = node.getData('isEdit')
  let div = document.createElement('div')

  const text = document.createTextNode(`${node.nodeData?.data.text as string}`)
  const wrapElem = document.createElement('span')
  wrapElem.appendChild(text)
  node.style.text(wrapElem)
  document.body.appendChild(wrapElem)
  let width = wrapElem.offsetWidth + 0.5
  let height = wrapElem.offsetHeight
  document.body.removeChild(wrapElem)

  if (node.styleChange && node.textData) {
    if (!node.isResized) {
      const _width = node.textData.width
      node.style.text(node.textData.div)
      const { clientWidth } = node.textData.div
      if (_width !== clientWidth - 0.5) {
        width = clientWidth
      }
      div = node.textData.div as HTMLDivElement
      div.style.width = width + 'px'
    } else {
      node.style.text(node.textData.div)
      width = node.textData.width
      height = node.textData.div.scrollHeight
      div = node.textData.div as HTMLDivElement
    }
  } else if (isEdit && node.isResized && node.textData) {
    // 如果节点已通过控制点重新设置尺寸,则不做处理，直接返回编辑区域的长宽即可
    width = node.textData.width
    height = node.textData.div.scrollHeight
    div = node.textData.div as HTMLDivElement
    node.style.text(div)
  } else {
    if (isEdit && node.textData) {
      div = node.textData.div as HTMLDivElement
      node.textData.div.style.width = `${width}px`
      node.textData.div.style.height = `${height}px`
      node.style.text(div)
    } else {
      div.appendChild(text)
      node.style.text(div)

      div.style.width = `${width}px`
      div.style.height = `${height}px`

      div.style.minWidth = `${minWidth}px`
      div.style.minHeight = `${minHeight}px`
      div.classList.add('bm-text-editer')
    }
  }

  return {
    height: height < minHeight ? minHeight : height,
    width: width < minWidth ? minWidth : width,
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

    const foreignObject = g.foreignObject(initWidth, initHeight)
    foreignObject.add(SVG(div))
    g.add(foreignObject)

    g.translate(this.paddingX, this.paddingY)
    const { width, height } = g.bbox()

    // 编辑节点文本事件
    div.addEventListener('input', (e: Event) => {
      this.renderer.onEditNodeText(e, this)
    })

    this.textData = {
      element: g,
      foreignObject,
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
