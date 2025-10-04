import { extend } from '@mini-vue/shared'
// 当前正在执行的副作用
let activeEffect: ReactiveEffect | null = null

/**
 *  对象依赖表  targetMap -> depsMap -> deps
 * targetMap target -> effect
 *  - depsMap key -> effect
 *    - deps key -> effect
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
		activeEffect = this
		return this.fn()
	}
	stop() {
		if (this.active) {
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
	let depsMap = targetMap.get(target)
	if (!depsMap) {
		targetMap.set(target, (depsMap = new Map()))
	}
	let deps = depsMap.get(key)
	if (!deps) {
		depsMap.set(key, (deps = new Set()))
	}
	if (!activeEffect) return
	deps.add(activeEffect)
	// 存储deps 方便后续清空依赖
	activeEffect.deps.push(deps)
}

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
