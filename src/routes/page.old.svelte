<script lang="ts">
	import { readCourseSheet, type CourseEntry } from '$lib/core/xlsx.js';
	import { parseToEvent } from '$lib/core/eventparser.js';
	import { VCalendar, VEvent } from '$lib/core/ical.js';

	let courses: CourseEntry[] = $state([]);
	let fileInput: HTMLInputElement;
	let error: string | undefined = $state();

	async function onFile() {
		if (!fileInput.files?.length) return;
		const file = fileInput.files[0];
		const result = await readCourseSheet(file);

		if (result.ok) { error = undefined; courses = result.value; outputStale = true; console.log(courses) }
		else { error = result.value; courses = []; outputStale = true; }
	}

	let outputStale: boolean = $state(false);
	let outputLoading: boolean = $state(false);
	let outputFile: Blob | undefined = $state();

	async function generateOutput() {
		const events: VEvent[] = [];
		for (const course of courses) {
			const evResult = parseToEvent(
				course.section,
				course.instructor,
				course.meetPatterns,
				course.startDate,
				course.endDate,
			);

			if (!evResult.ok) error += '\n' + evResult.value;
			else events.push(evResult.value);
		}

		const calendar = new VCalendar('-//Koerismo//Workdout', '2.0', events);
		const text = calendar.write().join('\r\n');
		outputFile = new Blob([text], { type: 'text/calendar' });
	}

	async function prepFile() {
		if (!outputStale || outputLoading || !courses) return;

		outputLoading = true;
		await generateOutput();

		setTimeout(() => {
			outputStale = false;
			outputLoading = false;
		}, 150);

	}

	async function getFileUrl(): Promise<string | undefined> {
		if (outputLoading) return;
		if (outputStale) await prepFile();
		if (!outputFile) return;

		return URL.createObjectURL(outputFile);
	}

	async function downloadFile() {
		const url = await getFileUrl();
		if (!url) return;

		const a = document.createElement('a');
		a.href = url;
		a.download = 'Courses.ics';
		a.target = '_blank';
		a.click();
		a.remove();
	}
</script>

<div>
	<input type="file" bind:this={fileInput} oninput={onFile} />
	<h6>{ error }</h6>
	<ul>
		{#each courses as session}
			<li>{ session.section }</li>
		{/each}
	</ul>
	<div>
		<button disabled={outputLoading} onmouseover={prepFile} onclick={downloadFile}>Download</button>
	</div>
</div>