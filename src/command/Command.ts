import type BrainMap from '../../index'
interface CommandOption {
  brainMap: BrainMap
}

interface CommandMap {
  [prop: string]: any
  INSERT_CHILD_NODE?: Array<() => void>
  INSERT_SIBLING_NODE?: Array<() => void>
}

class Command {
  brainMap: BrainMap
  commandMap: CommandMap

  constructor (opt: CommandOption) {
    this.brainMap = opt.brainMap
    this.commandMap = {}
  }

  // 执行命令
  exec (cmdName: string): void {
    if (this.commandMap[cmdName]) {
      this.commandMap[cmdName].forEach((task: () => void) => {
        task()
      })
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
}

export default Command
