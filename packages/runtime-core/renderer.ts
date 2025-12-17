import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '@mini-vue/shared'
import { Fragment, Text } from './vNode'
import { createAppAPI } from './createApp'
import { effect } from '@mini-vue/reactive'
import { EMPTY_OBJ } from '@mini-vue/shared'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { queueJobs } from './sceduler'
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
		patch(null, vnode, container, parentComponent, null)
	}

	function patch(n1, n2, container, parentComponent, anchor) {
		// 处理组件
		const { type, shapeFlags } = n2

		// Fragment -> 只渲染 children
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent, anchor)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlags & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent, anchor)
				} else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent, anchor)
				}
				break
		}
	}

	function processFragment(n1, n2, container, parentComponent, anchor) {
		mountChildren(n2, container, parentComponent, anchor)
	}

	function processText(n1, n2, container) {
		const { children } = n2
		const textNode = (n2.el = document.createTextNode(children))
		container.append(textNode)
	}

	function processElement(n1, n2, container, parentComponent, anchor) {
		// 处理element
		if (!n1) {
			mountElement(n2, container, parentComponent, anchor)
		} else {
			patchElement(n1, n2, container, parentComponent, anchor)
		}
	}

	function patchElement(n1, n2, container, parentComponent, anchor) {
		const oldProps = n1.props || EMPTY_OBJ
		const newProps = n2.props || EMPTY_OBJ
		const el = (n2.el = n1.el)
		// 处理children的变化
		patchChildren(n1, n2, el, parentComponent, anchor)
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
	function patchChildren(n1, n2, el, parentComponent, anchor) {
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
				mountChildren(n2, el, parentComponent, null)
			} else {
				// array to array
				patchKeyedChildren(c1, c2, el, parentComponent, anchor)
			}
		}
	}

	function patchKeyedChildren(c1, c2, el, parentComponent, anchor) {
		const l2 = c2.length
		let i = 0
		let e1 = c1.length - 1
		let e2 = l2 - 1

		// 1. sync from start left -> right
		while (i <= e1 && i <= e2) {
			const n1 = c1[i]
			const n2 = c2[i]
			if (isSameVNode(n1, n2)) {
				// 如果两个节点相同，那么通过patch方法继续去比较内部的一些属性
				patch(n1, n2, el, parentComponent, anchor)
			} else {
				// 如果两个节点不相同，那么直接跳出循环
				break
			}
			i++
		}

		// 2. sync from end right -> left e1,e2 移动去找左侧不同的节点
		while (i <= e1 && i <= e2) {
			const n1 = c1[e1]
			const n2 = c2[e2]
			if (isSameVNode(n1, n2)) {
				patch(n1, n2, el, parentComponent, anchor)
			} else {
				break
			}
			e1--
			e2--
		}

		// 3. new node is longer than old node add new nodes
		if (i > e1) {
			if (i <= e2) {
				const nextPos = e2 + 1
				const anchor = nextPos < l2 ? c2[nextPos].el : null
				while (i <= e2) {
					patch(null, c2[i], el, parentComponent, anchor)
					i++
				}
			}
		} else if (i > e2) {
			// left hand side comparison
			while (i <= e1) {
				hostRemove(c1[i].el)
				i++
			}
		} else {
			// middle comparison
			const s1 = i
			const s2 = i
			const toBePatched = e2 - s2 + 1
			let patched = 0
			const keyToNewIndexMap = new Map()

			// 创建一个定长的数组来寻找最长递增子序列
			const newIndexToOldIndexMap = new Array(toBePatched)

			let moved = false
			let maxNewIndexSoFar = 0
			for (let i = 0; i < toBePatched; i++) {
				newIndexToOldIndexMap[i] = 0
			}

			for (let i = s2; i <= e2; i++) {
				const nextChild = c2[i]
				keyToNewIndexMap.set(nextChild.key, i)
			}

			for (let i = s1; i <= e1; i++) {
				if (patched >= toBePatched) {
					hostRemove(c1[i].el)
					continue
				}
				const prevChild = c1[i]
				let newIndex
				if (prevChild.key !== null) {
					newIndex = keyToNewIndexMap.get(prevChild.key)
				} else {
					for (let j = s2; j <= e2; j++) {
						if (isSameVNode(prevChild, c2[j])) {
							newIndex = j
							break
						}
					}
				}
				if (newIndex === undefined) {
					hostRemove(prevChild.el)
				} else {
					if (newIndex >= maxNewIndexSoFar) {
						maxNewIndexSoFar = newIndex
					} else {
						moved = true
					}
					// 如果该节点存在，放到映射表中
					newIndexToOldIndexMap[newIndex - s2] = i + 1
					patch(prevChild, c2[newIndex], el, parentComponent, null)
					patched++
				}
			}
			const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
			let j = increasingNewIndexSequence.length - 1

			for (let i = toBePatched - 1; i >= 0; i--) {
				const nextIndex = i + s2
				const nextChild = c2[nextIndex]
				const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
				if (newIndexToOldIndexMap[i] === 0) {
					patch(null, nextChild, el, parentComponent, anchor)
				} else if (moved) {
					if (j < 0 || i !== increasingNewIndexSequence[j]) {
						hostInsert(nextChild.el, el, anchor)
					} else {
						j--
					}
				}
			}
		}
	}
	function isSameVNode(n1, n2) {
		return n1.type === n2.type && n1.key === n2.key
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

	function mountElement(vnode, container, parentComponent, anchor) {
		const el = hostCreateElement(vnode.type)
		vnode.el = el
		const { children, shapeFlags } = vnode
		if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
			el.textContent = children
		} else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(vnode, el, parentComponent, anchor)
		}

		// props
		const { props } = vnode
		for (const key in props) {
			const value = props[key]
			hostPatchProp(el, key, null, value)
		}
		hostInsert(el, container, anchor)
	}

	function mountChildren(vnode, container, parentComponent, anchor) {
		vnode.children.forEach((v) => {
			patch(null, v, container, parentComponent, null)
		})
	}

	function processComponent(n1, n2, container, parentComponent, anchor) {
		// 处理组件
		if (!n1) {
			mountComponent(n2, container, parentComponent, anchor)
		} else {
			updateComponent(n1, n2)
		}
	}

	function updateComponent(n1, n2) {
		const instance = (n2.component = n1.component)
		if (shouldUpdateComponent(n1, n2)) {
			// 是否需要更新节点
			instance.next = n2
			instance.update()
		} else {
			n2.el = n1.el
			instance.vnode = n2
		}
	}

	function mountComponent(initialVNode, container, parentComponent, anchor) {
		// 创建组件实例
		const instance = (initialVNode.component = createComponentInstance(
			initialVNode,
			parentComponent
		))
		// 初始化组件
		setupComponent(instance)
		// 挂载组件
		setupRenderEffect(instance, initialVNode, container, anchor)
	}

	function setupRenderEffect(instance, initialVNode, container, anchor) {
		instance.update = effect(
			() => {
				if (!instance.isMounted) {
					// 初始化
					console.log('init')
					const { proxy } = instance
					const subTree = (instance.subTree = instance.render.call(proxy))

					patch(null, subTree, container, instance, null)

					initialVNode.el = subTree.el
					instance.isMounted = true
				} else {
					console.log('effect update')
					const { next, vnode } = instance
					if (next) {
						next.el = vnode.el
						updateComponentPreRender(instance, next)
					}
					const { proxy } = instance
					const subTree = instance.render.call(proxy)
					const prevSubTree = instance.subTree
					instance.subTree = subTree

					patch(prevSubTree, subTree, container, instance, null)
				}
			},
			{
				scheduler() {
					queueJobs(instance.update)
				}
			}
		)
	}

	function updateComponentPreRender(instance, next) {
		instance.vnode = next
		instance.next = null
		instance.props = next.props
	}

	return {
		createApp: createAppAPI(render)
	}
}

function getSequence(arr) {
	// 原数组
	const p = arr.slice()
	// 结果数组
	const result = [0]
	// 索引
	let i, j, u, v, c
	const len = arr.length
	for (i = 0; i < len; i++) {
		// 当前元素
		const arrI = arr[i]
		// 如果当前元素不为0，则进行比较，0在vue3中表示这个节点是全新的,因此不需要处理
		if (arrI !== 0) {
			// 最后一个元素
			j = result[result.length - 1]
			// 如果当前元素大于最后一个元素，则直接添加到结果数组中
			if (arr[j] < arrI) {
				p[i] = j
				result.push(i)
				continue
			}
			// 二分查找
			u = 0
			v = result.length - 1
			while (u < v) {
				c = (u + v) >> 1
				if (arr[result[c]!] < arrI) {
					u = c + 1
				} else {
					v = c
				}
			}
			// 如果当前元素小于结果数组中的元素，则将当前元素插入到结果数组中
			if (arrI < arr[result[u]!]) {
				if (u > 0) {
					p[i] = result[u - 1]
				}
				result[u] = i
			}
		}
	}

	u = result.length
	v = result[u - 1]
	while (u-- > 0) {
		result[u] = v
		v = p[v]
	}
	return result
}
