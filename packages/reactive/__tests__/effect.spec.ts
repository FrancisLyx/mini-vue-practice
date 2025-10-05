import { reactive } from '../src/reactive'
import { effect, stop } from '../src/effect'
describe('effect', () => {
	// effect使用
	it('effect usage', () => {
		const user = reactive({
			age: 10
		})
		let nextAge
		effect(() => {
			nextAge = user.age + 1
		})
		expect(nextAge).toBe(11)
		user.age++
		expect(nextAge).toBe(12)
	})
	it('effect runner', () => {
		// effect runner effect(fn) => function(runner) => fn() => return
		let foo = 10
		const runner = effect(() => {
			foo++
			return 'foo'
		})
		expect(foo).toBe(11)
		const r = runner()
		expect(foo).toBe(12)
		expect(r).toBe('foo')
	})
	it('scheduler', () => {
		let dummy
		let run
		const scheduler = vi.fn(() => {
			run = runner
		})
		const obj = reactive({ foo: 1 })
		const runner = effect(
			() => {
				dummy = obj.foo
			},
			{ scheduler }
		)
		expect(scheduler).not.toHaveBeenCalled()
		expect(dummy).toBe(1)
		obj.foo++
		expect(scheduler).toHaveBeenCalledTimes(1)
		expect(dummy).toBe(1)
		run()
		expect(dummy).toBe(2)
	})
	it('stop', () => {
		let dummy
		const obj = reactive({ prop: 1 })
		const runner = effect(() => {
			dummy = obj.prop
		})
		obj.prop = 2
		expect(dummy).toBe(2)
		// 停止更新，相当于把依赖都删除掉了
		stop(runner)
		// obj.prop = 3
		obj.prop++
		expect(dummy).toBe(2)

		// stoped effect should still be manually callable
		runner()
		expect(dummy).toBe(3)
	})
	it('onStop', () => {
		const obj = reactive({ foo: 1 })
		const onStop = vi.fn()
		const runner = effect(
			() => {
				obj.foo
			},
			{ onStop }
		)
		stop(runner)
		expect(onStop).toHaveBeenCalledTimes(1)
	})
})
