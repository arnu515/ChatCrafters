import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Persona } from "$lib/dbtypes";

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user
	if (!user) redirect(302, "/auth?mode=login")

	const { results: personas } = await event.platform!.env.db.prepare("SELECT * FROM personas WHERE userId = ?1").bind(user.id).all<Persona>()
	return { personas }
}

