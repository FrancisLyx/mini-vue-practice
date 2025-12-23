import { NodeTypes } from './ast'

const enum TagType {
	START = 'start',
	END = 'end'
}
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

function parseChildren(context, ancestors: any[] = []) {
	const nodes: any = []

	while (!isEnd(context, ancestors)) {
		let node
		const s = context.source
		if (s.startsWith('{{')) {
			node = parseInterpolation(context)
		} else if (s.startsWith('<')) {
			if (/[a-z]/i.test(s[1])) {
				node = parseElement(context, ancestors)
			}
		}
		if (!node) {
			node = parseText(context)
		}
		nodes.push(node)
	}

	return nodes
}

function isEnd(context, ancestors: string[]) {
	// 1. 遇到结束标签
	// 3. 文本结束
	const s = context.source
	if (s.startsWith('</')) {
		for (let i = ancestors.length - 1; i >= 0; i--) {
			const tag = (ancestors[i] as any).tag
			if (startsWithEndTagOpen(s, tag)) {
				return true
			}
		}
	}
	return !s
}

function parseTag(context, tagType: TagType) {
	const match: any = /^<\/?([a-z]*)/i.exec(context.source)
	const tag = match[1]
	advanceBy(context, match[0].length)
	advanceBy(context, 1)

	if (tagType === TagType.END) return
	return {
		type: NodeTypes.ELEMENT,
		tag
	}
}

function parseElement(context, ancestors) {
	const element: any = parseTag(context, TagType.START)
	ancestors.push(element)
	element.children = parseChildren(context, ancestors)
	ancestors.pop()

	if (startsWithEndTagOpen(context.source, element.tag)) {
		parseTag(context, TagType.END)
	} else {
		throw new Error(`Lack of end tag`)
	}
	// parseTag(context, TagType.END)
	return element
}

function startsWithEndTagOpen(source, tag) {
	return (
		source.startsWith('</') &&
		source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
	)
}

function parseTextData(context, length) {
	const content = context.source.slice(0, length)
	advanceBy(context, length)
	return content
}
function parseText(context) {
	let endIndex = context.source.length
	let endTokens = ['{{', '<']
	for (let i = 0; i < endTokens.length; i++) {
		const index = context.source.indexOf(endTokens[i])
		if (index !== -1 && index < endIndex) {
			// 截取到离文本结束最近的标记进行处理
			endIndex = index
		}
	}
	const content = parseTextData(context, endIndex)
	return {
		type: NodeTypes.TEXT,
		content
	}
}
function parseInterpolation(context) {
	const openDelimiter = '{{'
	const closeDelimiter = '}}'

	const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

	advanceBy(context, openDelimiter.length)

	const rawContentLength = closeIndex - openDelimiter.length

	const rawContent = parseTextData(context, rawContentLength)
	const content = rawContent.trim()

	advanceBy(context, closeDelimiter.length)
	return {
		type: NodeTypes.INTERPOLATION,
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION,
			content: content
		}
	}
}

function advanceBy(context: any, length: number) {
	context.source = context.source.slice(length)
}
