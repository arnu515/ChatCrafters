import { genId } from "$lib";
import { getSession, saveSession } from "$lib/auth/sessions.server";
import type { User } from "$lib/dbtypes";
import { redirect, type Actions } from "@sveltejs/kit";
import { z } from "zod"
import bcrypt from "bcryptjs"

interface DefaultActionReturnType {
	success: boolean
	data: {
		email: string
		password: string
		username?: string
		cpassword?: string
	}
	error?: string
}

export const actions = {
	default: async (event): Promise<DefaultActionReturnType> => {
		let mode = event.url.searchParams.get("mode")?.toLowerCase()
		mode = mode === 'login' || mode === 'signup' ? mode : 'login'
		const fd = await event.request.formData()

		const email = fd.get('email')
		const password = fd.get('password')
		const cpassword = fd.get('cpassword')
		const username = fd.get('username')

		let schema = z.object({
			email: z.string().email().max(2048).trim(),
			password: z.string().max(128),
		})
		if (mode === 'signup') {
			schema = schema.merge(z.object(
				{
					cpassword: z.string().max(128),
					username: z.string().max(64).min(4).trim()
				}))
		}

		const s = schema.safeParse({
			email, password, cpassword, username
		})
		if (!s.success) {
			return {
				success: false,
				data: {
					email: typeof email === 'string' ? email : '',
					password: typeof password === 'string' ? password : '',
					cpassword: typeof cpassword === 'string' ? cpassword : '',
					username: typeof username === 'string' ? username : ''
				},
				error: s.error.issues.map(i => `Error: ${i.message}`).join('\n')
			}
		}

		if (mode === 'login') {
			try {
				const d = await event.platform!.env.db.prepare("SELECT * FROM users WHERE email = ?1").bind(s.data.email).first<User>()
				if (!d) throw new Error("Error: A user with this email address does not exist.")
				if (!bcrypt.compareSync(s.data.password, d.password)) throw new Error("Error: Invalid password.")
				if (d.is_banned) throw new Error("Error: You are banned.")

				const ssn = await getSession(event.cookies) ?? {}
				ssn.userId = d.id
				await saveSession(ssn, event.cookies)
				event.locals.user = {
					id: d.id,
					username: d.username,
					email: d.email,
					created_at: d.created_at
				}

				redirect(302, '/')
			} catch (e) {
				if (e instanceof Error) {
					return {
						success: false,
						data: s.data,
						error: e.message
					}
				}
				throw e
			}
		} else if (mode === 'signup') {
			/** @ts-ignore */
			if (s.data.password !== s.data.cpassword) {
				return {
					success: false,
					data: s.data,
					error: "Error: Passwords don't match."
				}
			}
			try {
				const d = await event.platform!.env.db.prepare("INSERT INTO users(id, email, username, password) VALUES (?1, ?2, ?3, ?4) RETURNING *").bind(
					genId(),
					s.data.email,
					/** @ts-ignore */
					s.data.username,
					bcrypt.hashSync(s.data.password, bcrypt.genSaltSync(12))
				).first<User>()

				if (!d) throw new Error("An unknown error occured. Please try again.")

				const ssn = await getSession(event.cookies) ?? {}
				ssn.userId = d.id
				await saveSession(ssn, event.cookies)
				event.locals.user = {
					id: d.id,
					username: d.username,
					email: d.email,
					created_at: d.created_at
				}

				redirect(302, '/')
			} catch (e) {
				if (e instanceof Error) {
					return {
						success: false,
						data: s.data,
						error: e.message.startsWith("D1_ERROR: UNIQUE") ? "Error: Email already taken." : e.message
					}
				}
				throw e
			}
		} else {
			return {
				success: false,
				data: s.data,
				error: "Error: Please refresh the page and try again."
			}
		}

		return {
			success: true,
			data: s.data
		}
	}
} satisfies Actions
