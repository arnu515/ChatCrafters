<script lang="ts">
	import { page } from '$app/stores'
</script>

<svelte:head>
	<title>An error occured: {$page.status}</title>
</svelte:head>

<main class="mx-auto my-16 flex flex-col items-center justify-center gap-8">
	<h1 class="font-heading text-center text-5xl font-semibold text-black dark:text-white">
		{$page.status === 404 ? '404 Not Found' : 'An error has occured.'}
	</h1>
	<p class="text-center text-xl font-medium">
		{$page.status === 404
			? 'The page you are looking for either does not exist, or you do not have permission to view it.'
			: $page.error?.message || 'An unexpected error has occured'}
	</p>
	<div class="flex items-center gap-2">
		<button class="btn btn-primary text-lg" on:click={() => history.back()}> Go back </button>
		<a href="/" class="btn btn-outline btn-primary text-lg"> Homepage </a>
	</div>
</main>
