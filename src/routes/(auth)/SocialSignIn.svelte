<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import { getAuthProviders, signInWithProvider } from '$remotes/auth.remote';

	type Props = {
		/** Names the action, e.g. "sign in" or "sign up". */
		action: string;
		/** Carried through the round trip, so the visitor lands where they meant to. */
		redirectTo?: string;
	};

	let { action, redirectTo }: Props = $props();

	const brands = {
		google: { label: 'Google', icon: 'GoogleIcon' },
		github: { label: 'GitHub', icon: 'GithubIcon' }
	};

	// Which buttons exist is a server decision — `auth.socialProviders` in
	// `config.json`. With all of them off nothing renders, divider included.
	const providers = $derived(await getAuthProviders());
</script>

{#if providers.length > 0}
	<div class={['grid gap-3', providers.length > 1 && 'grid-cols-2']}>
		{#each providers as provider (provider)}
			<!-- A form, not a link: the authorize URL is built on the server, so this
			     works before hydration and without JavaScript at all. -->
			{@const submit = signInWithProvider.for(provider)}
			<form {...submit}>
				<input {...submit.fields.provider.as('hidden', provider)} />
				{#if redirectTo}
					<input {...submit.fields.redirectTo.as('hidden', redirectTo)} />
				{/if}

				<Button
					variant="outline"
					color=""
					icon={brands[provider].icon}
					block
					loading={!!submit.pending}
				>
					{brands[provider].label}
				</Button>
			</form>
		{/each}
	</div>

	<div class="divider text-xs text-base-content/40">or {action} with email</div>
{/if}
