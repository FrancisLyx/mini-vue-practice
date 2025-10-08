import { createVNode } from './vNode'
import { render } from './renderer'
export function createApp(rootComponent) {
	return {
		mount(rootContainer) {
			//   转化成虚拟节点
			const vnode = createVNode(rootComponent)
			render(vnode, rootContainer)
		}
	}
}
