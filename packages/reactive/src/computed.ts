import { ReactiveEffect } from './effect'

// 计算属性的核心，就是依赖的响应式对象更新之后，需要自动更新
class ComputedRefImpl {
	private _getter: any
	// 是否是新的computed，如果为true，则需要重新计算
	private _dirty: boolean
	private _value: any
	private effect: ReactiveEffect
	constructor(getter) {
		this._getter = getter
		this._dirty = true
		// 副作用运行，并且使用scheduler来更新dirty
		this.effect = new ReactiveEffect(getter, () => {
			if (this._dirty) return
			this._dirty = true
		})
	}
	get value() {
		if (this._dirty) {
			this._dirty = false
			this._value = this.effect.run()
		}
		return this._value
	}
	set value(newVal) {
		console.warn('computed value is readonly')
	}
}

export function computed(getter) {
	return new ComputedRefImpl(getter)
}
