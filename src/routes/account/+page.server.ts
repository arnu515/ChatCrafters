import { fail, redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"
import { z } from "zod"
import { putFile } from "$lib/s3.server"
import { env } from "$env/dynamic/public"

export const actions = {
	username: async (event) => {
		const user = event.locals.user
		if (!user) {
			redirect(302, "/auth?mode=login")
		}

		const usernameSchema = z.string().max(64).min(4).trim()
		const usernameResult = usernameSchema.safeParse((await event.request.formData()).get("username"))
		if (!usernameResult.success) {
			return fail(400, {
				message: usernameResult.error.issues.map(i => `Error: ${i.message}`).join('\n')
				, action: "username", success: false
			})
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
	avatar: async (event) => {
		const fd = await event.request.formData()
		const avatar = fd.get('avatar')
		if (!avatar || typeof avatar === 'string')
			return fail(400, { message: "Please upload an avatar file", action: "avatar", success: false })

		if (avatar.type !== 'image/png')
			return fail(400, { message: "Please upload a PNG file", action: "avatar", success: false })
		if (avatar.size >= 1048576)  // 1MiB
			return fail(400, { message: "Please upload a file less than 1MiB in size", action: "avatar", success: false })

		const user = event.locals.user
		if (!user)
			redirect(302, "/auth?mode=login")

		try {
			const data = await avatar.arrayBuffer()
			await putFile(`user_avatars/${user.id}.png`, 'public-read', data)
			const cdnUrl = `${env.PUBLIC_S3_CDN_URL}/user_avatars/${user.id}.png`
			await event.platform!.env.db.prepare("UPDATE users SET avatar_url = ?2 WHERE id = ?1").bind(user.id, cdnUrl).run()
			event.locals.user = {
				...user,
				avatar_url: cdnUrl
			}
			return { action: "avatar", success: true }
		} catch (e) {
			if (e instanceof Error) {
				return fail(500, { message: e.message, action: "avatar", success: false })
			}
			throw e
		}
	},
	resetAvatar: async (event) => {
		const user = event.locals.user
		if (!user)
			redirect(302, "/auth?mode=login")
		try {
			const res = await fetch("https://api.dicebear.com/8.x/identicon/png?" + new URLSearchParams({
				// @ts-ignore
				seed: event.locals.user.username,
				backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
				backgroundType: 'gradientLinear',
				backgroundRotation: '0,45,90'
			}).toString())
			if (res.ok && res.headers.get("content-type") === "image/png") {
				const data = await res.arrayBuffer()
				await putFile(`user_avatars/${user.id}.png`, 'public-read', data)
				const cdnUrl = `${env.PUBLIC_S3_CDN_URL}/user_avatars/${user.id}.png`
				await event.platform!.env.db.prepare("UPDATE users SET avatar_url = ?2 WHERE id = ?1").bind(user.id, cdnUrl).run()
				event.locals.user = {
					...user,
					avatar_url: cdnUrl
				}
			}
			return { action: "avatar", success: true }
		} catch (e) {
			if (e instanceof Error) {
				return fail(500, { message: e.message, action: "avatar", success: false })
			}
			throw e
		}
	},
	deleteAccount: () => {
		return fail(501, { message: "Not Implemented.", action: "delete", success: false })
	}
} satisfies Actions

