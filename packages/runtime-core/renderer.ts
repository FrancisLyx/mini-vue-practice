import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '@mini-vue/shared'
import { Fragment, Text } from './vNode'
export function render(vnode, container, parentComponent) {
	// patch
	patch(vnode, container, parentComponent)
}

function patch(vnode, container, parentComponent) {
	// 处理组件
	const { type, shapeFlags } = vnode

	// Fragment -> 只渲染 children
	switch (type) {
		case Fragment:
			processFragment(vnode, container, parentComponent)
			break
		case Text:
			processText(vnode, container)
			break
		default:
			if (shapeFlags & ShapeFlags.ELEMENT) {
				processElement(vnode, container, parentComponent)
			} else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
				processComponent(vnode, container, parentComponent)
			}
			break
	}
}

function processFragment(vnode, container, parentComponent) {
	mountChildren(vnode, container, parentComponent)
}

function processText(vnode, container) {
	const el = document.createTextNode(vnode.children)
	vnode.el = el
	container.append(el)
}

function processElement(vnode, container, parentComponent) {
	// 处理element
	mountElement(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
	const el = document.createElement(vnode.type)
	vnode.el = el
	const { children, shapeFlags } = vnode
	if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
		el.textContent = children
	} else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
		mountChildren(vnode, el, parentComponent)
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

function mountChildren(vnode, container, parentComponent) {
	vnode.children.forEach((v) => {
		patch(v, container, parentComponent)
	})
}

function processComponent(vnode, container, parentComponent) {
	// 处理组件
	mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVNode, container, parentComponent) {
	// 创建组件实例
	const instance = createComponentInstance(initialVNode, parentComponent)
	// 初始化组件
	setupComponent(instance)
	// 挂载组件
	setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
	const { proxy } = instance
	const subTree = instance.render.call(proxy)
	patch(subTree, container, instance)
	initialVNode.el = subTree.el
}
