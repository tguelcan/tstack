<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	type Props = {
		/** Unique id. Triggers reference it via `commandfor`. */
		id: string;
		title: string;
		/** Optional lead paragraph above the body. */
		description?: string;
		/** Body content — free-form: text, a detail view, or a whole form. */
		children?: Snippet;
		/** Confirming buttons, rendered next to the cancel button. */
		actions?: Snippet;
		cancelLabel?: string;
		/** Whether a click on the backdrop closes the dialog. */
		dismissible?: boolean;
		/** Extra classes for the modal box, e.g. `max-w-2xl` for detail views. */
		class?: string;
	};

	let {
		id,
		title,
		description,
		children,
		actions,
		cancelLabel = 'Cancel',
		dismissible = true,
		class: className
	}: Props = $props();
</script>

<!--
	Opened and closed purely through the Invoker Commands API — the browser does
	the work, so no JavaScript of ours is involved and the markup keeps working
	when the bundle fails to load:

	    <Button type="button" command="show-modal" commandfor="my-modal">Open</Button>
	    <Modal id="my-modal" title="…">…</Modal>

	A submit button inside `actions` must point at its form by id (`form="…"`),
	because an open dialog lives in the top layer and is therefore outside the
	form's DOM subtree.

	Requires a browser with Invoker Commands support (Chrome 135+, Safari 18.4+,
	Firefox 141+). Older browsers ignore the trigger, so do not put the only path
	to a destructive action behind it without a fallback.
-->
<dialog {id} class="modal" aria-labelledby="{id}-title">
	<div class="modal-box {className}">
		<div class="flex items-center space-x-1">
			<h3 id="{id}-title" class="flex-1 truncate text-lg font-semibold">{title}</h3>
			<Button
				type="button"
				command="close"
				commandfor={id}
				color="ghost"
				modifier="circle"
				ariaLabel="Close"
				icon="Cancel01Icon"
			/>
		</div>

		{#if description}
			<p class="text-muted mt-2">{description}</p>
		{/if}

		{#if children}
			<div class="py-4">{@render children()}</div>
		{/if}

		<div class="modal-action">
			<Button type="button" command="close" commandfor={id} color="ghost">{cancelLabel}</Button>
			{@render actions?.()}
		</div>
	</div>

	{#if dismissible}
		<!-- daisyUI's backdrop. `method="dialog"` closes without any script; it is a
		     sibling of the box, so it never nests inside a caller's form. -->
		<form method="dialog" class="modal-backdrop"><button>close</button></form>
	{/if}
</dialog>
