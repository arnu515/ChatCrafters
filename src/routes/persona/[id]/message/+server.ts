import { userGuard } from '$lib/auth'
import type { Persona } from '$lib/dbtypes'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { z } from 'zod'

export const POST: RequestHandler = async event => {
	const bodyRes = z
		.object({
			messages: z
				.object({
					role: z
						.string()
						.refine(
							v => ['assistant', 'user'].includes(v),
							'Role must be one of "assistant", "user".'
						),
					content: z.string()
				})
				.array()
				.nonempty()
				.refine(i => i.at(-1)?.role === 'user', 'Last message should be by a user')
		})
		.safeParse(await event.request.json())
	if (!bodyRes.success) {
		return json(
			{
				error: bodyRes.error.issues.map(i => `Error: ${i.message}`).join('\n')
			},
			{ status: 400 }
		)
	}

	userGuard(event.locals, event.url)

	const persona = await event
		.platform!.env.db.prepare('SELECT * FROM personas WHERE personas.id = ?1')
		.bind(event.params.id)
		.first<Persona>()

	if (!persona) return json({ error: 'Persona not found' }, { status: 404 })

	try {
		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/${persona.model}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.AI_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages: [
						{
							role: 'system',
							content: persona.prompt
								.replaceAll('%name%', persona.name)
								.replaceAll('%summary%', persona.summary)
						},
						...bodyRes.data.messages
					],
					stream: true
				})
			}
		)

		if (!res.ok) {
			const data = await res.json()
			return json(
				{
					error:
						data.errors?.map((i: any) => i?.message).join('\n') ??
						data.messages?.join('\n') ??
						data.message ??
						'An unknown error occured'
				},
				{ status: 500 }
			)
		}

		return new Response(res.body, { headers: { 'content-type': 'text/event-stream' } })
	} catch (e) {
		if (e instanceof Error) {
			return json({ error: e.message }, { status: 500 })
		}
		throw e
	}
}
