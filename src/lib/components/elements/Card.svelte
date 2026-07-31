<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Tone = 'error' | 'warning';

	type Props = {
		/** Heading of the card; omit for a plain surface. */
		title?: string;
		/** Supporting line below the title. */
		description?: string;
		/** Symbol in front of the title, from `elements/icons.ts`. */
		icon?: string;
		/** Colours the icon and the border — `error` marks a destructive section. */
		tone?: Tone;
		/** Content of the card body. */
		children?: Snippet;
		/** Rendered in the header, opposite the title — usually a `Button`. */
		actions?: Snippet;
		/** Separated strip at the bottom, e.g. for a save button. */
		footer?: Snippet;
		/** Removes the body padding, so tables can sit flush against the border. */
		flush?: boolean;
		class?: string;
	};

	let {
		title,
		description,
		icon,
		tone,
		children,
		actions,
		footer,
		flush = false,
		class: className
	}: Props = $props();

	const hasHeader = $derived(!!title || !!description || !!actions);

	// Full class names, so Tailwind can find them when scanning the source.
	const borderMap: Record<Tone, string> = {
		error: 'border-error/40',
		warning: 'border-warning/40'
	};

	const iconMap: Record<Tone, string> = {
		error: 'text-error',
		warning: 'text-warning'
	};
</script>

<section
	class={[
		'not-prose card border bg-base-100',
		tone ? borderMap[tone] : 'border-base-300',
		className
	]}
>
	{#if hasHeader}
		<header
			class={[
				'flex items-start justify-between gap-4 px-5 pt-5',
				flush && 'border-b border-base-300 pb-5'
			]}
		>
			<div class="flex min-w-0 items-start gap-2.5">
				{#if icon}
					<span class={['mt-0.5 shrink-0', tone ? iconMap[tone] : 'text-base-content/40']}>
						<Icon name={icon} size={18} />
					</span>
				{/if}

				<div class="min-w-0">
					{#if title}
						<h2 class="truncate font-semibold">{title}</h2>
					{/if}
					{#if description}
						<p class="text-muted mt-1 text-sm">{description}</p>
					{/if}
				</div>
			</div>

			{#if actions}
				<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
			{/if}
		</header>
	{/if}

	{#if children}
		<div class={[!flush && 'p-5', hasHeader && !flush && 'pt-4']}>{@render children()}</div>
	{/if}

	{#if footer}
		<footer class="flex items-center justify-end gap-2 border-t border-base-300 px-5 py-4">
			{@render footer()}
		</footer>
	{/if}
</section>
