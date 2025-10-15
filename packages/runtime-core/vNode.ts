import { ShapeFlags } from '@mini-vue/shared'

export function createVNode(type: any, props?: any, children?: any) {
	const vnode = {
		type,
		props,
		children,
		ShapeFlags: getShapeFlags(type),
		el: null
	}
	if (typeof children === 'string') {
		vnode.ShapeFlags |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vnode.ShapeFlags |= ShapeFlags.ARRAY_CHILDREN
	}
	return vnode
}
function getShapeFlags(type: any) {
	return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
