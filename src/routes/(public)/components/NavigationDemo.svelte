<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import Modal from '$components/elements/Modal.svelte';
	import Tabs from '$components/elements/Tabs.svelte';
	import Field from './Field.svelte';

	const tabs = [
		{ href: '/settings', label: 'General', icon: 'Settings01Icon' },
		{ href: '/profile/notifications', label: 'Notifications', icon: 'Notification01Icon' },
		{ href: '/profile/security', label: 'Security', icon: 'Shield01Icon' }
	];
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Tabs" hint="tabs / active — real links, one URL per tab">
		<!-- `active` is pinned here because this page is not `/settings`; left out,
		     the current pathname decides. -->
		<Tabs {tabs} active="/settings" class="w-full" />
	</Field>

	<Field label="Modal" hint="id + command / commandfor on the trigger">
		<Button type="button" command="show-modal" commandfor="demo-modal" color="neutral">
			Open dialog
		</Button>

		<Button type="button" command="show-modal" commandfor="demo-confirm" color="error">
			Delete something
		</Button>
	</Field>
</div>

<!-- Opened by the browser through the Invoker Commands API, so no JavaScript of
     ours is involved. Needs Chrome 135+, Safari 18.4+ or Firefox 141+. -->
<Modal
	id="demo-modal"
	title="Invite to workspace"
	description="They receive an email with a join link."
>
	<p class="text-sm">The body is free-form — text, a detail view or a whole form.</p>

	{#snippet actions()}
		<Button type="button" command="close" commandfor="demo-modal" color="primary">
			Send invite
		</Button>
	{/snippet}
</Modal>

<Modal
	id="demo-confirm"
	title="Delete workspace?"
	description="Every task, member and invoice goes with it. This cannot be undone."
	cancelLabel="Keep it"
>
	{#snippet actions()}
		<Button type="button" command="close" commandfor="demo-confirm" color="error">Delete</Button>
	{/snippet}
</Modal>
