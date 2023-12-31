import type BrainMap from '../../index'
import { type DataSource, type Pair } from '../../index'
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
  manipulateNodeId: string // todo: 目前只支持单节点操作，后续更新为多个
  dataSource: DataSource
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
      EnumCommandName.SET_NODE_DATA,
      EnumCommandName.SET_NODE_TEXT,
      EnumCommandName.UNDO,
      EnumCommandName.REDO
    ]
  }

  // 执行命令
  exec <T1, T2>(cmdName: string, ...arg: Pair<T1, T2>): void {
    if (this.commandMap[cmdName]) {
      this.commandMap[cmdName].forEach((task: (...arg: Pair<T1, T2>) => void) => {
        task(...arg)
      })
      this.addHistory(cmdName, arg ? arg[0] as Node : null)
    }
  }

  // 注册命令
  addCommand <T1, T2>(cmdName: string, task: (...arg: Pair<T1, T2>) => void): void {
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
  addHistory (cmdName: string = '', node: Node | null = null): void {
    // 进入编辑状态和未修改文本内容 则不触发历史记录
    if (cmdName === EnumCommandName.SET_NODE_EDIT && (node?.getData('isEdit') || !node?.textChange)) return
    // 白名单过滤
    if (!this.filterList.includes(cmdName) && this.brainMap.dataSource) {
      const manipulateNodeId = node ? node.uid : ''
      const clone = cloneDataSource(this.brainMap.dataSource)
      if (clone && !Array.isArray(clone)) {
        this.history = this.history.slice(0, this.activeHistoryIndex + 1)
        this.history.push({
          dataSource: clone,
          manipulateNodeId
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
      const { dataSource } = this.history[this.activeHistoryIndex]
      const data = cloneDataSource(dataSource)
      return {
        dataSource: data,
        manipulateNodeId
      }
    }
  }

  // 重做
  redo (): HistoryItem | undefined {
    if (this.activeHistoryIndex + 1 < this.history.length) {
      // const { manipulateNodeId } = this.history[this.activeHistoryIndex]
      this.activeHistoryIndex++
      const { dataSource, manipulateNodeId } = this.history[this.activeHistoryIndex]
      const data = cloneDataSource(dataSource)
      return {
        dataSource: data,
        manipulateNodeId
      }
    }
  }
}

export default Command
