import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import type Render from '../render/Render'
import Node from '../node/Node'
import { createUid } from '../utils'
import { PathArray } from '@svgdotjs/svg.js'
import { type PositionPair } from './LogicalStructure'

class Base {
  brainMap: BrainMap
  renderer: Render

  constructor (renderer: Render) {
    this.renderer = renderer
    this.brainMap = renderer.brainMap
  }

  // 创建节点实例
  createNode (data: DataSource, parent: DataSource | null, isRoot: boolean): Node {
    const uid = createUid()
    const newNode = new Node({
      data,
      brainMap: this.brainMap,
      isRoot,
      uid
    })
    // 将节点实例挂载到数据源下
    data.node = newNode
    if (isRoot) {
      this.brainMap.root = newNode
    } else {
      // 认亲大会
      parent?.node?.children.push(newNode)
      newNode.parent = parent?.node ?? null
    }
    return newNode
  }

  getMarginX (): number {
    return 50
  }

  getMarginY (): number {
    return 50
  }

  // 三次贝塞尔曲线
  cubicBezierPath (start: PositionPair, end: PositionPair): PathArray {
    const ctrl1 = [start[0] + (end[0] - start[0]) / 2, start[1]]
    const ctrl2 = [ctrl1[0], end[1]]
    return new PathArray([
      ['M', start[0], start[1]],
      ['C', ctrl1[0], ctrl1[1], ctrl2[0], ctrl2[1], end[0], end[1]]
    ])
  }
}

export default Base
