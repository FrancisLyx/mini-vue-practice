import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transform/transformExpression'

describe('codegen', () => {
	it('simple interpolation', () => {
		const ast = baseParse('hi 1')
		transform(ast, {
			nodeTransforms: []
		})
		const { code } = generate(ast)
		expect(code).toMatchSnapshot('`hi 1`')
	})
	it.only('simple interpolation', () => {
		const ast = baseParse('{{ message }}')
		transform(ast, {
			nodeTransforms: [transformExpression]
		})
		const { code } = generate(ast)
		expect(code).toMatchSnapshot('`{{ message }}`')
	})
})
