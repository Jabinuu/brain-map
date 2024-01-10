import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import type Render from '../render/Render'
import Node from '../node/Node'
import { createUid } from '../utils'
import { PathArray } from '@svgdotjs/svg.js'
import { type PositionPair } from './LogicalStructure'
import LruCache from '../utils/LruCache'

// 思维导图布局基类
class Base {
  brainMap: BrainMap
  renderer: Render
  lruCache: LruCache

  constructor (renderer: Render) {
    this.renderer = renderer
    this.brainMap = renderer.brainMap
    this.lruCache = new LruCache(1000)
  }

  // 创建节点实例
  createNode (
    data: DataSource,
    parent: DataSource | null,
    isRoot: boolean,
    layerIndex: number
  ): Node {
    let newNode: Node

    if (data.node) {
      // 如果数据源上已有节点实例的引用，则直接拿来复用
      newNode = data.node
      newNode.reset()
      // 保持与历史记录中的数据拷贝值的相同引用
      newNode.nodeData = data

      if (data.data.uid) {
        this.cacheNode(data.data.uid, newNode)
      }
    } else if (data.data.uid && this.lruCache.has(data.data.uid)) {
      // 如果数据源上没有节点实例引用，但缓冲池中有该节点，则也可复用。主要是前进后退命令
      newNode = this.lruCache.get(data.data.uid) as Node
      newNode.reset()

      // 如果节点数据源有变化，相较于缓存有变化,则要重新创建节点内容
      const cacheNodeData = JSON.stringify(newNode.getData())
      const curNodeData = JSON.stringify(data.data)
      const isDataChange = curNodeData !== cacheNodeData

      // 更新节点内容之前,赋新值并且保持了相同引用
      newNode.nodeData = data

      if (this.renderer.resizeRecord && this.renderer.resizeRecord.uid === newNode.uid) {
        newNode.getSize(true)
        newNode.needLayout = true
        this.renderer.resizeRecord = null
      } else if (isDataChange) {
        newNode.getSize()
        newNode.needLayout = true
      }

      // 将节点实例挂载到数据源下
      data.node = newNode
      this.cacheNode(data.data.uid, newNode)
    } else {
      // 没有可复用的节点实例，则创建新的节点实例
      const uid = data.data.uid ?? createUid()

      newNode = new Node({
        data,
        brainMap: this.brainMap,
        isRoot,
        uid,
        layerIndex
      })
      // 将节点实例挂载到数据源下
      data.node = newNode

      // 保持数据的相同引用
      newNode.nodeData = data

      data.data.uid = uid
      this.cacheNode(data.data.uid, newNode)
    }

    // 若节点为激活节点，则添加到激活节点数组中
    if (data.data.isActive) {
      this.renderer.addNodeToActiveList(newNode)
    }

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
    return 20
  }

  cacheNode (uid: string, node: Node): void {
    this.renderer.renderCache[uid] = node
    this.lruCache.add(uid, node)
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
