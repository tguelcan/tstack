<script module lang="ts">
	import type { IconSvgElement } from '@hugeicons/svelte';
	import * as registry from './icons';

	const icons = registry as Record<string, IconSvgElement>;

	/**
	 * Hugeicons ships attributes in camelCase (`strokeLinecap`) plus a `key` that
	 * is only meaningful to React. SVG wants kebab-case, so translate before
	 * rendering.
	 */
	function toSvgAttributes(attributes: Record<string, unknown>, strokeWidth: number) {
		const result: Record<string, string> = {};

		for (const [key, value] of Object.entries(attributes)) {
			if (key === 'key') continue;
			result[key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()] = String(value);
		}

		result.stroke = 'currentColor';
		result['stroke-width'] = String(strokeWidth);

		return result;
	}
</script>

<script lang="ts">
	import { dev } from '$app/env';

	interface Props {
		name: string;
		size?: number;
		strokeWidth?: number;
	}

	let { name, size = 24, strokeWidth = 1.5 }: Props = $props();

	// Names resolve against the local registry (see `icons.ts`), which keeps the
	// icon bundle at a few kilobytes instead of the full 5.5 MB package. The
	// lookup is synchronous, so icons render during SSR and never "pop in".
	//
	// We draw the paths ourselves instead of using `<HugeiconsIcon>`: that
	// component fills its `<svg>` imperatively in `onMount` and therefore stays
	// empty on the server.
	const shapes = $derived(
		(icons[name] ?? []).map(
			([tag, attributes]) => [tag, toSvgAttributes(attributes, strokeWidth)] as const
		)
	);

	$effect(() => {
		if (dev && !icons[name]) {
			console.warn(`[Icon] "${name}" is not in the registry — add it to elements/icons.ts`);
		}
	});
</script>

<span class="inline-flex shrink-0" style="width:{size}px;height:{size}px;">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
	>
		{#each shapes as [tag, attributes], index (index)}
			<svelte:element this={tag} {...attributes} />
		{/each}
	</svg>
</span>
