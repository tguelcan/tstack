<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import DataTable from '$components/elements/DataTable.svelte';
	import Icon from '$components/elements/Icon.svelte';
	import StatCard from '$components/elements/StatCard.svelte';
	import { invoices, plans } from '$helper/demo';
</script>

<PageTitle text="Billing" />

<!-- No `PageHeader` of its own: the settings layout already renders one above
     the tabs, and a second heading would compete with it. -->
<div class="grid gap-4 sm:grid-cols-3">
	<StatCard label="Current plan" value="Team" icon="RocketIcon" hint="Renews 1 August 2026" />
	<StatCard label="Seats used" value="3 of 25" icon="UserGroupIcon" />
	<StatCard label="Next invoice" value="€29.00" icon="Invoice01Icon" hint="1 August 2026" />
</div>

<h2 class="mt-8 mb-4 font-semibold">Plans</h2>

<div class="grid gap-4 lg:grid-cols-3">
	{#each plans as plan (plan.name)}
		<Card class={plan.current ? 'border-primary ring-1 ring-primary' : undefined}>
			<div class="flex items-baseline justify-between gap-2">
				<h3 class="font-semibold">{plan.name}</h3>
				{#if plan.current}
					<Badge color="primary" variant="soft" size="sm">Current</Badge>
				{/if}
			</div>

			<p class="mt-3">
				<span class="text-2xl font-semibold">{plan.price}</span>
				<span class="text-muted text-sm">{plan.period}</span>
			</p>

			<p class="text-muted mt-2 text-sm">{plan.description}</p>

			<ul class="mt-5 space-y-2 text-sm">
				{#each plan.features as feature (feature)}
					<li class="flex items-start gap-2">
						<span class="mt-0.5 text-success"><Icon name="Tick02Icon" size={16} /></span>
						{feature}
					</li>
				{/each}
			</ul>

			<Button
				class="mt-6"
				block
				color={plan.current ? '' : 'primary'}
				variant={plan.current ? 'outline' : undefined}
				disabled={plan.current}
			>
				{plan.current ? 'Your plan' : `Switch to ${plan.name}`}
			</Button>
		</Card>
	{/each}
</div>

<Card title="Invoices" icon="Invoice01Icon" class="mt-8" flush>
	{#snippet actions()}
		<Button color="neutral" variant="outline" size="sm" icon="Download01Icon">Download all</Button>
	{/snippet}

	<DataTable
		columns={[
			{ label: 'Invoice' },
			{ label: 'Date' },
			{ label: 'Amount' },
			{ label: 'Status' },
			{ label: 'Download', srOnly: true, class: 'w-0' }
		]}
		rows={invoices}
		key={(invoice) => invoice.id}
	>
		{#snippet row(invoice)}
			<td class="font-medium">{invoice.id}</td>
			<td class="text-muted whitespace-nowrap">{invoice.date}</td>
			<td class="tabular-nums">{invoice.amount}</td>
			<td><Badge color="success" variant="soft" size="sm">{invoice.status}</Badge></td>
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
</Card>
