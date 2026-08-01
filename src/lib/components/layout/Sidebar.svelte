<script lang="ts">
	import { page } from '$app/state';
	import Button from '$components/elements/Button.svelte';
	import Icon from '$components/elements/Icon.svelte';
	import Logo from './Logo.svelte';
	import { appNavigation, isActive } from './navigation';
	import OrgSwitcher from './OrgSwitcher.svelte';
	import { sidebar } from './sidebar-state.svelte';
	import type { WorkspaceOrganization } from './workspace';

	type Props = {
		/** The organization everything on screen belongs to. */
		organization: WorkspaceOrganization;
		/** Everything this user could switch to, `organization` included. */
		organizations: WorkspaceOrganization[];
		/** Called after a link is followed, so the mobile drawer can close itself. */
		onnavigate?: () => void;
	};

	let { organization, organizations, onnavigate }: Props = $props();
</script>

<!-- `sidebar-panel`, `sidebar-label` and `sidebar-item` are the hooks the collapse
     rules in `main.css` target; see the comment there for why this is CSS and not
     a Svelte class. -->
<aside
	class="sidebar-panel flex h-full w-72 flex-col bg-base-100 transition-[width] duration-200 lg:w-64"
>
	<div class="flex h-16 shrink-0 items-center px-4">
		<Logo labelClass="sidebar-label" />
	</div>

	<div class="shrink-0 px-3 pb-3">
		<OrgSwitcher current={organization} {organizations} {onnavigate} />
	</div>

	<nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
		{#each appNavigation as section (section.label)}
			<div>
				<!-- `sidebar-label` is what hides this when the sidebar collapses;
				     without it the heading stays and gets clipped at 72px. -->
				<p class="sidebar-label menu-title">
					{section.label}
				</p>

				<ul class="menu w-full gap-0.5 p-0">
					{#each section.items as item (item.href)}
						{@const active = isActive(page.url.pathname, item.href)}
						<li>
							<!-- A filled brand pill rather than daisyUI's `menu-active`: that one
							     paints the item in `neutral`, which is a near-white block in the
							     dark theme. `primary` with its own content colour is legible on
							     either surface and looks identical in both. -->
							<a
								href={item.href}
								class={['sidebar-item gap-3', active && 'bg-primary text-primary-content']}
								aria-current={active ? 'page' : undefined}
								title={item.label}
								onclick={onnavigate}
							>
								<Icon name={item.icon} size={18} strokeWidth={active ? 2 : 1.5} />
								<span class="sidebar-label flex-1 truncate">{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<!-- Collapsing only exists on the desktop layout; below `lg` the sidebar is an
	     off-canvas drawer that is either open or gone. -->
	<div class="hidden shrink-0 p-3 lg:block">
		<Button
			type="button"
			color="ghost"
			size="sm"
			class="sidebar-item w-full justify-start gap-3"
			onclick={() => sidebar.toggle()}
			ariaExpanded={!sidebar.collapsed}
			title={sidebar.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			{#snippet iconLeft()}
				<span class={['inline-flex transition-transform', sidebar.collapsed && 'rotate-180']}>
					<Icon name="ArrowLeft01Icon" size={18} />
				</span>
			{/snippet}

			<span class="sidebar-label">Collapse</span>
		</Button>
	</div>
</aside>
