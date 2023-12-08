import type BrainMap from '../../index'

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
  isLeftMouseDown: boolean
  isMiddleMouseDown: boolean
  isRightMouseDown: boolean
  dragPosition: positionPair
  startOffset: positionPair
  curOffset: positionPair
  scale: number

  constructor (opt: ViewOption) {
    this.brainMap = opt.brainMap
    // 鼠标各个键有没有被按下
    this.isLeftMouseDown = false
    this.isMiddleMouseDown = false
    this.isRightMouseDown = false
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
  }

  // 拖动思维导图前鼠标点击
  onDragDrawingMousedown (e: MouseEvent): void {
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
      this.dragPosition.x = e.clientX
      this.dragPosition.y = e.clientY
      this.startOffset.x = this.curOffset.x
      this.startOffset.y = this.curOffset.y
    }
  }

  // 拖动思维导图过程中
  onDragDrawingMousemove (e: MouseEvent): void {
    if (this.isLeftMouseDown || this.isMiddleMouseDown || this.isRightMouseDown) {
      const dx = e.clientX - this.dragPosition.x
      const dy = e.clientY - this.dragPosition.y
      this.curOffset.x = this.startOffset.x + dx
      this.curOffset.y = this.startOffset.y + dy

      this.transform()
    }
  }

  // 拖动思维导图结束后抬起鼠标
  onDragDrawingMouseup (): void {
    this.isLeftMouseDown = false
    this.isMiddleMouseDown = false
    this.isRightMouseDown = false
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
