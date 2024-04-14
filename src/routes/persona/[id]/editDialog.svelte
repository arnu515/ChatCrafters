<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { XIcon } from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'

	export let isOpen: boolean
	export let error: string
	export let message: string
	export let loading = false

	const d = createEventDispatcher()
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={open => !open && d('close')}>
	<Dialog.Portal class="p-2">
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 200 }}
			class="fixed inset-0 z-10 bg-black/70"
		/>

		<Dialog.Content
			transition={fly}
			class="fixed left-[50%] top-[50%] z-10 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border-2 border-neutral/80 bg-base-300 p-4 shadow-md outline-none"
		>
			<Dialog.Title
				class="flex items-center justify-center text-center text-lg font-semibold text-black dark:text-white"
				>Edit message
				<Dialog.Close class="ml-auto rounded-full p-2 active:scale-95">
					<XIcon class="h-5 w-5" />
				</Dialog.Close>
			</Dialog.Title>
			<form on:submit|preventDefault={() => d('edit', message)}>
				<p class="my-4 font-medium">
					Do note that editing this message will delete any and all messages after it PERMANENTLY.
					This will also cause the LLM to regenerate its response.
				</p>
				<label for="message">
					<div class="label">
						<span class="label-text">Enter new message</span>
					</div>
					<textarea
						id="message"
						bind:value={message}
						required
						rows={4}
						class="textarea textarea-bordered w-full font-mono text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
						placeholder="Enter new message"
					/>
				</label>
				<p class="py-2 text-sm text-error">
					{error}
				</p>
				<div class="mt-4 flex items-center justify-between">
					<Dialog.Close type="button" class="btn btn-outline btn-neutral text-lg"
						>Cancel</Dialog.Close
					>
					<button
						class="btn btn-neutral flex items-center gap-2 text-lg"
						title="Edit"
						aria-label="Edit message"
					>
						{#if loading}
							<span class="loading loading-spinner"></span>
						{/if}
						Edit message</button
					>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
