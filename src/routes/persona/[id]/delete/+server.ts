import { userGuard } from '$lib/auth'
import type { Persona } from '$lib/dbtypes'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { deleteFile } from '$lib/s3.server'

export const DELETE: RequestHandler = async event => {
	const user = userGuard(event.locals, event.url)

	const persona = await event
		.platform!.env.db.prepare(
			'DELETE FROM personas WHERE personas.id = ?1 AND personas.userId = ?2 RETURNING *'
		)
		.bind(event.params.id, user.id)
		.first<Persona>()

	if (!persona)
		return json(
			{ error: "Persona not found, or you don't have the permission to delete it" },
			{ status: 404 }
		)

	// delete from S3
	try {
		await deleteFile(`persona_avatars/${persona.id}.png`)
	} catch (e) {
		console.error(e)
	}
	return json(persona)
}
