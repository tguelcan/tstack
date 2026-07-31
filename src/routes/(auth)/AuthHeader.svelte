<script lang="ts">
	type Props = {
		title: string;
		description: string;
	};

	let { title, description }: Props = $props();
</script>

<div class="mb-8">
	<h1 class="text-2xl font-semibold">{title}</h1>
	<p class="text-muted mt-1.5 text-sm">{description}</p>
</div>
