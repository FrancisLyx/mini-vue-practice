import { ComponentPublicInstance } from './componentPublicInstance'
/**
 * 创建组件实例
 * @param vnode
 * @returns 组件实例
 */
export function createComponentInstance(vnode) {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {}
	}
	return component
}

/**
 * 初始化组件
 * @param instance 组件实例
 */
export function setupComponent(instance) {
	// 初始化组件
	// TODO: initprops
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
		const setupResult = setup()
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
