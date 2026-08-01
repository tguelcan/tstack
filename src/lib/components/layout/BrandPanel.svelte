<script lang="ts">
	import Icon from '$components/elements/Icon.svelte';
	import Logo from './Logo.svelte';
	import { config } from '$config';

	// Three lines of proof next to the form. They live in `config.json`, so all
	// four auth screens make the same promise and it can be retold without
	// touching this component.
	const { headline, highlights } = config.content.authPanel;
</script>

<!-- Decoration only: the form on the other side carries the whole flow, so this
     panel disappears below `lg` instead of pushing the inputs off screen. -->
<aside class="relative hidden overflow-hidden bg-secondary text-secondary-content lg:flex">
	<div
		class="absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="absolute -bottom-32 -left-16 size-80 rounded-full bg-accent/20 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative flex flex-col p-10 xl:p-14">
		<Logo href="/" class="text-secondary-content" />

		<!-- `my-auto` keeps this centred in what is left below the logo; the
		     copyright lives in the footer the form column carries. -->
		<div class="my-auto max-w-md py-12">
			<p class="text-3xl leading-tight font-semibold text-balance">
				{headline}
			</p>

			<ul class="mt-10 space-y-6">
				{#each highlights as highlight (highlight.title)}
					<li class="flex items-start gap-4">
						<span class="">
							<Icon name={highlight.icon} size={18} />
						</span>
						<div class="-mt-1.5">
							<p class="font-medium">{highlight.title}</p>
							<p class="text-sm opacity-70">{highlight.text}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</aside>
