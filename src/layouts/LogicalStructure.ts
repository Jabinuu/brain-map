import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import type Render from '../render/Render'
import { traversal } from '../utils'
import Base from './Base'

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
  }

  // 计算节点的left、以及后代节点总height
  computeBasePosition (): void {
    if (this.brainMap.dataSource !== null) {
      traversal(this.brainMap.dataSource, true, null,
        (cur: DataSource, parent: DataSource | null, isRoot: boolean) => {
          const newNode = this.createNode(cur, parent, isRoot)
          if (newNode.isRoot) {
            newNode.left = 300
            newNode.top = this.brainMap.height / 2
          } else {
            console.log(parent)

            if (parent?.node != null) {
              newNode.left = parent.node.left + this.getMarginX() + parent.node.width
            }
          }
        }, () => {

        })
    }
  }

  // 计算top
  computeTopPosition (): void {

  }

  // 调整top
  adjustTopPosition (): void {

  }
}

export default LogicalStructure
