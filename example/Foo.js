import { h } from '../dist/index.esm.js'
export const Foo = {
	render() {
		const props = h('div', {}, 'foo: ' + this.count)
		const btton = h(
			'button',
			{
				onClick: () => {
					this.emitAdd()
				}
			},
			'click'
		)
		return h('div', {}, [props, btton])
	},
	setup(props, { emit }) {
		console.log(props.count, 'props===>')
		props.count++

		const emitAdd = () => {
			emit('add')
		}

		return {
			emitAdd
		}
	}
}
