import { ComponentPublicInstance } from './componentPublicInstance'
import { initProps } from './componentProps'
import { shallowReadonly } from 'packages/reactive/src/reactive'
import { emit } from './componentEmit'
/**
 * 创建组件实例
 * @param vnode
 * @returns 组件实例
 */
export function createComponentInstance(vnode) {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
		emit: () => {}
	}
	component.emit = emit.bind(null, component) as any
	return component
}

/**
 * 初始化组件
 * @param instance 组件实例
 */
export function setupComponent(instance) {
	// 初始化组件
	initProps(instance, instance.vnode.props)
	// TODO: initSlots
	// 执行组件的setup函数
	setupStatefulComponent(instance)
}

/**
 * 执行组件的 setup 函数
 * @param instance
 */
function setupStatefulComponent(instance) {
	const Component = instance.type

	// ctx对象代理
	instance.proxy = new Proxy({ _: instance }, ComponentPublicInstance)
	const { setup } = Component
	if (setup) {
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		})
		handleSetupResult(instance, setupResult)
	}
}

/**
 * 处理组件的 setup 函数
 * @param instance 组件实例
 * @param setupResult 组件的 setup 函数返回值
 */
function handleSetupResult(instance, setupResult) {
	if (typeof setupResult === 'object') {
		instance.setupState = setupResult
	}
	finishComponentSetup(instance)
}

/**
 * 完成组件的 setup
 * @param instance 组件实例
 */
function finishComponentSetup(instance) {
	const Component = instance.type
	if (Component.render) {
		instance.render = Component.render
	}
}
