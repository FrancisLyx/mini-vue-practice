import { track, trigger } from './effect'
import { ReactiveFlag, reactive, readonly } from './reactive'
import { extend, isObject } from '@mini-vue/shared'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
	return function get(target, key, receiver) {
		if (key === ReactiveFlag.IS_READONLY && isReadonly) {
			return true
		}
		if (key === ReactiveFlag.IS_REACTIVE && !isReadonly) {
			return true
		}
		const res = Reflect.get(target, key, receiver)
		if (shallow) {
			return res
		}
		if (isObject(res)) {
			return isReadonly ? readonly(res) : reactive(res)
		}
		if (!isReadonly) {
			track(target, key)
		}
		return res
	}
}

function createSetter() {
	return function set(target, key, value, receiver) {
		const result = Reflect.set(target, key, value, receiver)
		trigger(target, key)
		return result
	}
}

export const readonlyHandler = {
	get: readonlyGet,
	set(target, key) {
		console.warn(`Set operation on key "${key}" failed: target is readonly.`)
		return true
	}
}

export const baseHandler = {
	get,
	set
}

export const shallowReadonlyHandler = extend({}, readonlyHandler, {
	get: shallowReadonlyGet
})
