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
	active = true
	deps: Set<ReactiveEffect>[] = []
	constructor(public fn) {}
	run() {
		activeEffect = this
		return this.fn()
	}
}

export function effect(fn) {
	const _effect = new ReactiveEffect(fn)
	_effect.run()
	return _effect.run.bind(_effect)
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
	deps.add(activeEffect)
	activeEffect?.deps.push(deps)
}

export function trigger(target, key) {
	const depsMap = targetMap.get(target)
	if (!depsMap) return
	const deps = depsMap.get(key)
	if (deps) {
		deps.forEach((dep) => dep.run())
	}
}
