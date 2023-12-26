import type BrainMap from '../../index'
import { type DataSource, type Pair } from '../../index'
import { EnumCommandName } from '../constant/constant'
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

// 命令类: 将修改数据源的操作通过调用命令来实现，并记录修改历史，从而实现撤销和重做
class Command {
  brainMap: BrainMap
  commandMap: CommandMap
  history: DataSource[]
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
      EnumCommandName.BACK,
      EnumCommandName.REDO
    ]
  }

  // 执行命令
  exec <T1, T2>(cmdName: string, ...arg: Pair<T1, T2>): void {
    if (this.commandMap[cmdName]) {
      this.commandMap[cmdName].forEach((task: (...arg: Pair<T1, T2>) => void) => {
        task(...arg)
      })

      this.addHistory(cmdName)
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
  addHistory (cmdName: string = ''): void {
    if (!this.filterList.includes(cmdName) && this.brainMap.dataSource) {
      // 需要保存拷贝的值

      const clone = cloneDataSource(this.brainMap.dataSource)
      console.log(clone)

      if (clone && !Array.isArray(clone)) {
        this.history = this.history.slice(0, this.activeHistoryIndex + 1)
        this.history.push(clone)
        this.activeHistoryIndex = this.history.length - 1
      }
      console.log(111)
    }
  }

  // 回退
  back (): DataSource | undefined {
    if (this.activeHistoryIndex - 1 >= 0) {
      this.activeHistoryIndex--
      const data = cloneDataSource(this.history[this.activeHistoryIndex])
      return data
    }
  }

  // 重做
  redo (): DataSource | undefined {
    if (this.activeHistoryIndex + 1 < this.history.length) {
      this.activeHistoryIndex++
      const data = cloneDataSource(this.history[this.activeHistoryIndex])
      return data
    }
  }
}

export default Command
