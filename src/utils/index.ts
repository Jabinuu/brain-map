import { type DataSource } from '../../index'
import type Node from '../node/Node'
import { v4 as uuidv4 } from 'uuid'

type PreCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean) => void)
type PostCallback = ((cur: Node, parent: Node, isRoot: boolean) => void)

// dfs遍历数据源（渲染树）
export function traversal (root: DataSource, isRoot: boolean, parent: DataSource | null, preCallback?: PreCallback, postCallback?: PostCallback): void {
  (preCallback != null) && preCallback(root, parent, isRoot)

  root.children.forEach((child: DataSource) => {
    traversal(child, false, root, preCallback, postCallback)
  })

  if (postCallback != null) {
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
