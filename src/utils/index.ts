import { type DataSource } from '../../index'
import { type PositionPair } from '../layouts/LogicalStructure'
import type Node from '../node/Node'
import { v4 as uuidv4 } from 'uuid'
type PreCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean) => boolean)
type PostCallback = ((cur: Node, parent: Node, isRoot: boolean) => void)

// dfs遍历数据源（渲染树）
export function traversal (root: DataSource, isRoot: boolean, parent: DataSource | null, preCallback?: PreCallback, postCallback?: PostCallback): void {
  let stop = false
  if (preCallback) {
    stop = preCallback(root, parent, isRoot)
  }

  if (!stop) {
    root.children.forEach((child: DataSource) => {
      traversal(child, false, root, preCallback, postCallback)
    })
  }

  if (postCallback) {
    // 后序遍历收集子树总高度
    if (root.node != null && parent?.node != null) {
      postCallback(root.node, parent.node, isRoot)
    }
  }
}

// 创建节点uid
export function createUid (): string {
  return uuidv4()
}

// 拿uid在孩子节点数组中匹配对应的index
export function getNodeIndexOfChildrenList (node: Node, childrenList: Node[]): number {
  return childrenList.findIndex((item) => item.uid === node.uid)
}

// 获得连线的起点坐标
export function getStartPointOfLine (root: Node): PositionPair {
  const { height, width } = root.getSizeWithoutBorderWidth()
  return root.isRoot
    ? [width / 2 + root.left, height / 2 + root.top]
    : [width + root.left, height / 2 + root.top]
}
