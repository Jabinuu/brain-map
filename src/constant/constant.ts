export enum EnumLineShape {
  CURVE = 'curve',
  STRAIGHT = 'straight',
  DIRECT = 'direct'
}

export const CONSTANT = {
  LAYOUTS: {
    LOGICAL_STRUCTURE: 'LogicalStructure'
  },
  KEYMAP: {
    // 数字
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,

    // 字母
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,

    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    CapsLock: 20,
    Esc: 27,
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Ins: 45,
    Del: 46
  }
}

export enum EnumShortcutName {
  BACKSPACE = 'Backspace',
  TAB = 'Tab',
  ENTER = 'Enter',
  SHIFT = 'Shift',
  CTRL = 'Control',
  ALT = 'Alt',
  CAPSLOCK = 'CapsLock',
  ESC = 'Esc',
  PAGEUP = 'PageUp',
  PAGEDOWN = 'PageDown',
  END = 'End',
  HOME = 'Home',
  LEFT = 'ArrowLeft',
  UP = 'ArrowUp',
  RIGHT = 'ArrowRight',
  DOWN = 'ArrowDown',
  INS = 'Insert',
  DEL = 'Delete',
  DIVIDE = '/',
  DEL_SINGLE = 'Control|Delete',
  UNDO = 'Control|z',
  REDO = 'Control|y',
  EXPAND = 'Control|/'
}

export enum EnumCommandName {
  INSERT_CHILD_NODE = 'INSERT_CHILD_NODE',
  INSERT_SIBLING_NODE = 'INSERT_SIBLING_NODE',
  DELETE_NODE = 'DELETE_NODE',
  DELETE_SINGLE_NODE = 'DELETE_SINGLE_NODE',
  SET_NODE_EXPAND = 'SET_NODE_EXPAND',
  SET_NODE_ACTIVE = 'SET_NODE_ACTIVE',
  SET_NODE_DATA = 'SET_NODE_DATA',
  SET_NODE_EDIT = 'SET_NODE_EDIT',
  SET_NODE_TEXT = 'SET_NODE_TEXT',
  CLEAR_ACTIVE_NODE = 'CLEAR_ACTIVE_NODE',
  RESIZE_NODE = 'RESIZE_NODE',
  UNDO = 'UNDO',
  REDO = 'REDO',
  SET_NODE_STYLE = 'SET_NODE_STYLE'
}

export const cssConstant = `
  /* 鼠标hover和激活时渲染的矩形 */
  .bm-hover-node{
    visibility: hidden;
    opacity: 0.6;
  }

  .bm-node{
    user-select: none;
  }

  .bm-node:hover .bm-hover-node{
    visibility: visible;
  }

  .bm-control-point{
    visibility:hidden;
    cursor: nesw-resize;
  }

  .bm-node.active .bm-hover-node{
    visibility: visible;
    opacity: 1;
  }

  .bm-text-editer{
    white-space: normal;
    word-break: break-word; 
    outline:none;
  }
  .bm-text-editer::selection{
    background-color: rgba(148,0,211,0.3);
  }
`
