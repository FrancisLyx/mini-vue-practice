import { h } from '../../dist/index.esm.js'
import { Provider } from './Foo.js'

export const App = {
	name: 'App',
	render() {
		return h('div', {}, [h(Provider)])
	},
	setup() {
		console.log('component setup')
	}
}
