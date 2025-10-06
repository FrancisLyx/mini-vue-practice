// ref 通常应用于值类型，因为值类型是不能够被proxy劫持的，proxy针对引用类型进行劫持，所以需要重新写一个类，外部通过.value去访问这个值类型的值，内部重新写上get set方法，然后也需要进行依赖收集和依赖触发。

import { trackEffect, triggerEffect, isTracking } from './effect'
import { hasChanged, isObject } from '@mini-vue/shared'
import { reactive } from './reactive'

class RefImpl {
	private _value: any
	public deps: Set<any>
	constructor(value) {
		if (isObject(value)) {
			value = reactive(value)
		}
		this._value = value
		this.deps = new Set()
	}
	get value() {
		trackRefValue(this)
		return this._value
	}
	set value(newVal) {
		if (!hasChanged(this._value, newVal)) return
		if (isObject(newVal)) {
			newVal = reactive(newVal)
		}
		this._value = newVal
		triggerEffect(this.deps)
	}
}

export function ref(value) {
	return new RefImpl(value)
}

function trackRefValue(ref) {
	if (isTracking()) {
		trackEffect(ref.deps)
	}
	return ref._value
}
