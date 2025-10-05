import { readonly } from '../src/reactive'

// readonly 就是对象无法进行set操作，无法进行修改

describe('readonly', () => {
	it('happy path', () => {
		const original = { foo: 1 }
		const observed = readonly(original)
		expect(observed).not.toBe(original)
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
