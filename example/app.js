import { h } from '../dist/index.esm.js'

window.self = null
export const App = {
	render() {
		window.self = this
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'bold']
			},
			// setupState 中取值
			// this.$el  get root element
			[h('p', { class: 'red' }, 'hi,' + this.msg)]
			// 'hi,mini-vue'
		)
	},
	setup() {
		return {
			msg: 'mini-vue-haha'
		}
	}
}
