import { Path, Polyline } from '@svgdotjs/svg.js'
import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import { EnumLineShape } from '../constant/constant'
import type Node from '../node/Node'
import type Render from '../render/Render'
import { getStartPointOfLine, getNodeIndexOfChildrenList, traversal } from '../utils'
import Base from './Base'

export type PositionPair = [number, number]

class LogicalStructure extends Base {
  brainMap: BrainMap

  constructor (renderer: Render) {
    super(renderer)
    this.brainMap = renderer.brainMap
  }

  // 对所有节点进行定位
  doLayout (): void {
    this.computeBasePosition()
    this.computeTopPosition()
    this.adjustTopPosition()
  }

  // 计算节点的left、以及后代节点总height
  computeBasePosition (): void {
    if (this.brainMap.dataSource !== null) {
      traversal(
        this.brainMap.dataSource,
        true,
        null,
        (cur: DataSource, parent: DataSource | null, isRoot: boolean, layerIndex: number) => {
          const newNode = this.createNode(cur, parent, isRoot, layerIndex)
          if (newNode.isRoot) {
            newNode.left = 300
            newNode.top = 250
          } else {
            if (parent?.node != null) {
              const { width } = parent.node.getSizeWithoutBorderWidth()
              newNode.left = parent.node.left + this.getMarginX() + width
            }
          }
          return !cur.data.isExpand
        },
        (cur) => {
          if (cur.node) {
            cur.node.childrenAreaHeight = 0
            if (cur.data.isExpand && cur.children.length > 0) {
              const len = cur.node.children.length
              cur.node.childrenAreaHeight = cur.node.children.reduce((preVal: number, node: Node) => {
                const { height } = node.getSizeWithoutBorderWidth()
                return preVal + height
              }, 0) + (len - 1) * this.getMarginY()
            }
          }
        }
      )
    }
  }

  // 计算top
  computeTopPosition (): void {
    if (this.brainMap.dataSource != null) {
      traversal(
        this.brainMap.dataSource,
        true,
        null,
        (cur) => {
          const curNode = cur.node
          if (curNode?.getData('isExpand')) {
            const { height } = curNode.getSizeWithoutBorderWidth()
            const start = curNode.top + height / 2 - curNode.childrenAreaHeight / 2
            let tempTop = 0
            curNode.children.forEach((child: Node) => {
              child.top = start + tempTop
              const { height } = child.getSizeWithoutBorderWidth()
              tempTop += height + this.getMarginY()
            })
          }
          return !cur.node?.getData('isExpand')
        })
    }
  }

  // 调整top
  adjustTopPosition (): void {
    if (this.brainMap.dataSource != null) {
      traversal(
        this.brainMap.dataSource,
        true,
        null,
        (cur) => {
          if (cur.node) {
            if (!cur.node.getData('isExpand')) {
              return true
            }
            const { height } = cur.node.getSizeWithoutBorderWidth()
            const diffierence = cur.node.childrenAreaHeight - height

            if (diffierence > 0) {
              // 调整兄弟节点
              this.updateBrothersTop(cur.node, diffierence / 2)
            }
          }
          return false
        })
    }
  }

  // 调整子节点
  updateChildrenTop (cur: Node, offset: number): void {
    cur.children.forEach((child) => {
      child.top += offset
      this.updateChildrenTop(child, offset)
    })
  }

  // 调整兄弟节点
  updateBrothersTop (cur: Node, offset: number): void {
    const parent = cur.parent
    if (parent != null) {
      const curIndex = getNodeIndexOfChildrenList(cur, parent?.children)
      parent.children.forEach((item, index) => {
        let _offset = 0
        if (index < curIndex) {
          _offset = -offset
        } else if (index > curIndex) {
          _offset = offset
        }
        item.top += _offset
        this.updateChildrenTop(item, _offset)
      })
      // 向上递归遍历，调整父节点层的兄弟节点
      this.updateBrothersTop(parent, offset)
    }
  }

  // 渲染连线
  renderLine (node: Node): void {
    const lineShape = node.style.getStyle('lineStyle', true)
    if (lineShape === EnumLineShape.CURVE) {
      this.createCurveLine(node)
    } else if (lineShape === EnumLineShape.STRAIGHT) {
      this.createStraightLine(node)
    } else {
      this.createDirectLine(node)
    }
  }

  // 创建曲线
  createCurveLine (node: Node): void {
    const start = getStartPointOfLine(node)

    node.children.forEach((child) => {
      const { height } = child.getSizeWithoutBorderWidth()
      let end: PositionPair
      if (node.shape.shapeName === 'line' || child.shape.shapeName === 'line') {
        end = [child.left, child.top + height]
      } else {
        end = [child.left, child.top + (height - 0) / 2]
      }
      const pathArray = this.cubicBezierPath(start, end)
      const line = new Path().plot(pathArray)
      node.style.line(line)
      node.lines.push(line)
    })
  }

  // 创建直角折线
  createStraightLine (node: Node): void {
    const { width, height } = node.getSizeWithoutBorderWidth()
    const start: PositionPair = [width + node.left, height / 2 + node.top]
    node.children.forEach((child) => {
      const { height } = child.getSizeWithoutBorderWidth()
      const line = new Polyline()
      const end: PositionPair = [child.left, child.top + height / 2]
      const mid1: PositionPair = [(start[0] + end[0]) / 2, end[1]]
      const mid2: PositionPair = [mid1[0], start[1]]
      line.plot([start, mid2, mid1, end])
      node.style.line(line)
      node.lines.push(line)
    })
  }

  // 创建点到点直线
  createDirectLine (node: Node): void {
    const start = getStartPointOfLine(node)
    node.children.forEach((child) => {
      const { height } = child.getSizeWithoutBorderWidth()
      const line = new Polyline()
      const end: PositionPair = [child.left, child.top + height / 2]
      line.plot([start, end]).stroke({ width: 2, color: '#f06' })

      node.lines.push(line)
    })
  }
}

export default LogicalStructure
