<script lang="ts">
	import { ArrowDown } from 'lucide-svelte'

	export let data
</script>

<div class="bg-base-200 py-8">
	<div
		class="container mx-auto grid grid-cols-1 grid-rows-2 gap-y-12 divide-x-reverse lg:grid-cols-2 lg:grid-rows-1"
	>
		<div class="row-start-2 flex flex-col items-center gap-4 px-4 lg:row-start-1 lg:justify-center">
			<h1 class="font-heading text-center text-5xl font-bold">
				<span class="text-primary">Chat</span>Crafters
			</h1>
			<p class="text-center text-2xl md:text-3xl">
				Craft your conversations, meet virtual personas, connect!
			</p>
			<div class="flex items-center justify-center gap-4">
				{#if !data.user}
					<a href="/auth?mode=signup" class="btn btn-primary text-lg">Sign up</a>
					<a href="/auth?mode=login" class="btn btn-outline btn-primary text-lg">Log in</a>
				{/if}
			</div>

			<div class="flex justify-center pt-20 lg:hidden">
				<span class="animate-bounce text-primary opacity-50"><ArrowDown class="h-8 w-8" /></span>
			</div>
		</div>
		<div class="row-start-1 flex flex-col items-center justify-center">
			<div class="mockup-phone">
				<div class="camera"></div>
				<div class="display">
					<img
						src="/1.jpg"
						class="h-[800px] w-[400px] lg:h-[1000px] lg:w-[500px]"
						alt="A screenshot of the messages between a persona and the user"
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<div
	class="container mx-auto mt-20 grid grid-cols-1 grid-rows-2 gap-y-8 divide-x-reverse lg:grid-cols-2 lg:grid-rows-1"
>
	<div class="relative flex flex-col items-center justify-center">
		<img
			src="/2.jpg"
			class="h-[750px] w-[400px] rounded-xl border-2 border-neutral lg:h-[600px] lg:w-[300px]"
			alt="A screenshot showing the explore page"
		/>
		<img
			src="/3.jpg"
			class="absolute bottom-4 h-[413px] w-[300px] rounded-xl border-2 border-primary shadow-xl lg:bottom-[-2rem] lg:right-[-1rem]"
			alt="A screenshot of all the LLMs available"
		/>
	</div>
	<div class="flex flex-col items-center gap-4 px-4 lg:justify-center">
		<h2 class="font-heading text-center text-4xl font-semibold">Create and view personas</h2>
		<p class="text-center text-2xl">
			AI can act as anyone you like, and with the help of a tailored selection of Open Models, you
			can craft a "persona" however you want. The only limit is your imagination!
		</p>
		<div class="flex items-center justify-center gap-4">
			<a href="/explore" class="btn btn-outline btn-primary text-lg">Explore personas</a>
		</div>
	</div>
</div>

<div class="my-10 bg-base-200 py-8">
	<div
		class="container mx-auto grid grid-cols-1 grid-rows-2 gap-y-8 divide-x-reverse lg:grid-cols-2 lg:grid-rows-1"
	>
		<div class="row-start-2 flex flex-col items-center gap-4 px-4 lg:row-start-1 lg:justify-center">
			<h2 class="font-heading text-center text-4xl font-semibold">Generate images</h2>
			<p class="text-center text-2xl">
				Generate an image with AI for your persona's avatar. Along with customizing how your persona
				acts, you can also customize how your persona looks.
			</p>
			<div class="flex items-center justify-center gap-4">
				<a href="/new" class="btn btn-outline btn-primary text-lg">Create a new persona</a>
			</div>
		</div>
		<div class="relative row-start-1 flex flex-col items-center justify-center">
			<img
				src="/4.jpg"
				class="h-[750px] w-[400px] rounded-xl border-2 border-neutral lg:h-[600px] lg:w-[300px]"
				alt="A screenshot showing the new persona page"
			/>
			<img
				src="/5.jpg"
				class="absolute bottom-4 h-[413px] w-[300px] rounded-xl border-2 border-primary shadow-xl lg:bottom-[-2rem] lg:right-[-1rem]"
				alt="A screenshot showing persona generation"
			/>
		</div>
	</div>
</div>

<div
	class="container mx-auto mt-10 grid grid-cols-1 grid-rows-2 gap-y-8 divide-x-reverse lg:grid-cols-2 lg:grid-rows-1"
>
	<div class="relative flex flex-col items-center justify-center">
		<img
			src="/6.jpg"
			class="h-[300px] w-[350px] rounded-xl border-2 border-neutral"
			alt="A screenshot showing the report dialog"
		/>
	</div>
	<div class="flex flex-col items-center gap-4 px-4 lg:justify-center">
		<h2 class="font-heading text-center text-4xl font-semibold">
			Help keep <span class="text-primary">Chat</span>Crafters Safe and Fun
		</h2>
		<p class="text-center text-2xl">
			Report offensive personas and contribute to ChatCrafters on <a
				href="https://github.com/arnu515/chatcrafters"
				class="link link-primary">GitHub</a
			>!
		</p>
	</div>
</div>

<div class="mt-20 flex flex-col items-center gap-4 bg-base-300 py-10">
	<p class="text-lg">
		This project was made for the <a
			href="https://dev.to/devteam/join-us-for-the-cloudflare-ai-challenge-3000-in-prizes-5f99"
			class="link">Cloudflare AI Challenge on DEV</a
		>.
	</p>
	<p class="flex gap-4 opacity-75">
		<a href="/" class="link">My submission post</a> |
		<a href="https://github.com/arnu515/chatcrafters" class="link">GitHub</a>
	</p>
	<div class="text-sm opacity-50">Made with ❤️ in 🇮🇳</div>
</div>
