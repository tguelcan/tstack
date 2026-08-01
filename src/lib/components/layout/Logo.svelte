<script lang="ts">
	import Icon from '$components/elements/Icon.svelte';
	import { config } from '$config';

	type Props = {
		href?: string;
		/** Extra classes for the wordmark — the sidebar hides it when collapsed. */
		labelClass?: string;
		class?: string;
	};

	let { href = '/', labelClass, class: className }: Props = $props();

	const { name, icon } = config.app;
</script>

<a {href} class={['flex items-center font-medium', className]} aria-label={name}>
	<span class="grid size-8 shrink-0 place-items-center">
		<Icon name={icon} strokeWidth={2} />
	</span>
	<span class={['truncate', labelClass]}>{name}</span>
</a>
