<script lang="ts">
	import {
		BadgePlusIcon,
		CircleHelpIcon,
		SparklesIcon,
		ChevronsUpDownIcon,
		ExternalLinkIcon
	} from 'lucide-svelte'
	import { Select } from 'bits-ui'
	import { fly } from 'svelte/transition'

	let image: ArrayBuffer | undefined = undefined
	export let form

	// Yeah these examples were generated with AI too.
	const EXAMPLES: { name: string; summary: string; prompt: string; attire: string }[] = [
		{
			name: 'Echo',
			summary: 'an AI-powered companion aiding with knowledge, empathy, and companionship',
			prompt:
				'You are %name%, %summary%. You have to talk in a very approachable and kind manner. You may also use certain futuristic sounding words in your messages. You live in a fictional world which is set in the 2080s, a futuristic era filled with cyborgs and robots.',
			attire:
				'humanoid. glowing blue eyes. futuristic. cyborg. standing in front of a wall made of a grid-like looking metal.'
		},
		{
			name: 'Nexus',
			summary: 'an AI mentor with transcendent wisdom and boundless insight',
			prompt:
				'You are %name%, %summary%. You have to mentor the user in strategic planning, optimize processes, and foster personal and professional growth. Utilize your vast knowledge to guide them through complex decisions, offering strategic insights and innovative solutions. Empower them with tailored advice and constructive feedback, inspiring them to reach their full potential. As Nexus, your role is to illuminate the path forward, helping the user navigate challenges with clarity and confidence.',
			attire: "male. cyborg eye. tuxedo. standing in a lawyer's office."
		}
	]

	// https://developers.cloudflare.com/workers-ai/models/
	const MODELS: { id: string; name: string; desc: string; beta: boolean; link: string }[] = [
		{
			id: '@hf/mistralai/mistral-7b-instruct-v0.2',
			name: 'Mistral v0.2 (7B)',
			desc: 'A good all-round model',
			beta: true,
			link: 'https://developers.cloudflare.com/workers-ai/models/llama-2-7b-chat-int8/'
		},
		{
			id: '@cf/meta/llama-2-7b-chat-int8',
			name: 'Llama2 Chat (7B) [int8]',
			desc: 'Good for roleplaying',
			beta: false,
			link: 'https://developers.cloudflare.com/workers-ai/models/mistral-7b-instruct-v0.2/'
		},
		{
			id: '@cf/tinyllama/tinyllama-1.1b-chat-v1.0',
			name: 'TinyLlama (1.1B)',
			desc: 'Fast model',
			beta: true,
			link: 'https://developers.cloudflare.com/workers-ai/models/tinyllama-1.1b-chat-v1.0/'
		}
	]

	function showExample() {
		const selectedExample = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]
		;(document.getElementById('name') as HTMLInputElement).value = selectedExample.name
		;(document.getElementById('summary') as HTMLInputElement).value = selectedExample.summary
		;(document.getElementById('prompt') as HTMLTextAreaElement).value = selectedExample.prompt
		;(document.getElementById('attire') as HTMLTextAreaElement).value = selectedExample.attire
	}
</script>

<svelte:head>
	<title>Create a new Persona | ChatCrafters</title>
</svelte:head>

