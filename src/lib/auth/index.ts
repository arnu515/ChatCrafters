import { redirect } from "@sveltejs/kit"

export function userGuard(locals: App.Locals, url?: URL, mode: 'login' | 'signup' = 'login') {
	const { user } = locals
	if (!user) {
		redirect(302, '/auth?' + new URLSearchParams({ mode, next: url?.pathname || '/' }))
	}

	return user
}

