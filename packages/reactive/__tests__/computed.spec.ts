import { computed, reactive } from '../src/index'

describe('computed', () => {
	it('happy path', () => {
		const value = reactive({
			foo: 1
		})

		const getter = computed(() => {
			return value.foo
		})

		// computed接收一个函数，使用的时候，这个函数会自动执行，返回对应的结果
		value.foo = 2
		expect(getter.value).toBe(2)
	})

	it('should compute lazily', () => {
		const value = reactive({
			foo: 1
		})
		const getter = vi.fn(() => {
			return value.foo
		})
		const cValue = computed(getter)

		// lazy，我使用computed的时候，函数才会被执行。
		expect(getter).not.toHaveBeenCalled()
		expect(cValue.value).toBe(1)
		expect(getter).toHaveBeenCalledTimes(1)

		// should not compute again
		cValue.value
		expect(getter).toHaveBeenCalledTimes(1)

		// should not compute until needed
		value.foo = 2
		expect(getter).toHaveBeenCalledTimes(1)

		// now it should compute
		expect(cValue.value).toBe(2)
		expect(getter).toHaveBeenCalledTimes(2)

		// should not compute again
		cValue.value
		expect(getter).toHaveBeenCalledTimes(2)
	})
})
