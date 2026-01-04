<script lang="ts">
	import '$lib/css/index.css';
	import favicon from '$lib/assets/favicon.jpg';
	import Toaster from '$lib/components/Toaster.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>WorkStdout</title>
</svelte:head>
{@render children()}

<Toaster></Toaster>
