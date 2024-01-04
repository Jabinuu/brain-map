import { type DataSource } from '../../index'
import { type PositionPair } from '../layouts/LogicalStructure'
import type Node from '../node/Node'
import { v4 as uuidv4 } from 'uuid'

type PreCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean) => boolean)
type PostCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean) => void)

// dfs遍历数据源（渲染树）
export function traversal (
  root: DataSource,
  isRoot: boolean,
  parent: DataSource | null,
  preCallback?: PreCallback,
  postCallback?: PostCallback
): void {
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
    postCallback(root, parent, isRoot)
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

// 全选节点内文本
export function selectAllText (div: HTMLElement | undefined): void {
  if (div) {
    const range = document.createRange()
    range.selectNodeContents(div)
    const selection = window.getSelection()

    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

// 判断是否是对象
export function isObject (obj: unknown): boolean {
  const _type = typeof obj
  if ((obj !== null && _type === 'object') || _type === 'function') {
    return true
  }
  return false
}

// 由于属性值均为普通类型，无函数，无循环引用，先用简陋的深拷贝
export function simpleDeepClone (source: unknown): any {
  return JSON.parse(JSON.stringify(source))
}

// 深拷贝数据源，注意仅拷贝data和children字段，node字段不拷贝！
export function cloneDataSource (dataSource: DataSource, newDataSourece: any = {}): DataSource {
  newDataSourece.data = simpleDeepClone(dataSource.data)
  // 存在历史记录里的数据源全部设置为未激活
  newDataSourece.data.isActive = false
  newDataSourece.children = []
  dataSource.children.forEach((child, index) => {
    newDataSourece.children[index] = cloneDataSource(child)
  })
  return newDataSourece
}

// 判断两个矩形是否部分重叠
export function checkRectanglesPartialOverlap (
  minx1: number,
  minx2: number,
  miny1: number,
  miny2: number,
  maxx1: number,
  maxx2: number,
  maxy1: number,
  maxy2: number
): boolean {
  return maxx1 > minx2 && minx1 < maxx2 && miny1 < maxy2 && maxy1 > miny2
}
