import { type DataSource } from '../../index'

type PreCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean) => void) | undefined

// dfs遍历数据源（渲染树）
export function traversal (root: DataSource, isRoot: boolean, parent: DataSource | null, preCallback: PreCallback, postCallback: PreCallback): void {
  (preCallback != null) && preCallback(root, parent, isRoot)
  root.children.forEach((child: DataSource) => {
    traversal(child, false, root, preCallback, postCallback)
  })
  if (postCallback != null) {
    // 后序遍历收集子树总高度
    postCallback(root, parent, isRoot)
  }
}
