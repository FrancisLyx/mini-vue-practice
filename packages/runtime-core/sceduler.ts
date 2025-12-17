const queue: any[] = []
const p = Promise.resolve()
let isFlushPending = false

export function queueJobs(job) {
	if (!queue.includes(job)) {
		console.log(job, 'job')
		queue.push(job)
	}
	queueFlush()
}

function queueFlush() {
	if (isFlushPending) return
	isFlushPending = true
	nextTick(flushJobs)
}

export function nextTick(fn) {
	return fn ? p.then(fn) : p
}

function flushJobs() {
	queue.forEach((job) => job())
	queue.length = 0
	isFlushPending = false
}
