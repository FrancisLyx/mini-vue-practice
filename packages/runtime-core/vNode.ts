import { ShapeFlags } from '@mini-vue/shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type: any, props?: any, children?: any) {
	const vnode = {
		type,
		props,
		children,
		shapeFlags: getShapeFlags(type),
		el: null
	}
	if (typeof children === 'string') {
		vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN
	}

	if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
		if (typeof children === 'object') {
			vnode.shapeFlags |= ShapeFlags.SLOTS_CHILDREN
		}
	}
	return vnode
}
function getShapeFlags(type: any) {
	return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode(text: string) {
	return createVNode(Text, {}, text)
}
