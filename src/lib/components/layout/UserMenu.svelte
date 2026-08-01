<script lang="ts">
	import Avatar from '$components/elements/Avatar.svelte';
	import { closeDropdown, keepFocus } from '$components/elements/dropdown';
	import Icon from '$components/elements/Icon.svelte';
	import { signOut } from '$remotes/auth.remote';

	type Props = {
		name: string;
		email: string;
		avatar?: string | null;
	};

	let { name, email, avatar = null }: Props = $props();

	const links = [
		{ href: '/profile', label: 'Profile', icon: 'User02Icon' },
		{ href: '/settings', label: 'Settings', icon: 'Settings01Icon' }
	];
</script>

<!-- daisyUI opens this on `:focus-within` — no outside-click handler and no
     state of our own. `keepFocus`/`closeDropdown` handle the browsers that do
     not focus clicked menu items; see `elements/dropdown.ts`. -->
<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn rounded-full btn-ghost">
		<Avatar {name} src={avatar} size={24} />
		<span class="hidden max-w-32 truncate text-sm font-medium sm:inline">{name}</span>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<ul
		tabindex="0"
		class="menu dropdown-content z-1 mt-2 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
		onmousedown={keepFocus}
	>
		<li class="menu-title px-3 py-2">
			<p class="truncate text-sm font-medium text-base-content">{name}</p>
			<p class="text-muted truncate text-xs font-normal">{email}</p>
		</li>

		{#each links as link (link.href)}
			<li>
				<a href={link.href} class="gap-3" onclick={closeDropdown}>
					<Icon name={link.icon} size={16} />
					{link.label}
				</a>
			</li>
		{/each}

		<li class="mt-1 border-t border-base-300 pt-1">
			<!-- A form, not a link: signing out clears a cookie, and a GET that does
			     that would fire on every link prefetch. -->
			<form {...signOut}>
				<button
					type="submit"
					class="flex w-full items-center gap-3 text-left text-error"
					onclick={closeDropdown}
				>
					<Icon name="Logout01Icon" size={16} />
					Sign out
				</button>
			</form>
		</li>
	</ul>
</div>
