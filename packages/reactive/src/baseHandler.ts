import { track, trigger } from './effect'
import { ReactiveFlag } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
	return function get(target, key, receiver) {
		if (key === ReactiveFlag.IS_READONLY && isReadonly) {
			return true
		}
		if (key === ReactiveFlag.IS_REACTIVE && !isReadonly) {
			return true
		}
		if (!isReadonly) {
			track(target, key)
		}
		return Reflect.get(target, key, receiver)
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
