import { isObject } from '@mini-vue/shared'
import { createComponentInstance, setupComponent } from './component'
export function render(vnode, container) {
	// patch
	patch(vnode, container)
}

function patch(vnode, container) {
	// 处理组件
	// console.log(vnode.type, 'vnode.type==>')
	if (typeof vnode.type === 'string') {
		processElement(vnode, container)
	} else if (isObject(vnode.type)) {
		processComponent(vnode, container)
	}
}

function processElement(vnode, container) {
	// 处理element
	mountElement(vnode, container)
}

function mountElement(vnode, container) {
	const el = document.createElement(vnode.type)
	vnode.el = el
	const { children } = vnode
	if (typeof children === 'string') {
		el.textContent = children
	} else if (Array.isArray(children)) {
		mountChildren(children, el)
	}

	// props
	const { props } = vnode
	for (const key in props) {
		const value = props[key]
		// 添加属性
		el.setAttribute(key, value)
	}
	container.append(el)
}

function mountChildren(children, container) {
	children.forEach((v) => {
		patch(v, container)
	})
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
	setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance, vnode, container) {
	const { proxy } = instance
	const subTree = instance.render.call(proxy)
	patch(subTree, container)
	vnode.el = subTree.el
}
