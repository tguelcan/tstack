<script lang="ts">
	import StatCard from '$components/elements/StatCard.svelte';
	import Field from './Field.svelte';
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Label and value" hint="label / value">
		<StatCard label="Active users" value="2,847" class="w-full max-w-56" />
	</Field>

	<Field label="Change against the previous period" hint="delta / hint">
		<StatCard
			label="Revenue"
			value="€18,420"
			delta={12}
			hint="vs. last month"
			class="w-full max-w-56"
		/>
		<StatCard
			label="Open tasks"
			value="37"
			delta={-8}
			hint="vs. last month"
			class="w-full max-w-56"
		/>
		<StatCard
			label="Uptime"
			value="99.98%"
			delta={0}
			hint="vs. last month"
			class="w-full max-w-56"
		/>
	</Field>

	<Field label="With an icon" hint="icon">
		<StatCard label="Seats used" value="3 of 25" icon="UserGroupIcon" class="w-full max-w-56" />
		<StatCard label="Next invoice" value="€29.00" icon="Invoice01Icon" class="w-full max-w-56" />
	</Field>
</div>
