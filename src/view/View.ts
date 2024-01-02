import type BrainMap from '../../index'
import type Event from '../event/Event'

interface ViewOption {
  brainMap: BrainMap
}

interface positionPair {
  x: number
  y: number
}

// 视图类
class View {
  brainMap: BrainMap

  dragPosition: positionPair
  startOffset: positionPair
  curOffset: positionPair
  scale: number
  isDragging: boolean

  constructor (opt: ViewOption) {
    this.brainMap = opt.brainMap

    // 拖动点坐标
    this.dragPosition = {
      x: 0,
      y: 0
    }
    // 思维导图拖动前的坐标
    this.startOffset = {
      x: 0,
      y: 0
    }
    // 当前偏移量
    this.curOffset = {
      x: 0,
      y: 0
    }
    // 缩放比例
    this.scale = 1
    // 是否正在拖动
    this.isDragging = false

    this.bindEvent()
  }

  // 绑定事件
  bindEvent (): void {
    this.brainMap.on('mousedown', this.onDragDrawingMousedown.bind(this))
    this.brainMap.on('drag', this.onDragDrawingMousemove.bind(this))
    this.brainMap.on('mouseup', this.onDragDrawingMouseup.bind(this))
    this.brainMap.on('wheel', this.zoomDrawing.bind(this))
  }

  // 拖动思维导图前鼠标点击
  onDragDrawingMousedown (e: MouseEvent, event: Event): void {
    if (event.isRightMouseDown) {
      this.dragPosition.x = e.clientX
      this.dragPosition.y = e.clientY
      this.startOffset.x = this.curOffset.x
      this.startOffset.y = this.curOffset.y
    }
  }

  // 拖动思维导图过程中
  onDragDrawingMousemove (e: MouseEvent, event: Event): void {
    if (event.isRightMouseDown) {
      // 减少触发浏览器重绘
      if (!this.isDragging) {
        (e.target as HTMLElement).style.cursor = 'grabbing'
      }
      this.isDragging = true
      const dx = e.clientX - this.dragPosition.x
      const dy = e.clientY - this.dragPosition.y
      this.curOffset.x = this.startOffset.x + dx
      this.curOffset.y = this.startOffset.y + dy

      this.transform()
    }
  }

  // 拖动思维导图结束后抬起鼠标
  onDragDrawingMouseup (e: MouseEvent): void {
  }

  // 缩放思维导图容器
  zoomDrawing (e: WheelEvent): void {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const lastScale = this.scale
    this.scale = Math.max(0.1, delta + this.scale)
    // 缩放后的坐标平移量转换比率
    const transRatio = (1 - this.scale / lastScale)
    this.curOffset.x += (e.clientX - this.curOffset.x) * transRatio
    this.curOffset.y += (e.clientY - this.curOffset.y) * transRatio
    this.transform()
  }

  // 执行变换
  transform (): void {
    this.brainMap.drawing?.transform({
      origin: [0, 0],
      scale: this.scale,
      translate: [this.curOffset.x, this.curOffset.y]
    })
  }
}

export default View
