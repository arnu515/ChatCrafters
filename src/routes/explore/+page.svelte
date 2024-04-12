<script lang="ts">
	import Persona from './persona.svelte'
	import { page } from '$app/stores'
	export let data

	$: p = Math.max(Number($page.url.searchParams.get('p')) || 1, 1)

	function getPagePath(delta: number): string {
		if (p + delta < 1) return $page.url.pathname + $page.url.search
		const u = new URL($page.url)
		u.searchParams.set('p', (p + delta).toString())
		return u.pathname + u.search
	}
</script>

<form class="container mx-auto my-10 p-4">
	<h3 class="text-center text-5xl font-semibold">Explore Personas</h3>
	<div class="mx-auto mb-2 mt-8 flex max-w-screen-sm items-center gap-2">
		<input
			type="search"
			class="input input-bordered w-full"
			name="q"
			value={$page.url.searchParams.get('q') || ''}
			aria-label="Search term"
			placeholder="Enter search term..."
		/>
		<button class="btn btn-primary">Search</button>
	</div>
	<p class="mb-8 mt-2 text-center font-mono opacity-80">
		Special filters like by:username and by_id:userId are available
	</p>
	{#if Array.isArray(data.personas) && data.personas.length > 0}
		<div
			class="my-12 grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		>
			{#each data.personas as persona}
				<Persona {persona} />
			{/each}
		</div>
	{:else if p > 1}
		<p class="my-8 text-center text-xl font-medium">No more results.</p>
	{:else}
		<p class="my-8 text-center text-xl font-medium">No results found.</p>
	{/if}
	<div class="my-8 flex items-center justify-center gap-4">
		{#if p > 1}
			<a href={getPagePath(-1)} class="btn btn-neutral">Previous page</a>
		{/if}
		{#if data.personas.length >= 20}
			<a href={getPagePath(1)} class="btn btn-neutral">Next page</a>
		{/if}
	</div>
</form>