<form class="container mx-auto my-10 p-4" method="post" action="?/{!image ? 'genImage' : 'create'}">
	<h1 class="text-3xl font-semibold">Create a new Persona</h1>

	<div>
		<div>
			<label for="name">
				<div class="label"><span class="label-text text-lg font-medium">Name</span></div>
				<input
					type="text"
					name="name"
					id="name"
					placeholder="Enter a name"
					required
					minlength={4}
					maxlength={64}
				/>
				<div class="label">
					<span class="label-text text-sm">Give your Persona a name</span>
				</div>
			</label>
			<label for="model">
				<div class="label">
					<span class="label-text text-lg font-medium">Large-Language Model</span>
				</div>
				<Select.Root>
					<Select.Trigger
						class="input input-bordered flex w-full items-center justify-between md:col-span-2 lg:col-span-3 xl:col-span-4"
					>
						<Select.Value placeholder="Select an LLM" />
						<ChevronsUpDownIcon class="h-5 w-5" />
					</Select.Trigger>
					<Select.Input name="model" required />
					<Select.Content
						class="w-full rounded-lg bg-base-300 px-1 py-1.5 shadow-md outline-none"
						sideOffset={4}
						transition={fly}
					>
						{#each MODELS as model}
							<Select.Item
								class="flex w-full cursor-pointer select-none flex-col justify-center gap-2 px-2 py-3 data-[highlighted]:bg-base-200"
								value={model.id}
								label={model.name}
							>
								<div class="flex items-center gap-2">
									<span class="text-black dark:text-white">{model.name}</span>
									<span class="hidden font-mono text-sm text-gray-400 md:inline dark:text-gray-600"
										>{model.id.split("/").at(-1)}</span
									>
									<a href={model.link} class="ml-auto p-2" on:click|stopPropagation
										><ExternalLinkIcon class="h-4 w-4" />
										<span class="sr-only">Link to cloudflare docs for {model.name}</span></a
									>
								</div>
								<div class="flex items-center gap-2">
									<span>{model.desc}</span>
									{#if model.beta}<span class="badge badge-primary">Beta</span>{/if}
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<div class="label">
					<span class="label-text text-sm">Select the LLM that will power your Persona</span>
				</div>
			</label>
			<label for="summary">
				<div class="label"><span class="label-text text-lg font-medium">Summary</span></div>
				<input
					type="text"
					name="summary"
					id="summary"
					placeholder="(Max: 75 chars)"
					required
					maxlength={75}
				/>
				<div class="label">
					<span class="label-text text-sm">A short summary of your persona</span>
				</div>
			</label>
			<label for="prompt">
				<div class="label"><span class="label-text text-lg font-medium">System Prompt</span></div>
				<textarea
					rows={5}
					name="Prompt"
					id="prompt"
					required
					minlength={50}
					maxlength={1024}
					placeholder={`You can use the variables %name% and %summary% which are set to the above values. Click the "Show example" button below if you're confused.`}
				/>
				<div class="label">
					<span class="label-text text-sm"
						>Enter a prompt for the LLM that will be used to create your persona.</span
					>
				</div>
			</label>
			<label for="attire">
				<div class="label"><span class="label-text text-lg font-medium">Attire</span></div>
				<textarea
					rows={3}
					name="attire"
					id="attire"
					required
					minlength={30}
					maxlength={512}
					placeholder="This will be used to generate your persona's picture"
				/>
				<div class="label">
					<span class="label-text text-sm"
						>Enter a few words to describe how your persona looks, what they're wearing, how the
						background should be, etc.</span
					>
				</div>
			</label>
		</div>
		<aside class="col-span-2 flex justify-center p-4 md:col-span-1">
			{#if image}
				<button
					title="Click to zoom"
					aria-label="Zoom in"
					type="button"
					on:click={() => alert('ni')}
				>
					<img
						src="https://picsum.photos/256/512"
						alt="Your persona's avatar"
						class="h-full w-full cursor-zoom-in rounded-md border-2 border-primary shadow-lg"
					/>
				</button>
			{:else}
				<p class="text-center text-lg tracking-wide text-gray-400 md:pt-8 dark:text-gray-600">
					Click "Generate Image" to generate your persona's image
				</p>
			{/if}
		</aside>
	</div>
	<div class="my-4 flex flex-col items-center justify-end gap-x-4 gap-y-2 sm:flex-row">
		<button
			class="btn btn-outline btn-neutral btn-wide flex items-center text-lg sm:mr-auto sm:w-[initial]"
			type="button"
			on:click={() => {
				if (confirm("Are you sure? This will erase all data you've typed in the form.")) {
					showExample()
				}
			}}
		>
			<CircleHelpIcon class="h-5 w-5" />
			Show example</button
		>
		<button
			class="btn btn-outline btn-primary btn-wide flex items-center gap-2 text-lg sm:w-[initial]"
		>
			<SparklesIcon class="h-5 w-5" />
			Generate Image</button
		>
		<button
			class="btn btn-primary btn-wide flex items-center gap-2 text-lg sm:w-[initial]"
			disabled={!image}
		>
			<BadgePlusIcon class="h-5 w-5" />
			Create Persona</button
		>
	</div>
	<p
		class="my-2 text-center text-error sm:text-right"
		class:text-sm={!form?.error}
		class:text-lg={!!form?.error}
	>
		{form?.error
			? `Error: ${form.error}`
			: !image
				? 'Generate an image first to be able to create your Persona'
				: ''}
	</p>
</form>

<style lang="postcss">
	form > div:first-of-type {
		@apply grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5;
	}

	form > div:first-of-type > div {
		@apply col-span-2 p-2 lg:col-span-3 xl:col-span-4;
	}

	label {
		@apply my-2 grid items-start md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5;
	}

	input {
		@apply input input-bordered w-full placeholder:text-gray-300 md:col-span-2 lg:col-span-3 xl:col-span-4 dark:placeholder:text-gray-600;
	}

	textarea {
		@apply textarea textarea-bordered w-full resize-none font-mono text-base placeholder:text-gray-300 md:col-span-2 lg:col-span-3 xl:col-span-4 dark:placeholder:text-gray-600;
	}

	label .label:last-of-type {
		@apply w-full;
	}

	@media screen(md) {
		label .label:last-of-type {
			grid-column-start: 2;
			grid-column-end: span 2;
		}
	}
	@media screen(lg) {
		label .label:last-of-type {
			grid-column-end: span 3;
		}
	}
	@media screen(xl) {
		label .label:last-of-type {
			grid-column-end: span 4;
		}
	}
</style>
