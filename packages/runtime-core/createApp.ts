import { createVNode } from './vNode'

export function createAppAPI(render) {
	return function createApp(rootComponent) {
		return {
			mount(rootContainer) {
				//   转化成虚拟节点
				const vnode = createVNode(rootComponent)
				render(vnode, rootContainer, null)
			}
		}
	}
}
