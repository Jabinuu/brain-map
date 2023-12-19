import type { DataSource } from '..'

const dataSource: DataSource = {
  data: {
    text: '英雄联盟',
    paddingX: 25,
    paddingY: 5,
    isExpand: true,
    isEdit: false,
    isActive: false
  },
  children: [{
    data: {
      text: '上单',
      paddingX: 25,
      paddingY: 5,
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '卡密尔',
        paddingX: 25,
        paddingY: 5,
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: [{
        data: {
          text: 'Q技能',
          paddingX: 25,
          paddingY: 5,
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }, {
        data: {
          text: 'W技能',
          paddingX: 25,
          paddingY: 5,
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }, {
        data: {
          text: 'E技能',
          paddingX: 25,
          paddingY: 5,
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }]
    }, {
      data: {
        text: '老司机',
        paddingX: 25,
        paddingY: 5,
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: [{
        data: {
          text: '开车人',
          paddingX: 25,
          paddingY: 5,
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }]
    }, {
      data: {
        text: '天使',
        paddingX: 25,
        paddingY: 5,
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: []
    }]
  }, {
    data: {
      text: '中单',
      paddingX: 25,
      paddingY: 5,
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '卡萨丁',
        paddingX: 25,
        paddingY: 5,
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: [{
        data: {
          text: '虚空行走',
          paddingX: 25,
          paddingY: 5,
          isExpand: true,
          isEdit: false,
          isActive: false
        },
        children: []
      }]
    }]
  }, {
    data: {
      text: '打野',
      paddingX: 25,
      paddingY: 5,
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '阿木木',
        paddingX: 25,
        paddingY: 5,
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: []
    }]
  }, {
    data: {
      text: '下路',
      paddingX: 25,
      paddingY: 5,
      isExpand: true,
      isEdit: false,
      isActive: false
    },
    children: [{
      data: {
        text: '寒冰射手和塞纳',
        paddingX: 25,
        paddingY: 5,
        isExpand: true,
        isEdit: false,
        isActive: false
      },
      children: []
    }]
  }]
}

export default dataSource
