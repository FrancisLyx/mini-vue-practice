import { baseHandler, readonlyHandler } from './baseHandler'

const reactiveMap = new WeakMap()

export const enum ReactiveFlag {
	IS_REACTIVE = '__v_isReactive',
	IS_READONLY = '__v_isReadonly'
}

export function isReactive(target) {
	return !!target[ReactiveFlag.IS_REACTIVE]
}

export function isReadonly(target) {
	return !!target[ReactiveFlag.IS_READONLY]
}

export function readonly(target) {
	return createReactiveObject(target, reactiveMap, true)
}

export function reactive(target) {
	return createReactiveObject(target, reactiveMap, false)
}

function createReactiveObject(target, proxyMap: WeakMap<object, object>, isReadonly = false) {
	// 存在缓存
	let exsistingReactiveObject = proxyMap.get(target)
	if (exsistingReactiveObject) return exsistingReactiveObject

	const proxy = new Proxy(target, isReadonly ? readonlyHandler : baseHandler)
	proxyMap.set(target, proxy)
	return proxy
}
