<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { XIcon } from 'lucide-svelte'
	import { fade, fly } from 'svelte/transition'

	export let data
	export let form
</script>

{#if data.user}
	<main class="container mx-auto my-10">
		<h1 class="text-3xl font-semibold">Your Account</h1>
		<form method="post" action="?/username" class="my-8">
			<h3 class="my-2 text-2xl font-medium">Change your username</h3>
			<input
				type="text"
				name="username"
				aria-label="Username"
				class="input input-bordered my-1 block w-full max-w-sm placeholder:text-gray-300 dark:placeholder:text-gray-600"
				required
				minlength={4}
				maxlength={64}
				placeholder="Enter your new username"
				value={data.user.username}
			/>
			<p class="my-1 text-error">
				{form?.message && form.action === 'username'
					? `Could not change your username: ${form.message}`
					: ''}
			</p>
			<p class="my-1 text-success">
				{form?.success && form.action === 'username'
					? 'Your username has been changed successfully.'
					: ''}
			</p>
			<button class="btn btn-primary my-2 block">Change username</button>
		</form>
		<form method="post" action="?/avatar" class="my-8" enctype="multipart/form-data">
			<h3 class="my-2 text-2xl font-medium">Change your avatar</h3>
			<input
				type="file"
				name="avatar"
				aria-label="Avatar"
				class="file-input file-input-bordered my-1 block w-full max-w-sm placeholder:text-gray-300 dark:placeholder:text-gray-600"
				accept="image/png"
				placeholder="Select avatar"
			/>
			<p class="my-1 text-error">
				{form?.message && form.action === 'avatar'
					? `Could not change your avatar: ${form.message}`
					: ''}
			</p>
			<p class="my-1 text-success">
				{form?.success && form.action === 'avatar'
					? 'Your avatar has been changed successfully. It may take some time for changes to appear, though.'
					: ''}
			</p>
			<div class="my-2 flex items-center gap-2">
				<button class="btn btn-primary block">Change avatar</button>
				<button formaction="?/resetAvatar" class="btn btn-outline btn-neutral block">
					Reset avatar
				</button>
			</div>
		</form>
		<div class="my-8 rounded-md border border-error px-4 py-2">
			<h3 class="my-2 text-2xl font-medium text-error">Danger Zone</h3>
			<div
				class="my-2 flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-between"
			>
				<span class="text-lg font-medium">Log out of your account</span>
				<a href="/auth/logout" class="btn btn-error btn-wide" type="button">Log out</a>
			</div>
			<div
				class="my-2 flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-between"
			>
				<span class="text-lg font-medium"
					>Delete your account? This will remove all your personas.</span
				>
				<Dialog.Root>
					<Dialog.Trigger class="btn btn-error btn-wide" type="submit"
						>Delete account</Dialog.Trigger
					>
					<Dialog.Portal>
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
								>Are you sure?
								<Dialog.Close class="ml-auto rounded-full p-2 active:scale-95">
									<XIcon class="h-5 w-5" />
								</Dialog.Close>
							</Dialog.Title>
							<form action="?/deleteAccount" method="post">
								<p class="my-4 text-lg font-medium">
									Are you sure you want to delete your account? All your personas, messages, images,
									and other data will be <strong class="font-semibold">PERMANENTLY</strong> deleted.
									There is no going back.
								</p>
								<label for="password">
									<div class="label">
										<span class="label-text">Enter your password</span>
									</div>
									<input
										type="password"
										name="password"
										id="password"
										required
										maxlength={128}
										class="input input-bordered w-full placeholder:text-gray-300 dark:placeholder:text-gray-600"
										placeholder="***********"
									/>
								</label>
								<p class="py-2 text-sm text-error">{form?.message ?? ''}</p>
								<div class="mt-4 flex items-center justify-between">
									<Dialog.Close type="button" class="btn btn-outline btn-neutral text-lg"
										>Cancel</Dialog.Close
									>
									<button class="btn btn-error text-lg">Delete account</button>
								</div>
							</form>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</div>
			<p class="text-error">
				{form?.message && form.action === 'delete'
					? `Could not delete your account: ${form.message}`
					: ''}
			</p>
		</div>
	</main>
{/if}
