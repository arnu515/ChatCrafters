<script lang="ts">
	import { Separator } from 'bits-ui'
	import { env } from '$env/dynamic/public'
	import { SendIcon, TrashIcon } from 'lucide-svelte'
	import ShareDialog from './shareDialog.svelte'
	import ReportDialog from './reportDialog.svelte'
	import { onMount, onDestroy } from 'svelte'
	import dayjs from 'dayjs'
	import rt from 'dayjs/plugin/relativeTime.js'
	import { z } from 'zod'

	dayjs.extend(rt)

	interface Message {
		text: string
		by: 'user' | 'persona'
		at: Date
		showHeader: boolean
		showFooter: boolean
	}

	let messages: Message[] = []
	let loadingMessages = false

	onMount(() => {
		try {
			const messagesLS = localStorage.getItem(`messages:${data.persona.id}`)
			if (!messagesLS) return
			const messagesLSJson = JSON.parse(messagesLS)
			loadingMessages = true
			z.object({
				text: z.string(),
				by: z.string().refine(v => ['user', 'persona'].includes(v)),
				at: z
					.string()
					.datetime({ precision: 3 })
					.transform(v => new Date(v)),
				showHeader: z.boolean(),
				showFooter: z.boolean()
			})
				.array()
				.parseAsync(messagesLSJson)
				.then((m: any) => {
					messages = m
					// loadingMessages = false
				})
		} catch {
			loadingMessages = true
			localStorage.removeItem(`messages:${data.persona.id}`)
		}
	})
	onDestroy(() => {
		if (messages.length > 0)
			localStorage.setItem(`messages:${data.persona.id}`, JSON.stringify(messages))
	})

	export let data
	export let form
</script>

<main
	class="container mx-auto my-4 grid grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
>
	<div class="flex flex-col gap-4">
		<div class="card h-min bg-base-300 shadow-md sm:flex-row md:max-w-sm md:flex-col">
			<figure class="grid place-items-center p-4">
				<img
					src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
					class="h-full max-h-[512px] w-full max-w-[512px] rounded-lg border-2 border-primary shadow md:max-h-[256px] md:max-w-[256px]"
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
						<a href="/persona/{data.persona.id}/edit" class="btn btn-neutral btn-sm">
							Edit Persona
						</a>
					{/if}
					<ShareDialog
						personaAvatar={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
						personaName={data.persona.name}
						personaId={data.persona.id}
					/>
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
				{#if data.user}
					<p class="font-semibold">Report Persona?</p>
					<ReportDialog
						personaAvatar={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
						personaName={data.persona.name}
						success={form?.action === 'report' && form?.success}
						message={form?.action === 'report' ? form?.message ?? '' : ''}
					/>
				{/if}
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
				{#if loadingMessages}
					<p class="my-8 flex items-center justify-center gap-2 text-center text-lg opacity-50">
						<span class="loading loading-spinner"></span>
						Loading messages
					</p>
				{:else if messages.length === 0}
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
