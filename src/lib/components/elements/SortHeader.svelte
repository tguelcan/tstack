<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import type { SortDir } from '$helper/list';

	type Props = {
		label: string;
		/** Target link, usually from `list.sortHref(page.url, field)`. */
		href: string;
		/** Set when the list is currently sorted by this column. */
		dir?: SortDir;
	};

	let { label, href, dir }: Props = $props();
</script>

<th aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
	<Button
		{href}
		color="ghost"
		size="sm"
		icon={dir === 'asc' ? 'ArrowUp01Icon' : dir === 'desc' ? 'ArrowDown01Icon' : undefined}
		iconRight
	>
		{label}
	</Button>
</th>
