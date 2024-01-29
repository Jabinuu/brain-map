import { type Polyline, type Path } from '@svgdotjs/svg.js'
import type BrainMap from '../..'
import type Node from '../node/Node'
import { type NodeStyle, type ThemeConfig } from '../themes/default'

// 节点样式类
class Style {
  node: Node
  brainMap: BrainMap

  static setBackgroundStyle (el: HTMLElement, themeConfig: ThemeConfig): void {
    el.style.backgroundColor = themeConfig.backgroundColor
  }

  constructor (ctx: Node) {
    this.node = ctx
    this.brainMap = ctx.brainMap
  }

  // 使用样式
  useStyle (prop: string, isBasicProp: boolean = false): unknown {
    const themeConfig = this.brainMap.themeConfig

    if (themeConfig) {
      let defaultStyle: NodeStyle | ThemeConfig = themeConfig.node

      if (isBasicProp) {
        // 如果是非节点样式
        defaultStyle = themeConfig
      } else if (this.node.layerIndex === 0) {
        defaultStyle = themeConfig.root
      } else if (this.node.layerIndex === 1) {
        defaultStyle = themeConfig.second
      }
      const selfStyle = this.getSelfStyle(prop)

      return selfStyle === undefined ? defaultStyle[prop] : selfStyle
    }
  }

  // 获取某个样式值
  getStyle (prop: string, isBasicProp: boolean = false): unknown {
    let val = this.useStyle(prop, isBasicProp)
    if (val === undefined) {
      val = this.useStyle(prop, true)
    }
    return val
  }

  // 获取node的某个独立样式值
  getSelfStyle (prop: string): unknown {
    return this.node.getData(prop)
  }

  // 设置基本样式
  setBasicStyle (prop: string, val: string): void {
    if (this.brainMap.themeConfig) {
      this.brainMap.themeConfig[prop] = val
    }
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
    contentDiv.style.lineHeight = this.useStyle('lineHeight') as string
    contentDiv.style.minWidth = '20px'
    contentDiv.style.minHeight = '21px'
  }

  // 给连线设置样式
  line (node: Path | Polyline): void {
    const lineColor = this.useStyle('lineColor', true) as string
    const lineWidth = this.useStyle('lineWidth', true) as number
    node.fill('none').stroke({
      color: lineColor,
      width: lineWidth
    })
    // const idx = getIndexOfSibling(this.node)
    // this.node.parent?.lines[idx].fill('none').stroke({
    //   color: lineColor,
    //   width: lineWidth
    // })
  }
}

export default Style
