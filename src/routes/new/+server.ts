import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { z } from 'zod'
import { genId } from '$lib'
import { putFile } from '$lib/s3.server'
import { userGuard } from '$lib/auth'

export const POST: RequestHandler = async event => {
	const fd = await event.request.formData()

	const name = fd.get('name')
	const model = fd.get('model')
	const summary = fd.get('summary')
	const prompt = fd.get('prompt')
	const attire = fd.get('attire')
	const image = fd.get('image')
	const isPrivate = fd.get('private')

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

	if (!image || typeof image === 'string' || image.type !== 'image/png' || image.size > 2097152) {
		return json(
			{
				error: 'Please generate an image first, and then try again.'
			},
			{ status: 400 }
		)
	}

	const user = userGuard(event.locals, event.url)

	try {
		const res = await event
			.platform!.env.db.prepare(
				'INSERT INTO personas (id, name, summary, model, prompt, attire, private, userId) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING id'
			)
			.bind(
				genId(),
				parseRes.data.name,
				parseRes.data.summary,
				parseRes.data.model,
				parseRes.data.prompt,
				parseRes.data.attire,
				parseRes.data.private ? 1 : 0,
				user.id
			)
			.first()

		if (!res) {
			throw new Error('Could not create persona. Please try again.')
		}

		// upload image to S3
		await putFile(`persona_avatars/${res.id}.png`, 'public-read', await image.arrayBuffer())

		return json({ id: res.id })
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
