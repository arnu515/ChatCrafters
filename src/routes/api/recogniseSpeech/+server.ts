import { json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'
import { userGuard } from '$lib/auth'
import type { VoiceActivity } from '$lib/dbtypes'

export const POST: RequestHandler = async event => {
	if (!event.request.headers.get('content-type')?.startsWith('audio')) {
		return json(
			{
				error: 'Invalid body'
			},
			{ status: 400 }
		)
	}

	const user = userGuard(event.locals, event.url)

	try {
		const activity = await event
			.platform!.env.db.prepare(
				'SELECT * FROM voice_activity WHERE userId = ?1 AND d = CURRENT_DATE'
			)
			.bind(user.id)
			.first<VoiceActivity>()
		if (activity && activity.amount > 300) {
			return json(
				{
					error: 'You can only recognise upto 5 minutes of speech per day.'
				},
				{ status: 403 }
			)
		}

		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/@cf/openai/whisper`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.AI_TOKEN}`,
					'Content-Type': event.request.headers.get('content-type')!
				},
				body: event.request.body,
				duplex: 'half'
			} as any
		)
		const data = await res.json()

		if (!res.ok) {
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

		const amt = Math.round(data.result.words.at(-1)?.end || 0)

		await (
			!activity
				? event
						.platform!.env.db.prepare(
							'INSERT INTO voice_activity(userId, amount, d) VALUES (?1, ?2, CURRENT_DATE) ON CONFLICT(userId) DO UPDATE SET amount = amount + excluded.amount, d = CURRENT_DATE'
						)
						.bind(user.id, amt)
				: event
						.platform!.env.db.prepare('UPDATE voice_activity SET amount = ?1, d = CURRENT_DATE')
						.bind(amt)
		).run()

		return json(data.result)
	} catch (e) {
		if (e instanceof Error) {
			return json({ error: e.message }, { status: 500 })
		}
		throw e
	}
}
