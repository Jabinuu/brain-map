import type BrainMap from '../..'

// 多选节点插件
class Select {
  brainMap: BrainMap
  // 选取框起始点坐标
  startPt: { x: number, y: number }
  // 选取框结束点坐标
  endPt: { x: number, y: number }

  constructor (opt: { brainMap: BrainMap }) {
    this.brainMap = opt.brainMap
    this.startPt = { x: 0, y: 0 }
    this.endPt = { x: 0, y: 0 }
  }

  // 思维导图容器绑定事件
  bindEvent (): void {
    this.brainMap.drawing?.on('mousedown', this.onMousedown.bind(this))
    this.brainMap.drawing?.on('mousemove', this.onMousemove.bind(this))
    this.brainMap.drawing?.on('mouseup', this.onMouseup.bind(this))
  }

  // 思维导图容器解绑事件
  unBindEvent (): void {
    this.brainMap.drawing?.off('mousedown', this.onMouseup.bind(this))
    this.brainMap.drawing?.off('mousemove', this.onMousemove.bind(this))
    this.brainMap.drawing?.off('mouseup', this.onMouseup.bind(this))
  }

  onMousedown (e: Event): void {
    this.startPt.x = (e as MouseEvent).clientX
    this.startPt.y = (e as MouseEvent).clientX
  }

  onMousemove (): void {

  }

  onMouseup (): void {
    this.startPt.x = 0
    this.startPt.y = 0
    this.endPt.x = 0
    this.endPt.y = 0
  }

  // 检查节点是否在选取框内
  checkNodeInSelect (): boolean {
    return false
  }
}

export default Select
