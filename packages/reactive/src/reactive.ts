import { track, trigger } from './effect'

const reactiveMap = new WeakMap()

export const baseHandler = {
	get(target, key, receiver) {
		if (key === ReactiveFlag.IS_REACTIVE) {
			return true
		}
		track(target, key)
		return Reflect.get(target, key, receiver)
	},
	set(target, key, value, receiver) {
		const result = Reflect.set(target, key, value, receiver)
		trigger(target, key)
		return result
	}
}

const enum ReactiveFlag {
	IS_REACTIVE = '__v_isReactive'
}

export function isReactive(target) {
	return !!target[ReactiveFlag.IS_REACTIVE]
}

export function reactive(target) {
	return createReactiveObject(target, reactiveMap, false)
}

function createReactiveObject(target, proxyMap: WeakMap<object, object>, isReadonly = false) {
	// 存在缓存
	let exsistingReactiveObject = proxyMap.get(target)
	if (exsistingReactiveObject) return exsistingReactiveObject

	const proxy = new Proxy(target, baseHandler)
	proxyMap.set(target, proxy)
	return proxy
}
