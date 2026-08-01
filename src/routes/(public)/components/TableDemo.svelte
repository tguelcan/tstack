<script lang="ts">
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import DataTable from '$components/elements/DataTable.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import Field from './Field.svelte';

	const rows = [
		{ id: 'INV-007', date: '1 July 2026', amount: '€29.00', status: 'Paid' },
		{ id: 'INV-006', date: '1 June 2026', amount: '€29.00', status: 'Paid' },
		{ id: 'INV-005', date: '1 May 2026', amount: '€12.00', status: 'Refunded' }
	];

	const columns = [
		{ label: 'Invoice' },
		{ label: 'Date' },
		{ label: 'Amount' },
		{ label: 'Status' },
		{ label: 'Download', srOnly: true, class: 'w-0' }
	];

	// Typed rather than `rows={[]}`: an empty array literal infers as `never[]`,
	// which leaves the `row` snippet with nothing to destructure.
	const none: typeof rows = [];

	// Sorting is link-driven, so the demo only shows what the header looks like —
	// the real hrefs come from a list config, see `/crud`.
	const sortable = [
		{ label: 'Description', field: 'description' },
		{ label: 'Created', field: 'createdAt' }
	];
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Columns and rows" hint="columns / rows / key / row snippet">
		<div class="w-full rounded-box border border-base-300">
			<DataTable {columns} {rows} key={(invoice) => invoice.id}>
				{#snippet row(invoice)}
					<td class="font-medium">{invoice.id}</td>
					<td class="text-muted whitespace-nowrap">{invoice.date}</td>
					<td class="tabular-nums">{invoice.amount}</td>
					<td>
						<Badge
							size="sm"
							variant="soft"
							color={invoice.status === 'Paid' ? 'success' : 'warning'}
						>
							{invoice.status}
						</Badge>
					</td>
					<td>
						<Button
							type="button"
							color="ghost"
							size="sm"
							modifier="circle"
							icon="Download01Icon"
							ariaLabel="Download {invoice.id}"
						/>
					</td>
				{/snippet}
			</DataTable>
		</div>
	</Field>

	<Field label="Sortable headers" hint="sort — one column carries the current direction">
		<div class="w-full rounded-box border border-base-300">
			<DataTable
				columns={sortable}
				rows={rows.slice(0, 2)}
				key={(invoice) => invoice.id}
				sort={{ field: 'createdAt', dir: 'desc', href: () => '#' }}
			>
				{#snippet row(invoice)}
					<td class="font-medium">{invoice.id}</td>
					<td class="text-muted whitespace-nowrap">{invoice.date}</td>
				{/snippet}
			</DataTable>
		</div>
	</Field>

	<Field label="Nothing to show" hint="empty snippet — replaces the table entirely">
		<div class="w-full rounded-box border border-base-300 p-4">
			<DataTable {columns} rows={none} key={(invoice) => invoice.id}>
				{#snippet row(invoice)}
					<td>{invoice.id}</td>
				{/snippet}

				{#snippet empty()}
					<EmptyState
						class="border-0"
						icon="Invoice01Icon"
						title="No invoices yet"
						description="They appear here after your first payment."
					/>
				{/snippet}
			</DataTable>
		</div>
	</Field>
</div>
