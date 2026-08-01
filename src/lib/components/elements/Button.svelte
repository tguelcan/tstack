<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Modifiers = 'block' | 'circle';

	/** Style modifiers that combine with any `color`. */
	type Variant = 'outline' | 'soft' | 'dash';

	type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

	type Props = {
		// Replace these types with string or your project's color/size types if available
		color?: string | '';
		variant?: Variant;
		size?: string | '';
		modifier?: Modifiers;
		children?: Snippet;
		onclick?: (event?: MouseEvent) => void;
		loading?: boolean;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
		href?: string;
		target?: '_blank' | '_self' | '_parent' | '_top';
		arrowLeft?: boolean;
		arrowRight?: boolean;
		icon?: string;
		iconLeft?: Snippet;
		iconRightSnippet?: Snippet;
		iconRight?: boolean;
		type?: 'button' | 'submit' | 'reset';
		formaction?: string;
		/**
		 * Id of the `<form>` this button submits, even when it sits outside of it.
		 * Needed for submit buttons inside a `<dialog>`, since the top layer takes
		 * them out of the form's DOM subtree.
		 */
		form?: string;
		/**
		 * Invoker Commands API: `commandfor` is the id of the target element,
		 * `command` the action (`show-modal`, `close`, `toggle-popover`, …).
		 * Handled by the browser, so it needs no JavaScript of ours.
		 */
		command?: string;
		commandfor?: string;
		/** Ends up as the dialog's `returnValue` when the button closes it. */
		value?: string;
		block?: boolean | 'responsive';
		/** Pill shape — full border radius on both ends. */
		rounded?: boolean;
		tooltip?: string;
		tooltipPosition?: TooltipPosition;
		responsive?: boolean;
		preloadData?: boolean;
	};

	let {
		color = '',
		variant,
		size = '',
		modifier,
		children,
		onclick,
		loading = false,
		disabled = false,
		class: className,
		href,
		target,
		arrowLeft = false,
		arrowRight = false,
		icon,
		iconLeft,
		iconRightSnippet,
		iconRight = false,
		type = 'submit',
		formaction,
		form,
		command,
		commandfor,
		value,
		block,
		rounded = false,
		tooltip,
		ariaLabel,
		tooltipPosition = 'top',
		responsive = false,
		preloadData = true
	}: Props = $props();

	const tooltipPositionMap: Record<TooltipPosition, string> = {
		top: 'tooltip-top',
		bottom: 'tooltip-bottom',
		left: 'tooltip-left',
		right: 'tooltip-right'
	};

	const modifierMap: Record<Modifiers, string> = {
		block: 'btn-block',
		circle: 'btn-circle'
	};

	const variantMap: Partial<Record<string, string>> = {
		neutral: 'btn-neutral',
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		accent: 'btn-accent',
		info: 'btn-info',
		success: 'btn-success',
		warning: 'btn-warning',
		error: 'btn-error',
		ghost: 'btn-ghost',
		link: 'btn-link'
	};

	const styleMap: Record<Variant, string> = {
		outline: 'btn-outline',
		soft: 'btn-soft',
		dash: 'btn-dash'
	};

	const sizeMap: Partial<Record<string, string>> = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: 'btn-md',
		lg: 'btn-lg',
		xl: 'btn-xl'
	};

	const blockClass = $derived(
		block === true ? 'btn-block' : block === 'responsive' ? 'max-sm:btn-block' : ''
	);

	const responsiveClass = $derived(responsive ? 'max-sm:btn-circle' : '');

	const roundedClass = $derived(rounded ? 'rounded-full' : '');
</script>

{#snippet button()}
	<svelte:element
		this={href ? 'a' : 'button'}
		aria-label={ariaLabel}
		role={href ? 'link' : 'button'}
		tabindex="0"
		type={href ? undefined : type}
		formaction={href ? undefined : formaction}
		form={href ? undefined : form}
		command={href ? undefined : command}
		commandfor={href ? undefined : commandfor}
		value={href ? undefined : value}
		disabled={href ? undefined : disabled || loading}
		class="group not-prose btn antialiased
      {color && variantMap[color]}
      {variant && styleMap[variant]}
      {size && sizeMap[size]}
      {modifier && modifierMap[modifier]}
      {tooltip && 'tooltip'}
      {tooltipPositionMap[tooltipPosition]}
      {blockClass}
      {responsiveClass}
      {roundedClass}
      {className}"
		{href}
		{target}
		rel={target === '_blank' ? 'noopener noreferrer' : undefined}
		{onclick}
		data-tip={tooltip}
		data-sveltekit-preload-data={href && preloadData ? 'hover' : undefined}
	>
		{#if arrowLeft}
			<span class="inline-flex transition-transform duration-200 group-hover:-translate-x-0.5">
				<Icon name="ArrowLeft01Icon" size={16} strokeWidth={2} />
			</span>
		{:else if iconLeft}
			{@render iconLeft?.()}
		{:else if icon && !iconRight}
			<Icon name={icon} size={size === 'sm' ? 14 : 16} strokeWidth={2} />
		{/if}

		{#if children}
			<span class={responsive ? 'max-sm:hidden' : 'shrink-0'}>{@render children?.()}</span>
		{/if}

		{#if loading}
			<span class="loading loading-xs animate-fade-in loading-spinner"></span>
		{:else if iconRightSnippet}
			{@render iconRightSnippet?.()}
		{:else if icon && iconRight}
			<Icon name={icon} size={size === 'sm' ? 14 : 16} strokeWidth={2} />
		{:else if arrowRight}
			<span class="inline-flex transition-transform duration-200 group-hover:translate-x-0.5">
				<Icon name="ArrowRight01Icon" size={16} strokeWidth={2} />
			</span>
		{/if}
	</svelte:element>
{/snippet}

{@render button()}
