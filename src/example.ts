import type { DataSource } from '..'

const dataSource: DataSource = {
  data: {
    text: '根节点',
    isExpand: true,
    isEdit: false,
    isActive: false
  },
  children: [{
    data: {
      text: '二级节点1',
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '卡密尔',
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: [{
        data: {
          text: 'Q技能',
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }, {
        data: {
          text: 'W技能',

          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }, {
        data: {
          text: 'E技能',
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }]
    }, {
      data: {
        text: '老司机',
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: [{
        data: {
          text: '开车人',
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }]
    }, {
      data: {
        text: '天使',
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: []
    }]
  }, {
    data: {
      text: '二级节点2',
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '卡萨丁',
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: [{
        data: {
          text: '虚空行走',
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }]
    }]
  }, {
    data: {
      text: '二级节点3',
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '阿木木',
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: []
    }]
  }, {
    data: {
      text: '二级节点4',
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '寒冰射手和塞纳',
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: []
    }]
  }]
}

export default dataSource
