import type BrainMap from '../../index'
import { type DataSource } from '../../index'
import { EnumCommandName } from '../constant/constant'
import type Node from '../node/Node'
import { cloneDataSource } from '../utils'

interface CommandOption {
  brainMap: BrainMap
}

interface CommandMap {
  [prop: string]: any
  INSERT_CHILD_NODE?: Array<() => void>
  INSERT_SIBLING_NODE?: Array<() => void>
  DELETE_NODE?: Array<() => void>
}

export interface HistoryItem {
  cmdName: string
  // todo: 添加一个manipulateNodeId的姊妹属性，manipulateNodeId负责记录undo时的激活节点id，后者负责记录redo时的激活节点id，两者都需要在addHistory中添加到历史
  manipulateNodeId: string[]
  dataSource: DataSource
  insertSiblingIndex: number
}

// 命令类: 将修改数据源的操作通过调用命令来实现，并记录修改历史，从而实现撤销和重做
class Command {
  brainMap: BrainMap
  commandMap: CommandMap
  history: HistoryItem[]
  filterList: string[]
  activeHistoryIndex: number

  constructor (opt: CommandOption) {
    this.brainMap = opt.brainMap
    this.commandMap = {}
    this.history = []
    this.activeHistoryIndex = 0
    this.filterList = [
      EnumCommandName.SET_NODE_ACTIVE,
      EnumCommandName.CLEAR_ACTIVE_NODE,
      EnumCommandName.SET_NODE_DATA,
      EnumCommandName.SET_NODE_TEXT,
      EnumCommandName.UNDO,
      EnumCommandName.REDO
    ]
  }

  // 执行命令
  exec (cmdName: string, args?: any): void {
    if (this.commandMap[cmdName]) {
      this.commandMap[cmdName].forEach((task: (...args: any) => void) => {
        task(...args)
      })
      this.addHistory(cmdName, args.length ? args[0] : null)
    }
  }

  // 注册命令
  addCommand (cmdName: string, task: () => void): void {
    if (this.commandMap[cmdName]) {
      this.commandMap[cmdName].push(task)
    } else {
      this.commandMap[cmdName] = [task]
    }
  }

  // 移除命令
  removeCommand (): void {

  }

  // 添加操作历史记录
  addHistory (cmdName: string = '', manipulateNode: Node[] | null = null): void {
    // 进入编辑状态和未修改文本内容 则不触发历史记录
    if (cmdName === EnumCommandName.SET_NODE_EDIT && manipulateNode &&
    (manipulateNode[0].getData('isEdit') || !manipulateNode[0].textChange)) {
      return
    }

    // 白名单过滤
    if (!this.filterList.includes(cmdName) && this.brainMap.dataSource) {
      let insertSiblingIndex = -1
      const manipulateNodeId: string[] = []

      if (cmdName === EnumCommandName.INSERT_SIBLING_NODE && manipulateNode) {
        const [node] = manipulateNode
        if (node.parent) {
          insertSiblingIndex = node.parent.children.findIndex((item) => item === node) + 1
        }
      }

      if (cmdName === EnumCommandName.SET_NODE_EXPAND && manipulateNode && manipulateNode.length > 1) {
        const root = this.brainMap.root
        const hasRootNode = manipulateNode.includes(root as Node)

        if (root && hasRootNode) {
          manipulateNode.length = 0
          root.children.forEach((item) => {
            manipulateNode?.push(item)
          })
        } else if (!hasRootNode) {
          manipulateNode = this.brainMap.renderer.getParentNodeFromActiveList(manipulateNode)
        }
      }

      if (cmdName === EnumCommandName.DELETE_NODE && manipulateNode && manipulateNode.length > 1) {
        manipulateNode = this.brainMap.renderer.getParentNodeFromActiveList(manipulateNode)
      }

      manipulateNode?.forEach((node) => {
        manipulateNodeId.push(node.uid)
      })
      const clone = cloneDataSource(this.brainMap.dataSource)

      if (clone && !Array.isArray(clone)) {
        this.history = this.history.slice(0, this.activeHistoryIndex + 1)
        this.history.push({
          cmdName,
          dataSource: clone,
          manipulateNodeId,
          insertSiblingIndex
        })
        this.activeHistoryIndex = this.history.length - 1
      }
    }
  }

  // 回退
  undo (): HistoryItem | undefined {
    if (this.activeHistoryIndex - 1 >= 0) {
      const { manipulateNodeId } = this.history[this.activeHistoryIndex]
      this.activeHistoryIndex--
      const {
        dataSource,
        cmdName,
        insertSiblingIndex
      } = this.history[this.activeHistoryIndex]

      const data = cloneDataSource(dataSource)

      return {
        cmdName,
        dataSource: data,
        manipulateNodeId,
        insertSiblingIndex
      }
    }
  }

  // 重做
  redo (): { historyItem: HistoryItem, lastDataSource: DataSource | undefined } | undefined {
    if (this.activeHistoryIndex + 1 < this.history.length) {
      let lastDataSource
      this.activeHistoryIndex++
      const {
        dataSource,
        manipulateNodeId,
        cmdName,
        insertSiblingIndex
      } = this.history[this.activeHistoryIndex]

      if (this.activeHistoryIndex - 1 >= 0) {
        lastDataSource = this.history[this.activeHistoryIndex - 1].dataSource
        lastDataSource = cloneDataSource(lastDataSource)
      }
      const data = cloneDataSource(dataSource)
      return {
        historyItem: {
          cmdName,
          dataSource: data,
          manipulateNodeId,
          insertSiblingIndex
        },
        lastDataSource
      }
    }
  }
}

export default Command
