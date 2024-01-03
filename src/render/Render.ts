import type BrainMap from '../../index'
import LogicalStructure from '../layouts/LogicalStructure'
import { CONSTANT, EnumCommandName, EnumShortcutName } from '../constant/constant'
import type Node from '../node/Node'
import { type DataSource, type DataSourceItem } from '../../index'
import { selectAllText, traversal } from '../utils'
import { type HistoryItem } from '../command/Command'
interface RenderOption {
  brainMap: BrainMap
}

type Layout = LogicalStructure
 type RenderNodeCache = Record<string, Node>

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
  isSelecting: boolean

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
    // 是否正在多选节点
    this.isSelecting = false

    // 设置布局
    this.setLayout()
    // 注册渲染相关命令
    this.registerCommand()
    // 绑定快捷键
    this.bindShortcut()
    // 绑定事件
    this.bindEvent()
  }

  // 设置布局模式
  setLayout (): void {
    this.layout = new (layouts[this.brainMap.layout] ?? layouts[CONSTANT.LAYOUTS.LOGICAL_STRUCTURE])(this)
  }

  // 注册命令
  registerCommand (): void {
    this.brainMap.registerCommand(EnumCommandName.INSERT_CHILD_NODE, this.appendChildNode.bind(this))
    this.brainMap.registerCommand(EnumCommandName.INSERT_SIBLING_NODE, this.appendSibingNode.bind(this))
    this.brainMap.registerCommand(EnumCommandName.DELETE_NODE, this.deleteNode.bind(this))
    this.brainMap.registerCommand(EnumCommandName.DELETE_SINGLE_NODE, this.deleteSingleNode.bind(this))
    this.brainMap.registerCommand(EnumCommandName.UNDO, this.undo.bind(this))
    this.brainMap.registerCommand(EnumCommandName.REDO, this.redo.bind(this))
    this.brainMap.registerCommand(EnumCommandName.SET_NODE_DATA, this.setNodeData.bind(this))
    this.brainMap.registerCommand(EnumCommandName.SET_NODE_EXPAND, this.setNodeExpand.bind(this))
    this.brainMap.registerCommand(EnumCommandName.SET_NODE_ACTIVE, this.setNodeActive.bind(this))
    this.brainMap.registerCommand(EnumCommandName.SET_NODE_EDIT, this.setNodeEdit.bind(this))
    this.brainMap.registerCommand(EnumCommandName.SET_NODE_TEXT, this.setNodeText.bind(this))
    this.brainMap.registerCommand(EnumCommandName.CLEAR_ACTIVE_NODE, this.clearActiveNodesList.bind(this))
  }

  // 绑定快捷键
  bindShortcut (): void {
    this.brainMap.registerShortcut(EnumShortcutName.TAB, () => {
      this.brainMap.execCommand(EnumCommandName.INSERT_CHILD_NODE, this.activeNodes[0])
    })

    this.brainMap.registerShortcut(EnumShortcutName.ENTER, () => {
      this.brainMap.execCommand(EnumCommandName.INSERT_SIBLING_NODE, this.activeNodes[0])
    })

    this.brainMap.registerShortcut(EnumShortcutName.DEL, () => {
      this.brainMap.execCommand(EnumCommandName.DELETE_NODE, this.activeNodes[0])
    })

    this.brainMap.registerShortcut(EnumShortcutName.DEL_SINGLE, () => {
      this.brainMap.execCommand(EnumCommandName.DELETE_SINGLE_NODE, this.activeNodes[0])
    })

    this.brainMap.registerShortcut(EnumShortcutName.UNDO, () => {
      this.brainMap.execCommand(EnumCommandName.UNDO)
    })

    this.brainMap.registerShortcut(EnumShortcutName.REDO, () => {
      this.brainMap.execCommand(EnumCommandName.REDO)
    })
  }

  // 绑定事件
  bindEvent (): void {
    this.brainMap.on('draw_click', () => {
      if (!this.brainMap.renderer.isSelecting) {
        // this.clearActiveNodesList()
        this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
        this.clearEditStatus()
      }
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
  }

  // 清空激活节点列表
  clearActiveNodesList (): void {
    this.activeNodes.forEach((item: Node) => {
      this.brainMap.execCommand(EnumCommandName.SET_NODE_ACTIVE, item, false)
      item.hideExpandBtn()
    })
    this.activeNodes.length = 0
  }

  // 添加激活节点
  addActiveNodeList (node: Node): void {
    // 不重复添加激活节点
    if (this.activeNodes.findIndex((item) => item.uid === node.uid) !== -1) {
      return
    }
    this.brainMap.execCommand(EnumCommandName.SET_NODE_ACTIVE, node, true)
    this.activeNodes.push(node)
  }

  // 从激活节点列表里移除
  removeActiveList (node: Node): void {
    this.brainMap.execCommand(EnumCommandName.SET_NODE_ACTIVE, node, false)
    this.activeNodes = this.activeNodes.filter((item) => node !== item)
  }

  // 添加子节点
  appendChildNode (node: Node): void {
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

    // this.clearActiveNodesList()
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.render()
  }

  // 添加同级节点
  appendSibingNode (node: Node): void {
    this.activeNodes.forEach((activeNode: Node) => {
      if (!activeNode.parent) return
      const insertPos = activeNode.parent.children.findIndex((item) => item === activeNode) + 1
      activeNode.parent?.nodeData?.children.splice(insertPos, 0, {
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
    // this.clearActiveNodesList()
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)

    this.render()
  }

  // 删除节点
  deleteNode (node: Node): void {
    this.activeNodes.forEach((node) => {
      if (node.parent?.nodeData) {
        node.parent.nodeData.children = node.parent.nodeData.children.filter((child) => {
          return child.data.uid !== node.getData('uid')
        })
      }
    })

    // this.clearActiveNodesList()
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)

    this.render()
  }

  // 删除单个节点
  deleteSingleNode (node: Node): void {
    if (this.activeNodes.length === 1) {
      const [activeNode] = this.activeNodes
      const parent = activeNode.parent?.nodeData
      if (parent) {
        let index = parent?.children.findIndex((child) => {
          return child.data.uid === activeNode.uid
        })
        parent.children.splice(index, 1)
        activeNode.nodeData?.children.forEach((child) => {
          parent.children.splice(index++, 0, child)
        })
      }

      this.render()
    } else {
      throw new Error('没有激活节点或多个激活节点不支持删除单个节点')
    }
  }

  // 设置节点数据源数据
  setNodeData (node?: Node, data?: Partial<DataSourceItem>): void {
    if (data) {
      Object.keys(data).forEach((key) => {
        node?.setData(key, data[key])
      })
    }
  }

  // 修改节点数据源 并判断是否需要渲染
  setNodeDataRender (node: Node, data: Partial<DataSourceItem>): void {
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, node, data)

    // 判断是否要渲染
    const changed = node.reRender()

    if (changed) {
      this.render()
    }
  }

  // 改变节点激活状态
  setNodeActive (node: Node, isActive: boolean): void {
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, node, {
      isActive
    })
    node.updateNodeActiveClass()
    if (isActive) {
      node.showExpandBtn()
    }
  }

  // 改变节点展开状态
  setNodeExpand (node: Node, isExpand: boolean): void {
    if (!isExpand) {
      // 节点收缩时取消所有后代节点的激活状态
      this.cancelAllChildrenActive(node)
    }
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, node, {
      isExpand
    })
    this.render()
  }

  // 改变节点编辑状态
  setNodeEdit (node: Node, isEdit: boolean): void {
    this.editNode = isEdit ? node : null
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, node, {
      isEdit
    })

    // 打开编辑模式
    if (node.textData) {
      if (isEdit) {
        node.textData.div.setAttribute('contenteditable', 'true')
        node.textData.div.style.cursor = 'text'
        node.textData.div.style.userSelect = 'text'
        selectAllText(node.textData.div)
        node.lastText = node.getData('text') as string
      } else {
        node.textData.div.removeAttribute('contenteditable')
        node.textData.div.style.cursor = 'default'
        node.textData.div.style.userSelect = 'none'
      }
    }
  }

  // 修改节点文本
  setNodeText (node: Node, text: string): void {
    node?.renderer.setNodeDataRender(node, {
      text
    })
  }

  // 编辑节点时的操作
  onEditNodeText (e: Event, node: Node): void {
    node.needLayout = true
    const text = (e.target as HTMLElement).innerText
    node.textChange = text !== node.lastText
    this.brainMap.execCommand(EnumCommandName.SET_NODE_TEXT, node, text)
    // 将形状节点移动到图层底部，否则覆盖了文本编辑元素
    this.editNode?.shapeElem?.back()
  }

  // 取消所有后代节点的激活状态
  cancelAllChildrenActive (node: Node): void {
    if (node.nodeData) {
      traversal(node.nodeData, node.isRoot, null, (node) => {
        node.children.forEach((child) => {
          if (child.node?.getData('isActive')) {
            this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, child.node, {
              isActive: false
            })
            this.activeNodes = this.activeNodes.filter((item) => item !== child.node)
          }
        })
        return false
      })
    }
  }

  // 清除编辑状态
  clearEditStatus (): void {
    if (this.editNode) {
      this.brainMap.execCommand(EnumCommandName.SET_NODE_EDIT, this.editNode, false)
    }
  }

  // 回退
  undo (): void {
    const historyItem = this.brainMap.command.undo()
    // this.clearActiveNodesList()
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)

    this.switchHistoryItem(historyItem, 'undo')
  }

  // 重做
  redo (): void {
    const historyItem = this.brainMap.command.redo()
    this.switchHistoryItem(historyItem, 'redo')
  }

  // 历史记录切换
  switchHistoryItem (historyItem: HistoryItem | undefined, mode: 'undo' | 'redo'): void {
    if (historyItem) {
      const {
        dataSource,
        manipulateNodeId,
        cmdName,
        insertSiblingIndex
      } = historyItem

      if (mode === 'undo') {
        this.setActiveById(dataSource, manipulateNodeId)
      } else if (mode === 'redo') {
        if (cmdName === EnumCommandName.INSERT_CHILD_NODE) {
          this.setRedoActiveNodeById(dataSource, manipulateNodeId)
        } else if (cmdName === EnumCommandName.INSERT_SIBLING_NODE) {
          this.setRedoActiveNodeById(dataSource, manipulateNodeId, insertSiblingIndex)
        } else {
          this.setActiveById(dataSource, manipulateNodeId)
        }
      }

      this.brainMap.dataSource = dataSource
      this.render()
    } else {
      alert('已经到头啦~w_w')
    }
  }

  // 根据uid修改数据源中对应节点的active
  setActiveById (dataSource: DataSource, id: string): void {
    traversal(dataSource, true, null, (cur) => {
      if (cur.data.uid === id) {
        cur.data.isActive = true
      }
      return false
    })
  }

  // 针对添加子级节点和同级节点的重做时激活节点的处理
  setRedoActiveNodeById (
    dataSource: DataSource,
    manipulateNodeId: string,
    insertSiblingIndex: number = -1
  ): void {
    traversal(dataSource, true, null, (cur, parent) => {
      if (cur.data.uid === manipulateNodeId) {
        let index = -1
        if (insertSiblingIndex === -1) {
          index = cur.children.length - 1
          cur.children[index].data.isActive = true
        } else {
          index = insertSiblingIndex
          if (parent) {
            parent.children[index].data.isActive = true
          }
        }
      }
      return false
    })
  }
}

export default Render
