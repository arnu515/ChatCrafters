export interface User {
	id: string
	email: string
	password: string
	username: string
	avatar_url: string
	created_at: string // ISO date string
	is_banned: number // 0 = false, 1 = true
}

export type SafeUser = Omit<Omit<User, 'password'>, 'is_banned'>
export type SafeUserWithoutEmail = Omit<SafeUser, 'email'>

export interface Persona {
	id: string
	name: string
	summary: string
	model:
		| '@cf/tinyllama/tinyllama-1.1b-chat-v1.0'
		| '@cf/meta/llama-2-7b-chat-int8'
		| '@hf/mistralai/mistral-7b-instruct-v0.2'
	prompt: string
	attire: string
	userId: string
}
