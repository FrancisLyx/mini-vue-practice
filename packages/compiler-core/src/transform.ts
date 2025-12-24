import { NodeTypes } from './ast'
export function transform(root, context) {
	// 遍历 深度有限搜索
	traverseNode(root, context)

	createRootCodegen(root)
}

function createRootCodegen(root) {
	root.codegenNode = root.children[0]
}

function traverseNode(node: any, context: any) {
	// 插件化 transofrmNode 处理节点
	const nodeTransforms = context.nodeTransforms
	for (let i = 0; i < nodeTransforms.length; i++) {
		const transform = nodeTransforms[i]
		transform(node, context)
	}
	traverseChildren(node, context)
}

function traverseChildren(node: any, context) {
	const children = node.children
	if (children) {
		for (let i = 0; i < children.length; i++) {
			traverseNode(children[i], context)
		}
	}
}
