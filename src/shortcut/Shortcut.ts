import type BrainMap from '../../index'
import { EnumShortcutName } from '../constant/constant'
interface ShortcutOption {
  brainMap: BrainMap
}

interface ShortCutMap {
  [prop: string]: any
  Tab?: Array<() => void>
  Enter?: Array<() => void>
}

// 快捷键类
class Shortcut {
  brainMap: BrainMap
  shortcutMap: ShortCutMap

  constructor (opt: ShortcutOption) {
    this.brainMap = opt.brainMap
    this.shortcutMap = {}
  }

  // 绑定快捷键事件
  onShortcutKeyDown (e: KeyboardEvent): void {
    let keyName = e.key
    // 检查是否有组合按键
    if (e.ctrlKey) {
      keyName = `${EnumShortcutName.CTRL}|${e.key}`
    } else if (e.shiftKey) {
      keyName = `${EnumShortcutName.SHIFT}|${e.key}`
    } else if (e.altKey) {
      keyName = `${EnumShortcutName.ALT}|${e.key}`
    }

    if (this.shortcutMap[keyName]) {
      this.shortcutMap[keyName].forEach((fn: () => void) => {
        fn()
      })
    }
  }

  // 添加快捷键
  addShortcut (key: string, cb: () => void): void {
    if (this.shortcutMap[key]) {
      this.shortcutMap[key].push(cb)
    } else {
      this.shortcutMap[key] = [cb]
    }
  }

  // 移除快捷键
  removeShortcut (key: string, fn?: () => void): void {
    if (!fn) {
      this.shortcutMap[key].length = 0
    } else {
      this.shortcutMap[key] = this.shortcutMap[key].filter((item: () => void) => {
        return item !== fn
      })
    }
  }
}

export default Shortcut
