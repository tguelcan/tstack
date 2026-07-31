<script lang="ts">
	import { page } from '$app/state';
	import Alert from '$components/elements/Alert.svelte';
	import Avatar from '$components/elements/Avatar.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import DataTable from '$components/elements/DataTable.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import Field from '$components/elements/Field.svelte';
	import ListToolbar from '$components/elements/ListToolbar.svelte';
	import Modal from '$components/elements/Modal.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';
	import { rootIssues } from '$helper/form';
	import { formatDateTime } from '$helper/format';
	import {
		cancelInvitation,
		getMembers,
		getWorkspace,
		inviteMember,
		leaveOrganization,
		removeMember,
		updateMemberRole
	} from '$remotes/organization.remote';

	const workspace = $derived(await getWorkspace());
	const { members, invitations } = $derived(await getMembers());

	// Only owners and admins may hand out roles or show people the door. The
	// server enforces this again through `requirePermission`; hiding the controls
	// is so that nobody is offered a button that will only tell them no.
	const canManage = $derived(workspace.role === 'owner' || workspace.role === 'admin');

	const roleLabels = { all: 'All', owner: 'Owner', admin: 'Admin', member: 'Member' };
	const assignableRoles = ['admin', 'member'];

	// Same contract as the task list: the filter state lives in the URL, so a view
	// is shareable and survives a reload. Only the source differs — a member list
	// is a page-sized thing, so it is filtered here rather than in the database.
	const q = $derived(page.url.searchParams.get('q')?.trim().toLowerCase() ?? '');
	const role = $derived(page.url.searchParams.get('role') ?? 'all');

	const visible = $derived(
		members.filter((member) => {
			if (role !== 'all' && member.role !== role) return false;
			return !q || `${member.user.name} ${member.user.email}`.toLowerCase().includes(q);
		})
	);

	const columns = [
		{ label: 'Member' },
		{ label: 'Role' },
		{ label: 'Joined' },
		{ label: 'Actions', srOnly: true, class: 'w-0' }
	];

	const manageId = (id: string) => `manage-${id}`;
</script>

<svelte:head><title>Members · tstack</title></svelte:head>

