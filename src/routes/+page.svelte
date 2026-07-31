<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import Icon from '$components/elements/Icon.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import Logo from '$components/layout/Logo.svelte';
	import ThemeToggle from '$components/layout/ThemeToggle.svelte';

	const entries = [
		{
			href: '/dashboard',
			label: 'App',
			icon: 'DashboardSquare01Icon',
			text: 'Dashboard, team, billing, profile and settings behind a collapsible sidebar.'
		},
		{
			href: '/login',
			label: 'Auth',
			icon: 'SquareLock01Icon',
			text: 'Sign in, sign up and the two password flows — validated on the server.'
		},
		{
			href: '/components',
			label: 'Components',
			icon: 'Layers01Icon',
			text: 'Every element with the props that produce each variant.'
		},
		{
			href: '/crud',
			label: 'Tasks',
			icon: 'Task01Icon',
			text: 'List with search, filters, sorting and paging — all of it in the URL.'
		},
		{
			href: '/privacy',
			label: 'Content',
			icon: 'Legal01Icon',
			text: 'Privacy, terms and imprint, written as markdown via mdsvex.'
		}
	];
</script>

<svelte:head><title>tstack</title></svelte:head>

<div class="flex min-h-screen flex-col bg-base-100">
	<header class="border-b border-base-300">
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
			<Logo />
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<Button href="/login" color="neutral" size="sm" variant="outline">Sign in</Button>
			</div>
		</div>
	</header>

	<main class="flex-1 px-6 py-16">
		<div class="mx-auto w-full max-w-5xl">
			<h1 class="max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
				A SaaS scaffold on SvelteKit, Prisma and daisyUI.
			</h1>
			<p class="text-muted mt-4 max-w-xl">
				Route groups for the app, the auth flows and the legal pages — plus the handful of
				components they are built from. Start anywhere:
			</p>

			<div class="mt-6 flex flex-wrap gap-3">
				<Button href="/dashboard" color="primary" arrowRight>Open the app</Button>
				<Button href="/components" color="neutral" variant="outline">Browse components</Button>
			</div>

			<ul class="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each entries as entry (entry.href)}
					<li>
						<a
							href={entry.href}
							class="group flex h-full flex-col rounded-box border border-base-300 p-5 transition-colors hover:border-primary hover:bg-base-200/50"
						>
							<span class="flex items-center gap-2.5 font-medium">
								<Icon name={entry.icon} size={18} />
								{entry.label}
								<span
									class="ml-auto text-base-content/30 transition-transform group-hover:translate-x-0.5 group-hover:text-base-content"
								>
									<Icon name="ArrowRight01Icon" size={16} />
								</span>
							</span>
							<span class="text-muted mt-2 text-sm">{entry.text}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</main>

	<Footer />
</div>
