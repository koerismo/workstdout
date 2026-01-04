<script lang="ts">
	import { toaster } from '../js/toaster.js';
	import { Toast } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';

	const props: { children?: Snippet } = $props();
</script>

{@render props.children?.()}

<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast toast={toast}>
			<Toast.Message>
			<Toast.Title>{toast.title}</Toast.Title>
			<Toast.Description>{toast.description}</Toast.Description>
			</Toast.Message>
			<Toast.CloseTrigger />
		</Toast>
	{/snippet}
</Toast.Group>
