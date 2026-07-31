<script lang="ts">
	import Icon from '$components/elements/Icon.svelte';

	type Props = {
		href?: string;
		/** Extra classes for the wordmark — the sidebar hides it when collapsed. */
		labelClass?: string;
		class?: string;
	};

	let { href = '/', labelClass, class: className }: Props = $props();
</script>

<a {href} class={['flex items-center gap-2.5 font-semibold', className]} aria-label="tstack">
	<span class="grid size-8 shrink-0 place-items-center rounded-box bg-primary text-primary-content">
		<Icon name="Layers01Icon" size={18} strokeWidth={2} />
	</span>
	<span class={['truncate', labelClass]}>tstack</span>
</a>
