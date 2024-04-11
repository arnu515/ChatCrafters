<script lang="ts">
	import { Separator, Dialog } from 'bits-ui'
	import { env } from '$env/dynamic/public'
	import { SendIcon, TrashIcon, XIcon, CopyIcon } from 'lucide-svelte'
	import dayjs from 'dayjs'
	import rt from 'dayjs/plugin/relativeTime.js'
	import { fade, fly } from 'svelte/transition'
	dayjs.extend(rt)

	interface Message {
		text: string
		by: 'user' | 'persona'
		at: Date
		showHeader: boolean
		showFooter: boolean
	}

	let messages: Message[] = []

	export let data
	export let form

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

<main
	class="container mx-auto my-4 grid grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
	<div class="flex flex-col gap-4">
		<div class="card h-min bg-base-300 shadow-md sm:flex-row md:max-w-sm md:flex-col">
			<figure class="grid place-items-center p-4">
				<img
					src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
					class="h-full max-h-[512px] w-full max-w-[512px] rounded-lg shadow md:max-h-[256px] md:max-w-[256px]"
					alt="Persona's avatar"
				/>
			</figure>
			<div class="card-body gap-2 md:items-center">
				<h3 class="font-heading card-title font-medium">{data.persona.name}</h3>
				<p class="sm:text-left sm:text-lg md:text-center">{data.persona.summary}</p>
				<div
					class="mb-4 mt-auto flex flex-col flex-wrap justify-center gap-x-4 gap-y-2 md:flex-row md:items-center md:justify-center"
				>
					{#if data.persona.userId === data.user?.id}
						<button class="btn btn-neutral btn-sm">Edit Persona</button>
					{/if}
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
										<img
											src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
											class="h-6 w-6 rounded-full"
											alt="Persona's avatar"
										/>
										{data.persona.name}
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
											value={new URL(window.location.href).origin + '/persona/' + data.persona.id}
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
									<button class="btn btn-primary text-lg" on:click={openShareSheet}
										>Open share sheet</button
									>
								</div>
							</Dialog.Content>
						</Dialog.Portal>
					</Dialog.Root>
				</div>
			</div>
		</div>
		<div class="card h-min bg-base-300 shadow-md">
			<div class="card-body justify-center gap-2">
				<h3 class="font-heading card-title flex items-center justify-center gap-2 font-medium">
					<small class="font-sans text-sm uppercase text-base-content">Created by:</small>
					<img
						src={data.persona.avatar_url}
						alt="{data.persona.username}'s avatar"
						class="h-6 w-6 rounded-full shadow"
					/>
					{data.persona.username}
				</h3>
				<a
					href={data.persona.userId === data.user?.id
						? '/my'
						: `/explore?q=by_id:${data.persona.userId}`}
					class="btn btn-neutral btn-sm"
					>{data.persona.userId === data.user?.id ? 'Your personas' : 'View their personas'}</a
				>
			</div>
		</div>
		<div class="flex flex-col gap-2 rounded-box bg-base-300 px-8 py-4 shadow-md">
			<div class="flex items-center justify-between">
				<p class="font-semibold">Report Persona?</p>
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
								>Report this persona
								<Dialog.Close class="ml-auto rounded-full p-2 active:scale-95">
									<XIcon class="h-5 w-5" />
								</Dialog.Close>
							</Dialog.Title>
							<form action="?/report" method="post">
								<p class="my-4 text-lg font-medium">
									Report this persona for violating basic guidelines and rules. Your chats will NOT
									be sent along with this report.
								</p>
								<p class="my-4 flex items-center font-mono">
									You are reporting <span class="font-heading ml-3 inline-flex items-center gap-2">
										<img
											src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
											class="h-6 w-6 rounded-full"
											alt="Persona's avatar"
										/>
										{data.persona.name}
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
										maxlength={128}
										rows={5}
										class="textarea textarea-bordered w-full font-mono text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
										placeholder="Please keep the report concise and meaningful."
									/>
								</label>
								<p
									class="py-2 text-sm"
									class:text-error={form?.action === 'report' && !form?.success}
									class:text-success={form?.action === 'report' && form?.success}
								>
									{form?.action === 'report' ? form?.message ?? '' : ''}
								</p>
								<div class="mt-4 flex items-center justify-between">
									<Dialog.Close type="button" class="btn btn-outline btn-neutral text-lg"
										>Cancel</Dialog.Close
									>
									<button class="btn btn-error text-lg">Create a report</button>
								</div>
							</form>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</div>
			{#if data.persona.userId !== data.user?.id}
				<div class="flex items-center justify-between">
					<p class="font-semibold">Create your own persona?</p>
					<a href="/new" class="btn btn-primary btn-sm">Create</a>
				</div>
			{/if}
			<p
				class="text-center text-sm"
				class:text-error={form?.action === 'report' && !form?.success}
				class:text-success={form?.action === 'report' && form?.success}
			>
				{form?.action === 'report' ? form?.message ?? '' : ''}
			</p>
		</div>
	</div>
	<div
		class="flex min-h-[500px] flex-col overflow-hidden rounded-box bg-base-300 shadow-md lg:col-span-2 xl:col-span-3"
		style="height: calc(100vh - 132px)"
	>
		{#if data.user}
			<div>
				<h1 class="font-heading m-4 flex items-center gap-4 text-xl font-semibold">
					<div class="avatar">
						<div class="h-8 w-8 rounded-full">
							<img
								src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
								alt="Persona's avatar"
							/>
						</div>
					</div>
					Messages
					<button
						class="btn-ghost ml-auto rounded-full p-2 text-error"
						title="Delete messages"
						aria-label="Delete messages"
						on:click={() => {
							if (window.confirm('Are you sure you want to delete all messages?')) messages = []
						}}
					>
						<TrashIcon class="h-5 w-5" />
					</button>
				</h1>
				<Separator.Root class="h-1 shrink-0 bg-base-100" />
			</div>
			<div class="flex-grow overflow-y-auto p-4" id="messages-box">
				{#if messages.length === 0}
					<p class="my-8 text-center text-lg opacity-50">Send your first message!</p>
				{:else}
					{#each messages as msg}
						<div
							class="chat"
							class:chat-start={msg.by === 'persona'}
							class:chat-end={msg.by === 'user'}
						>
							<div class="avatar chat-image">
								<div class="h-8 w-8">
									{#if msg.showFooter}
										<img
											src={msg.by === 'persona'
												? `${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`
												: data.user.avatar_url}
											alt="{msg.by === 'persona' ? "Persona's" : 'Your'} Avatar"
										/>
									{/if}
								</div>
							</div>
							{#if msg.showHeader}
								<div class="font-heading chat-header mb-1 mt-4">
									{msg.by === 'persona' ? data.persona.name : 'You'}
								</div>
							{/if}
							<div class="chat-bubble">{msg.text}</div>
							{#if msg.showFooter}
								<div class="chat-footer mb-4 mt-1 text-xs opacity-50">
									<time datetime={msg.at.toISOString()} title={msg.at.toISOString()}
										>{dayjs().to(dayjs(msg.at))}</time
									>
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
			<form action="?/message" class="m-4 mt-0 flex items-center gap-2" method="POST">
				<input
					type="text"
					name="message"
					id="message"
					aria-label="Message"
					placeholder="Enter your message"
					class="input input-bordered w-full"
				/>
				<button
					class="btn-circle btn-neutral grid place-items-center"
					aria-label="Send"
					title="Send message"><SendIcon class="h-6 w-6" /></button
				>
			</form>
		{:else}
			<div class="flex flex-grow flex-col items-center gap-4 pt-10">
				<p class="text-center text-lg opacity-80">
					You must be logged in to chat with this persona
				</p>
				<a href="/auth?mode=login" class="btn btn-primary btn-wide">Login</a>
			</div>
		{/if}
	</div>
</main>

<style lang="postcss">
	#messages-box {
		scrollbar-color: theme(colors.base-100) theme(colors.base-300);
	}
</style>
