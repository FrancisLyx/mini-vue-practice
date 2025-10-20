import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '@mini-vue/shared'
export function render(vnode, container) {
	// patch
	patch(vnode, container)
}

function patch(vnode, container) {
	// 处理组件
	const { shapeFlags } = vnode
	if (shapeFlags & ShapeFlags.ELEMENT) {
		processElement(vnode, container)
	} else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
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
	const { children, shapeFlags } = vnode
	if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
		el.textContent = children
	} else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
		mountChildren(children, el)
	}

	// props
	const { props } = vnode
	for (const key in props) {
		const value = props[key]
		const isOn = (key: string) => /^on[A-Z]/.test(key)
		if (isOn(key)) {
			const event = key.slice(2).toLowerCase()
			el.addEventListener(event, props[key])
		} else {
			// 添加属性
			el.setAttribute(key, value)
		}
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

function mountComponent(initialVNode, container) {
	// 创建组件实例
	const instance = createComponentInstance(initialVNode)
	// 初始化组件
	setupComponent(instance)
	// 挂载组件
	setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
	const { proxy } = instance
	const subTree = instance.render.call(proxy)
	patch(subTree, container)
	initialVNode.el = subTree.el
}
