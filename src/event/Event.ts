import type BrainMap from '../../index'
import EventEmitter from 'eventemitter3'
import { throttle } from '../utils'

interface EventOption {
  brainMap: BrainMap
}

class Event extends EventEmitter {
  brainMap: BrainMap
  isLeftMouseDown: boolean
  isMiddleMouseDown: boolean
  isRightMouseDown: boolean

  constructor (opt: EventOption) {
    super()
    this.brainMap = opt.brainMap
    // 鼠标各个键有没有被按下
    this.isLeftMouseDown = false
    this.isMiddleMouseDown = false
    this.isRightMouseDown = false
    this.bindEvent()
  }

  // 绑定事件
  bindEvent (): void {
    this.brainMap.svg?.on('click', this.onClick.bind(this) as EventListener)
    this.brainMap.svg?.on('mousedown', this.onMousedown.bind(this) as EventListener)
    this.brainMap.svg?.on('mousemove', throttle(this.onMousemove.bind(this) as EventListener, 10))
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

  onClick (): void {
    this.brainMap.emit('draw_click')
  }

  onMousedown (e: MouseEvent): void {
    if (!(this.isLeftMouseDown || this.isMiddleMouseDown || this.isRightMouseDown)) {
      switch (e.button) {
        case 0:
          this.isLeftMouseDown = true
          break
        case 1:
          this.isMiddleMouseDown = true
          break
        case 2:
          this.isRightMouseDown = true
          break
      }
      this.emit('draw_mousedown', e, this)
    }
  }

  onMousemove (e: MouseEvent): void {
    this.emit('draw_mousemove', e, this)
    if (this.isRightMouseDown) {
      this.emit('drag', e, this)
    }
  }

  onMouseup (e: MouseEvent): void {
    this.onNodeMouseup(e)
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

  onNodeMouseup (e: MouseEvent): void {
    (e.target as HTMLElement).style.removeProperty('cursor')
    // this.isDragging = false
    this.isLeftMouseDown = false
    this.isMiddleMouseDown = false
    this.isRightMouseDown = false
  }
}

export default Event
