<script lang="ts">
	import type { Persona } from '$lib/dbtypes'
	import { env } from '$env/dynamic/public'

	export let persona: Persona
</script>

<a href="/persona/{persona.id}" class="block">
	<div class="card bg-base-300 shadow-xl">
		<figure class="grid place-items-center p-4">
			<img
				src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${persona.id}.png`}
				class="h-full max-h-[512px] w-full max-w-[512px]"
				alt="Your persona's avatar"
			/>
		</figure>
		<div class="card-body items-center gap-2">
			<h3 class="card-title font-medium">{persona.name}</h3>
			<p class="text-lg">{persona.summary}</p>
		</div>
	</div>
</a>
