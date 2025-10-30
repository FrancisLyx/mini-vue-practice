import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '@mini-vue/shared'
import { Fragment, Text } from './vNode'
import { createAppAPI } from './createApp'
import { effect } from '@mini-vue/reactive'
export function createRenderer(options) {
	const { createElement, patchProp, insert } = options
	function render(vnode, container, parentComponent) {
		// patch
		patch(null, vnode, container, parentComponent)
	}

	function patch(n1, n2, container, parentComponent) {
		// 处理组件
		const { type, shapeFlags } = n2

		// Fragment -> 只渲染 children
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlags & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent)
				} else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent)
				}
				break
		}
	}

	function processFragment(n1, n2, container, parentComponent) {
		mountChildren(n2, container, parentComponent)
	}

	function processText(n1, n2, container) {
		const { children } = n2
		const textNode = (n2.el = document.createTextNode(children))
		container.append(textNode)
	}

	function processElement(n1, n2, container, parentComponent) {
		// 处理element
		if (!n1) {
			mountElement(n2, container, parentComponent)
		} else {
			patchElement(n1, n2, container)
		}
	}

	function patchElement(n1, n2, container) {
		console.log('patchElement')
		console.log(n1, n2)
	}

	function mountElement(vnode, container, parentComponent) {
		const el = createElement(vnode.type)
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
			patchProp(el, key, value)
		}
		insert(el, container)
	}

	function mountChildren(vnode, container, parentComponent) {
		vnode.children.forEach((v) => {
			patch(null, v, container, parentComponent)
		})
	}

	function processComponent(n1, n2, container, parentComponent) {
		// 处理组件
		mountComponent(n2, container, parentComponent)
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
		effect(() => {
			if (!instance.isMounted) {
				// 初始化
				console.log('init')
				const { proxy } = instance
				const subTree = (instance.subTree = instance.render.call(proxy))

				patch(null, subTree, container, instance)

				initialVNode.el = subTree.el
				instance.isMounted = true
			} else {
				console.log('update')
				const { proxy } = instance
				const subTree = instance.render.call(proxy)
				const prevSubTree = instance.subTree
				instance.subTree = subTree

				patch(prevSubTree, subTree, container, instance)
			}
		})
	}
	return {
		createApp: createAppAPI(render)
	}
}
