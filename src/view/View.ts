import type BrainMap from '../../index'

interface ViewOption {
  brainMap: BrainMap
}

// 视图类
class View {
  brainMap: BrainMap
  // 鼠标各个键有没有被按下
  isLeftMouseDown: boolean
  isMiddleMouseDown: boolean
  isRightMouseDown: boolean
  sx: number
  sy: number
  x: number
  y: number
  dx: number
  dy: number
  scale: number

  constructor (opt: ViewOption) {
    this.brainMap = opt.brainMap
    this.isLeftMouseDown = false
    this.isMiddleMouseDown = false
    this.isRightMouseDown = false
    // 开始拖动时的鼠标坐标
    this.sx = 0
    this.sy = 0
    // 总偏移量
    this.x = 0
    this.y = 0
    // 单次拖动的偏移量
    this.dx = 0
    this.dy = 0
    // 缩放比例
    this.scale = 1
    this.bindMoveDrawing()
  }

  bindMoveDrawing (): void {
    this.brainMap.el?.addEventListener('mousedown', (e) => {
      if (!(this.isLeftMouseDown || this.isMiddleMouseDown || this.isRightMouseDown)) {
        if (e.button === 0) {
          this.isLeftMouseDown = true
        } else if (e.button === 1) {
          this.isMiddleMouseDown = true
        } else if (e.button === 2) {
          this.isRightMouseDown = true
        }
        this.sx = e.clientX
        this.sy = e.clientY
      }
    })

    window.addEventListener('mousemove', (e) => {
      if (this.isLeftMouseDown || this.isMiddleMouseDown || this.isRightMouseDown) {
        this.dx = e.clientX - this.sx
        this.dy = e.clientY - this.sy
        this.moveDrawing(this.x + this.dx, this.y + this.dy)
      }
    })

    window.addEventListener('mouseup', () => {
      this.x += this.dx
      this.y += this.dy
      this.isLeftMouseDown = false
      this.isMiddleMouseDown = false
      this.isRightMouseDown = false
      this.resetStartPoint()
    })

    this.brainMap.el?.addEventListener('wheel', (e) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const lastScale = this.scale
      this.scale = Math.max(0.1, delta + this.scale)
      this.zoomDrawing(lastScale, e.clientX, e.clientY)
    })
  }

  moveDrawing (x: number, y: number): void {
    this.brainMap.drawing?.transform({
      origin: [0, 0],
      scale: this.scale,
      translate: [x, y]
    })
  }

  // 参数缩放中心坐标
  zoomDrawing (lastScale: number, cx: number, cy: number): void {
    // 缩放后的坐标平移量转换比率
    const transRatio = (1 - this.scale / lastScale)
    this.x += (cx - this.x) * transRatio
    this.y += (cy - this.y) * transRatio
    this.brainMap.drawing?.transform({
      origin: [0, 0],
      scale: this.scale,
      translate: [this.x, this.y]
    })
  }

  resetStartPoint (): void {
    this.sx = 0
    this.sy = 0
  }
}

export default View
