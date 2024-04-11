<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { XIcon, CopyIcon } from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'

	export let personaName: string
	export let personaAvatar: string
	export let personaId: string

	function copyShareLink() {
		const input = document.getElementById('share-link') as HTMLInputElement
		if (!input) return

		if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
			navigator.clipboard.writeText(input.value)
		} else {
			input.select()
			document.execCommand('copy')
		}
	}
	function openShareSheet() {
		const input = document.getElementById('share-link') as HTMLInputElement
		if (!input) return

		if ('share' in navigator) {
			navigator.share({ url: input.value })
		}
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class="btn btn-primary btn-sm">Share Persona</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 200 }}
			class="fixed inset-0 z-10 bg-black/70"
		/>

		<Dialog.Content
			transition={fly}
			class="fixed left-[50%] top-[50%] z-10 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border-2 border-primary/80 bg-base-300 p-4 shadow-md outline-none"
		>
			<Dialog.Title
				class="flex items-center justify-center text-center text-lg font-semibold text-black dark:text-white"
				>Share this Persona
				<Dialog.Close class="ml-auto rounded-full p-2 active:scale-95">
					<XIcon class="h-5 w-5" />
				</Dialog.Close>
			</Dialog.Title>
			<p class="my-4 flex items-center font-mono">
				Share <span class="font-heading mx-3 inline-flex items-center gap-2">
					<img src={personaAvatar} class="h-6 w-6 rounded-full" alt="Persona's avatar" />
					{personaName}
				</span> with everyone!
			</p>
			<label for="share-link">
				<div class="label">
					<span class="label-text">Enter report</span>
				</div>
				<div class="flex items-center gap-2">
					<input
						id="share-link"
						readonly
						class="input input-bordered w-full font-mono text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
						value={new URL(window.location.href).origin + '/persona/' + personaId}
					/>
					<button class="btn btn-square btn-neutral" on:click={copyShareLink}
						><CopyIcon class="h-5 w-5" /></button
					>
				</div>
			</label>
			<div class="mt-4 flex items-center gap-2">
				<Dialog.Close type="button" class="btn btn-outline btn-neutral mr-auto text-lg"
					>Close</Dialog.Close
				>
				<button class="btn btn-primary text-lg" on:click={openShareSheet}>Open share sheet</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
