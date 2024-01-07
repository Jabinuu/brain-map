import { type DataSource } from '../../index'
import { type PositionPair } from '../layouts/LogicalStructure'
import type Node from '../node/Node'
import { v4 as uuidv4 } from 'uuid'
import { type Rectangle } from '../render/Render'

type PreCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean, layerIndex: number) => boolean)
type PostCallback = ((cur: DataSource, parent: DataSource | null, isRoot: boolean) => void)

// dfs遍历数据源（渲染树）
export function traversal (
  root: DataSource,
  isRoot: boolean,
  parent: DataSource | null,
  preCallback?: PreCallback,
  postCallback?: PostCallback,
  _layerIndex: number = 0
): void {
  let stop = false
  if (preCallback) {
    stop = preCallback(root, parent, isRoot, _layerIndex)
  }

  if (!stop) {
    root.children.forEach((child: DataSource) => {
      traversal(child, false, root, preCallback, postCallback, _layerIndex + 1)
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

// 获取多个矩形的最小包含矩形boundingbox
export function getBoundingBox (rectangles: Rectangle[]): Rectangle {
  let _x1 = Infinity
  let _y1 = Infinity
  let _x2 = -Infinity
  let _y2 = -Infinity

  rectangles.forEach(rectangle => {
    const x1 = rectangle.left
    const y1 = rectangle.top
    const x2 = rectangle.left + rectangle.width
    const y2 = rectangle.top + rectangle.height

    _x1 = Math.min(_x1, x2, x1)
    _y1 = Math.min(_y1, y2, y1)
    _x2 = Math.max(x1, _x2, x2)
    _y2 = Math.max(y1, _y2, y2)
  })

  return {
    left: _x1 - 4.5,
    top: _y1 - 4.5,
    width: _x2 - _x1 + 7,
    height: _y2 - _y1 + 7
  }
}

export function isInfinity (val: number): boolean {
  return Math.abs(val) === Infinity
}

// 获取后代节点个数
export function getNumberOfAllChildren (node: Node): number {
  let cnt = -1
  if (node.nodeData) {
    traversal(node.nodeData, false, null, () => {
      cnt++
      return false
    })
  }
  return cnt
}

// 获取数组位数
export function getDigitCount (number: number): number {
  // 使用数学方法计算数字的位数
  return Math.floor(Math.log10(Math.abs(number)) + 1)
}

// 角度转弧度
export function degreesToRadians (drgee: number): number {
  return drgee * (Math.PI / 180)
}
