export * from './runtime-dom'

import { baseCompiler } from './compiler-core/src'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-core/component'

function compileToFunction(template: string) {
	const { code } = baseCompiler(template)
	console.log(code, 'code')
	const render = new Function('Vue', code)(runtimeDom)
	console.log(render, 'render')
	return render
}

registerRuntimeCompiler(compileToFunction)

export { compileToFunction }
