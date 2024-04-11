import type { PageServerLoad } from './$types'
import type { Persona } from '$lib/dbtypes'
import { userGuard } from '$lib/auth'

export const load: PageServerLoad = async event => {
	const user = userGuard(event.locals, event.url)

	const { results: personas } = await event
		.platform!.env.db.prepare('SELECT * FROM personas WHERE userId = ?1')
		.bind(user.id)
		.all<Persona>()
	return { personas }
}
