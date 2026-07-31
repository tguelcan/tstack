<script lang="ts" generics="Row, Field extends string = string">
	import type { Snippet } from 'svelte';
	import type { SortDir } from '$helper/list';
	import SortHeader from './SortHeader.svelte';

	type Column = {
		label: string;
		/**
		 * Sort key. Together with the `sort` prop it turns this header into a sort
		 * link; without either, the header is plain text. `Field` is inferred from
		 * the columns, so a list config keeps its own union of sortable fields
		 * instead of widening to `string`.
		 */
		field?: Field;
		/** Hides the caption visually but keeps it for screen readers — action columns. */
		srOnly?: boolean;
		/** Extra classes for the header cell, e.g. `text-right` or `w-0`. */
		class?: string;
	};

	type Props = {
		columns: Column[];
		rows: Row[];
		/** Stable identity for the keyed each block. */
		key: (row: Row) => string | number;
		/** Renders the `<td>` elements of one row — one per column. */
		row: Snippet<[Row]>;
		/**
		 * Turns sortable columns into links. `href` usually comes from a list
		 * config, e.g. `(field) => taskList.sortHref(page.url, field)`.
		 */
		sort?: { field?: Field; dir?: SortDir; href: (field: Field) => string };
		/** `id` for each `<tr>`, so a redirect can anchor back to a row. */
		rowId?: (row: Row) => string;
		/** Shown instead of the table when there is nothing to list. */
		empty?: Snippet;
		class?: string;
	};

	let { columns, rows, key, row, sort, rowId, empty, class: className }: Props = $props();
</script>

<!--
	The shared table for every list in the app. It owns the chrome — horizontal
	scrolling, header row, sort links, row hover and anchor targets — while the
	caller keeps full control over the cells through the `row` snippet. That is
	the split that lets a task list, an invoice list and a member list look the
	same without pretending their contents are interchangeable.
-->
{#if rows.length}
	<div class={['overflow-x-auto', className]}>
		<table class="table">
			<thead>
				<tr>
					{#each columns as column (column.label)}
						{#if sort && column.field}
							<SortHeader
								label={column.label}
								href={sort.href(column.field)}
								dir={sort.field === column.field ? sort.dir : undefined}
							/>
						{:else}
							<th class={column.class}>
								{#if column.srOnly}
									<span class="sr-only">{column.label}</span>
								{:else}
									{column.label}
								{/if}
							</th>
						{/if}
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each rows as item (key(item))}
					<!-- `scroll-mt-24` and `target:` are free when unused: they only bite
					     once a URL fragment actually points at this row. -->
					<tr id={rowId?.(item)} class="scroll-mt-24 target:bg-base-200 hover:bg-base-200/50">
						{@render row(item)}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if empty}
	{@render empty()}
{/if}
