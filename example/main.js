import { createApp } from '../dist/index.esm.js'
// vue组件写法，内置了一些钩子
import { App } from './app.js'

// 元素根节点进行传入
const rootContainer = document.querySelector('#app')

createApp(App).mount(rootContainer)
