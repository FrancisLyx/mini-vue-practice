import { isReadonly, shallowReadonly } from '../src/reactive'

describe('shallowReadonly', () => {
	it('happy path', () => {
		const props = shallowReadonly({
			nested: {
				foo: 1
			}
		})
		expect(isReadonly(props.nested)).toBe(false)
		expect(isReadonly(props)).toBe(true)
	})
})
