import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transform/transformExpression'
import { transformElement } from '../src/transform/transformElement'
import { transformText } from '../src/transform/transformText'

describe('codegen', () => {
	it('simple interpolation', () => {
		const ast = baseParse('hi 1')
		transform(ast, {
			nodeTransforms: []
		})
		const { code } = generate(ast)
		expect(code).toMatchSnapshot('`hi 1`')
	})
	it('simple interpolation', () => {
		const ast = baseParse('{{ message }}')
		transform(ast, {
			nodeTransforms: [transformExpression]
		})
		const { code } = generate(ast)
		expect(code).toMatchSnapshot('`{{ message }}`')
	})
	it.only('element with props', () => {
		const ast: any = baseParse('<div>hi,{{message}}</div>')
		transform(ast, {
			nodeTransforms: [transformExpression, transformElement, transformText]
		})
		const { code } = generate(ast)
		expect(code).toMatchSnapshot()
	})
})
