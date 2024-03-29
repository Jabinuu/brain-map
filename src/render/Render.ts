import type BrainMap from '../../index'
import LogicalStructure from '../layouts/LogicalStructure'
import { CONSTANT, EnumCommandName, EnumShortcutName } from '../constant/constant'
import type Node from '../node/Node'
import { type DataSource, type DataSourceItem } from '../../index'
import { getBoundingBox, isInfinity, selectAllText, traversal } from '../utils'
import { type ResizeRecod, type HistoryItem } from '../command/Command'
import { type Polygon } from '@svgdotjs/svg.js'

interface RenderOption {
  brainMap: BrainMap
}

type Layout = LogicalStructure
type RenderNodeCache = Record<string, Node>

const layouts = {
  [CONSTANT.LAYOUTS.LOGICAL_STRUCTURE]: LogicalStructure
}

export interface Rectangle {
  left: number
  top: number
  width: number
  height: number
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
  resizeRecord: ResizeRecod | null
  activeNodesBoundingBox: Polygon | null

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
    // 包含多个激活节点的边框
    this.activeNodesBoundingBox = null
    // 某个节点被resize的记录
    this.resizeRecord = null
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
    this.brainMap.registerCommand(EnumCommandName.RESIZE_NODE, this.resizeNode.bind(this))
    this.brainMap.registerCommand(EnumCommandName.SET_NODE_STYLE, this.setNodeStyle.bind(this))
  }

  // 绑定快捷键
  bindShortcut (): void {
    this.brainMap.registerShortcut(EnumShortcutName.TAB, () => {
      this.brainMap.execCommand(EnumCommandName.INSERT_CHILD_NODE, [...this.activeNodes])
    })

    this.brainMap.registerShortcut(EnumShortcutName.ENTER, () => {
      this.brainMap.execCommand(EnumCommandName.INSERT_SIBLING_NODE, [...this.activeNodes])
    })

    this.brainMap.registerShortcut(EnumShortcutName.DEL, () => {
      if (!this.activeNodes.length) return
      this.brainMap.execCommand(EnumCommandName.DELETE_NODE, [...this.activeNodes])
    })

    this.brainMap.registerShortcut(EnumShortcutName.DEL_SINGLE, () => {
      if (this.activeNodes.length > 1) {
        alert('没有激活节点或多个激活节点不支持删除单个节点~')
        return
      }
      this.brainMap.execCommand(EnumCommandName.DELETE_SINGLE_NODE, [...this.activeNodes])
    })

    this.brainMap.registerShortcut(EnumShortcutName.UNDO, () => {
      this.brainMap.execCommand(EnumCommandName.UNDO)
    })

    this.brainMap.registerShortcut(EnumShortcutName.REDO, () => {
      this.brainMap.execCommand(EnumCommandName.REDO)
    })

    this.brainMap.registerShortcut(EnumShortcutName.EXPAND, () => {
      // 检查前置，以免产生多余的相同历史记录
      if (!this.activeNodes.length) return
      this.brainMap.execCommand(EnumCommandName.SET_NODE_EXPAND, [...this.activeNodes])
    })
  }

  // 绑定事件
  bindEvent (): void {
    this.brainMap.on('draw_mousedown', (e: Event) => {
      this.activeNodesBoundingBox?.remove()
      if (!this.brainMap.renderer.isSelecting) {
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
      this.brainMap.execCommand(EnumCommandName.SET_NODE_ACTIVE, [item], false)
      item.hideExpandBtn()

      item.hideControlPoint()
    })
    this.activeNodesBoundingBox?.remove()
    this.activeNodes.length = 0
    this.brainMap.emit('clear_active')
  }

  // 添加激活节点
  addNodeToActiveList (node: Node): void {
    // 不重复添加激活节点
    if (this.activeNodes.findIndex((item) => item.uid === node.uid) !== -1) {
      return
    }
    this.brainMap.execCommand(EnumCommandName.SET_NODE_ACTIVE, [node], true)
    this.activeNodes.push(node)
  }

  // 从激活节点列表里移除
  removeNodeFromActiveList (node: Node): void {
    this.brainMap.execCommand(EnumCommandName.SET_NODE_ACTIVE, [node], false)
    this.activeNodes = this.activeNodes.filter((item) => node !== item)
  }

  // 添加子节点
  appendChildNode (activeNodes: Node[]): void {
    if (activeNodes.length > 1) {
      return
    }
    const [node] = activeNodes
    node.nodeData?.children.push({
      data: {
        text: '',
        isEdit: false,
        isActive: true,
        isExpand: true
      },
      children: []

    })

    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.clearEditStatus()
    this.render()

    // 添加节点后直接就是编辑状态
    this.brainMap.execCommand(EnumCommandName.SET_NODE_EDIT, [node.children[node.children.length - 1]], true)
  }

  // 添加同级节点
  appendSibingNode (activeNodes: Node[]): void {
    if (this.activeNodes.length > 1) {
      return
    }
    const [node] = activeNodes
    if (!node.parent) {
      return
    }

    const insertPos = node.parent.children.findIndex((item) => item === node) + 1
    node.parent?.nodeData?.children.splice(insertPos, 0, {
      data: {
        text: '',
        isEdit: false,
        isExpand: true,
        isActive: true
      },
      children: []
    })

    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.clearEditStatus()
    this.render()

    // 添加节点后直接就是编辑状态
    this.brainMap.execCommand(EnumCommandName.SET_NODE_EDIT, [node.parent.children[insertPos]], true)
  }

  // 删除节点
  deleteNode (activeNodes: Node[]): void {
    activeNodes.forEach((item) => {
      if (item.parent?.nodeData) {
        item.parent.nodeData.children = item.parent.nodeData.children.filter((child) => {
          return child.data.uid !== item.getData('uid')
        })
      }
    })
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.clearEditStatus()

    if (activeNodes.length === 1 && activeNodes[0].parent) {
      const siblings = activeNodes[0].parent.children
      let index = siblings.findIndex((item) => item === activeNodes[0])
      index = index === 0 ? 1 : index - 1
      if (index < siblings.length) {
        this.addNodeToActiveList(siblings[index])
      } else {
        this.addNodeToActiveList(activeNodes[0].parent)
      }
    }

    this.render()
  }

  // 删除单个节点
  deleteSingleNode (activeNodes: Node[]): void {
    const [node] = activeNodes
    const parent = node.parent?.nodeData
    const parentNode = node.parent
    const childrenCount = node.nodeData?.children.length as number
    const deleteIndex = parentNode?.children.findIndex((item) => item === node) as number

    if (parent) {
      let index = parent?.children.findIndex((child) => {
        return child.data.uid === node.uid
      })
      parent.children.splice(index, 1)
      node.nodeData?.children.forEach((child) => {
        parent.children.splice(index++, 0, child)
      })
    }
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.clearEditStatus()
    this.render()

    if (childrenCount > 1) {
      for (let i = deleteIndex; i < deleteIndex + childrenCount; i++) {
        if (parentNode) {
          this.addNodeToActiveList(parentNode.children[i])
        }
      }
    }
    this.activeNodes.length > 1 && this.createActiveNodesBoundingBox()
  }

  // 设置节点数据源数据
  setNodeData (manipulateNode: [Node], data: Partial<DataSourceItem>): void {
    const [node] = manipulateNode
    Object.keys(data).forEach((key) => {
      node.setData(key, data[key])
    })
  }

  // 修改节点数据源 并判断是否需要渲染
  setNodeDataRender (node: Node, data: Partial<DataSourceItem>): void {
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, [node], data)

    // 判断是否要渲染
    const changed = node.reRender()

    if (changed) {
      this.render()
    }
  }

  // 改变节点激活状态
  setNodeActive (manipulateNode: [Node], isActive: boolean): void {
    const [node] = manipulateNode
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, [node], {
      isActive
    })
    node.updateNodeActiveClass()

    if (isActive && !this.isSelecting) {
      node.showExpandBtn()
      node.showControlPoint()
    }
  }

  // 改变节点展开状态
  setNodeExpand (manipulateNode: Node[]): void {
    const _manipulateNode = manipulateNode.length > 1
      ? this.getParentNodeFromActiveList(manipulateNode)
      : manipulateNode
    const allCollapse = _manipulateNode.every((node) => !node.getData('isExpand') as boolean)
    const len = _manipulateNode.length
    const root = this.brainMap.root
    const hasRootNode = _manipulateNode.includes(root as Node)

    if (root && hasRootNode) {
      _manipulateNode.length = 0
      root.children.forEach((item) => {
        _manipulateNode.push(item)
      })
      this.removeNodeFromActiveList(root)
    }

    _manipulateNode.forEach((node) => {
      const isExpand = node.getData('isExpand') as boolean
      if (len > 1 && !isExpand && !allCollapse) {
        this.removeNodeFromActiveList(node)
        return
      }
      if (isExpand) {
        // 节点收缩时取消所有后代节点的激活状态
        this.cancelAllChildrenActive(node)
        if (hasRootNode) {
          this.addNodeToActiveList(node)
        }
      }

      this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, [node], {
        isExpand: !isExpand
      })
    })

    this.render()

    if (_manipulateNode.length > 1) {
      this.createActiveNodesBoundingBox()
    } else {
      this.activeNodesBoundingBox?.remove()
    }
  }

  // 改变节点编辑状态
  setNodeEdit (manipulateNode: [Node], isEdit: boolean): void {
    const [node] = manipulateNode
    this.editNode = isEdit ? node : null
    this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, [node], {
      isEdit
    })

    if (node.textData) {
      if (isEdit) {
        // 打开编辑模式
        node.textData.div.setAttribute('contenteditable', 'true')
        node.textData.div.style.cursor = 'text'
        node.textData.div.style.userSelect = 'text'
        selectAllText(node.textData.div)
        node.lastText = node.getData('text') as string

        // 记录进入此次编辑前的节点尺寸信息，用于添加到历史记录
        node.recordBeforeSize()
      } else {
        node.textData.div.removeAttribute('contenteditable')
        node.textData.div.style.cursor = 'default'
        node.textData.div.style.userSelect = 'none'
      }
    }
  }

  // 修改节点文本
  setNodeText (manipulateNode: [Node], text: string): void {
    const [node] = manipulateNode
    node?.renderer.setNodeDataRender(node, {
      text
    })
  }

  // 修改节点尺寸
  resizeNode (manipulateNode: Node[]): void {

  }

  // 编辑节点时的操作
  onEditNodeText (e: Event, node: Node): void {
    node.needLayout = true
    const text = (e.target as HTMLElement).innerText
    node.textChange = text !== node.lastText
    this.brainMap.execCommand(EnumCommandName.SET_NODE_TEXT, [node], text)
    // 将形状节点移动到图层底部，否则覆盖了文本编辑元素
    this.editNode?.shapeElem?.back()
  }

  // 取消所有后代节点的激活状态
  cancelAllChildrenActive (node: Node): void {
    if (node.nodeData) {
      traversal(node.nodeData, node.isRoot, null, (node) => {
        node.children.forEach((child) => {
          if (child.node?.getData('isActive')) {
            this.brainMap.execCommand(EnumCommandName.SET_NODE_DATA, [child.node], {
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
      this.brainMap.execCommand(EnumCommandName.SET_NODE_EDIT, [this.editNode], false)
    }
  }

  // 回退
  undo (): void {
    const historyItem = this.brainMap.command.undo()
    if (!historyItem) {
      alert('已经到头啦~w_w')
      return
    }
    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)

    this.switchHistoryItem(historyItem, 'undo')
    this.activeNodes.length > 1 && this.createActiveNodesBoundingBox()
  }

  // 重做
  redo (): void {
    const history = this.brainMap.command.redo()
    if (!history) {
      alert('已经到头啦~w_w')
      return
    }
    const historyItem = history.historyItem
    const lastDataSource = history.lastDataSource

    this.brainMap.execCommand(EnumCommandName.CLEAR_ACTIVE_NODE)
    this.switchHistoryItem(historyItem, 'redo', lastDataSource)
    this.activeNodes.length > 1 && this.createActiveNodesBoundingBox()
  }

  // 历史记录切换
  switchHistoryItem (historyItem: HistoryItem, mode: 'undo' | 'redo', lastDataSource?: DataSource): void {
    if (historyItem) {
      const {
        dataSource,
        manipulateNodeId,
        cmdName,
        insertSiblingIndex,
        resizeRecord
      } = historyItem

      // todo：如果该条历史记录中有resize的信息，则赋值
      if (resizeRecord) {
        this.resizeRecord = resizeRecord
      }

      if (mode === 'undo') {
        this.setActiveById(dataSource, manipulateNodeId)
      } else if (mode === 'redo') {
        if (cmdName === EnumCommandName.INSERT_CHILD_NODE) {
          this.setAddNodeRedoActiveNodeById(dataSource, manipulateNodeId)
        } else if (cmdName === EnumCommandName.INSERT_SIBLING_NODE) {
          this.setAddNodeRedoActiveNodeById(dataSource, manipulateNodeId, insertSiblingIndex)
        } else if (cmdName === EnumCommandName.DELETE_NODE && lastDataSource) {
          this.setDeleteNodeRedoActiveNodeById(dataSource, manipulateNodeId, lastDataSource, EnumCommandName.DELETE_NODE)
        } else if (cmdName === EnumCommandName.DELETE_SINGLE_NODE && lastDataSource) {
          this.setDeleteNodeRedoActiveNodeById(dataSource, manipulateNodeId, lastDataSource, EnumCommandName.DELETE_SINGLE_NODE)
        } else {
          this.setActiveById(dataSource, manipulateNodeId)
        }
      }

      this.brainMap.dataSource = dataSource

      this.render()
    }
  }

  // 根据uid修改数据源中对应节点的active
  setActiveById (dataSource: DataSource, id: string[]): void {
    id.forEach((item) => {
      traversal(dataSource, true, null, (cur) => {
        if (cur.data.uid === item) {
          cur.data.isActive = true
        }
        return false
      })
    })
  }

  // 针对添加子级节点和同级节点的重做时激活节点的处理
  setAddNodeRedoActiveNodeById (
    dataSource: DataSource,
    manipulateNodeId: string[],
    insertSiblingIndex: number = -1
  ): void {
    traversal(dataSource, true, null, (cur, parent) => {
      if (cur.data.uid === manipulateNodeId[0]) {
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

  // 针对删除节点的重做时激活节点的处理
  setDeleteNodeRedoActiveNodeById (
    dataSource: DataSource,
    manipulateNodeId: string[],
    lastDataSource: DataSource,
    mode: string
  ): void {
    const id: string[] = []

    manipulateNodeId.forEach((uid) => {
      traversal(lastDataSource, true, null, (cur, parent) => {
        if (cur.data.uid === uid && parent) {
          if (mode === EnumCommandName.DELETE_NODE) {
            let index = parent.children.findIndex((item) => item === cur)
            index = index === 0 ? 1 : index - 1
            id.push(parent.children[index].data.uid as string)
          } else {
            cur.children.forEach((item) => id.push(item.data.uid as string))
          }
          return true
        }
        return false
      })
    })

    id.forEach((uid) => {
      traversal(dataSource, true, null, (cur, parent) => {
        if (uid === cur.data.uid && parent) {
          const index = parent.children.findIndex((item) => item.data.uid === uid)
          parent.children[index].data.isActive = true
          return true
        }
        return false
      })
    })
  }

  // 从激活节点列表中过滤得到所有父元素,用于多选节点的收缩操作，以及历史记录里的操作节点id
  getParentNodeFromActiveList (manipulateNode: Node[]): Node[] {
    // tip：对于每一个激活节点，沿着父节点链向上查找有没有哪个父代节点是激活的，如果有，则将该父代节点下的激活节点从列表中删除，以此迭代即可
    return manipulateNode.filter((item) => {
      return !this.checkHasParentInActiveList(item, manipulateNode)
    })
  }

  // 判断节点有没有父代节点在激活列表中
  checkHasParentInActiveList (node: Node, manipulateNode: Node[]): boolean {
    let p = node.parent
    while (p) {
      if (manipulateNode.includes(p)) {
        return true
      }
      p = p.parent
    }
    return false
  }

  // 绘制包含多个激活节点的边界方框
  createActiveNodesBoundingBox (): void {
    if (!this.brainMap.drawing) return

    this.activeNodesBoundingBox?.remove()
    const rectangles: Rectangle[] = []
    this.activeNodes.forEach((node) => {
      rectangles.push({
        left: node.left,
        top: node.top,
        width: node.width,
        height: node.height
      })
    })

    const { left, top, width, height } = getBoundingBox(rectangles)
    if (isInfinity(left) || isInfinity(top) || isInfinity(width) || isInfinity(height)) {
      return
    }

    this.activeNodesBoundingBox = this.brainMap.drawing.polygon().plot([
      [left, top],
      [left, top + height],
      [left + width, top + height],
      [left + width, top]
    ])
      .stroke({ color: '#0984e3', width: 1 })
      .fill({ color: 'transparent' })
      .back()
  }

  // 设置节点样式命令
  setNodeStyle (manipulateNode: Node[], prop: string, val: string): void {
    if (prop === 'lineStyle') {
      manipulateNode[0].style.setBasicStyle(prop, val)
    } else {
      manipulateNode.forEach((node) => {
        node.setData(prop, val)
      })
    }

    if (['textDecoration', 'fontWeight', 'fontSize', 'fontStyle', 'color', 'textAlign'].includes(prop)) {
      manipulateNode[0].styleChange = true
      manipulateNode[0].getSize(false, false)
    }
    // 重新渲染
    this.render()
  }
}

export default Render
