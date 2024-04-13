<script lang="ts">
	import {
		PencilIcon,
		RotateCcwIcon,
		SparklesIcon,
		ChevronsUpDownIcon,
		ExternalLinkIcon,
		ArrowLeftIcon
	} from 'lucide-svelte'
	import { Select, Switch } from 'bits-ui'
	import { fly } from 'svelte/transition'
	import { goto } from '$app/navigation'
	import { env } from '$env/dynamic/public'

	export let data

	let image: { data: ArrayBuffer; src: string } | undefined = undefined
	let imageGenerating = false
	let editingPersona = false
	let deletingPersona = false
	let error: string = ''
	let attire: string = data.persona.attire
	let isPrivate = data.persona.private

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
		},
		{
			id: '@hf/thebloke/llama-2-13b-chat-awq',
			name: 'Llama 2 Chat (13B) [awq]',
			desc: '13B Llama variant',
			beta: true,
			link: 'https://developers.cloudflare.com/workers-ai/models/llama-2-13b-chat-awq/'
		},
		{
			id: '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
			name: 'OpenHermes 2.5 (7B)',
			desc: 'Based on Mistral',
			beta: true,
			link: 'https://developers.cloudflare.com/workers-ai/models/openhermes-2.5-mistral-7b-awq'
		},
		{
			id: '@hf/thebloke/neural-chat-7b-v3-1-awq',
			name: 'NeuralChat v3.1 (7B)',
			desc: 'Faster than Mistral',
			beta: true,
			link: 'https://developers.cloudflare.com/workers-ai/models/neural-chat-7b-v3-1-awq'
		}
	]

	function resetForm() {
		;(document.getElementById('name') as HTMLInputElement).value = data.persona.name
		;(document.getElementById('summary') as HTMLInputElement).value = data.persona.summary
		;(document.getElementById('prompt') as HTMLTextAreaElement).value = data.persona.prompt
		attire = data.persona.attire
		image = undefined
	}

	async function genImage() {
		if (imageGenerating || editingPersona || deletingPersona) return
		error = ''

		if (!attire.trim()) {
			error =
				'Please enter an attire for your Persona. Click the "Show Examples" button for some inspiration.'
			return
		}
		if (attire.trim() === data.persona.attire) return

		imageGenerating = true

		try {
			const res = await fetch('/api/generateImage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ attire })
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error ?? '')
			}

			const data = await res.arrayBuffer()
			image = {
				data,
				src: URL.createObjectURL(new Blob([data]))
			}
		} catch (e) {
			if (e instanceof Error) {
				error = 'An unknown error occured: ' + e.message
			} else {
				error = 'An unknown error occured'
			}
			console.error(e)
		} finally {
			imageGenerating = false
		}
	}

	async function editPersona(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		if (imageGenerating || editingPersona || deletingPersona) return
		if (attire.trim() !== data.persona.attire && !image) {
			alert('Please generate an image first')
			return
		}

		error = ''

		const fd = new FormData(e.currentTarget)

		fd.set('private', isPrivate ? 'true' : 'false')
		if (image) fd.set('image', new Blob([image.data], { type: 'image/png' }))

		editingPersona = true
		try {
			const res = await fetch(`/persona/${data.persona.id}/edit`, {
				method: 'POST',
				body: fd
			})
			const resData = await res.json()

			if (!res.ok) {
				throw new Error(resData.error ?? '')
			}

			goto('/persona/' + resData.id)
		} catch (e) {
			if (e instanceof Error) {
				error = 'An unknown error occured: ' + e.message
			} else {
				error = 'An unknown error occured'
			}
			console.error(e)
		} finally {
			editingPersona = false
		}
	}

	async function deletePersona() {
		if (imageGenerating || editingPersona || deletingPersona) return

		error = ''

		try {
			deletingPersona = true

			const res = await fetch(`/persona/${data.persona.id}/delete`, {
				method: 'DELETE'
			})
			const resData = await res.json()

			if (!res.ok) {
				throw new Error(resData.error ?? '')
			}

			goto('/my')
		} catch (e) {
			if (e instanceof Error) {
				error = 'An unknown error occured: ' + e.message
			} else {
				error = 'An unknown error occured'
			}
			console.error(e)
		} finally {
			deletingPersona = false
		}
	}
</script>

<svelte:head>
	<title>Edit Persona | ChatCrafters</title>
</svelte:head>

