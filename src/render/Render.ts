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
    // 布局的过程中已经创建了所有Node实例并计算好了定位属性值
    this.layout?.doLayout()
    // 将所有Node实例渲染到画布上
    this.brainMap.root?.render()
  }
}

export default Render
