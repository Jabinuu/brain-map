import { type Polygon } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type _Event from '../event/Event'

// 节点选择框插件
class Select {
  brainMap: BrainMap
  // 选取框起始点坐标
  startPt: { x: number, y: number }
  // 选取框移动点坐标
  movePt: { x: number, y: number }
  // 鼠标是否按下
  isMousedown: boolean
  // 选择框矩形
  rect: Polygon | null

  constructor (opt: { brainMap: BrainMap }) {
    this.brainMap = opt.brainMap
    this.startPt = { x: 0, y: 0 }
    this.movePt = { x: 0, y: 0 }
    this.isMousedown = false
    this.rect = null

    this.bindEvent()
  }

  // 思维导图容器绑定事件
  bindEvent (): void {
    this.brainMap.on('mousedown', this.onMousedown.bind(this))
    this.brainMap.on('mousemove', this.onMousemove.bind(this))
    this.brainMap.on('mouseup', this.onMouseup.bind(this))
  }

  // 思维导图容器解绑事件
  unBindEvent (): void {
    this.brainMap.off('mousedown', this.onMouseup.bind(this))
    this.brainMap.off('mousemove', this.onMousemove.bind(this))
    this.brainMap.off('mouseup', this.onMouseup.bind(this))
  }

  onMousedown (e: MouseEvent, event: _Event): void {
    if (event.isLeftMouseDown) {
      this.isMousedown = true
      const { x, y } = this.brainMap.toRelativePos(e.clientX, e.clientY)
      this.startPt.x = x
      this.startPt.y = y
      this.createRect()
    }
  }

  onMousemove (e: MouseEvent, event: _Event): void {
    if (!this.isMousedown) return

    const { x, y } = this.brainMap.toRelativePos(e.clientX, e.clientY)
    this.movePt.x = x
    this.movePt.y = y

    // 在画布上画矩形
    this.rect?.plot([
      [this.startPt.x, this.startPt.y],
      [this.startPt.x, this.movePt.y],
      [this.movePt.x, this.movePt.y],
      [this.movePt.x, this.startPt.y]
    ])
    this.checkNodeInSelect()
  }

  onMouseup (): void {
    this.rect?.remove()
    this.isMousedown = false
    this.startPt.x = 0
    this.startPt.y = 0
    this.movePt.x = 0
    this.movePt.y = 0
  }

  // 检查节点是否在选取框内
  checkNodeInSelect (): boolean {
    return false
  }

  createRect (): void {
    if (this.rect) this.rect.remove()
    if (!this.brainMap.svg) return
    this.rect = this.brainMap.svg
      .polygon([this.startPt.x, this.startPt.y])
      .fill({ color: 'rgba(9,132,227,0.15)' })
      .stroke({ color: '#0984e3' })
  }
}

export default Select
