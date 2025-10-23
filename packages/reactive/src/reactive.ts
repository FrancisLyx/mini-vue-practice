import { baseHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandler'
import { isObject } from '@mini-vue/shared'

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

export function isProxy(target) {
	return isReactive(target) || isReadonly(target)
}

export function readonly(target) {
	return createReactiveObject(target, reactiveMap, true)
}

export function reactive(target) {
	return createReactiveObject(target, reactiveMap, false)
}

export function shallowReadonly(target) {
	return createReactiveObject(target, reactiveMap, false, true)
}

function createReactiveObject(
	target,
	proxyMap: WeakMap<object, object>,
	isReadonly = false,
	shallow = false
) {
	if (!isObject(target)) {
		console.warn(`target ${target} is not an object`)
		return
	}
	// 存在缓存
	let exsistingReactiveObject = proxyMap.get(target)
	if (exsistingReactiveObject) return exsistingReactiveObject

	const proxy = new Proxy(
		target,
		isReadonly ? readonlyHandler : shallow ? shallowReadonlyHandler : baseHandler
	)
	proxyMap.set(target, proxy)
	return proxy
}
