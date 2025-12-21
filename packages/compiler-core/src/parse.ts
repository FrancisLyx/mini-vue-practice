import { NodeTypes } from './ast'
export function baseParse(content: string) {
	const context = createParserContext(content)
	return createRoot(parseChildren(context))
}

function createRoot(children) {
	return {
		children
	}
}

function createParserContext(content: string) {
	return {
		source: content
	}
}

function parseChildren(context) {
	const nodes: any = []

	let node
	const s = context.source
	if (s.startsWith('{{')) {
		node = parseInterpolation(context)
	} else if (s.startsWith('<')) {
		if (/[a-z]/i.test(s[1])) {
			node = parseElement(context)
		}
	}

	nodes.push(node)

	return nodes
}

function parseTag(context, tagType) {
	const match: any = /^<\/?([a-z]*)/i.exec(context.source)
	const tag = match[1]
	advanceBy(context, match[0].length)
	advanceBy(context, 1)
	if (tagType === 'start') {
		return {
			type: NodeTypes.ELEMENT,
			tag
		}
	}
}

function parseElement(context) {
	const element = parseTag(context, 'start')
	parseTag(context, 'end')
	return element
}

function parseInterpolation(context) {
	const openDelimiter = '{{'
	const closeDelimiter = '}}'

	const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

	advanceBy(context, openDelimiter.length)

	const rawContentLength = closeIndex - openDelimiter.length

	const rawContent = context.source.slice(0, rawContentLength)
	const content = rawContent.trim()

	advanceBy(context, rawContentLength + closeDelimiter.length)

	return {
		type: NodeTypes.INTERPOLATION,
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION,
			content: content.trim()
		}
	}
}

function advanceBy(context: any, length: number) {
	context.source = context.source.slice(length)
}
