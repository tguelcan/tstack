<script lang="ts">
	// Kept for the commented-out notifications button below: it marks the slot
	// where one belongs, and holding on to the import means uncommenting is the
	// only step needed.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import Button from '$components/elements/Button.svelte';
	import Icon from '$components/elements/Icon.svelte';
	import UserMenu from './UserMenu.svelte';

	type Props = {
		name: string;
		email: string;
		avatar?: string | null;
	};

	let { name, email, avatar = null }: Props = $props();
</script>

<header
	class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 bg-base-100/90 px-4 backdrop-blur-xs"
>
	<!-- The label toggles the drawer checkbox in `AppShell`; it needs no script,
	     which is why the mobile menu works before hydration. -->
	<label
		for="app-drawer"
		class="btn btn-circle btn-ghost btn-sm lg:hidden"
		aria-label="Open navigation"
	>
		<Icon name="Menu01Icon" size={20} />
	</label>

	<!-- A plain GET form, so pressing Enter navigates even without JavaScript. -->
	<form method="GET" action="/crud" class="hidden flex-1 md:block">
		<label class="input max-w-sm rounded-full input-sm">
			<Icon name="Search01Icon" size={16} />
			<input type="search" name="q" placeholder="Search tasks…" aria-label="Search tasks" />
		</label>
	</form>

	<div class="flex flex-1 items-center justify-end gap-1 md:flex-none">
		<!-- Where a notifications button goes once there is something to notify
		     about. Left in place rather than deleted so the slot stays visible;
		     the import above carries the matching eslint exception.
		<Button
			href="/dashboard"
			color="ghost"
			modifier="circle"
			icon="Notification01Icon"
			ariaLabel="Notifications"
		/>
		-->

		<UserMenu {name} {email} {avatar} />
	</div>
</header>
