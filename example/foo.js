import { h } from '../dist/index.esm.js'
export const foo = {
	setup(props) {
		// setup 中传入
		console.log('foo props', props)
		//  shallowReadonly
		props.count++
	},
	render() {
		//  在render中可以访问
		return h('div', {}, 'foo:' + this.count)
	}
}
