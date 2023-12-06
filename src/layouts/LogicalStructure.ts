import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import type Node from '../node/Node'
import type Render from '../render/Render'
import { traversal } from '../utils'
import Base from './Base'

class LogicalStructure extends Base {
  brainMap: BrainMap

  constructor(renderer: Render) {
    super(renderer)
    this.brainMap = renderer.brainMap
  }

  // 对所有节点进行定位
  doLayout(): void {
    this.computeBasePosition()
    this.computeTopPosition()
    this.adjustTopPosition()
  }

  // 计算节点的left、以及后代节点总height
  computeBasePosition(): void {
    if (this.brainMap.dataSource !== null) {
      traversal(
        this.brainMap.dataSource,
        true,
        null,
        (cur: DataSource, parent: DataSource | null, isRoot: boolean) => {
          const newNode = this.createNode(cur, parent, isRoot)
          if (newNode.isRoot) {
            newNode.left = 300
            newNode.top = this.brainMap.height / 2
          } else {
            if (parent?.node != null) {
              newNode.left = parent.node.left + this.getMarginX() + parent.node.width
            }
          }
        },
        (cur, parent, isRoot) => {
          const len = parent.children.length
          parent.childrenAreaHeight = parent.children.reduce((preVal: number, node: Node) => {
            return preVal + node.height
          }, 0) + (len - 1) * this.getMarginY()
        }
      )
    }
  }

  // 计算top
  computeTopPosition(): void {
    if (this.brainMap.dataSource != null) {
      traversal(
        this.brainMap.dataSource,
        true,
        null,
        (cur) => {
          const curNode = cur.node
          if (curNode != null) {
            const start = curNode.top + curNode.height / 2 - curNode.childrenAreaHeight / 2 
            let tempTop = 0
            curNode.children.forEach((child: Node) => {
              child.top = start + tempTop
              tempTop += child.height + this.getMarginY()
            })
          }
        })
    }
  }

  // 调整top
  adjustTopPosition(): void {
    if (this.brainMap.dataSource != null) {
      traversal(
        this.brainMap.dataSource,
        true,
        null,
        (cur) => {
          if (cur.node != null) {
            const diffierence = cur.node.childrenAreaHeight - cur.node.height 
            if (diffierence > 0) {
              // 调整兄弟节点
              this.updateBrothersTop(cur.node, diffierence / 2)
            }
          }
        })
    }
  }

  // 调整子节点
  updateChildrenTop(cur: Node, offset: number): void {
    console.log(cur.nodeData?.data.text,offset);
    
    cur.children.forEach((child) => {
      child.top += offset
      this.updateChildrenTop(child, offset)
    })
  }

  // 调整兄弟节点
  updateBrothersTop(cur: Node, offset: number): void {
    const parent = cur.parent

    if (parent != null) {
      const curIndex = this.getNodeIndexOfChildrenList(cur, parent?.children)
      parent.children.forEach((item, index) => {
        let _offset = 0;
        if (index < curIndex) {
          _offset = -offset
        } else if(index>curIndex){
          _offset = offset
        }
        item.top += _offset
        this.updateChildrenTop(item, _offset)
      })
      // 向上递归遍历，调整父节点层的兄弟节点
      this.updateBrothersTop(parent, offset)
    }
  }

  getNodeIndexOfChildrenList(node: Node, childrenList: Node[]): number {
    return childrenList.findIndex((item) => item.uid === node.uid)
  }
}

export default LogicalStructure
