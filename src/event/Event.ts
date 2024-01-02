import type BrainMap from '../../index'
import EventEmitter from 'eventemitter3'

interface EventOption {
  brainMap: BrainMap
}

class Event extends EventEmitter {
  brainMap: BrainMap

  constructor (opt: EventOption) {
    super()
    this.brainMap = opt.brainMap

    this.bind()
  }

  // 绑定事件
  bind (): void {
    this.brainMap.el?.addEventListener('click', this.onClick.bind(this))
    this.brainMap.el?.addEventListener('mousedown', this.onMousedown.bind(this))
    this.brainMap.el?.addEventListener('mousemove', this.onMousemove.bind(this))
    window.addEventListener('mouseup', this.onMouseup.bind(this))
    this.brainMap.el?.addEventListener('wheel', this.onMousewheel.bind(this))
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('contextmenu', this.onContextMenu.bind(this))
  }

  onKeyDown (e: KeyboardEvent): void {
    if (['Tab', 'Enter', 'Delete'].includes(e.code)) {
      e.preventDefault()
    }
    this.emit('keydown', e)
  }

  onClick (e: MouseEvent): void {
    if (Array.prototype.includes.call((e.target as HTMLElement).classList, 'bm-svg-container')) {
      this.brainMap.renderer.clearActiveNodesList()
      this.brainMap.renderer.clearEditStatus()
    }
  }

  onMousedown (e: MouseEvent): void {
    // if (Array.prototype.includes.call((e.target as HTMLElement).classList, 'bm-svg-container')) {
    this.emit('mousedown', e)
    // }
  }

  onMousemove (e: MouseEvent): void {
    this.emit('mousemove', e)
  }

  onMouseup (e: MouseEvent): void {
    this.emit('mouseup', e)
  }

  onMousewheel (e: WheelEvent): void {
    this.emit('wheel', e)
  }

  onContextMenu (e: MouseEvent): void {
    // e.preventDefault()
    if (this.brainMap.view.isDragging) {
      e.preventDefault()
    } else {
      // 自定义上下文菜单
    }
    // mouseup事件在contextmenu之前
    this.brainMap.view.isDragging = false
  }
}

export default Event
