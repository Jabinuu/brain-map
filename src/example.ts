import type { DataSource } from '..'

const dataSource: DataSource = {
  data: {
    text: '英雄联盟',
    paddingX: 40,
    paddingY: 30
  },
  children: [{
    data: {
      text: '上单',
      paddingX: 30,
      paddingY: 20
    },
    children: [{
      data: {
        text: '卡密尔',
        paddingX: 20,
        paddingY: 10
      },
      children: []
    }, {
      data: {
        text: '老司机',
        paddingX: 20,
        paddingY: 10
      },
      children: []
    }]
  }, {
    data: {
      text: '中单',
      paddingX: 30,
      paddingY: 20
    },
    children: [{
      data: {
        text: '卡萨丁',
        paddingX: 20,
        paddingY: 10
      },
      children: []
    }]
  }, {
    data: {
      text: '打野',
      paddingX: 30,
      paddingY: 20
    },
    children: [{
      data: {
        text: '阿木木',
        paddingX: 20,
        paddingY: 10
      },
      children: []
    }]
  }, {
    data: {
      text: '下路',
      paddingX: 30,
      paddingY: 20
    },
    children: [{
      data: {
        text: '寒冰射手和塞纳',
        paddingX: 20,
        paddingY: 10
      },
      children: []
    }]
  }]
}

export default dataSource
