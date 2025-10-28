import { createRenderer } from '../../dist/index.esm.js'
import { App } from './App.js'
;(async () => {
	const app = new PIXI.Application()
	await app.init({
		width: 500,
		height: 500
	})
	document.body.append(app.canvas)
	// 自定义渲染器
	const renderer = createRenderer({
		createElement(type) {
			if (type === 'rect') {
				const rect = new PIXI.Graphics()
				rect.beginFill(0xff0000)
				rect.drawRect(0, 0, 100, 100)
				rect.endFill()

				return rect
			}
		},
		patchProp(el, key, val) {
			el[key] = val
		},
		insert(el, parent) {
			parent.addChild(el)
		}
	})

	renderer.createApp(App).mount(app.stage)
})()
