import { h } from '../../dist/index.esm.js'
import { provide, inject } from '../../dist/index.esm.js'

export const Provider = {
	name: 'Provider',
	setup() {
		provide('foo', 'fooValue')
		provide('bar', 'barValue')
	},
	render() {
		return h('div', {}, ['provider', h(ProviderTwo)])
	}
}

const ProviderTwo = {
	name: 'ProviderTwo',
	setup() {
		provide('foo', 'fooTwo')
		const foo = inject('foo')

		return {
			foo
		}
	},
	render() {
		return h('div', {}, [h('p', {}, `ProviderTwo foo:${this.foo}`), h(Consumer)])
	}
}

export const Consumer = {
	name: 'Consumer',
	setup() {
		const foo = inject('foo')
		const bar = inject('bar')

		return {
			foo,
			bar
		}
	},
	render() {
		return h('div', {}, `Consumer: - ${this.foo} - ${this.bar}`)
	}
}
