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
	model: string
	prompt: string
	attire: string
	private: boolean
	userId: string
}

export interface VoiceActivity {
	userId: string
	amount: number
	d: string
}
