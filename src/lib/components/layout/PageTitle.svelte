<script lang="ts">
	import { config } from '$config';

	type Props = {
		/**
		 * The page's own part of the title. Left out on the landing page, where
		 * the app name stands on its own.
		 */
		text?: string;
	};

	let { text }: Props = $props();
</script>

<!-- One place that decides how a tab is labelled, so twenty pages cannot drift
     apart on the separator or the order. -->
<svelte:head><title>{text ? `${text} · ${config.app.name}` : config.app.name}</title></svelte:head>
