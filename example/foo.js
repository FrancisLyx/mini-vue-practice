import { h } from '../dist/index.esm.js'
import { renderSlots } from '../dist/index.esm.js'
export const foo = {
	setup(props, { emit }) {
		// setup 中传入
		console.log('foo props', props)
		//  shallowReadonly
		props.count++

		const emitAdd = () => {
			emit('add', 1, 2)
			emit('add-foo', 1, 2)
		}
		return {
			emitAdd
		}
	},
	render() {
		// const btn = h('button', { onClick: this.emitAdd }, 'emitAdd')
		//  在render中可以访问
		console.log(this.$slots)
		const foo = h('p', {}, 'foo')
		return h('div', {}, [
			renderSlots(this.$slots, 'header', { age: 10 }),
			foo,
			renderSlots(this.$slots, 'footer')
		])
	}
}
