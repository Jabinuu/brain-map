import { Path, Polygon } from '@svgdotjs/svg.js'
import type Node from '../node/Node'

// 节点形状类
class Shape {
  node: Node

  constructor (node: Node) {
    this.node = node
  }

  // 计算不同节点形状所需的padding
  getShapePadding (): { paddingX: number, paddingY: number } {
    return {
      paddingX: 0,
      paddingY: 0
    }
  }

  // 创建节点形状
  createNodeShape (): void {

  }

  // 创建圆角矩形
  createRect (): Path {
    const { height, width } = this.node.getSizeWithoutBorderWidth()
    const borderRadius = this.node.style.getStyle('borderRadius') as number
    return new Path().plot([
      ['M', borderRadius, 0],
      ['H', width - borderRadius],
      ['A', borderRadius, borderRadius, 0, 0, 1, width, borderRadius],
      ['V', height - borderRadius],
      ['A', borderRadius, borderRadius, 0, 0, 1, width - borderRadius, height],
      ['H', borderRadius],
      ['A', borderRadius, borderRadius, 0, 0, 1, 0, height - borderRadius],
      ['V', borderRadius],
      ['A', borderRadius, borderRadius, 0, 0, 1, borderRadius, 0]

    ]).addClass('bm-node-shape')
  }

  // 创建胶囊形状
  createRoundedRect (): Path {
    return new Path().plot('')
  }

  // 创建菱形
  createDiamond (): Polygon {
    return new Polygon().plot([])
  }

  // 创建平行四边形
  createParallelogram (): Polygon {
    return new Polygon().plot([])
  }

  // 创建八角矩形
  createOctagonalRect (): Polygon {
    return new Polygon().plot([])
  }

  // 创建外三角矩形
  createOuterTriangularRect (): Polygon {
    return new Polygon().plot([])
  }

  // 创建内三角矩形
  createInnerTriangularRect (): Polygon {
    return new Polygon().plot([])
  }

  // 创建椭圆
  createEllipse (): Path {
    return new Path().plot('')
  }

  // 创建圆
  createCircle (): Path {
    return new Path().plot('')
  }
}

export default Shape
