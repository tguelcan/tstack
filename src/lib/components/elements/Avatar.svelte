<script lang="ts">
	interface AvatarProps {
		name: string;
		src?: string | null;
		alt?: string;
		size?: number;
		class?: string;
	}

	const { name, src = null, alt = '', size = 48, class: className }: AvatarProps = $props();

	// Which `src` failed to load, rather than a boolean plus an effect to reset
	// it: a new `src` is simply not the one that failed, so switching pictures
	// shows the new one without anything having to clear a flag.
	let failed = $state<string | null>(null);

	const showImage: boolean = $derived(!!src && failed !== src);

	// Simple hash from string to deterministic number
	const hash = (str: string): number =>
		[...str].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);

	// daisyUI v5 theme colors (complete oklch values)
	const themeColors: string[] = [
		'var(--color-primary)',
		'var(--color-secondary)',
		'var(--color-accent)'
	];

	// Derive unique gradient positions + color order from name
	const gradient = (txt: string): string => {
		const seed = Math.abs(hash(txt));

		// Shuffle color assignment based on hash
		const offset = seed % 3;
		const c = (i: number): string => themeColors[(i + offset) % 3];

		// Vary positions (20–80%) based on hash bits
		const pos = (i: number): string => {
			const x = ((seed >> (i * 4)) % 60) + 20;
			const y = ((seed >> (i * 4 + 2)) % 60) + 20;
			return `${x}% ${y}%`;
		};

		return [
			`radial-gradient(circle at ${pos(0)}, color-mix(in oklch, ${c(0)}, transparent 0%) 0%, color-mix(in oklch, ${c(0)}, transparent 100%) 60%)`,
			`radial-gradient(circle at ${pos(1)}, color-mix(in oklch, ${c(1)}, transparent 0%) 0%, color-mix(in oklch, ${c(1)}, transparent 100%) 55%)`,
			`radial-gradient(circle at ${pos(2)}, color-mix(in oklch, ${c(2)}, transparent 0%) 0%, color-mix(in oklch, ${c(2)}, transparent 100%) 50%)`
		].join(', ');
	};

	const bg: string = $derived(gradient(name));
</script>

<!-- Example: <Avatar name={user.name} src={user.avatar} size={48} />  -->
<div class="avatar">
	<div
		class="relative aspect-square overflow-hidden rounded-full {className}"
		style:width="{size}px"
		title={name}
	>
		{#if showImage}
			<img
				class="h-full w-full object-cover"
				{src}
				alt={alt || name}
				onerror={() => (failed = src)}
			/>
		{:else}
			<div class="absolute inset-0 rounded-full" style:background={bg}></div>
			<div
				class="absolute inset-0 rounded-full"
				style="background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.35) 0%, transparent 50%);"
			></div>
		{/if}
	</div>
</div>
