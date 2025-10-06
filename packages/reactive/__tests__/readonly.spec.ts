import { readonly, isReadonly, isProxy } from '../src/reactive'

// readonly 就是对象无法进行set操作，无法进行修改

describe('readonly', () => {
	it('happy path', () => {
		const original = { foo: 1, bar: { a: 1 } }
		const observed = readonly(original)
		expect(observed).not.toBe(original)
		expect(isReadonly(original)).toBe(false)
		expect(isReadonly(observed)).toBe(true)
		expect(isReadonly(observed.bar)).toBe(true)
		expect(isReadonly(original.bar)).toBe(false)
		expect(isProxy(observed)).toBe(true)
		expect(isProxy(original)).toBe(false)
		expect(observed.foo).toBe(1)
	})
	it('warn when set', () => {
		console.warn = vi.fn()
		const original = { foo: 1 }
		const observed = readonly(original)
		observed.foo = 2
		expect(console.warn).toHaveBeenCalled()
	})
})
