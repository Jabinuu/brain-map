import type BrainMap from '../..'
import type Node from '../node/Node'

// 样式类
class Style {
  node: Node
  brainMap: BrainMap

  constructor (ctx: Node) {
    this.node = ctx
    this.brainMap = ctx.brainMap
  }

  // 使用样式
  useStyle (prop: string): unknown {
    const themeConfig = this.brainMap.themeConfig

    if (themeConfig) {
      let defaultStyle = themeConfig.node
      if (this.node.layerIndex === 0) {
        defaultStyle = themeConfig.root
      } else if (this.node.layerIndex === 1) {
        defaultStyle = themeConfig.second
      }
      const selfStyle = this.getSelfStyle(prop)
      return selfStyle === undefined ? defaultStyle[prop] : selfStyle
    }
  }

  // 获取某个样式值
  getStyle (prop: string): unknown {
    return this.useStyle(prop)
  }

  // 获取node的某个独立样式值
  getSelfStyle (prop: string): unknown {
    return this.node.getData(prop)
  }

  // 给节点的形状设置样式
  shape (node: Node): void {
    node.shapeElem
      ?.fill(this.useStyle('fillColor') as string)
      .stroke({
        width: this.useStyle('borderWidth') as number,
        color: this.useStyle('borderColor') as string
      })
  }

  // 给节点的文字元素设置样式
  text (contentDiv: HTMLElement): void {
    contentDiv.style.fontFamily = this.useStyle('fontFamily') as string
    contentDiv.style.fontSize = `${this.useStyle('fontSize') as number}px`
    contentDiv.style.fontWeight = this.useStyle('fontWeight') as string
    contentDiv.style.fontStyle = this.useStyle('fontStyle') as string
    contentDiv.style.textDecoration = this.useStyle('textDecoration') as string
  }

  // 给展开收起按钮设置样式
  expandBtn (): void {

  }

  // 给连线设置样式
  line (): void {

  }
}

export default Style
