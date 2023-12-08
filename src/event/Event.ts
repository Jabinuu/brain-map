import type BrainMap from '../../index'
import type View from '../view/View'

interface EventOption {
  brainMap: BrainMap
  view: View
}

class Event {
  brainMap: BrainMap
  view: View
  constructor (opt: EventOption) {
    this.brainMap = opt.brainMap
    this.view = opt.view

    this.bind()
  }

  // 绑定事件
  bind (): void {
    this.brainMap.el?.addEventListener('mousedown', this.onMousedown.bind(this))
    window.addEventListener('mousemove', this.onMousemove.bind(this))
    window.addEventListener('mouseup', this.onMouseup.bind(this))
    this.brainMap.el?.addEventListener('wheel', this.onMousewheel.bind(this))
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
