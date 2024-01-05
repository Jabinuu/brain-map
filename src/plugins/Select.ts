import { type Polygon } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type _Event from '../event/Event'
import { checkRectanglesPartialOverlap, traversal } from '../utils'
import { type DataSource } from '../..'

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

    const offsetX = Math.abs(this.startPt.x - this.movePt.x)
    const offsetY = Math.abs(this.startPt.y - this.movePt.y)
    // 在画布上画矩形
    this.rect?.plot([
      [this.startPt.x, this.startPt.y],
      [this.startPt.x, this.movePt.y],
      [this.movePt.x, this.movePt.y],
      [this.movePt.x, this.startPt.y]
    ])
    // 任意方向偏移量大于5认为是在拖动选取框
    if (offsetX >= 5 || offsetY >= 5) {
      this.brainMap.renderer.isSelecting = true
      this.checkNodeInSelect()
    }
  }

  onMouseup (): void {
    this.rect?.remove()
    this.isMousedown = false
    this.startPt.x = 0
    this.startPt.y = 0
    this.movePt.x = 0
    this.movePt.y = 0

    // 由于mouseup触发在click之前，需要将这个操作延时一下
    requestAnimationFrame(() => {
      this.brainMap.renderer.isSelecting = false
    })
  }

  // 检查节点是否在选取框内
  checkNodeInSelect (): void {
    if (!this.brainMap.drawing) {
      return
    }
    // 获取容器的transform数据
    const { translateX, translateY, scaleX, scaleY } = this.brainMap.drawing.transform()
    // 选取框边界
    const minx = Math.min(this.startPt.x, this.movePt.x)
    const miny = Math.min(this.startPt.y, this.movePt.y)
    const maxx = Math.max(this.startPt.x, this.movePt.x)
    const maxy = Math.max(this.startPt.y, this.movePt.y)

    if (this.brainMap.dataSource) {
      traversal(this.brainMap.dataSource, true, null, (cur) => {
        if (cur.node) {
          const { isActive, isExpand } = cur.node.getData() as DataSource
          let { top, left, width, height } = cur.node
          const right = (left + width) * (scaleX ?? 1) + (translateX ?? 0)
          const bottom = (top + height) * (scaleY ?? 1) + (translateY ?? 0)
          left = left * (scaleX ?? 1) + (translateX ?? 0)
          top = top * (scaleY ?? 1) + (translateY ?? 0)
          // 判断两矩形是否相交，若相交则激活节点
          if (checkRectanglesPartialOverlap(left, minx, top, miny, right, maxx, bottom, maxy)) {
            if (!isActive) {
              this.brainMap.renderer.addNodeToActiveList(cur.node)
            }
          } else if (isActive) {
            this.brainMap.renderer.removeNodeFromActiveList(cur.node)
          }
          if (!isExpand) {
            return true
          }
        }
        return false
      })
    }
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