<PageHeader title="Members" description="Who has access to {workspace.organization.name}.">
	{#snippet actions()}
		{#if canManage}
			<Button
				type="button"
				command="show-modal"
				commandfor="invite-modal"
				color="primary"
				icon="UserAdd01Icon"
				block="responsive"
			>
				Invite
			</Button>
		{/if}
	{/snippet}
</PageHeader>

<div class="grid gap-4">
	<Card flush>
		<div class="border-b border-base-300 px-4 py-3 sm:px-5">
			<ListToolbar
				{q}
				placeholder="Search name or email…"
				filters={[{ name: 'role', label: 'Role', value: role, options: roleLabels }]}
			/>
		</div>

		<DataTable {columns} rows={visible} key={(member) => member.id}>
			{#snippet row(member)}
				<td>
					<div class="flex items-center gap-3">
						<Avatar name={member.user.name} src={member.user.image} size={36} />
						<div class="min-w-0">
							<p class="truncate font-medium">
								{member.user.name}
								{#if member.user.id === workspace.user.id}
									<span class="text-muted font-normal">(you)</span>
								{/if}
							</p>
							<p class="text-muted truncate text-sm">{member.user.email}</p>
						</div>
					</div>
				</td>
				<td>
					<Badge
						size="sm"
						variant="soft"
						color={member.role === 'owner' ? 'primary' : 'neutral'}
						class="capitalize"
					>
						{member.role}
					</Badge>
				</td>
				<td class="text-muted whitespace-nowrap">
					{formatDateTime(member.createdAt, workspace.user.timezone)}
				</td>
				<td>
					<Button
						type="button"
						command="show-modal"
						commandfor={manageId(member.id)}
						color="ghost"
						size="sm"
						modifier="circle"
						icon="MoreVerticalIcon"
						ariaLabel="Details for {member.user.name}"
					/>
				</td>
			{/snippet}

			{#snippet empty()}
				<div class="p-4 sm:p-6">
					<EmptyState
						class="border-0"
						icon="FilterRemoveIcon"
						title="Nobody matches these filters"
						description="Try a different search term, or clear the filters to see everyone."
					>
						{#snippet action()}
							<Button href="/members" color="neutral" variant="outline" icon="FilterRemoveIcon">
								Reset filters
							</Button>
						{/snippet}
					</EmptyState>
				</div>
			{/snippet}
		</DataTable>
	</Card>

	{#if invitations.length > 0}
		<Card
			title="Pending invitations"
			description="Sent, but not answered yet."
			icon="Mail01Icon"
			flush
		>
			<ul class="divide-y divide-base-300">
				{#each invitations as invitation (invitation.id)}
					{@const withdraw = cancelInvitation.for(invitation.id)}
					<li class="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
						<div class="min-w-0 flex-1">
							<p class="flex items-center gap-2 font-medium">
								<span class="truncate">{invitation.email}</span>
								{#if invitation.role}
									<Badge size="sm" variant="soft" class="capitalize">{invitation.role}</Badge>
								{/if}
							</p>
							<p class="text-muted text-sm">
								Expires {formatDateTime(invitation.expiresAt, workspace.user.timezone)}
							</p>
						</div>

						{#if canManage}
							<form {...withdraw}>
								<input {...withdraw.fields.invitationId.as('hidden', invitation.id)} />
								<Button color="ghost" size="sm" loading={!!withdraw.pending}>Withdraw</Button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	<Card title="Leave this organization" icon="Logout01Icon">
		<p class="text-sm">
			You lose access to everything in {workspace.organization.name}. An owner can invite you back.
		</p>

		{#if workspace.role === 'owner'}
			<Alert color="info" class="mt-3">
				As an owner you can only leave once somebody else owns this organization — otherwise delete
				it in <a href="/settings" class="link">settings</a>.
			</Alert>
		{/if}

		{#each rootIssues(leaveOrganization.fields.allIssues()) as issue, index (index)}
			<Alert color="error" class="mt-3">{issue.message}</Alert>
		{/each}

		{#snippet footer()}
			<form {...leaveOrganization}>
				<Button
					color="neutral"
					variant="outline"
					icon="Logout01Icon"
					loading={!!leaveOrganization.pending}
				>
					Leave organization
				</Button>
			</form>
		{/snippet}
	</Card>
</div>

<!-- Opened by the button in the header through the Invoker Commands API — no
     JavaScript of ours involved. -->
{#if canManage}
	<Modal
		id="invite-modal"
		title="Invite to {workspace.organization.name}"
		description="They receive an email with a join link."
	>
		<!-- `enhance` so a successful submission closes the dialog again; issues
		     keep it open, right where the message is shown. -->
		<form
			{...inviteMember.enhance(async (invite) => {
				await invite.submit();

				if (!invite.fields.allIssues()) {
					invite.element.reset();
					invite.element.closest('dialog')?.close();
				}
			})}
			id="invite-form"
			class="grid gap-2"
		>
			<Field
				label="Email"
				input={inviteMember.fields.email.as('email')}
				issues={inviteMember.fields.email.issues()}
				placeholder="name@company.com"
			/>

			<Field
				label="Role"
				issues={inviteMember.fields.role.issues()}
				hint="Admins can invite and remove people. Members cannot."
			>
				<select {...inviteMember.fields.role.as('select', 'member')} class="select">
					{#each assignableRoles as option (option)}
						<option value={option} class="capitalize">{option}</option>
					{/each}
				</select>
			</Field>

			{#each rootIssues(inviteMember.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="mt-2">{issue.message}</Alert>
			{/each}
		</form>

		{#snippet actions()}
			<!-- The dialog lives in the top layer, which takes this button out of the
			     form's DOM subtree — `form` is what puts it back. -->
			<Button form="invite-form" color="primary" loading={!!inviteMember.pending}>
				Send invite
			</Button>
		{/snippet}
	</Modal>
{/if}

<!--
	One dialog per row rather than a single shared one driven by state: the
	trigger in the row opens it through the Invoker Commands API, so the whole
	interaction is markup the browser handles. The cost is a `<dialog>` per
	visible member, which for a page-sized list is a handful of elements.
-->
{#each visible as member (member.id)}
	{@const changeRole = updateMemberRole.for(member.id)}
	{@const remove = removeMember.for(member.id)}
	{@const isOwner = member.role === 'owner'}
	{@const isSelf = member.user.id === workspace.user.id}
	{@const editable = canManage && !isOwner && !isSelf}
	{@const current = member.role === 'admin' ? 'admin' : 'member'}

	<Modal id={manageId(member.id)} title={member.user.name} description={member.user.email}>
		{#if member.user.bio}
			<p class="mb-4 text-sm">{member.user.bio}</p>
		{/if}

		{#if editable}
			<form {...changeRole} id="role-{member.id}">
				<input {...changeRole.fields.memberId.as('hidden', member.id)} />

				<Field label="Role" hint="Admins can invite and remove people. Members cannot.">
					<select {...changeRole.fields.role.as('select', current)} class="select">
						{#each assignableRoles as option (option)}
							<option value={option} class="capitalize">{option}</option>
						{/each}
					</select>
				</Field>

				{#each rootIssues(changeRole.fields.allIssues()) as issue, index (index)}
					<Alert color="error" class="mt-2">{issue.message}</Alert>
				{/each}
			</form>
		{:else}
			<p class="text-sm">Role: <span class="font-medium capitalize">{member.role}</span></p>

			{#if isOwner}
				<Alert color="info" class="mt-3">
					The owner's role cannot be changed here — transfer ownership first.
				</Alert>
			{:else if isSelf}
				<Alert color="info" class="mt-3">
					To change your own membership, use "Leave this organization" on the page behind this
					dialog.
				</Alert>
			{/if}
		{/if}

		{#snippet actions()}
			{#if editable}
				<!-- `type="button"`: this only opens the confirmation dialog below,
				     the actual submit happens from inside it. -->
				<Button
					type="button"
					command="show-modal"
					commandfor="remove-{member.id}"
					color="error"
					variant="outline"
					icon="UserRemove01Icon"
				>
					Remove
				</Button>

				<Button form="role-{member.id}" color="primary" loading={!!changeRole.pending}>Save</Button>
			{/if}
		{/snippet}
	</Modal>

	{#if editable}
		<!-- Stacks on top of the details dialog. Removal is immediate and cannot be
		     undone from here, so it is not done on a single tap. -->
		<Modal
			id="remove-{member.id}"
			title="Remove {member.user.name}?"
			description="They immediately lose access to {workspace.organization
				.name}. An invitation can bring them back."
			cancelLabel="Keep member"
		>
			{#each rootIssues(remove.fields.allIssues()) as issue, index (index)}
				<Alert color="error">{issue.message}</Alert>
			{/each}

			{#snippet actions()}
				<form {...remove}>
					<input {...remove.fields.memberId.as('hidden', member.id)} />
					<Button color="error" icon="UserRemove01Icon" loading={!!remove.pending}>Remove</Button>
				</form>
			{/snippet}
		</Modal>
	{/if}
{/each}
