import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { putFile } from '$lib/s3.server'
import { userGuard } from '$lib/auth'
import type { Persona } from '$lib/dbtypes'

export const POST: RequestHandler = async event => {
	const fd = await event.request.formData()

	const name = fd.get('name')
	const model = fd.get('model')
	const summary = fd.get('summary')
	const prompt = fd.get('prompt')
	const attire = fd.get('attire')
	const image = fd.get('image')
	const isPrivate = fd.get('private') ?? undefined
	console.log({ isPrivate })

	const parseRes = z
		.object({
			name: z.string().min(4).max(64).trim(),
			model: z.string().trim(),
			summary: z.string().max(75).trim(),
			prompt: z.string().min(50).max(1024).trim(),
			attire: z.string().min(30).max(512).trim(),
			private: z
				.string()
				.max(10)
				.optional()
				.transform(v => v === 'true')
		})
		.safeParse({
			name,
			model,
			summary,
			prompt,
			attire,
			private: isPrivate
		})

	if (!parseRes.success) {
		return json(
			{
				error: parseRes.error.issues.map(i => `Error: ${i.message}`).join('\n')
			},
			{ status: 400 }
		)
	}

	if (
		![
			'@hf/mistralai/mistral-7b-instruct-v0.2',
			'@cf/meta/llama-2-7b-chat-int8',
			'@cf/tinyllama/tinyllama-1.1b-chat-v1.0',
			'@cf/qwen/qwen1.5-0.5b-chat',
			'@hf/thebloke/openhermes-2.5-mistral-7b-awq',
			'@hf/thebloke/neural-chat-7b-v3-1-awq'
		].includes(parseRes.data.model)
	) {
		return json(
			{
				error: 'Invalid model. Please select a model from the list.'
			},
			{ status: 400 }
		)
	}

	if (image && (typeof image === 'string' || image?.type !== 'image/png' || image.size > 2097152)) {
		return json(
			{
				error: 'Please generate an image, and then try again.'
			},
			{ status: 400 }
		)
	}

	const user = userGuard(event.locals, event.url)

	const persona = await event
		.platform!.env.db.prepare(
			'SELECT * FROM personas WHERE personas.id = ?1 AND personas.userId = ?2'
		)
		.bind(event.params.id, user.id)
		.first<Persona>()

	if (!persona)
		return json(
			{ message: "Persona not found, or you don't have the permission to edit it" },
			{ status: 404 }
		)

	try {
		await event
			.platform!.env.db.prepare(
				'UPDATE personas SET name = ?2, summary = ?3, model = ?4, prompt = ?5, attire = ?6, private = ?7 WHERE id = ?1'
			)
			.bind(
				persona.id,
				parseRes.data.name,
				parseRes.data.summary,
				parseRes.data.model,
				parseRes.data.prompt,
				parseRes.data.attire,
				parseRes.data.private ? 1 : 0
			)
			.run()

		// upload image to S3
		if (image && typeof image !== 'string')
			await putFile(`persona_avatars/${persona.id}.png`, 'public-read', await image.arrayBuffer())

		return json({ id: persona.id })
	} catch (e) {
		if (e instanceof Error) {
			return json(
				{
					error: e.message
				},
				{ status: 500 }
			)
		}
		throw e
	}
}
