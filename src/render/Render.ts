import type BrainMap from '../..'
import LogicalStructure from '../layouts/LogicalStructure'
import { CONSTANT } from '../constant/constant'
interface RenderOption {
  brainMap: BrainMap
}

type Layout = LogicalStructure

const layouts = {
  [CONSTANT.LAYOUTS.LOGICAL_STRUCTURE]: LogicalStructure
}

// 渲染类，负责渲染相关
class Render {
  brainMap: BrainMap
  layout: Layout | null

  constructor (opt: RenderOption) {
    this.brainMap = opt.brainMap
    this.layout = null

    // 设置布局
    this.setLayout()
  }

  setLayout (): void {
    this.layout = new (layouts[this.brainMap.layout] ?? layouts[CONSTANT.LAYOUTS.LOGICAL_STRUCTURE])(this)
  }

  // 渲染器
  render (): void {
    this.layout?.doLayout()
    this.brainMap.root?.render()
  }
}

export default Render
