import { track, trigger } from './effect'
import { ReactiveFlag } from './reactive'

const get = createGetter()

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

export const readonlyHandler = {
	get,
	set(target, key, value, receiver) {
		console.warn(`Set operation on key "${key}" failed: target is readonly.`)
		return true
	}
}

export const baseHandler = {
	get,
	set(target, key, value, receiver) {
		const result = Reflect.set(target, key, value, receiver)
		trigger(target, key)
		return result
	}
}
