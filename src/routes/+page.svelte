<script lang="ts">
	import { CourseConverter } from '$lib/index.svelte.js';
	import type { Attachment } from 'svelte/attachments';

	import { GithubIcon, LoaderCircleIcon } from '@lucide/svelte';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';

	const converter = new CourseConverter();
	let busy = $state(false);
	let input: HTMLInputElement;

	async function onFile() {
		if (!input.files?.length) return;
		await converter.parseFile(input.files[0]);
	}

	function download() {
		if (busy) return;
		const ok = converter.generateOutput();
		
		busy = true;
		setTimeout(() => {
			busy = false;
			if (ok) converter.downloadOutput();
		}, 400);
	}

	function clearFile() {
		converter.setCourses([]);
		input.value = '';
		converter.errors = [];
	}
</script>

<AppBar>
	<AppBar.Toolbar class="grid-cols-[1fr_auto] w-full lg:w-4xl mx-auto">
		<AppBar.Headline>
			<span>Workstdout</span>
		</AppBar.Headline>
		<AppBar.Trail class="flex flex-row place-items-center">
			<button type="button" class="btn-icon hover:preset-tonal">
				<GithubIcon class="size-6" />
			</button>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>

<main class="flex flex-col w-auto mx-2 lg:w-4xl lg:mx-auto gap-3 my-8">
	<div class="flex gap-3">
		<input class="input" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" multiple={false} bind:this={input} oninput={onFile} />
		<button class="btn preset-filled-surface-900-100" onclick={clearFile}>Clear</button>
	</div>

	{#if converter.errors.length}
	<div class="flex flex-col gap-2">
		{#each converter.errors as err}
		<p class="block bg-error-100-900 text-error-900-100 shadow-sm rounded-sm py-1 px-2" >{ err }</p>
		{/each}
	</div>
	{/if}

	<div class="border border-surface-200-800 flex flex-col rounded-sm p-1.5">
		{#if converter.courses.length}
			{#each converter.courses as course}
				<div class="p-1.5 flex flex-row gap-3 place-items-center rounded-sm" class:kd-active={course.enabled}>
					<input type="checkbox" class="checkbox" bind:checked={course.enabled} />
					<span class:opacity-30={!course.enabled}>{course.entry.section}</span>
				</div>
			{/each}
		{:else}
			<i class="text-sm text-neutral-500 py-4 mx-auto">Upload a file to get started.</i>
		{/if}
	</div>
	
	<button onclick={download} class="btn preset-filled-primary-500" disabled={busy || !converter.readyToGenerate}>
		{#if busy}
			<LoaderCircleIcon class="size-4 kd-spin" strokeWidth="2.5" />
		{/if}
		Download
	</button>
</main>

<style lang="scss">
	@reference '$lib/css/index.css';

	.kd-active {
		@apply hover:bg-surface-100-900;
	}

	:global(.kd-spin) {
		animation: spin 0.4s linear infinite;;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>

