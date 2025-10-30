import { ComponentPublicInstance } from './componentPublicInstance'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { shallowReadonly } from 'packages/reactive/src/reactive'
import { emit } from './componentEmit'
import { proxyRefs } from 'packages/reactive/src/ref'
/**
 * 创建组件实例
 * @param vnode
 * @returns 组件实例
 */
export function createComponentInstance(vnode, parent) {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
		slots: {},
		emit: () => {},
		// 如果parent存在，则使用parent的provides，否则使用空对象
		provides: parent ? parent.provides : {},
		isMounted: false,
		subTree: {},
		parent
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
	initSlots(instance, instance.vnode.children)
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
		// 在setup 作用域下拿到instance
		setCurrentInstance(instance)
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit
		})
		// setup执行完成后，清空掉instance
		setCurrentInstance(null)
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
		instance.setupState = proxyRefs(setupResult)
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

let currentInstance = null

export function getCurrentInstance() {
	return currentInstance
}

export function setCurrentInstance(instance) {
	currentInstance = instance
}
