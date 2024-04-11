import type { MaybePromise } from '@sveltejs/kit'

/**
 * Spec: https://html.spec.whatwg.org/multipage/server-sent-events.html#dispatchMessage
 */
function getOnChunk(onLine: (line: string) => void) {
	let currentLine = ''
	let holdSize = 1
	const onHold: number[] = []

	return function onChunk(chunk: Uint8Array) {
		chunk.forEach(x => {
			if (x === 10) {
				//newline
				onLine(currentLine)
				currentLine = ''
			} else {
				// take care of hold size
				switch (holdSize) {
					case 2: {
						if (onHold.length !== 1) {
							console.error('FAILED to get 2-sized byte', onHold, currentLine)
						} else {
							currentLine += String.fromCharCode(((onHold[0] & 0x1f) << 6) | (x & 0x3f))
							onHold.length = 0
							holdSize = 1
						}
						break
					}
					case 3: {
						if (onHold.length === 1) {
							onHold.push(x)
						} else if (onHold.length !== 2) {
							console.error('FAILED to get 3-sized byte', onHold, currentLine)
						} else {
							currentLine += String.fromCharCode(
								((onHold[0] & 0x0f) << 12) | ((onHold[1] & 0x3f) << 6) | (x & 0x3f)
							)
							onHold.length = 0
							holdSize = 1
						}
						break
					}
					case 4: {
						if (onHold.length === 1 || onHold.length === 2) {
							onHold.push(x)
						} else if (onHold.length !== 3) {
							console.error('FAILED to get 4-sized byte', onHold, currentLine)
						} else {
							currentLine += String.fromCharCode(
								((onHold[0] & 7) << 18) |
									((onHold[1] & 0x3f) << 12) |
									((onHold[1] & 0x3f) << 6) |
									(x & 0x3f)
							)
							onHold.length = 0
							holdSize = 1
						}
						break
					}
					default: {
						if (x < 128) currentLine += String.fromCharCode(x)
						else if ((x & 0b11100000) === 0b11000000) {
							onHold.push(x)
							holdSize = 2
						} else if ((x & 0b11110000) === 0b11100000) {
							onHold.push(x)
							holdSize = 3
						} else if ((x & 0b11111000) === 0b11110000) {
							onHold.push(x)
							holdSize = 4
						}
					}
				}
			}
		})
	}
}

type OnMessage = (msg: string) => MaybePromise<void>

function getOnLine(onMessage?: OnMessage) {
	return function onLine(line: string) {
		// ignore empty lines
		if (!line.trim()) return
		// ignore lines not starting with data:
		if (!line.trim().startsWith('data:')) return
		const message = line.trim().replace('data:', '').trim()
		if (!message) return
		onMessage?.(message)
	}
}

export function parseSSE(res: Response, onMessage?: OnMessage, onDone?: () => MaybePromise<void>) {
	if (!res.body) throw new Error('parseSSE: No body in response')
	const stream = res.body.getReader()
	const onLine = getOnLine(onMessage)
	const onChunk = getOnChunk(onLine)
	;(async () => {
		while (true) {
			const { done, value } = await stream.read()
			if (value) onChunk(value)
			if (done) break
		}
		onDone?.()
	})()
}
