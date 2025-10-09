import { h } from '../dist/index.esm.js'
export const App = {
	render() {
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'bold']
			},
			[h('p', { class: 'red' }, 'hi,'), h('p', { class: 'bold' }, 'mini-vue')]
			// 'hi,mini-vue'
		)
	},
	setup() {
		return {
			msg: 'mini-vue'
		}
	}
}
