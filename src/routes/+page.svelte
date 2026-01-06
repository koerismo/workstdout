<script lang="ts">
	import { LoaderCircleIcon } from '@lucide/svelte';
	import WarnTooltip from '$lib/components/WarnTooltip.svelte';

	import { CourseConverter } from '$lib/js/index.svelte.js';
	import type { CourseEntry } from '$lib/js/core/xlsx.js';
	import { toaster } from '$lib/js/toaster.js';
	import { resolve } from '$app/paths';

	const converter = new CourseConverter();
	let busy = $state(false);
	let input: HTMLInputElement;

	const courseCount = $derived.by(() => {
		let count = 0;
		for (const course of converter.courses)
			count += +course.enabled;
		return count;
	});

	const sortedCourses = $derived.by(() => {
		const mapped: Record<string, { start: Date, courses: { entry: CourseEntry, enabled: boolean }[]}> = {};
		const fmtd = (d: Date) => d.toLocaleDateString('en-us', { year: '2-digit', month: '2-digit', day: '2-digit' });

		for (const course of converter.courses) {
			let title: string;
			if (course.entry.startDate && course.entry.endDate) {
				title = fmtd(course.entry.startDate) + ' to ' + fmtd(course.entry.endDate);
			} else {
				title = 'Unknown';
			}
			mapped[title] ??= { start: course.entry.startDate, courses: [] };
			mapped[title].courses.push(course);
		}

		return Object.entries(mapped)
			.sort(([_a, a], [_b, b]) => a.start.getTime() - b.start.getTime())
			.map(([k, v]) => ({ title: k, courses: v.courses }));
	});

	function entryWarning(entry: CourseEntry) {
		return (entry.endDate == null || entry.startDate == null || !entry.meetPatterns);
	}

	async function onFile() {
		if (!input.files?.length) return;
		await converter.parseFile(input.files[0]);
	}

	function download() {
		if (busy) return;
		busy = true;

		let ok = false;
		try {
			ok = converter.generateOutput();
		}
		catch (e) {
			toaster.error({ description: String(e) });
			console.error(e);
		}

		setTimeout(() => {
			busy = false;
			if (ok) converter.downloadOutput();
		}, 350);
	}

	function clearFile() {
		converter.setCourses([]);
		input.value = '';
		converter.errors = [];
		toaster.dismiss();
	}
</script>

<main class="flex flex-col w-page gap-3 my-8">
	<h2 class="h2 mb-2">Workday Calendar Generator</h2>

	<div class="flex gap-3">
		<input class="input cursor-pointer" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" multiple={false} bind:this={input} oninput={onFile} />
		<button class="btn preset-outlined-surface-900-100" onclick={clearFile} disabled={!(converter.courses.length || converter.errors.length)}>Clear</button>
	</div>

	<div class="border border-surface-200-800 flex flex-col rounded-sm p-1.5">
		{#if converter.courses.length}
			{#each sortedCourses as { title, courses }}
				<p class="text-xs font-bold px-1.5 pt-2 text-surface-300-700">{ title }</p>
				{#each courses as course}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="p-1.5 py-1 flex flex-row gap-3 place-items-center rounded-sm cursor-pointer"
						class:kd-active={course.enabled}
						onclick={() => course.enabled = !course.enabled}
						>
							<input type="checkbox" class="checkbox" bind:checked={course.enabled} />
							<span class="select-none grow" class:opacity-30={!course.enabled}>{course.entry.section}</span>
							{#if entryWarning(course.entry)}
							<span>
								<WarnTooltip />
							</span>
							{/if}
					</div>
				{/each}
			{/each}
		{:else}
			<div class="py-20 mx-auto text-sm">
				<i class="text-neutral-500">Upload a file to get started.</i> 
				<a class="text-primary-500 underline" href={resolve('/help/')}>How?</a>
			</div>
		{/if}
	</div>
	
	<div class="grid grid-cols-[auto_1fr] gap-3">
		<span class="place-self-center">{ courseCount } section{ courseCount !== 1 ? 's' : '' } included</span>
		<button onclick={download} class="btn preset-filled-primary-500 dark:text-surface-950" disabled={busy || !converter.readyToGenerate || !courseCount}>
			{#if busy}
				<LoaderCircleIcon class="size-4 kd-spin" strokeWidth="2.5" />
			{/if}
			Download
		</button>
	</div>

</main>

<div class="mt-auto mb-6">
	<p class="text-xs text-surface-200-800 text-center">made with malaise by @koerismo</p>
</div>

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

