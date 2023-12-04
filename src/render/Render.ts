import type BrainMap from '../..'
import Node from '../node/Node'

// import Node from '@/node/Node'
// import { type G as GType, SVG, Rect, G, Matrix } from '@svgdotjs/svg.js'
interface RenderOption {
  brainMap: BrainMap
}

// 渲染类，负责渲染相关
class Render {
  brainMap: BrainMap
  constructor (opt: RenderOption) {
    this.brainMap = opt.brainMap
  }

  // 渲染器
  render (): void {
    // 遍历渲染树，创建节点实例，并进行连接，后续封装为函数
    const newNode = new Node({
      isRoot: true,
      data: this.brainMap.dataSource,
      brainMap: this.brainMap
    })
    if (newNode.isRoot) { this.brainMap.root = newNode }

    this.brainMap.root?.render()
  }
}

export default Render

// function drawNode (container: string): GType | undefined {
//   const svg = SVG().addTo(container).size(document.body.clientWidth, document.body.clientHeight)
//   const node = new Node({
//     text: '厦门理工学院'
//   })
//   // node.generateContentElem()
//   const { width, height } = node.getSize()
//   if (node.textData != null) {
//     const rect = new Rect().size(width, height).fill('none').stroke({ color: '#000', width: 2 })
//     // 节点容器
//     const g = new G()
//     g.add(rect).add(node.textData.element).transform(new Matrix(1, 0, 0, 1, 500, 200))
//     svg.add(g)
//     return node.textData.element
//   }
// }
