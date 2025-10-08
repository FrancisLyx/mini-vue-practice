import { effect } from '../src/effect'
import { ref, proxyRefs, isRef, unRef } from '../src/ref'
import { reactive } from '../src/reactive'

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

	/**
	 * 主要运用于template模版中。在script中的声明的ref变量，在template中使用不需要.value
	 */
	it('proxyRefs', () => {
		const user = {
			age: ref(10),
			name: 'xiaohong'
		}
		const proxyUser = proxyRefs(user)
		expect(user.age.value).toBe(10)
		expect(proxyUser.age).toBe(10)
		expect(proxyUser.name).toBe('xiaohong')
		// 重新赋值，但是重新赋值的是ref对象，所以需要进行特殊处理
		proxyUser.age = 20
		expect(proxyUser.age).toBe(20)
		expect(user.age.value).toBe(20)

		// 重新赋值，但是重新赋值的是普通对象，所以不需要进行特殊处理
		proxyUser.age = ref(10)
		expect(proxyUser.age).toBe(10)
		expect(user.age.value).toBe(10)
	})

	/**
	 * isRef 判断是否是ref对象
	 * unRef 获取ref对象的值
	 */
	it('isRef', () => {
		const a = ref(1)
		const user = reactive({
			age: 1
		})
		expect(isRef(a)).toBe(true)
		expect(isRef(1)).toBe(false)
		expect(isRef(user)).toBe(false)
	})

	it('unRef', () => {
		const a = ref(1)
		expect(unRef(a)).toBe(1)
		expect(unRef(a.value)).toBe(a.value)
	})
})
