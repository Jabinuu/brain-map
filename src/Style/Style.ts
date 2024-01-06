import type Node from '../node/Node'

// 样式类
class Style {
  node: Node
  constructor (ctx: Node) {
    this.node = ctx
  }

  // 合并样式
  merge (): void {

  }

  // 给节点的形状设置样式
  shape (): void {

  }

  // 给节点的文字元素设置样式
  text (): void {

  }

  // 给展开收起按钮设置样式
  expandBtn (): void {

  }

  // 给连线设置样式
  line (): void {

  }
}

export default Style
