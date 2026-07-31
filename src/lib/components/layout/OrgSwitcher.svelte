<script lang="ts">
	import Avatar from '$components/elements/Avatar.svelte';
	import { closeDropdown, keepFocus } from '$components/elements/dropdown';
	import Icon from '$components/elements/Icon.svelte';
	import { switchOrganization } from '$remotes/organization.remote';
	import { sidebar } from './sidebar-state.svelte';
	import type { WorkspaceOrganization } from './workspace';

	type Props = {
		current: WorkspaceOrganization;
		/** Everything this user belongs to, `current` included. */
		organizations: WorkspaceOrganization[];
		/** Called after choosing an entry, so the mobile drawer can close itself. */
		onnavigate?: () => void;
	};

	let { current, organizations, onnavigate }: Props = $props();

	// The menu cannot escape the sidebar (`.drawer-side` clips its overflow), so
	// in the icon-only state receiving focus — a click or a Tab, both of which
	// open the menu — first widens the sidebar back to where the menu fits.
	// Below `lg` the collapse does not exist; leave the stored desktop
	// preference alone there.
	function expandIfCollapsed() {
		if (sidebar.collapsed && window.matchMedia('(width >= 64rem)').matches) sidebar.toggle();
	}

	function choose() {
		closeDropdown();
		onnavigate?.();
	}
</script>

<!-- daisyUI opens this on `:focus-within` — no outside-click handler and no
     state of our own. `keepFocus`/`closeDropdown` handle the browsers that do
     not focus clicked menu items; see `elements/dropdown.ts`. -->
<div class="dropdown w-full">
	<div
		tabindex="0"
		role="button"
		class="sidebar-item btn h-11 w-full justify-start gap-2.5 btn-ghost px-2"
		onfocus={expandIfCollapsed}
	>
		<Avatar name={current.name} src={current.logo} size={26} />
		<span class="sidebar-label min-w-0 flex-1 truncate text-left text-sm font-medium">
			{current.name}
		</span>
		<span class="sidebar-label text-base-content/40">
			<Icon name="ArrowDown01Icon" size={14} />
		</span>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<ul
		tabindex="0"
		class="menu dropdown-content z-10 mt-1 w-full rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
		onmousedown={keepFocus}
	>
		<li class="menu-title px-3 py-2">Organizations</li>

		{#each organizations as organization (organization.id)}
			{@const active = organization.id === current.id}
			{@const submit = switchOrganization.for(organization.id)}
			<li>
				<!-- One form per row rather than a link: switching writes to the session,
				     and a GET that changes state would be re-run by every prefetch. -->
				<form {...submit}>
					<input {...submit.fields.organizationId.as('hidden', organization.id)} />
					<button
						type="submit"
						class="flex w-full items-center gap-3 text-left"
						aria-current={active ? 'true' : undefined}
						onclick={choose}
					>
						<Avatar name={organization.name} src={organization.logo} size={20} />
						<span class="flex-1 truncate">{organization.name}</span>
						{#if active}
							<Icon name="Tick02Icon" size={16} />
						{/if}
					</button>
				</form>
			</li>
		{/each}

		<li class="mt-1 border-t border-base-300 pt-1">
			<a href="/onboarding" class="gap-3" onclick={choose}>
				<Icon name="PlusSignIcon" size={16} />
				New organization
			</a>
		</li>
	</ul>
</div>
