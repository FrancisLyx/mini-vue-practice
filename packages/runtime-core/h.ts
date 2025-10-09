import { createVNode } from './vNode'

export function h(type, props?, children?) {
	return createVNode(h, props, children)
}
