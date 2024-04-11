<script lang="ts">
	import Persona from './persona.svelte'

	export let data
</script>

<svelte:head>
	<title>Your Personas | ChatCrafters</title>
</svelte:head>

<main class="container mx-auto my-10 p-4">
	<h3 class="text-center text-5xl font-semibold">Your Personas</h3>
	<p class="my-4 text-center">
		<a href="/new" class="btn btn-primary btn-wide text-lg">Create new Persona</a>
	</p>

	{#if Array.isArray(data.personas) && data.personas.length > 0}
		<div class="my-12 grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
			{#each data.personas as persona}
				<Persona {persona} />
			{/each}
		</div>
	{:else}
		<p class="my-8 text-center text-xl font-medium">
			You do not have any personas. <a href="/new" class="link">Create one?</a>
		</p>
	{/if}
</main>
