// 导出defineConfig方法可以让编辑器（VSCode）智能提示所有的rollup的配置项，很方便
import { defineConfig } from 'rollup'

// 这里是babel的插件，用来处理es的转换，当然会用一个.babelrc配置文件，下面也会简单列出来
import { babel } from '@rollup/plugin-babel'

// rollup转译typescript的插件
import typescript from '@rollup/plugin-typescript'

// 使得rollup能够加载node_modules里的第三方模块
import { nodeResolve } from '@rollup/plugin-node-resolve'

// rollup编译源码中默认是esm，所以rollup无法识别CommonJS模块。比如某个依赖包里用到了cjs标准的导入语句，这个插件将他们转为esm的导入语句
import commonjs from '@rollup/plugin-commonjs'

// 为了使rollup能够导入json中的数据，需要这个插件
import json from '@rollup/plugin-json'

// 压缩代码插件
import terser from '@rollup/plugin-terser'

// 引入package.json
import pkg from './package.json' assert { type: 'json' }

// 拿到package.json的name属性来动态设置打包名称
const libName = pkg.name
export default defineConfig({
  input: 'index.ts',
  output: [
    {
      file: `dist/${libName}.cjs.js`,
      // commonjs格式
      format: 'cjs',
      // globals: {
      //   lodash: "_",
      // },
    },
    {
      file: `dist/${libName}.es.js`,
      // es module
      format: 'es',
      // globals: {
      //   lodash: "_",
      // },
    },
    {
      file: `dist/${libName}.umd.js`,
      // 通用格式可以用于node和browser等多个场景
      format: 'umd',
      // 配合external使用，指出第三方库在具名导入时的名称
      // globals: {
      //   lodash: "_",
      // },
      // 注意如果是umd格式的bundle的话name属性是必须的，这时可以在script标签引入后window下会挂载该属性的变量来使用你的类库方法
      name: libName,
    },
    {
      file: `dist/${libName}.min.js`,
      format: 'iife',
      name: libName,
      extend: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    babel({ babelHelpers: 'bundled' }), // 默认参数也是这个，这里显式调用是为了消除命令行窗口提示文字
    typescript(),
    nodeResolve(),
    commonjs(),
    json(),
  ],
  // 保持某些库的外部引用状态，将第三方库通过导入语句进行导入，而不是直接将其代码打包进模块中
  // external: ["lodash"],
})
