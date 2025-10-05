import { extend } from '@mini-vue/shared'
// 当前正在执行的副作用
let activeEffect: ReactiveEffect | null = null
//  默认状态不需要收集
let shouldTrack = false

/**
 *  对象依赖表  targetMap -> depsMap -> deps
 * targetMap weakMap target -> effect
 *  - depsMap map target -> effect
 *    - deps  副作用集合set effect
 */
const targetMap = new WeakMap()

function cleanupEffect(effect: ReactiveEffect) {
	// 从所有依赖的集合中移除当前 effect
	effect.deps.forEach((deps) => {
		deps.delete(effect)
	})
	// 清空 effect 的依赖记录
	effect.deps.length = 0
}

export class ReactiveEffect {
	// 当前执行状态
	active = true
	deps: Set<ReactiveEffect>[] = []
	onStop?: () => void
	constructor(
		public fn,
		public scheduler
	) {}
	run() {
		// 非激活状态，不需要收集依赖
		if (!this.active) {
			return this.fn()
		}
		// 依赖收集
		shouldTrack = true
		activeEffect = this

		const result = this.fn()
		shouldTrack = false

		return result
	}
	stop() {
		if (this.active) {
			// 清空依赖
			cleanupEffect(this)
			this.onStop && this.onStop()
			this.active = false
		}
	}
}

export function effect(fn, options: any = {}) {
	const scheduler = options.scheduler
	const _effect = new ReactiveEffect(fn, scheduler)
	extend(_effect, options)
	_effect.run()
	const runner = _effect.run.bind(_effect)
	runner.effect = _effect
	return runner
}

export function track(target, key) {
	if (!isTracking()) return

	let depsMap = targetMap.get(target)
	if (!depsMap) {
		targetMap.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	if (deps.has(activeEffect)) return
	// 让响应式属性知道，我具体依赖了哪些effect
	deps.add(activeEffect)
	// 让当前的副作用知道，我依赖了哪些响应式属性
	activeEffect?.deps.push(deps)
}

// 执行targetMap => depsMap => deps 全部执行
export function trigger(target, key) {
	const depsMap = targetMap.get(target)
	if (!depsMap) return
	const deps = depsMap.get(key)
	if (deps) {
		deps.forEach((dep) => {
			if (dep.scheduler) {
				dep.scheduler()
			} else {
				dep.run()
			}
		})
	}
}

export function stop(runner) {
	runner.effect.stop()
}

function isTracking() {
	return shouldTrack && activeEffect !== null
}
