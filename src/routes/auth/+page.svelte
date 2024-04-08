<script lang="ts">
	export let data
	export let form

	const TEXT: Record<string, Record<string, string>> = {
		title: {
			login: 'Sign In to your Account',
			signup: 'Create an Account'
		},
		alternative: {
			login: 'No account? Create One.',
			signup: 'Already have an account? Log in.'
		},
		submit: {
			login: 'Sign In',
			signup: 'Sign Up'
		}
	}
</script>

<main class="container mx-auto pt-10">
	<h1 class="font-heading mt-4 text-center text-5xl font-semibold">
		<span class="text-primary">Chat</span>Crafters
	</h1>

	<form
		method="POST"
		class="mx-auto my-8 max-w-md rounded-md border border-base-200 bg-base-300 px-6 py-3 shadow-md"
	>
		<h3 class="my-4 text-2xl">{TEXT.title[data.mode]}</h3>
		<hr class="mb-4 border-t border-neutral" />

		<label class="form-control my-2 w-full" for="email">
			<div class="label">
				<span class="label-text">Enter your Email</span>
			</div>
			<input
				type="text"
				name="email"
				id="email"
				placeholder="john.doe@example.com"
				value={form?.data.email ?? ''}
				class="input input-bordered w-full placeholder:text-gray-300 dark:placeholder:text-gray-600"
				required
			/>
		</label>
		<label class="form-control my-2 w-full" for="password">
			<div class="label">
				<span class="label-text">Enter your Password</span>
			</div>
			<input
				type="password"
				name="password"
				id="password"
				placeholder="************"
				value={form?.data.password ?? ''}
				class="input input-bordered w-full placeholder:text-gray-300 dark:placeholder:text-gray-600"
				required
			/>
		</label>
		{#if data.mode === 'signup'}
			<label class="form-control my-2 w-full" for="cpassword">
				<div class="label">
					<span class="label-text">Confirm your Password</span>
				</div>
				<input
					type="password"
					name="cpassword"
					id="cpassword"
					placeholder="************"
					value={form?.data.cpassword ?? ''}
					class="input input-bordered w-full placeholder:text-gray-300 dark:placeholder:text-gray-600"
					required
				/>
			</label>
			<label class="form-control my-2 w-full" for="username">
				<div class="label">
					<span class="label-text">Enter a Username</span>
				</div>
				<input
					type="text"
					name="username"
					minlength={4}
					maxlength={64}
					id="username"
					placeholder="johndoe1"
					value={form?.data.username ?? ''}
					class="input input-bordered w-full placeholder:text-gray-300 dark:placeholder:text-gray-600"
					required
				/>
			</label>
		{/if}
		<div class="my-4 flex flex-col justify-center gap-2">
			<a
				href="/auth?mode={data.mode === 'signup' ? 'login' : 'signup'}"
				class="link link-primary w-full text-right text-sm"
			>
				{TEXT.alternative[data.mode]}
			</a>
			<button class="btn btn-primary uppercase">{TEXT.submit[data.mode]}</button>
			<p class="text-center text-error">{form?.error?.trim() ? form?.error?.trim() : ''}</p>
		</div>
	</form>
</main>
