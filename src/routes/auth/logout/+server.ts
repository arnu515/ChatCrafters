import { saveSession } from '$lib/auth/sessions.server'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, cookies }) => {
	locals.user = null
	await saveSession({ ...locals.session, userId: undefined }, cookies)

	redirect(302, '/auth?mode=login')
}
