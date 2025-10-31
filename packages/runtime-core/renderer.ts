import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '@mini-vue/shared'
import { Fragment, Text } from './vNode'
import { createAppAPI } from './createApp'
import { effect } from '@mini-vue/reactive'
import { EMPTY_OBJ } from '@mini-vue/shared'
export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert,
		remove: hostRemove,
		setElementText: hostSetElementText
	} = options
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
			patchElement(n1, n2, container, parentComponent)
		}
	}

	function patchElement(n1, n2, container, parentComponent) {
		const oldProps = n1.props || EMPTY_OBJ
		const newProps = n2.props || EMPTY_OBJ
		const el = (n2.el = n1.el)
		// 处理children的变化
		patchChildren(n1, n2, el, parentComponent)
		// 处理props的变化
		patchProps(el, oldProps, newProps)
	}

	/**
	 * 处理四种情况
	 * 1. array -> text
	 * @param n1
	 * @param n2
	 * @param el
	 * @returns
	 */
	function patchChildren(n1, n2, el, parentComponent) {
		const prevShapeFlags = n1.shapeFlags
		const { shapeFlags } = n2
		const c1 = n1.children
		const c2 = n2.children

		if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
			if (prevShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
				unmountChildren(c1)
			}
			if (c1 !== c2) {
				hostSetElementText(el, c2)
			}
		} else {
			// 原来是一个text 现在是一个array，先把text节点删了
			if (prevShapeFlags & ShapeFlags.TEXT_CHILDREN) {
				hostSetElementText(el, '')
				mountChildren(n2, el, parentComponent)
			}
		}
	}

	function unmountChildren(children) {
		for (let i = 0; i < children.length; i++) {
			const el = children[i].el
			hostRemove(el)
		}
	}

	function patchProps(el, oldProps, newProps) {
		// props值被修改
		for (const key in newProps) {
			const prevProp = oldProps[key]
			const nextProp = newProps[key]
			if (prevProp !== nextProp) {
				hostPatchProp(el, key, prevProp, nextProp)
			}
		}
		// props值被删除
		if (oldProps !== EMPTY_OBJ) {
			for (const key in oldProps) {
				if (!(key in newProps)) {
					hostPatchProp(el, key, oldProps[key], null)
				}
			}
		}
	}

	function mountElement(vnode, container, parentComponent) {
		const el = hostCreateElement(vnode.type)
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
			hostPatchProp(el, key, null, value)
		}
		hostInsert(el, container)
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
