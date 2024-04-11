import type { Cookies } from '@sveltejs/kit'
import type { SafeUser } from '$lib/dbtypes'
import { env } from '$env/dynamic/private'

/*
Generate a new key by running:
	```js
	crypto.subtle.generateKey({
		name: "AES-CTR",
		length: 256
	}, true, ["encrypt", "decrypt"])
		.then(key => crypto.subtle.exportKey('jwk', key))
		.then(({k}) => console.log(k))
	```
in your browser's JS console, or in deno/node/bun, and set the output generated to the environment variable `SESSION_SECRET`
*/
function getSessionKey() {
	const SECRET_KEY: JsonWebKey = {
		key_ops: ['encrypt', 'decrypt'],
		ext: true,
		kty: 'oct',
		k: env.SESSION_SECRET,
		alg: 'A256CTR'
	}
	return crypto.subtle.importKey('jwk', SECRET_KEY, { name: 'AES-CTR' }, false, [
		'encrypt',
		'decrypt'
	])
}

async function encrypt(data: string) {
	const key = await getSessionKey()
	const counter = crypto.getRandomValues(new Uint8Array(16))
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-CTR', counter, length: 128 },
		key,
		new TextEncoder().encode(data)
	)

	return { encrypted, counter }
}

async function decrypt(encrypted: ArrayBuffer, counter: Uint8Array) {
	const key = await getSessionKey()
	const data = await crypto.subtle.decrypt(
		{ name: 'AES-CTR', counter, length: 128 },
		key,
		encrypted
	)
	return new TextDecoder().decode(data)
}

function uint8ArrayToB64(d: Uint8Array) {
	return btoa(String.fromCharCode(...d))
}

function b64ToUint8Array(b64: string) {
	return Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))
}

export interface Session {
	userId?: SafeUser['id']
}

/**
 * Write out the users session to their cookies.
 * @param data The data to store
 */
export async function saveSession(data: Session, cookies: Cookies) {
	const { counter, encrypted } = await encrypt(JSON.stringify(data))

	const cookieData = `${uint8ArrayToB64(new Uint8Array(encrypted))}:${uint8ArrayToB64(counter)}`
	cookies.set('session', cookieData, {
		httpOnly: true,
		sameSite: 'strict',
		path: '/',
		maxAge: 604_800
	})
}

export async function getSession(cookies: Cookies) {
	const cookieData = cookies.get('session')
	if (!cookieData || cookieData.split(':').length !== 2) return null

	try {
		const encrypted = b64ToUint8Array(cookieData.split(':')[0])
		const counter = b64ToUint8Array(cookieData.split(':')[1])

		return JSON.parse(await decrypt(encrypted, counter)) as Session
	} catch {
		cookies.delete('session', { path: '/' })
		return null
	}
}
