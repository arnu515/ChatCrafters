<script lang="ts">
	import { page } from '$app/stores'
	import { DropdownMenu } from 'bits-ui'
	import SparkMD5 from 'spark-md5'
	import { MenuIcon, TelescopeIcon, BookUserIcon, SparklesIcon } from 'lucide-svelte'
	import { fly } from 'svelte/transition'

	const user = $page.data?.user ?? null
</script>

<nav class="container navbar mx-auto bg-base-100">
	<!-- TODO: Placeholder icon -->
	<a href="/" class="navbar-start flex items-center gap-2 text-xl">
		<div class="avatar">
			<div class="w-8 rounded">
				<img src="/favicon.png" alt="logo" />
			</div>
		</div>
		<span class="font-heading font-semibold"><span class="text-primary">Chat</span>Crafters</span>
	</a>
	<div class="navbar-end hidden items-center gap-4 lg:flex">
		{#if !user}
			<a href="/auth?mode=login" class="hover:brightness-110">Log in</a>
			<a
				href="/auth?mode=signup"
				class="btn btn-primary no-animation btn-sm border border-white font-semibold"
			>
				Sign up
			</a>
		{:else}
			<a href="/explore" class="px-2 transition-colors hover:text-primary">Explore Personas</a>
			<a href="/my" class="px-2 transition-colors hover:text-primary">View your Personas</a>
			<a href="/new" class="px-2 transition-colors hover:text-primary">New Persona</a>
			<a
				href="/account"
				class="px-2 hover:text-primary"
				title="Your account"
				aria-label="Your account"
			>
				<div class="avatar">
					<div class="w-8 rounded-lg border-2 border-black dark:border-white">
						<img src={user.avatar_url} alt="Your avatar" />
					</div>
				</div>
			</a>
		{/if}
	</div>
	<div class="navbar-end lg:hidden">
		{#if !user}
			<a
				href="/auth?mode=signup"
				class="btn btn-primary no-animation btn-sm border border-white font-semibold"
			>
				Sign up
			</a>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="focus-visible inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-base-300 hover:brightness-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-95 dark:border-gray-700"
				>
					<MenuIcon class="h-6 w-6 fill-base-content" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="shadow-popover w-full max-w-[225px] rounded-lg border border-gray-300 bg-base-300 px-1 py-1.5 dark:border-gray-300"
					transition={fly}
					sideOffset={8}
				>
					<DropdownMenu.Item asChild let:builder>
						<a
							use:builder.action
							{...builder}
							href="/explore"
							class="flex w-full select-none items-center gap-2 px-2 py-1 text-sm font-medium !ring-0 !ring-transparent !ring-offset-transparent data-[highlighted]:brightness-110"
						>
							<TelescopeIcon class="h-5 w-5 text-black dark:text-white" />
							Explore Personas
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild let:builder>
						<a
							use:builder.action
							{...builder}
							href="/my"
							class="flex w-full select-none items-center gap-2 px-2 py-1 text-sm font-medium !ring-0 !ring-transparent !ring-offset-transparent data-[highlighted]:brightness-110"
						>
							<BookUserIcon class="h-5 w-5 text-black dark:text-white" />
							View your Personas
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild let:builder>
						<a
							use:builder.action
							{...builder}
							href="/new"
							class="flex w-full select-none items-center gap-2 px-2 py-1 text-sm font-medium !ring-0 !ring-transparent !ring-offset-transparent data-[highlighted]:brightness-110"
						>
							<SparklesIcon class="h-5 w-5 text-black dark:text-white" />
							New Persona
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild let:builder>
						<a
							use:builder.action
							{...builder}
							href="/account"
							class="flex w-full select-none items-center gap-2 px-2 py-1 text-sm font-medium !ring-0 !ring-transparent !ring-offset-transparent data-[highlighted]:brightness-110"
						>
							<div class="avatar">
								<div class="w-5 rounded-lg border-2 border-black dark:border-white">
									<img
										src="https://gravatar.com/avatar/{SparkMD5.hash(user.email)}?d=mp&s=64"
										alt="Your avatar"
									/>
								</div>
							</div>
							Your account
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</div>
</nav>
