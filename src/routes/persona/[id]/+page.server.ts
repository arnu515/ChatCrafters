import { error, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import type { Persona, User } from "$lib/dbtypes"

export const load: PageServerLoad = async (event) => {
	const persona = await event.platform!.env.db.prepare("SELECT personas.*, users.username, users.avatar_url FROM personas INNER JOIN users ON personas.userId = users.id WHERE personas.id = ?1").bind(event.params.id).first<Persona & { username: User['username'], avatar_url: User['avatar_url'] }>()

	if (!persona)
		error(404, "Persona not found")

	return { persona }
}

