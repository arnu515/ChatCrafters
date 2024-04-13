import { error, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import type { Persona, User } from '$lib/dbtypes'
import { z } from 'zod'
import { genId } from '$lib'
import { userGuard } from '$lib/auth'

export const load: PageServerLoad = async event => {
	const persona = await event
		.platform!.env.db.prepare(
			'SELECT personas.*, users.username, users.avatar_url FROM personas INNER JOIN users ON personas.userId = users.id WHERE personas.id = ?1'
		)
		.bind(event.params.id)
		.first<Persona & { username: User['username']; avatar_url: User['avatar_url'] }>()

	if (!persona) error(404, 'Persona not found')

	if (persona.private && event.locals.user?.id !== persona.userId) error(404, 'Persona not found')

	return { persona }
}

export const actions: Actions = {
	report: async event => {
		const reportRes = z
			.string()
			.min(16)
			.max(2048)
			.safeParse((await event.request.formData()).get('report'))
		if (!reportRes.success) {
			return fail(400, {
				action: 'report',
				message: reportRes.error.issues.map(i => `Error: ${i.message}`).join('\n'),
				success: false
			})
		}

		const user = userGuard(event.locals, event.url)

		try {
			await event
				.platform!.env.db.prepare(
					'INSERT INTO reports (id, report, personaId, userId) VALUES (?1, ?2, ?3, ?4)'
				)
				.bind(genId(), reportRes.data, event.params.id, user.id)
				.run()

			return { action: 'report', success: true, message: 'Report created successfully' }
		} catch (e) {
			if (e instanceof Error) {
				return fail(500, {
					action: 'report',
					message: e.message,
					success: false
				})
			}
			throw e
		}
	}
}
