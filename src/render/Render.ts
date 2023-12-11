import type BrainMap from '../../index'
import LogicalStructure from '../layouts/LogicalStructure'
import { CONSTANT, EnumCommandName, EnumShortcutName } from '../constant/constant'
import type Node from '../node/Node'
import { type DataSourceItem } from '../../index'

interface RenderOption {
  brainMap: BrainMap
}

type Layout = LogicalStructure

// export type SET_NODE_DATA = Array<Node | { [prop in keyof DataSourceItem]?: DataSourceItem[prop] }> 等价于下面
// export type SET_NODE_DATA = Node | Partial<DataSourceItem>

// export type SET_NODE_EXPAND = [Node, boolean ]

const layouts = {
  [CONSTANT.LAYOUTS.LOGICAL_STRUCTURE]: LogicalStructure
}

// 渲染类，负责渲染相关
class Render {
  brainMap: BrainMap
  layout: Layout | null
  activeNodes: Node[]

  constructor (opt: RenderOption) {
    this.brainMap = opt.brainMap
    this.layout = null
    // 当前激活的节点列表
    this.activeNodes = []
    // 设置布局
    this.setLayout()
    // 注册渲染相关命令
    this.registerCommand()
    // 绑定快捷键
    this.bindShortcut()
  }

  // 设置布局模式
  setLayout (): void {
    this.layout = new (layouts[this.brainMap.layout] ?? layouts[CONSTANT.LAYOUTS.LOGICAL_STRUCTURE])(this)
  }

  // 注册命令
  registerCommand (): void {
    this.brainMap.registerCommand(EnumCommandName.INSERT_CHILD_NODE, this.appendChildNode.bind(this))
    this.brainMap.registerCommand(EnumCommandName.INSERT_SIBLING_NODE, this.appendSibingNode.bind(this))
    this.brainMap.registerCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, this.setNodeData.bind(this))
    this.brainMap.registerCommand<Node, boolean>(EnumCommandName.SET_NODE_EXPAND, this.setNodeExpand.bind(this))
  }

  // 绑定快捷键
  bindShortcut (): void {
    this.brainMap.registerShortcut(EnumShortcutName.TAB, () => {
      this.brainMap.execCommand(EnumCommandName.INSERT_CHILD_NODE)
    })

    this.brainMap.registerShortcut(EnumShortcutName.ENTER, () => {
      this.brainMap.execCommand(EnumCommandName.INSERT_SIBLING_NODE)
    })
  }

  // 渲染器
  render (): void {
    // 先清空所有节点和连线容器
    this.brainMap.nodeDrawing?.children().forEach((item) => item.remove())
    this.brainMap.lineDrawing?.children().forEach((item) => item.remove())

    // 布局的过程中已经创建了所有Node实例并计算好了定位属性值
    this.layout?.doLayout()

    // 将所有Node实例渲染到画布上
    this.brainMap.root?.render()
  }

  // 清空激活节点列表
  clearActiveNodesList (): void {
    this.activeNodes.forEach((item: Node) => {
      this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, item, {
        isActive: false
      })
      item.group?.removeClass('active')
    })
    this.activeNodes.length = 0
  }

  // 添加激活节点
  addActiveNodeList (node: Node): void {
    node.group?.addClass('active')
    this.activeNodes.push(node)
  }

  // 添加子节点
  appendChildNode (): void {
    this.activeNodes.forEach((activeNode: Node) => {
      activeNode.nodeData?.children.push({
        data: {
          text: '新增子节点',
          paddingX: 25,
          paddingY: 5,
          isActive: false,
          isExpand: true
        },
        children: []
      })
    })
    this.clearActiveNodesList()
    this.brainMap.nodeDrawing?.children().forEach((item) => item.remove())
    this.brainMap.lineDrawing?.children().forEach((item) => item.remove())
    this.render()
  }

  // 添加同级节点
  appendSibingNode (): void {
    this.activeNodes.forEach((activeNode: Node) => {
      activeNode.parent?.nodeData?.children.push({
        data: {
          text: '新增同级节点',
          paddingX: 25,
          paddingY: 5,
          isExpand: true,
          isActive: false
        },
        children: []
      })
    })
    this.clearActiveNodesList()

    this.render()
  }

  // 设置节点数据源数据
  setNodeData (node?: Node, data?: Partial<DataSourceItem>): void {
    if (data) {
      Object.keys(data).forEach((key) => {
        if (node?.nodeData) {
          node.nodeData.data[key] = data[key]
        }
      })
    }
  }

  // 改变节点展开状态
  setNodeExpand (node?: Node, isExpand?: boolean): void {
    this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, node, {
      isExpand
    })

    this.render()
  }
}

export default Render
