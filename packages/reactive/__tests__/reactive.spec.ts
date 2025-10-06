import { reactive, isReactive, isProxy } from '../src/reactive'

describe('reactive', () => {
	test('Object', () => {
		const original = { foo: 1, bar: { a: 1 } }
		const observed = reactive(original)
		const sameObserved = reactive(original)
		// 响应式对象不等于原对象
		expect(observed).not.toBe(original)
		// 对象是响应式的
		expect(isReactive(observed)).toBe(true)
		// 原对象不是响应式的
		expect(isReactive(original)).toBe(false)
		// get 获取值
		expect(observed.foo).toBe(1)
		// 	// has 测试响应式对象是否含有某属性
		expect('foo' in observed).toBe(true)
		// 	// ownKeys 测试响应式对象是否含有某个键
		expect(Object.keys(observed)).toEqual(['foo', 'bar'])
		// 	// 重复对象, 两个对象完全一致，那么我们返回缓存就可以了
		expect(sameObserved).toBe(observed)

		expect(isReactive(observed.bar)).toBe(true)
		expect(isReactive(original.bar)).toBe(false)
		expect(isProxy(observed)).toBe(true)
		expect(isProxy(original)).toBe(false)
	})

	// test('nested reactives', () => {
	// 	const original = {
	// 		nested: {
	// 			foo: 1
	// 		},
	// 		array: [{ bar: 2 }]
	// 	}
	// 	const observed = reactive(original)
	// 	expect(isReactive(observed.nested)).toBe(true)
	// 	expect(isReactive(observed.array)).toBe(true)
	// 	expect(isReactive(observed.array[0])).toBe(true)
	// })

	// test('toRaw', () => {
	// 	const original = { foo: 1 }
	// 	const observed = reactive(original)
	// 	// expect(toRaw(observed)).toBe(original)
	// 	// expect(toRaw(original)).toBe(original)
	// })
})
