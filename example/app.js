import { h } from '../dist/index.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
	render() {
		window.self = this
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'bold'],
				onClick: () => {
					console.log('click')
				},
				onMouseover: () => {
					console.log('mouseover')
				}
			},
			// setupState 中取值
			// this.$el  get root element
			[
				h('p', { class: 'red' }, 'hi,' + this.msg),
				h(Foo, {
					count: 100,
					onAdd: () => {
						console.log('add event accept')
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
