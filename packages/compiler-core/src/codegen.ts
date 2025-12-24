export function generate(ast) {
	const context = createCodegenContext()
	const { push } = context

	const functionName = 'render'
	const args = ['_ctx', '_cache']
	const signature = args.join(', ')

	push(`function ${functionName}(${signature}) {`)
	push(`return`)

	getNode(ast.codegenNode, context)
	push(`}`)
	return {
		code: context.code
	}
}

function createCodegenContext() {
	const context = {
		code: '',
		push(code) {
			context.code += code
		}
	}
	return context
}

function getNode(node: any, context: any) {
	const { push } = context
	push(`'${node.content}'`)
}
