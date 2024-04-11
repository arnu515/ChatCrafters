<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { XIcon } from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'

	export let personaName: string
	export let personaAvatar: string
	export let success: boolean
	export let message: string
</script>

<Dialog.Root>
	<Dialog.Trigger class="btn btn-error btn-sm">Report</Dialog.Trigger>
	<Dialog.Portal class="p-2">
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 200 }}
			class="fixed inset-0 z-10 bg-black/70"
		/>

		<Dialog.Content
			transition={fly}
			class="fixed left-[50%] top-[50%] z-10 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border-2 border-red-500/80 bg-base-300 p-4 shadow-md outline-none"
		>
			<Dialog.Title
				class="flex items-center justify-center text-center text-lg font-semibold text-black dark:text-white"
				>Report this Persona
				<Dialog.Close class="ml-auto rounded-full p-2 active:scale-95">
					<XIcon class="h-5 w-5" />
				</Dialog.Close>
			</Dialog.Title>
			<form action="?/report" method="post">
				<p class="my-4 text-lg font-medium">
					Report this Persona for violating basic guidelines and rules. Your chats will NOT be sent
					along with this report.
				</p>
				<p class="my-4 flex items-center font-mono">
					You are reporting <span class="font-heading ml-3 inline-flex items-center gap-2">
						<img src={personaAvatar} class="h-6 w-6 rounded-full" alt="Persona's avatar" />
						{personaName}
					</span>.
				</p>
				<label for="report">
					<div class="label">
						<span class="label-text">Enter report</span>
					</div>
					<textarea
						name="report"
						id="report"
						required
						maxlength={2048}
						rows={5}
						class="textarea textarea-bordered w-full font-mono text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
						placeholder="Please keep the report concise and meaningful."
					/>
				</label>
				<p class="py-2 text-sm" class:text-error={!success} class:text-success={success}>
					{message}
				</p>
				<div class="mt-4 flex items-center justify-between">
					<Dialog.Close type="button" class="btn btn-outline btn-neutral text-lg"
						>Cancel</Dialog.Close
					>
					<button class="btn btn-error text-lg">Create a Report</button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
