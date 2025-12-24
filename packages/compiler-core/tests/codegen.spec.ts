import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'

describe('codegen', () => {
	it('simple interpolation', () => {
		const ast = baseParse('hi 1')
		transform(ast, {
			nodeTransforms: []
		})
		const { code } = generate(ast)
		expect(code).toMatchSnapshot('`hi 1`')
	})
})
