import { h } from '../dist/index.esm.js'
import { foo } from './foo.js'

window.self = null
export const App = {
	render() {
		window.self = this
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'bold']
				// onClick: () => {
				// 	console.log('click')
				// },
				// onMouseover: () => {
				// 	console.log('mouseover')
				// }
			},
			// setupState 中取值
			// this.$el  get root element
			[
				h('div', {}, 'hi,' + this.msg),
				h(foo, {
					count: 1,
					onAdd: (a, b) => {
						console.log('onAdd', a, b)
					},
					onAddFoo: (a, b) => {
						console.log('onAddFoo', a, b)
					}
				})
			]
			// 'hi,mini-vue'
		)
	},
	setup() {
		return {
			msg: 'mini-vue-haha'
		}
	}
}
