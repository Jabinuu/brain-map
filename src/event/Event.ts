import type BrainMap from '../../index'
import type Render from '../render/Render'
import type Shortcut from '../shortcut/Shortcut'
import type View from '../view/View'

interface EventOption {
  brainMap: BrainMap
  renderer: Render
  view: View
  shortcut: Shortcut
}

class Event {
  brainMap: BrainMap
  view: View
  renderer: Render
  shortcut: Shortcut

  constructor (opt: EventOption) {
    this.brainMap = opt.brainMap
    this.view = opt.view
    this.renderer = opt.renderer
    this.shortcut = opt.shortcut

    this.bind()
  }

  // 绑定事件
  bind (): void {
    this.brainMap.el?.addEventListener('click', this.onClick.bind(this))
    this.brainMap.el?.addEventListener('mousedown', this.onMousedown.bind(this))
    window.addEventListener('mousemove', this.onMousemove.bind(this))
    window.addEventListener('mouseup', this.onMouseup.bind(this))
    this.brainMap.el?.addEventListener('wheel', this.onMousewheel.bind(this))
    window.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown (e: KeyboardEvent): void {
    this.shortcut.onShortcutKeyDown(e)
  }

  onClick (e: MouseEvent): void {
    if (Array.prototype.includes.call((e.target as HTMLElement).classList, 'bm-svg-container')) {
      this.renderer.clearActiveNodesList()
      this.renderer.clearEditStatus()
    }
  }

  onMousedown (e: MouseEvent): void {
    this.view.onDragDrawingMousedown(e)
  }

  onMousemove (e: MouseEvent): void {
    this.view.onDragDrawingMousemove(e)
  }

  onMouseup (): void {
    this.view.onDragDrawingMouseup()
  }

  onMousewheel (e: WheelEvent): void {
    this.view.zoomDrawing(e)
  }
}

export default Event
