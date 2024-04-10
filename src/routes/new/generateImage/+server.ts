import { json, redirect } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { z } from "zod"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async (event) => {
	const data = z.string().min(30).max(512).trim().safeParse((await event.request.json()).attire)
	if (!data.success) {
		return json({ error: data.error.message }, { status: 400 })
	}

	const prompt = data.data + ' front-view. top-down photo. realistic.'

	const user = event.locals.user

	if (!user) {
		redirect(302, "/auth?mode=login")
	}

	try {
		const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.AI_TOKEN}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				prompt
			})
		})

		if (!res.ok) {
			const data = await res.json()
			return json({ error: data.errors?.map((i: any) => i?.message).join('\n') ?? data.messages?.join("\n") ?? data.message ?? "An unknown error occured" }, { status: 500 })
		}

		const img = await res.arrayBuffer()

		return new Response(img, { status: 200, headers: { "Content-Type": "image/png" } })
	} catch (e) {
		if (e instanceof Error) {
			return json({ error: e.message }, { status: 500 })
		}
		throw e
	}
}

