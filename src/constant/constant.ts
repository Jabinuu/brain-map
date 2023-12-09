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
  }
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
