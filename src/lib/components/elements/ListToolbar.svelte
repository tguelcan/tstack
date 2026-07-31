<script lang="ts">
	import { page } from '$app/state';
	import Button from '$components/elements/Button.svelte';
	import Icon from '$components/elements/Icon.svelte';

	type Filter = {
		/** Query parameter name. */
		name: string;
		/** Names the group for screen readers; not shown. */
		label: string;
		/** Currently selected value. */
		value: string;
		/** Allowed values mapped to their captions. The first one acts as the reset. */
		options: Record<string, string>;
	};

	type Props = {
		/** Current search term from the parsed list parameters. */
		q: string;
		placeholder?: string;
		filters?: Filter[];
	};

	let { q, placeholder = 'Search…', filters = [] }: Props = $props();

	// A GET form replaces the whole query string, so every parameter this form
	// does not own (sorting, mainly) must ride along as a hidden field. Deriving
	// them from the URL saves callers from wiring a `keep` prop by hand — and
	// `limit` is excluded on purpose: changing the filter resets pagination.
	const owned = $derived(new Set(['q', 'limit', ...filters.map((filter) => filter.name)]));
	const keep = $derived([...page.url.searchParams].filter(([name]) => !owned.has(name)));
</script>

<!--
	A real GET form: a plain page request without JavaScript, intercepted by
	SvelteKit for a client-side navigation with it. `reset="false"` keeps the
	focus in the search field and the scroll position where it was.

	Search sits left, filters right. The visible captions are gone on purpose —
	a magnifier and a set of labelled buttons say what they are, and the row
	stays one line high. Screen readers still get the names via `aria-label`.
-->
<form
	method="GET"
	class="flex flex-wrap items-center gap-2"
	data-sveltekit-reset="false"
	role="search"
>
	{#each keep as [name, value], index (index)}
		<input type="hidden" {name} {value} />
	{/each}

	<label class="input w-full input-sm sm:max-w-64">
		<Icon name="Search01Icon" size={15} />
		<input type="search" name="q" value={q} {placeholder} aria-label="Search" class="grow" />
	</label>

	<div class="ml-auto flex flex-wrap items-center gap-2">
		{#each filters as filter (filter.name)}
			<!-- daisyUI `filter`: radios styled as buttons. The first option carries
			     `filter-reset`, which brings the hidden options back once one is
			     picked — the `<form>`-based reset button is not available to us
			     because we are already inside a form. -->
			<div class="filter" role="group" aria-label={filter.label}>
				{#each Object.entries(filter.options) as [value, label], index (value)}
					<input
						class={['btn btn-sm', index === 0 && 'filter-reset']}
						type="radio"
						name={filter.name}
						{value}
						aria-label={label}
						checked={filter.value === value}
						onchange={(event) => event.currentTarget.form?.requestSubmit()}
					/>
				{/each}
			</div>
		{/each}

		<!-- With JavaScript the radios apply themselves (`requestSubmit()` above) and
		     Enter submits the search field, so no button is needed. Without it, this
		     button is what applies both — `noscript` shows it exactly then. -->
		<noscript>
			<Button color="neutral" size="sm" type="submit">Filter</Button>
		</noscript>

		{#if page.url.search}
			<Button
				color="ghost"
				size="sm"
				modifier="circle"
				icon="FilterRemoveIcon"
				ariaLabel="Reset filters"
				tooltip="Reset filters"
				href={page.url.pathname}
			/>
		{/if}
	</div>
</form>