<form class="container mx-auto mb-4 mt-10 p-4" on:submit|preventDefault={editPersona}>
	<h1 class="flex items-center gap-4 text-3xl font-semibold">
		<a
			href="/persona/{data.persona.id}"
			title="Back"
			aria-label="Go back"
			class="btn btn-square btn-ghost pb-2"><ArrowLeftIcon class="h-7 w-7 stroke-2" /></a
		> Edit Persona
	</h1>

	<div>
		<div>
			<label for="name">
				<div class="label"><span class="label-text text-lg font-medium">Name</span></div>
				<input
					type="text"
					name="name"
					id="name"
					placeholder={data.persona.name}
					value={data.persona.name}
					required
					minlength={4}
					maxlength={64}
				/>
			</label>
			<label for="model">
				<div class="label">
					<span class="label-text text-lg font-medium">Large-Language Model</span>
				</div>
				<Select.Root
					selected={{
						label: MODELS.find(x => x.id === data.persona.model)?.name ?? data.persona.model,
						value: data.persona.model
					}}
				>
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
										>{model.id.split('/').at(-1)}</span
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
			</label>
			<label for="summary">
				<div class="label"><span class="label-text text-lg font-medium">Summary</span></div>
				<input
					type="text"
					name="summary"
					id="summary"
					placeholder={data.persona.summary}
					value={data.persona.summary}
					required
					maxlength={75}
				/>
			</label>
			<label for="prompt">
				<div class="label"><span class="label-text text-lg font-medium">System Prompt</span></div>
				<textarea
					rows={5}
					name="prompt"
					id="prompt"
					required
					minlength={50}
					maxlength={1024}
					placeholder="You can use the variables %name% and %summary% which are set to the above values."
					value={data.persona.prompt}
				/>
			</label>
			<label for="attire">
				<div class="label"><span class="label-text text-lg font-medium">Attire</span></div>
				<textarea
					rows={3}
					name="attire"
					id="attire"
					bind:value={attire}
					required
					minlength={30}
					maxlength={512}
					placeholder="This will be used to generate your persona's picture"
				/>
			</label>
			<label for="private">
				<div class="label"><span class="label-text text-lg font-medium">Make private</span></div>
				<Switch.Root
					id="private"
					class="inline-flex h-[32px] min-h-[32px] w-[50px] shrink-0 cursor-pointer items-center rounded-full border-2 border-gray-300 px-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-content focus-visible:ring-offset-2 focus-visible:ring-offset-base-300 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-base-300 dark:border-gray-700"
					bind:checked={isPrivate}
				>
					<Switch.Thumb
						class="pointer-events-none block size-[30px] shrink-0 rounded-full bg-base-content transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-[-0.25rem]"
					/>
				</Switch.Root>
			</label>
		</div>
		<aside class="col-span-2 flex flex-col items-center gap-4 p-4 md:col-span-1">
			<button
				title="Click to zoom"
				aria-label="Zoom in"
				type="button"
				class="max-h-[256px] max-w-[256px]"
				on:click={() => alert('ni')}
			>
				<img
					src={image
						? image.src
						: `${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
					alt="Your persona's avatar"
					class="h-full max-h-[256px] w-full max-w-[256px] cursor-zoom-in rounded-md border-2 border-primary shadow-lg"
				/>
			</button>
			<p class="text-sm uppercase text-gray-400 dark:text-gray-600">Your persona's picture</p>
		</aside>
	</div>
	<div class="my-4 flex flex-col items-center justify-end gap-x-4 gap-y-2 sm:flex-row">
		<button
			class="btn btn-outline btn-neutral btn-wide flex items-center text-lg sm:mr-auto sm:w-[initial]"
			type="button"
			disabled={imageGenerating || editingPersona || deletingPersona}
			on:click={() => {
				if (confirm("Are you sure? This will erase all data you've typed in the form.")) {
					resetForm()
				}
			}}
		>
			<RotateCcwIcon class="h-5 w-5" />
			Reset form</button
		>
		<button
			class="btn btn-outline btn-primary btn-wide flex items-center gap-2 text-lg sm:w-[initial]"
			type="button"
			on:click={genImage}
			disabled={attire === data.persona.attire ||
				imageGenerating ||
				editingPersona ||
				deletingPersona}
		>
			{#if imageGenerating}
				<span class="loading loading-spinner"></span>
			{/if}
			<SparklesIcon class="h-5 w-5" />
			Generate Image</button
		>
		<button
			class="btn btn-primary btn-wide flex items-center gap-2 text-lg sm:w-[initial]"
			disabled={(attire !== data.persona.attire && !image) ||
				imageGenerating ||
				editingPersona ||
				deletingPersona}
		>
			{#if editingPersona}
				<span class="loading loading-spinner"></span>
			{/if}
			<PencilIcon class="h-5 w-5" />
			Edit Persona</button
		>
	</div>
	<p
		class="my-2 text-center text-error sm:text-right"
		class:text-sm={!error}
		class:text-lg={!!error}
	>
		{error
			? `Error: ${error}`
			: attire !== data.persona.attire && !image
				? 'Generate an image first to be able to edit your Persona.'
				: ''}
	</p>
</form>

<div class="container mx-auto p-4">
	<div
		class="flex flex-col items-center justify-center gap-4 rounded-box border-2 border-error bg-base-300 p-4 md:flex-row md:justify-between"
	>
		<div class="flex flex-col gap-2">
			<h3 class="text-xl font-semibold text-error">Delete persona</h3>
			<p class="text-error/80">
				Are you sure you want to delete this persona? This action is <strong class="font-semibold"
					>IRREVERSIBLE</strong
				> and after deletion, nobody will be able to send messages to this Persona.
			</p>
		</div>
		<button
			class="btn btn-error btn-wide text-lg"
			on:click={() => {
				if (confirm('Are you sure you want to delete this persona? This action is IRREVERSIBLE.'))
					deletePersona()
			}}
			disabled={deletingPersona || imageGenerating || editingPersona}
		>
			{#if deletingPersona}
				<span class="loading loading-spinner"></span>
			{/if}
			Delete persona</button
		>
	</div>
</div>

<style lang="postcss">
	form > div:first-of-type {
		@apply grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5;
	}

	form > div:first-of-type > div {
		@apply col-span-2 my-2 lg:col-span-3 xl:col-span-4;
	}

	label {
		@apply my-4 grid items-start md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5;
	}

	input {
		@apply input input-bordered w-full placeholder:text-gray-300 md:col-span-2 lg:col-span-3 xl:col-span-4 dark:placeholder:text-gray-600;
	}

	textarea {
		@apply textarea textarea-bordered w-full resize-none font-mono text-base placeholder:text-gray-300 md:col-span-2 lg:col-span-3 xl:col-span-4 dark:placeholder:text-gray-600;
	}
</style>
