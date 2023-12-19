import type BrainMap from '../../index'
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
    if (this.shortcutMap[e.key]) {
      this.shortcutMap[e.key].forEach((fn: () => void) => {
        fn()
      })
    }
  }

  // 添加快捷键
  addShortcut (key: string, cb: () => void): void {
    // info：先实现单快捷键，后面写组合快捷键
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
