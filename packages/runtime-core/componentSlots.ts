import { ShapeFlags } from '@mini-vue/shared'

export function initSlots(instance, children) {
	// slots
	const { vnode } = instance
	if (vnode.shapeFlags & ShapeFlags.SLOTS_CHILDREN) {
		normalizeObjectSlots(children, instance.slots)
	}
}

function normalizeObjectSlots(children, slots) {
	for (const key in children) {
		const value = children[key]
		slots[key] = (props) => normalizeSlotValue(value(props))
	}
}

function normalizeSlotValue(value) {
	return Array.isArray(value) ? value : [value]
}
