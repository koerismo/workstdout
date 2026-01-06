<script lang="ts">
	import '$lib/css/index.css';
	import favicon from '$lib/assets/favicon.jpg';
	import Toaster from '$lib/components/Toaster.svelte';
	import Nav from '$lib/components/Nav.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>WorkStdout</title>
</svelte:head>

<Nav></Nav>

{@render children()}

<Toaster></Toaster>
