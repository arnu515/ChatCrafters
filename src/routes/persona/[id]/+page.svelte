<script lang="ts">
	import { Separator } from 'bits-ui'
	import { env } from '$env/dynamic/public'
	import { PencilIcon, SendIcon, StopCircleIcon, TrashIcon } from 'lucide-svelte'
	import ShareDialog from './shareDialog.svelte'
	import ReportDialog from './reportDialog.svelte'
	import EditDialog from './editDialog.svelte'
	import { onMount, tick } from 'svelte'
	import dayjs from 'dayjs'
	import rt from 'dayjs/plugin/relativeTime.js'
	import { z } from 'zod'
	import { parseSSE } from '$lib/sse'
	import VoiceButton from './voiceButton.svelte'
	import { browser } from '$app/environment'

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
	let messageBeingGenerated: string | undefined
	let sendingMessage = false
	let generateController: AbortController | undefined

	let isEditDialogOpen = false
	let editMessageError = ''
	let messageTextBeingEdited = ''
	let idxOfMessageBeingEdited = -1

	onMount(() => {
		try {
			const messagesLS = localStorage.getItem(`messages:${data.persona.id}`)
			if (!messagesLS) return
			const messagesLSJson = JSON.parse(messagesLS)
			loadingMessages = true
			messages = z
				.object({
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
				.parse(messagesLSJson) as any

			loadingMessages = false
			tick().then(() => {
				const el = document.getElementById('messages-box')!
				el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
			})
		} catch {
			loadingMessages = false
			localStorage.removeItem(`messages:${data.persona.id}`)
		}
	})

	function saveMessages() {
		if (browser) localStorage.setItem(`messages:${data.persona.id}`, JSON.stringify(messages))
	}

	function onGenerate(message: string) {
		try {
			const { response = '' } = JSON.parse(message)
			messageBeingGenerated ??= ''
			messageBeingGenerated += response ?? ''
			tick().then(() => {
				const el = document.getElementById('messages-box')!
				el.scrollTo({ top: el.scrollHeight })
			})
		} catch {}
	}

	function doneGenerating() {
		if (!messageBeingGenerated) return
		// mistral always adds a </s> at the end of its messages
		// llama sometimes adds multiple *s at the end of its messages
		addMessage(
			'persona',
			messageBeingGenerated.endsWith('</s>')
				? messageBeingGenerated.slice(0, -4)
				: messageBeingGenerated.endsWith('*')
					? messageBeingGenerated.replace(/\*+/g, '*')
					: messageBeingGenerated
		)
		messageBeingGenerated = undefined
		generateController = undefined
	}

	function addMessage(by: Message['by'], text: Message['text']) {
		const lastMsg = messages.at(-1)
		let showHeader = lastMsg?.by !== by
		const message = {
			at: new Date(),
			by,
			showHeader,
			text: text.trim(),
			showFooter: true
		} satisfies Message

		messages = messages
			.slice(0, -1)
			.concat(
				messages.length === 0 ? [message] : [{ ...lastMsg!, showFooter: showHeader }, message]
			)
		tick().then(() => {
			const el = document.getElementById('messages-box')!
			el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
			saveMessages()
		})
	}

	function getMessagesForSending() {
		let toTruncate = Number((window as any)['NUMBER_OF_MESSAGES_TO_SEND'] || 16)
		return messages.slice(messages.length - toTruncate).map(i => ({
			role: i.by === 'persona' ? 'assistant' : 'user',
			content: i.text
		}))
	}

	async function sendMessage(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		if (typeof messageBeingGenerated !== 'undefined' || sendingMessage) return
		const fd = new FormData(e.currentTarget)
		const message = fd.get('message')
		if (typeof message !== 'string' || !message.trim()) return

		try {
			sendingMessage = true
			const res = await fetch(`/persona/${data.persona.id}/message`, {
				method: 'POST',
				body: JSON.stringify({
					messages: getMessagesForSending().concat([
						{
							role: 'user',
							content: message.trim()
						}
					])
				}),
				headers: { 'Content-Type': 'application/json' }
			})

			if (res.headers.get('content-type') === 'text/event-stream') {
				generateController = new AbortController()
				parseSSE(res, onGenerate, doneGenerating, generateController.signal)
				;(document.getElementById('message') as HTMLInputElement).value = ''
				;(document.getElementById('message') as HTMLInputElement).style.height = ''
				addMessage('user', message.trim())
			} else {
				const data = await res.json()
				throw new Error(data.error ?? data.message ?? 'An unknown error occured')
			}
		} catch (e) {
			alert(
				`Could not send message: ${e instanceof Error ? e.message : 'An unknown error occured'}`
			)
			console.error(e)
		} finally {
			sendingMessage = false
		}
	}

	async function editMessage(msg: string, idx: number) {
		if (!msg.trim()) return
		if (idx < 0 || idx >= messages.length || messages[idx].by !== 'user') {
			editMessageError = 'Could not edit message: Unknown error.'
			return
		}

		const removedMessages = messages.slice(idx)
		messages = messages.slice(0, idx)

		try {
			sendingMessage = true
			const res = await fetch(`/persona/${data.persona.id}/message`, {
				method: 'POST',
				body: JSON.stringify({
					messages: getMessagesForSending().concat([
						{
							role: 'user',
							content: msg.trim()
						}
					])
				}),
				headers: { 'Content-Type': 'application/json' }
			})

			if (res.headers.get('content-type') === 'text/event-stream') {
				generateController = new AbortController()
				parseSSE(res, onGenerate, doneGenerating, generateController.signal)
				isEditDialogOpen = false
				addMessage('user', msg.trim())
			} else {
				const data = await res.json()
				throw new Error(data.error ?? data.message ?? 'An unknown error occured')
			}
		} catch (e) {
			editMessageError = `Could not edit message: ${e instanceof Error ? e.message : 'An unknown error occured'}`
			// remove edited message and add old ones back
			messages = messages.slice(0, idx).concat(removedMessages)
			saveMessages()
		} finally {
			sendingMessage = false
		}
	}

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
						class="btn-ghost ml-auto rounded-full p-2"
						title="Delete messages"
						aria-label="Delete messages"
						class:text-base-content={!messages.length}
						class:opacity-50={!messages.length}
						class:text-error={!!messages.length}
						class:cursor-not-allowed={!messages.length}
						disabled={!messages.length}
						on:click={() => {
							if (window.confirm('Are you sure you want to delete all messages?')) {
								messages = []
								localStorage.removeItem(`messages:${data.persona.id}`)
							}
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
				{:else if messages.length === 0 && typeof messageBeingGenerated === 'undefined'}
					<p class="my-8 text-center text-lg opacity-50">Send your first message!</p>
				{:else}
					{#each messages as msg, idx}
						<div
							class="chat"
							class:chat-start={msg.by === 'persona'}
							class:chat-end={msg.by === 'user'}
						>
							<div class="avatar chat-image">
								<div class="h-8 w-8 rounded-full">
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
								<div class="font-heading chat-header mb-1 mt-2">
									{msg.by === 'persona' ? data.persona.name : 'You'}
								</div>
							{/if}
							<div class="chat-bubble whitespace-pre-line">{msg.text}</div>
							{#if msg.showFooter}
								<div class="chat-footer mb-2 mt-1 flex items-center gap-2 text-xs opacity-50">
									<time datetime={msg.at.toISOString()} title={msg.at.toISOString()}
										>{dayjs().to(dayjs(msg.at))}</time
									>
									{#if msg.by === 'user' && typeof messageBeingGenerated === 'undefined'}
										<button
											on:click={() => {
												messageTextBeingEdited = msg.text
												idxOfMessageBeingEdited = idx
												tick().then(() => {
													isEditDialogOpen = true
												})
											}}
										>
											<PencilIcon class="h-4 w-4" />
										</button>
										<button
											on:click={() => {
												if (
													confirm(
														"Are you sure? Both your message and the LLM's response will be deleted"
													)
												) {
													messages = messages.toSpliced(idx, 2)
													saveMessages()
												}
											}}
										>
											<TrashIcon class="h-4 w-4" />
										</button>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
					{#if typeof messageBeingGenerated !== 'undefined'}
						<div class="chat chat-start my-4">
							<div class="avatar chat-image">
								<div class="h-8 w-8 rounded-full">
									<img
										src={`${env.PUBLIC_S3_CDN_URL}/persona_avatars/${data.persona.id}.png`}
										alt="Persona's Avatar"
									/>
								</div>
							</div>
							<div class="font-heading chat-header mb-1 mt-4">
								{data.persona.name}
							</div>
							<div class="chat-bubble">
								{#if !messageBeingGenerated.trim()}
									<div class="flex justify-center py-2">
										<span class="loading loading-dots"></span>
									</div>
								{:else}
									{messageBeingGenerated}
									<span class="relative ml-1 inline-flex h-3 w-3">
										<span class="min-h-3 min-w-3 rounded-full bg-gray-800/80 dark:bg-white/80"
										></span>
										<span
											class="absolute h-full w-full animate-ping rounded-full bg-gray-800/50 dark:bg-white/50"
										></span>
									</span>
								{/if}
							</div>
							<div class="chat-footer mb-4 mt-1 text-xs opacity-50">generating...</div>
						</div>
					{/if}
				{/if}
			</div>
			<form on:submit|preventDefault={sendMessage} class="m-4 mt-0 flex items-center gap-2">
				<VoiceButton
					on:recognise={({ detail }) => {
						const msg = document.getElementById('message')
						if (msg) msg.value = (msg.value.trim() + ' ' + detail).trim()
					}}
				/>
				<textarea
					name="message"
					id="message"
					aria-label="Message"
					placeholder="Enter your message."
					on:keydown={e => {
						// on smaller devices, enter goes to a new line, ctrl+enter submits the form.
						// on larger devices, enter submits the form, shift+enter goes to a new line.
						if (e.key === 'Enter') {
							const isSmallerThanMdBreakpoint = window.innerWidth < 768
							if (
								(isSmallerThanMdBreakpoint && e.ctrlKey) ||
								(!isSmallerThanMdBreakpoint && !e.shiftKey)
							) {
								e.preventDefault()
								e.currentTarget.form?.requestSubmit()
							}
						}
					}}
					rows={1}
					on:input={e => {
						e.currentTarget.style.height = ''
						// height for one row = 46px
						// height for two rows = 46 + 22 px
						// height for every row after that = height + 24px
						// extra 2px added for buffer area (so scrollbar doesn't appear)
						// max height = 5 rows (46 + 22 + 3(24) px)
						e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight + 2, 142) + 'px'
					}}
					class="textarea textarea-bordered w-full resize-none pt-3 text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
				/>
				<button
					class="btn-circle btn-neutral grid place-items-center"
					aria-label="Send"
					title="Send message"
					type={generateController ? 'button' : 'submit'}
					on:click={generateController?.abort.bind(generateController)}
				>
					{#if sendingMessage}
						<span class="loading loading-spinner"></span>
					{:else if generateController}
						<StopCircleIcon class="h-6 w-6" />
					{:else if typeof messageBeingGenerated !== 'undefined'}
						<!-- For some reason the controller is undefined -->
						<span class="loading loading-ring"></span>
					{:else}
						<SendIcon class="h-6 w-6" />
					{/if}
				</button>
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

<EditDialog
	bind:isOpen={isEditDialogOpen}
	message={messageTextBeingEdited}
	error={editMessageError}
	loading={sendingMessage || typeof messageBeingGenerated !== 'undefined'}
	on:close={() => {
		messageTextBeingEdited = ''
		idxOfMessageBeingEdited = -1
	}}
	on:edit={({ detail: msg }) => {
		editMessage(msg, idxOfMessageBeingEdited)
	}}
/>

<style lang="postcss">
	#messages-box,
	#message {
		scrollbar-color: theme(colors.base-100) theme(colors.base-300);
	}
</style>
