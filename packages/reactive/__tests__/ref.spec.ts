import { effect } from '@/reactive/effect'
import { ref } from '@/reactive/ref'

describe('ref', () => {
	it('happy path', () => {
		const a = ref(1)
		expect(a.value).toBe(1)
	})

	it('should be reactive', () => {
		const a = ref(1)
		let dummy
		let calls = 0
		effect(() => {
			calls++
			dummy = a.value
		})
		expect(calls).toBe(1)
		expect(dummy).toBe(1)
		a.value = 2
		expect(calls).toBe(2)
		expect(dummy).toBe(2)
		// same value should not trigger
		a.value = 2
		expect(calls).toBe(2)
		expect(dummy).toBe(2)
	})

	it('should make nested properties reactive', () => {
		const a = ref({
			foo: 1
		})
		let dummy
		effect(() => {
			dummy = a.value.foo
		})
		expect(dummy).toBe(1)
		a.value.foo = 2
		expect(dummy).toBe(2)
	})
})
