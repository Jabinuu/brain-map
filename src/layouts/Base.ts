import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import type Render from '../render/Render'
import Node from '../node/Node'
import { createUid } from '../utils'

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
    return 80
  }

  getMarginY (): number {
    return 50
  }
}

export default Base
