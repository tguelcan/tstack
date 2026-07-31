<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Color = 'info' | 'success' | 'warning' | 'error';
	type Variant = 'outline' | 'dash' | 'soft';

	type Props = {
		color?: Color;
		variant?: Variant;
		/** Bold first line. Without it the children carry the whole message. */
		title?: string;
		children?: Snippet;
		/** Overrides the icon that `color` would pick. */
		icon?: string;
		/** Trailing controls, e.g. a dismiss or retry button. */
		actions?: Snippet;
		class?: string;
	};

	let {
		color = 'info',
		variant = 'soft',
		title,
		children,
		icon,
		actions,
		class: className
	}: Props = $props();

	// Full class names, so Tailwind can find them when scanning the source.
	const colorMap: Record<Color, string> = {
		info: 'alert-info',
		success: 'alert-success',
		warning: 'alert-warning',
		error: 'alert-error'
	};

	const variantMap: Record<Variant, string> = {
		outline: 'alert-outline',
		dash: 'alert-dash',
		soft: 'alert-soft'
	};

	const iconMap: Record<Color, string> = {
		info: 'InformationCircleIcon',
		success: 'CheckmarkCircle01Icon',
		warning: 'Alert01Icon',
		error: 'Alert01Icon'
	};

	// `error` is the only level that interrupts; the rest may wait for a pause in
	// what the screen reader is currently saying.
	const role = $derived(color === 'error' ? 'alert' : 'status');
</script>

<div
	{role}
	class={['not-prose alert items-start', colorMap[color], variantMap[variant], className]}
>
	<span class="mt-0.5"><Icon name={icon ?? iconMap[color]} size={20} /></span>

	<div class="min-w-0 flex-1">
		{#if title}
			<p class="font-medium">{title}</p>
		{/if}
		{#if children}
			<div class={['text-sm', title && 'mt-0.5 opacity-80']}>{@render children()}</div>
		{/if}
	</div>

	{@render actions?.()}
</div>
