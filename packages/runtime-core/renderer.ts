import { createComponentInstance, setupComponent } from './component'
export function render(vnode, container) {
	// patch
	patch(vnode, container)
}

function patch(vnode, container) {
	// 处理组件
	processComponent(vnode, container)
}

function processComponent(vnode, container) {
	// 处理组件
	mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
	// 创建组件实例
	const instance = createComponentInstance(vnode)
	// 初始化组件
	setupComponent(instance)
	// 挂载组件
	setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
	const subTree = instance.render()
	patch(subTree, container)
}
