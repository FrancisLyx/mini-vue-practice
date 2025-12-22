import { baseParse } from '../src/parse'
import { NodeTypes } from '../src/ast'

describe('Parse', () => {
	describe('interpolation', () => {
		test('simple interpolation', () => {
			const ast = baseParse('{{ message }}')
			expect(ast.children[0]).toStrictEqual({
				type: NodeTypes.INTERPOLATION,
				content: {
					type: NodeTypes.SIMPLE_EXPRESSION,
					content: 'message'
				}
			})
		})
	})
})

describe('element', () => {
	it('simple element div', () => {
		const ast = baseParse('<div></div>')
		expect(ast.children[0]).toStrictEqual({
			type: NodeTypes.ELEMENT,
			tag: 'div',
			children: []
		})
	})
})

describe('text', () => {
	it('simple text', () => {
		const ast = baseParse('hello')
		expect(ast.children[0]).toStrictEqual({
			type: NodeTypes.TEXT,
			content: 'hello'
		})
	})
})

test('hello world', () => {
	const ast = baseParse('<div><p>hi,{{message}}</p></div>')
	expect(ast.children[0]).toStrictEqual({
		type: NodeTypes.ELEMENT,
		tag: 'div',
		children: [
			{
				type: NodeTypes.ELEMENT,
				tag: 'p',
				children: [
					{
						type: NodeTypes.TEXT,
						content: 'hi,'
					},
					{
						type: NodeTypes.INTERPOLATION,
						content: {
							type: NodeTypes.SIMPLE_EXPRESSION,
							content: 'message'
						}
					}
				]
			}
		]
	})
})

test('nested elements', () => {
	const ast = baseParse('<div><p>hi,{{message}}</p><p>hello,{{name}}</p></div>')
	expect(ast.children[0]).toStrictEqual({
		type: NodeTypes.ELEMENT,
		tag: 'div',
		children: [
			{
				type: NodeTypes.ELEMENT,
				tag: 'p',
				children: [
					{
						type: NodeTypes.TEXT,
						content: 'hi,'
					},
					{
						type: NodeTypes.INTERPOLATION,
						content: {
							type: NodeTypes.SIMPLE_EXPRESSION,
							content: 'message'
						}
					}
				]
			},
			{
				type: NodeTypes.ELEMENT,
				tag: 'p',
				children: [
					{
						type: NodeTypes.TEXT,
						content: 'hello,'
					},
					{
						type: NodeTypes.INTERPOLATION,
						content: {
							type: NodeTypes.SIMPLE_EXPRESSION,
							content: 'name'
						}
					}
				]
			}
		]
	})
})

test('should throw error when lack of end tag', () => {
	expect(() => baseParse('<div><span></div>')).toThrowError('Lack of end tag')
})
