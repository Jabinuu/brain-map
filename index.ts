import Node from './src/node/Node'
import { type G as GType, SVG, Rect, G, Matrix } from '@svgdotjs/svg.js'

interface BrainMapOption {
  el: HTMLElement
  dataSource: DataSource
}

interface DataSourceIetm {
  text?: string // 文本数据
  image?: string // 图片url
  icon?: [] // 图标列表
  tag?: [] // 标签列表
  expand?: boolean // 节点是否展开
  richText?: boolean // 该节点是否是富文本模式
  hyperLink?: string // 超链接url
  paddingX?: number // 节点x轴内边距
  paddingY?: number // 节点y轴内边距
  // ...其他样式字段
}

export interface DataSource {
  data: DataSourceIetm
  children: DataSource[]
}

class BrainMap {
  el: HTMLElement
  constructor (opt: BrainMapOption) {
    this.el = opt.el
  }
}

export default BrainMap

function drawNode (container: string): GType | undefined {
  const svg = SVG().addTo(container).size(document.body.clientWidth, document.body.clientHeight)
  const node = new Node({
    text: '厦门理工学院'
  })
  // node.generateContentElem()
  const { width, height } = node.getSize()
  if (node.textData != null) {
    const rect = new Rect().size(width, height).fill('none').stroke({ color: '#000', width: 2 })
    // 节点容器
    const g = new G()
    g.add(rect).add(node.textData.element).transform(new Matrix(1, 0, 0, 1, 500, 200))
    svg.add(g)
    return node.textData.element
  }
}

export {
  drawNode
}
