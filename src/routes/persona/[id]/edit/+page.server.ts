import { userGuard } from '$lib/auth'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { Persona } from '$lib/dbtypes'

export const load: PageServerLoad = async event => {
	const user = userGuard(event.locals, event.url)

	const persona = await event
		.platform!.env.db.prepare(
			'SELECT * FROM personas WHERE personas.id = ?1 AND personas.userId = ?2'
		)
		.bind(event.params.id, user.id)
		.first<Persona>()

	if (!persona) error(404, "Persona not found, or you don't have the permission to edit it")

	return { persona }
}
