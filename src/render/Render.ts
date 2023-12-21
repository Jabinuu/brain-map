import type BrainMap from '../../index'
import LogicalStructure from '../layouts/LogicalStructure'
import { CONSTANT, EnumCommandName, EnumShortcutName } from '../constant/constant'
import type Node from '../node/Node'
import { type DataSourceItem } from '../../index'
import { traversal } from '../utils'
interface RenderOption {
  brainMap: BrainMap
}

type Layout = LogicalStructure
 type RenderNodeCache = Record<string, Node>

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
  editNode: Node | null
  renderCache: RenderNodeCache
  lastRenderCache: RenderNodeCache

  constructor (opt: RenderOption) {
    this.brainMap = opt.brainMap
    this.layout = null
    // 当前激活的节点列表
    this.activeNodes = []
    // 当前正在编辑的节点
    this.editNode = null
    // 此次渲染的节点缓存
    this.renderCache = {}
    // 上次渲染的节点缓存
    this.lastRenderCache = {}

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
    this.brainMap.registerCommand<Node, boolean>(EnumCommandName.SET_NODE_ACTIVE, this.setNodeActive.bind(this))
    this.brainMap.registerCommand<Node, boolean>(EnumCommandName.SET_NODE_EDIT, this.setNodeEdit.bind(this))
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
    this.lastRenderCache = this.renderCache
    this.renderCache = {}

    // 布局的过程中已经创建了所有Node实例并计算好了定位属性值
    this.layout?.doLayout()

    // 销毁此次不需要渲染的节点
    Object.keys(this.lastRenderCache).forEach((uid) => {
      if (!this.renderCache[uid]) {
        this.lastRenderCache[uid].destroy()
      }
    })
    // 将所有Node实例渲染到画布上
    this.brainMap.root?.render()
    console.log(this.brainMap.dataSource)
  }

  // 清空激活节点列表
  clearActiveNodesList (): void {
    this.activeNodes.forEach((item: Node) => {
      this.brainMap.execCommand<Node, boolean>(EnumCommandName.SET_NODE_ACTIVE, item, false)
      item.group?.removeClass('active')
      item.hideExpandBtn()
    })
    this.activeNodes.length = 0
  }

  // 添加激活节点
  addActiveNodeList (node: Node): void {
    node.group?.addClass('active')
    this.brainMap.execCommand<Node, boolean>(EnumCommandName.SET_NODE_ACTIVE, node, true)
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
          isEdit: false,
          isActive: true,
          isExpand: true
        },
        children: []
      })
    })

    this.clearActiveNodesList()
    this.render()
    console.log(this.activeNodes)
  }

  // 添加同级节点
  appendSibingNode (): void {
    this.activeNodes.forEach((activeNode: Node) => {
      activeNode.parent?.nodeData?.children.push({
        data: {
          text: '新增同级节点',
          paddingX: 25,
          paddingY: 5,
          isEdit: false,
          isExpand: true,
          isActive: true
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
        node?.setData(key, data[key])
      })
    }
  }

  // 设置节点数据源 并判断是否需要渲染
  setNodeDataRender (node?: Node, data?: Partial<DataSourceItem>): void {
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, node, data)
    // 判断是否要渲染
    if (node?.reRender()) {
      this.render()
    }
  }

  // 改变节点激活状态
  setNodeActive (node?: Node, isActive?: boolean): void {
    this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, node, {
      isActive
    })
    if (isActive) {
      node?.showExpandBtn()
    }
  }

  // 改变节点展开状态
  setNodeExpand (node?: Node, isExpand?: boolean): void {
    if (!isExpand && node) {
      // 节点收缩时取消所有后代节点的激活状态
      this.cancelAllChildrenActive(node)
    }
    this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, node, {
      isExpand
    })
    this.render()
  }

  // 改变节点编辑状态
  setNodeEdit (node?: Node, isEdit?: boolean): void {
    if (node) {
      this.editNode = isEdit ? node : null
      this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, node, {
        isEdit
      })
      this.render()
    }
  }

  // 取消所有后代节点的激活状态
  cancelAllChildrenActive (node: Node): void {
    if (node.nodeData) {
      traversal(node.nodeData, node.isRoot, null, (node) => {
        node.children.forEach((child) => {
          if (child.node?.getData('isActive')) {
            this.brainMap.execCommand<Node, Partial<DataSourceItem>>(EnumCommandName.SET_NODE_DATA, child.node, {
              isActive: false
            })
            this.activeNodes = this.activeNodes.filter((item) => item !== child.node)
          }
        })
        return false
      })
      // this.render()
    }
  }

  // 清除编辑状态
  clearEditStatus (): void {
    if (this.editNode) {
      this.brainMap.execCommand<Node, boolean>(EnumCommandName.SET_NODE_EDIT, this.editNode, false)
    }
  }

  // 输入文本时的回调
  onEditInput (): void {
    this.render()
  }
}

export default Render
