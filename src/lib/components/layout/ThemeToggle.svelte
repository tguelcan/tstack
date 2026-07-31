<script lang="ts">
	import Icon from '$components/elements/Icon.svelte';
	import { theme } from './theme-state.svelte';
</script>

<button
	type="button"
	class="btn btn-circle btn-ghost btn-sm"
	onclick={() => theme.toggle()}
	aria-label={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
>
	<Icon name={theme.current === 'dark' ? 'Sun01Icon' : 'Moon02Icon'} size={18} />
</button>
