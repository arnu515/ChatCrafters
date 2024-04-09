import { fail, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { z } from "zod"

export const actions = {
	username: async (event) => {
		const user = event.locals.user
		if (!user) {
			redirect(302, "/auth?mode=login")
		}

		const usernameSchema = z.string().max(64).min(4).trim()
		const usernameResult = usernameSchema.safeParse((await event.request.formData()).get("username"))
		if (!usernameResult.success) {
			return fail(400, { message: usernameResult.error.message, action: "username", success: false })
		}
		if (usernameResult.data === user.username) {
			return fail(400, { message: "Please enter a new username", action: "username", success: false })
		}

		try {
			await event.platform!.env.db.prepare("UPDATE users SET username = ?2 WHERE id = ?1").bind(user.id, usernameResult.data).run()

			event.locals.user = { ...user, username: usernameResult.data }
			return { action: "username", success: true }
		} catch (e) {
			if (e instanceof Error) {
				return fail(500, { message: e.message, action: "username", success: false })
			}
			throw e
		}
	},
	deleteAccount: () => {
		return fail(501, { message: "Not Implemented.", action: "delete", success: false })
	}
} satisfies Actions

