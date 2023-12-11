export enum EnumDataSource {
  PADDINGX = 'paddingX',
  PADDINGY = 'paddingY'
}
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
  DEL = 'Delete'
}

export enum EnumCommandName {
  INSERT_CHILD_NODE = 'INSERT_CHILD_NODE',
  INSERT_SIBLING_NODE = 'INSERT_SIBLING_NODE',
  SET_NODE_EXPAND = 'SET_NODE_EXPAND',
  SET_NODE_DATA = 'SET_NODE_DATA'
}

export const cssConstant = `
  /* 鼠标hover和激活时渲染的矩形 */
  .bm-hover-node{
    display: none;
    opacity: 0.6;
    stroke-width: 1;
  }

  .bm-node{
    user-select: none
  }

  .bm-node:not(.bm-node-dragging):hover .bm-hover-node{
    display: block;
  }

  .bm-node.active .bm-hover-node{
    display: block;
    opacity: 1;
    stroke-width: 2;
  }
`
