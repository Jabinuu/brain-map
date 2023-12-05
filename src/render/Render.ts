import type BrainMap from '../..'
import LogicalStructure from '../layouts/logicalStructure'
import { CONSTANT } from '../constant/constant'
interface RenderOption {
  brainMap: BrainMap
}

type Layout = LogicalStructure

const layouts = {
  [CONSTANT.LAYOUTS.LOGICAL_STRUCTURE]: LogicalStructure
}

// 渲染类，负责渲染相关
class Render {
  brainMap: BrainMap
  layout: Layout | null

  constructor (opt: RenderOption) {
    this.brainMap = opt.brainMap
    this.layout = null

    // 设置布局
    this.setLayout()
  }

  setLayout (): void {
    this.layout = new (layouts[this.brainMap.layout] ?? layouts[CONSTANT.LAYOUTS.LOGICAL_STRUCTURE])(this)
  }

  // 渲染器
  render (): void {
    this.layout?.doLayout()
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
