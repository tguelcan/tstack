<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Color =
		'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
	type Variant = 'outline' | 'dash' | 'soft' | 'ghost';
	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	type Props = {
		color?: Color;
		variant?: Variant;
		size?: Size;
		icon?: string;
		children?: Snippet;
		class?: string;
	};

	let { color, variant, size, icon, children, class: className }: Props = $props();

	// Full class names, so Tailwind can find them when scanning the source.
	const colorMap: Record<Color, string> = {
		neutral: 'badge-neutral',
		primary: 'badge-primary',
		secondary: 'badge-secondary',
		accent: 'badge-accent',
		info: 'badge-info',
		success: 'badge-success',
		warning: 'badge-warning',
		error: 'badge-error'
	};

	const variantMap: Record<Variant, string> = {
		outline: 'badge-outline',
		dash: 'badge-dash',
		soft: 'badge-soft',
		ghost: 'badge-ghost'
	};

	const sizeMap: Record<Size, string> = {
		xs: 'badge-xs',
		sm: 'badge-sm',
		md: 'badge-md',
		lg: 'badge-lg',
		xl: 'badge-xl'
	};
</script>

<span
	class="not-prose badge {color && colorMap[color]} {variant && variantMap[variant]} {size &&
		sizeMap[size]} {className}"
>
	{#if icon}
		<Icon name={icon} size={size === 'xs' || size === 'sm' ? 12 : 16} strokeWidth={2} />
	{/if}
	{@render children?.()}
</span>
